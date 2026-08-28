import { describe, expect, it } from "vitest";
import type { HodographPoint } from "../../physics/environment/hodograph.js";
import {
  applyHodographPlotView,
  clampHodographUserScale,
  DEFAULT_HODOGRAPH_PLOT_VIEW,
  MAX_HODOGRAPH_USER_SCALE,
  MIN_HODOGRAPH_USER_SCALE,
  panHodographPlotView,
  resetHodographPlotView,
  zoomHodographPlotView,
} from "./hodographPlotView.js";
import {
  buildViewTransform,
  mapHodographPointsToScreen,
  velocityToScreen,
} from "./hodographViewTransform.js";

const demoPoints: HodographPoint[] = [
  { height: 0, eastward: 10, northward: 0 },
  { height: 1000, eastward: 20, northward: 10 },
  { height: 2000, eastward: 20, northward: 20 },
];

const demoStormMotion = { eastward: 10, northward: -10 };

describe("hodographPlotView", () => {
  it("initial autoscale includes data, origin, and equal aspect", () => {
    const autoscale = buildViewTransform(demoPoints);
    const applied = applyHodographPlotView(
      autoscale,
      DEFAULT_HODOGRAPH_PLOT_VIEW,
    );
    expect(applied).toBe(autoscale);
    expect(applied.eastwardMin).toBeLessThanOrEqual(0);
    expect(applied.eastwardMax).toBeGreaterThanOrEqual(20);
    expect(applied.northwardMin).toBeLessThanOrEqual(0);
    expect(applied.northwardMax).toBeGreaterThanOrEqual(20);

    const origin = velocityToScreen(0, 0, applied);
    const east = velocityToScreen(10, 0, applied);
    const north = velocityToScreen(0, 10, applied);
    expect(east.x - origin.x).toBeCloseTo(origin.y - north.y);
    expect(east.x - origin.x).toBeCloseTo(10 * applied.scale);
  });

  it("zoom changes scale within bounds and does not mutate points", () => {
    const snapshot = demoPoints.map((point) => ({ ...point }));
    const autoscale = buildViewTransform(demoPoints);
    const zoomed = zoomHodographPlotView({
      view: DEFAULT_HODOGRAPH_PLOT_VIEW,
      factor: 2,
      autoscale,
    });
    expect(zoomed.userScale).toBe(2);
    expect(zoomed.panEastward).toBe(0);
    expect(zoomed.panNorthward).toBe(0);

    const applied = applyHodographPlotView(autoscale, zoomed);
    expect(applied.scale).toBeCloseTo(autoscale.scale * 2);
    expect(applied.eastwardMax - applied.eastwardMin).toBeCloseTo(
      (autoscale.eastwardMax - autoscale.eastwardMin) / 2,
    );
    expect(applied.northwardMax - applied.northwardMin).toBeCloseTo(
      (autoscale.northwardMax - autoscale.northwardMin) / 2,
    );

    const origin = velocityToScreen(0, 0, applied);
    const east = velocityToScreen(10, 0, applied);
    const north = velocityToScreen(0, 10, applied);
    expect(east.x - origin.x).toBeCloseTo(origin.y - north.y);

    const overZoom = zoomHodographPlotView({
      view: { userScale: MAX_HODOGRAPH_USER_SCALE, panEastward: 0, panNorthward: 0 },
      factor: 8,
      autoscale,
    });
    expect(overZoom.userScale).toBe(MAX_HODOGRAPH_USER_SCALE);
    expect(clampHodographUserScale(0)).toBe(MIN_HODOGRAPH_USER_SCALE);
    expect(clampHodographUserScale(Number.POSITIVE_INFINITY)).toBe(
      MIN_HODOGRAPH_USER_SCALE,
    );
    expect(clampHodographUserScale(Number.NaN)).toBe(MIN_HODOGRAPH_USER_SCALE);
    expect(demoPoints).toEqual(snapshot);
  });

  it("pan changes only the plot viewport", () => {
    const snapshot = demoPoints.map((point) => ({ ...point }));
    const view = panHodographPlotView(DEFAULT_HODOGRAPH_PLOT_VIEW, 5, -3);
    expect(view).toEqual({
      userScale: 1,
      panEastward: 5,
      panNorthward: -3,
    });
    expect(demoPoints).toEqual(snapshot);

    const autoscale = buildViewTransform(demoPoints);
    const applied = applyHodographPlotView(autoscale, view);
    const centerEast =
      (applied.eastwardMin + applied.eastwardMax) / 2;
    const centerNorth =
      (applied.northwardMin + applied.northwardMax) / 2;
    const autoCenterEast =
      (autoscale.eastwardMin + autoscale.eastwardMax) / 2;
    const autoCenterNorth =
      (autoscale.northwardMin + autoscale.northwardMax) / 2;
    expect(centerEast).toBeCloseTo(autoCenterEast + 5);
    expect(centerNorth).toBeCloseTo(autoCenterNorth - 3);
    expect(applied.scale).toBeCloseTo(autoscale.scale);
  });

  it("Reset restores the autoscaled plot view", () => {
    const zoomed = {
      userScale: 4,
      panEastward: 7,
      panNorthward: -2,
    };
    expect(resetHodographPlotView()).toEqual(DEFAULT_HODOGRAPH_PLOT_VIEW);
    const autoscale = buildViewTransform(demoPoints, [demoStormMotion]);
    expect(applyHodographPlotView(autoscale, resetHodographPlotView())).toBe(
      autoscale,
    );
    expect(zoomed).not.toEqual(DEFAULT_HODOGRAPH_PLOT_VIEW);
  });

  it("panel resize is not an input to velocity-space viewport semantics", () => {
    const view = { userScale: 2, panEastward: 4, panNorthward: -1 };
    const autoscale = buildViewTransform(demoPoints);
    const a = applyHodographPlotView(autoscale, view);
    const b = applyHodographPlotView(autoscale, view);
    expect(a).toEqual(b);
    expect(a.plot).toEqual(autoscale.plot);
  });

  it("overlays share the same view transform as the hodograph knots", () => {
    const autoscale = buildViewTransform(demoPoints, [demoStormMotion]);
    const view = { userScale: 3, panEastward: 2, panNorthward: -4 };
    const transform = applyHodographPlotView(autoscale, view);
    const knots = mapHodographPointsToScreen(demoPoints, transform);
    expect(knots[0]).toEqual(
      velocityToScreen(demoPoints[0]!.eastward, demoPoints[0]!.northward, transform),
    );
    expect(
      velocityToScreen(
        demoStormMotion.eastward,
        demoStormMotion.northward,
        transform,
      ),
    ).toEqual(
      velocityToScreen(
        demoStormMotion.eastward,
        demoStormMotion.northward,
        transform,
      ),
    );

    const origin = velocityToScreen(0, 0, transform);
    const c = velocityToScreen(
      demoStormMotion.eastward,
      demoStormMotion.northward,
      transform,
    );
    const knot = velocityToScreen(20, 20, transform);
    expect(c.x).not.toBe(origin.x);
    expect(knot.y).not.toBe(origin.y);
  });

  it("pointer zoom keeps the focus velocity under the same relative view point", () => {
    const autoscale = buildViewTransform(demoPoints);
    const focus = { eastward: 10, northward: 10 };
    const zoomed = zoomHodographPlotView({
      view: DEFAULT_HODOGRAPH_PLOT_VIEW,
      factor: 2,
      autoscale,
      focus,
    });
    const before = applyHodographPlotView(
      autoscale,
      DEFAULT_HODOGRAPH_PLOT_VIEW,
    );
    const after = applyHodographPlotView(autoscale, zoomed);
    const beforeScreen = velocityToScreen(focus.eastward, focus.northward, before);
    const afterScreen = velocityToScreen(focus.eastward, focus.northward, after);
    expect(afterScreen.x).toBeCloseTo(beforeScreen.x);
    expect(afterScreen.y).toBeCloseTo(beforeScreen.y);
  });
});
