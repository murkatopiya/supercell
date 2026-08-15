import { describe, expect, it } from "vitest";
import { consumeFixedTimesteps } from "./consumeFixedTimesteps.js";
import { simulationElapsedFromWall } from "./simulationElapsedFromWall.js";

describe("simulationElapsedFromWall", () => {
  it("applies timeScale after wall clamp", () => {
    expect(
      simulationElapsedFromWall(0.1, {
        paused: false,
        timeScale: 10,
        maxWallDelta: 0.25,
      }),
    ).toBeCloseTo(1.0, 12);

    expect(
      simulationElapsedFromWall(2, {
        paused: false,
        timeScale: 20,
        maxWallDelta: 0.25,
      }),
    ).toBeCloseTo(5.0, 12);
  });

  it("returns 0 while paused even for large wall dt", () => {
    expect(
      simulationElapsedFromWall(10, {
        paused: true,
        timeScale: 20,
        maxWallDelta: 0.25,
      }),
    ).toBe(0);
  });

  it("with consumeFixedTimesteps: 10× wall 0.1 → exactly 10 steps at dt 0.1", () => {
    const elapsed = simulationElapsedFromWall(0.1, {
      paused: false,
      timeScale: 10,
      maxWallDelta: 0.25,
    });
    const consumed = consumeFixedTimesteps(0, elapsed, 0.1);
    expect(consumed.steps).toBe(10);
    expect(consumed.accumulator).toBeCloseTo(0, 12);
  });
});

describe("pause / resume without catch-up", () => {
  it("advancing previousMs across a paused gap does not burst steps on resume", () => {
    let previousMs = 0;
    let accumulator = 0;
    const timestep = 0.1;
    const timeScale = 1;
    const maxWallDelta = 0.25;

    const frame = (nowMs: number, paused: boolean) => {
      const wallFrameDt = (nowMs - previousMs) / 1000;
      previousMs = nowMs;
      const simulationElapsed = simulationElapsedFromWall(wallFrameDt, {
        paused,
        timeScale,
        maxWallDelta,
      });
      const consumed = consumeFixedTimesteps(
        accumulator,
        simulationElapsed,
        timestep,
      );
      accumulator = consumed.accumulator;
      return consumed.steps;
    };

    // Active short frame
    expect(frame(16, false)).toBe(0);

    // Long paused gap (10 s wall) — must not accumulate sim time
    expect(frame(10016, true)).toBe(0);
    expect(accumulator).toBeCloseTo(0.016, 12);

    // Resume: only ~16 ms wall → 0 steps at 1×, not ~100 catch-up steps
    expect(frame(10032, false)).toBe(0);
    expect(accumulator).toBeCloseTo(0.032, 12);
  });
});
