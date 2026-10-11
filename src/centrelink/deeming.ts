import { z } from 'zod';
import { defineCalculator, type RuleMeta } from '../core/calculator.js';
import type { CalcContext } from '../core/context.js';
import { cents, dec, max, min, money, type Dec } from '../core/decimal.js';
import type { IsoDate } from '../core/dates.js';
import { amount, isoDate } from '../core/inputs.js';
import { fmt } from '../tax/scale.js';

export const RULE_DEEMING: RuleMeta = {
  id: 'au.centrelink.deeming',
  version: '1.0.0',
  legalReference: 'Social Security Act 1991 Part 3.10 Div 2 (ss1076, 1081, 1082)',
};

export type DeemingStatus = 'single' | 'pensioner_couple' | 'non_pensioner_couple_member';

const THRESHOLD_KEY: Record<DeemingStatus, string> = {
  single: 'single',
  pensioner_couple: 'pensioner_couple_combined',
  non_pensioner_couple_member: 'non_pensioner_couple_each',
};

/**
 * Deemed income per year = lower × min(FA, threshold) + upper × max(0, FA − threshold).
 * For a pensioner couple FA and the threshold are combined; each partner is taken to have half.
 * Not rounded (no rounding rule found); callers round at instalment level.
 */
export function deemedIncome(ctx: CalcContext, date: IsoDate, financialAssets: Dec, status: DeemingStatus): { annual: Dec; threshold: Dec; lower: Dec; upper: Dec } {
  const rates = ctx.table('centrelink.deeming_rates', date);
  const threshold = ctx.tableValue('centrelink.deeming_thresholds', date, THRESHOLD_KEY[status]);
  const lower = rates.lower!;
  const upper = rates.upper!;
  const below = min(financialAssets, threshold);
  const above = max(0, financialAssets.minus(threshold));
  const annual = lower.mul(below).plus(upper.mul(above));
  ctx.step({
    key: 'centrelink.deemed_income',
    label: `Deemed income (${status.replace(/_/g, ' ')}) per year`,
    value: annual.toDecimalPlaces(2).toFixed(2),
    working: `${lower.mul(100).toFixed()}% × ${fmt(below)} + ${upper.mul(100).toFixed()}% × ${fmt(above)}`,
    ruleId: RULE_DEEMING.id,
  });
  return { annual, threshold, lower, upper };
}

const Input = z.object({
  assessment_date: isoDate('Date of assessment (selects deeming rates and thresholds)'),
  financial_assets: amount('Total financial assets subject to deeming (AUD); combined for a couple'),
  status: z.enum(['single', 'pensioner_couple']).describe('single, or a couple where at least one partner receives a pension'),
});

export const deemingCalculator = defineCalculator({
  id: 'centrelink.deeming',
  title: 'Deemed income',
  domain: 'centrelink',
  summary: 'Deemed income from financial assets using the deeming rates and thresholds in force on the assessment date.',
  input: Input,
  rules: [RULE_DEEMING],
  limitations: [
    'The user classifies which assets are financial assets (including account-based pensions purchased from 1 January 2015).',
    'Non-pensioner couples and grandfathered income streams are not modelled.',
    'Deeming thresholds before 1 July 2025 are not in this release.',
  ],
  example: { assessment_date: '2026-10-11', financial_assets: 150000, status: 'single' },
  run(input, ctx) {
    const fa = dec(input.financial_assets);
    const r = deemedIncome(ctx, input.assessment_date, fa, input.status);
    return {
      deemed_income_annual: money(cents(r.annual, 'half_up')),
      deemed_income_fortnightly: money(cents(r.annual.div(26), 'half_up')),
      threshold: money(r.threshold),
      lower_rate: r.lower.toFixed(),
      upper_rate: r.upper.toFixed(),
    };
  },
});
