# Diagnostic Observation UI Architecture

**Status:** ARCHITECTURE / PRODUCT SoT /
SLICE 1 COMPLETE / SLICE 2 COMPLETE /
Explore point-diagnostics v1 IMPLEMENTED /
Guided mount DEFERRED / NOT IMPLEMENTED /
overlay/slice NOT IMPLEMENTED
**Scope:** point-first diagnostic *observation* UI for two
already implemented headless capabilities: T1
(`T_tilt,y`) and Candidate A (`ω_y,current`). Locks
observation target, time, Inspector relation, display
contract, pedagogy, and domain/app/presentation flow.
Not a physics SoT. Not a visualization/overlay SoT.
Not Inspector L2. Not a Guided catalog expansion.
Not `ROADMAP.md`.
**Physics:** T1 and Candidate A remain CLOSED. Model class
remains prescribed kinematic laboratory (`30`). This file
does not reopen `22`, `23`, `26`, `28`, `30`, or `31`.
**Implementation:** Slice 1 COMPLETE
(`src/interaction/PointDiagnosticObservation.ts`,
`inspectSelectedPointDiagnostics`). Slice 2 COMPLETE
(`src/ui/tracer/formatPointDiagnosticDisplay.ts`,
`src/ui/tracer/PointDiagnosticsPanel.tsx`,
Explore App observation wiring in `src/app/App.tsx`).
Guided mount is NOT IMPLEMENTED. Overlay/slice is
NOT IMPLEMENTED.

Predecessor product-direction checkpoint:

```text
docs/architecture/31-post-model-class-product-direction-checkpoint.md
```

`31` selected point-first diagnostic access for T1 and
Candidate A, Explore-primary, not L2, not overlay v1, not
a new Guided experiment. This file is the design SoT that
checkpoint required. Slice 1 and Slice 2 are complete.
Explore point-diagnostics v1 is implemented. Guided mount
remains deferred / not implemented. Overlay/slice is not
implemented.

Related contracts (not replaced):

```text
docs/CONCEPT.md
docs/ARCHITECTURE.md
docs/architecture/16-explore-guided-interaction-architecture.md
docs/architecture/17-guided-experiment-catalog.md
docs/architecture/19-shared-tracer-inspector.md
docs/architecture/20-guided-runtime-architecture.md
docs/architecture/21-whole-product-direction-checkpoint.md
docs/architecture/24-perceptual-exploration-checkpoint.md
docs/architecture/26-diagnostic-tilting-tendency-architecture.md
docs/architecture/28-diagnostic-vertical-vorticity-architecture.md
docs/architecture/30-model-class-decision.md
docs/physics/22-diagnostic-tilting-tendency.md
docs/physics/23-diagnostic-vertical-vorticity.md
docs/research/2026-08-20-t1-demo-field-validation.md
docs/research/2026-08-20-candidate-a-demo-field-validation.md
```

Keep these roles distinct:

```text
CURRENT FACT
STILL-BINDING CONTRACT
NEW PROJECT DECISION
REJECTED ALTERNATIVE
DEFERRED
ANTI-CLAIM
```

Slice 1 implemented the headless adapter. Slice 2
implemented the Explore presentational panel and App
observation wiring. This document does **not** create
`ROADMAP.md`. Inspector L3 remains reserved as in `19`
and is not started. Guided mount and overlay/slice are
not implemented.

---

## 1. Purpose

This document answers:

```text
which point P the diagnostic UI observes,
which laboratory time t it samples,
where the readout lives relative to Inspector L1/L2,
what is shown for T1 and Candidate A together,
how tendency ≠ current-state semantics are preserved,
and how the surface avoids a false causal story.
```

It does **not**:

- re-derive `T_tilt,y` or `ω_y,current`;
- recompute curl or tilting in the UI;
- design an overlay, slice, heatmap, or glyph field;
- add stretching, T2, prognostic `ω`, or `ω → V`;
- change Inspector Level 2;
- add a Guided experiment;
- mount the panel on Guided.

Canonical consumed capabilities (CURRENT FACT):

```text
DiagnosticTiltingTendency.sample(P, t)     → T_tilt,y      [s⁻²]
DiagnosticVerticalVorticity.sample(P, t)   → ω_y,current   [s⁻¹]
```

---

## 2. Current contracts the UI must obey

Verified against live `src/**` and the SoT listed above.
Not a reopen of closed physics.

### 2.1 Headless diagnostics

```text
ExploreLab.tiltingTendency
ExploreLab.currentVerticalVorticity
GuidedLab.tiltingTendency
GuidedLab.currentVerticalVorticity
```

Siblings of `velocityObservation`, not `parts` rows
(`26` §12–§13, `28` §16). SAME-source as composition.
Stateless. No diagnostic-owned clock. No tracer ownership.
Slice 1 adapter (`inspectSelectedPointDiagnostics`) consumes
them as SAME-source owners. Inspector UI / visualization
still do **not** (composition and sibling-boundary tests
lock this).

DEMO magnitudes (research, not a UI scale):

