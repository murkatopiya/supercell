# Tilting / Stretching Direction Revalidation

**Status:** architecture / physics-direction checkpoint
**Scope:** revalidate the existing tilting / stretching
*direction* against the CURRENT repository. Not an
implementation design. Not a VelocityField. Not Y12 as a
production slice.
**Physics:** RESUMED FOR DESIGN / MODEL DEVELOPMENT (`24`).
Headless T1 was later implemented and validated. Post-T1
direction lives in `27`. This file does not rank that work.
**Implementation:** none from this file. Docs-only.
**Decision:** CONDITIONAL. Tilting / stretching remains the
leading *modeling question*. The next earned capability is
**not** derived rotation, prognostic `ω_z`, or an eighth
operand. It is a dedicated diagnostic-tendency architecture
SoT (T1), with `V_total` left unchanged.

Successor physics derivation (T1 diagnostic, not architecture):

```text
docs/physics/22-diagnostic-tilting-tendency.md
```

`22` is the physics SoT for diagnostic tilting tendency
`T_tilt,y`. This file remains the direction-revalidation
checkpoint.

Successor T1 architecture SoT:

```text
docs/architecture/26-diagnostic-tilting-tendency-architecture.md
```

`26` owns T1 ownership, sampling, wiring, and slices.
Headless T1 is now implemented and scientifically validated.
This file remains the pre-T1 direction-revalidation checkpoint.
It does not rank post-T1 work.

Post-T1 physics direction checkpoint:

```text
docs/architecture/27-post-t1-physics-direction-checkpoint.md
```

`27` answers what is earned after validated T1. Completing
`26` did **not** start T2, stretching, or `ω → V`.

Predecessor perceptual / physics-resumption checkpoint:

```text
docs/architecture/24-perceptual-exploration-checkpoint.md
```

`24` remains SoT for closing the current perceptual loop and
for lifting the physics pause of `15` D for design. This
document answers the docs-first revalidation `24` named. It
does not replace `22`, `23`, or `24`.

Historical tilting / stretching *sketch* (not current design):

```text
docs/architecture/15-post-near-ground-outflow-checkpoint.md
  §9  Tilting / stretching fork
  §14 Modeling item 1
```

`15` remains the continuity / near-ground checkpoint of that
arc. §9 is a historical sketch. This file says which of its
claims still hold.

Interaction-class milestone (not equations):

```text
docs/architecture/02-current-model-assumptions-audit.md
  Y12
```

`02` remains a historical assumptions audit after the 12 km
environment. Its live-composition snapshot is five operands
and height-independent `RotationField`. Current DEMO is seven
operands and `VerticalEnvelopeRotationField`. Do not silently
reconcile that.

This document did **not** change production code.
It did **not** write the T1 architecture SoT; that successor
is `26`.
It does **not** design implementation slices.
It does **not** add an eighth compositor operand.
It does **not** resolve vorticity → velocity inversion.
It does **not** retune continuity.

Keep these roles distinct:

```text
CURRENT FACT
HISTORICAL DECISION
STILL-BINDING CONTRACT
OPEN QUESTION
RECOMMENDATION
NEW PROJECT DECISION
```

If a historical document disagrees with current production,
the disagreement is recorded. It is not patched into a fake
continuity of narrative.

---

## 1. Why this checkpoint exists

`15` named tilting / stretching as the leading future
modeling branch and required an architecture SoT before any
code. `16`–`20` then built Explore, Inspector, and Guided on
the *current* prescribed sum. `21` kept tilting as the
leading modeling *direction* when physics resumes, and
explicitly did not select it as the next implementation
branch. `24` lifted the physics pause for design and required
this revalidation against the CURRENT tree.

The risk this checkpoint exists to prevent:

```text
not:  port 15 §9 into production because physics resumed
not:  treat Y12 as already specified
not:  add V_rot = f(∇V_up, ω_env) as an eighth operand
not:  relabel prescribed Ω as “tilting”
not:  assume Inspector / Guided / visual occupants
      will stay honest if rotation becomes derived
```

The question is not “how to add tilting.”

The question is which next step actually moves this prescribed
kinematic laboratory toward a more causal supercell model
without selling diagnostics as dynamics.

---

## 2. Current physics baseline

**Kind:** CURRENT FACT, verified against `src/**` and live
DEMO composition, not against `02`’s five-operand snapshot.

Live composition owner:

```text
src/app/composeDemoTracerSimulation.ts
  composeDemoTracerFields
  demoInspectableVelocityOperands
```

Live App / Explore / Guided use
`IntegrationFrame.StormRelativeLaboratory`. The composite
does not know the frame. Only the environmental operand
changes (`StormRelativeEnvironmentalAdvectionField` vs
`EnvironmentalWindField`).

### 2.1 A. The seven operands of `V_total`

In compositor order, with DEMO contribution keys:

| # | Key | Live type | Role |
| --- | --- | --- | --- |
| 1 | `environmentAdvection` | `StormRelativeEnvironmentalAdvectionField` wrapping `EnvironmentalWindField` | D2: `V_env − C` horizontally; `Vy ≡ 0` |
| 2 | `updraft` | `VerticalEnvelopeUpdraftField` | prescribed `Vy = W0 E(r) F(y)` |
| 3 | `rotation` | `VerticalEnvelopeRotationField` | prescribed azimuthal `Vh` about `+Y` |
| 4 | `lowerInflow` | `LowerRadialInflowField` | prescribed near-axis radial inflow, height-windowed |
| 5 | `upperOutflow` | `UpperRadialOutflowField` | prescribed near-axis radial outflow, upper window |
| 6 | `downdraft` | `VerticalEnvelopeDowndraftField` | prescribed `Vy < 0`, offset axis |
| 7 | `nearGroundOutflow` | `NearGroundRadialOutflowField` | prescribed near-ground radial outflow, offset axis |

`CompositeVelocityField` is an unweighted world-space sum
(`docs/physics/12-composite-velocity-field.md`). It does not
name operands, does not own diagnostics, and does not host
interactions.

**Discrepancy:** `02` §2 / §11 still describe five operands
and height-independent `RotationField`. That is HISTORICAL.
Live occupant is `VerticalEnvelopeRotationField`
(`docs/physics/18-vertical-rotation-envelope.md`). Isolated
`RotationField` (`docs/physics/13-rotation-field.md`) remains
a height-independent primitive, not the DEMO occupant.

### 2.2 B. Which are prescribed velocity fields

**All seven.** Each implements `VelocityField.sample(position,
time) → Vec3`. None is a diagnosed tendency. None is an
evolved field state.

Isolated primitives (`UpdraftField`, `RadialInflowField`,
`RotationField`, `SolidBodyRotationYField`,
`ConstantVelocityField`, `LinearXVelocityField`) exist for
tests and learning. They are not live DEMO operands.

### 2.3 C. Where rotation is set

`ScenarioConfig.storm.rotation` is a plain DTO
(`src/scenario/ScenarioConfig.ts`). Validation and the field
live on `VerticalEnvelopeRotationField`. Factory:
`src/scenario/createRotationField.ts`. DEMO fixture
(`DEMO_SCENARIO.storm.rotation`):

