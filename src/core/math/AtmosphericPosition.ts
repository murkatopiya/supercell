import type { Vec3 } from "./Vec3.js";

/**
 * Laboratory position in atmospheric axes.
 * docs/physics/00-coordinate-system.md §8
 */
export interface AtmosphericPosition {
  east: number;
  north: number;
  altitude: number;
}

/** Negate without producing signed zero (-0). */
function negate(value: number): number {
  return value === 0 ? 0 : -value;
}

export function atmosphericPositionToWorld(
  position: AtmosphericPosition,
): Vec3 {
  return {
    x: position.east,
    y: position.altitude,
    z: negate(position.north),
  };
}

export function worldPositionToAtmospheric(position: Vec3): AtmosphericPosition {
  return {
    east: position.x,
    north: negate(position.z),
    altitude: position.y,
  };
}
