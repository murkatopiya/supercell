import * as THREE from "three";
import { createVelocityArrow, type VelocityArrowObservation } from "./velocityArrow.js";
import { createCompareFlowPlacementArea } from "./compareFlowPlacementArea.js";
import { createTracerAnnotations, type TracerAnnotation } from "./tracerAnnotations.js";
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
import { ANALYSIS_T1_VALUE_APPEARANCE_V1 } from "./analysisT1ValueAppearanceV1.js";
import { ANALYSIS_T1_GLYPH_DISPLAY_SCALE_V1 } from "./analysisT1GlyphDisplayScaleV1.js";
import {
  ANALYSIS_T1_GLYPH_APPEARANCE_V1,
  ANALYSIS_T1_WHAT_IF_GLYPH_APPEARANCE_V1,
} from "./analysisT1GlyphAppearanceV1.js";
import type { TrajectoryTiltingRenderEncoding } from "../data/escHrTimeAnalysis/trajectoryTiltingRenderEncoding.js";
import type { TrajectoryTiltingGlyphModel } from "../data/escHrTimeAnalysis/trajectoryTiltingGlyphModel.js";
import type { TrajectoryTiltingWhatIfModel } from "../data/escHrTimeAnalysis/trajectoryTiltingWhatIf.js";
import {
  ANALYSIS_TILTING_OVERLAY_RENDER_ORDER,
  createTrajectoryTiltingOverlay,
  disposeTrajectoryTiltingOverlay,
  syncTrajectoryTiltingOverlay,
} from "./trajectoryTiltingOverlay.js";
import {
  createTrajectoryTiltingGlyph,
  disposeTrajectoryTiltingGlyph,
  syncTrajectoryTiltingGlyph,
} from "./trajectoryTiltingGlyph.js";
import {
  createTrajectoryTiltingWhatIfGlyph,
  disposeTrajectoryTiltingWhatIfGlyph,
  syncTrajectoryTiltingWhatIfGlyph,
} from "./trajectoryTiltingWhatIfGlyph.js";

export { TRACER_COLORS } from "./tracerObserveSlot.js";
export {
  SELECTION_HALO_COLOR,
  SELECTION_HALO_RADIUS_SCALE,
} from "./selectionHaloMarker.js";

export interface TracerSceneOptions {
  /** Opt-in Learn comparison UI extent, never a model-domain boundary. */
  comparisonPlacementArea?: Parameters<typeof createCompareFlowPlacementArea>[0];
  /** Follow changing home bounds while preserving orbit/pan/relative zoom. Default false. */
  trackViewPose?: boolean;
  /** Optional labels and fixed starting rings; no simulation ownership. */
  tracerAnnotations?: readonly TracerAnnotation[];
  /** Show metric distance labels on the reference grid. Default true. */
  distanceLabelsVisible?: boolean;
  /** Optional presentation-only home framing; omitted by laboratory callers. */
  viewPose?: (aspect: number) => {
    cameraPosition: { x: number; y: number; z: number };
    target: { x: number; y: number; z: number };
  };
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
 * permanent ceiling. Use addTracerSlot / removeLastTracerSlot /
 * clearTracerSlots to grow, shrink last occupancy, or empty tracer
 * resources without recreating camera, OrbitControls, the
 * world coordinate-reference layer, or renderer.
 */
export class TracerScene {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly controls: OrbitControls;
  private readonly slots: TracerObserveSlot[] = [];
  private readonly analysisTiltingOverlays: THREE.Group[] = [];
  private analysisTiltingGlyph: THREE.Group | undefined;
  private analysisTiltingWhatIfGlyph: THREE.Group | undefined;
  private preview: THREE.Mesh | undefined;
  private selectionHalo: THREE.Mesh | undefined;
  private hoverHalo: THREE.Mesh | undefined;
  private historicalProbeMarker: THREE.Mesh | undefined;
  private velocityArrow: ReturnType<typeof createVelocityArrow> | undefined;
  private readonly comparisonArrows: Partial<Record<"a" | "b", ReturnType<typeof createVelocityArrow>>> = {};
  private comparisonPlacementArea: ReturnType<typeof createCompareFlowPlacementArea> | undefined;
  private comparisonInputPolicy: { enabled: boolean; touchAction: string } | undefined;
  private visualAirflowObject: THREE.Object3D | undefined;
  private selectedSlotIndex: number | null = null;
  private hoveredOccupancyIndex: number | null = null;
  private followPoint: { x: number; y: number; z: number } | null = null;
  private depthCueEnabled = false;
  private readonly coordinateReference: THREE.Group;
  private readonly sharedGeometry: THREE.SphereGeometry;
  private readonly keepInactiveGlyphs: boolean;
  private readonly trailsEnabled: boolean;
  private readonly viewPose: TracerSceneOptions["viewPose"];
  private readonly trackViewPose: boolean;
  private homePose: ReturnType<NonNullable<TracerSceneOptions["viewPose"]>> | undefined;
  private annotations: ReturnType<typeof createTracerAnnotations> | undefined;

