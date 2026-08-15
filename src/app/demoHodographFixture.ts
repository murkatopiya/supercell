import { createEnvironmentalWindProfile } from "../scenario/createEnvironmentalWindProfile.js";
import { DEMO_SCENARIO } from "../scenario/DEMO_SCENARIO.js";
import { hodographPoints } from "../physics/environment/hodograph.js";
import type { HodographPoint } from "../physics/environment/hodograph.js";
import { horizontalVorticityFromShear } from "../physics/environment/horizontalVorticity.js";
import { stormRelativeWind } from "../physics/environment/stormRelativeWind.js";
import { decomposeHorizontalVorticity } from "../physics/environment/streamwiseCrosswiseVorticity.js";
import { verticalWindShearBetween } from "../physics/environment/verticalWindShear.js";
import type {
  HorizontalVorticityLayerOverlay,
  StreamwiseCrosswiseVorticityOverlay,
} from "../ui/hodograph/hodographViewTransform.js";

/**
 * Hodograph demo composition over DEMO_SCENARIO.
 *
 * Hand expectations for layer [0, 1000] with C = (10, 0):
 *   shear = (-0.01, +0.01)
 *   ω_h   = (-0.01, -0.01) → screen down-left
 *   V_sr(0) = (+5, +5); V_sr(1000) = (-5, +15)
 *   V_sr_avg = (0, +10) → ŝ north, ĉ west
 *   ω_s = -0.01 → south → screen DOWN
 *   ω_c = +0.01 → west → screen LEFT
 *   ω_s ↓ + ω_c ← = ω_h ↙
 */
export function createDemoEnvironmentalWindProfile() {
  return createEnvironmentalWindProfile(DEMO_SCENARIO);
}

export function createDemoHodographPoints(): HodographPoint[] {
  return hodographPoints(createDemoEnvironmentalWindProfile());
}

export const DEMO_SELECTED_HEIGHT = 0;

/** Finite-layer ω_h for [0, 1000]. Physics computed in composition. */
export function createDemoVorticityLayer(): HorizontalVorticityLayerOverlay {
  const profile = createDemoEnvironmentalWindProfile();
  const shear = verticalWindShearBetween(profile, 0, 1000);
  const vorticity = horizontalVorticityFromShear(shear);
  return {
    h0: 0,
    h1: 1000,
    vorticity,
  };
}

/**
 * Streamwise/crosswise overlay for [0, 1000].
 * Basis is V_sr_avg of endpoints — not selected-knot V_sr.
 */
export function createDemoStreamwiseCrosswiseOverlay():
  | StreamwiseCrosswiseVorticityOverlay
  | undefined {
  const profile = createDemoEnvironmentalWindProfile();
  const vorticityLayer = createDemoVorticityLayer();
  const stormMotion = DEMO_SCENARIO.stormMotion;
  const v0 = stormRelativeWind(profile.sampleAtHeight(0), stormMotion);
  const v1 = stormRelativeWind(profile.sampleAtHeight(1000), stormMotion);
  const basisStormRelativeWind = {
    eastward: (v0.eastward + v1.eastward) / 2,
    northward: (v0.northward + v1.northward) / 2,
    vertical: 0,
  };

  if (
    !(
      Math.hypot(
        basisStormRelativeWind.eastward,
        basisStormRelativeWind.northward,
      ) > 0
    )
  ) {
    return undefined;
  }

  const decomposition = decomposeHorizontalVorticity(
    basisStormRelativeWind,
    vorticityLayer.vorticity,
  );

  return {
    h0: 0,
    h1: 1000,
    basisStormRelativeWind,
    decomposition,
  };
}
