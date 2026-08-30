import * as THREE from "three";

/**
 * Screen-space acquisition tolerance in CSS/canvas pixels.
 * Rest-pose glyph (~150 m at ~18 km) projects to roughly 5–6 px on a
 * ~600 px-tall view; 16 px is ~3× that silhouette — enough aim forgiveness
 * without a world-space hit shell that balloons when zoomed.
 * docs/architecture/36-explore-selection-acquisition-identity-architecture.md
 */
export const PICK_TOLERANCE_PX = 16;

/** Treat d_px as tied when |da − db| ≤ this (CSS px). */
export const PICK_DISTANCE_TIE_EPSILON_PX = 1e-3;

export interface CanvasCssRect {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

export interface ProjectedCanvasPoint {
  /** CSS px relative to canvas left edge. */
  readonly x: number;
  /** CSS px relative to canvas top edge. */
  readonly y: number;
  /** Positive view-forward distance from camera (metres). */
  readonly depth: number;
}

export interface ScreenPickCandidate {
  readonly slotIndex: number;
  readonly dPx: number;
  readonly depth: number;
}

/** Caller-owned projection result. Written in place; never retained. */
export interface CanvasPointProjectionOut {
  x: number;
  y: number;
  depth: number;
}

/**
 * Camera-invariant half of projectWorldPointToCanvasPixels, resolved once.
 *
 * The camera world matrix, world position, and view direction do not change
 * while one synchronous pick runs, so hoisting them out of a per-point loop
 * is arithmetically identical to recomputing them for every point. Rejection
 * of non-finite input, points behind the camera, and points outside the NDC
 * frustum is unchanged.
 */
export interface CanvasPointProjector {
  /**
   * Write one world point's CSS-pixel projection into `out` and return true.
   * Returns false and leaves `out` untouched when the point is rejected.
   */
  projectInto(
    worldX: number,
    worldY: number,
    worldZ: number,
    out: CanvasPointProjectionOut,
  ): boolean;
}

/**
 * Null when the canvas size is unusable. Reuses two scratch vectors, so a
 * projector must not be shared across concurrent traversals.
 */
export function createCanvasPointProjector(
  camera: THREE.Camera,
  canvasWidthCssPx: number,
  canvasHeightCssPx: number,
): CanvasPointProjector | null {
  if (
    !(canvasWidthCssPx > 0) ||
    !(canvasHeightCssPx > 0) ||
    !Number.isFinite(canvasWidthCssPx) ||
    !Number.isFinite(canvasHeightCssPx)
  ) {
    return null;
  }

  camera.updateMatrixWorld();

  const cameraPosition = new THREE.Vector3();
  camera.getWorldPosition(cameraPosition);
  const viewDirection = new THREE.Vector3();
  camera.getWorldDirection(viewDirection);
  const depthPoint = new THREE.Vector3();
  const ndcPoint = new THREE.Vector3();

  return {
    projectInto(worldX, worldY, worldZ, out): boolean {
      if (
        !Number.isFinite(worldX) ||
        !Number.isFinite(worldY) ||
        !Number.isFinite(worldZ)
      ) {
        return false;
      }

      const depth = depthPoint
        .set(worldX, worldY, worldZ)
        .sub(cameraPosition)
        .dot(viewDirection);
      if (!(depth > 0) || !Number.isFinite(depth)) {
        return false;
      }

      const ndc = ndcPoint.set(worldX, worldY, worldZ).project(camera);
      if (
        !Number.isFinite(ndc.x) ||
        !Number.isFinite(ndc.y) ||
        !Number.isFinite(ndc.z) ||
        ndc.x < -1 ||
        ndc.x > 1 ||
        ndc.y < -1 ||
        ndc.y > 1 ||
        ndc.z < -1 ||
        ndc.z > 1
      ) {
        return false;
      }

      out.x = ((ndc.x + 1) / 2) * canvasWidthCssPx;
      out.y = ((1 - ndc.y) / 2) * canvasHeightCssPx;
      out.depth = depth;
      return true;
    },
  };
}

/**
 * Project a world point into CSS canvas pixels using the live camera.
 * Rejects non-finite input, points behind the camera, and points outside
 * the NDC frustum (including near/far). Does not allocate product state.
 */
export function projectWorldPointToCanvasPixels(
  camera: THREE.Camera,
  world: { readonly x: number; readonly y: number; readonly z: number },
  canvasWidthCssPx: number,
  canvasHeightCssPx: number,
): ProjectedCanvasPoint | null {
  if (
    !Number.isFinite(world.x) ||
    !Number.isFinite(world.y) ||
    !Number.isFinite(world.z)
  ) {
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

  const projected: CanvasPointProjectionOut = { x: 0, y: 0, depth: 0 };
  return projector.projectInto(world.x, world.y, world.z, projected)
    ? projected
    : null;
}

/**
 * Deterministic winner among candidates already inside tolerance.
 * min d_px → front-most (smaller depth) → lower slot index.
 */
export function chooseScreenPickWinner(
  candidates: readonly ScreenPickCandidate[],
  tolerancePx: number = PICK_TOLERANCE_PX,
  tieEpsilonPx: number = PICK_DISTANCE_TIE_EPSILON_PX,
): number | null {
  if (
    !Number.isFinite(tolerancePx) ||
    !(tolerancePx >= 0) ||
    !Number.isFinite(tieEpsilonPx) ||
    !(tieEpsilonPx >= 0)
  ) {
    return null;
  }

  let best: ScreenPickCandidate | null = null;
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
      if (
        candidate.depth === best.depth &&
        candidate.slotIndex < best.slotIndex
      ) {
        best = candidate;
      }
    }
  }
  return best?.slotIndex ?? null;
}

/**
 * Screen-space pick of visible scientific glyph centers.
 * Pointer and projection meet in CSS canvas pixels (not drawing-buffer px).
 * Hidden meshes and invalid projections are skipped.
 */
export function pickVisibleTracerSlotByScreenDistance(
  slots: readonly { readonly mesh: THREE.Object3D }[],
  camera: THREE.Camera,
  pointerCanvasXCssPx: number,
  pointerCanvasYCssPx: number,
  canvasWidthCssPx: number,
  canvasHeightCssPx: number,
  tolerancePx: number = PICK_TOLERANCE_PX,
): number | null {
  if (
    !Number.isFinite(pointerCanvasXCssPx) ||
    !Number.isFinite(pointerCanvasYCssPx)
  ) {
    return null;
  }

  const candidates: ScreenPickCandidate[] = [];
  for (let i = 0; i < slots.length; i++) {
    const mesh = slots[i]!.mesh;
    if (!mesh.visible) {
      continue;
    }
    mesh.updateMatrixWorld(true);
    const projected = projectWorldPointToCanvasPixels(
      camera,
      mesh.getWorldPosition(new THREE.Vector3()),
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
      slotIndex: i,
      dPx,
      depth: projected.depth,
    });
  }

  return chooseScreenPickWinner(candidates, tolerancePx);
}

/**
 * Client/CSS pointer → canvas-local CSS px, then screen-space pick.
 */
export function pickVisibleTracerSlotAtClientPoint(
  slots: readonly { readonly mesh: THREE.Object3D }[],
  camera: THREE.Camera,
  clientX: number,
  clientY: number,
  rect: CanvasCssRect,
  tolerancePx: number = PICK_TOLERANCE_PX,
): number | null {
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
  return pickVisibleTracerSlotByScreenDistance(
    slots,
    camera,
    clientX - rect.left,
    clientY - rect.top,
    rect.width,
    rect.height,
    tolerancePx,
  );
}