```text
T1           |T|_max ∼ 10⁻⁵ s⁻²
             signed couple, offset along env ω_h
             0 on the updraft axis

Candidate A  axis peak 2Ω = 0.010 s⁻¹ at rotation y_mid
             r = σ  ∼ 3×10⁻³ s⁻¹
             outer ring ∼ −1×10⁻³ s⁻¹
             zero ring r = σ√2 exact 0
             on-axis shielded vortex of prescribed Ω
```

They are different spatial objects. There is no modeled
arrow `T1 → Candidate A` (`23` §17, `30` §7).

### 2.2 Canonical selected-tracer observation

Inspector (`19`, live `App`):

```text
selection:     TracerSelection.selectedId
picking:       ray → visible glyph (not free 3D picking)
P:             selected particle.position
t:             lab.simulation.clock.time
               last completed fixed step
payload:       TracerInspection (L1 + optional L2 V_i)
empty:         inspection === undefined
               never a fake tracer
cadence:       select / completed step batch / Reset
Pause:         (P, t) frozen; scene still renders
Reset:         preserve selectedId if the id still exists
Clear / mode:  clear selection and inspection
```

There is **no** production arbitrary 3D probe. `19` §19
deferred click-empty-space. Preview / pending seed is not
a tracer and is not a selection target (`18`, `19` §11).
Release does **not** auto-select.

### 2.3 Inspector levels (`19` §15)

```text
Level 1  motion          live
Level 2  why this velocity — V_i   live; exactly seven DEMO rows
Level 3  environment / column diagnostics
         hodograph relation, D1 wind, C, column vorticity, SRH
         reserved; not implemented
```

L2 `rotation` is `V_rotation` in m s⁻¹, not `ω_y`.
`31` locked: T1 and Candidate A are **not** velocity
operands and do **not** belong in L2.

### 2.4 Explore / Guided

Explore: empty session legal; arbitrary point release;
shared Inspector. Guided v1: exactly three experiments
(`17` / `20`); Observe / Demonstrates / Does not mean;
same seven-operand `V_total`; shared Inspector; no new
catalog entry (`31`).

---

## 3. Observation target `P`

**NEW PROJECT DECISION: selected tracer current position.**

```text
P = selectedParticle.position
```

World meters. The same `Vec3` Inspector L1 already shows.
The same position `inspectSelectedTracer` already samples.

This is the existing canonical 3D observation target.
It is scientifically correct: both diagnostics are Eulerian
fields sampled at a world point. A selected tracer is a
moving probe through those fields, not a carrier of the
values.

### 3.1 Rejected alternatives

| Candidate | Verdict | Why |
| --- | --- | --- |
| **A. selected tracer current position** | **Canonical** | Existing glyph-pick path; same `P` as Inspector; Explore already is spatial inquiry (`18`, `31` §7) |
| B. arbitrary cursor / free 3D probe | **Rejected for v1** | Product has no free 3D picking. `19` deferred probe-at-empty-point. Do not invent it here. |
| C. seed / release / pending preview point | **Rejected** | Preview is not a tracer (`19` §11). Seed is an IC, not the live observation point after motion. |
| D. hodograph selected height | **Rejected** | Column / layer fixture, not a 3D storm point. Wrong object for T1 couple vs Candidate A ring. |
| E. auto-select newest released tracer | **Rejected** | Would change selection contract. Release and inspect stay distinct gestures. |

Do not add a second picking gesture for diagnostics.

### 3.2 Lifecycle of `P`

Follow the existing selection contract (`19` §13). Do not
invent diagnostic-owned selection.

| Event | Diagnostic observation |
| --- | --- |
| No tracer selected | **No values.** Payload `undefined`. Placeholder copy only. |
| Selected tracer moves (running) | `P` is the live particle position. Resample. |
| Selected tracer is Reset in place | `selectedId` preserved (`19`). `P` jumps to restored position. Resample immediately. |
| Selection cleared (Clear, Explore ↔ Guided, Guided experiment switch) | **No values.** Same as Inspector. |
| Selected tracer becomes inactive | Remains selected and inspectable while the particle exists (`19`). Sample field-at-marker. |
| Selected tracer disappears / id missing | `resolveSelectedTracer` yields nothing → **no values**. |
| New tracer appended | Previous selection unchanged. Diagnostics stay on that id. |
| Pending placement / preview | **Not `P`.** Not sampled. |

**ANTI-CLAIM:** diagnostic values are not tracer-owned
state. Clearing selection must not leave the last numbers
on screen.

---

## 4. Observation time `t`

**NEW PROJECT DECISION: current laboratory clock.**

```text
t = lab.simulation.clock.time
```

Same source Inspector already uses. Last completed
fixed step (`19` §9). Caller supplies `t`; diagnostics
do not own a clock (`26` §10, `28` §12).

Do not invent a diagnostic clock, a sample-hold timestamp,
or a “last time this tracer was selected” cache.

