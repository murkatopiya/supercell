import { linearRgbFromSrgbHex, type LinearRgb } from "./vertexColorSpace.js";
import type { TrajectoryTiltingValueAppearance } from "./trajectoryTiltingOverlay.js";

/**
 * Production artistic map for Analysis T1 overlay signedUnit.
 * Architecture 62: warm / exact 0 / cool. Presentation only.
 * Not the production T1 display-saturation object.
 *
 * BOUNDARY uses this same value color. Orthogonal support identity is
 * the named LineSegments object from Slice C; dash / opacity / outline
 * remain OPEN (Architecture 62 §23 item 5).
 */
const WARM = linearRgbFromSrgbHex(0xb2182b);
const COOL = linearRgbFromSrgbHex(0x2166ac);
const NEUTRAL = linearRgbFromSrgbHex(0xf7f7f7);

function mix(from: LinearRgb, to: LinearRgb, t: number): LinearRgb {
  return {
    r: from.r + (to.r - from.r) * t,
    g: from.g + (to.g - from.g) * t,
    b: from.b + (to.b - from.b) * t,
  };
}

export const ANALYSIS_T1_VALUE_APPEARANCE_V1: TrajectoryTiltingValueAppearance =
  {
    linearRgbFromSignedUnit(signedUnit: number): LinearRgb {
      if (signedUnit === 0) {
        return { r: NEUTRAL.r, g: NEUTRAL.g, b: NEUTRAL.b };
      }
      if (signedUnit >= 1) {
        return { r: WARM.r, g: WARM.g, b: WARM.b };
      }
      if (signedUnit <= -1) {
        return { r: COOL.r, g: COOL.g, b: COOL.b };
      }
      if (signedUnit > 0) {
        return mix(NEUTRAL, WARM, signedUnit);
      }
      return mix(NEUTRAL, COOL, -signedUnit);
    },
  };
