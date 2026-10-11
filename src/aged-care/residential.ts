import { z } from 'zod';
import { defineCalculator, type RuleMeta } from '../core/calculator.js';
import type { CalcContext } from '../core/context.js';
import { block } from '../core/errors.js';
import { cents, dec, max, min, money, roundDp, ZERO, type Dec } from '../core/decimal.js';
import { cmp, type IsoDate } from '../core/dates.js';
import { amount, isoDate } from '../core/inputs.js';
import { fmt } from '../tax/scale.js';

export const RULE_MTA: RuleMeta = {
  id: 'au.aged_care.means_tested_amount',
  version: '1.0.0',
  legalReference: 'Aged Care Act 2024 s319; Aged Care Rules 2025 s319-5',
};
export const RULE_CONTRIBUTIONS: RuleMeta = {
  id: 'au.aged_care.hotelling_and_nccc',
  version: '1.0.0',
  legalReference: 'Aged Care Act 2024 ss277, 278, 279; Aged Care Rules 2025 ss279-5, 279-10, 280-5',
};
export const RULE_ACCOMMODATION: RuleMeta = {
  id: 'au.aged_care.accommodation',
  version: '1.0.0',
  legalReference: 'Aged Care Act 2024 s308 (retention); MPIR conversion per Schedule of Fees and Charges',
};

interface Band {
  lo: Dec;
  hi: Dec | null;
  rate: Dec;
}

/**
 * Banded annual amount: Σ rate × (portion of x within [lo, hi]). Each band product is rounded to
 * the cent (half-up) — engine convention inferred from the official scenarios (see Q12).
 */
function banded(x: Dec, bands: Band[]): { total: Dec; parts: string[] } {
  let total = ZERO;
  const parts: string[] = [];
  for (const b of bands) {
    const top = b.hi ? min(x, b.hi) : x;
    const portion = max(0, top.minus(b.lo));
    if (portion.gt(0) && b.rate.gt(0)) {
      const p = cents(portion.mul(b.rate), 'half_up');
      total = total.plus(p);
      parts.push(`${b.rate.mul(100).toFixed()}% × ${fmt(portion)} = ${fmt(p)}`);
    }
  }
  return { total, parts };
}

export interface MtaResult {
  incomeTested: Dec;
  assetTested: Dec;
  mta: Dec;
  countedAssets: Dec;
}

/**
 * Daily means-tested amount (Act s319): income-tested amount + asset-tested amount, each the
 * banded annual amount ÷ 364, rounded DOWN to the cent. The rounding is an engine convention that
 * reproduces every official health.gov.au scenario (no primary rounding rule was found; Q12).
 */
export function meansTestedAmount(ctx: CalcContext, date: IsoDate, couple: boolean, income: Dec, assets: Dec, homeValue: Dec, homeExempt: boolean): MtaResult {
  const t = ctx.table('aged_care.means_test', date);
  const r = ctx.table('aged_care.means_test_rates', date);
  const s = couple ? 'couple' : 'single';
  const counted = homeExempt ? ZERO : min(homeValue, t.asset_t1!);
  const totalAssets = assets.plus(counted);
  const inc = banded(income, [
    { lo: t[`income_free_area_${s}`]!, hi: t[`income_t1_${s}`]!, rate: r.income_band1! },
    { lo: t.income_t2!, hi: t.income_t3!, rate: r.income_band3! },
    { lo: t[`income_t4_${s}`]!, hi: null, rate: r.income_band5! },
  ]);
  const ast = banded(totalAssets, [
    { lo: t.asset_free_area!, hi: t.asset_t1!, rate: r.asset_band1! },
    { lo: t.asset_t2!, hi: t.asset_t3!, rate: r.asset_band3! },
    { lo: t.asset_t4!, hi: null, rate: r.asset_band5! },
  ]);
  const days = r.days_divisor!;
  const incomeTested = roundDp(inc.total.div(days), 2, 'down');
  const assetTested = roundDp(ast.total.div(days), 2, 'down');
  const mta = incomeTested.plus(assetTested);
  ctx.step({ key: 'aged_care.income_tested', label: 'Income-tested amount (per day)', value: money(incomeTested), working: `(${inc.parts.join(' + ') || 'nil'}) ÷ ${days.toFixed()}, rounded down to the cent`, ruleId: RULE_MTA.id });
  ctx.step({
    key: 'aged_care.asset_tested',
    label: 'Asset-tested amount (per day)',
    value: money(assetTested),
    working: `assets ${fmt(totalAssets)} (home counted ${homeExempt ? 'nil (exempt)' : fmt(counted)}); (${ast.parts.join(' + ') || 'nil'}) ÷ ${days.toFixed()}, rounded down`,
    ruleId: RULE_MTA.id,
  });
  ctx.step({ key: 'aged_care.mta', label: 'Daily means-tested amount', value: money(mta), ruleId: RULE_MTA.id });
  return { incomeTested, assetTested, mta, countedAssets: totalAssets };
}

