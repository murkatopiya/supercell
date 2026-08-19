/**
 * Display mapping from sampled operand speed to highlight salience.
 * Visualization fixture, not a physics threshold or “updraft exists iff”.
 *
 * DEMO VerticalEnvelopeUpdraftField peak is 30 m/s; this reference is
 * chosen so that mapping saturates near that peak. It is not imported
 * from ScenarioConfig and must not be treated as a model constant.
 */
export const UPDRAFT_HIGHLIGHT_DISPLAY_REFERENCE_MPS = 30;

/** Prototype hue. Not a meteorological palette and not a tracer color. */
export const UPDRAFT_HIGHLIGHT_HUE = 0x4fd2c2;

export function contributionDisplayStrength(magnitude: number): number {
  if (!Number.isFinite(magnitude) || !(magnitude > 0)) {
    return 0;
  }
  const scaled = magnitude / UPDRAFT_HIGHLIGHT_DISPLAY_REFERENCE_MPS;
  if (scaled >= 1) {
    return 1;
  }
  return scaled;
}
