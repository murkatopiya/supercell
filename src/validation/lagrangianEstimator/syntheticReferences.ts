/** TEST ONLY. Exact rationals and an independent ordered-bit binary-search rounding oracle.
 * Intentionally imports none of the tested arithmetic or allowances.
 */
export type Rational = Readonly<{ n: bigint; d: bigint }>;
export const rational = (n: bigint, d = 1n): Rational => {
  if (d <= 0n) throw new Error("Positive denominator required");
  return { n, d };
};
export const add = (a: Rational, b: Rational): Rational => rational(a.n * b.d + b.n * a.d, a.d * b.d);
export const subtract = (a: Rational, b: Rational): Rational => add(a, rational(-b.n, b.d));
export const multiply = (a: Rational, b: Rational): Rational => rational(a.n * b.n, a.d * b.d);
export const divide = (a: Rational, b: Rational): Rational => {
  if (b.n === 0n) throw new Error("Zero denominator");
  const sign = b.n < 0n ? -1n : 1n;
  return rational(a.n * b.d * sign, a.d * b.n * sign);
};
const absolute = (a: Rational): Rational => rational(a.n < 0n ? -a.n : a.n, a.d);
const compare = (a: Rational, b: Rational): number => {
  const delta = a.n * b.d - b.n * a.d;
  return delta < 0n ? -1 : delta > 0n ? 1 : 0;
};
export function referenceBits(x: number): bigint {
  const buffer = new ArrayBuffer(8), v = new DataView(buffer);
  v.setFloat64(0, x, true);
  return v.getBigUint64(0, true);
}
export function referenceFromBits(bits: bigint): number {
  const v = new DataView(new ArrayBuffer(8));
  v.setBigUint64(0, bits, true);
  return v.getFloat64(0, true);
}
export function exactNumber(x: number): Rational {
  if (!Number.isFinite(x)) throw new Error("Finite reference input required");
  const bits = referenceBits(x), exponent = Number((bits >> 52n) & 2047n);
  const fraction = bits & 0xfffffffffffffn;
  const significand = exponent === 0 ? fraction : fraction + 0x10000000000000n;
  const shift = exponent === 0 ? -1074 : exponent - 1075;
  const sign = bits >> 63n ? -1n : 1n;
  return shift >= 0 ? rational(sign * (significand << BigInt(shift)))
    : rational(sign * significand, 1n << BigInt(-shift));
}
/** Independent conversion: search representable positive values, compare exact distances. */
export function roundReference(value: Rational): number {
  const target = absolute(value), max = 0x7fefffffffffffffn;
  // Halfway from max finite toward conceptual next value 2^1024 rounds to infinity.
  const overflowThreshold = rational((1n << 1024n) - (1n << 970n));
  if (compare(target, overflowThreshold) >= 0) return value.n < 0n ? -Infinity : Infinity;
  let low = 0n, high = max;
  while (low < high) {
    const middle = (low + high + 1n) / 2n;
    if (compare(exactNumber(referenceFromBits(middle)), target) <= 0) low = middle;
    else high = middle - 1n;
  }
  let chosen = low;
  if (low !== max) {
    const down = subtract(target, exactNumber(referenceFromBits(low)));
    const up = subtract(exactNumber(referenceFromBits(low + 1n)), target);
    const order = compare(down, up);
    if (order > 0 || (order === 0 && (low & 1n) === 1n)) chosen++;
  }
  return chosen === 0n ? 0 : referenceFromBits(chosen | (value.n < 0n ? 1n << 63n : 0n));
}
/** Analytic areas computed from exact dyadic endpoints; no normalized implementation coefficients. */
export function referenceLinear(a: number, b: number, u: number, v: number): Readonly<{ signed: number; abs: number }> {
  const d = subtract(exactNumber(b), exactNumber(a));
  if (d.n <= 0n) throw new Error("Positive duration required");
  const left = exactNumber(u), right = exactNumber(v), two = rational(2n);
  const signed = divide(multiply(d, add(left, right)), two);
  let area: Rational;
  if ((u < 0 && v > 0) || (u > 0 && v < 0)) {
    // Find zero fraction, then sum two exact triangular areas independently.
    const fraction = divide(absolute(left), add(absolute(left), absolute(right)));
    const first = multiply(fraction, absolute(left));
    const second = multiply(subtract(rational(1n), fraction), absolute(right));
    area = divide(multiply(d, add(first, second)), two);
  } else area = divide(multiply(d, add(absolute(left), absolute(right))), two);
  return { signed: roundReference(signed), abs: roundReference(area) };
}
export function referenceSum(values: readonly number[]): number {
  return roundReference(values.map(exactNumber).reduce(add, rational(0n)));
}

/** Exact rational normalization by repeated factors of two, independent of bit decomposition. */
export function referenceScaledProduct(a: number, b: number, c: number): number {
  const factors = [a, b, c].map(exactNumber);
  if (factors.some(x => x.n === 0n)) return 0;
  let exponent = 0;
  const mantissas = factors.map(x => {
    while (compare(absolute(x), rational(2n)) >= 0) { x = divide(x, rational(2n)); exponent++; }
    while (compare(absolute(x), rational(1n)) < 0) { x = multiply(x, rational(2n)); exponent--; }
    return x;
  });
  const first = exactNumber(roundReference(multiply(mantissas[0], mantissas[1])));
  const second = exactNumber(roundReference(multiply(first, mantissas[2])));
  const power = exponent >= 0 ? rational(1n << BigInt(exponent)) : rational(1n, 1n << BigInt(-exponent));
  return roundReference(multiply(second, power));
}
