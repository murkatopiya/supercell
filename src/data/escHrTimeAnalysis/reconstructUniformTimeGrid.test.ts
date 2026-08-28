import { describe, expect, it } from "vitest";
import { EscAnalysisError } from "./EscAnalysisError.js";
import { reconstructUniformTimeGrid } from "./reconstructUniformTimeGrid.js";

function sample(
  time: number,
  height: number,
  eastward: number,
  northward: number,
) {
  return { time, height, eastward, northward };
}

describe("QC integer-second gap reconstruction", () => {
  it("copies exact 1 s steps without interpolation", () => {
    const grid = reconstructUniformTimeGrid([
      sample(0, 10, 1, 2),
      sample(1, 15, 3, 4),
      sample(2, 20, 5, 6),
    ]);
    expect(grid.interpolatedCount).toBe(0);
    expect(grid.uniformN).toBe(3);
    expect(grid.maxGapS).toBe(1);
    expect(grid.uniform.every((row) => !row.interpolated)).toBe(true);
  });

  it("linearly interpolates U/V/height on reconstructable 2–5 s gaps", () => {
    const grid = reconstructUniformTimeGrid([
      sample(-1, 0, 0, 0),
      sample(0, 5, 10, 20),
      sample(2, 15, 30, 40),
      sample(5, 45, 60, 70),
    ]);
    expect(grid.maxGapS).toBe(3);
    expect(grid.interpolatedCount).toBe(3);
    expect(grid.uniformN).toBe(7);

    const at1 = grid.uniform.find((row) => row.time === 1)!;
    expect(at1.interpolated).toBe(true);
    expect(at1.height).toBe(10);
    expect(at1.eastward).toBe(20);
    expect(at1.northward).toBe(30);

    const at3 = grid.uniform.find((row) => row.time === 3)!;
    expect(at3.interpolated).toBe(true);
    expect(at3.height).toBe(25);
    expect(at3.eastward).toBe(40);
    expect(at3.northward).toBe(50);

    expect(grid.uniform.filter((row) => !row.interpolated)).toHaveLength(4);
  });

  it("fails closed on a gap larger than 5 s", () => {
    expect(() =>
      reconstructUniformTimeGrid([
        sample(0, 0, 1, 1),
        sample(6, 10, 2, 2),
      ]),
    ).toThrow(EscAnalysisError);
    expect(() =>
      reconstructUniformTimeGrid([
        sample(0, 0, 1, 1),
        sample(6, 10, 2, 2),
      ]),
    ).toThrow(/exceeds maximum reconstructable 5 s/);
  });
});
