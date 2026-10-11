import { z } from 'zod';
import { defineCalculator, type RuleMeta } from '../core/calculator.js';
import type { CalcContext } from '../core/context.js';
import { block } from '../core/errors.js';
import { cents, dec, max, min, money, roundDp, ZERO, type Dec } from '../core/decimal.js';
import { fyStart, fyStartYear } from '../core/dates.js';
import { amount, financialYear } from '../core/inputs.js';
import { fmt, marginalTax } from './scale.js';

export const RULE_LITO: RuleMeta = {
  id: 'au.tax.lito',
  version: '1.0.0',
  legalReference: 'Income Tax Assessment Act 1997 ss61-110, 61-115',
};
export const RULE_SAPTO: RuleMeta = {
  id: 'au.tax.sapto',
  version: '1.0.0',
  legalReference: 'Income Tax Assessment Act 1936 s160AAAA; Income Tax Assessment (1936 Act) Regulations',
};
export const RULE_WATO: RuleMeta = {
  id: 'au.tax.wato',
  version: '1.0.0',
  legalReference: 'Income Tax Assessment Act 1997 ss61-155, 61-160 (Act No. 49 of 2026)',
};

/**
 * Low income tax offset:
 *   TI <= 37,500: 700; to 45,000: 700 − 5% × (TI − 37,500); to 66,667: 325 − 1.5% × (TI − 45,000).
 * Floored at nil. Rounded to cents half-up (engine convention: no rounding rule is published).
 */
export function lito(ctx: CalcContext, fy: string, ti: Dec): Dec {
  const at = fyStart(fy);
  const t = ctx.table('tax.offsets.lito', at);
  let raw: Dec;
  let working: string;
  if (ti.lte(t.full_to!)) {
    raw = t.max!;
    working = `taxable income ≤ ${fmt(t.full_to!)}: maximum offset`;
  } else if (ti.lte(t.step_at!)) {
    raw = t.max!.minus(t.taper1!.mul(ti.minus(t.full_to!)));
    working = `${fmt(t.max!)} − ${t.taper1!.mul(100).toFixed()}% × (${fmt(ti)} − ${fmt(t.full_to!)})`;
  } else {
    raw = t.step_amount!.minus(t.taper2!.mul(ti.minus(t.step_at!)));
    working = `${fmt(t.step_amount!)} − ${t.taper2!.mul(100).toFixed()}% × (${fmt(ti)} − ${fmt(t.step_at!)})`;
  }
  const result = cents(max(0, raw), 'half_up');
  ctx.step({ key: 'tax.lito', label: `Low income tax offset ${fy}`, value: money(result), working, ruleId: RULE_LITO.id });
  return result;
}

export type SaptoCategory = 'single' | 'couple' | 'illness_separated';

/**
 * Seniors and pensioners tax offset (eligibility asserted by the user):
 *   offset = max − 12.5% × max(0, rebate income − shade-out), floored at nil,
 *   rounded UP to the nearest whole dollar (ATO: "We round up the amount to the nearest whole dollar").
 * Couple values are per partner; transfer of a spouse's unused offset is not modelled.
 */
export function sapto(ctx: CalcContext, fy: string, rebateIncome: Dec, category: SaptoCategory): Dec {
  const at = fyStart(fy);
  const t = ctx.table('tax.offsets.sapto', at);
  const maxOffset = t[`${category}_max`];
  const shadeOut = t[`${category}_shade_out`];
  if (!maxOffset || !shadeOut) {
    block({ code: 'PARAMETER_MISSING', message: `SAPTO values for category ${category} missing for ${fy}`, parameter: 'tax.offsets.sapto' });
  }
  const excess = max(0, rebateIncome.minus(shadeOut));
  const raw = max(0, maxOffset.minus(t.taper!.mul(excess)));
  const result = roundDp(raw, 0, 'ceil');
  ctx.step({
    key: 'tax.sapto',
    label: `Seniors and pensioners tax offset ${fy} (${category.replace('_', '-')})`,
    value: money(result),
    working: `${fmt(maxOffset)} − ${t.taper!.toFixed()} × max(0, ${fmt(rebateIncome)} − ${fmt(shadeOut)}) = ${raw.toFixed()} → rounded up to whole dollars`,
    ruleId: RULE_SAPTO.id,
  });
  return result;
}

/**
 * Working Australians tax offset (2027-28 onwards): for a resident whose net labour income exceeds
 * the tax-free threshold, the lesser of $250 and the basic income tax liability worked out as if
 * taxable income were only net labour income. Non-refundable.
 */
