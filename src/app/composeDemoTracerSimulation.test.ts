import { describe, expect, it } from "vitest";
import composeDemoTracerSimulationSrc from "./composeDemoTracerSimulation.ts?raw";
import {
  composeDemoTracerFields,
  composeDemoTracerSimulation,
} from "./composeDemoTracerSimulation.js";
import { createDemoHodographPoints } from "./demoHodographFixture.js";
import {
  DEFAULT_DEMO_INTEGRATION_FRAME,
  IntegrationFrame,
} from "./IntegrationFrame.js";
import type { Vec3 } from "../core/math/Vec3.js";
import { EnvironmentalWindField } from "../physics/environment/EnvironmentalWindField.js";
import { hodographPoints } from "../physics/environment/hodograph.js";
import { StormRelativeEnvironmentalAdvectionField } from "../physics/environment/StormRelativeEnvironmentalAdvectionField.js";
import { stormRelativeHelicityBetween } from "../physics/environment/stormRelativeHelicity.js";
import verticalEnvelopeUpdraftSrc from "../physics/storm/VerticalEnvelopeUpdraftField.ts?raw";
import verticalEnvelopeRotationSrc from "../physics/storm/VerticalEnvelopeRotationField.ts?raw";
import lowerRadialInflowSrc from "../physics/storm/LowerRadialInflowField.ts?raw";
import upperRadialOutflowSrc from "../physics/storm/UpperRadialOutflowField.ts?raw";
import compositeVelocityFieldSrc from "../core/fields/CompositeVelocityField.ts?raw";
import { createEnvironmentalWindProfile } from "../scenario/createEnvironmentalWindProfile.js";
import { createLowerRadialInflowField } from "../scenario/createLowerRadialInflowField.js";
import { createRotationField } from "../scenario/createRotationField.js";
import { createUpdraftField } from "../scenario/createUpdraftField.js";
import { createUpperRadialOutflowField } from "../scenario/createUpperRadialOutflowField.js";
import appSrc from "./App.tsx?raw";
import demoScenarioSrc from "../scenario/DEMO_SCENARIO.ts?raw";
import { DEMO_SCENARIO } from "../scenario/DEMO_SCENARIO.js";
import scenarioConfigSrc from "../scenario/ScenarioConfig.ts?raw";
import { resetTracersFromSeeds } from "../simulation/resetTracersFromSeeds.js";

const SAMPLE_POINTS: Vec3[] = [
  { x: 0, y: 1000, z: 0 },
  { x: 2400, y: 1000, z: 0 },
  { x: 0, y: 1000, z: -2400 },
  { x: 0, y: 4000, z: 0 },
  { x: 400, y: 7000, z: -200 },
];

function preSliceGroundRelativeFields() {
  const profile = createEnvironmentalWindProfile(DEMO_SCENARIO);
  const environmentField = new EnvironmentalWindField(profile);
  const updraftField = createUpdraftField(DEMO_SCENARIO);
  const rotationField = createRotationField(DEMO_SCENARIO);
  const lowerRadialInflowField = createLowerRadialInflowField(DEMO_SCENARIO);
  const upperRadialOutflowField = createUpperRadialOutflowField(DEMO_SCENARIO);
  return {
    profile,
    environmentField,
    updraftField,
    rotationField,
    lowerRadialInflowField,
    upperRadialOutflowField,
  };
}

