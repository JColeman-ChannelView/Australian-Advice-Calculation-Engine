/**
 * Shared input schemas. Amounts are accepted as JSON numbers or decimal strings and normalised to
 * decimal strings, so rules convert them to Decimal without passing through binary floats twice.
 */
import { z } from 'zod';
import { isFinancialYear, isIsoDate } from './dates.js';

const DECIMAL_RE = /^-?\d+(\.\d+)?$/;

function decimalInput(opts: {
  min?: number;
  description: string;
  nonNegative?: boolean;
  kind?: 'amount' | 'signed-amount' | 'rate';
  check?: { fn: (s: string) => boolean; message: string };
}) {
  return z
    .union([z.number().finite(), z.string().regex(DECIMAL_RE, 'must be a decimal number')])
    .transform((v) => (typeof v === 'number' ? String(v) : v))
    .refine((s) => !/e/i.test(s), 'exponent notation is not accepted')
    .refine((s) => (opts.nonNegative ? !s.startsWith('-') : true), 'must not be negative')
    .refine((s) => (opts.min === undefined ? true : Number(s) >= opts.min), `must be at least ${opts.min}`)
    .refine((s) => (opts.check ? opts.check.fn(s) : true), opts.check?.message ?? 'invalid')
    .meta({ 'x-kind': opts.kind ?? 'amount' })
    .describe(opts.description);
}

/** Non-negative dollar amount. */
export const amount = (description: string) => decimalInput({ description, nonNegative: true, kind: 'amount' });
/** Dollar amount that may be negative (e.g. net losses). */
export const signedAmount = (description: string) => decimalInput({ description, kind: 'signed-amount' });
/** Rate as a decimal fraction (0.05 = 5%). */
export const rate = (description: string) =>
  decimalInput({
    description,
    kind: 'rate',
    check: { fn: (s) => Number(s) > -1 && Number(s) < 1, message: 'rate must be a fraction between -1 and 1 (e.g. 0.05 for 5%)' },
  });

export const financialYear = (description = 'Financial year, e.g. "2026-27"') =>
  z.string().refine(isFinancialYear, 'must be a financial year label like "2026-27"').meta({ 'x-kind': 'financial-year' }).describe(description);

export const isoDate = (description: string) =>
  z.string().refine(isIsoDate, 'must be an ISO date YYYY-MM-DD').meta({ format: 'date' }).describe(description);

export const age = (description = 'Age in completed years') =>
  z.number().int().min(0).max(120).describe(description);
