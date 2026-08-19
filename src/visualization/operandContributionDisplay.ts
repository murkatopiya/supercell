import type { VelocityField } from "../core/fields/VelocityField.js";

/**
 * Storm operands the Explore workbench may tint. Same DEMO part keys
 * as Inspector decomposition, minus environmental advection.
 * Visualization diagnostic set, not a permanent anatomy schema.
 */
export const STORM_OPERAND_HIGHLIGHT_KEYS = [
  "updraft",
  "rotation",
  "lowerInflow",
  "upperOutflow",
  "downdraft",
  "nearGroundOutflow",
] as const;

export type StormOperandHighlightKey =
  (typeof STORM_OPERAND_HIGHLIGHT_KEYS)[number];

/**
 * Per-operand display reference for
 * clamp(|V_operand| / R, 0, 1). Visualization fixture only.
 *
 * Not a physics constant, not an existence threshold, and not a
 * license to compare operands quantitatively by color. Inspector
 * remains the local magnitude answer.
 *
 * Unified R = 30 m/s (the previous updraft fixture) leaves
 * lowerInflow and near-ground outflow below useful salience on the
 * DEMO occupant volume (lowerInflow occupant max ≈ 3.0 m/s → 0.10;
 * NG occupant max ≈ 7.8 m/s, one occupant ≥ 0.15 of 30). Each
 * selected operand therefore has its own R near the configured
 * DEMO peak so spatial structure can be read. Occupant-volume max
 * can undersample a localized core, so R tracks the locus peak
 * rather than a single random seed of 256 occupants.
 *
 * Sampled t=0, DEMO visual volume, not imported from ScenarioConfig:
 *
 *   updraft            occupant max ≈ 28.9; locus 30 at (0, 4000, 0)
 *   rotation           occupant max ≈ 12.1; locus ≈ 12.1 at r = σ
 *   lowerInflow        occupant max ≈ 3.03; locus ≈ 3.03 at r = σ
 *   upperOutflow       occupant max ≈ 6.04; locus ≈ 6.07 at r = σ
 *   downdraft          occupant max ≈ 14.5; locus 20 at occupant axis
 *   nearGroundOutflow  occupant max ≈ 7.83; locus ≈ 9.81 at r = σ
 */
export const STORM_OPERAND_HIGHLIGHT_DISPLAY_REFERENCE_MPS = {
  updraft: 30,
  rotation: 12,
  lowerInflow: 3,
  upperOutflow: 6,
  downdraft: 20,
  nearGroundOutflow: 10,
} as const satisfies Record<StormOperandHighlightKey, number>;

/**
 * One prototype hue for every selected storm operand.
 * Hue A/B/C comparison is complete; exact product palette is deferred.
 * Not a meteorological or tracer color.
 */
export const OPERAND_HIGHLIGHT_PROTOTYPE_HUE = 0xff2ec8;

/**
 * Rejected-branch Background used this prototype hue.
 * Live workbench does not construct that overlay.
 */
export const UPDRAFT_HIGHLIGHT_HUE = OPERAND_HIGHLIGHT_PROTOTYPE_HUE;

export function isStormOperandHighlightKey(
  value: string,
): value is StormOperandHighlightKey {
  return (STORM_OPERAND_HIGHLIGHT_KEYS as readonly string[]).includes(value);
}

export function displayReferenceMpsForOperand(
  key: StormOperandHighlightKey,
): number {
  return STORM_OPERAND_HIGHLIGHT_DISPLAY_REFERENCE_MPS[key];
}

/**
 * SAME named VelocityField instance already held by canonical
 * decomposition / Inspector parts. Does not construct a field.
 */
export function resolveStormOperandHighlightField(
  parts: ReadonlyArray<{ key: string; field: VelocityField }> | undefined,
  key: StormOperandHighlightKey,
): VelocityField | null {
  const part = parts?.find((item) => item.key === key);
  return part === undefined ? null : part.field;
}

export function contributionDisplayStrength(
  magnitude: number,
  referenceMps: number,
): number {
  if (!Number.isFinite(magnitude) || !(magnitude > 0)) {
    return 0;
  }
  if (!Number.isFinite(referenceMps) || !(referenceMps > 0)) {
    return 0;
  }
  const scaled = magnitude / referenceMps;
  if (scaled >= 1) {
    return 1;
  }
  return scaled;
}
