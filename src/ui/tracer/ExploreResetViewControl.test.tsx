import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ExploreResetViewControl } from "./ExploreResetViewControl.js";
import appSrc from "../../app/App.tsx?raw";
import inspectorPanelSrc from "./TracerInspectorPanel.tsx?raw";
import pointDiagnosticsPanelSrc from "./PointDiagnosticsPanel.tsx?raw";
import workbenchControlsSrc from "./VisualAirflowWorkbenchControls.tsx?raw";
import guidedExperimentSrc from "../../guided/GuidedExperiment.ts?raw";

function markup(onResetView: () => void = () => {}) {
  return renderToStaticMarkup(
    <ExploreResetViewControl onResetView={onResetView} />,
  );
}

describe("ExploreResetViewControl", () => {
  it("renders Reset View with the locked accessible label", () => {
    const html = markup();
    expect(html).toContain("Reset View");
    expect(html).toContain('aria-label="Reset camera to storm view"');
    expect(html).toContain("tracer-runtime-controls__button");
  });

  it("is always enabled", () => {
    const html = markup();
    expect(html).not.toContain("disabled");
  });

  it("invokes onResetView on click", () => {
    const onResetView = vi.fn();
    // SSR markup cannot click; contract is the wired prop name + App handler.
    expect(markup(onResetView)).toContain("Reset View");
    expect(appSrc).toMatch(/onResetView=\{handleResetView\}/);
  });

  it("is mounted in Explore laboratory-toolbar and omitted from Guided", () => {
    const laboratory = appSrc.slice(
      appSrc.indexOf("workbench__column--laboratory"),
      appSrc.indexOf("workbench__column--inspector"),
    );
    expect(laboratory).toMatch(/ExploreResetViewControl/);
    expect(laboratory).toMatch(
      /explore !== null && \(\s*<ExploreResetViewControl/s,
    );
    expect(laboratory.indexOf("ExploreFollowControl")).toBeLessThan(
      laboratory.indexOf("ExploreResetViewControl"),
    );
    expect(laboratory).not.toMatch(
      /lab\.kind === "guided"[\s\S]*ExploreResetViewControl/,
    );
    const inspectorColumn = appSrc.slice(
      appSrc.indexOf("workbench__column--inspector"),
    );
    expect(inspectorColumn).not.toMatch(/ExploreResetViewControl/);
    expect(inspectorColumn).not.toMatch(/Reset camera to storm view/);
    expect(inspectorPanelSrc).not.toMatch(/Reset View/);
    expect(pointDiagnosticsPanelSrc).not.toMatch(/Reset View/);
    expect(workbenchControlsSrc).not.toMatch(/Reset View/);
    expect(guidedExperimentSrc).not.toMatch(/Reset View/);
    expect(guidedExperimentSrc).not.toMatch(/resetView/);
  });
});
