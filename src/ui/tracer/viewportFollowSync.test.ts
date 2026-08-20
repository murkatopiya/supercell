import { describe, expect, it } from "vitest";
import { viewportFollowSync } from "./viewportFollowSync.js";
import type { Vec3 } from "../../core/math/Vec3.js";

function particle(tracerId: number, position: Vec3, active = true) {
  return { tracerId, position, active };
}

describe("viewportFollowSync", () => {
  it("clears when Follow is OFF even if a tracer is selected", () => {
    const selected = particle(1, { x: 10, y: 20, z: 30 });
    expect(
      viewportFollowSync({
        followEnabled: false,
        particles: [selected],
        selectedTracerId: 1,
      }),
    ).toEqual({ kind: "clear" });
  });

  it("sets the live selected position when Follow is ON", () => {
    const position = { x: 100, y: 200, z: 300 };
    const result = viewportFollowSync({
      followEnabled: true,
      particles: [particle(1, position)],
      selectedTracerId: 1,
    });
    expect(result).toEqual({ kind: "set", position });
    if (result.kind === "set") {
      expect(result.position).toBe(position);
    }
  });

  it("returns unavailable when Follow is ON and the id does not resolve", () => {
    expect(
      viewportFollowSync({
        followEnabled: true,
        particles: [particle(1, { x: 0, y: 0, z: 0 })],
        selectedTracerId: 99,
      }),
    ).toEqual({ kind: "unavailable" });
    expect(
      viewportFollowSync({
        followEnabled: true,
        particles: [particle(1, { x: 0, y: 0, z: 0 })],
        selectedTracerId: null,
      }),
    ).toEqual({ kind: "unavailable" });
    expect(
      viewportFollowSync({
        followEnabled: true,
        particles: [],
        selectedTracerId: 1,
      }),
    ).toEqual({ kind: "unavailable" });
  });

  it("keeps Follow valid for an inactive selected tracer at the frozen marker", () => {
    const frozen = { x: 5, y: 6, z: 7 };
    const result = viewportFollowSync({
      followEnabled: true,
      particles: [particle(2, frozen, false)],
      selectedTracerId: 2,
    });
    expect(result).toEqual({ kind: "set", position: frozen });
  });

  it("retargets A→B to B's current position without copying", () => {
    const a = { x: 1, y: 1, z: 1 };
    const b = { x: 9, y: 8, z: 7 };
    const particles = [particle(1, a), particle(2, b)];
    const fromA = viewportFollowSync({
      followEnabled: true,
      particles,
      selectedTracerId: 1,
    });
    const fromB = viewportFollowSync({
      followEnabled: true,
      particles,
      selectedTracerId: 2,
    });
    expect(fromA).toEqual({ kind: "set", position: a });
    expect(fromB).toEqual({ kind: "set", position: b });
    if (fromB.kind === "set") {
      expect(fromB.position).toBe(b);
    }
  });

  it("reads mutated x/y/z from the same particle and position object", () => {
    const position = { x: 1, y: 2, z: 3 };
    const selected = particle(1, position);
    const before = viewportFollowSync({
      followEnabled: true,
      particles: [selected],
      selectedTracerId: 1,
    });
    position.x = 40;
    position.y = 50;
    position.z = 60;
    const after = viewportFollowSync({
      followEnabled: true,
      particles: [selected],
      selectedTracerId: 1,
    });
    expect(selected).toBe(selected);
    expect(selected.position).toBe(position);
    expect(before).toEqual({ kind: "set", position });
    expect(after).toEqual({
      kind: "set",
      position: { x: 40, y: 50, z: 60 },
    });
    if (after.kind === "set") {
      expect(after.position).toBe(position);
      expect(after.position.x).toBe(40);
    }
  });
});
