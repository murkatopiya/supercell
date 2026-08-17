import type { TracerParticle } from "../simulation/TracerParticle.js";

/**
 * Interaction-owned selected tracer identity.
 * Does not own particles, fields, or rendering.
 * docs/architecture/19-shared-tracer-inspector.md
 */
export class TracerSelection {
  #selectedId: number | null = null;

  get selectedId(): number | null {
    return this.#selectedId;
  }

  select(tracerId: number): void {
    this.#selectedId = tracerId;
  }

  clear(): void {
    this.#selectedId = null;
  }
}

/**
 * Lookup by runtime identity. Index is occupancy layout, not the key.
 */
export function findTracerById(
  particles: readonly TracerParticle[],
  tracerId: number,
): TracerParticle | undefined {
  for (const particle of particles) {
    if (particle.tracerId === tracerId) {
      return particle;
    }
  }
  return undefined;
}

/**
 * Resolve the selected tracer against a caller-owned particle list.
 * Does not mutate selection if the id is missing.
 */
export function resolveSelectedTracer(
  particles: readonly TracerParticle[],
  selection: TracerSelection,
): TracerParticle | undefined {
  if (selection.selectedId === null) {
    return undefined;
  }
  return findTracerById(particles, selection.selectedId);
}
