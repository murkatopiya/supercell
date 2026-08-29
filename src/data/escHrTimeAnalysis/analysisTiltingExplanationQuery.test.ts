import { describe, expect, it } from "vitest";
import type { Vec3 } from "../../core/math/Vec3.js";
import { VerticalEnvelopeUpdraftField } from "../../physics/storm/VerticalEnvelopeUpdraftField.js";
import {
  queryAnalysisNativeSegmentVorticityAt,
} from "./analysisQuery.js";
import analysisTiltingQuerySrc from "./analysisTiltingQuery.ts?raw";
import {
  ANALYSIS_TILTING_ENVIRONMENTAL_OPERAND,
  ANALYSIS_TILTING_PHYSICAL_IDENTITY,
  ANALYSIS_TILTING_STORM_LOCAL_OPERAND,
  queryAnalysisTiltingExplanationAt,
  queryAnalysisTiltingTendencyAt,
  type AnalysisTiltingExplanationResult,
  type AnalysisTiltingTendencyResult,
} from "./analysisTiltingQuery.js";
import { EscAnalysisError } from "./EscAnalysisError.js";
import { ESC_HR_TIME_SAMPLING_CLASS } from "./constants.js";
import { createEscHrTimeAnalysis } from "./createEscHrTimeAnalysis.js";
import type {
  EscHrTimeAnalysisColumn,
  EscHrTimeAnalysisInputSample,
} from "./types.js";
import composeDemoSrc from "../../app/composeDemoTracerSimulation.ts?raw";
import createExploreLabSrc from "../../app/createExploreLab.ts?raw";
import createGuidedLabSrc from "../../app/createGuidedLab.ts?raw";
import appSrc from "../../app/App.tsx?raw";
import pointDiagnosticSrc from "../../interaction/PointDiagnosticObservation.ts?raw";

function rampSamples(
  firstTime: number,
  lastTime: number,
): EscHrTimeAnalysisInputSample[] {
  const samples: EscHrTimeAnalysisInputSample[] = [];
  for (let time = firstTime; time <= lastTime; time += 1) {
    samples.push({
      time,
      height: 10 + time * 5,
      eastward: time * 0.1,
      northward: 2 + time * 0.02,
    });
  }
  return samples;
}

function constantWindSamples(
  firstTime: number,
  lastTime: number,
): EscHrTimeAnalysisInputSample[] {
  const samples: EscHrTimeAnalysisInputSample[] = [];
  for (let time = firstTime; time <= lastTime; time += 1) {
    samples.push({
      time,
      height: 10 + time * 5,
      eastward: 8,
      northward: 12,
    });
  }
  return samples;
}

function syntheticColumn(): EscHrTimeAnalysisColumn {
  return createEscHrTimeAnalysis({
    samplingClass: ESC_HR_TIME_SAMPLING_CLASS,
    sourceIdentity: "synthetic-ramp",
    samples: rampSamples(0, 120),
  });
}

function zeroOmegaColumn(): EscHrTimeAnalysisColumn {
  return createEscHrTimeAnalysis({
    samplingClass: ESC_HR_TIME_SAMPLING_CLASS,
    sourceIdentity: "synthetic-constant-wind",
    samples: constantWindSamples(0, 120),
  });
}

function heightAtTime(time: number): number {
  return 10 + time * 5;
}

function prescribedUpdraft(): VerticalEnvelopeUpdraftField {
  return new VerticalEnvelopeUpdraftField({
    centerX: 0,
    centerZ: 0,
    peakVerticalVelocity: 20,
    sigma: 2000,
    baseHeight: 0,
    topHeight: 4000,
  });
}

function fullHeight(): number {
  return (heightAtTime(50) + heightAtTime(51)) / 2;
}

function boundaryHeight(): number {
  return (heightAtTime(0) + heightAtTime(1)) / 2;
}

function signedZero(value: number): number {
  return value === 0 ? 0 : value;
}

function expectedDot(
  omegaX: number,
  omegaZ: number,
  dVyDx: number,
  dVyDz: number,
): number {
  return signedZero(omegaX * dVyDx + omegaZ * dVyDz);
}

function isSupported(
  result: AnalysisTiltingExplanationResult,
): result is Extract<
  AnalysisTiltingExplanationResult,
  { status: "FULL_SUPPORT" | "BOUNDARY_CONDITIONED" }
