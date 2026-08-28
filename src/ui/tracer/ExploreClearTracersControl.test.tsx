import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  CLEAR_TRACERS_EMPTY_REASON,
  ExploreClearTracersControl,
  requestClearTracers,
} from "./ExploreClearTracersControl.js";
import clearSrc from "./ExploreClearTracersControl.tsx?raw";

describe("ExploreClearTracersControl disabled occupancy contract", () => {
  it("is disabled when occupancy is empty", () => {
    const html = renderToStaticMarkup(
      <ExploreClearTracersControl tracerCount={0} onClear={() => {}} />,
    );
    expect(html).toContain("disabled");
    expect(html).toContain(CLEAR_TRACERS_EMPTY_REASON);
    expect(clearSrc).toMatch(/disabled=\{disabled\}/);
    expect(clearSrc).toMatch(/tracerCount === 0/);
  });

  it("is enabled when occupancy is at least one tracer", () => {
    const html = renderToStaticMarkup(
      <ExploreClearTracersControl tracerCount={1} onClear={() => {}} />,
    );
    expect(html).not.toContain("disabled");
    expect(html).not.toContain(CLEAR_TRACERS_EMPTY_REASON);
  });

  it("does not invoke clear when occupancy is empty", () => {
    const onClear = vi.fn();
    requestClearTracers(0, onClear);
    expect(onClear).not.toHaveBeenCalled();
  });

  it("invokes clear when occupancy is at least one tracer", () => {
    const onClear = vi.fn();
    requestClearTracers(2, onClear);
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
