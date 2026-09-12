# Storm-Motion Sensitivity — V1 Architecture Audit

**Status:** CLOSED · PRE-EXPERIMENT ARCHITECTURE FACTS FROZEN · NO PRODUCTION CHANGES

**Parent protocol:** `docs/research/2026-09-11-storm-motion-sensitivity-and-v1-validation.md`

## 1. Audit purpose

This file records implementation facts discovered while auditing the released V1 before any storm-motion validation harness or V1.1 production change is written.

The audit is observational. It must not silently change physics behavior or retrofit the implementation to the frozen analytical expectations.

---

## 2. Confirmed implementation facts

### 2.1 Storm-relative environmental advection

`stormRelativeWind()` computes horizontal storm-relative wind as environmental wind minus constant storm motion `C`.

`StormRelativeEnvironmentalAdvectionField` wraps the ground-relative environmental field and applies that subtraction to the environmental advection operand only. It does not mutate the environmental profile and does not know the prescribed storm-local fields.

The DEMO composition then combines that environmental operand with the prescribed storm-local operands in `CompositeVelocityField`.

### 2.2 Tracer integration

V1 tracer advection uses `EulerIntegrator` with explicit Euler stepping:

`X[n+1] = X[n] + V(X[n], t[n]) * dt`.

The current DEMO fixed timestep is

`dt = 0.1 s`.

`Simulation.step(dt)` evaluates the full velocity field at the current position/time, applies the accepted step/domain policy, increments tracer age, and advances the simulation clock.

### 2.3 Environmental profile interpolation

`EnvironmentalWindProfile.sampleAtHeight()` uses piecewise-linear interpolation between sounding knots.

Below the first knot and above the last knot, environmental advection uses clamped continuation of the endpoint wind.

The legacy `DiagnosticTiltingTendency` does not extrapolate a containing shear segment outside environmental sounding support; its scalar API returns numeric zero there. The support-aware Analysis path is intentionally stricter and returns `OUT_OF_DOMAIN` with no numeric T1 outside its Analysis profile domain. These two semantics must not be conflated.

### 2.4 T1 direct C-dependence audit

`DiagnosticTiltingTendency` receives only the environmental profile and the prescribed updraft field. It does not receive storm motion `C`.

Its local value is built from the environmental shear/vorticity for the containing sounding segment and the local horizontal gradient of prescribed vertical velocity.

Therefore no direct implementation path `C -> local T1(x,y,z)` was found in the audited diagnostic class. Any C-response in trajectory-sampled T1 is expected to occur through the changed tracer path, not through a direct C operand.

### 2.5 SRH implementation

`stormRelativeHelicityBetween()` receives the environmental profile, storm motion, and layer bounds and evaluates exact Form B over each piecewise-linear hodograph segment. This is compatible with the simple H1/H2 synthetic SRH controls and should make their analytical 0 and -300 m^2/s^2 expectations essentially exact up to floating-point arithmetic.

The expectation sign in this paragraph was corrected before campaign execution to agree with canonical physics doc 09 and the unchanged production implementation; see the [formal pre-run SRH correction record](2026-09-12-storm-motion-srh-sign-correction.md). Other closed audit conclusions are unchanged.

### 2.6 Analysis trajectory rendering support semantics

The Analysis T1 trajectory overlay is support-aware. `OUT_OF_DOMAIN` and `COLUMN_UNAVAILABLE` samples do not receive a T1 value color and do not produce an Analysis overlay segment.

The ordinary occupancy trail remains underneath the Analysis overlay. Its color is the tracer identity color, not a T1 value. The first tracer identity color is red (`0xe74c3c`). Therefore where the Analysis overlay is absent, a red underlying occupancy trail may become visible even though no negative/positive T1 value exists there.

This distinction is critical for interpreting low-altitude manual probes.

### 2.7 Current production updraft vertical support

The current `DEMO_SCENARIO` configures `VerticalEnvelopeUpdraftField` with

- `baseHeight = 0 m`;
- `topHeight = 8000 m`.

Its vertical factor therefore reaches zero at 0 and 8000 m and follows the production half-sine envelope between those lids.

---

## 3. Audit finding A1 — ground-level tracer on the updraft lower lid

### 3.1 Observed model behavior

