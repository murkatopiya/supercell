# Storm-Motion Sensitivity & V1 Validation

**Status:** RESEARCH PROTOCOL · PRE-EXPERIMENT · EXPECTATIONS NOT YET FULLY FROZEN

## 1. Research purpose

This document defines a controlled validation campaign for the existing V1 kinematic laboratory before any storm-motion sensitivity feature is implemented in the UI.

The goal is not to discover that storm-relative quantities depend on storm motion. The goal is to derive the expected response independently, freeze those expectations before running the backend, and then use controlled changes in constant storm motion `C` to test whether V1 preserves the correct invariants and reproduces the expected dependencies.

The experiment must distinguish between:

- quantities that are invariant under changing only constant storm motion `C`;
- quantities that depend directly on `C`;
- quantities that change only indirectly through the Lagrangian trajectory.

Observed/environmental fields, storm-relative representations, prescribed laboratory fields, and trajectory-sampled diagnostics must remain conceptually separate throughout the experiment.

---

## 2. Core definitions

Let the observed environmental wind profile be

`q(z) = (u(z), v(z))`.

Let constant storm motion be

`C = (C_e, C_n)`.

Storm-relative environmental wind is

`r(z) = q(z) - C`.

Changing only constant `C` leaves the observed sounding unchanged.

For any two levels,

`(q_2 - C) - (q_1 - C) = q_2 - q_1`,

therefore vertical shear and quantities derived only from vertical derivatives of the environmental wind remain unchanged.

The current V1 T1 diagnostic is a reduced-field vertical-vorticity tilting diagnostic:

`T1 = omega_h · grad_h(w_updraft)`.

It is not the full tilting term of the laboratory flow and it is not a vorticity-evolution equation for a tracer.

At a fixed spatial point, if only `C` changes, both environmental horizontal vorticity `omega_h` and the prescribed updraft gradient remain unchanged; therefore local Eulerian `T1(x,y,z)` must remain unchanged.

A tracer may nevertheless sample different values because changing `C` changes the full advecting velocity and therefore its trajectory.

---

## 3. Quantity classification

### 3.1 C-invariant under a constant storm-motion change

Expected to remain unchanged:

- observed environmental wind `q(z)`;
- vertical shear `dq/dz`;
- environmental horizontal vorticity `omega_h`;
- prescribed updraft field `w(x,y,z)`;
- `grad_h(w)` at a fixed spatial point;
- local Eulerian `T1(x,y,z)`;
- shape of the storm-relative hodograph, including inter-level distances and segment directions.

### 3.2 Directly C-dependent

Expected to change directly with `C`:

- storm-relative wind `r(z) = q(z) - C`;
- position of the storm-relative hodograph relative to the origin;
- streamwise/crosswise decomposition of environmental horizontal vorticity relative to storm-relative flow;
- SRH for a fixed layer, except along iso-SRH directions;
- full advecting velocity at a fixed point where the environmental storm-relative component contributes.

### 3.3 Indirect / path-mediated response

Expected to change only through the altered trajectory:

- tracer trajectory `X(t)`;
- prescribed-field values sampled along the trajectory;
- `T1(X(t))` sampled along the trajectory;
- other Lagrangian diagnostics derived from the recorded path.

---

## 4. Hypothesis H1 — Eulerian translation invariance

### 4.1 Hypothesis

Changing only constant storm motion `C` must translate the storm-relative hodograph without deforming it and must not alter the observed environmental wind, vertical shear, environmental horizontal vorticity, prescribed updraft field, prescribed updraft gradient, or local Eulerian T1 field.

Storm-relative representations may change even while the underlying Eulerian environmental and prescribed fields remain identical.

### 4.2 Synthetic environmental control

Use an intentionally simple linear wind profile with a perfectly straight hodograph along the x-axis:

| z (km) | u (m/s) | v (m/s) |
|---:|---:|---:|
| 0 | 0 | 0 |
| 1 | 10 | 0 |
| 2 | 20 | 0 |
| 3 | 30 | 0 |

