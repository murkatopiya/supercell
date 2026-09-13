/** Validation-only. Imports are science-inert; production value imports live behind static preflight. */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { closeSync, existsSync, fstatSync, fsyncSync, ftruncateSync, linkSync, mkdirSync, openSync, readFileSync, readSync, unlinkSync, writeSync } from "node:fs";
import { isAbsolute, join, resolve } from "node:path";
import { PHASE_P_CASES, PHASE_P_INHERITED, PHASE_P_MANIFEST_SHA256, PHASE_P_SPEC as S,
  type PhasePCase, type PhasePResolution, type PhasePSeed } from "./observedLagrangianPhasePSpec.js";
import { E1_SPEC, FROZEN_E1_STORM_ONLY, FROZEN_MANIFEST_SHA256 } from "./observedCMatrixE1Spec.js";
import type { VelocityField } from "../core/fields/VelocityField.js";
import type { EnvironmentalWindProfile } from "../physics/environment/EnvironmentalWindProfile.js";
import type { EscHrTimeAnalysisColumn } from "../data/escHrTimeAnalysis/types.js";

export type Vec = Readonly<{ x: number; y: number; z: number }>;
export type Representation = "Source" | "Analysis";
export type Support = "FULL_SUPPORT" | "BOUNDARY_CONDITIONED" | "OUT_OF_DOMAIN" | "COLUMN_UNAVAILABLE";
export type Check = Readonly<{
  id: string; units: string; residual: number | null; tolerance: number | null;
  referenceScale: number | null; satisfied: boolean; applicability: "APPLICABLE" | "N_A";
  status: "completed check" | "INVALID CONTROL" | "UNEXPLAINED" | "N_A";
  reason: string | null; refs: readonly string[];
}>;
const B = S.budget;
function finite(n: number): number { if (!Number.isFinite(n)) throw new Error("NONFINITE_EVIDENCE"); return n; }
function demand(ok: boolean, message: string): asserts ok { if (!ok) throw new Error(message); }
const sub = (a: Vec, b: Vec): Vec => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
const norm = (v: Vec) => Math.hypot(v.x, v.y, v.z);
const inf = (v: Vec) => Math.max(Math.abs(v.x), Math.abs(v.y), Math.abs(v.z));
const copy = (p: Vec): Vec => ({ x: p.x, y: p.y, z: p.z });
export function numericCheck(id: string, residual: number, tolerance: number, units: string,
  refs: readonly string[] = [], referenceScale: number | null = null, discrepancy = false): Check {
  finite(residual); finite(tolerance); if (referenceScale !== null) finite(referenceScale);
  demand(residual >= 0 && tolerance >= 0, "NEGATIVE_RESIDUAL_OR_TOLERANCE");
  return { id, units, residual, tolerance, referenceScale, satisfied: residual <= tolerance,
    applicability: "APPLICABLE", status: residual <= tolerance ? "completed check" : discrepancy ? "UNEXPLAINED" : "INVALID CONTROL",
    reason: residual <= tolerance ? null : "BUDGET_EXCEEDED", refs };
}
const na = (id: string, reason: string): Check => ({ id, units: "1", residual: null, tolerance: null,
  referenceScale: null, satisfied: true, applicability: "N_A", status: "N_A", reason, refs: [] });

export function selectPhasePStage(env: Readonly<Record<string, string | undefined>>): "SKIPPED" | "ELIGIBLE" {
  if (!Object.hasOwn(env, S.stageVariable)) return "SKIPPED";
  demand(env[S.stageVariable] === S.stage, "Phase P selector must be absent or exactly PHASE_P");
  demand(!Object.hasOwn(env, "OBSERVED_C_MATRIX_STAGE") && !Object.hasOwn(env, "STORM_MOTION_VALIDATION_STAGE"), "Conflicting scientific selector");
  return "ELIGIBLE";
}
export function serializeCanonicalRecord(value: unknown): string {
  function canonical(v: unknown): unknown {
    if (typeof v === "number") { finite(v); return v === 0 ? 0 : v; }
    demand(v !== undefined, "UNDEFINED_MUST_BE_TYPED");
    if (Array.isArray(v)) return Array.from({ length: v.length }, (_, i) => { demand(Object.hasOwn(v, i), "SPARSE_EVIDENCE_ARRAY"); return canonical(v[i]); });
    if (v !== null && typeof v === "object") return Object.fromEntries(Object.entries(v).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([k, x]) => [k, canonical(x)]));
    demand(v === null || typeof v === "string" || typeof v === "boolean", "UNSERIALIZABLE");
    return v;
  }
  return JSON.stringify(canonical(value));
}
export const bytesHash = (bytes: string | Uint8Array): string => createHash("sha256").update(bytes).digest("hex");
export const digest = (value: unknown): string => bytesHash(serializeCanonicalRecord(value));
export function manifestData() { return { spec: S, cases: PHASE_P_CASES, inherited: PHASE_P_INHERITED }; }
export function checkPhasePSpecIntegrity(): Check[] {
  return [numericCheck("manifest-digest", digest(manifestData()) === PHASE_P_MANIFEST_SHA256 ? 0 : 1, 0, "1", [], null, true),
    numericCheck("E1-digest", bytesHash(JSON.stringify({ spec: E1_SPEC, storm: FROZEN_E1_STORM_ONLY })) === FROZEN_MANIFEST_SHA256 ? 0 : 1, 0, "1", [], null, true),
    numericCheck("ticks", S.resolutions.every(r => r.dt * S.ticksPerSecond === r.ticks) ? 0 : 1, 0, "1", [], null, true)];
}

export interface Topology { readonly heights: readonly number[]; readonly supports: readonly Support[] }
export function buildSupportTopology(heights: readonly number[], knotSupport?: readonly Support[]): Topology {
  demand(heights.length >= 2 && heights.every((h, i) => Number.isFinite(h) && (i === 0 || h > heights[i - 1])), "BAD_TOPOLOGY_HEIGHTS");
  demand(!knotSupport || knotSupport.length === heights.length, "BAD_SUPPORT_LENGTH");
  if (knotSupport) demand(knotSupport.every(s => s === "FULL_SUPPORT" || s === "BOUNDARY_CONDITIONED"), "BAD_KNOT_SUPPORT");
  return Object.freeze({ heights: Object.freeze([...heights]), supports: Object.freeze(heights.slice(1).map((_, i) =>
    !knotSupport || (knotSupport[i] === "FULL_SUPPORT" && knotSupport[i + 1] === "FULL_SUPPORT") ? "FULL_SUPPORT" : "BOUNDARY_CONDITIONED")) });
}
export function segmentAt(topology: Topology | null, y: number): number | null {
  finite(y); if (!topology) return null;
  const hs = topology.heights;
  if (y < hs[0] || y > hs[hs.length - 1]) return null;
  let lo = 0, hi = hs.length - 1;
  while (lo + 1 < hi) { const m = (lo + hi) >>> 1; if (y < hs[m]) hi = m; else lo = m; }
  return Math.min(lo, hs.length - 2);
}
export function supportAt(topology: Topology | null, y: number): Support {
  const i = segmentAt(topology, y);
  return !topology ? "COLUMN_UNAVAILABLE" : i === null ? "OUT_OF_DOMAIN" : topology.supports[i];
}
export interface Event {
  readonly kind: "segment-change" | "source-exit" | "analysis-loss" | "ground";
  readonly representation: Representation | null; readonly boundary: number | null;
  readonly direction: -1 | 0 | 1; readonly fromSegment: number | null; readonly toSegment: number | null;
  readonly a: number; readonly b: number;
}
export function inspectAcceptedSegment(topology: Topology | null, y0: number, y1: number, a: number, b: number,
  representation: Representation): { eligible: boolean; events: Event[] } {
  [y0, y1, a, b].forEach(finite); demand(b >= a, "BACKWARD_TIME");
  if (!topology) return { eligible: false, events: [] };
  const direction = Math.sign(y1 - y0) as -1 | 0 | 1;
  const events: Event[] = [];
  let eligible = supportAt(topology, y0) === "FULL_SUPPORT" && supportAt(topology, y1) === "FULL_SUPPORT";
  const min = Math.min(y0, y1), max = Math.max(y0, y1), hs = topology.heights;
  // Intersect the exact half-open topology with the closed accepted segment.
  for (let i = 0; i < hs.length - 1; i++) {
    const last = i === hs.length - 2;
    const intersects = max >= hs[i] && (last ? min <= hs[i + 1] : min < hs[i + 1]);
    if (intersects && topology.supports[i] !== "FULL_SUPPORT") eligible = false;
  }
  if (direction !== 0) {
    const boundaries = hs.slice(1, -1).filter(y => direction > 0 ? y0 < y && y1 >= y : y1 < y && y0 >= y);
    if (direction < 0) boundaries.reverse();
    for (const y of boundaries) {
      const k = hs.indexOf(y);
      events.push({ kind: "segment-change", representation, boundary: y, direction,
        fromSegment: direction > 0 ? k - 1 : k, toSegment: direction > 0 ? k : k - 1, a, b });
    }
  }
  return { eligible, events };
}
export function primaryAfterStep(previous: boolean, sourceEligible: boolean, analysisEligible: boolean,
  analysisRequired: boolean, clipped: boolean): boolean {
  return previous && sourceEligible && (!analysisRequired || analysisEligible) && !clipped;
}

