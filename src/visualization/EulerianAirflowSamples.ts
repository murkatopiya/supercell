import type { Vec3 } from "../core/math/Vec3.js";
import type { VelocityField } from "../core/fields/VelocityField.js";
import {
  writeUnitDirectionsFromField,
} from "./orientedAirflowMark.js";
import type { VisualAirflowVolume } from "./VisualAirflowPopulation.js";

export class EulerianAirflowSamplesError extends Error {
  readonly name = "EulerianAirflowSamplesError";

  constructor(message: string) {
    super(message);
  }
}

/**
 * Visualization sampling policy, not mass/density.
 * Same volume/count idea as the advected population for fair comparison.
 * Positions are fixed laboratory locations. No age, recycle, or integration.
 */
export interface EulerianAirflowSamplesConfig {
  readonly count: number;
  readonly volume: VisualAirflowVolume;
  readonly jitterSeed: number;
}

const JITTER_WIDTH = 0.8;

/**
 * Fixed Eulerian sample set. Observes a caller-supplied VelocityField.
 * Does not compose physics, advect, or own scientific tracers.
 */
export class EulerianAirflowSamples {
  private readonly field: VelocityField;
  private readonly count: number;
  private readonly positions: Vec3[];
  private readonly positionBuffer: Float32Array;

  constructor(field: VelocityField, config: EulerianAirflowSamplesConfig) {
    this.field = field;
    this.count = assertCount(config.count);
    assertJitterSeed(config.jitterSeed);
    const volume = copyVolume(config.volume);
    const divisions = latticeDivisions(this.count);
    this.positions = [];
    for (let i = 0; i < this.count; i++) {
      this.positions.push(
        seedPosition(
          i,
          config.jitterSeed,
          volume.min,
          volume.max,
          divisions.nx,
          divisions.ny,
          divisions.nz,
        ),
      );
    }
    this.positionBuffer = new Float32Array(this.count * 3);
    this.writePositionsTo(this.positionBuffer);
  }

  get sampleCount(): number {
    return this.positions.length;
  }

  /**
   * True when this set samples the given VelocityField instance.
   */
  samplesField(field: VelocityField): boolean {
    return this.field === field;
  }

  writePositionsTo(out: Float32Array): void {
    const needed = this.positions.length * 3;
    if (out.length < needed) {
      throw new EulerianAirflowSamplesError(
        "position buffer must hold sampleCount * 3 values",
      );
    }
    for (let i = 0; i < this.positions.length; i++) {
      const position = this.positions[i]!;
      const offset = i * 3;
      out[offset] = position.x;
      out[offset + 1] = position.y;
      out[offset + 2] = position.z;
    }
  }

  /**
   * Unit directions at the fixed positions for laboratory time `time`.
   */
  writeUnitDirectionsTo(time: number, out: Float32Array): void {
    assertFinite(time, "time");
    writeUnitDirectionsFromField(
      this.field,
      this.positionBuffer,
      this.positions.length,
      time,
      out,
    );
  }
}

function assertCount(count: number): number {
  if (!Number.isInteger(count) || count < 0) {
    throw new EulerianAirflowSamplesError("count must be an integer >= 0");
  }
  return count;
}

function assertJitterSeed(jitterSeed: number): number {
  assertFinite(jitterSeed, "jitterSeed");
  return jitterSeed;
}

function assertFinite(value: number, label: string): void {
  if (!Number.isFinite(value)) {
    throw new EulerianAirflowSamplesError(`${label} must be finite`);
  }
}

function copyVolume(volume: VisualAirflowVolume): VisualAirflowVolume {
  assertFinite(volume.min.x, "volume.min.x");
  assertFinite(volume.min.y, "volume.min.y");
  assertFinite(volume.min.z, "volume.min.z");
  assertFinite(volume.max.x, "volume.max.x");
  assertFinite(volume.max.y, "volume.max.y");
  assertFinite(volume.max.z, "volume.max.z");
  if (volume.min.y < 0) {
    throw new EulerianAirflowSamplesError("volume.min.y must be >= 0");
  }
  if (
    volume.max.x < volume.min.x ||
    volume.max.y < volume.min.y ||
    volume.max.z < volume.min.z
  ) {
    throw new EulerianAirflowSamplesError(
      "volume.max must be >= volume.min on each axis",
    );
  }
  return {
    min: copyVec3(volume.min),
    max: copyVec3(volume.max),
  };
}

function copyVec3(value: Vec3): Vec3 {
  return { x: value.x + 0, y: value.y + 0, z: value.z + 0 };
}

function latticeDivisions(
  count: number,
): { nx: number; ny: number; nz: number } {
  if (count <= 0) {
    return { nx: 0, ny: 0, nz: 0 };
  }
  let nx = Math.round(Math.cbrt(count));
  if (nx < 1) {
    nx = 1;
  }
  let ny = Math.round(Math.sqrt(count / nx));
  if (ny < 1) {
    ny = 1;
  }
  let nz = Math.ceil(count / (nx * ny));
  if (nz < 1) {
    nz = 1;
  }
  return { nx, ny, nz };
}

function slotToIjk(
  slotIndex: number,
  nx: number,
  ny: number,
): { ix: number; iy: number; iz: number } {
  return {
    ix: slotIndex % nx,
    iy: Math.floor(slotIndex / nx) % ny,
    iz: Math.floor(slotIndex / (nx * ny)),
  };
}

function axisSeed(
  min: number,
  max: number,
  divisions: number,
  index: number,
  unit: number,
): number {
  const span = max - min;
  if (!(span > 0) || divisions <= 0) {
    return min + 0;
  }
  const cell = span / divisions;
  const offset = 0.5 + (unit - 0.5) * JITTER_WIDTH;
  return min + (index + offset) * cell;
}

function seedPosition(
  slotIndex: number,
  jitterSeed: number,
  min: Vec3,
  max: Vec3,
  nx: number,
  ny: number,
  nz: number,
): Vec3 {
  const { ix, iy, iz } = slotToIjk(slotIndex, nx, ny);
  return {
    x: axisSeed(min.x, max.x, nx, ix, unitJitter(jitterSeed, slotIndex, 0)),
    y: axisSeed(min.y, max.y, ny, iy, unitJitter(jitterSeed, slotIndex, 1)),
    z: axisSeed(min.z, max.z, nz, iz, unitJitter(jitterSeed, slotIndex, 2)),
  };
}

function unitJitter(jitterSeed: number, slot: number, axis: number): number {
  let h =
    (jitterSeed | 0) +
    Math.imul(slot + 1, 0x9e3779b9) +
    Math.imul(1, 0x85ebca6b) +
    Math.imul(axis + 1, 0xc2b2ae35);
  h = Math.imul(h ^ (h >>> 16), 0x7feb352d);
  h = Math.imul(h ^ (h >>> 15), 0x846ca68b);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
