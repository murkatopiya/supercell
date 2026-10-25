/** @vitest-environment happy-dom */
import { act, StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { LearnCompareFlow } from "./LearnCompareFlow.js";
import { LearnPage } from "./LearnPage.js";

const state = vi.hoisted(() => ({ fail: false, scenes: [] as Array<Record<string, any>>, sessions: [] as any[], samples: vi.fn() }));
vi.mock("../../simulation/Simulation.js", () => ({ Simulation: class { constructor() { throw new Error("No Simulation"); } } }));
vi.mock("../../rendering/TracerScene.js", () => ({ TracerScene: class {
  setSize = vi.fn(); render = vi.fn(); resetView = vi.fn(); dispose = vi.fn();
  syncFromParticles = vi.fn(); syncComparisonVelocityArrows = vi.fn();
  setComparisonPlacementMode = vi.fn();
  worldRayFromNdc = vi.fn(() => ({ origin: { x: 3000.125, y: 2000, z: -75.5 }, direction: { x: 0, y: -1, z: 0 } }));
  constructor() { if (state.fail) throw new Error("No WebGL"); state.scenes.push(this); }
} }));
vi.mock("./createCompareFlowSession.js", async original => {
  const actual = await original<typeof import("./createCompareFlowSession.js")>();
  return { ...actual, createCompareFlowSession: () => { state.samples(); const session = actual.createCompareFlowSession(); state.sessions.push(session); return session; } };
});
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement, root: Root, frames: Map<number, FrameRequestCallback>, serial: number;
let observers: Array<{ disconnect: ReturnType<typeof vi.fn>; callback: ResizeObserverCallback }>;
function click(label: string) {
  const button = [...host.querySelectorAll("button")].find(b => (b.getAttribute("aria-label") ?? b.textContent) === label)!;
  expect(button, label).toBeDefined(); act(() => { button.focus(); button.click(); });
}
beforeEach(() => {
  vi.clearAllMocks(); state.fail = false; state.scenes = []; state.sessions = []; frames = new Map(); serial = 0; observers = [];
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => { frames.set(++serial, cb); return serial; });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
  vi.stubGlobal("ResizeObserver", class {
    disconnect = vi.fn(); observe = vi.fn();
    constructor(public callback: ResizeObserverCallback) { observers.push(this); }
  });
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
});
it("keeps a labelled scene legend visible in Inspect and Place B without disclosures", () => {
  act(() => root.render(<LearnCompareFlow />));
  const legend = host.querySelector('[aria-label="Reading the scene"]')!;
  expect(legend.closest("details")).toBeNull();
  expect([...legend.querySelectorAll("dt")].map(e => e.textContent)).toEqual(["AProbe A", "BProbe B", "Velocity arrow", "Height guide", "Placement area"]);
  expect(legend.textContent).toContain("only when Move B is on");
  expect(legend.textContent).toContain("not the probe’s path");
  expect(legend.textContent).toContain("not a trajectory");
  expect(legend.querySelectorAll('svg[aria-hidden="true"]')).toHaveLength(5);
  expect(host.textContent).toContain("Stationary measurements · Model time: 0 s");
  expect(host.textContent).not.toContain("Fixed probes · 0 s");
  click("Move B"); expect(host.querySelector('[aria-label="Reading the scene"]')).toBe(legend);
});
afterEach(() => { act(() => root.unmount()); host.remove(); vi.unstubAllGlobals(); });

