import * as THREE from "three";
import type { VelocityField } from "../core/fields/VelocityField.js";
import { cometFadeFromAges } from "../visualization/cometAirflowMark.js";
import type { EulerianAirflowSamples } from "../visualization/EulerianAirflowSamples.js";
import { writeAdvectedOrientedAirflow } from "../visualization/observeAdvectedOrientedAirflow.js";
import type { VisualAirflowPopulation } from "../visualization/VisualAirflowPopulation.js";
import { writeContributionDisplayStrengths } from "../visualization/writeContributionDisplayStrengths.js";
import { CometAirflowMarkScene } from "./CometAirflowMarkScene.js";
import { OperandHighlightBackgroundScene } from "./OperandHighlightBackgroundScene.js";
import { OrientedAirflowMarkScene } from "./OrientedAirflowMarkScene.js";
import { VisualAirflowScene } from "./VisualAirflowScene.js";
import type {
  UpdraftHighlightMode,
  VisualAirflowWorkbenchMode,
} from "./visualAirflowWorkbenchMode.js";

/**
 * Explore-only grouping of encodings and highlight overlays.
 * Visibility switch only. Does not own Simulation or scientific tracers.
 */
export class VisualAirflowWorkbenchScene {
  private readonly group: THREE.Group;
  private readonly points: VisualAirflowScene;
  private readonly advectedMarks: OrientedAirflowMarkScene;
  private readonly cometMarks: CometAirflowMarkScene;
  private readonly eulerianMarks: OrientedAirflowMarkScene;
  private readonly highlightBackground: OperandHighlightBackgroundScene;
  private readonly advectedPositions: Float32Array;
  private readonly advectedDirections: Float32Array;
  private readonly advectedAges: Float32Array;
  private readonly occupancyFade: Float32Array;
  private readonly advectedHighlight: Float32Array;
  private readonly eulerianPositions: Float32Array;
  private readonly eulerianDirections: Float32Array;
  private readonly eulerianHighlight: Float32Array;
  private disposed = false;

  constructor(pointCount: number, eulerianCount: number) {
    this.group = new THREE.Group();
    this.group.name = "visualAirflowWorkbench";
    this.points = new VisualAirflowScene(pointCount);
    this.advectedMarks = new OrientedAirflowMarkScene(pointCount);
    this.cometMarks = new CometAirflowMarkScene(pointCount);
    this.eulerianMarks = new OrientedAirflowMarkScene(
      eulerianCount,
      "eulerianAirflowMarks",
    );
    this.highlightBackground = new OperandHighlightBackgroundScene(
      eulerianCount,
    );
    this.group.add(this.highlightBackground.object);
    this.group.add(this.points.object);
    this.group.add(this.advectedMarks.object);
    this.group.add(this.cometMarks.object);
    this.group.add(this.eulerianMarks.object);
    this.advectedPositions = new Float32Array(pointCount * 3);
    this.advectedDirections = new Float32Array(pointCount * 3);
    this.advectedAges = new Float32Array(pointCount);
    this.occupancyFade = new Float32Array(pointCount);
    this.advectedHighlight = new Float32Array(pointCount);
    this.eulerianPositions = new Float32Array(eulerianCount * 3);
    this.eulerianDirections = new Float32Array(eulerianCount * 3);
    this.eulerianHighlight = new Float32Array(eulerianCount);
    this.setMode("points");
    this.highlightBackground.object.visible = false;
  }

  get object(): THREE.Group {
    return this.group;
  }

  setMode(mode: VisualAirflowWorkbenchMode): void {
    this.points.object.visible = mode === "points";
    this.advectedMarks.object.visible = mode === "advected-oriented";
    this.cometMarks.object.visible = mode === "advected-comet";
    this.eulerianMarks.object.visible = mode === "eulerian-oriented";
  }

  sync(input: {
    mode: VisualAirflowWorkbenchMode;
    population: VisualAirflowPopulation;
    eulerian: EulerianAirflowSamples;
    field: VelocityField;
    time: number;
    highlightMode: UpdraftHighlightMode;
    highlightOperand: VelocityField | null;
  }): void {
    if (this.disposed) {
      throw new Error("VisualAirflowWorkbenchScene is disposed");
    }
    this.setMode(input.mode);
    const cometTint = input.highlightMode === "comets";
    if (input.mode === "points") {
      this.points.syncFromPopulation(input.population);
    } else if (input.mode === "advected-oriented") {
      writeAdvectedOrientedAirflow(
        input.population,
        input.field,
        input.time,
        this.advectedPositions,
        this.advectedDirections,
      );
      const strengths = this.markHighlightStrengths(
        cometTint,
        input.highlightOperand,
        this.advectedPositions,
        input.population.occupantCount,
        input.time,
        this.advectedHighlight,
      );
      this.advectedMarks.syncFromObservation(
        this.advectedPositions,
        this.advectedDirections,
        strengths,
      );
    } else if (input.mode === "advected-comet") {
      writeAdvectedOrientedAirflow(
        input.population,
        input.field,
        input.time,
        this.advectedPositions,
        this.advectedDirections,
      );
      input.population.writeAgesTo(this.advectedAges);
      cometFadeFromAges(
        this.advectedAges,
        input.population.occupantCount,
        input.population.retirementAge,
        this.occupancyFade,
      );
      const strengths = this.markHighlightStrengths(
        cometTint,
        input.highlightOperand,
        this.advectedPositions,
        input.population.occupantCount,
        input.time,
        this.advectedHighlight,
      );
      this.cometMarks.syncFromObservation(
        this.advectedPositions,
        this.advectedDirections,
        this.occupancyFade,
        strengths,
      );
    } else {
      if (!input.eulerian.samplesField(input.field)) {
        throw new Error(
          "eulerian airflow must observe the canonical field instance",
        );
      }
      input.eulerian.writePositionsTo(this.eulerianPositions);
      input.eulerian.writeUnitDirectionsTo(input.time, this.eulerianDirections);
      const strengths = this.markHighlightStrengths(
        cometTint,
        input.highlightOperand,
        this.eulerianPositions,
        input.eulerian.sampleCount,
        input.time,
        this.eulerianHighlight,
      );
      this.eulerianMarks.syncFromObservation(
        this.eulerianPositions,
        this.eulerianDirections,
        strengths,
      );
    }

    const showBackground = input.highlightMode === "background";
    this.highlightBackground.object.visible = showBackground;
    if (showBackground && input.highlightOperand !== null) {
      input.eulerian.writePositionsTo(this.eulerianPositions);
      writeContributionDisplayStrengths(
        input.highlightOperand,
        this.eulerianPositions,
        input.eulerian.sampleCount,
        input.time,
        this.eulerianHighlight,
      );
      this.highlightBackground.syncFromStrengths(
        this.eulerianPositions,
        this.eulerianHighlight,
      );
    }
  }

  dispose(): void {
    if (this.disposed) {
      return;
    }
    this.disposed = true;
    this.points.dispose();
    this.advectedMarks.dispose();
    this.cometMarks.dispose();
    this.eulerianMarks.dispose();
    this.highlightBackground.dispose();
  }

  private markHighlightStrengths(
    enabled: boolean,
    operand: VelocityField | null,
    positions: Float32Array,
    count: number,
    time: number,
    out: Float32Array,
  ): Float32Array | undefined {
    if (!enabled || operand === null) {
      return undefined;
    }
    writeContributionDisplayStrengths(operand, positions, count, time, out);
    return out;
  }
}
