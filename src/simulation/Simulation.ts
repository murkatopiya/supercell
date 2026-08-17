import type { VelocityField } from "../core/fields/VelocityField.js";
import type { Integrator } from "../core/integrators/Integrator.js";
import { SimulationClock } from "./SimulationClock.js";
import type { TracerParticle } from "./TracerParticle.js";
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

export class Simulation {
  readonly clock: SimulationClock;
  readonly particles: TracerParticle[];
  private readonly tracerDomain: SimulationTracerDomain | undefined;

  constructor(
    private readonly velocityField: VelocityField,
    private readonly integrator: Integrator,
    particles: TracerParticle[],
    options: SimulationOptions = {},
  ) {
    this.clock = options.clock ?? new SimulationClock();
    this.particles = particles;
    this.tracerDomain = options.tracerDomain;
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
