import { z } from 'zod';
import { defineCalculator, type RuleMeta } from '../core/calculator.js';
import type { CalcContext } from '../core/context.js';
import { cents, dec, money, toJson, type Dec } from '../core/decimal.js';
import { fyStart } from '../core/dates.js';
import { amount, financialYear } from '../core/inputs.js';
import { fmt, marginalTax } from './scale.js';

export const RULE_RESIDENT_SCALE: RuleMeta = {
  id: 'au.tax.resident_scale',
  version: '1.0.0',
  legalReference: 'Income Tax Rates Act 1986 s12, Sch 7 Pt I',
};
export const RULE_FOREIGN_SCALE: RuleMeta = {
  id: 'au.tax.foreign_resident_scale',
  version: '1.0.0',
  legalReference: 'Income Tax Rates Act 1986 s12, Sch 7 Pt II',
};

export type Residency = 'resident' | 'foreign';

/**
 * Tax on taxable income from the FY scale (no offsets, no Medicare levy).
 * Rounding: result rounded to cents, half-up (engine convention; with whole-dollar taxable income
 * and whole-cent rates the result is already exact to the cent).
 */
export function incomeTaxOnTaxableIncome(ctx: CalcContext, fy: string, taxableIncome: Dec, residency: Residency): { tax: Dec; marginalRate: Dec } {
  const name = residency === 'resident' ? 'tax.resident_scale' : 'tax.foreign_resident_scale';
  const rule = residency === 'resident' ? RULE_RESIDENT_SCALE : RULE_FOREIGN_SCALE;
  const brackets = ctx.brackets(name, fyStart(fy));
  const { tax, bands, marginalRate } = marginalTax(brackets, taxableIncome);
  const working = bands
    .filter((b) => b.taxable.gt(0) && b.rate.gt(0))
    .map((b) => `${b.rate.mul(100).toFixed()}% × ${fmt(b.taxable)}`)
    .join(' + ');
  const rounded = cents(tax, 'half_up');
  ctx.step({
    key: 'tax.income_tax',
    label: `Income tax on taxable income (${residency === 'resident' ? 'resident' : 'foreign resident'} scale ${fy})`,
    value: money(rounded),
    working: working || 'nil (within tax-free threshold)',
    ruleId: rule.id,
    parameters: [`${name}@${fyStart(fy)}`],
  });
  return { tax: rounded, marginalRate };
}

const Input = z.object({
  financial_year: financialYear(),
  taxable_income: amount('Taxable income for the full financial year (AUD)'),
  residency: z.enum(['resident', 'foreign']).default('resident').describe('Tax residency for the full year'),
});

export const incomeTaxCalculator = defineCalculator({
  id: 'tax.income_tax',
  title: 'Income tax on taxable income',
  domain: 'tax',
  summary: 'Tax on taxable income from the resident or foreign-resident scale for a financial year, before offsets and the Medicare levy.',
  input: Input,
  rules: [RULE_RESIDENT_SCALE, RULE_FOREIGN_SCALE],
  limitations: [
    'Full-year residents with the full tax-free threshold only; part-year residents (pro-rated threshold) are not modelled.',
    'Excludes offsets, Medicare levy, Medicare levy surcharge and study-loan repayments (see tax.personal_tax).',
    'Minors’ unearned income, working holiday maker rates and special professional averaging are not modelled.',
  ],
  example: { financial_year: '2026-27', taxable_income: 100000, residency: 'resident' },
  run(input, ctx) {
    const ti = dec(input.taxable_income);
    if (!ti.isInteger()) {
      ctx.warn('Taxable income includes cents; the ATO calculates tax on whole-dollar taxable income.');
    }
    const { tax, marginalRate } = incomeTaxOnTaxableIncome(ctx, input.financial_year, ti, input.residency);
    const avg = ti.gt(0) ? tax.div(ti) : dec(0);
    return {
      income_tax: money(tax),
      marginal_rate: toJson(marginalRate),
      average_rate: toJson(avg.toDecimalPlaces(6)),
    };
  },
});
