export interface IgraObservedSoundingSpec {
  stationId: string;
  year: number;
  month: number;
  day: number;
  nominalHourUtc: number;
  reltime: number;
  expectedNumlev: number;
  expectedPSrc: string;
  expectedNpSrc: string;
  surfaceDatumGphM: number;
  sourceIdentity: string;
  validTime: string;
  heightDatum: string;
  nativeUnitsNote: string;
}

export const IGRA_NATIVE_UNITS_NOTE =
  "IGRA WDIR meteorological FROM degrees; WSPD tenths of m/s";

export const OUN_MOORE_20130520_SPEC: IgraObservedSoundingSpec = {
  stationId: "USM00072357",
  year: 2013,
  month: 5,
  day: 20,
  nominalHourUtc: 17,
  reltime: 1651,
  expectedNumlev: 165,
  expectedPSrc: "ncdc6301",
  expectedNpSrc: "ncdc6301",
  surfaceDatumGphM: 345,
  sourceIdentity:
    "IGRA v2.2 USM00072357 / NCDC DSI-6301 (ncdc6301) / 2013-05-20 nominal 17 UTC / RELTIME 1651 / native POR USM00072357-data.txt",
  validTime: "2013-05-20 16:51 UTC (IGRA RELTIME; nominal HOUR 17)",
  heightDatum:
    "IGRA GPH minus sounding surface GPH 345 m → world Y, implied flat ground; station-list 344.9 m is not the subtracted datum",
  nativeUnitsNote: IGRA_NATIVE_UNITS_NOTE,
};
