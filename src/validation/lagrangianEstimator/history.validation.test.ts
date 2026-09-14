import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { comparePathHistory } from "./history.js";
import { createAcceptedPath } from "./path.js";
import { createDiagnosticProvider } from "./providers.js";
import { partitionAcceptedStep } from "./partition.js";
import { integratePathExposure } from "./exposure.js";
import { syntheticReferenceAllowance } from "./arithmetic.js";
import { rational, exactNumber, add, multiply, divide, subtract, roundReference, referenceBits } from "./syntheticReferences.js";
import type { AcceptedPath, ArithmeticResult, DiagnosticSupport, EstimatorResult, HistoryEvidence,
  HistoryPath, HistoryRequest, HistoryResult, LinearInterval, Position, VerticalDiagnosticProvider } from "./types.js";

function ok<T>(r: EstimatorResult<T> | ArithmeticResult<T>): T {
  if (r.status !== "COMPLETE") throw new Error(JSON.stringify(r));
  return r.value;
}
function complete(r: HistoryResult): HistoryEvidence {
  if (r.status !== "COMPLETE") throw new Error(JSON.stringify(r));
  return r.value;
}
const p = (y: number, x = 0, z = 0): Position => ({ x, y, z });
const path = (times = [0, 1], ys = times, xs = times.map(() => 0)) =>
  ok(createAcceptedPath(times.map((time, i) => ({ time, position: p(ys[i], xs[i]) }))));
const provider = (heights = [0, 1], evaluate = (_i: number, _p: Position, _t: number): number => 2,
  identity = "synthetic-history/v1", knotSupport?: readonly DiagnosticSupport[]) =>
  ok(createDiagnosticProvider({ identity, version: "test/v1", heights, knotSupport,
    evaluate: (i, p, t) => ({ T1: evaluate(i, p, t), omega: null, gradient: null }) }));
const input = (a = path(), q = provider(), eligibility: HistoryPath["eligibility"] = "ELIGIBLE"): EstimatorResult<HistoryPath> =>
  ({ status: "COMPLETE", value: { path: a, provider: q, eligibility } });
const request = (a = 0, b = 1, role: HistoryRequest["role"] = "PRIMARY"): HistoryRequest => ({ interval: { a, b }, role });
const compare = (c = input(), f = c, r = request()) => complete(comparePathHistory(c, f, r));
const times = (e: HistoryEvidence) => e.trace.nodes.map(n => n.time);
function analyticCheck(e: HistoryEvidence, residual: number, reference: number,
  c: readonly LinearInterval[], f: readonly LinearInterval[]) {
  const rb = ok(syntheticReferenceAllowance(c, { T: e.duration, reference: residual }, f));
  const ab = ok(syntheticReferenceAllowance(f, { T: e.duration, reference }));
  expect(Math.abs(e.R1 - residual)).toBeLessThanOrEqual(rb.bound);
  expect(Math.abs(e.Aref - reference)).toBeLessThanOrEqual(ab.bound);
  expect(e.residualArea).toBeGreaterThanOrEqual(0); expect(e.referenceArea).toBeGreaterThanOrEqual(0);
  expect(e.trace.contributions.map(c => c.order)).toEqual(e.trace.contributions.map((_, i) => i));
  expect(e.durationSum).toBe(e.duration);
}

