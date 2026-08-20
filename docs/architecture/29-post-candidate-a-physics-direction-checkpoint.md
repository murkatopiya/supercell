# Post-Candidate-A Physics Direction Checkpoint

**Status:** DECISION CHECKPOINT / POST-CANDIDATE-A /
NO IMPLEMENTATION AUTHORIZATION
**Scope:** determine which physics/modeling question is
actually earned after validated headless Candidate A.
Not an implementation design. Not a VelocityField.
Not stretching-by-default. Not T2. Not `ω → V`.
**Physics:** T1 and Candidate A remain CLOSED as headless
diagnostics. This file does not reopen physics `22` or `23`.
**Implementation:** none. Docs-only. Production `src/**`
MUST remain unchanged. This checkpoint does **not**
authorize stretching, T2, prognostic `ω`, `ω → V`,
`Ω` changes, `V_total` changes, continuity solver,
thermo, Inspector, or visualization work.

Predecessor post-T1 direction (not replaced):

```text
docs/architecture/27-post-t1-physics-direction-checkpoint.md
```

`27` selected Candidate A as the next L1 question after
T1. This file answers what is earned *after* that question
was implemented and scientifically validated. Completing
Candidate A does **not** make stretching, T2, or `ω → V`
automatic.

Candidate A physics (CLOSED as derivation):

```text
docs/physics/23-diagnostic-vertical-vorticity.md
```

Candidate A architecture (CLOSED as headless capability):

```text
docs/architecture/28-diagnostic-vertical-vorticity-architecture.md
```

Candidate A DEMO scientific validation:

```text
docs/research/2026-08-20-candidate-a-demo-field-validation.md
```

Validation commit:

```text
61b22f050fdc9a625d0b5ce1680c51a4cd8cb0ad
```

T1 physics / architecture (remain CLOSED):

```text
docs/physics/22-diagnostic-tilting-tendency.md
docs/architecture/26-diagnostic-tilting-tendency-architecture.md
```

T1 DEMO scientific validation:

```text
docs/research/2026-08-20-t1-demo-field-validation.md
```

Predecessor pre-T1 ranking (historical; not replaced):

```text
docs/architecture/25-tilting-stretching-direction-revalidation.md
```

Continuity residual (still YELLOW; not a solver branch):

```text
docs/architecture/10-composite-continuity-mass-budget-audit.md
```

Keep these roles distinct:

```text
CURRENT FACT
STILL-BINDING CONTRACT
OPEN QUESTION
RECOMMENDATION
NEW PROJECT DECISION
ANTI-CLAIM
```

Successor model-class decision (not this checkpoint):

```text
docs/architecture/30-model-class-decision.md
```

`30` answers whether the project remains a prescribed
kinematic laboratory or migrates toward prognostic
dynamics. This file remains the post-Candidate-A
*physics-direction* checkpoint. Completing `29` does
**not** start stretching, T2, or `ω → V`. Completing
`30` does **not** start them either unless `30` itself
authorizes implementation.

This document did **not** change production code.
It does **not** create `ROADMAP.md`.
It does **not** start a selected branch.

---

## 1. Current locked state

Verified against live composition and the closed SoT listed
above. Repository wins over textbook order.

```text
T1  DiagnosticTiltingTendency
    T_tilt,y(P,t)                     [s⁻²]
    CLOSED / VALIDATED HEADLESS
    local vertical-vorticity tilting tendency
    of env ω_h and prescribed updraft ∇_h Vy
    independent of Ω
    UI NOT STARTED

Candidate A  DiagnosticVerticalVorticity
    ω_y,current(P,t)                  [s⁻¹]
    CLOSED / VALIDATED HEADLESS / DEMO
    world-vertical curl of current prescribed V_total
    CURRENT STACK IDENTITY:
      ω_y(V_total) = ω_y(V_rotation)
      stack-specific, not a law
    UI NOT STARTED

V_total                 seven prescribed operands
                        UNCHANGED

prescribed Ω            STILL ACTIVE in V_rotation
                        UNCHANGED
                        DEMO Ω = 0.005 s⁻¹ > 0

prognostic ω            ABSENT
stretching diagnostic   NOT INTRODUCED
T2                      PARKED
ω → V                   NO BRIDGE
continuity              YELLOW (`10`)
thermodynamics          ABSENT
Simulation              tracer stepper; Euler; DEMO dt = 0.1 s
                        no atmospheric field state
```

What the laboratory now knows, separately:

```text
where a vertical-vorticity tilting tendency would be
produced
    T1: signed vortex couple, offset along env ω_h
    DEMO |T|_max ∼ 10⁻⁵ s⁻²

where vertical vorticity already exists in V_total
    Candidate A: on-axis shielded vortex of prescribed Ω
    DEMO axis peak 2Ω = 0.010 s⁻¹ at rotation y_mid
    zero ring at r = σ√2
    opposite-sign outer annulus
```

What it still does **not** have:

```text
a causal evolution bridge
T_tilt,y  →  ω_y(t)  →  V
```

The risk this checkpoint exists to prevent:

```text
not:  stretching is next because Candidate A named ω_y
not:  stretching of prescribed Ω is supercell intensification
not:  T2 is next because two diagnostics exist
not:  initialize ω_y,state from Candidate A and keep Ω
not:  treat ω_y as a local recipe for V_θ
not:  walk the textbook vorticity equation in code order
```

The question is not “what formula comes next.”

The question is which next step is scientifically useful in
*this* laboratory, now that generation *tendency* and
current *existence* are both inspectable and known to be
different spatial objects.

---

## 2. Governing equation

### 2.1 Identity used

**Kind:** STANDARD METEOROLOGICAL THEORY, already written
for this project in physics `22` §7. Not reopened. Restricted
below to world-vertical vorticity and to *this* laboratory.

For `ω = ∇ × V` and acceleration `a` not already included
in advection (pressure/density, viscosity, other body
forces in the momentum equation):

```text
Dω / Dt  =  (ω · ∇) V  −  ω (∇ · V)  +  ∇ × a
```

with the material derivative

```text
D/Dt  =  ∂/∂t  +  V · ∇
```

This is a vector-calculus identity plus whatever physics is
put in `a`. It is **not** yet a closed atmospheric model.

The incompressible inviscid reduction

