import type { HodographPoint } from "../../physics/environment/hodograph.js";

/** Fixed logical SVG size (CSS scales the element; no ResizeObserver). */
export const VIEWBOX_WIDTH = 640;
export const VIEWBOX_HEIGHT = 480;

/** Margins inside the viewBox for axis titles and labels. */
export const PLOT_MARGIN = {
  top: 36,
  right: 72,
  bottom: 52,
  left: 56,
} as const;

/** Deterministic padding as a fraction of each velocity span. */
export const PADDING_FRACTION = 0.1;

/** Minimum velocity span (m/s) so scale stays finite for degenerate domains. */
export const MIN_VELOCITY_SPAN = 1;

export interface VelocityDomain {
  eastwardMin: number;
  eastwardMax: number;
  northwardMin: number;
  northwardMax: number;
}

export interface PlotRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Equal-aspect view transform in logical SVG coordinates.
 * screenX increases with eastward; screenY decreases with northward.
 */
export interface ViewTransform {
  scale: number;
  eastwardMin: number;
  eastwardMax: number;
  northwardMin: number;
  northwardMax: number;
  offsetX: number;
  offsetY: number;
  plot: PlotRect;
}

export interface ScreenPoint {
  x: number;
  y: number;
}

export function plotRectFromViewBox(
  width = VIEWBOX_WIDTH,
  height = VIEWBOX_HEIGHT,
  margin = PLOT_MARGIN,
): PlotRect {
  return {
    x: margin.left,
    y: margin.top,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };
}

/**
 * Velocity domain covering (0, 0) and every point.
 * Empty input still yields the origin-only domain.
 */
export function computeVelocityDomain(
  points: readonly Pick<HodographPoint, "eastward" | "northward">[],
): VelocityDomain {
  let eastwardMin = 0;
  let eastwardMax = 0;
  let northwardMin = 0;
  let northwardMax = 0;

  for (const point of points) {
    eastwardMin = Math.min(eastwardMin, point.eastward);
    eastwardMax = Math.max(eastwardMax, point.eastward);
    northwardMin = Math.min(northwardMin, point.northward);
    northwardMax = Math.max(northwardMax, point.northward);
  }

  return { eastwardMin, eastwardMax, northwardMin, northwardMax };
}

export interface VelocitySample {
  eastward: number;
  northward: number;
}

/**
 * Expand a velocity domain to also cover overlay samples (e.g. storm motion C).
 * Does not itself include (0, 0); callers start from computeVelocityDomain.
 */
export function expandVelocityDomain(
  domain: VelocityDomain,
  velocities: readonly VelocitySample[],
): VelocityDomain {
  let { eastwardMin, eastwardMax, northwardMin, northwardMax } = domain;

  for (const velocity of velocities) {
    eastwardMin = Math.min(eastwardMin, velocity.eastward);
    eastwardMax = Math.max(eastwardMax, velocity.eastward);
    northwardMin = Math.min(northwardMin, velocity.northward);
    northwardMax = Math.max(northwardMax, velocity.northward);
  }

  return { eastwardMin, eastwardMax, northwardMin, northwardMax };
}

function expandSpan(
  min: number,
  max: number,
  minSpan: number,
): { min: number; max: number } {
  const span = max - min;
  if (span >= minSpan) {
    return { min, max };
  }
  const mid = (min + max) / 2;
  const half = minSpan / 2;
  return { min: mid - half, max: mid + half };
}

/** Apply min-span handling then fractional padding (deterministic). */
export function padVelocityDomain(domain: VelocityDomain): VelocityDomain {
  const east = expandSpan(
    domain.eastwardMin,
    domain.eastwardMax,
    MIN_VELOCITY_SPAN,
  );
  const north = expandSpan(
    domain.northwardMin,
    domain.northwardMax,
    MIN_VELOCITY_SPAN,
  );

  const eSpan = east.max - east.min;
  const nSpan = north.max - north.min;
  const ePad = eSpan * PADDING_FRACTION;
  const nPad = nSpan * PADDING_FRACTION;

  return {
    eastwardMin: east.min - ePad,
    eastwardMax: east.max + ePad,
    northwardMin: north.min - nPad,
    northwardMax: north.max + nPad,
  };
}

