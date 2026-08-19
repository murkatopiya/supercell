import { describe, expect, it } from "vitest";
import { EulerIntegrator } from "../core/integrators/EulerIntegrator.js";
import type { VelocityField } from "../core/fields/VelocityField.js";
import type { Vec3 } from "../core/math/Vec3.js";
import { ConstantVelocityField } from "../physics/synthetic/ConstantVelocityField.js";
import { writeAdvectedOrientedAirflow } from "./observeAdvectedOrientedAirflow.js";
import observeSrc from "./observeAdvectedOrientedAirflow.ts?raw";
import {
  ORIENTED_AIRFLOW_MARK_LENGTH_M,
  writeOrientedMarkEndpoints,
} from "./orientedAirflowMark.js";
import {
  VisualAirflowPopulation,
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
    count: 4,
    maxAge: 100,
    jitterSeed: 1,
    volume: {
      min: { x: 0, y: 0, z: 0 },
      max: { x: 10, y: 10, z: 10 },
    },
    ...overrides,
  };
}

describe("writeAdvectedOrientedAirflow", () => {
  it("uses the same V_total instance and occupant positions", () => {
    const field = new RecordingField({ x: 2, y: 0, z: 0 });
    const other = new ConstantVelocityField({ x: 2, y: 0, z: 0 });
    const population = new VisualAirflowPopulation(
      field,
      new EulerIntegrator(),
      cubeConfig(),
    );
    const positions = new Float32Array(population.occupantCount * 3);
    const directions = new Float32Array(population.occupantCount * 3);
    writeAdvectedOrientedAirflow(population, field, 7, positions, directions);
    const expected = new Float32Array(population.occupantCount * 3);
    population.writePositionsTo(expected);
    expect(Array.from(positions)).toEqual(Array.from(expected));
    expect(field.samples).toHaveLength(population.occupantCount);
    expect(field.samples.every((sample) => sample.time === 7)).toBe(true);
    expect(population.samplesField(field)).toBe(true);
    expect(() =>
      writeAdvectedOrientedAirflow(population, other, 0, positions, directions),
    ).toThrow(/population field instance/);
  });

  it("keeps direction sign and fixed length after advection", () => {
    const field = new ConstantVelocityField({ x: -3, y: 0, z: 0 });
    const population = new VisualAirflowPopulation(
      field,
      new EulerIntegrator(),
      cubeConfig({ count: 1 }),
    );
    population.step(1, 0);
    const positions = new Float32Array(3);
    const directions = new Float32Array(3);
    writeAdvectedOrientedAirflow(population, field, 1, positions, directions);
    expect(directions[0]).toBeCloseTo(-1);
    const ends = new Float32Array(6);
    writeOrientedMarkEndpoints(
      positions,
      directions,
      1,
      ORIENTED_AIRFLOW_MARK_LENGTH_M,
      ends,
    );
    expect(ends[3]! - ends[0]!).toBeCloseTo(-ORIENTED_AIRFLOW_MARK_LENGTH_M);
  });

  it("keeps orientation data without stepping (Pause)", () => {
    const field = new ConstantVelocityField({ x: 0, y: 8, z: 0 });
    const population = new VisualAirflowPopulation(
      field,
      new EulerIntegrator(),
      cubeConfig({ count: 1 }),
    );
    const before = population.occupants()[0]!.position;
    const positions = new Float32Array(3);
    const directions = new Float32Array(3);
    writeAdvectedOrientedAirflow(population, field, 0, positions, directions);
    expect(population.occupants()[0]!.position).toEqual(before);
    expect(directions[1]).toBeCloseTo(1);
    writeAdvectedOrientedAirflow(population, field, 0, positions, directions);
    expect(directions[1]).toBeCloseTo(1);
  });

  it("follows laboratory time on a time-dependent field", () => {
    const field = new TimeDependentZField();
    const population = new VisualAirflowPopulation(
      field,
      new EulerIntegrator(),
      cubeConfig({ count: 1, maxAge: 1000 }),
    );
    const positions = new Float32Array(3);
    const directions = new Float32Array(3);
    writeAdvectedOrientedAirflow(population, field, 4, positions, directions);
    expect(directions[2]).toBeCloseTo(1);
    writeAdvectedOrientedAirflow(population, field, -4, positions, directions);
    expect(directions[2]).toBeCloseTo(-1);
  });

  it("does not couple to tracerId, Inspector, or path history", () => {
    expect(observeSrc).not.toMatch(/tracerId/);
    expect(observeSrc).not.toMatch(/Inspector/);
    expect(observeSrc).not.toMatch(/TracerPathHistory/);
    expect(observeSrc).not.toMatch(/selectedId/);
  });
});
