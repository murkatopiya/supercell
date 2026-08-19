import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { UPDRAFT_HIGHLIGHT_HUE } from "../visualization/operandContributionDisplay.js";
import { OperandHighlightBackgroundScene } from "./OperandHighlightBackgroundScene.js";
import { VISUAL_AIRFLOW_HIGHLIGHT_BACKGROUND } from "./visualAirflowAppearance.js";
import { linearRgbFromSrgbHex } from "./vertexColorSpace.js";

function colorArray(scene: OperandHighlightBackgroundScene) {
  return (
    scene.object.geometry.getAttribute("color") as THREE.BufferAttribute
  ).array;
}

describe("OperandHighlightBackgroundScene", () => {
  it("maps display strength to alpha so zero contribution draws nothing", () => {
    const scene = new OperandHighlightBackgroundScene(3);
    const positions = new Float32Array([0, 0, 0, 100, 0, 0, 200, 0, 0]);
    scene.syncFromStrengths(positions, new Float32Array([0, 0.5, 1]));
    const colors = colorArray(scene);
    const peak = VISUAL_AIRFLOW_HIGHLIGHT_BACKGROUND.peakOpacity;

    expect(colors[3]!).toBe(0);
    expect(colors[7]!).toBeCloseTo(peak * 0.5, 6);
    expect(colors[11]!).toBeCloseTo(peak, 6);

    // Hue stays constant: a zero-strength sample must not paint a dark sprite
    // over the scene, which is what scaling RGB against a fixed opacity does.
    const hue = linearRgbFromSrgbHex(UPDRAFT_HIGHLIGHT_HUE);
    for (let sample = 0; sample < 3; sample++) {
      const offset = sample * 4;
      expect(colors[offset]!).toBeCloseTo(hue.r, 6);
      expect(colors[offset + 1]!).toBeCloseTo(hue.g, 6);
      expect(colors[offset + 2]!).toBeCloseTo(hue.b, 6);
    }
    scene.dispose();
  });

  it("uses a radial alpha sprite instead of the default square point", () => {
    const scene = new OperandHighlightBackgroundScene(1);
    const material = scene.object.material as THREE.PointsMaterial;
    const sprite = material.alphaMap as THREE.DataTexture;
    expect(sprite).toBeInstanceOf(THREE.DataTexture);
    expect(material.transparent).toBe(true);
    expect(material.vertexColors).toBe(true);
    expect(
      (scene.object.geometry.getAttribute("color") as THREE.BufferAttribute)
        .itemSize,
    ).toBe(4);

    const resolution = VISUAL_AIRFLOW_HIGHLIGHT_BACKGROUND.spriteResolution;
    const data = sprite.image.data as Uint8Array;
    const centerIndex =
      ((resolution / 2) * resolution + resolution / 2) * 4 + 1;
    const cornerIndex = 1;
    const edgeIndex = ((resolution / 2) * resolution + 1) * 4 + 1;
    expect(data[centerIndex]!).toBeGreaterThan(200);
    expect(data[cornerIndex]!).toBe(0);
    expect(data[edgeIndex]!).toBeLessThan(data[centerIndex]!);
    scene.dispose();
  });

  it("disposes geometry, material, and sprite once", () => {
    const scene = new OperandHighlightBackgroundScene(2);
    const geometry = scene.object.geometry;
    const material = scene.object.material as THREE.PointsMaterial;
    const sprite = material.alphaMap as THREE.DataTexture;
    let disposed = 0;
    for (const resource of [geometry, material, sprite]) {
      resource.addEventListener("dispose", () => {
        disposed += 1;
      });
    }
    scene.dispose();
    scene.dispose();
    expect(disposed).toBe(3);
  });

  it("is not pickable and carries no scientific identity", () => {
    const scene = new OperandHighlightBackgroundScene(1);
    expect(scene.object.userData.tracerId).toBeUndefined();
    const raycaster = new THREE.Raycaster(
      new THREE.Vector3(0, 0, 10),
      new THREE.Vector3(0, 0, -1),
    );
    expect(raycaster.intersectObject(scene.object, false)).toEqual([]);
    scene.dispose();
  });
});
