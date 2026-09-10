/** Public descriptions checked against Architecture 59–61 and the Analysis queries. */
export const T1_EXPLANATION =
  "The vertical-vorticity tilting diagnostic (T1) is the dot product of environmental horizontal vorticity from Analysis and the horizontal gradient of prescribed updraft vertical velocity. It measures their alignment and magnitudes. It is a reduced-field diagnostic, not the full tilting term of V_total, not parcel spin-up, not current parcel vorticity, and not Δω_y.";

export const SOURCE_EXPLANATION =
  "Source is the environmental wind profile used in tracer motion, relative to prescribed storm motion. In observed cases it comes from the retained sounding wind measurements. It is combined with the prescribed storm-local flow to carry tracers.";

export const ANALYSIS_EXPLANATION =
  "For Goshen, Prospect Valley, and Dumas, Analysis is built separately from the same retained sounding measurements and their measurement times, not from the interpolated Source profile. Wind components are low-pass filtered in measurement time and returned to the retained heights. Environmental horizontal vorticity is calculated from wind derivatives on the containing height segment. This reduces short-scale wind variations before derivative-sensitive diagnostics; it does not establish observational accuracy. Analysis does not advect tracers or replace Source.";

export const ANALYSIS_UNAVAILABLE_COPY =
  "T1 and what-if are unavailable because this environment does not include an Analysis representation. Unavailable does not mean zero.";

export const ANALYSIS_FULL_COPY =
  "Both height levels used for the environmental wind derivative have full filter support. This describes the Analysis calculation, not observational support for the prescribed updraft.";

export const ANALYSIS_BOUNDARY_COPY =
  "The environmental wind derivative uses at least one height level whose filtering depends on mirrored data at the sounding boundary. A numeric diagnostic is available with this limitation.";
