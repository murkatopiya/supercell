# Diagnostic Tilting Tendency Architecture

**Status:** ARCHITECTURE SoT
**Scope:** T1 diagnostic tilting tendency — ownership, sampling,
composition wiring, observation boundaries, tests, slices
**Physics:** `docs/physics/22-diagnostic-tilting-tendency.md`
(authoritative derivation; not reopened here)
**Direction checkpoint:**
`docs/architecture/25-tilting-stretching-direction-revalidation.md`
**Implementation:** Slice 1 COMPLETE
(`VerticalEnvelopeUpdraftField.horizontalGradientOfVerticalVelocity`).
Slice 2 NOT STARTED. `DiagnosticTiltingTendency` not implemented.
Production `V_total` unchanged.

```text
V_total:                 UNCHANGED
prescribed rotation Ω:   UNCHANGED
prognostic ω:            NOT INTRODUCED
stretching evolution:    NOT INTRODUCED
eighth VelocityField:    NOT INTRODUCED
vorticity → velocity:    NOT INTRODUCED
Inspector L2:            UNCHANGED
visualization tint:      UNCHANGED
```

This document owns T1 *architecture*. Physics 22 owns the
quantity `T_tilt,y`. Completing this file does **not** start
implementation.

Keep these roles distinct:

```text
CURRENT FACT
STILL-BINDING CONTRACT
NEW PROJECT DECISION
REJECTED ALTERNATIVE
DEFERRED
```

---

## 1. Purpose

This document answers:

    Where does T1 live, what does it sample, which current
    instances does it observe, and how is it kept out of
    V_total / Inspector Level 2 / visualization tint?

It does **not** re-derive

    T_tilt,y = ω_x ∂Vy/∂x + ω_z ∂Vy/∂z

That identity, the project curl convention, the vortex-couple
geometry, and the anti-claims remain in physics 22.

---

## 2. Semantic boundary

**NEW PROJECT DECISION.**

T1 is a **model diagnostic**. It is not a `VelocityField`.

```text
model composition
    ├── canonical V_total
    ├── named velocity operands     → velocityObservation
    └── rotational-dynamics diagnostics
            └── T_tilt,y            → DiagnosticTiltingTendency
```

Hard exclusions:

```text
NOT a VelocityField implementor
NOT an eighth CompositeVelocityField operand
NOT a velocityObservation.parts row
NOT a V_total summand
NOT Simulation state
NOT visual-occupant state
NOT Inspector payload v1
```

`velocityObservation.parts` remains exactly the contributors to
`V_total`. `T_tilt,y` answers a different question and must not
appear as “why this motion.”

---

## 3. Canonical owner

**Chosen:** `DiagnosticTiltingTendency`

Intended module (implementation, not created by this file):

```text
src/physics/diagnostics/DiagnosticTiltingTendency.ts
```

A thin `diagnostics/` folder under physics is allowed for
quantities that are not `VelocityField`s and that couple more
than one existing physics layer. It is **not** a generic
diagnostics framework. T1 is the first occupant. Stretching,
`ω_y`, and curl bookkeeping do not get types in this SoT.

Conceptual capability:

```text
sample(position: Vec3, time: number) → number
```

Units of the returned number: `s⁻²`. Documented in JSDoc / type
comment. No runtime unit object.

The value is **signed**. Magnitude-only APIs are forbidden.

No `tracerId`, `Particle`, selection, `Vec3` velocity, Inspector
DTO, or render payload on this type.

The diagnostic must be usable **headlessly**.

---

## 4. Ownership matrix

### 4.1 A. Concrete owner holds canonical profile + updraft instances

```text
new DiagnosticTiltingTendency({
  profile: EnvironmentalWindProfile,
  updraft: VerticalEnvelopeUpdraftField,
})
```

`sample(P, t)` reads those instances. No `IntegrationFrame`, no
`C`, no rotation, no composite, no `ScenarioConfig` inside the
type.

**Fits:** SAME-source if composition passes the instances it
already built. Testable without a lab. Dataset future replaces
the owner, not a hidden DEMO calculator.

### 4.2 B. Generic providers

```text
horizontalVorticityProvider
verticalVelocityGradientProvider
```

**Rejected for v1.** There is one environmental `ω_h` API and
one live updraft type. Two interfaces would be a framework for
one product. Physics 22 already names the concrete inputs.

A later dataset-backed owner may look like B. That is a future
document.

### 4.3 C. Composition closures / factory-only

