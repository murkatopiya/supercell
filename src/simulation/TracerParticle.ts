import type { Vec3 } from "../core/math/Vec3.js";

export interface TracerParticle {
  position: Vec3;
  age: number;
  active: boolean;
}
