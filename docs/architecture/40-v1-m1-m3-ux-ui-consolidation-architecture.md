# V1 M1 / M3 UX/UI Consolidation Architecture

**Status:** ARCHITECTURE / PRODUCT SoT /
M2 COMPLETE / V1 FEATURE FREEZE ACTIVE /
M1 + M3 DECIDED / IMPLEMENTATION NOT STARTED
**Scope:** decide how already-built V1 capabilities are
spatially and informationally organized so a user can
perform acceptance tasks T1–T10 with minimal unnecessary
page scrolling, mode confusion, visual competition, and
loss of the 3D laboratory scene. Closes the architecture
half of V1 MUST items M1 and M3. Not a visual redesign.
Not CSS polish. Not a rendering redesign. Not new product
capability. Not Guided catalog expansion. Not `ROADMAP.md`.
**Physics:** unchanged. Model class remains prescribed
kinematic laboratory (`30`). Exactly seven `V_total`
operands. Prescribed Ω semantics unchanged. Inspector L2
boundary and Point-diagnostics sibling relation unchanged
(`19`, `32`). This file does not reopen `17`, `22`, `23`,
`26`, `28`, `30`–`39`.
**Implementation:** this SoT itself is docs-only.
Production layout work is out of scope for this document.

Predecessor V1 visual-airflow product-state architecture:

```text
docs/architecture/39-v1-visual-airflow-product-state-architecture.md
```

Binding V1 scope checkpoint:

```text
docs/architecture/38-v1-scope-checkpoint.md
```

Accepted M2 / freeze head this decision is written against:

```text
0a9a2a0b5c1565a3ad770337a284c0df117ba375
```

Related shell / observation / camera SoTs (not replaced):

```text
docs/architecture/16-explore-guided-interaction-architecture.md
docs/architecture/19-shared-tracer-inspector.md
docs/architecture/32-diagnostic-observation-ui-architecture.md
docs/architecture/34-selected-tracer-follow-camera-architecture.md
docs/architecture/36-explore-selection-acquisition-identity-architecture.md
docs/architecture/37-reset-view-camera-recovery-architecture.md
```

Keep these roles distinct:

```text
CURRENT FACT
LIVE EVIDENCE
STILL-BINDING CONTRACT
NEW M1 / M3 PRODUCT DECISION
REJECTED ALTERNATIVE
ANTI-CLAIM
```

---

## 1. Why this SoT exists

`38` defines a finite V1. `39` closed M2 and activated
feature freeze. Remaining product-surface MUST work that
touches layout and honesty is exactly:

```text
M1  Persistent model-class honesty on the product surface
M3  Whole-product UX/UI consolidation — functional items only
```

Live Explore evidence now elevates `38` §8.1 F4 and F5 from
risks to demonstrated functional failures of the main
selected-tracer observation loop at a representative desktop
size. This SoT answers only:

```text
How should the existing V1 surface be organized so T1–T10
remain executable without page-scrolling away from the scene,
without inventing new capability, and without hiding required
scientific honesty?
```

It does not ask what else to build.

---

## 2. Binding freeze and scope

### 2.1 In scope

M1 / M3 architecture may decide:

- information hierarchy and region roles;
- Explore and Guided shell similarities and differences;
- viewport priority and desktop height budget;
- page-scroll vs region-scroll policy;
- control grouping, persistence, and secondary exposure;
- hodograph / environment placement for one fixed profile;
- Inspector + Point diagnostics shared observation region;
- persistent model-class honesty placement and copy hierarchy;
- empty-state, disabled-reason, terminology, and teaching-copy
  consolidation contracts;
- whether responsive work beyond existing breakpoints is
  V1 MUST or remains CONDITIONAL;
- later implementation slices that rearrange existing surfaces.

### 2.2 Out of scope

