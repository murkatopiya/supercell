import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  ExploreAuthoringHistoryControls,
  REDO_EMPTY_REASON,
  UNDO_EMPTY_REASON,
} from "./ExploreAuthoringHistoryControls.js";
import controlsSrc from "./ExploreAuthoringHistoryControls.tsx?raw";
import appSrc from "../../app/App.tsx?raw";

describe("ExploreAuthoringHistoryControls", () => {
  it("disables Undo and Redo from the real stacks", () => {
    const empty = renderToStaticMarkup(
      <ExploreAuthoringHistoryControls
        canUndo={false}
        canRedo={false}
        onUndo={() => {}}
        onRedo={() => {}}
      />,
    );
    expect(empty).toContain("Undo");
    expect(empty).toContain("Redo");
    expect(empty).toContain("disabled");
    expect(empty).toContain(UNDO_EMPTY_REASON);
    expect(empty).toContain(REDO_EMPTY_REASON);
    expect(controlsSrc).toMatch(/disabled=\{!canUndo\}/);
    expect(controlsSrc).toMatch(/disabled=\{!canRedo\}/);
  });

  it("enables each action when its stack is non-empty", () => {
    const html = renderToStaticMarkup(
      <ExploreAuthoringHistoryControls
        canUndo={true}
        canRedo={true}
        onUndo={() => {}}
        onRedo={() => {}}
      />,
    );
    expect(html).not.toContain("disabled");
    expect(html).not.toContain(UNDO_EMPTY_REASON);
    expect(html).not.toContain(REDO_EMPTY_REASON);
  });

  it("lives in the Explore Release band, not SceneToolbar or Guided", () => {
    const releaseBand = appSrc.slice(
      appSrc.indexOf("control-band--release"),
      appSrc.indexOf("control-band--runtime"),
    );
    expect(releaseBand).toMatch(/ExploreAuthoringHistoryControls/);
    expect(releaseBand).toMatch(/ExplorePointReleaseControls/);

    const sceneToolbar = appSrc.slice(
      appSrc.indexOf("<SceneToolbar>"),
      appSrc.indexOf("</SceneToolbar>"),
    );
    expect(sceneToolbar).not.toMatch(/ExploreAuthoringHistoryControls/);
    expect(sceneToolbar).not.toMatch(/>Undo</);

    const guidedShell = appSrc.slice(appSrc.indexOf("workbench--guided"));
    expect(guidedShell).not.toMatch(/ExploreAuthoringHistoryControls/);
    expect(guidedShell).not.toMatch(/handleExploreUndo/);
  });
});
