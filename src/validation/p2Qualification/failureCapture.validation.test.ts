import { beforeAll, describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import { readFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import ts from "typescript";
import { createHash } from "node:crypto";
import { captureFailure, failureCaptureData } from "./failureCapture.js";
import { createCapture, closeCapture, injectCaptureFault } from "../lagrangianEstimator/capture.js";
import { canonicalRecord, encodeRejectedInput, decodeRejectedInput } from "./evidence.js";
import * as currentPath from "../lagrangianEstimator/path.js";
import * as currentProvider from "../lagrangianEstimator/providers.js";
import * as currentPartition from "../lagrangianEstimator/partition.js";
import * as currentArithmetic from "../lagrangianEstimator/arithmetic.js";
import * as currentExposure from "../lagrangianEstimator/exposure.js";
import * as currentHistory from "../lagrangianEstimator/history.js";
import * as currentComparison from "../lagrangianEstimator/comparison.js";
import * as controller from "../observedLagrangianPhaseP2Controller.js";
import { P2_SPEC } from "../observedLagrangianPhaseP2Spec.js";

const checkpoint = "52a9fcce7554504efc8bf540910c2529f18c770f";
const files = ["path", "providers", "partition", "arithmetic", "exposure", "history", "comparison"]
  .map(n => `src/validation/lagrangianEstimator/${n}.ts`).concat("src/validation/observedLagrangianPhaseP2Controller.ts");
const baselineRoot = resolve("tmp/p2-reviewed-baseline");
// Exact repository sources in an isolated test directory; no copied numerical
// implementation in the harness. Extracted campaigns/data are never imported.
beforeAll(() => {
  mkdirSync(baselineRoot, { recursive: true });
  execFileSync("tar", ["-xf", "-", "-C", baselineRoot], { input: execFileSync("git", ["archive", "--format=tar", checkpoint, "src"], { maxBuffer: 32 * 1024 * 1024 }) });
}, 30000);

function erased(source: string): string {
  const sf = ts.createSourceFile("input.ts", source, ts.ScriptTarget.ES2022, true);
  const transformed = ts.transform(sf, [context => {
    const f = context.factory;
    const onlyCapture = (node: ts.Node): boolean => ts.isCallExpression(node) ? node.expression.getText(sf) === "captureValue" :
      ts.isParenthesizedExpression(node) ? onlyCapture(node.expression) :
      ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.CommaToken && onlyCapture(node.left) && onlyCapture(node.right);
    const visit: ts.Visitor = node => {
      if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier) && node.moduleSpecifier.text.endsWith("/capture.js")) return undefined;
      if (ts.isConstructorDeclaration(node) && node.body?.getText(sf).includes("bindCapture(")) return undefined;
      if (ts.isParameter(node) && node.name.getText(sf) === "capture") return undefined;
      if (ts.isVariableStatement(node) && node.declarationList.declarations.every(d => d.name.getText(sf) === "capture")) return undefined;
      if (ts.isExpressionStatement(node)) {
        const e = node.expression;
        if (ts.isCallExpression(e) && ts.isIdentifier(e.expression) && e.expression.text === "captureValue") return undefined;
        if (ts.isBinaryExpression(e) && ts.isIdentifier(e.left) && e.left.text === "capture") return undefined;
      }
      if (ts.isParenthesizedExpression(node)) return ts.visitNode(node.expression, visit);
      if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.CommaToken && onlyCapture(node.left))
        return ts.visitNode(node.right, visit);
      if (ts.isCallExpression(node)) {
        if (ts.isIdentifier(node.expression) && node.expression.text === "captureValue") return ts.visitNode(node.arguments[2], visit);
        let args = [...node.arguments];
        if (args.at(-1)?.getText(sf) === "capture") { args.pop(); while (args.at(-1)?.getText(sf) === "undefined") args.pop(); }
        return f.updateCallExpression(node, ts.visitNode(node.expression, visit) as ts.Expression, node.typeArguments,
          args.map(a => ts.visitNode(a, visit) as ts.Expression));
      }
      if (ts.isNewExpression(node) && node.expression.getText(sf) === "NeumaierAccumulator")
        return f.updateNewExpression(node, node.expression, node.typeArguments, []);
      return ts.visitEachChild(node, visit, context);
    };
    return root => ts.visitNode(root, visit) as ts.SourceFile;
  }]);
  // Structural AST comparison retains binary operator nesting (unlike removing
  // parentheses text), evaluation order, conditions, calls and object fields.
  const signature = (n: ts.Node): unknown => {
    if (ts.isParenthesizedExpression(n)) return signature(n.expression);
    const children: unknown[] = [];
    ts.forEachChild(n, c => { children.push(signature(c)); });
    return [n.kind, ts.isIdentifier(n) || ts.isStringLiteral(n) || ts.isNumericLiteral(n) ? n.text : null,
      ts.isPrefixUnaryExpression(n) || ts.isPostfixUnaryExpression(n) ? n.operator : null,
      ts.isVariableDeclarationList(n) ? n.flags & (ts.NodeFlags.Let | ts.NodeFlags.Const) : null, children];
  };
  const result = JSON.stringify(signature(transformed.transformed[0])); transformed.dispose(); return result;
}