| When | `t` |
| --- | --- |
| Running | Post-advance clock after the last completed step batch, same as Inspector refresh |
| Pause | Frozen clock. `P` is also frozen. Readout is therefore frozen. |
| Reset | Restored clock of the lab Reset helper. Resample at that `t`. |
| Guided experiment switch | New lab, selection cleared → no observation. No leftover `t`. |
| Never stepped | `clock.time` at rest, same as Inspector |

CURRENT DEMO fields are Eulerian-steady, so T1 and
Candidate A are numerically independent of `t`. The API
still **must** pass `t`. UI must not advertise
“time-invariant” as a product claim; an unsteady future
source would still use this clock.

**ANTI-CLAIM:** there is no separate diagnostic time.

---

## 5. Relation to current Inspector

### 5.1 What Inspector already answers

```text
L1  where is this tracer, and what is V_total right now?
L2  which velocity operands sum to that V_total?
```

T1 answers a different question:

```text
At this point, what vertical-vorticity tilting TENDENCY
do environmental ω_h and the prescribed updraft gradient
imply right now?
```

Candidate A answers a different question:

```text
At this point, what world-vertical vorticity ALREADY
EXISTS in current V_total?
```

Neither is “why this tracer is moving.” Putting either on
L2 would teach the wrong “why.”

### 5.2 Inspector Level 3 is the wrong shelf

`19` reserved Level 3 for **environment / column**
diagnostics (hodograph relation, D1 wind, `C`, column
`ω_h`, SRH). T1 and Candidate A are **local rotational
point diagnostics** of different owners and units.

Stuffing them into that reserved L3 would:

- mix column-env literacy with rotational-dynamics
  bookkeeping;
- sit inside a panel whose title and L2 heading already
  say motion / “Why this motion?”;
- collide with a later honest env L3, if it is ever built.

`31` U1 already named this trap.

**NEW PROJECT DECISION:** v1 does **not** start Inspector
Level 3. L3 remains reserved as `19` defined it.

### 5.3 Selected structure

**Sibling presentational panel in the existing inspector
workbench column, below `TracerInspectorPanel`.**

```text
workbench__column--inspector
  TracerInspectorPanel          L1 / L2 unchanged
  PointDiagnosticsPanel         T1 + Candidate A together
```

Not a third workbench column.
Not a new Explore/Guided/Diagnostics mode.
Not a section titled “Level 3” inside Inspector.
Not a row under “Why this motion?”.

Conceptual Explore v1 hierarchy:

```text
selected tracer
  Inspector
    Motion                  L1
    Why this motion?        L2  (exactly seven V_i)
  Point diagnostics
    T_tilt,y                s⁻²
    ω_y,current             s⁻¹
```

Reuse: same `TracerSelection`, same `(P, t)` refresh
cadence, same empty-state rule (no selection → no values).
Separation: Inspector payload stays velocity-only;
point diagnostics are a sibling observation object
(`26` §13, `28` §16, this file §16).

Comparison of UI options: §18.

---

## 6. Show both together

**STILL-BINDING from `31`:** T1 and Candidate A are shown
**together**. Never one relabeled as the other. Never a
single “rotation” number.

The payload, when present, **always** contains both
scalars. A partial observation is forbidden. If the
selected tracer cannot be resolved, both are absent.

They must not visually or readably collapse into:

```text
rotation
rotation strength
mesocyclone
generated spin
```

L2 already owns the English label “Rotation” for
`V_rotation`. Point diagnostics must not reuse that word
as a heading or as a value label.

### 6.1 T1 display contract

```text
English label:   Vertical-vorticity tilting tendency
symbol:          T_tilt,y
units:           s⁻²
quantity class:  signed scalar tendency
owner:           DiagnosticTiltingTendency
```

Always show label + symbol + units + signed number +
textual sign word (`§8`).

Forbidden labels: “tilting vorticity”, “generated
vorticity”, “rotation tendency of the tracer”,
“mesocyclone source”.

### 6.2 Candidate A display contract

```text
English label:   Current world-vertical vorticity
symbol:          ω_y,current
units:           s⁻¹
quantity class:  signed scalar current-state diagnostic
owner:           DiagnosticVerticalVorticity
```

Always show label + symbol + units + signed number +
textual sign word.

Forbidden labels: “rotation”, “spin”, “mesocyclone”,
“cyclonic vorticity”, “vorticity of this tracer”.

Canonical language remains physics `23` §12:

```text
positive ω_y,current
negative ω_y,current
```

Not cyclonic / anticyclonic.

### 6.3 Explanatory copy

Always visible **when values are shown**, compact, not a
textbook page. Not tooltip-only. Not color-only.

Locked copy (English, matching live product UI language):

**Panel title**

```text
Point diagnostics
```

**Empty / no selection**

```text
Select a tracer to sample diagnostics at its current position.
```

Distinct from Inspector’s “Select a tracer to inspect its
motion.” Two questions, two placeholders.

**Sampling hint** (always visible when values are shown):

```text
Sampled from the laboratory field at this marker. Not stored on the tracer.
```

**Comparison / anti-claim block** (always visible when
values are shown):

