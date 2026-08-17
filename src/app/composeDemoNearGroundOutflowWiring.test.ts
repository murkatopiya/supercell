import { describe, expect, it } from "vitest";
import composeDemoTracerSimulationSrc from "./composeDemoTracerSimulation.ts?raw";
import {
  composeDemoTracerFields,
  composeDemoTracerSimulation,
  createDemoPathHistory,
} from "./composeDemoTracerSimulation.js";
import { createDemoHodographPoints } from "./demoHodographFixture.js";
import { IntegrationFrame } from "./IntegrationFrame.js";
import {
  LIVE_DEMO_TRACER_PEDAGOGY,
  TracerPedagogy,
} from "./TracerPedagogy.js";
import { hodographPoints } from "../physics/environment/hodograph.js";
import { stormRelativeHelicityBetween } from "../physics/environment/stormRelativeHelicity.js";
import { NearGroundRadialOutflowField } from "../physics/storm/NearGroundRadialOutflowField.js";
import nearGroundRadialOutflowSrc from "../physics/storm/NearGroundRadialOutflowField.ts?raw";
import { createEnvironmentalWindProfile } from "../scenario/createEnvironmentalWindProfile.js";
import { createNearGroundRadialOutflowField } from "../scenario/createNearGroundRadialOutflowField.js";
import createNearGroundRadialOutflowFieldSrc from "../scenario/createNearGroundRadialOutflowField.ts?raw";
import { DEMO_SCENARIO } from "../scenario/DEMO_SCENARIO.js";

