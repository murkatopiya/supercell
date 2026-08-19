/**
 * Perceptual occupancy fade for comet marks. Uses visualization age
 * (time since last reseed), not scientific history.
 */
export const COMET_FADE_IN_S = 3;
export const COMET_FADE_OUT_S = 8;

export function cometOccupancyFade(age: number, maxAge: number): number {
  if (!Number.isFinite(age) || !Number.isFinite(maxAge) || !(maxAge > 0)) {
    return 0;
  }
  const fadeIn = Math.min(1, Math.max(0, age) / COMET_FADE_IN_S);
  const remaining = maxAge - age;
  const fadeOut = Math.min(1, Math.max(0, remaining) / COMET_FADE_OUT_S);
  return Math.min(fadeIn, fadeOut);
}
