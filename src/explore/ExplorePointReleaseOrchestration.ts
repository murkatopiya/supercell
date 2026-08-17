import type { Vec3 } from "../core/math/Vec3.js";
import type { TracerSeedPosition } from "../simulation/createTracersFromSeeds.js";
import type { ExplorePointReleaseTool } from "./ExplorePointReleaseTool.js";
import type { ExploreTracerSession } from "./ExploreTracerSession.js";
import { shouldAcceptPlacementPick } from "./shouldAcceptPlacementPick.js";

/**
 * Observe-slot adapter used by browser Explore wiring.
 * Implemented by TracerScene via the viewport handle in production.
 */
export interface ExploreSceneSlots {
  addTracerSlot(): void;
  clearTracerSlots(): void;
  syncReleasePreview(pendingSeed: TracerSeedPosition | null): void;
  readonly tracerSlotCount: number;
}

/**
 * Slice 4 browser orchestration: pointer policy, confirm/cancel, Reset/Clear.
 * Does not own physics. Does not mutate ScenarioConfig.
 *
 * Reset clears the pending preview (tool.cancelPending). Altitude and
 * placementEnabled are unchanged. Camera is not owned here.
 *
 * docs/architecture/18-explore-arbitrary-seeding.md
 */
export class ExplorePointReleaseOrchestration {
  constructor(
    readonly session: ExploreTracerSession,
    readonly tool: ExplorePointReleaseTool,
    private readonly scene: ExploreSceneSlots,
  ) {}

  /**
   * Gate with shouldAcceptPlacementPick, then XZ-plane pick.
   * A miss does not destroy an existing pending preview.
   * Orbit-scale pointer movement is ignored.
   */
  handlePlacementAttempt(
    origin: Vec3,
    direction: Vec3,
    pointerMovementPx: number,
  ): void {
    if (
      !shouldAcceptPlacementPick({
        placementEnabled: this.tool.placementEnabled,
        pointerMovementPx,
      })
    ) {
      return;
    }
    this.tool.pickOnGroundReferencePlane(origin, direction);
    this.scene.syncReleasePreview(this.tool.pendingSeed);
  }

  /**
   * Birth at current clock.time, then append exactly one scene slot.
   * No-op without a pending seed. Does not reset the clock.
   */
  confirmRelease(): boolean {
    const pending = this.tool.pendingSeed;
    if (pending === null) {
      return false;
    }
    this.session.releasePoint(pending);
    this.scene.addTracerSlot();
    this.tool.cancelPending();
    this.scene.syncReleasePreview(null);
    return true;
  }

  cancelPending(): void {
    this.tool.cancelPending();
    this.scene.syncReleasePreview(null);
  }

  /**
   * Cohort replay at t = 0 from Explore seeds. Slot count unchanged.
   * Pending preview is cleared. Camera is not touched.
   */
  reset(): void {
    this.session.reset();
    this.tool.cancelPending();
    this.scene.syncReleasePreview(null);
  }

  /**
   * Drop occupancy. Clock unchanged. Scene slots cleared in place.
   * Pending preview is cleared. Does not recreate the scene object.
   */
  clear(): void {
    this.session.clear();
    this.scene.clearTracerSlots();
    this.tool.cancelPending();
    this.scene.syncReleasePreview(null);
  }
}
