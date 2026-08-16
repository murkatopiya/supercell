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
 * Controlled vertically structured updraft inputs (plain DTO).
 * Physical validation is owned by VerticalEnvelopeUpdraftField.
 */
export interface ScenarioUpdraft {
  /** World east coordinate of the updraft axis. Units: m */
  centerX: number;
  /** World south coordinate of the updraft axis. Units: m */
  centerZ: number;
  /** Global max vertical velocity, attained at axis and y_mid. Units: m/s */
  peakVerticalVelocity: number;
  /** Gaussian horizontal scale. Units: m */
  sigma: number;
  /** World +Y of the lower lid. Units: m */
  baseHeight: number;
  /** World +Y of the upper lid. Units: m */
  topHeight: number;
}

/**
 * Controlled vertically structured rotation inputs (plain DTO).
 * Physical validation is owned by VerticalEnvelopeRotationField.
 * baseHeight / topHeight are zero lids (G = 0), not a plateau top.
 */
export interface ScenarioRotation {
  /** World east coordinate of the rotation axis. Units: m */
  centerX: number;
  /** World south coordinate of the rotation axis. Units: m */
  centerZ: number;
  /** Angular velocity about +Y at G = 1; sign sets sense. Units: rad/s */
  angularVelocity: number;
  /** Gaussian horizontal scale. Units: m */
  sigma: number;
  /** World +Y of the lower lid (G = 0). Units: m */
  baseHeight: number;
  /** World +Y of the upper lid (G = 0). Units: m */
  topHeight: number;
}

/**
 * Controlled lower radial-inflow inputs (plain DTO).
 * Physical validation is owned by LowerRadialInflowField.
 * baseHeight is the plateau top / taper start (G = 1 at and below).
 */
export interface ScenarioLowerRadialInflow {
  /** World east coordinate of the inflow axis. Units: m */
  centerX: number;
  /** World south coordinate of the inflow axis. Units: m */
  centerZ: number;
  /** Near-axis radial strain rate on the plateau; must be > 0. Units: 1/s */
  radialStrainRate: number;
  /** Gaussian horizontal scale. Units: m */
  sigma: number;
  /** World +Y below which G = 1 and above which taper begins. Units: m */
  baseHeight: number;
  /** World +Y at which G = 0; inflow is zero at and above. Units: m */
  topHeight: number;
}

/**
 * Controlled upper-level radial-outflow inputs (plain DTO).
 * Physical validation is owned by UpperRadialOutflowField.
 */
export interface ScenarioUpperRadialOutflow {
  /** World east coordinate of the outflow axis. Units: m */
  centerX: number;
  /** World south coordinate of the outflow axis. Units: m */
  centerZ: number;
  /** Near-axis radial strain rate; strictly outward; must be > 0. Units: 1/s */
  outflowStrainRate: number;
  /** Gaussian horizontal scale. Units: m */
  sigma: number;
  /** World +Y of the lower lid. Units: m */
  baseHeight: number;
  /** World +Y of the upper lid. Units: m */
  topHeight: number;
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
    /** Required controlled rotation parameters. */
    rotation: ScenarioRotation;
    /** Required controlled lower radial-inflow parameters. */
    lowerRadialInflow: ScenarioLowerRadialInflow;
    /** Required controlled upper radial-outflow parameters. */
    upperRadialOutflow: ScenarioUpperRadialOutflow;
  };
  simulation: {
    /** Fixed numerical step dt. Units: s; must be > 0 */
    timestep: number;
    tracerSeeds: ScenarioTracerSeed[];
  };
}
