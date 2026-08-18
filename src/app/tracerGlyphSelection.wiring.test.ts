import { describe, expect, it } from "vitest";
import { EulerIntegrator } from "../core/integrators/EulerIntegrator.js";
import { ConstantVelocityField } from "../physics/synthetic/ConstantVelocityField.js";
import { ATMOSPHERIC_TRACER_DOMAIN } from "../simulation/AtmosphericTracerDomain.js";
import { Simulation } from "../simulation/Simulation.js";
import type { TracerAdvectionState } from "../simulation/TracerParticle.js";
import { createExploreLab } from "./createExploreLab.js";
import { composeDemoTracerLab } from "./composeDemoTracerSimulation.js";
import { IntegrationFrame } from "./IntegrationFrame.js";
import { TracerPedagogy } from "./TracerPedagogy.js";
import { DEMO_SCENARIO } from "../scenario/DEMO_SCENARIO.js";
import { resetTracersFromSeeds } from "../simulation/resetTracersFromSeeds.js";
import type { ExploreSceneSlots } from "../explore/ExplorePointReleaseOrchestration.js";
import { TracerSelection } from "../interaction/TracerSelection.js";
import { occupancyIndexForTracerId } from "../ui/tracer/resolveTracerPointerUp.js";
import appSrc from "./App.tsx?raw";
import tracerSceneSrc from "../rendering/TracerScene.ts?raw";
import tracerViewportSrc from "../ui/tracer/TracerViewport.tsx?raw";

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

describe("App glyph selection wiring", () => {
  it("owns TracerSelection above Simulation and TracerScene", () => {
    expect(appSrc).toMatch(/new TracerSelection/);
    expect(appSrc).toMatch(/selectedTracerId/);
    expect(appSrc).toMatch(/onTracerSelect/);
    expect(appSrc).toMatch(/selection\.select/);
    expect(appSrc).toMatch(/selection\.clear\(\)/);
    expect(tracerSceneSrc).not.toMatch(/TracerSelection/);
    expect(tracerViewportSrc).not.toMatch(/TracerSelection/);
    expect(tracerViewportSrc).toMatch(/tracerIdForSlot/);
  });

  it("clears selection on Explore Clear and on Explore ↔ Guided, not on Reset", () => {
    expect(appSrc).toMatch(
      /orchestration\.clear\(\);\s*clearSelectionAndInspection\(\)/s,
    );
    expect(appSrc).toMatch(
      /enterExplore[\s\S]*clearSelectionAndInspection\(\)[\s\S]*createExploreLab/s,
    );
    expect(appSrc).toMatch(
      /enterGuided[\s\S]*clearSelectionAndInspection\(\)[\s\S]*createGuidedLab/s,
    );
    const resetBlock = appSrc.slice(
      appSrc.indexOf("const handleReset"),
      appSrc.indexOf("const enterExplore"),
    );
    expect(resetBlock).not.toMatch(/selection\.clear/);
    expect(resetBlock).toMatch(/refreshInspection/);
  });

  it("preserves selectedId across Explore Reset and append", () => {
    const lab = createExploreLab(fakeSlots());
    const selection = new TracerSelection();
    lab.session.releasePoint({ x: 0, y: 100, z: 0 });
    lab.session.releasePoint({ x: 10, y: 100, z: 0 });
    selection.select(lab.simulation.particles[0]!.tracerId);
    expect(selection.selectedId).toBe(1);

    lab.session.releasePoint({ x: 20, y: 100, z: 0 });
    expect(selection.selectedId).toBe(1);
    expect(lab.simulation.particles[2]!.tracerId).toBe(3);

    lab.simulation.step(DEMO_SCENARIO.simulation.timestep);
    lab.orchestration.reset();
    expect(selection.selectedId).toBe(1);
    expect(lab.simulation.particles[0]!.tracerId).toBe(1);
  });

  it("preserves Guided Reset selection and clears Explore occupancy selection at the owner", () => {
    const guided = composeDemoTracerLab(
      IntegrationFrame.StormRelativeLaboratory,
      TracerPedagogy.NearGroundOutflowPathline,
    );
    const selection = new TracerSelection();
    selection.select(guided.simulation.particles[0]!.tracerId);
    guided.simulation.step(DEMO_SCENARIO.simulation.timestep);
    resetTracersFromSeeds(
      guided.simulation,
      DEMO_SCENARIO.simulation.nearGroundOutflowPathlineSeeds,
    );
    expect(selection.selectedId).toBe(1);

    const explore = createExploreLab(fakeSlots());
    explore.session.releasePoint({ x: 1, y: 2, z: 3 });
    selection.select(explore.simulation.particles[0]!.tracerId);
    explore.orchestration.clear();
    selection.clear();
    expect(selection.selectedId).toBeNull();
    expect(explore.simulation.particles).toHaveLength(0);
  });

  it("keeps an inactive selected tracer selected even when its glyph would be hidden", () => {
    const simulation = new Simulation(
      new ConstantVelocityField({ x: 0, y: -10, z: 0 }),
      new EulerIntegrator(),
      [draft(0, 0, 0)],
      { tracerDomain: ATMOSPHERIC_TRACER_DOMAIN },
    );
    const selection = new TracerSelection();
    selection.select(simulation.particles[0]!.tracerId);
    simulation.step(0.1);
    expect(simulation.particles[0]!.active).toBe(false);
    expect(selection.selectedId).toBe(1);
    expect(
      occupancyIndexForTracerId(simulation.particles, selection.selectedId),
    ).toBe(0);
  });
});
