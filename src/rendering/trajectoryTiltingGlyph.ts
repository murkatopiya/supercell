import * as THREE from "three";
import type {
  TrajectoryTiltingGlyphModel,
  TrajectoryTiltingGlyphVectorDisplayScale,
} from "../data/escHrTimeAnalysis/trajectoryTiltingGlyphModel.js";
import {
  displayDisplacementFromWorldVector,
  displayLengthFromPhysicalMagnitude,
} from "../data/escHrTimeAnalysis/trajectoryTiltingGlyphModel.js";
import type { Vec3 } from "../core/math/Vec3.js";

/**
 * Injected artistic colors / arc radius. Not a scientific palette.
 * Operand identity is not encoded in RGB.
 */
export interface TrajectoryTiltingGlyphAppearance {
  readonly omegaColor: number;
  readonly gradientColor: number;
  readonly arcColor: number;
  /**
   * Artistic fraction of min(operand display lengths) used as the
   * unsigned-θ arc radius. Not physics.
   */
  readonly arcRadiusFraction: number;
}

const GROUP_NAME = "analysisTiltingGlyph";
const OMEGA_NAME = "analysisTiltingOmegaArrow";
const GRADIENT_NAME = "analysisTiltingGradientArrow";
const ARC_NAME = "analysisTiltingAlignmentArc";

const ARROW_VERTEX_COUNT = 6;
const ARC_POINT_COUNT = 25;
const ARTISTIC_HEAD_LENGTH_FRACTION = 0.2;
const ARTISTIC_HEAD_WIDTH_FRACTION = 0.1;

/**
 * Shared visual origin at P_i is a visualization convention.
 * Arrows are Eulerian Analysis operands at that recorded location,
 * not a vector carried along the historical sample.
 */
export function createTrajectoryTiltingGlyph(): THREE.Group {
  const group = new THREE.Group();
  group.name = GROUP_NAME;
  group.add(createArrowLine(OMEGA_NAME));
  group.add(createArrowLine(GRADIENT_NAME));
  group.add(createArcLine(ARC_NAME));
  disableRaycast(group);
  group.visible = false;
  return group;
}

export function syncTrajectoryTiltingGlyph(
  group: THREE.Group,
  model: TrajectoryTiltingGlyphModel,
  displayScale: TrajectoryTiltingGlyphVectorDisplayScale,
  appearance: TrajectoryTiltingGlyphAppearance,
): void {
  const omega = objectOf(group, OMEGA_NAME);
  const gradient = objectOf(group, GRADIENT_NAME);
  const arc = arcOf(group);

  if (model.kind === "UNSUPPORTED") {
    group.visible = false;
    hideLine(omega);
    hideLine(gradient);
    hideLine(arc);
    return;
  }

  group.position.set(model.anchor.x, model.anchor.y, model.anchor.z);
  group.visible = true;

  const omegaDisplay = displayDisplacementFromWorldVector(
    model.omega.vectorWorld,
    model.omega.magnitude,
    displayScale,
  );
  const gradientDisplay = displayDisplacementFromWorldVector(
    model.gradient.vectorWorld,
    model.gradient.magnitude,
    displayScale,
  );
  writeArrow(omega, omegaDisplay, appearance.omegaColor);
  writeArrow(gradient, gradientDisplay, appearance.gradientColor);

  if (model.alignment.state !== "ALIGNMENT_DEFINED") {
    hideLine(arc);
    return;
  }

  const omegaLength = displayLengthFromPhysicalMagnitude(
    model.omega.magnitude,
    displayScale,
  );
  const gradientLength = displayLengthFromPhysicalMagnitude(
    model.gradient.magnitude,
    displayScale,
  );
  const radius =
    Math.min(omegaLength, gradientLength) * appearance.arcRadiusFraction;
  writeAlignmentArc(
    arc,
    model.omega.vectorWorld,
    model.gradient.vectorWorld,
    model.alignment.theta,
    radius,
    appearance.arcColor,
  );
}

export function disposeTrajectoryTiltingGlyph(group: THREE.Group): void {
  group.traverse((object) => {
    if (object instanceof THREE.Line || object instanceof THREE.LineSegments) {
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

function createArrowLine(name: string): THREE.LineSegments {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(ARROW_VERTEX_COUNT * 3), 3),
  );
  geometry.setDrawRange(0, 0);
  const material = new THREE.LineBasicMaterial({
    fog: false,
  });
  const line = new THREE.LineSegments(geometry, material);
  line.name = name;
  line.visible = false;
  disableRaycast(line);
  return line;
}

function createArcLine(name: string): THREE.Line {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(ARC_POINT_COUNT * 3), 3),
  );
  geometry.setDrawRange(0, 0);
  const material = new THREE.LineBasicMaterial({
    fog: false,
  });
  const line = new THREE.Line(geometry, material);
  line.name = name;
  line.visible = false;
  disableRaycast(line);
  return line;
}

