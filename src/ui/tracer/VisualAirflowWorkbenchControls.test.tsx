import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  STORM_OPERAND_HIGHLIGHT_KEYS,
} from "../../visualization/operandContributionDisplay.js";
import { labelForContribution } from "./tracerContributionLabels.js";
import { VisualAirflowWorkbenchControls } from "./VisualAirflowWorkbenchControls.js";
import controlsSrc from "./VisualAirflowWorkbenchControls.tsx?raw";
import appSrc from "../../app/App.tsx?raw";
import createGuidedLabSrc from "../../app/createGuidedLab.ts?raw";
import {
  DEFAULT_OPERAND_HIGHLIGHT_MODE,
  DEFAULT_VISUAL_AIRFLOW_PAUSE_VISUALIZATION,
  DEFAULT_VISUAL_AIRFLOW_WORKBENCH_MODE,
} from "../../rendering/visualAirflowWorkbenchMode.js";

function markup(
  mode: "advected-comet" | "eulerian-oriented",
  highlightMode: "off" | (typeof STORM_OPERAND_HIGHLIGHT_KEYS)[number] = "off",
  depthCueEnabled = false,
) {
  return renderToStaticMarkup(
    <VisualAirflowWorkbenchControls
      mode={mode}
      highlightMode={highlightMode}
      depthCueEnabled={depthCueEnabled}
      onModeChange={() => {}}
      onHighlightModeChange={() => {}}
      onDepthCueChange={() => {}}
    />,
  );
}

