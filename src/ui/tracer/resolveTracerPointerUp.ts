import type { Vec3 } from "../../core/math/Vec3.js";
import { shouldAcceptStationaryClick } from "../../interaction/shouldAcceptStationaryClick.js";
import type { WorldRay } from "../../rendering/worldRayFromCameraNdc.js";

export type TracerPointerUpResult =
  | { action: "select"; slotIndex: number }
  | { action: "inspect-path"; slotIndex: number; historyIndex: number }
  | {
      action: "placement";
      origin: Vec3;
      direction: Vec3;
      pointerMovementPx: number;
    }
  | { action: "ignore" };

/**
 * Stationary left-click policy: glyph hit wins over path sample,
 * path sample wins over Explore placement.
 * Orbit-scale movement selects nothing and places nothing.
 */
export function resolveTracerPointerUp(input: {
  pointerMovementPx: number;
  hitSlotIndex: number | null;
  hitPathSample?: { slotIndex: number; historyIndex: number } | null;
  placementAvailable: boolean;
  ray: WorldRay | null;
}): TracerPointerUpResult {
  if (!shouldAcceptStationaryClick({ pointerMovementPx: input.pointerMovementPx })) {
    return { action: "ignore" };
  }
  if (input.ray === null) {
    return { action: "ignore" };
  }
  if (input.hitSlotIndex !== null) {
    return { action: "select", slotIndex: input.hitSlotIndex };
  }
  if (input.hitPathSample !== undefined && input.hitPathSample !== null) {
    return {
      action: "inspect-path",
      slotIndex: input.hitPathSample.slotIndex,
      historyIndex: input.hitPathSample.historyIndex,
    };
  }
  if (input.placementAvailable) {
    return {
      action: "placement",
      origin: input.ray.origin,
      direction: input.ray.direction,
      pointerMovementPx: input.pointerMovementPx,
    };
  }
  return { action: "ignore" };
}

/**
 * Occupancy layout → stable identity. Index is not the selection key.
 */
export function tracerIdForSlot(
  particles: readonly { readonly tracerId: number }[],
  slotIndex: number,
): number | undefined {
  return particles[slotIndex]?.tracerId;
}

/**
 * Highlight mapping: selected tracerId → current occupancy index.
 */
export function occupancyIndexForTracerId(
  particles: readonly { readonly tracerId: number }[],
  tracerId: number | null,
): number | null {
  if (tracerId === null) {
    return null;
  }
  for (let i = 0; i < particles.length; i++) {
    if (particles[i]!.tracerId === tracerId) {
      return i;
    }
  }
  return null;
}