describe("DEMO IntegrationFrame composition", () => {
  it("defaults to GroundRelativeWindTunnel", () => {
    expect(DEFAULT_DEMO_INTEGRATION_FRAME).toBe(
      IntegrationFrame.GroundRelativeWindTunnel,
    );
    expect(composeDemoTracerFields().integrationFrame).toBe(
      IntegrationFrame.GroundRelativeWindTunnel,
    );
    expect(composeDemoTracerSimulationSrc).toMatch(
      /DEFAULT_DEMO_INTEGRATION_FRAME/,
    );

    const dt = DEMO_SCENARIO.simulation.timestep;
    const implied = composeDemoTracerSimulation();
    const explicit = composeDemoTracerSimulation(
      IntegrationFrame.GroundRelativeWindTunnel,
    );
    implied.step(dt);
    explicit.step(dt);
    expect(implied.particles[0]!.position).toEqual(
      explicit.particles[0]!.position,
    );
  });

  it("keeps five operands in both frames and uses scenario stormMotion once", () => {
    const ground = composeDemoTracerFields(
      IntegrationFrame.GroundRelativeWindTunnel,
    );
    const stormRelative = composeDemoTracerFields(
      IntegrationFrame.StormRelativeLaboratory,
    );

    expect(ground.operands).toHaveLength(5);
    expect(stormRelative.operands).toHaveLength(5);
    expect(composeDemoTracerSimulationSrc).toMatch(
      /new CompositeVelocityField\(\[\s*environmentField,\s*updraftField,\s*rotationField,\s*lowerRadialInflowField,\s*upperRadialOutflowField,\s*\]/,
    );
    expect(composeDemoTracerSimulationSrc).toMatch(/DEMO_SCENARIO\.stormMotion/);
    expect(composeDemoTracerSimulationSrc).not.toMatch(/integrationStormMotion/);
    expect(composeDemoTracerSimulationSrc).not.toMatch(/advectionC/);
    expect(scenarioConfigSrc).not.toMatch(/IntegrationFrame/);
    expect(scenarioConfigSrc).not.toMatch(/integrationStormMotion/);
    expect(demoScenarioSrc).not.toMatch(/IntegrationFrame/);
  });

  describe("GroundRelativeWindTunnel", () => {
    it("uses EnvironmentalWindField as the environmental operand and does not subtract C", () => {
      const composed = composeDemoTracerFields(
        IntegrationFrame.GroundRelativeWindTunnel,
      );
      const { environmentField: preSliceEnv } = preSliceGroundRelativeFields();
      const position = SAMPLE_POINTS[0]!;

      expect(composed.environmentField).toBe(
        composed.groundRelativeEnvironmentField,
      );
      expect(composed.environmentField).toBeInstanceOf(EnvironmentalWindField);
      expect(composed.environmentField).not.toBeInstanceOf(
        StormRelativeEnvironmentalAdvectionField,
      );

      for (const point of SAMPLE_POINTS) {
        expect(composed.environmentField.sample(point, 0)).toEqual(
          preSliceEnv.sample(point, 0),
        );
        expect(composed.environmentField.sample(point, 0)).toEqual(
          composed.groundRelativeEnvironmentField.sample(point, 0),
        );
      }

      const env = composed.environmentField.sample(position, 0);
      expect(env.x).toBe(5);
      expect(env.y).toBe(0);
      expect(env.z).toBe(-15);
    });

    it("matches pre-slice composite samples at representative points", () => {
      const composed = composeDemoTracerFields();
      const preSlice = preSliceGroundRelativeFields();

      for (const point of SAMPLE_POINTS) {
        const expected = {
          x:
            preSlice.environmentField.sample(point, 0).x +
            preSlice.updraftField.sample(point, 0).x +
            preSlice.rotationField.sample(point, 0).x +
            preSlice.lowerRadialInflowField.sample(point, 0).x +
            preSlice.upperRadialOutflowField.sample(point, 0).x,
          y:
            preSlice.environmentField.sample(point, 0).y +
            preSlice.updraftField.sample(point, 0).y +
            preSlice.rotationField.sample(point, 0).y +
            preSlice.lowerRadialInflowField.sample(point, 0).y +
            preSlice.upperRadialOutflowField.sample(point, 0).y,
          z:
            preSlice.environmentField.sample(point, 0).z +
            preSlice.updraftField.sample(point, 0).z +
            preSlice.rotationField.sample(point, 0).z +
            preSlice.lowerRadialInflowField.sample(point, 0).z +
            preSlice.upperRadialOutflowField.sample(point, 0).z,
        };
        expect(composed.field.sample(point, 0)).toEqual(expected);
      }
    });
  });

  describe("StormRelativeLaboratory", () => {
    it("differs from ground-relative total by exactly world(-C) for DEMO C = (10, 0)", () => {
      const ground = composeDemoTracerFields(
        IntegrationFrame.GroundRelativeWindTunnel,
      );
      const stormRelative = composeDemoTracerFields(
        IntegrationFrame.StormRelativeLaboratory,
      );

      expect(stormRelative.environmentField).toBeInstanceOf(
        StormRelativeEnvironmentalAdvectionField,
      );
      expect(stormRelative.environmentField).not.toBe(
        stormRelative.groundRelativeEnvironmentField,
      );
      expect(DEMO_SCENARIO.stormMotion).toEqual({
        eastward: 10,
        northward: 0,
      });

      for (const point of SAMPLE_POINTS) {
        const groundTotal = ground.field.sample(point, 0);
        const relativeTotal = stormRelative.field.sample(point, 0);
        expect(relativeTotal.x - groundTotal.x).toBe(-10);
        expect(relativeTotal.y - groundTotal.y).toBe(0);
        expect(relativeTotal.z - groundTotal.z).toBe(0);
      }
    });

    it("keeps storm operand samples identical across frames", () => {
      const ground = composeDemoTracerFields(
        IntegrationFrame.GroundRelativeWindTunnel,
      );
      const stormRelative = composeDemoTracerFields(
        IntegrationFrame.StormRelativeLaboratory,
      );

      for (const point of SAMPLE_POINTS) {
        expect(stormRelative.updraftField.sample(point, 0)).toEqual(
          ground.updraftField.sample(point, 0),
        );
        expect(stormRelative.rotationField.sample(point, 0)).toEqual(
          ground.rotationField.sample(point, 0),
        );
        expect(stormRelative.lowerRadialInflowField.sample(point, 0)).toEqual(
          ground.lowerRadialInflowField.sample(point, 0),
        );
        expect(stormRelative.upperRadialOutflowField.sample(point, 0)).toEqual(
          ground.upperRadialOutflowField.sample(point, 0),
        );
      }
    });

    it("does not double-subtract C", () => {
      const ground = composeDemoTracerFields(
        IntegrationFrame.GroundRelativeWindTunnel,
      );
      const stormRelative = composeDemoTracerFields(
        IntegrationFrame.StormRelativeLaboratory,
      );
      const position = SAMPLE_POINTS[1]!;
      const deltaX =
        stormRelative.field.sample(position, 0).x -
        ground.field.sample(position, 0).x;

      expect(deltaX).toBe(-DEMO_SCENARIO.stormMotion.eastward);
      expect(deltaX).not.toBe(-2 * DEMO_SCENARIO.stormMotion.eastward);
    });

    it("matches the live DEMO SR environmental sample at y = 1000", () => {
      const live = composeDemoTracerFields(
        IntegrationFrame.StormRelativeLaboratory,
      );
      const position = { x: 0, y: 1000, z: 0 };

      expect(live.operands).toHaveLength(5);
      expect(live.groundRelativeEnvironmentField.sample(position, 0)).toEqual({
        x: 5,
        y: 0,
        z: -15,
      });
      expect(live.environmentField.sample(position, 0)).toEqual({
        x: -5,
        y: 0,
        z: -15,
      });
    });
  });

  it("does not change hodograph or SRH when the tracer frame changes", () => {
    const profile = createEnvironmentalWindProfile(DEMO_SCENARIO);
    const pointsBefore = createDemoHodographPoints();
    const srhBefore = stormRelativeHelicityBetween(
      profile,
      DEMO_SCENARIO.stormMotion,
      0,
      1000,
    );

    composeDemoTracerFields(IntegrationFrame.GroundRelativeWindTunnel);
    composeDemoTracerFields(IntegrationFrame.StormRelativeLaboratory);

    expect(createDemoHodographPoints()).toEqual(pointsBefore);
    expect(hodographPoints(profile)).toEqual(pointsBefore);
    expect(
      stormRelativeHelicityBetween(profile, DEMO_SCENARIO.stormMotion, 0, 1000),
    ).toEqual(srhBefore);
  });

  it("keeps the same seeds and Reset semantics in both frames", () => {
    const seeds = DEMO_SCENARIO.simulation.tracerSeeds;
    const seedsSnapshot = structuredClone(seeds);
    const dt = DEMO_SCENARIO.simulation.timestep;

    for (const frame of [
      IntegrationFrame.GroundRelativeWindTunnel,
      IntegrationFrame.StormRelativeLaboratory,
    ]) {
      const simulation = composeDemoTracerSimulation(frame);
      expect(simulation.particles.map((particle) => particle.position)).toEqual(
        seeds,
      );

      for (let i = 0; i < 20; i++) {
        simulation.step(dt);
      }
      expect(simulation.clock.time).toBeGreaterThan(0);

      resetTracersFromSeeds(simulation, seeds);
      expect(simulation.clock.time).toBe(0);
      expect(simulation.particles.map((particle) => particle.position)).toEqual(
        seeds,
      );
    }

    expect(DEMO_SCENARIO.simulation.tracerSeeds).toEqual(seedsSnapshot);
  });

  it("does not put IntegrationFrame or StormMotion into storm fields or CompositeVelocityField", () => {
    expect(verticalEnvelopeUpdraftSrc).not.toMatch(/IntegrationFrame/);
    expect(verticalEnvelopeUpdraftSrc).not.toMatch(/StormMotion/);
    expect(verticalEnvelopeRotationSrc).not.toMatch(/IntegrationFrame/);
    expect(verticalEnvelopeRotationSrc).not.toMatch(/StormMotion/);
    expect(lowerRadialInflowSrc).not.toMatch(/IntegrationFrame/);
    expect(lowerRadialInflowSrc).not.toMatch(/StormMotion/);
    expect(upperRadialOutflowSrc).not.toMatch(/IntegrationFrame/);
    expect(upperRadialOutflowSrc).not.toMatch(/StormMotion/);
    expect(compositeVelocityFieldSrc).not.toMatch(/IntegrationFrame/);
    expect(compositeVelocityFieldSrc).not.toMatch(/stormMotion/);
  });

  it("keeps the live App on an explicit StormRelativeLaboratory constant with no UI switch", () => {
    expect(appSrc).toMatch(/IntegrationFrame\.StormRelativeLaboratory/);
    expect(appSrc).not.toMatch(/GroundRelativeWindTunnel/);
    expect(appSrc).toMatch(/storm-relative\s+laboratory frame/);
    expect(DEFAULT_DEMO_INTEGRATION_FRAME).toBe(
      IntegrationFrame.GroundRelativeWindTunnel,
    );
  });
});
