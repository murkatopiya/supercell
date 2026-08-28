import { useEffect, useRef, type PointerEvent, type ReactNode, type RefObject } from "react";
import {
  clampPanelGeometry,
  dragPanelByDelta,
  INITIAL_HODOGRAPH_PANEL_GEOMETRY,
  panelGeometriesEqual,
  resizePanelFromSouthEast,
  type HodographPanelGeometry,
  type ViewportBounds,
} from "./hodographPanelGeometry.js";
import {
  HODOGRAPH_ZOOM_STEP,
  resetHodographPlotView,
  zoomHodographPlotView,
  type HodographPlotView,
} from "./hodographPlotView.js";
import type { ViewTransform } from "./hodographViewTransform.js";

export interface HodographWorkspaceProps {
  open: boolean;
  geometry: HodographPanelGeometry;
  onGeometryChange: (next: HodographPanelGeometry) => void;
  plotView: HodographPlotView;
  onPlotViewChange: (next: HodographPlotView) => void;
  autoscale: ViewTransform;
  onClose: () => void;
  boundsElementRef: RefObject<HTMLElement | null>;
  children: ReactNode;
}

function isHeaderDragExcludedTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) {
    return false;
  }
  return (
    target.closest("button, input, label, fieldset, a, select, textarea") !==
    null
  );
}

function readWindowBounds(): ViewportBounds {
  if (typeof window === "undefined") {
    return { width: 0, height: 0 };
  }
  return { width: window.innerWidth, height: window.innerHeight };
}

function placeInitialGeometryOnWindow(
  geometry: HodographPanelGeometry,
  host: HTMLElement | null,
): HodographPanelGeometry {
  if (
    !panelGeometriesEqual(geometry, INITIAL_HODOGRAPH_PANEL_GEOMETRY) ||
    host === null
  ) {
    return geometry;
  }
  const rect = host.getBoundingClientRect();
  if (!(rect.width > 0) || !(rect.height > 0)) {
    return geometry;
  }
  return {
    ...geometry,
    x: geometry.x + rect.left,
    y: geometry.y + rect.top,
  };
}

/**
 * Shared Guided/Explore floating chrome around HodographPanel.
 * Panel geometry and plot view are owned by the caller (App UI session).
 */
