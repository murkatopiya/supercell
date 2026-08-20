# Post-Point-Diagnostics Product Direction Checkpoint

**Status:** DECISION CHECKPOINT / POST-POINT-DIAGNOSTICS v1 /
NO IMPLEMENTATION AUTHORIZATION
**Scope:** re-rank the next *product* capability now that
Explore point-diagnostics v1 is live. Not a Follow
architecture SoT. Not an overlay/slice SoT. Not Inspector
L2. Not a Guided catalog expansion. Not `ROADMAP.md`.
**Physics:** T1 and Candidate A remain CLOSED. Model class
remains prescribed kinematic laboratory (`30`). This file
does not reopen `22`, `23`, `26`, `28`, `30`, `31`, or `32`.
**Implementation:** none. Docs-only. Production `src/**`
MUST remain unchanged.

Predecessor diagnostic observation UI architecture:

```text
docs/architecture/32-diagnostic-observation-ui-architecture.md
```

`32` locked point-first observation UI for T1 and
Candidate A. Slice 1 (headless adapter) and Slice 2
(Explore presentation) are COMPLETE. Explore
point-diagnostics v1 is IMPLEMENTED. Guided mount remains
DEFERRED / NOT IMPLEMENTED. Overlay/slice is NOT
IMPLEMENTED. This file answers what product work is earned
**after that access exists**. Completing `32` / Slice 2
does **not** start Follow, overlay, Guided mount, or new
physics.

Accepted implementation commit for the live surface this
checkpoint re-ranks against:

```text
bc1327792be47fe822d6230509f127f8e63e66bf
```

Related product / perception / diagnostics (not replaced):

```text
docs/CONCEPT.md
docs/ARCHITECTURE.md
docs/architecture/16-explore-guided-interaction-architecture.md
docs/architecture/17-guided-experiment-catalog.md
docs/architecture/19-shared-tracer-inspector.md
docs/architecture/21-whole-product-direction-checkpoint.md
docs/architecture/24-perceptual-exploration-checkpoint.md
docs/architecture/30-model-class-decision.md
docs/architecture/31-post-model-class-product-direction-checkpoint.md
docs/rendering/11-deep-storm-tracer-view.md
docs/physics/22-diagnostic-tilting-tendency.md
docs/physics/23-diagnostic-vertical-vorticity.md
docs/research/2026-08-20-t1-demo-field-validation.md
docs/research/2026-08-20-candidate-a-demo-field-validation.md
```

Successor selected-tracer Follow camera architecture:

```text
docs/architecture/34-selected-tracer-follow-camera-architecture.md
```

`34` is the Follow camera-contract SoT this checkpoint
required. This file remains the post-point-diagnostics
product-direction checkpoint. Completing `34` does **not**
start Follow implementation.

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

Explore now shows T1 and Candidate A at the selected
tracer. The previous product ranking (`31`) chose that
access while both diagnostics were still headless. That
ranking is **not** automatically continued.

The remaining question is product, not formula:

```text
What is now the biggest obstacle between the user and
understanding the current model?
```

Inside already-chosen model class A (`30`):

```text
prescribed kinematic laboratory
seven operands
Ω prescribed (Ω1 / Ω2)
T1 and Candidate A observe; they do not feed V
V_total unchanged
Guided unchanged / three experiments
Inspector L2 unchanged / seven operands
```

The risk this file exists to prevent:

```text
not:  overlay T1/A because the panel exists
not:  resume comet polish by inertia (`24`)
not:  start Follow only because it is old CONCEPT debt
not:  a fourth Guided experiment named “tilting”
not:  Inspector L3 for T1/A (`32` closed that)
not:  reopen model class (`30`)
not:  treat unlabeled OrbitControls pan as a Follow design
```

---

## 2. Current product capability map

**Kind:** CURRENT FACT, verified against live `src/**` and
the accepted commit above.

### 2.1 Explore

The user can:

```text
see the hodograph (shared fixture)
toggle hodograph overlays
  Storm motion C
  Storm-relative wind V_sr
  Horizontal vorticity ω_h
  Streamwise / crosswise vorticity

release a tracer at a chosen horizontal point + altitude
  Enable placement → ground-plane click → preview → Confirm
  default altitude 1000 m
  release does not auto-select

run / pause / reset the laboratory
  Pause / Resume
  Reset (cohort replay; selectedId kept if present)
  Clear (drop tracers; clock unchanged)
  timeScale 1× / 5× / 10× / 20×

observe 3D passive tracer motion
  scientific glyphs + trails
  Explore visual airflow workbench
    default encoding: points
    optional: advected marks / comets / Eulerian marks
    operand |V_i| tint as diagnostic capability
    Background highlight not constructed (REJECTED, `24`)

select a scientific tracer (glyph pick)

Inspector L1 — current motion
  id, world position, altitude, time, age, active,
  V_total, speed

Inspector L2 — seven V_i contributions
  Environmental advection
  Updraft
  Rotation
  Lower inflow
  Upper outflow
  Downdraft
  Near-ground outflow

Point diagnostics (Explore-only sibling panel)
  Vertical-vorticity tilting tendency  T_tilt,y   s⁻²
  Current world-vertical vorticity     ω_y,current s⁻¹
  sampling hint: field-at-marker, not tracer-owned
  explicit causal anti-claim block whenever values show
```

