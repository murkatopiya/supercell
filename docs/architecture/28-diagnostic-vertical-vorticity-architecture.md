# Diagnostic Current World-Vertical Vorticity Architecture

**Status:** ARCHITECTURE SoT
Candidate A — diagnostic current world-vertical vorticity
IMPLEMENTATION NOT STARTED
**Scope:** ownership, sampling, analytic-vs-numeric evaluation,
source-field relation, composition wiring, observation
boundaries, tests, slices
**Physics:** `docs/physics/23-diagnostic-vertical-vorticity.md`
(authoritative derivation; not reopened here)
**Direction checkpoint:**
`docs/architecture/27-post-t1-physics-direction-checkpoint.md`
**T1 sibling architecture (different quantity, different units):**
`docs/architecture/26-diagnostic-tilting-tendency-architecture.md`
**Rotation velocity occupant (not this diagnostic):**
`docs/physics/18-vertical-rotation-envelope.md`

```text
V_total:                 UNCHANGED
prescribed rotation Ω:   UNCHANGED
prognostic ω:            NOT INTRODUCED
stretching:              NOT INTRODUCED
T2:                      PARKED
eighth VelocityField:    NOT INTRODUCED
vorticity → velocity:    NOT INTRODUCED
curl() on VelocityField: NOT INTRODUCED
full vector curl:        NOT INTRODUCED
Inspector L2:            UNCHANGED
visualization tint:      UNCHANGED
```

This document owns Candidate A *architecture*. Physics 23 owns
the quantity `ω_y,current`. Completing this file does **not**
start implementation.

Keep these roles distinct:

```text
CURRENT FACT
STILL-BINDING CONTRACT
NEW PROJECT DECISION
REJECTED ALTERNATIVE
CURRENT STACK IDENTITY
DEFERRED
```

---

## 1. Purpose

This document answers:

    Where does Candidate A live, what does it sample, which
    live instance evaluates it, and how is it kept out of
    V_total / Inspector Level 2 / visualization tint / T1?

It does **not** re-derive

    ω_y = ∂Vx/∂z − ∂Vz/∂x
    ω_y^Ω = 2 Ω G E (1 − r² / (2 σ²))

Those identities, the shielded-vortex radial structure, the
seven-operand CURRENT STACK IDENTITY, and the anti-claims
remain in physics 23.

---

## 2. Semantic boundary

**NEW PROJECT DECISION.**

Candidate A is a **model diagnostic**. It is not a
`VelocityField`.

Conceptual shape, matching live composition (two named
diagnostic siblings; no bag type):

```text
model composition
    ├── canonical V_total
    ├── named velocity operands     → velocityObservation
    ├── T_tilt,y                    → DiagnosticTiltingTendency
    └── ω_y,current                 → DiagnosticVerticalVorticity
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
NOT T1
NOT prognostic ω
NOT stretching state
NOT a render object
```

`velocityObservation.parts` remains exactly the contributors to
`V_total`. `ω_y,current` answers a different question:

    what world-vertical vorticity currently exists in V_total?

It must not appear as “why this tracer moves.”

---

## 3. Canonical owner

**Chosen:** `DiagnosticVerticalVorticity`

Intended module (implementation, not created by this file):

```text
src/physics/diagnostics/DiagnosticVerticalVorticity.ts
```

It sits beside `DiagnosticTiltingTendency` in `diagnostics/`.
That folder is still **not** a generic diagnostics framework.

Conceptual capability:

```text
sample(position: Vec3, time: number) → number
```

Units of the returned number: `s⁻¹`. Documented in JSDoc / type
comment. No runtime unit object.

The value is **signed**. Magnitude-only APIs are forbidden.
No `abs`, no clamp, no display normalization.

No `tracerId`, `Particle`, selection, Inspector DTO, or render
payload on this type.

The diagnostic must be usable **headlessly**.

It has **no clock**. Laboratory `t` is an input.

---

## 4. Ownership matrix

### 4.1 A. Concrete rotation method + thin total diagnostic sibling

```text
VerticalEnvelopeRotationField.worldVerticalVorticity(P, t) → number
  analytic ω_y of THIS rotation occupant

new DiagnosticVerticalVorticity({
  rotation: VerticalEnvelopeRotationField,
})
  sample(P, t) → ω_y,current of the canonical model
```

The diagnostic holds the **same** live rotation instance that
is already an operand of `V_total`. CURRENT evaluation of
total `ω_y` is the analytic rotation contribution, because
physics 23 proved the other six DEMO operands contribute
identically zero.

**Fits:** SAME-source, T1-shaped, testable without a lab,
honest total semantics with a named CURRENT evaluator.

