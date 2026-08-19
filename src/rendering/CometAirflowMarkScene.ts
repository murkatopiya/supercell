import * as THREE from "three";
import {
  COMET_AIRFLOW_LENGTH_M,
  COMET_SEGMENT_COUNT,
  writeCometMarkEndpoints,
} from "../visualization/cometAirflowMark.js";
import { UPDRAFT_HIGHLIGHT_HUE } from "../visualization/operandContributionDisplay.js";
import { VISUAL_AIRFLOW_COMET } from "./visualAirflowAppearance.js";

/**
 * Batched comet-like marks. Renderer-local fade from occupancy age.
 * Not a scientific trail and not stored path history.
 */
export class CometAirflowMarkScene {
  private readonly geometry: THREE.BufferGeometry;
  private readonly vertices: Float32Array;
  private readonly colors: Float32Array;
  private readonly positionAttribute: THREE.BufferAttribute;
  private readonly colorAttribute: THREE.BufferAttribute;
  private readonly material: THREE.LineBasicMaterial;
  private readonly lines: THREE.LineSegments;
  private readonly count: number;
  private disposed = false;

  constructor(count: number) {
    if (!Number.isInteger(count) || count < 0) {
      throw new Error("count must be an integer >= 0");
    }
    this.count = count;
    const vertexCount = count * COMET_SEGMENT_COUNT * 2;
    this.vertices = new Float32Array(vertexCount * 3);
    this.colors = new Float32Array(vertexCount * 3);

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
      opacity: VISUAL_AIRFLOW_COMET.opacity,
      depthWrite: false,
      fog: true,
    });

    this.lines = new THREE.LineSegments(this.geometry, this.material);
    this.lines.name = "cometAirflowMarks";
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

  get segmentCount(): number {
    return COMET_SEGMENT_COUNT;
  }

  syncFromObservation(
    positions: Float32Array,
    unitDirections: Float32Array,
    occupancyFade: Float32Array,
    highlightStrengths?: Float32Array,
  ): void {
    if (this.disposed) {
      throw new Error("CometAirflowMarkScene is disposed");
    }
    writeCometMarkEndpoints(
      positions,
      unitDirections,
      this.count,
      COMET_AIRFLOW_LENGTH_M,
      this.vertices,
    );
    writeCometColors(
      this.colors,
      this.count,
      occupancyFade,
      highlightStrengths,
    );
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

function writeCometColors(
  out: Float32Array,
  count: number,
  occupancyFade: Float32Array,
  highlightStrengths: Float32Array | undefined,
): void {
  const tail = rgb01(VISUAL_AIRFLOW_COMET.tailColor);
  const head = rgb01(VISUAL_AIRFLOW_COMET.headColor);
  const hue = rgb01(UPDRAFT_HIGHLIGHT_HUE);
  const verticesPerComet = COMET_SEGMENT_COUNT * 2;
  for (let i = 0; i < count; i++) {
    const fade = occupancyFade[i]!;
    const strength =
      highlightStrengths === undefined ? 0 : highlightStrengths[i]!;
    for (let s = 0; s < COMET_SEGMENT_COUNT; s++) {
      const t0 = s / COMET_SEGMENT_COUNT;
      const t1 = (s + 1) / COMET_SEGMENT_COUNT;
      writeVertexColor(
        out,
        (i * verticesPerComet + s * 2) * 3,
        tail,
        head,
        hue,
        t0,
        fade,
        strength,
      );
      writeVertexColor(
        out,
        (i * verticesPerComet + s * 2 + 1) * 3,
        tail,
        head,
        hue,
        t1,
        fade,
        strength,
      );
    }
  }
}

function writeVertexColor(
  out: Float32Array,
  offset: number,
  tail: { r: number; g: number; b: number },
  head: { r: number; g: number; b: number },
  hue: { r: number; g: number; b: number },
  tHeadward: number,
  fade: number,
  strength: number,
): void {
  const alongR = tail.r * (1 - tHeadward) + head.r * tHeadward;
  const alongG = tail.g * (1 - tHeadward) + head.g * tHeadward;
  const alongB = tail.b * (1 - tHeadward) + head.b * tHeadward;
  const mixedR = alongR * (1 - strength) + hue.r * strength;
  const mixedG = alongG * (1 - strength) + hue.g * strength;
  const mixedB = alongB * (1 - strength) + hue.b * strength;
  out[offset] = mixedR * fade;
  out[offset + 1] = mixedG * fade;
  out[offset + 2] = mixedB * fade;
}

function rgb01(hex: number): { r: number; g: number; b: number } {
  return {
    r: ((hex >> 16) & 255) / 255,
    g: ((hex >> 8) & 255) / 255,
    b: (hex & 255) / 255,
  };
}