Live mount (`App.tsx`):

```text
workbench__column--inspector
  TracerInspectorPanel          shared Explore + Guided
  PointDiagnosticsPanel         lab.kind === "explore" only
```

Empty placeholders are distinct:

```text
Inspector:          Select a tracer to inspect its motion.
Point diagnostics:  Select a tracer to sample diagnostics
                    at its current position.
```

### 2.2 Guided

```text
exactly three experiments
same V_total as Explore
curated initial conditions / teaching copy
shared Inspector L1/L2
no Point diagnostics panel
```

| Public id | Title |
| --- | --- |
| `inflow-to-upper-outflow` | Inflow to upper outflow |
| `downdraft-path-to-ground` | Downdraft path to the ground |
| `near-ground-outflow` | Near-ground outflow |

Honesty line (shared):

```text
This is a prescribed storm-relative laboratory, not a
real supercell simulation.
```

Observe / Demonstrates / Does not mean are unchanged.
Guided labs still own headless `tiltingTendency` and
`currentVerticalVorticity`. The App does not sample or
mount them.

### 2.3 Perception / navigation limitations that remain

```text
provisional tracer / comet treatment (`24`)
  live default visual encoding = points, not comets
  comets remain an opt-in workbench mode
camera / Follow deferred
  OrbitControls around DEEP_STORM_TRACER_VIEW
  target (0, 4000, 0) m
  camera (12000, 6000, 12000) m
  FOV 50°, enableDamping false
  enablePan is Three.js default true — unlabeled, not a
    designed product pan/reset-view control
  no CameraState abstraction
  no Follow API
  simulation Reset does not move the camera
  rendering `11`: this view fixture does not follow tracers
no diagnostic overlay / slice / glyph field for T1 or A
no free 3D probe (`32` rejected for v1)
no dataset mode
no new model dynamics
no two-tracer diagnostic comparison (`32`)
hodograph selectedHeight remains 0; vorticity layer
  fixture [0, 1000] m
```

Scientific tracers are pickable spheres (radius 150 m)
with selected highlight `0xffcc33`. Visual occupants
have `raycast = () => {}` and are not pickable.

---

## 3. What Point diagnostics changed

**Kind:** ASSESSMENT. Not a reopen of `32`.

Before Slice 2, T1 and Candidate A were headless: wired
on both labs, sampled in tests, absent from the product
surface (`31` §2.2). After Slice 2 they are readable at
the live selected Explore tracer, resampled on the
Inspector cadence.

`32` locked the scientific meaning of that readout:

```text
a selected tracer moving through an Eulerian field
```

Values are not tracer-owned state.

### 3.1 Gaps that shrank

```text
access to closed T1 / Candidate A in Explore
  CLOSED for selected-tracer point samples

Task 2 at a selected probe
  “what is happening here now / what is already present”
  now answerable at one (P, t)

textual tendency ≠ existence
  anti-claim block is on-screen whenever values show
  Ω-prescription of ω_y,current is named in the panel

quantity-class separation from motion
  L2 still answers “why this V”
  Point diagnostics do not sit on L2
```

Ω-prescription is **less** confusing *at a point* than
it was when Candidate A was research-only: the panel
says the vorticity already exists in `V_total` and is
prescribed through Ω. L2 “Rotation” remains `V_rotation`
in m s⁻¹. The two readouts can still be skimmed as
siblings of “rotation,” but they are no longer hidden.

### 3.2 Gaps that remain

```text
WHERE the sample sits in diagnostic field space
  couple vs axis vs zero ring vs outer ring vs envelope
  is not shown; only two numbers at one P

Task 3 — compare places efficiently
  one selected id at a time; no overlay; no free probe

keep a diagnostically interesting tracer in view
  camera target stays at storm center unless the user
  orbits/pans unlabeled controls

read diagnostics while watching 3D motion
  right column is L1 + seven L2 rows + diagnostics +
  four-paragraph anti-claim; canvas height 420 px;
  only Inspector is sticky, not Point diagnostics

Guided still has no diagnostic readout
hodograph ↔ 3D storm still weakly linked
no new model dynamics (intentional, `30`)
```

