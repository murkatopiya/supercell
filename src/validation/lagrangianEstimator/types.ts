/** Slice 1 only: arithmetic results, not campaign or applicability policy. */
export type ArithmeticFailure = Readonly<{
  status: "FAILED";
  code: "INVALID_INPUT" | "NONFINITE_ARITHMETIC";
  operation: string;
}>;
export type ArithmeticResult<T> =
  | Readonly<{ status: "COMPLETE"; value: T }>
  | ArithmeticFailure;
export type Interval = Readonly<{ a: number; b: number }>;
export type LinearInterval = Interval & Readonly<{ u: number; v: number }>;
export type Binary64Parts = Readonly<{ mantissa: number; exponent: number }>;
export type LinearIntegrals = Readonly<{
  signed: number;
  abs: number;
  zeroFraction: number | null;
}>;
export type ArithmeticAllowance = Readonly<{ k: number; scale: number; bound: number }>;
