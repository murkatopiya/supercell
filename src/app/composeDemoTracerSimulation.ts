import { CompositeVelocityField } from "../core/fields/CompositeVelocityField.js";
import type { VelocityField } from "../core/fields/VelocityField.js";
import { EulerIntegrator } from "../core/integrators/EulerIntegrator.js";
import { EnvironmentalWindField } from "../physics/environment/EnvironmentalWindField.js";
import { StormRelativeEnvironmentalAdvectionField } from "../physics/environment/StormRelativeEnvironmentalAdvectionField.js";
import { createEnvironmentalWindProfile } from "../scenario/createEnvironmentalWindProfile.js";
import { createLowerRadialInflowField } from "../scenario/createLowerRadialInflowField.js";
import { createRotationField } from "../scenario/createRotationField.js";
import { createUpdraftField } from "../scenario/createUpdraftField.js";
import { createUpperRadialOutflowField } from "../scenario/createUpperRadialOutflowField.js";
import { DEMO_SCENARIO } from "../scenario/DEMO_SCENARIO.js";
import { createTracersFromSeeds } from "../simulation/createTracersFromSeeds.js";
import { Simulation } from "../simulation/Simulation.js";
import {
  DEFAULT_DEMO_INTEGRATION_FRAME,
  IntegrationFrame,
} from "./IntegrationFrame.js";

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
  const field = new CompositeVelocityField([
    environmentField,
    updraftField,
    rotationField,
    lowerRadialInflowField,
    upperRadialOutflowField,
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
    operands: [
      environmentField,
      updraftField,
      rotationField,
      lowerRadialInflowField,
      upperRadialOutflowField,
    ] as const,
    field,
  };
}

/**
 * Compose demo tracer Simulation from DEMO_SCENARIO.
 *
 * Default integration frame is GroundRelativeWindTunnel:
 * EnvironmentalWindField + VerticalEnvelopeUpdraftField
 * + VerticalEnvelopeRotationField + LowerRadialInflowField
 * + UpperRadialOutflowField → CompositeVelocityField.
 */
export function composeDemoTracerSimulation(
  integrationFrame: IntegrationFrame = DEFAULT_DEMO_INTEGRATION_FRAME,
): Simulation {
  const { field } = composeDemoTracerFields(integrationFrame);
  const particles = createTracersFromSeeds(DEMO_SCENARIO.simulation.tracerSeeds);
  return new Simulation(field, new EulerIntegrator(), particles);
}
