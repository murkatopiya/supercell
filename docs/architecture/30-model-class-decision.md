# Model-Class Decision

**Status:** MODEL-CLASS DECISION SoT /
NO IMPLEMENTATION AUTHORIZATION
**Scope:** lock the intended class of the synthetic
laboratory and the boundary among prescribed velocity,
diagnostic physics, prognostic state, and feedback into
velocity. Not a stretching SoT. Not a solver architecture.
Not a T2 authorization. Not `ROADMAP.md`.
**Physics:** T1 and Candidate A remain CLOSED. Continuity
remains YELLOW. This file does not reopen `22`, `23`, `26`,
or `28`.
**Implementation:** none. Docs-only. Production `src/**`
MUST remain unchanged.

Predecessor post-Candidate-A physics-direction checkpoint:

```text
docs/architecture/29-post-candidate-a-physics-direction-checkpoint.md
```

`29` concluded `NO IMPLEMENTATION YET` and named the
remaining gap as a *model-class* question. This file
answers that question. Completing `29` did **not** start
stretching, T2, or `ω → V`. Completing this file does
**not** start them either.

Related product / class identity (not replaced):

```text
docs/CONCEPT.md
docs/architecture/21-whole-product-direction-checkpoint.md
docs/architecture/02-current-model-assumptions-audit.md
docs/architecture/10-composite-continuity-mass-budget-audit.md
docs/architecture/16-explore-guided-interaction-architecture.md
docs/architecture/17-guided-experiment-catalog.md
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

Successor post-model-class product direction:

```text
docs/architecture/31-post-model-class-product-direction-checkpoint.md
```

`31` answers what product work is earned now that the
synthetic class is locked. This file remains the
model-class SoT. Completing `30` does **not** start UI,
stretching, T2, or dataset work.

Long-term source-class / reconstruction boundary (does not
change class A; refines class D and U1 as consume, not
retrieve; does not start dataset work):

```text
docs/architecture/44-long-term-source-and-reconstruction-boundary.md
```

This document did **not** change production code.
It does **not** create `ROADMAP.md`.
It does **not** start a selected branch.

---

## 1. Why this decision exists

The project now has two closed headless diagnostics:

```text
T_tilt,y(P,t)         [s⁻²]   tilting tendency
ω_y,current(P,t)      [s⁻¹]   existing world-vertical curl
```

and still has no causal bridge

```text
tendency  →  state  →  velocity  →  tracer motion
```

Checkpoint `29` forbade treating stretching, T2, or
`ω → V` as the next *formula*. The question that remains
is larger:

```text
Should «Суперъячейка» remain a prescribed kinematic
laboratory, or should some atmospheric state later
evolve causally and feed back into motion?
```

That is a **class** decision. It is not a vote among
vorticity-equation terms.

The risk this file exists to prevent:

```text
not:  hybrid “just a little ω_y” that still moves air
      with prescribed Ω
not:  lock the cartoon as the only future source forever
      against CONCEPT §11 / §14
not:  start CFD because the causal gap is real
not:  treat dataset-backed V as if it were in-house
      prognostic dynamics
not:  convert a long-term possibility into a roadmap
```

---

## 2. Current model class

**Kind:** CURRENT FACT, matching `21` §2.1 and live
composition.

```text
class:     prescribed storm-relative kinematic laboratory
frame:     IntegrationFrame.StormRelativeLaboratory
compositor: CompositeVelocityField = unweighted world sum
operands:  seven prescribed VelocityField occupants
clock:     SimulationClock; DEMO V Eulerian-steady
motion:    passive scientific tracers sample V_total
integrator: live Euler, DEMO dt = 0.1 s
diagnostics: T1, Candidate A — observe, do not feed V
rotation:  VerticalEnvelopeRotationField, prescribed Ω
state:     no prognostic atmospheric field
thermo:    no density, no pressure, no buoyancy
mass:      no consistency solver; continuity YELLOW (`10`)
closure:   no ω → V
```

Four layers that must not collapse:

```text
prescribed velocity     V_i, V_total
diagnostic physics      T1, Candidate A, env ω_h, SRH, …
prognostic state        ABSENT
feedback into velocity  ABSENT
```

`Y12` (`02`) remains the *interaction* milestone class.
T1 and Candidate A did **not** earn it. Additive
composition is still honest only while operands do not
depend on one another’s velocity or vorticity.

### 2.1 What this model CAN answer

Honest questions of the current class:

```text
Where does prescribed air go from a chosen seed?
Where does it rise or descend (prescribed Vy occupants)?
Which operand contributes V at this point (Inspector L2)?
Where does environmental shear imply ω_h / streamwise /
  crosswise / SRH (hodograph-layer diagnostics)?
