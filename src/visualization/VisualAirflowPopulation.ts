import type { Vec3 } from "../core/math/Vec3.js";
import type { VelocityField } from "../core/fields/VelocityField.js";
import type { Integrator } from "../core/integrators/Integrator.js";

export class VisualAirflowPopulationError extends Error {
  readonly name = "VisualAirflowPopulationError";

  constructor(message: string) {
    super(message);
  }
}

/**
 * Declared visualization volume. Occupancy count is not air density.
 * Seed and retirement use the same box in v1.
 */
export interface VisualAirflowVolume {
  readonly min: Vec3;
  readonly max: Vec3;
}

/**
 * Visualization policy, not a physical particle count.
 * docs/architecture/22-perceptual-airflow-architecture.md
 */
export interface VisualAirflowPopulationConfig {
  readonly count: number;
  readonly maxAge: number;
  readonly volume: VisualAirflowVolume;
  /** Finite numeric seed for deterministic cell jitter. Not a product id. */
  readonly jitterSeed: number;
}

/**
 * Ephemeral visual marker. Not a scientific tracer.
 * age is time since last (re)seed, not a back-advected parcel history.
 */
export interface VisualAirflowOccupant {
  readonly position: Vec3;
  readonly age: number;
}

interface VisualAirflowSlot {
  position: Vec3;
  age: number;
  generation: number;
}

const JITTER_WIDTH = 0.8;
const VISUAL_GROUND_Y = 0;

/**
 * Headless visual airflow population. Samples a caller-supplied
 * VelocityField; does not compose physics or own scientific tracers.
 */
export class VisualAirflowPopulation {
  private readonly field: VelocityField;
  private readonly integrator: Integrator;
  private readonly count: number;
  private readonly maxAge: number;
  private readonly jitterSeed: number;
  private readonly volumeMin: Vec3;
  private readonly volumeMax: Vec3;
  private readonly nx: number;
  private readonly ny: number;
  private readonly nz: number;
  private readonly slots: VisualAirflowSlot[];

  constructor(
    field: VelocityField,
    integrator: Integrator,
    config: VisualAirflowPopulationConfig,
  ) {
    this.field = field;
    this.integrator = integrator;
    this.count = assertCount(config.count);
    this.maxAge = assertMaxAge(config.maxAge);
    this.jitterSeed = assertJitterSeed(config.jitterSeed);
    const volume = copyVolume(config.volume);
    this.volumeMin = volume.min;
    this.volumeMax = volume.max;
    const divisions = latticeDivisions(this.count);
    this.nx = divisions.nx;
    this.ny = divisions.ny;
    this.nz = divisions.nz;
    this.slots = [];
    for (let i = 0; i < this.count; i++) {
      this.slots.push({
        position: this.seedPosition(i, 0),
        age: this.initialAge(i),
        generation: 0,
      });
    }
  }

  get occupantCount(): number {
    return this.slots.length;
  }

  /**
   * True when this population samples the given VelocityField instance.
   * Identity, not an equal rebuilt field.
   */
  samplesField(field: VelocityField): boolean {
    return this.field === field;
  }

  /**
   * True when this population uses the given Integrator instance.
   */
  usesIntegrator(integrator: Integrator): boolean {
    return this.integrator === integrator;
  }

  /**
   * Copied snapshots. Mutating the result does not affect slots.
   */
  occupants(): readonly VisualAirflowOccupant[] {
    return this.slots.map((slot) => ({
      position: copyVec3(slot.position),
      age: slot.age,
    }));
  }

  /**
   * Write current slot positions into a caller-owned xyz buffer.
   * Does not allocate occupant snapshots. Does not expose slots.
   */
  writePositionsTo(out: Float32Array): void {
    const needed = this.slots.length * 3;
    if (out.length < needed) {
      throw new VisualAirflowPopulationError(
        "position buffer must hold occupantCount * 3 values",
      );
    }
    for (let i = 0; i < this.slots.length; i++) {
      const position = this.slots[i]!.position;
      const offset = i * 3;
      out[offset] = position.x;
      out[offset + 1] = position.y;
      out[offset + 2] = position.z;
    }
  }

  /**
   * Restore deterministic initial lattice positions, staggered ages,
   * and generation 0. Does not replace the field or integrator.
   */
  reset(): void {
    for (let i = 0; i < this.slots.length; i++) {
      const slot = this.slots[i]!;
      slot.generation = 0;
      slot.position = this.seedPosition(i, 0);
      slot.age = this.initialAge(i);
    }
  }