```text
center     = (0, 0) in (x, z)
Ω          = 0.005 rad/s
σ          = 4000 m
[y_b, y_t] = [0, 6500] m
```

Formula (physics `18`, matched by production):

```text
E(r) = exp(−r² / (2σ²))
G(y) = sin(π (y − y_b) / H)   on [y_b, y_t], else 0
Vx   = Ω E G dz
Vy   = 0
Vz   = −Ω E G dx
```

`time` is ignored.

### 2.4 D. What current rotation is

**A prescribed horizontal velocity field.** Not vorticity
state. Not a diagnostic. Not tilted environmental `ω_h`.
Not stretched `ω_z`.

Physics `18` documents the curl of *this operand* as an
identity, not as an API:

```text
∇ · V_rot = 0 identically
ω_y = 2 Ω G E (1 − r² / (2σ²))     (world vertical vorticity)
```

That `ω_y` is bookkeeping of the prescribed spin. Production
does not expose `curl()`. Inspector contribution row
`rotation` is `V_rotation` at the point, not `ω_y`.

**STILL-BINDING CONTRACT:** do not claim prescribed rotation
is `ω_z` (`19` §14 Forbidden; `18` physics; `02` GREEN;
`15` §9.1).

### 2.5 E. What environmental wind / shear already give

Actual APIs, hodograph-layer diagnostics, not storm-composite
curl:

```text
EnvironmentalWindProfile
  → EnvironmentalWindField                    (VelocityField)
  → verticalWindShearBetween                  → HorizontalWindShear
  → horizontalVorticityFromShear              → HorizontalVorticity
  → stormRelativeWind                         → StormRelativeWind
  → decomposeHorizontalVorticity              → StreamwiseCrosswiseVorticity
  → storm-relative helicity (`09`)            → layer integral
```

Live DEMO also has D2:

```text
StormRelativeEnvironmentalAdvectionField
  V_env_sr = V_env_ground − C     (horizontal only)
```

These quantities are horizontally homogeneous in `x, z`. They
vary with height because the profile does. They do not know
the updraft, rotation, or other storm operands.

### 2.6 F. Is `ω_h` an actual API?

**Yes, as a layer diagnostic. No, as a 3D field.**

`src/physics/environment/horizontalVorticity.ts` implements
`horizontalVorticityFromShear`. Units `1/s`. Meaning: finite
layer `ω_h` implied by vertical shear of a horizontally
homogeneous environmental profile (`docs/physics/06-horizontal-vorticity.md`).

It is **not**:

- local `ω(x, y, z)` of `V_total`;
- curl of the updraft;
- curl of prescribed rotation;
- a tilting rate;
- Inspector Level 2 content.

Hodograph overlays already consume it. Inspector Level 3 may
later show it as *environment context*. That is not tilting.

### 2.7 G. Spatial derivatives of the updraft

**Documented analytic `∂Vy/∂y`. No production gradient API.
Horizontal gradients of `Vy` follow from the formula but are
not a locked diagnostic SoT.**

`VelocityField` v1 exposes only `sample`
(`src/core/fields/VelocityField.ts`). Physics `15` §9:

```text
inside (y_b, y_t):
  ∂Vy/∂y = W0 E_r(r) (π / H) cos(π ξ)
lids: F is C⁰, not classically differentiable
there is no production derivative() API
```

The field is `V = (0, W0 E_r F, 0)`. Therefore, as algebra
on the documented formula, not as a current API:

```text
∂Vy/∂x = W0 F(y) E_r (−dx / σ²)
∂Vy/∂z = W0 F(y) E_r (−dz / σ²)
```

**Kind:** these horizontal derivatives are CURRENT FACT as
consequences of the locked velocity formula.
They are OPEN QUESTION as a canonical diagnostic input until
a later SoT names them, states lid policy, and chooses
analytic vs finite-difference sampling.

Tilting of `ω_h` into vertical vorticity needs `∇_h w`, i.e.
those horizontal derivatives. Stretching needs `∂w/∂z` in
atmospheric language, which here is `∂Vy/∂y`.

The downdraft has an analogous `Vy < 0` envelope. This
revalidation does not promote downdraft gradients into a
tilting design. That would be a separate honesty question
(RFD/FFD vs mesocyclone tilting).

### 2.8 H. Prognostic physical state besides tracers / time

**No.**

Runtime evolved state today:

```text
SimulationClock.time
tracer positions, age, active, tracerId
TracerPathHistory (observation of positions)
Explore session occupancy
visual airflow occupant positions / ages   (visualization, not physics)
```

`Simulation` (`src/simulation/Simulation.ts`) owns tracers
and the clock. It samples a caller-supplied `VelocityField`.
It does not own field state. Fields do not mutate on `step`.

Reset restores tracer seeds. It does not reset a physical
field because there is none to reset.

### 2.9 I. Is `V_total` steady?

**Yes, in current DEMO configuration, despite a
time-capable API.**

`VelocityField.sample(position, time)` accepts `time`. Live
storm operands ignore it (`_time`). Environment depends on
`y` only. Storm motion `C` is a constant subtract, not a
translating center (D3 remains closed, `15` §10).

Trajectory time-dependence is Lagrangian: position changes,
the Eulerian field does not. Visual Pause freeze
(`stepVisualAirflowOnFrozenField`) therefore samples the
same field it would have sampled in PLAY at that laboratory
`t`. Frozen-field Pause is currently a numerical/occupancy
distinction, not a frozen-vs-evolving atmosphere.

RK2 exists (`src/core/integrators/RK2Integrator.ts`) as a
validation integrator. Live DEMO / Explore / Guided /
visual population use `EulerIntegrator`. That is orthogonal
to tilting.

### 2.10 J. Prescribed vs diagnosed vs evolved

```text
prescribed field
  seven VelocityField operands
  V_total = Σ V_i
  ScenarioConfig DTOs
  steady in DEMO

diagnosed quantity
  shear, ω_h, streamwise/crosswise, SRH
  hodograph overlays
  Inspector V_i samples of prescribed operands
  documented curls / divergences as identities, not APIs

evolved physical state
  none
  tracers are probes, not atmosphere
  visual occupants are not atmosphere
```

**STILL-BINDING CONTRACT:** `CompositeVelocityField` is
laboratory addition, not mass-consistent dynamics, not an
interaction host (`12` physics; `02` Y12; `15` §9.4).

---

## 3. What changed since the sketch in `15`

**Kind:** CURRENT FACT relative to `15` D.

`15` §9 could not assume, and current production now has:

| Capability | Status now |
| --- | --- |
| Explore arbitrary seeding / session | live (`18`) |
| Shared Inspector L1/L2 on canonical operand instances | live (`19`) |
| Guided catalog + runtime, three experiments | live (`17`, `20`) |
| Visual airflow population on the same `V_total` | live (`22`, `23`) |
| Comets provisional; operand tint diagnostic | `24` |
| Physics pause of Verdict D | lifted for *design* (`24`) |

These do not make derived rotation easier. They raise the
honesty cost of changing what “rotation” means, because
contribution rows, Guided copy, and visual occupants now
observe the prescribed sum.

