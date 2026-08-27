import {
  EscAdapterError,
  type EscDataRecord,
  type EscHeader,
  type EscSoundingBlock,
} from "./types.js";

function headerValue(lines: readonly string[], label: string): string {
  const prefix = `${label}:`;
  for (const line of lines) {
    if (line.startsWith(prefix) || line.startsWith(label)) {
      const colon = line.indexOf(":");
      if (colon === -1) {
        continue;
      }
      return line.slice(colon + 1).trim();
    }
  }
  throw new EscAdapterError(`ESC header missing ${label}`);
}

function parseHeader(lines: readonly string[]): EscHeader {
  if (lines.length !== 15) {
    throw new EscAdapterError("ESC sounding header must be 15 lines");
  }

  const siteId = headerValue(lines, "Release Site Type/Site ID");
  const utcReleaseTime = headerValue(lines, "UTC Release Time (y,m,d,h,m,s)");
  const location = headerValue(lines, "Release Location (lon,lat,alt)");
  const parts = location.split(",").map((part) => part.trim());
  if (parts.length < 5) {
    throw new EscAdapterError(
      "ESC Release Location must include lon, lat, and launch elevation",
    );
  }

  const longitude = Number(parts[2]);
  const latitude = Number(parts[3]);
  const launchElevation = Number(parts[4]);
  if (
    !Number.isFinite(longitude) ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(launchElevation)
  ) {
    throw new EscAdapterError("ESC Release Location numbers must be finite");
  }

  return {
    siteId,
    utcReleaseTime,
    longitude,
    latitude,
    launchElevation,
  };
}

function parseDataRecord(line: string): EscDataRecord {
  const parts = line.split(/\s+/).filter((part) => part.length > 0);
  if (parts.length !== 21) {
    throw new EscAdapterError(
      `ESC data record must have 21 fields, got ${parts.length}`,
    );
  }

  const time = Number(parts[0]);
  const u = Number(parts[5]);
  const v = Number(parts[6]);
  const alt = Number(parts[14]);
  const qu = Number(parts[18]);
  const qv = Number(parts[19]);
  if (
    !Number.isFinite(time) ||
    !Number.isFinite(u) ||
    !Number.isFinite(v) ||
    !Number.isFinite(alt) ||
    !Number.isFinite(qu) ||
    !Number.isFinite(qv)
  ) {
    throw new EscAdapterError("ESC data record fields must be finite");
  }

  return { time, u, v, alt, qu, qv };
}

export function parseEscConcatenated(text: string): EscSoundingBlock[] {
  const lines = text.split(/\r?\n/);
  const starts: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i]!.startsWith("Data Type:")) {
      starts.push(i);
    }
  }

  if (starts.length === 0) {
    throw new EscAdapterError("ESC text contains no sounding headers");
  }

  const blocks: EscSoundingBlock[] = [];
  for (let s = 0; s < starts.length; s++) {
    const start = starts[s]!;
    const end = s + 1 < starts.length ? starts[s + 1]! : lines.length;
    const blockLines = lines.slice(start, end).filter((line, index, all) => {
      if (line.length > 0) {
        return true;
      }
      return index !== all.length - 1;
    });
    if (blockLines.length < 15) {
      throw new EscAdapterError("ESC sounding is shorter than a 15-line header");
    }

    const header = parseHeader(blockLines.slice(0, 15));
    const records = blockLines.slice(15).map(parseDataRecord);
    blocks.push({ header, records });
  }

  return blocks;
}
