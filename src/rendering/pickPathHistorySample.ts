import * as THREE from "three";
import type { TracerPathHistory } from "../simulation/TracerPathHistory.js";
import {
  PICK_DISTANCE_TIE_EPSILON_PX,
  PICK_TOLERANCE_PX,
  projectWorldPointToCanvasPixels,
  type CanvasCssRect,
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
 * Deterministic winner among path samples already inside tolerance.
 * min d_px → front-most depth → lower slot index → lower history index.
 */
export function choosePathHistorySampleWinner(
  candidates: readonly PathSampleCandidate[],
  tolerancePx: number = PICK_TOLERANCE_PX,
  tieEpsilonPx: number = PICK_DISTANCE_TIE_EPSILON_PX,
): PathHistorySampleHit | null {
  if (
    !Number.isFinite(tolerancePx) ||
    !(tolerancePx >= 0) ||
    !Number.isFinite(tieEpsilonPx) ||
    !(tieEpsilonPx >= 0)
  ) {
    return null;
  }

  let best: PathSampleCandidate | null = null;
  for (const candidate of candidates) {
    if (
      !Number.isFinite(candidate.dPx) ||
      !Number.isFinite(candidate.depth) ||
      !(candidate.dPx <= tolerancePx) ||
      !(candidate.depth > 0)
    ) {
      continue;
    }
    if (best === null) {
      best = candidate;
      continue;
    }
    const dDiff = candidate.dPx - best.dPx;
    if (dDiff < -tieEpsilonPx) {
      best = candidate;
      continue;
    }
    if (Math.abs(dDiff) <= tieEpsilonPx) {
      if (candidate.depth < best.depth) {
        best = candidate;
        continue;
      }
      if (candidate.depth === best.depth) {
        if (candidate.slotIndex < best.slotIndex) {
          best = candidate;
          continue;
        }
        if (
          candidate.slotIndex === best.slotIndex &&
          candidate.historyIndex < best.historyIndex
        ) {
          best = candidate;
        }
      }
    }
  }
  return best === null
    ? null
    : { slotIndex: best.slotIndex, historyIndex: best.historyIndex };
}

/**
 * Screen-space pick of nearest stored path sample. Empty lanes skipped.
 * Does not interpolate segments. Does not pick glyphs.
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

  const candidates: PathSampleCandidate[] = [];
  for (let slotIndex = 0; slotIndex < pathHistory.tracerCount; slotIndex++) {
    const points = pathHistory.pointsFor(slotIndex);
    for (let historyIndex = 0; historyIndex < points.length; historyIndex++) {
      const point = points[historyIndex]!;
      const projected = projectWorldPointToCanvasPixels(
        camera,
        point,
        canvasWidthCssPx,
        canvasHeightCssPx,
      );
      if (projected === null) {
        continue;
      }
      const dPx = Math.hypot(
        pointerCanvasXCssPx - projected.x,
        pointerCanvasYCssPx - projected.y,
      );
      if (!Number.isFinite(dPx)) {
        continue;
      }
      candidates.push({
        slotIndex,
        historyIndex,
        dPx,
        depth: projected.depth,
      });
    }
  }

  return choosePathHistorySampleWinner(candidates, tolerancePx);
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
