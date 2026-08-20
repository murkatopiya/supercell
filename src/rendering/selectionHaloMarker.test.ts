import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { DEEP_STORM_TRACER_VIEW } from "./deepStormTracerView.js";
import { PICK_TOLERANCE_PX } from "./pickVisibleTracerSlot.js";
import pickVisibleTracerSlotSrc from "./pickVisibleTracerSlot.ts?raw";
import { RELEASE_PREVIEW_COLOR, createReleasePreviewMarker } from "./releasePreviewMarker.js";
import {
  SELECTION_HALO_COLOR,
  SELECTION_HALO_RADIUS_SCALE,
  createSelectionHaloMarker,
  disposeSelectionHaloMarker,
  selectionHaloRadiusM,
  syncSelectionHaloMarker,
} from "./selectionHaloMarker.js";
import selectionHaloSrc from "./selectionHaloMarker.ts?raw";
import { TRACER_COLORS, createTracerObserveSlot, disposeTracerObserveSlot } from "./tracerObserveSlot.js";
import tracerObserveSlotSrc from "./tracerObserveSlot.ts?raw";
import tracerSceneSrc from "./TracerScene.ts?raw";

function materialHex(mesh: THREE.Mesh): number {
  return (mesh.material as THREE.MeshBasicMaterial).color.getHex();
}

