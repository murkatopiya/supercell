import { captureValue, enterCapture, bindCapture, boundCapture, type CaptureContext } from "./capture.js";
/** Frozen P2 §12. No providers, trajectories, scientific budgets or I/O. */
import type { ArithmeticResult, ArithmeticFailure, Binary64Parts, Interval,
  LinearInterval, LinearIntegrals, ArithmeticAllowance } from "./types.js";

class Fault extends Error {
  constructor(readonly failure: ArithmeticFailure) { super(failure.operation); }
}
function fail(operation: string, code: ArithmeticFailure["code"] = "NONFINITE_ARITHMETIC", capture?: CaptureContext): never {
  capture = enterCapture(capture, "arithmetic/fail");
  captureValue(capture, "input/operation", operation);
  captureValue(capture, "input/code", code);

  throw captureValue(capture, "arithmetic/site-I/throw", new Fault({ status: "FAILED", code, operation }));
}
function finite(x: number, operation: string, capture?: CaptureContext): number {
  capture = enterCapture(capture, "arithmetic/finite");
  captureValue(capture, "input/x", x);
  captureValue(capture, "input/operation", operation);

  if (!Number.isFinite(x)) fail(operation, undefined, capture);
  return captureValue(capture, "arithmetic/site-BC/return", x);
}
function checked<T>(work: () => T, capture?: CaptureContext): ArithmeticResult<T> {
  capture = enterCapture(capture, "arithmetic/checked");
  captureValue(capture, "input/work", work);

  try { return captureValue(capture, "arithmetic/site-BF/return", { status: "COMPLETE", value: work() }); }
  catch (e) { captureValue(capture, "arithmetic/site-BG/caught", undefined);  if (e instanceof Fault) return captureValue(capture, "arithmetic/site-BG/return", e.failure); throw captureValue(capture, "arithmetic/site-BG/throw", e); }
}
function unwrap<T>(r: ArithmeticResult<T>, capture?: CaptureContext): T {
  capture = enterCapture(capture, "arithmetic/unwrap");
  captureValue(capture, "input/r", r);

  if (r.status === "FAILED") throw captureValue(capture, "arithmetic/site-BJ/throw", new Fault(r));
  return captureValue(capture, "arithmetic/site-CA/return", r.value);
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
function decompose(x: number, capture?: CaptureContext): Binary64Parts {
  capture = enterCapture(capture, "arithmetic/decompose");
  captureValue(capture, "input/x", x);

  finite(x, "decompose/input", capture);
  if (x === 0) return captureValue(capture, "arithmetic/site-DI/return", { mantissa: 0, exponent: 0 });
  const raw = captureValue(capture, "arithmetic/site-DJ/local/raw", bits(x)), negative = captureValue(capture, "arithmetic/site-DJ/local/negative", (raw & SIGN) !== 0n);
  const field = captureValue(capture, "arithmetic/site-EA/local/field", Number((raw >> 52n) & 2047n));
  let fraction = captureValue(capture, "arithmetic/site-EB/local/fraction", raw & FRACTION);
  let exponent: number;
  if (field === 0) {
    let shifts = captureValue(capture, "arithmetic/site-EE/local/shifts", 0);
    while (fraction < (1n << 52n)) { fraction <<= 1n; shifts++; }
    exponent = captureValue(capture, "arithmetic/site-EG/assign/exponent", -1022 - shifts);
    fraction &= FRACTION;
  } else exponent = captureValue(capture, "arithmetic/site-EI/assign/exponent", field - 1023);
  const mantissa = captureValue(capture, "arithmetic/site-EJ/local/mantissa", fromBits((negative ? SIGN : 0n) | (1023n << 52n) | fraction));
  return captureValue(capture, "arithmetic/site-FA/return", { mantissa, exponent });
}
export function decomposeBinary64(x: number, capture?: CaptureContext): ArithmeticResult<Binary64Parts> {
  capture = enterCapture(capture, "arithmetic/decomposeBinary64");
  captureValue(capture, "input/x", x);

  return captureValue(capture, "arithmetic/site-FD/return", checked(() => decompose(x, capture), capture));
}
/** Scale an already rounded normal mantissa product once; no floating power. */
function scaleRounded(product: number, exponent: number, capture?: CaptureContext): number {
  capture = enterCapture(capture, "arithmetic/scaleRounded");
  captureValue(capture, "input/product", product);
  captureValue(capture, "input/exponent", exponent);

  if (product === 0) return captureValue(capture, "arithmetic/site-FH/return", 0);
  const raw = captureValue(capture, "arithmetic/site-FI/local/raw", bits(product)), sign = captureValue(capture, "arithmetic/site-FI/local/sign", raw & SIGN);
  const field = captureValue(capture, "arithmetic/site-FJ/local/field", Number((raw >> 52n) & 2047n));
  const significand = captureValue(capture, "arithmetic/site-GA/local/significand", (1n << 52n) | (raw & FRACTION));
  const unbiased = captureValue(capture, "arithmetic/site-GB/local/unbiased", field - 1023 + exponent);
  if (unbiased > 1023) fail("scaledProduct3/overflow", undefined, capture);
  if (unbiased >= -1022) {
    return captureValue(capture, "arithmetic/site-GE/return", fromBits(sign | (BigInt(unbiased + 1023) << 52n) | (raw & FRACTION)));
  }
  // Express result in units of eta. Right shift with one ties-even rounding.
  const shift = captureValue(capture, "arithmetic/site-GH/local/shift", BigInt(-1022 - unbiased));
  const lower = captureValue(capture, "arithmetic/site-GI/local/lower", significand >> shift);
  const remainder = captureValue(capture, "arithmetic/site-GJ/local/remainder", significand - (lower << shift));
  const half = captureValue(capture, "arithmetic/site-HA/local/half", 1n << (shift - 1n));
  const roundUp = captureValue(capture, "arithmetic/site-HB/local/roundUp", remainder > half || (remainder === half && (lower & 1n) === 1n));
  const rounded = captureValue(capture, "arithmetic/site-HC/local/rounded", lower + (roundUp ? 1n : 0n));
  if (rounded === 0n) return captureValue(capture, "arithmetic/site-HD/return", 0);
  // 2^52 naturally encodes the carry from largest subnormal to smallest normal.
  return captureValue(capture, "arithmetic/site-HF/return", fromBits(sign | rounded));
}
function product3(a: number, b: number, c: number, capture?: CaptureContext): number {
  capture = enterCapture(capture, "arithmetic/product3");
  captureValue(capture, "input/a", a);
  captureValue(capture, "input/b", b);
  captureValue(capture, "input/c", c);

  const x = captureValue(capture, "arithmetic/site-HI/local/x", decompose(a, capture)), y = captureValue(capture, "arithmetic/site-HI/local/y", decompose(b, capture)), z = captureValue(capture, "arithmetic/site-HI/local/z", decompose(c, capture));
  if (a === 0 || b === 0 || c === 0) return captureValue(capture, "arithmetic/site-HJ/return", 0);
  const first = captureValue(capture, "arithmetic/site-IA/local/first", finite(x.mantissa * y.mantissa, "scaledProduct3/first", capture));
  const second = captureValue(capture, "arithmetic/site-IB/local/second", finite(first * z.mantissa, "scaledProduct3/second", capture));
  return captureValue(capture, "arithmetic/site-IC/return", scaleRounded(second, x.exponent + y.exponent + z.exponent, capture));
}
export function scaledProduct3(a: number, b: number, c: number, capture?: CaptureContext): ArithmeticResult<number> {
  capture = enterCapture(capture, "arithmetic/scaledProduct3");
  captureValue(capture, "input/a", a);
  captureValue(capture, "input/b", b);
  captureValue(capture, "input/c", c);

  return captureValue(capture, "arithmetic/site-IF/return", checked(() => product3(a, b, c, capture), capture));
}
function duration(a: number, b: number, capture?: CaptureContext): number {
  capture = enterCapture(capture, "arithmetic/duration");
  captureValue(capture, "input/a", a);
  captureValue(capture, "input/b", b);

  finite(a, "interval/a", capture); finite(b, "interval/b", capture);
  const d = captureValue(capture, "arithmetic/site-IJ/local/d", finite(b - a, "interval/duration", capture));
  if (!(d > 0)) fail("interval/nonpositive", "INVALID_INPUT", capture);
  return captureValue(capture, "arithmetic/site-JB/return", d);
}
export function localLinearIntegrals(a: number, b: number, u: number, v: number, capture?: CaptureContext): ArithmeticResult<LinearIntegrals> {
  capture = enterCapture(capture, "arithmetic/localLinearIntegrals");
  captureValue(capture, "input/a", a);
  captureValue(capture, "input/b", b);
  captureValue(capture, "input/u", u);
  captureValue(capture, "input/v", v);

  return captureValue(capture, "arithmetic/site-JE/return", checked(() => {
    const d = captureValue(capture, "arithmetic/site-JF/local/d", duration(a, b, capture));
    finite(u, "linear/u", capture); finite(v, "linear/v", capture);
    const m = captureValue(capture, "arithmetic/site-JH/local/m", Math.max(Math.abs(u), Math.abs(v)));
    if (m === 0) return captureValue(capture, "arithmetic/site-JI/return", { signed: 0, abs: 0, zeroFraction: null });
    const p = captureValue(capture, "arithmetic/site-JJ/local/p", finite(u / m, "linear/p", capture)), q = captureValue(capture, "arithmetic/site-JJ/local/q", finite(v / m, "linear/q", capture));
    const cs = captureValue(capture, "arithmetic/site-BAA/local/cs", finite((p + q) / 2, "linear/cs", capture));
    const opposite = captureValue(capture, "arithmetic/site-BAB/local/opposite", (u < 0 && v > 0) || (u > 0 && v < 0));
    const denominator = captureValue(capture, "arithmetic/site-BAC/local/denominator", Math.abs(p) + Math.abs(q));
    const ca = captureValue(capture, "arithmetic/site-BAD/local/ca", opposite ? ((p * p + q * q) / denominator) / 2 : denominator / 2);
    finite(ca, "linear/ca", capture);
    return captureValue(capture, "arithmetic/site-BAF/return", { signed: product3(d, m, cs, capture), abs: product3(d, m, ca, capture),
      zeroFraction: opposite ? finite(Math.abs(p) / denominator, "linear/mu", capture) : null });
  }, capture));
}
/** Sticky failures; an empty stream is the algebraic sum zero, not an exposure. */
export class NeumaierAccumulator {
  constructor(capture?: CaptureContext) { bindCapture(this, capture); }

  private s = 0;
  private c = 0;
  private failure: ArithmeticFailure | null = null;
  add(x: number): ArithmeticResult<null> {
    const capture = enterCapture(boundCapture(this), "arithmetic/Neumaier/add");
    captureValue(capture, "neumaier/pre-s", this.s);
    captureValue(capture, "neumaier/pre-c", this.c);
    captureValue(capture, "neumaier/x", x);

    if (this.failure) return captureValue(capture, "arithmetic/site-BBF/return", this.failure);
    const result = captureValue(capture, "arithmetic/site-BBG/local/result", checked(() => {
      finite(x, "neumaier/input", capture);
      const t = captureValue(capture, "arithmetic/site-BBI/local/t", finite(this.s + x, "neumaier/t", capture));
      let r: number;
      if (Math.abs(this.s) >= Math.abs(x)) {
        const difference = captureValue(capture, "arithmetic/site-BCB/local/difference", finite(this.s - t, "neumaier/s-t", capture));
        r = captureValue(capture, "arithmetic/site-BCC/assign/r", finite(difference + x, "neumaier/r", capture));
      } else {
        const difference = captureValue(capture, "arithmetic/site-BCE/local/difference", finite(x - t, "neumaier/x-t", capture));
        r = captureValue(capture, "arithmetic/site-BCF/assign/r", finite(difference + this.s, "neumaier/r", capture));
      }
      const correction = captureValue(capture, "arithmetic/site-BCH/local/correction", finite(this.c + r, "neumaier/c", capture));
      this.c = captureValue(capture, "arithmetic/site-BCI/assign/this.c", correction);
      this.s = captureValue(capture, "arithmetic/site-BCJ/assign/this.s", t);
      captureValue(capture, "neumaier/committed-s", this.s);
      captureValue(capture, "neumaier/committed-c", this.c);
      return captureValue(capture, "arithmetic/site-BDA/return", null);
    }, capture));
    if (result.status === "FAILED") this.failure = captureValue(capture, "arithmetic/site-BDC/assign/this.failure", result);
    return captureValue(capture, "arithmetic/site-BDD/return", result);
  }
  total(): ArithmeticResult<number> {
    const capture = enterCapture(boundCapture(this), "arithmetic/Neumaier/total");
    captureValue(capture, "neumaier/pre-s", this.s);
    captureValue(capture, "neumaier/pre-c", this.c);

    if (this.failure) return captureValue(capture, "arithmetic/site-BDG/return", this.failure);
    const result = captureValue(capture, "arithmetic/site-BDH/local/result", checked(() => normalizeExactZero(finite(this.s + this.c, "neumaier/result", capture)), capture));
    if (result.status === "FAILED") this.failure = captureValue(capture, "arithmetic/site-BDI/assign/this.failure", result);
    return captureValue(capture, "arithmetic/site-BDJ/return", result);
  }
}
function sum(values: readonly number[], capture?: CaptureContext): number {
  capture = enterCapture(capture, "arithmetic/sum");
  captureValue(capture, "input/values", values);

  const a = captureValue(capture, "arithmetic/site-BED/local/a", new NeumaierAccumulator(enterCapture(capture, "arithmetic/site-BED/accumulator")));
  for (const x of values) unwrap(a.add(x), capture);
  return captureValue(capture, "arithmetic/site-BEF/return", unwrap(a.total(), capture));
}
const E = 2 ** -52;
const ETA = Number.MIN_VALUE;
function gammaValue(k: number, capture?: CaptureContext): number {
  capture = enterCapture(capture, "arithmetic/gammaValue");
  captureValue(capture, "input/k", k);

  if (!Number.isSafeInteger(k) || k <= 0) fail("gamma/k", "INVALID_INPUT", capture);
  const ke = captureValue(capture, "arithmetic/site-BFB/local/ke", finite(k * E, "gamma/ke", capture));
  if (!(ke < 1)) fail("gamma/domain", "INVALID_INPUT", capture);
  return captureValue(capture, "arithmetic/site-BFD/return", finite(ke / (1 - ke), "gamma/result", capture));
}
export function gamma(k: number, capture?: CaptureContext): ArithmeticResult<number> {
  capture = enterCapture(capture, "arithmetic/gamma");
  captureValue(capture, "input/k", k);
 return captureValue(capture, "arithmetic/site-BFF/return", checked(() => gammaValue(k, capture), capture)); }
function allowance(k: number, scale: number, capture?: CaptureContext): ArithmeticAllowance {
  capture = enterCapture(capture, "arithmetic/allowance");
  captureValue(capture, "input/k", k);
  captureValue(capture, "input/scale", scale);

  finite(scale, "allowance/scale", capture);
  if (scale < 0) fail("allowance/negative-scale", "INVALID_INPUT", capture);
  const relative = captureValue(capture, "arithmetic/site-BFJ/local/relative", finite(gammaValue(k, capture) * scale, "allowance/relative", capture));
  const absolute = captureValue(capture, "arithmetic/site-BGA/local/absolute", finite(k * ETA, "allowance/absolute", capture));
  const bound = captureValue(capture, "arithmetic/site-BGB/local/bound", finite(relative + absolute, "allowance/bound", capture));
  return captureValue(capture, "arithmetic/site-BGC/return", { k, scale, bound });
}
export function durationAllowance(intervals: readonly Interval[], h: number, capture?: CaptureContext): ArithmeticResult<ArithmeticAllowance> {
  capture = enterCapture(capture, "arithmetic/durationAllowance");
  captureValue(capture, "input/intervals", intervals);
  captureValue(capture, "input/h", h);

  return captureValue(capture, "arithmetic/site-BGF/return", checked(() => {
    if (!intervals.length || !Number.isFinite(h) || h <= 0) fail("durationAllowance/input", "INVALID_INPUT", capture);
    const terms = captureValue(capture, "arithmetic/site-BGH/local/terms", intervals.map(({ a, b }) => {
      duration(a, b, capture);
      return captureValue(capture, "arithmetic/site-BGJ/return", finite(Math.abs(a) + Math.abs(b), "durationAllowance/term", capture));
    }));
    const scale = captureValue(capture, "arithmetic/site-BHB/local/scale", finite(sum([...terms, Math.abs(h)], capture), "durationAllowance/scale", capture));
    return captureValue(capture, "arithmetic/site-BHC/return", allowance(8 * intervals.length + 16, scale, capture));
  }, capture));
}
function magnitudeScale(intervals: readonly LinearInterval[], capture?: CaptureContext): number {
  capture = enterCapture(capture, "arithmetic/magnitudeScale");
  captureValue(capture, "input/intervals", intervals);

  return captureValue(capture, "arithmetic/site-BHG/return", sum(intervals.map(({ a, b, u, v }) => {
    const d = captureValue(capture, "arithmetic/site-BHH/local/d", duration(a, b, capture));
    finite(u, "scale/u", capture); finite(v, "scale/v", capture);
    return captureValue(capture, "arithmetic/site-BHJ/return", product3(d, Math.max(Math.abs(u), Math.abs(v)), 1, capture));
  }), capture));
}
export function exposureAllowance(intervals: readonly LinearInterval[], capture?: CaptureContext): ArithmeticResult<ArithmeticAllowance> {
  capture = enterCapture(capture, "arithmetic/exposureAllowance");
  captureValue(capture, "input/intervals", intervals);

  return captureValue(capture, "arithmetic/site-BID/return", checked(() => {
    if (!intervals.length) fail("exposureAllowance/empty", "INVALID_INPUT", capture);
    return captureValue(capture, "arithmetic/site-BIF/return", allowance(64 * (intervals.length + 1), magnitudeScale(intervals, capture), capture));
  }, capture));
}
/** Inputs are analytic fixture magnitudes. No scientific residual is accepted or changed. */
export function syntheticReferenceAllowance(
  intervals: readonly LinearInterval[],
  normalization?: Readonly<{ T: number; reference: number }>,
  otherPath?: readonly LinearInterval[],capture?: CaptureContext
): ArithmeticResult<ArithmeticAllowance> {
  capture = enterCapture(capture, "arithmetic/syntheticReferenceAllowance");
  captureValue(capture, "input/intervals", intervals);
  captureValue(capture, "input/normalization", normalization);
  captureValue(capture, "input/otherPath", otherPath);

  return captureValue(capture, "arithmetic/site-BJE/return", checked(() => {
    if (!intervals.length) fail("syntheticAllowance/empty", "INVALID_INPUT", capture);
    let scale = captureValue(capture, "arithmetic/site-BJG/local/scale", magnitudeScale(intervals, capture));
    if (otherPath) {
      if (otherPath.length !== intervals.length || otherPath.some((x, i) => x.a !== intervals[i].a || x.b !== intervals[i].b))
        fail("syntheticAllowance/common-partition", "INVALID_INPUT", capture);
      scale = captureValue(capture, "arithmetic/site-CAA/assign/scale", sum([scale, magnitudeScale(otherPath, capture)], capture));
    }
    const result = captureValue(capture, "arithmetic/site-CAC/local/result", allowance(64 * (intervals.length + 1), scale, capture));
    if (!normalization) return captureValue(capture, "arithmetic/site-CAD/return", result);
    const { T, reference } = captureValue(capture, "arithmetic/site-CAE/local/{ T, reference }", normalization);
    if (!Number.isFinite(T) || T <= 0) fail("syntheticAllowance/T", "INVALID_INPUT", capture);
    finite(reference, "syntheticAllowance/reference", capture);
    const divided = captureValue(capture, "arithmetic/site-CAH/local/divided", finite(result.bound / T, "syntheticAllowance/divided", capture));
    const correction = captureValue(capture, "arithmetic/site-CAI/local/correction", finite(E * Math.abs(reference), "syntheticAllowance/correction", capture));
    return captureValue(capture, "arithmetic/site-CAJ/return", { ...result, bound: finite(divided + correction, "syntheticAllowance/bound", capture) });
  }, capture));
}
