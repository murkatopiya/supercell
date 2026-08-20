import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  ExploreFollowControl,
  FOLLOW_REQUIRES_SELECTION_REASON,
} from "./ExploreFollowControl.js";
import appSrc from "../../app/App.tsx?raw";
import inspectorPanelSrc from "./TracerInspectorPanel.tsx?raw";
import pointDiagnosticsPanelSrc from "./PointDiagnosticsPanel.tsx?raw";
import guidedExperimentSrc from "../../guided/GuidedExperiment.ts?raw";

function markup(followEnabled: boolean, canFollow: boolean) {
  return renderToStaticMarkup(
    <ExploreFollowControl
      followEnabled={followEnabled}
      canFollow={canFollow}
      onFollowEnabledChange={() => {}}
    />,
  );
}

describe("ExploreFollowControl", () => {
  it("renders the Follow label and accessible name", () => {
    const html = markup(false, true);
    expect(html).toContain("Follow");
    expect(html).toContain('aria-label="Follow selected tracer"');
    expect(html).toContain("tracer-runtime-controls__button");
  });

  it("is disabled and states a reason when no selected tracer resolves", () => {
    const html = markup(false, false);
    expect(html).toContain("disabled");
    expect(html).toContain('aria-pressed="false"');
    expect(html).not.toContain('aria-pressed="true"');
    expect(html).toContain(FOLLOW_REQUIRES_SELECTION_REASON);
    expect(html).toContain("control-disabled-reason");
    expect(html).toContain(
      `aria-label="Follow selected tracer — ${FOLLOW_REQUIRES_SELECTION_REASON}"`,
    );
  });

  it("stays unpressed when a tracer is selected and Follow is OFF", () => {
    const html = markup(false, true);
    expect(html).not.toContain("disabled");
    expect(html).toContain('aria-pressed="false"');
    expect(html).not.toContain(FOLLOW_REQUIRES_SELECTION_REASON);
  });

  it("is pressed when Follow is ON and a tracer resolves", () => {
    const html = markup(true, true);
    expect(html).not.toContain("disabled");
    expect(html).toContain('aria-pressed="true"');
  });

  it("cannot appear pressed when the control is disabled", () => {
    const html = markup(true, false);
    expect(html).toContain("disabled");
    expect(html).toContain('aria-pressed="false"');
  });

  it("is mounted in Explore controls rail and omitted from Guided", () => {
    const controls = appSrc.slice(
      appSrc.indexOf("workbench__column--controls"),
      appSrc.indexOf("workbench__column--viewport"),
    );
    expect(controls).toMatch(/ExploreFollowControl/);
    expect(controls).toMatch(/followEnabled=\{followEnabled\}/);
    expect(controls.indexOf("TracerRuntimeControls")).toBeLessThan(
      controls.indexOf("ExploreFollowControl"),
    );
    const guidedShell = appSrc.slice(appSrc.indexOf("workbench--guided"));
    expect(guidedShell).not.toMatch(/ExploreFollowControl/);
    expect(guidedShell).not.toMatch(/Follow selected tracer/);
    const observation = appSrc.slice(
      appSrc.indexOf("workbench__column--observation"),
      appSrc.indexOf("workbench--guided"),
    );
    expect(observation).not.toMatch(/ExploreFollowControl/);
    expect(inspectorPanelSrc).not.toMatch(/Follow/);
    expect(pointDiagnosticsPanelSrc).not.toMatch(/Follow/);
    expect(guidedExperimentSrc).not.toMatch(/Follow/);
    expect(guidedExperimentSrc).not.toMatch(/followEnabled/);
  });
});
