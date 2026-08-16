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
 * Tracer seeds: axis / east / north at y = 1000 m, off-axis r = 0.6 σ
 * (docs/architecture/06-deep-chimney-scaling-demo-retune.md).
 *
 * Deep environmental knots 6000 / 12000 m:
 * docs/rendering/09-deep-environmental-profile-demo.md.
 *
 * Deep storm envelopes (updraft 0–8000, inflow 1500/4500, outflow 5000–9000):
 * docs/rendering/10-deep-storm-envelope-scaling.md.
 * Shared σ = 4000 m and frozen peak speeds:
 * docs/architecture/06-deep-chimney-scaling-demo-retune.md.
 *
 * Localized rotation occupant (baseHeight 0, topHeight 6500):
 * docs/rendering/12-composite-vertical-envelope-rotation-demo.md.
 */
export const DEMO_SCENARIO: ScenarioConfig = {
  environment: {
    windLevels: [
      { height: 0, eastward: 15, northward: 5 },
      { height: 1000, eastward: 5, northward: 15 },
      { height: 2000, eastward: 10, northward: 25 },
      { height: 6000, eastward: 30, northward: 20 },
      { height: 12000, eastward: 40, northward: 10 },
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
      peakVerticalVelocity: 30,
      sigma: 4000,
      baseHeight: 0,
      topHeight: 8000,
    },
    rotation: {
      centerX: 0,
      centerZ: 0,
      angularVelocity: 0.005,
      sigma: 4000,
      baseHeight: 0,
      topHeight: 6500,
    },
    lowerRadialInflow: {
      centerX: 0,
      centerZ: 0,
      radialStrainRate: 0.00125,
      sigma: 4000,
      baseHeight: 1500,
      topHeight: 4500,
    },
    upperRadialOutflow: {
      centerX: 0,
      centerZ: 0,
      outflowStrainRate: 0.0025,
      sigma: 4000,
      baseHeight: 5000,
      topHeight: 9000,
    },
  },
  simulation: {
    timestep: 0.1,
    tracerSeeds: [
      { x: 0, y: 1000, z: 0 },
      { x: 2400, y: 1000, z: 0 },
      { x: 0, y: 1000, z: -2400 },
    ],
  },
};
