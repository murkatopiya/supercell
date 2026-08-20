# Post-T1 Physics Direction Checkpoint

**Status:** DECISION CHECKPOINT / POST-T1 / NO IMPLEMENTATION AUTHORIZATION
**Scope:** determine which physics/modeling question is actually
earned after validated headless T1. Not an implementation design.
Not a VelocityField. Not Y12. Not stretching-by-default.
**Physics:** T1 diagnostic tilting tendency is CLOSED as a
headless capability. This file does not reopen physics 22.
**Implementation:** none. Docs-only. Production `src/**` MUST
remain unchanged. This checkpoint does **not** authorize curl,
stretching, T2, ω state, closure, Ω changes, continuity, RK2,
thermo, dataset, Inspector, or visualization work.

Successor Candidate A physics derivation (not architecture):

```text
docs/physics/23-diagnostic-vertical-vorticity.md
```

Successor Candidate A architecture (not implementation):

```text
docs/architecture/28-diagnostic-vertical-vorticity-architecture.md
```

`23` is the physics SoT for `ω_y,current`. `28` is the
architecture SoT. This file remains the post-T1 *direction*
checkpoint. Completing `23` or `28` does **not** start
implementation.

Successor post-Candidate-A direction checkpoint:

```text
docs/architecture/29-post-candidate-a-physics-direction-checkpoint.md
```

`29` answers what is earned after validated headless
Candidate A. This file does **not** rank that work.
Completing Candidate A does **not** make stretching, T2,
or `ω → V` automatic.

Predecessor T1 physics:

```text
docs/physics/22-diagnostic-tilting-tendency.md
```

Predecessor T1 architecture:

```text
docs/architecture/26-diagnostic-tilting-tendency-architecture.md
```

T1 DEMO scientific validation:

```text
docs/research/2026-08-20-t1-demo-field-validation.md
```

Validation commit:

```text
090de9f
```

Predecessor direction revalidation (pre-T1 ranking; not replaced):

```text
docs/architecture/25-tilting-stretching-direction-revalidation.md
```

`25` remains the document that ranked T1 as the next design
target. This file answers what is earned *after* that target was
implemented and validated. Completing T1 does **not** make T2 or
stretching automatic.

Keep these roles distinct:

```text
CURRENT FACT
STILL-BINDING CONTRACT
OPEN QUESTION
RECOMMENDATION
NEW PROJECT DECISION
ANTI-CLAIM
```

This document did **not** change production code.
It does **not** create `ROADMAP.md`.
It does **not** start the selected branch.

---

## 1. Why this checkpoint exists

T1 is now a validated headless diagnostic:

```text
T_tilt,y = ω_h^{env,world} · ∇_h Vy_updraft
```

CURRENT DEMO evidence (`2026-08-20-t1-demo-field-validation.md`):

- coherent signed vortex couple;
- orientation follows actual environmental `ω_h`;
- amplitude follows updraft envelope × sounding shear;
- magnitude ~10⁻⁵ s⁻²;
- independent of prescribed `Ω`;
- independent of constant storm-motion subtraction;
- sounding-knot jumps identified as representation artifacts;
- NOT generated rotation;
- NOT mesocyclone;
- NOT prognostic `ω_y`.

The risk this checkpoint exists to prevent:

```text
not:  stretching is next because the textbook vorticity
      equation writes it after tilting
not:  T2 is next because T1 is a tendency
not:  integrate the couple into ω_y(t) and call that a
      mesocyclone
not:  treat curl(Ω) as “the vorticity T1 generated”
not:  close ω → V because tracers still follow prescribed spin
```

The question is not “what formula comes next.”

The question is which next step is scientifically useful in
*this* laboratory, now that we know where a vertical-vorticity
*tendency* would be produced and also know that nothing currently
accumulates it.

---

## 2. Current causal / model inventory

Verified against `src/**` and live DEMO composition
(`composeDemoTracerFields`, `composeDemoTracersWithObservation`).
Repository wins over stale five-operand snapshots.

`V_total` remains the same seven prescribed velocity operands.
`CompositeVelocityField` is an unweighted world-space sum.
It does not own diagnostics.

### 2.1 A. Environmental horizontal vorticity `ω_h`

```text
kind:          derived diagnostic (not prescribed velocity)
shape:         atmospheric vector (omegaEastward, omegaNorthward)
owner:         EnvironmentalWindProfile → verticalWindShearBetween
               → horizontalVorticityFromShear
changes V:     no
time history:  none; piecewise-constant on sounding segments
```

Layer diagnostic of a horizontally homogeneous profile
(`docs/physics/06-horizontal-vorticity.md`). Not local 3D curl
of `V_total`. Not T1. T1 maps it to world `(ω_x, ω_z)` at sample
time; hodograph DEMO overlay still uses a fixed `[0, 1000]` m
layer and is not T1’s `ω_h`.

### 2.2 B. Prescribed velocity field `V_updraft`

```text
kind:          prescribed VelocityField
shape:         world Vec3; DEMO occupant is (0, Vy, 0)
owner:         VerticalEnvelopeUpdraftField
changes V:     yes; operand of V_total
time history:  none; Eulerian-steady in DEMO (`time` ignored)
```

Formula: `Vy = W0 E_r(r) F(y)` (`docs/physics/15-vertical-updraft-envelope.md`).

### 2.3 C. Diagnostic `∇_h Vy`

```text
kind:          derived diagnostic of the prescribed updraft
shape:         { dVyDx, dVyDz }  [s⁻¹]
owner:         VerticalEnvelopeUpdraftField
               .horizontalGradientOfVerticalVelocity
changes V:     no
time history:  none; analytic; `time` forwarded, unused
```

Not a `VelocityField.derivative` / `curl` API. Not composite
`Vy`. Not downdraft `Vy`.

### 2.4 D. Diagnostic `T_tilt,y`

```text
kind:          diagnostic source term
shape:         signed scalar  [s⁻²]
owner:         DiagnosticTiltingTendency
changes V:     no
time history:  none; snapshot; accepts laboratory t
```

Sibling of `velocityObservation`, not a `parts` row.
Exposed on `ExploreLab.tiltingTendency` and
`GuidedLab.tiltingTendency`. Inspector does not sample it.
Visualization does not consume it.

### 2.5 E. Prescribed rotation velocity `V_rotation`

