import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, lstatSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import type { ExploreLab } from "../../src/app/createExploreLab.js";
import type * as TypeScript from "typescript";

// Definitions only: importing this module never reads/writes files or creates a lab.
export const OPT_IN = "LEARN_DEMO_SEED_VERIFICATION";
export const OUTPUT_ENV = "LEARN_DEMO_SEED_VERIFICATION_OUTPUT";
const DT = 0.1;
const STEPS = 1200;
const CHECKPOINTS = [0, 300, 600, 900, 1200] as const;
type Role = "A" | "B1" | "B2";
type Point = { x: number; y: number; z: number };
const SEEDS: Record<Role, Point> = {
  A: { x: 0, y: 1000, z: 4000 },
  B1: { x: 0, y: 1000, z: 6000 },
  B2: { x: 2400, y: 1000, z: 0 },
};
const CASES: readonly (readonly Role[])[] = [["A"], ["B1"], ["B2"], ["A", "B1"], ["A", "B2"]];

// Reviewed implementation bytes, not a Governance freeze/pin. Any drift needs review.
const SOURCE_BASELINE: Record<string, string> = {
  "src/app/createExploreLab.ts": "87a53935e1ad636094ada7daeb4a17cfbe5131c64c348c146457818c1a97290b",
  "src/app/composeDemoTracerSimulation.ts": "fbaa5fb4003d42bd2af84ae024f9f6916ae5619d95bc38f9193b98b4f0e5f24a",
  "src/simulation/Simulation.ts": "d92120c5313e87b6cddd08a534c4d4fe1055363307a65f73b3ecb727b855ebb8",
  "src/simulation/TracerPathHistory.ts": "48496e2f5a21bc4739bf3add3549e2b52f9b64acf60c6df8df96d6189c740dc3",
  "src/scenario/DEMO_SCENARIO.ts": "0892ecef238a96720bd9853b3da2903066107d96668ecf6c26cd226a64340b9a",
  "src/ui/tracer/advanceLaboratoryFixedStep.ts": "4f8208964bdc48cd009c6ef216e6efe0f90bdefd1033976d59c3d3632b425810",
  "src/simulation/AtmosphericTracerDomain.ts": "a7cdf6b4df1a06083c04836c24ddbe1f973bd50fc38eb3a9ef5b0f9b1b24a20e",
  "src/core/integrators/EulerIntegrator.ts": "b4048c63e4dc9b23cbd9c610e533bd5fdf80555dcb74245020b609e9634d8d12",
};

export class CollectorRefusal extends Error {}
function requireCondition(value: unknown, message: string): asserts value {
  if (!value) throw new Error(message);
}
function sha(bytes: Uint8Array): string { return createHash("sha256").update(bytes).digest("hex"); }
function portable(path: string): string { return path.split(sep).join("/"); }
function within(root: string, target: string): boolean {
  const rel = relative(root, target);
  return rel !== "" && rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel);
}
function present(path: string): boolean {
  try { lstatSync(path); return true; }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return false; throw error; }
}

/** Trusted local checkout only, not protection against malicious concurrent filesystem mutation.
 * Read-only preflight rejects symlinks and existing targets, including broken links. */
export function validateOutputTarget(repoRoot: string, outputDirectory: string | undefined): string {
  if (!outputDirectory || !isAbsolute(outputDirectory)) {
    throw new CollectorRefusal("An explicit absolute new output directory is required");
  }
  const root = realpathSync(repoRoot);
  const target = resolve(outputDirectory);
  if (present(target)) throw new CollectorRefusal("Output target already exists");
  const evidenceRoot = join(root, "artifacts", "learn-demo-seed-verification");
  if (!within(evidenceRoot, target)) throw new CollectorRefusal("Output must be below artifacts/learn-demo-seed-verification/");
  let cursor = dirname(target);
  while (within(root, cursor)) {
    if (present(cursor) && (lstatSync(cursor).isSymbolicLink() || !lstatSync(cursor).isDirectory())) {
      throw new CollectorRefusal("Output ancestry must contain only ordinary directories");
    }
    cursor = dirname(cursor);
  }
  return target;
}

