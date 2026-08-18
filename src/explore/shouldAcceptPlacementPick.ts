import {
  DEFAULT_STATIONARY_CLICK_MOVEMENT_PX,
  shouldAcceptStationaryClick,
} from "../interaction/shouldAcceptStationaryClick.js";

export const DEFAULT_PLACEMENT_CLICK_MOVEMENT_PX =
  DEFAULT_STATIONARY_CLICK_MOVEMENT_PX;

/**
 * Minimum OrbitControls coexistence: inspect-orbit stays enabled.
 * A placement pick is only a stationary click while the tool is on.
 * docs/architecture/18-explore-arbitrary-seeding.md
 */
export function shouldAcceptPlacementPick(options: {
  placementEnabled: boolean;
  pointerMovementPx: number;
  maxClickMovementPx?: number;
}): boolean {
  if (!options.placementEnabled) {
    return false;
  }
  return shouldAcceptStationaryClick({
    pointerMovementPx: options.pointerMovementPx,
    maxClickMovementPx: options.maxClickMovementPx,
  });
}

export function pointerMovementPx(
  down: { x: number; y: number },
  up: { x: number; y: number },
): number {
  return Math.hypot(up.x - down.x, up.y - down.y);
}