```text
kind:          prescribed VelocityField
shape:         world Vec3; horizontal azimuthal about +Y
owner:         VerticalEnvelopeRotationField
changes V:     yes; operand of V_total
time history:  none; Eulerian-steady in DEMO
```

DEMO: `Ω = 0.005 rad/s`, `σ = 4000 m`, `[y_b, y_t] = [0, 6500]` m.
Not vorticity. Not T1. Not mesocyclone.

Documented identity, **not** a production API
(`docs/physics/18-vertical-rotation-envelope.md` §18.2):

```text
ω_y^{Ω} = 2 Ω G(y) E (1 − r² / (2 σ²))
```

### 2.6 F. Vertical vorticity `ω_y` derivable from prescribed `V`

```text
kind:          derived identity / bookkeeping
shape:         scalar  [s⁻¹]  (world-vertical curl)
owner:         none in production
changes V:     no
time history:  none
```

Definition, if evaluated:

```text
ω_y,current = (∇ × V)_y = ∂Vx/∂z − ∂Vz/∂x
```

No `curl()` on `VelocityField` or on any operand.
Inspector contribution row `rotation` is `V_rotation`, not `ω_y`.

From locked formulas, not from a live API:

| Operand | Documented / algebraic `ω_y` |
| --- | --- |
| environment / `V_env − C` | 0 (horizontally homogeneous) |
| updraft | 0 (`V = (0, Vy, 0)`) |
| rotation | `2 Ω G E (1 − r²/(2σ²))` (physics 18) |
| lower inflow / upper outflow / NG outflow | 0 (purely radial axisymmetric; algebra on locked `V_r`) |
| downdraft | 0 (physics 20 §14) |

Therefore, as CURRENT FACT of the documented DEMO stack:

```text
ω_y(V_total) = ω_y(V_rotation)
```

That equality is bookkeeping of prescribed spin. It is **not**
produced by T1.

### 2.7 G. Prognostic / evolved vertical vorticity state

```text
kind:          absent
shape:         n/a
owner:         none
changes V:     n/a
time history:  none
```

`Simulation` owns clock, tracer positions / age / active /
`tracerId`. It samples a caller-supplied `VelocityField`.
Fields do not mutate on `step`. Reset restores tracer seeds.
There is no `ω` to reset.

### 2.8 H. Tracer motion

```text
kind:          Lagrangian probes of V
shape:         position, age, active, tracerId
owner:         Simulation
changes V:     no
time history:  particle path; not atmospheric state
```

Integrator: live Euler, DEMO `dt = 0.1 s`.
RK2 exists and is tested; not used in DEMO / Explore / Guided
composition.

### 2.9 I. Visualization

```text
kind:          observe-only encoding of V_total
shape:         glyphs, trails, provisional comets, operand tint
owner:         rendering / VisualAirflowPopulation
changes V:     no
time history:  occupant advection of the same V, not ω
```

Does not sample T1. Operand tint is `|V_i|`, not tendency.
Background highlight remains REJECTED (`24`).

### 2.10 Related objects that must not collapse into A–I

| Object | Distinct from |
| --- | --- |
| SRH (`09`) | not `T_tilt,y`; not `ω_y`; column integral of env |
| streamwise / crosswise `ω_h` (`08`) | projection of env `ω_h`; not a tilting rate |
| `V_rotation` | velocity, not vorticity |
| `ω_y^{Ω}` | curl of prescribed spin, not T1 |
| `T_tilt,y` | tendency, not state |
| updraft `ω_h` from `∇ × (0, Vy, 0)` | not env `ω_h`; not T1’s vorticity input |
| rotation lid `G'` horizontal vorticity | curl of the envelope window; not env `ω_h` |
| Inspector L2 `parts` | why `V_total`; seven velocity operands |

---

## 3. Current causal graph

What exists:

```text
EnvironmentalWindProfile
        ↓
vertical shear (segment)
        ↓
ω_h  (atmospheric; T1 maps to world)
        ↓
T_tilt,y = ω_h · ∇_h Vy_updraft
        │
        └── observed by DiagnosticTiltingTendency.sample
            does not enter Simulation
            does not enter V_total
```

and, separately:

```text
ScenarioRotation.Ω
        ↓
V_rotation = VerticalEnvelopeRotationField
        ↓
V_total = Σ seven prescribed VelocityFields
        ↓
Euler integration
        ↓
tracers / visual occupants
```

STILL-BINDING: there is **no** authorized arrow

```text
T_tilt,y  →  ω_y(t)
```

and **no** authorized arrow

```text
ω_y  →  V_rotation / V_total
```

Confirmed in repository:

- `DiagnosticTiltingTendency` does not import rotation;
- composition tests lock `Ω` independence and `C` independence;
- `Simulation` is constructed from `velocityObservation.total`,
  not from `tiltingTendency`;
- `velocityObservation.parts` has seven velocity keys and no
  tilting row;
- `TracerInspection` does not mention T1;
- no `curl` production API.

A third, currently undocumented-as-API but algebraically present
object:

```text
V_rotation  --(identity)-->  ω_y^{Ω}
```

That identity is physics-18 bookkeeping. Production does not
expose it. It must not be drawn as T1’s output.

---

## 4. Central post-T1 question

We now know **where** a vertical-vorticity tendency would be
produced.

What is the next scientifically useful capability?

That question is not answered by the next symbol in the
textbook vorticity equation.

Three escalation levels must stay distinct:

```text
L1  learn more about the prescribed model
    diagnostics of existing V / existing ingredients
    V_total unchanged
    no new atmospheric state

L2  introduce evolving atmospheric state
    some ω_y(P, t) or reduced state
    still may not affect tracers

L3  make diagnosed / evolved vorticity influence velocity
    ω → V bridge / closure
    model-class change
```

T1 was L1. Stretching-of-named-`ω_y` can still be L1.
T2 is L2. Any generated rotation is L3 (or L2 pretending to be
L3 in the UI).

`25` ranked T1 because the laboratory was exhausted as an
additive cartoon and the causal story was still dark.
That ranking does **not** survive as “keep walking down the
vorticity equation.” After T1, the earned move is the one that
clarifies the objects we now have, or honestly changes the
model class — not the one that looks sequential on a whiteboard.

---

## 5. Candidate A — diagnostic vertical vorticity / curl

Investigate:

```text
ω_y,current = (∇ × V)_y = ∂Vx/∂z − ∂Vz/∂x
```

from current prescribed velocity / selected operands.

### 5.1 What would this tell us?

Where **vertical rotation currently exists** as a property of
the prescribed wind, as distinct from where T1 says vertical
vorticity **would tend to be generated**.

That comparison is newly valuable because T1 validation showed
a vortex **couple** offset along `ω_h`, while prescribed `Ω`
paints an on-axis shielded vortex. Those are different spatial
objects. They are currently easy to collapse in speech
(“the rotation”).

### 5.2 Curl of what?

| Source | What it would show | Honesty |
| --- | --- | --- |
| `V_rotation` only | the painted shielded vortex `ω_y^{Ω}` | highest for “current spin” |
| `V_total` | same `ω_y` if other operands contribute 0 | honest if labeled as composite bookkeeping; easy to over-read as “storm vorticity” |
| decomposed by operand | attribution: which occupant carries `ω_y` | highest teaching value |

**RECOMMENDATION if A is ever designed:** lock the **vertical
component** first, with operand decomposition available.
Do not ship an undifferentiated `curl(V_total)` vector labeled
“vorticity” — that mix would include env `ω_h`, updraft
`ω_h` from `∇_h Vy`, rotation lid `G'` horizontal vorticity,
and downdraft `ω_h`. That mix is exactly what `15` §9.3 /
`25` §4.7 called bookkeeping-not-tilting.

### 5.3 Which current operands contribute `ω_y`?

See §2.6. On documented DEMO formulas, **only prescribed
rotation** contributes world-vertical vorticity.

Environment does **not** contribute `ω_y` (no horizontal
variation of `V_h`). Constant `C` does not. Radial
inflow/outflow are purely radial; algebra on the locked
profiles gives `ω_y = 0`. Updraft and downdraft have `ω_y = 0`.

Candidate A would therefore mostly **name** an identity physics
18 already wrote. That is still useful: naming it as a
diagnostic keeps it from being confused with T1, and makes the
“only rotation carries `ω_y`” fact inspectable rather than
tribal knowledge.

### 5.4 Does `VerticalEnvelopeRotationField` have a clean analytic `ω_y`?

**YES**, interior of the layer: physics 18 §18.2.
Sign change at `r = σ √2` (shielded vortex). Zero outside
`G = 0`. Lid `G'` produces **horizontal** vorticity, not extra
`ω_y` from that formula.

No production API. Analytic evaluation would match T1’s
gradient strategy: method on the concrete type, not
`VelocityField.curl()`.

### 5.5 Does radial inflow/outflow contribute vertical curl?

**Not on the locked purely radial axisymmetric formulas.**
`ω_y = 0` is algebra, not a current test contract for those
types. A later A SoT would have to lock that identity or
disprove it, not assume a finite-difference surprise.

### 5.6 Does the environment profile contribute `ω_y`?

**No.** Horizontally homogeneous `V_h(y)` has
`∂Vx/∂z = ∂Vz/∂x = 0`. Env contributes `ω_h`, which T1 already
uses. Candidate A must not re-import env `ω_h` as “vertical
vorticity.”

### 5.7 Does this remain purely diagnostic?

**YES**, if owned like T1: a model diagnostic sibling, not a
`VelocityField`, not Simulation state, not an L2 row.

### 5.8 Named `ω_y` for stretching without pretending T1 generated it?

**Yes, it can name a stretching operand. That does not make
stretching honest as supercell process.**

If prescribed rotation’s curl is used as `ω_y` for a stretching
diagnostic:

```text
LEGAL
  “local stretching tendency of the prescribed vortex
   under prescribed ∂Vy/∂y”
  ω_y^{Ω} · ∂Vy_updraft/∂y
  V_total unchanged
  T1 did not create this ω_y

ILLEGAL
  “T1 generated this vortex”
  “this is how the mesocyclone intensifies from tilting”
  “stretching of tilted environmental vorticity”
  Ω_eff = Ω (1 + α ∂Vy/∂y)
  any modification of V_rotation
```

`25` §7.6 already forbade stretching prescribed-`Ω` vorticity
and calling it supercell stretching. Candidate A does not
repeal that. It only makes the named source explicit enough
that a later B could be honest **as L1 bookkeeping**.

### 5.9 Scientific value and architectural cost

**Value:** HIGH for disambiguation after T1. The project now
has two rotation-adjacent scalars (`T_tilt,y` and implicit
`ω_y^{Ω}`) and only one is an API. Product CONCEPT wants
“I can see the rotation” as orientation/magnitude/scale — A
is the first object that is actually *current vertical
vorticity*.

**Cost:** LOW–MEDIUM. Same architecture class as T1
(stateless diagnostic, SAME-source instances, headless
sample). Analytic path exists for the only contributing
operand. Dataset future is `∇ × V`, not this DEMO formula.

**Escalation:** L1. Does not introduce state. Does not change
`V_total`. Does not resolve `Ω`.

**Corner risk:** MEDIUM if UI or a later B quietly treats
`ω_y^{Ω}` as T1’s integral.

### 5.10 Candidate A verdict

**EARNED as the next physics question / next L1 capability.**

Not automatic implementation. Not a stretching authorization.
Not “the vorticity field of the supercell.”

---

## 6. Candidate B — diagnostic stretching

Textbook vertical stretching in project coordinates:

```text
T_stretch,y = ω_y * ∂Vy/∂y
```

`∂Vy/∂y` of the live updraft is documented
(`docs/physics/15-vertical-updraft-envelope.md`):

```text
inside (y_b, y_t):  W0 E_r (π/H) cos(π ξ)
```

That derivative **is** the isolated updraft’s `∇ · V`.
Continuity is YELLOW. See §13.

### 6.1 What would `ω_y` mean here?