type CapturedFile = { path: string; sha256: string; bytes: Buffer };
type SourceCapture = {
  files: CapturedFile[];
  head: string;
  trackedDiff: string;
  status: string;
  externalPackages: { name: string; version: string; manifestSha256: string }[];
};

/** Static inspection only: includes literal dynamic imports and import-type dependencies.
 * Computed imports fail closed rather than claiming an exhaustive captured closure. */
export function sourceImports(ts: typeof TypeScript, text: string, filename = "source.ts"): string[] {
  const file = ts.createSourceFile(filename, text, ts.ScriptTarget.Latest, true,
    filename.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const imports = new Set<string>();
  const literal = (node: TypeScript.Node | undefined) => {
    requireCondition(node && ts.isStringLiteralLike(node), "Non-literal module dependency cannot be captured");
    imports.add(node.text);
  };
  const visit = (node: TypeScript.Node): void => {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      if (node.moduleSpecifier) literal(node.moduleSpecifier);
    } else if (ts.isImportEqualsDeclaration(node) && ts.isExternalModuleReference(node.moduleReference)) {
      literal(node.moduleReference.expression);
    } else if (ts.isImportTypeNode(node)) {
      requireCondition(ts.isLiteralTypeNode(node.argument), "Non-literal import type");
      literal(node.argument.literal);
    } else if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword
      || (ts.isIdentifier(node.expression) && node.expression.text === "require"))) {
      requireCondition(node.arguments.length === 1, "Unsupported module dependency arguments");
      literal(node.arguments[0]);
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  return [...imports];
}

// Exported for read-only infrastructure inspection; never imports production modules.
export async function captureSources(root: string): Promise<SourceCapture> {
  const ts = await import("typescript");
  const entries = [
    "tools/learn-demo-seed-verification/collector.ts",
    "tools/learn-demo-seed-verification/collector.run.test.ts",
    "tools/learn-demo-seed-verification/vitest.config.ts",
    "src/app/createExploreLab.ts", "src/ui/tracer/advanceLaboratoryFixedStep.ts",
    "src/scenario/DEMO_SCENARIO.ts", "src/explore/exploreEnvironmentIdentity.ts",
  ];
  const files = new Map<string, CapturedFile>();
  const packages = new Set<string>(["typescript", "vite", "vitest"]);
  const pending = [...entries];
  const options = { moduleResolution: ts.ModuleResolutionKind.Bundler, resolveJsonModule: true, allowJs: false };
  const capture = (rel: string) => {
    const path = join(root, rel);
    requireCondition(!lstatSync(path).isSymbolicLink() && within(root, realpathSync(path)), `Unsafe source path: ${rel}`);
    const bytes = readFileSync(path);
    const file = { path: portable(rel), sha256: sha(bytes), bytes };
    files.set(file.path, file);
    return file;
  };
  while (pending.length) {
    const rel = portable(pending.pop()!);
    if (files.has(rel)) continue;
    requireCondition(rel.startsWith("src/") || rel.startsWith("tools/learn-demo-seed-verification/"), `Out-of-scope source: ${rel}`);
    const file = capture(rel);
    if (rel.endsWith(".json")) continue;
    for (const specifier of sourceImports(ts, file.bytes.toString("utf8"), rel)) {
      if (specifier.startsWith("node:")) continue;
      if (!specifier.startsWith(".")) {
        packages.add(specifier.startsWith("@") ? specifier.split("/").slice(0, 2).join("/") : specifier.split("/")[0]!);
        continue;
      }
      const resolved = ts.resolveModuleName(specifier, join(root, rel), options, ts.sys).resolvedModule;
      requireCondition(resolved && within(root, resolved.resolvedFileName), `Unresolved local import: ${rel}: ${specifier}`);
      pending.push(portable(relative(root, resolved.resolvedFileName)));
    }
  }
  for (const rel of ["package.json", "package-lock.json", "tsconfig.json", "vitest.config.ts",
    "tools/learn-demo-seed-verification/tsconfig.json"]) capture(rel);
  for (const [rel, expected] of Object.entries(SOURCE_BASELINE)) {
    requireCondition(files.get(rel)?.sha256 === expected, `Reviewed source drift: ${rel}`);
  }
  const externalPackages = [...packages].sort().map(name => {
    const bytes = readFileSync(join(root, "node_modules", name, "package.json"));
    const metadata = JSON.parse(bytes.toString("utf8")) as { version: string };
    return { name, version: metadata.version, manifestSha256: sha(bytes) };
  });
  if (existsSync(join(root, "node_modules", ".package-lock.json"))) capture("node_modules/.package-lock.json");
  const git = (...args: string[]) => execFileSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  const sourcePaths = [...files.keys()].filter(p => !p.startsWith("node_modules/"));
  return {
    files: [...files.values()].sort((a, b) => a.path.localeCompare(b.path)),
    head: git("rev-parse", "HEAD").trim(),
    trackedDiff: git("diff", "HEAD", "--binary", "--", ...sourcePaths),
    status: git("status", "--porcelain=v1", "--untracked-files=all", "--", ...sourcePaths),
    externalPackages,
  };
}

