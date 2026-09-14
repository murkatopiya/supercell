import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { AUTHORITY, canonicalRecord, canonicalRecordBytes, canonicalStreamBytes, reconstructedStreamDigest,
  savedArtifactHash, validateArtifactReferences, validateEnvelope, encodeRejectedInput, decodeRejectedInput,
  type Envelope, type ArtifactReference } from "./evidence.js";
import { SYNTHETIC_REGISTRY as registry, validateRegistryDeclarations, validateRegistryDefinition } from "./syntheticRegistry.js";
import { add, multiply, rational, roundReference, referenceBits } from "../lagrangianEstimator/syntheticReferences.js";
import { selectCandidate, type GroupAssessment } from "../observedLagrangianPhaseP2Controller.js";

const utf8 = (s: string) => new TextEncoder().encode(s);
const envelope = (): Envelope => ({ schema: "p2-synthetic-envelope/v1", stage: "SYNTHETIC", authority: AUTHORITY,
  executionAuthority: "NOT_AUTHORIZED", state: "COMPLETE", reasons: [], payload: { value: 1 },
  requiredEvidence: ["inputs", "trace"], presentEvidence: ["inputs", "trace"] });
const artifact = (id: string, references: string[] = []): ArtifactReference =>
  ({ id, references, hash: { kind: "ARTIFACT_BYTES_SHA256", sha256: "a".repeat(64) } });

describe("P2 strict canonical bytes (independent literal expectations)", () => {
  it("orders integer-like keys lexically, including nested objects", () => {
    expect(canonicalRecord({ "2": "two", "10": "ten", z: { b: 2, a: 1 } }))
      .toBe('{"10":"ten","2":"two","z":{"a":1,"b":2}}');
  });
  it("uses UTF-16 code units rather than code points or locale", () => {
    expect(canonicalRecord({ "\ue000": 1, "\u{10000}": 2, Z: 3, a: 4 }))
      .toBe('{"Z":3,"a":4,"𐀀":2,"":1}');
  });
  it("preserves ordered arrays and dense null values", () => {
    expect(canonicalRecord([3, { z: 0, a: 1 }, null, 2])).toBe('[3,{"a":1,"z":0},null,2]');
  });
  it("escapes JSON strings without Unicode normalization", () => {
    expect(canonicalRecord({ s: '"\\\n\t\r\b\f\u0001', composed: "é", decomposed: "e\u0301" }))
      .toBe('{"composed":"é","decomposed":"é","s":"\\\"\\\\\\n\\t\\r\\b\\f\\u0001"}');
    expect(canonicalRecord("\ud800")).toBe('"\\ud800"');
  });
  it("normalizes only exact negative zero, retaining subnormals and negatives", () => {
    expect(canonicalRecord([-0, 0, -Number.MIN_VALUE, -1])).toBe('[0,0,-5e-324,-1]');
  });
  it("encodes exact UTF-8, no BOM/whitespace, and one LF per record", () => {
    expect(canonicalRecordBytes({ a: "é" })).toEqual(Uint8Array.from([123, 34, 97, 34, 58, 34, 195, 169, 34, 125]));
    expect(canonicalStreamBytes([{ z: 2, a: 1 }, "\n"])).toEqual(utf8('{"a":1,"z":2}\n"\\n"\n'));
    expect(canonicalStreamBytes([])).toEqual(new Uint8Array());
  });
  it.each([undefined, { a: undefined }, [undefined], NaN, Infinity, -Infinity, { n: NaN }])("rejects undefined/nonfinite ordinary values %#", value => {
    expect(() => canonicalRecord(value)).toThrow();
  });
  it("rejects sparse arrays at any depth and sparse streams", () => {
    expect(() => canonicalRecord(new Array(2))).toThrow("SPARSE_ARRAY");
    expect(() => canonicalRecord({ x: [, 1] })).toThrow("SPARSE_ARRAY");
    expect(() => canonicalStreamBytes([, 1])).toThrow("SPARSE_STREAM");
  });
  it.each([1n, Symbol("x"), () => 0, new Date(0), new Map(), new Set(), new Uint8Array(1)])("rejects unsupported values %#", value => {
    expect(() => canonicalRecord(value)).toThrow();
  });
  it("rejects accessors without invoking them, symbol keys and hidden data", () => {
    let calls = 0;
    expect(() => canonicalRecord({ get x() { calls++; return 1; } })).toThrow(); expect(calls).toBe(0);
    expect(() => canonicalRecord({ [Symbol("key")]: 1 })).toThrow();
    expect(() => canonicalRecord(Object.defineProperty({}, "x", { value: 1 }))).toThrow();
    const array = [1]; Object.assign(array, { extra: 2 }); expect(() => canonicalRecord(array)).toThrow();
  });
  it("rejects cycles while allowing repeated acyclic values", () => {
    const cyclic: unknown[] = []; cyclic.push(cyclic); expect(() => canonicalRecord(cyclic)).toThrow("CYCLIC");
    const child = { b: 1 }; expect(canonicalRecord([child, child])).toBe('[{"b":1},{"b":1}]');
  });
  it("produces identical bytes for different insertion orders", () => {
    expect(canonicalRecordBytes({ b: 1, a: { d: 3, c: 2 } })).toEqual(canonicalRecordBytes({ a: { c: 2, d: 3 }, b: 1 }));
  });
});