The current V1 prescribed updraft is `VerticalEnvelopeUpdraftField`:

`w = W0 * exp(-r^2/(2*sigma^2)) * F(y)`

with a half-sine vertical envelope

`F(y) = sin(pi * (y - baseHeight)/(topHeight - baseHeight))`

inside the vertical support.

At the lower lid,

`y = baseHeight`,

`F = 0`, therefore `w = 0` exactly, including on the updraft axis.

For the current DEMO updraft, `baseHeight = 0 m`. Therefore a tracer authored at `y = 0 m` receives no upward velocity from the prescribed updraft at that exact level.

A live Explore manual probe confirmed that `y = 0 m` is reachable in the UI and that a released tracer at that height disappears immediately after release.

The exact mechanism is closed by A5 below: the live DEMO downdraft has a negative lower lid and therefore supplies a nonzero downward Gaussian tail at `y = 0`; the accepted Euler proposal goes below the atmospheric floor and `AtmosphericTracerDomain` deactivates the tracer on that first step.

### 3.2 Classification

This is **not currently classified as a defect in `VerticalEnvelopeUpdraftField` itself**. The field implements its documented lower boundary condition correctly.

It is, however, a **product-facing boundary behavior / interaction-risk finding** because Explore allows user-authored tracer height and a user may reasonably interpret a seed placed at ground level under the visible updraft as air that should be lifted by that updraft.

Accordingly, this behavior must not be silently ignored in V1.1 planning.

### 3.3 Consequence for frozen H3 control

The originally frozen H3 seed

`X0 = (-3000, 0, 0) m`

cannot simply be mapped onto a V1 updraft with `baseHeight = 0` while retaining the intended "enter the updraft, rise through the curved sounding" experiment. At the lower lid the updraft contribution to vertical velocity is zero, while the live DEMO downdraft contributes a downward tail and the atmospheric tracer-domain policy deactivates a tracer whose accepted proposal crosses below `y = 0`.

If that mapping were used unchanged, the run would be classified as **INVALID CONTROL / architecture-mapping mismatch**, not as a failure of H3 or of V1 storm-motion physics.

### 3.4 Frozen minimal H3 adaptation

The H3 adaptation changes **only the initial tracer altitude**. It does not change the V1 updraft class or its vertical-envelope law and does not add an epsilon/clamp to production behavior.

The synthetic H3 horizontal geometry remains frozen:

- updraft center `(x,z) = (0,0)`;
- horizontal `sigma = 1000 m`;
- synthetic peak vertical speed `W0 = 20 m/s`;
- no rotation, radial inflow, radial outflow, downdraft, or other prescribed horizontal storm-local field;
- initial horizontal tracer coordinates `(x0,z0) = (-3000,0) m`;
- identical seed in both storm-motion runs.

For vertical geometry, H3 uses the actual V1 `VerticalEnvelopeUpdraftField` law and the current production updraft support:

- `baseHeight = 0 m`;
- `topHeight = 8000 m`.

The adapted initial altitude is frozen at

`y0 = 500 m`.

Therefore the complete H3 seed is

`X0 = (-3000, 500, 0) m`.

At this altitude the production vertical-envelope factor is

`F(500) = sin(pi * 500/8000) ~= 0.19509`.

This is intentionally inside the vertical support rather than on the lower lid. The choice is made analytically before backend execution and must not be retuned after observing H3 results merely to obtain a stronger or visually cleaner contrast.

The original height-independent synthetic-updraft assumption is superseded for H3 by the production-compatible form

`w(x,y,z) = W0 * exp(-r^2/(2*sigma^2)) * sin(pi*y/8000)`

for `0 < y < 8000 m`, with zero vertical updraft contribution at/outside the lids according to the existing V1 field semantics.

This adaptation preserves the intended H3 causal test:

`C -> V_total -> X(t) -> sampled w(X(t)), sampled T1(X(t))`.

Changing `C` remains the only difference between the paired H3 runs. The adapted seed and prescribed field are identical between runs.

### 3.5 Product-resolution candidates — decision NOT YET MADE

The synthetic-control adaptation above does **not** resolve the separate product-facing `y = 0` behavior. At least three honest product directions remain open:

1. **Authoring floor / constraint.** Prevent the user from placing a tracer below a scientifically/product-defined minimum seed height for experiments that imply updraft entrainment.
2. **Explicit warning.** Permit very low heights but explain that the current prescribed updraft has zero vertical velocity on its lower lid and the live DEMO can contain downward velocity there, so a ground-level tracer may immediately leave the atmospheric pathline domain.
3. **Model/composition revision.** Revisit the interaction between the prescribed storm operands and the lower-boundary policy in a later modeling/product decision.

No product option is selected by this audit. In particular, do not introduce an undocumented epsilon offset or silently move a user-authored tracer upward.

### 3.6 Required follow-up

The exact deactivation mechanism is confirmed by A5 and no longer open.

Before V1.1 closes the product-facing boundary finding, still:

- characterize representative low seed heights (`0`, `1`, and additional low-altitude controls) for survival and vertical response;
- decide whether the correct product resolution is UI constraint, warning/explanation, composition/model revision, or another explicitly justified policy.

These product questions do not block the frozen H3 seed itself.

---

## 4. Audit finding A2 — low-altitude Analysis gap can look like a T1 color

### 4.1 Manual observation

A live Explore tracer released at `y = 1 m` survives and can produce a long near-ground recorded path.

When a historical point on the initial low-altitude part of that path is selected, the right-side diagnostic UI reports:

- `OUTSIDE THE ANALYSIS HEIGHT DOMAIN`;
- no numeric Analysis T1;
- What-if geometry unavailable;
- diagnostic vectors absent.

At a later path section that lies inside Analysis support, the T1 diagnostic/vector blocks reappear.

### 4.2 Rendering interpretation

The visibly red low-altitude path is **not evidence of red/positive/negative T1**. Architecture and renderer encoding explicitly suppress value-colored Analysis segments for `OUT_OF_DOMAIN` samples.

What remains visible is the underlying occupancy trail. For the first tracer that trail is itself red because tracer identity uses `TRACER_COLORS[0] = 0xe74c3c`.

Therefore the visual sequence can be misleading:

- unsupported low-altitude path: red occupancy trail visible;
- supported path: Analysis T1 overlay covers the occupancy trail with diagnostic value colors.

Because the Analysis legend also uses a warm/red end of its value scale, an observer can reasonably misread an unsupported red occupancy segment as a strong signed T1 segment.

### 4.3 Classification

This is a **real V1 presentation/semantic ambiguity**. It is not a physics-calculation error: the system correctly refuses to invent Analysis T1 outside support and correctly suppresses the diagnostic vectors/panels.

The risk is that two unrelated color semantics — tracer identity and T1 value — occupy the same trajectory in mutually exclusive regions without an explicit visual boundary cue.

### 4.4 Product-resolution candidates — decision NOT YET MADE

Potential V1.1 directions include:

1. visually encode unsupported trajectory segments with a neutral/non-T1 style distinct from tracer identity and from the T1 scale;
2. add an explicit discontinuity/boundary cue where Analysis support begins or ends;
3. preserve the identity trail but suppress or de-emphasize it while the T1 overlay/legend is active;
4. add direct copy/legend language that unsupported segments show the ordinary tracer trail and are not T1 values.

The audit does not yet select a solution.

### 4.5 Validation relevance

This finding matters to the storm-motion validation campaign because visual trail color cannot be used as evidence for H3 sampled T1 unless the corresponding sample is confirmed to have diagnostic support under the selected T1 path.

All quantitative comparisons must use diagnostic data/status or explicit containing-segment validity, not screenshots or apparent trail hue.

---

## 5. Audit finding A3 — path-history and diagnostic sampling semantics

### 5.1 Path-history cadence

The production `TracerPathHistory` records a discrete pathline at the simulation-step boundary, not at render-frame cadence.

For the V1/Explore contract:

- `dt = 0.1 s`;
- history uses `stride = 1`;
- `captureInitial(...)` stores the initial seed at its current laboratory time;
- after every completed `Simulation.step(dt)`, `recordAfterStep(...)` stores the new accepted particle position;
- the stored `simulationTime` is the **post-step** `clock.time`;
- pause/render-only frames create no path sample;
- timeScale changes the number of fixed steps consumed per wall-clock frame, not `dt` or the physical sampling interval;
- an inactive transition may append one terminal accepted sample; already-inactive particles do not continue appending.

