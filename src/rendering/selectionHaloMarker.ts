import * as THREE from "three";

/**
 * Selection-UI wireframe color. Not TRACER_COLORS, not the solid
 * yellow glyph override, not the white release preview.
 * docs/architecture/36-explore-selection-acquisition-identity-architecture.md
 */
export const SELECTION_HALO_COLOR = 0xffcc66;

/** Halo radius = glyph radius × this scale (world metres). */
export const SELECTION_HALO_RADIUS_SCALE = 1.6;

export function selectionHaloRadiusM(glyphRadiusM: number): number {
  return glyphRadiusM * SELECTION_HALO_RADIUS_SCALE;
}

/**
 * Single selection indication mesh. Not a tracer slot, not preview,
 * not a pick candidate. Hidden until a visible selected glyph exists.
 */
export function createSelectionHaloMarker(radiusM: number): THREE.Mesh {
  const geometry = new THREE.SphereGeometry(radiusM, 16, 12);
  const material = new THREE.MeshBasicMaterial({
    color: SELECTION_HALO_COLOR,
    wireframe: true,
    fog: false,
    transparent: true,
    opacity: 0.9,
    depthTest: true,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = "selectionHalo";
  mesh.visible = false;
  // Defense in depth: product pick only scans scientific slots.
  mesh.raycast = () => {};
  return mesh;
}

/**
 * Observe selection indication from the selected glyph's visibility
 * and world position. Does not own selectedId.
 */
export function syncSelectionHaloMarker(
  mesh: {
    visible: boolean;
    position: { set(x: number, y: number, z: number): void };
  },
  selectedGlyph: {
    readonly visible: boolean;
    readonly position: { readonly x: number; readonly y: number; readonly z: number };
  } | null,
): void {
  if (selectedGlyph === null || !selectedGlyph.visible) {
    mesh.visible = false;
    return;
  }
  mesh.visible = true;
  mesh.position.set(
    selectedGlyph.position.x,
    selectedGlyph.position.y,
    selectedGlyph.position.z,
  );
}

export function disposeSelectionHaloMarker(mesh: THREE.Mesh): void {
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
