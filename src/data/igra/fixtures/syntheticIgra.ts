import { OUN_MOORE_20130520_SPEC } from "../igraObservedSoundingSpec.js";
import { IGRA_MISSING, IGRA_QA_REMOVED } from "../types.js";

function pad(value: number | string, width: number): string {
  return String(value).padStart(width, " ");
}

export function igraHeaderLine(input: {
  stationId?: string;
  year?: number;
  month?: number;
  day?: number;
  hour?: number;
  reltime?: number;
  numlev: number;
  pSrc?: string;
  npSrc?: string;
  latRaw?: number;
  lonRaw?: number;
}): string {
  const stationId = (input.stationId ?? "USM00072357").padEnd(11, " ").slice(0, 11);
  const month = String(input.month ?? 5).padStart(2, "0");
  const day = String(input.day ?? 20).padStart(2, "0");
  const hour = String(input.hour ?? 17).padStart(2, "0");
  return (
    "#" +
    stationId +
    " " +
    pad(input.year ?? 2013, 4) +
    " " +
    month +
    " " +
    day +
    " " +
    hour +
    " " +
    pad(input.reltime ?? 1651, 4) +
    " " +
    pad(input.numlev, 4) +
    " " +
    (input.pSrc ?? "ncdc6301").padEnd(8, " ").slice(0, 8) +
    " " +
    (input.npSrc ?? "ncdc6301").padEnd(8, " ").slice(0, 8) +
    " " +
    pad(input.latRaw ?? 351808, 7) +
    " " +
    pad(input.lonRaw ?? -974378, 8)
  );
}

export function igraDataLine(input: {
  lvltyp1?: number;
  lvltyp2?: number;
  etime?: number;
  press?: number;
  gph: number;
  wdir: number;
  wspd: number;
}): string {
  return (
    String(input.lvltyp1 ?? 2) +
    String(input.lvltyp2 ?? 0) +
    " " +
    pad(input.etime ?? 0, 5) +
    " " +
    pad(input.press ?? 96638, 6) +
    " " +
    pad(input.gph, 5) +
    " " +
    pad(-9999, 5) +
    " " +
    pad(-9999, 5) +
    " " +
    pad(-9999, 5) +
    " " +
    pad(input.wdir, 5) +
    " " +
    pad(input.wspd, 5)
  );
}

export const MOORE_HEADER_RAW =
  "#USM00072357 2013 05 20 17 1651  165 ncdc6301 ncdc6301  351808  -974378";

export function soundingBlock(
  header: string,
  records: readonly string[],
): string {
  return [header, ...records].join("\n");
}

const surface = igraDataLine({
  lvltyp1: 2,
  lvltyp2: 1,
  etime: 0,
  press: 96638,
  gph: 345,
  wdir: 185,
  wspd: 51,
});

const highPacked = igraDataLine({
  lvltyp1: 2,
  lvltyp2: 0,
  etime: 9516,
  press: 1000,
  gph: 31045,
  wdir: 90,
  wspd: 100,
});

const lowAfterInversion = igraDataLine({
  lvltyp1: 3,
  lvltyp2: 0,
  etime: 100,
  press: IGRA_MISSING,
  gph: 707,
  wdir: 180,
  wspd: 80,
});

const mid = igraDataLine({
  lvltyp1: 2,
  lvltyp2: 0,
  etime: 200,
  press: 90000,
  gph: 845,
  wdir: 270,
  wspd: 50,
});

/** Three-level Moore identity with mixed packing order (high, then low). */
export const SYNTHETIC_MOORE_INVERSION_IGRA = soundingBlock(
  igraHeaderLine({ numlev: 4, reltime: 1651 }),
  [surface, highPacked, lowAfterInversion, mid],
);

export const SYNTHETIC_MOORE_DECOY_12Z_IGRA = soundingBlock(
  igraHeaderLine({ hour: 12, reltime: 1108, numlev: 2 }),
  [
    igraDataLine({
      lvltyp2: 1,
      gph: 345,
      wdir: 90,
      wspd: 10,
    }),
    igraDataLine({ gph: 445, wdir: 90, wspd: 20 }),
  ],
);

export const SYNTHETIC_MOORE_SIBLING_RELTIME_IGRA = soundingBlock(
  igraHeaderLine({ hour: 17, reltime: 1200, numlev: 2 }),
  [
    igraDataLine({
      lvltyp2: 1,
      gph: 345,
      wdir: 10,
      wspd: 10,
    }),
    igraDataLine({ gph: 445, wdir: 10, wspd: 20 }),
  ],
);

