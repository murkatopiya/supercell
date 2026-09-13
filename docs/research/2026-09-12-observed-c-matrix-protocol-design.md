# Observed C-Matrix Protocol Design

**Status: E1 SCIENTIFIC EXECUTION — CLOSED · PASS (human review, §14).
E1 ARITHMETIC INPUTS AND IMPLEMENTATION CONTRACT — FROZEN.
LAGRANGIAN PHASE P SPECIFICATION — FROZEN; IMPLEMENTATION/EXECUTION NOT AUTHORIZED.**

**Current successor gate:** [Phase P qualification specification](2026-09-13-observed-lagrangian-phase-p-qualification-specification.md) is frozen after human scientific review. Main L1 remains NOT FROZEN. Earlier next-action text below is historical; no E1 arithmetic or scientific closure record changes.

The current E1 execution/classification authority is [§14](#14-e1-execution-results-and-human-scientific-closure).
Earlier design, implementation and execution-gate statements below are historical;
§13 remains unchanged. E1 ran exactly once and was subsequently human-classified
CLOSED · PASS. This closure grants no rerun or Lagrangian implementation/execution
authorization and does not fill the parent campaign §12 Conclusions.

**Implementation design review closure — 2026-09-13: CLOSED · APPROVED.**
The [E1 implementation contract](2026-09-12-observed-c-matrix-e1-implementation-design.md)
now freezes the three-file layout, explicit storm-only literal snapshot,
composition, P1/P2 probes, E1-A–F assertions, numerical tolerances, independent
oracles, exact-zero-only decomposition policy, evidence and stop rules.
Earlier open E1 design decisions recorded below, including the historical
list in §13.6, are resolved by that later reviewed contract; §13 itself is
preserved unchanged as the arithmetic-freeze record. The 1 m/s proposal remains
NOT FROZEN and NOT USED by E1. Implementation is NOT STARTED and is authorized
to start only after this freeze is reviewed/committed, then must stop for
actual implementation review. E1 execution and the Lagrangian stage remain
NOT AUTHORIZED. No arithmetic values or predictions are changed.

**Scientific review outcome — 2026-09-12:** observed C-matrix scientific design
**REVIEWED**; E1 full-precision arithmetic specification **REVIEWED AND APPROVED**.
The accepted layer, C0, five-member geometry, endpoint-arithmetic-mean reference
flow and alpha=1/2, including all 20 C vectors and endpoint-derived DeltaSRH
predictions in §13, remain **FROZEN PENDING IMPLEMENTATION REVIEW**. The proposed
1 m/s decomposition conditioning threshold remains **NOT FROZEN**. Open
implementation decisions remain in §§10 and 13.6. E1 execution is **NOT
AUTHORIZED**; the Lagrangian stage is **NOT AUTHORIZED** and must follow E1
closure. Next gate: E1 test-only implementation design/review -> implementation
review closure -> separately authorized E1 execution. This records the review
outcome only; no arithmetic inputs or predictions are changed.

Repository audit baseline: `f3451a197228f0ac7901f98c2e926d11883f65ba`.
This document authorizes neither implementation nor execution. Only repository
reads and deterministic arithmetic on committed profile JSON were performed:
knot counts, spacing, endpoint interpolation, bulk-shear magnitudes, TIME
support bounds, and the E1 input/analytical-prediction freeze in §13.
No production module, Analysis transform, SRH matrix, trajectory, test or campaign
was executed. Numbers below are profile-audit inputs and analytical expectations,
not observed-matrix execution results. The accepted layer, C0, five-member
geometry, endpoint-arithmetic-mean reference flow and alpha=1/2 are frozen only
as E1 arithmetic inputs in §13. Eulerian spatial/query grids, local probes,
tolerances, the decomposition conditioning threshold and all Lagrangian design
choices remain proposals. E1 must close before any Lagrangian stage. Moore
remains without Analysis T1; deeper L2 is deferred.

The [parent protocol](2026-09-11-storm-motion-sensitivity-and-v1-validation.md)
retains H1 CLOSED / PASS, H2 CLOSED / PASS, H3 EULERIAN CLOSED / PASS,
H3 TRAJECTORIES CLOSED / INVALID CONTROL, H4 CLOSED / INVALID CONTROL,
and H5 CLOSED / PASS. Their frozen records and parent §12 Conclusions are untouched.

## 1. Scientific questions and non-goals

Does the structural response to a change in constant prescribed storm motion C,
already validated with synthetic controls, hold for four independent observed
environmental columns? Specifically:

1. Do Source wind, shear, environmental horizontal vorticity and same-point
   prescribed-field T1 remain invariant within each case?
2. Do storm-relative wind, fixed-point total advection and layer SRH obey their
   independently derived C-response identities?
3. Does flow-relative decomposition rotate its basis consistently while preserving
   the original horizontal vorticity vector?
4. How does changing C alter paths through a fixed prescribed storm, and therefore
   the w and T1 sampled along those paths?

These are environmental columns in a prescribed kinematic laboratory, not
reconstructed storms. This work does not recover observed C, validate Bunkers,
validate thermodynamics, reconstruct parcels, distinguish tornado from
non-tornado cases, implement UI/product features, or establish observational
accuracy of native-segment derivatives. Tornado occurrence and case fame are
never model oracles. H5 establishes a mechanism in a frozen synthetic control;
observed material T1 sign reversal is not a universal PASS requirement.

## 2. Exact production inventory and representations

All four production records have provenance `sourceClass: "observed-raob"`.
This broad record class must not be confused with the sampling class used to
qualify an Analysis transform. The three ESC cases use
`high-resolution-mobile-esc`; Moore belongs to the distinct
`coarse-operational-raob` sampling family and has no production Analysis column.

| Case / Explore identity | Record and committed normalized fixture | Exact source selection | Height datum / location |
| --- | --- | --- | --- |
| Goshen 2009 / `goshen-2009-observed` | `GOSHEN_2009_OBSERVED_RECORD`; `src/data/eolNsslMgausEsc/fixtures/nssl1Goshen2155.normalized.json` | EOL 114.114, DOI 10.5065/D6CC0Z0Q; Bushnell/NSSL1; UTC 2009-06-05 21:55:22; native concatenated `NSSL_MGAUS_20090605.cls` | ESC Alt minus 1557.9 m, rounded to 0.1 m; 41.278, -103.893 |
| Prospect Valley 2010 / `prospect-valley-2010-observed` | `PROSPECT_VALLEY_2010_OBSERVED_RECORD`; `src/data/eolNsslMgausEsc/fixtures/nssl1ProspectValley222346.normalized.json` | EOL 114.114, same DOI; Mobile System/NSSL1; UTC 2010-05-26 22:23:46; `NSSL_MGAUS_20100526.cls` | ESC Alt minus 1358.9 m, rounded to 0.1 m; 40.002, -103.594 |
| Dumas/Stinnett 2010 / `dumas-2010-observed` | `DUMAS_2010_OBSERVED_RECORD`; `src/data/eolNsslMgausEsc/fixtures/nssl2Dumas215218.normalized.json` | EOL 114.114, same DOI; Mobile System/NSSL2; UTC 2010-05-18 21:52:18; `NSSL_MGAUS_20100518.cls` | ESC Alt minus 1122.1 m, rounded to 0.1 m; 35.691, -101.973 |
| Moore 2013 / `moore-2013-observed` | `MOORE_2013_OBSERVED_RECORD`; `src/data/igra/fixtures/ounMoore20130520.normalized.json` | IGRA v2.2 USM00072357, NCDC DSI-6301 (`ncdc6301`); 2013-05-20 nominal HOUR 17, RELTIME 1651, NUMLEV 165; native POR `USM00072357-data.txt` | GPH minus sounding surface GPH 345 m; release 16:51 UTC; 35.1808, -97.4378 |

Identities are defined in `escObservedSoundingSpec.ts`, `igraObservedSoundingSpec.ts`
and `exploreEnvironmentIdentity.ts`; record exports and locations are in
`src/app/goshenObservedEnvironment.ts`. Moore's station-list elevation 344.9 m
is not its subtracted datum. All heights enter world Y above an implied flat
ground. ESC geometric Alt and IGRA geopotential height are distinct source
coordinates; cross-case comparison is in the existing normalized laboratory
coordinate, not an assertion of identical geodetic height or terrain.

### Source normalization and knot structure

ESC retains usable U/V and altitude, rejects missing wind/altitude and bad or
missing U/V QC, preserves native retained order, subtracts the launch datum and
requires strictly increasing normalized heights. It does not silently sort,
smooth, thin or bin these winds. Native U/V are east/north m/s. The retained-TIME
sibling is aligned one-to-one with the normalized levels.

IGRA requires present GPH/WDIR/WSPD, excludes missing/QA-removed fields, converts
meteorological FROM direction with `u=-speed*sin(dir)`, `v=-speed*cos(dir)` and
`speed=WSPD/10`, sorts by height/native-index tie break, and rejects duplicate
or non-increasing heights. No pressure-to-height reconstruction is used.

Both record builders construct `EnvironmentalWindProfile` with vertical wind
zero. It interpolates components linearly between knots and clamps outside its
extent. Clamping is a velocity continuation, not observational support.

| Case | Retained / native / dropped | Source extent (m) | Adjacent spacing min / upper median / max (m) | Knots at or below 1000 m |
| --- | --- | --- | --- | --- |
| Goshen | 2029 / 2082 / 53 | 2.4–12261.8 | 3.3 / 5.7 / 31.9 | 188 |
| Prospect Valley | 2733 / 2824 / 91 | -0.1–14017.9 | 0.7 / 4.8 / 26.1 | 183 |
| Dumas | 2917 / 3022 / 105 | -0.5–16025.6 | 2.5 / 5.2 / 36.5 | 172 |
| Moore | 165 / 165 / 0 | 0–30700 | 5 / 175 / 362 | 7 |

Spacing statistics describe all adjacent retained knots; upper median selects
sorted index floor(N/2). ESC coverage lists no gaps over 50 m. Moore has many
such gaps, reflecting its different sampling class; the shared 50 m coverage
flag is descriptive and is not an ESC-derived rejection rule for IGRA.
Small negative ESC bottom heights are retained normalization outcomes, not
permission to release below-ground tracers.

### Analysis sibling and validity

`src/app/exploreEnvironmentRepresentations.ts` builds ESC Analysis from the
committed normalized measurements plus matching `*.retained-time.json`, not
by resampling the interpolated Source profile. The existing transform is
`esc-hr-time-hamming-sinc-lowpass/v1`: 1 s TIME grid, integer linear gap
reconstruction up to 5 s, 81-tap zero-phase Hamming-sinc, 40 s cutoff wavelength,
40 s half-width and half-sample-mirror boundaries. Filtered U/V return to
retained Source heights. It does not filter in fixed height bins.

TIME-only inspection gives full-support knot ranges:

| Case | Retained TIME extent (s) | FULL_SUPPORT knot height range (m) |
| --- | --- | --- |
| Goshen | 0–2080 | 228.1–11993.2 |
| Prospect Valley | -1–2822 | 191.4–13819.9 |
| Dumas | -1–3020 | 205.2–15823.7 |
| Moore | No ESC TIME sibling | `COLUMN_UNAVAILABLE` |

These bounds use `firstTime+40 <= time <= lastTime-40`; they are not a new
transform execution. A native-segment derivative requires both endpoint knots
to have full support. At the last full-support knot the upper containing
segment can already be boundary conditioned; the knot range is not a blanket
closed interval of full derivative support. Interior knots select the upper
segment; the last profile segment includes the top endpoint.

`FULL_SUPPORT` and `BOUNDARY_CONDITIONED` both carry numeric Analysis results,
but must be reported separately. `OUT_OF_DOMAIN` and `COLUMN_UNAVAILABLE`
carry no numeric T1. Full filter support does not certify observational accuracy.
Do not pass Moore through the ESC transform or substitute Source T1 when its
Analysis column is absent. Source-resolution derivative extrema, if later
requested, remain explicitly descriptive numerical properties of the retained
piecewise-linear Source, separate from Analysis T1.

## 3. Current composition and low-level injection seam

The runtime path is:

`committed normalized fixture -> named observed record -> Source EWP`
`-> exploreEnvironmentRepresentations(identity) -> createExploreLab`
`-> composeDemoTracersWithObservation(StormRelativeLaboratory, [], sourceProfile)`.

`composeDemoTracerFields` substitutes only the environmental profile. It wraps
`EnvironmentalWindField(profile)` with
`StormRelativeEnvironmentalAdvectionField(field, DEMO_SCENARIO.stormMotion)`.
Thus **all four observed environments currently inherit prescribed C=(10,0)
m/s east/north**, not an observed-case C or an estimated storm motion.
The composite contains this environmental operand and six prescribed DEMO
storm operands: updraft, rotation, lower inflow, upper outflow, downdraft and
near-ground outflow. `Simulation` uses the total and an `EulerIntegrator`;
the observations retain the same operand instances. Explore starts without
Guided seeds; Guided remains DEMO.

The source-based `DiagnosticTiltingTendency` observes the same Source profile
and updraft, independently of advection. The separate ESC Analysis column is
returned for support-aware diagnostics and never enters the velocity composite.
Moore's absent Analysis does not prevent Source advection or Source SRH.

**No architecture blocker exists at the requested low-level seam.** Its public
constructor accepts an `EnvironmentalWindField` plus finite east/north C, copies
C and subtracts it only from environmental horizontal wind. A future test-only
composition can reuse each Source profile, construct that adapter for each C
and combine it with fixed prescribed operands. No ScenarioConfig, UI, composer
override or production change is required. The convenience DEMO composer itself
has no C override; using it unchanged would silently retain DEMO C.
The future diagnostic calls must receive the same explicit C as advection.
Never subtract C from every storm operand or from an already storm-relative
total. World mapping is `(x,y,z)=(east,up,-north)`.

## 4. Accepted primary layer and descriptive shear-scale audit

**Accepted primary layer: L=[500,3000] m in normalized laboratory height.** This is
an elevated 2.5 km layer, not “0–3 km SRH.” It avoids unsupported 0 m sampling
in Goshen, includes substantial lower-column hodograph geometry, and places
the three ESC Analysis endpoint brackets well inside full filter support.
Moore has 19 interior knots and a largest intersecting native gap of 347 m:
adequate for a structural test of the existing interpolated column, but not
for matching ESC fine-scale derivatives or claiming resolved sub-gap structure.

| Case | q(500) east/north (m/s) | q(3000) east/north (m/s) | Δq east/north (m/s) | S=|Δq| (m/s) | Interior knots / largest intersecting gap (m) |
| --- | --- | --- | --- | --- | --- |
| Goshen | (-3.000000, 8.100000) | (8.800000, 6.300000) | (11.800000, -1.800000) | 11.936499 | 405 / 7.8 |
| Prospect Valley | (-8.300000, 12.055556) | (6.200000, 16.065854) | (14.500000, 4.010298) | 15.044351 | 505 / 14.1 |
| Dumas | (-1.491667, 11.308333) | (10.000000, 18.200000) | (11.491667, 6.891667) | 13.399756 | 529 / 7.2 |
| Moore | (2.079302, 8.309622) | (14.939314, 15.430204) | (12.860012, 7.120583) | 14.699749 | 19 / 347 |

Endpoint native brackets at 500 / 3000 m are respectively:
Goshen [497.6,502.7] / [2993.6,3000.2]; Prospect [497.5,502] /
[2997.3,3001.4]; Dumas [494.5,500.5] / [2998,3001.5];
Moore [493,663] / [2974,3321]. Values above use independent component-linear
interpolation of JSON knots, rounded for display only. Future C construction
must use full-precision endpoints, not the printed table.

The mathematical common Source extent is [2.4,12261.8] m, but its mere existence
does not justify one universal layer for every diagnostic. Neither a 0-based
common SRH layer nor a four-case FULL_SUPPORT Analysis T1 layer is available.

Deferred deeper comparison L2=[500,6000] m is Source-supported in all cases;
S is respectively 30.661524, 21.719493, 25.091677 and 24.277723 m/s, with
928, 1167, 1089 and 33 interior knots. It samples different shear geometry and
must have its own metrics and endpoint response prediction. If evaluated
with C vectors constructed from L, use L2's endpoints for ΔSRH: L-parallel
does not generally preserve L2 SRH. Alternatively an L2-relative matrix is
a separately identified submatrix, never pooled with L.

The inspected [250,3000] m alternative is Source-supported and has ESC full
support in its brackets, but is closer to the lower filter boundary and its
Moore lower endpoint lies in [81,362] m. The accepted primary protocol uses
500 m; 250 m is a historical alternative, excluded from E1. Case-specific surface-to-3000 m
descriptions may use their actual supported bottom (Goshen 2.4 m; other cases
0 m), with the bottom recorded and unequal-layer metrics never labeled identical.
No resampling or common smoothing is required for these finite-layer APIs.

## 5. Analytical C-response and accepted matrix geometry

Use atmospheric east/north coordinates, q=(u,v), C=(C_e,C_n), and an upward
layer from h0 to h1. Define Δq=(Δu,Δv)=q(h1)-q(h0). The project convention is

`SRH(C) = integral[(v-C_n) du - (u-C_e) dv]`.

For constant δC, subtract the two integrands before any numerical experiment:

`ΔSRH = integral[-δC_n du + δC_e dv]`
`      = δC_e Δv - δC_n Δu = δC dot (Δv,-Δu)`.

Units are m²/s². This is independent of interior hodograph curvature for the
**change** in SRH; the absolute SRH still depends on the complete hodograph.
The production piecewise-linear segment contribution is `u_b v_a-u_a v_b`
for storm-relative endpoints, consistent with this sign. No H5 result is
needed to derive it.

For S=|Δq|>0, define e_parallel=(Δu,Δv)/S and
e_right=(Δv,-Δu)/S, a clockwise 90-degree rotation in east/north C-space.
Then δC=a e_parallel preserves layer SRH for either sign of a.
For fixed |δC|=d, Cauchy–Schwarz gives |ΔSRH|<=dS, attained only in the
two perpendicular directions. +d e_right increases SRH by dS;
-d e_right decreases it by dS. “Increase” does not imply positive final SRH.
The counterclockwise perpendicular (-Δv,Δu)/S has the negative response.
If S=0 all constant C displacements preserve layer SRH and this directional
construction is undefined; classify that directional control as invalid,
not physics failure. The inspected primary-layer cases are nonzero.

Accepted geometry: five members per case, hence 20 Eulerian case/C combinations:

| Member | C definition | Predicted primary-layer ΔSRH relative to baseline |
| --- | --- | --- |
| Baseline | C0 | 0 |
| Parallel | C0+d e_parallel | 0 |
| Antiparallel | C0-d e_parallel | 0 |
| Right perpendicular | C0+d e_right | +dS |
| Left perpendicular | C0-d e_right | -dS |

The antiparallel member is useful: it supplies a symmetric SRH-preserving
control while still changing storm-relative winds and potentially paths.
Accepted C0=(10,0) m/s is the existing prescribed production baseline, solely
for traceability. Case-relative displacements provide the comparison geometry;
the baseline is not claimed to be meteorologically representative of any case.
A layer-mean-wind baseline would be a different reviewed design, requiring an
explicit averaging definition and recalculation; no Bunkers inference is used.

**Accepted E1 magnitude: d=αS with α=1/2; full-precision freeze in §13.** Half the
layer bulk-wind difference is a transparent nondimensional perturbation shared
across cases, with ΔSRH/S²=0 or ±α. On inspected L scales it implies roughly
5.97–7.52 m/s, rather than an arbitrary common absolute vector or a magnitude
tuned to produce a sign reversal. The value 1/2 is a design choice, not a
physical constant or an observed C uncertainty. The §13 full-precision reference
flow audit confirms no exact-zero or proposed near-zero member. L2 would imply
roughly 10.86–15.33 m/s at the same α, another reason not to silently switch the
construction layer. C members and endpoint-derived expectations are now frozen
in §13; no absolute SRH value or observed-matrix response has been evaluated.

## 6. Quantities and reusable APIs

| Group | Quantity / existing API | Contract for the proposed sweep |
| --- | --- | --- |
| C-invariant | `EnvironmentalWindProfile.sampleAtHeight`, `levelHeights`, `interiorLevelHeightsBetween`; `hodographPoints`, `hodographSegments`, `hodographPointAtHeight` | Same Source q and ground-relative hodograph, knot identity and inter-level differences |
| C-invariant | `verticalWindShearBetween`; `horizontalVorticityFromShear` | Supported finite-layer shear Δq/Δh; atmospheric omega=(-dv/dh,du/dh); specify finite layer versus native segment |
| C-invariant | Prescribed storm operands; `VerticalEnvelopeUpdraftField.horizontalGradientOfVerticalVelocity` | Same point/time and geometry give same local fields and gradient |
| C-invariant | `DiagnosticTiltingTendency.sample`, `soundingSegmentContainingHeight`, `worldHorizontalVorticityFromAtmospheric` | Source numerical T1=omegaX*dVyDx+omegaZ*dVyDz; outside profile the scalar returns zero, so a separate segment validity check is essential |
| C-invariant | `queryAnalysisWindAt`, `queryAnalysisNativeSegmentShearAt`, `queryAnalysisNativeSegmentVorticityAt` | ESC Analysis quantities and support at the same height remain identical; Moore unavailable |
| C-invariant | `queryAnalysisTiltingTendencyAt`, `queryAnalysisTiltingExplanationAt` | Same-point Analysis T1, operands, alignment and support; no C parameter |
| Direct C dependence | `stormRelativeWind`; `StormRelativeEnvironmentalAdvectionField.sample` | V_sr=q-C; ΔV_sr=-δC, hodograph translation by -δC |
| Direct C dependence | `stormRelativeHelicityBetween(profile,C,h0,h1)` | Full Source polygon integral; rejects unsupported/clamped layers; endpoint-derived ΔSRH oracle |
| Direct C dependence | `decomposeHorizontalVorticity` | Flow-aligned basis changes with C; s=(u_sr,v_sr)/speed, cross=(-v_sr,u_sr)/speed; exact zero horizontal flow throws |
| Direct C dependence | `CompositeVelocityField` at fixed point/time | Atmospheric ΔV_total=(-δC_e,-δC_n,0); world ΔV_total=(-δC_e,0,+δC_n) |
| Path mediated | `Simulation`, `EulerIntegrator`, recorded path; `projectAnalysisTiltingSampleAt`, `projectAnalysisTiltingAlongRecordedPath`, `createTrajectoryTiltingVerificationModel` | Changed positions change sampled w, T1, support and other path diagnostics; use recorded scientific samples, not rendered/resampled glyphs |

The decomposition API takes a wind vector and a vorticity vector, not a layer.
For the accepted primary finite-layer comparison, use the endpoint arithmetic-mean
storm-relative wind `((q(h0)+q(h1))/2)-C` as its explicitly labeled reference
flow and the finite-layer omega. This is not a depth-integrated mean or a
native-segment field. Optional local decompositions use q(h)-C and the
containing-segment omega with its representation label. The reference definition
is accepted; query heights remain unfrozen. Exact-zero flow is undefined;
near-zero flow needs a preregistered conditioning flag, not a hidden fallback
basis. At every defined basis, reconstruct omega from its two projections and
check preservation of squared magnitude. Do not require a sign or monotonic
ordering of individual projections without a separate derivation.

`counterfactualTiltingTendency` and `createTrajectoryTiltingWhatIfModel` are
existing angle/operand what-if helpers, not C injection or trajectory solvers.
They must not stand in for this C sweep. The Analysis APIs accept an Analysis
column and prescribed updraft; they need neither a new profile transform nor
a production C parameter. Any optional Analysis SRH using `column.profile`
must be labeled separately and carry layer support checked outside the raw
SRH API; the primary SRH authority remains Source in all four cases.

## 7. Pre-run Eulerian predictions and evidence contract

Section 13 freezes only the layer, α, C0, full-precision endpoint inputs, all C
vectors, reference flows and endpoint-derived expectations. The point/height
grid, numerical tolerances and executable E1 protocol remain unfrozen and need
separate review. The following are analytical predictions, not run results:

1. Every invariant in §6 agrees within each case/C sweep at identical positions
   and times, including identical support states and containing segments.
2. Environmental and total fixed-point velocity differences match §6 exactly
   up to floating-point arithmetic; fixed-point vertical velocity is unchanged.
3. SRH differences obey §5 for each member. The right/left changes are equal
   and opposite; parallel/antiparallel changes vanish. Their paired SRH sums
   equal twice baseline. SRH invariance alone does not imply identical paths.
4. Decomposition reconstructs the invariant omega wherever its basis exists;
   a near-zero reference flow must be identified before interpreting angles.
5. Same-point Source numerical T1 and supported Analysis T1 are each invariant
   within their own representation. No Source=Analysis equality is predicted.

Candidate equality tolerance is the existing synthetic rule
`|a-b| <= 1e-9 + 1e-9*max(|a|,|b|)` for same-unit scalars, with a proposed
absolute SRH-difference residual tolerance of 1e-6 m²/s². Review dense-knot
summation error and units before freezing; do not relax tolerances after seeing
results. Exact support/identity equality uses no numerical tolerance. The
independent oracle must use endpoint arithmetic and explicit coordinate signs,
not a second call to the SRH implementation being checked.

Required records: repository SHA; fixture and TIME sibling hashes; exact source
identities/datums; representation/transform provenance; layer brackets and knot
counts; q endpoints, Δq, S, α, C0 and each C; analytical expected changes;
measured values and residuals; per-assertion tolerances, applicability and
classification. Log all four cases, including unavailable quantities. Retain
absolute and normalized SRH changes separately. Do not rank cases by a
normalized quantity that is identically prescribed by matrix construction.

## 8. Lagrangian submatrix, subsequent to Eulerian review

**DESIGN PROPOSAL ONLY. E1 must close before any Lagrangian stage.**

Propose the same five C members per case, with deterministic shared seeds
within each case and a fixed prescribed `VerticalEnvelopeUpdraftField` as the
minimal storm-local geometry. This isolates the existing source-advection /
prescribed-gradient mechanism. The full six-operand DEMO storm can be a later
separately approved extension, not silently mixed into this control. Within
each sweep, keep profile, updraft center, envelope, width, amplitude, seeds,
integration method, timestep, duration, sampling cadence and lifecycle policy
identical. Across cases, prefer the same laboratory geometry; any case-specific
seed design must be explicit and must not imply an amplitude ranking.

Before a Lagrangian run, freeze numerical geometry/seeds and demonstrate their
intended support and flow conditioning analytically. Start within L and Source
support; record subsequent layer exit and full-profile exit separately. A path
above 3000 m may still have valid Source and Analysis data, but those samples
are not primary-layer diagnostics. Proposed primary evidence stops at the
first Source-domain exit or normal lifecycle termination; any clamped
continuation must be separately labeled and excluded from supported metrics.
Do not import H5's seed and sign-reversal gate without a new geometric argument.

At each recorded sample retain member/seed ID, index/time, position, active
state, radius from fixed updraft center, sampled prescribed w, Source segment,
Analysis status/segment, T1 and its operands when available. Prefer
FULL_SUPPORT Analysis T1 for primary ESC extrema, and report
BOUNDARY_CONDITIONED extrema separately. Moore reports `COLUMN_UNAVAILABLE`
and null Analysis extrema, not zero; optional Source T1 remains separately
labeled numerical/descriptive. Support counts must sum to the reported sample
denominator, including unavailable/out-of-domain samples where queried.

| Required metric | Proposed definition and role |
| --- | --- |
| r_min | Minimum recorded horizontal radius; report sample index/time and earliest tie; descriptive, not an interpolated continuous minimum |
| max sampled w | Maximum at recorded scientific samples, with index/time/position; descriptive |
| Valid sampled T1 range/extrema | Min/max signed T1 and max absolute T1 with witnesses, representation, segment and support stratum; null when no eligible samples |
| Support-state counts | FULL_SUPPORT / BOUNDARY_CONDITIONED / OUT_OF_DOMAIN / COLUMN_UNAVAILABLE; plus Source supported/clamped and L membership separately |
| Trajectory divergence | Distance from C0 path at common active recorded times; report 3D and horizontal maximum/RMS plus common duration/sample count; no holding a dead path fixed to fabricate comparisons |
| Material sign reversal | Descriptive positive and negative witnesses exceeding a pre-frozen material threshold; report chronological order, support, intervening interval and whether segment changed |

A same-segment pair and continuously eligible intervening recorded interval
are needed to describe a clean same-segment sign reversal. Opposite signs in
different segments are a distinct path outcome. No sampled zero or reversal
is mandatory. Material thresholds must be fixed with units and an operand/
numerical-scale rationale before execution; do not apply H5's amplitude
threshold blindly to dense observed profiles.

PASS criteria concern deterministic sample integrity, correct C wiring,
unchanged local geometry, support honesty and agreement of supported T1 with
its independent operand dot product at the recorded point. At a shared initial
seed, different C gives initial atmospheric velocity difference -δC; later
path separation need not remain linear because the fields are spatially varying.
Nonzero r_min differences, stronger ascent, a core encounter, cross-case
amplitude ordering and sign reversal are descriptive unless independently
derived and preregistered as specific control prerequisites. Numerical
convergence work, if needed, requires separate approval and must not become
an unannounced timestep sweep.

## 9. Classification discipline

Classify per assertion/member/submatrix before any case-level summary.

| Classification | Meaning |
| --- | --- |
| PASS | Applicable structural/algebraic checks meet frozen tolerances with valid support and complete provenance; a trajectory may PASS integrity while showing no reversal |
| INVALID CONTROL | A stated prerequisite is absent: degenerate shear direction, undefined flow-relative basis, no eligible T1 support, premature exit, or failure to realize a specifically required tracer passage. Preserve all independently valid evidence; do not infer physics failure |
| UNEXPLAINED | A discrepancy or incomplete evidence cannot yet be attributed to numerical error, wiring, representation, support or the asserted model identity. Stop classification pending investigation; no automatic PASS or post-hoc retuning |
| FAIL | A reproducible, validly posed invariant or analytical identity is violated beyond frozen tolerance with independent evidence excluding invalid support/control and oracle/coordinate errors; identify the specific failed assertion |

Expected Moore Analysis unavailability is recorded as not applicable, not a
four-case SRH failure. If someone requires a four-case numeric Analysis T1
control, that control is INVALID CONTROL by design. Unexpected numeric Moore
Analysis T1 would be an implementation/representation discrepancy. Similarly,
a reported physical zero outside Source support is not valid T1 evidence.
Any established implementation failure should be identified as such, not
silently promoted to a meteorological conclusion. Mixed classifications remain
visible; passing SRH cannot erase an unresolved trajectory or support defect.
No retrospective tuning to achieve a desired geometry, sign or case ordering.

## 10. Unresolved scientific design decisions

Accepted decisions are L=[500,3000] m, C0=(10,0) m/s, five-member geometry,
endpoint-arithmetic-mean reference flow and alpha=1/2, confirmed by §13.
Moore has no Analysis T1, L2 is deferred, and E1 closure precedes Lagrangian work.
These decisions no longer appear as open alternatives. Remaining proposals:

1. Review the explicit 1 m/s decomposition conditioning threshold in §13.4;
   it is not frozen and must not change C or introduce a fallback basis.
2. Freeze the Eulerian spatial/query grid and any local decomposition probe
   heights; do not mix endpoint-mean and depth-mean reference winds.
3. Independently justify E1 numerical tolerances and exact assertion/control
   applicability. Existing synthetic tolerances in §7 remain candidates here.
4. Review the minimal updraft-only Lagrangian composition, numerical geometry,
   seeds, timestep, duration, termination/sampling policy and whether excursions
   beyond L have a separate descriptive window. These are not fixed here.
5. Set T1 material thresholds and Lagrangian execution criteria before execution,
   accounting for dense Source derivatives without inventing observational error
   estimates. Decide whether optional Source derivative/T1 metrics add value.
6. Complete E1 test-only implementation design/review and implementation review
   closure before seeking separate E1 execution authorization. A Moore Analysis
   transform would require separate scientific work and is not an E1 dependency.

## 11. Repository evidence inspected

Paths below are repository-relative audit references, not execution instructions.
The production/source files, not case labels or external storm outcomes, are
the authority for this design.

- `src/explore/exploreEnvironmentIdentity.ts`; `src/app/goshenObservedEnvironment.ts`;
  `src/app/exploreEnvironmentRepresentations.ts`; `src/app/createExploreLab.ts`;
  `src/app/composeDemoTracerSimulation.ts`; `src/scenario/DEMO_SCENARIO.ts`.
- `src/data/eolNsslMgausEsc/escObservedSoundingSpec.ts`, `ingestObservedEsc.ts`,
  `normalizeEscWindColumn.ts`, `retainEscWindMeasurements.ts`,
  `toEnvironmentalWindProfileRecord.ts`; all three normalized JSON fixtures
  and all three retained-TIME JSON siblings named in §2.
- `src/data/igra/igraObservedSoundingSpec.ts`, `ingestObservedIgra.ts`,
  `normalizeIgraWindColumn.ts`, `convertIgraWind.ts`,
  `toEnvironmentalWindProfileRecord.ts`; Moore normalized JSON fixture.
- `src/data/escHrTimeAnalysis/constants.ts`, `classifyAnalysisSupport.ts`,
  `createEscHrTimeAnalysis.ts`, `analysisQuery.ts`, `analysisTiltingQuery.ts`;
  exported API/status references in `trajectoryTiltingProjection.ts`,
  `trajectoryTiltingVerification.ts`, `trajectoryTiltingWhatIf.ts`.
- `src/physics/environment/EnvironmentalWindProfile.ts`,
  `StormRelativeEnvironmentalAdvectionField.ts`, `stormRelativeHelicity.ts`,
  `verticalWindShear.ts`, `horizontalVorticity.ts`,
  `streamwiseCrosswiseVorticity.ts`, `hodograph.ts`;
  `src/physics/diagnostics/DiagnosticTiltingTendency.ts`;
  `src/core/math/AtmosphericVelocity.ts`.
- `docs/architecture/56-esc-multi-sounding-observed-profile-ingest.md` and
  `57-igra-observed-profile-ingest.md` (source-selection context);
  parent protocol closure/section references and the injection/tolerance contract
  in `docs/research/2026-09-12-storm-motion-validation-harness-design.md`.

The static JSON audit used sorted adjacent-height differences, direct linear
endpoint interpolation `q_a+(h-h_a)/(h_b-h_a)*(q_b-q_a)`, Euclidean endpoint
shear magnitude, strict interior-knot counts, and the existing ±40 s support
rule. It imported no application or harness module and produced no persistent
script, test or campaign artifact. Native archive files were not re-ingested
or independently requalified in this slice.

## 12. Authorization gate

**STOP FOR SCIENTIFIC REVIEW.** This document does not fill the parent protocol's
§12 Conclusions. Only E1 arithmetic inputs in §13 are **FROZEN PENDING
IMPLEMENTATION REVIEW**. Remaining §10 decisions are open. Next gate:
E1 test-only implementation design/review -> implementation review closure ->
separately authorized E1 execution. This document does not authorize any of
those execution steps. E1 must close before any Lagrangian stage; trajectory
inputs, thresholds and execution criteria remain unfrozen.

No production code, validation harness, UI, ScenarioConfig or frozen H1–H5
record was modified. No H1/H2/H3/H4/H5 or observed matrix was run. No tests,
typecheck, build, commit or push were performed. Initial untracked
`h4-output.txt` and `h5-output.txt` were left untouched. This existing untracked
document is the only file updated in the E1 freeze slice; whitespace and
repository status checks are reported with the handoff.

## 13. E1 full-precision frozen arithmetic specification

**E1 ARITHMETIC INPUTS: FROZEN PENDING IMPLEMENTATION REVIEW.**
Only the arithmetic inputs, definitions and analytical expectations in
§§13.1–13.3 are frozen. Sections 13.4–13.5 record the deterministic conditioning
and consistency audit; the threshold explicitly proposed in §13.4 is **NOT
FROZEN**. Section 13.6 lists the remaining open design. E1 has not been
implemented or executed, and execution is not authorized.

### 13.1 Baseline, input provenance and precision contract

Repository baseline and audited HEAD:
`f3451a197228f0ac7901f98c2e926d11883f65ba`.

Frozen definitions: Source representation; normalized laboratory height
L=[500,3000] m; q0=q(500); q1=q(3000); Δq=(Δu,Δv)=q1-q0;
S=|Δq|; q_ref=(q0+q1)/2; C0=(10,0) m/s east/north; alpha=1/2.
The reference is the **endpoint arithmetic mean**, not a depth-integrated mean.
Source and Analysis are not substituted for one another. Moore remains
Source-only with respect to Analysis T1 availability, and L2 is deferred.

The four inputs were read directly with `git show BASELINE:path`; their parsed
contents match the working-tree normalized fixtures. The SHA-256 below hashes
the committed blob bytes, not a reserialized object or platform-converted
working-tree text. Fixture paths and exact case/source identities are in §2.

| Case | Normalized fixture basename | SHA-256 of committed bytes |
| --- | --- | --- |
| Goshen 2009 | `nssl1Goshen2155.normalized.json` | `2658b6badd92694f7387eea31b957c4e5ccc19bcacf23f092561ba981f32c25e` |
| Prospect Valley 2010 | `nssl1ProspectValley222346.normalized.json` | `ae63145f676f6dc959dedef9ab0765ad26043df1fc40122da251e21c9fa80f63` |
| Dumas 2010 | `nssl2Dumas215218.normalized.json` | `0c6d4546c61978599f31d152b27d564224792d9ccaba863ba0bb06537a1214b6` |
| Moore 2013 | `ounMoore20130520.normalized.json` | `02d57851210da2213cd636c3ed88feb954c84018caa598f2f3401d97f2de47c2` |

Arithmetic used Node v22.14.0, V8 12.4.254.21-node.22, standard IEEE-754
binary64 numbers and `Math.hypot` for vector lengths. No application,
production-profile, SRH, decomposition, test or harness module was imported or
executed. Git/JSON reads, scalar arithmetic and documentation generation are
the only computations in this slice.

Noninteger values below use **17 significant decimal digits**, sufficient to
round-trip the computed binary64 values; exact integers are shortened. These
are full machine-precision values, not claims of 17-digit observational
accuracy or exact real-number decimal arithmetic. No rounded display value
feeds downstream arithmetic. Reproduce the evaluation order below, including
the unsimplified q_ref and V_sr_ref formulas. Algebraically replacing a
parallel member's V_sr_ref with q0-C0 or q1-C0 can change the final binary64
bit because additions/subtractions round at different stages.

For each endpoint h, take the lower/upper retained knots a,b in §13.2:

```text
span = h_b - h_a
fraction = (h - h_a) / span
u(h) = u_a + fraction * (u_b - u_a)
v(h) = v_a + fraction * (v_b - v_a)

Delta_u = u1 - u0
Delta_v = v1 - v0
S = hypot(Delta_u, Delta_v)
Q = Delta_u * Delta_u + Delta_v * Delta_v
q_ref_e = (u0 + u1) / 2
q_ref_n = (v0 + v1) / 2

p = (0.5 * Delta_u, 0.5 * Delta_v)
r = (0.5 * Delta_v, -0.5 * Delta_u)

C0             = (10, 0)
parallel_plus  = (10 + p_e, 0 + p_n)
parallel_minus = (10 - p_e, 0 - p_n)
right_plus     = (10 + r_e, 0 + r_n)
right_minus    = (10 - r_e, 0 - r_n)

V_sr_ref_e = q_ref_e - C_e
V_sr_ref_n = q_ref_n - C_n
speed_ref = hypot(V_sr_ref_e, V_sr_ref_n)

expected_DeltaSRH = 0, 0, 0, +0.5 * Q, -0.5 * Q
normalized_expected_DeltaSRH = expected_DeltaSRH / Q
```

All eight queried endpoints strictly lie between their two retained brackets;
none needs extrapolation, clamping or an exact-knot special branch. This
component interpolation has the same operation order as the production
`EnvironmentalWindProfile.sampleAtHeight` contract, reproduced independently
from raw knots without calling production code.

**Squared-norm convention:** Q is the direct endpoint sum of squares and
represents S² algebraically. Frozen SRH expectations and normalized responses
use Q, not a round-trip square of the already rounded `hypot` result. For
Goshen and Moore, binary64 `S*S-Q=-2.8421709430404007e-14`; for Prospect and
Dumas it is zero. This floating-point distinction is recorded rather than
hidden in rounded tables. No normalization by rounded S, and no construction
via normalized direction vectors, is permitted for reconstructing the frozen
arithmetic: alpha=1/2 allows the direct p,r formulas above.

### 13.2 Full-precision interpolation inputs and per-case derived inputs

Brackets list zero-based normalized-fixture indices. Knot tuples are
(height m, eastward m/s, northward m/s); q and C tuples are east/north m/s.
Q has units m²/s², and d=0.5*S is the descriptive displacement magnitude in
m/s. The direct component displacements p,r, rather than d times a unit
vector, determine the frozen C vectors.

#### 13.2.1 Goshen 2009

| Endpoint h (m) | Lower index / knot (h,u,v) | Upper index / knot (h,u,v) | Interpolation fraction |
| --- | --- | --- | --- |
| 500 | 97 / (497.60000000000002, -3, 8.0999999999999996) | 98 / (502.69999999999999, -3, 8.0999999999999996) | 0.47058823529411631 |
| 3000 | 502 / (2993.5999999999999, 8.8000000000000007, 6.2999999999999998) | 503 / (3000.1999999999998, 8.8000000000000007, 6.2999999999999998) | 0.96969696969699681 |

| Derived input | Full-precision value |
| --- | --- |
| q0 | (-3, 8.0999999999999996) |
| q1 | (8.8000000000000007, 6.2999999999999998) |
| Δq | (11.800000000000001, -1.7999999999999998) |
| S | 11.936498649101418 |
| Q = Δu²+Δv² | 142.48000000000002 |
| q_ref | (2.9000000000000004, 7.1999999999999993) |
| d = 0.5*S | 5.9682493245507091 |
| deltaC_parallel = p | (5.9000000000000004, -0.89999999999999991) |
| deltaC_right = r | (-0.89999999999999991, -5.9000000000000004) |

#### 13.2.2 Prospect Valley 2010

| Endpoint h (m) | Lower index / knot (h,u,v) | Upper index / knot (h,u,v) | Interpolation fraction |
| --- | --- | --- | --- |
| 500 | 87 / (497.50000000000000, -8.3000000000000007, 12) | 88 / (502, -8.3000000000000007, 12.100000000000000) | 0.55555555555555558 |
| 3000 | 592 / (2997.3000000000002, 6.2000000000000002, 16) | 593 / (3001.4000000000001, 6.2000000000000002, 16.100000000000001) | 0.65853658536582393 |

| Derived input | Full-precision value |
| --- | --- |
| q0 | (-8.3000000000000007, 12.055555555555555) |
| q1 | (6.2000000000000002, 16.065853658536582) |
| Δq | (14.500000000000000, 4.0102981029810270) |
| S | 15.044350796055415 |
| Q = Δu²+Δv² | 226.33249087477321 |
| q_ref | (-1.0500000000000003, 14.060704607046070) |
| d = 0.5*S | 7.5221753980277075 |
| deltaC_parallel = p | (7.2500000000000000, 2.0051490514905135) |
| deltaC_right = r | (2.0051490514905135, -7.2500000000000000) |

#### 13.2.3 Dumas 2010

| Endpoint h (m) | Lower index / knot (h,u,v) | Upper index / knot (h,u,v) | Interpolation fraction |
| --- | --- | --- | --- |
| 500 | 82 / (494.50000000000000, -1.3999999999999999, 11.400000000000000) | 83 / (500.50000000000000, -1.5000000000000000, 11.300000000000001) | 0.91666666666666663 |
| 3000 | 611 / (2998, 10, 18.199999999999999) | 612 / (3001.5000000000000, 10, 18.199999999999999) | 0.57142857142857140 |

| Derived input | Full-precision value |
| --- | --- |
| q0 | (-1.4916666666666667, 11.308333333333334) |
| q1 | (10, 18.199999999999999) |
| Δq | (11.491666666666667, 6.8916666666666657) |
| S | 13.399756423988542 |
| Q = Δu²+Δv² | 179.55347222222221 |
| q_ref | (4.2541666666666664, 14.754166666666666) |
| d = 0.5*S | 6.6998782119942710 |
| deltaC_parallel = p | (5.7458333333333336, 3.4458333333333329) |
| deltaC_right = r | (3.4458333333333329, -5.7458333333333336) |

#### 13.2.4 Moore 2013

| Endpoint h (m) | Lower index / knot (h,u,v) | Upper index / knot (h,u,v) | Interpolation fraction |
| --- | --- | --- | --- |
| 500 | 4 / (493, 2.0563361125971737, 8.2475136733459706) | 5 / (663, 2.6140723555354555, 9.7558508455195909) | 0.041176470588235294 |
| 3000 | 23 / (2974, 14.935154964868444, 15.465805707280998) | 24 / (3321, 14.990663761154806, 14.990663761154810) | 0.074927953890489910 |

| Derived input | Full-precision value |
| --- | --- |
| q0 | (2.0793017226005146, 8.3096216745531191) |
| q1 | (14.939314125397106, 15.430204293450217) |
| Δq | (12.860012402796592, 7.1205826188970978) |
| S | 14.699748835698575 |
| Q = Δu²+Δv² | 216.08261583262163 |
| q_ref | (8.5093079239988096, 11.869912984001669) |
| d = 0.5*S | 7.3498744178492874 |
| deltaC_parallel = p | (6.4300062013982959, 3.5602913094485489) |
| deltaC_right = r | (3.5602913094485489, -6.4300062013982959) |

### 13.3 All 20 frozen C members, reference flows and analytical predictions

Each C and reference wind component and speed is in m/s. ΔSRH is relative to
the same case's C0, in m²/s²; the normalized expected response is dimensionless.
The names below mean the full `C_parallel_plus/minus` and
`C_right_plus/minus` vectors. “Right” is clockwise in atmospheric east/north
C-space. Every V_sr_ref is computed independently as q_ref-C for that row.
No absolute SRH or measured SRH response has been computed.

#### Goshen 2009

| Member | C_e | C_n | q_ref (east,north) | V_sr_ref_e | V_sr_ref_n | speed_ref | Expected ΔSRH | Expected ΔSRH/Q |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| C0 | 10 | 0 | (2.9000000000000004, 7.1999999999999993) | -7.0999999999999996 | 7.1999999999999993 | 10.111874208078342 | 0 | 0 |
| parallel_plus | 15.900000000000000 | -0.89999999999999991 | (2.9000000000000004, 7.1999999999999993) | -13 | 8.0999999999999996 | 15.316984037335809 | 0 | 0 |
| parallel_minus | 4.0999999999999996 | 0.89999999999999991 | (2.9000000000000004, 7.1999999999999993) | -1.1999999999999993 | 6.2999999999999989 | 6.4132674979295849 | 0 | 0 |
| right_plus | 9.0999999999999996 | -5.9000000000000004 | (2.9000000000000004, 7.1999999999999993) | -6.1999999999999993 | 13.100000000000000 | 14.493101807411691 | 71.240000000000009 | 0.50000000000000000 |
| right_minus | 10.900000000000000 | 5.9000000000000004 | (2.9000000000000004, 7.1999999999999993) | -8 | 1.2999999999999989 | 8.1049367671808525 | -71.240000000000009 | -0.50000000000000000 |

#### Prospect Valley 2010

| Member | C_e | C_n | q_ref (east,north) | V_sr_ref_e | V_sr_ref_n | speed_ref | Expected ΔSRH | Expected ΔSRH/Q |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| C0 | 10 | 0 | (-1.0500000000000003, 14.060704607046070) | -11.050000000000001 | 14.060704607046070 | 17.883118129862211 | 0 | 0 |
| parallel_plus | 17.250000000000000 | 2.0051490514905135 | (-1.0500000000000003, 14.060704607046070) | -18.300000000000001 | 12.055555555555557 | 21.914068991245934 | 0 | 0 |
| parallel_minus | 2.7500000000000000 | -2.0051490514905135 | (-1.0500000000000003, 14.060704607046070) | -3.8000000000000003 | 16.065853658536582 | 16.509138492892752 | 0 | 0 |
| right_plus | 12.005149051490513 | -7.2500000000000000 | (-1.0500000000000003, 14.060704607046070) | -13.055149051490513 | 21.310704607046070 | 24.991659560849662 | 113.16624543738661 | 0.50000000000000000 |
| right_minus | 7.9948509485094865 | 7.2500000000000000 | (-1.0500000000000003, 14.060704607046070) | -9.0448509485094863 | 6.8107046070460697 | 11.322324228054569 | -113.16624543738661 | -0.50000000000000000 |

#### Dumas 2010

| Member | C_e | C_n | q_ref (east,north) | V_sr_ref_e | V_sr_ref_n | speed_ref | Expected ΔSRH | Expected ΔSRH/Q |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| C0 | 10 | 0 | (4.2541666666666664, 14.754166666666666) | -5.7458333333333336 | 14.754166666666666 | 15.833509867436916 | 0 | 0 |
| parallel_plus | 15.745833333333334 | 3.4458333333333329 | (4.2541666666666664, 14.754166666666666) | -11.491666666666667 | 11.308333333333334 | 16.122555800975093 | 0 | 0 |
| parallel_minus | 4.2541666666666664 | -3.4458333333333329 | (4.2541666666666664, 14.754166666666666) | 0 | 18.199999999999999 | 18.199999999999999 | 0 | 0 |
| right_plus | 13.445833333333333 | -5.7458333333333336 | (4.2541666666666664, 14.754166666666666) | -9.1916666666666664 | 20.500000000000000 | 22.466346745991238 | 89.776736111111106 | 0.50000000000000000 |
| right_minus | 6.5541666666666671 | 5.7458333333333336 | (4.2541666666666664, 14.754166666666666) | -2.3000000000000007 | 9.0083333333333329 | 9.2973151739867603 | -89.776736111111106 | -0.50000000000000000 |

#### Moore 2013

| Member | C_e | C_n | q_ref (east,north) | V_sr_ref_e | V_sr_ref_n | speed_ref | Expected ΔSRH | Expected ΔSRH/Q |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| C0 | 10 | 0 | (8.5093079239988096, 11.869912984001669) | -1.4906920760011904 | 11.869912984001669 | 11.963151637976681 | 0 | 0 |
| parallel_plus | 16.430006201398296 | 3.5602913094485489 | (8.5093079239988096, 11.869912984001669) | -7.9206982773994863 | 8.3096216745531208 | 11.479863830891121 | 0 | 0 |
| parallel_minus | 3.5699937986017041 | -3.5602913094485489 | (8.5093079239988096, 11.869912984001669) | 4.9393141253971056 | 15.430204293450217 | 16.201482295362883 | 0 | 0 |
| right_plus | 13.560291309448548 | -6.4300062013982959 | (8.5093079239988096, 11.869912984001669) | -5.0509833854497383 | 18.299919185399965 | 18.984190142122443 | 108.04130791631081 | 0.50000000000000000 |
| right_minus | 6.4397086905514511 | 6.4300062013982959 | (8.5093079239988096, 11.869912984001669) | 2.0695992334473585 | 5.4399067826033729 | 5.8202943903637792 | -108.04130791631081 | -0.50000000000000000 |

### 13.4 Conditioning audit and explicit threshold proposal

The minimum across all 20 reference-flow speeds is **5.8202943903637792 m/s**,
at **Moore 2013 / right_minus**, with
V_sr_ref=(2.0695992334473585, 5.4399067826033729) m/s and
C=(6.4397086905514511, 6.4300062013982959) m/s.
The 17-digit value is the computed binary64 speed, not an exact real radical.

| Case | Smallest speed_ref (m/s) | Member | Exact-zero members | Below proposed 1 m/s |
| --- | --- | --- | --- | --- |
| Goshen 2009 | 6.4132674979295849 | parallel_minus | 0 / 5 | 0 / 5 |
| Prospect Valley 2010 | 11.322324228054569 | right_minus | 0 / 5 | 0 / 5 |
| Dumas 2010 | 9.2973151739867603 | right_minus | 0 / 5 | 0 / 5 |
| Moore 2013 | 5.8202943903637792 | right_minus | 0 / 5 | 0 / 5 |

**Threshold proposal for review, NOT FROZEN: tau_ref=1 m/s.** This is solely a
decomposition conditioning/reporting gate and must not alter the frozen C
matrix, SRH predictions, or any member. Proposed inclusive/exclusive rule:

- Both reference components exactly zero: basis **UNDEFINED**; no numeric
  decomposition, no fallback direction.
- 0 < speed_ref < 1 m/s: **CONDITIONING_SENSITIVE**; the basis exists
  mathematically but is excluded from an unqualified well-conditioned
  decomposition claim. Keep the original wind and flag; no fallback basis.
- speed_ref >= 1 m/s: passes this conditioning gate, including equality.

The rationale is explicit: normalization of a nonzero vector has local
direction sensitivity proportional to 1/speed. At 1 m/s the first-order
angular response to a transverse 0.1 m/s perturbation is about 0.1 rad
(5.7 degrees); below that speed the gain increases. The 0.1 m/s example is a
conditioning scale, **not** an estimated observational uncertainty for any
fixture. A 1 m/s gate is a transparent unit-scale reporting choice, not a
physical singularity or a cutoff chosen to remove a troublesome member.
Exact-zero remains the only mathematical undefined-flow case in the inspected
production API. Review may change the reporting gate before it is frozen; it
must not change C or replace low-speed flow with a fabricated basis.

Under this explicit proposal, **none of the 20 members is near-zero**.
The global minimum exceeds the proposed threshold by a factor
5.8202943903637792. No new reference-flow conditioning obstacle to the accepted
alpha=1/2 geometry was found. This conclusion concerns the endpoint-mean
reference only: no local decomposition probe heights are frozen or audited
here, so it does not guarantee nonzero q(h)-C throughout the column.

### 13.5 Analytical consistency checks A–I and arithmetic residuals

Let a=Δu and b=Δv, Q=a²+b²>0. All statements concern the primary layer and
constant prescribed C; none relies on calling the production SRH function.

| Check | Independent argument and audit outcome |
| --- | --- |
| A | C_parallel_plus-C0=0.5*(a,b), so its cross product with Δq is zero and dot product is +0.5*Q>0: parallel. The stored binary64 C subtraction recovers p exactly in all four cases. |
| B | C_parallel_minus-C0=-0.5*(a,b), so its cross product is zero and dot product is -0.5*Q<0: antiparallel. Stored C subtraction recovers -p exactly in all four cases. |
| C | r dot Δq=(b/2)*a-(a/2)*b=0 algebraically; the direct binary64 dot product is exactly zero in all four cases. |
| D | F(δC)=δC_e*b-δC_n*a. F(0)=0; F(±p)=0; F(+r)=(b²+a²)/2=+Q/2; F(-r)=-Q/2. Direct endpoint arithmetic agrees with all 20 frozen expectations. Reconstructing δC from stored C produces only the separately reported one-roundoff residual below. |
| E | F(+r)+F(-r)=0; the stored positive/negative expected responses are exact negatives for every case. |
| F | F(±p)=±(ab/2-ba/2)=0 as an identity, not a fortuitously small result. Both direct-displacement and stored-C-subtraction determinants are exactly zero for all eight parallel members. |
| G | F(±r)/Q=±1/2 algebraically for Q>0. Frozen binary64 division by Q also returns exactly ±0.5; other normalized responses are zero. |
| H | Every S in §13.2 is strictly positive; minimum S=11.936498649101418 m/s (Goshen). No case has zero bulk shear. |
| I | No member has both reference-flow components zero. Dumas / parallel_minus has zero eastward reference component but northward=18.199999999999999 m/s; this is not a zero vector or an undefined basis. |

The two distinct arithmetic checks are retained: (i) F applied directly to
the intended displacement p/r, and (ii) F applied to the displacement recovered
from the stored C components. Adding C0 and later subtracting it can round.

| Case | Direct r dot Δq | Max abs residual F(intended δC)-expected (m²/s²) | Max abs residual F(stored C-C0)-expected (m²/s²) |
| --- | --- | --- | --- |
| Goshen 2009 | 0 | 0 | 0 |
| Prospect Valley 2010 | 0 | 0 | 0 |
| Dumas 2010 | 0 | 0 | 0 |
| Moore 2013 | 0 | 0 | 1.4210854715202004e-14 |

The only nonzero recovered-C residual is Moore / right_plus:
F(stored C-C0)=108.04130791631080 m²/s² versus the frozen endpoint expectation
108.04130791631081 m²/s², residual
-1.4210854715202004e-14 m²/s². Its stored C_e is
13.560291309448548, so subtracting 10 yields 3.5602913094485480 rather than
the intended r_e=3.5602913094485489. This is a binary64 addition/subtraction
effect, not a scientific geometry discrepancy. All other recovered determinants
equal the frozen expected binary64 values. These audit residuals do **not**
freeze the future numerical tolerances, which must also account for the
independent full-profile SRH summation. No observed SRH residual is reported.

### 13.6 Exact quantities still NOT frozen

**DESIGN PROPOSALS / SEPARATE REVIEW REQUIRED:**

- Eulerian spatial/query grid and any local decomposition probe heights.
- Decomposition conditioning threshold and its final reporting/applicability
  rule; the explicit 1 m/s proposal in §13.4 is not a frozen parameter.
- E1 numerical equality/residual tolerances, including SRH summation tolerance;
  the earlier synthetic-based candidates in §7 are not independently frozen
  for this observed protocol.
- Exact executable E1 assertions, support/applicability handling and evidence
  implementation details beyond the frozen arithmetic definitions.
- Lagrangian storm-local geometry, operand composition, seeds, integration
  method, timestep, duration, sampling/termination choices, T1 material
  threshold and Lagrangian execution/classification criteria.
- Any deeper L2 or case-specific descriptive-layer work; L2 remains deferred.

The accepted reference-flow definition is not open; the optional local flows
are. No frozen arithmetic input grants permission to instantiate simulations,
run decomposition/SRH against the matrix or execute a validation stage.

### 13.7 Slice provenance and next authorization gate

For this E1 freeze update, inspected: the current document; the four committed
normalized fixtures named in §2; `EnvironmentalWindProfile.ts` interpolation;
`streamwiseCrosswiseVorticity.ts` exact-zero behavior; ESC/IGRA source-spec
identities; repository HEAD/status. Section 11 retains the broader inventory
from the preceding design audit; this update did not repeat native ingestion
or construct Analysis columns. Scalar arithmetic generated the tables above,
and checks A–I are algebraic/input-arithmetic checks, not test-suite execution.
The completed Markdown was then read back: all eight printed endpoint brackets
were matched to their committed knots, and all 20 printed member rows were
reconstructed from those brackets. Every printed scalar/vector round-tripped
to the computed binary64 value without loss of precision.

The full-precision audit confirms the reviewed geometry and alpha=1/2 without
a new scientific reference-flow problem. Only E1 arithmetic inputs are
**FROZEN PENDING IMPLEMENTATION REVIEW**. Intended next gate:

**E1 test-only implementation design/review -> implementation review closure
-> separately authorized E1 execution.**

This slice implements nothing. E1 execution remains unauthorized, and E1
must close before any Lagrangian stage. No production code, test, validation
harness stage, simulation, H1/H2/H3/H4/H5, prior campaign or observed matrix
was executed. No production/harness/UI/ScenarioConfig file or frozen H1–H5
record was modified; parent §12 Conclusions remains untouched. No commit or
push was performed. **STOP FOR SCIENTIFIC REVIEW.**


## 14. E1 execution results and human scientific closure

**Human scientific closure — 2026-09-13.** The first separately authorized E1
scientific execution ran exactly once and subsequently received human scientific
review. **Human review, not runner success, establishes this CLOSED · PASS.**
The original execution artifacts retain their emitted pre-review status; they
are not rewritten to incorporate this later classification.

```text
E1 SCIENTIFIC EXECUTION — CLOSED · PASS
E1 VALID CONTROL — YES
E1 UNEXPLAINED DEVIATIONS — NONE
E1 PHYSICS FAILURE ESTABLISHED — NO
PRODUCTION PHYSICS — UNCHANGED
LAGRANGIAN STAGE — NOT AUTHORIZED / NEXT DESIGN GATE
```

### 14.1 Execution provenance and local immutable evidence

- Runtime HEAD: `d158482ad5fbccaa24e1ec48822c803bdc3200f6`.
- Reviewed implementation SHA: `c54f8857a808de0aae316556306af2069c7b5aa3`.
- Execution count: exactly one; runner exit **0**; emitted run state **COMPLETE**.
- Vitest: **1 passed, 11 skipped**.
- Preflight: **336 checks, 0 blocks**.
- Members collected: **20/20**; uncollected members: **0**; faults: **0**.
- Applicable assertions: **PASS 1054 / INVALID CONTROL 0 / UNEXPLAINED 0 / FAIL 0**.
- **N_A 22**: **12 BASELINE_REFERENCE**, **10 COLUMN_UNAVAILABLE**.
- Independent assertions recorded: **480**. Repeated invariants and dependent
  corroboration are not additional independent physical experiments.

| Local immutable execution artifact | SHA-256 |
| --- | --- |
| `e1-first-d158482.evidence.json` | `7e2b2e2c1e78d145fc5d4eef5da87667e61c8bc876b8bb55ee7cbc2b2119e916` |
| `e1-first-d158482.stdout.txt` | `9e2729faa5dbdcb3a1abfccd48fdcc6fe0254519a8fd6e7a5bc23dfb1ecf2b18` |

These filenames are relative to the repository root. The 4.66 MB JSON and full
stdout remain local, immutable execution evidence; their contents were not
modified, staged or committed. Existing H4/H5 output files remain untouched
and are not added. This documentation records provenance, not another execution.

### 14.2 Recorded E1-A–F assertion summary

| Group | PASS | INVALID CONTROL | UNEXPLAINED | FAIL | N_A |
| --- | ---: | ---: | ---: | ---: | ---: |
| E1-A | 168 | 0 | 0 | 0 | 0 |
| E1-B | 188 | 0 | 0 | 0 | 0 |
| E1-C | 32 | 0 | 0 | 0 | 4 |
| E1-D | 140 | 0 | 0 | 0 | 0 |
| E1-E | 176 | 0 | 0 | 0 | 8 |
| E1-F | 350 | 0 | 0 | 0 | 10 |
| Total | 1054 | 0 | 0 | 0 | 22 |

### 14.3 Scientific findings within the frozen controls

1. Source/environmental invariants remained unchanged across all five C members.
2. Storm-relative environmental wind showed the frozen direct translation
   response to C.
3. For all four observed Source profiles, SRH response matched the frozen
   endpoint-arithmetic prediction: parallel_plus/parallel_minus gave numerically
   zero DeltaSRH at binary64-scale residuals; right_plus/right_minus matched
   +Q/2 and -Q/2. Every residual was far inside the frozen 1e-6 m²/s² tolerance.
4. Finite-layer streamwise/crosswise decomposition followed the member-specific,
   C-dependent reference basis, with no invalid exact-zero controls.
5. Fixed-point seven-operand composition showed the expected direct C response
   while the six prescribed storm-local operands remained unchanged.
6. Same-point local T1 remained invariant across the five C members for each
   case/probe. This agrees with the frozen Eulerian prediction: changing C alone
   does not directly change T1 = omega_h · grad_h(w_updraft) at a fixed point
   when q(h) and the prescribed updraft are unchanged.
7. Source and Analysis T1 are representation-specific and need not agree.
   Dumas Source T1 = 0 at both frozen probes because its native Source segment
   has exactly zero local shear; Analysis T1 is nonzero at those probes.
   This is valid evidence, not a failed or invalid control.
8. Moore behaved as preregistered: Source T1 was supported, Analysis was
   unavailable, availability assertions were PASS, and 10 numeric Analysis
   records remained N_A / COLUMN_UNAVAILABLE. No Source substitution occurred.

### 14.4 Narrow interpretation and explicit exclusions

E1 validates the frozen observed Eulerian C-sensitivity identities and
implementation routing for the four selected observed wind profiles under the
V1 kinematic model. Direct C-dependent quantities responded as preregistered;
quantities predicted to be Eulerian invariants remained invariant within the
frozen controls and tolerances.

E1 does **not** establish that prescribed C is the actual storm motion of any
observed storm, reconstruct any real supercell, predict tornadoes/outcomes,
validate thermodynamics, establish a direct C-driven change of local Eulerian
T1, or establish any Lagrangian/path-mediated C response. No broader storm or
campaign conclusion follows from this closure.

### 14.5 Next gate and documentation-only boundary

**NEXT ACTION:** Design the observed Lagrangian C-sensitivity stage under a new
separately reviewed/frozen protocol. No Lagrangian implementation or execution
is authorized by E1 closure. This documentation task does not start or design
that stage.

Frozen arithmetic inputs and the E1 implementation contract, src/**,
production physics/UI/ScenarioConfig/DEMO composition, H1–H5 evidence and
classifications, and parent §12 Conclusions remain unchanged. No E1 rerun,
H1–H5 run, tests/typecheck/build, Simulation/trajectory execution, commit or push
occurred in this docs-only closure task. **STOP FOR E1 CLOSURE-DOC REVIEW.**
