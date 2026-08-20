import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { EulerIntegrator } from "../core/integrators/EulerIntegrator.js";
import { ConstantVelocityField } from "../physics/synthetic/ConstantVelocityField.js";
import { EulerianAirflowSamples } from "../visualization/EulerianAirflowSamples.js";
import { writeAdvectedOrientedAirflow } from "../visualization/observeAdvectedOrientedAirflow.js";
import { VisualAirflowPopulation } from "../visualization/VisualAirflowPopulation.js";
import { TRACER_COLORS } from "./tracerObserveSlot.js";
import { RELEASE_PREVIEW_COLOR } from "./releasePreviewMarker.js";
import { SELECTION_HALO_COLOR } from "./selectionHaloMarker.js";
import { VISUAL_AIRFLOW_ORIENTED_MARK } from "./visualAirflowAppearance.js";
import { linearRgbFromSrgbHex } from "./vertexColorSpace.js";
import { OrientedAirflowMarkScene } from "./OrientedAirflowMarkScene.js";
import orientedSrc from "./OrientedAirflowMarkScene.ts?raw";
import tracerSceneSrc from "./TracerScene.ts?raw";

function cubePopulation(
  count: number,
  field = new ConstantVelocityField({ x: 4, y: 0, z: 0 }),
) {
  return new VisualAirflowPopulation(field, new EulerIntegrator(), {
    count,
    maxAge: 100,
    jitterSeed: 1,
    volume: {
      min: { x: 0, y: 0, z: 0 },
      max: { x: 20, y: 20, z: 20 },
    },
  });
}

