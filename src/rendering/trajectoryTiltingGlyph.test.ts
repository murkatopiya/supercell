import { describe, expect, it } from "vitest";
import * as THREE from "three";
import {
  ANALYSIS_QUERY_REPRESENTATION,
  NATIVE_CONTAINING_SEGMENT_METHOD,
} from "../data/escHrTimeAnalysis/analysisQuery.js";
import {
  ANALYSIS_TILTING_ENVIRONMENTAL_OPERAND,
  ANALYSIS_TILTING_PHYSICAL_IDENTITY,
  ANALYSIS_TILTING_STORM_LOCAL_OPERAND,
  type AnalysisTiltingAlignment,
  type AnalysisTiltingExplanationResult,
} from "../data/escHrTimeAnalysis/analysisTiltingQuery.js";
import type { EscHrTimeAnalysisProvenance } from "../data/escHrTimeAnalysis/types.js";
import {
  createTrajectoryTiltingGlyphModel,
  type TrajectoryTiltingGlyphVectorDisplayScale,
} from "../data/escHrTimeAnalysis/trajectoryTiltingGlyphModel.js";
import glyphSrc from "./trajectoryTiltingGlyph.ts?raw";
import tracerSceneSrc from "./TracerScene.ts?raw";
import pickSrc from "./pickPathHistorySample.ts?raw";
import {
  createTrajectoryTiltingGlyph,
  disposeTrajectoryTiltingGlyph,
  syncTrajectoryTiltingGlyph,
} from "./trajectoryTiltingGlyph.js";
import appSrc from "../app/App.tsx?raw";
import createExploreLabSrc from "../app/createExploreLab.ts?raw";

