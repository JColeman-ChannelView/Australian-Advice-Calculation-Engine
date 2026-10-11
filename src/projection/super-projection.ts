import { z } from 'zod';
import { defineCalculator, type RuleMeta } from '../core/calculator.js';
import type { CalcContext } from '../core/context.js';
import { cents, dec, max, min, money, ONE, roundToIncrement, toJson, ZERO, type Dec } from '../core/decimal.js';
import { ageOn, financialYearOf, fyLabel, fyStart, parts } from '../core/dates.js';
import { amount, isoDate, rate } from '../core/inputs.js';
import { presentValueSuper, superDeflators, RULE_PV_SUPER } from './present-value.js';
import { minimumFactor, preservationAge, RULE_MIN_PENSION } from '../super/pension.js';
import { fmt } from '../tax/scale.js';

export const RULE_PROJECTION: RuleMeta = {
  id: 'au.projection.super_deterministic',
  version: '1.0.0',
  legalReference: 'Engine method (deterministic annual steps); defaults per ASIC Instrument 2022/603 s4; minimum drawdown SISR Sch 7',
};

const Input = z.object({
  calculation_date: isoDate('Date of the calculation (today); year 0 starts here'),
  date_of_birth: isoDate('Member date of birth'),
  current_balance: amount('Current super balance (AUD)'),
  salary: amount('Current gross annual salary (ordinary time / qualifying earnings) (AUD)').default('0'),
  salary_growth: rate('Nominal salary growth p.a. (default: the wage deflator)').optional(),
  employer_contribution_rate: rate('Employer contribution rate (default: the super guarantee rate for each year)').optional(),
  salary_sacrifice: amount('Additional concessional contributions p.a., nominal (AUD)').default('0'),
  non_concessional: amount('Personal after-tax contributions p.a., nominal (AUD)').default('0'),
  return_accumulation: rate('Investment return p.a. before retirement, net of investment fees and tax (no ASIC default exists — required)'),
  return_retirement: rate('Investment return p.a. in retirement phase, net of investment fees (required)'),
  admin_fee_fixed: amount('Dollar administration fee p.a. in today’s dollars, indexed with wage inflation (AUD)').default('0'),
  admin_fee_percent: rate('Percentage administration fee p.a. on the balance').default('0'),
  insurance_premium: amount('Insurance premium p.a. in today’s dollars until retirement, indexed with CPI (AUD)').default('0'),
  retirement_age: z.number().int().min(50).max(80).optional().describe('Retirement age (default per Instrument 2022/603: 67, or age next birthday if 67 or over)'),
  already_retired: z.boolean().default(false).describe('Member is already in retirement phase (2022/603: assumed retirement age is the current age)'),
  retirement_income: amount('Target retirement income p.a. in today’s dollars (0 = minimum drawdown only) (AUD)').default('0'),
  end_age: z.number().int().min(60).max(110).optional().describe('Last age modelled (default: assumed drawdown period, to age 92 or 5 years after retirement if later)'),
  wage_inflation: rate('Override the wage deflator').optional(),
  cpi_inflation: rate('Override the CPI deflator').optional(),
});

interface Row {
  year: number;
  financial_year: string;
  age: number;
  phase: 'accumulation' | 'retirement';
  opening_balance: string;
  contributions_net: string;
  fees_and_insurance: string;
  withdrawals: string;
  minimum_drawdown: string;
  earnings: string;
  closing_balance: string;
  closing_balance_today_dollars: string;
}

