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
  type AnalysisTiltingExplanationResult,
} from "../data/escHrTimeAnalysis/analysisTiltingQuery.js";
import { createTrajectoryTiltingGlyphModel } from "../data/escHrTimeAnalysis/trajectoryTiltingGlyphModel.js";
import type { TrajectoryTiltingGlyphVectorDisplayScale } from "../data/escHrTimeAnalysis/trajectoryTiltingGlyphModel.js";
import { createTrajectoryTiltingWhatIfModel } from "../data/escHrTimeAnalysis/trajectoryTiltingWhatIf.js";
import type { EscHrTimeAnalysisProvenance } from "../data/escHrTimeAnalysis/types.js";
import glyphSrc from "./trajectoryTiltingWhatIfGlyph.ts?raw";
import pickSrc from "./pickPathHistorySample.ts?raw";
import tracerSceneSrc from "./TracerScene.ts?raw";
import {
  createTrajectoryTiltingWhatIfGlyph,
  disposeTrajectoryTiltingWhatIfGlyph,
  syncTrajectoryTiltingWhatIfGlyph,
} from "./trajectoryTiltingWhatIfGlyph.js";
import appSrc from "../app/App.tsx?raw";

const STUB_PROVENANCE: EscHrTimeAnalysisProvenance = {
  sourceIdentity: "whatif-glyph-test",
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
  hypotheticalGradientColor: 0x88aacc,
  hypotheticalArcColor: 0xaabbcc,
  opacity: 0.55,
  dashSize: 40,
  gapSize: 24,
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

describe("trajectory tilting what-if glyph (no WebGLRenderer)", () => {
  it("AG does not mutate the actual glyph model", () => {
    const explanation = supportedExplanation();
    const glyphModel = Object.freeze(
      createTrajectoryTiltingGlyphModel({ x: 1, y: 2, z: 3 }, explanation),
    );
    const before = structuredClone(glyphModel);
    const overlay = createTrajectoryTiltingWhatIfGlyph();
    syncTrajectoryTiltingWhatIfGlyph(
      overlay,
      createTrajectoryTiltingWhatIfModel(explanation, 0.4, { x: 1, y: 2, z: 3 }),
      TEST_FIXTURE_SCALE_V0,
      TEST_FIXTURE_APPEARANCE,
    );
    expect(glyphModel).toEqual(before);
    disposeTrajectoryTiltingWhatIfGlyph(overlay);
  });

  it("AH hypothetical gradient direction changes with theta", () => {
    const explanation = supportedExplanation();
    const overlay = createTrajectoryTiltingWhatIfGlyph();
    syncTrajectoryTiltingWhatIfGlyph(
      overlay,
      createTrajectoryTiltingWhatIfModel(explanation, 0, { x: 0, y: 0, z: 0 }),
      TEST_FIXTURE_SCALE_V0,
      TEST_FIXTURE_APPEARANCE,
    );
    const atZero = shaftTip(lineOf(overlay, "analysisTiltingWhatIfGradientArrow"));
    syncTrajectoryTiltingWhatIfGlyph(
      overlay,
      createTrajectoryTiltingWhatIfModel(
        explanation,
        Math.PI / 2,
        { x: 0, y: 0, z: 0 },
      ),
      TEST_FIXTURE_SCALE_V0,
      TEST_FIXTURE_APPEARANCE,
    );
    const atRight = shaftTip(lineOf(overlay, "analysisTiltingWhatIfGradientArrow"));
    expect(atZero).not.toEqual(atRight);
    disposeTrajectoryTiltingWhatIfGlyph(overlay);
  });

  it("AI display magnitude is constant under the same injected scale", () => {
    const explanation = supportedExplanation();
    const overlay = createTrajectoryTiltingWhatIfGlyph();
    const lengths: number[] = [];
    for (const theta of [0.2, 1.1, Math.PI]) {
      syncTrajectoryTiltingWhatIfGlyph(
        overlay,
        createTrajectoryTiltingWhatIfModel(explanation, theta),
        TEST_FIXTURE_SCALE_V0,
        TEST_FIXTURE_APPEARANCE,
      );
      const tip = shaftTip(lineOf(overlay, "analysisTiltingWhatIfGradientArrow"));
      lengths.push(Math.hypot(tip[0]!, tip[2]!));
    }
    expect(lengths[0]).toBeCloseTo(40, 5);
    expect(lengths[1]).toBeCloseTo(lengths[0]!, 5);
    expect(lengths[2]).toBeCloseTo(lengths[0]!, 5);
    disposeTrajectoryTiltingWhatIfGlyph(overlay);
  });

  it("AJ what-if arc uses the hypothetical angle", () => {
    const overlay = createTrajectoryTiltingWhatIfGlyph();
    syncTrajectoryTiltingWhatIfGlyph(
      overlay,
      createTrajectoryTiltingWhatIfModel(
        supportedExplanation(),
        Math.PI / 2,
      ),
      TEST_FIXTURE_SCALE_V0,
      TEST_FIXTURE_APPEARANCE,
    );
    const arc = lineOf(overlay, "analysisTiltingWhatIfAlignmentArc");
    expect(arc.visible).toBe(true);
    const array = arc.geometry.getAttribute("position")!.array;
    const first = [array[0]!, array[2]!];
    const last = [array[24 * 3]!, array[24 * 3 + 2]!];
    const magA = Math.hypot(first[0]!, first[1]!);
    const magB = Math.hypot(last[0]!, last[1]!);
    const cos = (first[0]! * last[0]! + first[1]! * last[1]!) / (magA * magB);
    expect(Math.acos(Math.min(1, Math.max(-1, cos)))).toBeCloseTo(Math.PI / 2, 12);
    disposeTrajectoryTiltingWhatIfGlyph(overlay);
  });

  it("AK unavailable model draws no what-if geometry", () => {
    const overlay = createTrajectoryTiltingWhatIfGlyph();
    syncTrajectoryTiltingWhatIfGlyph(
      overlay,
      createTrajectoryTiltingWhatIfModel({ status: "COLUMN_UNAVAILABLE" }, 1),
      TEST_FIXTURE_SCALE_V0,
      TEST_FIXTURE_APPEARANCE,
    );
    expect(overlay.visible).toBe(false);
    expect(lineOf(overlay, "analysisTiltingWhatIfGradientArrow").visible).toBe(
      false,
    );
    expect(lineOf(overlay, "analysisTiltingWhatIfAlignmentArc").visible).toBe(
      false,
    );
    disposeTrajectoryTiltingWhatIfGlyph(overlay);
  });

  it("AL raycast is disabled", () => {
    const overlay = createTrajectoryTiltingWhatIfGlyph();
    syncTrajectoryTiltingWhatIfGlyph(
      overlay,
      createTrajectoryTiltingWhatIfModel(supportedExplanation(), 1),
      TEST_FIXTURE_SCALE_V0,
      TEST_FIXTURE_APPEARANCE,
    );
    const raycaster = new THREE.Raycaster(
      new THREE.Vector3(0, 0, 10),
      new THREE.Vector3(0, 0, -1),
    );
    expect(raycaster.intersectObject(overlay, true)).toEqual([]);
    disposeTrajectoryTiltingWhatIfGlyph(overlay);
  });

  it("AM AN no picking change, no Analysis query, not wired", () => {
    expect(pickSrc).not.toMatch(/trajectoryTiltingWhatIf/);
    expect(tracerSceneSrc).not.toMatch(/trajectoryTiltingWhatIf/);
    expect(appSrc).not.toMatch(/trajectoryTiltingWhatIf/);
    expect(glyphSrc).not.toMatch(/queryAnalysisTilting/);
    expect(glyphSrc).not.toMatch(/analysisTiltingQuery/);
    expect(glyphSrc).not.toMatch(/trajectoryTiltingGlyph\.js/);
    expect(glyphSrc).not.toMatch(/parcel|spin-up|predict/);
  });
});
