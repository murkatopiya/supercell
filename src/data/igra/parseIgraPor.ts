import { parseIgraDataLine, parseIgraHeaderLine } from "./parseIgraLine.js";
import { IgraAdapterError, type IgraSoundingBlock } from "./types.js";

export function parseIgraPor(text: string): IgraSoundingBlock[] {
  const lines = text.split(/\r?\n/);
  const blocks: IgraSoundingBlock[] = [];
  let current: IgraSoundingBlock | undefined;

  const finish = () => {
    if (current !== undefined) {
      blocks.push(current);
      current = undefined;
    }
  };

  for (const raw of lines) {
    if (raw.length === 0) {
      continue;
    }
    if (raw.startsWith("#")) {
      finish();
      current = {
        header: parseIgraHeaderLine(raw),
        records: [],
      };
      continue;
    }
    if (current === undefined) {
      throw new IgraAdapterError("IGRA data record appeared before a header");
    }
    current.records.push(parseIgraDataLine(raw));
  }
  finish();

  if (blocks.length === 0) {
    throw new IgraAdapterError("IGRA source has no sounding headers");
  }
  return blocks;
}
