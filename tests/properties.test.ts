/**
 * Property-based and boundary tests (research §E3.4): monotonicity, bounds, continuity and ±$1
 * behaviour at every threshold the engine uses.
 */
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { runCalculator, type CalculationResponse } from '../src/core/calculator.js';
import { getCalculator } from '../src/calculators.js';
import { defaultRegistry } from '../src/params.js';

const reg = defaultRegistry();
function run(id: string, input: unknown): CalculationResponse<Record<string, unknown>> {
  const calc = getCalculator(id);
  if (!calc) throw new Error(`no calculator ${id}`);
  return runCalculator(calc, input, reg) as CalculationResponse<Record<string, unknown>>;
}
function num(r: CalculationResponse<Record<string, unknown>>, key: string): number {
  expect(r.status, JSON.stringify(r.blocked ?? r.issues)).toBe('ok');
  return Number(r.result![key]);
}
const income = fc.integer({ min: 0, max: 600_000 });
const RUNS = { numRuns: 150 };

describe('tax properties', () => {
  for (const fy of ['2024-25', '2025-26', '2026-27', '2027-28']) {
    it(`income tax is monotone non-decreasing with marginal rate in [0, 0.45] (${fy})`, () => {
      fc.assert(
        fc.property(income, fc.integer({ min: 1, max: 20_000 }), (x, dx) => {
          const a = run('tax.income_tax', { financial_year: fy, taxable_income: x });
          const b = run('tax.income_tax', { financial_year: fy, taxable_income: x + dx });
          const ta = num(a, 'income_tax');
          const tb = num(b, 'income_tax');
          expect(tb).toBeGreaterThanOrEqual(ta);
          expect((tb - ta) / dx).toBeLessThanOrEqual(0.45 + 1e-9);
          expect(Number(a.result!.marginal_rate)).toBeGreaterThanOrEqual(0);
        }),
        RUNS,
      );
    });
  }

  it('personal tax total is non-decreasing in income (2025-26, HELP RI = TI)', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 300_000 }), fc.integer({ min: 1, max: 5_000 }), (x, dx) => {
        const a = num(run('tax.personal_tax', { financial_year: '2025-26', taxable_income: x, help_repayment_income: x }), 'total_payable');
        const b = num(run('tax.personal_tax', { financial_year: '2025-26', taxable_income: x + dx, help_repayment_income: x + dx }), 'total_payable');
        expect(b).toBeGreaterThanOrEqual(a);
      }),
      RUNS,
    );
  });

  it('net income tax never negative and offsets used never exceed gross tax', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 120_000 }), (x) => {
        const r = run('tax.personal_tax', { financial_year: '2026-27', taxable_income: x, sapto: { category: 'single', rebate_income: x } });
        // 2026-27 Medicare thresholds are unpublished → must block, never guess.
        expect(r.status).toBe('blocked');
        const r2 = run('tax.personal_tax', { financial_year: '2025-26', taxable_income: x, sapto: { category: 'single', rebate_income: x } });
        expect(num(r2, 'net_income_tax')).toBeGreaterThanOrEqual(0);
        expect(num(r2, 'offsets_used')).toBeLessThanOrEqual(num(r2, 'income_tax'));
      }),
      { numRuns: 60 },
    );
  });
});

describe('Centrelink properties', () => {
  const base = { assessment_date: '2026-10-11', relationship: 'single', homeowner: true, dates_of_birth: ['1955-01-01'] };
  it('Age Pension rate is non-increasing in assets and in income', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1_200_000 }), fc.integer({ min: 1, max: 50_000 }), fc.integer({ min: 0, max: 3_000 }), (assets, da, inc) => {
        const r1 = num(run('centrelink.age_pension', { ...base, assessable_assets: assets, financial_assets: 0, other_income_fortnightly: inc }), 'rate_fortnightly_per_person');
        const r2 = num(run('centrelink.age_pension', { ...base, assessable_assets: assets + da, financial_assets: 0, other_income_fortnightly: inc }), 'rate_fortnightly_per_person');
        const r3 = num(run('centrelink.age_pension', { ...base, assessable_assets: assets, financial_assets: 0, other_income_fortnightly: inc + 10 }), 'rate_fortnightly_per_person');
        expect(r2).toBeLessThanOrEqual(r1);
        expect(r3).toBeLessThanOrEqual(r1);
        expect(r1).toBeLessThanOrEqual(1237.7);
      }),
      RUNS,
    );
  });

  it('deemed income is monotone and continuous at the threshold', () => {
    const at = (fa: number) => num(run('centrelink.deeming', { assessment_date: '2026-10-11', financial_assets: fa, status: 'single' }), 'deemed_income_annual');
    expect(at(66_800)).toBeCloseTo(1169, 2);
    expect(at(66_801) - at(66_800)).toBeCloseTo(0.04, 2); // upper rate applies to the next dollar
    fc.assert(fc.property(fc.integer({ min: 0, max: 2_000_000 }), fc.integer({ min: 1, max: 10_000 }), (x, d) => {
      expect(at(x + d)).toBeGreaterThanOrEqual(at(x));
    }), RUNS);
  });
});