export const SYNTHETIC_MOORE_CONCATENATED_IGRA = [
  SYNTHETIC_MOORE_DECOY_12Z_IGRA,
  SYNTHETIC_MOORE_INVERSION_IGRA,
  SYNTHETIC_MOORE_SIBLING_RELTIME_IGRA,
].join("\n");

export const SYNTHETIC_ONLY_SIBLING_RELTIME_IGRA = [
  SYNTHETIC_MOORE_DECOY_12Z_IGRA,
  SYNTHETIC_MOORE_SIBLING_RELTIME_IGRA,
].join("\n");

export const SYNTHETIC_AMBIGUOUS_MOORE_IGRA = [
  SYNTHETIC_MOORE_INVERSION_IGRA,
  SYNTHETIC_MOORE_INVERSION_IGRA,
].join("\n");

export const SYNTHETIC_WRONG_NUMLEV_IGRA = soundingBlock(
  igraHeaderLine({ numlev: 5, reltime: 1651 }),
  [surface, highPacked, lowAfterInversion, mid],
);

export const SYNTHETIC_WRONG_P_SRC_IGRA = soundingBlock(
  igraHeaderLine({ numlev: 4, pSrc: "otherxxx" }),
  [surface, highPacked, lowAfterInversion, mid],
);

export const SYNTHETIC_WRONG_NP_SRC_IGRA = soundingBlock(
  igraHeaderLine({ numlev: 4, npSrc: "otherxxx" }),
  [surface, highPacked, lowAfterInversion, mid],
);

export const SYNTHETIC_WRONG_SURFACE_DATUM_IGRA = soundingBlock(
  igraHeaderLine({ numlev: 4 }),
  [
    igraDataLine({
      lvltyp1: 2,
      lvltyp2: 1,
      etime: 0,
      press: 96638,
      gph: 344,
      wdir: 185,
      wspd: 51,
    }),
    highPacked,
    lowAfterInversion,
    mid,
  ],
);

export const SYNTHETIC_SENTINEL_DROP_IGRA = soundingBlock(
  igraHeaderLine({ numlev: 6 }),
  [
    surface,
    igraDataLine({
      gph: IGRA_MISSING,
      wdir: 270,
      wspd: 50,
      press: 85000,
    }),
    igraDataLine({
      gph: 445,
      wdir: IGRA_QA_REMOVED,
      wspd: 50,
    }),
    igraDataLine({
      gph: 545,
      wdir: 90,
      wspd: IGRA_MISSING,
    }),
    igraDataLine({
      gph: 645,
      wdir: 0,
      wspd: 100,
      press: IGRA_MISSING,
    }),
    igraDataLine({
      gph: 745,
      wdir: 180,
      wspd: 40,
    }),
  ],
);

export const SYNTHETIC_INVALID_WDIR_IGRA = soundingBlock(
  igraHeaderLine({ numlev: 3 }),
  [
    surface,
    igraDataLine({ gph: 445, wdir: 361, wspd: 50 }),
    igraDataLine({ gph: 545, wdir: 90, wspd: 50 }),
  ],
);

export const SYNTHETIC_DUPLICATE_HEIGHT_IGRA = soundingBlock(
  igraHeaderLine({ numlev: 3 }),
  [
    surface,
    igraDataLine({ gph: 445, wdir: 90, wspd: 50 }),
    igraDataLine({ gph: 445, wdir: 180, wspd: 60 }),
  ],
);

export const SYNTHETIC_SINGLE_KEPT_LEVEL_IGRA = soundingBlock(
  igraHeaderLine({ numlev: 2 }),
  [
    surface,
    igraDataLine({
      gph: IGRA_MISSING,
      wdir: 90,
      wspd: 50,
    }),
  ],
);

export const SMALL_MOORE_SPEC = {
  ...OUN_MOORE_20130520_SPEC,
  expectedNumlev: 4,
};

export const SENTINEL_DROP_SPEC = {
  ...OUN_MOORE_20130520_SPEC,
  expectedNumlev: 6,
};

export const THREE_LEVEL_SPEC = {
  ...OUN_MOORE_20130520_SPEC,
  expectedNumlev: 3,
};

export const TWO_LEVEL_SPEC = {
  ...OUN_MOORE_20130520_SPEC,
  expectedNumlev: 2,
};