Where would env ω_h and the prescribed updraft create a
  vertical-vorticity tilting tendency (T1)?
Where does world-vertical vorticity currently exist in
  this V_total (Candidate A = shielded vortex of Ω)?
How do independent mechanisms superpose kinematically?
```

These are real scientific and pedagogical questions.
They are **not** a supercell.

### 2.2 What this model CANNOT answer

```text
Why did vertical rotation form from shear?
Did tilting generate the chimney spin?
Did stretching intensify a mesocyclone?
How does a vorticity couple become a single cyclonic
  rotating updraft?
Is the circulation mass-consistent / same air?
Did a cold pool / RFD generate baroclinic ω_h?
How does rotation feed back onto the updraft?
What pressure field balances this flow?
```

Visual spin of `V_rotation` does **not** answer those
questions. CONCEPT §9: a synthetic conceptual model must
be identified as such.

---

## 3. Model-class options

### 3.1 A. Prescribed kinematic laboratory

Velocity remains fully prescribed. Diagnostics may explain
properties and *tendencies* of that flow. Diagnostics
never feed motion.

This is the **current** class. It can stay the intended
*synthetic-product* class without claiming it is the only
source class the product may ever host (`§11` CONCEPT:
tracers ask only `V(P,t)`).

### 3.2 B. Hybrid model

Some state evolves prognostically. Major background /
storm structure remains prescribed. Conceptual shape
(not selected):

```text
prescribed environment / updraft / …
+
prognostic perturbation state
→  modified V_total
```

This is a **new class**, even if the compositor still
looks familiar. The moment `V` depends on evolved state,
`Y12` is opened. Inspector L2, Guided copy, and visual
occupants all start observing a different object.

### 3.3 C. Prognostic dynamical model

Velocity / state is substantially evolved from governing
equations rather than from seven DTO knobs.

This is CFD / atmospheric-model territory: momentum
(or anelastic / Boussinesq / C-grid equivalent),
continuity stance, thermodynamics if buoyancy matters,
boundaries, time integration, validation.

CONCEPT §12: the product is **not** “a complete numerical
atmospheric solver.”

### 3.4 D. Dual-source product (synthetic lab + later dataset)

Not a third dynamics. A **source-class** already named in
CONCEPT §9 / §11 / §14 and `21` §6.E / §7:

```text
synthetic prescribed laboratory   remains a mode
physically simulated dataset V    optional later source
same tracer / Explore / Guided ports
diagnostics observe the V they are given
```

Dataset `V` is *externally* prognostic (someone else’s
model). This project would **diagnose**, not evolve, that
atmosphere. It is not in-house T2 and not a continuity
solver.

---

## 4. Assessment

Ratings: LOW / MEDIUM / HIGH. “Reusable seven-operand
work” means fields, composition, Explore/Guided, Inspector
L1/L2, visual occupants, T1, Candidate A — as *ports* or
as *physics claims*.

### 4.1 A — prescribed kinematic laboratory

| Criterion | Assessment |
| --- | --- |
| Enables | mechanism isolation; pathlines; L1 diagnostics of prescribed `V`; honest “cartoon of parts” |
| Cannot | causal rotation; mass-consistent cell; baroclinic generation; pressure-driven flow |
| Product identity | HIGH fit with CONCEPT §9 synthetic, §10 one-mechanism, §12 not-a-solver; incomplete vs §2 “vorticity changes orientation and becomes organized” as *process* |
| Explore / Guided | HIGH: current stack, Reset, three exhibits, anti-claims (`17`) stay true |
| Tracer semantics | HIGH: passive probes of `V` (`01`) |
| Continuity | LIMITATION (`10` YELLOW); not a blocker for this class |
| Thermo / `p` / `ρ` | not required |
| Compute | LOW |
| Architecture | already built |
| Validation | analytic identities + DEMO research (T1, Candidate A) |
| Misleading-causality risk | MEDIUM in speech (“the mesocyclone”); LOW if copy stays locked |
| Reuse | **all** current work remains the product, not a prototype to throw away |

### 4.2 B — hybrid

| Criterion | Assessment |
| --- | --- |
| Enables | a named teaching ODE plus, if `ω → V` exists, *some* tracer-visible generated spin |
| Cannot | automatically: couple→cyclone, mass consistency, baroclinic mesocyclone, a unique inversion of `ω_y` |
| Product identity | LOW–MEDIUM unless named parameterized; easy to sell as “now it is dynamics” |
| Explore / Guided | MEDIUM–LOW: Reset must restore state; Guided “prescribed spin” copy falsifies; L2 may hide a closure inside `rotation` |
| Tracer semantics | breaks if `V` depends on state; stays if overlay-only (then not really hybrid) |
| Continuity | IMPORTANT; PREREQUISITE if inversion-class feedback |
| Thermo | not strictly required for kinematic `ω` ODE; required if buoyancy/cold pool is the story |
| Compute | MEDIUM–HIGH (grid, dt, inversion) |
| Architecture | HIGH (new owner; not `Simulation`-as-today; `29` §5) |
| Validation | HIGH burden (IC, BCs, blow-up, couple vs cyclone) |
| Misleading-causality risk | **HIGH** |
| Reuse | operands remain *ingredients*; `Ω` and Candidate A become politically dangerous; T1 reusable as a *source term* only inside a named ODE |

Overlay-only “hybrid” (state does not change `V`) is
`29` Candidate B: **not** this class. It is a diagnostic
prognostic. This section means **feedback**.

### 4.3 C — prognostic dynamical model

| Criterion | Assessment |
| --- | --- |
| Enables | in principle, questions in §2.2 — if the equations and ICs actually contain those processes |
| Cannot | still cannot claim “the real atmosphere” without dataset / model pedigree; still not a forecast system (CONCEPT §12) |
| Product identity | conflicts with “not a complete numerical solver”; would *become* a different product that then needs visualization |
| Explore / Guided | would need a new catalog; current three exhibits are prescribed-pathline pedagogy |
| Tracer semantics | could stay “passive on `V`” **if** `V` is the model output — that part ports |
| Continuity | **central** |
| Thermo | required for baroclinic / buoyancy-driven `w`; optional only for dry kinematic subsets |
| Compute | HIGH |
| Architecture | HIGH; most DEMO DTO physics does not survive as governing equations |
| Validation | VERY HIGH |
| Misleading-causality risk | HIGH if under-resolved or if DEMO geometry is hard-wired |
| Reuse | **ports** (VelocityField, tracers, Explore, Inspector observation) HIGH; **operand physics** LOW |

### 4.4 D — dual-source (synthetic + later dataset)

| Criterion | Assessment |
| --- | --- |
| Enables | CONCEPT breadth: physically simulated `V`, later thermo/cloud layers from the same source; synthetic lab kept as an instrument (`21` §7) |
| Cannot | does not *teach* in-house generation; dataset owns causality |
| Product identity | HIGH fit with CONCEPT §9 / §11 |
| Explore / Guided | HIGH if ports stay `sample(P,t)`; Guided copy must mark synthetic-only claims |
| Tracer semantics | HIGH: this is the port CONCEPT already specified |
| Continuity | source-owned; do not “fix” a dataset with our YELLOW solver |
| Thermo | dataset-native if present |
| Compute | adapter later; not a solver now |
| Architecture | MEDIUM when actually started; **not now** |
| Validation | source-dependent |
| Misleading-causality risk | LOW if labeled physically simulated vs synthetic |
| Reuse | observation stack HIGH; prescribed `Ω` stays in the **synthetic mode only** |

---

## 5. Fate of prescribed `Ω`

Mandatory. `VerticalEnvelopeRotationField`, DEMO
`Ω = 0.005 s⁻¹`, and Candidate A (`ω_y,current`) are
one painted mechanism plus its curl bookkeeping.

`27` §12 options remain the vocabulary:

```text
Ω1  keep forever as independent prescribed mechanism
Ω2  keep as baseline while generated rotation is diagnostic
Ω3  reinterpret as leftover background  — not choosable now
Ω4  modulate Ω from diagnostic/prognostic state
Ω5  replace Ω once a generated velocity closure exists
```

### 5.1 Under class A (kinematic laboratory)

```text
Ω:            remains permanently prescribed in this mode
              (Ω1)
