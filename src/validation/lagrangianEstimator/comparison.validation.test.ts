import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { compareGeometry, compareHistory, compareExposures, comparePointwise, compareEvents, compareSuccessiveRefinement } from "./comparison.js";
import { referenceBits, referenceFromBits } from "./syntheticReferences.js";
import { createAcceptedPath } from "./path.js";
import { createDiagnosticProvider } from "./providers.js";
import { partitionAcceptedStep } from "./partition.js";
import { comparePathHistory } from "./history.js";
import { integratePathExposure } from "./exposure.js";
import type { ComparisonContext, ComparisonResult, PreparedComparison, PreparedGeometry, PreparedPointwise,
  PreparedEvents, PreparedLifecycleEvent, HistoryResult, ExposureResult, ArithmeticAllowance, EndpointOperand, Position } from "./types.js";

const next = (x: number) => referenceFromBits(referenceBits(x) + 1n);
const prepared = <T>(value: T): PreparedComparison<T> => ({ status: "COMPLETE", value });
function ok<T>(r: ComparisonResult<T>): T {
  if (r.status !== "COMPLETE") throw new Error(JSON.stringify(r));
  return r.value;
}
const context = (level = 0, b = 4): ComparisonContext => ({ interval: { a: 0, b }, channel: "synthetic-diagnostic",
  role: "PRIMARY", coarse: { id: `run-${level}`, pathFingerprint: `path-${level}`, h: 2 / 2 ** level },
  fine: { id: `run-${level + 1}`, pathFingerprint: `path-${level + 1}`, h: 1 / 2 ** level } });
const p = (x = 0, y = 0, z = 0): Position => ({ x, y, z });
function geometry(c: ComparisonContext, x = 0, y = 0, response = false): PreparedComparison<PreparedGeometry> {
  return prepared({ basis: "STORED_COMMON_COARSE_TIMES", kind: response ? "MEMBER_RESPONSE" : "POSITION",
    baselineIds: response ? { coarse: "baseline-coarse", fine: "baseline-fine" } : null,
    samples: Array.from({ length: c.interval.b / c.coarse.h + 1 }, (_, i) => {
      const time = i * c.coarse.h;
      return { coarse: { time, position: p(x, y) }, fine: { time, position: p() },
        coarseBaseline: response ? { time, position: p() } : null, fineBaseline: response ? { time, position: p() } : null };
    }) });
}
const allowance: ArithmeticAllowance = { k: 128, scale: 1, bound: 1e6 };
// Hand-declared prepared numeric evidence tests criteria only. Empty traces here
// are synthetic stubs, not estimator output or campaign evidence.
function history(c: ComparisonContext, R1: number, Aref: number): HistoryResult {
  return { status: "COMPLETE", value: { schema: "p2-history/v1", units: "s^-2", areaUnits: "s^-1", runtime: { node: "synthetic", v8: "synthetic" },
    interval: c.interval, duration: c.interval.b - c.interval.a, role: c.role, support: "FULL_SUPPORT",
    coarsePathFingerprint: c.coarse.pathFingerprint, finePathFingerprint: c.fine.pathFingerprint,
    coarseProviderFingerprint: "provider", fineProviderFingerprint: "provider", residualArea: R1 * (c.interval.b - c.interval.a),
    referenceArea: Aref * (c.interval.b - c.interval.a), R1, Aref, durationSum: c.interval.b - c.interval.a, durationAllowance: allowance,
    arithmetic: { scope: "LOCAL_INTERPOLANT_ARITHMETIC_ONLY", R1: allowance, Aref: allowance, residualArea: allowance, referenceArea: allowance },
    trace: { request: { interval: c.interval, role: c.role }, inputs: [], partitions: [], nodes: [], evaluations: [], contributions: [] } } };
}
function exposure(c: ComparisonContext, fine: boolean, Eabs: number, Esigned = Eabs): ExposureResult {
  return { status: "COMPLETE", value: { schema: "p2-exposure/v1", units: "s^-1", interval: c.interval, role: c.role,
    support: "FULL_SUPPORT", pathFingerprint: (fine ? c.fine : c.coarse).pathFingerprint, providerFingerprint: "provider",
    stepCount: 1, subintervalCount: 1, crossingCount: 0, Esigned, Eabs, allowance,
    invariants: { absoluteNonnegative: true, signedBounded: true }, trace: { inputs: [], contributions: [] } } };
}
const operand = (time: number, T1: number, segment = 0): EndpointOperand => ({ time, T1, position: p(), support: "FULL_SUPPORT",
  context: { side: "ORDINARY", segment: { providerFingerprint: "provider", index: segment } }, omega: null, gradient: null });