### 4.2 B. Standalone `DiagnosticVerticalVorticity(rotationField)` only

No method on the rotation field. The diagnostic copies or
re-derives `Ω`, `σ`, center, `G(y)` from a DTO, or duplicates
the formula privately.

**Rejected for v1.** Either it duplicates live field parameters
(SAME-source hole) or it must reach into private field state
anyway. T1 already showed the cheaper lock: analytic formula
on the concrete occupant, diagnostic type as the product owner.

### 4.3 C. Generic `VerticalVorticityDiagnostic(source: VelocityField)`

Finite-difference or `curl()` over an arbitrary field.

**Rejected for v1.** Premature abstraction. Would put calculus
on `VelocityField` or invent a derivative engine. Physics 23
and checkpoint 27 forbid `curl()` on the base interface.
Dataset future is a different owner, not a generic now
(`§23`).

### 4.4 D. Composition-level closure / factory-only

A function closed over DEMO fields, no named type.

**Rejected.** Same reasons as T1 architecture 26 §4.3: harder
to test, easy to call `createRotationField(DEMO_SCENARIO)` a
second time, poor discoverability next to
`InspectableVelocityOperands` and `DiagnosticTiltingTendency`.

### 4.5 Other rejected placements

| Placement | Why not v1 |
| --- | --- |
| Method on `VelocityField` | Turns every field into a curl surface. Live interface is `sample → Vec3` only. |
| Method on `CompositeVelocityField` | Compositor is an unweighted sum. It does not own diagnostics (`12`, live class). |
| `InspectableVelocityPart` / `parts` row | That object’s parts are `VelocityField`s. Putting `ω_y` there teaches “why this motion.” |
| Method on `RotationField` (height-independent) | Live DEMO occupant is `VerticalEnvelopeRotationField` (`createRotationField`). Isolated `13` is not Candidate A’s source. |
| Simulation-owned diagnostic | Simulation is a tracer stepper. No `ω` to reset. |
| T1 method / field on `DiagnosticTiltingTendency` | Different quantity, different units, different inputs. |

### 4.6 Recommendation

**A.** Concrete analytic method on
`VerticalEnvelopeRotationField`, plus thin
`DiagnosticVerticalVorticity` constructed from that **same**
instance `composeDemoTracerFields` already creates.

---

## 5. Total vs rotation — semantic target

Physics 23 established two conceptually different diagnostics
that are **numerically equal on the CURRENT stack**:

```text
ω_y(V_rotation)     curl of the rotation operand alone
ω_y(V_total)        curl of the laboratory sum
```

CURRENT STACK IDENTITY, not a universal law:

```text
ω_y(V_total) = ω_y(V_rotation)
```

### 5.1 Options

| Option | Public meaning | Honesty risk |
| --- | --- | --- |
| **A** | total `ω_y,current`; v1 evaluator is analytic rotation | low if CURRENT identity is labeled |
| **B** | rotation-specific `ω_y(V_rotation)` only | names the evaluator, not the product question |
| **C** | generic over arbitrary `VelocityField` | premature; invites FD/`curl()` |
| **D** | runtime `{ total, per-operand }` | overdesign; UI-shaped |
| **E** | other | — |

### 5.2 Decision

**NEW PROJECT DECISION: Option A.**

Candidate A v1 **owns**

```text
ω_y,current(P, t) := ω_y(V_total)
```

That is the product/scientific question checkpoint 27 earned:

    what vertical vorticity exists in current V_total?

It does **not** own a type whose name means “rotation curl
forever.”

v1 **evaluates** that total by the analytic rotation
contribution, because that is the only nonzero term on the
locked seven-operand stack.

Do **not** hardcode the CURRENT equality as a universal API
law. Tests that “changing non-rotation operands leaves
`ω_y,current` unchanged” must be labeled
**CURRENT-stack-specific**, not a contract of the type name.

### 5.3 Rejected alternatives, briefly

**B** would be honest as an occupant diagnostic and a lie as
the Candidate A question. A later azimuthal inflow, or a
dataset `V`, would split `ω_y(V_total)` from
`ω_y(V_rotation)` while the public name still said “rotation.”

**C** is a framework for one synthetic occupant.

**D** is provenance UI. Candidate A does not require a
decomposition object at runtime (`§10`).

---

## 6. Exact dependencies

Candidate A v1 depends on:

```text
VerticalEnvelopeRotationField
  (analytic worldVerticalVorticity; §8)
Vec3
laboratory time t (passed through; diagnostic has no clock)
```

Candidate A v1 must **not** depend on:

```text
CompositeVelocityField          (as a runtime input)
EnvironmentalWindProfile
verticalWindShearBetween / horizontalVorticityFromShear
VerticalEnvelopeUpdraftField
DiagnosticTiltingTendency
IntegrationFrame / StormMotion / C
StormRelativeEnvironmentalAdvectionField
lower inflow, upper outflow, downdraft, near-ground outflow
Simulation / tracers
TracerInspection / TracerSelection
VisualAirflowPopulation / comet tint
ScenarioConfig as a runtime input of sample()
VelocityField.curl / derivative
```

`ScenarioConfig` remains the composition DTO. Factories already
map `storm.rotation` to `VerticalEnvelopeRotationField`.
Candidate A consumes that object, not a second copy of the DTO.

Core diagnostic modules must not import T1 except in tests that
prove independence.

---

## 7. Analytic vs numerical

### 7.1 Options

| Option | Exact zeros / sign ring | Cost now | Dataset later |
| --- | --- | --- | --- |
| **A** exact analytic on `VerticalEnvelopeRotationField` | yes | low | different owner |
| **B** finite-difference curl of `V_total` | smears `r = σ √2` and lids | medium; epsilon artifacts | native-ish, wrong for DEMO |
| **C** analytic per-operand contributions summed | same as A today (six zeros + one formula) | extra types for zeros | still synthetic |
| **D** mixed analytic + FD fallback | two paths, two tolerances | high | “for future” |

### 7.2 Decision

**NEW PROJECT DECISION for v1: ANALYTIC (option A).**

Physics 23 already gives a closed form. Exact axis value
`2ΩG`, exact lids `0`, exact factor `(1 − r²/(2σ²))`, and the
opposite-sign outer ring are test contracts. Finite differences
would smear the zero ring and force tolerances at compact lids.

v1 has **one** production evaluation path. No analytic-or-FD
branch. Do not add a finite-difference fallback “for future.”

Option C (sum of seven analytic contributions) is mathematically
the linearity identity. It is not worth seven extra APIs when
six contributions are identically zero. Migration, when a
second operand becomes nonzero, is to add that operand’s
analytic (or later numerical) contribution into the **total**
owner (`§15`). Not now.

### 7.3 CURRENT FACT that must not become a silent FD surprise

On locked formulas, purely radial axisymmetric inflow/outflow
have `ω_y = 0` by mixed-derivative cancellation (physics 23
§9). Architecture must not “discover” a numerical curl of
those operands. If a later field adds `V_θ`, that is a new
derivation, not an FD bugfix of Candidate A v1.

---

## 8. Concrete rotation capability

**NEW PROJECT DECISION.**

A method on the **concrete**
`VerticalEnvelopeRotationField`, **not** on `VelocityField`:

```text
worldVerticalVorticity(position: Vec3, time: number) → number
  // ω_y of THIS field; s⁻¹; signed
```

Name locks world-vertical `ω_y`, not textbook `ω_z`.

Do **not** add this method in the architecture pass. This
section specifies it for a later implementation command.

### 8.1 Contract of the method

```text
same Ω, σ, centerX, centerZ, G(y) as sample()
no copied DTO
time-capable signature; current field ignores t
signed scalar, not Vec3
not a curl vector
not VelocityField.curl
```

Formula (physics 23; not re-derived):

```text
ω_y^Ω = 2 Ω G E (1 − r² / (2 σ²))
E     = exp(−r² / (2 σ²))
G(y)  = sin(π (y − y_b) / H)   on the open layer
      = 0                      on the closed exterior, including lids
```

`G'(y)` does **not** enter. Horizontal vorticity from the
envelope window (physics 18 §18.3) is out of Candidate A
scope.

### 8.2 Lid / exterior exact-zero policy

**NEW PROJECT DECISION**, matching the updraft-gradient
precedent (`VerticalEnvelopeUpdraftField.horizontalGradientOfVerticalVelocity`):

```text
y <= baseHeight  or  y >= topHeight
  →  return +0 exactly
  →  do not evaluate sin(π ξ)
```

`Math.sin(Math.PI)` at the upper lid is a tiny IEEE residual.
That residual must not leak a fake `ω_y`.

CURRENT FACT: live `sample()` uses an open exterior
(`y < baseHeight || y > topHeight`) and therefore can carry a
`sin(π)` residual in `V` at `y = topHeight`. Candidate A must
**not** inherit that as diagnostic truth. Lid `ω_y` is exact
`0` by physics 23 §14. Do **not** change `sample()` or
`V_total` to “fix” this in Candidate A slices.

Canonicalize exact zeros to `+0` (T1 / rotation `sample`
precedent). Preserve sign of nonzero values. Do not hide the
outer-ring sign reversal.

### 8.3 Why not a separate adapter