function unchanged(root: string, capture: SourceCapture): void {
  for (const file of capture.files) {
    requireCondition(sha(readFileSync(join(root, file.path))) === file.sha256, `Source changed during invocation: ${file.path}`);
  }
  for (const pkg of capture.externalPackages) {
    requireCondition(sha(readFileSync(join(root, "node_modules", pkg.name, "package.json"))) === pkg.manifestSha256, `Dependency manifest changed: ${pkg.name}`);
  }
}

type MarkerState = { tracerId: number; role: Role; position: Point; age: number; active: boolean };
type State = { step: number; nominalTime: number; clockTime: number; markers: MarkerState[] };
type Sample = { position: Point; simulationTime: number };
type Termination = { role: Role; step: number; timeBounds: [number, number]; detectionTime: number; position: Point; sample: Sample };
export type CaseResult = {
  id: string; roles: readonly Role[]; status: "not-run" | "complete" | "interrupted";
  stepsCompleted: number; states: State[];
  lastStartedStep: number | null; lastCompletedStep: number | null; lastSnapshotStep: number | null;
  failureObservation: { clockTime: number | null; markers: MarkerState[]; errors: string[] } | null;
  history: { lane: number; samples: readonly Sample[]; appendedAtSteps: (number | null)[] }[];
  mapping: { role: Role; tracerId: number; lane: number; seed: Point }[];
  checkpoints: { step: number; stateIndex: number | null }[];
  terminations: Termination[];
  integrity: "not-checked" | "consistent" | "inconsistent";
  errors: string[];
  // A fixed-step helper may have mutated Simulation without a saved snapshot.
  // False does not mean all step checks passed; see status, integrity and errors.
  unrecordedMutationPossible: boolean;
};
export function emptyCase(roles: readonly Role[]): CaseResult {
  return { id: roles.join("/"), roles: [...roles], status: "not-run", stepsCompleted: 0,
    lastStartedStep: null, lastCompletedStep: null, lastSnapshotStep: null, failureObservation: null,
    states: [], history: [], mapping: [], checkpoints: CHECKPOINTS.map(step => ({ step, stateIndex: null })),
    terminations: [], integrity: "not-checked", errors: [], unrecordedMutationPossible: false };
}
function finite(value: number, label: string): number {
  requireCondition(Number.isFinite(value), `Non-finite ${label}`); return value;
}
function point(position: Point): Point {
  return { x: finite(position.x, "x"), y: finite(position.y, "y"), z: finite(position.z, "z") };
}
function samePoint(a: Point, b: Point): boolean { return a.x === b.x && a.y === b.y && a.z === b.z; }

