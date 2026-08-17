import { describe, expect, it } from "vitest";
import { intersectRayWithGroundReferencePlane } from "./intersectRayWithGroundReferencePlane.js";
import helperSrc from "./intersectRayWithGroundReferencePlane.ts?raw";

describe("intersectRayWithGroundReferencePlane", () => {
  it("hits the XZ plane at the expected x/z", () => {
    const hit = intersectRayWithGroundReferencePlane(
      { x: 0, y: 1000, z: 0 },
      { x: 0, y: -1, z: 0 },
    );
    expect(hit).toEqual({ x: 0, z: 0 });
  });

  it("handles an oblique ray", () => {
    const hit = intersectRayWithGroundReferencePlane(
      { x: 0, y: 1000, z: 0 },
      { x: 2, y: -1, z: -4 },
    );
    expect(hit).toEqual({ x: 2000, z: -4000 });
  });

  it("returns null when the ray is parallel to the plane", () => {
    expect(
      intersectRayWithGroundReferencePlane(
        { x: 10, y: 500, z: -3 },
        { x: 1, y: 0, z: 0 },
      ),
    ).toBeNull();
    expect(
      intersectRayWithGroundReferencePlane(
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 0, z: 1 },
      ),
    ).toBeNull();
  });

  it("returns null when the intersection is behind the origin", () => {
    expect(
      intersectRayWithGroundReferencePlane(
        { x: 0, y: 100, z: 0 },
        { x: 0, y: 1, z: 0 },
      ),
    ).toBeNull();
  });

  it("accepts origin already on the plane when the ray is not parallel", () => {
    expect(
      intersectRayWithGroundReferencePlane(
        { x: 15, y: 0, z: -8 },
        { x: 0, y: -1, z: 0 },
      ),
    ).toEqual({ x: 15, z: -8 });
  });

  it("does not clip large finite x/z to the visual grid", () => {
    const hit = intersectRayWithGroundReferencePlane(
      { x: 0, y: 1, z: 0 },
      { x: 1e12, y: -1, z: -2e12 },
    );
    expect(hit).toEqual({ x: 1e12, z: -2e12 });
  });

  it("returns null for non-finite ray inputs", () => {
    expect(
      intersectRayWithGroundReferencePlane(
        { x: Number.NaN, y: 1, z: 0 },
        { x: 0, y: -1, z: 0 },
      ),
    ).toBeNull();
    expect(
      intersectRayWithGroundReferencePlane(
        { x: 0, y: 1, z: 0 },
        { x: 0, y: Number.NEGATIVE_INFINITY, z: 0 },
      ),
    ).toBeNull();
  });

  it("does not mutate the caller ray", () => {
    const origin = { x: 1, y: 2, z: 3 };
    const direction = { x: 0, y: -1, z: 0 };
    intersectRayWithGroundReferencePlane(origin, direction);
    expect(origin).toEqual({ x: 1, y: 2, z: 3 });
    expect(direction).toEqual({ x: 0, y: -1, z: 0 });
  });

  it("does not import renderer, physics fields, or camera types", () => {
    expect(helperSrc).not.toMatch(/from ["']three["']/);
    expect(helperSrc).not.toMatch(/TracerScene/);
    expect(helperSrc).not.toMatch(/OrbitControls/);
    expect(helperSrc).not.toMatch(/from ["'].*physics\//);
    expect(helperSrc).not.toMatch(/from ["'].*rendering\//);
    expect(helperSrc).not.toMatch(/PerspectiveCamera/);
  });
});