```text
These are different quantities.

T_tilt,y is a tilting tendency (s⁻²): where environmental
horizontal vorticity and the updraft gradient would tend
to produce world-vertical vorticity.

ω_y,current is world-vertical vorticity that already
exists in current V_total (s⁻¹). In this laboratory it is
prescribed through Ω.

T1 does not generate ω_y,current. Same sign at this point
is not causation.
```

Do not add further textbook paragraphs in v1 (couple
geometry, zero-ring lecture, hour-scale `1/|T|`). Those
facts remain in physics/research SoT. The panel must make
the anti-claims **difficult to miss**, not complete a
course.

---

## 7. Pedagogical contract

The surface must teach, and must not unteach.

### 7.1 What it teaches

```text
T1:
  where current prescribed environmental horizontal vorticity
  and updraft gradient produce a vertical-vorticity tilting
  TENDENCY.

Candidate A:
  where world-vertical vorticity ALREADY EXISTS in current
  prescribed V_total.
```

### 7.2 Anti-claims the UI must preserve

```text
T1 does not generate Candidate A in the current model.
Candidate A is prescribed through Ω.
The two fields may occupy different spatial structures.
T1 couple ≠ Candidate A shielded vortex.
Same sign at a point does not imply causation.
Different units matter: s⁻² ≠ s⁻¹.
```

Do not show an arrow, a “generated by”, a progress bar
from tendency to state, or a shared normalized magnitude.

Do not say the selected tracer “has” vorticity or “is
accumulating” T1.

Explore already lets the user occupy couple vs axis vs
ring with different probes (`31` §7). v1 does not need a
map to teach that they can differ; two numbers plus the
anti-claim block are the minimum. Spatial structure remains
a later overlay question (`§13`).

---

## 8. Sign language

**STILL-BINDING (`23` §12):** positive / negative
world-vertical vorticity. Do **not** canonicalize
cyclonic / anticyclonic.

Same words for T1: it is also a signed world-vertical
tendency. Do not invent a second sign vocabulary.

| Value | Textual sign | Number |
| --- | --- | --- |
| `> 0` | `positive` | signed scientific / zero policy (`§9`) |
| `< 0` | `negative` | leading minus on the number |
| `=== 0` | `zero` | `0` |

The word is required. Color, if any is later added, is
not a substitute (`§17`). v1 architecture does not
specify colors.

Unary plus on positive numbers is **not** required if
the word `positive` is present. Negative numbers keep
the minus sign **and** the word `negative`.

---

## 9. Numeric presentation

Physical values in the observation DTO remain raw
`number`s. Formatting is UI-owned (`§16`).

**Do not** normalize T1 and Candidate A onto a shared
scale, colormap, or progress bar.

### 9.1 Independent formatters

DEMO T1 lives near `10⁻⁵`. Fixed inspector-style 2
decimals would print `0.00` and lie. DEMO Candidate A
lives near `10⁻²` to `10⁻³`.

**NEW PROJECT DECISION:**

```text
T1              scientific notation
                2 digits after the decimal in the mantissa
                example:  2.33×10⁻⁵
                          −1.35×10⁻⁵

Candidate A     scientific notation
                2 digits after the decimal in the mantissa
                example:  1.00×10⁻²
                          3.03×10⁻³
                          −1.35×10⁻³
```

Independent formatters. Same *style family* (scientific)
so neither quantity is forced through the other’s decimal
column. Units remain on every row, so exponent difference
cannot be misread as “T1 is the same stuff, just smaller.”

ASCII `2.33e-5` is an allowed equivalent glyph if Unicode
`×10⁻⁵` is awkward in the chosen font. Semantics do not
change.

### 9.2 Exact zero

Production diagnostics canonicalize signed zero to `+0`
(`26`, `28`). Display contract:

```text
value === 0  →  the character 0
             →  textual sign "zero"
             →  units still shown
             →  not 0.00×10⁰
             →  not -0
             →  not em dash
             →  not blank
```

Exact zero is a real field value (axis of T1; lids;
zero ring of Candidate A; outside sounding for T1). It
is not “no data” and not tracer inactivity.

### 9.3 Non-finite

Physics owners throw on non-finite `(P, t)`. Selected
particles are expected to be finite, matching Inspector.
Do not add a diagnostic-specific error banner. If the
adapter cannot resolve a tracer, return `undefined`.

### 9.4 Precision anti-claims

Do not round a nonzero value to displayed `0`. Scientific
notation with 2 mantissa digits preserves DEMO far-field
decay as a tiny exponent rather than a fake zero ring.

Do not show extra significant digits that imply a
measurement precision the analytic field does not claim.

---

## 10. Live-update semantics

**NEW PROJECT DECISION:** resample on the same cadence
as Inspector, for the selected tracer only.

```text
on glyph select          immediate sample at current (P, t)
on completed step batch  App onSimulationAdvanced
                         (once per rAF if consumed.steps > 0)
on Reset                 immediate refresh
while paused             no step batch → no extra samples
                         frozen (P, t) is enough
```

Do **not** sample only on click and then hold. A selected
tracer moving through an Eulerian field is the scientific
meaning of this readout. A click-hold would imply a
property of the click, or of the tracer identity.

**ANTI-CLAIM:**

