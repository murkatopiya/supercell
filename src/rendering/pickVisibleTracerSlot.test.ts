import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { createReleasePreviewMarker } from "./releasePreviewMarker.js";
import { pickVisibleTracerSlotIndex } from "./pickVisibleTracerSlot.js";
import pickVisibleTracerSlotSrc from "./pickVisibleTracerSlot.ts?raw";
import tracerSceneSrc from "./TracerScene.ts?raw";
import type { WorldRay } from "./worldRayFromCameraNdc.js";

function sphereAt(x: number, y: number, z: number, visible = true): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12));
  mesh.position.set(x, y, z);
  mesh.visible = visible;
  mesh.updateMatrixWorld(true);
  return mesh;
}

function rayTowardNegativeZ(originZ: number): WorldRay {
  return {
    origin: { x: 0, y: 0, z: originZ },
    direction: { x: 0, y: 0, z: -1 },
  };
}

describe("pickVisibleTracerSlotIndex", () => {
  it("returns the slot index of a visible glyph hit by the ray", () => {
    const slots = [{ mesh: sphereAt(0, 0, 0) }];
    expect(pickVisibleTracerSlotIndex(slots, rayTowardNegativeZ(10))).toBe(0);
  });

  it("returns the nearest visible glyph when the ray hits several", () => {
    const nearer = sphereAt(0, 0, 4);
    const farther = sphereAt(0, 0, -4);
    const slots = [{ mesh: farther }, { mesh: nearer }];
    expect(pickVisibleTracerSlotIndex(slots, rayTowardNegativeZ(20))).toBe(1);
  });

  it("does not pick a hidden glyph", () => {
    const hidden = sphereAt(0, 0, 0, false);
    expect(pickVisibleTracerSlotIndex([{ mesh: hidden }], rayTowardNegativeZ(10))).toBeNull();

    const hiddenNear = sphereAt(0, 0, 4, false);
    const visibleFar = sphereAt(0, 0, -4, true);
    expect(
      pickVisibleTracerSlotIndex(
        [{ mesh: hiddenNear }, { mesh: visibleFar }],
        rayTowardNegativeZ(20),
      ),
    ).toBe(1);
  });

  it("does not treat the release preview as a tracer hit", () => {
    const preview = createReleasePreviewMarker(1);
    preview.position.set(0, 0, 8);
    preview.visible = true;
    preview.updateMatrixWorld(true);
    const offRay = sphereAt(40, 0, 0);
    const onRay = sphereAt(0, 0, 0);

    expect(
      pickVisibleTracerSlotIndex([{ mesh: offRay }], rayTowardNegativeZ(20)),
    ).toBeNull();
    expect(
      pickVisibleTracerSlotIndex([{ mesh: onRay }], rayTowardNegativeZ(20)),
    ).toBe(0);

    expect(pickVisibleTracerSlotSrc).not.toMatch(/preview/);
    expect(tracerSceneSrc).toMatch(/pickVisibleTracerSlotIndex\(this\.slots/);
    expect(tracerSceneSrc).not.toMatch(/pickVisibleTracerSlotIndex\([^\)]*preview/);
  });

  it("does not mutate the input ray", () => {
    const ray = rayTowardNegativeZ(10);
    pickVisibleTracerSlotIndex([{ mesh: sphereAt(0, 0, 0) }], ray);
    expect(ray).toEqual({
      origin: { x: 0, y: 0, z: 10 },
      direction: { x: 0, y: 0, z: -1 },
    });
  });
});
