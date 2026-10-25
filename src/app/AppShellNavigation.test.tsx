/** @vitest-environment happy-dom */
import { act, useEffect, useImperativeHandle } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { App } from "./App.js";
import type { TracerViewportProps } from "../ui/tracer/TracerViewport.js";

const state = vi.hoisted(() => ({ props: null as TracerViewportProps | null,
  mounted: vi.fn(), disposed: vi.fn(), resetView: vi.fn() }));
vi.mock("../ui/tracer/TracerViewport.js", () => ({ TracerViewport: (props: TracerViewportProps) => {
  state.props = props;
  useEffect(() => { state.mounted(); return () => { state.disposed(); }; }, [props.simulation]);
  useImperativeHandle(props.sceneHandleRef, () => ({ addTracerSlot() {}, removeLastTracerSlot() {},
    clearTracerSlots() {}, syncReleasePreview() {}, resetView: state.resetView, focusPoint() {}, tracerSlotCount: 0 }), []);
  return <canvas aria-label="Test laboratory canvas" />;
} }));
vi.mock("../rendering/TracerScene.js", () => ({ TracerScene: class {
  setSize() {} render() {} resetView() {} dispose() {}
} }));
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement, root: Root;
const button = (name: string, parent: ParentNode = host) => [...parent.querySelectorAll("button")].find(b => (b.getAttribute("aria-label") ?? b.textContent) === name)!;
const click = (element: HTMLElement) => act(() => { element.focus(); element.click(); });
beforeEach(() => {
  vi.clearAllMocks(); state.props = null;
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  vi.stubGlobal("requestAnimationFrame", () => 1); vi.stubGlobal("cancelAnimationFrame", () => {});
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
});
afterEach(() => { act(() => root.unmount()); host.remove(); vi.unstubAllGlobals(); });

it("integrates compact Explore chrome without remounting or resetting its laboratory", () => {
  act(() => root.render(<App />)); expect(state.mounted).not.toHaveBeenCalled();
  click(button("Explore"));
  const simulation = state.props!.simulation, resetEpoch = state.props!.resetEpoch;
  expect(state.mounted).toHaveBeenCalledOnce();
  expect(host.querySelectorAll('footer.global-footer--compact')).toHaveLength(1);
  expect(host.querySelector('main h1')?.textContent).toBe("Explore");
  const localHeader = host.querySelector('.app__header')!;
  expect(localHeader.textContent).toContain("Hodograph");
  expect(localHeader.textContent).not.toContain("User Guide");
  click(button("Explore")); click(button("Resources ▾"));
  expect(state.props!.simulation).toBe(simulation); expect(state.props!.resetEpoch).toBe(resetEpoch);
  click(button("How It Works", host.querySelector('.global-header')!));
  expect(state.props!.paused).toBe(true); expect(state.props!.simulation).toBe(simulation);
  click(button("Close")); expect(document.activeElement?.textContent).toBe("Resources ▾");
  expect(state.props!.paused).toBe(false);
  click(button("Reset camera to storm view")); expect(state.resetView).toHaveBeenCalledOnce();
  expect(state.props!.simulation).toBe(simulation); expect(state.props!.resetEpoch).toBe(resetEpoch);
  expect(state.mounted).toHaveBeenCalledOnce(); expect(state.disposed).not.toHaveBeenCalled();
  const footer = host.querySelector('footer')!;
  expect(footer.querySelector('nav')).toBeNull();
  expect(footer.textContent).toContain("Supercell Explorer · V1.1");
  expect(footer.textContent).toContain("Research prototype");
  expect(footer.querySelector('a[href="https://iryna.online"]')).toBeNull();
  const attribution = footer.querySelector('details')!;
  click(attribution.querySelector('summary')!);
  expect(attribution.open).toBe(true);
  expect(attribution.textContent).toContain("10.5065/D6CC0Z0Q");
  expect(state.props!.simulation).toBe(simulation); expect(state.mounted).toHaveBeenCalledOnce();
  for (const label of ["User Guide", "Glossary", "What's New · V1.1"]) {
    click(button("Resources ▾"));
    const opener = button(label, host.querySelector('.global-header')!); click(opener);
    expect(host.querySelectorAll('[role="dialog"]')).toHaveLength(1);
    click(button("Close")); expect(document.activeElement?.textContent).toBe("Resources ▾");
    expect(state.props!.simulation).toBe(simulation);
  }
  click(button("Learn")); expect(state.disposed).toHaveBeenCalledOnce();
  expect(host.querySelector('main h1')?.textContent).toBe("Look Around");
  expect(host.querySelectorAll('footer.global-footer--full')).toHaveLength(1);
  click(host.querySelector<HTMLAnchorElement>('.global-header__brand')!);
  expect(host.querySelector('.app--landing')).not.toBeNull();
  click(button("Explore")); expect(state.props!.simulation).not.toBe(simulation);
  expect(state.mounted).toHaveBeenCalledTimes(2);
});
