import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { EulerIntegrator } from "../core/integrators/EulerIntegrator.js";
import { ConstantVelocityField } from "../physics/synthetic/ConstantVelocityField.js";
import { writeAdvectedOrientedAirflow } from "../visualization/observeAdvectedOrientedAirflow.js";
import { cometFadeFromAges } from "../visualization/cometAirflowMark.js";
import { VisualAirflowPopulation } from "../visualization/VisualAirflowPopulation.js";
import { pickVisibleTracerSlotIndex } from "./pickVisibleTracerSlot.js";
import { CometAirflowMarkScene } from "./CometAirflowMarkScene.js";
import cometSceneSrc from "./CometAirflowMarkScene.ts?raw";
import { SELECTED_TRACER_GLYPH_COLOR, TRACER_COLORS } from "./tracerObserveSlot.js";
import { UPDRAFT_HIGHLIGHT_HUE } from "../visualization/operandContributionDisplay.js";

describe("CometAirflowMarkScene", () => {
  it("creates batched LineSegments with four segments per occupant", () => {
    const scene = new CometAirflowMarkScene(3);
    expect(scene.markCount).toBe(3);
    expect(scene.segmentCount).toBe(4);
    expect(scene.object).toBeInstanceOf(THREE.LineSegments);
    expect(scene.object.geometry.getAttribute("position").count).toBe(24);
    scene.dispose();
  });

  it("keeps geometry identity across sync and is not pickable", () => {
    const field = new ConstantVelocityField({ x: 4, y: 0, z: 0 });
    const population = new VisualAirflowPopulation(field, new EulerIntegrator(), {
      count: 2,
      maxAge: 80,
      jitterSeed: 1,
      volume: {
        min: { x: 0, y: 0, z: 0 },
        max: { x: 20, y: 20, z: 20 },
      },
    });
    const scene = new CometAirflowMarkScene(2);
    const geometry = scene.object.geometry;
    const lines = scene.object;
    const positions = new Float32Array(6);
    const directions = new Float32Array(6);
    const ages = new Float32Array(2);
    const fade = new Float32Array(2);
    writeAdvectedOrientedAirflow(population, field, 0, positions, directions);
    population.writeAgesTo(ages);
    cometFadeFromAges(ages, 2, population.retirementAge, fade);
    scene.syncFromObservation(positions, directions, fade);
    population.step(1, 0);
    writeAdvectedOrientedAirflow(population, field, 1, positions, directions);
    population.writeAgesTo(ages);
    cometFadeFromAges(ages, 2, population.retirementAge, fade);
    scene.syncFromObservation(positions, directions, fade);
    expect(scene.object).toBe(lines);
    expect(scene.object.geometry).toBe(geometry);

    const raycaster = new THREE.Raycaster(
      new THREE.Vector3(0, 0, 10),
      new THREE.Vector3(0, 0, -1),
    );
    expect(raycaster.intersectObject(scene.object, false)).toEqual([]);
    expect(
      pickVisibleTracerSlotIndex([{ mesh: scene.object }], {
        origin: { x: 0, y: 0, z: 10 },
        direction: { x: 0, y: 0, z: -1 },
      }),
    ).toBeNull();
    expect(TRACER_COLORS).not.toContain(UPDRAFT_HIGHLIGHT_HUE);
    expect(UPDRAFT_HIGHLIGHT_HUE).not.toBe(SELECTED_TRACER_GLYPH_COLOR);
    expect(cometSceneSrc).not.toMatch(/from ["'][^"']*TracerPathHistory/);
    expect(cometSceneSrc).not.toMatch(/userData\.tracerId/);
    scene.dispose();
  });
});
