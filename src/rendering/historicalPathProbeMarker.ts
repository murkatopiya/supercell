import * as THREE from "three";

/**
 * Historical path-sample indication. Not occupancy color, not the
 * live selection halo, not the release preview.
 * docs/architecture/52-historical-path-probe-architecture.md
 */
export const HISTORICAL_PROBE_MARKER_COLOR = 0x00d4ff;

/** Marker radius = glyph radius × this scale (world metres). */
export const HISTORICAL_PROBE_RADIUS_SCALE = 0.55;

export function historicalProbeMarkerRadiusM(glyphRadiusM: number): number {
  return glyphRadiusM * HISTORICAL_PROBE_RADIUS_SCALE;
}

/**
 * Single path-sample marker. Not a tracer slot, not a pick candidate.
 * Hidden until a resolved historical sample exists.
 */
export function createHistoricalPathProbeMarker(radiusM: number): THREE.Mesh {
  const geometry = new THREE.SphereGeometry(radiusM, 12, 8);
  const material = new THREE.MeshBasicMaterial({
    color: HISTORICAL_PROBE_MARKER_COLOR,
    fog: false,
    transparent: true,
    opacity: 0.95,
    depthTest: true,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = "historicalPathProbe";
  mesh.visible = false;
  mesh.raycast = () => {};
  return mesh;
}

/**
 * Observe the inspected historical sample position. Null hides the marker.
 * Does not own probe identity and does not write Simulation.
 */
export function syncHistoricalPathProbeMarker(
  mesh: {
    visible: boolean;
    position: { set(x: number, y: number, z: number): void };
  },
  position: { readonly x: number; readonly y: number; readonly z: number } | null,
): void {
  if (position === null) {
    mesh.visible = false;
    return;
  }
  mesh.visible = true;
  mesh.position.set(position.x, position.y, position.z);
}

export function disposeHistoricalPathProbeMarker(mesh: THREE.Mesh): void {
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
