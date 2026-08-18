import * as THREE from "three";
import type { WorldRay } from "./worldRayFromCameraNdc.js";

/**
 * Nearest visible tracer-slot mesh hit. Preview is excluded by not
 * being a slot. Hidden meshes (`visible === false`) are skipped.
 * Does not mutate simulation or selection.
 */
export function pickVisibleTracerSlotIndex(
  slots: readonly { readonly mesh: THREE.Object3D }[],
  ray: WorldRay,
): number | null {
  const visible: THREE.Object3D[] = [];
  const indexByMesh = new Map<THREE.Object3D, number>();
  for (let i = 0; i < slots.length; i++) {
    const mesh = slots[i]!.mesh;
    if (!mesh.visible) {
      continue;
    }
    mesh.updateMatrixWorld(true);
    visible.push(mesh);
    indexByMesh.set(mesh, i);
  }
  if (visible.length === 0) {
    return null;
  }

  const direction = new THREE.Vector3(
    ray.direction.x,
    ray.direction.y,
    ray.direction.z,
  );
  if (direction.lengthSq() === 0) {
    return null;
  }
  direction.normalize();

  const raycaster = new THREE.Raycaster();
  raycaster.ray.origin.set(ray.origin.x, ray.origin.y, ray.origin.z);
  raycaster.ray.direction.copy(direction);

  const hits = raycaster.intersectObjects(visible, false);
  if (hits.length === 0) {
    return null;
  }
  return indexByMesh.get(hits[0]!.object) ?? null;
}