function pointwise(c: ComparisonContext, coarse: number, fine: number): PreparedComparison<PreparedPointwise> {
  return prepared({ basis: "STORED_COMMON_COARSE_TIMES", coarseCrossings: [], fineCrossings: [],
    samples: Array.from({ length: c.interval.b / c.coarse.h + 1 }, (_, i) => ({ coarse: operand(i * c.coarse.h, coarse), fine: operand(i * c.coarse.h, fine) })) });
}
const event = (a: number, b: number, kind = "end", category: PreparedLifecycleEvent["category"] = "LIFECYCLE"): PreparedLifecycleEvent =>
  ({ a, b, kind, representation: null, category });
const events = (coarseEvents: PreparedLifecycleEvent[] = [], fineEvents: PreparedLifecycleEvent[] = [], coarsePrefixTime = 4, finePrefixTime = 4): PreparedComparison<PreparedEvents> =>
  prepared({ coarseEvents, fineEvents, coarsePrefixTime, finePrefixTime });
const metric = (r: ComparisonResult, name: string) => ok(r).checks.find(x => x.metric === name)!;

describe("P2 Slice 5 geometry and response criteria (P §9 A-D)", () => {
  it.each([[10, "PASS"], [next(10), "INVALID CONTROL"]] as const)("position %s", (x, expected) => {
    const c = context(), check = metric(compareGeometry(c, geometry(c, x)), "POSITION");
    expect(check).toMatchObject({ residual: x, tolerance: 10, units: "m", outcome: expected });
  });
  it.each([[3, "PASS"], [next(3), "INVALID CONTROL"]] as const)("vertical %s", (y, expected) => {
    const c = context(); expect(metric(compareGeometry(c, geometry(c, 0, y)), "VERTICAL").outcome).toBe(expected);
  });
  it("Euclidean norm, chronological maximum, and first tied witness", () => {
    const c = context(), data = geometry(c);
    if (data.status !== "COMPLETE") throw new Error("fixture");
    const samples = data.value.samples.map((row, i) => ({ ...row, coarse: { ...row.coarse, position: i === 0 ? p() : p(6, 0, 8) } }));
    const e = ok(compareGeometry(c, prepared({ ...data.value, samples })));
    expect(e.checks[0]).toMatchObject({ residual: 10, details: { index: 1 }, outcome: "PASS" });
  });
  it("member-minus-baseline subtraction precedes coarse/fine response difference", () => {
    const c = context(), data = geometry(c, 0, 0, true);
    if (data.status !== "COMPLETE") throw new Error("fixture");
    const samples = data.value.samples.map(row => ({ ...row,
      coarse: { ...row.coarse, position: p(100, 20) }, fine: { ...row.fine, position: p(90, 18) },
      coarseBaseline: { time: row.coarse.time, position: p(80, 10) }, fineBaseline: { time: row.fine.time, position: p(80, 11) } }));
    const e = ok(compareGeometry(c, prepared({ ...data.value, samples })));
    expect(e.checks.map(x => [x.metric, x.residual, x.tolerance])).toEqual([["RESPONSE", Math.hypot(10, 3), 10], ["VERTICAL_RESPONSE", 3, 3]]);
  });
  it("baseline self-response is N_A, never a fabricated zero", () => {
    const c = context(), data = geometry(c);
    if (data.status !== "COMPLETE") throw new Error("fixture");
    expect(compareGeometry(c, prepared({ ...data.value, kind: "BASELINE_SELF_RESPONSE" })))
      .toMatchObject({ status: "N_A", reason: "BASELINE_SELF_RESPONSE", value: null });
  });
  it("rejects missing and unmatched stored samples instead of interpolating", () => {
    const c = context(), data = geometry(c);
    if (data.status !== "COMPLETE") throw new Error("fixture");
    expect(compareGeometry(c, prepared({ ...data.value, samples: data.value.samples.slice(1) })).status).toBe("FAILED");
    const samples = data.value.samples.map(row => ({ ...row, fine: { ...row.fine, time: row.fine.time + 0.1 } }));
    expect(compareGeometry(c, prepared({ ...data.value, samples })).status).toBe("FAILED");
  });
});

