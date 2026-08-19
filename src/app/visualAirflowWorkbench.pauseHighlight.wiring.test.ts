import { describe, expect, it } from "vitest";
import type { ExploreSceneSlots } from "../explore/ExplorePointReleaseOrchestration.js";
import { inspectSelectedTracer } from "../interaction/TracerInspection.js";
import { TracerSelection } from "../interaction/TracerSelection.js";
import { GuidedExperimentId } from "../guided/GuidedExperiment.js";
import { ConstantVelocityField } from "../physics/synthetic/ConstantVelocityField.js";
import { createExploreLab } from "./createExploreLab.js";
import { createGuidedLab } from "./createGuidedLab.js";
import { composeDemoTracersWithObservation } from "./composeDemoTracerSimulation.js";
import { IntegrationFrame } from "./IntegrationFrame.js";
import { stepVisualAirflowOnFrozenField } from "../visualization/stepVisualAirflowOnFrozenField.js";
import { writeContributionDisplayStrengths } from "../visualization/writeContributionDisplayStrengths.js";
import { VisualAirflowWorkbenchScene } from "../rendering/VisualAirflowWorkbenchScene.js";
import {
  DEFAULT_VISUAL_AIRFLOW_PAUSE_VISUALIZATION,
} from "../rendering/visualAirflowWorkbenchMode.js";
import appSrc from "./App.tsx?raw";
import createGuidedLabSrc from "./createGuidedLab.ts?raw";
import highlightSrc from "../visualization/writeContributionDisplayStrengths.ts?raw";
import viewportSrc from "../ui/tracer/TracerViewport.tsx?raw";
import controlsSrc from "../ui/tracer/VisualAirflowWorkbenchControls.tsx?raw";

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

function updraftFieldFromLab(lab: ReturnType<typeof createExploreLab>) {
  const part = lab.velocityObservation.parts?.find(
    (item) => item.key === "updraft",
  );
  if (part === undefined) {
    throw new Error("expected updraft operand");
  }
  return part.field;
}

describe("frozen-field pause animation", () => {
  it("moves visual occupants at t_pause without advancing science", () => {
    const lab = createExploreLab(fakeSlots());
    lab.session.releasePoint({ x: 0, y: 100, z: 0 });
    const tPause = lab.simulation.clock.time;
    const particle = { ...lab.simulation.particles[0]!.position };
    const before = lab.visualAirflowPopulation.occupants();
    stepVisualAirflowOnFrozenField(lab.visualAirflowPopulation, 0.5, tPause);
    stepVisualAirflowOnFrozenField(lab.visualAirflowPopulation, 0.5, tPause);
    expect(lab.simulation.clock.time).toBe(tPause);
    expect(lab.simulation.particles[0]!.position).toEqual(particle);
    expect(lab.visualAirflowPopulation.occupants()).not.toEqual(before);
    const selection = new TracerSelection();
    selection.select(1);
    const inspection = inspectSelectedTracer(
      lab.simulation.particles,
      selection,
      lab.simulation.clock.time,
      lab.velocityObservation,
    );
    expect(inspection?.position).toEqual(particle);
    expect(inspection?.time).toBe(tPause);
  });

  it("keeps full freeze as the workbench default and viewport branch", () => {
    expect(viewportSrc).toMatch(/frozen-field-animation/);
    expect(viewportSrc).toMatch(/stepVisualAirflowOnFrozenField/);
    expect(viewportSrc).toMatch(/visualAirflowElapsedFromWall/);
    expect(viewportSrc).toMatch(/let visualAccumulator = 0/);
    expect(DEFAULT_VISUAL_AIRFLOW_PAUSE_VISUALIZATION).toBe("full-freeze");
    expect(appSrc).toMatch(/DEFAULT_VISUAL_AIRFLOW_PAUSE_VISUALIZATION/);
    expect(controlsSrc).toMatch(/"full-freeze"/);
  });
});