```text
new product capability, control family, or encoding
new Guided experiment or Guided mount of diagnostics / Follow
new environment or editable hodograph
new physics, operand, diagnostic, or overlay
rendering redesign, camera redesign, Follow redesign
generic settings framework
cosmetic palette / typography / icon polish
mobile redesign as a V1 program
README / release-surface work belonging to M4
```

### 2.3 Freeze entry for apparent new needs

After freeze, a new user-visible capability may enter V1 only
if all four `38` §9 conditions hold. This SoT records no such
admission. Problems below are solved by hierarchy, placement,
grouping, labels, copy, defaults, visibility, and scrolling
policy.

---

## 3. Evidence considered

### 3.1 Screenshots (primary visual evidence)

Four live-product captures at representative desktop
**1920×1080**:

1. Guided mode, normal initial experiment state.
2. Explore mode, no selected tracer.
3. Explore mode, selected tracer with populated Inspector and
   Point diagnostics.
4. Explore mode while following a tracer far from the storm
   core.

### 3.2 Repeated live-use evidence (user-reported)

```text
Guided at 1920×1080 fits one browser viewport without
  vertical page scrolling.
Explore states shown require vertical page scrolling to
  reach/read full Inspector / Point diagnostics.
That page scroll competes with watching and manipulating
  moving tracers in the 3D viewport.
Follow is comfortable in use.
Explicit Reset View recovered storm framing after following
  far from the core.
Screen-space picking materially improved tracer acquisition.
Preserving tracer base color plus a separate selection halo
  improved selected-tracer identity.
Explore controls accumulated incrementally and consume more
  vertical space than their interaction semantics require.
```

### 3.3 Live implementation inspected

**Kind:** CURRENT FACT against `src/**` at `0a9a2a0`.

| Surface | Ownership |
| --- | --- |
| App shell / mode switch / subtitle | `src/app/App.tsx`, `src/app/app.css` |
| Workbench grid breakpoints | `app.css` `@media` 520 / 840 / 1240 |
| Hodograph + overlays | `HodographPanel`, `HodographOverlayControls` |
| Runtime Pause / Reset / Speed | `TracerRuntimeControls` |
| Follow / Reset View | `ExploreFollowControl`, `ExploreResetViewControl` |
| Release | `ExplorePointReleaseControls` |
| Airflow view / Highlight / Depth cue | `VisualAirflowWorkbenchControls` |
| Guided experiment select + teaching | `GuidedExperimentSelector`, `GuidedExperimentPanel` |
| 3D scene | `TracerViewport` (fixed CSS height **420px**) |
| Inspector L1/L2 | `TracerInspectorPanel` |
| Point diagnostics sibling | `PointDiagnosticsPanel` |

Layout facts reconciled with screenshots:

```text
.app max-width 1680px, centered
workbench <840px   single column
workbench ≥840px   hodograph | laboratory; inspector under lab
workbench ≥1240px  hodograph | laboratory | inspector
tracer-viewport    height: 420px (fixed)
sticky             only .tracer-inspector at ≥1240px;
                   Point diagnostics are not sticky
Explore toolbar    vertical stack inside .laboratory-toolbar:
                   runtime, Follow, Reset View, release,
                   airflow view + diagnostic tools + depth cue,
                   each with multi-line teaching copy
Guided honesty     GUIDED_LABORATORY_HONESTY inside teaching panel
Explore honesty    only inside Point diagnostics after selection
subtitle           frame semantics only; not model-class anti-claim
Follow disabled    no visible reason when no selection
Confirm/Cancel     disabled without pending seed; no reason
```

---

## 4. Current layout diagnosis

**Kind:** LIVE EVIDENCE + CURRENT FACT.

The live product is a **document-shaped workbench**, not a
scene-first laboratory:

1. **Primary visual work happens in a fixed 420px band** that
   sits under a tall Explore control stack.
2. **Selected-tracer observation is a third full-height column**
   whose populated content exceeds the remaining viewport, so
   the browser page must scroll.
