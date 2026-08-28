import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { TracerPathHistory } from "../simulation/TracerPathHistory.js";
import { PICK_TOLERANCE_PX } from "./pickVisibleTracerSlot.js";
import {
  choosePathHistorySampleWinner,
  pickPathHistorySampleByScreenDistance,
} from "./pickPathHistorySample.js";
import pickSrc from "./pickPathHistorySample.ts?raw";
import pickVisibleSrc from "./pickVisibleTracerSlot.ts?raw";

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

describe("pickPathHistorySample", () => {
  it("reuses the glyph screen-space tolerance and projection helper", () => {
    expect(PICK_TOLERANCE_PX).toBe(16);
    expect(pickSrc).toMatch(/projectWorldPointToCanvasPixels/);
    expect(pickSrc).toMatch(/PICK_TOLERANCE_PX/);
    expect(pickSrc).not.toMatch(/Raycaster/);
    expect(pickVisibleSrc).toMatch(/PICK_TOLERANCE_PX = 16/);
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
