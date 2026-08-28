import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ExploreClearTracersControl } from "./ExploreClearTracersControl.js";
import { ExplorePointReleaseControls } from "./ExplorePointReleaseControls.js";
import clearSrc from "./ExploreClearTracersControl.tsx?raw";
import releaseSrc from "./ExplorePointReleaseControls.tsx?raw";
import runtimeSrc from "./TracerRuntimeControls.tsx?raw";
import resetViewSrc from "./ExploreResetViewControl.tsx?raw";
import appSrc from "../../app/App.tsx?raw";

function markup(options: {
  placementEnabled: boolean;
  hasPending: boolean;
}) {
  return renderToStaticMarkup(
    <ExplorePointReleaseControls
      altitudeM={1000}
      placementEnabled={options.placementEnabled}
      hasPending={options.hasPending}
      onAltitudeChange={() => {}}
      onPlacementEnabledChange={() => {}}
      onConfirm={() => {}}
      onCancel={() => {}}
    />,
  );
}

describe("Explore Slice B action-rail controls", () => {
  it("groups Explore actions into Release, Runtime, and View bands", () => {
    const controls = appSrc.slice(
      appSrc.indexOf("workbench__column--controls"),
      appSrc.indexOf("workbench__column--viewport"),
    );
    expect(controls).toMatch(/laboratory-toolbar--explore/);
    expect(controls).toMatch(/control-band--runtime/);
    expect(controls).toMatch(/control-band--view/);
    expect(controls).toMatch(/control-band--release/);
    expect(controls).not.toMatch(/control-band--airflow/);
    expect(controls).not.toMatch(/VisualAirflowWorkbenchControls/);
    expect(controls.indexOf("control-band--release")).toBeLessThan(
      controls.indexOf("control-band--runtime"),
    );
    expect(controls.indexOf("control-band--runtime")).toBeLessThan(
      controls.indexOf("control-band--view"),
    );
  });

  it("keeps F7 terminology: Reset = simulation, Reset View = camera, Clear = tracers", () => {
    expect(runtimeSrc).toMatch(/aria-label="Reset simulation"/);
    expect(runtimeSrc).toMatch(/title="Reset simulation \(not camera\)"/);
    expect(resetViewSrc).toMatch(/aria-label="Reset camera to storm view"/);
    expect(resetViewSrc).toMatch(/does not reset the simulation/);
    expect(clearSrc).toMatch(/aria-label="Clear released tracers"/);
    expect(clearSrc).toMatch(/not simulation Reset or Reset View/);
    expect(clearSrc).toMatch(/>\s*Clear tracers\s*</);
    expect(releaseSrc).not.toMatch(/Clear released tracers/);
    expect(releaseSrc).not.toMatch(/>\s*Clear\s*</);
  });

  it("uses short release copy instead of permanent long instructional chrome", () => {
    const html = markup({ placementEnabled: false, hasPending: false });
    expect(html).toContain("Release passive tracers at a chosen altitude.");
    expect(html).not.toContain(
      "Release tracer. Release passive tracers into the current storm-relative laboratory.",
    );
  });
});