| Source | Mathematically valid? | Scientifically honest? | Useful? | Circularity / double counting | Relation to `Ω` | About actual supercell mechanism? |
| --- | --- | --- | --- | --- | --- | --- |
| **B1** curl of prescribed rotation | yes | yes **as painted-vortex strain**; no as tilted-env dynamics | limited: shows on-axis stretch of `Ω` | conceptual double count if later also evolving T1’s couple | `ω_y ∝ Ω` | no; kinematics of two independent knobs |
| **B2** curl of `V_total` | yes kinematically | weaker: mixes operands; DEMO `ω_y` still ≈ B1 | almost same as B1 for `ω_y` | same, plus divergent-inflow confusion | still `Ω` | no |
| **B3** explicitly named prescribed diagnostic state | yes if named | depends on the name | only if it is not T1 in disguise | high if it is “T1 snapshot used as ω” | must be stated | no unless the name is a new physical claim |
| **B4** future prognostic `ω_y` | yes as an ODE term | medium as teaching ODE; low if sold as dynamics | process-in-`ω`, not in `V` | low vs `Ω` **if** `Ω` is not also stretched as truth | independent of `Ω` only if `Ω` is not the IC | only inside that ODE |

Using a T1 spatial pattern as if it were `ω_y` (rate used as
state) is **B3 in bad faith**. A tendency is not vorticity.

### 6.2 Dilatation / compressible vorticity equation

Do **not** silently equate `∂Vy/∂y` with horizontal
convergence.

The inviscid vorticity identity (curl of momentum; already the
parent of T1’s tilting product in physics 22) splits, among
other terms:

```text
(ω · ∇) V          stretching / tilting
− ω (∇ · V)        dilatation
```

World-vertical stretching from strain is `ω_y ∂Vy/∂y`.

Isolated updraft:

```text
∇ · V_up = ∂Vy/∂y
```

Composite:

```text
∇ · V_total = ∂Vy/∂y_up + ∂Vy/∂y_down + div_h(inflow/outflow) + …
```

Incompressible teaching language uses `∇ · V = 0`, hence
`∂Vy/∂y = −div_h`, and “stretching by convergence.” That
substitution is **false** in this laboratory. Inflow `div_h`
and updraft `∂Vy/∂y` are independently prescribed
(`10`, physics `15` §11.3).

A diagnostic B must say:

```text
T_stretch,y = ω_y * ∂Vy/∂y     of a named Vy
```

It must **not** say:

```text
stretching = −ω_y div_h
vortex-tube conservation
mass-consistent intensification
```

YELLOW is not a blocker for writing the product. It is a
blocker for vortex-tube copy.

### 6.3 Can diagnostic stretching be valuable BEFORE T2?

**CONDITIONAL.**

```text
YES   as L1 bookkeeping, after a named ω_y (A or explicit ω_y^{Ω}),
      with anti-claims, V unchanged, no Ω modulation

NO    as the next supercell-mechanism capability
NO    if ω_y is silently curl(Ω) and copy says “tilting then stretching”
NO    as amplification history (a rate without state is not history)
```

Without A (or an equally explicit named `ω_y`), B has nothing
honest to multiply. Using T1 as `ω_y` is forbidden.

### 6.4 Candidate B verdict

**NOT NEXT.** Parked until a named `ω_y` exists and a separate
honesty lock chooses B1-style bookkeeping versus waiting for
non-prescribed `ω_y`.

Stretching is not earned merely because T1 exists.

---

## 7. Candidate C — T2 prognostic `ω_y`

Introduce an actual state variable `ω_y(P, t)` or a reduced
representation, with evolution beginning from T1.

This checkpoint does **not** design it.

### 7.1 Conceptual choices that appear immediately

| Choice | Why it appears |
| --- | --- |
| Eulerian grid vs particles/parcels vs reduced analytic state | vorticity is Eulerian; tracers are not atmosphere (`22` §22, `25` §9) |
| initialization | T1 is a rate, not an IC. Zero? `ω_y^{Ω}`? Couple-shaped snapshot? Each is a physical claim |
| advection of vorticity | by which `V`? Prescribed `V_total` is divergent |
| tilting source accumulation | T1 as source is the obvious term; still not Dω/Dt of a real atmosphere |
| stretching | needs the same `ω_y` being integrated; YELLOW `∂Vy/∂y` |
| diffusion / dissipation | no physical viscosity; any damper is an invention |
| boundary conditions | domain lids, ground, far field |
| reset / replay | new: restore `ω` ICs, not only tracer seeds |
| time integration | new physics timestep; relation to tracer `dt = 0.1 s` |
| Simulation clock | T1 is stateless; T2 is not. `Simulation` today is a tracer stepper (`25` §9.2: do not hide a class change in that name) |
| RK2 / Euler | tracer RK2 samples `V` at midpoint; if `V` still independent of `ω`, integrator choice is *orthogonal*. If later coupled, splitting appears |
| spatial discretization | no grid exists |
| continuity assumptions | stretching / advection on a YELLOW field |

IC is the trap: initializing from `ω_y^{Ω}` makes T2 evolve the
painted vortex, not T1’s couple. Initializing from zero plus T1
evolves a couple **while tracers still follow `Ω`**. Initializing
from T1×Δt is a fake spin-up.

### 7.2 If T2 evolves `ω_y` but `ω_y` does not affect `V_total`

The product gains an evolved **display** field: a diagnostic
prognostic.

User-visible motion would still be prescribed `Ω`.
Inspector L2 would still explain velocity from seven operands.
The overlay would show a couple growing on a ~10⁻⁵ s⁻² source
(characteristic time many hours at DEMO `|T|_max` — physics 22
§21 — **not** a mesocyclone clock).

**Is that scientifically useful enough to justify new state
architecture?**

**No, not as the next step.** It is an expensive teaching ODE
on top of a steady kinematic laboratory. Dataset evolution
would not use this state (`25` §14). Honesty cost is high:
users will read the overlay as “why it rotates” while `V`
remains `Ω`.

**Is it an expensive dead-end unless `ω → V` follows?**

**Mostly yes.** The only durable residue would be software
(grid, reset, field owner) that a later L3 might reuse — or
that a dataset path would discard. Building it “so we have
somewhere to put stretching” is implementation convenience,
which this checkpoint forbids as a decision basis.

### 7.3 Candidate C verdict

**NOT NEXT.** Parked. T1 → `ω_y(t)` remains unauthorized.
Do not treat a validated tendency as an earned integrator.

---

## 8. Candidate D — `ω → V` bridge / closure

Conceptual only. No solver choice.

If diagnosed or evolved `ω_y` should affect tracer motion,
velocity must change. That is a **closure**, not a diagnostic
identity (`25` §5.4, STILL-BINDING).

### 8.1 Families

