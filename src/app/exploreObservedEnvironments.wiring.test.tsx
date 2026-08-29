import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import appSrc from "./App.tsx?raw";
import createGuidedLabSrc from "./createGuidedLab.ts?raw";
import {
  composeDemoTracerFields,
} from "./composeDemoTracerSimulation.js";
import { createExploreLab } from "./createExploreLab.js";
import { createGuidedLab } from "./createGuidedLab.js";
import {
  DUMAS_2010_OBSERVED_RECORD,
  GOSHEN_2009_OBSERVED_RECORD,
  MOORE_2013_OBSERVED_RECORD,
  PROSPECT_VALLEY_2010_OBSERVED_RECORD,
  exploreEnvironmentalWindProfile,
  exploreObservedEnvironmentRecord,
} from "./goshenObservedEnvironment.js";
import { createDemoHodographPoints } from "./demoHodographFixture.js";
import { IntegrationFrame } from "./IntegrationFrame.js";
import type { ExploreSceneSlots } from "../explore/ExplorePointReleaseOrchestration.js";
import {
  DEFAULT_EXPLORE_ENVIRONMENT_IDENTITY,
  DUMAS_2010_OBSERVED_ENVIRONMENT_LABEL,
  DUMAS_OBSERVED_ENVIRONMENT_COPY,
  DUMAS_SANDBOX_ANTI_CLAIM,
  EXPLORE_ENVIRONMENT_DEMO_PRESCRIBED,
  EXPLORE_ENVIRONMENT_DUMAS_2010_OBSERVED,
  EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
  EXPLORE_ENVIRONMENT_IDENTITIES,
  EXPLORE_ENVIRONMENT_MOORE_2013_OBSERVED,
  EXPLORE_ENVIRONMENT_OPTIONS,
  EXPLORE_ENVIRONMENT_PROSPECT_VALLEY_2010_OBSERVED,
  GOSHEN_2009_OBSERVED_ENVIRONMENT_LABEL,
  GOSHEN_PRESCRIBED_STORM_COPY,
  MOORE_2013_OBSERVED_ENVIRONMENT_LABEL,
  MOORE_OBSERVED_ENVIRONMENT_COPY,
  MOORE_SANDBOX_ANTI_CLAIM,
  PROSPECT_VALLEY_2010_OBSERVED_ENVIRONMENT_LABEL,
  PROSPECT_VALLEY_OBSERVED_ENVIRONMENT_COPY,
  PROSPECT_VALLEY_SANDBOX_ANTI_CLAIM,
  exploreEnvironmentLabel,
} from "../explore/exploreEnvironmentIdentity.js";
import { EnvironmentSurface } from "../ui/hodograph/EnvironmentSurface.js";
import { HodographPanel } from "../ui/hodograph/HodographPanel.js";
import { DEFAULT_HODOGRAPH_OVERLAY_VISIBILITY } from "../ui/hodograph/hodographOverlayVisibility.js";
import { INITIAL_HODOGRAPH_PANEL_GEOMETRY } from "../ui/hodograph/hodographPanelGeometry.js";
import { DEFAULT_HODOGRAPH_PLOT_VIEW } from "../ui/hodograph/hodographPlotView.js";
import { hodographDisplayKnotIndices } from "../ui/hodograph/hodographViewTransform.js";
import { hodographPoints } from "../physics/environment/hodograph.js";
import { DEMO_SCENARIO } from "../scenario/DEMO_SCENARIO.js";
import { GuidedExperimentId } from "../guided/GuidedExperiment.js";

function fakeSlots(): ExploreSceneSlots {
  let tracerSlotCount = 0;
  return {
    get tracerSlotCount() {
      return tracerSlotCount;
    },
    addTracerSlot() {
      tracerSlotCount += 1;
    },
    removeLastTracerSlot() {
      if (tracerSlotCount > 0) {
        tracerSlotCount -= 1;
      }
    },
    clearTracerSlots() {
      tracerSlotCount = 0;
    },
    syncReleasePreview() {},
  };
}

