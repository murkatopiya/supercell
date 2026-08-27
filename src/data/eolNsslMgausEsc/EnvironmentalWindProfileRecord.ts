import type { EnvironmentalWindProfile } from "../../physics/environment/EnvironmentalWindProfile.js";
import type { EnvironmentalWindProfileProvenance } from "./types.js";

export interface EnvironmentalWindProfileRecord {
  profile: EnvironmentalWindProfile;
  provenance: EnvironmentalWindProfileProvenance;
}
