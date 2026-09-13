import { describe, expect, it, vi } from "vitest";
import { E1_SPEC, FROZEN_E1_STORM_ONLY, FROZEN_MANIFEST_SHA256 } from "./observedCMatrixE1Spec.js";
import { analysisAvailability, analyticGradient, assertion, digest, endpointMatrix, interpolate, invalidControl, manualAtmospheric, manualWorld, rawWorldOmega,
  orderedSum, preflightEquality, preflightState, referenceBasis, reportAndAssert, selectStage, serialize,
  stormSnapshotChecks, summarize, unavailable, type Run } from "./observedCMatrixE1.js";

// These tripwires are installed only for an ordinary infrastructure invocation.
// They never replace production APIs in a selected scientific invocation.
vi.mock("../app/exploreEnvironmentRepresentations.js", async importOriginal => {
  if (process.env.OBSERVED_C_MATRIX_STAGE === "E1") return importOriginal();
  throw new Error("Infrastructure must not build observed Analysis");
});
vi.mock("../app/goshenObservedEnvironment.js", async importOriginal => {
  if (process.env.OBSERVED_C_MATRIX_STAGE === "E1") return importOriginal();
  throw new Error("Infrastructure must not load observed Source data");
});
const selected = selectStage(process.env);

function toyRun(): Run {
  return { header: { stage: "INFRASTRUCTURE", expectedMembers: 1 }, state: "COMPLETE", preflight: [], faults: [], humanReview: "REQUIRED",
    cases: [{ id: "E1/toy/case", header: {}, values: {}, assertions: [], members: [
      { id: "E1/toy/member", header: {}, values: {}, assertions: [], members: [] },
    ] }] };
}

