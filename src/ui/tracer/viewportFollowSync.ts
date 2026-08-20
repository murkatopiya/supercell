import type { Vec3 } from "../../core/math/Vec3.js";
import { occupancyIndexForTracerId } from "./resolveTracerPointerUp.js";

export type ViewportFollowSyncResult =
  | { kind: "set"; position: Vec3 }
  | { kind: "clear" }
  | { kind: "unavailable" };

/**
 * Per-frame Follow glue after glyph sync.
 * Returns the live particle.position object — not a copy — so in-place
 * coordinate mutation is visible without a React identity change.
 * Does not own selectedId. TracerScene still copies on setFollowPoint.
 */
export function viewportFollowSync(input: {
  followEnabled: boolean;
  particles: readonly {
    readonly tracerId: number;
    readonly position: Vec3;
  }[];
  selectedTracerId: number | null;
}): ViewportFollowSyncResult {
  if (!input.followEnabled) {
    return { kind: "clear" };
  }
  const index = occupancyIndexForTracerId(
    input.particles,
    input.selectedTracerId,
  );
  if (index === null) {
    return { kind: "unavailable" };
  }
  return { kind: "set", position: input.particles[index]!.position };
}
