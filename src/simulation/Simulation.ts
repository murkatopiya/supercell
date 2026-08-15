import type { VelocityField } from "../core/fields/VelocityField.js";
import type { Integrator } from "../core/integrators/Integrator.js";
import { SimulationClock } from "./SimulationClock.js";
import type { TracerParticle } from "./TracerParticle.js";

export class Simulation {
  readonly clock: SimulationClock;
  readonly particles: TracerParticle[];

  constructor(
    private readonly velocityField: VelocityField,
    private readonly integrator: Integrator,
    particles: TracerParticle[],
    clock: SimulationClock = new SimulationClock(),
  ) {
    this.clock = clock;
    this.particles = particles;
  }

  step(dt: number): void {
    const time = this.clock.time;

    for (const particle of this.particles) {
      if (!particle.active) {
        continue;
      }

      particle.position = this.integrator.step(
        particle.position,
        time,
        dt,
        this.velocityField,
      );
      particle.age += dt;
    }

    this.clock.advance(dt);
  }
}