An adapter constructed from `ScenarioRotation` would copy
`Ω`, `σ`, center, lids. The method on the field *is* the
SAME-source guarantee: live `rotationField` is the vorticity
source.

### 8.4 Height-independent `RotationField`

Do **not** add `worldVerticalVorticity` there in Candidate A
v1. Isolated `13` is not the DEMO occupant.

---

## 9. Total diagnostic strategy

**NEW PROJECT DECISION.**

```text
new DiagnosticVerticalVorticity({
  rotation: VerticalEnvelopeRotationField,
})
```

`sample(P, t)` forwards to
`rotation.worldVerticalVorticity(P, t)` and returns that
number as `ω_y,current`.

This is **not** a claim that total curl equals rotation curl
in every future model. It is the CURRENT analytic evaluator of
the total diagnostic.

Rejected total-owner shapes for v1:

| Shape | Why not v1 |
| --- | --- |
| Receives `CompositeVelocityField` and FD-curls it | numerical; compositor owns velocity sum, not curl |
| Receives a list of analytic contributors | framework for one contributor |
| Receives a decomposition DTO | provenance object; `§10` |
| Rebuilds fields from `DEMO_SCENARIO` | SAME-source hole |
| Source-regex over `parts` keys | brittle; Inspector-shaped |

Expose the injected instance for identity tests, matching T1:

```text
readonly rotation: VerticalEnvelopeRotationField
```

Do not return internal mutable field state. The rotation field
is already caller-owned.

---

## 10. Provenance

CURRENT total equals the rotation contribution. Architecture
must preserve **conceptual** provenance without overdesigning
the runtime.

**NEW PROJECT DECISION:** API v1 returns a **plain signed
`number`**.

Provenance is locked by:

- type/JSDoc: public meaning is `ω_y(V_total)`;
- injected `rotation` reference: SAME-source;
- physics 23 + tests: CURRENT STACK IDENTITY;
- CURRENT-stack-specific independence tests, explicitly labeled.

Candidate A does **not** require a runtime

```text
{ total, contributions? }
```

A later product slice may add operand attribution. That is not
v1. Do not implement a decomposition UI.

---

## 11. Sampling contract

```text
DiagnosticVerticalVorticity.sample(position, time) → ω_y,current
```

| Input | Meaning |
| --- | --- |
| `position` | world `P = (x, y, z)` meters |
| `time` | laboratory time, same clock tracers use |

| Output | Meaning |
| --- | --- |
| `number` | signed `ω_y,current` in `s⁻¹` |

Algorithm (conceptual):

```text
if P or t is not finite → throw DiagnosticVerticalVorticityError
return rotation.worldVerticalVorticity(P, t)
```

Repeatable: same instance, same `(P, t)` ⇒ same number.
No mutation of the rotation field or caller vectors.

The diagnostic does not own a clock. It observes `t`.

---

## 12. Time semantics

**CURRENT FACT:** `VelocityField.sample(P, t)` is time-capable;
live DEMO storm operands ignore `t`.

Candidate A today:

```text
ω_y,current(P, t)   independent of t numerically
```

The API still **accepts** `t` and **forwards** it to
`worldVerticalVorticity`. Do not add `sample(P)` without time.

If the concrete analytic method accepts time and ignores it
now, that is acceptable. A future unsteady rotation source can
participate without an API break.

---

## 13. Domain / lids / outer ring

Candidate A is a scalar field on all finite world points.
Zero is a value, not inactivity.

| Request | Result |
| --- | --- |
| Non-finite `P` or `t` | **Error** (`DiagnosticVerticalVorticityError`) |
| Outside `[y_b, y_t]` | **exact 0** |
| Lids `y = y_b`, `y = y_t` | **exact 0** (closed-interval policy, `§8.2`) |
| Axis `r = 0`, interior | `2 Ω G(y)` |
| `r = σ`, interior | `Ω G exp(−1/2)` |
| `r² = 2 σ²`, interior | **0** (zero ring) |
| `r > σ √2`, interior | sign opposite the core |
| Far field `r → ∞` | `→ 0` (`E → 0`) |
| `Ω = 0` | **0** everywhere |
| `Ω → −Ω` | entire field reverses |

Do **not** hide the outer opposite-sign ring. It is the
shielded Gaussian vortex (physics 23 §13), not a rear-flank
couple and not T1.

Zero-ring tests should construct `r² = 2 σ²` exactly when
possible (`dx² + dz² = 2 * sigma * sigma`). A point placed at
`r = σ √2` via `Math.sqrt(2)` may need a documented tight
tolerance; that is a test construction issue, not a license
to smear the production formula.

Do not map `ω_y = 0` onto tracer `active === false` or glyph
hiding.

---

## 14. SAME-source invariant

