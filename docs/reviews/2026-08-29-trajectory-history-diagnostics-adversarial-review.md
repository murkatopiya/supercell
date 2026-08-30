# Trajectory-History Diagnostics — Adversarial Review — 2026-08-29

**Authority:** adversarial physics + visualization review /
decision input. **NOT** project source of truth.

**Status:** preserved reviewer findings on whether Supercell
Explorer may show trajectory-parameterized rotational
diagnostics (`T_tilt,y(t)`, `∫T_tilt,y dt`, evolving `ω_y(t)`).
Recommendations in this file are the reviewer's, not project
decisions. No decision is accepted by this file. No
implementation is authorized by this file.

**Scope:** conceptual audit only. This file does not define a
new physics quantity, does not change `V_total`, does not
change T1 or Candidate A, does not amend physics `22` / `23`,
does not amend architecture `26` / `28` / `60` / `61`, and does
not create an Architecture SoT.

**Repository verified against:**

```text
2eb7516
```

**Documents read for this review:**

```text
docs/CONCEPT.md
docs/KNOWN_LIMITATIONS.md
docs/physics/03-numerical-integration-basics.md
docs/physics/05-vertical-wind-shear.md
docs/physics/06-horizontal-vorticity.md
docs/physics/22-diagnostic-tilting-tendency.md
docs/physics/23-diagnostic-vertical-vorticity.md
docs/architecture/25-tilting-stretching-direction-revalidation.md
docs/architecture/26-diagnostic-tilting-tendency-architecture.md
docs/architecture/27-post-t1-physics-direction-checkpoint.md
docs/architecture/29-post-candidate-a-physics-direction-checkpoint.md
docs/architecture/30-model-class-decision.md
docs/architecture/38-v1-scope-checkpoint.md
docs/architecture/43-post-42-1-v1-sufficiency-and-scope-cut.md
docs/architecture/52-historical-path-probe-architecture.md
docs/architecture/54-storm-scale-analysis-wind-profile.md
docs/architecture/58-source-class-aware-analysis-profile-contract.md
docs/architecture/59-high-resolution-esc-time-domain-analysis-integration.md
docs/architecture/60-analysis-consuming-diagnostic-support-contract.md
docs/architecture/61-analysis-tilting-validity-propagation.md
```

**Code verified against:**

```text
src/simulation/TracerParticle.ts
src/simulation/TracerPathHistory.ts
src/simulation/Simulation.ts
src/simulation/SimulationClock.ts
src/simulation/simulationElapsedFromWall.ts
src/core/integrators/EulerIntegrator.ts
src/ui/tracer/advanceLaboratoryFixedStep.ts
src/ui/tracer/TracerViewport.tsx
src/interaction/PointDiagnosticObservation.ts
src/physics/diagnostics/DiagnosticTiltingTendency.ts
src/physics/diagnostics/DiagnosticVerticalVorticity.ts
src/data/escHrTimeAnalysis/*
```

For substantial theses below, four labels stay distinct:

```text
DOC FACT             already fixed in project documentation
CODE FACT            verified in production source
REVIEWER FINDING     this review's analysis
REVIEWER RECOMMENDATION   not a project decision
```

---

## 0. Standing prohibition this review reopens

**DOC FACT.** The project already answers the central question
in the negative.

Physics `22` §21:

```text
T1 is an instantaneous local product, not an integrated ODE.
The laboratory does not integrate T_tilt,y.
```

Architecture `27` §7.1:

```text
Initializing from T1×Δt is a fake spin-up.
```

**REVIEWER FINDING.** The prohibition was correct, but its
stated reason is incomplete. The decisive defect is not
"no prognostic model exists"; it is operand non-membership plus
seed dependence (§1, §4, §5). Reopening this question requires
an explicit recorded reason, not a new name for the same
object.

**REVIEWER FINDING.** The reviewer's risk ordering is inverted
relative to the naive one. Evolving `ω_y` along the path is
legitimate and already computable. The tilting integral is the
only genuinely dishonest member of the three.

---

## 1. Key conceptual distinction

**REVIEWER FINDING.** The A / B / C split (instantaneous
tendency / accumulated tilting / evolving vorticity) mixes two
orthogonal axes. The correct axes are:

```text
axis 1   where evaluated:  Eulerian point  vs  along recorded path
axis 2   does the quantity require an integration constant
         or an initial value
```

Only axis 2 decides scientific admissibility.

### 1.1 Seed-independence test

**REVIEWER RECOMMENDATION.** Proposed formal criterion:

```text
A quantity belongs to the laboratory if and only if its value
at a given (P, t) does not depend on where or when the user
released the tracer.
```

| Quantity | Needs t₀ / IC | Seed-independent | Class |
| --- | --- | --- | --- |
| A: `T1(P, t)` | no | yes | property of the laboratory |
| B1: `T1` along path as time series | no | yes | laboratory property, reparameterized |
| B2: `∫T1 dτ` | yes (arbitrary t₀) | **no** | function of a UI click |
| C1: `ω_y,current(P(t))` | no | yes | property of the laboratory |
| C2: prognostic `ω_y(t)` via ODE | yes | no | new model class |

