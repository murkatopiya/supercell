import { describe, expect, it } from "vitest";
import { inspectSelectedTracer } from "../interaction/TracerInspection.js";
import { TracerSelection } from "../interaction/TracerSelection.js";
import { GuidedExperimentId } from "../guided/GuidedExperiment.js";
import type { ExploreSceneSlots } from "../explore/ExplorePointReleaseOrchestration.js";
import { resolveTracerPointerUp } from "../ui/tracer/resolveTracerPointerUp.js";
import {
  createExploreLab,
  resetExploreLab,
} from "./createExploreLab.js";
import createExploreLabSrc from "./createExploreLab.ts?raw";
import { createGuidedLab } from "./createGuidedLab.js";
import createGuidedLabSrc from "./createGuidedLab.ts?raw";
import { DEMO_EULERIAN_AIRFLOW_SAMPLES } from "./demoEulerianAirflowFixture.js";
import { DEMO_VISUAL_AIRFLOW_POPULATION } from "./demoVisualAirflowFixture.js";
import { advanceLaboratoryFixedStep } from "../ui/tracer/advanceLaboratoryFixedStep.js";
import appSrc from "./App.tsx?raw";
import tracerViewportSrc from "../ui/tracer/TracerViewport.tsx?raw";
import workbenchSceneSrc from "../rendering/VisualAirflowWorkbenchScene.ts?raw";
import eulerianSrc from "../visualization/EulerianAirflowSamples.ts?raw";
import observeSrc from "../visualization/observeAdvectedOrientedAirflow.ts?raw";

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

