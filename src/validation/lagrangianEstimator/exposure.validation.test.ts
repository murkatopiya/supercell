import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { createAcceptedPath } from "./path.js";
import { createDiagnosticProvider } from "./providers.js";
import { partitionAcceptedStep } from "./partition.js";
import { integratePathExposure, integrateStepExposure } from "./exposure.js";
import { syntheticReferenceAllowance } from "./arithmetic.js";
import { add, multiply, subtract, exactNumber, rational, roundReference, referenceBits } from "./syntheticReferences.js";
import type { ArithmeticResult, EstimatorResult, ExposureResult, ExposureEvidence, Position,
  StepPartition, DiagnosticSupport, LinearInterval } from "./types.js";

function ok<T>(r: ArithmeticResult<T> | EstimatorResult<T>): T {
  if (r.status !== "COMPLETE") throw new Error(JSON.stringify(r));
  return r.value;
}
function exposed(r: ExposureResult): ExposureEvidence {
  if (r.status !== "COMPLETE") throw new Error(JSON.stringify(r));
  return r.value;
}
const primary = { role: "PRIMARY" } as const;
const secondary = { role: "SECONDARY_DESCRIPTIVE" } as const;
const eligible = { eligibility: "ELIGIBLE", support: "FULL_SUPPORT" } as const;
const position = (y: number, x = 0): Position => ({ x, y, z: 0 });
const path = (ys = [0, 1], times = ys.map((_, i) => i), xs = ys.map(() => 0)) =>
  ok(createAcceptedPath(ys.map((y, i) => ({ time: times[i], position: position(y, xs[i]) }))));
const provider = (heights = [0, 0.5, 1], evaluate = (i: number, _p: Position, _t: number): number => i === 0 ? 1 : 3,
  knotSupport?: readonly DiagnosticSupport[]) => ok(createDiagnosticProvider({
  identity: "artificial-exposure", version: "test/v1", heights, knotSupport,
  evaluate: (i, p, t) => ({ T1: evaluate(i, p, t), omega: null, gradient: null }),
}));
const partitions = (a = path(), q = provider()) => a.steps.map((_, i) => partitionAcceptedStep(a, i, q, eligible));
const exposure = (a = path(), q = provider()) => exposed(integratePathExposure(partitions(a, q), primary));

// References are declared from the fixture algebra, never extracted from output
// contributions. Exact rational sum before the single correctly rounded conversion.
function constantReference(knots: readonly number[], values: readonly number[]): number {
  let sum = rational(0n);
  for (let i = 0; i < values.length; i++) sum = add(sum,
    multiply(subtract(exactNumber(knots[i + 1]), exactNumber(knots[i])), exactNumber(values[i])));
  return roundReference(sum);
}
function referenceCheck(e: ExposureEvidence, signed: number, absolute: number, analytic: readonly LinearInterval[]) {
  const bound = ok(syntheticReferenceAllowance(analytic)).bound;
  expect(Math.abs(e.Esigned - signed)).toBeLessThanOrEqual(bound);
  expect(Math.abs(e.Eabs - absolute)).toBeLessThanOrEqual(bound);
  expect(e.invariants).toEqual({ absoluteNonnegative: true, signedBounded: true });
  expect(e.trace.contributions).toHaveLength(e.subintervalCount);
  expect(e.trace.contributions.map(c => c.order)).toEqual(e.trace.contributions.map((_, i) => i));
}

