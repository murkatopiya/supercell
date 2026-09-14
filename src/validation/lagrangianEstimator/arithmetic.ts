/** Frozen P2 §12. No providers, trajectories, scientific budgets or I/O. */
import type { ArithmeticResult, ArithmeticFailure, Binary64Parts, Interval,
  LinearInterval, LinearIntegrals, ArithmeticAllowance } from "./types.js";

class Fault extends Error {
  constructor(readonly failure: ArithmeticFailure) { super(failure.operation); }
}
function fail(operation: string, code: ArithmeticFailure["code"] = "NONFINITE_ARITHMETIC"): never {
  throw new Fault({ status: "FAILED", code, operation });
}
function finite(x: number, operation: string): number {
  if (!Number.isFinite(x)) fail(operation);
  return x;
}
function checked<T>(work: () => T): ArithmeticResult<T> {
  try { return { status: "COMPLETE", value: work() }; }
  catch (e) { if (e instanceof Fault) return e.failure; throw e; }
}
function unwrap<T>(r: ArithmeticResult<T>): T {
  if (r.status === "FAILED") throw new Fault(r);
  return r.value;
}
export function normalizeExactZero(x: number): number { return x === 0 ? 0 : x; }
const FRACTION = (1n << 52n) - 1n;
const SIGN = 1n << 63n;
function bits(x: number): bigint {
  const view = new DataView(new ArrayBuffer(8));
  view.setFloat64(0, x, false);
  return view.getBigUint64(0, false);
}
function fromBits(x: bigint): number {
  const view = new DataView(new ArrayBuffer(8));
  view.setBigUint64(0, x, false);
  return view.getFloat64(0, false);
}
/** Zero has mantissa 0/exponent 0. Nonzero mantissa magnitude is [1,2). */
function decompose(x: number): Binary64Parts {
  finite(x, "decompose/input");
  if (x === 0) return { mantissa: 0, exponent: 0 };
  const raw = bits(x), negative = (raw & SIGN) !== 0n;
  const field = Number((raw >> 52n) & 2047n);
  let fraction = raw & FRACTION;
  let exponent: number;
  if (field === 0) {
    let shifts = 0;
    while (fraction < (1n << 52n)) { fraction <<= 1n; shifts++; }
    exponent = -1022 - shifts;
    fraction &= FRACTION;
  } else exponent = field - 1023;
  const mantissa = fromBits((negative ? SIGN : 0n) | (1023n << 52n) | fraction);
  return { mantissa, exponent };
}
export function decomposeBinary64(x: number): ArithmeticResult<Binary64Parts> {
  return checked(() => decompose(x));
}
/** Scale an already rounded normal mantissa product once; no floating power. */
function scaleRounded(product: number, exponent: number): number {
  if (product === 0) return 0;
  const raw = bits(product), sign = raw & SIGN;
  const field = Number((raw >> 52n) & 2047n);
  const significand = (1n << 52n) | (raw & FRACTION);
  const unbiased = field - 1023 + exponent;
  if (unbiased > 1023) fail("scaledProduct3/overflow");
  if (unbiased >= -1022) {
    return fromBits(sign | (BigInt(unbiased + 1023) << 52n) | (raw & FRACTION));
  }
  // Express result in units of eta. Right shift with one ties-even rounding.
  const shift = BigInt(-1022 - unbiased);
  const lower = significand >> shift;
  const remainder = significand - (lower << shift);
  const half = 1n << (shift - 1n);
  const roundUp = remainder > half || (remainder === half && (lower & 1n) === 1n);
  const rounded = lower + (roundUp ? 1n : 0n);
  if (rounded === 0n) return 0;
  // 2^52 naturally encodes the carry from largest subnormal to smallest normal.
  return fromBits(sign | rounded);
}
function product3(a: number, b: number, c: number): number {
  const x = decompose(a), y = decompose(b), z = decompose(c);
  if (a === 0 || b === 0 || c === 0) return 0;
  const first = finite(x.mantissa * y.mantissa, "scaledProduct3/first");
  const second = finite(first * z.mantissa, "scaledProduct3/second");
  return scaleRounded(second, x.exponent + y.exponent + z.exponent);
}
export function scaledProduct3(a: number, b: number, c: number): ArithmeticResult<number> {
  return checked(() => product3(a, b, c));
}
function duration(a: number, b: number): number {
  finite(a, "interval/a"); finite(b, "interval/b");
  const d = finite(b - a, "interval/duration");
  if (!(d > 0)) fail("interval/nonpositive", "INVALID_INPUT");
  return d;
}
export function localLinearIntegrals(a: number, b: number, u: number, v: number): ArithmeticResult<LinearIntegrals> {
  return checked(() => {
    const d = duration(a, b);
    finite(u, "linear/u"); finite(v, "linear/v");
    const m = Math.max(Math.abs(u), Math.abs(v));
    if (m === 0) return { signed: 0, abs: 0, zeroFraction: null };
    const p = finite(u / m, "linear/p"), q = finite(v / m, "linear/q");
    const cs = finite((p + q) / 2, "linear/cs");
    const opposite = (u < 0 && v > 0) || (u > 0 && v < 0);
    const denominator = Math.abs(p) + Math.abs(q);
    const ca = opposite ? ((p * p + q * q) / denominator) / 2 : denominator / 2;
    finite(ca, "linear/ca");
    return { signed: product3(d, m, cs), abs: product3(d, m, ca),
      zeroFraction: opposite ? finite(Math.abs(p) / denominator, "linear/mu") : null };
  });
}
/** Sticky failures; an empty stream is the algebraic sum zero, not an exposure. */
export class NeumaierAccumulator {
  private s = 0;
  private c = 0;
  private failure: ArithmeticFailure | null = null;
  add(x: number): ArithmeticResult<null> {
    if (this.failure) return this.failure;
    const result = checked(() => {
      finite(x, "neumaier/input");
      const t = finite(this.s + x, "neumaier/t");
      let r: number;
      if (Math.abs(this.s) >= Math.abs(x)) {
        const difference = finite(this.s - t, "neumaier/s-t");
        r = finite(difference + x, "neumaier/r");
      } else {
        const difference = finite(x - t, "neumaier/x-t");
        r = finite(difference + this.s, "neumaier/r");
      }
      const correction = finite(this.c + r, "neumaier/c");
      this.c = correction;
      this.s = t;
      return null;
    });
    if (result.status === "FAILED") this.failure = result;
    return result;
  }
  total(): ArithmeticResult<number> {
    if (this.failure) return this.failure;
    const result = checked(() => normalizeExactZero(finite(this.s + this.c, "neumaier/result")));
    if (result.status === "FAILED") this.failure = result;
    return result;
  }
}
function sum(values: readonly number[]): number {
  const a = new NeumaierAccumulator();
  for (const x of values) unwrap(a.add(x));
  return unwrap(a.total());
}
const E = 2 ** -52;
const ETA = Number.MIN_VALUE;
function gammaValue(k: number): number {
  if (!Number.isSafeInteger(k) || k <= 0) fail("gamma/k", "INVALID_INPUT");
  const ke = finite(k * E, "gamma/ke");
  if (!(ke < 1)) fail("gamma/domain", "INVALID_INPUT");
  return finite(ke / (1 - ke), "gamma/result");
}
export function gamma(k: number): ArithmeticResult<number> { return checked(() => gammaValue(k)); }
function allowance(k: number, scale: number): ArithmeticAllowance {
  finite(scale, "allowance/scale");
  if (scale < 0) fail("allowance/negative-scale", "INVALID_INPUT");
  const relative = finite(gammaValue(k) * scale, "allowance/relative");
  const absolute = finite(k * ETA, "allowance/absolute");
  const bound = finite(relative + absolute, "allowance/bound");
  return { k, scale, bound };
}
export function durationAllowance(intervals: readonly Interval[], h: number): ArithmeticResult<ArithmeticAllowance> {
  return checked(() => {
    if (!intervals.length || !Number.isFinite(h) || h <= 0) fail("durationAllowance/input", "INVALID_INPUT");
    const terms = intervals.map(({ a, b }) => {
      duration(a, b);
      return finite(Math.abs(a) + Math.abs(b), "durationAllowance/term");
    });
    const scale = finite(sum([...terms, Math.abs(h)]), "durationAllowance/scale");
    return allowance(8 * intervals.length + 16, scale);
  });
}
function magnitudeScale(intervals: readonly LinearInterval[]): number {
  return sum(intervals.map(({ a, b, u, v }) => {
    const d = duration(a, b);
    finite(u, "scale/u"); finite(v, "scale/v");
    return product3(d, Math.max(Math.abs(u), Math.abs(v)), 1);
  }));
}
export function exposureAllowance(intervals: readonly LinearInterval[]): ArithmeticResult<ArithmeticAllowance> {
  return checked(() => {
    if (!intervals.length) fail("exposureAllowance/empty", "INVALID_INPUT");
    return allowance(64 * (intervals.length + 1), magnitudeScale(intervals));
  });
}
/** Inputs are analytic fixture magnitudes. No scientific residual is accepted or changed. */
export function syntheticReferenceAllowance(
  intervals: readonly LinearInterval[],
  normalization?: Readonly<{ T: number; reference: number }>,
  otherPath?: readonly LinearInterval[],
): ArithmeticResult<ArithmeticAllowance> {
  return checked(() => {
    if (!intervals.length) fail("syntheticAllowance/empty", "INVALID_INPUT");
    let scale = magnitudeScale(intervals);
    if (otherPath) {
      if (otherPath.length !== intervals.length || otherPath.some((x, i) => x.a !== intervals[i].a || x.b !== intervals[i].b))
        fail("syntheticAllowance/common-partition", "INVALID_INPUT");
      scale = sum([scale, magnitudeScale(otherPath)]);
    }
    const result = allowance(64 * (intervals.length + 1), scale);
    if (!normalization) return result;
    const { T, reference } = normalization;
    if (!Number.isFinite(T) || T <= 0) fail("syntheticAllowance/T", "INVALID_INPUT");
    finite(reference, "syntheticAllowance/reference");
    const divided = finite(result.bound / T, "syntheticAllowance/divided");
    const correction = finite(E * Math.abs(reference), "syntheticAllowance/correction");
    return { ...result, bound: finite(divided + correction, "syntheticAllowance/bound") };
  });
}
