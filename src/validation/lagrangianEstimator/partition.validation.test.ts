import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { createAcceptedPath, locateAcceptedStep, positionOnStep } from "./path.js";
import { createDiagnosticProvider, createSourceProvider, createAnalysisProvider } from "./providers.js";
import { partitionAcceptedStep } from "./partition.js";
import type { EstimatorResult, VerticalDiagnosticProvider, AcceptedPath, DiagnosticSupport, Position } from "./types.js";
import { EnvironmentalWindProfile } from "../../physics/environment/EnvironmentalWindProfile.js";
import { VerticalEnvelopeUpdraftField } from "../../physics/storm/VerticalEnvelopeUpdraftField.js";
import { DiagnosticTiltingTendency } from "../../physics/diagnostics/DiagnosticTiltingTendency.js";
import { queryAnalysisTiltingExplanationAt } from "../../data/escHrTimeAnalysis/analysisTiltingQuery.js";
import type { EscHrTimeAnalysisColumn } from "../../data/escHrTimeAnalysis/types.js";

function ok<T>(r: EstimatorResult<T>): T {
  if (r.status !== "COMPLETE") throw new Error(JSON.stringify(r));
  return r.value;
}
const p = (y: number, x = 0, z = 0): Position => ({ x, y, z });
const path = (ys: readonly number[], times = ys.map((_, i) => i)): AcceptedPath =>
  ok(createAcceptedPath(ys.map((y, i) => ({ time: times[i], position: p(y) }))));
const provider = (heights = [0, 0.5, 1], evaluate = (i: number, _p: Position, _t: number): number => i === 0 ? 1 : 3,
  knotSupport?: readonly DiagnosticSupport[]): VerticalDiagnosticProvider =>
  ok(createDiagnosticProvider({ identity: "artificial-piecewise/v1", version: "test/v1", heights, knotSupport,
    evaluate: (i, p, t) => ({ T1: evaluate(i, p, t), omega: null, gradient: null }) }));
const request = { eligibility: "ELIGIBLE", support: "FULL_SUPPORT" } as const;
const part = (a: AcceptedPath, b = provider(), i = 0) => ok(partitionAcceptedStep(a, i, b, request));

describe("P2 Slice 2 accepted path (no integration)", () => {
  it("copies/freezes vertices and steps; identity depends on represented geometry", () => {
    const input = [{ time: 0, position: p(0) }, { time: 1, position: p(1) }];
    const a = ok(createAcceptedPath(input)), b = path([0, 1]);
    expect(a.fingerprint).toBe(b.fingerprint);
    input[0].position = p(5);
    expect(a.vertices[0].position.y).toBe(0);
    expect(Object.isFrozen(a)).toBe(true);
    expect(Object.isFrozen(a.vertices)).toBe(true);
    expect(Object.isFrozen(a.steps[0])).toBe(true);
    expect(Object.isFrozen(a.vertices[0].position)).toBe(true);
    expect(a.fingerprint).not.toBe(path([0, 2]).fingerprint);
  });
  it("returns authoritative stored vertices, following-step lookup, and linear continuation", () => {
    const a = ok(createAcceptedPath([{ time: 0, position: p(0, 2, 4) },
      { time: 1, position: p(1, 4, 8) }, { time: 2, position: p(0, 6, 12) }]));
    expect(ok(locateAcceptedStep(a, 1))).toBe(1);
    expect(ok(locateAcceptedStep(a, 2))).toBe(1);
    expect(ok(positionOnStep(a, 0, 1))).toBe(a.vertices[1].position);
    expect(ok(positionOnStep(a, 1, 1))).toBe(a.vertices[1].position);
    expect(ok(positionOnStep(a, 0, 0.5))).toEqual(p(0.5, 3, 6));
    expect(locateAcceptedStep(a, 3).status).toBe("FAILED");
    expect(positionOnStep(a, 0, 1.5).status).toBe("FAILED");
  });
  it.each([[0, 0], [1, 0], [0, Infinity], [0, NaN]])("rejects malformed times %s", (a, b) => {
    expect(createAcceptedPath([{ time: a, position: p(0) }, { time: b, position: p(1) }])).toMatchObject({ status: "FAILED", code: "INVALID_TRAJECTORY" });
  });
  it("rejects missing vertices, nonfinite geometry and unrepresentable interpolation", () => {
    expect(createAcceptedPath([]).status).toBe("FAILED");
    expect(createAcceptedPath([{ time: 0, position: p(NaN) }, { time: 1, position: p(0) }]).status).toBe("FAILED");
    const a = ok(createAcceptedPath([{ time: 0, position: p(0, -Number.MAX_VALUE) }, { time: 1, position: p(1, Number.MAX_VALUE) }]));
    expect(positionOnStep(a, 0, 0.5)).toMatchObject({ status: "FAILED", code: "NUMERICAL_AMBIGUITY" });
    expect(partitionAcceptedStep(a, 0, provider(), request)).toMatchObject({ status: "FAILED", code: "NUMERICAL_AMBIGUITY" });
  });
});

