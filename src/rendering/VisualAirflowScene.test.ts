import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { EulerIntegrator } from "../core/integrators/EulerIntegrator.js";
import { ConstantVelocityField } from "../physics/synthetic/ConstantVelocityField.js";
import { VisualAirflowPopulation } from "../visualization/VisualAirflowPopulation.js";
import { SELECTED_TRACER_GLYPH_COLOR, TRACER_COLORS } from "./tracerObserveSlot.js";
import { RELEASE_PREVIEW_COLOR } from "./releasePreviewMarker.js";
import { VISUAL_AIRFLOW_MARKER } from "./visualAirflowAppearance.js";
import { VisualAirflowScene } from "./VisualAirflowScene.js";
import visualAirflowSceneSrc from "./VisualAirflowScene.ts?raw";
import tracerSceneSrc from "./TracerScene.ts?raw";

function populationOf(count: number) {
  return new VisualAirflowPopulation(
    new ConstantVelocityField({ x: 10, y: 0, z: 0 }),
    new EulerIntegrator(),
    {
      count,
      maxAge: 100,
      jitterSeed: 1,
      volume: {
        min: { x: 0, y: 0, z: 0 },
        max: { x: 20, y: 20, z: 20 },
      },
    },
  );
}

describe("VisualAirflowScene", () => {
  it("creates exactly the population budget of point vertices", () => {
    const scene = new VisualAirflowScene(8);
    expect(scene.vertexCount).toBe(8);
    expect(scene.object).toBeInstanceOf(THREE.Points);
    expect(scene.object.geometry).toBeInstanceOf(THREE.BufferGeometry);
    expect(
      scene.object.geometry.getAttribute("position").count,
    ).toBe(8);
    scene.dispose();
  });

  it("syncs positions without recreating geometry or the Points object", () => {
    const population = populationOf(4);
    const scene = new VisualAirflowScene(4);
    const geometry = scene.object.geometry;
    const points = scene.object;
    scene.syncFromPopulation(population);
    const first = Array.from(
      (geometry.getAttribute("position") as THREE.BufferAttribute).array,
    );
    const firstOccupant = population.occupants()[0]!.position;
    expect(first[0]).toBeCloseTo(firstOccupant.x, 5);
    expect(first[1]).toBeCloseTo(firstOccupant.y, 5);
    expect(first[2]).toBeCloseTo(firstOccupant.z, 5);

    population.step(1, 0);
    scene.syncFromPopulation(population);
    expect(scene.object).toBe(points);
    expect(scene.object.geometry).toBe(geometry);
    const second = Array.from(
      (geometry.getAttribute("position") as THREE.BufferAttribute).array,
    );
    expect(second).not.toEqual(first);
    const moved = population.occupants()[0]!.position;
    expect(second[0]).toBeCloseTo(moved.x, 5);
    expect(second[1]).toBeCloseTo(moved.y, 5);
    expect(second[2]).toBeCloseTo(moved.z, 5);
    scene.dispose();
  });

  it("is not a scientific tracer slot and has no tracerId semantics", () => {
    const scene = new VisualAirflowScene(2);
    expect(scene.object).not.toBeInstanceOf(THREE.Mesh);
    expect(scene.object.name).toBe("visualAirflowPopulation");
    expect(scene.object.userData.tracerId).toBeUndefined();
    expect("tracerId" in scene.object.userData).toBe(false);
    const material = scene.object.material as THREE.PointsMaterial;
    expect(material.color.getHex()).toBe(VISUAL_AIRFLOW_MARKER.color);
    expect(material.fog).toBe(true);
    expect(TRACER_COLORS).not.toContain(VISUAL_AIRFLOW_MARKER.color);
    expect(material.color.getHex()).not.toBe(SELECTED_TRACER_GLYPH_COLOR);
    expect(material.color.getHex()).not.toBe(RELEASE_PREVIEW_COLOR);
    scene.dispose();
  });

  it("is not pickable as a scientific glyph", () => {
    const scene = new VisualAirflowScene(1);
    scene.object.position.set(0, 0, 0);
    scene.object.updateMatrixWorld(true);

    const raycaster = new THREE.Raycaster(
      new THREE.Vector3(0, 0, 10),
      new THREE.Vector3(0, 0, -1),
    );
    expect(raycaster.intersectObject(scene.object, false)).toEqual([]);
    // Product pick only scans TracerScene scientific slots, never airflow.
    expect(tracerSceneSrc).toMatch(
      /pickVisibleTracerSlotAtClientPoint\(\s*this\.slots/,
    );
    expect(tracerSceneSrc).not.toMatch(
      /pickVisibleTracerSlotAtClientPoint\([^\)]*visualAirflow/,
    );
    scene.dispose();
  });

  it("disposes geometry and material once", () => {
    const scene = new VisualAirflowScene(3);
    const geometry = scene.object.geometry;
    const material = scene.object.material as THREE.PointsMaterial;
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

  it("stays out of TracerScene scientific slots and picking", () => {
    expect(visualAirflowSceneSrc).toMatch(/THREE\.Points/);
    expect(visualAirflowSceneSrc).toMatch(/raycast = \(\) => \{\}/);
    expect(visualAirflowSceneSrc).not.toMatch(/userData\.tracerId/);
    expect(visualAirflowSceneSrc).not.toMatch(/readonly tracerId/);
    expect(visualAirflowSceneSrc).not.toMatch(/addTracerSlot/);
    expect(tracerSceneSrc).toMatch(/attachVisualAirflow/);
    expect(tracerSceneSrc).toMatch(
      /pickVisibleTracerSlotAtClientPoint\(\s*this\.slots/,
    );
    expect(tracerSceneSrc).not.toMatch(
      /pickVisibleTracerSlotAtClientPoint\([^\)]*visualAirflow/,
    );
  });
});
