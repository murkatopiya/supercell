# Storm-Motion Sensitivity & V1 Validation

**Status:** RESEARCH PROTOCOL · PRE-EXPERIMENT · ARCHITECTURE-SYNCHRONIZED · EXPECTATIONS FROZEN

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

`SRH = integral[(u - C_e) dv/dh - (v - C_n) du/dh] dh`.

Expected:

- `SRH_0-3(C1) = 0 m^2/s^2`;
- `SRH_0-3(C2) = +300 m^2/s^2`;
- `SRH_0-3(C3) = +300 m^2/s^2`.

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

- SRH differs from `0`, `+300`, `+300` as specified;
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
- expected `+300`: `|SRH-300| <= 1e-6 m^2/s^2`.

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

**Status:** NEXT STEP — MINIMAL HARNESS PROCEDURE/OUTPUT CONTRACT NOT YET FROZEN.

The remaining pre-run task is to define the smallest reproducible harness procedure and exact recorded outputs without changing the already frozen physics expectations.

After that freeze, execute in this order:

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

**EMPTY — DO NOT POPULATE BEFORE THE MINIMAL HARNESS CONTRACT IS FROZEN AND THE FIRST CONTROL RUN IS EXECUTED.**

---

## 11. Deviations / investigations

**EMPTY.**

---

## 12. Conclusions

**EMPTY.**