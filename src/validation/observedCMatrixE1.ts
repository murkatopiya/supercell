/** Test-only E1 infrastructure and separately guarded collector. No production value imports. */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { E1_SPEC, FROZEN_E1_STORM_ONLY, FROZEN_MANIFEST_SHA256, type E1Case } from "./observedCMatrixE1Spec.js";

export type Pair = readonly [number, number];
export type Knot = readonly [number, number, number];
export type World = { readonly x: number; readonly y: number; readonly z: number };
export type Status = "PASS" | "INVALID CONTROL" | "UNEXPLAINED" | "FAIL";
export type Reference = "FL" | "EA" | "CI" | "OR" | "SI" | "PP";
export type Reason = "BASELINE_REFERENCE" | "COLUMN_UNAVAILABLE" | "UNSUPPORTED_SOURCE" | "UNEXPECTED_ANALYSIS_SUPPORT" | "EXACT_ZERO_REFERENCE" | "NONFINITE_OR_EXCEPTION" | "DEPENDENCY_INVALID";
export interface Assertion {
  id: string;
  scope: "CASE" | "MEMBER" | "CASE_PROBE_REFERENCE";
  reference: Reference;
  applicability: "APPLICABLE" | "N_A";
  reason: Reason | null;
  expected: unknown;
  actual: unknown;
  residual: unknown;
  tolerance: { id: string; value: number; units: string };
  status: Status | null;
  humanReview: "REQUIRED";
  independent: boolean;
}
export interface PreflightCheck {
  path: string;
  expected: unknown;
  actual: unknown;
  match: boolean;
  consumer?: string;
  units?: string;
}
export interface EvidenceRecord {
  id: string;
  header: Record<string, unknown>;
  values: Record<string, unknown>;
  assertions: Assertion[];
  members: EvidenceRecord[];
}
export interface Run {
  header: Record<string, unknown>;
  state: "SKIPPED" | "PREFLIGHT_BLOCKED" | "PARTIAL" | "COMPLETE";
  preflight: PreflightCheck[];
  cases: EvidenceRecord[];
  faults: { id: string; message: string }[];
  humanReview: "REQUIRED";
}

