import { describe, expect, it } from "vitest";
import { atmosphericVelocityToWorld } from "../../core/math/AtmosphericVelocity.js";
import { ingestNssl1Goshen2155Esc } from "./ingestNssl1Goshen2155Esc.js";
import { parseEscConcatenated } from "./parseEscConcatenated.js";
import { selectTargetSounding } from "./selectTargetSounding.js";
import { EscAdapterError } from "./types.js";
import {
  SYNTHETIC_AMBIGUOUS_2155_ESC,
  SYNTHETIC_CONCATENATED_ESC,
  SYNTHETIC_DUPLICATE_HEIGHT_ESC,
  SYNTHETIC_ONLY_2240_ESC,
  SYNTHETIC_SINGLE_KEPT_LEVEL_ESC,
} from "./fixtures/syntheticEsc.js";

describe("NSSL/MGAUS ESC adapter (synthetic fixtures)", () => {
  it("selects the 21:55:22 NSSL1 block by header identity, not ordinal", () => {
    const blocks = parseEscConcatenated(SYNTHETIC_CONCATENATED_ESC);
    expect(blocks).toHaveLength(3);
    expect(blocks[0]!.header.siteId).toContain("NSSL2");
    expect(blocks[2]!.header.utcReleaseTime).toBe("2009, 06, 05, 22:40:06");

    const selected = selectTargetSounding(blocks);
    expect(selected.header.siteId).toBe("Bushnell/NSSL1");
    expect(selected.header.utcReleaseTime).toBe("2009, 06, 05, 21:55:22");
    expect(selected.header.launchElevation).toBe(1557.9);
  });

  it("rejects a Bushnell/NSSL1 22:40:06 sibling as the target", () => {
    expect(() => ingestNssl1Goshen2155Esc(SYNTHETIC_ONLY_2240_ESC)).toThrow(
      EscAdapterError,
    );
    expect(() => ingestNssl1Goshen2155Esc(SYNTHETIC_ONLY_2240_ESC)).toThrow(
      /no sounding with NSSL1/,
    );
  });

  it("fails when the 21:55:22 identity is ambiguous", () => {
    expect(() => ingestNssl1Goshen2155Esc(SYNTHETIC_AMBIGUOUS_2155_ESC)).toThrow(
      /more than one/,
    );
  });

  it("drops t=-1, missing U/V, missing Alt, and BAD QC without inventing Y=0 or filling gaps", () => {
    const record = ingestNssl1Goshen2155Esc(SYNTHETIC_CONCATENATED_ESC);
    const heights = record.profile.levelHeights();

    expect(heights).toEqual([2.4, 12.1, 242.1, 1242.1]);
    expect(heights.includes(0)).toBe(false);
    expect(record.profile.minHeight).toBe(2.4);

    expect(record.profile.sampleAtHeight(2.4)).toEqual({
      eastward: -1.2,
      northward: 0.2,
      vertical: 0,
    });
    expect(record.profile.sampleAtHeight(12.1)).toEqual({
      eastward: 10.0,
      northward: 4.0,
      vertical: 0,
    });
    expect(record.profile.sampleAtHeight(1242.1)).toEqual({
      eastward: 14.0,
      northward: 8.0,
      vertical: 0,
    });

    expect(record.provenance.coverage).toEqual({
      minHeight: 2.4,
      maxHeight: 1242.1,
      nativeDataRecordCount: 8,
      keptLevelCount: 4,
      droppedLevelCount: 4,
      gapSpansOver50m: [
        { fromHeight: 12.1, toHeight: 242.1, delta: 230 },
        { fromHeight: 242.1, toHeight: 1242.1, delta: 1000 },
      ],
    });
  });

  it("maps ESC U to eastward and ESC V to northward with world-sign checks", () => {
    const record = ingestNssl1Goshen2155Esc(SYNTHETIC_CONCATENATED_ESC);
    const at12 = record.profile.sampleAtHeight(12.1);
    expect(at12.eastward).toBe(10);
    expect(at12.northward).toBe(4);
    expect(at12.vertical).toBe(0);

    const world = atmosphericVelocityToWorld(at12);
    expect(world.x).toBeGreaterThan(0);
    expect(world.z).toBeLessThan(0);
    expect(world.x).toBe(10);
    expect(world.z).toBe(-4);
    expect(world.y).toBe(0);
  });

  it("does not import Wcmp as profile vertical", () => {
    const record = ingestNssl1Goshen2155Esc(SYNTHETIC_CONCATENATED_ESC);
    expect(record.profile.sampleAtHeight(12.1).vertical).toBe(0);
  });

  it("uses header launch lat/lon, not a later GPS, as record location", () => {
    const record = ingestNssl1Goshen2155Esc(SYNTHETIC_CONCATENATED_ESC);
    expect(record.provenance.location).toEqual({
      latitude: 41.278,
      longitude: -103.893,
    });
    expect(record.provenance.sourceClass).toBe("observed-raob");
    expect(record.provenance.validTime).toBe("2009-06-05 21:55:22 UTC");
  });

  it("fails on duplicate heights after conversion", () => {
    expect(() => ingestNssl1Goshen2155Esc(SYNTHETIC_DUPLICATE_HEIGHT_ESC)).toThrow(
      /strictly increasing/,
    );
  });

  it("fails when fewer than two usable wind levels remain", () => {
    expect(() =>
      ingestNssl1Goshen2155Esc(SYNTHETIC_SINGLE_KEPT_LEVEL_ESC),
    ).toThrow(/fewer than 2/);
  });
});
