# Storm-Motion Sensitivity & V1 Validation

**Status:** RESEARCH PROTOCOL · CAMPAIGN ACTIVE · ARCHITECTURE-SYNCHRONIZED · EXPECTATIONS FROZEN

**Pre-run correction (2026-09-12):** the SRH integrand and H2 sign oracle were corrected to canonical physics doc 09 before any backend campaign execution. See the [formal correction record](2026-09-12-storm-motion-srh-sign-correction.md). All other frozen expectations and inputs are unchanged.

## 1. Research purpose

This document defines a controlled validation campaign for the existing V1 kinematic laboratory before any storm-motion sensitivity feature is implemented in the UI.

The goal is not to discover that storm-relative quantities depend on storm motion. The goal is to derive the expected response independently, freeze those expectations before running the backend, and then use controlled changes in constant storm motion `C` to test whether V1 preserves the correct invariants and reproduces the expected dependencies.

The experiment must distinguish between:

- quantities invariant under changing only constant storm motion `C`;
- quantities directly dependent on `C`;
- quantities changing only indirectly through the Lagrangian trajectory.

Observed/environmental fields, storm-relative representations, prescribed laboratory fields, and trajectory-sampled diagnostics remain conceptually separate throughout the experiment.

The implementation-fact companion is:

- `docs/research/2026-09-11-storm-motion-sensitivity-architecture-audit.md`

That audit is closed. Its A6/A7/A8 findings are incorporated below.

---

## 2. Core definitions

Let the observed environmental wind profile be

`q(h) = (u(h), v(h))`.

Let constant storm motion be

`C = (C_e, C_n)`.

Storm-relative environmental wind is

`r(h) = q(h) - C`.

Changing only constant `C` leaves the observed sounding unchanged. For any two levels,

`(q_2 - C) - (q_1 - C) = q_2 - q_1`,

therefore vertical shear and quantities derived only from vertical derivatives of the environmental wind remain unchanged.

The V1 reduced-field tilting diagnostic is

`T1 = omega_h · grad_h(w_updraft)`.

It is not the full tilting term of the laboratory flow and is not a vorticity-evolution equation for a tracer.

At a fixed spatial point, changing only `C` leaves both environmental horizontal vorticity `omega_h` and the prescribed updraft gradient unchanged. Therefore local Eulerian `T1(x,y,z)` must remain unchanged.

A tracer may nevertheless sample different values because changing `C` changes the environmental advection contribution to `V_total`, hence its trajectory.

---

## 3. Quantity classification

### 3.1 C-invariant

Expected to remain unchanged:

- observed environmental wind `q(h)`;
- vertical shear `dq/dh`;
- environmental horizontal vorticity `omega_h`;
- prescribed updraft `w(x,y,z)`;
- `grad_h(w)` at a fixed spatial point;
- local Eulerian `T1(x,y,z)`;
- storm-relative hodograph shape, including inter-level distances and segment directions.

### 3.2 Directly C-dependent

Expected to change directly with `C`:

- storm-relative wind `r(h) = q(h) - C`;
- storm-relative hodograph position relative to the origin;
- streamwise/crosswise decomposition of environmental horizontal vorticity relative to storm-relative flow;
- SRH for a fixed layer, except along iso-SRH directions;
- full advecting velocity at a fixed point where the environmental storm-relative operand contributes.

### 3.3 Indirect / path-mediated

Expected to change only through the altered trajectory:

- tracer trajectory `X(t)`;
- prescribed-field values sampled along that trajectory;
- `T1(X(t))` sampled along that trajectory;
- other Lagrangian diagnostics derived from the recorded path.

---

## 4. Hypothesis H1 — Eulerian translation invariance

### 4.1 Synthetic environmental control

Use a linear wind profile with a straight hodograph along the eastward axis:

| h (km) | u (m/s) | v (m/s) |
|---:|---:|---:|
| 0 | 0 | 0 |
| 1 | 10 | 0 |
| 2 | 20 | 0 |
| 3 | 30 | 0 |

Thus the 0–3 km bulk shear is parallel to `+east`.

No tracer is required for the primary H1 Eulerian control.

### 4.2 Sweep A — C parallel to bulk shear

Use:

- `C1 = (0, 0) m/s`
- `C2 = (10, 0) m/s`
- `C3 = (20, 0) m/s`
- `C4 = (30, 0) m/s`

Expected:

- rigid storm-relative hodograph translation with no deformation;
- invariant `q`, shear, `omega_h`, prescribed `w`, prescribed `grad_h(w)`, and local T1 at identical spatial points;
- changing storm-relative wind;
- potentially changing streamwise/crosswise decomposition;
- `SRH_0-3 = 0` for every member of this sweep.

At `h = 1.5 km`, `q=(15,0) m/s`:

- with `C=(10,0)`, `r=(+5,0)`;
- with `C=(20,0)`, `r=(-5,0)`.

Environmental `omega_h` remains unchanged, streamwise vorticity remains zero, crosswise magnitude is unchanged, and the signed crosswise component reverses under the frozen left-normal convention.

If exact horizontal `|r|=0`, streamwise/crosswise decomposition is undefined. The core diagnostic is expected to report the undefined domain rather than numeric zero.

### 4.3 Sweep B — C transverse to bulk shear

Use:

- `C5 = (10, -10) m/s`
- `C6 = (10, 0) m/s`
- `C7 = (10, +10) m/s`

Expected:

- SRH changes across the sweep;
- storm-relative wind and hodograph position change;
- streamwise/crosswise decomposition changes;
- all C-invariant Eulerian quantities remain unchanged.

### 4.4 H1 investigation criteria

Investigate if changing only `C` causes beyond frozen tolerance:

- hodograph deformation rather than translation;
- changes in `q`, shear, `omega_h`, prescribed `w`, prescribed `grad_h(w)`, or same-point local T1;
- non-zero 0–3 km SRH in Sweep A;
- failure of the expected 1.5 km signed-crosswise reversal.

Predictions are not edited after execution merely to fit backend output.

---

## 5. Hypothesis H2 — direct storm-relative C response

### 5.1 Synthetic control

Reuse the H1 straight profile. Hold environmental and prescribed fields fixed.

Use:

- `C1 = (10, 0) m/s`
- `C2 = (10, +10) m/s`
- `C3 = (20, +10) m/s`