it("keeps snapshot-backed cards below the toolbar without rendering-driven samples", () => {
  act(() => root.render(<LearnCompareFlow />));
  const scene = state.scenes[0]!, session = state.sessions[0];
  const sample = vi.spyOn(session.velocityObservation.total, "sample");
  const group = host.querySelector('[aria-label="Probe measurements"]')!;
  const viewport = host.querySelector('.learn__scene')!;
  expect(host.querySelectorAll('[aria-label="Probe measurements"]')).toHaveLength(1);
  expect(group.parentElement).toBe(viewport);
  expect(viewport.querySelector('.learn__scene-toolbar')!.nextElementSibling).toBe(group);
  expect(host.querySelector('.compare-flow__copy')!.contains(group)).toBe(false);
  expect(host.querySelector('.learn__canvas-host')!.contains(group)).toBe(false);
  expect(group.compareDocumentPosition(viewport.querySelector('.compare-flow__legend')!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  const card = host.querySelector('[aria-label="Probe B"]')!;
  const details = card.querySelector('details')!;
  act(() => { details.open = true; root.render(<LearnCompareFlow />); });
  expect(sample).not.toHaveBeenCalled(); expect(state.scenes).toHaveLength(1); expect(frames.size).toBe(1);
  click("Move B east");
  expect(sample).toHaveBeenCalledTimes(1); expect(details.open).toBe(true);
  expect(host.querySelector('[aria-label="Probe B"]')).toBe(card);
  expect(scene.syncFromParticles.mock.lastCall[0][1].position.x).toBe(2500);
  expect(host.querySelector('[aria-label="Probe A"]')!.textContent).toContain("19.30 m/s");
});
it("reveals measurements only on entering Move B, without sampling, camera reset or focus changes", () => {
  const scroll = vi.spyOn(HTMLElement.prototype, "scrollIntoView").mockImplementation(() => {});
  try {
    act(() => root.render(<LearnCompareFlow />));
    const sample = vi.spyOn(state.sessions[0].velocityObservation.total, "sample");
    const scene = state.scenes[0]!;
    expect(scroll).not.toHaveBeenCalled();
    click("Move B");
    expect(scroll).toHaveBeenCalledExactlyOnceWith({ block: "end", behavior: "instant" });
    expect(scroll.mock.instances[0]).toBe(host.querySelector('[aria-label="Probe measurements"]'));
    expect(document.activeElement?.textContent).toBe("Done moving B");
    expect(sample).not.toHaveBeenCalled(); expect(scene.resetView).not.toHaveBeenCalled();
    click("Move B east"); act(() => root.render(<LearnCompareFlow />));
    expect(scroll).toHaveBeenCalledTimes(1); expect(sample).toHaveBeenCalledTimes(1);
    click("Done moving B"); click("Reset B"); expect(scroll).toHaveBeenCalledTimes(1);
    click("Move B"); expect(scroll).toHaveBeenCalledTimes(2);
    expect(state.scenes).toHaveLength(1); expect(frames.size).toBe(1);
  } finally { scroll.mockRestore(); }
});
it("shows real A/B and relative controls without WebGL, with placement unavailable", () => {
  state.fail = true; act(() => root.render(<LearnCompareFlow />));
  expect(host.textContent).toContain("19.30 m/s"); expect(host.textContent).toContain("+6.86 m/s");
  expect(host.textContent).toContain("21.13 m/s"); expect(host.textContent).toContain("+1.93 m/s");
  expect(host.textContent).toContain("3D view is unavailable");
  expect(host.querySelectorAll("summary")).toHaveLength(2);
  expect([...host.querySelectorAll("details")].every(details => !details.open)).toBe(true);
  expect([...host.querySelectorAll('.read-motion__primary dt')].map(e => e.textContent)).toEqual(["Speed", "Vertical velocity", "Speed", "Vertical velocity"]);
  expect(host.querySelector('input, dialog')).toBeNull();
  for (const text of ["Replay", "Start observation"]) expect(host.textContent).not.toContain(text);
  expect([...host.querySelectorAll("button")].find(b => b.textContent === "Move B")?.disabled).toBe(true);
  expect(document.activeElement).toBe(host.querySelector("h1"));
  const a = host.querySelector('[aria-label="Probe A"]')!.textContent;
  click("Move B east"); expect(host.querySelector('[aria-label="B coordinates"]')?.textContent).toContain("2500.00");
  expect(host.querySelector('[aria-label="Probe A"]')!.textContent).toBe(a);
  state.fail = false; click("Retry 3D view"); expect(state.samples).toHaveBeenCalledOnce();
  expect(frames.size).toBe(1); expect(host.querySelector('.learn__unavailable')).toBeNull();
});
it("keeps one loop and immutable samples through help, Reset View and rerender", () => {
  act(() => root.render(<LearnCompareFlow />)); const scene = state.scenes[0]!;
  const samples = host.querySelector('[aria-label="Probe measurements"]')!.textContent;
  click("Reset View"); expect(scene.resetView).toHaveBeenCalledOnce();
  act(() => root.render(<LearnCompareFlow pausedForHelp />));
  expect(host.querySelector('[inert]')).not.toBeNull();
  act(() => root.render(<LearnCompareFlow />));
  expect(state.samples).toHaveBeenCalledOnce(); expect(state.scenes).toHaveLength(1); expect(frames.size).toBe(1);
  expect(host.querySelector('[aria-label="Probe measurements"]')!.textContent).toBe(samples);
  expect(scene.syncComparisonVelocityArrows.mock.calls.every(([arrows]: any[]) => arrows === scene.syncComparisonVelocityArrows.mock.calls[0][0] || arrows.b === scene.syncComparisonVelocityArrows.mock.calls[0][0].b)).toBe(true);
});
it("cleans StrictMode, observers, context loss and stale callbacks without double dispose", () => {
  act(() => root.render(<StrictMode><LearnCompareFlow /></StrictMode>));
  expect(state.scenes[0]!.dispose).toHaveBeenCalledOnce(); expect(frames.size).toBe(1);
  const active = state.scenes[1]!, stale = [...frames.values()][0]!;
  act(() => host.querySelector("canvas")!.dispatchEvent(new Event("webglcontextlost", { cancelable: true })));
  expect(active.dispose).toHaveBeenCalledOnce(); expect(frames.size).toBe(0);
  const calls = active.render.mock.calls.length;
  act(() => stale(20)); expect(active.render).toHaveBeenCalledTimes(calls);
  act(() => root.render(null)); expect(active.dispose).toHaveBeenCalledOnce();
  expect(observers.every(o => o.disconnect.mock.calls.length === 1)).toBe(true);
});
it("unwinds an already owned scene when observer initialization fails", () => {
  vi.stubGlobal("ResizeObserver", class { constructor() { throw new Error("observer failed"); } });
  act(() => root.render(<LearnCompareFlow />));
  expect(state.scenes[0]!.dispose).toHaveBeenCalledOnce(); expect(frames.size).toBe(0);
  expect(host.textContent).toContain("19.30 m/s");
  act(() => root.render(null)); expect(state.scenes[0]!.dispose).toHaveBeenCalledOnce();
});
it("enters lesson independently, preserves same selection and cleans on exit/re-entry", () => {
  act(() => root.render(<LearnPage onReturnToLanding={vi.fn()} onEnterExplore={vi.fn()} />));
  click("Compare the Flow"); expect(host.querySelector('[aria-current="page"]')?.getAttribute("aria-label")).toBe("Compare the Flow");
  const scene = state.scenes.at(-1)!; click("Compare the Flow"); expect(scene.dispose).not.toHaveBeenCalled();
  click("Look Around"); expect(scene.dispose).toHaveBeenCalledOnce();
  click("Compare the Flow"); expect(host.textContent).toContain("19.30 m/s"); expect(state.samples).toHaveBeenCalledTimes(2);
});

function canvas() {
  const element = host.querySelector("canvas")!;
  vi.spyOn(element, "getBoundingClientRect").mockReturnValue({ left: 0, top: 0, right: 640, bottom: 400, width: 640, height: 400 } as DOMRect);
  return element;
}
function pointer(element: HTMLCanvasElement, type: string, x = 100, y = 100, id = 1, primary = true) {
  act(() => element.dispatchEvent(new PointerEvent(type, { bubbles: true, clientX: x, clientY: y, pointerId: id, button: 0, isPrimary: primary })));
}

it("publishes fractional pointer snapshots once, keeps A/field/scene and supports relative steps without rounding", () => {
  act(() => root.render(<LearnCompareFlow />)); const element = canvas(), scene = state.scenes[0]!;
  const a = host.querySelector('[aria-label="Probe A"]')!.textContent;
  const sample = vi.spyOn(state.sessions[0].velocityObservation.total, "sample");
  click("Move B"); expect(scene.setComparisonPlacementMode).toHaveBeenLastCalledWith(true);
  pointer(element, "pointerdown"); pointer(element, "pointerup");
  expect(host.querySelector('[aria-label="B coordinates"]')?.textContent).toContain("3000.13");
  expect(sample).toHaveBeenCalledExactlyOnceWith({ x: 3000.125, y: 1000, z: -75.5 }, 0);
  const arrow = scene.syncComparisonVelocityArrows.mock.lastCall[0].b;
  expect(arrow.position).toEqual({ x: 3000.125, y: 1000, z: -75.5 });
  expect(scene.syncFromParticles.mock.lastCall[0][1].position).toBe(arrow.position);
  click("Move B north"); expect(scene.syncComparisonVelocityArrows.mock.lastCall[0].b.position.z).toBe(-175.5);
  click("Move B east"); expect(scene.syncComparisonVelocityArrows.mock.lastCall[0].b.position.x).toBe(3100.125);
  expect(host.querySelector('[aria-label="Probe A"]')!.textContent).toBe(a);
  expect(state.samples).toHaveBeenCalledOnce(); expect(state.scenes).toHaveLength(1); expect(frames.size).toBe(1);
  click("Reset View"); expect(scene.resetView).toHaveBeenCalledOnce(); expect(sample).toHaveBeenCalledTimes(3);
  expect(scene.setComparisonPlacementMode).toHaveBeenLastCalledWith(true);
  click("Reset B"); expect(scene.syncComparisonVelocityArrows.mock.lastCall[0].b).toBe(state.sessions[0].arrows.b);
  expect(scene.resetView).toHaveBeenCalledOnce(); expect(sample).toHaveBeenCalledTimes(3);
  expect(scene.setComparisonPlacementMode).toHaveBeenLastCalledWith(false);
});

it.each(["drag", "scroll", "wheel", "cancel", "multitouch", "leave", "blur", "resize", "reset"])("cancels %s without placing or resurrecting an up/click", reason => {
  act(() => root.render(<LearnCompareFlow />)); const element = canvas(), scene = state.scenes[0]!;
  click("Move B"); pointer(element, "pointerdown");
  if (reason === "drag") { pointer(element, "pointermove", 106); pointer(element, "pointermove", 100); }
  if (reason === "scroll" || reason === "wheel") act(() => window.dispatchEvent(new Event(reason)));
  if (reason === "cancel") pointer(element, "pointercancel");
  if (reason === "multitouch") { pointer(element, "pointerdown", 100, 100, 2, false); pointer(element, "pointerup", 100, 100, 2, false); }
  if (reason === "leave") pointer(element, "pointerleave");
  if (reason === "blur") act(() => window.dispatchEvent(new Event("blur")));
  if (reason === "resize") act(() => observers[0]!.callback([], {} as ResizeObserver));
  if (reason === "reset") click("Reset View");
  pointer(element, "pointerup"); act(() => element.click());
  expect(scene.worldRayFromNdc).not.toHaveBeenCalled();
  expect(host.querySelector('[aria-label="B coordinates"]')?.textContent).toContain("2400.00");
});

it("rejects strict outside points, Escape and help cancel mode with measurements retained", () => {
  act(() => root.render(<LearnCompareFlow />)); const element = canvas(), scene = state.scenes[0]!;
  scene.worldRayFromNdc.mockReturnValue({ origin: { x: 5500 + 1e-9, y: 2000, z: 0 }, direction: { x: 0, y: -1, z: 0 } });
  click("Move B"); pointer(element, "pointerdown"); pointer(element, "pointerup");
  expect(host.querySelector('[role="status"]')?.textContent).toContain("inside the highlighted");
  expect(host.querySelector('[aria-label="B coordinates"]')?.textContent).toContain("2400.00");
  pointer(element, "pointerdown"); act(() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
  pointer(element, "pointerup"); expect(document.activeElement?.textContent).toBe("Move B");
  expect(scene.setComparisonPlacementMode).toHaveBeenLastCalledWith(false);
  click("Move B"); act(() => root.render(<LearnCompareFlow pausedForHelp />));
  expect(scene.setComparisonPlacementMode).toHaveBeenLastCalledWith(false); expect(host.querySelector('[inert]')).not.toBeNull();
  act(() => root.render(<LearnCompareFlow />)); expect(scene.setComparisonPlacementMode).toHaveBeenLastCalledWith(false);
});

it("keeps boundary buttons focused and guarded without repeated announcements or resampling", async () => {
  act(() => root.render(<LearnCompareFlow />));
  const sample = vi.spyOn(state.sessions[0].velocityObservation.total, "sample");
  for (let i = 0; i < 31; i++) click("Move B east");
  const button = document.activeElement!;
  expect(button.getAttribute("aria-disabled")).toBe("true"); expect(sample).toHaveBeenCalledTimes(31);
  const status = host.querySelector('[role="status"]')!;
  const notify = vi.fn(), observer = new MutationObserver(notify); observer.observe(status, { childList: true, characterData: true, subtree: true });
  click("Move B east"); click("Move B east"); await act(async () => {});
  expect(document.activeElement).toBe(button); expect(sample).toHaveBeenCalledTimes(31); expect(notify).not.toHaveBeenCalled();
  observer.disconnect(); click("Move B west"); expect(button.getAttribute("aria-disabled")).toBe("false");
});

it("retains atomic unavailable and zero measurements, and retries WebGL with the latest B", () => {
  act(() => root.render(<LearnCompareFlow />)); const scene = state.scenes[0]!;
  const sample = vi.spyOn(state.sessions[0].velocityObservation.total, "sample");
  sample.mockImplementation(() => { throw new Error("Missing measurement"); }); click("Move B east");
  expect(host.querySelector('[aria-label="Probe B"]')?.textContent).toContain("Unavailable");
  expect(scene.syncComparisonVelocityArrows.mock.lastCall[0].b).toBeNull();
  expect(scene.syncFromParticles.mock.lastCall[0][1].position.x).toBe(2500);
  expect(host.querySelector('[aria-label="Probe A"]')?.textContent).toContain("19.30");
  sample.mockReturnValue({ x: 3, y: 0, z: -4 }); click("Move B east");
  expect(host.querySelector('[aria-label="Probe B"]')?.textContent).toContain("5.00 m/s");
  sample.mockReturnValue({ x: 0, y: 0, z: 0 }); click("Move B east");
  expect(host.querySelector('[aria-label="Probe B"]')?.textContent).not.toContain("Unavailable");
  act(() => host.querySelector("canvas")!.dispatchEvent(new Event("webglcontextlost", { cancelable: true })));
  click("Move B east"); click("Retry 3D view");
  expect(state.scenes[1]!.syncFromParticles.mock.lastCall[0][1].position.x).toBe(2800);
  expect(scene.dispose).toHaveBeenCalledOnce(); expect(state.samples).toHaveBeenCalledOnce(); expect(frames.size).toBe(1);
});
