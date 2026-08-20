/**
 * Display-only scientific formatting for point diagnostics.
 * Sign follows the raw number; formatting never classifies sign.
 * docs/architecture/32-diagnostic-observation-ui-architecture.md
 */

export type PointDiagnosticSign = "positive" | "negative" | "zero";

const SUPER_DIGITS = ["⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹"] as const;

function superscriptExponent(token: string): string {
  const negative = token.startsWith("-");
  const digits = token.replace(/^[+-]/, "");
  const body = [...digits]
    .map((digit) => SUPER_DIGITS[Number(digit)] ?? digit)
    .join("");
  return negative ? `⁻${body}` : body;
}

/**
 * Exact 0 (including -0) → "0".
 * Finite nonzero → scientific notation, 2 mantissa decimals, ×10 with
 * superscript exponent. Never 0.00×10⁰, never -0.
 */
export function formatPointDiagnosticScientific(value: number): string {
  if (value === 0) {
    return "0";
  }
  const exponential = value.toExponential(2);
  const match = /^(-?)(\d+\.\d+)e([+-]?\d+)$/.exec(exponential);
  if (match === null) {
    return exponential;
  }
  const [, sign, mantissa, exponent] = match;
  return `${sign}${mantissa}×10${superscriptExponent(exponent!)}`;
}

export function classifyPointDiagnosticSign(value: number): PointDiagnosticSign {
  if (value > 0) {
    return "positive";
  }
  if (value < 0) {
    return "negative";
  }
  return "zero";
}