describe("P2 exact reviewed projection", () => {
  it.each(files)("erasing only capture plumbing reproduces the full reviewed AST: %s", file => {
    expect(erased(readFileSync(file, "utf8"))).toBe(erased(execFileSync("git", ["show", `${checkpoint}:${file}`], { encoding: "utf8" })));
  });
  it("binds the unchanged exact-byte frozen specification", () => {
    expect(createHash("sha256").update(readFileSync("docs/research/2026-09-13-observed-lagrangian-phase-p2-qualification-specification.md")).digest("hex"))
      .toBe("fe5a33f8753b7538e5c3abdd2fe9f5766a2bdcefd08bfab07e6ced34bcfae59b");
  });
  it("runtime baseline agrees bit-for-bit for success/failure and exact provider calls", async () => {
    const base = await Promise.all(["path", "providers", "partition", "arithmetic", "exposure", "history", "comparison"].map(n =>
      import(/* @vite-ignore */ `${baselineRoot}/src/validation/lagrangianEstimator/${n}.ts`)));
    const current = [currentPath, currentProvider, currentPartition, currentArithmetic, currentExposure, currentHistory, currentComparison];
    const execute = (mods: any[], captureOn: boolean, times: number[], heights: number[], amplitude: number, down: boolean) => {
      const [p, q, partition, arithmetic, exposure, history, comparison] = mods;
      const c = captureOn ? createCapture() : undefined, calls: unknown[] = [];
      const accepted = p.createAcceptedPath(times.map((time, i) => ({ time, position: { x: 0, y: down ? 1 - i / (times.length - 1) : i / (times.length - 1), z: 0 } })), c);
      const provider = q.createDiagnosticProvider({ identity: "artificial", version: "v1", heights,
        evaluate: (i: number, position: unknown, time: number) => { calls.push(["evaluate", i, position, time]); return { T1: amplitude, omega: null, gradient: null }; },
        ordinaryOracle: (position: unknown, time: number) => { calls.push(["oracle", position, time]); return { T1: amplitude, omega: null, gradient: null }; } });
      const parts = accepted.value.steps.map((s: any) => partition.partitionAcceptedStep(accepted.value, s.index, provider.value, { eligibility: "ELIGIBLE", support: "FULL_SUPPORT" }, c));
      const exp = exposure.integratePathExposure(parts, { role: "PRIMARY" }, c);
      const input = { status: "COMPLETE", value: { path: accepted.value, provider: provider.value, eligibility: "ELIGIBLE" } };
      const hist = history.comparePathHistory(input, input, { interval: { a: times[0], b: times.at(-1) }, role: "PRIMARY" }, c);
      const ordinary = provider.value.ordinary({ x: 0, y: .5, z: 0 }, times[0], c);
      const ctx = { coarse: { id: "c", pathFingerprint: accepted.value.fingerprint, h: 1 }, fine: { id: "f", pathFingerprint: accepted.value.fingerprint, h: .5 },
        interval: { a: times[0], b: times.at(-1) }, channel: "artificial", role: "PRIMARY" };
      const bundle = comparison.compareExposures(ctx, exp, exp, c);
      const local = arithmetic.localLinearIntegrals(0, 4, 3, -3, c);
      return { result: encodeRejectedInput({ accepted, parts, exp, hist, ordinary, bundle, local }), calls, journal: closeCapture(c) };
    };
    for (const [times, heights, amplitude, down] of [
      [[0, 1], [0, .25, 1], 2, false], [[0, 1], [0, .25, 1], 2, true],
      [[0, 1], [0, ...Array.from({ length: 33 }, (_, i) => .5 + i / 4096), 1], 1, false],
      [[2 ** 53, 2 ** 53 + 2], [0, .25, .5, 1], 1, false],
      [[2 ** 53, 2 ** 53 + 8], [0, .25, .3125, 1], 1, false],
      [[0, 1, 2], [0, 1], Number.MAX_VALUE * .75, false], [[0, 1], [0, 1], NaN, false],
    ] as [number[], number[], number, boolean][]) {
      const expected = execute(base, false, times, heights, amplitude, down);
      for (const enabled of [false, true]) {
        const actual = execute(current, enabled, times, heights, amplitude, down);
        expect(actual.result).toEqual(expected.result); expect(actual.calls).toEqual(expected.calls);
        if (enabled) expect(actual.journal.state).toBe("COMPLETE_GENERATED_PREFIX");
      }
    }
  }, 30000);
  it("controller eager calls, real propagation and late assessment agree with the isolated baseline", async () => {
    const old = await import(/* @vite-ignore */ `${baselineRoot}/src/validation/observedLagrangianPhaseP2Controller.ts`);
    const oldProvider = await import(/* @vite-ignore */ `${baselineRoot}/src/validation/lagrangianEstimator/providers.ts`);
    const run = (api: any, providerApi: any, enabled: boolean) => {
      const calls: unknown[] = [], c = enabled ? createCapture() : undefined;
      const q = providerApi.createDiagnosticProvider({ identity: "controller-call-order", version: "v1", heights: [0, 4000],
        evaluate: (i: number, p: unknown, t: number) => { calls.push(["evaluate", i, p, t]); return { T1: 1, omega: null, gradient: null }; } }).value;
      const ordinary = q.ordinary;
      const wrapped = { ...q, ordinary(p: any, t: number, capture?: any) {
        calls.push(["ordinary", p, t]);
        // Both row calls must occur before coarse rejection is inspected.
        if (t === 0) return { status: "FAILED", code: "NONFINITE_ARITHMETIC", operation: "artificial/ordinary" };
        return ordinary(p, t, capture);
      } };
      const cs = P2_SPEC.cases[0], seed = P2_SPEC.seeds[0];
      const runs = cs.members.flatMap(member => P2_SPEC.resolutions.map(r => {
        const v = { x: -(member.C[0] - 10), y: 0, z: member.C[1] }, count = 1 / r.h;
        const result = api.prepareRun({ caseId: cs.id, memberId: member.id, seedId: seed.id, resolutionId: r.id, C: member.C,
          samples: Array.from({ length: count + 1 }, (_, i) => ({ index: i, tick: i * r.ticks, time: i * r.h,
            position: { x: seed.x + i * r.h * v.x, y: i === count ? 5000 : seed.y, z: seed.z + i * r.h * v.z } })),
          steps: Array.from({ length: count }, (_, i) => ({ fromIndex: i, clipped: false })), initialVelocity: v,
          topologies: { Source: q.topology, Analysis: q.topology }, termination: "SOURCE_EXIT" });
        expect(result.status).toBe("COMPLETE"); return result.value;
      }));
      const plan = api.planGroup(runs, P2_SPEC.candidates[0]); expect(plan.status).toBe("COMPLETE");
      const result = api.evaluateGroup(plan.value, { Source: wrapped, Analysis: wrapped }, c);
      expect(result.status).toBe("COMPLETE"); expect(result.value.state).toBe("QUALIFICATION_INCOMPLETE");
      const entries = structuredClone(result.value.entries);
      const last = entries.findLast((e: any) => e.result.status === "COMPLETE"); last.result.value.schema = "bad";
      const assessment = api.assessGroup(plan.value, entries, c);
      expect(assessment).toMatchObject({ reason: "RESULT_CONTEXT_MISMATCH" });
      const badPlan = api.planGroup([...runs.slice(0, -1), runs[0]], P2_SPEC.candidates[0], c);
      expect(badPlan).toMatchObject({ reason: "MISSING_OR_DUPLICATE_RUN" });
      return { result: encodeRejectedInput({ result, assessment, badPlan }), calls, journal: closeCapture(c) };
    };
    const expected = run(old, oldProvider, false);
    for (const enabled of [false, true]) {
      const actual = run(controller, currentProvider, enabled);
      expect(actual.result).toEqual(expected.result); expect(actual.calls).toEqual(expected.calls);
      const ordinary = actual.calls.filter((row: any) => row[0] === "ordinary") as any[];
      expect(ordinary.length).toBeGreaterThan(0); expect(ordinary.length % 2).toBe(0);
      expect(ordinary.every(row => row[2] === 0)).toBe(true);
      if (enabled) {
        expect(actual.journal.state).toBe("COMPLETE_GENERATED_PREFIX");
        expect(actual.journal.events.some(e => e.site.endsWith("local/result") && (e.value as any)?.status === "COMPLETE")).toBe(true);
      }
    }
  }, 30000);
});

