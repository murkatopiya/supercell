import { describe, expect, it } from "vitest";
import { CompareFlowGesture, intersectCompareFlowPlane, isCompareFlowPosition, offsetCompareFlowB } from "./CompareFlowPlacement.js";

describe("strict comparison placement", () => {
  it.each([[1500, -1000], [5500, -1000], [1500, 1000], [5500, 1000], [2345.125, -79.75]])("accepts exact edge/interior (%s,%s) without snapping", (x, z) => {
    expect(intersectCompareFlowPlane({ origin: { x, y: 2000, z }, direction: { x: 0, y: -20, z: 0 } })).toEqual({ kind: "valid", position: { x, y: 1000, z } });
  });
  it.each([[1500 - 1e-9, 0], [5500 + 1e-9, 0], [2000, -1000 - 1e-9], [2000, 1000 + 1e-9]])("rejects numerical overshoot (%s,%s), no epsilon clamp", (x, z) => {
    expect(intersectCompareFlowPlane({ origin: { x, y: 2000, z }, direction: { x: 0, y: -1, z: 0 } })).toEqual({ kind: "invalid", reason: "bounds" });
  });
  it.each([
    { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, { x: 1, y: 1e-8, z: 0 },
    { x: 1, y: -0.5e-8, z: 0 }, { x: NaN, y: -1, z: 0 }, { x: 0, y: -Infinity, z: 0 },
    { x: 0, y: 1, z: 0 },
  ])("rejects zero/parallel/near-parallel/nonfinite/backward ray %j", direction => {
    expect(intersectCompareFlowPlane({ origin: { x: 2500, y: 2000, z: 0 }, direction })).toEqual({ kind: "invalid", reason: "ray" });
  });
  it("rejects missing/nonfinite origin and non-unique coplanar ray, accepts above cutoff", () => {
    expect(intersectCompareFlowPlane(null).kind).toBe("invalid");
    expect(intersectCompareFlowPlane({ origin: { x: Infinity, y: 2000, z: 0 }, direction: { x: 0, y: -1, z: 0 } }).kind).toBe("invalid");
    expect(intersectCompareFlowPlane({ origin: { x: 2500, y: 1000, z: 0 }, direction: { x: 1, y: 0, z: 0 } }).kind).toBe("invalid");
    expect(intersectCompareFlowPlane({ origin: { x: 2500, y: 1000 + 1e-8, z: 0 }, direction: { x: 1, y: -2e-8, z: 0 } }).kind).toBe("valid");
  });
  it("preserves fractional coordinates and North=-Z in relative steps", () => {
    const p = { x: 2400.125, y: 1000, z: -80.75 };
    expect(offsetCompareFlowB(p, "east")).toEqual({ ...p, x: 2500.125 });
    expect(offsetCompareFlowB(p, "west")).toEqual({ ...p, x: 2300.125 });
    expect(offsetCompareFlowB(p, "north")).toEqual({ ...p, z: -180.75 });
    expect(offsetCompareFlowB(p, "south")).toEqual({ ...p, z: 19.25 });
    expect(isCompareFlowPosition({ ...p, y: 1001 })).toBe(false);
  });
  it.each(["east", "west", "north", "south"] as const)("uses a shorter final %s step and returns same position at edge", direction => {
    const p = { x: direction === "west" ? 1510.5 : 5490.5, y: 1000, z: direction === "north" ? -990.5 : 990.5 };
    const edge = offsetCompareFlowB(p, direction);
    expect(offsetCompareFlowB(edge, direction)).toBe(edge);
    expect(Math.hypot(edge.x - p.x, edge.z - p.z)).toBeLessThan(100);
  });
});

describe("single stationary gesture", () => {
  it("accepts one matching primary click including 5px, never a duplicate up", () => {
    const g = new CompareFlowGesture(); g.begin(1, 10, 20, true, 0);
    expect(g.end(1, 13, 24)).toBe(true); expect(g.end(1, 13, 24)).toBe(false);
  });
  it.each(["drag", "cancel", "multitouch", "wrong-id", "secondary"])("cannot resurrect %s gesture", reason => {
    const g = new CompareFlowGesture(); g.begin(1, 10, 20, true, 0);
    if (reason === "drag") { g.move(1, 20, 20); g.move(1, 10, 20); }
    if (reason === "cancel") g.cancel();
    if (reason === "multitouch") g.begin(2, 10, 20, false, 0);
    if (reason === "wrong-id") g.move(2, 10, 20);
    if (reason === "secondary") g.begin(1, 10, 20, true, 2);
    expect(g.end(1, 10, 20)).toBe(false);
  });
});
