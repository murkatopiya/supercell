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

export function srgbChannelFromLinear(channel: number): number {
  if (channel <= 0.0031308) {
    return channel * 12.92;
  }
  return 1.055 * Math.pow(channel, 1 / 2.4) - 0.055;
}

function clamp01(channel: number): number {
  if (channel <= 0) {
    return 0;
  }
  if (channel >= 1) {
    return 1;
  }
  return channel;
}

/**
 * CSS sRGB for a linear-sRGB appearance sample.
 * Matches the trail's vertex colors after the renderer encodes to sRGB.
 */
export function cssSrgbFromLinearRgb(rgb: LinearRgb): string {
  const r = Math.round(clamp01(srgbChannelFromLinear(rgb.r)) * 255);
  const g = Math.round(clamp01(srgbChannelFromLinear(rgb.g)) * 255);
  const b = Math.round(clamp01(srgbChannelFromLinear(rgb.b)) * 255);
  return `rgb(${r}, ${g}, ${b})`;
}

export function linearRgbFromSrgbHex(hex: number): LinearRgb {
  return {
    r: srgbChannelToLinear(((hex >> 16) & 255) / 255),
    g: srgbChannelToLinear(((hex >> 8) & 255) / 255),
    b: srgbChannelToLinear((hex & 255) / 255),
  };
}
