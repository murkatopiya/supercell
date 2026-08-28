import { describe, expect, it } from "vitest";
import composeDemoTracerSimulationSrc from "./composeDemoTracerSimulation.ts?raw";
import {
  composeDemoTracerFields,
  composeDemoTracerSimulation,
  createDemoPathHistory,
} from "./composeDemoTracerSimulation.js";
import { createDemoHodographPoints } from "./demoHodographFixture.js";
import { IntegrationFrame } from "./IntegrationFrame.js";
import { TracerPedagogy } from "./TracerPedagogy.js";
import { hodographPoints } from "../physics/environment/hodograph.js";
import { stormRelativeHelicityBetween } from "../physics/environment/stormRelativeHelicity.js";
import { VerticalEnvelopeDowndraftField } from "../physics/storm/VerticalEnvelopeDowndraftField.js";
import verticalEnvelopeDowndraftSrc from "../physics/storm/VerticalEnvelopeDowndraftField.ts?raw";
import { createDowndraftField } from "../scenario/createDowndraftField.js";
import createDowndraftFieldSrc from "../scenario/createDowndraftField.ts?raw";
import { createEnvironmentalWindProfile } from "../scenario/createEnvironmentalWindProfile.js";
import { DEMO_SCENARIO } from "../scenario/DEMO_SCENARIO.js";

const SIGMA_UP = DEMO_SCENARIO.storm.updraft.sigma;
const DT = DEMO_SCENARIO.simulation.timestep;

