import { describe, expect, it } from "vitest";
import { atmosphericVelocityToWorld } from "../../core/math/AtmosphericVelocity.js";
import { igraWindFromDirectionSpeed } from "./convertIgraWind.js";
import {
  MOORE_HEADER_RAW,
  SENTINEL_DROP_SPEC,
  SMALL_MOORE_SPEC,
  SYNTHETIC_AMBIGUOUS_MOORE_IGRA,
  SYNTHETIC_DUPLICATE_HEIGHT_IGRA,
  SYNTHETIC_INVALID_WDIR_IGRA,
  SYNTHETIC_MOORE_CONCATENATED_IGRA,
  SYNTHETIC_MOORE_INVERSION_IGRA,
  SYNTHETIC_ONLY_SIBLING_RELTIME_IGRA,
  SYNTHETIC_SENTINEL_DROP_IGRA,
  SYNTHETIC_SINGLE_KEPT_LEVEL_IGRA,
  SYNTHETIC_WRONG_NP_SRC_IGRA,
  SYNTHETIC_WRONG_NUMLEV_IGRA,
  SYNTHETIC_WRONG_P_SRC_IGRA,
  SYNTHETIC_WRONG_SURFACE_DATUM_IGRA,
  THREE_LEVEL_SPEC,
  TWO_LEVEL_SPEC,
  igraDataLine,
  igraHeaderLine,
  soundingBlock,
} from "./fixtures/syntheticIgra.js";
import { OUN_MOORE_20130520_SPEC } from "./igraObservedSoundingSpec.js";
import { ingestObservedIgra } from "./ingestObservedIgra.js";
import { ingestOunMoore20130520Igra } from "./ingestOunMoore20130520Igra.js";
import { parseIgraHeaderLine, parseIgraDataLine } from "./parseIgraLine.js";
import { parseIgraPor } from "./parseIgraPor.js";
import { selectIgraSounding } from "./selectIgraSounding.js";
import { IgraAdapterError } from "./types.js";

function syntheticMoore165Named(): string {
  const records: string[] = [
    igraDataLine({
      lvltyp1: 2,
      lvltyp2: 1,
      etime: 0,
      press: 96638,
      gph: 345,
      wdir: 185,
      wspd: 51,
    }),
  ];
  records.push(
    igraDataLine({
      gph: 345 + 164 * 10,
      wdir: 90,
      wspd: 100,
      press: 1000,
    }),
  );
  for (let i = 1; i <= 163; i++) {
    records.push(
      igraDataLine({
        gph: 345 + i * 10,
        wdir: 270,
        wspd: 50,
        press: i === 2 ? -9999 : 90000,
      }),
    );
  }
  return soundingBlock(igraHeaderLine({ numlev: 165 }), records);
}

describe("IGRA v2.2 parser", () => {
  it("parses the exact Moore header identity and location", () => {
    expect(igraHeaderLine({ numlev: 165 })).toBe(MOORE_HEADER_RAW);
    const header = parseIgraHeaderLine(MOORE_HEADER_RAW);
    expect(header).toEqual({
      stationId: "USM00072357",
      year: 2013,
      month: 5,
      day: 20,
      hour: 17,
      reltime: 1651,
      numlev: 165,
      pSrc: "ncdc6301",
      npSrc: "ncdc6301",
      latitude: 35.1808,
      longitude: -97.4378,
    });
  });

  it("parses sentinels as native integers, not coerced blanks", () => {
    const missing = parseIgraDataLine(
      igraDataLine({ gph: -9999, wdir: -8888, wspd: -9999, press: -9999 }),
    );
    expect(missing.gph).toBe(-9999);
    expect(missing.wdir).toBe(-8888);
    expect(missing.wspd).toBe(-9999);
    expect(missing.press).toBe(-9999);
  });

  it("fails loudly on an empty required numeric field", () => {
    const blankGph = igraDataLine({
      gph: 345,
      wdir: 90,
      wspd: 10,
    }).replace(igraDataLine({ gph: 345, wdir: 90, wspd: 10 }).slice(16, 21), "     ");
    expect(() => parseIgraDataLine(blankGph)).toThrow(IgraAdapterError);
    expect(() => parseIgraDataLine(blankGph)).toThrow(/GPH is empty/);
  });

  it("keeps PRESS missing on a structurally valid GPH/wind level", () => {
    const record = parseIgraDataLine(
      igraDataLine({
        gph: 707,
        wdir: 180,
        wspd: 80,
        press: -9999,
      }),
    );
    expect(record.press).toBe(-9999);
    expect(record.gph).toBe(707);
    expect(record.wdir).toBe(180);
    expect(record.wspd).toBe(80);
  });
});

