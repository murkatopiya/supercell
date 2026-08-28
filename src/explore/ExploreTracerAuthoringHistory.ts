import type { TracerSeedPosition } from "../simulation/createTracersFromSeeds.js";

export type ExploreAddTracerCommand = {
  readonly kind: "add-tracer";
  readonly seed: TracerSeedPosition;
};

function copySeed(seed: TracerSeedPosition): TracerSeedPosition {
  return { x: seed.x, y: seed.y, z: seed.z };
}

/**
 * Explore authoring command history. Not simulation rewind.
 * v1 records successful Add tracer only.
 * docs/ui/13-explore-tracer-authoring-history.md
 */
export class ExploreTracerAuthoringHistory {
  private readonly undoStack: ExploreAddTracerCommand[] = [];
  private readonly redoStack: ExploreAddTracerCommand[] = [];

  get canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  get canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /**
   * Record a successful user Add tracer. Clears redo (branch).
   */
  recordAdd(seed: TracerSeedPosition): void {
    this.undoStack.push({ kind: "add-tracer", seed: copySeed(seed) });
    this.redoStack.length = 0;
  }

  undo(): ExploreAddTracerCommand | null {
    const command = this.undoStack.pop();
    if (command === undefined) {
      return null;
    }
    this.redoStack.push(command);
    return command;
  }

  redo(): ExploreAddTracerCommand | null {
    const command = this.redoStack.pop();
    if (command === undefined) {
      return null;
    }
    this.undoStack.push(command);
    return command;
  }

  clear(): void {
    this.undoStack.length = 0;
    this.redoStack.length = 0;
  }
}