`15` also said four exhibits could not then be inspected, so
opening Y12 “in the dark” would repeat `02`’s inheritance
failure. That product blocker is **SUPERSEDED**. The three
Guided experiments plus Explore Inspector L2 are live. The
physics-class warning in §9.4 is **not** superseded.

---

## 4. Old sketch revalidation

Source: `15` §9 and §14.1; `02` Y12. Each claim is judged
against CURRENT FACT, not against the hope that the sketch
was already a SoT.

### 4.1 `15` §9.1 — current rotation is prescribed, independent, steady, azimuthal; `∇ · V = 0`; not curl of env or updraft; not evolved `ω_z`

**STILL HOLDS.** Live type is still
`VerticalEnvelopeRotationField`. Envelope bounds changed
historically (`02` had height-independent rotation); the
*kind* of object did not.

### 4.2 `15` §9.1 — story copy must not say “captured”

**STILL-BINDING CONTRACT.** Guided
`inflow-to-upper-outflow` `doesNotMean` still forbids
mesocyclone capture. A diagnostic tilting overlay would not
license that word. A later generated-rotation model would
need a new copy review; it would not automatically earn
“capture.”

### 4.3 `15` §9.2 — textbook chain has diagnostic ingredients, not an evolution operator

**STILL HOLDS**, with a tighter CURRENT FACT:

| Ingredient | Then | Now |
| --- | --- | --- |
| `HorizontalVorticity` | layer `ω_h` from homogeneous env | same API, still not local 3D `ω` |
| streamwise / crosswise | projection on `V_sr,h` | same; still not a tilting rate |
| SRH | integral; not mesocyclone intensity | same |
| updraft gradients | `∂Vy/∂x,z,y` “exist” | `∂Vy/∂y` documented; `∇_h Vy` algebraic, not an API |
| composite `V` | then five, conceptually “not a vorticity carrier” | now seven; still not a vorticity carrier |

The phrase “exist” for horizontal updraft gradients was
optimistic as an API claim. It remains true as calculus on
the formula.

### 4.4 `15` §9.2 — those diagnostics can explain the story in words / hodograph overlays; they cannot replace `VerticalEnvelopeRotationField`

**STILL HOLDS.** Hodograph already shows `ω_h` and
streamwise/crosswise. Inspector L2 shows `V_rotation`.
Nothing in the current stack produces derived azimuthal
velocity from shear.

### 4.5 `15` §9.2 — homogeneous `ω_h` tilted by a localized updraft yields a vortex couple, not a single cyclonic mesocyclone; preferential cyclonic organization is the streamwise story SRH diagnoses and this stack does not evolve

**STILL HOLDS.** This is the central physical honesty
constraint on any later T3/T4. A diagnostic T1 that showed
only a cyclonic core would be a visualization lie unless the
model actually selected cyclonic organization.

### 4.6 `15` §9.3 — derived/evolving rotation needs local vorticity (3D `ω` or prognostic `ω_z` + closure) *or* diagnostic curl plus a tendency step; coupling to updraft gradients and env `ω_h`; stretching uses prescribed `∂Vy/∂y` or buoyant `w`; time or steady diagnostic balance are both new

**STILL HOLDS as a boundary, NEEDS REVISION as a menu.**

The boundary is right: Y12 is a new model class.

The menu mixed four different capabilities (curl
bookkeeping, tendency diagnostics, prognostic state,
velocity coupling). Current Inspector / visualization /
Guided make that mixing more expensive. This checkpoint
splits them (`§6`, `§15`).

Buoyant `w` remains a thermo fork, not a tilting default.
**STILL-BINDING:** stretching of prescribed `∂Vy/∂y` is
still kinematic if used.

### 4.7 `15` §9.3 — one-shot diagnostic curl of the composite is bookkeeping, not tilting

**STILL HOLDS.** Curl of `V_total` would show env `ω_h`
(uniform in `x, z`), updraft’s `ω_h` from `∇ × (0, Vy, 0)`,
rotation’s `ω_y` and lid `G'` horizontal vorticity, plus
curls of inflow/outflow/downdraft. Summing those is not the
tilting *operator*.

### 4.8 `15` §9.4 — `CompositeVelocityField` cannot host this as an eighth independent operand

**STILL HOLDS.** `12` physics and Y12 are still the
compositor contract. A term `V_rot = f(∇V_up, ω_env)` is an
interaction. Adding it as `fields[7]` would look like the
compositor “learned dynamics.”

### 4.9 `15` §9.4 — architecture research may choose overlays-only, diagnostic curl, parameterized tilting source, or prognostic `ω`; checkpoint does not choose

**NEEDS REVISION.** As an open menu this is still fair.
As “the next SoT should keep all four equally live” it is
not. Current repository evidence is enough to *rank* them
(`§15`, `§16`). Choosing T3/T4 now would be premature.
Keeping T1 from being named as the next *design target*
would repeat the sketch’s under-specification.

### 4.10 `15` §9.5 / §14.1 — tilting / stretching is the leading future modeling branch; when modeling resumes, open an architecture SoT, docs only; do not implement; do not add an eighth operand that pretends to be tilting

**STILL HOLDS as process. NEEDS REVISION as scope of that
SoT.**

Process: docs-first, no eighth operand, no implementation
from this checkpoint — still right.

Scope: `15` called the missing document “tilting /
stretching *interaction* architecture SoT,” which reads as
Y12 itself. Current evidence: the next SoT must be a
**diagnostic-tendency + ownership + non-coupling** document,
and must explicitly park interaction / inversion. Calling
the next SoT “interaction architecture” would smuggle Y12
back in.

### 4.11 `15` §14 — no remaining honest additive sibling; continuity-aware model only if teaching becomes mass-consistent circulation; thermo later; D3 not reopened

**STILL HOLDS.** This revalidation did not discover an
eighth prescribed mechanism that should go in before
tilting work. Continuity remains YELLOW (`10`), not a
mandatory gate for T1 (`§12`).

### 4.12 `15` D — stop adding physics temporarily; architecture / UX first because exhibits were dark

**SUPERSEDED as current status** by `16`–`24` (product
built; pause lifted for design in `24`).
**STILL HOLDS as historical reason** that Y12 was not
opened in 2026-08-18-era darkness.

### 4.13 `02` Y12 — first **interaction** mechanism (tilting, pressure, continuity solver)

**STILL HOLDS as a milestone class. NEEDS REVISION as
“next named document.”**

Y12 groups three different interactions. Continuity solver
is not the same problem as tilting (`§12`). Pressure is not
in the model. Treating Y12 as a single implementation
target remains forbidden.

Y12 is **not** earned by T1. T1 is diagnostics of
ingredients. An interaction mechanism would be T3/T4, or a
later named class. This checkpoint does not mark Y12 done
and does not start it.

### 4.14 `21` Candidate 5 — leading modeling direction when physics resumes; HIGH premature-architecture risk if implementation starts before SoT or if `Ω` is relabeled “tilting”; not the next implementation branch of `21`

**STILL HOLDS**, with `24` having closed Candidate 1’s
current loop and this file replacing “revalidation required”
with a ranked capability answer.

### 4.15 `ARCHITECTURE.md` §30 — future files `docs/physics/06-tilting.md`, `07-stretching.md`

