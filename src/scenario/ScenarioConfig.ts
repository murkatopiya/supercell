/** Height m; horizontal wind m/s. Vertical is not stored (profile v1 forces 0). */
export interface ScenarioWindLevel {
  height: number;
  eastward: number;
  northward: number;
}

/** Horizontal storm translation. Units: m/s */
export interface ScenarioStormMotion {
  eastward: number;
  northward: number;
}

/** Initial tracer position in world coordinates. Units: m */
export interface ScenarioTracerSeed {
  x: number;
  y: number;
  z: number;
}

/**
 * Controlled Gaussian updraft inputs (plain DTO).
 * Physical validation is owned by UpdraftField.
 */
export interface ScenarioUpdraft {
  /** World east coordinate of the updraft axis. Units: m */
  centerX: number;
  /** World south coordinate of the updraft axis. Units: m */
  centerZ: number;
  /** Vertical velocity on the axis. Units: m/s */
  peakVerticalVelocity: number;
  /** Gaussian horizontal scale. Units: m */
  sigma: number;
}

/**
 * Serializable scenario input DTO.
 * Not a physics model — composition builds physics objects from it.
 */
export interface ScenarioConfig {
  environment: {
    windLevels: ScenarioWindLevel[];
  };
  stormMotion: ScenarioStormMotion;
  storm: {
    /** Required controlled updraft parameters. */
    updraft: ScenarioUpdraft;
  };
  simulation: {
    /** Fixed numerical step dt. Units: s; must be > 0 */
    timestep: number;
    tracerSeeds: ScenarioTracerSeed[];
  };
}
