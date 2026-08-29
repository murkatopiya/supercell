import { describe, expect, it } from "vitest";
import {
  ANALYSIS_QUERY_REPRESENTATION,
  NATIVE_CONTAINING_SEGMENT_METHOD,
} from "../data/escHrTimeAnalysis/analysisQuery.js";
import {
  ANALYSIS_TILTING_ENVIRONMENTAL_OPERAND,
  ANALYSIS_TILTING_PHYSICAL_IDENTITY,
  ANALYSIS_TILTING_STORM_LOCAL_OPERAND,
  type AnalysisTiltingExplanationResult,
} from "../data/escHrTimeAnalysis/analysisTiltingQuery.js";
import {
  createTrajectoryTiltingGlyphModel,
  displayDisplacementFromWorldVector,
  displayLengthFromPhysicalMagnitude,
  type TrajectoryTiltingGlyphVectorDisplayScale,
} from "../data/escHrTimeAnalysis/trajectoryTiltingGlyphModel.js";
import { createTrajectoryTiltingWhatIfModel } from "../data/escHrTimeAnalysis/trajectoryTiltingWhatIf.js";
import type { EscHrTimeAnalysisProvenance } from "../data/escHrTimeAnalysis/types.js";
import { ANALYSIS_T1_GLYPH_METERS_PER_S_MINUS_1_V1 } from "./analysisT1GlyphDisplayScaleV1.js";
import {
  ANALYSIS_T1_GRADIENT_GLYPH_READABILITY_MULTIPLIER_V1,
  applyGradientGlyphReadabilityDisplacement,
} from "./analysisT1GradientGlyphReadabilityV1.js";
import readabilitySrc from "./analysisT1GradientGlyphReadabilityV1.ts?raw";
import scaleSrc from "./analysisT1GlyphDisplayScaleV1.ts?raw";
import {
  createTrajectoryTiltingGlyph,
  disposeTrajectoryTiltingGlyph,
  syncTrajectoryTiltingGlyph,
} from "./trajectoryTiltingGlyph.js";
import {
  createTrajectoryTiltingWhatIfGlyph,
  disposeTrajectoryTiltingWhatIfGlyph,
  syncTrajectoryTiltingWhatIfGlyph,
} from "./trajectoryTiltingWhatIfGlyph.js";
import * as THREE from "three";

const STUB_PROVENANCE: EscHrTimeAnalysisProvenance = {
  sourceIdentity: "gradient-readability-test",
  samplingClass: "high-resolution-mobile-esc",
  transformId: "esc-hr-time-hamming-sinc-lowpass",
  transformVersion: "v1",
  domain: "TIME",
  cutoffWavelengthS: 40,
  sampleIntervalS: 1,
  tapCount: 81,
  window: "Hamming",
  phase: "zero",
  gapPolicy: "integer-linear-uvh-max-5s",
  interpolatedCount: 0,
  uniformN: 121,
  interpolationFraction: 0,
  maxGapS: 0,
  boundaryPolicy: "half-sample-mirror",
  supportSemantics: "sample-level FULL_SUPPORT | BOUNDARY_CONDITIONED",
  outputCoordinate: "Source heights",
  researchPredecessor: "v0.1-research",
};

const TEST_FIXTURE_SCALE_V0: TrajectoryTiltingGlyphVectorDisplayScale = {
  version: "test-fixture-v0",
  worldLengthFromPhysicalMagnitude(magnitudeSMinus1: number): number {
    return magnitudeSMinus1 * 1000;
  },
};

const ACTUAL_APPEARANCE = {
  omegaColor: 0x00aacc,
  gradientColor: 0xccaa00,
  arcColor: 0x8899aa,
  arcRadiusFraction: 0.4,
};

const WHAT_IF_APPEARANCE = {
  hypotheticalGradientColor: 0xf2c14e,
  hypotheticalArcColor: 0xe6d38a,
  opacity: 0.88,
  dashSize: 12,
  gapSize: 8,
  arcRadiusFraction: 0.4,
};

function supportedExplanation(): AnalysisTiltingExplanationResult {
  return {
    status: "FULL_SUPPORT",
    representation: ANALYSIS_QUERY_REPRESENTATION,
    method: NATIVE_CONTAINING_SEGMENT_METHOD,
    physicalIdentity: ANALYSIS_TILTING_PHYSICAL_IDENTITY,
    environmentalOperand: ANALYSIS_TILTING_ENVIRONMENTAL_OPERAND,
    stormLocalOperand: ANALYSIS_TILTING_STORM_LOCAL_OPERAND,
    segment: { hLo: 10, hHi: 20 },
    tiltingTendency: 0.0008,
    worldHorizontalVorticity: { omegaX: 0.02, omegaZ: 0 },
    updraftHorizontalGradient: { dVyDx: 0, dVyDz: 0.04 },
    omegaHMagnitude: 0.02,
    gradientMagnitude: 0.04,
    alignment: {
      state: "ALIGNMENT_DEFINED",
      cosTheta: 0,
      theta: Math.PI / 2,
    },
    provenance: STUB_PROVENANCE,
  };
}