describe("P2 Slice 5 history and exposure tolerances (§16)", () => {
  it("history equality passes; next binary64 fails despite large arithmetic allowance", () => {
    const c = context(), threshold = 1e-6 + 0.01 * 4;
    const exact = metric(compareHistory(c, history(c, threshold, 4)), "HISTORY");
    expect(exact).toMatchObject({ outcome: "PASS", tolerance: threshold, scale: 4, absoluteTerm: 1e-6, relativeTerm: 0.04 });
    expect(exact.arithmetic[0].bound).toBe(1e6);
    expect(metric(compareHistory(c, history(c, next(threshold), 4)), "HISTORY").outcome).toBe("INVALID CONTROL");
  });
  it("history uses addition and has no crossing exclusion", () => {
    const c = context(); expect(metric(compareHistory(c, history(c, 1e-6, 0)), "HISTORY").outcome).toBe("PASS");
    expect(metric(compareHistory(c, history(c, 0.010001, 1)), "HISTORY").tolerance).toBe(1e-6 + 0.01);
  });
  it.each([[1e-5, "PASS"], [next(1e-5), "INVALID CONTROL"]] as const)("floor-dominated Eabs difference %s", (value, expected) => {
    const c = context(), e = metric(compareExposures(c, exposure(c, false, value), exposure(c, true, 0)), "EXPOSURE_ABS");
    expect(e).toMatchObject({ scale: 1e-3, tolerance: 1e-5, outcome: expected });
  });
  it("scale-dominated Eabs uses max, not sum", () => {
    const c = context(), e = metric(compareExposures(c, exposure(c, false, 101), exposure(c, true, 100)), "EXPOSURE_ABS");
    expect(e).toMatchObject({ scale: 100, tolerance: 1, residual: 1, outcome: "PASS" });
    expect(metric(compareExposures(c, exposure(c, false, next(101)), exposure(c, true, 100)), "EXPOSURE_ABS").outcome).toBe("INVALID CONTROL");
  });
  it("signed cancellation uses its own near-zero scale, independently of Eabs", () => {
    const c = context(), e = ok(compareExposures(c, exposure(c, false, 1000, 2e-5), exposure(c, true, 1000, 0)));
    expect(e.checks[0]).toMatchObject({ metric: "EXPOSURE_ABS", outcome: "PASS", tolerance: 10 });
    expect(e.checks[1]).toMatchObject({ metric: "EXPOSURE_SIGNED", outcome: "INVALID CONTROL", scale: 1e-3, tolerance: 1e-5 });
  });
  it("negative signed values use magnitude of the fine signed value", () => {
    const c = context(); expect(metric(compareExposures(c, exposure(c, false, 101, -101), exposure(c, true, 100, -100)), "EXPOSURE_SIGNED"))
      .toMatchObject({ residual: 1, scale: 100, tolerance: 1, outcome: "PASS" });
  });
  it("rejects mismatched common intervals and path identities", () => {
    const c = context(), h = history(c, 0, 0), x = exposure(c, true, 0);
    if (h.status !== "COMPLETE" || x.status !== "COMPLETE") throw new Error("fixture");
    expect(compareHistory(c, { ...h, value: { ...h.value, interval: { a: 0, b: 2 } } }).status).toBe("FAILED");
    expect(compareExposures(c, exposure(c, false, 0), { ...x, value: { ...x.value, pathFingerprint: "wrong" } }).status).toBe("FAILED");
  });
  it("accepts actual Slice-3/4 synthetic estimator results without reconstructing them", () => {
    const cp = createAcceptedPath([0, 2, 4].map(time => ({ time, position: p(0, time) })));
    const fp = createAcceptedPath([0, 1, 2, 3, 4].map(time => ({ time, position: p(0, time) })));
    const provider = createDiagnosticProvider({ identity: "synthetic-constant", version: "test/v1", heights: [0, 4],
      evaluate: () => ({ T1: 2, omega: null, gradient: null }) });
    if (cp.status !== "COMPLETE" || fp.status !== "COMPLETE" || provider.status !== "COMPLETE") throw new Error("fixture");
    const c = context();
    const ctx = { ...c, coarse: { ...c.coarse, pathFingerprint: cp.value.fingerprint }, fine: { ...c.fine, pathFingerprint: fp.value.fingerprint } };
    const h = comparePathHistory({ status: "COMPLETE", value: { path: cp.value, provider: provider.value, eligibility: "ELIGIBLE" } },
      { status: "COMPLETE", value: { path: fp.value, provider: provider.value, eligibility: "ELIGIBLE" } }, { interval: ctx.interval, role: "PRIMARY" });
    const xs = [cp.value, fp.value].map(path => integratePathExposure(path.steps.map((_, i) => partitionAcceptedStep(path, i, provider.value,
      { eligibility: "ELIGIBLE", support: "FULL_SUPPORT" })), { role: "PRIMARY" }));
    expect(metric(compareHistory(ctx, h), "HISTORY")).toMatchObject({ residual: 0, scale: 2, outcome: "PASS" });
    expect(ok(compareExposures(ctx, xs[0], xs[1])).checks.every(x => x.residual === 0 && x.outcome === "PASS")).toBe(true);
  });
  it("preserves raw exposure values accepted upstream within arithmetic allowance", () => {
    const c = context(), e = metric(compareExposures(c, exposure(c, false, -Number.MIN_VALUE, 0), exposure(c, true, 0)), "EXPOSURE_ABS");
    expect(e.details.coarse).toBe(-Number.MIN_VALUE); expect(e.residual).toBe(Number.MIN_VALUE); expect(e.outcome).toBe("PASS");
  });
});