Thus the 0–3 km bulk shear vector is parallel to `+x`.

The prescribed updraft field is held fixed across all runs. Its exact synthetic specification and numerical control points will be frozen before the experiment is executed.

No tracer is required for the primary H1 Eulerian control. H1 is deliberately separated from Lagrangian path effects.

### 4.3 Sweep A — storm motion parallel to bulk shear

Use a small storm-motion parameter sweep along the bulk-shear direction:

- `C1 = (0, 0) m/s`
- `C2 = (10, 0) m/s`
- `C3 = (20, 0) m/s`
- `C4 = (30, 0) m/s`

Expected result:

- the storm-relative hodograph translates rigidly along x;
- its shape does not change;
- `q(z)`, `dq/dz`, `omega_h`, prescribed `w`, `grad_h(w)`, and local `T1` remain identical at fixed spatial control points within the numerical tolerance defined before execution;
- storm-relative wind `r(z)` changes;
- streamwise/crosswise decomposition may change because the storm-relative basis changes;
- 0–3 km SRH remains zero for this synthetic geometry.

For this straight hodograph, all storm-relative wind vectors lie on the x-axis. Environmental horizontal vorticity is perpendicular to the shear and therefore lies along the y-axis up to sign convention. Away from levels where `|r| = 0`, environmental horizontal vorticity is purely crosswise relative to the storm-relative flow and the streamwise component is zero.

At levels where `|r| = 0`, the direction of storm-relative flow is undefined, so streamwise/crosswise decomposition is also undefined at that exact level.

### 4.4 Signed crosswise reversal control

At `z = 1.5 km`, the linear profile gives

`q = (15, 0) m/s`.

For

- `C = (10, 0)`, `r = (+5, 0)`;
- `C = (20, 0)`, `r = (-5, 0)`.

Expected result:

- environmental `omega_h` is unchanged;
- streamwise component remains zero;
- crosswise magnitude remains unchanged;
- the signed crosswise component reverses sign because the storm-relative flow direction reverses by 180 degrees;
- local Eulerian `T1` at the same spatial point remains unchanged.

This is an important validation contrast: a storm-relative representation may change sign while the underlying environmental vorticity and local Eulerian tilting field remain unchanged.

### 4.5 Sweep B — storm motion across the bulk-shear direction

A second sweep is required to demonstrate that local Eulerian T1 invariance is not an artifact of moving only along an iso-SRH direction.

Use, for example:

- `C5 = (10, -10) m/s`
- `C6 = (10, 0) m/s`
- `C7 = (10, +10) m/s`

Expected result:

- SRH changes across this sweep;
- storm-relative wind and hodograph position change;
- streamwise/crosswise decomposition changes;
- observed `q(z)`, vertical shear, environmental `omega_h`, prescribed `w`, `grad_h(w)`, and local Eulerian `T1` remain unchanged at fixed spatial control points.

This sweep is necessary because H1 is intended to test invariance to constant `C` generally, not only invariance along a special iso-SRH line.

### 4.6 H1 falsification criteria

H1 is falsified, or the implementation requires investigation, if changing only constant `C` causes any of the following beyond the frozen numerical tolerance:

- deformation of the storm-relative hodograph rather than rigid translation;
- change in observed `q(z)`;
- change in vertical shear;
- change in environmental horizontal vorticity;
- change in the prescribed updraft field or its spatial gradient at a fixed point;
- change in local Eulerian `T1` at the same spatial point;
- non-zero 0–3 km SRH in Sweep A for the straight x-axis synthetic hodograph;
- failure of the expected signed crosswise reversal at the 1.5 km control level.

Any discrepancy must be investigated before the expected result is modified. Possible causes include an incomplete analytical assumption, an incorrectly constructed synthetic case, an unintended hidden dependency on `C`, or an implementation defect.

---

## 5. Hypothesis H2 — Direct storm-relative C response

### 5.1 Hypothesis

