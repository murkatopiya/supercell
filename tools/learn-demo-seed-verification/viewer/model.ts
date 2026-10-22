// Inert saved-data contract only. No production or collector imports.
export const RUN_ID = "2026-10-21-slice2-125957-dc632454";
export const EXPECTED_HASHES = {
  "result.json": "7826f9152e7be98bf27b11f859c2755f095f60a3ecce091a4695fbb1691c8678",
  "provenance.json": "01dbe70accf2372db8545a1b487eba7dc8f997e52fc5aabb76bf91547ae1ef8f",
  "checksums.json": "2a4a9db3d2a612eb8b34c5f26b249c6a046b632a2428a700e5180684f975f543",
} as const;
export type Role = "A" | "B1" | "B2";
export type Point = { x: number; y: number; z: number };
export type Marker = { role: Role; tracerId: number; position: Point; age: number; active: boolean };
export type State = { step: number; nominalTime: number; clockTime: number; markers: Marker[] };
export type Sample = { position: Point; simulationTime: number };
export type SavedCase = {
  id: string; roles: Role[]; status: string; integrity: string; stepsCompleted: number;
  lastStartedStep: number; lastCompletedStep: number; lastSnapshotStep: number;
  unrecordedMutationPossible: boolean; failureObservation: unknown; errors: unknown[];
  mapping: { role: Role; tracerId: number; lane: number; seed: Point }[];
  states: State[]; history: { lane: number; samples: Sample[]; appendedAtSteps: number[] }[];
  checkpoints: { step: number; stateIndex: number }[];
  terminations: { role: Role; step: number; timeBounds: [number, number]; detectionTime: number; position: Point; sample: Sample }[];
};
export type SavedResult = {
  schema: string; runId: string; provenance: string; status: string; provenanceConsistency: string;
  errors: unknown[]; configuration: { dt: number; steps: number; checkpoints: number[];
    environment: string; C: { eastward: number; northward: number } };
  cases: SavedCase[];
};
export function demand(value: unknown, message: string): asserts value {
  if (!value) throw new Error(`Saved evidence rejected: ${message}`);
}
const samePoint = (a: Point, b: Point) => a.x === b.x && a.y === b.y && a.z === b.z;
const finitePoint = (p: Point) => p && [p.x, p.y, p.z].every(Number.isFinite);
const CASES = ["A", "B1", "B2", "A/B1", "A/B2"];
const SEEDS: Record<Role, Point> = { A: { x: 0, y: 1000, z: 4000 },
  B1: { x: 0, y: 1000, z: 6000 }, B2: { x: 2400, y: 1000, z: 0 } };
const CHECKPOINTS = [0, 300, 600, 900, 1200];

