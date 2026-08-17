import type { Vec3 } from "../core/math/Vec3.js";

export interface GroundReferencePick {
  x: number;
  z: number;
}

/**
 * Unique forward intersection of a ray with the world ground-reference
 * plane y = 0. Not terrain and not a grid clip.
 * docs/architecture/18-explore-arbitrary-seeding.md
 */
export function intersectRayWithGroundReferencePlane(
  origin: Vec3,
  direction: Vec3,
): GroundReferencePick | null {
  if (
    !isFiniteVec3(origin) ||
    !isFiniteVec3(direction) ||
    direction.y === 0
  ) {
    return null;
  }

  const t = -origin.y / direction.y;
  if (!Number.isFinite(t) || t < 0) {
    return null;
  }

  const x = origin.x + t * direction.x;
  const z = origin.z + t * direction.z;
  if (!Number.isFinite(x) || !Number.isFinite(z)) {
    return null;
  }

  return { x: x + 0, z: z + 0 };
}

function isFiniteVec3(value: Vec3): boolean {
  return (
    Number.isFinite(value.x) &&
    Number.isFinite(value.y) &&
    Number.isFinite(value.z)
  );
}
