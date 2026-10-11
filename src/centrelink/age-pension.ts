import { z } from 'zod';
import { defineCalculator, type RuleMeta } from '../core/calculator.js';
import type { CalcContext } from '../core/context.js';
import { block } from '../core/errors.js';
import { cents, dec, max, min, money, ONE, ZERO, type Dec } from '../core/decimal.js';
import { ageOn, type IsoDate } from '../core/dates.js';
import { amount, isoDate } from '../core/inputs.js';
import { deemedIncome, RULE_DEEMING } from './deeming.js';
import { fmt } from '../tax/scale.js';

export const RULE_AGE_PENSION: RuleMeta = {
  id: 'au.centrelink.age_pension_rate',
  version: '1.0.0',
  legalReference: 'Social Security Act 1991 s1064 Pension Rate Calculator A (Modules A, B, E, G); SS(Administration) Act 1999 s54 (instalment rounding)',
};
export const RULE_WORK_BONUS: RuleMeta = {
  id: 'au.centrelink.work_bonus',
  version: '1.0.0',
  legalReference: 'Social Security Act 1991 ss1073AA, 1073AB',
};

export type Relationship = 'single' | 'couple' | 'illness_separated';

export interface AgePensionInput {
  date: IsoDate;
  relationship: Relationship;
  homeowner: boolean;
  /** Assessable assets excluding the principal home (combined for couples). */
  assets: Dec;
  /** Financial assets subject to deeming (combined for couples). */
  financialAssets: Dec;
  /** Other assessable ordinary income per fortnight, excluding employment income (combined). */
  otherIncomeFn: Dec;
  /** Employment income per fortnight for each pensioner (1 entry single, up to 2 for couples). */
  employmentIncomeFn: Dec[];
  /** Work Bonus balances available (same order as employment income). */
  workBonusBalances: Dec[];
  /** Whether each person (same order) is a pensioner eligible for the Work Bonus. */
  workBonusEligible: boolean[];
  /** Number of partners receiving Age Pension (1 for single). */
  recipients: number;
}

export interface AgePensionOutput {
  maxRateFn: Dec;
  maxRateAnnual: Dec;
  deemedIncomeAnnual: Dec;
  assessableIncomeFnPerPerson: Dec;
  incomeTestRateFn: Dec;
  assetsTestRateFn: Dec;
  rateFnPerPerson: Dec;
  rateFnTotal: Dec;
  bindingTest: 'income' | 'assets' | 'neither';
  incomeCutOffFn: Dec;
  assetsCutOff: Dec;
}

/** Instalment rounding: nearest cent (half up); more than nil but less than $1 is paid as $1. */
export function instalment(annual: Dec): Dec {
  const fn = cents(annual.div(26), 'half_up');
  if (annual.gt(0) && fn.lt(1)) return ONE;
  return fn;
}

/**
 * Age Pension rate, legislative annual method (Pension Rate Calculator A):
 *   MPR (annual) = (basic + pension supplement + energy supplement) × 26 per person
 *   income: per-person income = total (single) or combined ÷ 2 (couples, 1064-E2);
 *           reduction = 0.5 × max(0, income − free area)                       (1064-E10)
 *   assets: per-person assets = total (single) or combined ÷ 2 (couples, 1064-G2);
 *           per-person limit = single limit, or couple combined limit ÷ 2;
 *           reduction = floor(excess ÷ 250) × 19.50                             (1064-G4, G7)
 *   rate = lower of the income-reduced and assets-reduced rates, not below nil; daily rate =
 *   annual ÷ 364, so a fortnight = annual ÷ 26, paid rounded to the cent with a $1 minimum.
 * Illness-separated couples: single maximum rate, couple income and assets rules.
 */
