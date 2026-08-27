import { describe, expect, it } from "vitest";
import type { HodographPoint } from "../../physics/environment/hodograph.js";
import { horizontalVorticityFromShear } from "../../physics/environment/horizontalVorticity.js";
import { stormRelativeWind } from "../../physics/environment/stormRelativeWind.js";
import { decomposeHorizontalVorticity } from "../../physics/environment/streamwiseCrosswiseVorticity.js";
import { verticalWindShearBetween } from "../../physics/environment/verticalWindShear.js";
import { EnvironmentalWindProfile } from "../../physics/environment/EnvironmentalWindProfile.js";
import {
  OMEGA_ARROW_LENGTH_PX,
  areAdjacentExactKnots,
  buildViewTransform,
  canBuildStreamwiseCrosswiseTips,
  computeVelocityDomain,
  expandVelocityDomain,
  findExactHodographPoint,
  fitEqualAspect,
  formatHeightMeters,
  hodographHeightLabelIndices,
  isZeroHorizontalVorticity,
  mapHodographPointsToScreen,
  omegaArrowEnd,
  omegaScreenUnitDirection,
  padVelocityDomain,
  plotRectFromViewBox,
  resolveVorticityLayer,
  segmentVelocityMidpoint,
  streamwiseCrosswiseTips,
  velocityTicks,
  velocityToScreen,
  MIN_VELOCITY_SPAN,
  PADDING_FRACTION,
} from "./hodographViewTransform.js";

const demoStormMotion = { eastward: 10, northward: -10 };

const demoPoints: HodographPoint[] = [
  { height: 0, eastward: 10, northward: 0 },
  { height: 1000, eastward: 20, northward: 10 },
  { height: 2000, eastward: 20, northward: 20 },
];