function lineOf(group: THREE.Group, name: string): THREE.Line | THREE.LineSegments {
  const object = group.getObjectByName(name);
  if (!(object instanceof THREE.Line)) {
    throw new Error(`missing ${name}`);
  }
  return object;
}

function shaftTip(line: THREE.Line | THREE.LineSegments): number[] {
  const array = line.geometry.getAttribute("position")!.array;
  return [array[3]!, array[4]!, array[5]!];
}

function shaftLength(line: THREE.Line | THREE.LineSegments): number {
  const tip = shaftTip(line);
  return Math.hypot(tip[0]!, tip[2]!);
}

describe("Analysis gradient glyph readability", () => {
  it("A multiplier applies only to gradient display displacements", () => {
    expect(ANALYSIS_T1_GRADIENT_GLYPH_READABILITY_MULTIPLIER_V1).toBe(2);
    const mapped = displayDisplacementFromWorldVector(
      { x: 0, y: 0, z: 0.04 },
      0.04,
      TEST_FIXTURE_SCALE_V0,
    );
    expect(mapped).toEqual({ x: 0, y: 0, z: 40 });
    expect(applyGradientGlyphReadabilityDisplacement(mapped)).toEqual({
      x: 0,
      y: 0,
      z: 80,
    });
    expect(applyGradientGlyphReadabilityDisplacement(null)).toBeNull();
    expect(
      applyGradientGlyphReadabilityDisplacement({ x: 0, y: 0, z: 0 }),
    ).toEqual({ x: 0, y: 0, z: 0 });
    expect(readabilitySrc).not.toMatch(/omegaHMagnitude|omegaX|omegaZ/);
    expect(scaleSrc).not.toMatch(/READABILITY_MULTIPLIER/);
  });

  it("B environmental ω_h presentation length is unchanged", () => {
    const explanation = supportedExplanation();
    const glyph = createTrajectoryTiltingGlyph();
    syncTrajectoryTiltingGlyph(
      glyph,
      createTrajectoryTiltingGlyphModel({ x: 0, y: 1, z: 0 }, explanation),
      TEST_FIXTURE_SCALE_V0,
      ACTUAL_APPEARANCE,
    );
    expect(shaftTip(lineOf(glyph, "analysisTiltingOmegaArrow"))).toEqual([
      20, 0, 0,
    ]);
    expect(
      displayLengthFromPhysicalMagnitude(0.02, TEST_FIXTURE_SCALE_V0),
    ).toBe(20);
    expect(
      displayLengthFromPhysicalMagnitude(
        0.02,
        {
          version: "production-v1",
          worldLengthFromPhysicalMagnitude(magnitudeSMinus1: number): number {
            return magnitudeSMinus1 * ANALYSIS_T1_GLYPH_METERS_PER_S_MINUS_1_V1;
          },
        },
      ),
    ).toBe(0.02 * ANALYSIS_T1_GLYPH_METERS_PER_S_MINUS_1_V1);
    disposeTrajectoryTiltingGlyph(glyph);
  });

  it("C actual and hypothetical gradient use the same readability multiplier", () => {
    const explanation = supportedExplanation();
    const glyph = createTrajectoryTiltingGlyph();
    const overlay = createTrajectoryTiltingWhatIfGlyph();
    syncTrajectoryTiltingGlyph(
      glyph,
      createTrajectoryTiltingGlyphModel({ x: 0, y: 1, z: 0 }, explanation),
      TEST_FIXTURE_SCALE_V0,
      ACTUAL_APPEARANCE,
    );
    syncTrajectoryTiltingWhatIfGlyph(
      overlay,
      createTrajectoryTiltingWhatIfModel(explanation, Math.PI / 2, {
        x: 0,
        y: 1,
        z: 0,
      }),
      TEST_FIXTURE_SCALE_V0,
      WHAT_IF_APPEARANCE,
    );
    const actualLength = shaftLength(lineOf(glyph, "analysisTiltingGradientArrow"));
    const hypotheticalLength = shaftLength(
      lineOf(overlay, "analysisTiltingWhatIfGradientArrow"),
    );
    expect(actualLength).toBeCloseTo(80, 12);
    expect(hypotheticalLength).toBeCloseTo(actualLength, 12);
    expect(actualLength).toBe(
      displayLengthFromPhysicalMagnitude(0.04, TEST_FIXTURE_SCALE_V0) *
        ANALYSIS_T1_GRADIENT_GLYPH_READABILITY_MULTIPLIER_V1,
    );
    disposeTrajectoryTiltingGlyph(glyph);
    disposeTrajectoryTiltingWhatIfGlyph(overlay);
  });

  it("D hypothetical rotation keeps physical magnitude; only display length is stretched", () => {
    const explanation = supportedExplanation();
    const model = createTrajectoryTiltingWhatIfModel(explanation, 0.4);
    if (model.kind !== "AVAILABLE") {
      throw new Error("expected AVAILABLE what-if");
    }
    expect(model.gradientMagnitude).toBe(0.04);
    expect(
      Math.hypot(
        model.hypotheticalGradientVectorWorld.x,
        model.hypotheticalGradientVectorWorld.z,
      ),
    ).toBeCloseTo(
      Math.hypot(
        model.actualGradientVectorWorld.x,
        model.actualGradientVectorWorld.z,
      ),
      12,
    );
    const overlay = createTrajectoryTiltingWhatIfGlyph();
    syncTrajectoryTiltingWhatIfGlyph(
      overlay,
      model,
      TEST_FIXTURE_SCALE_V0,
      WHAT_IF_APPEARANCE,
    );
    expect(
      shaftLength(lineOf(overlay, "analysisTiltingWhatIfGradientArrow")),
    ).toBeCloseTo(80, 5);
    disposeTrajectoryTiltingWhatIfGlyph(overlay);
  });

  it("E T1 / theta / what-if numeric outputs are unchanged", () => {
    const explanation = supportedExplanation();
    const model = createTrajectoryTiltingWhatIfModel(explanation, Math.PI / 2);
    if (model.kind !== "AVAILABLE") {
      throw new Error("expected AVAILABLE what-if");
    }
    expect(model.actualTiltingTendency).toBe(0.0008);
    expect(model.actualTheta).toBe(Math.PI / 2);
    expect(model.thetaWhatIf).toBe(Math.PI / 2);
    expect(model.whatIfTiltingTendency).toBeCloseTo(0, 12);
    expect(model.omegaHMagnitude).toBe(0.02);
    expect(model.gradientMagnitude).toBe(0.04);
    expect(readabilitySrc).not.toMatch(/tiltingTendency|queryAnalysisTilting|cosTheta/);
    expect(readabilitySrc).not.toMatch(/createTrajectoryTiltingWhatIfModel/);
  });

  it("F raycast stays disabled after the longer gradient", () => {
    const explanation = supportedExplanation();
    const glyph = createTrajectoryTiltingGlyph();
    const overlay = createTrajectoryTiltingWhatIfGlyph();
    syncTrajectoryTiltingGlyph(
      glyph,
      createTrajectoryTiltingGlyphModel({ x: 0, y: 0, z: 0 }, explanation),
      TEST_FIXTURE_SCALE_V0,
      ACTUAL_APPEARANCE,
    );
    syncTrajectoryTiltingWhatIfGlyph(
      overlay,
      createTrajectoryTiltingWhatIfModel(explanation, 1, { x: 0, y: 0, z: 0 }),
      TEST_FIXTURE_SCALE_V0,
      WHAT_IF_APPEARANCE,
    );
    const raycaster = new THREE.Raycaster(
      new THREE.Vector3(0, 0, 10),
      new THREE.Vector3(0, 0, -1),
    );
    expect(raycaster.intersectObject(glyph, true)).toEqual([]);
    expect(raycaster.intersectObject(overlay, true)).toEqual([]);
    disposeTrajectoryTiltingGlyph(glyph);
    disposeTrajectoryTiltingWhatIfGlyph(overlay);
  });

  it("arrowhead grows with the visual gradient length", () => {
    const explanation = supportedExplanation();
    const glyph = createTrajectoryTiltingGlyph();
    syncTrajectoryTiltingGlyph(
      glyph,
      createTrajectoryTiltingGlyphModel({ x: 0, y: 1, z: 0 }, explanation),
      TEST_FIXTURE_SCALE_V0,
      ACTUAL_APPEARANCE,
    );
    const positions = lineOf(
      glyph,
      "analysisTiltingGradientArrow",
    ).geometry.getAttribute("position")!.array;
    const tipZ = positions[5]!;
    const leftZ = positions[11]!;
    expect(tipZ).toBe(80);
    expect(tipZ - leftZ).toBeCloseTo(16, 12);
    disposeTrajectoryTiltingGlyph(glyph);
  });
});
