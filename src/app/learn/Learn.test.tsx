/** @vitest-environment happy-dom */
import { act, StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../App.js";
import { LearnOrientationViewport } from "./LearnOrientationViewport.js";
import { DEFAULT_EXPLORE_ENVIRONMENT_IDENTITY } from "../../explore/exploreEnvironmentIdentity.js";

const spies = vi.hoisted(() => ({
  construct: vi.fn(), step: vi.fn(), explore: vi.fn(), scenes: [] as Array<{
    setSize: ReturnType<typeof vi.fn>; render: ReturnType<typeof vi.fn>;
    resetView: ReturnType<typeof vi.fn>; dispose: ReturnType<typeof vi.fn>;
  }>,
}));
vi.mock("../../simulation/Simulation.js", async importOriginal => {
  const actual = await importOriginal<typeof import("../../simulation/Simulation.js")>();
  return { ...actual, Simulation: class extends actual.Simulation {
    constructor(...args: ConstructorParameters<typeof actual.Simulation>) {
      super(...args); spies.construct();
    }
    override step(dt: number) { spies.step(); return super.step(dt); }
  } };
});
vi.mock("../createExploreLab.js", async importOriginal => {
  const actual = await importOriginal<typeof import("../createExploreLab.js")>();
  return { ...actual, createExploreLab: (...args: Parameters<typeof actual.createExploreLab>) => {
    spies.explore(...args); return actual.createExploreLab(...args);
  } };
});
vi.mock("../../ui/tracer/TracerViewport.js", () => ({ TracerViewport: () => <div>Laboratory viewport</div> }));
vi.mock("../../rendering/TracerScene.js", () => ({ TracerScene: class {
  setSize = vi.fn(); render = vi.fn(); resetView = vi.fn(); dispose = vi.fn();
  constructor(_canvas: HTMLCanvasElement, count: number, options: { distanceLabelsVisible?: boolean }) {
    expect(options.distanceLabelsVisible).toBe(false);
    expect(count).toBe(0); spies.scenes.push(this);
  }
} }));
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let host: HTMLDivElement;
let root: Root;
let frames: Map<number, FrameRequestCallback>;
let nextFrame: number;
let observers: Array<{ callback: ResizeObserverCallback; disconnect: ReturnType<typeof vi.fn> }>;
function button(label: string) {
  const found = [...host.querySelectorAll("button")].find(b => (b.getAttribute("aria-label") ?? b.textContent) === label);
  expect(found, label).toBeDefined();
  return found!;
}
function click(label: string) { act(() => button(label).click()); }

beforeEach(() => {
  vi.clearAllMocks(); spies.scenes.length = 0;
  frames = new Map(); nextFrame = 0; observers = [];
  vi.stubGlobal("requestAnimationFrame", vi.fn((callback: FrameRequestCallback) => {
    frames.set(++nextFrame, callback); return nextFrame;
  }));
  vi.stubGlobal("cancelAnimationFrame", vi.fn((id: number) => frames.delete(id)));
  vi.stubGlobal("ResizeObserver", class {
    disconnect = vi.fn(); observe = vi.fn();
    constructor(public callback: ResizeObserverCallback) { observers.push(this); }
  });
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
});
afterEach(() => { act(() => root.unmount()); host.remove(); vi.unstubAllGlobals(); });

describe("Learn Slice 1", () => {
  it("switches Look Around / Follow Motion with one mounted viewport", () => {
    act(() => root.render(<App />)); click("Learn");
    const orientation = spies.scenes[0]!;
    click("Follow Motion");
    expect(host.querySelector("h1")?.textContent).toBe("Follow Motion");
    expect(orientation.dispose).toHaveBeenCalledOnce(); expect(frames.size).toBe(0);
    expect(spies.construct).toHaveBeenCalledOnce(); expect(spies.step).not.toHaveBeenCalled();
    click("Back: Look Around");
    expect(host.querySelector("h1")?.textContent).toBe("Look Around");
    expect(host.textContent).not.toContain("Laboratory viewport");
    expect(spies.scenes).toHaveLength(2); expect(frames.size).toBe(1);
  });

  it("offers native equal CTAs, enters Learn without Simulation, and disposes on return", () => {
    act(() => root.render(<App />));
    for (const label of ["Learn", "Explore"]) {
      const cta = button(label);
      expect(cta.type).toBe("button"); expect(cta.disabled).toBe(false);
      expect(cta.tabIndex).toBe(0); expect(cta.className).toContain("ui-button--primary");
      cta.focus(); expect(document.activeElement).toBe(cta);
    }
    click("Learn");
    expect(host.querySelector("h1")?.textContent).toBe("Look Around");
    expect(document.activeElement).toBe(host.querySelector("h1"));
    expect(host.textContent).toContain("We’ll start two markers at different places and watch where they go. Will their journeys look alike?");
    expect(host.textContent).not.toContain("Do you think they'll follow the same path?");
    expect(host.textContent).toContain("We’ll use this 3D space to explore a prescribed model airflow.");
    expect(host.textContent).toContain("N/E/S/W mean north/east/south/west. The 0 marks the coordinate origin. Height increases upward.");
    expect(host.textContent).toContain("Its movement reveals where the air is going.");
    expect(host.querySelector(".learn__scene")?.firstElementChild?.classList.contains("learn__viewport")).toBe(true);
    expect([...host.querySelectorAll("button")].map(b => b.getAttribute("aria-label") ?? b.textContent)).toEqual(["Home", "Explore", "Look Around", "Follow Motion", "Read the Motion", "Compare the Flow", "Next: Follow Motion", "Reset View", "How It Works"]);
    const scene = spies.scenes[0]!;
    const [id, callback] = [...frames][0]!;
    frames.delete(id); act(() => callback(16));
    expect(scene.render).toHaveBeenCalledTimes(2);
    expect(spies.construct).not.toHaveBeenCalled(); expect(spies.step).not.toHaveBeenCalled();
    click("Reset View"); expect(scene.resetView).toHaveBeenCalledOnce();
    click("Home");
    expect(host.querySelector(".app--landing")).not.toBeNull();
    expect(scene.dispose).toHaveBeenCalledOnce(); expect(observers[0]!.disconnect).toHaveBeenCalledOnce();
    expect(frames.size).toBe(0);
    act(() => callback(32)); expect(frames.size).toBe(0);
    click("Learn"); expect(spies.scenes).toHaveLength(2);
    expect(spies.construct).not.toHaveBeenCalled();
  });

  it.each([false, true])("preserves Goshen Explore entry (via Learn: %s)", viaLearn => {
    act(() => root.render(<App />));
    if (viaLearn) click("Learn");
    click("Explore");
    expect(spies.explore).toHaveBeenCalledOnce();
    expect(spies.explore.mock.calls[0]![1]).toBe(DEFAULT_EXPLORE_ENVIRONMENT_IDENTITY);
    expect(DEFAULT_EXPLORE_ENVIRONMENT_IDENTITY).toContain("goshen");
    expect(spies.construct).toHaveBeenCalledOnce();
    expect(host.textContent).toContain("Laboratory viewport");
    expect(frames.size).toBe(0);
    if (viaLearn) expect(spies.scenes[0]!.dispose).toHaveBeenCalledOnce();
  });

  it("cleans StrictMode remounts, resizes, and releases resources on unmount", () => {
    act(() => root.render(<StrictMode><LearnOrientationViewport /></StrictMode>));
    expect(spies.scenes).toHaveLength(2);
    expect(spies.scenes[0]!.dispose).toHaveBeenCalledOnce();
    expect(frames.size).toBe(1);
    const active = spies.scenes[1]!;
    const container = host.querySelector(".learn__canvas-host")!;
    vi.spyOn(container, "getBoundingClientRect").mockReturnValue({ width: 640, height: 400 } as DOMRect);
    act(() => observers[1]!.callback([], {} as ResizeObserver));
    expect(active.setSize).toHaveBeenLastCalledWith(640, 400);
    act(() => root.render(null));
    expect(active.dispose).toHaveBeenCalledOnce();
    expect(observers.every(o => o.disconnect.mock.calls.length === 1)).toBe(true);
    expect(frames.size).toBe(0);
  });

  it("cleans a successfully constructed scene if later initialization fails", () => {
    vi.stubGlobal("ResizeObserver", class { constructor() { throw new Error("unavailable"); } });
    act(() => root.render(<LearnOrientationViewport />));
    expect(host.querySelector('[role="status"]')?.textContent).toContain("unavailable");
    expect(host.querySelector("button")).toBeNull();
    expect(spies.scenes[0]!.dispose).toHaveBeenCalledOnce();
    expect(frames.size).toBe(0);
  });
});
