/**
 * Display mapping from sampled operand speed to highlight salience.
 * Visualization fixture, not a physics threshold or “updraft exists iff”.
 *
 * DEMO occupant |V_updraft| at t=0: max ≈ 29 m/s, p50 ≈ 6.5 m/s.
 * The linear reference stays 30 so the sampled peak nearly saturates
 * and mid-range stays below half. It is not imported from ScenarioConfig
 * and must not be treated as a model constant.
 */
export const UPDRAFT_HIGHLIGHT_DISPLAY_REFERENCE_MPS = 30;

export type UpdraftHighlightPrototypeId = "hue-a" | "hue-b" | "hue-c";

/**
 * Dev/workbench high-chroma candidates. Not a product palette and not
 * a meteorological or tracer color set. One selected at a time.
 */
export const UPDRAFT_HIGHLIGHT_PROTOTYPE_HUES = {
  "hue-a": 0xff2ec8,
  "hue-b": 0x00f0ff,
  "hue-c": 0xe4ff1a,
} as const satisfies Record<UpdraftHighlightPrototypeId, number>;

/**
 * Rejected-branch Background used a single prototype hue.
 * Live workbench does not construct that overlay.
 */
export const UPDRAFT_HIGHLIGHT_HUE =
  UPDRAFT_HIGHLIGHT_PROTOTYPE_HUES["hue-a"];

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