/**
 * Fit padded domain into plot rect with one shared scale (equal m/s per px).
 * Letterboxes / pillarboxes; does not stretch axes independently.
 */
export function fitEqualAspect(
  domain: VelocityDomain,
  plot: PlotRect,
): ViewTransform {
  const eSpan = domain.eastwardMax - domain.eastwardMin;
  const nSpan = domain.northwardMax - domain.northwardMin;
  const scale = Math.min(plot.width / eSpan, plot.height / nSpan);

  const usedWidth = eSpan * scale;
  const usedHeight = nSpan * scale;

  return {
    scale,
    eastwardMin: domain.eastwardMin,
    eastwardMax: domain.eastwardMax,
    northwardMin: domain.northwardMin,
    northwardMax: domain.northwardMax,
    offsetX: plot.x + (plot.width - usedWidth) / 2,
    offsetY: plot.y + (plot.height - usedHeight) / 2,
    plot,
  };
}

export function buildViewTransform(
  points: readonly Pick<HodographPoint, "eastward" | "northward">[],
  overlayVelocities: readonly VelocitySample[] = [],
): ViewTransform {
  let domain = computeVelocityDomain(points);
  if (overlayVelocities.length > 0) {
    domain = expandVelocityDomain(domain, overlayVelocities);
  }
  return fitEqualAspect(padVelocityDomain(domain), plotRectFromViewBox());
}

export function velocityToScreen(
  eastward: number,
  northward: number,
  transform: ViewTransform,
): ScreenPoint {
  return {
    x: transform.offsetX + (eastward - transform.eastwardMin) * transform.scale,
    y:
      transform.offsetY +
      (transform.northwardMax - northward) * transform.scale,
  };
}

/**
 * Minimal deterministic ticks for a closed velocity interval.
 * Step depends only on span thresholds (same domain → same ticks).
 */
export function velocityTicks(min: number, max: number): number[] {
  const span = max - min;
  let step: number;
  if (span <= 5) {
    step = 1;
  } else if (span <= 20) {
    step = 5;
  } else if (span <= 50) {
    step = 10;
  } else {
    step = 20;
  }

  const start = Math.ceil(min / step) * step;
  const ticks: number[] = [];
  for (let value = start; value <= max + step * 1e-9; value += step) {
    // Canonicalize IEEE signed zero.
    ticks.push(value + 0);
  }
  return ticks;
}

export function formatHeightMeters(height: number): string {
  return `${height} m`;
}

export function mapHodographPointsToScreen(
  points: readonly HodographPoint[],
  transform: ViewTransform,
): ScreenPoint[] {
  return points.map((point) =>
    velocityToScreen(point.eastward, point.northward, transform),
  );
}

/** Exact knot match only. No interpolation; undefined if height is absent. */
export function findExactHodographPoint(
  points: readonly HodographPoint[],
  height: number,
): HodographPoint | undefined {
  return points.find((point) => point.height === height);
}

/**
 * Screen-space arrowhead triangle at `to`, pointing along `from → to`.
 * Returns null when the segment has zero length.
 */
export function arrowheadPolygonPoints(
  from: ScreenPoint,
  to: ScreenPoint,
  length = 10,
  halfWidth = 4.5,
): string | null {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const segmentLength = Math.hypot(dx, dy);
  if (!(segmentLength > 0)) {
    return null;
  }

  const ux = dx / segmentLength;
  const uy = dy / segmentLength;
  const px = -uy;
  const py = ux;
  const baseX = to.x - ux * length;
  const baseY = to.y - uy * length;

  return [
    `${to.x},${to.y}`,
    `${baseX + px * halfWidth},${baseY + py * halfWidth}`,
    `${baseX - px * halfWidth},${baseY - py * halfWidth}`,
  ].join(" ");
}

