# Post–41-3 Explore Airflow and Environment Architecture

**Status:** ARCHITECTURE / PRODUCT CHECKPOINT /
V1 FEATURE FREEZE ACTIVE /
M2 COMPLETE / M1 + M3 DECIDED /
SLICE A COMPLETE / SLICE B COMPLETE /
41-1 COMPLETE / 41-2 COMPLETE / 41-3 COMPLETE /
41-4 NOT STARTED (absorbed into 42-2) /
42-1 NOT STARTED / 42-2 NOT STARTED /
40 SLICES C–G NOT STARTED /
THIS FILE DOES NOT INCLUDE PRODUCTION IMPLEMENTATION
**Scope:** after live playtest of Explore Slice 41-3, decide two
placement questions for already-built V1 surfaces without adding
capability and without reopening frozen physics, encodings, or
interaction contracts: (1) whether Explore Airflow controls
belong on the left action rail or on compact viewport-local
chrome; (2) whether the persistent left-rail hodograph should
move to the already-accepted on-demand Environment surface, and
what size/open/close contract that surface needs. Not a
rendering redesign. Not a new visualization. Not an editable
hodograph. Not new environments. Not Guided mounts. Not
`ROADMAP.md`.
**Physics:** unchanged. Model class remains prescribed kinematic
laboratory (`30`). Exactly seven `V_total` operands. Prescribed
Ω semantics unchanged. Inspector L2 and Point-diagnostics
sibling relation unchanged (`19`, `32`). Visual-airflow encoding
and Comets default unchanged (`39`).
**Implementation:** this checkpoint itself does not include
production `src/**` work. Slices 42-1 and 42-2 are NOT STARTED.
Slice 41-4 is NOT STARTED and must not land in the current
Airflow rail band.

Predecessor post–Slice B Explore checkpoint:

```text
docs/architecture/41-post-slice-b-explore-release-and-highlight-checkpoint.md
```

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

Related still-binding shells / environment UI (not replaced):

```text
docs/architecture/16-explore-guided-interaction-architecture.md
docs/architecture/18-explore-arbitrary-seeding.md
docs/architecture/19-shared-tracer-inspector.md
docs/architecture/20-guided-runtime-architecture.md
docs/architecture/32-diagnostic-observation-ui-architecture.md
docs/architecture/34-selected-tracer-follow-camera-architecture.md
docs/architecture/36-explore-selection-acquisition-identity-architecture.md
docs/architecture/37-reset-view-camera-recovery-architecture.md
docs/architecture/22-perceptual-airflow-architecture.md
docs/ui/01-hodograph-panel.md
docs/ui/05-hodograph-overlay-controls.md
docs/physics/10-hodograph-basics.md
```

Accepted live head this checkpoint is written against:

```text
5c33fa7bc342db81374c63408d9fe43415a52a1f
```

That commit is Slice 41-3 rail order (Release → Runtime →
View → Airflow). Slices 41-1 and 41-2, Slice B compact rail,
and Slice A scene-first shell are already merged.

Keep these roles distinct:

```text
CURRENT FACT
LIVE EVIDENCE
STILL-BINDING CONTRACT
NEW PRODUCT DECISION
REJECTED ALTERNATIVE
ANTI-CLAIM
```

---

## 1. Why this checkpoint exists

`40` chose Explore Option 2: scene-first three-band laboratory
with a compact action rail, an on-demand Environment surface
for the one fixed hodograph, and Airflow / Highlight / Depth
cue as compact class-E controls **on that action rail**.
`41` then made Release the first rail action and recorded that
Slice B compact Highlight copy dropped the required `V_total`
orientation sentence.

Slice 41-3 landed. Live Explore is now clearer as a release
laboratory. The new rail also made two remaining *placement*
failures visible:

1. Airflow controls do not act on laboratory occupancy or
   tracer state. They change how the viewport draws prescribed
   airflow. Sitting them under Release / Runtime / View teaches
   the wrong ownership.
2. The hodograph still occupies the narrow left column. `40`
   already chose on-demand Environment; 41-3 left that plot in
   the rail. Live size/value tradeoff now confirms that the
   temporary Slice A/B home is the wrong permanent geometry.

Neither observation is a missing capability. `38` §9 still
governs freeze entry. Usefulness and aesthetics do not add
features. Problems here are solved by hierarchy, placement,
grouping, labels, copy, defaults, visibility, and scrolling
policy — the same M3 means `40` already owns.

