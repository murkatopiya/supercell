export const DEFAULT_STATIONARY_CLICK_MOVEMENT_PX = 5;

/**
 * Shared OrbitControls coexistence: a pick is only a stationary click.
 * Used by tracer glyph selection and Explore placement.
 * docs/architecture/19-shared-tracer-inspector.md
 */
export function shouldAcceptStationaryClick(options: {
  pointerMovementPx: number;
  maxClickMovementPx?: number;
}): boolean {
  const max =
    options.maxClickMovementPx ?? DEFAULT_STATIONARY_CLICK_MOVEMENT_PX;
  if (!Number.isFinite(options.pointerMovementPx) || !Number.isFinite(max)) {
    return false;
  }
  if (!(max >= 0) || options.pointerMovementPx < 0) {
    return false;
  }
  return options.pointerMovementPx <= max;
}