### 3.3 Gaps that became more noticeable *because* diagnostics are visible

These are new *product pains*, not new physics debts.

**Where is the sampled point diagnostically?**
Numbers change as the glyph moves. The user is not told
whether they occupy T1’s signed couple, Candidate A’s
on-axis core, the exact zero ring `r = σ√2`, or the
outer opposite-sign annulus. The teaching prize of `27` /
`29` / `31` was that those are **different spatial
objects**. Point access names the difference; it does
not show it.

**Can they keep a diagnostically interesting tracer in view?**
The selected glyph is now simultaneously:

```text
visual parcel
+ Inspector target
+ moving diagnostic probe
```

The camera still orbits `(0, 4000, 0)`. An inflow→outflow
or near-ground pathline leaves that frame. Live
resampling continues off-screen. Pause freezes `(P, t)`
honestly, but then the path-sampling contract `32`
designed is no longer experienced as motion through a
field.

**Can they compare spatial structure efficiently?**
No. Occupation with several probes plus one-at-a-time
pick is possible and was the v1 method (`31` §7, `32`
§7.2). It is slow, memory-taxing, and easy to seed in
the wrong place (updraft axis: T1 ≈ 0, Candidate A
near peak — a misleading “rotation lives where tilting
is zero” first hit).

**Does selecting a moving tracer create camera/attention friction?**
Yes. Attention splits between a fixed-orbit 420 px
laboratory and a tall right column. Point diagnostics
sit below L2, so the anti-claim can be below the fold
while the glyph is in motion.

**Does point sampling make absence of overlay newly painful?**
Yes as *desire*: numbers without a map invite “where is
this field?” No as *automatic authorization*: the
overfitting, units, prescribed-Ω, and false-causality
arguments against overlay-first (`31` §5.3) are
unchanged. §8 records that distinction.

**Does current comet perception make selection/tracking difficult?**
Conditionally. Default Explore encoding is **points**,
not comets. Yellow selected spheres remain distinct
from grey occupancy. Comets-on plus operand tint can
compete with the glyph. That is a mode-conditional
functional issue, not a reason to reopen `24`’s
`V_total` polish loop as the next product direction.

**Does Ω-prescription become more or less confusing?**
At a point: **less**, because copy names it. Spatially:
**unchanged / slightly more tempting** — live `ω_y,current`
next to a spinning chimney still reads as “the
mesocyclone” unless the user believes the anti-claim.
Visibility of the number does not by itself teach the
shielded-vortex geometry.

---

## 4. User-task assessment

Directions are ranked by tasks, not feature coolness.

### Task 1 — Follow a parcel of air

```text
Where did this tracer go?
What is moving it?
```

**Support:** MEDIUM.
Release, trails, Pause, Inspector L1/L2 answer path and
`V_i`. Camera does not travel with the parcel. P2 still
holds: env-only advection can carry a tracer out of
relevance while Inspector stays honest. Point
diagnostics do **not** answer Task 1 (they are not why
the parcel moves).

### Task 2 — Interrogate a point

```text
What is happening here now?
What is already present here?
```

**Support:** HIGH at a selected Explore tracer; LOW
elsewhere.
L1 + L2 + T1 + Candidate A now share one `(P, t)`.
No free 3D probe. Release does not auto-select. Guided
has no diagnostic panel. Frozen Pause is the reliable
reading posture.

### Task 3 — Compare places

```text
How do T1 / ω_y,current differ across the storm?
```

**Support:** LOW.
One sample, one selected id, pathlines follow `V_total`
rather than scanning diagnostic isosurfaces. Research
structures (T1 couple, Candidate A core / zero ring /
outer ring, vertical envelopes) remain off-screen.

This is the worst-supported task that the T1/A product
investment actually exists to serve.

### Task 4 — Build causal understanding

```text
What does this model prescribe?
What does it diagnose?
What does it NOT evolve?
```

**Support:** MEDIUM.
Guided Does not mean, laboratory honesty line, L2 vs
Point diagnostics, and the anti-claim block are all
live. The user can *read* that T1 does not generate
Candidate A. They still cannot *see* couple ≠ shielded
vortex, and they cannot occupy an Ω = 0 laboratory.
Textual honesty is present; experiential contrast is
not.

### Task 5 — Connect hodograph to storm

```text
How does environmental wind/vorticity information
relate to what I see in the 3D laboratory?
```