| Family | New physical claim | `Ω` fate | Double counting | Continuity | Dataset portability | Model class |
| --- | --- | --- | --- | --- | --- | --- |
| Parameterized analytic vortex | amplitude/shape of a chosen vortex tracks some diagnostic | must remove, scale, or redefine `Ω` | acute if `Ω` stays | kernel can be `div 0`; matching to updraft is not | DEMO-shaped | still kinematic, plus a named parameterization |
| Prescribed vortex amplitude driven by diagnostic state | `Ω_eff(t) = f(T1 or ω)` | reinterpret `Ω` as a knob driven by diagnostics | the same chimney is both painted and “explained” | no new `div` if only `Ω` scales | DEMO `Ω` closure | kinematic laboratory with a fake causal label |
| Local closure (`V_θ ~ ω ΔA`, etc.) | vorticity induces velocity locally | `Ω` must not occupy the same role | high | new `div` unless constructed carefully | poor; locality is physically false | different reduced model |
| Velocity inversion / Poisson-type | recover `V` from `ω` under a continuity stance and BCs | `Ω` replaced by the solve (or used as BC) | solved only if `Ω` is not also added | **central** | different problem on a dataset (`V` is given) | not this laboratory class |
| Other reduced-order | must be named | depends | depends | depends | depends | must be named |

Do not pick a solver because it is elegant.

### 8.2 Is `ω → V` the real missing step after T1, even if not the next implementation?

**YES as the causal / product gap. NO as the next implementable
capability.**

After T1 we can show generation *tendency*. Tracers still cannot
feel generated rotation. CONCEPT’s “I can see the rotation” as
a **process that moves air** requires L3, not another overlay.

That does not make D next:

- `Ω` is still the live mesocyclone-scale occupant (§12);
- continuity becomes a real gate for inversion;
- Guided / Inspector / visual occupants all observe prescribed
  `V`; reversing that is irreversible without a model-class SoT;
- T1’s couple vs single cyclone (`25` §4.5) is unsolved as a
  velocity field.

**NEW PROJECT DECISION:** D is the *class* question that must
be answered before T2 is worth building. It is not authorized
here. Answering it is a future architecture/physics SoT, not a
Poisson implementation.

### 8.3 Candidate D verdict

**NOT NEXT as implementation. OPEN as the irreversible
model-class question.** Do not smuggle a local `Ω(T1)` scaler
as “a small D.”

---

## 9. Candidate E — expand T1 sources

Current T1 uses environmental `ω_h` × gradient of prescribed
**updraft** `Vy` only (physics 22, architecture 26).

Possible expansions:

- downdraft `∇_h Vy`;
- composite vertical velocity `Vy_total`;
- other vertical-motion sources (none else have `Vy ≠ 0`
  among current operands except updraft + downdraft).

### 9.1 Would composite `∇_h Vy` be more physically informative?

It would be closer to “tilting by all vertical motion.” It
would **blur mechanism attribution**. Current T1’s value is
that the couple is *the isolated-updraft response to env*
`ω_h`. Composite `Vy` adds the offset downdraft’s own couple,
with a different axis and `W` sign, still prescribed, still
not RFD/FFD/cold pool (physics 20; `15` architecture anti-claims).

### 9.2 Could we have sibling diagnostics?

```text
T_tilt,updraft
T_tilt,downdraft
T_tilt,totalVerticalMotion
```

**Yes**, without calling them velocity operands. Same T1
architecture class. They would remain diagnostics.

### 9.3 Does this materially advance supercell understanding?

**Mostly no.** It broadens a validated diagnostic. The offset
DEMO downdraft is not automatically rear-flank / baroclinic.
A total-`Vy` couple would be easier to sell as “the storm’s
tilting field” and harder to explain.

**RECOMMENDATION:** optional later siblings; not the next
direction. Keep v1 updraft-only as the named mechanism.

### 9.4 Candidate E verdict

**NOT NEXT.** Optional L1 expansion after A, or never, without
loss of the post-T1 question.

---

## 10. Candidate F — baroclinic / thermodynamic boundary

Do not implement.

Current chain stops because the laboratory has:

```text
no density field
no pressure field
no buoyancy / thermodynamics
no cold pool
no baroclinic vorticity generation
```

Env-shear tilting (T1) does **not** require those fields.
Baroclinic generation of **horizontal** vorticity along a
density gradient (cold pool, RFD, gust front) **does**.

Near-ground outflow and downdraft remain independently
prescribed velocity occupants. They are not a density current
(`14`, `15`, `17` Guided anti-claims). Further kinematic
rotation work (A, even a later D on env-tilting) can stay
worthwhile **as shear-to-tilting pedagogy**. It becomes
misleading when copy implies:

```text
low-level mesocyclone from baroclinic vorticity
tornadogenesis
RFD / FFD as thermodynamic objects
downdraft → cold pool → new ω_h → new tilting
```

**At what point does a more sophisticated vorticity model
demand thermodynamic state?**

When the target process is baroclinic vorticity, buoyancy-
driven `w` replacing prescribed `W0`, or any cold-pool
coupling. Not when the target is “name the curl of the
prescribed vortex” or “keep T1 honest.”

Kinematic vorticity diagnostics can continue at this boundary.
They cannot cross it by relabeling NG outflow.

### 10.1 Candidate F verdict

**NOT NEXT.** Boundary assessment only. Thermo remains a
model-class transition (`21` Candidate 7 / later). Do not
start it to “complete” rotation.

---

## 11. Candidate G — dataset evolution

Revisit `21` §8.E / `24` / `25` §14. Do not start dataset work.

| Candidate | Portable diagnostic formula | DEMO-specific analytic derivative | DEMO-specific `Ω` closure | Generic field/grid diagnostics |
| --- | --- | --- | --- | --- |
| **A** | `ω_y = (∇ × V)_y` | rotation’s `2 Ω G E (…)` is DEMO/synthetic | n/a if curl is of `V` | **native** on a dataset `V` |
| **B** | `ω_y ∂w/∂z` once `ω_y` and `w` exist | updraft `∂Vy/∂y` formula | if `ω_y = ω_y^{Ω}` | portable; interpretation depends on continuity of the source |
| **C** | synthetic ODE on prescribed `V` | yes | IC vs `Ω` is DEMO | **poor**; dataset owns `V(x,t)` and would not run this ODE |
| **D** | closure replacing `V` | analytic vortex / `Ω(t)` | **yes, DEMO** | inversion is a different problem; dataset already has `V` |
| **E** | same product as T1, different `w` | yes if analytic envelopes | n/a | portable if `w` and `ω_h` exist |
| **F** | needs thermo fields | n/a | n/a | dataset/model source, not this lab |
| **T1 (done)** | `ω_h · ∇_h w` | analytic `∇_h Vy` on envelope updraft | n/a | portable *inputs*; v1 class is synthetic |

