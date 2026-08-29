import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { DEMO_SCENARIO } from "../../scenario/DEMO_SCENARIO.js";
import {
  DEMO_SELECTED_HEIGHT,
  createDemoHodographPoints,
  createDemoStreamwiseCrosswiseOverlay,
  createDemoVorticityLayer,
} from "../../app/demoHodographFixture.js";
import { EnvironmentAffordance } from "./EnvironmentAffordance.js";
import { EnvironmentSurface } from "./EnvironmentSurface.js";
import { DEFAULT_HODOGRAPH_OVERLAY_VISIBILITY } from "./hodographOverlayVisibility.js";
import {
  HODOGRAPH_PANEL_MIN_HEIGHT_PX,
  HODOGRAPH_PANEL_MIN_WIDTH_PX,
  INITIAL_HODOGRAPH_PANEL_GEOMETRY,
} from "./hodographPanelGeometry.js";
import { DEFAULT_HODOGRAPH_PLOT_VIEW } from "./hodographPlotView.js";
import { VIEWBOX_WIDTH } from "./hodographViewTransform.js";
import { ENVIRONMENT_OVERLAY_MIN_WIDTH_PX } from "./EnvironmentSurface.js";
import surfaceSrc from "./EnvironmentSurface.tsx?raw";
import workspaceSrc from "./HodographWorkspace.tsx?raw";
import panelSrc from "./HodographPanel.tsx?raw";
import affordanceSrc from "./EnvironmentAffordance.tsx?raw";
import type { HodographPanelGeometry } from "./hodographPanelGeometry.js";
import type { HodographPlotView } from "./hodographPlotView.js";
import {
  DEMO_PRESCRIBED_ENVIRONMENT_LABEL,
  DUMAS_2010_OBSERVED_ENVIRONMENT_LABEL,
  GOSHEN_2009_OBSERVED_ENVIRONMENT_LABEL,
  MOORE_2013_OBSERVED_ENVIRONMENT_LABEL,
  PROSPECT_VALLEY_2010_OBSERVED_ENVIRONMENT_LABEL,
  type ExploreEnvironmentIdentity,
} from "../../explore/exploreEnvironmentIdentity.js";

const boundsElementRef = { current: null };

function surfaceMarkup(
  open: boolean,
  extras: {
    environmentIdentity?: ExploreEnvironmentIdentity;
    panelGeometry?: HodographPanelGeometry;
    plotView?: HodographPlotView;
  } = {},
) {
  return renderToStaticMarkup(
    <EnvironmentSurface
      open={open}
      points={createDemoHodographPoints()}
      stormMotion={DEMO_SCENARIO.stormMotion}
      selectedHeight={DEMO_SELECTED_HEIGHT}
      vorticityLayer={createDemoVorticityLayer()}
      streamwiseCrosswiseOverlay={createDemoStreamwiseCrosswiseOverlay()}
      overlayVisibility={DEFAULT_HODOGRAPH_OVERLAY_VISIBILITY}
      onOverlayVisibilityChange={() => {}}
      onClose={() => {}}
      panelGeometry={extras.panelGeometry ?? INITIAL_HODOGRAPH_PANEL_GEOMETRY}
      onPanelGeometryChange={() => {}}
      plotView={extras.plotView ?? DEFAULT_HODOGRAPH_PLOT_VIEW}
      onPlotViewChange={() => {}}
      boundsElementRef={boundsElementRef}
      environmentIdentity={extras.environmentIdentity}
    />,
  );
}

