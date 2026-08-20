import { describe, expect, it } from "vitest";
import { DEEP_STORM_TRACER_VIEW } from "./deepStormTracerView.js";
import translateSrc from "./translateCameraFollowTarget.ts?raw";
import {
  copyFollowPoint,
  translateCameraFollowTarget,
} from "./translateCameraFollowTarget.js";

function point(x: number, y: number, z: number): { x: number; y: number; z: number } {
  return { x, y, z };
}

function offset(
  camera: { x: number; y: number; z: number },
  target: { x: number; y: number; z: number },
): { x: number; y: number; z: number } {
  return {
    x: camera.x - target.x,
    y: camera.y - target.y,
    z: camera.z - target.z,
  };
}

function distance(
  camera: { x: number; y: number; z: number },
  target: { x: number; y: number; z: number },
): number {
  return Math.hypot(camera.x - target.x, camera.y - target.y, camera.z - target.z);
}

describe("translateCameraFollowTarget", () => {
  it("preserves exact world offset for an arbitrary translation", () => {
    const camera = point(100, -40, 25);
    const target = point(10, 4, -8);
    const before = offset(camera, target);
    translateCameraFollowTarget(camera, target, { x: -3000, y: 850, z: 12.5 });
    expect(target).toEqual({ x: -3000, y: 850, z: 12.5 });
    expect(offset(camera, target)).toEqual(before);
    expect(camera).toEqual({
      x: -3000 + before.x,
      y: 850 + before.y,
      z: 12.5 + before.z,
    });
  });

  it("translates independently on X, Y, and Z", () => {
    const alongX = { camera: point(5, 1, 2), target: point(1, 1, 2) };
    translateCameraFollowTarget(alongX.camera, alongX.target, { x: 9, y: 1, z: 2 });
    expect(alongX.target).toEqual({ x: 9, y: 1, z: 2 });
    expect(alongX.camera).toEqual({ x: 13, y: 1, z: 2 });

    const alongY = { camera: point(0, 10, 0), target: point(0, 4, 0) };
    translateCameraFollowTarget(alongY.camera, alongY.target, { x: 0, y: -6, z: 0 });
    expect(alongY.target).toEqual({ x: 0, y: -6, z: 0 });
    expect(alongY.camera).toEqual({ x: 0, y: 0, z: 0 });

    const alongZ = { camera: point(2, 3, -10), target: point(2, 3, 0) };
    translateCameraFollowTarget(alongZ.camera, alongZ.target, { x: 2, y: 3, z: 40 });
    expect(alongZ.target).toEqual({ x: 2, y: 3, z: 40 });
    expect(alongZ.camera).toEqual({ x: 2, y: 3, z: 30 });
  });

  it("is an exact no-op when the target is unchanged, including repeated pause-like calls", () => {
    const camera = point(12000, 6000, 12000);
    const target = point(0, 4000, 0);
    const cameraBefore = { ...camera };
    const targetBefore = { ...target };
    translateCameraFollowTarget(camera, target, { x: 0, y: 4000, z: 0 });
    translateCameraFollowTarget(camera, target, target);
    expect(camera).toEqual(cameraBefore);
    expect(target).toEqual(targetBefore);
    expect(Object.is(camera.x, cameraBefore.x)).toBe(true);
    expect(Object.is(target.y, targetBefore.y)).toBe(true);
  });

  it("works from a non-rest camera pose, not only DEEP_STORM_TRACER_VIEW", () => {
    const camera = point(-1800, 250, 9400);
    const target = point(400, 1100, -50);
    const before = offset(camera, target);
    const next = { x: 7777, y: 12, z: -333 };
    translateCameraFollowTarget(camera, target, next);
    expect(target).toEqual(next);
    expect(offset(camera, target)).toEqual(before);
    expect(camera).not.toEqual(DEEP_STORM_TRACER_VIEW.cameraPosition);
    expect(target).not.toEqual(DEEP_STORM_TRACER_VIEW.target);
  });

  it("preserves the latest offset across sequential follow points", () => {
    const camera = point(20, 8, -4);
    const target = point(0, 0, 0);
    const offset0 = offset(camera, target);
    translateCameraFollowTarget(camera, target, { x: 100, y: -20, z: 5 });
    expect(offset(camera, target)).toEqual(offset0);
    translateCameraFollowTarget(camera, target, { x: -50, y: 300, z: 90 });
    expect(offset(camera, target)).toEqual(offset0);
    translateCameraFollowTarget(camera, target, { x: 12.25, y: 12.25, z: 12.25 });
    expect(offset(camera, target)).toEqual(offset0);
    expect(camera).toEqual({
      x: 12.25 + offset0.x,
      y: 12.25 + offset0.y,
      z: 12.25 + offset0.z,
    });
  });

  it("preserves an orbit/zoom-modified offset on the next follow update", () => {
    const camera = point(
      DEEP_STORM_TRACER_VIEW.cameraPosition.x,
      DEEP_STORM_TRACER_VIEW.cameraPosition.y,
      DEEP_STORM_TRACER_VIEW.cameraPosition.z,
    );
    const target = point(
      DEEP_STORM_TRACER_VIEW.target.x,
      DEEP_STORM_TRACER_VIEW.target.y,
      DEEP_STORM_TRACER_VIEW.target.z,
    );
    translateCameraFollowTarget(camera, target, { x: 3000, y: 100, z: 4750 });
    const restDistance = distance(
      DEEP_STORM_TRACER_VIEW.cameraPosition,
      DEEP_STORM_TRACER_VIEW.target,
    );
    expect(distance(camera, target)).toBe(restDistance);

    // Zoom: same direction, half radius. Orbit: rotate the offset in XZ.
    const current = offset(camera, target);
    camera.x = target.x + current.z * 0.5;
    camera.y = target.y + current.y * 0.5;
    camera.z = target.z - current.x * 0.5;
    const zoomedOrbitOffset = offset(camera, target);
    expect(zoomedOrbitOffset).not.toEqual(current);

    translateCameraFollowTarget(camera, target, { x: -1200, y: 800, z: 200 });
    expect(offset(camera, target)).toEqual(zoomedOrbitOffset);
    expect(distance(camera, target)).toBe(
      Math.hypot(zoomedOrbitOffset.x, zoomedOrbitOffset.y, zoomedOrbitOffset.z),
    );
  });

  it("does not snap to the rest pose when following from the default fixture", () => {
    const camera = point(
      DEEP_STORM_TRACER_VIEW.cameraPosition.x,
      DEEP_STORM_TRACER_VIEW.cameraPosition.y,
      DEEP_STORM_TRACER_VIEW.cameraPosition.z,
    );
    const target = point(
      DEEP_STORM_TRACER_VIEW.target.x,
      DEEP_STORM_TRACER_VIEW.target.y,
      DEEP_STORM_TRACER_VIEW.target.z,
    );
    const restOffset = offset(camera, target);
    translateCameraFollowTarget(camera, target, { x: 2400, y: 1000, z: 0 });
    expect(target).toEqual({ x: 2400, y: 1000, z: 0 });
    expect(camera).not.toEqual(DEEP_STORM_TRACER_VIEW.cameraPosition);
    expect(target).not.toEqual(DEEP_STORM_TRACER_VIEW.target);
    expect(offset(camera, target)).toEqual(restOffset);
  });

  it("does not retain the caller nextTarget by reference", () => {
    const camera = point(1, 2, 3);
    const target = point(0, 0, 0);
    const next = { x: 8, y: 9, z: 10 };
    translateCameraFollowTarget(camera, target, next);
    next.x = 99;
    next.y = 99;
    next.z = 99;
    expect(target).toEqual({ x: 8, y: 9, z: 10 });
    expect(camera).toEqual({ x: 9, y: 11, z: 13 });
  });

  it("copyFollowPoint is independent of later caller mutation", () => {
    const caller = { x: 1, y: 2, z: 3 };
    const copied = copyFollowPoint(caller);
    caller.x = 50;
    caller.y = 60;
    caller.z = 70;
    expect(copied).toEqual({ x: 1, y: 2, z: 3 });
    copied.x = 0;
    expect(caller.x).toBe(50);
  });

  it("stays a world-offset helper without spherical reconstruction or product imports", () => {
    expect(translateSrc).not.toMatch(/spherical/i);
    expect(translateSrc).not.toMatch(/Spherical/);
    expect(translateSrc).not.toMatch(/TracerSelection/);
    expect(translateSrc).not.toMatch(/PointDiagnosticObservation/);
    expect(translateSrc).not.toMatch(/DiagnosticTiltingTendency/);
    expect(translateSrc).not.toMatch(/DiagnosticVerticalVorticity/);
    expect(translateSrc).not.toMatch(/ScenarioConfig/);
    expect(translateSrc).not.toMatch(/selectedId/);
    expect(translateSrc).not.toMatch(/followEnabled/);
  });
});