Candidate A:  remains curl of that occupant / CURRENT stack
              total; diagnostic, not state
double count: none in V; speech risk only
```

Ω2 is allowed as L1 overlays (T1, optional later
stretching-as-bookkeeping) **if** copy says baseline ≠
explanation. Ω4/Ω5 are **out of this class**.

### 5.2 Under class B (hybrid with feedback)

| Ω fate | Honesty | Double counting |
| --- | --- | --- |
| keep Ω1 in `V_base` and add `V'(ω')` in the same chimney | **LOW** | **acute**: paint + generated spin |
| Ω as “background” (Ω3) | currently **false**: DEMO `Ω` *is* mesocyclone-scale chimney spin (`25` §8.1, `27` §12) | would invent a leftover role |
| Ω IC only, then remove occupant (Ω5) | HIGH **if** `V'` actually supplies rotation | solved by removal |
| Ω_eff(t) from diagnostics (Ω4) | LOW unless named parameterization | the knob is still `Ω` |
| perturbation defined *relative to* Ω | see §6 | often **hides** the same chimney twice |

Candidate A of **total** `V_base + V'` would mix paint and
generated curl. Candidate A of **base** would still be
`ω_y^Ω`. Those must not share a name.

### 5.3 Under class C (prognostic dynamics)

```text
Ω occupant:   removed or reduced to a named IC / nudge
Candidate A:  becomes (∇ × V_evolved)_y, a different owner
              than analytic ω_y^Ω
```

