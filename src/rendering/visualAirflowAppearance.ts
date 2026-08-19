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
