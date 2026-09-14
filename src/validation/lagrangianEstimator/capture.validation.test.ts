import { describe, it, expect } from "vitest";
import { createCapture, captureValue, enterCapture, closeCapture, injectCaptureFault, type CaptureContext } from "./capture.js";
import { createAcceptedPath, positionOnStep } from "./path.js";
import { createDiagnosticProvider } from "./providers.js";
import { partitionAcceptedStep } from "./partition.js";
import { localLinearIntegrals, NeumaierAccumulator, syntheticReferenceAllowance } from "./arithmetic.js";
import { integratePathExposure } from "./exposure.js";
import { comparePathHistory } from "./history.js";
import { compareGeometry, compareExposures } from "./comparison.js";
import { encodeRejectedInput, canonicalRecord, decodeRejectedInput } from "../p2Qualification/evidence.js";
import type { EstimatorResult, VerticalDiagnosticProvider } from "./types.js";

const ok = <T>(r: EstimatorResult<T>): T => { if (r.status !== "COMPLETE") throw new Error("fixture"); return r.value; };
const point = (y: number) => ({ x: 0, y, z: 0 });
const path = (times = [0, 1], ys = [0, 1]) => ok(createAcceptedPath(times.map((time, i) => ({ time, position: point(ys[i]) }))));
const request = { eligibility: "ELIGIBLE", support: "FULL_SUPPORT" } as const;
const primary = { role: "PRIMARY" } as const;
const provider = (heights = [0, .5, 1], value = 1) => ok(createDiagnosticProvider({ identity: "artificial", version: "v1", heights,
  evaluate: () => ({ T1: value, omega: null, gradient: null }) }));
const values = (context: CaptureContext | undefined, suffix: string) => closeCapture(context).events.filter(e => e.site.endsWith(suffix)).map(e => e.value);
const historyInput = (p = path(), q = provider()) => ({ status: "COMPLETE", value: { path: p, provider: q, eligibility: "ELIGIBLE" } }) as const;

