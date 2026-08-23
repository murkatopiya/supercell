# Post–Slice B Explore Release and Highlight Checkpoint

**Status:** ARCHITECTURE / PRODUCT CHECKPOINT /
V1 FEATURE FREEZE ACTIVE /
M2 COMPLETE / M1 + M3 DECIDED /
SLICE A COMPLETE / SLICE B COMPLETE /
SLICES C–G NOT STARTED /
NO IMPLEMENTATION AUTHORIZATION
**Scope:** after live playtest of Explore Slice B, decide two
product-surface questions without adding capability and without
reopening frozen physics, encodings, or interaction contracts:
(1) how the existing point-release workflow is entered and
ranked on the Explore rail; (2) what Highlight tint currently
means, whether Rotation sign is being mis-drawn, and what
legibility change is freeze-legal. Docs-only. Not a rendering
redesign. Not a new visualization. Not Guided mounts. Not
`ROADMAP.md`.
**Physics:** unchanged. Model class remains prescribed kinematic
laboratory (`30`). Exactly seven `V_total` operands. Prescribed
Ω semantics unchanged. Inspector L2 and Point-diagnostics
sibling relation unchanged (`19`, `32`).
**Implementation:** none. Production `src/**` MUST remain
unchanged. This file does not authorize 40 Slices C–G or any
new production slice.

Predecessor M1 / M3 consolidation architecture:

```text
docs/architecture/40-v1-m1-m3-ux-ui-consolidation-architecture.md
```

Binding V1 scope and freeze:

```text
docs/architecture/38-v1-scope-checkpoint.md
```

Binding M2 visual-airflow product state:

```text
docs/architecture/39-v1-visual-airflow-product-state-architecture.md
```

Binding Explore seeding / pointer-gate / Reset / Clear:

```text
docs/architecture/18-explore-arbitrary-seeding.md
```

Related still-binding shells (not replaced):

```text
docs/architecture/16-explore-guided-interaction-architecture.md
docs/architecture/19-shared-tracer-inspector.md
docs/architecture/32-diagnostic-observation-ui-architecture.md
docs/architecture/34-selected-tracer-follow-camera-architecture.md
docs/architecture/36-explore-selection-acquisition-identity-architecture.md
docs/architecture/37-reset-view-camera-recovery-architecture.md
docs/architecture/22-perceptual-airflow-architecture.md
```

Accepted live head this checkpoint is written against:

```text
64f73c178fe9d1d3ebf9139369955f10314abed2
```

That commit is Slice B rail consolidation (Runtime | View |
Release | secondary Airflow). Slice A scene-first shell is
already merged.

Keep these roles distinct:

```text
CURRENT FACT
LIVE EVIDENCE
STILL-BINDING CONTRACT
NEW PRODUCT DECISION
REJECTED ALTERNATIVE
ANTI-CLAIM
```

This document did **not** change production code.
It does **not** start the next implementation slice.

---

## 1. Why this checkpoint exists

`38` defines a finite V1 whose Explore promise is interrogation:
release a scientific parcel, watch it, select it, read local
contributions. `40` reorganized the existing surface so T1–T10
can run without page-scrolling away from the scene. Slice A and
Slice B landed that shell and a compact action rail.

Live Slice B playtest now shows two remaining *surface*
failures of that promise, not missing capabilities:

1. The primary Explore loop — release → observe → select →
   inspect / Follow — is still not what the first Explore
   screen teaches. Release sits as a peer band. Entry to
   placement is a nested checkbox **Enable placement**.
2. Highlight operand tint (magenta `0xff2ec8`) is hard to read
   on the dark navy viewport, especially on distant tiny
   comets, and the compact copy no longer states that
   orientation remains `V_total`.

Neither observation reopens physics, M2's Comets default,
Follow, Reset View, picking/halo, overlays, hodograph editing,
Guided mounts, or the seven-operand model.

`38` §9 still governs freeze entry. Usefulness, aesthetics, and
teaching ambition do not add capability. Problems here are
solved by hierarchy, defaults, labels, copy, grouping, and
(only if already deferred) presentation tokens of an existing
encoding.

---

## 2. Live files inspected

Release workflow:

```text
src/explore/ExplorePointReleaseTool.ts
src/explore/ExplorePointReleaseOrchestration.ts
src/explore/shouldAcceptPlacementPick.ts
src/explore/ExplorePointReleaseTool.test.ts
src/explore/shouldAcceptPlacementPick.test.ts
src/explore/exploreBrowserPointRelease.acceptance.test.ts
src/explore/explorePointRelease.acceptance.test.ts
src/ui/tracer/ExplorePointReleaseControls.tsx
src/ui/tracer/ExploreActionRailControls.test.tsx
src/ui/tracer/resolveTracerPointerUp.ts
src/ui/tracer/resolveTracerPointerUp.test.ts
src/ui/tracer/TracerViewport.tsx
src/rendering/releasePreviewMarker.ts
src/app/App.tsx
src/app/createExploreLab.ts
src/app/createExploreLab.test.ts
src/ui/tracer/TracerRuntimeControls.tsx
src/ui/tracer/ExploreResetViewControl.tsx
src/ui/tracer/ExploreFollowControl.tsx
src/app/app.css
```

