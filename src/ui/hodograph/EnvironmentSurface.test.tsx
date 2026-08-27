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
import { VIEWBOX_WIDTH } from "./hodographViewTransform.js";
import { ENVIRONMENT_OVERLAY_MIN_WIDTH_PX } from "./EnvironmentSurface.js";
import surfaceSrc from "./EnvironmentSurface.tsx?raw";
import affordanceSrc from "./EnvironmentAffordance.tsx?raw";

function surfaceMarkup(open: boolean, presentation: "overlay" | "column") {
  return renderToStaticMarkup(
    <EnvironmentSurface
      open={open}
      presentation={presentation}
      points={createDemoHodographPoints()}
      stormMotion={DEMO_SCENARIO.stormMotion}
      selectedHeight={DEMO_SELECTED_HEIGHT}
      vorticityLayer={createDemoVorticityLayer()}
      streamwiseCrosswiseOverlay={createDemoStreamwiseCrosswiseOverlay()}
      overlayVisibility={DEFAULT_HODOGRAPH_OVERLAY_VISIBILITY}
      onOverlayVisibilityChange={() => {}}
      onClose={() => {}}
    />,
  );
}

describe("EnvironmentSurface", () => {
  it("shows hodograph and overlays when open", () => {
    const html = surfaceMarkup(true, "overlay");
    expect(html).toContain("id=\"environment-surface\"");
    expect(html).toContain("aria-label=\"Environment\"");
    expect(html).toContain("Hodograph");
    expect(html).toContain("aria-label=\"Ground-relative hodograph\"");
    expect(html).toContain("Hodograph overlays");
    expect(html).toContain("Storm motion C");
    expect(html).toContain("Close Environment");
    expect(html).not.toMatch(/<section[^>]*\shidden/);
  });

  it("shows the Explore identity control only when identity is supplied", () => {
    const guided = surfaceMarkup(true, "column");
    expect(guided).not.toContain("Demo prescribed environment");
    expect(guided).not.toContain("Goshen 2009 observed environment");
    expect(guided).not.toContain("explore-environment-identity");

    const explore = renderToStaticMarkup(
      <EnvironmentSurface
        open={true}
        presentation="overlay"
        points={createDemoHodographPoints()}
        stormMotion={DEMO_SCENARIO.stormMotion}
        selectedHeight={DEMO_SELECTED_HEIGHT}
        vorticityLayer={createDemoVorticityLayer()}
        streamwiseCrosswiseOverlay={createDemoStreamwiseCrosswiseOverlay()}
        overlayVisibility={DEFAULT_HODOGRAPH_OVERLAY_VISIBILITY}
        onOverlayVisibilityChange={() => {}}
        onClose={() => {}}
        environmentIdentity="demo-prescribed"
        onEnvironmentIdentityChange={() => {}}
      />,
    );
    expect(explore).toContain("Demo prescribed environment");
    expect(explore).toContain("Goshen 2009 observed environment");
    expect(explore).not.toContain("NOT a simulation or reconstruction");
  });

  it("is hidden when closed without dropping overlay controls from the tree", () => {
    const html = surfaceMarkup(false, "overlay");
    expect(html).toMatch(/<section[^>]*\shidden/);
    expect(html).toContain("Hodograph overlays");
    expect(html).toContain("aria-label=\"Ground-relative hodograph\"");
  });

  it("uses overlay vs column presentation classes", () => {
    expect(surfaceMarkup(true, "overlay")).toContain(
      "environment-surface--overlay",
    );
    expect(surfaceMarkup(true, "column")).toContain(
      "environment-surface--column",
    );
    expect(surfaceMarkup(true, "column")).not.toContain(
      "environment-surface--overlay",
    );
  });

  it("closes overlay presentation on Escape", () => {
    expect(surfaceSrc).toMatch(/presentation !== "overlay"/);
    expect(surfaceSrc).toMatch(/event\.key === "Escape"/);
    expect(surfaceSrc).toMatch(/onClose\(\)/);
  });
});

describe("EnvironmentAffordance", () => {
  it("is a persistent Environment header control with aria-expanded", () => {
    const collapsed = renderToStaticMarkup(
      <EnvironmentAffordance expanded={false} onToggle={() => {}} />,
    );
    const expanded = renderToStaticMarkup(
      <EnvironmentAffordance expanded={true} onToggle={() => {}} />,
    );
    expect(collapsed).toContain("Environment");
    expect(collapsed).toContain("aria-label=\"Environment\"");
    expect(collapsed).toContain("aria-expanded=\"false\"");
    expect(collapsed).toContain("aria-controls=\"environment-surface\"");
    expect(expanded).toContain("aria-expanded=\"true\"");
    expect(affordanceSrc).not.toMatch(/control-band/);
  });
});

describe("Environment surface size contract", () => {
  it("keeps overlay CSS width at the 640 logical viewBox with a 480px floor", () => {
    expect(VIEWBOX_WIDTH).toBe(640);
    expect(ENVIRONMENT_OVERLAY_MIN_WIDTH_PX).toBe(480);
    expect(surfaceMarkup(true, "overlay")).toContain("width:640px");
    expect(surfaceMarkup(true, "overlay")).toContain("overflow-y:auto");
    expect(surfaceMarkup(true, "column")).not.toContain("width:640px");
  });
});
