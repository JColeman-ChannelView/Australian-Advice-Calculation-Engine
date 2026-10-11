import { z } from 'zod';
import { defineCalculator, type RuleMeta } from '../core/calculator.js';
import { cents, dec, max, min, money, ZERO, type Dec } from '../core/decimal.js';
import { ageOn, financialYearOf, fyStart } from '../core/dates.js';
import { amount, isoDate } from '../core/inputs.js';
import { block } from '../core/errors.js';
import { preservationAge } from './pension.js';
import { fmt } from '../tax/scale.js';

export const RULE_LUMP_SUM: RuleMeta = {
  id: 'au.super.lump_sum_tax',
  version: '1.0.0',
  legalReference: 'Income Tax Assessment Act 1997 Subdivs 301-B, 301-C, 302-B; ss307-345, 307-350',
};

const Input = z.object({
  payment_date: isoDate('Date the lump sum is paid'),
  date_of_birth: isoDate('Date of birth of the member (for death benefits: of the deceased is not used; the recipient type decides)'),
  tax_free_component: amount('Tax-free component (AUD)').default('0'),
  taxed_element: amount('Taxable component — taxed element (AUD)').default('0'),
  untaxed_element: amount('Taxable component — untaxed element (AUD)').default('0'),
  recipient: z.enum(['member', 'death_dependant', 'death_non_dependant']).default('member').describe('member benefit, or death benefit to a dependant / non-dependant'),
  low_rate_cap_used: amount('Low rate cap already used by earlier lump sums (AUD)').default('0'),
  untaxed_plan_cap_used: amount('Untaxed plan cap already used from this plan (AUD)').default('0'),
  terminal_medical_condition: z.boolean().default(false).describe('Member has a certified terminal medical condition'),
});

export const lumpSumTaxCalculator = defineCalculator({
  id: 'super.lump_sum_tax',
  title: 'Super lump sum tax (maximum rates)',
  domain: 'super',
  summary: 'Maximum tax on a superannuation lump sum by component, age relative to preservation age, and recipient, excluding the Medicare levy.',
  input: Input,
  rules: [RULE_LUMP_SUM],
  limitations: [
    'Computes maximum tax rates per the ATO table, excluding the Medicare levy (2% may apply in addition to assessable amounts).',
    'Between preservation age and 59, benefits with an untaxed element are blocked (low rate cap ordering across elements not verified).',
    'Benefits under $200 (small-benefit rules), departing Australia super payments, and super income streams are not modelled.',
    'Component amounts must be supplied (proportioning rule is not applied).',
  ],
  example: { payment_date: '2026-10-01', date_of_birth: '1968-02-10', taxed_element: 300000, tax_free_component: 50000 },
  run(input, ctx) {
    const fy = financialYearOf(input.payment_date);
    const at = fyStart(fy);
    const rates = ctx.table('super.lump_sum_rates', at);
    const taxed = dec(input.taxed_element);
    const untaxed = dec(input.untaxed_element);
    const total = taxed.plus(untaxed).plus(dec(input.tax_free_component));
    if (total.gt(0) && total.lt(rates.small_benefit_below!)) {
      block({ code: 'OUT_OF_SCOPE', message: `Lump sums under ${fmt(rates.small_benefit_below!)} are subject to small-benefit rules that are not modelled.`, ruleId: RULE_LUMP_SUM.id });
    }
    let taxOnTaxed = ZERO;
    let taxOnUntaxed = ZERO;
    let basis: string;

    if (input.recipient === 'death_dependant') {
      basis = 'death benefit to a dependant: tax-free';
    } else if (input.recipient === 'death_non_dependant') {
      taxOnTaxed = taxed.mul(rates.death_non_dependant_taxed!);
      taxOnUntaxed = untaxed.mul(rates.death_non_dependant_untaxed!);
      basis = `death benefit to a non-dependant: taxed element ${rates.death_non_dependant_taxed!.mul(100).toFixed()}%, untaxed element ${rates.death_non_dependant_untaxed!.mul(100).toFixed()}%`;
    } else if (input.terminal_medical_condition) {
      basis = 'terminal medical condition: tax-free';
    } else {
      const age = ageOn(input.date_of_birth, input.payment_date);
      const pres = preservationAge(ctx, input.date_of_birth, at);
      const upc = ctx.scalar('super.untaxed_plan_cap', at);
      const upcLeft = max(0, upc.minus(dec(input.untaxed_plan_cap_used)));
      const untaxedLow = min(untaxed, upcLeft);
      const untaxedHigh = untaxed.minus(untaxedLow);
      if (age >= 60) {
        taxOnUntaxed = untaxedLow.mul(rates.untaxed_60_plus_to_untaxed_cap!).plus(untaxedHigh.mul(rates.untaxed_above_untaxed_cap!));
        basis = `age ${age} (60 or over): taxed element non-assessable non-exempt; untaxed element 15% to the untaxed plan cap, 45% above`;
      } else if (age >= pres) {
        if (untaxed.gt(0)) {
          block({ code: 'RULE_NOT_IMPLEMENTED', message: 'Between preservation age and 59, the ordering of the low rate cap across taxed and untaxed elements is not verified; benefits with an untaxed element are blocked.', ruleId: RULE_LUMP_SUM.id });
        }
        const lrc = ctx.scalar('super.low_rate_cap', at);
        const lrcLeft = max(0, lrc.minus(dec(input.low_rate_cap_used)));
        const above = max(0, taxed.minus(lrcLeft));
        taxOnTaxed = above.mul(rates.taxed_preservation_to_59_above_low_rate_cap!);
        basis = `age ${age} (preservation age ${pres} to 59): taxed element nil up to remaining low rate cap ${fmt(lrcLeft)}, 15% on ${fmt(above)}`;
      } else {
        taxOnTaxed = taxed.mul(rates.taxed_under_preservation!);
        taxOnUntaxed = untaxedLow.mul(rates.untaxed_under_preservation_to_untaxed_cap!).plus(untaxedHigh.mul(rates.untaxed_above_untaxed_cap!));
        basis = `age ${age} (under preservation age ${pres}): taxed element 20%; untaxed element 30% to the untaxed plan cap, 45% above`;
      }
    }
    const t1 = cents(taxOnTaxed, 'half_up');
    const t2 = cents(taxOnUntaxed, 'half_up');
    const totalTax = t1.plus(t2);
    ctx.step({ key: 'super.lump_sum_tax', label: 'Maximum lump sum tax (excl. Medicare levy)', value: money(totalTax), working: basis, ruleId: RULE_LUMP_SUM.id });
    if (totalTax.gt(0)) ctx.warn('Medicare levy may apply in addition to the assessable part of the lump sum.');
    const net: Dec = total.minus(totalTax);
    return {
      financial_year: fy,
      tax_on_taxed_element: money(t1),
      tax_on_untaxed_element: money(t2),
      total_tax_excluding_medicare: money(totalTax),
      net_benefit_before_medicare: money(net),
    };
  },
});