/** Hotelling contribution (s278) and non-clinical care contribution (s279) from the MTA. */
export function contributions(ctx: CalcContext, date: IsoDate, mta: Dec, opts: { exempt: boolean; ncccDaysPaid: number; ncccPaidToDate: Dec }): { hotelling: Dec; nccc: Dec; ncccCapReached: boolean } {
  const f = ctx.table('aged_care.fees', date);
  if (opts.exempt) {
    ctx.step({ key: 'aged_care.contributions', label: 'Hotelling and non-clinical care contributions', value: '0.00', working: 'resident in a class whose contributions are zero (Rules 280-5)', ruleId: RULE_CONTRIBUTIONS.id });
    return { hotelling: ZERO, nccc: ZERO, ncccCapReached: false };
  }
  const mas = f.max_accommodation_supplement!;
  const hs = f.max_hotelling_supplement!;
  const hotelling = mta.gt(mas) ? min(mta.minus(mas), hs) : ZERO;
  ctx.step({ key: 'aged_care.hotelling', label: 'Hotelling contribution (per day)', value: money(hotelling), working: `min(max(0, MTA ${fmt(mta)} − MAS ${fmt(mas)}), max hotelling supplement ${fmt(hs)})`, ruleId: RULE_CONTRIBUTIONS.id });
  const step2 = mas.plus(hs);
  let nccc = mta.gt(step2) ? min(mta.minus(step2), f.nccc_daily_cap!) : ZERO;
  const capReached = opts.ncccDaysPaid >= f.nccc_max_days!.toNumber() || opts.ncccPaidToDate.gte(f.nccc_lifetime_cap!);
  let working = `min(max(0, MTA ${fmt(mta)} − (MAS ${fmt(mas)} + max hotelling ${fmt(hs)})), daily cap ${fmt(f.nccc_daily_cap!)})`;
  if (capReached) {
    nccc = ZERO;
    working += `; nil — ${f.nccc_max_days!.toFixed()}-day or ${fmt(f.nccc_lifetime_cap!)} lifetime cap reached`;
  }
  ctx.step({ key: 'aged_care.nccc', label: 'Non-clinical care contribution (per day)', value: money(nccc), working, ruleId: RULE_CONTRIBUTIONS.id });
  return { hotelling, nccc, ncccCapReached: capReached };
}

const Input = z.object({
  fee_date: isoDate('Date the fees apply to (selects rates and thresholds)'),
  entry_date: isoDate('Date the person entered residential care'),
  opted_in_to_2025_arrangements: z.boolean().default(false).describe('A pre-1 November 2025 resident who opted in to the new arrangements'),
  home_care_no_worse_off: z.boolean().default(false).describe('Approved for or receiving a Home Care Package on 12 September 2024 (stays on 1 July 2014 fee arrangements)'),
  relationship: z.enum(['single', 'couple']).describe('Member of a couple uses couple thresholds'),
  assessable_income: amount('Person’s assessable income per year for the aged care means test (AUD); for couples, the person’s share (half of combined)'),
  assessable_assets: amount('Person’s assessable assets excluding the home (AUD); for couples, the person’s share'),
  home_value: amount('Person’s share of the former home value (AUD)').default('0'),
  home_exempt: z.boolean().default(false).describe('Home not counted (e.g. a protected person such as a spouse still lives there)'),
  means_not_disclosed: z.boolean().default(false).describe('Means not disclosed: maximum contributions apply'),
  zero_contribution_class: z.boolean().default(false).describe('In a class with zero hotelling/NCCC (e.g. dependent child, former POW) — Rules 280-5'),
  nccc_days_paid: z.number().int().min(0).max(20000).default(0).describe('Days on which NCCC has already been paid'),
  nccc_paid_to_date: amount('NCCC already paid (AUD)').default('0'),
  room_price: amount('Agreed room price as a lump sum (RAD) (AUD)').optional(),
  lump_sum_paid: amount('Lump sum (RAD or RAC) paid towards the room (AUD)').default('0'),
  price_agreed_date: isoDate('Date the room price was agreed (selects the MPIR; low-means residents use the entry date)').optional(),
  accommodation_supplement: amount('Accommodation supplement amount for the home per day (low-means residents) — defaults to the maximum').optional(),
});