**STILL-BINDING:** synthetic laboratory remains a valuable
mode even if a dataset adapter appears later (`21` §7.E).
Do not make DEMO `Ω` the meaning of `VelocityField`.

### 11.1 Candidate G verdict

**NOT NEXT.** Architecture must keep A/T1 portable *to*
datasets. G itself is not the post-T1 physics question.

---

## 12. Prescribed `Ω` is now the big question

After T1 validation, prescribed rotation is no longer “the
thing we will explain next by default.” It is an independent
kinematic mechanism that **coexists** with a couple T1 that
does not generate it.

### 12.1 Futures

| Option | Honesty | Double counting | Guided continuity | Inspector | `V_total` | Migration cost | Model class |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Ω1** Keep forever as independent prescribed mechanism | high for a mechanism lab | none in `V` | three experiments stay true | L2 `rotation` stays `V_rotation` | unchanged | none | current class |
| **Ω2** Keep as baseline while generated/evolved rotation is diagnostic | high **if** copy says baseline ≠ explanation | none in `V` (diagnostics only) | stays true | L2 unchanged; diagnostics separate | unchanged | low | current class + overlays |
| **Ω3** Reinterpret `Ω` as initial/background vortex | currently **false**: DEMO `Ω` *is* the mesocyclone-scale chimney spin, coincident with the updraft axis (`25` §8.1 option 2) | would invent a leftover role | would pressure copy | would relabel L2 | same `V` with a new story | docs/copy high; physics unchanged | claim change, not dynamics |
| **Ω4** Modulate `Ω` from diagnostic/prognostic state | low unless named parameterized | acute: T1 “explains” a knob that still is `Ω` | would falsify “prescribed spin” teaching | L2 would hide a closure inside `rotation` | `V_rotation` changes | medium, hard to unwind | L3 disguised as Ω1 |
| **Ω5** Replace `Ω` once a generated velocity closure exists | high **if** closure is named and couple-vs-cyclone is solved | solved by removal | requires copy review; not automatic “capture” | `rotation` row would be a new operand or gone | changes | high; irreversible | new class |

### 12.2 Which remain scientifically viable?

```text
NOW, with T1 closed:
  Ω1  viable
  Ω2  viable  (current honest pairing with L1 diagnostics)

NOT choosable now:
  Ω3  no leftover “background” without a new physical claim

LATER, only with an explicit model-class SoT:
  Ω4  parameterization; not “tilting physics”
  Ω5  requires D plus Ω decision; still not next
```

Do not choose Ω4/Ω5 because they are elegant. Do not choose Ω3
to make T1 look like it accounts for the chimney.

**NEW PROJECT DECISION:** T1’s validated independence from `Ω`
locks Ω1/Ω2 as the only honest pairing with further L1 work
(A, optional E, optional honest B1). Ω4/Ω5 remain OPEN for a
future L3 SoT, not chosen here.

---

## 13. Continuity YELLOW, re-evaluated

`10` remains SoT: residual YELLOW, not ε, not RED. A solver is
required only when teaching becomes mass-consistent circulation.
This checkpoint does **not** promote a continuity solver.

| Candidate | Continuity | Why |
| --- | --- | --- |
| **A** | **LIMITATION** | `curl` is well-defined kinematically. YELLOW blocks reading `ω_y^{Ω}` as a mass-consistent vortex. Not a blocker for a diagnostic API. |
| **B** | **IMPORTANT** | `∂Vy/∂y` *is* updraft divergence. Vortex-tube / “stretching by convergence” copy is false unless `∇ · V = 0`. Formula can still be written. |
| **C** | **IMPORTANT** | Advection and stretching on a divergent prescribed `V`. **PREREQUISITE** only if sold as material-tube / incompressible vorticity dynamics. |
| **D** | **PREREQUISITE** for Poisson/inversion. **IMPORTANT** for local closures (new `div`). **LIMITATION** for a div-free analytic kernel that is then added to a YELLOW sum. |
| **E** | **LIMITATION** | Same as T1: kinematic product of prescribed `w`. |
| **F** | **NOT RELEVANT** | Missing thermo is a different gap than `∇ · V`. Cold-pool later would couple both. |
| **G** | **NOT RELEVANT** as a branch | A dataset brings its own continuity; not a reason to solve YELLOW here. |

YELLOW is **not** a blocker for A. It **becomes a blocker** when
a candidate claims mass-consistent intensification, inversion
under `∇ · V = 0`, or vortex-tube conservation.

---

## 14. Time / numerics

CURRENT FACT:

```text
V_total          Eulerian-steady in DEMO
T1               instantaneous diagnostic
Simulation       Euler, DEMO dt = 0.1 s
RK2              exists, not live
```

| Candidate | Atmospheric time evolution | New timestep sensitivity | State integration | Stability questions | Revisit Euler/RK2? |
| --- | --- | --- | --- | --- | --- |
| **A** | no | no | no | no | no |
| **B** | no (snapshot rate) | no | no | no | no |
| **C** | **yes** (`ω(t)`) | **yes** | **yes** | CFL, stretching blow-up where `∂Vy/∂y > 0` | maybe for the *ω* ODE; tracer Euler remains orthogonal until D |
| **D** | only if driven by C or unsteady `V` | if coupled | if coupled | closure-dependent | **yes** if `V = V(ω(t))` (midpoint samples) |
| **E** | no | no | no | no | no |
| **F** | would, if ever | yes | yes | yes | later |
| **G** | dataset time | adapter | dataset state | source-dependent | later |

Do not switch integrators. T1 did not earn RK2. A does not
either.

---

## 15. Product value

This project is not a formula museum (`CONCEPT` §10–§13).
Visual attractiveness is not physics justification.

What the user could eventually understand:

| Capability | User understanding gained vs now | Needs |
| --- | --- | --- |
| **A** | where vertical rotation **currently exists** in `V`; that it is the painted shielded vortex, not T1’s couple | L1 diagnostic |
| T1 (done, UI not started) | where rotation **tends to be generated** (couple, ~10⁻⁵ s⁻²) | already headless; UI is product, not new physics |
| **B** | where existing vertical vorticity **would be stretched** by named `∂Vy/∂y` | named `ω_y`; honesty lock |
| **C** | how a vortex **would evolve** as a field overlay | state; still not parcel motion |
| **D** | how evolving vortex **changes parcel motion** | closure + `Ω` decision |
| **E** | tilting by downdraft / total `Vy` as extra couples | little new vs T1 |
| **F** | baroclinic / cold-pool vorticity | thermo state |
| **G** | a simulated storm’s `V`/`ω` rather than DEMO operands | source class |

Now vs CONCEPT: the user can follow prescribed pathlines and
(headlessly) sample a generation tendency. They still cannot
see current `ω_y`, cannot see stretching of a named vortex,
and cannot see generated rotation move air.

A is the only candidate that closes a **new** understanding
gap **without** a model-class jump: current vorticity vs
generation tendency.

Inspector L3 of T1 itself is a **product** candidate
(`21` Candidate 4), not a new physics capability. This
checkpoint does not order L3 UI ahead of A’s physics
question, and does not forbid a later product slice from
exposing T1 first.

---

## 16. Decision matrix

Ratings: LOW / MEDIUM / HIGH.
Ambiguous cells are explained under the table.

| | A curl `ω_y` | B stretching | C T2 `ω_y(t)` | D `ω→V` | E expand T1 | F thermo boundary | G dataset |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Scientific honesty | HIGH if labeled bookkeeping of `V` | MEDIUM as B1; LOW if sold as process | MEDIUM as teaching ODE; LOW if sold as dynamics | HIGH only if named closure + `Ω` chosen | HIGH if siblings stay named | n/a as a “do it” candidate; HIGH as a stop sign | HIGH as a later source class |
| New explanatory value | HIGH (current `ω_y` vs T1 couple) | MEDIUM after A; LOW before | HIGH overlay / LOW motion | HIGH for motion | LOW | HIGH later, zero now | HIGH later |
| Dependency on missing state | LOW | MEDIUM (`ω_y` must be named) | HIGH (new field state) | HIGH (ω and a closure) | LOW | HIGH (thermo fields) | HIGH (external `V`) |
| Model-class escalation | LOW | LOW | MEDIUM (state without dynamics) | HIGH | LOW | HIGH | HIGH (source class) |
| Continuity sensitivity | LOW–MEDIUM (interpretative) | MEDIUM–HIGH (language) | HIGH | HIGH / PREREQUISITE if inversion | LOW | LOW here | source-owned |
| Numerical complexity | LOW | LOW | HIGH | HIGH | LOW | HIGH later | adapter later |
| Double-counting risk | MEDIUM (speech: T1 vs `Ω`) | HIGH if B1 + later T1-evolved ω | HIGH vs live `Ω` | HIGH unless `Ω` removed | LOW | n/a | n/a if synthetic claims don’t travel |
| Dataset portability | HIGH (`∇ × V`) | HIGH formula / LOW if `ω_y^{Ω}` | LOW | LOW (DEMO closures) | HIGH formula | dataset-native thermo | itself |
| Product value | HIGH for “see the rotation” as current field | MEDIUM | MEDIUM overlay | HIGH for process-in-air | LOW | HIGH later | HIGH later |
| Architectural cost | LOW–MEDIUM | LOW–MEDIUM after A | HIGH | HIGH | LOW | HIGH | HIGH |
| Unlocks later work | MEDIUM (makes B honest as L1; clarifies `Ω`) | LOW (does not unlock C/D) | LOW unless D already chosen | HIGH (true causal chain) | LOW | later baroclinic | CONCEPT breadth |

Ambiguous:

- A’s double-counting is **speech**, not `V_total`. Mitigated by
  labels, not by skipping A.
- C’s “explanatory value” is high only if the user is taught
  that tracers ignore it. That teaching is fragile.
- D’s honesty is high *inside* a named class and low if slipped
  in as `Ω_eff(T1)`.

---

## 17. Dependency graph

Not a ranking. What must logically precede what.

```text
existing env diagnostics (06/08/09)
        ↓
T1  (DONE / CLOSED as headless diagnostic)
        │
        ├── sibling optional: E (downdraft / total Vy tilting)
        │         does not precede A
        │
        ├── A  named diagnostic ω_y / curl bookkeeping
        │         └── optional B (diagnostic stretching)
        │                   requires named ω_y
        │                   does not require T2
        │
        ├── C  prognostic ω_y
        │         requires: source-term policy (T1 exists),
        │                   IC policy (OPEN),
        │                   state owner (OPEN)
        │         does NOT require A, but A would make IC vs
        │         ω_y^{Ω} harder to confuse
        │         is a dead-end for tracers without D
        │
        └── D  ω → V
                  requires: Ω decision (Ω5 or documented Ω4)
                  inversion family also requires continuity stance
                  should be decided conceptually BEFORE C is built
                  not earned as next implementation
```

```text
prerequisites for A:     T1 not required mathematically;
                         T1 is the *reason A is earned now*
                         (disambiguation)

siblings:                E; Inspector L3 of T1 (product);
                         hodograph L3 of existing ω_h (product)

optional diagnostics:    B after A; T1-curl was already named
                         in 25 as supporting sibling — that is A

irreversible class:      D, Ω4, Ω5, C-as-the-meaning-of-rotation,
                         continuity solver, thermo, dataset-as-
                         replacement-for-synthetic-lab
```

Do not build C “toward” D. Decide D’s *class* first, or stay on
L1.

Thermo (F) does not sit on this graph as a next node. It sits
on a different chain (buoyancy / density / cold pool).

---

## 18. Decision

### Q1. Next PHYSICS QUESTION

**What vertical vorticity currently exists in the prescribed
velocity field, and how is that object distinct from T1’s
generation tendency?**

Sub-questions that belong inside that question, not as
separate next branches:

- is DEMO `ω_y` exactly `ω_y^{Ω}`?
- what spatial object is the shielded vortex versus T1’s couple?
- what claim would become legal if that `ω_y` were later used
  in stretching?

This is L1: learn more about the prescribed model.

### Q2. Next ARCHITECTURE QUESTION