```text
∇ · V = 0
a     = −∇(p/ρ)     (or equivalent; curl vanishes if ρ const)
Dω / Dt = (ω · ∇) V
```

is **STANDARD THEORY**. It is **not** an exact governing
equation of the current laboratory. Continuity is YELLOW
(`10`). Isolated updraft has `∇ · V_up = ∂Vy/∂y ≠ 0`
(physics `15` §11). Composite `div_h` of inflow/outflow is
independently prescribed. Density and pressure fields do
not exist, so `a` cannot be evaluated as a baroclinic or
viscous term.

**NEW PROJECT DECISION for this checkpoint:** do not
silently assume incompressibility. Write the dilatation
term. Name it. Park claims that require `∇ · V = 0`.

### 2.2 Why `∂ω/∂t` versus `Dω/Dt` matters

Eulerian local tendency:

```text
∂ω / ∂t  =  Dω / Dt  −  V · ∇ω
```

| Operator | Follows | Natural owner in this repo |
| --- | --- | --- |
| `∂ω_y/∂t` | a fixed world point `P` | Eulerian field / overlay |
| `Dω_y/Dt` | a material fluid element | a *parcel*, not a tracer by default |

CURRENT FACT (physics `01`): live tracers are **passive
markers of `V`**. They carry position, age, `tracerId`,
`active`. They do not own vorticity, density, or volume.
They are not automatically material vortex tubes.

Consequences that must stay explicit:

```text
LEGAL
  sample T1 or Candidate A at a tracer position
  “at this point, these Eulerian diagnostics have these values”

ILLEGAL without a later state model
  “this tracer owns ω_y”
  “this pathline is a vortex tube”
  “Dω_y/Dt along the tracer is the atmosphere evolving”
```

CURRENT DEMO `V` is Eulerian-steady. Candidate A is
numerically independent of laboratory `t` (research
2026-08-20). Therefore, as a CURRENT field property:

```text
∂ω_y,current / ∂t  =  0
```

The material derivative of that frozen curl is then only
advection of a frozen pattern:

```text
Dω_y,current / Dt  =  V · ∇ ω_y,current
```

Any isolated source term (tilting, stretching, dilatation)
computed from the prescribed fields is **not**
`∂ω_y,current/∂t`. The painted `V` is already in a forced
Eulerian steady state. Extra terms are balanced by whatever
fictitious `a` makes the prescribed `V` consistent with the
identity. They are not a prediction of how the vortex would
evolve if those terms were the only physics.

That is why a stretching *diagnostic* of Candidate A cannot
be read as intensification history.

### 2.3 World-vertical component

Project coordinates (`00`, `22` §5–§7): `+Y` is up.
Vertical vorticity is `ω_y`, not textbook `ω_z`, unless the
sentence is explicitly about a z-up triad.

Y-component of the identity:

```text
Dω_y / Dt
  =  ω_x ∂Vy/∂x + ω_y ∂Vy/∂y + ω_z ∂Vy/∂z
     − ω_y (∇ · V)
     + (∇ × a)_y
```

Eulerian form:

```text
∂ω_y / ∂t
  =  − V · ∇ ω_y
     + TILT_Y
     + STRETCH_Y
     + DILATATION_Y
     + (∇ × a)_y
```

Canonical split already locked by physics `22` §7.3, in
*this* triad:

```text
TILT_Y         =  ω_x ∂Vy/∂x + ω_z ∂Vy/∂z
STRETCH_Y      =  ω_y ∂Vy/∂y
DILATATION_Y   =  − ω_y (∇ · V)
ADVECTION_Y    =  − V · ∇ ω_y     (Eulerian budget)
BAROCLINIC_Y   =  (∇ × a_b)_y     schematic (1/ρ²)(∇ρ × ∇p)_y
VISCOUS_Y      =  (∇ × a_ν)_y
```

Handedness does not add extra minus signs to
`(ω · ∇) V`. The unusual axis names change *which*
component is vertical.

Do **not** read textbook `ω_y ∂w/∂y` as stretching here.
In z-up, that `y` is north (tilting). Here `y` is up, so
`ω_y ∂Vy/∂y` is stretching (`22` §7.3).

### 2.4 Terms that matter to the simplified model

| Term | In the identity? | Current laboratory |
| --- | --- | --- |
| advection `−V · ∇ω_y` | yes | no `ω` field to advect as state; Candidate A is a snapshot of frozen curl |
| tilting `TILT_Y` | yes | T1 evaluates a **restricted** product: env `ω_h` × updraft `∇_h Vy`, not full `ω_h(V_total)` |
| stretching `ω_y ∂Vy/∂y` | yes | `ω_y` now named (Candidate A); `∂Vy/∂y` documented on the updraft; no production method |
| dilatation `−ω_y ∇·V` | yes | YELLOW `∇·V`; must not be dropped |
| baroclinic | yes in `a` | no `ρ`, no `p` |
| viscous / diffusive | yes in `a` | no viscosity |
| planetary / Coriolis | often added in atmospheric forms | not in the model |
| stretching–tilting of *horizontal* `ω` | other components | out of vertical-only scope |

T1 is **not** `Dω_y/Dt`. Candidate A is **not** a term in
the equation. Candidate A is a diagnostic of existing `V`.

---

## 3. Map of current project quantities

Status vocabulary:

```text
IMPLEMENTED
DERIVABLE FROM CURRENT FIELDS
PRESCRIBED BUT NOT CAUSALLY GENERATED
MISSING
INTENTIONALLY OMITTED
PHYSICALLY UNSUPPORTED BY CURRENT MODEL
```

A diagnostic of an existing field is not prognostic state.

### 3.1 Left-hand sides

| Quantity | Status | Notes |
| --- | --- | --- |
| `∂ω_y/∂t` as Eulerian state tendency | **MISSING** | no `ω_y` field state; DEMO `V` steady ⇒ Candidate A has `∂ω_y/∂t = 0` as bookkeeping |
| `Dω_y/Dt` as material evolution | **MISSING** | tracers do not own `ω`; no parcel vorticity |
| prognostic `ω_y,state` | **MISSING** | `27` Candidate C; still parked |

### 3.2 Right-hand side / related objects