export interface Sample {
  readonly index: number; readonly tick: number; readonly time: number; readonly position: Vec;
  readonly age: number; readonly active: boolean; readonly source: Support; readonly analysis: Support;
  readonly primary: boolean; readonly clipped: boolean;
}
export interface Step {
  readonly fromIndex: number; readonly dt: number; readonly operands: readonly Vec[]; readonly total: Vec;
  readonly proposed: Vec; readonly accepted: Vec; readonly events: readonly Event[];
}
export type Diagnostic = Readonly<{ index: number; representation: Representation; status: Support;
  segment: number | null; bracket: readonly [number, number] | null; omega: readonly [number, number] | null;
  gradient: readonly [number, number] | null; T1: number | null; provenance: string }>;
export interface Unit {
  readonly id: string; readonly caseId: string; readonly memberId: string; readonly seedId: string;
  readonly resolutionId: string; readonly h: number; readonly C: readonly [number, number];
  readonly fingerprints: Readonly<Record<string, string>>;
  readonly samples: readonly Sample[]; readonly steps: readonly Step[]; readonly events: readonly Event[];
  readonly termination: "MAX_TIME" | "SOURCE_EXIT" | "GROUND";
}
export interface UnitDiagnostics { readonly id: string; readonly Source: readonly Diagnostic[]; readonly Analysis: readonly Diagnostic[] }
export interface Evidence { readonly trajectory: Unit; readonly diagnostics: UnitDiagnostics }

