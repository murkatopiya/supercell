import * as THREE from "three";
import {
  ORIENTED_AIRFLOW_MARK_LENGTH_M,
  writeOrientedMarkEndpoints,
} from "../visualization/orientedAirflowMark.js";
import { UPDRAFT_HIGHLIGHT_HUE } from "../visualization/operandContributionDisplay.js";
import { VISUAL_AIRFLOW_ORIENTED_MARK } from "./visualAirflowAppearance.js";

/**
 * Batched head–tail marks. Observe-only: receives positions and unit
 * directions. Does not sample physics, pick, or assign tracerId.
 */
export class OrientedAirflowMarkScene {
  private readonly geometry: THREE.BufferGeometry;
  private readonly vertices: Float32Array;
  private readonly colors: Float32Array;
  private readonly positionAttribute: THREE.BufferAttribute;
  private readonly colorAttribute: THREE.BufferAttribute;
  private readonly material: THREE.LineBasicMaterial;
  private readonly lines: THREE.LineSegments;
  private readonly count: number;
  private disposed = false;

  constructor(count: number, objectName = "orientedAirflowMarks") {
    if (!Number.isInteger(count) || count < 0) {
      throw new Error("count must be an integer >= 0");
    }
    this.count = count;
    this.vertices = new Float32Array(count * 6);
    this.colors = new Float32Array(count * 6);
    writeHeadTailColors(this.colors, count, undefined);

    this.geometry = new THREE.BufferGeometry();
    this.positionAttribute = new THREE.BufferAttribute(this.vertices, 3);
    this.positionAttribute.setUsage(THREE.DynamicDrawUsage);
    this.colorAttribute = new THREE.BufferAttribute(this.colors, 3);
    this.colorAttribute.setUsage(THREE.DynamicDrawUsage);
    this.geometry.setAttribute("position", this.positionAttribute);
    this.geometry.setAttribute("color", this.colorAttribute);

    this.material = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: VISUAL_AIRFLOW_ORIENTED_MARK.opacity,
      depthWrite: false,
      fog: true,
    });

    this.lines = new THREE.LineSegments(this.geometry, this.material);
    this.lines.name = objectName;
    this.lines.renderOrder = -1;
    this.lines.frustumCulled = false;
    this.lines.raycast = () => {};
  }

  get object(): THREE.LineSegments {
    return this.lines;
  }

  get markCount(): number {
    return this.count;
  }

  /**
   * Copy endpoints into the stable buffer. Does not recreate geometry.
   */
  syncFromObservation(
    positions: Float32Array,
    unitDirections: Float32Array,
    highlightStrengths?: Float32Array,
  ): void {
    if (this.disposed) {
      throw new Error("OrientedAirflowMarkScene is disposed");
    }
    writeOrientedMarkEndpoints(
      positions,
      unitDirections,
      this.count,
      ORIENTED_AIRFLOW_MARK_LENGTH_M,
      this.vertices,
    );
    this.positionAttribute.needsUpdate = true;
    writeHeadTailColors(this.colors, this.count, highlightStrengths);
    this.colorAttribute.needsUpdate = true;
  }

  dispose(): void {
    if (this.disposed) {
      return;
    }
    this.disposed = true;
    this.geometry.dispose();
    this.material.dispose();
  }
}

function writeHeadTailColors(
  out: Float32Array,
  count: number,
  highlightStrengths: Float32Array | undefined,
): void {
  const tail = rgb01(VISUAL_AIRFLOW_ORIENTED_MARK.tailColor);
  const head = rgb01(VISUAL_AIRFLOW_ORIENTED_MARK.headColor);
  const hue = rgb01(UPDRAFT_HIGHLIGHT_HUE);
  for (let i = 0; i < count; i++) {
    const strength =
      highlightStrengths === undefined ? 0 : highlightStrengths[i]!;
    const offset = i * 6;
    const tailMix = mixRgb(tail, hue, strength);
    const headMix = mixRgb(head, hue, strength);
    out[offset] = tailMix.r;
    out[offset + 1] = tailMix.g;
    out[offset + 2] = tailMix.b;
    out[offset + 3] = headMix.r;
    out[offset + 4] = headMix.g;
    out[offset + 5] = headMix.b;
  }
}

function mixRgb(
  base: { r: number; g: number; b: number },
  hue: { r: number; g: number; b: number },
  strength: number,
): { r: number; g: number; b: number } {
  const t = strength;
  return {
    r: base.r * (1 - t) + hue.r * t,
    g: base.g * (1 - t) + hue.g * t,
    b: base.b * (1 - t) + hue.b * t,
  };
}

function rgb01(hex: number): { r: number; g: number; b: number } {
  return {
    r: ((hex >> 16) & 255) / 255,
    g: ((hex >> 8) & 255) / 255,
    b: (hex & 255) / 255,
  };
}
