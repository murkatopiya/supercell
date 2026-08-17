import * as THREE from "three";
import type { TracerSeedPosition } from "../simulation/createTracersFromSeeds.js";

/** Distinct from tracer glyph colors. Not product language. */
export const RELEASE_PREVIEW_COLOR = 0xffffff;

/**
 * Pending-release preview mesh. Not a tracer slot, trail, or
 * keepInactiveGlyphs terminal. Hidden until a pending seed exists.
 */
export function createReleasePreviewMarker(radiusM: number): THREE.Mesh {
  const geometry = new THREE.SphereGeometry(radiusM, 12, 8);
  const material = new THREE.MeshBasicMaterial({
    color: RELEASE_PREVIEW_COLOR,
    wireframe: true,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = "exploreReleasePreview";
  mesh.visible = false;
  return mesh;
}

export function syncReleasePreviewMarker(
  mesh: {
    visible: boolean;
    position: { set(x: number, y: number, z: number): void };
  },
  pendingSeed: TracerSeedPosition | null,
): void {
  if (pendingSeed === null) {
    mesh.visible = false;
    return;
  }
  mesh.visible = true;
  mesh.position.set(pendingSeed.x, pendingSeed.y, pendingSeed.z);
}

export function disposeReleasePreviewMarker(mesh: THREE.Mesh): void {
  mesh.geometry.dispose();
  const material = mesh.material;
  if (Array.isArray(material)) {
    for (const item of material) {
      item.dispose();
    }
  } else {
    material.dispose();
  }
}