Therefore, for an active H3 tracer started at `t = 0`, ordinary samples are

`t_n = n * 0.1 s`, `n = 0,1,2,...`

with the initial seed at `n = 0` and one post-step path sample for every subsequent fixed step.

A 600 s H3 window contains 6000 integration steps and, if the tracer remains active throughout, **6001 path-history samples including the initial seed**.

### 5.2 Position/time convention

The integrator and the recorded diagnostic sample use different sides of the same Euler step and must not be conflated.

The displacement

`X[n] -> X[n+1]`

is generated from the explicit-Euler advecting sample

`V_total(X[n], t[n])`.

Path history then records

`(X[n+1], t[n+1])`.

Historical diagnostics are recomputed at the recorded path marker and its recorded post-step time:

`w(X[n+1], t[n+1])`,
`T1(X[n+1], t[n+1])`,

and likewise for other read-only field observers.

They do **not** reconstruct the pre-step `V_total(X[n], t[n])` that generated the preceding displacement. This is the same current-state convention already used by the historical path probe / Inspector architecture and is not a physics discrepancy.

### 5.3 Frozen H3 harness policy

The H3 experimental harness must follow the production discrete-path semantics rather than inventing a second sampling clock:

1. capture the initial tracer state at `t = 0`;
2. advance using the production fixed step `dt = 0.1 s`;
3. after every accepted completed step, record the accepted tracer position and post-step simulation time;
4. evaluate trajectory-sampled `w` and T1 at those recorded `(P,t)` samples;
5. preserve the diagnostic validity/support information appropriate to the selected T1 path; unsupported samples must never be silently reinterpreted as observational zero;
6. do not interpolate between path samples for the primary H3 metrics;
7. do not decimate or use render-frame cadence for the primary H3 metrics.

This gives the paired C runs the same deterministic temporal grid while allowing their spatial trajectories and resulting sampled diagnostics to diverge.

### 5.4 Consequence for H3 metrics

Quantities such as

- minimum horizontal distance to the updraft axis;
- maximum sampled `w`;
- maximum sampled `|T1|`;
- sign-change / material-sign events in valid numeric T1;

must be computed from the frozen discrete recorded sequence unless a later metric is explicitly defined as a continuous/interpolated quantity **before** viewing experiment results.

For T1 specifically, a sign transition across two valid adjacent samples may be reported as a discrete sign transition. The primary harness must not invent an interpolated zero-crossing time unless that additional diagnostic is separately frozen before execution.

### 5.5 Classification

This item is **CLOSED / FROZEN** for the storm-motion validation harness.

No production change is required. Existing V1 path-history and historical-diagnostic conventions are sufficiently explicit to define the H3 sampling cadence and sample meaning.

---

## 6. Audit finding A4 — streamwise/crosswise implementation and zero-flow domain

### 6.1 Core implementation

The production core diagnostic is `decomposeHorizontalVorticity(...)` in `src/physics/environment/streamwiseCrosswiseVorticity.ts`.

It consumes already-computed horizontal storm-relative wind and horizontal vorticity. It does not recompute the environmental profile, shear, storm motion, or vorticity.

Let

`V_sr,h = (u,v)`

and

`omega_h = (omega_e, omega_n)`.

For nonzero horizontal storm-relative speed

`|V_sr,h| = hypot(u,v) > 0`,

the implementation forms

`s_hat = (u,v)/|V_sr,h|`

and the atmospheric east-north left-normal

`c_hat = (-v,u)/|V_sr,h|`.

It then returns the signed scalar projections

`omegaStreamwise = omega_h · s_hat`

and

`omegaCrosswise = omega_h · c_hat`.

This matches the owning physics definition in `docs/physics/08-streamwise-crosswise-vorticity.md`.

The crosswise sign convention is therefore frozen for the storm-motion experiment as **left-normal / +90 degree CCW in the atmospheric east-north plane**. A sign flip caused by changing `C` is meaningful only relative to this fixed basis convention.

### 6.2 Horizontal only

The implementation ignores `stormRelativeWind.vertical` completely.

Therefore the decomposition basis is defined from horizontal `V_sr,h`, not the full 3D flow vector. A large vertical component does not rescue an otherwise zero horizontal storm-relative wind.