Highlight / airflow presentation:

```text
src/visualization/operandContributionDisplay.ts
src/visualization/operandContributionDisplay.test.ts
src/visualization/writeContributionDisplayStrengths.ts
src/visualization/writeContributionDisplayStrengths.test.ts
src/visualization/observeAdvectedOrientedAirflow.ts
src/visualization/cometAirflowMark.ts
src/rendering/CometAirflowMarkScene.ts
src/rendering/CometAirflowMarkScene.test.ts
src/rendering/OrientedAirflowMarkScene.ts
src/rendering/VisualAirflowWorkbenchScene.ts
src/rendering/VisualAirflowWorkbenchScene.test.ts
src/rendering/visualAirflowAppearance.ts
src/rendering/visualAirflowWorkbenchMode.ts
src/ui/tracer/VisualAirflowWorkbenchControls.tsx
src/app/visualAirflowWorkbench.pauseHighlight.wiring.test.ts
src/app/visualAirflowExplore.wiring.test.ts
src/physics/storm/VerticalEnvelopeRotationField.ts
src/physics/storm/RotationField.ts
src/physics/storm/RotationField.test.ts
src/scenario/createRotationField.ts
src/scenario/DEMO_SCENARIO.ts
```

Binding SoTs reread: `16`, `18`, `22`, `38`, `39`, `40`.

---

## 3. Current release state machine

**CURRENT FACT.**

Owners:

```text
ExplorePointReleaseTool
  placementEnabled          boolean, default false
  altitudeM                 default 1000
                            DEFAULT_EXPLORE_POINT_ALTITUDE_M
  pendingSeed               {x, y: altitudeM, z} or null

ExplorePointReleaseOrchestration
  handlePlacementAttempt    gated pick → pending + preview
  confirmRelease            session.releasePoint + addTracerSlot
                            + cancelPending + hide preview
  cancelPending             pending + preview only
  reset                     session.reset + cancelPending
                            altitude and placementEnabled stay
  clear                     session.clear + clearTracerSlots
                            + cancelPending; clock unchanged

App.tsx (Explore React mirror)
  placementEnabled, altitudeM, pendingSeed
  enterExplore / enterGuided → placementEnabled false,
                            pendingSeed null, altitude 1000
```

Pointer policy (`resolveTracerPointerUp` +
`shouldAcceptPlacementPick`):

```text
orbit-scale pointer movement     ignore (select nothing,
                                 place nothing)
glyph hit                        select wins over placement
no glyph, placementEnabled       ground-plane pick → pending
no glyph, placementEnabled false attempt is a no-op
missed ground plane              pending unchanged
```

`onPlacementAttempt` is always passed in Explore, so the
viewport always *offers* a placement action on empty ground.
The tool gate is `placementEnabled`. Inspect-orbit remains
enabled; only a stationary click while the gate is on becomes
a pick (`18`).

Lifecycle:

```text
Confirm
  birth at current clock; preview cleared
  placementEnabled UNCHANGED (stays on if it was on)
  sequential second pick is legal without re-checking
  the checkbox

Cancel
  pending + preview cleared
  placementEnabled UNCHANGED

Clear
  occupancy → 0; clock continues; preview cleared
  placementEnabled UNCHANGED
  selection / Follow / inspection cleared in App

Reset (simulation)
  t = 0 cohort replay of current Explore seeds
  preview cleared; placementEnabled UNCHANGED
  camera not owned here

Reset View
  Follow OFF, then DEEP_STORM_TRACER_VIEW
  pending, seeds, placementEnabled, occupancy untouched

Mode switch Explore ↔ Guided
  new lab; placementEnabled false; pending null
  Highlight / airflow view / depth cue reset to defaults
```

`18` still owns birth semantics: pick is not birth; Confirm
is birth; Clear is occupancy; Reset is cohort replay; camera
is not in this object.

Tests lock the gate default **false**, sequential confirm
while the gate stays on, glyph-over-placement, Reset/Clear
clearing preview, and `placementEnabled` not leaking into
physics / `ScenarioConfig`.

---

## 4. Diagnosis of release discoverability

**LIVE EVIDENCE** after Slice B.

What Slice B already did:

- Release is a labeled band on the left rail.
- Confirm / Cancel state a disabled reason without pending.
- F7 aria/title distinguishes Reset / Reset View / Clear.
- Long instructional chrome was shortened.

What the first Explore screen still does:

```text
Runtime     Pause / Reset / Speed     always
View        Follow / Reset View       always
Release     altitude + Enable placement
            + Confirm + Cancel + Clear
Airflow     Comets / Eulerian + Highlight + Depth cue
```

All four bands are persistent peers. The actual entry to the
V1 Explore loop is a small checkbox whose label is
implementation English (**Enable placement**), default **off**.
Confirm/Cancel are inert until the user (a) notices the
checkbox, (b) checks it, (c) clicks empty ground, (d) presses
Confirm.

`38` F1 / T3 already named this: the functional path exists;
empty-state and first-screen teaching are weak. `40` §9 kept
“enable” as a persistent compact control. Slice B implemented
that literally. Playtest now shows the remaining failure is
not missing copy in the Inspector (Slice C); it is that the
**primary action is a pointer-gate checkbox**.

Hypothesis check: *does Enable placement have independent
user meaning, or is it leaked implementation state?*

**Verdict: leaked implementation state.** The underlying gate
is real and still required (`18`: inspect-orbit must not
place). Users do not think “enable a pointer policy.” They
think “I want to release a tracer.” The checkbox is the gate
leaked onto the product surface. It is not a distinct
scientific mode, altitude policy, or occupancy action.

`38` §7.3 currently lists “placement must be enabled before a
ground click” as something Explore must *teach*. That is a
description of the leaked gate, not a frozen product
requirement that the checkbox remain visible. Teaching a
checkbox is the wrong M3 remedy.

---

## 5. Comparison A / B / C

### 5.1 Option A — keep the model; make Release visually
primary; default Enable placement ON

```text
Pros
  smallest code delta
  sequential multi-release stays one ground-click away
  gate remains an explicit control

Cons
  checkbox language remains leaked implementation
  default ON fights 18's reason for the gate: first-visit
  Explore users click the scene to look, not to seed
  a stationary ground click immediately arms a pending
  preview; Confirm/Cancel light up; T3 is easier, T5/T6
  inspect-orbit is noisier
  does not match the desired first-screen principle
```

**Rejected as the V1 product surface.** Default-ON keeps a
control whose only job is to leak a pointer policy, and it
reintroduces accidental pending seeds on a laboratory that
starts empty.

### 5.2 Option B — primary action Release tracer enters
placement mode; checkbox leaves the product surface

```text
Idle
  placementEnabled false
  ground clicks do not arm pending
  glyph pick still selects
  prominent [Release tracer] control visible

Enter
  user presses [Release tracer]
  placementEnabled true
  control shows pressed / placing
  altitude + “click the ground” instruction appear
  Confirm/Cancel remain disabled until pending exists

Place
  stationary ground pick → preview at altitude
  glyph hit still selects (18 / resolveTracerPointerUp)

Confirm
  existing confirmRelease()
  birth semantics unchanged
  stay in placement mode (gate stays true)
  pending cleared; ready for another ground pick

Cancel
  cancelPending()
  leave placement mode (gate → false)
  that last step is product-surface only; tool API
  already supports it
```

**Chosen.** This is the existing two-phase workflow with an
honest entry. It does not change pick-is-not-birth, altitude,
preview, glyph-wins, Reset, Clear, or camera.

### 5.3 Option C — other minimal workflows considered

| C variant | Verdict |
| --- | --- |
| Click-ground-to-birth, no Confirm | **Rejected.** Changes `18` birth semantics. Pick would become birth. |
| Always-on placement, no mode, no checkbox | **Rejected.** Same accidental-pick footgun as A default ON. |
| Release from Inspector empty state only | **Rejected.** Hides T3 behind a dock that Slice C has not even rewritten; the loop starts in the scene. |
| Pre-seeded Explore cohort | **Rejected for this question.** `38` §4.2 CONDITIONAL, and only if T3 fails after empty-state *and* a discoverable primary action. Not earned now. |

No live-architecture blocker requires a third workflow.
The tool already is: gate → pick → pending → Confirm.
B only stops leaking the gate.

---

## 6. Recommended release interaction contract

**NEW PRODUCT DECISION.** Amends `40` §9 product surface for
the placement gate. Does **not** amend `18` birth, Reset,
Clear, or pick math.

```text
Idle
  [Release tracer] is the primary Explore action
  placementEnabled = false
  altitude may be disclosed only after entering placement,
  or remain a compact placement-mode field
  Confirm / Cancel not in the idle first-screen row
  Clear tracers is NOT in this transaction (see §8)

Enter placement
  activating [Release tracer] sets placementEnabled true
  visible pressed/placing state
  short instruction: click the ground to choose a point
  altitude visible

Pending
  existing white/wireframe preview at (x_hit, altitude, z_hit)
  Confirm and Cancel enabled
  changing altitude updates pending y in place (live tool)

Confirm / Release
  existing confirmRelease()
  remain in placement mode
  instruction returns to “click the ground…”

Cancel
  existing cancelPending()
  leave placement mode
  [Release tracer] returns to idle

Re-entry
  press [Release tracer] again
```