export function agePensionRate(ctx: CalcContext, inp: AgePensionInput): AgePensionOutput {
  const d = inp.date;
  const rates = ctx.table('centrelink.age_pension_max_rates', d);
  const singleRate = inp.relationship !== 'couple';
  const p = singleRate ? 'single' : 'couple';
  const maxFn = rates[`${p}_basic`]!.plus(rates[`${p}_pension_supplement`]!).plus(rates[`${p}_energy_supplement`]!);
  const mpr = maxFn.mul(26);
  ctx.step({
    key: 'centrelink.max_rate',
    label: `Maximum rate per person (${singleRate ? 'single rate' : 'couple rate each'})`,
    value: money(maxFn),
    working: `basic ${fmt(rates[`${p}_basic`]!)} + pension supplement ${fmt(rates[`${p}_pension_supplement`]!)} + energy supplement ${fmt(rates[`${p}_energy_supplement`]!)} per fortnight; ${fmt(mpr)} per year`,
    ruleId: RULE_AGE_PENSION.id,
  });

  const persons = inp.relationship === 'single' ? 1 : 2;

  // ---- income test
  const it = ctx.table('centrelink.income_test', d);
  const freeArea = inp.relationship === 'single' ? it.single_free_area_pa! : it.couple_free_area_each_pa!;
  const deemed = deemedIncome(ctx, d, inp.financialAssets, inp.relationship === 'single' ? 'single' : 'pensioner_couple');

  let employmentAssessedFn = ZERO;
  if (inp.employmentIncomeFn.some((e) => e.gt(0))) {
    const wb = ctx.table('centrelink.work_bonus', d);
    inp.employmentIncomeFn.forEach((e, i) => {
      const eligible = inp.workBonusEligible[i] ?? false;
      const afterConcession = eligible ? max(0, e.minus(wb.fortnightly!)) : e;
      const balance = eligible ? min(inp.workBonusBalances[i] ?? ZERO, wb.max_balance!) : ZERO;
      const assessed = max(0, afterConcession.minus(balance));
      employmentAssessedFn = employmentAssessedFn.plus(assessed);
      ctx.step({
        key: `centrelink.work_bonus.${i + 1}`,
        label: `Work Bonus — pensioner ${i + 1}`,
        value: money(cents(assessed, 'half_up')),
        working: eligible
          ? `employment income ${fmt(e)} − concession ${fmt(wb.fortnightly!)} − balance used ${fmt(min(balance, afterConcession))} per fortnight`
          : `employment income ${fmt(e)} assessed in full (not of Age Pension age, so no Work Bonus)`,
        ruleId: RULE_WORK_BONUS.id,
      });
    });
  }
  const totalIncomeAnnual = deemed.annual.plus(inp.otherIncomeFn.mul(26)).plus(employmentAssessedFn.mul(26));
  const personIncome = totalIncomeAnnual.div(persons);
  const incomeExcess = max(0, personIncome.minus(freeArea));
  const incomeReduction = it.taper!.mul(incomeExcess);
  const incomeRate = max(0, mpr.minus(incomeReduction));
  ctx.step({
    key: 'centrelink.income_test',
    label: 'Income test (per person, per year)',
    value: money(cents(incomeRate, 'half_up')),
    working: `income ${fmt(cents(personIncome, 'half_up'))} (deemed ${fmt(cents(deemed.annual, 'half_up'))} + other + assessed employment${persons === 2 ? ', halved' : ''}); excess over free area ${fmt(freeArea)} = ${fmt(cents(incomeExcess, 'half_up'))}; reduction ${it.taper!.toFixed()} × excess = ${fmt(cents(incomeReduction, 'half_up'))}`,
    ruleId: RULE_AGE_PENSION.id,
  });

  // ---- assets test
  const at = ctx.table('centrelink.assets_test', d);
  const limitKey = `${inp.relationship === 'single' ? 'single' : 'couple'}_${inp.homeowner ? 'homeowner' : 'non_homeowner'}`;
  const limitPerPerson = at[limitKey]!.div(persons);
  const personAssets = inp.assets.div(persons);
  const excess = max(0, personAssets.minus(limitPerPerson));
  const units = excess.div(at.unit!).floor();
  const assetsReduction = units.mul(at.reduction_per_unit_pa!);
  const assetsRate = max(0, mpr.minus(assetsReduction));
  ctx.step({
    key: 'centrelink.assets_test',
    label: 'Assets test (per person, per year)',
    value: money(cents(assetsRate, 'half_up')),
    working: `assets ${fmt(personAssets)} vs limit ${fmt(limitPerPerson)}; complete $${at.unit!.toFixed()} units of excess = ${units.toFixed()}; reduction ${units.toFixed()} × ${at.reduction_per_unit_pa!.toFixed(2)} = ${fmt(assetsReduction)}`,
    ruleId: RULE_AGE_PENSION.id,
  });

  const annual = min(incomeRate, assetsRate);
  const binding: AgePensionOutput['bindingTest'] = annual.eq(mpr) ? 'neither' : incomeRate.lte(assetsRate) ? 'income' : 'assets';
  const perPerson = instalment(annual);
  const total = perPerson.mul(inp.recipients);
  ctx.step({
    key: 'centrelink.rate',
    label: 'Age Pension per fortnight (per recipient)',
    value: money(perPerson),
    working: `lower of income-test and assets-test rates (${binding === 'neither' ? 'maximum rate' : `${binding} test applies`}); annual ÷ 26, rounded to the cent ($1 minimum)`,
    ruleId: RULE_AGE_PENSION.id,
  });

  // Published-style cut-offs (identities): income at which the rate is nil; smallest assets with a nil rate.
  const incomeCutOffFn = freeArea.plus(mpr.div(it.taper!)).mul(persons).div(26);
  const unitsForNil = mpr.div(at.reduction_per_unit_pa!).ceil();
  const assetsCutOff = limitPerPerson.plus(unitsForNil.mul(at.unit!)).mul(persons);

  return {
    maxRateFn: maxFn,
    maxRateAnnual: mpr,
    deemedIncomeAnnual: deemed.annual,
    assessableIncomeFnPerPerson: personIncome.div(26),
    incomeTestRateFn: cents(incomeRate.div(26), 'half_up'),
    assetsTestRateFn: cents(assetsRate.div(26), 'half_up'),
    rateFnPerPerson: perPerson,
    rateFnTotal: total,
    bindingTest: binding,
    incomeCutOffFn: cents(incomeCutOffFn, 'half_up'),
    assetsCutOff,
  };
}

