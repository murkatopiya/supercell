import { worldPositionToAtmospheric } from "../../core/math/AtmosphericPosition.js";
import { intersectRayWithGroundReferencePlane } from "../../explore/intersectRayWithGroundReferencePlane.js";
import type { Vec3 } from "../../core/math/Vec3.js";
import { formatSignedLaboratoryLength } from "./formatLaboratoryLength.js";
import type { WorldRay } from "../../rendering/worldRayFromCameraNdc.js";
import { pointerNdcFromClientRect, type ClientRectBox } from "./pointerNdcFromClientRect.js";

export const GROUND_CURSOR_UNAVAILABLE = "—";

export interface GroundCursorHudLines {
  east: string;
  north: string;
}

/**
 * Ground-cursor HUD readout. Ray ∩ plane y = 0, then physics/00 §8.
 * Does not write seeds, selection, or simulation.
 * docs/ui/09-world-coordinate-reference.md
 */
export function groundCursorHudFromRay(
  origin: Vec3,
  direction: Vec3,
): GroundCursorHudLines {
  const hit = intersectRayWithGroundReferencePlane(origin, direction);
  if (hit === null) {
    return {
      east: GROUND_CURSOR_UNAVAILABLE,
      north: GROUND_CURSOR_UNAVAILABLE,
    };
  }
  const atmospheric = worldPositionToAtmospheric({
    x: hit.x,
    y: 0,
    z: hit.z,
  });
  return {
    east: formatSignedLaboratoryLength(atmospheric.east),
    north: formatSignedLaboratoryLength(atmospheric.north),
  };
}

export function groundCursorHudFromClientPoint(
  worldRayFromNdc: (ndcX: number, ndcY: number) => WorldRay | null,
  clientX: number,
  clientY: number,
  rect: ClientRectBox,
): GroundCursorHudLines {
  const ndc = pointerNdcFromClientRect(clientX, clientY, rect);
  if (ndc === null) {
    return {
      east: GROUND_CURSOR_UNAVAILABLE,
      north: GROUND_CURSOR_UNAVAILABLE,
    };
  }
  const ray = worldRayFromNdc(ndc.x, ndc.y);
  if (ray === null) {
    return {
      east: GROUND_CURSOR_UNAVAILABLE,
      north: GROUND_CURSOR_UNAVAILABLE,
    };
  }
  return groundCursorHudFromRay(ray.origin, ray.direction);
}
