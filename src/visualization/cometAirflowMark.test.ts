import { describe, expect, it } from "vitest";
import { ConstantVelocityField } from "../physics/synthetic/ConstantVelocityField.js";
import {
  COMET_AIRFLOW_LENGTH_M,
  COMET_SEGMENT_COUNT,
  writeCometMarkEndpoints,
} from "./cometAirflowMark.js";
import { writeUnitDirectionsFromField } from "./orientedAirflowMark.js";
import cometSrc from "./cometAirflowMark.ts?raw";

describe("writeCometMarkEndpoints", () => {
  it("puts the head at the occupant and the tail behind, with fixed length", () => {
    const positions = new Float32Array([10, 0, 0]);
    const plus = new Float32Array([1, 0, 0]);
    const minus = new Float32Array([-1, 0, 0]);
    const plusEnds = new Float32Array(COMET_SEGMENT_COUNT * 2 * 3);
    const minusEnds = new Float32Array(COMET_SEGMENT_COUNT * 2 * 3);
    writeCometMarkEndpoints(positions, plus, 1, COMET_AIRFLOW_LENGTH_M, plusEnds);
    writeCometMarkEndpoints(
      positions,
      minus,
      1,
      COMET_AIRFLOW_LENGTH_M,
      minusEnds,
    );
    const plusHeadX = plusEnds[plusEnds.length - 3]!;
    const plusTailX = plusEnds[0]!;
    expect(plusHeadX).toBeCloseTo(10);
    expect(plusTailX).toBeCloseTo(10 - COMET_AIRFLOW_LENGTH_M);
    const minusHeadX = minusEnds[minusEnds.length - 3]!;
    expect(minusHeadX).toBeCloseTo(10);
    expect(minusEnds[0]).toBeCloseTo(10 + COMET_AIRFLOW_LENGTH_M);
    expect(COMET_AIRFLOW_LENGTH_M).toBe(500);
  });

  it("keeps fixed perceptual length after unitizing different |V_total|", () => {
    const positions = new Float32Array([0, 0, 0]);
    const slowDir = new Float32Array(3);
    const fastDir = new Float32Array(3);
    writeUnitDirectionsFromField(
      new ConstantVelocityField({ x: 2, y: 0, z: 0 }),
      positions,
      1,
      0,
      slowDir,
    );
    writeUnitDirectionsFromField(
      new ConstantVelocityField({ x: 40, y: 0, z: 0 }),
      positions,
      1,
      0,
      fastDir,
    );
    const a = new Float32Array(COMET_SEGMENT_COUNT * 2 * 3);
    const b = new Float32Array(COMET_SEGMENT_COUNT * 2 * 3);
    writeCometMarkEndpoints(positions, slowDir, 1, COMET_AIRFLOW_LENGTH_M, a);
    writeCometMarkEndpoints(positions, fastDir, 1, COMET_AIRFLOW_LENGTH_M, b);
    expect(Array.from(a)).toEqual(Array.from(b));
    const tailX = a[0]!;
    const headX = a[a.length - 3]!;
    expect(headX - tailX).toBeCloseTo(COMET_AIRFLOW_LENGTH_M);
  });

  it("is not scientific path history", () => {
    expect(cometSrc).not.toMatch(/TracerPathHistory/);
    expect(cometSrc).not.toMatch(/tracerId/);
  });
});
