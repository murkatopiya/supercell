import { useEffect, useImperativeHandle, useRef, type Ref } from "react";
import { TracerScene } from "../../rendering/TracerScene.js";
import { VisualAirflowWorkbenchScene } from "../../rendering/VisualAirflowWorkbenchScene.js";
import {
  DEFAULT_OPERAND_HIGHLIGHT_MODE,
  DEFAULT_VISUAL_AIRFLOW_PAUSE_VISUALIZATION,
  DEFAULT_VISUAL_AIRFLOW_WORKBENCH_MODE,
  type OperandHighlightMode,
  type VisualAirflowPauseVisualization,
  type VisualAirflowWorkbenchMode,
} from "../../rendering/visualAirflowWorkbenchMode.js";
import { consumeFixedTimesteps } from "../../simulation/consumeFixedTimesteps.js";
import type { TracerPathHistory } from "../../simulation/TracerPathHistory.js";
import { simulationElapsedFromWall } from "../../simulation/simulationElapsedFromWall.js";
import type { Simulation } from "../../simulation/Simulation.js";
import type { TracerSeedPosition } from "../../simulation/createTracersFromSeeds.js";
import type { Vec3 } from "../../core/math/Vec3.js";
import type { VelocityField } from "../../core/fields/VelocityField.js";
import type { EulerianAirflowSamples } from "../../visualization/EulerianAirflowSamples.js";
import type { VisualAirflowPopulation } from "../../visualization/VisualAirflowPopulation.js";
import { stepVisualAirflowOnFrozenField } from "../../visualization/stepVisualAirflowOnFrozenField.js";
import { visualAirflowElapsedFromWall } from "../../visualization/visualAirflowElapsedFromWall.js";
import { advanceLaboratoryFixedStep } from "./advanceLaboratoryFixedStep.js";
import type { TracerTimeScale } from "./TracerRuntimeControls.js";
import { pointerNdcFromClientRect } from "./pointerNdcFromClientRect.js";
import {
  occupancyIndexForTracerId,
  resolveTracerPointerUp,
  tracerIdForSlot,
} from "./resolveTracerPointerUp.js";
import { viewportFollowSync } from "./viewportFollowSync.js";

export interface TracerViewportHandle {
  addTracerSlot(): void;
  clearTracerSlots(): void;
  syncReleasePreview(pendingSeed: TracerSeedPosition | null): void;
  /**
   * Restore DEEP_STORM_TRACER_VIEW via TracerScene.resetView.
   * App turns Follow OFF before calling this.
   */
  resetView(): void;
  readonly tracerSlotCount: number;
}

