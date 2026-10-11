/**
 * Decimal arithmetic for the engine. Binary floating point is never used for money or rates.
 *
 * A dedicated Decimal constructor is cloned so the engine's precision and default rounding mode
 * cannot be changed by (or leak into) other users of decimal.js in the same process.
 */
import { Decimal as DecimalJs } from 'decimal.js';

export const D = DecimalJs.clone({
  precision: 40,
  rounding: DecimalJs.ROUND_HALF_UP,
  toExpNeg: -30,
  toExpPos: 40,
});
export type Dec = InstanceType<typeof D>;
export type DecInput = Dec | string | number;

export const ZERO = new D(0);
export const ONE = new D(1);

export function dec(v: DecInput): Dec {
  if (typeof v === 'number' && !Number.isFinite(v)) {
    throw new RangeError(`Non-finite number cannot be converted to Decimal: ${v}`);
  }
  return v instanceof D ? v : new D(v);
}

export function max(...xs: DecInput[]): Dec {
  return D.max(...xs.map(dec));
}

export function min(...xs: DecInput[]): Dec {
  return D.min(...xs.map(dec));
}

export function clamp(x: DecInput, lo: DecInput, hi: DecInput): Dec {
  return max(lo, min(hi, x));
}

/** Rounding modes used explicitly by rules. Each rule must name the mode it applies. */
export type RoundingMode =
  | 'half_up' // commercial rounding (0.5 away from zero)
  | 'half_even' // banker's rounding
  | 'down' // toward zero (truncate)
  | 'up' // away from zero
  | 'floor' // toward -infinity
  | 'ceil'; // toward +infinity

const MODE: Record<RoundingMode, DecimalJs.Rounding> = {
  half_up: DecimalJs.ROUND_HALF_UP,
  half_even: DecimalJs.ROUND_HALF_EVEN,
  down: DecimalJs.ROUND_DOWN,
  up: DecimalJs.ROUND_UP,
  floor: DecimalJs.ROUND_FLOOR,
  ceil: DecimalJs.ROUND_CEIL,
};

/** Round to a number of decimal places with an explicit mode. */
export function roundDp(x: DecInput, dp: number, mode: RoundingMode): Dec {
  return dec(x).toDecimalPlaces(dp, MODE[mode]);
}

/** Round to a multiple of `increment` (e.g. 10 dollars, 250 dollars) with an explicit mode. */
export function roundToIncrement(x: DecInput, increment: DecInput, mode: RoundingMode): Dec {
  const inc = dec(increment);
  if (inc.lte(0)) throw new RangeError('Rounding increment must be positive');
  return dec(x).div(inc).toDecimalPlaces(0, MODE[mode]).mul(inc);
}

/** Round to cents with an explicit mode. */
export function cents(x: DecInput, mode: RoundingMode = 'half_up'): Dec {
  return roundDp(x, 2, mode);
}

/** Serialise a Decimal for JSON output: plain notation, no exponent, trailing zeros trimmed. */
export function toJson(x: Dec): string {
  return x.toFixed();
}

/** Serialise money to exactly two decimal places (value must already be rounded by the rule). */
export function money(x: Dec): string {
  return x.toFixed(2);
}
