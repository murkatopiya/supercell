import { beforeAll, describe, expect, test } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import * as ts from "typescript";
import { loadEvidence, verifyBundle, digest } from "./evidence.ts";
import { RUN_ID, EXPECTED_HASHES, validateResult, frameAt, playbackStep } from "../viewer/model.ts";
import { trajectoryFrame } from "../viewer/framing.ts";
import { CleanupScope } from "../viewer/cleanup.ts";
import { PerspectiveCamera, Vector3 } from "three";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const input = join(root, "artifacts/learn-demo-seed-verification", RUN_ID);
beforeAll(() => { if (process.env.LEARN_DEMO_SEED_VERIFICATION !== undefined) throw new Error("Collection opt-in must be absent"); });
const bundle = loadEvidence(root); // Read-only evidence, never any production import.
const saved = () => validateResult(JSON.parse(bundle.resultText));
function memoryFiles() {
  const files = new Map<string, Buffer>();
  const walk = (dir: string, prefix = "") => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) walk(join(dir, entry.name), `${prefix}${entry.name}/`);
      else files.set(prefix + entry.name, readFileSync(join(dir, entry.name)));
    }
  };
  walk(input); return files;
}
describe("saved-only viewer", () => {
  test("frames every saved position of all cases, including paired lanes, for wide and narrow viewports", () => {
    const record = saved(), original = JSON.stringify(record);
    for (const c of record.cases) for (const aspect of [0.25, 0.5, 1, 2, 4]) {
      const points = c.states.flatMap(s => s.markers.map(m => m.position));
      const frame = trajectoryFrame(points, 50, aspect)!;
      expect(frame).not.toBeNull();
      const camera = new PerspectiveCamera(50, aspect, frame.near, frame.far);
      camera.position.set(frame.position.x, frame.position.y, frame.position.z);
      camera.lookAt(frame.target.x, frame.target.y, frame.target.z); camera.updateMatrixWorld();
      for (const axis of ["x", "y", "z"] as const) {
        expect(frame.target[axis]).toBe((Math.min(...points.map(p => p[axis])) + Math.max(...points.map(p => p[axis]))) / 2);
      }
      // Independent Three.js projection, including cardinal offsets of 150 m glyphs.
      let maxX = 0, maxY = 0, minZ = Infinity, maxZ = -Infinity;
      for (const p of points) for (const offset of [[0,0,0],[150,0,0],[-150,0,0],[0,150,0],[0,-150,0],[0,0,150],[0,0,-150]]) {
        const screen = new Vector3(p.x + offset[0]!, p.y + offset[1]!, p.z + offset[2]!).project(camera);
        maxX = Math.max(maxX, Math.abs(screen.x)); maxY = Math.max(maxY, Math.abs(screen.y));
        minZ = Math.min(minZ, screen.z); maxZ = Math.max(maxZ, screen.z);
      }
      expect(maxX).toBeLessThan(1); expect(maxY).toBeLessThan(1);
      expect(minZ).toBeGreaterThan(-1); expect(maxZ).toBeLessThan(1);
    }
    expect(JSON.stringify(record)).toBe(original);
  });
  test("frames a point, coincident points and a straight line without zero distance", () => {
    for (const points of [[{x:0,y:0,z:0}], [{x:2,y:3,z:4},{x:2,y:3,z:4}], [{x:-100,y:0,z:0},{x:100,y:0,z:0}]]) {
      const frame = trajectoryFrame(points, 50, 1)!;
      expect(frame).not.toBeNull(); expect(frame.far).toBeGreaterThan(frame.near);
      expect(Object.values(frame.position).every(Number.isFinite)).toBe(true);
      expect(frame.position).not.toEqual(frame.target);
    }
  });
  test("invalid/empty bounds and zero-sized viewport refuse a camera update", () => {
    expect(trajectoryFrame([], 50, 1)).toBeNull();
    expect(trajectoryFrame([{x:NaN,y:0,z:0}], 50, 1)).toBeNull();
    expect(trajectoryFrame([{x:Infinity,y:0,z:0}], 50, 1)).toBeNull();
    for (const aspect of [0, -1, NaN, Infinity]) expect(trajectoryFrame([{x:0,y:0,z:0}], 50, aspect)).toBeNull();
    for (const fov of [0, 180, NaN]) expect(trajectoryFrame([{x:0,y:0,z:0}], fov, 1)).toBeNull();
    expect(trajectoryFrame([{x:-Number.MAX_VALUE,y:0,z:0},{x:Number.MAX_VALUE,y:0,z:0}], 50, 1)).toBeNull();
  });
  test("portrait framing needs more distance; narrower FOV also increases distance", () => {
    const points = [{x:-1000,y:0,z:0},{x:1000,y:1000,z:0}];
    const distance = (fov: number, aspect: number) => { const f = trajectoryFrame(points, fov, aspect)!;
      return Math.hypot(f.position.x-f.target.x, f.position.y-f.target.y, f.position.z-f.target.z); };
    expect(distance(50, 0.5)).toBeGreaterThan(distance(50, 2));
    expect(distance(30, 1)).toBeGreaterThan(distance(50, 1));
  });
  test("cleanup releases in reverse once and continues after individual failures", () => {
    const scope = new CleanupScope(), calls: string[] = [], original = new Error("initialization");
    scope.own({ dispose() { calls.push("renderer"); } });
    const cleanupError = new Error("cleanup failure");
    scope.defer(() => { calls.push("controls"); throw cleanupError; });
    scope.defer(() => { calls.push("DOM"); });
    let reported: unknown;
    try { throw original; } catch (error) { expect(scope.dispose()).toEqual([cleanupError]); reported = error; }
    expect(reported).toBe(original); expect(calls).toEqual(["DOM", "controls", "renderer"]);
    expect(scope.dispose()).toEqual([]); expect(calls).toHaveLength(3);
  });
  test("reads the exact accepted bundle and full source snapshot", () => {
    expect(digest(Buffer.from(bundle.resultText))).toBe(EXPECTED_HASHES["result.json"]);
    expect(bundle.verifiedFiles).toBe(102); expect(bundle.snapshotFiles).toBe(100);
    expect(saved().cases.map(c => c.id)).toEqual(["A", "B1", "B2", "A/B1", "A/B2"]);
  });
  test.each(["result.json", "provenance.json", "checksums.json", "source-snapshot/src/simulation/Simulation.ts"])("refuses corruption of %s, in memory only", path => {
    const files = memoryFiles(); files.set(path, Buffer.from("damaged"));
    expect(() => verifyBundle(p => { const bytes = files.get(p); if (!bytes) throw new Error("missing"); return bytes; }, [...files.keys()])).toThrow();
  });
  test("refuses a missing snapshot file", () => {
    const files = memoryFiles(); files.delete("source-snapshot/src/simulation/Simulation.ts");
    expect(() => verifyBundle(p => files.get(p)!, [...files.keys()])).toThrow("coverage");
  });
  test.each([
    ["schema", (r: ReturnType<typeof saved>) => { r.schema = "unsupported"; }],
    ["case order", (r: ReturnType<typeof saved>) => { r.cases.reverse(); }],
    ["incomplete", (r: ReturnType<typeof saved>) => { r.cases[0]!.stepsCompleted = 1199; }],
    ["mapping", (r: ReturnType<typeof saved>) => { r.cases[0]!.mapping[0]!.tracerId = 99; }],
    ["checkpoint", (r: ReturnType<typeof saved>) => { r.cases[0]!.checkpoints[1]!.stateIndex = 301; }],
    ["sample association", (r: ReturnType<typeof saved>) => { r.cases[0]!.history[0]!.appendedAtSteps[1] = 0; }],
    ["non-finite", (r: ReturnType<typeof saved>) => { r.cases[0]!.states[1]!.markers[0]!.position.x = NaN; }],
    ["termination", (r: ReturnType<typeof saved>) => { r.cases[0]!.states[1200]!.markers[0]!.active = false; }],
  ] as const)("rejects incompatible %s without repairing it", (_, corrupt) => {
    const record = saved(); corrupt(record); expect(() => validateResult(record)).toThrow();
  });
  test("all five cases select exact saved markers and actual history prefixes, including rewind", () => {
    const record = saved(), before = JSON.stringify(record);
    for (const c of record.cases) for (const step of [0, 1, 300, 600, 900, 1200, 300, 0]) {
      const frame = frameAt(c, step);
      expect(frame.state).toBe(c.states[step]);
      expect(frame.state.markers.length).toBe(c.roles.length);
      frame.lanes.forEach((samples, lane) => {
        expect(samples).toEqual(c.history[lane]!.samples.filter((_, i) => c.history[lane]!.appendedAtSteps[i]! <= step));
      });
    }
    expect(JSON.stringify(record)).toBe(before);
    expect(() => frameAt(record.cases[0]!, 0.5)).toThrow();
    expect(() => frameAt(record.cases[0]!, 1201)).toThrow();
  });
  test("1x/5x scheduling picks discrete saved indices and caps the endpoint", () => {
    expect(playbackStep(0, 99, 1)).toBe(0); expect(playbackStep(0, 100, 1)).toBe(1);
    expect(playbackStep(300, 1000, 5)).toBe(350); expect(playbackStep(1190, 5000, 5)).toBe(1200);
  });
  test("viewer dependency closure stays local plus installed libraries, with no production/collector imports", () => {
    const pending = ["viewer/main.ts", "viewer-server/server.ts", "viewer-server/evidence.ts"], seen = new Set<string>();
    while (pending.length) {
      const path = pending.pop()!; if (seen.has(path)) continue; seen.add(path);
      const source = ts.createSourceFile(path, readFileSync(join(root, "tools/learn-demo-seed-verification", path), "utf8"), ts.ScriptTarget.Latest, true);
      const visit = (node: ts.Node): void => {
        if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier) {
          expect(ts.isStringLiteral(node.moduleSpecifier)).toBe(true);
          const specifier = (node.moduleSpecifier as ts.StringLiteral).text;
          if (specifier.startsWith(".")) {
            const url = new URL(specifier, new URL(path, "file:///viewer-root/"));
            const target = url.pathname.replace("/viewer-root/", "");
            expect(target.startsWith("viewer/") || target.startsWith("viewer-server/")).toBe(true);
            expect(target).not.toContain("collector"); pending.push(target);
          } else expect(specifier.startsWith("node:") || specifier === "vite" || specifier === "three"
            || specifier === "three/addons/controls/OrbitControls.js").toBe(true);
        }
        if (ts.isCallExpression(node)) {
          expect(node.expression.kind).not.toBe(ts.SyntaxKind.ImportKeyword);
          if (ts.isIdentifier(node.expression)) expect(node.expression.text).not.toBe("require");
        }
        ts.forEachChild(node, visit);
      }; visit(source);
    }
    expect(seen.has("viewer/model.ts")).toBe(true);
  });
});
