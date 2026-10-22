import type { Point } from "./model.ts";

export type CameraFrame = { target: Point; position: Point; near: number; far: number };

/** Enclose ALL saved points in a sphere, plus the 150 m glyph and 15% visual margin.
 * Sphere/cone tangency fits either viewport axis independently of viewing direction.
 * Null means leave data alone and use the documented baseline-camera fallback. */
export function trajectoryFrame(points: readonly Point[], fovDeg: number, aspect: number): CameraFrame | null {
  if (!points.length || !Number.isFinite(fovDeg) || fovDeg <= 0 || fovDeg >= 180
    || !Number.isFinite(aspect) || aspect <= 0) return null;
  const min = { x: Infinity, y: Infinity, z: Infinity }, max = { x: -Infinity, y: -Infinity, z: -Infinity };
  for (const p of points) {
    if (!p || ![p.x, p.y, p.z].every(Number.isFinite)) return null;
    for (const axis of ["x", "y", "z"] as const) {
      min[axis] = Math.min(min[axis], p[axis]); max[axis] = Math.max(max[axis], p[axis]);
    }
  }
  const target = { x: min.x / 2 + max.x / 2, y: min.y / 2 + max.y / 2, z: min.z / 2 + max.z / 2 };
  const radius = (Math.hypot(max.x / 2 - min.x / 2, max.y / 2 - min.y / 2, max.z / 2 - min.z / 2) + 150) * 1.15;
  const vertical = fovDeg * Math.PI / 360;
  const limiting = Math.min(vertical, Math.atan(Math.tan(vertical) * aspect));
  const distance = radius / Math.sin(limiting);
  const directionLength = Math.hypot(12, 2, 12); // Same direction as the fixed baseline pose.
  const frame = { target, position: { x: target.x + distance * 12 / directionLength,
    y: target.y + distance * 2 / directionLength, z: target.z + distance * 12 / directionLength },
    near: Math.max(1, distance - radius * 1.5), far: Math.max(50000, distance + radius * 2) };
  return [...Object.values(frame.position), ...Object.values(target), distance, frame.near, frame.far].every(Number.isFinite)
    && distance > 0 && frame.far > frame.near ? frame : null;
}