> {
  return (
    result.status === "FULL_SUPPORT" ||
    result.status === "BOUNDARY_CONDITIONED"
  );
}

function assertSiblingEquivalence(
  column: EscHrTimeAnalysisColumn | null | undefined,
  updraft: VerticalEnvelopeUpdraftField,
  position: Vec3,
  time: number,
): {
  explanation: AnalysisTiltingExplanationResult;
  scalar: AnalysisTiltingTendencyResult;
} {
  const explanation = queryAnalysisTiltingExplanationAt(
    column,
    updraft,
    position,
    time,
  );
  const scalar = queryAnalysisTiltingTendencyAt(
    column,
    updraft,
    position,
    time,
  );
  expect(scalar.status).toBe(explanation.status);
  if (isSupported(explanation)) {
    if (
      scalar.status !== "FULL_SUPPORT" &&
      scalar.status !== "BOUNDARY_CONDITIONED"
    ) {
      throw new Error("scalar lost numeric support");
    }
    expect(scalar.tiltingTendency).toBe(explanation.tiltingTendency);
    expect(scalar.segment).toEqual(explanation.segment);
    expect(scalar.provenance).toBe(explanation.provenance);
    expect(scalar.representation).toBe(explanation.representation);
    expect(scalar.method).toBe(explanation.method);
    expect(scalar.physicalIdentity).toBe(explanation.physicalIdentity);
  } else {
    expect("tiltingTendency" in scalar).toBe(false);
    expect("tiltingTendency" in explanation).toBe(false);
    if (explanation.status === "OUT_OF_DOMAIN") {
      if (scalar.status !== "OUT_OF_DOMAIN") {
        throw new Error("expected OOD scalar");
      }
      expect(scalar.provenance).toBe(explanation.provenance);
      expect(scalar.representation).toBe(explanation.representation);
    }
  }
  return { explanation, scalar };
}

function offsetAlong(
  omegaX: number,
  omegaZ: number,
  scale: number,
): { x: number; z: number } {
  const mag = Math.hypot(omegaX, omegaZ);
  expect(mag).not.toBe(0);
  return {
    x: (scale * omegaX) / mag,
    z: (scale * omegaZ) / mag,
  };
}

function offsetOrthogonal(
  omegaX: number,
  omegaZ: number,
  scale: number,
): { x: number; z: number } {
  const mag = Math.hypot(omegaX, omegaZ);
  expect(mag).not.toBe(0);
  return {
    x: (scale * -omegaZ) / mag,
    z: (scale * omegaX) / mag,
  };
}

