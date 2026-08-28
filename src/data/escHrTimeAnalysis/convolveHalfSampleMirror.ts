export function halfSampleMirrorAt(
  values: readonly number[],
  index: number,
): number {
  const n = values.length;
  if (index < 0) {
    return values[Math.min(-index - 1, n - 1)]!;
  }
  if (index >= n) {
    return values[Math.max(2 * n - 1 - index, 0)]!;
  }
  return values[index]!;
}

export function convolveHalfSampleMirror(
  values: readonly number[],
  kernel: readonly number[],
): number[] {
  const m = (kernel.length - 1) / 2;
  const n = values.length;
  const out = new Array<number>(n);
  for (let i = 0; i < n; i++) {
    let sum = 0;
    for (let k = 0; k < kernel.length; k++) {
      sum += kernel[k]! * halfSampleMirrorAt(values, i + k - m);
    }
    out[i] = sum;
  }
  return out;
}
