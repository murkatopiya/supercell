import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ModeIdentity } from "./ModeIdentity.js";

describe("ModeIdentity", () => {
  it("shows Supercell as a return control and the current mode as identity", () => {
    const guided = renderToStaticMarkup(
      <ModeIdentity mode="Guided" onReturnToLanding={() => {}} />,
    );
    const explore = renderToStaticMarkup(
      <ModeIdentity mode="Explore" onReturnToLanding={() => {}} />,
    );
    expect(guided).toContain("Supercell");
    expect(guided).toContain("Guided");
    expect(guided).toContain("type=\"button\"");
    expect(guided).toContain("aria-label=\"Application\"");
    expect(guided).not.toContain("Explore");
    expect(explore).toContain("Explore");
    expect(explore).not.toContain("Guided");
    expect(guided).not.toContain("aria-pressed");
    expect(guided).not.toContain("Environment");
  });
});
