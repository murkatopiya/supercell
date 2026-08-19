import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { EulerIntegrator } from "../core/integrators/EulerIntegrator.js";
import { ConstantVelocityField } from "../physics/synthetic/ConstantVelocityField.js";
import { EulerianAirflowSamples } from "../visualization/EulerianAirflowSamples.js";
import { writeAdvectedOrientedAirflow } from "../visualization/observeAdvectedOrientedAirflow.js";
import { VisualAirflowPopulation } from "../visualization/VisualAirflowPopulation.js";
import { pickVisibleTracerSlotIndex } from "./pickVisibleTracerSlot.js";
import { SELECTED_TRACER_GLYPH_COLOR, TRACER_COLORS } from "./tracerObserveSlot.js";
import { RELEASE_PREVIEW_COLOR } from "./releasePreviewMarker.js";
import { VISUAL_AIRFLOW_ORIENTED_MARK } from "./visualAirflowAppearance.js";
import { OrientedAirflowMarkScene } from "./OrientedAirflowMarkScene.js";
import orientedSrc from "./OrientedAirflowMarkScene.ts?raw";

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

  it("stores head–tail color asymmetry that is not a scientific trail", () => {
    const scene = new OrientedAirflowMarkScene(1);
    const colors = (
      scene.object.geometry.getAttribute("color") as THREE.BufferAttribute
    ).array;
    const tailLum = colors[0]! + colors[1]! + colors[2]!;
    const headLum = colors[3]! + colors[4]! + colors[5]!;
    expect(headLum).toBeGreaterThan(tailLum);
    const material = scene.object.material as THREE.LineBasicMaterial;
    expect(material.vertexColors).toBe(true);
    expect(TRACER_COLORS).not.toContain(VISUAL_AIRFLOW_ORIENTED_MARK.headColor);
    expect(VISUAL_AIRFLOW_ORIENTED_MARK.headColor).not.toBe(
      SELECTED_TRACER_GLYPH_COLOR,
    );
    expect(VISUAL_AIRFLOW_ORIENTED_MARK.headColor).not.toBe(RELEASE_PREVIEW_COLOR);
    expect(orientedSrc).not.toMatch(/TracerPathHistory/);
    expect(orientedSrc).not.toMatch(/userData\.tracerId/);
    scene.dispose();
  });

  it("is not pickable as a scientific glyph", () => {
    const scene = new OrientedAirflowMarkScene(1);
    scene.object.position.set(0, 0, 0);
    scene.object.updateMatrixWorld(true);
    const ray = {
      origin: { x: 0, y: 0, z: 10 },
      direction: { x: 0, y: 0, z: -1 },
    };
    expect(pickVisibleTracerSlotIndex([{ mesh: scene.object }], ray)).toBeNull();
    const raycaster = new THREE.Raycaster(
      new THREE.Vector3(0, 0, 10),
      new THREE.Vector3(0, 0, -1),
    );
    expect(raycaster.intersectObject(scene.object, false)).toEqual([]);
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
