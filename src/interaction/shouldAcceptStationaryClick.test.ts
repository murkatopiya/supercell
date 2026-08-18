import { describe, expect, it } from "vitest";
import {
  DEFAULT_STATIONARY_CLICK_MOVEMENT_PX,
  shouldAcceptStationaryClick,
} from "./shouldAcceptStationaryClick.js";
import { DEFAULT_PLACEMENT_CLICK_MOVEMENT_PX } from "../explore/shouldAcceptPlacementPick.js";

describe("shouldAcceptStationaryClick", () => {
  it("shares the placement click movement threshold", () => {
    expect(DEFAULT_STATIONARY_CLICK_MOVEMENT_PX).toBe(
      DEFAULT_PLACEMENT_CLICK_MOVEMENT_PX,
    );
    expect(
      shouldAcceptStationaryClick({
        pointerMovementPx: DEFAULT_STATIONARY_CLICK_MOVEMENT_PX,
      }),
    ).toBe(true);
    expect(
      shouldAcceptStationaryClick({
        pointerMovementPx: DEFAULT_STATIONARY_CLICK_MOVEMENT_PX + 1,
      }),
    ).toBe(false);
  });
});
