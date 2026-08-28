import type { Vec3 } from "../core/math/Vec3.js";
import type { TracerParticle } from "../simulation/TracerParticle.js";
import type { TracerPathHistory } from "../simulation/TracerPathHistory.js";

/**
 * Handle of one recorded path sample. Resolve (P, t) from the recorder
 * at inspect time. docs/architecture/52-historical-path-probe-architecture.md
 */
export interface HistoricalPathProbe {
  readonly tracerId: number;
  readonly historyIndex: number;
}

export type InspectionSampleMode = "current" | "historical";

export interface ResolvedHistoricalPathSample {
  readonly tracerId: number;
  readonly historyIndex: number;
  readonly position: Vec3;
  readonly simulationTime: number;
  readonly age: number;
  readonly active: boolean;
}

function copyVec3(value: Vec3): Vec3 {
  return { x: value.x, y: value.y, z: value.z };
}

function occupancyIndexForTracerId(
  particles: readonly { readonly tracerId: number }[],
  tracerId: number,
): number | null {
  for (let i = 0; i < particles.length; i++) {
    if (particles[i]!.tracerId === tracerId) {
      return i;
    }
  }
  return null;
}

/**
 * Resolve a path probe to a copied sample. Missing tracer, empty lane,
 * or out-of-range index yields undefined — never a fake sample.
 * Does not mutate particles, history, or the probe.
 */
export function resolveHistoricalPathSample(
  particles: readonly TracerParticle[],
  pathHistory: TracerPathHistory,
  probe: HistoricalPathProbe | null,
): ResolvedHistoricalPathSample | undefined {
  if (probe === null) {
    return undefined;
  }
  if (!Number.isInteger(probe.historyIndex) || probe.historyIndex < 0) {
    return undefined;
  }

  const particle = particles.find((item) => item.tracerId === probe.tracerId);
  if (particle === undefined) {
    return undefined;
  }

  const slotIndex = occupancyIndexForTracerId(particles, probe.tracerId);
  if (slotIndex === null) {
    return undefined;
  }

  let samples;
  try {
    samples = pathHistory.samplesFor(slotIndex);
  } catch {
    return undefined;
  }
  const sample = samples[probe.historyIndex];
  const first = samples[0];
  if (sample === undefined || first === undefined) {
    return undefined;
  }

  return {
    tracerId: probe.tracerId,
    historyIndex: probe.historyIndex,
    position: copyVec3(sample.position),
    simulationTime: sample.simulationTime,
    age: sample.simulationTime - first.simulationTime,
    active: particle.active,
  };
}