export const superProjectionCalculator = defineCalculator({
  id: 'projection.super',
  title: 'Superannuation and retirement projection',
  domain: 'projection',
  summary:
    'Deterministic year-by-year projection of a super balance to retirement and through account-based pension drawdown, shown in nominal and today’s dollars using the ASIC 2022/603 deflators.',
  input: Input,
  rules: [RULE_PROJECTION, RULE_PV_SUPER, RULE_MIN_PENSION],
  limitations: [
    'Deterministic: one assumed return path; no sequencing or longevity risk. Not a forecast or advice.',
    'Contribution and fee cash flows occur mid-year (MoneySmart convention); percentage fees apply to the mid-year balance.',
    'Excludes Age Pension, other income, tax on retirement income, transfer balance cap limits (warned only), contribution caps (warned only), and Division 293/296.',
    'Future legislative parameters are held at today’s values except the SG rate schedule; minimum drawdown uses current factors.',
    'Instrument 2022/603 defaults end 30 June 2027; later calculation dates need user-supplied inflation rates.',
  ],
  example: {
    calculation_date: '2026-10-11',
    date_of_birth: '1980-06-15',
    current_balance: 150000,
    salary: 95000,
    return_accumulation: 0.061,
    return_retirement: 0.067,
    admin_fee_fixed: 78,
    admin_fee_percent: 0.002,
    retirement_income: 50000,
  },
  run(input, ctx) {
    const calcDate = input.calculation_date;
    const defl = superDeflators(ctx, calcDate, input.wage_inflation, input.cpi_inflation);
    const age0 = ageOn(input.date_of_birth, calcDate);
    // Assumed retirement age (2022/603 s4): user age floored at preservation age; otherwise 67, or
    // age next birthday if already 67+. ASIC defaults are read only when the user omits the input,
    // so a calculation dated after the instrument's repeal still runs with user-supplied values.
    let retAge: number;
    if (input.already_retired) {
      retAge = age0;
      ctx.assume({ key: 'retirement_age', label: 'Retirement age', value: String(retAge), source: 'user', basis: 'already in retirement phase — current age (ASIC 2022/603 "assumed retirement age")' });
    } else if (input.retirement_age !== undefined) {
      const pres = preservationAge(ctx, input.date_of_birth, calcDate);
      retAge = Math.max(input.retirement_age, pres);
      if (retAge !== input.retirement_age) ctx.warn(`Retirement age ${input.retirement_age} is below preservation age ${pres}; ${pres} is used.`);
      ctx.assume({ key: 'retirement_age', label: 'Retirement age', value: String(retAge), source: 'user', basis: 'user input, not less than preservation age' });
    } else {
      const defaultRetAge = ctx.scalar('projection.asic_super.retirement_age', calcDate).toNumber();
      retAge = age0 < defaultRetAge ? defaultRetAge : age0 + 1;
      ctx.assume({ key: 'retirement_age', label: 'Retirement age', value: String(retAge), source: 'default', basis: 'ASIC 2022/603 "assumed retirement age"' });
    }
    const yearsToRet = Math.max(0, retAge - age0);
    let endAge: number;
    if (input.end_age !== undefined) {
      endAge = input.end_age;
      ctx.assume({ key: 'end_age', label: 'Projection end age', value: String(endAge), source: 'user' });
    } else {
      const dd = ctx.table('projection.asic_super.drawdown_end_age', calcDate);
      endAge = Math.max(dd.end_age!.toNumber(), Math.max(retAge, age0) + dd.min_years!.toNumber());
      ctx.assume({ key: 'end_age', label: 'Projection end age', value: String(endAge), source: 'default', basis: 'ASIC 2022/603 "assumed drawdown period"' });
    }
    const g = input.salary_growth !== undefined ? dec(input.salary_growth) : defl.wage;
    ctx.assume({ key: 'salary_growth', label: 'Salary growth', value: toJson(g), source: input.salary_growth !== undefined ? 'user' : 'default', basis: 'Defaults to the wage deflator' });
    for (const [k, label, v] of [
      ['return_accumulation', 'Return before retirement (net of fees and tax)', input.return_accumulation],
      ['return_retirement', 'Return in retirement (net of fees)', input.return_retirement],
    ] as const) {
      ctx.assume({ key: k, label, value: v, source: 'user' });
    }
    const contribTax = ctx.scalar('super.contributions_tax_rate', calcDate);
    // Used only for warnings; if not published for the calculation year, the checks are skipped.
    const ccCapNow = ctx.optionalScalar('super.concessional_cap', fyStart(financialYearOf(calcDate)));
    const tbcNow = ctx.optionalScalar('super.transfer_balance_cap', fyStart(financialYearOf(calcDate)));
    if (!ccCapNow || !tbcNow) ctx.warn('Concessional cap or transfer balance cap not published for the calculation year; cap warnings are skipped.');
    const half = dec('0.5');
    const pct = dec(input.admin_fee_percent);
    const rows: Row[] = [];
    let bal = dec(input.current_balance);
    let retirementBalance: Dec | null = yearsToRet === 0 ? bal : null;
    let exhaustedAge: number | null = null;
    const startFyYear = parts(calcDate).m >= 7 ? parts(calcDate).y : parts(calcDate).y - 1;

    for (let t = 0; age0 + t <= endAge; t++) {
      const age = age0 + t;
      const retired = age >= retAge;
      const fy = fyLabel(startFyYear + t);
      const opening = bal;
      const r = dec(retired ? input.return_retirement : input.return_accumulation);
      const wageIdx = ONE.plus(defl.wage).pow(t);
      const cpiIdx = ONE.plus(defl.cpi).pow(t);
      let contributions = ZERO;
      let withdrawals = ZERO;
      let minimum = ZERO;
      const fixedFees = dec(input.admin_fee_fixed).mul(wageIdx);
      const insurance = retired ? ZERO : dec(input.insurance_premium).mul(cpiIdx);

      if (!retired) {
        const salaryT = dec(input.salary).mul(ONE.plus(g).pow(t));
        const sgRate = input.employer_contribution_rate !== undefined ? dec(input.employer_contribution_rate) : ctx.scalar('super.sg_rate', fyStart(fy));
        const concessional = salaryT.mul(sgRate).plus(dec(input.salary_sacrifice));
        if (ccCapNow && concessional.gt(ccCapNow.mul(wageIdx))) {
          ctx.warn(`Concessional contributions in ${fy} (${fmt(cents(concessional))}) may exceed the concessional cap (cap indexation not projected).`);
        }
        contributions = concessional.mul(ONE.minus(contribTax)).plus(dec(input.non_concessional));
      } else {
        // Drawdown: target in today's dollars → nominal using the same deflators; at least the SISR minimum.
        const yearsAfter = t - yearsToRet;
        const target = dec(input.retirement_income).mul(ONE.plus(defl.wage).pow(yearsToRet)).mul(ONE.plus(defl.cpi).pow(yearsAfter));
        // SISR Sch 7: factor by age on 1 July of the year.
        const ageAtJuly = ageOn(input.date_of_birth, fyStart(fy));
        minimum = opening.gt(0) ? roundToIncrement(opening.mul(minimumFactor(ctx, ageAtJuly, fyStart(fy))), 10, 'half_up') : ZERO;
        withdrawals = min(max(target, minimum), opening.gt(0) ? opening.mul(ONE.plus(r).pow(half)) : ZERO);
      }
      // Mid-year flows; percentage fee on the mid-year balance.
      const growthHalf = ONE.plus(r).pow(half);
      const midBefore = opening.mul(growthHalf).plus(contributions).minus(fixedFees).minus(insurance).minus(withdrawals);
      const mid = max(0, midBefore);
      const pctFee = mid.mul(pct);
      const closing = max(0, mid.minus(pctFee).mul(growthHalf));
      const earnings = closing.minus(opening).minus(contributions).plus(fixedFees).plus(insurance).plus(pctFee).plus(withdrawals);
      bal = closing;
      if (!retired && age + 1 >= retAge && retirementBalance === null) retirementBalance = closing;
      if (retired && closing.eq(0) && exhaustedAge === null) exhaustedAge = age;

      const yearsElapsed = t + 1; // closing balance is at the end of year t
      const before = dec(Math.min(yearsElapsed, yearsToRet));
      const after = dec(Math.max(0, yearsElapsed - yearsToRet));
      rows.push({
        year: t,
        financial_year: fy,
        age,
        phase: retired ? 'retirement' : 'accumulation',
        opening_balance: money(cents(opening)),
        contributions_net: money(cents(contributions)),
        fees_and_insurance: money(cents(fixedFees.plus(insurance).plus(pctFee))),
        withdrawals: money(cents(withdrawals)),
        minimum_drawdown: money(cents(minimum)),
        earnings: money(cents(earnings)),
        closing_balance: money(cents(closing)),
        closing_balance_today_dollars: money(cents(presentValueSuper(closing, before, after, defl))),
      });
    }
    const retBal = retirementBalance ?? bal;
    if (tbcNow && retBal.gt(tbcNow.mul(ONE.plus(defl.cpi).pow(yearsToRet)))) {
      ctx.warn('Projected retirement balance exceeds the transfer balance cap (indexed at CPI); amounts above the cap could not be moved to retirement phase.');
    }
    const retBalPv = presentValueSuper(retBal, dec(yearsToRet), ZERO, defl);
    ctx.step({ key: 'projection.retirement_balance', label: `Balance at retirement (age ${retAge})`, value: money(cents(retBal)), working: `today's dollars ${fmt(cents(retBalPv))}`, ruleId: RULE_PROJECTION.id });
    if (exhaustedAge !== null) ctx.step({ key: 'projection.exhausted', label: 'Balance exhausted', value: `age ${exhaustedAge}`, ruleId: RULE_PROJECTION.id });
    return {
      retirement_age: retAge,
      end_age: endAge,
      balance_at_retirement: money(cents(retBal)),
      balance_at_retirement_today_dollars: money(cents(retBalPv)),
      balance_exhausted_at_age: exhaustedAge,
      final_balance: money(cents(bal)),
      rows,
    };
  },
});
