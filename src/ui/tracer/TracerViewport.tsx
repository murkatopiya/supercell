import { useEffect, useRef } from "react";
import { TracerScene } from "../../rendering/TracerScene.js";
import { consumeFixedTimesteps } from "../../simulation/consumeFixedTimesteps.js";
import { simulationElapsedFromWall } from "../../simulation/simulationElapsedFromWall.js";
import type { Simulation } from "../../simulation/Simulation.js";
import type { TracerTimeScale } from "./TracerRuntimeControls.js";

export interface TracerViewportProps {
  simulation: Simulation;
  timestep: number;
  paused: boolean;
  timeScale: TracerTimeScale;
  /** Bumped on Reset so the loop clears accumulator without recreating the scene. */
  resetEpoch: number;
}

/**
 * Thin React canvas host for TracerScene.
 * Owns mount/dispose, resize, and the rAF fixed-step loop.
 */
export function TracerViewport({
  simulation,
  timestep,
  paused,
  timeScale,
  resetEpoch,
}: TracerViewportProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(paused);
  const timeScaleRef = useRef(timeScale);
  const resetPendingRef = useRef(false);
  const wasPausedRef = useRef(paused);

  pausedRef.current = paused;
  timeScaleRef.current = timeScale;

  useEffect(() => {
    resetPendingRef.current = true;
  }, [resetEpoch]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const scene = new TracerScene(canvas, simulation.particles.length);
    let accumulator = 0;
    let frameId = 0;
    let previousMs = performance.now();
    let disposed = false;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) {
        return;
      }
      const rect = parent.getBoundingClientRect();
      scene.setSize(rect.width, rect.height);
    };

    resize();
    scene.syncFromParticles(simulation.particles);
    scene.render();

    const onResize = () => {
      resize();
      scene.render();
    };
    window.addEventListener("resize", onResize);

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
      }

      scene.syncFromParticles(simulation.particles);
      scene.render();
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
      scene.dispose();
    };
  }, [simulation, timestep]);

  return (
    <div className="tracer-viewport">
      <canvas ref={canvasRef} className="tracer-viewport__canvas" />
    </div>
  );
}
