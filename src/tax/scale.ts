import { dec, max, min, ZERO, type Dec } from '../core/decimal.js';

export interface ScaleBand {
  over: Dec;
  rate: Dec;
  upTo: Dec | null;
  taxable: Dec;
  tax: Dec;
}

/**
 * Marginal scale: each rate applies to each dollar over its threshold up to the next threshold.
 *   tax(x) = Σ rate_b × max(0, min(x, over_{b+1}) − over_b)
 * Unrounded; the caller applies the rule's rounding.
 */
export function marginalTax(brackets: Array<{ over: Dec; rate: Dec }>, income: Dec): { tax: Dec; bands: ScaleBand[]; marginalRate: Dec } {
  let tax = ZERO;
  let marginalRate = ZERO;
  const bands: ScaleBand[] = [];
  brackets.forEach((b, i) => {
    const next = brackets[i + 1];
    const upTo = next ? next.over : null;
    const top = upTo ? min(income, upTo) : income;
    const taxable = max(0, top.minus(b.over));
    const bandTax = taxable.mul(b.rate);
    if (income.gt(b.over)) marginalRate = b.rate;
    tax = tax.plus(bandTax);
    bands.push({ over: b.over, rate: b.rate, upTo, taxable, tax: bandTax });
  });
  return { tax, bands, marginalRate };
}

/** Format a Decimal with thousands separators for trace workings. */
export function fmt(x: Dec | number | string): string {
  const d = dec(x);
  const neg = d.isNeg();
  const [i, f] = d.abs().toFixed().split('.');
  const withCommas = (i ?? '0').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  // Money-style display: a single decimal digit is padded (855.9 → 855.90); other precision is kept.
  const frac = f ? (f.length === 1 ? `${f}0` : f) : '';
  return `${neg ? '−' : ''}${withCommas}${frac ? `.${frac}` : ''}`;
}