| Quantity | Status | Where it sits in the equation |
| --- | --- | --- |
| `DiagnosticTiltingTendency` `T_tilt,y` | **IMPLEMENTED** | a *named restriction* of `TILT_Y`: env `ω_h` only, updraft `∇_h Vy` only. Not full `(ω · ∇)V` of `V_total` |
| `DiagnosticVerticalVorticity` `ω_y,current` | **IMPLEMENTED** | **not a term**. It is the current value of `ω_y = (∇ × V_total)_y`. May later *enter* `STRETCH_Y` or `DILATATION_Y` as an operand |
| `VerticalEnvelopeRotationField` | **PRESCRIBED BUT NOT CAUSALLY GENERATED** | supplies `V_rotation` and, on the CURRENT stack, all of `ω_y,current`. Not T1’s integral |
| `VerticalEnvelopeUpdraftField` | **PRESCRIBED BUT NOT CAUSALLY GENERATED** | supplies `Vy` for T1’s `∇_h Vy`; documented `∂Vy/∂y` would be the strain in `STRETCH_Y` if a named `Vy` is chosen |
| environmental `ω_h` | **IMPLEMENTED** as layer diagnostic (`06`) | T1 maps it to world `(ω_x, ω_z)` at sample height. Not Candidate A. Not 3D `ω(V_total)` |
| `V_total` | **PRESCRIBED BUT NOT CAUSALLY GENERATED** | seven-operand sum; advecting velocity if a later `ω` were evolved; not solved from `ω` |
| `∂Vy/∂y` of the isolated updraft | **DERIVABLE FROM CURRENT FIELDS** | physics `15` §9 analytic formula. No production method (unlike T1’s `horizontalGradientOfVerticalVelocity`) |
| `∇ · V_total` | **DERIVABLE FROM CURRENT FIELDS** | per-operand identities in `10` / physics `15`–`21`. No production `divergence()` API. YELLOW residual |
| `−ω_y (∇ · V)` dilatation | **DERIVABLE** if `ω_y` and `∇·V` are named | not implemented; incompressible drop is **unsupported** |
| baroclinic `(∇ρ × ∇p)/ρ²` | **PHYSICALLY UNSUPPORTED BY CURRENT MODEL** | no `ρ`, no `p`. Downdraft / NG outflow are prescribed `V`, not cold-pool sources (`22` §18, `27` §10) |
| viscous / turbulent diffusion of `ω` | **INTENTIONALLY OMITTED** | no viscosity; any damper would be an invention |
| planetary vorticity / Coriolis | **INTENTIONALLY OMITTED** | not in the laboratory |
| `ω → V` inversion | **MISSING** | not a term of the vorticity equation; a separate reconstruction problem (§8) |
| full `ω = ∇ × V_total` | **INTENTIONALLY OMITTED** for Candidate A | env `ω_h`, updraft/downdraft `ω_h`, rotation lid `G'` mix. Vertical-only remains the locked Candidate A scope |

### 3.3 CURRENT STACK IDENTITY, restated for the equation

On the live seven-operand DEMO stack (physics `23` §16;
research 2026-08-20):

```text
ω_y(V_total) = ω_y(V_rotation) = ω_y,current
```

That identity tells the equation **which** `ω_y` currently
exists. It does **not** say T1 generated it. It does **not**
survive as a universal law if another operand gains
azimuthal flow.

### 3.4 Compact placement sketch

```text
prescribed V_total
        │
        ├── curl_y ──► ω_y,current          Candidate A
        │                 │
        │                 ├── would enter STRETCH_Y if multiplied
        │                 │   by a named ∂Vy/∂y
        │                 └── would enter DILATATION_Y if
        │                     multiplied by −∇·V
        │
        ├── V_updraft ──► ∇_h Vy ──► T_tilt,y     T1
        │         ▲                    (restricted TILT_Y)
        │         │
        └── env profile ──► ω_h ───────┘

NO arrow:  T_tilt,y  →  ω_y,current
NO arrow:  ω_y,current  →  V_total
NO state:  ω_y,state(t)
```

---

## 4. Stretching analysis

Do **not** implement.

### 4.1 Candidate expression

Under current coordinates, the vertical-vorticity stretching
term isolated from `(ω · ∇) V` is

```text
T_stretch,y  :=  ω_y  ∂Vy/∂y
units s⁻²
```

That product is mathematically well-defined once **both**
factors are named.

After Candidate A, the only honest current `ω_y` operand is

```text
ω_y,current(P,t)     Candidate A / physics 23
```

`∂Vy/∂y` is **not** unique until the `Vy` is named:

```text
∂Vy_updraft / ∂y     documented (15 §9)
∂Vy_downdraft / ∂y   analogous envelope (20)
∂Vy_total / ∂y       sum of those two (other operands have Vy ≡ 0)
```

Default analog of T1 (updraft-only mechanism) would be

```text
T_stretch,y  =  ω_y,current  *  ∂Vy_updraft/∂y
```

Interior updraft formula (`15` §9), `ξ = (y − y_b)/H`:

```text
inside (y_b, y_t):  ∂Vy/∂y = W0 E_r(r) (π/H) cos(π ξ)
lids / exterior:    treat as 0 (C⁰ lids; same closed-interval
                    spirit as Candidate A / T1 gradients)
```

DEMO illustration (not a retune, not a live sampler):

```text
W0 = 30 m s⁻¹
H_up = 8000 m
on axis, |∂Vy/∂y|_max → W0 π / H ≈ 1.18 × 10⁻² s⁻¹
```

### 4.2 Compressibility qualification

Isolated stretching is **not** the net strain+dilatation
budget of `ω_y`.

For a **purely vertical** vorticity `ω = (0, ω_y, 0)`:

```text
STRETCH_Y + DILATATION_Y
  =  ω_y ∂Vy/∂y  −  ω_y (∇ · V)
  =  ω_y ∂Vy/∂y  −  ω_y (∂Vy/∂y + div_h)
  =  − ω_y div_h
```

where `div_h = ∂Vx/∂x + ∂Vz/∂z`.

In an **incompressible** flow, `∇ · V = 0` so
`∂Vy/∂y = −div_h`, and the two languages agree:

```text
T_stretch,y  =  ω_y ∂Vy/∂y  =  −ω_y div_h
```

That substitution is **false** in this laboratory.
Inflow/outflow `div_h` and updraft `∂Vy/∂y` are independent
knobs (`10`, physics `15` §11.3). Isolated rotation is
divergence-free (physics `18`); the seven-operand sum is not.

