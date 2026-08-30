import * as THREE from "three";
import type { TracerPathHistory } from "../simulation/TracerPathHistory.js";
import {
  PICK_DISTANCE_TIE_EPSILON_PX,
  PICK_TOLERANCE_PX,
  createCanvasPointProjector,
  type CanvasCssRect,
  type CanvasPointProjectionOut,
} from "./pickVisibleTracerSlot.js";

/**
 * Screen-space hit of one stored path-history sample.
 * Slot index is occupancy layout; historyIndex is chronological in that lane.
 * docs/architecture/52-historical-path-probe-architecture.md
 */
export interface PathHistorySampleHit {
  readonly slotIndex: number;
  readonly historyIndex: number;
}

interface PathSampleCandidate extends PathHistorySampleHit {
  readonly dPx: number;
  readonly depth: number;
}

/**
 * Running winner of the fold below. Primitive fields so a traversal of
 * every recorded sample does not allocate one candidate per sample.
 */
interface PathSampleRunningBest {
  found: boolean;
  slotIndex: number;
  historyIndex: number;
  dPx: number;
  depth: number;
}

function acceptsPickThresholds(
  tolerancePx: number,
  tieEpsilonPx: number,
): boolean {
  return (
    Number.isFinite(tolerancePx) &&
    tolerancePx >= 0 &&
    Number.isFinite(tieEpsilonPx) &&
    tieEpsilonPx >= 0
  );
}

function takePathSample(
  best: PathSampleRunningBest,
  slotIndex: number,
  historyIndex: number,
  dPx: number,
  depth: number,
): void {
  best.found = true;
  best.slotIndex = slotIndex;
  best.historyIndex = historyIndex;
  best.dPx = dPx;
  best.depth = depth;
}

/**
 * One fold step of the Architecture 52 winner rule:
 * min d_px → front-most depth → lower slot index → lower history index.
 *
 * The comparison is against the running best in traversal order, which is
 * the single definition of the rule. Both the array form below and the
 * streaming pick use this step, so they cannot drift apart.
 */
function offerPathSample(
  best: PathSampleRunningBest,
  slotIndex: number,
  historyIndex: number,
  dPx: number,
  depth: number,
  tolerancePx: number,
  tieEpsilonPx: number,
): void {
  if (
    !Number.isFinite(dPx) ||
    !Number.isFinite(depth) ||
    !(dPx <= tolerancePx) ||
    !(depth > 0)
  ) {
    return;
  }
  if (!best.found) {
    takePathSample(best, slotIndex, historyIndex, dPx, depth);
    return;
  }
  const dDiff = dPx - best.dPx;
  if (dDiff < -tieEpsilonPx) {
    takePathSample(best, slotIndex, historyIndex, dPx, depth);
    return;
  }
  if (Math.abs(dDiff) <= tieEpsilonPx) {
    if (depth < best.depth) {
      takePathSample(best, slotIndex, historyIndex, dPx, depth);
      return;
    }
    if (depth === best.depth) {
      if (slotIndex < best.slotIndex) {
        takePathSample(best, slotIndex, historyIndex, dPx, depth);
        return;
      }
      if (
        slotIndex === best.slotIndex &&
        historyIndex < best.historyIndex
      ) {
        takePathSample(best, slotIndex, historyIndex, dPx, depth);
      }
    }
  }
}

function emptyRunningBest(): PathSampleRunningBest {
  return {
    found: false,
    slotIndex: 0,
    historyIndex: 0,
    dPx: 0,
    depth: 0,
  };
}

function runningBestHit(
  best: PathSampleRunningBest,
): PathHistorySampleHit | null {
  return best.found
    ? { slotIndex: best.slotIndex, historyIndex: best.historyIndex }
    : null;
}

/**
 * Deterministic winner among path samples already inside tolerance.
 * min d_px → front-most depth → lower slot index → lower history index.
 */
