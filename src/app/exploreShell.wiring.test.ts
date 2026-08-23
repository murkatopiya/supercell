import { describe, expect, it } from "vitest";
import appSrc from "./App.tsx?raw";
import viewportSrc from "../ui/tracer/TracerViewport.tsx?raw";

/**
 * Slice A — Explore shell / scroll geometry.
 * docs/architecture/40-v1-m1-m3-ux-ui-consolidation-architecture.md §19
 *
 * CSS height-budget rules live in app.css under .app--explore /
 * .workbench--explore. This suite locks the class wiring those rules
 * target and the viewport ResizeObserver needed for flex height.
 */
describe("Explore Slice A shell geometry", () => {
  it("wires Explore as Controls | Viewport | Observation", () => {
    const exploreShell = appSrc.slice(
      appSrc.indexOf("workbench--explore"),
      appSrc.indexOf("workbench--guided"),
    );
    expect(exploreShell).toMatch(/workbench__column--controls/);
    expect(exploreShell).toMatch(/workbench__column--viewport/);
    expect(exploreShell).toMatch(/workbench__column--observation/);
    expect(exploreShell.indexOf("workbench__column--controls")).toBeLessThan(
      exploreShell.indexOf("workbench__column--viewport"),
    );
    expect(exploreShell.indexOf("workbench__column--viewport")).toBeLessThan(
      exploreShell.indexOf("workbench__column--observation"),
    );
    expect(exploreShell).toMatch(/tracerViewport/);
    expect(exploreShell).toMatch(/TracerInspectorPanel/);
    expect(exploreShell).toMatch(/PointDiagnosticsPanel/);
    expect(exploreShell.indexOf("TracerInspectorPanel")).toBeLessThan(
      exploreShell.indexOf("PointDiagnosticsPanel"),
    );
  });

  it("keeps Explore controls off the viewport column", () => {
    const viewport = appSrc.slice(
      appSrc.indexOf("workbench__column--viewport"),
      appSrc.indexOf("workbench__column--observation"),
    );
    expect(viewport).toMatch(/tracerViewport/);
    expect(viewport).not.toMatch(/TracerRuntimeControls/);
    expect(viewport).not.toMatch(/ExploreClearTracersControl/);
    expect(viewport).not.toMatch(/ExplorePointReleaseControls/);
    expect(viewport).not.toMatch(/VisualAirflowWorkbenchControls/);
    expect(viewport).not.toMatch(/ExploreFollowControl/);
    expect(viewport).not.toMatch(/ExploreResetViewControl/);
    expect(viewport).not.toMatch(/HodographPanel/);
  });

  it("places hodograph in the Explore controls rail until Environment Slice D", () => {
    const controls = appSrc.slice(
      appSrc.indexOf("workbench__column--controls"),
      appSrc.indexOf("workbench__column--viewport"),
    );
    expect(controls).toMatch(/workbench__environment/);
    expect(controls).toMatch(/hodographColumn/);
    expect(controls).toMatch(/TracerRuntimeControls/);
    expect(controls).toMatch(/ExploreClearTracersControl/);
    expect(controls).toMatch(/ExplorePointReleaseControls/);
    expect(controls).toMatch(/ExploreFollowControl/);
    expect(controls).toMatch(/ExploreResetViewControl/);
    expect(controls).toMatch(/VisualAirflowWorkbenchControls/);
    expect(controls.indexOf("control-band--release")).toBeLessThan(
      controls.indexOf("control-band--runtime"),
    );
    expect(controls.indexOf("control-band--runtime")).toBeLessThan(
      controls.indexOf("control-band--view"),
    );
    expect(controls.indexOf("control-band--view")).toBeLessThan(
      controls.indexOf("control-band--airflow"),
    );
  });

  it("locks Explore height-budget shell classes and viewport resize observer", () => {
    expect(appSrc).toMatch(
      /className=\{explore !== null \? "app app--explore" : "app app--guided"\}/,
    );
    expect(appSrc).toMatch(/workbench workbench--explore/);
    expect(appSrc).toMatch(/workbench__column--observation/);
    expect(appSrc).toMatch(/workbench__column--viewport/);
    expect(viewportSrc).toMatch(/ResizeObserver/);
    expect(viewportSrc).toMatch(
      /resizeObserver\.observe\(canvas\.parentElement\)/,
    );
    expect(viewportSrc).toMatch(/resizeObserver\?\.disconnect\(\)/);
  });

  it("keeps Guided on a separate shell without Explore action-rail regions", () => {
    const guidedShell = appSrc.slice(appSrc.indexOf("workbench--guided"));
    expect(guidedShell).toMatch(/workbench__column--hodograph/);
    expect(guidedShell).toMatch(/workbench__column--laboratory/);
    expect(guidedShell).toMatch(/workbench__column--inspector/);
    expect(guidedShell).not.toMatch(/workbench__column--controls/);
    expect(guidedShell).not.toMatch(/workbench__column--viewport/);
    expect(guidedShell).not.toMatch(/workbench__column--observation/);
    expect(guidedShell).toMatch(/GuidedExperimentPanel/);
    expect(appSrc).toMatch(/app--guided/);
    expect(appSrc).toMatch(/app--explore/);
  });
});