const INTERIOR = { x: -2000, y: 2000, z: 0 };

function environmentSurfaceHtml(
  identity:
    | typeof EXPLORE_ENVIRONMENT_PROSPECT_VALLEY_2010_OBSERVED
    | typeof EXPLORE_ENVIRONMENT_DUMAS_2010_OBSERVED
    | typeof EXPLORE_ENVIRONMENT_MOORE_2013_OBSERVED,
) {
  const record = exploreObservedEnvironmentRecord(identity)!;
  return renderToStaticMarkup(
    <EnvironmentSurface
      open={true}
      points={hodographPoints(record.profile)}
      stormMotion={DEMO_SCENARIO.stormMotion}
      overlayVisibility={DEFAULT_HODOGRAPH_OVERLAY_VISIBILITY}
      onOverlayVisibilityChange={() => {}}
      onClose={() => {}}
      panelGeometry={INITIAL_HODOGRAPH_PANEL_GEOMETRY}
      onPanelGeometryChange={() => {}}
      plotView={DEFAULT_HODOGRAPH_PLOT_VIEW}
      onPlotViewChange={() => {}}
      boundsElementRef={{ current: null }}
      environmentIdentity={identity}
      onEnvironmentIdentityChange={() => {}}
    />,
  );
}

function expectThinnedObservedHodograph(
  profile: (typeof GOSHEN_2009_OBSERVED_RECORD)["profile"],
  firstHeightLabel: string,
  lastHeightLabel: string,
) {
  const points = hodographPoints(profile);
  const html = renderToStaticMarkup(
    <HodographPanel points={points} stormMotion={DEMO_SCENARIO.stormMotion} />,
  );
  const displayIndices = hodographDisplayKnotIndices(points);
  const polylineTag = html.match(/<polyline\b[^>]*>/)?.[0];
  const polylinePoints = polylineTag?.match(/points="([^"]+)"/)?.[1] ?? "";
  const markers = html.match(/hodograph-panel__marker/g) ?? [];
  const labels = html.match(/hodograph-panel__height-label/g) ?? [];

  expect(polylinePoints.split(" ").filter(Boolean)).toHaveLength(points.length);
  expect(markers.length).toBe(displayIndices.size);
  expect(labels.length).toBe(markers.length);
  expect(markers.length).toBeGreaterThan(2);
  expect(markers.length).toBeLessThan(30);
  expect(markers.length).toBeLessThan(points.length);
  expect(html).toContain(firstHeightLabel);
  expect(html).toContain(lastHeightLabel);
}