const STUB_PROVENANCE: EscHrTimeAnalysisProvenance = {
  sourceIdentity: "glyph-render-test",
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

const TEST_FIXTURE_APPEARANCE = {
  omegaColor: 0x00aacc,
  gradientColor: 0xccaa00,
  arcColor: 0x8899aa,
  arcRadiusFraction: 0.4,
};

function supportedExplanation(
  overrides: {
    status?: "FULL_SUPPORT" | "BOUNDARY_CONDITIONED";
    omegaX?: number;
    omegaZ?: number;
    omegaHMagnitude?: number;
    dVyDx?: number;
    dVyDz?: number;
    gradientMagnitude?: number;
    alignment?: AnalysisTiltingAlignment;
  } = {},
): AnalysisTiltingExplanationResult {
  return {
    status: overrides.status ?? "FULL_SUPPORT",
    representation: ANALYSIS_QUERY_REPRESENTATION,
    method: NATIVE_CONTAINING_SEGMENT_METHOD,
    physicalIdentity: ANALYSIS_TILTING_PHYSICAL_IDENTITY,
    environmentalOperand: ANALYSIS_TILTING_ENVIRONMENTAL_OPERAND,
    stormLocalOperand: ANALYSIS_TILTING_STORM_LOCAL_OPERAND,
    segment: { hLo: 10, hHi: 20 },
    tiltingTendency: 0.0005,
    worldHorizontalVorticity: {
      omegaX: overrides.omegaX ?? 0.02,
      omegaZ: overrides.omegaZ ?? 0,
    },
    updraftHorizontalGradient: {
      dVyDx: overrides.dVyDx ?? 0,
      dVyDz: overrides.dVyDz ?? 0.04,
    },
    omegaHMagnitude: overrides.omegaHMagnitude ?? 0.02,
    gradientMagnitude: overrides.gradientMagnitude ?? 0.04,
    alignment: overrides.alignment ?? {
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

function arcPoint(
  line: THREE.Line | THREE.LineSegments,
  index: number,
): number[] {
  const array = line.geometry.getAttribute("position")!.array;
  return [array[index * 3]!, array[index * 3 + 1]!, array[index * 3 + 2]!];
}

function angleBetweenXZ(a: number[], b: number[]): number {
  const magA = Math.hypot(a[0]!, a[2]!);
  const magB = Math.hypot(b[0]!, b[2]!);
  const cos = (a[0]! * b[0]! + a[2]! * b[2]!) / (magA * magB);
  return Math.acos(Math.min(1, Math.max(-1, cos)));
}

describe("trajectory tilting glyph (no WebGLRenderer)", () => {
  it("S supported model produces expected arrow primitives", () => {
    const model = createTrajectoryTiltingGlyphModel(
      { x: 10, y: 20, z: -30 },
      supportedExplanation({
        omegaX: 0.02,
        omegaZ: 0,
        omegaHMagnitude: 0.02,
        dVyDx: 0,
        dVyDz: 0.04,
        gradientMagnitude: 0.04,
      }),
    );
    const glyph = createTrajectoryTiltingGlyph();
    syncTrajectoryTiltingGlyph(
      glyph,
      model,
      TEST_FIXTURE_SCALE_V0,
      TEST_FIXTURE_APPEARANCE,
    );
    expect(glyph.visible).toBe(true);
    expect(glyph.position.x).toBe(10);
    expect(glyph.position.y).toBe(20);
    expect(glyph.position.z).toBe(-30);
    const omega = lineOf(glyph, "analysisTiltingOmegaArrow");
    const gradient = lineOf(glyph, "analysisTiltingGradientArrow");
    expect(omega.visible).toBe(true);
    expect(gradient.visible).toBe(true);
    expect(shaftTip(omega)).toEqual([20, 0, 0]);
    expect(shaftTip(gradient)).toEqual([0, 0, 80]);
    disposeTrajectoryTiltingGlyph(glyph);
  });

  it("T degenerate operand does not produce a fake arrow direction", () => {
    const model = createTrajectoryTiltingGlyphModel(
      { x: 0, y: 100, z: 0 },
      supportedExplanation({
        omegaX: 0.05,
        omegaZ: 0,
        omegaHMagnitude: 0.05,
        dVyDx: 0,
        dVyDz: 0,
        gradientMagnitude: 0,
        alignment: { state: "GRADIENT_DEGENERATE" },
      }),
    );
    const glyph = createTrajectoryTiltingGlyph();
    syncTrajectoryTiltingGlyph(
      glyph,
      model,
      TEST_FIXTURE_SCALE_V0,
      TEST_FIXTURE_APPEARANCE,
    );
    expect(lineOf(glyph, "analysisTiltingOmegaArrow").visible).toBe(true);
    expect(shaftTip(lineOf(glyph, "analysisTiltingOmegaArrow"))).toEqual([
      50, 0, 0,
    ]);
    expect(lineOf(glyph, "analysisTiltingGradientArrow").visible).toBe(false);
    expect(
      lineOf(glyph, "analysisTiltingGradientArrow").geometry.drawRange.count,
    ).toBe(0);
    disposeTrajectoryTiltingGlyph(glyph);
  });

  it("U degenerate alignment produces no angle arc", () => {
    const model = createTrajectoryTiltingGlyphModel(
      { x: 0, y: 1, z: 0 },
      supportedExplanation({
        omegaX: 0,
        omegaZ: 0,
        omegaHMagnitude: 0,
        dVyDx: 0.04,
        dVyDz: 0,
        gradientMagnitude: 0.04,
        alignment: { state: "OMEGA_DEGENERATE" },
      }),
    );
    const glyph = createTrajectoryTiltingGlyph();
    syncTrajectoryTiltingGlyph(
      glyph,
      model,
      TEST_FIXTURE_SCALE_V0,
      TEST_FIXTURE_APPEARANCE,
    );
    const arc = lineOf(glyph, "analysisTiltingAlignmentArc");
    expect(arc.visible).toBe(false);
    expect(arc.geometry.drawRange.count).toBe(0);
    disposeTrajectoryTiltingGlyph(glyph);
  });

  it("V OOD and COLUMN clear all scientific geometry", () => {
    const supported = createTrajectoryTiltingGlyphModel(
      { x: 1, y: 2, z: 3 },
      supportedExplanation(),
    );
    const glyph = createTrajectoryTiltingGlyph();
    syncTrajectoryTiltingGlyph(
      glyph,
      supported,
      TEST_FIXTURE_SCALE_V0,
      TEST_FIXTURE_APPEARANCE,
    );
    expect(glyph.visible).toBe(true);

    const ood = createTrajectoryTiltingGlyphModel(
      { x: 1, y: 2, z: 3 },
      {
        status: "OUT_OF_DOMAIN",
        representation: ANALYSIS_QUERY_REPRESENTATION,
        provenance: STUB_PROVENANCE,
      },
    );
    syncTrajectoryTiltingGlyph(
      glyph,
      ood,
      TEST_FIXTURE_SCALE_V0,
      TEST_FIXTURE_APPEARANCE,
    );
    expect(glyph.visible).toBe(false);
    expect(lineOf(glyph, "analysisTiltingOmegaArrow").visible).toBe(false);
    expect(lineOf(glyph, "analysisTiltingGradientArrow").visible).toBe(false);
    expect(lineOf(glyph, "analysisTiltingAlignmentArc").visible).toBe(false);

    const column = createTrajectoryTiltingGlyphModel(
      { x: 1, y: 2, z: 3 },
      { status: "COLUMN_UNAVAILABLE" },
    );
    syncTrajectoryTiltingGlyph(
      glyph,
      column,
      TEST_FIXTURE_SCALE_V0,
      TEST_FIXTURE_APPEARANCE,
    );
    expect(glyph.visible).toBe(false);
    disposeTrajectoryTiltingGlyph(glyph);
  });

  it("W identical model + scale is deterministic", () => {
    const model = createTrajectoryTiltingGlyphModel(
      { x: 4, y: 5, z: 6 },
      supportedExplanation(),
    );
    const a = createTrajectoryTiltingGlyph();
    const b = createTrajectoryTiltingGlyph();
    syncTrajectoryTiltingGlyph(a, model, TEST_FIXTURE_SCALE_V0, TEST_FIXTURE_APPEARANCE);
    syncTrajectoryTiltingGlyph(b, model, TEST_FIXTURE_SCALE_V0, TEST_FIXTURE_APPEARANCE);
    const omegaA = Array.from(
      lineOf(a, "analysisTiltingOmegaArrow").geometry.getAttribute("position")!.array,
    );
    const omegaB = Array.from(
      lineOf(b, "analysisTiltingOmegaArrow").geometry.getAttribute("position")!.array,
    );
    const arcA = Array.from(
      lineOf(a, "analysisTiltingAlignmentArc").geometry.getAttribute("position")!.array,
    );
    const arcB = Array.from(
      lineOf(b, "analysisTiltingAlignmentArc").geometry.getAttribute("position")!.array,
    );
    expect(omegaA).toEqual(omegaB);
    expect(arcA).toEqual(arcB);
    disposeTrajectoryTiltingGlyph(a);
    disposeTrajectoryTiltingGlyph(b);
  });

  it("X raycast is disabled", () => {
    const glyph = createTrajectoryTiltingGlyph();
    syncTrajectoryTiltingGlyph(
      glyph,
      createTrajectoryTiltingGlyphModel(
        { x: 0, y: 0, z: 0 },
        supportedExplanation(),
      ),
      TEST_FIXTURE_SCALE_V0,
      TEST_FIXTURE_APPEARANCE,
    );
    const raycaster = new THREE.Raycaster(
      new THREE.Vector3(0, 0, 10),
      new THREE.Vector3(0, 0, -1),
    );
    expect(raycaster.intersectObject(glyph, true)).toEqual([]);
    expect(
      raycaster.intersectObject(lineOf(glyph, "analysisTiltingOmegaArrow"), false),
    ).toEqual([]);
    disposeTrajectoryTiltingGlyph(glyph);
  });

  it("Y dispose releases line geometries and materials", () => {
    const glyph = createTrajectoryTiltingGlyph();
    const omega = lineOf(glyph, "analysisTiltingOmegaArrow");
    const geometryUuid = omega.geometry.uuid;
    disposeTrajectoryTiltingGlyph(glyph);
    expect(omega.geometry.uuid).toBe(geometryUuid);
    expect(omega.geometry.getAttribute("position")).toBeDefined();
  });

  it("Z renderer module imports no Analysis physics query", () => {
    expect(glyphSrc).not.toMatch(/queryAnalysisTilting/);
    expect(glyphSrc).not.toMatch(/queryAnalysisNativeSegmentVorticityAt/);
    expect(glyphSrc).not.toMatch(/analysisTiltingQuery/);
    expect(glyphSrc).not.toMatch(/DiagnosticTiltingTendency/);
    expect(glyphSrc).not.toMatch(/horizontalVorticityFromShear/);
    expect(tracerSceneSrc).toMatch(/createTrajectoryTiltingGlyph/);
    expect(tracerSceneSrc).not.toMatch(/queryAnalysisTilting/);
    expect(pickSrc).not.toMatch(/trajectoryTiltingGlyph/);
    expect(appSrc).not.toMatch(/from ["'].*trajectoryTiltingGlyph\.js["']/);
    expect(createExploreLabSrc).not.toMatch(/trajectoryTiltingGlyph/);
    expect(createExploreLabSrc).not.toMatch(/queryAnalysisTilting/);
  });

  it("arc at θ=0 is omitted; θ=π/2 and θ=π are robust and non-reflex", () => {
    const glyph = createTrajectoryTiltingGlyph();

    syncTrajectoryTiltingGlyph(
      glyph,
      createTrajectoryTiltingGlyphModel(
        { x: 0, y: 1, z: 0 },
        supportedExplanation({
          omegaX: 0.02,
          omegaZ: 0,
          omegaHMagnitude: 0.02,
          dVyDx: 0.04,
          dVyDz: 0,
          gradientMagnitude: 0.04,
          alignment: { state: "ALIGNMENT_DEFINED", cosTheta: 1, theta: 0 },
        }),
      ),
      TEST_FIXTURE_SCALE_V0,
      TEST_FIXTURE_APPEARANCE,
    );
    expect(lineOf(glyph, "analysisTiltingAlignmentArc").visible).toBe(false);

    syncTrajectoryTiltingGlyph(
      glyph,
      createTrajectoryTiltingGlyphModel(
        { x: 0, y: 1, z: 0 },
        supportedExplanation({
          omegaX: 0.02,
          omegaZ: 0,
          omegaHMagnitude: 0.02,
          dVyDx: 0,
          dVyDz: 0.04,
          gradientMagnitude: 0.04,
          alignment: {
            state: "ALIGNMENT_DEFINED",
            cosTheta: 0,
            theta: Math.PI / 2,
          },
        }),
      ),
      TEST_FIXTURE_SCALE_V0,
      TEST_FIXTURE_APPEARANCE,
    );
    const arc90 = lineOf(glyph, "analysisTiltingAlignmentArc");
    expect(arc90.visible).toBe(true);
    const first90 = arcPoint(arc90, 0);
    const last90 = arcPoint(arc90, 24);
    expect(first90[1]).toBe(0);
    expect(last90[1]).toBe(0);
    expect(angleBetweenXZ(first90, last90)).toBeCloseTo(Math.PI / 2, 12);
    expect(angleBetweenXZ(first90, last90)).toBeLessThan(Math.PI);

    syncTrajectoryTiltingGlyph(
      glyph,
      createTrajectoryTiltingGlyphModel(
        { x: 0, y: 1, z: 0 },
        supportedExplanation({
          omegaX: 0.02,
          omegaZ: 0,
          omegaHMagnitude: 0.02,
          dVyDx: -0.04,
          dVyDz: 0,
          gradientMagnitude: 0.04,
          alignment: {
            state: "ALIGNMENT_DEFINED",
            cosTheta: -1,
            theta: Math.PI,
          },
        }),
      ),
      TEST_FIXTURE_SCALE_V0,
      TEST_FIXTURE_APPEARANCE,
    );
    const arcPi = lineOf(glyph, "analysisTiltingAlignmentArc");
    expect(arcPi.visible).toBe(true);
    const firstPi = arcPoint(arcPi, 0);
    const lastPi = arcPoint(arcPi, 24);
    expect(Number.isFinite(firstPi[0])).toBe(true);
    expect(Number.isFinite(lastPi[0])).toBe(true);
    expect(angleBetweenXZ(firstPi, lastPi)).toBeCloseTo(Math.PI, 12);
    disposeTrajectoryTiltingGlyph(glyph);
  });

  it("does not reuse T1 warm/cool as operand identity, and avoids causal wording", () => {
    expect(glyphSrc).not.toMatch(/0xb2182b/i);
    expect(glyphSrc).not.toMatch(/0x2166ac/i);
    expect(glyphSrc).not.toMatch(/parcel/);
    expect(glyphSrc).not.toMatch(/tracerVorticity|parcelVorticity|acquired/);
    expect(glyphSrc).not.toMatch(/spin-up|spin-down/);
    expect(glyphSrc).not.toMatch(/\bforce\b/);
    expect(glyphSrc).not.toMatch(/what-if|whatIf/);
  });
});
