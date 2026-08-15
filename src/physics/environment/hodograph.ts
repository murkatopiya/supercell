import type { EnvironmentalWindProfile } from "./EnvironmentalWindProfile.js";

/** Ground-relative hodograph point in 2D velocity space. height is metadata. */
export interface HodographPoint {
  height: number;
  eastward: number;
  northward: number;
}

/** Adjacent knot segment of the piecewise-linear hodograph path. */
export interface HodographSegment {
  lower: HodographPoint;
  upper: HodographPoint;
}

export function hodographPoints(
  profile: EnvironmentalWindProfile,
): HodographPoint[] {
  return profile.levelHeights().map((height) => {
    const velocity = profile.sampleAtHeight(height);
    return {
      height,
      eastward: velocity.eastward,
      northward: velocity.northward,
    };
  });
}

export function hodographSegments(
  profile: EnvironmentalWindProfile,
): HodographSegment[] {
  const points = hodographPoints(profile);
  const segments: HodographSegment[] = [];

  for (let i = 0; i < points.length - 1; i++) {
    const lower = points[i]!;
    const upper = points[i + 1]!;
    segments.push({
      lower: {
        height: lower.height,
        eastward: lower.eastward,
        northward: lower.northward,
      },
      upper: {
        height: upper.height,
        eastward: upper.eastward,
        northward: upper.northward,
      },
    });
  }

  return segments;
}

export function hodographPointAtHeight(
  profile: EnvironmentalWindProfile,
  height: number,
): HodographPoint {
  const velocity = profile.sampleAtHeight(height);
  return {
    height,
    eastward: velocity.eastward,
    northward: velocity.northward,
  };
}