The transition `C1 -> C2` is transverse to 0–3 km bulk shear. The transition `C2 -> C3` is parallel to it.

### 5.2 Frozen SRH convention and expectations

Use

`SRH = integral[(v - C_n) du/dh - (u - C_e) dv/dh] dh`.

Expected:

- `SRH_0-3(C1) = 0 m^2/s^2`;
- `SRH_0-3(C2) = -300 m^2/s^2`;
- `SRH_0-3(C3) = -300 m^2/s^2`.

Thus `C2` and `C3` are the frozen iso-SRH degeneracy pair even though `r_C2(h) != r_C3(h)` at every level.

### 5.3 Frozen decomposition control at 1.5 km

At `h=1.5 km`, `q=(15,0)`:

- `C2` gives `r2=(+5,-10)`;
- `C3` gives `r3=(-5,-10)`.

With the production core convention

`c_hat = (-v,u)/|V_sr,h|`,

expected:

- identical streamwise component;
- identical crosswise magnitude;
- opposite signed crosswise component.

If the synthetic evaluation hits exact horizontal `V_sr=(0,0)`, expected outcome is undefined decomposition / `StreamwiseCrosswiseVorticityError`, never numeric zero.

### 5.4 H2 investigation criteria

Investigate if beyond frozen tolerance:

- SRH differs from `0`, `-300`, `-300` as specified;
- C2/C3 cease to be iso-SRH;
- the hodograph deforms;
- C-invariant Eulerian quantities change;
- storm-relative wind does not respond to C;
- the 1.5 km decomposition fails the frozen equality/opposite-sign relations.

---

## 6. Hypothesis H3 — Lagrangian path-mediated response

### 6.1 Hypothesis

Changing only constant storm motion `C` can alter the tracer trajectory because the storm-relative environmental contribution to the full advecting velocity changes.

The causal chain is

`C -> V_env,sr -> V_total -> X(t) -> sampled w(X(t)), sampled T1(X(t))`.

H3 must never be interpreted as direct C-dependence of the prescribed updraft or of local Eulerian T1.

### 6.2 Frozen synthetic sounding

Use the curved piecewise-linear profile:

| h (km) | u (m/s) | v (m/s) |
|---:|---:|---:|
| 0 | 15 | 8 |
| 1 | 23 | 10 |
| 2 | 29 | 16 |
| 3 | 31 | 24 |

The sounding is identical in both H3 runs.

### 6.3 Frozen production-compatible updraft mapping

Use the existing `VerticalEnvelopeUpdraftField` law, not the earlier height-invariant approximation.

Frozen parameters:

- axis `(x,z)=(0,0) m`;
- horizontal `sigma=1000 m`;
- `W0=20 m/s`;
- `baseHeight=0 m`;
- `topHeight=8000 m`;
- no rotation;
- no lower radial inflow;
- no upper or near-ground outflow;
- no downdraft;
- no other prescribed horizontal storm-local field.

The field is

`w(x,y,z) = W0 * exp(-(x^2+z^2)/(2*sigma^2)) * sin(pi*y/8000)`

for `0 < y < 8000 m`, with the existing V1 zero-at/outside-lid semantics.

At fixed altitude the horizontal gradient is radial and vanishes on the axis. The global maximum horizontal-gradient scale occurs where the vertical envelope is maximal and `r=sigma`; its analytical upper bound is

`(W0/sigma) * exp(-1/2) ~= 0.01213 s^-1`.

At other heights the gradient is reduced by the half-sine vertical factor.

### 6.4 Frozen seed, timestep, window, and storm motions

Use the same seed in both runs:

`X0 = (-3000, 500, 0) m`.

This supersedes the obsolete `y0=0` seed.

Use:

- explicit Euler;
- `dt = 0.1 s`;
- integration window `0 <= t <= 600 s`;
- `C_A = (5,8) m/s`;
- `C_B = (5,13) m/s`.

At the actual frozen initial altitude `h=500 m`, piecewise-linear interpolation gives

`q(500 m) = (19,9) m/s`.

Therefore initial storm-relative winds are

- Run A: `r_A=(14,+1) m/s`;
- Run B: `r_B=(14,-4) m/s`.

Run A is therefore initially nearly aligned toward the updraft from the west, while Run B has the larger cross-track component. The exact trajectories remain experiment outcomes.

The seed must not be moved after results merely to improve contrast.

### 6.5 Frozen Eulerian expectations

Across Run A and Run B, identical spatial points must have identical:

- environmental `q`;
- shear and `omega_h`;
- prescribed `w`;
- prescribed `grad_h(w)`;
- local Eulerian T1.

Any C-response in sampled values must arise through the differing paths.

### 6.6 Frozen Lagrangian expectations

Expected in general:

`X_A(t) != X_B(t)`.

Primary qualitative geometry target:

- Run A: near-core passage;
- Run B: flank passage.

Primary sampled-ascent expectation:

`max_t w_A(t) > max_t w_B(t)`.

No ordering is frozen for `max |T1|`; a flank trajectory may sample a strong gradient even with weaker peak `w`.

### 6.7 Frozen H3 diagnostic path

The synthetic H3 sounding is an ordinary `EnvironmentalWindProfile`, not an ESC Analysis column.

Therefore the primary synthetic H3 T1 value path is the existing core/legacy `DiagnosticTiltingTendency(profile, updraft)`, using the same synthetic profile and the same frozen updraft instance as the experiment.

However, legacy numeric zero outside profile support is **not** accepted as T1 evidence. The harness must gate every H3 T1 metric by existence of a real containing environmental sounding segment. Samples outside the synthetic 0–3 km sounding support are excluded from T1 maxima/sign evidence rather than interpreted as physical zero.

This is a synthetic-validation convention only. It does not convert synthetic H3 into ESC Analysis semantics.

For observed-environment Analysis work later:

- `FULL_SUPPORT` and `BOUNDARY_CONDITIONED` are numeric T1 states and their status must be preserved;
- `OUT_OF_DOMAIN` and `COLUMN_UNAVAILABLE` have no numeric T1 and are never zero substitutes;
- Analysis height support is profile-relative, not tied to the laboratory ground plane.

### 6.8 Frozen T1 sign-reversal control

