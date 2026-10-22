import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import * as ts from "typescript";

// Even a gate regression cannot instantiate production Simulation in this test file.
vi.mock("../../src/app/createExploreLab.js", () => { throw new Error("FORBIDDEN production factory import"); });
vi.mock("../../src/ui/tracer/advanceLaboratoryFixedStep.js", () => { throw new Error("FORBIDDEN fixed-step import"); });
vi.mock("../../src/scenario/DEMO_SCENARIO.js", () => { throw new Error("FORBIDDEN Demo import"); });
vi.mock("../../src/simulation/Simulation.js", () => { throw new Error("FORBIDDEN Simulation import"); });
import { CollectorRefusal, OPT_IN, runCollector, validateOutputTarget, sourceImports,
  captureSources, emptyCase, checkRecorded, type CaseResult } from "./collector.js";

const root = fileURLToPath(new URL("../../", import.meta.url));
beforeAll(() => {
  if (process.env[OPT_IN] !== undefined) throw new Error("Infrastructure checks require absent opt-in");
});
afterEach(() => vi.unstubAllEnvs());

// Authored validator fixture only: no integrator, Simulation, candidate execution or output.
function authoredRecord(): CaseResult {
  const result = emptyCase(["A"]);
  result.status = "complete";
  result.stepsCompleted = result.lastStartedStep = result.lastCompletedStep = result.lastSnapshotStep = 1200;
  const seed = { x: 0, y: 1000, z: 4000 };
  result.mapping = [{ role: "A", lane: 0, tracerId: 7, seed }];
  let clock = 0;
  for (let step = 0; step <= 1200; step++) {
    if (step) clock += 0.1;
    result.states.push({ step, nominalTime: step * 0.1, clockTime: clock,
      markers: [{ role: "A", tracerId: 7, position: { ...seed }, age: clock, active: true }] });
  }
  result.history = [{ lane: 0, samples: result.states.map(s => ({ position: { ...seed }, simulationTime: s.clockTime })),
    appendedAtSteps: result.states.map(s => s.step) }];
  result.checkpoints = [0, 300, 600, 900, 1200].map(step => ({ step, stateIndex: step }));
  return result;
}

describe("non-executing collector infrastructure", () => {
  test("static module scanner covers dynamic/type/re-export imports and rejects computed dependencies", () => {
    expect(sourceImports(ts, 'import type { X } from "./a.js"; export * from "./b.js";'
      + 'type T = import("./c.js").T; const x = import("./d.js"); const y = require("./e.js");'))
      .toEqual(["./a.js", "./b.js", "./c.js", "./d.js", "./e.js"]);
    expect(() => sourceImports(ts, 'import("./" + name)')).toThrow("Non-literal");
  });
  test("read-only source closure captures dynamically reached production dependencies without importing them", async () => {
    const capture = await captureSources(root);
    const paths = capture.files.map(f => f.path);
    for (const path of ["src/app/createExploreLab.ts", "src/app/composeDemoTracerSimulation.ts",
      "src/simulation/Simulation.ts", "src/simulation/TracerPathHistory.ts",
      "src/ui/tracer/advanceLaboratoryFixedStep.ts", "src/core/integrators/EulerIntegrator.ts"])
      expect(paths).toContain(path);
  });
  test("authored complete record passes structural integrity only", () => {
    expect(() => checkRecorded(authoredRecord())).not.toThrow();
  });
  test("terminal sample must match the single transition; inactive lanes cannot reactivate", () => {
    const record = authoredRecord();
    const position = { x: 1, y: 0, z: 2 };
    for (const step of [1199, 1200]) Object.assign(record.states[step]!.markers[0]!,
      { active: false, position: { ...position }, age: record.states[1199]!.clockTime });
    const time = record.states[1199]!.clockTime;
    const samples = record.history[0]!.samples.slice(0, 1200);
    samples[1199] = { position: { ...position }, simulationTime: time };
    record.history[0]!.samples = samples;
    record.history[0]!.appendedAtSteps = record.history[0]!.appendedAtSteps.slice(0, 1200);
    record.terminations = [{ role: "A", step: 1199, timeBounds: [record.states[1198]!.clockTime, time],
      detectionTime: time, position: { ...position }, sample: structuredClone(samples[1199]!) }];
    expect(() => checkRecorded(record)).not.toThrow();
    const wrongSample = structuredClone(record);
    wrongSample.terminations[0]!.sample.simulationTime = 0;
    expect(() => checkRecorded(wrongSample)).toThrow("terminal");
    record.states[1200]!.markers[0]!.active = true;
    expect(() => checkRecorded(record)).toThrow("reactivated");
  });
  test.each([
    ["sequence", (r: CaseResult) => { r.states[300]!.step = 299; }],
    ["mapping", (r: CaseResult) => { r.mapping[0]!.tracerId++; }],
    ["lane", (r: CaseResult) => { r.history[0]!.lane = 1; }],
    ["checkpoint", (r: CaseResult) => { r.checkpoints[1]!.stateIndex = 299; }],
    ["association", (r: CaseResult) => { r.history[0]!.appendedAtSteps[300] = 299; }],
    ["unknown association", (r: CaseResult) => { r.history[0]!.appendedAtSteps[300] = null; }],
    ["missing termination", (r: CaseResult) => { r.states[1200]!.markers[0]!.active = false; }],
    ["duplicate termination", (r: CaseResult) => { r.terminations.push({ role: "A", step: 1200,
      detectionTime: 120, timeBounds: [119.9, 120], position: { x: 0, y: 0, z: 0 },
      sample: { position: { x: 0, y: 0, z: 0 }, simulationTime: 120 } }); }],
    ["partial helper", (r: CaseResult) => { r.lastCompletedStep = 1199; r.unrecordedMutationPossible = true; }],
    ["missing snapshot", (r: CaseResult) => { r.lastSnapshotStep = 1199; }],
  ] as const)("rejects corrupted %s without executing a lab", (_, corrupt) => {
    const record = authoredRecord(); corrupt(record);
    expect(() => checkRecorded(record)).toThrow();
  });
  test("refuses missing gate before output validation or production imports", async () => {
    await expect(runCollector({ outputDirectory: root })).rejects.toThrow(CollectorRefusal);
    await expect(runCollector()).rejects.toThrow("must explicitly equal collect");
  });
  test("rejects an unknown value; this test never enables collect", async () => {
    vi.stubEnv(OPT_IN, "invalid");
    await expect(runCollector()).rejects.toThrow(CollectorRefusal);
  });
  test("read-only preflight rejects missing, relative and existing output", () => {
    expect(() => validateOutputTarget(root, undefined)).toThrow("explicit absolute");
    expect(() => validateOutputTarget(root, "relative-output")).toThrow("explicit absolute");
    expect(() => validateOutputTarget(root, root)).toThrow("already exists");
  });
  test("ordinary test discovery stays confined to src, not these opt-in entries", () => {
    const config = readFileSync(new URL("../../vitest.config.ts", import.meta.url), "utf8");
    expect(config).toContain('include: ["src/**/*.test.ts", "src/**/*.test.tsx"]');
    expect(config).not.toContain("tools/");
  });
  test("all reviewed source guards match current bytes without loading production modules", () => {
    const source = readFileSync(new URL("./collector.ts", import.meta.url), "utf8");
    const guards = [...source.matchAll(/"(src\/[^"\n]+)": "([a-f0-9]{64})"/g)];
    expect(guards).toHaveLength(8);
    for (const [, path, expected] of guards) {
      const bytes = readFileSync(new URL(`../../${path}`, import.meta.url));
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(expected);
    }
  });
});
