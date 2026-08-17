import type { TracerAdvectionState } from "./TracerParticle.js";

/** World-space seed position. Units: m */
export interface TracerSeedPosition {
  x: number;
  y: number;
  z: number;
}

/**
 * Build tracer advection state from seed positions.
 * Copies coordinates so later seed/config mutation does not move live particles.
 * Does not assign runtime identity — Simulation assigns it at birth.
 */
export function createTracersFromSeeds(
  seeds: readonly TracerSeedPosition[],
): TracerAdvectionState[] {
  return seeds.map((seed) => ({
    position: { x: seed.x, y: seed.y, z: seed.z },
    age: 0,
    active: true,
  }));
}
