import { z } from 'zod';
import { defineCalculator, type RuleMeta } from '../core/calculator.js';
import { cents, dec, max, min, money, roundToIncrement, ZERO, type Dec } from '../core/decimal.js';
import { fyStart } from '../core/dates.js';
import { amount, financialYear } from '../core/inputs.js';
import { fmt } from '../tax/scale.js';

export const RULE_COCONTRIB: RuleMeta = {
  id: 'au.super.co_contribution',
  version: '1.0.0',
  legalReference: 'Superannuation (Government Co-contribution for Low Income Earners) Act 2003 ss9, 10, 11',
};
export const RULE_LISTO: RuleMeta = {
  id: 'au.super.listo',
  version: '1.0.0',
  legalReference: 'Superannuation (Government Co-contribution for Low Income Earners) Act 2003 ss12C, 12E',
};
export const RULE_SPOUSE: RuleMeta = {
  id: 'au.super.spouse_contribution_offset',
  version: '1.0.0',
  legalReference: 'Income Tax Assessment Act 1997 s290-230',
};

const CoInput = z.object({
  financial_year: financialYear(),
  total_income: amount('Total income for co-contribution purposes (assessable income + reportable fringe benefits + reportable employer super contributions, less business deductions) (AUD)'),
  eligible_personal_contributions: amount('Personal (after-tax) contributions not claimed as a deduction (AUD)'),
});

export const coContributionCalculator = defineCalculator({
  id: 'super.co_contribution',
  title: 'Government super co-contribution',
  domain: 'super',
  summary: 'Co-contribution entitlement: 50% matching, capped at $500 reduced by 3.333c per dollar of income above the lower threshold, $20 minimum, rounded up to 5 cents.',
  input: CoInput,
  rules: [RULE_COCONTRIB],
  limitations: ['Eligibility tests (age under 71, 10% eligible income test, TSB below the transfer balance cap, not exceeding the NCC cap, residency/lodgment) are asserted by the user.'],
  example: { financial_year: '2026-27', total_income: 56793, eligible_personal_contributions: 1000 },
  run(input, ctx) {
    const at = fyStart(input.financial_year);
    const t = ctx.table('super.co_contribution', at);
    const income = dec(input.total_income);
    const contrib = dec(input.eligible_personal_contributions);
    let maxEnt: Dec;
    let working: string;
    if (income.gte(t.higher_threshold!)) {
      maxEnt = ZERO;
      working = `total income ${fmt(income)} ≥ higher threshold ${fmt(t.higher_threshold!)}: nil`;
    } else if (income.lte(t.lower_threshold!)) {
      maxEnt = t.max!;
      working = `total income ${fmt(income)} ≤ lower threshold ${fmt(t.lower_threshold!)}: maximum ${fmt(t.max!)}`;
    } else {
      maxEnt = t.max!.minus(t.taper_per_dollar!.mul(income.minus(t.lower_threshold!)));
      working = `${fmt(t.max!)} − ${t.taper_per_dollar!.toFixed()} × (${fmt(income)} − ${fmt(t.lower_threshold!)}) = ${maxEnt.toFixed()}`;
    }
    const matched = t.matching_rate!.mul(contrib);
    let ent = min(matched, max(0, maxEnt));
    working += `; matched ${t.matching_rate!.mul(100).toFixed()}% × ${fmt(contrib)} = ${fmt(matched)}; lesser = ${ent.toFixed()}`;
    if (ent.gt(0) && ent.lt(t.minimum!)) {
      ent = t.minimum!;
      working += `; raised to the minimum ${fmt(t.minimum!)}`;
    }
    const result = roundToIncrement(ent, t.round_up_to!, 'ceil');
    working += `; rounded up to ${t.round_up_to!.toFixed()}`;
    ctx.step({ key: 'super.co_contribution', label: `Government co-contribution ${input.financial_year}`, value: money(result), working, ruleId: RULE_COCONTRIB.id });
    return { co_contribution: money(result), maximum_entitlement: money(cents(max(0, maxEnt), 'half_up')) };
  },
});

