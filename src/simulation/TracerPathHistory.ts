import type { Vec3 } from "../core/math/Vec3.js";
import type { TracerAdvectionState } from "./TracerParticle.js";

function copyVec3(position: Vec3): Vec3 {
  return { x: position.x, y: position.y, z: position.z };
}

/**
 * Three-free path-history recorder.
 * Observes particles after completed Simulation.step; does not own physics.
 */
export class TracerPathHistory {
  private readonly stride: number;
  private readonly histories: Vec3[][];
  private readonly observedActive: boolean[];
  private stepsSinceCapture = 0;

  constructor(tracerCount: number, stride = 1) {
    if (!Number.isInteger(tracerCount) || tracerCount < 0) {
      throw new Error("tracerCount must be an integer >= 0");
    }
    if (!Number.isInteger(stride) || stride < 1) {
      throw new Error("stride must be a positive integer");
    }
    this.stride = stride;
    this.histories = Array.from({ length: tracerCount }, () => []);
    this.observedActive = Array.from({ length: tracerCount }, () => false);
  }

  get tracerCount(): number {
    return this.histories.length;
  }

  /**
   * Append one lane and copy the particle's current position as its
   * birth point, independent of stride. Does not recapture existing
   * lanes or reset the global stride counter.
   *
   * Inactive particles still receive that birth point once.
   * `observedActive` is set to the particle's current flag so a later
   * `recordAfterStep` does not invent a terminal transition.
   */
  appendParticle(particle: TracerAdvectionState): void {
    this.histories.push([copyVec3(particle.position)]);
    this.observedActive.push(particle.active);
  }

  /**
   * Append an ordered batch of lanes. Empty batch is a no-op.
   */
  appendParticles(particles: readonly TracerAdvectionState[]): void {
    for (const particle of particles) {
      this.appendParticle(particle);
    }
  }

  /**
   * Copy current positions as the first point of each active tracer.
   * Call after construct or clear(); does not invent samples from time.
   * Not the late-birth path — use appendParticle when the cohort grows.
   */
  captureInitial(particles: readonly TracerAdvectionState[]): void {
    this.assertParticleCount(particles);
    for (let i = 0; i < particles.length; i++) {
      const particle = particles[i]!;
      this.observedActive[i] = particle.active;
      if (!particle.active) {
        continue;
      }
      this.histories[i]!.push(copyVec3(particle.position));
    }
    this.stepsSinceCapture = 0;
  }

  /**
   * Copy current positions after one completed simulation step.
   *
   * Ordinary samples append when the step count since captureInitial
   * is a multiple of stride. A particle that was active at the previous
   * observation and is inactive now appends once (terminal accepted
   * position), including off-stride. Already-inactive particles do not
   * append. Lifecycle uses the last observed `active` flag only.
   */
  recordAfterStep(particles: readonly TracerAdvectionState[]): void {
    this.assertParticleCount(particles);
    this.stepsSinceCapture += 1;
    const onStride = this.stepsSinceCapture % this.stride === 0;
    for (let i = 0; i < particles.length; i++) {
      const particle = particles[i]!;
      const wasActive = this.observedActive[i]!;
      const isActive = particle.active;
      const becameInactive = wasActive && !isActive;
      if (becameInactive || (isActive && onStride)) {
        this.histories[i]!.push(copyVec3(particle.position));
      }
      this.observedActive[i] = isActive;
    }
  }

  /**
   * Drop all stored points and reset stride counting.
   * Lane count is unchanged. Guided Reset: clear() then captureInitial().
   */
  clear(): void {
    for (const history of this.histories) {
      history.length = 0;
    }
    this.observedActive.fill(false);
    this.stepsSinceCapture = 0;
  }

  /**
   * Remove every lane. Distinct from clear(): the cohort itself is
   * gone (Explore Clear), not merely the recorded points.
   */
  removeAllLanes(): void {
    this.histories.length = 0;
    this.observedActive.length = 0;
    this.stepsSinceCapture = 0;
  }

  /**
   * Read-only snapshot of one tracer's path. Copied points; not the
   * internal array and not particle.position aliases.
   */
  pointsFor(index: number): readonly Vec3[] {
    const history = this.histories[index];
    if (history === undefined) {
      throw new Error(
        `TracerPathHistory: tracer index ${index} out of range`,
      );
    }
    return history.map(copyVec3);
  }

  private assertParticleCount(particles: readonly TracerAdvectionState[]): void {
    if (particles.length !== this.histories.length) {
      throw new Error(
        `TracerPathHistory: particle count ${particles.length} !== tracer count ${this.histories.length}`,
      );
    }
  }
}
