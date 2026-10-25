import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { UserGuideAffordance } from "./UserGuideAffordance.js";
import { UserGuideSurface } from "./UserGuideSurface.js";
import {
  USER_GUIDE_CONTROLS,
  USER_GUIDE_GOSHEN_LABEL,
  USER_GUIDE_GLYPH_MEANING,
  USER_GUIDE_HISTORY_LEAD,
  USER_GUIDE_MOORE_LABEL,
  USER_GUIDE_NAV,
  USER_GUIDE_RELEASE_FLOW,
  USER_GUIDE_RELEASE_NO_ADD,
  USER_GUIDE_SUPPORT,
  USER_GUIDE_START_STORM_MOTION_EFFECT,
  USER_GUIDE_START_STORM_MOTION_RESTORE,
  USER_GUIDE_T1_NOT_SPIN,
  USER_GUIDE_TITLE,
  USER_GUIDE_WHAT_IF_DOES_NOT,
} from "./userGuideContent.js";
import { ANALYSIS_T1_COLOR_LEGEND_V1 } from "../ui/tracer/analysisT1ColorLegendV1.js";
import { GOSHEN_2009_OBSERVED_ENVIRONMENT_LABEL } from "../explore/exploreEnvironmentIdentity.js";
import surfaceSrc from "./UserGuideSurface.tsx?raw";
import contentSrc from "./userGuideContent.ts?raw";

const returnFocusRef = { current: null };

function guideMarkup() {
  return renderToStaticMarkup(
    <UserGuideSurface
      open
      onClose={() => {}}
      returnFocusRef={returnFocusRef}
    />,
  );
}

describe("UserGuideSurface", () => {
  it("uses dialog semantics, Close, Escape, and isolates pointer events", () => {
    const html = guideMarkup();
    expect(html).toContain("role=\"dialog\"");
    expect(html).toContain("aria-modal=\"true\"");
    expect(html).toContain("aria-labelledby=\"user-guide-title\"");
    expect(html).toContain(USER_GUIDE_TITLE);
    expect(html).toContain("Close");
    expect(surfaceSrc).toContain("useResourceDialog(open, onClose, returnFocusRef, closeButtonRef)");
    expect(html).toContain("Practical manual");
    expect(
      renderToStaticMarkup(
        <UserGuideSurface
          open={false}
          onClose={() => {}}
          returnFocusRef={returnFocusRef}
        />,
      ),
    ).toBe("");
  });

  it("walks the Explore operator path and names production controls only", () => {
    const html = guideMarkup();
    expect(html).toContain("Getting started");
    expect(html).toContain("Releasing tracers");
    expect(html).toContain("Running the experiment");
    expect(html).toContain("Using the 3D view");
    expect(html).toContain("Selecting a tracer");
    expect(html).toContain("Inspecting trajectory history");
    expect(html).toContain("Reading Analysis T1");
    expect(html).toContain("Mechanism glyph");
    expect(html).toContain("T1 calculation");
    expect(html).toContain("When a diagnostic is unavailable");
    expect(html).toContain("Reset / start another experiment");
    expect(html).toContain("Where to learn more");
    expect(html).toContain("Release tracer");
    expect(html).toContain("Confirm");
    expect(html).toContain("Cancel");
    expect(html).toContain("Clear tracers");
    expect(html).toContain("Reset View");
    expect(html).toContain("Focus sample");
    expect(html).toContain("Expand Environment &amp; storm motion");
    expect(html).toContain(USER_GUIDE_START_STORM_MOTION_EFFECT);
    expect(html).toContain(USER_GUIDE_START_STORM_MOTION_RESTORE);
    expect(html).toContain("Eastward and Northward are signed components");
    expect(html).toContain("nothing changes until you choose Apply C");
    expect(html).toContain("observed ground-relative wind profile");
    expect(html).toContain("Ordinary Reset keeps the current C");
    expect(html).toContain(USER_GUIDE_RELEASE_FLOW);
    expect(html).toContain(USER_GUIDE_RELEASE_NO_ADD);
    expect(html).not.toContain(">Add<");
    expect(html).not.toMatch(/>Play</);
    expect(USER_GUIDE_CONTROLS.map((item) => item.name)).toEqual([
      "Release tracer",
      "Confirm",
      "Cancel",
      "Undo / Redo",
      "Clear tracers",
      "Reset",
      "Reset View",
    ]);
  });

  it("recommends Goshen as a first environment without making Moore the whole manual", () => {
    const html = guideMarkup();
    expect(USER_GUIDE_GOSHEN_LABEL).toBe(GOSHEN_2009_OBSERVED_ENVIRONMENT_LABEL);
    expect(html).toContain(USER_GUIDE_GOSHEN_LABEL);
    expect(html).toContain("good first choice");
    expect(html).toContain(USER_GUIDE_MOORE_LABEL);
    expect(html).toContain("one current example");
    expect(html).toContain("COLUMN_UNAVAILABLE");
    expect(contentSrc).not.toMatch(/Moore · 2013 is the/);
    const goshenAt = html.indexOf(USER_GUIDE_GOSHEN_LABEL);
    const mooreAt = html.indexOf(USER_GUIDE_MOORE_LABEL);
    expect(goshenAt).toBeGreaterThan(-1);
    expect(mooreAt).toBeGreaterThan(goshenAt);
  });

  it("teaches trail click vs current selection and keeps T1 honest", () => {
    const html = guideMarkup();
    expect(html).toContain(USER_GUIDE_HISTORY_LEAD);
    expect(html).toContain("HISTORICAL PATH SAMPLE");
    expect(html).toContain("Current selection");
    expect(html).toContain("Historical sample");
    expect(html).toContain(USER_GUIDE_T1_NOT_SPIN);
    expect(html).toContain("not parcel spin-up");
    expect(html).toContain(ANALYSIS_T1_COLOR_LEGEND_V1.gradientCss);
    expect(html).toContain(USER_GUIDE_GLYPH_MEANING);
    expect(html).toContain("cyan arrow");
    expect(html).toContain("dashed yellow");
    expect(html).toContain(USER_GUIDE_WHAT_IF_DOES_NOT);
    expect(html).toContain("does not change the observed atmosphere");
    expect(html).toContain("does not restart the simulation");
    expect(html).toContain("How It Works");
    expect(html).toContain("Glossary");
    expect(html).toContain("Data attribution");
    for (const entry of USER_GUIDE_SUPPORT) {
      expect(html).toContain(entry.code);
    }
  });

  it("exposes in-dialog section navigation", () => {
    const html = guideMarkup();
    expect(html).toContain("aria-label=\"User Guide sections\"");
    for (const item of USER_GUIDE_NAV) {
      expect(html).toContain(`href="#${item.id}"`);
      expect(html).toContain(item.label);
    }
    expect(surfaceSrc).toMatch(/scrollUserGuideSection/);
  });
});

describe("UserGuideAffordance", () => {
  it("is a help control, not a mode toggle", () => {
    const html = renderToStaticMarkup(
      <UserGuideAffordance expanded={false} onOpen={() => {}} />,
    );
    expect(html).toContain("User Guide");
    expect(html).toContain("aria-haspopup=\"dialog\"");
    expect(html).toContain("aria-expanded=\"false\"");
    expect(html).not.toContain("aria-pressed");
  });
});
