# V1 Visual-Airflow Product-State Architecture

**Status:** ARCHITECTURE / PRODUCT SoT / M2 DECIDED /
IMPLEMENTATION NOT STARTED / NO IMPLEMENTATION AUTHORIZATION
**Scope:** close the decision half of V1 MUST item M2 by
choosing one existing Explore visual-airflow encoding as the
V1 product default, classifying the remaining existing
encodings and controls, replacing user-visible research
workbench language, and defining the objective implementation
closure that starts feature freeze. Explore only. Docs only.
Not a rendering redesign. Not the M3 whole-product UX/UI
consolidation.
**Physics:** unchanged. Visual airflow continues to observe the
same canonical `V_total`, the unweighted sum of exactly seven
prescribed operands. No physics, field, frame, units, diagnostic,
scenario, or model-class decision changes here.
**Implementation:** none in this document. Production `src/**`
remains unchanged. This SoT does not authorize its implementation
slice.

Predecessor V1 scope checkpoint:

```text
docs/architecture/38-v1-scope-checkpoint.md
```

Accepted V1 scope checkpoint this decision is written against:

```text
13a51da63546273c54b0bbd868738cb11f23968c
```

Binding perception predecessors:

```text
docs/architecture/22-perceptual-airflow-architecture.md
docs/architecture/23-perceptual-airflow-workbench.md
docs/architecture/24-perceptual-exploration-checkpoint.md
```

Binding product / selection / camera context:

```text
docs/architecture/33-post-point-diagnostics-product-direction-checkpoint.md
docs/architecture/35-post-follow-live-playtest-product-direction-checkpoint.md
docs/architecture/36-explore-selection-acquisition-identity-architecture.md
docs/architecture/37-reset-view-camera-recovery-architecture.md
```

Keep these roles distinct:

```text
CURRENT FACT
ACCEPTED PERCEPTION EVIDENCE
STILL-BINDING CONTRACT
NEW M2 PRODUCT DECISION
INTERNAL COMPARISON REFERENCE
POST-V1
ANTI-CLAIM
```

---

## 1. Why this SoT exists

`38` defines a finite V1 whose promise is **interrogation**:
release a scientific parcel, see where it goes, read the exact
seven local velocity contributions, and inspect two named local
rotation diagnostics. V1 does not promise that the whole storm
is visually separable at a glance.

The current Explore surface contradicts release state in two
ways:

1. `points` is still the default even though accepted browser
   evidence says it is the baseline and not the preferred main
   representation;
2. the product itself says `Dev workbench` and `Not product
   visualization modes`.

M2 closes only that contradiction. It does not reopen the
perception program.

```text
M2 question
  Which existing representation is sufficient as the V1
  product default, and which existing research controls still
  deserve product exposure?

not M2
  How should airflow eventually be rendered?
```

---

## 2. Binding V1 boundary

### 2.1 In scope

M2 may:

- choose exactly one of the four existing encodings as default;
- expose a smaller, honestly classified subset of existing
  alternatives;
- hide existing alternatives while retaining their code and
  tests;
- set existing controls' product status and defaults;
- replace user-visible research/workbench copy;
- update tests for that product-state wiring.

### 2.2 Out of scope

This SoT does not add:

```text
new visual encoding
comet redesign or final comet geometry
palette polish
halo polish
diagnostic overlay
T1 / Candidate A spatial map
slice / heatmap / contour / LIC
cloud / volume / streamline representation
Guided airflow population
multi-operand simultaneous display
final whole-product UX/UI layout (M3)
model-class honesty placement (M1 / M3)
new physics
new environment
new hodograph scenario
thermodynamics
datasets
tracer roster
Remove last
Align camera with motion
responsive redesign
```

It also does not change:

- `V_total`;
- its exactly seven prescribed operands;
- the prescribed Ω semantics;
- scientific tracer integration or path history;
- screen-space selection;
- occupancy/base colors;
- the one-halo selection channel;
- Follow or Reset View;
- the three Guided experiments.

---

## 3. Live implementation evidence

**Kind:** CURRENT FACT, inspected against `src/**` at
`13a51da`.

### 3.1 Ownership and data flow