describe("DEMO sixth-operand downdraft wiring", () => {
  it("maps storm.downdraft 1:1 and ignores other storm blocks", () => {
    const dto = DEMO_SCENARIO.storm.downdraft;
    expect(dto).toEqual({
      centerX: 5000,
      centerZ: 0,
      peakDownwardVelocity: 20,
      sigma: 2000,
      baseHeight: -400,
      topHeight: 3600,
    });
    expect(dto.sigma).not.toBe(DEMO_SCENARIO.storm.updraft.sigma);
    expect(dto.centerX).not.toBe(DEMO_SCENARIO.storm.updraft.centerX);
    expect(dto.baseHeight).toBeLessThan(0);

    const cloned = structuredClone(DEMO_SCENARIO);
    cloned.storm.updraft.centerX = 800;
    cloned.storm.updraft.sigma = 50;
    cloned.storm.rotation.centerX = 999;
    cloned.storm.lowerRadialInflow.centerX = -400;
    cloned.storm.upperRadialOutflow.centerX = 400;

    const original = createDowndraftField(DEMO_SCENARIO);
    const mutated = createDowndraftField(cloned);
    const axisMid = {
      x: dto.centerX,
      y: (dto.baseHeight + dto.topHeight) / 2,
      z: dto.centerZ,
    };
    expect(mutated.sample(axisMid, 0)).toEqual(original.sample(axisMid, 0));
    expect(createDowndraftFieldSrc).not.toMatch(/storm\.updraft/);
    expect(createDowndraftFieldSrc).not.toMatch(/storm\.rotation/);
    expect(createDowndraftFieldSrc).not.toMatch(/storm\.lowerRadialInflow/);
    expect(createDowndraftFieldSrc).not.toMatch(/storm\.upperRadialOutflow/);
    expect(createDowndraftFieldSrc).not.toMatch(/storm\.nearGroundOutflow/);
  });

  it("samples isolated peak Vy = −D0 at the occupant axis and y_mid", () => {
    const dto = DEMO_SCENARIO.storm.downdraft;
    const field = createDowndraftField(DEMO_SCENARIO);
    const yMid = (dto.baseHeight + dto.topHeight) / 2;
    expect(yMid).toBe(1600);

    const atMid = field.sample(
      { x: dto.centerX, y: yMid, z: dto.centerZ },
      0,
    );
    expect(atMid).toEqual({ x: 0, y: -dto.peakDownwardVelocity, z: 0 });
    expect(field).toBeInstanceOf(VerticalEnvelopeDowndraftField);

    const atFloor = field.sample(
      { x: dto.centerX, y: 0, z: dto.centerZ },
      0,
    );
    expect(atFloor.x).toBe(0);
    expect(atFloor.z).toBe(0);
    expect(atFloor.y).toBeLessThan(0);
    expect(atFloor.y).toBeCloseTo(
      -dto.peakDownwardVelocity *
        Math.sin((Math.PI * (0 - dto.baseHeight)) / (dto.topHeight - dto.baseHeight)),
      12,
    );
  });

  it("adds the same storm-side downdraft in both integration frames", () => {
    const ground = composeDemoTracerFields(
      IntegrationFrame.GroundRelativeWindTunnel,
    );
    const stormRelative = composeDemoTracerFields(
      IntegrationFrame.StormRelativeLaboratory,
    );
    const dto = DEMO_SCENARIO.storm.downdraft;
    const axisMid = {
      x: dto.centerX,
      y: (dto.baseHeight + dto.topHeight) / 2,
      z: dto.centerZ,
    };

    expect(ground.operands).toHaveLength(7);
    expect(stormRelative.operands).toHaveLength(7);
    expect(ground.downdraftField.sample(axisMid, 0)).toEqual(
      stormRelative.downdraftField.sample(axisMid, 0),
    );
    expect(ground.downdraftField.sample(axisMid, 0)).toEqual({
      x: 0,
      y: -20,
      z: 0,
    });
    expect(composeDemoTracerSimulationSrc).toMatch(
      /new CompositeVelocityField\(\[\s*environmentField,\s*updraftField,\s*rotationField,\s*lowerRadialInflowField,\s*upperRadialOutflowField,\s*downdraftField,\s*nearGroundOutflowField,\s*\]/,
    );
  });

  it("keeps StoryPathlines S1/S2 as an upward story, not a return path", () => {
    const simulation = composeDemoTracerSimulation(
      IntegrationFrame.StormRelativeLaboratory,
      TracerPedagogy.StoryPathlines,
    );
    const history = createDemoPathHistory(
      TracerPedagogy.StoryPathlines,
      simulation.particles,
    )!;
    const steps = Math.round(800 / DT);
    const maxY = [0, 0];
    const minY = [1e9, 1e9];
    const deepOcc = [0, 0];
    const reachedOutflow = [false, false];
    let stayedActive = true;
    let stayedNonNegative = true;

    for (let s = 0; s < steps; s++) {
      simulation.step(DT);
      history.recordAfterStep(simulation.particles, simulation.clock.time);
      for (let i = 0; i < 2; i++) {
        const p = simulation.particles[i]!;
        if (!p.active) stayedActive = false;
        if (p.position.y < 0) stayedNonNegative = false;
        maxY[i] = Math.max(maxY[i]!, p.position.y);
        minY[i] = Math.min(minY[i]!, p.position.y);
        const r = Math.hypot(p.position.x, p.position.z);
        if (p.position.y >= 3000 && r < SIGMA_UP) {
          deepOcc[i]! += DT;
        }
        if (p.position.y >= 5000) {
          reachedOutflow[i] = true;
        }
      }
    }

    expect(stayedActive).toBe(true);
    expect(stayedNonNegative).toBe(true);

    expect(simulation.particles[0]!.active).toBe(true);
    expect(simulation.particles[1]!.active).toBe(true);
    expect(maxY[0]).toBeGreaterThan(5000);
    expect(maxY[1]).toBeGreaterThan(5000);
    expect(deepOcc[0]).toBeGreaterThan(50);
    expect(deepOcc[1]).toBeGreaterThan(50);
    expect(reachedOutflow[0]).toBe(true);
    expect(reachedOutflow[1]).toBe(true);
    expect(minY[0]).toBeGreaterThan(500);
    expect(minY[1]).toBeGreaterThan(500);
    expect(simulation.particles[0]!.position.y).toBeGreaterThan(4000);
    expect(simulation.particles[1]!.position.y).toBeGreaterThan(4000);
    expect(history.pointsFor(0)).toHaveLength(steps + 1);
    expect(history.pointsFor(0).every((point) => point.y > 0)).toBe(true);
    expect(history.pointsFor(1).every((point) => point.y > 0)).toBe(true);
  });

  it("keeps AtmosphericTracerDomain wired and does not change hodograph or SRH", () => {
    expect(composeDemoTracerSimulationSrc).toMatch(/ATMOSPHERIC_TRACER_DOMAIN/);
    const simulation = composeDemoTracerSimulation(
      IntegrationFrame.StormRelativeLaboratory,
      TracerPedagogy.StoryPathlines,
    );
    expect(simulation).toBeTruthy();

    const profile = createEnvironmentalWindProfile(DEMO_SCENARIO);
    const pointsBefore = createDemoHodographPoints();
    const srhBefore = stormRelativeHelicityBetween(
      profile,
      DEMO_SCENARIO.stormMotion,
      0,
      1000,
    );
    composeDemoTracerFields(IntegrationFrame.StormRelativeLaboratory);
    expect(createDemoHodographPoints()).toEqual(pointsBefore);
    expect(hodographPoints(profile)).toEqual(pointsBefore);
    expect(
      stormRelativeHelicityBetween(profile, DEMO_SCENARIO.stormMotion, 0, 1000),
    ).toEqual(srhBefore);
    expect(verticalEnvelopeDowndraftSrc).not.toMatch(/IntegrationFrame/);
    expect(verticalEnvelopeDowndraftSrc).not.toMatch(/StormMotion/);
  });
});
