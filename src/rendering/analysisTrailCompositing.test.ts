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
import { encodeTrajectoryTiltingForRender } from "../data/escHrTimeAnalysis/trajectoryTiltingRenderEncoding.js";
import type { TrajectoryTiltingProjectedSample } from "../data/escHrTimeAnalysis/trajectoryTiltingProjection.js";
import type { EscHrTimeAnalysisProvenance } from "../data/escHrTimeAnalysis/types.js";
import { TRACER_COLORS } from "./tracerObserveSlot.js";
import { createTrailLine, disposeTrailLine, syncTrailLine } from "./trailGeometry.js";
import {
  ANALYSIS_TILTING_OVERLAY_RENDER_ORDER,
  createTrajectoryTiltingOverlay,
  disposeTrajectoryTiltingOverlay,
  syncTrajectoryTiltingOverlay,
} from "./trajectoryTiltingOverlay.js";
import { linearRgbFromSrgbHex } from "./vertexColorSpace.js";
import tracerViewportSrc from "../ui/tracer/TracerViewport.tsx?raw";
import tracerSceneSrc from "./TracerScene.ts?raw";
import pickSrc from "./pickPathHistorySample.ts?raw";

const STUB_PROVENANCE: EscHrTimeAnalysisProvenance = {
  sourceIdentity: "compositing-test",
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

const SCALE = {
  version: "test-fixture-v0",
  signedUnitFromTiltingTendency(tiltingTendency: number): number {
    return tiltingTendency > 0 ? 1 : tiltingTendency < 0 ? -1 : 0;
  },
};

const APPEARANCE = {
  linearRgbFromSignedUnit(signedUnit: number) {
    if (signedUnit > 0) {
      return linearRgbFromSrgbHex(0xb2182b);
    }
    if (signedUnit < 0) {
      return linearRgbFromSrgbHex(0x2166ac);
    }
    return linearRgbFromSrgbHex(0xf7f7f7);
  },
};

function numeric(status: "FULL_SUPPORT" | "BOUNDARY_CONDITIONED", t1: number): AnalysisTiltingTendencyResult {
  return {
    status,
    representation: ANALYSIS_QUERY_REPRESENTATION,
    method: NATIVE_CONTAINING_SEGMENT_METHOD,
    physicalIdentity: ANALYSIS_TILTING_PHYSICAL_IDENTITY,
    environmentalOperand: ANALYSIS_TILTING_ENVIRONMENTAL_OPERAND,
    stormLocalOperand: ANALYSIS_TILTING_STORM_LOCAL_OPERAND,
    segment: { hLo: 10, hHi: 20 },
    tiltingTendency: t1,
    provenance: STUB_PROVENANCE,
  };
}

function sample(
  historyIndex: number,
  position: { x: number; y: number; z: number },
  analysis: AnalysisTiltingTendencyResult | { status: "OUT_OF_DOMAIN"; representation: "Analysis"; provenance: typeof STUB_PROVENANCE },
): TrajectoryTiltingProjectedSample {
  return {
    historyIndex,
    position,
    simulationTime: historyIndex,
    analysis,
  };
}

function fullLine(overlay: THREE.Group): THREE.LineSegments {
  const object = overlay.getObjectByName("analysisTiltingFullValue");
  if (!(object instanceof THREE.LineSegments)) {
    throw new Error("missing overlay line");
  }
  return object;
}

describe("Analysis trail compositing contract", () => {
  it("occupancy does not write depth; overlay tests and writes depth and draws later", () => {
    const occupancy = createTrailLine(TRACER_COLORS[0]);
    const overlay = createTrajectoryTiltingOverlay();
    const occupancyMaterial = occupancy.material;
    expect(occupancyMaterial).toBeInstanceOf(THREE.LineBasicMaterial);
    if (!(occupancyMaterial instanceof THREE.LineBasicMaterial)) {
      return;
    }
    expect(occupancyMaterial.depthTest).toBe(true);
    expect(occupancyMaterial.depthWrite).toBe(false);
    expect(occupancy.renderOrder).toBeLessThan(ANALYSIS_TILTING_OVERLAY_RENDER_ORDER);

    const overlayLine = fullLine(overlay);
    const overlayMaterial = overlayLine.material;
    expect(overlayMaterial).toBeInstanceOf(THREE.LineBasicMaterial);
    if (!(overlayMaterial instanceof THREE.LineBasicMaterial)) {
      return;
    }
    expect(overlayMaterial.depthTest).toBe(true);
    expect(overlayMaterial.depthWrite).toBe(true);
    expect(overlay.renderOrder).toBe(ANALYSIS_TILTING_OVERLAY_RENDER_ORDER);
    expect(overlayLine.renderOrder).toBe(ANALYSIS_TILTING_OVERLAY_RENDER_ORDER);
    disposeTrailLine(occupancy);
    disposeTrajectoryTiltingOverlay(overlay);
  });

  it("drawable overlay endpoints match occupancy trail points for the same recorded samples", () => {
    const points = [
      { x: 0, y: 100, z: 0 },
      { x: 10, y: 110, z: 0 },
    ];
    const occupancy = createTrailLine(TRACER_COLORS[0]);
    syncTrailLine(occupancy, points);
    const encoding = encodeTrajectoryTiltingForRender(
      [
        sample(0, points[0]!, numeric("FULL_SUPPORT", 0.004)),
        sample(1, points[1]!, numeric("FULL_SUPPORT", -0.004)),
      ],
      SCALE,
    );
    const overlay = createTrajectoryTiltingOverlay();
    syncTrajectoryTiltingOverlay(overlay, encoding, APPEARANCE);
    const overlayPositions = fullLine(overlay).geometry.getAttribute("position")!.array;
    const occupancyPositions = occupancy.geometry.getAttribute("position")!.array;
    expect(Array.from(overlayPositions.slice(0, 6))).toEqual([
      occupancyPositions[0],
      occupancyPositions[1],
      occupancyPositions[2],
      occupancyPositions[3],
      occupancyPositions[4],
      occupancyPositions[5],
    ]);
    disposeTrailLine(occupancy);
    disposeTrajectoryTiltingOverlay(overlay);
  });

  it("OOD gap leaves occupancy visible and does not invent overlay geometry there", () => {
    const points = [
      { x: 0, y: 100, z: 0 },
      { x: 10, y: 0, z: 0 },
      { x: 20, y: 130, z: 0 },
    ];
    const occupancy = createTrailLine(TRACER_COLORS[0]);
    syncTrailLine(occupancy, points);
    const encoding = encodeTrajectoryTiltingForRender(
      [
        sample(0, points[0]!, numeric("FULL_SUPPORT", 0.004)),
        sample(1, points[1]!, {
          status: "OUT_OF_DOMAIN",
          representation: "Analysis",
          provenance: STUB_PROVENANCE,
        }),
        sample(2, points[2]!, numeric("FULL_SUPPORT", -0.004)),
      ],
      SCALE,
    );
    const overlay = createTrajectoryTiltingOverlay();
    syncTrajectoryTiltingOverlay(overlay, encoding, APPEARANCE);
    expect(occupancy.visible).toBe(true);
    expect(occupancy.geometry.drawRange.count).toBe(3);
    expect(encoding.valueSegments).toHaveLength(0);
    expect(overlay.visible).toBe(false);
    expect(fullLine(overlay).visible).toBe(false);
    disposeTrailLine(occupancy);
    disposeTrajectoryTiltingOverlay(overlay);
  });

  it("overlay raycast stays disabled; picking remains occupancy history samples", () => {
    const overlay = createTrajectoryTiltingOverlay();
    const raycaster = new THREE.Raycaster(
      new THREE.Vector3(0, 0, 10),
      new THREE.Vector3(0, 0, -1),
    );
    expect(raycaster.intersectObject(fullLine(overlay), true)).toEqual([]);
    expect(pickSrc).toMatch(/pointsFor/);
    expect(pickSrc).not.toMatch(/trajectoryTiltingOverlay/);
    expect(pickSrc).not.toMatch(/analysisTiltingFullValue/);
    disposeTrajectoryTiltingOverlay(overlay);
  });

  it("camera motion is not an overlay rebuild input", () => {
    expect(tracerViewportSrc).toMatch(/exploreAnalysisTiltingHistoryFingerprint/);
    const fingerprintBlock = tracerViewportSrc.slice(
      tracerViewportSrc.indexOf("exploreAnalysisTiltingHistoryFingerprint"),
      tracerViewportSrc.indexOf("exploreAnalysisTiltingHistoryFingerprint") + 400,
    );
    expect(fingerprintBlock).not.toMatch(/camera/);
    expect(fingerprintBlock).not.toMatch(/controls\.target/);
    expect(tracerSceneSrc).toMatch(/syncAnalysisTiltingOverlays/);
    const renderStart = tracerSceneSrc.indexOf("render(): void");
    const renderBody = tracerSceneSrc.slice(renderStart, renderStart + 450);
    expect(renderBody).not.toMatch(/syncAnalysisTiltingOverlays/);
    expect(renderBody).not.toMatch(/encodeExploreAnalysisTilting/);
  });
});