A function closed over DEMO fields, no named type.

**Rejected.** Harder to test, easy to rebuild physics from
`DEMO_SCENARIO` a second time, poor discoverability next to
`InspectableVelocityOperands`.

### 4.4 D. Method on `VerticalEnvelopeUpdraftField` that also needs the profile

`updraft.tiltingTendency(profile, P, t)`.

**Rejected.** The updraft would own a cross-layer diagnostic and
still need the profile injected at every call. Composition would
not hold a stable diagnostic sibling.

### 4.5 E. Row on `InspectableVelocityOperands`

**Rejected.** That object’s `parts` are `VelocityField`s. Putting
`T_tilt,y` there teaches the wrong “why.”

### 4.6 Recommendation

**A.** Concrete `DiagnosticTiltingTendency` constructed from the
**same** `profile` and `updraftField` instances
`composeDemoTracerFields` already creates.

---

## 5. Exact dependencies

T1 v1 depends on:

```text
EnvironmentalWindProfile
verticalWindShearBetween
horizontalVorticityFromShear
VerticalEnvelopeUpdraftField
  (analytic horizontalGradientOfVerticalVelocity; §8)
Vec3
laboratory time t (passed through; T1 has no clock)
```

T1 v1 must **not** depend on:

```text
CompositeVelocityField
RotationField / VerticalEnvelopeRotationField
IntegrationFrame / StormMotion / C
StormRelativeEnvironmentalAdvectionField
lower inflow, upper outflow, downdraft, near-ground outflow
Simulation / tracers
TracerInspection / TracerSelection
VisualAirflowPopulation / comet tint
ScenarioConfig as a runtime input of sample()
```

`ScenarioConfig` remains the composition DTO. Factories already
map it to `profile` and `updraft`. T1 consumes those objects,
not a second copy of the DTO.

---

## 6. Environmental `ω_h` source

**CURRENT FACT:** live composition already builds one profile:

```text
src/app/composeDemoTracerSimulation.ts
  composeDemoTracerFields
    profile = createEnvironmentalWindProfile(DEMO_SCENARIO)
    EnvironmentalWindField(profile)
    createUpdraftField(DEMO_SCENARIO)
```

Hodograph DEMO overlay currently samples a **fixed** layer
`[0, 1000]` (`demoHodographFixture`). That overlay is **not**
T1’s pointwise `ω_h`.

**NEW PROJECT DECISION:** at evaluation height `y = P.y`, T1
uses finite-layer environmental vorticity of the **profile
segment that contains `y`**, via the existing APIs:

```text
heights = profile.levelHeights()
shear   = verticalWindShearBetween(profile, hLo, hHi)
ω_h     = horizontalVorticityFromShear(shear)
```

T1 does not rebuild a profile. It does not curl `V_total` or
rotation. It does not infer `ω_h` from tracer motion.

### 6.1 Segment association

Let knots be strictly increasing

    h_0 < h_1 < … < h_n

as returned by `levelHeights()` (`minHeight = h_0`,
`maxHeight = h_n`).

Piecewise-linear wind ⇒ piecewise-constant segment shear
(`05`, `06`). T1 treats `ω_h(y)` as that constant on the
containing segment.

Half-open convention (locked):

```text
for i = 0 .. n-2:
  y ∈ [h_i, h_{i+1})  →  layer [h_i, h_{i+1}]

y ∈ [h_{n-1}, h_n]    →  layer [h_{n-1}, h_n]
```

Interior knots therefore take the **upper** segment’s shear
(one-sided from above). `minHeight` uses the first segment.
`maxHeight` uses the last segment.

Do not average adjacent segments at a kink. Physics 15 already
forbids inventing an epsilon mean at non-differentiable lids;
the same honesty applies here.

### 6.2 Outside the sounding

`sampleAtHeight` **clamps** outside `[minHeight, maxHeight]`
(advection convenience). `verticalWindShearBetween` **rejects**
layers outside that range (diagnostic honesty, `05` §8).

T1 follows the shear diagnostic, not the clamp:

```text
y < minHeight  or  y > maxHeight
  →  do not call verticalWindShearBetween
  →  treat environmental ω_h as 0
  →  T_tilt,y = 0
```

This is a defined scalar-field value, not an error, and not
“tracer inactive.” It is also the curl of a height-clamped
homogeneous wind (zero additional vertical shear). It is **not**
a claim that the sounding was observed there.

### 6.3 Why not the hodograph `[0, 1000]` layer