**Support:** LOW–MEDIUM, **not newly urgent**.
Hodograph overlays remain a height-0 / `[0, 1000]` m
fixture. T1 conceptually uses env `ω_h` and updraft
gradient, but the panel does not bind hodograph height
to the tracer’s altitude. Point diagnostics did not
make a dataset-backed sounding more necessary.

### 4.1 Which task matters most now

```text
worst supported among the diagnostic prize:  Task 3
newly unblocked / still friction-bound:       Task 2 live path
CONCEPT-central and still camera-weak:        Task 1
causal literacy half-done as text:            Task 4
not the present bottleneck:                   Task 5
```

Product concept after class lock (`30`) and diagnostic
access (`31`/`32`) is still: understand this prescribed
laboratory honestly. The leftover of the T1/A investment
is spatial comparison (Task 3). The leftover of the
*chosen v1 method* (moving probe) is that the probe is
hard to keep jointly in view and in mind (Task 1 + live
Task 2).

§9 ranks which of those leftovers is the next
*capability*, given that overlay is not silently earned.

---

## 5. Camera / Follow special review

**Kind:** feasibility / value checkpoint.
Not a Follow architecture SoT. Not a camera-engine
design. `ARCHITECTURE.md` §24 remains binding:

```text
In Follow mode, the camera observes a tracer.
It does not control or pull the tracer.
```

`19` remains binding: auto-Follow on select is **not
desirable**; Follow is user-initiated and cancellable
when later specified. Recreating the scene on select
remains forbidden.

### 5.1 Is there already a camera abstraction?

```text
no CameraState
no Follow API
TracerScene owns private PerspectiveCamera + OrbitControls
DEEP_STORM_TRACER_VIEW is a pose/grid/glyph fixture
simulation Reset does not restore or move camera
```

Follow does **not** require a generic camera engine.
A later SoT can hang a per-frame orbit-target (and
optional preserved offset) on the existing controls
object. Architecture cost is MEDIUM: picking
coexistence (`shouldAcceptStationaryClick`, placement
vs orbit drag), lifecycle, and Explore/Guided policy
must be specified. It is not HIGH if the SoT refuses a
mode framework, Journey camera, and damping rewrite.

Rendering `11` forbids follow **inside that view
fixture**. That is fixture scope, not a project-wide
ban on CONCEPT §7. A Follow SoT would define how Follow
coexists with the canonical rest pose; this checkpoint
does not rewrite `11`.

### 5.2 What Follow should mean (recommendation, not lock)

Do **not** collapse these:

| Meaning | Value for current product | Honesty / scale risk |
| --- | --- | --- |
| Orbit / pan / zoom quality | Pan already exists unlabeled; product pan/reset-view is still undesigned | Low; different question from Follow |
| Selected-tracer Follow | **High now** — keep the diagnostic probe framed | Medium if it hides storm scale |
| Automatic camera | Low — fights user investigation | High if it steals control |
| Cinematic polish / Journey pose | Not earned | High vs laboratory scale |

For diagnostics comprehension, the useful Follow is
**framing**:

```text
orbit center tracks selected particle.position
user-controlled orbit/zoom around that moving center
optional preserved camera-offset so the glyph does not
  collapse to a speck
```

Not first-person ride-along as v1 (hides kilometres of
laboratory, which `21` already warned). Not look-at
without offset (glyph can stay in view as an unreadable
dot). Not auto-on-select (`19`).

CONCEPT §7 “travel with the air” remains a later,
stronger Lagrangian mode. It is not required to earn
Follow-as-framing.

### 5.3 Lifecycle (questions a Follow SoT must answer)

Live selection already defines the probe. Follow should
observe that contract, not invent diagnostic-owned
camera state.

| Event | Expected product question |
| --- | --- |
| Selected tracer moves | Orbit center tracks `particle.position` while Follow is on |
| Inactive selected tracer | Marker still exists and is inspectable (`19`); Follow may remain on the marker |
| Reset | `selectedId` may be kept; `P` jumps to restored seed. Camera must not silently keep an old offset into empty air |
| Clear | Selection cleared → Follow off; rest pose policy required |
| Explore ↔ Guided / Guided experiment switch | Selection cleared → Follow off; no leftover target |
| Selected tracer disappears / id missing | Same as Inspector: no target → Follow off |
| No selection | Follow cannot be on |

Placement picking and glyph pick must keep winning over
orbit-scale drags (`resolveTracerPointerUp`). Follow
must not disable inspection.

### 5.4 Explore-only or shared?

Selection exists in both modes. Diagnostics are
Explore-only. Task 1 exists in Guided (curated
pathlines, including P2 downstream loss).

