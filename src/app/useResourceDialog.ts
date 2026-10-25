import { useEffect, useRef, type RefObject } from "react";

/** Shared focus ownership for existing resource dialogs, independent of page/session state. */
export function useResourceDialog(open: boolean, onClose: () => void,
  returnFocusRef: RefObject<HTMLButtonElement | null>, closeRef: RefObject<HTMLButtonElement | null>) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => {
    if (!open) return;
    const dialog = closeRef.current?.closest<HTMLElement>('[role="dialog"]');
    if (!dialog) return;
    const focusables = () => [...dialog.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex="0"]',
    )].filter(element => !element.closest('[hidden], [inert]'));
    closeRef.current?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault(); event.stopImmediatePropagation(); onCloseRef.current();
      } else if (event.key === "Tab") {
        const items = focusables();
        const first = items[0] ?? closeRef.current;
        const last = items[items.length - 1] ?? closeRef.current;
        if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
          event.preventDefault(); last?.focus();
        } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
          event.preventDefault(); first?.focus();
        }
      }
    };
    const focusin = (event: FocusEvent) => {
      if (!dialog.contains(event.target as Node)) closeRef.current?.focus();
    };
    window.addEventListener("keydown", keydown, true);
    document.addEventListener("focusin", focusin);
    return () => {
      window.removeEventListener("keydown", keydown, true);
      document.removeEventListener("focusin", focusin);
      const trigger = returnFocusRef.current;
      if (trigger?.isConnected) {
        const navigation = trigger.closest<HTMLElement>(".global-header__navigation");
        // A desktop-opened dialog may be closed after resizing to the collapsed mobile nav.
        if (navigation && getComputedStyle(navigation).display === "none") {
          navigation.closest("header")?.querySelector<HTMLButtonElement>(".global-header__menu")?.focus();
        } else trigger.focus();
      }
    };
  }, [open, returnFocusRef, closeRef]);
  return onCloseRef;
}