For Run A, sign reversal is conditional on the realized geometry actually sampling opposite flanks of one near-core passage with a non-zero projection onto environmental `omega_h`.

Define the experiment-level material-sign guard

`epsilon_T1 = 1e-6 s^-2`.

This is **not** a physical zero epsilon. It classifies evidence only:

- `T1 > +epsilon_T1` -> materially positive;
- `T1 < -epsilon_T1` -> materially negative;
- `|T1| <= epsilon_T1` -> neutral/near-zero for classification only.

Run A satisfies the clean sign-reversal control only if:

1. valid numeric T1 on one side of one core passage has one material sign;
2. valid numeric T1 on the other side has the opposite material sign;
3. both pieces of sign evidence belong to the same containing environmental sounding segment, so segment `omega_h` is unchanged;
4. the evidence is local to that one passage, not merely a plus and minus somewhere in the 600 s run.

Positive-to-negative and negative-to-positive are both acceptable.

A sampled neutral point is not required. If adjacent valid samples jump directly between opposite material signs, record a **discrete sign transition**. Do not interpolate a zero-crossing time for the primary metric.

If the containing sounding segment changes across the candidate event, record it descriptively but do not count it as this clean same-segment sign-reversal PASS.

Run B is not required to reverse sign.

---

## 7. Numerical controls and tolerances

**Status:** FROZEN FOR H1/H2/H3 PRE-EXPERIMENT EXECUTION.

### 7.1 Strict equality class

For quantities expected identical under changing only C at the same point:

`|a-b| <= atol + rtol*max(|a|,|b|)`

with

- `atol = 1e-9`;
- `rtol = 1e-9`.

This applies to same-point `q`, shear, `omega_h`, prescribed `w`, prescribed `grad_h(w)`, and local T1.

Do not widen these tolerances after observing a failed result merely to make it pass.

### 7.2 SRH analytical controls

Frozen:

- expected zero: `|SRH| <= 1e-6 m^2/s^2`;
- expected `-300`: `|SRH - (-300)| <= 1e-6 m^2/s^2`, equivalently `|SRH + 300| <= 1e-6 m^2/s^2`.

### 7.3 H3 same-point Eulerian grid

Use horizontal points:

- `(0,0)`;
- `(+1000,0)`;
- `(-1000,0)`;
- `(0,+1000)` m in the world `(x,z)` horizontal plane.

Use vertical heights:

- `y=500 m`;
- `y=1500 m`;
- `y=2500 m`.

At all twelve points compare at minimum:

- local `w`;
- local horizontal `grad_h(w)`;
- local T1.

Run A and Run B must agree under §7.1.

### 7.4 H3 trajectory geometry

Define horizontal radius from the updraft axis as

`r(t) = sqrt(x(t)^2 + z(t)^2)`.

Frozen targets:

- Run A: `r_min,A <= 500 m`;
- Run B: `750 m <= r_min,B <= 1500 m`.

At `r=0.5 sigma`, the horizontal Gaussian factor is `exp(-0.125) ~= 0.882` of the **local height-dependent axial updraft**, not necessarily `17.65 m/s`, because V1 applies the vertical half-sine envelope.

Failure of these geometry targets is first classified as a synthetic-case/architecture-mapping problem, not automatically a physics failure.

### 7.5 H3 sampled-w contrast

Freeze:

`max_t w_A(t) >= max_t w_B(t) + 2 m/s`.

If Run A exceeds Run B by less than `2 m/s`, the primary material contrast is not realized and the control must be reviewed before drawing a physics conclusion.

No analogous ordering is required for `max |T1|`.

### 7.6 H3 discrete sampling semantics

Primary H3 metrics use production path semantics:

1. capture initial state at `t=0`;
2. integrate with fixed `dt=0.1 s`;
3. after every accepted completed step, record accepted position and post-step simulation time;
4. sample `w` and valid T1 at that recorded `(P,t)`;
5. no render-frame cadence;
6. no decimation for primary metrics;
7. no interpolation between samples for primary metrics.

If active for the full 600 s, this gives 6000 Euler steps and 6001 recorded path samples including the initial state.

### 7.7 PASS/FAIL discipline

Each check receives one of:

- `PASS` — frozen criterion satisfied;
- `FAIL` — frozen criterion violated with no known setup issue;
- `UNEXPLAINED` — discrepancy exists but cause not isolated;
- `INVALID CONTROL` — synthetic case did not realize intended geometry or could not be faithfully represented.

Predictions are never rewritten post hoc simply to match backend output.

---

## 8. Frozen architecture / harness boundary

### 8.1 Synthetic C injection seam

Do **not** add a storm-motion override to the production DEMO composer merely for validation.

Construct the existing low-level objects directly:

`synthetic EnvironmentalWindProfile`
`-> EnvironmentalWindField(profile)`
`-> StormRelativeEnvironmentalAdvectionField(environmentField, C_test)`.

Only the environmental advection operand receives `C_test`.

For H1/H2, call the existing environmental/diagnostic functions directly wherever a full composite is unnecessary.

For H3 construct only:

`V_total = CompositeVelocityField([V_env_sr(C_test), frozen VerticalEnvelopeUpdraftField])`.

Do not include DEMO rotation, lower inflow, upper outflow, near-ground outflow, or downdraft.

The paired H3 runs differ only in the `StormMotion` passed to `StormRelativeEnvironmentalAdvectionField`. Profile, updraft, seed, integrator, timestep, domain policy, sampling policy, and metric code remain identical.

### 8.2 Production code explicitly not required to change

This campaign does not require:

- a new `stormMotion` argument on `composeDemoTracerFields()`;
- mutable/global storm-motion state;
- a UI storm-motion control;
- a production `ScenarioConfig` redesign;
- physics changes to `StormRelativeEnvironmentalAdvectionField`;
- changes to `CompositeVelocityField`.

Any later user-facing C parameterization is a post-validation product decision.

---

## 9. Experimental procedure

**Status:** HARNESS CONTRACT FROZEN · IMPLEMENTATION REVIEW COMPLETE · H1 CLOSED / PASS · H2 CLOSED / PASS · H3 EULERIAN CLOSED / PASS · H3 TRAJECTORIES CLOSED / INVALID CONTROL.

