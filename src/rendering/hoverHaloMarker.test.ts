import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { DEEP_STORM_TRACER_VIEW } from "./deepStormTracerView.js";
import {
  SELECTION_HALO_COLOR,
  SELECTION_HALO_RADIUS_SCALE,
  selectionHaloRadiusM,
} from "./selectionHaloMarker.js";
import { TRACER_COLORS } from "./tracerObserveSlot.js";
import {
  HOVER_HALO_COLOR,
  HOVER_HALO_OPACITY,
  HOVER_HALO_RADIUS_SCALE,
  createHoverHaloMarker,
  disposeHoverHaloMarker,
  hoverHaloRadiusM,
  persistHoveredSlotIndex,
  resolveHoverHaloObservation,
  syncHoverHaloMarker,
} from "./hoverHaloMarker.js";
import { HISTORICAL_PROBE_MARKER_COLOR } from "./historicalPathProbeMarker.js";
import { OPERAND_HIGHLIGHT_PROTOTYPE_HUE } from "../visualization/operandContributionDisplay.js";
import hoverSrc from "./hoverHaloMarker.ts?raw";

describe("hoverHaloMarker", () => {
  it("is weaker and smaller than the selection halo", () => {
    const glyphR = DEEP_STORM_TRACER_VIEW.sphereRadiusM;
    expect(HOVER_HALO_RADIUS_SCALE).toBeLessThan(SELECTION_HALO_RADIUS_SCALE);
    expect(hoverHaloRadiusM(glyphR)).toBeLessThan(selectionHaloRadiusM(glyphR));
    expect(HOVER_HALO_OPACITY).toBeLessThan(0.9);
    expect(HOVER_HALO_COLOR).not.toBe(SELECTION_HALO_COLOR);
    expect(TRACER_COLORS).not.toContain(HOVER_HALO_COLOR);
    expect(HOVER_HALO_COLOR).not.toBe(HISTORICAL_PROBE_MARKER_COLOR);
    expect(HOVER_HALO_COLOR).not.toBe(OPERAND_HIGHLIGHT_PROTOTYPE_HUE);
    expect(HOVER_HALO_COLOR).not.toBe(0xffcc33);

    const halo = createHoverHaloMarker(hoverHaloRadiusM(glyphR));
    const material = halo.material as THREE.MeshBasicMaterial;
    expect(halo.name).toBe("hoverHalo");
    expect(halo.visible).toBe(false);
    expect(material.wireframe).toBe(true);
    expect(material.opacity).toBe(HOVER_HALO_OPACITY);
    expect(material.color.getHex()).toBe(HOVER_HALO_COLOR);
    disposeHoverHaloMarker(halo);
  });

  it("follows a visible glyph and hides when cleared", () => {
    const halo = createHoverHaloMarker(200);
    syncHoverHaloMarker(halo, {
      visible: true,
      position: { x: 4, y: 5, z: 6 },
    });
    expect(halo.visible).toBe(true);
    expect(halo.position.toArray()).toEqual([4, 5, 6]);
    syncHoverHaloMarker(halo, null);
    expect(halo.visible).toBe(false);
    disposeHoverHaloMarker(halo);
  });

  it("disables raycast and does not own selection", () => {
    const halo = createHoverHaloMarker(200);
    halo.position.set(0, 0, 0);
    halo.visible = true;
    halo.updateMatrixWorld(true);
    const raycaster = new THREE.Raycaster(
      new THREE.Vector3(0, 0, 10),
      new THREE.Vector3(0, 0, -1),
    );
    expect(raycaster.intersectObject(halo, false)).toEqual([]);
    expect(hoverSrc).not.toMatch(/TracerSelection/);
    expect(hoverSrc).not.toMatch(/selectedId/);
    disposeHoverHaloMarker(halo);
  });

  it("keeps selected appearance over hover when both apply to the same slot", () => {
    const glyph = { visible: true, position: { x: 1, y: 2, z: 3 } };
    expect(
      resolveHoverHaloObservation({
        hoveredSlotIndex: 0,
        selectedSlotIndex: null,
        hoveredGlyph: glyph,
      }),
    ).toEqual({ visible: true, position: glyph.position });
    expect(
      resolveHoverHaloObservation({
        hoveredSlotIndex: 0,
        selectedSlotIndex: 0,
        hoveredGlyph: glyph,
      }),
    ).toBeNull();
    expect(
      resolveHoverHaloObservation({
        hoveredSlotIndex: 1,
        selectedSlotIndex: 0,
        hoveredGlyph: glyph,
      }),
    ).toEqual({ visible: true, position: glyph.position });
    expect(
      resolveHoverHaloObservation({
        hoveredSlotIndex: 0,
        selectedSlotIndex: null,
        hoveredGlyph: { visible: false, position: glyph.position },
      }),
    ).toBeNull();
  });

  it("clears a stale hovered slot after the glyph disappears", () => {
    expect(persistHoveredSlotIndex(1, true)).toBe(1);
    expect(persistHoveredSlotIndex(1, false)).toBeNull();
    expect(persistHoveredSlotIndex(null, false)).toBeNull();
  });
});
