import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type { TracerAdvectionState } from "../simulation/TracerParticle.js";
import type { TracerPathHistory } from "../simulation/TracerPathHistory.js";
import { DEEP_STORM_TRACER_VIEW } from "./deepStormTracerView.js";
import { syncTrailLine } from "./trailGeometry.js";
import {
  createTracerObserveSlot,
  disposeTracerObserveSlot,
  syncSelectedTracerGlyph,
  type TracerObserveSlot,
} from "./tracerObserveSlot.js";
import {
  createReleasePreviewMarker,
  disposeReleasePreviewMarker,
  syncReleasePreviewMarker,
} from "./releasePreviewMarker.js";
import type { TracerSeedPosition } from "../simulation/createTracersFromSeeds.js";
import {
  worldRayFromCameraNdc,
  type WorldRay,
} from "./worldRayFromCameraNdc.js";
import { pickVisibleTracerSlotIndex } from "./pickVisibleTracerSlot.js";

export { TRACER_COLORS } from "./tracerObserveSlot.js";

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
 * tracer resources without recreating camera, OrbitControls, grid, or renderer.
 */
export class TracerScene {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly controls: OrbitControls;
  private readonly slots: TracerObserveSlot[] = [];
  private preview: THREE.Mesh | undefined;
  private selectedSlotIndex: number | null = null;
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

    this.scene.add(new THREE.AxesHelper(view.axisSizeM));
    this.scene.add(new THREE.GridHelper(view.gridSizeM, view.gridDivisions));

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
   * Camera, OrbitControls, grid, axes, shared geometry, and renderer stay.
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
   * Nearest visible tracer glyph along a world ray.
   * Slot index is occupancy layout, not tracerId.
   * Preview marker is not a candidate.
   */
  pickVisibleTracer(ray: WorldRay): number | null {
    return pickVisibleTracerSlotIndex(this.slots, ray);
  }

  /**
   * Observe which occupancy slot is highlighted.
   * Product selection stays outside TracerScene.
   */
  syncSelectedSlot(slotIndex: number | null): void {
    const previous = this.selectedSlotIndex;
    if (previous === slotIndex) {
      return;
    }
    if (previous !== null) {
      const previousSlot = this.slots[previous];
      if (previousSlot !== undefined) {
        syncSelectedTracerGlyph(previousSlot.mesh, previous, false);
      }
    }
    this.selectedSlotIndex = slotIndex;
    if (slotIndex !== null) {
      const nextSlot = this.slots[slotIndex];
      if (nextSlot !== undefined) {
        syncSelectedTracerGlyph(nextSlot.mesh, slotIndex, true);
      }
    }
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
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  dispose(): void {
    this.controls.dispose();
    this.clearTracerSlots();
    if (this.preview !== undefined) {
      this.scene.remove(this.preview);
      disposeReleasePreviewMarker(this.preview);
      this.preview = undefined;
    }
    this.sharedGeometry.dispose();
    this.renderer.dispose();
  }
}
