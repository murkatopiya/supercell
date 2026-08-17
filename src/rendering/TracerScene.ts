import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type { TracerParticle } from "../simulation/TracerParticle.js";
import type { TracerPathHistory } from "../simulation/TracerPathHistory.js";
import { DEEP_STORM_TRACER_VIEW } from "./deepStormTracerView.js";
import {
  createTrailLines,
  disposeTrailLine,
  syncTrailLine,
} from "./trailGeometry.js";

export const TRACER_COLORS = [0xe74c3c, 0x3498db, 0x2ecc71] as const;

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
  particle: TracerParticle,
  keepInactiveGlyphs: boolean,
): void {
  mesh.visible = keepInactiveGlyphs || particle.active;
  mesh.position.set(particle.position.x, particle.position.y, particle.position.z);
}

/**
 * Imperative Three.js tracer scene.
 * Observes particle positions and optional path-history; never writes simulation state.
 */
export class TracerScene {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly controls: OrbitControls;
  private readonly tracerMeshes: THREE.Mesh[] = [];
  private readonly trailLines: THREE.Line[];
  private readonly sharedGeometry: THREE.SphereGeometry;
  private readonly keepInactiveGlyphs: boolean;

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
    for (let i = 0; i < tracerCount; i++) {
      const material = new THREE.MeshBasicMaterial({
        color: TRACER_COLORS[i % TRACER_COLORS.length],
      });
      const mesh = new THREE.Mesh(this.sharedGeometry, material);
      this.scene.add(mesh);
      this.tracerMeshes.push(mesh);
    }

    this.keepInactiveGlyphs = options?.keepInactiveGlyphs === true;

    this.trailLines = options?.trails
      ? createTrailLines(tracerCount, TRACER_COLORS)
      : [];
    for (const line of this.trailLines) {
      this.scene.add(line);
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
  syncFromParticles(particles: readonly TracerParticle[]): void {
    const n = Math.min(particles.length, this.tracerMeshes.length);
    for (let i = 0; i < n; i++) {
      const p = particles[i]!;
      const mesh = this.tracerMeshes[i]!;
      syncObservedTracerGlyph(mesh, p, this.keepInactiveGlyphs);
    }
    for (let i = n; i < this.tracerMeshes.length; i++) {
      this.tracerMeshes[i]!.visible = false;
    }
  }

  /**
   * Copy path-history snapshots into trail lines.
   * No-op when trails were not enabled. Does not record or step.
   */
  syncFromPathHistory(pathHistory: TracerPathHistory): void {
    const n = Math.min(pathHistory.tracerCount, this.trailLines.length);
    for (let i = 0; i < n; i++) {
      syncTrailLine(this.trailLines[i]!, pathHistory.pointsFor(i));
    }
  }

  render(): void {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  dispose(): void {
    this.controls.dispose();
    for (const mesh of this.tracerMeshes) {
      this.scene.remove(mesh);
      (mesh.material as THREE.Material).dispose();
    }
    this.sharedGeometry.dispose();
    for (const line of this.trailLines) {
      this.scene.remove(line);
      disposeTrailLine(line);
    }
    this.renderer.dispose();
  }
}
