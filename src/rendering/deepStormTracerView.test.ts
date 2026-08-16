import { describe, expect, it } from "vitest";
import { DEEP_STORM_TRACER_VIEW } from "./deepStormTracerView.js";

describe("DEEP_STORM_TRACER_VIEW", () => {
  it("freezes the deep-storm tracer view fixture (11 numbers; 13 keeps them)", () => {
    expect(DEEP_STORM_TRACER_VIEW).toEqual({
      fovDeg: 50,
      nearM: 10,
      farM: 50000,
      cameraPosition: { x: 12000, y: 6000, z: 12000 },
      target: { x: 0, y: 4000, z: 0 },
      gridSizeM: 10000,
      gridDivisions: 10,
      axisSizeM: 2000,
      sphereRadiusM: 150,
    });
  });

  it("keeps 1000 m grid cells as a metric ruler, not as DEMO sigma", () => {
    expect(
      DEEP_STORM_TRACER_VIEW.gridSizeM / DEEP_STORM_TRACER_VIEW.gridDivisions,
    ).toBe(1000);
  });
});
