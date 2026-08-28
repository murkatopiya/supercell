import { describe, expect, it } from "vitest";
import { createEscHrTimeAnalysis } from "../escHrTimeAnalysis/createEscHrTimeAnalysis.js";
import { EscAnalysisError } from "../escHrTimeAnalysis/EscAnalysisError.js";
import {
  NSSL1_GOSHEN_2155_SPEC,
  NSSL1_PROSPECT_VALLEY_222346_SPEC,
} from "./escObservedSoundingSpec.js";
import { ingestEscObservedWindMeasurements } from "./ingestEscObservedWindMeasurements.js";
import { ingestNssl1Goshen2155Esc } from "./ingestNssl1Goshen2155Esc.js";
import { ingestNssl1ProspectValley222346Esc } from "./ingestNssl1ProspectValley222346Esc.js";
import {
  SYNTHETIC_CONCATENATED_ESC,
  SYNTHETIC_PROSPECT_CONCATENATED_ESC,
} from "./fixtures/syntheticEsc.js";

describe("ESC measurement-record TIME carrier", () => {
  it("retains I1 TIME without changing Source V(h)", () => {
    const source = ingestNssl1Goshen2155Esc(SYNTHETIC_CONCATENATED_ESC);
    const measurements = ingestEscObservedWindMeasurements(
      SYNTHETIC_CONCATENATED_ESC,
      NSSL1_GOSHEN_2155_SPEC,
    );

    expect(measurements.provenance.samplingClass).toBe(
      "high-resolution-mobile-esc",
    );
    expect(measurements.samples.map((sample) => sample.time)).toEqual([
      0, 1, 3, 6,
    ]);
    expect(source.profile.levelHeights()).toEqual(
      measurements.samples.map((sample) => sample.height),
    );
    expect(source.profile.sampleAtHeight(2.4)).toEqual({
      eastward: measurements.samples[0]!.eastward,
      northward: measurements.samples[0]!.northward,
      vertical: 0,
    });
    expect("time" in source.profile.sampleAtHeight(2.4)).toBe(false);
    expect(() =>
      createEscHrTimeAnalysis({
        samplingClass: measurements.provenance.samplingClass,
        sourceIdentity: measurements.provenance.sourceIdentity,
        samples: measurements.samples,
      }),
    ).toThrow(EscAnalysisError);
  });

  it("keeps negative first TIME when I1 keeps the row", () => {
    const source = ingestNssl1ProspectValley222346Esc(
      SYNTHETIC_PROSPECT_CONCATENATED_ESC,
    );
    const measurements = ingestEscObservedWindMeasurements(
      SYNTHETIC_PROSPECT_CONCATENATED_ESC,
      NSSL1_PROSPECT_VALLEY_222346_SPEC,
    );
    expect(measurements.samples[0]!.time).toBe(-1);
    expect(measurements.samples[0]!.height).toBe(-0.1);
    expect(source.profile.minHeight).toBe(-0.1);
    expect(source.profile.levelHeights()).toEqual(
      measurements.samples.map((sample) => sample.height),
    );
  });
});