Therefore:

```text
LEGAL later, as named bookkeeping
  T_stretch,y = ω_y,current * ∂Vy_updraft/∂y
  “vertical strain of CURRENT PRESCRIBED ω_y by named ∂Vy/∂y”

LEGAL later, as a different named bookkeeping
  T_dil,y = −ω_y,current * (∇ · V_named)
  or, for purely vertical ω, net −ω_y div_h of named radial fields

ILLEGAL
  stretching = −ω_y div_h
      as if the incompressible identity held
  vortex-tube conservation
  mass-consistent intensification
  “the updraft stretches the mesocyclone T1 created”
```

YELLOW is not a blocker for writing the product. It is a
blocker for vortex-tube copy, and it is a **scientific
reason** that stretching-of-`∂Vy/∂y` and
convergence-of-`div_h` would be *different DEMO fields*.

### 4.3 Can current fields evaluate a meaningful stretching tendency?

**YES, mathematically**, as L1 bookkeeping:

```text
ω_y,current           IMPLEMENTED (analytic)
∂Vy_updraft/∂y        DERIVABLE (analytic; no method yet)
product               well-defined signed scalar [s⁻²]
```

**NO, as supercell process.** The `ω_y` would be prescribed
`Ω`, not tilted environmental vorticity. `25` §7.6 and
`27` §5.8 / §6 already forbade calling that supercell
stretching. Candidate A did not repeal that. It only named
the operand so the forbidden sentence is harder to utter
accidentally.

### 4.4 Diagnostic-only if the operand is prescribed `ω_y,current`?

**YES.**

```text
T_stretch,y(P,t) = ω_y,current(P,t) * ∂Vy/∂y(P,t)
```

is a snapshot rate. DEMO both factors are Eulerian-steady,
so the rate is Eulerian-steady. It does not accumulate.
It does not change `V`. It does not change `Ω`.

A rate without state is not amplification history
(`25` §7.3, `22` §15.2). That remains true after Candidate A.

### 4.5 Circularity if later read as generated rotation?

**YES, high.**

If copy or a later T2 says “stretching intensified the
rotation,” while `V_rotation(Ω)` still moves tracers, the
diagnostic is being asked to explain a knob it does not
control. If an `ω → V` bridge is later added *and*
prescribed `Ω` is kept, stretching of Candidate A plus
generated `V` from evolved `ω` double-counts the same
chimney (`27` §12 Ω4).

Using Candidate A as the stretching operand does **not**
create a numerical circularity today (`V` does not depend
on the diagnostic). It creates a **semantic** circularity
as soon as the product is narrated as cause of the spin
that is already painted.

### 4.6 Vertical envelope semantic problems

CURRENT DEMO windows (fixture, not API coupling):

```text
updraft    [0, 8000] m     y_mid_up = 4000 m
rotation   [0, 6500] m     y_mid_rot = 3250 m
```

Research 2026-08-20 already recorded: at `y = 8000 m` the
updraft is still on and Candidate A is already **exact 0**.
Stretching of `ω_y,current` is therefore **identically zero**
wherever `G_rot = 0`, including the upper 1500 m of the
DEMO updraft.

Further mismatches from the locked formulas:

```text
rotation axis, y_mid_rot = 3250 m
  ω_y = 2Ω = 0.010 s⁻¹          (Candidate A peak)
  ∂Vy_up/∂y ≠ 0                 (not the updraft mid)
  T_stretch,y ~ 3 × 10⁻⁵ s⁻²    (illustration)

updraft axis, y_mid_up = 4000 m
  ∂Vy_up/∂y = 0
  ω_y = 2Ω G(4000) ≈ 9.35 × 10⁻³ s⁻¹
  T_stretch,y = 0

rotation lids y = 0 and y = 6500
  ω_y = 0  ⇒  T_stretch,y = 0
  even though updraft strain is largest near the lower
  interior of [0, 8000]
```

So the height of **maximum prescribed vertical vorticity**
is not the height of **maximum updraft strain**, and the
height of **zero updraft strain** still carries almost the
full Candidate A core. That is a property of two independent
envelopes, not a supercell vertical mode.

### 4.7 Axis, core, zero ring, outer annulus

Using `ω_y,current` from research 2026-08-20 and
`∂Vy_up/∂y` from physics `15`. Sign of `Ω > 0` DEMO:
central `ω_y > 0`, outer ring `ω_y < 0`. Isolated updraft:
`∂Vy/∂y > 0` in the lower half, `= 0` at `y_mid_up`,
`< 0` in the upper half.

| Location | `ω_y,current` | `∂Vy_up/∂y` (axis / same r) | `T_stretch,y` |
| --- | --- | --- | --- |
| axis, interior, lower updraft | `+` | `+` | **positive** (would intensify the painted core, as a rate) |
| axis, `y_mid_up` | `+` (if inside rotation window) | `0` | **0** |
| axis, upper updraft, still in rotation window | `+` | `−` | **negative** (would weaken the painted core) |
| `r = σ√2`, `G ≠ 0` | **0** | whatever | **0** |
| outer annulus `r > σ√2`, lower updraft | `−` | `+` | **negative** (would intensify the *negative* ring) |
| outer annulus, upper updraft | `−` | `−` | **positive** |
| far field | `→ 0` | `→ 0` (Gaussian `E_r`) | `→ 0` |
| T1 couple `r ≈ 0.95σ` (still positive core) | `+` | reduced by `E_r` | same-sign as local core strain, **not** T1’s dipole |

The zero ring of Candidate A is a stretching **null**. The
outer opposite-sign ring is not optional pedagogy: stretching
it with `∂Vy/∂y > 0` is a signed source for the shield, not
for a cyclonic mesocyclone. T1’s couple is a different
spatial object (research 2026-08-20 §9) and would **not**
be the pattern stretched by this diagnostic.

Expected DEMO magnitude family (illustration, not
validation):

```text
|T_stretch,y|  ∼  |ω_y| |∂Vy/∂y|
               ∼  (10⁻²) (10⁻² … 10⁻³)
               ∼  10⁻⁵ … 10⁻⁴ s⁻²
```

Same unit family as T1 (`∼ 10⁻⁵ s⁻²`). **Do not** compare
them as identical quantities. They are different operators
on different fields.

### 4.8 Stretching conclusion

