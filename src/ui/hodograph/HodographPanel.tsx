import { useEffect, useRef } from "react";
import type { HodographPoint } from "../../physics/environment/hodograph.js";
import type { StormMotion } from "../../physics/environment/stormRelativeWind.js";
import {
  DEFAULT_HODOGRAPH_OVERLAY_VISIBILITY,
  isHorizontalVorticityDrawn,
  isStormMotionDrawn,
  isStormRelativeWindDrawn,
  isStreamwiseCrosswiseDrawn,
  type HodographOverlayVisibility,
} from "./hodographOverlayVisibility.js";
import {
  DEFAULT_HODOGRAPH_PLOT_VIEW,
  HODOGRAPH_ZOOM_STEP,
  hodographPlotSpaceCamera,
  hodographPlotSpaceTransformAttribute,
  panHodographPlotView,
  zoomHodographPlotView,
  type HodographPlotView,
} from "./hodographPlotView.js";
import {
  OMEGA_ARROW_LENGTH_PX,
  VIEWBOX_HEIGHT,
  VIEWBOX_WIDTH,
  arrowheadPolygonPoints,
  buildViewTransform,
  canBuildStreamwiseCrosswiseTips,
  findExactHodographPoint,
  formatHeightMeters,
  hodographDisplayKnotIndices,
  isZeroHorizontalVorticity,
  mapHodographPointsToScreen,
  omegaArrowEnd,
  omegaScreenUnitDirection,
  resolveVorticityLayer,
  screenToVelocity,
  segmentVelocityMidpoint,
  streamwiseCrosswiseTips,
  velocityTicks,
  velocityToScreen,
  type HorizontalVorticityLayerOverlay,
  type StreamwiseCrosswiseVorticityOverlay,
  type ViewTransform,
} from "./hodographViewTransform.js";

export type { HorizontalVorticityLayerOverlay, StreamwiseCrosswiseVorticityOverlay };

export interface HodographPanelProps {
  points: HodographPoint[];
  stormMotion?: StormMotion;
  /** Exact knot height (m). No match → silent no V_sr vector. */
  selectedHeight?: number;
  /** Finite-layer ω_h overlay. Physics computed outside the panel. */
  vorticityLayer?: HorizontalVorticityLayerOverlay;
  /** Streamwise/crosswise glyphs; uses matching vorticityLayer for ω_h. */
  streamwiseCrosswiseOverlay?: StreamwiseCrosswiseVorticityOverlay;
  /** Draw gates only; does not affect domain/transform. */
  overlayVisibility?: HodographOverlayVisibility;
  /** Velocity-space camera. Default is v1 autoscale. */
  plotView?: HodographPlotView;
  /** When set, wheel zooms and pointer-drag pans the plot (not the panel). */
  onPlotViewChange?: (next: HodographPlotView) => void;
}

const STORM_MOTION_DIAMOND_HALF = 6;
const KNOT_RADIUS = 4;
const SELECTED_KNOT_RADIUS = 6;

function clientPointToPlotSpace(
  target: SVGSVGElement | SVGGElement,
  clientX: number,
  clientY: number,
): { x: number; y: number } | null {
  const ctm = target.getScreenCTM();
  if (!ctm) {
    return null;
  }
  const point = target.ownerSVGElement
    ? target.ownerSVGElement.createSVGPoint()
    : (target as SVGSVGElement).createSVGPoint();
  point.x = clientX;
  point.y = clientY;
  const local = point.matrixTransform(ctm.inverse());
  return { x: local.x, y: local.y };
}

