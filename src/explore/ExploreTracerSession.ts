import type { Simulation } from "../simulation/Simulation.js";
import type { TracerPathHistory } from "../simulation/TracerPathHistory.js";
import type { TracerSeedPosition } from "../simulation/createTracersFromSeeds.js";
import { createTracersFromSeeds } from "../simulation/createTracersFromSeeds.js";
import { resetTracersFromSeeds } from "../simulation/resetTracersFromSeeds.js";
import { copyAtmosphericTracerSeed } from "../simulation/assertAtmosphericTracerSeed.js";

export class ExploreTracerSessionError extends Error {
  readonly name = "ExploreTracerSessionError";

  constructor(message: string) {
    super(message);
  }
}

/**
 * Headless Explore session: owns user release seeds and orchestrates
 * late birth, Reset, and Clear against Simulation + TracerPathHistory.
 *
 * Does not own renderer observe slots. Later interaction/rendering
 * slices must append or clear those slots separately.
 *
 * docs/architecture/18-explore-arbitrary-seeding.md
 */
export class ExploreTracerSession {
  private readonly ownedSeeds: TracerSeedPosition[] = [];

  constructor(
    private readonly simulation: Simulation,
    private readonly pathHistory: TracerPathHistory,
  ) {
    if (
      simulation.particles.length !== 0 ||
      pathHistory.tracerCount !== 0
    ) {
      throw new ExploreTracerSessionError(
        "ExploreTracerSession requires an empty particle cohort and zero history lanes",
      );
    }
  }

  /**
   * Copies of the ordered release ICs used by Reset.
   * Not a staggered birth schedule.
   */
  get seeds(): readonly TracerSeedPosition[] {
    return this.ownedSeeds.map(copySeed);
  }

  /**
   * Validate, own, and birth one point tracer at current clock.time.
   * Does not step, does not reset the clock, does not touch the scene.
   */
  releasePoint(seed: TracerSeedPosition): void {
    const owned = copyAtmosphericTracerSeed(seed);
    const particle = createTracersFromSeeds([owned])[0]!;
    this.simulation.addParticle(particle);
    this.pathHistory.appendParticle(particle, this.simulation.clock.time);
    this.ownedSeeds.push(owned);
    this.assertAligned();
  }

  /**
   * Replay the current Explore seed list as a simultaneous cohort at t = 0.
   * Zero seeds: clock → 0, occupancy stays empty. Does not fabricate a tracer.
   */
  reset(): void {
    resetTracersFromSeeds(this.simulation, this.ownedSeeds);
    this.pathHistory.clear();
    this.pathHistory.captureInitial(
      this.simulation.particles,
      this.simulation.clock.time,
    );
    this.assertAligned();
  }

  /**
   * Empty Explore occupancy. Clock unchanged. Does not write user
   * seeds into canonical scenario fixtures.
   * Does not clear renderer observe slots.
   */
  clear(): void {
    this.ownedSeeds.length = 0;
    this.simulation.clearParticles();
    this.pathHistory.removeAllLanes();
    this.assertAligned();
  }

  private assertAligned(): void {
    const particleCount = this.simulation.particles.length;
    const laneCount = this.pathHistory.tracerCount;
    const seedCount = this.ownedSeeds.length;
    if (particleCount !== laneCount || particleCount !== seedCount) {
      throw new ExploreTracerSessionError(
        `ExploreTracerSession: particle count ${particleCount} !== history lanes ${laneCount} !== seed count ${seedCount}`,
      );
    }
  }
}

function copySeed(seed: TracerSeedPosition): TracerSeedPosition {
  return { x: seed.x, y: seed.y, z: seed.z };
}
