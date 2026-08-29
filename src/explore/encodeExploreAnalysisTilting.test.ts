import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { createExploreLab } from "../app/createExploreLab.js";
import { createGuidedLab } from "../app/createGuidedLab.js";
import {
  DUMAS_2010_ANALYSIS_COLUMN,
  GOSHEN_2009_ANALYSIS_COLUMN,
  PROSPECT_VALLEY_2010_ANALYSIS_COLUMN,
} from "../app/exploreEnvironmentRepresentations.js";
import type { ExploreSceneSlots } from "./ExplorePointReleaseOrchestration.js";
import {
  EXPLORE_ENVIRONMENT_DEMO_PRESCRIBED,
  EXPLORE_ENVIRONMENT_DUMAS_2010_OBSERVED,
  EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
  EXPLORE_ENVIRONMENT_MOORE_2013_OBSERVED,
  EXPLORE_ENVIRONMENT_PROSPECT_VALLEY_2010_OBSERVED,
} from "./exploreEnvironmentIdentity.js";
import {
  encodeExploreAnalysisTiltingAlongHistory,
  encodeExploreAnalysisTiltingForPathHistory,
  exploreAnalysisTiltingHistoryFingerprint,
} from "./encodeExploreAnalysisTilting.js";
import encoderSrc from "./encodeExploreAnalysisTilting.ts?raw";
import { projectAnalysisTiltingAlongRecordedPath } from "../data/escHrTimeAnalysis/trajectoryTiltingProjection.js";
import { T1_COLOR_SCALE_V1 } from "../data/escHrTimeAnalysis/t1ColorScaleV1.js";
import { GuidedExperimentId } from "../guided/GuidedExperiment.js";
import { DEMO_SCENARIO } from "../scenario/DEMO_SCENARIO.js";
import { TracerPathHistory } from "../simulation/TracerPathHistory.js";
import type { PathHistorySample } from "../simulation/TracerPathHistory.js";
import {
  createTrajectoryTiltingOverlay,
  disposeTrajectoryTiltingOverlay,
  syncTrajectoryTiltingOverlay,
} from "../rendering/trajectoryTiltingOverlay.js";
import { ANALYSIS_T1_VALUE_APPEARANCE_V1 } from "../rendering/analysisT1ValueAppearanceV1.js";
import appearanceSrc from "../rendering/analysisT1ValueAppearanceV1.ts?raw";
import overlaySrc from "../rendering/trajectoryTiltingOverlay.ts?raw";
import tracerSceneSrc from "../rendering/TracerScene.ts?raw";
import pickSrc from "../rendering/pickPathHistorySample.ts?raw";
import trailSrc from "../rendering/trailGeometry.ts?raw";
import viewportSrc from "../ui/tracer/TracerViewport.tsx?raw";
import appSrc from "../app/App.tsx?raw";
import createExploreLabSrc from "../app/createExploreLab.ts?raw";
import createGuidedLabSrc from "../app/createGuidedLab.ts?raw";
import simulationSrc from "../simulation/Simulation.ts?raw";
import pathHistorySrc from "../simulation/TracerPathHistory.ts?raw";

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

const INTERIOR: PathHistorySample[] = [
  { position: { x: -2000, y: 2000, z: 0 }, simulationTime: 0 },
  { position: { x: -1990, y: 2010, z: 10 }, simulationTime: 0.1 },
  { position: { x: -1980, y: 2020, z: 20 }, simulationTime: 0.2 },
];

const OOD_THEN_FULL: PathHistorySample[] = [
  { position: { x: 0, y: 2000, z: 0 }, simulationTime: 0 },
  { position: { x: 10, y: 2010, z: 0 }, simulationTime: 0.1 },
  { position: { x: 20, y: -50, z: 0 }, simulationTime: 0.2 },
  { position: { x: 30, y: -60, z: 0 }, simulationTime: 0.3 },
  { position: { x: 40, y: 2000, z: 0 }, simulationTime: 0.4 },
  { position: { x: 50, y: 2010, z: 0 }, simulationTime: 0.5 },
];

