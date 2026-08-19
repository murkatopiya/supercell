import * as THREE from "three";
import type { VelocityField } from "../core/fields/VelocityField.js";
import type { EulerianAirflowSamples } from "../visualization/EulerianAirflowSamples.js";
import { writeAdvectedOrientedAirflow } from "../visualization/observeAdvectedOrientedAirflow.js";
import type { VisualAirflowPopulation } from "../visualization/VisualAirflowPopulation.js";
import { OrientedAirflowMarkScene } from "./OrientedAirflowMarkScene.js";
import { VisualAirflowScene } from "./VisualAirflowScene.js";
import type { VisualAirflowWorkbenchMode } from "./visualAirflowWorkbenchMode.js";

/**
 * Explore-only grouping of R0/R1/R2 encodings. Visibility switch only.
 * Does not own Simulation, clock, or scientific tracers.
 */
export class VisualAirflowWorkbenchScene {
  private readonly group: THREE.Group;
  private readonly points: VisualAirflowScene;
  private readonly advectedMarks: OrientedAirflowMarkScene;
  private readonly eulerianMarks: OrientedAirflowMarkScene;
  private readonly advectedPositions: Float32Array;
  private readonly advectedDirections: Float32Array;
  private readonly eulerianPositions: Float32Array;
  private readonly eulerianDirections: Float32Array;
  private disposed = false;

  constructor(pointCount: number, eulerianCount: number) {
    this.group = new THREE.Group();
    this.group.name = "visualAirflowWorkbench";
    this.points = new VisualAirflowScene(pointCount);
    this.advectedMarks = new OrientedAirflowMarkScene(pointCount);
    this.eulerianMarks = new OrientedAirflowMarkScene(eulerianCount);
    this.group.add(this.points.object);
    this.group.add(this.advectedMarks.object);
    this.group.add(this.eulerianMarks.object);
    this.advectedPositions = new Float32Array(pointCount * 3);
    this.advectedDirections = new Float32Array(pointCount * 3);
    this.eulerianPositions = new Float32Array(eulerianCount * 3);
    this.eulerianDirections = new Float32Array(eulerianCount * 3);
    this.setMode("points");
  }

  get object(): THREE.Group {
    return this.group;
  }

  setMode(mode: VisualAirflowWorkbenchMode): void {
    this.points.object.visible = mode === "points";
    this.advectedMarks.object.visible = mode === "advected-oriented";
    this.eulerianMarks.object.visible = mode === "eulerian-oriented";
  }

  sync(input: {
    mode: VisualAirflowWorkbenchMode;
    population: VisualAirflowPopulation;
    eulerian: EulerianAirflowSamples;
    field: VelocityField;
    time: number;
  }): void {
    if (this.disposed) {
      throw new Error("VisualAirflowWorkbenchScene is disposed");
    }
    this.setMode(input.mode);
    if (input.mode === "points") {
      this.points.syncFromPopulation(input.population);
      return;
    }
    if (input.mode === "advected-oriented") {
      writeAdvectedOrientedAirflow(
        input.population,
        input.field,
        input.time,
        this.advectedPositions,
        this.advectedDirections,
      );
      this.advectedMarks.syncFromObservation(
        this.advectedPositions,
        this.advectedDirections,
      );
      return;
    }
    if (!input.eulerian.samplesField(input.field)) {
      throw new Error(
        "eulerian airflow must observe the canonical field instance",
      );
    }
    input.eulerian.writePositionsTo(this.eulerianPositions);
    input.eulerian.writeUnitDirectionsTo(input.time, this.eulerianDirections);
    this.eulerianMarks.syncFromObservation(
      this.eulerianPositions,
      this.eulerianDirections,
    );
  }

  dispose(): void {
    if (this.disposed) {
      return;
    }
    this.disposed = true;
    this.points.dispose();
    this.advectedMarks.dispose();
    this.eulerianMarks.dispose();
  }
}