describe("P2 inherited pointwise check and accepted-step crossing exclusions", () => {
  it.each([[5e-6, "PASS"], [next(5e-6), "INVALID CONTROL"]] as const)("pointwise absolute boundary %s", (value, expected) => {
    const c = context(); expect(ok(comparePointwise(c, pointwise(c, value, 0))).checks.every(x => x.outcome === expected)).toBe(true);
  });
  it("pointwise relative and absolute terms are added", () => {
    const c = context(), e = metric(comparePointwise(c, pointwise(c, 10, 10)), "POINTWISE");
    expect(e).toMatchObject({ scale: 10, absoluteTerm: 5e-6, relativeTerm: 0.2, tolerance: 5e-6 + 0.2 });
  });
  it("closed expanded brackets use coarse h for either run and report exclusions", () => {
    const c = context(0, 12), data = pointwise(c, 0, 0);
    if (data.status !== "COMPLETE") throw new Error("fixture");
    const e = ok(comparePointwise(c, prepared({ ...data.value, fineCrossings: [{ a: 4, b: 6, representation: c.channel }] })));
    expect(e.checks.map(x => x.details.time)).toEqual([12]);
    expect(e.details).toMatchObject({ excludedCount: 6, excludedFraction: 6 / 7 });
  });
  it("ignores other representations and crossings ending after comparison end", () => {
    const c = context(), data = pointwise(c, 0, 0);
    if (data.status !== "COMPLETE") throw new Error("fixture");
    const e = ok(comparePointwise(c, prepared({ ...data.value, coarseCrossings: [{ a: 0, b: 2, representation: "other" },
      { a: 4, b: 5, representation: c.channel }] })));
    expect(e.checks).toHaveLength(3); expect(e.details.excludedCount).toBe(0);
  });
  it("no matching eligible segments is N_A and does not remove history/exposure requirements", () => {
    const c = context(), data = pointwise(c, 0, 0);
    if (data.status !== "COMPLETE") throw new Error("fixture");
    const samples = data.value.samples.map(row => ({ ...row, fine: operand(row.fine.time, 0, 1) }));
    expect(comparePointwise(c, prepared({ ...data.value, samples }))).toMatchObject({ status: "N_A", reason: "NO_SEGMENT_MATCHED_SAMPLES", value: null });
    expect(compareHistory(c, history(c, 0, 0)).status).toBe("COMPLETE");
  });
});

