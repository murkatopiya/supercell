import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import appSrc from "./App.tsx?raw";
import createExploreLabSrc from "./createExploreLab.ts?raw";
import createGuidedLabSrc from "./createGuidedLab.ts?raw";
import composeDemoTracerSimulationSrc from "./composeDemoTracerSimulation.ts?raw";
import goshenObservedEnvironmentSrc from "./goshenObservedEnvironment.ts?raw";
import {
  composeDemoTracerFields,
  DEMO_VELOCITY_CONTRIBUTION_KEYS,
} from "./composeDemoTracerSimulation.js";
import { createExploreLab } from "./createExploreLab.js";
import { createGuidedLab } from "./createGuidedLab.js";
import {
  GOSHEN_2009_OBSERVED_RECORD,
  exploreEnvironmentalWindProfile,
} from "./goshenObservedEnvironment.js";
import { createDemoHodographPoints } from "./demoHodographFixture.js";
import { IntegrationFrame } from "./IntegrationFrame.js";
import type { ExploreSceneSlots } from "../explore/ExplorePointReleaseOrchestration.js";
import {
  DEFAULT_EXPLORE_ENVIRONMENT_IDENTITY,
  EXPLORE_ENVIRONMENT_DEMO_PRESCRIBED,
  EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
  GOSHEN_2009_OBSERVED_ENVIRONMENT_LABEL,
  GOSHEN_OBSERVED_ENVIRONMENT_COPY,
  GOSHEN_PRESCRIBED_STORM_COPY,
  GOSHEN_SANDBOX_ANTI_CLAIM,
} from "../explore/exploreEnvironmentIdentity.js";
import { EnvironmentSurface } from "../ui/hodograph/EnvironmentSurface.js";
import { HodographPanel } from "../ui/hodograph/HodographPanel.js";
import { DEFAULT_HODOGRAPH_OVERLAY_VISIBILITY } from "../ui/hodograph/hodographOverlayVisibility.js";
import { INITIAL_HODOGRAPH_PANEL_GEOMETRY } from "../ui/hodograph/hodographPanelGeometry.js";
import { DEFAULT_HODOGRAPH_PLOT_VIEW } from "../ui/hodograph/hodographPlotView.js";
import { hodographDisplayKnotIndices } from "../ui/hodograph/hodographViewTransform.js";
import { hodographPoints } from "../physics/environment/hodograph.js";
import { verticalWindShearBetween } from "../physics/environment/verticalWindShear.js";
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