```text
earning context now:     Explore moving diagnostic probe
capability family:       shared interaction (camera observes
                         selected tracer)
Guided diagnostics:      still not mounted; Follow is not
                         a substitute Guided mount
```

A Follow SoT may still ship Explore-first presentation
(control visible in Explore) without forbidding Guided
use. This checkpoint does **not** lock that split.

### 5.5 Navigation or teaching?

Both, with a primary role:

```text
Follow-as-framing = investigation/teaching-adjacent
                    navigation

It makes the existing point-first loop perceptible.
It is not a new diagnostic encoding.
It is not cinematic Journey (`16` camera Journey ≠
  CONCEPT Journey Mode).
```

### 5.6 Can Follow improve diagnostics comprehension enough to be next P1?

**Yes, for the live half of Task 2 and for Task 1.**
`32` made live Eulerian resampling the meaning of the
readout. Without framing, that meaning is implemented
as a column of numbers attached to a glyph the
fixed-orbit viewport may lose.

**No, for Task 3 as Eulerian structure.**
Following an axis tracer still shows T1 ≈ 0 and peak
`ω_y,current`. Follow does not paint the couple, zero
ring, or outer annulus.

That limitation is why Follow is **not** “overlay by
other means.” It is why overlay stays a separate
question (§8). Follow is still the next *capability*
because the chosen v1 method (occupation by probes)
has not been given a fair camera, and overlay is not
earned on desire alone (§8.3).

Unlabeled pan does **not** satisfy this need. Pan
translates the storm-center target; it does not track a
moving probe. `21` P1 (product pan/reset-view) remains
real and remains a **different** candidate. This
checkpoint does not bundle them.

---

## 6. Overlay special review

Point diagnostics give **one moving sample**.

Research structures the user still cannot see as
fields:

```text
T1 couple (signed dipole, offset along env ω_h,
  ~0 on the updraft axis)
Candidate A positive core (on-axis shielded vortex of Ω)
zero ring r = σ√2
outer opposite-sign ring
vertical envelopes of both
```

### 6.1 How hard is spatial structure without overlay?

**Hard**, if the goal is Task 3.
Pathlines sample along `V_total`, not along diagnostic
gradients. Free probe is absent. Axis-first seeding —
the most obvious Explore click near the chimney —
occupies the *least* informative T1 point and the
*most* painted Candidate A point. That first hit can
unteach the couple-vs-core prize.

**Possible**, if the goal is Task 2 at luckily placed
probes, especially on Pause.

### 6.2 Binding constraints that have not gone away

```text
overlay-first was rejected/deferred as v1 because it
  overfits DEMO couple + DEMO shielded vortex (`31` §5.3)
Background highlight remains REJECTED (`24`)
T1 and Candidate A have different units; no shared
  color scale (`32` §9)
Candidate A is prescribed Ω bookkeeping
overlay can visually dominate velocity teaching
overlay can imply T1 → ω_y by adjacent colored blobs
later dataset V would not share this DEMO geometry
```

### 6.3 Is overlay now earned?

**Not as implementation. Not as the next product
direction.**

What changed: point-first access exists, so overlay
would no longer be the *first* UI. Absence of a map is
newly painful because numbers exist without a spatial
referent.

What did **not** change: overfitting, units, prescribed
Ω, false-causal adjacency, and `24`’s warning against
finishing a visual grammar on DEMO occupancy.

`31`:

```text
not: overlay T1 and Candidate A because they exist
```

Overlay because they now exist *in the panel* is the
same trap one step later.

If spatial visualization is later earned, the only
question it is allowed to answer is:

```text
Where, in this laboratory, do T_tilt,y and
ω_y,current occupy different spatial structures?
```

Not: “show the mesocyclone.”
Not: “show generated rotation.”
Not: “a common colormap of rotation strength.”

That question remains **DEFERRED**. It does not cancel
`31`/`32`. A dedicated overlay/slice SoT is **not** the
next artifact.

Occupation with probes remains the v1 spatial method.
Follow is the interaction that makes that method
perceptible. If occupation+Follow still cannot teach
couple ≠ core, overlay can be reopened as a *later*
encoding question with this sharper brief.

---

## 7. Other candidates

### 7.1 Point-diagnostic teaching polish

The panel is new; copy is locked by `32` and matches
live `PointDiagnosticsPanel`. Tighter copy, collapse,
or provenance chrome could reduce column height.

Polish is **not** next only because the panel is new.
The anti-claim is doing its job as text. Hierarchy
(T1 vs A vs L2) is already structurally separate.
Missing provenance is not the bottleneck; missing
spatial referent and missing framing are.

### 7.2 Ω = 0 teaching exhibit