function snapshot(lab: ExploreLab, roles: readonly Role[], step: number): State {
  requireCondition(lab.simulation.particles.length === roles.length && lab.pathHistory.tracerCount === roles.length
    && lab.session.seeds.length === roles.length, "Particle/seed/history count mismatch");
  return { step, nominalTime: step * DT, clockTime: finite(lab.simulation.clock.time, "clock"),
    markers: lab.simulation.particles.map((p, lane) => ({ tracerId: p.tracerId, role: roles[lane]!,
      position: point(p.position), age: finite(p.age, "age"), active: p.active })) };
}

export function checkRecorded(result: CaseResult): void {
  requireCondition(result.status === "complete" && !result.unrecordedMutationPossible
    && result.stepsCompleted === STEPS && result.lastStartedStep === STEPS
    && result.lastCompletedStep === STEPS && result.lastSnapshotStep === STEPS
    && result.failureObservation === null, "Incomplete step boundaries");
  requireCondition(CASES.some(roles => roles.join("/") === result.id && roles.join("/") === result.roles.join("/")), "Invalid case roles");
  requireCondition(result.states.length === STEPS + 1, "Missing completed-step states");
  requireCondition(result.mapping.length === result.roles.length && result.history.length === result.roles.length
    && new Set(result.mapping.map(m => m.tracerId)).size === result.roles.length, "Invalid mapping cardinality/IDs");
  requireCondition(result.checkpoints.length === CHECKPOINTS.length && CHECKPOINTS.every((step, index) =>
    result.checkpoints[index]?.step === step && result.checkpoints[index]?.stateIndex === step), "Invalid checkpoints");
  result.states.forEach((state, index) => {
    requireCondition(state.step === index && state.nominalTime === index * DT
      && state.clockTime === (index === 0 ? 0 : result.states[index - 1]!.clockTime + DT), "Invalid state sequence/time");
    requireCondition(state.markers.length === result.roles.length, "Invalid marker cardinality");
    state.markers.forEach((marker, lane) => {
      const mapping = result.mapping[lane]!;
      requireCondition(mapping.role === result.roles[lane] && mapping.lane === lane
        && samePoint(mapping.seed, SEEDS[mapping.role]) && marker.role === mapping.role
        && marker.tracerId === mapping.tracerId, "Role/ID/lane mismatch");
      point(marker.position); finite(marker.age, "age");
      requireCondition(typeof marker.active === "boolean", "Invalid active state");
      if (index === 0) requireCondition(marker.active && marker.age === 0 && samePoint(marker.position, mapping.seed), "Invalid birth state");
    });
  });
  const transitions: { lane: number; step: number }[] = [];
  for (let lane = 0; lane < result.roles.length; lane++) {
    const history = result.history[lane]!;
    requireCondition(history.lane === lane, "Duplicate/misordered history lane");
    const expectedSteps = [0];
    for (let step = 1; step <= STEPS; step++) {
      const before = result.states[step - 1]!.markers[lane]!;
      const after = result.states[step]!.markers[lane]!;
      if (before.active) expectedSteps.push(step);
      else requireCondition(!after.active && after.age === before.age && samePoint(after.position, before.position), "Inactive tracer changed/reactivated");
      if (before.active && !after.active) transitions.push({ lane, step });
    }
    requireCondition(history.samples.length === history.appendedAtSteps.length, "History/append association mismatch");
    requireCondition(history.samples.length === expectedSteps.length
      && history.appendedAtSteps.every((step, index) => step === expectedSteps[index]), "Missing/duplicate sample-step association");
    for (let index = 0; index < history.samples.length; index++) {
      const sample = history.samples[index]!;
      const state = result.states[expectedSteps[index]!]!;
      requireCondition(sample.simulationTime === state.clockTime && samePoint(sample.position, state.markers[lane]!.position), "Recorder/state mismatch");
    }
  }
  requireCondition(result.terminations.length === transitions.length, "Missing/duplicate termination");
  for (const { lane, step } of transitions) {
    const state = result.states[step]!;
    const marker = state.markers[lane]!;
    const matches = result.terminations.filter(t => t.role === marker.role && t.step === step);
    requireCondition(matches.length === 1, "Missing/duplicate transition record");
    const terminal = matches[0]!;
    const last = result.history[lane]!.samples.at(-1)!;
    requireCondition(marker.position.y === 0 && terminal.detectionTime === state.clockTime
      && terminal.timeBounds[0] === result.states[step - 1]!.clockTime && terminal.timeBounds[1] === state.clockTime
      && samePoint(terminal.position, marker.position) && samePoint(terminal.sample.position, last.position)
      && terminal.sample.simulationTime === last.simulationTime && last.simulationTime === state.clockTime, "Invalid terminal sample/record");
  }
}