describe("P2 Slice 2 frozen fixtures: topology and endpoint operands only", () => {
  it("fixture 3: one interior knot at arbitrary fraction", () => {
    const a = part(path([0, 1]), provider([0, 0.25, 1]));
    expect(a.nodes.map(n => n.time)).toEqual([0, 0.25, 1]);
    expect(a.intervals.map(i => [i.start.T1, i.end.T1])).toEqual([[1, 1], [3, 3]]);
    expect(a.crossingCount).toBe(1);
    expect(a.nodes[1].position.y).toBe(0.25);
  });
  it("fixture 4: piecewise-affine diagnostic with jump retains distinct limits", () => {
    const a = part(path([0, 1]), provider([0, 0.5, 1], (i, _p, t) => t + 2 * i));
    expect(a.intervals.map(i => [i.start.T1, i.end.T1])).toEqual([[0, 0.5], [2.5, 3]]);
  });
  it("fixture 5: many irregular boundaries with exact coverage", () => {
    const heights = Array.from({ length: 33 }, (_, j) => j * j / 1024);
    const a = part(path([0, 1]), provider(heights, i => i + 1));
    expect(a.intervals).toHaveLength(32);
    expect(a.nodes.map(n => n.time)).toEqual(heights);
    expect(a.durationSum).toBe(1);
    a.intervals.forEach((x, i) => {
      expect(x.segment.index).toBe(i);
      expect(x.start.T1).toBe(i + 1);
      expect(x.left).toBe(a.nodes[i]); expect(x.right).toBe(a.nodes[i + 1]);
      if (i) expect(x.left).toBe(a.intervals[i - 1].right);
    });
  });
  it("fixture 6: 33 clustered crossings have no architectural cap", () => {
    const heights = [0, ...Array.from({ length: 33 }, (_, j) => 0.5 + j / 4096), 1];
    const a = part(path([0, 1]), provider(heights, () => 2));
    expect(a.crossingCount).toBe(33); expect(a.intervals).toHaveLength(34);
    expect(a.nodes.map(n => n.time)).toEqual(heights);
    expect(a.intervals.every(x => x.right.time > x.left.time && x.start.T1 === 2 && x.end.T1 === 2)).toBe(true);
  });
  it("fixture 7: crossing collapse onto endpoint is explicit ambiguity", () => {
    const a = path([0, 1], [2 ** 53, 2 ** 53 + 2]);
    expect(partitionAcceptedStep(a, 0, provider([0, 0.25, 0.5, 1]), request)).toMatchObject({ status: "FAILED", code: "NUMERICAL_AMBIGUITY" });
  });
  it("fixture 8: upward temporal sides", () => {
    const a = part(path([0, 1]));
    expect(a.intervals.map(x => x.segment.index)).toEqual([0, 1]);
    expect(a.intervals[0].end.context.side).toBe("TEMPORAL_MINUS");
    expect(a.intervals[1].start.context.side).toBe("TEMPORAL_PLUS");
    expect([a.intervals[0].end.T1, a.intervals[1].start.T1]).toEqual([1, 3]);
  });
  it("fixture 9: descending multiple crossings reverse height order, not time", () => {
    const a = part(path([1, 0]), provider([0, 0.25, 0.5, 0.75, 1], i => i + 1));
    expect(a.nodes.map(n => n.position.y)).toEqual([1, 0.75, 0.5, 0.25, 0]);
    expect(a.nodes.map(n => n.time)).toEqual([0, 0.25, 0.5, 0.75, 1]);
    expect(a.intervals.map(x => [x.segment.index, x.start.T1, x.end.T1])).toEqual([[3, 4, 4], [2, 3, 3], [1, 2, 2], [0, 1, 1]]);
  });
  it("fixture 10: separate start/end-knot steps keep single shared vertex identity", () => {
    const a = path([0, 0.5, 1]);
    const incoming = part(a, provider(), 0), outgoing = part(a, provider(), 1);
    expect(incoming.intervals).toHaveLength(1); expect(outgoing.intervals).toHaveLength(1);
    expect(incoming.nodes[1].contact).toEqual(outgoing.nodes[0].contact);
    expect(incoming.intervals[0].end.T1).toBe(1); expect(outgoing.intervals[0].start.T1).toBe(3);
    expect(incoming.nodes[0].contact?.boundary.index).toBe(0);
    expect(outgoing.nodes[1].contact?.boundary.index).toBe(2);
  });
  it("fixture 11: knot dwell uses ordinary ownership and varies with time/horizontal position", () => {
    const a = ok(createAcceptedPath([{ time: 0, position: p(0.5, 0) }, { time: 1, position: p(0.5, 2) }]));
    const q = part(a, provider([0, 0.5, 1], (i, p, t) => i + p.x + t));
    expect(q.crossingCount).toBe(0); expect(q.intervals[0].geometry).toBe("VALID_DEGENERATE");
    expect(q.intervals[0].segment.index).toBe(1);
    expect([q.intervals[0].start.T1, q.intervals[0].end.T1]).toEqual([1, 4]);
    expect(q.intervals[0].start.context.side).toBe("DWELL");
    expect(q.nodes.every(n => n.contact !== null)).toBe(true);
  });
  it.each([[0, 0], [1, 1]])("fixture 12: touch-return from height %s stays in segment %s", (height, segment) => {
    const a = path([height, 0.5, height]);
    const before = part(a, provider(), 0), after = part(a, provider(), 1);
    expect(before.nodes[1].contact).toEqual(after.nodes[0].contact);
    expect(before.intervals[0].segment.index).toBe(segment);
    expect(after.intervals[0].segment.index).toBe(segment);
    expect(before.crossingCount + after.crossingCount).toBe(0);
  });
  it("fixture 13: ordinary endpoint value differs from incoming explicit limit", () => {
    const q = provider([0, 0.5, 1], i => i === 0 ? 1 : 9);
    const a = part(path([0, 0.5]), q);
    expect(ok(q.ordinary(p(0.5), 1)).T1).toBe(9);
    expect(a.intervals[0].end.T1).toBe(1);
  });
  it("fixture 19: boundary-conditioned primary attempt is rejected without inventing zero", () => {
    const q = provider([0, 0.5, 1], () => 2, ["FULL_SUPPORT", "FULL_SUPPORT", "BOUNDARY_CONDITIONED"]);
    const a = path([0, 1]);
    expect(partitionAcceptedStep(a, 0, q, request)).toEqual({ status: "UNSUPPORTED", reason: "BOUNDARY_CONDITIONED", value: null });
    const secondary = ok(partitionAcceptedStep(a, 0, q, { ...request, support: "ALLOW_BOUNDARY_CONDITIONED" }));
    expect(secondary.intervals.map(i => i.start.support)).toEqual(["FULL_SUPPORT", "BOUNDARY_CONDITIONED"]);
    expect(partitionAcceptedStep(path([0, 0.5]), 0, q, request).status).toBe("UNSUPPORTED");
    expect(partitionAcceptedStep(a, 0, q, { ...request, eligibility: "INELIGIBLE" })).toMatchObject({ reason: "INELIGIBLE_INTERVAL", value: null });
  });
  it("fixture 20: unavailable provider stays N_A", () => {
    const q = ok(createAnalysisProvider(null, updraft(), "gradient-test"));
    expect(q.ordinary(p(0), 0)).toEqual({ status: "N_A", reason: "COLUMN_UNAVAILABLE", value: null });
    expect(partitionAcceptedStep(path([0, 1]), 0, q, request)).toMatchObject({ status: "N_A", value: null });
  });
  it.each([[0, 0.5, 0.5, 1], [0, 1, 0.5], [0, NaN], [0, Infinity], [0]].map(heights => [heights]))("fixture 21: malformed topology %s", heights => {
    expect(createDiagnosticProvider({ identity: "bad", version: "1", heights, evaluate: () => ({ T1: 1, omega: null, gradient: null }) })).toMatchObject({ status: "FAILED", code: "MALFORMED_PROFILE" });
  });
});

