import type { EnvironmentalWindProfile } from "./EnvironmentalWindProfile.js";

/** Finite-layer vertical shear of horizontal wind. Units: (m/s)/m = 1/s */
export interface HorizontalWindShear {
  shearEastward: number;
  shearNorthward: number;
}

export class VerticalWindShearError extends Error {
  readonly name = "VerticalWindShearError";

  constructor(message: string) {
    super(message);
  }
}

export function verticalWindShearBetween(
  profile: EnvironmentalWindProfile,
  h0: number,
  h1: number,
): HorizontalWindShear {
  if (!Number.isFinite(h0)) {
    throw new VerticalWindShearError("h0 must be finite");
  }
  if (!Number.isFinite(h1)) {
    throw new VerticalWindShearError("h1 must be finite");
  }
  if (!(h1 > h0)) {
    throw new VerticalWindShearError("h1 must be greater than h0");
  }
  if (h0 < profile.minHeight) {
    throw new VerticalWindShearError(
      "h0 must be >= profile.minHeight (shear is not defined on clamped continuation)",
    );
  }
  if (h1 > profile.maxHeight) {
    throw new VerticalWindShearError(
      "h1 must be <= profile.maxHeight (shear is not defined on clamped continuation)",
    );
  }

  const v0 = profile.sampleAtHeight(h0);
  const v1 = profile.sampleAtHeight(h1);
  const deltaH = h1 - h0;

  return {
    shearEastward: (v1.eastward - v0.eastward) / deltaH,
    shearNorthward: (v1.northward - v0.northward) / deltaH,
  };
}
