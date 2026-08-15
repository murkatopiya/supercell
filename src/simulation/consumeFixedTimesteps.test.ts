import { describe, expect, it } from "vitest";
import { consumeFixedTimesteps } from "./consumeFixedTimesteps.js";

describe("consumeFixedTimesteps", () => {
  it("accumulates partial simulation elapsed without stepping", () => {
    const a = consumeFixedTimesteps(0, 0.04, 0.1);
    expect(a.steps).toBe(0);
    expect(a.accumulator).toBeCloseTo(0.04, 12);

    const b = consumeFixedTimesteps(a.accumulator, 0.04, 0.1);
    expect(b.steps).toBe(0);
    expect(b.accumulator).toBeCloseTo(0.08, 12);
  });

  it("consumes exact multiples and leaves remainder", () => {
    const result = consumeFixedTimesteps(0.08, 0.15, 0.1);
    // 0.08 + 0.15 = 0.23 → 2 steps, remainder 0.03
    expect(result.steps).toBe(2);
    expect(result.accumulator).toBeCloseTo(0.03, 12);
  });

  it("does not clamp large simulation elapsed (wall clamp is orchestration)", () => {
    // Use dyadic-friendly timestep to avoid 0.1 binary drift in the assert.
    const result = consumeFixedTimesteps(0, 5, 0.25);
    expect(result.steps).toBe(20);
    expect(result.accumulator).toBeCloseTo(0, 12);
  });

  it("zero elapsed leaves accumulator unchanged and takes no steps", () => {
    const result = consumeFixedTimesteps(0.07, 0, 0.1);
    expect(result.steps).toBe(0);
    expect(result.accumulator).toBeCloseTo(0.07, 12);
  });

  it("never treats one frame as one step when elapsed != timestep", () => {
    expect(consumeFixedTimesteps(0, 1 / 60, 0.1).steps).toBe(0);
    expect(consumeFixedTimesteps(0, 0.35, 0.1).steps).toBe(3);
  });
});
