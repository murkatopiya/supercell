import { describe, expect, it } from "vitest";
import type { VelocityField } from "../../core/fields/VelocityField.js";
import { CompositeVelocityField } from "../../core/fields/CompositeVelocityField.js";
import type { Vec3 } from "../../core/math/Vec3.js";
import { VerticalEnvelopeRotationField } from "../storm/VerticalEnvelopeRotationField.js";
import diagnosticVerticalVorticitySrc from "./DiagnosticVerticalVorticity.ts?raw";
import {
  DiagnosticVerticalVorticity,
  DiagnosticVerticalVorticityError,
} from "./DiagnosticVerticalVorticity.js";

function createRotation(
  overrides: {
    centerX?: number;
    centerZ?: number;
    angularVelocity?: number;
    sigma?: number;
    baseHeight?: number;
    topHeight?: number;
  } = {},
) {
  return new VerticalEnvelopeRotationField({
    centerX: overrides.centerX ?? 1000,
    centerZ: overrides.centerZ ?? -500,
    angularVelocity: overrides.angularVelocity ?? 0.05,
    sigma: overrides.sigma ?? 2000,
    baseHeight: overrides.baseHeight ?? 500,
    topHeight: overrides.topHeight ?? 4500,
  });
}

describe("DiagnosticVerticalVorticity", () => {
  const centerX = 1000;
  const centerZ = -500;
  const angularVelocity = 0.05;
  const sigma = 2000;
  const baseHeight = 500;
  const topHeight = 4500;
  const yMid = (baseHeight + topHeight) / 2;
  const rotation = createRotation();
  const diagnostic = new DiagnosticVerticalVorticity({ rotation });
  const interiorOffAxis = {
    x: centerX + 800,
    y: yMid - 100,
    z: centerZ - 300,
  };

  it("exposes the injected rotation instance and delegates sample to it", () => {
    expect(diagnostic.rotation).toBe(rotation);
    const value = diagnostic.sample(interiorOffAxis, 0);
    expect(value).toBe(rotation.worldVerticalVorticity(interiorOffAxis, 0));
    expect(typeof value).toBe("number");
  });

  it("returns a signed scalar: positive core for Ω > 0, negative outer ring", () => {
    const core = diagnostic.sample(
      { x: centerX, y: yMid, z: centerZ },
      0,
    );
    const outer = diagnostic.sample(
      { x: centerX + 2 * sigma, y: yMid, z: centerZ },
      0,
    );
    expect(core).toBeGreaterThan(0);
    expect(outer).toBeLessThan(0);
    expect(outer).not.toBe(Math.abs(outer));
  });

  it("reverses sign with equal magnitude when Ω is negated", () => {
    const negative = new DiagnosticVerticalVorticity({
      rotation: createRotation({ angularVelocity: -angularVelocity }),
    });
    const wp = diagnostic.sample(interiorOffAxis, 0);
    const wn = negative.sample(interiorOffAxis, 0);
    expect(wn).toBeCloseTo(-wp, 12);
    expect(Math.abs(wn)).toBeCloseTo(Math.abs(wp), 12);
  });

  it("uses the field center, not the world origin", () => {
    const onAxis = diagnostic.sample(
      { x: centerX, y: yMid, z: centerZ },
      0,
    );
    const atOrigin = diagnostic.sample({ x: 0, y: yMid, z: 0 }, 0);
    expect(onAxis).toBeCloseTo(2 * angularVelocity, 12);
    expect(atOrigin).not.toBeCloseTo(onAxis, 5);
    expect(onAxis).toBe(
      rotation.worldVerticalVorticity(
        { x: centerX, y: yMid, z: centerZ },
        0,
      ),
    );
  });

  it("is exactly 0 at lids and outside the layer", () => {
    const points: Vec3[] = [
      { x: centerX + 800, y: baseHeight - 1, z: centerZ - 300 },
      { x: centerX + 600, y: baseHeight, z: centerZ - 200 },
      { x: centerX - 900, y: topHeight, z: centerZ + 50 },
      { x: centerX - 900, y: topHeight + 1, z: centerZ + 50 },
    ];
    for (const p of points) {
      expect(diagnostic.sample(p, 0)).toBe(0);
    }
  });

  it("forwards laboratory time and is steady for the current field", () => {
    class RecordingRotation extends VerticalEnvelopeRotationField {
      lastTime: number | undefined;

      override worldVerticalVorticity(position: Vec3, time: number): number {
        this.lastTime = time;
        return super.worldVerticalVorticity(position, time);
      }
    }

    const recording = new RecordingRotation({
      centerX,
      centerZ,
      angularVelocity,
      sigma,
      baseHeight,
      topHeight,
    });
    const owner = new DiagnosticVerticalVorticity({ rotation: recording });
    const atT1 = owner.sample(interiorOffAxis, 12);
    expect(recording.lastTime).toBe(12);
    const atT2 = owner.sample(interiorOffAxis, 99);
    expect(recording.lastTime).toBe(99);
    expect(atT1).toBe(atT2);
  });

  it("throws DiagnosticVerticalVorticityError for non-finite P or t", () => {
    const ok = { x: centerX, y: yMid, z: centerZ };
    expect(() =>
      diagnostic.sample({ x: Number.NaN, y: yMid, z: centerZ }, 0),
    ).toThrow(DiagnosticVerticalVorticityError);
    expect(() =>
      diagnostic.sample(
        { x: centerX, y: Number.POSITIVE_INFINITY, z: centerZ },
        0,
      ),
    ).toThrow(DiagnosticVerticalVorticityError);
    expect(() =>
      diagnostic.sample(
        { x: centerX, y: yMid, z: Number.NEGATIVE_INFINITY },
        0,
      ),
    ).toThrow(DiagnosticVerticalVorticityError);
    expect(() => diagnostic.sample(ok, Number.NaN)).toThrow(
      DiagnosticVerticalVorticityError,
    );
    expect(() => diagnostic.sample(ok, Number.POSITIVE_INFINITY)).toThrow(
      DiagnosticVerticalVorticityError,
    );
  });

  it("does not mutate rotation or the caller position", () => {
    const position = { x: centerX + 100, y: yMid - 50, z: centerZ - 20 };
    const before = { ...position };
    diagnostic.sample(position, 4);
    expect(position).toEqual(before);
    expect(diagnostic.rotation).toBe(rotation);
    expect(diagnostic.sample(position, 4)).toBe(diagnostic.sample(position, 4));
  });

  it("sample returns a number, not a Vec3, so it is not a VelocityField", () => {
    const value = diagnostic.sample(interiorOffAxis, 0);
    expect(typeof value).toBe("number");
    expect(value).not.toEqual(
      expect.objectContaining({ x: expect.anything() }),
    );

    const asField: VelocityField = rotation;
    expect(typeof asField.sample(interiorOffAxis, 0)).toBe("object");

    // @ts-expect-error DiagnosticVerticalVorticity.sample returns number, not Vec3
    const _rejected: VelocityField = diagnostic;
    void _rejected;

    // @ts-expect-error Candidate A cannot be a CompositeVelocityField operand
    new CompositeVelocityField([diagnostic]);
  });

  it("does not import T1, composite, Inspector, visualization, or ScenarioConfig", () => {
    expect(diagnosticVerticalVorticitySrc).toMatch(
      /VerticalEnvelopeRotationField/,
    );
    expect(diagnosticVerticalVorticitySrc).not.toMatch(
      /DiagnosticTiltingTendency/,
    );
    expect(diagnosticVerticalVorticitySrc).not.toMatch(
      /horizontalGradientOfVerticalVelocity/,
    );
    expect(diagnosticVerticalVorticitySrc).not.toMatch(
      /EnvironmentalWindProfile/,
    );
    expect(diagnosticVerticalVorticitySrc).not.toMatch(
      /CompositeVelocityField/,
    );
    expect(diagnosticVerticalVorticitySrc).not.toMatch(/IntegrationFrame/);
    expect(diagnosticVerticalVorticitySrc).not.toMatch(/StormMotion/);
    expect(diagnosticVerticalVorticitySrc).not.toMatch(/DEMO_SCENARIO/);
    expect(diagnosticVerticalVorticitySrc).not.toMatch(/createRotationField/);
    expect(diagnosticVerticalVorticitySrc).not.toMatch(/ScenarioConfig/);
    expect(diagnosticVerticalVorticitySrc).not.toMatch(/TracerInspection/);
    expect(diagnosticVerticalVorticitySrc).not.toMatch(/VisualAirflow/);
    expect(diagnosticVerticalVorticitySrc).not.toMatch(/from "three"/);
  });
});