**STILL-BINDING.**

The diagnostic must use the SAME live
`VerticalEnvelopeRotationField` instance that contributes to
`V_total`.

Forbidden:

```text
createRotationField(DEMO_SCENARIO) inside the diagnostic
copy Ω / σ / center / vertical envelope params
a second VerticalEnvelopeRotationField built from the DTO
```

Testable reference identity:

```text
composeDemoTracersWithObservation(...).currentVerticalVorticity.rotation
  === composeDemoTracerFields(...).rotationField
```

and that instance is the `rotation` operand of
`velocityObservation.parts` and of the composite.

`composeDemoTracerFields` already returns `rotationField`.
`composeDemoTracersWithObservation` must not drop that binding
the way it once dropped the T1 profile.

---

## 15. Total stack identity and migration

Encode CURRENT fact without fossilizing it.

```text
CURRENT
  ω_y(V_total) = ω_y(V_rotation)
  DiagnosticVerticalVorticity.sample uses the rotation method

FUTURE
  not guaranteed
  another operand, or a dataset V, may contribute nonzero ω_y
```

### 15.1 Migration story (not implemented)

If later another operand contributes nonzero world-vertical
curl:

1. Public `sample()` still returns **total** `ω_y,current`.
2. The type name remains honest.
3. Evaluator expands: sum analytic (or later named) contributions,
   or replace the synthetic owner with a dataset owner.
4. CURRENT-stack tests that “non-rotation operands do not
   change `ω_y`” are **retired or relabeled**, not treated as
   API law.
5. Do not keep a silent `return rotation.worldVerticalVorticity`
   after that physics change.

Do not implement a contributor registry now.

---

## 16. Composition wiring

**NEW PROJECT DECISION.**

Application/model composition creates canonical physics
instances **once** and constructs Candidate A from the live
rotation instance in the same pass as T1.

Required wiring (repository-consistent with live
`composeDemoTracersWithObservation`):

```text
composed = composeDemoTracerFields(frame)
  rotationField, updraftField, profile, …operands, field

tiltingTendency = new DiagnosticTiltingTendency({
  profile: composed.profile,
  updraft: composed.updraftField,
})

currentVerticalVorticity = new DiagnosticVerticalVorticity({
  rotation: composed.rotationField,
})

velocityObservation = demoInspectableVelocityOperands(composed)
Simulation(velocityObservation.total, …)
```

Return shape:

```text
{
  simulation,
  velocityObservation,
  integrator,
  tiltingTendency,
  currentVerticalVorticity,
}
```

No entry in `velocityObservation.parts`.
No change to operand count or order (still seven).
No Simulation ownership.

`IntegrationFrame` continues to wrap only the environmental
**velocity** operand. It is not a Candidate A input. Constant
`C` does not enter the diagnostic. Storm-relative vs
ground-relative labs therefore share `ω_y,current` for the
same rotation instance — `C`-invariance obtained structurally.

Do not construct Candidate A from a second
`createRotationField` in the lab factories.

A `ModelDiagnostics` bag type is **not** required. T1
architecture 26 allowed a bag “if a second diagnostic is
earned.” Two named siblings are enough. A bag would be a
convenience wrapper without behavior.

### 16.1 Lab exposure

```text
ExploreLab.currentVerticalVorticity
GuidedLab.currentVerticalVorticity
```

Sibling of `velocityObservation` and of `tiltingTendency`,
not a field inside either.

---

## 17. Explore / Guided

If wired (Slice 2):

```text
same canonical rotation instance family
same (P, t)
  → ExploreLab.currentVerticalVorticity.sample
    === GuidedLab.currentVerticalVorticity.sample
```

Shared model diagnostic. Guided pedagogy / experiment id
changes seeds and copy, not Candidate A physics.

| Event | Candidate A |
| --- | --- |
| Explore / Guided Reset | Same diagnostic instance. Nothing to restore. |
| Guided experiment switch | New lab ⇒ new instance from a new composition pass. No diagnostic session to clear. |
| Explore ↔ Guided | Each lab has its own instances; both wired from the same composition helper. |
| Pause / clock | No freeze state. Sample at the laboratory `t` the caller supplies. |

Do not store last-sampled `ω_y` on the diagnostic.

No UI in Candidate A implementation.

---

## 18. Relation to T1

T1 (`22`, `26`):

```text
T_tilt,y = ω_h^{env,world} · ∇_h Vy_updraft
units s⁻²
owner DiagnosticTiltingTendency
depends on profile + updraft
independent of Ω
```

Candidate A (`23`, this file):

```text
ω_y,current = (∇ × V_total)_y
units s⁻¹
owner DiagnosticVerticalVorticity
depends on live rotation occupant
independent of environmental shear and of W0
```

