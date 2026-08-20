import { describe, expect, it } from "vitest";
import type { ExploreSceneSlots } from "../explore/ExplorePointReleaseOrchestration.js";
import { inspectSelectedTracer } from "../interaction/TracerInspection.js";
import { TracerSelection } from "../interaction/TracerSelection.js";
import { GuidedExperimentId } from "../guided/GuidedExperiment.js";
import { ConstantVelocityField } from "../physics/synthetic/ConstantVelocityField.js";
import { createExploreLab } from "./createExploreLab.js";
import { createGuidedLab } from "./createGuidedLab.js";
import { composeDemoTracersWithObservation, DEMO_VELOCITY_CONTRIBUTION_KEYS } from "./composeDemoTracerSimulation.js";
import { IntegrationFrame } from "./IntegrationFrame.js";
import { stepVisualAirflowOnFrozenField } from "../visualization/stepVisualAirflowOnFrozenField.js";
import {
  displayReferenceMpsForOperand,
  resolveStormOperandHighlightField,
  STORM_OPERAND_HIGHLIGHT_KEYS,
} from "../visualization/operandContributionDisplay.js";
import { writeContributionDisplayStrengths } from "../visualization/writeContributionDisplayStrengths.js";
import { VisualAirflowWorkbenchScene } from "../rendering/VisualAirflowWorkbenchScene.js";
import {
  DEFAULT_VISUAL_AIRFLOW_PAUSE_VISUALIZATION,
} from "../rendering/visualAirflowWorkbenchMode.js";
import appSrc from "./App.tsx?raw";
import createGuidedLabSrc from "./createGuidedLab.ts?raw";
import highlightSrc from "../visualization/writeContributionDisplayStrengths.ts?raw";
import displaySrc from "../visualization/operandContributionDisplay.ts?raw";
import viewportSrc from "../ui/tracer/TracerViewport.tsx?raw";
import controlsSrc from "../ui/tracer/VisualAirflowWorkbenchControls.tsx?raw";
import workbenchSrc from "../rendering/VisualAirflowWorkbenchScene.ts?raw";
import * as THREE from "three";

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

function cometBuffers(scene: VisualAirflowWorkbenchScene) {
  const comets = scene.object.getObjectByName(
    "cometAirflowMarks",
  ) as THREE.LineSegments;
  return {
    positions: Array.from(
      (comets.geometry.getAttribute("position") as THREE.BufferAttribute).array,
    ),
    colors: Array.from(
      (comets.geometry.getAttribute("color") as THREE.BufferAttribute).array,
    ),
  };
}

function namedField(
  lab: ReturnType<typeof createExploreLab>,
  key: (typeof STORM_OPERAND_HIGHLIGHT_KEYS)[number],
) {
  const field = resolveStormOperandHighlightField(
    lab.velocityObservation.parts,
    key,
  );
  if (field === null) {
    throw new Error(`expected ${key} operand`);
  }
  return field;
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

  it("keeps full freeze as the V1 Pause default and viewport branch", () => {
    expect(viewportSrc).toMatch(/frozen-field-animation/);
    expect(viewportSrc).toMatch(/stepVisualAirflowOnFrozenField/);
    expect(viewportSrc).toMatch(/visualAirflowElapsedFromWall/);
    expect(viewportSrc).toMatch(/let visualAccumulator = 0/);
    expect(DEFAULT_VISUAL_AIRFLOW_PAUSE_VISUALIZATION).toBe("full-freeze");
    expect(appSrc).toMatch(/DEFAULT_VISUAL_AIRFLOW_PAUSE_VISUALIZATION/);
    expect(controlsSrc).not.toMatch(/Pause viz/);
    expect(controlsSrc).not.toMatch(/Animate frozen field/);
    expect(viewportSrc).toMatch(/time: simulation\.clock\.time/);
    expect(viewportSrc).toMatch(/highlightOperand: highlightOperandRef\.current/);
  });
});

