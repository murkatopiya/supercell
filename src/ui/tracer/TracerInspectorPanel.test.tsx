import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { TracerInspection } from "../../interaction/TracerInspection.js";
import {
  formatInspectorMeters,
  formatInspectorSeconds,
  formatInspectorVelocity,
} from "./formatInspectorDisplay.js";
import { TracerInspectorPanel } from "./TracerInspectorPanel.js";
import { labelForContribution } from "./tracerContributionLabels.js";
import tracerInspectorPanelSrc from "./TracerInspectorPanel.tsx?raw";
import tracerContributionLabelsSrc from "./tracerContributionLabels.ts?raw";
import { DEMO_VELOCITY_CONTRIBUTION_KEYS } from "../../app/composeDemoTracerSimulation.js";

function inspectionFixture(
  overrides: Partial<TracerInspection> = {},
): TracerInspection {
  return {
    tracerId: 2,
    time: 1.25,
    position: { x: 3000.4, y: 100.2, z: 4750.9 },
    altitude: 100.2,
    age: 1.25,
    active: true,
    vTotal: { x: 3, y: 4, z: 12 },
    speed: 13,
    contributions: DEMO_VELOCITY_CONTRIBUTION_KEYS.map((key, index) => ({
      key,
      velocity: { x: index, y: 0, z: 0 },
    })),
    ...overrides,
  };
}

describe("formatInspectorDisplay", () => {
  it("rounds for display and hides signed zero", () => {
    expect(formatInspectorMeters(3000.44)).toBe("3000.4");
    expect(formatInspectorVelocity(13)).toBe("13.00");
    expect(formatInspectorSeconds(1.2)).toBe("1.20");
    expect(formatInspectorVelocity(-0)).toBe("0.00");
    expect(formatInspectorMeters(-0.04)).toBe("0.0");
    expect(formatInspectorVelocity(-0.004)).toBe("0.00");
  });
});

describe("TracerInspectorPanel", () => {
  it("shows a placeholder when there is no inspection", () => {
    const html = renderToStaticMarkup(
      <TracerInspectorPanel inspection={undefined} />,
    );
    expect(html).toContain("Select a tracer to inspect its motion.");
    expect(html).not.toContain("Tracer #");
    expect(html).not.toContain("Why this motion?");
  });

  it("renders Level 1 motion from the current inspection payload", () => {
    const inspection = inspectionFixture();
    const html = renderToStaticMarkup(
      <TracerInspectorPanel inspection={inspection} />,
    );
    expect(html).toContain("Tracer #2");
    expect(html).toContain("3000.4, 100.2, 4750.9");
    expect(html).toContain("100.2");
    expect(html).toContain("1.25");
    expect(html).toContain("active");
    expect(html).toContain("3.00, 4.00, 12.00");
    expect(html).toContain("13.00");
    expect(html).toContain("World: X East, Y Up, Z South");
    expect(html).not.toContain("u, v, w");
    expect(html).not.toContain("Ground-relative environmental wind");
  });

  it("renders seven DEMO contribution rows with labels and |V_i|", () => {
    const html = renderToStaticMarkup(
      <TracerInspectorPanel inspection={inspectionFixture()} />,
    );
    expect(html).toContain("Why this motion?");
    expect(html).toContain("Environmental advection");
    expect(html).toContain("Updraft");
    expect(html).toContain("Rotation");
    expect(html).toContain("Lower inflow");
    expect(html).toContain("Upper outflow");
    expect(html).toContain("Downdraft");
    expect(html).toContain("Near-ground outflow");
    expect(html).toContain("|V_i| 3.00");
    expect(html).not.toContain("Ground-relative environmental wind");
  });

  it("hides Level 2 when contributions are absent and does not invent rows", () => {
    const html = renderToStaticMarkup(
      <TracerInspectorPanel
        inspection={inspectionFixture({ contributions: undefined })}
      />,
    );
    expect(html).toContain("Tracer #2");
    expect(html).toContain("V_total");
    expect(html).not.toContain("Why this motion?");
    expect(html).not.toContain("Environmental advection");
  });

  it("keeps an inactive tracer inspectable without claiming it is moving", () => {
    const html = renderToStaticMarkup(
      <TracerInspectorPanel
        inspection={inspectionFixture({ active: false })}
      />,
    );
    expect(html).toContain("inactive");
    expect(html).toContain("V_total");
    expect(html).toContain("Velocity is the field at this marker, not tracer motion.");
    expect(html).not.toMatch(/is moving/i);
  });

  it("falls back to the raw token for an unknown contribution key", () => {
    expect(labelForContribution("futureMechanism")).toBe("futureMechanism");
    const html = renderToStaticMarkup(
      <TracerInspectorPanel
        inspection={inspectionFixture({
          contributions: [
            { key: "futureMechanism", velocity: { x: 1, y: 0, z: 0 } },
          ],
        })}
      />,
    );
    expect(html).toContain("futureMechanism");
  });

  it("does not put Guided pedagogy or meteorological u/v/w into the shared panel", () => {
    expect(tracerInspectorPanelSrc).not.toMatch(/TracerPedagogy/);
    expect(tracerInspectorPanelSrc).not.toMatch(/S1|S2|D1|NG1/);
    expect(tracerInspectorPanelSrc).not.toMatch(/u,\s*v,\s*w/);
    expect(tracerContributionLabelsSrc).toMatch(/Environmental advection/);
    expect(tracerContributionLabelsSrc).not.toMatch(
      /Ground-relative environmental wind/,
    );
  });
});
