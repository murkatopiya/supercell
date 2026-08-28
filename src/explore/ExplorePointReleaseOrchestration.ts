import type { Vec3 } from "../core/math/Vec3.js";
import type { TracerSeedPosition } from "../simulation/createTracersFromSeeds.js";
import { ExploreTracerAuthoringHistory } from "./ExploreTracerAuthoringHistory.js";
import type { ExplorePointReleaseTool } from "./ExplorePointReleaseTool.js";
import type { ExploreTracerSession } from "./ExploreTracerSession.js";
import { shouldAcceptPlacementPick } from "./shouldAcceptPlacementPick.js";

/**
 * Observe-slot adapter used by browser Explore wiring.
 * Implemented by TracerScene via the viewport handle in production.
 */
export interface ExploreSceneSlots {
  addTracerSlot(): void;
  removeLastTracerSlot(): void;
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
  readonly authoringHistory = new ExploreTracerAuthoringHistory();

  constructor(
    readonly session: ExploreTracerSession,
    readonly tool: ExplorePointReleaseTool,
    private readonly scene: ExploreSceneSlots,
  ) {}

  get canUndo(): boolean {
    return this.authoringHistory.canUndo;
  }

  get canRedo(): boolean {
    return this.authoringHistory.canRedo;
  }

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
    this.authoringHistory.recordAdd(pending);
    this.tool.cancelPending();
    this.scene.syncReleasePreview(null);
    return true;
  }

  /**
   * Remove the last successful Add tracer. Clock unchanged.
   * Remaining tracers keep current advection state.
   */
  undoLastAdd(): { seed: TracerSeedPosition; tracerId: number } | null {
    if (!this.authoringHistory.canUndo) {
      return null;
    }
    const removed = this.session.removeLastRelease();
    if (removed === null) {
      return null;
    }
    this.authoringHistory.undo();
    this.scene.removeLastTracerSlot();
    return removed;
  }

  /**
   * Repeat the undone Add tracer command at the current clock.
   * Births a new runtime identity. Does not restore the old trajectory.
   */
  redoLastAdd(): boolean {
    if (!this.authoringHistory.canRedo) {
      return false;
    }
    const command = this.authoringHistory.redo();
    if (command === null) {
      return false;
    }
    this.session.releasePoint(command.seed);
    this.scene.addTracerSlot();
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
    this.authoringHistory.clear();
    this.tool.cancelPending();
    this.scene.syncReleasePreview(null);
  }
}
