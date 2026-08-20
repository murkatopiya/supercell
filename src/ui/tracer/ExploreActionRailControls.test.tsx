import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ExplorePointReleaseControls } from "./ExplorePointReleaseControls.js";
import releaseSrc from "./ExplorePointReleaseControls.tsx?raw";
import runtimeSrc from "./TracerRuntimeControls.tsx?raw";
import resetViewSrc from "./ExploreResetViewControl.tsx?raw";
import appSrc from "../../app/App.tsx?raw";

function markup(hasPending: boolean) {
  return renderToStaticMarkup(
    <ExplorePointReleaseControls
      altitudeM={1000}
      placementEnabled={false}
      hasPending={hasPending}
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

  it("states why Confirm and Cancel are disabled without a pending placement", () => {
    const disabled = markup(false);
    expect(disabled).toContain("disabled");
    expect(disabled).toContain(
      "Click the ground to place a release point first.",
    );
    expect(disabled).toContain("control-disabled-reason");
    expect(disabled).toContain(
      "Confirm release — Click the ground to place a release point first.",
    );
    expect(disabled).toContain(
      "Cancel pending release — Click the ground to place a release point first.",
    );

    const pending = markup(true);
    expect(pending).not.toContain("control-disabled-reason");
    expect(pending).toContain('aria-label="Confirm release"');
    expect(pending).toContain('aria-label="Cancel pending release"');
  });

  it("uses short release copy instead of permanent long instructional chrome", () => {
    const html = markup(false);
    expect(html).toContain("Release passive tracers at a chosen altitude.");
    expect(html).not.toContain(
      "Release tracer. Release passive tracers into the current storm-relative laboratory.",
    );
  });
});
