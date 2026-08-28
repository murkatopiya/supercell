import { useEffect, type RefObject } from "react";
import type { HodographPoint } from "../../physics/environment/hodograph.js";
import type { StormMotion } from "../../physics/environment/stormRelativeWind.js";
import {
  DEMO_PRESCRIBED_ENVIRONMENT_LABEL,
  EXPLORE_ENVIRONMENT_DEMO_PRESCRIBED,
  EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
  GOSHEN_2009_OBSERVED_ENVIRONMENT_LABEL,
  GOSHEN_OBSERVED_ENVIRONMENT_COPY,
  GOSHEN_PRESCRIBED_STORM_COPY,
  GOSHEN_SANDBOX_ANTI_CLAIM,
  type ExploreEnvironmentIdentity,
} from "../../explore/exploreEnvironmentIdentity.js";
import { HodographOverlayControls } from "./HodographOverlayControls.js";
import { HodographPanel } from "./HodographPanel.js";
import { HodographWorkspace } from "./HodographWorkspace.js";
import type { HodographOverlayVisibility } from "./hodographOverlayVisibility.js";
import type { HodographPanelGeometry } from "./hodographPanelGeometry.js";
import { HODOGRAPH_PANEL_MIN_WIDTH_PX } from "./hodographPanelGeometry.js";
import type { HodographPlotView } from "./hodographPlotView.js";
import {
  buildViewTransform,
  type HorizontalVorticityLayerOverlay,
  type StreamwiseCrosswiseVorticityOverlay,
} from "./hodographViewTransform.js";

export const ENVIRONMENT_SURFACE_ID = "environment-surface";
/** @deprecated Slice 5: use HODOGRAPH_PANEL_MIN_WIDTH_PX. */
export const ENVIRONMENT_OVERLAY_MIN_WIDTH_PX = HODOGRAPH_PANEL_MIN_WIDTH_PX;

export interface EnvironmentSurfaceProps {
  open: boolean;
  points: HodographPoint[];
  stormMotion: StormMotion;
  selectedHeight?: number;
  vorticityLayer?: HorizontalVorticityLayerOverlay;
  streamwiseCrosswiseOverlay?: StreamwiseCrosswiseVorticityOverlay;
  overlayVisibility: HodographOverlayVisibility;
  onOverlayVisibilityChange: (next: HodographOverlayVisibility) => void;
  onClose: () => void;
  panelGeometry: HodographPanelGeometry;
  onPanelGeometryChange: (next: HodographPanelGeometry) => void;
  plotView: HodographPlotView;
  onPlotViewChange: (next: HodographPlotView) => void;
  boundsElementRef: RefObject<HTMLElement | null>;
  environmentIdentity?: ExploreEnvironmentIdentity;
  onEnvironmentIdentityChange?: (next: ExploreEnvironmentIdentity) => void;
}

/**
 * On-demand Environment surface: shared floating hodograph workspace
 * for Guided and Explore. Mode extras (identity radios) stay here.
 * docs/ui/11-floating-hodograph-workspace.md
 */
export function EnvironmentSurface({
  open,
  points,
  stormMotion,
  selectedHeight,
  vorticityLayer,
  streamwiseCrosswiseOverlay,
  overlayVisibility,
  onOverlayVisibilityChange,
  onClose,
  panelGeometry,
  onPanelGeometryChange,
  plotView,
  onPlotViewChange,
  boundsElementRef,
  environmentIdentity,
  onEnvironmentIdentityChange,
}: EnvironmentSurfaceProps) {
  useEffect(() => {
    if (!open) {
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
  }, [open, onClose]);

  const autoscale = buildViewTransform(points, [stormMotion]);

  return (
    <HodographWorkspace
      open={open}
      geometry={panelGeometry}
      onGeometryChange={onPanelGeometryChange}
      plotView={plotView}
      onPlotViewChange={onPlotViewChange}
      autoscale={autoscale}
      onClose={onClose}
      boundsElementRef={boundsElementRef}
    >
      {environmentIdentity !== undefined && onEnvironmentIdentityChange ? (
        <fieldset className="environment-surface__identity">
          <legend className="environment-surface__identity-legend">
            Environment
          </legend>
          <label className="environment-surface__identity-option">
            <input
              type="radio"
              name="explore-environment-identity"
              checked={
                environmentIdentity === EXPLORE_ENVIRONMENT_DEMO_PRESCRIBED
              }
              onChange={() =>
                onEnvironmentIdentityChange(
                  EXPLORE_ENVIRONMENT_DEMO_PRESCRIBED,
                )
              }
            />
            {DEMO_PRESCRIBED_ENVIRONMENT_LABEL}
          </label>
          <label className="environment-surface__identity-option">
            <input
              type="radio"
              name="explore-environment-identity"
              checked={
                environmentIdentity ===
                EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED
              }
              onChange={() =>
                onEnvironmentIdentityChange(
                  EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
                )
              }
            />
            {GOSHEN_2009_OBSERVED_ENVIRONMENT_LABEL}
          </label>
        </fieldset>
      ) : null}
      {environmentIdentity === EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED ? (
        <div className="environment-surface__honesty">
          <p>{GOSHEN_OBSERVED_ENVIRONMENT_COPY}</p>
          <p>{GOSHEN_PRESCRIBED_STORM_COPY}</p>
          <p>{GOSHEN_SANDBOX_ANTI_CLAIM}</p>
        </div>
      ) : null}
      <div className="hodograph-workspace__plot">
        <HodographPanel
          points={points}
          stormMotion={stormMotion}
          selectedHeight={selectedHeight}
          vorticityLayer={vorticityLayer}
          streamwiseCrosswiseOverlay={streamwiseCrosswiseOverlay}
          overlayVisibility={overlayVisibility}
          plotView={plotView}
          onPlotViewChange={onPlotViewChange}
        />
      </div>
      <HodographOverlayControls
        value={overlayVisibility}
        onChange={onOverlayVisibilityChange}
      />
    </HodographWorkspace>
  );
}
