import { z } from 'zod';
import { defineCalculator, type RuleMeta } from '../core/calculator.js';
import type { CalcContext } from '../core/context.js';
import { cents, dec, money, ZERO, type Dec } from '../core/decimal.js';
import { fyStart } from '../core/dates.js';
import { financialYear } from '../core/inputs.js';
import { fmt } from './scale.js';

export const RULE_HELP: RuleMeta = {
  id: 'au.tax.help_marginal_repayment',
  version: '1.0.0',
  legalReference: 'Higher Education Support Act 2003 s154-20 (marginal repayment method from 2025-26)',
};

/**
 * Compulsory study-loan repayment for a year (marginal method from 2025-26):
 *   RI <= threshold: nil
 *   threshold < RI <= band2_over: rate1 × (RI − threshold)
 *   band2_over < RI < top_from: band2_base + rate2 × (RI − band2_over)   [published base, see params]
 *   RI >= top_from: top_rate × RI
 * Rounded to cents, half-up (ATO examples are exact to the cent; no rounding rule is published).
 */
export function helpRepayment(ctx: CalcContext, fy: string, repaymentIncome: Dec): Dec {
  const at = fyStart(fy);
  const t = ctx.table('tax.help.repayment_schedule', at);
  const threshold = t.threshold!;
  const band2Over = t.band2_over!;
  const topFrom = t.top_from!;
  let raw: Dec;
  let working: string;
  if (repaymentIncome.lte(threshold)) {
    raw = ZERO;
    working = `repayment income ${fmt(repaymentIncome)} ≤ threshold ${fmt(threshold)}`;
  } else if (repaymentIncome.lte(band2Over)) {
    raw = t.rate1!.mul(repaymentIncome.minus(threshold));
    working = `${t.rate1!.mul(100).toFixed()}% × (${fmt(repaymentIncome)} − ${fmt(threshold)})`;
  } else if (repaymentIncome.lt(topFrom)) {
    raw = t.band2_base!.plus(t.rate2!.mul(repaymentIncome.minus(band2Over)));
    working = `${fmt(t.band2_base!)} + ${t.rate2!.mul(100).toFixed()}% × (${fmt(repaymentIncome)} − ${fmt(band2Over)})`;
  } else {
    raw = t.top_rate_of_total!.mul(repaymentIncome);
    working = `${t.top_rate_of_total!.mul(100).toFixed()}% × ${fmt(repaymentIncome)} (total repayment income)`;
  }
  const result = cents(raw, 'half_up');
  ctx.step({
    key: 'tax.help_repayment',
    label: `Compulsory study loan repayment ${fy}`,
    value: money(result),
    working,
    ruleId: RULE_HELP.id,
    parameters: [`tax.help.repayment_schedule@${at}`],
  });
  return result;
}

const Input = z.object({
  financial_year: financialYear(),
  repayment_income: z
    .number()
    .int('repayment income is assessed in whole dollars')
    .min(0)
    .describe(
      'Repayment income (whole dollars): taxable income + reportable fringe benefits + total net investment loss + reportable super contributions + exempt foreign employment income',
    ),
});

export const helpCalculator = defineCalculator({
  id: 'tax.help_repayment',
  title: 'Study and training loan (HELP) compulsory repayment',
  domain: 'tax',
  summary: 'Compulsory repayment of HELP and other study and training loans under the marginal method that applies from 2025-26.',
  input: Input,
  rules: [RULE_HELP],
  limitations: [
    'Repayment income must be computed by the user from its components; the engine does not derive it.',
    'The repayment is capped at the outstanding loan balance; supply the balance separately if it may bind (not modelled).',
    'Years before 2025-26 (percentage-of-total method) are not included in this parameter release.',
  ],
  example: { financial_year: '2026-27', repayment_income: 86380 },
  run(input, ctx) {
    const r = helpRepayment(ctx, input.financial_year, dec(input.repayment_income));
    return { help_repayment: money(r) };
  },
});
