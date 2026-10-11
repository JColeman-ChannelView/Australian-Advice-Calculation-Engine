import { z } from 'zod';
import { defineCalculator, type RuleMeta } from '../core/calculator.js';
import type { CalcContext } from '../core/context.js';
import { dec, money, roundToIncrement, toJson, ZERO, type Dec } from '../core/decimal.js';
import { ageOn, cmp, daysInclusive, daysInFy, fyEnd, fyStart, isIsoDate, parts, type IsoDate } from '../core/dates.js';
import { amount, financialYear, isoDate } from '../core/inputs.js';
import { block } from '../core/errors.js';
import { fmt } from '../tax/scale.js';

export const RULE_PRESERVATION: RuleMeta = {
  id: 'au.super.preservation_age',
  version: '1.0.0',
  legalReference: 'Superannuation Industry (Supervision) Regulations 1994 reg 6.01(2)',
};
export const RULE_MIN_PENSION: RuleMeta = {
  id: 'au.super.minimum_pension',
  version: '1.0.0',
  legalReference: 'Superannuation Industry (Supervision) Regulations 1994 Sch 7 cl 1, 3, 4, 4A, 5',
};

export function preservationAge(ctx: CalcContext, dob: IsoDate, at: IsoDate): number {
  const bands = ctx.dateBands('super.preservation_age', at);
  let age: Dec | undefined;
  for (const b of bands) if (cmp(dob, b.from) >= 0) age = b.value;
  if (!age) block({ code: 'OUT_OF_SCOPE', message: `No preservation age band covers date of birth ${dob}.`, parameter: 'super.preservation_age' });
  return age.toNumber();
}

export function minimumFactor(ctx: CalcContext, age: number, at: IsoDate): Dec {
  let factor: Dec | undefined;
  for (const b of ctx.bands('super.minimum_pension_factors', at)) if (dec(age).gte(b.from)) factor = b.value;
  if (!factor) block({ code: 'PARAMETER_MISSING', message: `No minimum pension factor for age ${age}`, parameter: 'super.minimum_pension_factors' });
  return factor;
}

/**
 * Minimum annual payment for an account-based pension (SISR Sch 7):
 *   amount = balance × factor(age) [× days from commencement to 30 June ÷ days in FY, commencement year]
 *            × temporary reduction (2019-20..2022-23: 50%)
 *   rounded to the nearest $10, an exact $5 rounding up (cl 5).
 * No payment is required if the pension commences on or after 1 June (cl 4).
 */
export function minimumPension(ctx: CalcContext, fy: string, dob: IsoDate, balance: Dec, commencement?: IsoDate): { amount: Dec; factor: Dec; age: number; proRata: Dec | null } {
  const start = fyStart(fy);
  const end = fyEnd(fy);
  // A pension that commenced on or before 1 July is a full year (balance and age at 1 July).
  const commenced = commencement && cmp(commencement, start) > 0 ? commencement : undefined;
  if (commenced && cmp(commenced, end) > 0) {
    block({ code: 'OUT_OF_SCOPE', message: `Commencement date ${commenced} is after the end of ${fy}.` });
  }
  const ageDate = commenced ?? start;
  const age = ageOn(dob, ageDate);
  const factor = minimumFactor(ctx, age, start);
  const reduction = ctx.scalar('super.minimum_pension_reduction', start);

  if (commenced) {
    const { m, d } = parts(commenced);
    if (m === 6 && d >= 1) {
      ctx.step({ key: 'super.min_pension', label: `Minimum pension ${fy}`, value: '0.00', working: `commenced ${commenced}, on or after 1 June: no payment required (Sch 7 cl 4)`, ruleId: RULE_MIN_PENSION.id });
      return { amount: ZERO, factor, age, proRata: null };
    }
  }
  let raw = balance.mul(factor);
  let working = `${fmt(balance)} × ${factor.mul(100).toFixed()}% (age ${age} on ${ageDate})`;
  let proRata: Dec | null = null;
  if (commenced) {
    const days = daysInclusive(commenced, end);
    const total = daysInFy(fy);
    proRata = dec(days).div(total);
    raw = raw.mul(days).div(total);
    working += ` × ${days}/${total} days`;
  }
  if (!reduction.eq(1)) {
    raw = raw.mul(reduction);
    working += ` × ${reduction.toFixed()} (temporary reduction)`;
  }
  const result = roundToIncrement(raw, 10, 'half_up');
  working += ` = ${raw.toDecimalPlaces(4).toFixed()} → nearest $10`;
  ctx.step({ key: 'super.min_pension', label: `Minimum annual pension payment ${fy}`, value: money(result), working, ruleId: RULE_MIN_PENSION.id });
  return { amount: result, factor, age, proRata };
}

const PresInput = z.object({
  date_of_birth: isoDate('Date of birth'),
});

export const preservationAgeCalculator = defineCalculator({
  id: 'super.preservation_age',
  title: 'Preservation age',
  domain: 'super',
  summary: 'Preservation age from date of birth and the date it is reached.',
  input: PresInput,
  rules: [RULE_PRESERVATION],
  limitations: ['Conditions of release other than reaching preservation age are not assessed.'],
  example: { date_of_birth: '1962-09-30' },
  run(input, ctx) {
    const age = preservationAge(ctx, input.date_of_birth, '2026-07-01');
    const { y, m, d } = parts(input.date_of_birth);
    const anniversary = `${y + age}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    // A 29 February birthday has no anniversary in a non-leap year; the date is left to the user.
    const reached = isIsoDate(anniversary) ? anniversary : null;
    if (!reached) ctx.warn('Born on 29 February: the date preservation age is reached in a non-leap year is not determined by the engine.');
    ctx.step({ key: 'super.preservation_age', label: 'Preservation age', value: String(age), working: `born ${input.date_of_birth}`, ruleId: RULE_PRESERVATION.id });
    return { preservation_age: age, date_reached: reached };
  },
});

const MinInput = z.object({
  financial_year: financialYear(),
  date_of_birth: isoDate('Date of birth of the pensioner'),
  account_balance: amount('Account balance on 1 July, or on the commencement day if the pension started during the year (AUD)'),
  commencement_date: isoDate('Pension commencement date, if it started during this financial year').optional(),
});

export const minimumPensionCalculator = defineCalculator({
  id: 'super.minimum_pension',
  title: 'Account-based pension minimum annual payment',
  domain: 'super',
  summary: 'Minimum annual payment under SIS Regulations Schedule 7 with age factor, commencement-year pro-rating, temporary reductions and $10 rounding.',
  input: MinInput,
  rules: [RULE_MIN_PENSION],
  limitations: [
    'Uses the account balance supplied; where the withdrawal benefit differs (Sch 7 cl 1(2)(b)), supply that amount.',
    'Market-linked, lifetime and defined benefit pensions are not covered.',
  ],
  example: { financial_year: '2026-27', date_of_birth: '1957-05-20', account_balance: 480000 },
  run(input, ctx) {
    const r = minimumPension(ctx, input.financial_year, input.date_of_birth, dec(input.account_balance), input.commencement_date);
    return {
      minimum_annual_payment: money(r.amount),
      age: r.age,
      percentage_factor: toJson(r.factor),
      pro_rata_fraction: r.proRata ? toJson(r.proRata.toDecimalPlaces(6)) : null,
    };
  },
});
