import { describe, expect, it } from "vitest";
import { EnvironmentalWindProfile } from "../../physics/environment/EnvironmentalWindProfile.js";
import {
  DiagnosticTiltingTendency,
  worldHorizontalVorticityFromAtmospheric,
} from "../../physics/diagnostics/DiagnosticTiltingTendency.js";
import { VerticalEnvelopeUpdraftField } from "../../physics/storm/VerticalEnvelopeUpdraftField.js";
import type { Vec3 } from "../../core/math/Vec3.js";
import { OUN_MOORE_20130520_SPEC } from "../igra/igraObservedSoundingSpec.js";
import {
  queryAnalysisNativeSegmentVorticityAt,
  queryAnalysisWindAt,
} from "./analysisQuery.js";
import analysisTiltingQuerySrc from "./analysisTiltingQuery.ts?raw";
import {
  ANALYSIS_TILTING_ENVIRONMENTAL_OPERAND,
  ANALYSIS_TILTING_PHYSICAL_IDENTITY,
  ANALYSIS_TILTING_STORM_LOCAL_OPERAND,
  queryAnalysisTiltingTendencyAt,
} from "./analysisTiltingQuery.js";
import { EscAnalysisError } from "./EscAnalysisError.js";
import { COARSE_OPERATIONAL_RAOB, ESC_HR_TIME_SAMPLING_CLASS } from "./constants.js";
import { createEscHrTimeAnalysis } from "./createEscHrTimeAnalysis.js";
import type { EscHrTimeAnalysisColumn, EscHrTimeAnalysisInputSample } from "./types.js";
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

function expectedLaboratoryTilting(
  vorticity: {
    omegaEastward: number;
    omegaNorthward: number;
  },
  updraft: VerticalEnvelopeUpdraftField,
  position: Vec3,
  time: number,
): number {
  const world = worldHorizontalVorticityFromAtmospheric(vorticity);
  const gradient = updraft.horizontalGradientOfVerticalVelocity(
    position,
    time,
  );
  const tiltingTendency =
    world.omegaX * gradient.dVyDx + world.omegaZ * gradient.dVyDz;
  return tiltingTendency === 0 ? 0 : tiltingTendency;
}