3. **Page scroll moves the scene out of comfortable view**
   precisely when T7–T9 require simultaneous reading and
   watching.
4. **Environmental reference permanently occupies a left
   column** even though V1 has one fixed hodograph and overlay
   toggles are infrequent after initial orientation.
5. **Teaching/context copy is inline in the Explore toolbar**,
   inflating footprint beyond control semantics (`39` already
   fixed product meaning; M3 must fix footprint).
6. **Guided currently fits** because it lacks release/airflow
   stacks and Point diagnostics; Explore does not inherit that
   budget.
7. **Accepted interaction wins** (picking, halo, Follow, Reset
   View) are undermined by shell competition, not by those
   mechanisms themselves.

```text
Diagnosis one-liner
  V1 capabilities are present; their spatial organization
  makes the main Explore observation loop page-scroll against
  the scene.
```

---

## 5. Task-based audit (T1–T10)

| Task | Primary visual target | Required controls / info | Current path | Competition / scroll / fold | Scene must stay visible? | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| T1 | Mode switch | Reach Explore | Header Guided/Explore; opens Guided | No Explore purpose line; release/diagnostics only after switch | No | Partial risk (F6) |
| T2 | Hodograph | Profile, C, V_sr meaning | Permanent left column + overlays | Strong discoverability; high permanent cost | No | Pass-capable; placement overbuilt |
| T3 | Viewport + release | Altitude, Enable placement, click, Confirm | Copy in toolbar; empty Inspector does not route to release | Toolbar height pushes scene down | Yes during placement | Functional path exists; empty-state weak (F1) |
| T4 | Runtime controls | Pause / Speed / Reset | Top of lab column | Terminology Reset vs Reset View vs Clear (F7) | Helpful | Pass-capable |
| T5 | Viewport glyphs | Selection | Screen-space pick in 420px canvas under tall stack | Scene undersized relative to chrome; no Follow reason when disabled | Yes | Mechanism OK; shell risks comfort |
| T6 | Viewport + Follow/Reset View | Follow, Reset View | Near runtime; disabled Follow unexplained | Follow OK; recovery OK; still under tall stack | Yes during follow/recover | Interaction OK; shell noisy |
| T7 | Inspector L1/L2 + scene | V_total + seven rows | Right column after select | Page scroll vs scene (F5) | Yes while interpreting motion | **Fails comfort loop** |
| T8 | Point diagnostics + scene | T_tilt,y, ω_y,current + units | Below full Inspector | Often below fold; not sticky | Yes | **Fails comfort loop** |
| T9 | Point diagnostics anti-claim | Tendency ≠ existence copy | Same block as T8 | Same fold problem | Helpful | Honesty present; reachability poor |
| T10 | Persistent model-class statement | Prescribed / not simulated | Explore: only after selection in diagnostics; Guided: teaching panel | F2 in Explore | No | **Explore fails persistence** |

Critical chain:

```text
select → Inspector → Point diagnostics → Follow → watch scene
```

Under the live Explore shell this chain forces a choice between
keeping the scene in view and reading the observation surface.

---

## 6. Information-hierarchy classification

| Surface | Class | Current prominence match? |
| --- | --- | --- |
| 3D viewport | **A** primary laboratory workspace | **No** — fixed secondary band under chrome |
| Pause / Reset / Speed | **B** frequent action | Partial — correct column, excessive neighbors |
| Follow / Reset View | **B** frequent action | Partial — present; disabled reason missing |
| Release controls | **B** frequent action (Explore) | Partial — present; copy-heavy |
| Inspector L1/L2 | **C** selected-tracer contextual | No — competes via page scroll |
| Point diagnostics | **C** selected-tracer contextual | No — below Inspector + fold |
| Hodograph + overlays | **D** environmental / reference | Over-prominent for one fixed profile |
| Airflow view toggle | **E** diagnostic / advanced (product-exposed) | Over-copied inline |
| Highlight / operand | **E** diagnostic | Over-copied inline |
| Depth cue | **E** advanced viewing aid | Over-copied inline |
| Guided Observe / Demonstrates / Does not mean | **F** teaching / context | Appropriate in Guided; Explore toolbar copy is F misplaced as permanent chrome |
| Mode switch | **G** mode / navigation | Present; purpose signposting weak |
| Persistent model-class line | **G** + honesty contract | Missing in Explore before selection |