describe("P2 qualification capture facade", () => {
  it.each([NaN, Infinity, -Infinity, -0])("tags original %s input before validation and preserves actual result", value => {
    const input = [{ time: value, position: { x: 0, y: 0, z: 0 } }, { time: 1, position: { x: 0, y: 1, z: 0 } }];
    const result = captureFailure("createAcceptedPath", [input], input);
    expect(canonicalRecord(result.capture.originalInput)).toBe(canonicalRecord(encodeRejectedInput(input)));
    expect(result.result).toEqual(currentPath.createAcceptedPath(input));
  });
  it("preserves sparse/undefined versus absent fields without codec broadening", () => {
    const input = [{ time: 0, position: { x: 0, y: 0, z: 0 } }, , undefined];
    const r = captureFailure("createAcceptedPath", [input as any], input);
    const decoded = decodeRejectedInput(r.capture.originalInput) as unknown[];
    expect(1 in decoded).toBe(false); expect(2 in decoded).toBe(true); expect(r.result.status).toBe("FAILED");
  });
  it("unencodable declared input does not suppress or replace scientific result", () => {
    let calls = 0; const bad = { get value() { calls++; throw Error(); } };
    const r = captureFailure("localLinearIntegrals", [0, 1, 2, 2], bad);
    expect(r.result).toEqual({ status: "COMPLETE", value: { signed: 2, abs: 2, zeroFraction: null } });
    expect(r.capture.inputState).toBe("INCOMPLETE"); expect(calls).toBe(0);
  });
  it("failure projection keeps tagged raw values separate from null affected estimates", () => {
    const r = captureFailure("integratePathExposure", [[], { role: "PRIMARY" }], { partitions: [] });
    const data = failureCaptureData(r.capture, r.result);
    expect(data.affectedScientificOutputs).toEqual({ Esigned: null, Eabs: null });
    expect(data.implementationIdentity).toEqual({ state: "NOT_BOUND" });
    expect(Object.isFrozen(data.generatedPrefix)).toBe(true);
    expect(canonicalRecord(data)).toContain('"executionAuthority":"NOT_AUTHORIZED"');
  });
  it("late selection failure retains completed candidate groups and unchanged ledger rejection", () => {
    const q = currentProvider.createDiagnosticProvider({ identity: "initial-invalid", version: "v1", heights: [0, 1], evaluate: () => { throw Error("no call"); } });
    if (q.status !== "COMPLETE") throw Error();
    const ledger: controller.GroupAssessment[] = [];
    for (const cs of P2_SPEC.cases) for (const seed of P2_SPEC.seeds) {
      const runs = cs.members.flatMap(member => P2_SPEC.resolutions.map(r => {
        const result = controller.prepareRun({ caseId: cs.id, seedId: seed.id, memberId: member.id, resolutionId: r.id, C: member.C,
          samples: [{ index: 0, tick: 0, time: 0, position: { x: seed.x, y: seed.y, z: seed.z } }], steps: [], initialVelocity: null,
          topologies: { Source: q.value.topology, Analysis: cs.analysisAvailable ? q.value.topology : null }, termination: "INITIAL_INVALID" });
        if (result.status !== "COMPLETE") throw Error(result.reason); return result.value;
      }));
      const unavailable = { fingerprint: "unavailable", topology: null, ordinary: () => ({ status: "N_A", reason: "COLUMN_UNAVAILABLE", value: null } as const),
        explicit: () => ({ status: "N_A", reason: "COLUMN_UNAVAILABLE", value: null } as const) };
      for (const candidate of P2_SPEC.candidates) {
        const plan = controller.planGroup(runs, candidate); if (plan.status !== "COMPLETE") throw Error();
        const assessment = controller.evaluateGroup(plan.value, { Source: q.value, Analysis: cs.analysisAvailable ? q.value : unavailable });
        if (assessment.status !== "COMPLETE") throw Error(assessment.reason); ledger.push(assessment.value);
      }
    }
    const invalid = ledger.slice(); invalid[invalid.length - 1] = invalid[invalid.length - 2];
    const c = createCapture(), expected = controller.selectCandidate(invalid), result = controller.selectCandidate(invalid, c);
    expect(result).toEqual(expected); expect(result).toMatchObject({ reason: "MISSING_DUPLICATE_OR_FOREIGN_GROUP" });
    const journal = closeCapture(c);
    expect(journal.state).toBe("COMPLETE_GENERATED_PREFIX");
    expect(journal.events.some(e => e.site.endsWith("callback/candidate"))).toBe(true);
    expect(journal.events.filter(e => e.site.endsWith("local/matches")).length).toBeGreaterThan(32);
  }, 30000);
  it("escaped scientific exception is not retyped or retried by the facade", () => {
    const error = new Error("profile"), profile = { levelHeights() { throw error; } };
    expect(() => captureFailure("createSourceProvider", [profile as any, {} as any, "g"], { recipe: "throwing-profile" })).toThrow(error);
  });
  it("controller preparation late failure retains generated prefixes and original reason", () => {
    const source = currentProvider.createDiagnosticProvider({ identity: "controller", version: "v1", heights: [0, 5000], evaluate: () => ({ T1: 0, omega: null, gradient: null }) });
    if (source.status !== "COMPLETE") throw Error();
    const caseSpec = P2_SPEC.cases[0], seed = P2_SPEC.seeds[0], r = P2_SPEC.resolutions[0];
    const supplied = { caseId: caseSpec.id, memberId: caseSpec.members[0].id, seedId: seed.id, resolutionId: r.id,
      C: caseSpec.members[0].C, samples: [0, 1].map(i => ({ index: i, tick: i * r.ticks, time: i * r.h, position: { x: seed.x, y: seed.y, z: seed.z } })),
      steps: [{ fromIndex: 0, clipped: false }], initialVelocity: { x: 0, y: 0, z: 0 },
      topologies: { Source: source.value.topology, Analysis: source.value.topology }, termination: "GROUND" } as const;
    const context = createCapture(), result = controller.prepareRun(supplied, context);
    expect(result).toMatchObject({ status: "QUALIFICATION_INCOMPLETE", reason: "TERMINATION_METADATA" });
    expect(closeCapture(context).events.some(e => e.site.endsWith("assign/primaryPrefix"))).toBe(true);
    for (const after of [0, 20, 80]) {
      const c = createCapture(); injectCaptureFault(c, after); expect(controller.prepareRun(supplied, c)).toEqual(result);
    }
  });
  it("sealed controller objects remain required and no snapshot confers authority", () => {
    const c = createCapture(); expect(controller.selectCandidate([], c)).toMatchObject({ reason: "INCOMPLETE_OR_UNVALIDATED_CAMPAIGN_LEDGER" });
    expect(captureFailure("selectCandidate", [[]], []).result).toEqual(controller.selectCandidate([]));
  });
  it("capture runtime closure has no observed/campaign/I/O imports or hardcoded geometry", () => {
    const journal = readFileSync("src/validation/lagrangianEstimator/capture.ts", "utf8");
    expect(journal).not.toMatch(/\bimport\b|node:fs|Simulation|process\.|Goshen|Prospect|Dumas|Moore|setTimeout|Math\.random/);
    const facade = readFileSync("src/validation/p2Qualification/failureCapture.ts", "utf8");
    expect(facade).not.toMatch(/node:fs|Simulation|observedLagrangianPhaseP\.js|process\.env|writeFile|readFile|import\(/);
    expect(facade).toContain('executionAuthority: "NOT_AUTHORIZED"');
  });
});