const ListoInput = z.object({
  financial_year: financialYear(),
  adjusted_taxable_income: amount('Adjusted taxable income (AUD)'),
  concessional_contributions: amount('Concessional contributions made in the year (AUD)'),
});

export const listoCalculator = defineCalculator({
  id: 'super.listo',
  title: 'Low income super tax offset (LISTO)',
  domain: 'super',
  summary: 'LISTO: 15% of concessional contributions (rounded to the cent), minimum $10, maximum $500 ($810 from 2027-28), for adjusted taxable income up to the threshold.',
  input: ListoInput,
  rules: [RULE_LISTO],
  limitations: ['The 10% eligible income test and temporary-resident exclusion are asserted by the user.'],
  example: { financial_year: '2026-27', adjusted_taxable_income: 32000, concessional_contributions: 3840 },
  run(input, ctx) {
    const at = fyStart(input.financial_year);
    const t = ctx.table('super.listo', at);
    const ati = dec(input.adjusted_taxable_income);
    const cc = dec(input.concessional_contributions);
    let result: Dec;
    let working: string;
    if (ati.gt(t.income_threshold!)) {
      result = ZERO;
      working = `adjusted taxable income ${fmt(ati)} > ${fmt(t.income_threshold!)}: nil`;
    } else if (cc.lte(0)) {
      result = ZERO;
      working = 'no concessional contributions';
    } else {
      const raw = cents(t.rate!.mul(cc), 'half_up');
      result = min(t.max!, max(t.min!, raw));
      working = `${t.rate!.mul(100).toFixed()}% × ${fmt(cc)} = ${raw.toFixed(2)}, within [${fmt(t.min!)}, ${fmt(t.max!)}]`;
    }
    ctx.step({ key: 'super.listo', label: `LISTO ${input.financial_year}`, value: money(result), working, ruleId: RULE_LISTO.id });
    return { listo: money(result) };
  },
});

const SpouseInput = z.object({
  financial_year: financialYear(),
  spouse_income: amount('Spouse’s assessable income + reportable fringe benefits + reportable employer super contributions (AUD)'),
  contributions_for_spouse: amount('Non-concessional contributions made for the spouse (AUD)'),
});

export const spouseOffsetCalculator = defineCalculator({
  id: 'super.spouse_offset',
  title: 'Spouse contribution tax offset',
  domain: 'super',
  summary: '18% of the lesser of eligible spouse contributions and $3,000 reduced by spouse income above $37,000 (nil at $40,000); up to $540.',
  input: SpouseInput,
  rules: [RULE_SPOUSE],
  limitations: ['Eligibility (spouse under 75, spouse TSB below the transfer balance cap, residency, not living separately) is asserted by the user.', 'Rounding to cents is an engine convention.'],
  example: { financial_year: '2026-27', spouse_income: 38000, contributions_for_spouse: 3000 },
  run(input, ctx) {
    const at = fyStart(input.financial_year);
    const t = ctx.table('super.spouse_offset', at);
    const income = dec(input.spouse_income);
    const contrib = dec(input.contributions_for_spouse);
    const reducedMax = max(0, t.max_contributions!.minus(max(0, income.minus(t.income_threshold!))));
    const base = min(contrib, reducedMax);
    const result = cents(t.rate!.mul(base), 'half_up');
    ctx.step({
      key: 'super.spouse_offset',
      label: `Spouse contribution tax offset ${input.financial_year}`,
      value: money(result),
      working: `${t.rate!.mul(100).toFixed()}% × min(${fmt(contrib)}, ${fmt(t.max_contributions!)} − max(0, ${fmt(income)} − ${fmt(t.income_threshold!)}))`,
      ruleId: RULE_SPOUSE.id,
    });
    return { spouse_offset: money(result) };
  },
});
