export const IGRA_MISSING = -9999;
export const IGRA_QA_REMOVED = -8888;
export const IGRA_LVLTYP2_SURFACE = 1;

export class IgraAdapterError extends Error {
  readonly name = "IgraAdapterError";

  constructor(message: string) {
    super(message);
  }
}

export interface IgraHeader {
  stationId: string;
  year: number;
  month: number;
  day: number;
  hour: number;
  reltime: number;
  numlev: number;
  pSrc: string;
  npSrc: string;
  latitude: number;
  longitude: number;
}

export interface IgraDataRecord {
  lvltyp1: number;
  lvltyp2: number;
  etime: number;
  press: number;
  gph: number;
  wdir: number;
  wspd: number;
}

export interface IgraSoundingBlock {
  header: IgraHeader;
  records: IgraDataRecord[];
}
