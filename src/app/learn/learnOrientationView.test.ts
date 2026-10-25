import { describe, expect, it, vi } from "vitest";
import { PerspectiveCamera, Vector3 } from "three";
import { TracerScene } from "../../rendering/TracerScene.js";
import { DEEP_STORM_TRACER_VIEW } from "../../rendering/deepStormTracerView.js";
import { learnOrientationView } from "./learnOrientationView.js";

describe("Learn orientation camera", () => {
  it("leaves laboratory resize and reset behavior unchanged without the opt-in", () => {
    const camera = new PerspectiveCamera(50, 2, 10, 50000);
    camera.position.set(123, 456, 789);
    const controls = { target: new Vector3(1, 2, 3), enablePan: false, update: vi.fn() };
    const scene = Object.assign(Object.create(TracerScene.prototype), {
      camera, controls, renderer: { setSize: vi.fn() },
    }) as TracerScene;
    scene.setSize(225, 500);
    expect(camera.position.toArray()).toEqual([123, 456, 789]);
    expect(camera.far).toBe(50000);
    scene.resetView();
    expect(camera.position.toArray()).toEqual(Object.values(DEEP_STORM_TRACER_VIEW.cameraPosition));
    expect(controls.target.toArray()).toEqual(Object.values(DEEP_STORM_TRACER_VIEW.target));
  });
  it.each([0.45, 0.8, 1, 1.5, 2, 3])("fits grid and label anchors with margins at aspect %s", aspect => {
    const pose = learnOrientationView(aspect);
    const camera = new PerspectiveCamera(DEEP_STORM_TRACER_VIEW.fovDeg, aspect, 10,
      Math.max(50000, new Vector3().copy(pose.cameraPosition).length() * 2));
    camera.position.copy(pose.cameraPosition); camera.lookAt(new Vector3().copy(pose.target));
    camera.updateMatrixWorld();
    const half = DEEP_STORM_TRACER_VIEW.gridSizeM / 2;
    for (const x of [-half, 0, half]) for (const z of [-half, 0, half]) {
      for (const y of [0, 80, 160]) {
        const projected = new Vector3(x, y, z).project(camera);
        expect(Math.abs(projected.x)).toBeLessThanOrEqual(0.780001);
        expect(Math.abs(projected.y)).toBeLessThanOrEqual(0.780001);
        expect(Math.abs(projected.z)).toBeLessThan(1);
      }
    }
  });

  it("enlarges the desktop grid without changing the shared fixture", () => {
    const pose = learnOrientationView(2);
    const oldDistance = new Vector3().copy(DEEP_STORM_TRACER_VIEW.cameraPosition)
      .distanceTo(DEEP_STORM_TRACER_VIEW.target);
    const newDistance = new Vector3().copy(pose.cameraPosition).length();
    expect(oldDistance / newDistance).toBeGreaterThan(1.5);
    expect(oldDistance / newDistance).toBeLessThan(2.1);
    expect(DEEP_STORM_TRACER_VIEW.target.y).toBe(4000);
  });

  it("uses actual scene reset/resize methods and preserves orbit, pan and relative zoom", () => {
    const camera = new PerspectiveCamera(50, 2, 10, 50000);
    const controls = { target: new Vector3(), enablePan: false, update: vi.fn() };
    const scene = Object.assign(Object.create(TracerScene.prototype), {
      camera, controls, renderer: { setSize: vi.fn() }, viewPose: learnOrientationView,
    }) as TracerScene;
    scene.resetView();
    expect(camera.position.toArray()).toEqual(Object.values(learnOrientationView(2).cameraPosition));
    // A user has panned, orbited and dollied to 60% of the home distance.
    const oldDistance = camera.position.length();
    controls.target.set(300, 200, 100);
    const direction = new Vector3(-1, 1, 2).normalize();
    camera.position.copy(direction).multiplyScalar(oldDistance * 0.6).add(controls.target);
    scene.setSize(320, 500);
    const offset = camera.position.clone().sub(controls.target);
    expect(offset.clone().normalize().distanceTo(direction)).toBeLessThan(1e-12);
    expect(offset.length() / new Vector3().copy(learnOrientationView(0.64).cameraPosition).length()).toBeCloseTo(0.6);
    expect(controls.target.toArray()).toEqual([300, 200, 100]);
    scene.resetView();
    expect(controls.target.toArray()).toEqual([0, 0, 0]);
    expect(camera.position.toArray()).toEqual(Object.values(learnOrientationView(0.64).cameraPosition));
    scene.setSize(225, 500);
    expect(camera.far).toBeGreaterThan(50000);
  });
});
