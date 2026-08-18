import { describe, expect, it } from "vitest";
import { EulerIntegrator } from "../core/integrators/EulerIntegrator.js";
import { ConstantVelocityField } from "../physics/synthetic/ConstantVelocityField.js";
import { Simulation } from "../simulation/Simulation.js";
import { TracerPathHistory } from "../simulation/TracerPathHistory.js";
import { DEFAULT_PLACEMENT_CLICK_MOVEMENT_PX } from "./shouldAcceptPlacementPick.js";
import { ExplorePointReleaseOrchestration } from "./ExplorePointReleaseOrchestration.js";
import type { ExploreSceneSlots } from "./ExplorePointReleaseOrchestration.js";
import { ExplorePointReleaseTool } from "./ExplorePointReleaseTool.js";
import { ExploreTracerSession } from "./ExploreTracerSession.js";
import type { TracerSeedPosition } from "../simulation/createTracersFromSeeds.js";
import appSrc from "../app/App.tsx?raw";
import tracerViewportSrc from "../ui/tracer/TracerViewport.tsx?raw";
import simulationSrc from "../simulation/Simulation.ts?raw";
import tracerSceneSrc from "../rendering/TracerScene.ts?raw";
import exploreControlsSrc from "../ui/tracer/ExplorePointReleaseControls.tsx?raw";
import { createExploreLab } from "../app/createExploreLab.js";

class FakeSceneSlots implements ExploreSceneSlots {
  tracerSlotCount = 0;
  preview: TracerSeedPosition | null = null;
  addCalls = 0;
  clearCalls = 0;

  addTracerSlot(): void {
    this.tracerSlotCount += 1;
    this.addCalls += 1;
  }

  clearTracerSlots(): void {
    this.tracerSlotCount = 0;
    this.clearCalls += 1;
  }

  syncReleasePreview(pendingSeed: TracerSeedPosition | null): void {
    this.preview =
      pendingSeed === null
        ? null
        : { x: pendingSeed.x, y: pendingSeed.y, z: pendingSeed.z };
  }
}

function constantLab(slots: FakeSceneSlots) {
  const simulation = new Simulation(
    new ConstantVelocityField({ x: 10, y: 0, z: 0 }),
    new EulerIntegrator(),
    [],
  );
  const pathHistory = new TracerPathHistory(0);
  const session = new ExploreTracerSession(simulation, pathHistory);
  const tool = new ExplorePointReleaseTool();
  const orchestration = new ExplorePointReleaseOrchestration(
    session,
    tool,
    slots,
  );
  return { simulation, pathHistory, session, tool, orchestration, slots };
}

const PICK_ORIGIN = { x: 0, y: 1000, z: 0 };
const PICK_DIRECTION = { x: 0, y: -1, z: 0 };
const SECOND_ORIGIN = { x: 50, y: 500, z: -4 };
const SECOND_DIRECTION = { x: 0, y: -1, z: 0 };

