import type { Vec3 } from "../core/math/Vec3.js";
import type { TracerParticle } from "../simulation/TracerParticle.js";
import {
  type TracerSelection,
  resolveSelectedTracer,
} from "./TracerSelection.js";

/**
 * Minimal sample(P, t) → number owner. ExploreLab / GuidedLab diagnostic
 * instances satisfy this structurally. Not a diagnostic registry.
 * docs/architecture/32-diagnostic-observation-ui-architecture.md
 */
export interface PointDiagnosticSampleSource {
  sample(position: Vec3, time: number): number;
}

/**
 * Named T1 + Candidate A owners. Exactly these two; not a keyed bag.
 */
export interface PointDiagnosticSources {
  readonly tiltingTendency: PointDiagnosticSampleSource;
  readonly currentVerticalVorticity: PointDiagnosticSampleSource;
}

/**
 * Read-only snapshot of both point diagnostics at one selected tracer.
 * Sibling of TracerInspection, not an extension of it.
 * Raw SI numbers only: tiltingTendency [s⁻²], currentVerticalVorticity [s⁻¹].
 */
export interface PointDiagnosticObservation {
  readonly tracerId: number;
  readonly time: number;
  readonly position: Vec3;
  readonly tiltingTendency: number;
  readonly currentVerticalVorticity: number;
}

function copyVec3(value: Vec3): Vec3 {
  return { x: value.x, y: value.y, z: value.z };
}

/**
 * Sample both diagnostics at the selected particle's current position
 * and the caller-supplied laboratory time (must be clock.time).
 * No selection or a missing id yields undefined — never a fake or partial payload.
 * Does not mutate particle, diagnostics, clock, or selection.
 */
export function inspectSelectedPointDiagnostics(
  particles: readonly TracerParticle[],
  selection: TracerSelection,
  time: number,
  sources: PointDiagnosticSources,
): PointDiagnosticObservation | undefined {
  const particle = resolveSelectedTracer(particles, selection);
  if (particle === undefined) {
    return undefined;
  }

  const position = particle.position;
  return {
    tracerId: particle.tracerId,
    time,
    position: copyVec3(position),
    tiltingTendency: sources.tiltingTendency.sample(position, time),
    currentVerticalVorticity: sources.currentVerticalVorticity.sample(
      position,
      time,
    ),
  };
}