**Rule used here:** scientific importance ≠ permanent large
screen claim. The hodograph is scientifically central to A3/T2
and still may be an on-demand reference if discoverable. The
viewport is the interrogation workspace for A1 and must win
spatial priority during Explore observation.

---

## 7. Viewport-priority decision

**NEW M1 / M3 PRODUCT DECISION.**

```text
In V1 Explore, the 3D viewport is the primary laboratory
workspace (class A), not one equal panel among many.

At representative desktop 1920×1080, the active scene must
remain visible throughout the normal selected-tracer
observation loop without browser page scrolling.
```

Minimum practical desktop treatment for that case:

```text
- scene remains on-screen with Inspector + Point diagnostics
- page scroll is not the observation mechanism
- viewport height is governed by the Explore height budget
  after chrome, not by a permanently stacked teaching column
- no new camera mode, encoding, or Follow behavior
```

Growing the scene by reclaiming chrome and using column height
is **M3 layout work**. A further “larger / resizable viewport”
program remains **V1 CONDITIONAL** per `38` §4.2 only if, after
this reorganization, T5/T6 still fail because canvas size alone
makes selection or following impractical.

---

## 8. 1920×1080 fold / scroll decision

**NEW M1 / M3 PRODUCT DECISION.**

```text
V1 MUST support the main Explore loop at 1920×1080 without
vertical page scrolling.

The user MUST be able to keep both:
  1. the active 3D scene
  2. the selected-tracer observation surface
    (Inspector L1/L2 + Point diagnostics)
available during normal observation without moving the
browser page.
```

Strategy comparison (not yet the whole-layout choice):

| Strategy | Idea | Helps fold? | Risk |
| --- | --- | --- | --- |
| S1 Compress toolbar in place | Keep 3 columns; horizontalize controls; shrink copy | Vertical chrome ↓ | May still leave observation taller than viewport |
| S2 Independent observation scroll | Right region scrolls; page does not | Keeps scene fixed | Needs page-scroll lock + height budget |
| S3 Move controls off top of scene | Left/top rail; scene starts higher / taller | Strong | Control discoverability / density |
| S4 Relocate hodograph | Free horizontal band for controls or scene | Enables S3 | T2 discoverability |
| S5 Move diagnostics onto scene chrome | Overlay cards | Avoids column height | Visual competition with glyphs; rejected as default |

**Decision:** combine **S1 + S2 + S3 + S4** inside one Explore
architecture (see §14–§15). S5 is rejected as the default
observation home.

Guided may continue to fit without page scroll under a
different local budget; it is not forced onto the Explore
rail layout if Guided tasks remain clear.

---

## 9. Control-consolidation decision

**NEW M1 / M3 PRODUCT DECISION.**

Semantic groups and V1 exposure:

| Group | Persistence | Footprint rule |
| --- | --- | --- |
| Pause / Reset / Speed | Persistent Explore + Guided | One compact runtime row |
| Follow / Reset View | Persistent Explore | Same runtime/view row; disabled Follow states a reason |
| Release (altitude, enable, confirm/cancel/clear) | Persistent Explore | Compact row; short empty-state pointer; long prose not permanent |
| Airflow view (Comets / Eulerian diagnostic) | Persistent Explore product control (`39`) | Compact toggle; detail copy on demand or one short line |
| Highlight + operand | Persistent but secondary diagnostic (`39`) | Compact; default Off; long anti-claim not a permanent multi-paragraph chrome block |
| Depth cue | Persistent advanced aid (`39`) | Checkbox-scale; short or deferred detail |

