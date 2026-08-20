import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { createReleasePreviewMarker } from "./releasePreviewMarker.js";
import {
  PICK_DISTANCE_TIE_EPSILON_PX,
  PICK_TOLERANCE_PX,
  chooseScreenPickWinner,
  pickVisibleTracerSlotAtClientPoint,
  pickVisibleTracerSlotByScreenDistance,
  projectWorldPointToCanvasPixels,
} from "./pickVisibleTracerSlot.js";
import pickVisibleTracerSlotSrc from "./pickVisibleTracerSlot.ts?raw";
import tracerSceneSrc from "./TracerScene.ts?raw";
import tracerViewportSrc from "../ui/tracer/TracerViewport.tsx?raw";

const CANVAS_W = 800;
const CANVAS_H = 600;

function perspectiveLookingAtOrigin(
  cameraZ: number,
  fovDeg = 50,
): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(fovDeg, CANVAS_W / CANVAS_H, 1, 1e6);
  camera.position.set(0, 0, cameraZ);
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld(true);
  return camera;
}

function sphereAt(
  x: number,
  y: number,
  z: number,
  visible = true,
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(150, 16, 12));
  mesh.position.set(x, y, z);
  mesh.visible = visible;
  mesh.updateMatrixWorld(true);
  return mesh;
}

/** Approximate projected radius of a world sphere on the canvas (CSS px). */
function projectedWorldRadiusCssPx(
  camera: THREE.PerspectiveCamera,
  center: { x: number; y: number; z: number },
  worldRadiusM: number,
): number {
  const centerPx = projectWorldPointToCanvasPixels(
    camera,
    center,
    CANVAS_W,
    CANVAS_H,
  );
  expect(centerPx).not.toBeNull();
  const camPos = new THREE.Vector3();
  camera.getWorldPosition(camPos);
  const viewDir = new THREE.Vector3();
  camera.getWorldDirection(viewDir);
  const right = new THREE.Vector3()
    .crossVectors(viewDir, camera.up.clone().normalize())
    .normalize();
  if (right.lengthSq() < 1e-12) {
    right.set(1, 0, 0);
  }
  const rim = {
    x: center.x + right.x * worldRadiusM,
    y: center.y + right.y * worldRadiusM,
    z: center.z + right.z * worldRadiusM,
  };
  const rimPx = projectWorldPointToCanvasPixels(camera, rim, CANVAS_W, CANVAS_H);
  expect(rimPx).not.toBeNull();
  return Math.hypot(rimPx!.x - centerPx!.x, rimPx!.y - centerPx!.y);
}

describe("PICK_TOLERANCE_PX", () => {
  it("is an explicit CSS-pixel constant", () => {
    expect(PICK_TOLERANCE_PX).toBe(16);
    expect(PICK_DISTANCE_TIE_EPSILON_PX).toBe(1e-3);
  });
});

describe("projectWorldPointToCanvasPixels", () => {
  it("projects the origin to the canvas center for a looking-at-origin camera", () => {
    const camera = perspectiveLookingAtOrigin(10000);
    const projected = projectWorldPointToCanvasPixels(
      camera,
      { x: 0, y: 0, z: 0 },
      CANVAS_W,
      CANVAS_H,
    );
    expect(projected).not.toBeNull();
    expect(projected!.x).toBeCloseTo(CANVAS_W / 2, 5);
    expect(projected!.y).toBeCloseTo(CANVAS_H / 2, 5);
    expect(projected!.depth).toBeGreaterThan(0);
  });

  it("rejects points behind the camera", () => {
    const camera = perspectiveLookingAtOrigin(10000);
    expect(
      projectWorldPointToCanvasPixels(
        camera,
        { x: 0, y: 0, z: 20000 },
        CANVAS_W,
        CANVAS_H,
      ),
    ).toBeNull();
  });

  it("rejects points outside the NDC frustum", () => {
    const camera = perspectiveLookingAtOrigin(10000);
    expect(
      projectWorldPointToCanvasPixels(
        camera,
        { x: 1e9, y: 0, z: 0 },
        CANVAS_W,
        CANVAS_H,
      ),
    ).toBeNull();
  });
});

