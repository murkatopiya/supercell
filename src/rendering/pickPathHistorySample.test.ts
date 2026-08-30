import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { TracerPathHistory } from "../simulation/TracerPathHistory.js";
import type { TracerAdvectionState } from "../simulation/TracerParticle.js";
import type { Vec3 } from "../core/math/Vec3.js";
import {
  PICK_TOLERANCE_PX,
  projectWorldPointToCanvasPixels,
} from "./pickVisibleTracerSlot.js";
import {
  choosePathHistorySampleWinner,
  pickPathHistorySampleByScreenDistance,
  type PathHistorySampleHit,
} from "./pickPathHistorySample.js";
import pickSrc from "./pickPathHistorySample.ts?raw";
import pickVisibleSrc from "./pickVisibleTracerSlot.ts?raw";
import viewportSrc from "../ui/tracer/TracerViewport.tsx?raw";

const CANVAS_W = 800;
const CANVAS_H = 600;

function perspectiveLookingAtOrigin(cameraZ: number): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(50, CANVAS_W / CANVAS_H, 1, 1e6);
  camera.position.set(0, 0, cameraZ);
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld(true);
  return camera;
}

function particleAt(position: Vec3): TracerAdvectionState {
  return { position, age: 0, active: true } as TracerAdvectionState;
}

/** Lanes are given as explicit chronological point lists. */
function historyOfLanes(lanes: readonly (readonly Vec3[])[]): TracerPathHistory {
  const history = new TracerPathHistory(lanes.length);
  const particles = lanes.map((lane) =>
    particleAt(lane[0] ?? { x: 0, y: 0, z: 0 }),
  );
  history.captureInitial(particles, 0);
  const longest = Math.max(0, ...lanes.map((lane) => lane.length));
  for (let step = 1; step < longest; step += 1) {
    for (let i = 0; i < particles.length; i += 1) {
      const lane = lanes[i]!;
      // Hold the last point so shorter lanes stop growing in content.
      particles[i]!.position = lane[Math.min(step, lane.length - 1)]!;
    }
    history.recordAfterStep(particles, step * 0.1);
  }
  return history;
}

/**
 * The pre-slice algorithm: pointsFor snapshot, per-point projection helper,
 * then the array winner. Kept in the test as the semantics oracle.
 */
function oraclePick(
  pathHistory: TracerPathHistory,
  camera: THREE.Camera,
  pointerX: number,
  pointerY: number,
  tolerancePx: number = PICK_TOLERANCE_PX,
): PathHistorySampleHit | null {
  const candidates = [];
  for (let slotIndex = 0; slotIndex < pathHistory.tracerCount; slotIndex++) {
    const points = pathHistory.pointsFor(slotIndex);
    for (let historyIndex = 0; historyIndex < points.length; historyIndex++) {
      const projected = projectWorldPointToCanvasPixels(
        camera,
        points[historyIndex]!,
        CANVAS_W,
        CANVAS_H,
      );
      if (projected === null) {
        continue;
      }
      const dPx = Math.hypot(
        pointerX - projected.x,
        pointerY - projected.y,
      );
      if (!Number.isFinite(dPx)) {
        continue;
      }
      candidates.push({
        slotIndex,
        historyIndex,
        dPx,
        depth: projected.depth,
      });
    }
  }
  return choosePathHistorySampleWinner(candidates, tolerancePx);
}

function livePick(
  pathHistory: TracerPathHistory,
  camera: THREE.Camera,
  pointerX: number,
  pointerY: number,
  tolerancePx: number = PICK_TOLERANCE_PX,
): PathHistorySampleHit | null {
  return pickPathHistorySampleByScreenDistance(
    pathHistory,
    camera,
    pointerX,
    pointerY,
    CANVAS_W,
    CANVAS_H,
    tolerancePx,
  );
}

