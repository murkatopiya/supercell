import type { EnvironmentalWindProfile } from "./EnvironmentalWindProfile.js";
import type { StormMotion } from "./stormRelativeWind.js";

/** Finite-layer storm-relative helicity. Units: m^2/s^2 */
export interface StormRelativeHelicity {
  srh: number;
}

export class StormRelativeHelicityError extends Error {
  readonly name = "StormRelativeHelicityError";

  constructor(message: string) {
    super(message);
  }
}

export function stormRelativeHelicityBetween(
  profile: EnvironmentalWindProfile,
  stormMotion: StormMotion,
  h0: number,
  h1: number,
): StormRelativeHelicity {
  if (!Number.isFinite(h0)) {
    throw new StormRelativeHelicityError("h0 must be finite");
  }
  if (!Number.isFinite(h1)) {
    throw new StormRelativeHelicityError("h1 must be finite");
  }
  if (!(h1 > h0)) {
    throw new StormRelativeHelicityError("h1 must be greater than h0");
  }
  if (h0 < profile.minHeight) {
    throw new StormRelativeHelicityError(
      "h0 must be >= profile.minHeight (SRH is not defined on clamped continuation)",
    );
  }
  if (h1 > profile.maxHeight) {
    throw new StormRelativeHelicityError(
      "h1 must be <= profile.maxHeight (SRH is not defined on clamped continuation)",
    );
  }

  const cEast = stormMotion.eastward;
  const cNorth = stormMotion.northward;
  const interiors = profile.interiorLevelHeightsBetween(h0, h1);
  const bounds = [h0, ...interiors, h1];

  let srh = 0;
  for (let i = 0; i < bounds.length - 1; i++) {
    const ha = bounds[i]!;
    const hb = bounds[i + 1]!;
    const wa = profile.sampleAtHeight(ha);
    const wb = profile.sampleAtHeight(hb);

    const ua = wa.eastward - cEast;
    const va = wa.northward - cNorth;
    const ub = wb.eastward - cEast;
    const vb = wb.northward - cNorth;

    // Exact Form B on a linear hodograph segment (doc 09 §8.2).
    srh += ub * va - ua * vb;
  }

  // Canonicalize IEEE signed zero (-0 → +0).
  return { srh: srh + 0 };
}