describe("P2 Slice 3 frozen exposure fixtures", () => {
  it("1: constant, one segment, no knots", () => {
    const e = exposure(path([0, 1], [0, 4]), provider([0, 1], () => -3));
    referenceCheck(e, -12, 12, [{ a: 0, b: 4, u: -3, v: -3 }]);
    expect(e.crossingCount).toBe(0);
  });
  it("2: affine one-segment T1 = 1 + 2t", () => {
    const e = exposure(path([0, 1], [0, 2]), provider([0, 1], (_i, _p, t) => 1 + 2 * t));
    referenceCheck(e, 6, 6, [{ a: 0, b: 2, u: 1, v: 5 }]);
    expect(e.subintervalCount).toBe(1);
  });
  it("3: arbitrary interior fraction and original Phase-P defect regression", () => {
    // h=1, lambda=1/4, A=1, B=3: signed=absolute=5/2 exactly.
    const e = exposure(path(), provider([0, 0.25, 1]));
    referenceCheck(e, 2.5, 2.5, [{ a: 0, b: 0.25, u: 1, v: 1 }, { a: 0.25, b: 1, u: 3, v: 3 }]);
    expect(e.trace.contributions.map(c => [c.interval.start.T1, c.interval.end.T1])).toEqual([[1, 1], [3, 3]]);
    expect(e.trace.contributions.map(c => c.interval.segment.index)).toEqual([0, 1]);
    // Forbidden unsplit endpoint trapezoid, locally computed as contrast only.
    const forbidden = 1 * (1 + 3) / 2;
    expect(forbidden).toBe(2);
    expect(e.Esigned).not.toBe(forbidden); expect(e.Eabs).not.toBe(forbidden);
  });
  it("4: piecewise affine jump, no cross-segment averaging", () => {
    // T=t below 1/2; T=t+2 above. Areas 1/8 and 11/8.
    const e = exposure(path(), provider([0, 0.5, 1], (i, _p, t) => t + 2 * i));
    referenceCheck(e, 1.5, 1.5, [{ a: 0, b: 0.5, u: 0, v: 0.5 }, { a: 0.5, b: 1, u: 2.5, v: 3 }]);
    expect(e.trace.contributions.map(c => c.signed)).toEqual([0.125, 1.375]);
  });
  it("5: many nonuniform boundaries", () => {
    const knots = Array.from({ length: 33 }, (_, j) => j * j / 1024);
    const values = knots.slice(1).map((_, i) => i + 1);
    const analytic = values.map((v, i) => ({ a: knots[i], b: knots[i + 1], u: v, v }));
    const expected = constantReference(knots, values);
    const e = exposure(path(), provider(knots, i => i + 1));
    referenceCheck(e, expected, expected, analytic);
    expect(e.subintervalCount).toBe(32);
    expect(e.trace.contributions.map(c => c.interval.left.time)).toEqual(knots.slice(0, -1));
  });
  it("6: every one of 33 clustered crossings is retained", () => {
    const knots = [0, ...Array.from({ length: 33 }, (_, j) => 0.5 + j / 4096), 1];
    const e = exposure(path(), provider(knots, () => 2));
    referenceCheck(e, 2, 2, knots.slice(1).map((b, i) => ({ a: knots[i], b, u: 2, v: 2 })));
    expect(e.crossingCount).toBe(33); expect(e.subintervalCount).toBe(34);
    expect(e.trace.contributions.every(c => c.interval.right.time > c.interval.left.time)).toBe(true);
  });
  it.each([["8: upward", [0, 1], [0, 1], [[1, 1], [3, 3]]],
    ["9: downward", [1, 0], [1, 0], [[3, 3], [1, 1]]]] as const)("%s one-sided limits", (_name, ys, segments, operands) => {
    const e = exposure(path([...ys]));
    referenceCheck(e, 2, 2, [{ a: 0, b: 0.5, u: 1, v: 1 }, { a: 0.5, b: 1, u: 3, v: 3 }]);
    expect(e.trace.contributions.map(c => c.interval.segment.index)).toEqual(segments);
    expect(e.trace.contributions.map(c => [c.interval.start.T1, c.interval.end.T1])).toEqual(operands);
    expect(e.trace.contributions[0].interval.end.context.side).toBe("TEMPORAL_MINUS");
    expect(e.trace.contributions[1].interval.start.context.side).toBe("TEMPORAL_PLUS");
  });
  it("10: separate steps at knot, no bridge or double counting", () => {
    const e = exposure(path([0, 0.5, 1]));
    referenceCheck(e, 4, 4, [{ a: 0, b: 1, u: 1, v: 1 }, { a: 1, b: 2, u: 3, v: 3 }]);
    expect(e.subintervalCount).toBe(2); expect(e.crossingCount).toBe(0);
    expect(e.trace.contributions.map(c => c.stepIndex)).toEqual([0, 1]);
    expect(e.trace.contributions[0].interval.right.contact).toEqual(e.trace.contributions[1].interval.left.contact);
  });
  it("11: positive-duration knot dwell with horizontal/time dependence", () => {
    const e = exposure(path([0.5, 0.5], [0, 1], [0, 2]), provider([0, 0.5, 1], (i, p, t) => i + p.x + t));
    referenceCheck(e, 2.5, 2.5, [{ a: 0, b: 1, u: 1, v: 4 }]);
    expect(e.trace.contributions[0].interval.start.context.side).toBe("DWELL");
  });
  it.each([[0, 2], [1, 6]])("12: touch-return from %s, no artificial opposite-side visit", (height, expected) => {
    const e = exposure(path([height, 0.5, height]));
    expect(e.Esigned).toBe(expected); expect(e.Eabs).toBe(expected);
    expect(e.trace.contributions.map(c => c.interval.segment.index)).toEqual([height, height]);
  });
  it("13: ordinary knot value cannot replace incoming explicit limit", () => {
    const q = provider([0, 0.5, 1], i => i === 0 ? 1 : 9);
    expect(ok(q.ordinary(position(0.5), 1)).T1).toBe(9);
    const e = exposure(path([0, 0.5]), q);
    expect(e.Esigned).toBe(1); expect(e.Eabs).toBe(1);
    expect(e.trace.contributions[0].interval.end.T1).toBe(1);
  });
  it("14: u=-v, duration 4: signed=0 and abs=h|u|/2=6", () => {
    const e = exposure(path([0, 1], [0, 4]), provider([0, 1], (_i, _p, t) => 3 - 1.5 * t));
    expect(referenceBits(e.Esigned)).toBe(0n); expect(e.Eabs).toBe(6);
    expect(e.trace.contributions[0].zeroFraction).toBe(0.5);
    expect(e.crossingCount).toBe(0); expect(e.subintervalCount).toBe(1);
  });
  // Frozen fixtures 15/16 require history R1 and own-path comparison, respectively.
  // They have no exposure assertions and remain deferred, not replaced here.
});