describe("P2 event and prefix criteria", () => {
  it("fine bracket width uses fine h, not coarse h", () => {
    const c = context(); // coarse h=2, fine h=1
    const e = ok(compareEvents(c, events([event(0, 2)], [event(0, 1.5)])));
    expect(e.checks.filter(x => x.metric === "EVENT_WIDTH").map(x => [x.residual, x.tolerance, x.outcome]))
      .toEqual([[2, 2, "PASS"], [1.5, 1, "INVALID CONTROL"]]);
  });
  it("coarse width exactly at own h passes; just above fails", () => {
    const c = context();
    expect(metric(compareEvents(c, events([event(0, 2)])), "EVENT_WIDTH").outcome).toBe("PASS");
    expect(metric(compareEvents(c, events([event(0, next(2))])), "EVENT_WIDTH").outcome).toBe("INVALID CONTROL");
  });
  it.each([[4, "PASS"], [next(4), "INVALID CONTROL"]] as const)("event endpoint shift %s", (shift, expected) => {
    const c = context(0, 10), e = metric(compareEvents(c, events([event(0, 0)], [event(shift, shift)])), "EVENT_TIME");
    expect(e).toMatchObject({ residual: shift, tolerance: 4, outcome: expected });
  });
  it("event/prefix tolerance floor is one second", () => {
    const c = context(3, 4), e = ok(compareEvents(c, events([event(0, 0)], [event(1, 1)], 3, 4)));
    expect(e.checks.filter(x => x.metric === "EVENT_TIME" || x.metric === "PREFIX_TIME").every(x => x.tolerance === 1 && x.outcome === "PASS")).toBe(true);
    expect(metric(compareEvents(c, events([], [], 0, next(1))), "PREFIX_TIME").outcome).toBe("INVALID CONTROL");
  });
  it("event type/co-event sets must match; diagnostic crossings are not lifecycle checks", () => {
    const c = context();
    const e = ok(compareEvents(c, events([event(0, 0, "a"), event(1, 1, "b"), event(0, 4, "knot", "DIAGNOSTIC_CROSSING")],
      [event(1, 1, "b"), event(0, 0, "a")])));
    expect(e.outcome).toBe("PASS"); expect(e.checks.filter(x => x.metric === "EVENT_WIDTH")).toHaveLength(4);
    expect(metric(compareEvents(c, events([event(0, 0, "a")], [event(0, 0, "b")])), "EVENT_TYPES").outcome).toBe("INVALID CONTROL");
  });
  it("co-events anchor to earliest bracket without transitive chaining", () => {
    const c = context(0, 12), rows = [event(0, 0, "a"), event(4, 4, "b"), event(8, 8, "c")];
    const e = ok(compareEvents(c, events(rows, rows)));
    expect((e.details.coarseGroups as unknown[][]).map(g => g.length)).toEqual([2, 1]);
    expect(e.outcome).toBe("PASS");
  });
  it("missing group fails and events beyond comparison end are excluded", () => {
    const c = context();
    expect(metric(compareEvents(c, events([event(0, 0)], [])), "EVENT_COUNT").outcome).toBe("INVALID CONTROL");
    expect(ok(compareEvents(c, events([event(5, 6)], []))).outcome).toBe("PASS");
  });
});

