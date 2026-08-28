import type { ReactNode } from "react";

export interface SceneToolbarProps {
  children: ReactNode;
}

/**
 * Viewport-local presentation chrome. Observes App session state;
 * does not own physics, occupancy, or selection.
 * docs/ui/08-scene-toolbar-and-control-states.md
 */
export function SceneToolbar({ children }: SceneToolbarProps) {
  return (
    <div className="scene-toolbar" role="toolbar" aria-label="Scene">
      {children}
    </div>
  );
}