**SUPERSEDED as a filename plan.** Live `06` is horizontal
vorticity, `07` is storm-relative wind (`24` §7.1). Do not
create those files to “fill the outline.”

---

## 5. Causal chain

**Kind:** physical relations we might want to model,
separated from what the laboratory currently *does*.

Textbook skeleton:

```text
environmental vertical shear
        ↓
horizontal vorticity ω_h
        ↓
storm-relative inflow / streamwise component
        ↓
updraft spatial gradients
        ↓
tilting into vertical vorticity
        ↓
stretching / amplification
        ↓
vertical vorticity ω_z
        ↓
???
        ↓
effect on velocity field / tracer motion
```

### 5.1 What is already diagnostic, not causal

Shear → `ω_h` → streamwise/crosswise → SRH is implemented
and honest as hodograph-layer diagnosis of the
*environment*. It does not touch storm operands. It does
not create rotation in 3D.

### 5.2 Tilting as a local kinematic source term

In the inviscid vorticity equation, the tilting contribution
to vertical vorticity is the horizontal vorticity dotted
into the horizontal gradient of vertical velocity:

```text
(tilting source of ω_vertical) ∼ ω_h · ∇_h w
```

In this laboratory, a *diagnostic* evaluation can use:

- `ω_h` from the environmental profile at the tracer’s
  height layer (piecewise-constant between DEMO knots);
- `∇_h w` from the prescribed updraft formula.

That product is spatially structured by the updraft, not by
environmental inhomogeneity. Crosswise `ω_h` gives the
classic couple. Streamwise `ω_h` shifts the pattern. None
of that is currently computed in production.

**This is still not an evolution operator.** It is a
snapshot source term of two prescribed fields.

### 5.3 Stretching as a different operator

Stretching of vertical vorticity is

```text
(stretching source) ∼ ω_z (∂w / ∂z)
```

Here `∂w/∂z` is `∂Vy/∂y` of the updraft (and any other
vertical-velocity operand, if included). It requires an
`ω_z` *already*. See `§7`.

### 5.4 The last arrow: `ω_z` → velocity → tracers

**This is the unsolved bridge. Kind: OPEN QUESTION. Not
solved by this checkpoint.**

Passive tracers sample `V`, not `ω`. Vertical vorticity is
a derived field of `V` (or an independent prognostic that
must be inverted / closed back to `V`).

Possible endings of the chain:

| Ending | Meaning |
| --- | --- |
| stop at tendency | user sees a source-term field; tracers still follow prescribed `V_total` |
| stop at `ω_z(x,y,z)` snapshot | still no tracer effect unless displayed as a layer |
| evolve `ω_z` in time | still no tracer effect without a bridge |
| parameterized `V_rot(ω)` | model closure; not a diagnosis |
| invert `ω → V` | nonlocal, boundary-valued, a different laboratory class |
| dataset supplies `V` | vorticity is diagnosed from that `V`; no synthetic bridge |

**NEW PROJECT DECISION:** do not treat
`ω_z ⇒` new tangential `VelocityField` as automatic.
That step is a closure, not a diagnostic identity.

Where physically diagnosed quantity ends:

```text
diagnosed:  ω_h, ∇w, tilting tendency, stretching tendency,
            curl of a known V, maybe a snapshot ω_z of that V

closure / parameterization begins:
            any rule that creates or replaces velocity
            from those tendencies or from ω_z
```

---

## 6. Tilting — what it could mean in *this* model class

Evaluated for our prescribed kinematic laboratory, not for
CM1.

### 6.1 A. Pure diagnostic tilting tendency (T1-tendency)

**Means:** at `(x, y, z)` or on a selected tracer, compute
a local tilting source from env `ω_h` and updraft `∇_h w`.
Display it. `V_total` unchanged.

**Does not mean:** the storm is generating mesocyclonic
rotation; tracers are being spun by tilted vorticity;
prescribed `Ω` is explained.

**Inputs:** environmental profile / `ω_h` at height;
updraft parameters or samples for `∇_h w`; explicit
coordinate map `(eastward, northward) ↔ (x, −z)`.

**State ownership:** none new. Compute on inspect / overlay
sample.

**Time:** snapshot on a steady field, or frozen-`t` if the
field later becomes unsteady. Not an ODE.

**Coupling to `V_total`:** none.

**Architecture fit:** high. Matches Inspector / hodograph
as observers. Does not break compositor.

**Honesty:** high if labeled as kinematic source term of
prescribed ingredients. Low if UI says “this is why it
rotates” while rotation remains `Ω`.

**Complexity:** low–medium (docs + observation API; lid
policy for `∇w`; streamwise vs crosswise split).

**Extensibility:** the same observation ports later work
on dataset `V` if `ω` and `∇w` are defined there.

**Corner risk:** low if non-coupling is locked. Medium if
the overlay is later quietly wired into a velocity term.

### 6.2 B. Diagnostic vertical-vorticity *tendency* without integrating `ω_z`

Same as A, possibly plus stretching term, shown as
`∂ω_z/∂t |_source` without a stored `ω_z`.

**Does not mean:** there is a vorticity field that has been
stretched over time. A rate without a state is not
amplification history.

Honesty requires that distinction in copy.

### 6.3 C. Prognostic `ω_z` state (T2)

**Means:** `ω_z` becomes evolved:

```text
dω_z / dt = −V · ∇ω_z + tilting + stretching + …
```

**Does not mean:** a solved Euler / anelastic atmosphere.
Advection of `ω_z` by the *prescribed* `V_total` is still a
model on top of a divergent kinematic laboratory.

**Inputs:** a spatial representation (grid, basis, or
tracer-carried scalar — all new); ICs; boundary policy;
which `V` advects it; which `w` stretches it.

**State ownership:** cannot live inside stateless
`VelocityField.sample`. Cannot honestly live only on
scientific tracers (vorticity is Eulerian). `Simulation`
today is a tracer integrator; stuffing a 3D field there
changes its class (`§10`).

**Time:** a physics timestep appears. Relation to tracer
`dt` and to visual freeze is new.

**Coupling:** still none until `§11`. Prognostic `ω_z` that
does not affect `V` is an evolved *display* state.

**Honesty:** medium as a teaching ODE on prescribed strain.
Low if sold as supercell vorticity dynamics.

**Complexity:** high. Reset, Guided switch, replay, RK2 of
tracers vs field, domain lids — all reopen.

**Corner risk:** high. Dataset evolution would not use this
state (`§14`). Continuity YELLOW infects stretching and
advection (`§12`).

**Verdict here:** not the next earned capability.

### 6.4 D. Parameterized interaction model (T3)

**Means:** some controlled `V` response attributed to
tilting, without full vorticity dynamics. Example shape
(not an API): a localized couple or a cyclonic patch whose
amplitude tracks `ω_s |∇_h w|`.

**Does not mean:** the vorticity equation.

**Coupling:** changes `V_total` by construction.
Compositor cannot host it as an independent eighth
operand (`15` §9.4 still holds). Needs a new model owner
that *uses* operands as ingredients.

**Honesty:** only if copy says parameterized. Relabeling as
“tilting physics” is the `21` Candidate 5 trap.