```text
ExploreLab.velocityObservation.total
  == Simulation field
  == VisualAirflowPopulation field
  == EulerianAirflowSamples field
  == TracerViewport visualAirflowField

VisualAirflowWorkbenchScene
  owns one stable object for each existing encoding
  switches visibility only
  does not own Simulation, selection, Inspector, or physics

TracerScene
  owns scientific glyphs, trails, one selection halo,
  camera / OrbitControls, and the attached non-pickable
  visual-airflow group
```

The existing population has 256 history-less visualization
occupants. Advected and Eulerian candidates use the same count
and declared volume. Hidden advected population state continues
to step with laboratory time, preserving fair switching inside
one session.

### 3.2 Existing encodings

| User label | Internal mode | Current primitive / behavior |
| --- | --- | --- |
| Points | `points` | one batched `THREE.Points`; advected occupant positions; no orientation |
| Advected marks | `advected-oriented` | one batched `THREE.LineSegments`; 500 m fixed head–tail marks at advected occupants |
| Comets | `advected-comet` | one batched `THREE.LineSegments`; one 500 m tail made of four segments per advected occupant; head at current occupant; age-based visual fade |
| Eulerian marks | `eulerian-oriented` | one batched `THREE.LineSegments`; fixed jittered sample positions; current `V_total(P,t)` direction |

All mark lengths are perceptual fixtures, not `|V|`. Comet
tails are renderer-local direction/motion cues, not
`TracerPathHistory`, streamlines, parcel history, or same-air-mass
history.

### 3.3 Current defaults and exposure

```text
encoding          points
Pause viz         full-freeze
Highlight         off
Depth cue         off
surface           all four encodings exposed as peers
copy              "Dev workbench ..."
                  "Not product visualization modes."
scope             Explore only
```

Explore↔Guided resets these values to their defaults. Simulation
Reset and Clear keep the current visual-airflow view. The state
is not persisted and does not belong to `ScenarioConfig`.

### 3.4 Highlight

Current Highlight is an Explore-only **single-operand diagnostic
tint**:

```text
Off
or one of six storm operands:
  updraft
  rotation
  lowerInflow
  upperOutflow
  downdraft
  nearGroundOutflow
```

`environmentAdvection` is intentionally absent from this
existing selector. This does not reduce or redefine the
canonical seven-operand `V_total`; Inspector L2 remains the
complete seven-row quantitative decomposition.

The selected field is the same named field instance already
held by `velocityObservation.parts`. Advection and orientation
remain `V_total`. Per-operand display references differ, so tint
salience is not a shared quantitative scale. Points are a
documented no-op under Highlight.

The rejected `OperandHighlightBackgroundScene` is not
constructed by the live workbench and is not an M2 candidate.

### 3.5 Pause visualization and depth cue

`Full freeze` keeps simulation time, scientific tracers,
scientific trails, the visual population, and field sampling at
the paused `(P,t)`.

`Animate frozen field` advances only the visualization
population using `V_total(P,t_pause)`. It does not advance
`Simulation.clock`, scientific tracers, path history, Inspector,
or diagnostics.

Depth cue is camera-distance `THREE.Fog` applied to airflow
materials. Scientific glyphs, trails, preview, halo, grid, and
axes have fog disabled. It is not meteorological fog, humidity,
altitude, cloud, or extinction physics.

### 3.6 Scientific foreground

Scientific tracers:

- remain 150 m world-space glyphs with red/blue/green occupancy
  colors;
- remain the only tracer-selection candidates;
- are picked by screen-space center distance;
- retain their base color when selected;
- use one amber `0xffcc66` wireframe halo at radius × 1.6;
- are not fogged;
- own their scientific pathlines and Inspector identity.

Airflow points/marks/comets:

- have no `tracerId`;
- are not pickable or selectable;
- do not own Inspector state;
- render behind the scientific foreground;
- do not mutate Follow or camera state.

---

## 4. Decision criteria

M2 evaluates current implementation, not hypothetical polished
versions:

1. immediate direction readability;
2. motion readability while running;
3. Pause behavior;
4. depth and clutter;
5. competition with tracer glyphs and the selection halo;
6. compatibility with Follow and Reset View;
7. compatibility with the current single-operand Highlight;
8. scientific anti-claims;
9. implementation maturity and stability;
10. performance at the existing 256-sample budget;
11. user cognitive load;
12. support for V1 acceptance questions A1 and A2.