**REVIEWER FINDING.** B2 fails not because accumulation is
hard. The fields are Eulerian-steady, so pathlines are
deterministic. Two parcels released at different points of the
**same** pathline yield **different** accumulated values at a
common downstream point. A quantity that depends on where the
user clicked is not a property of the atmosphere.

### 1.2 Restated option set

```text
A   instantaneous local tilting tendency   ADMISSIBLE (implemented)
B1  field values along recorded path       ADMISSIBLE, no new physics
B2  accumulated ∫T1 dτ                     NOT ADMISSIBLE as vorticity;
                                           seed-dependent even as "exposure"
C1  laboratory ω_y along the path          ADMISSIBLE and EXACT (§7)
C2  prognostic ω_y(t)                      NOT ADMISSIBLE and REDUNDANT
```

---

## 2. Is a new time variable needed

**No.** No new time variable and no new provenance axis.

**CODE FACT.** `TracerPathHistory` already stores, per sample:

```text
{ position: Vec3, simulationTime: number }
```

`simulationTime` is the laboratory clock at the sampling
boundary. `52` §3 records this as implemented. `52` §3 also
forbids reconstructing `t` from the sample index.

Parcel travel time is already derivable as
`sample.time − firstSample.time` of that lane (`52` §4.2).

**REVIEWER FINDING.** The only thing absent is "elapsed along
path" as a named display quantity. That is a derivation, not a
new axis.

---

## 3. Runtime time vs sonde TIME

**DOC FACT / CODE FACT.** Five existing notions of time that
must not be collapsed:

| # | Time | Nature | Valid as integration coordinate |
| --- | --- | --- | --- |
| 1 | wall / rAF time | render; scaled by timeScale | no; not physical |
| 2 | laboratory `clock.time` | fixed dt = 0.1 s, `SimulationClock` | **yes; the only candidate** |
| 3 | parcel elapsed along path | derived from #2 within a lane | yes, as a display axis |
| 4 | sounding `validTime` | launch / column timestamp (`48` §4.2) | no; identity metadata |
| 5 | ESC measurement `TIME` | seconds from balloon release; internal coordinate of the FIR transform in which filter support is classified (`59` §7, §12) | **no** |

A sixth notion — storm evolution time — **does not exist**.
All operands are Eulerian-steady; `29` §2.2 records
`∂ω_y,current/∂t = 0`.

**DOC FACT.** `59` §4: ESC measurement TIME is
"source-measurement provenance, not a property of atmospheric
wind versus height", and "Do not add measurement TIME to that
kinematic class."

**REVIEWER FINDING.** Analysis support is defined in #5 while
the trajectory lives in #2. The two axes are linked only
through **height**: `60` §3 — "Filter support is defined in
TIME. Diagnostics query HEIGHT." Therefore
support-along-trajectory is the pullback of height-domain
support along the trajectory's height history, not a new
temporal provenance concept.

### 3.1 Conditions for using #2 as an integration coordinate

**CODE FACT.** `dt` is always the fixed scenario timestep
(0.1 s); `advanceLaboratoryFixedStep` does not apply
`timeScale`; `timeScale` only changes how many fixed steps are
consumed per animation frame; pause yields zero elapsed and
does not advance the clock.

**REVIEWER FINDING.** Required conditions: use recorded `Δt`
rather than `index × dt` (stride is configurable and the
terminal sample is off-stride); the tracer must have remained
active and unclamped (§7.2).

---

## 4. Instantaneous T1 interpretation

**DOC FACT.** Allowed reading, `22` §8.2 / §22: local Eulerian
signed source term, `s⁻²`, "tends to increase `ω_y`", a vortex
couple, and explicitly not `Dω_y/Dt`. `22` §25 anti-claims and
`22` §13 (couple, not a single cyclonic mesocyclone) stand.

**DOC FACT.** `22` §8.4 fixes the operands:

```text
ω_h        environmental finite-layer ω_h from the sounding
           NOT curl of V_total, NOT curl of the updraft
∇_h Vy     Vy of VerticalEnvelopeUpdraftField only
```

**REVIEWER FINDING (not in the docs).** Both operands are
restricted subsets. The actual laboratory field carries `ω_h`
from the updraft, downdraft, rotation `G'`, and radial limbs,
and `∂Vy_total/∂x` also contains the downdraft. Therefore:

```text
T1 is not the tilting term of the vorticity budget of ANY
field in the laboratory — not V_total, not any single operand.
It is a pedagogical product of two quantities from different
ontological layers.
```

This is legitimate and honestly documented for an instantaneous
diagnostic. It **destroys** any attempt to integrate T1 as a
budget contribution, and it does so before the initial-condition
question is even reached.

**REVIEWER FINDING.** A budget-consistent sibling is missing:
`TILT_Y` of `V_total` (full curl `ω_h` dotted with full
`∇_h Vy`) is not defined anywhere in the project, although all
fields are analytic and it is computable. That is a real gap.

---

## 5. Is `∫T_tilt dt` legitimate

**As `ω_y`: no.** Five independent reasons, each sufficient.

1. **Operand mismatch** (§4): the integrand belongs to no
   budget.
2. **Trajectory mismatch**: `P(t)` is the path of the full
   seven-operand `V_total`, including prescribed `Ω` and the
   radial limbs. The integrand is a two-operand product. This
   is a material path of one field and a term of another.
