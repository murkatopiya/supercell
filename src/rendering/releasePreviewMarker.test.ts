import { describe, expect, it } from "vitest";
import * as THREE from "three";
import tracerSceneSrc from "./TracerScene.ts?raw";
import {
  RELEASE_PREVIEW_COLOR,
  createReleasePreviewMarker,
  disposeReleasePreviewMarker,
  syncReleasePreviewMarker,
} from "./releasePreviewMarker.js";
import { TRACER_COLORS } from "./tracerObserveSlot.js";

describe("release preview marker (no WebGLRenderer)", () => {
  it("is hidden when the pending seed is null", () => {
    const mesh = createReleasePreviewMarker(150);
    expect(mesh.visible).toBe(false);
    expect(mesh.name).toBe("exploreReleasePreview");
    syncReleasePreviewMarker(mesh, { x: 1, y: 2, z: 3 });
    expect(mesh.visible).toBe(true);
    syncReleasePreviewMarker(mesh, null);
    expect(mesh.visible).toBe(false);
    disposeReleasePreviewMarker(mesh);
  });

  it("is visible at pending coordinates and updates without recreation", () => {
    const mesh = createReleasePreviewMarker(150);
    const identity = mesh;
    syncReleasePreviewMarker(mesh, { x: 100, y: 1000, z: -40 });
    expect(mesh.visible).toBe(true);
    expect(mesh.position.toArray()).toEqual([100, 1000, -40]);

    syncReleasePreviewMarker(mesh, { x: 200, y: 250, z: 9 });
    expect(mesh).toBe(identity);
    expect(mesh.position.toArray()).toEqual([200, 250, 9]);
    disposeReleasePreviewMarker(mesh);
  });

  it("is not a tracer color and not a trail resource", () => {
    const mesh = createReleasePreviewMarker(150);
    const material = mesh.material as THREE.MeshBasicMaterial;
    expect(material.wireframe).toBe(true);
    expect(material.color.getHex()).toBe(RELEASE_PREVIEW_COLOR);
    expect(TRACER_COLORS).not.toContain(RELEASE_PREVIEW_COLOR);
    expect(mesh).toBeInstanceOf(THREE.Mesh);
    expect(mesh).not.toBeInstanceOf(THREE.Line);
    disposeReleasePreviewMarker(mesh);
  });

  it("disposes owned geometry and material once", () => {
    const mesh = createReleasePreviewMarker(150);
    const material = mesh.material as THREE.MeshBasicMaterial;
    let geometryDisposed = false;
    let materialDisposed = false;
    mesh.geometry.addEventListener("dispose", () => {
      geometryDisposed = true;
    });
    material.addEventListener("dispose", () => {
      materialDisposed = true;
    });
    disposeReleasePreviewMarker(mesh);
    expect(geometryDisposed).toBe(true);
    expect(materialDisposed).toBe(true);
  });

  it("does not create tracer slots or path-history resources", () => {
    const mesh = createReleasePreviewMarker(150);
    const scene = new THREE.Scene();
    scene.add(mesh);
    syncReleasePreviewMarker(mesh, { x: 0, y: 0, z: 0 });
    expect(scene.children).toHaveLength(1);
    expect(scene.children[0]).toBe(mesh);
    scene.remove(mesh);
    disposeReleasePreviewMarker(mesh);
    expect(tracerSceneSrc).toMatch(/syncReleasePreview/);
    expect(tracerSceneSrc).toMatch(/createReleasePreviewMarker/);
    expect(tracerSceneSrc).not.toMatch(/keepInactiveGlyphs \|\| pending/);
    expect(tracerSceneSrc).toMatch(/this\.clearTracerSlots\(\)/);
    expect(tracerSceneSrc).toMatch(/disposeReleasePreviewMarker/);
  });
});