Keeping `VerticalEnvelopeRotationField` as a live summand
alongside evolved `V` is the same double-count as hybrid.

### 5.4 Under class D (dataset source)

```text
synthetic mode:  Ω1 as today
dataset mode:    no ScenarioRotation occupant;
                 ω_y diagnosed from dataset V
Candidate A v1:  synthetic evaluator stays in synthetic mode
                 (`28` §24: different owner for dataset curl)
```

### 5.5 Decision for Ω *now*

**NEW PROJECT DECISION:** while the product remains a
prescribed kinematic laboratory, **Ω1 / Ω2** are the only
honest pairing. Ω3 is still not choosable. Ω4 / Ω5 remain
legal only inside a **named** later class (hybrid-with-removal
or dataset/dynamics), not as a convenience retune.

---

## 6. Base state vs perturbation

Investigate, do not implement:

```text
V  = V_base + V'
ω  = ω_base + ω'
```

with today’s laboratory as `V_base`.

### 6.1 Does this avoid double counting?

**No, not automatically.**

Double counting is about **roles in the chimney**, not
about writing a plus sign.

```text
If V_base includes V_rotation(Ω)
and V' is inverted from ω' sourced by T1
then tracers see Ω-spin + generated spin
in the same updraft column
```

Calling the second field “perturbation” does not make
them orthogonal. There is no current physical projection
that says T1’s couple is the residual of `Ω`.