This file does not reopen Release, Runtime, Clear tracers,
Follow, Reset View, picking, halo, M2 Comets default,
Highlight encoding, seven operands, diagnostics, or physics.

---

## 2. Live files inspected

Explore shell / rail / viewport:

```text
src/app/App.tsx
src/app/app.css
src/app/exploreShell.wiring.test.ts
src/ui/tracer/ExploreActionRailControls.test.tsx
src/ui/tracer/ExplorePointReleaseControls.tsx
src/ui/tracer/ExploreClearTracersControl.tsx
src/ui/tracer/TracerRuntimeControls.tsx
src/ui/tracer/ExploreFollowControl.tsx
src/ui/tracer/ExploreResetViewControl.tsx
src/ui/tracer/TracerViewport.tsx
src/ui/tracer/VisualAirflowWorkbenchControls.tsx
src/app/visualAirflowProductState.wiring.test.tsx
src/app/visualAirflowExplore.wiring.test.ts
src/app/createExploreLab.ts
src/app/createGuidedLab.ts
```

Hodograph / overlays / Guided:

```text
src/ui/hodograph/HodographPanel.tsx
src/ui/hodograph/HodographOverlayControls.tsx
src/ui/hodograph/hodographViewTransform.ts
src/ui/hodograph/hodographOverlayVisibility.ts
src/app/demoHodographFixture.ts
src/ui/tracer/GuidedExperimentPanel.tsx
src/ui/tracer/GuidedExperimentSelector.tsx
```

Binding SoTs reread: `16`, `18`, `22`, `38`, `39`, `40`, `41`,
`docs/ui/01-hodograph-panel.md`,
`docs/ui/05-hodograph-overlay-controls.md`,
`docs/physics/10-hodograph-basics.md`.

---

## 3. Live ownership / layout after 41-3

**CURRENT FACT** against `src/**` at `5c33fa7`.

### 3.1 Explore three-band shell (Slice A)

```text
.app--explore / .workbench--explore
  Controls | Viewport | Observation
  100dvh height budget; html/body overflow hidden
  observation overflow-y auto
  viewport flex height via TracerViewport ResizeObserver
```

At ≥1240px the Explore grid is:

```text
minmax(260px, 320px) | minmax(0, 1fr) | minmax(280px, 360px)
```

The 260–320px left column is still sized as a hodograph home.
Guided remains on `.workbench--guided` (hodograph | laboratory |
inspector) and does not mount Explore action-rail regions.

### 3.2 Left controls column

Order in `App.tsx`:

```text
workbench__environment
  Hodograph heading
  HodographPanel
  HodographOverlayControls

Storm-relative laboratory
laboratory-toolbar--explore
  Release   (primary)  ExplorePointReleaseControls
  Runtime              Pause / Reset / Speed + Clear tracers
  View                 Follow + Reset View
  Airflow   (secondary) VisualAirflowWorkbenchControls
```

Wiring tests still treat the hodograph as a *temporary* rail
resident pending Environment Slice D
(`exploreShell.wiring.test.ts`) and still require Airflow as
the last Explore band (`ExploreActionRailControls.test.tsx`
41-3 cases). Viewport-column tests currently forbid
`VisualAirflowWorkbenchControls` in the center column.

### 3.3 Airflow product controls

`VisualAirflowWorkbenchControls` is Explore-only (`39`).
Guided does not import it. Live compact chrome:

```text
Airflow view     Flow comets | Eulerian — diagnostic
                 one compact line + <details> full anti-claim
Diagnostic tools Highlight Off + Operand <select>
                 Depth cue checkbox
                 compact Highlight + Depth cue lines
                 + <details> full anti-claims
```

Defaults remain M2: Comets, Highlight Off, Depth cue Off.
Full `39` Highlight meaning still lives in `title` / `details`
(`HIGHLIGHT_COPY`). The compact Highlight line is still the
Slice B under-delivery recorded by `41` §11:

```text
Tint shows one storm operand’s contribution — not a
separate air mass.
```

The orientation / advection sentence is not on that compact
line. Slice 41-4 is NOT STARTED.

### 3.4 Hodograph geometry

`HodographPanel` draws a fixed logical SVG `viewBox` of
**640×480** (`VIEWBOX_WIDTH` / `VIEWBOX_HEIGHT`). Axis titles
and knot labels are sized for that logical drawing
(`docs/ui/01` §6; CSS `.hodograph-panel { width: 100% }`).
In the 260–320px Explore rail the SVG is CSS-shrunk to roughly
half of its designed width. Overlay checkboxes sit under the
plot in the same narrow column (`docs/ui/05`: overlays live
next to the panel).

