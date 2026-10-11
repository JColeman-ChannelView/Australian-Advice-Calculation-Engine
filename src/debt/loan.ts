import { z } from 'zod';
import { defineCalculator, type RuleMeta } from '../core/calculator.js';
import { cents, dec, max, min, money, ONE, ZERO, type Dec } from '../core/decimal.js';
import { amount, rate } from '../core/inputs.js';
import { block } from '../core/errors.js';
import { fmt } from '../tax/scale.js';

export const RULE_ANNUITY: RuleMeta = {
  id: 'au.debt.annuity_repayment',
  version: '1.0.0',
  legalReference: 'Mathematics — standard annuity formula; no legislative rule',
};
export const RULE_OFFSET: RuleMeta = {
  id: 'au.debt.offset_amortisation',
  version: '1.0.0',
  legalReference: 'Mathematics — interest on (balance − offset); lender practice varies (daily accrual, monthly charging)',
};

const PERIODS = { monthly: 12, fortnightly: 26, weekly: 52 } as const;
type Frequency = keyof typeof PERIODS;

/** Level repayment PMT = L·i / (1 − (1+i)^−n); i = annual rate ÷ periods per year. Unrounded. */
export function annuityPayment(principal: Dec, annualRate: Dec, years: number, freq: Frequency): Dec {
  const n = years * PERIODS[freq];
  const i = annualRate.div(PERIODS[freq]);
  if (i.eq(0)) return principal.div(n);
  return principal.mul(i).div(ONE.minus(ONE.plus(i).pow(-n)));
}

const RepaymentInput = z.object({
  principal: amount('Loan amount (AUD)'),
  annual_rate: rate('Nominal annual interest rate (e.g. 0.06)'),
  term_years: z.number().int().min(1).max(40).describe('Loan term in years'),
  frequency: z.enum(['monthly', 'fortnightly', 'weekly']).default('monthly'),
  repayment_type: z.enum(['principal_and_interest', 'interest_only']).default('principal_and_interest'),
});

export const repaymentCalculator = defineCalculator({
  id: 'debt.repayment',
  title: 'Loan repayment',
  domain: 'debt',
  summary: 'Level principal-and-interest or interest-only repayment for a loan, with total interest over the term.',
  input: RepaymentInput,
  rules: [RULE_ANNUITY],
  limitations: [
    'Periodic rate = annual rate ÷ periods per year (nominal compounding at the repayment frequency); lenders that accrue daily will differ slightly.',
    'Fees, rate changes and lender-specific rounding are not modelled.',
  ],
  example: { principal: 500000, annual_rate: 0.06, term_years: 30, frequency: 'monthly' },
  run(input, ctx) {
    const p = dec(input.principal);
    const r = dec(input.annual_rate);
    const n = input.term_years * PERIODS[input.frequency];
    let payment: Dec;
    let working: string;
    if (input.repayment_type === 'interest_only') {
      payment = cents(p.mul(r).div(PERIODS[input.frequency]), 'half_up');
      working = `${fmt(p)} × ${r.toFixed()} ÷ ${PERIODS[input.frequency]}`;
    } else {
      payment = cents(annuityPayment(p, r, input.term_years, input.frequency), 'half_up');
      working = `${fmt(p)} × i ÷ (1 − (1 + i)^−${n}), i = ${r.toFixed()} ÷ ${PERIODS[input.frequency]}`;
    }
    const totalPaid = input.repayment_type === 'interest_only' ? payment.mul(n).plus(p) : payment.mul(n);
    ctx.step({ key: 'debt.payment', label: `Repayment (${input.frequency})`, value: money(payment), working, ruleId: RULE_ANNUITY.id });
    return {
      repayment: money(payment),
      number_of_repayments: n,
      total_repayments: money(cents(totalPaid)),
      total_interest: money(cents(totalPaid.minus(p))),
    };
  },
});