### 6.2 What equations would `ω'` obey?

The vorticity identity applies to **total** `ω`. Splitting
it does not delete cross terms. Schematically:

```text
Dω'/Dt  includes
  advection of ω' by V_base and by V'
  advection of ω_base by V'
  stretching/tilting of ω' by ∇V_base and ∇V'
  stretching/tilting of ω_base by ∇V'
  dilatation with ∇ · (V_base + V')
  + (∇ × a)_y if any
```

A linearized teaching ODE

```text
∂ω'/∂t = T_tilt,y(V_base) + …
```

drops those cross terms **by assumption**. That assumption
is a new model, not a consequence of the current lab.

`V_base` is Eulerian-steady. `ω_base` (Candidate A of the
base) is therefore frozen. Any `ω'` growth is *not*
evolution of Candidate A unless the SoT says `ω'` *is*
the increment of that field — which, with Ω in the base,
is “animate extra spin on the paint.”

### 6.3 What does current T1 refer to?

T1 v1 (physics `22`):

```text
T_tilt,y = ω_h^{env} · ∇_h Vy_updraft
```

On a split:

| Reading | Honest? |
| --- | --- |
| tendency of **base** updraft × env `ω_h` | YES: that is what T1 is today |
| tendency of **total** `Vy` including `V'` | NO, not v1; would be a later sibling |
| tendency of `ω'` | T1 is a *source*, not `ω'` |
| tendency of `ω_base` | NO: `ω_base` is curl of paint, independent of T1 |

T1 does not know `Ω`. That independence is the
double-counting *guard* today. In a hybrid it becomes a
double-counting *machine* if both enter `V`.

### 6.4 Does Candidate A remain meaningful?

**Yes, as curl of whichever `V` is named.**

```text
Candidate A today:     ω_y(V_total) = ω_y(V_rotation)
Candidate A of base:   ω_y(V_base)  — still Ω if rotation stays
Candidate A of total:  ω_y(V_base + V') = ω_base,y + ω'_y
```

The CURRENT STACK IDENTITY **dies** as soon as `V'` has
vertical curl. That is expected. The type must not keep
implying “total = rotation.”

### 6.5 Does `ω' → V'` still need nonlocal inversion?

**YES.**

Linearity of curl does not make inversion local.
`ω'_y` is one component. Reconstructing `V'` still needs
a continuity stance, BCs, and usually more of `ω'`
(`29` §7). Hybrid decomposition does **not** grant a
solid-body formula `V'_θ = ω' r / 2`.

### 6.6 Continuity of base vs perturbation

`V_base` is YELLOW. A divergence-free `V'` added to a
YELLOW sum is still YELLOW. Projecting `V'` to
`∇ · (V_base + V') = 0` is a **continuity solver on the
total**, not a free property of the split.

**ANTI-CLAIM:** `V_base + V'` does not automatically
prevent double counting. Hybrid decomposition does not
automatically solve continuity.

### 6.7 When would a split be legitimate?

Only with **explicit complementary roles**, for example:

```text
V_base has Ω = 0 (chimney without painted mesocyclone)
V' is the entire rotational closure, named, validated
```

That is Ω5, not “perturbation around Ω.” It is closer to
class B/C than to a small increment of class A.

Or:

```text
V_base keeps Ω as a Guided fixture
V' is display-only (no feedback)
```

That is Ω2 + overlay — **class A**, not hybrid.

---

## 7. Couple vs cyclone

T1 DEMO evidence (`2026-08-20-t1-demo-field-validation.md`):
signed dipole / couple, offset along env `ω_h`.

Candidate A DEMO evidence: on-axis positive core plus
shielding annulus of prescribed `Ω`.

**CURRENT FACT:** these are different spatial objects.
T1’s couple sits inside the positive Candidate A core
(`r ≈ 0.95σ` in the research sample), not on the outer
ring. There is **no** modeled mechanism

