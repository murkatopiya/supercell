import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  ExploreFocusSampleControl,
  FOCUS_SAMPLE_REQUIRES_PROBE_REASON,
} from "./ExploreFocusSampleControl.js";
import appSrc from "../../app/App.tsx?raw";
import inspectorPanelSrc from "./TracerInspectorPanel.tsx?raw";
import pointDiagnosticsPanelSrc from "./PointDiagnosticsPanel.tsx?raw";
import guidedExperimentSrc from "../../guided/GuidedExperiment.ts?raw";
import followSrc from "./ExploreFollowControl.tsx?raw";

function markup(canFocus: boolean) {
  return renderToStaticMarkup(
    <ExploreFocusSampleControl canFocus={canFocus} onFocusSample={() => {}} />,
  );
}

describe("ExploreFocusSampleControl", () => {
  it("renders compact Focus sample copy", () => {
    const html = markup(true);
    expect(html).toContain("Focus sample");
    expect(html).toContain('aria-label="Focus camera on selected recorded sample"');
    expect(html).not.toContain("disabled");
  });

  it("is disabled until an exact historical sample is selected", () => {
    const html = markup(false);
    expect(html).toContain("disabled");
    expect(html).toContain(FOCUS_SAMPLE_REQUIRES_PROBE_REASON);
    expect(html).toContain("control-disabled-reason");
  });

  it("is not Follow and is not mounted in Guided", () => {
    expect(followSrc).not.toMatch(/Focus sample/);
    const controls = appSrc.slice(
      appSrc.indexOf("workbench__column--controls"),
      appSrc.indexOf("workbench__column--viewport"),
    );
    expect(controls).toMatch(/ExploreFocusSampleControl/);
    expect(controls).toMatch(/canFocus=\{historicalSample !== undefined\}/);
    const followAt = controls.indexOf("ExploreFollowControl");
    const focusAt = controls.indexOf("ExploreFocusSampleControl");
    const resetAt = controls.indexOf("ExploreResetViewControl");
    expect(followAt).toBeGreaterThanOrEqual(0);
    expect(focusAt).toBeGreaterThan(followAt);
    expect(resetAt).toBeGreaterThan(focusAt);
    const guidedShell = appSrc.slice(appSrc.indexOf("workbench--guided"));
    expect(guidedShell).not.toMatch(/ExploreFocusSampleControl/);
    expect(guidedShell).not.toMatch(/Focus sample/);
    expect(inspectorPanelSrc).not.toMatch(/Focus sample/);
    expect(pointDiagnosticsPanelSrc).not.toMatch(/Focus sample/);
    expect(guidedExperimentSrc).not.toMatch(/Focus sample/);
  });
});