A point at `y = 4000 m` sits on DEMO knots `[2000, 6000]`. Using
`[0, 1000]` `ω_h` at that point would be a wrong layer. T1 is
local in height through both `F(y)` and `ω_h(y)`.

---

## 7. Atmospheric → world `ω` mapping

**Physics 22 (not reopened):**

```text
horizontalVorticityFromShear → (omegaEastward, omegaNorthward)
ω_x = omegaEastward
ω_z = −omegaNorthward
```

`horizontalVorticityFromShear` stays atmospheric-only (`06`).
Do not change that function.

**NEW PROJECT DECISION:** conversion is owned by the T1 module
as one exported helper, used by `DiagnosticTiltingTendency`
and its unit tests:

```text
worldHorizontalVorticityFromAtmospheric(
  omegaEastward,
  omegaNorthward,
) → { omegaX, omegaZ }
```

One boundary. Callers of T1 do not repeat the minus sign.

Do **not** reuse the hodograph screen map
`(omegaEastward, −omegaNorthward)` as this helper’s meaning.
That map is a 2D plot transform (`hodographViewTransform`), not
world `ω_z`.

Do not add world components onto `HorizontalVorticity`.

---

## 8. Updraft gradients

### 8.1 Strategy: ANALYTIC

**NEW PROJECT DECISION for T1 v1: ANALYTIC.**

Physics 22 already gives

```text
∂Vy/∂x = W0 F(y) E_r (−dx / σ²)
∂Vy/∂z = W0 F(y) E_r (−dz / σ²)
```

Analytic zeros and odd symmetry are test contracts (axis, lids,
`F = 0` outside the layer, far-field Gaussian decay, couple
mirror). Finite differences would smear those loci and force
tolerances at the compact lids.

v1 has **one** production gradient path. No analytic-or-FD
branch.

### 8.2 Where the formula lives

**NEW PROJECT DECISION:** a method on the **concrete**
`VerticalEnvelopeUpdraftField`, **not** on `VelocityField`:

```text
horizontalGradientOfVerticalVelocity(
  position: Vec3,
  time: number,
) → { dVyDx: number; dVyDz: number }   // s⁻¹
```

Do not return a `Vec3`. A dummy `.y` would be a footgun.

`time` is part of the contract (`§10`) even though the current
formula ignores it.

Rejected alternatives:

| Option | Why not v1 |
| --- | --- |
| `derivative()` / `curl()` on `VelocityField` | Turns every field into a calculus surface. Current interface is `sample → Vec3` only. |
| Generic finite difference over `VelocityField` | Worse zeros/symmetry; invites using composite `Vy`. |
| T1 copies `ScenarioUpdraft` numbers | Second updraft source. |
| Separate adapter constructed from a DTO | Same duplication risk unless it is built from the field instance — then the method on the field is simpler. |
| Differentiable-field abstraction | Premature framework. |

The method may use the field’s private parameters. That is the
SAME-source guarantee: live `updraftField` *is* the gradient
source.

Lids: `F = 0` ⇒ both horizontal derivatives are `0`. No
one-sided `∂Vy/∂y` policy is required for T1 (`22` §11.4).

### 8.3 Future datasets

A later non-synthetic source may supply `∇_h Vy` differently.
That is a different owner, not a second path inside this v1
type. Do not design `DatasetVelocityField` here.

---

## 9. Sampling contract

```text
DiagnosticTiltingTendency.sample(position, time) → T_tilt,y
```

| Input | Meaning |
| --- | --- |
| `position` | world `P = (x, y, z)` meters |
| `time` | laboratory time, same clock tracers use |

| Output | Meaning |
| --- | --- |
| `number` | signed `T_tilt,y` in `s⁻²` |

Algorithm (conceptual):

```text
if P or t is not finite → throw DiagnosticTiltingTendencyError
ω_h_atm = segment vorticity at y, or 0 outside sounding
(ω_x, ω_z) = worldHorizontalVorticityFromAtmospheric(...)
(dVyDx, dVyDz) = updraft.horizontalGradientOfVerticalVelocity(P, t)
return ω_x * dVyDx + ω_z * dVyDz
```

T1 does not own a clock. It observes `t`. Current DEMO profile
and updraft are Eulerian-steady; `t` is still required so a
future unsteady gradient source can participate.

Repeatable: same instances, same `(P, t)` ⇒ same number.
No mutation of profile, updraft, or caller vectors.

---

## 10. Time semantics

