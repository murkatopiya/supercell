import { describe, expect, it } from "vitest";
import { GROUND_CURSOR_UNAVAILABLE, groundCursorHudFromRay } from "./groundCursorHud.js";
import helperSrc from "./groundCursorHud.ts?raw";

describe("groundCursorHudFromRay", () => {
  it("reports E/N from the y = 0 intersection, not CSS-to-metres", () => {
    const hud = groundCursorHudFromRay(
      { x: 512, y: 100, z: 984 },
      { x: 0, y: -1, z: 0 },
    );
    expect(hud.east).toBe("+512 m");
    expect(hud.north).toBe("-984 m");
    expect(helperSrc).toMatch(/intersectRayWithGroundReferencePlane/);
    expect(helperSrc).toMatch(/y: 0/);
    expect(helperSrc).not.toMatch(/altitude/);
  });

  it("shows an unavailable readout when the ray misses y = 0", () => {
    const hud = groundCursorHudFromRay(
      { x: 0, y: 100, z: 0 },
      { x: 1, y: 0, z: 0 },
    );
    expect(hud.east).toBe(GROUND_CURSOR_UNAVAILABLE);
    expect(hud.north).toBe(GROUND_CURSOR_UNAVAILABLE);
    expect(hud.east).not.toBe("0 m");
    expect(hud.north).not.toBe("0 m");
  });
});
