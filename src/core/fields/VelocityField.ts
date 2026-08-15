import type { Vec3 } from "../math/Vec3.js";

export interface VelocityField {
  sample(position: Vec3, time: number): Vec3;
}