describe("P2 explicit hash contracts", () => {
  it("uses a known independent SHA-256 vector for exact saved bytes", () => {
    expect(savedArtifactHash(utf8("abc"))).toEqual({ kind: "ARTIFACT_BYTES_SHA256",
      sha256: "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad" });
  });
  it("distinguishes reconstructed-stream identity from byte identity and preserves saved whitespace", () => {
    const a = reconstructedStreamDigest([{ b: 2, a: 1 }]), b = reconstructedStreamDigest([{ a: 1, b: 2 }]);
    expect(a).toEqual(b);
    expect(a.kind).toBe("RECONSTRUCTED_STREAM_SHA256");
    expect(savedArtifactHash(utf8('{"a":1,"b":2}\n')).sha256).toBe(a.sha256);
    expect(savedArtifactHash(utf8('{ "a":1,"b":2 }\r\n')).sha256).not.toBe(a.sha256);
    expect(savedArtifactHash(utf8('{"a":1,"b":2}')).sha256).not.toBe(a.sha256);
  });
  it("accepts an acyclic external inventory without hashing itself", () => {
    expect(() => validateArtifactReferences([artifact("manifest"), artifact("trajectory", ["manifest"]), artifact("execution", ["trajectory"])] )).not.toThrow();
  });
  it.each([
    [artifact("a", ["a"])], [artifact("a", ["b"]), artifact("b", ["a"])],
    [artifact("a", ["missing"])], [artifact("a"), artifact("a")],
    [artifact("a", ["b", "b"]), artifact("b")],
    [{ ...artifact("a"), hash: reconstructedStreamDigest([]) }],
  ].map(artifacts => [artifacts] as const))("rejects cyclic, incomplete or mistyped artifact hash contracts %#", artifacts => {
    expect(() => validateArtifactReferences(artifacts)).toThrow();
  });
});

describe("P2 finite envelopes cannot confer qualification authority", () => {
  it("validates a complete synthetic record only, with explicit authority denial", () => {
    expect(() => validateEnvelope(envelope(), "SYNTHETIC")).not.toThrow();
    expect(() => validateEnvelope({ ...envelope(), stage: "OBSERVED", schema: "p2-observed-envelope/v1" }, "OBSERVED")).not.toThrow();
  });
  it.each([
    { stage: "OBSERVED" }, { schema: "p2-observed-envelope/v1" }, { executionAuthority: "AUTHORIZED" },
    { state: "CERTIFIED" }, { state: "PARTIAL" }, { presentEvidence: ["inputs"] },
    { presentEvidence: ["inputs", "trace", "foreign"] }, { requiredEvidence: [] },
    { presentEvidence: ["inputs", "inputs"] }, { reasons: ["missing"] }, { extra: true },
    { authority: { ...AUTHORITY, sha256: "0".repeat(64) } },
  ])("rejects stage/status/inventory/authority confusion %#", overrides => {
    expect(() => validateEnvelope({ ...envelope(), ...overrides }, "SYNTHETIC")).toThrow();
  });
  it.each(["PARTIAL", "INCOMPLETE"] as const)("retains %s with reasons, without a completeness claim", state => {
    expect(() => validateEnvelope({ ...envelope(), state, reasons: ["missing-trace"], presentEvidence: ["inputs"] }, "SYNTHETIC")).not.toThrow();
  });
  it("serialized controller objects cannot acquire Slice 6 seals", () => {
    const serialized = JSON.parse(canonicalRecord(Array.from({ length: 192 }, () => ({ state: "QUALIFICATION_COMPLETE", admission: "ADMITTED" }))));
    expect(selectCandidate(serialized as GroupAssessment[])).toMatchObject({ status: "QUALIFICATION_INCOMPLETE", reason: "INCOMPLETE_OR_UNVALIDATED_CAMPAIGN_LEDGER" });
  });
});