### 6.1 Can this be done without changing underlying
release semantics?

**Yes.** Required mapping:

```text
product “in placement mode”   ↔ tool.placementEnabled = true
product idle                  ↔ tool.placementEnabled = false
Confirm                       ↔ orchestration.confirmRelease()
Cancel                        ↔ orchestration.cancelPending()
                              + placementEnabled = false
altitude / pick / preview     unchanged
session.releasePoint          unchanged
```

No physics, seed validation, clock, occupancy, or picking
priority change. Tests that assert the gate default false on
tool construction remain true: idle Explore still constructs
a tool with `placementEnabled = false`. Tests that set the
gate true and pick still pass. New UI tests would assert the
checkbox is gone and the primary control toggles the gate.

### 6.2 Fate of Enable placement

```text
Product surface     REMOVE
Implementation      KEEP placementEnabled as the pointer gate
Default             false when idle (unchanged tool default)
User-visible name   none; the primary action is the gate
```

Do not rename the checkbox. Do not keep it as an advanced
details control. That would preserve the leak.

### 6.3 Post-release behavior

Compare for the real Explore loop (release some parcels,
then watch, then select / inspect / Follow, sometimes
release another):

| After successful Confirm | Fits sequential seeding | Fits observe / pick | Accidental pending |
| --- | --- | --- | --- |
| Stay in placement | Best (live tests already do this) | Glyph pick still wins | Ground click arms a new preview |
| Return to idle | Extra click per extra tracer | Cleaner observe | Lowest |

**Chosen: stay in placement after Confirm.**

Reasons:

- Live `confirmRelease()` already leaves `placementEnabled`
  on; sequential pick → confirm is the `18` Slice 4 loop.
- Glyph hit still selects, so observe/select is not blocked.
- The pressed [Release tracer] control makes the mode
  honest, which the checkbox never did.
- Cancel is the explicit exit to idle inspect-orbit.
- Returning to idle after every birth would add a click to
  a documented multi-tracer laboratory and would *change*
  live Confirm behavior more than staying does.

If later M5 playtest shows accidental pending after the
first birth as a T3/T5 failure, the first remedy is stronger
mode chrome / copy, not a new tool.

---

## 7. Progressive disclosure — not a whole-rail accordion

**NEW PRODUCT DECISION.** Extends `40` §9 grouping; does not
invent a settings framework.

Desired first Explore screen: this is where you release an
air parcel and watch it. Not a simultaneous display of every
system state.

### 7.1 Always visible (primary / frequent)

```text
1. Release tracer     primary Explore action (this file)
2. Runtime            Pause, Reset simulation, Speed
3. View               Follow, Reset View
4. Airflow view       Flow comets / Eulerian — diagnostic
                      (39 persistent product control)
5. Clear tracers      occupancy action; not inside Confirm
```

Band order amendment vs Slice B: **Release first**, then
Runtime, View, Airflow. Slice B ordered a running laboratory
(Runtime first). Explore occupancy starts at zero (`18`).
T3 is the first laboratory action. Runtime/View remain
immediately persistent; they are not hidden.

### 7.2 Visible in placement mode (progressive)

```text
Altitude
Click-the-ground instruction
Confirm / Cancel once pending exists
  (disabled+reason is acceptable while in mode
   with no pending; they need not occupy idle)
```

### 7.3 Persistent but secondary (keep Slice B secondary band)

```text
Highlight Off + operand
Depth cue
On-demand <details> anti-claims
```

Do not accordion Runtime, View, or Airflow view. `40`
already rejected hiding frequent actions in a Tools menu.

### 7.4 Later 40 surfaces, unchanged here

```text
Slice C   observation empty state → select + release
Slice D   Environment / hodograph on-demand
Slice E   M1 identity + mode signposting
```

Slice C copy must point at **Release tracer**, not at
Enable placement.

---

## 8. Clear / Reset / Reset View — placement and naming

**CURRENT FACT.** Three different owners, three different
effects, three similar English roots:

```text
Reset        TracerRuntimeControls     simulation / cohort
             aria: Reset simulation
             title: Reset simulation (not camera)
             visible: Reset

Reset View   ExploreResetViewControl   camera pose
             aria: Reset camera to storm view
             title: does not reset the simulation
             visible: Reset View
             37 contract unchanged

Clear        ExplorePointReleaseControls
             aria: Clear released tracers
             title: not simulation Reset or Reset View
             visible: Clear
             18: occupancy → 0, clock continues
```

Hypothesis: *Clear is a global tracer occupancy action, not
part of the release transaction.*

**Confirmed.** `18` §9: Clear drops exploratory occupancy;
clock unchanged; preview hidden; not Confirm; not a
trail-only button. Orchestration.clear() is session + slots,
not “abort this pending pick.” Live UI nevertheless parks
Clear in the Confirm/Cancel row, so it reads as a fourth
transaction button.

