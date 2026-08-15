import type { AtmosphericVelocity } from "../../core/math/AtmosphericVelocity.js";

export interface EnvironmentalWindLevel {
  height: number;
  velocity: AtmosphericVelocity;
}

export class EnvironmentalWindProfileError extends Error {
  readonly name = "EnvironmentalWindProfileError";

  constructor(message: string) {
    super(message);
  }
}

function copyVelocity(velocity: AtmosphericVelocity): AtmosphericVelocity {
  return {
    eastward: velocity.eastward,
    northward: velocity.northward,
    // Model guarantees vertical === 0 (including -0); store/return canonical +0.
    vertical: 0,
  };
}

function assertFinite(value: number, label: string): void {
  if (!Number.isFinite(value)) {
    throw new EnvironmentalWindProfileError(`${label} must be finite`);
  }
}

export class EnvironmentalWindProfile {
  private readonly levels: EnvironmentalWindLevel[];

  constructor(levels: readonly EnvironmentalWindLevel[]) {
    if (levels.length < 2) {
      throw new EnvironmentalWindProfileError(
        "profile requires at least 2 levels",
      );
    }

    const copied: EnvironmentalWindLevel[] = [];

    for (let i = 0; i < levels.length; i++) {
      const level = levels[i]!;
      assertFinite(level.height, `height[${i}]`);
      assertFinite(level.velocity.eastward, `eastward[${i}]`);
      assertFinite(level.velocity.northward, `northward[${i}]`);
      assertFinite(level.velocity.vertical, `vertical[${i}]`);

      if (level.velocity.vertical !== 0) {
        throw new EnvironmentalWindProfileError(
          `vertical[${i}] must be 0 for EnvironmentalWindProfile`,
        );
      }

      if (i > 0 && !(level.height > copied[i - 1]!.height)) {
        throw new EnvironmentalWindProfileError(
          `heights must be strictly increasing at index ${i}`,
        );
      }

      copied.push({
        height: level.height,
        velocity: copyVelocity(level.velocity),
      });
    }

    this.levels = copied;
  }

  get minHeight(): number {
    return this.levels[0]!.height;
  }

  get maxHeight(): number {
    return this.levels[this.levels.length - 1]!.height;
  }

  /**
   * All profile knot heights in ascending order.
   * Defensive snapshot; does not expose level velocities.
   */
  levelHeights(): number[] {
    return this.levels.map((level) => level.height);
  }

  /**
   * Profile knot heights strictly inside (h0, h1), ascending.
   * Does not include h0/h1 and does not expose level velocities.
   */
  interiorLevelHeightsBetween(h0: number, h1: number): number[] {
    assertFinite(h0, "h0");
    assertFinite(h1, "h1");
    if (!(h1 > h0)) {
      throw new EnvironmentalWindProfileError("h1 must be greater than h0");
    }

    const heights: number[] = [];
    for (const level of this.levels) {
      if (level.height > h0 && level.height < h1) {
        heights.push(level.height);
      }
    }
    return heights;
  }

  sampleAtHeight(height: number): AtmosphericVelocity {
    assertFinite(height, "height");

    const first = this.levels[0]!;
    const last = this.levels[this.levels.length - 1]!;

    if (height <= first.height) {
      return copyVelocity(first.velocity);
    }

    if (height >= last.height) {
      return copyVelocity(last.velocity);
    }

    for (let i = 1; i < this.levels.length; i++) {
      const upper = this.levels[i]!;
      if (height > upper.height) {
        continue;
      }

      const lower = this.levels[i - 1]!;
      if (height === upper.height) {
        return copyVelocity(upper.velocity);
      }

      const span = upper.height - lower.height;
      const f = (height - lower.height) / span;
      const v0 = lower.velocity;
      const v1 = upper.velocity;

      return {
        eastward: v0.eastward + f * (v1.eastward - v0.eastward),
        northward: v0.northward + f * (v1.northward - v0.northward),
        vertical: 0,
      };
    }

    // Unreachable for a validated strictly increasing profile.
    return copyVelocity(last.velocity);
  }
}