The procedure/output contract is frozen in [the harness design](2026-09-12-storm-motion-validation-harness-design.md). H1 and H2 were separately authorized, executed, and classified PASS. H2 authorization followed the commit/push of H1 documentation. H3 Eulerian was separately executed and classified PASS, followed by separately authorized H3 trajectories, classified INVALID CONTROL for the clean same-segment sign-reversal control; partial valid evidence is preserved in §10. H3 documentation/classification closure is complete. H4 is CLOSED · INVALID CONTROL. H5 PRE-RUN SCIENTIFIC DESIGN REVIEWED / APPROVED · H5 EXPECTATIONS FROZEN; H5 TEST-ONLY IMPLEMENTATION COMPLETE · H5 IMPLEMENTATION REVIEW COMPLETE / CLOSED; H5 EXECUTION NOT AUTHORIZED. See §14. This slice does not authorize a campaign run, altered control, or production implementation.

After the separate execution gate, preserve this order:

1. H1;
2. H2;
3. H3;
4. record results without rewriting expectations;
5. investigate every discrepancy;
6. build the observed C-sensitivity matrix only after synthetic validation;
7. write the validation report;
8. only then decide whether production/V1.1 changes are warranted.

No H1/H2/H3 backend execution occurs before the harness procedure/output contract is frozen.

---

## 10. Results

### H1 — executed 2026-09-12 — PASS

H1 was the first separately authorized backend campaign stage. All frozen H1 checks passed. Evidence below records the supplied observations and Vitest summary from that completed stage; this documentation slice did not rerun it.

Vitest: **1 test file passed; 12 tests passed / 3 skipped**. Campaign H1 passed; H2, H3-Eulerian, and H3-trajectories were skipped in that run and were not yet executed / authorized at the time of this H1 record.

- **Sweep A:** for `C=(0,0),(10,0),(20,0),(30,0) m/s`, `SRH_0-3=[0,0,0,0] m^2/s^2`. All four checks passed at the frozen absolute tolerance `1e-6 m^2/s^2`.
- **Translation and Eulerian invariants:** environmental `q(h)` remained frozen; storm-relative and environmental differences for each 0–1, 1–2, and 2–3 km hodograph segment were identical: `(10,0) m/s`. Shear, environmental `omega_h`, prescribed `w`, `grad_h(w)`, and same-point local `DiagnosticTiltingTendency` T1 remained invariant. All strict frozen same-point equality checks passed.
- **Signed crosswise reversal at 1500 m:** `C=(10,0)` gave `(omegaStreamwise,omegaCrosswise)=(0,+0.01) s^-1`; `C=(20,0)` gave `(0,-0.01) s^-1`. Zero/equal streamwise, equal crosswise magnitude, and opposite signed crosswise matched the frozen left-normal convention; the check passed.
- **Exact horizontal `V_sr=0`:** decomposition remained undefined via `StreamwiseCrosswiseVorticityError`, without coercion to numeric zero. Expected control behavior passed.
- **Sweep B:** for `C=(10,-10),(10,0),(10,+10) m/s`, `SRH_0-3=[+300,0,-300] m^2/s^2`. At 1500 m, the corresponding `(omegaStreamwise,omegaCrosswise)` pairs were `(+0.00894427190999916,+0.00447213595499958)`, `(0,+0.01)`, and `(-0.00894427190999916,+0.00447213595499958) s^-1`. `H1/sweep-B-response` passed.

**H1 CLOSED · PASS.** No FAIL, UNEXPLAINED, or INVALID CONTROL classification was observed; no H1 physics failure was identified. This subsection records H1 control results only, without a final campaign conclusion.

### H2 — executed 2026-09-12 — PASS

H2 was separately authorized and executed after H1 evidence/status documentation was committed/pushed. The following supplied observations and Vitest summary are evidence from that completed H2 stage; this documentation slice did not rerun it.

The synthetic straight sounding was `q(0 km)=(0,0)`, `q(1 km)=(10,0)`, `q(2 km)=(20,0)`, and `q(3 km)=(30,0) m/s`.

| Control | Storm motion (east, north), m/s | Observed SRH_0-3, m²/s² |
| --- | --- | --- |
| C1 | (10,0) | 0 |
| C2 | (10,10) | -300 |
| C3 | (20,10) | -300 |

All SRH values matched the frozen expectations within the existing absolute tolerance `1e-6 m^2/s^2`. The iso-SRH control gave `SRH(C2)-SRH(C3)=0`: **PASS**.

At 1500 m:

| Control | V_sr (east, north), m/s | omegaStreamwise, s⁻¹ | omegaCrosswise, s⁻¹ |
| --- | --- | --- | --- |
| C2 | (5,-10) | -0.00894427190999916 | +0.00447213595499958 |
| C3 | (-5,-10) | -0.00894427190999916 | -0.00447213595499958 |

Streamwise components were equal, crosswise magnitudes were equal, signed crosswise components were opposite, and storm-relative winds were distinct. The decomposition control passed.

Rigid-translation controls passed: environmental `q`, environmental and storm-relative inter-level differences, shear, and horizontal environmental vorticity remained unchanged. Same-point Eulerian controls passed: prescribed `w`, prescribed horizontal gradient, and local T1 remained unchanged.

Vitest: **1 test file passed; 12 tests passed / 3 skipped / 15 total**. Only campaign H2 was explicitly executed in that run; H1, H3-Eulerian, and H3-trajectories were skipped. H3 was **NOT EXECUTED / NOT AUTHORIZED** at the time of this H2 record.

**H2 CLOSED · PASS · NO UNEXPLAINED DEVIATIONS · NO INVALID CONTROL · NO PHYSICS FAILURE.** These observations do not constitute a final campaign conclusion or authorize H3.

### H3 Eulerian — CLOSED · PASS

H3 Eulerian was separately executed and classified PASS before H3 trajectories was separately authorized and executed. This Eulerian classification is recorded independently of the trajectory control outcome below; it does not establish a clean trajectory sign reversal.

### H3 trajectories — CLOSED · INVALID CONTROL

The following supplied observations are from the completed, separately authorized H3-trajectories run. No tests or campaign stages were rerun for this documentation record. Frozen predictions remain unchanged in §§6–7.

#### Trajectory/sample integrity — observed evidence and classification