describe("selectionHaloMarker", () => {
  it("creates one hidden wireframe shell distinct from preview and occupancy colors", () => {
    const glyphR = DEEP_STORM_TRACER_VIEW.sphereRadiusM;
    const radius = selectionHaloRadiusM(glyphR);
    expect(SELECTION_HALO_RADIUS_SCALE).toBe(1.6);
    expect(radius).toBe(glyphR * 1.6);
    expect(radius).toBeGreaterThan(glyphR);

    const halo = createSelectionHaloMarker(radius);
    const material = halo.material as THREE.MeshBasicMaterial;
    expect(halo.name).toBe("selectionHalo");
    expect(halo.visible).toBe(false);
    expect(material.wireframe).toBe(true);
    expect(material.transparent).toBe(true);
    expect(material.opacity).toBe(0.9);
    expect(material.color.getHex()).toBe(SELECTION_HALO_COLOR);
    expect(SELECTION_HALO_COLOR).not.toBe(RELEASE_PREVIEW_COLOR);
    expect(TRACER_COLORS).not.toContain(SELECTION_HALO_COLOR);
    expect(SELECTION_HALO_COLOR).not.toBe(0xffcc33);

    const preview = createReleasePreviewMarker(glyphR);
    expect(preview.name).toBe("exploreReleasePreview");
    expect(preview.name).not.toBe(halo.name);
    expect(materialHex(preview)).toBe(RELEASE_PREVIEW_COLOR);

    disposeSelectionHaloMarker(halo);
    preview.geometry.dispose();
    (preview.material as THREE.Material).dispose();
  });

  it("shows at a visible glyph and hides when the glyph is hidden or cleared", () => {
    const halo = createSelectionHaloMarker(240);
    syncSelectionHaloMarker(halo, {
      visible: true,
      position: { x: 10, y: 20, z: -30 },
    });
    expect(halo.visible).toBe(true);
    expect(halo.position.toArray()).toEqual([10, 20, -30]);

    syncSelectionHaloMarker(halo, {
      visible: true,
      position: { x: 100, y: 200, z: 300 },
    });
    expect(halo.visible).toBe(true);
    expect(halo.position.toArray()).toEqual([100, 200, 300]);

    syncSelectionHaloMarker(halo, {
      visible: false,
      position: { x: 100, y: 200, z: 300 },
    });
    expect(halo.visible).toBe(false);

    syncSelectionHaloMarker(halo, null);
    expect(halo.visible).toBe(false);
    disposeSelectionHaloMarker(halo);
  });

  it("A→B reuses one marker without leaving a second shell", () => {
    const halo = createSelectionHaloMarker(240);
    syncSelectionHaloMarker(halo, {
      visible: true,
      position: { x: 1, y: 2, z: 3 },
    });
    const identity = halo;
    syncSelectionHaloMarker(halo, {
      visible: true,
      position: { x: 9, y: 8, z: 7 },
    });
    expect(halo).toBe(identity);
    expect(halo.position.toArray()).toEqual([9, 8, 7]);
    disposeSelectionHaloMarker(halo);
  });

  it("disables mesh raycast so it cannot become a raycast pick target", () => {
    const halo = createSelectionHaloMarker(240);
    halo.position.set(0, 0, 0);
    halo.visible = true;
    halo.updateMatrixWorld(true);
    const raycaster = new THREE.Raycaster(
      new THREE.Vector3(0, 0, 10),
      new THREE.Vector3(0, 0, -1),
    );
    expect(raycaster.intersectObject(halo, false)).toEqual([]);
    disposeSelectionHaloMarker(halo);
  });

  it("does not import simulation or physics", () => {
    expect(selectionHaloSrc).not.toMatch(/from ["'].*simulation/);
    expect(selectionHaloSrc).not.toMatch(/from ["'].*physics/);
    expect(selectionHaloSrc).not.toMatch(/TracerParticle/);
    expect(selectionHaloSrc).not.toMatch(/TracerSelection/);
  });
});

describe("base-color preservation (Slice 2)", () => {
  it("keeps occupancy glyph and trail colors when selection indication changes", () => {
    const sharedGeometry = new THREE.SphereGeometry(1, 8, 6);
    const first = createTracerObserveSlot(0, sharedGeometry, { trails: true });
    const second = createTracerObserveSlot(1, sharedGeometry, { trails: true });
    expect(materialHex(first.mesh)).toBe(TRACER_COLORS[0]);
    expect(materialHex(second.mesh)).toBe(TRACER_COLORS[1]);

    const halo = createSelectionHaloMarker(1.6);
    syncSelectionHaloMarker(halo, {
      visible: true,
      position: {
        x: first.mesh.position.x,
        y: first.mesh.position.y,
        z: first.mesh.position.z,
      },
    });
    expect(materialHex(first.mesh)).toBe(TRACER_COLORS[0]);
    expect(materialHex(second.mesh)).toBe(TRACER_COLORS[1]);
    expect(
      (first.trail!.material as THREE.LineBasicMaterial).color.getHex(),
    ).toBe(TRACER_COLORS[0]);

    syncSelectionHaloMarker(halo, {
      visible: true,
      position: {
        x: second.mesh.position.x,
        y: second.mesh.position.y,
        z: second.mesh.position.z,
      },
    });
    expect(materialHex(first.mesh)).toBe(TRACER_COLORS[0]);
    expect(materialHex(second.mesh)).toBe(TRACER_COLORS[1]);

    disposeSelectionHaloMarker(halo);
    disposeTracerObserveSlot(first);
    disposeTracerObserveSlot(second);
    sharedGeometry.dispose();
  });

  it("retires the yellow selected-glyph override from the observe-slot module", () => {
    expect(tracerObserveSlotSrc).not.toMatch(/SELECTED_TRACER_GLYPH_COLOR/);
    expect(tracerObserveSlotSrc).not.toMatch(/0xffcc33/);
    expect(tracerObserveSlotSrc).not.toMatch(/syncSelectedTracerGlyph/);
    expect(tracerSceneSrc).not.toMatch(/syncSelectedTracerGlyph/);
    expect(tracerSceneSrc).not.toMatch(/SELECTED_TRACER_GLYPH_COLOR/);
    expect(tracerSceneSrc).toMatch(/createSelectionHaloMarker/);
    expect(tracerSceneSrc).toMatch(/observeSelectionHalo/);
    expect(tracerSceneSrc).toMatch(/syncSelectionHaloMarker/);
  });
});

describe("Slice 1 acquisition remains intact", () => {
  it("keeps PICK_TOLERANCE_PX at 16 and does not pick via halo geometry", () => {
    expect(PICK_TOLERANCE_PX).toBe(16);
    expect(pickVisibleTracerSlotSrc).toMatch(/PICK_TOLERANCE_PX = 16/);
    expect(tracerSceneSrc).toMatch(
      /pickVisibleTracerSlotAtClientPoint\(\s*this\.slots/,
    );
    expect(tracerSceneSrc).not.toMatch(
      /pickVisibleTracerSlotAtClientPoint\([^\)]*selectionHalo/,
    );
    expect(tracerSceneSrc).not.toMatch(
      /pickVisibleTracerSlotAtClientPoint\([^\)]*preview/,
    );
  });
});
