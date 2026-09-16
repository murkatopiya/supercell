import { describe, expect, it } from "vitest";
import { SYNTHETIC_REGISTRY } from "./syntheticRegistry.js";
import { assessF01, qualifyF01 } from "./f01.js";

describe("F01 local qualification binding (developer tests only)", () => {
  it("executes the real ordered graph and retains native evidence and independent references", () => {
    const record = qualifyF01();
    expect(record.operations.map(x => x.symbol)).toEqual([
      "createAcceptedPath", "createDiagnosticProvider", "partitionAcceptedStep", "integratePathExposure"]);
    expect(record.operations.map(x => [(x.capture as any).journal.state, (x.capture as any).journal.reasons])).toEqual([
      ["COMPLETE_GENERATED_PREFIX", []], ["COMPLETE_GENERATED_PREFIX", []],
      ["COMPLETE_GENERATED_PREFIX", []], ["COMPLETE_GENERATED_PREFIX", []]]);
    expect((record.operations[3].result as any).value.Esigned).toBe(-12);
    expect((record.operations[3].result as any).value.Eabs).toBe(12);
    expect(record.references.Esigned.rational).toEqual(["-12", "1"]);
    expect(record.references.Eabs.rational).toEqual(["12", "1"]);
    expect(record.assertions.find(x => x.id === "reference/Esigned")?.outcome).toBe("PASS");
    expect(record.assertions.find(x => x.id === "reference/Eabs")?.outcome).toBe("PASS");
    for (const id of record.declaration.requiredAssertions) expect(record.assertions.find(x => x.id === id)?.outcome).toBe("PASS");
    for (const id of record.declaration.requiredTraces) expect(record.assertions.find(x => x.id === `trace/${id}`)?.outcome).toBe("PASS");
    expect(record.verdict).toBe("PASS");
    expect(record.future.runtimeIdentity).toBe("NOT_BOUND");
    expect(record.future.artifacts).toBe("NOT_PERFORMED");
  });

  it("rejects altered declaration and evaluator recipe", () => {
    const altered = { ...SYNTHETIC_REGISTRY, fixtures: SYNTHETIC_REGISTRY.fixtures.map(f =>
      f.id === "P2-F01" ? { ...f, reference: { ...f.reference, quantities: { ...f.reference.quantities, Esigned: ["0", "1"] } } } : f) };
    expect(() => qualifyF01(altered)).toThrow();
    expect(() => qualifyF01(SYNTHETIC_REGISTRY, "unreviewed/v1")).toThrow("F01_EVALUATOR_RECIPE_MISMATCH");
  });

  it("marks missing capture incomplete without replacing the native actual", () => {
    const record = qualifyF01();
    const actual = record.operations[3].result;
    const operations = record.operations.map((x, i) => i === 3 ? { ...x, capture: null } : x);
    const reassessed = assessF01({ ...record, operations });
    expect(reassessed.verdict).toBe("INCOMPLETE");
    expect(reassessed.missingEvidence).toContain("capture/integratePathExposure");
    expect(reassessed.operations[3].result).toBe(actual);
  });

  it("requires the independent allowance capture", () => {
    const record = qualifyF01();
    const reassessed = assessF01({ ...record, allowance: { ...record.allowance, capture: null } });
    expect(reassessed.verdict).toBe("INCOMPLETE");
    expect(reassessed.missingEvidence).toContain("capture/syntheticReferenceAllowance");
    expect(reassessed.operations[3].result).toBe(record.operations[3].result);
  });

  it("requires capture to name the operation that produced the native return", () => {
    const record = qualifyF01();
    const operations = record.operations.map((op, i) => i === 2 ? { ...op,
      capture: { ...(op.capture as object), operation: "createAcceptedPath" } } : op);
    const reassessed = assessF01({ ...record, operations });
    expect(reassessed.verdict).toBe("INCOMPLETE");
    expect(reassessed.missingEvidence).toContain("capture/partitionAcceptedStep");
  });

  it("does not pass empty contributions or missing endpoint and event evidence", () => {
    const record = qualifyF01();
    const partition = record.operations[2].result as any;
    const exposure = record.operations[3].result as any;
    const noContributions = record.operations.map((op, i) => i === 3 ? { ...op, result: {
      ...exposure, value: { ...exposure.value, trace: { ...exposure.value.trace, contributions: [] } } } } : op);
    expect(assessF01({ ...record, operations: noContributions }).missingEvidence).toContain("trace/subinterval-contributions");
    const noEndpoint = record.operations.map((op, i) => i === 2 ? { ...op, result: {
      ...partition, value: { ...partition.value, intervals: [{ ...partition.value.intervals[0], end: null }] } } } : op);
    expect(assessF01({ ...record, operations: noEndpoint }).missingEvidence).toContain("trace/endpoint-evaluations");
    const noEvents = record.operations.map((op, i) => i === 2 ? { ...op, result: {
      ...partition, value: { ...partition.value, nodes: [] } } } : op);
    expect(assessF01({ ...record, operations: noEvents }).missingEvidence).toContain("trace/events");
    const wrongEvent = record.operations.map((op, i) => i === 2 ? { ...op, result: {
      ...partition, value: { ...partition.value, nodes: [
        { ...partition.value.nodes[0], contact: { ...partition.value.nodes[0].contact,
          location: { kind: "VERTEX", index: 9 } } }, partition.value.nodes[1]] } } } : op);
    expect(assessF01({ ...record, operations: wrongEvent }).failedAssertions).toContain("trace/events");
    const noBound = record.operations.map((op, i) => i === 3 ? { ...op, result: {
      ...exposure, value: { ...exposure.value, allowance: null } } } : op);
    expect(assessF01({ ...record, operations: noBound }).missingEvidence).toContain("trace/totals-bounds-status");
  });

  it("marks a controlled structural contradiction failed with native actual unchanged", () => {
    const record = qualifyF01();
    const nativePartition = record.operations[2].result;
    const nativeExposure = record.operations[3].result;
    const operations = record.operations.map(x => x.symbol === "partitionAcceptedStep" ?
      { ...x, result: { ...(x.result as object), value: { ...(x.result as any).value, crossingCount: 1 } } } : x);
    const alteredPartitionCopy = operations[2].result;
    expect(alteredPartitionCopy).not.toBe(nativePartition);
    const reassessed = assessF01({ ...record, operations });
    expect(reassessed.verdict).toBe("FAIL");
    expect(reassessed.failedAssertions).toContain("zero-interior-knots");
    expect((nativePartition as any).value.crossingCount).toBe(0);
    expect(record.operations[2].result).toBe(nativePartition);
    expect(record.operations[3].result).toBe(nativeExposure);
    expect(reassessed.operations[3].result).toBe(nativeExposure);
  });

  it("keeps known FAILs while incomplete evidence takes verdict precedence", () => {
    const record = qualifyF01();
    const partition = record.operations[2].result as any;
    const operations = record.operations.map((op, i) => i === 2 ? { ...op, result: {
      ...partition, value: { ...partition.value, crossingCount: 1 } } } : op);
    const reassessed = assessF01({ ...record, operations, allowance: { ...record.allowance, capture: null } });
    expect(reassessed.verdict).toBe("INCOMPLETE");
    expect(reassessed.failedAssertions).toContain("zero-interior-knots");
    expect(reassessed.missingEvidence).toContain("capture/syntheticReferenceAllowance");
  });

  it("rejects copied reference and allowance changes while preserving native actual", () => {
    const record = qualifyF01();
    const nativeExposure = record.operations[3].result;
    const changedReference = { ...record, references: { ...record.references,
      Esigned: { ...record.references.Esigned, rounded: -12 + 1e-14 } } };
    const referenceAssessment = assessF01(changedReference);
    expect(referenceAssessment.verdict).toBe("FAIL");
    expect(referenceAssessment.failedAssertions).toContain("binding/reference/Esigned");
    const changedRational = { ...record, references: { ...record.references,
      Eabs: { ...record.references.Eabs, rational: ["120", "10"] } } };
    expect(assessF01(changedRational).failedAssertions).toContain("binding/reference/Eabs");
    const allowanceOnly = { ...record, allowance: { ...record.allowance, result: { status: "COMPLETE", value: {
      ...(record.allowance.result as any).value, bound: 1e6 } } } };
    expect(assessF01(allowanceOnly).failedAssertions).toContain("binding/allowance");
    const changedAllowance = { ...record, references: { ...record.references,
      Esigned: { ...record.references.Esigned, rounded: 100 } },
      allowance: { ...record.allowance, result: { status: "COMPLETE", value: {
        ...(record.allowance.result as any).value, bound: 1e6 } } } };
    const allowanceAssessment = assessF01(changedAllowance);
    expect(allowanceAssessment.verdict).toBe("FAIL");
    expect(allowanceAssessment.failedAssertions).toContain("binding/reference/Esigned");
    expect(allowanceAssessment.failedAssertions).toContain("binding/allowance");
    const changedInputs = { ...record, analyticIntervals: [{ ...record.analyticIntervals[0], u: 100 }] };
    expect(assessF01(changedInputs).failedAssertions).toContain("binding/allowance");
    const missingReference = { ...record, references: { ...record.references, Esigned: null as any } };
    expect(assessF01(missingReference).missingEvidence).toContain("binding/reference/Esigned");
    expect(record.operations[3].result).toBe(nativeExposure);
    expect(record.references.Esigned.rounded).toBe(-12);
  });
});
