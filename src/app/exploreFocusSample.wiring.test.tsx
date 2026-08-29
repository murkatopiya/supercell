import { describe, expect, it } from "vitest";
import appSrc from "./App.tsx?raw";
import tracerViewportSrc from "../ui/tracer/TracerViewport.tsx?raw";
import tracerSceneSrc from "../rendering/TracerScene.ts?raw";
import pickSrc from "../rendering/pickPathHistorySample.ts?raw";

describe("Explore Focus sample App wiring", () => {
  it("turns Follow OFF then focuses the exact recorded sample", () => {
    const handler = appSrc.slice(
      appSrc.indexOf("const handleFocusSample"),
      appSrc.indexOf("const handleClearTracers"),
    );
    expect(handler).toMatch(/resolveHistoricalPathSample/);
    expect(handler).toMatch(/setFollowEnabled\(false\)/);
    expect(handler).toMatch(/sceneHandleRef\.current\?\.focusPoint\(sample\.position\)/);
    const offAt = handler.indexOf("setFollowEnabled(false)");
    const focusAt = handler.indexOf("focusPoint(sample.position)");
    expect(offAt).toBeGreaterThanOrEqual(0);
    expect(focusAt).toBeGreaterThan(offAt);
    expect(handler).not.toMatch(/midpoint|interpolate|fraction/);
    expect(tracerViewportSrc).toMatch(/focusPoint\(position\)/);
    expect(tracerSceneSrc).toMatch(/focusPoint\(position: Vec3\)/);
  });

  it("does not auto-focus when historical selection changes", () => {
    const selectBlock = appSrc.slice(
      appSrc.indexOf("onPathSampleSelect"),
      appSrc.indexOf("onSimulationAdvanced"),
    );
    expect(selectBlock).toMatch(/setHistoricalPathProbe/);
    expect(selectBlock).not.toMatch(/focusPoint/);
    expect(selectBlock).not.toMatch(/handleFocusSample/);
  });

  it("does not replace Follow or Reset View", () => {
    expect(appSrc).toMatch(/ExploreFollowControl/);
    expect(appSrc).toMatch(/ExploreResetViewControl/);
    expect(appSrc).toMatch(/ExploreFocusSampleControl/);
    const resetHandler = appSrc.slice(
      appSrc.indexOf("const handleResetView"),
      appSrc.indexOf("const handleFocusSample"),
    );
    expect(resetHandler).toMatch(/resetView\(\)/);
    expect(resetHandler).not.toMatch(/focusPoint/);
  });

  it("does not change occupancy picking", () => {
    expect(pickSrc).toMatch(/pickPathHistorySample/);
    expect(pickSrc).not.toMatch(/focusPoint/);
  });
});