export interface TracerViewportProps {
  simulation: Simulation;
  /** Present only in story mode. Diagnostic live path omits this. */
  pathHistory?: TracerPathHistory | null;
  /** Renderer observe flag. Default false. Not a physics concern. */
  keepInactiveGlyphs?: boolean;
  timestep: number;
  paused: boolean;
  timeScale: TracerTimeScale;
  /** Bumped on Reset so the loop clears accumulator without recreating the scene. */
  resetEpoch: number;
  /**
   * Pending release preview. Not a tracer slot. Omitted / null hides the marker.
   */
  pendingReleasePreview?: TracerSeedPosition | null;
  /**
   * When set, a left-button pointerup reports a world ray and pointer
   * movement. The caller owns placement policy (including orbit-drag reject).
   */
  onPlacementAttempt?: (
    origin: Vec3,
    direction: Vec3,
    pointerMovementPx: number,
  ) => void;
  /**
   * Occupancy highlight observation. TracerScene does not own selectedId.
   */
  selectedTracerId?: number | null;
  /**
   * Explore background airflow. Guided omits this. Not scientific
   * occupancy and not a TracerScene slot.
   */
  visualAirflowPopulation?: VisualAirflowPopulation | null;
  /**
   * Fixed Eulerian samples for the workbench. Guided omits this.
   */
  eulerianAirflowSamples?: EulerianAirflowSamples | null;
  /**
   * Canonical V_total identity used by R1/R2 observation. Guided omits.
   */
  visualAirflowField?: VelocityField | null;
  /**
   * Explore airflow view encoding. Must not recreate TracerScene (keep
   * out of the mount effect deps). Default: Flow comets.
   */
  workbenchMode?: VisualAirflowWorkbenchMode;
  pauseVisualization?: VisualAirflowPauseVisualization;
  highlightMode?: OperandHighlightMode;
  /**
   * SAME named storm operand instance from velocityObservation.parts.
   * Guided omits this. Not a rebuilt field.
   */
  highlightOperand?: VelocityField | null;
  /**
   * Orthogonal camera-distance salience. Not meteorological fog.
   */
  depthCueEnabled?: boolean;
  /**
   * Glyph pick → stable tracerId. Guided has this without placement.
   */
  onTracerSelect?: (tracerId: number) => void;
  /**
   * After one or more fixed steps in this animation frame, once the
   * displayed particle/clock state is current. Not called when
   * consumed.steps === 0.
   */
  onSimulationAdvanced?: () => void;
  /**
   * Live App Follow flag. Read every frame after glyph sync.
   * A ref so Reset/Clear can turn Follow OFF before the next rAF
   * observes restored or emptied particles.
   */
  followEnabledRef?: { current: boolean };
  /**
   * Follow was ON and the selected tracer no longer resolves.
   * App turns followEnabled OFF. Does not clear selection.
   */
  onFollowUnavailable?: () => void;
  /** Imperative observe-slot / preview access. Does not recreate the scene. */
  sceneHandleRef?: Ref<TracerViewportHandle | null>;
}

/**
 * Thin React canvas host for TracerScene.
 * Owns mount/dispose, resize, and the rAF fixed-step loop.
 */
