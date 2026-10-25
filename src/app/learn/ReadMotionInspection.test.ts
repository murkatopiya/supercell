import { expect, it, vi } from "vitest";
import { createReadMotionSession } from "./createReadMotionSession.js";
import { inspectRecordedMotion, ReadMotionInspection } from "./ReadMotionInspection.js";

function recordedFixture() {
  const lab = createReadMotionSession();
  // Synthetic recorder fixture, not a new integrated trajectory or scientific run.
  lab.pathHistory.recordAfterStep([{ ...lab.simulation.particles[0]!, position: { x: 100, y: 1500, z: 200 } }], 60);
  lab.pathHistory.recordAfterStep([{ ...lab.simulation.particles[0]!, position: { x: 300, y: 2000, z: -100 } }], 120);
  const sample = vi.spyOn(lab.velocityObservation.total, "sample").mockReturnValue({ x: -3, y: 4, z: 12 });
  return { lab, sample };
}

it.each([0, 1, 2])("reads actual recorded P,t at index %s without touching the live state", index => {
  const { lab, sample } = recordedFixture();
  const before = JSON.stringify({ time: lab.simulation.clock.time, particles: lab.simulation.particles, history: lab.pathHistory.samplesFor(0) });
  const step = vi.spyOn(lab.simulation, "step");
  const current = inspectRecordedMotion(lab, index);
  expect(current.kind).toBe("available");
  const recorded = lab.pathHistory.sampleAt(0, index);
  expect(sample).toHaveBeenLastCalledWith(recorded.position, recorded.simulationTime);
  expect(current).toMatchObject({ position: recorded.position, modelTime: recorded.simulationTime, height: recorded.position.y,
    speed: 13, eastward: -3, northward: -12, vertical: 4 });
  expect(JSON.stringify({ time: lab.simulation.clock.time, particles: lab.simulation.particles, history: lab.pathHistory.samplesFor(0) })).toBe(before);
  expect(step).not.toHaveBeenCalled();
});

it("keeps an immutable measured Reference while selecting, replacing and clearing moments", () => {
  const { lab, sample } = recordedFixture();
  const inspection = new ReadMotionInspection(lab);
  inspection.select(0); inspection.saveReference();
  const saved = inspection.reference;
  sample.mockReturnValue({ x: 0, y: -5, z: -12 });
  inspection.select(1);
  expect(inspection.current()).toMatchObject({ modelTime: 60, vertical: -5, northward: 12 });
  expect(inspection.reference).toBe(saved);
  expect(inspection.reference).toMatchObject({ modelTime: 0, speed: 13, vertical: 4 });
  expect(Object.isFrozen(saved)).toBe(true);
  expect(Object.isFrozen(saved!.velocity)).toBe(true);
  inspection.saveReference(); expect(inspection.reference).toMatchObject({ modelTime: 60, vertical: -5 });
  inspection.clearReference(); expect(inspection.reference).toBeNull();
  expect(inspection.selectedIndex).toBe(1);
});

it.each(["throw", "nonfinite"])("reports %s velocity as unavailable, preserving location and any valid Reference", failure => {
  const { lab, sample } = recordedFixture();
  const inspection = new ReadMotionInspection(lab);
  inspection.select(0); inspection.saveReference();
  const reference = inspection.reference;
  if (failure === "throw") sample.mockImplementation(() => { throw new Error("unavailable"); });
  else sample.mockReturnValue({ x: NaN, y: 0, z: 0 });
  inspection.select(1);
  expect(inspection.current()).toEqual({ kind: "unavailable", historyIndex: 1,
    position: { x: 100, y: 1500, z: 200 }, modelTime: 60, height: 1500 });
  inspection.saveReference(); expect(inspection.reference).toBe(reference);
  expect(() => lab.sceneOptions.viewPose!(1)).not.toThrow();
});

it.each([-1, .5, 3, NaN])("does not interpolate or invent missing index %s", index => {
  const { lab } = recordedFixture();
  expect(inspectRecordedMotion(lab, index)).toMatchObject({ kind: "unavailable", position: null, modelTime: null });
});

it.each(["clear", "replay", "remove"])("resets selection/reference after history %s", operation => {
  const { lab } = recordedFixture();
  const inspection = new ReadMotionInspection(lab);
  inspection.select(1); inspection.saveReference();
  if (operation === "clear") lab.pathHistory.clear();
  else if (operation === "replay") lab.replay();
  else lab.pathHistory.removeAllLanes();
  expect(inspection.selectedIndex).toBeNull();
  expect(inspection.reference).toBeNull();
  if (operation !== "replay") expect(inspection.current().kind).toBe("unavailable");
});
