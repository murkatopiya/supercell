import * as THREE from "three";
import { UPDRAFT_HIGHLIGHT_HUE } from "../visualization/operandContributionDisplay.js";
import { VISUAL_AIRFLOW_HIGHLIGHT_BACKGROUND } from "./visualAirflowAppearance.js";
import { linearRgbFromSrgbHex } from "./vertexColorSpace.js";

/** RGBA per vertex. itemSize 4 is what enables per-vertex alpha in Three.js. */
const COLOR_COMPONENTS_PER_VERTEX = 4;

/**
 * Rejected-branch Background highlight. Not constructed by the live
 * workbench. Kept as the historical encoding record.
 *
 * Sparse translucent points at caller-supplied laboratory positions.
 * Color/salience maps selected-operand |V| display strength.
 * Not a volume, cloud, air mass, or envelope isosurface.
 *
 * Display strength drives alpha rather than RGB: scaling RGB against a fixed
 * material opacity paints a dark sprite wherever the operand contributes
 * nothing, which subtracts from the scene instead of leaving it untouched.
 */
export class OperandHighlightBackgroundScene {
  private readonly geometry: THREE.BufferGeometry;
  private readonly positions: Float32Array;
  private readonly colors: Float32Array;
  private readonly positionAttribute: THREE.BufferAttribute;
  private readonly colorAttribute: THREE.BufferAttribute;
  private readonly sprite: THREE.DataTexture;
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
    this.colors = new Float32Array(count * COLOR_COMPONENTS_PER_VERTEX);
    this.geometry = new THREE.BufferGeometry();
    this.positionAttribute = new THREE.BufferAttribute(this.positions, 3);
    this.positionAttribute.setUsage(THREE.DynamicDrawUsage);
    this.colorAttribute = new THREE.BufferAttribute(
      this.colors,
      COLOR_COMPONENTS_PER_VERTEX,
    );
    this.colorAttribute.setUsage(THREE.DynamicDrawUsage);
    this.geometry.setAttribute("position", this.positionAttribute);
    this.geometry.setAttribute("color", this.colorAttribute);

    this.sprite = createRadialAlphaSprite(
      VISUAL_AIRFLOW_HIGHLIGHT_BACKGROUND.spriteResolution,
    );
    this.material = new THREE.PointsMaterial({
      vertexColors: true,
      alphaMap: this.sprite,
      size: VISUAL_AIRFLOW_HIGHLIGHT_BACKGROUND.size,
      sizeAttenuation: true,
      transparent: true,
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
    const hue = linearRgbFromSrgbHex(UPDRAFT_HIGHLIGHT_HUE);
    for (let i = 0; i < this.count; i++) {
      const s = strengths[i]!;
      const offset = i * COLOR_COMPONENTS_PER_VERTEX;
      this.colors[offset] = hue.r;
      this.colors[offset + 1] = hue.g;
      this.colors[offset + 2] = hue.b;
      this.colors[offset + 3] =
        VISUAL_AIRFLOW_HIGHLIGHT_BACKGROUND.peakOpacity * s;
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
    this.sprite.dispose();
  }
}

/**
 * Radial alpha falloff for the point sprite. The default PointsMaterial sprite
 * is a hard square, which reads as a grid of tiles rather than a soft underlay.
 * Generated as data so it needs no DOM canvas.
 */
function createRadialAlphaSprite(resolution: number): THREE.DataTexture {
  const data = new Uint8Array(resolution * resolution * 4);
  const center = (resolution - 1) / 2;
  for (let y = 0; y < resolution; y++) {
    for (let x = 0; x < resolution; x++) {
      const dx = (x - center) / center;
      const dy = (y - center) / center;
      const radial = Math.hypot(dx, dy);
      const falloff = radial >= 1 ? 0 : (1 - radial) * (1 - radial);
      const value = Math.round(falloff * 255);
      const offset = (y * resolution + x) * 4;
      data[offset] = value;
      data[offset + 1] = value;
      data[offset + 2] = value;
      data[offset + 3] = value;
    }
  }
  const texture = new THREE.DataTexture(
    data,
    resolution,
    resolution,
    THREE.RGBAFormat,
  );
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}
