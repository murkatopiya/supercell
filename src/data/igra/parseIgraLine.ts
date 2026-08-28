import { IgraAdapterError, type IgraDataRecord, type IgraHeader } from "./types.js";

function parseRequiredInt(slice: string, label: string): number {
  const trimmed = slice.trim();
  if (trimmed === "") {
    throw new IgraAdapterError(`IGRA ${label} is empty`);
  }
  if (!/^-?\d+$/.test(trimmed)) {
    throw new IgraAdapterError(`IGRA ${label} is not an integer: ${JSON.stringify(slice)}`);
  }
  const value = Number(trimmed);
  if (!Number.isInteger(value)) {
    throw new IgraAdapterError(`IGRA ${label} is not an integer: ${JSON.stringify(slice)}`);
  }
  return value;
}

function requireLength(line: string, min: number, kind: string): void {
  if (line.length < min) {
    throw new IgraAdapterError(
      `IGRA ${kind} line is shorter than ${min} characters (${line.length})`,
    );
  }
}

/**
 * IGRA v2.2 header columns (1-indexed) from NCEI format:
 * ID 2–12, YEAR 14–17, MONTH 19–20, DAY 22–23, HOUR 25–26,
 * RELTIME 28–31, NUMLEV 33–36, P_SRC 38–45, NP_SRC 47–54,
 * LAT 56–62, LON 64–71 (degrees × 10⁴).
 */
export function parseIgraHeaderLine(line: string): IgraHeader {
  requireLength(line, 71, "header");
  if (line[0] !== "#") {
    throw new IgraAdapterError("IGRA header must start with #");
  }
  const latRaw = parseRequiredInt(line.slice(55, 62), "LAT");
  const lonRaw = parseRequiredInt(line.slice(63, 71), "LON");
  return {
    stationId: line.slice(1, 12).trim(),
    year: parseRequiredInt(line.slice(13, 17), "YEAR"),
    month: parseRequiredInt(line.slice(18, 20), "MONTH"),
    day: parseRequiredInt(line.slice(21, 23), "DAY"),
    hour: parseRequiredInt(line.slice(24, 26), "HOUR"),
    reltime: parseRequiredInt(line.slice(27, 31), "RELTIME"),
    numlev: parseRequiredInt(line.slice(32, 36), "NUMLEV"),
    pSrc: line.slice(37, 45).trim(),
    npSrc: line.slice(46, 54).trim(),
    latitude: latRaw / 10000,
    longitude: lonRaw / 10000,
  };
}

/**
 * IGRA v2.2 data columns (1-indexed): LVLTYP1 1, LVLTYP2 2,
 * ETIME 4–8, PRESS 10–15, GPH 17–21, WDIR 41–45, WSPD 47–51.
 */
export function parseIgraDataLine(line: string): IgraDataRecord {
  requireLength(line, 51, "data");
  return {
    lvltyp1: parseRequiredInt(line.slice(0, 1), "LVLTYP1"),
    lvltyp2: parseRequiredInt(line.slice(1, 2), "LVLTYP2"),
    etime: parseRequiredInt(line.slice(3, 8), "ETIME"),
    press: parseRequiredInt(line.slice(9, 15), "PRESS"),
    gph: parseRequiredInt(line.slice(16, 21), "GPH"),
    wdir: parseRequiredInt(line.slice(40, 45), "WDIR"),
    wspd: parseRequiredInt(line.slice(46, 51), "WSPD"),
  };
}
