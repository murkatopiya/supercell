import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { DEEP_STORM_TRACER_VIEW } from "./deepStormTracerView.js";
import { SELECTION_HALO_COLOR } from "./selectionHaloMarker.js";
import { RELEASE_PREVIEW_COLOR } from "./releasePreviewMarker.js";
import { TRACER_COLORS } from "./tracerObserveSlot.js";
import {
  HISTORICAL_PROBE_MARKER_COLOR,
  HISTORICAL_PROBE_RADIUS_SCALE,
  createHistoricalPathProbeMarker,
  disposeHistoricalPathProbeMarker,
  historicalProbeMarkerRadiusM,
  syncHistoricalPathProbeMarker,
} from "./historicalPathProbeMarker.js";
import markerSrc from "./historicalPathProbeMarker.ts?raw";

describe("historicalPathProbeMarker", () => {
  it("is smaller than the glyph and distinct from halo, preview, and occupancy colors", () => {
    const glyphR = DEEP_STORM_TRACER_VIEW.sphereRadiusM;
    const radius = historicalProbeMarkerRadiusM(glyphR);
    expect(HISTORICAL_PROBE_RADIUS_SCALE).toBe(0.55);
    expect(radius).toBeLessThan(glyphR);
    expect(HISTORICAL_PROBE_MARKER_COLOR).not.toBe(SELECTION_HALO_COLOR);
    expect(HISTORICAL_PROBE_MARKER_COLOR).not.toBe(RELEASE_PREVIEW_COLOR);
    expect(TRACER_COLORS).not.toContain(HISTORICAL_PROBE_MARKER_COLOR);

    const marker = createHistoricalPathProbeMarker(radius);
    expect(marker.name).toBe("historicalPathProbe");
    expect(marker.visible).toBe(false);
    expect((marker.material as THREE.MeshBasicMaterial).color.getHex()).toBe(
      HISTORICAL_PROBE_MARKER_COLOR,
    );
    disposeHistoricalPathProbeMarker(marker);
  });

  it("shows at the sample and hides when cleared", () => {
    const marker = createHistoricalPathProbeMarker(80);
    syncHistoricalPathProbeMarker(marker, { x: 10, y: 20, z: -30 });
    expect(marker.visible).toBe(true);
    expect(marker.position.toArray()).toEqual([10, 20, -30]);
    syncHistoricalPathProbeMarker(marker, null);
    expect(marker.visible).toBe(false);
    disposeHistoricalPathProbeMarker(marker);
  });

  it("disables mesh raycast so it cannot become a pick target", () => {
    const marker = createHistoricalPathProbeMarker(80);
    marker.position.set(0, 0, 0);
    marker.visible = true;
    marker.updateMatrixWorld(true);
    const raycaster = new THREE.Raycaster(
      new THREE.Vector3(0, 0, 10),
      new THREE.Vector3(0, 0, -1),
    );
    expect(raycaster.intersectObject(marker, false)).toEqual([]);
    disposeHistoricalPathProbeMarker(marker);
  });

  it("does not import simulation or physics", () => {
    expect(markerSrc).not.toMatch(/from ["'].*simulation/);
    expect(markerSrc).not.toMatch(/from ["'].*physics/);
    expect(markerSrc).not.toMatch(/TracerParticle/);
    expect(markerSrc).not.toMatch(/TracerSelection/);
  });
});
