import type { VelocityField } from "../core/fields/VelocityField.js";
import { contributionDisplayStrength } from "./operandContributionDisplay.js";

/**
 * Sample |V_operand| at xyz positions for display mapping.
 * Does not compose physics or alter V_total.
 */
export function writeContributionDisplayStrengths(
  operand: VelocityField,
  positions: Float32Array,
  count: number,
  time: number,
  out: Float32Array,
): void {
  const needed = count * 3;
  if (positions.length < needed || out.length < count) {
    throw new Error("contribution buffers must hold count samples");
  }
  for (let i = 0; i < count; i++) {
    const offset = i * 3;
    const velocity = operand.sample(
      {
        x: positions[offset]!,
        y: positions[offset + 1]!,
        z: positions[offset + 2]!,
      },
      time,
    );
    const magnitude = Math.hypot(velocity.x, velocity.y, velocity.z);
    out[i] = contributionDisplayStrength(magnitude);
  }
}
