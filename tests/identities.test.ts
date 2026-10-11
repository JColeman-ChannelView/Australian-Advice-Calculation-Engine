/**
 * Identity tests: published figures must reconcile with the formulae and with each other
 * (research §E3.2). Each failure means either a parameter typo or a rule misunderstanding.
 */
import { describe, expect, it } from 'vitest';
import { CalcContext } from '../src/core/context.js';
import { dec, roundDp, roundToIncrement } from '../src/core/decimal.js';
import { defaultRegistry } from '../src/params.js';
import { marginalTax } from '../src/tax/scale.js';
import { mcbFormula } from '../src/super/sg.js';

const ctx = () => new CalcContext(defaultRegistry());

describe('tax identities', () => {
  const published: Record<string, [number, number, number]> = {
    '2024-07-01': [4288, 31288, 51638],
    '2025-07-01': [4288, 31288, 51638],
    '2026-07-01': [4020, 31020, 51370],
    '2027-07-01': [3752, 30752, 51102], // derived bases (verification/tax.md)
  };
  for (const [date, bases] of Object.entries(published)) {
    it(`resident scale ${date} reproduces bases ${bases.join('/')}`, () => {
      const b = ctx().brackets('tax.resident_scale', date);
      [45000, 135000, 190000].forEach((x, i) => expect(marginalTax(b, dec(x)).tax.toFixed()).toBe(String(bases[i])));
    });
  }

  it('foreign resident bases 40,500 / 60,850', () => {
    for (const date of ['2025-07-01', '2026-07-01']) {
      const b = ctx().brackets('tax.foreign_resident_scale', date);
      expect(marginalTax(b, dec(135000)).tax.toFixed()).toBe('40500');
      expect(marginalTax(b, dec(190000)).tax.toFixed()).toBe('60850');
    }
  });

  for (const date of ['2025-07-01', '2026-07-01']) {
    it(`SAPTO cut-out = shade-out + max / taper (${date})`, () => {
      const t = ctx().table('tax.offsets.sapto', date);
      for (const c of ['single', 'couple', 'illness_separated']) {
        expect(t[`${c}_shade_out`]!.plus(t[`${c}_max`]!.div(t.taper!)).toFixed()).toBe(t[`${c}_cut_out`]!.toFixed());
      }
    });
  }

  it('HELP 2025-26 band-2 base = 15% × (125,000 − 67,000) exactly; 2026-27 published base is the truncation', () => {
    const a = ctx().table('tax.help.repayment_schedule', '2025-07-01');
    expect(a.rate1!.mul(a.band2_over!.minus(a.threshold!)).toFixed()).toBe(a.band2_base!.toFixed());
    const b = ctx().table('tax.help.repayment_schedule', '2026-07-01');
    expect(roundDp(b.rate1!.mul(b.band2_over!.minus(b.threshold!)), 0, 'down').toFixed()).toBe(b.band2_base!.toFixed());
  });

  it('LITO cut-out: 325 − 1.5% × (66,667 − 45,000) is within one cent of nil', () => {
    const t = ctx().table('tax.offsets.lito', '2026-07-01');
    expect(t.step_amount!.minus(t.taper2!.mul(t.cut_out!.minus(t.step_at!))).abs().lt('0.01')).toBe(true);
    // continuity at 45,000
    expect(t.max!.minus(t.taper1!.mul(t.step_at!.minus(t.full_to!))).toFixed()).toBe(t.step_amount!.toFixed());
  });

  it('Medicare 2025-26 phase-in limits are 1.25 × lower thresholds (rounded down)', () => {
    const t = ctx().table('tax.medicare.low_income_thresholds', '2025-07-01');
    expect(roundDp(t.single_lower!.mul('1.25'), 0, 'down').toFixed()).toBe(t.single_upper!.toFixed());
    expect(roundDp(t.single_sapto_lower!.mul('1.25'), 0, 'down').toFixed()).toBe(t.single_sapto_upper!.toFixed());
    expect(roundDp(t.family_lower!.mul('1.25'), 0, 'down').toFixed()).toBe(t.family_upper!.toFixed());
  });
});