| Observable | Run A | Run B |
| --- | --- | --- |
| Executed Euler steps | 6000 | 6000 |
| Recorded samples | 6001 | 6001 |
| Final simulation time, s | 600.0000000000679 | 600.0000000000679 |
| Final tracer state | active | active |
| Final x, m | 8121.0277724765265 | 7504.478913704676 |
| Final y, m | 1470.0264790241065 | 1203.0747825548285 |
| Final z, m | -2015.5190439631856 | 1571.9740042786143 |
| Trajectory/sample integrity | PASS | PASS |

#### Geometry — frozen prediction, observed evidence, classification

Frozen predictions: `r_min,A <= 500 m`; `750 m <= r_min,B <= 1500 m`.

| Observable at sampled minimum radius | Run A | Run B |
| --- | --- | --- |
| Sample index | 2017 | 1950 |
| Simulation time, s | 201.69999999999283 | 194.9999999999932 |
| x, m | -24.496312262258442 | -155.29054057926237 |
| y, m | 914.3698953056625 | 802.3813169284911 |
| z, m | -239.6259219344389 | 751.3226351448191 |
| r_min, m | 240.87476367892899 | 767.2032677682978 |
| w, m/s | 6.827156590018876 | 4.617929011820854 |
| T1, s⁻² | -0.000013422189855977302 | +0.000026322195367379 |
| Containing sounding segment, m | 0–1000 | 0–1000 |
| Geometry classification | PASS | PASS |

#### Sampled-w contrast — frozen prediction, observed evidence, classification

Frozen prediction: `max(w_A) >= max(w_B) + 2 m/s`.

| Observable at sampled maximum w | Run A | Run B |
| --- | --- | --- |
| Sample index | 2212 | 2134 |
| Simulation time, s | 221.19999999999172 | 213.39999999999216 |
| x, m | 323.4582019992173 | 153.20349416444836 |
| y, m | 1054.057390121755 | 890.3746548582399 |
| z, m | -278.7494734860081 | 812.1991264588909 |
| r, m | 426.99704613649635 | 826.5220696658872 |
| Maximum sampled w, m/s | 7.343263876516004 | 4.868952635583312 |

Observed contrast: `w_A,max - w_B,max ≈ 2.474311240932692 m/s`. Classification: **PASS**.

#### Run A clean sign reversal — frozen prediction

The frozen control requires near-core opposite material T1 signs before and after `i_core`, within one core passage, with the evidence and entire qualifying crossing in one containing environmental sounding segment. A sampled zero is not required. `epsilon_T1=1e-6 s^-2` remains a material-sign threshold, not a physical zero tolerance.

#### Run A clean sign reversal — observed evidence

`iCore=2017`. The core-passage window spans indices `1067–2777`, with radius limit `1500 m`.

Material negative T1 exists before `iCore`. The first material sample in the core-passage window was:

| Observable | Value |
| --- | --- |
| Sample index | 1067 |
| Simulation time, s | 106.69999999999821 |
| Position (x,y,z), m | (-1495.366180056533, 547.4096025604892, -109.40845498586955) |
| r, m | 1499.3632723523883 |
| w, m/s | 1.3863908338360447 |
| T1, s⁻² | -0.00000535978696361018 |
| Containing sounding segment, m | 0–1000 |
| Temporal side / material sign | before / negative |

Material positive T1 also exists after `iCore`, but the candidate after-core evidence belongs to the `1000–2000 m` segment, whereas the before-core negative evidence belongs to `0–1000 m`. The harness recorded `sameSoundingSegment=false` and `sameSegmentEvidence=null`.

#### Run A clean sign reversal — classification and interpretation

**H3/A/sign-reversal = INVALID CONTROL.** The trajectory shows opposite material T1 signs on opposite temporal sides of the core passage, but the relevant evidence crosses an environmental sounding-segment boundary. It cannot serve as the predefined clean same-segment sign-reversal control. This classification is not FAIL, UNEXPLAINED, or PASS; the frozen criterion is not weakened or rewritten.

#### Overall trajectory classification and execution/reporting outcome

| Scientific control | Classification |
| --- | --- |
| Trajectory/sample integrity | PASS |
| H3/A geometry | PASS |
| H3/B geometry | PASS |
| Sampled-w contrast | PASS |
| H3/A clean sign reversal | INVALID CONTROL |

**H3-TRAJECTORIES CLOSED · INVALID CONTROL**, with partial valid geometry, sampled-w, and path evidence preserved. No failure of the entire H3 physics hypothesis is established, and clean same-segment sign reversal is not validated. No post-hoc retuning is performed or authorized.

Separately, at the execution level, the campaign H3 trajectories test produced one failed test because the report/assert gate rejects any non-PASS scientific check. The rejected check was `H3/A/sign-reversal = INVALID CONTROL`. H1, H2, and H3 Eulerian campaign stages remained skipped in this run; infrastructure tests passed.

Vitest additionally reported an unhandled `[vitest-worker]: Timeout calling "snapshotSaved"` error. This is a technical execution/reporting issue, not scientific evidence and not the cause of the INVALID CONTROL classification.

---

## 11. Deviations / investigations

H1: none. H2: none. H3 Eulerian: PASS. H3 trajectories: the clean sign-reversal control is INVALID CONTROL because opposite material-sign evidence crosses a containing sounding-segment boundary; successful geometry/w/path evidence is retained. No UNEXPLAINED scientific deviation or H3 physics failure is established.

Technical execution/reporting issue: the additional `snapshotSaved` timeout is recorded separately from scientific classification. Documentation review and classification closure remain the next action; no rerun, altered control, or production implementation is authorized.

---

## 12. Conclusions

**EMPTY.**

---

## 13. H4 — new pre-run geometric sign-reversal experiment

**Current status: H4 CLOSED · INVALID CONTROL.** The approved pre-run specification below remains frozen; implementation review is complete/closed.

This section owns the H4 scientific specification. H3 documentation/classification closure is complete: H3 trajectories remains CLOSED · INVALID CONTROL, with its evidence and frozen protocol unchanged. H4 follows that finding as a new pre-registered synthetic experiment, not a repaired or post-hoc rerun of H3. H4 was separately authorized and executed once; its classification is CLOSED · INVALID CONTROL. Its inputs and evidence are unchanged. Observed C-matrix work and production/UI implementation remain deferred and unauthorized.

### 13.1 Scientific question and hypothesis