export function assertClock(index: number, tickIncrement: number, actual: number): number {
  demand(Number.isInteger(index) && index >= 0, "BAD_STEP_INDEX");
  const tick = index * tickIncrement;
  demand(actual === tick / S.ticksPerSecond, "CLOCK_INTEGRITY");
  return tick;
}
export function prefixTime(unit: Unit, T: number): number {
  let result = -1;
  for (const s of unit.samples) { if (s.time > T || !s.primary) break; result = s.time; }
  return result;
}
export function commonTime(units: readonly Unit[], T: number, coarseH: number): number {
  demand(units.length > 0, "EMPTY_COMPARISON");
  const last = Math.min(T, ...units.map(u => prefixTime(u, T)));
  return last < 0 ? -1 : Math.floor(last / coarseH) * coarseH;
}
export function matchCommonSamples(c: Unit, f: Unit, T: number): readonly (readonly [Sample, Sample])[] {
  demand(c.h === 2 * f.h, "NOT_NESTED_PAIR");
  demand(c.caseId === f.caseId && c.memberId === f.memberId && c.seedId === f.seedId, "PAIR_IDENTITY");
  const end = commonTime([c, f], T, c.h);
  if (end <= 0) return [];
  const pairs: [Sample, Sample][] = [];
  for (let j = 0; j <= end / c.h; j++) {
    const a = c.samples[j], b = f.samples[2 * j];
    demand(!!a && !!b && a.index === j && b.index === 2 * j, "MISSING_SAMPLE");
    demand(a.tick === j * c.h * S.ticksPerSecond && a.tick === b.tick && a.time === a.tick / S.ticksPerSecond && b.time === b.tick / S.ticksPerSecond, "PAIR_CLOCK");
    demand(a.primary && b.primary, "INELIGIBLE_PAIR"); pairs.push([a, b]);
  }
  return pairs;
}
export function comparePositions(c: Unit, f: Unit, T: number): Check[] {
  const pairs = matchCommonSamples(c, f, T);
  if (!pairs.length) return [numericCheck("position/interval", 1, 0, "1")];
  const d = pairs.map(([a, b]) => sub(a.position, b.position));
  return [numericCheck("position", Math.max(...d.map(norm)), B.position, "m", [c.id, f.id]),
    numericCheck("vertical", Math.max(...d.map(p => Math.abs(p.y))), B.vertical, "m", [c.id, f.id])];
}
export function comparePathResponse(c: Unit, f: Unit, bc: Unit, bf: Unit, T: number): Check[] {
  demand(c.seedId === bc.seedId && c.caseId === bc.caseId && f.seedId === bf.seedId && f.caseId === bf.caseId && bc.memberId === "C0" && bf.memberId === "C0", "BASELINE_IDENTITY");
  const end = commonTime([c, f, bc, bf], T, c.h), p = matchCommonSamples(c, f, end), base = matchCommonSamples(bc, bf, end);
  if (!p.length) return [numericCheck("response/interval", 1, 0, "1")];
  const d = p.map(([a, b], i) => sub(sub(a.position, base[i][0].position), sub(b.position, base[i][1].position)));
  return [numericCheck("response", Math.max(...d.map(norm)), B.response, "m"),
    numericCheck("vertical-response", Math.max(...d.map(p => Math.abs(p.y))), B.verticalResponse, "m")];
}
export function trapezoid(times: readonly number[], values: readonly number[]): number {
  demand(times.length === values.length && times.length >= 2, "BAD_QUADRATURE");
  let sum = 0;
  for (let i = 1; i < times.length; i++) {
    const dt = finite(times[i]) - finite(times[i - 1]); demand(dt > 0, "NONINCREASING_TIME");
    sum += dt / 2 * (finite(values[i - 1]) + finite(values[i]));
  }
  return finite(sum);
}
export function integrateExposure(times: readonly number[], values: readonly number[]) {
  return { abs: trapezoid(times, values.map(Math.abs)), signed: trapezoid(times, values) };
}
export function compareExposure(coarse: number, fine: number, kind: "abs" | "signed"): Check {
  const scale = Math.max(Math.abs(finite(fine)), B.exposureFloor);
  return numericCheck(`exposure/${kind}`, Math.abs(finite(coarse) - fine), Math.max(B.exposureAbsolute, B.exposureRelative * scale), "s^-1", [], scale);
}
export function excludedByCrossing(t: number, h: number, events: readonly Event[], rep: Representation): boolean {
  return events.some(e => e.kind === "segment-change" && e.representation === rep && t >= e.a - B.crossingExpansionSteps * h && t <= e.b + B.crossingExpansionSteps * h);
}
export function compareT1(c: Evidence, f: Evidence, T: number, rep: Representation): { checks: Check[]; excluded: number; applicable: number } {
  if (c.diagnostics[rep][0]?.status === "COLUMN_UNAVAILABLE" && f.diagnostics[rep][0]?.status === "COLUMN_UNAVAILABLE")
    return { checks: [na(`${rep}/T1`, "COLUMN_UNAVAILABLE")], excluded: 0, applicable: 0 };
  const pairs = matchCommonSamples(c.trajectory, f.trajectory, T);
  if (!pairs.length) return { checks: [numericCheck(`${rep}/interval`, 1, 0, "1")], excluded: 0, applicable: 0 };
  const times = pairs.map(([a]) => a.time), end = times[times.length - 1];
  const crossingEvents = [...c.trajectory.events, ...f.trajectory.events].filter(e => e.b <= end);
  const cv: number[] = [], fv: number[] = [], point: Check[] = [];
  let excluded = 0;
  for (const [a, b] of pairs) {
    const x = c.diagnostics[rep][a.index], y = f.diagnostics[rep][b.index];
    demand(!!x && !!y && x.index === a.index && y.index === b.index && x.representation === rep && y.representation === rep && x.status === "FULL_SUPPORT" && y.status === "FULL_SUPPORT" && x.T1 !== null && y.T1 !== null, "MISSING_SUPPORTED_DIAGNOSTIC");
    cv.push(finite(x.T1)); fv.push(finite(y.T1));
    if (x.segment !== y.segment || excludedByCrossing(a.time, c.trajectory.h, crossingEvents, rep)) { excluded++; continue; }
    point.push(numericCheck(`${rep}/point/${a.index}`, Math.abs(x.T1 - y.T1), B.pointAbsolute + B.pointRelative * Math.abs(y.T1), "s^-2", [`${c.trajectory.id}/${a.index}`, `${f.trajectory.id}/${b.index}`], Math.abs(y.T1)));
  }
  const R1 = trapezoid(times, cv.map((v, i) => Math.abs(v - fv[i]))) / end;
  const Aref = trapezoid(times, fv.map(Math.abs)) / end;
  function exposure(e: Evidence) {
    const samples = e.trajectory.samples.filter(s => s.time <= end);
    return integrateExposure(samples.map(s => s.time), samples.map(s => {
      const d = e.diagnostics[rep][s.index]; demand(d?.T1 !== null && d?.T1 !== undefined && d.index === s.index && d.representation === rep && d.status === "FULL_SUPPORT" && s.primary, "EXPOSURE_SUPPORT"); return d.T1;
    }));
  }
  const ec = exposure(c), ef = exposure(f);
  // Retain every pointwise failure; passing samples reduce to the tightest margin witness.
  const witnesses = point.filter(p => !p.satisfied);
  if (!witnesses.length && point.length) witnesses.push(point.reduce((a, b) => (a.tolerance! - a.residual!) < (b.tolerance! - b.residual!) ? a : b));
  return { checks: [numericCheck(`${rep}/history`, R1, B.historyAbsolute + B.historyRelative * Aref, "s^-2", [], Aref),
    ...witnesses, ...(point.length ? [] : [na(`${rep}/point`, "NO_SEGMENT_MATCHED_SAMPLES")]),
    ...(["abs", "signed"] as const).map(k => ({ ...compareExposure(ec[k], ef[k], k), id: `${rep}/exposure/${k}` }))], excluded, applicable: point.length };
}
export function compareSuccessiveRefinements(coarser: readonly Check[], finer: readonly Check[]): Check[] {
  const aggregate = (c: Check) => c.applicability === "APPLICABLE" && !c.id.includes("/point/") && !c.id.includes("/interval");
  return finer.filter(aggregate).map(f => {
    const c = coarser.find(x => x.id === f.id); demand(!!c && c.residual !== null && f.residual !== null && f.tolerance !== null, "REFINEMENT_METRIC_MISMATCH");
    return numericCheck(`non-worsening/${f.id}`, Math.max(0, f.residual - c.residual), B.nonWorseningFraction * f.tolerance, f.units);
  });
}
export function compareEvents(c: Unit, f: Unit, T: number): Check[] {
  const tolerance = Math.max(B.eventAbsoluteSeconds, B.eventStepFactor * c.h);
  const lifecycle = (u: Unit) => u.events.filter(e => e.kind !== "segment-change" && e.b <= T);
  const ce = lifecycle(c), fe = lifecycle(f);
  const checks = [numericCheck("prefix-time", Math.abs(prefixTime(c, T) - prefixTime(f, T)), tolerance, "s")];
  for (const [name, events, h] of [["c", ce, c.h], ["f", fe, f.h]] as const) events.forEach((e, i) => checks.push(numericCheck(`event-width/${name}/${i}`, e.b - e.a, h, "s")));
  // Group proximate causes as sets anchored at the earliest bracket, avoiding transitive chaining.
  function groups(events: readonly Event[]) {
    const sorted = [...events].sort((a, b) => a.a - b.a || a.b - b.b); const out: Event[][] = [];
    for (const e of sorted) { const g = out[out.length - 1]; if (g && e.a <= g[0].b + tolerance) g.push(e); else out.push([e]); }
    return out;
  }
  const cg = groups(ce), fg = groups(fe);
  checks.push(numericCheck("event-group-count", Math.abs(cg.length - fg.length), 0, "1"));
  cg.forEach((g, i) => {
    const other = fg[i]; if (!other) return;
    const kinds = (v: Event[]) => [...new Set(v.map(e => `${e.kind}/${e.representation}`))].sort().join(",");
    checks.push(numericCheck(`event-types/${i}`, kinds(g) === kinds(other) ? 0 : 1, 0, "1"));
    for (const e of g) {
      const matches = other.filter(x => x.kind === e.kind && x.representation === e.representation);
      if (!matches.length) continue;
      const residual = Math.min(...matches.map(x => Math.max(Math.abs(e.a - x.a), Math.abs(e.b - x.b))));
      checks.push(numericCheck(`event-time/${i}/${e.kind}`, residual, tolerance, "s"));
    }
  });
  return checks.map(check => ({ ...check, refs: [c.id, f.id, `T${T}`] }));
}
export function checkFirstStepOracle(member: Unit, baseline: Unit, initialVelocities: readonly Vec[]): Check {
  demand(member.caseId === baseline.caseId && member.seedId === baseline.seedId && member.h === baseline.h && baseline.memberId === "C0", "ORACLE_IDENTITY");
  demand(digest(member.samples[0].position) === digest(baseline.samples[0].position) && member.samples[0].time === 0 && baseline.samples[0].time === 0, "ORACLE_SEED_TIME");
  const m = member.samples[1], b = baseline.samples[1];
  if (!m || !b || m.clipped || b.clipped) return { ...na("first-step", "IMMEDIATE_CLIPPING_OR_MISSING_STEP"), satisfied: false, status: "INVALID CONTROL" };
  demand(initialVelocities.length === E1_SPEC.memberIds.length, "ORACLE_INITIAL_VELOCITIES");
  const expected = { x: -member.h * (member.C[0] - baseline.C[0]), y: 0, z: member.h * (member.C[1] - baseline.C[1]) };
  const L = Math.max(1, inf(member.samples[0].position), member.h * Math.max(...initialVelocities.map(inf)));
  return numericCheck("first-step", inf(sub(sub(m.position, b.position), expected)), Math.max(B.oracleAbsoluteMetres, B.oracleUlpFactor * B.epsilon * L), "m", [member.id, baseline.id], L, true);
}

