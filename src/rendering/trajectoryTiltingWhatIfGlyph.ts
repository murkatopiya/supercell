import * as THREE from "three";
import type { Vec3 } from "../core/math/Vec3.js";
import type { TrajectoryTiltingGlyphVectorDisplayScale } from "../data/escHrTimeAnalysis/trajectoryTiltingGlyphModel.js";
import {
  displayDisplacementFromWorldVector,
  displayLengthFromPhysicalMagnitude,
} from "../data/escHrTimeAnalysis/trajectoryTiltingGlyphModel.js";
import type { TrajectoryTiltingWhatIfModel } from "../data/escHrTimeAnalysis/trajectoryTiltingWhatIf.js";

/**
 * Injected artistic distinction of hypothetical vs actual geometry.
 * Not a scientific palette and not a production freeze.
 */
export interface TrajectoryTiltingWhatIfGlyphAppearance {
  readonly hypotheticalGradientColor: number;
  readonly hypotheticalArcColor: number;
  readonly opacity: number;
  readonly dashSize: number;
  readonly gapSize: number;
  readonly arcRadiusFraction: number;
}

const GROUP_NAME = "analysisTiltingWhatIfGlyph";
const GRADIENT_NAME = "analysisTiltingWhatIfGradientArrow";
const ARC_NAME = "analysisTiltingWhatIfAlignmentArc";

const ARROW_VERTEX_COUNT = 6;
const ARC_POINT_COUNT = 25;
const ARTISTIC_HEAD_LENGTH_FRACTION = 0.2;
const ARTISTIC_HEAD_WIDTH_FRACTION = 0.1;

/**
 * Ephemeral hypothetical gradient + θ overlay.
 * Does not own or mutate the actual Slice D glyph.
 */
export function createTrajectoryTiltingWhatIfGlyph(): THREE.Group {
  const group = new THREE.Group();
  group.name = GROUP_NAME;
  group.add(createDashedArrow(GRADIENT_NAME));
  group.add(createDashedArc(ARC_NAME));
  disableRaycast(group);
  group.visible = false;
  return group;
}

export function syncTrajectoryTiltingWhatIfGlyph(
  group: THREE.Group,
  model: TrajectoryTiltingWhatIfModel,
  displayScale: TrajectoryTiltingGlyphVectorDisplayScale,
  appearance: TrajectoryTiltingWhatIfGlyphAppearance,
): void {
  const gradient = objectOf(group, GRADIENT_NAME);
  const arc = arcOf(group);

  if (model.kind === "UNAVAILABLE") {
    group.visible = false;
    hideLine(gradient);
    hideLine(arc);
    return;
  }

  if (model.anchor !== undefined) {
    group.position.set(model.anchor.x, model.anchor.y, model.anchor.z);
  }
  group.visible = true;

  const gradientDisplay = displayDisplacementFromWorldVector(
    model.hypotheticalGradientVectorWorld,
    model.gradientMagnitude,
    displayScale,
  );
  writeArrow(gradient, gradientDisplay, appearance);

  const omegaLength = displayLengthFromPhysicalMagnitude(
    model.omegaHMagnitude,
    displayScale,
  );
  const gradientLength = displayLengthFromPhysicalMagnitude(
    model.gradientMagnitude,
    displayScale,
  );
  const radius =
    Math.min(omegaLength, gradientLength) * appearance.arcRadiusFraction;
  writeAlignmentArc(
    arc,
    model.fixedOmegaVectorWorld,
    model.hypotheticalGradientVectorWorld,
    model.thetaWhatIf,
    radius,
    appearance,
  );
}

export function disposeTrajectoryTiltingWhatIfGlyph(group: THREE.Group): void {
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

function createDashedArrow(name: string): THREE.LineSegments {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(ARROW_VERTEX_COUNT * 3), 3),
  );
  geometry.setDrawRange(0, 0);
  const material = new THREE.LineDashedMaterial({
    fog: false,
    transparent: true,
    opacity: 0.88,
    dashSize: 12,
    gapSize: 8,
  });
  const line = new THREE.LineSegments(geometry, material);
  line.name = name;
  line.visible = false;
  disableRaycast(line);
  return line;
}

function createDashedArc(name: string): THREE.Line {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(ARC_POINT_COUNT * 3), 3),
  );
  geometry.setDrawRange(0, 0);
  const material = new THREE.LineDashedMaterial({
    fog: false,
    transparent: true,
    opacity: 0.88,
    dashSize: 12,
    gapSize: 8,
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
    throw new Error(`analysis tilting what-if glyph is missing ${name}`);
  }
  return object;
}

function arcOf(group: THREE.Group): THREE.Line {
  const object = group.getObjectByName(ARC_NAME);
  if (!(object instanceof THREE.Line) || object instanceof THREE.LineSegments) {
    throw new Error("analysis tilting what-if glyph is missing alignment arc");
  }
  return object;
}

function hideLine(line: THREE.Line | THREE.LineSegments): void {
  line.visible = false;
  line.geometry.setDrawRange(0, 0);
}

function applyAppearance(
  line: THREE.Line | THREE.LineSegments,
  color: number,
  appearance: TrajectoryTiltingWhatIfGlyphAppearance,
): void {
  const material = line.material;
  if (Array.isArray(material) || !(material instanceof THREE.LineDashedMaterial)) {
    return;
  }
  material.color.setHex(color);
  material.opacity = appearance.opacity;
  material.dashSize = appearance.dashSize;
  material.gapSize = appearance.gapSize;
}

function writeArrow(
  line: THREE.LineSegments,
  displacement: Vec3 | null,
  appearance: TrajectoryTiltingWhatIfGlyphAppearance,
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
  applyAppearance(line, appearance.hypotheticalGradientColor, appearance);
  line.computeLineDistances();
}

function writeAlignmentArc(
  line: THREE.Line,
  omegaWorld: Vec3,
  gradientWorld: Vec3,
  theta: number,
  radius: number,
  appearance: TrajectoryTiltingWhatIfGlyphAppearance,
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
  applyAppearance(line, appearance.hypotheticalArcColor, appearance);
  line.computeLineDistances();
}
