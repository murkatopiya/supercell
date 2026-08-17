export const DEFAULT_PLACEMENT_CLICK_MOVEMENT_PX = 5;

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
  const max =
    options.maxClickMovementPx ?? DEFAULT_PLACEMENT_CLICK_MOVEMENT_PX;
  if (!Number.isFinite(options.pointerMovementPx) || !Number.isFinite(max)) {
    return false;
  }
  if (!(max >= 0) || options.pointerMovementPx < 0) {
    return false;
  }
  return options.pointerMovementPx <= max;
}

export function pointerMovementPx(
  down: { x: number; y: number },
  up: { x: number; y: number },
): number {
  return Math.hypot(up.x - down.x, up.y - down.y);
}
