import { describe, expect, it } from "vitest";
import { applyDeepStormTracerViewPose } from "./applyDeepStormTracerViewPose.js";
import applyDeepStormTracerViewPoseSrc from "./applyDeepStormTracerViewPose.ts?raw";
import { DEEP_STORM_TRACER_VIEW } from "./deepStormTracerView.js";
import {
  copyFollowPoint,
  translateCameraFollowTarget,
} from "./translateCameraFollowTarget.js";
import tracerSceneSrc from "./TracerScene.ts?raw";

function mutablePoint(x: number, y: number, z: number) {
  return {
    x,
    y,
    z,
    set(nx: number, ny: number, nz: number) {
      this.x = nx;
      this.y = ny;
      this.z = nz;
    },
  };
}

/**
 * Headless stand-in for TracerScene resetView / followPoint rules
 * without constructing WebGLRenderer.
 */
function createResetViewOrbit() {
  const cameraPosition = mutablePoint(
    DEEP_STORM_TRACER_VIEW.cameraPosition.x,
    DEEP_STORM_TRACER_VIEW.cameraPosition.y,
    DEEP_STORM_TRACER_VIEW.cameraPosition.z,
  );
  const target = mutablePoint(
    DEEP_STORM_TRACER_VIEW.target.x,
    DEEP_STORM_TRACER_VIEW.target.y,
    DEEP_STORM_TRACER_VIEW.target.z,
  );
  return {
    cameraPosition,
    target,
    enablePan: true,
    followPoint: null as { x: number; y: number; z: number } | null,
    controlsUpdateCount: 0,
    selectedSlotIndex: 0 as number | null,
    selectionHaloVisible: true,
    tracerSlotPositions: [{ x: 100, y: 200, z: 300 }],
    previewVisible: true,
    previewPosition: { x: 1, y: 2, z: 3 },
    visualAirflowAttached: true,
    setFollowPoint(position: { x: number; y: number; z: number }) {
      this.followPoint = copyFollowPoint(position);
      translateCameraFollowTarget(
        this.cameraPosition,
        this.target,
        this.followPoint,
      );
      this.enablePan = false;
    },
    resetView() {
      this.followPoint = null;
      this.enablePan = true;
      applyDeepStormTracerViewPose(this.cameraPosition, this.target);
      this.controlsUpdateCount += 1;
    },
    applyStoredBeforeUpdate() {
      if (this.followPoint !== null) {
        translateCameraFollowTarget(
          this.cameraPosition,
          this.target,
          this.followPoint,
        );
      }
    },
  };
}

describe("applyDeepStormTracerViewPose", () => {
  it("copies DEEP_STORM_TRACER_VIEW into camera and target without mutating the fixture", () => {
    const fixtureBefore = structuredClone(DEEP_STORM_TRACER_VIEW);
    const cameraPosition = mutablePoint(9, 8, 7);
    const target = mutablePoint(-1, -2, -3);
    applyDeepStormTracerViewPose(cameraPosition, target);
    expect({
      x: cameraPosition.x,
      y: cameraPosition.y,
      z: cameraPosition.z,
    }).toEqual(DEEP_STORM_TRACER_VIEW.cameraPosition);
    expect({ x: target.x, y: target.y, z: target.z }).toEqual(
      DEEP_STORM_TRACER_VIEW.target,
    );
    expect(DEEP_STORM_TRACER_VIEW).toEqual(fixtureBefore);
    expect(applyDeepStormTracerViewPoseSrc).toMatch(/DEEP_STORM_TRACER_VIEW/);
    expect(applyDeepStormTracerViewPoseSrc).not.toMatch(/12000/);
    expect(applyDeepStormTracerViewPoseSrc).not.toMatch(/CameraState/);
  });
});