Consolidation rules:

```text
Do not remove accepted V1 capability.
Do not add capability.
Do not invent a settings framework.
Related frequent actions may share one horizontal band.
Class F copy may not permanently dictate class A height.
Terminology pass (F7): distinguish Reset (simulation),
  Reset View (camera), Clear (released tracers).
Disabled reasons (F8): Follow without selection;
  Confirm/Cancel without pending seed.
```

---

## 10. Hodograph role

V1 has **one fixed canonical environmental profile** (`38` §5).
The plot is not editable and does not host another environment.

### 10.1 Options

| Option | Placement | T1–T10 | Discoverability | Scientific context | Horizontal cost | Interaction frequency | Overlays | A3/T2 risk if weakened |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **A** Current permanent left column | Always visible | Strong T2 | Highest | Highest continuous | High (260–320px) | Low after orientation | Natural neighbor | Low |
| **B** Collapsible / on-demand Environment surface | Closed by default or after first open; always-visible affordance | T2 needs open once | Medium–high if labeled | Available on demand | Low when closed | Matches actual use | Travel with panel | Medium unless affordance is explicit |
| **C** Compact persistent reference | Always-visible small plot | T2 OK | High | Reduced readability | Medium | Low | Cramped | Low–medium |
| **D** Header / mode-adjacent Environment drawer over the scene | Same as B with overlay presentation | T2 OK if labeled | High if in header | Good when open | None when closed | Low | In drawer | Medium if users never open |

### 10.2 Choice

**Chosen: Option B, refined — “Environment” reference surface.**

```text
Hodograph + overlay controls leave the permanent left column.
They live in an on-demand Environment surface with a
persistent, labeled affordance visible before tracer selection.

Guided may default Environment open.
Explore may default Environment closed after the shell loads,
provided the affordance remains obvious and empty-state /
mode copy points to it for A3/T2.
```

Why not A: permanent width tax is too high for a fixed profile
whose overlays are not part of the per-frame observation loop
that currently fails.

Why not C alone: keeps permanent horizontal claim without
solving the need to host frequent controls beside the scene.

Why not D as distinct architecture: D is an allowed
presentation of B; the contract is on-demand Environment, not
a specific drawer widget family.

**ANTI-CLAIM:** collapsing the hodograph is not permission to
drop A3/T2, edit the profile, or add environments.

---

## 11. Inspector + Point diagnostics layout decision

**NEW M1 / M3 PRODUCT DECISION.**

```text
Inspector L1/L2 and Point diagnostics remain architecturally
distinct (19 / 32) and share one selected-tracer observation
region in Explore.
```

Contracts:

```text
Ordering
  Inspector (Motion + Why this motion?) above
  Point diagnostics (T_tilt,y, ω_y,current + anti-claim)

Region
  One right-hand observation dock beside the viewport

Scrolling
  The observation region may scroll internally.
  The browser page must not be the mechanism that reveals
  diagnostics during normal Explore observation at 1920×1080.
  The scene does not scroll away to reveal diagnostics.

No-selection
  Shared empty state must point to selection and, in Explore,
  to release as the way to create something selectable (F1).

Honesty copy
  Point-diagnostics anti-claim remains available whenever
  diagnostics are shown. It may be tightened typographically
  but must remain readable without requiring a second page
  scroll. It is not a substitute for persistent M1 identity.
```

Do not merge data models. Do not fold T1/A into Inspector L2.

---

## 12. Guided vs Explore shell decision

**NEW M1 / M3 PRODUCT DECISION.**

Shared:

```text
product title
Guided | Explore mode switch
persistent M1 model-class identity line
Environment affordance for the one fixed hodograph
runtime Pause / Reset / Speed
shared Inspector presentational component
```

May differ:

```text
Explore
  left/action rail or equivalent compact control band
  release, Follow, Reset View, airflow product controls
  Point diagnostics in the observation dock
  scene-first height budget without page scroll at 1920×1080

Guided
  exactly three experiments
  existing scientific claims / teaching blocks
  no new mounts (no Point diagnostics, Follow, Reset View,
    release, or airflow population)
  may keep Environment open by default
  may keep teaching panel adjacent without forcing Explore’s
    control rail if Guided still fits one viewport
```

Mode signposting (F6), inside copy/labels only:

```text
Guided  curated experiments in the prescribed laboratory
Explore release parcels; read contributions and diagnostics
```

---

## 13. M1 persistent model-class honesty decision

**NEW M1 / M3 PRODUCT DECISION.**

Smallest clear hierarchy:

```text
1. Persistent identity (both modes, before any selection)
   Short product-surface line that this is a prescribed,
   storm-relative kinematic laboratory — idealized storm flow
   is prescribed; nothing here is a self-developing supercell
   simulation or forecast.

2. Contextual / detail anti-claims (remain where they belong)
   Guided teaching “Does not mean” / laboratory honesty line
   Point diagnostics tendency ≠ existence block
   Airflow view / Highlight / Depth cue semantic disclaimers
   Frame subtitle may keep ground-relative vs storm-relative
     laboratory-frame wording; it does not carry M1 alone.
```

Placement contract:

```text
Persistent identity lives in the global header/chrome band,
visible in Guided and Explore without opening Environment,
without selecting a tracer, and without scrolling.
```

**ANTI-CLAIM:** M1 is not a full-screen warning banner and not
sole reliance on Point diagnostics.

---

## 14. Responsive V1 boundary

**CURRENT FACT + NEW DECISION.**

Existing breakpoints (≈520 / 840 / 1240) remain the V1 layout
assumption set. Primary target for this pass:

```text
representative desktop, including 1920×1080
```

```text
Additional responsive / mobile redesign beyond existing
breakpoints is V1 CONDITIONAL per 38 §4.2 — admitted only if
a recorded playtest on a named target device fails an
acceptance task for layout reasons.

M3 does not expand into a complete mobile program.
```

---

## 15. Whole-layout options (Explore)

### Option 1 — Compact-in-place three column

```text
Regions
  Left   permanent hodograph (A)
  Center compressed toolbar over flex-grown viewport
  Right  observation dock with internal scroll

Viewport priority
  Improved vs today; still shares width with permanent
  hodograph

Scrolling
  Page scroll suppressed at 1920×1080; observation region
  scrolls internally

Advantages
  Lowest structural change; strongest continuous T2

Costs
  Frequent controls remain above the scene; horizontal tax
  remains

Risks
  Compression alone may not free enough vertical budget;
  F4 may survive

T1–T10
  Helps T7–T9 if S2 works; weak on control-vs-scene
  competition; T2 safe
```

### Option 2 — Controls | Viewport | Observation
(with Environment on demand)

```text
Regions
  Left     frequent Explore actions (runtime, view, release,
           compact airflow / diagnostic tools)
  Center   primary 3D viewport (class A height budget)
  Right    selected-tracer observation dock
  Chrome   mode switch + M1 identity + Environment affordance
  On demand Environment surface = hodograph + overlays

Viewport priority
  Highest among options — scene is the middle of the product

Scrolling
  No page scroll for main loop; observation internal scroll;
  Environment uses its own surface scroll if needed

Advantages
  Matches task geometry: act → watch → read
  Removes permanent left tax for a fixed profile
  Lets controls leave the vertical stack above the scene

Costs
  T2 requires using Environment affordance
  Guided/Explore shell divergence needs care

Risks
  Users miss hodograph if affordance/copy are weak
  Left rail can become a new dense column if copy is not
  compacted

T1–T10
  Best joint treatment of T3–T9; T2 acceptable with explicit
  Environment labeling and Guided default-open; T10 via
  header identity
```

### Option 3 — Viewport-dominant top chrome