```text
vorticity couple
  → preferential survival / ingestion / reorientation /
    organization
  → coherent rotating updraft
```

STANDARD THEORY (already the honesty constraint in `15`
§9.2 / `25` §4.5; not a new literature import): a
horizontally homogeneous `ω_h` tilted by a localized
updraft yields a **couple**. Preferential cyclonic
organization in real supercells is a different story
(streamwise vorticity / SRH as *environment diagnosis*,
updraft-relative flow, nonlinear vorticity dynamics,
dynamic pressure, often baroclinic `ω_h` at outflow
boundaries). This laboratory has SRH as a **column
integral of the sounding**, not as an evolution operator
(physics `09`, `22`).

### 7.1 Could scalar `ω_y,state` represent the transition?

**Not adequately, if the claim is “the couple becomes the
mesocyclone that moves air.”**

```text
ω_y,state can store two signed patches
it cannot, by itself:
  reorient horizontal vorticity
  select one member via 3D nonlinear dynamics
  change the updraft that created the couple
  invert a couple into a single cyclonic V
      without extra assumptions that discard the other pole
```

Even with `ω → V`, inverting a couple typically yields
**coupled vortices**, not automatic cyclonic capture.
Guided already forbids “mesocyclone capture” (`17`).
A scalar vertical-vorticity ODE on prescribed `V` would
advect/stretch patches **in the painted chimney** — it
would not earn that word.

**NEW PROJECT DECISION:** couple → cyclone is a **named
missing mechanism**, not a gap stretching or T2 can fill
silently. Any later class that claims generated mesocyclonic
`V` must either model that organization or **anti-claim**
it and show a couple.

---

## 8. What would count as causal rotation

Visual rotation is prescribed `V_θ`. Causal rotation is a
**claim** that modeled dynamics generated or intensified
the spin tracers feel.

Minimum checklist. All items are required for the sentence

```text
rotation was generated / intensified by modeled dynamics
```

to be legal in this project:

```text
C1  explicit model class (not class A pretending)
C2  prognostic state with a named owner (not tracers-as-ω)
C3  explicit initial condition (not T × Δt; Ω fate locked)
C4  named source terms actually integrated
    (T1 may be one; stretching only with named ω and
     dilatation policy from 29)
C5  advection of that state by a named V
C6  feedback: evolved state changes the V tracers sample
    (no feedback ⇒ not causal for motion)
C7  Ω occupant removed, or complementary roles proven
    (no chimney double count)
C8  continuity stance stated
    (YELLOW kinematic ODE is allowed only if copy does
     not say mass-consistent / vortex-tube)
C9  couple vs cyclone: modeled or anti-claimed
C10 validation against analytic / synthetic known cases
    (tilting of uniform ω_h → couple; stretching of a
     named vortex under a named strain; inversion tests
     if ω → V exists)
C11 copy: generated ≠ prescribed ≠ visual encoding
    (CONCEPT §9)
```

Pressure, density, and buoyancy are **not** on this
minimum list for *shear-tilting kinematic causality*.
They **are** required if the claim is baroclinic
generation, buoyancy-driven `w`, or cold-pool coupling
(`22` §18, `27` §10, `29`).

Failure of any of C1–C11: do not use “generated rotation.”

---

## 9. Product identity

CONCEPT:

```text
Perceive the invisible atmosphere.
Do not merely visualize the storm.
Visualize the processes that make it a storm.
```

Success quotes include “I can see the rotation” and
“I understand how these flows interact.” The first is
**perceptual**. Class A can already do it for prescribed
spin (and later for dataset spin). The second, for
*interactions*, is exactly what additive composition
cannot honestly claim (`Y12`).

CONCEPT §10–§11 prefer a simple validated mechanism over
a convincing complex result, and allow growth from
synthetic fields toward **numerical atmospheric model
datasets**. CONCEPT §12 rejects becoming a complete
numerical solver.

`21` already forbade the false dichotomy

```text
mass-consistent synthetic model  OR  forever cartoon
```

and kept