**NEW PRODUCT DECISION:**

```text
Clear tracers
  leave the Confirm / Cancel row
  persist as an occupancy action
  recommended home: Runtime band, or a thin occupancy
  neighbor of Runtime — not View (that is camera),
  not the placement transaction
  visible label: Clear tracers
  keep existing aria/title meaning

Reset
  stay in Runtime
  visible label may become Reset simulation if the
  band width allows; otherwise keep Reset and the
  existing aria/title (Slice B F7 already disambiguates
  once Clear is no longer a sibling of Confirm)

Reset View
  stay in View beside Follow
  visible label stays Reset View
  37 semantics not reopened
```

Users should not have to know session vs camera vs
orchestration. Visible grouping does that:

```text
Runtime     time of the laboratory
View        camera / Follow
Release     birth a parcel (transaction)
Clear tracers  empty the laboratory occupancy
```

Do not invent a fourth Reset-worded button. Do not merge
Clear into Reset. Do not add Clear trails (`18`).

---

## 9. Exact Highlight rendering semantics

**CURRENT FACT / STILL-BINDING CONTRACT (`39` §8).**

Pipeline:

```text
V_total
  createExploreLab: VisualAirflowPopulation and
  EulerianAirflowSamples observe velocityObservation.total
  App: visualAirflowField = that same total
  VisualAirflowWorkbenchScene.sync field = that total

Advection
  writeAdvectedOrientedAirflow(population, field=V_total)
  occupants integrate V_total; Highlight does not
  substitute an operand field

Orientation
  writeUnitDirectionsFromField(V_total) at occupant
  (or Eulerian sample) positions
  comet head–tail geometry from those unit directions
  length fixture COMET_AIRFLOW_LENGTH_M = 500 (direction
  cue, not speed)

Highlight operand
  resolveStormOperandHighlightField(parts, key)
  SAME named VelocityField instance as Inspector parts
  six storm keys; environmentAdvection excluded
  default Off

Tint strength
  writeContributionDisplayStrengths samples operand at
  the SAME xyz as the visible mark
  magnitude = hypot(vx, vy, vz)   // sign discarded
  strength = clamp(|V_operand| / R_operand, 0, 1)
  R is per-operand display reference (visualization
  fixture, not a physics threshold)
  rotation R = 12 m/s

Color
  OPERAND_HIGHLIGHT_PROTOTYPE_HUE = 0xff2ec8 (magenta)
  one hue for every selected operand
  writeCometColors: RGB = lerp(neutral comet, hue, strength)
  alpha = headOpacity * tHeadward * occupancyFade
  strength does not change alpha
  fog: true on LineBasicMaterial (depth cue when enabled)
```

Answers required by playtest:

**When Highlight = Rotation, does each comet’s direction
still come from `V_total`, or from the Rotation operand?**

From **`V_total`**. Orientation and advection never switch
to the operand field. Tests: workbench sync uses
`input.field` for `writeAdvectedOrientedAirflow`; highlight
strengths are a separate buffer; pause/highlight wiring
asserts the total instance is unchanged.

**What does tint encode?**

Normalized **magnitude contribution** of the selected
operand at the mark position: `clamp(|V_operand|/R, 0, 1)`.
Not sign. Not a vector. Not presence-only (except that 0
draws the neutral comet). Not a shared scale across
operands (`39`: per-operand R, Inspector remains
quantitative truth). Not a separate air mass.

**Does Highlight change mark motion / advection?**

**No.** Presentation only. Occupant integration, comet
endpoints, and Eulerian sample positions are independent of
`highlightMode` aside from which strength buffer is written.

`39` required product meaning already states this. Slice B
compacted the visible line to:

```text
Tint shows one storm operand’s contribution — not a
separate air mass.
```

The orientation sentence survives in `title`, `details`, and
`HIGHLIGHT_COPY`, but not on the compact line. That
compression is the copy defect, not an encoding change.

---

## 10. Rotation direction / sign sanity check

**STILL-BINDING CONTRACT.** World: +X East, +Y Up, +Z South.
Prescribed Ω about +Y, right-hand rule. Live field
(`VerticalEnvelopeRotationField` / `RotationField`):

```text
Vx =  Ω_eff * dz
Vy =  0
Vz = −Ω_eff * dx
```

Positive Ω is CCW when viewed from above (from +Y looking
toward −Y). `RotationField.test.ts` “right-hand rule around
+Y at cardinal points” and
`SolidBodyRotationYField` match this.

DEMO: `angularVelocity: 0.005` > 0, center (0, 0).

Control points, Ω > 0, at a height where the vertical
envelope is positive (mid-chimney):