The plotted profile is the one fixed `DEMO_SCENARIO`
environment (`38` §5). Overlay visibility is App-owned UI
state. The panel is not editable.

### 3.5 Header chrome

```text
title          Supercell Explorer
mode switch    Guided | Explore
subtitle       ground-relative hodograph vs storm-relative
               laboratory frame (not M1 identity)
```

There is no Environment affordance yet. M1 persistent identity
is `40` Slice E, NOT STARTED.

---

## 4. Live evidence

**LIVE EVIDENCE** after 41-3, not a screenshot appendix.

### E1. Airflow is not a laboratory action

Release, Runtime, and View change occupancy, clock, camera, or
Follow. Airflow view / Highlight / Depth cue change only how
prescribed `V_total` marks are drawn in the viewport.

After Release became the first rail action, that mismatch is
the remaining teaching error of the left column: the last band
looks like another thing you do *to the experiment*. It is
not. Marker count still is not density (`39`). Tint still is
not a separate air mass (`39` / `41`). Depth cue still is not
fog (`39`).

### E2. Persistent rail hodograph has a bad size/value tradeoff

The plot occupies a large fraction of the narrow action column
and is too small to read labels/geometry against a 640×480
logical drawing. V1 has one fixed environment (`38` §5) that
is not part of the per-frame selected-tracer loop. `40` §10
already chose on-demand Environment; 41-3 left the plot in the
rail as Slice A/B temporary geometry.

The user still needs access to the hodograph, its overlays, and
the fixed environmental context. That is A3/T2, not a new
environment capability.

---

## 5. Audit against still-binding constraints

Both hypotheses were checked against the freeze and task
frame. They are not accepted merely because they were
suggested.

| Constraint | Airflow → viewport toolbar | Hodograph → on-demand Environment |
| --- | --- | --- |
| T1 Explore entry | Unaffected (mode switch) | Unaffected |
| T2 hodograph meaning | Unaffected | **Requires** a labeled persistent affordance; Guided default-open remains the T2 safety net (`40` §10) |
| T3 release | Helps: rail is only lab actions | Helps: plot no longer sits above Release |
| T4 runtime | Runtime stays on rail | Unaffected |
| T5/T6 select, Follow, Reset View | Toolbar sits **above** the canvas, not over pick targets; View stays on rail | Open Environment may cover/reduce the scene; closed default restores class A |
| T7–T9 observation | Observation dock unchanged | Must not steal the right dock |
| T10 / M1 | Airflow anti-claims stay contextual; M1 remains header Slice E | Environment is not M1 |
| M3 means only | Placement / grouping | Placement / size / visibility; already Option B in `40` |
| Scene-first (`40` §7) | Compact chrome may take a small class A height slice; must not restore a workbench stack | Removing the rail plot is the largest remaining geometry win |
| Ownership (`39`, `16`) | Display of airflow belongs with the viewport that shows it | Hodograph remains environment inspection, not tracer rewrite |
| Guided | Controls stay Explore-only | Shared affordance; Guided may keep a local open presentation |
| a11y / desktop fold | Keyboard-operable toolbar; no page scroll | Panel/region with `aria-expanded`; internal scroll; no page scroll |
| `38` §9 freeze entry | Not a new control family | Not a new environment |

No `38` §4.2 CONDITIONAL item is admitted. No `38` §9 freeze
entry is recorded.

---

## 6. Airflow ownership verdict

**NEW PRODUCT DECISION.** Amends `40` §9 / §16 and `41` §7
placement of Airflow chrome. Does not amend `39` encoding,
defaults, operand list, or anti-claims.

```text
Accepted: Explore Airflow controls leave the left action rail
and become compact viewport-local chrome immediately above
the 3D canvas.
```

Why accepted:

- Semantic ownership matches E1: these controls observe and
  present prescribed airflow; they do not mutate the laboratory
  session.
- `40` class E already called them diagnostic / advanced
  product-exposed controls. Class E persistence does not
  require class B rail membership.
- `41` forbade *hiding* Airflow view in a Tools accordion.
  Relocation is not hiding. The toggle remains persistently
  visible.
- Scene-first geometry improves: the left rail becomes the
  laboratory-action column that 41-3 started (Release,
  Runtime, View).
- Guided is unchanged: still no airflow population or airflow
  controls (`39` §14).

Why the rail home is rejected now, even though `40` put Airflow
there:

- `40` grouped Airflow with frequent Explore actions so they
  would not fall into Option 3's hidden Tools strip. That risk
  is real and remains rejected. A compact toolbar attached to
  the viewport is not a Tools menu.
- After 41-3, the cost of that grouping is a false action
  taxonomy, not extra discoverability.

**REJECTED ALTERNATIVE:**

```text
Keep Airflow on the left rail
Hide Airflow in a Tools / settings overflow
Overlay the toolbar on the WebGL canvas
Move Follow / Reset View onto the airflow toolbar
Restore multi-paragraph workbench copy in the viewport column
Land 41-4 copy in the current rail band, then move the band
```

Follow and Reset View stay in the View rail band. They are
camera / selection-observation actions (T5/T6, `37`), not
airflow encoding.

---

## 7. Viewport-toolbar contract

**NEW PRODUCT DECISION.**

### 7.1 Home

```text
Column     workbench__column--viewport (center)
Placement  immediately above TracerViewport, not over the
           canvas, not in the left rail, not in the
           observation dock, not in the header
Density    compact; one or two short rows
Copy       scientific distinctions from 39 remain available;
           they do not own class A height as a workbench
```

The toolbar is Explore-only. It is a presentational home for
existing `VisualAirflowWorkbenchControls` (or an equivalent
compact composition of the same controls). It is not a new
control family.

### 7.2 Classification — permanently visible vs progressive

| Control | V1 class | Visibility | Copy |
| --- | --- | --- | --- |
| Flow comets / Eulerian — diagnostic | Persistent Explore product control (`39` §7) | **Permanently visible** compact toggle | One short line may stay; full anti-claim in `title` / `<details>` |
| Highlight Off + operand | Persistent secondary diagnostic (`39` §8, `41` §7.3) | **Permanently visible** compact Off + operand select; default Off | When Highlight ≠ Off, a compact **visible** line must restore `41` §11 / `39` §8 meaning. When Off, that sentence need not occupy permanent height |
| Depth cue | Persistent advanced viewing aid (`39` §10) | **Permanently visible** checkbox-scale; default Off | Label + `title`; long anti-claim in `<details>` only |
| Full anti-claim / help paragraphs | Contextual honesty (`39` §11, `40` §13.2) | **Progressive disclosure** (`<details>`, `title`) | Must remain reachable; must not return as stacked workbench prose |

Do not accordion the Comets / Eulerian toggle. Do not remove
Eulerian as the diagnostic alternative. Do not hide Highlight
or Depth cue behind a second Tools menu.

### 7.3 Height budget

The toolbar may consume a small slice of the Explore class A
viewport budget. That is M3 chrome, not a `38` §4.2 larger-
viewport program. It must not reintroduce page scroll at
1920×1080 and must not push the canvas back to a fixed 420px
trap under a teaching stack.

### 7.4 Interaction isolation

```text
Picking / halo / placement ray     canvas only; toolbar is
                                   ordinary chrome
Airflow marks still not pickable   39 / 36 unchanged
Follow / Reset View                stay on the left View band
Release / Runtime / Clear          stay on the left rail
```

---

## 8. Highlight / 41-4 consequence

**NEW PRODUCT DECISION.** Does not change `41` §11 required
meaning. Changes only *where* that copy is allowed to land.

`41-4` exists because compact Highlight copy lost:

```text
highlight tint = selected operand contribution
orientation / motion remain V_total
tint is not a separate air mass / vector
```

If Airflow chrome moves, restoring that sentence in the
**current rail band** is throwaway work. Therefore:

```text
41-4 is not a standalone polish of the left-rail Airflow band.
41-4 lands only as part of 42-2 (viewport-toolbar relocation),
or immediately after 42-2 in that same chrome.
```

Required compact visible claims whenever Highlight ≠ Off
remain exactly `41` §11:

```text
contribution, not a different flow
orientation = V_total
not a quantitative comparison / not an air mass
```

Exact wording may be tightened for toolbar width.

Unchanged, still binding:

```text
Hue                 OPERAND_HIGHLIGHT_PROTOTYPE_HUE 0xff2ec8
Glow / bloom        not V1
Encoding            unchanged
Default             Off
Operands            six storm keys; environmentAdvection excluded
Palette / cyan      POST-V1 unless a later 38 §9 freeze entry
                    independently forces otherwise — this file
                    does not
Inspector L2        remains quantitative truth
```

---

## 9. Environment / hodograph verdict

**NEW PRODUCT DECISION.** Confirms `40` §10 Option B with live
E2. Sharpens size, default, and Explore presentation. Does not
reopen `38` §5 (one fixed environment).

