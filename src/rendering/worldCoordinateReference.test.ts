import { describe, expect, it } from "vitest";
import { cardinalWorldPosition, WORLD_CARDINAL_DIRECTIONS } from "./worldCoordinateReference.js";
import helperSrc from "./worldCoordinateReference.ts?raw";

describe("world coordinate cardinal mapping", () => {
  it("places E on +X, W on −X, S on +Z, and N on −Z", () => {
    expect(WORLD_CARDINAL_DIRECTIONS.E).toEqual({ x: 1, z: 0 });
    expect(WORLD_CARDINAL_DIRECTIONS.W).toEqual({ x: -1, z: 0 });
    expect(WORLD_CARDINAL_DIRECTIONS.S).toEqual({ x: 0, z: 1 });
    expect(WORLD_CARDINAL_DIRECTIONS.N).toEqual({ x: 0, z: -1 });

    const half = 5000;
    expect(cardinalWorldPosition("E", half)).toMatchObject({ x: 5000, z: 0 });
    expect(cardinalWorldPosition("W", half)).toMatchObject({ x: -5000, z: 0 });
    expect(cardinalWorldPosition("S", half)).toMatchObject({ x: 0, z: 5000 });
    expect(cardinalWorldPosition("N", half)).toMatchObject({ x: 0, z: -5000 });
  });

  it("keeps labels on the ground-reference plane and disables picking", () => {
    expect(cardinalWorldPosition("E", 5000).y).toBeGreaterThan(0);
    expect(helperSrc).toMatch(/new THREE\.GridHelper\(/);
    expect(helperSrc).toMatch(/object\.raycast = \(\) => \{\}/);
    expect(helperSrc).toMatch(/sizeAttenuation: false/);
    expect(helperSrc).not.toMatch(/AxesHelper/);
  });
});