```text
mathematically evaluable:     YES
scientifically honest as:     L1 strain of prescribed Ω
scientifically honest as:     supercell stretching        NO
creates ∂ω/∂t:                NO (frozen V)
needs named dilatation:       YES, if sold as the vorticity
                              equation rather than as isolated
                              (ω · ∇)V
envelope semantics:           PROBLEM (windows disagree)
outer ring:                   MUST be shown if ever computed
false-causality risk:         HIGH
earned as next implementation: NO
```

`27` §6 parked stretching until a named `ω_y` existed **and**
a separate honesty lock. Candidate A supplied the name.
This section is the honesty lock. The lock does **not**
authorize implementation.

---

## 5. Tilting + stretching is not yet evolution

A prognostic scalar

```text
ω_y,state(P, t)
```

is a different object from both T1 and Candidate A.

### 5.1 Eulerian field evolution

Schematic, not an API:

```text
∂ω_y,state / ∂t
  = − V · ∇ ω_y,state
    + T_tilt,y          (or a wider TILT_Y)
    + ω_y,state * ∂Vy/∂y
    − ω_y,state (∇ · V)
    + …
```

Requirements that do not exist:

```text
spatial representation     grid / basis / particles-as-continuum
advection scheme           by which V? prescribed V_total is YELLOW
IC                         §6
boundary policy            lids, ground, far field
time integrator            new physics dt; relation to tracer 0.1 s
reset / replay             restore ω ICs, not only tracer seeds
owner                      not Simulation-as-today (tracer stepper)
                           not VelocityField.sample
                           not rendering
```

`25` §9.2 remains STILL-BINDING: do not hide an atmospheric
model inside `Simulation`.

Eulerian evolution of `ω_y,state` that does **not** feed
`V` is an evolved *display* field (`27` §7.2). Tracers
would still follow prescribed `Ω`. Characteristic T1
source `∼ 10⁻⁵ s⁻²` does not make a mesocyclone clock
(physics `22` §21). Dataset evolution would not run this
ODE (`25` §14, `27` §11).

### 5.2 Parcel-following / material evolution

Schematic along a pathline `X(t)`:

```text
d ω_y,parcel / dt  =  (Dω_y / Dt)(X(t), t)
```

That is legitimate **only** if `ω_y,parcel` is defined as
a scalar sampled / integrated along a material element,
and only with the full RHS (advection is then implicit).

It is **not** legitimate as:

```text
tracers are vortex tubes
ω_y is materially conserved
stretching conserves Γ of a tube in this YELLOW V
```

Vortex-tube / Kelvin / Helmholtz language assumes more
continuity and more “same fluid” than this laboratory
(`10`, physics `01`).

### 5.3 Could current tracer machinery carry parcel vorticity?

**Technically yes as a particle scalar. Physically no as
atmosphere.**

`Simulation` already stores per-tracer position and
bookkeeping. A later experiment *could* integrate a scalar
ODE on each tracer from sampled T1 / stretching. That would
mean:

```text
each marker carries a teaching number ω_y,parcel(t)
the number is not (∇ × V)_y at that point unless forced
the number does not move air
reset would need IC per seed
Guided switch would need IC policy
```

Physics `01`: tracers are not parcels with field properties
unless a model says so. Vorticity of a 3D field is
Eulerian. Sparse pathlines cannot reconstruct `ω(x)` or
vortex tubes.

**RECOMMENDATION:** do not use scientific tracers as the
home of prognostic vorticity. If T2 is ever opened, it
needs an Eulerian owner. Particle-carried `ω` would be a
named teaching ODE, not Candidate A, not T1, and not
supercell state.

### 5.4 Prognostic-state conclusion

```text
tilting + stretching products     ≠  evolution
Eulerian ω_y,state                =  new model class (state)
parcel ω on tracers               =  worse class mix
without ω → V                     =  display ODE tracers ignore
with ω → V                        =  irreversible laboratory change
earned as next implementation     NO
```

T2 without a prior conceptual `ω → V` / `Ω` decision
remains the expensive dead-end `27` already named.

---

## 6. Initial-condition problem

If prognostic `ω_y,state` is ever introduced, the first
physical claim is

```text
ω_y,state(t = 0)  =  ?
```

T1 cannot supply it: T1 is a rate [s⁻²], not a state [s⁻¹].
`T × Δt` is a fake spin-up.

### 6.1 Option A — zero

```text
ω_y,state(P, 0) = 0
```

**Meaning:** no vertical vorticity until tendencies create
it. T1’s couple would be the obvious first source. Stretching
would be zero until `ω_y,state` grew.

**Consequence:** tracers still follow prescribed `Ω`. The
overlay would grow a **couple** while the chimney already
spins as a **shielded monopole**. Two contradictory
rotation stories at once. Dataset-unfriendly. Reset must
zero a field that users will think is “the rotation.”

### 6.2 Option B — current Candidate A field

```text
ω_y,state(P, 0) = ω_y,current(P, 0)
                = ω_y^Ω
```

**Meaning:** start from the painted shielded vortex, then
let T1 / stretching / advection modify it.

**Consequence:** T2 evolves **prescribed `Ω`**, not “the
vortex T1 would generate.” The outer negative ring and
`G(y)` window become the IC. T1’s couple is a perturbation
on that monopole, not the origin of rotation.

**Double counting once `ω → V` exists:** acute.

```text
V already contains V_rotation(Ω)
ω_y,state initialized from curl(V_rotation)
later V_generated = Invert(ω_y,state)
⇒ the same chimney is in V twice unless Ω is removed
```

Initializing from Candidate A is therefore only honest if
a later closure **replaces** `Ω` (Ω5) or if `ω_y,state`
is forever display-only and copy says so. Display-only plus
Candidate A IC is “animate the paint.”

### 6.3 Option C — environmental / background

Environmental `ω_y` is **identically zero** on the locked
horizontally homogeneous profile (physics `23` §7).
“Background vertical vorticity from the sounding” is not
available.

Planetary vorticity is omitted. A constant `f` would be a
new physical claim, not a CURRENT FACT.

**Consequence:** C collapses to A for world-vertical `ω`,
unless a new background field is invented.

### 6.4 Option D — another explicit IC

Examples: T1-shaped snapshot, Gaussian cyclonic patch,
zero except in a column. Each is a **new prescribed
vortex**, just not called `Ω`. Honesty requires naming it
as such. It does not become “tilting physics.”