```text
diagnostic value is NOT tracer-owned state
```

The DTO is a snapshot of `sample(P, t)` at observation
time. It is discarded when selection is cleared. It is
not written onto `TracerParticle`. Physics diagnostic
instances remain stateless (`26` §20, `28` §17).

Do not cache last-sampled values on the diagnostic, the
particle, or the panel “until next click.”

Multiple tracers: only the selected id. v1 does not
compare two tracers’ diagnostics.

---

## 11. Pause / Reset / no-selection

| Event | Behavior |
| --- | --- |
| Pause | Laboratory `(P, t)` freeze. Readout freezes **because inputs freeze**, not because the panel has a freeze flag. |
| Resume | Step batches resume → live resampling resumes. |
| Reset | Existing Reset: in-place cohort, `selectedId` kept if present. Refresh immediately at restored `(P, t)`. |
| Explore Clear | Selection cleared. Payload `undefined`. No stale numbers. |
| Explore ↔ Guided | Selection cleared. Payload `undefined`. |
| Guided experiment switch | New lab, selection cleared. Payload `undefined`. |
| No selection / empty Explore | Placeholder only. Never last-known T1/A. |
| Inactive selected tracer | Still sample at the marker, like Inspector `V`. Hint already says field-at-marker. |

**Prefer no stale scientific observation.** `undefined` is
the only empty representation. Do not keep a previous
DTO when `resolveSelectedTracer` fails.

---

## 12. Explore v1

**NEW PROJECT DECISION:** Explore is the v1 product home.

Minimum useful surface:

```text
existing Explore laboratory
  + selected-tracer Inspector L1/L2 (unchanged)
  + sibling Point diagnostics panel (T1 and Candidate A)
```

User loop already earned (`18`): release a point, pick the
glyph, Pause, Reset. Diagnostics ride that loop.

### 12.1 Explore v1 includes

```text
selected-tracer P and laboratory t
both diagnostics, always together
units, symbols, signed numbers, textual sign
sampling hint (not tracer-owned)
anti-claim comparison block
empty placeholder when nothing is selected
live resampling while running
natural freeze on Pause
Reset/Clear/mode follow existing selection
```

### 12.2 Explore v1 does NOT include

```text
Inspector L2 changes / eighth parts row
Inspector Level 3 (env / column)
overlay, slice, heatmap, volume, contour, LIC, glyph field
comet |V_i| tint of T1 or ω_y
free 3D probe / click-empty picking
auto-select on release
click-empty deselect (still later in `19`)
Follow / camera pan / reset view
delete-one / line / plane / volume seeding
Guided catalog change
stretching / T2 / Ω / V_total changes
generic diagnostic registry
two-tracer comparison
cyclonic / anticyclonic language
```

---

## 13. Guided

`31`: no new Guided experiment. Isolation remains seed +
copy, not a different `V` (`17`).

### 13.1 Decision

**NEW PROJECT DECISION: C — architecture-ready for Guided;
v1 presentation is Explore-only.**

```text
observation adapter     shared
                        works against ExploreLab and GuidedLab
                        same (P, t) rule as TracerInspection

v1 presentational panel Explore-only
                        App mounts it when lab.kind === "explore"

Guided catalog          unchanged
                        Observe / Demonstrates / Does not mean
                        untouched

later Guided mount      optional; same panel component
                        values are context, not the exhibit
                        not a fourth experiment
```

Rejected A (adapter Explore-only): Guided labs already
expose the same diagnostic instances. Hiding the adapter
would duplicate work later without a scientific reason.

Rejected B (v1 panel in Guided): Guided canonical ICs are
not placed to teach T1’s couple or Candidate A’s ring
(`31` §7). Showing the numbers next to “Inflow to upper
outflow” in v1 would invite reading the exhibit as a
tilting or mesocyclone lesson. `17` already forbids
mesocyclone as a teaching object of those three cards.

If a later slice mounts the panel on Guided, **this SoT
still forbids** changing Demonstrates / Does not mean, and
forbids naming the readout as an experiment.

---

## 14. Overlay boundary

Point-first is locked (`31`).

v1 **must not** require:

```text
spatial heatmap
slice
volume rendering
glyph field
color tint
contour
LIC
diagnostic trail coloring
```

Future overlay/slice, if ever earned, consumes the **same
physics owners**:

```text
lab.tiltingTendency.sample(P, t)
lab.currentVerticalVorticity.sample(P, t)
```

It does **not** consume `PointDiagnosticObservation`, which
is a selected-tracer UI snapshot, not a spatial field.

Do not design that visualization here. Do not smuggle a
color scale into v1 “for later.”

Background highlight remains REJECTED (`24`).

---

## 15. No new physics

UI is observation only.

Do not:

```text
recompute T1 in UI
finite-difference V_total
derive new vorticity components
add stretching or T2
add prognostic state
modify Ω
modify V_total
call VelocityField.curl / derivative
put T1 or ω_y into velocityObservation.parts
```

Sample the existing owners. Nothing else.

---

## 16. Domain / app / presentation data flow