describe("P2 exposure zero crossings, arithmetic and ordering", () => {
  it.each([[2, -6, -4, 5, 0.25], [-6, 2, -4, 5, 0.75],
    [0, -4, -4, 4, null], [-4, 0, -4, 4, null], [0, 4, 4, 4, null], [4, 0, 4, 4, null],
    [-0, 0, 0, 0, null]])("one segment endpoints %s,%s", (u, v, signed, absolute, zero) => {
    let calls = 0;
    const q = provider([0, 1], (_i, _p, t) => { calls++; return t === 0 ? u! : v!; });
    const inputs = partitions(path([0, 1], [0, 2]), q), before = calls;
    const e = exposed(integratePathExposure(inputs, primary));
    expect(calls).toBe(before); // Quadrature performs no provider/midpoint calls.
    expect(e.Esigned).toBe(signed); expect(e.Eabs).toBe(absolute);
    expect(e.trace.contributions[0].zeroFraction).toBe(zero);
    expect(e.crossingCount).toBe(0); expect(e.subintervalCount).toBe(1);
    if (signed === 0) expect(referenceBits(e.Esigned)).toBe(0n);
  });
  it("one chronological Neumaier stream across steps retains small cancellation term", () => {
    const q = provider([0, 1, 2, 3], i => [2 ** 53, 1, -(2 ** 53)][i]);
    const e = exposure(path([0, 2, 3], [0, 2, 3]), q);
    expect(e.Esigned).toBe(1);
    expect(e.trace.contributions.map(c => c.signed)).toEqual([2 ** 53, 1, -(2 ** 53)]);
    expect(e.allowance.k).toBe(256);
  });
  it("redundant step boundaries preserve affine exposure (not frozen history fixture 16)", () => {
    const q = provider([0, 1], (_i, _p, t) => 1 + 2 * t);
    const whole = exposure(path(), q), split = exposure(path([0, 0.25, 1], [0, 0.25, 1]), q);
    expect(whole.Esigned).toBe(2); expect(split.Esigned).toBe(2);
    expect(whole.Eabs).toBe(2); expect(split.Eabs).toBe(2);
  });
  it("22: repeated evidence, bit-identical results, canonical exact-byte digest", () => {
    const inputs = partitions(path([0, 0.5, 1]));
    const first = exposed(integratePathExposure(inputs, primary));
    // Test-only canonical stream: sorted keys, ordered arrays, LF per record.
    const canonical = (x: unknown): string => {
      if (x !== null && typeof x === "object") return Array.isArray(x)
        ? `[${x.map(canonical).join(",")}]`
        : `{${Object.keys(x).sort().map(k => `${JSON.stringify(k)}:${canonical((x as Record<string, unknown>)[k])}`).join(",")}}`;
      if (x === undefined || (typeof x === "number" && !Number.isFinite(x))) throw new Error("Invalid canonical input");
      return JSON.stringify(x);
    };
    const stream = (e: ExposureEvidence) => e.trace.contributions.map(c => canonical(c) + "\n").join("");
    const digest = (e: ExposureEvidence) => createHash("sha256").update(stream(e), "utf8").digest("hex");
    for (let i = 0; i < 5; i++) {
      const again = exposed(integratePathExposure(inputs, primary));
      expect(again).toEqual(first); expect(referenceBits(again.Esigned)).toBe(referenceBits(first.Esigned));
      expect(referenceBits(again.Eabs)).toBe(referenceBits(first.Eabs)); expect(digest(again)).toBe(digest(first));
    }
    const mutable = structuredClone(inputs);
    const snapshot = exposed(integratePathExposure(mutable, primary));
    const part = ok(mutable[0]);
    (part.intervals[0].start as { T1: number }).T1 = 100;
    expect(snapshot.trace.contributions[0].interval.start.T1).toBe(1);
    expect(Object.isFrozen(snapshot.trace.contributions[0].interval.start.context.segment)).toBe(true);
    expect(Object.isFrozen(snapshot.trace.inputs)).toBe(true);
  });
});

