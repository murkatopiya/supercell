/** @vitest-environment happy-dom */
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import { LearnLessonStepNavigation } from "./LearnLessonStepNavigation.js";
import { LEARN_LESSONS } from "./LearnLessonNavigation.js";

it.each([
  [0, ["Next: Follow Motion"]],
  [1, ["Back: Look Around", "Next: Read the Motion"]],
  [2, ["Back: Follow Motion", "Next: Compare the Flow"]],
  [3, ["Back: Read the Motion"]],
] as const)("renders only actual adjacent destinations for lesson %s", (index, names) => {
  const host = document.createElement("div"); const onSelect = vi.fn();
  host.innerHTML = renderToStaticMarkup(createElement(LearnLessonStepNavigation, { current: LEARN_LESSONS[index]!.id, onSelect }));
  expect(host.querySelector('nav[aria-label="Previous and next lessons"]')).not.toBeNull();
  const buttons = [...host.querySelectorAll('button')];
  expect(buttons.map(b => b.textContent)).toEqual(names);
  expect(buttons.every(b => b.type === "button" && !b.disabled)).toBe(true);
  expect(buttons.filter(b => b.classList.contains('ui-button--primary')).map(b => b.textContent)).toEqual(names.filter(n => n.startsWith("Next:")));
  expect(onSelect).not.toHaveBeenCalled();
});
