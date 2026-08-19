/**
 * sRGB → linear-sRGB transfer for vertex color attributes.
 *
 * Three.js applies its sRGB decode only to `THREE.Color` inputs such as
 * `material.color`. A `BufferAttribute` named `color` is uploaded as is and
 * assumed to already live in the renderer working color space (linear-sRGB),
 * then encoded to sRGB on output. Palette constants here are authored as sRGB
 * hex, so writing their raw channel fractions into a color attribute lifts the
 * dark end of every ramp and flattens alpha-like RGB scaling.
 *
 * Perceptual encoding only. No physical meaning.
 */
export interface LinearRgb {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

export function srgbChannelToLinear(channel: number): number {
  if (channel <= 0.04045) {
    return channel / 12.92;
  }
  return Math.pow((channel + 0.055) / 1.055, 2.4);
}

export function linearRgbFromSrgbHex(hex: number): LinearRgb {
  return {
    r: srgbChannelToLinear(((hex >> 16) & 255) / 255),
    g: srgbChannelToLinear(((hex >> 8) & 255) / 255),
    b: srgbChannelToLinear((hex & 255) / 255),
  };
}