describe("P2 Slice 4 frozen history fixtures", () => {
  it("15: identical paths/provider/evaluation inputs give exact positive zero", () => {
    const a = input(path([0, 0.25, 1]), provider([0, 0.5, 1], (i, p, t) => i + p.y * p.y - t));
    const e = compare(a);
    expect(referenceBits(e.R1)).toBe(0n); expect(referenceBits(e.residualArea)).toBe(0n);
    for (const c of e.trace.contributions) {
      expect(c.coarse.start).toEqual(c.fine.start); expect(c.coarse.end).toEqual(c.fine.end);
      expect(c.d0).toBe(0); expect(c.d1).toBe(0);
    }
  });
  it("16: redundant step boundary reevaluates the same affine geometry", () => {
    // L=1+2t on [0,1]: integral=2 exactly. Own encodings differ.
    const q = provider([0, 1], (_i, p) => 1 + 2 * p.y);
    const e = compare(input(path(), q), input(path([0, 0.25, 0.75, 1]), q));
    const knots = [0, 0.25, 0.75, 1];
    const affine = knots.slice(1).map((b, i) => ({ a: knots[i], b, u: 1 + 2 * knots[i], v: 1 + 2 * b }));
    analyticCheck(e, 0, 2, affine, affine);
    expect(e.coarsePathFingerprint).not.toBe(e.finePathFingerprint);
    expect(times(e)).toEqual(knots);
    expect(e.trace.contributions.map(c => c.coarse.stepIndex)).toEqual([0, 0, 0]);
    expect(e.trace.contributions.map(c => c.fine.stepIndex)).toEqual([0, 1, 2]);
  });
  it("17: shifted identical jump retains both crossing times and exact mismatch area", () => {
    // A=2, B=-6; crossing times 1/2 and 3/4; T=2.
    // Integral |difference|=8*(1/4)=2, R1=1; fine |L| area=9, Aref=9/2.
    const q = provider([0, 0.25, 1], i => i === 0 ? 2 : -6);
    const e = compare(input(path([0, 2], [0, 1]), q), input(path([0, 1.5, 2], [0, 0.5, 1]), q), request(0, 2));
    const area = multiply(rational(8n), subtract(rational(3n, 4n), rational(1n, 2n)));
    const expected = roundReference(divide(area, rational(2n)));
    expect(times(e)).toEqual([0, 0.5, 0.75, 1.5, 2]);
    expect(e.residualArea).toBe(roundReference(area)); expect(e.R1).toBe(expected);
    expect(e.referenceArea).toBe(9); expect(e.Aref).toBe(4.5);
    expect(e.trace.contributions.map(c => c.residualArea)).toEqual([0, 2, 0, 0]);
    const mismatch = e.trace.contributions[1];
    expect([mismatch.coarse.segment.index, mismatch.fine.segment.index]).toEqual([1, 0]);
    expect([mismatch.coarse.start.T1, mismatch.fine.start.T1]).toEqual([-6, 2]);
    expect(e.trace.nodes[1].events.map(v => v.role)).toEqual(["COARSE"]);
    expect(e.trace.nodes[2].events.map(v => v.role)).toEqual(["FINE"]);
  });
  it("18: affine difference changes sign; exact two-triangle residual, not endpoint abs trapezoid", () => {
    // Coarse 3-4t, fine=1, difference=2-4t. Integral |D|=1, reference=1.
    const e = compare(input(path(), provider([0, 1], (_i, _p, t) => 3 - 4 * t, "affine")),
      input(path(), provider([0, 1], () => 1, "constant")));
    analyticCheck(e, 1, 1, [{ a: 0, b: 1, u: 3, v: -1 }], [{ a: 0, b: 1, u: 1, v: 1 }]);
    expect(e.trace.contributions[0].residualZeroFraction).toBe(0.5);
    expect(times(e)).toEqual([0, 1]);
    expect(e.residualArea).not.toBe((Math.abs(2) + Math.abs(-2)) / 2);
  });
  it("22: repeated ordered nodes, evaluations, contributions, bits and stream digest", () => {
    const c = input(path([0, 0.25, 1]), provider([0, 0.5, 1], i => i + 1));
    const f = input(path([0, 0.75, 1]), provider([0, 0.25, 1], i => 2 * i - 1));
    const canonical = (x: unknown): string => {
      if (x !== null && typeof x === "object") return Array.isArray(x) ? `[${x.map(canonical).join(",")}]`
        : `{${Object.keys(x).sort().map(k => `${JSON.stringify(k)}:${canonical((x as Record<string, unknown>)[k])}`).join(",")}}`;
      if (x === undefined || (typeof x === "number" && !Number.isFinite(x))) throw new Error("Invalid canonical value");
      return JSON.stringify(x);
    };
    const bytes = (e: HistoryEvidence) => [...e.trace.nodes, ...e.trace.evaluations, ...e.trace.contributions]
      .map(record => canonical(record) + "\n").join("");
    const first = compare(c, f), digest = createHash("sha256").update(bytes(first), "utf8").digest("hex");
    for (let i = 0; i < 5; i++) {
      const next = compare(c, f);
      expect(next).toEqual(first); expect(referenceBits(next.R1)).toBe(referenceBits(first.R1));
      expect(referenceBits(next.Aref)).toBe(referenceBits(first.Aref));
      expect(createHash("sha256").update(bytes(next), "utf8").digest("hex")).toBe(digest);
    }
  });
});

