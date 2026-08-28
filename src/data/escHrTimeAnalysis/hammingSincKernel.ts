import {
  ESC_HR_TIME_CUTOFF_WAVELENGTH_S,
  ESC_HR_TIME_TAP_COUNT,
  HAMMING_A0,
  HAMMING_A1,
} from "./constants.js";

export function escHrTimeHammingSincKernel(): number[] {
  const taps = ESC_HR_TIME_TAP_COUNT;
  const m = (taps - 1) / 2;
  const fc = 1 / ESC_HR_TIME_CUTOFF_WAVELENGTH_S;
  const raw: number[] = [];
  let sum = 0;
  for (let n = 0; n < taps; n++) {
    const k = n - m;
    const sinc =
      k === 0 ? 2 * fc : Math.sin(2 * Math.PI * fc * k) / (Math.PI * k);
    const window =
      HAMMING_A0 - HAMMING_A1 * Math.cos((2 * Math.PI * n) / (taps - 1));
    const value = sinc * window;
    raw.push(value);
    sum += value;
  }
  return raw.map((value) => value / sum);
}
