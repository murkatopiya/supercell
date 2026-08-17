import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { intersectRayWithGroundReferencePlane } from "../explore/intersectRayWithGroundReferencePlane.js";
import { DEEP_STORM_TRACER_VIEW } from "./deepStormTracerView.js";
import tracerSceneSrc from "./TracerScene.ts?raw";
import { worldRayFromCameraNdc } from "./worldRayFromCameraNdc.js";
import worldRaySrc from "./worldRayFromCameraNdc.ts?raw";

function demoCamera(): THREE.PerspectiveCamera {
  const view = DEEP_STORM_TRACER_VIEW;
  const camera = new THREE.PerspectiveCamera(view.fovDeg, 1, view.nearM, view.farM);
  camera.position.set(
    view.cameraPosition.x,
    view.cameraPosition.y,
    view.cameraPosition.z,
  );
  camera.lookAt(view.target.x, view.target.y, view.target.z);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
  return camera;
}

describe("worldRayFromCameraNdc", () => {
  it("unprojects the image center to a ray that hits the ground-reference plane", () => {
    const camera = demoCamera();
    const before = camera.position.clone();
    const ray = worldRayFromCameraNdc(camera, 0, 0);
    expect(ray).not.toBeNull();
    const hit = intersectRayWithGroundReferencePlane(ray!.origin, ray!.direction);
    expect(hit).not.toBeNull();
    expect(Number.isFinite(hit!.x)).toBe(true);
    expect(Number.isFinite(hit!.z)).toBe(true);
    expect(camera.position.equals(before)).toBe(true);
  });

  it("does not mutate the returned ray when the caller mutates snapshots", () => {
    const camera = demoCamera();
    const ray = worldRayFromCameraNdc(camera, 0, 0)!;
    const origin = { ...ray.origin };
    ray.origin.x = 0;
    ray.direction.y = 0;
    const again = worldRayFromCameraNdc(camera, 0, 0)!;
    expect(again.origin).toEqual(origin);
  });

  it("rejects non-finite NDC", () => {
    const camera = demoCamera();
    expect(worldRayFromCameraNdc(camera, Number.NaN, 0)).toBeNull();
    expect(worldRayFromCameraNdc(camera, 0, Number.POSITIVE_INFINITY)).toBeNull();
  });

  it("stays out of Explore modules and is used by TracerScene.worldRayFromNdc", () => {
    expect(worldRaySrc).not.toMatch(/from ["'].*explore/);
    expect(worldRaySrc).not.toMatch(/ExplorePointReleaseTool/);
    expect(tracerSceneSrc).toMatch(/worldRayFromNdc/);
    expect(tracerSceneSrc).toMatch(/worldRayFromCameraNdc/);
    expect(tracerSceneSrc).not.toMatch(/from ["'].*explore/);
    expect(tracerSceneSrc).not.toMatch(/ExploreTracerSession/);
    expect(tracerSceneSrc).not.toMatch(/ExplorePointReleaseTool/);
  });
});