async function collectCase(
  result: CaseResult,
  modules: {
    createExploreLab: typeof import("../../src/app/createExploreLab.js").createExploreLab;
    advanceLaboratoryFixedStep: typeof import("../../src/ui/tracer/advanceLaboratoryFixedStep.js").advanceLaboratoryFixedStep;
    demoIdentity: typeof import("../../src/explore/exploreEnvironmentIdentity.js").EXPLORE_ENVIRONMENT_DEMO_PRESCRIBED;
  },
): Promise<void> {
  let lab: ExploreLab | undefined;
  const appended: number[][] = result.roles.map(() => []);
  result.status = "interrupted";
  try {
    // No renderer is constructed; slots are not claimed as scene verification.
    lab = modules.createExploreLab({ tracerSlotCount: 0, addTracerSlot() {}, removeLastTracerSlot() {},
      clearTracerSlots() {}, syncReleasePreview() {} }, modules.demoIdentity, { eastward: 10, northward: 0 });
    requireCondition(lab.environmentIdentity === modules.demoIdentity && lab.stormMotion.eastward === 10
      && lab.stormMotion.northward === 0 && lab.analysisColumn === null, "Wrong public lab configuration");
    requireCondition(lab.simulation.clock.time === 0 && lab.simulation.particles.length === 0
      && lab.pathHistory.tracerCount === 0 && lab.session.seeds.length === 0, "Non-empty initial lab");
    for (const role of result.roles) lab.session.releasePoint({ ...SEEDS[role] });
    const initial = snapshot(lab, result.roles, 0);
    requireCondition(initial.clockTime === 0, "Release advanced the initial clock");
    initial.markers.forEach((p, lane) => {
      requireCondition(p.active && p.age === 0 && samePoint(p.position, SEEDS[p.role]), "Invalid initial state");
      requireCondition(lab!.pathHistory.sampleCountFor(lane) === 1, "Duplicate/missing birth sample");
      appended[lane]!.push(0);
      result.mapping.push({ role: p.role, tracerId: p.tracerId, lane, seed: { ...SEEDS[p.role] } });
    });
    requireCondition(new Set(initial.markers.map(p => p.tracerId)).size === result.roles.length, "Duplicate tracer identity");
    result.states.push(initial);
    result.lastCompletedStep = 0;
    result.lastSnapshotStep = 0;
    for (let step = 1; step <= STEPS; step++) {
      const previous = result.states[result.states.length - 1]!;
      const counts = result.roles.map((_, lane) => lab!.pathHistory.sampleCountFor(lane));
      result.unrecordedMutationPossible = true;
      result.lastStartedStep = step;
      modules.advanceLaboratoryFixedStep(lab.simulation, DT, {
        pathHistory: lab.pathHistory, visualAirflowPopulation: lab.visualAirflowPopulation,
      });
      result.lastCompletedStep = step;
      result.stepsCompleted = step;
      const state = snapshot(lab, result.roles, step);
      result.states.push(state);
      result.lastSnapshotStep = step;
      // Simulation now has a saved snapshot; subsequent step checks may still fail.
      result.unrecordedMutationPossible = false;
      requireCondition(state.clockTime === previous.clockTime + DT, "Unexpected clock progression");
      state.markers.forEach((marker, lane) => {
        const before = previous.markers[lane]!;
        requireCondition(marker.tracerId === before.tracerId, "Tracer identity changed");
        const count = lab!.pathHistory.sampleCountFor(lane);
        requireCondition(count === counts[lane]! + (before.active ? 1 : 0), "Unexpected recorder append/stride");
        if (before.active) appended[lane]!.push(step);
        else requireCondition(!marker.active && marker.age === before.age && samePoint(marker.position, before.position), "Inactive tracer changed");
        if (before.active && !marker.active) {
          const samples = lab!.pathHistory.samplesFor(lane);
          const sample = samples[samples.length - 1]!;
          requireCondition(marker.position.y === 0 && samePoint(marker.position, sample.position)
            && sample.simulationTime === state.clockTime, "Invalid terminal sample");
          result.terminations.push({ role: marker.role, step, timeBounds: [previous.clockTime, state.clockTime],
            detectionTime: state.clockTime, position: point(marker.position),
            sample: { position: point(sample.position), simulationTime: sample.simulationTime } });
        }
      });
    }
    result.status = "complete";
  } catch (error) {
    result.errors.push(String(error));
    result.integrity = "inconsistent";
    if (lab) {
      // This observation is never promoted to a completed-step snapshot or used to
      // reconstruct missing append associations/termination events.
      const observation: NonNullable<CaseResult["failureObservation"]> = { clockTime: null, markers: [], errors: [] };
      try { observation.clockTime = finite(lab.simulation.clock.time, "failure clock"); }
      catch (failure) { observation.errors.push(String(failure)); }
      lab.simulation.particles.forEach((p, lane) => {
        try { observation.markers.push({ tracerId: p.tracerId, role: result.roles[lane]!,
          position: point(p.position), age: finite(p.age, "failure age"), active: p.active }); }
        catch (failure) { observation.errors.push(`Marker ${lane}: ${String(failure)}`); }
      });
      result.failureObservation = observation;
    }
  } finally {
    if (lab) {
      for (let lane = 0; lane < lab.pathHistory.tracerCount; lane++) try {
        const samples = lab.pathHistory.samplesFor(lane);
        result.history.push({ lane, samples,
          appendedAtSteps: samples.map((_, index) => appended[lane]?.[index] ?? null) });
      } catch (error) {
        result.errors.push(`History lane ${lane} capture: ${String(error)}`);
        result.status = "interrupted";
        result.integrity = "inconsistent";
      }
    }
    result.checkpoints = CHECKPOINTS.map(step => ({ step, stateIndex: result.states[step]?.step === step ? step : null }));
  }
  if (result.status === "complete") {
    try { checkRecorded(result); result.integrity = "consistent"; }
    catch (error) { result.errors.push(String(error)); result.integrity = "inconsistent"; result.status = "interrupted"; }
  }
}

