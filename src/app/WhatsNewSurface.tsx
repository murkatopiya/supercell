import { useEffect, useRef, type RefObject } from "react";
import { RELEASE_HISTORY } from "./releaseHistory.js";

export interface WhatsNewSurfaceProps {
  open: boolean;
  onClose: () => void;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
}

export function WhatsNewSurface({ open, onClose, returnFocusRef }: WhatsNewSurfaceProps) {
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      onCloseRef.current();
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      returnFocusRef.current?.focus();
    };
  }, [open, returnFocusRef]);

  if (!open) return null;
  return (
    <div className="how-it-works" onClick={() => onCloseRef.current()}>
      <div role="dialog" aria-modal="true" aria-labelledby="whats-new-title"
        className="how-it-works__dialog whats-new__dialog"
        onClick={event => event.stopPropagation()} onPointerDown={event => event.stopPropagation()}>
        <header className="how-it-works__header">
          <h2 id="whats-new-title" className="how-it-works__title">What's new</h2>
          <button ref={closeRef} type="button" className="ui-button ui-button--subtle" onClick={onClose}>Close</button>
        </header>
        <div className="how-it-works__body">
          {RELEASE_HISTORY.map(release => (
            <section key={release.version} className="how-it-works__section whats-new__entry" aria-label={`${release.version} ${release.status}`}>
              <h3>{release.version} · {release.title}</h3>
              {release.date && <p><time dateTime={release.date}>{release.date}</time></p>}
              <ul>{release.changes.map(change => <li key={change}>{change}</li>)}</ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