describe("P2 lossless tagged rejected inputs", () => {
  it("preserves infinities, NaN, negative zero, undefined and holes through finite JSON", () => {
    const original = { values: [NaN, Infinity, -Infinity, -0, undefined, , Number.MIN_VALUE], missing: undefined };
    const encoded = encodeRejectedInput(original);
    const recovered = decodeRejectedInput(JSON.parse(canonicalRecord(encoded))) as typeof original;
    expect(Number.isNaN(recovered.values[0])).toBe(true);
    expect(recovered.values[1]).toBe(Infinity); expect(recovered.values[2]).toBe(-Infinity);
    expect(Object.is(recovered.values[3], -0)).toBe(true);
    expect(Object.hasOwn(recovered.values, 4)).toBe(true); expect(Object.hasOwn(recovered.values, 5)).toBe(false);
    expect(recovered.values[6]).toBe(Number.MIN_VALUE); expect(Object.hasOwn(recovered, "missing")).toBe(true);
  });
  it("uses explicit independently known binary64 encodings", () => {
    expect(encodeRejectedInput(-0)).toEqual({ tag: "BINARY64", bits: "8000000000000000" });
    expect(encodeRejectedInput(Infinity)).toEqual({ tag: "BINARY64", bits: "7ff0000000000000" });
    expect(decodeRejectedInput({ tag: "BINARY64", bits: "fff0000000000000" })).toBe(-Infinity);
    const view = new DataView(new ArrayBuffer(8)); view.setBigUint64(0, 0x7ff8000000000123n);
    expect(referenceBits(decodeRejectedInput(encodeRejectedInput(view.getFloat64(0))) as number)).toBe(0x7ff8000000000123n);
  });
  it("preserves dangerous object keys as own data without prototype mutation", () => {
    const input = JSON.parse('{"__proto__":{"x":1},"constructor":"literal"}');
    const output = decodeRejectedInput(encodeRejectedInput(input)) as Record<string, unknown>;
    expect(Object.getPrototypeOf(output)).toBe(Object.prototype); expect(Object.hasOwn(output, "__proto__")).toBe(true);
    expect(output.constructor).toBe("literal");
  });
  it.each([{ tag: "BINARY64", bits: "NaN" }, { tag: "HOLE" }, { tag: "NULL", extra: 1 },
    { tag: "ARRAY", entries: [{ tag: "HOLE", value: 1 }] },
    { tag: "OBJECT", entries: [{ key: "a", value: { tag: "NULL" } }, { key: "a", value: { tag: "NULL" } }] },
  ])("rejects malformed tagged descriptions %#", value => { expect(() => decodeRejectedInput(value)).toThrow(); });
  it("does not pretend unsupported functions or cyclic graphs are lossless synthetic data", () => {
    expect(() => encodeRejectedInput(() => 0)).toThrow();
    const c: unknown[] = []; c.push(c); expect(() => encodeRejectedInput(c)).toThrow();
  });
});