3. **Non-depleting reservoir**: environmental `ω_h` is
   resampled by height and never decreases from the conversion
   it allegedly performs. Real tilting reorients and depletes
   `ω_h`. Here the source is inexhaustible, so `ω_y` grows
   without physical bound. That is not an approximation; it is
   the absence of a conservation law.
4. **Missing terms are not small** (§8).
5. **Seed dependence** (§1.1).

**REVIEWER FINDING.** Mechanism of the primary misreading:
`∫s⁻² dt` has dimension `s⁻¹`, the same as vorticity. `23` §22
already warns that the "same unit family" is not
interchangeability. Here the dimensional coincidence is a trap,
not a convenience.

**REVIEWER FINDING.** Exactly one defensible reading exists,
and it is a counterfactual with three explicit conditionals:

```text
IF the parcel had ω_y = 0,
AND IF the only term in its vertical-vorticity budget were the
    tilting of environmental ω_h by the prescribed updraft's
    horizontal gradient of Vy,
AND IF it followed this path,
THEN it would now have this much ω_y.
```

Each conditional is false in the laboratory. `27` §7.1 already
names this a fake spin-up.

**REVIEWER RECOMMENDATION.** Do not build this quantity.
Replace it with **sign-residence statistics**, which carry the
same pedagogy without vorticity dimensions:

```text
seconds spent with T1 > 0
seconds spent with T1 < 0
min / max / median T1 along the path
units: seconds
```

Reading "rotation acquired" out of a number in seconds is
impossible in principle, and the lesson — "the parcel crossed
the couple and saw both signs" — is fully preserved.

---

## 6. Exact allowed name for that integral

**REVIEWER RECOMMENDATION.** If it ever exists:

Forbidden names:

```text
Δω_y
Δω_y,tilt
ω_y,tilt
accumulated vorticity
tilting-generated vorticity
spin-up
vorticity budget contribution
any name containing ω
```

Allowed form:

```text
path-integrated tilting product
symbol:  I_tilt
units:   s⁻¹ BY CONSTRUCTION as ∫(s⁻²)dt, NOT a vorticity
```

Mandatory attributes displayed with the number: seed marker,
`t₀`, elapsed time, integrator + dt + stride + quadrature rule,
interval support record, and an explicit seed-dependence
statement.

### 6.1 Zero-baseline semantics

**REVIEWER FINDING.** The zero baseline is **arithmetically**
legitimate: an integral from `t₀` is zero at `t₀` by
definition. It is **epistemically** illegitimate as presented,
for three reasons:

- `t₀` is an arbitrary user click;
- at `t₀` the parcel generally has `ω_y,current(P₀) ≠ 0` if it
  is inside the rotation envelope;
- the omitted terms are already active at `t₀`.

The zero is a statement about the integration bound, not about
the atmosphere, and that must be on screen rather than only in
documentation.

### 6.2 Hidden defect from the Source-mode continuation

**DOC FACT.** In Source / DEMO mode, T1 outside the profile's
vertical domain returns `0` (`26` §6.2, recorded in `60` §3.3
as a defined field continuation). `61` §9.2 forbids reusing
that `0` for the Analysis path.

**REVIEWER FINDING.** For an instantaneous readout that `0` is
honest. Under accumulation it silently converts "no data" into
"no tilting".

---

## 7. Is actual `ω_y(t)` currently legitimate

**Yes — and it is already implemented.**

**REVIEWER FINDING.** For any smooth field `V`, the following
is a purely **kinematic** identity (from
`(V·∇)V = ∇(|V|²/2) + ω×V` and the expansion of `∇×(ω×V)`,
with no momentum equation involved):

```text
Dω/Dt = (ω·∇)V − ω(∇·V) + ∇×a,      a = ∂V/∂t + (V·∇)V
```

The fields are steady, so `∂ω/∂t = 0`, and along a material
path:

```text
d/dt [ ω_y(P(t)) ] = (V·∇)ω_y
```

That is, `ω_y` along the path **is the field value at the path
position**. No ODE, no initial condition, no new model class.

**CODE FACT.** It already exists:
`DiagnosticVerticalVorticity.sample(P, t)`, and `52` §11
records that the historical path probe already recomputes
`ω_y,current` at a recorded `(P, t_recorded)`. A history plot
is the same values for every sample in the lane.

### 7.1 Mandatory on-screen caveats

**DOC FACT.** This is `ω_y` of the **painted** field. On the
current stack `ω_y(V_total) = ω_y(V_rotation)` is a CURRENT
STACK IDENTITY (`23` §16). Therefore the curve rises because
the parcel enters the prescribed `Ω` vortex, **not** because
tilting occurred. `23` §17: there is no authorized arrow
`T_tilt,y → ω_y,current`.

**REVIEWER FINDING.** That is simultaneously the anti-claim and
the strongest honest lesson available to the product.

### 7.2 Materiality gap

**CODE FACT.** `AtmosphericTracerDomain.applyAcceptedStep` may
modify the accepted step and deactivate the tracer.

**REVIEWER FINDING.** A clamped segment is **not** a material
trajectory, and `D/Dt` along it is undefined. This is not
covered by existing documentation and is a real gap.

### 7.3 Numerics are not the objection