| Point relative to axis | dx, dz | Rotation operand V | World meaning |
| --- | --- | --- | --- |
| East | dx>0, dz=0 | Vx=0, Vz<0 | toward −Z = North |
| West | dx<0, dz=0 | Vx=0, Vz>0 | toward +Z = South |
| South | dx=0, dz>0 | Vx>0, Vz=0 | toward +X = East |
| North | dx=0, dz<0 | Vx<0, Vz=0 | toward −X = West |

Eastward point → northward rotation velocity: CCW from
above. **The field’s sign is consistent with prescribed Ω
and the world basis.** Rendering does **not** rebuild this
vector for comets.

At those same points a Highlight=Rotation comet still
points along **`V_total`** (environment advection + updraft
+ rotation + inflow/outflow/downdraft/NG). A magenta comet
east of the axis can point up, northeast, anything `V_total`
does — not necessarily north. **Highlight cannot be used to
read rotation sense.** That is correct under `39` and easy
to misread if copy is thin.

Zero on the axis: rotation operand is the zero vector →
strength 0 → no tint. Also correct.

---

## 11. Ambiguity: `V_total` orientation vs operand tint

**Yes, the current UI can make a user read a tinted comet
as “the vector of the selected operand.”**

Why:

1. A comet is a directed mark. Tint recedes the whole mark
   toward one hue. The naive reading is “this pink arrow is
   Rotation.”
2. Compact Slice B line dropped the orientation sentence.
3. Operand label (e.g. Rotation) sits next to the marks.
4. Distant tiny dashes lose the head–tail luminance cue,
   leaving a colored tick that looks like a glyph of the
   operand.

This is a **presentation/copy** failure of an existing
encoding, not evidence that orientation should switch to
the operand (that would be a new visualization and would
violate `39`).

**V1 remedy (copy / chrome, not a new encoding):**

When Highlight ≠ Off, the compact visible line must restore
the `39` required meaning, including orientation:

```text
Tint shows where this operand contributes to V_total.
Direction and motion of the marks are still V_total —
not the selected operand, not a separate air mass.
```

Exact wording may be tightened for width; the three claims
are mandatory whenever Highlight is on:

```text
contribution, not a different flow
orientation = V_total
not a quantitative comparison / not an air mass
```

Do not add operand-direction marks, dual comets, or a
Rotation-only field view.

---

## 12. Highlight legibility assessment

**LIVE EVIDENCE.** Neutral comets are already near-white
heads (`0xf0f7ff`) on navy (`depth-cue / clear ~ 0x1a2332`).
Magenta `0xff2ec8` mixed into that head **lowers luminance**
and sits on the red–blue axis. Distant marks are tens of
pixels; occupancy fade and optional fog further kill chroma.
Playtest “pink is easy to lose at range” matches this
pipeline. Tests even note full-strength chroma must remain
detectable at the bright head (`CometAirflowMarkScene.test`).

Depth cue (default Off) makes it worse when On: fog toward
navy. Selection halo is amber `0xffcc66`, fog-free, on
glyphs — a different layer; tint must not mimic it.

Tracer occupancy colors cycle red / blue / green
(`0xe74c3c`, `0x3498db`, `0x2ecc71`). Magenta is distinct
from that palette. That is a reason the prototype hue is
not accidental.

`39`: Highlight is optional, default Off, not required for
T7 (Inspector is the quantitative answer). `39` also:

```text
The exact product palette remains POST-V1. The current
one-hue implementation is sufficient only because
Highlight is an optional diagnostic and defaults Off.
```

`38` cosmetic vs functional: if the user can complete
acceptance tasks and does not misread a frozen claim, poor
contrast of an optional diagnostic is not a freeze entry.

---

## 13. Comparison magenta / cyan / glow

### A. Current magenta `0xff2ec8`

```text
Pros  distinct from tracer RGB and amber halo; already
      tested; 39 deferred palette on this prototype
Cons  low luminance on navy; weak at distance; compact
      copy currently under-explains orientation
```

### B. High-luminance electric cyan

```text
Pros  higher contrast on navy; common “highlight on dark”
      convention; still a single hue, same strength map
Cons  hue-family collision with blue occupancy 0x3498db;
      39 already classified exact palette as POST-V1;
      does not fix the vector-misread (copy must)
```

### C. Tint + subtle non-quantitative halo / glow

```text
Pros  could lift tiny distant marks without a new field
Cons  LineBasicMaterial linewidth is not a portable halo
      on Windows/ANGLE (width stays 1)
      a second additive pass or BloomPass is a new
      pipeline 39/40 forbade as rendering redesign
      glow intensity would silently read as magnitude
      unless a new encoding is defined — forbidden here
      amber selection halo already owns “halo” language
```

**Rejected for V1.** No existing comet path gives a cheap
non-quantitative glow that will not look like a scale.

### D. Other minimal options