**STILL-BINDING:**

```text
T_tilt,y  [s⁻²]  ≠  ω_y,current  [s⁻¹]
```

Separate owners. No automatic:

```text
integration of T1 into ω_y
comparison object
causal link
generatedByTilting
```

They may later be sampled at the same `P`. Neither owns the
other. Changing `Ω` changes Candidate A and leaves T1
unchanged. Changing the sounding or `W0` changes T1 and leaves
Candidate A unchanged. That independence is the
double-counting guard.

T1 remains CLOSED as a headless diagnostic. Candidate A must
not modify T1 modules, T1 tests’ meaning, or T1 wiring except
to add a sibling property beside it.

---

## 19. Stretching boundary

Do **not** add stretching.

Architecture must keep a named `ω_y,current` so a later
document *could* write

```text
T_stretch,y = ω_y,current * ∂Vy/∂y
```

as an honest diagnostic of **prescribed-vortex strain**.

Legal / illegal wording remains physics 23 §18 / checkpoint
27 §5.8. In particular:

```text
LEGAL later
  stretching tendency of CURRENT PRESCRIBED world-vertical
  vorticity by a named ∂Vy/∂y
  V_total unchanged
  T1 did not create this ω_y

ILLEGAL later
  stretching of T1-generated vorticity
  Ω_eff = Ω (1 + α ∂Vy/∂y)
```

No `StretchingDiagnostic` now. Continuity remains YELLOW:
do not silently replace `∂Vy/∂y` by `−div_h`.

---

## 20. Inspector

Current Inspector (`19`):

```text
Level 1  motion
Level 2  why this velocity — V_i
Level 3  reserved; not implemented
```

Candidate A does **not** answer Level 1/2. The `rotation` L2
row is `V_rotation` in m s⁻¹, not `ω_y`.

**NEW PROJECT DECISION:** Candidate A implementation does
**not** change `TracerInspection` and does **not** start
Level 3.

Possible future (not designed here): Level 3 / diagnostic
context could sample

```text
lab.currentVerticalVorticity.sample(selected.position, time)
```

Architecture of Candidate A is that sampling port. Inspector
does not own Candidate A.

`TracerInspection` v1 remains untouched unless a later
explicit product slice authorizes it.

---

## 21. Visualization

Visual airflow observes `velocityObservation.total`. Operand
tint is `|V_i|` of velocity contributions
(`operandContributionDisplay`).

Candidate A is a **signed** scalar with a shielded core/ring.
It must **not** reuse comet operand tint.

No overlay, signed color scale, or Eulerian slice is in
Candidate A implementation. The sample API is spatially
queryable so a later overlay *could* exist without changing
the owner.

Background highlight remains REJECTED (`24`).

---

## 22. Full curl

Physics 23 verdict: **VERTICAL ONLY.**

Architecture must not create:

```text
CurlVector
VorticityVector
Jacobian
GradientTensor
VelocityField.curl
VelocityField.derivative
```

Candidate A is implementable as a signed scalar identity on
the rotation occupant. Full curl of the seven-operand mix
(env `ω_h`, updraft/downdraft `ω_h`, rotation lid `G'`, …)
is a **different** diagnostic and remains deferred.

---

## 23. Continuity

YELLOW (`10`) is a **limitation**, not a blocker.

Architecture must not require divergence, a mass budget, or a
solver.

Nonzero `ω_y,current` is **not** a mass-consistent vortex.
Isolated rotation is divergence-free (physics 18); the
seven-operand sum is not. Curl of the rotation operand does
not upgrade the composite.

---

## 24. Dataset seam

Definition remains portable:

```text
ω_y = (curl V)_y = ∂Vx/∂z − ∂Vz/∂x
```

Synthetic v1 evaluator: analytic `ω_y^Ω` on
`VerticalEnvelopeRotationField`.

A future dataset could provide velocity derivatives, a curl
volume, finite differences, or precomputed vorticity. That is
a **different owner**, not a second path inside this v1 type.

Do not build a dataset interface now.
Do not hardcode `DEMO_SCENARIO` numbers inside the diagnostic
type. DEMO numbers enter only through composition, as they
already do for fields.

Do not make DEMO `Ω` the meaning of `VelocityField`.

---

## 25. Future implementation tests

### 25.1 Physics (physics 23 sanity, now as tests)

On the concrete rotation method and/or the total diagnostic
(they must match on CURRENT stack):

```text
Ω = 0                         → 0 everywhere
axis, interior                → 2 Ω G(y)
r = σ, interior               → Ω G exp(−1/2)
r² = 2 σ², interior           → 0
r > σ √2, interior            → sign opposite the core
Ω → −Ω                        → entire field reverses
lids / outside layer          → exact 0
far field                     → → 0
time-invariance, current field
signed value preserved
no abs / clamp
```