```text
Accepted: Explore hodograph + overlay controls leave the
persistent left action rail. They live in an on-demand
Environment surface of usable size, reached from a
persistent labeled affordance.
```

This is not a new capability. `40` already chose Option B.
Slice A parked the plot in the controls column pending Slice D.
E2 is the live demonstration that the temporary home fails both
readability and action-rail taxonomy.

Why not keep a compact persistent plot (`40` Option C): E2 is
exactly Option C's failure — always-on, still unreadable, still
taxing the rail.

Why not a fourth permanent column: same horizontal tax `40`
rejected for a fixed profile that is not in the T7–T9 loop.

**ANTI-CLAIM:** collapsing the hodograph is not permission to
drop A3/T2, edit the profile, add environments, add scenario
selection, or add meteorological diagnostics.

---

## 10. Environment surface contract

**NEW PRODUCT DECISION.** Refines `40` §10 / §12. Presentation
widget family remains unspecified; the contract below is
binding.

### 10.1 Content

```text
HodographPanel                 ground-relative path; 01
HodographOverlayControls       C, V_sr, ω_h, streamwise /
                               crosswise; 05
Fixed DEMO_SCENARIO context    one profile; 38 §5
```

Overlays travel with the hodograph (`05`: next to / below the
panel). They do not move to the action rail, viewport toolbar,
or Inspector.

### 10.2 Affordance

```text
Location     shared header chrome, labeled Environment
Persistence  visible in Guided and Explore before tracer
             selection and without page scrolling
Not          a fifth left-rail action band
Not          a duplicate control at the bottom of the rail
```

Header is the shared Guided/Explore home already reserved by
`40` §16. Environment is reference inspection, not a laboratory
action, so it does not join Release / Runtime / View.

M1 identity (Slice E) may later share that header. 42-1 may
land the Environment affordance before Slice E. Slice E does
not own this affordance.

### 10.3 Defaults

```text
Explore    Environment closed after the shell loads
Guided     Environment open
Mode switch resets open/closed to that mode default
Overlay visibility flags persist as existing App UI state
```

Explore closed-by-default matches actual use of a fixed
profile and is the `40` §10 Explore allowance. T2
discoverability is carried by the labeled affordance plus
later empty-state / mode copy (`40` C/E), not by keeping a
cramped plot in the rail.

### 10.4 Open presentation (Explore)

```text
Surface     a dedicated panel / drawer / overlay — not the
            260–320px action-rail column
Width       usable CSS width for the SVG approaching the
            640×480 logical viewBox; floor ≥ 480px at the
            1920×1080 target. 260–320px is not an acceptable
            open size
Height      panel may scroll internally; the browser page
            must not
Where       over or in the center viewport column; must not
            replace the left action rail; must not steal the
            observation dock as its home
Scene       opening MAY overlay the 3D view or temporarily
            reduce viewport width/height. Closed state
            restores the class A budget
Rail / dock left rail and observation dock remain usable
            while Environment is open (non-modal to
            Release / Runtime / View)
```

V1 has no hodograph↔3D altitude binding (`38` POST-V1).
Environment is a read-once reference, not a live linked view.
A large overlay/dock on the viewport column is therefore
preferred over permanently reclaiming a plot-width column.

### 10.5 Open presentation (Guided)

Guided may keep its current left hodograph column as the
**default-open** Environment surface if that local shell still
fits one viewport. Guided is not required to adopt Explore's
overlay on the same slice if doing so would break one-viewport
Guided fit (`40` §12).

Closing Guided Environment via the shared affordance is
allowed. Opening it again must restore the same hodograph +
overlays, not a different profile.

### 10.6 Close / reopen

```text
Affordance toggles aria-expanded
Explicit close control on the open surface
Escape closes an overlay presentation
Reopen restores the same surface and overlay flags
No page scroll as the open/close mechanism
```

### 10.7 Out of scope for this surface

```text
editable hodograph
alternate environments / scenario selection
new overlays or SRH numeric readout
binding selected-tracer height into the plot
new meteorological diagnostics
```

---

## 11. Explore final information hierarchy

**NEW PRODUCT DECISION.** Amends `40` §16 recommended Explore
layout. Option 2 remains the architecture; Airflow chrome
changes region.

```text
[ Header: title | (M1 identity, Slice E) | Guided/Explore | Environment ]

[ Action rail ] [ Viewport column ] [ Observation dock ]
     B                 A                     C
Release            Airflow toolbar        Inspector
Runtime            ---------------------  Point diagnostics
View               3D canvas

Environment (D) = on-demand hodograph + overlays
```