export interface AdmissionRow { readonly T: number; readonly h: number; readonly complete: boolean;
  readonly viable: boolean; readonly numerical: boolean; readonly controls: boolean; readonly unresolved: boolean;
  readonly reasons: readonly string[] }
export function selectQualifiedCandidate(rows: readonly AdmissionRow[]): {
  state: "QUALIFICATION_COMPLETE" | "QUALIFICATION_INCOMPLETE"; selected: { T: number; h: number } | null;
  control: "completed check" | "INVALID CONTROL" | "UNEXPLAINED";
} {
  if (rows.length !== S.candidates.length || rows.some(r => !r.complete || r.unresolved) ||
    S.candidates.some(c => rows.filter(r => r.T === c.T && r.h === c.h).length !== 1))
    return { state: "QUALIFICATION_INCOMPLETE", selected: null, control: "UNEXPLAINED" };
  for (const candidate of S.candidates) {
    const row = rows.find(r => r.T === candidate.T && r.h === candidate.h);
    if (!row || !row.complete || row.unresolved) return { state: "QUALIFICATION_INCOMPLETE", selected: null, control: "UNEXPLAINED" };
    if (row.viable && row.numerical && row.controls) return { state: "QUALIFICATION_COMPLETE", selected: candidate, control: "completed check" };
  }
  return { state: "QUALIFICATION_COMPLETE", selected: null, control: "INVALID CONTROL" };
}