export function choosePathHistorySampleWinner(
  candidates: readonly PathSampleCandidate[],
  tolerancePx: number = PICK_TOLERANCE_PX,
  tieEpsilonPx: number = PICK_DISTANCE_TIE_EPSILON_PX,
): PathHistorySampleHit | null {
  if (!acceptsPickThresholds(tolerancePx, tieEpsilonPx)) {
    return null;
  }

  const best = emptyRunningBest();
  for (const candidate of candidates) {
    offerPathSample(
      best,
      candidate.slotIndex,
      candidate.historyIndex,
      candidate.dPx,
      candidate.depth,
      tolerancePx,
      tieEpsilonPx,
    );
  }
  return runningBestHit(best);
}

/**
 * Screen-space pick of nearest stored path sample. Empty lanes skipped.
 * Does not interpolate segments. Does not pick glyphs.
 *
 * Traversal is chronological within a lane and ascending by lane, and the
 * winner rule is the shared fold step, so the result is identical to
 * scoring every sample into an array first. Recorded samples are read
 * without the pointsFor copy because one pointer event visits every stored
 * sample of every lane.
 */
export function pickPathHistorySampleByScreenDistance(
  pathHistory: TracerPathHistory,
  camera: THREE.Camera,
  pointerCanvasXCssPx: number,
  pointerCanvasYCssPx: number,
  canvasWidthCssPx: number,
  canvasHeightCssPx: number,
  tolerancePx: number = PICK_TOLERANCE_PX,
): PathHistorySampleHit | null {
  if (
    !Number.isFinite(pointerCanvasXCssPx) ||
    !Number.isFinite(pointerCanvasYCssPx)
  ) {
    return null;
  }

  const tieEpsilonPx = PICK_DISTANCE_TIE_EPSILON_PX;
  if (!acceptsPickThresholds(tolerancePx, tieEpsilonPx)) {
    return null;
  }

  const projector = createCanvasPointProjector(
    camera,
    canvasWidthCssPx,
    canvasHeightCssPx,
  );
  if (projector === null) {
    return null;
  }

  const best = emptyRunningBest();
  const projected: CanvasPointProjectionOut = { x: 0, y: 0, depth: 0 };
  let slotIndex = 0;

  const visit = (
    x: number,
    y: number,
    z: number,
    historyIndex: number,
  ): void => {
    if (!projector.projectInto(x, y, z, projected)) {
      return;
    }
    const dPx = Math.hypot(
      pointerCanvasXCssPx - projected.x,
      pointerCanvasYCssPx - projected.y,
    );
    // Early reject: offerPathSample discards these too, so skipping them
    // here changes cost only, never the winner.
    if (!Number.isFinite(dPx) || !(dPx <= tolerancePx)) {
      return;
    }
    offerPathSample(
      best,
      slotIndex,
      historyIndex,
      dPx,
      projected.depth,
      tolerancePx,
      tieEpsilonPx,
    );
  };

  for (slotIndex = 0; slotIndex < pathHistory.tracerCount; slotIndex++) {
    pathHistory.forEachPoint(slotIndex, visit);
  }

  return runningBestHit(best);
}

export function pickPathHistorySampleAtClientPoint(
  pathHistory: TracerPathHistory,
  camera: THREE.Camera,
  clientX: number,
  clientY: number,
  rect: CanvasCssRect,
  tolerancePx: number = PICK_TOLERANCE_PX,
): PathHistorySampleHit | null {
  if (
    !Number.isFinite(clientX) ||
    !Number.isFinite(clientY) ||
    !Number.isFinite(rect.left) ||
    !Number.isFinite(rect.top) ||
    !Number.isFinite(rect.width) ||
    !Number.isFinite(rect.height) ||
    !(rect.width > 0) ||
    !(rect.height > 0)
  ) {
    return null;
  }
  return pickPathHistorySampleByScreenDistance(
    pathHistory,
    camera,
    clientX - rect.left,
    clientY - rect.top,
    rect.width,
    rect.height,
    tolerancePx,
  );
}
