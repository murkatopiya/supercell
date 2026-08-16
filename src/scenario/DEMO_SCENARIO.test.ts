import { describe, expect, it } from "vitest";
import { composeDemoTracerFields } from "../app/composeDemoTracerSimulation.js";
import { IntegrationFrame } from "../app/IntegrationFrame.js";
import { DEEP_STORM_TRACER_VIEW } from "../rendering/deepStormTracerView.js";
import demoScenarioSrc from "./DEMO_SCENARIO.ts?raw";
import scenarioConfigSrc from "./ScenarioConfig.ts?raw";
import { DEMO_SCENARIO } from "./DEMO_SCENARIO.js";

const SQRT_E = Math.sqrt(Math.E);
const FROZEN_PEAK_ROTATION = 0.02 * 1000 / SQRT_E;
const FROZEN_PEAK_INFLOW = 0.005 * 1000 / SQRT_E;
const FROZEN_PEAK_OUTFLOW = 0.01 * 1000 / SQRT_E;

describe("DEMO_SCENARIO chimney retune (architecture 06)", () => {
  it("uses explicit shared-σ DEMO numbers without storm.sigma", () => {
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

    const sigmas = [
      DEMO_SCENARIO.storm.updraft.sigma,
      DEMO_SCENARIO.storm.rotation.sigma,
      DEMO_SCENARIO.storm.lowerRadialInflow.sigma,
      DEMO_SCENARIO.storm.upperRadialOutflow.sigma,
    ];
    expect(sigmas).toEqual([4000, 4000, 4000, 4000]);
    expect(demoScenarioSrc).not.toMatch(/storm\.sigma/);
    expect(scenarioConfigSrc).not.toMatch(/storm\.sigma/);
  });

  it("keeps C, knots, timestep, and coincident centers", () => {
    expect(DEMO_SCENARIO.stormMotion).toEqual({
      eastward: 10,
      northward: 0,
    });
    expect(DEMO_SCENARIO.environment.windLevels).toEqual([
      { height: 0, eastward: 15, northward: 5 },
      { height: 1000, eastward: 5, northward: 15 },
      { height: 2000, eastward: 10, northward: 25 },
      { height: 6000, eastward: 30, northward: 20 },
      { height: 12000, eastward: 40, northward: 10 },
    ]);
    expect(DEMO_SCENARIO.simulation.timestep).toBe(0.1);
    expect(DEMO_SCENARIO.storm.updraft.centerX).toBe(0);
    expect(DEMO_SCENARIO.storm.updraft.centerZ).toBe(0);
    expect(DEMO_SCENARIO.storm.rotation.centerX).toBe(0);
    expect(DEMO_SCENARIO.storm.lowerRadialInflow.centerX).toBe(0);
    expect(DEMO_SCENARIO.storm.upperRadialOutflow.centerX).toBe(0);
  });

  it("keeps diagnostic seeds at r = 0.6 σ", () => {
    const seeds = DEMO_SCENARIO.simulation.tracerSeeds;
    const sigma = DEMO_SCENARIO.storm.updraft.sigma;
    expect(seeds).toEqual([
      { x: 0, y: 1000, z: 0 },
      { x: 2400, y: 1000, z: 0 },
      { x: 0, y: 1000, z: -2400 },
    ]);
    expect(seeds).toHaveLength(3);
    expect(Math.hypot(seeds[1]!.x, seeds[1]!.z) / sigma).toBeCloseTo(0.6, 12);
    expect(Math.hypot(seeds[2]!.x, seeds[2]!.z) / sigma).toBeCloseTo(0.6, 12);
  });

  it("preserves characteristic horizontal peak speeds (DEMO frozen-peak policy)", () => {
    const { rotation, lowerRadialInflow, upperRadialOutflow } =
      DEMO_SCENARIO.storm;
    const peakRotation =
      (Math.abs(rotation.angularVelocity) * rotation.sigma) / SQRT_E;
    const peakInflow =
      (lowerRadialInflow.radialStrainRate * lowerRadialInflow.sigma) / SQRT_E;
    const peakOutflow =
      (upperRadialOutflow.outflowStrainRate * upperRadialOutflow.sigma) /
      SQRT_E;

    expect(peakRotation).toBeCloseTo(FROZEN_PEAK_ROTATION, 12);
    expect(peakInflow).toBeCloseTo(FROZEN_PEAK_INFLOW, 12);
    expect(peakOutflow).toBeCloseTo(FROZEN_PEAK_OUTFLOW, 12);
    expect(peakRotation).toBeCloseTo(12.13, 2);
    expect(peakInflow).toBeCloseTo(3.03, 2);
    expect(peakOutflow).toBeCloseTo(6.07, 2);

    const live = composeDemoTracerFields(
      IntegrationFrame.StormRelativeLaboratory,
    );
    const sigma = rotation.sigma;
    const rotationPeak = live.rotationField.sample(
      { x: sigma, y: 3250, z: 0 },
      0,
    );
    const inflowPeak = live.lowerRadialInflowField.sample(
      { x: sigma, y: 1000, z: 0 },
      0,
    );
    const outflowPeak = live.upperRadialOutflowField.sample(
      { x: sigma, y: 7000, z: 0 },
      0,
    );

    expect(Math.hypot(rotationPeak.x, rotationPeak.z)).toBeCloseTo(
      FROZEN_PEAK_ROTATION,
      12,
    );
    expect(Math.hypot(inflowPeak.x, inflowPeak.z)).toBeCloseTo(
      FROZEN_PEAK_INFLOW,
      12,
    );
    expect(Math.hypot(outflowPeak.x, outflowPeak.z)).toBeCloseTo(
      FROZEN_PEAK_OUTFLOW,
      12,
    );
  });

  it("keeps five operands and live StormRelativeLaboratory", () => {
    const live = composeDemoTracerFields(
      IntegrationFrame.StormRelativeLaboratory,
    );
    expect(live.operands).toHaveLength(5);
    expect(live.integrationFrame).toBe(
      IntegrationFrame.StormRelativeLaboratory,
    );
  });

  it("keeps the rendering fixture and treats the grid cell as 1000 m, not σ", () => {
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
    const cellM =
      DEEP_STORM_TRACER_VIEW.gridSizeM / DEEP_STORM_TRACER_VIEW.gridDivisions;
    expect(cellM).toBe(1000);
    expect(cellM).not.toBe(DEMO_SCENARIO.storm.updraft.sigma);
  });
});
