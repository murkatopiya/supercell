import { describe, expect, it } from "vitest";
import appSrc from "./App.tsx?raw";
import surfaceSrc from "../ui/hodograph/EnvironmentSurface.tsx?raw";
import {
  ENVIRONMENT_OVERLAY_MIN_WIDTH_PX,
} from "../ui/hodograph/EnvironmentSurface.js";
import { VIEWBOX_WIDTH } from "../ui/hodograph/hodographViewTransform.js";

/**
 * Slice 42-1 — Environment / hodograph on-demand.
 * docs/architecture/42-post-41-3-explore-airflow-and-environment-architecture.md §10 / §16
 */
describe("Explore 42-1 Environment surface", () => {
  it("places a shared Environment affordance in the header, not the action rail", () => {
    const header = appSrc.slice(
      appSrc.indexOf("app__header"),
      appSrc.indexOf("app__subtitle"),
    );
    expect(header).toMatch(/EnvironmentAffordance/);
    expect(header).toMatch(/aria-pressed=\{lab\.kind === "guided"\}/);
    expect(header).toMatch(/aria-pressed=\{lab\.kind === "explore"\}/);

    const controls = appSrc.slice(
      appSrc.indexOf("workbench__column--controls"),
      appSrc.indexOf("workbench__column--viewport"),
    );
    expect(controls).not.toMatch(/EnvironmentAffordance/);
    expect(controls).not.toMatch(/EnvironmentSurface/);
    expect(controls).not.toMatch(/HodographPanel/);
    expect(controls).not.toMatch(/HodographOverlayControls/);
    expect(controls).not.toMatch(/workbench__environment/);
  });

  it("defaults Guided Environment open and Explore Environment closed", () => {
    expect(appSrc).toMatch(
      /const \[environmentOpen, setEnvironmentOpen\] = useState\(true\)/,
    );
    const enterExplore = appSrc.slice(
      appSrc.indexOf("const enterExplore"),
      appSrc.indexOf("const enterGuided"),
    );
    expect(enterExplore).toMatch(/setEnvironmentOpen\(false\)/);
    const enterGuided = appSrc.slice(
      appSrc.indexOf("const enterGuided"),
      appSrc.indexOf("const selectGuidedExperiment"),
    );
    expect(enterGuided).toMatch(/setEnvironmentOpen\(true\)/);
  });

  it("mounts one Environment surface in Explore viewport chrome as an overlay", () => {
    const viewport = appSrc.slice(
      appSrc.indexOf("workbench__column--viewport"),
      appSrc.indexOf("workbench__column--observation"),
    );
    expect(viewport).toMatch(/tracerViewport/);
    expect(viewport).toMatch(/environmentSurface/);
    expect(appSrc).toMatch(/presentation=\{explore !== null \? "overlay" : "column"\}/);
    expect(viewport).not.toMatch(/TracerRuntimeControls/);
    expect(viewport).not.toMatch(/ExplorePointReleaseControls/);
    expect(viewport).not.toMatch(/ExploreFollowControl/);
    expect(viewport).not.toMatch(/VisualAirflowWorkbenchControls/);
  });

  it("does not duplicate hodograph surfaces across Explore and Guided shells", () => {
    expect(appSrc.match(/HodographPanel/g)).toBeNull();
    expect(appSrc.match(/HodographOverlayControls/g)).toBeNull();
    expect(surfaceSrc.match(/<HodographPanel/g)).toHaveLength(1);
    expect(surfaceSrc.match(/<HodographOverlayControls/g)).toHaveLength(1);
    expect(appSrc.match(/\{environmentSurface\}/g)).toHaveLength(2);
  });

  it("keeps Guided default-open as the local hodograph column", () => {
    const guidedShell = appSrc.slice(appSrc.indexOf("workbench--guided"));
    expect(guidedShell).toMatch(/workbench__column--hodograph/);
    expect(guidedShell).toMatch(/environmentSurface/);
    expect(guidedShell).toMatch(/workbench--guided-environment-closed/);
    expect(guidedShell).not.toMatch(/ExplorePointReleaseControls/);
    expect(guidedShell).not.toMatch(/VisualAirflowWorkbenchControls/);
    expect(guidedShell).not.toMatch(/ExploreFollowControl/);
    expect(guidedShell).not.toMatch(/PointDiagnosticsPanel/);
  });

  it("scrolls the Environment overlay in-surface and does not reopen Explore page scroll", () => {
    expect(VIEWBOX_WIDTH).toBe(640);
    expect(ENVIRONMENT_OVERLAY_MIN_WIDTH_PX).toBe(480);
    expect(surfaceSrc).toMatch(/width: VIEWBOX_WIDTH/);
    expect(surfaceSrc).toMatch(/overflowY: "auto"/);
    expect(appSrc).toMatch(/app app--explore/);
    expect(appSrc).toMatch(/workbench workbench--explore/);
  });

  it("keeps overlay visibility in App state rather than recreating environment data owners", () => {
    expect(appSrc).toMatch(
      /useState\(\s*DEFAULT_HODOGRAPH_OVERLAY_VISIBILITY/,
    );
    expect(appSrc).toMatch(
      /onOverlayVisibilityChange=\{setOverlayVisibility\}/,
    );
    expect(appSrc).not.toMatch(/setOverlayVisibility\(DEFAULT_HODOGRAPH_OVERLAY_VISIBILITY\)/);
    expect(enterExploreDoesNotResetOverlays());
    expect(enterGuidedDoesNotResetOverlays());
  });
});

function enterExploreDoesNotResetOverlays(): boolean {
  const enterExplore = appSrc.slice(
    appSrc.indexOf("const enterExplore"),
    appSrc.indexOf("const enterGuided"),
  );
  return !/setOverlayVisibility/.test(enterExplore);
}

function enterGuidedDoesNotResetOverlays(): boolean {
  const enterGuided = appSrc.slice(
    appSrc.indexOf("const enterGuided"),
    appSrc.indexOf("const selectGuidedExperiment"),
  );
  return !/setOverlayVisibility/.test(enterGuided);
}