describe("storm operand highlight observation", () => {
  it("resolves each diagnostic operand to the SAME named Inspector instance", () => {
    const lab = createExploreLab(fakeSlots());
    const total = lab.velocityObservation.total;
    expect(STORM_OPERAND_HIGHLIGHT_KEYS).not.toContain("environmentAdvection");
    expect(DEMO_VELOCITY_CONTRIBUTION_KEYS).toEqual([
      "environmentAdvection",
      ...STORM_OPERAND_HIGHLIGHT_KEYS,
    ]);
    for (const key of STORM_OPERAND_HIGHLIGHT_KEYS) {
      const resolved = namedField(lab, key);
      expect(resolved).toBe(
        lab.velocityObservation.parts!.find((part) => part.key === key)!.field,
      );
      expect(resolved).toBe(
        resolveStormOperandHighlightField(lab.velocityObservation.parts, key),
      );
      expect(lab.visualAirflowPopulation.samplesField(resolved)).toBe(false);
      expect(lab.velocityObservation.total).toBe(total);
      expect(total).not.toBe(resolved);
    }
    expect(
      lab.visualAirflowPopulation.samplesField(lab.velocityObservation.total),
    ).toBe(true);
    const rebuilt = composeDemoTracersWithObservation(
      IntegrationFrame.StormRelativeLaboratory,
      [],
    );
    expect(namedField(lab, "updraft")).not.toBe(
      rebuilt.velocityObservation.parts!.find((part) => part.key === "updraft")!
        .field,
    );
    expect(appSrc).toMatch(/resolveStormOperandHighlightField/);
    expect(appSrc).not.toMatch(/createUpdraftField/);
    expect(appSrc).not.toMatch(/createRotationField/);
    expect(appSrc).not.toMatch(/createLowerRadialInflowField/);
    expect(appSrc).not.toMatch(/createUpperRadialOutflowField/);
    expect(appSrc).not.toMatch(/createDowndraftField/);
    expect(appSrc).not.toMatch(/createNearGroundRadialOutflowField/);
    expect(highlightSrc).not.toMatch(/createUpdraftField/);
    expect(workbenchSrc).not.toMatch(/createUpdraftField/);
    expect(displaySrc).not.toMatch(/DEMO_SCENARIO/);
  });

  it("tints from operand magnitude without changing V_total or comet endpoints", () => {
    const lab = createExploreLab(fakeSlots());
    const total = lab.velocityObservation.total;
    const scene = new VisualAirflowWorkbenchScene(
      lab.visualAirflowPopulation.occupantCount,
      lab.eulerianAirflowSamples.sampleCount,
    );
    const sync = (
      highlightMode: "off" | (typeof STORM_OPERAND_HIGHLIGHT_KEYS)[number],
    ) => {
      scene.sync({
        mode: "advected-comet",
        population: lab.visualAirflowPopulation,
        eulerian: lab.eulerianAirflowSamples,
        field: lab.velocityObservation.total,
        time: 0,
        highlightMode,
        highlightOperand:
          highlightMode === "off" ? null : namedField(lab, highlightMode),
      });
    };

    sync("off");
    const off = cometBuffers(scene);
    const colorsByOperand: Record<string, number[]> = {};
    for (const key of STORM_OPERAND_HIGHLIGHT_KEYS) {
      sync(key);
      const tinted = cometBuffers(scene);
      expect(lab.velocityObservation.total).toBe(total);
      expect(tinted.positions).toEqual(off.positions);
      colorsByOperand[key] = tinted.colors;
    }
    expect(colorsByOperand.updraft).not.toEqual(off.colors);
    expect(colorsByOperand.rotation).not.toEqual(colorsByOperand.updraft);
    expect(colorsByOperand.lowerInflow).not.toEqual(colorsByOperand.updraft);
    expect(colorsByOperand.downdraft).not.toEqual(colorsByOperand.updraft);
    expect(colorsByOperand.upperOutflow).not.toEqual(
      colorsByOperand.nearGroundOutflow,
    );

    sync("off");
    expect(cometBuffers(scene).colors).toEqual(off.colors);
    expect(cometBuffers(scene).positions).toEqual(off.positions);
    expect(lab.velocityObservation.total).toBe(total);
    scene.dispose();
  });

  it("uses a per-operand display reference so a weak configured peak stays readable", () => {
    const lab = createExploreLab(fakeSlots());
    const lower = namedField(lab, "lowerInflow");
    const occupantPositions = new Float32Array(
      lab.visualAirflowPopulation.occupantCount * 3,
    );
    lab.visualAirflowPopulation.writePositionsTo(occupantPositions);
    const unified = new Float32Array(lab.visualAirflowPopulation.occupantCount);
    const diagnostic = new Float32Array(
      lab.visualAirflowPopulation.occupantCount,
    );
    writeContributionDisplayStrengths(
      lower,
      occupantPositions,
      lab.visualAirflowPopulation.occupantCount,
      0,
      unified,
      30,
    );
    writeContributionDisplayStrengths(
      lower,
      occupantPositions,
      lab.visualAirflowPopulation.occupantCount,
      0,
      diagnostic,
      displayReferenceMpsForOperand("lowerInflow"),
    );
    expect(Math.max(...unified)).toBeLessThan(0.15);
    expect(Math.max(...diagnostic)).toBeGreaterThan(0.9);
    expect(lab.velocityObservation.total).not.toBe(lower);
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
      highlightOperand: namedField(lab, "updraft"),
    });
    scene.sync({
      mode: "advected-comet",
      population: lab.visualAirflowPopulation,
      eulerian: lab.eulerianAirflowSamples,
      field: lab.velocityObservation.total,
      time: 0,
      highlightMode: "updraft",
      highlightOperand: namedField(lab, "updraft"),
    });
    expect(scene.object.getObjectByName("updraftHighlightBackground")).toBeUndefined();
    expect(workbenchSrc).not.toMatch(/OperandHighlightBackgroundScene/);
    scene.dispose();
  });

  it("does not treat a dummy field as a canonical storm operand", () => {
    const lab = createExploreLab(fakeSlots());
    expect(namedField(lab, "updraft")).not.toBe(
      new ConstantVelocityField({ x: 0, y: 30, z: 0 }),
    );
    expect(
      resolveStormOperandHighlightField(
        [{ key: "updraft", field: new ConstantVelocityField({ x: 0, y: 1, z: 0 }) }],
        "updraft",
      ),
    ).not.toBe(namedField(lab, "updraft"));
  });

  it("does not couple highlight to Inspector, picking, or tracerId", () => {
    const lab = createExploreLab(fakeSlots());
    lab.session.releasePoint({ x: 0, y: 1000, z: 0 });
    const selection = new TracerSelection();
    selection.select(1);
    const inspection = inspectSelectedTracer(
      lab.simulation.particles,
      selection,
      lab.simulation.clock.time,
      lab.velocityObservation,
    );
    expect(inspection?.tracerId).toBe(1);
    expect(inspection?.contributions?.map((part) => part.key)).toEqual([
      ...DEMO_VELOCITY_CONTRIBUTION_KEYS,
    ]);
    expect(workbenchSrc).not.toMatch(/tracerId/);
    expect(workbenchSrc).not.toMatch(/inspectSelectedTracer/);
  });
});