From `31` U5. Now stronger than it was while T1/A were
headless: the user can *read* `T ≠ 0` and `ω_y,current
= 0` in the same panel.

A controlled exhibit with prescribed rotation off can
make

```text
tilting tendency exists
≠
current vertical vorticity exists
```

experiential. Strict limits, still binding:

```text
not prognostic evolution
T1 must not magically create ω
not a genesis simulation
not Y12
not an eighth VelocityField
not Ω3 “background mesocyclone”
```

A new scenario/exhibit is **optional later**, not
required to complete v1 access. It still needs the user
to occupy the couple (axis sampling under Ω = 0 yields
T ≈ 0 and ω = 0 — a blank). Without Follow or curated
seeds, the exhibit is easy to miss. A fourth Guided
experiment named tilting/mesocyclone remains forbidden
(`17`, `31`, `32`).

### 7.3 Guided mount of Point diagnostics

`32` Slice 3: optional later; adapter already shared;
catalog copy unchanged; not a fourth experiment.

```text
teaching gain:     LOW–MEDIUM on current ICs
                   (seeds are not placed on couple/ring)
clutter:           HIGH next to Observe/Demonstrates
risk to three-experiment flow: HIGH if numbers are
                   read as the exhibit
all three vs one:  none of the three is a diagnostic
                   lesson; mounting all three is not
                   more honest than mounting none
needed now:        no
```

Guided mount is not next. Follow is not Guided mount.

### 7.4 Tracer / comet perception revisit

`24`: comets provisional; further `V_total` visual
optimization deferred. Live default is **points**.

New argument, distinct from aesthetic polish: find
selected tracer, keep it with the eye, read direction,
bind marker ↔ trail ↔ Inspector ↔ diagnostics.

That argument is **real when comets/tint are on**, and
**weak on the default Points encoding** with a yellow
150 m glyph. Functional tracking is better served now
by Follow-as-framing and existing selected highlight
than by reopening occupancy/palette/comet geometry.
Selected-trail emphasis remains a later optional (`19`),
not this checkpoint’s winner.

### 7.5 Inspector / diagnostic information architecture

Live right column:

```text
Inspector L1
Inspector L2  (seven V_i)
Point diagnostics  (T1, A, hint, anti-claim)
```

Density is **HIGH** and **currently justified**: two
questions must not collapse (`32`). Progressive
disclosure could wait. Inspector L3 for T1/A remains
closed. Collapse of the anti-claim into a hidden
widget would make the causal sentence easy to miss —
the opposite of `32` §7.

Overload exists as scrolling/attention cost. It is not
the CONCEPT bottleneck. Do not “fix density” by putting
T1/A on L2.

### 7.6 Richer prescribed model / scenario

`15` stopped sibling `VelocityField`s. `30` holds class
A. `24`’s richer-model-before-`V_total`-polish still
holds for **velocity encoding**. It does **not** license
an eighth operand “to have something new to show.”

Ω = 0 is scenario contrast, not a new operator. It is
ranked under §7.2, not as a model-class move.

### 7.7 Dataset / source direction

LONG-TERM POSSIBILITY (`30`). Point diagnostics did
**not** make this urgent. Sample-at-probe is already
the portable observation shape. Overlay-first would
have made DEMO geometry *more* sticky, which is a
reason to keep overlay deferred. Do not start
migration research.

### 7.8 Documentation / teaching surface outside live UI

Companion copy (concept notes, terminology) can help
specialists. It is not a substitute for framing the
live probe or for later spatial visualization. Inline
panel copy already carries the anti-claim. External
docs are not next.

---

## 8. Prioritization

Scale: LOW / MEDIUM / HIGH.