Class map (unchanged meanings, corrected homes):

| Surface | Class | Home |
| --- | --- | --- |
| 3D canvas | A | Center; height budget after compact airflow toolbar |
| Release / Runtime / View | B | Left action rail |
| Inspector + Point diagnostics | C | Right observation dock |
| Hodograph + overlays | D | On-demand Environment |
| Airflow view / Highlight / Depth cue | E | Viewport toolbar |
| Mode / M1 / Environment affordance | G | Header |

Left rail after 42-1 and 42-2 contains only laboratory
actions. Its column is sized for that rail, not for a
velocity-space plot.

---

## 12. Guided impact

**NEW PRODUCT DECISION.** Extends `40` §12; does not add Guided
mounts (`39` §14, `38`).

```text
Shared
  title, Guided | Explore, Environment affordance,
  runtime Pause / Reset / Speed, Inspector component,
  one fixed hodograph + overlays

Explore only
  action rail (Release, Runtime, View)
  airflow viewport toolbar
  Point diagnostics
  Environment default closed
  scene-first 1920×1080 no-page-scroll loop

Guided only
  three experiments, teaching blocks
  no release, Follow, Reset View, Clear tracers,
    airflow population, or airflow toolbar
  Environment default open
  local laboratory + teaching arrangement may differ
  so one-viewport Guided fit is preserved
```

T2 in Guided continues to see a hodograph without opening a
new feature. T2 in Explore uses the Environment affordance.

---

## 13. Desktop / fold / scroll contract

**STILL-BINDING CONTRACT** from `40` §7–§8, with placement
consequences:

```text
Primary target          representative desktop, including
                        1920×1080
Explore main loop       scene + observation available without
                        vertical page scrolling
Observation             region scroll, not page scroll
Environment             own surface scroll if needed; opening
                        it must not make the browser page the
                        hodograph mechanism
Airflow toolbar         compact; must not restore page scroll
                        or a stacked workbench above a 420px
                        canvas
Existing breakpoints    ≈520 / 840 / 1240 remain V1
Further mobile work     still V1 CONDITIONAL per 38 §4.2
```

Below 840px, Slice A already allows Explore page scroll. This
file does not expand that into a mobile program.

---

## 14. Feature-freeze classification

**STILL-BINDING CONTRACT (`38` §9) + NEW CLASSIFICATION.**

```text
FEATURE FREEZE                 ACTIVE
New capability added           NONE
CONDITIONAL admitted           NONE
38 §9 freeze entry             NONE
```

| Proposal | Class | Why it is not a new capability |
| --- | --- | --- |
| Airflow → viewport toolbar | **M3 UX consolidation** | Same controls, same defaults, same encoding; new home |
| Highlight compact copy on that toolbar | **M3 / 41-4 freeze correction** | Restores `39` required meaning that Slice B compressed away |
| Hodograph → on-demand Environment | **M3 UX consolidation** | Already `40` Option B; E2 confirms; size/default sharpened |
| Editable hodograph / extra environments / new diagnostics | **rejected / POST-V1** | `38` §5, `40` §2.2 |
| Cyan Highlight / glow | **POST-V1 / rejected** | `39`, `41` §13–§14 |

If later Phase 4 playtest fails T2 because Environment is not
found, the first remedy is stronger affordance / copy /
Guided default-open — not a new environment feature (`40`
§17). If T5/T6 fail because the canvas is still too small
*after* these placements land, only then consider the `38`
§4.2 viewport CONDITIONAL item.

---

## 15. Protected semantics

**STILL-BINDING CONTRACT.** Production slices from this file
may rearrange chrome only. They must not change:

```text
Release state machine     18 / 41: [Release tracer] enters
                          placementEnabled; Confirm births and
                          stays; Cancel leaves placement;
                          idle default false
Runtime                   Pause / Reset simulation / Speed
Clear tracers             occupancy; Runtime neighbor; 41-2
Follow                    34 / 36; View band
Reset View                37; View band; camera, not simulation
Selection / picking / halo  36
M2 Flow comets default    39
Eulerian diagnostic       exposed alternative; 39
Highlight encoding        39 / 41: tint = |V_operand|/R;
                          orientation and advection = V_total;
                          magenta 0xff2ec8; default Off
Seven operands            30 / 38
Diagnostics               19 / 32
Physics / simulation      30; T1 and Candidate A remain closed
Guided mounts             none of the above
```