**REVIEWER FINDING.** Euler with `dt = 0.1 s` and DEMO
`Ω = 0.005 s⁻¹` gives a radius drift of
`(1 + (Ω dt)²)^{N/2} ≈ 1.00075` over 600 s, i.e. about
0.075 %. The objection to B2 is physical, not numerical, and
must not be disguised as a numerical one.

---

## 8. Missing terms and initial conditions

**Inventory of `Dω_y/Dt` for this model:**

| Term | Formula | Status in the project |
| --- | --- | --- |
| TILT_Y | `ω_x ∂Vy/∂x + ω_z ∂Vy/∂z` | **exactly computable** from `V_total`, but **not defined**; T1 is a restricted surrogate |
| STRETCH_Y | `ω_y ∂Vy/∂y` | both factors available (`ω_y,current` implemented, `∂Vy/∂y` analytic); absent as a **prognostic** term; `25` §7.4 forbids stretching prescribed-`Ω` vorticity and calling it supercell stretching |
| advection `−V·∇ω_y` | — | **implicitly absorbed** by `D/Dt` if the path is material for the same field; broken by ground clamping |
| dilatation `−ω_y(∇·V)` | — | `∇·V ≠ 0` (continuity YELLOW, `10`); **cannot be zeroed**; it is a term of the ODE, not a forcing |
| baroclinic / solenoidal `(∇×a)_y` | — | **not representable**: no ρ, p, buoyancy. Not "small" but absent — while in real supercells baroclinic generation along the forward-flank / RFD boundary is a leading source of low-level rotation, exactly where the downdraft and near-ground outflow operands live |
| friction / surface drag | — | absent; current literature treats it as significant near the ground |
| planetary / Coriolis | — | absent, and **cannot** be added: the project deliberately refuses to lock a hemisphere (`23` §12), so absolute vorticity is undefined |
| **residual `(∇×a)_y`** | `a` from the painted `V` | **fully computable**, analytic, and generally **nonzero** |

### 8.1 The residual is the central missing quantity

**REVIEWER FINDING.** In a real fluid `∇×a` equals baroclinic
plus frictional generation. In a prescribed laboratory,
`∇×a` is exactly the **measure of the painting's dynamical
inconsistency** for vorticity. It is nonzero, computable, and
it is precisely the amount by which any tilting + stretching −
dilatation budget must disagree with the actual endpoint
`ω_y,current`:

```text
[ω_y,current]_{t0}^{t1} − ∫(TILT + STRETCH − dilatation) dτ
  = ∫ (∇×a)_y dτ
```

This is a checkable numerical equality. It closes the question
of whether `∫T1 dt` can be a budget contribution: even the
full, budget-consistent tilting term does not yield `Δω_y`
without the residual.

### 8.2 Initial conditions

**REVIEWER FINDING.**

| Candidate IC | Verdict |
| --- | --- |
| `ω_y(t₀) = 0` | **inconsistent**, not merely convenient, if the seed is inside `[y_b, y_t]` and `r < σ√2`, where `ω_y,current(P₀) ≠ 0` |
| source-derived | equals exactly `0`, because environmental `ω_y ≡ 0` by horizontal homogeneity (`23` §7) — but valid only far outside the storm, where `∇_h Vy ≈ 0` and there is nothing to integrate |
| prescribed | authored number; fake |
| unknown | honest, and a blocker |
| **field-consistent** `ω_y(t₀) = ω_y,current(P₀)` | the only defensible option — and it makes the ODE redundant (§7) |

Conclusion: any defensible IC makes the ODE unnecessary; any IC
that makes the ODE interesting is indefensible.

---

## 9. Environmental `ω_h` vs parcel `ω_h`

**REVIEWER FINDING.** Resampling `ω_h` at `P.y(t)` is
**mathematically** valid and is **not** an evolution of the
parcel's vorticity. Three separate objections:

1. **Object class.** `06` §3: the diagnostic applies only to
   `V = (u(h), v(h), 0)` with "no horizontal spatial
   variation". `06` §8: the quantity is **finite-layer
   derived**, not a pointwise curl. It is a height-indexed
   property of the far-field profile, not a local quantity in
   the parcel's neighbourhood.
2. **Anti-correlation of applicability and magnitude.** The
   deeper the parcel is inside the updraft / rotation core, the
   less "the environment at this height" describes its
   surroundings — and the larger T1 becomes. The diagnostic
   peaks where its operand is least applicable. This is not
   stated in the documentation.
3. **No depletion.** A real parcel `ω_h(t)` obeys its own `x`
   and `z` components of `(ω·∇)V` and is depleted or reoriented
   by the conversion. A resampled profile knows nothing of
   this.

**REVIEWER RECOMMENDATION.** The only honest phrasing is
"environmental horizontal vorticity of the sounding **at the
altitude the parcel currently occupies**", never "the parcel's
horizontal vorticity". The first is an Eulerian lookup composed
with a Lagrangian position. The second is a state that does not
exist.

---

## 10. Eulerian vs Lagrangian

**Eulerian — "what is the local diagnostic here now?"**

Honest: `T1(P, t)`, `ω_y,current(P, t)`, the seven operands,
`|V_total|`, `ω_h(h)`, shear, SRH, maps and slices, signed
regions of the couple. All seed-independent.

**Lagrangian — "what has this parcel experienced?"**

Honest **only** as an exposure record: which field values the
parcel passed through.