### 6.5 Initial-condition conclusion

```text
A zero           honest as “start empty”; fights live Ω
B Candidate A    honest as “evolve the paint”; double-counts
                 if Ω remains when V is reconstructed
C environment    not available for ω_y; would be invented f
D other          must be a named extra prescription
```

**NEW PROJECT DECISION:** this checkpoint does **not**
choose an IC, because it does not authorize `ω_y,state`.
Any future T2 SoT must choose **before** code, and must
couple that choice to the `Ω` fate (`27` §12). Candidate A
made option B *available* and therefore more tempting. That
is a hazard, not a default.

---

## 7. `ω → V` is a separate problem

Evolving `ω_y` and constructing velocity from `ω_y` are
not the same task.

### 7.1 Why no local formula

Vorticity is `ω = ∇ × V`. That map is many-to-one in the
other direction. Adding a gradient of a scalar (or, in 3D,
more kernel freedom) can leave `curl` unchanged.
Recovering `V` requires extra conditions, typically:

```text
a continuity stance      ∇ · V = 0, or anelastic, or given div
boundary conditions      lids, ground, far-field decay, maybe Ω
a gauge / projection     streamfunction, vector potential, …
often all three components of ω, not ω_y alone
```

A local algebraic closure such as

```text
V_θ ∼ ω_y * r / 2     (solid-body inversion on axis)
```

is true only for special vortices. It is false for a
shielded Gaussian, false for T1’s couple, and false as a
pointwise map from a 3D `ω_y` snapshot. Stokes / Biot–Savart
are **nonlocal**.

**ANTI-CLAIM:** `ω → V` is not a local algebraic mapping
in general.

### 7.2 Relation to parked issues

| Parked issue | Why it gates inversion |
| --- | --- |
| continuity YELLOW (`10`) | Poisson / streamfunction class **assumes** a divergence constraint. Inverting `ω_y` while adding the result to a YELLOW seven-operand sum does not produce mass-consistent circulation |
| prescribed synthetic operands | current `V` is not “the” velocity with this `ω_y`; six other occupants already contribute `V` with `ω_y = 0` |
| no mass-consistency solver | inversion-class D (`27` §8) listed continuity as **PREREQUISITE** |
| no generic inversion machinery | none should be designed here |

`27` §8 remains OPEN as the irreversible model-class
question and **NOT NEXT** as implementation. Candidate A
did not earn a solver. It only made the current `ω_y`
inspectable, which is the *input* an inversion would want
— of the painted vortex, not of T1.

### 7.3 `ω → V` conclusion

```text
evolving ω_y              ≠  changing tracer motion
reconstructing V from ω   =  a boundary-valued projection
local V_θ(ω_y)            =  rejected as a hidden closure
continuity                =  PREREQUISITE for inversion-class
Ω fate                    =  must be decided before generated V
                              is summed with V_rotation
earned as next slice      NO
```

Do not design a full solver in this file.

---

## 8. Option comparison

Escalation levels from `27` §4 remain:

```text
L1  diagnostics of existing V / ingredients; no new state
L2  evolving atmospheric state; may still ignore tracers
L3  vorticity influences velocity; model-class change
```

T1 and Candidate A were L1. Stretching-of-named-`ω_y` can
still be L1. T2 is L2. Any generated rotation is L3.

### 8.1 A — diagnostic stretching tendency only

Compute stretching of CURRENT prescribed `ω_y,current`,
analogous to T1.

```text
T_stretch,y = ω_y,current * ∂Vy_named/∂y
V_total unchanged
Ω unchanged
no state
```

| Criterion | Assessment |
| --- | --- |
| scientific value | MEDIUM as laboratory literacy (strain of the paint); LOW as supercell mechanics |
| architectural cost | LOW–MEDIUM after Candidate A (needs a named `∂Vy/∂y` method and a diagnostic owner, T1-shaped) |
| false-causality risk | **HIGH** (“now we stretch the mesocyclone”) |
| continuity | IMPORTANT for language; not a code blocker if anti-claims hold |
| thermo / baroclinicity | not required |
| parcel motion | unchanged |
| advances supercell-mechanics goal | weakly; another independent-knob product |

`27` already allowed this as *optional L1 after A*. The
honesty lock in §4 does not raise it to “next.” Candidate A
evidence (§10) lowers its value: the pattern stretched is
the shielded `Ω` vortex, not T1’s couple.

### 8.2 B — minimal prognostic vorticity experiment

Introduce `ω_y,state` evolved from selected tendencies.
Do **not** feed it back into velocity.

| Criterion | Assessment |
| --- | --- |
| scientific value | overlay of an ODE; LOW once users notice tracers ignore it |
| architectural cost | HIGH (owner, grid or equivalent, IC, reset, dt) |
| false-causality risk | **HIGH** (overlay reads as “why it rotates”) |
| continuity | IMPORTANT (advection/stretching on YELLOW `V`) |
| thermo | not required for a kinematic ODE; still omitted generation |
| parcel motion | unchanged |
| advances mechanics goal | only as software rehearsal for L3; `27` forbade that as a decision basis |

IC problem (§6) is now sharper because Candidate A is a
plausible-looking IC that would evolve the paint.

### 8.3 C — full causal bridge

Plan evolution + eventual `ω → V`, with inversion /
continuity / `Ω` fate acknowledged.

| Criterion | Assessment |
| --- | --- |
| scientific value | HIGH **if** named as a new laboratory class; this **is** the remaining causal gap |
| architectural cost | HIGH; irreversible |
| false-causality risk | HIGH unless `Ω` is removed or redefined (Ω5 / documented Ω4) and couple-vs-cyclone is faced (`25` §4.5) |
| continuity | PREREQUISITE for inversion-class reconstruction |
| thermo | still absent; shear-tilting pedagogy can exist without it; baroclinic mesocyclone cannot |
| parcel motion | would change — that is the point |
| advances mechanics goal | YES as a *class*, NO as the next slice |

Do not smuggle C as `Ω_eff(T1)` or as local `V_θ(ω)`.

### 8.4 D — other intermediate steps

**D1. Stretching **and** dilatation as a paired L1 diagnostic.**
More honest than A alone, because it refuses the
incompressible collapse. Still strain of prescribed `Ω`.
Still not process. Same false-causality risk if UI appears.