describe("EnvironmentSurface", () => {
  it("shows hodograph and overlays when open", () => {
    const html = surfaceMarkup(true);
    expect(html).toContain("id=\"environment-surface\"");
    expect(html).toContain("aria-label=\"Hodograph\"");
    expect(html).toContain("Hodograph");
    expect(html).toContain("aria-label=\"Ground-relative hodograph\"");
    expect(html).toContain("Hodograph overlays");
    expect(html.match(/hodograph-panel__marker/g)).toHaveLength(5);
    expect(html.match(/hodograph-panel__height-label/g)).toHaveLength(5);
    expect(html).toContain("Storm motion C");
    expect(html).toContain("Close Hodograph");
    expect(html).not.toMatch(/<section[^>]*\shidden/);
  });

  it("names the current Explore environment without a competing radio selector", () => {
    const guided = surfaceMarkup(true);
    expect(guided).not.toContain(DEMO_PRESCRIBED_ENVIRONMENT_LABEL);
    expect(guided).not.toContain(GOSHEN_2009_OBSERVED_ENVIRONMENT_LABEL);
    expect(guided).not.toContain(PROSPECT_VALLEY_2010_OBSERVED_ENVIRONMENT_LABEL);
    expect(guided).not.toContain(DUMAS_2010_OBSERVED_ENVIRONMENT_LABEL);
    expect(guided).not.toContain(MOORE_2013_OBSERVED_ENVIRONMENT_LABEL);
    expect(guided).not.toContain("explore-environment-identity");
    expect(guided).not.toContain("type=\"radio\"");
    expect(guided).toContain("Hodograph");
    expect(guided).not.toContain("Hodograph —");

    const explore = surfaceMarkup(true, {
      environmentIdentity: "demo-prescribed",
    });
    expect(explore).toContain(`Hodograph — ${DEMO_PRESCRIBED_ENVIRONMENT_LABEL}`);
    expect(explore).not.toContain(GOSHEN_2009_OBSERVED_ENVIRONMENT_LABEL);
    expect(explore).not.toContain(PROSPECT_VALLEY_2010_OBSERVED_ENVIRONMENT_LABEL);
    expect(explore).not.toContain(DUMAS_2010_OBSERVED_ENVIRONMENT_LABEL);
    expect(explore).not.toContain(MOORE_2013_OBSERVED_ENVIRONMENT_LABEL);
    expect(explore).not.toContain("explore-environment-identity");
    expect(explore).not.toContain("type=\"radio\"");
    expect(explore).not.toContain("NOT a simulation or reconstruction");
    expect(surfaceSrc).not.toMatch(/onEnvironmentIdentityChange/);
    expect(surfaceSrc).not.toMatch(/type="radio"/);
  });

  it("keeps Hodograph overlay checkboxes on Demo and omits them for observed environments", () => {
    const demo = surfaceMarkup(true, {
      environmentIdentity: "demo-prescribed",
    });
    expect(demo).toContain("Hodograph overlays");
    expect(demo).toContain("Storm motion C");
    expect(demo).toContain("Storm-relative wind V_sr");
    expect(demo).toContain("Horizontal vorticity ω_h");
    expect(demo).toContain("Streamwise / crosswise vorticity");

    const goshen = surfaceMarkup(true, {
      environmentIdentity: "goshen-2009-observed",
    });
    expect(goshen).not.toContain("Hodograph overlays");
    expect(goshen).not.toContain("Storm motion C");
    expect(goshen).not.toContain("Storm-relative wind V_sr");
    expect(goshen).not.toContain("Horizontal vorticity ω_h");
    expect(goshen).not.toContain("Streamwise / crosswise vorticity");
    expect(goshen).not.toMatch(/disabled/);
    expect(goshen).toContain(`Hodograph — ${GOSHEN_2009_OBSERVED_ENVIRONMENT_LABEL}`);
    expect(goshen).not.toContain("type=\"radio\"");
  });

  it("is hidden when closed without dropping overlay controls from the tree", () => {
    const html = surfaceMarkup(false);
    expect(html).toMatch(/<section[^>]*\shidden/);
    expect(html).toContain("Hodograph overlays");
    expect(html).toContain("aria-label=\"Ground-relative hodograph\"");
    expect(html).toContain("left:12px");
    expect(html).toContain("width:880px");
  });

  it("uses the shared floating workspace for Guided and Explore", () => {
    const guided = surfaceMarkup(true);
    const explore = surfaceMarkup(true, {
      environmentIdentity: "demo-prescribed",
    });
    expect(guided).toContain("hodograph-workspace");
    expect(explore).toContain("hodograph-workspace");
    expect(guided).toContain("environment-surface--overlay");
    expect(explore).toContain("environment-surface--overlay");
    expect(surfaceSrc).toMatch(/HodographWorkspace/);
    expect(surfaceSrc).not.toMatch(/GuidedFloatingHodograph/);
    expect(surfaceSrc).not.toMatch(/ExploreFloatingHodograph/);
  });

  it("closes the floating workspace on Escape", () => {
    expect(surfaceSrc).toMatch(/if \(!open\)/);
    expect(surfaceSrc).toMatch(/event\.key === "Escape"/);
    expect(surfaceSrc).toMatch(/onClose\(\)/);
  });
});