describe("IGRA sounding selector", () => {
  it("selects Moore by exact identity keys, not ordinal", () => {
    const blocks = parseIgraPor(SYNTHETIC_MOORE_CONCATENATED_IGRA);
    expect(blocks).toHaveLength(3);
    const selected = selectIgraSounding(blocks, SMALL_MOORE_SPEC);
    expect(selected.header.hour).toBe(17);
    expect(selected.header.reltime).toBe(1651);
    expect(selected.header.numlev).toBe(4);
    expect(selected.records).toHaveLength(4);
  });

  it("fails when RELTIME does not match", () => {
    expect(() =>
      ingestObservedIgra(SYNTHETIC_ONLY_SIBLING_RELTIME_IGRA, SMALL_MOORE_SPEC),
    ).toThrow(IgraAdapterError);
    expect(() =>
      ingestObservedIgra(SYNTHETIC_ONLY_SIBLING_RELTIME_IGRA, SMALL_MOORE_SPEC),
    ).toThrow(/no sounding/);
  });

  it("fails when the identity is missing", () => {
    expect(() =>
      ingestObservedIgra(SYNTHETIC_ONLY_SIBLING_RELTIME_IGRA, SMALL_MOORE_SPEC),
    ).toThrow(/HOUR 17 RELTIME 1651/);
  });

  it("fails when the identity is duplicated", () => {
    expect(() =>
      ingestObservedIgra(SYNTHETIC_AMBIGUOUS_MOORE_IGRA, SMALL_MOORE_SPEC),
    ).toThrow(/more than one/);
  });
});

describe("IGRA header validation", () => {
  it("fails when NUMLEV does not match the parsed record count", () => {
    expect(() =>
      ingestObservedIgra(SYNTHETIC_WRONG_NUMLEV_IGRA, {
        ...SMALL_MOORE_SPEC,
        expectedNumlev: 5,
      }),
    ).toThrow(/parsed 4 data records, header NUMLEV is 5/);
  });

  it("fails when NUMLEV does not match the case spec", () => {
    expect(() =>
      ingestObservedIgra(SYNTHETIC_MOORE_INVERSION_IGRA, OUN_MOORE_20130520_SPEC),
    ).toThrow(/NUMLEV must be 165, got 4/);
  });

  it("fails when P_SRC does not match the case spec", () => {
    expect(() =>
      ingestObservedIgra(SYNTHETIC_WRONG_P_SRC_IGRA, SMALL_MOORE_SPEC),
    ).toThrow(/P_SRC must be ncdc6301/);
  });

  it("fails when NP_SRC does not match the case spec", () => {
    expect(() =>
      ingestObservedIgra(SYNTHETIC_WRONG_NP_SRC_IGRA, SMALL_MOORE_SPEC),
    ).toThrow(/NP_SRC must be ncdc6301/);
  });

  it("fails when the surface GPH is not the locked datum", () => {
    expect(() =>
      ingestObservedIgra(SYNTHETIC_WRONG_SURFACE_DATUM_IGRA, SMALL_MOORE_SPEC),
    ).toThrow(/surface GPH must be 345, got 344/);
  });
});