/** Presence is deliberate: empty and undefined-valued own keys are not absence. */
export function selectStage(env: Readonly<Record<string, string | undefined>>): "SKIPPED" | "E1" {
  if (!Object.hasOwn(env, "OBSERVED_C_MATRIX_STAGE")) return "SKIPPED";
  if (env.OBSERVED_C_MATRIX_STAGE !== "E1") throw new Error("OBSERVED_C_MATRIX_STAGE must be absent or exactly E1");
  if (Object.hasOwn(env, "STORM_MOTION_VALIDATION_STAGE")) throw new Error("Conflicting synthetic stage selector");
  return "E1";
}
export function digest(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}
function bytesHash(bytes: Uint8Array): string { return createHash("sha256").update(bytes).digest("hex"); }
/** Stable object ordering; arrays retain the frozen scientific order. Nonfinite faults remain explicit. */
export function serialize(value: unknown): string {
  function canonical(v: unknown): unknown {
    if (typeof v === "number" && !Number.isFinite(v)) return { numericFault: String(v) };
    if (v === undefined) return { unavailable: "UNDEFINED" };
    if (Array.isArray(v)) return v.map(canonical);
    if (v !== null && typeof v === "object") return Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b, "en")).map(([k, x]) => [k, canonical(x)]));
    return v;
  }
  return JSON.stringify(canonical(value), null, 2);
}
function equal(a: unknown, b: unknown): boolean { return serialize(a) === serialize(b); }
export function preflightEquality(path: string, expected: unknown, actual: unknown): PreflightCheck {
  return { path, expected, actual, match: equal(expected, actual) };
}
export function preflightState(checks: readonly PreflightCheck[]): "READY" | "PREFLIGHT_BLOCKED" {
  return checks.every(c => c.match) ? "READY" : "PREFLIGHT_BLOCKED";
}
export function interpolate(a: Knot, b: Knot, height: number): Pair {
  const fraction = (height - a[0]) / (b[0] - a[0]);
  return [a[1] + fraction * (b[1] - a[1]), a[2] + fraction * (b[2] - a[2])];
}
export function endpointMatrix(q0: Pair, q1: Pair, C0: Pair, alpha: number) {
  const delta: Pair = [q1[0] - q0[0], q1[1] - q0[1]];
  const Q = delta[0] * delta[0] + delta[1] * delta[1];
  const qRef: Pair = [(q0[0] + q1[0]) / 2, (q0[1] + q1[1]) / 2];
  const p: Pair = [alpha * delta[0], alpha * delta[1]];
  const r: Pair = [alpha * delta[1], -alpha * delta[0]];
  const displacement: Pair[] = [[0, 0], p, [-p[0], -p[1]], r, [-r[0], -r[1]]];
  return { delta, Q, qRef, S: Math.hypot(...delta), members: displacement.map(d => {
    const C: Pair = [C0[0] + d[0], C0[1] + d[1]];
    const reference: Pair = [qRef[0] - C[0], qRef[1] - C[1]];
    const deltaSRH = d[0] * delta[1] - d[1] * delta[0];
    return { C, reference, speed: Math.hypot(...reference), deltaSRH, normalized: deltaSRH / Q,
      recoveredDeterminant: (C[0] - C0[0]) * delta[1] - (C[1] - C0[1]) * delta[0] };
  }) };
}
export function manualWorld(wind: Pair, C: Pair = [0, 0]): World {
  return { x: wind[0] - C[0], y: 0, z: -wind[1] + C[1] };
}
export function manualAtmospheric(w: World): readonly [number, number, number] { return [w.x, -w.z, w.y]; }
export function orderedSum(values: readonly World[]): World {
  let x = 0, y = 0, z = 0;
  for (const v of values) { x += v.x; y += v.y; z += v.z; }
  return { x, y, z };
}
export function referenceBasis(wind: Pair) {
  const speed = Math.hypot(...wind);
  if (!Number.isFinite(speed)) throw new Error("Nonfinite reference wind");
  if (wind[0] === 0 && wind[1] === 0) return { speed, reciprocal: null, s: null, c: null, reason: "EXACT_ZERO_REFERENCE" as const };
  return { speed, reciprocal: 1 / speed, s: [wind[0] / speed, wind[1] / speed] as Pair,
    c: [-wind[1] / speed, wind[0] / speed] as Pair, reason: null };
}
export function rawWorldOmega(a: Knot, b: Knot): Pair {
  return [-(b[2] - a[2]) / (b[0] - a[0]), -(b[1] - a[1]) / (b[0] - a[0])];
}
/** Independent pinned Gaussian/envelope derivative; no production gradient/diagnostic calls. */
export function analyticGradient(p: World, geometry: Readonly<{ centerX: number; centerZ: number; sigma: number; baseHeight: number; topHeight: number; peakVerticalVelocity: number }> = FROZEN_E1_STORM_ONLY.updraft): Pair {
  const dx = p.x - geometry.centerX, dz = p.z - geometry.centerZ;
  const sigma2 = geometry.sigma * geometry.sigma;
  const envelope = p.y > geometry.baseHeight && p.y < geometry.topHeight
    ? Math.sin(Math.PI * (p.y - geometry.baseHeight) / (geometry.topHeight - geometry.baseHeight)) : 0;
  const w = geometry.peakVerticalVelocity * Math.exp(-(dx * dx + dz * dz) / (2 * sigma2)) * envelope;
  const gx = -dx / sigma2 * w, gz = -dz / sigma2 * w;
  return [gx === 0 ? 0 : gx, gz === 0 ? 0 : gz];
}
export function dot(a: Pair, b: Pair): number { return a[0] * b[0] + a[1] * b[1]; }
function finite(v: unknown): boolean {
  if (typeof v === "number") return Number.isFinite(v);
  if (Array.isArray(v)) return v.every(finite);
  if (v !== null && typeof v === "object") return Object.values(v).every(finite);
  return true;
}
function difference(expected: unknown, actual: unknown): unknown {
  if (typeof expected === "number" && typeof actual === "number") return actual - expected;
  if (Array.isArray(expected) && Array.isArray(actual) && expected.length === actual.length) return expected.map((v, i) => difference(v, actual[i]));
  if (expected !== null && actual !== null && typeof expected === "object" && typeof actual === "object") {
    const e = expected as Record<string, unknown>, a = actual as Record<string, unknown>;
    if (!equal(Object.keys(e).sort(), Object.keys(a).sort())) return null;
    return Object.fromEntries(Object.keys(e).map(k => [k, difference(e[k], a[k])]));
  }
  return equal(expected, actual) ? 0 : null;
}
function within(v: unknown, tolerance: number): boolean {
  if (typeof v === "number") return Number.isFinite(v) && Math.abs(v) <= tolerance;
  if (Array.isArray(v)) return v.every(x => within(x, tolerance));
  return v !== null && typeof v === "object" && Object.values(v).every(x => within(x, tolerance));
}
export function assertion(id: string, expected: unknown, actual: unknown, reference: Reference,
  tolerance = { id: "exact", value: 0, units: "1" }, scope: Assertion["scope"] = "MEMBER", independent = reference !== "PP"): Assertion {
  const residual = difference(expected, actual);
  return { id, scope, reference, applicability: "APPLICABLE", reason: null, expected, actual, residual, tolerance,
    status: finite(expected) && finite(actual) && within(residual, tolerance.value) ? "PASS" : "UNEXPLAINED", humanReview: "REQUIRED", independent };
}
export function unavailable(id: string, reason: Reason, expected: unknown = null, actual: unknown = null,
  comparison = { id: "exact", value: 0, units: "1" }): Assertion {
  return { ...assertion(id, expected, actual, "SI", comparison), applicability: "N_A", reason, status: null, residual: null, independent: false };
}
export function invalidControl(id: string, reason: Reason, actual: unknown): Assertion {
  return { ...assertion(id, "valid prerequisite", actual, "SI"), status: "INVALID CONTROL", reason, independent: false };
}
export function analysisAvailability(id: string, expected: "FULL_SUPPORT" | "COLUMN_UNAVAILABLE", actual: string): Assertion[] {
  const check = assertion(`${id}/support`, expected, actual, "SI");
  const numeric = { id: "T1", ...E1_SPEC.tolerances.T1 };
  if (expected !== actual) return [check, invalidControl(`${id}/required-support`, "UNEXPECTED_ANALYSIS_SUPPORT", actual), unavailable(`${id}/numeric`, "UNEXPECTED_ANALYSIS_SUPPORT", null, null, numeric)];
  return expected === "COLUMN_UNAVAILABLE" ? [check, unavailable(`${id}/numeric`, "COLUMN_UNAVAILABLE", null, null, numeric)] : [check];
}
function allAssertions(run: Run): Assertion[] {
  const visit = (r: EvidenceRecord): Assertion[] => [...r.assertions, ...r.members.flatMap(visit)];
  return run.cases.flatMap(visit);
}
export function summarize(run: Run) {
  const counts = () => ({ PASS: 0, "INVALID CONTROL": 0, UNEXPLAINED: 0, FAIL: 0, N_A: 0 });
  const total = counts(), byGroup: Record<string, ReturnType<typeof counts>> = {}, byCase: typeof byGroup = {}, byMember: typeof byGroup = {};
  const reasons: Record<string, number> = {};
  let independent = 0;
  for (const a of allAssertions(run)) {
    const parts = a.id.split("/");
    const group = parts.find(x => /^E1-[A-F]$/.test(x)) ?? "CONTROL";
    const key = a.applicability === "N_A" ? "N_A" : a.status!;
    for (const counter of [total, byGroup[group] ??= counts(), byCase[parts[1]] ??= counts(), byMember[`${parts[1]}/${parts[2]}`] ??= counts()]) counter[key]++;
    if (a.reason) reasons[a.reason] = (reasons[a.reason] ?? 0) + 1;
    if (a.independent && a.applicability === "APPLICABLE") independent++;
  }
  return { total, byGroup, byCase, byMember, reasons, independentAssertions: independent,
    collectedMembers: run.cases.reduce((n, c) => n + c.members.length, 0),
    uncollectedMembers: Number(run.header.expectedMembers ?? 20) - run.cases.reduce((n, c) => n + c.members.length, 0),
    blockedChecks: run.preflight.filter(c => !c.match).length, faults: run.faults.length,
    humanReview: run.humanReview, scientificClosure: "NOT_CLOSED" };
}
export function reportAndAssert(run: Run, emit: (s: string) => void): void {
  const summary = summarize(run);
  emit(serialize({ ...run, summary }));
  if (run.state !== "COMPLETE" || summary.total["INVALID CONTROL"] || summary.total.UNEXPLAINED || summary.total.FAIL || run.faults.length) {
    throw new Error(`E1 runner gate not satisfied: ${run.state}; human scientific review required`);
  }
}