describe("chooseScreenPickWinner", () => {
  it("prefers the smaller d_px even when that candidate is farther in depth", () => {
    expect(
      chooseScreenPickWinner([
        { slotIndex: 0, dPx: 8, depth: 100 },
        { slotIndex: 1, dPx: 3, depth: 500 },
      ]),
    ).toBe(1);
  });

  it("prefers front-most when d_px is tied within epsilon", () => {
    expect(
      chooseScreenPickWinner([
        { slotIndex: 0, dPx: 4, depth: 200 },
        { slotIndex: 1, dPx: 4 + PICK_DISTANCE_TIE_EPSILON_PX * 0.5, depth: 100 },
      ]),
    ).toBe(1);
  });

  it("prefers lower slot index when d_px and depth both tie", () => {
    expect(
      chooseScreenPickWinner([
        { slotIndex: 2, dPx: 5, depth: 150 },
        { slotIndex: 1, dPx: 5, depth: 150 },
      ]),
    ).toBe(1);
  });

  it("is deterministic across repeated calls", () => {
    const candidates = [
      { slotIndex: 0, dPx: 6, depth: 300 },
      { slotIndex: 1, dPx: 6, depth: 300 },
      { slotIndex: 2, dPx: 10, depth: 50 },
    ] as const;
    expect(chooseScreenPickWinner(candidates)).toBe(0);
    expect(chooseScreenPickWinner(candidates)).toBe(0);
  });

  it("rejects candidates outside tolerance", () => {
    expect(
      chooseScreenPickWinner([{ slotIndex: 0, dPx: PICK_TOLERANCE_PX + 1, depth: 10 }]),
    ).toBeNull();
  });
});