describe("P2 generated failure prefix", () => {
  it("retains first collapsed candidate without future nodes or provider calls", () => {
    const c = createCapture(), p = path([2 ** 53, 2 ** 53 + 2]), q = provider([0, .25, .5, 1]);
    const result = partitionAcceptedStep(p, 0, q, request, c);
    expect(result).toEqual({ status: "FAILED", code: "NUMERICAL_AMBIGUITY", operation: "partition/crossing-order" });
    const journal = closeCapture(c);
    expect(journal.state).toBe("COMPLETE_GENERATED_PREFIX");
    expect(journal.events.find(e => e.site === "partition/ordered-boundary-indices")?.value).toEqual([1, 2]);
    expect(journal.events.filter(e => e.site.endsWith("local/lambda")).map(e => e.value)).toEqual([.25]);
    expect(journal.events.filter(e => e.site.endsWith("local/time")).map(e => e.value)).toEqual([2 ** 53]);
    expect(journal.events.filter(e => e.site.endsWith("local/nodes"))[0].value).toHaveLength(1);
    expect(journal.events.some(e => /provider-explicit\/begin/.test(e.site))).toBe(false);
  });
  it("retains an accepted internal node and distinct offending candidate at equal represented time", () => {
    const c = createCapture(); partitionAcceptedStep(path([2 ** 53, 2 ** 53 + 8]), 0, provider([0, .25, .3125, 1]), request, c);
    const e = closeCapture(c).events;
    expect(e.filter(e => e.site.endsWith("local/lambda")).map(e => e.value)).toEqual([.25, .3125]);
    expect(e.filter(e => e.site.endsWith("local/time")).map(e => e.value)).toEqual([2 ** 53 + 2, 2 ** 53 + 2]);
    expect(e.filter(e => e.site.endsWith("local/previous")).at(-1)?.value).toMatchObject({ lambda: .25 });
    expect(e.filter(e => e.site === "partition/nodes-accepted-count").map(e => e.value)).toEqual([2]);
  });
  it("retains descending ordered boundary identity without sorting numerical work", () => {
    const c = createCapture(); partitionAcceptedStep(path([0, 1], [1, 0]), 0, provider([0, .25, .75, 1]), request, c);
    expect(values(c, "ordered-boundary-indices")).toEqual([[2, 1]]);
  });
  it("duplicate knots retain validation input and never evaluate", () => {
    let calls = 0; const c = createCapture();
    const r = createDiagnosticProvider({ identity: "bad", version: "v1", heights: [0, .5, .5, 1], evaluate: () => { calls++; throw Error(); } }, c);
    expect(r).toMatchObject({ code: "MALFORMED_PROFILE", operation: "provider/height-order" });
    expect(calls).toBe(0); expect(values(c, "input/options")[0]).toMatchObject({ heights: [0, .5, .5, 1] });
  });
  it.each([NaN, Infinity, -Infinity])("nonfinite accepted time/position %s remains invalid trajectory", value => {
    for (const input of [[{ time: value, position: point(0) }, { time: 1, position: point(1) }],
      [{ time: 0, position: point(value) }, { time: 1, position: point(1) }]]) {
      const c = createCapture(); const r = createAcceptedPath(input, c);
      expect(r).toMatchObject({ code: "INVALID_TRAJECTORY", operation: "path/finite" });
      expect(canonicalRecord(encodeRejectedInput(values(c, "input/input")[0]))).toBe(canonicalRecord(encodeRejectedInput(input)));
    }
  });
  it("computed position overflow retains theta and actual nonfinite coordinates", () => {
    const p = ok(createAcceptedPath([{ time: 0, position: { x: -Number.MAX_VALUE, y: 0, z: 0 } },
      { time: 1, position: { x: Number.MAX_VALUE, y: 1, z: 0 } }]));
    const c = createCapture(); expect(positionOnStep(p, 0, .5, c)).toMatchObject({ operation: "path/position", code: "NUMERICAL_AMBIGUITY" });
    expect(values(c, "local/p")[0]).toMatchObject({ x: Infinity });
  });
  it.each(["nonfinite", "throw", "oracle"])("provider %s failure preserves calls and actual operands", kind => {
    const calls: string[] = [];
    const q = ok(createDiagnosticProvider({ identity: kind, version: "v1", heights: [0, 1],
      evaluate: () => { calls.push("evaluate"); if (kind === "throw") throw Error("fixture"); return { T1: kind === "nonfinite" ? NaN : 1, omega: null, gradient: null }; },
      ordinaryOracle: () => { calls.push("oracle"); return { T1: 2, omega: null, gradient: null }; } }));
    const c = createCapture(), r = q.ordinary(point(.5), 0, c);
    expect(r).toMatchObject({ operation: kind === "nonfinite" ? "provider/operands" : kind === "throw" ? "provider/evaluate" : "provider/ordinary-conformance" });
    expect(calls).toEqual(kind === "oracle" ? ["evaluate", "oracle"] : ["evaluate"]);
    if (kind !== "throw") expect(closeCapture(c).events.some(e => e.site.endsWith("evaluate/return"))).toBe(true);
  });
  it("partition start failure suppresses end and oracle", () => {
    const calls: number[] = [], c = createCapture();
    const q = ok(createDiagnosticProvider({ identity: "bad", version: "v1", heights: [0, 1],
      evaluate: (_i, _p, t) => { calls.push(t); return { T1: NaN, omega: null, gradient: null }; } }));
    partitionAcceptedStep(path(), 0, q, request, c); expect(calls).toEqual([0]);
  });
  it("local overflow retains actual exponent, without inventing a final infinite product", () => {
    const c = createCapture(); expect(localLinearIntegrals(0, 2, Number.MAX_VALUE, Number.MAX_VALUE, c)).toMatchObject({ operation: "scaledProduct3/overflow" });
    expect(values(c, "local/unbiased")).toEqual([1024]);
    expect(values(c, "local/rounded")).toEqual([]);
  });
  it("accumulator capture retains pre-state, exact commit order and sticky failure", () => {
    const c = createCapture(), a = new NeumaierAccumulator(c);
    expect(a.add(Number.MAX_VALUE).status).toBe("COMPLETE");
    const failure = a.add(Number.MAX_VALUE); expect(failure).toMatchObject({ operation: "neumaier/t" });
    expect(a.add(0)).toBe(failure); expect(a.total()).toBe(failure);
    expect(values(c, "neumaier/pre-s")).toEqual([0, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE]);
    expect(values(c, "neumaier/committed-s")).toEqual([Number.MAX_VALUE]);
    expect(Object.keys(a)).toEqual(["s", "c", "failure"]);
  });
  it("allowance normalization overflow retains completed bound and failing division", () => {
    const c = createCapture();
    const r = syntheticReferenceAllowance([{ a: 0, b: 1, u: Number.MAX_VALUE / 2, v: 0 }], { T: Number.MIN_VALUE, reference: 0 }, undefined, c);
    expect(r).toMatchObject({ status: "FAILED", operation: "syntheticAllowance/divided" });
    expect(values(c, "input/x")).toContain(Infinity);
    expect(values(c, "local/result").length).toBeGreaterThan(0);
  });
  it("support rejection occurs after geometry with zero evaluator calls", () => {
    const c = createCapture(); const q = ok(createDiagnosticProvider({ identity: "support", version: "v1", heights: [0, .5, 1],
      knotSupport: ["FULL_SUPPORT", "FULL_SUPPORT", "BOUNDARY_CONDITIONED"], evaluate: () => { throw Error("must not call"); } }));
    expect(partitionAcceptedStep(path(), 0, q, request, c)).toMatchObject({ status: "UNSUPPORTED", reason: "BOUNDARY_CONDITIONED" });
    expect(values(c, "local/lambda")).toEqual([.5]);
    expect(closeCapture(c).events.some(e => e.site.endsWith("provider-explicit/begin"))).toBe(false);
  });
  it("native and common-history failure prefixes survive child propagation", () => {
    const c = createCapture(), p = path([2 ** 53, 2 ** 53 + 2]), input = historyInput(p, provider([0, .25, 1]));
    const r = comparePathHistory(input, input, { interval: { a: 2 ** 53, b: 2 ** 53 + 2 }, ...primary }, c);
    expect(r).toMatchObject({ operation: "partition/crossing-order" });
    expect(values(c, "local/lambda")).toEqual([.25]);
    expect(values(c, "history/common-time")).toEqual([2 ** 53, 2 ** 53 + 2]);
  });
  it("foreign-node provider failure preserves native calls and active common endpoint", () => {
    const q = ok(createDiagnosticProvider({ identity: "foreign", version: "v1", heights: [0, 1],
      evaluate: (_i, _p, t) => ({ T1: t === .5 ? NaN : 1, omega: null, gradient: null }) }));
    const c = createCapture(); const r = comparePathHistory(historyInput(path(), q), historyInput(path([0, .5, 1], [0, .5, 1])),
      { interval: { a: 0, b: 1 }, ...primary }, c);
    expect(r).toMatchObject({ operation: "provider/operands" });
    expect(values(c, "input/t")).toContain(.5);
  });
  it("exposure accumulation and comparison retain nested causes and no fabricated estimates", () => {
    const c = createCapture(), p = path([0, 1, 2], [0, .5, 1]), q = provider([0, 1], Number.MAX_VALUE * .75);
    const partitions = p.steps.map(s => partitionAcceptedStep(p, s.index, q, request, c));
    const e = integratePathExposure(partitions, primary, c);
    expect(e).toMatchObject({ operation: "neumaier/t" }); expect(e).not.toHaveProperty("value");
    const context = { coarse: { id: "c", pathFingerprint: p.fingerprint, h: 1 }, fine: { id: "f", pathFingerprint: p.fingerprint, h: .5 }, interval: { a: 0, b: 2 }, channel: "artificial", role: "PRIMARY" } as const;
    expect(compareExposures(context, e, e, c)).toMatchObject({ operation: "neumaier/t" });
    expect(values(c, "neumaier/pre-s")).toContain(Number.MAX_VALUE * .75);
  });
  it("comparison late arithmetic failure retains earlier row residual", () => {
    const c = createCapture(); const context = { coarse: { id: "c", pathFingerprint: "c", h: 1 }, fine: { id: "f", pathFingerprint: "f", h: .5 }, interval: { a: 0, b: 1 }, channel: "x", role: "PRIMARY" } as const;
    const result = compareGeometry(context, { status: "COMPLETE", value: { basis: "STORED_COMMON_COARSE_TIMES", kind: "POSITION", baselineIds: null,
      samples: [0, 1].map(time => ({ coarse: { time, position: { x: time ? Number.MAX_VALUE : 2, y: 0, z: 0 } }, fine: { time, position: { x: time ? -Number.MAX_VALUE : 0, y: 0, z: 0 } }, coarseBaseline: null, fineBaseline: null })) } }, c);
    expect(result).toMatchObject({ operation: "comparison/subtract" });
    expect(values(c, "local/position")).toEqual([2]);
  });
});

