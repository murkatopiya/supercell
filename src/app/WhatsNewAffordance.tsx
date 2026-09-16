import { PUBLIC_VERSION } from "./publicVersion.js";

export function WhatsNewAffordance({ expanded, onOpen, className = "" }: {
  expanded: boolean;
  onOpen: (trigger: HTMLButtonElement) => void;
  className?: string;
}) {
  return (
    <button type="button" className={`ui-button ui-button--subtle ${className}`.trim()}
      aria-haspopup="dialog" aria-expanded={expanded}
      onClick={event => onOpen(event.currentTarget)}>
      What's new · {PUBLIC_VERSION}
    </button>
  );
}