export function HodographPanel({
  points,
  stormMotion,
  selectedHeight,
  vorticityLayer,
  streamwiseCrosswiseOverlay,
  overlayVisibility = DEFAULT_HODOGRAPH_OVERLAY_VISIBILITY,
  plotView = DEFAULT_HODOGRAPH_PLOT_VIEW,
  onPlotViewChange,
}: HodographPanelProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const plotSpaceRef = useRef<SVGGElement | null>(null);
  const panRef = useRef<{ lastX: number; lastY: number } | null>(null);
  const plotViewRef = useRef(plotView);
  const autoscaleRef = useRef<ViewTransform | null>(null);
  plotViewRef.current = plotView;

  // Stable viewport: autoscale uses data presence, not visibility flags.
  // Zoom/pan is a single SVG camera over that autoscale drawing.
  const overlayVelocities = stormMotion ? [stormMotion] : [];
  const autoscale = buildViewTransform(points, overlayVelocities);
  const transform = autoscale;
  const plotSpaceCamera = hodographPlotSpaceCamera(autoscale, plotView);
  const plotSpaceTransform =
    hodographPlotSpaceTransformAttribute(plotSpaceCamera);
  autoscaleRef.current = autoscale;

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || onPlotViewChange === undefined) {
      return;
    }
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const currentAutoscale = autoscaleRef.current;
      const plotSpace = plotSpaceRef.current ?? svg;
      if (!currentAutoscale) {
        return;
      }
      const local = clientPointToPlotSpace(
        plotSpace,
        event.clientX,
        event.clientY,
      );
      if (!local) {
        return;
      }
      const focus = screenToVelocity(local.x, local.y, currentAutoscale);
      const factor =
        event.deltaY < 0 ? HODOGRAPH_ZOOM_STEP : 1 / HODOGRAPH_ZOOM_STEP;
      onPlotViewChange(
        zoomHodographPlotView({
          view: plotViewRef.current,
          factor,
          autoscale: currentAutoscale,
          focus,
        }),
      );
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      svg.removeEventListener("wheel", onWheel);
    };
  }, [onPlotViewChange]);
  const screenPoints = mapHodographPointsToScreen(points, transform);
  const displayKnotIndices = hodographDisplayKnotIndices(
    points,
    selectedHeight,
  );
  const displayedKnots = [...displayKnotIndices]
    .sort((left, right) => left - right)
    .map((index) => ({
      index,
      point: points[index]!,
      screen: screenPoints[index]!,
    }));
  const polylinePoints = screenPoints
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  const origin = velocityToScreen(0, 0, transform);
  const eastAxisEnd = velocityToScreen(transform.eastwardMax, 0, transform);
  const eastAxisStart = velocityToScreen(transform.eastwardMin, 0, transform);
  const northAxisEnd = velocityToScreen(0, transform.northwardMax, transform);
  const northAxisStart = velocityToScreen(0, transform.northwardMin, transform);

  const eastTicks = velocityTicks(transform.eastwardMin, transform.eastwardMax);
  const northTicks = velocityTicks(
    transform.northwardMin,
    transform.northwardMax,
  );

  const stormScreen = stormMotion
    ? velocityToScreen(stormMotion.eastward, stormMotion.northward, transform)
    : null;

  const selectedPoint =
    selectedHeight === undefined
      ? undefined
      : findExactHodographPoint(points, selectedHeight);

  const selectedScreen = selectedPoint
    ? velocityToScreen(
        selectedPoint.eastward,
        selectedPoint.northward,
        transform,
      )
    : null;

  const showStormMotion = isStormMotionDrawn(
    overlayVisibility,
    stormMotion !== undefined,
  );

  const showStormRelativeVector = isStormRelativeWindDrawn(
    overlayVisibility,
    stormMotion !== undefined,
    selectedPoint !== undefined,
  );

  const vsrArrowHead =
    showStormRelativeVector && stormScreen && selectedScreen
      ? arrowheadPolygonPoints(stormScreen, selectedScreen)
      : null;

  const vsrLabelX =
    showStormRelativeVector && stormScreen && selectedScreen
      ? (stormScreen.x + selectedScreen.x) / 2 + 10
      : 0;
  const vsrLabelY =
    showStormRelativeVector && stormScreen && selectedScreen
      ? (stormScreen.y + selectedScreen.y) / 2
      : 0;

  const resolvedLayer = resolveVorticityLayer(points, vorticityLayer);
  const showVorticityLayer = isHorizontalVorticityDrawn(
    overlayVisibility,
    resolvedLayer !== null,
  );

  const layerLowerScreen =
    showVorticityLayer && resolvedLayer
      ? velocityToScreen(
          resolvedLayer.lower.eastward,
          resolvedLayer.lower.northward,
          transform,
        )
      : null;
  const layerUpperScreen =
    showVorticityLayer && resolvedLayer
      ? velocityToScreen(
          resolvedLayer.upper.eastward,
          resolvedLayer.upper.northward,
          transform,
        )
      : null;

  const omegaUnit =
    showVorticityLayer &&
    resolvedLayer &&
    !isZeroHorizontalVorticity(resolvedLayer.vorticity)
      ? omegaScreenUnitDirection(
          resolvedLayer.vorticity.omegaEastward,
          resolvedLayer.vorticity.omegaNorthward,
        )
      : null;

  const omegaMid =
    showVorticityLayer && resolvedLayer
      ? segmentVelocityMidpoint(resolvedLayer.lower, resolvedLayer.upper)
      : null;

  const omegaAnchor =
    omegaMid && omegaUnit
      ? velocityToScreen(omegaMid.eastward, omegaMid.northward, transform)
      : null;

  const omegaTip =
    omegaAnchor && omegaUnit
      ? omegaArrowEnd(omegaAnchor, omegaUnit, OMEGA_ARROW_LENGTH_PX)
      : null;

  const omegaHead =
    omegaAnchor && omegaTip
      ? arrowheadPolygonPoints(omegaAnchor, omegaTip)
      : null;

  const scGeometryOk = canBuildStreamwiseCrosswiseTips(
    points,
    vorticityLayer,
    streamwiseCrosswiseOverlay,
  );
  const showStreamwiseCrosswise = isStreamwiseCrosswiseDrawn(
    overlayVisibility,
    showVorticityLayer,
    scGeometryOk,
  );

  // Same ω_h anchor (velocity midpoint); basis comes from overlay V_sr_avg only.
  const scTips =
    showStreamwiseCrosswise &&
    omegaAnchor &&
    resolvedLayer &&
    streamwiseCrosswiseOverlay
      ? streamwiseCrosswiseTips(
          omegaAnchor,
          resolvedLayer.vorticity,
          streamwiseCrosswiseOverlay.basisStormRelativeWind.eastward,
          streamwiseCrosswiseOverlay.basisStormRelativeWind.northward,
          streamwiseCrosswiseOverlay.decomposition,
          OMEGA_ARROW_LENGTH_PX,
        )
      : null;

  const tipSHead =
    scTips && omegaAnchor
      ? arrowheadPolygonPoints(omegaAnchor, scTips.tipStreamwise)
      : null;
  const tipCHead =
    scTips && omegaAnchor
      ? arrowheadPolygonPoints(omegaAnchor, scTips.tipCrosswise)
      : null;

  return (
    <svg
      ref={svgRef}
      className={
        onPlotViewChange
          ? "hodograph-panel hodograph-panel--interactive"
          : "hodograph-panel"
      }
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Ground-relative hodograph"
      onPointerDown={(event) => {
        if (onPlotViewChange === undefined || event.button !== 0) {
          return;
        }
        event.preventDefault();
        window.getSelection()?.removeAllRanges();
        event.currentTarget.setPointerCapture(event.pointerId);
        panRef.current = { lastX: event.clientX, lastY: event.clientY };
      }}
      onPointerMove={(event) => {
        if (onPlotViewChange === undefined || panRef.current === null) {
          return;
        }
        const svg = svgRef.current;
        const currentAutoscale = autoscaleRef.current;
        const plotSpace = plotSpaceRef.current ?? svg;
        if (!svg || !currentAutoscale || !plotSpace) {
          return;
        }
        const last = clientPointToPlotSpace(
          plotSpace,
          panRef.current.lastX,
          panRef.current.lastY,
        );
        const next = clientPointToPlotSpace(
          plotSpace,
          event.clientX,
          event.clientY,
        );
        if (!last || !next) {
          return;
        }
        const deltaEastward = (next.x - last.x) / currentAutoscale.scale;
        const deltaNorthward = -((next.y - last.y) / currentAutoscale.scale);
        panRef.current = { lastX: event.clientX, lastY: event.clientY };
        onPlotViewChange(
          panHodographPlotView(
            plotViewRef.current,
            -deltaEastward,
            -deltaNorthward,
          ),
        );
      }}
      onPointerUp={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
        panRef.current = null;
      }}
      onPointerCancel={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
        panRef.current = null;
      }}
    >
      <rect
        x={0}
        y={0}
        width={VIEWBOX_WIDTH}
        height={VIEWBOX_HEIGHT}
        className="hodograph-panel__background"
      />

      <g
        ref={plotSpaceRef}
        className="hodograph-panel__plot-space"
        transform={plotSpaceTransform}
      >
      <line
        x1={eastAxisStart.x}
        y1={eastAxisStart.y}
        x2={eastAxisEnd.x}
        y2={eastAxisEnd.y}
        className="hodograph-panel__axis"
      />
      <line
        x1={northAxisStart.x}
        y1={northAxisStart.y}
        x2={northAxisEnd.x}
        y2={northAxisEnd.y}
        className="hodograph-panel__axis"
      />

      {eastTicks.map((tick) => {
        const p = velocityToScreen(tick, 0, transform);
        return (
          <g key={`e-${tick}`}>
            <line
              x1={p.x}
              y1={p.y - 4}
              x2={p.x}
              y2={p.y + 4}
              className="hodograph-panel__tick"
            />
            <text
              x={p.x}
              y={p.y + 16}
              className="hodograph-panel__tick-label"
              textAnchor="middle"
            >
              {tick}
            </text>
          </g>
        );
      })}

      {northTicks.map((tick) => {
        const p = velocityToScreen(0, tick, transform);
        return (
          <g key={`n-${tick}`}>
            <line
              x1={p.x - 4}
              y1={p.y}
              x2={p.x + 4}
              y2={p.y}
              className="hodograph-panel__tick"
            />
            <text
              x={p.x - 8}
              y={p.y + 4}
              className="hodograph-panel__tick-label"
              textAnchor="end"
            >
              {tick}
            </text>
          </g>
        );
      })}

      <text
        x={(eastAxisStart.x + eastAxisEnd.x) / 2}
        y={VIEWBOX_HEIGHT - 12}
        className="hodograph-panel__axis-title"
        textAnchor="middle"
      >
        eastward (m/s)
      </text>
      <text
        x={16}
        y={(northAxisStart.y + northAxisEnd.y) / 2}
        className="hodograph-panel__axis-title"
        textAnchor="middle"
        transform={`rotate(-90 16 ${(northAxisStart.y + northAxisEnd.y) / 2})`}
      >
        northward (m/s)
      </text>

      {polylinePoints.length > 0 ? (
        <polyline
          points={polylinePoints}
          className="hodograph-panel__polyline"
          fill="none"
        />
      ) : null}

      {layerLowerScreen && layerUpperScreen ? (
        <line
          x1={layerLowerScreen.x}
          y1={layerLowerScreen.y}
          x2={layerUpperScreen.x}
          y2={layerUpperScreen.y}
          stroke="#9a6700"
          strokeWidth={4}
          strokeLinecap="round"
        />
      ) : null}

      {omegaAnchor && omegaTip ? (
        <g className="hodograph-panel__horizontal-vorticity">
          <line
            x1={omegaAnchor.x}
            y1={omegaAnchor.y}
            x2={omegaTip.x}
            y2={omegaTip.y}
            stroke="#8250df"
            strokeWidth={2}
          />
          {omegaHead ? (
            <polygon points={omegaHead} fill="#8250df" stroke="none" />
          ) : null}
          <text
            x={omegaTip.x + 12}
            y={omegaTip.y - 10}
            fill="#8250df"
            fontSize={12}
            fontWeight={650}
          >
            ω_h
          </text>
        </g>
      ) : null}

      {scTips && omegaAnchor ? (
        <g className="hodograph-panel__streamwise-crosswise">
          <line
            x1={scTips.tipStreamwise.x}
            y1={scTips.tipStreamwise.y}
            x2={scTips.tipOmega.x}
            y2={scTips.tipOmega.y}
            stroke="#bf3989"
            strokeWidth={1}
            strokeDasharray="4 3"
            opacity={0.7}
          />
          <line
            x1={scTips.tipCrosswise.x}
            y1={scTips.tipCrosswise.y}
            x2={scTips.tipOmega.x}
            y2={scTips.tipOmega.y}
            stroke="#bf3989"
            strokeWidth={1}
            strokeDasharray="4 3"
            opacity={0.7}
          />
          <line
            x1={omegaAnchor.x}
            y1={omegaAnchor.y}
            x2={scTips.tipStreamwise.x}
            y2={scTips.tipStreamwise.y}
            stroke="#bf3989"
            strokeWidth={2}
          />
          {tipSHead ? (
            <polygon points={tipSHead} fill="#bf3989" stroke="none" />
          ) : null}
          <text
            x={scTips.tipStreamwise.x + 12}
            y={scTips.tipStreamwise.y + 14}
            fill="#bf3989"
            fontSize={11}
            fontWeight={650}
          >
            ω_s
          </text>
          <line
            x1={omegaAnchor.x}
            y1={omegaAnchor.y}
            x2={scTips.tipCrosswise.x}
            y2={scTips.tipCrosswise.y}
            stroke="#9a6700"
            strokeWidth={2}
          />
          {tipCHead ? (
            <polygon points={tipCHead} fill="#9a6700" stroke="none" />
          ) : null}
          <text
            x={scTips.tipCrosswise.x - 12}
            y={scTips.tipCrosswise.y - 12}
            fill="#9a6700"
            fontSize={11}
            fontWeight={650}
            textAnchor="end"
          >
            ω_c
          </text>
        </g>
      ) : null}

      {showStormRelativeVector && stormScreen && selectedScreen ? (
        <g className="hodograph-panel__storm-relative-wind">
          <line
            x1={stormScreen.x}
            y1={stormScreen.y}
            x2={selectedScreen.x}
            y2={selectedScreen.y}
            stroke="#0f7b6c"
            strokeWidth={2}
          />
          {vsrArrowHead ? (
            <polygon points={vsrArrowHead} fill="#0f7b6c" stroke="none" />
          ) : null}
          <text
            x={vsrLabelX}
            y={vsrLabelY}
            fill="#0f7b6c"
            fontSize={12}
            fontWeight={650}
          >
            V_sr
          </text>
        </g>
      ) : null}

      {displayedKnots.map(({ index, point, screen }) => {
          const selected =
            selectedPoint !== undefined && point === selectedPoint;
          return (
            <circle
              key={`knot-${point.height}-${index}`}
              cx={screen.x}
              cy={screen.y}
              r={selected ? SELECTED_KNOT_RADIUS : KNOT_RADIUS}
              className="hodograph-panel__marker"
              stroke={selected ? "#0842a0" : undefined}
              strokeWidth={selected ? 2 : undefined}
            />
          );
        })}

      {showStormMotion && stormScreen ? (
        <g className="hodograph-panel__storm-motion">
          <polygon
            points={[
              `${stormScreen.x},${stormScreen.y - STORM_MOTION_DIAMOND_HALF}`,
              `${stormScreen.x + STORM_MOTION_DIAMOND_HALF},${stormScreen.y}`,
              `${stormScreen.x},${stormScreen.y + STORM_MOTION_DIAMOND_HALF}`,
              `${stormScreen.x - STORM_MOTION_DIAMOND_HALF},${stormScreen.y}`,
            ].join(" ")}
            fill="#b42318"
            stroke="#ffffff"
            strokeWidth={1}
          />
          <text
            x={stormScreen.x + 10}
            y={stormScreen.y + 4}
            fill="#b42318"
            fontSize={12}
            fontWeight={650}
          >
            C
          </text>
        </g>
      ) : null}

      <circle
        cx={origin.x}
        cy={origin.y}
        r={2.5}
        className="hodograph-panel__origin"
      />

      {displayedKnots.map(({ index, point, screen }) => (
        <text
          key={`height-${point.height}-${index}`}
          x={screen.x + 8}
          y={screen.y - 8}
          className="hodograph-panel__height-label"
        >
          {formatHeightMeters(point.height)}
        </text>
      ))}
      </g>
    </svg>
  );
}
