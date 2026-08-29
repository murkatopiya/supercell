import * as THREE from "three";
import type { LinearRgb } from "./vertexColorSpace.js";
import type { TrajectoryTiltingRenderEncoding } from "../data/escHrTimeAnalysis/trajectoryTiltingRenderEncoding.js";

/**
 * Artistic unit → linear-sRGB map. Not production color-scale
 * calibration.
 */
export interface TrajectoryTiltingValueAppearance {
  linearRgbFromSignedUnit(signedUnit: number): LinearRgb;
}

const FULL_OBJECT_NAME = "analysisTiltingFullValue";
const BOUNDARY_OBJECT_NAME = "analysisTiltingBoundaryValue";

/**
 * Drawn after occupancy trails (renderOrder 0). Occupancy does not
 * write depth, so this overlay wins coplanar Line vs LineSegments
 * without a camera-dependent geometric offset.
 */
export const ANALYSIS_TILTING_OVERLAY_RENDER_ORDER = 1;

export function createTrajectoryTiltingOverlay(): THREE.Group {
  const group = new THREE.Group();
  group.name = "analysisTiltingOverlay";
  group.renderOrder = ANALYSIS_TILTING_OVERLAY_RENDER_ORDER;
  group.add(createValueLine(FULL_OBJECT_NAME));
  group.add(createValueLine(BOUNDARY_OBJECT_NAME));
  return group;
}

export function syncTrajectoryTiltingOverlay(
  overlay: THREE.Group,
  encoding: TrajectoryTiltingRenderEncoding,
  appearance: TrajectoryTiltingValueAppearance,
): void {
  const full = overlay.getObjectByName(FULL_OBJECT_NAME);
  const boundary = overlay.getObjectByName(BOUNDARY_OBJECT_NAME);
  if (!(full instanceof THREE.LineSegments) || !(boundary instanceof THREE.LineSegments)) {
    throw new Error("analysis tilting overlay is missing value LineSegments");
  }

  const fullSegments = encoding.valueSegments.filter(
    (segment) => segment.support === "FULL_SUPPORT",
  );
  const boundarySegments = encoding.valueSegments.filter(
    (segment) => segment.support === "BOUNDARY_CONDITIONED",
  );
  writeValueSegments(full, fullSegments, appearance);
  writeValueSegments(boundary, boundarySegments, appearance);
  overlay.visible = encoding.valueSegments.length > 0;
}

export function disposeTrajectoryTiltingOverlay(overlay: THREE.Group): void {
  overlay.traverse((object) => {
    if (object instanceof THREE.LineSegments) {
      object.geometry.dispose();
      const material = object.material;
      if (Array.isArray(material)) {
        for (const item of material) {
          item.dispose();
        }
      } else {
        material.dispose();
      }
    }
  });
}

function createValueLine(name: string): THREE.LineSegments {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(6), 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(new Float32Array(6), 3));
  geometry.setDrawRange(0, 0);
  const material = new THREE.LineBasicMaterial({
    vertexColors: true,
    fog: false,
    depthTest: true,
    depthWrite: true,
  });
  const line = new THREE.LineSegments(geometry, material);
  line.name = name;
  line.renderOrder = ANALYSIS_TILTING_OVERLAY_RENDER_ORDER;
  line.raycast = () => {};
  line.visible = false;
  return line;
}

function writeValueSegments(
  line: THREE.LineSegments,
  segments: TrajectoryTiltingRenderEncoding["valueSegments"],
  appearance: TrajectoryTiltingValueAppearance,
): void {
  const vertexCount = segments.length * 2;
  const position = ensureAttribute(line.geometry, "position", Math.max(vertexCount, 2));
  const color = ensureAttribute(line.geometry, "color", Math.max(vertexCount, 2));
  const positions = position.array;
  const colors = color.array;

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]!;
    const rgb = appearance.linearRgbFromSignedUnit(segment.signedUnit);
    const p = i * 6;
    const c = i * 6;
    positions[p] = segment.from.x;
    positions[p + 1] = segment.from.y;
    positions[p + 2] = segment.from.z;
    positions[p + 3] = segment.to.x;
    positions[p + 4] = segment.to.y;
    positions[p + 5] = segment.to.z;
    colors[c] = rgb.r;
    colors[c + 1] = rgb.g;
    colors[c + 2] = rgb.b;
    colors[c + 3] = rgb.r;
    colors[c + 4] = rgb.g;
    colors[c + 5] = rgb.b;
  }

  position.needsUpdate = true;
  color.needsUpdate = true;
  line.geometry.setDrawRange(0, vertexCount);
  line.visible = segments.length > 0;
}

function ensureAttribute(
  geometry: THREE.BufferGeometry,
  name: "position" | "color",
  vertexCapacity: number,
): THREE.BufferAttribute {
  const existing = geometry.getAttribute(name);
  if (
    existing instanceof THREE.BufferAttribute &&
    existing.count >= vertexCapacity
  ) {
    return existing;
  }
  const nextCapacity =
    existing instanceof THREE.BufferAttribute
      ? Math.max(vertexCapacity, existing.count * 2)
      : vertexCapacity;
  const attribute = new THREE.BufferAttribute(
    new Float32Array(nextCapacity * 3),
    3,
  );
  geometry.setAttribute(name, attribute);
  return attribute;
}
