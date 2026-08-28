import { describe, expect, it } from "vitest";
import appSrc from "./App.tsx?raw";
import surfaceSrc from "../ui/hodograph/EnvironmentSurface.tsx?raw";
import workspaceSrc from "../ui/hodograph/HodographWorkspace.tsx?raw";
import panelSrc from "../ui/hodograph/HodographPanel.tsx?raw";
import {
  HODOGRAPH_PANEL_MIN_WIDTH_PX,
  INITIAL_HODOGRAPH_PANEL_GEOMETRY,
} from "../ui/hodograph/hodographPanelGeometry.js";
import { VIEWBOX_WIDTH } from "../ui/hodograph/hodographViewTransform.js";

/**
 * Slice 5 — Floating hodograph workspace.
 * docs/ui/11-floating-hodograph-workspace.md
 */
describe("Floating hodograph workspace wiring", () => {
  it("shares one HodographWorkspace between Guided and Explore", () => {
    expect(appSrc).not.toMatch(/GuidedFloatingHodograph/);
    expect(appSrc).not.toMatch(/ExploreFloatingHodograph/);
    expect(appSrc).not.toMatch(/import \{ HodographPanel/);
    expect(appSrc).not.toMatch(/<HodographPanel/);
    expect(surfaceSrc.match(/<HodographWorkspace/g)).toHaveLength(1);
    expect(surfaceSrc.match(/<HodographPanel/g)).toHaveLength(1);
    expect(appSrc.match(/\{environmentSurface\}/g)).toHaveLength(2);
    expect(appSrc.match(/workbench__hodograph-host/g)).toHaveLength(2);
  });

  it("owns panel geometry and plot view in the App UI session", () => {
    expect(appSrc).toMatch(/INITIAL_HODOGRAPH_PANEL_GEOMETRY/);
    expect(appSrc).toMatch(/DEFAULT_HODOGRAPH_PLOT_VIEW/);
    expect(appSrc).toMatch(
      /const \[hodographPanelGeometry, setHodographPanelGeometry\]/,
    );
    expect(appSrc).toMatch(
      /const \[hodographPlotView, setHodographPlotView\]/,
    );
  });

  it("resets plot autoscale on Explore environment switch and keeps panel geometry", () => {
    const selectExplore = appSrc.slice(
      appSrc.indexOf("const selectExploreEnvironment"),
      appSrc.indexOf("const returnToLanding"),
    );
    expect(selectExplore).toMatch(
      /setHodographPlotView\(DEFAULT_HODOGRAPH_PLOT_VIEW\)/,
    );
    expect(selectExplore).not.toMatch(/setHodographPanelGeometry/);
    expect(selectExplore).not.toMatch(/setOverlayVisibility/);
  });

  it("does not persist workspace layout in localStorage", () => {
    expect(appSrc).not.toMatch(/localStorage/);
    expect(workspaceSrc).not.toMatch(/localStorage/);
    expect(surfaceSrc).not.toMatch(/localStorage/);
  });

  it("keeps a single view transform path for overlays", () => {
    expect(panelSrc).toMatch(/const transform = applyHodographPlotView/);
    expect(INITIAL_HODOGRAPH_PANEL_GEOMETRY.width).toBe(480);
    expect(HODOGRAPH_PANEL_MIN_WIDTH_PX).toBe(360);
    expect(VIEWBOX_WIDTH).toBe(640);
  });
});
