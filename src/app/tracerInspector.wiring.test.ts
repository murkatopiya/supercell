import { describe, expect, it } from "vitest";
import { EulerIntegrator } from "../core/integrators/EulerIntegrator.js";
import { ConstantVelocityField } from "../physics/synthetic/ConstantVelocityField.js";
import { ATMOSPHERIC_TRACER_DOMAIN } from "../simulation/AtmosphericTracerDomain.js";
import { Simulation } from "../simulation/Simulation.js";
import type { TracerAdvectionState } from "../simulation/TracerParticle.js";
import { DEMO_SCENARIO } from "../scenario/DEMO_SCENARIO.js";
import { resetTracersFromSeeds } from "../simulation/resetTracersFromSeeds.js";
import { inspectSelectedTracer } from "../interaction/TracerInspection.js";
import { TracerSelection } from "../interaction/TracerSelection.js";
import {
  composeDemoTracerLab,
  DEMO_VELOCITY_CONTRIBUTION_KEYS,
} from "./composeDemoTracerSimulation.js";
import { createExploreLab } from "./createExploreLab.js";
import { IntegrationFrame } from "./IntegrationFrame.js";
import { TracerPedagogy } from "./TracerPedagogy.js";
import type { ExploreSceneSlots } from "../explore/ExplorePointReleaseOrchestration.js";
import appSrc from "./App.tsx?raw";
import tracerViewportSrc from "../ui/tracer/TracerViewport.tsx?raw";
import tracerInspectorPanelSrc from "../ui/tracer/TracerInspectorPanel.tsx?raw";

function fakeSlots(): ExploreSceneSlots {
  let tracerSlotCount = 0;
  return {
    get tracerSlotCount() {
      return tracerSlotCount;
    },
    addTracerSlot() {
      tracerSlotCount += 1;
    },
    clearTracerSlots() {
      tracerSlotCount = 0;
    },
    syncReleasePreview() {},
  };
}

function draft(
  x: number,
  y: number,
  z: number,
  active = true,
): TracerAdvectionState {
  return { position: { x, y, z }, age: 0, active };
}

