import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { EulerIntegrator } from "../core/integrators/EulerIntegrator.js";
import { ConstantVelocityField } from "../physics/synthetic/ConstantVelocityField.js";
import { EulerianAirflowSamples } from "../visualization/EulerianAirflowSamples.js";
import { VisualAirflowPopulation } from "../visualization/VisualAirflowPopulation.js";
import { VisualAirflowWorkbenchScene } from "./VisualAirflowWorkbenchScene.js";
import workbenchSrc from "./VisualAirflowWorkbenchScene.ts?raw";

function fixtures(count = 4) {
  const field = new ConstantVelocityField({ x: 2, y: 0, z: 0 });
  const volume = {
    min: { x: 0, y: 0, z: 0 },
    max: { x: 12, y: 12, z: 12 },
  };
  const population = new VisualAirflowPopulation(field, new EulerIntegrator(), {
    count,
    maxAge: 80,
    jitterSeed: 1,
    volume,
  });
  const eulerian = new EulerianAirflowSamples(field, {
    count,
    jitterSeed: 1,
    volume,
  });
  return { field, population, eulerian };
}

describe("VisualAirflowWorkbenchScene", () => {
  it("keeps R0 as Points and toggles visibility without disposing siblings", () => {
    const { field, population, eulerian } = fixtures();
    const scene = new VisualAirflowWorkbenchScene(4, 4);
    expect(scene.object).toBeInstanceOf(THREE.Group);
    const points = scene.object.children.find(
      (child) => child instanceof THREE.Points,
    ) as THREE.Points;
    const lines = scene.object.children.filter(
      (child) => child instanceof THREE.LineSegments,
    );
    expect(points).toBeInstanceOf(THREE.Points);
    expect(lines).toHaveLength(2);
    const pointsGeometry = points.geometry;
    scene.sync({
      mode: "points",
      population,
      eulerian,
      field,
      time: 0,
    });
    expect(points.visible).toBe(true);
    expect(lines[0]!.visible).toBe(false);
    expect(lines[1]!.visible).toBe(false);

    scene.sync({
      mode: "advected-oriented",
      population,
      eulerian,
      field,
      time: 0,
    });
    expect(points.visible).toBe(false);
    expect(lines[0]!.visible).toBe(true);
    expect(lines[1]!.visible).toBe(false);
    expect(points.geometry).toBe(pointsGeometry);

    scene.sync({
      mode: "eulerian-oriented",
      population,
      eulerian,
      field,
      time: 0,
    });
    expect(points.visible).toBe(false);
    expect(lines[0]!.visible).toBe(false);
    expect(lines[1]!.visible).toBe(true);
    scene.dispose();
  });

  it("disposes all encoding resources together", () => {
    const scene = new VisualAirflowWorkbenchScene(2, 2);
    const geometries = scene.object.children.map(
      (child) => (child as THREE.Points).geometry,
    );
    let disposed = 0;
    for (const geometry of geometries) {
      geometry.addEventListener("dispose", () => {
        disposed += 1;
      });
    }
    scene.dispose();
    scene.dispose();
    expect(disposed).toBe(3);
  });

  it("does not pick background encodings and is not a tracer owner", () => {
    const scene = new VisualAirflowWorkbenchScene(1, 1);
    for (const child of scene.object.children) {
      expect(child.userData.tracerId).toBeUndefined();
      const raycaster = new THREE.Raycaster(
        new THREE.Vector3(0, 0, 10),
        new THREE.Vector3(0, 0, -1),
      );
      expect(raycaster.intersectObject(child, false)).toEqual([]);
    }
    expect(workbenchSrc).not.toMatch(/tracerId/);
    expect(workbenchSrc).not.toMatch(/TracerPathHistory/);
    scene.dispose();
  });
});
