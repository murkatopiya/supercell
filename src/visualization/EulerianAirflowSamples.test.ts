import { describe, expect, it } from "vitest";
import { EulerIntegrator } from "../core/integrators/EulerIntegrator.js";
import type { VelocityField } from "../core/fields/VelocityField.js";
import type { Vec3 } from "../core/math/Vec3.js";
import { ConstantVelocityField } from "../physics/synthetic/ConstantVelocityField.js";
import { DEMO_EULERIAN_AIRFLOW_SAMPLES } from "../app/demoEulerianAirflowFixture.js";
import { DEMO_VISUAL_AIRFLOW_POPULATION } from "../app/demoVisualAirflowFixture.js";
import {
  EulerianAirflowSamples,
  EulerianAirflowSamplesError,
} from "./EulerianAirflowSamples.js";
import eulerianSrc from "./EulerianAirflowSamples.ts?raw";
import {
  ORIENTED_AIRFLOW_MARK_LENGTH_M,
  writeOrientedMarkEndpoints,
} from "./orientedAirflowMark.js";
import { VisualAirflowPopulation } from "./VisualAirflowPopulation.js";

class TimeDependentYField implements VelocityField {
  sample(_position: Vec3, time: number): Vec3 {
    return { x: 0, y: time, z: 0 };
  }
}

function cubeConfig() {
  return {
    count: 8,
    jitterSeed: 1,
    volume: {
      min: { x: 0, y: 0, z: 0 },
      max: { x: 8, y: 8, z: 8 },
    },
  };
}

describe("EulerianAirflowSamples", () => {
  it("creates deterministic fixed positions with no integration", () => {
    const field = new ConstantVelocityField({ x: 5, y: 0, z: 0 });
    const a = new EulerianAirflowSamples(field, cubeConfig());
    const b = new EulerianAirflowSamples(field, cubeConfig());
    const pa = new Float32Array(a.sampleCount * 3);
    const pb = new Float32Array(b.sampleCount * 3);
    a.writePositionsTo(pa);
    b.writePositionsTo(pb);
    expect(Array.from(pa)).toEqual(Array.from(pb));
    expect(a.sampleCount).toBe(8);
    expect(Array.from(pa).every(Number.isFinite)).toBe(true);

    const integrator = new EulerIntegrator();
    const population = new VisualAirflowPopulation(field, integrator, {
      ...cubeConfig(),
      maxAge: 50,
    });
    const popPositions = new Float32Array(8 * 3);
    population.writePositionsTo(popPositions);
    expect(Array.from(pa)).toEqual(Array.from(popPositions));

    population.step(1, 0);
    population.writePositionsTo(popPositions);
    a.writePositionsTo(pa);
    expect(Array.from(pa)).not.toEqual(Array.from(popPositions));
    expect(Array.from(pa)).toEqual(Array.from(pb));
  });

  it("samples the same canonical field instance at supplied laboratory time", () => {
    const field = new TimeDependentYField();
    const other = new ConstantVelocityField({ x: 0, y: 1, z: 0 });
    const samples = new EulerianAirflowSamples(field, cubeConfig());
    expect(samples.samplesField(field)).toBe(true);
    expect(samples.samplesField(other)).toBe(false);
    const directions = new Float32Array(samples.sampleCount * 3);
    samples.writeUnitDirectionsTo(3, directions);
    expect(directions[1]).toBeCloseTo(1);
    samples.writeUnitDirectionsTo(-3, directions);
    expect(directions[1]).toBeCloseTo(-1);
  });

  it("keeps spatial sampling density fixed and handles zero speed", () => {
    const field = new ConstantVelocityField({ x: 0, y: 0, z: 0 });
    const samples = new EulerianAirflowSamples(field, cubeConfig());
    const before = new Float32Array(samples.sampleCount * 3);
    const after = new Float32Array(samples.sampleCount * 3);
    samples.writePositionsTo(before);
    const directions = new Float32Array(samples.sampleCount * 3);
    samples.writeUnitDirectionsTo(10, directions);
    samples.writePositionsTo(after);
    expect(Array.from(after)).toEqual(Array.from(before));
    expect(Array.from(directions).every((value) => value === 0)).toBe(true);
    const ends = new Float32Array(6);
    writeOrientedMarkEndpoints(
      before.subarray(0, 3),
      directions.subarray(0, 3),
      1,
      ORIENTED_AIRFLOW_MARK_LENGTH_M,
      ends,
    );
    expect(ends.every(Number.isFinite)).toBe(true);
    expect(ends[0]).toBe(ends[3]);
  });

  it("uses the DEMO fair-comparison fixture, not VisualAirflowPopulation", () => {
    expect(DEMO_EULERIAN_AIRFLOW_SAMPLES.count).toBe(
      DEMO_VISUAL_AIRFLOW_POPULATION.count,
    );
    expect(DEMO_EULERIAN_AIRFLOW_SAMPLES.volume).toEqual(
      DEMO_VISUAL_AIRFLOW_POPULATION.volume,
    );
    expect(DEMO_EULERIAN_AIRFLOW_SAMPLES.jitterSeed).toBe(
      DEMO_VISUAL_AIRFLOW_POPULATION.jitterSeed,
    );
    expect(eulerianSrc).not.toMatch(/new VisualAirflowPopulation/);
    expect(eulerianSrc).not.toMatch(/\.step\(/);
    expect(eulerianSrc).not.toMatch(/maxAge/);
    expect(eulerianSrc).not.toMatch(/shouldRetire/);
    expect(eulerianSrc).not.toMatch(/readonly age/);
    expect(eulerianSrc).not.toMatch(/tracerId/);
    expect(() => new EulerianAirflowSamples(
      new ConstantVelocityField({ x: 0, y: 0, z: 0 }),
      { ...cubeConfig(), count: -1 },
    )).toThrow(EulerianAirflowSamplesError);
  });
});
