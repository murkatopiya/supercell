import { describe, expect, it } from "vitest";
import { EulerIntegrator } from "../core/integrators/EulerIntegrator.js";
import { ConstantVelocityField } from "../physics/synthetic/ConstantVelocityField.js";
import { Simulation } from "../simulation/Simulation.js";
import { ATMOSPHERIC_TRACER_DOMAIN } from "../simulation/AtmosphericTracerDomain.js";
import { TracerPathHistory } from "../simulation/TracerPathHistory.js";
import type { VelocityField } from "../core/fields/VelocityField.js";
import type { Vec3 } from "../core/math/Vec3.js";
import populationSrc from "./VisualAirflowPopulation.ts?raw";
import {
  VisualAirflowPopulation,
  VisualAirflowPopulationError,
  type VisualAirflowPopulationConfig,
} from "./VisualAirflowPopulation.js";

class RecordingField implements VelocityField {
  readonly samples: { position: Vec3; time: number }[] = [];
  constructor(private readonly velocity: Vec3) {}
  sample(position: Vec3, time: number): Vec3 {
    this.samples.push({
      position: { x: position.x, y: position.y, z: position.z },
      time,
    });
    return this.velocity;
  }
}

class TimeDependentZField implements VelocityField {
  sample(_position: Vec3, time: number): Vec3 {
    return { x: 0, y: 0, z: time };
  }
}

function cubeConfig(
  overrides: Partial<VisualAirflowPopulationConfig> = {},
): VisualAirflowPopulationConfig {
  return {
    count: 8,
    maxAge: 10,
    jitterSeed: 1,
    volume: {
      min: { x: 0, y: 0, z: 0 },
      max: { x: 2, y: 2, z: 2 },
    },
    ...overrides,
  };
}

function createPopulation(
  field: VelocityField = new ConstantVelocityField({ x: 0, y: 0, z: 0 }),
  config: VisualAirflowPopulationConfig = cubeConfig(),
  integrator = new EulerIntegrator(),
) {
  return new VisualAirflowPopulation(field, integrator, config);
}

describe("VisualAirflowPopulation construction and seeding", () => {
  it("creates exactly the configured occupant budget", () => {
    expect(createPopulation().occupantCount).toBe(8);
    expect(createPopulation().occupants()).toHaveLength(8);
    expect(createPopulation(undefined, cubeConfig({ count: 0 })).occupantCount).toBe(
      0,
    );
  });

  it("places finite positions inside the seed volume with y >= 0", () => {
    const volume = cubeConfig().volume;
    for (const occupant of createPopulation().occupants()) {
      expect(Number.isFinite(occupant.position.x)).toBe(true);
      expect(Number.isFinite(occupant.position.y)).toBe(true);
      expect(Number.isFinite(occupant.position.z)).toBe(true);
      expect(occupant.position.x).toBeGreaterThanOrEqual(volume.min.x);
      expect(occupant.position.x).toBeLessThanOrEqual(volume.max.x);
      expect(occupant.position.y).toBeGreaterThanOrEqual(volume.min.y);
      expect(occupant.position.y).toBeLessThanOrEqual(volume.max.y);
      expect(occupant.position.z).toBeGreaterThanOrEqual(volume.min.z);
      expect(occupant.position.z).toBeLessThanOrEqual(volume.max.z);
      expect(occupant.position.y).toBeGreaterThanOrEqual(0);
    }
  });

  it("is reproducible for the same jitterSeed", () => {
    const a = createPopulation().occupants();
    const b = createPopulation().occupants();
    expect(b).toEqual(a);
  });

  it("changes jitter when jitterSeed changes", () => {
    const a = createPopulation(undefined, cubeConfig({ jitterSeed: 1 })).occupants();
    const b = createPopulation(undefined, cubeConfig({ jitterSeed: 2 })).occupants();
    expect(b).not.toEqual(a);
  });

  it("covers each 2×2×2 lattice cell once for count 8", () => {
    const cells = new Set<string>();
    for (const occupant of createPopulation().occupants()) {
      const ix = occupant.position.x < 1 ? 0 : 1;
      const iy = occupant.position.y < 1 ? 0 : 1;
      const iz = occupant.position.z < 1 ? 0 : 1;
      cells.add(`${ix},${iy},${iz}`);
    }
    expect(cells.size).toBe(8);
  });

  it("spreads occupants across the volume instead of clustering at one point", () => {
    const occupants = createPopulation(
      undefined,
      cubeConfig({
        count: 27,
        volume: {
          min: { x: 0, y: 0, z: 0 },
          max: { x: 9, y: 9, z: 9 },
        },
      }),
    ).occupants();
    const xs = occupants.map((o) => o.position.x);
    const ys = occupants.map((o) => o.position.y);
    const zs = occupants.map((o) => o.position.z);
    expect(Math.max(...xs) - Math.min(...xs)).toBeGreaterThan(6);
    expect(Math.max(...ys) - Math.min(...ys)).toBeGreaterThan(6);
    expect(Math.max(...zs) - Math.min(...zs)).toBeGreaterThan(6);
  });

  it("does not back-advect staggered initial ages", () => {
    const occupants = createPopulation(
      new ConstantVelocityField({ x: 10, y: 0, z: 0 }),
      cubeConfig({ count: 4, maxAge: 8 }),
    ).occupants();
    expect(occupants.map((occupant) => occupant.age)).toEqual([0, 2, 4, 6]);
    for (const occupant of occupants) {
      expect(occupant.position.x).toBeGreaterThanOrEqual(0);
      expect(occupant.position.x).toBeLessThanOrEqual(2);
    }
  });

  it("rejects invalid count, maxAge, below-ground volume, and inverted extents", () => {
    const field = new ConstantVelocityField({ x: 0, y: 0, z: 0 });
    const integrator = new EulerIntegrator();
    expect(
      () => new VisualAirflowPopulation(field, integrator, cubeConfig({ count: 1.5 })),
    ).toThrow(VisualAirflowPopulationError);
    expect(
      () => new VisualAirflowPopulation(field, integrator, cubeConfig({ maxAge: 0 })),
    ).toThrow(VisualAirflowPopulationError);
    expect(
      () =>
        new VisualAirflowPopulation(
          field,
          integrator,
          cubeConfig({
            volume: { min: { x: 0, y: -1, z: 0 }, max: { x: 1, y: 1, z: 1 } },
          }),
        ),
    ).toThrow(/volume.min.y must be >= 0/);
    expect(
      () =>
        new VisualAirflowPopulation(
          field,
          integrator,
          cubeConfig({
            volume: { min: { x: 2, y: 0, z: 0 }, max: { x: 1, y: 1, z: 1 } },
          }),
        ),
    ).toThrow(VisualAirflowPopulationError);
  });

  it("does not silently clamp a below-ground seed volume", () => {
    expect(() =>
      createPopulation(undefined, {
        ...cubeConfig(),
        volume: { min: { x: 0, y: -10, z: 0 }, max: { x: 1, y: 10, z: 1 } },
      }),
    ).toThrow(VisualAirflowPopulationError);
    expect(populationSrc).not.toMatch(/clamp/i);
  });
});

