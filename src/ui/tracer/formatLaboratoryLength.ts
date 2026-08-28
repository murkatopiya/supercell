/** Negate-safe zero for display. IEEE-754 -0 must not appear. */
function unsignedZero(value: number): number {
  return value === 0 ? 0 : value;
}

/**
 * Deterministic laboratory length for HUD / marks.
 * < 1000 m → metres; otherwise kilometres.
 * docs/ui/09-world-coordinate-reference.md
 */
export function formatSignedLaboratoryLength(meters: number): string {
  if (!Number.isFinite(meters)) {
    return "—";
  }
  const value = unsignedZero(meters);
  if (Math.abs(value) < 1000) {
    const rounded = unsignedZero(Math.round(value));
    if (rounded === 0) {
      return "0 m";
    }
    return `${rounded > 0 ? "+" : ""}${rounded} m`;
  }
  const kilometres = unsignedZero(value / 1000);
  if (kilometres > 0) {
    return `+${kilometres.toFixed(2)} km`;
  }
  return `${kilometres.toFixed(2)} km`;
}
