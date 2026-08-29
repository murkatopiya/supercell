import type { TrajectoryTiltingColorScale } from "./trajectoryTiltingRenderEncoding.js";

/**
 * Production Analysis T1 display saturation. Architecture 62 CAL V1.
 *
 * Display calibration only. Does not clip, replace, or classify
 * scientific T1. No near-zero band. Does not encode appearance.
 */
export const T1_COLOR_SCALE_V1_VERSION = "T1_COLOR_SCALE_V1";

/**
 * Frozen V1 saturation magnitude. Units: s⁻².
 * Display domain is the symmetric interval [-sat, +sat].
 */
export const T1_COLOR_SCALE_V1_SATURATION = 6.100e-5;

function signedUnitFromTiltingTendency(tiltingTendency: number): number {
  if (tiltingTendency === 0) {
    return 0;
  }
  const unit = tiltingTendency / T1_COLOR_SCALE_V1_SATURATION;
  if (unit > 1) {
    return 1;
  }
  if (unit < -1) {
    return -1;
  }
  return unit;
}

/**
 * Versioned TrajectoryTiltingColorScale for Analysis T1.
 * Independent of trajectory population, storm selection, and
 * runtime path occupancy. Architecture 62 §13.
 */
export const T1_COLOR_SCALE_V1: TrajectoryTiltingColorScale = {
  version: T1_COLOR_SCALE_V1_VERSION,
  signedUnitFromTiltingTendency,
};
