import { describe, expect, it } from "vitest";
import { pointerNdcFromClientRect } from "./pointerNdcFromClientRect.js";

describe("pointerNdcFromClientRect", () => {
  it("maps the box center to NDC origin", () => {
    expect(
      pointerNdcFromClientRect(110, 70, {
        left: 10,
        top: 20,
        width: 200,
        height: 100,
      }),
    ).toEqual({ x: 0, y: 0 });
  });

  it("maps the top-left corner to (-1, 1)", () => {
    expect(
      pointerNdcFromClientRect(10, 20, {
        left: 10,
        top: 20,
        width: 200,
        height: 100,
      }),
    ).toEqual({ x: -1, y: 1 });
  });

  it("rejects empty or non-finite boxes", () => {
    expect(
      pointerNdcFromClientRect(0, 0, {
        left: 0,
        top: 0,
        width: 0,
        height: 100,
      }),
    ).toBeNull();
    expect(
      pointerNdcFromClientRect(Number.NaN, 0, {
        left: 0,
        top: 0,
        width: 10,
        height: 10,
      }),
    ).toBeNull();
  });
});