describe('super identities', () => {
  for (const date of ['2024-07-01', '2025-07-01', '2026-07-01']) {
    it(`NCC cap = 4 × concessional cap; bring-forward thresholds = TBC − 2·NCC / TBC − NCC / TBC (${date})`, () => {
      const c = ctx();
      const cc = c.scalar('super.concessional_cap', date);
      const ncc = c.scalar('super.non_concessional_cap', date);
      const tbc = c.scalar('super.transfer_balance_cap', date);
      const bf = c.table('super.bring_forward', date);
      expect(ncc.toFixed()).toBe(cc.mul(4).toFixed());
      expect(bf.three_year_tsb_below!.toFixed()).toBe(tbc.minus(ncc.mul(2)).toFixed());
      expect(bf.two_year_tsb_below!.toFixed()).toBe(tbc.minus(ncc).toFixed());
      expect(bf.nil_tsb_at_or_above!.toFixed()).toBe(tbc.toFixed());
      expect(bf.three_year_amount!.toFixed()).toBe(ncc.mul(3).toFixed());
      expect(bf.two_year_amount!.toFixed()).toBe(ncc.mul(2).toFixed());
    });
  }

  it('MCB 2026-27 = concessional cap × 100 ÷ SG%, rounded down to $10', () => {
    const c = ctx();
    expect(mcbFormula(c.scalar('super.concessional_cap', '2026-07-01'), c.scalar('super.sg_rate', '2026-07-01')).toFixed()).toBe(
      c.scalar('super.max_contribution_base_annual', '2026-07-01').toFixed(),
    );
  });

  it('co-contribution higher threshold = lower + 15,000', () => {
    for (const date of ['2024-07-01', '2025-07-01', '2026-07-01']) {
      const t = ctx().table('super.co_contribution', date);
      expect(t.higher_threshold!.minus(t.lower_threshold!).toFixed()).toBe('15000');
    }
  });

  it('LISTO 2027-28 cap = threshold × SG rate × 15% (Act formula check)', () => {
    const c = ctx();
    const t = c.table('super.listo', '2027-07-01');
    expect(t.income_threshold!.mul(c.scalar('super.sg_rate', '2027-07-01')).mul(t.rate!).toFixed()).toBe(t.max!.toFixed());
  });

  it('spouse offset maximum = 18% × 3,000 = 540', () => {
    const t = ctx().table('super.spouse_offset', '2026-07-01');
    expect(t.rate!.mul(t.max_contributions!).toFixed()).toBe('540');
    expect(t.income_threshold!.plus(t.max_contributions!).toFixed()).toBe(t.cut_out!.toFixed());
  });
});

describe('Centrelink and aged care identities', () => {
  it('maximum rate totals 1,237.70 / 933.00 (20 Sep 2026), 1,200.90 / 905.20 (20 Mar 2026)', () => {
    const total = (date: string, p: string) => {
      const t = ctx().table('centrelink.age_pension_max_rates', date);
      return t[`${p}_basic`]!.plus(t[`${p}_pension_supplement`]!).plus(t[`${p}_energy_supplement`]!).toFixed(2);
    };
    expect(total('2026-09-20', 'single')).toBe('1237.70');
    expect(total('2026-09-20', 'couple')).toBe('933.00');
    expect(total('2026-03-20', 'single')).toBe('1200.90');
    expect(total('2026-03-20', 'couple')).toBe('905.20');
  });

  it('income free areas: fortnightly 226 / 396 = annual ÷ 26', () => {
    const t = ctx().table('centrelink.income_test', '2026-07-01');
    expect(t.single_free_area_pa!.div(26).toFixed()).toBe('226');
    expect(t.couple_free_area_each_pa!.mul(2).div(26).toFixed()).toBe('396');
  });

  // Aged Care Act s277(2)(b): BDF = 85% of the single basic age pension per day (annual ÷ 364), rounded down to the cent.
  const bdfCases: Array<[string, string]> = [
    ['2025-12-01', '2025-12-01'],
    ['2026-04-01', '2026-04-01'],
    ['2026-10-11', '2026-10-11'],
  ];
  for (const [feeDate, apDate] of bdfCases) {
    it(`basic daily fee = floor(85% × basic age pension ÷ 364) at ${feeDate}`, () => {
      const c = ctx();
      const basicAnnual = c.table('centrelink.age_pension_max_rates', apDate).single_basic!.mul(26);
      const bdf = roundDp(basicAnnual.div(364).mul('0.85'), 2, 'down');
      expect(bdf.toFixed(2)).toBe(c.table('aged_care.fees', feeDate).basic_daily_fee!.toFixed(2));
    });
    it(`asset free area = 2.25 × basic age pension, to the nearest $500 as published (${feeDate})`, () => {
      const c = ctx();
      const basicAnnual = c.table('centrelink.age_pension_max_rates', apDate).single_basic!.mul(26);
      expect(roundToIncrement(basicAnnual.mul('2.25'), 500, 'half_up').toFixed()).toBe(c.table('aged_care.means_test', feeDate).asset_free_area!.toFixed());
    });
  }
});

describe('bitemporal resolution with the shipped release', () => {
  it('a calculation as known on 1 Sep 2026 cannot see the 20 Sep 2026 pension rates', () => {
    const c = new CalcContext(defaultRegistry(), { knowledgeAsAt: '2026-09-01' });
    expect(() => c.table('centrelink.age_pension_max_rates', '2026-10-11')).toThrow(/PARAMETER_MISSING/);
    // …but the deeming determination registered 21 Aug 2026 was already known.
    expect(c.table('centrelink.deeming_rates', '2026-10-11').lower!.toFixed()).toBe('0.0175');
  });
});
