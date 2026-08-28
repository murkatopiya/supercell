import { describe, expect, it } from "vitest";
import { EulerIntegrator } from "../core/integrators/EulerIntegrator.js";
import { ConstantVelocityField } from "../physics/synthetic/ConstantVelocityField.js";
import { Simulation } from "../simulation/Simulation.js";
import { TracerPathHistory } from "../simulation/TracerPathHistory.js";
import { TracerSelection } from "../interaction/TracerSelection.js";
import { ExplorePointReleaseOrchestration } from "./ExplorePointReleaseOrchestration.js";
import type { ExploreSceneSlots } from "./ExplorePointReleaseOrchestration.js";
import { ExplorePointReleaseTool } from "./ExplorePointReleaseTool.js";
import { ExploreTracerSession } from "./ExploreTracerSession.js";
import orchestrationSrc from "./ExplorePointReleaseOrchestration.ts?raw";
import sessionSrc from "./ExploreTracerSession.ts?raw";
import appSrc from "../app/App.tsx?raw";

class MemorySlots implements ExploreSceneSlots {
  tracerSlotCount = 0;

  addTracerSlot(): void {
    this.tracerSlotCount += 1;
  }

  removeLastTracerSlot(): void {
    if (this.tracerSlotCount > 0) {
      this.tracerSlotCount -= 1;
    }
  }

  clearTracerSlots(): void {
    this.tracerSlotCount = 0;
  }

  syncReleasePreview(): void {}
}

function lab() {
  const simulation = new Simulation(
    new ConstantVelocityField({ x: 10, y: 0, z: 0 }),
    new EulerIntegrator(),
    [],
  );
  const pathHistory = new TracerPathHistory(0);
  const session = new ExploreTracerSession(simulation, pathHistory);
  const tool = new ExplorePointReleaseTool();
  const slots = new MemorySlots();
  const orchestration = new ExplorePointReleaseOrchestration(
    session,
    tool,
    slots,
  );
  return { simulation, pathHistory, session, tool, slots, orchestration };
}

function confirmAt(
  orchestration: ExplorePointReleaseOrchestration,
  tool: ExplorePointReleaseTool,
  x: number,
  y: number,
  z: number,
): void {
  tool.placementEnabled = true;
  tool.setAltitude(y);
  orchestration.handlePlacementAttempt(
    { x, y: 2000, z },
    { x: 0, y: -1, z: 0 },
    0,
  );
  expect(orchestration.confirmRelease()).toBe(true);
}

