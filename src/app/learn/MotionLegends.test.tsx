/** @vitest-environment happy-dom */
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { FollowMotionLegend } from "./FollowMotionLegend.js";
import { ReadMotionLegend } from "./ReadMotionLegend.js";
import { TRACER_COLORS } from "../../rendering/tracerObserveSlot.js";
import { createVelocityArrow } from "../../rendering/velocityArrow.js";
import type { Mesh, MeshBasicMaterial } from "three";

it("explains existing Follow Motion symbols without disclosure or colour-only identity", () => {
  const host = document.createElement("div"); host.innerHTML = renderToStaticMarkup(<FollowMotionLegend />);
  expect(host.querySelector('section[aria-label="Follow Motion scene guide"]')).not.toBeNull();
  expect(host.querySelector("details, button, input")).toBeNull();
  expect(host.querySelectorAll("dt")).toHaveLength(4);
  expect([...host.querySelectorAll("circle")].map(e => e.getAttribute("fill"))).toEqual(TRACER_COLORS.slice(0, 2).map(c => `#${c.toString(16)}`));
  expect([...host.querySelectorAll("svg text")].map(e => e.textContent)).toEqual(["A", "B"]);
  expect(host.textContent).toContain("small ring is its projection on model ground, not a trajectory");
  expect(host.querySelector('path[stroke-dasharray]')).not.toBeNull();
  expect(host.querySelectorAll('svg[aria-hidden="true"]')).toHaveLength(4);
});

it("uses the actual velocity-arrow colour and explains history without inventing a reference glyph", () => {
  const host = document.createElement("div"); host.innerHTML = renderToStaticMarkup(<ReadMotionLegend />);
  const arrow = createVelocityArrow();
  try {
    const material = (arrow.object.children[0] as Mesh).material as MeshBasicMaterial;
    expect(host.querySelector('path[stroke="#ffdc75"]')?.getAttribute("stroke")).toBe(`#${material.color.getHexString()}`);
    expect(host.querySelector('section[aria-label="Read the Motion scene guide"]')).not.toBeNull();
    expect(host.textContent).toContain("not a path or predicted displacement");
    expect(host.textContent).toContain("initial height above model ground");
    expect(host.textContent).not.toContain("reference");
    expect(host.querySelectorAll('svg[aria-hidden="true"]')).toHaveLength(4);
    expect(host.querySelector("details")).toBeNull();
  } finally { arrow.dispose(); }
});
