/** P2 evidence-contract foundation. Pure encoding/validation; no execution authority. */
import { createHash } from "node:crypto";

export const AUTHORITY = Object.freeze({ id: "observed-lagrangian-phase-p2-qualification/v1",
  sha256: "fe5a33f8753b7538e5c3abdd2fe9f5766a2bdcefd08bfab07e6ced34bcfae59b" });
export type Json = null | boolean | number | string | readonly Json[] | { readonly [key: string]: Json };
function demand(value: unknown, reason: string): asserts value { if (!value) throw new Error(reason); }
const own = (value: object, key: PropertyKey) => Object.hasOwn(value, key);
function dataKeys(value: object, array = false): string[] {
  demand(array || Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null, "NONPLAIN_OBJECT");
  const keys = Reflect.ownKeys(value);
  demand(keys.every(k => typeof k === "string"), "SYMBOL_KEY");
  for (const key of keys) {
    const d = Object.getOwnPropertyDescriptor(value, key)!;
    demand("value" in d && (d.enumerable || (array && key === "length")), "ACCESSOR_OR_HIDDEN_PROPERTY");
    if (array && key !== "length") demand(/^(0|[1-9][0-9]*)$/.test(String(key)) &&
      Number(key) < (value as unknown[]).length, "EXTRA_ARRAY_PROPERTY");
  }
  return (keys as string[]).filter(k => !array || k !== "length").sort();
}
/** Build JSON text directly: JSON.stringify(object) would reorder integer-like keys. */
export function canonicalRecord(value: unknown): string {
  const active = new Set<object>();
  function encode(v: unknown): string {
    if (v === null || typeof v === "string" || typeof v === "boolean") return JSON.stringify(v);
    if (typeof v === "number") { demand(Number.isFinite(v), "NONFINITE_JSON_NUMBER"); return JSON.stringify(v === 0 ? 0 : v); }
    demand(typeof v === "object" && v !== null, "UNSUPPORTED_JSON_VALUE");
    demand(!active.has(v), "CYCLIC_JSON_VALUE"); active.add(v);
    try {
      const array = Array.isArray(v), keys = dataKeys(v, array);
      if (array) {
        demand(keys.length === v.length, "SPARSE_ARRAY");
        return `[${Array.from({ length: v.length }, (_, i) => { demand(own(v, i), "SPARSE_ARRAY"); return encode(v[i]); }).join(",")}]`;
      }
      return `{${keys.map(k => `${JSON.stringify(k)}:${encode((v as Record<string, unknown>)[k])}`).join(",")}}`;
    } finally { active.delete(v); }
  }
  return encode(value);
}
export const canonicalRecordBytes = (value: unknown): Uint8Array => new TextEncoder().encode(canonicalRecord(value));
/** Empty stream has zero bytes. Each actual record, including the last, has exactly one LF. */
export function canonicalStreamBytes(records: readonly unknown[]): Uint8Array {
  demand(Array.isArray(records), "STREAM_ARRAY_REQUIRED");
  dataKeys(records, true);
  demand(Array.from({ length: records.length }, (_, i) => own(records, i)).every(Boolean), "SPARSE_STREAM");
  return new TextEncoder().encode(records.map(r => canonicalRecord(r) + "\n").join(""));
}
export type Hash = Readonly<{ kind: "RECONSTRUCTED_STREAM_SHA256" | "ARTIFACT_BYTES_SHA256"; sha256: string }>;
const hash = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");
export const reconstructedStreamDigest = (records: readonly unknown[]): Hash =>
  Object.freeze({ kind: "RECONSTRUCTED_STREAM_SHA256", sha256: hash(canonicalStreamBytes(records)) });
export const savedArtifactHash = (bytes: Uint8Array): Hash =>
  Object.freeze({ kind: "ARTIFACT_BYTES_SHA256", sha256: hash(bytes) });

