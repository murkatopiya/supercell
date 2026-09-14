import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { normalizeExactZero, decomposeBinary64, scaledProduct3, localLinearIntegrals,
  NeumaierAccumulator, gamma, durationAllowance, exposureAllowance, syntheticReferenceAllowance } from "./arithmetic.js";
import { referenceBits, referenceFromBits, referenceLinear, referenceSum, referenceScaledProduct,
  exactNumber, rational, add, multiply, divide, roundReference } from "./syntheticReferences.js";
import type { ArithmeticResult } from "./types.js";

function value<T>(r: ArithmeticResult<T>): T {
  if (r.status !== "COMPLETE") throw new Error(`${r.code}: ${r.operation}`);
  return r.value;
}
const eta = Number.MIN_VALUE;
const minNormal = referenceFromBits(0x0010000000000000n);
const maxSubnormal = referenceFromBits(0x000fffffffffffffn);
const bitCases: readonly (readonly [string, number, number, number, bigint])[] = [
  ["positive zero", 0, 2, 3, 0n],
  ["negative zero", -0, -2, 3, 0n],
  ["smallest subnormal", eta, 1, 1, 1n],
  ["adjacent subnormal", eta, 2, 1, 2n],
  ["largest subnormal", maxSubnormal, 1, 1, 0xfffffffffffffn],
  ["smallest normal", minNormal, 1, 1, 0x10000000000000n],
  ["subnormal-normal rounding carry", Number.MAX_SAFE_INTEGER, eta, 0.5, 0x10000000000000n],
  ["ordinary normals", 1.5, 2, 4, 0x4028000000000000n],
  ["largest finite recovered after huge intermediate", Number.MAX_VALUE, 2, 0.5, 0x7fefffffffffffffn],
  ["gradual underflow", minNormal, 0.5, 1, 0x8000000000000n],
  ["underflow to zero", eta, 0.25, 1, 0n],
  ["halfway even lower zero", eta, 0.5, 1, 0n],
  ["halfway even lower significand", 5 * eta, 0.5, 1, 2n],
  ["halfway odd lower rounds up", 3 * eta, 0.5, 1, 2n],
  ["normal exponent carry", 1.5, 1.5, 1, 0x4002000000000000n],
  ["rounded mantissa carry to next exponent", 2 - 2 ** -52, 1 + 2 ** -52, 1, 0x4000000000000000n],
  ["negative sign", -eta, 3, 1, 0x8000000000000003n],
  ["negative rounds to canonical zero", -eta, 0.5, 1, 0n],
  ["power below representable range but product representable", eta, 0.75, 1, 1n],
  ["huge exponents cancel", 2 ** 1023, 2 ** 1023, eta, 0x7cb0000000000000n],
  ["tiny intermediates recover", eta, 0.5, 2 ** 1023, 0x3cb0000000000000n],
];

describe("P2 Slice 1 binary64 arithmetic only", () => {
  it.each(bitCases)("bits: %s", (_name, a, b, c, expected) => {
    expect(referenceBits(value(scaledProduct3(a, b, c)))).toBe(expected);
    expect(referenceBits(referenceScaledProduct(a, b, c))).toBe(expected);
  });
  it("rejects final overflow and nonfinite inputs, including zero-product inputs", () => {
    expect(scaledProduct3(Number.MAX_VALUE, 2, 1)).toMatchObject({ status: "FAILED", operation: "scaledProduct3/overflow" });
    for (const x of [Infinity, -Infinity, NaN]) {
      expect(scaledProduct3(0, x, 1).status).toBe("FAILED");
      expect(decomposeBinary64(x).status).toBe("FAILED");
    }
  });
  it("normalizes only exact zero", () => {
    expect(Object.is(normalizeExactZero(-0), 0)).toBe(true);
    expect(normalizeExactZero(-eta)).toBe(-eta);
  });
  it.each([eta, 2 * eta, maxSubnormal, minNormal, 1, -1.5, Number.MAX_VALUE, 0, -0])("decomposes %s exactly", x => {
    const parts = value(decomposeBinary64(x));
    if (x === 0) { expect(parts).toEqual({ mantissa: 0, exponent: 0 }); return; }
    expect(Math.abs(parts.mantissa)).toBeGreaterThanOrEqual(1);
    expect(Math.abs(parts.mantissa)).toBeLessThan(2);
    const power = parts.exponent >= 0 ? rational(1n << BigInt(parts.exponent)) : rational(1n, 1n << BigInt(-parts.exponent));
    expect(referenceBits(roundReference(multiply(exactNumber(parts.mantissa), power)))).toBe(referenceBits(x));
  });
  it("preserves both rounded mantissa multiplications against independent rational oracle", () => {
    const xs = [1 + 2 ** -52, 1.1, 1.3, 1.7, 2 - 2 ** -52, -1.9];
    for (const a of xs) for (const b of xs) for (const c of xs) {
      expect(referenceBits(value(scaledProduct3(a, b, c)))).toBe(referenceBits(referenceScaledProduct(a, b, c)));
    }
  });
  it("Number operations retain separate rounding (no FMA) and DataView endian conventions", () => {
    const a = 1 + 2 ** -27, b = 1 - 2 ** -27;
    const product = a * b;
    expect(product - 1).toBe(0);
    expect(roundReference(add(multiply(exactNumber(a), exactNumber(b)), rational(-1n)))).toBe(-(2 ** -54));
    const v = new DataView(new ArrayBuffer(8));
    v.setFloat64(0, 1, false);
    expect(v.getBigUint64(0, false)).toBe(0x3ff0000000000000n);
    expect(v.getUint8(0)).toBe(0x3f);
    expect(referenceBits(eta)).toBe(1n);
  });
});