describe("VisualAirflowPopulation advection", () => {
  it("samples the supplied VelocityField instance at laboratory time", () => {
    const field = new RecordingField({ x: 0, y: 0, z: 0 });
    const population = createPopulation(field, cubeConfig({ count: 3 }));
    const before = population.occupants();
    population.step(0.1, 4);
    expect(field.samples).toHaveLength(3);
    expect(field.samples[0]!.time).toBe(4);
    expect(field.samples[0]!.position).toEqual(before[0]!.position);
    expect(field.samples[1]!.position).toEqual(before[1]!.position);
    expect(field.samples[2]!.position).toEqual(before[2]!.position);
  });

  it("matches EulerIntegrator displacement on a constant field", () => {
    const velocity = { x: 10, y: -2, z: 3 };
    const field = new ConstantVelocityField(velocity);
    const integrator = new EulerIntegrator();
    const population = createPopulation(
      field,
      cubeConfig({
        count: 1,
        maxAge: 100,
        volume: {
          min: { x: 0, y: 0, z: 0 },
          max: { x: 1000, y: 1000, z: 1000 },
        },
      }),
      integrator,
    );
    const start = population.occupants()[0]!.position;
    const expected = integrator.step(start, 1.5, 0.25, field);
    population.step(0.25, 1.5);
    expect(population.occupants()[0]!.position).toEqual(expected);
    expect(start).toEqual({
      x: expected.x - velocity.x * 0.25,
      y: expected.y - velocity.y * 0.25,
      z: expected.z - velocity.z * 0.25,
    });
  });

  it("does not compose DEMO physics or rebuild a velocity field", () => {
    expect(populationSrc).not.toMatch(/composeDemo/);
    expect(populationSrc).not.toMatch(/DEMO_SCENARIO/);
    expect(populationSrc).not.toMatch(/environmentAdvection/);
    expect(populationSrc).not.toMatch(/nearGroundOutflow/);
    expect(populationSrc).not.toMatch(/CompositeVelocityField/);
  });
});