const Input = z
  .object({
    assessment_date: isoDate('Assessment date (selects rates: 20 Mar / 20 Sep; limits: 1 Jul)'),
    relationship: z.enum(['single', 'couple', 'illness_separated']).describe('single; couple living together; couple separated by illness'),
    homeowner: z.boolean().describe('Owns the principal home'),
    dates_of_birth: z.array(isoDate('Date of birth')).min(1).max(2).describe('Date of birth of the person (single) or of each partner (couples)'),
    assessable_assets: amount('Assessable assets excluding the principal home (AUD); combined for couples, including financial assets'),
    financial_assets: amount('Financial assets subject to deeming (AUD); combined for couples (part of assessable assets)'),
    other_income_fortnightly: amount('Other assessable income per fortnight excluding employment income and deemed income (AUD); combined for couples').default('0'),
    employment_income_fortnightly: z.array(amount('Employment income per fortnight (AUD)')).max(2).default([]).describe('Employment income per fortnight for each person, in the same order as dates_of_birth (Work Bonus applies only to those of Age Pension age)'),
    work_bonus_balances: z.array(amount('Work Bonus balance (AUD)')).max(2).default([]).describe('Accrued Work Bonus balance for each pensioner'),
    transitional_rate: z.boolean().default(false).describe('Transitional-rate pensioner (pre-20 Sep 2009 rules)'),
  })
  .refine((v) => (v.relationship === 'single' ? v.dates_of_birth.length === 1 : v.dates_of_birth.length === 2), {
    message: 'single requires one date of birth; couples require two',
    path: ['dates_of_birth'],
  })
  .refine((v) => Number(v.financial_assets) <= Number(v.assessable_assets), {
    message: 'financial assets are part of assessable assets and cannot exceed them',
    path: ['financial_assets'],
  });