const consumers = {
  updraft: "createUpdraftField", rotation: "createRotationField", lowerRadialInflow: "createLowerRadialInflowField",
  upperRadialOutflow: "createUpperRadialOutflowField", downdraft: "createDowndraftField", nearGroundOutflow: "createNearGroundRadialOutflowField",
} as const;
export function stormSnapshotChecks(actual: unknown, expected: Readonly<Record<string, Readonly<Record<string, number>>>> = FROZEN_E1_STORM_ONLY): PreflightCheck[] {
  const a = (actual ?? {}) as Record<string, Record<string, unknown> | undefined>;
  const checks: PreflightCheck[] = [preflightEquality("storm/blocks", Object.keys(expected).sort(), Object.keys(a).sort())];
  for (const [block, fields] of Object.entries(expected)) {
    checks.push(preflightEquality(`storm/${block}/keys`, Object.keys(fields).sort(), Object.keys(a[block] ?? {}).sort()));
    for (const [key, value] of Object.entries(fields)) checks.push({
      ...preflightEquality(`storm/${block}/${key}`, value, a[block]?.[key]),
      consumer: consumers[block as keyof typeof consumers] ?? block,
      units: key === "angularVelocity" ? "rad/s" : /Velocity/.test(key) ? "m/s" : /Rate/.test(key) ? "s^-1" : "m",
      match: typeof a[block]?.[key] === "number" && Number.isFinite(a[block]![key]) && a[block]![key] === value,
    });
  }
  return checks;
}
interface RawFixture { levels: { height: number; eastward: number; northward: number }[]; coverage: unknown }
function knots(raw: RawFixture): Knot[] { return raw.levels.map(k => [k.height, k.eastward, k.northward]); }
export function specIntegrityChecks(): PreflightCheck[] {
  const checks = [preflightEquality("manifest/sha256", FROZEN_MANIFEST_SHA256, digest({ spec: E1_SPEC, storm: FROZEN_E1_STORM_ONLY }))];
  for (const c of E1_SPEC.cases) {
    const reconstructed = endpointMatrix(c.q0, c.q1, E1_SPEC.C0, E1_SPEC.alpha);
    for (const key of ["delta", "Q", "qRef"] as const) checks.push(preflightEquality(`${c.id}/${key}`, c[key], reconstructed[key]));
    checks.push({ path: `${c.id}/S`, expected: c.S, actual: reconstructed.S, match: Math.abs(c.S - reconstructed.S) <= 8 * 2 ** -53 * Math.max(1, c.S) });
    c.members.forEach((m, i) => {
      checks.push(preflightEquality(`${c.id}/${m.id}/id`, E1_SPEC.memberIds[i], m.id));
      for (const key of ["C", "reference", "deltaSRH", "normalized"] as const) checks.push(preflightEquality(`${c.id}/${m.id}/${key}`, m[key], reconstructed.members[i][key]));
      checks.push({ path: `${c.id}/${m.id}/speed`, expected: m.speed, actual: reconstructed.members[i].speed, match: Math.abs(m.speed - reconstructed.members[i].speed) <= 8 * 2 ** -53 * Math.max(1, m.speed) });
    });
  }
  return checks;
}
function rawChecks(c: E1Case, raw: RawFixture, times: number[] | null): PreflightCheck[] {
  const k = knots(raw), result: PreflightCheck[] = [];
  result.push(preflightEquality(`${c.id}/coverage`, c.coverage, raw.coverage));
  result.push(preflightEquality(`${c.id}/finite-increasing`, true, k.every((v, i) => v.every(Number.isFinite) && (i === 0 || v[0] > k[i - 1][0]))));
  c.brackets.forEach((b, i) => {
    for (const side of ["lower", "upper"] as const) result.push(preflightEquality(`${c.id}/${b.height}/${side}`, b[side].knot, k[b[side].index]));
    result.push(preflightEquality(`${c.id}/${b.height}/strict-support`, true, b.lower.index + 1 === b.upper.index && k[b.lower.index][0] < b.height && b.height < k[b.upper.index][0]));
    result.push(preflightEquality(`${c.id}/${b.height}/fraction`, b.fraction, (b.height - k[b.lower.index][0]) / (k[b.upper.index][0] - k[b.lower.index][0])));
    result.push(preflightEquality(`${c.id}/${b.height}/q`, i === 0 ? c.q0 : c.q1, interpolate(k[b.lower.index], k[b.upper.index], b.height)));
  });
  const p = c.probeSegment;
  result.push(preflightEquality(`${c.id}/probe/knots`, p.knots, p.indices.map(i => k[i])));
  result.push(preflightEquality(`${c.id}/probe/support`, true, E1_SPEC.probes.every(probe => k[p.indices[0]][0] < probe.position.y && probe.position.y < k[p.indices[1]][0])));
  if (times) {
    result.push(preflightEquality(`${c.id}/TIME/aligned`, k.length, times.length));
    result.push(preflightEquality(`${c.id}/TIME/finite-increasing`, true, times.every((t, i) => Number.isFinite(t) && (i === 0 || t > times[i - 1]))));
    result.push(preflightEquality(`${c.id}/TIME/probe`, p.times, p.indices.map(i => times[i])));
    const interval = [times[0] + 40, times[times.length - 1] - 40];
    result.push(preflightEquality(`${c.id}/TIME/full-interval`, p.fullSupport, interval));
    result.push(preflightEquality(`${c.id}/TIME/FULL_SUPPORT`, true, p.indices.every(i => times[i] >= interval[0] && times[i] <= interval[1])));
  }
  return result;
}
/** Reviewed SHA is supplied only at the later code-review/execution gate. No default or design-SHA substitution. */
export interface CollectorOptions {
  env: Readonly<Record<string, string | undefined>>;
  reviewedImplementationSha: string | undefined;
  root?: string;
}
function git(root: string, args: string[]): Buffer { return execFileSync("git", args, { cwd: root, maxBuffer: 32 * 1024 * 1024 }); }
function rawPreflight(root: string, reviewedSha: string | undefined, run: Run): Map<string, RawFixture> {
  const raw = new Map<string, RawFixture>();
  run.preflight.push(...specIntegrityChecks());
  const head = git(root, ["rev-parse", "HEAD"]).toString().trim();
  Object.assign(run.header, { runtimeHead: head, reviewedImplementationSha: reviewedSha ?? null, runtime: { node: process.version, v8: process.versions.v8 } });
  run.preflight.push(preflightEquality("reviewedImplementationSha/present", true, typeof reviewedSha === "string" && /^[a-f0-9]{40}$/.test(reviewedSha)));
  if (!reviewedSha || !/^[a-f0-9]{40}$/.test(reviewedSha)) return raw;
  git(root, ["merge-base", "--is-ancestor", reviewedSha, "HEAD"]);
  git(root, ["merge-base", "--is-ancestor", E1_SPEC.freezeCommit, reviewedSha]);
  // Current implementation must be the reviewed committed implementation, including its Spec.
  for (const name of ["observedCMatrixE1Spec.ts", "observedCMatrixE1.ts", "observedCMatrixE1.validation.test.ts"]) {
    const path = `src/validation/${name}`;
    const reviewed = git(root, ["show", `${reviewedSha}:${path}`]).toString().replace(/\r\n/g, "\n");
    run.preflight.push(preflightEquality(`${path}/reviewed-working-content-digest`, digest(reviewed), digest(readFileSync(resolve(root, path), "utf8").replace(/\r\n/g, "\n"))));
  }
  // Covers every production dependency, including changes to factories' consumed fields.
  const productionDiff = git(root, ["diff", "--name-only", E1_SPEC.designBaseline, "--", "src", ":(exclude)src/validation", "package.json", "tsconfig.json", "vitest.config.ts", "vite.config.ts"]).toString().trim();
  run.preflight.push(preflightEquality("reviewed-production-config", "", productionDiff));
  function blob(path: string, hash: string): unknown {
    const committed = git(root, ["show", `HEAD:${path}`]);
    const parsed: unknown = JSON.parse(committed.toString());
    run.preflight.push(preflightEquality(`${path}/committed-SHA256`, hash, bytesHash(committed)));
    run.preflight.push(preflightEquality(`${path}/working-parsed-digest`, digest(parsed), digest(JSON.parse(readFileSync(resolve(root, path), "utf8")))));
    return parsed;
  }
  for (const c of E1_SPEC.cases) {
    const fixture = blob(c.fixturePath, c.fixtureHash) as RawFixture;
    const times = c.timePath ? (blob(c.timePath, c.timeHash!) as { times: number[] }).times : null;
    run.preflight.push(...rawChecks(c, fixture, times)); raw.set(c.id, fixture);
  }
  blob(E1_SPEC.kernel.path, E1_SPEC.kernel.hash);
  return raw;
}