describe("pickVisibleTracerSlotByScreenDistance", () => {
  it("selects a visible tracer at its projected center", () => {
    const camera = perspectiveLookingAtOrigin(10000);
    const slots = [{ mesh: sphereAt(0, 0, 0) }];
    expect(
      pickVisibleTracerSlotByScreenDistance(
        slots,
        camera,
        CANVAS_W / 2,
        CANVAS_H / 2,
        CANVAS_W,
        CANVAS_H,
      ),
    ).toBe(0);
  });

  it("selects when the pointer is outside the projected glyph radius but inside PICK_TOLERANCE_PX", () => {
    const camera = perspectiveLookingAtOrigin(18000);
    const center = { x: 0, y: 0, z: 0 };
    const glyphRadiusM = 150;
    const projectedRadius = projectedWorldRadiusCssPx(
      camera,
      center,
      glyphRadiusM,
    );
    expect(projectedRadius).toBeLessThan(PICK_TOLERANCE_PX);

    const offset =
      projectedRadius + (PICK_TOLERANCE_PX - projectedRadius) * 0.5;
    expect(offset).toBeGreaterThan(projectedRadius);
    expect(offset).toBeLessThanOrEqual(PICK_TOLERANCE_PX);

    const slots = [{ mesh: sphereAt(0, 0, 0) }];
    expect(
      pickVisibleTracerSlotByScreenDistance(
        slots,
        camera,
        CANVAS_W / 2 + offset,
        CANVAS_H / 2,
        CANVAS_W,
        CANVAS_H,
      ),
    ).toBe(0);
  });

  it("does not select when the pointer is outside tolerance", () => {
    const camera = perspectiveLookingAtOrigin(10000);
    const slots = [{ mesh: sphereAt(0, 0, 0) }];
    expect(
      pickVisibleTracerSlotByScreenDistance(
        slots,
        camera,
        CANVAS_W / 2 + PICK_TOLERANCE_PX + 2,
        CANVAS_H / 2,
        CANVAS_W,
        CANVAS_H,
      ),
    ).toBeNull();
  });

  it("keeps the same CSS-pixel tolerance at far and near camera distances", () => {
    const offsetPx = 10;
    expect(offsetPx).toBeLessThanOrEqual(PICK_TOLERANCE_PX);

    const far = perspectiveLookingAtOrigin(25000);
    const near = perspectiveLookingAtOrigin(4000);
    const slots = [{ mesh: sphereAt(0, 0, 0) }];

    expect(
      pickVisibleTracerSlotByScreenDistance(
        slots,
        far,
        CANVAS_W / 2 + offsetPx,
        CANVAS_H / 2,
        CANVAS_W,
        CANVAS_H,
      ),
    ).toBe(0);
    expect(
      pickVisibleTracerSlotByScreenDistance(
        slots,
        near,
        CANVAS_W / 2 + offsetPx,
        CANVAS_H / 2,
        CANVAS_W,
        CANVAS_H,
      ),
    ).toBe(0);

    // Fixed world-radius intersect would miss the far offset while
    // still succeeding near — screen-space must not behave that way.
    const farProjectedRadius = projectedWorldRadiusCssPx(
      far,
      { x: 0, y: 0, z: 0 },
      150,
    );
    expect(farProjectedRadius).toBeLessThan(offsetPx);
  });

  it("rejects a hidden tracer", () => {
    const camera = perspectiveLookingAtOrigin(10000);
    expect(
      pickVisibleTracerSlotByScreenDistance(
        [{ mesh: sphereAt(0, 0, 0, false) }],
        camera,
        CANVAS_W / 2,
        CANVAS_H / 2,
        CANVAS_W,
        CANVAS_H,
      ),
    ).toBeNull();
  });

  it("rejects a point behind the camera even if aimed at canvas center", () => {
    const camera = perspectiveLookingAtOrigin(10000);
    const behind = sphereAt(0, 0, 20000);
    expect(
      pickVisibleTracerSlotByScreenDistance(
        [{ mesh: behind }],
        camera,
        CANVAS_W / 2,
        CANVAS_H / 2,
        CANVAS_W,
        CANVAS_H,
      ),
    ).toBeNull();
  });

  it("rejects an off-screen projected candidate", () => {
    const camera = perspectiveLookingAtOrigin(10000);
    const offScreen = sphereAt(50000, 0, 0);
    expect(
      projectWorldPointToCanvasPixels(
        camera,
        offScreen.position,
        CANVAS_W,
        CANVAS_H,
      ),
    ).toBeNull();
    expect(
      pickVisibleTracerSlotByScreenDistance(
        [{ mesh: offScreen }],
        camera,
        CANVAS_W / 2,
        CANVAS_H / 2,
        CANVAS_W,
        CANVAS_H,
      ),
    ).toBeNull();
  });

  it("does not treat the release preview as a slot candidate", () => {
    const camera = perspectiveLookingAtOrigin(10000);
    const preview = createReleasePreviewMarker(150);
    preview.position.set(0, 0, 0);
    preview.visible = true;
    preview.updateMatrixWorld(true);
    // Preview is never passed in slots by TracerScene; an empty list
    // (or only a distant glyph) must not invent a pick from preview.
    expect(
      pickVisibleTracerSlotByScreenDistance(
        [],
        camera,
        CANVAS_W / 2,
        CANVAS_H / 2,
        CANVAS_W,
        CANVAS_H,
      ),
    ).toBeNull();
    expect(pickVisibleTracerSlotSrc).not.toMatch(/preview/);
    expect(tracerSceneSrc).toMatch(
      /pickVisibleTracerSlotAtClientPoint\(\s*this\.slots/,
    );
    expect(tracerSceneSrc).not.toMatch(
      /pickVisibleTracerSlotAtClientPoint\([^\)]*preview/,
    );
  });

  it("prefers closer d_px over a deeper nearer-depth neighbor", () => {
    const camera = perspectiveLookingAtOrigin(12000);
    // Lateral offset keeps both centers inside tolerance when aiming at
    // the farther tracer; distractor is still nearer in depth.
    const aimed = sphereAt(200, 0, -1000);
    const distractor = sphereAt(0, 0, 0);
    const aimedPx = projectWorldPointToCanvasPixels(
      camera,
      aimed.position,
      CANVAS_W,
      CANVAS_H,
    );
    const distractorPx = projectWorldPointToCanvasPixels(
      camera,
      distractor.position,
      CANVAS_W,
      CANVAS_H,
    );
    expect(aimedPx).not.toBeNull();
    expect(distractorPx).not.toBeNull();
    const dDistractor = Math.hypot(
      aimedPx!.x - distractorPx!.x,
      aimedPx!.y - distractorPx!.y,
    );
    expect(dDistractor).toBeGreaterThan(0);
    expect(dDistractor).toBeLessThanOrEqual(PICK_TOLERANCE_PX);
    expect(aimedPx!.depth).toBeGreaterThan(distractorPx!.depth);
    expect(
      pickVisibleTracerSlotByScreenDistance(
        [{ mesh: distractor }, { mesh: aimed }],
        camera,
        aimedPx!.x,
        aimedPx!.y,
        CANVAS_W,
        CANVAS_H,
      ),
    ).toBe(1);
  });
});

describe("pickVisibleTracerSlotAtClientPoint", () => {
  it("uses CSS client coordinates relative to the canvas rect, not DPR", () => {
    const camera = perspectiveLookingAtOrigin(10000);
    const slots = [{ mesh: sphereAt(0, 0, 0) }];
    const rect = { left: 100, top: 50, width: CANVAS_W, height: CANVAS_H };
    expect(
      pickVisibleTracerSlotAtClientPoint(
        slots,
        camera,
        rect.left + CANVAS_W / 2,
        rect.top + CANVAS_H / 2,
        rect,
      ),
    ).toBe(0);
    // Drawing-buffer scale must not appear in the pick module.
    expect(pickVisibleTracerSlotSrc).not.toMatch(/devicePixelRatio/);
    expect(pickVisibleTracerSlotSrc).not.toMatch(/drawingBuffer/);
  });
});

describe("product wiring", () => {
  it("routes TracerViewport through screen-space TracerScene picking", () => {
    expect(tracerViewportSrc).toMatch(/pickVisibleTracerAtClientPoint/);
    expect(tracerViewportSrc).not.toMatch(/pickVisibleTracer\(ray\)/);
    expect(tracerSceneSrc).toMatch(/pickVisibleTracerAtClientPoint/);
    expect(tracerSceneSrc).not.toMatch(/pickVisibleTracerSlotIndex/);
    expect(pickVisibleTracerSlotSrc).not.toMatch(/Raycaster/);
    expect(pickVisibleTracerSlotSrc).not.toMatch(/intersectObjects/);
  });
});