**CURRENT FACT:** `VelocityField.sample(P, t)` is time-capable;
live DEMO storm operands ignore `t`; the profile depends on `y`
only (`25` §2.9).

T1 today:

```text
ω_h(y)           independent of t
∇_h Vy(P)        independent of t
T_tilt,y(P, t)   independent of t numerically
```

T1 still **accepts** `t` and **forwards** it to the updraft
gradient method. Do not add `sample(P)` without time.

---

## 11. Domain / validity

T1 is a scalar field on all finite world points. Zero is a
value, not inactivity.

| Request | Result |
| --- | --- |
| Non-finite `P` or `t` | **Error** (`DiagnosticTiltingTendencyError`), matching shear’s refusal of non-finite heights |
| `y` outside profile range | **0** (`ω_h` convention, `§6.2`) |
| Outside updraft `[y_b, y_t]` | **0** (analytic `F = 0`) |
| Updraft lids | **0** (`F = 0`) |
| Axis `dx = dz = 0` | **0** |
| Far field | **→ 0** (Gaussian) |
| Zero environmental shear on the segment | **0** |

Do not map T1 `= 0` onto tracer `active === false` or glyph
hiding.

---

## 12. Composition wiring

**NEW PROJECT DECISION.**

Application/model composition creates canonical physics
instances **once** and constructs T1 from those instances in
the same pass.

`composeDemoTracerFields` already returns `profile` and
`updraftField`. Today `composeDemoTracersWithObservation`
keeps only `velocityObservation` and drops the profile
binding. That drop is the SAME-source bug T1 must not inherit.

Required wiring:

```text
composed = composeDemoTracerFields(frame)
  profile, updraftField, …operands, field

tiltingTendency = new DiagnosticTiltingTendency({
  profile: composed.profile,
  updraft: composed.updraftField,
})

velocityObservation = demoInspectableVelocityOperands(composed)
Simulation(velocityObservation.total, …)
```

`IntegrationFrame` continues to wrap only the environmental
**velocity** operand. It is not a T1 input. Storm-relative vs
ground-relative labs therefore share T1 for the same profile
and updraft — which is the physics `C`-invariance, obtained
structurally rather than by a special case.

Explore and Guided both already call
`composeDemoTracersWithObservation` /
`composeDemoTracerLab`. They must receive the **same** T1
sibling from that pass. Pedagogy / experiment id changes seeds
and copy, not T1 physics.

Do not construct T1 from a second `createEnvironmentalWindProfile`
or a second `createUpdraftField` in the lab factories.

### 12.1 Lab exposure

```text
ExploreLab.tiltingTendency
GuidedLab.tiltingTendency
```

Sibling of `velocityObservation`, not a field inside it.

A one-key `ModelDiagnostics` wrapper is **not** required for
v1. Add a bag type later if a second diagnostic is earned.

---

## 13. `velocityObservation` relation

**STILL-BINDING** (`19`):

```text
velocityObservation.total     = V_total
velocityObservation.parts[i]  = V_i
Σ V_i                         = V_total
```

T1 is **not** `parts[7]`. Inspector Level 2 must not grow a
“tilting” contribution row.

If a later observation aggregator is introduced, it is a
**sibling object**, not a new `InspectableVelocityPart`.

---

## 14. Inspector

Current Inspector (`19`):

```text
Level 1  motion
Level 2  why this velocity — V_i
Level 3  reserved; not implemented
```

T1 does **not** answer Level 1/2. It answers:

    What local kinematic tilting source of vertical vorticity
    exists at this point right now?

**NEW PROJECT DECISION:** T1 implementation does **not** change
`TracerInspection` and does **not** start Level 3.

Later, Level 3 / diagnostic context **may** sample
`lab.tiltingTendency.sample(selected.position, time)` as a
consumer. Architecture of T1 is that sampling port. Inspector
does not own T1.

`19` §14 still correctly blocks “derived `ω_z` from tilting”
as a *vorticity state*. `T_tilt,y` is not that state.

Guided v1 experiments stay prescribed pathline exhibits (`17`,
`20`). No new tilting Guided experiment in T1’s implementation
plan.

---

## 15. Visualization

Visual airflow observes `velocityObservation.total` (`22`,
`23`, `24`). Operand tint is `|V_i|` diagnostic of velocity
contributions.

T1 is a **signed** scalar. It must **not** reuse comet operand
tint.

No overlay, dipole map, or signed color scale is in T1
implementation. The sample API is spatially queryable so a
later overlay *could* exist without changing T1’s owner.

