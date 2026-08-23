import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ExplorePointReleaseControls } from "./ExplorePointReleaseControls.js";
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
      onClear={() => {}}
    />,
  );
}

describe("Explore Slice B action-rail controls", () => {
  it("groups Explore actions into Runtime, View, Release, and secondary Airflow bands", () => {
    const controls = appSrc.slice(
      appSrc.indexOf("workbench__column--controls"),
      appSrc.indexOf("workbench__column--viewport"),
    );
    expect(controls).toMatch(/laboratory-toolbar--explore/);
    expect(controls).toMatch(/control-band--runtime/);
    expect(controls).toMatch(/control-band--view/);
    expect(controls).toMatch(/control-band--release/);
    expect(controls).toMatch(/control-band--airflow/);
    expect(controls).toMatch(/control-band--secondary/);
    expect(controls.indexOf("control-band--runtime")).toBeLessThan(
      controls.indexOf("control-band--view"),
    );
    expect(controls.indexOf("control-band--view")).toBeLessThan(
      controls.indexOf("control-band--release"),
    );
    expect(controls.indexOf("control-band--release")).toBeLessThan(
      controls.indexOf("control-band--airflow"),
    );
    expect(controls.indexOf("control-band--airflow")).toBeLessThan(
      controls.indexOf("VisualAirflowWorkbenchControls"),
    );
  });

  it("keeps F7 terminology: Reset = simulation, Reset View = camera, Clear = tracers", () => {
    expect(runtimeSrc).toMatch(/aria-label="Reset simulation"/);
    expect(runtimeSrc).toMatch(/title="Reset simulation \(not camera\)"/);
    expect(resetViewSrc).toMatch(/aria-label="Reset camera to storm view"/);
    expect(resetViewSrc).toMatch(/does not reset the simulation/);
    expect(releaseSrc).toMatch(/aria-label="Clear released tracers"/);
    expect(releaseSrc).toMatch(/not simulation Reset or Reset View/);
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
    expect(idle).toContain("Clear");

    const placing = markup({ placementEnabled: true, hasPending: false });
    expect(placing).toContain("Confirm");
    expect(placing).toContain("Cancel");
    expect(placing).toContain("disabled");
    expect(placing).toContain(
      "Confirm release — Click the ground to place a release point first.",
    );
    expect(placing).toContain('aria-label="Cancel placement"');
    expect(placing).not.toContain("Cancel pending release");

    const pending = markup({ placementEnabled: true, hasPending: true });
    expect(pending).not.toContain("control-disabled-reason");
    expect(pending).toContain('aria-label="Confirm release"');
    expect(pending).toContain('aria-label="Cancel placement"');
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
      appSrc.indexOf("onClear={() => {"),
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

    const clearHandler = appSrc.slice(
      appSrc.indexOf("onClear={() => {"),
      appSrc.indexOf("control-band--airflow"),
    );
    expect(clearHandler).toMatch(/orchestration\.clear\(\)/);
    expect(clearHandler).not.toMatch(/setPlacementEnabled/);

    expect(appSrc).toMatch(/enterExplore[\s\S]*setPlacementEnabled\(false\)/);
    expect(appSrc).toMatch(/enterGuided[\s\S]*setPlacementEnabled\(false\)/);
  });
});