Changing only constant storm motion `C` must change storm-relative wind, storm-relative hodograph position, streamwise/crosswise decomposition, and layer SRH in the analytically expected way while leaving the C-invariant Eulerian quantities from H1 unchanged.

For a fixed sounding and fixed integration layer, SRH is linear in `C`. Therefore storm motions separated along the layer bulk-shear direction may have identical SRH even though their storm-relative wind vectors differ at every level.

H2 explicitly tests both the direct C-response and this iso-SRH degeneracy.

### 5.2 Synthetic control

Reuse the same straight x-axis environmental hodograph as H1:

| z (km) | u (m/s) | v (m/s) |
|---:|---:|---:|
| 0 | 0 | 0 |
| 1 | 10 | 0 |
| 2 | 20 | 0 |
| 3 | 30 | 0 |

Thus the 0–3 km bulk shear is

`Delta q_0-3 = (30, 0) m/s`.

Hold the observed sounding and prescribed laboratory fields fixed.

Use three storm motions:

- `C1 = (10, 0) m/s`
- `C2 = (10, +10) m/s`
- `C3 = (20, +10) m/s`

The transition `C1 -> C2` is perpendicular to the bulk-shear direction. The transition `C2 -> C3` is parallel to the bulk-shear direction.

### 5.3 Frozen SRH sign convention

For this validation campaign use

`SRH = integral[(u - C_e) dv/dz - (v - C_n) du/dz] dz`.

With this convention, the synthetic profile has `dv/dz = 0` and positive `du/dz`.

Care must be taken not to infer the SRH sign solely from an ordinary visual clockwise/counter-clockwise area convention. The SRH sign is defined by the equation above.

### 5.4 Expected SRH response

For `C1 = (10, 0) m/s`:

- all storm-relative wind vectors lie on the x-axis;
- the oriented SRH contribution is zero;
- expected `SRH_0-3(C1) = 0 m^2/s^2`.

For `C2 = (10, +10) m/s`:

- `v - C_n = -10 m/s` throughout the layer;
- `dv/dz = 0`;
- `Delta u = +30 m/s` from 0 to 3 km;
- expected `SRH_0-3(C2) = -(-10) * 30 = +300 m^2/s^2`.

For `C3 = (20, +10) m/s`:

- the storm-relative wind differs from `C2` at every level because the eastward storm-motion component is 10 m/s larger;
- the shift `C2 -> C3` is parallel to the 0–3 km bulk-shear vector;
- expected `SRH_0-3(C3) = +300 m^2/s^2`.

Therefore the first frozen iso-SRH degeneracy pair is

`SRH_0-3(C2) = SRH_0-3(C3) = +300 m^2/s^2`,

while

`r_C2(z) != r_C3(z)` at every level.

### 5.5 Expected non-SRH quantities

Across `C1`, `C2`, and `C3`:

Expected to remain invariant:

- observed `q(z)`;
- vertical shear;
- environmental horizontal vorticity;
- prescribed `w`;
- prescribed `grad_h(w)` at fixed points;
- local Eulerian `T1` at fixed points;
- storm-relative hodograph shape.

Expected to change directly with `C`:

- storm-relative wind `r(z)`;
- storm-relative hodograph position relative to the origin;
- streamwise/crosswise decomposition wherever `|r| > 0`;
- SRH from `C1` to `C2`.

Expected degeneracy control:

- `C2` and `C3` have different storm-relative winds and different hodograph positions relative to the origin;
- `C2` and `C3` nevertheless have identical 0–3 km SRH.

### 5.6 Decomposition control at z = 1.5 km

At `z = 1.5 km`, the environmental wind is

`q = (15, 0) m/s`.

For the iso-SRH pair:

- `C2 = (10, +10) m/s` gives `r2 = (+5, -10) m/s`;
- `C3 = (20, +10) m/s` gives `r3 = (-5, -10) m/s`.

For this straight hodograph, environmental horizontal vorticity is directed along `+y` under the sign convention used for this control and is identical in both runs.

