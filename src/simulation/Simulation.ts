import type { VelocityField } from "../core/fields/VelocityField.js";
import type { Integrator } from "../core/integrators/Integrator.js";
import { SimulationClock } from "./SimulationClock.js";
import type {
  TracerAdvectionState,
  TracerParticle,
} from "./TracerParticle.js";
import type { AtmosphericTracerDomainResult } from "./AtmosphericTracerDomain.js";
import type { Vec3 } from "../core/math/Vec3.js";

export interface SimulationTracerDomain {
  applyAcceptedStep(
    from: Vec3,
    proposed: Vec3,
  ): AtmosphericTracerDomainResult;
}

export interface SimulationOptions {
  clock?: SimulationClock;
  tracerDomain?: SimulationTracerDomain;
}

const FIRST_TRACER_ID = 1;

/**
 * Assign a monotonic runtime identity. Not atmospheric state.
 * docs/architecture/19-shared-tracer-inspector.md
 */
function assignTracerId(
  particle: TracerAdvectionState,
  tracerId: number,
): TracerParticle {
  (particle as unknown as { tracerId: number }).tracerId = tracerId;
  return particle as TracerParticle;
}

export class Simulation {
  readonly clock: SimulationClock;
  readonly particles: TracerParticle[];
  private readonly tracerDomain: SimulationTracerDomain | undefined;
  private nextTracerId = FIRST_TRACER_ID;

  constructor(
    private readonly velocityField: VelocityField,
    private readonly integrator: Integrator,
    particles: TracerAdvectionState[],
    options: SimulationOptions = {},
  ) {
    this.clock = options.clock ?? new SimulationClock();
    this.particles = particles as TracerParticle[];
    this.tracerDomain = options.tracerDomain;
    for (const particle of this.particles) {
      assignTracerId(particle, this.nextTracerId);
      this.nextTracerId += 1;
    }
  }

  /**
   * Append one existing particle. Does not clone, does not change the
   * clock, timestep, integrator, velocity field, domain, or other
   * particles. Eligible for the next step. Assigns a new tracerId.
   */
  addParticle(particle: TracerAdvectionState): void {
    this.particles.push(assignTracerId(particle, this.nextTracerId));
    this.nextTracerId += 1;
  }

  /**
   * Append an ordered batch. Empty batch is a no-op.
   */
  addParticles(particles: readonly TracerAdvectionState[]): void {
    for (const particle of particles) {
      this.addParticle(particle);
    }
  }

  /**
   * Drop every live particle. Clock, field, integrator, and domain
   * are unchanged. Does not touch histories or renderer slots.
   * Restarts the identity counter for this Simulation's next occupancy.
   */
  clearParticles(): void {
    this.particles.length = 0;
    this.nextTracerId = FIRST_TRACER_ID;
  }

  /**
   * Drop the last occupancy particle. Clock, field, remaining particles,
   * and the identity counter are unchanged. Empty occupancy is a no-op.
   * Does not reuse the removed tracerId on the next addParticle.
   */
  removeLastParticle(): TracerParticle | undefined {
    return this.particles.pop();
  }

  step(dt: number): void {
    const time = this.clock.time;

    for (const particle of this.particles) {
      if (!particle.active) {
        continue;
      }

      const from = particle.position;
      const proposed = this.integrator.step(
        from,
        time,
        dt,
        this.velocityField,
      );

      if (this.tracerDomain !== undefined) {
        const result = this.tracerDomain.applyAcceptedStep(from, proposed);
        particle.position = result.position;
        particle.active = result.active;
      } else {
        particle.position = proposed;
      }

      particle.age += dt;
    }

    this.clock.advance(dt);
  }
}
