import { describe, expect, it } from "vitest";
import { EulerIntegrator } from "../core/integrators/EulerIntegrator.js";
import { inspectSelectedTracer } from "../interaction/TracerInspection.js";
import { TracerSelection } from "../interaction/TracerSelection.js";
import { GuidedExperimentId } from "../guided/GuidedExperiment.js";
import type { ExploreSceneSlots } from "../explore/ExplorePointReleaseOrchestration.js";
import { resolveTracerPointerUp } from "../ui/tracer/resolveTracerPointerUp.js";
import { DEMO_SCENARIO } from "../scenario/DEMO_SCENARIO.js";
import {
  composeDemoTracerFields,
  composeDemoTracersWithObservation,
} from "./composeDemoTracerSimulation.js";
import composeDemoTracerSimulationSrc from "./composeDemoTracerSimulation.ts?raw";
import {
  createExploreLab,
  resetExploreLab,
} from "./createExploreLab.js";
import createExploreLabSrc from "./createExploreLab.ts?raw";
import { createGuidedLab } from "./createGuidedLab.js";
import createGuidedLabSrc from "./createGuidedLab.ts?raw";
import { DEMO_VISUAL_AIRFLOW_POPULATION } from "./demoVisualAirflowFixture.js";
import { IntegrationFrame } from "./IntegrationFrame.js";
import { advanceLaboratoryFixedStep } from "../ui/tracer/advanceLaboratoryFixedStep.js";
import appSrc from "./App.tsx?raw";
import tracerViewportSrc from "../ui/tracer/TracerViewport.tsx?raw";
import visualAirflowPopulationSrc from "../visualization/VisualAirflowPopulation.ts?raw";

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