export interface ExecutionOptions {
  readonly env: Readonly<Record<string, string | undefined>>;
  readonly reviewedImplementationSha: string | undefined;
  readonly root: string; readonly outputDirectory: string;
}
interface RawCase { levels: { height: number; eastward: number; northward: number }[]; coverage: unknown }
const implementationPaths = ["observedLagrangianPhasePSpec.ts", "observedLagrangianPhaseP.ts", "observedLagrangianPhaseP.validation.test.ts"].map(n => `src/validation/${n}`);
const readyStatic = new WeakSet<object>();
interface StaticContext { root: string; head: string; reviewedSha: string; raw: Map<string, RawCase>; analysisSupport: Map<string, readonly Support[]>; checks: Check[]; outputDirectory: string }
function git(root: string, args: string[]): Buffer { return execFileSync("git", args, { cwd: root, maxBuffer: 64 * 1024 * 1024 }); }
export function staticPreflight(options: ExecutionOptions): { context: StaticContext | null; checks: Check[]; fault: string | null } {
  const checks = checkPhasePSpecIntegrity();
  try {
    demand(selectPhasePStage(options.env) === "ELIGIBLE", "STAGE_REQUIRED");
    demand(checks.every(c => c.satisfied), "SPEC_INTEGRITY");
    const { root, reviewedImplementationSha: sha } = options;
    demand(!!sha && /^[0-9a-f]{40}$/.test(sha), "REVIEWED_IMPLEMENTATION_SHA_REQUIRED");
    const head = git(root, ["rev-parse", "HEAD"]).toString().trim();
    git(root, ["merge-base", "--is-ancestor", S.freezeCommit, sha]);
    git(root, ["merge-base", "--is-ancestor", sha, head]);
    demand(git(root, ["status", "--porcelain", "--untracked-files=no"]).toString().trim() === "", "TRACKED_TREE_OR_INDEX_DIRTY");
    const checkBytes = (path: string, hash: string) => {
      const bytes = readFileSync(resolve(root, path));
      demand(bytesHash(bytes) === hash, `BYTE_HASH:${path}`);
      demand(bytesHash(git(root, ["show", `${head}:${path}`])) === hash, `COMMITTED_BYTE_HASH:${path}`);
      checks.push(numericCheck(`bytes/${path}`, 0, 0, "1")); return bytes;
    };
    checkBytes(S.document, S.documentSha256);
    for (const p of implementationPaths) {
      demand(bytesHash(git(root, ["show", `${sha}:${p}`])) === bytesHash(git(root, ["show", `${head}:${p}`])), `UNREVIEWED_IMPLEMENTATION:${p}`);
    }
    // Freeze production and execution tooling closure, not only three entry files.
    const paths = ["src", "package.json", "package-lock.json", "tsconfig.json", "vitest.config.ts", "vite.config.ts"];
    demand(git(root, ["diff", "--name-only", sha, head, "--", ...paths]).toString().trim() === "", "REVIEWED_DEPENDENCY_DRIFT");
    demand(git(root, ["diff", "--name-only", S.freezeCommit, head, "--", ...paths, ":(exclude)src/validation/observedLagrangianPhasePSpec.ts", ":(exclude)src/validation/observedLagrangianPhaseP.ts", ":(exclude)src/validation/observedLagrangianPhaseP.validation.test.ts"]).toString().trim() === "", "FROZEN_PRODUCTION_OR_E1_DRIFT");
    const raw = new Map<string, RawCase>();
    const analysisSupport = new Map<string, readonly Support[]>();
    for (const c of PHASE_P_CASES) {
      const value = JSON.parse(checkBytes(c.fixturePath, c.fixtureHash).toString()) as RawCase;
      demand(digest(value.coverage) === digest(c.coverage), "COVERAGE_MISMATCH");
      const topology = buildSupportTopology(value.levels.map(l => l.height));
      value.levels.forEach(l => { finite(l.eastward); finite(l.northward); });
      demand(S.seeds.every(s => supportAt(topology, s.y) === "FULL_SUPPORT"), "INITIAL_SOURCE_SUPPORT");
      if (c.timePath) {
        const times = (JSON.parse(checkBytes(c.timePath, c.timeHash!).toString()) as { times: number[] }).times;
        demand(times.length === value.levels.length && times.every((t, i) => Number.isInteger(t) && (i === 0 || (t > times[i - 1] && t - times[i - 1] <= 5))), "RETAINED_TIME_INVARIANTS");
        const half = PHASE_P_INHERITED.kernel.halfWidthS;
        const support = times.map(t => t >= times[0] + half && t <= times[times.length - 1] - half ? "FULL_SUPPORT" as const : "BOUNDARY_CONDITIONED" as const);
        analysisSupport.set(c.id, support);
        const at = buildSupportTopology(topology.heights, support);
        demand(S.seeds.every(s => supportAt(at, s.y) === "FULL_SUPPORT"), "INITIAL_ANALYSIS_SUPPORT");
      }
      raw.set(c.id, value);
    }
    checkBytes(PHASE_P_INHERITED.kernel.path, PHASE_P_INHERITED.kernel.hash);
    // AST/source tripwire: explicit imports only; no collector/scenario/UI execution dependency.
    const core = readFileSync(resolve(root, implementationPaths[1]), "utf8");
    const forbidden = /(?:from\s*|import\s*\()\s*["'][^"']*(?:DEMO_SCENARIO|composeDemo|ScenarioConfig|\/ui\/|observedCMatrixE1\.js)["']/;
    demand(!forbidden.test(core), "FORBIDDEN_EXECUTION_IMPORT");
    demand(isAbsolute(options.outputDirectory) && !existsSync(options.outputDirectory), "OUTPUT_MUST_BE_FRESH_ABSOLUTE_DIRECTORY");
    const context: StaticContext = { root, head, reviewedSha: sha, raw, analysisSupport, checks, outputDirectory: options.outputDirectory };
    readyStatic.add(context);
    return { context, checks, fault: null };
  } catch (e) { return { context: null, checks, fault: String(e) }; }
}

async function loadRuntime() {
  const [simulation, euler, clock, domain, seeds, environment, adapter, composite, updraft, rotation, lower, upper, down, near, sourceDiagnostic, shear, omega, analysis] = await Promise.all([
    import("../simulation/Simulation.js"), import("../core/integrators/EulerIntegrator.js"), import("../simulation/SimulationClock.js"),
    import("../simulation/AtmosphericTracerDomain.js"), import("../simulation/createTracersFromSeeds.js"),
    import("../physics/environment/EnvironmentalWindField.js"), import("../physics/environment/StormRelativeEnvironmentalAdvectionField.js"),
    import("../core/fields/CompositeVelocityField.js"), import("../physics/storm/VerticalEnvelopeUpdraftField.js"),
    import("../physics/storm/VerticalEnvelopeRotationField.js"), import("../physics/storm/LowerRadialInflowField.js"),
    import("../physics/storm/UpperRadialOutflowField.js"), import("../physics/storm/VerticalEnvelopeDowndraftField.js"),
    import("../physics/storm/NearGroundRadialOutflowField.js"), import("../physics/diagnostics/DiagnosticTiltingTendency.js"),
    import("../physics/environment/verticalWindShear.js"), import("../physics/environment/horizontalVorticity.js"),
    import("../data/escHrTimeAnalysis/analysisTiltingQuery.js"),
  ]);
  return { simulation, euler, clock, domain, seeds, environment, adapter, composite, updraft, rotation, lower, upper, down, near, sourceDiagnostic, shear, omega, analysis };
}
type Runtime = Awaited<ReturnType<typeof loadRuntime>>;
interface CaseContext {
  manifest: PhasePCase; source: EnvironmentalWindProfile; analysis: EscHrTimeAnalysisColumn | null;
  sourceTopology: Topology; analysisTopology: Topology | null;
  sourceProvenance: unknown; fingerprints: Record<string, string>;
  fields: readonly { C: readonly [number, number]; operands: readonly VelocityField[]; total: VelocityField }[];
}
interface ReadyContext { static: StaticContext; runtime: Runtime; cases: readonly CaseContext[];
  storm: readonly VelocityField[]; updraft: InstanceType<Runtime["updraft"]["VerticalEnvelopeUpdraftField"]>; fingerprint: string }
const globalReady = new WeakSet<object>();
const profileSnapshot = (p: EnvironmentalWindProfile) => p.levelHeights().map(height => ({ height, wind: p.sampleAtHeight(height) }));
function contextFingerprint(c: CaseContext): string {
  return digest({ source: profileSnapshot(c.source), sourceProvenance: c.sourceProvenance,
    analysis: c.analysis ? { profile: profileSnapshot(c.analysis.profile), support: c.analysis.support, provenance: c.analysis.provenance } : null });
}
async function constructConformingContexts(preflight: StaticContext): Promise<ReadyContext> {
  demand(readyStatic.has(preflight), "STATIC_CAPABILITY_REQUIRED");
  // Eager observed Analysis construction happens only after all static gates succeeded.
  const representations = await import("../app/exploreEnvironmentRepresentations.js");
  const runtime = await loadRuntime();
  const params = PHASE_P_INHERITED.storm;
  const updraft = new runtime.updraft.VerticalEnvelopeUpdraftField(params.updraft);
  const storm = [updraft, new runtime.rotation.VerticalEnvelopeRotationField(params.rotation),
    new runtime.lower.LowerRadialInflowField(params.lowerRadialInflow), new runtime.upper.UpperRadialOutflowField(params.upperRadialOutflow),
    new runtime.down.VerticalEnvelopeDowndraftField(params.downdraft), new runtime.near.NearGroundRadialOutflowField(params.nearGroundOutflow)];
  storm.forEach(Object.freeze);
  const cases: CaseContext[] = [];
  for (const manifest of PHASE_P_CASES) {
    const rep = representations.exploreEnvironmentRepresentations(manifest.id);
    demand(!!rep.sourceProfile && !!rep.sourceRecord, "MISSING_SOURCE");
    const source = rep.sourceProfile, analysis = rep.analysisColumn;
    demand(rep.sourceRecord.provenance.sourceIdentity === manifest.sourceIdentity && rep.sourceRecord.provenance.heightDatum === manifest.heightDatum, "SOURCE_PROVENANCE");
    const raw = preflight.raw.get(manifest.id)!;
    demand(digest(source.levelHeights()) === digest(raw.levels.map(l => l.height)), "SOURCE_HEIGHTS");
    for (const l of raw.levels) {
      const w = source.sampleAtHeight(l.height);
      demand(w.eastward === l.eastward && w.northward === l.northward && w.vertical === 0, "SOURCE_WIND_CONFORMANCE");
    }
    demand((analysis !== null) === manifest.analysisAvailable, "ANALYSIS_CAPABILITY");
    if (analysis) {
      demand(analysis.provenance.sourceIdentity === manifest.sourceIdentity, "ANALYSIS_IDENTITY");
      const actual = analysis.provenance as unknown as Record<string, unknown>;
      for (const [key, value] of Object.entries(PHASE_P_INHERITED.kernel.provenance)) demand(digest(actual[key]) === digest(value), `ANALYSIS_PROVENANCE:${key}`);
      demand(digest(analysis.profile.levelHeights()) === digest(source.levelHeights()), "ANALYSIS_HEIGHTS");
      demand(digest(analysis.support) === digest(preflight.analysisSupport.get(manifest.id)), "ANALYSIS_SUPPORT_TOPOLOGY");
    }
    const sourceTopology = buildSupportTopology(source.levelHeights());
    const analysisTopology = analysis ? buildSupportTopology(analysis.profile.levelHeights(), analysis.support) : null;
    const ground = new runtime.environment.EnvironmentalWindField(source);
    const fields = manifest.members.map(member => {
      const env = new runtime.adapter.StormRelativeEnvironmentalAdvectionField(ground, { eastward: member.C[0], northward: member.C[1] });
      const operands = [env, ...storm];
      return { C: member.C, operands, total: new runtime.composite.CompositeVelocityField(operands) };
    });
    const c: CaseContext = { manifest, source, analysis, sourceTopology, analysisTopology, sourceProvenance: rep.sourceRecord.provenance,
      fingerprints: {}, fields };
    c.fingerprints = { context: contextFingerprint(c), storm: digest(storm), inputs: PHASE_P_MANIFEST_SHA256 };
    for (const seed of S.seeds) {
      demand(supportAt(sourceTopology, seed.y) === "FULL_SUPPORT" && (!manifest.analysisAvailable || supportAt(analysisTopology, seed.y) === "FULL_SUPPORT"), "CONSTRUCTED_INITIAL_SUPPORT");
      const q = source.sampleAtHeight(seed.y);
      for (const f of fields) {
        const env = f.operands[0].sample(seed, 0);
        demand(env.x === q.eastward - f.C[0] && env.y === 0 && env.z === 0 - (q.northward - f.C[1]), "EXPLICIT_C_MAPPING");
        demand(f.operands.slice(1).every((v, i) => v === storm[i]), "SHARED_STORM_IDENTITY");
        demand(digest(f.total.sample(seed, 0)) === digest(orderedSum(f.operands.map(v => v.sample(seed, 0)))), "COMPOSITE_ORDER");
      }
      const diagnostic = deriveDiagnosticRecords(runtime, c, updraft, 0, seed, 0);
      demand(diagnostic.Source.T1 !== null && (manifest.analysisAvailable ? diagnostic.Analysis.status === "FULL_SUPPORT" : diagnostic.Analysis.status === "COLUMN_UNAVAILABLE"), "DIAGNOSTIC_CONFORMANCE");
    }
    cases.push(c);
  }
  const ready = { static: preflight, runtime, cases, storm, updraft, fingerprint: digest(storm) };
  globalReady.add(ready); return ready;
}
export function orderedSum(values: readonly Vec[]): Vec {
  let x = 0, y = 0, z = 0;
  for (const v of values) { x += finite(v.x); y += finite(v.y); z += finite(v.z); }
  return { x: finite(x), y: finite(y), z: finite(z) };
}
function deriveDiagnosticRecords(rt: Runtime, c: CaseContext, updraft: ReadyContext["updraft"], index: number, position: Vec, time: number): { Source: Diagnostic; Analysis: Diagnostic } {
  const result = (rep: Representation, topology: Topology | null, provenance: string): Diagnostic => {
    const status = supportAt(topology, position.y), segment = segmentAt(topology, position.y);
    const empty: Diagnostic = { index, representation: rep, status, segment, bracket: null, omega: null, gradient: null, T1: null, provenance };
    if (segment === null || !topology) return empty; // Gate before legacy Source numeric API.
    const bracket: [number, number] = [topology.heights[segment], topology.heights[segment + 1]];
    if (rep === "Analysis") {
      const a = rt.analysis.queryAnalysisTiltingExplanationAt(c.analysis, updraft, position, time);
      demand(a.status === status && (a.status === "FULL_SUPPORT" || a.status === "BOUNDARY_CONDITIONED"), "ANALYSIS_SUPPORT_CONFORMANCE");
      return { ...empty, bracket, omega: [a.worldHorizontalVorticity.omegaX, a.worldHorizontalVorticity.omegaZ],
        gradient: [a.updraftHorizontalGradient.dVyDx, a.updraftHorizontalGradient.dVyDz], T1: finite(a.tiltingTendency) };
    }
    const shear = rt.shear.verticalWindShearBetween(c.source, bracket[0], bracket[1]);
    const omega = rt.sourceDiagnostic.worldHorizontalVorticityFromAtmospheric(rt.omega.horizontalVorticityFromShear(shear));
    const grad = updraft.horizontalGradientOfVerticalVelocity(position, time);
    const T1 = new rt.sourceDiagnostic.DiagnosticTiltingTendency({ profile: c.source, updraft }).sample(position, time);
    demand(T1 === omega.omegaX * grad.dVyDx + omega.omegaZ * grad.dVyDz, "SOURCE_DOT_PRODUCT");
    return { ...empty, bracket, omega: [omega.omegaX, omega.omegaZ], gradient: [grad.dVyDx, grad.dVyDz], T1: finite(T1) };
  };
  return { Source: result("Source", c.sourceTopology, c.fingerprints.context), Analysis: result("Analysis", c.analysisTopology, c.fingerprints.context) };
}
function collectTrajectoryUnit(ctx: ReadyContext, c: CaseContext, memberIndex: number, seed: PhasePSeed, resolution: PhasePResolution): Evidence {
  demand(globalReady.has(ctx), "GLOBAL_READY_CAPABILITY_REQUIRED");
  const rt = ctx.runtime, f = c.fields[memberIndex], member = c.manifest.members[memberIndex];
  const id = `${c.manifest.id}/${member.id}/${seed.id}/${resolution.id}`;
  let sampled: Vec | null = null, calls = 0;
  let from: Vec = copy(seed), time = 0;
  const observer: VelocityField = { sample(p, t) {
    demand(digest(p) === digest(from) && t === time, "EULER_SAMPLE_LOCATION");
    sampled = copy(f.total.sample(p, t)); calls++; return copy(sampled);
  } };
  const clock = new rt.clock.SimulationClock();
  const simulation = new rt.simulation.Simulation(observer, new rt.euler.EulerIntegrator(), rt.seeds.createTracersFromSeeds([seed]), { clock, tracerDomain: rt.domain.ATMOSPHERIC_TRACER_DOMAIN });
  const samples: Sample[] = [], steps: Step[] = [], events: Event[] = [];
  const Source: Diagnostic[] = [], Analysis: Diagnostic[] = [];
  let primary = true, analysisLost = false;
  let termination: Unit["termination"] = "MAX_TIME";
  function record(index: number, clipped: boolean) {
    const p = simulation.particles[0], tick = assertClock(index, resolution.ticks, clock.time);
    demand(p.age === clock.time && simulation.particles.length === 1, "AGE_OR_OCCUPANCY_CONFORMANCE");
    const source = supportAt(c.sourceTopology, p.position.y), analysis = supportAt(c.analysisTopology, p.position.y);
    samples.push({ index, tick, time: clock.time, position: copy(p.position), age: p.age, active: p.active, source, analysis, primary, clipped });
    const d = deriveDiagnosticRecords(rt, c, ctx.updraft, index, p.position, clock.time);
    Source.push(d.Source); Analysis.push(d.Analysis);
  }
  record(0, false);
  const maxSteps = Math.max(...S.durations) / resolution.dt;
  for (let i = 0; i < maxSteps; i++) {
    const p = simulation.particles[0]; from = copy(p.position); time = clock.time;
    demand(p.active && supportAt(c.sourceTopology, from.y) === "FULL_SUPPORT", "UNSUPPORTED_STEP_START");
    const operands = f.operands.map(v => copy(v.sample(from, time))), sum = orderedSum(operands);
    calls = 0; sampled = null;
    simulation.step(resolution.dt);
    demand(calls === 1 && sampled !== null, "EULER_SAMPLE_COUNT");
    const total = sampled as Vec;
    demand(digest(sum) === digest(total), "ACTUAL_TOTAL_ORDER_CONFORMANCE");
    const proposed = { x: from.x + resolution.dt * total.x, y: from.y + resolution.dt * total.y, z: from.z + resolution.dt * total.z };
    const accepted = copy(p.position), clipped = from.y >= 0 && proposed.y < 0;
    const expected = rt.domain.applyAtmosphericTracerDomain(from, proposed);
    demand(digest(expected.position) === digest(accepted) && expected.active === p.active && p.active === !clipped, "DOMAIN_CONFORMANCE");
    const src = inspectAcceptedSegment(c.sourceTopology, from.y, accepted.y, time, clock.time, "Source");
    const ana = inspectAcceptedSegment(c.analysisTopology, from.y, accepted.y, time, clock.time, "Analysis");
    const stepEvents = [...src.events, ...ana.events];
    const event = (kind: Event["kind"], representation: Representation | null): Event => ({ kind, representation, boundary: kind === "ground" ? 0 : null,
      direction: Math.sign(accepted.y - from.y) as -1 | 0 | 1, fromSegment: null, toSegment: null, a: time, b: clock.time });
    if (!src.eligible) stepEvents.push(event("source-exit", "Source"));
    if (c.manifest.analysisAvailable && !ana.eligible && !analysisLost) { stepEvents.push(event("analysis-loss", "Analysis")); analysisLost = true; }
    if (clipped) stepEvents.push(event("ground", null));
    primary = primaryAfterStep(primary, src.eligible, ana.eligible, c.manifest.analysisAvailable, clipped);
    events.push(...stepEvents); steps.push({ fromIndex: i, dt: resolution.dt, operands, total, proposed, accepted, events: stepEvents });
    record(i + 1, clipped);
    if (!src.eligible || clipped) { termination = clipped ? "GROUND" : "SOURCE_EXIT"; break; }
  }
  demand(contextFingerprint(c) === c.fingerprints.context && digest(ctx.storm) === ctx.fingerprint, "CONTEXT_DRIFT");
  return { trajectory: { id, caseId: c.manifest.id, memberId: member.id, seedId: seed.id, resolutionId: resolution.id,
    h: resolution.dt, C: f.C, fingerprints: c.fingerprints, samples, steps, events, termination }, diagnostics: { id, Source, Analysis } };
}

const artifactNames = ["manifest.json", "trajectory.ndjson", "diagnostic.ndjson", "summary.json", "execution.json", "stdout.txt", "stderr.txt"] as const;
type ArtifactName = typeof artifactNames[number];
/** Exclusive, bounded I/O. Never overwrites or resumes; partial names survive failed invocations. */
export class QualificationArtifacts {
  private readonly handles = new Map<ArtifactName, number>();
  private closed = false;
  constructor(readonly directory: string) {
    demand(!existsSync(directory), "ARTIFACT_COLLISION"); mkdirSync(directory);
    try { for (const name of artifactNames) this.handles.set(name, openSync(join(directory, `${name}.partial`), "wx+")); }
    catch (e) { for (const fd of this.handles.values()) closeSync(fd); this.closed = true; throw e; }
  }
  append(name: ArtifactName, value: unknown): { offset: number; length: number } {
    return this.appendText(name, serializeCanonicalRecord(value) + "\n");
  }
  /** Update only the execution marker in this writer's exclusively owned partial file. */
  execution(value: unknown): void {
    const text = serializeCanonicalRecord(value) + "\n";
    demand(!this.closed, "ARTIFACTS_CLOSED");
    ftruncateSync(this.handles.get("execution.json")!, 0);
    this.appendText("execution.json", text);
    fsyncSync(this.handles.get("execution.json")!);
  }
  appendText(name: ArtifactName, text: string): { offset: number; length: number } {
    demand(!this.closed, "ARTIFACTS_CLOSED"); const fd = this.handles.get(name)!;
    const offset = fstatSync(fd).size, bytes = Buffer.from(text, "utf8");
    let written = 0; while (written < bytes.length) written += writeSync(fd, bytes, written, bytes.length - written, offset + written);
    return { offset, length: bytes.length };
  }
  read(name: ArtifactName, pointer: { offset: number; length: number }): unknown {
    const bytes = Buffer.alloc(pointer.length), fd = this.handles.get(name)!; let n = 0;
    while (n < bytes.length) { const count = readSync(fd, bytes, n, bytes.length - n, pointer.offset + n); demand(count > 0, "TRUNCATED_ARTIFACT"); n += count; }
    return JSON.parse(bytes.toString("utf8"));
  }
  hash(name: ArtifactName): string {
    const fd = this.handles.get(name)!; fsyncSync(fd); const hash = createHash("sha256"), buffer = Buffer.alloc(65536); let offset = 0;
    for (;;) { const count = readSync(fd, buffer, 0, buffer.length, offset); if (!count) break; hash.update(buffer.subarray(0, count)); offset += count; }
    return hash.digest("hex");
  }
  close(complete: boolean): void {
    if (this.closed) return;
    for (const fd of this.handles.values()) fsyncSync(fd);
    if (complete) {
      // Hard links fail on collisions; never replace an existing final filename.
      // Retain every partial until the entire final set has been published.
      for (const name of artifactNames) linkSync(join(this.directory, `${name}.partial`), join(this.directory, name));
      for (const name of artifactNames) unlinkSync(join(this.directory, `${name}.partial`));
    }
    for (const fd of this.handles.values()) closeSync(fd);
    this.closed = true;
  }
}

/** Pure numerical layer: hand-authored evidence is sufficient; never constructs a run. */
export function evaluateSeed(units: readonly Evidence[], T: number, h: number): { viable: boolean; checks: Check[]; numerical: boolean; controls: boolean; exclusions: { member: string; representation: Representation; h: number; end: number; excluded: number; applicable: number; fraction: number | null }[] } {
  demand(units.length === E1_SPEC.memberIds.length * S.resolutions.length, "INCOMPLETE_SEED_GROUP");
  const get = (member: string, dt: number) => {
    const e = units.find(e => e.trajectory.memberId === member && e.trajectory.h === dt); demand(!!e, "MISSING_UNIT"); return e;
  };
  const checks: Check[] = [], exclusions: ReturnType<typeof evaluateSeed>["exclusions"] = [];
  const viable = units.every(e => prefixTime(e.trajectory, T) === T);
  for (const r of S.resolutions) {
    const initial = E1_SPEC.memberIds.map(m => get(m, r.dt).trajectory.steps[0]?.total);
    demand(initial.every(v => v !== undefined), "MISSING_FIRST_STEPS");
    for (const m of E1_SPEC.memberIds.slice(1)) checks.push(checkFirstStepOracle(get(m, r.dt).trajectory, get("C0", r.dt).trajectory, initial as Vec[]));
  }
  const controls = checks.every(c => c.satisfied);
  // One common physical interval for all five members at all three resolutions.
  const end = commonTime(units.filter(e => [h, h / 2, h / 4].includes(e.trajectory.h)).map(e => e.trajectory), T, h);
  for (const dt of [h, h / 2]) {
    const coarsePrefix = Math.min(...E1_SPEC.memberIds.map(m => prefixTime(get(m, dt).trajectory, T)));
    const finePrefix = Math.min(...E1_SPEC.memberIds.map(m => prefixTime(get(m, dt / 2).trajectory, T)));
    checks.push(numericCheck("prefix-time/Kstar", Math.abs(coarsePrefix - finePrefix), Math.max(B.eventAbsoluteSeconds, B.eventStepFactor * dt), "s", [`all-members/h${dt}/T${T}`]));
  }
  for (const m of E1_SPEC.memberIds) {
    const triple = [get(m, h), get(m, h / 2), get(m, h / 4)];
    const baseline = [get("C0", h), get("C0", h / 2), get("C0", h / 4)];
    const pairChecks: Check[][] = [];
    for (let i = 0; i < 2; i++) {
      const c = triple[i], f = triple[i + 1];
      const pair = [...comparePositions(c.trajectory, f.trajectory, end),
        ...(m === "C0" ? [] : comparePathResponse(c.trajectory, f.trajectory, baseline[i].trajectory, baseline[i + 1].trajectory, end))];
      for (const rep of ["Source", "Analysis"] as const) {
        const result = compareT1(c, f, end, rep); pair.push(...result.checks);
        const count = result.excluded + result.applicable;
        exclusions.push({ member: m, representation: rep, h: c.trajectory.h, end,
          excluded: result.excluded, applicable: result.applicable, fraction: count ? result.excluded / count : null });
      }
      pairChecks.push(pair);
      checks.push(...pair.map(c => ({ ...c, refs: [...c.refs, `${m}/pair${i}/T${T}`] })));
      checks.push(...compareEvents(c.trajectory, f.trajectory, T).filter(c => c.id !== "prefix-time"));
    }
    if (end > 0) checks.push(...compareSuccessiveRefinements(pairChecks[0], pairChecks[1]).map(c => ({ ...c, refs: triple.map(e => e.trajectory.id) })));
  }
  return { viable, checks, numerical: checks.filter(c => c.id !== "first-step").every(c => c.satisfied), controls, exclusions };
}

export interface PhasePResult {
  state: "SKIPPED" | "PREFLIGHT_BLOCKED" | "QUALIFICATION_COMPLETE" | "QUALIFICATION_INCOMPLETE";
  selected: { T: number; h: number } | null; faults: readonly string[]; unitsCollected: number; humanReview: "REQUIRED";
}
/** Separate human execution authorization is an external prerequisite, never inferred here. */
export async function collectPhaseP(options: ExecutionOptions): Promise<PhasePResult> {
  if (selectPhasePStage(options.env) === "SKIPPED") return { state: "SKIPPED", selected: null, faults: [], unitsCollected: 0, humanReview: "REQUIRED" };
  const pre = staticPreflight(options);
  if (!pre.context) return { state: "PREFLIGHT_BLOCKED", selected: null, faults: [pre.fault ?? "PREFLIGHT"], unitsCollected: 0, humanReview: "REQUIRED" };
  let artifacts: QualificationArtifacts | null = null, unitsCollected = 0;
  try {
    // Reserve the whole output namespace before observed construction and never overwrite.
    artifacts = new QualificationArtifacts(pre.context.outputDirectory);
    artifacts.execution({ schema: S.schemas.execution, state: "QUALIFICATION_INCOMPLETE", selected: null,
      faults: ["INVOCATION_NOT_FINALIZED"], unitsCollected: 0, countMeaning: "LAST_DURABLE_CHECKPOINT",
      runtimeHead: pre.context.head, reviewedImplementationSha: pre.context.reviewedSha, humanReview: "REQUIRED" });
    artifacts.append("manifest.json", { schema: S.schemas.manifest, ...manifestData(), runtimeHead: pre.context.head, reviewedImplementationSha: pre.context.reviewedSha,
      specHash: S.documentSha256, manifestHash: PHASE_P_MANIFEST_SHA256, authorization: "SEPARATE_HUMAN_EXECUTION_AUTHORIZATION_REQUIRED",
      publicationRule: "ANY_PARTIAL_OR_MISSING_FINAL_FILE_MEANS_INCOMPLETE_NO_RESUME" });
    const ctx = await constructConformingContexts(pre.context);
    type Pointer = { offset: number; length: number };
    const index = new Map<string, { trajectory: Pointer; diagnostic: Pointer }>();
    for (const c of ctx.cases) for (let m = 0; m < c.manifest.members.length; m++) for (const seed of S.seeds) for (const r of S.resolutions) {
      const evidence = collectTrajectoryUnit(ctx, c, m, seed, r);
      index.set(evidence.trajectory.id, {
        trajectory: artifacts.append("trajectory.ndjson", { schema: S.schemas.trajectory, ...evidence.trajectory }),
        diagnostic: artifacts.append("diagnostic.ndjson", { schema: S.schemas.diagnostic, ...evidence.diagnostics }),
      }); unitsCollected++;
      artifacts.execution({ schema: S.schemas.execution, state: "QUALIFICATION_INCOMPLETE", selected: null,
        faults: ["INVOCATION_NOT_FINALIZED"], unitsCollected, countMeaning: "LAST_WRITTEN_UNIT_CHECKPOINT",
        runtimeHead: pre.context.head, reviewedImplementationSha: pre.context.reviewedSha, humanReview: "REQUIRED" });
    }
    demand(unitsCollected === PHASE_P_CASES.length * E1_SPEC.memberIds.length * S.seeds.length * S.resolutions.length, "UNIT_COMPLETENESS");
    demand(digest(ctx.storm) === ctx.fingerprint && ctx.cases.every(c => contextFingerprint(c) === c.fingerprints.context), "FINAL_CONTEXT_DRIFT");
    const rows: AdmissionRow[] = [], details: unknown[] = [];
    let globalUnresolved = false;
    for (const candidate of S.candidates) {
      let viable = true, numerical = true, controls = true;
      for (const c of PHASE_P_CASES) for (const seed of S.seeds) {
        const units: Evidence[] = [];
        for (const m of c.members) for (const r of S.resolutions) {
          const p = index.get(`${c.id}/${m.id}/${seed.id}/${r.id}`)!;
          units.push({ trajectory: artifacts.read("trajectory.ndjson", p.trajectory) as Unit, diagnostics: artifacts.read("diagnostic.ndjson", p.diagnostic) as UnitDiagnostics });
        }
        const result = evaluateSeed(units, candidate.T, candidate.h);
        viable &&= result.viable; numerical &&= result.numerical; controls &&= result.controls;
        globalUnresolved ||= result.checks.some(c => c.status === "UNEXPLAINED");
        details.push({ caseId: c.id, seedId: seed.id, ...candidate, support: result.viable ? "FULL_DURATION" : "TRUNCATED",
          resolution: result.numerical ? "QUALIFIED" : "NOT_QUALIFIED", checks: result.checks, pointwiseExclusions: result.exclusions });
      }
      rows.push({ ...candidate, complete: true, viable, numerical, controls, unresolved: globalUnresolved, reasons: [!viable ? "SUPPORT" : "", !numerical ? "NUMERICAL" : "", !controls ? "CONTROL" : ""].filter(Boolean) });
    }
    const decision = globalUnresolved ? { state: "QUALIFICATION_INCOMPLETE" as const, selected: null, control: "UNEXPLAINED" as const } : selectQualifiedCandidate(rows);
    const result: PhasePResult = { state: decision.state, selected: decision.selected, faults: globalUnresolved ? ["UNEXPLAINED_CONTROL"] : [], unitsCollected, humanReview: "REQUIRED" };
    artifacts.append("summary.json", { schema: S.schemas.summary, ...result, control: decision.control, rows, details,
      ensemble: decision.selected ? "ADMITTED" : decision.state === "QUALIFICATION_INCOMPLETE" ? "UNASSESSED" : "REJECTED", materialThresholds: "STILL_OPEN",
      seeds: S.seeds.map(s => ({ id: s.id, state: decision.selected ? "ADMITTED" : decision.state === "QUALIFICATION_INCOMPLETE" ? "UNASSESSED" : "REJECTED" })),
      hashes: Object.fromEntries((["manifest.json", "trajectory.ndjson", "diagnostic.ndjson"] as const).map(n => [n, artifacts!.hash(n)])) });
    artifacts.appendText("stdout.txt", serializeCanonicalRecord(result) + "\n");
    artifacts.execution({ schema: S.schemas.execution, ...result, runtimeHead: pre.context.head, reviewedImplementationSha: pre.context.reviewedSha,
      runtime: { node: process.version, v8: process.versions.v8 }, hashes: Object.fromEntries(artifactNames.filter(n => n !== "execution.json").map(n => [n, artifacts!.hash(n)])) });
    artifacts.close(decision.state === "QUALIFICATION_COMPLETE");
    return result;
  } catch (e) {
    const result: PhasePResult = { state: "QUALIFICATION_INCOMPLETE", selected: null, faults: [String(e)], unitsCollected, humanReview: "REQUIRED" };
    if (artifacts) {
      try { artifacts.appendText("stderr.txt", String(e) + "\n"); artifacts.execution({ schema: S.schemas.execution, ...result }); }
      catch (ioError) { result.faults = [...result.faults, `PARTIAL_METADATA_IO:${String(ioError)}`]; }
      finally {
        try { artifacts.close(false); }
        catch (ioError) { result.faults = [...result.faults, `PARTIAL_CLOSE_IO:${String(ioError)}`]; }
      }
    }
    return result;
  }
}
