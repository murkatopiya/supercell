import type { Vec3 } from "../../core/math/Vec3.js";
import type { WorldRay } from "../../rendering/worldRayFromCameraNdc.js";

/** UI comparison area only, not physical model support. No epsilon or grid snap. */
export const COMPARE_FLOW_AREA = Object.freeze({ minX: 1500, maxX: 5500, minZ: -1000, maxZ: 1000, height: 1000 });
export const COMPARE_FLOW_STEP = 100;
export const COMPARE_FLOW_RAY_CUTOFF = 1e-8; // Preliminary normalized-ray UI policy, not physics.
export type CompareFlowDirection = "east" | "west" | "north" | "south";
export type PlacementResult = { readonly kind: "valid"; readonly position: Readonly<Vec3> }
  | { readonly kind: "invalid"; readonly reason: "ray" | "bounds" };

export function isCompareFlowPosition(p: Readonly<Vec3>): boolean {
  const a = COMPARE_FLOW_AREA;
  return [p.x, p.y, p.z].every(Number.isFinite) && p.y === a.height &&
    p.x >= a.minX && p.x <= a.maxX && p.z >= a.minZ && p.z <= a.maxZ;
}

export function intersectCompareFlowPlane(ray: WorldRay | null): PlacementResult {
  if (!ray) return { kind: "invalid", reason: "ray" };
  const { origin: o, direction: d } = ray;
  const length = Math.hypot(d.x, d.y, d.z);
  if (![o.x, o.y, o.z, d.x, d.y, d.z, length].every(Number.isFinite) || length === 0) return { kind: "invalid", reason: "ray" };
  const dy = d.y / length;
  if (Math.abs(dy) <= COMPARE_FLOW_RAY_CUTOFF) return { kind: "invalid", reason: "ray" };
  const lambda = (COMPARE_FLOW_AREA.height - o.y) / dy;
  const position = { x: o.x + lambda * (d.x / length), y: COMPARE_FLOW_AREA.height, z: o.z + lambda * (d.z / length) };
  if (!Number.isFinite(lambda) || lambda < 0 || ![position.x, position.z].every(Number.isFinite)) return { kind: "invalid", reason: "ray" };
  return isCompareFlowPosition(position) ? { kind: "valid", position: Object.freeze(position) } : { kind: "invalid", reason: "bounds" };
}

/** Relative controls alone clip their final step; pointer placements never clamp. */
export function offsetCompareFlowB(p: Readonly<Vec3>, direction: CompareFlowDirection): Readonly<Vec3> {
  if (!isCompareFlowPosition(p)) throw new RangeError("Invalid comparison position");
  const a = COMPARE_FLOW_AREA;
  const x = direction === "east" ? Math.min(a.maxX, p.x + COMPARE_FLOW_STEP)
    : direction === "west" ? Math.max(a.minX, p.x - COMPARE_FLOW_STEP) : p.x;
  const z = direction === "north" ? Math.max(a.minZ, p.z - COMPARE_FLOW_STEP)
    : direction === "south" ? Math.min(a.maxZ, p.z + COMPARE_FLOW_STEP) : p.z;
  return x === p.x && z === p.z ? p : Object.freeze({ x, y: a.height, z });
}

/** One pending click/tap, never drag. Cancellation cannot be revived by pointerup. */
export class CompareFlowGesture {
  private candidate: { id: number; x: number; y: number } | null = null;
  cancel(): void { this.candidate = null; }
  begin(id: number, x: number, y: number, primary: boolean, button: number): void {
    if (this.candidate || !primary || button !== 0 || ![id, x, y].every(Number.isFinite)) { this.cancel(); return; }
    this.candidate = { id, x, y };
  }
  move(id: number, x: number, y: number): void {
    const c = this.candidate;
    if (c && (id !== c.id || ![x, y].every(Number.isFinite) || Math.hypot(x - c.x, y - c.y) > 5)) this.cancel();
  }
  end(id: number, x: number, y: number): boolean {
    this.move(id, x, y);
    const accepted = this.candidate?.id === id;
    this.cancel(); return accepted;
  }
}