```text
Regions
  Top thin chrome: mode, M1, Environment, runtime/view
  Center full-width viewport
  Right observation dock overlaying or docking beside scene
  Release / airflow in overflow “Tools” strip

Viewport priority
  Maximum scene area

Scrolling
  No page scroll; tools strip must not reintroduce fold

Advantages
  Strongest scene presence

Costs
  Release and airflow discoverability drop
  Higher chance of hidden primary actions (T3/T7 support)

Risks
  F1/F6-class failures migrate into a Tools menu
  Closer to a new IA than reorganization

T1–T10
  Strong T5/T6; weaker T3/T7 onboarding unless Tools stay
  visibly populated — rejected as default
```

---

## 16. Recommended architecture

**NEW M1 / M3 PRODUCT DECISION.**

```text
Recommend Option 2 — Explore scene-first three-band laboratory:

  [ Header: title | M1 identity | Guided/Explore | Environment ]

  [ Action rail ] [ Primary 3D viewport ] [ Observation dock ]
       B                A                        C
                                              Inspector
                                              Point diagnostics

  Environment (D) = on-demand hodograph + overlays
  Airflow Highlight / Depth cue remain available as compact
  E controls on the action rail, not a research novel.
```

Guided retains a teaching-forward local arrangement compatible
with the shared header, M1 identity, Environment affordance,
runtime controls, and Inspector, without new mounts.

This recommendation adopts the user’s spatial hypothesis only
where evidence supports it: permanent hodograph width is poorly
matched to V1’s single fixed profile and blocks a controls |
scene | observation geometry that matches T3–T9. It rejects
treating that hypothesis as automatic: Option 1 remains the
fallback if Phase 4 playtest shows T2 failing because
Environment is not found, and Option 3 is rejected as default
for hiding frequent actions.

### 16.1 Explicit treatment of user hypotheses

| Hypothesis | Verdict |
| --- | --- |
| Make top controls more compact / more horizontal | **Accepted** as necessary in all viable options |
| Move static V1 hodograph to on-demand / slide-out | **Accepted** as Option B / recommended Option 2 |
| Use freed left area for tracer/release/runtime controls | **Accepted** in recommended Option 2 |
| Keep full selected-tracer observation on the right | **Accepted**; becomes an internally scrolling dock |
| Adopt the above merely because suggested | **Rejected** — chosen only after T1–T10 / hierarchy / fold evidence |

---

## 17. Freeze-boundary confirmation

```text
FEATURE FREEZE        ACTIVE
New capability added  NONE
CONDITIONAL admitted  NONE in this SoT

Solved by M1/M3 means
  hierarchy, placement, grouping, labels, copy, defaults,
  visibility, scrolling policy, disabled reasons,
  terminology, empty states

If later playtest fails T2 because Environment is undiscoverable
  first remedy: copy / default-open / stronger affordance
  not a new environment feature

If later playtest fails T5/T6 because canvas remains too small
  after Option 2 lands: only then consider 38 §4.2 viewport
  CONDITIONAL item with recorded evidence
```

No apparent need discovered here required freeze entry.

---

## 18. Functional closure checklist (architecture)

Maps to `38` F-items and M1:

```text
F1  Explore empty observation state points to selection and
    release path
F2 / M1  Persistent model-class identity in header chrome
F3  Already closed by 39 product copy; M3 must not reintroduce
    workbench language while compacting
F4  Scene-first Explore height budget; controls leave the
    permanent teaching stack above a 420px trap
F5  Observation dock internal scroll; page scroll not required
    for T7–T9 at 1920×1080
F6  Mode purpose lines for Guided vs Explore
F7  Reset / Reset View / Clear terminology pass
F8  Disabled reasons for Follow and Confirm/Cancel
F9  Remains M4 release-surface work, not this SoT
```

---

## 19. Implementation slices (proposed; not authorized here)

Ordered vertical slices for a later production command:

```text
Slice A  Explore shell regions + page vs region scroll policy
         + viewport height budget at desktop
Slice B  Action-rail control consolidation + terminology +
         disabled reasons + compact airflow/diagnostic chrome
Slice C  Observation dock (Inspector + Point diagnostics)
         shared empty state + internal scroll contract
Slice D  Environment on-demand surface for hodograph/overlays
         + Guided default-open policy
Slice E  M1 persistent identity + mode signposting copy
Slice F  Guided teaching-copy consolidation without new mounts
         and without breaking one-viewport Guided fit
Slice G  Focused wiring/layout tests for the above contracts
```

Each slice rearranges or relabels existing capability only.

---

## 20. Anti-claims

```text
This SoT does not authorize production implementation.
This SoT does not add product capability under freeze.
This SoT does not merge Inspector L2 with Point diagnostics.
This SoT does not hide required scientific honesty to save space.
This SoT does not make the hodograph editable.
This SoT does not add environments, experiments, or overlays.
This SoT does not redesign Comets, Follow, picking, or halo.
This SoT does not reopen physics or model class.
This SoT does not expand M3 into a mobile redesign program.
Cosmetic polish remains POST-V1.
```

---

## 21. Documentation authority

```text
38  owns V1 promise, MUST/CONDITIONAL lists, freeze rule,
    acceptance T1–T10, roadmap phases

39  owns M2 visual-airflow product default and related
    exposure / copy; COMPLETE

40  owns M1 honesty placement hierarchy and M3 spatial /
    informational organization contracts for the existing
    V1 surface

16  remains Explore/Guided mode split SoT
19  remains Inspector L1/L2 SoT
32  remains Point diagnostics sibling SoT
36 / 37  remain selection and Reset View contracts
```

Successor production work: implement §19 slices only when
explicitly commanded. Successor validation: `38` Phase 4
acceptance playtest (M5).

---

## 22. Compact lock-in

```text
VIEWPORT              Explore class A primary workspace
FOLD AT 1920×1080     main Explore loop without page scroll;
                      scene + observation both available
CONTROLS              compact action rail; copy footprint ↓
HODOGRAPH             on-demand Environment (Option B)
OBSERVATION           one right dock; Inspector then diagnostics;
                      region scroll, not page scroll
GUIDED VS EXPLORE     shared chrome; different local shells;
                      no new Guided mounts
M1                    short persistent header identity
RESPONSIVE            existing breakpoints; further work
                      CONDITIONAL
RECOMMENDED LAYOUT    Option 2
USER HYPOTHESES       accepted where evidenced; not automatic
FREEZE                intact; no new capability
IMPLEMENTATION        NOT STARTED / NOT AUTHORIZED HERE
NEXT                  production M1/M3 slices when commanded;
                      then M5 playtest
```

---

## 23. Final decision

1. **What is wrong with the live UI?**  
   Capabilities exist, but Explore organizes them as a tall
   document: chrome and copy crush the scene, and observation
   requires page scrolling away from moving tracers.

2. **What is the V1 viewport role?**  
   Primary laboratory workspace in Explore.

3. **Must 1920×1080 Explore work without page scroll?**  
   Yes, for the main observation loop with scene and
   selected-tracer readouts both available.

4. **Where do frequent controls go?**  
   Compact action rail / horizontal bands; diagnostic copy no
   longer owns permanent height.

5. **Where does the hodograph go?**  
   On-demand Environment surface with persistent affordance;
   Guided may default open.

6. **How do Inspector and Point diagnostics sit?**  
   One observation dock, distinct models, Inspector above
   diagnostics, internal scroll.

7. **How do Guided and Explore differ?**  
   Shared honesty/mode/Environment/runtime chrome; Explore is
   scene-first with release/diagnostics; Guided keeps three
   experiments and teaching blocks without new mounts.

8. **Where does M1 live?**  
   Short persistent header identity before selection.

9. **Recommended whole layout?**  
   Option 2.

10. **Does this authorize implementation?**  

```text
NO.
```