export type ArtifactReference = Readonly<{ id: string; hash: Hash; references: readonly string[] }>;
/** An external inventory hashes artifacts. Each artifact may depend only on acyclic other artifacts. */
export function validateArtifactReferences(artifacts: readonly ArtifactReference[]): void {
  canonicalRecord(artifacts);
  const ids = new Map<string, ArtifactReference>();
  for (const a of artifacts) {
    demand(typeof a.id === "string" && a.id.length && !ids.has(a.id), "DUPLICATE_OR_INVALID_ARTIFACT");
    demand(a.hash?.kind === "ARTIFACT_BYTES_SHA256" && /^[0-9a-f]{64}$/.test(a.hash.sha256), "ARTIFACT_HASH_REQUIRED");
    demand(Array.isArray(a.references) && new Set(a.references).size === a.references.length, "INVALID_ARTIFACT_REFERENCES");
    ids.set(a.id, a);
  }
  const active = new Set<string>(), done = new Set<string>();
  function visit(id: string) {
    demand(ids.has(id), "MISSING_ARTIFACT_REFERENCE"); demand(!active.has(id), "CYCLIC_ARTIFACT_HASH_CONTRACT");
    if (done.has(id)) return;
    active.add(id); for (const ref of ids.get(id)!.references) visit(ref); active.delete(id); done.add(id);
  }
  for (const id of ids.keys()) visit(id);
}

export type Stage = "SYNTHETIC" | "OBSERVED";
export type RecordState = "COMPLETE" | "PARTIAL" | "INCOMPLETE";
export type Envelope = Readonly<{
  schema: "p2-synthetic-envelope/v1" | "p2-observed-envelope/v1";
  stage: Stage; authority: typeof AUTHORITY; executionAuthority: "NOT_AUTHORIZED";
  // COMPLETE describes this record's required fields, never scientific qualification/certification.
  state: RecordState; reasons: readonly string[]; payload: Json;
  requiredEvidence: readonly string[]; presentEvidence: readonly string[];
}>;
function uniqueStrings(values: unknown): values is string[] {
  return Array.isArray(values) && values.every(v => typeof v === "string" && v.length > 0) && new Set(values).size === values.length;
}
export function validateEnvelope(value: unknown, expectedStage: Stage): asserts value is Envelope {
  canonicalRecord(value);
  demand(expectedStage === "SYNTHETIC" || expectedStage === "OBSERVED", "INVALID_STAGE");
  demand(value !== null && typeof value === "object" && !Array.isArray(value), "INVALID_ENVELOPE");
  const e = value as Envelope;
  const fields = ["schema", "stage", "authority", "executionAuthority", "state", "reasons", "payload", "requiredEvidence", "presentEvidence"].sort();
  demand(Object.keys(e).sort().join("|") === fields.join("|"), "ENVELOPE_FIELDS");
  demand(e.stage === expectedStage && e.schema === (expectedStage === "SYNTHETIC" ? "p2-synthetic-envelope/v1" : "p2-observed-envelope/v1"), "STAGE_SCHEMA_MISMATCH");
  demand(canonicalRecord(e.authority) === canonicalRecord(AUTHORITY) && e.executionAuthority === "NOT_AUTHORIZED", "INVALID_AUTHORITY");
  demand(["COMPLETE", "PARTIAL", "INCOMPLETE"].includes(e.state), "INVALID_RECORD_STATE");
  demand(uniqueStrings(e.reasons) && uniqueStrings(e.requiredEvidence) && e.requiredEvidence.length > 0 && uniqueStrings(e.presentEvidence), "INVALID_EVIDENCE_INVENTORY");
  demand(e.presentEvidence.every(id => e.requiredEvidence.includes(id)), "FOREIGN_EVIDENCE");
  if (e.state === "COMPLETE") demand(e.reasons.length === 0 && e.requiredEvidence.every(id => e.presentEvidence.includes(id)), "INCOMPLETE_EVIDENCE");
  else demand(e.reasons.length > 0, "INCOMPLETE_REASON_REQUIRED");
}

