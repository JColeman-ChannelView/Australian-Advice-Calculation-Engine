import { z } from 'zod';
import { defineCalculator, type RuleMeta } from '../core/calculator.js';
import { dec, min, money, ZERO } from '../core/decimal.js';
import { fyStartYear } from '../core/dates.js';
import { amount, financialYear } from '../core/inputs.js';
import { incomeTaxOnTaxableIncome, RULE_RESIDENT_SCALE } from './income-tax.js';
import { lito, sapto, wato, RULE_LITO, RULE_SAPTO, RULE_WATO } from './offsets.js';
import { medicareLevy, RULE_MEDICARE } from './medicare.js';
import { helpRepayment, RULE_HELP } from './help.js';
import { fmt } from './scale.js';
import { block } from '../core/errors.js';

export const RULE_OFFSET_ORDER: RuleMeta = {
  id: 'au.tax.non_refundable_offsets_limit',
  version: '1.0.0',
  legalReference: 'Income Tax Assessment Act 1997 s4-10(3), s63-10 (non-refundable offsets reduce basic income tax liability, not below nil)',
};

const Input = z.object({
  financial_year: financialYear(),
  taxable_income: amount('Taxable income for the full year (AUD); full-year Australian resident'),
  sapto: z
    .object({
      category: z.enum(['single', 'couple', 'illness_separated']),
      rebate_income: amount('Rebate income (AUD)'),
    })
    .optional()
    .describe('Supply only if the person is eligible for SAPTO (eligibility asserted by the user)'),
  medicare_family: z
    .object({
      family_income: amount('Combined taxable income of the person and spouse (AUD)'),
      dependent_children: z.number().int().min(0).max(30).default(0),
    })
    .optional()
    .describe('Supply if the person had a spouse or dependent children'),
  help_repayment_income: z.number().int().min(0).optional().describe('Repayment income (whole dollars) if the person has a study loan debt'),
  net_labour_income: amount('Net labour income (AUD), required from 2027-28 for WATO').optional(),
});

export const personalTaxCalculator = defineCalculator({
  id: 'tax.personal_tax',
  title: 'Personal tax summary (resident)',
  domain: 'tax',
  summary:
    'Income tax, LITO, SAPTO and WATO (non-refundable, limited to tax), Medicare levy and compulsory study-loan repayment for a full-year resident.',
  input: Input,
  rules: [RULE_RESIDENT_SCALE, RULE_LITO, RULE_SAPTO, RULE_WATO, RULE_OFFSET_ORDER, RULE_MEDICARE, RULE_HELP],
  limitations: [
    'Full-year residents only. Foreign residents: use tax.income_tax (no offsets or Medicare levy are applied there).',
    'Offsets other than LITO, SAPTO and WATO (e.g. private health insurance rebate, franking credits, zone/dependant offsets) are not modelled.',
    'Medicare levy surcharge is not added (see tax.mls_tier); Medicare family reduction cases are blocked.',
    'CGT (including the 30% minimum tax from 1 July 2027) and negative-gearing quarantining are not modelled.',
    'Each component blocks independently: a year with an unpublished parameter (e.g. 2026-27 Medicare thresholds, 2027-28 LITO/SAPTO) blocks the whole summary.',
  ],
  example: { financial_year: '2025-26', taxable_income: 85000, help_repayment_income: 85000 },
  run(input, ctx) {
    const fy = input.financial_year;
    const ti = dec(input.taxable_income);
    const { tax: gross } = incomeTaxOnTaxableIncome(ctx, fy, ti, 'resident');

    const litoAmt = lito(ctx, fy, ti);
    const saptoAmt = input.sapto ? sapto(ctx, fy, dec(input.sapto.rebate_income), input.sapto.category) : ZERO;
    let watoAmt = ZERO;
    if (fyStartYear(fy) >= 2027) {
      if (input.net_labour_income === undefined) {
        ctx.warn('No net labour income supplied; WATO assumed nil.');
        ctx.assume({ key: 'net_labour_income', label: 'Net labour income for WATO', value: '0', source: 'default' });
      } else {
        watoAmt = wato(ctx, fy, dec(input.net_labour_income));
      }
    }
    const offsetsAvailable = litoAmt.plus(saptoAmt).plus(watoAmt);
    const offsetsUsed = min(gross, offsetsAvailable);
    const netTax = gross.minus(offsetsUsed);
    ctx.step({
      key: 'tax.offsets_used',
      label: 'Non-refundable offsets applied',
      value: money(offsetsUsed),
      working: `min(income tax ${fmt(gross)}, offsets ${fmt(offsetsAvailable)})`,
      ruleId: RULE_OFFSET_ORDER.id,
    });

    const family = input.medicare_family
      ? { family_income: dec(input.medicare_family.family_income), dependent_children: input.medicare_family.dependent_children }
      : null;
    if (input.sapto && input.sapto.category !== 'single' && !family) {
      block({
        code: 'RULE_NOT_IMPLEMENTED',
        message: 'A SAPTO couple category means the person has a spouse: supply medicare_family so the Medicare family-reduction range can be checked (the s8 family reduction itself is not implemented).',
        ruleId: RULE_MEDICARE.id,
      });
    }
    // SAPTO Medicare thresholds apply only to a person entitled to SAPTO (offset payable).
    const levy = medicareLevy(ctx, fy, ti, saptoAmt.gt(0), family);
    const help = input.help_repayment_income !== undefined ? helpRepayment(ctx, fy, dec(input.help_repayment_income)) : ZERO;
    const total = netTax.plus(levy).plus(help);
    ctx.step({ key: 'tax.total', label: 'Total tax, levy and study loan repayment', value: money(total), working: `${fmt(netTax)} + ${fmt(levy)} + ${fmt(help)}` });

    return {
      income_tax: money(gross),
      lito: money(litoAmt),
      sapto: money(saptoAmt),
      wato: money(watoAmt),
      offsets_used: money(offsetsUsed),
      unused_offsets: money(offsetsAvailable.minus(offsetsUsed)),
      net_income_tax: money(netTax),
      medicare_levy: money(levy),
      help_repayment: money(help),
      total_payable: money(total),
      take_home_after_tax: money(ti.minus(total)),
    };
  },
});
