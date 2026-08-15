import type { TracerParticle } from "./TracerParticle.js";

/** World-space seed position. Units: m */
export interface TracerSeedPosition {
  x: number;
  y: number;
  z: number;
}

/**
 * Build tracer particles from seed positions.
 * Copies coordinates so later seed/config mutation does not move live particles.
 */
export function createTracersFromSeeds(
  seeds: readonly TracerSeedPosition[],
): TracerParticle[] {
  return seeds.map((seed) => ({
    position: { x: seed.x, y: seed.y, z: seed.z },
    age: 0,
    active: true,
  }));
}
