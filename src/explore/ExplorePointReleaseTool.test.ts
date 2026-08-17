import { describe, expect, it } from "vitest";
import { EulerIntegrator } from "../core/integrators/EulerIntegrator.js";
import { ConstantVelocityField } from "../physics/synthetic/ConstantVelocityField.js";
import { AtmosphericTracerSeedError } from "../simulation/assertAtmosphericTracerSeed.js";
import { Simulation } from "../simulation/Simulation.js";
import { TracerPathHistory } from "../simulation/TracerPathHistory.js";
import { ExploreTracerSession } from "./ExploreTracerSession.js";
import {
  DEFAULT_EXPLORE_POINT_ALTITUDE_M,
  ExplorePointReleaseTool,
} from "./ExplorePointReleaseTool.js";
import toolSrc from "./ExplorePointReleaseTool.ts?raw";
import appSrc from "../app/App.tsx?raw";
import tracerViewportSrc from "../ui/tracer/TracerViewport.tsx?raw";
import {
  LIVE_DEMO_TRACER_PEDAGOGY,
  TracerPedagogy,
} from "../app/TracerPedagogy.js";

describe("ExplorePointReleaseTool", () => {
  it("has no pending seed initially and a UI-only default altitude", () => {
    const tool = new ExplorePointReleaseTool();
    expect(tool.pendingSeed).toBeNull();
    expect(tool.altitudeM).toBe(DEFAULT_EXPLORE_POINT_ALTITUDE_M);
    expect(DEFAULT_EXPLORE_POINT_ALTITUDE_M).toBe(1000);
    expect(tool.placementEnabled).toBe(false);
  });

  it("does not create a seed when only altitude is set", () => {
    const tool = new ExplorePointReleaseTool();
    tool.setAltitude(250);
    expect(tool.altitudeM).toBe(250);
    expect(tool.pendingSeed).toBeNull();
  });

  it("creates a pending seed from a valid XZ pick using current altitude", () => {
    const tool = new ExplorePointReleaseTool(400);
    const pending = tool.pickOnGroundReferencePlane(
      { x: 0, y: 1000, z: 0 },
      { x: 3, y: -1, z: -1 },
    );
    expect(pending).toEqual({ x: 3000, y: 400, z: -1000 });
    expect(tool.pendingSeed).toEqual({ x: 3000, y: 400, z: -1000 });
  });

  it("applies altitude exactly, including y = 0", () => {
    const tool = new ExplorePointReleaseTool(0);
    tool.pickOnGroundReferencePlane(
      { x: 10, y: 5, z: 20 },
      { x: 0, y: -1, z: 0 },
    );
    expect(tool.pendingSeed).toEqual({ x: 10, y: 0, z: 20 });
  });

  it("replaces pending x/z on repick and keeps current altitude", () => {
    const tool = new ExplorePointReleaseTool(100);
    tool.pickOnGroundReferencePlane(
      { x: 0, y: 1, z: 0 },
      { x: 0, y: -1, z: 0 },
    );
    tool.pickOnGroundReferencePlane(
      { x: 50, y: 2, z: -7 },
      { x: 0, y: -1, z: 0 },
    );
    expect(tool.pendingSeed).toEqual({ x: 50, y: 100, z: -7 });
  });

  it("updates only pending y when altitude changes after a pick", () => {
    const tool = new ExplorePointReleaseTool(100);
    tool.pickOnGroundReferencePlane(
      { x: 8, y: 4, z: 2 },
      { x: 0, y: -1, z: 0 },
    );
    tool.setAltitude(750);
    expect(tool.pendingSeed).toEqual({ x: 8, y: 750, z: 2 });
  });

  it("rejects invalid altitude and leaves pending unchanged", () => {
    const tool = new ExplorePointReleaseTool(100);
    tool.pickOnGroundReferencePlane(
      { x: 1, y: 1, z: 1 },
      { x: 0, y: -1, z: 0 },
    );
    const before = tool.pendingSeed;
    expect(() => tool.setAltitude(-1)).toThrow(AtmosphericTracerSeedError);
    expect(() => tool.setAltitude(Number.NaN)).toThrow(
      AtmosphericTracerSeedError,
    );
    expect(tool.altitudeM).toBe(100);
    expect(tool.pendingSeed).toEqual(before);
  });

  it("allows large finite picked x/z", () => {
    const tool = new ExplorePointReleaseTool(10);
    tool.pickOnGroundReferencePlane(
      { x: 0, y: 1, z: 0 },
      { x: 2e6, y: -1, z: -3e6 },
    );
    expect(tool.pendingSeed).toEqual({ x: 2e6, y: 10, z: -3e6 });
  });

  it("leaves pending unchanged on a miss and cancel removes it", () => {
    const tool = new ExplorePointReleaseTool(100);
    tool.pickOnGroundReferencePlane(
      { x: 0, y: 1, z: 0 },
      { x: 0, y: -1, z: 0 },
    );
    expect(
      tool.pickOnGroundReferencePlane(
        { x: 0, y: 1, z: 0 },
        { x: 1, y: 0, z: 0 },
      ),
    ).toBeNull();
    expect(tool.pendingSeed).toEqual({ x: 0, y: 100, z: 0 });
    tool.cancelPending();
    expect(tool.pendingSeed).toBeNull();
  });

  it("does not mutate caller ray or returned pending snapshots", () => {
    const origin = { x: 0, y: 10, z: 0 };
    const direction = { x: 1, y: -1, z: 2 };
    const tool = new ExplorePointReleaseTool(30);
    const pending = tool.pickOnGroundReferencePlane(origin, direction)!;
    origin.x = 99;
    direction.y = 99;
    pending.x = 77;
    expect(origin).toEqual({ x: 99, y: 10, z: 0 });
    expect(tool.pendingSeed).toEqual({ x: 10, y: 30, z: 20 });
  });

  it("does not create particles, history lanes, or session seeds", () => {
    const simulation = new Simulation(
      new ConstantVelocityField({ x: 1, y: 0, z: 0 }),
      new EulerIntegrator(),
      [],
    );
    const pathHistory = new TracerPathHistory(0);
    const session = new ExploreTracerSession(simulation, pathHistory);
    simulation.step(0.2);
    const clock = simulation.clock.time;

    const tool = new ExplorePointReleaseTool(1000);
    tool.pickOnGroundReferencePlane(
      { x: 0, y: 500, z: 0 },
      { x: 1, y: -1, z: 0 },
    );
    tool.setAltitude(200);
    tool.cancelPending();
    tool.pickOnGroundReferencePlane(
      { x: 0, y: 500, z: 0 },
      { x: 0, y: -1, z: 0 },
    );

    expect(simulation.particles).toHaveLength(0);
    expect(pathHistory.tracerCount).toBe(0);
    expect(session.seeds).toEqual([]);
    expect(simulation.clock.time).toBe(clock);
    expect(toolSrc).not.toMatch(/releasePoint/);
    expect(toolSrc).not.toMatch(/ExploreTracerSession/);
    expect(toolSrc).not.toMatch(/Simulation/);
    expect(toolSrc).not.toMatch(/TracerPathHistory/);
    expect(toolSrc).not.toMatch(/from ["']three["']/);
    expect(toolSrc).not.toMatch(/TracerScene/);
    expect(toolSrc).not.toMatch(/DEMO_SCENARIO/);
    expect(toolSrc).not.toMatch(/TracerPedagogy/);
  });

  it("is owned by Explore orchestration; TracerViewport does not import the tool", () => {
    expect(LIVE_DEMO_TRACER_PEDAGOGY).toBe(
      TracerPedagogy.NearGroundOutflowPathline,
    );
    expect(appSrc).toMatch(/ExplorePointReleaseTool/);
    expect(appSrc).not.toMatch(/pickOnGroundReferencePlane/);
    expect(tracerViewportSrc).not.toMatch(/ExplorePointReleaseTool/);
    expect(tracerViewportSrc).not.toMatch(/shouldAcceptPlacementPick/);
    expect(tracerViewportSrc).toMatch(/syncReleasePreview/);
  });
});