describe("Explore observed environments", () => {
  it("registers DEMO plus four observed Explore identities", () => {
    expect(EXPLORE_ENVIRONMENT_IDENTITIES).toEqual([
      EXPLORE_ENVIRONMENT_DEMO_PRESCRIBED,
      EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
      EXPLORE_ENVIRONMENT_PROSPECT_VALLEY_2010_OBSERVED,
      EXPLORE_ENVIRONMENT_DUMAS_2010_OBSERVED,
      EXPLORE_ENVIRONMENT_MOORE_2013_OBSERVED,
    ]);
    expect(EXPLORE_ENVIRONMENT_OPTIONS.map((option) => option.identity)).toEqual(
      [...EXPLORE_ENVIRONMENT_IDENTITIES],
    );
    expect(EXPLORE_ENVIRONMENT_OPTIONS.map((option) => option.label)).toEqual([
      "Demo prescribed environment",
      GOSHEN_2009_OBSERVED_ENVIRONMENT_LABEL,
      PROSPECT_VALLEY_2010_OBSERVED_ENVIRONMENT_LABEL,
      DUMAS_2010_OBSERVED_ENVIRONMENT_LABEL,
      MOORE_2013_OBSERVED_ENVIRONMENT_LABEL,
    ]);
    expect(DEFAULT_EXPLORE_ENVIRONMENT_IDENTITY).toBe(
      EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
    );
    for (const option of EXPLORE_ENVIRONMENT_OPTIONS) {
      expect(exploreEnvironmentLabel(option.identity)).toBe(option.label);
    }
  });

  it("resolves each observed identity to its own golden record and provenance", () => {
    const goshen = exploreObservedEnvironmentRecord(
      EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
    );
    const prospect = exploreObservedEnvironmentRecord(
      EXPLORE_ENVIRONMENT_PROSPECT_VALLEY_2010_OBSERVED,
    );
    const dumas = exploreObservedEnvironmentRecord(
      EXPLORE_ENVIRONMENT_DUMAS_2010_OBSERVED,
    );
    const moore = exploreObservedEnvironmentRecord(
      EXPLORE_ENVIRONMENT_MOORE_2013_OBSERVED,
    );

    expect(goshen).toBe(GOSHEN_2009_OBSERVED_RECORD);
    expect(prospect).toBe(PROSPECT_VALLEY_2010_OBSERVED_RECORD);
    expect(dumas).toBe(DUMAS_2010_OBSERVED_RECORD);
    expect(moore).toBe(MOORE_2013_OBSERVED_RECORD);
    expect(
      exploreObservedEnvironmentRecord(EXPLORE_ENVIRONMENT_DEMO_PRESCRIBED),
    ).toBeUndefined();
    expect(
      exploreEnvironmentalWindProfile(EXPLORE_ENVIRONMENT_DEMO_PRESCRIBED),
    ).toBeUndefined();

    expect(goshen?.provenance.sourceIdentity).toContain("Bushnell/NSSL1");
    expect(goshen?.provenance.validTime).toBe("2009-06-05 21:55:22 UTC");
    expect(prospect?.provenance.sourceIdentity).toContain("Mobile System/NSSL1");
    expect(prospect?.provenance.validTime).toBe("2010-05-26 22:23:46 UTC");
    expect(dumas?.provenance.sourceIdentity).toContain("Mobile System/NSSL2");
    expect(dumas?.provenance.validTime).toBe("2010-05-18 21:52:18 UTC");
    expect(dumas?.provenance.sourceIdentity).not.toMatch(/22:04:18/);
    expect(dumas?.provenance.sourceIdentity).not.toMatch(/forward-flank/i);

    expect(moore?.provenance.sourceClass).toBe("observed-raob");
    expect(moore?.provenance.sourceIdentity).toContain("USM00072357");
    expect(moore?.provenance.validTime).toContain("16:51");
    expect(moore?.provenance.validTime).toContain("HOUR 17");
    expect(moore?.provenance.validTime.includes("18 UTC")).toBe(false);
    expect(moore?.provenance.location).toEqual({
      latitude: 35.1808,
      longitude: -97.4378,
    });
    expect(moore?.provenance.heightDatum).toContain("345");
    expect(moore?.provenance.heightDatum).toContain("344.9 m is not");
    expect(moore?.profile.minHeight).toBe(0);
    expect(moore?.profile.maxHeight).toBe(30700);
    expect(moore?.profile.levelHeights()).toHaveLength(165);

    expect(goshen?.profile.minHeight).toBe(2.4);
    expect(goshen?.profile.levelHeights()).toHaveLength(2029);
    expect(prospect?.profile.minHeight).toBe(-0.1);
    expect(prospect?.profile.levelHeights()).toHaveLength(2733);
    expect(dumas?.profile.minHeight).toBe(-0.5);
    expect(dumas?.profile.levelHeights()).toHaveLength(2917);
  });

  it("keeps Guided on DEMO while Explore can select Prospect and Dumas", () => {
    const guided = createGuidedLab(GuidedExperimentId.InflowToUpperOutflow);
    const demo = composeDemoTracerFields(
      IntegrationFrame.StormRelativeLaboratory,
    );
    expect(guided.tiltingTendency.profile.minHeight).toBe(0);
    expect(guided.tiltingTendency.profile.levelHeights()).toHaveLength(5);
    expect(guided.velocityObservation.total.sample(INTERIOR, 0)).toEqual(
      demo.field.sample(INTERIOR, 0),
    );
    expect(createGuidedLabSrc).not.toMatch(/environmentalWindProfile/);
    expect(createGuidedLabSrc).not.toMatch(
      /goshen|prospect|dumas|moore|igra|oun|nssl1|nssl2/i,
    );

    const prospectLab = createExploreLab(
      fakeSlots(),
      EXPLORE_ENVIRONMENT_PROSPECT_VALLEY_2010_OBSERVED,
    );
    const dumasLab = createExploreLab(
      fakeSlots(),
      EXPLORE_ENVIRONMENT_DUMAS_2010_OBSERVED,
    );
    const mooreLab = createExploreLab(
      fakeSlots(),
      EXPLORE_ENVIRONMENT_MOORE_2013_OBSERVED,
    );
    expect(prospectLab.tiltingTendency.profile).toBe(
      PROSPECT_VALLEY_2010_OBSERVED_RECORD.profile,
    );
    expect(dumasLab.tiltingTendency.profile).toBe(
      DUMAS_2010_OBSERVED_RECORD.profile,
    );
    expect(mooreLab.tiltingTendency.profile).toBe(
      MOORE_2013_OBSERVED_RECORD.profile,
    );
    expect(mooreLab.tiltingTendency.profile.levelHeights()).toHaveLength(165);
  });

  it("rebuilds Explore so profile, hodograph, and env diagnostics stay on one identity", () => {
    const goshenProfile = exploreEnvironmentalWindProfile(
      EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
    )!;
    const prospectProfile = exploreEnvironmentalWindProfile(
      EXPLORE_ENVIRONMENT_PROSPECT_VALLEY_2010_OBSERVED,
    )!;
    const dumasProfile = exploreEnvironmentalWindProfile(
      EXPLORE_ENVIRONMENT_DUMAS_2010_OBSERVED,
    )!;
    const mooreProfile = exploreEnvironmentalWindProfile(
      EXPLORE_ENVIRONMENT_MOORE_2013_OBSERVED,
    )!;
    const goshenLab = createExploreLab(
      fakeSlots(),
      EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
    );
    const prospectLab = createExploreLab(
      fakeSlots(),
      EXPLORE_ENVIRONMENT_PROSPECT_VALLEY_2010_OBSERVED,
    );
    const dumasLab = createExploreLab(
      fakeSlots(),
      EXPLORE_ENVIRONMENT_DUMAS_2010_OBSERVED,
    );
    const mooreLab = createExploreLab(
      fakeSlots(),
      EXPLORE_ENVIRONMENT_MOORE_2013_OBSERVED,
    );

    expect(goshenLab.simulation).not.toBe(prospectLab.simulation);
    expect(prospectLab.simulation).not.toBe(dumasLab.simulation);
    expect(mooreLab.simulation).not.toBe(dumasLab.simulation);
    expect(goshenLab.tiltingTendency.profile).toBe(goshenProfile);
    expect(prospectLab.tiltingTendency.profile).toBe(prospectProfile);
    expect(dumasLab.tiltingTendency.profile).toBe(dumasProfile);
    expect(mooreLab.tiltingTendency.profile).toBe(mooreProfile);

    const goshenPoints = hodographPoints(goshenLab.tiltingTendency.profile);
    const prospectPoints = hodographPoints(
      prospectLab.tiltingTendency.profile,
    );
    const dumasPoints = hodographPoints(dumasLab.tiltingTendency.profile);
    const moorePoints = hodographPoints(mooreLab.tiltingTendency.profile);
    expect(goshenPoints).toHaveLength(2029);
    expect(prospectPoints).toHaveLength(2733);
    expect(dumasPoints).toHaveLength(2917);
    expect(moorePoints).toHaveLength(165);
    expect(moorePoints[0]!.height).toBe(0);
    expect(moorePoints[moorePoints.length - 1]!.height).toBe(30700);
    expect(prospectPoints).not.toEqual(goshenPoints);
    expect(dumasPoints).not.toEqual(goshenPoints);
    expect(dumasPoints).not.toEqual(prospectPoints);
    expect(moorePoints).not.toEqual(dumasPoints);
    expect(moorePoints).not.toEqual(goshenPoints);
    expect(prospectPoints).not.toEqual(createDemoHodographPoints());

    const goshenAdvection = goshenLab.velocityObservation.parts!.find(
      (part) => part.key === "environmentAdvection",
    )!.field.sample(INTERIOR, 0);
    const prospectAdvection = prospectLab.velocityObservation.parts!.find(
      (part) => part.key === "environmentAdvection",
    )!.field.sample(INTERIOR, 0);
    const dumasAdvection = dumasLab.velocityObservation.parts!.find(
      (part) => part.key === "environmentAdvection",
    )!.field.sample(INTERIOR, 0);
    const mooreAdvection = mooreLab.velocityObservation.parts!.find(
      (part) => part.key === "environmentAdvection",
    )!.field.sample(INTERIOR, 0);
    expect(prospectAdvection).not.toEqual(goshenAdvection);
    expect(dumasAdvection).not.toEqual(goshenAdvection);
    expect(dumasAdvection).not.toEqual(prospectAdvection);
    expect(mooreAdvection).not.toEqual(dumasAdvection);
    expect(mooreAdvection).not.toEqual(goshenAdvection);
    expect(prospectLab.tiltingTendency.sample(INTERIOR, 0)).not.toBe(
      goshenLab.tiltingTendency.sample(INTERIOR, 0),
    );
    expect(dumasLab.tiltingTendency.sample(INTERIOR, 0)).not.toBe(
      prospectLab.tiltingTendency.sample(INTERIOR, 0),
    );
    expect(mooreLab.tiltingTendency.sample(INTERIOR, 0)).not.toBe(
      dumasLab.tiltingTendency.sample(INTERIOR, 0),
    );
    expect(prospectLab.velocityObservation.total.sample(INTERIOR, 0)).not.toEqual(
      goshenLab.velocityObservation.total.sample(INTERIOR, 0),
    );
    expect(mooreLab.velocityObservation.total.sample(INTERIOR, 0)).not.toEqual(
      dumasLab.velocityObservation.total.sample(INTERIOR, 0),
    );
  });

  it("keeps hodograph and lab on the same selected profile in App wiring", () => {
    expect(appSrc).toMatch(
      /exploreEnvironmentalWindProfile\(exploreEnvironmentIdentity\)/,
    );
    expect(appSrc).toMatch(
      /const observedProfile =\s*explore !== null\s*\?\s*exploreEnvironmentalWindProfile\(exploreEnvironmentIdentity\)/,
    );
    expect(appSrc).toMatch(
      /const activeProfile =\s*observedProfile \?\? createDemoEnvironmentalWindProfile\(\)/,
    );
    expect(appSrc).toMatch(/hodographPoints\(activeProfile\)/);
    expect(appSrc).not.toMatch(/goshenExploreActive/);
    expect(appSrc).not.toMatch(/GOSHEN_2009_OBSERVED_RECORD/);
    expect(appSrc).toMatch(
      /selectExploreEnvironment[\s\S]*createExploreLab\(\s*sceneSlotsRef\.current!,\s*next/s,
    );
  });

  it("reads the current environment under the Explore laboratory heading", () => {
    expect(appSrc).toMatch(
      /exploreEnvironmentLabel\(exploreEnvironmentIdentity\)/,
    );
    const controls = appSrc.slice(
      appSrc.indexOf("workbench__column--controls"),
      appSrc.indexOf("workbench__column--viewport"),
    );
    expect(controls).toMatch(/workbench__column-note/);
    expect(controls).not.toMatch(/name="explore-environment-identity"/);
    const guided = appSrc.slice(appSrc.indexOf("workbench--guided"));
    expect(guided).not.toMatch(/exploreEnvironmentLabel/);
    expect(guided).not.toMatch(/workbench__column-note/);
  });

  it("omits DEMO [0, 1000] overlays for every observed Explore environment", () => {
    expect(appSrc).toMatch(
      /observedExploreActive\s*\?\s*undefined\s*:\s*createDemoVorticityLayer\(\)/,
    );
    expect(appSrc).not.toMatch(
      /exploreEnvironmentIdentity === EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED/,
    );
  });

  it("shows Prospect, Dumas, and Moore as selectable observed environments with honesty copy", () => {
    const prospectHtml = environmentSurfaceHtml(
      EXPLORE_ENVIRONMENT_PROSPECT_VALLEY_2010_OBSERVED,
    );
    const dumasHtml = environmentSurfaceHtml(
      EXPLORE_ENVIRONMENT_DUMAS_2010_OBSERVED,
    );
    const mooreHtml = environmentSurfaceHtml(
      EXPLORE_ENVIRONMENT_MOORE_2013_OBSERVED,
    );

    expect(prospectHtml).toContain(PROSPECT_VALLEY_2010_OBSERVED_ENVIRONMENT_LABEL);
    expect(prospectHtml).toContain(PROSPECT_VALLEY_OBSERVED_ENVIRONMENT_COPY);
    expect(prospectHtml).toContain(GOSHEN_PRESCRIBED_STORM_COPY);
    expect(prospectHtml).toContain(PROSPECT_VALLEY_SANDBOX_ANTI_CLAIM);
    expect(prospectHtml).not.toMatch(/reconstructs the Prospect/i);
    expect(prospectHtml).not.toMatch(/the real Prospect Valley storm/i);
    expect(prospectHtml).not.toContain("Hodograph overlays");
    expect(prospectHtml).not.toContain("Storm-relative wind V_sr");
    expect(prospectHtml).not.toMatch(/disabled/);

    expect(dumasHtml).toContain(DUMAS_2010_OBSERVED_ENVIRONMENT_LABEL);
    expect(dumasHtml).toContain(DUMAS_OBSERVED_ENVIRONMENT_COPY);
    expect(dumasHtml).toContain(DUMAS_SANDBOX_ANTI_CLAIM);
    expect(dumasHtml).toContain("VORTEX2 / NSSL2");
    expect(dumasHtml).not.toMatch(/forward-flank/i);
    expect(dumasHtml).not.toMatch(/reconstructs the Dumas/i);
    expect(dumasHtml).not.toMatch(/the real Dumas storm/i);
    expect(dumasHtml).not.toMatch(/observed storm motion/i);
    expect(dumasHtml).not.toContain("Hodograph overlays");
    expect(dumasHtml).not.toMatch(/disabled/);

    expect(mooreHtml).toContain(MOORE_2013_OBSERVED_ENVIRONMENT_LABEL);
    expect(mooreHtml).toContain(MOORE_OBSERVED_ENVIRONMENT_COPY);
    expect(mooreHtml).toContain(GOSHEN_PRESCRIBED_STORM_COPY);
    expect(mooreHtml).toContain(MOORE_SANDBOX_ANTI_CLAIM);
    expect(mooreHtml).toContain("16:51");
    expect(mooreHtml).toContain("IGRA");
    expect(mooreHtml).not.toMatch(/18 UTC/);
    expect(mooreHtml).not.toMatch(/Wyoming/i);
    expect(mooreHtml).not.toMatch(/reconstructs the Moore/i);
    expect(mooreHtml).not.toMatch(/the real Moore storm/i);
    expect(mooreHtml).not.toMatch(/tornado/i);
    expect(mooreHtml).not.toMatch(/observed storm motion/i);
    expect(mooreHtml).not.toContain("Hodograph overlays");
    expect(mooreHtml).not.toMatch(/disabled/);
  });

  it("thins Prospect, Dumas, and Moore markers without resampling the source polyline", () => {
    expectThinnedObservedHodograph(
      PROSPECT_VALLEY_2010_OBSERVED_RECORD.profile,
      "-0.1 m",
      "14017.9 m",
    );
    expectThinnedObservedHodograph(
      DUMAS_2010_OBSERVED_RECORD.profile,
      "-0.5 m",
      "16025.6 m",
    );
    expectThinnedObservedHodograph(
      MOORE_2013_OBSERVED_RECORD.profile,
      "0 m",
      "30700 m",
    );
  });
});