describe("P2 history union and own-path reevaluation", () => {
  it("includes both step grids, crossing/step coincidence, and one vertex contact per role", () => {
    const q = provider([0, 0.5, 1], i => i + 1);
    const e = compare(input(path([0, 0.25, 1]), q), input(path([0, 0.5, 0.75, 1]), q));
    expect(times(e)).toEqual([0, 0.25, 0.5, 0.75, 1]);
    expect(e.R1).toBe(0);
    expect(e.trace.contributions.map(c => c.coarse.stepIndex)).toEqual([0, 1, 1, 1]);
    expect(e.trace.contributions.map(c => c.fine.stepIndex)).toEqual([0, 0, 1, 2]);
    const events = e.trace.nodes[2].events;
    expect(events.filter(v => v.kind === "DIAGNOSTIC_CONTACT")).toHaveLength(2);
    expect(events.filter(v => v.kind === "STEP_VERTEX")).toHaveLength(1);
    expect(events.filter(v => v.role === "FINE" && v.contact).map(v => v.contact!.location)).toEqual([{ kind: "VERTEX", index: 1 }]);
    expect(e.trace.contributions.map(c => [c.coarse.segment.index, c.fine.segment.index])).toEqual([[0, 0], [0, 0], [1, 1], [1, 1]]);
  });
  it("close unequal crossings retain their positive-duration mismatch", () => {
    const offset = 2 ** -52, later = 0.5 + offset;
    const c = input(path(), provider([0, 0.5, 1], i => i * 4, "early"));
    const f = input(path(), provider([0, later, 1], i => i * 4, "late"));
    const e = compare(c, f);
    expect(times(e)).toEqual([0, 0.5, later, 1]);
    expect(e.R1).toBe(4 * offset);
    expect(e.trace.contributions[1].b - e.trace.contributions[1].a).toBe(offset);
  });
  it("exact simultaneous crossings share only time, preserving separate provider identities", () => {
    const e = compare(input(path(), provider([0, 0.5, 1], i => i + 1, "coarse-provider")),
      input(path(), provider([0, 0.5, 1], i => 4 - i, "fine-provider")));
    expect(times(e)).toEqual([0, 0.5, 1]);
    const events = e.trace.nodes[1].events;
    expect(events.map(v => v.role)).toEqual(["COARSE", "FINE"]);
    expect(events[0].providerFingerprint).not.toBe(events[1].providerFingerprint);
    expect(e.trace.contributions.map(c => [c.coarse.end.T1, c.fine.end.T1])).toEqual([[1, 4], [2, 3]]);
    expect(e.R1).toBe(2); expect(e.Aref).toBe(3.5);
  });
  it("each role retains its own geometry even under the same provider", () => {
    const q = provider([0, 1], (_i, p) => p.x);
    const e = compare(input(path([0, 1], [0, 1], [0, 2]), q), input(path([0, 0.5, 1], [0, 0.5, 1], [1, 3, 5]), q));
    expect(e.R1).toBe(2); expect(e.Aref).toBe(3);
    expect(e.trace.contributions[0].coarse.end.position.x).toBe(1);
    expect(e.trace.contributions[0].fine.end.position.x).toBe(3);
    expect(e.trace.contributions[0].coarse.end.T1).toBe(1);
    expect(e.trace.contributions[0].fine.end.T1).toBe(3);
  });
  it("common-node reevaluation of nonlinear T1 makes Aref differ from fine native exposure", () => {
    // Fine native endpoints of t^2 give 1/2; common midpoint reevaluation gives 3/8.
    let calls = 0;
    const q = provider([0, 1], (_i, _p, t) => { calls++; return t * t; });
    const finePath = path(), c = input(path([0, 0.5, 1]), q), f = input(finePath, q);
    const e = compare(c, f);
    expect(e.R1).toBe(0); expect(e.Aref).toBe(0.375);
    expect(e.trace.contributions[0].fine.end.T1).toBe(0.25);
    const exposure = integratePathExposure(finePath.steps.map((_, i) => partitionAcceptedStep(finePath, i, q,
      { eligibility: "ELIGIBLE", support: "FULL_SUPPORT" })), { role: "PRIMARY" });
    if (exposure.status !== "COMPLETE") throw new Error("Exposure fixture failed");
    expect(exposure.value.Eabs).toBe(0.5);
    expect(e.duration * e.Aref).not.toBe(exposure.value.Eabs);
    expect(calls).toBeGreaterThan(0);
  });
  it("history can be nonzero while both native signed exposures match", () => {
    const e = compare(input(path(), provider([0, 1], (_i, _p, t) => 1 - 2 * t, "changing")),
      input(path(), provider([0, 1], () => 0, "zero")));
    // Both signed integrals are zero, but history is 1/2.
    expect(e.R1).toBe(0.5); expect(e.Aref).toBe(0);
  });
  it("own crossing coordinates use reviewed pinning rather than inverse-time interpolation", () => {
    const c = input(path([1, 4], [0, 1]), provider([0, 0.3, 1], i => i + 1));
    const e = compare(c, c, request(1, 4));
    expect(e.R1).toBe(0);
    expect(e.trace.contributions[0].coarse.end.position.y).toBe(0.3);
    expect(e.trace.contributions[1].coarse.start.position.y).toBe(0.3);
  });
  it("caller-supplied nonzero interval clips nodes and uses physical duration", () => {
    const q = provider([0, 2], (_i, _p, t) => t);
    const e = compare(input(path([0, 1, 2]), q), input(path([0, 0.5, 1.5, 2]), q), request(0.25, 1.75));
    expect(times(e)).toEqual([0.25, 0.5, 1, 1.5, 1.75]);
    expect(e.duration).toBe(1.5); expect(e.R1).toBe(0); expect(e.Aref).toBe(1);
  });
  it.each([["downward", [1, 0], [1, 0]], ["touch-return", [0, 0.5, 0], [0, 0]],
    ["knot dwell", [0.5, 0.5], [1]]] as const)("%s preserves one-sided contexts", (_name, ys, segments) => {
    const ts = ys.map((_, i) => i), a = path(ts, [...ys]);
    const base = provider([0, 0.5, 1], i => i + 1);
    const q: VerticalDiagnosticProvider = { ...base, ordinary: () => { throw new Error("Ordinary evaluation forbidden in history"); } };
    const e = compare(input(a, q), input(a, q), request(0, ts[ts.length - 1]));
    expect(e.R1).toBe(0);
    expect(e.trace.contributions.map(c => c.coarse.segment.index)).toEqual(segments);
    if (_name === "knot dwell") expect(e.trace.contributions[0].coarse.start.context.side).toBe("DWELL");
    else {
      expect(e.trace.contributions[0].coarse.end.context.side).toBe("TEMPORAL_MINUS");
      expect(e.trace.contributions[1].coarse.start.context.side).toBe("TEMPORAL_PLUS");
    }
  });
  it("different heights and opposite directions never borrow each other's segments", () => {
    const q = provider([0, 0.25, 1], i => i === 0 ? 1 : 3);
    const e = compare(input(path(), q), input(path([0, 1], [1, 0]), q));
    expect(times(e)).toEqual([0, 0.25, 0.75, 1]);
    expect(e.trace.contributions.map(c => [c.coarse.segment.index, c.fine.segment.index])).toEqual([[0, 1], [1, 1], [1, 0]]);
    expect(e.R1).toBe(1); expect(e.Aref).toBe(2.5);
  });
});