| Candidate | Teaching | Interaction | Honesty risk | Architecture cost | Visual clutter | Dependency | Reversibility | Fit class A |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **A. Selected-tracer Follow** (framing, not cinema) | MEDIUM–HIGH for live Task 2 / Task 1 | **HIGH** | LOW if scale preserved; MEDIUM if ride-along | MEDIUM (lifecycle + picking; no engine) | LOW | selection already live | HIGH (mode off → rest pose) | HIGH |
| A′. Product pan / reset-view (`21` P1) | LOW directly | HIGH framing of *storm center* | LOW | MEDIUM | LOW | picking coexistence | HIGH | HIGH |
| B. Point-diagnostic polish | LOW–MEDIUM | LOW | LOW if copy stays locked | LOW | can shrink column | none | HIGH | HIGH |
| C. Diagnostic overlay / slice | **HIGH** for Task 3 | HIGH scan | **HIGH** | HIGH encoding | HIGH | physics owners exist; UI does not | LOW | HIGH class / LOW vs DEMO overfit |
| D. Ω = 0 exhibit | HIGH for Task 4 | MEDIUM | HIGH if sold as genesis | MEDIUM catalog/scenario | LOW | needs occupation of couple | MEDIUM | HIGH if Ω occupant off, not Ω3 |
| E. Guided diagnostic mount | LOW–MEDIUM | LOW | MEDIUM exhibit contamination | LOW (adapter ready) | MEDIUM–HIGH | `32` Slice 3 | HIGH | HIGH |
| F. Comet / perception revisit | LOW on current `V` | MEDIUM if comets-on | MEDIUM mass misread | MEDIUM | MEDIUM | `24` still binds | LOW if art locked | HIGH |
| G. Right-column IA / collapse | LOW–MEDIUM | MEDIUM scroll | MEDIUM if anti-claim hides | LOW | can reduce | none | HIGH | HIGH |
| H. New prescribed operand | LOW (forbidden as show) | LOW | HIGH | HIGH | — | `15`/`30` | LOW | **fails guardrail** |
| I. Dataset adapter | HIGH later CONCEPT | LOW now | LOW if labeled | HIGH when started | — | `30` long-term | LOW once started | source-class, not now |
| J. Extra-UI teaching docs | MEDIUM specialists | LOW | LOW | LOW | none | none | HIGH | HIGH |

Any candidate that requires stretching, T2, prognostic
`ω`, `ω → V`, continuity solver, CFD, baroclinic chain,
Ω reinterpretation, or an eighth prescribed velocity
operand is **automatically not NEXT**. Model class `30`
stays binding.

### 8.1 Ranking

```text
1  A   selected-tracer Follow-as-framing
2  C   diagnostic spatial visualization — deferred as
         direction; overlay SoT not next
3  D   Ω = 0 exhibit — after occupation is usable
4  A′  product pan/reset-view — real, not bundled
5  G/B column density / copy polish — not the concept gap
6  E   Guided mount — still deferred (`32`)
7  F   comet revisit — still deferred (`24`)
8  J   extra-UI docs — companion only
—  I   dataset — still LONG-TERM (`30`)
—  H   new operand — not in class A
```

This is a **re-rank**, not `21` Candidate 3 by inertia
and not `31` leftover U4 by inertia. The new warrant is
the selected tracer’s expanded role as a moving
diagnostic probe (§3.3, §5.6).

---

## 9. Decision

```text
RECOMMENDED NEXT DIRECTION:
selected-tracer Follow-as-framing
(Explore-earned; shared interaction family;
not product pan; not cinematic Journey;
not automatic camera)

WHY NOW:
Explore point-diagnostics v1 made the selected tracer a
moving diagnostic probe whose locked meaning is live
Eulerian resampling along the path (`32`). The camera
still orbits a fixed storm-center target. That is now
the largest obstacle to *using* the laboratory the
product just built. Follow unblocks Task 1 and the live
half of Task 2 without a new physics class, without
overlay overfitting, and without a Guided catalog
change.

WHY NOT THE OTHERS:
Overlay/slice still overfits DEMO couple + shielded
vortex, cannot share a color scale, and would dominate
velocity teaching; point-first occupation has not been
given a fair camera. Ω=0 is a strong Task 4 exhibit but
still requires occupying the couple and is easy to sell
as genesis. Guided mount would clutter three pathline
lessons whose ICs are not diagnostic. Comet revisit and
V_total polish remain deferred (`24`). Column polish is
real scrolling cost, not the concept gap. Pan/reset-view
is a different P1. Dataset and richer dynamics stay
parked (`30`).

NEXT ARTIFACT:
docs-only architecture SoT
subject: selected-tracer Follow camera contract
```

### 9.1 What the next Follow SoT must lock (not written here)

```text
Follow meaning: framing vs ride-along vs look-at-only
user initiation / cancel (no auto-on-select)
coexistence with OrbitControls and placement picking
Reset / Clear / mode switch / missing id
Explore vs Guided presentation
rest pose = DEEP_STORM_TRACER_VIEW
camera observes; does not pull (`ARCHITECTURE` §24)
explicit non-goals: Journey camera, camera engine,
  overlay, Guided diagnostic mount, comet redesign
```

That SoT is **not** this file. Implementation of Follow
is out of scope for this checkpoint.

### 9.2 Implementation authorization

```text
Does this document authorize any production implementation?
NO.
```

Follow, overlay, Guided mount, comet work, Ω = 0
scenario, pan/reset-view, Inspector edits, dataset
support, and new physics are out of scope for this SoT.

---

## 10. Unresolved questions

Not a backlog commitment.