### 16.1 Current Inspector flow (CURRENT FACT)

```text
composeDemoTracersWithObservation
  → velocityObservation + Simulation + diagnostic siblings

App
  inspectSelectedTracer(particles, selection, clock.time,
                        velocityObservation)
  → TracerInspection | undefined
  → TracerInspectorPanel (presentational)

formatInspectorDisplay / tracerContributionLabels
  UI-owned strings and rounding
```

Physics classes do not contain English labels (`19` §16).

### 16.2 Point diagnostics flow

**NEW PROJECT DECISION:** sibling observation object, not
an extension of `TracerInspection`.

`TracerInspection` answers motion / `V_i`. Extending it
would mix quantity classes in the “why this velocity”
payload and pressure L2 tests to grow fields that are not
operands.

Intended shape (not created by this file):

```text
PointDiagnosticObservation
  tracerId: number
  time: number
  position: Vec3
  tiltingTendency: number          // T_tilt,y  s⁻²  signed
  currentVerticalVorticity: number // ω_y,current s⁻¹ signed
```

Raw physical values only. No formatted strings. No
“positive” word. No units object. No Guided copy.

Adapter (conceptual):

```text
inspectSelectedPointDiagnostics(
  particles,
  selection,
  time,
  {
    tiltingTendency: DiagnosticTiltingTendency,
    currentVerticalVorticity: DiagnosticVerticalVorticity,
  },
) → PointDiagnosticObservation | undefined
```

```text
resolveSelectedTracer
  missing → undefined

else
  P = particle.position
  t = caller time          // must be clock.time
  return {
    tracerId,
    time: t,
    position: copy of P,
    tiltingTendency:
      tiltingTendency.sample(P, t),
    currentVerticalVorticity:
      currentVerticalVorticity.sample(P, t),
  }
```

Does not mutate particle, diagnostics, clock, or
selection. Does not import React, Three.js, or pedagogy.
Does not sample `velocityObservation`.

Both scalars are always sampled together. No half payload.

### 16.3 Layer ownership

| Concern | Owner |
| --- | --- |
| `T_tilt,y`, `ω_y,current` physics | existing diagnostic types |
| SAME-source instances | existing lab composition |
| Selected id | existing `TracerSelection` |
| `(P, t)` snapshot DTO | interaction adapter (sibling of `TracerInspection`) |
| When to refresh | App, same cadence as Inspector |
| English labels, symbols-as-displayed, units glyphs, anti-claim copy | UI presentation module |
| Numeric formatting | UI formatter, not physics |
| Explore vs Guided mount | App |

Do not put presentation strings into physics.
Do not put `sample()` into the React panel.
Do not create a generic diagnostic registry, plugin list,
or `ModelDiagnostics` bag. v1 is exactly two named
scalars.

### 16.4 Modules

```text
src/interaction/PointDiagnosticObservation.ts
  PointDiagnosticObservation
  PointDiagnosticSources
  inspectSelectedPointDiagnostics
  SLICE 1 COMPLETE

src/ui/tracer/PointDiagnosticsPanel.tsx
src/ui/tracer/formatPointDiagnosticDisplay.ts
  SLICE 2 COMPLETE
  presentational; observation in, DOM out

src/app/App.tsx
  refreshInspection samples inspectSelectedPointDiagnostics
  on the Inspector cadence when lab.kind === "explore"
  mounts PointDiagnosticsPanel in workbench__column--inspector
  below TracerInspectorPanel
```

Panel remains presentational: observation in, DOM out, no
field sampling. `TracerInspectorPanel` remains velocity-only.

---

## 17. Accessibility / semantic redundancy

Labels + symbols + units + textual sign carry meaning
without color.

Forbidden as the sole encoding:

```text
positive = only color A
negative = only color B
T1 = only an icon
Candidate A = only an icon
```

If a later visual styling pass tints the sign word, the
word and the numeric sign remain required.

Do not over-design color, type scale, or icons in this
SoT. Existing inspector typography is enough to copy.

Screen-reader accessible name: the panel `aria-label`
should be `Point diagnostics`, distinct from
`Tracer inspector`.

---

## 18. UI-option comparison

| | A. Inspector L3 / diagnostic section inside Inspector | B. Sibling point-diagnostics panel (same inspector column) | C. Separate diagnostic mode |
| --- | --- | --- | --- |
| Semantic clarity | MEDIUM. Different question, but housed under “Inspector” / motion “why?”. Collides with `19` L3 = env/column. | **HIGH.** Motion vs rotational diagnostics stay distinct. | HIGH split of questions; LOW as product shell (laboratory already Explore/Guided). |
| Implementation cost | LOW | **LOW** | MEDIUM (navigation, empty-mode rules, duplication of selection) |
| Reuse of selection | HIGH | **HIGH** | HIGH only if it still keys on selected tracer; otherwise invents a probe |
| Future extensibility | LOW–MEDIUM. Occupies the env-L3 shelf; later SRH/column work has nowhere honest to go. | **HIGH.** Named rotational-diagnostic surface. Later env L3 can still be Inspector. Later overlay consumes physics owners, not this panel. | MEDIUM. Mode becomes a drawer for every future diagnostic. |
| Risk of L2 confusion | **HIGH.** Adjacent to “Rotation” `V_i` row; easy to skim as another contribution. | LOW–MEDIUM. Separate title and units. Residual: same column. | LOW |
| Product clutter | MEDIUM. Inspector grows in place. | LOW–MEDIUM. Extra height in an existing column; no new nav. Mobile already stacks that column. | **HIGH.** Fourth shell against `16` / `31`. |

