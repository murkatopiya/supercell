import type { AtmosphericVelocity } from "../../core/math/AtmosphericVelocity.js";

/** Horizontal storm translation. Units: m/s */
export interface StormMotion {
  eastward: number;
  northward: number;
}

/** Storm-relative wind. Units: m/s */
export interface StormRelativeWind {
  eastward: number;
  northward: number;
  vertical: number;
}

export function stormRelativeWind(
  environmentWind: AtmosphericVelocity,
  stormMotion: StormMotion,
): StormRelativeWind {
  return {
    eastward: environmentWind.eastward - stormMotion.eastward,
    northward: environmentWind.northward - stormMotion.northward,
    vertical: environmentWind.vertical,
  };
}
