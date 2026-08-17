import { describe, expect, it } from "vitest";
import { EnvironmentalWindField } from "../physics/environment/EnvironmentalWindField.js";
import {
  hodographPoints,
  hodographSegments,
} from "../physics/environment/hodograph.js";
import { horizontalVorticityFromShear } from "../physics/environment/horizontalVorticity.js";
import {
  StormRelativeHelicityError,
  stormRelativeHelicityBetween,
} from "../physics/environment/stormRelativeHelicity.js";
import { stormRelativeWind } from "../physics/environment/stormRelativeWind.js";
import { decomposeHorizontalVorticity } from "../physics/environment/streamwiseCrosswiseVorticity.js";
import {
  VerticalWindShearError,
  verticalWindShearBetween,
} from "../physics/environment/verticalWindShear.js";
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

    expect(profile.minHeight).toBe(0);
    expect(profile.maxHeight).toBe(12000);
    expect(profile.levelHeights()).toEqual([0, 1000, 2000, 6000, 12000]);
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
    expect(profile.sampleAtHeight(6000)).toEqual({
      eastward: 30,
      northward: 20,
      vertical: 0,
    });
    expect(profile.sampleAtHeight(12000)).toEqual({
      eastward: 40,
      northward: 10,
      vertical: 0,
    });
  });

  it("interpolates the new 2000–6000 and 6000–12000 segments at midpoints", () => {
    const profile = createEnvironmentalWindProfile(DEMO_SCENARIO);

    expect(profile.sampleAtHeight(4000)).toEqual({
      eastward: 20,
      northward: 22.5,
      vertical: 0,
    });
    expect(profile.sampleAtHeight(9000)).toEqual({
      eastward: 35,
      northward: 15,
      vertical: 0,
    });
  });

  it("clamps below the first knot and above 12000 m", () => {
    const profile = createEnvironmentalWindProfile(DEMO_SCENARIO);

    expect(profile.sampleAtHeight(-1)).toEqual({
      eastward: 15,
      northward: 5,
      vertical: 0,
    });
    expect(profile.sampleAtHeight(13000)).toEqual({
      eastward: 40,
      northward: 10,
      vertical: 0,
    });
  });

  it("is continuous at every DEMO knot", () => {
    const profile = createEnvironmentalWindProfile(DEMO_SCENARIO);
    const knots = [
      { height: 0, eastward: 15, northward: 5 },
      { height: 1000, eastward: 5, northward: 15 },
      { height: 2000, eastward: 10, northward: 25 },
      { height: 6000, eastward: 30, northward: 20 },
      { height: 12000, eastward: 40, northward: 10 },
    ];

    for (const knot of knots) {
      expect(profile.sampleAtHeight(knot.height)).toEqual({
        eastward: knot.eastward,
        northward: knot.northward,
        vertical: 0,
      });
    }
  });

  it("returned samples are snapshots of DEMO knots", () => {
    const profile = createEnvironmentalWindProfile(DEMO_SCENARIO);
    const sample = profile.sampleAtHeight(6000);
    sample.eastward = 999;
    sample.northward = -999;

    expect(profile.sampleAtHeight(6000)).toEqual({
      eastward: 30,
      northward: 20,
      vertical: 0,
    });
  });
});

describe("DEMO EnvironmentalWindField height sampling", () => {
  it("maps new knots and new-segment interiors; world y remains 0", () => {
    const field = new EnvironmentalWindField(
      createEnvironmentalWindProfile(DEMO_SCENARIO),
    );

    expect(field.sample({ x: 0, y: 6000, z: 0 }, 0)).toEqual({
      x: 30,
      y: 0,
      z: -20,
    });
    expect(field.sample({ x: 100, y: 12000, z: -50 }, 0)).toEqual({
      x: 40,
      y: 0,
      z: -10,
    });
    expect(field.sample({ x: 0, y: 4000, z: 0 }, 0)).toEqual({
      x: 20,
      y: 0,
      z: -22.5,
    });
    expect(field.sample({ x: 0, y: 9000, z: 0 }, 0)).toEqual({
      x: 35,
      y: 0,
      z: -15,
    });
  });
});

describe("DEMO hodograph points and segments", () => {
  it("has 5 points in height order and 4 adjacent segments", () => {
    const profile = createEnvironmentalWindProfile(DEMO_SCENARIO);
    const points = hodographPoints(profile);
    const segments = hodographSegments(profile);

    expect(points).toEqual([
      { height: 0, eastward: 15, northward: 5 },
      { height: 1000, eastward: 5, northward: 15 },
      { height: 2000, eastward: 10, northward: 25 },
      { height: 6000, eastward: 30, northward: 20 },
      { height: 12000, eastward: 40, northward: 10 },
    ]);
    expect(segments).toHaveLength(4);
    expect(segments[0]!.lower.height).toBe(0);
    expect(segments[3]!.upper.height).toBe(12000);
    expect(segments.map((segment) => segment.lower.height)).toEqual([
      0, 1000, 2000, 6000,
    ]);
  });
});