```text
U1  Exact Follow meaning (framing vs offset-preserving
    ride) — belongs in the Follow architecture SoT
U2  Explore-only Follow control vs shared presentation
U3  When, if ever, an overlay/slice SoT is earned after
    occupation+Follow has been tried (`31` U3 / `32` U1)
    — not earned as NEXT here
U4  Whether product pan/reset-view is a separate slice
    from Follow (this file: yes, they stay distinct)
U5  Whether an Ω=0 scenario exhibit is wanted after
    Follow (`31` U5 / `32` U4) — still optional later
U6  Guided diagnostic mount (`32` U2 / Slice 3) — still
    deferred; not coupled to Follow
```

`32` U3 (camera P1 after diagnostic access) is
**answered here** as: selected-tracer Follow-as-framing
is the next product direction; product pan is not
bundled. The question is not reopened.

---

## 11. Anti-claims

```text
this file does not implement Follow
Follow-as-framing is not cinematic Journey
Follow is not overlay
Follow does not pull tracers
auto-Follow on select remains undesirable (`19`)
unlabeled OrbitControls pan is not product Follow
point diagnostics did not earn overlay
T1 UI is still not generated rotation
Candidate A UI is still not prognostic ω
showing both is still not an evolution bridge
Guided mount is still not a fourth experiment
comet polish is still deferred (`24`)
Ω=0 is not genesis and is not this direction
class A is unchanged (`30`)
this file is not a Follow architecture SoT
this file is not an overlay SoT
this file is not ROADMAP.md
```

---

## 12. Documentation / authority

```text
this file:     post-point-diagnostics product direction
32:            point-first observation UI — not replaced
               Slice 1–2 COMPLETE; Guided mount deferred
31:            chose diagnostic access while headless
               — historical ranking; this file re-ranks
30:            model class — not replaced
24:            perceptual loop — V_total polish still deferred
21:            capability map — Follow was Candidate 3;
               this file earns it for a new reason
19:            selection / Inspector; auto-Follow still no
rendering 11:  default pose fixture; Follow out of *that*
               fixture’s scope — not rewritten here
```

Successor of `32`: this file. Successor of this file:
`docs/architecture/34-selected-tracer-follow-camera-architecture.md`.
Closed physics docs are not rewritten. The ranking in
§9 is not replaced.

---

## 13. Compact lock-in

```text
CLASS:                  prescribed kinematic laboratory
                        (`30`) UNCHANGED

EXPLORE POINT
DIAGNOSTICS v1:         IMPLEMENTED
                        T1 + Candidate A
                        selected-tracer P, clock t
                        sibling panel, not L2, not overlay

GUIDED:                 three experiments UNCHANGED
                        Point diagnostics not mounted

V_total PERCEPTUAL
POLISH:                 still deferred (`24`)

OVERLAY / SLICE:        still NOT NEXT
                        desire up; overfitting unchanged

Ω=0 EXHIBIT:            optional later; not NEXT

CAMERA / FOLLOW:        NEXT PRODUCT DIRECTION
                        selected-tracer Follow-as-framing
                        not pan, not cinema, not auto

NEXT DESIGN STEP:       Follow architecture SoT
                        NOT THIS FILE
                        NOT IMPLEMENTATION

DATASET:                still LONG-TERM (`30`)

IMPLEMENTATION
FROM THIS FILE:         NONE

CONFIDENCE:             HIGH on not overlay/comet/Guided
                        mount/dataset/new physics
                        MEDIUM–HIGH on Follow vs Ω=0
                        MEDIUM on framing vs ride-along
                          (Follow SoT owns that lock)
```

---

## 14. Durable state

```text
POST-POINT-DIAGNOSTICS PRODUCT DIRECTION
  DECIDED AS A CHECKPOINT
  NOT AN IMPLEMENTATION ORDER

NEXT DIRECTION
  selected-tracer Follow-as-framing

NEXT DESIGN
  Follow camera-contract architecture SoT
  NOT THIS FILE
  NOT IMPLEMENTATION
  successor: docs/architecture/34-selected-tracer-follow-camera-architecture.md

NOT NEXT
  overlay / signed volume / diagnostic colormap
  Inspector L2 contamination
  Inspector L3 for T1/A
  Guided catalog expansion / Guided diagnostic mount
  comet / V_total revisit
  product pan bundled into Follow
  automatic / cinematic camera
  new VelocityField
  dataset adapter
  stretching / T2 / ω→V
  Ω=0 exhibit as this slice
```

Follow implementation, overlay, Guided mount, airflow
polish, pan/reset-view, Ω = 0 scenario, dataset
support, and new physics are out of scope for this SoT.