/** Fixed schematic ω_h arrow length in logical SVG/viewBox pixels. */
export const OMEGA_ARROW_LENGTH_PX = 54;

export interface HorizontalVorticityLayerOverlay {
  h0: number;
  h1: number;
  vorticity: {
    omegaEastward: number;
    omegaNorthward: number;
  };
}

export interface ResolvedVorticityLayer {
  lower: HodographPoint;
  upper: HodographPoint;
  vorticity: HorizontalVorticityLayerOverlay["vorticity"];
}

/**
 * Exact-knot layer validation. Invalid → null (silent).
 * Does not decide whether to draw the arrow (zero ω still resolves).
 */
export function resolveVorticityLayer(
  points: readonly HodographPoint[],
  overlay: HorizontalVorticityLayerOverlay | undefined,
): ResolvedVorticityLayer | null {
  if (!overlay) {
    return null;
  }
  if (!(overlay.h1 > overlay.h0)) {
    return null;
  }

  const lower = findExactHodographPoint(points, overlay.h0);
  const upper = findExactHodographPoint(points, overlay.h1);
  if (!lower || !upper) {
    return null;
  }

  return {
    lower,
    upper,
    vorticity: overlay.vorticity,
  };
}

export function segmentVelocityMidpoint(
  lower: Pick<HodographPoint, "eastward" | "northward">,
  upper: Pick<HodographPoint, "eastward" | "northward">,
): VelocitySample {
  return {
    eastward: (lower.eastward + upper.eastward) / 2,
    northward: (lower.northward + upper.northward) / 2,
  };
}

export function isZeroHorizontalVorticity(vorticity: {
  omegaEastward: number;
  omegaNorthward: number;
}): boolean {
  return vorticity.omegaEastward === 0 && vorticity.omegaNorthward === 0;
}

/**
 * Unit screen direction for ω_h: normalize (omegaEastward, -omegaNorthward).
 * Does not map vorticity through velocityToScreen.
 * Zero vorticity → null.
 */
export function omegaScreenUnitDirection(
  omegaEastward: number,
  omegaNorthward: number,
): ScreenPoint | null {
  const sx = omegaEastward;
  const sy = 0 - omegaNorthward;
  const mag = Math.hypot(sx, sy);
  if (!(mag > 0)) {
    return null;
  }
  return { x: sx / mag, y: sy / mag };
}

export function omegaArrowEnd(
  anchor: ScreenPoint,
  screenUnit: ScreenPoint,
  lengthPx: number = OMEGA_ARROW_LENGTH_PX,
): ScreenPoint {
  return {
    x: anchor.x + screenUnit.x * lengthPx,
    y: anchor.y + screenUnit.y * lengthPx,
  };
}

export interface StreamwiseCrosswiseVorticityOverlay {
  h0: number;
  h1: number;
  basisStormRelativeWind: {
    eastward: number;
    northward: number;
    vertical: number;
  };
  decomposition: {
    omegaStreamwise: number;
    omegaCrosswise: number;
  };
}

export interface StreamwiseCrosswiseTips {
  tipOmega: ScreenPoint;
  tipStreamwise: ScreenPoint;
  tipCrosswise: ScreenPoint;
}

/** True when h0/h1 are exact adjacent knots (no interior knots). */
export function areAdjacentExactKnots(
  points: readonly HodographPoint[],
  h0: number,
  h1: number,
): boolean {
  if (!(h1 > h0)) {
    return false;
  }
  const lower = findExactHodographPoint(points, h0);
  const upper = findExactHodographPoint(points, h1);
  if (!lower || !upper) {
    return false;
  }
  for (const point of points) {
    if (point.height > h0 && point.height < h1) {
      return false;
    }
  }
  return true;
}

export function vorticityLayersMatch(
  a: { h0: number; h1: number },
  b: { h0: number; h1: number },
): boolean {
  return a.h0 === b.h0 && a.h1 === b.h1;
}

