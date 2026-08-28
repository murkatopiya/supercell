import {
  ESC_HR_TIME_HALF_WIDTH_S,
} from "./constants.js";
import type { AnalysisSupportState } from "./types.js";

export function classifyAnalysisSupport(
  time: number,
  firstTime: number,
  lastTime: number,
): AnalysisSupportState {
  if (
    time >= firstTime + ESC_HR_TIME_HALF_WIDTH_S &&
    time <= lastTime - ESC_HR_TIME_HALF_WIDTH_S
  ) {
    return "FULL_SUPPORT";
  }
  return "BOUNDARY_CONDITIONED";
}
