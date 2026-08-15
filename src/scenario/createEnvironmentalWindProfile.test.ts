import { describe, expect, it } from "vitest";
import { horizontalVorticityFromShear } from "../physics/environment/horizontalVorticity.js";
import { stormRelativeWind } from "../physics/environment/stormRelativeWind.js";
import { decomposeHorizontalVorticity } from "../physics/environment/streamwiseCrosswiseVorticity.js";
import { verticalWindShearBetween } from "../physics/environment/verticalWindShear.js";
import {
  createEnvironmentalWindProfile,
  ScenarioConfigError,
} from "./createEnvironmentalWindProfile.js";
import { DEMO_SCENARIO } from "./DEMO_SCENARIO.js";
import type { ScenarioConfig } from "./ScenarioConfig.js";

function cloneDemoScenario(): ScenarioConfig {
  return structuredClone(DEMO_SCENARIO);
}

describe("scenario → EnvironmentalWindProfile", () => {
  it("samples DEMO_SCENARIO knot winds exactly; vertical is 0", () => {
    const profile = createEnvironmentalWindProfile(DEMO_SCENARIO);

    expect(profile.sampleAtHeight(0)).toEqual({
      eastward: 15,
      northward: 5,
      vertical: 0,
    });
    expect(profile.sampleAtHeight(1000)).toEqual({
      eastward: 5,
      northward: 15,
      vertical: 0,
    });
    expect(profile.sampleAtHeight(2000)).toEqual({
      eastward: 10,
      northward: 25,
      vertical: 0,
    });
  });
});

describe("scenario storm motion → diagnostics parity with nasty fixture", () => {
  it("matches hand expectations for layer [0, 1000] with C = (10, 0)", () => {
    const profile = createEnvironmentalWindProfile(DEMO_SCENARIO);
    const stormMotion = DEMO_SCENARIO.stormMotion;

    const shear = verticalWindShearBetween(profile, 0, 1000);
    expect(shear).toEqual({
      shearEastward: -0.01,
      shearNorthward: 0.01,
    });

    const vorticity = horizontalVorticityFromShear(shear);
    expect(vorticity).toEqual({
      omegaEastward: -0.01,
      omegaNorthward: -0.01,
    });

    const v0 = stormRelativeWind(profile.sampleAtHeight(0), stormMotion);
    const v1 = stormRelativeWind(profile.sampleAtHeight(1000), stormMotion);
    expect(v0).toEqual({ eastward: 5, northward: 5, vertical: 0 });
    expect(v1).toEqual({ eastward: -5, northward: 15, vertical: 0 });

    const basisStormRelativeWind = {
      eastward: (v0.eastward + v1.eastward) / 2,
      northward: (v0.northward + v1.northward) / 2,
      vertical: 0,
    };
    expect(basisStormRelativeWind).toEqual({
      eastward: 0,
      northward: 10,
      vertical: 0,
    });

    expect(
      decomposeHorizontalVorticity(basisStormRelativeWind, vorticity),
    ).toEqual({
      omegaStreamwise: -0.01,
      omegaCrosswise: 0.01,
    });
  });
});

describe("config replacement rebuilds derived profile", () => {
  it("yields updated samples after replacing wind levels", () => {
    const original = createEnvironmentalWindProfile(DEMO_SCENARIO);
    expect(original.sampleAtHeight(0).eastward).toBe(15);

    const replaced = cloneDemoScenario();
    replaced.environment.windLevels = [
      { height: 0, eastward: 1, northward: 2 },
      { height: 500, eastward: 3, northward: 4 },
    ];

    const rebuilt = createEnvironmentalWindProfile(replaced);
    expect(rebuilt.sampleAtHeight(0)).toEqual({
      eastward: 1,
      northward: 2,
      vertical: 0,
    });
    expect(rebuilt.sampleAtHeight(500)).toEqual({
      eastward: 3,
      northward: 4,
      vertical: 0,
    });
    // Original build unchanged
    expect(original.sampleAtHeight(0).eastward).toBe(15);
  });
});

describe("post-build config mutation does not change profile", () => {
  it("keeps profile samples after mutating config wind levels", () => {
    const config = cloneDemoScenario();
    const profile = createEnvironmentalWindProfile(config);

    config.environment.windLevels[0]!.eastward = 999;
    config.environment.windLevels[0]!.northward = -999;
    config.stormMotion.eastward = 42;

    expect(profile.sampleAtHeight(0)).toEqual({
      eastward: 15,
      northward: 5,
      vertical: 0,
    });
  });
});

describe("scenario-owned validation", () => {
  it("rejects non-finite storm motion", () => {
    const config = cloneDemoScenario();
    config.stormMotion.eastward = Number.NaN;
    expect(() => createEnvironmentalWindProfile(config)).toThrow(
      ScenarioConfigError,
    );
  });

  it("rejects non-positive timestep", () => {
    const config = cloneDemoScenario();
    config.simulation.timestep = 0;
    expect(() => createEnvironmentalWindProfile(config)).toThrow(
      ScenarioConfigError,
    );
  });

  it("rejects non-finite tracer seed components", () => {
    const config = cloneDemoScenario();
    config.simulation.tracerSeeds = [{ x: 0, y: Number.POSITIVE_INFINITY, z: 0 }];
    expect(() => createEnvironmentalWindProfile(config)).toThrow(
      ScenarioConfigError,
    );
  });
});
