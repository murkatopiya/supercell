import { ATMOSPHERIC_GROUND_HEIGHT } from "./AtmosphericTracerDomain.js";
import type { TracerSeedPosition } from "./createTracersFromSeeds.js";

export class AtmosphericTracerSeedError extends Error {
  readonly name = "AtmosphericTracerSeedError";

  constructor(message: string) {
    super(message);
  }
}

/**
 * Creation-time atmospheric occupancy: finite x/y/z and y >= 0.
 * Does not clip horizontally. Does not apply crossing interpolation.
 * docs/architecture/11-ground-atmospheric-domain-policy.md
 * docs/architecture/18-explore-arbitrary-seeding.md
 */
export function assertAtmosphericTracerSeed(seed: TracerSeedPosition): void {
  assertFinite(seed.x, "seed.x");
  assertFinite(seed.y, "seed.y");
  assertFinite(seed.z, "seed.z");
  if (seed.y < ATMOSPHERIC_GROUND_HEIGHT) {
    throw new AtmosphericTracerSeedError("seed.y must be >= 0");
  }
}

/**
 * Validate and copy a seed. Canonicalizes IEEE-754 signed zero to +0.
 * Caller mutation of the input after this returns does not affect the copy.
 */
export function copyAtmosphericTracerSeed(
  seed: TracerSeedPosition,
): TracerSeedPosition {
  assertAtmosphericTracerSeed(seed);
  return {
    x: seed.x + 0,
    y: seed.y + 0,
    z: seed.z + 0,
  };
}

function assertFinite(value: number, label: string): void {
  if (!Number.isFinite(value)) {
    throw new AtmosphericTracerSeedError(`${label} must be finite`);
  }
}