describe("P2 history arithmetic, support, and failure evidence", () => {
  it.each([[2, -6, 2.5, 0.25], [-6, 2, 2.5, 0.75], [0, -4, 2, null], [-4, 0, 2, null],
    [-0, 0, 0, null]])("exact absolute reference endpoints %s,%s", (u, v, expected, zero) => {
    const q = provider([0, 1], (_i, _p, t) => t === 0 ? u! : v!);
    const e = compare(input(path(), provider([0, 1], () => 0, "zero")), input(path(), q));
    expect(e.R1).toBe(expected); expect(e.Aref).toBe(expected);
    expect(e.trace.contributions[0].referenceZeroFraction).toBe(zero);
    expect(e.trace.nodes).toHaveLength(2);
    if (expected === 0) expect(referenceBits(e.Aref)).toBe(0n);
  });
  it("ordered compensated residual and reference sums preserve small areas", () => {
    const values = [2 ** 53, 1, 1];
    const q = provider([0, 1, 2, 3], i => values[i]);
    const zero = provider([0, 3], () => 0, "zero");
    const e = compare(input(path([0, 3], [0, 3]), zero), input(path([0, 3], [0, 3]), q), request(0, 3));
    const exact = values.map(exactNumber).reduce(add, rational(0n));
    expect(e.residualArea).toBe(roundReference(exact)); expect(e.referenceArea).toBe(roundReference(exact));
    expect(e.R1).toBe(roundReference(divide(exact, rational(3n))));
    expect(e.arithmetic.R1.k).toBe(256);
  });
  it.each(["OUT_OF_DOMAIN", "INELIGIBLE_INTERVAL", "BOUNDARY_CONDITIONED"] as const)("upstream %s is nonnumeric on either role", reason => {
    const rejected = { status: "UNSUPPORTED", reason, value: null } as const;
    for (const pair of [[rejected, input()], [input(), rejected]]) {
      const r = comparePathHistory(pair[0], pair[1], request());
      expect(r).toMatchObject(rejected); expect(r).not.toHaveProperty("value.R1"); expect(r).not.toHaveProperty("value.Aref");
    }
  });
  it("unavailable columns and malformed paths/providers retain typed rejection", () => {
    const unavailable = { status: "N_A", reason: "COLUMN_UNAVAILABLE", value: null } as const;
    expect(comparePathHistory(unavailable, input(), request())).toMatchObject(unavailable);
    const absent: VerticalDiagnosticProvider = { fingerprint: "absent", topology: null, ordinary: () => unavailable, explicit: () => unavailable };
    expect(comparePathHistory(input(path(), absent), input(), request())).toMatchObject(unavailable);
    const malformed = createDiagnosticProvider({ identity: "bad", version: "test", heights: [0, 0.5, 0.5, 1],
      evaluate: () => ({ T1: 1, omega: null, gradient: null }) });
    if (malformed.status === "COMPLETE") throw new Error("Expected malformed topology");
    expect(comparePathHistory(malformed, input(), request())).toMatchObject({ status: "FAILED", code: "MALFORMED_PROFILE" });
    const badPath = createAcceptedPath([{ time: 0, position: p(0) }, { time: 0, position: p(1) }]);
    if (badPath.status === "COMPLETE") throw new Error("Expected malformed path");
    expect(comparePathHistory(input(), badPath, request())).toMatchObject({ code: "INVALID_TRAJECTORY" });
  });
  it("never recovers the supported fraction of an ineligible closed step", () => {
    const q = provider([0, 0.5, 1], () => 2, "conditioned", ["FULL_SUPPORT", "FULL_SUPPORT", "BOUNDARY_CONDITIONED"]);
    const r = comparePathHistory(input(path(), q), input(), request(0, 0.25));
    expect(r).toMatchObject({ status: "UNSUPPORTED", reason: "BOUNDARY_CONDITIONED", value: null });
    expect(comparePathHistory(input(path(), provider(), "INELIGIBLE"), input(), request(0, 0.25)))
      .toMatchObject({ status: "UNSUPPORTED", reason: "INELIGIBLE_INTERVAL", value: null });
    // Isolated owned contact at the end of a step also retains conservative support.
    expect(comparePathHistory(input(path([0, 1], [0, 0.5]), q), input(), request()))
      .toMatchObject({ status: "UNSUPPORTED", reason: "BOUNDARY_CONDITIONED" });
  });
  it("secondary support stays descriptive, including clipped full-support operands", () => {
    const q = provider([0, 0.5, 1], () => 2, "conditioned", ["FULL_SUPPORT", "FULL_SUPPORT", "BOUNDARY_CONDITIONED"]);
    const e = compare(input(path(), q), input(), request(0, 1, "SECONDARY_DESCRIPTIVE"));
    expect(e.role).toBe("SECONDARY_DESCRIPTIVE"); expect(e.support).toBe("BOUNDARY_CONDITIONED");
    expect(e.R1).toBe(0); expect(e.Aref).toBe(2);
    expect(compare(input(path(), q), input(), request(0, 0.25, "SECONDARY_DESCRIPTIVE")).role).toBe("SECONDARY_DESCRIPTIVE");
  });
  it.each([[0, 0], [1, 0], [-1, 1], [0, 2]])("invalid/outside common interval %s,%s is ineligible", (a, b) => {
    expect(comparePathHistory(input(), input(), request(a, b))).toMatchObject({ status: "UNSUPPORTED", reason: "INELIGIBLE_INTERVAL", value: null });
  });
  it.each([NaN, Infinity, -Infinity])("nonfinite common endpoint %s fails", t => {
    expect(comparePathHistory(input(), input(), request(0, t))).toMatchObject({ status: "FAILED", code: "NONFINITE_ARITHMETIC" });
  });
  it("unresolvable native cluster fails instead of merging successful common nodes", () => {
    const c = input(path([2 ** 53, 2 ** 53 + 2], [0, 1]), provider([0, 0.25, 0.5, 1]));
    const r = comparePathHistory(c, c, request(2 ** 53, 2 ** 53 + 2));
    expect(r).toMatchObject({ status: "FAILED", code: "NUMERICAL_AMBIGUITY" });
    if (r.status !== "COMPLETE") expect(r.trace.partitions[0].result.status).toBe("FAILED");
  });
  it("33 clustered crossings from each role have no fixed cap", () => {
    const knots = [0, ...Array.from({ length: 33 }, (_, i) => 0.5 + i / 4096), 1];
    const e = compare(input(path(), provider(knots)));
    expect(e.trace.nodes).toHaveLength(35); expect(e.trace.contributions).toHaveLength(34);
    expect(e.R1).toBe(0); expect(e.Aref).toBe(2);
    expect(e.trace.contributions.every(c => c.b > c.a)).toBe(true);
  });
  it("provider failure at a foreign-grid node preserves the failing evaluation", () => {
    const c = input(path(), provider([0, 1], (_i, _p, t) => t === 0.5 ? NaN : 1));
    const f = input(path([0, 0.5, 1]));
    const r = comparePathHistory(c, f, request());
    expect(r).toMatchObject({ status: "FAILED", code: "NONFINITE_ARITHMETIC", operation: "provider/operands" });
    if (r.status !== "COMPLETE") {
      expect(r.trace.nodes.map(n => n.time)).toEqual([0, 0.5, 1]);
      expect(r.trace.evaluations.at(-1)).toMatchObject({ role: "COARSE", time: 0.5, result: { status: "FAILED" } });
    }
  });
  it("nonfinite difference, local area, accumulation and allowance never yield numeric histories", () => {
    const max = Number.MAX_VALUE;
    const q = (value: number) => provider([0, 1], () => value, String(value));
    expect(comparePathHistory(input(path(), q(max)), input(path(), q(-max)), request()))
      .toMatchObject({ status: "FAILED", code: "NONFINITE_ARITHMETIC", operation: "history/d0" });
    const long = path([0, 2], [0, 1]);
    expect(comparePathHistory(input(long, q(max)), input(long, q(0)), request(0, 2)))
      .toMatchObject({ status: "FAILED", operation: "scaledProduct3/overflow" });
    const split = path([0, 1, 2], [0, 0.5, 1]);
    expect(comparePathHistory(input(split, q(max * 0.75)), input(split, q(0)), request(0, 2)))
      .toMatchObject({ status: "FAILED", operation: "neumaier/t" });
    // Identity residual is zero but sum of coarse/fine magnitude scales overflows.
    const r = comparePathHistory(input(path(), q(max)), input(path(), q(max)), request());
    expect(r).toMatchObject({ status: "FAILED", operation: "neumaier/t" });
    expect(r).not.toHaveProperty("value.R1");
  });
  it("copies/freezes paths, requests, topology and result traces", () => {
    const a = structuredClone(path()), r = request(), q = provider([0, 0.5, 1]);
    const e = compare(input(a, q), input(a, q), r);
    (a.vertices[0].position as { y: number }).y = 100;
    (r.interval as { a: number }).a = 100;
    const stored = ok(e.trace.inputs[0]);
    expect(stored.path.vertices[0].position.y).toBe(0); expect(e.trace.request.interval.a).toBe(0);
    expect(Object.isFrozen(stored.topology!.heights)).toBe(true);
    expect(Object.isFrozen(e.trace.contributions[0].coarse.start.position)).toBe(true);
    expect(Object.isFrozen(e.trace.nodes[1].events)).toBe(true);
  });
  it("generic primitive has no campaign hard-coding, exposure-total comparison or production imports", () => {
    const text = readFileSync("src/validation/lagrangianEstimator/history.ts", "utf8");
    expect(text).not.toMatch(/Goshen|Prospect|Dumas|Moore|\bESC\b|\bIGRA\b|S[1-4]-[LH]|parallel_plus|right_minus|0\.0625|0\.125|0\.25|0\.5/);
    expect(text).not.toMatch(/from ["'][^"']*(?:exposure|simulation|observed|physics|providers)|1e-6|0\.01|refinement|candidate/i);
  });
});
