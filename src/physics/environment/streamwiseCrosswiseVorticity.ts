import type { HorizontalVorticity } from "./horizontalVorticity.js";
import type { StormRelativeWind } from "./stormRelativeWind.js";

/** Flow-relative projections of horizontal vorticity. Units: 1/s */
export interface StreamwiseCrosswiseVorticity {
  omegaStreamwise: number;
  omegaCrosswise: number;
}

export class StreamwiseCrosswiseVorticityError extends Error {
  readonly name = "StreamwiseCrosswiseVorticityError";

  constructor(message: string) {
    super(message);
  }
}

export function decomposeHorizontalVorticity(
  stormRelativeWind: StormRelativeWind,
  horizontalVorticity: HorizontalVorticity,
): StreamwiseCrosswiseVorticity {
  const u = stormRelativeWind.eastward;
  const v = stormRelativeWind.northward;

  if (u === 0 && v === 0) {
    throw new StreamwiseCrosswiseVorticityError(
      "horizontal storm-relative flow is zero; streamwise/crosswise basis is undefined",
    );
  }

  const speed = Math.hypot(u, v);
  const sEast = u / speed;
  const sNorth = v / speed;
  const cEast = -v / speed;
  const cNorth = u / speed;

  const omegaEast = horizontalVorticity.omegaEastward;
  const omegaNorth = horizontalVorticity.omegaNorthward;

  return {
    omegaStreamwise: omegaEast * sEast + omegaNorth * sNorth,
    omegaCrosswise: omegaEast * cEast + omegaNorth * cNorth,
  };
}