/** Lossless rejected-input tree. Not an ordinary diagnostic numeric field or a replacement null. */
export type RejectedInput = Readonly<{ tag: "NULL" | "UNDEFINED" }> |
  Readonly<{ tag: "BOOLEAN"; value: boolean }> | Readonly<{ tag: "STRING"; value: string }> |
  Readonly<{ tag: "BINARY64"; bits: string }> |
  Readonly<{ tag: "ARRAY"; entries: readonly (RejectedInput | Readonly<{ tag: "HOLE" }>)[] }> |
  Readonly<{ tag: "OBJECT"; entries: readonly Readonly<{ key: string; value: RejectedInput }>[] }>;
export function encodeRejectedInput(value: unknown): RejectedInput {
  const active = new Set<object>();
  function encode(v: unknown): RejectedInput {
    if (v === null) return { tag: "NULL" };
    if (v === undefined) return { tag: "UNDEFINED" };
    if (typeof v === "string") return { tag: "STRING", value: v };
    if (typeof v === "boolean") return { tag: "BOOLEAN", value: v };
    if (typeof v === "number") {
      const view = new DataView(new ArrayBuffer(8)); view.setFloat64(0, v, false);
      return { tag: "BINARY64", bits: view.getBigUint64(0, false).toString(16).padStart(16, "0") };
    }
    demand(typeof v === "object" && !active.has(v), "UNSUPPORTED_REJECTED_INPUT"); active.add(v);
    try {
      const array = Array.isArray(v), keys = dataKeys(v, array);
      return array ? { tag: "ARRAY", entries: Array.from({ length: v.length }, (_, i) => own(v, i) ? encode(v[i]) : { tag: "HOLE" }) }
        : { tag: "OBJECT", entries: keys.map(key => ({ key, value: encode((v as Record<string, unknown>)[key]) })) };
    } finally { active.delete(v); }
  }
  return encode(value);
}
export function decodeRejectedInput(value: unknown): unknown {
  canonicalRecord(value); // Also rejects cycles, accessors and nonfinite ordinary fields.
  function decode(v: unknown): unknown {
    demand(v !== null && typeof v === "object" && !Array.isArray(v), "INVALID_REJECTED_TAG");
    const x = v as Record<string, unknown>;
    const fields = (...keys: string[]) => demand(Object.keys(x).sort().join("|") === keys.sort().join("|"), "REJECTED_TAG_FIELDS");
    switch (x.tag) {
      case "NULL": fields("tag"); return null;
      case "UNDEFINED": fields("tag"); return undefined;
      case "STRING": fields("tag", "value"); demand(typeof x.value === "string", "INVALID_STRING"); return x.value;
      case "BOOLEAN": fields("tag", "value"); demand(typeof x.value === "boolean", "INVALID_BOOLEAN"); return x.value;
      case "BINARY64": {
        fields("tag", "bits"); demand(typeof x.bits === "string" && /^[0-9a-f]{16}$/.test(x.bits), "INVALID_BINARY64_BITS");
        const view = new DataView(new ArrayBuffer(8)); view.setBigUint64(0, BigInt("0x" + x.bits), false); return view.getFloat64(0, false);
      }
      case "ARRAY": {
        fields("tag", "entries"); demand(Array.isArray(x.entries), "INVALID_ENTRIES");
        const result = new Array(x.entries.length);
        x.entries.forEach((entry, i) => {
          if (entry?.tag === "HOLE") demand(Object.keys(entry).length === 1, "INVALID_HOLE");
          else result[i] = decode(entry);
        }); return result;
      }
      case "OBJECT": {
        fields("tag", "entries"); demand(Array.isArray(x.entries), "INVALID_ENTRIES");
        const result: Record<string, unknown> = {};
        let previous: string | null = null;
        for (const entry of x.entries) {
          demand(entry && Object.keys(entry).sort().join("|") === "key|value" && typeof entry.key === "string" &&
            (previous === null || previous < entry.key), "INVALID_OBJECT_ENTRIES");
          previous = entry.key; Object.defineProperty(result, entry.key, { value: decode(entry.value), enumerable: true, writable: true, configurable: true });
        } return result;
      }
      default: throw new Error("INVALID_REJECTED_TAG");
    }
  }
  return decode(value);
}