describe("VisualAirflowPopulation lifecycle", () => {
  it("advances age by dt until maxAge recycles the slot", () => {
    const population = createPopulation(
      new ConstantVelocityField({ x: 0, y: 0, z: 0 }),
      cubeConfig({ count: 1, maxAge: 1 }),
    );
    population.step(0.4, 0);
    expect(population.occupants()[0]!.age).toBeCloseTo(0.4);
    population.step(0.4, 0.4);
    expect(population.occupants()[0]!.age).toBeCloseTo(0.8);
    population.step(0.4, 0.8);
    const after = population.occupants()[0]!;
    expect(after.age).toBe(0);
    expect(after.position.x).toBeGreaterThanOrEqual(0);
    expect(after.position.x).toBeLessThanOrEqual(2);
    expect(after.position.y).toBeGreaterThanOrEqual(0);
  });

  it("recycles when a step leaves the retirement volume", () => {
    const field = new ConstantVelocityField({ x: 100, y: 0, z: 0 });
    const population = createPopulation(
      field,
      cubeConfig({ count: 1, maxAge: 1000 }),
    );
    const start = population.occupants()[0]!.position;
    population.step(1, 0);
    const recycled = population.occupants()[0]!;
    expect(recycled.age).toBe(0);
    expect(recycled.position.x).toBeGreaterThanOrEqual(0);
    expect(recycled.position.x).toBeLessThanOrEqual(2);
    expect(recycled.position.x).not.toBeCloseTo(start.x + 100);
  });

  it("recycles below y = 0 as visualization policy, not scientific deactivation", () => {
    const field = new ConstantVelocityField({ x: 0, y: -50, z: 0 });
    const population = createPopulation(
      field,
      cubeConfig({
        count: 1,
        maxAge: 1000,
        volume: { min: { x: 0, y: 0, z: 0 }, max: { x: 2, y: 40, z: 2 } },
      }),
    );
    population.step(1, 0);
    const occupant = population.occupants()[0]!;
    expect(occupant.age).toBe(0);
    expect(occupant.position.y).toBeGreaterThanOrEqual(0);
  });

  it("keeps occupant count and slot storage constant across many recycles", () => {
    const population = createPopulation(
      new ConstantVelocityField({ x: 0, y: -80, z: 0 }),
      cubeConfig({ count: 5, maxAge: 0.3 }),
    );
    for (let i = 0; i < 40; i++) {
      population.step(0.2, i * 0.2);
    }
    expect(population.occupantCount).toBe(5);
    expect(population.occupants()).toHaveLength(5);
  });

  it("resets age on recycle and does not invent tracerId", () => {
    const population = createPopulation(
      new ConstantVelocityField({ x: 0, y: 0, z: 0 }),
      cubeConfig({ count: 1, maxAge: 0.2 }),
    );
    population.step(0.2, 0);
    const occupant = population.occupants()[0]!;
    expect(occupant.age).toBe(0);
    expect("tracerId" in occupant).toBe(false);
    expect((occupant as { tracerId?: number }).tracerId).toBeUndefined();
    expect(Object.keys(occupant).sort()).toEqual(["age", "position"]);
  });
});

