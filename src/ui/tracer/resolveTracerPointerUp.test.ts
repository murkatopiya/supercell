import { describe, expect, it } from "vitest";
import { DEFAULT_PLACEMENT_CLICK_MOVEMENT_PX } from "../../explore/shouldAcceptPlacementPick.js";
import type { WorldRay } from "../../rendering/worldRayFromCameraNdc.js";
import {
  occupancyIndexForTracerId,
  resolveTracerPointerUp,
  tracerIdForSlot,
} from "./resolveTracerPointerUp.js";
import tracerViewportSrc from "./TracerViewport.tsx?raw";

const RAY: WorldRay = {
  origin: { x: 0, y: 1000, z: 0 },
  direction: { x: 0, y: -1, z: 0 },
};

describe("resolveTracerPointerUp", () => {
  it("selects a hit glyph and does not fall through to placement", () => {
    expect(
      resolveTracerPointerUp({
        pointerMovementPx: 0,
        hitSlotIndex: 1,
        placementAvailable: true,
        ray: RAY,
      }),
    ).toEqual({ action: "select", slotIndex: 1 });
  });

  it("forwards a miss to Explore placement when the callback exists", () => {
    expect(
      resolveTracerPointerUp({
        pointerMovementPx: 2,
        hitSlotIndex: null,
        placementAvailable: true,
        ray: RAY,
      }),
    ).toEqual({
      action: "placement",
      origin: RAY.origin,
      direction: RAY.direction,
      pointerMovementPx: 2,
    });
  });

  it("prefers a path sample over placement and loses to a glyph", () => {
    expect(
      resolveTracerPointerUp({
        pointerMovementPx: 0,
        hitSlotIndex: null,
        hitPathSample: { slotIndex: 0, historyIndex: 3 },
        placementAvailable: true,
        ray: RAY,
      }),
    ).toEqual({
      action: "inspect-path",
      slotIndex: 0,
      historyIndex: 3,
    });
    expect(
      resolveTracerPointerUp({
        pointerMovementPx: 0,
        hitSlotIndex: 1,
        hitPathSample: { slotIndex: 0, historyIndex: 3 },
        placementAvailable: true,
        ray: RAY,
      }),
    ).toEqual({ action: "select", slotIndex: 1 });
  });

  it("still selects in Guided when placement is unavailable", () => {
    expect(
      resolveTracerPointerUp({
        pointerMovementPx: 0,
        hitSlotIndex: 0,
        placementAvailable: false,
        ray: RAY,
      }),
    ).toEqual({ action: "select", slotIndex: 0 });
    expect(
      resolveTracerPointerUp({
        pointerMovementPx: 0,
        hitSlotIndex: null,
        placementAvailable: false,
        ray: RAY,
      }),
    ).toEqual({ action: "ignore" });
  });

  it("rejects orbit drag for both selection and placement", () => {
    const drag = DEFAULT_PLACEMENT_CLICK_MOVEMENT_PX + 1;
    expect(
      resolveTracerPointerUp({
        pointerMovementPx: drag,
        hitSlotIndex: 0,
        placementAvailable: true,
        ray: RAY,
      }),
    ).toEqual({ action: "ignore" });
    expect(
      resolveTracerPointerUp({
        pointerMovementPx: drag,
        hitSlotIndex: null,
        placementAvailable: true,
        ray: RAY,
      }),
    ).toEqual({ action: "ignore" });
  });

  it("maps occupancy slot index to stable tracerId, not the index itself", () => {
    const particles = [{ tracerId: 4 }, { tracerId: 7 }, { tracerId: 9 }];
    expect(tracerIdForSlot(particles, 1)).toBe(7);
    expect(tracerIdForSlot(particles, 1)).not.toBe(1);
    expect(tracerIdForSlot(particles, 3)).toBeUndefined();
    expect(occupancyIndexForTracerId(particles, 7)).toBe(1);
    expect(occupancyIndexForTracerId(particles, 4)).toBe(0);
    expect(occupancyIndexForTracerId(particles, null)).toBeNull();
    expect(occupancyIndexForTracerId(particles, 99)).toBeNull();
  });

  it("keeps TracerViewport off the Explore placement-gate module", () => {
    expect(tracerViewportSrc).toMatch(/pickVisibleTracerAtClientPoint/);
    expect(tracerViewportSrc).toMatch(/pickPathHistorySampleAtClientPoint/);
    expect(tracerViewportSrc).toMatch(/onTracerSelect/);
    expect(tracerViewportSrc).toMatch(/onPathSampleSelect/);
    expect(tracerViewportSrc).toMatch(/selectedTracerId/);
    expect(tracerViewportSrc).toMatch(/resolveTracerPointerUp/);
    expect(tracerViewportSrc).not.toMatch(/shouldAcceptPlacementPick/);
    expect(tracerViewportSrc).not.toMatch(/ExplorePointReleaseTool/);
  });
});
