import type { Vec3 } from "../core/math/Vec3.js";

/**
 * World-space Follow-as-framing translation.
 * Preserves camera-to-target offset. Does not rebuild orbit angles.
 * docs/architecture/34-selected-tracer-follow-camera-architecture.md
 */
export function translateCameraFollowTarget(
  cameraPosition: { x: number; y: number; z: number },
  currentTarget: { x: number; y: number; z: number },
  nextTarget: Vec3,
): void {
  const dx = nextTarget.x - currentTarget.x;
  const dy = nextTarget.y - currentTarget.y;
  const dz = nextTarget.z - currentTarget.z;
  if (dx === 0 && dy === 0 && dz === 0) {
    return;
  }
  cameraPosition.x += dx;
  cameraPosition.y += dy;
  cameraPosition.z += dz;
  currentTarget.x = nextTarget.x + 0;
  currentTarget.y = nextTarget.y + 0;
  currentTarget.z = nextTarget.z + 0;
}

/** Scene-owned copy. Caller may mutate the source after this returns. */
export function copyFollowPoint(position: Vec3): { x: number; y: number; z: number } {
  return {
    x: position.x + 0,
    y: position.y + 0,
    z: position.z + 0,
  };
}