describe("Explore visual airflow composition", () => {
  it("owns a visual population on the same canonical V_total and Euler instance", () => {
    const lab = createExploreLab(fakeSlots());
    expect(lab.visualAirflowPopulation.occupantCount).toBe(
      DEMO_VISUAL_AIRFLOW_POPULATION.count,
    );
    expect(
      lab.visualAirflowPopulation.samplesField(lab.velocityObservation.total),
    ).toBe(true);

    const rebuilt = composeDemoTracerFields(
      IntegrationFrame.StormRelativeLaboratory,
    ).field;
    expect(lab.visualAirflowPopulation.samplesField(rebuilt)).toBe(false);
    expect(lab.velocityObservation.total).not.toBe(rebuilt);

    const composed = composeDemoTracersWithObservation(
      IntegrationFrame.StormRelativeLaboratory,
      [],
    );
    expect(composed.integrator).toBeInstanceOf(EulerIntegrator);
    expect(createExploreLabSrc).toMatch(
      /new VisualAirflowPopulation\(\s*velocityObservation\.total,\s*integrator/,
    );
    expect(composeDemoTracerSimulationSrc).toMatch(
      /const integrator = new EulerIntegrator/,
    );
    expect(composeDemoTracerSimulationSrc).toMatch(
      /new Simulation\(\s*velocityObservation\.total,\s*integrator/,
    );
    expect(createExploreLabSrc).not.toMatch(/composeDemoTracerFields/);
    expect(createExploreLabSrc).not.toMatch(/RK2Integrator/);
  });

  it("creates a fresh population for a fresh Explore lab", () => {
    const a = createExploreLab(fakeSlots());
    const b = createExploreLab(fakeSlots());
    expect(a.visualAirflowPopulation).not.toBe(b.visualAirflowPopulation);
    expect(a.velocityObservation.total).not.toBe(b.velocityObservation.total);
    expect(a.visualAirflowPopulation.occupants()).toEqual(
      b.visualAirflowPopulation.occupants(),
    );
    expect(a.simulation.particles).toHaveLength(0);
    expect(a.visualAirflowPopulation.occupantCount).toBeGreaterThan(0);
  });

  it("does not wire a visual population into Guided", () => {
    const guided = createGuidedLab(GuidedExperimentId.InflowToUpperOutflow);
    expect("visualAirflowPopulation" in guided).toBe(false);
    expect(createGuidedLabSrc).not.toMatch(/VisualAirflowPopulation/);
    expect(createGuidedLabSrc).not.toMatch(/DEMO_VISUAL_AIRFLOW_POPULATION/);
    expect(appSrc).toMatch(
      /lab\.kind === "explore" \? lab\.visualAirflowPopulation : null/,
    );
  });
});

describe("Explore visual airflow lifecycle", () => {
  it("Reset reseeds the population without replacing the canonical field", () => {
    const lab = createExploreLab(fakeSlots());
    const field = lab.velocityObservation.total;
    const initial = lab.visualAirflowPopulation.occupants();
    lab.session.releasePoint({ x: 0, y: 100, z: 0 });
    advanceLaboratoryFixedStep(lab.simulation, 0.1, {
      pathHistory: lab.pathHistory,
      visualAirflowPopulation: lab.visualAirflowPopulation,
    });
    expect(lab.visualAirflowPopulation.occupants()).not.toEqual(initial);

    resetExploreLab(lab);
    expect(lab.visualAirflowPopulation.occupants()).toEqual(initial);
    expect(lab.visualAirflowPopulation.samplesField(field)).toBe(true);
    expect(lab.velocityObservation.total).toBe(field);
    expect(lab.simulation.clock.time).toBe(0);
    expect(lab.simulation.particles[0]!.position).toEqual({
      x: 0,
      y: 100,
      z: 0,
    });
    expect(appSrc).toMatch(/resetExploreLab\(lab\)/);
  });

  it("Clear drops scientific tracers and leaves background airflow", () => {
    const lab = createExploreLab(fakeSlots());
    lab.session.releasePoint({ x: 10, y: 20, z: 30 });
    advanceLaboratoryFixedStep(lab.simulation, 0.1, {
      pathHistory: lab.pathHistory,
      visualAirflowPopulation: lab.visualAirflowPopulation,
    });
    const afterStep = lab.visualAirflowPopulation.occupants();
    const selection = new TracerSelection();
    selection.select(lab.simulation.particles[0]!.tracerId);

    lab.orchestration.clear();
    selection.clear();
    expect(lab.simulation.particles).toHaveLength(0);
    expect(selection.selectedId).toBeNull();
    expect(lab.visualAirflowPopulation.occupants()).toEqual(afterStep);
    expect(
      inspectSelectedTracer(
        lab.simulation.particles,
        selection,
        lab.simulation.clock.time,
        lab.velocityObservation,
      ),
    ).toBeUndefined();
    expect(appSrc).toMatch(
      /orchestration\.clear\(\);\s*clearSelectionAndInspection\(\)/s,
    );
    expect(appSrc).not.toMatch(/visualAirflowPopulation\.reset\(\)/);
    expect(createExploreLabSrc).toMatch(/resetExploreLab/);
  });

  it("mode switch drops Explore ownership and re-entering creates a fresh population", () => {
    const explore = createExploreLab(fakeSlots());
    advanceLaboratoryFixedStep(explore.simulation, 0.1, {
      visualAirflowPopulation: explore.visualAirflowPopulation,
    });
    const moved = explore.visualAirflowPopulation.occupants();
    const guided = createGuidedLab(GuidedExperimentId.NearGroundOutflow);
    expect("visualAirflowPopulation" in guided).toBe(false);
    expect(guided.simulation).not.toBe(explore.simulation);

    const reentered = createExploreLab(fakeSlots());
    expect(reentered.visualAirflowPopulation).not.toBe(
      explore.visualAirflowPopulation,
    );
    expect(reentered.visualAirflowPopulation.occupants()).not.toEqual(moved);
    expect(reentered.simulation.clock.time).toBe(0);
    expect(appSrc).toMatch(
      /enterExplore[\s\S]*createExploreLab/s,
    );
    expect(appSrc).toMatch(
      /enterGuided[\s\S]*createGuidedLab\(guidedExperimentId\)/s,
    );
  });
});

describe("Explore visual airflow interaction regressions", () => {
  it("keeps glyph-over-placement arbitration and ignores background markers", () => {
    const ray = {
      origin: { x: 0, y: 1000, z: 0 },
      direction: { x: 0, y: -1, z: 0 },
    };
    expect(
      resolveTracerPointerUp({
        pointerMovementPx: 0,
        hitSlotIndex: 0,
        placementAvailable: true,
        ray,
      }).action,
    ).toBe("select");
    expect(
      resolveTracerPointerUp({
        pointerMovementPx: 0,
        hitSlotIndex: null,
        placementAvailable: true,
        ray,
      }).action,
    ).toBe("placement");
    expect(tracerViewportSrc).toMatch(/pickVisibleTracer/);
    expect(tracerViewportSrc).not.toMatch(/pickVisibleTracerSlotIndex\([^\)]*visual/);
  });

  it("still assigns tracerId to a released scientific tracer", () => {
    const lab = createExploreLab(fakeSlots());
    lab.session.releasePoint({ x: 100, y: 200, z: 300 });
    expect(lab.simulation.particles[0]!.tracerId).toBe(1);
    expect(
      inspectSelectedTracer(
        lab.simulation.particles,
        new TracerSelection(),
        lab.simulation.clock.time,
        lab.velocityObservation,
      ),
    ).toBeUndefined();
    const selection = new TracerSelection();
    selection.select(1);
    const inspection = inspectSelectedTracer(
      lab.simulation.particles,
      selection,
      lab.simulation.clock.time,
      lab.velocityObservation,
    );
    expect(inspection?.tracerId).toBe(1);
    expect(inspection?.position).toEqual({ x: 100, y: 200, z: 300 });
  });

  it("does not turn visual occupants into inspectable tracers", () => {
    expect(visualAirflowPopulationSrc).not.toMatch(/readonly tracerId/);
    expect(DEMO_VISUAL_AIRFLOW_POPULATION.volume.min.y).toBeGreaterThanOrEqual(
      0,
    );
    expect(DEMO_VISUAL_AIRFLOW_POPULATION.count).toBe(256);
    expect(DEMO_VISUAL_AIRFLOW_POPULATION.maxAge).toBe(80);
    expect(DEMO_SCENARIO.storm.updraft.topHeight).toBe(8000);
  });
});
