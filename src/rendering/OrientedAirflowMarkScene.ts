import * as THREE from "three";
import {
  ORIENTED_AIRFLOW_MARK_LENGTH_M,
  writeOrientedMarkEndpoints,
} from "../visualization/orientedAirflowMark.js";
import { OPERAND_HIGHLIGHT_PROTOTYPE_HUE } from "../visualization/operandContributionDisplay.js";
import { VISUAL_AIRFLOW_ORIENTED_MARK } from "./visualAirflowAppearance.js";
import { linearRgbFromSrgbHex, type LinearRgb } from "./vertexColorSpace.js";

/** RGBA per vertex. itemSize 4 is what enables per-vertex alpha in Three.js. */
const COLOR_COMPONENTS_PER_VERTEX = 4;

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
    this.colors = new Float32Array(count * 2 * COLOR_COMPONENTS_PER_VERTEX);
    writeHeadTailColors(this.colors, count, undefined);

    this.geometry = new THREE.BufferGeometry();
    this.positionAttribute = new THREE.BufferAttribute(this.vertices, 3);
    this.positionAttribute.setUsage(THREE.DynamicDrawUsage);
    this.colorAttribute = new THREE.BufferAttribute(
      this.colors,
      COLOR_COMPONENTS_PER_VERTEX,
    );
    this.colorAttribute.setUsage(THREE.DynamicDrawUsage);
    this.geometry.setAttribute("position", this.positionAttribute);
    this.geometry.setAttribute("color", this.colorAttribute);

    this.material = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
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
    highlightHue: number = OPERAND_HIGHLIGHT_PROTOTYPE_HUE,
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
    writeHeadTailColors(
      this.colors,
      this.count,
      highlightStrengths,
      highlightHue,
    );
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
  highlightHue: number = OPERAND_HIGHLIGHT_PROTOTYPE_HUE,
): void {
  const tail = linearRgbFromSrgbHex(VISUAL_AIRFLOW_ORIENTED_MARK.tailColor);
  const head = linearRgbFromSrgbHex(VISUAL_AIRFLOW_ORIENTED_MARK.headColor);
  const hue = linearRgbFromSrgbHex(highlightHue);
  for (let i = 0; i < count; i++) {
    const strength =
      highlightStrengths === undefined ? 0 : highlightStrengths[i]!;
    const offset = i * 2 * COLOR_COMPONENTS_PER_VERTEX;
    const tailMix = mixRgb(tail, hue, strength);
    const headMix = mixRgb(head, hue, strength);
    out[offset] = tailMix.r;
    out[offset + 1] = tailMix.g;
    out[offset + 2] = tailMix.b;
    out[offset + 3] = VISUAL_AIRFLOW_ORIENTED_MARK.tailOpacity;
    out[offset + 4] = headMix.r;
    out[offset + 5] = headMix.g;
    out[offset + 6] = headMix.b;
    out[offset + 7] = VISUAL_AIRFLOW_ORIENTED_MARK.headOpacity;
  }
}

function mixRgb(base: LinearRgb, hue: LinearRgb, strength: number): LinearRgb {
  const t = strength;
  return {
    r: base.r * (1 - t) + hue.r * t,
    g: base.g * (1 - t) + hue.g * t,
    b: base.b * (1 - t) + hue.b * t,
  };
}