### 6.3 Exact zero-flow behavior

The implementation performs an exact component check before normalization:

`u === 0 && v === 0`.

If both horizontal components are zero, it throws `StreamwiseCrosswiseVorticityError` with the basis classified as undefined.

Consequences:

- exact `V_sr,h = (0,0)` is **not** returned as `(omegaStreamwise, omegaCrosswise) = (0,0)`;
- exact zero is **not** numeric evidence of zero streamwise or zero crosswise vorticity;
- IEEE signed zero `-0` is included because `-0 === 0`;
- vertical storm-relative wind is irrelevant to the domain check;
- there is no epsilon or small-speed threshold in the core diagnostic;
- any finite nonzero horizontal wind, however small, is currently accepted and normalized.

The no-threshold behavior is a current implementation fact, not a claim that arbitrarily small `|V_sr,h|` is physically or numerically robust.

### 6.4 Existing tests

Production tests explicitly cover:

- parallel and anti-parallel vorticity;
- positive and negative crosswise orientation;
- an oblique case with norm partition and vector reconstruction;
- zero vorticity;
- exact zero horizontal storm-relative flow;
- zero horizontal flow with large vertical wind;
- signed-zero horizontal components;
- invariance to vertical storm-relative wind.

Thus the sign convention and exact-zero failure mode are already intentional tested behavior rather than an accidental renderer convention.

### 6.5 Core diagnostic versus current hodograph overlay

The current DEMO hodograph overlay has an additional composition choice that must not be confused with the core definition.

`createDemoStreamwiseCrosswiseOverlay()` builds a finite-layer basis for `[0,1000] m` from the **average of the two endpoint storm-relative winds**:

`V_sr,avg = (V_sr(h0) + V_sr(h1))/2`.

It then calls the same core `decomposeHorizontalVorticity(...)` with that average basis. If the average horizontal basis has zero magnitude, the overlay returns `undefined` before calling the throwing core diagnostic.

This is a UI/composition convention for the current DEMO finite-layer overlay, not the universal definition of streamwise/crosswise vorticity.

The H1/H2 validation harness must therefore test the **core diagnostic with the explicitly frozen storm-relative basis at the synthetic evaluation height**, unless the protocol separately specifies a finite-layer average. It must not silently inherit the DEMO `[0,1000]` overlay averaging rule.

### 6.6 Consequence for H1/H2 controls

For the synthetic controls, changing `C` changes `V_sr,h` and therefore rotates/reverses the basis while leaving environmental `omega_h` unchanged.

The expected H2 sign behavior remains compatible with implementation: when two runs have the same `omega_h` but their storm-relative basis reverses its eastward component, the signed crosswise component may reverse while the streamwise component remains equal, exactly as analytically frozen for the selected synthetic point.

If a synthetic evaluation produces exact `V_sr,h = (0,0)`, the correct expected outcome is **undefined decomposition / `StreamwiseCrosswiseVorticityError`**. A validation check passes when the implementation explicitly reports that undefined domain. It must not coerce the result to numeric zero or invent a basis direction.

### 6.7 Classification

This item is **CLOSED / FROZEN** for the storm-motion validation harness.

No production change is required for the core diagnostic before H1/H2 execution. The experiment must preserve the existing left-normal sign convention, horizontal-only basis, exact-zero error policy, and distinction between the core diagnostic and the DEMO finite-layer overlay basis.

---

## 7. Audit finding A5 — exact `y = 0` disappearance mechanism

### 7.1 The deactivation path

The live tracer simulation is constructed with `ATMOSPHERIC_TRACER_DOMAIN`.

For an active tracer, `Simulation.step(dt)` first asks the integrator for a proposed position from the full composite velocity field. It then passes the segment `(from, proposed)` to `applyAtmosphericTracerDomain(...)`.

The domain policy accepts any proposal with `proposed.y >= 0`. If an accepted segment starts at/above the atmospheric floor and proposes `proposed.y < 0`, it intersects the segment with `y = 0`, stores that floor point, and sets `active = false`.

There is an explicit production test for the exact boundary case: a tracer starting at `y = 0` with a downward proposal is treated as a crossing with interpolation parameter `alpha = 0`; it remains at its starting floor position and is immediately deactivated.