Axis at `y_mid`: `2 Ω`. DEMO illustration `2 Ω = 0.01 s⁻¹` is
physics 23 §22, not a retune.

### 25.2 Architecture

```text
DiagnosticVerticalVorticity does not implement VelocityField
worldVerticalVorticity is not on the VelocityField interface
not in CompositeVelocityField operand lists
not in velocityObservation.parts
parts length still 7; keys unchanged
SAME rotation instance as composeDemoTracerFields().rotationField
V_total sampling unchanged (same operand instances)
T1 owner / sample unchanged
TracerInspection source does not mention Candidate A
visualization / comet tint source does not mention Candidate A
Explore and Guided equal at the same P, t
Reset does not replace the diagnostic instance
switch Guided experiment → fresh owner
constant C / IntegrationFrame → ω_y unchanged (structural)
core module does not import Inspector or visualization
```

### 25.3 CURRENT-stack-specific (must be labeled)

```text
changes to non-rotation operands
  (env, C, updraft W0, inflow/outflow A, downdraft)
  do not change current ω_y
```

This is **not** a universal API law. It is a CURRENT
seven-operand identity test. Title/comment must say so.

Storm motion `C` is irrelevant to Candidate A both as CURRENT
algebra (`curl(C) = 0`) and as architecture (diagnostic does
not accept `C`).

### 25.4 Independence from T1

```text
same rotation, different profile / W0
  → ω_y,current unchanged
same profile / updraft, different Ω
  → T_tilt,y unchanged  (existing T1 tests; do not weaken)
```

---

## 26. Scientific validation plan

After headless implementation, a short research slice
analogous to T1
(`docs/research/2026-08-20-t1-demo-field-validation.md`).

Not UI. Not an overlay. Not a retune.

Need to verify on live `DEMO_SCENARIO` instances:

```text
central positive core (Ω > 0)
zero ring at r = σ √2 (G ≠ 0)
outer opposite-sign annulus
vertical envelope scaling (lids 0; peak on axis at y_mid)
exact order of magnitude ~ 1e-2 s⁻¹ on axis at G = 1
independence from T1 / shear / updraft
CURRENT STACK: sample() equals rotation.worldVerticalVorticity
```

Canonical sources from `composeDemoTracerFields`, not a second
DTO. Suggested record: research markdown + optional headless
sampler script / artifacts, same class as T1 validation.

UI is not required to close the physics question.

---

## 27. Implementation slices

Implementation is **not** started by this file. When commanded:

### Slice 1 — analytic rotation `ω_y`

`VerticalEnvelopeRotationField.worldVerticalVorticity`.
Isolated tests (`§25.1` on the field). No diagnostic type.
`VelocityField` interface unchanged. `sample()` unchanged.
No composition change.

### Slice 2 — total diagnostic + canonical wiring

`DiagnosticVerticalVorticity`, composition sibling,
Explore/Guided exposure, tests `§25.2`–`§25.4`.

Headless. `V_total` and tracer motion unchanged by
construction. UI / Inspector / visualization not started.

### Slice 3 — scientific DEMO validation, no UI

Research-only inspection analogous to T1. Does not add
Inspector L3 or an overlay.

Headless **capability** is implemented after Slice 2.
Treating Candidate A as scientifically CLOSED / VALIDATED
HEADLESS, in the T1 sense, waits for Slice 3.

Do not merge Slice 1 into Slice 2 unless a later
implementation command says so. Isolated analytic zeros are
the cheaper lock before composition wiring.

No UI slice.

---

## 28. Completion criterion

Candidate A **headless capability** is complete when, for
arbitrary finite valid `(P, t)`:

```text
1. sample returns signed ω_y,current in s⁻¹
2. canonical live VerticalEnvelopeRotationField is the source
3. value matches analytic current-stack ω_y^Ω
4. zero crossing / sign structure preserved (core, ring, lids)
5. V_total and tracer integration are unchanged
6. remains a separate owner from T1
7. Explore and Guided expose that same diagnostic capability
```

**UI is not a completion criterion.**

---

## 29. Parked / non-goals

Do not design or implement in Candidate A slices:

```text
stretching / StretchingDiagnostic
T2 / prognostic ω_y
ω → V bridge
Ω modulation / replacement
full curl / Jacobian / GradientTensor
finite-difference engine
continuity solver
RK2 as a Candidate A consequence
baroclinic physics
Inspector Level 3
signed overlay / Eulerian slice
dataset loader
generic vector-calculus framework
VelocityField.curl / derivative
ModelDiagnostics bag
runtime { total, contributions } DTO
eighth operand
caching
ScenarioConfig Candidate A parameters
```