/** Sole execution entry. No test seam or dependency injection can bypass the process gate. */
export async function runCollector(options: { outputDirectory?: string } = {}): Promise<string> {
  if (process.env[OPT_IN] !== "collect") throw new CollectorRefusal(`Refusing collection: ${OPT_IN} must explicitly equal collect`);
  const root = realpathSync(resolve(dirname(fileURLToPath(import.meta.url)), "../.."));
  const output = validateOutputTarget(root, options.outputDirectory ?? process.env[OUTPUT_ENV]);
  const sources = await captureSources(root);
  unchanged(root, sources);
  // Atomic reservation of a new leaf after preflight; never reuse an existing run.
  mkdirSync(dirname(output), { recursive: true });
  validateOutputTarget(root, output);
  mkdirSync(output);
  const checksums: Record<string, string> = {};
  const write = (path: string, bytes: Buffer | string) => {
    const data = typeof bytes === "string" ? Buffer.from(bytes, "utf8") : bytes;
    const target = join(output, path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, data, { flag: "wx" });
    checksums[portable(path)] = sha(data);
  };
  for (const file of sources.files) write(`source-snapshot/${file.path}`, file.bytes);
  write("provenance.json", JSON.stringify({
    schema: "learn-demo-seed-provenance/v1", head: sources.head, trackedDiff: sources.trackedDiff,
    status: sources.status, invocation: process.argv, runtime: { versions: process.versions, platform: process.platform, arch: process.arch },
    files: sources.files.map(({ path, sha256, bytes }) => ({ path, sha256, size: bytes.length })),
    externalPackages: sources.externalPackages,
    trustBoundary: "Trusted local working copy; exclusive creation prevents accidental overwrite, not malicious concurrent filesystem modification.",
    limits: "Static literal local import closure (including dynamic imports and import types), exact captured raw source bytes and pre/post disk checks are distinct from runtime observations. Computed module dependencies are refused. Vitest/Vite resolution and transformation are trusted; transformed executable bytes are not captured/attested. External package implementation bytes are not archived or independently attested; lockfile and installed manifests identify dependencies.",
  }, null, 2));
  const result = { schema: "learn-demo-seed-result/v1", runId: basename(output), createdAt: new Date().toISOString(),
    verificationClass: "developer-behavior-observation-not-scientific-qualification",
    provenance: "provenance.json", configuration: {} as Record<string, unknown>,
    provenanceConsistency: "consistent" as "consistent" | "inconsistent",
    status: "interrupted" as "complete" | "interrupted", errors: [] as string[], cases: CASES.map(emptyCase) };
  try {
    // Lazy production imports happen only after the gate, reservation and source capture.
    const factory = await import("../../src/app/createExploreLab.js");
    const advance = await import("../../src/ui/tracer/advanceLaboratoryFixedStep.js");
    const identity = await import("../../src/explore/exploreEnvironmentIdentity.js");
    const { DEMO_SCENARIO } = await import("../../src/scenario/DEMO_SCENARIO.js");
    unchanged(root, sources);
    requireCondition(DEMO_SCENARIO.simulation.timestep === DT && DEMO_SCENARIO.stormMotion.eastward === 10
      && DEMO_SCENARIO.stormMotion.northward === 0, "Demo configuration drift");
    result.configuration = { demo: structuredClone(DEMO_SCENARIO), dt: DT, steps: STEPS, checkpoints: CHECKPOINTS,
      environment: identity.EXPLORE_ENVIRONMENT_DEMO_PRESCRIBED, C: { eastward: 10, northward: 0 },
      sourceWiring: { frame: "StormRelativeLaboratory", integrator: "EulerIntegrator", domain: "ATMOSPHERIC_TRACER_DOMAIN", recorderStride: 1,
        basis: "Exact reviewed source baseline plus captured import closure; not private-field runtime introspection", baseline: SOURCE_BASELINE },
      factories: ["createExploreLab", "ExploreTracerSession.releasePoint", "advanceLaboratoryFixedStep"], reserveB3: "excluded" };
    for (const item of result.cases) {
      unchanged(root, sources);
      await collectCase(item, { ...factory, ...advance, demoIdentity: identity.EXPLORE_ENVIRONMENT_DEMO_PRESCRIBED });
      unchanged(root, sources);
      if (item.status !== "complete") break;
    }
    result.status = result.cases.every(item => item.status === "complete") ? "complete" : "interrupted";
  } catch (error) { result.errors.push(String(error)); }
  try { unchanged(root, sources); }
  catch (error) { result.provenanceConsistency = "inconsistent"; result.status = "interrupted"; result.errors.push(String(error)); }
  // Failure to write throws to caller; no claim that unavailable evidence was saved.
  write("result.json", JSON.stringify(result, null, 2));
  writeFileSync(join(output, "checksums.json"), JSON.stringify(checksums, null, 2), { flag: "wx" });
  if (result.status !== "complete") throw new Error(`Collection interrupted; available evidence preserved at ${output}`);
  return output;
}