describe("TracerScene.resetView capability", () => {
  it("restores exact DEEP_STORM_TRACER_VIEW pose from an arbitrary displaced camera", () => {
    const orbit = createResetViewOrbit();
    orbit.cameraPosition.set(5000, -200, 9000);
    orbit.target.set(111, 222, 333);
    orbit.resetView();
    expect({
      x: orbit.cameraPosition.x,
      y: orbit.cameraPosition.y,
      z: orbit.cameraPosition.z,
    }).toEqual(DEEP_STORM_TRACER_VIEW.cameraPosition);
    expect({
      x: orbit.target.x,
      y: orbit.target.y,
      z: orbit.target.z,
    }).toEqual(DEEP_STORM_TRACER_VIEW.target);
    expect(orbit.controlsUpdateCount).toBe(1);
  });

  it("is idempotent when already at rest pose", () => {
    const orbit = createResetViewOrbit();
    orbit.resetView();
    const afterFirst = {
      camera: {
        x: orbit.cameraPosition.x,
        y: orbit.cameraPosition.y,
        z: orbit.cameraPosition.z,
      },
      target: { x: orbit.target.x, y: orbit.target.y, z: orbit.target.z },
    };
    orbit.resetView();
    expect({
      x: orbit.cameraPosition.x,
      y: orbit.cameraPosition.y,
      z: orbit.cameraPosition.z,
    }).toEqual(afterFirst.camera);
    expect({
      x: orbit.target.x,
      y: orbit.target.y,
      z: orbit.target.z,
    }).toEqual(afterFirst.target);
    expect(afterFirst.camera).toEqual(DEEP_STORM_TRACER_VIEW.cameraPosition);
    expect(afterFirst.target).toEqual(DEEP_STORM_TRACER_VIEW.target);
  });

  it("clears an active follow point and restores pan", () => {
    const orbit = createResetViewOrbit();
    orbit.setFollowPoint({ x: 3000, y: 100, z: 4750 });
    expect(orbit.followPoint).not.toBeNull();
    expect(orbit.enablePan).toBe(false);
    expect(orbit.target).not.toEqual(DEEP_STORM_TRACER_VIEW.target);
    orbit.resetView();
    expect(orbit.followPoint).toBeNull();
    expect(orbit.enablePan).toBe(true);
    expect({
      x: orbit.target.x,
      y: orbit.target.y,
      z: orbit.target.z,
    }).toEqual(DEEP_STORM_TRACER_VIEW.target);
  });

  it("does not reapply a cleared follow point on a later render tick", () => {
    const orbit = createResetViewOrbit();
    orbit.setFollowPoint({ x: -500, y: 2500, z: 800 });
    orbit.resetView();
    const rest = {
      camera: {
        x: orbit.cameraPosition.x,
        y: orbit.cameraPosition.y,
        z: orbit.cameraPosition.z,
      },
      target: { x: orbit.target.x, y: orbit.target.y, z: orbit.target.z },
    };
    orbit.applyStoredBeforeUpdate();
    expect({
      x: orbit.cameraPosition.x,
      y: orbit.cameraPosition.y,
      z: orbit.cameraPosition.z,
    }).toEqual(rest.camera);
    expect({
      x: orbit.target.x,
      y: orbit.target.y,
      z: orbit.target.z,
    }).toEqual(rest.target);
  });

  it("does not clear selected-slot / halo stand-in state", () => {
    const orbit = createResetViewOrbit();
    orbit.selectedSlotIndex = 1;
    orbit.selectionHaloVisible = true;
    orbit.setFollowPoint({ x: 10, y: 20, z: 30 });
    orbit.resetView();
    expect(orbit.selectedSlotIndex).toBe(1);
    expect(orbit.selectionHaloVisible).toBe(true);
  });

  it("does not mutate tracer-slot / preview / airflow stand-in state", () => {
    const orbit = createResetViewOrbit();
    const slotsBefore = structuredClone(orbit.tracerSlotPositions);
    const previewBefore = {
      visible: orbit.previewVisible,
      position: { ...orbit.previewPosition },
    };
    orbit.setFollowPoint({ x: 1, y: 2, z: 3 });
    orbit.resetView();
    expect(orbit.tracerSlotPositions).toEqual(slotsBefore);
    expect(orbit.previewVisible).toBe(previewBefore.visible);
    expect(orbit.previewPosition).toEqual(previewBefore.position);
    expect(orbit.visualAirflowAttached).toBe(true);
  });

  it("exposes resetView on TracerScene with the locked operation order", () => {
    expect(tracerSceneSrc).toMatch(/resetView\(\): void/);
    expect(tracerSceneSrc).toMatch(/applyDeepStormTracerViewPose/);
    const start = tracerSceneSrc.indexOf("resetView(): void");
    expect(start).toBeGreaterThanOrEqual(0);
    const body = tracerSceneSrc.slice(start, start + 450);
    const followCleared = body.indexOf("this.followPoint = null");
    const panRestored = body.indexOf("this.controls.enablePan = true");
    const poseApplied = body.indexOf("applyDeepStormTracerViewPose");
    const controlsUpdated = body.indexOf("this.controls.update()");
    expect(followCleared).toBeGreaterThanOrEqual(0);
    expect(panRestored).toBeGreaterThan(followCleared);
    expect(poseApplied).toBeGreaterThan(panRestored);
    expect(controlsUpdated).toBeGreaterThan(poseApplied);
  });

  it("keeps resetView independent of selection, slots, preview, airflow, and App follow", () => {
    const start = tracerSceneSrc.indexOf("resetView(): void");
    const body = tracerSceneSrc.slice(start, start + 450);
    expect(body).not.toMatch(/selectedSlotIndex/);
    expect(body).not.toMatch(/observeSelectionHalo/);
    expect(body).not.toMatch(/selectionHalo/);
    expect(body).not.toMatch(/clearTracerSlots/);
    expect(body).not.toMatch(/syncFromParticles/);
    expect(body).not.toMatch(/syncReleasePreview/);
    expect(body).not.toMatch(/detachVisualAirflow/);
    expect(body).not.toMatch(/followEnabled/);
    expect(body).not.toMatch(/TracerSelection/);
    expect(tracerSceneSrc).not.toMatch(/CameraState/);
    expect(tracerSceneSrc).not.toMatch(/class Camera/);
  });
});
