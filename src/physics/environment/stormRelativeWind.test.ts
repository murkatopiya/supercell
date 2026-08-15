import { describe, expect, it } from "vitest";
import { stormRelativeWind } from "./stormRelativeWind.js";

describe("stormRelativeWind", () => {
  it("zeros horizontal wind when horizontal(V_env) equals C, keeping vertical", () => {
    expect(
      stormRelativeWind(
        { eastward: 10, northward: 5, vertical: 2 },
        { eastward: 10, northward: 5 },
      ),
    ).toEqual({
      eastward: 0,
      northward: 0,
      vertical: 2,
    });
  });

  it("reduces to zero when horizontal match uses current-profile vertical=0", () => {
    expect(
      stormRelativeWind(
        { eastward: 10, northward: 5, vertical: 0 },
        { eastward: 10, northward: 5 },
      ),
    ).toEqual({
      eastward: 0,
      northward: 0,
      vertical: 0,
    });
  });

  it("returns V_env unchanged for a stationary storm", () => {
    const environmentWind = { eastward: 9, northward: -2, vertical: 4 };

    expect(
      stormRelativeWind(environmentWind, { eastward: 0, northward: 0 }),
    ).toEqual({
      eastward: 9,
      northward: -2,
      vertical: 4,
    });
  });

  it("handles east/west sign cases", () => {
    expect(
      stormRelativeWind(
        { eastward: 10, northward: 0, vertical: 0 },
        { eastward: 3, northward: 0 },
      ),
    ).toEqual({
      eastward: 7,
      northward: 0,
      vertical: 0,
    });

    expect(
      stormRelativeWind(
        { eastward: 10, northward: 0, vertical: 0 },
        { eastward: 15, northward: 0 },
      ),
    ).toEqual({
      eastward: -5,
      northward: 0,
      vertical: 0,
    });
  });

  it("handles north/south sign cases", () => {
    expect(
      stormRelativeWind(
        { eastward: 0, northward: 8, vertical: 0 },
        { eastward: 0, northward: 2 },
      ),
    ).toEqual({
      eastward: 0,
      northward: 6,
      vertical: 0,
    });

    expect(
      stormRelativeWind(
        { eastward: 0, northward: 8, vertical: 0 },
        { eastward: 0, northward: 12 },
      ),
    ).toEqual({
      eastward: 0,
      northward: -4,
      vertical: 0,
    });
  });

  it("subtracts mixed horizontal components", () => {
    expect(
      stormRelativeWind(
        { eastward: 12, northward: -4, vertical: 0 },
        { eastward: 5, northward: 3 },
      ),
    ).toEqual({
      eastward: 7,
      northward: -7,
      vertical: 0,
    });
  });

  it("passes vertical through with nonzero storm-relative horizontal wind", () => {
    expect(
      stormRelativeWind(
        { eastward: 6, northward: 1, vertical: 3 },
        { eastward: 1, northward: 1 },
      ),
    ).toEqual({
      eastward: 5,
      northward: 0,
      vertical: 3,
    });
  });
});
