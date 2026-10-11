import { z } from 'zod';
import { defineCalculator, type RuleMeta } from '../core/calculator.js';
import { dec, max, money, ZERO, type Dec } from '../core/decimal.js';
import { addFy, ageOn, fyStart, fyStartYear } from '../core/dates.js';
import { amount, financialYear, isoDate } from '../core/inputs.js';
import { block } from '../core/errors.js';
import { fmt } from '../tax/scale.js';

export const RULE_CC_CAP: RuleMeta = {
  id: 'au.super.concessional_cap',
  version: '1.0.0',
  legalReference: 'Income Tax Assessment Act 1997 s291-20 (incl. s291-20(3) carry-forward)',
};
export const RULE_NCC_CAP: RuleMeta = {
  id: 'au.super.non_concessional_cap',
  version: '1.0.0',
  legalReference: 'Income Tax Assessment Act 1997 s292-85 (nil cap, bring-forward)',
};

const UnusedAmount = z.object({
  financial_year: financialYear('Financial year in which the concessional cap went unused'),
  amount: amount('Unused concessional cap amount still available for that year (AUD), e.g. as shown by the ATO'),
});

const CcInput = z.object({
  financial_year: financialYear(),
  total_super_balance_prior_30_june: amount('Total superannuation balance at 30 June of the previous financial year (AUD)'),
  unused_concessional_amounts: z.array(UnusedAmount).max(10).default([]).describe('Unused cap amounts from earlier years that have not yet been applied'),
  concessional_contributions: amount('Concessional contributions made or planned this year (AUD)').optional(),
});

export const concessionalCapCalculator = defineCalculator({
  id: 'super.concessional_cap',
  title: 'Concessional contributions cap (with carry-forward)',
  domain: 'super',
  summary: 'General concessional cap for the year plus carried-forward unused amounts from the previous five years when the total super balance test is met.',
  input: CcInput,
  rules: [RULE_CC_CAP],
  limitations: [
    'Unused amounts must be supplied net of any already applied in earlier years (as reported by the ATO); the engine does not reconstruct cap usage history.',
    'Defined benefit notional taxed contributions and excess contribution determinations/release elections are not modelled.',
    '2027-28 cap not yet published: blocks.',
  ],
  example: {
    financial_year: '2026-27',
    total_super_balance_prior_30_june: 350000,
    unused_concessional_amounts: [
      { financial_year: '2022-23', amount: 5000 },
      { financial_year: '2024-25', amount: 10000 },
    ],
    concessional_contributions: 45000,
  },
  run(input, ctx) {
    const fy = input.financial_year;
    const at = fyStart(fy);
    const cap = ctx.scalar('super.concessional_cap', at);
    const cf = ctx.table('super.carry_forward', at);
    const tsb = dec(input.total_super_balance_prior_30_june);
    const eligible = tsb.lt(cf.tsb_limit!);
    const years = cf.years_available!.toNumber();
    const firstYear = cf.first_unused_year_start!.toNumber();
    const start = fyStartYear(fy);
    let carried = ZERO;
    const used: Array<{ financial_year: string; amount: string }> = [];
    for (const u of input.unused_concessional_amounts) {
      const y = fyStartYear(u.financial_year);
      const inWindow = y >= start - years && y <= start - 1 && y >= firstYear;
      if (!inWindow) {
        ctx.warn(`Unused amount for ${u.financial_year} ignored: outside the ${years}-year window (${addFy(fy, -years)} to ${addFy(fy, -1)}) or before ${firstYear}-${String((firstYear + 1) % 100).padStart(2, '0')}.`);
        continue;
      }
      carried = carried.plus(dec(u.amount));
      used.push({ financial_year: u.financial_year, amount: money(dec(u.amount)) });
    }
    const carriedApplied = eligible ? carried : ZERO;
    ctx.step({
      key: 'super.cc.carry_forward',
      label: 'Carry-forward eligibility',
      value: eligible ? 'eligible' : 'not eligible',
      working: `total super balance at prior 30 June ${fmt(tsb)} ${eligible ? '<' : '≥'} ${fmt(cf.tsb_limit!)}; unused amounts in window ${fmt(carried)}`,
      ruleId: RULE_CC_CAP.id,
    });
    const available = cap.plus(carriedApplied);
    ctx.step({ key: 'super.cc.available', label: 'Concessional cap available', value: money(available), working: `${fmt(cap)} + ${fmt(carriedApplied)}`, ruleId: RULE_CC_CAP.id });
    const result: Record<string, unknown> = {
      general_cap: money(cap),
      carry_forward_eligible: eligible,
      carry_forward_amounts_in_window: used,
      carry_forward_applied: money(carriedApplied),
      cap_available: money(available),
    };
    if (input.concessional_contributions !== undefined) {
      const c = dec(input.concessional_contributions);
      result.excess_concessional_contributions = money(max(0, c.minus(available)));
      result.remaining_cap = money(max(0, available.minus(c)));
    }
    return result;
  },
});