describe("VisualAirflowWorkbenchControls V1 product surface", () => {
  it("defaults to Flow comets and exposes only Comets + Eulerian diagnostic", () => {
    expect(DEFAULT_VISUAL_AIRFLOW_WORKBENCH_MODE).toBe("advected-comet");
    const html = markup("advected-comet");
    expect(html).toContain("Airflow view");
    expect(html).toContain("Flow comets");
    expect(html).toContain("Eulerian — diagnostic");
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain("tails ≠ history");
    expect(html).toContain("spacing ≠ density");
    expect(html).toContain("About airflow view");
    expect(html).toContain(
      "Airflow marks show motion and direction in the prescribed total velocity field, V_total.",
    );
    expect(html).toContain(
      "Short tails are direction cues, not tracer histories",
    );
    expect(html).toContain("marker count and spacing are not air density");
    expect(html).not.toContain(">Points<");
    expect(html).not.toContain("Advected marks");
    expect(html).not.toContain("Eulerian marks");
    expect(html).not.toContain("Comets</");
    expect(controlsSrc).not.toMatch(/onModeChange\("points"\)/);
    expect(controlsSrc).not.toMatch(/onModeChange\("advected-oriented"\)/);
  });

  it("does not expose Pause viz and keeps Full freeze as product Pause behavior", () => {
    const html = markup("advected-comet");
    expect(html).not.toContain("Pause viz");
    expect(html).not.toContain("Full freeze");
    expect(html).not.toContain("Animate frozen field");
    expect(controlsSrc).not.toMatch(/pauseVisualization/);
    expect(controlsSrc).not.toMatch(/onPauseVisualizationChange/);
    expect(DEFAULT_VISUAL_AIRFLOW_PAUSE_VISUALIZATION).toBe("full-freeze");
    expect(appSrc).toMatch(/pauseVisualization=\{pauseVisualization\}/);
    expect(appSrc).toMatch(/DEFAULT_VISUAL_AIRFLOW_PAUSE_VISUALIZATION/);
  });

  it("groups Highlight as a diagnostic tool defaulting Off with six operands", () => {
    expect(DEFAULT_OPERAND_HIGHLIGHT_MODE).toBe("off");
    const html = markup("advected-comet", "off");
    expect(html).toContain("Diagnostic tools");
    expect(html).toContain("Highlight");
    expect(html).toContain("Off");
    expect(html).toContain("Choose");
    expect(html).toContain("not a separate air mass");
    expect(html).toContain("About diagnostic tools");
    expect(html).toContain(
      "Highlight tints where one selected storm operand contributes",
    );
    expect(html).toContain(
      "Tint is not a separate air mass or a quantitative comparison between operands.",
    );
    for (const key of STORM_OPERAND_HIGHLIGHT_KEYS) {
      expect(html).toContain(`value="${key}"`);
      expect(html).toContain(labelForContribution(key));
    }
    expect(html.match(/<option /g)).toHaveLength(
      STORM_OPERAND_HIGHLIGHT_KEYS.length + 1,
    );
    expect(html).not.toContain("environmentAdvection");
    expect(html).not.toContain("Environmental advection");
    expect(html).not.toContain("Hue A");
    expect(html).not.toContain('type="color"');
    expect(html).not.toContain("Background");
    expect(html).not.toContain("Both");
  });

  it("exposes Depth cue Off by default as an advanced viewing aid", () => {
    const html = markup("advected-comet", "off", false);
    expect(html).toContain("Depth cue");
    expect(html).toContain('type="checkbox"');
    expect(html).not.toMatch(/checked=""/);
    expect(html).toContain("not meteorological fog");
    expect(html).toContain(
      "Depth cue changes background airflow salience with camera distance",
    );
  });

  it("keeps full anti-claims on demand rather than permanent multi-paragraph chrome", () => {
    expect(controlsSrc).toMatch(/<details/);
    expect(controlsSrc).toMatch(/About airflow view/);
    expect(controlsSrc).toMatch(/About diagnostic tools/);
    expect(controlsSrc).toMatch(/copy--compact/);
    const html = markup("advected-comet");
    expect(html).toContain("<details");
    expect(html).toContain("About airflow view");
  });

  it("replaces Eulerian copy when the diagnostic view is active", () => {
    const html = markup("eulerian-oriented");
    expect(html).toContain("Fixed-position V_total samples");
    expect(html).toContain(
      "Eulerian direction marks sample the prescribed total velocity field, V_total",
    );
    expect(html).toContain(
      "They show instantaneous direction, not moving air parcels",
    );
    expect(html).not.toContain(
      ">Short tails are direction cues, not tracer histories<",
    );
    expect(html).not.toContain(
      "tails ≠ history; spacing ≠ density.",
    );
  });

  it("removes user-visible research / workbench apology copy", () => {
    const html = markup("advected-comet");
    expect(html).not.toContain("Dev workbench");
    expect(html).not.toContain("Not product visualization modes");
    expect(html).not.toContain("prototype hue");
    expect(html).not.toContain("Not product");
    expect(controlsSrc).not.toMatch(/Dev workbench/);
    expect(controlsSrc).not.toMatch(/Not product visualization modes/);
    expect(controlsSrc).not.toMatch(/prototype hue/);
    const exploreShell = appSrc.slice(
      appSrc.indexOf("workbench--explore"),
      appSrc.indexOf("workbench--guided"),
    );
    expect(exploreShell).toMatch(/VisualAirflowWorkbenchControls/);
    const guidedShell = appSrc.slice(appSrc.indexOf("workbench--guided"));
    expect(guidedShell).not.toMatch(/VisualAirflowWorkbenchControls/);
    expect(createGuidedLabSrc).not.toMatch(/VisualAirflowWorkbenchControls/);
  });

  it("selects the named operand without adding a color picker", () => {
    const html = markup("advected-comet", "rotation");
    expect(html).toContain('value="rotation"');
    expect(html).toContain(labelForContribution("rotation"));
    expect(html.match(/<option /g)).toHaveLength(
      STORM_OPERAND_HIGHLIGHT_KEYS.length,
    );
    expect(html).not.toContain("Choose");
    expect(controlsSrc).toMatch(/STORM_OPERAND_HIGHLIGHT_KEYS\.map/);
    expect(controlsSrc).toMatch(/onHighlightModeChange\("off"\)/);
  });
});