describe("IGRA wind conversion and normalization", () => {
  it("maps FROM 270° to positive eastward and FROM 180° to positive northward", () => {
    const fromWest = igraWindFromDirectionSpeed(270, 100);
    expect(fromWest.eastward).toBeCloseTo(10, 12);
    expect(fromWest.northward).toBeCloseTo(0, 12);
    expect(fromWest.vertical).toBe(0);

    const fromSouth = igraWindFromDirectionSpeed(180, 80);
    expect(fromSouth.eastward).toBeCloseTo(0, 12);
    expect(fromSouth.northward).toBeCloseTo(8, 12);

    const worldWest = atmosphericVelocityToWorld({
      eastward: fromWest.eastward,
      northward: fromWest.northward,
      vertical: 0,
    });
    expect(worldWest.x).toBeGreaterThan(0);
    expect(worldWest.z).toBeCloseTo(0, 12);
  });

  it("divides WSPD by 10 with no rounding of worldY", () => {
    const record = ingestObservedIgra(
      SYNTHETIC_MOORE_INVERSION_IGRA,
      SMALL_MOORE_SPEC,
    );
    expect(record.profile.sampleAtHeight(0)).toEqual({
      eastward: igraWindFromDirectionSpeed(185, 51).eastward,
      northward: igraWindFromDirectionSpeed(185, 51).northward,
      vertical: 0,
    });
    expect(record.profile.minHeight).toBe(0);
    expect(record.profile.levelHeights()).toEqual([0, 362, 500, 30700]);
  });

  it("drops sentinel GPH/WDIR/WSPD and keeps PRESS-missing levels", () => {
    const record = ingestObservedIgra(
      SYNTHETIC_SENTINEL_DROP_IGRA,
      SENTINEL_DROP_SPEC,
    );
    expect(record.profile.levelHeights()).toEqual([0, 300, 400]);
    expect(record.provenance.coverage).toEqual({
      minHeight: 0,
      maxHeight: 400,
      nativeDataRecordCount: 6,
      keptLevelCount: 3,
      droppedLevelCount: 3,
      gapSpansOver50m: [
        { fromHeight: 0, toHeight: 300, delta: 300 },
        { fromHeight: 300, toHeight: 400, delta: 100 },
      ],
    });
  });

  it("fails the sounding on a non-sentinel out-of-range WDIR", () => {
    expect(() =>
      ingestObservedIgra(SYNTHETIC_INVALID_WDIR_IGRA, THREE_LEVEL_SPEC),
    ).toThrow(/WDIR at native index 1 is out of range: 361/);
  });

  it("stable-sorts mixed native packing by worldY before coverage", () => {
    const record = ingestObservedIgra(
      SYNTHETIC_MOORE_INVERSION_IGRA,
      SMALL_MOORE_SPEC,
    );
    expect(record.profile.levelHeights()).toEqual([0, 362, 500, 30700]);
    expect(record.profile.sampleAtHeight(362)).toEqual({
      eastward: igraWindFromDirectionSpeed(180, 80).eastward,
      northward: igraWindFromDirectionSpeed(180, 80).northward,
      vertical: 0,
    });
    expect(record.profile.sampleAtHeight(500)).toEqual({
      eastward: igraWindFromDirectionSpeed(270, 50).eastward,
      northward: igraWindFromDirectionSpeed(270, 50).northward,
      vertical: 0,
    });
    expect(record.profile.sampleAtHeight(30700).eastward).toBeCloseTo(-10, 12);
    expect(record.provenance.coverage.gapSpansOver50m).toEqual([
      { fromHeight: 0, toHeight: 362, delta: 362 },
      { fromHeight: 362, toHeight: 500, delta: 138 },
      { fromHeight: 500, toHeight: 30700, delta: 30200 },
    ]);
  });

  it("fails on duplicate worldY after the named sort", () => {
    expect(() =>
      ingestObservedIgra(SYNTHETIC_DUPLICATE_HEIGHT_IGRA, THREE_LEVEL_SPEC),
    ).toThrow(/strictly increasing/);
  });

  it("fails when fewer than two usable levels remain", () => {
    expect(() =>
      ingestObservedIgra(SYNTHETIC_SINGLE_KEPT_LEVEL_IGRA, TWO_LEVEL_SPEC),
    ).toThrow(/fewer than 2/);
  });
});

describe("named Moore IGRA wrapper", () => {
  it("ingests a 165-level POR identity through ingestOunMoore20130520Igra", () => {
    const record = ingestOunMoore20130520Igra(syntheticMoore165Named());
    expect(record.profile.levelHeights()).toHaveLength(165);
    expect(record.profile.minHeight).toBe(0);
    expect(record.profile.maxHeight).toBe(1640);
    expect(record.provenance.sourceClass).toBe("observed-raob");
    expect(record.provenance.sourceIdentity).toBe(
      OUN_MOORE_20130520_SPEC.sourceIdentity,
    );
    expect(record.provenance.validTime).toContain("16:51");
    expect(record.provenance.validTime).toContain("HOUR 17");
    expect(record.provenance.location).toEqual({
      latitude: 35.1808,
      longitude: -97.4378,
    });
    expect(record.provenance.heightDatum).toContain("345");
    expect(record.provenance.heightDatum).toContain("344.9 m is not");
    expect(record.provenance.nativeUnitsNote).toContain("tenths of m/s");
    expect(record.provenance.coverage.nativeDataRecordCount).toBe(165);
    expect(record.provenance.coverage.keptLevelCount).toBe(165);
    expect(record.provenance.coverage.droppedLevelCount).toBe(0);
  });
});