Can a single tracer sample material T1 of opposite signs during one near-core passage while environmental horizontal vorticity remains unchanged inside one containing sounding segment?

Hypothesis: the frozen H4 trajectory can sample opposite material signs of `T1 = omega_h · grad_h(w)` by crossing the analytical zero-boundary of the prescribed updraft gradient within one core passage, with the entire qualifying interval in the 0–1000 m sounding segment. The updraft is steady and segment vorticity is constant; the sign change is geometric and path-mediated. This is a conditional control whose realized geometry is an outcome, not an assumed PASS.

Sampling T1 does not mean that the tracer evolves or acquires prognostic vorticity. H4 does not test full vorticity evolution, mesocyclone generation, real-storm reconstruction, observed-environment validation, or production UI behavior.

### 13.2 Analytical oracle in production coordinates

The existing [horizontal-vorticity helper](../../src/physics/environment/horizontalVorticity.ts) uses atmospheric east/north `omega_h=(-dv/dh,du/dh)`. For the frozen first segment:

```text
du/dh = (23-15)/1000 = 0.008 s^-1
dv/dh = (10-8)/1000 = 0.002 s^-1
omega_atmospheric = (omegaEastward,omegaNorthward) = (-0.002,+0.008) s^-1
```

The existing `worldHorizontalVorticityFromAtmospheric` in [DiagnosticTiltingTendency](../../src/physics/diagnostics/DiagnosticTiltingTendency.ts), consistent with [physics doc 22](../physics/22-diagnostic-tilting-tendency.md), defines `omegaX=omegaEastward`, `omegaZ=0-omegaNorthward`. World +X is east, +Y is up, and +Z is south. Thus:

`omega_world,h = (-0.002,-0.008) s^-1`.

For the centered production [VerticalEnvelopeUpdraftField](../../src/physics/storm/VerticalEnvelopeUpdraftField.ts), at `0<y<8000 m`:

```text
w = 20 * exp(-(x^2+z^2)/(2*sigma^2)) * sin(pi*y/8000)
dVyDx = -(w/sigma^2)*x
dVyDz = -(w/sigma^2)*z
grad_h(w) = -(w/sigma^2)*(x,z)
B(x,z) = omegaX*x + omegaZ*z = -0.002*x - 0.008*z
T1_oracle = -(w/sigma^2)*B = (w/sigma^2)*(0.002*x + 0.008*z)
```

For H4, `sigma^2=250000 m^2`. With nonzero positive w, the explicit T1=0 boundary is:

**`-0.002*x - 0.008*z = 0`, equivalently `x + 4*z = 0`.**

The line passes through the updraft center and is perpendicular to world-horizontal vorticity. The center `x=z=0` also gives the trivial zero gradient and hence T1=0. Passing through the center is not required. At/outside vertical lids, zero gradient is a separate production boundary condition, not evidence of crossing this horizontal line.

For material valid samples with w>0, `sign(T1)=-sign(B)=sign(x+4*z)`. Thus B<0 predicts positive T1, and B>0 predicts negative T1. This relation is derived from the production convention, not an assumed atmospheric-to-world sign mapping. The first-segment B formula is not an oracle for upper sounding segments.

The oracle is evaluated analytically at each recorded position/time, independently of the core diagnostic's returned T1. No numerical extrema or expected T1 amplitudes are preassigned; no maximum-|T1| ordering is a target. The existing strict equality rule in §7.1 is retained for numerical invariant comparisons; no new tolerance or B epsilon is introduced.

### 13.3 Frozen synthetic inputs

| Input | H4 value |
| --- | --- |
| Environmental sounding: height m → (east,north) m/s | 0→(15,8); 1000→(23,10); 2000→(29,16); 3000→(31,24) |
| Environmental vertical velocity | exactly 0 |
| Storm motion C, m/s | (5,8) |
| Seed (x,y,z), m | (-3000,500,0) |
| Updraft center (x,z), m | (0,0) |
| Peak vertical velocity W0 | 20 m/s |
| Sigma | **500 m** |
| Vertical support | baseHeight=0 m; topHeight=8000 m |
| Integration | production explicit Euler; dt=0.1 s |
| Observation horizon inherited from H3-A | 600 s / at most 6000 completed steps |
| Domain/lifecycle | production ATMOSPHERIC_TRACER_DOMAIN |
| Recording | production TracerPathHistory, one tracer, stride=1 |
| Primary T1 | existing DiagnosticTiltingTendency with profile and updraft |
| Material-sign guard | epsilon_T1=1e-6 s^-2 |

The sole deliberate prescribed-field parameter change from H3-A is sigma=500 m instead of 1000 m. This factor-of-two geometric change is chosen before H4 execution to construct a more compact updraft, allowing less traversal time for ascent across 1000 m. Whether the trajectory actually realizes that intended geometry remains to be observed. H3 is not retuned. No rotation, lower radial inflow, upper outflow, near-ground outflow, downdraft, or other storm-local horizontal velocity field is included.

Future construction must use existing primitives directly: EnvironmentalWindProfile → EnvironmentalWindField → StormRelativeEnvironmentalAdvectionField(environment,C), with total velocity CompositeVelocityField([stormRelativeEnvironment,updraft]). No DEMO or ScenarioConfig changes are needed or authorized. Seed, C, W0, sigma, sounding, dt, epsilon, and tolerances must not be tuned after H4 execution.

### 13.4 Sampling, validity, and local passage

Capture the initial sample at t=0. After every completed Simulation.step(0.1), record the accepted position and post-step simulation time with recordAfterStep; evaluate diagnostics at those recorded coordinates/time. No interpolation, decimation, resampling, or render-frame sampling contributes to primary evidence. Stop after recording a terminal accepted sample if the tracer deactivates; do not fabricate later samples. A fully active run has 6001 samples.

Gate T1 evidence with production soundingSegmentContainingHeight. A null segment means out-of-profile / invalid-for-T1-evidence, never a physical zero. Preserve all containing segments and validity states. For the required segment `{hLo:0,hHi:1000}`, production ownership is **0<=y<1000 m**: exact y=1000 belongs to the upper segment and cannot qualify. Values in other supported segments may be recorded descriptively but cannot qualify for H4 reversal.