export const residentialFeesCalculator = defineCalculator({
  id: 'aged_care.residential_fees',
  title: 'Residential aged care fees (from 1 November 2025)',
  domain: 'aged_care',
  summary: 'Daily means-tested amount, hotelling contribution, non-clinical care contribution, basic daily fee and accommodation payment under the Aged Care Act 2024 arrangements.',
  input: Input,
  rules: [RULE_MTA, RULE_CONTRIBUTIONS, RULE_ACCOMMODATION],
  limitations: [
    'Only the 1 November 2025 arrangements: residents on pre-2014 or 1 July 2014 arrangements (including the Home Care Package "no worse off" cohort) are blocked.',
    'Assessable income and assets must be determined by the user per Services Australia rules (the assessment itself is not reproduced).',
    'MTA cent rounding (each band to the cent, then down to the cent per day) is an engine convention that reproduces all official health.gov.au scenarios; no primary rounding rule was found.',
    'Hardship, supported-resident ratios and compensation payment fees are not modelled; rates from 20 March 2027 are not yet published.',
  ],
  example: {
    fee_date: '2026-10-11',
    entry_date: '2026-10-01',
    relationship: 'single',
    assessable_income: 52000,
    assessable_assets: 340000,
    home_value: 960000,
    room_price: 650000,
    lump_sum_paid: 250000,
    price_agreed_date: '2026-10-01',
  },
  run(input, ctx) {
    if (input.home_care_no_worse_off) {
      block({ code: 'OUT_OF_SCOPE', message: 'Residents in the Home Care Package "no worse off" cohort are on the 1 July 2014 fee arrangements, which are not modelled.' });
    }
    if (cmp(input.entry_date, '2025-11-01') < 0 && !input.opted_in_to_2025_arrangements) {
      block({ code: 'OUT_OF_SCOPE', message: 'Residents who entered before 1 November 2025 stay on their existing arrangements unless they opt in; those arrangements are not modelled.' });
    }
    const d = input.fee_date;
    const f = ctx.table('aged_care.fees', d);
    let mta: Dec;
    let incomeTested: Dec = ZERO;
    let assetTested: Dec = ZERO;
    if (input.means_not_disclosed) {
      mta = f.max_accommodation_supplement!.plus(f.max_hotelling_supplement!).plus(f.nccc_daily_cap!);
      ctx.step({ key: 'aged_care.mta', label: 'Means not disclosed', value: 'maximum contributions', ruleId: RULE_CONTRIBUTIONS.id });
    } else {
      const m = meansTestedAmount(ctx, d, input.relationship === 'couple', dec(input.assessable_income), dec(input.assessable_assets), dec(input.home_value), input.home_exempt);
      mta = m.mta;
      incomeTested = m.incomeTested;
      assetTested = m.assetTested;
    }
    const c = contributions(ctx, d, mta, { exempt: input.zero_contribution_class, ncccDaysPaid: input.nccc_days_paid, ncccPaidToDate: dec(input.nccc_paid_to_date) });
    const bdf = f.basic_daily_fee!;

    // Accommodation
    const mas = f.max_accommodation_supplement!;
    const lowMeans = !input.means_not_disclosed && mta.lt(mas);
    let accommodation: Record<string, string | boolean | null> = { low_means: lowMeans };
    let dailyAccommodation: Dec = ZERO;
    let dapEquivalent: Dec | null = null;
    const paid = dec(input.lump_sum_paid);
    // Low-means residents: conversions use the MPIR at the date of entry; otherwise the MPIR on
    // the day the room price was agreed (Schedule of Fees and Charges note 4; scenarios page).
    const mpirDate = lowMeans ? input.entry_date : input.price_agreed_date;
    const mpir = input.room_price !== undefined || (lowMeans && paid.gt(0)) ? (mpirDate ? ctx.scalar('aged_care.mpir', mpirDate) : null) : null;
    if (input.room_price !== undefined) {
      if (!mpir) block({ code: 'OUT_OF_SCOPE', message: 'price_agreed_date is required with room_price (it selects the MPIR).' });
      dapEquivalent = cents(dec(input.room_price).mul(mpir).div(365), 'half_up');
      accommodation = { ...accommodation, mpir: mpir.toFixed(), room_price_as_dap: money(dapEquivalent) };
      const maxPrice = ctx.scalar('aged_care.max_accommodation_payment', d);
      if (dec(input.room_price).gt(maxPrice)) ctx.warn(`Room price exceeds the maximum accommodation payment amount (${fmt(maxPrice)}) that can be charged without approval.`);
      if (!lowMeans) {
        const outstanding = max(0, dec(input.room_price).minus(paid));
        const dap = cents(outstanding.mul(mpir).div(365), 'half_up');
        ctx.step({ key: 'aged_care.dap', label: 'Daily accommodation payment', value: money(dap), working: `(${fmt(dec(input.room_price))} − ${fmt(paid)}) × MPIR ${mpir.mul(100).toFixed()}% ÷ 365`, ruleId: RULE_ACCOMMODATION.id });
        dailyAccommodation = dap;
        accommodation.daily_accommodation_payment = money(dap);
      }
    }
    if (paid.gt(0)) {
      const retention = ctx.table('aged_care.rad_retention', d);
      const daily = cents(paid.mul(retention.rate!).div(retention.day_basis!), 'half_up');
      accommodation.rad_retention_daily = money(daily);
      ctx.step({ key: 'aged_care.retention', label: 'Refundable deposit retention (per day, first 5 years)', value: money(daily), working: `${fmt(paid)} × ${retention.rate!.mul(100).toFixed()}% ÷ ${retention.day_basis!.toFixed()}`, ruleId: RULE_ACCOMMODATION.id });
    }
    if (lowMeans) {
      const supplement = input.accommodation_supplement !== undefined ? dec(input.accommodation_supplement) : mas;
      const candidates = [mta, supplement, ...(dapEquivalent ? [dapEquivalent] : [])];
      const dacBeforeLumpSum = min(...candidates);
      let dac = dacBeforeLumpSum;
      let working = `lower of MTA ${fmt(mta)}, accommodation supplement ${fmt(supplement)}${dapEquivalent ? `, room price as DAP ${fmt(dapEquivalent)}` : ''}`;
      if (paid.gt(0)) {
        if (!mpir) block({ code: 'OUT_OF_SCOPE', message: 'entry_date MPIR is required to convert a lump sum for a low-means resident.' });
        const equivalent = cents(paid.mul(mpir).div(365), 'half_up');
        dac = max(0, dacBeforeLumpSum.minus(equivalent));
        working += `; less lump sum ${fmt(paid)} × MPIR ${mpir.mul(100).toFixed()}% ÷ 365 = ${fmt(equivalent)}`;
        accommodation.lump_sum_daily_equivalent = money(equivalent);
      }
      dailyAccommodation = dac;
      accommodation = { ...accommodation, daily_accommodation_contribution: money(dac), government_accommodation_supplement: money(max(0, supplement.minus(dacBeforeLumpSum))) };
      ctx.step({ key: 'aged_care.dac', label: 'Daily accommodation contribution (low means)', value: money(dac), working, ruleId: RULE_ACCOMMODATION.id });
    }
    const totalDaily = bdf.plus(c.hotelling).plus(c.nccc).plus(dailyAccommodation);
    return {
      income_tested_amount: money(incomeTested),
      asset_tested_amount: money(assetTested),
      means_tested_amount: money(mta),
      basic_daily_fee: money(bdf),
      hotelling_contribution: money(c.hotelling),
      non_clinical_care_contribution: money(c.nccc),
      nccc_cap_reached: c.ncccCapReached,
      accommodation,
      total_daily: money(totalDaily),
      total_annual_365: money(cents(totalDaily.mul(365))),
    };
  },
});

const ContribInput = z.object({
  fee_date: isoDate('Date the fees apply to'),
  means_tested_amount: amount('Daily means-tested amount as assessed by Services Australia (AUD)'),
});

export const contributionsFromMtaCalculator = defineCalculator({
  id: 'aged_care.contributions_from_mta',
  title: 'Hotelling and non-clinical care contributions from an assessed MTA',
  domain: 'aged_care',
  summary: 'Applies the Aged Care Act ss278–279 ordering to a means-tested amount already assessed by Services Australia.',
  input: ContribInput,
  rules: [RULE_CONTRIBUTIONS],
  limitations: ['Lifetime/day caps and zero-contribution classes are not applied here (use aged_care.residential_fees).'],
  example: { fee_date: '2026-04-01', means_tested_amount: 121.33 },
  run(input, ctx) {
    const c = contributions(ctx, input.fee_date, dec(input.means_tested_amount), { exempt: false, ncccDaysPaid: 0, ncccPaidToDate: ZERO });
    return { hotelling_contribution: money(c.hotelling), non_clinical_care_contribution: money(c.nccc) };
  },
});
