import { DEEP_STORM_TRACER_VIEW } from "../../rendering/deepStormTracerView.js";

/** Fit the existing ground grid, with screen margins for its fixed-size labels.
 * Only camera placement changes. No model or shared laboratory fixture changes.
 */
export function learnOrientationView(aspect: number) {
  const norm = Math.hypot(1, 0.3, 1);
  const direction = { x: 1 / norm, y: 0.3 / norm, z: 1 / norm };
  const half = DEEP_STORM_TRACER_VIEW.gridSizeM / 2;
  const tanVertical = Math.tan(DEEP_STORM_TRACER_VIEW.fovDeg * Math.PI / 360);
  const safeAspect = Math.max(0.1, aspect);
  let distance = 0;
  for (const x of [-half, half]) for (const z of [-half, half]) {
    for (const y of [0, 160]) {
      const depth = x * direction.x + y * direction.y + z * direction.z;
      const horizontal = (x - z) / Math.SQRT2;
      const vertical = -(x + z) * direction.y / Math.SQRT2 + y * Math.SQRT2 / norm;
      distance = Math.max(distance,
        depth + Math.abs(horizontal) / (tanVertical * safeAspect * 0.78),
        depth + Math.abs(vertical) / (tanVertical * 0.78));
    }
  }
  return {
    cameraPosition: { x: direction.x * distance, y: direction.y * distance, z: direction.z * distance },
    target: { x: 0, y: 0, z: 0 },
  };
}