**Double counting:** acute if prescribed `Ω` remains
(`§8`).

**Corner risk:** high. Easy to ship, hard to unwind, DEMO
geometry-specific.

**Verdict here:** not next. Park in the future SoT as an
explicit non-goal of the first design.

### 6.5 E. Other architecturally reasonable variants found in-repo

**E1. Diagnostic curl of `V_total` / of isolated operands
(T1-curl).** Bookkeeping. Useful so Inspector can show
that prescribed rotation *has* a curl, and that env `ω_h`
is not that curl. Not tilting. `15` §9.3 still holds.

**E2. Relabel `Ω(y)` from SRH or streamwise vorticity.**
Still a prescribed velocity. Forbidden as “tilting”
(`21` Candidate 5; `02` Action: do not explain DEMO
rotation as streamwise tilting).

**E3. Dataset / external model supplies time-dependent
`V`.** Tilting is then a diagnostic of that `V`, not a
synthetic generator. Compatible with CONCEPT long-term.
Not the next synthetic-laboratory step (`§14`).

**E4. Steady diagnostic balance** (`15` §9.3). Solve
`0 = tilting + stretching + dissipation` for `ω_z` without
time. Still needs a bridge to `V` if tracers should feel
it. Same closure problem, plus an extra dissipation
invention. Not next.

---

## 7. Stretching

Stretching is not “the next line after tilting” in code.

### 7.1 What it would amplify

Vertical vorticity `ω_z` (world `ω_y`) by the vertical
strain `∂Vy/∂y`. In a mass-conserving vortex-tube picture,
that is stretching/squashing of material tubes. In this
laboratory `∂Vy/∂y` is a prescribed envelope derivative,
and `∇ · V ≠ 0` for the updraft operand (`10`, physics
`15`). Kinematic strain exists. Material-tube conservation
does not.

### 7.2 Does stretching need existing `ω_z`?

**Yes.** If `ω_z = 0`, stretching is zero. Tilting is the
usual source that *creates* vertical vorticity from `ω_h`.
Stretching then amplifies it.

### 7.3 Can stretching mean anything without prognostic `ω_z`?

**As a diagnostic rate, yes. As amplification history, no.**

A snapshot `ω_z ∂Vy/∂y` is well-defined once an `ω_z`
operand is chosen. Integrating that rate is T2.

### 7.4 Which `ω_z` would the rate use?

| Candidate `ω_z` | What stretching would then mean |
| --- | --- |
| curl of prescribed rotation | strain of the *painted* vortex by the painted updraft. Not tilted-env dynamics. Double-counting conceptually if later also generating `ω_z` from tilting |
| curl of `V_total` | mixed bookkeeping of all operands, including divergent inflow/outflow |
| diagnostic tilting snapshot (not integrated) | a rate acting on a rate’s spatial pattern, still not history |
| prognostic `ω_z` | actual amplification in that ODE, still kinematic `w` |

**NEW PROJECT DECISION for the next SoT to lock, not
here:** do not stretch prescribed-`Ω` vorticity and call it
supercell stretching. If T1 shows a stretching row at all,
it must name its `ω_z` source and anti-claim the others.

### 7.5 Feedback

True stretching feedback is: `ω_z` ↑ → (bridge) `V_rot` ↑
and/or `w` changes → strain changes → `ω_z` ↑. The current
stack has no such loop. Prescribed `W0` and `Ω` are
independent DTO knobs.

T1 has no feedback. T2 without a bridge has feedback only
inside the `ω` ODE, invisible to tracers. T3/T4 can create
feedback, including numerical blow-up on `∂Vy/∂y > 0` in
the lower updraft.

### 7.6 Avoid amplifying prescribed rotation

If T1 includes stretching, default **RECOMMENDATION:**
either omit stretching until a non-prescribed `ω_z` exists,
or show it only as a *what-if* on a named diagnostic `ω_z`,
never as a modifier of `ScenarioRotation.angularVelocity`.

Do not add `Ω_eff = Ω (1 + α ∂Vy/∂y)`. That is T3 in
disguise and double-counts.

### 7.7 Three senses

```text
diagnostic stretching tendency
  snapshot ω_z * ∂Vy/∂y
  V_total unchanged

evolved stretching of prognostic vorticity
  T2 term
  still not tracer-visible without a bridge

visual explanation
  copy / overlay that the lower updraft would stretch
  cyclonic vorticity if any were there
  not a number pretending to be that history
```

---

## 8. Prescribed rotation / double counting

Central revalidation question. Current system already has
a rotation operand.

### 8.1 Options

**1. Leave `Ω` as-is. Tilting/stretching are diagnostics
only.**

Compatible with T1. Contribution row `rotation` stays
`V_rotation`. No double counting in `V_total` because
nothing generated is added. Residual honesty risk: users
may think the overlay *explains* the spin. Copy must say
it does not.

**2. Keep baseline/background rotation; add a generated
component.**

Double counting unless the SoT defines complementary
roles (e.g. baseline = tornado-scale stub, generated =
mesocyclone). Current `Ω` *is* the mesocyclone-scale
laboratory spin, coincident with the updraft axis. There
is no honest leftover “background” without a new physical
claim. **Not choosable now.**

**3. Gradually replace interaction-generated rotation.**

Requires T3 or T4, a switch-off of `ScenarioRotation` in
composition, Guided/Inspector retcon, and an answer to the
vortex-couple vs single cyclone problem. **OPEN QUESTION
for a later model-class SoT. Not next.**

**4. Use prescribed `Ω` only as calibration / reference /
Guided fixture.**

Makes sense *after* a generated component exists and can
be compared. Until then it is option 1 with extra
vocabulary. **Not next.**

**5. Other: composition flag that zeros the rotation
operand for a diagnostic exhibit.**

Product-useful later (Guided “shear without painted
spin”). Still not generated rotation. Does not require
T3. Could be a later Guided experiment on the *current*
sum. Out of scope here; not an eighth operand.

### 8.2 Double counting

```text
prescribed Ω
+ generated ω_z-derived circulation
= ???
```

If both occupy the same chimney, tracers see roughly
`V_rot,prescribed + V_rot,generated`. There is no current
physical rule that these are orthogonal. Diagnostics of
tilting would then be explaining a spin that is already
fully supplied by `Ω`.

**NEW PROJECT DECISION:** this cannot be solved
cosmetically (opacity, a second color, “subtle baseline”).
Options 2–4 remain OPEN. Option 1 is the only honest
pairing with the next capability (T1).

The future interaction SoT, *if* Y12 is ever opened,
must choose 3 or a documented 2 before any generated `V`
is composed. This revalidation does not choose among 2–4.

---

## 9. State-architecture implications

Not an API design. A map of consequences.

### 9.1 T1 (next target)

```text
VelocityField          remains stateless observer
Simulation             remains tracer integrator
visual population      still samples V_total
Inspector              may grow a separate diagnostic
                       observation port, not a new V_i row
Reset / experiment switch / replay
                       unchanged physically
                       diagnostics recompute from fields
```

No physics timestep beyond tracer `dt`.

### 9.2 T2+