Therefore `AtmosphericTracerDomain` is the lifecycle mechanism that makes the glyph disappear once the first downward proposal occurs. The domain is not the source of the downward velocity.

### 7.2 The downward proposal at `y = 0`

The source is the live prescribed downdraft operand.

Current DEMO downdraft parameters are:

- center `(5000, 0) m`;
- `sigma = 2000 m`;
- `D0 = 20 m/s`;
- vertical support `[-400, 3600] m`.

Its field is

`Vy_down = -D0 * exp(-r^2/(2 sigma^2)) * sin(pi * (y - baseHeight)/(topHeight - baseHeight))`.

Because the lower lid is `-400 m`, the atmospheric floor `y = 0` lies **inside** the downdraft envelope rather than on its lid:

`F_down(0) = sin(pi * 400/4000) ~= 0.309`.

The horizontal Gaussian is strictly positive at every finite horizontal distance. Therefore in the current DEMO the downdraft contributes a negative vertical velocity at `y = 0` everywhere at finite `(x,z)`, although it becomes exponentially tiny far from the downdraft core.

By contrast, the updraft lower lid is exactly `y = 0`, so its contribution there is exactly zero.

At the updraft axis `(x,z) = (0,0)`, which is 5000 m from the downdraft axis, the downdraft tail is approximately

`Vy_down(0,0,0) ~= -0.2715 m/s`.

With production Euler `dt = 0.1 s`, the first vertical proposal from that contribution alone is approximately

`proposed.y ~= -0.02715 m`.

That is below the atmospheric floor. Because the step begins at `from.y = 0`, the domain intersection has `alpha = 0`; the accepted position remains the original floor point and the tracer becomes inactive immediately.

### 7.3 Why `y = 1 m` can survive

The boundary effect is discontinuous in lifecycle terms but not in field terms.

At `y = 1 m`, the tracer has one metre of vertical margin. The composite vertical velocity can still be slightly downward initially, but a `dt = 0.1 s` Euler step must move more than 1 m downward in a single accepted step to trigger deactivation immediately. The live manual probe showed that this does not happen there; the tracer survives and can continue along a near-ground path.

This explains the observed `y = 0` versus `y = 1 m` difference without invoking a hidden UI clamp or special seed rule.

### 7.4 Classification

The **mechanism is CLOSED / CONFIRMED**:

`downdraft Gaussian tail at y=0 -> negative V_total,y -> first Euler proposal below ground -> AtmosphericTracerDomain alpha=0 crossing -> active=false`.

This is an interaction between two individually documented production choices:

1. a downdraft envelope whose lower lid is below the atmospheric floor, intentionally making `y = 0` an interior downdraft level;
2. a hard tracer lifecycle floor at `y = 0` that deactivates downward crossings.

It is not caused by the updraft implementation, and there is no evidence of a renderer-only disappearance bug.

The broader product question remains open: whether Explore should permit authoring an exactly ground-level seed in a composite where an exponentially small far-field downward tail can immediately terminate it.

### 7.5 Validation consequence

This finding does not change the frozen H3 synthetic control, because H3 explicitly excludes the production downdraft operand and already uses the adapted seed altitude `y0 = 500 m`.

For product-facing low-altitude characterization, however, any future test must inspect **full composite vertical velocity plus domain outcome**, not updraft `w` alone.

This item itself is **CLOSED / FROZEN** as an architecture fact.

---

## 8. Audit finding A6 — Analysis height support is profile-relative, not ground-relative

### 8.1 Exact support domain

The support-aware Analysis query path uses the actual Analysis profile bounds. For a finite query height `h`:

- `h < profile.minHeight` or `h > profile.maxHeight` -> `OUT_OF_DOMAIN` with no numeric T1;
- `profile.minHeight <= h <= profile.maxHeight` -> the query is in-domain and may return `FULL_SUPPORT` or `BOUNDARY_CONDITIONED`;
- there is no clamp or extrapolation that converts an out-of-domain Analysis query into observational diagnostic evidence.

The containing-segment contract is half-open `[h_i,h_{i+1})`, except for the last closed segment. At an exact interior knot, the upper segment owns the derivative. At `minHeight`, the first segment owns it; at `maxHeight`, the last segment owns it.

### 8.2 Production low-level examples

