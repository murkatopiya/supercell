import { describe, expect, it } from "vitest";
import type { Vec3 } from "../../core/math/Vec3.js";
import { VerticalEnvelopeUpdraftField } from "../../physics/storm/VerticalEnvelopeUpdraftField.js";
import { TracerPathHistory } from "../../simulation/TracerPathHistory.js";
import {
  queryAnalysisTiltingExplanationAt,
  queryAnalysisTiltingTendencyAt,
} from "./analysisTiltingQuery.js";
import { ESC_HR_TIME_SAMPLING_CLASS } from "./constants.js";
import { createEscHrTimeAnalysis } from "./createEscHrTimeAnalysis.js";
import projectionSrc from "./trajectoryTiltingProjection.ts?raw";
import {
  projectAnalysisTiltingAlongRecordedPath,
  type TrajectoryTiltingRecordedSample,
} from "./trajectoryTiltingProjection.js";
import type {
  EscHrTimeAnalysisColumn,
  EscHrTimeAnalysisInputSample,
} from "./types.js";
import composeDemoSrc from "../../app/composeDemoTracerSimulation.ts?raw";
import createExploreLabSrc from "../../app/createExploreLab.ts?raw";
import createGuidedLabSrc from "../../app/createGuidedLab.ts?raw";
import appSrc from "../../app/App.tsx?raw";
import simulationSrc from "../../simulation/Simulation.ts?raw";
import tracerSceneSrc from "../../rendering/TracerScene.ts?raw";
import pathHistorySrc from "../../simulation/TracerPathHistory.ts?raw";

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

function syntheticColumn(): EscHrTimeAnalysisColumn {
  return createEscHrTimeAnalysis({
    samplingClass: ESC_HR_TIME_SAMPLING_CLASS,
    sourceIdentity: "synthetic-ramp",
    samples: rampSamples(0, 120),
  });
}

function heightAtTime(time: number): number {
  return 10 + time * 5;
}

function fullHeight(): number {
  return (heightAtTime(50) + heightAtTime(51)) / 2;
}

