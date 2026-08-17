import { describe, expect, it } from "vitest";
import composeDemoTracerSimulationSrc from "../app/composeDemoTracerSimulation.ts?raw";
import { composeDemoTracerSimulation } from "../app/composeDemoTracerSimulation.js";
import { createDemoHodographPoints } from "../app/demoHodographFixture.js";
import { CompositeVelocityField } from "../core/fields/CompositeVelocityField.js";
import { EnvironmentalWindField } from "../physics/environment/EnvironmentalWindField.js";
import { hodographPoints } from "../physics/environment/hodograph.js";
import { RadialInflowField } from "../physics/storm/RadialInflowField.js";
import { RotationField } from "../physics/storm/RotationField.js";
import { VerticalEnvelopeRotationField } from "../physics/storm/VerticalEnvelopeRotationField.js";
import createDowndraftFieldSrc from "../scenario/createDowndraftField.ts?raw";
import { createDowndraftField } from "../scenario/createDowndraftField.js";
import { createEnvironmentalWindProfile } from "../scenario/createEnvironmentalWindProfile.js";
import createLowerRadialInflowFieldSrc from "../scenario/createLowerRadialInflowField.ts?raw";
import { createLowerRadialInflowField } from "../scenario/createLowerRadialInflowField.js";
import createNearGroundRadialOutflowFieldSrc from "../scenario/createNearGroundRadialOutflowField.ts?raw";
import { createNearGroundRadialOutflowField } from "../scenario/createNearGroundRadialOutflowField.js";
import createRotationFieldSrc from "../scenario/createRotationField.ts?raw";
import { createRotationField } from "../scenario/createRotationField.js";
import createUpdraftFieldSrc from "../scenario/createUpdraftField.ts?raw";
import { createUpdraftField } from "../scenario/createUpdraftField.js";
import createUpperRadialOutflowFieldSrc from "../scenario/createUpperRadialOutflowField.ts?raw";
import { createUpperRadialOutflowField } from "../scenario/createUpperRadialOutflowField.js";
import demoScenarioSrc from "../scenario/DEMO_SCENARIO.ts?raw";
import { DEMO_SCENARIO } from "../scenario/DEMO_SCENARIO.js";
import scenarioConfigSrc from "../scenario/ScenarioConfig.ts?raw";
import { resetTracersFromSeeds } from "../simulation/resetTracersFromSeeds.js";

