import { createHash } from "node:crypto";
import { lstatSync, readFileSync, readdirSync, realpathSync } from "node:fs";
import { join, relative, isAbsolute } from "node:path";
import { RUN_ID, EXPECTED_HASHES, demand, validateResult } from "../viewer/model.ts";

export const digest = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");
const parse = (bytes: Uint8Array) => JSON.parse(Buffer.from(bytes).toString("utf8"));
type Read = (path: string) => Buffer;

// Takes bytes, never executable source. Allows corruption tests entirely in memory.
export function verifyBundle(read: Read, paths: string[]) {
  for (const [path, hash] of Object.entries(EXPECTED_HASHES)) demand(digest(read(path)) === hash, `digest ${path}`);
  const checksums = parse(read("checksums.json")) as Record<string, string>;
  demand(JSON.stringify(paths.filter(p => p !== "checksums.json").sort())
    === JSON.stringify(Object.keys(checksums).sort()), "checksum coverage");
  for (const [path, hash] of Object.entries(checksums)) {
    demand(/^[a-f0-9]{64}$/.test(hash) && digest(read(path)) === hash, `checksum ${path}`);
  }
  const provenance = parse(read("provenance.json")) as {
    schema: string; files: { path: string; sha256: string; size: number }[];
  };
  demand(provenance.schema === "learn-demo-seed-provenance/v1" && Array.isArray(provenance.files), "provenance schema");
  const snapshotPaths = provenance.files.map(f => `source-snapshot/${f.path}`);
  demand(new Set(snapshotPaths).size === snapshotPaths.length && JSON.stringify(snapshotPaths.slice().sort())
    === JSON.stringify(paths.filter(p => p.startsWith("source-snapshot/")).sort()), "snapshot coverage");
  for (const file of provenance.files) {
    const bytes = read(`source-snapshot/${file.path}`);
    demand(bytes.length === file.size && digest(bytes) === file.sha256, `snapshot ${file.path}`);
  }
  const resultText = read("result.json").toString("utf8");
  validateResult(JSON.parse(resultText));
  return { runId: RUN_ID, resultText, resultSha256: EXPECTED_HASHES["result.json"],
    provenanceSha256: EXPECTED_HASHES["provenance.json"], checksumsSha256: EXPECTED_HASHES["checksums.json"],
    verifiedFiles: Object.keys(checksums).length, snapshotFiles: provenance.files.length };
}

/** Read-only, fixed local input. No filesystem writes or production-module imports. */
export function loadEvidence(repoRoot: string) {
  const root = realpathSync(join(repoRoot, "artifacts/learn-demo-seed-verification", RUN_ID));
  const files = new Map<string, Buffer>();
  const walk = (directory: string, prefix = "") => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name), rel = relative(root, realpathSync(path));
      demand(!lstatSync(path).isSymbolicLink() && !isAbsolute(rel) && rel !== ".." && !rel.startsWith(".."), "unsafe evidence path");
      if (entry.isDirectory()) walk(path, `${prefix}${entry.name}/`);
      else { demand(entry.isFile(), "non-file evidence"); files.set(`${prefix}${entry.name}`, readFileSync(path)); }
    }
  };
  walk(root);
  return verifyBundle(path => { const bytes = files.get(path); demand(bytes, `missing ${path}`); return bytes; }, [...files.keys()]);
}