describe("Explore perceptual airflow workbench composition", () => {
  it("owns Eulerian samples on the same canonical V_total as the population", () => {
    const lab = createExploreLab(fakeSlots());
    expect(lab.eulerianAirflowSamples.sampleCount).toBe(
      DEMO_EULERIAN_AIRFLOW_SAMPLES.count,
    );
    expect(lab.eulerianAirflowSamples.sampleCount).toBe(
      DEMO_VISUAL_AIRFLOW_POPULATION.count,
    );
    expect(
      lab.eulerianAirflowSamples.samplesField(lab.velocityObservation.total),
    ).toBe(true);
    expect(
      lab.visualAirflowPopulation.samplesField(lab.velocityObservation.total),
    ).toBe(true);
    expect(createExploreLabSrc).toMatch(
      /new EulerianAirflowSamples\(\s*velocityObservation\.total/,
    );
  });

  it("does not wire workbench encodings into Guided", () => {
    const guided = createGuidedLab(GuidedExperimentId.InflowToUpperOutflow);
    expect("visualAirflowPopulation" in guided).toBe(false);
    expect("eulerianAirflowSamples" in guided).toBe(false);
    expect(createGuidedLabSrc).not.toMatch(/EulerianAirflowSamples/);
    expect(createGuidedLabSrc).not.toMatch(/VisualAirflowWorkbenchControls/);
    const exploreShell = appSrc.slice(
      appSrc.indexOf("workbench--explore"),
      appSrc.indexOf("workbench--guided"),
    );
    expect(exploreShell).toMatch(/VisualAirflowWorkbenchControls/);
    const guidedShell = appSrc.slice(appSrc.indexOf("workbench--guided"));
    expect(guidedShell).not.toMatch(/VisualAirflowWorkbenchControls/);
  });
});

describe("Workbench representation switching lifecycle", () => {
  it("is UI state: switch does not recreate Simulation, field, or tracers", () => {
    const lab = createExploreLab(fakeSlots());
    lab.session.releasePoint({ x: 100, y: 200, z: 300 });
    const simulation = lab.simulation;
    const field = lab.velocityObservation.total;
    const population = lab.visualAirflowPopulation;
    const eulerian = lab.eulerianAirflowSamples;
    const selection = new TracerSelection();
    selection.select(1);
    const inspection = inspectSelectedTracer(
      lab.simulation.particles,
      selection,
      lab.simulation.clock.time,
      lab.velocityObservation,
    );
    expect(inspection?.tracerId).toBe(1);

    expect(appSrc).toMatch(
      /const \[workbenchMode, setWorkbenchMode\]/,
    );
    expect(appSrc).toMatch(/onModeChange=\{setWorkbenchMode\}/);
    expect(appSrc).not.toMatch(/setWorkbenchMode\([^)]*setLab/);
    expect(appSrc).not.toMatch(/setWorkbenchMode\([^)]*createExploreLab/);
    expect(tracerViewportSrc).toMatch(/workbenchModeRef\.current = workbenchMode/);
    expect(tracerViewportSrc).not.toMatch(
      /workbenchMode,\s*depthCueEnabled,/,
    );
    expect(tracerViewportSrc).toMatch(
      /simulation,\s*timestep,\s*pathHistory,\s*keepInactiveGlyphs,\s*visualAirflowPopulation,/,
    );

    expect(lab.simulation).toBe(simulation);
    expect(lab.velocityObservation.total).toBe(field);
    expect(lab.visualAirflowPopulation).toBe(population);
    expect(lab.eulerianAirflowSamples).toBe(eulerian);
    expect(lab.simulation.clock.time).toBe(0);
    expect(lab.simulation.particles[0]!.tracerId).toBe(1);
    expect(selection.selectedId).toBe(1);
  });

  it("depth cue is orthogonal UI state and does not rebuild the field", () => {
    const lab = createExploreLab(fakeSlots());
    const field = lab.velocityObservation.total;
    const count = lab.visualAirflowPopulation.occupantCount;
    expect(appSrc).toMatch(/const \[depthCueEnabled, setDepthCueEnabled\]/);
    expect(appSrc).toMatch(/onDepthCueChange=\{setDepthCueEnabled\}/);
    expect(appSrc).not.toMatch(/setDepthCueEnabled\([^)]*createExploreLab/);
    expect(tracerViewportSrc).toMatch(/setDepthCueEnabled\(depthCueEnabledRef/);
    expect(lab.velocityObservation.total).toBe(field);
    expect(lab.visualAirflowPopulation.occupantCount).toBe(count);
  });

  it("keeps the hidden visual population stepping with laboratory time", () => {
    const lab = createExploreLab(fakeSlots());
    const before = lab.visualAirflowPopulation.occupants();
    const eulerianBefore = new Float32Array(
      lab.eulerianAirflowSamples.sampleCount * 3,
    );
    lab.eulerianAirflowSamples.writePositionsTo(eulerianBefore);
    advanceLaboratoryFixedStep(lab.simulation, 0.5, {
      pathHistory: lab.pathHistory,
      visualAirflowPopulation: lab.visualAirflowPopulation,
    });
    expect(lab.visualAirflowPopulation.occupants()).not.toEqual(before);
    const eulerianAfter = new Float32Array(
      lab.eulerianAirflowSamples.sampleCount * 3,
    );
    lab.eulerianAirflowSamples.writePositionsTo(eulerianAfter);
    expect(Array.from(eulerianAfter)).toEqual(Array.from(eulerianBefore));
    expect(tracerViewportSrc).toMatch(/visualAirflowPopulation,/);
    expect(tracerViewportSrc).not.toMatch(
      /workbenchModeRef\.current === "points"[\s\S]*visualAirflowPopulation/,
    );
  });

  it("Reset reseeds R0/R1 and leaves R2 positions; Clear leaves background", () => {
    const lab = createExploreLab(fakeSlots());
    const initialPop = lab.visualAirflowPopulation.occupants();
    const initialEulerian = new Float32Array(
      lab.eulerianAirflowSamples.sampleCount * 3,
    );
    lab.eulerianAirflowSamples.writePositionsTo(initialEulerian);
    lab.session.releasePoint({ x: 0, y: 100, z: 0 });
    advanceLaboratoryFixedStep(lab.simulation, 0.2, {
      pathHistory: lab.pathHistory,
      visualAirflowPopulation: lab.visualAirflowPopulation,
    });
    resetExploreLab(lab);
    expect(lab.visualAirflowPopulation.occupants()).toEqual(initialPop);
    expect(lab.simulation.clock.time).toBe(0);
    const afterResetEulerian = new Float32Array(
      lab.eulerianAirflowSamples.sampleCount * 3,
    );
    lab.eulerianAirflowSamples.writePositionsTo(afterResetEulerian);
    expect(Array.from(afterResetEulerian)).toEqual(Array.from(initialEulerian));

    lab.session.releasePoint({ x: 1, y: 2, z: 3 });
    lab.orchestration.clear();
    expect(lab.simulation.particles).toHaveLength(0);
    expect(lab.visualAirflowPopulation.occupants()).toEqual(initialPop);
    expect(appSrc).toMatch(/resetExploreLab\(lab\)/);
    expect(appSrc).not.toMatch(/eulerianAirflowSamples\.reset/);
  });

  it("Explore↔Guided round-trip resets airflow product state to Comets defaults", () => {
    expect(appSrc).toMatch(
      /enterExplore[\s\S]*setWorkbenchMode\(DEFAULT_VISUAL_AIRFLOW_WORKBENCH_MODE\)/s,
    );
    expect(appSrc).toMatch(
      /enterGuided[\s\S]*setWorkbenchMode\(DEFAULT_VISUAL_AIRFLOW_WORKBENCH_MODE\)/s,
    );
    expect(appSrc).toMatch(
      /enterExplore[\s\S]*setDepthCueEnabled\(false\)/s,
    );
    expect(appSrc).toMatch(
      /enterExplore[\s\S]*setPauseVisualization\(DEFAULT_VISUAL_AIRFLOW_PAUSE_VISUALIZATION\)/s,
    );
    expect(appSrc).toMatch(
      /enterExplore[\s\S]*setHighlightMode\(DEFAULT_OPERAND_HIGHLIGHT_MODE\)/s,
    );
    expect(appSrc).not.toMatch(/localStorage/);
  });

  it("keeps glyph-over-placement arbitration", () => {
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
    expect(workbenchSceneSrc).toMatch(/writeAdvectedOrientedAirflow/);
    expect(observeSrc).toMatch(/samplesField/);
    expect(eulerianSrc).not.toMatch(/new VisualAirflowPopulation/);
  });
});