Beauty is not a primary criterion. Whole-storm legibility is not
a V1 acceptance requirement.

---

## 5. Existing-encoding comparison

### 5.1 Points

**Strengths**

- current default;
- cheapest primitive and update path;
- uniform, stable, and visually subordinate;
- low competition with selected glyph and halo;
- motion while running gives a broad moving-medium cue;
- mature baseline with extensive tests.

**Failures**

- no instantaneous direction channel;
- Pause removes its only direction evidence;
- accepted playtest says it collapses toward a random grey
  pixel cloud on Pause;
- accepted `23/24` verdict is baseline / not preferred main
  representation;
- Highlight does nothing while Points remain uniform.

**Verdict:** loses as product default. The current default is
historical workbench state, not evidence that Points is the
best V1 state.

### 5.2 Advected marks

**Strengths**

- preserves advected motion;
- adds immediate head–tail direction;
- remains readable on Pause;
- cheaper and visually lighter than four-segment comets;
- uses the existing population and canonical `V_total`;
- supports current operand tint.

**Failures**

- accepted evidence calls it an intermediate prototype;
- the simple two-vertex treatment is less perceptually strong
  than the existing comet refinement;
- exposing it beside Comets asks the user to choose between two
  implementations of the same Lagrangian idea without a V1
  learning benefit;
- it keeps the same apparent-concentration anti-claim as Points
  and Comets.

**Verdict:** loses to Comets as the main representation and has
no distinct V1 product role.

### 5.3 Comets

**Strengths**

- strongest accepted provisional `V_total` representation for
  the current model class;
- combines literal advected motion with an immediate static
  direction/sign cue;
- remains direction-readable on Pause;
- already implements short fixed perceptual tails, fade,
  correct vertex color-space handling, alpha, and stable
  batched geometry;
- uses the same 256 occupants and canonical `V_total`;
- works with the existing single-operand tint;
- no redesign is required for product use.

**Costs / risks**

- visually denser than Points or one-segment marks;
- four segments per occupant create more line vertices;
- Lagrangian spacing can be misread as concentration;
- tinted comets can compete with a scientific glyph and amber
  halo;
- a short tail can be misread as history unless copy names its
  role.

**Current sufficiency:** the risks are bounded by existing
controls and channels, not by missing comet art:

- Highlight defaults Off;
- scientific glyphs keep saturated base colors and no fog;
- one geometric halo remains separate from tint;
- background marks remain non-pickable and render behind probes;
- short-tail semantics can be stated in copy.

**Verdict:** wins. Existing Comets are sufficient **as-is** for
the V1 default. M2 does not schedule comet redesign.

### 5.4 Eulerian marks

**Strengths**

- strongest current instantaneous field-direction instrument,
  especially on Pause;
- regular fixed spacing avoids Lagrangian apparent
  concentration;
- no moving-medium ambiguity about sample identity;
- stable existing implementation on the same canonical field;
- supports current operand tint.

**Failures as default**

- baseline has no motion percept;
- reads as a vector-field measurement instrument rather than
  living airflow;
- adds higher initial cognitive load (fixed samples observing
  an Eulerian field);
- accepted evidence classifies it as a diagnostic-layer
  capability, not the main living-air representation;
- A1 is primarily a parcel/path/Follow question, so an
  instrument-first default is the wrong hierarchy.

**Verdict:** loses as default but keeps one distinct diagnostic
product role.

---

## 6. V1 product-default decision

**NEW M2 PRODUCT DECISION:**

```text
V1 Explore visual-airflow default
  = existing Comets
  = internal mode "advected-comet"

No hybrid.
No geometry change.
No palette change.
No population change.
No physics change.
```

Why:

1. It is the only existing candidate that combines running
   motion with immediate head–tail direction and retains that
   direction cue on Pause.
2. `23/24` already found it the strongest provisional
   representation after corrective rendering work.
3. Its current implementation is bounded, stable, batched, and
   already tested; 256 occupants remain inside the accepted
   hundreds-scale CPU envelope.
4. Neutral Comets with Highlight Off preserve the current
   scientific foreground. The recorded competition concern is
   specifically strongest with Comets plus tint, not neutral
   Comets alone.