function lineOf(overlay: THREE.Group, name: string): THREE.LineSegments {
  const object = overlay.getObjectByName(name);
  if (!(object instanceof THREE.LineSegments)) {
    throw new Error(`missing ${name}`);
  }
  return object;
}

function vertexColors(line: THREE.LineSegments, vertexCount: number): number[][] {
  const array = line.geometry.getAttribute("color")!.array;
  const rows: number[][] = [];
  for (let i = 0; i < vertexCount; i++) {
    rows.push([array[i * 3]!, array[i * 3 + 1]!, array[i * 3 + 2]!]);
  }
  return rows;
}

function countTimeIdentity(history: TracerPathHistory): string {
  const parts = [String(history.tracerCount)];
  for (let slotIndex = 0; slotIndex < history.tracerCount; slotIndex++) {
    const samples = history.samplesFor(slotIndex);
    const last = samples[samples.length - 1];
    parts.push(
      String(samples.length),
      last === undefined ? "" : String(last.simulationTime),
    );
  }
  return parts.join("|");
}

function recordPath(
  history: TracerPathHistory,
  samples: readonly PathHistorySample[],
): void {
  const first = samples[0]!;
  history.captureInitial(
    [{ position: first.position, age: 0, active: true }],
    first.simulationTime,
  );
  for (let i = 1; i < samples.length; i++) {
    const sample = samples[i]!;
    history.recordAfterStep(
      [{ position: sample.position, age: 0, active: true }],
      sample.simulationTime,
    );
  }
}

function firstSegmentPositions(overlay: THREE.Group): number[] {
  for (const name of [
    "analysisTiltingFullValue",
    "analysisTiltingBoundaryValue",
  ] as const) {
    const line = lineOf(overlay, name);
    if (line.geometry.drawRange.count >= 2) {
      const array = line.geometry.getAttribute("position")!.array;
      return Array.from(array.slice(0, 6));
    }
  }
  throw new Error("no drawable Analysis overlay segment");
}

