/** @vitest-environment happy-dom */
import { act, createRef, StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { LearnFollowMotion } from "./LearnFollowMotion.js";
import { createLearnSession } from "./createLearnSession.js";
import { TracerViewport } from "../../ui/tracer/TracerViewport.js";
import { LearnPage } from "./LearnPage.js";
import type { LearnDepartureHandle } from "./LearnLessonNavigation.js";

const state = vi.hoisted(() => ({
  scenes: [] as Array<Record<string, any>>, sessions: [] as any[], failInit: false,
}));
vi.mock("./createLearnSession.js", async original => {
  const actual = await original<typeof import("./createLearnSession.js")>();
  return { ...actual, createLearnSession: (...args: Parameters<typeof actual.createLearnSession>) => {
    const lab = actual.createLearnSession(...args); state.sessions.push(lab); return lab;
  } };
});
vi.mock("../../rendering/TracerScene.js", () => ({ TracerScene: class {
  hoveredSlotIndex = null;
  constructor(_canvas: HTMLCanvasElement, public count: number, public options: unknown) { state.scenes.push(this); }
  setSize = vi.fn(() => { if (state.failInit) throw new Error("init failed"); });
  render = vi.fn(); dispose = vi.fn(); resetView = vi.fn();
  syncFromParticles = vi.fn(); syncFromPathHistory = vi.fn();
  syncAnalysisTiltingOverlays = vi.fn(); syncAnalysisTiltingGlyph = vi.fn();
  syncAnalysisTiltingWhatIfGlyph = vi.fn(); setDepthCueEnabled = vi.fn();
  setCoordinateReferenceVisible = vi.fn(); syncReleasePreview = vi.fn();
  syncSelectedSlot = vi.fn(); syncHistoricalPathProbe = vi.fn(); clearFollowPoint = vi.fn();
  syncVelocityArrow = vi.fn();
  syncComparisonVelocityArrows = vi.fn(); setComparisonPlacementMode = vi.fn();
} }));
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement, root: Root, now: number, serial: number;
let frames: Map<number, FrameRequestCallback>;
let observers: Array<{ callback: ResizeObserverCallback; disconnect: ReturnType<typeof vi.fn> }>;
const landing = vi.fn(), explore = vi.fn(), around = vi.fn();
function mount(strict = false) {
  const departure = createRef<LearnDepartureHandle>();
  const page = <>
    <button onClick={() => departure.current?.requestLeave("Landing", landing)}>Back to Landing</button>
    <button onClick={() => departure.current?.requestLeave("Explore", explore)}>Explore</button>
    <LearnFollowMotion departureRef={departure} lessonActions={<button onClick={() => departure.current?.requestLeave("Look Around", around)}>Back: Look Around</button>} />
  </>;
  act(() => root.render(strict ? <StrictMode>{page}</StrictMode> : page));
}
function lab(): ReturnType<typeof createLearnSession> { return state.sessions[0]; }
function click(label: string) {
  const button = [...host.querySelectorAll("button")].find(b => (b.getAttribute("aria-label") ?? b.textContent) === label);
  expect(button, label).toBeDefined();
  expect(button!.tabIndex).toBe(0); expect(button!.disabled).toBe(false);
  act(() => { button!.focus(); button!.click(); });
}
function frame(ms = 250) {
  now += ms;
  const pending = [...frames.values()]; frames.clear();
  act(() => pending.forEach(callback => callback(now)));
}
function selectRecorded(index: number) {
  const slider = host.querySelector<HTMLInputElement>('#read-motion-timeline')!;
  act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(slider, String(index));
    slider.dispatchEvent(new Event("input", { bubbles: true }));
  });
  frame();
}
beforeEach(() => {
  vi.clearAllMocks(); state.sessions.length = 0; state.scenes.length = 0; state.failInit = false;
  now = 0; serial = 0; frames = new Map(); observers = [];
  vi.spyOn(performance, "now").mockImplementation(() => now);
  vi.spyOn(document, "hidden", "get").mockReturnValue(false);
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { frames.set(++serial, callback); return serial; });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
  vi.stubGlobal("ResizeObserver", class {
    disconnect = vi.fn(); observe = vi.fn();
    constructor(public callback: ResizeObserverCallback) { observers.push(this); }
  });
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
});
afterEach(() => { act(() => root.unmount()); host.remove(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it.each([
  ["Follow Motion", "Back: Look Around", "Look Around"],
  ["Follow Motion", "Next: Read the Motion", "Read the Motion"],
  ["Read the Motion", "Back: Follow Motion", "Follow Motion"],
  ["Read the Motion", "Next: Compare the Flow", "Compare the Flow"],
] as const)("routes %s via %s through one guard and preserves cancellation", (source, action, target) => {
  act(() => root.render(<LearnPage onReturnToLanding={landing} onEnterExplore={explore} />));
  click(source); const session = lab(), scene = state.scenes.at(-1)!;
  click(source === "Follow Motion" ? "Start" : "Start observation"); frame(); frame();
  if (source === "Read the Motion") {
    for (let i = 0; i < 60; i++) frame();
    selectRecorded(0); click("Save for comparison");
    expect(host.querySelector('.learn__step-navigation')?.closest('.read-motion__inspector')).not.toBeNull();
  }
  expect(host.querySelector('h1')?.textContent).toBe(source); // No advance on completion.
  const history = session.pathHistory.samplesFor(0);
  const reference = host.querySelector('[aria-label="Saved reference moment"]')?.textContent;
  const time = session.simulation.clock.time;
  expect(host.querySelectorAll('.learn__step-navigation')).toHaveLength(1);
  click(action); expect(host.querySelectorAll('dialog[open]')).toHaveLength(1);
  expect(scene.dispose).not.toHaveBeenCalled();
  click("Stay here");
  expect(document.activeElement?.textContent).toBe(action);
  expect(session.simulation.clock.time).toBe(time);
  expect(session.pathHistory.samplesFor(0)).toEqual(history);
  expect(host.querySelector('[aria-label="Saved reference moment"]')?.textContent).toBe(reference);
  click(action); click(`Leave for ${target}`);
  expect(host.querySelector('dialog[open]')).toBeNull();
  expect(host.querySelector('h1')?.textContent).toBe(target);
  expect(scene.dispose).toHaveBeenCalledOnce(); expect(frames.size).toBe(1);
  click(source); // New destination is still unstarted; return through existing tab path.
  expect(host.querySelector('[aria-label="Saved reference moment"]')).toBeNull();
  expect(state.sessions.at(-1)!.simulation.clock.time).toBe(0);
});
it("shares lesson navigation, guards recorded paths, and mounts a fresh paused session on return", () => {
  act(() => root.render(<LearnPage onReturnToLanding={landing} onEnterExplore={explore} />));
  const nav = host.querySelector('nav[aria-label="Learn lessons"]')!;
  expect([...nav.querySelectorAll("button")].map(button => button.textContent)).toEqual(["01Look Around", "02Follow Motion", "03Read the Motion", "04Compare the Flow"]);
  expect(nav.querySelector('[aria-current="page"]')?.getAttribute("aria-label")).toBe("Look Around");
  expect(nav.querySelector('[aria-label="Read the Motion"]')?.hasAttribute("disabled")).toBe(false);
  click("Look Around"); expect(state.scenes).toHaveLength(1);
  click("Follow Motion");
  expect(host.querySelectorAll('nav[aria-label="Learn lessons"]')).toHaveLength(1);
  expect(host.querySelectorAll("main")).toHaveLength(1);
  expect(nav.querySelector('[aria-current="page"]')?.getAttribute("aria-label")).toBe("Follow Motion");
  expect(state.scenes[0]!.dispose).toHaveBeenCalledOnce();
  const session = lab(), scene = state.scenes[1]!;
  click("Start"); frame(); frame();
  const samples = session.pathHistory.samplesFor(0);
  click("Follow Motion"); expect(host.querySelector("dialog")).toBeNull();
  expect(state.sessions).toHaveLength(1);
  click("Look Around"); frame();
  expect(host.querySelector("dialog")?.open).toBe(true);
  expect(session.pathHistory.samplesFor(0)).toEqual(samples);
  click("Stay here");
  expect(document.activeElement?.getAttribute("aria-label")).toBe("Look Around");
  expect(scene.dispose).not.toHaveBeenCalled();
  click("Look Around");
  const pending = [...frames.values()];
  click("Leave for Look Around");
  expect(scene.dispose).toHaveBeenCalledOnce();
  expect(observers[1]!.disconnect).toHaveBeenCalledOnce();
  expect(frames.size).toBe(1);
  expect(document.activeElement).toBe(host.querySelector("h1"));
  act(() => pending.forEach(callback => callback(now + 1000)));
  expect(session.pathHistory.samplesFor(0)).toEqual(samples);
  click("Follow Motion");
  const fresh = state.sessions[1]!;
  expect(fresh).not.toBe(session);
  expect(fresh.simulation.clock.time).toBe(0);
  expect(fresh.pathHistory.sampleCountFor(0)).toBe(1);
  frame(); frame(); expect(fresh.stepBudget.completedSteps).toBe(0);
  expect(host.textContent).toContain("Start");
  click("Look Around"); expect(host.querySelector("dialog")).toBeNull();
  expect(state.scenes.at(-1)!.count).toBe(0);
});

it("starts paused, stops exactly at 1200 fixed steps, retains paths, and replays cleanly", () => {
  mount(); const session = lab(); const step = vi.spyOn(session.simulation, "step");
  expect(host.textContent).toContain("A passive tracer is a virtual object that moves with the model airflow. Its colored marker shows where it is.");
  const guide = host.querySelector('[aria-label="Follow Motion scene guide"]');
  expect(guide).not.toBeNull(); expect(guide!.closest("details")).toBeNull();
  frame(); frame();
  expect(step).not.toHaveBeenCalled(); expect(host.textContent).not.toContain("What this shows");
  expect(host.textContent).toContain("What do you think will happen?");
  expect(host.textContent).toContain("Will they follow the same path or different paths?");
  expect(host.textContent).not.toContain("Model note:");
  expect(host.querySelectorAll(".learn__height-caption")).toHaveLength(1);
  expect(host.querySelector("details")?.open).toBe(false);
  expect(host.querySelector("summary")?.textContent).toBe("Details");
  expect(host.textContent).not.toContain("Same height. Different paths.");
  expect(host.querySelector(".learn__scene")?.firstElementChild?.classList.contains("learn__viewport")).toBe(true);
  expect(host.querySelector(".tracer-viewport__hud")).toBeNull();
  expect(state.scenes[0]!.options).toMatchObject({ trails: true, keepInactiveGlyphs: true, distanceLabelsVisible: false });
  click("Start"); frame(); frame();
  expect(host.textContent).toContain("Watch how the paths develop.");
  expect(host.textContent).not.toContain("What do you think will happen?");
  expect(step.mock.calls.length).toBeGreaterThanOrEqual(24);
  expect(step.mock.calls.length).toBeLessThanOrEqual(25);
  click("Pause"); const time = session.simulation.clock.time; frame(60000);
  expect(host.textContent).toContain("Watch how the paths develop.");
  expect(host.textContent).not.toContain("Before pressing Start");
  expect(session.simulation.clock.time).toBe(time);
  click("Resume"); frame(60000); expect(session.simulation.clock.time).toBe(time);
  frame(); const beforeReset = step.mock.calls.length;
  expect(beforeReset).toBeGreaterThanOrEqual(49); expect(beforeReset).toBeLessThanOrEqual(50);
  click("Reset View"); expect(state.scenes[0]!.resetView).toHaveBeenCalledOnce();
  expect(step).toHaveBeenCalledTimes(beforeReset);
  for (let i = 0; i < 60; i++) frame();
  expect(step).toHaveBeenCalledTimes(1200);
  expect(step.mock.calls.every(([dt]) => dt === 0.1)).toBe(true);
  expect(session.stepBudget.completedSteps).toBe(1200);
  expect(host.textContent).toContain("What this shows");
  expect(host.textContent).not.toContain("Two markers, one airflow.");
  expect(host.textContent).not.toContain("Watch how the paths develop.");
  expect(host.querySelector(".learn__model-note")?.textContent).toBe("Model note: Tracer motion is calculated from the prescribed model velocity field. These passive tracers do not affect the airflow or represent individual real air parcels.");
  expect(host.querySelector(".learn__model-note")?.closest("details")).toBeNull();
  expect(host.textContent).toContain("Same height. Different paths.");
  expect(host.textContent).toContain("The model airflow varies from place to place. Following the tracers makes those differences visible.");
  expect(host.textContent).toContain("Model time: 120.0 s");
  expect(host.querySelector('[aria-label="Follow Motion scene guide"]')).toBe(guide);
  const history = [session.pathHistory.samplesFor(0), session.pathHistory.samplesFor(1)];
  expect(history.map(lane => lane.length)).toEqual([1201, 1201]);
  frame(60000); expect(step).toHaveBeenCalledTimes(1200);
  expect([session.pathHistory.samplesFor(0), session.pathHistory.samplesFor(1)]).toEqual(history);
  const ids = session.simulation.particles.map(p => p.tracerId);
  for (let i = 0; i < 2; i++) {
    click("Replay"); frame(); expect(session.simulation.clock.time).toBe(0);
    expect(session.simulation.particles.map(p => p.tracerId)).toEqual(ids);
    expect(session.pathHistory.tracerCount).toBe(2); expect(session.pathHistory.sampleCountFor(0)).toBe(1);
    expect(host.textContent).not.toContain("What this shows");
    expect(host.textContent).not.toContain("Model note:");
    expect(host.textContent).toContain("Two passive tracers, one model airflow.");
    expect(host.textContent).toContain("What do you think will happen?");
    click("Start"); frame(); frame();
  }
  expect(state.scenes).toHaveLength(1);
});

it("opens the shared model guide without discarding playback and restores focus", () => {
  act(() => root.render(<LearnPage onReturnToLanding={landing} onEnterExplore={explore} />));
  expect(host.querySelector("footer h2")?.textContent).toBe("About this model");
  expect(host.querySelector("footer")?.textContent).toContain("prescribed velocity field");
  click("Follow Motion"); click("Start"); frame(); frame();
  const session = lab(), before = session.pathHistory.samplesFor(0);
  click("How It Works"); frame(); frame();
  expect(host.querySelector('[role="dialog"]')?.textContent).toContain("How It Works");
  expect(session.pathHistory.samplesFor(0)).toEqual(before);
  click("Close");
  expect(document.activeElement?.getAttribute("aria-label")).toBe("How It Works");
  frame(); frame();
  expect(state.sessions).toHaveLength(1);
  expect(session.pathHistory.sampleCountFor(0)).toBeGreaterThan(before.length);
});

it("opens Read the Motion directly, observes current velocity, pauses, finishes and replays", () => {
  act(() => root.render(<LearnPage onReturnToLanding={landing} onEnterExplore={explore} />));
  click("Read the Motion");
  const session = lab(), scene = state.scenes[1]!;
  expect(session.simulation.particles).toHaveLength(1);
  expect(host.textContent).toContain("Where is the airflow going — and how fast?");
  expect(host.textContent).toContain("The arrow shows local airflow velocity at the tracer’s position: its direction and speed.");
  const guide = host.querySelector('[aria-label="Read the Motion scene guide"]');
  expect(guide).not.toBeNull(); expect(guide!.closest("details")).toBeNull();
  expect(host.textContent).toContain("Screen lengths cannot be compared directly across lessons; perspective and zoom also affect apparent length.");
  expect([...host.querySelectorAll('.learn__phases li')].map(item => item.textContent)).toEqual([
    "Watch — Watch the marker and its velocity arrow during a short flight.",
    "Investigate — After the flight, explore recorded moments and compare velocities.",
  ]);
  expect(host.textContent).toContain("The flight takes about 12 seconds. Once it finishes, the timeline and measurements become available. You can pause and resume at any time.");
  expect(host.querySelector('input[type="range"]')).toBeNull();
  frame(); frame(); expect(session.stepBudget.completedSteps).toBe(0);
  const initial = scene.syncVelocityArrow.mock.lastCall[0];
  expect(initial.velocity).toEqual(session.velocityObservation.total.sample(initial.position, 0));
  click("Start observation"); frame(); frame();
  expect(host.textContent).toContain("Recording the path · Phase 1 of 2");
  expect(host.textContent).toContain("Watch how the arrow changes. After the flight, use the timeline to inspect and compare the recorded motion.");
  expect(host.querySelector('.learn__phases')).toBeNull();
  const current = scene.syncVelocityArrow.mock.lastCall[0];
  expect(current.position).toEqual(session.simulation.particles[0]!.position);
  expect(current.velocity).toEqual(session.velocityObservation.total.sample(current.position, session.simulation.clock.time));
  click("Pause");
  expect(host.textContent).toContain("Recording the path · Phase 1 of 2");
  const history = session.pathHistory.samplesFor(0);
  frame(60000); expect(session.pathHistory.samplesFor(0)).toEqual(history);
  expect(scene.syncVelocityArrow.mock.lastCall[0]).toEqual(current);
  click("Resume"); frame(); frame();
  expect(session.pathHistory.sampleCountFor(0)).toBeGreaterThan(history.length);
  for (let i = 0; i < 60; i++) frame();
  expect(session.stepBudget.completedSteps).toBe(1200);
  expect(session.pathHistory.sampleCountFor(0)).toBe(1201);
  expect(host.textContent).toContain("The marker encountered different velocities along its path.");
  expect(host.textContent).toContain("Investigate the path · Phase 2 of 2");
  expect(host.querySelector('[aria-label="Read the Motion scene guide"]')).toBe(guide);
  expect(host.querySelector('[aria-label="Selected recorded moment"] h3')?.textContent).toBe("Selected moment");
  expect(host.textContent).toContain("Save the selected moment to keep its measurements as a reference while you inspect another moment.");
  expect(host.textContent).not.toContain("Recording the path · Phase 1 of 2");
  const final = scene.syncVelocityArrow.mock.lastCall[0];
  expect(final.velocity).toEqual(session.velocityObservation.total.sample(final.position, session.simulation.clock.time));
  frame(60000); expect(scene.syncVelocityArrow.mock.lastCall[0]).toEqual(final);
  click("Replay"); frame(); frame();
  const fresh = state.sessions.at(-1)!;
  expect(fresh).not.toBe(session);
  expect(fresh.simulation.clock.time).toBe(0);
  expect(fresh.pathHistory.sampleCountFor(0)).toBe(1);
  expect(state.scenes.at(-1)!.syncVelocityArrow.mock.lastCall[0]).toEqual(initial);
  expect(scene.dispose).toHaveBeenCalledOnce();
  expect(host.textContent).toContain("Start observation");
  expect(host.querySelectorAll('.learn__phases li')).toHaveLength(2);
  expect(host.textContent).not.toContain("Phase 2 of 2");
  expect(state.scenes).toHaveLength(3);
});

it("guards Slice 3 departures and disposes on lesson switch, StrictMode and unmount", () => {
  act(() => root.render(<StrictMode><LearnPage onReturnToLanding={landing} onEnterExplore={explore} /></StrictMode>));
  click("Read the Motion"); click("Start observation"); frame(); frame();
  const session = state.sessions.at(-1)!;
  const scene = state.scenes.at(-1)!;
  const before = session.pathHistory.samplesFor(0);
  click("Follow Motion"); frame(); expect(host.querySelector("dialog")?.open).toBe(true);
  click("Stay here"); expect(session.pathHistory.samplesFor(0)).toEqual(before);
  click("Home"); act(() => host.querySelector("dialog")!.dispatchEvent(new Event("cancel", { cancelable: true })));
  expect(landing).not.toHaveBeenCalled();
  click("Follow Motion"); const pending = [...frames.values()]; click("Leave for Follow Motion");
  expect(scene.dispose).toHaveBeenCalledOnce();
  act(() => pending.forEach(callback => callback(now + 1000)));
  expect(session.pathHistory.samplesFor(0)).toEqual(before);
  expect(state.sessions.at(-1)!.simulation.particles).toHaveLength(2);
  click("Read the Motion");
  expect(state.sessions.at(-1)!.simulation.clock.time).toBe(0);
  act(() => root.render(null));
  expect(state.scenes.every(scene => scene.dispose.mock.calls.length === 1)).toBe(true);
  expect(observers.every(observer => observer.disconnect.mock.calls.length === 1)).toBe(true);
  expect(frames.size).toBe(0);
});

it.each([false, true])("cleans Slice 3 context/init failure and replays with one fresh path (init=%s)", init => {
  act(() => root.render(<LearnPage onReturnToLanding={landing} onEnterExplore={explore} />));
  state.failInit = init; click("Read the Motion");
  const scene = state.scenes[1]!;
  if (!init) {
    click("Start observation"); frame(); frame();
    act(() => host.querySelector("canvas")!.dispatchEvent(new Event("webglcontextlost", { cancelable: true })));
  }
  expect(host.querySelector('[role="alert"]')).not.toBeNull();
  expect(scene.dispose).toHaveBeenCalledOnce(); expect(frames.size).toBe(0);
  state.failInit = false; click("Replay"); frame();
  expect(host.querySelector('[role="alert"]')).toBeNull();
  const fresh = state.sessions.at(-1)!;
  expect(fresh.pathHistory.tracerCount).toBe(1); expect(fresh.pathHistory.sampleCountFor(0)).toBe(1);
  expect(fresh.simulation.clock.time).toBe(0);
});

it("scrubs actual recorded states and compares measured moments without reintegration", () => {
  act(() => root.render(<LearnPage onReturnToLanding={landing} onEnterExplore={explore} />));
  click("Read the Motion"); click("Start observation");
  for (let i = 0; i < 65; i++) frame();
  const session = lab(), scene = state.scenes.at(-1)!;
  expect(session.pathHistory.sampleCountFor(0)).toBe(1201);
  expect(host.textContent).toContain("Now investigate the path");
  const step = vi.spyOn(session.simulation, "step");
  const before = JSON.stringify({ time: session.simulation.clock.time, particles: session.simulation.particles, history: session.pathHistory.samplesFor(0) });
  for (const index of [0, 600, 1200]) {
    selectRecorded(index);
    const recorded = session.pathHistory.sampleAt(0, index);
    const arrow = scene.syncVelocityArrow.mock.lastCall[0];
    expect(arrow.position).toEqual(recorded.position);
    expect(arrow.velocity).toEqual(session.velocityObservation.total.sample(recorded.position, recorded.simulationTime));
    expect(scene.syncFromParticles.mock.lastCall[0][0].position).toEqual(recorded.position);
    expect(scene.syncFromPathHistory.mock.lastCall[0].sampleCountFor(0)).toBe(1201);
    expect(host.querySelector('[aria-label="Selected model time"]')?.textContent).toBe(`${recorded.simulationTime.toFixed(1)} s`);
  }
  selectRecorded(0); click("Save for comparison");
  const referenceText = host.querySelector('[aria-label="Saved reference moment"]')!.textContent;
  selectRecorded(600);
  expect(host.querySelector('[aria-label="Saved reference moment"]')!.textContent).toBe(referenceText);
  expect(host.querySelector('[aria-label="Selected recorded moment"]')!.textContent).toContain("60.0 s");
  const selectedArrow = scene.syncVelocityArrow.mock.lastCall[0];
  click("Reset View"); frame();
  expect(scene.syncVelocityArrow.mock.lastCall[0]).toEqual(selectedArrow);
  expect(host.querySelector<HTMLInputElement>('#read-motion-timeline')!.value).toBe("600");
  click("Save for comparison");
  expect(host.querySelector('[aria-label="Saved reference moment"]')!.textContent).toContain("60.0 s");
  click("Clear saved reference"); expect(host.querySelector('[aria-label="Saved reference moment"]')).toBeNull();
  expect(host.querySelector('.read-motion__components')?.hasAttribute("open")).toBe(false);
  expect(host.textContent).toContain("Same flow. Different velocities along the path.");
  expect(step).not.toHaveBeenCalled();
  expect(JSON.stringify({ time: session.simulation.clock.time, particles: session.simulation.particles, history: session.pathHistory.samplesFor(0) })).toBe(before);
  click("Save for comparison"); click("Replay"); frame();
  expect(host.querySelector('#read-motion-timeline')).toBeNull();
  expect(host.querySelector('[aria-label="Saved reference moment"]')).toBeNull();
  expect(state.sessions.at(-1)!.simulation.clock.time).toBe(0);
  expect(scene.dispose).toHaveBeenCalledOnce();
});

it("shows unavailable and hides the arrow when historical velocity cannot be sampled", () => {
  act(() => root.render(<LearnPage onReturnToLanding={landing} onEnterExplore={explore} />));
  click("Read the Motion"); click("Start observation");
  for (let i = 0; i < 65; i++) frame();
  const session = lab(), scene = state.scenes.at(-1)!;
  vi.spyOn(session.velocityObservation.total, "sample").mockImplementation(() => { throw new Error("unavailable"); });
  selectRecorded(300);
  expect(host.textContent).toContain("Velocity inspection unavailable");
  expect(host.querySelector('[aria-label="Selected recorded moment"]')!.textContent).toContain("Unavailable");
  expect(host.querySelector('[aria-label="Selected recorded moment"]')!.textContent).not.toContain("0.00 m/s");
  expect(scene.syncVelocityArrow.mock.lastCall[0]).toBeNull();
  expect(scene.syncFromParticles.mock.lastCall[0][0].position).toEqual(session.pathHistory.sampleAt(0, 300).position);
  expect([...host.querySelectorAll("button")].find(button => button.textContent === "Save for comparison")!.disabled).toBe(true);
  click("Reset View"); expect(host.querySelector('[role="alert"]')).toBeNull();
});

it("does not catch up from a hidden tab and preserves the session through resize", () => {
  mount(); click("Start"); frame(); frame(); const session = lab();
  const steps = session.stepBudget.completedSteps;
  vi.spyOn(document, "hidden", "get").mockReturnValue(true);
  act(() => document.dispatchEvent(new Event("visibilitychange"))); frame(60000);
  expect(session.stepBudget.completedSteps).toBe(steps);
  vi.spyOn(document, "hidden", "get").mockReturnValue(false);
  act(() => document.dispatchEvent(new Event("visibilitychange"))); frame();
  expect(session.stepBudget.completedSteps).toBe(steps);
  act(() => observers[0]!.callback([], {} as ResizeObserver));
  expect(state.scenes[0]!.setSize).toHaveBeenCalledTimes(2);
  expect(session.stepBudget.completedSteps).toBe(steps); frame();
  expect(session.stepBudget.completedSteps - steps).toBeGreaterThanOrEqual(24);
  expect(session.stepBudget.completedSteps - steps).toBeLessThanOrEqual(25);
});

it.each([["Back to Landing", "Landing", landing], ["Explore", "Explore", explore], ["Back: Look Around", "Look Around", around]] as const)(
  "guards %s after recording, pauses the modal and preserves cancelled state", (button, destination, action) => {
    mount(); click("Start"); frame(); frame(); const session = lab();
    const before = session.pathHistory.samplesFor(0);
    click(button); expect(host.querySelector("dialog")?.open).toBe(true); frame();
    expect(action).not.toHaveBeenCalled(); expect(session.pathHistory.samplesFor(0)).toEqual(before);
    click("Stay here"); frame(); expect(session.pathHistory.samplesFor(0)).toEqual(before);
    frame(); expect(session.pathHistory.sampleCountFor(0)).toBeGreaterThan(before.length);
    click(button); act(() => host.querySelector("dialog")!.dispatchEvent(new Event("cancel", { cancelable: true })));
    expect(host.querySelector("dialog")).toBeNull();
    click(button); click(`Leave for ${destination}`); expect(action).toHaveBeenCalledOnce();
  },
);

it("allows immediate navigation before any steps", () => { mount(); click("Back: Look Around"); expect(around).toHaveBeenCalledOnce(); });

it("cleans StrictMode effects and stale RAF callbacks on unmount", () => {
  mount(true); expect(state.scenes).toHaveLength(2); expect(state.scenes[0]!.dispose).toHaveBeenCalledOnce();
  expect(frames.size).toBe(1); click("Start"); frame(); frame();
  const pending = [...frames.values()]; const steps = lab().stepBudget.completedSteps;
  act(() => root.render(null)); expect(frames.size).toBe(0);
  expect(state.scenes[1]!.dispose).toHaveBeenCalledOnce();
  expect(observers.every(o => o.disconnect.mock.calls.length === 1)).toBe(true);
  act(() => pending.forEach(callback => callback(now + 1000)));
  expect(frames.size).toBe(0); expect(lab().stepBudget.completedSteps).toBe(steps);
});

it.each([false, true])("cleans context loss / initialization errors and allows Replay (init=%s)", init => {
  state.failInit = init; mount();
  if (!init) act(() => host.querySelector("canvas")!.dispatchEvent(new Event("webglcontextlost", { cancelable: true })));
  expect(host.querySelector('[role="alert"]')).not.toBeNull();
  expect(state.scenes[0]!.dispose).toHaveBeenCalledOnce(); expect(frames.size).toBe(0);
  state.failInit = false; click("Replay");
  expect(host.querySelector('[role="alert"]')).toBeNull(); expect(frames.size).toBe(1);
  expect(lab().simulation.clock.time).toBe(0); expect(lab().pathHistory.tracerCount).toBe(2);
});

it("preserves laboratory viewport defaults when Learn options are omitted", () => {
  const session = createLearnSession();
  act(() => root.render(<TracerViewport simulation={session.simulation} timestep={0.1} paused timeScale={1} resetEpoch={0} />));
  expect(host.querySelector(".tracer-viewport__hud")).not.toBeNull();
  expect(state.scenes[0]!.options).toEqual({ trails: false, keepInactiveGlyphs: false });
});
