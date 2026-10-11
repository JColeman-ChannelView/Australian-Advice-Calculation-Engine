import { z } from 'zod';
import { defineCalculator, type RuleMeta } from '../core/calculator.js';
import type { CalcContext } from '../core/context.js';
import { cents, dec, max, min, money, type Dec } from '../core/decimal.js';
import { fyStart } from '../core/dates.js';
import { amount, financialYear } from '../core/inputs.js';
import { fmt } from './scale.js';

export const RULE_DIV293: RuleMeta = {
  id: 'au.tax.div293',
  version: '1.0.0',
  legalReference: 'Income Tax Assessment Act 1997 Div 293',
};

/**
 * Division 293 tax = 15% × lesser of (low-tax contributions, max(0, income293 + LTC − 250,000)).
 * Rounded to cents half-up (engine convention; no rounding rule published).
 */
export function div293Tax(ctx: CalcContext, fy: string, income293: Dec, ltc: Dec): { tax: Dec; taxable: Dec } {
  const at = fyStart(fy);
  const t = ctx.table('tax.div293', at);
  const excess = max(0, income293.plus(ltc).minus(t.threshold!));
  const taxable = min(ltc, excess);
  const tax = cents(t.rate!.mul(taxable), 'half_up');
  ctx.step({
    key: 'tax.div293',
    label: `Division 293 tax ${fy}`,
    value: money(tax),
    working: `${t.rate!.mul(100).toFixed()}% × min(${fmt(ltc)}, max(0, ${fmt(income293)} + ${fmt(ltc)} − ${fmt(t.threshold!)}))`,
    ruleId: RULE_DIV293.id,
  });
  return { tax, taxable };
}

const Input = z.object({
  financial_year: financialYear(),
  division_293_income: amount('Income for Division 293 purposes (AUD): income for MLS purposes disregarding reportable super contributions'),
  low_tax_contributions: amount('Low-tax (concessional) contributions for Division 293 (AUD), disregarding excess concessional contributions'),
});

export const div293Calculator = defineCalculator({
  id: 'tax.div293',
  title: 'Division 293 tax',
  domain: 'tax',
  summary: 'Additional 15% tax on concessional contributions for people whose income plus low-tax contributions exceeds $250,000.',
  input: Input,
  rules: [RULE_DIV293],
  limitations: ['Division 293 income and low-tax contributions must be computed by the user.', 'Defined benefit interests and deferral are not modelled.'],
  example: { financial_year: '2026-27', division_293_income: 240000, low_tax_contributions: 32500 },
  run(input, ctx) {
    const { tax, taxable } = div293Tax(ctx, input.financial_year, dec(input.division_293_income), dec(input.low_tax_contributions));
    return { div293_tax: money(tax), taxable_contributions: money(cents(taxable)) };
  },
});