describe("pickPathHistorySample", () => {
  it("reuses the glyph screen-space tolerance and projection helper", () => {
    expect(PICK_TOLERANCE_PX).toBe(16);
    expect(pickSrc).toMatch(/createCanvasPointProjector\(/);
    expect(pickSrc).toMatch(/PICK_TOLERANCE_PX/);
    expect(pickSrc).not.toMatch(/Raycaster/);
    expect(pickVisibleSrc).toMatch(/PICK_TOLERANCE_PX = 16/);
    // Projection math has one owner: the public per-point helper is the
    // same projector the streaming pick uses.
    expect(pickVisibleSrc).toMatch(
      /projectWorldPointToCanvasPixels[\s\S]*createCanvasPointProjector\(/,
    );
  });

  it("reads recorded samples without the pointsFor defensive copy", () => {
    expect(pickSrc).toMatch(/forEachPoint\(/);
    expect(pickSrc).not.toMatch(/pathHistory\.pointsFor\(/);
    expect(pickSrc).not.toMatch(/\.samplesFor\(/);
  });

  it("picks the nearest stored sample and skips empty lanes", () => {
    const camera = perspectiveLookingAtOrigin(1000);
    const history = new TracerPathHistory(2);
    history.captureInitial(
      [
        { position: { x: 0, y: 0, z: 0 }, age: 0, active: true },
        { position: { x: 50, y: 0, z: 0 }, age: 0, active: false },
      ],
      0,
    );
    expect(history.pointsFor(1)).toEqual([]);

    const hit = pickPathHistorySampleByScreenDistance(
      history,
      camera,
      CANVAS_W / 2,
      CANVAS_H / 2,
      CANVAS_W,
      CANVAS_H,
    );
    expect(hit).toEqual({ slotIndex: 0, historyIndex: 0 });
  });

  it("chooses min d_px, then nearer depth, then lower slot, then lower index", () => {
    expect(
      choosePathHistorySampleWinner([
        { slotIndex: 1, historyIndex: 2, dPx: 4, depth: 10 },
        { slotIndex: 0, historyIndex: 9, dPx: 3, depth: 50 },
      ]),
    ).toEqual({ slotIndex: 0, historyIndex: 9 });
    expect(
      choosePathHistorySampleWinner([
        { slotIndex: 1, historyIndex: 2, dPx: 4, depth: 10 },
        { slotIndex: 0, historyIndex: 9, dPx: 4, depth: 50 },
      ]),
    ).toEqual({ slotIndex: 1, historyIndex: 2 });
    expect(
      choosePathHistorySampleWinner([
        { slotIndex: 1, historyIndex: 2, dPx: 4, depth: 10 },
        { slotIndex: 0, historyIndex: 9, dPx: 4, depth: 10 },
      ]),
    ).toEqual({ slotIndex: 0, historyIndex: 9 });
    expect(
      choosePathHistorySampleWinner([
        { slotIndex: 0, historyIndex: 2, dPx: 4, depth: 10 },
        { slotIndex: 0, historyIndex: 1, dPx: 4, depth: 10 },
      ]),
    ).toEqual({ slotIndex: 0, historyIndex: 1 });
  });

  it("returns null when every sample is outside tolerance", () => {
    const camera = perspectiveLookingAtOrigin(1000);
    const history = new TracerPathHistory(1);
    history.captureInitial(
      [{ position: { x: 0, y: 0, z: 0 }, age: 0, active: true }],
      0,
    );
    expect(
      pickPathHistorySampleByScreenDistance(
        history,
        camera,
        0,
        0,
        CANVAS_W,
        CANVAS_H,
      ),
    ).toBeNull();
  });
});

describe("pickPathHistorySample winner semantics", () => {
  const centerX = CANVAS_W / 2;
  const centerY = CANVAS_H / 2;

  it("prefers front-most depth over the lower slot index on a d_px tie", () => {
    const camera = perspectiveLookingAtOrigin(1000);
    // Both points sit on the view axis, so d_px ties exactly while the
    // slot-1 point is nearer. Depth must outrank slot index.
    const history = historyOfLanes([
      [{ x: 0, y: 0, z: -500 }],
      [{ x: 0, y: 0, z: 0 }],
    ]);
    expect(livePick(history, camera, centerX, centerY)).toEqual({
      slotIndex: 1,
      historyIndex: 0,
    });
    expect(livePick(history, camera, centerX, centerY)).toEqual(
      oraclePick(history, camera, centerX, centerY),
    );
  });

  it("breaks a full tie by lower slot index", () => {
    const camera = perspectiveLookingAtOrigin(1000);
    const history = historyOfLanes([
      [{ x: 0, y: 0, z: 0 }],
      [{ x: 0, y: 0, z: 0 }],
    ]);
    expect(livePick(history, camera, centerX, centerY)).toEqual({
      slotIndex: 0,
      historyIndex: 0,
    });
  });

  it("breaks a same-lane tie by lower history index", () => {
    const camera = perspectiveLookingAtOrigin(1000);
    const history = historyOfLanes([
      [
        { x: 0, y: 0, z: 0 },
        { x: 0, y: 0, z: 0 },
      ],
    ]);
    expect(history.pointsFor(0)).toHaveLength(2);
    expect(livePick(history, camera, centerX, centerY)).toEqual({
      slotIndex: 0,
      historyIndex: 0,
    });
  });

  it("matches the pre-slice algorithm across pointer positions, cameras, and tolerances", () => {
    const cameras = [
      perspectiveLookingAtOrigin(1000),
      (() => {
        const camera = new THREE.PerspectiveCamera(
          60,
          CANVAS_W / CANVAS_H,
          1,
          1e6,
        );
        camera.position.set(700, 400, 900);
        camera.lookAt(0, 50, 0);
        camera.updateProjectionMatrix();
        camera.updateMatrixWorld(true);
        return camera;
      })(),
    ];

    // Crossing spirals, repeated positions across lanes (forced ties),
    // points far off screen, and points behind the camera.
    const lanes: Vec3[][] = [[], [], [], []];
    for (let k = 0; k < 45; k += 1) {
      const angle = (k / 45) * Math.PI * 2;
      lanes[0]!.push({
        x: Math.cos(angle) * 220,
        y: Math.sin(angle) * 160,
        z: -k * 12,
      });
      lanes[1]!.push({
        x: Math.cos(angle) * 220,
        y: Math.sin(angle) * 160,
        z: -k * 12,
      });
      lanes[2]!.push({
        x: Math.sin(angle) * 900,
        y: Math.cos(angle) * 40 - 30,
        z: 400 - k * 40,
      });
      lanes[3]!.push({
        x: k * 5 - 100,
        y: 20,
        // Straddles the camera plane, so some samples are behind it.
        z: 1400 - k * 60,
      });
    }
    const history = historyOfLanes(lanes);

    let agreements = 0;
    let hits = 0;
    for (const camera of cameras) {
      for (const tolerancePx of [2, PICK_TOLERANCE_PX, 120]) {
        for (let px = 0; px <= CANVAS_W; px += 50) {
          for (let py = 0; py <= CANVAS_H; py += 50) {
            const live = livePick(history, camera, px, py, tolerancePx);
            const oracle = oraclePick(history, camera, px, py, tolerancePx);
            expect(live).toEqual(oracle);
            agreements += 1;
            if (live !== null) {
              hits += 1;
            }
          }
        }
      }
    }
    expect(agreements).toBeGreaterThan(500);
    // A vacuous all-null comparison would prove nothing.
    expect(hits).toBeGreaterThan(20);
  });

  it("matches the pre-slice algorithm on rejected input", () => {
    const camera = perspectiveLookingAtOrigin(1000);
    const history = historyOfLanes([[{ x: 0, y: 0, z: 0 }]]);
    for (const tolerancePx of [Number.NaN, -1, Number.POSITIVE_INFINITY]) {
      expect(livePick(history, camera, centerX, centerY, tolerancePx)).toEqual(
        oraclePick(history, camera, centerX, centerY, tolerancePx),
      );
    }
    expect(livePick(history, camera, Number.NaN, centerY)).toBeNull();
    expect(
      pickPathHistorySampleByScreenDistance(history, camera, 0, 0, 0, CANVAS_H),
    ).toBeNull();
  });

  it("does not carry scratch state between picks", () => {
    const camera = perspectiveLookingAtOrigin(1000);
    const history = historyOfLanes([
      [
        { x: 0, y: 0, z: 0 },
        { x: 120, y: 60, z: -40 },
      ],
    ]);
    const first = livePick(history, camera, centerX, centerY);
    expect(first).not.toBeNull();
    // Interleave far-away and invalid picks, then repeat the first.
    livePick(history, camera, 0, 0);
    livePick(history, camera, Number.NaN, centerY);
    livePick(history, camera, CANVAS_W, CANVAS_H);
    expect(livePick(history, camera, centerX, centerY)).toEqual(first);
  });

  it("gives hover and click one pick, so both resolve the same sample", () => {
    // One call site plus one shared helper is what makes hover and the
    // pointer-up historical selection structurally identical.
    const callSites =
      viewportSrc.match(/scene\.pickPathHistorySampleAtClientPoint\(/g) ?? [];
    expect(callSites).toHaveLength(1);
    expect(viewportSrc).toMatch(/const pickTracerHits = \(/);
    const hoverBody = /const applyHoverFromClientPoint = \([\s\S]*?\n {4}\};/.exec(
      viewportSrc,
    );
    const pointerUpBody = /const onPointerUp = \([\s\S]*?\n {4}\};/.exec(
      viewportSrc,
    );
    expect(hoverBody?.[0]).toMatch(/pickTracerHits\(/);
    expect(pointerUpBody?.[0]).toMatch(/pickTracerHits\(/);
    expect(pointerUpBody?.[0]).toMatch(/decision\.historyIndex/);

    // And the pick itself is a pure function of its inputs.
    const camera = perspectiveLookingAtOrigin(1000);
    const history = historyOfLanes([
      [
        { x: 0, y: 0, z: 0 },
        { x: 60, y: 30, z: -20 },
      ],
      [{ x: 0, y: 0, z: -300 }],
    ]);
    for (const [px, py] of [
      [centerX, centerY],
      [centerX + 9, centerY - 4],
      [120, 400],
    ] as const) {
      const hover = livePick(history, camera, px, py);
      const click = livePick(history, camera, px, py);
      expect(hover).toEqual(click);
      expect(hover).toEqual(oraclePick(history, camera, px, py));
    }
  });
});
