# Storm-Motion Sensitivity — V1 Architecture Audit

**Status:** ACTIVE · NO PRODUCTION CHANGES

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

The T1 diagnostic does not use that clamped continuation as observational support: outside the environmental sounding support its sounding segment is unavailable and T1 returns zero.

### 2.4 T1 direct C-dependence audit

`DiagnosticTiltingTendency` receives only the environmental profile and the prescribed updraft field. It does not receive storm motion `C`.

Its local value is built from the environmental shear/vorticity for the containing sounding segment and the local horizontal gradient of prescribed vertical velocity.

Therefore no direct implementation path `C -> local T1(x,y,z)` was found in the audited diagnostic class. Any C-response in trajectory-sampled T1 is expected to occur through the changed tracer path, not through a direct C operand.

### 2.5 SRH implementation

`stormRelativeHelicityBetween()` receives the environmental profile, storm motion, and layer bounds and evaluates exact Form B over each piecewise-linear hodograph segment. This is compatible with the simple H1/H2 synthetic SRH controls and should make their analytical 0 and +300 m^2/s^2 expectations essentially exact up to floating-point arithmetic.

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

A live Explore manual probe confirmed that `y = 0 m` is reachable in the UI and that a released tracer at that height disappears immediately after release. The exact disappearance mechanism still requires code-level confirmation; likely candidates include atmospheric-domain / accepted-step ground handling rather than the updraft formula alone. This observed behavior is stronger than the earlier purely analytical concern that the tracer might simply remain near the lower lid.

### 3.2 Classification

This is **not currently classified as a defect in `VerticalEnvelopeUpdraftField` itself**. The field implements its documented lower boundary condition correctly.

It is, however, a **product-facing boundary behavior / interaction-risk finding** because Explore allows user-authored tracer height and a user may reasonably interpret a seed placed at ground level under the visible updraft as air that should be lifted by that updraft.

Accordingly, this behavior must not be silently ignored in V1.1 planning.

### 3.3 Consequence for frozen H3 control

The originally frozen H3 seed

`X0 = (-3000, 0, 0) m`

cannot simply be mapped onto a V1 updraft with `baseHeight = 0` while retaining the intended "enter the updraft, rise through the curved sounding" experiment. At the lower lid the updraft contribution to vertical velocity is zero, and the released V1 behavior at `y = 0` may immediately terminate/deactivate the tracer.

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
2. **Explicit warning.** Permit very low heights but explain that the current prescribed updraft has zero vertical velocity on its lower lid and extremely weak vertical velocity immediately above it, so a near-ground tracer is not guaranteed to behave like an intuitively entrained air parcel.
3. **Model revision.** Revisit the lower-boundary behavior of the prescribed updraft in a later modeling decision so that near-ground lifting is represented differently.

No product option is selected by this audit. In particular, do not introduce an undocumented epsilon offset or silently move a user-authored tracer upward.

### 3.6 Required follow-up

Before V1.1 closes the product-facing boundary finding:

- confirm the exact `y = 0` disappearance mechanism in the atmospheric-domain / accepted-step path;
- characterize representative low seed heights (`0`, `1`, and additional low-altitude controls) for survival and vertical response;
- decide whether the correct product resolution is UI constraint, warning/explanation, or a separately justified model change.

These product questions no longer block freezing the H3 seed itself. They remain separate from the synthetic validation geometry.

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

This finding matters to the storm-motion validation campaign because visual trail color cannot be used as evidence for H3 sampled T1 unless the corresponding sample is confirmed to have Analysis support.

All H3 quantitative comparisons must use diagnostic data/status, not screenshots or apparent trail hue.

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
5. preserve Analysis/support status with each T1 evaluation; unsupported samples are not numeric zeros;
6. do not interpolate between path samples for the primary H3 metrics;
7. do not decimate or use render-frame cadence for the primary H3 metrics.

This gives the paired C runs the same deterministic temporal grid while allowing their spatial trajectories and resulting sampled diagnostics to diverge.

### 5.4 Consequence for H3 metrics

Quantities such as

- minimum horizontal distance to the updraft axis;
- maximum sampled `w`;
- maximum sampled `|T1|`;
- sign-change / near-zero events in supported T1;

must be computed from the frozen discrete recorded sequence unless a later metric is explicitly defined as a continuous/interpolated quantity **before** viewing experiment results.

For T1 specifically, a sign transition across two supported adjacent samples may be reported as a discrete sign transition. The primary harness must not invent an interpolated zero-crossing time unless that additional diagnostic is separately frozen before execution.

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

## 7. Open architecture-audit items

Still to audit/freeze before backend execution:

- exact `y = 0` tracer disappearance mechanism;
- low-altitude Analysis support boundary relevant to user-authored seeds;
- final H3 T1 near-zero/sign-reversal threshold;
- minimal way to inject synthetic `C_A` / `C_B` without changing production physics semantics.

The H3 seed/updraft architecture mapping, path-history/diagnostic sampling policy, and streamwise/crosswise implementation/domain semantics are now frozen and are no longer open audit items.