export class SimulationClock {
  time = 0;

  advance(dt: number): void {
    this.time += dt;
  }
}
