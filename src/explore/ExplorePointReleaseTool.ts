import type { Vec3 } from "../core/math/Vec3.js";
import type { TracerSeedPosition } from "../simulation/createTracersFromSeeds.js";
import { copyAtmosphericTracerSeed } from "../simulation/assertAtmosphericTracerSeed.js";
import { intersectRayWithGroundReferencePlane } from "./intersectRayWithGroundReferencePlane.js";

/**
 * UI/session convenience only. Not a physics law and not ScenarioConfig.
 * docs/architecture/18-explore-arbitrary-seeding.md §6
 */
export const DEFAULT_EXPLORE_POINT_ALTITUDE_M = 1000;

/**
 * Pending point-release tool state: explicit altitude + optional
 * candidate seed from an XZ ground-reference pick.
 *
 * Owns only placement interaction state. Confirmed births stay on
 * the Explore session. Pointer picking must be gated separately so
 * inspect-orbit gestures are not treated as placements.
 */
export class ExplorePointReleaseTool {
  /**
   * When false, pointer policy must not treat clicks as picks.
   * pickOnGroundReferencePlane remains a headless math API.
   */
  placementEnabled = false;

  private altitudeMValue: number;
  private pending: TracerSeedPosition | null = null;

  constructor(altitudeM = DEFAULT_EXPLORE_POINT_ALTITUDE_M) {
    this.altitudeMValue = copyAltitude(altitudeM);
  }

  get altitudeM(): number {
    return this.altitudeMValue;
  }

  /** Copy of the pending candidate, or null. Not a confirmed session seed. */
  get pendingSeed(): TracerSeedPosition | null {
    return this.pending === null ? null : copySeed(this.pending);
  }

  /**
   * Set explicit altitude. Updates pending y in place when a pick exists.
   * Does not create a seed by itself.
   */
  setAltitude(y: number): void {
    this.altitudeMValue = copyAltitude(y);
    if (this.pending !== null) {
      this.pending = copyAtmosphericTracerSeed({
        x: this.pending.x,
        y: this.altitudeMValue,
        z: this.pending.z,
      });
    }
  }

  /**
   * Intersect the ray with y = 0 and, on a unique forward hit, store
   * pendingSeed = {x_hit, y_altitude, z_hit}. Miss leaves pending unchanged.
   * Does not mutate origin or direction.
   */
  pickOnGroundReferencePlane(
    origin: Vec3,
    direction: Vec3,
  ): TracerSeedPosition | null {
    const hit = intersectRayWithGroundReferencePlane(origin, direction);
    if (hit === null) {
      return null;
    }
    this.pending = copyAtmosphericTracerSeed({
      x: hit.x,
      y: this.altitudeMValue,
      z: hit.z,
    });
    return copySeed(this.pending);
  }

  cancelPending(): void {
    this.pending = null;
  }
}

function copyAltitude(y: number): number {
  return copyAtmosphericTracerSeed({ x: 0, y, z: 0 }).y;
}

function copySeed(seed: TracerSeedPosition): TracerSeedPosition {
  return { x: seed.x, y: seed.y, z: seed.z };
}
