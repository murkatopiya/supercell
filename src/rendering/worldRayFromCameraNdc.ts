import * as THREE from "three";
import type { Vec3 } from "../core/math/Vec3.js";

export interface WorldRay {
  origin: Vec3;
  direction: Vec3;
}

/**
 * Unproject a normalized-device coordinate to a world-space ray.
 * Does not pick a 3D point; the caller intersects a named datum.
 */
export function worldRayFromCameraNdc(
  camera: THREE.Camera,
  ndcX: number,
  ndcY: number,
): WorldRay | null {
  if (!Number.isFinite(ndcX) || !Number.isFinite(ndcY)) {
    return null;
  }

  camera.updateMatrixWorld();
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
  const { origin, direction } = raycaster.ray;
  if (
    !Number.isFinite(origin.x) ||
    !Number.isFinite(origin.y) ||
    !Number.isFinite(origin.z) ||
    !Number.isFinite(direction.x) ||
    !Number.isFinite(direction.y) ||
    !Number.isFinite(direction.z) ||
    (direction.x === 0 && direction.y === 0 && direction.z === 0)
  ) {
    return null;
  }

  return {
    origin: { x: origin.x + 0, y: origin.y + 0, z: origin.z + 0 },
    direction: {
      x: direction.x + 0,
      y: direction.y + 0,
      z: direction.z + 0,
    },
  };
}