/** Structural/orchestration checks only, no physical tolerances or trajectory criteria. */
export function validateResult(input: unknown): SavedResult {
  const result = input as SavedResult;
  demand(result?.schema === "learn-demo-seed-result/v1" && result.runId === RUN_ID
    && result.provenance === "provenance.json", "schema/run identity");
  demand(result.status === "complete" && result.provenanceConsistency === "consistent"
    && Array.isArray(result.errors) && result.errors.length === 0, "run incomplete/inconsistent");
  const config = result.configuration;
  demand(config?.dt === 0.1 && config.steps === 1200 && config.environment === "demo-prescribed"
    && config.C.eastward === 10 && config.C.northward === 0
    && JSON.stringify(config.checkpoints) === JSON.stringify(CHECKPOINTS), "configuration");
  demand(Array.isArray(result.cases) && result.cases.length === 5, "case count");
  result.cases.forEach((c, caseIndex) => {
    demand(c.id === CASES[caseIndex] && c.roles.join("/") === c.id, "case order/roles");
    demand(c.status === "complete" && c.integrity === "consistent" && c.stepsCompleted === 1200
      && c.lastStartedStep === 1200 && c.lastCompletedStep === 1200 && c.lastSnapshotStep === 1200
      && c.unrecordedMutationPossible === false && c.failureObservation === null && c.errors.length === 0,
    `incomplete case ${c.id}`);
    demand(c.states.length === 1201 && c.history.length === c.roles.length && c.mapping.length === c.roles.length
      && new Set(c.mapping.map(m => m.tracerId)).size === c.roles.length, "counts/IDs");
    demand(c.checkpoints.length === CHECKPOINTS.length && c.checkpoints.every((p, index) =>
      p.step === CHECKPOINTS[index] && p.stateIndex === p.step), "checkpoints");
    c.states.forEach((s, step) => {
      demand(s.step === step && s.nominalTime === step * 0.1 && Number.isFinite(s.clockTime)
        && s.clockTime === (step === 0 ? 0 : c.states[step - 1]!.clockTime + 0.1), "step/clock sequence");
      demand(s.markers.length === c.roles.length, "marker count");
      s.markers.forEach((m, lane) => {
        const map = c.mapping[lane]!;
        demand(map.lane === lane && map.role === c.roles[lane] && Number.isInteger(map.tracerId)
          && m.role === map.role && m.tracerId === map.tracerId && samePoint(map.seed, SEEDS[m.role]), "mapping");
        demand(finitePoint(m.position) && Number.isFinite(m.age) && typeof m.active === "boolean", "marker values");
        if (!step) demand(m.active && m.age === 0 && samePoint(m.position, map.seed), "birth");
      });
    });
    const transitions: { lane: number; step: number }[] = [];
    c.history.forEach((history, lane) => {
      demand(history.lane === lane, "history lane");
      const expected = [0];
      for (let step = 1; step <= 1200; step++) {
        const before = c.states[step - 1]!.markers[lane]!, after = c.states[step]!.markers[lane]!;
        if (before.active) expected.push(step);
        else demand(!after.active && after.age === before.age && samePoint(after.position, before.position), "inactive changed");
        if (before.active && !after.active) transitions.push({ lane, step });
      }
      demand(history.samples.length === expected.length && history.appendedAtSteps.length === expected.length
        && history.appendedAtSteps.every((step, i) => step === expected[i]), "sample-step associations");
      history.samples.forEach((sample, i) => {
        const state = c.states[expected[i]!]!;
        demand(finitePoint(sample.position) && sample.simulationTime === state.clockTime
          && samePoint(sample.position, state.markers[lane]!.position), "recorder/state mismatch");
      });
    });
    demand(c.terminations.length === transitions.length, "termination count");
    transitions.forEach(({ lane, step }) => {
      const state = c.states[step]!, marker = state.markers[lane]!;
      const matches = c.terminations.filter(t => t.role === marker.role && t.step === step);
      demand(matches.length === 1, "termination mapping");
      const t = matches[0]!, sample = c.history[lane]!.samples.at(-1)!;
      demand(marker.position.y === 0 && t.detectionTime === state.clockTime
        && t.timeBounds[0] === c.states[step - 1]!.clockTime && t.timeBounds[1] === state.clockTime
        && samePoint(t.position, marker.position) && samePoint(t.sample.position, sample.position)
        && t.sample.simulationTime === sample.simulationTime && sample.simulationTime === state.clockTime, "terminal sample");
    });
  });
  return result;
}

/** Select actual recorder prefix; never derive samples from particle states. */
export function frameAt(c: SavedCase, step: number) {
  demand(Number.isInteger(step) && step >= 0 && step <= 1200, "display step out of range");
  return { state: c.states[step]!, lanes: c.history.map(h => {
    const end = h.appendedAtSteps.findIndex(sampleStep => sampleStep > step);
    return h.samples.slice(0, end === -1 ? h.samples.length : end);
  }) };
}

/** Wall-clock chooses only a saved integer index, never coordinates or model time. */
export function playbackStep(startStep: number, elapsedMs: number, speed: number): number {
  return Math.min(1200, startStep + Math.floor(Math.max(0, elapsedMs) * speed / 100));
}