```text
prescribed mechanism laboratory
  → richer perception / investigation
  → optional future physically simulated datasets
```

with the synthetic lab as a distinct instrument.

**Would in-house prognostic dynamics improve the product
enough to justify the cost?**

Not now. It would spend the architecture budget of class
B/C on a DEMO-shaped ODE that:

- does not port to datasets (`25` §14, `29`);
- fights Ω and the couple;
- is easy to misread as “why it rotates”;
- is what CONCEPT §12 says the product is not.

**Can the product remain scientifically valuable as a
high-quality prescribed kinematic laboratory?**

**YES.** That is the current identity: independently
inspectable mechanisms, anti-claims, Explore/Guided,
headless diagnostics that name tendency vs existence.
Value is **honesty of parts**, not completeness of a
supercell.

“More physics” is not automatically a better product.
A stretching overlay of Candidate A, or a T2 field tracers
ignore, would add formula surface without adding lawful
causal sentences.

---

## 10. Decision horizon

Not a roadmap. Buckets only.

### NOW

```text
prescribed kinematic laboratory (class A)
seven operands, Ω1/Ω2
T1 CLOSED, Candidate A CLOSED
continuity YELLOW as limitation
no stretching / T2 / ω→V / thermo / solver implementation
```

Product work on *already closed* diagnostics (Inspector
L3, copy, perception) is **product** work, not
authorized here (`21` Candidate 4; `27` §15; `29` D3).

Further L1 diagnostics (honest stretching bookkeeping,
T1 siblings) remain **optional literacy**, not a class
change, and still need their own SoT (`29`).

### NEXT PHASE

```text
stay in class A unless a future SoT opens a
named source-class or named dynamics-class SoT
```

“Next phase” is **not** hybrid migration research.
It is not continuity closure. It is not T2.

### LONG-TERM POSSIBILITY (not a commitment)

```text
dataset-backed physically simulated V
  (CONCEPT §11 / §14; 21 §6.E)
  synthetic laboratory remains a mode
```

In-house class B/C remains a **possibility** only as a
separate, fully named laboratory branch — not the default
path toward CONCEPT.

### OUT OF SCOPE (this product)

```text
operational forecast model
complete in-house atmospheric CFD as the product
tornado game / photorealistic demo
silently relabeling Ω as generated rotation
```

Do not convert LONG-TERM POSSIBILITY into a scheduled
migration.

---

## 11. Recommendation

User options were:

```text
A  LOCK prescribed kinematic as intended *final* class
B  KEEP prescribed now, preserve a future *hybrid* path
C  BEGIN model-class migration research before more physics
D  another justified decision
```

**Chosen: D**, specified as:

```text
KEEP the prescribed kinematic laboratory as the intended
synthetic-product class for NOW and NEXT PHASE.

Do NOT lock it as the only future *source* class:
CONCEPT already names dataset-backed V as a later
possibility.

Do NOT privilege in-house hybrid dynamics as the
migration path. Hybrid-with-feedback is a different
product class; overlay-without-feedback is still class A.

Do NOT begin prognostic-migration research, solver
research, or T2 design as a follow-on to this file.
```

This rejects A as too final (would fight CONCEPT §11).
This rejects B as stated, because “preserve hybrid path”
would keep the highest false-causality class warm.
This rejects C: the causal gap is real, but it is **not**
earned as a research-implementation loop before the
kinematic product is used as a kinematic product.

```text
NEXT DIRECTION:     class A, held
CONFIDENCE:         HIGH
```

HIGH on:

- stay kinematic now;
- no T2 / stretching / `ω → V` / continuity solver from
  this file;
- dataset path is source-class, not in-house dynamics;
- hybrid is not the default future.

MEDIUM on:

- when, if ever, a dataset adapter should be a product
  slice;
- whether optional L1 diagnostics or product UI of T1 /
  Candidate A should come first (not decided here).

LOW on nothing that this file needed to decide.

### 11.1 Implementation authorization