5. It helps orient the user around A1 without pretending to
   answer A2 quantitatively. Inspector L2 remains the exact A2
   answer.

This is a V1 product default, not a claim that comet geometry is
the final post-V1 rendering direction.

---

## 7. Alternative-mode exposure

### 7.1 Chosen option

**NEW M2 PRODUCT DECISION: keep one distinct diagnostic
alternative; hide the two comparison-only modes from normal
product exposure while retaining code and tests.**

| Existing mode | V1 exposure | Classification |
| --- | --- | --- |
| Comets | exposed; default | product airflow view |
| Eulerian marks | exposed, not a peer default | diagnostic field-direction view |
| Points | hidden | internal comparison baseline |
| Advected marks | hidden | internal comparison prototype |

This rejects:

- all four as peer product modes — it preserves the mode-gallery
  / dev-workbench feeling;
- deleting implementations — unnecessary churn and loss of
  useful regression references;
- hiding every alternative — Eulerian marks have a distinct,
  accepted Pause/field-inspection role;
- a generic settings architecture — not needed for two exposed
  views.

### 7.2 Durable classification and labels

The minimal stable product grammar is:

```text
group label
  Airflow view

default option
  Flow comets

alternative option
  Eulerian directions — diagnostic
```

Exact punctuation may be adjusted during the implementation
slice for accessible markup, but these semantics and the word
`diagnostic` are locked. `Points` and `Advected marks` do not
appear on the normal V1 surface.

M3 may later reorder or restyle this bounded control without
reopening which modes are exposed.

---

## 8. Highlight product status

**NEW M2 PRODUCT DECISION:**

```text
status       diagnostic Explore tool
surface      exposed under "Diagnostic airflow tools"
default      Off
cardinality  Off or exactly one existing storm operand
display      tint/salience on the active visible marks
```

Highlight is **not** required for the normal V1 learning loop.
A2's quantitative answer remains Inspector L2 with exactly
seven rows and numeric magnitudes. Highlight is optional spatial
orientation for six existing storm operands.

Binding boundaries:

- one operand at a time;
- no `Both`;
- no multi-operand simultaneous display;
- no eighth operand;
- no new environment-advection highlight mode in M2;
- no background highlight;
- no change to `V_total` advection or orientation;
- tint is not an operand-colored air mass;
- tint is not density, mass, occupancy, probability, or an
  envelope;
- tint is not quantitatively comparable across operands;
- tint does not replace tracer occupancy colors or the
  selection halo.

Required product meaning:

> Highlight tints where one selected storm operand contributes
> to the displayed samples. Comet advection and every mark's
> orientation still come from the total field. Tint is not a
> separate air mass or a quantitative comparison between
> operands.

The exact product palette remains POST-V1. The current one-hue
implementation is sufficient only because Highlight is an
optional diagnostic tool and defaults Off.

---

## 9. Pause-viz product status

**NEW M2 PRODUCT DECISION:**

```text
normal V1 Pause behavior
  Full freeze

normal V1 product control
  no Pause-viz selector

Animate frozen field
  hidden from V1 product exposure
  implementation and tests retained
  classified as an internal perception-research prototype
```

Reasons:

1. Full freeze is the current default and the clearest match for
   the user's Pause action.
2. Frozen-field animation is scientifically bounded in code,
   but explaining a second perceptual clock adds cognitive load
   without helping A1/A2.
3. `24` left final Pause UX undecided and `38` puts final
   Pause-viz UX POST-V1.
4. Hiding the selector avoids silently redesigning Pause
   semantics.

Scientific Pause remains unchanged: no simulation time,
scientific tracer, path-history, Inspector, or diagnostic
advance.

---

## 10. Depth-cue product status

**NEW M2 PRODUCT DECISION:**

```text
status       advanced viewing aid
surface      exposed, subordinate to the airflow-view choice
default      Off
label        Depth cue
```

Reasons:

- it addresses a real orthogonal 3D depth-legibility problem;
- it uses existing implementation and does not define a new
  airflow encoding;
- scientific glyphs and the selection halo remain unfogged;
- accepted evidence does not justify changing the current
  default to On;
- keeping it optional avoids making camera-distance fade part
  of the scientific reading.

Required meaning:

> Depth cue changes background airflow salience with camera
> distance. It is a viewing aid, not meteorological fog or an
> atmospheric quantity.

---

## 11. Product-copy contract

### 11.1 Copy removed

The implementation slice removes all user-visible instances of:

```text
Dev workbench
Not product visualization modes
prototype hue
```

or equivalent copy that apologizes for the surface as internal
research.

Internal type/component names may remain if changing them has no
user-visible value. M2 does not require a naming refactor.

### 11.2 Minimal replacement locked by M2

The normal default-Comets explanation must carry this meaning:

> Airflow marks show motion and direction in the prescribed
> total velocity field, `V_total`. Short tails are direction
> cues, not tracer histories; marker count and spacing are not
> air density.

When the Eulerian diagnostic view is active, its view-specific
meaning replaces the first sentence:

> Eulerian direction marks sample the prescribed total velocity
> field, `V_total`, at fixed laboratory positions. They show
> instantaneous direction, not moving air parcels; marker count
> and spacing are not air density.

The diagnostic Highlight explanation must carry the meaning in
§8.

These statements may be used verbatim. M3 owns final information
hierarchy, terminology consolidation, and layout, but may not
remove their scientific distinctions without a successor
decision.

Product copy must not claim:

```text
quantitative operand comparison by tint
airflow density or mass
generated storm structure
realistic flow visualization
same-air-mass comet tails
whole-storm legibility
```

---

## 12. Selection, Follow, and Reset View compatibility

### 12.1 Default-state assessment

Neutral Comets with Highlight Off are compatible with the
current selection architecture:

- saturated scientific glyph colors remain unchanged;
- glyphs and halo keep `fog: false`;
- the halo uses geometry as well as hue;
- airflow marks remain behind probes and cannot be picked;
- screen-space picking considers scientific slots only;
- comet tails are 500 m perceptual marks, while scientific
  pathlines remain separate continuous histories.

The accepted `33` concern — Comets plus operand tint can compete
with the selected glyph — is addressed by the existing minimal
default `Highlight = Off`. It does not justify comet or halo
redesign inside M2.

### 12.2 Regression boundary

The implementation slice must preserve:

```text
screen-space picking tolerance and tie-break
tracer base occupancy colors
trail = tracer base color
exactly one selection halo
halo follows selected visible glyph
Follow A→B retarget with selection identity intact
Follow OFF / Clear / simulation Reset camera contracts
Reset View: Follow OFF first, canonical pose restored,
  selection preserved
```

Switching airflow view must not recreate `TracerScene`, clear
selection, change Follow state, or move the camera.

If implementation evidence contradicts the current accepted
fact that neutral Comets leave the scientific probe reasonably
visible, Comets cannot ship as the default under this SoT. M2
does not authorize compensating halo or comet art.

---

## 13. A1 / A2 product role

```text
A1  Where does a released parcel go?
    primary answer:
      scientific glyph + pathline + Follow + Reset View
    Comets contribute:
      surrounding V_total motion and local direction context

A2  Why is it moving this way here?
    primary answer:
      Inspector L2, exactly seven named operands + magnitudes
    Highlight contributes:
      optional non-quantitative spatial orientation for one of
      six existing storm operands
```

Comets do not replace the scientific tracer. Highlight does not
replace Inspector L2. Eulerian directions are an optional
diagnostic field view, not a required step in either answer.

---

## 14. Guided

**NEW M2 PRODUCT DECISION: no Guided change.**

```text
Guided airflow population     not added
Guided airflow controls       not added
three experiments             unchanged
Guided allowed claims         unchanged
Guided Follow / Reset View    unchanged / not mounted
```

The earlier `22` exploration of a possible Guided population is
superseded for V1 scope by `38`. Guided airflow population is
POST-V1.

---

## 15. Minimum future implementation slice

One small product-state slice is sufficient. No split is
justified by the live architecture.

### Slice 1 — close M2

**Default wiring**

- change `DEFAULT_VISUAL_AIRFLOW_WORKBENCH_MODE` from `points`
  to `advected-comet`;
- keep `DEFAULT_OPERAND_HIGHLIGHT_MODE = "off"`;
- keep `DEFAULT_VISUAL_AIRFLOW_PAUSE_VISUALIZATION =
  "full-freeze"`;