describe("P2 recorder fault containment and isolation", () => {
  it.each([0, 1, 8, 40, 150])("recorder fault after %s events cannot alter result or provider calls", after => {
    const run = (fault: boolean) => {
      const calls: unknown[] = [], c = createCapture(); if (fault) injectCaptureFault(c, after);
      const q = ok(createDiagnosticProvider({ identity: "calls", version: "v1", heights: [0, .5, 1],
        evaluate: (i, p, t) => { calls.push([i, p, t]); return { T1: 1, omega: null, gradient: null }; } }));
      const result = partitionAcceptedStep(path(), 0, q, request, c);
      return { calls, result, capture: closeCapture(c) };
    };
    const expected = run(false), actual = run(true);
    expect(actual.calls).toEqual(expected.calls); expect(actual.result).toEqual(expected.result); expect(actual.capture.state).toBe("INCOMPLETE");
  });
  it("snapshot exception cannot enter the provider's scientific catch", () => {
    const c = createCapture(), q = provider([0, 1]); injectCaptureFault(c, 7);
    expect(q.ordinary(point(.5), 0, c).status).toBe("COMPLETE"); expect(closeCapture(c).state).toBe("INCOMPLETE");
  });
  it("escaped custom provider exception is the identical object, with no retry", () => {
    const error = new Error("outside adapter"), q = provider([0, 1]); let calls = 0;
    const custom: VerticalDiagnosticProvider = { ...q, explicit: () => { calls++; throw error; } };
    const c = createCapture(); injectCaptureFault(c, 10);
    let caught; try { partitionAcceptedStep(path(), 0, custom, request, c); } catch (e) { caught = e; }
    expect(caught).toBe(error); expect(calls).toBe(1);
  });
  it("detached frozen snapshots preserve holes, undefined, absent properties and negative zero", () => {
    const input = { values: [-0, undefined, , NaN], empty: {} }, c = createCapture();
    captureValue(c, "input", input); const snap = closeCapture(c);
    input.values[0] = 1; const restored = decodeRejectedInput(encodeRejectedInput(snap.events[0].value)) as typeof input;
    expect(Object.is(restored.values[0], -0)).toBe(true); expect(1 in restored.values).toBe(true); expect(2 in restored.values).toBe(false);
    expect(Object.isFrozen(snap.events[0].value)).toBe(true); expect(Object.keys(restored.empty)).toEqual([]);
  });
  it("accessors/functions are never invoked and nested contexts cannot cross-contaminate", () => {
    let calls = 0; const data = { get bad() { calls++; throw Error(); }, fn: () => calls++ };
    const a = createCapture(), b = createCapture(); captureValue(enterCapture(a, "child"), "data", data); captureValue(b, "other", 2);
    expect(calls).toBe(0); const snap = closeCapture(a); captureValue(a, "closed", 3);
    expect(closeCapture(a)).toEqual(snap); expect(closeCapture(b).events.map(e => e.site)).toEqual(["other"]);
  });
  it("five repeated captures and equivalent key insertion order have identical tagged bytes", () => {
    const run = (reverse: boolean) => {
      const c = createCapture(); captureValue(c, "keys", reverse ? { b: 2, a: 1 } : { a: 1, b: 2 });
      partitionAcceptedStep(path([2 ** 53, 2 ** 53 + 2]), 0, provider([0, .25, 1]), request, c);
      return canonicalRecord(encodeRejectedInput(closeCapture(c)));
    };
    const expected = run(false); for (let i = 0; i < 5; i++) expect(run(i % 2 === 0)).toBe(expected);
  });
});
