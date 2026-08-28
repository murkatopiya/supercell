import type { IgraObservedSoundingSpec } from "./igraObservedSoundingSpec.js";
import {
  IGRA_LVLTYP2_SURFACE,
  IgraAdapterError,
  type IgraSoundingBlock,
} from "./types.js";

export function validateIgraSoundingHeader(
  block: IgraSoundingBlock,
  spec: IgraObservedSoundingSpec,
): void {
  const { header, records } = block;
  if (records.length !== header.numlev) {
    throw new IgraAdapterError(
      `IGRA parsed ${records.length} data records, header NUMLEV is ${header.numlev}`,
    );
  }
  if (header.numlev !== spec.expectedNumlev) {
    throw new IgraAdapterError(
      `IGRA NUMLEV must be ${spec.expectedNumlev}, got ${header.numlev}`,
    );
  }
  if (header.pSrc !== spec.expectedPSrc) {
    throw new IgraAdapterError(
      `IGRA P_SRC must be ${spec.expectedPSrc}, got ${header.pSrc}`,
    );
  }
  if (header.npSrc !== spec.expectedNpSrc) {
    throw new IgraAdapterError(
      `IGRA NP_SRC must be ${spec.expectedNpSrc}, got ${header.npSrc}`,
    );
  }

  const surfaces = records.filter(
    (record) => record.lvltyp2 === IGRA_LVLTYP2_SURFACE,
  );
  if (surfaces.length !== 1) {
    throw new IgraAdapterError(
      `IGRA sounding must have exactly one surface level, got ${surfaces.length}`,
    );
  }
  const surfaceGph = surfaces[0]!.gph;
  if (surfaceGph !== spec.surfaceDatumGphM) {
    throw new IgraAdapterError(
      `IGRA surface GPH must be ${spec.surfaceDatumGphM}, got ${surfaceGph}`,
    );
  }
}
