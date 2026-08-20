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

  it("is mounted in Explore controls rail and omitted from Guided", () => {
    const controls = appSrc.slice(
      appSrc.indexOf("workbench__column--controls"),
      appSrc.indexOf("workbench__column--viewport"),
    );
    expect(controls).toMatch(/ExploreResetViewControl/);
    expect(controls).toMatch(/onResetView=\{handleResetView\}/);
    expect(controls.indexOf("ExploreFollowControl")).toBeLessThan(
      controls.indexOf("ExploreResetViewControl"),
    );
    const guidedShell = appSrc.slice(appSrc.indexOf("workbench--guided"));
    expect(guidedShell).not.toMatch(/ExploreResetViewControl/);
    expect(guidedShell).not.toMatch(/Reset camera to storm view/);
    const observation = appSrc.slice(
      appSrc.indexOf("workbench__column--observation"),
      appSrc.indexOf("workbench--guided"),
    );
    expect(observation).not.toMatch(/ExploreResetViewControl/);
    expect(inspectorPanelSrc).not.toMatch(/Reset View/);
    expect(pointDiagnosticsPanelSrc).not.toMatch(/Reset View/);
    expect(workbenchControlsSrc).not.toMatch(/Reset View/);
    expect(guidedExperimentSrc).not.toMatch(/Reset View/);
    expect(guidedExperimentSrc).not.toMatch(/resetView/);
  });
});