Because `|r2| = |r3| = sqrt(125) = 5*sqrt(5) m/s`, the two storm-relative flow directions are mirror images across the y-axis. Therefore the expected decomposition is:

- streamwise component: identical for `C2` and `C3`;
- crosswise magnitude: identical for `C2` and `C3`;
- signed crosswise component: equal magnitude and opposite sign.

If `|omega_h| = Omega`, then the normalized projection factors are

- streamwise: `-2/sqrt(5)` in both runs, so `omega_streamwise = -(2/sqrt(5))*Omega`;
- crosswise magnitude: `1/sqrt(5)` in both runs;
- signed crosswise component: `+(1/sqrt(5))*Omega` in one run and `-(1/sqrt(5))*Omega` in the other, with the exact sign assignment determined by the frozen crosswise-axis convention.

This control demonstrates that identical layer SRH does not imply identical local storm-relative decomposition, even though the environmental horizontal vorticity itself is unchanged.

### 5.7 H2 falsification criteria

H2 is falsified, or the implementation requires investigation, if any of the following occurs beyond the frozen numerical tolerance:

- `SRH_0-3(C1)` is not zero;
- `SRH_0-3(C2)` does not equal `+300 m^2/s^2`;
- `SRH_0-3(C3)` does not equal `+300 m^2/s^2`;
- `C2` and `C3` produce different 0–3 km SRH despite differing only along the bulk-shear direction;
- the storm-relative hodograph deforms instead of translating;
- C-invariant Eulerian quantities from H1 change;
- storm-relative winds fail to respond to the imposed change in `C`;
- at `z = 1.5 km`, the streamwise components for `C2` and `C3` are not equal;
- at `z = 1.5 km`, the crosswise magnitudes for `C2` and `C3` are not equal;
- at `z = 1.5 km`, the signed crosswise components for `C2` and `C3` do not have equal magnitude and opposite sign.

As in H1, any mismatch must be investigated before the analytical expectation is edited.

---

## 6. Hypothesis H3 — Lagrangian path-mediated response

### 6.1 Hypothesis

Changing only constant storm motion `C` can alter the tracer trajectory because the storm-relative environmental contribution to the full advecting velocity changes.

Therefore trajectory-sampled quantities may differ even though the underlying Eulerian environmental and prescribed laboratory fields are identical.

The causal chain to be tested is

`C -> V_total -> X(t) -> sampled w(X(t)), sampled T1(X(t))`.

H3 must not be interpreted as a direct C-dependence of the prescribed updraft or of the local Eulerian T1 field.

### 6.2 Frozen synthetic control geometry

Use the following curved environmental hodograph with piecewise-linear interpolation in height between control levels:

| z (km) | u (m/s) | v (m/s) |
|---:|---:|---:|
| 0 | 15 | 8 |
| 1 | 23 | 10 |
| 2 | 29 | 16 |
| 3 | 31 | 24 |

The sounding is held fixed in all H3 runs.

Use a deliberately simple symmetric horizontal Gaussian updraft centered at the origin:

`w(x,y) = w_max * exp(-(x^2 + y^2)/(2*sigma^2))`

with

- center `(x_c, y_c) = (0, 0) m`;
- `sigma = 1000 m`;
- `w_max = 20 m/s`;
- no prescribed rotation;
- no prescribed radial inflow;
- no other storm-local horizontal-flow component in the primary H3 control.

For this synthetic control, the horizontal Gaussian shape is treated as unchanged with height over the active control layer unless the architecture audit shows that V1 requires an explicit vertical envelope. Any required mapping to an existing V1 vertical envelope must preserve the same horizontal field for both runs and must be documented before execution.

The horizontal gradient is

`grad_h(w) = -(w/sigma^2) * (x, y)`.

Therefore:

- `w` is maximal at `r = 0`;
- `|grad_h(w)| = 0` at `r = 0`;
- `|grad_h(w)|` is maximal at `r = sigma = 1000 m`;
- the analytical maximum gradient magnitude is `(w_max/sigma) * exp(-1/2) ~= 0.01213 s^-1`.

