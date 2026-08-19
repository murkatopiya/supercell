import { describe, expect, it } from "vitest";
import * as THREE from "three";
import tracerSceneSrc from "./TracerScene.ts?raw";
import {
  SELECTED_TRACER_GLYPH_COLOR,
  TRACER_COLORS,
  createTracerObserveSlot,
  disposeTracerObserveSlot,
  syncSelectedTracerGlyph,
} from "./tracerObserveSlot.js";

function materialHex(mesh: THREE.Mesh): number {
  return (mesh.material as THREE.MeshBasicMaterial).color.getHex();
}

function trailHex(trail: THREE.Line): number {
  return (trail.material as THREE.LineBasicMaterial).color.getHex();
}

describe("tracer observe slots (no WebGLRenderer)", () => {
  it("starts at zero occupancy and can append one slot then a second", () => {
    const sharedGeometry = new THREE.SphereGeometry(1, 8, 6);
    const slots: ReturnType<typeof createTracerObserveSlot>[] = [];
    expect(slots).toHaveLength(0);

    slots.push(createTracerObserveSlot(0, sharedGeometry, { trails: true }));
    expect(slots).toHaveLength(1);
    expect(slots[0]!.mesh).toBeInstanceOf(THREE.Mesh);
    expect(slots[0]!.trail).toBeInstanceOf(THREE.Line);

    slots.push(createTracerObserveSlot(1, sharedGeometry, { trails: true }));
    expect(slots).toHaveLength(2);
    expect(slots[1]!.mesh).toBeInstanceOf(THREE.Mesh);
    expect(slots[1]!.trail).toBeInstanceOf(THREE.Line);

    for (const slot of slots) {
      disposeTracerObserveSlot(slot);
    }
    sharedGeometry.dispose();
  });

  it("cycles glyph and trail colors red, blue, green, red", () => {
    const sharedGeometry = new THREE.SphereGeometry(1, 8, 6);
    const slots = [0, 1, 2, 3].map((index) =>
      createTracerObserveSlot(index, sharedGeometry, { trails: true }),
    );

    expect(materialHex(slots[0]!.mesh)).toBe(TRACER_COLORS[0]);
    expect(materialHex(slots[1]!.mesh)).toBe(TRACER_COLORS[1]);
    expect(materialHex(slots[2]!.mesh)).toBe(TRACER_COLORS[2]);
    expect(materialHex(slots[3]!.mesh)).toBe(TRACER_COLORS[0]);
    expect(trailHex(slots[0]!.trail!)).toBe(TRACER_COLORS[0]);
    expect(trailHex(slots[1]!.trail!)).toBe(TRACER_COLORS[1]);
    expect(trailHex(slots[2]!.trail!)).toBe(TRACER_COLORS[2]);
    expect(trailHex(slots[3]!.trail!)).toBe(TRACER_COLORS[0]);

    for (const slot of slots) {
      disposeTracerObserveSlot(slot);
    }
    sharedGeometry.dispose();
  });

  it("does not create a trail resource when trails are disabled", () => {
    const sharedGeometry = new THREE.SphereGeometry(1, 8, 6);
    const slot = createTracerObserveSlot(0, sharedGeometry, { trails: false });
    expect(slot.mesh).toBeInstanceOf(THREE.Mesh);
    expect(slot.trail).toBeUndefined();
    disposeTracerObserveSlot(slot);
    sharedGeometry.dispose();
  });

  it("clearing slots disposes tracer resources and leaves shared geometry usable", () => {
    const sharedGeometry = new THREE.SphereGeometry(1, 8, 6);
    let geometryDisposed = false;
    sharedGeometry.addEventListener("dispose", () => {
      geometryDisposed = true;
    });

    const first = createTracerObserveSlot(0, sharedGeometry, { trails: true });
    const material = first.mesh.material as THREE.MeshBasicMaterial;
    expect(material.fog).toBe(false);
    const trailMaterial = first.trail!.material as THREE.LineBasicMaterial;
    expect(trailMaterial.fog).toBe(false);
    let meshMaterialDisposed = false;
    let trailGeometryDisposed = false;
    let trailMaterialDisposed = false;
    material.addEventListener("dispose", () => {
      meshMaterialDisposed = true;
    });
    first.trail!.geometry.addEventListener("dispose", () => {
      trailGeometryDisposed = true;
    });
    trailMaterial.addEventListener("dispose", () => {
      trailMaterialDisposed = true;
    });

    const scene = new THREE.Scene();
    scene.add(first.mesh);
    scene.add(first.trail!);
    scene.remove(first.mesh);
    scene.remove(first.trail!);
    disposeTracerObserveSlot(first);

    expect(meshMaterialDisposed).toBe(true);
    expect(trailGeometryDisposed).toBe(true);
    expect(trailMaterialDisposed).toBe(true);
    expect(geometryDisposed).toBe(false);

    const afterClear = createTracerObserveSlot(0, sharedGeometry, {
      trails: true,
    });
    scene.add(afterClear.mesh);
    scene.add(afterClear.trail!);
    expect(afterClear.mesh).toBeInstanceOf(THREE.Mesh);
    expect(afterClear.trail).toBeInstanceOf(THREE.Line);
    expect(materialHex(afterClear.mesh)).toBe(TRACER_COLORS[0]);
    expect(geometryDisposed).toBe(false);

    scene.remove(afterClear.mesh);
    scene.remove(afterClear.trail!);
    disposeTracerObserveSlot(afterClear);
    sharedGeometry.dispose();
    expect(geometryDisposed).toBe(true);
  });

  it("disposing a slot does not dispose shared geometry, and a second dispose of slot resources is not implied by empty occupancy", () => {
    const sharedGeometry = new THREE.SphereGeometry(1, 8, 6);
    let geometryDisposeCount = 0;
    sharedGeometry.addEventListener("dispose", () => {
      geometryDisposeCount += 1;
    });

    const slot = createTracerObserveSlot(0, sharedGeometry, { trails: false });
    const material = slot.mesh.material as THREE.MeshBasicMaterial;
    let materialDisposeCount = 0;
    material.addEventListener("dispose", () => {
      materialDisposeCount += 1;
    });

    disposeTracerObserveSlot(slot);
    expect(materialDisposeCount).toBe(1);
    expect(geometryDisposeCount).toBe(0);

    sharedGeometry.dispose();
    expect(geometryDisposeCount).toBe(1);
  });

  it("keeps TracerScene as the owner of camera/renderer while slots are appendable", () => {
    expect(tracerSceneSrc).toMatch(/addTracerSlot/);
    expect(tracerSceneSrc).toMatch(/addTracerSlots/);
    expect(tracerSceneSrc).toMatch(/clearTracerSlots/);
    expect(tracerSceneSrc).toMatch(/tracerSlotCount/);
    expect(tracerSceneSrc).toMatch(/createTracerObserveSlot/);
    expect(tracerSceneSrc).toMatch(/this\.controls\.dispose\(\)/);
    expect(tracerSceneSrc).toMatch(/this\.clearTracerSlots\(\)/);
    expect(tracerSceneSrc).toMatch(/this\.sharedGeometry\.dispose\(\)/);
    expect(tracerSceneSrc).toMatch(/this\.renderer\.dispose\(\)/);
    expect(tracerSceneSrc).toMatch(/pickVisibleTracer/);
    expect(tracerSceneSrc).toMatch(/syncSelectedSlot/);
    expect(tracerSceneSrc).not.toMatch(/TracerSelection/);
    expect(tracerSceneSrc).not.toMatch(/selectedId/);
    expect(tracerSceneSrc).not.toMatch(/TracerPedagogy/);
    expect(tracerSceneSrc).not.toMatch(/AtmosphericTracerDomain/);
  });

  it("highlights the selected glyph and restores occupancy color without replacing the mesh", () => {
    const sharedGeometry = new THREE.SphereGeometry(1, 8, 6);
    const first = createTracerObserveSlot(0, sharedGeometry, { trails: false });
    const second = createTracerObserveSlot(1, sharedGeometry, { trails: false });
    const firstMesh = first.mesh;
    const secondMesh = second.mesh;

    expect(materialHex(firstMesh)).toBe(TRACER_COLORS[0]);
    expect(materialHex(secondMesh)).toBe(TRACER_COLORS[1]);

    syncSelectedTracerGlyph(firstMesh, 0, true);
    expect(materialHex(firstMesh)).toBe(SELECTED_TRACER_GLYPH_COLOR);
    expect(materialHex(secondMesh)).toBe(TRACER_COLORS[1]);

    syncSelectedTracerGlyph(firstMesh, 0, false);
    syncSelectedTracerGlyph(secondMesh, 1, true);
    expect(first.mesh).toBe(firstMesh);
    expect(second.mesh).toBe(secondMesh);
    expect(materialHex(firstMesh)).toBe(TRACER_COLORS[0]);
    expect(materialHex(secondMesh)).toBe(SELECTED_TRACER_GLYPH_COLOR);

    disposeTracerObserveSlot(first);
    disposeTracerObserveSlot(second);
    sharedGeometry.dispose();
  });
});