---

## 16. Prescribed rotation independence

Structural: `DiagnosticTiltingTendency` does not accept a
rotation field. Core T1 modules must not import
`RotationField` / `VerticalEnvelopeRotationField` except in
tests that prove independence.

Testable composition contract:

```text
same profile + same updraft parameters
different Ω (or omitted rotation operand)
→ T_tilt,y(P, t) unchanged
```

---

## 17. Storm-motion independence

Structural: T1 does not accept `C` or `IntegrationFrame`.

```text
same profile + same updraft
different constant C / different IntegrationFrame
→ T_tilt,y(P, t) unchanged
```

No `if (frame === …)` inside T1.

---

## 18. `V_total` independence

```text
same profile + same updraft
change rotation, lower inflow, upper outflow, downdraft,
  or near-ground outflow
→ T_tilt,y unchanged
```

T1 is not curl of the composite and not an interaction residual.

---

## 19. Continuity

YELLOW (`10`) does not gate T1 (`22` §17, `25` §11).

Architecture must not require divergence, a mass budget, or a
solver.

Copy / names: `T_tilt,y` is a tilting **source term**, never
“total vertical-vorticity tendency” and never
“mass-consistent mesocyclone formation.”

---

## 20. Reset / mode switch

T1 v1 is **stateless**.

| Event | T1 |
| --- | --- |
| Explore / Guided Reset | Same diagnostic instance. Nothing to restore. Tracers/visuals reset as today. |
| Guided experiment switch | New lab ⇒ new T1 instance from a new composition pass on the same DEMO physics sources. No T1 session to clear. |
| Explore ↔ Guided | Each lab has its own instances; both wired from the same composition helper. For the same `P, t`, values match. |
| Pause / clock | T1 has no freeze state. Sample at the laboratory `t` the caller supplies. |

Do not store last-sampled `T_tilt,y` on the diagnostic.

---

## 21. Dataset evolution

Portable *inputs*, not a portable v1 class:

```text
needed:  environmental ω_h at height
         horizontal gradient of the chosen vertical velocity
```

Synthetic v1: analytic updraft + profile segments.

Future model/dataset: may bring `∇V`, a vorticity volume, or
finite differences. That owner is not
`DiagnosticTiltingTendency` as specified here.

Do not hardcode `DEMO_SCENARIO` numbers inside the diagnostic
type. DEMO numbers enter only through composition, as they
already do for fields.

Do not implement `DatasetVelocityField` in T1 slices.

---

## 22. Future implementation tests

### 22.1 Physics (physics 22 sanity, now as tests)

```text
no shear on the containing segment     → 0
∇_h Vy = 0 (axis / lids / outside F)   → 0
far field                              → → 0 (analytic or tight tol)
reverse ω_h                            → sign reversal
mirror across axis along ω_h diameter  → opposite sign, same |T|
reverse W0 (isolated mathematical
  fixture if the type allows; else
  skip production ctor W0>0)           → sign reversal if tested
constant C                             → unchanged
prescribed Ω                           → unchanged
other five storm operands              → unchanged
```

### 22.2 Architecture

```text
DiagnosticTiltingTendency does not implement VelocityField
not in CompositeVelocityField operand lists
not in velocityObservation.parts
ExploreLab / GuidedLab hold the SAME profile/updraft instances
  the diagnostic was constructed with
signed number preserved (a negative fixture must stay negative)
units documented s⁻²
no mutations
repeatable sample
Explore and Guided equal at the same P, t
no import of Inspector or visualization into the T1 core module
```

### 22.3 Gradient

```text
analytic ∂Vy/∂x, ∂Vy/∂z vs physics 22 formula at interior points
axis zero
lids / outside layer zero
inward ∇_h Vy for W0 > 0, F > 0
```

### 22.4 Conversion / segment

```text
(ω_e, ω_n) → (ω_e, −ω_n)
segment picker: interior, minHeight, maxHeight, interior knot,
  below min, above max
must not call verticalWindShearBetween outside the sounding
```

---

## 23. Implementation slices

Implementation is **not** started by this file. When commanded:

### Slice 1 — analytic updraft `∇_h Vy`

**COMPLETE.**
`VerticalEnvelopeUpdraftField.horizontalGradientOfVerticalVelocity`.
Isolated tests. No T1 type. `VelocityField` interface unchanged.

### Slice 2 — T1 + canonical wiring

**NEXT.** Not started.

