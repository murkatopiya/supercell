import { describe, expect, it } from "vitest";
import {
  clampPanelGeometry,
  dragPanelByDelta,
  HODOGRAPH_HEADER_GRAB_PX,
  HODOGRAPH_HEADER_HEIGHT_PX,
  HODOGRAPH_PANEL_MIN_HEIGHT_PX,
  HODOGRAPH_PANEL_MIN_WIDTH_PX,
  INITIAL_HODOGRAPH_PANEL_GEOMETRY,
  resizePanelFromSouthEast,
} from "./hodographPanelGeometry.js";
import { DEFAULT_HODOGRAPH_PLOT_VIEW } from "./hodographPlotView.js";

const viewport = { width: 1920, height: 1080 };

describe("hodographPanelGeometry", () => {
  it("starts at the documented initial placement over the viewport host", () => {
    expect(INITIAL_HODOGRAPH_PANEL_GEOMETRY).toEqual({
      x: 12,
      y: 12,
      width: 880,
      height: 650,
    });
    const clamped = clampPanelGeometry(
      INITIAL_HODOGRAPH_PANEL_GEOMETRY,
      viewport,
    );
    expect(clamped).toEqual(INITIAL_HODOGRAPH_PANEL_GEOMETRY);
  });

  it("panel drag changes only position and cannot hide the header", () => {
    const plotView = DEFAULT_HODOGRAPH_PLOT_VIEW;
    const moved = dragPanelByDelta(
      INITIAL_HODOGRAPH_PANEL_GEOMETRY,
      40,
      25,
      viewport,
    );
    expect(moved).toEqual({
      x: 52,
      y: 37,
      width: INITIAL_HODOGRAPH_PANEL_GEOMETRY.width,
      height: INITIAL_HODOGRAPH_PANEL_GEOMETRY.height,
    });
    expect(plotView).toEqual(DEFAULT_HODOGRAPH_PLOT_VIEW);

    const lost = dragPanelByDelta(
      INITIAL_HODOGRAPH_PANEL_GEOMETRY,
      -4000,
      4000,
      viewport,
    );
    expect(lost.x).toBe(
      HODOGRAPH_HEADER_GRAB_PX - INITIAL_HODOGRAPH_PANEL_GEOMETRY.width,
    );
    expect(lost.y).toBe(viewport.height - HODOGRAPH_HEADER_GRAB_PX);
    expect(lost.x + lost.width).toBeGreaterThanOrEqual(HODOGRAPH_HEADER_GRAB_PX);
    expect(lost.y).toBeLessThan(viewport.height);

    const above = dragPanelByDelta(
      INITIAL_HODOGRAPH_PANEL_GEOMETRY,
      0,
      -4000,
      viewport,
    );
    expect(above.y).toBe(
      HODOGRAPH_HEADER_GRAB_PX - HODOGRAPH_HEADER_HEIGHT_PX,
    );
    expect(above.y).toBeLessThan(0);
    expect(above.y + HODOGRAPH_HEADER_HEIGHT_PX).toBe(
      HODOGRAPH_HEADER_GRAB_PX,
    );
  });

  it("resize respects min/max and does not change plot view state", () => {
    const plotView = { ...DEFAULT_HODOGRAPH_PLOT_VIEW, userScale: 3 };
    const grown = resizePanelFromSouthEast(
      INITIAL_HODOGRAPH_PANEL_GEOMETRY,
      80,
      60,
      viewport,
    );
    expect(grown.width).toBe(960);
    expect(grown.height).toBe(710);
    expect(grown.x).toBe(INITIAL_HODOGRAPH_PANEL_GEOMETRY.x);
    expect(grown.y).toBe(INITIAL_HODOGRAPH_PANEL_GEOMETRY.y);

    const tooSmall = resizePanelFromSouthEast(
      INITIAL_HODOGRAPH_PANEL_GEOMETRY,
      -1000,
      -1000,
      viewport,
    );
    expect(tooSmall.width).toBe(HODOGRAPH_PANEL_MIN_WIDTH_PX);
    expect(tooSmall.height).toBe(HODOGRAPH_PANEL_MIN_HEIGHT_PX);

    const tooBig = resizePanelFromSouthEast(
      INITIAL_HODOGRAPH_PANEL_GEOMETRY,
      5000,
      5000,
      viewport,
    );
    expect(tooBig.width).toBe(viewport.width);
    expect(tooBig.height).toBe(viewport.height);

    const eastOnly = resizePanelFromSouthEast(
      INITIAL_HODOGRAPH_PANEL_GEOMETRY,
      80,
      0,
      viewport,
    );
    expect(eastOnly.width).toBe(960);
    expect(eastOnly.height).toBe(INITIAL_HODOGRAPH_PANEL_GEOMETRY.height);

    const southOnly = resizePanelFromSouthEast(
      INITIAL_HODOGRAPH_PANEL_GEOMETRY,
      0,
      60,
      viewport,
    );
    expect(southOnly.width).toBe(INITIAL_HODOGRAPH_PANEL_GEOMETRY.width);
    expect(southOnly.height).toBe(710);
    expect(plotView.userScale).toBe(3);
    expect(plotView.panEastward).toBe(0);
  });

  it("re-clamps after a smaller window so the panel stays reachable", () => {
    const hanging = {
      x: 800,
      y: 600,
      width: 480,
      height: 420,
    };
    const next = clampPanelGeometry(hanging, { width: 500, height: 360 });
    expect(next.x + HODOGRAPH_HEADER_GRAB_PX).toBeLessThanOrEqual(500);
    expect(next.y).toBeLessThanOrEqual(360 - HODOGRAPH_HEADER_GRAB_PX);
    expect(next.y).toBeGreaterThanOrEqual(
      HODOGRAPH_HEADER_GRAB_PX - HODOGRAPH_HEADER_HEIGHT_PX,
    );
    expect(next.width).toBeLessThanOrEqual(500);
    expect(next.height).toBeLessThanOrEqual(360);
  });
});