describe("P2 successive refinement: ordinary checks and non-worsening are independent", () => {
  const pair = (level: number, residual: number) => compareGeometry(context(level), geometry(context(level), residual));
  it.each([[5, 2, "PASS"], [2, 3, "PASS"], [2, next(3), "INVALID CONTROL"], [1, 3, "INVALID CONTROL"]] as const)
    ("position residuals %s -> %s", (coarse, fine, expected) => {
      const e = ok(compareSuccessiveRefinement(pair(0, coarse), pair(1, fine)));
      expect(e.ordinaryOutcome).toBe("PASS"); expect(e.nonWorsening[0].allowance).toBe(1); expect(e.outcome).toBe(expected);
    });
  it("ordinary failure remains failure even with strict improvement", () => {
    const e = ok(compareSuccessiveRefinement(pair(0, 12), pair(1, 5)));
    expect(e.nonWorsening[0].outcome).toBe("PASS"); expect(e.ordinaryOutcome).toBe("INVALID CONTROL"); expect(e.outcome).toBe("INVALID CONTROL");
  });
  it("uses frozen subtraction order, not reassociated addition at a rounded boundary", () => {
    const coarse = 1 + 3 * 2 ** -52, fine = 2 + 2 ** -50;
    expect(fine <= coarse + 1).toBe(true); // Non-normative rearrangement rounds upward.
    const e = ok(compareSuccessiveRefinement(pair(0, coarse), pair(1, fine)));
    expect(e.ordinaryOutcome).toBe("PASS");
    expect(e.nonWorsening[0].increase).toBe(1 + 2 ** -52);
    expect(e.nonWorsening[0].outcome).toBe("INVALID CONTROL");
  });
  it("finer history uses its own Aref budget", () => {
    const c = context(), f = context(1);
    const e = ok(compareSuccessiveRefinement(compareHistory(c, history(c, 0, 100)), compareHistory(f, history(f, 1e-6, 0))));
    expect(e.ordinaryOutcome).toBe("PASS");
    expect(e.nonWorsening[0]).toMatchObject({ finerTolerance: 1e-6, allowance: 0.1 * 1e-6, outcome: "INVALID CONTROL" });
  });
  it("finer exposure uses its own scale and both signed/absolute metrics participate", () => {
    const c = context(), f = context(1);
    const coarse = compareExposures(c, exposure(c, false, 100.5), exposure(c, true, 100));
    const fine = compareExposures(f, exposure(f, false, 100), exposure(f, true, 99.4));
    const e = ok(compareSuccessiveRefinement(coarse, fine));
    expect(e.ordinaryOutcome).toBe("PASS"); expect(e.nonWorsening).toHaveLength(2);
    expect(e.nonWorsening.every(x => x.finerTolerance === 0.01 * 99.4 && x.outcome === "INVALID CONTROL")).toBe(true);
  });
  it("response and vertical-response are whitelisted aggregates", () => {
    const c = context(), f = context(1);
    const e = ok(compareSuccessiveRefinement(compareGeometry(c, geometry(c, 1, 0, true)), compareGeometry(f, geometry(f, 1, 1, true))));
    expect(e.nonWorsening.map(x => x.metric)).toEqual(["RESPONSE", "VERTICAL_RESPONSE"]);
    expect(e.nonWorsening[1].outcome).toBe("INVALID CONTROL");
  });
  it("pointwise and event/prefix checks retain ordinary rules but are excluded from non-worsening", () => {
    const c = context(), f = context(1);
    for (const [a, b] of [[comparePointwise(c, pointwise(c, 0, 0)), comparePointwise(f, pointwise(f, 1e-6, 0))],
      [compareEvents(c, events()), compareEvents(f, events([], [], 4, 3))]]) {
      const e = ok(compareSuccessiveRefinement(a, b));
      expect(e.nonWorsening).toHaveLength(0); expect(e.excluded.length).toBeGreaterThan(0); expect(e.outcome).toBe("PASS");
    }
  });
  it("requires same physical interval, shared middle run/path and metric set", () => {
    const a = pair(0, 1), b = pair(1, 1); if (b.status !== "COMPLETE") throw new Error("fixture");
    for (const ctx of [{ ...b.value.context, interval: { a: 0, b: 2 } },
      { ...b.value.context, coarse: { ...b.value.context.coarse, id: "wrong" } }])
      expect(compareSuccessiveRefinement(a, { ...b, value: { ...b.value, context: ctx } }).status).toBe("FAILED");
    expect(compareSuccessiveRefinement(a, { ...b, value: { ...b.value, checks: b.value.checks.slice(1) } }).status).toBe("FAILED");
  });
});