describe("workbench control independence", () => {
  it("does not wire highlight or pause visualization into Guided", () => {
    const guided = createGuidedLab(GuidedExperimentId.InflowToUpperOutflow);
    expect("visualAirflowPopulation" in guided).toBe(false);
    expect(createGuidedLabSrc).not.toMatch(/OperandHighlight/);
    expect(createGuidedLabSrc).not.toMatch(/pauseVisualization/);
    expect(createGuidedLabSrc).not.toMatch(/VisualAirflowWorkbenchControls/);
    expect(appSrc).toMatch(/onHighlightModeChange=\{setHighlightMode\}/);
    expect(appSrc).toMatch(/pauseVisualization=\{pauseVisualization\}/);
    expect(appSrc).not.toMatch(/onPauseVisualizationChange=\{setPauseVisualization\}/);
    expect(appSrc).not.toMatch(/setHighlightMode\([^)]*setWorkbenchMode/);
    expect(appSrc).not.toMatch(/setPauseVisualization\([^)]*setWorkbenchMode/);
    expect(controlsSrc).toMatch(/onHighlightModeChange\("off"\)/);
    expect(controlsSrc).not.toMatch(/Background/);
    expect(controlsSrc).not.toMatch(/type=["']color["']/);
    expect(controlsSrc).not.toMatch(/environmentAdvection/);
    expect(controlsSrc).not.toMatch(/Hue A|hue-a/);
  });
});