describe("I2 Goshen Explore sandbox", () => {
  it("keeps Guided on the DEMO profile and prescribed DEMO C", () => {
    const guided = createGuidedLab(GuidedExperimentId.InflowToUpperOutflow);
    const demo = composeDemoTracerFields(
      IntegrationFrame.StormRelativeLaboratory,
    );
    expect(guided.tiltingTendency.profile.minHeight).toBe(0);
    expect(guided.tiltingTendency.profile.maxHeight).toBe(12000);
    expect(guided.tiltingTendency.profile.levelHeights()).toHaveLength(5);
    expect(guided.velocityObservation.total.sample(INTERIOR, 0)).toEqual(
      demo.field.sample(INTERIOR, 0),
    );
    expect(DEMO_SCENARIO.stormMotion).toEqual({
      eastward: 10,
      northward: 0,
    });
    expect(createGuidedLabSrc).not.toMatch(/environmentalWindProfile/);
    expect(createGuidedLabSrc).not.toMatch(/goshen|Goshen|nssl1/i);
    expect(createGuidedLabSrc).toMatch(/composeDemoTracerLab/);
  });

  it("defaults Explore to the Goshen observed profile", () => {
    const explore = createExploreLab(fakeSlots());
    expect(DEFAULT_EXPLORE_ENVIRONMENT_IDENTITY).toBe(
      EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
    );
    expect(
      exploreEnvironmentalWindProfile(DEFAULT_EXPLORE_ENVIRONMENT_IDENTITY),
    ).toBe(GOSHEN_2009_OBSERVED_RECORD.profile);
    expect(explore.tiltingTendency.profile).toBe(
      GOSHEN_2009_OBSERVED_RECORD.profile,
    );
    expect(explore.environmentIdentity).toBe(
      EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
    );
    expect(appSrc).toMatch(
      /useState<ExploreEnvironmentIdentity>\(\s*DEFAULT_EXPLORE_ENVIRONMENT_IDENTITY/,
    );
  });

  it("uses the committed 2029-level Goshen golden when that identity is selected", () => {
    const profile = GOSHEN_2009_OBSERVED_RECORD.profile;
    const lab = createExploreLab(
      fakeSlots(),
      EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
    );
    expect(profile.minHeight).toBe(2.4);
    expect(profile.maxHeight).toBe(12261.8);
    expect(profile.levelHeights()).toHaveLength(2029);
    expect(lab.tiltingTendency.profile).toBe(profile);
    expect(lab.tiltingTendency.profile.levelHeights()).toHaveLength(2029);
    expect(GOSHEN_2009_OBSERVED_RECORD.provenance.sourceClass).toBe(
      "observed-raob",
    );
    expect(GOSHEN_2009_OBSERVED_RECORD.provenance.validTime).toBe(
      "2009-06-05 21:55:22 UTC",
    );
    expect(goshenObservedEnvironmentSrc).toMatch(/nssl1Goshen2155Record/);
    expect(goshenObservedEnvironmentSrc).toMatch(
      /nssl1Goshen2155\.normalized\.json/,
    );
    expect(goshenObservedEnvironmentSrc).not.toMatch(
      /ingestNssl1Goshen2155Esc/,
    );
    expect(appSrc).not.toMatch(/ingestNssl1Goshen2155Esc/);
    expect(appSrc).not.toMatch(/NSSL_MGAUS_20090605\.cls/);
    expect(createExploreLabSrc).not.toMatch(/ingestNssl1Goshen2155Esc/);
  });

  it("builds the Goshen hodograph from imported knots, not DEMO", () => {
    const goshenPoints = hodographPoints(GOSHEN_2009_OBSERVED_RECORD.profile);
    const demoPoints = createDemoHodographPoints();
    expect(goshenPoints).toHaveLength(2029);
    expect(demoPoints).toHaveLength(5);
    expect(goshenPoints[0]).toEqual({
      height: 2.4,
      eastward: -1.2,
      northward: 0.2,
    });
    expect(goshenPoints[goshenPoints.length - 1]).toEqual({
      height: 12261.8,
      eastward: 26.8,
      northward: 5.7,
    });
    expect(goshenPoints).not.toEqual(demoPoints);
    expect(appSrc).toMatch(/hodographPoints\(activeProfile\)/);
  });

  it("changes the environmental operand and T_tilt,y relative to DEMO", () => {
    const demo = composeDemoTracerFields(
      IntegrationFrame.StormRelativeLaboratory,
    );
    const goshen = composeDemoTracerFields(
      IntegrationFrame.StormRelativeLaboratory,
      GOSHEN_2009_OBSERVED_RECORD.profile,
    );
    expect(goshen.environmentField.sample(INTERIOR, 0)).not.toEqual(
      demo.environmentField.sample(INTERIOR, 0),
    );
    const demoLab = createExploreLab(
      fakeSlots(),
      EXPLORE_ENVIRONMENT_DEMO_PRESCRIBED,
    );
    const goshenLab = createExploreLab(
      fakeSlots(),
      EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
    );
    expect(goshenLab.tiltingTendency.sample(INTERIOR, 0)).not.toBe(
      demoLab.tiltingTendency.sample(INTERIOR, 0),
    );
    expect(goshenLab.velocityObservation.total.sample(INTERIOR, 0)).not.toEqual(
      demoLab.velocityObservation.total.sample(INTERIOR, 0),
    );
  });

  it("keeps storm operands 2–7 and prescribed C as DEMO", () => {
    const demo = composeDemoTracerFields(
      IntegrationFrame.StormRelativeLaboratory,
    );
    const goshen = composeDemoTracerFields(
      IntegrationFrame.StormRelativeLaboratory,
      GOSHEN_2009_OBSERVED_RECORD.profile,
    );
    expect(DEMO_VELOCITY_CONTRIBUTION_KEYS.slice(1)).toEqual([
      "updraft",
      "rotation",
      "lowerInflow",
      "upperOutflow",
      "downdraft",
      "nearGroundOutflow",
    ]);
    expect(goshen.updraftField.sample(INTERIOR, 0)).toEqual(
      demo.updraftField.sample(INTERIOR, 0),
    );
    expect(goshen.rotationField.sample(INTERIOR, 0)).toEqual(
      demo.rotationField.sample(INTERIOR, 0),
    );
    expect(goshen.lowerRadialInflowField.sample(INTERIOR, 0)).toEqual(
      demo.lowerRadialInflowField.sample(INTERIOR, 0),
    );
    expect(goshen.upperRadialOutflowField.sample(INTERIOR, 0)).toEqual(
      demo.upperRadialOutflowField.sample(INTERIOR, 0),
    );
    expect(goshen.downdraftField.sample(INTERIOR, 0)).toEqual(
      demo.downdraftField.sample(INTERIOR, 0),
    );
    expect(goshen.nearGroundOutflowField.sample(INTERIOR, 0)).toEqual(
      demo.nearGroundOutflowField.sample(INTERIOR, 0),
    );

    const ground = composeDemoTracerFields(
      IntegrationFrame.GroundRelativeWindTunnel,
      GOSHEN_2009_OBSERVED_RECORD.profile,
    );
    for (const point of [INTERIOR, { x: 0, y: 1000, z: 0 }]) {
      const groundTotal = ground.field.sample(point, 0);
      const relativeTotal = goshen.field.sample(point, 0);
      expect(relativeTotal.x - groundTotal.x).toBe(-10);
      expect(relativeTotal.y - groundTotal.y).toBe(0);
      expect(relativeTotal.z - groundTotal.z).toBe(0);
    }
    expect(composeDemoTracerSimulationSrc).toMatch(/DEMO_SCENARIO\.stormMotion/);
  });

  it("names observed RAOB vs prescribed storm/C and does not claim reconstruction", () => {
    const html = renderToStaticMarkup(
      <EnvironmentSurface
        open={true}
        points={hodographPoints(GOSHEN_2009_OBSERVED_RECORD.profile)}
        stormMotion={DEMO_SCENARIO.stormMotion}
        overlayVisibility={DEFAULT_HODOGRAPH_OVERLAY_VISIBILITY}
        onOverlayVisibilityChange={() => {}}
        onClose={() => {}}
        panelGeometry={INITIAL_HODOGRAPH_PANEL_GEOMETRY}
        onPanelGeometryChange={() => {}}
        plotView={DEFAULT_HODOGRAPH_PLOT_VIEW}
        onPlotViewChange={() => {}}
        boundsElementRef={{ current: null }}
        environmentIdentity={EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED}
      />,
    );
    expect(html).toContain(GOSHEN_2009_OBSERVED_ENVIRONMENT_LABEL);
    expect(html).toContain(GOSHEN_OBSERVED_ENVIRONMENT_COPY);
    expect(html).toContain(GOSHEN_PRESCRIBED_STORM_COPY);
    expect(html).toContain(GOSHEN_SANDBOX_ANTI_CLAIM);
    expect(html).toContain("VORTEX2 / NSSL1 / Bushnell");
    expect(html).toContain(
      "NOT a simulation or reconstruction of the Goshen supercell",
    );
    expect(html).not.toMatch(/reconstructs the Goshen/i);
    expect(html).not.toMatch(/historical Goshen storm/i);
    expect(html).not.toMatch(/observed storm motion/i);
    expect(html).not.toContain("Hodograph overlays");
    expect(html).not.toContain("Storm-relative wind V_sr");
    expect(html).not.toContain("Horizontal vorticity ω_h");
    expect(html).not.toContain("Streamwise / crosswise vorticity");
    expect(html).not.toMatch(/disabled/);
  });

  it("does not apply the DEMO [0, 1000] overlay recipe to Goshen", () => {
    expect(() =>
      verticalWindShearBetween(GOSHEN_2009_OBSERVED_RECORD.profile, 0, 1000),
    ).toThrow();
    expect(appSrc).toMatch(
      /observedExploreActive\s*\?\s*undefined\s*:\s*createDemoVorticityLayer\(\)/,
    );
    expect(appSrc).toMatch(
      /observedExploreActive\s*\?\s*undefined\s*:\s*createDemoStreamwiseCrosswiseOverlay\(\)/,
    );
    expect(appSrc).toMatch(
      /observedExploreActive \? undefined : DEMO_SELECTED_HEIGHT/,
    );
    expect(appSrc).not.toMatch(/createDemoVorticityLayer\(.*Goshen/s);
  });

  it("rebuilds the Explore lab when environment identity changes", () => {
    const demoLab = createExploreLab(
      fakeSlots(),
      EXPLORE_ENVIRONMENT_DEMO_PRESCRIBED,
    );
    const goshenLab = createExploreLab(
      fakeSlots(),
      EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
    );
    expect(goshenLab.simulation).not.toBe(demoLab.simulation);
    expect(goshenLab.tiltingTendency.profile.minHeight).toBe(2.4);
    expect(demoLab.tiltingTendency.profile.minHeight).toBe(0);
    expect(appSrc).toMatch(/const selectExploreEnvironment/);
    expect(appSrc).toMatch(/selectExploreEnvironment[\s\S]*createExploreLab\(/s);
    expect(appSrc).toMatch(
      /enterExplore[\s\S]*createExploreLab\(\s*sceneSlotsRef\.current!,\s*exploreEnvironmentIdentity/s,
    );
  });

  it("thins Goshen display markers without resampling the polyline", () => {
    const points = hodographPoints(GOSHEN_2009_OBSERVED_RECORD.profile);
    const html = renderToStaticMarkup(
      <HodographPanel points={points} stormMotion={DEMO_SCENARIO.stormMotion} />,
    );
    const displayIndices = hodographDisplayKnotIndices(points);
    const polylineTag = html.match(/<polyline\b[^>]*>/)?.[0];
    const polylinePoints = polylineTag?.match(/points="([^"]+)"/)?.[1] ?? "";
    const markers = html.match(/hodograph-panel__marker/g) ?? [];
    const labels = html.match(/hodograph-panel__height-label/g) ?? [];

    expect(points).toHaveLength(2029);
    expect(html.match(/hodograph-panel__polyline/g)).toHaveLength(1);
    expect(polylinePoints.split(" ").filter(Boolean)).toHaveLength(2029);
    expect(markers.length).toBe(displayIndices.size);
    expect(labels.length).toBe(markers.length);
    expect(markers.length).toBeGreaterThan(2);
    expect(markers.length).toBeLessThan(30);
    expect(markers.length).toBeLessThan(points.length);
    expect(html).toContain("2.4 m");
    expect(html).toContain("12261.8 m");
  });
});
