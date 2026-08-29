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
  type AnalysisTiltingTendencyResult,
} from "../data/escHrTimeAnalysis/analysisTiltingQuery.js";
import {
  encodeTrajectoryTiltingForRender,
  type TrajectoryTiltingColorScale,
} from "../data/escHrTimeAnalysis/trajectoryTiltingRenderEncoding.js";
import type { TrajectoryTiltingProjectedSample } from "../data/escHrTimeAnalysis/trajectoryTiltingProjection.js";
import type { EscHrTimeAnalysisProvenance } from "../data/escHrTimeAnalysis/types.js";
import { linearRgbFromSrgbHex } from "./vertexColorSpace.js";
import overlaySrc from "./trajectoryTiltingOverlay.ts?raw";
import tracerSceneSrc from "./TracerScene.ts?raw";
import pickSrc from "./pickPathHistorySample.ts?raw";
import {
  createTrajectoryTiltingOverlay,
  disposeTrajectoryTiltingOverlay,
  syncTrajectoryTiltingOverlay,
} from "./trajectoryTiltingOverlay.js";
import appSrc from "../app/App.tsx?raw";
import createExploreLabSrc from "../app/createExploreLab.ts?raw";

const STUB_PROVENANCE: EscHrTimeAnalysisProvenance = {
  sourceIdentity: "overlay-test",
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

const TEST_FIXTURE_SCALE_V0: TrajectoryTiltingColorScale = {
  version: "test-fixture-v0",
  signedUnitFromTiltingTendency(tiltingTendency: number): number {
    const fixtureSpan = 0.01;
    if (tiltingTendency === 0) {
      return 0;
    }
    const unit = tiltingTendency / fixtureSpan;
    if (unit > 1) {
      return 1;
    }
    if (unit < -1) {
      return -1;
    }
    return unit;
  },
};

const TEST_FIXTURE_APPEARANCE = {
  linearRgbFromSignedUnit(signedUnit: number) {
    const cool = linearRgbFromSrgbHex(0x2166ac);
    const warm = linearRgbFromSrgbHex(0xb2182b);
    const neutral = linearRgbFromSrgbHex(0xf7f7f7);
    if (signedUnit >= 0) {
      return {
        r: neutral.r + (warm.r - neutral.r) * signedUnit,
        g: neutral.g + (warm.g - neutral.g) * signedUnit,
        b: neutral.b + (warm.b - neutral.b) * signedUnit,
      };
    }
    const t = -signedUnit;
    return {
      r: neutral.r + (cool.r - neutral.r) * t,
      g: neutral.g + (cool.g - neutral.g) * t,
      b: neutral.b + (cool.b - neutral.b) * t,
    };
  },
};

function numericAnalysis(
  status: "FULL_SUPPORT" | "BOUNDARY_CONDITIONED",
  tiltingTendency: number,
): AnalysisTiltingTendencyResult {
  return {
    status,
    representation: ANALYSIS_QUERY_REPRESENTATION,
    method: NATIVE_CONTAINING_SEGMENT_METHOD,
    physicalIdentity: ANALYSIS_TILTING_PHYSICAL_IDENTITY,
    environmentalOperand: ANALYSIS_TILTING_ENVIRONMENTAL_OPERAND,
    stormLocalOperand: ANALYSIS_TILTING_STORM_LOCAL_OPERAND,
    segment: { hLo: 10, hHi: 20 },
    tiltingTendency,
    provenance: STUB_PROVENANCE,
  };
}

function sample(
  historyIndex: number,
  y: number,
  analysis: AnalysisTiltingTendencyResult,
): TrajectoryTiltingProjectedSample {
  return {
    historyIndex,
    position: { x: historyIndex * 10, y, z: 0 },
    simulationTime: historyIndex,
    analysis,
  };
}

function lineOf(overlay: THREE.Group, name: string): THREE.LineSegments {
  const object = overlay.getObjectByName(name);
  if (!(object instanceof THREE.LineSegments)) {
    throw new Error(`missing ${name}`);
  }
  return object;
}

function vertexColors(line: THREE.LineSegments, vertexCount: number): number[][] {
  const array = line.geometry.getAttribute("color")!.array;
  const rows: number[][] = [];
  for (let i = 0; i < vertexCount; i++) {
    rows.push([array[i * 3]!, array[i * 3 + 1]!, array[i * 3 + 2]!]);
  }
  return rows;
}

describe("trajectory tilting overlay (no WebGLRenderer)", () => {
  it("draws nothing for an empty encoding", () => {
    const overlay = createTrajectoryTiltingOverlay();
    syncTrajectoryTiltingOverlay(
      overlay,
      { samples: [], valueSegments: [] },
      TEST_FIXTURE_APPEARANCE,
    );
    expect(overlay.visible).toBe(false);
    expect(lineOf(overlay, "analysisTiltingFullValue").geometry.drawRange.count).toBe(0);
    disposeTrajectoryTiltingOverlay(overlay);
  });

  it("does not invent a value-colored primitive for a single FULL sample", () => {
    const encoding = encodeTrajectoryTiltingForRender(
      [sample(0, 100, numericAnalysis("FULL_SUPPORT", 0.004))],
      TEST_FIXTURE_SCALE_V0,
    );
    const overlay = createTrajectoryTiltingOverlay();
    syncTrajectoryTiltingOverlay(overlay, encoding, TEST_FIXTURE_APPEARANCE);
    expect(encoding.samples).toHaveLength(1);
    expect(overlay.visible).toBe(false);
    expect(lineOf(overlay, "analysisTiltingFullValue").visible).toBe(false);
    disposeTrajectoryTiltingOverlay(overlay);
  });

  it("writes identical endpoint colors so the primitive is not interpolated T1", () => {
    const encoding = encodeTrajectoryTiltingForRender(
      [
        sample(0, 100, numericAnalysis("FULL_SUPPORT", 0.005)),
        sample(1, 110, numericAnalysis("FULL_SUPPORT", -0.005)),
      ],
      TEST_FIXTURE_SCALE_V0,
    );
    const overlay = createTrajectoryTiltingOverlay();
    syncTrajectoryTiltingOverlay(overlay, encoding, TEST_FIXTURE_APPEARANCE);
    const full = lineOf(overlay, "analysisTiltingFullValue");
    expect(full.geometry.drawRange.count).toBe(2);
    const colors = vertexColors(full, 2);
    expect(colors[0]).toEqual(colors[1]);
    const expected = TEST_FIXTURE_APPEARANCE.linearRgbFromSignedUnit(0.5);
    const uploaded = Array.from(new Float32Array([expected.r, expected.g, expected.b]));
    expect(colors[0]).toEqual(uploaded);
    disposeTrajectoryTiltingOverlay(overlay);
  });

  it("puts BOUNDARY-owned segments on the orthogonal support object, not the FULL object", () => {
    const encoding = encodeTrajectoryTiltingForRender(
      [
        sample(0, 100, numericAnalysis("BOUNDARY_CONDITIONED", 0.004)),
        sample(1, 110, numericAnalysis("FULL_SUPPORT", 0.004)),
      ],
      TEST_FIXTURE_SCALE_V0,
    );
    const overlay = createTrajectoryTiltingOverlay();
    syncTrajectoryTiltingOverlay(overlay, encoding, TEST_FIXTURE_APPEARANCE);
    expect(lineOf(overlay, "analysisTiltingBoundaryValue").visible).toBe(true);
    expect(lineOf(overlay, "analysisTiltingBoundaryValue").geometry.drawRange.count).toBe(2);
    expect(lineOf(overlay, "analysisTiltingFullValue").visible).toBe(false);
    disposeTrajectoryTiltingOverlay(overlay);
  });

  it("does not draw a value overlay across OOD samples and restores a later FULL run", () => {
    const encoding = encodeTrajectoryTiltingForRender(
      [
        sample(0, 100, numericAnalysis("FULL_SUPPORT", 0.004)),
        sample(1, 110, numericAnalysis("FULL_SUPPORT", 0.003)),
        sample(2, 0, {
          status: "OUT_OF_DOMAIN",
          representation: "Analysis",
          provenance: STUB_PROVENANCE,
        }),
        sample(3, -1, {
          status: "OUT_OF_DOMAIN",
          representation: "Analysis",
          provenance: STUB_PROVENANCE,
        }),
        sample(4, 130, numericAnalysis("FULL_SUPPORT", -0.004)),
        sample(5, 140, numericAnalysis("FULL_SUPPORT", -0.005)),
      ],
      TEST_FIXTURE_SCALE_V0,
    );
    const overlay = createTrajectoryTiltingOverlay();
    syncTrajectoryTiltingOverlay(overlay, encoding, TEST_FIXTURE_APPEARANCE);
    const full = lineOf(overlay, "analysisTiltingFullValue");
    expect(full.geometry.drawRange.count).toBe(4);
    const positions = full.geometry.getAttribute("position")!.array;
    expect(Array.from(positions.slice(0, 6))).toEqual([0, 100, 0, 10, 110, 0]);
    expect(Array.from(positions.slice(6, 12))).toEqual([40, 130, 0, 50, 140, 0]);
    disposeTrajectoryTiltingOverlay(overlay);
  });

  it("draws nothing diagnostic for COLUMN_UNAVAILABLE", () => {
    const encoding = encodeTrajectoryTiltingForRender(
      [
        sample(0, 100, { status: "COLUMN_UNAVAILABLE" }),
        sample(1, 110, { status: "COLUMN_UNAVAILABLE" }),
      ],
      TEST_FIXTURE_SCALE_V0,
    );
    const overlay = createTrajectoryTiltingOverlay();
    syncTrajectoryTiltingOverlay(overlay, encoding, TEST_FIXTURE_APPEARANCE);
    expect(overlay.visible).toBe(false);
    disposeTrajectoryTiltingOverlay(overlay);
  });

  it("disables raycast so overlay cannot replace historical sample picking", () => {
    const overlay = createTrajectoryTiltingOverlay();
    const full = lineOf(overlay, "analysisTiltingFullValue");
    const raycaster = new THREE.Raycaster(
      new THREE.Vector3(0, 0, 10),
      new THREE.Vector3(0, 0, -1),
    );
    expect(raycaster.intersectObject(full, false)).toEqual([]);
    disposeTrajectoryTiltingOverlay(overlay);
  });

  it("is not wired into TracerScene, App, or Explore, and does not query Analysis", () => {
    expect(overlaySrc).not.toMatch(/queryAnalysisTilting/);
    expect(overlaySrc).not.toMatch(/T1_COLOR_SCALE_V1/);
    expect(overlaySrc).not.toMatch(/parcel/);
    expect(overlaySrc).not.toMatch(/spin-up/);
    expect(tracerSceneSrc).not.toMatch(/trajectoryTiltingOverlay/);
    expect(tracerSceneSrc).not.toMatch(/encodeTrajectoryTiltingForRender/);
    expect(tracerSceneSrc).not.toMatch(/queryAnalysisTilting/);
    expect(pickSrc).not.toMatch(/trajectoryTiltingOverlay/);
    expect(appSrc).not.toMatch(/trajectoryTiltingOverlay/);
    expect(appSrc).not.toMatch(/encodeTrajectoryTiltingForRender/);
    expect(createExploreLabSrc).not.toMatch(/encodeTrajectoryTiltingForRender/);
    expect(createExploreLabSrc).not.toMatch(/queryAnalysisTilting/);
  });
});
