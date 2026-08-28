import { useEffect, useRef, type PointerEvent, type ReactNode, type RefObject } from "react";
import {
  clampPanelGeometry,
  dragPanelByDelta,
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

function readViewportBounds(element: HTMLElement | null): ViewportBounds {
  if (element === null) {
    return { width: 0, height: 0 };
  }
  const rect = element.getBoundingClientRect();
  return { width: rect.width, height: rect.height };
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
  const resizeDragRef = useRef<{ lastX: number; lastY: number } | null>(null);
  const geometryRef = useRef(geometry);
  geometryRef.current = geometry;

  useEffect(() => {
    const applyClamp = () => {
      const next = clampPanelGeometry(
        geometryRef.current,
        readViewportBounds(boundsElementRef.current),
      );
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
        readViewportBounds(boundsElementRef.current),
      ),
    );
  };

  const endHeaderDrag = (event: PointerEvent<HTMLElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    headerDragRef.current = null;
  };

  const onResizePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    resizeDragRef.current = { lastX: event.clientX, lastY: event.clientY };
  };

  const onResizePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (resizeDragRef.current === null) {
      return;
    }
    const dWidth = event.clientX - resizeDragRef.current.lastX;
    const dHeight = event.clientY - resizeDragRef.current.lastY;
    resizeDragRef.current = { lastX: event.clientX, lastY: event.clientY };
    onGeometryChange(
      resizePanelFromSouthEast(
        geometryRef.current,
        dWidth,
        dHeight,
        readViewportBounds(boundsElementRef.current),
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
      className="hodograph-workspace environment-surface environment-surface--overlay"
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
            className="tracer-runtime-controls__button"
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
            className="tracer-runtime-controls__button"
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
            className="tracer-runtime-controls__button"
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
          className="tracer-runtime-controls__button"
          aria-label="Close Environment"
          onClick={onClose}
        >
          Close
        </button>
      </header>
      <div className="hodograph-workspace__body">{children}</div>
      <div
        className="hodograph-workspace__resize"
        onPointerDown={onResizePointerDown}
        onPointerMove={onResizePointerMove}
        onPointerUp={endResizeDrag}
        onPointerCancel={endResizeDrag}
        title="Resize hodograph panel"
      />
    </section>
  );
}
