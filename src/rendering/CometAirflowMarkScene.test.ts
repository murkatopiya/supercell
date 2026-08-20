import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { EulerIntegrator } from "../core/integrators/EulerIntegrator.js";
import { ConstantVelocityField } from "../physics/synthetic/ConstantVelocityField.js";
import { writeAdvectedOrientedAirflow } from "../visualization/observeAdvectedOrientedAirflow.js";
import { cometFadeFromAges } from "../visualization/cometAirflowMark.js";
import { VisualAirflowPopulation } from "../visualization/VisualAirflowPopulation.js";
import { CometAirflowMarkScene } from "./CometAirflowMarkScene.js";
import cometSceneSrc from "./CometAirflowMarkScene.ts?raw";
import { TRACER_COLORS } from "./tracerObserveSlot.js";
import { SELECTION_HALO_COLOR } from "./selectionHaloMarker.js";
import { OPERAND_HIGHLIGHT_PROTOTYPE_HUE } from "../visualization/operandContributionDisplay.js";
import { VISUAL_AIRFLOW_COMET } from "./visualAirflowAppearance.js";
import { linearRgbFromSrgbHex } from "./vertexColorSpace.js";
import tracerSceneSrc from "./TracerScene.ts?raw";

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
    expect(tracerSceneSrc).toMatch(
      /pickVisibleTracerSlotAtClientPoint\(\s*this\.slots/,
    );
    expect(tracerSceneSrc).not.toMatch(
      /pickVisibleTracerSlotAtClientPoint\([^\)]*comet/,
    );
    expect(TRACER_COLORS).not.toContain(OPERAND_HIGHLIGHT_PROTOTYPE_HUE);
    expect(OPERAND_HIGHLIGHT_PROTOTYPE_HUE).not.toBe(
      SELECTION_HALO_COLOR,
    );
    expect(cometSceneSrc).not.toMatch(/from ["'][^"']*TracerPathHistory/);
    expect(cometSceneSrc).not.toMatch(/userData\.tracerId/);
    scene.dispose();
  });

  it("tapers alpha toward the tail and leaves RGB for hue", () => {
    const scene = new CometAirflowMarkScene(1);
    const positions = new Float32Array([0, 0, 0]);
    const directions = new Float32Array([1, 0, 0]);
    scene.syncFromObservation(positions, directions, new Float32Array([1]));
    const attribute = scene.object.geometry.getAttribute(
      "color",
    ) as THREE.BufferAttribute;
    // itemSize 4 is what makes Three.js honour per-vertex alpha.
    expect(attribute.itemSize).toBe(4);
    const colors = attribute.array;

    const tailAlpha = colors[3]!;
    const headAlpha = colors[attribute.count * 4 - 1]!;
    expect(tailAlpha).toBe(0);
    expect(headAlpha).toBeCloseTo(VISUAL_AIRFLOW_COMET.headOpacity, 6);
    for (let vertex = 1; vertex < attribute.count; vertex++) {
      expect(colors[vertex * 4 + 3]!).toBeGreaterThanOrEqual(
        colors[(vertex - 1) * 4 + 3]!,
      );
    }

    const tailColor = linearRgbFromSrgbHex(VISUAL_AIRFLOW_COMET.tailColor);
    const headColor = linearRgbFromSrgbHex(VISUAL_AIRFLOW_COMET.headColor);
    // The tail keeps its own chroma at zero alpha instead of being scaled
    // toward black, so the fade removes the mark rather than darkening it.
    expect(colors[0]!).toBeCloseTo(tailColor.r, 6);
    expect(colors[attribute.count * 4 - 4]!).toBeCloseTo(headColor.r, 6);
    scene.dispose();
  });

  it("scales alpha, not RGB, by occupancy fade", () => {
    const scene = new CometAirflowMarkScene(1);
    const positions = new Float32Array([0, 0, 0]);
    const directions = new Float32Array([1, 0, 0]);
    const attribute = scene.object.geometry.getAttribute(
      "color",
    ) as THREE.BufferAttribute;

    scene.syncFromObservation(positions, directions, new Float32Array([1]));
    const opaque = Array.from(attribute.array);
    scene.syncFromObservation(positions, directions, new Float32Array([0.25]));
    const faded = Array.from(attribute.array);

    for (let vertex = 0; vertex < attribute.count; vertex++) {
      const offset = vertex * 4;
      expect(faded[offset]!).toBeCloseTo(opaque[offset]!, 6);
      expect(faded[offset + 1]!).toBeCloseTo(opaque[offset + 1]!, 6);
      expect(faded[offset + 2]!).toBeCloseTo(opaque[offset + 2]!, 6);
      expect(faded[offset + 3]!).toBeCloseTo(opaque[offset + 3]! * 0.25, 6);
    }
    scene.dispose();
  });

  it("moves highlight strength into chroma without touching the fade", () => {
    const scene = new CometAirflowMarkScene(1);
    const positions = new Float32Array([0, 0, 0]);
    const directions = new Float32Array([1, 0, 0]);
    const fade = new Float32Array([1]);
    const attribute = scene.object.geometry.getAttribute(
      "color",
    ) as THREE.BufferAttribute;

    scene.syncFromObservation(positions, directions, fade);
    const neutral = Array.from(attribute.array);
    scene.syncFromObservation(
      positions,
      directions,
      fade,
      new Float32Array([1]),
      OPERAND_HIGHLIGHT_PROTOTYPE_HUE,
    );
    const tinted = Array.from(attribute.array);

    const hue = linearRgbFromSrgbHex(OPERAND_HIGHLIGHT_PROTOTYPE_HUE);
    for (let vertex = 0; vertex < attribute.count; vertex++) {
      const offset = vertex * 4;
      expect(tinted[offset]!).toBeCloseTo(hue.r, 6);
      expect(tinted[offset + 1]!).toBeCloseTo(hue.g, 6);
      expect(tinted[offset + 2]!).toBeCloseTo(hue.b, 6);
      expect(tinted[offset + 3]!).toBeCloseTo(neutral[offset + 3]!, 6);
    }
    // Full strength must be a visible chroma change at the head, where the
    // neutral palette is brightest and a tint is easiest to lose.
    const headRed = attribute.count * 4 - 4;
    const chromaDelta = Math.hypot(
      tinted[headRed]! - neutral[headRed]!,
      tinted[headRed + 1]! - neutral[headRed + 1]!,
      tinted[headRed + 2]! - neutral[headRed + 2]!,
    );
    expect(chromaDelta).toBeGreaterThan(0.2);
    scene.dispose();
  });

  it("keeps head–tail alpha and endpoints when only display strength changes", () => {
    const scene = new CometAirflowMarkScene(1);
    const positions = new Float32Array([0, 0, 0]);
    const directions = new Float32Array([1, 0, 0]);
    const fade = new Float32Array([1]);
    const attribute = scene.object.geometry.getAttribute(
      "color",
    ) as THREE.BufferAttribute;
    const positionAttribute = scene.object.geometry.getAttribute(
      "position",
    ) as THREE.BufferAttribute;

    scene.syncFromObservation(
      positions,
      directions,
      fade,
      new Float32Array([0]),
      OPERAND_HIGHLIGHT_PROTOTYPE_HUE,
    );
    const none = Array.from(attribute.array);
    const endpoints = Array.from(positionAttribute.array);
    scene.syncFromObservation(
      positions,
      directions,
      fade,
      new Float32Array([1]),
      OPERAND_HIGHLIGHT_PROTOTYPE_HUE,
    );
    const full = Array.from(attribute.array);

    const head = attribute.count * 4 - 4;
    expect(none[3]!).toBe(0);
    expect(none[head + 3]!).toBeCloseTo(VISUAL_AIRFLOW_COMET.headOpacity, 6);
    expect(full[3]!).toBe(none[3]!);
    expect(full[head + 3]!).toBe(none[head + 3]!);
    expect(Array.from(positionAttribute.array)).toEqual(endpoints);
    expect(full).not.toEqual(none);
    scene.dispose();
  });
});