| Question | Implication |
| --- | --- |
| Where does `ω` live? | New model/runtime owner. Not rendering. Not UI. Not `CompositeVelocityField`. |
| Can `VelocityField` stay stateless? | `sample` can stay a pure read *if* the owner updates field state *before* sampling. The owner is not the interface. |
| Should `Simulation` own physics state? | **RECOMMENDATION:** no. Today it is a tracer stepper. Expanding it into an atmospheric model hides a class change inside a familiar name. |
| Physics `dt` vs tracer `dt` | Must be explicit. Same `dt` is a choice, not an identity. Visual freeze at `t_pause` would freeze *both* if `V` depends on evolved `ω(t)`. |
| Reset | Must restore `ω` ICs, not only tracer seeds. Explore empty session vs Guided fixtures need defined `ω` ICs. |
| Experiment switch | Fresh lab already rebuilds fields (`createGuidedLab`). Evolved state would rebuild too — only if ICs are scenario-owned. |
| Deterministic replay | Needs `ω` IC + identical timesteps. Currently replay is Euler + seeds + steady `V`. |
| Future RK2 | Tracer RK2 samples `V` at midpoint. If `V` depends on `ω(t)`, operator splitting / same-step coupling appears. Not a reason to do RK2 first (`§16` C). |
| Dataset-backed `V` | External `V(x,t)` makes synthetic `ω` state redundant. Observation of `ω = ∇ × V` remains. |

**STILL-BINDING CONTRACT:** physics defines atmospheric
state; rendering observes it (`ARCHITECTURE.md`). A future
`ω` owner is physics/model, not `VisualAirflowPopulation`.

---

## 10. Velocity ↔ vorticity bridge

Mandatory because tracers move with `V`.

| Class | Honesty | Locality | Continuity | Cost | Now vs later |
| --- | --- | --- | --- | --- | --- |
| **None (diagnostic only)** | Highest for current lab | n/a | No new `div` | Low | **NOW as design target** |
| **Local parameterized rotational `V`** | Low–medium; a closure | False locality (vorticity induces `V` nonlocally) | New `div` unless the kernel is div-free by construction | Medium | Later, only as named parameterization |
| **Analytic vortex reconstruction** | Medium inside its assumptions (axisymmetric, Rankine/solid-body, lids) | Enforces a center; fights the couple | Isolated solid-body is `div 0`; matching to updraft is not | Medium | Later; DEMO-shaped |
| **Inversion / Poisson / streamfunction** | High *inside* chosen continuity (e.g. `∇ · V = 0` in 2D/3D) | Nonlocal; needs BCs | **Forces continuity work** | High | Later; this is a continuity-class project, not a tilting add-on |
| **Other closure** | Depends | Depends | Depends | — | Must be named, not implied |
| **Dataset/model source owns `V`** | Highest for real fields | n/a | Whatever the dataset has | Adapter cost | Separate evolution; not synthetic tilting |

Do not pick a solver because it is physically beautiful.
Inversion belongs with a continuity / dynamics class, not
as a helper to make T1 “visible in the wind.”

**NEW PROJECT DECISION:** next design target uses the
**none** bridge. Any other class requires its own later
SoT and a prescribed-`Ω` decision (`§8`).

---

## 11. Continuity YELLOW

`10` remains SoT for the measured residual of the then
five-operand chimney. Live stack is seven operands; `10`
already records that it is not a retune of later occupants.
Status: **YELLOW**, not ε, not RED. A solver is required
only when the teaching goal becomes mass-consistent
circulation (`10` C; `15` §14; `21` Candidate 6).

### 11.1 Does T1 make divergence worse?

No. `V_total` unchanged.

### 11.2 False mass-consistent circulation

A cyclonic overlay on divergent prescribed flow can *look*
like a mesocyclone even when mass is not consistent. Copy
must not upgrade YELLOW. Operand tint already has this
honesty problem for `V_i`; a vorticity overlay would be
stronger.

### 11.3 Does diagnostic vorticity depend on continuity?

- Env `ω_h` from a horizontally homogeneous profile:
  `∇ · V_env = 0`. Independent of chimney YELLOW.
- Tilting `ω_h · ∇_h w` using prescribed updraft `w`:
  uses a divergent `w`. The *formula* is still the
  kinematic tilting product. Interpreting it as the
  vorticity-equation term of an incompressible flow is
  stronger than the laboratory.
- Stretching `ω_z ∂Vy/∂y`: `∂Vy/∂y` **is** the updraft
  divergence. Vortex-tube stretching language assumes
  continuity more strongly than tilting language.
- Curl of `V_total`: well-defined kinematically on a
  smooth interior; YELLOW does not block the derivative.
  It blocks *reading* that curl as a mass-consistent
  vortex.

### 11.4 Must continuity be solved *before* tilting?

**No, for T1.** Continuity YELLOW does not prevent an
honest diagnostic product of env `ω_h` and prescribed
`∇w`.

**Yes, as a practical coupling, for T4 inversion** and
for any claim that generated circulation is
mass-consistent.

**Maybe, for T2 stretching-as-material-tubes.** The ODE
can still be written kinematically.

### 11.5 Can model *development* continue at YELLOW?

**Yes.** `15` D paused *adding physics occupants*, not
thinking. `24` resumed design. Continuing T1 design at
YELLOW is honest. Treating YELLOW as an automatic
streamfunction branch is what `21` Candidate 6 warned
against.

This checkpoint is **not** a continuity-solver
authorization.

---

## 12. Inspector / diagnostics

Current Inspector (`19`, `TracerInspection`):

```text
Level 1  motion: position, time, age, V_total, speed
Level 2  why this velocity: V_i of the seven operands
Level 3  not implemented; reserved for env / column diagnostics
```

L2 sum invariant: `Σ V_i = V_total`. That semantics must
not absorb tilting.

### 12.1 Natural future quantities

| Quantity | Belongs | Does not belong |
| --- | --- | --- |
| env wind at tracer `y` | L3 / hodograph | not a new L2 row |
| finite-layer shear / `ω_h` | L3 / hodograph (already) | not L2 |
| streamwise / crosswise `ω_h` | L3 / hodograph (already) | not “why V_total” |
| SRH | column, not a tracer-card scalar (`19` §14) | not L2 |
| diagnostic curl of `V_rotation` or `V_total` | new diagnostic section; T1-curl | not labeled `ω_z` of tilting |
| tilting tendency | new section: rotational diagnostics | not an 8th contribution |
| stretching tendency | same, with named `ω_z` source | not a modifier of `rotation` row |
| generated rotational `V` | only if a model operand exists | would then be a real L2 row *of that model* |

### 12.2 Two questions

```text
why current velocity?
  L2 — operands of V_total
  unchanged by T1

what rotational dynamics are diagnosed / evolving?
  new observation family
  must not reuse contribution-row UI as if tilting were V_8
```

**STILL-BINDING:** prescribed rotation velocity ≠ `ω_z`
(`19` Forbidden). T1-curl may show the curl *of that
velocity* only if the label keeps the distinction.

This checkpoint does not start Inspector L3.

---

## 13. Guided

No new experiment in this task. Consequences only.