**D2. Docs-only model-class SoT** for “what a causal
vorticity laboratory would require” (`Ω` fate, inversion
family, continuity stance, IC policy) **without**
implementing state or a solver.
Highest remaining *decision* value. Not an implementation
slice. Not authorized automatically by this file.

**D3. Product exposure of already closed T1 and/or
Candidate A** (Inspector L3, research-style overlay).
Product, not new physics. Does not close the causal gap.
Not selected here; not forbidden as a later *product*
command (`27` §15).

**D4. Expand T1 sources** (downdraft / total `Vy`).
`27` §9: NOT NEXT then; still not. Broadens a validated
diagnostic; attribution suffers.

**D5. Net `−ω_y div_h` diagnostic** (“convergence acting
on prescribed `ω_y`”).
Different field from A. Still prescribed `Ω`. Would teach
inflow knobs, not tilting. Easy to over-read as
mass-consistent stretching.

### 8.5 Ranking for *next implementation*

```text
NOT NEXT     A stretching diagnostic
NOT NEXT     B prognostic ω without V
NOT NEXT     C ω → V / causal bridge
NOT NEXT     D1 / D4 / D5 as physics slices
NOT NEXT     D3 as a physics slice (product-only)

OPEN LATER   D2 model-class conceptual SoT, when commanded
OPEN LATER   D3 product exposure of T1 / Candidate A
OPTIONAL     A or D1 as L1 literacy, only after an explicit
             stretching-diagnostic physics SoT and a command
             that accepts the false-causality risk
```

---

## 9. T2 disposition

T2 = prognostic `ω_y,state` (`25` T2, `27` Candidate C).

Given Candidate A results:

```text
remain parked                 YES  — chosen here
become relevant before stretching
                              NO
become relevant after a
prognostic-state decision     YES, tautologically; that
                              decision is not earned now
rejected / redefined          NOT rejected as a future class
                              NOT redefined as “Candidate A
                              plus a clock”
```

Candidate A did **not** make T2 cheaper. It made the IC
trap visible: option B looks like “we already have `ω_y`.”
That is a diagnostic snapshot, not an IC policy.

T2 should **not** precede a conceptual `ω → V` / `Ω`
decision (`27` §8.2, §17). Stretching-as-diagnostic does
not require T2. T2 does not require stretching to be
implemented first; it requires a named source-term policy
(T1 exists) and an IC policy (OPEN).

**T2 remains PARKED.**

Do not implement T2.

---

## 10. Use of Candidate A evidence

Source: `docs/research/2026-08-20-candidate-a-demo-field-validation.md`.
Not a direction SoT. Empirical facts used here:

| Fact | Implication for stretching / evolution |
| --- | --- |
| positive prescribed core, axis `2Ω = 0.010 s⁻¹` at `y_mid` | stretching operand is `O(10⁻²) s⁻¹` painted spin, same family as env `\|ω_h\|`, **not** accumulated T1 |
| zero ring at `r = σ√2` | stretching null; not a pedagogical inconvenience to hide |
| negative outer annulus `∼ −1.4×10⁻³ s⁻¹` at `r = 2σ` | stretching `∂Vy/∂y > 0` sources the **shield**, opposite the core; must be discussed if the diagnostic exists |
| vertical envelope = rotation `G(y)` on `[0, 6500]`, not updraft `[0, 8000]` | strain and vorticity windows disagree; `y = 8000 m` updraft-on / `ω_y = 0` |
| T1 dipole spatially distinct from the outer ring; couple sits inside the **positive** core (`r ≈ 0.95σ`) | stretching Candidate A does **not** stretch T1’s couple; T1 remains a different object |
| Candidate A is prescribed `Ω`, not accumulated T1 | any `T_stretch` using this `ω_y` is strain of `Ω`; T1 did not generate it |
| CURRENT STACK IDENTITY held on live instances | stretching `ω_y(V_total)` is currently stretching `ω_y(V_rotation)` |
| Eulerian-steady in `t` | stretching rate would also be steady; not `∂ω/∂t` |

These facts **lower** the case for stretching-as-next.
They **raise** the case for keeping T1 and Candidate A
visually/semantically separate if product exposure happens
later. They **do not** authorize `ω → V` of the painted
vortex as “the mesocyclone.”

---

## 11. Recommendation

### Q1. Next PHYSICS QUESTION

**Not “implement stretching.”**

The L1 disambiguation `27` earned is complete:

```text
T1           where vertical vorticity would tend to be
             generated (couple, s⁻²)
Candidate A  where it currently exists in V_total
             (shielded Ω vortex, s⁻¹)
```

The remaining scientific gap is causal:

```text
how (if ever) a tendency becomes state,
and how (if ever) state becomes velocity,
without double-counting prescribed Ω
```

That gap is a **model-class** question. It is not closed by
multiplying the two L1 fields.

### Q2. Next ARCHITECTURE QUESTION

**Open, not next to implement:**

```text
Is any ω → V family compatible with this laboratory,
and must that decision precede any ω_y,state?
What is the fate of Ω (Ω1/Ω2 now; Ω4/Ω5 only with a
named class)?
What IC is legal if state appears?
```

A stretching-diagnostic architecture would be T1-shaped and
is **not** selected.

### Q3. Next IMPLEMENTABLE capability

**NONE from this checkpoint.**

```text
NEXT DIRECTION:           NO IMPLEMENTATION YET
CONFIDENCE:               HIGH
```

Why pause, rather than A:

- Candidate A evidence shows stretching would act on the
  painted shielded vortex, including a negative ring and a
  mismatched vertical window.
- Isolated `ω_y ∂Vy/∂y` is not the net compressible budget
  (`−ω_y div_h` for purely vertical `ω`).
- False-causality risk is higher now that `ω_y` *looks* like
  “the rotation.”
- T1 + Candidate A already answer the post-T1 question.
- Walking the vorticity equation in code order is exactly
  the failure `27` existed to prevent.

Why not B/C:

- B is a display ODE on a YELLOW `V`, IC-trapped, ignored
  by tracers.
- C is the real causal missing step and an irreversible
  class change; not the next slice. Continuity and `Ω`
  are not decided.

Why not HYBRID “stretching SoT now, implement later in the
same breath”:

A hybrid would smuggle a default. If stretching is ever
wanted, it needs its **own** command after review of *this*
honesty lock.

