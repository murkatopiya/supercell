/**
 * Perceptual encoding for Explore background airflow markers.
 *
 * Size, color, and opacity are readability only. They do not mean
 * density, mass, moisture, cloud, precipitation, probability,
 * vorticity, or velocity magnitude.
 */
export const VISUAL_AIRFLOW_MARKER = {
  color: 0x8fa4b8,
  /** PointsMaterial size; attenuated by camera depth. */
  size: 200,
  opacity: 0.42,
  sizeAttenuation: true,
} as const;

/**
 * R1/R2 mark colors. Tail→head luminance is direction sign only.
 * Not speed, density, age, moisture, or vertical velocity.
 */
export const VISUAL_AIRFLOW_ORIENTED_MARK = {
  tailColor: 0x3d4c5a,
  headColor: 0xd5e1ec,
  opacity: 0.7,
} as const;

/**
 * Camera-distance salience for the large laboratory volume.
 * Not meteorological fog, altitude, humidity, or extinction physics.
 * near/far are meters from the camera, matching DEEP_STORM_TRACER_VIEW.
 */
export const VISUAL_AIRFLOW_DEPTH_CUE = {
  color: 0x1a2332,
  nearM: 8000,
  farM: 26000,
} as const;