---

## 30. Decision output

### A. Canonical architecture owner

`DiagnosticVerticalVorticity` in `src/physics/diagnostics/`.
Not a `VelocityField`.

### B. Semantic target

**Total:** `ω_y,current := ω_y(V_total)`.
v1 evaluator: analytic `ω_y(V_rotation)` under the CURRENT
STACK IDENTITY. Not a rotation-forever type name.

### C. Exact dependencies

Live `VerticalEnvelopeRotationField` only. See §6.

### D. Analytic / numerical

**ANALYTIC** on the concrete rotation type. No FD fallback.
§7.

### E. Concrete rotation capability

`worldVerticalVorticity(position, time) → number` on
`VerticalEnvelopeRotationField`. Not on `VelocityField`.
Not added by this file. §8.

### F. Total diagnostic strategy

Thin owner constructed from the SAME rotation instance;
`sample` delegates to the analytic method. §9.

### G. Provenance

Plain signed `number`. Conceptual provenance via docs, JSDoc,
injected reference, and labeled CURRENT-stack tests.
No contribution DTO. §10.

### H. Sampling contract

`sample(position, time) → number` (`s⁻¹`, signed). §11.

### I. Composition wiring

Same pass as `composeDemoTracerFields`; sibling
`currentVerticalVorticity` next to `tiltingTendency`.
Not a `parts` entry. §16.

### J. Explore / Guided exposure

`ExploreLab.currentVerticalVorticity` /
`GuidedLab.currentVerticalVorticity`. Shared model diagnostic.
Reset stateless. Switch ⇒ fresh owner. §17.

### K. T1 boundary

Separate owners, units, inputs. No arrow either way. §18.

### L. Inspector boundary

Not L2. `TracerInspection` v1 untouched. L3 not started. §20.

### M. Visualization boundary

Does not consume Candidate A. Do not reuse comet `|V_i|` tint.
§21.

### N. Dataset seam

Definition `(curl V)_y` portable; v1 evaluator synthetic.
No dataset API. §24.

### O. Implementation slices

Slice 1 field method; Slice 2 diagnostic + wiring; Slice 3
scientific DEMO validation. No UI slice. §27.

### P. Completion criterion

Headless sample of signed `ω_y,current` from canonical sources,
structure preserved, `V_total`/T1/Inspector/visualization
unchanged. UI not required. §28.

### Q. Blockers

**None.**

Physics 23 is CLOSED. Live stack matches: seven prescribed
operands, T1 already a diagnostic sibling, DEMO rotation is
`VerticalEnvelopeRotationField`, `VelocityField` is
`sample → Vec3` only.

This file still does **not** start implementation. A later
explicit command is required for Slice 1.

Continuity YELLOW is not a blocker.

---

## 31. Compact lock-in

```text
owner:              DiagnosticVerticalVorticity
kind:               model diagnostic, not VelocityField
semantics:          ω_y,current := ω_y(V_total)   [s⁻¹]
evaluator v1:       analytic ω_y(V_rotation)
CURRENT STACK:      identity, not a law
sample:             (P, t) → signed number
rotation method:    worldVerticalVorticity on
                    VerticalEnvelopeRotationField
                    not on VelocityField
lids:               exact 0 on closed interval
SAME source:        composeDemoTracerFields().rotationField
labs:               currentVerticalVorticity sibling of
                    velocityObservation and tiltingTendency
parts:              still seven V_i
T1:                 separate; s⁻²; no arrow
Inspector:          L1/L2 unchanged; L3 not started
visualization:      does not consume Candidate A
C / W0 / inflow:    CURRENT-stack independent of ω_y
state:              none
UI completion:      not required
implementation:     NOT STARTED
                    this file does not authorize code
```

---

## 32. STOP

```text
CANDIDATE A PHYSICS
  docs/physics/23
  CLOSED as derivation

CANDIDATE A ARCHITECTURE
  THIS FILE
  WRITTEN
  IMPLEMENTATION NOT STARTED
  NOT AUTHORIZED BY THIS FILE

T1
  REMAINS CLOSED AS HEADLESS DIAGNOSTIC

STRETCHING / T2 / ω→V / Ω / V_total / UI / curl()
  UNCHANGED / NOT STARTED
```

Do not implement `worldVerticalVorticity()`,
`DiagnosticVerticalVorticity`, or composition wiring because
this file exists.
Do not start stretching, T2, full curl, or Inspector L3.
Do not treat physics 23 or checkpoint 27 as this architecture.
Do not treat physics 18 §18.2 as a production API.
