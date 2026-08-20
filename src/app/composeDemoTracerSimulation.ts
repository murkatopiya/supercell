import { CompositeVelocityField } from "../core/fields/CompositeVelocityField.js";
import type { VelocityField } from "../core/fields/VelocityField.js";
import { EulerIntegrator } from "../core/integrators/EulerIntegrator.js";
import { DiagnosticTiltingTendency } from "../physics/diagnostics/DiagnosticTiltingTendency.js";
import { EnvironmentalWindField } from "../physics/environment/EnvironmentalWindField.js";
import { StormRelativeEnvironmentalAdvectionField } from "../physics/environment/StormRelativeEnvironmentalAdvectionField.js";
import { createDowndraftField } from "../scenario/createDowndraftField.js";
import { createEnvironmentalWindProfile } from "../scenario/createEnvironmentalWindProfile.js";
import { createLowerRadialInflowField } from "../scenario/createLowerRadialInflowField.js";
import { createNearGroundRadialOutflowField } from "../scenario/createNearGroundRadialOutflowField.js";
import { createRotationField } from "../scenario/createRotationField.js";
import { createUpdraftField } from "../scenario/createUpdraftField.js";
import { createUpperRadialOutflowField } from "../scenario/createUpperRadialOutflowField.js";
import { DEMO_SCENARIO } from "../scenario/DEMO_SCENARIO.js";
import type { InspectableVelocityOperands } from "../interaction/TracerInspection.js";
import { ATMOSPHERIC_TRACER_DOMAIN } from "../simulation/AtmosphericTracerDomain.js";
import { createTracersFromSeeds } from "../simulation/createTracersFromSeeds.js";
import type {
  TracerAdvectionState,
  TracerParticle,
} from "../simulation/TracerParticle.js";
import { TracerPathHistory } from "../simulation/TracerPathHistory.js";
import { Simulation } from "../simulation/Simulation.js";
import {
  DEFAULT_DEMO_INTEGRATION_FRAME,
  IntegrationFrame,
} from "./IntegrationFrame.js";
import {
  DEFAULT_DEMO_TRACER_PEDAGOGY,
  TracerPedagogy,
} from "./TracerPedagogy.js";
import type { ScenarioTracerSeed } from "../scenario/ScenarioConfig.js";

/**
 * Role tokens for the current DEMO composite, in operand order.
 * Not English labels and not the inspector's permanent schema.
 * docs/architecture/19-shared-tracer-inspector.md
 */
export const DEMO_VELOCITY_CONTRIBUTION_KEYS = [
  "environmentAdvection",
  "updraft",
  "rotation",
  "lowerInflow",
  "upperOutflow",
  "downdraft",
  "nearGroundOutflow",
] as const;

export type DemoVelocityContributionKey =
  (typeof DEMO_VELOCITY_CONTRIBUTION_KEYS)[number];

export interface DemoObservedTracerSimulation {
  readonly simulation: Simulation;
  readonly velocityObservation: InspectableVelocityOperands;
  /** Same Euler instance Simulation integrates. Not a second policy. */
  readonly integrator: EulerIntegrator;
  /**
   * Sibling diagnostic of velocityObservation, not a V_total operand.
   * Built from the same profile and updraftField instances.
   */
  readonly tiltingTendency: DiagnosticTiltingTendency;
}

function environmentalOperand(
  groundRelativeEnvironmentField: EnvironmentalWindField,
  integrationFrame: IntegrationFrame,
): VelocityField {
  switch (integrationFrame) {
    case IntegrationFrame.GroundRelativeWindTunnel:
      return groundRelativeEnvironmentField;
    case IntegrationFrame.StormRelativeLaboratory:
      return new StormRelativeEnvironmentalAdvectionField(
        groundRelativeEnvironmentField,
        DEMO_SCENARIO.stormMotion,
      );
  }
}

/**
 * Compose DEMO tracer operands from DEMO_SCENARIO.
 *
 * IntegrationFrame selects only the environmental VelocityField operand.
 * Storm fields are identical in both modes. CompositeVelocityField does
 * not know about the frame or C.
 *
 * Default composition frame: GroundRelativeWindTunnel.
 * Live App.tsx selects StormRelativeLaboratory explicitly.
 */
export function composeDemoTracerFields(
  integrationFrame: IntegrationFrame = DEFAULT_DEMO_INTEGRATION_FRAME,
) {
  const profile = createEnvironmentalWindProfile(DEMO_SCENARIO);
  const groundRelativeEnvironmentField = new EnvironmentalWindField(profile);
  const environmentField = environmentalOperand(
    groundRelativeEnvironmentField,
    integrationFrame,
  );
  const updraftField = createUpdraftField(DEMO_SCENARIO);
  const rotationField = createRotationField(DEMO_SCENARIO);
  const lowerRadialInflowField = createLowerRadialInflowField(DEMO_SCENARIO);
  const upperRadialOutflowField = createUpperRadialOutflowField(DEMO_SCENARIO);
  const downdraftField = createDowndraftField(DEMO_SCENARIO);
  const nearGroundOutflowField = createNearGroundRadialOutflowField(
    DEMO_SCENARIO,
  );
  const field = new CompositeVelocityField([
    environmentField,
    updraftField,
    rotationField,
    lowerRadialInflowField,
    upperRadialOutflowField,
    downdraftField,
    nearGroundOutflowField,
  ]);
  return {
    integrationFrame,
    profile,
    groundRelativeEnvironmentField,
    environmentField,
    updraftField,
    rotationField,
    lowerRadialInflowField,
    upperRadialOutflowField,
    downdraftField,
    nearGroundOutflowField,
    operands: [
      environmentField,
      updraftField,
      rotationField,
      lowerRadialInflowField,
      upperRadialOutflowField,
      downdraftField,
      nearGroundOutflowField,
    ] as const,
    field,
  };
}