Compute r=sqrt(x²+z²). Let i_core be the global minimum-r recorded sample, using the first occurrence if tied. The H4 near-core passage is the maximal contiguous recorded interval containing i_core with **r<=1.5*sigma=750 m**. If the global minimum exceeds 750 m, no such passage exists. There is no additional H3-A 500 m geometry threshold for H4.

Classify numeric T1 as positive if T1>+epsilon_T1, negative if T1<-epsilon_T1, neutral otherwise. This threshold does not rewrite numeric T1 or define physical zero. Invalid samples are not neutral evidence.

Search chronologically ordered evidence pairs only within this one passage. “Before/after” denotes temporal order across the analytical B boundary; H4 does not additionally require the pair to straddle i_core in time. All intervening recorded samples must retain the same required 0–1000 m segment. Examine qualifying pairs deterministically in ascending (left index,right index) order and preserve the first qualifying pair; do not select evidence from a different passage or widen the window after observing output.

Record adjacent B sign transitions separately. Opposite nonzero B signs at adjacent samples give a discrete crossing bracket; if exact B=0 samples intervene, preserve those samples and the bracketing indices. Neither a sampled exact B/T1 zero nor an interpolated zero-crossing time is required. Opposite-side material endpoints and a valid intervening interval suffice; crossing through x=z=0 is unnecessary.

### 13.5 Classification rules frozen before execution

**PASS — H4 CLOSED · PASS:** trajectory/sample integrity is valid; the frozen local passage exists; two chronologically ordered valid material T1 samples lie on opposite B sides in that passage; both samples and their entire intervening recorded interval belong to `{0,1000}`; environmental omega_h remains the frozen segment value; B has opposite signs; T1 has opposite material signs and agrees with `sign(T1)=-sign(B)` at the evidence samples. Material samples throughout the qualifying interval must not contradict the oracle. A sampled zero is not required.

**INVALID CONTROL:** the setup fails to furnish the intended test: no passage, no B-boundary crossing in that passage, no qualifying material evidence absent an independently established oracle discrepancy, evidence crossing y=1000 or otherwise not wholly in the required segment, or termination before evaluation for an identified non-physics reason. Insufficient material amplitude alone is not a physics failure. Missing or unreliable trajectory evidence must be described as a setup/evidence issue when its cause is established. Preserve partial evidence; do not weaken the criteria.

**FAIL / UNEXPLAINED:** do not make finding opposite observed T1 signs a prerequisite for detecting a diagnostic failure. Independently identify boundary-crossing pairs with valid geometry, unchanged first-segment omega_h, and material analytically predicted T1 (using the same epsilon). If production T1 is valid/material but its sign contradicts the oracle, or reversal is absent despite independently established geometry and material-oracle prerequisites, record a discrepancy even if no observed opposite-sign pair exists. Use FAIL only for a violated frozen criterion with no known setup issue after the cause/setup has been isolated; use UNEXPLAINED while the discrepancy's cause is not isolated. A neutral observed value where the oracle predicts material evidence also requires investigation, not automatic INVALID CONTROL. Unisolated integrity or execution problems must not be called a physics failure.

An observed opposite-sign pair cannot override an oracle contradiction in the qualifying evidence. Missing geometry/support is INVALID CONTROL; satisfied independent prerequisites with inconsistent diagnostic behavior is a discrepancy for FAIL/UNEXPLAINED classification. Preserve explicit check id, expected rule, observed evidence, classification, and reason. Technical reporting/test-runner failures remain separate from scientific status. No H4 status is assigned before execution.

### 13.6 Required future evidence

Retain deterministic recorded samples and at minimum:

- requested/executed Euler steps, sample count, final time, final active state and terminal time if any;
- global r_min with index/time/position and core-passage start/end indices;
- selected chronological evidence samples with index/time, x,y,z,r,w,T1,B, T1 validity, containing segment, material sign(T1), sign(B), analytical T1 and oracle-agreement flag;
- atmospheric and world omega_h used, and confirmation of unchanged omega_h over the qualifying interval;
- y_min/y_max and whether every sample in that interval remained in `{0,1000}`;
- discrete adjacent B-crossing brackets, any sampled exact zeros, and whether a direct discrete crossing was recorded (without interpolation);
- validity counts, descriptive nonqualifying candidates, prerequisite/discrepancy checks, and the final classification with reasons.

If no qualifying interval exists, interval-dependent metrics are absent/null with an explicit reason, not fabricated zeros. No H4 observation or amplitude is supplied by this pre-run design.

### 13.7 Authorization gate

The new H4 pre-run specification and production-convention derivation were reviewed/approved; test-only implementation was separately authorized and is now complete. H4 implementation review is now COMPLETE / CLOSED. Typecheck and no-stage infrastructure verification (24 passed, all 5 campaign stages skipped) support review closure, not scientific execution. The approved work was committed/pushed as 553f0029c41d5fde6a7251e947d516f801147964, followed by separate explicit H4 authorization and one execution. H4 is now CLOSED · INVALID CONTROL; no rerun or retuning is authorized. The current H5 execution authorization gate is recorded in §14. Observed C-matrix and production/UI work remain deferred. H1/H2/H3 frozen records and final campaign conclusions remain untouched.

---

## 14. H5 — pre-run scientific design for a shifted boundary crossing

**H4 CLOSED · INVALID CONTROL.**
**H5 PRE-RUN SCIENTIFIC DESIGN REVIEWED / APPROVED · H5 EXPECTATIONS FROZEN.**
**H5 TEST-ONLY IMPLEMENTATION COMPLETE · H5 IMPLEMENTATION REVIEW COMPLETE / CLOSED · H5 EXECUTION NOT AUTHORIZED.**

H5 is a new pre-registered synthetic control. Its purpose is to test clean same-segment geometric T1 sign reversal with the analytical B=0 crossing deliberately positioned near the expected near-core passage. The intended geometry is a conditional prediction, not an observed trajectory or guaranteed PASS. H4 inputs, results, classification and evidence remain unchanged.

### 14.1 Frozen inputs and provenance

H5 is H4 with exactly one deliberate input change: seed z changes from 0 m to +225 m. All other H4 inputs, tolerances, sampling rules, evidence-selection rules and classification semantics are inherited unchanged.