**REVIEWER FINDING.** The trap is in the middle: a time series
along a path **looks** Lagrangian while being Eulerian data in
a different parameterization. The name "parcel history" is
already the first false claim. The accurate name is "field
values along the recorded path".

### 10.1 Scientifically false user-facing phrasings

```text
"this parcel acquired X s⁻¹ of vertical vorticity"
"the parcel's rotation grew from tilting"
"the environment gave this parcel spin"
"tilting produced this much of the mesocyclone"
"the parcel's vortex tube was tilted upward"
"after N seconds the parcel spun up"
"this is what the Goshen parcel experienced"
"the storm evolved into this state"
```

**DOC FACT.** `52` §9 already anti-claims "path curvature is
not a measured Goshen trajectory". Storm evolution time does
not exist at all.

---

## 11. Support-through-time semantics

**DOC FACT.** The existing combination rule is uniformly the
conservative "FULL iff **every** contributor FULL" (`59` §15,
`60` §7, §8, §15, §16).

**REVIEWER FINDING.** That rule already answers the
`FULL → FULL → BOUNDARY → FULL` case: the interval cannot be
called FULL, and there is no resurrection after BOUNDARY.

**REVIEWER FINDING.** A plain worst-case collapse is
insufficient, because it merges two qualitatively different
failures. `61` §9.2: on OUT_OF_DOMAIN there is "no numeric T1.
Do not use legacy T1 `0`. Do not clamp." Therefore:

```text
BOUNDARY_CONDITIONED   integrand EXISTS; label degrades
OUT_OF_DOMAIN          integrand DOES NOT EXIST
COLUMN_UNAVAILABLE     integrand DOES NOT EXIST
```

For an **instantaneous time series** this distinction is
harmless: an OOD segment is a gap and the curve degrades
gracefully. For **accumulation** it is fatal: a hole in an
accumulating quantity is unrecoverable, and every value after
the hole is wrong by an unknown amount. This is an independent
argument for B1 over B2.

### 11.1 Proposed temporal semantics

**REVIEWER RECOMMENDATION.**

| Trajectory interval | Time series | Accumulation |
| --- | --- | --- |
| entirely FULL | FULL_SUPPORT | FULL_SUPPORT if all other conditions are met |
| contains BOUNDARY | meet ⇒ BOUNDARY_CONDITIONED; per-sample segmentation required | BOUNDARY_CONDITIONED, monotone, no resurrection |
| contains OOD | gap in the curve; the curve exists | **UNDEFINED** for the interval; only piecewise over maximal gap-free sub-intervals, each with its own window and label |
| COLUMN_UNAVAILABLE | the Analysis curve is absent; a Source curve is a different object, not a substitute | undefined |
| entering / leaving the profile domain | the time axis is segmented; concatenation forbidden | concatenation forbidden; the integral does not stitch |

### 11.2 Two risks not discussed in the documentation

**REVIEWER FINDING.** The effective FULL–FULL segment domain is
already narrower than the raw FIR FULL TIME interval (`60` §8).
A parcel oscillating in height near a knot boundary will
therefore **flicker** between FULL and BOUNDARY. A flickering
label next to an accumulating number is both a scientific and a
UX hazard.

**REVIEWER FINDING.** A `FULL_SUPPORT` badge beside an
accumulated number describes the operand over the interval,
while the number itself is not an operand. Composing two
correct statements yields an incorrect impression.

**REVIEWER FINDING.** No new provenance axis is required.
Support-through-time is the pullback of height-domain support
along the height history — a consequence of `60` §3.

---

## 12. Passive tracer semantics

**DOC FACT.** `30` §2: "passive scientific tracers sample
`V_total`". `29` §5.3 RECOMMENDATION: "do not use scientific
tracers as the home of prognostic vorticity."

**REVIEWER FINDING.** Attaching evolving `ω` to a tracer does
change its semantic class: a passive marker becomes a
Lagrangian diagnostic carrier.

**REVIEWER FINDING (limiting the objection).** There is almost
no **architectural** obstacle to the integral.
`TracerPathHistory` is a sibling observer, not a particle
field (`TracerParticle` = `{position, age, active, tracerId}`,
no history). A cumulative integral can be computed as a **pure
function of the lane** — a derived value, not particle state.
The cost is `O(N)` per refresh and a dependence on recorded
sample spacing, not a class change.

