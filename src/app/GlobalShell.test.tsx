/** @vitest-environment happy-dom */
import { act, useRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GlobalHeader } from "./GlobalHeader.js";
import { GlobalFooter } from "./GlobalFooter.js";
import { WhatsNewSurface } from "./WhatsNewSurface.js";
import type { OpenResource } from "./shellResources.js";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement, root: Root;
beforeEach(() => { host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(() => { act(() => root.unmount()); host.remove(); });
const button = (label: string, parent: ParentNode = host) => [...parent.querySelectorAll("button")].find(b => b.textContent?.trim() === label)!;
const click = (element: HTMLElement) => act(() => element.click());
const key = (element: HTMLElement, value: string, shiftKey = false) => act(() => element.dispatchEvent(new KeyboardEvent("keydown", { key: value, shiftKey, bubbles: true, cancelable: true })));

describe("shared shell behavior", () => {
  it("keeps current navigation a no-op and sends logo departures through the page", () => {
    const home = vi.fn(), learn = vi.fn(), explore = vi.fn();
    act(() => root.render(<GlobalHeader section="learn" onHome={home} onLearn={learn} onExplore={explore} onOpenResource={() => {}} />));
    click(button("Learn")); expect(learn).not.toHaveBeenCalled();
    expect(button("Learn").getAttribute("aria-current")).toBe("page");
    click(button("Explore")); expect(explore).toHaveBeenCalledOnce();
    const logo = host.querySelector<HTMLAnchorElement>('a[aria-label="Supercell Explorer — Home"]')!;
    expect(logo.getAttribute("href")).toBe("/"); click(logo); expect(home).toHaveBeenCalledOnce();
  });

  it("dismisses Resources with Escape, keyboard departure and outside click without cancelling a canvas pointer", () => {
    act(() => root.render(<><GlobalHeader section="home" onHome={() => {}} onLearn={() => {}} onExplore={() => {}} onOpenResource={() => {}} /><canvas tabIndex={0} /></>));
    const trigger = button("Resources ▾"); click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    const first = button("User Guide"); first.focus(); key(first, "Escape");
    expect(trigger.getAttribute("aria-expanded")).toBe("false"); expect(document.activeElement).toBe(trigger);
    click(trigger); act(() => host.querySelector("canvas")!.focus());
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    click(trigger);
    const pointer = new PointerEvent("pointerdown", { bubbles: true, cancelable: true });
    host.querySelector("canvas")!.dispatchEvent(pointer); expect(pointer.defaultPrevented).toBe(false);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    click(host.querySelector("canvas")!); expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("retains a visible mobile trigger, traps dialog focus and returns to the header or footer opener", () => {
    function Harness() {
      const [open, setOpen] = useState(false);
      const trigger = useRef<HTMLButtonElement>(null);
      const openResource: OpenResource = (_resource, element) => { trigger.current = element; setOpen(true); };
      return <><GlobalHeader section="home" onHome={() => {}} onLearn={() => {}} onExplore={() => {}} onOpenResource={openResource} />
        <GlobalFooter onOpenResource={openResource} /><WhatsNewSurface open={open} onClose={() => setOpen(false)} returnFocusRef={trigger} /></>;
    }
    act(() => root.render(<Harness />));
    click(button("Menu")); click(button("Resources ▾")); click(button("User Guide"));
    const close = button("Close"), resourceTrigger = button("Resources ▾");
    expect(document.activeElement).toBe(close);
    expect(host.querySelector(".global-header__navigation")?.getAttribute("data-open")).toBe("true");
    act(() => button("Menu").focus()); expect(document.activeElement).toBe(close);
    const dialog = host.querySelector('[role="dialog"]')!;
    const items = [...dialog.querySelectorAll<HTMLElement>('button, a[href]')];
    act(() => items.at(-1)!.focus()); key(items.at(-1)!, "Tab"); expect(document.activeElement).toBe(close);
    key(close, "Tab", true); expect(document.activeElement).toBe(items.at(-1));
    key(close, "Escape"); expect(document.activeElement).toBe(resourceTrigger);
    const footerOpener = button("Glossary", host.querySelector("footer")!); click(footerOpener);
    click(button("Close")); expect(document.activeElement).toBe(footerOpener);
    click(button("Resources ▾")); click(button("User Guide", host.querySelector("header")!));
    host.querySelector<HTMLElement>(".global-header__navigation")!.style.display = "none";
    click(button("Close")); expect(document.activeElement).toBe(button("Menu"));
    expect(host.querySelectorAll("footer")).toHaveLength(1);
    expect(host.textContent).toContain("Not a weather forecasting system");
    expect(host.querySelector('a[href="https://iryna.online"]')).not.toBeNull();
  });
});
