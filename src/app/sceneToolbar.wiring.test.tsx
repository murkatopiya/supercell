import { describe, expect, it } from "vitest";
import { DEFAULT_TRACER_TIME_SCALE } from "../ui/tracer/TracerRuntimeControls.js";
import appSrc from "./App.tsx?raw";
import sceneToolbarSrc from "../ui/tracer/SceneToolbar.tsx?raw";
import runtimeSrc from "../ui/tracer/TracerRuntimeControls.tsx?raw";

/**
 * Slice 2 — scene toolbar, runtime 5× default, Clear tracers disabled.
 * docs/ui/08-scene-toolbar-and-control-states.md
 */
describe("Slice 2 scene toolbar and session defaults", () => {
  it("starts Guided and Explore sessions at 5× without changing Reset", () => {
    expect(DEFAULT_TRACER_TIME_SCALE).toBe(5);
    expect(runtimeSrc).toMatch(
      /export const DEFAULT_TRACER_TIME_SCALE: TracerTimeScale = 5/,
    );
    expect(appSrc).toMatch(
      /useState<TracerTimeScale>\(\s*DEFAULT_TRACER_TIME_SCALE/,
    );

    const enterExplore = appSrc.slice(
      appSrc.indexOf("const enterExplore"),
      appSrc.indexOf("const enterGuided"),
    );
    expect(enterExplore).toMatch(/setTimeScale\(DEFAULT_TRACER_TIME_SCALE\)/);

    const enterGuided = appSrc.slice(
      appSrc.indexOf("const enterGuided"),
      appSrc.indexOf("const selectGuidedExperiment"),
    );
    expect(enterGuided).toMatch(/setTimeScale\(DEFAULT_TRACER_TIME_SCALE\)/);

    const resetBlock = appSrc.slice(
      appSrc.indexOf("const handleReset"),
      appSrc.indexOf("const handleResetView"),
    );
    expect(resetBlock).not.toMatch(/setTimeScale/);
    expect(resetBlock).not.toMatch(/setPaused/);
  });

  it("places Airflow presentation controls in the scene toolbar, not the action rail", () => {
    const viewport = appSrc.slice(
      appSrc.indexOf("workbench__column--viewport"),
      appSrc.indexOf("workbench__column--observation"),
    );
    expect(viewport).toMatch(/<SceneToolbar>/);
    expect(viewport.indexOf("SceneToolbar")).toBeLessThan(
      viewport.indexOf("VisualAirflowWorkbenchControls"),
    );
    expect(viewport.indexOf("VisualAirflowWorkbenchControls")).toBeLessThan(
      viewport.indexOf("tracerViewport"),
    );

    const controls = appSrc.slice(
      appSrc.indexOf("workbench__column--controls"),
      appSrc.indexOf("workbench__column--viewport"),
    );
    expect(controls).not.toMatch(/VisualAirflowWorkbenchControls/);
    expect(controls).not.toMatch(/control-band--airflow/);
    expect(controls).toMatch(/ExplorePointReleaseControls/);
    expect(controls).toMatch(/TracerRuntimeControls/);
    expect(controls).toMatch(/ExploreFollowControl/);

    const guidedShell = appSrc.slice(appSrc.indexOf("workbench--guided"));
    expect(guidedShell).not.toMatch(/SceneToolbar/);
    expect(guidedShell).not.toMatch(/CoordinateReferenceControl/);
    expect(guidedShell).not.toMatch(/VisualAirflowWorkbenchControls/);
  });

  it("keeps scene presentation state owned by App, not the toolbar", () => {
    expect(sceneToolbarSrc).not.toMatch(/useState/);
    expect(sceneToolbarSrc).toMatch(/role="toolbar"/);
    expect(sceneToolbarSrc).toMatch(/aria-label="Scene"/);
    expect(appSrc).toMatch(/const \[workbenchMode, setWorkbenchMode\]/);
    expect(appSrc).toMatch(/const \[highlightMode, setHighlightMode\]/);
    expect(appSrc).toMatch(/const \[depthCueEnabled, setDepthCueEnabled\]/);
    expect(appSrc).toMatch(
      /const \[coordinateReferenceVisible, setCoordinateReferenceVisible\]/,
    );
    expect(appSrc).toMatch(/onModeChange=\{setWorkbenchMode\}/);
    expect(appSrc).toMatch(/onHighlightModeChange=\{setHighlightMode\}/);
    expect(appSrc).toMatch(/onDepthCueChange=\{setDepthCueEnabled\}/);
  });

  it("disables Clear tracers from laboratory occupancy, not airflow occupants", () => {
    expect(appSrc).toMatch(
      /ExploreClearTracersControl[\s\S]*tracerCount=\{explore\.simulation\.particles\.length\}/,
    );
    expect(appSrc).not.toMatch(
      /tracerCount=\{explore\.visualAirflowPopulation/,
    );
  });
});