The lower Analysis boundary is not a universal laboratory height. It varies with the observational column. Current normalized ESC examples include approximately:

- Goshen: `minHeight = 2.4 m`;
- Prospect Valley: `minHeight = -0.1 m`;
- Dumas: `minHeight = -0.5 m`.

Therefore a laboratory point at `y = 0` may be outside Analysis support for one observed environment and inside support for another. The Analysis validity boundary follows the data column, not the atmospheric tracer floor.

This exactly explains the manual Goshen point near `y ~= 1.9 m`: it lies below the Goshen Analysis `minHeight` and correctly returns `OUT_OF_DOMAIN`.

### 8.3 FULL versus BOUNDARY

Being inside the height domain does not imply `FULL_SUPPORT`. Diagnostic support is inherited from the Analysis filter support of the containing knot/segment:

- if all required knots are `FULL_SUPPORT`, the diagnostic is `FULL_SUPPORT`;
- if any required knot is `BOUNDARY_CONDITIONED`, the diagnostic is `BOUNDARY_CONDITIONED`;
- both states are numeric Analysis T1, but their support class must be preserved;
- `OUT_OF_DOMAIN` and `COLUMN_UNAVAILABLE` contain no numeric T1 and are never zero substitutes.

### 8.4 Synthetic H3 diagnostic-path consequence

The synthetic H3 sounding is an ordinary frozen environmental profile, not automatically an ESC high-resolution Analysis column. V1 intentionally keeps two diagnostic APIs distinct:

- legacy/core `DiagnosticTiltingTendency(profile, updraft)`;
- support-aware ESC Analysis `queryAnalysisTiltingTendencyAt(column, updraft, ...)`.

Tests explicitly pin that distinction: outside profile support, legacy `DiagnosticTiltingTendency.sample(...)` can return numeric zero while the support-aware Analysis query returns `OUT_OF_DOMAIN` with no numeric value.

Therefore the H3 validation harness must choose its diagnostic path explicitly. It must not construct an ESC Analysis meaning accidentally, and it must not reinterpret a legacy out-of-profile zero as observational support.

For the frozen H3 synthetic sounding (`0–3 km`) and seed (`y0 = 500 m`), the initial point is safely inside the synthetic environmental profile. During H3, primary T1 sign/maximum metrics are valid only while the selected diagnostic path has a real containing environmental segment. If the tracer leaves that support, those samples are excluded from T1 evidence rather than treated as meaningful zero.

### 8.5 Classification

This item is **CLOSED / FROZEN**.

There is no single low-altitude Analysis threshold to hard-code into the validation harness. Analysis support is profile-relative; synthetic H3 support must be represented explicitly according to the diagnostic path selected by the pre-experiment protocol.

---

## 9. Audit finding A7 — H3 material-sign / sign-reversal semantics

### 9.1 Why a required sampled zero is rejected

The H3 trajectory is sampled on the frozen discrete grid (`dt = 0.1 s`). A mathematically continuous T1 zero crossing can therefore occur between recorded samples.

Requiring the discrete sequence to contain a sample with `T1 ~= 0` would test accidental phase alignment between the trajectory and the sampling grid, not the intended physical sign reversal.

Production T1 also does not contain an internal `1e-6 s^-2` zero epsilon. Exact physical zero remains exact numeric zero where the operands produce it.

### 9.2 Frozen material-sign threshold

For the H3 validation criterion only, define

`epsilon_T1 = 1e-6 s^-2`.

Its meaning is **material-sign evidence**, not physical equality to zero:

- `T1 > +epsilon_T1` -> materially positive;
- `T1 < -epsilon_T1` -> materially negative;
- `|T1| <= epsilon_T1` -> neutral / near-zero for classification only.

The model and diagnostic are not modified by this threshold.

### 9.3 Frozen sign-reversal PASS structure

Run A satisfies the sign-reversal control only if the realized geometry actually provides the intended near-core opposite-flank passage and all of the following hold:

1. there is valid numeric T1 evidence with one material sign on one side of the same core passage;
2. there is valid numeric T1 evidence with the opposite material sign on the other side;
3. the two pieces of evidence belong to the **same containing environmental sounding segment**, so the local segment `omega_h` is unchanged and the sign reversal can be attributed cleanly to the changing updraft-gradient projection;
4. the sign evidence is local to that one core passage, not merely a plus somewhere and a minus somewhere else in the 600 s run.