describe("hodographViewTransform", () => {
  describe("computeVelocityDomain", () => {
    it("includes (0, 0) and all point velocities", () => {
      const domain = computeVelocityDomain(demoPoints);
      expect(domain).toEqual({
        eastwardMin: 0,
        eastwardMax: 20,
        northwardMin: 0,
        northwardMax: 20,
      });
    });

    it("expands to negative winds when present while still including origin", () => {
      const domain = computeVelocityDomain([
        { eastward: -5, northward: 8 },
        { eastward: 3, northward: -2 },
      ]);
      expect(domain.eastwardMin).toBe(-5);
      expect(domain.eastwardMax).toBe(3);
      expect(domain.northwardMin).toBe(-2);
      expect(domain.northwardMax).toBe(8);
    });

    it("does not treat storm motion as a knot point", () => {
      const domain = computeVelocityDomain(demoPoints);
      expect(domain.northwardMin).toBe(0);
      expect(domain.northwardMax).toBe(20);
    });
  });

  describe("expandVelocityDomain", () => {
    it("includes overlay C outside the point-only domain", () => {
      const base = computeVelocityDomain(demoPoints);
      const expanded = expandVelocityDomain(base, [demoStormMotion]);

      expect(base.northwardMin).toBe(0);
      expect(expanded).toEqual({
        eastwardMin: 0,
        eastwardMax: 20,
        northwardMin: -10,
        northwardMax: 20,
      });
    });

    it("keeps (0, 0) when expanding with C", () => {
      const expanded = expandVelocityDomain(
        computeVelocityDomain(demoPoints),
        [demoStormMotion],
      );
      expect(expanded.eastwardMin).toBeLessThanOrEqual(0);
      expect(expanded.eastwardMax).toBeGreaterThanOrEqual(0);
      expect(expanded.northwardMin).toBeLessThanOrEqual(0);
      expect(expanded.northwardMax).toBeGreaterThanOrEqual(0);
    });

    it("does not shrink when C lies inside the existing domain", () => {
      const base = computeVelocityDomain(demoPoints);
      const expanded = expandVelocityDomain(base, [
        { eastward: 10, northward: 10 },
      ]);
      expect(expanded).toEqual(base);
    });
  });

  describe("padVelocityDomain", () => {
    it("applies deterministic fractional padding", () => {
      const padded = padVelocityDomain({
        eastwardMin: 0,
        eastwardMax: 20,
        northwardMin: 0,
        northwardMax: 20,
      });
      const pad = 20 * PADDING_FRACTION;
      expect(padded).toEqual({
        eastwardMin: -pad,
        eastwardMax: 20 + pad,
        northwardMin: -pad,
        northwardMax: 20 + pad,
      });
    });

    it("enforces minimum span for degenerate domains", () => {
      const padded = padVelocityDomain({
        eastwardMin: 0,
        eastwardMax: 0,
        northwardMin: 0,
        northwardMax: 0,
      });
      const rawSpan = MIN_VELOCITY_SPAN;
      const pad = rawSpan * PADDING_FRACTION;
      expect(padded.eastwardMax - padded.eastwardMin).toBeCloseTo(
        rawSpan + 2 * pad,
      );
      expect(padded.northwardMax - padded.northwardMin).toBeCloseTo(
        rawSpan + 2 * pad,
      );
    });
  });

  describe("velocityToScreen / equal aspect", () => {
    it("increases screen X when eastward increases", () => {
      const transform = buildViewTransform(demoPoints);
      const a = velocityToScreen(0, 0, transform);
      const b = velocityToScreen(10, 0, transform);
      expect(b.x).toBeGreaterThan(a.x);
      expect(b.y).toBeCloseTo(a.y);
    });

    it("decreases screen Y when northward increases (northward up)", () => {
      const transform = buildViewTransform(demoPoints);
      const a = velocityToScreen(0, 0, transform);
      const b = velocityToScreen(0, 10, transform);
      expect(b.y).toBeLessThan(a.y);
      expect(b.x).toBeCloseTo(a.x);
    });

    it("maps equal velocity deltas to equal pixel lengths", () => {
      const transform = buildViewTransform(demoPoints);
      const o = velocityToScreen(0, 0, transform);
      const east = velocityToScreen(10, 0, transform);
      const north = velocityToScreen(0, 10, transform);

      const dx = east.x - o.x;
      const dy = o.y - north.y;
      expect(dx).toBeCloseTo(dy);
      expect(dx).toBeCloseTo(10 * transform.scale);
    });

    it("uses one shared scale when fitting a non-square domain", () => {
      const domain = padVelocityDomain({
        eastwardMin: 0,
        eastwardMax: 40,
        northwardMin: 0,
        northwardMax: 10,
      });
      const plot = plotRectFromViewBox();
      const transform = fitEqualAspect(domain, plot);
      const eSpan = domain.eastwardMax - domain.eastwardMin;
      const nSpan = domain.northwardMax - domain.northwardMin;
      expect(transform.scale).toBeCloseTo(
        Math.min(plot.width / eSpan, plot.height / nSpan),
      );
    });
  });

  describe("mapHodographPointsToScreen", () => {
    it("preserves input point order for the polyline", () => {
      const transform = buildViewTransform(demoPoints);
      const screen = mapHodographPointsToScreen(demoPoints, transform);
      expect(screen).toHaveLength(demoPoints.length);
      for (let i = 0; i < demoPoints.length; i++) {
        expect(screen[i]).toEqual(
          velocityToScreen(
            demoPoints[i]!.eastward,
            demoPoints[i]!.northward,
            transform,
          ),
        );
      }
    });

    it("keeps ground-relative point velocities when storm motion overlay is present", () => {
      const withOverlay = buildViewTransform(demoPoints, [demoStormMotion]);
      const screen = mapHodographPointsToScreen(demoPoints, withOverlay);

      for (let i = 0; i < demoPoints.length; i++) {
        expect(screen[i]).toEqual(
          velocityToScreen(
            demoPoints[i]!.eastward,
            demoPoints[i]!.northward,
            withOverlay,
          ),
        );
      }

      expect(demoPoints.map((p) => [p.eastward, p.northward])).toEqual([
        [10, 0],
        [20, 10],
        [20, 20],
      ]);
    });
  });

  describe("storm motion overlay transform", () => {
    it("maps C with the same velocityToScreen helper", () => {
      const transform = buildViewTransform(demoPoints, [demoStormMotion]);
      const screen = velocityToScreen(
        demoStormMotion.eastward,
        demoStormMotion.northward,
        transform,
      );

      expect(screen.x).toBeCloseTo(
        transform.offsetX +
          (demoStormMotion.eastward - transform.eastwardMin) * transform.scale,
      );
      expect(screen.y).toBeCloseTo(
        transform.offsetY +
          (transform.northwardMax - demoStormMotion.northward) *
            transform.scale,
      );
      expect(transform.northwardMin).toBeLessThanOrEqual(-10);
    });

    it("still equal-aspect fits when C is inside the point domain", () => {
      const transform = buildViewTransform(demoPoints, [
        { eastward: 10, northward: 10 },
      ]);
      const o = velocityToScreen(0, 0, transform);
      const east = velocityToScreen(10, 0, transform);
      const north = velocityToScreen(0, 10, transform);
      expect(east.x - o.x).toBeCloseTo(o.y - north.y);
    });
  });

  describe("velocityTicks", () => {
    it("returns deterministic ticks for the same domain", () => {
      const a = velocityTicks(-2, 22);
      const b = velocityTicks(-2, 22);
      expect(a).toEqual(b);
      expect(a).toContain(0);
    });
  });

  describe("formatHeightMeters", () => {
    it("formats height labels in meters only", () => {
      expect(formatHeightMeters(0)).toBe("0 m");
      expect(formatHeightMeters(1000)).toBe("1000 m");
      expect(formatHeightMeters(2000)).toBe("2000 m");
    });
  });

  describe("hodographHeightLabelIndices", () => {
    it("labels every knot on a short DEMO-length column", () => {
      expect(hodographHeightLabelIndices(demoPoints)).toEqual(new Set([0, 1, 2]));
    });

    it("keeps endpoints and about one label per kilometre on a dense column", () => {
      const dense: HodographPoint[] = [];
      for (let i = 0; i < 50; i++) {
        dense.push({
          height: 2.4 + i * 250,
          eastward: i,
          northward: 0,
        });
      }
      const indices = hodographHeightLabelIndices(dense);
      expect(indices.has(0)).toBe(true);
      expect(indices.has(dense.length - 1)).toBe(true);
      expect(indices.size).toBeLessThan(dense.length);
      expect(indices.size).toBeGreaterThan(2);
    });
  });

  describe("storm-relative wind overlay geometry", () => {
    const wind0 = demoPoints[0]!;

    it("matches horizontal V_sr for demo C and wind at 0 m", () => {
      const vsr = stormRelativeWind(
        {
          eastward: wind0.eastward,
          northward: wind0.northward,
          vertical: 0,
        },
        demoStormMotion,
      );

      expect(vsr).toEqual({
        eastward: 0,
        northward: 10,
        vertical: 0,
      });
      expect(wind0.eastward - demoStormMotion.eastward).toBe(vsr.eastward);
      expect(wind0.northward - demoStormMotion.northward).toBe(vsr.northward);
    });

    it("maps demo V_sr arrow straight upward in screen space", () => {
      const transform = buildViewTransform(demoPoints, [demoStormMotion]);
      const start = velocityToScreen(
        demoStormMotion.eastward,
        demoStormMotion.northward,
        transform,
      );
      const end = velocityToScreen(wind0.eastward, wind0.northward, transform);

      expect(end.x - start.x).toBeCloseTo(0);
      expect(end.y).toBeLessThan(start.y);
      expect(start.y - end.y).toBeCloseTo(10 * transform.scale);
    });

    it("finds exact knot heights and silently misses others", () => {
      expect(findExactHodographPoint(demoPoints, 0)).toEqual(wind0);
      expect(findExactHodographPoint(demoPoints, 500)).toBeUndefined();
    });

    it("does not rewrite ground-relative point components", () => {
      expect(demoPoints.map((p) => [p.eastward, p.northward])).toEqual([
        [10, 0],
        [20, 10],
        [20, 20],
      ]);
    });
  });

  describe("horizontal vorticity overlay geometry", () => {
    const demoOmega = { omegaEastward: -0.01, omegaNorthward: 0.01 };

    it("matches demo shear → ω_h for layer [0, 1000]", () => {
      const profile = new EnvironmentalWindProfile(
        demoPoints.map((point) => ({
          height: point.height,
          velocity: {
            eastward: point.eastward,
            northward: point.northward,
            vertical: 0,
          },
        })),
      );
      const shear = verticalWindShearBetween(profile, 0, 1000);
      expect(shear).toEqual({ shearEastward: 0.01, shearNorthward: 0.01 });
      expect(horizontalVorticityFromShear(shear)).toEqual(demoOmega);
    });

    it("points demo ω_h up-left in screen space", () => {
      const unit = omegaScreenUnitDirection(
        demoOmega.omegaEastward,
        demoOmega.omegaNorthward,
      );
      expect(unit).not.toBeNull();
      expect(unit!.x).toBeLessThan(0);
      expect(unit!.y).toBeLessThan(0);
      expect(Math.hypot(unit!.x, unit!.y)).toBeCloseTo(1);
    });

    it("uses fixed L_px independent of |ω| and velocity scale", () => {
      const unit = omegaScreenUnitDirection(-0.01, 0.01)!;
      const unitLarge = omegaScreenUnitDirection(-1, 1)!;
      expect(unit.x).toBeCloseTo(unitLarge.x);
      expect(unit.y).toBeCloseTo(unitLarge.y);

      const transform = buildViewTransform(demoPoints, [demoStormMotion]);
      const mid = segmentVelocityMidpoint(demoPoints[0]!, demoPoints[1]!);
      const anchor = velocityToScreen(mid.eastward, mid.northward, transform);
      const tip = omegaArrowEnd(anchor, unit, OMEGA_ARROW_LENGTH_PX);
      expect(Math.hypot(tip.x - anchor.x, tip.y - anchor.y)).toBeCloseTo(
        OMEGA_ARROW_LENGTH_PX,
      );
      expect(Math.hypot(tip.x - anchor.x, tip.y - anchor.y)).not.toBeCloseTo(
        Math.hypot(demoOmega.omegaEastward, demoOmega.omegaNorthward) *
          transform.scale,
      );
    });

    it("preserves screen-direction signs across different autoscales", () => {
      const unit = omegaScreenUnitDirection(-0.01, 0.01)!;
      const a = buildViewTransform(demoPoints);
      const b = buildViewTransform(demoPoints, [{ eastward: 40, northward: -30 }]);
      const mid = segmentVelocityMidpoint(demoPoints[0]!, demoPoints[1]!);
      const tipA = omegaArrowEnd(
        velocityToScreen(mid.eastward, mid.northward, a),
        unit,
      );
      const tipB = omegaArrowEnd(
        velocityToScreen(mid.eastward, mid.northward, b),
        unit,
      );
      const anchorA = velocityToScreen(mid.eastward, mid.northward, a);
      const anchorB = velocityToScreen(mid.eastward, mid.northward, b);
      expect(Math.sign(tipA.x - anchorA.x)).toBe(Math.sign(unit.x));
      expect(Math.sign(tipA.y - anchorA.y)).toBe(Math.sign(unit.y));
      expect(Math.sign(tipB.x - anchorB.x)).toBe(Math.sign(unit.x));
      expect(Math.sign(tipB.y - anchorB.y)).toBe(Math.sign(unit.y));
    });

    it("resolves valid layers and rejects missing knots", () => {
      const resolved = resolveVorticityLayer(demoPoints, {
        h0: 0,
        h1: 1000,
        vorticity: demoOmega,
      });
      expect(resolved).not.toBeNull();
      expect(resolved!.lower.height).toBe(0);
      expect(resolved!.upper.height).toBe(1000);

      expect(
        resolveVorticityLayer(demoPoints, {
          h0: 0,
          h1: 500,
          vorticity: demoOmega,
        }),
      ).toBeNull();
      expect(
        resolveVorticityLayer(demoPoints, {
          h0: 1000,
          h1: 0,
          vorticity: demoOmega,
        }),
      ).toBeNull();
    });

    it("treats zero vorticity as no arrow direction while layer can remain valid", () => {
      const zero = { omegaEastward: 0, omegaNorthward: 0 };
      expect(isZeroHorizontalVorticity(zero)).toBe(true);
      expect(omegaScreenUnitDirection(0, 0)).toBeNull();

      const resolved = resolveVorticityLayer(demoPoints, {
        h0: 0,
        h1: 1000,
        vorticity: zero,
      });
      expect(resolved).not.toBeNull();
    });

    it("anchors ω_h at velocity midpoint via velocityToScreen only", () => {
      const transform = buildViewTransform(demoPoints, [demoStormMotion]);
      const mid = segmentVelocityMidpoint(demoPoints[0]!, demoPoints[1]!);
      expect(mid).toEqual({ eastward: 15, northward: 5 });
      const anchor = velocityToScreen(mid.eastward, mid.northward, transform);
      expect(anchor).toEqual(
        velocityToScreen(15, 5, transform),
      );
    });
  });

  describe("streamwise / crosswise overlay geometry", () => {
    const demoOmega = { omegaEastward: -0.01, omegaNorthward: 0.01 };
    const vsr0 = stormRelativeWind(
      { eastward: 10, northward: 0, vertical: 0 },
      demoStormMotion,
    );
    const vsr1000 = stormRelativeWind(
      { eastward: 20, northward: 10, vertical: 0 },
      demoStormMotion,
    );
    const vsrAvg = {
      eastward: (vsr0.eastward + vsr1000.eastward) / 2,
      northward: (vsr0.northward + vsr1000.northward) / 2,
      vertical: 0,
    };
    const decomposition = decomposeHorizontalVorticity(vsrAvg, demoOmega);

    it("builds demo V_sr_avg and decomposition numbers", () => {
      expect(vsrAvg).toEqual({ eastward: 5, northward: 15, vertical: 0 });
      expect(decomposition.omegaStreamwise).toBeCloseTo(0.02 / Math.sqrt(10), 12);
      expect(decomposition.omegaCrosswise).toBeCloseTo(0.04 / Math.sqrt(10), 12);
      expect(decomposition.omegaStreamwise).toBeGreaterThan(0);
      expect(decomposition.omegaCrosswise).toBeGreaterThan(0);
    });

    it("accepts adjacent knots and rejects non-adjacent layers", () => {
      expect(areAdjacentExactKnots(demoPoints, 0, 1000)).toBe(true);
      expect(areAdjacentExactKnots(demoPoints, 0, 2000)).toBe(false);
    });

    it("reconstructs ω_h tip from proportional ω_s and ω_c tips", () => {
      const transform = buildViewTransform(demoPoints, [demoStormMotion]);
      const mid = segmentVelocityMidpoint(demoPoints[0]!, demoPoints[1]!);
      const anchor = velocityToScreen(mid.eastward, mid.northward, transform);
      const tips = streamwiseCrosswiseTips(
        anchor,
        demoOmega,
        vsrAvg.eastward,
        vsrAvg.northward,
        decomposition,
      );
      expect(tips).not.toBeNull();

      const sumX =
        tips!.tipStreamwise.x -
        anchor.x +
        (tips!.tipCrosswise.x - anchor.x);
      const sumY =
        tips!.tipStreamwise.y -
        anchor.y +
        (tips!.tipCrosswise.y - anchor.y);
      expect(sumX).toBeCloseTo(tips!.tipOmega.x - anchor.x, 10);
      expect(sumY).toBeCloseTo(tips!.tipOmega.y - anchor.y, 10);
    });

    it("points demo ω_s up-right and ω_c / ω_h up-left", () => {
      const transform = buildViewTransform(demoPoints, [demoStormMotion]);
      const mid = segmentVelocityMidpoint(demoPoints[0]!, demoPoints[1]!);
      const anchor = velocityToScreen(mid.eastward, mid.northward, transform);
      const tips = streamwiseCrosswiseTips(
        anchor,
        demoOmega,
        vsrAvg.eastward,
        vsrAvg.northward,
        decomposition,
      )!;

      expect(tips.tipStreamwise.x - anchor.x).toBeGreaterThan(0);
      expect(tips.tipStreamwise.y - anchor.y).toBeLessThan(0);
      expect(tips.tipCrosswise.x - anchor.x).toBeLessThan(0);
      expect(tips.tipCrosswise.y - anchor.y).toBeLessThan(0);
      expect(tips.tipOmega.x - anchor.x).toBeLessThan(0);
      expect(tips.tipOmega.y - anchor.y).toBeLessThan(0);
    });

    it("reverses streamwise tip when omegaStreamwise is negative", () => {
      const transform = buildViewTransform(demoPoints, [demoStormMotion]);
      const mid = segmentVelocityMidpoint(demoPoints[0]!, demoPoints[1]!);
      const anchor = velocityToScreen(mid.eastward, mid.northward, transform);
      const positive = streamwiseCrosswiseTips(
        anchor,
        demoOmega,
        vsrAvg.eastward,
        vsrAvg.northward,
        decomposition,
      )!;
      const negative = streamwiseCrosswiseTips(
        anchor,
        demoOmega,
        vsrAvg.eastward,
        vsrAvg.northward,
        {
          omegaStreamwise: -decomposition.omegaStreamwise,
          omegaCrosswise: decomposition.omegaCrosswise,
        },
      )!;

      expect(negative.tipStreamwise.x - anchor.x).toBeCloseTo(
        -(positive.tipStreamwise.x - anchor.x),
        10,
      );
      expect(negative.tipStreamwise.y - anchor.y).toBeCloseTo(
        -(positive.tipStreamwise.y - anchor.y),
        10,
      );
    });

    it("silences tips for zero ω or zero V_sr_avg", () => {
      const anchor = { x: 0, y: 0 };
      expect(
        streamwiseCrosswiseTips(
          anchor,
          { omegaEastward: 0, omegaNorthward: 0 },
          5,
          15,
          decomposition,
        ),
      ).toBeNull();
      expect(
        streamwiseCrosswiseTips(anchor, demoOmega, 0, 0, decomposition),
      ).toBeNull();
    });

    it("requires matching vorticityLayer bounds and adjacent knots to build", () => {
      const overlay = {
        h0: 0,
        h1: 1000,
        basisStormRelativeWind: vsrAvg,
        decomposition,
      };
      const layer = { h0: 0, h1: 1000, vorticity: demoOmega };
      expect(canBuildStreamwiseCrosswiseTips(demoPoints, layer, overlay)).toBe(
        true,
      );
      expect(
        canBuildStreamwiseCrosswiseTips(
          demoPoints,
          { h0: 0, h1: 2000, vorticity: demoOmega },
          overlay,
        ),
      ).toBe(false);
      expect(
        canBuildStreamwiseCrosswiseTips(
          demoPoints,
          layer,
          { ...overlay, h1: 2000 },
        ),
      ).toBe(false);
    });

    it("does not use selected-knot V_sr as the decomposition basis", () => {
      // Selected-knot V_sr at h=0 is (0,10); layer basis must remain V_sr_avg (5,15).
      expect(vsr0).toEqual({ eastward: 0, northward: 10, vertical: 0 });
      expect(vsrAvg).not.toEqual(vsr0);
      const atKnot = decomposeHorizontalVorticity(vsr0, demoOmega);
      expect(atKnot.omegaStreamwise).not.toBeCloseTo(
        decomposition.omegaStreamwise,
        6,
      );
    });
  });
});