describe("E1 infrastructure (hand-authored inputs; no observed collector)", () => {
  it("selector accepts only absence or exact E1 and rejects present synthetic conflicts without mutation", () => {
    const absent = Object.freeze({});
    expect(selectStage(absent)).toBe("SKIPPED");
    expect(selectStage(Object.freeze({ OBSERVED_C_MATRIX_STAGE: "E1" }))).toBe("E1");
    for (const value of ["", "all", "e1", " E1", "E1 ", "H1", undefined]) {
      expect(() => selectStage({ OBSERVED_C_MATRIX_STAGE: value })).toThrow();
    }
    for (const value of ["H1", "", undefined]) expect(() => selectStage({ OBSERVED_C_MATRIX_STAGE: "E1", STORM_MOTION_VALIDATION_STAGE: value })).toThrow("Conflicting");
    expect(absent).toEqual({});
  });
  it("Spec is immutable test-owned literal data with a pinned transcription digest", () => {
    expect(Object.isFrozen(E1_SPEC)).toBe(true);
    expect(Object.isFrozen(E1_SPEC.cases[0].members[0].C)).toBe(true);
    expect(Object.isFrozen(FROZEN_E1_STORM_ONLY.updraft)).toBe(true);
    expect(digest({ spec: E1_SPEC, storm: FROZEN_E1_STORM_ONLY })).toBe(FROZEN_MANIFEST_SHA256);
  });
  it("independent synthetic endpoint reconstruction detects changed C and changed hash", () => {
    const inputs = endpointMatrix([1, 2], [5, 8], [2, 1], 0.5);
    expect(inputs.delta).toEqual([4, 6]);
    expect(inputs.Q).toBe(52);
    expect(inputs.members[3].C).toEqual([5, -1]);
    expect(inputs.members[3].deltaSRH).toBe(26);
    expect(preflightState([preflightEquality("hash", "a", "b")])).toBe("PREFLIGHT_BLOCKED");
    expect(preflightState([preflightEquality("C", inputs.members[3].C, [5, 1])])).toBe("PREFLIGHT_BLOCKED");
    expect(preflightState([preflightEquality("C", inputs.members[3].C, [5, -1])])).toBe("READY");
  });
  it("storm snapshot checks enumerate expected/actual fields and reject missing, changed, extra and nonfinite values", () => {
    const expected = { toy: { centerX: 0, sigma: 2 } };
    const matching = stormSnapshotChecks({ toy: { centerX: 0, sigma: 2 } }, expected);
    expect(preflightState(matching)).toBe("READY");
    expect(matching.find(c => c.path === "storm/toy/sigma")).toMatchObject({ expected: 2, actual: 2, units: "m", consumer: "toy" });
    for (const actual of [{ toy: { centerX: 1, sigma: 2 } }, { toy: { centerX: 0 } }, { toy: { centerX: 0, sigma: NaN } }, { toy: { centerX: 0, sigma: 2, newDependency: 3 } }]) {
      expect(preflightState(stormSnapshotChecks(actual, expected))).toBe("PREFLIGHT_BLOCKED");
    }
  });
  it("manual coordinate oracle catches the north/south sign and excludes storm-local C subtraction", () => {
    const world = manualWorld([7, 11], [2, 3]);
    expect(world).toEqual({ x: 5, y: 0, z: -8 });
    expect(manualAtmospheric(world)).toEqual([5, 8, 0]);
    expect(orderedSum([world, { x: 1, y: 9, z: 2 }])).toEqual({ x: 6, y: 9, z: -6 });
    expect(assertion("E1/toy/m/E1-B/sign", world, { x: 5, y: 0, z: 8 }, "CI").status).toBe("UNEXPLAINED");
  });
  it("raw segment and analytic-gradient helpers have hand-authored synthetic references", () => {
    expect(interpolate([0, 1, 2], [4, 9, 14], 1)).toEqual([3, 5]);
    expect(rawWorldOmega([0, 1, 2], [4, 9, 14])).toEqual([-3, -2]);
    const geometry = { centerX: 1, centerZ: 2, sigma: 2, baseHeight: 0, topHeight: 4, peakVerticalVelocity: 3 };
    const gradient = analyticGradient({ x: 3, y: 2, z: 2 }, geometry);
    expect(gradient[0]).toBeCloseTo(-1.5 * Math.exp(-0.5), 14);
    expect(gradient[1]).toBe(0);
    expect(analyticGradient({ x: 3, y: 4, z: 2 }, geometry)).toEqual([0, 0]);
  });
  it("member basis comparison detects a self-consistent but stale baseline basis", () => {
    const stale = referenceBasis([3, 4]), current = referenceBasis([-4, 3]);
    expect(assertion("E1/toy/m/E1-D/orientation", [current.s, current.c], [stale.s, stale.c], "EA", { id: "basis", value: 1e-12, units: "1" }).status).toBe("UNEXPLAINED");
    expect(referenceBasis([0, 0])).toMatchObject({ s: null, c: null, reciprocal: null, reason: "EXACT_ZERO_REFERENCE" });
    expect(referenceBasis([0.1, 0]).s).toEqual([1, 0]); // No 1 m/s cutoff.
  });
  it("Moore-style unavailable Analysis has an applicable availability check and numeric N/A", () => {
    const checks = analysisAvailability("E1/toy/m/E1-F/P1/Analysis", "COLUMN_UNAVAILABLE", "COLUMN_UNAVAILABLE");
    expect(checks[0]).toMatchObject({ applicability: "APPLICABLE", status: "PASS" });
    expect(checks[1]).toMatchObject({ applicability: "N_A", status: null, actual: null, reason: "COLUMN_UNAVAILABLE" });
    const mismatch = analysisAvailability("E1/toy/m/E1-F/P1/Analysis", "FULL_SUPPORT", "BOUNDARY_CONDITIONED");
    expect(mismatch.map(c => c.status)).toEqual(["UNEXPLAINED", "INVALID CONTROL", null]);
  });
  it("mixed-status summaries preserve applicability, scope and provisional classification", () => {
    const run = toyRun(), row = run.cases[0].members[0];
    row.assertions.push(assertion("E1/toy/m/E1-B/ok", 2, 2, "EA"), assertion("E1/toy/m/E1-C/mismatch", 2, 3, "FL"),
      invalidControl("E1/toy/m/E1-D/basis", "EXACT_ZERO_REFERENCE", null), unavailable("E1/toy/m/E1-C/baseline", "BASELINE_REFERENCE"));
    const summary = summarize(run);
    expect(summary.total).toEqual({ PASS: 1, UNEXPLAINED: 1, "INVALID CONTROL": 1, FAIL: 0, N_A: 1 });
    expect(summary.independentAssertions).toBe(2);
    expect(summary.humanReview).toBe("REQUIRED");
    expect(summary.scientificClosure).toBe("NOT_CLOSED");
  });
  it("deterministic serialization keeps array order and explicitly labels nonfinite faults", () => {
    expect(serialize({ b: 2, a: [3, 1] })).toBe(serialize({ a: [3, 1], b: 2 }));
    expect(JSON.parse(serialize({ value: NaN }))).toEqual({ value: { numericFault: "NaN" } });
    expect(assertion("E1/toy/m/E1-C/nonfinite", 0, NaN, "EA").status).toBe("UNEXPLAINED");
    expect(assertion("E1/toy/m/E1-C/missing", [0, 1], [0], "EA").status).toBe("UNEXPLAINED");
  });
  it("emits blocked/partial/mixed evidence before runner failure and never manufactures FAIL", () => {
    const run = toyRun();
    run.cases[0].members[0].assertions.push(assertion("E1/toy/m/E1-C/error", 0, 1, "EA"));
    const emitted: string[] = [];
    expect(() => reportAndAssert(run, s => emitted.push(s))).toThrow("runner gate");
    expect(emitted).toHaveLength(1);
    expect(JSON.parse(emitted[0]).summary.total.UNEXPLAINED).toBe(1);
    for (const state of ["PREFLIGHT_BLOCKED", "PARTIAL"] as const) {
      run.state = state;
      expect(() => reportAndAssert(run, s => emitted.push(s))).toThrow();
      expect(JSON.parse(emitted.at(-1)!).state).toBe(state);
    }
  });
});

it.skipIf(selected !== "E1")("E1 separately authorized observed scientific collection", async () => {
  // A selector is not authorization. Execution additionally needs the later reviewed code SHA.
  const { collectObservedE1 } = await import("./observedCMatrixE1.js");
  const run = await collectObservedE1({ env: process.env, reviewedImplementationSha: process.env.OBSERVED_C_MATRIX_REVIEWED_SHA });
  reportAndAssert(run, text => console.log(text));
});
