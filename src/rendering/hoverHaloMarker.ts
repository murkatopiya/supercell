import * as THREE from "three";
import { syncSelectionHaloMarker } from "./selectionHaloMarker.js";

/**
 * Hover indication. Weaker than the selection halo; not occupancy color,
 * not operand highlight, not the retired yellow glyph override.
 * docs/ui/10-tracer-interaction-affordance.md
 */
export const HOVER_HALO_COLOR = 0xd7e3f0;

/** Smaller than SELECTION_HALO_RADIUS_SCALE (1.6). */
export const HOVER_HALO_RADIUS_SCALE = 1.28;

export const HOVER_HALO_OPACITY = 0.4;

export function hoverHaloRadiusM(glyphRadiusM: number): number {
  return glyphRadiusM * HOVER_HALO_RADIUS_SCALE;
}

export function createHoverHaloMarker(radiusM: number): THREE.Mesh {
  const geometry = new THREE.SphereGeometry(radiusM, 16, 12);
  const material = new THREE.MeshBasicMaterial({
    color: HOVER_HALO_COLOR,
    wireframe: true,
    fog: false,
    transparent: true,
    opacity: HOVER_HALO_OPACITY,
    depthTest: true,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = "hoverHalo";
  mesh.visible = false;
  mesh.raycast = () => {};
  return mesh;
}

export const syncHoverHaloMarker = syncSelectionHaloMarker;

/**
 * Drop a hovered occupancy slot once its glyph is gone or hidden.
 * Does not pick and does not write selection.
 */
export function persistHoveredSlotIndex(
  hoveredSlotIndex: number | null,
  slotExistsAndVisible: boolean,
): number | null {
  if (hoveredSlotIndex === null || !slotExistsAndVisible) {
    return null;
  }
  return hoveredSlotIndex;
}

/**
 * selected > hovered > normal.
 * Same occupancy as selected hides the weaker hover shell.
 */
export function resolveHoverHaloObservation(input: {
  hoveredSlotIndex: number | null;
  selectedSlotIndex: number | null;
  hoveredGlyph:
    | {
        readonly visible: boolean;
        readonly position: {
          readonly x: number;
          readonly y: number;
          readonly z: number;
        };
      }
    | undefined;
}): {
  visible: boolean;
  position: {
    readonly x: number;
    readonly y: number;
    readonly z: number;
  };
} | null {
  if (
    input.hoveredSlotIndex === null ||
    input.hoveredSlotIndex === input.selectedSlotIndex
  ) {
    return null;
  }
  const glyph = input.hoveredGlyph;
  if (glyph === undefined || !glyph.visible) {
    return null;
  }
  return { visible: true, position: glyph.position };
}

export function disposeHoverHaloMarker(mesh: THREE.Mesh): void {
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
