import { describe, expect, it } from "vitest";
import { RotationField } from "./RotationField.js";
import {
  VerticalEnvelopeRotationField,
  VerticalEnvelopeRotationFieldError,
} from "./VerticalEnvelopeRotationField.js";

describe("VerticalEnvelopeRotationField", () => {
  const centerX = 1000;
  const centerZ = -500;
  const angularVelocity = 0.05;
  const sigma = 2000;
  const baseHeight = 500;
  const topHeight = 4500;
  const heightSpan = topHeight - baseHeight;
  const yMid = (baseHeight + topHeight) / 2;

  function createField(omega = angularVelocity) {
    return new VerticalEnvelopeRotationField({
      centerX,
      centerZ,
      angularVelocity: omega,
      sigma,
      baseHeight,
      topHeight,
    });
  }

  function radialEnvelope(r2: number): number {
    return Math.exp(-r2 / (2 * sigma * sigma));
  }

  function verticalEnvelope(y: number): number {
    if (y < baseHeight || y > topHeight) {
      return 0;
    }
    return Math.sin((Math.PI * (y - baseHeight)) / heightSpan);
  }

  function expectedVelocity(
    dx: number,
    dz: number,
    y: number,
    omega = angularVelocity,
  ) {
    const E = radialEnvelope(dx * dx + dz * dz);
    const G = verticalEnvelope(y);
    return {
      x: omega * E * G * dz,
      y: 0,
      z: -omega * E * G * dx,
    };
  }

  it("samples zero velocity on the axis inside, at, and outside the layer", () => {
    const field = createField();
    const heights = [baseHeight - 200, baseHeight, yMid, topHeight, topHeight + 200];

    for (const y of heights) {
      const v = field.sample({ x: centerX, y, z: centerZ }, 0);
      expect(v.x).toBe(0);
      expect(v.y).toBe(0);
      expect(v.z).toBe(0);
    }
  });

  it("returns Vy = 0 at sampled points", () => {
    const field = createField();
    const points = [
      { x: centerX, y: yMid, z: centerZ },
      { x: centerX + 3000, y: yMid - 400, z: centerZ - 1000 },
      { x: centerX - 50, y: baseHeight, z: centerZ + 50 },
      { x: centerX, y: topHeight + 40, z: centerZ },
    ];

    for (const p of points) {
      expect(field.sample(p, 0).y).toBe(0);
    }
  });

  it("is zero off-axis below baseHeight and above topHeight", () => {
    const field = createField();
    const points = [
      { x: centerX + 800, y: baseHeight - 1, z: centerZ - 300 },
      { x: centerX + 400, y: -200, z: centerZ - 100 },
      { x: centerX - 900, y: topHeight + 1, z: centerZ + 50 },
      { x: centerX + 1200, y: 12000, z: centerZ },
    ];

    for (const p of points) {
      expect(field.sample(p, 0)).toEqual({ x: 0, y: 0, z: 0 });
    }
  });

  it("is zero off-axis at both lids", () => {
    const field = createField();
    const dx = 800;
    const dz = -300;
    const atBase = field.sample(
      { x: centerX + dx, y: baseHeight, z: centerZ + dz },
      0,
    );
    const atTop = field.sample(
      { x: centerX + dx, y: topHeight, z: centerZ + dz },
      0,
    );

    expect(atBase.x).toBeCloseTo(0, 12);
    expect(atBase.y).toBe(0);
    expect(atBase.z).toBeCloseTo(0, 12);
    expect(atTop.x).toBeCloseTo(0, 12);
    expect(atTop.y).toBe(0);
    expect(atTop.z).toBeCloseTo(0, 12);
  });

  it("matches RotationField at y_mid for the same radial parameters", () => {
    const enveloped = createField();
    const primitive = new RotationField({
      centerX,
      centerZ,
      angularVelocity,
      sigma,
    });
    const points = [
      { x: centerX, z: centerZ },
      { x: centerX + 800, z: centerZ - 300 },
      { x: centerX + sigma, z: centerZ },
      { x: centerX + 10000, z: centerZ - 7000 },
    ];

    for (const { x, z } of points) {
      const ve = enveloped.sample({ x, y: yMid, z }, 0);
      const vr = primitive.sample({ x, y: yMid, z }, 0);
      expect(ve.x).toBeCloseTo(vr.x, 12);
      expect(ve.y).toBe(0);
      expect(ve.z).toBeCloseTo(vr.z, 12);
    }
  });

  it("is tangent to the horizontal radius", () => {
    const field = createField();
    const offsets = [
      { dx: 0, dz: 0 },
      { dx: 500, dz: 0 },
      { dx: 0, dz: -800 },
      { dx: 1200, dz: -400 },
      { dx: -700, dz: 2500 },
    ];

    for (const { dx, dz } of offsets) {
      const v = field.sample(
        { x: centerX + dx, y: yMid - 200, z: centerZ + dz },
        0,
      );
      expect(dx * v.x + dz * v.z).toBeCloseTo(0, 12);
    }
  });

  it("is axisymmetric at fixed height: equal r yields equal speed", () => {
    const field = createField();
    const r = 1500;
    const y = yMid - 400;
    const expectedSpeed =
      Math.abs(angularVelocity) * r * radialEnvelope(r * r) * verticalEnvelope(y);

    const samples = [
      field.sample({ x: centerX + r, y, z: centerZ }, 0),
      field.sample({ x: centerX, y, z: centerZ + r }, 0),
      field.sample({ x: centerX - r, y, z: centerZ }, 0),
      field.sample(
        {
          x: centerX - r / Math.SQRT2,
          y,
          z: centerZ + r / Math.SQRT2,
        },
        0,
      ),
    ];

    for (const v of samples) {
      expect(Math.hypot(v.x, v.z)).toBeCloseTo(expectedSpeed, 12);
      expect(v.y).toBe(0);
    }
  });

  it("matches the separable formula off-axis, off-midpoint, and at large r", () => {
    const field = createField();
    const samples = [
      { dx: 500, dz: 0, y: yMid - 900 },
      { dx: 0, dz: 4000, y: yMid },
      { dx: 10000, dz: -7000, y: yMid + 300 },
    ];

    for (const { dx, dz, y } of samples) {
      const v = field.sample({ x: centerX + dx, y, z: centerZ + dz }, 0);
      const expected = expectedVelocity(dx, dz, y);
      expect(v.x).toBeCloseTo(expected.x, 12);
      expect(v.y).toBe(0);
      expect(v.z).toBeCloseTo(expected.z, 12);
    }
  });

  it("uses the right-hand rule around +Y at cardinal points at y_mid", () => {
    const field = createField();
    const d = 1000;
    const E = radialEnvelope(d * d);
    const speed = angularVelocity * E * d;

    const east = field.sample({ x: centerX + d, y: yMid, z: centerZ }, 0);
    expect(east.x).toBeCloseTo(0, 12);
    expect(east.y).toBe(0);
    expect(east.z).toBeCloseTo(-speed, 12);

    const west = field.sample({ x: centerX - d, y: yMid, z: centerZ }, 0);
    expect(west.x).toBeCloseTo(0, 12);
    expect(west.y).toBe(0);
    expect(west.z).toBeCloseTo(speed, 12);

    const north = field.sample({ x: centerX, y: yMid, z: centerZ - d }, 0);
    expect(north.x).toBeCloseTo(-speed, 12);
    expect(north.y).toBe(0);
    expect(north.z).toBeCloseTo(0, 12);

    const south = field.sample({ x: centerX, y: yMid, z: centerZ + d }, 0);
    expect(south.x).toBeCloseTo(speed, 12);
    expect(south.y).toBe(0);
    expect(south.z).toBeCloseTo(0, 12);
  });

  it("attains |v_theta|_max = |Ω| σ / √e at r = σ and y_mid", () => {
    const field = createField();
    const v = field.sample({ x: centerX + sigma, y: yMid, z: centerZ }, 0);
    expect(Math.hypot(v.x, v.z)).toBeCloseTo(
      (Math.abs(angularVelocity) * sigma) / Math.sqrt(Math.E),
      12,
    );
  });

  it("depends on height: off-axis interior is nonzero, exterior is zero", () => {
    const field = createField();
    const x = centerX + 800;
    const z = centerZ - 300;
    const interior = field.sample({ x, y: yMid, z }, 0);
    const exterior = field.sample({ x, y: topHeight + 100, z }, 0);

    expect(Math.hypot(interior.x, interior.z)).toBeGreaterThan(0);
    expect(exterior).toEqual({ x: 0, y: 0, z: 0 });
  });

  it("reverses velocity when angularVelocity is negated", () => {
    const positive = createField(angularVelocity);
    const negative = createField(-angularVelocity);
    const position = { x: centerX + 800, y: yMid - 100, z: centerZ - 300 };

    const vp = positive.sample(position, 0);
    const vn = negative.sample(position, 0);

    expect(vn.x).toBeCloseTo(-vp.x, 12);
    expect(vn.y).toBe(0);
    expect(vn.z).toBeCloseTo(-vp.z, 12);
  });

  it("is the zero field when angularVelocity is 0", () => {
    const field = createField(0);
    const v = field.sample({ x: centerX + 2500, y: yMid, z: centerZ - 800 }, 7);

    expect(v.x).toBe(0);
    expect(v.y).toBe(0);
    expect(v.z).toBe(0);
  });

  it("has ∇ · V = 0 at interior, lid, and exterior samples", () => {
    const field = createField();
    const h = 1e-3;

    function finiteDiv(dx: number, dz: number, y: number): number {
      const dVxDx =
        (field.sample({ x: centerX + dx + h, y, z: centerZ + dz }, 0).x -
          field.sample({ x: centerX + dx - h, y, z: centerZ + dz }, 0).x) /
        (2 * h);
      const dVyDy =
        (field.sample({ x: centerX + dx, y: y + h, z: centerZ + dz }, 0).y -
          field.sample({ x: centerX + dx, y: y - h, z: centerZ + dz }, 0).y) /
        (2 * h);
      const dVzDz =
        (field.sample({ x: centerX + dx, y, z: centerZ + dz + h }, 0).z -
          field.sample({ x: centerX + dx, y, z: centerZ + dz - h }, 0).z) /
        (2 * h);
      return dVxDx + dVyDy + dVzDz;
    }

    expect(finiteDiv(0, 0, yMid)).toBeCloseTo(0, 6);
    expect(finiteDiv(800, -300, yMid - 400)).toBeCloseTo(0, 6);
    expect(finiteDiv(sigma, 0, baseHeight)).toBeCloseTo(0, 6);
    expect(finiteDiv(500, 200, topHeight)).toBeCloseTo(0, 6);
    expect(finiteDiv(1200, -400, baseHeight - 50)).toBeCloseTo(0, 12);
    expect(finiteDiv(1200, -400, topHeight + 50)).toBeCloseTo(0, 12);
  });

  it("is steady and does not mutate the sampled position", () => {
    const field = createField();
    const position = { x: centerX + 100, y: yMid - 50, z: centerZ - 20 };

    const v0 = field.sample(position, 0);
    const v1 = field.sample(position, 99);
    expect(v0).toEqual(v1);
    expect(v0).not.toBe(v1);

    field.sample(position, 0);
    expect(position).toEqual({ x: centerX + 100, y: yMid - 50, z: centerZ - 20 });
  });

  it("accepts negative baseHeight", () => {
    const field = new VerticalEnvelopeRotationField({
      centerX,
      centerZ,
      angularVelocity,
      sigma,
      baseHeight: -200,
      topHeight: 1800,
    });
    const mid = (-200 + 1800) / 2;
    const primitive = new RotationField({
      centerX,
      centerZ,
      angularVelocity,
      sigma,
    });
    const position = { x: centerX + 600, y: mid, z: centerZ - 100 };
    const ve = field.sample(position, 0);
    const vr = primitive.sample(position, 0);
    expect(ve.x).toBeCloseTo(vr.x, 12);
    expect(ve.z).toBeCloseTo(vr.z, 12);
  });

  it("rejects non-finite parameters", () => {
    const base = {
      centerX,
      centerZ,
      angularVelocity,
      sigma,
      baseHeight,
      topHeight,
    };

    expect(
      () => new VerticalEnvelopeRotationField({ ...base, centerX: Number.NaN }),
    ).toThrow(VerticalEnvelopeRotationFieldError);
    expect(
      () =>
        new VerticalEnvelopeRotationField({
          ...base,
          centerZ: Number.POSITIVE_INFINITY,
        }),
    ).toThrow(VerticalEnvelopeRotationFieldError);
    expect(
      () =>
        new VerticalEnvelopeRotationField({
          ...base,
          angularVelocity: Number.NEGATIVE_INFINITY,
        }),
    ).toThrow(VerticalEnvelopeRotationFieldError);
    expect(
      () => new VerticalEnvelopeRotationField({ ...base, sigma: Number.NaN }),
    ).toThrow(VerticalEnvelopeRotationFieldError);
    expect(
      () =>
        new VerticalEnvelopeRotationField({
          ...base,
          baseHeight: Number.NaN,
        }),
    ).toThrow(VerticalEnvelopeRotationFieldError);
    expect(
      () =>
        new VerticalEnvelopeRotationField({
          ...base,
          topHeight: Number.POSITIVE_INFINITY,
        }),
    ).toThrow(VerticalEnvelopeRotationFieldError);
  });

  it("rejects sigma <= 0 and topHeight <= baseHeight, but allows Ω = 0 and Ω < 0", () => {
    const base = {
      centerX,
      centerZ,
      angularVelocity,
      sigma,
      baseHeight,
      topHeight,
    };

    expect(
      () => new VerticalEnvelopeRotationField({ ...base, sigma: 0 }),
    ).toThrow(VerticalEnvelopeRotationFieldError);
    expect(
      () => new VerticalEnvelopeRotationField({ ...base, sigma: -1 }),
    ).toThrow(VerticalEnvelopeRotationFieldError);
    expect(
      () =>
        new VerticalEnvelopeRotationField({
          ...base,
          topHeight: baseHeight,
        }),
    ).toThrow(VerticalEnvelopeRotationFieldError);
    expect(
      () =>
        new VerticalEnvelopeRotationField({
          ...base,
          topHeight: baseHeight - 1,
        }),
    ).toThrow(VerticalEnvelopeRotationFieldError);
    expect(
      () =>
        new VerticalEnvelopeRotationField({ ...base, angularVelocity: 0 }),
    ).not.toThrow();
    expect(
      () =>
        new VerticalEnvelopeRotationField({
          ...base,
          angularVelocity: -0.02,
        }),
    ).not.toThrow();
  });

  describe("worldVerticalVorticity", () => {
    /**
     * Independent expected ω_y. Closed G lids (diagnostic policy).
     * Must not call the production method.
     */
    function expectedWorldVerticalVorticity(
      dx: number,
      dz: number,
      y: number,
      omega = angularVelocity,
    ): number {
      if (y <= baseHeight || y >= topHeight) {
        return 0;
      }
      const r2 = dx * dx + dz * dz;
      const E = Math.exp(-r2 / (2 * sigma * sigma));
      const G = Math.sin((Math.PI * (y - baseHeight)) / heightSpan);
      return 2 * omega * G * E * (1 - r2 / (2 * sigma * sigma));
    }

    it("on the axis equals 2 Ω G, and 2 Ω at y_mid", () => {
      const field = createField();
      const y = yMid - 900;
      const onAxis = field.worldVerticalVorticity(
        { x: centerX, y, z: centerZ },
        0,
      );
      const atMid = field.worldVerticalVorticity(
        { x: centerX, y: yMid, z: centerZ },
        0,
      );
      const G = Math.sin((Math.PI * (y - baseHeight)) / heightSpan);

      expect(onAxis).toBeCloseTo(2 * angularVelocity * G, 12);
      expect(atMid).toBeCloseTo(2 * angularVelocity, 12);
    });

    it("at r = σ equals Ω G exp(-1/2)", () => {
      const field = createField();
      const y = yMid - 400;
      const omegaY = field.worldVerticalVorticity(
        { x: centerX + sigma, y, z: centerZ },
        0,
      );
      const G = Math.sin((Math.PI * (y - baseHeight)) / heightSpan);

      expect(omegaY).toBeCloseTo(
        angularVelocity * G * Math.exp(-0.5),
        12,
      );
    });

    it("is exactly 0 when r² = 2 σ²", () => {
      const field = createField();
      const omegaY = field.worldVerticalVorticity(
        { x: centerX + sigma, y: yMid, z: centerZ + sigma },
        0,
      );

      expect(omegaY).toBe(0);
    });

    it("has opposite sign outside r = σ √2 relative to the core", () => {
      const field = createField();
      const core = field.worldVerticalVorticity(
        { x: centerX, y: yMid, z: centerZ },
        0,
      );
      const outer = field.worldVerticalVorticity(
        { x: centerX + 2 * sigma, y: yMid, z: centerZ },
        0,
      );

      expect(core).toBeGreaterThan(0);
      expect(outer).toBeLessThan(0);
    });

    it("tends to 0 in the far field", () => {
      const field = createField();
      const omegaY = field.worldVerticalVorticity(
        { x: centerX + 8 * sigma, y: yMid, z: centerZ },
        0,
      );

      expect(Math.abs(omegaY)).toBeLessThan(1e-12);
      expect(omegaY).toBeCloseTo(
        expectedWorldVerticalVorticity(8 * sigma, 0, yMid),
        12,
      );
    });

    it("matches the independent analytic formula at arbitrary interior points", () => {
      const field = createField();
      const points = [
        { dx: 500, dz: 400, y: yMid - 900 },
        { dx: -1200, dz: 80, y: yMid },
        { dx: 0, dz: -1500, y: yMid + 600 },
        { dx: 300, dz: -250, y: baseHeight + 50 },
        { dx: sigma, dz: -sigma / 2, y: yMid - 200 },
      ];

      for (const { dx, dz, y } of points) {
        const omegaY = field.worldVerticalVorticity(
          { x: centerX + dx, y, z: centerZ + dz },
          0,
        );
        expect(omegaY).toBeCloseTo(
          expectedWorldVerticalVorticity(dx, dz, y),
          12,
        );
      }
    });

    it("is exactly 0 below the layer, at both lids, and above the layer", () => {
      const field = createField();
      const points = [
        { x: centerX + 800, y: baseHeight - 1, z: centerZ - 300 },
        { x: centerX + 400, y: -200, z: centerZ - 100 },
        { x: centerX + 600, y: baseHeight, z: centerZ - 200 },
        { x: centerX - 900, y: topHeight, z: centerZ + 50 },
        { x: centerX - 900, y: topHeight + 1, z: centerZ + 50 },
        { x: centerX + 1200, y: 12000, z: centerZ },
      ];

      for (const p of points) {
        expect(field.worldVerticalVorticity(p, 0)).toBe(0);
      }
    });

    it("reverses sign with equal magnitude when Ω is negated", () => {
      const positive = createField(angularVelocity);
      const negative = createField(-angularVelocity);
      const position = { x: centerX + 800, y: yMid - 100, z: centerZ - 300 };

      const wp = positive.worldVerticalVorticity(position, 0);
      const wn = negative.worldVerticalVorticity(position, 0);
      const vp = positive.sample(position, 0);
      const vn = negative.sample(position, 0);

      expect(wn).toBeCloseTo(-wp, 12);
      expect(Math.abs(wn)).toBeCloseTo(Math.abs(wp), 12);
      expect(vn.x).toBeCloseTo(-vp.x, 12);
      expect(vn.z).toBeCloseTo(-vp.z, 12);
    });

    it("for Ω < 0, the core is negative and the outer annulus is positive", () => {
      const field = createField(-angularVelocity);
      const core = field.worldVerticalVorticity(
        { x: centerX, y: yMid, z: centerZ },
        0,
      );
      const outer = field.worldVerticalVorticity(
        { x: centerX + 2 * sigma, y: yMid, z: centerZ },
        0,
      );

      expect(core).toBeLessThan(0);
      expect(outer).toBeGreaterThan(0);
    });

    it("is 0 everywhere when Ω = 0", () => {
      const field = createField(0);
      const points = [
        { x: centerX, y: yMid, z: centerZ },
        { x: centerX + sigma, y: yMid, z: centerZ },
        { x: centerX + 2 * sigma, y: yMid, z: centerZ },
      ];

      for (const p of points) {
        expect(field.worldVerticalVorticity(p, 0)).toBe(0);
      }
    });

    it("uses the field center, not the world origin", () => {
      const field = createField();
      const onAxis = field.worldVerticalVorticity(
        { x: centerX, y: yMid, z: centerZ },
        0,
      );
      const atOrigin = field.worldVerticalVorticity(
        { x: 0, y: yMid, z: 0 },
        0,
      );
      const other = new VerticalEnvelopeRotationField({
        centerX: -2500,
        centerZ: 1800,
        angularVelocity,
        sigma,
        baseHeight,
        topHeight,
      });

      expect(onAxis).toBeCloseTo(2 * angularVelocity, 12);
      expect(atOrigin).toBeCloseTo(
        expectedWorldVerticalVorticity(-centerX, -centerZ, yMid),
        12,
      );
      expect(atOrigin).not.toBeCloseTo(onAxis, 5);
      expect(
        other.worldVerticalVorticity({ x: -2500, y: yMid, z: 1800 }, 0),
      ).toBeCloseTo(2 * angularVelocity, 12);
    });

    it("is independent of laboratory time for the current field", () => {
      const field = createField();
      const position = { x: centerX + 100, y: yMid - 50, z: centerZ - 20 };
      const w0 = field.worldVerticalVorticity(position, 0);
      const w1 = field.worldVerticalVorticity(position, 99);

      expect(w0).toBe(w1);
      expect(position).toEqual({
        x: centerX + 100,
        y: yMid - 50,
        z: centerZ - 20,
      });
    });

    it("rejects non-finite position or time", () => {
      const field = createField();
      const ok = { x: centerX, y: yMid, z: centerZ };

      expect(() =>
        field.worldVerticalVorticity({ ...ok, x: Number.NaN }, 0),
      ).toThrow(VerticalEnvelopeRotationFieldError);
      expect(() =>
        field.worldVerticalVorticity(
          { ...ok, y: Number.POSITIVE_INFINITY },
          0,
        ),
      ).toThrow(VerticalEnvelopeRotationFieldError);
      expect(() =>
        field.worldVerticalVorticity(
          { ...ok, z: Number.NEGATIVE_INFINITY },
          0,
        ),
      ).toThrow(VerticalEnvelopeRotationFieldError);
      expect(() => field.worldVerticalVorticity(ok, Number.NaN)).toThrow(
        VerticalEnvelopeRotationFieldError,
      );
      expect(() =>
        field.worldVerticalVorticity(ok, Number.POSITIVE_INFINITY),
      ).toThrow(VerticalEnvelopeRotationFieldError);
    });

    it("does not change sample() on the axis, interior, r = σ, lids, or outside", () => {
      const field = createField();
      const points = [
        { x: centerX, y: yMid, z: centerZ },
        { x: centerX + 500, y: yMid - 900, z: centerZ + 400 },
        { x: centerX + sigma, y: yMid, z: centerZ },
        { x: centerX + 600, y: baseHeight, z: centerZ - 200 },
        { x: centerX + 400, y: topHeight, z: centerZ },
        { x: centerX + 400, y: baseHeight - 1, z: centerZ },
        { x: centerX - 900, y: topHeight + 40, z: centerZ + 50 },
      ];

      for (const p of points) {
        const v = field.sample(p, 0);
        const dx = p.x - centerX;
        const dz = p.z - centerZ;
        const expected = expectedVelocity(dx, dz, p.y);
        expect(v.x).toBeCloseTo(expected.x, 12);
        expect(v.y).toBe(0);
        expect(v.z).toBeCloseTo(expected.z, 12);
        field.worldVerticalVorticity(p, 0);
        expect(field.sample(p, 7)).toEqual(v);
      }
    });
  });
});