Consequently the sibling architecture is cleaner and already
precedented (`52` §11: recompute; "Diagnostic snapshot cache:
REJECTED"). The objection to B2 remains **physical**, not
architectural, and substituting one for the other would be
dishonest.

---

## 13. Visualization: SAFE / MISLEADING

| | Concept | Class | Condition / defect |
| --- | --- | --- | --- |
| A | instantaneous `ω_h`, `∇_h Vy`, `T1` at the selected tracer | **SAFE WITH ARCHITECTURE** | `∇_h Vy` is a genuine local quantity; a vector is legitimate. `T1` is a scalar; an arrow is **forbidden**. `ω_h` is horizontally homogeneous, so drawing it as a local arrow at the parcel misleads; correct form is a property of the height layer (band at altitude / hodograph binding), because that arrow is identical everywhere at that height |
| B | trajectory coloured by `T1` | **SAFE NOW** | diverging symmetric scale, neutral zero; label "field value at recorded point"; OOD as a gap, not zero. Strength: a path through the couple shows a sign change, which directly refutes "tilting makes one cyclonic mesocyclone" (`22` §13) |
| C | `T1(t)` history plot | **SAFE NOW** | axis is laboratory time; title "along the recorded path", never "as the storm evolved" |
| D | accumulated tilting contribution | **MISLEADING** | `s⁻¹` dimension + seed dependence + non-budget operands. Substitute: sign-residence in seconds |
| E | synchronized trajectory + time-series cursor | **SAFE NOW** | best value-to-cost ratio; half of it already exists in the historical path probe |
| F | regions of ±`T1` (slices / isosurfaces) | **SAFE WITH ARCHITECTURE** | must show **both** lobes of the couple; cropping to the cyclonic core is false (`22` §13). Requires a sampling grid and handling of profile-domain edges |
| G | support overlay | **SAFE WITH ARCHITECTURE**, and **required** | in Analysis mode this is not decoration but the NO-FAKE-SUPPORT rule (`59` §14) applied to a new surface |
| H | decomposition panel: environmental operand / prescribed operand / result | **SAFE NOW**, highest value | makes the epistemic asymmetry visible: one operand is Analysis-derived with a support class, the other is authored. This is exactly what users misunderstand about "FULL_SUPPORT T1" |

---

## 14. Vortex-tube verdict

| Visual | Verdict | Reason |
| --- | --- | --- |
| rotating tube along the path | **PHYSICALLY UNSUPPORTED** | requires a materially tracked vortex line ⇒ Helmholtz / Kelvin ⇒ barotropic + inviscid + `∇×a = 0`. The last fails identically (§8). `30` §13: "tracers are not vortex tubes" |
| streamwise vorticity tube as an **environmental** glyph | **SAFE WITH ARCHITECTURE** | only as a conceptual glyph of the environmental `ω_h` direction at a given height, drawn horizontally homogeneous, labelled "conceptual glyph, not a tracked tube". `22` §14: "Streamwise vorticity is not vertical vorticity" |
| horizontal vortex rollers | **PHYSICALLY UNSUPPORTED** as a structure | a roller is a localized coherent structure. Model `ω_h` is horizontally **homogeneous**, so no rollers exist. Drawing them invents structure the model does not contain |
| tube visibly bending upward | **split verdict** | a *material line* of passive tracers deforming with the flow is **SAFE** — that is exactly what the flow does. Calling it a *vortex line* is **UNSUPPORTED**: it requires `ω` to remain parallel to the material line, i.e. Helmholtz. The boundary between the two pictures is one word in the caption, which is why this is the most dangerous visual |
| tornado-like column | **PHYSICALLY UNSUPPORTED** | no near-ground dynamics, no pressure. Quantitatively: core `ω_y = 2Ω = 0.01 s⁻¹` is mesoscale, orders below tornadic |

**REVIEWER RECOMMENDATION.** Fix the distinction explicitly:

```text
a glyph explaining a vector or a mechanism
  ≠
a claim that the simulated parcel contains a materially
tracked vortex tube
```

The first requires a caption. The second requires a different
model class.

**REVIEWER FINDING.** A by-product research artifact: advect a
material line initially parallel to `ω` and **measure** the
angle between the deformed line and the local `ω` over time. A
nonzero angle is quantitative proof that the laboratory does
not conserve vortex lines. This converts the most dangerous
visual into an honest lesson about where the cartoon breaks.

---

## 15. NO FAKE EVOLUTION principle

**REVIEWER FINDING.** The principle is needed, but as proposed
it is too narrow and slightly mis-aimed. Recommended form: one
principle with three testable clauses rather than three
slogans.

**REVIEWER RECOMMENDATION.**

```text
NO FAKE EVOLUTION

A diagnostic tendency may not be integrated and presented as a
prognostic state unless all three hold:

(a) BUDGET CONSISTENCY
    the integrand is a term of the budget of the SAME quantity,
    computed from the SAME field, along the SAME material path.
    (T1 fails this first — before the IC question.)

(b) MATERIALITY
    the integration path is a material trajectory of that same
    field, not a numerical path carrying non-material
    operations (ground clamp, deactivation).

(c) REPRESENTABLE GOVERNING EQUATION + DEFENSIBLE INITIAL
    CONDITION
    a missing term may not be zeroed for convenience;
    an initial condition may not be chosen for convenience.

COROLLARY 1 (required, or the principle over-blocks)
    sampling a steady field along a recorded path is NOT
    evolution. Time-parameterized display of Eulerian
    quantities remains Eulerian.

COROLLARY 2 (seed independence)
    a quantity whose value at (P, t) depends on where or when
    the tracer was released is not a property of the laboratory
    and must not be presented as one.
```

**REVIEWER FINDING.** Clause (b) is currently unguarded
anywhere in the project — a real gap, not a restatement.
Corollary 1 is mandatory; without it the principle would
forbid the safe C1.

---

## 16. Option A / B / C comparison

**REVIEWER FINDING.** The option set must be split before
comparison is meaningful.

| | Scientific value | Complexity | Risk of misleading | New assumptions | Educational power |
| --- | --- | --- | --- | --- | --- |
| **A** instantaneous only | medium (current state) | none | low | none | medium — does not explain why a parcel is interesting |
| **B1** + time series of field values along the path | **high** | low (data exists) | low with correct captions | **none** | **high** — shows the sign change in the couple |
| **B2** + accumulated integral | low | medium (provenance, support gaps) | **high** | 3 false ones | illusory |
| **C1** laboratory `ω_y` along the path | **high** | low (already in the probe) | medium — needs the anti-claim "rises from entering `Ω`, not from tilting" | **none** | **very high** — and an honest lesson about prescribed `Ω` |
| **C2** prognostic `ω_y(t)` | negative | high | maximal | several non-representable | false |

**REVIEWER RECOMMENDATION.** `A + B1 + C1 + H + G`. Do not do
B2 or C2. C1 is recommended not because it is visually
impressive but because in a steady field it is the **exact**
answer requiring zero new physics.

---

## 17. SAFE NEXT

**REVIEWER RECOMMENDATION.** Requires no new physical
assumptions; relies on already implemented APIs.

1. Time series of `T1(t)` and `ω_y,current(t)` over a recorded
   lane, recomputed from `(P_k, t_k)`, storing nothing on the
   particle. Primary axis laboratory time; secondary axis
   elapsed along path.
2. Linked cursor: path ↔ chart, bidirectional. An extension of
   the already implemented historical path probe.
3. Decomposition panel (H) with explicit epistemic asymmetry of
   the operands.
4. Support bands on the charts — **required** in Analysis mode;
   OOD as a gap, not zero.
5. Trajectory coloured by `T1`, diverging symmetric scale.
6. Sign-residence statistics in seconds instead of any
   integral.

---

## 18. RESEARCH NEXT

**REVIEWER RECOMMENDATION.**

1. **Vorticity-budget residual `(∇×a)_y`** along a trajectory —
   a closure-gap diagnostic. Computable from existing analytic
   fields; measures the divergence of the painted field from a
   dynamically consistent one. The only identified option that
   **strengthens** "EXPLAIN EVERY INFERENCE" instead of
   diluting it.
2. **Budget-consistent `TILT_Y`** of `V_total` as a distinct
   quantity beside the pedagogical T1, with an explicit
   demonstration of their difference. A real gap in the physics
   documentation.
3. **Material line vs vortex line divergence experiment**
   (§14).
4. **Temporal support semantics** as a specification: meet for
   BOUNDARY, existence break for OOD / COLUMN_UNAVAILABLE,
   piecewise windows, flicker policy.
5. **Materiality policy** for ground-clamped segments —
   clause (b) of the principle.
6. Numerical requirements should any integral ever exist:
   quadrature order must not exceed trajectory order (otherwise
   an inconsistent input is being polished); recorded `Δt`
   rather than `index × dt`; the off-by-half-step convention of
   `52` §4.3; mandatory method provenance. Recorded honestly:
   Euler at DEMO parameters gives about 0.075 % radius drift
   over 600 s, so numerics are **not** the argument against
   B2.

---

## 19. DO NOT DO YET

**REVIEWER RECOMMENDATION.**

```text
∫T1 dt presented as ω_y / Δω_y / "vorticity gained"
prognostic ω_y(t) via ODE
any ω state attached to a tracer
material vortex tubes, horizontal rollers, tornado columns
"spin-up time" = 1/|T1| or T1 × Δt
interpolation of a diagnostic across OOD segments
relabelling a mixed-support interval as FULL
stretching prescribed-Ω vorticity called supercell stretching
storm-evolution time on any axis
```

---

## 20. Most scientifically valuable visualization idea

**REVIEWER RECOMMENDATION.** An **alignment panel**: the angle
between `ω_h(environmental, world)` and `∇_h Vy(updraft)`, with
an explicit

```text
T1 = |ω_h| |∇_h Vy| cos θ
```

Rationale: both operands are honest and already computed; the
product **is** the diagnostic, so nothing is added; it teaches
streamwise-versus-crosswise intuition without integrating
anything; it makes the sign **derivable** rather than declared;
and it naturally carries a support badge on the environmental
part and an "authored" marker on the prescribed part, embedding
the epistemic asymmetry in the geometry itself. It also
immediately explains why a path through the couple changes
sign — which `22` §13 requires showing and which an accumulated
number would hide.

Runner-up: `ω_y,current(t)` along the path beside `T1(t)`, with
an explicit caption that the rise of the first curve is
explained by entry into the prescribed `Ω` and not by the
second curve. This is the strongest possible demonstration of
the `22` §16 / `23` §17 anti-claim.

---

## 21. Biggest risk of user misunderstanding

**REVIEWER FINDING.** One composite sentence to design
against:

```text
"The observed environment generated this much rotation in this
 storm."
```

It assembles from three individually correct elements: a
`FULL_SUPPORT` badge (reads as "observed"), a number in `s⁻¹`
(same dimension as vorticity), and a parcel path (reads as
history). Every word of the result is false: not observed (the
updraft is authored, `61` §14), not generated (no closure), not
in a storm (a laboratory), and not "this much" (non-budget
operands plus seed dependence).

Secondary risk: `ω_y,current(t)` rises along the path, so a
user will attribute it to T1. On the current stack
`ω_y(V_total) = ω_y(V_rotation)` identically, so the curve is
entirely explained by entry into the painted vortex. Without an
explicit adjacent anti-claim, C1 would create exactly the false
causality that `27` §1 lists as a risk.

---

## 22. Questions requiring new research

**REVIEWER FINDING.**

- The magnitude of `(∇×a)_y` on the DEMO / Goshen stack.
- Whether budget-consistent `TILT_Y` and pedagogical T1 differ
  qualitatively (in sign? in couple topology?).
- Policy for support flicker at knot boundaries.
- Whether sign-residence in seconds is understood better than
  an integral. Note: `KNOWN_LIMITATIONS` §C records that
  M5-INDEPENDENT is unavailable and `38` §11.3 PASS is not
  claimed, so **any** claim of pedagogical effectiveness is
  currently unvalidatable.
- A materiality threshold: at what fraction of clamped steps a
  lane ceases to be usable for a Lagrangian readout.

---

## 23. Questions already answerable from existing architecture

**DOC FACT / CODE FACT.**

- No new time variable is needed — `simulationTime` is recorded
  on every sample.
- Parcel travel time is derivable.
- `T1` and `ω_y,current` are already recomputable at arbitrary
  `(P, t)` (`52` §4).
- Path history exists, is uncapped, and indices are stable.
- The support combination rule already yields the interval meet
  through the existing "iff every contributor FULL".
- OOD already forbids a numeric T1 (`61` §9.2), so gap
  semantics is already implied.
- The sibling-recorder pattern is already precedented; the
  particle remains passive.
- `∂ω/∂t = 0` is already recorded (`29` §2.2), so storm
  evolution is already excluded.
- Recompute-instead-of-snapshot is already chosen (`52` §11).

---

## 24. Recommended next slice

**REVIEWER RECOMMENDATION.** A **Research SoT** — not an
Architecture N, and not implementation. One document answering
two questions and implementing nothing:

1. **Vorticity-budget honesty audit** of the current
   laboratory: inventory of the `Dω_y/Dt` terms; the identity
   `Dω/Dt = (ω·∇)V − ω(∇·V) + ∇×a` as kinematic rather than
   dynamic; definition of budget-consistent `TILT_Y` of
   `V_total` as distinct from T1; the conclusion that `ω_y`
   along a material path equals `ω_y,current(P(t))` and that
   the ODE is redundant; `(∇×a)_y` recorded as the closure gap.
2. **Trajectory-diagnostic boundary decision**:
   seed-independence as the formal membership criterion; the
   NO FAKE EVOLUTION principle with three clauses and two
   corollaries; B1 / C1 as the accepted direction; B2 / C2 as
   rejected with the reason recorded (rejected, not deferred —
   the reasons are structural, not ordering); temporal support
   semantics as a separate OPEN item.

A UI slice on `B1 + C1 + H + G` follows that document. `26` and
`61` are unchanged by either.

---

## 25. Contradictions recorded, not reconciled

**REVIEWER FINDING.** Three tensions this review declines to
smooth over.

1. `CONCEPT` §2 promises vorticity that "changes orientation
   and becomes organized" as a **process**, while `30` §4.1
   itself marks that as something class A cannot answer.
2. `CONCEPT` §6 says "play the **simulation**" and "move
   between timesteps" while all operands are Eulerian-steady
   and `29` §2.2 records `∂ω_y,current/∂t = 0`.
3. Those formulations are the source of the pressure that
   produced the trajectory-history question, and until the
   boundary is fixed they will produce it again.

**REVIEWER FINDING.** `22` §21 already states "The laboratory
does not integrate `T_tilt,y`." Reopening that decision
requires reopening it explicitly with a recorded reason, not
bypassing it under a new name.

---

## 26. Compact lock-in of this review

```text
AUTHORITY:            reviewer input; NOT project SoT
DECISIONS ACCEPTED:   none
IMPLEMENTATION:       none authorized

NEW TIME VARIABLE:    not needed; simulationTime already recorded
INTEGRATION COORD:    laboratory clock only; never ESC sonde TIME
SEED-INDEPENDENCE:    proposed membership criterion
∫T1 dt AS ω_y:        NO — operand mismatch, trajectory mismatch,
                      non-depleting reservoir, missing terms,
                      seed dependence
ALLOWED NAME:         path-integrated tilting product (I_tilt);
                      never any name containing ω
ω_y ALONG PATH:       LEGITIMATE and EXACT; equals ω_y,current(P(t));
                      already implemented in the historical probe
PROGNOSTIC ω_y ODE:   illegitimate AND redundant
MISSING TERMS:        baroclinic, friction, planetary absent;
                      dilatation nonzero; (∇×a)_y computable and
                      nonzero — the closure gap
env ω_h vs parcel:    Eulerian height lookup, not parcel state
SUPPORT IN TIME:      meet for BOUNDARY; existence break for
                      OOD / COLUMN_UNAVAILABLE; no stitching
TRACERS:              stay passive; sibling lane function, not state
VORTEX TUBES:         material line SAFE; vortex line UNSUPPORTED
PRINCIPLE:            NO FAKE EVOLUTION, 3 clauses + 2 corollaries
BEST VISUAL:          alignment panel ω_h vs ∇_h Vy with T1 = |..||..|cosθ
BIGGEST RISK:         "the observed environment generated this much
                      rotation in this storm"
NEXT SLICE:           Research SoT — vorticity-budget honesty audit
                      + trajectory-diagnostic boundary decision
```
