import { describe, expect, it } from "vitest";
import { ExploreTracerAuthoringHistory } from "./ExploreTracerAuthoringHistory.js";
import historySrc from "./ExploreTracerAuthoringHistory.ts?raw";

describe("ExploreTracerAuthoringHistory", () => {
  it("records successful Add tracer onto the undo stack", () => {
    const history = new ExploreTracerAuthoringHistory();
    expect(history.canUndo).toBe(false);
    expect(history.canRedo).toBe(false);
    history.recordAdd({ x: 1, y: 2, z: 3 });
    expect(history.canUndo).toBe(true);
    expect(history.canRedo).toBe(false);
  });

  it("undoes LIFO and redo restores the same seed command", () => {
    const history = new ExploreTracerAuthoringHistory();
    history.recordAdd({ x: 1, y: 10, z: 0 });
    history.recordAdd({ x: 2, y: 20, z: 0 });
    history.recordAdd({ x: 3, y: 30, z: 0 });

    expect(history.undo()).toEqual({
      kind: "add-tracer",
      seed: { x: 3, y: 30, z: 0 },
    });
    expect(history.undo()).toEqual({
      kind: "add-tracer",
      seed: { x: 2, y: 20, z: 0 },
    });
    expect(history.canUndo).toBe(true);
    expect(history.canRedo).toBe(true);

    expect(history.redo()).toEqual({
      kind: "add-tracer",
      seed: { x: 2, y: 20, z: 0 },
    });
    expect(history.canRedo).toBe(true);
  });

  it("clears redo when a new Add is recorded after undo", () => {
    const history = new ExploreTracerAuthoringHistory();
    history.recordAdd({ x: 1, y: 0, z: 0 });
    history.recordAdd({ x: 2, y: 0, z: 0 });
    history.undo();
    expect(history.canRedo).toBe(true);
    history.recordAdd({ x: 9, y: 0, z: 0 });
    expect(history.canRedo).toBe(false);
    expect(history.undo()?.seed).toEqual({ x: 9, y: 0, z: 0 });
    expect(history.undo()?.seed).toEqual({ x: 1, y: 0, z: 0 });
    expect(history.canUndo).toBe(false);
  });

  it("copies the seed so later mutation cannot rewrite the command", () => {
    const history = new ExploreTracerAuthoringHistory();
    const seed = { x: 4, y: 5, z: 6 };
    history.recordAdd(seed);
    seed.x = 0;
    expect(history.undo()?.seed).toEqual({ x: 4, y: 5, z: 6 });
  });

  it("clear empties both stacks", () => {
    const history = new ExploreTracerAuthoringHistory();
    history.recordAdd({ x: 1, y: 0, z: 0 });
    history.undo();
    history.clear();
    expect(history.canUndo).toBe(false);
    expect(history.canRedo).toBe(false);
    expect(history.undo()).toBeNull();
    expect(history.redo()).toBeNull();
  });

  it("does not own Simulation, selection, or physics", () => {
    expect(historySrc).not.toMatch(/Simulation/);
    expect(historySrc).not.toMatch(/TracerSelection/);
    expect(historySrc).not.toMatch(/from ["'].*physics/);
    expect(historySrc).not.toMatch(/clock/);
  });
});
