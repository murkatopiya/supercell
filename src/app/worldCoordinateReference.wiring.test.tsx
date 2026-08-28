import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CoordinateReferenceControl } from "../ui/tracer/CoordinateReferenceControl.js";
import appSrc from "./App.tsx?raw";
import tracerSceneSrc from "../rendering/TracerScene.ts?raw";
import tracerViewportSrc from "../ui/tracer/TracerViewport.tsx?raw";
import resolveSrc from "../ui/tracer/resolveTracerPointerUp.ts?raw";

/**
 * Slice 3 — world coordinate reference.
 * docs/ui/09-world-coordinate-reference.md
 */
describe("Slice 3 world coordinate reference wiring", () => {
  it("owns grid visibility in App session state and shares the control", () => {
    expect(appSrc).toMatch(
      /const \[coordinateReferenceVisible, setCoordinateReferenceVisible\][\s\S]*useState\(true\)/,
    );
    expect(appSrc).toMatch(
      /coordinateReferenceVisible=\{coordinateReferenceVisible\}/,
    );
    expect(appSrc).toMatch(
      /onVisibleChange=\{setCoordinateReferenceVisible\}/,
    );
    expect(appSrc).toMatch(
      /overlay=\{[\s\S]*CoordinateReferenceControl/,
    );

    const exploreToolbar = appSrc.slice(
      appSrc.indexOf("workbench__column--viewport"),
      appSrc.indexOf("workbench__column--observation"),
    );
    expect(exploreToolbar).not.toMatch(/CoordinateReferenceControl/);
    expect(exploreToolbar).toMatch(/VisualAirflowWorkbenchControls/);

    const guidedShell = appSrc.slice(appSrc.indexOf("workbench--guided"));
    expect(guidedShell).not.toMatch(/CoordinateReferenceControl/);
    expect(guidedShell).not.toMatch(/SceneToolbar/);
    expect(guidedShell).not.toMatch(/VisualAirflowWorkbenchControls/);

    const html = renderToStaticMarkup(
      <CoordinateReferenceControl visible={true} onVisibleChange={() => {}} />,
    );
    expect(html).toContain("Grid");
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain("World coordinate grid");
  });

  it("replaces AxesHelper with the world coordinate-reference layer", () => {
    expect(tracerSceneSrc).toMatch(/createWorldCoordinateReference/);
    expect(tracerSceneSrc).toMatch(/setCoordinateReferenceVisible/);
    expect(tracerSceneSrc).not.toMatch(/AxesHelper/);
    expect(tracerSceneSrc).not.toMatch(/new THREE\.GridHelper/);
  });

  it("keeps the HUD as a non-interactive readout of ray ∩ y = 0", () => {
    expect(tracerViewportSrc).toMatch(/groundCursorHudFromClientPoint/);
    expect(tracerViewportSrc).toMatch(/worldRayFromNdc/);
    expect(tracerViewportSrc).toMatch(/className="tracer-viewport__overlay"/);
    expect(tracerViewportSrc).toMatch(/className="tracer-viewport__hud"/);
    expect(tracerViewportSrc).toMatch(/pointerEvents: "none"/);
    expect(tracerViewportSrc).toMatch(/aria-label="Ground cursor"/);
    expect(tracerViewportSrc).not.toMatch(/setPendingSeed/);
    expect(tracerViewportSrc).not.toMatch(/selection\.select/);
  });

  it("does not change tracer pick or Explore release semantics", () => {
    expect(tracerViewportSrc).toMatch(/resolveTracerPointerUp/);
    expect(tracerViewportSrc).toMatch(/pickVisibleTracerAtClientPoint/);
    expect(resolveSrc).not.toMatch(/coordinateReference/);
    expect(resolveSrc).not.toMatch(/GridHelper/);
    const resetBlock = appSrc.slice(
      appSrc.indexOf("const handleReset"),
      appSrc.indexOf("const handleResetView"),
    );
    expect(resetBlock).not.toMatch(/setCoordinateReferenceVisible/);
    const clearBlock = appSrc.slice(
      appSrc.indexOf("const handleClearTracers"),
      appSrc.indexOf("const enterExplore"),
    );
    expect(clearBlock).not.toMatch(/setCoordinateReferenceVisible/);
  });
});