function updraft() { return new VerticalEnvelopeUpdraftField({ centerX: 0, centerZ: 0, peakVerticalVelocity: 2, sigma: 1, baseHeight: -1, topHeight: 2 }); }
function wind() { return new EnvironmentalWindProfile([0, 0.5, 1].map((height, i) => ({ height,
  velocity: { eastward: i, northward: i * i, vertical: 0 } }))); }
function analysis(profile: EnvironmentalWindProfile, support: readonly DiagnosticSupport[]): EscHrTimeAnalysisColumn {
  return { profile, support, provenance: { sourceIdentity: "artificial-column", samplingClass: "high-resolution-mobile-esc",
    transformId: "esc-hr-time-hamming-sinc-lowpass", transformVersion: "v1", domain: "TIME", cutoffWavelengthS: 40,
    sampleIntervalS: 1, tapCount: 81, window: "Hamming", phase: "zero", gapPolicy: "integer-linear-uvh-max-5s",
    interpolatedCount: 0, uniformN: 3, interpolationFraction: 0, maxGapS: 1, boundaryPolicy: "half-sample-mirror",
    supportSemantics: "sample-level FULL_SUPPORT | BOUNDARY_CONDITIONED", outputCoordinate: "Source heights", researchPredecessor: "v0.1-research" } };
}
describe("P2 Slice 2 actual adapters with artificial profiles only", () => {
  it("Source ordinary agrees with production away from knots and at ordinary boundaries", () => {
    const profile = wind(), field = updraft();
    const q = ok(createSourceProvider(profile, field, "fixed-gradient/v1"));
    const legacy = new DiagnosticTiltingTendency({ profile, updraft: field });
    for (const y of [0, 0.25, 0.5, 0.75, 1]) {
      const ordinary = ok(q.ordinary(p(y, 0.25), 0));
      expect(ordinary.T1).toBe(legacy.sample(p(y, 0.25), 0));
      expect(ok(q.explicit(p(y, 0.25), 0, ordinary.context)).T1).toBe(ordinary.T1);
    }
    const lower = ok(q.explicit(p(0.5, 0.25), 0, { segment: q.topology!.segments[0], side: "TEMPORAL_MINUS" }));
    expect(lower.T1).not.toBe(ok(q.ordinary(p(0.5, 0.25), 0)).T1);
    expect(q.ordinary(p(-1), 0)).toMatchObject({ status: "UNSUPPORTED", value: null });
  });
  it("Analysis uses supplied profile and segment endpoint support without filtering", () => {
    const column = analysis(wind(), ["FULL_SUPPORT", "FULL_SUPPORT", "BOUNDARY_CONDITIONED"]), field = updraft();
    const q = ok(createAnalysisProvider(column, field, "fixed-gradient/v1"));
    for (const y of [0.25, 0.5, 0.75, 1]) {
      const expected = queryAnalysisTiltingExplanationAt(column, field, p(y, 0.25), 0);
      if (expected.status !== "FULL_SUPPORT" && expected.status !== "BOUNDARY_CONDITIONED") throw new Error("bad fixture");
      const actual = ok(q.ordinary(p(y, 0.25), 0));
      expect(actual.support).toBe(expected.status); expect(actual.T1).toBe(expected.tiltingTendency);
    }
    expect(ok(q.explicit(p(0.5, 0.25), 0, { segment: q.topology!.segments[0], side: "TEMPORAL_MINUS" })).support).toBe("FULL_SUPPORT");
    expect(ok(q.ordinary(p(0.5, 0.25), 0)).support).toBe("BOUNDARY_CONDITIONED");
    expect(q.ordinary(p(2), 0)).toMatchObject({ status: "UNSUPPORTED", reason: "OUT_OF_DOMAIN", value: null });
  });
  it("provider snapshot and identities are immutable and scoped", () => {
    const heights = [0, 0.5, 1], supports: DiagnosticSupport[] = ["FULL_SUPPORT", "FULL_SUPPORT", "FULL_SUPPORT"];
    const q = provider(heights, () => 2, supports);
    heights[1] = 0.75; supports[0] = "BOUNDARY_CONDITIONED";
    expect(q.topology!.heights[1]).toBe(0.5); expect(q.topology!.support[0]).toBe("FULL_SUPPORT");
    expect(Object.isFrozen(q.topology!.segments[0])).toBe(true);
    const other = provider([0, 0.25, 1]);
    expect(q.explicit(p(0.25), 0, { segment: other.topology!.segments[0], side: "TEMPORAL_PLUS" })).toMatchObject({ code: "PROVIDER_MISMATCH" });
    expect(partitionAcceptedStep(path([0, 1]), 0, { ...q, fingerprint: "wrong" }, request)).toMatchObject({ code: "PROVIDER_MISMATCH" });
    expect(q.explicit(p(0.75), 0, { segment: q.topology!.segments[0], side: "TEMPORAL_PLUS" })).toMatchObject({ code: "NUMERICAL_AMBIGUITY" });
  });
  it("checks domain before ordinary oracle and propagates nonfinite provider output", () => {
    let calls = 0;
    const q = ok(createDiagnosticProvider({ identity: "counter", version: "1", heights: [0, 1],
      evaluate: () => ({ T1: NaN, omega: null, gradient: null }), ordinaryOracle: () => { calls++; return { T1: 0, omega: null, gradient: null }; } }));
    expect(q.ordinary(p(2), 0).status).toBe("UNSUPPORTED"); expect(calls).toBe(0);
    expect(q.ordinary(p(0.5), 0)).toMatchObject({ status: "FAILED", code: "NONFINITE_ARITHMETIC" });
    expect(calls).toBe(0);
  });
});