describe("shared inspector observation wiring", () => {
  it("returns no inspection when nothing is selected", () => {
    const { simulation, velocityObservation } = composeDemoTracerLab(
      IntegrationFrame.StormRelativeLaboratory,
      TracerPedagogy.NearGroundOutflowPathline,
    );
    const selection = new TracerSelection();
    expect(
      inspectSelectedTracer(
        simulation.particles,
        selection,
        simulation.clock.time,
        velocityObservation,
      ),
    ).toBeUndefined();
  });

  it("inspects the current particle immediately after select, including while paused", () => {
    const { simulation, velocityObservation } = composeDemoTracerLab(
      IntegrationFrame.StormRelativeLaboratory,
      TracerPedagogy.NearGroundOutflowPathline,
    );
    const selection = new TracerSelection();
    const particle = simulation.particles[0]!;
    selection.select(particle.tracerId);
    const inspection = inspectSelectedTracer(
      simulation.particles,
      selection,
      simulation.clock.time,
      velocityObservation,
    );
    expect(inspection).toBeDefined();
    expect(inspection!.tracerId).toBe(particle.tracerId);
    expect(inspection!.position).toEqual(particle.position);
    expect(inspection!.time).toBe(simulation.clock.time);
    expect(inspection!.time).toBe(0);
    expect(inspection!.active).toBe(true);
    expect(inspection!.contributions?.map((part) => part.key)).toEqual([
      ...DEMO_VELOCITY_CONTRIBUTION_KEYS,
    ]);
  });

  it("refreshes inspection after a fixed-step advance so the panel cannot freeze", () => {
    const { simulation, velocityObservation } = composeDemoTracerLab(
      IntegrationFrame.StormRelativeLaboratory,
      TracerPedagogy.NearGroundOutflowPathline,
    );
    const selection = new TracerSelection();
    selection.select(simulation.particles[0]!.tracerId);
    const before = inspectSelectedTracer(
      simulation.particles,
      selection,
      simulation.clock.time,
      velocityObservation,
    )!;
    simulation.step(DEMO_SCENARIO.simulation.timestep);
    const after = inspectSelectedTracer(
      simulation.particles,
      selection,
      simulation.clock.time,
      velocityObservation,
    )!;
    expect(after.tracerId).toBe(before.tracerId);
    expect(after.time).toBe(before.time + DEMO_SCENARIO.simulation.timestep);
    expect(after.position).not.toEqual(before.position);
    expect(after.age).toBeGreaterThan(before.age);
  });

  it("keeps the same tracerId after Reset and shows reset kinematics", () => {
    const seeds = DEMO_SCENARIO.simulation.nearGroundOutflowPathlineSeeds;
    const { simulation, velocityObservation } = composeDemoTracerLab(
      IntegrationFrame.StormRelativeLaboratory,
      TracerPedagogy.NearGroundOutflowPathline,
    );
    const selection = new TracerSelection();
    selection.select(simulation.particles[0]!.tracerId);
    simulation.step(DEMO_SCENARIO.simulation.timestep);
    resetTracersFromSeeds(simulation, seeds);
    const inspection = inspectSelectedTracer(
      simulation.particles,
      selection,
      simulation.clock.time,
      velocityObservation,
    )!;
    expect(selection.selectedId).toBe(1);
    expect(inspection.tracerId).toBe(1);
    expect(inspection.position).toEqual(seeds[0]);
    expect(inspection.age).toBe(0);
    expect(inspection.time).toBe(0);
    expect(inspection.active).toBe(true);
  });

  it("clears inspection when Explore occupancy is cleared", () => {
    const lab = createExploreLab(fakeSlots());
    lab.session.releasePoint({ x: 1, y: 2, z: 3 });
    const selection = new TracerSelection();
    selection.select(lab.simulation.particles[0]!.tracerId);
    expect(
      inspectSelectedTracer(
        lab.simulation.particles,
        selection,
        lab.simulation.clock.time,
        lab.velocityObservation,
      ),
    ).toBeDefined();
    lab.orchestration.clear();
    selection.clear();
    expect(
      inspectSelectedTracer(
        lab.simulation.particles,
        selection,
        lab.simulation.clock.time,
        lab.velocityObservation,
      ),
    ).toBeUndefined();
  });

  it("inspects an inactive selected tracer without dropping the payload", () => {
    const total = new ConstantVelocityField({ x: 0, y: -10, z: 0 });
    const simulation = new Simulation(
      total,
      new EulerIntegrator(),
      [draft(0, 0, 0)],
      { tracerDomain: ATMOSPHERIC_TRACER_DOMAIN },
    );
    const selection = new TracerSelection();
    selection.select(simulation.particles[0]!.tracerId);
    simulation.step(0.1);
    const inspection = inspectSelectedTracer(
      simulation.particles,
      selection,
      simulation.clock.time,
      { total },
    )!;
    expect(selection.selectedId).toBe(1);
    expect(inspection.active).toBe(false);
    expect(inspection.vTotal).toEqual({ x: 0, y: -10, z: 0 });
    expect(inspection.contributions).toBeUndefined();
  });

  it("uses one shared panel and inspectSelectedTracer for Explore and Guided", () => {
    expect(appSrc).toMatch(/TracerInspectorPanel/);
    expect(appSrc).toMatch(/inspectSelectedTracer/);
    expect(appSrc).toMatch(/onSimulationAdvanced/);
    expect(appSrc).not.toMatch(/ExploreInspector/);
    expect(appSrc).not.toMatch(/GuidedInspector/);
    expect(tracerInspectorPanelSrc).not.toMatch(/ExploreTracerSession/);
    expect(tracerInspectorPanelSrc).not.toMatch(/TracerPedagogy/);
    expect(tracerInspectorPanelSrc).not.toMatch(/\.sample\(/);
  });

  it("places the shared inspector in a workbench column beside the laboratory", () => {
    expect(appSrc).toMatch(/className="workbench"/);
    expect(appSrc).toMatch(/workbench__column--hodograph/);
    expect(appSrc).toMatch(/workbench__column--laboratory/);
    expect(appSrc).toMatch(/workbench__column--inspector/);
    const laboratory = appSrc.slice(
      appSrc.indexOf("workbench__column--laboratory"),
      appSrc.indexOf("workbench__column--inspector"),
    );
    expect(laboratory).toMatch(/TracerViewport/);
    expect(laboratory).not.toMatch(/TracerInspectorPanel/);
    expect(appSrc).toMatch(
      /workbench__column--inspector[\s\S]*TracerInspectorPanel/s,
    );
  });

  it("clears inspection on Explore ↔ Guided in App", () => {
    expect(appSrc).toMatch(
      /enterExplore[\s\S]*clearSelectionAndInspection\(\)[\s\S]*createExploreLab/s,
    );
    expect(appSrc).toMatch(
      /enterGuided[\s\S]*clearSelectionAndInspection\(\)[\s\S]*createGuidedLab/s,
    );
  });

  it("notifies after a completed step batch without putting inspection in scene effect deps", () => {
    expect(tracerViewportSrc).toMatch(/onSimulationAdvancedRef/);
    expect(tracerViewportSrc).toMatch(
      /if \(consumed\.steps > 0\) \{\s*onSimulationAdvancedRef\.current\?\.\(\);/s,
    );
    expect(tracerViewportSrc).toMatch(
      /simulation,\s*timestep,\s*pathHistory,\s*keepInactiveGlyphs,\s*visualAirflowPopulation/,
    );
    expect(tracerViewportSrc).not.toMatch(
      /keepInactiveGlyphs, visualAirflowPopulation, onSimulationAdvanced/,
    );
    expect(tracerViewportSrc).not.toMatch(/inspection/);
  });
});
