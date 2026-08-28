import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type { TracerAdvectionState } from "../simulation/TracerParticle.js";
import type { TracerPathHistory } from "../simulation/TracerPathHistory.js";
import { DEEP_STORM_TRACER_VIEW } from "./deepStormTracerView.js";
import { syncTrailLine } from "./trailGeometry.js";
import {
  createTracerObserveSlot,
  disposeTracerObserveSlot,
  type TracerObserveSlot,
} from "./tracerObserveSlot.js";
import {
  createReleasePreviewMarker,
  disposeReleasePreviewMarker,
  syncReleasePreviewMarker,
} from "./releasePreviewMarker.js";
import {
  createSelectionHaloMarker,
  disposeSelectionHaloMarker,
  selectionHaloRadiusM,
  syncSelectionHaloMarker,
} from "./selectionHaloMarker.js";
import {
  createHoverHaloMarker,
  disposeHoverHaloMarker,
  hoverHaloRadiusM,
  persistHoveredSlotIndex,
  resolveHoverHaloObservation,
  syncHoverHaloMarker,
} from "./hoverHaloMarker.js";
import {
  createHistoricalPathProbeMarker,
  disposeHistoricalPathProbeMarker,
  historicalProbeMarkerRadiusM,
  syncHistoricalPathProbeMarker,
} from "./historicalPathProbeMarker.js";
import type { Vec3 } from "../core/math/Vec3.js";
import type { TracerSeedPosition } from "../simulation/createTracersFromSeeds.js";
import {
  worldRayFromCameraNdc,
  type WorldRay,
} from "./worldRayFromCameraNdc.js";
import {
  pickVisibleTracerSlotAtClientPoint,
  type CanvasCssRect,
} from "./pickVisibleTracerSlot.js";
import {
  pickPathHistorySampleAtClientPoint,
  type PathHistorySampleHit,
} from "./pickPathHistorySample.js";
import { VISUAL_AIRFLOW_DEPTH_CUE } from "./visualAirflowAppearance.js";
import {
  copyFollowPoint,
  translateCameraFollowTarget,
} from "./translateCameraFollowTarget.js";
import { applyDeepStormTracerViewPose } from "./applyDeepStormTracerViewPose.js";
import {
  createWorldCoordinateReference,
  disposeWorldCoordinateReference,
} from "./worldCoordinateReference.js";

export { TRACER_COLORS } from "./tracerObserveSlot.js";
export {
  SELECTION_HALO_COLOR,
  SELECTION_HALO_RADIUS_SCALE,
} from "./selectionHaloMarker.js";

export interface TracerSceneOptions {
  /** When true, observe path-history as one Line per tracer. Default false. */
  trails?: boolean;
  /**
   * When true, inactive glyphs stay visible at the frozen particle
   * position. Default false (hide when active === false).
   * Renderer state, not domain policy.
   */
  keepInactiveGlyphs?: boolean;
}

/**
 * Observe-only glyph copy. Does not mutate the particle.
 * docs/architecture/12-downward-ground-impact-pedagogy.md
 */
export function syncObservedTracerGlyph(
  mesh: {
    visible: boolean;
    position: { set(x: number, y: number, z: number): void };
  },
  particle: TracerAdvectionState,
  keepInactiveGlyphs: boolean,
): void {
  mesh.visible = keepInactiveGlyphs || particle.active;
  mesh.position.set(particle.position.x, particle.position.y, particle.position.z);
}

/**
 * Imperative Three.js tracer scene.
 * Observes particle positions and optional path-history; never writes simulation state.
 *
 * Construction `tracerCount` is initial occupancy, including zero, not a
 * permanent ceiling. Use addTracerSlot / clearTracerSlots to grow or empty
 * tracer resources without recreating camera, OrbitControls, the
 * world coordinate-reference layer, or renderer.
 */
export class TracerScene {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly controls: OrbitControls;
  private readonly slots: TracerObserveSlot[] = [];
  private preview: THREE.Mesh | undefined;
  private selectionHalo: THREE.Mesh | undefined;
  private hoverHalo: THREE.Mesh | undefined;
  private historicalProbeMarker: THREE.Mesh | undefined;
  private visualAirflowObject: THREE.Object3D | undefined;
  private selectedSlotIndex: number | null = null;
  private hoveredOccupancyIndex: number | null = null;
  private followPoint: { x: number; y: number; z: number } | null = null;
  private depthCueEnabled = false;
  private readonly coordinateReference: THREE.Group;
  private readonly sharedGeometry: THREE.SphereGeometry;
  private readonly keepInactiveGlyphs: boolean;
  private readonly trailsEnabled: boolean;