describe("P2 Slice 2 additional topology boundaries", () => {
  it("horizontal segment and domain-boundary dwell use ordinary ownership", () => {
    for (const y of [0, 0.25, 1]) {
      const a = part(path([y, y]));
      expect(a.intervals[0].geometry).toBe("VALID_DEGENERATE");
      expect(a.intervals[0].segment.index).toBe(y === 1 ? 1 : 0);
    }
  });
  it("near-touch is not snapped", () => {
    const below = 0.5 - 2 ** -54;
    const a = part(path([0, below]));
    expect(a.crossingCount).toBe(0); expect(a.nodes[1].contact).toBe(null);
    expect(a.nodes[1].position.y).toBe(below);
  });
  it("distinct internal crossings collapsing to one time fail", () => {
    const a = path([0, 1], [2 ** 53, 2 ** 53 + 8]);
    expect(partitionAcceptedStep(a, 0, provider([0, 0.25, 0.3125, 1]), request)).toMatchObject({ status: "FAILED", code: "NUMERICAL_AMBIGUITY" });
  });
  it("out-of-domain steps and mismatched support metadata remain nonnumeric", () => {
    expect(partitionAcceptedStep(path([-1, 1]), 0, provider(), request)).toMatchObject({ status: "UNSUPPORTED", value: null });
    expect(createDiagnosticProvider({ identity: "bad-support", version: "1", heights: [0, 1], knotSupport: ["FULL_SUPPORT"],
      evaluate: () => ({ T1: 0, omega: null, gradient: null }) })).toMatchObject({ code: "MALFORMED_PROFILE" });
  });
  it("primitives contain no campaign data or later-slice dependencies", () => {
    for (const file of ["path.ts", "partition.ts"]) {
      const text = readFileSync(`src/validation/lagrangianEstimator/${file}`, "utf8");
      expect(text).not.toMatch(/Goshen|Prospect|Dumas|Moore|IGRA|ESC|S[1-4]-[LH]|parallel_plus|right_minus|0\.0625|0\.125|0\.25|0\.5|createSourceProvider|createAnalysisProvider/);
      expect(text).not.toMatch(/from .*providers|from .*simulation|from .*observed|nextafter/i);
    }
  });
});
