import { useEffect, useId, useRef, useState } from "react";
import logoUrl from "./assets/supercell-explorer-logo-dark.png";
import { RESOURCE_ITEMS, type OpenResource } from "./shellResources.js";

export interface GlobalHeaderProps {
  section: "home" | "learn" | "explore";
  onHome: () => void;
  onExplore: () => void;
  onLearn: () => void;
  onOpenResource: OpenResource;
}

/** Presentation state stays here; sessions and guarded departures stay with the page. */
export function GlobalHeader({ section, onHome, onExplore, onLearn, onOpenResource }: GlobalHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const root = useRef<HTMLElement>(null);
  const resources = useRef<HTMLDivElement>(null);
  const resourceTrigger = useRef<HTMLButtonElement>(null);
  const menuTrigger = useRef<HTMLButtonElement>(null);
  const id = useId();

  useEffect(() => {
    if (!resourcesOpen && !mobileOpen) return;
    const outside = (event: MouseEvent) => {
      if ((event.target as Element)?.closest?.('[role="dialog"], .how-it-works')) return;
      if (event.composedPath().includes(root.current!)) {
        if (!resources.current?.contains(event.target as Node)) setResourcesOpen(false);
        return;
      }
      setResourcesOpen(false); setMobileOpen(false);
    };
    // Click only: dismissal never cancels or captures a canvas pointer gesture.
    document.addEventListener("click", outside);
    return () => document.removeEventListener("click", outside);
  }, [resourcesOpen, mobileOpen]);

  return <header className="global-header" ref={root} onKeyDown={event => {
    if (event.key !== "Escape") return;
    if (resourcesOpen) {
      event.preventDefault(); event.stopPropagation();
      setResourcesOpen(false); resourceTrigger.current?.focus();
    } else if (mobileOpen) {
      event.preventDefault(); event.stopPropagation();
      setMobileOpen(false); menuTrigger.current?.focus();
    }
  }}>
    <div className="global-header__inner">
      <a className="global-header__brand" href="/" aria-label="Supercell Explorer — Home"
        onClick={event => {
          if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
          event.preventDefault(); if (section !== "home") onHome();
        }}><img src={logoUrl} width={1461} height={553} alt="" /></a>
      <button ref={menuTrigger} type="button" className="global-header__menu shell-action"
        aria-expanded={mobileOpen} aria-controls={`${id}-navigation`}
        onClick={() => { setMobileOpen(!mobileOpen); setResourcesOpen(false); }}>Menu</button>
      <nav className="global-header__navigation" id={`${id}-navigation`} data-open={mobileOpen}
        aria-label="Primary navigation" onBlur={event => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setResourcesOpen(false);
          }
        }}>
        <button type="button" className="shell-action" aria-current={section === "explore" ? "page" : undefined}
          onClick={() => { if (section !== "explore") onExplore(); }}>Explore</button>
        <button type="button" className="shell-action" aria-current={section === "learn" ? "page" : undefined}
          onClick={() => { if (section !== "learn") onLearn(); }}>Learn</button>
        <div className="global-header__resources" ref={resources}>
          <button ref={resourceTrigger} type="button" className="shell-action" aria-expanded={resourcesOpen}
            aria-controls={`${id}-resources`} onClick={() => setResourcesOpen(!resourcesOpen)}>
            Resources <span aria-hidden="true">▾</span>
          </button>
          {resourcesOpen && <div id={`${id}-resources`} className="global-header__resource-list">
            {RESOURCE_ITEMS.map(item => <button key={item.id} type="button" className="shell-action"
              aria-haspopup="dialog" onClick={() => {
                setResourcesOpen(false);
                onOpenResource(item.id, resourceTrigger.current!);
              }}>{item.label}</button>)}
          </div>}
        </div>
      </nav>
    </div>
  </header>;
}
