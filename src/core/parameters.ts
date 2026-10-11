/**
 * Parameter record schema. Parameters are effective-dated facts taken from cited sources; rules
 * (code) read them through the registry and never hard-code a threshold or rate.
 */
import { z } from 'zod';
import { isIsoDate } from './dates.js';

const isoDate = z.string().refine(isIsoDate, 'must be an ISO date YYYY-MM-DD');
/** Decimal numbers are carried as strings so no binary float ever touches a value. */
const decimalString = z.string().regex(/^-?\d+(\.\d+)?$/, 'must be a plain decimal string');

/** How well a value is supported by sources. Only `verified` and `derived` may be used. */
export const VerificationStatus = z.enum([
  'verified', // read on a primary government/legislative source (cited)
  'derived', // computed exactly from verified values (derivation stated in notes)
  'secondary', // only seen on non-government sources
  'unverified', // not sourced
  'conflict', // primary sources disagree
]);
export type VerificationStatus = z.infer<typeof VerificationStatus>;

/** Legal status of the rule or value. */
export const LegalStatus = z.enum([
  'enacted', // in force, or legislated with a future commencement
  'instrument', // set by a legislative instrument, determination or statutory indexation
  'administrative', // published official default (e.g. ASIC instrument defaults, MoneySmart)
  'convention', // professional convention with no regulator standard (insurance-needs defaults)
  'announced', // announced, not legislated
  'exposure_draft',
  'superseded',
]);
export type LegalStatus = z.infer<typeof LegalStatus>;

export const SourceRef = z.object({
  url: z.string().url(),
  title: z.string(),
  accessed: isoDate,
  page_updated: isoDate.optional(),
  /** Short locator or quote (< 15 words) identifying where the value appears. */
  locator: z.string().max(200).optional(),
  primary: z.boolean(),
});
export type SourceRef = z.infer<typeof SourceRef>;

export const Bracket = z.object({
  /** Lower bound: the rate applies to each dollar OVER this amount. */
  over: decimalString,
  rate: decimalString,
});
export type Bracket = z.infer<typeof Bracket>;

export const Band = z.object({
  /** Inclusive lower bound of the band (numeric key, e.g. an age). */
  from: decimalString,
  value: decimalString,
});
export type Band = z.infer<typeof Band>;

export const DateBand = z.object({
  /** Inclusive lower bound date (e.g. date of birth on or after). */
  from: isoDate,
  value: decimalString,
});
export type DateBand = z.infer<typeof DateBand>;

const base = {
  name: z.string().regex(/^[a-z0-9_]+(\.[a-z0-9_]+)+$/, 'dotted lower-case name, e.g. tax.resident_scale'),
  description: z.string().min(1),
  unit: z.string().min(1),
  effective_from: isoDate,
  effective_to: isoDate.nullable(),
  /** Date the value became knowable (publication / assent), for as-known-at resolution. */
  knowledge_date: isoDate,
  verification: VerificationStatus,
  legal_status: LegalStatus,
  instrument: z.string().min(1),
  sources: z.array(SourceRef),
  notes: z.string().optional(),
  jurisdiction: z.string().default('AU'),
};

export const ParameterRecord = z.discriminatedUnion('kind', [
  z.object({ ...base, kind: z.literal('scalar'), value: decimalString }),
  z.object({ ...base, kind: z.literal('table'), value: z.record(z.string(), decimalString) }),
  z.object({ ...base, kind: z.literal('brackets'), value: z.array(Bracket).min(1) }),
  z.object({ ...base, kind: z.literal('bands'), value: z.array(Band).min(1) }),
  z.object({ ...base, kind: z.literal('date_bands'), value: z.array(DateBand).min(1) }),
]);
export type ParameterRecord = z.infer<typeof ParameterRecord>;
export type ParameterKind = ParameterRecord['kind'];
export type IdentifiedRecord = ParameterRecord & { id: string };

export interface ParameterBundle {
  release: {
    /** SHA-256 of the canonical JSON of `records`. */
    hash: string;
    record_count: number;
    /** Latest knowledge_date across records: the "parameter currency" of the release. */
    currency_date: string;
  };
  records: IdentifiedRecord[];
}

export function recordId(r: Pick<ParameterRecord, 'name' | 'effective_from'>): string {
  return `${r.name}@${r.effective_from}`;
}

/** True when the record may be used to produce a result. */
export function isUsable(r: Pick<ParameterRecord, 'verification' | 'legal_status'>): boolean {
  const verifiedEnough = r.verification === 'verified' || r.verification === 'derived';
  const lawEnough =
    r.legal_status === 'enacted' ||
    r.legal_status === 'instrument' ||
    r.legal_status === 'administrative' ||
    r.legal_status === 'convention';
  return verifiedEnough && lawEnough;
}
