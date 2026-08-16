import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type { TracerParticle } from "../simulation/TracerParticle.js";
import { DEEP_STORM_TRACER_VIEW } from "./deepStormTracerView.js";

const TRACER_COLORS = [0xe74c3c, 0x3498db, 0x2ecc71] as const;

/**
 * Imperative Three.js tracer scene.
 * Observes particle positions; never writes simulation state.
 */
export class TracerScene {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly controls: OrbitControls;
  private readonly tracerMeshes: THREE.Mesh[] = [];
  private readonly sharedGeometry: THREE.SphereGeometry;

  constructor(canvas: HTMLCanvasElement, tracerCount: number) {
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
      mesh.visible = p.active;
      mesh.position.set(p.position.x, p.position.y, p.position.z);
    }
    for (let i = n; i < this.tracerMeshes.length; i++) {
      this.tracerMeshes[i]!.visible = false;
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
    this.renderer.dispose();
  }
}