Confidence is HIGH on the negative ranking and HIGH on
pause. It is MEDIUM that a later **docs-only** model-class
SoT (option D2) is the right follow-up *when commanded*.
That follow-up is **not** started here.

### 11.1 Explicit next slice

**None.**

No physics derivation file is opened.
No architecture SoT for stretching is opened.
No product slice is ordered.

---

## 12. Anti-claims

STILL-BINDING, including new ones earned after Candidate A:

```text
T1 does not currently generate Candidate A.
Candidate A is not accumulated T1.
prescribed Ω is not prognostic ω.
stretching of prescribed ω is not proof of causal
  mesocyclone intensification.
a prognostic ω scalar does not automatically create velocity.
ω → V is not a local algebraic mapping in general.
current tracers are not automatically material vortex tubes.

ω_y,current  ≠  T_tilt,y
ω_y,current  ≠  Dω_y/Dt
ω_y,current  ≠  ∂ω_y/∂t
T_stretch,y  ≠  Dω_y/Dt
T_stretch,y  ≠  −ω_y div_h     in this laboratory
∇ · V = 0                      is not earned
the outer Candidate A ring     is not T1’s couple
the T1 couple                  is not the Candidate A core
Initializing T2 from Candidate A while keeping Ω
  is not a neutral default.
Carrying ω_y on tracers        is not Eulerian vorticity state.
Isolated (ω · ∇)V stretching   is not vortex-tube conservation.
YELLOW continuity              does not become GREEN by naming ω_y.
Baroclinic generation          is still unsupported.
CURRENT STACK IDENTITY         is still not a supercell theorem.
```

---

## 13. New unresolved questions

Not answered here. Not implementation tasks.

```text
U1  If L3 is ever wanted, which inversion / parameterization
    family is compatible with a seven-operand kinematic lab?
U2  Ω1 vs Ω5 (keep paint forever vs replace when generated V
    exists). Ω3 remains not choosable (`27` §12).
U3  How to treat T1’s vortex couple vs a single cyclonic
    chimney if generated V is ever required (`25` §4.5).
U4  Whether a docs-only model-class SoT (D2) should precede
    any further vorticity diagnostics.
U5  Whether product exposure of T1 / Candidate A should
    happen independently of physics (D3).
U6  If stretching is ever implemented, must dilatation be
    a sibling diagnostic in the same SoT?
U7  Eulerian owner vs (rejected-by-default) tracer-carried
    scalar, should T2 ever be opened.
U8  Whether YELLOW must be promoted before any prognostic ω
    that is sold as material-tube dynamics (likely yes)
    versus a named kinematic ODE (maybe no).
```

---

## 14. Documentation / authority

```text
this file:     post-Candidate-A direction checkpoint
22 / 26:       T1 — CLOSED
23 / 28:       Candidate A — CLOSED / VALIDATED HEADLESS / DEMO
27:            post-T1 direction — historical ranking of A
25:            pre-T1 ranking of T1 — historical
research 2026-08-20 Candidate A:  DEMO evidence — not a
                                 direction SoT
10:            continuity YELLOW — not a solver authorization
```

Do not rewrite `22`, `23`, `26`, or `28` to make this
recommendation convenient. Successor pointer only on `27`.

External literature was **not** required to rank A–C.
The vorticity identity and the stretching/tilting split
are already project SoT (`22` §7). Dilatation vs
`∂Vy/∂y` vs `div_h` follows from that identity plus
`10` / physics `15`. Biot–Savart / Poisson are named as
standard reconstruction problems, not imported as a
chosen solver.

---

## 15. Compact lock-in

```text
T1:                         CLOSED / VALIDATED HEADLESS
Candidate A:                CLOSED / VALIDATED HEADLESS / DEMO
                            commit 61b22f0

T1 → ω_y(t):                NO BRIDGE
ω_y → V:                    NO BRIDGE

V_total:                    seven prescribed operands
                            UNCHANGED
prescribed Ω:               STILL ACTIVE
                            Ω1 / Ω2 viable now
                            Ω4 / Ω5 open only for later L3 SoT

ω_y,current:                shielded vortex of Ω
                            core / zero ring / outer annulus
                            ≠ T1 couple

continuity:                 YELLOW
                            LIMITATION for curl diagnostics
                            IMPORTANT for stretching language
                            PREREQUISITE for inversion-class ω→V

thermodynamics:             ABSENT
time:                       DEMO V Eulerian-steady
                            stretching of current ω would
                            also be a snapshot, not ∂ω/∂t

stretching of ω_y,current:  mathematically possible
                            scientifically not supercell process
                            NOT NEXT

T2:                         REMAINS PARKED
                            IC problem sharper after Candidate A

next PHYSICS QUESTION:      causal class (state + ω→V + Ω fate)
                            NOT stretching-by-default

next IMPLEMENTABLE:         NONE

NEXT DIRECTION:             NO IMPLEMENTATION YET
confidence:                 HIGH

PHYSICS IMPLEMENTATION
FROM THIS FILE:             NONE
```

---

## 16. STOP

```text
POST-CANDIDATE-A PHYSICS DIRECTION
  DECIDED AS A CHECKPOINT
  NOT AN IMPLEMENTATION ORDER

NEXT DIRECTION
  NO IMPLEMENTATION YET

NOT NEXT
  stretching diagnostic
  T2 prognostic ω_y
  ω → V closure
  Ω modulation / replacement
  continuity solver
  thermo / baroclinic
  Candidate A / T1 UI
  tracer-owned vorticity

T1
  REMAINS CLOSED AS HEADLESS DIAGNOSTIC

CANDIDATE A
  REMAINS CLOSED AS HEADLESS DIAGNOSTIC / DEMO

PRESCRIBED Ω
  REMAINS THE ROTATION OPERAND
  NOT RELABELED AS TILTING OR AS PROGNOSTIC ω

VORTICITY → VELOCITY
  STILL NO BRIDGE

CONTINUITY
  STILL YELLOW
  NOT A SOLVER BRANCH
```

Do not implement stretching, T2, prognostic `ω`, `ω → V`,
`Ω` changes, `V_total` changes, continuity, thermo,
Inspector, or visualization because this file exists.

Do not start a selected branch until commanded.

Wait for review.

Next work starts only when commanded.
