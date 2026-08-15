import type { Simulation } from "./Simulation.js";
import type { TracerSeedPosition } from "./createTracersFromSeeds.js";

/**
 * Restore particles from seed copies and zero simulation clock time.
 * Does not mutate the seeds array; does not recreate Simulation.
 */
export function resetTracersFromSeeds(
  simulation: Simulation,
  seeds: readonly TracerSeedPosition[],
): void {
  if (simulation.particles.length !== seeds.length) {
    throw new Error(
      `resetTracersFromSeeds: particle count ${simulation.particles.length} !== seed count ${seeds.length}`,
    );
  }

  for (let i = 0; i < seeds.length; i++) {
    const seed = seeds[i]!;
    const particle = simulation.particles[i]!;
    particle.position = { x: seed.x, y: seed.y, z: seed.z };
    particle.age = 0;
    particle.active = true;
  }

  simulation.clock.time = 0;
}
