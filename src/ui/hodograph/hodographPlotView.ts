import {
  fitEqualAspect,
  type VelocitySample,
  type ViewTransform,
} from "./hodographViewTransform.js";

/**
 * Velocity-space camera on top of the autoscale transform.
 * userScale = 1 and zero pan is the v1 autoscale (Reset View).
 * Independent of panel CSS geometry.
 */
export interface HodographPlotView {
  userScale: number;
  panEastward: number;
  panNorthward: number;
}

export const MIN_HODOGRAPH_USER_SCALE = 1;
export const MAX_HODOGRAPH_USER_SCALE = 12;
export const HODOGRAPH_ZOOM_STEP = 1.25;

export const DEFAULT_HODOGRAPH_PLOT_VIEW: HodographPlotView = {
  userScale: 1,
  panEastward: 0,
  panNorthward: 0,
};

export function clampHodographUserScale(scale: number): number {
  if (!Number.isFinite(scale) || scale <= 0) {
    return MIN_HODOGRAPH_USER_SCALE;
  }
  return Math.min(
    MAX_HODOGRAPH_USER_SCALE,
    Math.max(MIN_HODOGRAPH_USER_SCALE, scale),
  );
}

function finiteOrZero(value: number): number {
  return Number.isFinite(value) ? value : 0;
}

export function normalizeHodographPlotView(
  view: HodographPlotView,
): HodographPlotView {
  return {
    userScale: clampHodographUserScale(view.userScale),
    panEastward: finiteOrZero(view.panEastward),
    panNorthward: finiteOrZero(view.panNorthward),
  };
}

export function plotViewsEqual(
  a: HodographPlotView,
  b: HodographPlotView,
): boolean {
  return (
    a.userScale === b.userScale &&
    a.panEastward === b.panEastward &&
    a.panNorthward === b.panNorthward
  );
}

export function resetHodographPlotView(): HodographPlotView {
  return { ...DEFAULT_HODOGRAPH_PLOT_VIEW };
}

export function panHodographPlotView(
  view: HodographPlotView,
  deltaEastward: number,
  deltaNorthward: number,
): HodographPlotView {
  const current = normalizeHodographPlotView(view);
  return {
    userScale: current.userScale,
    panEastward: current.panEastward + finiteOrZero(deltaEastward),
    panNorthward: current.panNorthward + finiteOrZero(deltaNorthward),
  };
}

/**
 * Zoom in velocity space. When a focus velocity is given, that sample stays
 * under the pointer (or the same screen point). Buttons omit focus and zoom
 * about the current view center (pan unchanged).
 */
export function zoomHodographPlotView(args: {
  view: HodographPlotView;
  factor: number;
  autoscale: ViewTransform;
  focus?: VelocitySample;
}): HodographPlotView {
  const current = normalizeHodographPlotView(args.view);
  const factor =
    Number.isFinite(args.factor) && args.factor > 0 ? args.factor : 1;
  const nextScale = clampHodographUserScale(current.userScale * factor);
  if (nextScale === current.userScale || args.focus === undefined) {
    return {
      userScale: nextScale,
      panEastward: current.panEastward,
      panNorthward: current.panNorthward,
    };
  }

  const autoscaleCenterEastward =
    (args.autoscale.eastwardMin + args.autoscale.eastwardMax) / 2;
  const autoscaleCenterNorthward =
    (args.autoscale.northwardMin + args.autoscale.northwardMax) / 2;
  const centerEastward = autoscaleCenterEastward + current.panEastward;
  const centerNorthward = autoscaleCenterNorthward + current.panNorthward;
  const ratio = current.userScale / nextScale;
  const nextCenterEastward =
    args.focus.eastward - (args.focus.eastward - centerEastward) * ratio;
  const nextCenterNorthward =
    args.focus.northward - (args.focus.northward - centerNorthward) * ratio;

  return {
    userScale: nextScale,
    panEastward: nextCenterEastward - autoscaleCenterEastward,
    panNorthward: nextCenterNorthward - autoscaleCenterNorthward,
  };
}

/**
 * Apply user zoom/pan on top of the existing autoscale transform.
 * Uses the autoscale plot rect (fixed SVG viewBox). Panel CSS resize is
 * not an input: it does not change velocity-space viewport semantics.
 */
export function applyHodographPlotView(
  autoscale: ViewTransform,
  view: HodographPlotView,
): ViewTransform {
  const normalized = normalizeHodographPlotView(view);
  if (
    normalized.userScale === 1 &&
    normalized.panEastward === 0 &&
    normalized.panNorthward === 0
  ) {
    return autoscale;
  }

  const eastwardSpan =
    (autoscale.eastwardMax - autoscale.eastwardMin) / normalized.userScale;
  const northwardSpan =
    (autoscale.northwardMax - autoscale.northwardMin) / normalized.userScale;
  const centerEastward =
    (autoscale.eastwardMin + autoscale.eastwardMax) / 2 +
    normalized.panEastward;
  const centerNorthward =
    (autoscale.northwardMin + autoscale.northwardMax) / 2 +
    normalized.panNorthward;

  return fitEqualAspect(
    {
      eastwardMin: centerEastward - eastwardSpan / 2,
      eastwardMax: centerEastward + eastwardSpan / 2,
      northwardMin: centerNorthward - northwardSpan / 2,
      northwardMax: centerNorthward + northwardSpan / 2,
    },
    autoscale.plot,
  );
}