---

## 16. Revised slice / order recommendation

**NEW PRODUCT DECISION.** Supersedes the production order in
`41` §18 (`41-4` then `40-C` then `40-D`…) and the implied
`40` §19 order of C then D.

Goal: minimize throwaway chrome and expose final desktop
geometry as early as possible.

```text
42-1  Environment / hodograph on-demand
      Shared header Environment affordance
      Explore: remove plot from left rail; default closed;
      open surface usable width (≥ 480px at 1920×1080;
      target the 640 logical viewBox)
      Overlays travel with the panel
      Guided: default open; may keep the current left
      hodograph column as that open surface
      This is 40 Slice D under this file's contract
      STATUS: NOT STARTED

42-2  Airflow controls → compact viewport toolbar
      immediately above the 3D canvas
      Left rail becomes Release, Runtime, View only
      41-4 Highlight compact copy lands here whenever
      Highlight ≠ Off (not in the old rail band)
      STATUS: NOT STARTED

40-C  Observation empty state → selection + Release tracer
      STATUS: NOT STARTED

40-E  M1 persistent identity + mode signposting
      STATUS: NOT STARTED

40-F  Guided teaching-copy consolidation without new mounts
      STATUS: NOT STARTED

40-G  Remaining focused wiring / layout tests
      STATUS: NOT STARTED
      Note: 42-1 / 42-2 will need to update
      exploreShell.wiring.test.ts (hodograph home,
      Airflow no longer forbidden in the viewport column)
      and ExploreActionRailControls.test.tsx (Airflow no
      longer a left-rail band)

Then 38 Phase 4 / M5 acceptance playtest
```

Why Environment before Airflow:

- It is the largest remaining geometry error (E2) and the
  already-named `40` Slice D.
- After 42-1 the left column is an action rail, not a plot
  stacked on actions — Option 2 becomes visible.
- That column can shrink to control width instead of
  hodograph width, which is the earliest look at final
  desktop thirds.

Why 41-4 is fused into 42-2:

- Copy restoration in the rail would be discarded when the
  same controls move.
- Highlight meaning belongs with the chrome that owns Highlight.

Why 40-C stays after geometry:

- Empty-state copy is not throwaway relative to these moves
  (`41`: point at Release tracer). It does not need to ship
  before the rail and viewport homes stabilize, and it is not
  on the critical path for E1/E2.

Why not 40-C before 42-1:

- C does not expose desktop geometry. E1/E2 do.

Each slice rearranges or relabels existing capability only.
This file does not include those production slices.

---

## 17. Existing SoT amendments

```text
38  Freeze rule, one fixed environment, T1–T10, M1/M3/M4/M5
    unchanged. Successor pointer: this file. 41-1…41-3 are
    COMPLETE in production; 41-4 is absorbed into 42-2 and
    remains NOT STARTED. 40 C–G remain NOT STARTED.

39  Still owns Comets default, Highlight encoding, default
    Off, six operands, anti-claims, POST-V1 palette, no
    Guided airflow. Chrome *home* of those controls is
    amended by this file (viewport toolbar). Encoding is
    not amended.

40  Option 2, Environment Option B, fold/scroll, M1 header,
    observation dock, Guided local shell remain. Amended:
    Airflow / Highlight / Depth cue leave the action rail
    for compact viewport chrome. Slice D contract is this
    file §10; production Environment work is 42-1. Slice
    order C→D is superseded by §16.

41  Release entry, Clear grouping, rail order Release →
    Runtime → View, Highlight encoding/copy *meaning*,
    magenta, no glow remain. Amended: Airflow is no longer
    a left-rail band. 41-4 does not land in the rail.
    Successor production order is this file §16.

18  Birth, Reset, Clear, placementEnabled gate unchanged.
    This file does not touch seeding.

16  Explore/Guided split and hodograph-as-environment-
    inspection remain. Product-surface “always-on hodograph”
    in Explore is superseded by 40 / this file; selected
    tracer V is still not a hodograph rewrite.

01 / 05 UI
    Panel drawing and overlay semantics unchanged. App
    placement of the panel is this file: Environment
    surface, overlays still next to the panel.
```

Historical rankings in `21` / `24` / `35` are not rewritten
beyond successor pointers.

---

## 18. Explicit non-goals

