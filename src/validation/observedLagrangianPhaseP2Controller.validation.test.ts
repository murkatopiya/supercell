import { beforeAll, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { P2_SPEC as S } from "./observedLagrangianPhaseP2Spec.js";
import { prepareRun, planGroup, evaluateGroup, assessGroup, comparisonRequirements, selectCandidate,
  type Result, type RunInput, type RunEvidence, type GroupPlan, type EvidenceEntry, type GroupAssessment } from "./observedLagrangianPhaseP2Controller.js";
import { createDiagnosticProvider } from "./lagrangianEstimator/providers.js";
import { compareEvents } from "./lagrangianEstimator/comparison.js";
import type { ProviderTopology, ComparisonCheck, ComparisonResult, VerticalDiagnosticProvider } from "./lagrangianEstimator/types.js";

function ok<T>(r: Result<T>): T {
  if (r.status !== "COMPLETE") throw new Error(JSON.stringify(r)); return r.value;
}
function syntheticProvider(heights = [0, 2000, 3000, 4000], knotSupport?: ("FULL_SUPPORT" | "BOUNDARY_CONDITIONED")[]): VerticalDiagnosticProvider {
  const p = createDiagnosticProvider({ identity: "artificial-controller-field", version: "v1", heights, knotSupport,
    evaluate: () => ({ T1: 1, omega: [1, 0], gradient: [1, 0] }) });
  if (p.status !== "COMPLETE") throw new Error("fixture"); return p.value;
}
const provider = syntheticProvider();
const unavailable: VerticalDiagnosticProvider = Object.freeze({ fingerprint: "artificial-unavailable/v1", topology: null,
  ordinary: () => ({ status: "N_A" as const, reason: "COLUMN_UNAVAILABLE" as const, value: null }),
  explicit: () => ({ status: "N_A" as const, reason: "COLUMN_UNAVAILABLE" as const, value: null }) });

// Hand-authored accepted coordinates and velocities. No ODE/Simulation or observed profile is loaded.
function input(memberIndex = 0, resolutionIndex = 0, options: {
  caseIndex?: number; seedIndex?: number; end?: number; full?: boolean; oscillate?: boolean;
  analysis?: ProviderTopology; source?: ProviderTopology;
} = {}): RunInput {
  const c = S.cases[options.caseIndex ?? 0], member = c.members[memberIndex], seed = S.seeds[options.seedIndex ?? 0];
  const r = S.resolutions[resolutionIndex], end = options.full ? 540 : options.end ?? 1;
  const v = { x: -(member.C[0] - 10), y: 0, z: member.C[1] };
  const count = end / r.h;
  return { caseId: c.id, memberId: member.id, seedId: seed.id, resolutionId: r.id, C: member.C,
    topologies: { Source: options.source ?? provider.topology!, Analysis: c.analysisAvailable ? options.analysis ?? provider.topology : null },
    samples: Array.from({ length: count + 1 }, (_, i) => ({ index: i, tick: i * r.ticks, time: i * r.h,
      position: { x: seed.x + i * r.h * v.x, y: !options.full && i === count ? 5000 :
        options.oscillate && i > 0 ? seed.y + (i % 2 ? 1 : -1) : seed.y, z: seed.z + i * r.h * v.z } })),
    steps: Array.from({ length: count }, (_, i) => ({ fromIndex: i, clipped: false })),
    initialVelocity: v, termination: options.full ? "MAX_TIME" : "SOURCE_EXIT" };
}
function group(options: Parameters<typeof input>[2] = {}): RunEvidence[] {
  return S.memberIds.flatMap((_, m) => S.resolutions.map((_, r) => ok(prepareRun(input(m, r, options)))));
}
const candidate = S.candidates[0];

/** Artificial prepared comparison records exercise protocol completeness/admission, not estimator certification.
 * The separate end-to-end test below uses real Slice 1–5 outputs with complete traces.
 */
function preparedEntries(plan: GroupPlan, runs: readonly RunEvidence[]): EvidenceEntry[] {
  return comparisonRequirements(plan).map(req => {
    const c = req.context;
    const na = (reason: "COLUMN_UNAVAILABLE" | "BASELINE_SELF_RESPONSE" | "NO_SEGMENT_MATCHED_SAMPLES"): EvidenceEntry =>
      ({ key: req.key, result: { status: "N_A", reason, value: null, evidence: { context: c, input: "artificial-prepared-fixture" } } });
    if (req.unavailable) return na("COLUMN_UNAVAILABLE");
    if (req.ineligible) return { key: req.key, result: { status: "INELIGIBLE", reason: "INELIGIBLE_INTERVAL", value: null } };
    if (req.family === "response" && req.memberId === "C0") return na("BASELINE_SELF_RESPONSE");
    if (req.family === "events") {
      const get = (id: string) => runs.find(r => r.id === id)!;
      const prefix = (h: number) => Math.min(plan.candidate.T, ...runs.filter(r => r.h === h).map(r => r.primaryPrefix ?? -1));
      return { key: req.key, result: compareEvents(c, { status: "COMPLETE", value: {
        coarseEvents: get(c.coarse.id).events, fineEvents: get(c.fine.id).events,
        coarsePrefixTime: prefix(c.coarse.h), finePrefixTime: prefix(c.fine.h) } }) };
    }
    // Oscillating fixtures have crossing exclusions covering all stored samples.
    if (req.family === "pointwise" && runs[0].input.samples[1].position.y !== runs[0].input.samples[0].position.y)
      return na("NO_SEGMENT_MATCHED_SAMPLES");
    const fp = runs[0].input.topologies[req.channel]!.fingerprint;
    const metrics = req.family === "pointwise" ? Array.from({ length: c.interval.b / c.coarse.h + 1 }, () => "POINTWISE" as const) : req.metrics;
    const checks: ComparisonCheck[] = metrics.map((metric, i) => {
      const numeric = ["HISTORY", "POINTWISE", "EXPOSURE_ABS", "EXPOSURE_SIGNED"].includes(metric);
      const tolerance = metric === "HISTORY" ? 1e-6 + .01 : metric === "POINTWISE" ? 5e-6 + .02 :
        metric.startsWith("EXPOSURE") ? 0.01 : ["POSITION", "RESPONSE"].includes(metric) ? 10 : 3;
      return { key: metric === "POINTWISE" ? `POINTWISE/${i}` : metric, metric, residual: 0, tolerance,
        units: metric.startsWith("EXPOSURE") ? "s^-1" : numeric ? "s^-2" : "m", scale: numeric ? 1 : null,
        absoluteTerm: null, relativeTerm: null, arithmetic: [], outcome: "PASS", reason: "WITHIN_TOLERANCE",
        details: { time: i * c.coarse.h, coarseProviderFingerprint: fp, fineProviderFingerprint: fp, R1: 0, Aref: 1,
          coarse: metric === "POINTWISE" ? { T1: 1 } : 1, fine: metric === "POINTWISE" ? { T1: 1 } : 1 } };
    });
    return { key: req.key, result: { status: "COMPLETE", value: { schema: "p2-comparison/v1", context: c, checks, outcome: "PASS",
      details: { fixture: "artificial-prepared-fixture", input: { baselineIds: req.baselineIds },
        coarse: { pathFingerprint: c.coarse.pathFingerprint, providerFingerprint: fp },
        fine: { pathFingerprint: c.fine.pathFingerprint, providerFingerprint: fp } } } } };
  });
}
function changeResult(entries: EvidenceEntry[], keyPart: string, change: (r: ComparisonResult) => ComparisonResult): EvidenceEntry[] {
  const index = entries.findIndex(e => e.key.includes(keyPart));
  const copy = entries.slice(), original = copy[index];
  if (!original || original.result.status === "INELIGIBLE") throw new Error("fixture");
  copy[index] = { key: original.key, result: change(structuredClone(original.result)) }; return copy;
}

describe("P2 Slice 6 authority and dependency boundary", () => {
  it("binds the frozen exact-byte authority and leaves numerical files unchanged by this layer", () => {
    const spec = readFileSync("docs/research/2026-09-13-observed-lagrangian-phase-p2-qualification-specification.md");
    expect(createHash("sha256").update(spec).digest("hex")).toBe(S.documentSha256);
    expect(S.id).toBe("observed-lagrangian-phase-p2-qualification/v1");
    expect(S.executionAuthority).toBe("NOT_AUTHORIZED");
    for (const file of ["observedLagrangianPhaseP2Controller.ts", "observedLagrangianPhaseP2Spec.ts"]) {
      const text = readFileSync(`src/validation/${file}`, "utf8");
      expect(text).not.toMatch(/from ["'].*(?:observedLagrangianPhaseP\.|node:fs|Simulation|fixtures\/)/);
      expect(text).not.toMatch(/process\.env|import\s*\(|writeFile|new Simulation/);
    }
  });
  it("keeps the literal matrix, candidates, ensemble and storm operand order explicit", () => {
    expect(S.candidates.map(c => [c.T, c.h])).toEqual([[540, .5], [540, .25], [360, .5], [360, .25], [180, .5], [180, .25]]);
    expect(S.cases.length * S.memberIds.length * S.seeds.length * S.resolutions.length).toBe(640);
    expect(S.inherited.operands).toEqual(["environment", "updraft", "rotation", "lowerInflow", "upperOutflow", "downdraft", "nearGroundOutflow"]);
  });
});

describe("P2 Slice 6 stored evidence and irreversible eligibility", () => {
  it("excludes Source exit steps, preserves original inputs, and rejects reentry", () => {
    const data = input(), before = structuredClone(data), r = ok(prepareRun(data));
    expect(r.primaryPrefix).toBe(.5); expect(r.sourcePrefix).toBe(.5);
    expect(r.primaryAtSample).toEqual([true, true, false]); expect(r.events.map(e => e.kind)).toContain("source-exit");
    expect(data).toEqual(before); expect(Object.isFrozen(r.input.samples)).toBe(true);
    const extra = { ...data, samples: [...data.samples, { ...data.samples[0], index: 3, tick: 24, time: 1.5 }],
      steps: [...data.steps, { fromIndex: 2, clipped: false }] };
    expect(prepareRun(extra)).toMatchObject({ reason: "STEP_AFTER_SOURCE_EXIT_OR_GROUND" });
  });
  it("does not recover an interior ineligible Analysis interval with supported endpoints", () => {
    const analysis = syntheticProvider([0, 2050, 2100, 2200, 2300, 4000],
      ["FULL_SUPPORT", "FULL_SUPPORT", "BOUNDARY_CONDITIONED", "FULL_SUPPORT", "FULL_SUPPORT", "FULL_SUPPORT"]);
    const data = input(0, 0, { end: 2, analysis: analysis.topology! });
    const samples = data.samples.map((s, i) => ({ ...s, position: { ...s.position, y: [2000, 2400, 2000, 2000, 5000][i] } }));
    const r = ok(prepareRun({ ...data, samples }));
    expect(r.primaryPrefix).toBe(0); expect(r.sourcePrefix).toBe(1.5);
    expect(r.primaryAtSample).toEqual([true, false, false, false, false]);
    expect(r.events.filter(e => e.kind === "analysis-loss")).toHaveLength(1);
  });
  it("rejects an isolated owned-knot contact and does not use a supported adjacent limit", () => {
    const analysis = syntheticProvider([0, 2100, 2200, 4000], ["FULL_SUPPORT", "FULL_SUPPORT", "BOUNDARY_CONDITIONED", "FULL_SUPPORT"]);
    const data = input(0, 0, { end: 2, analysis: analysis.topology! });
    const samples = data.samples.map((s, i) => ({ ...s, position: { ...s.position, y: [2000, 2100, 2000, 2000, 5000][i] } }));
    expect(ok(prepareRun({ ...data, samples })).primaryAtSample).toEqual([true, false, false, false, false]);
    const near = samples.map((s, i) => i === 1 ? { ...s, position: { ...s.position, y: 2099.9999999999995 } } : s);
    expect(ok(prepareRun({ ...data, samples: near })).primaryPrefix).toBe(1.5);
  });
  it("retains ground co-events and excludes the clipped terminal endpoint", () => {
    const t = syntheticProvider([1, 2000, 3000, 4000]).topology!;
    const data = input(0, 0, { source: t, analysis: t });
    const r = ok(prepareRun({ ...data, termination: "GROUND", samples: data.samples.map((s, i) => i === 2 ?
      { ...s, position: { ...s.position, y: 0 } } : s), steps: data.steps.map((s, i) => ({ ...s, clipped: i === 1 })) }));
    expect(r.primaryPrefix).toBe(.5);
    expect(r.events.filter(e => e.b === 1).map(e => e.kind)).toEqual(["source-exit", "analysis-loss", "ground"]);
  });
  it("keeps historical direction-specific brackets independent of diagnostic event times", () => {
    const data = input(0, 0, { end: 2 });
    const samples = data.samples.map((s, i) => ({ ...s, position: { ...s.position, y: [2000, 3000, 2000, 3000, 5000][i] } }));
    const r = ok(prepareRun({ ...data, samples }));
    expect(r.crossings.filter(b => b.representation === "Source").map(b => [b.a, b.b])).toEqual([[0, .5], [.5, 1], [1, 1.5]]);
  });
  it("retains initial invalidity and nonpositive applicability as null, never zero estimates", () => {
    const source = syntheticProvider([2100, 4000]);
    const runs = S.memberIds.flatMap((_, m) => S.resolutions.map((_, r) => {
      const data = input(m, r, { source: source.topology! });
      return ok(prepareRun({ ...data, samples: data.samples.slice(0, 1), steps: [], initialVelocity: null, termination: "INITIAL_INVALID" }));
    }));
    expect(runs.every(r => r.primaryPrefix === null && r.path === null)).toBe(true);
    const p = ok(planGroup(runs, candidate)); expect(p.interval).toBeNull();
    expect(p.oracles.every(o => o.status === "INELIGIBLE" && o.residual === null)).toBe(true);
    const a = ok(evaluateGroup(p, { Source: source, Analysis: provider }));
    expect(a.admission).toBe("REJECTED");
    expect(a.entries.filter(e => !e.key.endsWith("/events")).every(e => e.result.status === "INELIGIBLE")).toBe(true);
  });
  it("rejects sparse step metadata and a clipped endpoint above ground", () => {
    const data = input(), steps = Array.from(data.steps); delete steps[0];
    expect(prepareRun({ ...data, steps })).toMatchObject({ reason: "MISSING_SAMPLE_OR_STEP" });
    expect(prepareRun({ ...data, steps: data.steps.map(s => ({ ...s, clipped: true })) }))
      .toMatchObject({ reason: "CLIPPED_ENDPOINT_NOT_GROUND" });
  });
  it.each(["clock", "missing", "duplicate", "foreign", "tail", "C", "nonfinite", "topology"])("rejects malformed %s input", defect => {
    const data = structuredClone(input());
    let bad: RunInput = data;
    if (defect === "clock") bad = { ...data, samples: data.samples.map((s, i) => i === 1 ? { ...s, tick: 7 } : s) };
    if (defect === "missing") bad = { ...data, steps: [] };
    if (defect === "duplicate") bad = { ...data, samples: [data.samples[0], data.samples[0], data.samples[2]] };
    if (defect === "foreign") bad = { ...data, memberId: "extra-member" };
    if (defect === "tail") bad = { ...data, samples: data.samples.slice(0, 2), steps: data.steps.slice(0, 1), termination: "MAX_TIME" };
    if (defect === "C") bad = { ...data, C: [11, 0] };
    if (defect === "nonfinite") bad = { ...data, initialVelocity: { x: Infinity, y: 0, z: 0 } };
    if (defect === "topology") bad = { ...data, topologies: { ...data.topologies, Source: { ...provider.topology!, heights: [0, 0, 4000] } } };
    expect(prepareRun(bad).status).toBe("QUALIFICATION_INCOMPLETE");
  });
});

describe("P2 Slice 6 interval and oracle protocol", () => {
  it("uses all five members, aligns downward, and separates lifecycle T from both-pair numerical end", () => {
    const runs = group(), plan = ok(planGroup(runs, candidate));
    expect(plan.interval).toEqual({ a: 0, b: .5 });
    expect(plan.oracles).toHaveLength(16); expect(plan.oracles.every(o => o.status === "PASS")).toBe(true);
    for (const r of comparisonRequirements(plan)) expect(r.context.interval.b).toBe(r.family === "events" ? 540 : .5);
    const changed = runs.map(r => r.memberId === "right_minus" && r.h === .125 ?
      ok(prepareRun(input(4, 2, { end: .5 }))) : r);
    expect(ok(planGroup(changed, candidate)).interval).toBeNull(); // min .375 aligned down to .5 grid
    expect(ok(planGroup(runs, S.candidates[1])).interval).toEqual({ a: 0, b: .75 });
  });
  it("requires full duration at the fourth resolution outside the candidate triple", () => {
    const runs = group({ full: true });
    const lost = runs.map(r => r.memberId === "C0" && r.h === .0625 ? ok(prepareRun(input(0, 3))) : r);
    const p = ok(planGroup(lost, { T: 180, h: .5 }));
    expect(p.interval).toEqual({ a: 0, b: 180 }); expect(p.viable).toBe(false);
    expect(p.runs.filter(r => r.support !== "FULL_DURATION").map(r => r.id)).toEqual([lost.find(r => r.h === .0625)!.id]);
  }, 20000);
  it("blocks missing/duplicate/mixed/unvalidated runs and altered candidates", () => {
    const runs = group();
    expect(planGroup(runs.slice(1), candidate).status).toBe("QUALIFICATION_INCOMPLETE");
    expect(planGroup([...runs.slice(1), runs[1]], candidate).status).toBe("QUALIFICATION_INCOMPLETE");
    expect(planGroup(runs.map((r, i) => i ? r : ok(prepareRun(input(0, 0, { caseIndex: 1 })))), candidate).status).toBe("QUALIFICATION_INCOMPLETE");
    expect(planGroup(structuredClone(runs), candidate).status).toBe("QUALIFICATION_INCOMPLETE");
    expect(planGroup(runs, { T: 600, h: .03125 }).status).toBe("QUALIFICATION_INCOMPLETE");
  });
  it("keeps oracle discrepancy UNEXPLAINED and immediate clipping ineligible", () => {
    const runs = group(), data = input(1, 0);
    const bad = ok(prepareRun({ ...data, samples: data.samples.map((s, i) => i === 1 ? { ...s, position: { ...s.position, x: s.position.x + .1 } } : s) }));
    const changed = runs.map(r => r.id === bad.id ? bad : r), plan = ok(planGroup(changed, candidate));
    expect(plan.oracles.some(o => o.status === "UNEXPLAINED")).toBe(true);
    const a = ok(assessGroup(plan, preparedEntries(plan, changed)));
    expect(a).toMatchObject({ state: "QUALIFICATION_INCOMPLETE", admission: "UNASSESSED", control: "UNEXPLAINED" });
    const clipped = ok(prepareRun({ ...data, samples: data.samples.slice(0, 2).map((s, i) => i === 1 ?
      { ...s, position: { ...s.position, y: 0 } } : s), steps: [{ fromIndex: 0, clipped: true }], termination: "GROUND" }));
    const p = ok(planGroup(runs.map(r => r.id === clipped.id ? clipped : r), candidate));
    expect(p.oracles.find(o => o.runId === clipped.id)?.status).toBe("INELIGIBLE"); expect(p.interval).toBeNull();
  });
});

describe("P2 Slice 6 completeness and actual estimator wiring", () => {
  it("runs real Slice 1–5 on artificial accepted paths and retains history/exposure traces deterministically", () => {
    const plan = ok(planGroup(group(), candidate)), providers = { Source: provider, Analysis: provider };
    const a = ok(evaluateGroup(plan, providers)), b = ok(evaluateGroup(plan, providers));
    expect(a).toEqual(b); expect(a.admission).toBe("REJECTED"); // short supplied paths, never a qualified campaign
    expect(a.state).toBe("QUALIFICATION_COMPLETE"); expect(a.entries).toHaveLength(90);
    const history = a.entries.find(e => e.key === "C0/0/Analysis/history")!.result;
    expect(history.status).toBe("COMPLETE");
    if (history.status === "COMPLETE") {
      expect(history.value.checks[0].residual).toBe(0);
      expect((history.value.details.input as { trace: { contributions: unknown[] } }).trace.contributions.length).toBeGreaterThan(0);
    }
    const exposure = a.entries.find(e => e.key === "C0/0/Source/exposure")!.result;
    if (exposure.status !== "COMPLETE") throw new Error("fixture");
    expect(exposure.value.context.role).toBe("SECONDARY_DESCRIPTIVE");
    expect((exposure.value.details.coarse as { trace: { contributions: unknown[] } }).trace.contributions.length).toBeGreaterThan(0);
    expect(a.refinements).toHaveLength(29);
  });
  it("keeps Moore Analysis typed unavailable without Source substitution", () => {
    const runs = group({ caseIndex: 3 }), p = ok(planGroup(runs, candidate));
    const result = ok(evaluateGroup(p, { Source: provider, Analysis: unavailable }));
    const analysis = result.entries.filter(e => e.key.includes("/Analysis/"));
    expect(analysis).toHaveLength(30); expect(analysis.every(e => e.result.status === "N_A")).toBe(true);
    expect(result.refinements).toHaveLength(19);
    expect(evaluateGroup(p, { Source: provider, Analysis: provider })).toMatchObject({ reason: "PROVIDER_BINDING_MISMATCH" });
  });
  it.each(["missing", "duplicate", "foreign", "context", "metric", "N_A", "baseline", "budget", "pointwise"])("rejects %s comparison evidence", defect => {
    const runs = group(), plan = ok(planGroup(runs, candidate)); let entries = preparedEntries(plan, runs);
    if (defect === "missing") entries = entries.slice(1);
    if (defect === "duplicate") entries = [...entries.slice(1), entries[1]];
    if (defect === "foreign") entries = entries.map((e, i) => i ? e : { ...e, key: "foreign" });
    if (defect === "context") entries = changeResult(entries, "/Analysis/history", r => r.status === "COMPLETE" ?
      { ...r, value: { ...r.value, context: { ...r.value.context, interval: { a: 0, b: .25 } } } } : r);
    if (defect === "metric") entries = changeResult(entries, "/Source/exposure", r => r.status === "COMPLETE" ?
      { ...r, value: { ...r.value, checks: r.value.checks.slice(0, 1) } } : r);
    if (defect === "N_A") entries = changeResult(entries, "/Analysis/history", r => ({ status: "N_A", reason: "COLUMN_UNAVAILABLE", value: null,
      evidence: { context: r.status === "COMPLETE" ? r.value.context : r.evidence.context, input: null } }));
    if (defect === "baseline") entries = changeResult(entries, "parallel_plus/0/Analysis/response", r => r.status === "COMPLETE" ?
      { ...r, value: { ...r.value, details: {} } } : r);
    if (defect === "budget") entries = changeResult(entries, "/Analysis/history", r => r.status === "COMPLETE" ?
      { ...r, value: { ...r.value, checks: r.value.checks.map(c => ({ ...c, tolerance: 1 })) } } : r);
    if (defect === "pointwise") entries = changeResult(entries, "/Analysis/pointwise", r => ({ status: "N_A", reason: "NO_SEGMENT_MATCHED_SAMPLES", value: null,
      evidence: { context: r.status === "COMPLETE" ? r.value.context : r.evidence.context, input: null } }));
    const reasons: Record<string, string> = { missing: "MISSING_DUPLICATE_OR_FOREIGN_REQUIREMENT", duplicate: "MISSING_DUPLICATE_OR_FOREIGN_REQUIREMENT",
      foreign: "MISSING_DUPLICATE_OR_FOREIGN_REQUIREMENT", context: "RESULT_CONTEXT_MISMATCH", metric: "MISSING_REQUIRED_METRIC",
      N_A: "UNEXPECTED_N_A", baseline: "BASELINE_BINDING_MISMATCH", budget: "SCIENTIFIC_BUDGET_MISMATCH", pointwise: "MISSING_REQUIRED_POINTWISE_CHECKS" };
    expect(assessGroup(plan, entries)).toMatchObject({ status: "QUALIFICATION_INCOMPLETE", reason: reasons[defect] });
  });
  it("preserves nonfinite estimator failure as incomplete instead of budget exhaustion", () => {
    const broken = { ...provider, explicit: () => ({ status: "FAILED" as const, code: "NONFINITE_ARITHMETIC" as const, operation: "artificial/overflow" }) };
    const result = ok(evaluateGroup(ok(planGroup(group(), candidate)), { Source: broken, Analysis: provider }));
    expect(result).toMatchObject({ state: "QUALIFICATION_INCOMPLETE", admission: "UNASSESSED", control: null });
    expect(result.entries.some(e => e.result.status === "FAILED")).toBe(true);
  });
  it("derives non-worsening using the finer history budget while both ordinary pairs pass", () => {
    const runs = group(), plan = ok(planGroup(runs, candidate));
    const entries = changeResult(preparedEntries(plan, runs), "C0/1/Analysis/history", r => r.status === "COMPLETE" ?
      { ...r, value: { ...r.value, checks: r.value.checks.map(c => ({ ...c, residual: .002, details: { ...c.details, R1: .002 } })) } } : r);
    const a = ok(assessGroup(plan, entries));
    const refinement = a.refinements.find(r => r.key === "C0/0/Analysis/history")!.result;
    if (refinement.status !== "COMPLETE") throw new Error("fixture");
    expect(refinement.value.ordinaryOutcome).toBe("PASS"); expect(refinement.value.outcome).toBe("INVALID CONTROL");
    expect(refinement.value.nonWorsening[0].allowance).toBe(.1 * (1e-6 + .01));
    expect(a.refinements.every(r => !/pointwise|events/.test(r.key))).toBe(true);
  });
  it("rejects false signed exposure scale and omitted lifecycle co-events", () => {
    const runs = group(), plan = ok(planGroup(runs, candidate)), entries = preparedEntries(plan, runs);
    const wrongScale = changeResult(entries, "/Source/exposure", r => r.status === "COMPLETE" ?
      { ...r, value: { ...r.value, checks: r.value.checks.map(c => c.metric === "EXPOSURE_SIGNED" ?
        { ...c, details: { ...c.details, coarse: .1, fine: .1 } } : c) } } : r);
    expect(assessGroup(plan, wrongScale)).toMatchObject({ reason: "COMPARISON_SCALE_OR_RESIDUAL_MISMATCH" });
    const missingEvent = changeResult(entries, "/events", r => r.status === "COMPLETE" ?
      { ...r, value: { ...r.value, checks: r.value.checks.filter(c => c.metric !== "EVENT_TYPES") } } : r);
    expect(assessGroup(plan, missingEvent)).toMatchObject({ reason: "LIFECYCLE_EVIDENCE_MISMATCH" });
  });
  it("accepts equivalent object key order and rejects an ordinary operand assigned to the wrong segment", () => {
    const runs = group(), p = ok(planGroup(runs, candidate));
    const entries = preparedEntries(p, runs);
    const sorted = JSON.parse(JSON.stringify(entries, (_, value) => value && typeof value === "object" && !Array.isArray(value) ?
      Object.fromEntries(Object.keys(value).sort().map(k => [k, value[k]])) : value)) as EvidenceEntry[];
    expect(ok(assessGroup(p, sorted)).state).toBe("QUALIFICATION_COMPLETE");
    const wrong = { ...provider, ordinary: (position: Parameters<VerticalDiagnosticProvider["ordinary"]>[0], time: number) => {
      const value = provider.ordinary(position, time);
      return value.status === "COMPLETE" ? { ...value, value: { ...value.value,
        context: { ...value.value.context, segment: { ...value.value.context.segment, index: 0 } } } } : value;
    } };
    expect(evaluateGroup(p, { Source: wrong, Analysis: provider })).toMatchObject({ reason: "ORDINARY_OPERAND_BINDING" });
  });
});

describe("P2 Slice 6 complete global candidate admission", () => {
  const all: GroupAssessment[] = [], rejectAll: GroupAssessment[] = [], unresolved: GroupAssessment[] = [];
  let restored: GroupAssessment;
  beforeAll(() => {
    // Full protocol identity/clock matrix, but artificial coordinates and prepared numerical comparisons only.
    // Each group is released after its compact assessments are built; no campaign integrator is invoked.
    for (let caseIndex = 0; caseIndex < S.cases.length; caseIndex++) for (let seedIndex = 0; seedIndex < S.seeds.length; seedIndex++) {
      const runs = group({ caseIndex, seedIndex, full: true, oscillate: true });
      for (const c of S.candidates) {
        const plan = ok(planGroup(runs, c)), entries = preparedEntries(plan, runs);
        const failed = changeResult(entries, "/geometry", r => r.status === "COMPLETE" ? {
          ...r, value: { ...r.value, outcome: "INVALID CONTROL", checks: r.value.checks.map((check, i) => i ? check :
            { ...check, residual: 11, outcome: "INVALID CONTROL", reason: "TOLERANCE_EXCEEDED" }) } } : r);
        const rejected = ok(assessGroup(plan, failed)); rejectAll.push(rejected);
        // A single mandatory seed in one case rejects the first candidate globally.
        const good = ok(assessGroup(plan, entries));
        if (c === S.candidates[0] && caseIndex === 0 && seedIndex === 7) { all.push(rejected); restored = good; }
        else all.push(good);
        if (caseIndex === 0 && seedIndex === 0) unresolved.push(ok(assessGroup(plan, changeResult(entries, "/geometry", r => ({ status: "FAILED", code: "NONFINITE_ARITHMETIC",
          operation: "artificial/overflow", evidence: { context: r.status === "COMPLETE" ? r.value.context : r.evidence.context, input: null } })))));
      }
    }
  }, 180000);
  function withIncomplete(ledger: readonly GroupAssessment[], candidateIndex: number): GroupAssessment[] {
    const replacement = unresolved[candidateIndex];
    return ledger.map(a => a.plan.caseId === replacement.plan.caseId && a.plan.seedId === replacement.plan.seedId &&
      a.plan.candidate.T === replacement.plan.candidate.T && a.plan.candidate.h === replacement.plan.candidate.h ? replacement : a);
  }
  it("requires all seeds/cases and retains deterministic fixed ordering and ledger validation", () => {
    expect(ok(selectCandidate(all)).selected).toEqual(S.candidates[1]);
    expect(ok(selectCandidate([...all].reverse())).selected).toEqual(S.candidates[1]);
    expect(ok(selectCandidate(all.map((a, i) => a.plan.candidate.T === 540 ? rejectAll[i] : a))).selected).toEqual(S.candidates[2]);
    expect(ok(selectCandidate(withIncomplete(all, 0)))).toMatchObject({ state: "QUALIFICATION_INCOMPLETE", selected: null });
    expect(selectCandidate(all.slice(1)).status).toBe("QUALIFICATION_INCOMPLETE");
    expect(selectCandidate([...all.slice(1), all[1]]).status).toBe("QUALIFICATION_INCOMPLETE");
    expect(selectCandidate(structuredClone(all)).status).toBe("QUALIFICATION_INCOMPLETE");
    expect(ok(selectCandidate(all)).executionAuthority).toBe("NOT_AUTHORIZED");
  });
  it("selects qualified candidate 0 despite an incomplete later candidate", () => {
    const qualifiedFirst = all.map(a => a.plan.caseId === restored.plan.caseId && a.plan.seedId === restored.plan.seedId &&
      a.plan.candidate.T === 540 && a.plan.candidate.h === .5 ? restored : a);
    expect(ok(selectCandidate(withIncomplete(qualifiedFirst, 1)))).toMatchObject({
      state: "QUALIFICATION_COMPLETE", control: "completed check", selected: S.candidates[0], executionAuthority: "NOT_AUTHORIZED" });
  });
  it("stops at incomplete candidate 1 after rejecting candidate 0, without selecting qualified candidate 2", () => {
    expect(all.filter(a => a.plan.candidate.T === 360 && a.plan.candidate.h === .5).every(a => a.admission === "ADMITTED")).toBe(true);
    expect(ok(selectCandidate(withIncomplete(all, 1)))).toMatchObject({
      state: "QUALIFICATION_INCOMPLETE", selected: null, executionAuthority: "NOT_AUTHORIZED" });
  });
  it("selects qualified candidate 1 after rejecting candidate 0 despite incomplete later evidence", () => {
    expect(ok(selectCandidate(withIncomplete(all, 2)))).toMatchObject({
      state: "QUALIFICATION_COMPLETE", control: "completed check", selected: S.candidates[1], executionAuthority: "NOT_AUTHORIZED" });
  });
  it("reports complete valid exhaustion when all six candidates are completely rejected", () => {
    expect(ok(selectCandidate(rejectAll))).toMatchObject({
      state: "QUALIFICATION_COMPLETE", selected: null, control: "INVALID CONTROL", executionAuthority: "NOT_AUTHORIZED" });
  });
});
