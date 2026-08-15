import type { ScenarioConfig } from "./ScenarioConfig.js";

/**
 * Nasty visual-check demo scenario (hodograph fixture numbers).
 *
 * Hand expectations for layer [0, 1000] with C = (10, 0):
 *   shear = (-0.01, +0.01)
 *   ω_h   = (-0.01, -0.01) → screen down-left
 *   V_sr(0) = (+5, +5); V_sr(1000) = (-5, +15)
 *   V_sr_avg = (0, +10) → ŝ north, ĉ west
 *   ω_s = -0.01 → south → screen DOWN
 *   ω_c = +0.01 → west → screen LEFT
 *   ω_s ↓ + ω_c ← = ω_h ↙
 *
 * Tracer seeds sample Gaussian radial structure at y = 1000 m
 * (docs/rendering/03-composite-updraft-demo.md).
 */
export const DEMO_SCENARIO: ScenarioConfig = {
  environment: {
    windLevels: [
      { height: 0, eastward: 15, northward: 5 },
      { height: 1000, eastward: 5, northward: 15 },
      { height: 2000, eastward: 10, northward: 25 },
    ],
  },
  stormMotion: {
    eastward: 10,
    northward: 0,
  },
  storm: {
    updraft: {
      centerX: 0,
      centerZ: 0,
      peakVerticalVelocity: 20,
      sigma: 1000,
    },
  },
  simulation: {
    timestep: 0.1,
    tracerSeeds: [
      { x: 0, y: 1000, z: 0 },
      { x: 600, y: 1000, z: 0 },
      { x: 1800, y: 1000, z: 0 },
    ],
  },
};