function atmosphericScreenUnit(
  eastward: number,
  northward: number,
): ScreenPoint | null {
  const sx = eastward;
  const sy = 0 - northward;
  const mag = Math.hypot(sx, sy);
  if (!(mag > 0)) {
    return null;
  }
  return { x: sx / mag, y: sy / mag };
}

function signedUnitScale(value: number): number {
  if (value > 0) {
    return 1;
  }
  if (value < 0) {
    return -1;
  }
  return 0;
}

/**
 * Proportional parallelogram tips for ω_h = ω_s ŝ + ω_c ĉ.
 * Uses basis storm-relative wind (V_sr_avg), never selected-knot V_sr.
 * Does not map 1/s components through velocityToScreen.
 */
export function streamwiseCrosswiseTips(
  anchor: ScreenPoint,
  vorticity: { omegaEastward: number; omegaNorthward: number },
  basisEastward: number,
  basisNorthward: number,
  decomposition: { omegaStreamwise: number; omegaCrosswise: number },
  lengthPx: number = OMEGA_ARROW_LENGTH_PX,
): StreamwiseCrosswiseTips | null {
  const omegaMag = Math.hypot(vorticity.omegaEastward, vorticity.omegaNorthward);
  if (!(omegaMag > 0)) {
    return null;
  }

  const basisSpeed = Math.hypot(basisEastward, basisNorthward);
  if (!(basisSpeed > 0)) {
    return null;
  }

  const tipOmegaUnit = atmosphericScreenUnit(
    vorticity.omegaEastward,
    vorticity.omegaNorthward,
  );
  if (!tipOmegaUnit) {
    return null;
  }

  const sHatEast = basisEastward / basisSpeed;
  const sHatNorth = basisNorthward / basisSpeed;
  const cHatEast = 0 - sHatNorth;
  const cHatNorth = sHatEast;

  const sScreen = atmosphericScreenUnit(sHatEast, sHatNorth);
  const cScreen = atmosphericScreenUnit(cHatEast, cHatNorth);
  if (!sScreen || !cScreen) {
    return null;
  }

  const omegaStreamwise = decomposition.omegaStreamwise;
  const omegaCrosswise = decomposition.omegaCrosswise;
  const lengthS = (Math.abs(omegaStreamwise) / omegaMag) * lengthPx;
  const lengthC = (Math.abs(omegaCrosswise) / omegaMag) * lengthPx;
  const signS = signedUnitScale(omegaStreamwise);
  const signC = signedUnitScale(omegaCrosswise);

  return {
    tipOmega: {
      x: anchor.x + tipOmegaUnit.x * lengthPx,
      y: anchor.y + tipOmegaUnit.y * lengthPx,
    },
    tipStreamwise: {
      x: anchor.x + signS * sScreen.x * lengthS,
      y: anchor.y + signS * sScreen.y * lengthS,
    },
    tipCrosswise: {
      x: anchor.x + signC * cScreen.x * lengthC,
      y: anchor.y + signC * cScreen.y * lengthC,
    },
  };
}

/**
 * Geometry gate for streamwise/crosswise glyphs (visibility checked separately).
 */
export function canBuildStreamwiseCrosswiseTips(
  points: readonly HodographPoint[],
  vorticityLayer: HorizontalVorticityLayerOverlay | undefined,
  overlay: StreamwiseCrosswiseVorticityOverlay | undefined,
): boolean {
  if (!vorticityLayer || !overlay) {
    return false;
  }
  if (!vorticityLayersMatch(vorticityLayer, overlay)) {
    return false;
  }
  if (!areAdjacentExactKnots(points, overlay.h0, overlay.h1)) {
    return false;
  }
  if (isZeroHorizontalVorticity(vorticityLayer.vorticity)) {
    return false;
  }
  const basis = overlay.basisStormRelativeWind;
  if (!(Math.hypot(basis.eastward, basis.northward) > 0)) {
    return false;
  }
  return resolveVorticityLayer(points, vorticityLayer) !== null;
}