export function wato(ctx: CalcContext, fy: string, netLabourIncome: Dec): Dec {
  const at = fyStart(fy);
  const t = ctx.table('tax.offsets.wato', at);
  const tft = ctx.scalar('tax.tax_free_threshold', at);
  let result: Dec;
  let working: string;
  if (netLabourIncome.lte(tft)) {
    result = ZERO;
    working = `net labour income ${fmt(netLabourIncome)} does not exceed the tax-free threshold ${fmt(tft)}`;
  } else {
    const { tax } = marginalTax(ctx.brackets('tax.resident_scale', at), netLabourIncome);
    result = cents(min(t.max!, tax), 'half_up');
    working = `lesser of ${fmt(t.max!)} and tax on net labour income alone (${fmt(cents(tax, 'half_up'))})`;
  }
  ctx.step({ key: 'tax.wato', label: `Working Australians tax offset ${fy}`, value: money(result), working, ruleId: RULE_WATO.id });
  return result;
}

const LitoInput = z.object({
  financial_year: financialYear(),
  taxable_income: amount('Taxable income (AUD)'),
});

export const litoCalculator = defineCalculator({
  id: 'tax.lito',
  title: 'Low income tax offset (LITO)',
  domain: 'tax',
  summary: 'Low income tax offset for an Australian resident individual.',
  input: LitoInput,
  rules: [RULE_LITO],
  limitations: [
    'Non-refundable: the offset actually usable is limited to tax payable (see tax.personal_tax).',
    'LITO for 2027-28 is not included until confirmed against ITAA 1997 s61-115.',
    'Rounding to cents is an engine convention; no official rounding rule was found.',
  ],
  example: { financial_year: '2026-27', taxable_income: 42000 },
  run(input, ctx) {
    return { lito: money(lito(ctx, input.financial_year, dec(input.taxable_income))) };
  },
});

const SaptoInput = z.object({
  financial_year: financialYear(),
  rebate_income: amount('Rebate income (AUD): taxable income + reportable super contributions + total net investment loss + adjusted fringe benefits total'),
  category: z.enum(['single', 'couple', 'illness_separated']).describe('single; couple (each partner, living together); illness_separated (each partner, separated by illness or one in a nursing home)'),
});

export const saptoCalculator = defineCalculator({
  id: 'tax.sapto',
  title: 'Seniors and pensioners tax offset (SAPTO)',
  domain: 'tax',
  summary: 'SAPTO amount for a person who meets the eligibility conditions (age/pension and income tests are asserted by the user).',
  input: SaptoInput,
  rules: [RULE_SAPTO],
  limitations: [
    'Eligibility (Age Pension age or receiving a qualifying pension, and the income limits) is asserted by the user.',
    'Transfer of a spouse’s unused SAPTO is not modelled.',
    '2024-25 and 2027-28 thresholds are not in this release, so those years block.',
  ],
  example: { financial_year: '2025-26', rebate_income: 39000, category: 'single' },
  run(input, ctx) {
    return { sapto: money(sapto(ctx, input.financial_year, dec(input.rebate_income), input.category)) };
  },
});

const WatoInput = z.object({
  financial_year: financialYear().refine((fy) => fyStartYear(fy) >= 2027, 'WATO applies from 2027-28'),
  net_labour_income: amount('Net labour income (AUD): labour amounts less deductions attributable to them'),
  resident: z.boolean().default(true).describe('Australian resident at any time in the year'),
});

export const watoCalculator = defineCalculator({
  id: 'tax.wato',
  title: 'Working Australians tax offset (WATO)',
  domain: 'tax',
  summary: 'WATO from 2027-28: the lesser of $250 and the tax on net labour income alone.',
  input: WatoInput,
  rules: [RULE_WATO],
  limitations: ['Net labour income must be computed by the user per ITAA 1997 s61-155.', 'Non-refundable; usable amount limited to tax payable.'],
  example: { financial_year: '2027-28', net_labour_income: 60000, resident: true },
  run(input, ctx) {
    if (!input.resident) {
      ctx.step({ key: 'tax.wato', label: 'Working Australians tax offset', value: '0.00', working: 'not an Australian resident at any time in the year', ruleId: RULE_WATO.id });
      return { wato: '0.00' };
    }
    return { wato: money(wato(ctx, input.financial_year, dec(input.net_labour_income))) };
  },
});