- keep depth cue default Off.

**Product exposure**

- expose only `Flow comets` and
  `Eulerian directions — diagnostic`;
- remove Points and Advected marks from normal V1 controls
  without deleting their rendering code or focused tests;
- hide the Pause-viz selector without deleting frozen-field
  animation code or tests;
- group Highlight under `Diagnostic airflow tools`;
- expose Depth cue as an advanced viewing aid;
- replace the user-visible workbench paragraph with §11
  product meaning.

**Tests**

- update default/reset wiring expectations from Points to
  Comets;
- lock the two exposed airflow-view choices and hidden
  comparison modes;
- lock Highlight Off, full-freeze, and depth Off defaults;
- lock removal of user-visible dev/non-product copy;
- preserve visual-airflow canonical-field, mode-switch,
  Highlight, Pause, depth, selection, Follow, and Reset View
  regressions.

No new rendering class, geometry, state framework, settings
system, physics field, or Guided wiring belongs in this slice.

---

## 16. M2 completion and feature-freeze trigger

**Objective closure, preserving the exact `38` boundary:**

```text
M2 COMPLETE when:
  1. default is wired;
  2. alternative exposure matches this SoT;
  3. dev/workbench copy is gone or replaced;
  4. existing scientific anti-claims remain true;
  5. selection / Follow regressions pass;
  6. tests and typecheck pass.
```

```text
FEATURE FREEZE TAKES EFFECT
  when the production M2 implementation satisfying all six
  conditions above merges.

This docs-only SoT merge does not by itself trigger freeze,
because the product default and surface are not yet wired.
```

No human playtest, rendering redesign, palette work, or other
requirement is added to M2 completion. M1, M3, M4, and M5 remain
inside the already-accepted V1 scope after freeze, exactly as
defined by `38`.

---

## 17. Explicit answers

1. **Which existing encoding is the V1 default?**  
   Existing Comets, internal mode `advected-comet`.

2. **Why?**  
   They are the strongest accepted current representation,
   combine running motion with immediate direction, retain
   direction on Pause, and are mature enough without redesign.

3. **Why did the other three lose?**  
   Points lose direction on Pause; Advected marks are a weaker
   intermediate version of the same living-air idea; Eulerian
   marks lose motion and read as an instrument rather than the
   primary airflow.

4. **Which alternatives remain exposed?**  
   Eulerian marks only.

5. **How are alternatives classified/labeled?**  
   `Eulerian directions — diagnostic`. Points are an internal
   comparison baseline; Advected marks are an internal
   comparison prototype.

6. **What is Highlight's V1 status/default?**  
   Optional diagnostic Explore tool, exposed under
   `Diagnostic airflow tools`, default Off, one existing storm
   operand at a time.

7. **What is Pause-viz's V1 status?**  
   Full freeze is the product behavior. The selector is hidden;
   frozen-field animation remains an internal research
   prototype in code/tests.

8. **What is Depth cue's V1 status/default?**  
   Exposed advanced viewing aid, default Off.

9. **What dev copy is removed/replaced?**  
   `Dev workbench`, `Not product visualization modes`, and
   prototype-apology copy are removed. §11 locks replacement
   scientific meaning.

10. **How is tracer/selection visibility protected?**  
    Neutral Comets, Highlight Off, unchanged saturated tracer
    colors, fog-free glyph/halo, one geometric halo, background
    render order, and scientific-slot-only screen-space picking.

11. **Does Guided change?**  
    No.

12. **What implementation remains?**  
    One small product-state slice in §15.

13. **What exact merge condition triggers feature freeze?**  
    Merge of the production M2 slice after all six §16 closure
    conditions are true.

14. **Does this docs task authorize implementation?**  
    No.

---

## 18. Tests and implementation evidence to preserve

The future slice works with existing focused coverage, including:

```text
src/app/visualAirflowExplore.wiring.test.ts
src/app/visualAirflowWorkbench.wiring.test.ts
src/app/visualAirflowWorkbench.pauseHighlight.wiring.test.ts
src/ui/tracer/VisualAirflowWorkbenchControls.test.tsx
src/rendering/VisualAirflowWorkbenchScene.test.ts
src/rendering/VisualAirflowScene.test.ts
src/rendering/OrientedAirflowMarkScene.test.ts
src/rendering/CometAirflowMarkScene.test.ts
src/visualization/VisualAirflowPopulation.test.ts
src/visualization/EulerianAirflowSamples.test.ts
src/visualization/observeAdvectedOrientedAirflow.test.ts
src/visualization/orientedAirflowMark.test.ts
src/visualization/cometAirflowMark.test.ts
src/visualization/stepVisualAirflowOnFrozenField.test.ts
src/visualization/visualAirflowElapsedFromWall.test.ts

src/app/tracerGlyphSelection.wiring.test.ts
src/rendering/selectionHaloMarker.test.ts
src/rendering/TracerScene.glyphVisibility.test.ts
src/app/exploreFollow.wiring.test.tsx
src/rendering/TracerScene.followPoint.test.ts
src/app/exploreResetView.wiring.test.tsx
src/rendering/TracerScene.resetView.test.ts
```

The implementation slice may update assertions that intentionally
lock old workbench exposure/defaults. It must not weaken the
canonical-field, scientific foreground, selection, Follow, or
Reset View contracts.

---

## 19. Anti-claims

```text
Comets are not scientific tracers.
Comet tails are not parcel history, pathlines, or streamlines.
Comet length is not speed.
Marker count / spacing / crowding is not density or mass.
Visual occupancy is not cloud, moisture, precipitation, or
  probability.
Highlight tint is not a separate air mass.
Highlight tint is not quantitatively comparable across operands.
Highlight does not change V_total.
The six-option storm Highlight selector does not redefine the
  exactly seven-operand V_total decomposition.
Eulerian directions are samples, not fixed air parcels.
Depth cue is not meteorological fog or an atmospheric scalar.
Pause does not evolve scientific time.
M2 does not promise whole-storm visual legibility.
M2 does not add a diagnostic overlay.
M2 does not change Guided.
M2 does not change selection, Follow, or Reset View.
M2 does not redesign Comets or the halo.
This document changes no production code.
This document does not authorize implementation.
```

---

## 20. Documentation authority

```text
38  owns V1 promise, scope buckets, roadmap, acceptance frame,
    and feature-freeze rule

39  owns M2 product default, alternative exposure,
    Highlight / Pause-viz / Depth-cue product status,
    M2 copy semantics, implementation slice, and objective
    M2 completion condition

24  remains accepted perception evidence; its "product not
    chosen" state is resolved for V1 by 39

23  remains the workbench architecture and implementation
    record; its dev-surface exposure is superseded by 39

22  remains the canonical airflow-population and scientific
    honesty architecture; later V1 scope in 38/39 supersedes
    its exploratory Guided-population recommendation

36  owns screen-space picking, base-color preservation, and
    the one selection halo

37  owns explicit Reset View and camera recovery
```

Successor production work is the one bounded M2 slice in §15.
No further architecture artifact is required for that slice.

---

## 21. Compact lock-in

```text
V1 DEFAULT           existing Comets / advected-comet
                     no redesign; Highlight Off

EXPOSED ALTERNATIVE  Eulerian directions — diagnostic

HIDDEN REFERENCES    Points baseline
                     Advected marks prototype
                     code/tests retained

HIGHLIGHT             diagnostic; exposed; default Off;
                     one of six existing storm operands;
                     Inspector remains seven-row quantitative truth

PAUSE VIZ             Full freeze product behavior;
                     selector hidden;
                     frozen-field animation internal

DEPTH CUE             advanced viewing aid; exposed; default Off

COPY                  product meaning, not dev apology;
                     tails ≠ history; spacing ≠ density;
                     tint ≠ quantitative comparison / air mass

SELECTION             screen-space pick; base colors preserved;
                     one fog-free amber halo

FOLLOW / RESET VIEW   unchanged

GUIDED                unchanged; no airflow population

IMPLEMENTATION        one product-state slice

M2 COMPLETE           default wired + exposure matched +
                     dev copy gone/replaced + anti-claims true +
                     selection/Follow regressions pass +
                     tests/typecheck pass

FEATURE FREEZE        production M2 completion merge

IMPLEMENTATION
FROM THIS DOC TASK    NONE / NOT AUTHORIZED
```