describe("encodeExploreAnalysisTiltingAlongHistory", () => {
  it("pairs Goshen / Prospect / Dumas recorded samples with matching Analysis T1_COLOR_SCALE_V1 encodings", () => {
    const labs = [
      {
        identity: EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
        column: GOSHEN_2009_ANALYSIS_COLUMN,
      },
      {
        identity: EXPLORE_ENVIRONMENT_PROSPECT_VALLEY_2010_OBSERVED,
        column: PROSPECT_VALLEY_2010_ANALYSIS_COLUMN,
      },
      {
        identity: EXPLORE_ENVIRONMENT_DUMAS_2010_OBSERVED,
        column: DUMAS_2010_ANALYSIS_COLUMN,
      },
    ] as const;

    for (const spec of labs) {
      const lab = createExploreLab(fakeSlots(), spec.identity);
      const encoding = encodeExploreAnalysisTiltingAlongHistory(
        INTERIOR,
        lab.analysisColumn,
        lab.tiltingTendency.updraft,
      );
      const projection = projectAnalysisTiltingAlongRecordedPath(
        INTERIOR,
        spec.column,
        lab.tiltingTendency.updraft,
      );

      expect(lab.analysisColumn).toBe(spec.column);
      expect(encoding.samples).toHaveLength(3);
      expect(encoding.valueSegments.length).toBeGreaterThan(0);
      for (let i = 0; i < encoding.samples.length; i++) {
        const sample = encoding.samples[i]!;
        const projected = projection[i]!;
        expect(sample.historyIndex).toBe(i);
        expect(sample.historyIndex).toBe(projected.historyIndex);
        expect(sample.position).toEqual(INTERIOR[i]!.position);
        if (
          sample.status === "FULL_SUPPORT" ||
          sample.status === "BOUNDARY_CONDITIONED"
        ) {
          expect(projected.analysis.status).toBe(sample.status);
          if (
            projected.analysis.status === "FULL_SUPPORT" ||
            projected.analysis.status === "BOUNDARY_CONDITIONED"
          ) {
            expect(sample.tiltingTendency).toBe(
              projected.analysis.tiltingTendency,
            );
            expect(sample.signedUnit).toBe(
              T1_COLOR_SCALE_V1.signedUnitFromTiltingTendency(
                projected.analysis.tiltingTendency,
              ),
            );
          }
        }
      }
      for (const segment of encoding.valueSegments) {
        const owner = encoding.samples[segment.ownerHistoryIndex]!;
        expect(owner.status).toBe(segment.support);
        if (
          owner.status === "FULL_SUPPORT" ||
          owner.status === "BOUNDARY_CONDITIONED"
        ) {
          expect(segment.signedUnit).toBe(owner.signedUnit);
        }
      }
      expect(encoderSrc).toMatch(/T1_COLOR_SCALE_V1/);
      expect(encoderSrc).not.toMatch(/signedUnitFromTiltingTendency\(/);
    }
  });

  it("does not create an Analysis overlay encoding for Moore, Demo, or Guided", () => {
    const moore = createExploreLab(
      fakeSlots(),
      EXPLORE_ENVIRONMENT_MOORE_2013_OBSERVED,
    );
    const demo = createExploreLab(
      fakeSlots(),
      EXPLORE_ENVIRONMENT_DEMO_PRESCRIBED,
    );
    const guided = createGuidedLab(GuidedExperimentId.InflowToUpperOutflow);
    const history = new TracerPathHistory(0);
    history.appendParticle(
      { position: INTERIOR[0]!.position, age: 0, active: true },
      0,
    );
    history.recordAfterStep(
      [{ position: INTERIOR[1]!.position, age: 0.1, active: true }],
      0.1,
    );

    expect(moore.analysisColumn).toBeNull();
    expect(demo.analysisColumn).toBeNull();
    expect(
      encodeExploreAnalysisTiltingForPathHistory(
        history,
        moore.analysisColumn,
        moore.tiltingTendency.updraft,
      ),
    ).toBeNull();
    expect(
      encodeExploreAnalysisTiltingForPathHistory(
        history,
        demo.analysisColumn,
        demo.tiltingTendency.updraft,
      ),
    ).toBeNull();
    expect(
      encodeExploreAnalysisTiltingAlongHistory(
        INTERIOR,
        null,
        moore.tiltingTendency.updraft,
      ),
    ).toEqual({ samples: [], valueSegments: [] });
    expect(guided).not.toHaveProperty("analysisColumn");
    expect(createGuidedLabSrc).not.toMatch(/encodeExploreAnalysisTilting/);
  });

  it("does not fall back to Source T1 or map OOD/COLUMN to zero", () => {
    const lab = createExploreLab(
      fakeSlots(),
      EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
    );
    const encoding = encodeExploreAnalysisTiltingAlongHistory(
      INTERIOR,
      lab.analysisColumn,
      lab.tiltingTendency.updraft,
    );
    const sourceT1 = lab.tiltingTendency.sample(INTERIOR[0]!.position, 0);
    const analysis = encoding.samples[0]!;
    expect(analysis.status).not.toBe("COLUMN_UNAVAILABLE");
    expect(analysis.status).not.toBe("OUT_OF_DOMAIN");
    if (
      analysis.status === "FULL_SUPPORT" ||
      analysis.status === "BOUNDARY_CONDITIONED"
    ) {
      expect(analysis.tiltingTendency).not.toBe(sourceT1);
    }

    const unavailable = encodeExploreAnalysisTiltingAlongHistory(
      INTERIOR,
      null,
      lab.tiltingTendency.updraft,
    );
    expect(unavailable.valueSegments).toEqual([]);
    expect(unavailable.samples).toEqual([]);
    expect(unavailable.samples.some((sample) => "tiltingTendency" in sample && sample.tiltingTendency === 0)).toBe(
      false,
    );
  });

  it("keeps FULL segments, types BOUNDARY, and does not bridge OOD gaps", () => {
    const lab = createExploreLab(
      fakeSlots(),
      EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
    );
    const updraft = lab.tiltingTendency.updraft;
    const interior = encodeExploreAnalysisTiltingAlongHistory(
      INTERIOR,
      lab.analysisColumn,
      updraft,
    );
    expect(
      interior.samples.every(
        (sample) =>
          sample.status === "FULL_SUPPORT" ||
          sample.status === "BOUNDARY_CONDITIONED",
      ),
    ).toBe(true);
    expect(interior.valueSegments.length).toBe(interior.samples.length - 1);

    const nearSurface: PathHistorySample[] = [
      { position: { x: 0, y: 2.4, z: 0 }, simulationTime: 0 },
      { position: { x: 10, y: 2.4, z: 0 }, simulationTime: 0.1 },
    ];
    const boundary = encodeExploreAnalysisTiltingAlongHistory(
      nearSurface,
      lab.analysisColumn,
      updraft,
    );
    expect(boundary.samples[0]!.status).toBe("BOUNDARY_CONDITIONED");
    expect(boundary.valueSegments[0]!.support).toBe("BOUNDARY_CONDITIONED");

    const gapped = encodeExploreAnalysisTiltingAlongHistory(
      OOD_THEN_FULL,
      lab.analysisColumn,
      updraft,
    );
    expect(gapped.samples[2]!.status).toBe("OUT_OF_DOMAIN");
    expect(gapped.samples[3]!.status).toBe("OUT_OF_DOMAIN");
    expect(
      gapped.valueSegments.some(
        (segment) =>
          segment.ownerHistoryIndex === 1 || segment.nextHistoryIndex === 2,
      ),
    ).toBe(false);
    expect(
      gapped.valueSegments.some(
        (segment) =>
          segment.ownerHistoryIndex === 4 && segment.nextHistoryIndex === 5,
      ),
    ).toBe(true);
  });

  it("does not normalize per trajectory and uses owner historyIndex i for segment [i,i+1]", () => {
    const lab = createExploreLab(
      fakeSlots(),
      EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
    );
    const short = encodeExploreAnalysisTiltingAlongHistory(
      INTERIOR.slice(0, 2),
      lab.analysisColumn,
      lab.tiltingTendency.updraft,
    );
    const longer = encodeExploreAnalysisTiltingAlongHistory(
      INTERIOR,
      lab.analysisColumn,
      lab.tiltingTendency.updraft,
    );
    const owner = longer.valueSegments[0]!;
    expect(owner.ownerHistoryIndex).toBe(0);
    expect(owner.nextHistoryIndex).toBe(1);
    if (
      short.samples[0]!.status === "FULL_SUPPORT" ||
      short.samples[0]!.status === "BOUNDARY_CONDITIONED"
    ) {
      expect(short.samples[0]!.signedUnit).toBe(
        (longer.samples[0] as { signedUnit: number }).signedUnit,
      );
      expect(owner.signedUnit).toBe(short.samples[0]!.signedUnit);
    }
    expect(encoderSrc).not.toMatch(/min\(|max\(|extrema|normalize/i);
  });
});

describe("Explore Analysis T1 overlay observe layer", () => {
  it("draws identical endpoint colors from T1_COLOR_SCALE_V1 and production appearance", () => {
    const lab = createExploreLab(
      fakeSlots(),
      EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
    );
    const encoding = encodeExploreAnalysisTiltingAlongHistory(
      INTERIOR,
      lab.analysisColumn,
      lab.tiltingTendency.updraft,
    );
    const overlay = createTrajectoryTiltingOverlay();
    syncTrajectoryTiltingOverlay(
      overlay,
      encoding,
      ANALYSIS_T1_VALUE_APPEARANCE_V1,
    );
    expect(overlay.visible).toBe(true);
    const full = lineOf(overlay, "analysisTiltingFullValue");
    expect(full.geometry.drawRange.count).toBeGreaterThan(0);
    const colors = vertexColors(full, 2);
    expect(colors[0]).toEqual(colors[1]);
    const owner = encoding.valueSegments[0]!;
    const expected = ANALYSIS_T1_VALUE_APPEARANCE_V1.linearRgbFromSignedUnit(
      owner.signedUnit,
    );
    expect(colors[0]).toEqual(
      Array.from(new Float32Array([expected.r, expected.g, expected.b])),
    );
    expect(full.raycast).not.toBe(THREE.LineSegments.prototype.raycast);
    const raycaster = new THREE.Raycaster(
      new THREE.Vector3(0, 0, 10),
      new THREE.Vector3(0, 0, -1),
    );
    expect(raycaster.intersectObject(full, false)).toEqual([]);
    disposeTrajectoryTiltingOverlay(overlay);
  });

  it("puts BOUNDARY-owned segments on the support object without inventing a value hue", () => {
    const lab = createExploreLab(
      fakeSlots(),
      EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
    );
    const encoding = encodeExploreAnalysisTiltingAlongHistory(
      [
        { position: { x: 0, y: 2.4, z: 0 }, simulationTime: 0 },
        { position: { x: 10, y: 2.4, z: 0 }, simulationTime: 0.1 },
      ],
      lab.analysisColumn,
      lab.tiltingTendency.updraft,
    );
    const overlay = createTrajectoryTiltingOverlay();
    syncTrajectoryTiltingOverlay(
      overlay,
      encoding,
      ANALYSIS_T1_VALUE_APPEARANCE_V1,
    );
    expect(encoding.valueSegments[0]!.support).toBe("BOUNDARY_CONDITIONED");
    expect(lineOf(overlay, "analysisTiltingBoundaryValue").visible).toBe(true);
    expect(lineOf(overlay, "analysisTiltingFullValue").visible).toBe(false);
    disposeTrajectoryTiltingOverlay(overlay);
  });

  it("hides overlay geometry when history is cleared and grows when samples append", () => {
    const lab = createExploreLab(
      fakeSlots(),
      EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
    );
    lab.session.releasePoint({ x: -2000, y: 2000, z: 0 });
    const birth = encodeExploreAnalysisTiltingForPathHistory(
      lab.pathHistory,
      lab.analysisColumn,
      lab.tiltingTendency.updraft,
    )!;
    expect(birth[0]!.valueSegments).toEqual([]);

    lab.simulation.step(DEMO_SCENARIO.simulation.timestep);
    lab.pathHistory.recordAfterStep(
      lab.simulation.particles,
      lab.simulation.clock.time,
    );
    lab.simulation.step(DEMO_SCENARIO.simulation.timestep);
    lab.pathHistory.recordAfterStep(
      lab.simulation.particles,
      lab.simulation.clock.time,
    );
    const stepped = encodeExploreAnalysisTiltingForPathHistory(
      lab.pathHistory,
      lab.analysisColumn,
      lab.tiltingTendency.updraft,
    )!;
    expect(stepped[0]!.samples.length).toBeGreaterThan(birth[0]!.samples.length);
    expect(stepped[0]!.valueSegments.length).toBeGreaterThan(0);

    lab.pathHistory.clear();
    const cleared = encodeExploreAnalysisTiltingForPathHistory(
      lab.pathHistory,
      lab.analysisColumn,
      lab.tiltingTendency.updraft,
    )!;
    expect(cleared[0]!.valueSegments).toEqual([]);
    expect(cleared[0]!.samples).toEqual([]);
  });

  it("changes fingerprint and encoding when the environment identity changes", () => {
    const history = new TracerPathHistory(0);
    history.appendParticle(
      { position: INTERIOR[0]!.position, age: 0, active: true },
      0,
    );
    history.recordAfterStep(
      [{ position: INTERIOR[1]!.position, age: 0.1, active: true }],
      0.1,
    );
    const goshen = createExploreLab(
      fakeSlots(),
      EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
    );
    const prospect = createExploreLab(
      fakeSlots(),
      EXPLORE_ENVIRONMENT_PROSPECT_VALLEY_2010_OBSERVED,
    );
    const moore = createExploreLab(
      fakeSlots(),
      EXPLORE_ENVIRONMENT_MOORE_2013_OBSERVED,
    );
    const demo = createExploreLab(
      fakeSlots(),
      EXPLORE_ENVIRONMENT_DEMO_PRESCRIBED,
    );

    const goshenEnc = encodeExploreAnalysisTiltingForPathHistory(
      history,
      goshen.analysisColumn,
      goshen.tiltingTendency.updraft,
    )!;
    const prospectEnc = encodeExploreAnalysisTiltingForPathHistory(
      history,
      prospect.analysisColumn,
      prospect.tiltingTendency.updraft,
    )!;
    expect(
      exploreAnalysisTiltingHistoryFingerprint(
        history,
        goshen.analysisColumn,
      ),
    ).not.toBe(
      exploreAnalysisTiltingHistoryFingerprint(
        history,
        prospect.analysisColumn,
      ),
    );
    expect(goshenEnc[0]!.samples[0]).not.toEqual(prospectEnc[0]!.samples[0]);
    expect(
      encodeExploreAnalysisTiltingForPathHistory(
        history,
        moore.analysisColumn,
        moore.tiltingTendency.updraft,
      ),
    ).toBeNull();
    expect(
      encodeExploreAnalysisTiltingForPathHistory(
        history,
        demo.analysisColumn,
        demo.tiltingTendency.updraft,
      ),
    ).toBeNull();
    expect(
      exploreAnalysisTiltingHistoryFingerprint(history, null),
    ).toBe("column-unavailable");
  });

  it("refreshes overlay when history is replaced at the same count and last time", () => {
    const pathB: PathHistorySample[] = [
      { position: { x: 2000, y: 2000, z: 0 }, simulationTime: 0 },
      { position: { x: 2010, y: 2010, z: 10 }, simulationTime: 0.1 },
      { position: { x: 2020, y: 2020, z: 20 }, simulationTime: 0.2 },
    ];
    const lab = createExploreLab(
      fakeSlots(),
      EXPLORE_ENVIRONMENT_GOSHEN_2009_OBSERVED,
    );
    const history = new TracerPathHistory(1);
    recordPath(history, INTERIOR);

    const countTimeA = countTimeIdentity(history);
    let fingerprint = exploreAnalysisTiltingHistoryFingerprint(
      history,
      lab.analysisColumn,
    );
    const overlay = createTrajectoryTiltingOverlay();
    const encodingsA = encodeExploreAnalysisTiltingForPathHistory(
      history,
      lab.analysisColumn,
      lab.tiltingTendency.updraft,
    )!;
    expect(encodingsA[0]!.valueSegments.length).toBeGreaterThan(0);
    syncTrajectoryTiltingOverlay(
      overlay,
      encodingsA[0]!,
      ANALYSIS_T1_VALUE_APPEARANCE_V1,
    );
    const positionsA = firstSegmentPositions(overlay);
    expect(positionsA.slice(0, 3)).toEqual([-2000, 2000, 0]);

    history.clear();
    recordPath(history, pathB);
    expect(countTimeIdentity(history)).toBe(countTimeA);
    expect(history.samplesFor(0).map((sample) => sample.position)).not.toEqual(
      INTERIOR.map((sample) => sample.position),
    );

    const nextFingerprint = exploreAnalysisTiltingHistoryFingerprint(
      history,
      lab.analysisColumn,
    );
    expect(nextFingerprint).not.toBe(fingerprint);
    expect(nextFingerprint).toBe(
      `${lab.analysisColumn!.provenance.sourceIdentity}|${history.revision}`,
    );

    if (nextFingerprint !== fingerprint) {
      fingerprint = nextFingerprint;
      const encodingsB = encodeExploreAnalysisTiltingForPathHistory(
        history,
        lab.analysisColumn,
        lab.tiltingTendency.updraft,
      )!;
      syncTrajectoryTiltingOverlay(
        overlay,
        encodingsB[0]!,
        ANALYSIS_T1_VALUE_APPEARANCE_V1,
      );
    }
    const positionsB = firstSegmentPositions(overlay);
    expect(positionsB.slice(0, 3)).toEqual([2000, 2000, 0]);
    expect(positionsB).not.toEqual(positionsA);
    disposeTrajectoryTiltingOverlay(overlay);
  });
});

describe("I2 wiring: overlay observe-only, picking unchanged, I3 unwired", () => {
  it("injects T1_COLOR_SCALE_V1 in the Explore encoder, not in the renderer", () => {
    expect(encoderSrc).toMatch(/projectAnalysisTiltingAlongRecordedPath/);
    expect(encoderSrc).toMatch(/encodeTrajectoryTiltingForRender/);
    expect(encoderSrc).toMatch(/T1_COLOR_SCALE_V1/);
    expect(encoderSrc).toMatch(/pathHistory\.revision/);
    expect(tracerSceneSrc).toMatch(/syncAnalysisTiltingOverlays/);
    expect(tracerSceneSrc).toMatch(/createTrajectoryTiltingOverlay/);
    expect(tracerSceneSrc).toMatch(/ANALYSIS_T1_VALUE_APPEARANCE_V1/);
    expect(tracerSceneSrc).not.toMatch(/queryAnalysisTilting/);
    expect(tracerSceneSrc).not.toMatch(/projectAnalysisTiltingAlongRecordedPath/);
    expect(tracerSceneSrc).not.toMatch(/T1_COLOR_SCALE_V1/);
    expect(overlaySrc).not.toMatch(/queryAnalysisTilting/);
    expect(overlaySrc).not.toMatch(/T1_COLOR_SCALE_V1/);
    expect(appearanceSrc).not.toMatch(/T1_COLOR_SCALE_V1/);
    expect(appearanceSrc).not.toMatch(/tiltingTendency/);
  });

  it("keeps occupancy trails and historical picking independent of the overlay", () => {
    expect(tracerSceneSrc).toMatch(/syncTrailLine/);
    expect(trailSrc).toMatch(/createTrailLine/);
    expect(pickSrc).not.toMatch(/trajectoryTiltingOverlay/);
    expect(pickSrc).not.toMatch(/analysisTilting/);
    expect(pickSrc).toMatch(/pathHistory\.pointsFor/);
    expect(viewportSrc).toMatch(/pickPathHistorySampleAtClientPoint/);
    expect(viewportSrc).toMatch(/syncFromPathHistory/);
    expect(viewportSrc).toMatch(/syncAnalysisTiltingOverlays/);
    expect(pathHistorySrc).not.toMatch(/tiltingTendency/);
    expect(pathHistorySrc).not.toMatch(/analysisColumn/);
  });

  it("wires Explore Analysis column into the viewport and not Guided/Simulation", () => {
    expect(appSrc).toMatch(/analysisColumn=\{explore\?\.analysisColumn \?\? null\}/);
    expect(appSrc).toMatch(/analysisUpdraft=\{/);
    expect(appSrc).toMatch(/Analysis T1 along recorded path/);
    expect(appSrc).not.toMatch(/projectAnalysisTiltingAlongRecordedPath/);
    expect(appSrc).not.toMatch(/trajectoryTiltingOverlay/);
    expect(viewportSrc).toMatch(/encodeExploreAnalysisTiltingForPathHistory/);
    expect(createExploreLabSrc).not.toMatch(
      /projectAnalysisTiltingAlongRecordedPath/,
    );
    expect(createGuidedLabSrc).not.toMatch(/analysisColumn/);
    expect(createGuidedLabSrc).not.toMatch(/encodeExploreAnalysisTilting/);
    expect(simulationSrc).not.toMatch(/analysisColumn/);
    expect(simulationSrc).not.toMatch(/encodeExploreAnalysisTilting/);
  });

  it("does not wire I3 glyph, verification, or what-if", () => {
    expect(appSrc).not.toMatch(/trajectoryTiltingGlyph/);
    expect(appSrc).not.toMatch(/TrajectoryTiltingVerificationPanel/);
    expect(appSrc).not.toMatch(/TrajectoryTiltingWhatIfPanel/);
    expect(appSrc).not.toMatch(/trajectoryTiltingWhatIfGlyph/);
    expect(viewportSrc).not.toMatch(/trajectoryTiltingGlyph/);
    expect(viewportSrc).not.toMatch(/TrajectoryTiltingVerificationPanel/);
    expect(viewportSrc).not.toMatch(/TrajectoryTiltingWhatIfPanel/);
    expect(tracerSceneSrc).not.toMatch(/trajectoryTiltingGlyph/);
    expect(tracerSceneSrc).not.toMatch(/trajectoryTiltingWhatIfGlyph/);
    expect(encoderSrc).not.toMatch(/createTrajectoryTiltingGlyphModel/);
    expect(encoderSrc).not.toMatch(/createTrajectoryTiltingWhatIfModel/);
  });
});
