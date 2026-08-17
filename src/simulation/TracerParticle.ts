import type { Vec3 } from "../core/math/Vec3.js";

/**
 * Advection state of a tracer. Simulation assigns `tracerId` at birth.
 * docs/architecture/19-shared-tracer-inspector.md
 */
export interface TracerAdvectionState {
  position: Vec3;
  age: number;
  active: boolean;
}

/**
 * Live tracer. `tracerId` is a runtime identity handle, not atmospheric
 * dynamics. Position, age, and active keep their existing semantics.
 */
export interface TracerParticle extends TracerAdvectionState {
  readonly tracerId: number;
}