describe("Explore 41-1 Release tracer entry", () => {
  it("replaces Enable placement with a pressed Release tracer control", () => {
    const idle = markup({ placementEnabled: false, hasPending: false });
    expect(idle).toContain("Release tracer");
    expect(idle).toContain('aria-pressed="false"');
    expect(idle).toContain('aria-label="Release tracer"');
    expect(idle).not.toContain("Enable placement");
    expect(idle).not.toContain('type="checkbox"');

    const placing = markup({ placementEnabled: true, hasPending: false });
    expect(placing).toContain('aria-pressed="true"');
    expect(placing).toContain("Altitude");
    expect(placing).toContain(
      "Click the ground to place a release point first.",
    );
  });

  it("keeps Confirm/Cancel off the idle row and discloses them in placement", () => {
    const idle = markup({ placementEnabled: false, hasPending: false });
    expect(idle).not.toContain("Confirm");
    expect(idle).not.toContain("Cancel");
    expect(idle).not.toContain("Altitude");
    expect(idle).not.toContain("Clear tracers");
    expect(idle).not.toContain("Clear released tracers");

    const placing = markup({ placementEnabled: true, hasPending: false });
    expect(placing).toContain("Confirm");
    expect(placing).toContain("Cancel");
    expect(placing).toContain("disabled");
    expect(placing).toContain(
      "Confirm release — Click the ground to place a release point first.",
    );
    expect(placing).toContain('aria-label="Cancel placement"');
    expect(placing).not.toContain("Cancel pending release");
    expect(placing).not.toContain("Clear tracers");
    expect(placing).not.toContain("Clear released tracers");

    const pending = markup({ placementEnabled: true, hasPending: true });
    expect(pending).not.toContain("control-disabled-reason");
    expect(pending).toContain('aria-label="Confirm release"');
    expect(pending).toContain('aria-label="Cancel placement"');
    expect(pending).not.toContain("Clear tracers");
    expect(pending).not.toContain("Clear released tracers");
  });

  it("wires Cancel to leave the existing placementEnabled gate and Confirm to keep it", () => {
    expect(releaseSrc).not.toMatch(/Enable placement/);
    expect(releaseSrc).toMatch(/aria-pressed=\{placementEnabled\}/);
    expect(releaseSrc).toMatch(/onPlacementEnabledChange\(true\)/);

    const confirmHandler = appSrc.slice(
      appSrc.indexOf("onConfirm={() => {"),
      appSrc.indexOf("onCancel={() => {"),
    );
    expect(confirmHandler).toMatch(/confirmRelease\(\)/);
    expect(confirmHandler).not.toMatch(/placementEnabled/);
    expect(confirmHandler).not.toMatch(/setPlacementEnabled/);

    const cancelHandler = appSrc.slice(
      appSrc.indexOf("onCancel={() => {"),
      appSrc.indexOf("control-band--runtime"),
    );
    expect(cancelHandler).toMatch(/cancelPending\(\)/);
    expect(cancelHandler).toMatch(/tool\.placementEnabled = false/);
    expect(cancelHandler).toMatch(/setPlacementEnabled\(false\)/);

    const resetHandler = appSrc.slice(
      appSrc.indexOf("const handleReset"),
      appSrc.indexOf("const handleResetView"),
    );
    expect(resetHandler).not.toMatch(/setPlacementEnabled/);
    expect(resetHandler).toMatch(/resetExploreLab/);

    expect(appSrc).toMatch(/enterExplore[\s\S]*setPlacementEnabled\(false\)/);
    expect(appSrc).toMatch(/enterGuided[\s\S]*setPlacementEnabled\(false\)/);
  });
});

describe("Explore 41-2 Clear tracers occupancy action", () => {
  it("places Clear tracers in Runtime, not in the Confirm/Cancel transaction", () => {
    const occupancy = renderToStaticMarkup(
      <ExploreClearTracersControl tracerCount={1} onClear={() => {}} />,
    );
    expect(occupancy).toContain("Clear tracers");
    expect(occupancy).toContain('aria-label="Clear released tracers"');
    expect(occupancy).not.toContain("Confirm");
    expect(occupancy).not.toContain("Cancel");

    const runtimeBand = appSrc.slice(
      appSrc.indexOf("control-band--runtime"),
      appSrc.indexOf("control-band--view"),
    );
    expect(runtimeBand).toMatch(/ExploreClearTracersControl/);
    expect(runtimeBand).toMatch(/handleClearTracers/);
    expect(runtimeBand).toMatch(/TracerRuntimeControls/);

    const viewBand = appSrc.slice(
      appSrc.indexOf("control-band--view"),
      appSrc.indexOf("workbench__column--viewport"),
    );
    expect(viewBand).not.toMatch(/ExploreClearTracersControl/);
    expect(viewBand).not.toMatch(/Clear tracers/);

    const releaseBand = appSrc.slice(
      appSrc.indexOf("control-band--release"),
      appSrc.indexOf("control-band--runtime"),
    );
    expect(releaseBand).not.toMatch(/ExploreClearTracersControl/);
    expect(releaseBand).not.toMatch(/onClear/);
    expect(releaseBand).not.toMatch(/Clear tracers/);

    const guidedShell = appSrc.slice(appSrc.indexOf("workbench--guided"));
    expect(guidedShell).not.toMatch(/ExploreClearTracersControl/);
  });

  it("keeps occupancy Clear semantics and does not flip placementEnabled or clock/runtime", () => {
    const clearHandler = appSrc.slice(
      appSrc.indexOf("const handleClearTracers"),
      appSrc.indexOf("const enterExplore"),
    );
    expect(clearHandler).toMatch(/orchestration\.clear\(\)/);
    expect(clearHandler).toMatch(/clearSelectionAndInspection\(\)/);
    expect(clearHandler).toMatch(/setPendingSeed\(null\)/);
    expect(clearHandler).not.toMatch(/setPlacementEnabled/);
    expect(clearHandler).not.toMatch(/placementEnabled/);
    expect(clearHandler).not.toMatch(/setPaused/);
    expect(clearHandler).not.toMatch(/setTimeScale/);
    expect(clearHandler).not.toMatch(/clock/);
    expect(clearHandler).not.toMatch(/handleReset/);
    expect(clearHandler).not.toMatch(/resetView/);
    expect(clearHandler).not.toMatch(/resetExploreLab/);

    const resetHandler = appSrc.slice(
      appSrc.indexOf("const handleReset"),
      appSrc.indexOf("const handleResetView"),
    );
    expect(resetHandler).toMatch(/resetExploreLab/);
    expect(resetHandler).not.toMatch(/orchestration\.clear/);

    const resetViewHandler = appSrc.slice(
      appSrc.indexOf("const handleResetView"),
      appSrc.indexOf("const handleClearTracers"),
    );
    expect(resetViewHandler).toMatch(/resetView\(\)/);
    expect(resetViewHandler).not.toMatch(/orchestration\.clear/);
  });
});

