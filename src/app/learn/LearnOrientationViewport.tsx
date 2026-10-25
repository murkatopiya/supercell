import { useEffect, useRef, useState } from "react";
import { TracerScene } from "../../rendering/TracerScene.js";
import { learnOrientationView } from "./learnOrientationView.js";

/** Camera rendering only: no Simulation, particles, history or fixed-step loop. */
export function LearnOrientationViewport() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<TracerScene | null>(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    let scene: TracerScene | undefined;
    let observer: ResizeObserver | undefined;
    let frame: number | undefined;
    let disposed = false;
    const cleanup = () => {
      disposed = true;
      if (frame !== undefined) cancelAnimationFrame(frame);
      observer?.disconnect();
      sceneRef.current = null;
      scene?.dispose(); // Includes OrbitControls, geometry, textures and renderer.
      scene = undefined;
    };
    try {
      scene = new TracerScene(canvas.current!, 0, {
        viewPose: learnOrientationView,
        distanceLabelsVisible: false,
      });
      sceneRef.current = scene;
      const resize = () => {
        if (disposed) return;
        const bounds = host.current!.getBoundingClientRect();
        scene!.setSize(bounds.width, bounds.height);
      };
      observer = new ResizeObserver(resize);
      observer.observe(host.current!);
      resize();
      const render = () => {
        if (disposed) return;
        scene!.render();
        frame = requestAnimationFrame(render);
      };
      render();
    } catch {
      cleanup();
      setUnavailable(true);
    }
    return cleanup;
  }, []);

  return (
    <section className="learn__scene" aria-label="Static orientation space">
      <div ref={host} className="learn__viewport learn__canvas-host">
        <canvas ref={canvas} aria-label="Static reference grid. Up is height; the grid marks ground level in the model." />
        {unavailable && <p role="status" className="learn__unavailable">The 3D view is unavailable in this browser. You can still read the introduction or open Explore.</p>}
      </div>
      <div className="learn__scene-toolbar">
        <span>3D space</span>
        {!unavailable && <button type="button" className="ui-button" onClick={() => sceneRef.current?.resetView()}>Reset View</button>}
      </div>
      <p>Drag to look around; scroll to zoom. Reset View returns to the starting view.</p>
      <p>The grid marks model ground, not real terrain. N/E/S/W mean north/east/south/west. The 0 marks the coordinate origin. Height increases upward.</p>
    </section>
  );
}