Use one identical tracer seed in both runs:

`X_0 = (-3000, 0, 0) m`.

Freeze the integration window at

`0 <= t <= 600 s`.

Use two storm motions:

- **Run A / near-core:** `C_A = (5, 8) m/s`;
- **Run B / flank:** `C_B = (5, 13) m/s`.

At the surface, where `q(0) = (15, 8) m/s`, the initial storm-relative winds are

- Run A: `r_A(0) = (10, 0) m/s`;
- Run B: `r_B(0) = (10, -5) m/s`.

Thus Run A initially carries the tracer directly toward the updraft center along `+x`, while Run B introduces a substantial southward cross-track component. As the tracer rises through the curved sounding, its storm-relative direction changes with height, so the full trajectories are not assumed to be straight lines.

The frozen qualitative trajectory target is:

- Run A passes through or very near the central updraft region and samples the strongest ascent;
- Run B makes a clear flank passage, remaining materially farther from the center and sampling weaker peak ascent while still entering the strong-gradient region near `r ~= sigma`.

The exact closest-approach radius, time of closest approach, maximum sampled `w`, and maximum sampled `|T1|` are **not** frozen numerically before execution; they are outcomes of the integrated trajectory. The frozen expectation is the ordering and causal structure, not a preselected backend result.

If the actual V1 architecture cannot represent this control exactly, the architecture audit must document the smallest faithful mapping before any run. The control must not be silently altered to fit an implementation result.

### 6.3 Frozen Eulerian expectations

Across Run A and Run B, changing only `C` must leave the following fields unchanged at the same spatial point:

- observed environmental wind `q(z)`;
- vertical shear and environmental horizontal vorticity;
- prescribed updraft `w(x,y,z)`;
- prescribed horizontal updraft gradient `grad_h(w)`;
- local Eulerian `T1(x,y,z) = omega_h · grad_h(w)`.

If both runs are evaluated at the same spatial control point, local `w` and local `T1` must be identical within numerical tolerance.

If the two tracer trajectories happen to pass through the same spatial point, the local field values there must also agree. A different value at the same point solely because `C` differs would indicate an unintended direct C-dependence.

### 6.4 Frozen Lagrangian expectations

Run A and Run B are expected to produce different trajectories:

`X_A(t) != X_B(t)` in general.

Therefore they may sample different histories from the same unchanged fields:

`w_A(t) = w(X_A(t))`

`w_B(t) = w(X_B(t))`

and

`T1_A(t) = T1(X_A(t))`

`T1_B(t) = T1(X_B(t))`.

For the core-crossing Run A, the expected sampled vertical velocity is substantially stronger than in Run B, which misses the core. In particular, the frozen directional expectation is

`max_t w_A(t) > max_t w_B(t)`.

Run B is expected to experience weaker ascent because it remains farther from the updraft core.

No corresponding ordering is frozen for `max |T1|`. Run B may sample a substantial or even comparable `|T1|` if its flank trajectory follows the strong-gradient annulus near `r = sigma`.

However, weaker sampled `w` does **not** imply proportionally weaker sampled `T1`.

### 6.5 Updraft-gradient distinction

For a smooth symmetric Gaussian-like updraft, `w` is maximal at the center while the horizontal gradient `grad_h(w)` vanishes at the exact center.

The strongest horizontal gradient lies on the flanks of the updraft rather than at its center.

Therefore a core-crossing tracer may experience a qualitative sequence such as

`weak w -> strong |grad_h(w)| -> max w / |grad_h(w)| ~= 0 -> strong |grad_h(w)| -> weak w`.

Consequently:

- the location/time of maximum sampled `w` need not coincide with the location/time of maximum `|T1|`;
- `max sampled w` and `max sampled |T1|` are not expected to vary in lockstep;
- a peripheral Run B trajectory may sample substantial `|T1|` if it follows a strong-gradient flank even while never entering the updraft core.

This distinction is essential: `T1` depends on `grad_h(w)`, not on the magnitude of `w` alone.

