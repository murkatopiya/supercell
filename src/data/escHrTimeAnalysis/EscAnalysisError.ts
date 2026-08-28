export class EscAnalysisError extends Error {
  readonly name = "EscAnalysisError";

  constructor(message: string) {
    super(message);
  }
}
