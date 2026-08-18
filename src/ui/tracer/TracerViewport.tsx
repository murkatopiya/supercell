import { useEffect, useImperativeHandle, useRef, type Ref } from "react";
import { TracerScene } from "../../rendering/TracerScene.js";
import { consumeFixedTimesteps } from "../../simulation/consumeFixedTimesteps.js";
import type { TracerPathHistory } from "../../simulation/TracerPathHistory.js";
import { simulationElapsedFromWall } from "../../simulation/simulationElapsedFromWall.js";
import type { Simulation } from "../../simulation/Simulation.js";
import type { TracerSeedPosition } from "../../simulation/createTracersFromSeeds.js";
import type { Vec3 } from "../../core/math/Vec3.js";
import type { TracerTimeScale } from "./TracerRuntimeControls.js";
import { pointerNdcFromClientRect } from "./pointerNdcFromClientRect.js";
import {
  occupancyIndexForTracerId,
  resolveTracerPointerUp,
  tracerIdForSlot,
} from "./resolveTracerPointerUp.js";

export interface TracerViewportHandle {
  addTracerSlot(): void;
  clearTracerSlots(): void;
  syncReleasePreview(pendingSeed: TracerSeedPosition | null): void;
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
   * Glyph pick → stable tracerId. Guided has this without placement.
   */
  onTracerSelect?: (tracerId: number) => void;
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
  onTracerSelect,
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
  const selectedTracerIdRef = useRef<number | null>(selectedTracerId);
  const localSceneHandleRef = useRef<TracerViewportHandle | null>(null);

  pausedRef.current = paused;
  timeScaleRef.current = timeScale;
  pendingPreviewRef.current = pendingReleasePreview;
  onPlacementAttemptRef.current = onPlacementAttempt;
  onTracerSelectRef.current = onTracerSelect;
  selectedTracerIdRef.current = selectedTracerId;

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
    let accumulator = 0;
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
      scene.syncReleasePreview(pendingPreviewRef.current);
      scene.syncSelectedSlot(
        occupancyIndexForTracerId(
          simulation.particles,
          selectedTracerIdRef.current,
        ),
      );
    };

    resize();
    sync();
    scene.render();

    const onResize = () => {
      resize();
      scene.render();
    };
    window.addEventListener("resize", onResize);

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
      const ndc = pointerNdcFromClientRect(
        event.clientX,
        event.clientY,
        canvas.getBoundingClientRect(),
      );
      if (ndc === null) {
        return;
      }
      const ray = scene.worldRayFromNdc(ndc.x, ndc.y);
      const hitSlotIndex =
        ray === null ? null : scene.pickVisibleTracer(ray);
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
        previousMs = nowMs;
      }

      const pausedNow = pausedRef.current;
      if (wasPausedRef.current && !pausedNow) {
        // Extra no-catch-up safety on resume transition
        previousMs = nowMs;
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
        simulation.step(timestep);
        pathHistory?.recordAfterStep(simulation.particles);
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
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerCancel);
      sceneRef.current = null;
      scene.dispose();
    };
  }, [simulation, timestep, pathHistory, keepInactiveGlyphs]);

  return (
    <div className="tracer-viewport">
      <canvas ref={canvasRef} className="tracer-viewport__canvas" />
    </div>
  );
}
