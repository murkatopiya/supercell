/** @vitest-environment happy-dom */
import { describe, expect, it, vi } from "vitest";
import { cardinalWorldPosition, WORLD_CARDINAL_DIRECTIONS, createWorldCoordinateReference, disposeWorldCoordinateReference } from "./worldCoordinateReference.js";
import sceneSrc from "./TracerScene.ts?raw";
import helperSrc from "./worldCoordinateReference.ts?raw";

describe("world coordinate cardinal mapping", () => {
  it("omits only distance labels when explicitly disabled; defaults retain all labels", () => {
    const context = { clearRect: vi.fn(), strokeText: vi.fn(), fillText: vi.fn() };
    const mock = vi.spyOn(HTMLCanvasElement.prototype, "getContext")
      .mockReturnValue(context as unknown as CanvasRenderingContext2D);
    const groups: ReturnType<typeof createWorldCoordinateReference>[] = [];
    try {
      const normal = createWorldCoordinateReference(10000, 10);
      const explicit = createWorldCoordinateReference(10000, 10, { distanceLabelsVisible: true });
      const learn = createWorldCoordinateReference(10000, 10, { distanceLabelsVisible: false });
      groups.push(normal, explicit, learn);
      const labels = (group: typeof normal) => group.children.map(child => child.name);
      expect(labels(normal).filter(name => name.includes(" km"))).toHaveLength(8);
      expect(labels(explicit)).toEqual(labels(normal));
      expect(labels(learn)).toEqual(labels(normal).filter(name => !name.includes(" km")));
      for (const child of learn.children) {
        const original = normal.children.find(item => item.name === child.name)!;
        expect(child.position.toArray()).toEqual(original.position.toArray());
        expect(child.scale.toArray()).toEqual(original.scale.toArray());
      }
      expect(labels(learn)).toEqual(expect.arrayContaining([
        "worldCoordinateOriginCross", "worldCoordinateOrigin", "worldCoordinateLabel:0",
        ...["N", "S", "E", "W"].map(name => `worldCoordinateLabel:${name}`),
      ]));
      expect(learn.children[0]!.type).toBe("GridHelper");
      expect(sceneSrc).toContain("distanceLabelsVisible: options?.distanceLabelsVisible");
    } finally {
      groups.forEach(disposeWorldCoordinateReference);
      mock.mockRestore();
    }
  });
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