describe("queryAnalysisTiltingExplanationAt", () => {
  it("FULL_SUPPORT ordinary point preserves vectors, T1=dot, defined alignment", () => {
    const column = syntheticColumn();
    const updraft = prescribedUpdraft();
    const position: Vec3 = { x: 500, y: fullHeight(), z: 300 };
    const result = queryAnalysisTiltingExplanationAt(
      column,
      updraft,
      position,
      0,
    );

    expect(result.status).toBe("FULL_SUPPORT");
    if (result.status !== "FULL_SUPPORT") {
      throw new Error("expected FULL_SUPPORT explanation");
    }
    expect(result.representation).toBe("Analysis");
    expect(result.method).toBe("native-containing-segment");
    expect(result.physicalIdentity).toBe(ANALYSIS_TILTING_PHYSICAL_IDENTITY);
    expect(result.environmentalOperand).toBe(
      ANALYSIS_TILTING_ENVIRONMENTAL_OPERAND,
    );
    expect(result.stormLocalOperand).toBe(
      ANALYSIS_TILTING_STORM_LOCAL_OPERAND,
    );
    expect(result.provenance).toBe(column.provenance);
    expect(result.segment.hLo).toBe(heightAtTime(50));
    expect(result.segment.hHi).toBe(heightAtTime(51));

    expect(result.worldHorizontalVorticity).toEqual(
      expect.objectContaining({
        omegaX: expect.any(Number),
        omegaZ: expect.any(Number),
      }),
    );
    expect(result.worldHorizontalVorticity).not.toHaveProperty(
      "omegaEastward",
    );
    expect(result.worldHorizontalVorticity).not.toHaveProperty(
      "omegaNorthward",
    );
    expect(result.updraftHorizontalGradient).toEqual(
      updraft.horizontalGradientOfVerticalVelocity(position, 0),
    );
    expect(result.omegaHMagnitude).toBe(
      Math.hypot(
        result.worldHorizontalVorticity.omegaX,
        result.worldHorizontalVorticity.omegaZ,
      ),
    );
    expect(result.gradientMagnitude).toBe(
      Math.hypot(
        result.updraftHorizontalGradient.dVyDx,
        result.updraftHorizontalGradient.dVyDz,
      ),
    );
    expect(result.omegaHMagnitude).not.toBe(0);
    expect(result.gradientMagnitude).not.toBe(0);
    expect(result.tiltingTendency).toBe(
      expectedDot(
        result.worldHorizontalVorticity.omegaX,
        result.worldHorizontalVorticity.omegaZ,
        result.updraftHorizontalGradient.dVyDx,
        result.updraftHorizontalGradient.dVyDz,
      ),
    );
    expect(result.tiltingTendency).not.toBe(0);

    expect(result.alignment.state).toBe("ALIGNMENT_DEFINED");
    if (result.alignment.state !== "ALIGNMENT_DEFINED") {
      throw new Error("expected ALIGNMENT_DEFINED");
    }
    expect(result.alignment.cosTheta).toBeGreaterThanOrEqual(-1);
    expect(result.alignment.cosTheta).toBeLessThanOrEqual(1);
    expect(Number.isFinite(result.alignment.theta)).toBe(true);
    expect(result.alignment.theta).toBeGreaterThanOrEqual(0);
    expect(result.alignment.theta).toBeLessThanOrEqual(Math.PI);
    expect(result.alignment.theta).toBe(Math.acos(result.alignment.cosTheta));
  });

  it("BOUNDARY_CONDITIONED keeps a numeric explanation and native-segment provenance", () => {
    const column = syntheticColumn();
    const updraft = prescribedUpdraft();
    const position: Vec3 = { x: 500, y: boundaryHeight(), z: 300 };
    const vorticity = queryAnalysisNativeSegmentVorticityAt(
      column,
      position.y,
    );
    const result = queryAnalysisTiltingExplanationAt(
      column,
      updraft,
      position,
      0,
    );

    expect(vorticity.status).toBe("BOUNDARY_CONDITIONED");
    expect(result.status).toBe("BOUNDARY_CONDITIONED");
    expect(result.status).not.toBe("FULL_SUPPORT");
    if (result.status !== "BOUNDARY_CONDITIONED") {
      throw new Error("expected BOUNDARY explanation");
    }
    if (vorticity.status !== "BOUNDARY_CONDITIONED") {
      throw new Error("expected BOUNDARY ω_h");
    }
    expect("tiltingTendency" in result).toBe(true);
    expect("worldHorizontalVorticity" in result).toBe(true);
    expect(result.segment).toEqual(vorticity.segment);
    expect(result.provenance).toBe(column.provenance);
    expect(result.tiltingTendency).toBe(
      expectedDot(
        result.worldHorizontalVorticity.omegaX,
        result.worldHorizontalVorticity.omegaZ,
        result.updraftHorizontalGradient.dVyDx,
        result.updraftHorizontalGradient.dVyDz,
      ),
    );
    assertSiblingEquivalence(column, updraft, position, 0);
  });

  it("OUT_OF_DOMAIN has no numeric T1, vectors, magnitudes, or alignment payload", () => {
    const column = syntheticColumn();
    const updraft = prescribedUpdraft();
    const below: Vec3 = {
      x: 500,
      y: column.profile.minHeight - 1,
      z: 300,
    };
    const gradient = updraft.horizontalGradientOfVerticalVelocity(below, 0);
    expect(gradient.dVyDx).not.toBe(0);

    const result = queryAnalysisTiltingExplanationAt(
      column,
      updraft,
      below,
      0,
    );
    expect(result.status).toBe("OUT_OF_DOMAIN");
    if (result.status !== "OUT_OF_DOMAIN") {
      throw new Error("expected OUT_OF_DOMAIN");
    }
    expect(result.representation).toBe("Analysis");
    expect(result.provenance).toBe(column.provenance);
    expect("tiltingTendency" in result).toBe(false);
    expect("worldHorizontalVorticity" in result).toBe(false);
    expect("updraftHorizontalGradient" in result).toBe(false);
    expect("omegaHMagnitude" in result).toBe(false);
    expect("gradientMagnitude" in result).toBe(false);
    expect("alignment" in result).toBe(false);
    expect(result).toEqual({
      status: "OUT_OF_DOMAIN",
      representation: "Analysis",
      provenance: column.provenance,
    });
  });

  it("COLUMN_UNAVAILABLE is status-only with no numeric explanation", () => {
    const updraft = prescribedUpdraft();
    const missing = queryAnalysisTiltingExplanationAt(
      null,
      updraft,
      { x: 500, y: 260, z: 300 },
      0,
    );
    expect(missing).toEqual({ status: "COLUMN_UNAVAILABLE" });
    expect("tiltingTendency" in missing).toBe(false);
    expect("worldHorizontalVorticity" in missing).toBe(false);
    expect("alignment" in missing).toBe(false);
    expect("provenance" in missing).toBe(false);

    const undef = queryAnalysisTiltingExplanationAt(
      undefined,
      updraft,
      { x: 500, y: 260, z: 300 },
      0,
    );
    expect(undef.status).toBe("COLUMN_UNAVAILABLE");
    expect("tiltingTendency" in undef).toBe(false);
  });

  it("GRADIENT_DEGENERATE on the prescribed-updraft axis: T1=0, θ absent", () => {
    const column = syntheticColumn();
    const updraft = prescribedUpdraft();
    const axis: Vec3 = { x: 0, y: fullHeight(), z: 0 };
    const gradient = updraft.horizontalGradientOfVerticalVelocity(axis, 0);
    expect(gradient.dVyDx).toBe(0);
    expect(gradient.dVyDz).toBe(0);

    const result = queryAnalysisTiltingExplanationAt(
      column,
      updraft,
      axis,
      0,
    );
    expect(result.status).toBe("FULL_SUPPORT");
    if (result.status !== "FULL_SUPPORT") {
      throw new Error("expected FULL physical zero");
    }
    expect(result.tiltingTendency).toBe(0);
    expect(Object.is(result.tiltingTendency, 0)).toBe(true);
    expect(result.gradientMagnitude).toBe(0);
    expect(result.omegaHMagnitude).not.toBe(0);
    expect(result.alignment).toEqual({ state: "GRADIENT_DEGENERATE" });
    expect(result.alignment).not.toHaveProperty("theta");
    expect(result.alignment).not.toHaveProperty("cosTheta");
  });

  it("OMEGA_DEGENERATE with exact-zero environmental ω_h: T1=0, θ absent", () => {
    const column = zeroOmegaColumn();
    const updraft = prescribedUpdraft();
    const position: Vec3 = { x: 500, y: fullHeight(), z: 300 };
    const vorticity = queryAnalysisNativeSegmentVorticityAt(
      column,
      position.y,
    );
    expect(vorticity.status).toBe("FULL_SUPPORT");
    if (vorticity.status !== "FULL_SUPPORT") {
      throw new Error("expected FULL zero-ω column");
    }
    expect(vorticity.vorticity.omegaEastward).toBe(0);
    expect(vorticity.vorticity.omegaNorthward).toBe(0);

    const result = queryAnalysisTiltingExplanationAt(
      column,
      updraft,
      position,
      0,
    );
    expect(result.status).toBe("FULL_SUPPORT");
    if (result.status !== "FULL_SUPPORT") {
      throw new Error("expected FULL OMEGA_DEGENERATE");
    }
    expect(result.tiltingTendency).toBe(0);
    expect(result.omegaHMagnitude).toBe(0);
    expect(result.gradientMagnitude).not.toBe(0);
    expect(result.alignment).toEqual({ state: "OMEGA_DEGENERATE" });
    expect(result.alignment).not.toHaveProperty("theta");
    expect(result.alignment).not.toHaveProperty("cosTheta");
  });

  it("BOTH_DEGENERATE when environmental ω_h and ∇_h Vy are exact zero", () => {
    const column = zeroOmegaColumn();
    const updraft = prescribedUpdraft();
    const axis: Vec3 = { x: 0, y: fullHeight(), z: 0 };
    const result = queryAnalysisTiltingExplanationAt(
      column,
      updraft,
      axis,
      0,
    );
    expect(result.status).toBe("FULL_SUPPORT");
    if (result.status !== "FULL_SUPPORT") {
      throw new Error("expected FULL BOTH_DEGENERATE");
    }
    expect(result.tiltingTendency).toBe(0);
    expect(result.omegaHMagnitude).toBe(0);
    expect(result.gradientMagnitude).toBe(0);
    expect(result.alignment).toEqual({ state: "BOTH_DEGENERATE" });
    expect(result.alignment).not.toHaveProperty("theta");
    expect(result.alignment).not.toHaveProperty("cosTheta");
  });

  it("aligned vectors yield cosθ ≈ +1 and θ ≈ 0", () => {
    const column = syntheticColumn();
    const updraft = prescribedUpdraft();
    const probe = queryAnalysisTiltingExplanationAt(
      column,
      updraft,
      { x: 0, y: fullHeight(), z: 0 },
      0,
    );
    if (probe.status !== "FULL_SUPPORT") {
      throw new Error("expected FULL probe");
    }
    const { omegaX, omegaZ } = probe.worldHorizontalVorticity;
    const aligned = offsetAlong(omegaX, omegaZ, -800);
    const result = queryAnalysisTiltingExplanationAt(
      column,
      updraft,
      { x: aligned.x, y: fullHeight(), z: aligned.z },
      0,
    );
    expect(result.status).toBe("FULL_SUPPORT");
    if (result.status !== "FULL_SUPPORT") {
      throw new Error("expected FULL aligned");
    }
    expect(result.alignment.state).toBe("ALIGNMENT_DEFINED");
    if (result.alignment.state !== "ALIGNMENT_DEFINED") {
      throw new Error("expected ALIGNMENT_DEFINED");
    }
    expect(result.alignment.cosTheta).toBeGreaterThan(0.999999);
    expect(result.alignment.cosTheta).toBeLessThanOrEqual(1);
    expect(result.alignment.theta).toBeCloseTo(0, 10);
    expect(result.tiltingTendency).toBeGreaterThan(0);
  });

  it("opposed vectors yield cosθ ≈ −1 and θ ≈ π", () => {
    const column = syntheticColumn();
    const updraft = prescribedUpdraft();
    const probe = queryAnalysisTiltingExplanationAt(
      column,
      updraft,
      { x: 0, y: fullHeight(), z: 0 },
      0,
    );
    if (probe.status !== "FULL_SUPPORT") {
      throw new Error("expected FULL probe");
    }
    const { omegaX, omegaZ } = probe.worldHorizontalVorticity;
    const opposed = offsetAlong(omegaX, omegaZ, 800);
    const result = queryAnalysisTiltingExplanationAt(
      column,
      updraft,
      { x: opposed.x, y: fullHeight(), z: opposed.z },
      0,
    );
    expect(result.status).toBe("FULL_SUPPORT");
    if (result.status !== "FULL_SUPPORT") {
      throw new Error("expected FULL opposed");
    }
    expect(result.alignment.state).toBe("ALIGNMENT_DEFINED");
    if (result.alignment.state !== "ALIGNMENT_DEFINED") {
      throw new Error("expected ALIGNMENT_DEFINED");
    }
    expect(result.alignment.cosTheta).toBeLessThan(-0.999999);
    expect(result.alignment.cosTheta).toBeGreaterThanOrEqual(-1);
    expect(result.alignment.theta).toBeCloseTo(Math.PI, 10);
    expect(result.tiltingTendency).toBeLessThan(0);
  });

  it("orthogonal nonzero vectors are ALIGNMENT_DEFINED with cosθ ≈ 0, distinct from degenerate T1=0", () => {
    const column = syntheticColumn();
    const updraft = prescribedUpdraft();
    const probe = queryAnalysisTiltingExplanationAt(
      column,
      updraft,
      { x: 0, y: fullHeight(), z: 0 },
      0,
    );
    if (probe.status !== "FULL_SUPPORT") {
      throw new Error("expected FULL probe");
    }
    const { omegaX, omegaZ } = probe.worldHorizontalVorticity;
    const orthogonal = offsetOrthogonal(omegaX, omegaZ, 800);
    const result = queryAnalysisTiltingExplanationAt(
      column,
      updraft,
      { x: orthogonal.x, y: fullHeight(), z: orthogonal.z },
      0,
    );
    expect(result.status).toBe("FULL_SUPPORT");
    if (result.status !== "FULL_SUPPORT") {
      throw new Error("expected FULL orthogonal");
    }
    expect(result.omegaHMagnitude).not.toBe(0);
    expect(result.gradientMagnitude).not.toBe(0);
    expect(result.alignment.state).toBe("ALIGNMENT_DEFINED");
    if (result.alignment.state !== "ALIGNMENT_DEFINED") {
      throw new Error("expected ALIGNMENT_DEFINED orthogonality");
    }
    expect(result.alignment.cosTheta).toBeCloseTo(0, 12);
    expect(result.alignment.theta).toBeCloseTo(Math.PI / 2, 12);
    expect(result.tiltingTendency).toBeCloseTo(0, 12);

    const degenerate = queryAnalysisTiltingExplanationAt(
      column,
      updraft,
      { x: 0, y: fullHeight(), z: 0 },
      0,
    );
    if (degenerate.status !== "FULL_SUPPORT") {
      throw new Error("expected FULL axis");
    }
    expect(degenerate.alignment.state).toBe("GRADIENT_DEGENERATE");
    expect(degenerate.tiltingTendency).toBe(0);
    expect(degenerate.alignment).not.toHaveProperty("theta");
  });

  it("rejects non-finite P or t as a broken invariant, not a support state", () => {
    const column = syntheticColumn();
    const updraft = prescribedUpdraft();
    const ok: Vec3 = { x: 500, y: 260, z: 300 };
    expect(() =>
      queryAnalysisTiltingExplanationAt(
        column,
        updraft,
        { ...ok, x: Number.NaN },
        0,
      ),
    ).toThrow(EscAnalysisError);
    expect(() =>
      queryAnalysisTiltingExplanationAt(
        column,
        updraft,
        { ...ok, y: Number.POSITIVE_INFINITY },
        0,
      ),
    ).toThrow(/position.y must be finite/);
    expect(() =>
      queryAnalysisTiltingExplanationAt(column, updraft, ok, Number.NaN),
    ).toThrow(/time must be finite/);
  });

  it("does not call DiagnosticTiltingTendency.sample or construct live T1", () => {
    expect(analysisTiltingQuerySrc).not.toMatch(
      /DiagnosticTiltingTendency\.sample\s*\(/,
    );
    expect(analysisTiltingQuerySrc).not.toMatch(
      /new DiagnosticTiltingTendency/,
    );
    expect(analysisTiltingQuerySrc).not.toMatch(/parcel/);
    expect(analysisTiltingQuerySrc).not.toMatch(/tracer ω/);
    expect(analysisTiltingQuerySrc).not.toMatch(/tracer horizontal vorticity/);
  });

  it("is not wired into live Explore, Guided, App, or point diagnostics", () => {
    expect(composeDemoSrc).not.toMatch(/queryAnalysisTiltingExplanationAt/);
    expect(createExploreLabSrc).not.toMatch(
      /queryAnalysisTiltingExplanationAt/,
    );
    expect(createGuidedLabSrc).not.toMatch(
      /queryAnalysisTiltingExplanationAt/,
    );
    expect(appSrc).not.toMatch(/queryAnalysisTiltingExplanationAt/);
    expect(pointDiagnosticSrc).not.toMatch(
      /queryAnalysisTiltingExplanationAt/,
    );
  });
});

describe("scalar sibling equivalence", () => {
  it("agrees on FULL, BOUNDARY, OOD, and COLUMN_UNAVAILABLE", () => {
    const column = syntheticColumn();
    const updraft = prescribedUpdraft();

    assertSiblingEquivalence(
      column,
      updraft,
      { x: 500, y: fullHeight(), z: 300 },
      0,
    );
    assertSiblingEquivalence(
      column,
      updraft,
      { x: 500, y: boundaryHeight(), z: 300 },
      0,
    );
    assertSiblingEquivalence(
      column,
      updraft,
      { x: 500, y: column.profile.minHeight - 1, z: 300 },
      0,
    );
    assertSiblingEquivalence(
      null,
      updraft,
      { x: 500, y: 260, z: 300 },
      0,
    );
    assertSiblingEquivalence(
      undefined,
      updraft,
      { x: 500, y: 260, z: 300 },
      0,
    );
  });
});