Current three (`17`, `src/guided/GuidedExperiment.ts`):

```text
inflow-to-upper-outflow
downdraft-path-to-ground
near-ground-outflow
```

All run on the **same** seven-operand
`StormRelativeLaboratory`. Isolation is seed + copy, not a
different `V`. `doesNotMean` already forbids capture, cold
pool, same-air circulation.

### 13.1 Would a richer rotation model falsify them?

Not if they remain mechanism-specific exhibits of
*prescribed* pathlines and copy stays in that register.
They would become false if copy were upgraded to “this is
how the mesocyclone forms” while `V` is still (or is
newly) a painted or parameterized spin.

T1 overlays on these three are optional later. They must
not rewrite `demonstrates`.

### 13.2 Later shear → tilting → rotation experiment

**RECOMMENDATION:** yes, as a *future* catalog candidate,
only after T1 (and any later coupling) has a teaching
claim that is true. It must not concatenate S1/D1/NG1
(`17` isolation). It is not authorized now.

### 13.3 Can the current three remain mechanism exhibits?

**Yes.** That is the cheaper honesty path. Do not turn
Guided v1 into a vorticity course by retcon.

---

## 14. Visualization

Invariant, still desired and currently true (`22`):

```text
visualization observes model
visualization does not become model owner
VisualAirflowPopulation samples caller-supplied V_total
same Euler instance as scientific integration in Explore
```

| Candidate | `V_total` observation | Time / Pause | Tint | Internals leak |
| --- | --- | --- | --- | --- |
| T1 | unchanged; comets stay valid | freeze still same Eulerian `V` | operand `|V_i|` tint must **not** be reused for tendency magnitude; different quantity | no, if diagnostics stay on observation ports |
| T2 without bridge | unchanged occupants | Pause more interesting only if overlays use `ω(t)` | same | risk if visual runtime stores `ω` |
| T3/T4 | occupants would follow new `V` | frozen `V(t_pause)` becomes a true frozen atmosphere if `V` is unsteady | generated operand could tint like other `V_i` *if* it is a real operand | high if shaders encode the closure |

`24`: comets provisional; tint diagnostic; Background
REJECTED. T1 does not reopen encoding. A tendency overlay
would be a new diagnostic layer, closer to R2/hodograph
than to living-air comets.

---

## 15. Dataset evolution

CONCEPT / `ARCHITECTURE.md` §12: later `DatasetVelocityField`
implements the same `sample(position, time)`. Visualization
and tracers should not care.

```text
generic observable
  V, ∇ × V, ω_h of environment, tilting product if w and ω_h exist
  Inspector ports should be defined at this level when possible

synthetic interaction model
  prognostic ω on prescribed V, parameterized V_rot(ω_env, ∇w)
  DEMO-only unless later rewritten

future dataset / model source
  owns V(x,t); diagnostics observe it
  does not run our synthetic ω ODE
```

T1 observation, if written as “given `ω_h` and `∇w`, here
is the product,” ports to datasets.

T2 synthetic evolution and T4 inversion **lock DEMO
assumptions** if they become the way rotation exists in
the app. That is acceptable only as a laboratory branch
behind a model-source boundary, not as the meaning of
`VelocityField`.

**RECOMMENDATION:** next SoT must state this boundary in
one section. It must not design `DatasetVelocityField`.

---

## 16. Candidate matrix

Classification adjusted from the task’s T0–T4 after
repository evidence. T1 is split because diagnostic curl
≠ tilting tendency (`15` §9.3).

| | T0 existing env diagnostics | T1-curl bookkeeping | T1-tendency (tilting ± stretching rates) | T2 prognostic `ω_z` | T3 parameterized `V` response | T4 inversion / complete `ω→V` |
| --- | --- | --- | --- | --- | --- | --- |
| Physical meaning | layer `ω_h`, SRH | curl of prescribed `V` | kinematic source terms | teaching ODE | closure | dynamics-class reconstruction |
| Causal value | env only | none as process | shows *where* tilting would act | process in `ω`, not in `V` | apparent process in tracers | strongest synthetic causality |
| Honesty | high (already) | high if not called tilting | high if V unchanged and `Ω` unexplained | medium | low unless named parameterized | high only with BCs + continuity stance |
| Architecture fit | already in hodograph | new diagnostic SoT | fits observers | new state owner | new model class; not 8th operand | new model class + continuity |
| State complexity | none | none | none | high | medium–high | high |
| Coupling complexity | none | none | none | optional | required | required |
| Continuity risk | none | interpretative | interpretative; stretching worse | stretching/advection | new `div` | central |
| Inspector value | L3 candidate | clarifies `Ω ≠ ω` | high, separate section | high if not mixed into L2 | L2 row only if real operand | same |
| Guided value | optional context | optional | later exhibit possible | would pressure copy | would pressure copy | would pressure copy |
| Visualization value | overlays | overlays | overlays | time-varying overlay | occupants change | occupants change |
| Dataset compatibility | native | native (`∇ × V`) | portable formula | poor | poor | poor / different problem |
| Implementation cost | L3 product slice | medium | medium | high | high | very high |
| Reversibility | high | high | high | low | very low | very low |
| Learning value now | low incremental | medium | **high** | premature | premature | premature |
| Premature-complexity risk | low | low | low if parked coupling | high | very high | very high |
| Rank for *next design target* | already exists; L3 is product not this modeling SoT | supporting sibling in the next SoT | **selected next** | parked | parked | parked |

T0 is not a new modeling direction. Shipping Inspector L3
of existing hodograph quantities is a *product* candidate
(`21` Candidate 4). It is useful and cheap. It does not
answer the causal-rotation question. This checkpoint does
not order it ahead of the T1 design SoT, and does not
forbid a later product slice from doing L3 first. It is
**not a physics prerequisite** for T1.

---

## 17. Main verdict

### 17.1 A. Is tilting / stretching still the best next modeling direction?

**CONDITIONAL.**

**YES** as the modeling *question*: the additive prescribed
laboratory is exhausted (`15` §7 / §14). The missing causal
story toward CONCEPT’s vorticity-as-process is still
shear → tilting → vertical vorticity → (maybe) rotation,
not another occupant, not camera, not a continuity solver
by default, not a dataset jump that skips the synthetic
question.

**NO** as “next we design / implement derived rotation,
prognostic `ω`, or `V_rot(ω)`.” That would fail honesty,
double-counting, and architecture-fit tests against the
CURRENT tree (Inspector L2, Guided copy, visual occupants,
stateless `VelocityField`, YELLOW continuity, dataset
boundary).

**NO** as treating `15` §9 as an implementation plan.

### 17.2 B. Next earned capability (design target, not a slice)

```text
T1 diagnostic tilting / stretching architecture
  — local tilting tendency from env ω_h and prescribed ∇_h w
  — optional T1-curl sibling to keep bookkeeping distinct
  — stretching only with a named ω_z source and anti-claims;
    default lean: specify stretching as later than tilting
    tendency, not as an automatic second formula
  — V_total unchanged
  — prescribed Ω remains the rotation operand
  — no compositor eighth operand
  — no prognostic ω
  — no ω→V bridge
```

This is **not** Y12. Completing that SoT would not mark the first
interaction mechanism done.