const SIGMA_UP = DEMO_SCENARIO.storm.updraft.sigma;
const DT = DEMO_SCENARIO.simulation.timestep;
const SQRT_E = Math.sqrt(Math.E);
const COMPOSITE_SEVEN_OPERANDS =
  /new CompositeVelocityField\(\[\s*environmentField,\s*updraftField,\s*rotationField,\s*lowerRadialInflowField,\s*upperRadialOutflowField,\s*downdraftField,\s*nearGroundOutflowField,\s*\]/;

describe("DEMO seventh-operand near-ground outflow wiring", () => {
  it("maps storm.nearGroundOutflow 1:1 and ignores other storm blocks", () => {
    const dto = DEMO_SCENARIO.storm.nearGroundOutflow;
    expect(dto).toEqual({
      centerX: 3000,
      centerZ: 4000,
      outflowStrainRate: 0.010991,
      sigma: 1500,
      baseHeight: 0,
      topHeight: 800,
    });
    expect(dto.sigma).not.toBe(DEMO_SCENARIO.storm.updraft.sigma);
    expect(dto.sigma).not.toBe(DEMO_SCENARIO.storm.downdraft.sigma);
    expect(dto.centerX).not.toBe(DEMO_SCENARIO.storm.updraft.centerX);
    expect(dto.centerX).not.toBe(DEMO_SCENARIO.storm.downdraft.centerX);
    expect(dto.centerZ).not.toBe(DEMO_SCENARIO.storm.downdraft.centerZ);
    expect(dto.outflowStrainRate).not.toBe(
      DEMO_SCENARIO.storm.lowerRadialInflow.radialStrainRate,
    );
    expect(dto.outflowStrainRate).not.toBe(
      DEMO_SCENARIO.storm.upperRadialOutflow.outflowStrainRate,
    );
    expect(dto.baseHeight).not.toBe(
      DEMO_SCENARIO.storm.lowerRadialInflow.baseHeight,
    );
    expect(dto.topHeight).not.toBe(
      DEMO_SCENARIO.storm.lowerRadialInflow.topHeight,
    );
    expect(dto.topHeight).not.toBe(
      DEMO_SCENARIO.storm.upperRadialOutflow.topHeight,
    );

    const cloned = structuredClone(DEMO_SCENARIO);
    cloned.storm.updraft.centerX = 800;
    cloned.storm.updraft.sigma = 50;
    cloned.storm.rotation.centerX = 999;
    cloned.storm.lowerRadialInflow.centerX = -400;
    cloned.storm.upperRadialOutflow.centerX = 400;
    cloned.storm.downdraft.centerX = -8000;
    cloned.storm.downdraft.sigma = 50;

    const original = createNearGroundRadialOutflowField(DEMO_SCENARIO);
    const mutated = createNearGroundRadialOutflowField(cloned);
    const plateauPeak = {
      x: dto.centerX + dto.sigma,
      y: dto.baseHeight,
      z: dto.centerZ,
    };
    expect(mutated.sample(plateauPeak, 0)).toEqual(
      original.sample(plateauPeak, 0),
    );
    expect(createNearGroundRadialOutflowFieldSrc).not.toMatch(/storm\.updraft/);
    expect(createNearGroundRadialOutflowFieldSrc).not.toMatch(/storm\.rotation/);
    expect(createNearGroundRadialOutflowFieldSrc).not.toMatch(
      /storm\.lowerRadialInflow/,
    );
    expect(createNearGroundRadialOutflowFieldSrc).not.toMatch(
      /storm\.upperRadialOutflow/,
    );
    expect(createNearGroundRadialOutflowFieldSrc).not.toMatch(/storm\.downdraft/);
    expect(createNearGroundRadialOutflowFieldSrc).not.toMatch(/downwardPathline/);
    expect(createNearGroundRadialOutflowFieldSrc).not.toMatch(/coldPool/);
    expect(createNearGroundRadialOutflowFieldSrc).not.toMatch(/storm\.sigma/);
  });

  it("samples isolated plateau occupancy, compact top, and peak |V_h| ≈ 10 m/s", () => {
    const dto = DEMO_SCENARIO.storm.nearGroundOutflow;
    const field = createNearGroundRadialOutflowField(DEMO_SCENARIO);
    expect(field).toBeInstanceOf(NearGroundRadialOutflowField);

    const axisPlateau = field.sample(
      { x: dto.centerX, y: 0, z: dto.centerZ },
      0,
    );
    expect(axisPlateau).toEqual({ x: 0, y: 0, z: 0 });

    const eastPlateau = field.sample(
      { x: dto.centerX + dto.sigma, y: 0, z: dto.centerZ },
      0,
    );
    const westPlateau = field.sample(
      { x: dto.centerX - 500, y: 0, z: dto.centerZ },
      0,
    );
    const southPlateau = field.sample(
      { x: dto.centerX, y: 0, z: dto.centerZ + 500 },
      0,
    );
    const northPlateau = field.sample(
      { x: dto.centerX, y: 0, z: dto.centerZ - 500 },
      0,
    );

    expect(eastPlateau.y).toBe(0);
    expect(eastPlateau.x).toBeGreaterThan(0);
    expect(eastPlateau.z).toBeCloseTo(0, 12);
    expect(westPlateau.x).toBeLessThan(0);
    expect(southPlateau.z).toBeGreaterThan(0);
    expect(northPlateau.z).toBeLessThan(0);
    expect(Math.hypot(eastPlateau.x, eastPlateau.z)).toBeCloseTo(
      (dto.outflowStrainRate * dto.sigma) / SQRT_E,
      12,
    );
    expect(Math.hypot(eastPlateau.x, eastPlateau.z)).toBeCloseTo(10, 2);

    expect(field.sample({ x: dto.centerX + dto.sigma, y: 800, z: dto.centerZ }, 0)).toEqual(
      { x: 0, y: 0, z: 0 },
    );
    expect(field.sample({ x: dto.centerX + dto.sigma, y: 1000, z: dto.centerZ }, 0)).toEqual(
      { x: 0, y: 0, z: 0 },
    );
    expect(
      field.sample(
        { x: DEMO_SCENARIO.simulation.storySeeds[0]!.x, y: 1000, z: DEMO_SCENARIO.simulation.storySeeds[0]!.z },
        0,
      ),
    ).toEqual({ x: 0, y: 0, z: 0 });
  });

  it("adds the same storm-side near-ground outflow in both integration frames", () => {
    const ground = composeDemoTracerFields(
      IntegrationFrame.GroundRelativeWindTunnel,
    );
    const stormRelative = composeDemoTracerFields(
      IntegrationFrame.StormRelativeLaboratory,
    );
    const dto = DEMO_SCENARIO.storm.nearGroundOutflow;
    const plateauPeak = {
      x: dto.centerX + dto.sigma,
      y: 0,
      z: dto.centerZ,
    };

    expect(ground.operands).toHaveLength(7);
    expect(stormRelative.operands).toHaveLength(7);
    expect(ground.nearGroundOutflowField.sample(plateauPeak, 0)).toEqual(
      stormRelative.nearGroundOutflowField.sample(plateauPeak, 0),
    );
    expect(ground.operands[6]).toBe(ground.nearGroundOutflowField);
    expect(stormRelative.operands[6]).toBe(
      stormRelative.nearGroundOutflowField,
    );
    expect(composeDemoTracerSimulationSrc).toMatch(COMPOSITE_SEVEN_OPERANDS);
    expect(composeDemoTracerSimulationSrc).toMatch(
      /createNearGroundRadialOutflowField/,
    );
    expect(nearGroundRadialOutflowSrc).not.toMatch(/IntegrationFrame/);
    expect(nearGroundRadialOutflowSrc).not.toMatch(/StormMotion/);
  });

  it("keeps lower inflow and near-ground outflow as simultaneous summands", () => {
    const live = composeDemoTracerFields(
      IntegrationFrame.StormRelativeLaboratory,
    );
    const inflowEast = { x: 1000, y: 0, z: 0 };
    const ngEast = { x: 4500, y: 0, z: 4000 };

    const inflowAtChimney = live.lowerRadialInflowField.sample(inflowEast, 0);
    const ngAtChimney = live.nearGroundOutflowField.sample(inflowEast, 0);
    const inflowAtNg = live.lowerRadialInflowField.sample(ngEast, 0);
    const ngAtNg = live.nearGroundOutflowField.sample(ngEast, 0);

    expect(inflowAtChimney.x).toBeLessThan(0);
    expect(ngAtChimney.y).toBe(0);
    expect(ngAtNg.x).toBeGreaterThan(0);
    expect(inflowAtNg.y).toBe(0);
    expect(live.operands).toContain(live.lowerRadialInflowField);
    expect(live.operands).toContain(live.nearGroundOutflowField);
    expect(composeDemoTracerSimulationSrc).not.toMatch(/inflow OR outflow/);
    expect(createNearGroundRadialOutflowFieldSrc).not.toMatch(
      /lowerRadialInflow/,
    );
  });

  it("keeps StoryPathlines S1/S2 as an upward story with G(1000) identically off", () => {
    const ng = createNearGroundRadialOutflowField(DEMO_SCENARIO);
    for (const seed of DEMO_SCENARIO.simulation.storySeeds) {
      expect(ng.sample(seed, 0)).toEqual({ x: 0, y: 0, z: 0 });
    }
    for (const seed of DEMO_SCENARIO.simulation.diagnosticSeeds) {
      expect(ng.sample(seed, 0)).toEqual({ x: 0, y: 0, z: 0 });
    }

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
      history.recordAfterStep(simulation.particles);
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
  });

  it("keeps live DownwardPathline D1 grounding with a small landing shift", () => {
    expect(LIVE_DEMO_TRACER_PEDAGOGY).toBe(TracerPedagogy.DownwardPathline);
    const simulation = composeDemoTracerSimulation(
      IntegrationFrame.StormRelativeLaboratory,
      LIVE_DEMO_TRACER_PEDAGOGY,
    );
    const history = createDemoPathHistory(
      LIVE_DEMO_TRACER_PEDAGOGY,
      simulation.particles,
    )!;
    const particle = simulation.particles[0]!;
    let t = 0;

    while (particle.active && t < 800 - 1e-12) {
      simulation.step(DT);
      history.recordAfterStep(simulation.particles);
      t += DT;
    }

    expect(particle.active).toBe(false);
    expect(particle.position.y).toBe(0);
    expect(t).toBeGreaterThan(110);
    expect(t).toBeLessThan(130);
    const landingShift = Math.hypot(
      particle.position.x - 4723,
      particle.position.z + 1308,
    );
    expect(landingShift).toBeLessThan(25);

    const terminalLength = history.pointsFor(0).length;
    expect(history.pointsFor(0)[terminalLength - 1]).toEqual(particle.position);
    for (let i = 0; i < 20; i++) {
      simulation.step(DT);
      history.recordAfterStep(simulation.particles);
    }
    expect(history.pointsFor(0)).toHaveLength(terminalLength);
    expect(particle.active).toBe(false);
    expect(particle.position.y).toBe(0);
  });

  it("does not add near-ground seeds or change DiagnosticProbes role", () => {
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

    const diagnostic = composeDemoTracerSimulation(
      IntegrationFrame.StormRelativeLaboratory,
      TracerPedagogy.DiagnosticProbes,
    );
    expect(diagnostic.particles).toHaveLength(3);
    expect(diagnostic.particles.map((particle) => particle.position)).toEqual(
      DEMO_SCENARIO.simulation.diagnosticSeeds,
    );
    expect(composeDemoTracerSimulationSrc).not.toMatch(/nearGroundSeeds/);
    expect(composeDemoTracerSimulationSrc).not.toMatch(
      /NearGroundOutflowPathlines/,
    );
  });

  it("does not change hodograph or SRH", () => {
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

    const mutated = structuredClone(DEMO_SCENARIO);
    mutated.storm.nearGroundOutflow.outflowStrainRate = 0.4;
    mutated.storm.nearGroundOutflow.sigma = 50;
    mutated.storm.nearGroundOutflow.centerX = -8000;
    expect(
      hodographPoints(createEnvironmentalWindProfile(mutated)),
    ).toEqual(pointsBefore);
  });
});