export function TracerViewport({
  simulation,
  pathHistory = null,
  keepInactiveGlyphs = false,
  timestep,
  paused,
  timeScale,
  resetEpoch,
  pendingReleasePreview = null,
  onPlacementAttempt,
  selectedTracerId = null,
  visualAirflowPopulation = null,
  eulerianAirflowSamples = null,
  visualAirflowField = null,
  workbenchMode = DEFAULT_VISUAL_AIRFLOW_WORKBENCH_MODE,
  pauseVisualization = DEFAULT_VISUAL_AIRFLOW_PAUSE_VISUALIZATION,
  highlightMode = DEFAULT_OPERAND_HIGHLIGHT_MODE,
  highlightOperand = null,
  depthCueEnabled = false,
  onTracerSelect,
  onSimulationAdvanced,
  followEnabledRef,
  onFollowUnavailable,
  sceneHandleRef,
}: TracerViewportProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(paused);
  const timeScaleRef = useRef(timeScale);
  const resetPendingRef = useRef(false);
  const wasPausedRef = useRef(paused);
  const sceneRef = useRef<TracerScene | null>(null);
  const pendingPreviewRef = useRef<TracerSeedPosition | null>(
    pendingReleasePreview,
  );
  const onPlacementAttemptRef = useRef(onPlacementAttempt);
  const onTracerSelectRef = useRef(onTracerSelect);
  const onSimulationAdvancedRef = useRef(onSimulationAdvanced);
  const followEnabledSourceRef = useRef(followEnabledRef);
  const onFollowUnavailableRef = useRef(onFollowUnavailable);
  const selectedTracerIdRef = useRef<number | null>(selectedTracerId);
  const localSceneHandleRef = useRef<TracerViewportHandle | null>(null);
  const workbenchModeRef = useRef(workbenchMode);
  const pauseVisualizationRef = useRef(pauseVisualization);
  const highlightModeRef = useRef(highlightMode);
  const highlightOperandRef = useRef(highlightOperand);
  const depthCueEnabledRef = useRef(depthCueEnabled);
  const eulerianAirflowSamplesRef = useRef(eulerianAirflowSamples);
  const visualAirflowFieldRef = useRef(visualAirflowField);

  pausedRef.current = paused;
  timeScaleRef.current = timeScale;
  pendingPreviewRef.current = pendingReleasePreview;
  onPlacementAttemptRef.current = onPlacementAttempt;
  onTracerSelectRef.current = onTracerSelect;
  onSimulationAdvancedRef.current = onSimulationAdvanced;
  followEnabledSourceRef.current = followEnabledRef;
  onFollowUnavailableRef.current = onFollowUnavailable;
  selectedTracerIdRef.current = selectedTracerId;
  workbenchModeRef.current = workbenchMode;
  pauseVisualizationRef.current = pauseVisualization;
  highlightModeRef.current = highlightMode;
  highlightOperandRef.current = highlightOperand;
  depthCueEnabledRef.current = depthCueEnabled;
  eulerianAirflowSamplesRef.current = eulerianAirflowSamples;
  visualAirflowFieldRef.current = visualAirflowField;

  useEffect(() => {
    resetPendingRef.current = true;
  }, [resetEpoch]);

  useImperativeHandle(sceneHandleRef ?? localSceneHandleRef, () => ({
    addTracerSlot() {
      sceneRef.current?.addTracerSlot();
    },
    clearTracerSlots() {
      sceneRef.current?.clearTracerSlots();
    },
    syncReleasePreview(pendingSeed: TracerSeedPosition | null) {
      sceneRef.current?.syncReleasePreview(pendingSeed);
    },
    resetView() {
      sceneRef.current?.resetView();
    },
    get tracerSlotCount() {
      return sceneRef.current?.tracerSlotCount ?? 0;
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const scene = new TracerScene(canvas, simulation.particles.length, {
      trails: pathHistory !== null,
      keepInactiveGlyphs,
    });
    sceneRef.current = scene;
    const workbenchScene =
      visualAirflowPopulation === null || eulerianAirflowSamples === null
        ? null
        : new VisualAirflowWorkbenchScene(
            visualAirflowPopulation.occupantCount,
            eulerianAirflowSamples.sampleCount,
          );
    if (workbenchScene !== null) {
      scene.attachVisualAirflow(workbenchScene.object);
    }
    let accumulator = 0;
    let visualAccumulator = 0;
    let frameId = 0;
    let previousMs = performance.now();
    let disposed = false;
    let pointerDown: { x: number; y: number; pointerId: number } | null =
      null;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) {
        return;
      }
      const rect = parent.getBoundingClientRect();
      scene.setSize(rect.width, rect.height);
    };

    const sync = () => {
      scene.syncFromParticles(simulation.particles);
      if (pathHistory) {
        scene.syncFromPathHistory(pathHistory);
      }
      if (workbenchScene !== null && visualAirflowPopulation !== null) {
        const field = visualAirflowFieldRef.current;
        const eulerian = eulerianAirflowSamplesRef.current;
        if (field !== null && eulerian !== null) {
          workbenchScene.sync({
            mode: workbenchModeRef.current,
            population: visualAirflowPopulation,
            eulerian,
            field,
            time: simulation.clock.time,
            highlightMode: highlightModeRef.current,
            highlightOperand: highlightOperandRef.current,
          });
        }
      }
      scene.setDepthCueEnabled(depthCueEnabledRef.current);
      scene.syncReleasePreview(pendingPreviewRef.current);
      scene.syncSelectedSlot(
        occupancyIndexForTracerId(
          simulation.particles,
          selectedTracerIdRef.current,
        ),
      );
      const follow = viewportFollowSync({
        followEnabled: followEnabledSourceRef.current?.current === true,
        particles: simulation.particles,
        selectedTracerId: selectedTracerIdRef.current,
      });
      if (follow.kind === "set") {
        scene.setFollowPoint(follow.position);
      } else {
        scene.clearFollowPoint();
        if (follow.kind === "unavailable") {
          onFollowUnavailableRef.current?.();
        }
      }
    };

    resize();
    sync();
    scene.render();

    const onResize = () => {
      resize();
      scene.render();
    };
    window.addEventListener("resize", onResize);
    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            onResize();
          })
        : null;
    if (resizeObserver !== null && canvas.parentElement !== null) {
      resizeObserver.observe(canvas.parentElement);
    }

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) {
        return;
      }
      pointerDown = {
        x: event.clientX,
        y: event.clientY,
        pointerId: event.pointerId,
      };
    };

    const onPointerUp = (event: PointerEvent) => {
      const down = pointerDown;
      pointerDown = null;
      if (
        down === null ||
        event.button !== 0 ||
        event.pointerId !== down.pointerId
      ) {
        return;
      }
      const movement = Math.hypot(
        event.clientX - down.x,
        event.clientY - down.y,
      );
      const rect = canvas.getBoundingClientRect();
      const ndc = pointerNdcFromClientRect(
        event.clientX,
        event.clientY,
        rect,
      );
      if (ndc === null) {
        return;
      }
      const ray = scene.worldRayFromNdc(ndc.x, ndc.y);
      const hitSlotIndex = scene.pickVisibleTracerAtClientPoint(
        event.clientX,
        event.clientY,
        rect,
      );
      const decision = resolveTracerPointerUp({
        pointerMovementPx: movement,
        hitSlotIndex,
        placementAvailable: onPlacementAttemptRef.current !== undefined,
        ray,
      });
      if (decision.action === "select") {
        const tracerId = tracerIdForSlot(
          simulation.particles,
          decision.slotIndex,
        );
        if (tracerId !== undefined) {
          onTracerSelectRef.current?.(tracerId);
        }
        return;
      }
      if (decision.action === "placement") {
        onPlacementAttemptRef.current?.(
          decision.origin,
          decision.direction,
          decision.pointerMovementPx,
        );
      }
    };

    const onPointerCancel = (event: PointerEvent) => {
      if (pointerDown !== null && event.pointerId === pointerDown.pointerId) {
        pointerDown = null;
      }
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerCancel);

    const tick = (nowMs: number) => {
      if (disposed) {
        return;
      }

      if (resetPendingRef.current) {
        resetPendingRef.current = false;
        accumulator = 0;
        visualAccumulator = 0;
        previousMs = nowMs;
      }

      const pausedNow = pausedRef.current;
      if (wasPausedRef.current && !pausedNow) {
        // Extra no-catch-up safety on resume transition
        previousMs = nowMs;
        visualAccumulator = 0;
      }
      wasPausedRef.current = pausedNow;

      const wallFrameDt = (nowMs - previousMs) / 1000;
      previousMs = nowMs;

      const simulationElapsed = simulationElapsedFromWall(wallFrameDt, {
        paused: pausedNow,
        timeScale: timeScaleRef.current,
      });

      const consumed = consumeFixedTimesteps(
        accumulator,
        simulationElapsed,
        timestep,
      );
      accumulator = consumed.accumulator;
      for (let i = 0; i < consumed.steps; i++) {
        advanceLaboratoryFixedStep(simulation, timestep, {
          pathHistory,
          visualAirflowPopulation,
        });
      }
      if (consumed.steps > 0) {
        onSimulationAdvancedRef.current?.();
      } else if (
        pausedNow &&
        pauseVisualizationRef.current === "frozen-field-animation" &&
        visualAirflowPopulation !== null
      ) {
        const visualElapsed = visualAirflowElapsedFromWall(wallFrameDt);
        const visualConsumed = consumeFixedTimesteps(
          visualAccumulator,
          visualElapsed,
          timestep,
        );
        visualAccumulator = visualConsumed.accumulator;
        const frozenTime = simulation.clock.time;
        for (let i = 0; i < visualConsumed.steps; i++) {
          stepVisualAirflowOnFrozenField(
            visualAirflowPopulation,
            timestep,
            frozenTime,
          );
        }
      }

      sync();
      scene.render();
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
      resizeObserver?.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerCancel);
      sceneRef.current = null;
      scene.detachVisualAirflow();
      workbenchScene?.dispose();
      scene.dispose();
    };
  }, [
    simulation,
    timestep,
    pathHistory,
    keepInactiveGlyphs,
    visualAirflowPopulation,
  ]);

  return (
    <div className="tracer-viewport">
      <canvas ref={canvasRef} className="tracer-viewport__canvas" />
    </div>
  );
}