function disableRaycast(object: THREE.Object3D): void {
  object.raycast = () => {};
}

function objectOf(group: THREE.Group, name: string): THREE.LineSegments {
  const object = group.getObjectByName(name);
  if (!(object instanceof THREE.LineSegments)) {
    throw new Error(`analysis tilting glyph is missing ${name}`);
  }
  return object;
}

function arcOf(group: THREE.Group): THREE.Line {
  const object = group.getObjectByName(ARC_NAME);
  if (!(object instanceof THREE.Line) || object instanceof THREE.LineSegments) {
    throw new Error("analysis tilting glyph is missing alignment arc");
  }
  return object;
}

function hideLine(line: THREE.Line | THREE.LineSegments): void {
  line.visible = false;
  line.geometry.setDrawRange(0, 0);
}

function writeArrow(
  line: THREE.LineSegments,
  displacement: Vec3 | null,
  color: number,
): void {
  if (displacement === null) {
    hideLine(line);
    return;
  }
  const dx = displacement.x;
  const dz = displacement.z;
  const length = Math.hypot(dx, dz);
  if (length === 0) {
    hideLine(line);
    return;
  }

  const ux = dx / length;
  const uz = dz / length;
  const px = -uz;
  const pz = ux;
  const head = ARTISTIC_HEAD_LENGTH_FRACTION * length;
  const halfW = ARTISTIC_HEAD_WIDTH_FRACTION * length;
  const leftX = dx - ux * head + px * halfW;
  const leftZ = dz - uz * head + pz * halfW;
  const rightX = dx - ux * head - px * halfW;
  const rightZ = dz - uz * head - pz * halfW;

  const positions = line.geometry.getAttribute("position")!.array;
  positions[0] = 0;
  positions[1] = 0;
  positions[2] = 0;
  positions[3] = dx;
  positions[4] = 0;
  positions[5] = dz;
  positions[6] = dx;
  positions[7] = 0;
  positions[8] = dz;
  positions[9] = leftX;
  positions[10] = 0;
  positions[11] = leftZ;
  positions[12] = dx;
  positions[13] = 0;
  positions[14] = dz;
  positions[15] = rightX;
  positions[16] = 0;
  positions[17] = rightZ;
  line.geometry.getAttribute("position")!.needsUpdate = true;
  line.geometry.setDrawRange(0, ARROW_VERTEX_COUNT);
  line.visible = true;
  const material = line.material;
  if (!Array.isArray(material) && material instanceof THREE.LineBasicMaterial) {
    material.color.setHex(color);
  }
}

function writeAlignmentArc(
  line: THREE.Line,
  omegaWorld: Vec3,
  gradientWorld: Vec3,
  theta: number,
  radius: number,
  color: number,
): void {
  if (!(theta > 0) || !(radius > 0)) {
    hideLine(line);
    return;
  }
  const omegaMag = Math.hypot(omegaWorld.x, omegaWorld.z);
  const gradientMag = Math.hypot(gradientWorld.x, gradientWorld.z);
  if (omegaMag === 0 || gradientMag === 0) {
    hideLine(line);
    return;
  }

  const ox = omegaWorld.x / omegaMag;
  const oz = omegaWorld.z / omegaMag;
  const gx = gradientWorld.x / gradientMag;
  const gz = gradientWorld.z / gradientMag;
  const crossY = oz * gx - ox * gz;
  const signedSweep = crossY === 0 ? theta : Math.sign(crossY) * theta;

  const positions = line.geometry.getAttribute("position")!.array;
  const last = ARC_POINT_COUNT - 1;
  for (let i = 0; i <= last; i++) {
    const phi = (signedSweep * i) / last;
    const c = Math.cos(phi);
    const s = Math.sin(phi);
    const x = ox * c + oz * s;
    const z = -ox * s + oz * c;
    const p = i * 3;
    positions[p] = x * radius;
    positions[p + 1] = 0;
    positions[p + 2] = z * radius;
  }
  line.geometry.getAttribute("position")!.needsUpdate = true;
  line.geometry.setDrawRange(0, ARC_POINT_COUNT);
  line.visible = true;
  const material = line.material;
  if (!Array.isArray(material) && material instanceof THREE.LineBasicMaterial) {
    material.color.setHex(color);
  }
}
