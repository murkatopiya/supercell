import * as THREE from "three";
import { UPDRAFT_HIGHLIGHT_HUE } from "../visualization/operandContributionDisplay.js";
import { VISUAL_AIRFLOW_HIGHLIGHT_BACKGROUND } from "./visualAirflowAppearance.js";

/**
 * Sparse translucent points at caller-supplied laboratory positions.
 * Color/salience maps selected-operand |V| display strength.
 * Not a volume, cloud, air mass, or envelope isosurface.
 */
export class OperandHighlightBackgroundScene {
  private readonly geometry: THREE.BufferGeometry;
  private readonly positions: Float32Array;
  private readonly colors: Float32Array;
  private readonly positionAttribute: THREE.BufferAttribute;
  private readonly colorAttribute: THREE.BufferAttribute;
  private readonly material: THREE.PointsMaterial;
  private readonly points: THREE.Points;
  private readonly count: number;
  private disposed = false;

  constructor(count: number) {
    if (!Number.isInteger(count) || count < 0) {
      throw new Error("count must be an integer >= 0");
    }
    this.count = count;
    this.positions = new Float32Array(count * 3);
    this.colors = new Float32Array(count * 3);
    this.geometry = new THREE.BufferGeometry();
    this.positionAttribute = new THREE.BufferAttribute(this.positions, 3);
    this.positionAttribute.setUsage(THREE.DynamicDrawUsage);
    this.colorAttribute = new THREE.BufferAttribute(this.colors, 3);
    this.colorAttribute.setUsage(THREE.DynamicDrawUsage);
    this.geometry.setAttribute("position", this.positionAttribute);
    this.geometry.setAttribute("color", this.colorAttribute);

    this.material = new THREE.PointsMaterial({
      vertexColors: true,
      size: VISUAL_AIRFLOW_HIGHLIGHT_BACKGROUND.size,
      sizeAttenuation: true,
      transparent: true,
      opacity: VISUAL_AIRFLOW_HIGHLIGHT_BACKGROUND.opacity,
      depthWrite: false,
      fog: true,
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.points.name = "updraftHighlightBackground";
    this.points.renderOrder = -2;
    this.points.frustumCulled = false;
    this.points.raycast = () => {};
  }

  get object(): THREE.Points {
    return this.points;
  }

  get vertexCount(): number {
    return this.count;
  }

  syncFromStrengths(worldPositions: Float32Array, strengths: Float32Array): void {
    if (this.disposed) {
      throw new Error("OperandHighlightBackgroundScene is disposed");
    }
    if (worldPositions.length < this.count * 3 || strengths.length < this.count) {
      throw new Error("highlight buffers must hold sampleCount values");
    }
    this.positions.set(worldPositions.subarray(0, this.count * 3));
    const hue = rgb01(UPDRAFT_HIGHLIGHT_HUE);
    for (let i = 0; i < this.count; i++) {
      const s = strengths[i]!;
      const offset = i * 3;
      this.colors[offset] = hue.r * s;
      this.colors[offset + 1] = hue.g * s;
      this.colors[offset + 2] = hue.b * s;
    }
    this.positionAttribute.needsUpdate = true;
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

function rgb01(hex: number): { r: number; g: number; b: number } {
  return {
    r: ((hex >> 16) & 255) / 255,
    g: ((hex >> 8) & 255) / 255,
    b: (hex & 255) / 255,
  };
}
