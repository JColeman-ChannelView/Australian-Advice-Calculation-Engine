import { describe, expect, it } from 'vitest';
import { sha256Hex } from '../src/core/sha256.js';
import { canonicalJson } from '../src/core/canonical.js';
import { cents, dec, roundToIncrement, roundDp } from '../src/core/decimal.js';
import { ageOn, daysInFy, financialYearOf, fyEnd, fyStart, isFinancialYear, isIsoDate, daysInclusive } from '../src/core/dates.js';
import { ParameterRegistry } from '../src/core/registry.js';
import { CalcContext } from '../src/core/context.js';
import { BlockedCalculation } from '../src/core/errors.js';
import type { IdentifiedRecord, ParameterBundle } from '../src/core/parameters.js';
import { createEvidenceBundle, verifyEvidenceBundle } from '../src/core/evidence.js';
import { runCalculator } from '../src/core/calculator.js';
import { incomeTaxCalculator } from '../src/tax/income-tax.js';
import { bundledParameters, defaultRegistry } from '../src/params.js';
import { ENGINE_VERSION } from '../src/version.js';
import pkg from '../package.json' with { type: 'json' };

describe('sha256', () => {
  it('matches FIPS 180-4 test vectors', () => {
    expect(sha256Hex('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    expect(sha256Hex('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    expect(sha256Hex('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq')).toBe(
      '248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1',
    );
    expect(sha256Hex('a'.repeat(1000))).toBe('41edece42d63e8d9bf515a9ba6932e1c20cbc9f5a5d134645adb5db1b9737ea3');
  });
});

describe('canonical JSON', () => {
  it('sorts keys and drops undefined', () => {
    expect(canonicalJson({ b: 1, a: [true, null, 'x'], c: undefined })).toBe('{"a":[true,null,"x"],"b":1}');
  });
});

describe('decimal rounding', () => {
  it('is exact where binary floats are not', () => {
    expect(dec('0.1').plus('0.2').toFixed()).toBe('0.3');
  });
  it('applies explicit modes', () => {
    expect(cents('2.345', 'half_up').toFixed(2)).toBe('2.35');
    expect(cents('2.345', 'half_even').toFixed(2)).toBe('2.34');
    expect(cents('2.349', 'down').toFixed(2)).toBe('2.34');
    expect(roundToIncrement('270833.33', 10, 'down').toFixed()).toBe('270830');
    expect(roundToIncrement('745566.67', 250, 'up').toFixed()).toBe('745750');
    expect(roundDp('-1.5', 0, 'half_up').toFixed()).toBe('-2');
  });
});

describe('dates', () => {
  it('validates ISO dates and FY labels', () => {
    expect(isIsoDate('2024-02-29')).toBe(true);
    expect(isIsoDate('2025-02-29')).toBe(false);
    expect(isFinancialYear('2026-27')).toBe(true);
    expect(isFinancialYear('2026-28')).toBe(false);
    expect(isFinancialYear('1999-00')).toBe(true);
  });
  it('computes FY boundaries, ages and day counts', () => {
    expect(financialYearOf('2026-06-30')).toBe('2025-26');
    expect(financialYearOf('2026-07-01')).toBe('2026-27');
    expect(fyStart('2026-27')).toBe('2026-07-01');
    expect(fyEnd('2026-27')).toBe('2027-06-30');
    expect(daysInFy('2019-20')).toBe(366);
    expect(daysInFy('2026-27')).toBe(365);
    expect(ageOn('1960-10-12', '2026-10-11')).toBe(65);
    expect(ageOn('1960-10-11', '2026-10-11')).toBe(66);
    expect(daysInclusive('2020-01-01', '2020-06-30')).toBe(182);
  });
});

function rec(over: Partial<IdentifiedRecord> & Pick<IdentifiedRecord, 'effective_from'>): IdentifiedRecord {
  return {
    name: 'test.value',
    description: 'test',
    unit: 'AUD',
    effective_to: null,
    knowledge_date: '2020-01-01',
    verification: 'verified',
    legal_status: 'enacted',
    instrument: 'test',
    sources: [],
    jurisdiction: 'AU',
    kind: 'scalar',
    value: '1',
    id: `test.value@${over.effective_from}`,
    ...over,
  } as IdentifiedRecord;
}

function registryOf(records: IdentifiedRecord[]): ParameterRegistry {
  const bundle: ParameterBundle = { release: { hash: 'x', record_count: records.length, currency_date: '2026-01-01' }, records };
  return new ParameterRegistry(bundle);
}

describe('parameter registry and verification gate', () => {
  const reg = registryOf([
    rec({ effective_from: '2024-07-01', effective_to: '2025-06-30', value: '100' }),
    rec({ effective_from: '2025-07-01', effective_to: null, value: '200', knowledge_date: '2025-05-01' }),
    rec({ name: 'test.secondary', id: 'test.secondary@2024-07-01', effective_from: '2024-07-01', verification: 'secondary' }),
    rec({ name: 'test.conflict', id: 'test.conflict@2024-07-01', effective_from: '2024-07-01', verification: 'conflict' }),
    rec({ name: 'test.announced', id: 'test.announced@2024-07-01', effective_from: '2024-07-01', legal_status: 'announced' }),
  ]);

  it('resolves by effective date', () => {
    const ctx = new CalcContext(reg);
    expect(ctx.scalar('test.value', '2025-06-30').toFixed()).toBe('100');
    expect(ctx.scalar('test.value', '2025-07-01').toFixed()).toBe('200');
    expect(ctx.used.size).toBe(2);
  });

  it('resolves bitemporally by knowledge date', () => {
    const ctx = new CalcContext(reg, { knowledgeAsAt: '2025-04-30' });
    expect(() => ctx.scalar('test.value', '2025-07-01')).toThrow(BlockedCalculation);
  });

  it('blocks missing, secondary, conflicting and unenacted values', () => {
    const ctx = new CalcContext(reg);
    const codeOf = (fn: () => unknown) => {
      try {
        fn();
      } catch (e) {
        return (e as BlockedCalculation).reasons[0]?.code;
      }
      return 'none';
    };
    expect(codeOf(() => ctx.scalar('test.value', '2024-06-30'))).toBe('PARAMETER_MISSING');
    expect(codeOf(() => ctx.scalar('test.secondary', '2025-01-01'))).toBe('PARAMETER_UNVERIFIED');
    expect(codeOf(() => ctx.scalar('test.conflict', '2025-01-01'))).toBe('PARAMETER_CONFLICT');
    expect(codeOf(() => ctx.scalar('test.announced', '2025-01-01'))).toBe('PARAMETER_NOT_ENACTED');
  });
});

describe('bundled parameter release', () => {
  it('has a hash and only well-formed records', () => {
    expect(bundledParameters.release.hash).toMatch(/^[0-9a-f]{64}$/);
    expect(bundledParameters.records.length).toBe(bundledParameters.release.record_count);
  });
  it('engine version matches package.json', () => {
    expect(ENGINE_VERSION).toBe(pkg.version);
  });
});

describe('calculator runner and evidence bundle', () => {
  it('returns invalid with issues for bad input', () => {
    const r = runCalculator(incomeTaxCalculator, { financial_year: '2026', taxable_income: -5 }, defaultRegistry());
    expect(r.status).toBe('invalid');
    expect(r.issues?.length).toBeGreaterThan(0);
  });

  it('blocks when no parameter covers the year', () => {
    const r = runCalculator(incomeTaxCalculator, { financial_year: '2015-16', taxable_income: 50000 }, defaultRegistry());
    expect(r.status).toBe('blocked');
    expect(r.blocked?.[0]?.code).toBe('PARAMETER_MISSING');
  });

  it('produces a sealed, verifiable evidence bundle', () => {
    const r = runCalculator(incomeTaxCalculator, { financial_year: '2026-27', taxable_income: 100000 }, defaultRegistry());
    expect(r.status).toBe('ok');
    const b = createEvidenceBundle(r, '2026-10-11T00:00:00Z');
    expect(verifyEvidenceBundle(b)).toBe(true);
    const tampered = structuredClone(b);
    (tampered.response.result as Record<string, string>).income_tax = '1.00';
    expect(verifyEvidenceBundle(tampered)).toBe(false);
    // Deterministic: same input, same hashes.
    const b2 = createEvidenceBundle(runCalculator(incomeTaxCalculator, { financial_year: '2026-27', taxable_income: 100000 }, defaultRegistry()), '2026-10-11T00:00:00Z');
    expect(b2.hashes).toEqual(b.hashes);
    expect(r.parameters[0]?.sources[0]?.url).toMatch(/^https:\/\/www\.ato\.gov\.au\//);
  });
});
