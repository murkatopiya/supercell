import type { HorizontalWindShear } from "./verticalWindShear.js";

/** Finite-layer horizontal vorticity from vertical shear. Units: 1/s */
export interface HorizontalVorticity {
  omegaEastward: number;
  omegaNorthward: number;
}

export function horizontalVorticityFromShear(
  shear: HorizontalWindShear,
): HorizontalVorticity {
  return {
    // 0 - x avoids IEEE signed zero from unary minus on +0
    omegaEastward: 0 - shear.shearNorthward,
    omegaNorthward: shear.shearEastward,
  };
}
