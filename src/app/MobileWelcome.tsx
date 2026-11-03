import { useEffect, useRef } from "react";
import "./mobileWelcome.css";

const DISMISSED_KEY = "supercell-mobile-welcome-dismissed";

/** Entry-only advice; dismissal survives navigation and reloads in this tab. */
export function MobileWelcome() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 767px), (hover: none) and (pointer: coarse)").matches;
    if (!mobile) return;
    try {
      if (sessionStorage.getItem(DISMISSED_KEY) === "true") return;
    } catch {
      // Storage may be unavailable; the notice must still be dismissible.
    }
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => { dialog?.close(); };
  }, []);

  function dismiss() {
    try {
      sessionStorage.setItem(DISMISSED_KEY, "true");
    } catch {
      // Closing is independent of storage availability.
    }
    dialogRef.current?.close();
  }

  return (
    <dialog ref={dialogRef} className="mobile-welcome"
      aria-labelledby="mobile-welcome-title" aria-describedby="mobile-welcome-description"
      onCancel={event => { event.preventDefault(); dismiss(); }}>
      <button type="button" className="mobile-welcome__close" aria-label="Close desktop recommendation"
        onClick={dismiss}>×</button>
      <h2 id="mobile-welcome-title">Best explored on desktop</h2>
      <p id="mobile-welcome-description">
        We strongly recommend using a desktop or laptop for the most comfortable experience
        with Supercell Explorer’s interactive 3D views and controls. You can still continue on your mobile device.
      </p>
      <button type="button" className="mobile-welcome__continue" autoFocus onClick={dismiss}>
        Continue on mobile
      </button>
    </dialog>
  );
}