describe("P2 exposure nonnumeric outcomes and input consistency", () => {
  it("7, 19, 20, 21: forwards upstream rejection without fabricated totals", () => {
    const badCluster = partitions(path([0, 1], [2 ** 53, 2 ** 53 + 2]), provider([0, 0.25, 0.5, 1]))[0];
    const unavailable = { status: "N_A", reason: "COLUMN_UNAVAILABLE", value: null } as const;
    const malformed = createDiagnosticProvider({ identity: "bad", version: "test", heights: [0, 0.5, 0.5, 1],
      evaluate: () => ({ T1: 1, omega: null, gradient: null }) });
    if (malformed.status === "COMPLETE") throw new Error("Malformed fixture succeeded");
    for (const input of [badCluster, unavailable, malformed,
      ...(["OUT_OF_DOMAIN", "INELIGIBLE_INTERVAL", "BOUNDARY_CONDITIONED"] as const).map(reason => ({ status: "UNSUPPORTED", reason, value: null } as const))]) {
      const result = integratePathExposure([...partitions(), input], primary);
      expect(result).toMatchObject(input); expect(result).not.toHaveProperty("value.Esigned");
      expect(result).not.toHaveProperty("value.Eabs");
    }
  });
  it("boundary support requires explicit secondary authority and retains its role", () => {
    const q = provider([0, 0.5, 1], () => 2, ["FULL_SUPPORT", "FULL_SUPPORT", "BOUNDARY_CONDITIONED"]);
    const a = path();
    const input = partitionAcceptedStep(a, 0, q, { ...eligible, support: "ALLOW_BOUNDARY_CONDITIONED" });
    expect(integrateStepExposure(input, primary)).toMatchObject({ status: "UNSUPPORTED", reason: "BOUNDARY_CONDITIONED", value: null });
    expect(exposed(integrateStepExposure(input, secondary))).toMatchObject({ Esigned: 2, Eabs: 2, support: "BOUNDARY_CONDITIONED", role: "SECONDARY_DESCRIPTIVE" });
    // An incoming full-support limit at a boundary-conditioned owned contact
    // remains descriptive when supplied by the caller as secondary.
    const contact = partitionAcceptedStep(path([0, 0.5]), 0, q, { ...eligible, support: "ALLOW_BOUNDARY_CONDITIONED" });
    expect(exposed(integrateStepExposure(contact, secondary)).role).toBe("SECONDARY_DESCRIPTIVE");
    expect(exposed(integrateStepExposure(partitions()[0], primary)).role).toBe("PRIMARY");
  });
  it("rejects empty, duplicate, reversed, skipped, mismatched path/provider sequences", () => {
    expect(integratePathExposure([], primary).status).toBe("FAILED");
    const a = path([0, 0.25, 0.5, 1]), inputs = partitions(a);
    for (const xs of [[inputs[0], inputs[0]], [...inputs].reverse(), [inputs[0], inputs[2]],
      [inputs[0], partitions(path([0, 0.5, 1]))[1]],
      [inputs[0], partitions(a, provider([0, 0.75, 1]))[1]]]) {
      expect(integratePathExposure(xs, primary).status).toBe("FAILED");
    }
  });
  it.each(["gap", "overlap", "zero", "segment", "position", "empty"])("rejects malformed supplied partition: %s", kind => {
    const p = structuredClone(ok(partitions()[0]));
    const first = p.intervals[0];
    if (kind === "gap" || kind === "overlap") (first.right as { time: number }).time += kind === "gap" ? -0.125 : 0.125;
    if (kind === "zero") (first.right as { time: number }).time = first.left.time;
    if (kind === "segment") (first.start.context as { segment: unknown }).segment = { ...first.segment, index: 999 };
    if (kind === "position") (first.start as { position: Position }).position = position(99);
    if (kind === "empty") (p as { intervals: readonly unknown[] }).intervals = [];
    expect(integrateStepExposure({ status: "COMPLETE", value: p }, primary).status).toBe("FAILED");
  });
  it.each([NaN, Infinity, -Infinity])("nonfinite endpoint %s has a typed failure and original trace", value => {
    const p = structuredClone(ok(partitions()[0]));
    (p.intervals[0].start as { T1: number }).T1 = value;
    const r = integrateStepExposure({ status: "COMPLETE", value: p }, primary);
    expect(r).toMatchObject({ status: "FAILED", code: "NONFINITE_ARITHMETIC", operation: "linear/u" });
    expect(r).not.toHaveProperty("value");
    if (r.status !== "COMPLETE") expect(r.trace.inputs).toHaveLength(1);
  });
  it("nonfinite duration, local product, accumulator and allowance all fail nonnumerically", () => {
    const input = (a: number, b: number, u: number, v = u) => {
      const p = structuredClone(ok(partitions(path(), provider([0, 1]))[0]));
      (p.step.from as { time: number }).time = a; (p.step.to as { time: number }).time = b;
      (p.intervals[0].left as { time: number }).time = a; (p.intervals[0].right as { time: number }).time = b;
      (p.intervals[0].start as { time: number; T1: number }).time = a;
      (p.intervals[0].end as { time: number; T1: number }).time = b;
      (p.intervals[0].start as { T1: number }).T1 = u; (p.intervals[0].end as { T1: number }).T1 = v;
      return { status: "COMPLETE", value: p } as const;
    };
    expect(integrateStepExposure(input(-Number.MAX_VALUE, Number.MAX_VALUE, 1), primary)).toMatchObject({ code: "NONFINITE_ARITHMETIC", operation: "exposure/path-duration" });
    expect(integrateStepExposure(input(0, 2, Number.MAX_VALUE), primary)).toMatchObject({ code: "NONFINITE_ARITHMETIC", operation: "scaledProduct3/overflow" });
    // Local area is finite, but d*max(|u|,|v|) required for Sexp overflows.
    expect(integrateStepExposure(input(0, 2, Number.MAX_VALUE, 0), primary)).toMatchObject({ code: "NONFINITE_ARITHMETIC", operation: "scaledProduct3/overflow" });
    const accumulated = integratePathExposure(partitions(path([0, 0.5, 1]), provider([0, 1], () => Number.MAX_VALUE * 0.75)), primary);
    expect(accumulated).toMatchObject({ code: "NONFINITE_ARITHMETIC", operation: "neumaier/t" });
    expect(accumulated).not.toHaveProperty("value");
  });
  it("estimator primitive is generic and has no later-slice or production dependencies", () => {
    const text = readFileSync("src/validation/lagrangianEstimator/exposure.ts", "utf8");
    expect(text).not.toMatch(/Goshen|Prospect|Dumas|Moore|\bIGRA\b|\bESC\b|S[1-4]-[LH]|parallel_plus|right_minus|0\.0625|0\.125|0\.25|0\.5/);
    expect(text).not.toMatch(/from ["'][^"']*(?:providers|partition|simulation|observed)|Aref|refinement|qualification/i);
  });
});
