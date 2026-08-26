import { useEffect } from "react";
import type { HodographPoint } from "../../physics/environment/hodograph.js";
import type { StormMotion } from "../../physics/environment/stormRelativeWind.js";
import { HodographOverlayControls } from "./HodographOverlayControls.js";
import { HodographPanel } from "./HodographPanel.js";
import type { HodographOverlayVisibility } from "./hodographOverlayVisibility.js";
import {
  VIEWBOX_WIDTH,
  type HorizontalVorticityLayerOverlay,
  type StreamwiseCrosswiseVorticityOverlay,
} from "./hodographViewTransform.js";

export const ENVIRONMENT_SURFACE_ID = "environment-surface";
export const ENVIRONMENT_OVERLAY_MIN_WIDTH_PX = 480;

export interface EnvironmentSurfaceProps {
  open: boolean;
  presentation: "overlay" | "column";
  points: HodographPoint[];
  stormMotion: StormMotion;
  selectedHeight: number;
  vorticityLayer?: HorizontalVorticityLayerOverlay;
  streamwiseCrosswiseOverlay?: StreamwiseCrosswiseVorticityOverlay;
  overlayVisibility: HodographOverlayVisibility;
  onOverlayVisibilityChange: (next: HodographOverlayVisibility) => void;
  onClose: () => void;
}

/**
 * On-demand Environment surface: existing hodograph + overlay controls.
 * Overlay presentation is Explore-only; column is Guided's local open home.
 * docs/architecture/42-post-41-3-explore-airflow-and-environment-architecture.md §10
 */
export function EnvironmentSurface({
  open,
  presentation,
  points,
  stormMotion,
  selectedHeight,
  vorticityLayer,
  streamwiseCrosswiseOverlay,
  overlayVisibility,
  onOverlayVisibilityChange,
  onClose,
}: EnvironmentSurfaceProps) {
  useEffect(() => {
    if (presentation !== "overlay" || !open) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, presentation, onClose]);

  const className =
    presentation === "overlay"
      ? "environment-surface environment-surface--overlay"
      : "environment-surface environment-surface--column";

  const overlayStyle =
    presentation === "overlay"
      ? {
          width: VIEWBOX_WIDTH,
          maxWidth: "100%",
          maxHeight: "100%",
          overflowX: "hidden" as const,
          overflowY: "auto" as const,
        }
      : undefined;

  return (
    <section
      id={ENVIRONMENT_SURFACE_ID}
      className={className}
      hidden={!open}
      aria-label="Environment"
      style={overlayStyle}
    >
      <div className="environment-surface__header">
        <h2 className="app__panel-title">Hodograph</h2>
        <button
          type="button"
          className="tracer-runtime-controls__button"
          aria-label="Close Environment"
          onClick={onClose}
        >
          Close
        </button>
      </div>
      <HodographPanel
        points={points}
        stormMotion={stormMotion}
        selectedHeight={selectedHeight}
        vorticityLayer={vorticityLayer}
        streamwiseCrosswiseOverlay={streamwiseCrosswiseOverlay}
        overlayVisibility={overlayVisibility}
      />
      <HodographOverlayControls
        value={overlayVisibility}
        onChange={onOverlayVisibilityChange}
      />
    </section>
  );
}