`worldHorizontalVorticityFromAtmospheric`, segment `ω_h`,
`DiagnosticTiltingTendency`, composition + Explore/Guided lab
sibling, tests `22.1`, `22.2`, `22.4`.

Headless. `V_total` and tracer motion unchanged by construction.

### Slice 3 — not UI

No Inspector Level 3. No overlay. No Guided experiment.

If a later product command wants a consumer, that is a separate
SoT. Scientific completion of T1 is Slice 2.

Do not merge Slice 1 into Slice 2 unless a later implementation
command says so. Isolated gradient tests are the cheaper lock
on exact zeros before the product `ω_h · ∇_h Vy`.

---

## 24. T1 completion criterion

T1 is **implemented** when, for arbitrary finite valid `(P, t)`:

```text
canonical EnvironmentalWindProfile shear/segment ω_h is used
canonical live VerticalEnvelopeUpdraftField ∇_h Vy is used
sample returns signed T_tilt,y in s⁻²
analytic / symmetry / sign / independence tests pass
V_total and tracer integration are unchanged
T1 does not depend on Ω or the other five storm operands
Explore and Guided expose that same diagnostic capability
```

**UI is not a completion criterion.**

---

## 25. Parked

```text
prognostic ω_y / T2
stretching tendency / stretching SoT
T1-curl (curl of V_total or of Ω as bookkeeping)
ω → V bridge
generated rotation / replace Ω / Ω options 2–4
eighth operand / Y12
continuity solver / RK2
baroclinic generation
downdraft tilting (composite Vy)
SRH as T1 amplitude
new Guided experiment
Inspector Level 3 implementation
signed color map / dipole overlay
camera / Follow
dataset loader
generic diagnostics framework
VelocityField.derivative / curl
caching
ScenarioConfig T1 parameters
```

`DiagnosticTiltingTendency` may later sit beside other
diagnostics in `src/physics/diagnostics/`. Those types are not
specified here.

---

## 26. Decision output

### A. Canonical T1 architecture owner

`DiagnosticTiltingTendency` in `src/physics/diagnostics/`.
Not a `VelocityField`.

### B. Exact dependencies

`EnvironmentalWindProfile` + existing shear/vorticity functions
+ `VerticalEnvelopeUpdraftField` analytic `∇_h Vy`. See §5.

### C. Sampling contract

`sample(position, time) → number` (`s⁻²`, signed). §9.

### D. Gradient strategy

**ANALYTIC** on the concrete updraft type. §8.

### E. Atmospheric → world `ω` mapping ownership

T1-module helper `worldHorizontalVorticityFromAtmospheric`.
`horizontalVorticityFromShear` unchanged. §7.

### F. Composition wiring

Same pass as `composeDemoTracerFields`; T1 constructed from
`composed.profile` and `composed.updraftField`. §12.

### G. Observation exposure

`ExploreLab.tiltingTendency` / `GuidedLab.tiltingTendency`
(and the composition result that feeds both). Headless
`sample`.

### H. Relationship to `velocityObservation`

Sibling. Never a `parts` entry. §13.

### I. Reset / mode semantics

Stateless. Reset does not touch T1. New lab ⇒ new instance.
§20.

### J. Dataset boundary

v1 bound to profile + envelope updraft. Portable *inputs*
documented; no dataset API. §21.

### K. Implementation slices

Slice 1 gradient; Slice 2 T1 + wiring; no UI slice. §23.

### L. STOP after architecture

Implementation is **not** authorized by this file. No production
code. No Inspector. No overlay.

No physics blocker remains for that later implementation
command. Continuity YELLOW is not a blocker. Completing slices
still requires an explicit implementation command.

---

## 27. Compact lock-in

```text
owner:              DiagnosticTiltingTendency
kind:               model diagnostic, not VelocityField
sample:             (P, t) → signed T_tilt,y  [s⁻²]
ω_h:                profile segment via existing 05/06 APIs
                    0 outside sounding
ω map:              T1 helper; FromShear stays atmospheric
∇_h Vy:             ANALYTIC method on
                    VerticalEnvelopeUpdraftField
                    not on VelocityField
SAME source:        composeDemoTracerFields profile +
                    updraftField instances
labs:               tiltingTendency sibling of
                    velocityObservation
parts:              still V_i only
Inspector:          L1/L2 unchanged; L3 not started
visualization:      does not consume T1
C / Ω / V_other:    structurally independent
state:              none
UI completion:      not required
implementation:     Slice 1 COMPLETE
                    Slice 2 NOT STARTED
```