describe("OrientedAirflowMarkScene", () => {
  it("creates a batched LineSegments with two vertices per mark", () => {
    const scene = new OrientedAirflowMarkScene(5);
    expect(scene.markCount).toBe(5);
    expect(scene.object).toBeInstanceOf(THREE.LineSegments);
    expect(scene.object.geometry.getAttribute("position").count).toBe(10);
    expect(scene.object.geometry.getAttribute("color").count).toBe(10);
    scene.dispose();
  });

  it("syncs endpoints without recreating geometry or the LineSegments object", () => {
    const field = new ConstantVelocityField({ x: 4, y: 0, z: 0 });
    const population = cubePopulation(3, field);
    const scene = new OrientedAirflowMarkScene(3);
    const geometry = scene.object.geometry;
    const lines = scene.object;
    const positions = new Float32Array(9);
    const directions = new Float32Array(9);
    writeAdvectedOrientedAirflow(population, field, 0, positions, directions);
    scene.syncFromObservation(positions, directions);
    const first = Array.from(
      (geometry.getAttribute("position") as THREE.BufferAttribute).array,
    );
    population.step(1, 0);
    writeAdvectedOrientedAirflow(population, field, 1, positions, directions);
    scene.syncFromObservation(positions, directions);
    expect(scene.object).toBe(lines);
    expect(scene.object.geometry).toBe(geometry);
    const second = Array.from(
      (geometry.getAttribute("position") as THREE.BufferAttribute).array,
    );
    expect(second).not.toEqual(first);
    scene.dispose();
  });

  it("stores head–tail color and alpha asymmetry that is not a scientific trail", () => {
    const scene = new OrientedAirflowMarkScene(1);
    const attribute = scene.object.geometry.getAttribute(
      "color",
    ) as THREE.BufferAttribute;
    // itemSize 4 is what makes Three.js honour per-vertex alpha.
    expect(attribute.itemSize).toBe(4);
    const colors = attribute.array;
    const tailLum = colors[0]! + colors[1]! + colors[2]!;
    const headLum = colors[4]! + colors[5]! + colors[6]!;
    expect(headLum).toBeGreaterThan(tailLum);
    expect(colors[7]!).toBeGreaterThan(colors[3]!);
    const material = scene.object.material as THREE.LineBasicMaterial;
    expect(material.vertexColors).toBe(true);
    expect(TRACER_COLORS).not.toContain(VISUAL_AIRFLOW_ORIENTED_MARK.headColor);
    expect(VISUAL_AIRFLOW_ORIENTED_MARK.headColor).not.toBe(
      SELECTION_HALO_COLOR,
    );
    expect(VISUAL_AIRFLOW_ORIENTED_MARK.headColor).not.toBe(RELEASE_PREVIEW_COLOR);
    expect(orientedSrc).not.toMatch(/TracerPathHistory/);
    expect(orientedSrc).not.toMatch(/userData\.tracerId/);
    scene.dispose();
  });

  it("writes the palette in the renderer working color space", () => {
    const scene = new OrientedAirflowMarkScene(1);
    const colors = (
      scene.object.geometry.getAttribute("color") as THREE.BufferAttribute
    ).array;
    const tail = linearRgbFromSrgbHex(VISUAL_AIRFLOW_ORIENTED_MARK.tailColor);
    const head = linearRgbFromSrgbHex(VISUAL_AIRFLOW_ORIENTED_MARK.headColor);
    expect(colors[0]!).toBeCloseTo(tail.r, 6);
    expect(colors[1]!).toBeCloseTo(tail.g, 6);
    expect(colors[2]!).toBeCloseTo(tail.b, 6);
    expect(colors[4]!).toBeCloseTo(head.r, 6);
    expect(colors[5]!).toBeCloseTo(head.g, 6);
    expect(colors[6]!).toBeCloseTo(head.b, 6);
    // Raw sRGB channel fractions would lift the dark end of the ramp.
    const rawTailRed = ((VISUAL_AIRFLOW_ORIENTED_MARK.tailColor >> 16) & 255) / 255;
    expect(colors[0]!).toBeLessThan(rawTailRed);
    scene.dispose();
  });

  it("is not pickable as a scientific glyph", () => {
    const scene = new OrientedAirflowMarkScene(1);
    scene.object.position.set(0, 0, 0);
    scene.object.updateMatrixWorld(true);
    const raycaster = new THREE.Raycaster(
      new THREE.Vector3(0, 0, 10),
      new THREE.Vector3(0, 0, -1),
    );
    expect(raycaster.intersectObject(scene.object, false)).toEqual([]);
    expect(tracerSceneSrc).toMatch(
      /pickVisibleTracerSlotAtClientPoint\(\s*this\.slots/,
    );
    expect(tracerSceneSrc).not.toMatch(
      /pickVisibleTracerSlotAtClientPoint\([^\)]*oriented/,
    );
    scene.dispose();
  });

  it("disposes geometry and material once", () => {
    const scene = new OrientedAirflowMarkScene(2);
    const geometry = scene.object.geometry;
    const material = scene.object.material as THREE.LineBasicMaterial;
    let geometryDisposed = false;
    let materialDisposed = false;
    geometry.addEventListener("dispose", () => {
      geometryDisposed = true;
    });
    material.addEventListener("dispose", () => {
      materialDisposed = true;
    });
    scene.dispose();
    scene.dispose();
    expect(geometryDisposed).toBe(true);
    expect(materialDisposed).toBe(true);
  });
});

describe("Eulerian mark observation into LineSegments", () => {
  it("writes a matching batched mark count from Eulerian samples", () => {
    const field = new ConstantVelocityField({ x: 0, y: 1, z: 0 });
    const samples = new EulerianAirflowSamples(field, {
      count: 6,
      jitterSeed: 1,
      volume: {
        min: { x: 0, y: 0, z: 0 },
        max: { x: 10, y: 10, z: 10 },
      },
    });
    const scene = new OrientedAirflowMarkScene(6);
    const positions = new Float32Array(18);
    const directions = new Float32Array(18);
    samples.writePositionsTo(positions);
    samples.writeUnitDirectionsTo(0, directions);
    scene.syncFromObservation(positions, directions);
    expect(scene.markCount).toBe(samples.sampleCount);
    expect(scene.object.geometry.getAttribute("position").count).toBe(12);
    scene.dispose();
  });
});
