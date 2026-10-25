/** @vitest-environment happy-dom */
import { act, createRef, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createRoot } from "react-dom/client";
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { LandingPage } from "./LandingPage.js";
import { WhatsNewAffordance } from "./WhatsNewAffordance.js";
import { WhatsNewSurface } from "./WhatsNewSurface.js";
import { LATEST_PUBLISHED_RELEASE, PUBLISHED_RELEASES, RELEASE_HISTORY } from "./releaseHistory.js";
import { PUBLIC_VERSION } from "./publicVersion.js";
import appSrc from "./App.tsx?raw";
const cssSrc = readFileSync("src/app/app.css", "utf8");
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe("What's new", () => {
  it("opens from a navigation affordance and closes back to its trigger", () => {
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    function Harness() {
      const [open, setOpen] = useState(false);
      const trigger = useRef<HTMLButtonElement | null>(null);
      return <><WhatsNewAffordance expanded={open} onOpen={button => {
        trigger.current = button;
        setOpen(true);
      }} /><WhatsNewSurface open={open} onClose={() => setOpen(false)} returnFocusRef={trigger} /></>;
    }
    try {
      act(() => root.render(<Harness />));
      const trigger = host.querySelector<HTMLButtonElement>('button[aria-haspopup="dialog"]')!;
      act(() => trigger.click());
      expect(host.querySelector('[role="dialog"]')).not.toBeNull();
      expect(trigger.getAttribute("aria-expanded")).toBe("true");
      act(() => host.querySelector<HTMLButtonElement>('[role="dialog"] button')!.click());
      expect(host.querySelector('[role="dialog"]')).toBeNull();
      expect(document.activeElement).toBe(trigger);
    } finally {
      act(() => root.unmount());
      host.remove();
    }
  });
  it("records published V1.1 and its confirmed date without inventing a V1 date", () => {
    expect(RELEASE_HISTORY.map(release => [release.version, release.status])).toEqual([
      ["V1.1", "published"], ["V1", "published"],
    ]);
    expect(PUBLISHED_RELEASES.map(release => release.version)).toEqual(["V1.1", "V1"]);
    expect(LATEST_PUBLISHED_RELEASE.version).toBe(PUBLIC_VERSION);
    expect(LATEST_PUBLISHED_RELEASE.version).toBe("V1.1");
    expect(LATEST_PUBLISHED_RELEASE.date).toBe("2026-09-16");
    expect(RELEASE_HISTORY[1]!.date).toBeUndefined();
    expect(PUBLISHED_RELEASES.flatMap(release => release.changes).join(" ")).not.toMatch(/A\/B|P2|F01|visible SRH/i);
    expect(RELEASE_HISTORY[0]!.changes[0]).toMatch(/prescribed storm-motion vector C/);
    expect(RELEASE_HISTORY[0]!.changes[0]).toMatch(/not a measured motion/);
    expect(RELEASE_HISTORY[0]!.changes).toHaveLength(1);
    expect(RELEASE_HISTORY[0]!.changes.join(" ")).not.toMatch(/Open What's new/);
    expect(RELEASE_HISTORY.flatMap(release => release.changes).join(" ")).not.toMatch(/A\/B|P2|F01|visible SRH/i);
  });

  it("offers the current published version on landing and in the laboratory", () => {
    const affordance = renderToStaticMarkup(<WhatsNewAffordance expanded={false} onOpen={() => {}} />);
    expect(affordance).toContain("What&#x27;s new · V1.1");
    expect(affordance).toContain('aria-haspopup="dialog"');
    const landing = renderToStaticMarkup(<LandingPage onEnterLearn={() => {}} onEnterExplore={() => {}}
      onOpenUserGuide={() => {}} onOpenHowItWorks={() => {}} onOpenGlossary={() => {}}
      onOpenWhatsNew={() => {}} />);
    expect(landing).toContain("What&#x27;s New · V1.1");
    expect(landing).not.toContain("v0.1");
    expect(appSrc).toMatch(/<WhatsNewAffordance expanded=\{whatsNewOpen\} onOpen=\{openWhatsNew\}/);
    expect(appSrc).toMatch(/<WhatsNewSurface open=\{whatsNewOpen\}/);
    expect(appSrc).toMatch(/onOpenWhatsNew=\{openWhatsNew\}/);
  });

  it("renders published V1.1 with its date before V1 in a responsive dialog", () => {
    const html = renderToStaticMarkup(<WhatsNewSurface open onClose={() => {}}
      returnFocusRef={createRef<HTMLButtonElement>()} />);
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html.indexOf("V1.1 · Interactive storm motion")).toBeLessThan(html.indexOf("V1 · Research prototype"));
    expect(html).not.toContain("Unreleased");
    expect(html).not.toContain("Prepared for release");
    expect(html).toContain('aria-label="V1.1 published"');
    expect(html).toContain('<time dateTime="2026-09-16">2026-09-16</time>');
    expect(html.match(/<time /g)).toHaveLength(1);
    expect(html).toContain("Close");
    expect(cssSrc).toMatch(/\.whats-new__dialog\s*\{\s*width: min\(38rem, 100%\)/);
    expect(cssSrc).toMatch(/\.how-it-works__body\s*\{\s*overflow: auto/);
  });
});