### 6.6 T1 sign-reversal control for a core crossing

For a sufficiently symmetric core crossing, the horizontal updraft gradient on the entry side and exit side points in approximately opposite directions.

If environmental `omega_h` does not reverse across that crossing, then

`T1 = omega_h · grad_h(w)`

is expected to reverse sign between the two sides of the updraft.

The exact sign ordering depends on the orientation of `omega_h` and on the tracer crossing direction, so the protocol does not yet freeze whether the sequence is positive-to-negative or negative-to-positive.

The expected qualitative structure is

`one T1 sign -> approximately zero near the symmetric center -> opposite T1 sign`.

Run B, which remains on one side of the updraft or misses the core, is not required to show the same symmetric sign reversal and may retain one T1 sign over the relevant interval.

This sign change, if the final frozen geometry satisfies the symmetry assumptions, provides a stronger path-shape control than comparing only maxima.

### 6.7 H3 falsification / investigation criteria

H3 is falsified, or the implementation requires investigation, if any of the following occurs beyond the frozen numerical tolerance or without a documented geometric reason:

- changing only `C` changes the prescribed Eulerian `w(x,y,z)` field;
- changing only `C` changes local Eulerian `T1(x,y,z)` at the same spatial point;
- the full advecting velocity fails to respond to a change in `C` where the storm-relative environmental term should contribute;
- Run A and Run B remain numerically identical despite the frozen setup producing materially different storm-relative environmental velocities;
- the intended Run A near-core / Run B flank ordering fails without an identifiable synthetic-geometry or implementation reason;
- sampled `w(t)` or sampled `T1(t)` differ at the same spatial point rather than only because the trajectories sample different points;
- the final near-core setup samples both sides of the updraft in a geometry that predicts a T1 sign reversal, but no reversal appears and no interpolation/discretization explanation is found.

Failure to obtain the intended near-core/flank contrast is first treated as a synthetic-case design failure, not automatically as a V1 physics failure. The actual trajectories must be inspected before interpreting sampled-diagnostic differences.

### 6.8 Later stronger degeneracy control

After the basic H3 path-mediated case passes, a stronger follow-up may compare two storm motions with identical layer SRH but different storm-relative wind profiles/positions and different trajectories.

The purpose would be to demonstrate that equal integrated SRH does not uniquely determine the Lagrangian path through the prescribed laboratory flow and therefore does not uniquely determine sampled `w(X(t))` or sampled `T1(X(t))`.

This stronger case is explicitly secondary and should not complicate the first H3 control.

---

## 7. Numerical controls and tolerances

**Status:** NOT YET FROZEN.

Before backend execution, define:

- exact spatial Eulerian control points;
- exact expected analytical values where practical;
- equality/absolute/relative tolerances for each observable;
- integration step / solver assumptions for the harness;
- any implementation interpolation assumptions beyond the frozen piecewise-linear H3 sounding;
- layer definitions for SRH;
- sign conventions used for vorticity and streamwise/crosswise decomposition.

---

## 8. Experimental procedure

**Status:** NOT YET FROZEN.

The intended sequence is:

1. Finish and freeze analytical expectations.
2. Freeze synthetic inputs and numerical tolerances.
3. Commit this pre-experiment protocol before running the backend.
4. Audit the existing V1 implementation and map the actual `C` data flow without changing physics behavior.
5. Build the smallest reproducible experimental harness needed to feed frozen cases into the existing backend and collect observables.
6. Execute H1, then H2, then H3.
7. Record results without rewriting prior expectations.
8. Investigate every discrepancy before changing the analytical model or implementation.
9. Only after synthetic validation, move to observed-environment C-matrix experiments using the selected real sounding cases.

---

## 9. Results

**EMPTY — DO NOT POPULATE BEFORE THE PRE-EXPERIMENT EXPECTATIONS ARE FROZEN AND THE FIRST CONTROL RUN IS EXECUTED.**

---

## 10. Deviations / investigations

**EMPTY.**

---

## 11. Conclusions

**EMPTY.**