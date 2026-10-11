import { z } from 'zod';
import { defineCalculator, type RuleMeta } from '../core/calculator.js';
import { cents, dec, max, money, roundDp, toJson, ZERO, type Dec } from '../core/decimal.js';
import { fyStart, fyStartYear } from '../core/dates.js';
import { amount, financialYear, signedAmount } from '../core/inputs.js';
import { block } from '../core/errors.js';
import { fmt } from '../tax/scale.js';

export const RULE_DIV296: RuleMeta = {
  id: 'au.super.div296',
  version: '1.0.0',
  legalReference: 'Income Tax Assessment Act 1997 Div 296 (Treasury Laws Amendment (Building a Stronger and Fairer Super System) Act 2026)',
};

const Input = z.object({
  financial_year: financialYear(),
  tsb_end_of_year: amount('Total super balance at the end of the income year (AUD), excluding LRBA amounts'),
  tsb_start_of_year: amount('Total super balance just before the start of the income year (AUD) — required from 2027-28').optional(),
  super_earnings: signedAmount('Total super earnings attributed by funds for Division 296 (AUD)'),
});

export const div296Calculator = defineCalculator({
  id: 'super.div296',
  title: 'Division 296 tax (large super balances)',
  domain: 'super',
  summary: 'Additional 15% tax on the proportion of super earnings attributable to a balance above $3m, plus 10% on the proportion above $10m, from 2026-27.',
  input: Input,
  rules: [RULE_DIV296],
  limitations: [
    'Super earnings must be supplied as attributed by funds under the Division 296 regulations; the engine does not compute fund earnings.',
    'Negative earnings (loss treatment) are not modelled and are blocked.',
    'Defined benefit interests, deferral and death in the year are not modelled.',
    '2027-28 thresholds (CPI-indexed) are not yet published: blocks.',
  ],
  example: { financial_year: '2026-27', tsb_end_of_year: 4500000, super_earnings: 300000 },
  run(input, ctx) {
    const fy = input.financial_year;
    const at = fyStart(fy);
    const t = ctx.table('super.div296', at);
    const end = dec(input.tsb_end_of_year);
    let ref: Dec;
    if (fyStartYear(fy) === 2026) {
      ref = end;
    } else {
      if (input.tsb_start_of_year === undefined) {
        block({ code: 'OUT_OF_SCOPE', message: 'From 2027-28 the TSB reference amount is the greater of the opening and closing TSB; supply tsb_start_of_year.' });
      }
      ref = max(end, dec(input.tsb_start_of_year));
    }
    const earnings = dec(input.super_earnings);
    if (earnings.lt(0)) {
      block({ code: 'RULE_NOT_IMPLEMENTED', message: 'Negative Division 296 earnings (loss treatment) are not modelled.', ruleId: RULE_DIV296.id });
    }
    const dp = t.proportion_dp!.toNumber();
    const prop = (threshold: Dec): Dec => (ref.gt(threshold) ? roundDp(ref.minus(threshold).div(ref).mul(100), dp, 'half_up') : ZERO);
    const p1 = prop(t.lsbt!);
    const p2 = prop(t.vlsbt!);
    const tax1 = earnings.mul(p1).div(100).mul(t.rate_lsbt!);
    const tax2 = earnings.mul(p2).div(100).mul(t.rate_vlsbt!);
    const total = cents(tax1.plus(tax2), 'half_up');
    ctx.step({
      key: 'super.div296',
      label: `Division 296 tax ${fy}`,
      value: money(total),
      working: `TSB reference ${fmt(ref)}; proportion above ${fmt(t.lsbt!)} = ${p1.toFixed(dp)}%, above ${fmt(t.vlsbt!)} = ${p2.toFixed(dp)}% (rounded to ${dp} dp); ${fmt(earnings)} × ${p1.toFixed(dp)}% × 15% + ${fmt(earnings)} × ${p2.toFixed(dp)}% × 10%`,
      ruleId: RULE_DIV296.id,
    });
    return {
      tsb_reference_amount: money(ref),
      proportion_above_lsbt_pct: toJson(p1),
      proportion_above_vlsbt_pct: toJson(p2),
      div296_tax: money(total),
    };
  },
});
