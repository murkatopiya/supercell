import { describe, expect, it } from "vitest";
import type { VelocityField } from "../core/fields/VelocityField.js";
import type { Vec3 } from "../core/math/Vec3.js";
import { ConstantVelocityField } from "../physics/synthetic/ConstantVelocityField.js";
import {
  ORIENTED_AIRFLOW_MARK_LENGTH_M,
  unitDirectionOrZero,
  writeOrientedMarkEndpoints,
  writeUnitDirectionsFromField,
  ZERO_AIRFLOW_SPEED_MPS,
} from "./orientedAirflowMark.js";
import orientedSrc from "./orientedAirflowMark.ts?raw";

class TimeDependentXField implements VelocityField {
  sample(_position: Vec3, time: number): Vec3 {
    return { x: time, y: 0, z: 0 };
  }
}

describe("orientedAirflowMark policy", () => {
  it("normalizes direction and preserves sign", () => {
    const plus = unitDirectionOrZero({ x: 10, y: 0, z: 0 });
    const minus = unitDirectionOrZero({ x: -10, y: 0, z: 0 });
    expect(plus.x).toBeCloseTo(1);
    expect(minus.x).toBeCloseTo(-1);
    expect(plus.y).toBe(0);
    expect(minus.y).toBe(0);
  });

  it("collapses zero and non-finite speed to a stable zero direction", () => {
    expect(unitDirectionOrZero({ x: 0, y: 0, z: 0 })).toEqual({
      x: 0,
      y: 0,
      z: 0,
    });
    expect(
      unitDirectionOrZero({ x: ZERO_AIRFLOW_SPEED_MPS * 2, y: 0, z: 0 }).x,
    ).toBeGreaterThan(0);
    expect(
      unitDirectionOrZero({ x: ZERO_AIRFLOW_SPEED_MPS, y: 0, z: 0 }),
    ).toEqual({ x: 0, y: 0, z: 0 });
    expect(unitDirectionOrZero({ x: Number.NaN, y: 0, z: 0 })).toEqual({
      x: 0,
      y: 0,
      z: 0,
    });
  });

  it("keeps mark length independent of speed magnitude", () => {
    const positions = new Float32Array([0, 0, 0]);
    const slow = new Float32Array(3);
    const fast = new Float32Array(3);
    writeUnitDirectionsFromField(
      new ConstantVelocityField({ x: 1, y: 0, z: 0 }),
      positions,
      1,
      0,
      slow,
    );
    writeUnitDirectionsFromField(
      new ConstantVelocityField({ x: 100, y: 0, z: 0 }),
      positions,
      1,
      0,
      fast,
    );
    const slowEnds = new Float32Array(6);
    const fastEnds = new Float32Array(6);
    writeOrientedMarkEndpoints(positions, slow, 1, ORIENTED_AIRFLOW_MARK_LENGTH_M, slowEnds);
    writeOrientedMarkEndpoints(positions, fast, 1, ORIENTED_AIRFLOW_MARK_LENGTH_M, fastEnds);
    expect(Array.from(slowEnds)).toEqual(Array.from(fastEnds));
    const length = Math.hypot(
      slowEnds[3]! - slowEnds[0]!,
      slowEnds[4]! - slowEnds[1]!,
      slowEnds[5]! - slowEnds[2]!,
    );
    expect(length).toBeCloseTo(ORIENTED_AIRFLOW_MARK_LENGTH_M);
  });

  it("puts the head in the velocity direction and the tail opposite", () => {
    const positions = new Float32Array([5, 1, -2]);
    const directions = new Float32Array(3);
    writeUnitDirectionsFromField(
      new ConstantVelocityField({ x: 0, y: -4, z: 0 }),
      positions,
      1,
      0,
      directions,
    );
    const ends = new Float32Array(6);
    writeOrientedMarkEndpoints(
      positions,
      directions,
      1,
      ORIENTED_AIRFLOW_MARK_LENGTH_M,
      ends,
    );
    expect(ends[4]! - ends[1]!).toBeLessThan(0);
    expect(ends[4]).toBeCloseTo(1 - ORIENTED_AIRFLOW_MARK_LENGTH_M / 2);
  });

  it("collapses zero-speed marks to the sample position without NaN", () => {
    const positions = new Float32Array([3, 4, 5]);
    const directions = new Float32Array(3);
    writeUnitDirectionsFromField(
      new ConstantVelocityField({ x: 0, y: 0, z: 0 }),
      positions,
      1,
      0,
      directions,
    );
    const ends = new Float32Array(6);
    writeOrientedMarkEndpoints(
      positions,
      directions,
      1,
      ORIENTED_AIRFLOW_MARK_LENGTH_M,
      ends,
    );
    expect(Array.from(ends)).toEqual([3, 4, 5, 3, 4, 5]);
    expect(ends.every(Number.isFinite)).toBe(true);
  });

  it("samples a time-dependent field at the supplied laboratory time", () => {
    const positions = new Float32Array([0, 0, 0]);
    const atTwo = new Float32Array(3);
    const atNeg = new Float32Array(3);
    const field = new TimeDependentXField();
    writeUnitDirectionsFromField(field, positions, 1, 2, atTwo);
    writeUnitDirectionsFromField(field, positions, 1, -2, atNeg);
    expect(atTwo[0]).toBeCloseTo(1);
    expect(atNeg[0]).toBeCloseTo(-1);
  });

  it("does not encode speed, age, or moisture", () => {
    expect(orientedSrc).not.toMatch(/age/);
    expect(orientedSrc).not.toMatch(/moisture/);
    expect(orientedSrc).not.toMatch(/lengthM \* speed/);
    expect(ORIENTED_AIRFLOW_MARK_LENGTH_M).toBe(500);
  });
});