describe("P2 Slice 1 local-linear fixtures (not exposure/history qualification)", () => {
  const cases: readonly (readonly [string, number, number, number, number])[] = [
    ["fixture 1 constant", 0, 1, 2, 2],
    ["fixture 2 affine", 0, 1, 1, 3],
    ["fixture 14 symmetric sign crossing", 0, 1, 2, -2],
    ["negative same sign", 2, 4, -1, -3],
    ["one endpoint zero", 0, 2, 0, 3],
    ["unequal opposite signs", 0, 1, -1, 3],
    ["signed zero endpoints", 0, 1, -0, 0],
    ["very unequal magnitudes", 0, 1, eta, 2 ** 100],
    ["large endpoints without unscaled overflow", 0, 0.5, Number.MAX_VALUE, -Number.MAX_VALUE],
  ];
  it.each(cases)("%s", (_name, a, b, u, v) => {
    const result = value(localLinearIntegrals(a, b, u, v));
    const expected = referenceLinear(a, b, u, v);
    const intervals = [{ a, b, u, v }];
    const bound = value(syntheticReferenceAllowance(intervals)).bound;
    expect(Math.abs(result.signed - expected.signed)).toBeLessThanOrEqual(bound);
    expect(Math.abs(result.abs - expected.abs)).toBeLessThanOrEqual(bound);
    const invariant = value(exposureAllowance(intervals)).bound;
    expect(result.abs).toBeGreaterThanOrEqual(-invariant);
    expect(Math.abs(result.signed) - result.abs).toBeLessThanOrEqual(invariant);
  });
  it("pins corrected fixture 14 for arbitrary amplitude and duration", () => {
    expect(value(localLinearIntegrals(0, 4, 3, -3))).toEqual({ signed: 0, abs: 6, zeroFraction: 0.5 });
    expect(value(localLinearIntegrals(0, 1, -1, 3))).toEqual({ signed: 1, abs: 1.25, zeroFraction: 0.25 });
  });
  it("rejects invalid durations and nonfinite diagnostics, never fabricates zero", () => {
    for (const args of [[0, 0, 1, 1], [2, 1, 1, 1], [0, Infinity, 0, 0], [0, 1, NaN, 0], [-Number.MAX_VALUE, Number.MAX_VALUE, 0, 0]]) {
      expect(localLinearIntegrals(args[0], args[1], args[2], args[3]).status).toBe("FAILED");
    }
  });
});

describe("P2 Slice 1 Neumaier", () => {
  function sum(xs: readonly number[]) {
    const a = new NeumaierAccumulator();
    for (const x of xs) value(a.add(x));
    return value(a.total());
  }
  it("permits empty/zero algebraic streams and normalizes result zero", () => {
    expect(referenceBits(sum([]))).toBe(0n);
    expect(referenceBits(sum([-0, 0, -0]))).toBe(0n);
  });
  it("matches exact sums including catastrophic cancellation and both magnitude branches", () => {
    for (const xs of [[1, 2, 3], [1e16, 1, -1e16], [1, 1e16, -1e16], [eta, eta, -eta]])
      expect(sum(xs)).toBe(referenceSum(xs));
  });
  it("preserves chronological order, including correction rounding sensitivity", () => {
    expect(sum([1e100, 1e16, 1, -1e100, -1e16])).toBe(0);
    expect(sum([1e100, -1e100, 1e16, -1e16, 1])).toBe(1);
    expect(referenceSum([1e100, 1e16, 1, -1e100, -1e16])).toBe(1);
  });
  it("nonfinite input and intermediate overflow poison the stream", () => {
    for (const x of [NaN, Infinity, -Infinity]) {
      const a = new NeumaierAccumulator();
      expect(a.add(x).status).toBe("FAILED");
      expect(a.add(0).status).toBe("FAILED");
      expect(a.total().status).toBe("FAILED");
    }
    const a = new NeumaierAccumulator();
    value(a.add(Number.MAX_VALUE));
    expect(a.add(Number.MAX_VALUE).status).toBe("FAILED");
    expect(a.total().status).toBe("FAILED");
  });
});