describe("HodographWorkspace chrome", () => {
  it("exposes zoom controls, reset, drag header, and a resize handle", () => {
    const html = surfaceMarkup(true);
    expect(html).toContain("aria-label=\"Zoom out hodograph\"");
    expect(html).toContain("aria-label=\"Zoom in hodograph\"");
    expect(html).toContain("aria-label=\"Reset hodograph view\"");
    expect(html).toContain("hodograph-workspace__header");
    expect(html).toContain("hodograph-workspace__resize");
    expect(html).toContain("hodograph-workspace__resize--east");
    expect(html).toContain("hodograph-workspace__resize--south");
    expect(html).toContain("hodograph-workspace__resize--south-east");
    expect(html).toContain("title=\"Resize hodograph panel\"");
    expect(workspaceSrc).toMatch(/isHeaderDragExcludedTarget/);
    expect(workspaceSrc).toMatch(/setPointerCapture/);
    expect(workspaceSrc).toMatch(/releasePointerCapture/);
    expect(workspaceSrc).toMatch(/dragPanelByDelta/);
    expect(workspaceSrc).toMatch(/resizePanelFromSouthEast/);
    expect(workspaceSrc).toMatch(/resetHodographPlotView/);
    expect(workspaceSrc).not.toMatch(/setHodographPanelGeometry/);
  });

  it("keeps plot pan/zoom on the SVG, not the header", () => {
    expect(panelSrc).toMatch(/onPlotViewChange/);
    expect(panelSrc).toMatch(/addEventListener\("wheel"/);
    expect(panelSrc).toMatch(/passive: false/);
    expect(panelSrc).toMatch(/panHodographPlotView/);
    expect(panelSrc).toMatch(/hodograph-panel__plot-space/);
    expect(panelSrc).toMatch(/hodographPlotSpaceCamera/);
    expect(panelSrc).toMatch(/preventDefault/);
    expect(panelSrc).toMatch(/removeAllRanges/);
    expect(workspaceSrc).not.toMatch(/panHodographPlotView/);
    expect(workspaceSrc).toMatch(/onHeaderPointerDown/);
    expect(workspaceSrc).toMatch(/readWindowBounds/);
  });
});

describe("EnvironmentAffordance", () => {
  it("is a persistent Hodograph header control with aria-expanded", () => {
    const collapsed = renderToStaticMarkup(
      <EnvironmentAffordance expanded={false} onToggle={() => {}} />,
    );
    const expanded = renderToStaticMarkup(
      <EnvironmentAffordance expanded={true} onToggle={() => {}} />,
    );
    expect(collapsed).toContain("Hodograph");
    expect(collapsed).not.toMatch(/>Environment</);
    expect(collapsed).not.toContain("aria-label=\"Environment\"");
    expect(collapsed).toContain("aria-expanded=\"false\"");
    expect(collapsed).toContain("aria-controls=\"environment-surface\"");
    expect(expanded).toContain("aria-expanded=\"true\"");
    expect(affordanceSrc).not.toMatch(/control-band/);
  });
});

describe("Environment surface size contract", () => {
  it("keeps the logical SVG viewBox and a readable min panel size", () => {
    expect(VIEWBOX_WIDTH).toBe(640);
    expect(HODOGRAPH_PANEL_MIN_WIDTH_PX).toBe(360);
    expect(HODOGRAPH_PANEL_MIN_HEIGHT_PX).toBe(280);
    expect(ENVIRONMENT_OVERLAY_MIN_WIDTH_PX).toBe(360);
    expect(INITIAL_HODOGRAPH_PANEL_GEOMETRY.width).toBe(880);
    expect(INITIAL_HODOGRAPH_PANEL_GEOMETRY.height).toBe(650);
    expect(surfaceMarkup(true)).toContain("width:880px");
    expect(surfaceMarkup(true)).toContain("height:650px");
    expect(surfaceMarkup(true)).toContain("left:12px");
    expect(surfaceMarkup(true)).toContain("top:12px");
  });
});