const NccInput = z.object({
  financial_year: financialYear(),
  total_super_balance_prior_30_june: amount('Total superannuation balance at 30 June of the previous financial year (AUD)'),
  date_of_birth: isoDate('Date of birth (for the under-75 bring-forward test)'),
  in_existing_bring_forward_period: z.boolean().default(false).describe('Bring-forward was triggered in one of the two previous years'),
  non_concessional_contributions: amount('Non-concessional contributions made or planned this year (AUD)').optional(),
});

export const nonConcessionalCapCalculator = defineCalculator({
  id: 'super.non_concessional_cap',
  title: 'Non-concessional contributions cap and bring-forward',
  domain: 'super',
  summary: 'Annual non-concessional cap, the nil-cap test against the transfer balance cap, and the maximum available under the bring-forward rule.',
  input: NccInput,
  rules: [RULE_NCC_CAP],
  limitations: [
    'People already inside a bring-forward period are not modelled (blocked).',
    'Fund acceptance rules for contributions after age 75 are not modelled.',
    'Excess non-concessional contribution release elections and tax are not modelled.',
  ],
  example: { financial_year: '2026-27', total_super_balance_prior_30_june: 1900000, date_of_birth: '1966-03-15' },
  run(input, ctx) {
    if (input.in_existing_bring_forward_period) {
      block({ code: 'OUT_OF_SCOPE', message: 'Remaining caps inside an existing bring-forward period are not modelled.', ruleId: RULE_NCC_CAP.id });
    }
    const fy = input.financial_year;
    const at = fyStart(fy);
    const annual = ctx.scalar('super.non_concessional_cap', at);
    const tbc = ctx.scalar('super.transfer_balance_cap', at);
    const bf = ctx.table('super.bring_forward', at);
    const tsb = dec(input.total_super_balance_prior_30_june);
    const age = ageOn(input.date_of_birth, at);
    let capThisYear: Dec;
    let maxAvailable: Dec;
    let period = 1;
    let basis: string;
    if (tsb.gte(tbc)) {
      capThisYear = ZERO;
      maxAvailable = ZERO;
      basis = `total super balance ${fmt(tsb)} ≥ transfer balance cap ${fmt(tbc)}: nil cap`;
    } else if (age >= bf.age_under!.toNumber()) {
      capThisYear = annual;
      maxAvailable = annual;
      basis = `age ${age} on 1 July (not under ${bf.age_under!.toFixed()} at any time in the year): bring-forward unavailable`;
      ctx.warn('Fund acceptance limits for contributions at age 75 and over are not checked.');
    } else if (tsb.lt(bf.three_year_tsb_below!)) {
      capThisYear = annual;
      maxAvailable = bf.three_year_amount!;
      period = 3;
      basis = `total super balance ${fmt(tsb)} < ${fmt(bf.three_year_tsb_below!)}: 3-year bring-forward`;
    } else if (tsb.lt(bf.two_year_tsb_below!)) {
      capThisYear = annual;
      maxAvailable = bf.two_year_amount!;
      period = 2;
      basis = `total super balance ${fmt(tsb)} < ${fmt(bf.two_year_tsb_below!)}: 2-year bring-forward`;
    } else {
      capThisYear = annual;
      maxAvailable = annual;
      basis = `total super balance ${fmt(tsb)} ≥ ${fmt(bf.two_year_tsb_below!)}: annual cap only`;
    }
    ctx.step({ key: 'super.ncc.max', label: 'Maximum non-concessional contributions', value: money(maxAvailable), working: basis, ruleId: RULE_NCC_CAP.id });
    const result: Record<string, unknown> = {
      annual_cap: money(capThisYear),
      maximum_with_bring_forward: money(maxAvailable),
      bring_forward_period_years: maxAvailable.gt(capThisYear) ? period : 1,
      age_on_1_july: age,
      transfer_balance_cap: money(tbc),
    };
    if (input.non_concessional_contributions !== undefined) {
      const c = dec(input.non_concessional_contributions);
      result.excess_non_concessional_contributions = money(max(0, c.minus(maxAvailable)));
      result.triggers_bring_forward = c.gt(capThisYear) && maxAvailable.gt(capThisYear);
    }
    return result;
  },
});