describe("P2 comparison typing, arithmetic and audit", () => {
  it("propagates N_A, unsupported, and typed arithmetic failure without a numerical outcome", () => {
    const c = context();
    const states = [{ status: "N_A", reason: "COLUMN_UNAVAILABLE", value: null },
      { status: "UNSUPPORTED", reason: "OUT_OF_DOMAIN", value: null },
      { status: "UNSUPPORTED", reason: "INELIGIBLE_INTERVAL", value: null },
      { status: "FAILED", code: "NONFINITE_ARITHMETIC", operation: "upstream" }] as const;
    for (const state of states) {
      const r = compareGeometry(c, state); expect(r).toMatchObject(state); expect(r).not.toHaveProperty("value.checks");
      expect(compareSuccessiveRefinement(r, compareGeometry(context(1), geometry(context(1))))).toMatchObject(state);
    }
  });
  it("secondary evidence cannot be promoted to primary", () => {
    const c = context(), h = history(c, 0, 0); if (h.status !== "COMPLETE") throw new Error("fixture");
    const conditioned: HistoryResult = { ...h, value: { ...h.value, role: "SECONDARY_DESCRIPTIVE", support: "BOUNDARY_CONDITIONED" } };
    expect(compareHistory(c, conditioned)).toMatchObject({ status: "UNSUPPORTED", reason: "BOUNDARY_CONDITIONED" });
    expect(ok(compareHistory({ ...c, role: "SECONDARY_DESCRIPTIVE" }, conditioned)).context.role).toBe("SECONDARY_DESCRIPTIVE");
  });
  it.each([NaN, Infinity, -Infinity])("nonfinite operand %s is FAILED, not INVALID CONTROL", value => {
    const c = context(); expect(compareHistory(c, history(c, value, 0))).toMatchObject({ status: "FAILED", code: "NONFINITE_ARITHMETIC" });
    expect(compareGeometry(c, geometry(c, value))).toMatchObject({ status: "FAILED", code: "NONFINITE_ARITHMETIC" });
  });
  it("overflowing subtraction and event tolerance fail numerically", () => {
    const c = context();
    expect(compareExposures(c, exposure(c, false, Number.MAX_VALUE, Number.MAX_VALUE), exposure(c, true, Number.MAX_VALUE, -Number.MAX_VALUE)))
      .toMatchObject({ status: "FAILED", code: "NONFINITE_ARITHMETIC" });
    const large = { ...c, coarse: { ...c.coarse, h: Number.MAX_VALUE }, fine: { ...c.fine, h: Number.MAX_VALUE / 2 } };
    expect(compareEvents(large, events())).toMatchObject({ status: "FAILED", code: "NONFINITE_ARITHMETIC" });
  });
  it("nonfinite arithmetic allowance evidence cannot produce a completed check", () => {
    const c = context(), h = history(c, 0, 0);
    if (h.status !== "COMPLETE") throw new Error("fixture");
    const input: HistoryResult = { ...h, value: { ...h.value, arithmetic: { ...h.value.arithmetic, R1: { ...allowance, bound: Infinity } } } };
    expect(compareHistory(c, input)).toMatchObject({ status: "FAILED", code: "NONFINITE_ARITHMETIC", operation: "comparison/arithmetic-bound" });
  });
  it("deterministic repeated evidence is copied/frozen", () => {
    const c = context(), data = geometry(c, 3), first = ok(compareGeometry(c, data));
    for (let i = 0; i < 5; i++) expect(JSON.stringify(ok(compareGeometry(c, data)))).toBe(JSON.stringify(first));
    if (data.status !== "COMPLETE") throw new Error("fixture");
    (data.value.samples[0].coarse.position as { x: number }).x = 99;
    (c.interval as { b: number }).b = 99;
    expect(first.checks[0].residual).toBe(3); expect(first.context.interval.b).toBe(4);
    expect(Object.isFrozen(first.checks[0].details)).toBe(true);
  });
  it("generic primitive imports only arithmetic/types and contains no campaign fixtures", () => {
    const text = readFileSync("src/validation/lagrangianEstimator/comparison.ts", "utf8");
    expect(text).not.toMatch(/Goshen|Prospect|Dumas|Moore|\bESC\b|\bIGRA\b|S[1-4]-[LH]|parallel_plus|right_minus|540|360|180|0\.0625|0\.125|0\.25|0\.5/);
    expect([...text.matchAll(/from ["']([^"']+)["']/g)].map(m => m[1])).toEqual(["./capture.js", "./arithmetic.js", "./types.js"]);
  });
});