describe("Explore browser point-release acceptance", () => {
  it("runs the Slice 4 pick → preview → confirm → late birth → Reset → Clear loop", () => {
    const slots = new FakeSceneSlots();
    const { simulation, pathHistory, session, tool, orchestration } =
      constantLab(slots);
    const dt = 0.1;

    expect(session.seeds).toEqual([]);
    expect(simulation.particles).toHaveLength(0);
    expect(pathHistory.tracerCount).toBe(0);
    expect(slots.tracerSlotCount).toBe(0);
    expect(slots.preview).toBeNull();

    tool.setAltitude(1000);
    tool.placementEnabled = true;

    for (let i = 0; i < 10; i++) {
      simulation.step(dt);
      pathHistory.recordAfterStep(simulation.particles);
    }
    const timeAtP1 = simulation.clock.time;
    expect(timeAtP1).toBeCloseTo(1, 12);

    orchestration.handlePlacementAttempt(PICK_ORIGIN, PICK_DIRECTION, 0);

    expect(tool.pendingSeed).toEqual({ x: 0, y: 1000, z: 0 });
    expect(slots.preview).toEqual({ x: 0, y: 1000, z: 0 });
    expect(simulation.particles).toHaveLength(0);
    expect(pathHistory.tracerCount).toBe(0);
    expect(slots.tracerSlotCount).toBe(0);
    expect(simulation.clock.time).toBe(timeAtP1);

    expect(orchestration.confirmRelease()).toBe(true);

    expect(simulation.clock.time).toBe(timeAtP1);
    expect(simulation.particles).toHaveLength(1);
    expect(pathHistory.tracerCount).toBe(1);
    expect(slots.tracerSlotCount).toBe(1);
    expect(slots.preview).toBeNull();
    expect(tool.pendingSeed).toBeNull();
    expect(simulation.particles[0]).toMatchObject({
      tracerId: 1,
      position: { x: 0, y: 1000, z: 0 },
      age: 0,
      active: true,
    });
    expect(pathHistory.pointsFor(0)).toEqual([{ x: 0, y: 1000, z: 0 }]);

    simulation.step(dt);
    pathHistory.recordAfterStep(simulation.particles);
    expect(simulation.particles[0]!.position).toEqual({
      x: 1,
      y: 1000,
      z: 0,
    });
    expect(pathHistory.pointsFor(0)).toHaveLength(2);

    const p1HistoryBeforeP2 = pathHistory.pointsFor(0);
    const timeAtP2 = simulation.clock.time;
    orchestration.handlePlacementAttempt(SECOND_ORIGIN, SECOND_DIRECTION, 0);
    expect(slots.preview).toEqual({ x: 50, y: 1000, z: -4 });
    expect(orchestration.confirmRelease()).toBe(true);

    expect(simulation.clock.time).toBe(timeAtP2);
    expect(simulation.particles).toHaveLength(2);
    expect(pathHistory.tracerCount).toBe(2);
    expect(slots.tracerSlotCount).toBe(2);
    expect(pathHistory.pointsFor(0)).toEqual(p1HistoryBeforeP2);
    expect(simulation.particles[0]!.position).toEqual({
      x: 1,
      y: 1000,
      z: 0,
    });
    expect(simulation.particles[1]).toMatchObject({
      tracerId: 2,
      position: { x: 50, y: 1000, z: -4 },
      age: 0,
      active: true,
    });
    expect(pathHistory.pointsFor(1)).toEqual([{ x: 50, y: 1000, z: -4 }]);

    orchestration.reset();

    expect(simulation.clock.time).toBe(0);
    expect(simulation.particles).toHaveLength(2);
    expect(pathHistory.tracerCount).toBe(2);
    expect(slots.tracerSlotCount).toBe(2);
    expect(slots.clearCalls).toBe(0);
    expect(slots.preview).toBeNull();
    expect(tool.pendingSeed).toBeNull();
    expect(simulation.particles[0]).toMatchObject({
      tracerId: 1,
      position: { x: 0, y: 1000, z: 0 },
      age: 0,
      active: true,
    });
    expect(simulation.particles[1]).toMatchObject({
      tracerId: 2,
      position: { x: 50, y: 1000, z: -4 },
      age: 0,
      active: true,
    });
    expect(pathHistory.pointsFor(0)).toEqual([{ x: 0, y: 1000, z: 0 }]);
    expect(pathHistory.pointsFor(1)).toEqual([{ x: 50, y: 1000, z: -4 }]);

    simulation.step(dt);
    pathHistory.recordAfterStep(simulation.particles);
    const timeBeforeClear = simulation.clock.time;
    const sceneIdentity = slots;

    orchestration.clear();

    expect(slots).toBe(sceneIdentity);
    expect(session.seeds).toEqual([]);
    expect(simulation.particles).toHaveLength(0);
    expect(pathHistory.tracerCount).toBe(0);
    expect(slots.tracerSlotCount).toBe(0);
    expect(slots.clearCalls).toBe(1);
    expect(simulation.clock.time).toBe(timeBeforeClear);
    expect(slots.preview).toBeNull();

    tool.placementEnabled = true;
    orchestration.handlePlacementAttempt(PICK_ORIGIN, PICK_DIRECTION, 0);
    expect(orchestration.confirmRelease()).toBe(true);
    expect(simulation.particles).toHaveLength(1);
    expect(pathHistory.tracerCount).toBe(1);
    expect(slots.tracerSlotCount).toBe(1);
    expect(slots).toBe(sceneIdentity);
    expect(simulation.clock.time).toBe(timeBeforeClear);
    expect(simulation.particles[0]!.age).toBe(0);
  });

  it("does not place on OrbitControls-scale drag, miss, or disabled tool", () => {
    const slots = new FakeSceneSlots();
    const { tool, orchestration } = constantLab(slots);
    tool.setAltitude(1000);
    tool.placementEnabled = true;
    orchestration.handlePlacementAttempt(PICK_ORIGIN, PICK_DIRECTION, 0);
    expect(slots.preview).toEqual({ x: 0, y: 1000, z: 0 });

    orchestration.handlePlacementAttempt(
      SECOND_ORIGIN,
      SECOND_DIRECTION,
      DEFAULT_PLACEMENT_CLICK_MOVEMENT_PX + 1,
    );
    expect(tool.pendingSeed).toEqual({ x: 0, y: 1000, z: 0 });
    expect(slots.preview).toEqual({ x: 0, y: 1000, z: 0 });

    orchestration.handlePlacementAttempt(
      { x: 0, y: 1, z: 0 },
      { x: 1, y: 0, z: 0 },
      0,
    );
    expect(tool.pendingSeed).toEqual({ x: 0, y: 1000, z: 0 });

    tool.placementEnabled = false;
    orchestration.handlePlacementAttempt(SECOND_ORIGIN, SECOND_DIRECTION, 0);
    expect(tool.pendingSeed).toEqual({ x: 0, y: 1000, z: 0 });
    expect(slots.preview).toEqual({ x: 0, y: 1000, z: 0 });
    expect(slots.tracerSlotCount).toBe(0);
  });

  it("confirm without pending is a no-op and cancel hides preview", () => {
    const slots = new FakeSceneSlots();
    const { simulation, pathHistory, tool, orchestration } = constantLab(slots);
    expect(orchestration.confirmRelease()).toBe(false);
    expect(simulation.particles).toHaveLength(0);
    expect(slots.addCalls).toBe(0);

    tool.placementEnabled = true;
    orchestration.handlePlacementAttempt(PICK_ORIGIN, PICK_DIRECTION, 0);
    orchestration.cancelPending();
    expect(tool.pendingSeed).toBeNull();
    expect(slots.preview).toBeNull();
    expect(pathHistory.tracerCount).toBe(0);
  });

  it("Reset clears pending preview without dropping slots", () => {
    const slots = new FakeSceneSlots();
    const { tool, orchestration } = constantLab(slots);
    tool.placementEnabled = true;
    orchestration.handlePlacementAttempt(PICK_ORIGIN, PICK_DIRECTION, 0);
    orchestration.confirmRelease();
    orchestration.handlePlacementAttempt(SECOND_ORIGIN, SECOND_DIRECTION, 0);
    expect(slots.preview).not.toBeNull();
    orchestration.reset();
    expect(tool.pendingSeed).toBeNull();
    expect(slots.preview).toBeNull();
    expect(slots.tracerSlotCount).toBe(1);
    expect(slots.clearCalls).toBe(0);
  });

  it("zero-particle stepping remains aligned", () => {
    const lab = createExploreLab(new FakeSceneSlots());
    lab.simulation.step(0.1);
    lab.pathHistory.recordAfterStep(lab.simulation.particles);
    expect(lab.simulation.particles).toHaveLength(0);
    expect(lab.pathHistory.tracerCount).toBe(0);
    expect(lab.simulation.clock.time).toBeCloseTo(0.1, 12);
  });

  it("wires Explore entry beside Guided without a pedagogy selector or ScenarioConfig writes", () => {
    expect(appSrc).toMatch(/createExploreLab/);
    expect(appSrc).toMatch(/ExplorePointReleaseOrchestration/);
    expect(appSrc).toMatch(/createGuidedLab/);
    expect(appSrc).not.toMatch(/LIVE_DEMO_TRACER_PEDAGOGY/);
    expect(appSrc).toMatch(/>\s*Guided\s*</);
    expect(appSrc).toMatch(/>\s*Explore\s*</);
    expect(exploreControlsSrc).toMatch(
      /Release passive tracers into the current storm-relative laboratory/,
    );
    expect(appSrc).not.toMatch(/DiagnosticProbes/);
    expect(appSrc).not.toMatch(/StoryPathlines/);
    expect(appSrc).not.toMatch(/DownwardPathline/);
    expect(appSrc).not.toMatch(/NearGroundOutflowPathline/);
    expect(appSrc).not.toMatch(/storySeeds/);
    expect(appSrc).not.toMatch(/exploreSeeds/);
    expect(exploreControlsSrc).not.toMatch(/inflow/i);
    expect(exploreControlsSrc).not.toMatch(/updraft path/i);
    expect(exploreControlsSrc).not.toMatch(/downdraft/i);
    expect(exploreControlsSrc).not.toMatch(/cold pool/i);
    expect(exploreControlsSrc).not.toMatch(/circulation/i);
    expect(tracerViewportSrc).toMatch(/onPlacementAttempt/);
    expect(tracerViewportSrc).toMatch(/worldRayFromNdc/);
    expect(tracerViewportSrc).toMatch(/syncReleasePreview/);
    expect(tracerViewportSrc).toMatch(/addTracerSlot/);
    expect(tracerViewportSrc).toMatch(/clearTracerSlots/);
    expect(tracerViewportSrc).not.toMatch(/ExplorePointReleaseTool/);
    expect(tracerViewportSrc).not.toMatch(/ExploreTracerSession/);
    expect(tracerViewportSrc).not.toMatch(/shouldAcceptPlacementPick/);
    expect(tracerSceneSrc).not.toMatch(/from ["'].*explore/);
    expect(simulationSrc).not.toMatch(/ExplorePointReleaseTool/);
    expect(simulationSrc).not.toMatch(/placementEnabled/);
  });
});
