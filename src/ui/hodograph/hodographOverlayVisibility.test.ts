import { describe, expect, it } from "vitest";
import {
  DEFAULT_HODOGRAPH_OVERLAY_VISIBILITY,
  isHorizontalVorticityDrawn,
  isStormMotionDrawn,
  isStormRelativeWindCheckboxDisabled,
  isStormRelativeWindDrawn,
  isStreamwiseCrosswiseCheckboxDisabled,
  isStreamwiseCrosswiseDrawn,
  type HodographOverlayVisibility,
} from "./hodographOverlayVisibility.js";
import { buildViewTransform } from "./hodographViewTransform.js";
import type { HodographPoint } from "../../physics/environment/hodograph.js";

const demoPoints: HodographPoint[] = [
  { height: 0, eastward: 10, northward: 0 },
  { height: 1000, eastward: 20, northward: 10 },
  { height: 2000, eastward: 20, northward: 20 },
];

const demoC = { eastward: 10, northward: -10 };

describe("hodographOverlayVisibility", () => {
  it("defaults all overlay flags to true", () => {
    expect(DEFAULT_HODOGRAPH_OVERLAY_VISIBILITY).toEqual({
      stormMotion: true,
      stormRelativeWind: true,
      horizontalVorticity: true,
      streamwiseCrosswise: true,
    });
  });

  it("draws C only when visibility and data are present", () => {
    const vis = { ...DEFAULT_HODOGRAPH_OVERLAY_VISIBILITY };
    expect(isStormMotionDrawn(vis, true)).toBe(true);
    expect(isStormMotionDrawn({ ...vis, stormMotion: false }, true)).toBe(
      false,
    );
    expect(isStormMotionDrawn(vis, false)).toBe(false);
  });

  it("requires visible C for effective V_sr without clearing stored intent", () => {
    const storedOn: HodographOverlayVisibility = {
      stormMotion: false,
      stormRelativeWind: true,
      horizontalVorticity: true,
      streamwiseCrosswise: true,
    };

    expect(isStormRelativeWindCheckboxDisabled(storedOn)).toBe(true);
    expect(isStormRelativeWindDrawn(storedOn, true, true)).toBe(false);

    const restored: HodographOverlayVisibility = {
      ...storedOn,
      stormMotion: true,
    };
    expect(restored.stormRelativeWind).toBe(true);
    expect(isStormRelativeWindDrawn(restored, true, true)).toBe(true);
    expect(isStormRelativeWindCheckboxDisabled(restored)).toBe(false);
  });

  it("keeps ω_h independent of C and V_sr flags", () => {
    const vis: HodographOverlayVisibility = {
      stormMotion: false,
      stormRelativeWind: false,
      horizontalVorticity: true,
      streamwiseCrosswise: true,
    };
    expect(isHorizontalVorticityDrawn(vis, true)).toBe(true);
    expect(
      isHorizontalVorticityDrawn({ ...vis, horizontalVorticity: false }, true),
    ).toBe(false);
    expect(isHorizontalVorticityDrawn(vis, false)).toBe(false);
  });

  it("requires visible ω_h for effective streamwise/crosswise without clearing stored intent", () => {
    const storedOn: HodographOverlayVisibility = {
      stormMotion: true,
      stormRelativeWind: true,
      horizontalVorticity: false,
      streamwiseCrosswise: true,
    };

    expect(isStreamwiseCrosswiseCheckboxDisabled(storedOn)).toBe(true);
    expect(isStreamwiseCrosswiseDrawn(storedOn, false, true)).toBe(false);

    const restored: HodographOverlayVisibility = {
      ...storedOn,
      horizontalVorticity: true,
    };
    expect(restored.streamwiseCrosswise).toBe(true);
    expect(isStreamwiseCrosswiseDrawn(restored, true, true)).toBe(true);
    expect(isStreamwiseCrosswiseCheckboxDisabled(restored)).toBe(false);
  });

  it("does not require C or green V_sr for streamwise/crosswise effective draw", () => {
    const vis: HodographOverlayVisibility = {
      stormMotion: false,
      stormRelativeWind: false,
      horizontalVorticity: true,
      streamwiseCrosswise: true,
    };
    expect(isStreamwiseCrosswiseDrawn(vis, true, true)).toBe(true);
  });

  it("does not feed visibility into buildViewTransform (stable viewport)", () => {
    const withData = buildViewTransform(demoPoints, [demoC]);
    const again = buildViewTransform(demoPoints, [demoC]);
    expect(again).toEqual(withData);

    const hiddenCVisibility: HodographOverlayVisibility = {
      stormMotion: false,
      stormRelativeWind: true,
      horizontalVorticity: true,
      streamwiseCrosswise: true,
    };
    expect(isStormMotionDrawn(hiddenCVisibility, true)).toBe(false);
    expect(buildViewTransform(demoPoints, [demoC])).toEqual(withData);
  });
});