```text
Does this document authorize any production implementation?
NO.
```

Selecting class A conceptually does **not** authorize a
solver, a grid, Ω changes, or a diagnostic slice.
Implementation of a *product* or *L1* slice inside class A
is out of scope for this SoT.

---

## 12. Unresolved questions

Not implementation tasks. Not a backlog commitment.

```text
U1  When, if ever, to open a dataset-source adapter SoT
U2  Whether product exposure of T1 / Candidate A is wanted
    inside class A
U3  Whether any further L1 diagnostic is worth the
    false-causality cost (29 stretching honesty lock)
U4  If class B is ever opened: Ω5 vs named parameterization;
    couple-vs-cyclone policy; inversion family
U5  Whether YELLOW is ever promoted for teaching
    mass-consistent circulation (10 C) — still not a
    rotation branch
U6  Thermo / cold pool: remains a different chain
```

---

## 13. Anti-claims

```text
prescribed Ω is not generated rotation
T1 is not accumulated ω
Candidate A is not prognostic state
stretching of Candidate A is not causal intensification
a prognostic scalar ω does not by itself generate velocity
tracers are not vortex tubes
visual rotation is not proof of modeled dynamics
hybrid decomposition does not automatically solve continuity
V_base + V' does not automatically prevent double counting

class A cannot claim causal mesocyclone formation
T1’s couple is not the Candidate A core
scalar ω_y,state is not the couple→cyclone mechanism
dataset V is not in-house T2
CONCEPT long-term vision is not an implementation order
Y12 is not earned
Ω3 “background mesocyclone” is not available
Inspector L2 rotation row is V_rotation, not ω_y
YELLOW is not GREEN
this file is not a solver SoT
this file is not ROADMAP.md
```

---

## 14. Documentation / authority

```text
this file:     model-class decision SoT
29:            post-Candidate-A physics direction
               (NO IMPLEMENTATION YET) — not replaced
27:            post-T1 direction (selected Candidate A)
21:            whole-product map — synthetic vs dataset
               fork already named; not replaced
CONCEPT:       product identity; synthetic vs simulated
22 / 26 / 23 / 28:  CLOSED; not rewritten
10:            continuity YELLOW
```

Successor pointer only on `29`. Historical checkpoints
are not rewritten.

---

## 15. Compact lock-in

```text
CURRENT CLASS:          prescribed kinematic laboratory
INTENDED SYNTHETIC
PRODUCT CLASS:          same, NOW and NEXT PHASE

VELOCITY:               seven prescribed operands
DIAGNOSTICS:            observe; no feedback
PROGNOSTIC STATE:       ABSENT
ω → V:                  ABSENT

Ω:                      Ω1 / Ω2 in this class
Candidate A:            diagnostic curl of prescribed V
T1:                     diagnostic tendency; not state

HYBRID WITH FEEDBACK:   different class; not the default
                        migration path
IN-HOUSE CFD:           OUT OF SCOPE as the product
DATASET V:              LONG-TERM POSSIBILITY
                        (source class; not a commitment)

COUPLE → CYCLONE:       missing mechanism; not silent T2
CAUSAL ROTATION:        checklist C1–C11; none met now

NEXT IMPLEMENTABLE
FROM THIS FILE:         NONE

CONFIDENCE:             HIGH
```

---

## 16. STOP

```text
MODEL CLASS
  DECIDED
  prescribed kinematic laboratory
  held for NOW and NEXT PHASE

NOT LOCKED AS
  the only future source class forever

NOT SELECTED
  hybrid-with-feedback as the path
  in-house prognostic dynamics
  migration research as next work

IMPLEMENTATION
  NOT AUTHORIZED

STRETCHING / T2 / ω→V / Ω / V_total /
CONTINUITY SOLVER / THERMO / UI
  UNCHANGED / NOT STARTED
```

Stretching, T2, prognostic `ω`,
continuity solver, `ω → V`, Ω changes, `V_total`
changes, and visualization implementation are out of
scope for this SoT.