  /**
   * Advance one visualization step at laboratory time `time`.
   * Does not own a clock. Caller supplies the same time context
   * scientific Simulation uses at the start of its step.
   *
   * Order: integrate → age → retire/reseed.
   */
  step(dt: number, time: number): void {
    assertStepDt(dt);
    assertFinite(time, "time");

    for (let i = 0; i < this.slots.length; i++) {
      const slot = this.slots[i]!;
      const proposed = this.integrator.step(
        slot.position,
        time,
        dt,
        this.field,
      );
      const age = slot.age + dt;
      if (this.shouldRetire(proposed, age)) {
        slot.generation += 1;
        slot.position = this.seedPosition(i, slot.generation);
        slot.age = 0;
      } else {
        slot.position.x = proposed.x + 0;
        slot.position.y = proposed.y + 0;
        slot.position.z = proposed.z + 0;
        slot.age = age;
      }
    }
  }

  private initialAge(slotIndex: number): number {
    if (this.count <= 1) {
      return 0;
    }
    return (slotIndex / this.count) * this.maxAge;
  }

  private seedPosition(slotIndex: number, generation: number): Vec3 {
    const { ix, iy, iz } = slotToIjk(slotIndex, this.nx, this.ny);
    return {
      x: axisSeed(
        this.volumeMin.x,
        this.volumeMax.x,
        this.nx,
        ix,
        unitJitter(this.jitterSeed, slotIndex, generation, 0),
      ),
      y: axisSeed(
        this.volumeMin.y,
        this.volumeMax.y,
        this.ny,
        iy,
        unitJitter(this.jitterSeed, slotIndex, generation, 1),
      ),
      z: axisSeed(
        this.volumeMin.z,
        this.volumeMax.z,
        this.nz,
        iz,
        unitJitter(this.jitterSeed, slotIndex, generation, 2),
      ),
    };
  }

  private shouldRetire(proposed: Vec3, age: number): boolean {
    if (!(age < this.maxAge)) {
      return true;
    }
    if (proposed.y < VISUAL_GROUND_Y) {
      return true;
    }
    return !inVolumeInclusive(proposed, this.volumeMin, this.volumeMax);
  }
}

function assertCount(count: number): number {
  if (!Number.isInteger(count) || count < 0) {
    throw new VisualAirflowPopulationError(
      "count must be an integer >= 0",
    );
  }
  return count;
}

function assertMaxAge(maxAge: number): number {
  assertFinite(maxAge, "maxAge");
  if (!(maxAge > 0)) {
    throw new VisualAirflowPopulationError("maxAge must be > 0");
  }
  return maxAge;
}

function assertJitterSeed(jitterSeed: number): number {
  assertFinite(jitterSeed, "jitterSeed");
  return jitterSeed;
}

function assertStepDt(dt: number): void {
  if (!(dt > 0) || !Number.isFinite(dt)) {
    throw new VisualAirflowPopulationError("dt must be finite and > 0");
  }
}

function assertFinite(value: number, label: string): void {
  if (!Number.isFinite(value)) {
    throw new VisualAirflowPopulationError(`${label} must be finite`);
  }
}

function copyVolume(volume: VisualAirflowVolume): VisualAirflowVolume {
  assertFinite(volume.min.x, "volume.min.x");
  assertFinite(volume.min.y, "volume.min.y");
  assertFinite(volume.min.z, "volume.min.z");
  assertFinite(volume.max.x, "volume.max.x");
  assertFinite(volume.max.y, "volume.max.y");
  assertFinite(volume.max.z, "volume.max.z");
  if (volume.min.y < VISUAL_GROUND_Y) {
    throw new VisualAirflowPopulationError("volume.min.y must be >= 0");
  }
  if (
    volume.max.x < volume.min.x ||
    volume.max.y < volume.min.y ||
    volume.max.z < volume.min.z
  ) {
    throw new VisualAirflowPopulationError(
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

function inVolumeInclusive(position: Vec3, min: Vec3, max: Vec3): boolean {
  return (
    position.x >= min.x &&
    position.x <= max.x &&
    position.y >= min.y &&
    position.y <= max.y &&
    position.z >= min.z &&
    position.z <= max.z
  );
}

function unitJitter(
  jitterSeed: number,
  slot: number,
  generation: number,
  axis: number,
): number {
  let h =
    (jitterSeed | 0) +
    Math.imul(slot + 1, 0x9e3779b9) +
    Math.imul(generation + 1, 0x85ebca6b) +
    Math.imul(axis + 1, 0xc2b2ae35);
  h = Math.imul(h ^ (h >>> 16), 0x7feb352d);
  h = Math.imul(h ^ (h >>> 15), 0x846ca68b);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
