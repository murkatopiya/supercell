import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ExploreFollowControl } from "./ExploreFollowControl.js";
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

  it("is disabled and unpressed when no selected tracer resolves", () => {
    const html = markup(false, false);
    expect(html).toContain("disabled");
    expect(html).toContain('aria-pressed="false"');
    expect(html).not.toContain('aria-pressed="true"');
  });

  it("stays unpressed when a tracer is selected and Follow is OFF", () => {
    const html = markup(false, true);
    expect(html).not.toContain("disabled");
    expect(html).toContain('aria-pressed="false"');
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

  it("is mounted in Explore laboratory-toolbar and omitted from Guided", () => {
    const laboratory = appSrc.slice(
      appSrc.indexOf("workbench__column--laboratory"),
      appSrc.indexOf("workbench__column--inspector"),
    );
    expect(laboratory).toMatch(/ExploreFollowControl/);
    expect(laboratory).toMatch(
      /explore !== null && \(\s*<ExploreFollowControl/s,
    );
    expect(laboratory).toMatch(/followEnabled=\{followEnabled\}/);
    expect(laboratory.indexOf("TracerRuntimeControls")).toBeLessThan(
      laboratory.indexOf("ExploreFollowControl"),
    );
    const inspectorColumn = appSrc.slice(
      appSrc.indexOf("workbench__column--inspector"),
    );
    expect(inspectorColumn).not.toMatch(/ExploreFollowControl/);
    expect(inspectorColumn).not.toMatch(/Follow selected tracer/);
    expect(laboratory).not.toMatch(
      /lab\.kind === "guided"[\s\S]*ExploreFollowControl/,
    );
    expect(inspectorPanelSrc).not.toMatch(/Follow/);
    expect(pointDiagnosticsPanelSrc).not.toMatch(/Follow/);
    expect(guidedExperimentSrc).not.toMatch(/Follow/);
    expect(guidedExperimentSrc).not.toMatch(/followEnabled/);
  });
});