describe("DEMO composite env + envelope updraft + rotation + lower inflow + upper outflow + downdraft + near-ground outflow", () => {
  const seeds = DEMO_SCENARIO.simulation.diagnosticSeeds;
  const dt = DEMO_SCENARIO.simulation.timestep;
  const updraftDto = DEMO_SCENARIO.storm.updraft;
  const rotationDto = DEMO_SCENARIO.storm.rotation;
  const inflowDto = DEMO_SCENARIO.storm.lowerRadialInflow;
  const outflowDto = DEMO_SCENARIO.storm.upperRadialOutflow;
  const updraftSpan = updraftDto.topHeight - updraftDto.baseHeight;
  const inflowSpan = inflowDto.topHeight - inflowDto.baseHeight;
  const outflowSpan = outflowDto.topHeight - outflowDto.baseHeight;
  const outflowYMid = (outflowDto.baseHeight + outflowDto.topHeight) / 2;
  const updraftYMid = (updraftDto.baseHeight + updraftDto.topHeight) / 2;
  const rotationSpan = rotationDto.topHeight - rotationDto.baseHeight;
  const rotationYMid =
    (rotationDto.baseHeight + rotationDto.topHeight) / 2;
  const gRotSeed = Math.sin(Math.PI / 6.5);
  const fUpdraftSeed = Math.sin(Math.PI / 8);

  function envelopeF(y: number): number {
    if (y < updraftDto.baseHeight || y > updraftDto.topHeight) {
      return 0;
    }
    return Math.sin((Math.PI * (y - updraftDto.baseHeight)) / updraftSpan);
  }

  function envelopeGOut(y: number): number {
    if (y < outflowDto.baseHeight || y > outflowDto.topHeight) {
      return 0;
    }
    return Math.sin((Math.PI * (y - outflowDto.baseHeight)) / outflowSpan);
  }

  function envelopeGIn(y: number): number {
    if (y >= inflowDto.topHeight) {
      return 0;
    }
    if (y <= inflowDto.baseHeight) {
      return 1;
    }
    return Math.cos((Math.PI * (y - inflowDto.baseHeight)) / (2 * inflowSpan));
  }

  function envelopeGRot(y: number): number {
    if (y < rotationDto.baseHeight || y > rotationDto.topHeight) {
      return 0;
    }
    return Math.sin(
      (Math.PI * (y - rotationDto.baseHeight)) / rotationSpan,
    );
  }

  function radialEnvelope(r: number, sigma: number): number {
    return Math.exp(-(r * r) / (2 * sigma * sigma));
  }

  function expectedUpdraftVy(r: number, y: number): number {
    return (
      updraftDto.peakVerticalVelocity *
      radialEnvelope(r, updraftDto.sigma) *
      envelopeF(y)
    );
  }

  function hypotHorizontal(v: { x: number; z: number }): number {
    return Math.hypot(v.x, v.z);
  }

  function demoFields() {
    const profile = createEnvironmentalWindProfile(DEMO_SCENARIO);
    const environmentField = new EnvironmentalWindField(profile);
    const updraftField = createUpdraftField(DEMO_SCENARIO);
    const rotationField = createRotationField(DEMO_SCENARIO);
    const lowerRadialInflowField = createLowerRadialInflowField(DEMO_SCENARIO);
    const upperRadialOutflowField = createUpperRadialOutflowField(DEMO_SCENARIO);
    const downdraftField = createDowndraftField(DEMO_SCENARIO);
    const nearGroundOutflowField = createNearGroundRadialOutflowField(
      DEMO_SCENARIO,
    );
    const operands = [
      environmentField,
      updraftField,
      rotationField,
      lowerRadialInflowField,
      upperRadialOutflowField,
      downdraftField,
      nearGroundOutflowField,
    ];
    const composite = new CompositeVelocityField(operands);
    return {
      environmentField,
      updraftField,
      rotationField,
      lowerRadialInflowField,
      upperRadialOutflowField,
      downdraftField,
      nearGroundOutflowField,
      operands,
      composite,
    };
  }

  it("createUpdraftField maps DEMO DTO to VerticalEnvelopeUpdraftField", () => {
    const updraft = createUpdraftField(DEMO_SCENARIO);
    const atMid = updraft.sample(
      { x: updraftDto.centerX, y: updraftYMid, z: updraftDto.centerZ },
      0,
    );
    const atBase = updraft.sample(
      { x: updraftDto.centerX, y: updraftDto.baseHeight, z: updraftDto.centerZ },
      0,
    );
    const atTop = updraft.sample(
      { x: updraftDto.centerX, y: updraftDto.topHeight, z: updraftDto.centerZ },
      0,
    );
    const atSeedHeight = updraft.sample(
      { x: updraftDto.centerX, y: 1000, z: updraftDto.centerZ },
      0,
    );

    expect(updraftDto.centerX).toBe(0);
    expect(updraftDto.centerZ).toBe(0);
    expect(updraftDto.peakVerticalVelocity).toBe(30);
    expect(updraftDto.sigma).toBe(4000);
    expect(updraftDto.baseHeight).toBe(0);
    expect(updraftDto.topHeight).toBe(8000);
    expect(updraftYMid).toBe(4000);
    expect(atMid.x).toBe(0);
    expect(atMid.z).toBe(0);
    expect(atMid.y).toBe(updraftDto.peakVerticalVelocity);
    expect(atBase.x).toBe(0);
    expect(atBase.z).toBe(0);
    expect(atBase.y).toBeCloseTo(0, 12);
    expect(atTop.x).toBe(0);
    expect(atTop.z).toBe(0);
    expect(atTop.y).toBeCloseTo(0, 12);
    expect(envelopeF(1000)).toBeCloseTo(fUpdraftSeed, 12);
    expect(atSeedHeight.y).toBeCloseTo(
      updraftDto.peakVerticalVelocity * fUpdraftSeed,
      12,
    );
    expect(atSeedHeight.y).not.toBe(updraftDto.peakVerticalVelocity);
  });

  it("createUpdraftField reads only storm.updraft", () => {
    const cloned = structuredClone(DEMO_SCENARIO);
    cloned.storm.rotation.centerX = 999;
    cloned.storm.rotation.sigma = 50;
    cloned.storm.lowerRadialInflow.centerX = -400;
    cloned.storm.lowerRadialInflow.sigma = 50;
    cloned.storm.upperRadialOutflow.centerX = 400;
    cloned.storm.upperRadialOutflow.sigma = 50;

    const updraft = createUpdraftField(cloned);
    const onUpdraftAxis = updraft.sample({ x: 0, y: 1000, z: 0 }, 0);
    const eastOfUpdraft = updraft.sample({ x: 600, y: 1000, z: 0 }, 0);
    const atRotationCenter = updraft.sample({ x: 999, y: 1000, z: 0 }, 0);

    expect(onUpdraftAxis.y).toBeCloseTo(expectedUpdraftVy(0, 1000), 12);
    expect(onUpdraftAxis.y).not.toBe(updraftDto.peakVerticalVelocity);
    expect(eastOfUpdraft.y).toBeCloseTo(expectedUpdraftVy(600, 1000), 12);
    expect(atRotationCenter.y).toBeCloseTo(expectedUpdraftVy(999, 1000), 12);
    expect(atRotationCenter.y).toBeLessThan(onUpdraftAxis.y);
  });

  it("createRotationField maps DEMO DTO to VerticalEnvelopeRotationField", () => {
    const rotation = createRotationField(DEMO_SCENARIO);
    const primitive = new RotationField({
      centerX: rotationDto.centerX,
      centerZ: rotationDto.centerZ,
      angularVelocity: rotationDto.angularVelocity,
      sigma: rotationDto.sigma,
    });
    const offAxis = { x: rotationDto.centerX + 600, z: rotationDto.centerZ };
    const onAxisSeed = rotation.sample(
      { x: rotationDto.centerX, y: 1000, z: rotationDto.centerZ },
      0,
    );
    const onAxisMid = rotation.sample(
      { x: rotationDto.centerX, y: rotationYMid, z: rotationDto.centerZ },
      0,
    );
    const lidBase = rotation.sample({ ...offAxis, y: 0 }, 0);
    const lidTop = rotation.sample({ ...offAxis, y: 6500 }, 0);
    const atMid = rotation.sample({ ...offAxis, y: rotationYMid }, 0);
    const primitiveMid = primitive.sample({ ...offAxis, y: rotationYMid }, 0);

    expect(rotation).toBeInstanceOf(VerticalEnvelopeRotationField);
    expect(rotationDto.centerX).toBe(0);
    expect(rotationDto.centerZ).toBe(0);
    expect(rotationDto.angularVelocity).toBe(0.005);
    expect(rotationDto.sigma).toBe(4000);
    expect(rotationDto.baseHeight).toBe(0);
    expect(rotationDto.topHeight).toBe(6500);
    expect(rotationYMid).toBe(3250);
    expect(envelopeGRot(1000)).toBeCloseTo(gRotSeed, 12);
    expect(envelopeGRot(3250)).toBeCloseTo(1, 12);
    expect(envelopeGRot(0)).toBeCloseTo(0, 12);
    expect(envelopeGRot(6500)).toBeCloseTo(0, 12);
    expect(onAxisSeed).toEqual({ x: 0, y: 0, z: 0 });
    expect(onAxisMid).toEqual({ x: 0, y: 0, z: 0 });
    expect(lidBase.x).toBeCloseTo(0, 12);
    expect(lidBase.y).toBe(0);
    expect(lidBase.z).toBeCloseTo(0, 12);
    expect(lidTop.x).toBeCloseTo(0, 12);
    expect(lidTop.y).toBe(0);
    expect(lidTop.z).toBeCloseTo(0, 12);
    expect(atMid.x).toBeCloseTo(primitiveMid.x, 12);
    expect(atMid.y).toBe(0);
    expect(atMid.z).toBeCloseTo(primitiveMid.z, 12);
  });

  it("createRotationField reads only storm.rotation", () => {
    const cloned = structuredClone(DEMO_SCENARIO);
    cloned.storm.updraft.centerX = 800;
    cloned.storm.updraft.sigma = 50;
    cloned.storm.updraft.baseHeight = 0;
    cloned.storm.updraft.topHeight = 4000;
    cloned.storm.lowerRadialInflow.centerX = -400;
    cloned.storm.lowerRadialInflow.sigma = 50;
    cloned.storm.lowerRadialInflow.baseHeight = -200;
    cloned.storm.lowerRadialInflow.topHeight = 4000;
    cloned.storm.upperRadialOutflow.centerX = 400;
    cloned.storm.upperRadialOutflow.sigma = 50;
    cloned.storm.upperRadialOutflow.baseHeight = 0;
    cloned.storm.upperRadialOutflow.topHeight = 4000;

    const original = createRotationField(DEMO_SCENARIO);
    const mutated = createRotationField(cloned);
    const samplePoint = { x: 600, y: rotationYMid, z: 0 };
    const originalV = original.sample(samplePoint, 0);
    const mutatedV = mutated.sample(samplePoint, 0);

    expect(mutatedV).toEqual(originalV);
    expect(mutatedV.z).toBeLessThan(0);
    const atUpdraftCenter = mutated.sample({ x: 800, y: rotationYMid, z: 0 }, 0);
    expect(atUpdraftCenter.z).not.toBe(0);
    expect(atUpdraftCenter.z).toBeCloseTo(
      original.sample({ x: 800, y: rotationYMid, z: 0 }, 0).z,
      12,
    );
    expect(createRotationFieldSrc).not.toMatch(/storm\.updraft/);
    expect(createRotationFieldSrc).not.toMatch(/storm\.lowerRadialInflow/);
    expect(createRotationFieldSrc).not.toMatch(/storm\.upperRadialOutflow/);
    expect(createRotationFieldSrc).not.toMatch(/storm\.downdraft/);
  });

  it("createLowerRadialInflowField maps DEMO DTO (axis rest; plateau peak |V|)", () => {
    const inflow = createLowerRadialInflowField(DEMO_SCENARIO);
    const plateauY = 1000;
    const taperY = 3000;
    const topY = inflowDto.topHeight;
    const onPlateauAxis = inflow.sample(
      { x: inflowDto.centerX, y: plateauY, z: inflowDto.centerZ },
      0,
    );
    const onTaperAxis = inflow.sample(
      { x: inflowDto.centerX, y: taperY, z: inflowDto.centerZ },
      0,
    );
    const onTopAxis = inflow.sample(
      { x: inflowDto.centerX, y: topY, z: inflowDto.centerZ },
      0,
    );
    const atPlateauPeak = inflow.sample(
      {
        x: inflowDto.centerX + inflowDto.sigma,
        y: plateauY,
        z: inflowDto.centerZ,
      },
      0,
    );
    const expectedPeak =
      (inflowDto.radialStrainRate * inflowDto.sigma) / Math.sqrt(Math.E);

    expect(inflowDto.centerX).toBe(0);
    expect(inflowDto.centerZ).toBe(0);
    expect(inflowDto.radialStrainRate).toBe(0.00125);
    expect(inflowDto.sigma).toBe(4000);
    expect(inflowDto.baseHeight).toBe(1500);
    expect(inflowDto.topHeight).toBe(4500);
    expect(envelopeGIn(1000)).toBe(1);
    expect(envelopeGIn(3000)).toBeCloseTo(Math.SQRT2 / 2, 12);
    expect(onPlateauAxis).toEqual({ x: 0, y: 0, z: 0 });
    expect(onTaperAxis).toEqual({ x: 0, y: 0, z: 0 });
    expect(onTopAxis).toEqual({ x: 0, y: 0, z: 0 });
    expect(hypotHorizontal(atPlateauPeak)).toBeCloseTo(expectedPeak, 12);
    expect(atPlateauPeak.y).toBe(0);
  });

  it("createLowerRadialInflowField reads only storm.lowerRadialInflow", () => {
    const cloned = structuredClone(DEMO_SCENARIO);
    cloned.storm.updraft.centerX = 800;
    cloned.storm.updraft.sigma = 50;
    cloned.storm.updraft.baseHeight = 0;
    cloned.storm.updraft.topHeight = 4000;
    cloned.storm.rotation.centerX = 999;
    cloned.storm.rotation.sigma = 50;
    cloned.storm.upperRadialOutflow.centerX = 400;
    cloned.storm.upperRadialOutflow.sigma = 50;
    cloned.storm.upperRadialOutflow.baseHeight = 0;
    cloned.storm.upperRadialOutflow.topHeight = 4000;

    const original = createLowerRadialInflowField(DEMO_SCENARIO);
    const mutated = createLowerRadialInflowField(cloned);
    const samplePoint = { x: 600, y: 1000, z: 0 };
    const originalV = original.sample(samplePoint, 0);
    const mutatedV = mutated.sample(samplePoint, 0);

    expect(mutatedV).toEqual(originalV);
    expect(mutatedV.x).toBeLessThan(0);
    const atUpdraftCenter = mutated.sample({ x: 800, y: 1000, z: 0 }, 0);
    expect(atUpdraftCenter.x).not.toBe(0);
    expect(atUpdraftCenter.x).toBeCloseTo(
      original.sample({ x: 800, y: 1000, z: 0 }, 0).x,
      12,
    );
  });

  it("createUpperRadialOutflowField maps DEMO DTO to UpperRadialOutflowField", () => {
    const outflow = createUpperRadialOutflowField(DEMO_SCENARIO);
    const atMidAxis = outflow.sample(
      { x: outflowDto.centerX, y: outflowYMid, z: outflowDto.centerZ },
      0,
    );
    const atBaseAxis = outflow.sample(
      {
        x: outflowDto.centerX,
        y: outflowDto.baseHeight,
        z: outflowDto.centerZ,
      },
      0,
    );
    const atTopAxis = outflow.sample(
      {
        x: outflowDto.centerX,
        y: outflowDto.topHeight,
        z: outflowDto.centerZ,
      },
      0,
    );
    const atMidPeak = outflow.sample(
      {
        x: outflowDto.centerX + outflowDto.sigma,
        y: outflowYMid,
        z: outflowDto.centerZ,
      },
      0,
    );
    const atSeedHeight = outflow.sample(
      { x: outflowDto.centerX + 600, y: 1000, z: outflowDto.centerZ },
      0,
    );
    const atTopOffAxis = outflow.sample(
      {
        x: outflowDto.centerX + 600,
        y: outflowDto.topHeight,
        z: outflowDto.centerZ,
      },
      0,
    );
    const expectedPeak =
      (outflowDto.outflowStrainRate * outflowDto.sigma) / Math.sqrt(Math.E);

    expect(outflowDto.centerX).toBe(0);
    expect(outflowDto.centerZ).toBe(0);
    expect(outflowDto.outflowStrainRate).toBe(0.0025);
    expect(outflowDto.sigma).toBe(4000);
    expect(outflowDto.baseHeight).toBe(5000);
    expect(outflowDto.topHeight).toBe(9000);
    expect(outflowYMid).toBe(7000);
    expect(atMidAxis).toEqual({ x: 0, y: 0, z: 0 });
    expect(atBaseAxis).toEqual({ x: 0, y: 0, z: 0 });
    expect(atTopAxis.x).toBeCloseTo(0, 12);
    expect(atTopAxis.y).toBe(0);
    expect(atTopAxis.z).toBeCloseTo(0, 12);
    expect(Math.hypot(atMidPeak.x, atMidPeak.z)).toBeCloseTo(expectedPeak, 12);
    expect(atSeedHeight.x).toBeCloseTo(0, 12);
    expect(atSeedHeight.y).toBe(0);
    expect(atSeedHeight.z).toBeCloseTo(0, 12);
    expect(atTopOffAxis.x).toBeCloseTo(0, 12);
    expect(atTopOffAxis.z).toBeCloseTo(0, 12);
  });

  it("createUpperRadialOutflowField reads only storm.upperRadialOutflow", () => {
    const cloned = structuredClone(DEMO_SCENARIO);
    cloned.storm.updraft.centerX = 800;
    cloned.storm.updraft.sigma = 50;
    cloned.storm.updraft.baseHeight = 0;
    cloned.storm.updraft.topHeight = 4000;
    cloned.storm.rotation.centerX = 999;
    cloned.storm.rotation.sigma = 50;
    cloned.storm.lowerRadialInflow.centerX = -400;
    cloned.storm.lowerRadialInflow.sigma = 50;
    cloned.storm.lowerRadialInflow.baseHeight = -200;
    cloned.storm.lowerRadialInflow.topHeight = 4000;

    const original = createUpperRadialOutflowField(DEMO_SCENARIO);
    const mutated = createUpperRadialOutflowField(cloned);
    const samplePoint = { x: 600, y: outflowYMid, z: 0 };
    const originalV = original.sample(samplePoint, 0);
    const mutatedV = mutated.sample(samplePoint, 0);

    expect(mutatedV).toEqual(originalV);
    expect(mutatedV.x).toBeGreaterThan(0);
    const atUpdraftCenter = mutated.sample({ x: 800, y: outflowYMid, z: 0 }, 0);
    expect(atUpdraftCenter.x).not.toBe(0);
    expect(atUpdraftCenter.x).toBeCloseTo(
      original.sample({ x: 800, y: outflowYMid, z: 0 }, 0).x,
      12,
    );
  });

  it("DEMO chimney centers/sigma coincide; downdraft is an independent occupant", () => {
    expect(outflowDto.centerX).toBe(updraftDto.centerX);
    expect(outflowDto.centerZ).toBe(updraftDto.centerZ);
    expect(outflowDto.sigma).toBe(updraftDto.sigma);
    expect(outflowDto.centerX).toBe(inflowDto.centerX);
    expect(outflowDto.sigma).toBe(inflowDto.sigma);
    expect(DEMO_SCENARIO.storm.downdraft.centerX).not.toBe(updraftDto.centerX);
    expect(DEMO_SCENARIO.storm.downdraft.sigma).not.toBe(updraftDto.sigma);
    expect(inflowDto.baseHeight).not.toBe(updraftDto.baseHeight);
    expect(inflowDto.topHeight).not.toBe(outflowDto.topHeight);
    expect(createLowerRadialInflowFieldSrc).not.toMatch(/storm\.updraft/);
    expect(createLowerRadialInflowFieldSrc).not.toMatch(/storm\.rotation/);
    expect(createLowerRadialInflowFieldSrc).not.toMatch(
      /storm\.upperRadialOutflow/,
    );
    expect(createUpperRadialOutflowFieldSrc).not.toMatch(/storm\.updraft/);
    expect(createUpperRadialOutflowFieldSrc).not.toMatch(
      /storm\.lowerRadialInflow/,
    );
    expect(createUpperRadialOutflowFieldSrc).not.toMatch(/storm\.rotation/);
    expect(createDowndraftFieldSrc).not.toMatch(/storm\.updraft/);
    expect(createDowndraftFieldSrc).not.toMatch(/storm\.rotation/);
    expect(createDowndraftFieldSrc).not.toMatch(/storm\.lowerRadialInflow/);
    expect(createDowndraftFieldSrc).not.toMatch(/storm\.upperRadialOutflow/);
    expect(createDowndraftFieldSrc).not.toMatch(/storm\.nearGroundOutflow/);
    expect(createNearGroundRadialOutflowFieldSrc).not.toMatch(/storm\.updraft/);
    expect(createNearGroundRadialOutflowFieldSrc).not.toMatch(/storm\.downdraft/);
    expect(createNearGroundRadialOutflowFieldSrc).not.toMatch(
      /storm\.lowerRadialInflow/,
    );
    expect(createNearGroundRadialOutflowFieldSrc).not.toMatch(
      /storm\.upperRadialOutflow/,
    );
    expect(DEMO_SCENARIO.storm.nearGroundOutflow.centerX).not.toBe(
      updraftDto.centerX,
    );
    expect(DEMO_SCENARIO.storm.nearGroundOutflow.centerX).not.toBe(
      DEMO_SCENARIO.storm.downdraft.centerX,
    );
    expect(DEMO_SCENARIO.storm.nearGroundOutflow.sigma).not.toBe(updraftDto.sigma);
    expect(DEMO_SCENARIO.storm.nearGroundOutflow.sigma).not.toBe(
      DEMO_SCENARIO.storm.downdraft.sigma,
    );
    expect(createRotationFieldSrc).not.toMatch(/storm\.updraft/);
    expect(rotationDto.baseHeight).not.toBe(updraftDto.topHeight);
    expect(rotationDto.topHeight).not.toBe(updraftDto.topHeight);
    expect(rotationDto.topHeight).not.toBe(outflowDto.topHeight);
  });

  it("demo composition matches the seven-operand sample sum", () => {
    const {
      environmentField,
      updraftField,
      rotationField,
      lowerRadialInflowField,
      upperRadialOutflowField,
      downdraftField,
      nearGroundOutflowField,
      operands,
      composite,
    } = demoFields();
    const points = [
      seeds[0]!,
      seeds[1]!,
      seeds[2]!,
      { x: 600, y: -50, z: 0 },
      { x: 600, y: 0, z: 0 },
      { x: 600, y: 1500, z: 0 },
      { x: 500, y: 2000, z: -200 },
      { x: 200, y: 3250, z: -100 },
      { x: 200, y: 4000, z: -100 },
      { x: 200, y: 4500, z: -100 },
      { x: 200, y: 4750, z: -100 },
      { x: 200, y: 5000, z: -100 },
      { x: 200, y: 6000, z: -100 },
      { x: 200, y: 6500, z: -100 },
      { x: 200, y: 7000, z: -100 },
      { x: 200, y: 8000, z: -100 },
      { x: 200, y: 9000, z: -100 },
      { x: 200, y: 12000, z: -100 },
      { x: 200, y: inflowDto.topHeight, z: -100 },
      { x: 200, y: outflowDto.topHeight + 100, z: -100 },
    ];

    expect(operands).toHaveLength(7);

    for (const position of points) {
      const envV = environmentField.sample(position, 0);
      const upV = updraftField.sample(position, 0);
      const rotV = rotationField.sample(position, 0);
      const inV = lowerRadialInflowField.sample(position, 0);
      const outV = upperRadialOutflowField.sample(position, 0);
      const downV = downdraftField.sample(position, 0);
      const ngV = nearGroundOutflowField.sample(position, 0);
      const total = composite.sample(position, 0);

      expect(total.x).toBeCloseTo(
        envV.x + upV.x + rotV.x + inV.x + outV.x + downV.x + ngV.x,
        12,
      );
      expect(total.y).toBeCloseTo(
        envV.y + upV.y + rotV.y + inV.y + outV.y + downV.y + ngV.y,
        12,
      );
      expect(total.z).toBeCloseTo(
        envV.z + upV.z + rotV.z + inV.z + outV.z + downV.z + ngV.z,
        12,
      );
    }
  });

  it("plateau lower inflow matches RadialInflowField with equal radial params", () => {
    const lower = createLowerRadialInflowField(DEMO_SCENARIO);
    const primitive = new RadialInflowField({
      centerX: inflowDto.centerX,
      centerZ: inflowDto.centerZ,
      radialStrainRate: inflowDto.radialStrainRate,
      sigma: inflowDto.sigma,
    });
    const points = [
      { x: 600, y: 0, z: 0 },
      { x: 600, y: 500, z: 0 },
      { x: 600, y: 1000, z: 0 },
      { x: 0, y: 250, z: -400 },
      { x: 600, y: inflowDto.baseHeight, z: 0 },
    ];

    for (const position of points) {
      const lowerV = lower.sample(position, 0);
      const primitiveV = primitive.sample(position, 0);
      expect(lowerV.x).toBeCloseTo(primitiveV.x, 12);
      expect(lowerV.y).toBeCloseTo(primitiveV.y, 12);
      expect(lowerV.z).toBeCloseTo(primitiveV.z, 12);
    }
  });

  it("seed-height inflow matches the plateau because G_in(1000) = 1", () => {
    const inflow = createLowerRadialInflowField(DEMO_SCENARIO);
    const plateau = { x: 600, y: 500, z: 0 };
    const seedHeight = { x: 600, y: 1000, z: 0 };
    const plateauV = inflow.sample(plateau, 0);
    const seedV = inflow.sample(seedHeight, 0);

    expect(envelopeGIn(1000)).toBe(1);
    expect(hypotHorizontal(seedV)).toBeCloseTo(hypotHorizontal(plateauV), 12);
  });

  it("taper-height inflow is weaker than plateau by G_in(3000) = √2/2", () => {
    const inflow = createLowerRadialInflowField(DEMO_SCENARIO);
    const plateau = { x: 600, y: 1000, z: 0 };
    const taperMid = { x: 600, y: 3000, z: 0 };
    const plateauV = inflow.sample(plateau, 0);
    const taperV = inflow.sample(taperMid, 0);

    expect(envelopeGIn(3000)).toBeCloseTo(Math.SQRT2 / 2, 12);
    expect(hypotHorizontal(taperV)).toBeCloseTo(
      hypotHorizontal(plateauV) * Math.SQRT2 / 2,
      12,
    );
    expect(hypotHorizontal(taperV)).toBeLessThan(hypotHorizontal(plateauV));
  });

  it("lower inflow is exactly zero at and above topHeight", () => {
    const inflow = createLowerRadialInflowField(DEMO_SCENARIO);
    const points = [
      { x: 0, y: 4500, z: 0 },
      { x: 600, y: 4500, z: 0 },
      { x: 0, y: 4750, z: -600 },
      { x: 600, y: 5000, z: 0 },
      { x: 200, y: 8000, z: -100 },
      { x: 200, y: 9000, z: -100 },
    ];

    for (const position of points) {
      expect(inflow.sample(position, 0)).toEqual({ x: 0, y: 0, z: 0 });
    }
  });

  it("radial-quiet gap 4500–5000 has neither lower inflow nor upper outflow", () => {
    const { lowerRadialInflowField, upperRadialOutflowField } = demoFields();
    const gapPoints = [
      { x: 600, y: 4500, z: 0 },
      { x: 600, y: 4750, z: 0 },
      { x: 0, y: 4900, z: -600 },
    ];

    for (const position of gapPoints) {
      expect(lowerRadialInflowField.sample(position, 0)).toEqual({
        x: 0,
        y: 0,
        z: 0,
      });
      expect(upperRadialOutflowField.sample(position, 0)).toEqual({
        x: 0,
        y: 0,
        z: 0,
      });
    }
  });

  it("DEMO-fixture storm radial residual is inward at seeds, zero in the gap, outflow-only at 7000", () => {
    const { lowerRadialInflowField, upperRadialOutflowField } = demoFields();
    const eastSeed = { x: 2400, y: 1000, z: 0 };
    const eastGap = { x: 2400, y: 4750, z: 0 };
    const eastOutflowPeak = { x: 2400, y: 7000, z: 0 };

    const inSeed = lowerRadialInflowField.sample(eastSeed, 0);
    const outSeed = upperRadialOutflowField.sample(eastSeed, 0);
    const inGap = lowerRadialInflowField.sample(eastGap, 0);
    const outGap = upperRadialOutflowField.sample(eastGap, 0);
    const inPeak = lowerRadialInflowField.sample(eastOutflowPeak, 0);
    const outPeak = upperRadialOutflowField.sample(eastOutflowPeak, 0);

    expect(envelopeGOut(1000)).toBe(0);
    expect(envelopeGIn(1000)).toBe(1);
    expect(outSeed).toEqual({ x: 0, y: 0, z: 0 });
    expect(inSeed.x + outSeed.x).toBeLessThan(0);

    expect(inGap).toEqual({ x: 0, y: 0, z: 0 });
    expect(outGap).toEqual({ x: 0, y: 0, z: 0 });

    expect(inPeak).toEqual({ x: 0, y: 0, z: 0 });
    expect(outPeak.x).toBeGreaterThan(0);
    expect(envelopeGOut(7000)).toBeCloseTo(1, 12);
  });

  it("axis contribution of lower inflow is zero at every tested height", () => {
    const { lowerRadialInflowField } = demoFields();
    const heights = [
      0, 1000, 1500, 2000, 4000, 4500, 5000, 6000, 7000, 8000, 9000, 12000,
    ];

    for (const y of heights) {
      expect(
        lowerRadialInflowField.sample(
          { x: inflowDto.centerX, y, z: inflowDto.centerZ },
          0,
        ),
      ).toEqual({ x: 0, y: 0, z: 0 });
    }
  });

  it("cardinal east/north inflow signs hold on the plateau and at seed height", () => {
    const inflow = createLowerRadialInflowField(DEMO_SCENARIO);
    const d = 600;
    const plateauY = 500;
    const seedY = 1000;
    const eastPlateau = inflow.sample({ x: d, y: plateauY, z: 0 }, 0);
    const northPlateau = inflow.sample({ x: 0, y: plateauY, z: -d }, 0);
    const eastSeed = inflow.sample({ x: d, y: seedY, z: 0 }, 0);
    const northSeed = inflow.sample({ x: 0, y: seedY, z: -d }, 0);

    expect(eastPlateau.x).toBeLessThan(0);
    expect(eastPlateau.y).toBe(0);
    expect(eastPlateau.z).toBeCloseTo(0, 12);
    expect(northPlateau.x).toBeCloseTo(0, 12);
    expect(northPlateau.y).toBe(0);
    expect(northPlateau.z).toBeGreaterThan(0);

    expect(eastSeed.x).toBeLessThan(0);
    expect(eastSeed.y).toBe(0);
    expect(eastSeed.z).toBeCloseTo(0, 12);
    expect(northSeed.x).toBeCloseTo(0, 12);
    expect(northSeed.y).toBe(0);
    expect(northSeed.z).toBeGreaterThan(0);

    expect(eastSeed.x).toBeCloseTo(eastPlateau.x, 12);
    expect(northSeed.z).toBeCloseTo(northPlateau.z, 12);
  });

  it("axis seed has env horizontal wind, Vy = W0 F(seed.y) plus far-field downdraft, and zero rotation, inflow, and outflow", () => {
    const {
      environmentField,
      updraftField,
      rotationField,
      lowerRadialInflowField,
      upperRadialOutflowField,
      downdraftField,
      composite,
    } = demoFields();
    const axis = seeds[0]!;
    const envV = environmentField.sample(axis, 0);
    const upV = updraftField.sample(axis, 0);
    const rotV = rotationField.sample(axis, 0);
    const inV = lowerRadialInflowField.sample(axis, 0);
    const outV = upperRadialOutflowField.sample(axis, 0);
    const downV = downdraftField.sample(axis, 0);
    const total = composite.sample(axis, 0);
    const expectedVy = expectedUpdraftVy(0, axis.y);

    expect(axis).toEqual({ x: 0, y: 1000, z: 0 });
    expect(envelopeGOut(axis.y)).toBe(0);
    expect(envelopeGIn(axis.y)).toBe(1);
    expect(envelopeF(axis.y)).toBeCloseTo(fUpdraftSeed, 12);
    expect(rotV).toEqual({ x: 0, y: 0, z: 0 });
    expect(inV).toEqual({ x: 0, y: 0, z: 0 });
    expect(outV).toEqual({ x: 0, y: 0, z: 0 });
    expect(downV.x).toBe(0);
    expect(downV.z).toBe(0);
    expect(downV.y).toBeLessThan(0);
    expect(total.x).toBe(envV.x);
    expect(total.z).toBe(envV.z);
    expect(envV.y).toBe(0);
    expect(upV.y).toBeCloseTo(
      updraftDto.peakVerticalVelocity * fUpdraftSeed,
      12,
    );
    expect(total.y).toBe(upV.y + downV.y);
    expect(upV.y).not.toBe(updraftDto.peakVerticalVelocity);
    expect(total.y).toBeCloseTo(expectedVy + downV.y, 12);
  });

  it("east seed: inflow Vx only at full plateau G_in = 1, rotation Vz only, outflow 0", () => {
    const {
      environmentField,
      updraftField,
      rotationField,
      lowerRadialInflowField,
      upperRadialOutflowField,
      downdraftField,
      composite,
    } = demoFields();
    const east = seeds[1]!;
    const envV = environmentField.sample(east, 0);
    const upV = updraftField.sample(east, 0);
    const rotV = rotationField.sample(east, 0);
    const inV = lowerRadialInflowField.sample(east, 0);
    const outV = upperRadialOutflowField.sample(east, 0);
    const downV = downdraftField.sample(east, 0);
    const total = composite.sample(east, 0);
    const plateauEast = lowerRadialInflowField.sample(
      { x: east.x, y: 500, z: east.z },
      0,
    );

    expect(east).toEqual({ x: 2400, y: 1000, z: 0 });
    expect(envelopeGOut(east.y)).toBe(0);
    expect(rotV.x).toBe(0);
    expect(rotV.y).toBe(0);
    expect(rotV.z).not.toBe(0);
    expect(inV.x).toBeLessThan(0);
    expect(inV.y).toBe(0);
    expect(inV.z).toBe(0);
    expect(inV.x).toBeCloseTo(plateauEast.x, 12);
    expect(outV).toEqual({ x: 0, y: 0, z: 0 });
    expect(total.x).toBeCloseTo(envV.x + inV.x, 12);
    expect(total.z).toBeCloseTo(envV.z + rotV.z, 12);
    expect(upV.x).toBe(0);
    expect(upV.z).toBe(0);
    expect(downV.x).toBe(0);
    expect(downV.z).toBe(0);
    expect(downV.y).toBeLessThan(0);
    expect(total.y).toBe(upV.y + downV.y);
    expect(upV.y).toBeCloseTo(expectedUpdraftVy(east.x, east.y), 12);
  });

  it("north seed: inflow Vz only at full plateau G_in = 1, rotation Vx only, outflow 0", () => {
    const {
      environmentField,
      updraftField,
      rotationField,
      lowerRadialInflowField,
      upperRadialOutflowField,
      downdraftField,
      composite,
    } = demoFields();
    const north = seeds[2]!;
    const envV = environmentField.sample(north, 0);
    const upV = updraftField.sample(north, 0);
    const rotV = rotationField.sample(north, 0);
    const inV = lowerRadialInflowField.sample(north, 0);
    const outV = upperRadialOutflowField.sample(north, 0);
    const downV = downdraftField.sample(north, 0);
    const total = composite.sample(north, 0);
    const plateauNorth = lowerRadialInflowField.sample(
      { x: north.x, y: 500, z: north.z },
      0,
    );

    expect(north).toEqual({ x: 0, y: 1000, z: -2400 });
    expect(envelopeGOut(north.y)).toBe(0);
    expect(rotV.z).toBe(0);
    expect(rotV.y).toBe(0);
    expect(rotV.x).not.toBe(0);
    expect(inV.z).toBeGreaterThan(0);
    expect(inV.y).toBe(0);
    expect(inV.x).toBe(0);
    expect(inV.z).toBeCloseTo(plateauNorth.z, 12);
    expect(outV).toEqual({ x: 0, y: 0, z: 0 });
    expect(total.z).toBeCloseTo(envV.z + inV.z, 12);
    expect(total.x).toBeCloseTo(envV.x + rotV.x, 12);
    expect(upV.x).toBe(0);
    expect(upV.z).toBe(0);
    expect(downV.x).toBe(0);
    expect(downV.z).toBe(0);
    expect(downV.y).toBeLessThan(0);
    expect(total.y).toBe(upV.y + downV.y);
    expect(upV.y).toBeCloseTo(
      expectedUpdraftVy(Math.hypot(north.x, north.z), north.y),
      12,
    );
  });

  it("rotation contribution is zero below and above the layer", () => {
    const { rotationField } = demoFields();
    const exterior = [
      { x: 600, y: -50, z: 0 },
      { x: 600, y: 8000, z: 0 },
      { x: 600, y: 9000, z: 0 },
      { x: 200, y: 12000, z: -100 },
    ];

    for (const position of exterior) {
      expect(envelopeGRot(position.y)).toBe(0);
      expect(rotationField.sample(position, 0)).toEqual({ x: 0, y: 0, z: 0 });
    }
  });

  it("rotation is zero on lids and max at y_mid = 3250", () => {
    const { rotationField } = demoFields();
    const offAxis = { x: 600, z: 0 };
    const atBase = rotationField.sample({ ...offAxis, y: 0 }, 0);
    const atTop = rotationField.sample({ ...offAxis, y: 6500 }, 0);
    const atMid = rotationField.sample({ ...offAxis, y: 3250 }, 0);
    const atSeed = rotationField.sample({ ...offAxis, y: 1000 }, 0);
    const atUpdraftPeak = rotationField.sample({ ...offAxis, y: 4000 }, 0);
    const atSigmaMid = rotationField.sample(
      { x: rotationDto.centerX + rotationDto.sigma, y: 3250, z: rotationDto.centerZ },
      0,
    );
    const expectedPeak =
      (Math.abs(rotationDto.angularVelocity) * rotationDto.sigma) /
      Math.sqrt(Math.E);

    expect(atBase.x).toBeCloseTo(0, 12);
    expect(atBase.y).toBe(0);
    expect(atBase.z).toBeCloseTo(0, 12);
    expect(atTop.x).toBeCloseTo(0, 12);
    expect(atTop.y).toBe(0);
    expect(atTop.z).toBeCloseTo(0, 12);
    expect(hypotHorizontal(atMid)).toBeGreaterThan(hypotHorizontal(atSeed));
    expect(hypotHorizontal(atMid)).toBeGreaterThan(
      hypotHorizontal(atUpdraftPeak),
    );
    expect(hypotHorizontal(atSigmaMid)).toBeCloseTo(expectedPeak, 12);
    expect(atSigmaMid.y).toBe(0);
  });

  it("cardinal east/north rotation at y = 3250 has the expected world signs", () => {
    const { rotationField } = demoFields();
    const d = 600;
    const east = rotationField.sample({ x: d, y: 3250, z: 0 }, 0);
    const north = rotationField.sample({ x: 0, y: 3250, z: -d }, 0);

    expect(east.x).toBeCloseTo(0, 12);
    expect(east.y).toBe(0);
    expect(east.z).toBeLessThan(0);
    expect(north.x).toBeLessThan(0);
    expect(north.y).toBe(0);
    expect(north.z).toBeCloseTo(0, 12);
  });

  it("seed-height rotation is scaled by G_rot(1000) = sin(π/6.5), not full Ω r E", () => {
    const { rotationField } = demoFields();
    const eastMid = rotationField.sample({ x: 600, y: 3250, z: 0 }, 0);
    const eastSeed = rotationField.sample({ x: 600, y: 1000, z: 0 }, 0);
    const fullStrength =
      rotationDto.angularVelocity *
      600 *
      radialEnvelope(600, rotationDto.sigma);

    expect(envelopeGRot(1000)).toBeCloseTo(gRotSeed, 12);
    expect(envelopeGRot(1000)).not.toBe(1);
    expect(eastSeed.y).toBe(0);
    expect(eastSeed.x).toBeCloseTo(0, 12);
    expect(eastSeed.z).toBeCloseTo(eastMid.z * gRotSeed, 12);
    expect(Math.abs(eastSeed.z)).toBeCloseTo(
      Math.abs(fullStrength) * gRotSeed,
      12,
    );
    expect(Math.abs(eastSeed.z)).toBeLessThan(Math.abs(fullStrength));
  });

  it("axis rotation contribution is zero at seed, y_mid, lids, and exterior", () => {
    const { rotationField } = demoFields();
    const heights = [-50, 0, 1000, 3250, 6500, 8000, 9000, 12000];

    for (const y of heights) {
      expect(
        rotationField.sample(
          { x: rotationDto.centerX, y, z: rotationDto.centerZ },
          0,
        ),
      ).toEqual({ x: 0, y: 0, z: 0 });
    }
  });

  it("outflow is zero below its layer while other fields still sample", () => {
    const {
      environmentField,
      rotationField,
      lowerRadialInflowField,
      upperRadialOutflowField,
    } = demoFields();
    const below = { x: 600, y: 500, z: 0 };
    const outV = upperRadialOutflowField.sample(below, 0);
    const envV = environmentField.sample(below, 0);
    const rotV = rotationField.sample(below, 0);
    const inV = lowerRadialInflowField.sample(below, 0);

    expect(outV).toEqual({ x: 0, y: 0, z: 0 });
    expect(envV.x).not.toBe(0);
    expect(rotV.z).not.toBe(0);
    expect(inV.x).toBeLessThan(0);
  });

  it("outflow is exactly zero at and above topHeight and below baseHeight", () => {
    const { upperRadialOutflowField } = demoFields();
    const exactZero = [
      { x: 600, y: 4000, z: 0 },
      { x: 600, y: 9100, z: 0 },
      { x: 200, y: 12000, z: -100 },
    ];
    const lids = [
      { x: 600, y: 5000, z: 0 },
      { x: 600, y: 9000, z: 0 },
    ];

    for (const position of exactZero) {
      expect(upperRadialOutflowField.sample(position, 0)).toEqual({
        x: 0,
        y: 0,
        z: 0,
      });
    }
    for (const position of lids) {
      const v = upperRadialOutflowField.sample(position, 0);
      expect(v.x).toBeCloseTo(0, 12);
      expect(v.y).toBe(0);
      expect(v.z).toBeCloseTo(0, 12);
    }
  });

  it("env knots 2000 and 6000 are not storm-envelope lids", () => {
    const { updraftField, lowerRadialInflowField, upperRadialOutflowField } =
      demoFields();
    const east2000 = { x: 600, y: 2000, z: 0 };
    const east6000 = { x: 600, y: 6000, z: 0 };

    expect(updraftField.sample(east2000, 0).y).toBeGreaterThan(0);
    expect(lowerRadialInflowField.sample(east2000, 0).x).toBeLessThan(0);
    expect(upperRadialOutflowField.sample(east2000, 0)).toEqual({
      x: 0,
      y: 0,
      z: 0,
    });

    expect(updraftField.sample(east6000, 0).y).toBeGreaterThan(0);
    expect(lowerRadialInflowField.sample(east6000, 0)).toEqual({
      x: 0,
      y: 0,
      z: 0,
    });
    expect(upperRadialOutflowField.sample(east6000, 0).x).toBeGreaterThan(0);
  });

  it("outflow is radially outward off-axis at y_mid and zero on the axis at every tested height", () => {
    const { upperRadialOutflowField } = demoFields();
    const eastMid = { x: 600, y: outflowYMid, z: 0 };
    const outEast = upperRadialOutflowField.sample(eastMid, 0);
    const heights = [1000, 4000, 5000, 7000, 8000, 9000, 12000];

    expect(outEast.y).toBe(0);
    expect(600 * outEast.x + 0 * outEast.z).toBeGreaterThan(0);

    for (const y of heights) {
      const onAxis = upperRadialOutflowField.sample({ x: 0, y, z: 0 }, 0);
      expect(onAxis).toEqual({ x: 0, y: 0, z: 0 });
    }
  });

  it("cardinal east/north outflow at y = 7000 has the expected world signs", () => {
    const { upperRadialOutflowField } = demoFields();
    const d = 600;
    const east = upperRadialOutflowField.sample({ x: d, y: 7000, z: 0 }, 0);
    const north = upperRadialOutflowField.sample({ x: 0, y: 7000, z: -d }, 0);

    expect(east.x).toBeGreaterThan(0);
    expect(east.y).toBe(0);
    expect(east.z).toBeCloseTo(0, 12);
    expect(north.x).toBeCloseTo(0, 12);
    expect(north.y).toBe(0);
    expect(north.z).toBeLessThan(0);
  });

  it("envelope Vy differs at two interior axis heights and peaks at 4000", () => {
    const { updraftField } = demoFields();
    const lower = updraftField.sample({ x: 0, y: 1000, z: 0 }, 0);
    const mid = updraftField.sample({ x: 0, y: 4000, z: 0 }, 0);

    expect(lower.y).toBeCloseTo(expectedUpdraftVy(0, 1000), 12);
    expect(mid.y).toBeCloseTo(expectedUpdraftVy(0, 4000), 12);
    expect(mid.y).toBe(updraftDto.peakVerticalVelocity);
    expect(lower.y).not.toBe(mid.y);
    expect(lower.y).toBeGreaterThan(0);
    expect(mid.y).toBeGreaterThan(lower.y);
  });

  it("updraft is zero below base and above top while other fields still sample", () => {
    const {
      environmentField,
      updraftField,
      rotationField,
      lowerRadialInflowField,
      upperRadialOutflowField,
      composite,
    } = demoFields();
    const below = { x: 600, y: updraftDto.baseHeight - 50, z: 0 };
    const aboveUpdraft = { x: 600, y: updraftDto.topHeight + 50, z: 0 };
    const aboveOutflow = { x: 600, y: outflowDto.topHeight + 50, z: 0 };

    const upBelow = updraftField.sample(below, 0);
    const upAbove = updraftField.sample(aboveUpdraft, 0);
    expect(upBelow).toEqual({ x: 0, y: 0, z: 0 });
    expect(upAbove).toEqual({ x: 0, y: 0, z: 0 });
    expect(upperRadialOutflowField.sample(below, 0)).toEqual({
      x: 0,
      y: 0,
      z: 0,
    });
    expect(lowerRadialInflowField.sample(aboveUpdraft, 0)).toEqual({
      x: 0,
      y: 0,
      z: 0,
    });
    const outAboveUpdraft = upperRadialOutflowField.sample(aboveUpdraft, 0);
    expect(outAboveUpdraft.x).toBeGreaterThan(0);
    expect(outAboveUpdraft.y).toBe(0);
    expect(upperRadialOutflowField.sample(aboveOutflow, 0)).toEqual({
      x: 0,
      y: 0,
      z: 0,
    });

    const envBelow = environmentField.sample(below, 0);
    const rotBelow = rotationField.sample(below, 0);
    const inBelow = lowerRadialInflowField.sample(below, 0);
    expect(envBelow.x).not.toBe(0);
    expect(rotBelow).toEqual({ x: 0, y: 0, z: 0 });
    expect(inBelow.x).toBeLessThan(0);

    const totalAboveOutflow = composite.sample(aboveOutflow, 0);
    const envAboveOutflow = environmentField.sample(aboveOutflow, 0);
    const rotAboveOutflow = rotationField.sample(aboveOutflow, 0);
    expect(rotAboveOutflow).toEqual({ x: 0, y: 0, z: 0 });
    expect(totalAboveOutflow.y).toBe(0);
    expect(totalAboveOutflow.x).toBeCloseTo(envAboveOutflow.x, 12);
    expect(totalAboveOutflow.z).toBeCloseTo(envAboveOutflow.z, 12);
  });

  it("factory updraft is height-dependent and composeDemo uses the seven-operand factory chain", () => {
    const { updraftField, downdraftField, composite } = demoFields();
    const atGround = updraftField.sample({ x: 0, y: 0, z: 0 }, 0);
    const atSeed = updraftField.sample({ x: 0, y: 1000, z: 0 }, 0);
    const atPeak = updraftField.sample({ x: 0, y: 4000, z: 0 }, 0);
    const totalGround = composite.sample({ x: 0, y: 0, z: 0 }, 0);
    const totalSeed = composite.sample({ x: 0, y: 1000, z: 0 }, 0);
    const composed = composeDemoTracerSimulation();
    const composedMid = composed.particles[0]!;

    expect(atGround.y).not.toBe(updraftDto.peakVerticalVelocity);
    expect(atGround.y).toBeCloseTo(0, 12);
    expect(totalGround.y).toBeCloseTo(
      downdraftField.sample({ x: 0, y: 0, z: 0 }, 0).y,
      12,
    );
    expect(atSeed.y).toBeCloseTo(
      updraftDto.peakVerticalVelocity * fUpdraftSeed,
      12,
    );
    expect(atSeed.y).not.toBe(updraftDto.peakVerticalVelocity);
    expect(totalSeed.y).toBeCloseTo(
      atSeed.y + downdraftField.sample({ x: 0, y: 1000, z: 0 }, 0).y,
      12,
    );
    expect(atPeak.y).toBe(updraftDto.peakVerticalVelocity);
    expect(composedMid.position).toEqual({ x: 0, y: 1000, z: 0 });
    expect(composeDemoTracerSimulationSrc).toMatch(/createUpdraftField/);
    expect(composeDemoTracerSimulationSrc).toMatch(
      /createLowerRadialInflowField/,
    );
    expect(composeDemoTracerSimulationSrc).toMatch(
      /createUpperRadialOutflowField/,
    );
    expect(composeDemoTracerSimulationSrc).toMatch(/createDowndraftField/);
    expect(composeDemoTracerSimulationSrc).toMatch(
      /createNearGroundRadialOutflowField/,
    );
    expect(composeDemoTracerSimulationSrc).not.toMatch(
      /from ["'][^"']*\/UpdraftField\.js["']/,
    );
    expect(composeDemoTracerSimulationSrc).not.toMatch(/createRadialInflowField/);
    expect(composeDemoTracerSimulationSrc).not.toMatch(
      /from ["'][^"']*\/RadialInflowField\.js["']/,
    );
    expect(composeDemoTracerSimulationSrc).not.toMatch(
      /from ["'][^"']*\/RotationField\.js["']/,
    );
    expect(composeDemoTracerSimulationSrc).toMatch(
      /new CompositeVelocityField\(\[\s*environmentField,\s*updraftField,\s*rotationField,\s*lowerRadialInflowField,\s*upperRadialOutflowField,\s*downdraftField,\s*nearGroundOutflowField,\s*\]\)/,
    );
  });

  it("after fixed steps near-axis y rises and horizontal drift is nonzero", () => {
    const simulation = composeDemoTracerSimulation();
    const nearAxis = simulation.particles[0]!;
    const y0 = nearAxis.position.y;

    for (let i = 0; i < 50; i++) {
      simulation.step(dt);
    }

    expect(nearAxis.position.y).toBeGreaterThan(y0);
    expect(nearAxis.position.y).toBeLessThan(updraftDto.topHeight);
    const horizontalDrift = Math.hypot(
      nearAxis.position.x - seeds[0]!.x,
      nearAxis.position.z - seeds[0]!.z,
    );
    expect(horizontalDrift).toBeGreaterThan(0);
  });

  it("Reset restores seed positions and clock time", () => {
    const simulation = composeDemoTracerSimulation();
    const seedsSnapshot = structuredClone(seeds);

    for (let i = 0; i < 40; i++) {
      simulation.step(dt);
    }

    expect(simulation.clock.time).toBeGreaterThan(0);

    resetTracersFromSeeds(simulation, seeds);

    expect(simulation.clock.time).toBe(0);
    expect(simulation.particles[0]).toEqual({
      position: { x: 0, y: 1000, z: 0 },
      age: 0,
      active: true,
    });
    expect(simulation.particles[1]).toEqual({
      position: { x: 2400, y: 1000, z: 0 },
      age: 0,
      active: true,
    });
    expect(simulation.particles[2]).toEqual({
      position: { x: 0, y: 1000, z: -2400 },
      age: 0,
      active: true,
    });
    expect(DEMO_SCENARIO.simulation.diagnosticSeeds).toEqual(seedsSnapshot);
  });

  it("hodograph points ignore updraft, rotation, lower inflow, outflow, downdraft, near-ground outflow, and composite", () => {
    const fromFixture = createDemoHodographPoints();
    const fromProfileOnly = hodographPoints(
      createEnvironmentalWindProfile(DEMO_SCENARIO),
    );

    expect(fromFixture).toEqual(fromProfileOnly);
    expect(fromFixture.map((point) => point.height)).toEqual([
      0, 1000, 2000, 6000, 12000,
    ]);
    expect(fromFixture).toHaveLength(5);

    const mutated = structuredClone(DEMO_SCENARIO);
    mutated.storm.updraft.peakVerticalVelocity = 99;
    mutated.storm.updraft.sigma = 50;
    mutated.storm.updraft.baseHeight = -100;
    mutated.storm.updraft.topHeight = 4000;
    mutated.storm.rotation.angularVelocity = 0.5;
    mutated.storm.rotation.sigma = 50;
    mutated.storm.rotation.baseHeight = -100;
    mutated.storm.rotation.topHeight = 4000;
    mutated.storm.lowerRadialInflow.radialStrainRate = 0.2;
    mutated.storm.lowerRadialInflow.sigma = 50;
    mutated.storm.lowerRadialInflow.baseHeight = -200;
    mutated.storm.lowerRadialInflow.topHeight = 4000;
    mutated.storm.upperRadialOutflow.outflowStrainRate = 0.4;
    mutated.storm.upperRadialOutflow.sigma = 50;
    mutated.storm.upperRadialOutflow.baseHeight = 0;
    mutated.storm.upperRadialOutflow.topHeight = 5000;
    mutated.storm.downdraft.peakDownwardVelocity = 99;
    mutated.storm.downdraft.sigma = 50;
    mutated.storm.downdraft.centerX = -8000;
    mutated.storm.downdraft.baseHeight = -100;
    mutated.storm.downdraft.topHeight = 4000;
    mutated.storm.nearGroundOutflow.outflowStrainRate = 0.4;
    mutated.storm.nearGroundOutflow.sigma = 50;
    mutated.storm.nearGroundOutflow.centerX = -8000;
    mutated.storm.nearGroundOutflow.baseHeight = -100;
    mutated.storm.nearGroundOutflow.topHeight = 4000;
    const pointsWithMutatedStorm = hodographPoints(
      createEnvironmentalWindProfile(mutated),
    );

    expect(pointsWithMutatedStorm).toEqual(fromFixture);
  });

  it("ScenarioConfig and DEMO_SCENARIO stay physics-import-free without storm.radialInflow", () => {
    expect(scenarioConfigSrc).not.toMatch(/from ["'][^"']*physics/);
    expect(demoScenarioSrc).not.toMatch(/from ["'][^"']*physics/);
    expect(scenarioConfigSrc).toMatch(/lowerRadialInflow/);
    expect(demoScenarioSrc).toMatch(/lowerRadialInflow/);
    expect(scenarioConfigSrc).not.toMatch(/\bradialInflow\b/);
    expect(demoScenarioSrc).not.toMatch(/\bradialInflow\b/);
    expect(createUpdraftFieldSrc).toMatch(
      /from ["']\.\.\/physics\/storm\/VerticalEnvelopeUpdraftField\.js["']/,
    );
    expect(createUpdraftFieldSrc).not.toMatch(
      /from ["'][^"']*\/UpdraftField\.js["']/,
    );
    expect(createLowerRadialInflowFieldSrc).toMatch(
      /from ["']\.\.\/physics\/storm\/LowerRadialInflowField\.js["']/,
    );
    expect(createUpperRadialOutflowFieldSrc).toMatch(
      /from ["']\.\.\/physics\/storm\/UpperRadialOutflowField\.js["']/,
    );
    expect(createRotationFieldSrc).toMatch(
      /from ["']\.\.\/physics\/storm\/VerticalEnvelopeRotationField\.js["']/,
    );
    expect(createRotationFieldSrc).not.toMatch(
      /from ["'][^"']*\/RotationField\.js["']/,
    );
    expect(createDowndraftFieldSrc).toMatch(
      /from ["']\.\.\/physics\/storm\/VerticalEnvelopeDowndraftField\.js["']/,
    );
    expect(createNearGroundRadialOutflowFieldSrc).toMatch(
      /from ["']\.\.\/physics\/storm\/NearGroundRadialOutflowField\.js["']/,
    );
  });
});
