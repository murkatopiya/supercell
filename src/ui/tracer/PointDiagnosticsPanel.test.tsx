import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { PointDiagnosticObservation } from "../../interaction/PointDiagnosticObservation.js";
import {
  classifyPointDiagnosticSign,
  formatPointDiagnosticScientific,
} from "./formatPointDiagnosticDisplay.js";
import { PointDiagnosticsPanel } from "./PointDiagnosticsPanel.js";
import panelSrc from "./PointDiagnosticsPanel.tsx?raw";
import formatterSrc from "./formatPointDiagnosticDisplay.ts?raw";

function observationFixture(
  overrides: Partial<PointDiagnosticObservation> = {},
): PointDiagnosticObservation {
  return {
    tracerId: 2,
    time: 1.25,
    position: { x: 3000, y: 1000, z: 4000 },
    tiltingTendency: 2.33e-5,
    currentVerticalVorticity: 1e-2,
    ...overrides,
  };
}

function quantityBlocks(html: string): string[] {
  return html.split('class="point-diagnostics__quantity"').slice(1);
}

describe("formatPointDiagnosticDisplay", () => {
  it("formats nonzero values in scientific notation with 2 mantissa digits", () => {
    expect(formatPointDiagnosticScientific(2.33e-5)).toBe("2.33×10⁻⁵");
    expect(formatPointDiagnosticScientific(1e-2)).toBe("1.00×10⁻²");
    expect(formatPointDiagnosticScientific(-1.35e-3)).toBe("-1.35×10⁻³");
  });

  it("renders exact zero as 0, including signed zero", () => {
    expect(formatPointDiagnosticScientific(0)).toBe("0");
    expect(formatPointDiagnosticScientific(-0)).toBe("0");
    expect(formatPointDiagnosticScientific(0)).not.toBe("-0");
    expect(formatPointDiagnosticScientific(-0)).not.toBe("-0");
    expect(formatPointDiagnosticScientific(0)).not.toMatch(/×10/);
  });

  it("does not render a tiny finite nonzero as zero", () => {
    expect(formatPointDiagnosticScientific(2.33e-20)).toBe("2.33×10⁻²⁰");
    expect(formatPointDiagnosticScientific(-4.56e-18)).toBe("-4.56×10⁻¹⁸");
    expect(formatPointDiagnosticScientific(2.33e-20)).not.toBe("0");
  });

  it("classifies sign from the raw number, not from formatting", () => {
    expect(classifyPointDiagnosticSign(2.33e-5)).toBe("positive");
    expect(classifyPointDiagnosticSign(-1.35e-5)).toBe("negative");
    expect(classifyPointDiagnosticSign(0)).toBe("zero");
    expect(classifyPointDiagnosticSign(-0)).toBe("zero");
    expect(classifyPointDiagnosticSign(2.33e-20)).toBe("positive");
    expect(classifyPointDiagnosticSign(-4.56e-18)).toBe("negative");
  });
});

