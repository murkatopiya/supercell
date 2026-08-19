import * as THREE from "three";
import type { Vec3 } from "../core/math/Vec3.js";

/**
 * Copy chronological path points into a Line BufferGeometry.
 * Rewrites the used prefix; grows the position attribute when needed.
 * Does not interpolate, decimate, or sample particles.
 */
export function writeTrailPositions(
  geometry: THREE.BufferGeometry,
  points: readonly Vec3[],
): void {
  const n = points.length;
  const attr = ensurePositionAttribute(geometry, Math.max(n, 1));
  const array = attr.array;
  for (let i = 0; i < n; i++) {
    const point = points[i]!;
    const offset = i * 3;
    array[offset] = point.x;
    array[offset + 1] = point.y;
    array[offset + 2] = point.z;
  }
  attr.needsUpdate = true;
  geometry.setDrawRange(0, n);
  geometry.computeBoundingSphere();
}

export function createTrailLine(color: number): THREE.Line {
  const geometry = new THREE.BufferGeometry();
  writeTrailPositions(geometry, []);
  const material = new THREE.LineBasicMaterial({ color, fog: false });
  return new THREE.Line(geometry, material);
}

export function createTrailLines(
  tracerCount: number,
  colors: readonly number[],
): THREE.Line[] {
  const lines: THREE.Line[] = [];
  for (let i = 0; i < tracerCount; i++) {
    lines.push(createTrailLine(colors[i % colors.length]!));
  }
  return lines;
}

export function syncTrailLine(
  line: THREE.Line,
  points: readonly Vec3[],
): void {
  writeTrailPositions(line.geometry, points);
  line.visible = points.length > 0;
}

export function disposeTrailLine(line: THREE.Line): void {
  line.geometry.dispose();
  const material = line.material;
  if (Array.isArray(material)) {
    for (const item of material) {
      item.dispose();
    }
  } else {
    material.dispose();
  }
}

function ensurePositionAttribute(
  geometry: THREE.BufferGeometry,
  vertexCapacity: number,
): THREE.BufferAttribute {
  const existing = geometry.getAttribute("position");
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
  geometry.setAttribute("position", attribute);
  return attribute;
}
