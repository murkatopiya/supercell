import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import * as THREE from "three";
import type { ExploreSceneSlots } from "../explore/ExplorePointReleaseOrchestration.js";
import { GuidedExperimentId } from "../guided/GuidedExperiment.js";
import { inspectSelectedTracer } from "../interaction/TracerInspection.js";
import { TracerSelection } from "../interaction/TracerSelection.js";
import { PICK_TOLERANCE_PX } from "../rendering/pickVisibleTracerSlot.js";
import {
  SELECTION_HALO_COLOR,
  createSelectionHaloMarker,
  selectionHaloRadiusM,
} from "../rendering/selectionHaloMarker.js";
import { DEEP_STORM_TRACER_VIEW } from "../rendering/deepStormTracerView.js";
import {
  DEFAULT_OPERAND_HIGHLIGHT_MODE,
  DEFAULT_VISUAL_AIRFLOW_PAUSE_VISUALIZATION,
  DEFAULT_VISUAL_AIRFLOW_WORKBENCH_MODE,
} from "../rendering/visualAirflowWorkbenchMode.js";
import { TRACER_COLORS } from "../rendering/tracerObserveSlot.js";
import { VisualAirflowWorkbenchControls } from "../ui/tracer/VisualAirflowWorkbenchControls.js";
import { DEMO_VELOCITY_CONTRIBUTION_KEYS } from "./composeDemoTracerSimulation.js";
import { createExploreLab } from "./createExploreLab.js";
import { createGuidedLab } from "./createGuidedLab.js";
import createGuidedLabSrc from "./createGuidedLab.ts?raw";
import appSrc from "./App.tsx?raw";
import controlsSrc from "../ui/tracer/VisualAirflowWorkbenchControls.tsx?raw";
import viewportSrc from "../ui/tracer/TracerViewport.tsx?raw";
import workbenchSceneSrc from "../rendering/VisualAirflowWorkbenchScene.ts?raw";
import cometSceneSrc from "../rendering/CometAirflowMarkScene.ts?raw";
import pointsSceneSrc from "../rendering/VisualAirflowScene.ts?raw";
import orientedSceneSrc from "../rendering/OrientedAirflowMarkScene.ts?raw";
import selectionHaloSrc from "../rendering/selectionHaloMarker.ts?raw";
import pickSrc from "../rendering/pickVisibleTracerSlot.ts?raw";
import followControlSrc from "../ui/tracer/ExploreFollowControl.tsx?raw";
import resetViewControlSrc from "../ui/tracer/ExploreResetViewControl.tsx?raw";
import guidedCatalogSrc from "../guided/GuidedExperiment.ts?raw";
import composeSrc from "./composeDemoTracerSimulation.ts?raw";

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

function productMarkup() {
  return renderToStaticMarkup(
    <VisualAirflowWorkbenchControls
      mode={DEFAULT_VISUAL_AIRFLOW_WORKBENCH_MODE}
      highlightMode={DEFAULT_OPERAND_HIGHLIGHT_MODE}
      depthCueEnabled={false}
      onModeChange={() => {}}
      onHighlightModeChange={() => {}}
      onDepthCueChange={() => {}}
    />,
  );
}

