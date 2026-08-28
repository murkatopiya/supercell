/**
 * Floating hodograph panel geometry in CSS pixels of the laboratory
 * hodograph host (the tracer viewport box). Not velocity space.
 */

export interface HodographPanelGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ViewportBounds {
  width: number;
  height: number;
}

export const HODOGRAPH_PANEL_MIN_WIDTH_PX = 360;
export const HODOGRAPH_PANEL_MIN_HEIGHT_PX = 280;
export const HODOGRAPH_PANEL_MAX_WIDTH_PX = 720;
export const HODOGRAPH_PANEL_MAX_HEIGHT_PX = 640;
export const HODOGRAPH_HEADER_GRAB_PX = 44;
export const HODOGRAPH_PANEL_INITIAL_X_PX = 12;
export const HODOGRAPH_PANEL_INITIAL_Y_PX = 12;
export const HODOGRAPH_PANEL_INITIAL_WIDTH_PX = 480;
export const HODOGRAPH_PANEL_INITIAL_HEIGHT_PX = 420;

export const INITIAL_HODOGRAPH_PANEL_GEOMETRY: HodographPanelGeometry = {
  x: HODOGRAPH_PANEL_INITIAL_X_PX,
  y: HODOGRAPH_PANEL_INITIAL_Y_PX,
  width: HODOGRAPH_PANEL_INITIAL_WIDTH_PX,
  height: HODOGRAPH_PANEL_INITIAL_HEIGHT_PX,
};

function clampNumber(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return min;
  }
  if (max < min) {
    return min;
  }
  return Math.min(max, Math.max(min, value));
}

export function panelGeometriesEqual(
  a: HodographPanelGeometry,
  b: HodographPanelGeometry,
): boolean {
  return (
    a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height
  );
}

/**
 * Keep size within min/max and keep at least a header grab strip inside
 * the containing laboratory viewport.
 */
export function clampPanelGeometry(
  geometry: HodographPanelGeometry,
  viewport: ViewportBounds,
): HodographPanelGeometry {
  const viewportWidth = Number.isFinite(viewport.width)
    ? Math.max(0, viewport.width)
    : 0;
  const viewportHeight = Number.isFinite(viewport.height)
    ? Math.max(0, viewport.height)
    : 0;

  const maxWidth =
    viewportWidth > 0
      ? Math.max(1, Math.min(HODOGRAPH_PANEL_MAX_WIDTH_PX, viewportWidth))
      : HODOGRAPH_PANEL_MAX_WIDTH_PX;
  const maxHeight =
    viewportHeight > 0
      ? Math.max(1, Math.min(HODOGRAPH_PANEL_MAX_HEIGHT_PX, viewportHeight))
      : HODOGRAPH_PANEL_MAX_HEIGHT_PX;
  const minWidth = Math.min(HODOGRAPH_PANEL_MIN_WIDTH_PX, maxWidth);
  const minHeight = Math.min(HODOGRAPH_PANEL_MIN_HEIGHT_PX, maxHeight);

  const width = clampNumber(geometry.width, minWidth, maxWidth);
  const height = clampNumber(geometry.height, minHeight, maxHeight);

  if (!(viewportWidth > 0) || !(viewportHeight > 0)) {
    return {
      x: Number.isFinite(geometry.x)
        ? geometry.x
        : HODOGRAPH_PANEL_INITIAL_X_PX,
      y: Number.isFinite(geometry.y)
        ? geometry.y
        : HODOGRAPH_PANEL_INITIAL_Y_PX,
      width,
      height,
    };
  }

  const minX = HODOGRAPH_HEADER_GRAB_PX - width;
  const maxX = viewportWidth - HODOGRAPH_HEADER_GRAB_PX;
  const minY = 0;
  const maxY = viewportHeight - HODOGRAPH_HEADER_GRAB_PX;

  return {
    x: clampNumber(geometry.x, minX, Math.max(minX, maxX)),
    y: clampNumber(geometry.y, minY, Math.max(minY, maxY)),
    width,
    height,
  };
}

export function dragPanelByDelta(
  geometry: HodographPanelGeometry,
  deltaX: number,
  deltaY: number,
  viewport: ViewportBounds,
): HodographPanelGeometry {
  return clampPanelGeometry(
    {
      ...geometry,
      x: geometry.x + (Number.isFinite(deltaX) ? deltaX : 0),
      y: geometry.y + (Number.isFinite(deltaY) ? deltaY : 0),
    },
    viewport,
  );
}

export function resizePanelFromSouthEast(
  geometry: HodographPanelGeometry,
  deltaWidth: number,
  deltaHeight: number,
  viewport: ViewportBounds,
): HodographPanelGeometry {
  return clampPanelGeometry(
    {
      ...geometry,
      width: geometry.width + (Number.isFinite(deltaWidth) ? deltaWidth : 0),
      height:
        geometry.height + (Number.isFinite(deltaHeight) ? deltaHeight : 0),
    },
    viewport,
  );
}
