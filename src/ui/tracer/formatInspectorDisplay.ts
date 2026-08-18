/**
 * Display-only rounding for the tracer inspector.
 * Does not mutate the underlying TracerInspection payload.
 */

function formatFixed(value: number, digits: number): string {
  if (!Number.isFinite(value)) {
    return "—";
  }
  const rounded = Number.parseFloat(value.toFixed(digits));
  return (rounded === 0 ? 0 : rounded).toFixed(digits);
}

/** Position / altitude, metres, 1 decimal. */
export function formatInspectorMeters(value: number): string {
  return formatFixed(value, 1);
}

/** Velocity / speed, m/s, 2 decimals. */
export function formatInspectorVelocity(value: number): string {
  return formatFixed(value, 2);
}

/** Simulation time / tracer age, seconds, 2 decimals. */
export function formatInspectorSeconds(value: number): string {
  return formatFixed(value, 2);
}

export function formatInspectorVector(
  vector: { x: number; y: number; z: number },
  formatComponent: (value: number) => string,
): string {
  return `${formatComponent(vector.x)}, ${formatComponent(vector.y)}, ${formatComponent(vector.z)}`;
}