function boundaryHeight(): number {
  return (heightAtTime(0) + heightAtTime(1)) / 2;
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

class TimeRecordingUpdraft extends VerticalEnvelopeUpdraftField {
  readonly recordedTimes: number[] = [];

  override horizontalGradientOfVerticalVelocity(
    position: Vec3,
    time: number,
  ) {
    this.recordedTimes.push(time);
    return super.horizontalGradientOfVerticalVelocity(position, time);
  }
}

function sampleAt(
  x: number,
  y: number,
  z: number,
  simulationTime: number,
): TrajectoryTiltingRecordedSample {
  return {
    position: { x, y, z },
    simulationTime,
  };
}

describe("projectAnalysisTiltingAlongRecordedPath", () => {
  it("maps an empty recorded path to an empty projection", () => {
    const projection = projectAnalysisTiltingAlongRecordedPath(
      [],
      syntheticColumn(),
      prescribedUpdraft(),
    );
    expect(projection).toEqual([]);
  });

  it("preserves identity of a single recorded sample", () => {
    const column = syntheticColumn();
    const updraft = prescribedUpdraft();
    const recorded = sampleAt(500, fullHeight(), 300, 12);
    const projection = projectAnalysisTiltingAlongRecordedPath(
      [recorded],
      column,
      updraft,
    );

    expect(projection).toHaveLength(1);
    expect(projection[0]!.historyIndex).toBe(0);
    expect(projection[0]!.position).toEqual(recorded.position);
    expect(projection[0]!.position).not.toBe(recorded.position);
    expect(projection[0]!.simulationTime).toBe(12);
    expect(projection[0]!.analysis.status).toBe("FULL_SUPPORT");
  });

  it("preserves order, historyIndex, position, and time for several samples", () => {
    const column = syntheticColumn();
    const updraft = prescribedUpdraft();
    const recorded = [
      sampleAt(100, fullHeight(), 40, 1),
      sampleAt(200, boundaryHeight(), 80, 2),
      sampleAt(300, column.profile.minHeight - 5, 120, 3),
    ];
    const projection = projectAnalysisTiltingAlongRecordedPath(
      recorded,
      column,
      updraft,
    );

    expect(projection).toHaveLength(recorded.length);
    for (let i = 0; i < recorded.length; i++) {
      expect(projection[i]!.historyIndex).toBe(i);
      expect(projection[i]!.position).toEqual(recorded[i]!.position);
      expect(projection[i]!.simulationTime).toBe(recorded[i]!.simulationTime);
    }
  });

  it("forwards each recorded simulationTime, not a shared clock", () => {
    const column = syntheticColumn();
    const updraft = new TimeRecordingUpdraft({
      centerX: 0,
      centerZ: 0,
      peakVerticalVelocity: 20,
      sigma: 2000,
      baseHeight: 0,
      topHeight: 4000,
    });
    const recorded = [
      sampleAt(500, fullHeight(), 300, 0.1),
      sampleAt(500, fullHeight(), 300, 7.5),
      sampleAt(500, fullHeight(), 300, 41),
    ];
    const projection = projectAnalysisTiltingAlongRecordedPath(
      recorded,
      column,
      updraft,
    );

    expect(updraft.recordedTimes).toEqual([0.1, 7.5, 41]);
    expect(projection.map((sample) => sample.simulationTime)).toEqual([
      0.1, 7.5, 41,
    ]);
  });

  it("FULL_SUPPORT carries numeric T1 matching the atomic explanation", () => {
    const column = syntheticColumn();
    const updraft = prescribedUpdraft();
    const recorded = sampleAt(500, fullHeight(), 300, 4);
    const projection = projectAnalysisTiltingAlongRecordedPath(
      [recorded],
      column,
      updraft,
    );
    const direct = queryAnalysisTiltingExplanationAt(
      column,
      updraft,
      recorded.position,
      recorded.simulationTime,
    );

    expect(projection[0]!.analysis.status).toBe("FULL_SUPPORT");
    if (projection[0]!.analysis.status !== "FULL_SUPPORT") {
      throw new Error("expected FULL");
    }
    if (direct.status !== "FULL_SUPPORT") {
      throw new Error("expected FULL explanation");
    }
    expect("tiltingTendency" in projection[0]!.analysis).toBe(true);
    expect(projection[0]!.analysis.tiltingTendency).toBe(direct.tiltingTendency);
    expect(projection[0]!.analysis.tiltingTendency).not.toBe(0);
    expect(projection[0]!.analysis.segment).toEqual(direct.segment);
    expect(projection[0]!.analysis.provenance).toBe(direct.provenance);
    expect("worldHorizontalVorticity" in projection[0]!.analysis).toBe(false);
  });

  it("BOUNDARY_CONDITIONED keeps numeric T1 and never upgrades to FULL", () => {
    const column = syntheticColumn();
    const updraft = prescribedUpdraft();
    const recorded = sampleAt(500, boundaryHeight(), 300, 1);
    const projection = projectAnalysisTiltingAlongRecordedPath(
      [recorded],
      column,
      updraft,
    );
    const scalar = queryAnalysisTiltingTendencyAt(
      column,
      updraft,
      recorded.position,
      recorded.simulationTime,
    );

    expect(projection[0]!.analysis.status).toBe("BOUNDARY_CONDITIONED");
    expect(projection[0]!.analysis.status).not.toBe("FULL_SUPPORT");
    if (projection[0]!.analysis.status !== "BOUNDARY_CONDITIONED") {
      throw new Error("expected BOUNDARY");
    }
    if (scalar.status !== "BOUNDARY_CONDITIONED") {
      throw new Error("expected BOUNDARY scalar");
    }
    expect(projection[0]!.analysis.tiltingTendency).toBe(scalar.tiltingTendency);
  });

  it("OUT_OF_DOMAIN keeps recorded identity and has no numeric T1", () => {
    const column = syntheticColumn();
    const updraft = prescribedUpdraft();
    const recorded = sampleAt(500, column.profile.minHeight - 1, 300, 9);
    const projection = projectAnalysisTiltingAlongRecordedPath(
      [recorded],
      column,
      updraft,
    );

    expect(projection[0]!.historyIndex).toBe(0);
    expect(projection[0]!.position).toEqual(recorded.position);
    expect(projection[0]!.simulationTime).toBe(9);
    expect(projection[0]!.analysis.status).toBe("OUT_OF_DOMAIN");
    expect("tiltingTendency" in projection[0]!.analysis).toBe(false);
    expect(projection[0]!.analysis).toEqual({
      status: "OUT_OF_DOMAIN",
      representation: "Analysis",
      provenance: column.provenance,
    });
  });

  it("COLUMN_UNAVAILABLE keeps recorded identity, no numeric T1, no Source fallback", () => {
    const updraft = prescribedUpdraft();
    const recorded = [
      sampleAt(500, 260, 300, 1),
      sampleAt(600, 400, 200, 2),
    ];
    const missing = projectAnalysisTiltingAlongRecordedPath(
      recorded,
      null,
      updraft,
    );
    const undef = projectAnalysisTiltingAlongRecordedPath(
      recorded,
      undefined,
      updraft,
    );

    expect(missing).toHaveLength(2);
    expect(undef).toHaveLength(2);
    for (const projection of [missing, undef]) {
      for (let i = 0; i < recorded.length; i++) {
        expect(projection[i]!.historyIndex).toBe(i);
        expect(projection[i]!.position).toEqual(recorded[i]!.position);
        expect(projection[i]!.simulationTime).toBe(
          recorded[i]!.simulationTime,
        );
        expect(projection[i]!.analysis).toEqual({
          status: "COLUMN_UNAVAILABLE",
        });
        expect("tiltingTendency" in projection[i]!.analysis).toBe(false);
      }
    }
  });

  it("retains FULL → BOUNDARY → OOD → OOD → BOUNDARY → FULL re-entry in order", () => {
    const column = syntheticColumn();
    const updraft = prescribedUpdraft();
    const recorded = [
      sampleAt(500, fullHeight(), 300, 1),
      sampleAt(500, boundaryHeight(), 300, 2),
      sampleAt(500, column.profile.minHeight - 1, 300, 3),
      sampleAt(500, column.profile.maxHeight + 10, 300, 4),
      sampleAt(400, boundaryHeight(), 200, 5),
      sampleAt(600, fullHeight(), 100, 6),
    ];
    const projection = projectAnalysisTiltingAlongRecordedPath(
      recorded,
      column,
      updraft,
    );

    expect(projection.map((sample) => sample.analysis.status)).toEqual([
      "FULL_SUPPORT",
      "BOUNDARY_CONDITIONED",
      "OUT_OF_DOMAIN",
      "OUT_OF_DOMAIN",
      "BOUNDARY_CONDITIONED",
      "FULL_SUPPORT",
    ]);
    expect("tiltingTendency" in projection[2]!.analysis).toBe(false);
    expect("tiltingTendency" in projection[3]!.analysis).toBe(false);
    if (projection[5]!.analysis.status !== "FULL_SUPPORT") {
      throw new Error("expected re-entered FULL");
    }
    expect("tiltingTendency" in projection[5]!.analysis).toBe(true);
  });

  it("does not mutate recorded samples", () => {
    const column = syntheticColumn();
    const updraft = prescribedUpdraft();
    const recorded = [
      sampleAt(500, fullHeight(), 300, 1),
      sampleAt(500, 0, 300, 2),
    ];
    const before = structuredClone(recorded);
    const projection = projectAnalysisTiltingAlongRecordedPath(
      recorded,
      column,
      updraft,
    );
    projection[0]!.position.x = -999;
    expect(recorded).toEqual(before);
    expect(recorded[0]!.position.x).toBe(500);
  });

  it("evaluates exact recorded samples, not midpoints", () => {
    const column = syntheticColumn();
    const updraft = prescribedUpdraft();
    const y = fullHeight();
    const axis = sampleAt(0, y, 0, 3);
    const flank = sampleAt(800, y, 400, 4);
    const midpoint = {
      x: (axis.position.x + flank.position.x) / 2,
      y,
      z: (axis.position.z + flank.position.z) / 2,
    };
    const projection = projectAnalysisTiltingAlongRecordedPath(
      [axis, flank],
      column,
      updraft,
    );
    const axisDirect = queryAnalysisTiltingExplanationAt(
      column,
      updraft,
      axis.position,
      axis.simulationTime,
    );
    const flankDirect = queryAnalysisTiltingExplanationAt(
      column,
      updraft,
      flank.position,
      flank.simulationTime,
    );
    const midDirect = queryAnalysisTiltingExplanationAt(
      column,
      updraft,
      midpoint,
      3.5,
    );

    expect(axisDirect.status).toBe("FULL_SUPPORT");
    expect(flankDirect.status).toBe("FULL_SUPPORT");
    expect(midDirect.status).toBe("FULL_SUPPORT");
    if (
      axisDirect.status !== "FULL_SUPPORT" ||
      flankDirect.status !== "FULL_SUPPORT" ||
      midDirect.status !== "FULL_SUPPORT"
    ) {
      throw new Error("expected FULL samples");
    }
    expect(axisDirect.tiltingTendency).toBe(0);
    expect(flankDirect.tiltingTendency).not.toBe(0);
    expect(midDirect.tiltingTendency).not.toBe(axisDirect.tiltingTendency);
    expect(midDirect.tiltingTendency).not.toBe(flankDirect.tiltingTendency);

    if (projection[0]!.analysis.status !== "FULL_SUPPORT") {
      throw new Error("expected FULL axis projection");
    }
    if (projection[1]!.analysis.status !== "FULL_SUPPORT") {
      throw new Error("expected FULL flank projection");
    }
    expect(projection[0]!.analysis.tiltingTendency).toBe(
      axisDirect.tiltingTendency,
    );
    expect(projection[1]!.analysis.tiltingTendency).toBe(
      flankDirect.tiltingTendency,
    );
    expect(projection[0]!.analysis.tiltingTendency).not.toBe(
      midDirect.tiltingTendency,
    );
    expect(projection[1]!.analysis.tiltingTendency).not.toBe(
      midDirect.tiltingTendency,
    );
  });

  it("does not invent terminal or material-endpoint metadata at y = 0", () => {
    const column = syntheticColumn();
    const updraft = prescribedUpdraft();
    const recorded = [
      sampleAt(500, fullHeight(), 300, 1),
      sampleAt(10, 0, -20, 2),
    ];
    const projection = projectAnalysisTiltingAlongRecordedPath(
      recorded,
      column,
      updraft,
    );

    expect(projection[1]!.position.y).toBe(0);
    expect(projection[1]!).not.toHaveProperty("isTerminal");
    expect(projection[1]!).not.toHaveProperty("isMaterialEndpoint");
    expect(projection[1]!).not.toHaveProperty("clamped");
    expect(projection[1]!.analysis).not.toHaveProperty("isTerminal");
    expect(JSON.stringify(projection[1])).not.toMatch(
      /isTerminal|isMaterialEndpoint|clamped/,
    );
  });

  it("accepts TracerPathHistory samples without writing diagnostics onto history", () => {
    const column = syntheticColumn();
    const updraft = prescribedUpdraft();
    const history = new TracerPathHistory(1);
    history.captureInitial(
      [
        {
          position: { x: 500, y: fullHeight(), z: 300 },
          age: 0,
          active: true,
        },
      ],
      5,
    );
    const recorded = history.samplesFor(0);
    const projection = projectAnalysisTiltingAlongRecordedPath(
      recorded,
      column,
      updraft,
    );

    expect(projection).toHaveLength(1);
    expect(projection[0]!.simulationTime).toBe(5);
    expect(recorded[0]).toEqual({
      position: { x: 500, y: fullHeight(), z: 300 },
      simulationTime: 5,
    });
    expect(recorded[0]).not.toHaveProperty("tiltingTendency");
    expect(recorded[0]).not.toHaveProperty("analysis");
  });

  it("does not import React, Three, Simulation, or parcel/advection language", () => {
    expect(projectionSrc).toMatch(/queryAnalysisTiltingExplanationAt/);
    expect(projectionSrc).not.toMatch(/from ["']three["']/);
    expect(projectionSrc).not.toMatch(/from ["']react["']/);
    expect(projectionSrc).not.toMatch(/TracerPathHistory/);
    expect(projectionSrc).not.toMatch(/TracerScene/);
    expect(projectionSrc).not.toMatch(/DiagnosticTiltingTendency/);
    expect(projectionSrc).not.toMatch(/parcel/);
    expect(projectionSrc).not.toMatch(/spin-up/);
    expect(projectionSrc).not.toMatch(/delta omega/i);
    expect(projectionSrc).not.toMatch(/accumulate/);
    expect(projectionSrc).not.toMatch(/integrate T1/);
    expect(projectionSrc).not.toMatch(/analysisTrajectory/);
    expect(projectionSrc).not.toMatch(/analysisPath/);
    expect(projectionSrc).not.toMatch(/tiltingDrivenTrajectory/);
    expect(projectionSrc).not.toMatch(/T1_COLOR_SCALE/);
    expect(projectionSrc).not.toMatch(/THREE/);
    expect(projectionSrc).not.toMatch(/React/);
  });

  it("is not wired into live labs, App, Simulation, or TracerScene", () => {
    expect(composeDemoSrc).not.toMatch(
      /projectAnalysisTiltingAlongRecordedPath/,
    );
    expect(createExploreLabSrc).not.toMatch(
      /projectAnalysisTiltingAlongRecordedPath/,
    );
    expect(createGuidedLabSrc).not.toMatch(
      /projectAnalysisTiltingAlongRecordedPath/,
    );
    expect(appSrc).not.toMatch(/projectAnalysisTiltingAlongRecordedPath/);
    expect(simulationSrc).not.toMatch(
      /projectAnalysisTiltingAlongRecordedPath/,
    );
    expect(tracerSceneSrc).not.toMatch(
      /projectAnalysisTiltingAlongRecordedPath/,
    );
    expect(pathHistorySrc).not.toMatch(
      /projectAnalysisTiltingAlongRecordedPath/,
    );
  });
});
