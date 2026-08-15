import type { Vec3 } from "./Vec3.js";

export interface AtmosphericVelocity {
  eastward: number;
  northward: number;
  vertical: number;
}

/** Negate without producing signed zero (-0). */
function negate(value: number): number {
  return value === 0 ? 0 : -value;
}

export function atmosphericVelocityToWorld(
  velocity: AtmosphericVelocity,
): Vec3 {
  return {
    x: velocity.eastward,
    y: velocity.vertical,
    z: negate(velocity.northward),
  };
}

export function worldVelocityToAtmospheric(velocity: Vec3): AtmosphericVelocity {
  return {
    eastward: velocity.x,
    northward: negate(velocity.z),
    vertical: velocity.y,
  };
}