| Idea | Verdict |
| --- | --- |
| Raise mix toward hue (change strength mapping) | Rejected. Encoding change; more quantitative-looking. |
| Binary on/off tint | Rejected. Encoding change; reopens 39. |
| Disable fog on highlighted marks | Rejected. New depth cue exception; could read as range meaning. |
| Restore orientation copy when Highlight on | **Accepted V1** (§11). |

---

## 14. Recommended Highlight presentation contract

**NEW PRODUCT DECISION.** Does not reopen `39` encoding,
operand set, default Off, or Comets default.

```text
Encoding          unchanged
Hue               V1: keep OPERAND_HIGHLIGHT_PROTOTYPE_HUE
                  0xff2ec8
Copy              when Highlight ≠ Off, compact chrome must
                  include V_total orientation / advection
                  (39 required meaning; Slice B dropped it
                  from the compact line)
Glow / bloom      not V1
New scale         not V1
Palette revisit   POST-V1 (39), including electric cyan
                  if playtest still finds magenta too dim
                  after copy is restored — choose a hue
                  that is not near TRACER_COLORS or amber
```

Known V1 limitation (not a freeze exception): optional
Highlight remains harder to see at distance on navy than a
high-luminance hue would be. That does not make Highlight a
T1–T10 requirement and does not satisfy `38` §9.

---

## 15. Accessibility / color-vision

```text
Do not rely on hue alone for a required V1 task.
Highlight is optional; Inspector L2 remains the
magnitude answer (39).

Magenta vs white is both hue and luminance. Protanopia
reduces the red channel; magenta collapses toward dim
blue. Cyan is often more robust on navy but collides
with blue tracer occupancy.

Amber selection halo (fog-free) and occupancy RGB stay
the identity/selection channels. Highlight must not
replace them (39).

Depth cue is a viewing aid, default Off; do not use it
as the Highlight contrast strategy.
```

V1 accessibility work for this diagnostic is **copy**
(what the tint means) plus keeping Inspector as the
non-color channel. A palette pass is POST-V1.

---

## 16. Feature-freeze classification

`38` §9: no new user-visible capability unless all four
conditions hold. None hold here. No CONDITIONAL admission.

| Change | Class | Why |
| --- | --- | --- |
| Primary [Release tracer] enters placement mode; checkbox leaves the surface | **M3 UX consolidation** / allowed freeze correction of leaked implementation chrome | Same gate, same birth; `40` hierarchy/labels/defaults. Not a new tool. |
| Cancel leaves placement mode | **M3 UX consolidation** | Sets existing `placementEnabled`; does not change `cancelPending` physics. |
| Stay in placement after Confirm | **no change** | Live `confirmRelease()` already does this. |
| Release band first on the rail | **M3 UX consolidation** | Reorder of existing bands. |
| Clear tracers moved out of Confirm row; visible “Clear tracers” | **M3 UX consolidation** / F7 completion | `18` occupancy action; Slice B left it in the transaction row. |
| Visible “Reset simulation” if width allows | **M3 UX consolidation** | Label; `37` / Reset semantics unchanged. |
| Compact Highlight copy restores `V_total` orientation | **M3 UX consolidation** / freeze correction of Slice B compression vs `39` required meaning | Not a new encoding. |
| Magenta → cyan hue | **POST-V1** | `39` exact palette POST-V1; optional diagnostic; not a T-task. |
| Glow / bloom / second-pass halo | **rejected** for V1; remainder **POST-V1** | New visual channel and/or pipeline; magnitude lookalike. |
| Click-to-birth without Confirm | **rejected** | Changes `18`. |
| Default Enable placement ON while keeping checkbox | **rejected** | Accidental pending; keeps leaked chrome. |
| Operand-direction comets / extra operands / overlays | **rejected** | New capability; `39` anti-claims. |
| Pre-seeded Explore cohort | **CONDITIONAL** only under `38` §4.2 if T3 still fails after this contract *and* Slice C empty state | Not admitted now. |
| Follow, Reset View, picking, halo, M2 Comets default, seven operands, physics, Guided mounts, editable hodograph | **not reopened** | |

No `38` §9 freeze entry is recorded.

---

## 17. Existing SoT amendments

```text
18  still owns pick / pending / Confirm birth, Reset, Clear,
    placementEnabled as pointer gate default false.
    Product surface of that gate is no longer a checkbox.
    18 does not require a checkbox; Slice 3 named a gate.

39  still owns Comets default, Highlight encoding, default
    Off, six operands, anti-claims, POST-V1 palette.
    This file does not amend 39 except to record that
    Slice B compact copy under-delivered the required
    Highlight meaning and must be restored.

40  §9 product surface for “enable” is amended: Enable
    placement is not a required V1 control. Band order:
    Release primary first. Clear is not a Confirm sibling.
    40 still owns M1 honesty placement, observation dock,
    Environment on-demand, Guided local shell, Slices C–G.

38  F1/T3 teaching “check Enable placement” is superseded
    by this primary-action contract. Freeze rule unchanged.
    38 implementation note that 40 production had not
    started is stale: Slices A/B are COMPLETE.
```