```text
production implementation of 42-1 / 42-2 / 41-4 / 40 C–G
new release primitive
click-to-birth without Confirm
Explore starting cohort
changing pick-vs-select priority
Follow / Reset View / halo / picking tolerance
M2 Comets default or Eulerian diagnostic role
Highlight encoding, operand list, default Off, hue, glow
new physics, operand, overlay, environment
editable hodograph / scenario selection
hodograph height bound to tracer altitude
Guided mounts of release / Highlight / Follow / airflow
settings framework / Tools accordion
mobile redesign
README / M4 release surface
```

---

## 19. Anti-claims

```text
This file does not include production implementation.
Relocating Airflow is not hiding Airflow.
A viewport toolbar is not a return of the research workbench.
On-demand Environment is not a missing hodograph.
A larger open hodograph is not an editable hodograph.
Covering the scene while Environment is open is not a new
  camera mode.
41-4 is not a reason to polish copy in a home that is about
  to be abandoned.
Magenta→cyan is not admitted by E1 or E2.
Glow is not a harmless CSS tweak.
M3 may not invent a settings framework to make the rail
  look tidy.
```

---

## 20. Documentation authority

```text
38  V1 promise, MUST/CONDITIONAL, freeze, T1–T10
39  M2 default, Highlight encoding, palette POST-V1
40  M1/M3 spatial organization; observation dock; Guided
    local shell; fold/scroll; Option 2
41  Explore release entry, Clear grouping, Highlight
    compact-copy / legibility *meaning*
42  this file: Airflow chrome home; Environment size /
    default / affordance; 41-4 landing site; revised
    remaining M3 order
18  seeding / gate / Reset / Clear semantics
16  Explore/Guided split
19 / 32  Inspector / Point diagnostics
36 / 37  selection / Reset View
01 / 05  hodograph drawing / overlay visibility
```

---

## 21. Compact lock-in

```text
AIRFLOW HOME          compact toolbar above Explore canvas
AIRFLOW RAIL          no longer a left-rail band
HIGHLIGHT ENCODING    unchanged; orientation = V_total
HIGHLIGHT COPY        41 §11 meaning; lands in the toolbar
                      when Highlight ≠ Off (42-2 / 41-4)
HIGHLIGHT HUE         magenta V1; palette POST-V1
GLOW                  not V1
HODOGRAPH HOME        on-demand Environment (40 Option B)
EXPLORE ENV DEFAULT   closed
GUIDED ENV DEFAULT    open
ENV AFFORDANCE        header, labeled Environment
ENV OPEN SIZE         usable; ≥ 480px at 1920×1080;
                      not the 260–320px rail
OVERLAYS              travel with the hodograph
LEFT RAIL             Release, Runtime, View
OBSERVATION           right dock; 40-C still empty-state copy
FOLD                  1920×1080 Explore loop without page
                      scroll; Environment / observation
                      region-scroll only
FREEZE                intact; no new capability
IMPLEMENTATION        this file includes none;
                      42-1 NOT STARTED; 42-2 NOT STARTED;
                      41-4 NOT STARTED (absorbed by 42-2);
                      40 C–G NOT STARTED
```

---

## 22. Final decision

1. **Does live evidence earn moving Airflow off the rail?**  
   Yes. The controls are viewport presentation, not laboratory
   actions. Persistence is preserved; hiding is rejected.

2. **Where do they go?**  
   Compact toolbar immediately above the Explore 3D canvas.

3. **What stays permanently visible vs progressive?**  
   Comets/Eulerian, Highlight Off+operand, and Depth cue stay
   visible and compact. Full anti-claims stay in `title` /
   `<details>`. Highlight's `V_total` orientation sentence is
   compact-visible only while Highlight is on.

4. **What happens to 41-4?**  
   It lands in that toolbar (42-2), not in the current rail.

5. **Does live evidence earn moving the hodograph?**  
   Yes. It confirms `40` Option B and adds a usable-size
   contract the 260–320px rail cannot meet.

6. **What is the Environment contract?**  
   Header affordance; Explore closed by default; Guided open
   by default; open surface large enough to read the 640×480
   drawing; overlays stay with the plot; opening may cover or
   shrink the viewport; page scroll is not the mechanism.

7. **Is this still M3 under freeze?**  
   Yes. No new capability. No freeze entry.

8. **What is the remaining production order?**  
   42-1 Environment, then 42-2 Airflow toolbar + 41-4 copy,
   then 40-C, 40-E, 40-F, 40-G, then M5.

9. **Does this file include production implementation?**

```text
NO.
42-1 NOT STARTED.
42-2 NOT STARTED.
41-4 NOT STARTED.
40 C–G NOT STARTED.
```