describe("updraft highlight observation", () => {
  it("uses the SAME named updraft operand instance as Inspector decomposition", () => {
    const lab = createExploreLab(fakeSlots());
    const updraft = updraftFieldFromLab(lab);
    expect(updraft).toBe(
      lab.velocityObservation.parts!.find((part) => part.key === "updraft")!
        .field,
    );
    expect(lab.visualAirflowPopulation.samplesField(updraft)).toBe(false);
    expect(
      lab.visualAirflowPopulation.samplesField(lab.velocityObservation.total),
    ).toBe(true);
    expect(lab.velocityObservation.total).not.toBe(updraft);
    const rebuilt = composeDemoTracersWithObservation(
      IntegrationFrame.StormRelativeLaboratory,
      [],
    );
    const rebuiltUpdraft = rebuilt.velocityObservation.parts!.find(
      (part) => part.key === "updraft",
    )!.field;
    expect(updraft).not.toBe(rebuiltUpdraft);
    expect(highlightSrc).not.toMatch(/createUpdraftField/);
    expect(appSrc).toMatch(/item\.key === "updraft"/);
  });

  it("tints marks from operand magnitude without changing advection field", () => {
    const lab = createExploreLab(fakeSlots());
    const updraft = updraftFieldFromLab(lab);
    const positions = new Float32Array([0, 4000, 0]);
    const core = new Float32Array(1);
    const far = new Float32Array(1);
    writeContributionDisplayStrengths(
      updraft,
      positions,
      1,
      0,
      core,
    );
    writeContributionDisplayStrengths(
      updraft,
      new Float32Array([-20000, 4000, -20000]),
      1,
      0,
      far,
    );
    expect(core[0]!).toBeGreaterThan(far[0]!);
    expect(lab.velocityObservation.total).not.toBe(updraft);

    const occupantPositions = new Float32Array(
      lab.visualAirflowPopulation.occupantCount * 3,
    );
    lab.visualAirflowPopulation.writePositionsTo(occupantPositions);
    const occupantStrengths = new Float32Array(
      lab.visualAirflowPopulation.occupantCount,
    );
    writeContributionDisplayStrengths(
      updraft,
      occupantPositions,
      lab.visualAirflowPopulation.occupantCount,
      0,
      occupantStrengths,
    );
    let maxStrength = 0;
    let visible = 0;
    for (const strength of occupantStrengths) {
      if (strength > maxStrength) {
        maxStrength = strength;
      }
      if (strength >= 0.15) {
        visible += 1;
      }
    }
    expect(maxStrength).toBeGreaterThan(0.9);
    expect(maxStrength).toBeLessThanOrEqual(1);
    expect(visible).toBeGreaterThan(lab.visualAirflowPopulation.occupantCount / 3);
  });

  it("does not construct the rejected Background overlay", () => {
    const lab = createExploreLab(fakeSlots());
    const scene = new VisualAirflowWorkbenchScene(
      lab.visualAirflowPopulation.occupantCount,
      lab.eulerianAirflowSamples.sampleCount,
    );
    expect(scene.object.getObjectByName("updraftHighlightBackground")).toBeUndefined();
    scene.sync({
      mode: "advected-comet",
      population: lab.visualAirflowPopulation,
      eulerian: lab.eulerianAirflowSamples,
      field: lab.velocityObservation.total,
      time: 0,
      highlightMode: "off",
      highlightOperand: updraftFieldFromLab(lab),
    });
    scene.sync({
      mode: "advected-comet",
      population: lab.visualAirflowPopulation,
      eulerian: lab.eulerianAirflowSamples,
      field: lab.velocityObservation.total,
      time: 0,
      highlightMode: "hue-a",
      highlightOperand: updraftFieldFromLab(lab),
    });
    expect(scene.object.getObjectByName("updraftHighlightBackground")).toBeUndefined();
    scene.dispose();
  });

  it("does not treat a dummy field as the updraft operand", () => {
    const lab = createExploreLab(fakeSlots());
    expect(updraftFieldFromLab(lab)).not.toBe(
      new ConstantVelocityField({ x: 0, y: 30, z: 0 }),
    );
  });
});

describe("workbench control independence", () => {
  it("does not wire highlight or pause visualization into Guided", () => {
    const guided = createGuidedLab(GuidedExperimentId.InflowToUpperOutflow);
    expect("visualAirflowPopulation" in guided).toBe(false);
    expect(createGuidedLabSrc).not.toMatch(/UpdraftHighlight/);
    expect(createGuidedLabSrc).not.toMatch(/pauseVisualization/);
    expect(appSrc).toMatch(/onHighlightModeChange=\{setHighlightMode\}/);
    expect(appSrc).toMatch(
      /onPauseVisualizationChange=\{setPauseVisualization\}/,
    );
    expect(appSrc).not.toMatch(/setHighlightMode\([^)]*setWorkbenchMode/);
    expect(appSrc).not.toMatch(/setPauseVisualization\([^)]*setWorkbenchMode/);
    expect(controlsSrc).toMatch(/onHighlightModeChange\("off"\)/);
    expect(controlsSrc).toMatch(/label: "Hue A"/);
    expect(controlsSrc).toMatch(/label: "Hue B"/);
    expect(controlsSrc).toMatch(/label: "Hue C"/);
    expect(controlsSrc).not.toMatch(/Background/);
    expect(controlsSrc).not.toMatch(/type=["']color["']/);
    expect(controlsSrc).not.toMatch(/environmentAdvection|rotation|downdraft/);
  });
});
