import { describe, expect, it } from "vitest";
import {
  DEFAULT_PLACEMENT_CLICK_MOVEMENT_PX,
  pointerMovementPx,
  shouldAcceptPlacementPick,
} from "./shouldAcceptPlacementPick.js";

describe("shouldAcceptPlacementPick", () => {
  it("rejects picks while the placement tool is disabled", () => {
    expect(
      shouldAcceptPlacementPick({
        placementEnabled: false,
        pointerMovementPx: 0,
      }),
    ).toBe(false);
  });

  it("accepts a stationary click only when the tool is enabled", () => {
    expect(
      shouldAcceptPlacementPick({
        placementEnabled: true,
        pointerMovementPx: 0,
      }),
    ).toBe(true);
    expect(
      shouldAcceptPlacementPick({
        placementEnabled: true,
        pointerMovementPx: DEFAULT_PLACEMENT_CLICK_MOVEMENT_PX,
      }),
    ).toBe(true);
  });

  it("rejects orbit drags so OrbitControls can keep the gesture", () => {
    expect(
      shouldAcceptPlacementPick({
        placementEnabled: true,
        pointerMovementPx: DEFAULT_PLACEMENT_CLICK_MOVEMENT_PX + 1,
      }),
    ).toBe(false);
  });

  it("measures pointer movement without mutating the endpoints", () => {
    const down = { x: 10, y: 10 };
    const up = { x: 13, y: 14 };
    expect(pointerMovementPx(down, up)).toBe(5);
    expect(down).toEqual({ x: 10, y: 10 });
    expect(up).toEqual({ x: 13, y: 14 });
  });
});
