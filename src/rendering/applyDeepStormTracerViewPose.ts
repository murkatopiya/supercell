import { DEEP_STORM_TRACER_VIEW } from "./deepStormTracerView.js";

/**
 * Copy canonical rest pose from DEEP_STORM_TRACER_VIEW.
 * Does not own Follow product state, selection, or simulation.
 * docs/architecture/37-reset-view-camera-recovery-architecture.md
 */
export function applyDeepStormTracerViewPose(
  cameraPosition: { set(x: number, y: number, z: number): void },
  target: { set(x: number, y: number, z: number): void },
): void {
  const view = DEEP_STORM_TRACER_VIEW;
  cameraPosition.set(
    view.cameraPosition.x,
    view.cameraPosition.y,
    view.cameraPosition.z,
  );
  target.set(view.target.x, view.target.y, view.target.z);
}