describe("P2 immutable declaration inventory and independent references", () => {
  it("declares exactly all 22 frozen fixtures and 16 explicit variants, without certification", () => {
    expect(registry.fixtures.filter(f => f.frozenFixture !== null).map(f => f.frozenFixture)).toEqual(Array.from({ length: 22 }, (_, i) => i + 1));
    expect(registry.fixtures).toHaveLength(38);
    expect(validateRegistryDeclarations(registry.fixtures)).toEqual({ definitionComplete: true, qualificationCertified: false });
    expect(Object.isFrozen(registry.fixtures[0].coarse.vertices[0])).toBe(true);
    expect(registry.executionAuthority).toBe("NOT_AUTHORIZED");
    expect(validateRegistryDefinition(registry).qualificationCertified).toBe(false);
  });
  it("requires supplemental recipes, prerequisite inventory and certification denial", () => {
    expect(() => validateRegistryDefinition({ ...registry, prerequisites: [] })).toThrow();
    expect(() => validateRegistryDefinition({ ...registry, prerequisiteRecipes: [] })).toThrow();
    expect(() => validateRegistryDefinition({ ...registry, qualificationCertified: true })).toThrow();
    for (const recipe of registry.prerequisiteRecipes) if ("test" in recipe)
      expect(readFileSync(recipe.source, "utf8")).toContain(recipe.test);
  });
  it.each(["missing", "duplicate", "foreign", "trace", "reference", "recipe"])("detects %s declarations", defect => {
    const supplied = structuredClone(registry.fixtures) as unknown as Array<Record<string, any>>;
    if (defect === "missing") supplied.pop();
    if (defect === "duplicate") supplied[1] = supplied[0];
    if (defect === "foreign") supplied[0].id = "foreign";
    if (defect === "trace") supplied[0].requiredTraces.pop();
    if (defect === "reference") supplied[0].reference.quantities.Eabs = ["999", "1"];
    if (defect === "recipe") supplied[0].coarse.vertices[0].y = 999;
    expect(() => validateRegistryDeclarations(supplied as unknown as typeof registry.fixtures)).toThrow();
  });
  it("independently derives irregular areas using reviewed rational algebra", () => {
    let sum = rational(0n);
    for (let j = 1n; j <= 32n; j++) sum = add(sum, multiply(rational(j), rational(2n * j - 1n, 1024n)));
    expect(roundReference(sum)).toBe(1397 / 64);
    expect(registry.fixtures.find(f => f.id === "P2-F05")!.reference.quantities.Esigned).toEqual(["1397", "64"]);
  });
  it("pins corrected triangle/jump references independently of tested estimators", () => {
    expect(roundReference(multiply(rational(4n), rational(3n, 2n)))).toBe(6);
    expect(registry.fixtures.find(f => f.id === "P2-F14")!.reference.quantities.Eabs).toEqual(["6", "1"]);
    expect(registry.fixtures.find(f => f.id === "P2-F17")!.reference.quantities.R1).toEqual(["1", "1"]);
    expect(roundReference(multiply(rational(8n), rational(1n, 4n)))).toBe(2);
    expect(registry.fixtures.find(f => f.id === "P2-F22")!.repetitions).toBe(5);
  });
  it("requires failure capture declarations without inventing discarded traces", () => {
    for (const f of registry.fixtures.filter(f => f.reference.kind === "EXPECTED_REJECTION")) {
      expect(f.reference.quantities).toEqual({}); expect(f.requiredTraces).toContain("generated-failing-step-or-subinterval-trace");
    }
    expect(registry.prerequisites.find(p => p.id === "qualification-evidence")!.reference).toContain("unimplemented");
  });
  it("audits the complete new runtime dependency closure and independent oracle boundary", () => {
    const evidence = readFileSync("src/validation/p2Qualification/evidence.ts", "utf8");
    const declarations = readFileSync("src/validation/p2Qualification/syntheticRegistry.ts", "utf8");
    const imports = (text: string) => [...text.matchAll(/from\s+["']([^"']+)["']/g)].map(m => m[1]);
    expect(imports(evidence)).toEqual(["node:crypto"]); expect(imports(declarations)).toEqual(["./evidence.js"]);
    for (const text of [evidence, declarations]) expect(text).not.toMatch(/import\s*\(|require\s*\(|process\.env|node:fs|writeFile|observedLagrangianPhaseP\.js|Simulation|collectPhase|Goshen|Prospect|Dumas|Moore/);
    const oracle = readFileSync("src/validation/lagrangianEstimator/syntheticReferences.ts", "utf8");
    expect(imports(oracle)).toEqual([]);
    expect(readFileSync("docs/research/2026-09-13-observed-lagrangian-phase-p2-qualification-specification.md"))
      .toSatisfy((bytes: Uint8Array) => savedArtifactHash(bytes).sha256 === AUTHORITY.sha256);
  });
});