The sign order is not frozen: positive-to-negative and negative-to-positive are both acceptable if the geometry explains them.

A neutral/near-zero sample may occur between the two signs but is **not required**. If adjacent valid recorded samples jump directly from material positive to material negative (or vice versa), record a **discrete sign transition**. Do not invent an interpolated zero-crossing time for the primary metric.

If the containing sounding segment changes across the candidate sign reversal, the event may be recorded descriptively but does not satisfy this clean same-segment sign-reversal control.

Run B is not required to reverse sign.

### 9.4 Classification

This item is **CLOSED / FROZEN**.

`1e-6 s^-2` is now frozen as an experiment-level material-sign guard, not as a physical zero tolerance in V1.

---

## 10. Audit finding A8 — minimal synthetic storm-motion injection seam

### 10.1 Current production composition

The physical adapter `StormRelativeEnvironmentalAdvectionField` already accepts an arbitrary `StormMotion` in its constructor and copies that value into the environmental-advection operand. It subtracts `C` horizontally when sampled and does not mutate the wrapped `EnvironmentalWindField` or know about prescribed storm-local fields.

The current DEMO composer is intentionally less configurable: `composeDemoTracerFields(...)` may receive an optional environmental profile, but its storm-relative environmental operand always uses `DEMO_SCENARIO.stormMotion`. The production composer therefore does **not** currently expose `C` as an experimental parameter.

`CompositeVelocityField` itself has no storm-motion semantics; it only sums its supplied velocity operands.

### 10.2 Frozen validation seam

The validation harness must **not** add a storm-motion override to the production DEMO composer merely to run the experiment.

Instead, construct the existing physics objects directly:

`synthetic EnvironmentalWindProfile`
`-> EnvironmentalWindField(profile)`
`-> StormRelativeEnvironmentalAdvectionField(environmentField, C_test)`.

This is the minimal existing injection seam and preserves the intended ownership boundary: only the environmental advection operand receives `C`.

For H1/H2, most checks can call the existing environmental/diagnostic functions directly without constructing the seven-operand DEMO composite.

For H3, construct the deliberately minimal frozen synthetic total field:

`V_total = CompositeVelocityField([V_env_sr(C_test), frozen synthetic VerticalEnvelopeUpdraftField])`.

Do not include DEMO rotation, radial inflow, upper/near-ground outflow, or downdraft, because the frozen H3 control explicitly excludes them.

The paired H3 runs must differ only in the `StormMotion` passed to `StormRelativeEnvironmentalAdvectionField`; the environmental profile, updraft parameters, seed, integrator, timestep, domain policy, sampling policy, and metric code must otherwise be identical.

### 10.3 What must not be changed for the validation campaign

The pre-experiment harness does not require:

- a new `stormMotion` argument on `composeDemoTracerFields()`;
- a mutable/global storm-motion state;
- a UI storm-motion control;
- a production `ScenarioConfig` redesign;
- changes to `StormRelativeEnvironmentalAdvectionField` physics;
- changes to `CompositeVelocityField`.

Any later user-facing C parameterization is a separate post-validation product/architecture decision.

### 10.4 Classification

This item is **CLOSED / FROZEN**.

The existing backend already exposes the correct low-level seam for controlled synthetic C injection. No production physics change is required before building the validation harness.

---

## 11. Architecture-audit closure

All architecture facts required before the storm-motion synthetic backend campaign are now frozen:

- C data flow and invariants;
- integrator and timestep;
- environmental interpolation;
- T1 direct-C independence;
- SRH implementation;
- H3 production-compatible updraft mapping and seed;
- path-history / diagnostic sampling semantics;
- streamwise/crosswise basis and exact-zero domain;
- ground-level tracer deactivation mechanism;
- Analysis support semantics and the legacy-vs-Analysis distinction;
- H3 material-sign / same-segment sign-reversal criterion;
- minimal synthetic C injection seam.

**Architecture audit status: CLOSED.**

No backend experiment is authorized by this closure alone. Before the first run, synchronize the frozen A6/A7/A8 consequences into the parent pre-experiment protocol and freeze the minimal harness procedure/outputs there. Only then may H1/H2/H3 execution begin.