describe("Explore 41-3 rail hierarchy", () => {
  it("makes Release the first Explore band, then Runtime, View", () => {
    const toolbar = appSrc.slice(
      appSrc.indexOf("laboratory-toolbar--explore"),
      appSrc.indexOf("workbench__column--viewport"),
    );
    expect(toolbar.indexOf("control-band--")).toBe(
      toolbar.indexOf("control-band--release"),
    );
    expect(toolbar).toMatch(/control-band--release control-band--primary/);
    expect(toolbar.indexOf("control-band--release")).toBeLessThan(
      toolbar.indexOf("control-band--runtime"),
    );
    expect(toolbar.indexOf("control-band--runtime")).toBeLessThan(
      toolbar.indexOf("control-band--view"),
    );
    expect(toolbar).not.toMatch(/control-band--airflow/);
    expect(toolbar).not.toMatch(/<details/);
    expect(toolbar).not.toMatch(/accordion/i);
  });

  it("keeps every existing control in its band and leaves Guided without Explore actions", () => {
    const releaseBand = appSrc.slice(
      appSrc.indexOf("control-band--release"),
      appSrc.indexOf("control-band--runtime"),
    );
    expect(releaseBand).toMatch(/ExplorePointReleaseControls/);
    expect(releaseBand).not.toMatch(/TracerRuntimeControls/);
    expect(releaseBand).not.toMatch(/ExploreClearTracersControl/);
    expect(releaseBand).not.toMatch(/ExploreFollowControl/);
    expect(releaseBand).not.toMatch(/ExploreResetViewControl/);
    expect(releaseBand).not.toMatch(/VisualAirflowWorkbenchControls/);

    const runtimeBand = appSrc.slice(
      appSrc.indexOf("control-band--runtime"),
      appSrc.indexOf("control-band--view"),
    );
    expect(runtimeBand).toMatch(/TracerRuntimeControls/);
    expect(runtimeBand).toMatch(/ExploreClearTracersControl/);
    expect(runtimeBand).not.toMatch(/ExplorePointReleaseControls/);
    expect(runtimeBand).not.toMatch(/ExploreFollowControl/);
    expect(runtimeBand).not.toMatch(/ExploreResetViewControl/);
    expect(runtimeBand).not.toMatch(/VisualAirflowWorkbenchControls/);

    const viewBand = appSrc.slice(
      appSrc.indexOf("control-band--view"),
      appSrc.indexOf("workbench__column--viewport"),
    );
    expect(viewBand).toMatch(/ExploreFollowControl/);
    expect(viewBand).toMatch(/ExploreResetViewControl/);
    expect(viewBand).not.toMatch(/ExplorePointReleaseControls/);
    expect(viewBand).not.toMatch(/ExploreClearTracersControl/);
    expect(viewBand).not.toMatch(/TracerRuntimeControls/);
    expect(viewBand).not.toMatch(/VisualAirflowWorkbenchControls/);

    const controls = appSrc.slice(
      appSrc.indexOf("workbench__column--controls"),
      appSrc.indexOf("workbench__column--viewport"),
    );
    expect(controls).not.toMatch(/VisualAirflowWorkbenchControls/);
    expect(controls).not.toMatch(/control-band--airflow/);
    expect(controls).not.toMatch(/workbench__environment/);
    expect(controls).not.toMatch(/hodographColumn/);
    expect(controls).not.toMatch(/EnvironmentSurface/);
    expect(controls).not.toMatch(/HodographPanel/);

    const guidedShell = appSrc.slice(appSrc.indexOf("workbench--guided"));
    expect(guidedShell).not.toMatch(/control-band--release/);
    expect(guidedShell).not.toMatch(/ExplorePointReleaseControls/);
    expect(guidedShell).not.toMatch(/ExploreClearTracersControl/);
    expect(guidedShell).not.toMatch(/ExploreFollowControl/);
    expect(guidedShell).not.toMatch(/ExploreResetViewControl/);
    expect(guidedShell).not.toMatch(/VisualAirflowWorkbenchControls/);
  });
});