describe("PointDiagnosticsPanel", () => {
  it("shows a placeholder when there is no observation and no numeric values", () => {
    const html = renderToStaticMarkup(
      <PointDiagnosticsPanel observation={undefined} />,
    );
    expect(html).toContain("Point diagnostics");
    expect(html).toContain(
      "Select a tracer to sample diagnostics at its current position.",
    );
    expect(quantityBlocks(html)).toHaveLength(0);
    expect(html).not.toContain("T_tilt,y");
    expect(html).not.toContain("ω_y,current");
    expect(html).not.toContain("s⁻²");
    expect(html).not.toContain("s⁻¹");
    expect(html).not.toContain("2.33");
    expect(html).not.toContain("positive");
    expect(html).not.toContain("negative");
    expect(html).not.toContain("These are different quantities.");
  });

  it("renders positive T1 with label, symbol, scientific value, units, and sign", () => {
    const html = renderToStaticMarkup(
      <PointDiagnosticsPanel
        observation={observationFixture({ tiltingTendency: 2.33e-5 })}
      />,
    );
    const [t1] = quantityBlocks(html);
    expect(t1).toContain("Vertical-vorticity tilting tendency");
    expect(t1).toContain("T_tilt,y");
    expect(t1).toContain("2.33×10⁻⁵");
    expect(t1).toContain("s⁻²");
    expect(t1).toContain("positive");
    expect(html).not.toContain("rotation strength");
    expect(html).not.toContain("mesocyclone");
    expect(html).not.toContain("generated spin");
  });

  it("renders negative T1 with the minus sign and the word negative", () => {
    const html = renderToStaticMarkup(
      <PointDiagnosticsPanel
        observation={observationFixture({ tiltingTendency: -1.35e-5 })}
      />,
    );
    const [t1] = quantityBlocks(html);
    expect(t1).toContain("-1.35×10⁻⁵");
    expect(t1).toContain("negative");
    expect(t1).not.toContain("positive");
    expect(t1).not.toContain(">zero<");
  });

  it("renders exact-zero T1 as 0 and zero, never -0", () => {
    const html = renderToStaticMarkup(
      <PointDiagnosticsPanel
        observation={observationFixture({ tiltingTendency: -0 })}
      />,
    );
    const [t1] = quantityBlocks(html);
    expect(t1).toContain(`class="point-diagnostics__value">0<`);
    expect(t1).toContain("zero");
    expect(t1).not.toContain("-0");
    expect(t1).not.toContain("0.00×10");
    expect(t1).not.toMatch(/point-diagnostics__value">-</);
  });

  it("renders positive, negative, and zero Candidate A independently of T1", () => {
    const positive = renderToStaticMarkup(
      <PointDiagnosticsPanel
        observation={observationFixture({
          tiltingTendency: 0,
          currentVerticalVorticity: 1e-2,
        })}
      />,
    );
    const negative = renderToStaticMarkup(
      <PointDiagnosticsPanel
        observation={observationFixture({
          tiltingTendency: 0,
          currentVerticalVorticity: -1.35e-3,
        })}
      />,
    );
    const zero = renderToStaticMarkup(
      <PointDiagnosticsPanel
        observation={observationFixture({
          tiltingTendency: 2.33e-5,
          currentVerticalVorticity: 0,
        })}
      />,
    );

    const [, aPositive] = quantityBlocks(positive);
    expect(aPositive).toContain("Current world-vertical vorticity");
    expect(aPositive).toContain("ω_y,current");
    expect(aPositive).toContain("1.00×10⁻²");
    expect(aPositive).toContain("s⁻¹");
    expect(aPositive).toContain("positive");
    expect(aPositive).not.toContain("cyclonic");
    expect(aPositive).not.toContain("rotation strength");

    const [, aNegative] = quantityBlocks(negative);
    expect(aNegative).toContain("-1.35×10⁻³");
    expect(aNegative).toContain("negative");
    expect(aNegative).toContain("s⁻¹");

    const [, aZero] = quantityBlocks(zero);
    expect(aZero).toContain(`class="point-diagnostics__value">0<`);
    expect(aZero).toContain("zero");
    expect(aZero).not.toContain("-0");
  });

  it("keeps a tiny finite nonzero diagnostic in scientific notation", () => {
    const html = renderToStaticMarkup(
      <PointDiagnosticsPanel
        observation={observationFixture({
          tiltingTendency: 2.33e-20,
          currentVerticalVorticity: -4.56e-18,
        })}
      />,
    );
    const [t1, candidateA] = quantityBlocks(html);
    expect(t1).toContain("2.33×10⁻²⁰");
    expect(t1).toContain("positive");
    expect(t1).not.toContain(`class="point-diagnostics__value">0<`);
    expect(candidateA).toContain("-4.56×10⁻¹⁸");
    expect(candidateA).toContain("negative");
    expect(candidateA).not.toContain(`class="point-diagnostics__value">0<`);
  });

  it("renders both diagnostics from the same observation DTO", () => {
    const observation = observationFixture({
      tiltingTendency: -1.35e-5,
      currentVerticalVorticity: 3.03e-3,
    });
    const html = renderToStaticMarkup(
      <PointDiagnosticsPanel observation={observation} />,
    );
    const blocks = quantityBlocks(html);
    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toContain("T_tilt,y");
    expect(blocks[0]).toContain("-1.35×10⁻⁵");
    expect(blocks[0]).toContain("s⁻²");
    expect(blocks[1]).toContain("ω_y,current");
    expect(blocks[1]).toContain("3.03×10⁻³");
    expect(blocks[1]).toContain("s⁻¹");
    expect(html).toContain("Sampled from the laboratory field at this marker.");
  });

  it("keeps the anti-claim copy visible whenever values are shown", () => {
    const html = renderToStaticMarkup(
      <PointDiagnosticsPanel observation={observationFixture()} />,
    );
    expect(html).toContain("These are different quantities.");
    expect(html).toContain("T_tilt,y is a tilting tendency");
    expect(html).toContain("ω_y,current is world-vertical vorticity that already");
    expect(html).toContain("prescribed through Ω");
    expect(html).toContain("T1 does not generate ω_y,current");
    expect(html).toContain("Same sign at this point is not causation.");
    expect(html).not.toContain("T1 creates");
    expect(html).not.toContain("explains the chimney");
  });

  it("labels HISTORICAL PATH SAMPLE and past-recorded sampling copy", () => {
    const html = renderToStaticMarkup(
      <PointDiagnosticsPanel
        observation={observationFixture()}
        mode="historical"
      />,
    );
    expect(html).toContain("HISTORICAL PATH SAMPLE");
    expect(html).toContain(
      "Sampled at a past recorded position/time from the laboratory field.",
    );
    expect(html).toContain("The tracer was not rewound.");
    expect(html).toContain("T_tilt,y");
    expect(html).not.toContain(
      "Sampled from the laboratory field at this marker.",
    );
  });

  it("is presentational only: no field sampling, simulation, or diagnostic owners", () => {
    expect(panelSrc).not.toMatch(/\.sample\(/);
    expect(panelSrc).not.toMatch(/DiagnosticTiltingTendency/);
    expect(panelSrc).not.toMatch(/DiagnosticVerticalVorticity/);
    expect(panelSrc).not.toMatch(/ExploreLab/);
    expect(panelSrc).not.toMatch(/TracerSelection/);
    expect(panelSrc).not.toMatch(/simulation/);
    expect(formatterSrc).not.toMatch(/\.sample\(/);
    expect(htmlAria(panelSrc)).toContain("Point diagnostics");
  });
});

function htmlAria(source: string): string {
  const match = source.match(/aria-label="([^"]+)"|ariaLabel="([^"]+)"/);
  return match?.[1] ?? match?.[2] ?? "";
}
