import { describe, expect, it } from "vitest";
import appSrc from "../app/App.tsx?raw";
import tracerViewportSrc from "../ui/tracer/TracerViewport.tsx?raw";
import tracerSceneSrc from "./TracerScene.ts?raw";
import { DEEP_STORM_TRACER_VIEW } from "./deepStormTracerView.js";
import {
  copyFollowPoint,
  translateCameraFollowTarget,
} from "./translateCameraFollowTarget.js";

/**
 * Headless stand-in for TracerScene follow-point state.
 * Same copy / translate / pan rules as TracerScene.setFollowPoint
 * and clearFollowPoint, without constructing WebGLRenderer.
 */
function createFollowOrbit() {
  const cameraPosition: { x: number; y: number; z: number } = {
    x: DEEP_STORM_TRACER_VIEW.cameraPosition.x,
    y: DEEP_STORM_TRACER_VIEW.cameraPosition.y,
    z: DEEP_STORM_TRACER_VIEW.cameraPosition.z,
  };
  const target: { x: number; y: number; z: number } = {
    x: DEEP_STORM_TRACER_VIEW.target.x,
    y: DEEP_STORM_TRACER_VIEW.target.y,
    z: DEEP_STORM_TRACER_VIEW.target.z,
  };
  return {
    cameraPosition,
    target,
    enablePan: true,
    followPoint: null as { x: number; y: number; z: number } | null,
    setFollowPoint(position: { x: number; y: number; z: number }) {
      this.followPoint = copyFollowPoint(position);
      translateCameraFollowTarget(
        this.cameraPosition,
        this.target,
        this.followPoint,
      );
      this.enablePan = false;
    },
    clearFollowPoint() {
      this.followPoint = null;
      this.enablePan = true;
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

function offset(orbit: ReturnType<typeof createFollowOrbit>) {
  return {
    x: orbit.cameraPosition.x - orbit.target.x,
    y: orbit.cameraPosition.y - orbit.target.y,
    z: orbit.cameraPosition.z - orbit.target.z,
  };
}

describe("TracerScene follow-point capability", () => {
  it("first follow point translates camera and target by the same delta", () => {
    const orbit = createFollowOrbit();
    const restOffset = offset(orbit);
    const p = { x: 3000, y: 100, z: 4750 };
    orbit.setFollowPoint(p);
    expect(orbit.target).toEqual(p);
    expect(offset(orbit)).toEqual(restOffset);
    expect(orbit.cameraPosition).toEqual({
      x: p.x + restOffset.x,
      y: p.y + restOffset.y,
      z: p.z + restOffset.z,
    });
  });

  it("preserves distance and world offset from the rest fixture without snapping back", () => {
    const orbit = createFollowOrbit();
    const restCamera = { ...orbit.cameraPosition };
    const restTarget = { ...orbit.target };
    const restDistance = Math.hypot(
      restCamera.x - restTarget.x,
      restCamera.y - restTarget.y,
      restCamera.z - restTarget.z,
    );
    orbit.setFollowPoint({ x: 2400, y: 1000, z: 0 });
    expect(orbit.cameraPosition).not.toEqual(restCamera);
    expect(orbit.target).not.toEqual(restTarget);
    expect(orbit.target).not.toEqual(DEEP_STORM_TRACER_VIEW.target);
    expect(
      Math.hypot(
        orbit.cameraPosition.x - orbit.target.x,
        orbit.cameraPosition.y - orbit.target.y,
        orbit.cameraPosition.z - orbit.target.z,
      ),
    ).toBe(restDistance);
  });

  it("disables pan while a follow point is active and restores pan on clear", () => {
    const orbit = createFollowOrbit();
    expect(orbit.enablePan).toBe(true);
    orbit.setFollowPoint({ x: 1, y: 2, z: 3 });
    expect(orbit.enablePan).toBe(false);
    orbit.setFollowPoint({ x: 4, y: 5, z: 6 });
    expect(orbit.enablePan).toBe(false);
    orbit.clearFollowPoint();
    expect(orbit.enablePan).toBe(true);
    expect(orbit.followPoint).toBeNull();
  });

  it("clear leaves the current camera pose and target", () => {
    const orbit = createFollowOrbit();
    orbit.setFollowPoint({ x: -500, y: 2500, z: 800 });
    const camera = { ...orbit.cameraPosition };
    const target = { ...orbit.target };
    orbit.clearFollowPoint();
    expect(orbit.cameraPosition).toEqual(camera);
    expect(orbit.target).toEqual(target);
    expect(orbit.target).toEqual({ x: -500, y: 2500, z: 800 });
  });

  it("repeated same point, including stored apply before update, does not drift", () => {
    const orbit = createFollowOrbit();
    const p = { x: 100, y: 200, z: 300 };
    orbit.setFollowPoint(p);
    const camera = { ...orbit.cameraPosition };
    const target = { ...orbit.target };
    orbit.setFollowPoint({ ...p });
    orbit.applyStoredBeforeUpdate();
    orbit.applyStoredBeforeUpdate();
    expect(orbit.cameraPosition).toEqual(camera);
    expect(orbit.target).toEqual(target);
  });

  it("a moving follow point translates by the new delta", () => {
    const orbit = createFollowOrbit();
    orbit.setFollowPoint({ x: 10, y: 20, z: 30 });
    const kept = offset(orbit);
    orbit.setFollowPoint({ x: 40, y: -15, z: 90 });
    expect(orbit.target).toEqual({ x: 40, y: -15, z: 90 });
    expect(offset(orbit)).toEqual(kept);
  });

  it("preserves an orbit/zoom-modified offset on the next follow update", () => {
    const orbit = createFollowOrbit();
    orbit.setFollowPoint({ x: 0, y: 0, z: 0 });
    orbit.cameraPosition.x = orbit.target.x + 100;
    orbit.cameraPosition.y = orbit.target.y + 40;
    orbit.cameraPosition.z = orbit.target.z - 20;
    const modified = offset(orbit);
    orbit.setFollowPoint({ x: 5000, y: 1000, z: -500 });
    expect(offset(orbit)).toEqual(modified);
  });

  it("does not retain the caller Vec3; later mutation does not move the stored point", () => {
    const orbit = createFollowOrbit();
    const caller = { x: 8, y: 9, z: 10 };
    orbit.setFollowPoint(caller);
    caller.x = 0;
    caller.y = 0;
    caller.z = 0;
    expect(orbit.followPoint).toEqual({ x: 8, y: 9, z: 10 });
    orbit.applyStoredBeforeUpdate();
    expect(orbit.target).toEqual({ x: 8, y: 9, z: 10 });
  });

  it("exposes setFollowPoint / clearFollowPoint, copies the point, and applies before controls.update()", () => {
    expect(tracerSceneSrc).toMatch(/setFollowPoint\(/);
    expect(tracerSceneSrc).toMatch(/clearFollowPoint\(/);
    expect(tracerSceneSrc).toMatch(/copyFollowPoint/);
    expect(tracerSceneSrc).toMatch(/translateCameraFollowTarget/);
    expect(tracerSceneSrc).toMatch(/this\.controls\.enablePan = false/);
    expect(tracerSceneSrc).toMatch(/this\.controls\.enablePan = true/);
    expect(tracerSceneSrc).toMatch(
      /if \(this\.followPoint !== null\)[\s\S]*translateCameraFollowTarget[\s\S]*this\.controls\.update\(\)/,
    );
    expect(tracerSceneSrc).toMatch(
      /this\.controls\.update\(\);\s*this\.renderer\.render\(this\.scene, this\.camera\)/,
    );
  });

  it("keeps constructor rest pose and does not import selection, diagnostics, or scenario config", () => {
    expect(tracerSceneSrc).toMatch(/DEEP_STORM_TRACER_VIEW/);
    expect(tracerSceneSrc).toMatch(/this\.camera\.position\.set\(/);
    expect(tracerSceneSrc).toMatch(/this\.controls\.target\.set\(/);
    expect(tracerSceneSrc).not.toMatch(/from ["'].*TracerSelection/);
    expect(tracerSceneSrc).not.toMatch(/PointDiagnosticObservation/);
    expect(tracerSceneSrc).not.toMatch(/DiagnosticTiltingTendency/);
    expect(tracerSceneSrc).not.toMatch(/DiagnosticVerticalVorticity/);
    expect(tracerSceneSrc).not.toMatch(/ScenarioConfig/);
    expect(tracerSceneSrc).not.toMatch(/selectedId/);
    expect(tracerSceneSrc).not.toMatch(/followEnabled/);
  });

  it("does not own product followEnabled; App/Viewport drive setFollowPoint", () => {
    expect(tracerSceneSrc).not.toMatch(/followEnabled/);
    expect(appSrc).toMatch(
      /const \[followEnabled, setFollowEnabledState\] = useState\(false\)/,
    );
    expect(tracerViewportSrc).toMatch(/scene\.setFollowPoint\(follow\.position\)/);
    expect(tracerViewportSrc).toMatch(/scene\.clearFollowPoint\(\)/);
    expect(tracerViewportSrc).toMatch(/followEnabledSourceRef/);
  });
});
