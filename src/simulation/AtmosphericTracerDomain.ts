import type { Vec3 } from "../core/math/Vec3.js";

/**
 * Closed lower bound of atmospheric tracer pathlines.
 * World datum coincidence, not terrain and not a VelocityField domain.
 * docs/architecture/11-ground-atmospheric-domain-policy.md
 */
export const ATMOSPHERIC_GROUND_HEIGHT = 0;

export interface AtmosphericTracerDomainResult {
  position: Vec3;
  active: boolean;
}

/**
 * Lifecycle policy for atmospheric tracers: y >= 0.
 * Applies to the accepted integrator segment only. Does not sample
 * or mutate velocity fields.
 */
export function applyAtmosphericTracerDomain(
  from: Vec3,
  proposed: Vec3,
): AtmosphericTracerDomainResult {
  if (!(proposed.y < ATMOSPHERIC_GROUND_HEIGHT)) {
    return { position: proposed, active: true };
  }

  if (!(from.y >= ATMOSPHERIC_GROUND_HEIGHT)) {
    return { position: proposed, active: true };
  }

  const alpha = from.y / (from.y - proposed.y);
  return {
    position: {
      x: from.x + alpha * (proposed.x - from.x),
      y: ATMOSPHERIC_GROUND_HEIGHT,
      z: from.z + alpha * (proposed.z - from.z),
    },
    active: false,
  };
}

export const ATMOSPHERIC_TRACER_DOMAIN = {
  applyAcceptedStep: applyAtmosphericTracerDomain,
} as const;