describe("M2 V1 visual-airflow product state", () => {
  it("A: fresh Explore product state defaults to Comets", () => {
    expect(DEFAULT_VISUAL_AIRFLOW_WORKBENCH_MODE).toBe("advected-comet");
    expect(appSrc).toMatch(
      /useState<VisualAirflowWorkbenchMode>\(DEFAULT_VISUAL_AIRFLOW_WORKBENCH_MODE\)/,
    );
    expect(viewportSrc).toMatch(
      /workbenchMode = DEFAULT_VISUAL_AIRFLOW_WORKBENCH_MODE/,
    );
    const html = productMarkup();
    expect(html).toContain("Flow comets");
    expect(html).toMatch(
      /aria-pressed="true"[^>]*>Flow comets<|>Flow comets<\/button>/,
    );
    expect(html).toContain('aria-pressed="true"');
  });

  it("B/C: Points and Advected marks stay implemented but hidden from product UI", () => {
    const html = productMarkup();
    expect(html).not.toContain(">Points<");
    expect(html).not.toContain("Advected marks");
    expect(controlsSrc).not.toMatch(/onModeChange\("points"\)/);
    expect(controlsSrc).not.toMatch(/onModeChange\("advected-oriented"\)/);
    expect(workbenchSceneSrc).toMatch(/mode === "points"/);
    expect(workbenchSceneSrc).toMatch(/mode === "advected-oriented"/);
    expect(pointsSceneSrc).toMatch(/THREE\.Points/);
    expect(orientedSceneSrc).toMatch(/OrientedAirflowMarkScene/);
  });

  it("D: Eulerian directions remain available as diagnostic", () => {
    const html = productMarkup();
    expect(html).toContain("Eulerian — diagnostic");
    expect(controlsSrc).toMatch(/onModeChange\("eulerian-oriented"\)/);
  });

  it("E: Highlight defaults Off with one-of-six storm operands", () => {
    expect(DEFAULT_OPERAND_HIGHLIGHT_MODE).toBe("off");
    const html = productMarkup();
    expect(html).toContain("Diagnostic tools");
    expect(html).toContain("Highlight");
    expect(html).not.toContain("Both");
    expect(html).not.toContain("environmentAdvection");
  });

  it("F/G: Pause-viz selector hidden; normal Pause remains Full freeze", () => {
    const html = productMarkup();
    expect(html).not.toContain("Pause viz");
    expect(html).not.toContain("Animate frozen field");
    expect(DEFAULT_VISUAL_AIRFLOW_PAUSE_VISUALIZATION).toBe("full-freeze");
    expect(appSrc).toMatch(
      /useState<VisualAirflowPauseVisualization>\(\s*DEFAULT_VISUAL_AIRFLOW_PAUSE_VISUALIZATION/,
    );
    expect(viewportSrc).toMatch(/frozen-field-animation/);
    expect(viewportSrc).toMatch(/stepVisualAirflowOnFrozenField/);
  });

  it("H: Depth cue defaults Off and stays exposed", () => {
    const html = productMarkup();
    expect(html).toContain("Depth cue");
    expect(appSrc).toMatch(/const \[depthCueEnabled, setDepthCueEnabled\] = useState\(false\)/);
    expect(appSrc).toMatch(/setDepthCueEnabled\(false\)/);
  });

  it("I: user-facing Dev/workbench copy is gone", () => {
    const html = productMarkup();
    expect(html).not.toContain("Dev workbench");
    expect(html).not.toContain("Not product visualization modes");
    expect(html).not.toContain("prototype hue");
    expect(controlsSrc).not.toMatch(/Dev workbench/);
    expect(viewportSrc).not.toMatch(/Dev workbench/);
  });

  it("J: selected tracer remains distinguishable under default Comets", () => {
    expect(TRACER_COLORS).toEqual([0xe74c3c, 0x3498db, 0x2ecc71]);
    expect(SELECTION_HALO_COLOR).toBe(0xffcc66);
    expect(TRACER_COLORS).not.toContain(SELECTION_HALO_COLOR);
    const halo = createSelectionHaloMarker(
      selectionHaloRadiusM(DEEP_STORM_TRACER_VIEW.sphereRadiusM),
    );
    expect((halo.material as THREE.MeshBasicMaterial).fog).toBe(false);
    expect(selectionHaloSrc).toMatch(/fog:\s*false/);
    expect(cometSceneSrc).toMatch(/renderOrder\s*=\s*-1/);
    expect(workbenchSceneSrc).toMatch(/cometMarks/);
    halo.geometry.dispose();
    (halo.material as THREE.Material).dispose();
  });

  it("K: screen-space selection contract remains intact", () => {
    expect(PICK_TOLERANCE_PX).toBe(16);
    expect(pickSrc).toMatch(/PICK_TOLERANCE_PX = 16/);
    expect(viewportSrc).toMatch(/pickVisibleTracerAtClientPoint/);
    expect(cometSceneSrc).toMatch(/raycast\s*=\s*\(\)\s*=>\s*\{\s*\}/);
  });

  it("L/M: Follow and Reset View remain mounted for Explore", () => {
    expect(followControlSrc).toMatch(/Follow/);
    expect(resetViewControlSrc).toMatch(/Reset View/);
    expect(appSrc).toMatch(/handleResetView/);
    expect(appSrc).toMatch(/ExploreFollowControl/);
    expect(appSrc).toMatch(/ExploreResetViewControl/);
  });

  it("N: Guided surface/catalog remains unchanged and airflow-free", () => {
    const guided = createGuidedLab(GuidedExperimentId.InflowToUpperOutflow);
    expect("visualAirflowPopulation" in guided).toBe(false);
    expect(createGuidedLabSrc).not.toMatch(/VisualAirflowWorkbenchControls/);
    expect(createGuidedLabSrc).not.toMatch(/VisualAirflowPopulation/);
    expect(guidedCatalogSrc).toMatch(/InflowToUpperOutflow/);
    expect(guidedCatalogSrc).toMatch(/DowndraftPathToGround/);
    expect(guidedCatalogSrc).toMatch(/NearGroundOutflow/);
  });

  it("O/P: velocityObservation.parts remains seven; no physics mutation in M2 wiring", () => {
    const lab = createExploreLab(fakeSlots());
    expect(lab.velocityObservation.parts).toHaveLength(7);
    expect(lab.velocityObservation.parts!.map((part) => part.key)).toEqual([
      ...DEMO_VELOCITY_CONTRIBUTION_KEYS,
    ]);
    const selection = new TracerSelection();
    lab.session.releasePoint({ x: 0, y: 1000, z: 0 });
    selection.select(1);
    const inspection = inspectSelectedTracer(
      lab.simulation.particles,
      selection,
      lab.simulation.clock.time,
      lab.velocityObservation,
    );
    expect(inspection?.contributions).toHaveLength(7);
    expect(composeSrc).not.toMatch(/DEFAULT_VISUAL_AIRFLOW_WORKBENCH_MODE/);
    expect(controlsSrc).not.toMatch(/VelocityField|DEMO_SCENARIO|createUpdraftField/);
  });
});
