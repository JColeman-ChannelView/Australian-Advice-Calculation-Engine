import { z } from 'zod';
import { defineCalculator, type RuleMeta } from '../core/calculator.js';
import type { CalcContext } from '../core/context.js';
import { cents, dec, money, ONE, toJson, type Dec } from '../core/decimal.js';
import type { IsoDate } from '../core/dates.js';
import { amount, isoDate, rate } from '../core/inputs.js';
import { fmt } from '../tax/scale.js';

export const RULE_PV_SUPER: RuleMeta = {
  id: 'au.projection.asic_2022_603_present_value',
  version: '1.0.0',
  legalReference: 'ASIC Corporations (Superannuation Calculators and Retirement Estimates) Instrument 2022/603 s4 "present value"',
};
export const RULE_PV_GENERIC: RuleMeta = {
  id: 'au.projection.asic_2026_41_present_value',
  version: '1.0.0',
  legalReference: 'ASIC Corporations (Generic Calculators) Instrument 2026/41 s6 "present value"',
};

export interface Deflators {
  wage: Dec;
  cpi: Dec;
  wageSource: 'user' | 'default';
  cpiSource: 'user' | 'default';
}

/**
 * Resolve the 2022/603 deflators for a calculation date, recording assumptions. A user-supplied
 * rate overrides the default (the instrument permits "such other assumed rate" entered by a user);
 * without one, a calculation dated after the instrument's repeal blocks (no default exists).
 */
export function superDeflators(ctx: CalcContext, calcDate: IsoDate, wageOverride?: string, cpiOverride?: string): Deflators {
  const wage = wageOverride !== undefined ? dec(wageOverride) : ctx.scalar('projection.asic_super.wage_deflator', calcDate);
  const cpi = cpiOverride !== undefined ? dec(cpiOverride) : ctx.scalar('projection.asic_super.cpi_deflator', calcDate);
  const d: Deflators = { wage, cpi, wageSource: wageOverride !== undefined ? 'user' : 'default', cpiSource: cpiOverride !== undefined ? 'user' : 'default' };
  ctx.assume({ key: 'wage_deflator', label: 'Nominal wage inflation (deflator before retirement)', value: toJson(wage), source: d.wageSource, basis: d.wageSource === 'default' ? 'ASIC Instrument 2022/603 default' : 'user input' });
  ctx.assume({ key: 'cpi_deflator', label: 'CPI inflation (deflator from retirement)', value: toJson(cpi), source: d.cpiSource, basis: d.cpiSource === 'default' ? 'ASIC Instrument 2022/603 default' : 'user input' });
  return d;
}

/** PV = C / ((1+r)^a × (1+s)^b): a = years before retirement, b = years after (fractions allowed). */
export function presentValueSuper(c: Dec, yearsBeforeRetirement: Dec, yearsAfterRetirement: Dec, d: Deflators): Dec {
  const f = ONE.plus(d.wage).pow(yearsBeforeRetirement).mul(ONE.plus(d.cpi).pow(yearsAfterRetirement));
  return c.div(f);
}

const Input = z.object({
  calculation_date: isoDate('Date of the calculation (selects the default inflation rates)'),
  future_amount: amount('Nominal amount payable in the future (AUD)'),
  basis: z.enum(['superannuation', 'generic']).describe('superannuation (Instrument 2022/603) or generic financial calculator (Instrument 2026/41)'),
  years_until_payment: z.number().min(0).max(100).describe('Years (and part years) from the calculation date to the payment'),
  years_until_retirement: z.number().min(0).max(100).optional().describe('superannuation basis: years from the calculation date to the assumed retirement age (omit or ≥ years_until_payment if payment is before retirement)'),
  wage_inflation: rate('Override nominal wage inflation (superannuation basis)').optional(),
  cpi_inflation: rate('Override CPI / assumed inflation rate').optional(),
});

export const presentValueCalculator = defineCalculator({
  id: 'projection.present_value',
  title: 'Present value in today’s dollars (ASIC deflators)',
  domain: 'projection',
  summary: 'Deflates a future amount to today’s dollars using the ASIC 2022/603 two-stage method (wages to retirement, CPI after) or the 2026/41 generic-calculator inflation rate.',
  input: Input,
  rules: [RULE_PV_SUPER, RULE_PV_GENERIC],
  limitations: [
    'Instrument 2022/603 is repealed on 1 July 2027; calculations dated after 30 June 2027 need user-supplied rates.',
    'This is the deflator calculation only; relief conditions under the instruments apply to whoever provides a calculator to consumers.',
  ],
  example: { calculation_date: '2026-10-11', future_amount: 1000000, basis: 'superannuation', years_until_payment: 30 },
  run(input, ctx) {
    const c = dec(input.future_amount);
    const n = dec(input.years_until_payment);
    let pv: Dec;
    let working: string;
    if (input.basis === 'generic') {
      const r = input.cpi_inflation !== undefined ? dec(input.cpi_inflation) : ctx.scalar('projection.asic_generic.inflation', input.calculation_date);
      ctx.assume({ key: 'inflation', label: 'Assumed inflation rate', value: toJson(r), source: input.cpi_inflation !== undefined ? 'user' : 'default', basis: 'ASIC Instrument 2026/41 default unless overridden' });
      pv = c.div(ONE.plus(r).pow(n));
      working = `${fmt(c)} ÷ (1 + ${r.toFixed()})^${n.toFixed()}`;
    } else {
      const d = superDeflators(ctx, input.calculation_date, input.wage_inflation, input.cpi_inflation);
      const toRet = input.years_until_retirement === undefined ? n : dec(Math.min(input.years_until_retirement, input.years_until_payment));
      const after = n.minus(toRet);
      pv = presentValueSuper(c, toRet, after, d);
      working = `${fmt(c)} ÷ ((1 + ${d.wage.toFixed()})^${toRet.toFixed()} × (1 + ${d.cpi.toFixed()})^${after.toFixed()})`;
    }
    const out = cents(pv, 'half_up');
    ctx.step({ key: 'projection.pv', label: 'Present value', value: money(out), working, ruleId: input.basis === 'generic' ? RULE_PV_GENERIC.id : RULE_PV_SUPER.id });
    return { present_value: money(out) };
  },
});