describe("P2 Slice 1 engineering allowances, separate from scientific budgets", () => {
  it("gamma follows frozen domain and rounding", () => {
    expect(value(gamma(1))).toBe(roundReference(divide(rational(1n), rational((1n << 52n) - 1n))));
    for (const k of [0, -1, 0.5, 2 ** 52, Infinity, NaN]) expect(gamma(k).status).toBe("FAILED");
  });
  it("duration allowance uses grouped endpoint magnitudes and frozen k", () => {
    const out = value(durationAllowance([{ a: 0, b: 0.5 }, { a: 0.5, b: 1 }], 1));
    expect(out.k).toBe(32); expect(out.scale).toBe(3);
    expect(out.bound).toBe((32 * 2 ** -52 / (1 - 32 * 2 ** -52)) * 3 + 32 * eta);
  });
  it("duration allowance includes final h in the same compensated stream", () => {
    const B = 2 ** 53;
    const intervals = [{ a: -16, b: -15 }, { a: -15, b: -13 }, { a: -13, b: B + 2 }];
    const h = B + 18;
    // Last endpoint sum B+15 rounds separately to B+16 (ties-to-even).
    const terms = intervals.map(({ a, b }) => Math.abs(a) + Math.abs(b));
    expect(terms).toEqual([31, 28, B + 16]);
    // Exact sum of the declared rounded stream is 2^54+93; its nearest value is +92.
    const expected = roundReference(rational((1n << 54n) + 93n));
    expect(expected).toBe(2 ** 54 + 92);
    expect(referenceSum([...terms, Math.abs(h)])).toBe(expected);
    const oldAccumulator = new NeumaierAccumulator();
    for (const term of terms) value(oldAccumulator.add(term));
    const oldScale = value(oldAccumulator.total()) + Math.abs(h);
    expect(oldScale).toBe(2 ** 54 + 96);
    expect(referenceBits(oldScale)).not.toBe(referenceBits(expected));
    const out = value(durationAllowance(intervals, h));
    expect(referenceBits(out.scale)).toBe(referenceBits(expected));
    expect(out.k).toBe(40);
  });
  it("exposure scale and synthetic normalized/history scales follow frozen formulas", () => {
    const intervals = [{ a: 0, b: 2, u: 1, v: -3 }];
    const e = value(exposureAllowance(intervals));
    expect(e.k).toBe(128); expect(e.scale).toBe(6);
    expect(value(syntheticReferenceAllowance(intervals))).toEqual(e);
    const h = value(syntheticReferenceAllowance(intervals, { T: 2, reference: 4 }, intervals));
    expect(h.scale).toBe(12);
    expect(h.bound).toBe((value(gamma(128)) * 12 + 128 * eta) / 2 + 2 ** -52 * 4);
  });
  it("rejects invalid/unrepresentable allowances", () => {
    expect(durationAllowance([], 1).status).toBe("FAILED");
    expect(durationAllowance([{ a: Number.MAX_VALUE / 2, b: Number.MAX_VALUE }], Number.MAX_VALUE).status).toBe("FAILED");
    expect(exposureAllowance([]).status).toBe("FAILED");
    expect(exposureAllowance([{ a: 0, b: 2, u: Number.MAX_VALUE, v: 0 }]).status).toBe("FAILED");
    expect(syntheticReferenceAllowance([{ a: 0, b: 1, u: 0, v: 0 }], { T: 0, reference: 0 }).status).toBe("FAILED");
    expect(syntheticReferenceAllowance([{ a: 0, b: 1, u: 0, v: 0 }], undefined, []).status).toBe("FAILED");
  });
  it("zero scale keeps eta floor and does not modify raw signed local results", () => {
    expect(value(exposureAllowance([{ a: 0, b: 1, u: 0, v: 0 }])).bound).toBe(128 * eta);
    const r = value(localLinearIntegrals(0, 1, -eta, -eta));
    expect(r.signed).toBe(-eta);
    expect(r.abs).toBe(eta);
  });
  it("reference module has no tested-arithmetic or production imports", () => {
    const text = readFileSync("src/validation/lagrangianEstimator/syntheticReferences.ts", "utf8");
    expect(text).not.toMatch(/^import\s/m);
    const implementation = readFileSync("src/validation/lagrangianEstimator/arithmetic.ts", "utf8");
    expect(implementation).not.toMatch(/Math\.log2|Simulation|observedLagrangianPhaseP/i);
  });
});