describe('super and projection properties', () => {
  it('minimum pension ≥ factor × balance − $5 (nearest-$10 rounding) for a full year', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1_000, max: 5_000_000 }), fc.integer({ min: 1931, max: 1965 }), (bal, birthYear) => {
        const r = run('super.minimum_pension', { financial_year: '2026-27', date_of_birth: `${birthYear}-03-01`, account_balance: bal });
        const minimum = num(r, 'minimum_annual_payment');
        const factor = Number(r.result!.percentage_factor);
        expect(minimum).toBeGreaterThanOrEqual(bal * factor - 5 - 1e-6);
        expect(minimum % 10).toBe(0);
      }),
      RUNS,
    );
  });

  it('projection drawdowns never fall below the minimum while funds remain', () => {
    fc.assert(
      fc.property(fc.integer({ min: 50_000, max: 2_000_000 }), fc.integer({ min: 0, max: 120_000 }), (bal, income) => {
        const r = run('projection.super', {
          calculation_date: '2026-10-11',
          date_of_birth: '1958-01-01',
          current_balance: bal,
          return_accumulation: 0.06,
          return_retirement: 0.06,
          retirement_income: income,
        });
        expect(r.status).toBe('ok');
        for (const row of r.result!.rows as Array<Record<string, string>>) {
          if (row.phase !== 'retirement' || Number(row.opening_balance) === 0) continue;
          const available = Number(row.opening_balance) * Math.sqrt(1.06);
          expect(Number(row.withdrawals)).toBeGreaterThanOrEqual(Math.min(Number(row.minimum_drawdown), available) - 0.01);
        }
      }),
      { numRuns: 40 },
    );
  });
});

describe('projection regression', () => {
  it('minimum drawdown uses age on 1 July (audit finding 4)', () => {
    const r = run('projection.super', { calculation_date: '2026-10-11', date_of_birth: '1951-08-01', current_balance: 1000000, return_accumulation: 0, return_retirement: 0, already_retired: true });
    const first = (r.result!.rows as Array<Record<string, string>>)[0]!;
    expect(first.minimum_drawdown).toBe('50000.00'); // age 74 on 1 July 2026 → 5%
  });
});

describe('aged care and debt properties', () => {
  it('means-tested amount is non-decreasing in income and assets', () => {
    const mta = (inc: number, assets: number) =>
      num(run('aged_care.residential_fees', { fee_date: '2026-10-11', entry_date: '2026-10-01', relationship: 'single', assessable_income: inc, assessable_assets: assets }), 'means_tested_amount');
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 250_000 }), fc.integer({ min: 0, max: 2_000_000 }), fc.integer({ min: 1, max: 20_000 }), (inc, assets, d) => {
        const a = mta(inc, assets);
        expect(mta(inc + d, assets)).toBeGreaterThanOrEqual(a);
        expect(mta(inc, assets + d)).toBeGreaterThanOrEqual(a);
      }),
      { numRuns: 80 },
    );
  });

  it('an offset never increases total interest', () => {
    fc.assert(
      fc.property(fc.integer({ min: 50_000, max: 1_500_000 }), fc.integer({ min: 0, max: 200_000 }), fc.integer({ min: 1, max: 12 }), (p, off, ratePct) => {
        const r = run('debt.offset_schedule', { principal: p, annual_rate: ratePct / 100, term_years: 25, offset_balance: off });
        expect(num(r, 'total_interest')).toBeLessThanOrEqual(num(r, 'total_interest_without_offset_or_extra'));
      }),
      { numRuns: 25 },
    );
  });
});

describe('±$1 boundaries at thresholds', () => {
  const cases: Array<{ name: string; id: string; mk: (x: number) => unknown; key: string; at: number; below: string; above: string }> = [
    { name: 'tax-free threshold 2026-27', id: 'tax.income_tax', mk: (x) => ({ financial_year: '2026-27', taxable_income: x }), key: 'income_tax', at: 18200, below: '0.00', above: '0.15' },
    { name: 'HELP threshold 2026-27', id: 'tax.help_repayment', mk: (x) => ({ financial_year: '2026-27', repayment_income: x }), key: 'help_repayment', at: 69528, below: '0.00', above: '0.15' },
    { name: 'Medicare low-income threshold 2025-26', id: 'tax.medicare_levy', mk: (x) => ({ financial_year: '2025-26', taxable_income: x }), key: 'medicare_levy', at: 28011, below: '0.00', above: '0.10' },
    { name: 'Div 293 threshold', id: 'tax.div293', mk: (x) => ({ financial_year: '2026-27', division_293_income: x - 20000, low_tax_contributions: 20000 }), key: 'div293_tax', at: 250000, below: '0.00', above: '0.15' },
  ];
  for (const c of cases) {
    it(`${c.name}: nil at ${c.at}, first cents above`, () => {
      expect(run(c.id, c.mk(c.at)).result![c.key]).toBe(c.below);
      expect(run(c.id, c.mk(c.at + 1)).result![c.key]).toBe(c.above);
    });
  }

  it('carry-forward TSB test: 499,999 eligible, 500,000 not', () => {
    const mk = (tsb: number) => run('super.concessional_cap', { financial_year: '2026-27', total_super_balance_prior_30_june: tsb, unused_concessional_amounts: [{ financial_year: '2024-25', amount: 1000 }] });
    expect(mk(499_999).result!.carry_forward_eligible).toBe(true);
    expect(mk(500_000).result!.carry_forward_eligible).toBe(false);
  });

  it('NCC: TSB one dollar below TBC keeps the annual cap', () => {
    const r = run('super.non_concessional_cap', { financial_year: '2026-27', total_super_balance_prior_30_june: 2_099_999, date_of_birth: '1970-01-01' });
    expect(r.result!.annual_cap).toBe('130000.00');
  });

  it('Age Pension asset cut-off: $250 below pays the $1 minimum, at the cut-off nil', () => {
    const mk = (a: number) => run('centrelink.age_pension', { assessment_date: '2026-10-11', relationship: 'single', homeowner: true, dates_of_birth: ['1955-01-01'], assessable_assets: a, financial_assets: 0 });
    expect(mk(745_750).result!.rate_fortnightly_per_person).toBe('0.00');
    expect(mk(745_749).result!.rate_fortnightly_per_person).toBe('1.00');
  });
});
