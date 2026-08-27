import { ESC_MISSING_ALTITUDE, ESC_MISSING_WIND } from "../types.js";

function headerBlock(input: {
  siteId: string;
  utc: string;
  lon: number;
  lat: number;
  elev: number;
}): string {
  return [
    "Data Type:                         NCAR GAUS/Ascending",
    "Project ID:                        VORTEX2",
    `Release Site Type/Site ID:         ${input.siteId}`,
    `Release Location (lon,lat,alt):    103 53.56'W, 41 16.67'N, ${input.lon}, ${input.lat}, ${input.elev}`,
    `UTC Release Time (y,m,d,h,m,s):    ${input.utc}`,
    "Sonde Id/Sonde Type:               083724333/Vaisala RS92-SGP (ccGPS)",
    "Reference Launch Data Source/Time: Manual Entry/21:51:34.94",
    "System Operator/Comments:          synthetic I1 fixture",
    "Post Processing Comments:          Aspen Version 2.8.1.8, Configuration upsonde-1s",
    "/",
    "/",
    `Nominal Release Time (y,m,d,h,m,s):${input.utc}`,
    " Time  Press  Temp  Dewpt  RH    Ucmp   Vcmp   spd   dir   Wcmp     Lon     Lat   Ele   Azi    Alt    Qp   Qt   Qrh  Qu   Qv   QdZ",
    "  sec    mb     C     C     %     m/s    m/s   m/s   deg   m/s      deg     deg   deg   deg     m    code code code code code code",
    "------ ------ ----- ----- ----- ------ ------ ----- ----- ----- -------- ------- ----- ----- ------- ---- ---- ---- ---- ---- ----",
  ].join("\n");
}

function dataLine(input: {
  time: number;
  u: number;
  v: number;
  wcmp?: number;
  alt: number;
  qu: number;
  qv: number;
}): string {
  const wcmp = input.wcmp ?? 5.0;
  return [
    input.time.toFixed(1),
    "850.0",
    "20.0",
    "10.0",
    "50.0",
    input.u.toFixed(1),
    input.v.toFixed(1),
    "1.0",
    "180.0",
    wcmp.toFixed(1),
    "-103.893",
    "41.278",
    "999.0",
    "999.0",
    input.alt.toFixed(1),
    "1.0",
    "1.0",
    "1.0",
    input.qu.toFixed(1),
    input.qv.toFixed(1),
    "99.0",
  ].join(" ");
}

const decoyNssl2 = [
  headerBlock({
    siteId: "WY/NSSL2",
    utc: "2009, 06, 05, 21:43:37",
    lon: -104.344,
    lat: 41.44,
    elev: 1692.0,
  }),
  dataLine({ time: 0, u: 1.0, v: 2.0, alt: 1700.0, qu: 1.0, qv: 1.0 }),
  dataLine({ time: 1, u: 2.0, v: 3.0, alt: 1710.0, qu: 1.0, qv: 1.0 }),
].join("\n");

const siblingNssl1_2240 = [
  headerBlock({
    siteId: "Bushnell/NSSL1",
    utc: "2009, 06, 05, 22:40:06",
    lon: -103.893,
    lat: 41.295,
    elev: 1575.9,
  }),
  dataLine({ time: 0, u: 40.0, v: 40.0, alt: 1580.0, qu: 1.0, qv: 1.0 }),
  dataLine({ time: 1, u: 41.0, v: 41.0, alt: 1590.0, qu: 1.0, qv: 1.0 }),
].join("\n");

const targetNssl1_2155 = [
  headerBlock({
    siteId: "Bushnell/NSSL1",
    utc: "2009, 06, 05, 21:55:22",
    lon: -103.893,
    lat: 41.278,
    elev: 1557.9,
  }),
  dataLine({
    time: -1,
    u: ESC_MISSING_WIND,
    v: ESC_MISSING_WIND,
    alt: 1558.8,
    qu: 9.0,
    qv: 9.0,
  }),
  dataLine({ time: 0, u: -1.2, v: 0.2, alt: 1560.3, qu: 1.0, qv: 1.0 }),
  dataLine({ time: 1, u: 10.0, v: 4.0, alt: 1570.0, qu: 1.0, qv: 1.0, wcmp: 99.0 }),
  dataLine({
    time: 2,
    u: ESC_MISSING_WIND,
    v: ESC_MISSING_WIND,
    alt: 1700.0,
    qu: 9.0,
    qv: 9.0,
  }),
  dataLine({ time: 3, u: 11.0, v: 5.0, alt: 1800.0, qu: 1.0, qv: 1.0 }),
  dataLine({
    time: 4,
    u: 12.0,
    v: 6.0,
    alt: ESC_MISSING_ALTITUDE,
    qu: 99.0,
    qv: 99.0,
  }),
  dataLine({ time: 5, u: 13.0, v: 7.0, alt: 1900.0, qu: 3.0, qv: 1.0 }),
  dataLine({ time: 6, u: 14.0, v: 8.0, alt: 2800.0, qu: 1.0, qv: 1.0 }),
].join("\n");

/** Concatenated 3-sounding ESC: decoy, target 21:55:22, sibling 22:40:06. */
export const SYNTHETIC_CONCATENATED_ESC = [
  decoyNssl2,
  targetNssl1_2155,
  siblingNssl1_2240,
].join("\n");

/** Same identity as the target, but only the 22:40:06 NSSL1 block. */
export const SYNTHETIC_ONLY_2240_ESC = [decoyNssl2, siblingNssl1_2240].join(
  "\n",
);

export const SYNTHETIC_AMBIGUOUS_2155_ESC = [
  targetNssl1_2155,
  targetNssl1_2155,
].join("\n");

export const SYNTHETIC_DUPLICATE_HEIGHT_ESC = [
  headerBlock({
    siteId: "Bushnell/NSSL1",
    utc: "2009, 06, 05, 21:55:22",
    lon: -103.893,
    lat: 41.278,
    elev: 1557.9,
  }),
  dataLine({ time: 0, u: 1.0, v: 1.0, alt: 1600.0, qu: 1.0, qv: 1.0 }),
  dataLine({ time: 1, u: 2.0, v: 2.0, alt: 1600.0, qu: 1.0, qv: 1.0 }),
].join("\n");

export const SYNTHETIC_SINGLE_KEPT_LEVEL_ESC = [
  headerBlock({
    siteId: "Bushnell/NSSL1",
    utc: "2009, 06, 05, 21:55:22",
    lon: -103.893,
    lat: 41.278,
    elev: 1557.9,
  }),
  dataLine({
    time: -1,
    u: ESC_MISSING_WIND,
    v: ESC_MISSING_WIND,
    alt: 1558.8,
    qu: 9.0,
    qv: 9.0,
  }),
  dataLine({ time: 0, u: 1.0, v: 1.0, alt: 1560.3, qu: 1.0, qv: 1.0 }),
].join("\n");
