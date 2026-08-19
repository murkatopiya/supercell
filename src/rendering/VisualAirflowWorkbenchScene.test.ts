import { describe, expect, it } from "vitest";
import * as THREE from "three";
import type { VelocityField } from "../core/fields/VelocityField.js";
import type { Vec3 } from "../core/math/Vec3.js";
import { EulerIntegrator } from "../core/integrators/EulerIntegrator.js";
import { ConstantVelocityField } from "../physics/synthetic/ConstantVelocityField.js";
import { EulerianAirflowSamples } from "../visualization/EulerianAirflowSamples.js";
import { VisualAirflowPopulation } from "../visualization/VisualAirflowPopulation.js";
import { VisualAirflowWorkbenchScene } from "./VisualAirflowWorkbenchScene.js";
import workbenchSrc from "./VisualAirflowWorkbenchScene.ts?raw";

class TimeDependentYField implements VelocityField {
  sample(_position: Vec3, time: number): Vec3 {
    return { x: 0, y: time, z: 0 };
  }
}

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

function syncArgs(
  fx: ReturnType<typeof fixtures>,
  mode: "points" | "advected-oriented" | "advected-comet" | "eulerian-oriented",
) {
  return {
    mode,
    population: fx.population,
    eulerian: fx.eulerian,
    field: fx.field,
    time: 0,
    highlightMode: "off" as const,
    highlightOperand: null,
  };
}

describe("VisualAirflowWorkbenchScene", () => {
  it("keeps R0 as Points and toggles visibility without disposing siblings", () => {
    const fx = fixtures();
    const scene = new VisualAirflowWorkbenchScene(4, 4);
    expect(scene.object).toBeInstanceOf(THREE.Group);
    const points = scene.object.getObjectByName(
      "visualAirflowPopulation",
    ) as THREE.Points;
    const advected = scene.object.getObjectByName("orientedAirflowMarks");
    const comets = scene.object.getObjectByName("cometAirflowMarks");
    const eulerianMarks = scene.object.getObjectByName("eulerianAirflowMarks");
    expect(points).toBeInstanceOf(THREE.Points);
    expect(comets).toBeInstanceOf(THREE.LineSegments);
    expect(eulerianMarks).toBeInstanceOf(THREE.LineSegments);
    const pointsGeometry = points.geometry;
    scene.sync(syncArgs(fx, "points"));
    expect(points.visible).toBe(true);
    expect(advected!.visible).toBe(false);
    expect(comets!.visible).toBe(false);

    scene.sync(syncArgs(fx, "advected-oriented"));
    expect(points.visible).toBe(false);
    expect(advected!.visible).toBe(true);
    expect(comets!.visible).toBe(false);
    expect(points.geometry).toBe(pointsGeometry);

    scene.sync(syncArgs(fx, "advected-comet"));
    expect(comets!.visible).toBe(true);
    expect(advected!.visible).toBe(false);

    scene.sync(syncArgs(fx, "eulerian-oriented"));
    expect(points.visible).toBe(false);
    expect(advected!.visible).toBe(false);
    expect(comets!.visible).toBe(false);
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
    expect(disposed).toBe(5);
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

  it("keeps highlight independent of encoding and samples the operand at laboratory time", () => {
    const fx = fixtures();
    const operand = new TimeDependentYField();
    const scene = new VisualAirflowWorkbenchScene(4, 4);
    const background = scene.object.getObjectByName(
      "updraftHighlightBackground",
    )!;
    const comets = scene.object.getObjectByName("cometAirflowMarks") as THREE.LineSegments;
    scene.sync({
      ...syncArgs(fx, "advected-comet"),
      highlightMode: "off",
      highlightOperand: operand,
    });
    expect(background.visible).toBe(false);
    const offPositions = Array.from(
      (comets.geometry.getAttribute("position") as THREE.BufferAttribute).array,
    );
    const offColors = Array.from(
      (comets.geometry.getAttribute("color") as THREE.BufferAttribute).array,
    );

    scene.sync({
      ...syncArgs(fx, "advected-comet"),
      highlightMode: "comets",
      highlightOperand: operand,
      time: 0,
    });
    expect(background.visible).toBe(false);
    const zeroTintPositions = Array.from(
      (comets.geometry.getAttribute("position") as THREE.BufferAttribute).array,
    );
    const zeroTintColors = Array.from(
      (comets.geometry.getAttribute("color") as THREE.BufferAttribute).array,
    );
    expect(zeroTintPositions).toEqual(offPositions);
    expect(zeroTintColors).toEqual(offColors);

    scene.sync({
      ...syncArgs(fx, "advected-comet"),
      highlightMode: "comets",
      highlightOperand: operand,
      time: 15,
    });
    const tintedPositions = Array.from(
      (comets.geometry.getAttribute("position") as THREE.BufferAttribute).array,
    );
    const tintedColors = Array.from(
      (comets.geometry.getAttribute("color") as THREE.BufferAttribute).array,
    );
    expect(tintedPositions).toEqual(offPositions);
    expect(tintedColors).not.toEqual(offColors);

    scene.sync({
      ...syncArgs(fx, "advected-comet"),
      highlightMode: "background",
      highlightOperand: operand,
      time: 15,
    });
    expect(background.visible).toBe(true);
    expect(comets.visible).toBe(true);
    scene.dispose();
  });

  it("does not construct a second updraft field", () => {
    expect(workbenchSrc).not.toMatch(/createUpdraftField/);
    expect(workbenchSrc).not.toMatch(/VerticalEnvelopeUpdraftField/);
  });
});