  constructor(
    canvas: HTMLCanvasElement,
    tracerCount: number,
    options?: TracerSceneOptions,
  ) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x1a2332, 1);

    this.scene = new THREE.Scene();

    const view = DEEP_STORM_TRACER_VIEW;
    this.camera = new THREE.PerspectiveCamera(
      view.fovDeg,
      1,
      view.nearM,
      view.farM,
    );
    this.camera.position.set(
      view.cameraPosition.x,
      view.cameraPosition.y,
      view.cameraPosition.z,
    );
    this.camera.lookAt(view.target.x, view.target.y, view.target.z);

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.target.set(view.target.x, view.target.y, view.target.z);
    this.controls.enableDamping = false;
    this.controls.update();

    this.coordinateReference = createWorldCoordinateReference(
      view.gridSizeM,
      view.gridDivisions,
    );
    this.scene.add(this.coordinateReference);

    this.sharedGeometry = new THREE.SphereGeometry(view.sphereRadiusM, 16, 12);
    this.keepInactiveGlyphs = options?.keepInactiveGlyphs === true;
    this.trailsEnabled = options?.trails === true;

    for (let i = 0; i < tracerCount; i++) {
      this.addTracerSlot();
    }
  }

  get tracerSlotCount(): number {
    return this.slots.length;
  }

  /** Append one glyph, and a trail line when trails were enabled at construction. */
  addTracerSlot(): void {
    const slot = createTracerObserveSlot(
      this.slots.length,
      this.sharedGeometry,
      { trails: this.trailsEnabled },
    );
    this.scene.add(slot.mesh);
    if (slot.trail !== undefined) {
      this.scene.add(slot.trail);
    }
    this.slots.push(slot);
  }

  /** Append `count` slots. Empty count is a no-op. */
  addTracerSlots(count: number): void {
    if (!Number.isInteger(count) || count < 0) {
      throw new Error("count must be an integer >= 0");
    }
    for (let i = 0; i < count; i++) {
      this.addTracerSlot();
    }
  }

  /**
   * Dispose every tracer glyph/trail and drop slot count to 0.
   * Camera, OrbitControls, coordinate reference, shared geometry, and renderer stay.
   */
  clearTracerSlots(): void {
    for (const slot of this.slots) {
      this.scene.remove(slot.mesh);
      if (slot.trail !== undefined) {
        this.scene.remove(slot.trail);
      }
      disposeTracerObserveSlot(slot);
    }
    this.slots.length = 0;
    this.selectedSlotIndex = null;
    this.hoveredOccupancyIndex = null;
    this.observeSelectionHalo();
    this.observeHoverHalo();
  }

  /**
   * Camera-distance salience for background airflow. Not meteorological
   * fog and not a physics scalar. Scientific glyphs keep fog: false.
   */
  setDepthCueEnabled(enabled: boolean): void {
    if (this.depthCueEnabled === enabled) {
      return;
    }
    this.depthCueEnabled = enabled;
    this.scene.fog = enabled
      ? new THREE.Fog(
          VISUAL_AIRFLOW_DEPTH_CUE.color,
          VISUAL_AIRFLOW_DEPTH_CUE.nearM,
          VISUAL_AIRFLOW_DEPTH_CUE.farM,
        )
      : null;
  }

  get depthCueIsEnabled(): boolean {
    return this.depthCueEnabled;
  }

  /**
   * Show or hide the world grid, cardinals, distance marks, and origin.
   * Presentation only. Does not change picking, seeds, or simulation.
   */
  setCoordinateReferenceVisible(visible: boolean): void {
    this.coordinateReference.visible = visible;
  }

  /**
   * Attach an observe-only visual-airflow object. Not a tracer slot,
   * not pickable via pickVisibleTracerAtClientPoint, and not a preview marker.
   */
  attachVisualAirflow(object: THREE.Object3D): void {
    this.detachVisualAirflow();
    this.visualAirflowObject = object;
    this.scene.add(object);
  }

  /**
   * Remove the attached visual-airflow object. Does not dispose it.
   */
  detachVisualAirflow(): void {
    if (this.visualAirflowObject === undefined) {
      return;
    }
    this.scene.remove(this.visualAirflowObject);
    this.visualAirflowObject = undefined;
  }

  /**
   * Observe pending-release preview. Not a tracer slot.
   * Lazy-creates the marker on the first non-null seed.
   */
  syncReleasePreview(pendingSeed: TracerSeedPosition | null): void {
    if (pendingSeed === null) {
      if (this.preview !== undefined) {
        syncReleasePreviewMarker(this.preview, null);
      }
      return;
    }
    if (this.preview === undefined) {
      this.preview = createReleasePreviewMarker(
        DEEP_STORM_TRACER_VIEW.sphereRadiusM,
      );
      this.scene.add(this.preview);
    }
    syncReleasePreviewMarker(this.preview, pendingSeed);
  }

  /**
   * Camera unproject to a world ray. Not a 3D point pick.
   * Does not import Explore and does not intersect the ground plane.
   */
  worldRayFromNdc(ndcX: number, ndcY: number): WorldRay | null {
    return worldRayFromCameraNdc(this.camera, ndcX, ndcY);
  }

  /**
   * Screen-space pick of a visible scientific glyph center.
   * Slot index is occupancy layout, not tracerId.
   * Preview and visual airflow are not candidates (not in slots).
   * docs/architecture/36-explore-selection-acquisition-identity-architecture.md
   */
  pickVisibleTracerAtClientPoint(
    clientX: number,
    clientY: number,
    rect: CanvasCssRect,
  ): number | null {
    return pickVisibleTracerSlotAtClientPoint(
      this.slots,
      this.camera,
      clientX,
      clientY,
      rect,
    );
  }

  /**
   * Screen-space pick of a stored path-history sample.
   * Empty lanes are not candidates. Does not pick glyphs.
   * docs/architecture/52-historical-path-probe-architecture.md
   */
  pickPathHistorySampleAtClientPoint(
    pathHistory: TracerPathHistory,
    clientX: number,
    clientY: number,
    rect: CanvasCssRect,
  ): PathHistorySampleHit | null {
    return pickPathHistorySampleAtClientPoint(
      pathHistory,
      this.camera,
      clientX,
      clientY,
      rect,
    );
  }

  /**
   * Observe the historical path-sample marker. Null hides it.
   * Live selection halo is a separate mesh and is not moved.
   */
  syncHistoricalPathProbe(position: Vec3 | null): void {
    if (position === null) {
      if (this.historicalProbeMarker !== undefined) {
        syncHistoricalPathProbeMarker(this.historicalProbeMarker, null);
      }
      return;
    }
    if (this.historicalProbeMarker === undefined) {
      this.historicalProbeMarker = createHistoricalPathProbeMarker(
        historicalProbeMarkerRadiusM(DEEP_STORM_TRACER_VIEW.sphereRadiusM),
      );
      this.scene.add(this.historicalProbeMarker);
    }
    syncHistoricalPathProbeMarker(this.historicalProbeMarker, position);
  }

  /**
   * Make `position` the OrbitControls target, preserving the current
   * camera-to-target world offset. Copies the point; no tracer identity.
   * docs/architecture/34-selected-tracer-follow-camera-architecture.md
   */
  setFollowPoint(position: Vec3): void {
    this.followPoint = copyFollowPoint(position);
    translateCameraFollowTarget(
      this.camera.position,
      this.controls.target,
      this.followPoint,
    );
    this.controls.enablePan = false;
  }

  /**
   * Stop follow-point translation. Restores unlabeled pan.
   * Does not move the camera or restore DEEP_STORM_TRACER_VIEW.
   */
  clearFollowPoint(): void {
    this.followPoint = null;
    this.controls.enablePan = true;
  }

  /**
   * Restore canonical storm framing from DEEP_STORM_TRACER_VIEW.
   * Clears the scene follow point and restores pan. Does not own
   * product Follow state, selection, tracers, preview, or airflow.
   * docs/architecture/37-reset-view-camera-recovery-architecture.md
   */
  resetView(): void {
    this.followPoint = null;
    this.controls.enablePan = true;
    applyDeepStormTracerViewPose(this.camera.position, this.controls.target);
    this.controls.update();
  }

  /**
   * Observe which occupancy slot is selected.
   * Product selection stays outside TracerScene.
   * Glyph occupancy colors are not mutated; indication is the halo.
   * docs/architecture/36-explore-selection-acquisition-identity-architecture.md
   */
  syncSelectedSlot(slotIndex: number | null): void {
    this.selectedSlotIndex = slotIndex;
    this.observeSelectionHalo();
    this.observeHoverHalo();
  }

  /**
   * Transient hover occupancy. Not product selection and not a tracerId.
   * docs/ui/10-tracer-interaction-affordance.md
   */
  get hoveredSlotIndex(): number | null {
    return this.hoveredOccupancyIndex;
  }

  syncHoveredSlot(slotIndex: number | null): void {
    this.hoveredOccupancyIndex = slotIndex;
    this.observeHoverHalo();
  }

  setSize(width: number, height: number): void {
    const w = Math.max(1, Math.floor(width));
    const h = Math.max(1, Math.floor(height));
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  /** Copy last fixed-step particle positions into meshes (read-only observe). */
  syncFromParticles(particles: readonly TracerAdvectionState[]): void {
    const n = Math.min(particles.length, this.slots.length);
    for (let i = 0; i < n; i++) {
      const p = particles[i]!;
      const mesh = this.slots[i]!.mesh;
      syncObservedTracerGlyph(mesh, p, this.keepInactiveGlyphs);
    }
    for (let i = n; i < this.slots.length; i++) {
      this.slots[i]!.mesh.visible = false;
    }
    const hovered = this.hoveredOccupancyIndex;
    const hoveredSlot = hovered === null ? undefined : this.slots[hovered];
    this.hoveredOccupancyIndex = persistHoveredSlotIndex(
      hovered,
      hoveredSlot !== undefined && hoveredSlot.mesh.visible,
    );
    this.observeSelectionHalo();
    this.observeHoverHalo();
  }

  /**
   * Copy path-history snapshots into trail lines.
   * No-op when trails were not enabled. Does not record or step.
   */
  syncFromPathHistory(pathHistory: TracerPathHistory): void {
    if (!this.trailsEnabled) {
      return;
    }
    const n = Math.min(pathHistory.tracerCount, this.slots.length);
    for (let i = 0; i < n; i++) {
      const trail = this.slots[i]!.trail;
      if (trail !== undefined) {
        syncTrailLine(trail, pathHistory.pointsFor(i));
      }
    }
  }

  render(): void {
    if (this.followPoint !== null) {
      translateCameraFollowTarget(
        this.camera.position,
        this.controls.target,
        this.followPoint,
      );
    }
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  dispose(): void {
    this.controls.dispose();
    this.detachVisualAirflow();
    this.clearTracerSlots();
    if (this.hoverHalo !== undefined) {
      this.scene.remove(this.hoverHalo);
      disposeHoverHaloMarker(this.hoverHalo);
      this.hoverHalo = undefined;
    }
    if (this.preview !== undefined) {
      this.scene.remove(this.preview);
      disposeReleasePreviewMarker(this.preview);
      this.preview = undefined;
    }
    if (this.historicalProbeMarker !== undefined) {
      this.scene.remove(this.historicalProbeMarker);
      disposeHistoricalPathProbeMarker(this.historicalProbeMarker);
      this.historicalProbeMarker = undefined;
    }
    this.sharedGeometry.dispose();
    this.scene.remove(this.coordinateReference);
    disposeWorldCoordinateReference(this.coordinateReference);
    this.renderer.dispose();
  }

  /**
   * At most one selection halo. Follows selected glyph visibility and
   * position. Not a pick candidate. Not the release preview.
   */
  private observeSelectionHalo(): void {
    if (this.selectedSlotIndex === null) {
      if (this.selectionHalo !== undefined) {
        syncSelectionHaloMarker(this.selectionHalo, null);
      }
      return;
    }
    const slot = this.slots[this.selectedSlotIndex];
    if (slot === undefined) {
      if (this.selectionHalo !== undefined) {
        syncSelectionHaloMarker(this.selectionHalo, null);
      }
      return;
    }
    if (this.selectionHalo === undefined) {
      this.selectionHalo = createSelectionHaloMarker(
        selectionHaloRadiusM(DEEP_STORM_TRACER_VIEW.sphereRadiusM),
      );
      this.scene.add(this.selectionHalo);
    }
    syncSelectionHaloMarker(this.selectionHalo, {
      visible: slot.mesh.visible,
      position: slot.mesh.position,
    });
  }

  /**
   * Weaker than the selection halo. Hidden when the hovered slot is
   * also selected. Not a pick candidate.
   */
  private observeHoverHalo(): void {
    const hovered = this.hoveredOccupancyIndex;
    const slot = hovered === null ? undefined : this.slots[hovered];
    const observation = resolveHoverHaloObservation({
      hoveredSlotIndex: hovered,
      selectedSlotIndex: this.selectedSlotIndex,
      hoveredGlyph:
        slot === undefined
          ? undefined
          : {
              visible: slot.mesh.visible,
              position: slot.mesh.position,
            },
    });
    if (this.hoverHalo === undefined) {
      if (observation === null) {
        return;
      }
      this.hoverHalo = createHoverHaloMarker(
        hoverHaloRadiusM(DEEP_STORM_TRACER_VIEW.sphereRadiusM),
      );
      this.scene.add(this.hoverHalo);
    }
    syncHoverHaloMarker(this.hoverHalo, observation);
  }
}
