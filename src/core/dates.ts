/**
 * Date helpers. Dates are ISO calendar dates (YYYY-MM-DD) with no time zone; all comparisons are
 * lexical on the ISO form, which is valid for 4-digit years.
 */

export type IsoDate = string;

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isIsoDate(s: string): boolean {
  const m = ISO_RE.exec(s);
  if (!m) return false;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (mo < 1 || mo > 12 || d < 1) return false;
  return d <= daysInMonth(y, mo);
}

export function assertIsoDate(s: string): IsoDate {
  if (!isIsoDate(s)) throw new RangeError(`Invalid ISO date: ${s}`);
  return s;
}

export function isLeapYear(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

export function daysInMonth(y: number, m: number): number {
  return [31, isLeapYear(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1] ?? 0;
}

export function parts(d: IsoDate): { y: number; m: number; d: number } {
  const m = ISO_RE.exec(assertIsoDate(d));
  // assertIsoDate guarantees a match
  return { y: Number(m![1]), m: Number(m![2]), d: Number(m![3]) };
}

/** Financial year label "YYYY-YY" in which the date falls (1 July – 30 June). */
export function financialYearOf(date: IsoDate): string {
  const { y, m } = parts(date);
  const start = m >= 7 ? y : y - 1;
  return fyLabel(start);
}

export function fyLabel(startYear: number): string {
  return `${startYear}-${String((startYear + 1) % 100).padStart(2, '0')}`;
}

const FY_RE = /^(\d{4})-(\d{2})$/;

export function isFinancialYear(fy: string): boolean {
  const m = FY_RE.exec(fy);
  if (!m) return false;
  return (Number(m[1]) + 1) % 100 === Number(m[2]);
}

export function fyStartYear(fy: string): number {
  if (!isFinancialYear(fy)) throw new RangeError(`Invalid financial year label: ${fy}`);
  return Number(fy.slice(0, 4));
}

/** First day (1 July) of a financial year. */
export function fyStart(fy: string): IsoDate {
  return `${fyStartYear(fy)}-07-01`;
}

/** Last day (30 June) of a financial year. */
export function fyEnd(fy: string): IsoDate {
  return `${fyStartYear(fy) + 1}-06-30`;
}

export function addFy(fy: string, n: number): string {
  return fyLabel(fyStartYear(fy) + n);
}

/** Days in a financial year (365 or 366). */
export function daysInFy(fy: string): number {
  return isLeapYear(fyStartYear(fy) + 1) ? 366 : 365;
}

/** Days since 1970-01-01 (UTC calendar arithmetic, no time zones). */
export function toDayNumber(date: IsoDate): number {
  const { y, m, d } = parts(date);
  return Math.round(Date.UTC(y, m - 1, d) / 86_400_000);
}

export function fromDayNumber(n: number): IsoDate {
  const dt = new Date(n * 86_400_000);
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const d = String(dt.getUTCDate()).padStart(2, '0');
  return `${String(y).padStart(4, '0')}-${m}-${d}`;
}

/** Inclusive day count from a to b (a <= b). */
export function daysInclusive(a: IsoDate, b: IsoDate): number {
  return toDayNumber(b) - toDayNumber(a) + 1;
}

/** Completed years of age on a date, given a date of birth. */
export function ageOn(dob: IsoDate, on: IsoDate): number {
  const b = parts(dob);
  const o = parts(on);
  let age = o.y - b.y;
  if (o.m < b.m || (o.m === b.m && o.d < b.d)) age -= 1;
  return age;
}

export function cmp(a: IsoDate, b: IsoDate): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