describe("Explore tracer authoring history", () => {
  it("records a successful confirm onto undo and leaves Redo disabled", () => {
    const { orchestration } = lab();
    expect(orchestration.canUndo).toBe(false);
    expect(orchestration.canRedo).toBe(false);
    confirmAt(orchestration, orchestration.tool, 1, 100, 0);
    expect(orchestration.canUndo).toBe(true);
    expect(orchestration.canRedo).toBe(false);
  });

  it("undo removes only the last added tracer and is LIFO", () => {
    const { simulation, orchestration, slots } = lab();
    confirmAt(orchestration, orchestration.tool, 1, 100, 0);
    confirmAt(orchestration, orchestration.tool, 2, 200, 0);
    confirmAt(orchestration, orchestration.tool, 3, 300, 0);
    const firstId = simulation.particles[0]!.tracerId;
    const firstPos = { ...simulation.particles[0]!.position };

    expect(orchestration.undoLastAdd()?.tracerId).toBe(3);
    expect(simulation.particles).toHaveLength(2);
    expect(slots.tracerSlotCount).toBe(2);
    expect(simulation.particles[0]!.tracerId).toBe(firstId);
    expect(simulation.particles[0]!.position).toEqual(firstPos);
    expect(simulation.particles[1]!.position).toEqual({ x: 2, y: 200, z: 0 });

    expect(orchestration.undoLastAdd()?.tracerId).toBe(2);
    expect(simulation.particles).toHaveLength(1);
    expect(simulation.particles[0]!.tracerId).toBe(firstId);
  });

  it("redo repeats the release command at the current clock with a new identity", () => {
    const { simulation, orchestration } = lab();
    confirmAt(orchestration, orchestration.tool, 5, 50, -1);
    simulation.step(0.2);
    const clock = simulation.clock.time;
    const undone = orchestration.undoLastAdd();
    expect(undone?.seed).toEqual({ x: 5, y: 50, z: -1 });
    expect(simulation.particles).toHaveLength(0);
    expect(simulation.clock.time).toBe(clock);

    expect(orchestration.redoLastAdd()).toBe(true);
    expect(simulation.clock.time).toBe(clock);
    expect(simulation.particles).toHaveLength(1);
    expect(simulation.particles[0]!.tracerId).not.toBe(undone?.tracerId);
    expect(simulation.particles[0]!.position).toEqual({ x: 5, y: 50, z: -1 });
    expect(simulation.particles[0]!.age).toBe(0);
  });

  it("a new release after undo clears redo", () => {
    const { orchestration, simulation } = lab();
    confirmAt(orchestration, orchestration.tool, 1, 10, 0);
    confirmAt(orchestration, orchestration.tool, 2, 20, 0);
    orchestration.undoLastAdd();
    expect(orchestration.canRedo).toBe(true);
    confirmAt(orchestration, orchestration.tool, 9, 90, 0);
    expect(orchestration.canRedo).toBe(false);
    expect(simulation.particles).toHaveLength(2);
    expect(simulation.particles[1]!.position).toEqual({ x: 9, y: 90, z: 0 });
  });

  it("Clear tracers empties occupancy and both stacks", () => {
    const { orchestration, simulation, slots } = lab();
    confirmAt(orchestration, orchestration.tool, 1, 10, 0);
    orchestration.undoLastAdd();
    expect(orchestration.canRedo).toBe(true);
    orchestration.clear();
    expect(simulation.particles).toHaveLength(0);
    expect(slots.tracerSlotCount).toBe(0);
    expect(orchestration.canUndo).toBe(false);
    expect(orchestration.canRedo).toBe(false);
  });

  it("does not change clock, remaining trajectories, or environment on undo", () => {
    const { simulation, orchestration } = lab();
    confirmAt(orchestration, orchestration.tool, 0, 100, 0);
    confirmAt(orchestration, orchestration.tool, 10, 100, 0);
    simulation.step(0.1);
    const kept = {
      id: simulation.particles[0]!.tracerId,
      position: { ...simulation.particles[0]!.position },
      age: simulation.particles[0]!.age,
    };
    const clock = simulation.clock.time;
    orchestration.undoLastAdd();
    expect(simulation.clock.time).toBe(clock);
    expect(simulation.particles[0]!.tracerId).toBe(kept.id);
    expect(simulation.particles[0]!.position).toEqual(kept.position);
    expect(simulation.particles[0]!.age).toBe(kept.age);
  });

  it("does not write TracerSelection; App clears only when the undone id was selected", () => {
    const { simulation, orchestration } = lab();
    const selection = new TracerSelection();
    confirmAt(orchestration, orchestration.tool, 1, 10, 0);
    confirmAt(orchestration, orchestration.tool, 2, 20, 0);
    selection.select(simulation.particles[0]!.tracerId);
    const keptId = selection.selectedId;
    orchestration.undoLastAdd();
    expect(selection.selectedId).toBe(keptId);

    const undoneSelected = simulation.particles[0]!.tracerId;
    selection.select(undoneSelected);
    orchestration.undoLastAdd();
    expect(simulation.particles).toHaveLength(0);
    expect(selection.selectedId).toBe(undoneSelected);

    const undoHandler = appSrc.slice(
      appSrc.indexOf("const handleExploreUndo"),
      appSrc.indexOf("const handleExploreRedo"),
    );
    expect(undoHandler).toMatch(/selectedId === removed\.tracerId/);
    expect(undoHandler).toMatch(/clearSelectionAndInspection/);
  });

  it("keeps authoring history on orchestration, not Simulation or session seeds", () => {
    expect(orchestrationSrc).toMatch(/ExploreTracerAuthoringHistory/);
    expect(orchestrationSrc).toMatch(/undoLastAdd/);
    expect(orchestrationSrc).toMatch(/redoLastAdd/);
    expect(orchestrationSrc).toMatch(/authoringHistory\.clear/);
    expect(sessionSrc).not.toMatch(/undoStack/);
    expect(sessionSrc).not.toMatch(/ExploreTracerAuthoringHistory/);
    expect(appSrc).toMatch(/handleExploreUndo/);
    expect(appSrc).not.toMatch(/\bremoveLastParticle\b/);
  });
});