Historical rankings in `21` / `24` / `35` are not rewritten
beyond successor pointers.

---

## 18. Proposed implementation slices and order

Docs-only here. Production starts only when commanded.

These slices should land **before `40` Slice C**, because
empty-state copy must name [Release tracer], not Enable
placement.

```text
41-1  Explore primary [Release tracer] ↔ placementEnabled
      Remove Enable placement from product surface
      Cancel → leave placement mode
      Confirm stays in placement mode (live semantics)
      Placement-mode disclosure of altitude + instruction
      STATUS: NOT STARTED

41-2  Clear tracers out of the Confirm row
      Visible occupancy label; Runtime (or occupancy)
      neighbor; F7 visible-name pass if needed
      STATUS: NOT STARTED

41-3  Rail hierarchy: Release band first; Runtime; View;
      secondary Airflow unchanged as secondary
      Not an accordion of the whole rail
      STATUS: NOT STARTED

41-4  Highlight compact copy restores 39 orientation /
      advection meaning whenever Highlight ≠ Off
      No hue change, no glow
      STATUS: NOT STARTED

Then 40-C  Observation empty state pointing at selection
           and Release tracer
Then 40-D–G as already ordered in 40
Then 38 Phase 4 / M5 acceptance playtest
```

Each slice rearranges or relabels existing capability only.

---

## 19. Explicit non-goals

```text
new release primitive (line / plane / volume)
click-to-birth without Confirm
Explore starting cohort
changing pick-vs-select priority
Follow / Reset View / halo / picking tolerance
M2 Comets default or Eulerian diagnostic role
Highlight encoding, operand list, or default Off
new hue, glow, bloom, or quantitative tint scale
new physics, operand, overlay, environment
editable hodograph
Guided mounts of release / Highlight / Follow
settings framework / whole-rail accordion
mobile redesign
README / M4 release surface
implementation of this file
```

---

## 20. Anti-claims

```text
This file does not authorize production implementation.
Enable placement had no independent scientific meaning.
Staying in placement after Confirm is not a new mode;
  it is live confirmRelease() behavior made visible.
Highlight tint is not Rotation's vector.
Rendering is not reversing prescribed Ω.
A prettier cyan comet is not a V1 MUST.
Glow is not a harmless CSS tweak.
M3 may not hide Airflow view or Runtime to make Release
  look primary.
```

---

## 21. Documentation authority

```text
38  V1 promise, MUST/CONDITIONAL, freeze, T1–T10
39  M2 default, Highlight encoding, palette POST-V1
40  M1/M3 spatial organization; Slices C–G still theirs
18  seeding / gate / Reset / Clear semantics
41  this file: Explore release product entry, Clear
    grouping, post-B Highlight copy/legibility class
16  Explore/Guided split
19 / 32  Inspector / Point diagnostics
36 / 37  selection / Reset View
```

---

## 22. Compact lock-in

```text
RELEASE ENTRY         [Release tracer] → placement mode
ENABLE PLACEMENT      removed from product surface
                      gate remains; idle default false
CONFIRM               existing birth; stay in placement
CANCEL                clear pending + leave placement
CLEAR TRACERS         occupancy; not Confirm sibling
RESET                 simulation; Runtime
RESET VIEW            camera; View; 37 unchanged
RAIL ORDER            Release, Runtime, View, Airflow
HIGHLIGHT ENCODING    unchanged; orientation = V_total
HIGHLIGHT COPY        restore 39 meaning when On
HIGHLIGHT HUE         magenta V1; palette POST-V1
GLOW                  not V1
FREEZE                intact; no new capability
IMPLEMENTATION        NOT AUTHORIZED
NEXT PRODUCTION       41-1 … 41-4 when commanded;
                      then 40 C–G; then M5
```

---

## 23. Final decision

1. **Is Enable placement a user-meaningful control?**  
   No. It is the pointer gate leaked into the UI.

2. **Chosen release workflow?**  
   Option B: Release tracer → placement → pick → preview →
   Confirm; Cancel leaves placement; Confirm stays.

3. **Legal without changing `18` birth semantics?**  
   Yes.

4. **After successful release?**  
   Stay in placement (live sequential loop).

5. **Where does Clear live?**  
   Global occupancy, not the release transaction.

6. **Highlight orientation?**  
   Always `V_total`. Tint is `|V_operand|/R`, signless.

7. **Is Rotation drawn with the wrong spin?**  
   No. The operand field matches right-hand +Y. Comets do
   not draw that vector.

8. **Magenta / cyan / glow?**  
   Keep magenta in V1; restore copy; cyan POST-V1; glow
   rejected for V1.

9. **Does this authorize implementation?**

```text
NO.
```
