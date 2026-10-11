import { z } from 'zod';
import { defineCalculator, type RuleMeta } from '../core/calculator.js';
import type { CalcContext } from '../core/context.js';
import { cents, dec, min, money, roundToIncrement, toJson, type Dec } from '../core/decimal.js';
import { fyStart, fyStartYear } from '../core/dates.js';
import { amount, financialYear } from '../core/inputs.js';
import { fmt } from '../tax/scale.js';

export const RULE_SG: RuleMeta = {
  id: 'au.super.sg_minimum',
  version: '1.0.0',
  legalReference: 'Superannuation Guarantee (Administration) Act 1992 ss15, 19 (Payday Super from 2026-27)',
};

/** MCB identity from 2026-27: concessional cap × 100 ÷ charge percentage, rounded down to $10. */
export function mcbFormula(cc: Dec, sgRate: Dec): Dec {
  return roundToIncrement(cc.div(sgRate), 10, 'floor');
}

export function maximumContributionBase(ctx: CalcContext, fy: string): { mcb: Dec; period: 'annual' | 'quarter' } {
  const at = fyStart(fy);
  if (fyStartYear(fy) >= 2026) {
    const mcb = ctx.scalar('super.max_contribution_base_annual', at);
    const check = mcbFormula(ctx.scalar('super.concessional_cap', at), ctx.scalar('super.sg_rate', at));
    if (!check.eq(mcb)) ctx.warn(`Published maximum contribution base ${fmt(mcb)} differs from the formula value ${fmt(check)}.`);
    return { mcb, period: 'annual' };
  }
  return { mcb: ctx.scalar('super.max_contribution_base_quarterly', at), period: 'quarter' };
}

const Input = z.object({
  financial_year: financialYear(),
  earnings: amount('From 2026-27: qualifying earnings for the year; before 2026-27: ordinary time earnings for one quarter (AUD)'),
});

export const sgCalculator = defineCalculator({
  id: 'super.sg',
  title: 'Super guarantee minimum and maximum contribution base',
  domain: 'super',
  summary: 'Minimum employer super guarantee on earnings, limited by the maximum contribution base (quarterly to 2025-26, annual under Payday Super from 2026-27).',
  input: Input,
  rules: [RULE_SG],
  limitations: [
    'From 2026-27 the base is applied to annual qualifying earnings; per-payday apportionment of the annual base is not modelled.',
    'Salary-sacrifice interactions, SG opt-out certificates and exempt employees are not modelled.',
    'Rounding to cents is an engine convention.',
  ],
  example: { financial_year: '2026-27', earnings: 300000 },
  run(input, ctx) {
    const at = fyStart(input.financial_year);
    const rate = ctx.scalar('super.sg_rate', at);
    const { mcb, period } = maximumContributionBase(ctx, input.financial_year);
    const e = dec(input.earnings);
    const base = min(e, mcb);
    const sg = cents(base.mul(rate), 'half_up');
    ctx.step({
      key: 'super.sg',
      label: `Minimum super guarantee (${period === 'annual' ? 'year' : 'quarter'})`,
      value: money(sg),
      working: `${rate.mul(100).toFixed()}% × min(${fmt(e)}, maximum contribution base ${fmt(mcb)})`,
      ruleId: RULE_SG.id,
    });
    return {
      sg_rate: toJson(rate),
      maximum_contribution_base: money(mcb),
      base_period: period,
      earnings_base_used: money(base),
      minimum_sg: money(sg),
    };
  },
});