  constructor(
    canvas: HTMLCanvasElement,
    tracerCount: number,
    options?: TracerSceneOptions,
  ) {
    this.viewPose = options?.viewPose;
    this.trackViewPose = options?.trackViewPose === true;
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
    });
    const initializationCleanup: Array<() => void> = [() => this.renderer.dispose()];
    try {
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
      initializationCleanup.push(() => this.controls.dispose());
      this.controls.target.set(view.target.x, view.target.y, view.target.z);
      this.controls.enableDamping = false;
      this.controls.update();

      if (this.viewPose) this.resetView();

      this.coordinateReference = createWorldCoordinateReference(
        view.gridSizeM,
        view.gridDivisions,
        { distanceLabelsVisible: options?.distanceLabelsVisible },
      );
      initializationCleanup.push(() => disposeWorldCoordinateReference(this.coordinateReference));
      this.scene.add(this.coordinateReference);

      this.sharedGeometry = new THREE.SphereGeometry(view.sphereRadiusM, 16, 12);
      initializationCleanup.push(() => this.sharedGeometry.dispose());
      initializationCleanup.push(() => this.clearTracerSlots());
      this.keepInactiveGlyphs = options?.keepInactiveGlyphs === true;
      this.trailsEnabled = options?.trails === true;

      for (let i = 0; i < tracerCount; i++) {
        this.addTracerSlot();
      }
      if (options?.tracerAnnotations) {
        this.annotations = createTracerAnnotations(options.tracerAnnotations);
        initializationCleanup.push(() => this.annotations?.dispose());
        this.scene.add(this.annotations.object);
      }
      if (options?.comparisonPlacementArea) {
        this.comparisonPlacementArea = createCompareFlowPlacementArea(options.comparisonPlacementArea);
        initializationCleanup.push(() => this.comparisonPlacementArea?.dispose());
        this.scene.add(this.comparisonPlacementArea.object);
      }
    } catch (error) {
      for (const release of initializationCleanup.reverse()) release();
      throw error;
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

  /**
   * Dispose the last glyph/trail and drop slot count by one.
   * Empty occupancy is a no-op. Does not recreate camera or renderer.
   */
  removeLastTracerSlot(): void {
    const slot = this.slots.pop();
    if (slot === undefined) {
      return;
    }
    this.scene.remove(slot.mesh);
    if (slot.trail !== undefined) {
      this.scene.remove(slot.trail);
    }
    this.disposeLastAnalysisTiltingOverlay();
    disposeTracerObserveSlot(slot);
    if (
      this.selectedSlotIndex !== null &&
      this.selectedSlotIndex >= this.slots.length
    ) {
      this.selectedSlotIndex = null;
    }
    if (
      this.hoveredOccupancyIndex !== null &&
      this.hoveredOccupancyIndex >= this.slots.length
    ) {
      this.hoveredOccupancyIndex = null;
    }
    this.observeSelectionHalo();
    this.observeHoverHalo();
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
    this.disposeAllAnalysisTiltingOverlays();
    this.disposeAnalysisTiltingGlyph();
    this.disposeAnalysisTiltingWhatIfGlyph();
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
   * One-shot OrbitControls target = recorded historical sample.
   * Preserves camera-to-target offset. Not Follow: does not track a
   * live tracer, does not disable pan, and is not applied every frame.
   * App turns Follow OFF before calling this.
   */
  focusPoint(position: Vec3): void {
    this.followPoint = null;
    this.controls.enablePan = true;
    translateCameraFollowTarget(
      this.camera.position,
      this.controls.target,
      position,
    );
    this.controls.update();
  }

  /**
   * Restore supplied home framing, or canonical DEEP_STORM_TRACER_VIEW.
   * Clears the scene follow point and restores pan. Does not own
   * product Follow state, selection, tracers, preview, or airflow.
   * docs/architecture/37-reset-view-camera-recovery-architecture.md
   */
  resetView(): void {
    this.followPoint = null;
    this.controls.enablePan = true;
    if (this.viewPose) {
      const pose = this.viewPose(this.camera.aspect);
      this.homePose = pose;
      this.camera.position.copy(pose.cameraPosition);
      this.controls.target.copy(pose.target);
      this.camera.far = Math.max(DEEP_STORM_TRACER_VIEW.farM,
        this.camera.position.distanceTo(this.controls.target) * 2);
      this.camera.updateProjectionMatrix();
    } else {
      applyDeepStormTracerViewPose(this.camera.position, this.controls.target);
    }
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
    this.refreshViewPose(w / h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  private refreshViewPose(aspect: number): void {
    if (!this.viewPose) return;
    const previous = this.homePose ?? this.viewPose(this.camera.aspect);
    const next = this.viewPose(aspect);
    if (next === this.homePose) return;
    const oldDistance = new THREE.Vector3().copy(previous.cameraPosition).distanceTo(previous.target);
    const newDistance = new THREE.Vector3().copy(next.cameraPosition).distanceTo(next.target);
    const offset = this.camera.position.clone().sub(this.controls.target);
    this.controls.target.add(new THREE.Vector3().copy(next.target).sub(previous.target));
    this.camera.position.copy(offset).multiplyScalar(newDistance / oldDistance).add(this.controls.target);
    this.camera.far = Math.max(DEEP_STORM_TRACER_VIEW.farM, newDistance * 2);
    this.homePose = next;
    this.camera.updateProjectionMatrix();
  }

  /** Copy last fixed-step particle positions into meshes (read-only observe). */
  syncFromParticles(particles: readonly TracerAdvectionState[]): void {
    this.annotations?.sync(particles.map(particle => particle.position));
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

  /**
   * Actual Analysis mechanism glyph at the selected recorded sample.
   * Null hides it. Does not query Analysis physics. Raycast disabled.
   */
  syncAnalysisTiltingGlyph(model: TrajectoryTiltingGlyphModel | null): void {
    if (model === null) {
      this.disposeAnalysisTiltingGlyph();
      return;
    }
    if (this.analysisTiltingGlyph === undefined) {
      this.analysisTiltingGlyph = createTrajectoryTiltingGlyph();
      this.analysisTiltingGlyph.renderOrder = 2;
      this.scene.add(this.analysisTiltingGlyph);
    }
    syncTrajectoryTiltingGlyph(
      this.analysisTiltingGlyph,
      model,
      ANALYSIS_T1_GLYPH_DISPLAY_SCALE_V1,
      ANALYSIS_T1_GLYPH_APPEARANCE_V1,
    );
  }

  /**
   * Hypothetical what-if glyph. Does not replace the actual glyph.
   * Null hides it. Raycast disabled.
   */
  syncAnalysisTiltingWhatIfGlyph(
    model: TrajectoryTiltingWhatIfModel | null,
  ): void {
    if (model === null) {
      this.disposeAnalysisTiltingWhatIfGlyph();
      return;
    }
    if (this.analysisTiltingWhatIfGlyph === undefined) {
      this.analysisTiltingWhatIfGlyph = createTrajectoryTiltingWhatIfGlyph();
      this.analysisTiltingWhatIfGlyph.renderOrder = 2;
      this.scene.add(this.analysisTiltingWhatIfGlyph);
    }
    syncTrajectoryTiltingWhatIfGlyph(
      this.analysisTiltingWhatIfGlyph,
      model,
      ANALYSIS_T1_GLYPH_DISPLAY_SCALE_V1,
      ANALYSIS_T1_WHAT_IF_GLYPH_APPEARANCE_V1,
    );
  }

  /**
   * Derived Analysis T1 overlay beside occupancy trails.
   * Null / empty encodings hide and dispose overlay groups.
   * Does not query Analysis physics. Overlay raycast stays disabled.
   */
  syncAnalysisTiltingOverlays(
    encodings: readonly TrajectoryTiltingRenderEncoding[] | null,
  ): void {
    if (encodings === null || encodings.length === 0) {
      this.disposeAllAnalysisTiltingOverlays();
      return;
    }
    while (this.analysisTiltingOverlays.length < encodings.length) {
      const overlay = createTrajectoryTiltingOverlay();
      overlay.renderOrder = ANALYSIS_TILTING_OVERLAY_RENDER_ORDER;
      this.scene.add(overlay);
      this.analysisTiltingOverlays.push(overlay);
    }
    while (this.analysisTiltingOverlays.length > encodings.length) {
      this.disposeLastAnalysisTiltingOverlay();
    }
    for (let i = 0; i < encodings.length; i++) {
      syncTrajectoryTiltingOverlay(
        this.analysisTiltingOverlays[i]!,
        encodings[i]!,
        ANALYSIS_T1_VALUE_APPEARANCE_V1,
      );
    }
  }

  /** Observe a supplied world velocity; no model sampling or physics here. */
  syncVelocityArrow(sample: VelocityArrowObservation | null): void {
    if (!sample && !this.velocityArrow) return;
    if (!this.velocityArrow) {
      this.velocityArrow = createVelocityArrow();
      this.scene.add(this.velocityArrow.object);
    }
    this.velocityArrow.sync(sample);
  }

  /** Controls and canvas policy have the same scene owner. No reconnect/dispose. */
  setComparisonPlacementMode(enabled: boolean): void {
    if (!this.comparisonPlacementArea) return;
    const element = this.controls.domElement;
    if (!element) return;
    if (enabled && !this.comparisonInputPolicy) {
      this.comparisonInputPolicy = { enabled: this.controls.enabled, touchAction: element.style.touchAction };
      this.controls.enabled = false;
      element.style.touchAction = "pan-y pinch-zoom";
    } else if (!enabled && this.comparisonInputPolicy) {
      this.controls.enabled = this.comparisonInputPolicy.enabled;
      element.style.touchAction = this.comparisonInputPolicy.touchAction;
      this.comparisonInputPolicy = undefined;
    }
    this.comparisonPlacementArea.object.visible = enabled;
  }

  /** Opt-in static comparison, separately owned from Slice 3's single arrow. */
  syncComparisonVelocityArrows(samples: Readonly<Record<"a" | "b", VelocityArrowObservation | null>>): void {
    for (const key of ["a", "b"] as const) {
      if (!samples[key] && !this.comparisonArrows[key]) continue;
      if (!this.comparisonArrows[key]) {
        const arrow = createVelocityArrow();
        arrow.object.name = `comparisonVelocityArrow:${key}`;
        this.comparisonArrows[key] = arrow;
        this.scene.add(arrow.object);
      }
      this.comparisonArrows[key]!.sync(samples[key]);
    }
  }

  render(): void {
    if (this.trackViewPose) this.refreshViewPose(this.camera.aspect);
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
    this.setComparisonPlacementMode(false);
    if (this.comparisonPlacementArea) {
      this.scene.remove(this.comparisonPlacementArea.object); this.comparisonPlacementArea.dispose(); this.comparisonPlacementArea = undefined;
    }
    for (const key of ["a", "b"] as const) {
      const arrow = this.comparisonArrows[key];
      if (arrow) { this.scene.remove(arrow.object); arrow.dispose(); delete this.comparisonArrows[key]; }
    }
    if (this.velocityArrow) {
      this.scene.remove(this.velocityArrow.object);
      this.velocityArrow.dispose(); this.velocityArrow = undefined;
    }
    if (this.annotations) {
      this.scene.remove(this.annotations.object);
      this.annotations.dispose(); this.annotations = undefined;
    }
    this.controls.dispose();
    this.detachVisualAirflow();
    this.clearTracerSlots();
    if (this.selectionHalo !== undefined) {
      this.scene.remove(this.selectionHalo);
      disposeSelectionHaloMarker(this.selectionHalo);
      this.selectionHalo = undefined;
    }
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

  private disposeLastAnalysisTiltingOverlay(): void {
    const overlay = this.analysisTiltingOverlays.pop();
    if (overlay === undefined) {
      return;
    }
    this.scene.remove(overlay);
    disposeTrajectoryTiltingOverlay(overlay);
  }

  private disposeAllAnalysisTiltingOverlays(): void {
    while (this.analysisTiltingOverlays.length > 0) {
      this.disposeLastAnalysisTiltingOverlay();
    }
  }

  private disposeAnalysisTiltingGlyph(): void {
    if (this.analysisTiltingGlyph === undefined) {
      return;
    }
    this.scene.remove(this.analysisTiltingGlyph);
    disposeTrajectoryTiltingGlyph(this.analysisTiltingGlyph);
    this.analysisTiltingGlyph = undefined;
  }

  private disposeAnalysisTiltingWhatIfGlyph(): void {
    if (this.analysisTiltingWhatIfGlyph === undefined) {
      return;
    }
    this.scene.remove(this.analysisTiltingWhatIfGlyph);
    disposeTrajectoryTiltingWhatIfGlyph(this.analysisTiltingWhatIfGlyph);
    this.analysisTiltingWhatIfGlyph = undefined;
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