describe("VisualAirflowPopulation independence", () => {
  it("does not import scientific identity, selection, Inspector, or path history", () => {
    expect(populationSrc).not.toMatch(/from ["'][^"']*TracerSelection/);
    expect(populationSrc).not.toMatch(/from ["'][^"']*TracerInspection/);
    expect(populationSrc).not.toMatch(/from ["'][^"']*TracerInspectorPanel/);
    expect(populationSrc).not.toMatch(/from ["'][^"']*TracerPathHistory/);
    expect(populationSrc).not.toMatch(/from ["'][^"']*TracerParticle/);
    expect(populationSrc).not.toMatch(/from ["'][^"']*AtmosphericTracerDomain/);
    expect(populationSrc).not.toMatch(/readonly tracerId/);
  });

  it("does not mutate scientific Simulation particles or their ground lifecycle", () => {
    const field = new ConstantVelocityField({ x: 0, y: -10, z: 0 });
    const particle = {
      position: { x: 0, y: 5, z: 0 },
      age: 0,
      active: true,
    };
    const simulation = new Simulation(field, new EulerIntegrator(), [particle], {
      tracerDomain: ATMOSPHERIC_TRACER_DOMAIN,
    });
    const history = new TracerPathHistory(1);
    history.captureInitial(simulation.particles);
    const population = createPopulation(
      field,
      cubeConfig({
        count: 2,
        maxAge: 100,
        volume: { min: { x: 0, y: 0, z: 0 }, max: { x: 2, y: 20, z: 2 } },
      }),
    );
    population.step(1, 0);
    expect(particle.active).toBe(true);
    expect(particle.position).toEqual({ x: 0, y: 5, z: 0 });
    expect(particle.age).toBe(0);
    expect(simulation.particles).toHaveLength(1);
    expect(simulation.particles[0]).toBe(particle);
    expect(history.tracerCount).toBe(1);
    simulation.step(1);
    expect(particle.active).toBe(false);
    expect(particle.position.y).toBe(0);
  });
});

describe("VisualAirflowPopulation mutation and time", () => {
  it("does not follow later mutation of the supplied volume config", () => {
    const min = { x: 0, y: 0, z: 0 };
    const max = { x: 2, y: 2, z: 2 };
    const config = cubeConfig({ volume: { min, max } });
    const population = createPopulation(undefined, config);
    min.x = 50;
    max.x = 60;
    for (const occupant of population.occupants()) {
      expect(occupant.position.x).toBeGreaterThanOrEqual(0);
      expect(occupant.position.x).toBeLessThanOrEqual(2);
    }
  });

  it("does not let occupant snapshot mutation rewrite slots", () => {
    const population = createPopulation();
    const snapshot = population.occupants();
    const original = { ...snapshot[0]!.position };
    snapshot[0]!.position.x = 99;
    snapshot[0]!.position.y = 99;
    expect(population.occupants()[0]!.position).toEqual(original);
  });

  it("advects with supplied laboratory time on a time-dependent field", () => {
    const field = new TimeDependentZField();
    const integrator = new EulerIntegrator();
    const population = createPopulation(
      field,
      cubeConfig({
        count: 1,
        maxAge: 100,
        volume: {
          min: { x: 0, y: 0, z: 0 },
          max: { x: 1000, y: 1000, z: 1000 },
        },
      }),
      integrator,
    );
    const start = population.occupants()[0]!.position;
    const expected = integrator.step(start, 4, 0.5, field);
    population.step(0.5, 4);
    expect(population.occupants()[0]!.position.z).toBeCloseTo(expected.z);
    expect(population.occupants()[0]!.position.z).toBeCloseTo(start.z + 2);
  });

  it("rejects non-finite or non-positive dt", () => {
    const population = createPopulation();
    expect(() => population.step(0, 0)).toThrow(VisualAirflowPopulationError);
    expect(() => population.step(Number.NaN, 0)).toThrow(
      VisualAirflowPopulationError,
    );
    expect(() => population.step(0.1, Number.POSITIVE_INFINITY)).toThrow(
      VisualAirflowPopulationError,
    );
  });
});

describe("VisualAirflowPopulation reset and observation", () => {
  it("reset restores deterministic initial positions and ages without replacing the field", () => {
    const field = new ConstantVelocityField({ x: 10, y: 0, z: 0 });
    const integrator = new EulerIntegrator();
    const population = createPopulation(field, cubeConfig({ count: 4 }), integrator);
    const initial = population.occupants();
    population.step(0.5, 0);
    expect(population.occupants()).not.toEqual(initial);

    population.reset();
    expect(population.occupants()).toEqual(initial);
    expect(population.samplesField(field)).toBe(true);
    expect(population.usesIntegrator(integrator)).toBe(true);
    expect(population.occupantCount).toBe(4);
  });

  it("samplesField is instance identity, not an equal rebuilt field", () => {
    const field = new ConstantVelocityField({ x: 1, y: 0, z: 0 });
    const population = createPopulation(field);
    expect(population.samplesField(field)).toBe(true);
    expect(
      population.samplesField(new ConstantVelocityField({ x: 1, y: 0, z: 0 })),
    ).toBe(false);
  });

  it("writePositionsTo fills a caller buffer without exposing slots", () => {
    const population = createPopulation(undefined, cubeConfig({ count: 2 }));
    const occupants = population.occupants();
    const buffer = new Float32Array(6);
    population.writePositionsTo(buffer);
    expect(buffer[0]).toBeCloseTo(occupants[0]!.position.x, 5);
    expect(buffer[1]).toBeCloseTo(occupants[0]!.position.y, 5);
    expect(buffer[2]).toBeCloseTo(occupants[0]!.position.z, 5);
    expect(buffer[3]).toBeCloseTo(occupants[1]!.position.x, 5);
    expect(buffer[4]).toBeCloseTo(occupants[1]!.position.y, 5);
    expect(buffer[5]).toBeCloseTo(occupants[1]!.position.z, 5);
    buffer[0] = 99;
    expect(population.occupants()[0]!.position.x).not.toBe(99);
    expect(() => population.writePositionsTo(new Float32Array(5))).toThrow(
      VisualAirflowPopulationError,
    );
  });
});