### 17.3 C. Prerequisites?

| Candidate prerequisite | Required before T1 *design*? | Why |
| --- | --- | --- |
| Continuity solver / streamfunction | **No** | T1 does not change `div`. Inversion is a different class (`§11`, `§10`) |
| RK2 as production integrator | **No** | Tracer numerics ≠ vorticity physics. Euler spiral remains Y11, not a tilting gate |
| Camera pan / Follow | **No** | Product, not model (`21`) |
| More visualization encoding | **No** | `24` closed the current loop; bottleneck is model class |
| Dataset adapter | **No** | Would skip the synthetic causal question; T1 should stay portable *to* datasets, not wait on them |
| Inspector L3 of existing `ω_h` | **No** as physics gate | Useful product sibling; not required to write the T1 SoT |
| Zeroing live `Ω` | **No** | Option 1 (`§8`) is the honest T1 pairing |

Do not invent a prerequisite that is really a fear of
opening the SoT.

### 17.4 D. Dedicated Tilting / Stretching Architecture SoT?

**Yes.** Exact scope of the *next* document, not written
here:

```text
IN SCOPE
  name T1-tendency (and T1-curl sibling) as the first
    earned capability class
  lock non-coupling: V_total and prescribed Ω unchanged
  define observation ownership (not CompositeVelocityField,
    not Simulation-as-atmosphere, not visual runtime)
  map coordinates for ω_h · ∇_h w in world vs atmospheric
    components
  state updraft-gradient input: analytic formula vs sample;
    lid non-differentiability policy (reuse physics 15 §9)
  distinguish tilting tendency vs curl(V) vs ω of Ω
  stretching: named ω_z source, or explicit deferral
  Inspector: separate from L2 contribution rows
  Guided: current three remain prescribed exhibits;
    no new experiment in that SoT’s implementation plan
  visualization: observe-only; no tendency-as-operand-tint
  dataset boundary: generic observable vs synthetic model
  continuity: YELLOW remains; anti-claims
  explicitly park T2, T3, T4, Y12 interaction, inversion
  prescribed-Ω options 2–4 remain OPEN, not chosen

OUT OF SCOPE
  production code
  implementation slices
  eighth operand
  ScenarioConfig physics parameters
  prognostic state
  RK2 cutover
  continuity solver
  vorticity inversion
  new Guided experiment
  Inspector UI
  camera / Follow
  dataset implementation
  ROADMAP.md
  pretending 15 §9 is the design
```

Filename is not locked here. Do not revive
`docs/physics/06-tilting.md`.

---

## 18. Discrepancies (historical vs production)

Recorded so later work does not “fix” them silently.

| Item | Historical text | Current production |
| --- | --- | --- |
| Operand count in `02` | five; `RotationField` | seven; `VerticalEnvelopeRotationField` |
| `10` measured stack | five chimney operands | seven live; audit not retuned |
| `ARCHITECTURE.md` §30 | `06-tilting.md`, `07-stretching.md` | live `06`/`07` are other physics docs |
| `20` §15 body | “Physics remains paused. When modeling resumes: …” | pause lifted for design in `24`; this file ranks T1 |
| `16` compact lock-in | “next modeling slice: still paused” | historical; current modeling status is `24` then this file |
| `19` compact lock-in | “modeling status: paused; next: tilting/stretching SoT” | historical snapshot of `19`; next SoT is now scoped as T1, not Y12 |
| physics `15` | `∂Vy/∂y` locked; no `∂Vy/∂x,z` section | formula implies horizontal gradients; no API |

Historical reasoning in those documents is not rewritten.

---

## 19. What this checkpoint does not start

```text
production src changes
new VelocityField / eighth operand
ScenarioConfig physics parameter
prognostic ω or any field state
RK2 production cutover
continuity solver / streamfunction
vorticity inversion
Guided experiment
Inspector L3 UI
visualization feature / comet lock-in
camera pan / Follow
dataset adapter
implementation slices for T1
the dedicated T1 architecture SoT itself
Y12
thermo / cold pool
D3 translating storm
```

---

## 20. Compact lock-in

```text
field class:                 prescribed seven-operand
                             kinematic laboratory
                             V_total = Σ V_i
                             DEMO Eulerian-steady

rotation:                    prescribed velocity
                             VerticalEnvelopeRotationField
                             not ω_z, not tilting

ω_h:                         actual layer diagnostic API
                             not 3D storm curl

updraft gradients:           ∂Vy/∂y documented
                             ∇_h Vy algebraic, not an API
                             no derivative() on VelocityField

prognostic physics state:    none besides tracers + clock

continuity:                  still YELLOW (`10`)
                             not a T1 gate
                             not a solver authorization

Inspector L2:                why V_total (operands)
                             not rotational dynamics

Guided v1:                   three prescribed exhibits
                             keep isolation / anti-claims

visualization:               observes canonical V_total
                             comets still provisional (`24`)

15 §9 sketch:                ingredients / compositor
                             boundary / vortex-couple
                             STILL HOLD
                             interaction-SoT-as-next
                             NEEDS REVISION → T1 first

Y12:                         still the interaction milestone
                             not the next design target

direction:                   CONDITIONAL
                             question = tilting/stretching
                             next capability = T1 diagnostics
                             V unchanged, Ω unchanged
                             T2/T3/T4 parked

bridge ω_z → V:              none now
                             not automatic tangential field

dedicated architecture SoT:  docs/architecture/26
                             written; implementation NOT STARTED

T1 physics derivation:       docs/physics/22-diagnostic-tilting-tendency.md
                             verdict YES as a kinematic diagnostic
                             V unchanged, Ω unchanged

physics implementation:      NOT STARTED
```

---

## 21. STOP

```text
TILTING / STRETCHING DIRECTION
  REVALIDATED
  CONDITIONAL YES AS MODELING QUESTION
  NEXT DESIGN TARGET = T1 DIAGNOSTIC TENDENCY ARCHITECTURE
  NOT Y12
  NOT DERIVED ROTATION
  NOT AN EIGHTH OPERAND

PRESCRIBED Ω
  REMAINS THE ROTATION OPERAND FOR T1
  OPTIONS 2–4 OPEN, NOT CHOSEN

VORTICITY → VELOCITY
  NO BRIDGE NOW

CONTINUITY
  STILL YELLOW
  NOT A PREREQUISITE FOR T1 DESIGN
  NOT A SOLVER BRANCH

PHYSICS IMPLEMENTATION
  NOT STARTED

T1 PHYSICS DERIVATION
  docs/physics/22-diagnostic-tilting-tendency.md
  YES as kinematic diagnostic

T1 ARCHITECTURE SoT
  docs/architecture/26-diagnostic-tilting-tendency-architecture.md
  WRITTEN
  IMPLEMENTATION NOT STARTED
```

Tilting implementation is out of scope for this SoT.
Do not treat `22` as the architecture SoT; that successor is `26`.
T1 implementation is out of scope for this SoT.
Do not port `15` §9 into production.
Do not relabel `Ω` as tilting.
Do not “save” derived rotation if T2–T4 are later
reopened: those remain parked until a future
checkpoint changes this ranking.
