import type { VelocityField } from "../core/fields/VelocityField.js";
import type { Vec3 } from "../core/math/Vec3.js";
import type { TracerParticle } from "../simulation/TracerParticle.js";
import {
  type TracerSelection,
  resolveSelectedTracer,
} from "./TracerSelection.js";

/**
 * One named summand of the current model, not a UI label.
 * docs/architecture/19-shared-tracer-inspector.md
 */
export interface InspectableVelocityPart {
  readonly key: string;
  readonly field: VelocityField;
}

/**
 * Same VelocityField instances Simulation integrates.
 * `parts` is model-specific and may be omitted.
 */
export interface InspectableVelocityOperands {
  readonly total: VelocityField;
  readonly parts?: readonly InspectableVelocityPart[];
}

export interface VelocityContribution {
  readonly key: string;
  readonly velocity: Vec3;
}

/**
 * Read-only snapshot of one tracer plus current model velocity.
 * No Explore / Guided / pedagogy fields.
 */
export interface TracerInspection {
  readonly tracerId: number;
  readonly time: number;
  readonly position: Vec3;
  readonly altitude: number;
  readonly age: number;
  readonly active: boolean;
  readonly vTotal: Vec3;
  readonly speed: number;
  readonly contributions?: readonly VelocityContribution[];
}

function copyVec3(value: Vec3): Vec3 {
  return { x: value.x, y: value.y, z: value.z };
}

/**
 * Sample model velocity at an explicit world point and laboratory time.
 * Does not mutate fields, clock, or selection.
 */
export function inspectWorldPoint(
  tracerId: number,
  position: Vec3,
  time: number,
  age: number,
  active: boolean,
  observation: InspectableVelocityOperands,
): TracerInspection {
  const vTotal = copyVec3(observation.total.sample(position, time));
  const inspection: TracerInspection = {
    tracerId,
    time,
    position: copyVec3(position),
    altitude: position.y,
    age,
    active,
    vTotal,
    speed: Math.hypot(vTotal.x, vTotal.y, vTotal.z),
  };

  const parts = observation.parts;
  if (parts === undefined || parts.length === 0) {
    return inspection;
  }

  return {
    ...inspection,
    contributions: parts.map((part) => ({
      key: part.key,
      velocity: copyVec3(part.field.sample(position, time)),
    })),
  };
}

/**
 * Sample current post-step state: particle.position at the given time.
 * Does not mutate particle, fields, clock, or selection.
 */
export function inspectTracer(
  particle: TracerParticle,
  time: number,
  observation: InspectableVelocityOperands,
): TracerInspection {
  return inspectWorldPoint(
    particle.tracerId,
    particle.position,
    time,
    particle.age,
    particle.active,
    observation,
  );
}

/**
 * Selection-aware observation. No selection or a missing id yields
 * undefined — never a fake tracer.
 */
export function inspectSelectedTracer(
  particles: readonly TracerParticle[],
  selection: TracerSelection,
  time: number,
  observation: InspectableVelocityOperands,
): TracerInspection | undefined {
  const particle = resolveSelectedTracer(particles, selection);
  if (particle === undefined) {
    return undefined;
  }
  return inspectTracer(particle, time, observation);
}
