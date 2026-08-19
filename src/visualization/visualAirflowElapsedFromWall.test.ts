import { describe, expect, it } from "vitest";
import { visualAirflowElapsedFromWall } from "./visualAirflowElapsedFromWall.js";

describe("visualAirflowElapsedFromWall", () => {
  it("clamps wall-frame dt and is not laboratory elapsed", () => {
    expect(visualAirflowElapsedFromWall(0)).toBe(0);
    expect(visualAirflowElapsedFromWall(0.016)).toBe(0.016);
    expect(visualAirflowElapsedFromWall(1)).toBe(0.25);
    expect(() => visualAirflowElapsedFromWall(-1)).toThrow(/wallFrameDt/);
  });
});