describe("queryAnalysisTiltingTendencyAt", () => {
  it("returns COLUMN_UNAVAILABLE without a numeric T1 or Source fallback", () => {
    const updraft = prescribedUpdraft();
    const missing = queryAnalysisTiltingTendencyAt(
      null,
      updraft,
      { x: 500, y: 260, z: 300 },
      0,
    );
    expect(missing).toEqual({ status: "COLUMN_UNAVAILABLE" });
    expect("tiltingTendency" in missing).toBe(false);
    expect("provenance" in missing).toBe(false);

    const undef = queryAnalysisTiltingTendencyAt(
      undefined,
      updraft,
      { x: 500, y: 260, z: 300 },
      0,
    );
    expect(undef.status).toBe("COLUMN_UNAVAILABLE");
    expect("tiltingTendency" in undef).toBe(false);
  });

  it("rejects non-finite P or t as a broken invariant, not COLUMN_UNAVAILABLE", () => {
    const column = syntheticColumn();
    const updraft = prescribedUpdraft();
    const ok: Vec3 = { x: 500, y: 260, z: 300 };
    expect(() =>
      queryAnalysisTiltingTendencyAt(column, updraft, {
        ...ok,
        x: Number.NaN,
      }, 0),
    ).toThrow(EscAnalysisError);
    expect(() =>
      queryAnalysisTiltingTendencyAt(column, updraft, {
        ...ok,
        y: Number.POSITIVE_INFINITY,
      }, 0),
    ).toThrow(/position.y must be finite/);
    expect(() =>
      queryAnalysisTiltingTendencyAt(column, updraft, {
        ...ok,
        z: Number.NEGATIVE_INFINITY,
      }, 0),
    ).toThrow(EscAnalysisError);
    expect(() =>
      queryAnalysisTiltingTendencyAt(column, updraft, ok, Number.NaN),
    ).toThrow(/time must be finite/);
    expect(
      queryAnalysisTiltingTendencyAt(null, updraft, ok, 0).status,
    ).toBe("COLUMN_UNAVAILABLE");
  });

  it("returns OUT_OF_DOMAIN with no numeric T1 even when prescribed ∇_h Vy is nonzero", () => {
    const column = syntheticColumn();
    const updraft = prescribedUpdraft();
    const below: Vec3 = { x: 500, y: column.profile.minHeight - 1, z: 300 };
    const gradient = updraft.horizontalGradientOfVerticalVelocity(below, 0);
    expect(gradient.dVyDx).not.toBe(0);

    const result = queryAnalysisTiltingTendencyAt(column, updraft, below, 0);
    expect(result.status).toBe("OUT_OF_DOMAIN");
    if (result.status !== "OUT_OF_DOMAIN") {
      throw new Error("expected OUT_OF_DOMAIN");
    }
    expect(result.representation).toBe("Analysis");
    expect(result.provenance).toBe(column.provenance);
    expect("tiltingTendency" in result).toBe(false);

    const above = queryAnalysisTiltingTendencyAt(
      column,
      updraft,
      { x: 500, y: column.profile.maxHeight + 10, z: 300 },
      0,
    );
    expect(above.status).toBe("OUT_OF_DOMAIN");
    expect("tiltingTendency" in above).toBe(false);
  });

  it("does not use legacy DiagnosticTiltingTendency 0 for Analysis out-of-domain", () => {
    const column = syntheticColumn();
    const updraft = prescribedUpdraft();
    const below: Vec3 = { x: 500, y: column.profile.minHeight - 1, z: 300 };
    const legacy = new DiagnosticTiltingTendency({
      profile: column.profile,
      updraft,
    });
    expect(legacy.sample(below, 0)).toBe(0);
    const analysis = queryAnalysisTiltingTendencyAt(
      column,
      updraft,
      below,
      0,
    );
    expect(analysis.status).toBe("OUT_OF_DOMAIN");
    expect("tiltingTendency" in analysis).toBe(false);
  });

  it("FULL ω_h → FULL laboratory T1 matching the production identity", () => {
    const column = syntheticColumn();
    const updraft = prescribedUpdraft();
    const height = (heightAtTime(50) + heightAtTime(51)) / 2;
    const position: Vec3 = { x: 500, y: height, z: 300 };
    const vorticity = queryAnalysisNativeSegmentVorticityAt(column, height);
    const result = queryAnalysisTiltingTendencyAt(
      column,
      updraft,
      position,
      0,
    );

    expect(vorticity.status).toBe("FULL_SUPPORT");
    expect(result.status).toBe("FULL_SUPPORT");
    if (result.status !== "FULL_SUPPORT") {
      throw new Error("expected FULL_SUPPORT T1");
    }
    if (vorticity.status !== "FULL_SUPPORT") {
      throw new Error("expected FULL_SUPPORT ω_h");
    }
    expect(result.tiltingTendency).toBe(
      expectedLaboratoryTilting(
        vorticity.vorticity,
        updraft,
        position,
        0,
      ),
    );
    expect(result.tiltingTendency).not.toBe(0);
    expect(result.representation).toBe("Analysis");
    expect(result.method).toBe("native-containing-segment");
    expect(result.physicalIdentity).toBe(ANALYSIS_TILTING_PHYSICAL_IDENTITY);
    expect(result.environmentalOperand).toBe(
      ANALYSIS_TILTING_ENVIRONMENTAL_OPERAND,
    );
    expect(result.stormLocalOperand).toBe(
      ANALYSIS_TILTING_STORM_LOCAL_OPERAND,
    );
    expect(result.segment).toEqual(vorticity.segment);
    expect(result.provenance).toBe(column.provenance);
  });

  it("BOUNDARY ω_h → BOUNDARY laboratory T1, never FULL, matching identity", () => {
    const column = syntheticColumn();
    const updraft = prescribedUpdraft();
    const height = (heightAtTime(0) + heightAtTime(1)) / 2;
    const position: Vec3 = { x: 500, y: height, z: 300 };
    const vorticity = queryAnalysisNativeSegmentVorticityAt(column, height);
    const result = queryAnalysisTiltingTendencyAt(
      column,
      updraft,
      position,
      0,
    );

    expect(vorticity.status).toBe("BOUNDARY_CONDITIONED");
    expect(result.status).toBe("BOUNDARY_CONDITIONED");
    expect(result.status).not.toBe("FULL_SUPPORT");
    if (result.status !== "BOUNDARY_CONDITIONED") {
      throw new Error("expected BOUNDARY T1");
    }
    if (vorticity.status !== "BOUNDARY_CONDITIONED") {
      throw new Error("expected BOUNDARY ω_h");
    }
    expect(result.tiltingTendency).toBe(
      expectedLaboratoryTilting(
        vorticity.vorticity,
        updraft,
        position,
        0,
      ),
    );
    expect("tiltingTendency" in result).toBe(true);
  });

  it("does not upgrade last FULL knot with BOUNDARY derivative to FULL T1", () => {
    const column = syntheticColumn();
    const updraft = prescribedUpdraft();
    const height = heightAtTime(80);
    expect(column.support[80]).toBe("FULL_SUPPORT");
    expect(column.support[81]).toBe("BOUNDARY_CONDITIONED");

    const wind = queryAnalysisWindAt(column, height);
    const vorticity = queryAnalysisNativeSegmentVorticityAt(column, height);
    const result = queryAnalysisTiltingTendencyAt(
      column,
      updraft,
      { x: 500, y: height, z: 300 },
      0,
    );

    expect(wind.status).toBe("FULL_SUPPORT");
    expect(vorticity.status).toBe("BOUNDARY_CONDITIONED");
    expect(result.status).toBe("BOUNDARY_CONDITIONED");
    if (result.status !== "BOUNDARY_CONDITIONED") {
      throw new Error("expected BOUNDARY T1 at last FULL knot");
    }
    if (vorticity.status !== "BOUNDARY_CONDITIONED") {
      throw new Error("expected BOUNDARY ω_h");
    }
    expect(result.tiltingTendency).toBe(
      expectedLaboratoryTilting(
        vorticity.vorticity,
        updraft,
        { x: 500, y: height, z: 300 },
        0,
      ),
    );
  });

  it("axis FULL ω_h yields FULL T1 with physical +0, distinct from unavailable", () => {
    const column = syntheticColumn();
    const updraft = prescribedUpdraft();
    const height = (heightAtTime(50) + heightAtTime(51)) / 2;
    const axis: Vec3 = { x: 0, y: height, z: 0 };
    const gradient = updraft.horizontalGradientOfVerticalVelocity(axis, 0);
    expect(gradient.dVyDx).toBe(0);
    expect(gradient.dVyDz).toBe(0);

    const result = queryAnalysisTiltingTendencyAt(column, updraft, axis, 0);
    expect(result.status).toBe("FULL_SUPPORT");
    if (result.status !== "FULL_SUPPORT") {
      throw new Error("expected FULL physical zero");
    }
    expect(result.tiltingTendency).toBe(0);
    expect(Object.is(result.tiltingTendency, 0)).toBe(true);
    expect(Object.is(result.tiltingTendency, -0)).toBe(false);
    expect(result.status).not.toBe("OUT_OF_DOMAIN");
    expect(result.status).not.toBe("COLUMN_UNAVAILABLE");
    expect(result.status).not.toBe("BOUNDARY_CONDITIONED");
  });

  it("F = 0 with FULL ω_h is FULL T1 + 0, not OUT_OF_DOMAIN", () => {
    const column = syntheticColumn();
    const lidUpdraft = new VerticalEnvelopeUpdraftField({
      centerX: 0,
      centerZ: 0,
      peakVerticalVelocity: 20,
      sigma: 2000,
      baseHeight: 0,
      topHeight: 100,
    });
    const height = (heightAtTime(50) + heightAtTime(51)) / 2;
    expect(height).toBeGreaterThan(100);
    const position: Vec3 = { x: 500, y: height, z: 300 };
    expect(
      queryAnalysisNativeSegmentVorticityAt(column, height).status,
    ).toBe("FULL_SUPPORT");
    const result = queryAnalysisTiltingTendencyAt(
      column,
      lidUpdraft,
      position,
      0,
    );
    expect(result.status).toBe("FULL_SUPPORT");
    if (result.status !== "FULL_SUPPORT") {
      throw new Error("expected FULL T1 with F=0");
    }
    expect(result.tiltingTendency).toBe(0);
    expect(Object.is(result.tiltingTendency, 0)).toBe(true);
  });

  it("forwards laboratory time to the prescribed updraft gradient", () => {
    const column = syntheticColumn();
    const updraft = prescribedUpdraft();
    const height = (heightAtTime(50) + heightAtTime(51)) / 2;
    const position: Vec3 = { x: 500, y: height, z: 300 };
    const atZero = queryAnalysisTiltingTendencyAt(
      column,
      updraft,
      position,
      0,
    );
    const later = queryAnalysisTiltingTendencyAt(
      column,
      updraft,
      position,
      99,
    );
    expect(atZero.status).toBe("FULL_SUPPORT");
    expect(later.status).toBe(atZero.status);
    if (atZero.status !== "FULL_SUPPORT" || later.status !== "FULL_SUPPORT") {
      throw new Error("expected FULL T1");
    }
    expect(later.tiltingTendency).toBe(atZero.tiltingTendency);
  });

  it("does not call DiagnosticTiltingTendency.sample or construct live T1", () => {
    expect(analysisTiltingQuerySrc).not.toMatch(
      /DiagnosticTiltingTendency\.sample\s*\(/,
    );
    expect(analysisTiltingQuerySrc).not.toMatch(
      /new DiagnosticTiltingTendency/,
    );
    expect(analysisTiltingQuerySrc).toMatch(
      /queryAnalysisNativeSegmentVorticityAt/,
    );
    expect(analysisTiltingQuerySrc).toMatch(
      /worldHorizontalVorticityFromAtmospheric/,
    );
    expect(analysisTiltingQuerySrc).toMatch(
      /horizontalGradientOfVerticalVelocity/,
    );
    expect(analysisTiltingQuerySrc).not.toMatch(/goshenObservedEnvironment/);
    expect(analysisTiltingQuerySrc).not.toMatch(/observed tilting tendency/);
    expect(analysisTiltingQuerySrc).not.toMatch(/measured tilting/);
    expect(analysisTiltingQuerySrc).not.toMatch(/reconstructed supercell/);
  });

  it("is not wired into live Explore, Guided, App, or point diagnostics", () => {
    expect(composeDemoSrc).not.toMatch(/queryAnalysisTiltingTendencyAt/);
    expect(createExploreLabSrc).not.toMatch(/queryAnalysisTiltingTendencyAt/);
    expect(createGuidedLabSrc).not.toMatch(/queryAnalysisTiltingTendencyAt/);
    expect(appSrc).not.toMatch(/queryAnalysisTiltingTendencyAt/);
    expect(pointDiagnosticSrc).not.toMatch(/queryAnalysisTiltingTendencyAt/);
  });
});

describe("Moore / coarse-operational-raob Analysis T1", () => {
  it("is COLUMN_UNAVAILABLE without fake TIME or Source numeric T1", () => {
    expect(() =>
      createEscHrTimeAnalysis({
        samplingClass: COARSE_OPERATIONAL_RAOB,
        sourceIdentity: OUN_MOORE_20130520_SPEC.sourceIdentity,
        samples: rampSamples(0, 120),
      }),
    ).toThrow(EscAnalysisError);

    const updraft = prescribedUpdraft();
    const source = new EnvironmentalWindProfile([
      {
        height: 0,
        velocity: { eastward: 5, northward: 10, vertical: 0 },
      },
      {
        height: 3000,
        velocity: { eastward: 15, northward: 20, vertical: 0 },
      },
    ]);
    const result = queryAnalysisTiltingTendencyAt(
      null,
      updraft,
      { x: 500, y: 1500, z: 300 },
      0,
    );
    expect(result.status).toBe("COLUMN_UNAVAILABLE");
    expect("tiltingTendency" in result).toBe(false);

    const sourceT1 = new DiagnosticTiltingTendency({
      profile: source,
      updraft,
    });
    expect(sourceT1.sample({ x: 500, y: 1500, z: 300 }, 0)).not.toBe(0);
  });
});

describe("legacy DiagnosticTiltingTendency remains a number API", () => {
  it("still returns 0 outside sounding on the support-unaware path", () => {
    const column = syntheticColumn();
    const updraft = prescribedUpdraft();
    const t1 = new DiagnosticTiltingTendency({
      profile: column.profile,
      updraft,
    });
    expect(typeof t1.sample({ x: 500, y: 260, z: 300 }, 0)).toBe("number");
    expect(
      t1.sample({ x: 500, y: column.profile.minHeight - 1, z: 300 }, 0),
    ).toBe(0);
  });
});