**Selected: B.**

Rejected A: L3 is the wrong conceptual shelf; L2
contamination risk is the failure mode `26` / `28` / `31`
existed to prevent.

Rejected C: `31` already said a separate diagnostic mode
is not required for v1. It would split the laboratory.

Do not add a fourth desktop column. Mobile/layout cost of
B is extra vertical space in `workbench__column--inspector`,
which already stacks under the viewport on small widths.

---

## 19. Implementation slices

Slice 1 is complete. Slice 2 is complete.
Guided mount (Slice 3) is not implemented.
Overlay/slice is not implemented.

### Slice 1 — headless observation adapter

**COMPLETE.**

```text
src/interaction/PointDiagnosticObservation.ts
  PointDiagnosticObservation
  inspectSelectedPointDiagnostics
tests: src/interaction/PointDiagnosticObservation.test.ts
no React, no panel, no App mount
does not change TracerInspection
does not change V_total
```

### Slice 2 — Explore presentation

**COMPLETE.**

```text
src/ui/tracer/formatPointDiagnosticDisplay.ts
src/ui/tracer/PointDiagnosticsPanel.tsx
App: refresh sibling observation on the Inspector cadence
     (select / completed step batch / Reset)
     mount panel only for Explore
Inspector L1/L2 unchanged
tests: src/ui/tracer/PointDiagnosticsPanel.test.tsx
       src/app/pointDiagnostics.wiring.test.tsx
```

### Slice 3 — Guided mount (optional, later)

```text
same panel, same adapter
Guided catalog copy unchanged
not a fourth experiment
NOT IMPLEMENTED
```

Overlay, L3, Follow, and a registry remain outside
the implemented slices.

---

## 20. Testability contract

Adapter tests live with Slice 1. Presentation and Explore
wiring tests live with Slice 2.

### 20.1 Adapter / observation

```text
selected tracer P is the sampled P
canonical lab clock.time is the sampled t
both scalars come from lab.tiltingTendency and
  lab.currentVerticalVorticity (SAME instances)
no selection → undefined, not a stale DTO
missing id → undefined
moving tracer → new sample at new P
Pause: same (P, t) ⇒ same DTO values
Reset: follows existing selectedId preservation;
  refresh uses restored P and t
payload always has both numbers or is undefined
does not mutate particle, diagnostics, clock, selection
does not import Inspector panel, visualization, or pedagogy
ExploreLab and GuidedLab both usable as sources
```

### 20.2 Presentation / product

```text
T1 units s⁻² and symbol T_tilt,y displayed
Candidate A units s⁻¹ and symbol ω_y,current displayed
textual positive / negative / zero present
exact 0 rendered as 0, not -0, not blank
T1 scientific notation; nonzero DEMO-scale T1 not shown as 0.00
Candidate A scientific notation independently
no shared scale / bar between the two
anti-claim block visible whenever values are shown
sampling hint visible whenever values are shown
no selection → placeholder, no numbers
L2 still exactly seven velocity operands
TracerInspectorPanel still does not sample T1 / Candidate A
PointDiagnosticsPanel does not sample fields
Explore v1 mounts the panel
Guided v1 does not mount the panel
Guided catalog still exactly three experiments
Demonstrates / Does not mean source unchanged
```

### 20.3 Non-interference

```text
readout does not change V_total
readout does not change simulation state
readout does not change Ω
velocityObservation.parts keys and length unchanged
no Guided catalog expansion
no overlay / comet tint consumption of T1 or ω_y
```

Do not duplicate physics validation already owned by
`DiagnosticTiltingTendency` and
`DiagnosticVerticalVorticity` tests.

---

## 21. Explicit non-goals

```text
new physics / stretching / T2 / prognostic ω
Ω changes / V_total changes / eighth VelocityField
Inspector L2 changes
Inspector Level 3 implementation
new Guided experiment / catalog copy edits
overlay / slice / heatmap / volume / LIC / contour
comet |V_i| tint of diagnostics
camera / Follow
click-empty deselect
free 3D probe
comet polish / streamlines / volumes
dataset adapter
generic diagnostic registry / ModelDiagnostics bag
cyclonic / anticyclonic product language
ROADMAP.md
```

Preserve `30` (class A) and `31` (point-first, Explore
primary, not L2, not overlay, not new Guided experiment).

---

## 22. Unresolved questions

Not a backlog commitment. Not implementation tasks.

