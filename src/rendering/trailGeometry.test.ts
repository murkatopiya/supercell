import { describe, expect, it } from "vitest";
import * as THREE from "three";
import type { Vec3 } from "../core/math/Vec3.js";
import { TracerPathHistory } from "../simulation/TracerPathHistory.js";
import type { TracerParticle } from "../simulation/TracerParticle.js";
import appSrc from "../app/App.tsx?raw";
import tracerViewportSrc from "../ui/tracer/TracerViewport.tsx?raw";
import tracerSceneSrc from "./TracerScene.ts?raw";
import trailGeometrySrc from "./trailGeometry.ts?raw";
import { TRACER_COLORS } from "./TracerScene.js";
import {
  createTrailLine,
  createTrailLines,
  disposeTrailLine,
  syncTrailLine,
  writeTrailPositions,
} from "./trailGeometry.js";

function particle(x: number, y: number, z: number): TracerParticle {
  return { position: { x, y, z }, age: 0, active: true };
}

function attributeXYZ(
  geometry: THREE.BufferGeometry,
  vertexCount: number,
): Vec3[] {
  const array = geometry.getAttribute("position")!.array;
  const points: Vec3[] = [];
  for (let i = 0; i < vertexCount; i++) {
    points.push({
      x: array[i * 3]!,
      y: array[i * 3 + 1]!,
      z: array[i * 3 + 2]!,
    });
  }
  return points;
}

describe("trail geometry (no WebGLRenderer)", () => {
  it("creates one Line per tracer when trail-enabled", () => {
    const lines = createTrailLines(2, TRACER_COLORS);
    expect(lines).toHaveLength(2);
    expect(lines[0]).toBeInstanceOf(THREE.Line);
    expect(lines[1]).toBeInstanceOf(THREE.Line);
    expect(lines[0]!.geometry).toBeInstanceOf(THREE.BufferGeometry);
    expect(lines[1]!.geometry).toBeInstanceOf(THREE.BufferGeometry);
  });

  it("creates no line objects when tracer count is 0", () => {
    expect(createTrailLines(0, TRACER_COLORS)).toEqual([]);
  });

  it("syncs a one-point history without throwing", () => {
    const line = createTrailLine(TRACER_COLORS[0]);
    const points = [{ x: 0, y: 1000, z: 4000 }];
    expect(() => syncTrailLine(line, points)).not.toThrow();
    expect(line.geometry.drawRange).toEqual({ start: 0, count: 1 });
    expect(attributeXYZ(line.geometry, 1)).toEqual(points);
    expect(line.visible).toBe(true);
  });

  it("writes multi-point history in chronological order", () => {
    const geometry = new THREE.BufferGeometry();
    const points = [
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 2, z: 3 },
      { x: 4, y: 5, z: 6 },
    ];
    writeTrailPositions(geometry, points);
    expect(geometry.drawRange.count).toBe(3);
    expect(attributeXYZ(geometry, 3)).toEqual(points);
  });

  it("updates geometry when history grows", () => {
    const line = createTrailLine(TRACER_COLORS[0]);
    syncTrailLine(line, [{ x: 0, y: 0, z: 0 }]);
    syncTrailLine(line, [
      { x: 0, y: 0, z: 0 },
      { x: 10, y: 20, z: 30 },
      { x: 40, y: 50, z: 60 },
    ]);
    expect(line.geometry.drawRange.count).toBe(3);
    expect(attributeXYZ(line.geometry, 3)).toEqual([
      { x: 0, y: 0, z: 0 },
      { x: 10, y: 20, z: 30 },
      { x: 40, y: 50, z: 60 },
    ]);
  });

  it("uses the corresponding glyph color for each trail", () => {
    const lines = createTrailLines(3, TRACER_COLORS);
    expect((lines[0]!.material as THREE.LineBasicMaterial).color.getHex()).toBe(
      TRACER_COLORS[0],
    );
    expect((lines[1]!.material as THREE.LineBasicMaterial).color.getHex()).toBe(
      TRACER_COLORS[1],
    );
    expect((lines[2]!.material as THREE.LineBasicMaterial).color.getHex()).toBe(
      TRACER_COLORS[2],
    );
  });

  it("copies snapshots and does not mutate history or particles", () => {
    const particles = [particle(0, 1000, 0)];
    const history = new TracerPathHistory(1);
    history.captureInitial(particles);
    particles[0]!.position = { x: 5, y: 1000, z: 0 };
    history.recordAfterStep(particles);
    const snapshot = history.pointsFor(0);

    const line = createTrailLine(TRACER_COLORS[0]);
    syncTrailLine(line, snapshot);

    particles[0]!.position.x = 999;
    snapshot[0]!.x = 888;
    expect(history.pointsFor(0)).toEqual([
      { x: 0, y: 1000, z: 0 },
      { x: 5, y: 1000, z: 0 },
    ]);
    expect(attributeXYZ(line.geometry, 2)).toEqual([
      { x: 0, y: 1000, z: 0 },
      { x: 5, y: 1000, z: 0 },
    ]);
  });

  it("disposes owned geometry and material", () => {
    const line = createTrailLine(TRACER_COLORS[0]);
    const material = line.material as THREE.LineBasicMaterial;
    let geometryDisposed = false;
    let materialDisposed = false;
    line.geometry.addEventListener("dispose", () => {
      geometryDisposed = true;
    });
    material.addEventListener("dispose", () => {
      materialDisposed = true;
    });
    disposeTrailLine(line);
    expect(geometryDisposed).toBe(true);
    expect(materialDisposed).toBe(true);
  });

  it("hides a line when history is empty", () => {
    const line = createTrailLine(TRACER_COLORS[0]);
    syncTrailLine(line, [{ x: 1, y: 2, z: 3 }]);
    syncTrailLine(line, []);
    expect(line.visible).toBe(false);
    expect(line.geometry.drawRange.count).toBe(0);
  });
});

describe("trail primitive stays pedagogy-agnostic; live wiring is optional", () => {
  it("lets TracerViewport enable trails only when pathHistory is provided", () => {
    expect(tracerViewportSrc).toMatch(/trails:\s*pathHistory !== null/);
    expect(tracerViewportSrc).toMatch(/keepInactiveGlyphs/);
    expect(tracerViewportSrc).toMatch(/syncFromPathHistory/);
    expect(tracerViewportSrc).toMatch(/recordAfterStep/);
    expect(tracerViewportSrc).toMatch(/pathHistory\?\.recordAfterStep/);
    expect(appSrc).toMatch(/createDemoPathHistory/);
    expect(appSrc).toMatch(/pathHistory/);
  });

  it("does not put pedagogy, sampling, or simulation writes in the trail primitive", () => {
    expect(tracerSceneSrc).not.toMatch(/TracerPedagogy/);
    expect(tracerSceneSrc).toMatch(/syncFromPathHistory/);
    expect(tracerSceneSrc).not.toMatch(/recordAfterStep/);
    expect(tracerSceneSrc).not.toMatch(/captureInitial/);
    expect(tracerSceneSrc).not.toMatch(/simulation\.step/);
    expect(trailGeometrySrc).not.toMatch(/TracerPedagogy/);
    expect(trailGeometrySrc).not.toMatch(/recordAfterStep/);
    expect(trailGeometrySrc).not.toMatch(/Simulation/);
    expect(trailGeometrySrc).not.toMatch(/requestAnimationFrame/);
  });
});
