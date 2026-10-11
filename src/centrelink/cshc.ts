import { z } from 'zod';
import { defineCalculator, type RuleMeta } from '../core/calculator.js';
import { cents, dec, money } from '../core/decimal.js';
import { amount, isoDate } from '../core/inputs.js';
import { deemedIncome } from './deeming.js';
import { fmt } from '../tax/scale.js';

export const RULE_CSHC: RuleMeta = {
  id: 'au.centrelink.cshc_income_test',
  version: '1.0.0',
  legalReference: 'Social Security Act 1991 Part 2A.1 (Commonwealth seniors health card income test)',
};

const Input = z.object({
  assessment_date: isoDate('Assessment date'),
  relationship: z.enum(['single', 'couple', 'separated']).describe('single; couple; couple separated by illness, respite care or prison'),
  adjusted_taxable_income: amount('Adjusted taxable income for the year (AUD); combined for couples'),
  account_based_income_streams: z
    .array(amount('Account-based income stream balance subject to deeming (AUD)'))
    .max(2)
    .default([])
    .describe('Deemed account-based income stream balances: one entry for a single person, one per partner for a couple'),
  dependent_children: z.number().int().min(0).max(20).default(0),
});

export const cshcCalculator = defineCalculator({
  id: 'centrelink.cshc',
  title: 'Commonwealth Seniors Health Card income test',
  domain: 'centrelink',
  summary: 'Compares adjusted taxable income plus deemed income on account-based income streams with the CSHC income limit (no assets test).',
  input: Input,
  rules: [RULE_CSHC],
  limitations: [
    'Age, residence and not receiving a pension are asserted by the user.',
    'Supply only income streams that are deemed (grandfathered pre-2015 streams are excluded in law). Couples are deemed per partner against the non-pensioner couple threshold.',
    'Limits before 20 September 2026 are not in this release.',
  ],
  example: { assessment_date: '2026-10-11', relationship: 'single', adjusted_taxable_income: 90000, account_based_income_streams: [400000] },
  run(input, ctx) {
    const d = input.assessment_date;
    const limits = ctx.table('centrelink.cshc_income_limits', d);
    const key = input.relationship === 'single' ? 'single' : input.relationship === 'couple' ? 'couple_combined' : 'separated_combined';
    const limit = limits[key]!.plus(limits.per_child!.mul(input.dependent_children));
    const status = input.relationship === 'single' ? 'single' : 'non_pensioner_couple_member';
    let deemedTotal = dec(0);
    for (const balance of input.account_based_income_streams) {
      deemedTotal = deemedTotal.plus(deemedIncome(ctx, d, dec(balance), status).annual);
    }
    const deemed = { annual: deemedTotal };
    const total = dec(input.adjusted_taxable_income).plus(deemed.annual);
    const eligible = total.lte(limit);
    ctx.step({
      key: 'centrelink.cshc',
      label: 'CSHC income test',
      value: eligible ? 'within limit' : 'over limit',
      working: `adjusted taxable income ${fmt(dec(input.adjusted_taxable_income))} + deemed income ${fmt(cents(deemed.annual, 'half_up'))} = ${fmt(cents(total, 'half_up'))} vs limit ${fmt(limit)}`,
      ruleId: RULE_CSHC.id,
    });
    return {
      income_for_test: money(cents(total, 'half_up')),
      income_limit: money(limit),
      meets_income_test: eligible,
      deemed_income: money(cents(deemed.annual, 'half_up')),
    };
  },
});