```text
U1  When, if ever, an overlay/slice SoT is earned (`31` U3)
U2  When, if ever, Guided mounts the same panel (`§13`)
U3  Whether camera P1 should be a separate product slice
    after diagnostic access (`31` U4)
U4  Whether an Ω=0 scenario exhibit is ever wanted (`31` U5)
U5  Whether Inspector Level 3 env/column is ever built
    (still `19`; not this surface)
U6  Click-empty deselect (`19`) — diagnostics would follow
    selection; not designed here
```

U1/U2/U6 from `31` are **answered here** (sibling panel;
Explore-only presentation; positive/negative language).
They are not reopened.

---

## 23. Implementation status

```text
Slice 1  COMPLETE
         src/interaction/PointDiagnosticObservation.ts
         inspectSelectedPointDiagnostics
Slice 2  COMPLETE
         src/ui/tracer/formatPointDiagnosticDisplay.ts
         src/ui/tracer/PointDiagnosticsPanel.tsx
         src/app/App.tsx Explore mount + Inspector cadence
Explore point-diagnostics v1  IMPLEMENTED
Guided mount                  DEFERRED / NOT IMPLEMENTED
overlay/slice                 NOT IMPLEMENTED
```

---

## 24. Decision output

### A. Observation target `P`

Selected tracer current `particle.position`. Not a free
probe, not a seed, not a hodograph height.

### B. Observation time `t`

`lab.simulation.clock.time`. No diagnostic clock.

### C. UI location

Sibling `Point diagnostics` panel in the existing
inspector workbench column, below Inspector L1/L2.
Not L3. Not a new mode. Not an L2 row.

### D. Both together

Always both, or neither. Distinct labels, symbols, units.

### E. Display

§6–§9. Scientific notation independently. Exact `0` is
`0`. Textual positive / negative / zero. Locked anti-claim
copy when values are shown.

### F. Live update

Inspector cadence. Eulerian resample. Not tracer-owned.

### G. Pause / Reset / empty

§11. No stale values.

### H. Explore v1

§12. Smallest useful surface.

### I. Guided

Adapter shared; panel Explore-only in v1; catalog
unchanged.

### J. Data flow

Sibling DTO, not `TracerInspection`. UI owns strings and
formatting. Physics owns numbers.

### K. Slices

§19. Slice 1 and Slice 2 implemented. Guided mount and
overlay/slice are not implemented.

---

## 25. Compact lock-in

```text
P:                 selected tracer.position
t:                 simulation.clock.time
empty:             undefined; no stale numbers

UI:                sibling Point diagnostics panel
                   same inspector column, below L1/L2
                   NOT Inspector L3
                   NOT L2
                   NOT a new mode

T1 display:        Vertical-vorticity tilting tendency
                   T_tilt,y   s⁻²
                   scientific notation, 2 mantissa decimals
                   textual positive / negative / zero

Candidate A:       Current world-vertical vorticity
                   ω_y,current   s⁻¹
                   scientific notation, 2 mantissa decimals
                   textual positive / negative / zero
                   not cyclonic / anticyclonic

together:          always both or neither
copy:              tendency ≠ existing ω
                   T1 does not generate Candidate A
                   Ω prescribes ω_y,current
                   same sign ≠ causation
                   not tracer-owned state

cadence:           select / step batch / Reset
Pause:             freeze via frozen (P, t)
Reset:             existing selection contract

Explore v1:        YES — primary home
Guided v1:         adapter ready; panel not mounted
                   catalog unchanged

DTO:               PointDiagnosticObservation
                   sibling of TracerInspection
                   raw numbers only

overlay:           not v1
physics:           sample existing owners only

implementation:    Slice 1 COMPLETE
                   src/interaction/PointDiagnosticObservation.ts
                   inspectSelectedPointDiagnostics
                   Slice 2 COMPLETE
                   src/ui/tracer/formatPointDiagnosticDisplay.ts
                   src/ui/tracer/PointDiagnosticsPanel.tsx
                   src/app/App.tsx
                     refreshInspection
                     Explore-only PointDiagnosticsPanel
                     workbench__column--inspector sibling
                   Explore point-diagnostics v1 IMPLEMENTED
                   Guided mount DEFERRED / NOT IMPLEMENTED
                   overlay/slice NOT IMPLEMENTED
```

---

## 26. STOP

```text
POINT-FIRST DIAGNOSTIC OBSERVATION UI
  ARCHITECTURE WRITTEN
  SLICE 1 COMPLETE
  SLICE 2 COMPLETE
  Explore point-diagnostics v1 IMPLEMENTED
  Guided mount DEFERRED / NOT IMPLEMENTED
  overlay/slice NOT IMPLEMENTED

P, t, SURFACE, DISPLAY, PEDAGOGY
  LOCKED HERE

IMPLEMENTED
  inspectSelectedPointDiagnostics
  formatPointDiagnosticDisplay
  PointDiagnosticsPanel
  Explore App observation wiring

NOT IMPLEMENTED
  Guided mount
  Inspector L2 changes
  Inspector L3
  overlay / slice
  new Guided experiment
  new VelocityField
  stretching / T2 / ω→V
  camera / Follow
  generic diagnostic registry
```

Do not rewrite closed physics or `30` / `31` decisions.
