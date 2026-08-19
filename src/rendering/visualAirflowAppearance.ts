/**
 * Perceptual encoding for Explore background airflow markers.
 *
 * Size, color, and opacity are readability only. They do not mean
 * density, mass, moisture, cloud, precipitation, probability,
 * vorticity, or velocity magnitude.
 *
 * Colors are authored as sRGB hex. Anything that reaches a vertex color
 * attribute must pass through `linearRgbFromSrgbHex` first.
 */
export const VISUAL_AIRFLOW_MARKER = {
  color: 0x8fa4b8,
  /** PointsMaterial size; attenuated by camera depth. */
  size: 200,
  opacity: 0.42,
  sizeAttenuation: true,
} as const;

/**
 * R1/R2 mark colors. Tail→head luminance and alpha are direction sign
 * only. Not speed, density, age, moisture, or vertical velocity.
 *
 * Alpha lives in the vertex color attribute so that the tail can reach zero
 * salience; a uniform material opacity cannot express head–tail asymmetry.
 */
export const VISUAL_AIRFLOW_ORIENTED_MARK = {
  tailColor: 0x3d4c5a,
  headColor: 0xd5e1ec,
  tailOpacity: 0.1,
  headOpacity: 0.85,
} as const;

/**
 * Camera-distance salience for the large laboratory volume.
 * Not meteorological fog, altitude, humidity, or extinction physics.
 * near/far are meters from the camera, matching DEEP_STORM_TRACER_VIEW.
 *
 * From the DEEP_STORM_TRACER_VIEW pose the DEMO airflow volume spans roughly
 * 6.4 km (near corner) to 26.2 km (far corner). A far plane at the far corner
 * drives the whole back half of the volume to the clear color instead of
 * ordering it, so far sits beyond the volume.
 */
export const VISUAL_AIRFLOW_DEPTH_CUE = {
  color: 0x1a2332,
  nearM: 12000,
  farM: 38000,
} as const;

/**
 * R1c comet encoding. `headOpacity` is peak salience at the head; alpha
 * tapers to zero toward the tail and occupancy fade scales alpha, not RGB.
 * Scaling RGB instead darkens the mark toward black rather than removing it.
 */
export const VISUAL_AIRFLOW_COMET = {
  tailColor: 0x5b7180,
  headColor: 0xf0f7ff,
  headOpacity: 0.9,
} as const;

/**
 * Operand highlight underlay. Display strength drives alpha, so a zero
 * contribution draws nothing at all. A radial alpha falloff replaces the
 * square default point sprite. Still sparse Eulerian samples, not a volume.
 */
export const VISUAL_AIRFLOW_HIGHLIGHT_BACKGROUND = {
  size: 1000,
  peakOpacity: 0.35,
  spriteResolution: 64,
} as const;
