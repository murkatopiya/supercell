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

The H3 control must therefore be adapted and re-frozen before execution; no backend H3 run is authorized yet.

### 3.4 Product-resolution candidates — decision NOT YET MADE

At least three honest product directions remain open:

1. **Authoring floor / constraint.** Prevent the user from placing a tracer below a scientifically/product-defined minimum seed height for experiments that imply updraft entrainment.
2. **Explicit warning.** Permit very low heights but explain that the current prescribed updraft has zero vertical velocity on its lower lid and extremely weak vertical velocity immediately above it, so a near-ground tracer is not guaranteed to behave like an intuitively entrained air parcel.
3. **Model revision.** Revisit the lower-boundary behavior of the prescribed updraft in a later modeling decision so that near-ground lifting is represented differently.

No option is selected by this audit. In particular, do not introduce an undocumented epsilon offset or silently move a user-authored tracer upward.

### 3.5 Required follow-up

Before V1.1 closes this finding:

- confirm the exact `y = 0` disappearance mechanism in the atmospheric-domain / accepted-step path;
- characterize representative low seed heights (`0`, `1`, and additional low-altitude controls) for survival and vertical response;
- decide whether the correct resolution is UI constraint, warning/explanation, or a separately justified model change;
- keep any H3 synthetic-control adaptation separate from the product decision, so validation geometry is not allowed to dictate production behavior.

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

## 5. Open architecture-audit items

Still to audit/freeze before backend execution:

- exact streamwise/crosswise implementation and behavior at `|V_sr| = 0`;
- exact `y = 0` tracer disappearance mechanism;
- low-altitude Analysis support boundary relevant to user-authored seeds;
- path-history / diagnostic sampling cadence used by the experimental harness;
- faithful H3 mapping to the existing vertical-envelope updraft;
- final H3 T1 near-zero/sign-reversal threshold;
- minimal way to inject synthetic `C_A` / `C_B` without changing production physics semantics.
