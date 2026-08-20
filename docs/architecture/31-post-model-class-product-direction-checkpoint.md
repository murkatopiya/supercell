# Post-Model-Class Product Direction Checkpoint

**Status:** DECISION CHECKPOINT / POST-MODEL-CLASS /
NO IMPLEMENTATION AUTHORIZATION
**Scope:** choose the next *product* direction now that the
synthetic laboratory class is locked. Not a physics SoT.
Not a visualization encoding lock-in. Not Inspector L2.
Not a Guided catalog expansion. Not `ROADMAP.md`.
**Physics:** T1 and Candidate A remain CLOSED. Model class
remains prescribed kinematic laboratory (`30`). This file
does not reopen `22`, `23`, `26`, `28`, or `30`.
**Implementation:** none. Docs-only. Production `src/**`
MUST remain unchanged.

Predecessor model-class decision:

```text
docs/architecture/30-model-class-decision.md
```

`30` held class A (prescribed kinematic laboratory) for
NOW and NEXT PHASE. Dataset `V` remains a long-term
source possibility, not a commitment. This file answers
what product work is earned **inside that class**.

Related product / perception / diagnostics (not replaced):

```text
docs/CONCEPT.md
docs/architecture/21-whole-product-direction-checkpoint.md
docs/architecture/24-perceptual-exploration-checkpoint.md
docs/architecture/16-explore-guided-interaction-architecture.md
docs/architecture/17-guided-experiment-catalog.md
docs/architecture/19-shared-tracer-inspector.md
docs/architecture/26-diagnostic-tilting-tendency-architecture.md
docs/architecture/28-diagnostic-vertical-vorticity-architecture.md
docs/architecture/29-post-candidate-a-physics-direction-checkpoint.md
docs/physics/22-diagnostic-tilting-tendency.md
docs/physics/23-diagnostic-vertical-vorticity.md
docs/research/2026-08-20-t1-demo-field-validation.md
docs/research/2026-08-20-candidate-a-demo-field-validation.md
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

This document did **not** change production code.
It does **not** create `ROADMAP.md`.
It does **not** start a selected branch.

---

## 1. Why this checkpoint exists

Physics direction after Candidate A (`29`) and the
model-class decision (`30`) closed a trap:

```text
not:  what vorticity-equation term comes next?
yes:  the synthetic product stays a prescribed laboratory
```

The remaining question is product, not formula:

```text
What work most improves the prescribed synthetic laboratory
now that its model-class boundary is explicit?
```

The risk this file exists to prevent:

```text
not:  overlay T1 and Candidate A because they exist
not:  put them on Inspector L2 as if they were V_i
not:  a fourth Guided experiment named “mesocyclone”
not:  resume comet polish by inertia
not:  add an eighth VelocityField to have something to show
not:  start camera/Follow/dataset because they are old P1/P2
```

---

## 2. Current product state

Verified against live `src/**` and the SoT listed above.
Does not reopen closed physics.

### 2.1 What the user can do

```text
Explore
  arbitrary point release (altitude + XZ)
  Pause / speed / Reset / Clear
  pick a visible glyph; shared Inspector L1/L2
  empty session legal

Guided v1
  exactly three experiments (`17` / `20`)
  Observe / Demonstrates / Does not mean
  in-place Reset; switch → fresh lab
  same seven-operand V_total as Explore
  shared Inspector

Perception
  sparse scientific tracers + trails
  provisional visual airflow (comets) on Explore
  operand |V_i| tint as diagnostic capability (`24`)
  hodograph overlays on a fixture layer
  Background highlight REJECTED

Model
  seven prescribed operands
  Euler, DEMO dt = 0.1 s, Eulerian-steady V
  continuity YELLOW
  Ω prescribed (Ω1 / Ω2)
```

### 2.2 Headless physics the product does not show

Wired on `ExploreLab` and `GuidedLab`, sampled in tests,
absent from Inspector source and visual population
(composition tests lock this):

```text
DiagnosticTiltingTendency.sample(P,t)     T_tilt,y   [s⁻²]
DiagnosticVerticalVorticity.sample(P,t)   ω_y,current [s⁻¹]
```

DEMO evidence (research, not UI):

```text
T1          signed vortex couple, offset along env ω_h
            |T|_max ∼ 10⁻⁵ s⁻²
            independent of Ω

Candidate A on-axis shielded vortex of prescribed Ω
            axis peak 2Ω = 0.010 s⁻¹ at rotation y_mid
            zero ring r = σ√2; opposite-sign outer annulus
            independent of sounding / W0
```

They are **not** velocity operands, **not** L2 rows, and
they do **not** change parcel motion.

### 2.3 Known deferred items (not automatically next)

From `19` / `21` / `24` / `30`, still unresolved and **not**
selected by those files as the current branch:

```text
Inspector Level 3
camera pan / target translation / reset view   (21 P1)
Follow selected tracer
Guided visual population
comet product lock-in / streamlines / volumes
delete-one, line/plane/volume seeding
dataset V adapter
stretching diagnostic, T2, ω → V, thermo
```

`21` §9 once said perception-of-the-whole plus P1 framing
was the CONCEPT gap after Guided v1. `24` then closed the
*current* perceptual-airflow question as “answered enough,”
deferred further `V_total` visual grammar, and sent work to
**model development**. That model development (T1, Candidate
A, class lock) is now done. This checkpoint re-ranks
*product* work against that new fact. It does **not**
silently revive `21` Candidate 2 (camera) or Candidate 1
polish.

---

## 3. Options

### 3.1 A — Diagnostic UI for T1 / Candidate A

Make the two closed diagnostics *inspectable in the
product*, without feeding `V`. Encoding is **not** chosen
here. Families that would have to be ranked in a later
design SoT:

```text
point sampling at a selected tracer / probe
dedicated diagnostic readout (not L2)
Eulerian slice / overlay
explicit comparison of T1 vs Candidate A
```

### 3.2 B — Richer prescribed model / scenario

Another prescribed mechanism, scenario variation, or
structural richness *before* polishing diagnostic
presentation.

`15` already judged the additive cartoon complete enough
to stop sibling `VelocityField`s. `30` does not authorize
new physics class. A new occupant invented “to have UI”
is forbidden.

Honest B-suboptions would be **scenario pedagogy**, not
new operators, e.g. a labeled `Ω = 0` exhibit so T1’s
couple can be seen without painted spin. That is still a
product/catalog decision, not a physics SoT, and it is
**weaker** until T1/A are even readable at a point.

### 3.3 C — Product interaction debt

Camera pan/reset, Follow, deselection, seeding shapes.

These constrain *framing* and *following a probe*. They
do not reveal T1 or Candidate A. They do not depend on
the new diagnostics. P1 remains real (`21`, `24` §2.11)
and must not hitchhike into a diagnostic branch.

### 3.4 D — Perceptual airflow revisit

Resume comet count/opacity/palette, multi-operand display,
streamlines, volumes.

`24`: diminishing returns against current DEMO occupancy;
Background REJECTED; further `V_total` optimization
deferred. No playtest since `24` overturns that. Do not
resume by inertia.

### 3.5 E — Documentation / teaching layer

Mechanism copy that explains T1 vs Candidate A, class A
limits, anti-claims — without new physics or visualization.

High honesty, low CONCEPT “perceive” leverage. Useful as
**companion copy** if A happens; weak as the *only* next
direction while sampling ports already exist in the labs.

### 3.6 F — Other directions found in-repo

```text
F1  Dataset adapter          LONG-TERM (`30`); not now
F2  Inspector L3 of *env*    (SRH / ω_h at tracer y)
    without T1/A             hodograph already teaches
                             column env; does not answer
                             the new rotation questions
F3  RK2 production cutover   numerics ≠ product direction
F4  Continuity solver        rejected as rotation/product
                             branch (`10`, `30`)
```

None of F1–F4 is the next product direction.

---

## 4. T1 / Candidate A UI value

### 4.1 User questions that become answerable

If **T1** is visible at a point (and later, spatially):

```text
At this place, would environmental shear and the prescribed
updraft tend to create world-vertical vorticity, and with
what sign?
```

That is **not** “why this tracer rotates.” L2 already
answers motion from `V_i`. T1 is a tendency of two
prescribed ingredients.

If **Candidate A** is visible at a point (and later,
spatially):

```text
At this place, what world-vertical vorticity currently
exists in V_total?
```

On the CURRENT stack that number is the shielded vortex of
`Ω`. It is **not** accumulated T1.

If **both** are visible **together**, with units and
anti-claims:

```text
Are “where spin would tend to be generated” and
“where spin currently is” the same object?
```

DEMO answer: **no** (couple vs on-axis shielded vortex).
That comparison is the teaching prize `27` earned and `29`
reaffirmed. It is currently buried in research markdown.

### 4.2 T1 UI

| | Rating | Notes |
| --- | --- | --- |
| scientific value | HIGH as *access* to a closed diagnostic; LOW as new physics |
| teaching value | HIGH if labeled tendency [s⁻²], couple, independent of Ω |
| visualization value | HIGH only if spatial structure is shown; MEDIUM for a point number |
| false-causality risk | **HIGH** if copy says this is why the chimney spins |
| confuse with `V_total` | HIGH if placed on L2 or given comet `|V_i|` tint |

### 4.3 Candidate A UI

| | Rating | Notes |
| --- | --- | --- |
| scientific value | HIGH as access to current `ω_y`; still bookkeeping of Ω |
| teaching value | HIGH if core / zero ring / outer annulus are not hidden; if language is positive/negative `ω_y` |
| visualization value | HIGH for the shielded pattern; dangerous as a “mesocyclone overlay” |
| false-causality risk | **HIGH** (“I can see the rotation” read as generated) |
| confuse with `V_total` | **HIGH** vs L2 `rotation` row (`V` in m s⁻¹ ≠ `ω_y` in s⁻¹) |

### 4.4 Where they belong (if UI is ever designed)

**NEW PROJECT DECISION for a future design SoT, not
implementation:**

```text
NOT Inspector L2
NOT a parts row
NOT comet operand tint
NOT a new VelocityField
```

Preferred home:

```text
Explore:  YES — primary
          arbitrary seeding already is spatial inquiry (`18`)
          user can occupy T1 couple vs axis vs outer ring

Guided:   NOT a new experiment
          optional later *readout* on the same three
          exhibits is allowed only if Demonstrates is
          unchanged and Does not mean still forbids capture

Separate diagnostic mode:  NOT required for v1
          a fourth shell would split the laboratory

Nowhere yet:  rejected as the standing product state
          headless-only is a hole now that class is locked
```

v1 encoding lean (recommendation, not a slice):

```text
point sample of BOTH diagnostics at the selected probe
  (or at an explicit sample point)
units visible
signed values
one-sentence anti-claim
no overlay, no signed volume, no dipole map in v1
```

Overlay / slice remains a **later** encoding question.
`24` Background REJECTED; `26` / `28` forbade overlay in
the physics implementation. A diagnostic overlay would be
a new perceptual family, easier to overfit to DEMO couple
+ DEMO shielded vortex than a number on a probe.

---

## 5. Richer model before polish — does it still hold?

`24` §1 / §4:

```text
perceptual investigation reached diminishing returns
against the current model class
→ more model structure is the higher-information next step
→ later perceptual decisions re-evaluated against that structure

trying to finish a product visual grammar against DEMO
geometry risks overfitting occupancy, then throwing the
grammar away when the model class changes
```

**Split the claim.**

### 5.1 Still holds

```text
do not resume comet / |V_i| tint / volume polish of V_total
do not add sibling VelocityFields to feed visualization
do not lock a whole-storm visual grammar on DEMO occupancy
  (offset downdraft, thin NG, prescribed Ω, YELLOW div)
```

The velocity cartoon is still the same seven operands.
`15` completeness of additive occupants is unchanged.
`30` will not replace that cartoon with prognostic `V`
in NEXT PHASE.

### 5.2 Superceded as a reason to hide T1 / Candidate A

`24` sent work to model development so later *perception of
`V`* could be judged against richer structure. The structure
that actually arrived is **L1 diagnostics**, not a new `V`.
`30` then **held** the velocity class.

Waiting for a class change before showing T1/A would wait
for something `30` parked. Headless diagnostics with no
product surface would become a permanent research attic.

### 5.3 Would T1/A *overlay* repeat the `24` mistake?

**YES.** A signed 3D overlay of the DEMO couple and the
DEMO shielded vortex *is* overfitting those two spatial
objects into a visual grammar that a later dataset `V`
would not share.

**Point sampling would not.** Inspector L1/L2 is already
point inquiry. Sampling two more named scalars at the same
`(P,t)` is the same interaction class, a new quantity
class. Reversible. Dataset-portable as “sample diagnostic
at probe.”

```text
STILL HOLD     defer V_total perceptual polish
STILL HOLD     no new prescribed occupant for show
SUPERSEDED     “hide T1/A until the model class changes”
AVOID          diagnostic overlay as the first UI
EARNED         point-access design as product direction
```

---

## 6. Guided

Exactly three experiments. Isolation is seed + copy, not a
different `V` (`17`).

Validated T1 / Candidate A do **not** earn a fourth
experiment. A “tilting” or “mesocyclone” card would name
physics the pathlines do not enact (`17` §4: no capture,
no mesocyclone as a teaching object).

Enrichment of an existing experiment (readout of T1/A on
S1/D1/NG1) is **optional later**, only if:

```text
Demonstrates unchanged
Does not mean unchanged
values are context, not the exhibit
```

**Guided conclusion:** no catalog change. Not the primary
home. Shared readout may follow Explore if a design SoT
puts diagnostics on the shared Inspector *diagnostic*
surface (not L2).

---

## 7. Explore

Explore is the better home for v1 diagnostic access:

```text
user chooses P
Pause freezes laboratory t
multiple probes can occupy couple, axis, ring
empty session + one probe is enough
```

That is already the inquiry loop (`18`, CONCEPT Explore =
atmospheric laboratory). Guided canonical ICs are sparse
and not placed to teach T1’s couple or Candidate A’s ring.

**Explore conclusion:** primary product surface for
diagnostic *access*. Not a license for overlay, Follow, or
camera as part of the same slice.

---

## 8. Ranking

Scale: HIGH / MEDIUM / LOW.

| | A diagnostic UI (point-first) | A′ overlay-first | B new occupant / scenario | C camera / Follow | D comet revisit | E docs-only |
| --- | --- | --- | --- | --- | --- | --- |
| Product value | **HIGH** (new questions become askable) | HIGH visual, LOW honesty | LOW occupant; MEDIUM `Ω=0` exhibit later | HIGH framing (P1); does not show T1/A | LOW incremental (`24`) | MEDIUM for specialists |
| Scientific honesty | HIGH if anti-claims + units | LOW–MEDIUM | HIGH if no fake mechanism | HIGH | HIGH if still provisional | HIGH |
| Reversibility | HIGH (point readout) | LOW | LOW if new `V_i`; MEDIUM scenario flag | MEDIUM (camera contracts) | LOW if art locked | HIGH |
| Implementation cost | LOW–MEDIUM after a design SoT | HIGH | HIGH new physics; MEDIUM scenario | MEDIUM | MEDIUM | LOW |
| Architectural risk | MEDIUM (L2 contamination) | HIGH | HIGH (`Y12` / eighth operand) | MEDIUM (placement picking) | MEDIUM (mass misread) | LOW |
| Overfitting risk | LOW for point numbers | **HIGH** | HIGH if invented mechanism | LOW | **HIGH** (`24`) | LOW |
| Unresolved physics | LOW (diagnostics CLOSED) | LOW physics / HIGH encoding | HIGH if new operator | none | none | none |
| Teach supercell mechanics | HIGH for tendency vs existence | HIGH pattern, HIGH false story | LOW unless `Ω=0` contrast after A | LOW directly | LOW (same `V`) | MEDIUM |

Rank for **next product direction**:

```text
1  A  point-first diagnostic access (T1 and Candidate A)
2  E  teaching copy as companion, not instead of A
3  C  camera P1 — real debt, different question
4  B  Ω=0 / scenario contrast — after A is readable
5  D  comet revisit — still deferred
—  A′ overlay-first — not next
—  F  dataset / solver / RK2 — not next
```

---

## 9. Recommendation

```text
NEXT PRODUCT DIRECTION:     A — diagnostic access
                            for closed T1 and Candidate A
CONFIDENCE:                 HIGH on “not D/B-occupant/A′”
                            HIGH on Explore-primary, not L2
                            MEDIUM–HIGH on point-first vs
                              waiting for a larger UI
```

Why A:

- Class is locked (`30`). The next gap is **user access**
  to questions the laboratory can already answer honestly.
- T1 vs Candidate A is the post-T1 teaching prize and is
  currently research-only.
- Point sampling uses Explore’s existing spatial inquiry
  and does not repeat `24`’s `V_total` overlay overfitting.
- Guided expansion and comet polish are not earned.
- Camera/Follow remain real but do not surface the new
  objects.

Why not `NO PRODUCT IMPLEMENTATION YET` as the standing
verdict:

Headless-only is no longer a physics pause. It is a
product hole. The direction is earned. **Implementation
is still not authorized** (`§10`).

Why not overlay-first or a full diagnostic workbench in
the same breath:

That would smuggle encoding, signed color, and DEMO
geometry into the first slice. `24` / `26` / `28` already
warned.

### 9.1 Next small design step (not implementation)

The next design step is a **diagnostic observation UI
architecture SoT** (docs-only) that locks:

```text
IN SCOPE
  owner: not L2, not parts, not Simulation, not visual
    occupant runtime
  sampling: live ExploreLab/GuidedLab diagnostic instances
    SAME-source as today
  v1 surface: point values of T_tilt,y and ω_y,current
    at selected probe (P, t)
  both diagnostics together (comparison), never one
    relabeled as the other
  units, signs, anti-claims
  Explore primary; Guided readout policy
  explicit non-goals: overlay, L2, comet tint, new
    Guided experiment, Follow, camera, stretching

OUT OF SCOPE
  production code
  encoding of Eulerian slices
  cyclonic/anticyclonic product language
  ROADMAP.md
```

Filename is not locked here. Do not treat this checkpoint
as that SoT.

### 9.2 Implementation authorization

```text
Does this document authorize any production implementation?
NO.
```

Implementation is out of scope for this SoT. It does not
authorize Inspector edits, overlays, Guided
catalog changes, camera, Follow, comet work, dataset
support, or new physics.

A diagnostic observation UI architecture SoT is required
before implementation.

---

## 10. Unresolved questions

Not a backlog commitment.

```text
U1  Inspector diagnostic section vs a panel beside L1/L2
    (L3 was reserved in `19` for env/column; T1/A may
    need a named rotational-diagnostic surface instead
    of stuffing SRH-era L3)
U2  Whether Guided shares the readout in v1 or Explore-only
U3  When, if ever, an overlay/slice SoT is earned
U4  Whether camera P1 should be a *separate* product
    slice after diagnostic access
U5  Whether an Ω=0 scenario exhibit is ever wanted
U6  Copy language: keep “positive/negative ω_y”; never
    canonicalize cyclonic (`23`)
```

---

## 11. Anti-claims

```text
T1 UI is not generated rotation
Candidate A UI is not prognostic ω
showing both is not an evolution bridge
point values are not a mesocyclone map
Inspector L2 rotation is still V_rotation
comet |V_i| tint is not ω_y and not T1
a fourth Guided experiment is not earned
camera/Follow are not this branch
comet polish is still deferred (`24`)
class lock is not a visualization lock-in
this file is not a diagnostic-UI architecture SoT
this file is not ROADMAP.md
```

---

## 12. Documentation / authority

```text
this file:     post-model-class product direction
30:            model class — not replaced
24:            perceptual loop — V_total polish still deferred
21:            capability map — historical ranking; this
               file re-ranks product work after T1/A/30
26 / 28:       headless T1 / Candidate A — UI still unstarted
19:            Inspector L1/L2 live; L3 not started
```

Successor pointer only on `30`. Closed physics docs are
not rewritten.

---

## 13. Compact lock-in

```text
CLASS:                  prescribed kinematic laboratory
                        (`30`) UNCHANGED

HEADLESS T1 / A:        CLOSED / VALIDATED
                        not in product UI

NEXT PRODUCT DIRECTION: diagnostic ACCESS
                        T1 and Candidate A
                        point-first
                        Explore primary
                        not L2
                        not overlay v1
                        not new Guided experiment

NEXT DESIGN STEP:       diagnostic observation UI
                        architecture SoT
                        NOT WRITTEN HERE
                        NOT IMPLEMENTATION

V_total PERCEPTUAL
POLISH:                 still deferred (`24`)

CAMERA / FOLLOW:        unresolved; not this branch
DATASET:                still LONG-TERM (`30`)

IMPLEMENTATION
FROM THIS FILE:         NONE

CONFIDENCE:             HIGH on ranking
                        MEDIUM–HIGH on point-first A
```

---

## 14. STOP

```text
POST-MODEL-CLASS PRODUCT DIRECTION
  DECIDED AS A CHECKPOINT
  NOT AN IMPLEMENTATION ORDER

NEXT DIRECTION
  A — POINT-FIRST DIAGNOSTIC ACCESS
      (T1 and Candidate A)

NEXT DESIGN
  diagnostic observation UI architecture
  NOT THIS FILE

NOT NEXT
  overlay / signed volume
  Inspector L2 contamination
  Guided catalog expansion
  comet revisit
  camera / Follow
  new VelocityField
  dataset adapter
  stretching / T2 / ω→V
```

UI, new physics, Guided expansion, airflow
polish, camera/Follow, and dataset support implementation
are out of scope for this SoT.
