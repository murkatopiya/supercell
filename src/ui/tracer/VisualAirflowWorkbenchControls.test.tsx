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

function markup(highlightMode: "off" | (typeof STORM_OPERAND_HIGHLIGHT_KEYS)[number]) {
  return renderToStaticMarkup(
    <VisualAirflowWorkbenchControls
      mode="advected-comet"
      pauseVisualization="full-freeze"
      highlightMode={highlightMode}
      depthCueEnabled={false}
      onModeChange={() => {}}
      onPauseVisualizationChange={() => {}}
      onHighlightModeChange={() => {}}
      onDepthCueChange={() => {}}
    />,
  );
}

describe("VisualAirflowWorkbenchControls operand selector", () => {
  it("renders Off plus exactly the six diagnostic storm operands", () => {
    const html = markup("off");
    expect(html).toContain("Highlight");
    expect(html).toContain("Off");
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain("Choose");
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
    expect(html).not.toContain("Hue B");
    expect(html).not.toContain("Hue C");
    expect(html).not.toContain('type="color"');
    expect(html).not.toContain("Background");
  });

  it("selects the named operand without adding a color picker", () => {
    const html = markup("rotation");
    expect(html).toContain('value="rotation"');
    expect(html).toContain(labelForContribution("rotation"));
    expect(html.match(/<option /g)).toHaveLength(
      STORM_OPERAND_HIGHLIGHT_KEYS.length,
    );
    expect(html).not.toContain("Choose");
    expect(controlsSrc).toMatch(/STORM_OPERAND_HIGHLIGHT_KEYS\.map/);
    expect(controlsSrc).toMatch(/onHighlightModeChange\("off"\)/);
    expect(controlsSrc).not.toMatch(/hue-a|Hue A/);
    expect(appSrc).toMatch(/explore !== null && \(\s*<VisualAirflowWorkbenchControls/s);
    expect(createGuidedLabSrc).not.toMatch(/VisualAirflowWorkbenchControls/);
  });
});