/**
 * Keep the SAME operand instances the composite already holds.
 * Names live here, not on CompositeVelocityField.
 */
export function demoInspectableVelocityOperands(
  composed: ReturnType<typeof composeDemoTracerFields>,
): InspectableVelocityOperands {
  return {
    total: composed.field,
    parts: DEMO_VELOCITY_CONTRIBUTION_KEYS.map((key, index) => ({
      key,
      field: composed.operands[index]!,
    })),
  };
}

/**
 * One composition pass: Simulation integrates `velocityObservation.total`,
 * which is the same CompositeVelocityField instance built from `parts`.
 * T1 observes the same profile and updraftField instances; it is not
 * a parts row and is not owned by Simulation.
 */
export function composeDemoTracersWithObservation(
  integrationFrame: IntegrationFrame,
  particles: TracerAdvectionState[],
): DemoObservedTracerSimulation {
  const composed = composeDemoTracerFields(integrationFrame);
  const tiltingTendency = new DiagnosticTiltingTendency({
    profile: composed.profile,
    updraft: composed.updraftField,
  });
  const velocityObservation = demoInspectableVelocityOperands(composed);
  const integrator = new EulerIntegrator();
  return {
    simulation: new Simulation(
      velocityObservation.total,
      integrator,
      particles,
      { tracerDomain: ATMOSPHERIC_TRACER_DOMAIN },
    ),
    velocityObservation,
    integrator,
    tiltingTendency,
  };
}

/**
 * Map pedagogy to the DEMO seed array. Role is which array, not a tag.
 * Arrays are never concatenated.
 */
export function demoSeedsForPedagogy(
  pedagogy: TracerPedagogy,
): readonly ScenarioTracerSeed[] {
  switch (pedagogy) {
    case TracerPedagogy.DiagnosticProbes:
      return DEMO_SCENARIO.simulation.diagnosticSeeds;
    case TracerPedagogy.StoryPathlines:
      return DEMO_SCENARIO.simulation.storySeeds;
    case TracerPedagogy.DownwardPathline:
      return DEMO_SCENARIO.simulation.downwardPathlineSeeds;
    case TracerPedagogy.NearGroundOutflowPathline:
      return DEMO_SCENARIO.simulation.nearGroundOutflowPathlineSeeds;
  }
}

export function demoTrailsEnabled(pedagogy: TracerPedagogy): boolean {
  switch (pedagogy) {
    case TracerPedagogy.DiagnosticProbes:
      return false;
    case TracerPedagogy.StoryPathlines:
    case TracerPedagogy.DownwardPathline:
    case TracerPedagogy.NearGroundOutflowPathline:
      return true;
  }
}

export function demoKeepInactiveGlyphs(pedagogy: TracerPedagogy): boolean {
  switch (pedagogy) {
    case TracerPedagogy.DiagnosticProbes:
    case TracerPedagogy.StoryPathlines:
    case TracerPedagogy.NearGroundOutflowPathline:
      return false;
    case TracerPedagogy.DownwardPathline:
      return true;
  }
}

/**
 * StoryPathlines, DownwardPathline, and NearGroundOutflowPathline:
 * stride-1 recorder with initial seed points. DiagnosticProbes: no
 * recorder.
 */
export function createDemoPathHistory(
  pedagogy: TracerPedagogy,
  particles: readonly TracerParticle[],
): TracerPathHistory | null {
  if (!demoTrailsEnabled(pedagogy)) {
    return null;
  }
  const history = new TracerPathHistory(particles.length, 1);
  history.captureInitial(particles);
  return history;
}

/**
 * Compose DEMO tracers and keep inspectable operand instances beside
 * Simulation. TracerPedagogy selects which seed array is copied into
 * particles. Default pedagogy is DiagnosticProbes. Live Guided maps
 * GuidedExperimentId onto TracerPedagogy via
 * guidedExperimentCompositionFor.
 *
 * Default integration frame is GroundRelativeWindTunnel.
 * Live App selects StormRelativeLaboratory.
 *
 * AtmosphericTracerDomain is applied to tracer lifecycle only
 * (docs/architecture/11-ground-atmospheric-domain-policy.md).
 * Field sampling remains unbounded.
 */
export function composeDemoTracerLab(
  integrationFrame: IntegrationFrame = DEFAULT_DEMO_INTEGRATION_FRAME,
  pedagogy: TracerPedagogy = DEFAULT_DEMO_TRACER_PEDAGOGY,
): DemoObservedTracerSimulation {
  return composeDemoTracersWithObservation(
    integrationFrame,
    createTracersFromSeeds(demoSeedsForPedagogy(pedagogy)),
  );
}

/**
 * Simulation-only DEMO composition. Observation-capable composition
 * is `composeDemoTracerLab` / `composeDemoTracersWithObservation`.
 */
export function composeDemoTracerSimulation(
  integrationFrame: IntegrationFrame = DEFAULT_DEMO_INTEGRATION_FRAME,
  pedagogy: TracerPedagogy = DEFAULT_DEMO_TRACER_PEDAGOGY,
): Simulation {
  return composeDemoTracerLab(integrationFrame, pedagogy).simulation;
}