const ScheduleInput = z.object({
  principal: amount('Loan balance (AUD)'),
  annual_rate: rate('Nominal annual interest rate'),
  term_years: z.number().int().min(1).max(40).describe('Remaining term in years (sets the minimum repayment)'),
  frequency: z.enum(['monthly', 'fortnightly', 'weekly']).default('monthly'),
  offset_balance: amount('Offset account balance (AUD)').default('0'),
  offset_contribution_per_period: amount('Amount added to the offset each period (AUD)').default('0'),
  extra_repayment_per_period: amount('Extra repayment each period above the minimum (AUD)').default('0'),
  include_schedule: z.boolean().default(false).describe('Return every period (otherwise yearly summary only)'),
});

export const offsetScheduleCalculator = defineCalculator({
  id: 'debt.offset_schedule',
  title: 'Loan amortisation with offset and extra repayments',
  domain: 'debt',
  summary: 'Amortises a loan with interest charged on the balance less the offset account, plus optional extra repayments, and compares interest with a plain loan.',
  input: ScheduleInput,
  rules: [RULE_ANNUITY, RULE_OFFSET],
  limitations: [
    'Interest each period = periodic rate × max(0, balance − offset), charged at the end of the period (lenders typically accrue daily).',
    'Extra repayments are treated as reducing the balance (available redraw is reported but not drawn).',
    'Rate changes, fees and offset-account interest caps are not modelled.',
  ],
  example: { principal: 500000, annual_rate: 0.06, term_years: 30, frequency: 'monthly', offset_balance: 50000 },
  run(input, ctx) {
    const periods = PERIODS[input.frequency];
    const i = dec(input.annual_rate).div(periods);
    const n = input.term_years * periods;
    const p0 = dec(input.principal);
    const minPayment = cents(annuityPayment(p0, dec(input.annual_rate), input.term_years, input.frequency), 'half_up');
    const extra = dec(input.extra_repayment_per_period);
    const simulate = (withOffset: boolean, withExtra: boolean) => {
      let bal = p0;
      let offset = withOffset ? dec(input.offset_balance) : ZERO;
      let interestTotal = ZERO;
      let redraw = ZERO;
      const rows: Array<{ period: number; interest: string; repayment: string; balance: string; offset: string }> = [];
      let k = 0;
      let firstInterest = ZERO;
      for (k = 1; k <= n * 2 && bal.gt(0); k++) {
        const interest = cents(i.mul(max(0, bal.minus(offset))), 'half_up');
        if (k === 1) firstInterest = interest;
        interestTotal = interestTotal.plus(interest);
        const due = bal.plus(interest);
        const pay = min(due, minPayment.plus(withExtra ? extra : ZERO));
        if (withExtra) redraw = redraw.plus(min(extra, max(0, pay.minus(minPayment))));
        bal = due.minus(pay);
        if (withOffset) offset = offset.plus(dec(input.offset_contribution_per_period));
        if (input.include_schedule || k % periods === 0) rows.push({ period: k, interest: money(interest), repayment: money(pay), balance: money(bal), offset: money(offset) });
      }
      if (bal.gt(0)) block({ code: 'OUT_OF_SCOPE', message: 'Loan does not amortise within twice the term with these inputs.' });
      return { periodsToRepay: k - 1, interestTotal, rows, firstInterest, redraw };
    };
    const base = simulate(false, false);
    const withFeatures = simulate(true, true);
    ctx.step({ key: 'debt.first_interest', label: 'First period interest (with offset)', value: money(withFeatures.firstInterest), working: `${i.toFixed()} × max(0, ${fmt(p0)} − ${fmt(dec(input.offset_balance))})`, ruleId: RULE_OFFSET.id });
    ctx.step({ key: 'debt.interest_saved', label: 'Interest saved vs plain loan', value: money(base.interestTotal.minus(withFeatures.interestTotal)), ruleId: RULE_OFFSET.id });
    return {
      minimum_repayment: money(minPayment),
      first_period_interest: money(withFeatures.firstInterest),
      periods_to_repay: withFeatures.periodsToRepay,
      years_to_repay: (withFeatures.periodsToRepay / periods).toFixed(2),
      total_interest: money(withFeatures.interestTotal),
      total_interest_without_offset_or_extra: money(base.interestTotal),
      interest_saved: money(base.interestTotal.minus(withFeatures.interestTotal)),
      available_redraw_from_extra_repayments: money(withFeatures.redraw),
      schedule: withFeatures.rows,
    };
  },
});