describe("DEMO deep-profile diagnostics", () => {
  it("matches shear and vorticity on the new 2000–6000 and 6000–12000 segments", () => {
    const profile = createEnvironmentalWindProfile(DEMO_SCENARIO);

    const shear26 = verticalWindShearBetween(profile, 2000, 6000);
    expect(shear26).toEqual({
      shearEastward: 20 / 4000,
      shearNorthward: -5 / 4000,
    });
    expect(horizontalVorticityFromShear(shear26)).toEqual({
      omegaEastward: 5 / 4000,
      omegaNorthward: 20 / 4000,
    });

    const shear612 = verticalWindShearBetween(profile, 6000, 12000);
    expect(shear612).toEqual({
      shearEastward: 10 / 6000,
      shearNorthward: -10 / 6000,
    });
    expect(horizontalVorticityFromShear(shear612)).toEqual({
      omegaEastward: 10 / 6000,
      omegaNorthward: 10 / 6000,
    });
  });

  it("matches storm-relative wind at 6000 m and 12000 m versus C = (10, 0)", () => {
    const profile = createEnvironmentalWindProfile(DEMO_SCENARIO);
    const stormMotion = DEMO_SCENARIO.stormMotion;

    expect(stormRelativeWind(profile.sampleAtHeight(6000), stormMotion)).toEqual(
      { eastward: 20, northward: 20, vertical: 0 },
    );
    expect(
      stormRelativeWind(profile.sampleAtHeight(12000), stormMotion),
    ).toEqual({ eastward: 30, northward: 10, vertical: 0 });
  });

  it("matches SoT SRH on explicit layers and interpolated [0, 3000]", () => {
    const profile = createEnvironmentalWindProfile(DEMO_SCENARIO);
    const stormMotion = DEMO_SCENARIO.stormMotion;

    expect(stormRelativeHelicityBetween(profile, stormMotion, 0, 1000)).toEqual({
      srh: -100,
    });
    expect(stormRelativeHelicityBetween(profile, stormMotion, 0, 2000)).toEqual({
      srh: 25,
    });
    expect(stormRelativeHelicityBetween(profile, stormMotion, 0, 3000)).toEqual({
      srh: 150,
    });
    expect(stormRelativeHelicityBetween(profile, stormMotion, 0, 6000)).toEqual({
      srh: 525,
    });
    expect(stormRelativeHelicityBetween(profile, stormMotion, 0, 12000)).toEqual(
      { srh: 925 },
    );
  });

  it("rejects shear and SRH layers that use clamped continuation above 12000 m", () => {
    const profile = createEnvironmentalWindProfile(DEMO_SCENARIO);
    const stormMotion = DEMO_SCENARIO.stormMotion;

    expect(() => verticalWindShearBetween(profile, 11000, 13000)).toThrow(
      VerticalWindShearError,
    );
    expect(() =>
      stormRelativeHelicityBetween(profile, stormMotion, 11000, 13000),
    ).toThrow(StormRelativeHelicityError);
  });
});

describe("DEMO storm envelopes follow the 06 chimney fixture", () => {
  it("does not retune centers, motion, envelopes, or timestep; holds 06 numbers", () => {
    expect(DEMO_SCENARIO.stormMotion).toEqual({
      eastward: 10,
      northward: 0,
    });
    expect(DEMO_SCENARIO.storm.updraft).toEqual({
      centerX: 0,
      centerZ: 0,
      peakVerticalVelocity: 30,
      sigma: 4000,
      baseHeight: 0,
      topHeight: 8000,
    });
    expect(DEMO_SCENARIO.storm.rotation).toEqual({
      centerX: 0,
      centerZ: 0,
      angularVelocity: 0.005,
      sigma: 4000,
      baseHeight: 0,
      topHeight: 6500,
    });
    expect(DEMO_SCENARIO.storm.lowerRadialInflow).toEqual({
      centerX: 0,
      centerZ: 0,
      radialStrainRate: 0.00125,
      sigma: 4000,
      baseHeight: 1500,
      topHeight: 4500,
    });
    expect(DEMO_SCENARIO.storm.upperRadialOutflow).toEqual({
      centerX: 0,
      centerZ: 0,
      outflowStrainRate: 0.0025,
      sigma: 4000,
      baseHeight: 5000,
      topHeight: 9000,
    });
    expect(DEMO_SCENARIO.simulation.timestep).toBe(0.1);
    expect(DEMO_SCENARIO.simulation.diagnosticSeeds).toEqual([
      { x: 0, y: 1000, z: 0 },
      { x: 2400, y: 1000, z: 0 },
      { x: 0, y: 1000, z: -2400 },
    ]);
    expect(DEMO_SCENARIO.simulation.storySeeds).toEqual([
      { x: 0, y: 1000, z: 4000 },
      { x: 0, y: 1000, z: 6000 },
    ]);
    expect(DEMO_SCENARIO.simulation.downwardPathlineSeeds).toEqual([
      { x: 5000, y: 1000, z: 0 },
    ]);
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

  it("rejects non-finite diagnostic seed components", () => {
    const config = cloneDemoScenario();
    config.simulation.diagnosticSeeds = [
      { x: 0, y: Number.POSITIVE_INFINITY, z: 0 },
    ];
    expect(() => createEnvironmentalWindProfile(config)).toThrow(
      ScenarioConfigError,
    );
  });

  it("rejects non-finite story seed components", () => {
    const config = cloneDemoScenario();
    config.simulation.storySeeds = [
      { x: Number.NaN, y: 1000, z: 4000 },
    ];
    expect(() => createEnvironmentalWindProfile(config)).toThrow(
      ScenarioConfigError,
    );
  });

  it("rejects non-finite downward pathline seed components", () => {
    const config = cloneDemoScenario();
    config.simulation.downwardPathlineSeeds = [
      { x: 5000, y: Number.NaN, z: 0 },
    ];
    expect(() => createEnvironmentalWindProfile(config)).toThrow(
      ScenarioConfigError,
    );
  });

  it("allows empty diagnosticSeeds, storySeeds, and downwardPathlineSeeds", () => {
    const config = cloneDemoScenario();
    config.simulation.diagnosticSeeds = [];
    config.simulation.storySeeds = [];
    config.simulation.downwardPathlineSeeds = [];
    expect(() => createEnvironmentalWindProfile(config)).not.toThrow();
  });
});
