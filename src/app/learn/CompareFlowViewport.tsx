import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { TracerScene } from "../../rendering/TracerScene.js";
import type { CompareFlowSession, CompareFlowProbeSnapshot } from "./createCompareFlowSession.js";
import { compareFlowView } from "./compareFlowView.js";
import { COMPARE_FLOW_AREA, CompareFlowGesture, intersectCompareFlowPlane, type PlacementResult } from "./CompareFlowPlacement.js";
import { pointerNdcFromClientRect } from "../../ui/tracer/pointerNdcFromClientRect.js";
import { CompareFlowLegend } from "./CompareFlowLegend.js";

/** Owns rendering only; measurements belong to the parent even if WebGL fails. */
export function CompareFlowViewport({ session, snapshot, placing, onPlacement, onAvailability, onEndPlacement, measurements, pausedForHelp = false }: {
  measurements?: ReactNode;
  session: CompareFlowSession; snapshot: CompareFlowProbeSnapshot; placing: boolean;
  onPlacement: (result: PlacementResult) => void;
  onAvailability: (available: boolean) => void;
  onEndPlacement: (returnFocus: boolean) => void;
  pausedForHelp?: boolean;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<TracerScene | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const gesture = useRef(new CompareFlowGesture());
  const latest = useRef({ snapshot, placing, pausedForHelp, onPlacement, onAvailability, onEndPlacement });
  useLayoutEffect(() => {
    latest.current = { snapshot, placing, pausedForHelp, onPlacement, onAvailability, onEndPlacement };
    gesture.current.cancel();
    const scene = sceneRef.current;
    if (!scene) return;
    scene.syncFromParticles([session.a, snapshot.measurement].map(({ position }) => ({ position, age: 0, active: true })));
    scene.syncComparisonVelocityArrows({ a: session.arrows.a, b: snapshot.arrow });
    scene.setComparisonPlacementMode(placing && !pausedForHelp);
  }, [session, snapshot, placing, pausedForHelp, onPlacement, onAvailability, onEndPlacement]);

  useEffect(() => {
    let scene: TracerScene | undefined;
    let observer: ResizeObserver | undefined;
    let frame: number | undefined;
    let disposed = false;
    const element = canvas.current!;
    const pointers = new Set<number>();
    const cancel = () => gesture.current.cancel();
    const globalDown = (event: PointerEvent) => { pointers.add(event.pointerId); if (pointers.size > 1) cancel(); };
    const globalUp = (event: PointerEvent) => {
      pointers.delete(event.pointerId);
      if (event.target !== element) cancel();
    };
    const blur = () => { pointers.clear(); cancel(); };
    const down = (event: PointerEvent) => {
      if (disposed || !latest.current.placing || latest.current.pausedForHelp || pointers.size !== 1) { cancel(); return; }
      gesture.current.begin(event.pointerId, event.clientX, event.clientY, event.isPrimary, event.button);
    };
    const move = (event: PointerEvent) => gesture.current.move(event.pointerId, event.clientX, event.clientY);
    const up = (event: PointerEvent) => {
      if (disposed || !latest.current.placing || latest.current.pausedForHelp || !gesture.current.end(event.pointerId, event.clientX, event.clientY)) return;
      const rect = element.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) return;
      const ndc = pointerNdcFromClientRect(event.clientX, event.clientY, rect);
      latest.current.onPlacement(intersectCompareFlowPlane(ndc ? scene!.worldRayFromNdc(ndc.x, ndc.y) : null));
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && latest.current.placing && !latest.current.pausedForHelp) {
        cancel(); latest.current.onEndPlacement(true);
      }
    };
    const cleanup = () => {
      if (disposed) return;
      disposed = true;
      cancel(); pointers.clear();
      if (frame !== undefined) cancelAnimationFrame(frame);
      observer?.disconnect();
      element.removeEventListener("webglcontextlost", lost);
      element.removeEventListener("pointerdown", down); element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerup", up); element.removeEventListener("pointerleave", cancel);
      element.removeEventListener("pointercancel", cancel);
      window.removeEventListener("pointerdown", globalDown, true); window.removeEventListener("pointerup", globalUp, true);
      window.removeEventListener("pointercancel", globalUp, true);
      window.removeEventListener("scroll", cancel, true); window.removeEventListener("wheel", cancel, true);
      window.removeEventListener("blur", blur); window.removeEventListener("keydown", escape);
      sceneRef.current = null;
      scene?.dispose(); // Sole owner of renderer, controls and scene resources.
      scene = undefined;
    };
    const fail = () => {
      cleanup(); setUnavailable(true); latest.current.onAvailability(false); latest.current.onEndPlacement(false);
    };
    const lost = (event: Event) => { event.preventDefault(); fail(); };
    try {
      scene = new TracerScene(element, 2, {
        viewPose: compareFlowView(session), distanceLabelsVisible: false,
        comparisonPlacementArea: COMPARE_FLOW_AREA,
        tracerAnnotations: [
          { label: "A", start: session.a.position, fixedProbe: true, showStartHeight: true },
          { label: "B", start: session.b.position, fixedProbe: true, showStartHeight: true, followProbeHeight: true },
        ],
      });
      sceneRef.current = scene;
      scene.syncFromParticles([session.a, latest.current.snapshot.measurement].map(({ position }) => ({ position, age: 0, active: true })));
      scene.syncComparisonVelocityArrows({ a: session.arrows.a, b: latest.current.snapshot.arrow });
      scene.setComparisonPlacementMode(latest.current.placing && !latest.current.pausedForHelp);
      element.addEventListener("webglcontextlost", lost);
      element.addEventListener("pointerdown", down); element.addEventListener("pointermove", move);
      element.addEventListener("pointerup", up); element.addEventListener("pointerleave", cancel);
      element.addEventListener("pointercancel", cancel);
      window.addEventListener("pointerdown", globalDown, true); window.addEventListener("pointerup", globalUp, true);
      window.addEventListener("pointercancel", globalUp, true);
      window.addEventListener("scroll", cancel, true); window.addEventListener("wheel", cancel, { capture: true, passive: true });
      window.addEventListener("blur", blur); window.addEventListener("keydown", escape);
      const resize = () => {
        if (disposed) return;
        cancel();
        try {
          const bounds = host.current!.getBoundingClientRect();
          scene!.setSize(bounds.width, bounds.height);
        } catch { fail(); }
      };
      observer = new ResizeObserver(resize);
      observer.observe(host.current!); resize();
      const render = () => {
        if (disposed) return;
        try { scene!.render(); frame = requestAnimationFrame(render); }
        catch { fail(); }
      };
      render();
      if (!disposed) latest.current.onAvailability(true);
    } catch { fail(); }
    return cleanup;
  }, [session, attempt]);

  return <section className="learn__scene" aria-label="Static velocity comparison">
    <div ref={host} className="learn__viewport learn__canvas-host" inert={pausedForHelp}>
      <canvas key={attempt} ref={canvas} aria-label="Stationary probes A and B with local 3D velocity arrows. B can be repositioned in Place B. Both are 1000 metres above model ground." />
      {unavailable && <p role="status" className="learn__unavailable">The 3D view is unavailable. You can still compare the measurements below.</p>}
    </div>
    <div className="learn__scene-toolbar">
      <span>Stationary measurements · Model time: 0 s</span>
      {unavailable ? <button type="button" className="ui-button" onClick={() => { setUnavailable(false); setAttempt(n => n + 1); }}>Retry 3D view</button>
        : <button type="button" className="ui-button" onClick={() => { gesture.current.cancel(); sceneRef.current?.resetView(); }}>Reset View</button>}
    </div>
    {measurements}
    <p>{placing ? "Tap or click to place B. Dragging does not move the probe; you can scroll the page." : "Drag to look around; scroll to zoom. Reset View returns to the starting view."}</p>
    <p>The grid marks ground level in the model, not real terrain. Up is height.</p>
    <p>Arrow lengths use a fixed display scale within this lesson. Other lessons may use a different scale, and perspective changes apparent length. Do not compare screen lengths across lessons.</p>
    <CompareFlowLegend />
  </section>;
}