| Input | Frozen H5 value |
| --- | --- |
| Sounding: height m → (east,north) m/s | 0→(15,8); 1000→(23,10); 2000→(29,16); 3000→(31,24) |
| Environmental vertical wind | 0 |
| Storm motion C, m/s | (5,8) |
| Seed (x,y,z), m | **(-3000,500,+225)**; H4 remains (-3000,500,0) |
| Updraft center (x,z), m | (0,0) |
| W0 / sigma | 20 m/s / 500 m |
| Vertical support | base=0 m; top=8000 m |
| Other storm-local fields | no rotation, inflow, outflow, downdraft or other storm-local horizontal field |
| Integration | production explicit Euler; dt=0.1 s |
| Observation horizon | 600 s / max 6000 steps |
| Domain | ATMOSPHERIC_TRACER_DOMAIN |
| Recording | TracerPathHistory, one tracer, stride=1; initial and accepted post-step samples |
| Diagnostic | DiagnosticTiltingTendency(profile,updraft) |
| Material-sign guard | epsilon_T1=1e-6 s^-2 |
| Local passage | r<=750 m |
| Required sounding segment | {0,1000}; ownership 0<=y<1000 m |

H5 z0=+225 m is selected before H5 execution from the mechanism isolated by H4. H4 had S=-3000+10t, giving analytical B=0 at 300 s, after its local passage (approximately 161.8–254.3 s). Adding +225 m to initial z shifts S0 by +900 m and shifts the analytical crossing earlier by exactly 90 s to 210 s. This does not presume that the H5 passage equals the H4 passage.

No H5 trajectory has been executed or inspected before freezing this control. No observed H5 positions, amplitudes, extrema or passage times are preassigned.

### 14.2 Frozen analytical prediction

For the first sounding segment, subtracting C=(5,8) gives:

```text
u_sr = 10 + 0.008*y
v_sr (atmospheric north) = 0.002*y

world +z is south:
dx/dt = 10 + 0.008*y
dz/dt = -0.002*y

S = x + 4*z
B = -0.002*S
dS/dt = (10 + 0.008*y) + 4*(-0.002*y) = 10 m/s

S0 = -3000 + 4*225 = -2100 m
S(t) = -2100 + 10*t
t_B0 = 210.0 s
```

The y-dependent terms cancel exactly while the tracer remains in the first segment, irrespective of vertical motion. The crossing prediction is conditional on that residence. Explicit Euler likewise gives S_next=S+10*dt algebraically for first-segment steps; floating-point accumulation need not produce an exact sampled B=0 or time=210.0. No interpolation, new tolerance or B epsilon is introduced.

The unchanged production-coordinate oracle is:

```text
omega_atmospheric = (-0.002,+0.008) s^-1
omega_world,h = (-0.002,-0.008) s^-1
w_analytical = 20*exp(-(x*x+z*z)/(2*500*500))*sin(pi*y/8000)
T1_analytical = -(w_analytical/250000)*B
```

Evaluate the analytical oracle independently at recorded positions with unchanged validity and positive-w requirements. Freeze the conditional material-sign prediction:

- t<210 s: S<0 → B>0 → material T1<0.
- t>210 s: S>0 → B<0 → material T1>0.

These statements apply to valid positive-w first-segment material samples. Material means magnitude strictly greater than the existing epsilon; neutral samples do not establish material evidence. The time prediction alone establishes neither amplitude nor support nor PASS.

### 14.3 Frozen evidence and PASS requirements

Inherit §13.4 and §13.6 unchanged for H5: initial/post-step lifecycle sampling, diagnostic support gating, first tied global r minimum, maximal contiguous r<=750 m passage around that minimum, and lexicographic (left index,right index) evidence selection. A pair need not straddle i_core. No window widening, interpolation, resampling, alternate passage or stronger later pair may replace frozen selection.

**t=210 s is not sufficient for PASS.** All of the following are required:

- Valid trajectory/sample integrity and an existing local H5 passage.
- Opposite nonzero B sides inside that same passage.
- Material analytical and observed T1 on both sides, using unchanged epsilon.
- Both endpoints and the entire qualifying recorded interval in {0,1000}, with 0<=y<1000 m.
- Unchanged frozen first-segment omega.
- Opposite observed material signs agreeing with the analytical oracle.
- No material contradiction in qualifying evidence; a clean pair cannot conceal an independently established discrepancy.

Preserve adjacent B-crossing brackets and exact-zero samples/brackets separately. An exact sampled zero is not required. Record lifecycle metrics, r_min/i_core, passage bounds, firstBoundaryPair, firstIndependentPair, qualifyingPair, discrepancyPair, endpoint diagnostics/signs/oracle agreement, interval y_min/y_max and segment/omega checks, validity counts, check ids/statuses and classification reason. Missing interval-dependent evidence is null/absent with an explicit reason.

### 14.4 Frozen classification discipline

**PASS:** only when all frozen H5 clean-reversal requirements in §14.3 are met.

**INVALID CONTROL:** crossing occurs outside the local passage, support is lost, no material pair is realized, or intended geometry is otherwise not furnished without an independently established oracle discrepancy. Preserve partial evidence; insufficient amplitude is not by itself a physics failure.

**UNEXPLAINED:** independently satisfied geometry/material prerequisites accompany production/oracle inconsistency while its cause remains unisolated. Missing observed reversal, a wrong sign, or neutral observed T1 where the independent oracle predicts material evidence must not be hidden by requiring an observed reversal before checking for discrepancy.

**FAIL:** only after cause/setup is isolated and a frozen physics criterion is violated. Technical runner/integrity issues remain separate from scientific classification; unisolated issues are not automatically physics failures.

These rules retain §13.5 semantics. Do not weaken criteria, adjust inputs or select different evidence post hoc.

### 14.5 Current gate

H5 scientific design review is CLOSED / APPROVED and expectations remain frozen. Separately authorized H5 test-only implementation is COMPLETE; implementation review is COMPLETE / CLOSED. H5 execution is NOT AUTHORIZED and requires new explicit authorization after the reviewed slice is committed/pushed.

Observed C-matrix remains deferred. Production/UI work is not authorized. Implementation verification used typecheck and the validation module with no stage selected: 33 infrastructure tests passed and all 6 campaign stages skipped. The reviewed H5 slice may be committed/pushed after clean verification. H5 execution and H1/H2/H3/H4 reruns are not authorized. Campaign Conclusions remain EMPTY.
