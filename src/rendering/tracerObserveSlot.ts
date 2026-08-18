import * as THREE from "three";
import { createTrailLine, disposeTrailLine } from "./trailGeometry.js";

export const TRACER_COLORS = [0xe74c3c, 0x3498db, 0x2ecc71] as const;

/** Distinct from unselected glyph colors and the white preview wireframe. */
export const SELECTED_TRACER_GLYPH_COLOR = 0xffcc33;

export interface TracerObserveSlot {
  readonly mesh: THREE.Mesh;
  readonly trail: THREE.Line | undefined;
}

/**
 * Glyph + optional trail line for one tracer index.
 * Does not attach to a scene; the caller owns scene membership.
 * Shared sphere geometry is not owned by the slot.
 */
export function createTracerObserveSlot(
  index: number,
  sharedGeometry: THREE.SphereGeometry,
  options: { trails: boolean },
): TracerObserveSlot {
  const color = TRACER_COLORS[index % TRACER_COLORS.length]!;
  const material = new THREE.MeshBasicMaterial({ color });
  const mesh = new THREE.Mesh(sharedGeometry, material);
  const trail = options.trails ? createTrailLine(color) : undefined;
  return { mesh, trail };
}

/**
 * Dispose slot-owned material and trail resources.
 * Does not dispose shared glyph geometry.
 */
export function disposeTracerObserveSlot(slot: TracerObserveSlot): void {
  const material = slot.mesh.material;
  if (Array.isArray(material)) {
    for (const item of material) {
      item.dispose();
    }
  } else {
    material.dispose();
  }
  if (slot.trail !== undefined) {
    disposeTrailLine(slot.trail);
  }
}

/**
 * Renderer observation of selection. Restores the occupancy color
 * when unselected. Does not store product selectedId.
 */
export function syncSelectedTracerGlyph(
  mesh: THREE.Mesh,
  slotIndex: number,
  selected: boolean,
): void {
  const material = mesh.material;
  if (Array.isArray(material) || !(material instanceof THREE.MeshBasicMaterial)) {
    return;
  }
  material.color.setHex(
    selected
      ? SELECTED_TRACER_GLYPH_COLOR
      : TRACER_COLORS[slotIndex % TRACER_COLORS.length]!,
  );
}