export function HodographWorkspace({
  open,
  geometry,
  onGeometryChange,
  plotView,
  onPlotViewChange,
  autoscale,
  onClose,
  boundsElementRef,
  children,
}: HodographWorkspaceProps) {
  const headerDragRef = useRef<{ lastX: number; lastY: number } | null>(null);
  const resizeDragRef = useRef<{
    lastX: number;
    lastY: number;
    axis: "east" | "south" | "south-east";
  } | null>(null);
  const geometryRef = useRef(geometry);
  geometryRef.current = geometry;

  useEffect(() => {
    const applyClamp = () => {
      const placed = placeInitialGeometryOnWindow(
        geometryRef.current,
        boundsElementRef.current,
      );
      const next = clampPanelGeometry(placed, readWindowBounds());
      if (!panelGeometriesEqual(next, geometryRef.current)) {
        onGeometryChange(next);
      }
    };
    applyClamp();
    const element = boundsElementRef.current;
    if (element === null || typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", applyClamp);
      return () => {
        window.removeEventListener("resize", applyClamp);
      };
    }
    const observer = new ResizeObserver(() => {
      applyClamp();
    });
    observer.observe(element);
    window.addEventListener("resize", applyClamp);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", applyClamp);
    };
  }, [boundsElementRef, onGeometryChange]);

  const onHeaderPointerDown = (event: PointerEvent<HTMLElement>) => {
    if (event.button !== 0 || isHeaderDragExcludedTarget(event.target)) {
      return;
    }
    event.preventDefault();
    window.getSelection()?.removeAllRanges();
    event.currentTarget.setPointerCapture(event.pointerId);
    headerDragRef.current = { lastX: event.clientX, lastY: event.clientY };
  };

  const onHeaderPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (headerDragRef.current === null) {
      return;
    }
    const dx = event.clientX - headerDragRef.current.lastX;
    const dy = event.clientY - headerDragRef.current.lastY;
    headerDragRef.current = { lastX: event.clientX, lastY: event.clientY };
    onGeometryChange(
      dragPanelByDelta(
        geometryRef.current,
        dx,
        dy,
        readWindowBounds(),
      ),
    );
  };

  const endHeaderDrag = (event: PointerEvent<HTMLElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    headerDragRef.current = null;
  };

  const onResizePointerDown = (
    event: PointerEvent<HTMLDivElement>,
    axis: "east" | "south" | "south-east",
  ) => {
    if (event.button !== 0) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    resizeDragRef.current = {
      lastX: event.clientX,
      lastY: event.clientY,
      axis,
    };
  };

  const onResizePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (resizeDragRef.current === null) {
      return;
    }
    const dx = event.clientX - resizeDragRef.current.lastX;
    const dy = event.clientY - resizeDragRef.current.lastY;
    resizeDragRef.current = {
      lastX: event.clientX,
      lastY: event.clientY,
      axis: resizeDragRef.current.axis,
    };
    const axis = resizeDragRef.current.axis;
    onGeometryChange(
      resizePanelFromSouthEast(
        geometryRef.current,
        axis === "south" ? 0 : dx,
        axis === "east" ? 0 : dy,
        readWindowBounds(),
      ),
    );
  };

  const endResizeDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    resizeDragRef.current = null;
  };

  return (
    <section
      id="environment-surface"
      className="hodograph-workspace environment-surface environment-surface--overlay ui-floating-panel"
      hidden={!open}
      aria-label="Environment"
      style={{
        left: geometry.x,
        top: geometry.y,
        width: geometry.width,
        height: geometry.height,
      }}
    >
      <header
        className="hodograph-workspace__header environment-surface__header"
        onPointerDown={onHeaderPointerDown}
        onPointerMove={onHeaderPointerMove}
        onPointerUp={endHeaderDrag}
        onPointerCancel={endHeaderDrag}
      >
        <h2 className="app__panel-title">Hodograph</h2>
        <div className="hodograph-workspace__view-controls">
          <button
            type="button"
            className="ui-button ui-button--subtle tracer-runtime-controls__button"
            aria-label="Zoom out hodograph"
            onClick={() => {
              onPlotViewChange(
                zoomHodographPlotView({
                  view: plotView,
                  factor: 1 / HODOGRAPH_ZOOM_STEP,
                  autoscale,
                }),
              );
            }}
          >
            −
          </button>
          <button
            type="button"
            className="ui-button ui-button--subtle tracer-runtime-controls__button"
            aria-label="Zoom in hodograph"
            onClick={() => {
              onPlotViewChange(
                zoomHodographPlotView({
                  view: plotView,
                  factor: HODOGRAPH_ZOOM_STEP,
                  autoscale,
                }),
              );
            }}
          >
            +
          </button>
          <button
            type="button"
            className="ui-button ui-button--subtle tracer-runtime-controls__button"
            aria-label="Reset hodograph view"
            onClick={() => {
              onPlotViewChange(resetHodographPlotView());
            }}
          >
            Reset
          </button>
        </div>
        <button
          type="button"
          className="ui-button ui-button--subtle tracer-runtime-controls__button"
          aria-label="Close Environment"
          onClick={onClose}
        >
          Close
        </button>
      </header>
      <div className="hodograph-workspace__body">{children}</div>
      <div
        className="hodograph-workspace__resize hodograph-workspace__resize--east"
        onPointerDown={(event) => onResizePointerDown(event, "east")}
        onPointerMove={onResizePointerMove}
        onPointerUp={endResizeDrag}
        onPointerCancel={endResizeDrag}
        title="Resize hodograph panel"
        aria-label="Resize hodograph from the right edge"
      />
      <div
        className="hodograph-workspace__resize hodograph-workspace__resize--south"
        onPointerDown={(event) => onResizePointerDown(event, "south")}
        onPointerMove={onResizePointerMove}
        onPointerUp={endResizeDrag}
        onPointerCancel={endResizeDrag}
        title="Resize hodograph panel"
        aria-label="Resize hodograph from the bottom edge"
      />
      <div
        className="hodograph-workspace__resize hodograph-workspace__resize--south-east"
        onPointerDown={(event) => onResizePointerDown(event, "south-east")}
        onPointerMove={onResizePointerMove}
        onPointerUp={endResizeDrag}
        onPointerCancel={endResizeDrag}
        title="Resize hodograph panel"
        aria-label="Resize hodograph from the bottom-right corner"
      />
    </section>
  );
}