function record(id: string, header: Record<string, unknown>): EvidenceRecord {
  return { id, header, values: {}, assertions: [], members: [] };
}
const tolerance = (id: keyof typeof E1_SPEC.tolerances) => {
  const t = E1_SPEC.tolerances[id];
  if (!("value" in t)) throw new Error("hypot tolerance requires its expected speed");
  return { id, value: t.value, units: t.units };
};
const worldArray = (v: World) => [v.x, v.y, v.z] as const;
const windPair = (v: { eastward: number; northward: number }): Pair => [v.eastward, v.northward];
const subtractWorld = (a: World, b: World): World => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
class GlobalPreflightMismatch extends Error {}

/** The caller must have separate human execution authorization. This function never creates it. */
export async function collectObservedE1(options: CollectorOptions): Promise<Run> {
  const selected = selectStage(options.env);
  const run: Run = {
    header: { stage: selected, matrixId: E1_SPEC.matrixId, arithmeticSpecId: E1_SPEC.arithmeticSpecId,
      implementationContractId: E1_SPEC.implementationContractId, evidenceSchemaId: E1_SPEC.evidenceSchemaId,
      manifestDigest: FROZEN_MANIFEST_SHA256, expectedMembers: 20, arithmeticBaseline: E1_SPEC.arithmeticBaseline, designBaseline: E1_SPEC.designBaseline,
      layer: E1_SPEC.layer, C0: E1_SPEC.C0, alpha: E1_SPEC.alpha, probes: E1_SPEC.probes, time: E1_SPEC.time,
      units: { heightAndPosition: "m", time: "s", atmosphericWindAndC: "m/s east/north", worldVelocity: "m/s east/up/south",
        omegaAndGradient: "s^-1", T1: "s^-2", SRHAndQ: "m^2/s^2", reciprocalSpeed: "s/m", normalized: "1" },
      tolerances: E1_SPEC.tolerances, decompositionPolicy: E1_SPEC.decompositionPolicy,
      expectedStormParameters: FROZEN_E1_STORM_ONLY, kernel: E1_SPEC.kernel,
      applicabilityManifest: { baselineDifferences: "BASELINE_REFERENCE", MooreNumericAnalysis: "10 N_A COLUMN_UNAVAILABLE", SourceT1: 40, EscAnalysisT1: 30,
        repeatedInvariants: "context/corroboration only", SRHResponses: 16 },
      humanExecutionAuthorization: "EXTERNAL_PREREQUISITE_NOT_INFERRED_FROM_SELECTOR" },
    state: selected === "SKIPPED" ? "SKIPPED" : "PREFLIGHT_BLOCKED", preflight: [], cases: [], faults: [], humanReview: "REQUIRED",
  };
  if (selected === "SKIPPED") return run;
  const root = options.root ?? process.cwd();
  try {
    const raw = rawPreflight(root, options.reviewedImplementationSha, run);
    if (preflightState(run.preflight) !== "READY") return run;

    // Importing the literal scenario is inert; compare its consumed fields before any factory or Analysis construction.
    const { DEMO_SCENARIO } = await import("../scenario/DEMO_SCENARIO.js");
    run.preflight.push(...stormSnapshotChecks(DEMO_SCENARIO.storm));
    run.header.actualStormParameters = structuredClone(DEMO_SCENARIO.storm);
    if (preflightState(run.preflight) !== "READY") return run;
    const sourceData = await import("../app/goshenObservedEnvironment.js");
    for (const c of E1_SPEC.cases) {
      const source = sourceData.exploreObservedEnvironmentRecord(c.id);
      run.preflight.push(preflightEquality(`${c.id}/Source/present`, true, source !== undefined));
      run.preflight.push(preflightEquality(`${c.id}/Source/identity`, c.sourceIdentity, source?.provenance.sourceIdentity));
      run.preflight.push(preflightEquality(`${c.id}/Source/datum`, c.heightDatum, source?.provenance.heightDatum));
      run.preflight.push(preflightEquality(`${c.id}/Source/class`, "observed-raob", source?.provenance.sourceClass));
      if (source) {
        run.preflight.push(preflightEquality(`${c.id}/Source/heights`, raw.get(c.id)!.levels.map(k => k.height), source.profile.levelHeights()));
        run.preflight.push(preflightEquality(`${c.id}/Source/coverage`, c.coverage, source.provenance.coverage));
      }
    }
    if (preflightState(run.preflight) !== "READY") return run;

    // Eager ESC filtering in this data-only module is deliberately behind all raw/config/identity preflight gates.
    const representations = await import("../app/exploreEnvironmentRepresentations.js");
    const contexts = E1_SPEC.cases.map(c => representations.exploreEnvironmentRepresentations(c.id));
    contexts.forEach((ctx, i) => {
      const c = E1_SPEC.cases[i];
      run.preflight.push(preflightEquality(`${c.id}/Analysis/identity`, c.timePath ? c.sourceIdentity : null, ctx.analysisColumn?.provenance.sourceIdentity ?? null));
      if (ctx.analysisColumn) {
        const p = ctx.analysisColumn.provenance;
        for (const [key, expected] of Object.entries(E1_SPEC.kernel.provenance)) {
          run.preflight.push(preflightEquality(`${c.id}/Analysis/${key}`, expected, p[key as keyof typeof p]));
        }
      }
    });
    if (preflightState(run.preflight) !== "READY") return run;

    const [environment, adapterModule, compositeModule, windModule, shearModule, omegaModule, decompositionModule, srhModule, hodographModule,
      coordinates, diagnosticModule, analysisQuery, updraftFactory, rotationFactory, inflowFactory, outflowFactory, downdraftFactory, groundFactory] = await Promise.all([
      import("../physics/environment/EnvironmentalWindField.js"), import("../physics/environment/StormRelativeEnvironmentalAdvectionField.js"),
      import("../core/fields/CompositeVelocityField.js"), import("../physics/environment/stormRelativeWind.js"),
      import("../physics/environment/verticalWindShear.js"), import("../physics/environment/horizontalVorticity.js"),
      import("../physics/environment/streamwiseCrosswiseVorticity.js"), import("../physics/environment/stormRelativeHelicity.js"),
      import("../physics/environment/hodograph.js"), import("../core/math/AtmosphericVelocity.js"),
      import("../physics/diagnostics/DiagnosticTiltingTendency.js"), import("../data/escHrTimeAnalysis/analysisTiltingQuery.js"),
      import("../scenario/createUpdraftField.js"), import("../scenario/createRotationField.js"), import("../scenario/createLowerRadialInflowField.js"),
      import("../scenario/createUpperRadialOutflowField.js"), import("../scenario/createDowndraftField.js"), import("../scenario/createNearGroundRadialOutflowField.js"),
    ]);
    const updraft = updraftFactory.createUpdraftField(DEMO_SCENARIO);
    const storm = [updraft, rotationFactory.createRotationField(DEMO_SCENARIO), inflowFactory.createLowerRadialInflowField(DEMO_SCENARIO),
      outflowFactory.createUpperRadialOutflowField(DEMO_SCENARIO), downdraftFactory.createDowndraftField(DEMO_SCENARIO), groundFactory.createNearGroundRadialOutflowField(DEMO_SCENARIO)] as const;
    const names = Object.keys(consumers);
    run.header.sharedOperandIdentities = names.map((name, i) => ({ name, instanceId: `E1/shared-storm/${i}/${name}` }));
    run.state = "COMPLETE";
    function checked<T>(value: T): T {
      if (!finite(value)) throw new Error(`Nonfinite production result: ${serialize(value)}`);
      return value;
    }
    function attempt<T>(r: EvidenceRecord, id: string, action: () => T): T | undefined {
      try {
        const result = action();
        if (!finite(result)) throw new Error("Nonfinite numeric result");
        return result;
      } catch (error) {
        if (error instanceof GlobalPreflightMismatch) throw error;
        run.state = "PARTIAL";
        run.faults.push({ id, message: error instanceof Error ? error.message : String(error) });
        r.assertions.push({ ...assertion(`${id}/technical-fault`, "finite supported result", String(error), "SI"), reason: "NONFINITE_OR_EXCEPTION" });
        r.assertions.push(unavailable(`${id}/dependent-work`, "NONFINITE_OR_EXCEPTION"));
        return undefined;
      }
    }
    function demand(path: string, expected: unknown, actual: unknown): void {
      const check = preflightEquality(path, expected, actual);
      if (!check.match) { run.preflight.push(check); throw new GlobalPreflightMismatch(path); }
    }
    for (const [caseIndex, c] of E1_SPEC.cases.entries()) {
      const ctx = contexts[caseIndex], profile = ctx.sourceProfile!;
      const rawKnots = knots(raw.get(c.id)!);
      const caseId = `E1/${c.id}/case`;
      const cr = record(caseId, { caseId: c.id, sourceIdentity: c.sourceIdentity, sourceProvenance: structuredClone(ctx.sourceRecord!.provenance),
        fixture: { path: c.fixturePath, hash: c.fixtureHash }, retainedTime: { path: c.timePath, hash: c.timeHash },
        heightDatum: c.heightDatum, coverage: c.coverage, Analysis: ctx.analysisColumn?.provenance ?? "COLUMN_UNAVAILABLE",
        layer: E1_SPEC.layer, q0: c.q0, q1: c.q1, delta: c.delta, Q: c.Q, qRef: c.qRef, probeSegment: c.probeSegment });
      run.cases.push(cr);
      const rawSnapshot = rawKnots.map(k => ({ height: k[0], eastward: k[1], northward: k[2] }));
      cr.values.rawSnapshot = rawSnapshot;
      const fullSnapshot = () => profile.levelHeights().map(height => ({ height, ...profile.sampleAtHeight(height) }));
      const expectedProfile = rawSnapshot.map(k => ({ ...k, vertical: 0 }));
      const expectedShear: Pair = [c.delta[0] / 2500, c.delta[1] / 2500];
      const expectedOmega: Pair = [-c.delta[1] / 2500, c.delta[0] / 2500];
      const layer = () => {
        const shear = shearModule.verticalWindShearBetween(profile, 500, 3000);
        const omega = omegaModule.horizontalVorticityFromShear(shear);
        const q0 = profile.sampleAtHeight(500), q1 = profile.sampleAtHeight(3000);
        const delta: Pair = [q1.eastward - q0.eastward, q1.northward - q0.northward];
        return { q0, q1, delta, Q: dot(delta, delta), qRef: [(q0.eastward + q1.eastward) / 2, (q0.northward + q1.northward) / 2], shear, omega };
      };
      const checkLayer = (r: EvidenceRecord, id: string, scope: Assertion["scope"], independent: boolean) => attempt(r, `${id}/E1-A`, () => {
        const actual = layer();
        r.values.layer = actual;
        for (const [key, expected] of [["q0", c.q0], ["q1", c.q1]] as const) r.assertions.push(assertion(`${id}/E1-A/${key}`, [...expected, 0], [actual[key].eastward, actual[key].northward, actual[key].vertical], "FL", tolerance("wind"), scope, independent));
        r.assertions.push(assertion(`${id}/E1-A/shear`, expectedShear, [actual.shear.shearEastward, actual.shear.shearNorthward], "EA", tolerance("finiteOmega"), scope, independent));
        r.assertions.push(assertion(`${id}/E1-A/omega`, expectedOmega, [actual.omega.omegaEastward, actual.omega.omegaNorthward], "EA", tolerance("finiteOmega"), scope, independent));
        return actual;
      });
      const snapshotCheck = (r: EvidenceRecord, id: string, scope: Assertion["scope"], initial: boolean) => attempt(r, `${id}/E1-A/snapshot`, () => {
        const actual = fullSnapshot(), hodograph = hodographModule.hodographPoints(profile);
        if (initial) { r.values.actualSnapshot = actual; r.values.hodograph = hodograph; }
        r.values.snapshotDigest = digest(actual); r.values.hodographDigest = digest(hodograph);
        const checks = [assertion(`${id}/E1-A/snapshot`, digest(expectedProfile), digest(actual), "EA", undefined, scope, initial),
          assertion(`${id}/E1-A/hodograph`, digest(rawSnapshot), digest(hodograph), "EA", undefined, scope, initial)];
        r.assertions.push(...checks);
        return checks.every(c => c.status === "PASS");
      });
      if (!snapshotCheck(cr, caseId, "CASE", true)) {
        run.state = "PARTIAL";
        cr.assertions.push(unavailable(`${caseId}/E1-A/dependent-members`, "DEPENDENCY_INVALID"));
        continue;
      }
      checkLayer(cr, caseId, "CASE", true);
      const ground = new environment.EnvironmentalWindField(profile);
      let baselineSRH: number | undefined;
      let baselineRef: Pair | undefined;
      const baselineEndpoints = new Map<number, World>();
      const baselineComposites = new Map<string, World>();
      const baselineStorm = new Map<string, readonly World[]>();
      const rawSegment = c.probeSegment.knots;
      const sourceOracleOmega = rawWorldOmega(rawSegment[0], rawSegment[1]);
      const caseReferences = E1_SPEC.probes.map(p => ({ id: p.id, point: p.position, segment: c.probeSegment,
        SourceOmega: sourceOracleOmega, gradient: analyticGradient(p.position), SourceT1: dot(sourceOracleOmega, analyticGradient(p.position)) }));
      cr.values.probeReferences = caseReferences;
      // Capture an independent, immutable filtered-input reference once; do not let changing member inputs redefine the oracle.
      const analysisReference = ctx.analysisColumn ? attempt(cr, `${caseId}/E1-F/Analysis-reference`, () => {
        const column = ctx.analysisColumn!;
        const low = column.profile.sampleAtHeight(rawSegment[0][0]), high = column.profile.sampleAtHeight(rawSegment[1][0]);
        const value = { endpoints: [low, high], omega: rawWorldOmega([rawSegment[0][0], low.eastward, low.northward], [rawSegment[1][0], high.eastward, high.northward]) };
        cr.values.AnalysisReference = structuredClone(value);
        return value;
      }) : undefined;
      for (const m of c.members) {
        const id = `E1/${c.id}/${m.id}`;
        const passedC = Object.freeze({ eastward: m.C[0], northward: m.C[1] });
        demand(`${id}/constructor-C`, m.C, [passedC.eastward, passedC.northward]);
        demand(`${id}/Source-instance`, true, sourceData.exploreEnvironmentalWindProfile(c.id) === profile);
        demand(`${id}/storm-parameters`, FROZEN_E1_STORM_ONLY, DEMO_SCENARIO.storm);
        const adapter = new adapterModule.StormRelativeEnvironmentalAdvectionField(ground, passedC);
        const operands = [adapter, ...storm] as const;
        const composite = new compositeModule.CompositeVelocityField(operands);
        const mr = record(id, { caseId: c.id, sourceIdentity: c.sourceIdentity, memberId: m.id, caseContextId: caseId,
          frozenC: m.C, constructorC: passedC, C0: E1_SPEC.C0, layer: E1_SPEC.layer, probes: E1_SPEC.probes, time: E1_SPEC.time,
          AnalysisApplicability: c.probeSegment.analysis, operandIdentities: ["member-environment", ...names], sharedStormInstances: true });
        cr.members.push(mr);
        const deltaC: Pair = [m.C[0] - E1_SPEC.C0[0], m.C[1] - E1_SPEC.C0[1]];
        const expectedResponse = manualWorld([0, 0], deltaC);
        const actualRef = attempt(mr, `${id}/E1-B`, () => {
          const ref = checked(windModule.stormRelativeWind({ eastward: c.qRef[0], northward: c.qRef[1], vertical: 0 }, passedC));
          mr.values.reference = { frozen: m.reference, actual: ref, frozenSpeed: m.speed };
          for (const [name, q] of [["reference", c.qRef], ["lower", c.q0], ["upper", c.q1]] as const) {
            const actual = checked(windModule.stormRelativeWind({ eastward: q[0], northward: q[1], vertical: 0 }, passedC));
            mr.assertions.push(assertion(`${id}/E1-B/${name}`, [q[0] - m.C[0], q[1] - m.C[1], 0], [actual.eastward, actual.northward, actual.vertical], "FL", tolerance("wind")));
          }
          if (m.id === "C0") baselineRef = windPair(ref);
          else if (baselineRef) mr.assertions.push(assertion(`${id}/E1-B/reference-response`, [-deltaC[0], -deltaC[1]], [ref.eastward - baselineRef[0], ref.northward - baselineRef[1]], "CI", tolerance("wind")));
          else mr.assertions.push(unavailable(`${id}/E1-B/reference-response`, "DEPENDENCY_INVALID"));
          mr.values.endpointAdapters = [];
          for (const [i, height] of E1_SPEC.layer.entries()) {
            const q = i === 0 ? c.q0 : c.q1;
            const actual = checked(adapter.sample({ x: 0, y: height, z: 0 }, 0));
            (mr.values.endpointAdapters as unknown[]).push({ height, actual });
            mr.assertions.push(assertion(`${id}/E1-B/adapter-${height}`, manualWorld(q, m.C), actual, "CI", tolerance("wind")));
            const converted = coordinates.worldVelocityToAtmospheric(actual);
            mr.assertions.push(assertion(`${id}/E1-B/mapping-${height}`, manualAtmospheric(actual), [converted.eastward, converted.northward, converted.vertical], "CI", tolerance("wind")));
            if (m.id === "C0") baselineEndpoints.set(height, actual);
            else if (baselineEndpoints.has(height)) mr.assertions.push(assertion(`${id}/E1-B/adapter-response-${height}`, expectedResponse, subtractWorld(actual, baselineEndpoints.get(height)!), "CI", tolerance("wind")));
            else mr.assertions.push(unavailable(`${id}/E1-B/adapter-response-${height}`, "DEPENDENCY_INVALID"));
          }
          return ref;
        });
        const actualLayer = checkLayer(mr, id, "MEMBER", false);
        if (!actualLayer) mr.assertions.push(unavailable(`${id}/E1-C/response`, "UNSUPPORTED_SOURCE"));
        else attempt(mr, `${id}/E1-C`, () => {
          const { srh } = srhModule.stormRelativeHelicityBetween(profile, passedC, 500, 3000);
          if (!Number.isFinite(srh)) throw new Error("Nonfinite SRH");
          if (m.id === "C0") { baselineSRH = srh; cr.values.baselineSRH = srh; }
          const response = baselineSRH === undefined ? null : srh - baselineSRH;
          mr.values.SRH = { baseline: baselineSRH ?? null, current: srh, response, expected: m.deltaSRH,
            residual: response === null ? null : response - m.deltaSRH, normalized: response === null ? null : response / c.Q,
            expectedNormalized: m.normalized, recoveredCDeterminant: deltaC[0] * c.delta[1] - deltaC[1] * c.delta[0], units: "m^2/s^2" };
          if (m.id === "C0") mr.assertions.push(unavailable(`${id}/E1-C/response`, "BASELINE_REFERENCE", 0, response, tolerance("SRH")));
          else if (response === null) mr.assertions.push(unavailable(`${id}/E1-C/response`, "DEPENDENCY_INVALID"));
          else {
            mr.assertions.push(assertion(`${id}/E1-C/response`, m.deltaSRH, response, "FL", tolerance("SRH")));
            mr.assertions.push(assertion(`${id}/E1-C/normalized`, m.normalized, response / c.Q, "EA", { id: "SRH/Q", value: E1_SPEC.tolerances.SRH.value / c.Q, units: "1" }, "MEMBER", false));
          }
        });
        if (!actualRef || !actualLayer) mr.assertions.push(unavailable(`${id}/E1-D/decomposition`, "DEPENDENCY_INVALID"));
        else attempt(mr, `${id}/E1-D`, () => {
          const independent = referenceBasis(m.reference), actual = referenceBasis(windPair(actualRef));
          mr.values.decomposition = { referenceBasis: independent, pipelineBasis: actual };
          mr.assertions.push(assertion(`${id}/E1-D/reference`, m.reference, windPair(actualRef), "FL", tolerance("wind")));
          mr.assertions.push(assertion(`${id}/E1-D/speed`, m.speed, actual.speed, "FL", tolerance("wind")));
          if (actual.s === null || actual.c === null) {
            mr.assertions.push(invalidControl(`${id}/E1-D/basis`, "EXACT_ZERO_REFERENCE", actual));
            mr.assertions.push(assertion(`${id}/E1-D/frozen-nonzero`, true, false, "FL"));
            mr.assertions.push(unavailable(`${id}/E1-D/projections`, "EXACT_ZERO_REFERENCE"));
            return;
          }
          if (!independent.s || !independent.c) throw new GlobalPreflightMismatch("Frozen reference unexpectedly zero");
          mr.assertions.push(assertion(`${id}/E1-D/basis-orientation`, [independent.s, independent.c], [actual.s, actual.c], "EA", tolerance("basis")));
          mr.assertions.push(assertion(`${id}/E1-D/orthonormal`, [1, 1, 0, 1], [dot(actual.s, actual.s), dot(actual.c, actual.c), dot(actual.s, actual.c), actual.s[0] * actual.c[1] - actual.s[1] * actual.c[0]], "EA", tolerance("basis")));
          if (mr.assertions.some(a => (a.id === `${id}/E1-D/reference` || a.id === `${id}/E1-A/omega`) && a.status !== "PASS")) {
            mr.assertions.push(unavailable(`${id}/E1-D/projections`, "DEPENDENCY_INVALID")); return;
          }
          const projection = checked(decompositionModule.decomposeHorizontalVorticity(actualRef, actualLayer.omega));
          const expected = [dot(expectedOmega, independent.s), dot(expectedOmega, independent.c)];
          const reconstructed: Pair = [projection.omegaStreamwise * independent.s[0] + projection.omegaCrosswise * independent.c[0], projection.omegaStreamwise * independent.s[1] + projection.omegaCrosswise * independent.c[1]];
          Object.assign(mr.values.decomposition as object, { projection, expected, reconstructed, squaredMagnitude: dot(reconstructed, reconstructed) });
          mr.assertions.push(assertion(`${id}/E1-D/projections`, expected, [projection.omegaStreamwise, projection.omegaCrosswise], "EA", tolerance("decomposition")));
          mr.assertions.push(assertion(`${id}/E1-D/reconstruction`, expectedOmega, reconstructed, "OR", tolerance("decomposition")));
          mr.assertions.push(assertion(`${id}/E1-D/squared-magnitude`, dot(expectedOmega, expectedOmega), projection.omegaStreamwise ** 2 + projection.omegaCrosswise ** 2, "OR", tolerance("squaredMagnitude")));
        });
        const probeRecords: unknown[] = [];
        mr.values.probes = probeRecords;
        for (const [probeIndex, probe] of E1_SPEC.probes.entries()) {
          const p = probe.position, pid = `${id}/E1-E/${probe.id}`;
          const pr: Record<string, unknown> = { id: probe.id, point: p, time: 0, constructorC: passedC };
          probeRecords.push(pr);
          attempt(mr, pid, () => {
            demand(`${pid}/shared-operands`, true, operands.slice(1).every((field, i) => field === storm[i]));
            const samples: { name: string; value: World }[] = [];
            pr.composition = { operands: samples };
            const sampled = operands.map((field, i) => {
              const value = field.sample(p, 0);
              samples.push({ name: i === 0 ? "environment" : names[i - 1], value });
              return checked(value);
            });
            const total = checked(composite.sample(p, 0)), sum = checked(orderedSum(sampled));
            Object.assign(pr.composition as object, { total, orderedSum: sum });
            mr.assertions.push(assertion(`${pid}/ordered-sum`, sum, total, "PP", tolerance("wind")));
            const q = interpolate(rawSegment[0], rawSegment[1], p.y);
            mr.assertions.push(assertion(`${pid}/environment`, manualWorld(q, m.C), sampled[0], "CI", tolerance("wind")));
            if (m.id === "C0") {
              baselineStorm.set(probe.id, sampled.slice(1)); baselineComposites.set(probe.id, total);
              mr.assertions.push(unavailable(`${pid}/total-response`, "BASELINE_REFERENCE", [0, 0, 0], [0, 0, 0], tolerance("wind")));
            } else {
              const previousStorm = baselineStorm.get(probe.id), previousTotal = baselineComposites.get(probe.id);
              if (!previousStorm || !previousTotal) { mr.assertions.push(unavailable(`${pid}/total-response`, "DEPENDENCY_INVALID")); return; }
              const sameStorm = assertion(`${pid}/storm-invariance`, previousStorm, sampled.slice(1), "PP", tolerance("wind"));
              mr.assertions.push(sameStorm);
              if (sameStorm.status !== "PASS") { mr.assertions.push(unavailable(`${pid}/total-response`, "DEPENDENCY_INVALID")); return; }
              const response = subtractWorld(total, previousTotal);
              pr.totalResponse = response;
              mr.assertions.push(assertion(`${pid}/total-response`, expectedResponse, response, "CI", tolerance("wind")));
              const converted = coordinates.worldVelocityToAtmospheric(response);
              mr.assertions.push(assertion(`${pid}/atmospheric-response`, [-deltaC[0], -deltaC[1], 0], [converted.eastward, converted.northward, converted.vertical], "CI", tolerance("wind"), "MEMBER", false));
            }
          });
          const fid = `${id}/E1-F/${probe.id}`, reference = caseReferences[probeIndex];
          attempt(mr, `${fid}/Source`, () => {
            const diagnostic = new diagnosticModule.DiagnosticTiltingTendency({ profile, updraft });
            demand(`${fid}/Source/context`, true, diagnostic.profile === profile && diagnostic.updraft === storm[0]);
            const segment = diagnosticModule.soundingSegmentContainingHeight(profile, p.y);
            pr.Source = { segment, referenceId: `${caseId}/${probe.id}`, support: segment ? "SUPPORTED" : "UNSUPPORTED_SOURCE" };
            const segmentCheck = assertion(`${fid}/Source/segment`, { hLo: rawSegment[0][0], hHi: rawSegment[1][0] }, segment, "EA", undefined, "MEMBER", m.id === "C0" && probeIndex === 0);
            mr.assertions.push(segmentCheck);
            if (segmentCheck.status !== "PASS" || !segment) {
              mr.assertions.push(invalidControl(`${fid}/Source/support`, "UNSUPPORTED_SOURCE", segment));
              mr.assertions.push(unavailable(`${fid}/Source/numeric`, "UNSUPPORTED_SOURCE")); return;
            }
            const shear = checked(shearModule.verticalWindShearBetween(profile, segment.hLo, segment.hHi));
            const omega = checked(diagnosticModule.worldHorizontalVorticityFromAtmospheric(omegaModule.horizontalVorticityFromShear(shear)));
            const gradient = checked(updraft.horizontalGradientOfVerticalVelocity(p, 0));
            const value = checked(diagnostic.sample(p, 0));
            pr.Source = { segment, omega, gradient, T1: value, referenceId: `${caseId}/${probe.id}`, support: "SUPPORTED" };
            const unique = m.id === "C0";
            mr.assertions.push(assertion(`${fid}/Source/omega`, sourceOracleOmega, [omega.omegaX, omega.omegaZ], "EA", tolerance("localOmega"), "MEMBER", unique && probeIndex === 0));
            mr.assertions.push(assertion(`${fid}/Source/gradient`, reference.gradient, [gradient.dVyDx, gradient.dVyDz], "EA", tolerance("gradient"), "MEMBER", unique));
            mr.assertions.push(assertion(`${fid}/Source/T1`, reference.SourceT1, value, "OR", tolerance("T1"), "MEMBER", unique));
          });
          attempt(mr, `${fid}/Analysis`, () => {
            const column = ctx.analysisColumn;
            const actual = analysisQuery.queryAnalysisTiltingExplanationAt(column, updraft, p, 0);
            pr.Analysis = actual;
            checked(actual);
            mr.assertions.push(...analysisAvailability(`${fid}/Analysis`, c.probeSegment.analysis, actual.status).map(a => ({ ...a, independent: a.independent && m.id === "C0" && probeIndex === 0 })));
            if (c.probeSegment.analysis !== "FULL_SUPPORT" || actual.status !== "FULL_SUPPORT" || !column) return;
            const segmentCheck = assertion(`${fid}/Analysis/segment`, { hLo: rawSegment[0][0], hHi: rawSegment[1][0] }, actual.segment, "EA", undefined, "MEMBER", m.id === "C0" && probeIndex === 0);
            mr.assertions.push(segmentCheck);
            if (segmentCheck.status !== "PASS") { mr.assertions.push(unavailable(`${fid}/Analysis/numeric`, "DEPENDENCY_INVALID")); return; }
            // Deliberately shared filtered profile input, independent endpoint slope; no native-vorticity or explanation oracle.
            const low = checked(column.profile.sampleAtHeight(rawSegment[0][0])), high = checked(column.profile.sampleAtHeight(rawSegment[1][0]));
            const independentOmega = rawWorldOmega([rawSegment[0][0], low.eastward, low.northward], [rawSegment[1][0], high.eastward, high.northward]);
            if (!analysisReference) { mr.assertions.push(unavailable(`${fid}/Analysis/numeric`, "DEPENDENCY_INVALID")); return; }
            const unchanged = assertion(`${fid}/Analysis/unchanged-filtered-inputs`, analysisReference.endpoints, [low, high], "PP", tolerance("wind"));
            mr.assertions.push(unchanged);
            if (unchanged.status !== "PASS") { mr.assertions.push(unavailable(`${fid}/Analysis/numeric`, "DEPENDENCY_INVALID")); return; }
            const expectedT1 = dot(independentOmega, reference.gradient);
            pr.AnalysisReference = { filteredEndpoints: [low, high], omega: independentOmega, gradient: reference.gradient, T1: expectedT1, scope: "shared filtered input; not filter accuracy" };
            const unique = m.id === "C0";
            mr.assertions.push(assertion(`${fid}/Analysis/omega`, independentOmega, [actual.worldHorizontalVorticity.omegaX, actual.worldHorizontalVorticity.omegaZ], "EA", tolerance("localOmega"), "MEMBER", unique && probeIndex === 0));
            mr.assertions.push(assertion(`${fid}/Analysis/gradient`, reference.gradient, [actual.updraftHorizontalGradient.dVyDx, actual.updraftHorizontalGradient.dVyDz], "EA", tolerance("gradient"), "MEMBER", false));
            mr.assertions.push(assertion(`${fid}/Analysis/T1`, expectedT1, actual.tiltingTendency, "OR", tolerance("T1"), "MEMBER", unique));
          });
        }
        if (!snapshotCheck(mr, id, "MEMBER", false)) throw new GlobalPreflightMismatch(`${id}/Source changed during member collection`);
        demand(`${id}/after/storm-parameters`, FROZEN_E1_STORM_ONLY, DEMO_SCENARIO.storm);
      }
      snapshotCheck(cr, `${caseId}/after-sweep`, "CASE", false);
      checkLayer(cr, `${caseId}/after-sweep`, "CASE", false);
    }
  } catch (error) {
    run.state = run.cases.length === 0 ? "PREFLIGHT_BLOCKED" : "PARTIAL";
    run.faults.push({ id: "E1/global-stop", message: error instanceof Error ? error.message : String(error) });
    if (error instanceof GlobalPreflightMismatch) run.header.invalidatedByGlobalPreflightMismatch = true;
  }
  return run;
}