**If a named diagnostic `ω_y` is introduced, what owner and
sampling contract keep it from becoming a `VelocityField`, an
Inspector L2 row, a default stretching operand, or a claim
that T1 generated the vortex?**

A second architecture question is **open but not next to
implement**:

**Is any `ω → V` family compatible with this laboratory, and
does that decision have to precede any prognostic `ω` state?**

Those two architecture questions are allowed to differ in time.
The first is the A SoT, now written:
`docs/architecture/28-diagnostic-vertical-vorticity-architecture.md`.
The second is a future model-class SoT.

### Q3. Next IMPLEMENTABLE capability, if any

**Diagnostic vertical vorticity / curl bookkeeping (Candidate A),
docs-first, T1-shaped: headless, `V_total` unchanged, `Ω`
unchanged, no UI required to close the physics question.**

This checkpoint did **not** write that SoT and does **not**
authorize implementation. The A architecture SoT is `28`.
Completing `28` still does **not** start code.

Inspector L3 / overlay of **already closed** T1 is a product
implementable that would not answer Q1. It is not selected here.

### Verdict

```text
NEXT DIRECTION:     A
CONFIDENCE:         HIGH
```

Why A:

- T1 validation made two rotation-adjacent objects real, and
  only one is an API.
- Algebra on the live stack says current `ω_y` is the painted
  vortex; making that inspectable is the honest next fact.
- Stretching is not earned by textbook order; it needs a named
  `ω_y` and still would not be supercell process.
- T2 without D is a state architecture for a field tracers
  ignore, on a source ~10⁻⁵ s⁻².
- D is the real causal missing step and an irreversible class
  change; it is not the next slice.
- E/F/G do not answer the post-T1 disambiguation.

Why not HYBRID:

A hybrid “A then B in the same SoT” would smuggle stretching.
A hybrid “A plus T2” would smuggle state. Next direction is A
alone.

Confidence is HIGH on the negative ranking (not B/C/D/E/F/G
as next physics implementation) and HIGH on A as the earned
L1 question. It is not a claim that A is the last kinematic
diagnostic, nor authorization to code it.

---

## 19. Documentation / authority

```text
this file:     post-T1 direction checkpoint
22 physics:    T1 derivation — CLOSED as diagnostic SoT
26 arch:       T1 architecture — CLOSED as headless capability
23 physics:    Candidate A derivation — CLOSED as diagnostic SoT
28 arch:       Candidate A architecture — WRITTEN
               IMPLEMENTATION NOT STARTED
25:            pre-T1 revalidation — historical ranking of T1
research 2026-08-20:  DEMO evidence — not a direction SoT
```

T1 remains CLOSED as the current headless diagnostic
capability. UI / Inspector / overlay of T1 remain unstarted
and are not required to keep T1 closed.

No historical reasoning in `15` / `21` / `24` / `25` is
rewritten. Successor pointers only.

---

## 20. External research

Repository reasoning was sufficient.

No literature import is required to rank A–G. Stretching vs
dilatation vs `div_h` follows from the same curl-of-momentum
split physics 22 already used for tilting, plus continuity
identities already locked in `10` / physics `15`.

If a later D SoT considers a specific inversion or
reduced-order vortex model, **stop before importing claims**
and name the exact question for verification. That is not
this checkpoint.

---

## 21. Compact lock-in

```text
T1:                         CLOSED / VALIDATED HEADLESS
                            diagnostic
                            UI NOT STARTED

T1 → ω_y(t):                NO BRIDGE
ω_y → V:                    NO BRIDGE

V_total:                    seven prescribed operands
                            UNCHANGED

prescribed Ω:               STILL ACTIVE IN V_total
                            Ω1 / Ω2 viable now
                            Ω3 not choosable now
                            Ω4 / Ω5 open for later L3 SoT

current ω_y of DEMO V:      algebraically ω_y(V_rotation)
                            no production curl API
                            physics SoT: docs/physics/23
                            architecture SoT: docs/architecture/28
                            IMPLEMENTATION NOT STARTED

continuity:                 YELLOW
                            LIMITATION for A
                            IMPORTANT for B/C
                            PREREQUISITE for inversion-class D

thermodynamics:             ABSENT
                            required for baroclinic vorticity
                            not required for A

time:                       DEMO V Eulerian-steady
                            Euler dt = 0.1 s
                            RK2 not live

next PHYSICS QUESTION:      what ω_y currently exists in V,
                            vs T1 tendency
                            (physics SoT: docs/physics/23)

next ARCHITECTURE QUESTION: named diagnostic ω_y owner
                            without L2 / stretching-by-default
                            / T1-generated-vortex claims
                            ANSWERED in docs/architecture/28
                            still not an implementation order

next IMPLEMENTABLE:         Candidate A, docs-first
                            architecture SoT: docs/architecture/28
                            NOT authorized here
                            IMPLEMENTATION NOT STARTED

NEXT DIRECTION:             A
confidence:                 HIGH

PHYSICS IMPLEMENTATION
FROM THIS FILE:             NONE
```

---

## 22. STOP

```text
POST-T1 PHYSICS DIRECTION
  DECIDED AS A CHECKPOINT
  NOT AN IMPLEMENTATION ORDER

NEXT DIRECTION
  A — DIAGNOSTIC VERTICAL VORTICITY / CURL BOOKKEEPING

CANDIDATE A PHYSICS
  docs/physics/23-diagnostic-vertical-vorticity.md
  WRITTEN / CLOSED as derivation

CANDIDATE A ARCHITECTURE
  docs/architecture/28-diagnostic-vertical-vorticity-architecture.md
  WRITTEN
  IMPLEMENTATION NOT STARTED
  NOT AUTHORIZED BY THIS FILE

NOT NEXT
  B stretching
  C T2 prognostic ω_y
  D ω → V closure
  E expand T1 sources
  F thermo / baroclinic
  G dataset

T1
  REMAINS CLOSED AS HEADLESS DIAGNOSTIC

PRESCRIBED Ω
  REMAINS THE ROTATION OPERAND
  NOT RELABELED AS TILTING

VORTICITY → VELOCITY
  STILL NO BRIDGE

CONTINUITY
  STILL YELLOW
  NOT A SOLVER BRANCH
```

Curl, stretching, T2, ω state, grid, closure,
Ω changes, continuity, RK2, thermo, dataset, Inspector, and
visualization implementation are out of scope for this SoT.