export const agePensionCalculator = defineCalculator({
  id: 'centrelink.age_pension',
  title: 'Age Pension rate (income and assets tests)',
  domain: 'centrelink',
  summary: 'Age Pension per fortnight under the income test (with deeming and Work Bonus) and the assets test, taking the lower rate, per Pension Rate Calculator A.',
  input: Input,
  rules: [RULE_AGE_PENSION, RULE_DEEMING, RULE_WORK_BONUS],
  limitations: [
    'Residence requirements are assumed met; age eligibility is checked from dates of birth (each partner aged 67+ is treated as a recipient).',
    'Transitional-rate pensioners, rent assistance, pharmaceutical allowance, overseas portability and special income rules (business, farms, private trusts/companies, lifetime income streams, gifting deprivation) are not modelled — assessable amounts must be supplied.',
    'Work Bonus balance accrual over time is not modelled; the balance supplied is applied to the fortnight.',
    'A couple where the partner receives a different pension is treated as an Age Pension couple.',
  ],
  example: {
    assessment_date: '2026-10-11',
    relationship: 'single',
    homeowner: true,
    dates_of_birth: ['1955-04-01'],
    assessable_assets: 433000,
    financial_assets: 150000,
    other_income_fortnightly: 0,
  },
  run(input, ctx) {
    if (input.transitional_rate) {
      block({ code: 'OUT_OF_SCOPE', message: 'Transitional-rate pensioner rules are not modelled.', ruleId: RULE_AGE_PENSION.id });
    }
    const apAge = ctx.scalar('centrelink.age_pension_age', input.assessment_date).toNumber();
    const ages = input.dates_of_birth.map((dob) => ageOn(dob, input.assessment_date));
    const recipients = ages.filter((a) => a >= apAge).length;
    ctx.step({ key: 'centrelink.eligibility', label: 'Age Pension age check', value: `${recipients} of ${ages.length} eligible`, working: `ages ${ages.join(', ')} vs Age Pension age ${apAge}`, ruleId: RULE_AGE_PENSION.id });
    if (recipients === 0) {
      ctx.warn(`No-one has reached Age Pension age (${apAge}); rates shown are what would apply at that age with the same means.`);
    }
    ctx.assume({ key: 'residence', label: 'Residence requirements met', value: 'true', source: 'default', basis: 'Not assessed by the engine' });
    const out = agePensionRate(ctx, {
      date: input.assessment_date,
      relationship: input.relationship,
      homeowner: input.homeowner,
      assets: dec(input.assessable_assets),
      financialAssets: dec(input.financial_assets),
      otherIncomeFn: dec(input.other_income_fortnightly),
      employmentIncomeFn: input.employment_income_fortnightly.map((x) => dec(x)),
      workBonusBalances: input.work_bonus_balances.map((x) => dec(x)),
      workBonusEligible: ages.map((a) => a >= apAge),
      recipients: Math.max(recipients, 1),
    });
    return {
      eligible_recipients: recipients,
      max_rate_fortnightly_per_person: money(out.maxRateFn),
      deemed_income_annual: money(cents(out.deemedIncomeAnnual, 'half_up')),
      assessable_income_fortnightly_per_person: money(cents(out.assessableIncomeFnPerPerson, 'half_up')),
      income_test_rate_fortnightly: money(out.incomeTestRateFn),
      assets_test_rate_fortnightly: money(out.assetsTestRateFn),
      binding_test: out.bindingTest,
      rate_fortnightly_per_person: money(out.rateFnPerPerson),
      rate_fortnightly_total: money(recipients === 0 ? ZERO : out.rateFnTotal),
      rate_annual_total: money(recipients === 0 ? ZERO : out.rateFnTotal.mul(26)),
      income_cut_off_fortnightly: money(out.incomeCutOffFn),
      assets_cut_off: money(out.assetsCutOff),
    };
  },
});
