# Explore Selection Acquisition and Identity Indication Architecture

**Status:** ARCHITECTURE / PRODUCT SoT /
SLICE 1 COMPLETE /
SLICE 2 COMPLETE /
screen-space acquisition IMPLEMENTED /
base-color preservation IMPLEMENTED /
selection halo IMPLEMENTED
**Scope:** interaction/rendering contract for selected-tracer
*acquisition* (easier intended pick) and *identity continuity*
(selection indication that does not destroy the tracer’s
occupancy/path color). Not a Follow redesign. Not Reset View.
Not scientific tracer recolor. Not physics. Not `ROADMAP.md`.
**Physics:** T1 and Candidate A remain CLOSED. Model class
remains prescribed kinematic laboratory (`30`). This file
does not reopen `22`, `23`, `26`, `28`, `30`–`34`, or the
ranking in `35`.
**Implementation:** Slice 1 COMPLETE
(`src/rendering/pickVisibleTracerSlot.ts` screen-space helpers;
`TracerScene.pickVisibleTracerAtClientPoint`;
`TracerViewport` client-point wiring).
`PICK_TOLERANCE_PX = 16` (CSS/canvas pixels).
Former raycast `pickVisibleTracerSlotIndex(slots, ray)` removed;
product acquisition is screen-space only.
Slice 2 COMPLETE
(`src/rendering/selectionHaloMarker.ts`;
`TracerScene` one selection halo; yellow glyph override retired;
occupancy `TRACER_COLORS` preserved on select).
`SELECTION_HALO_COLOR = 0xffcc66`, radius = glyph × 1.6
(= 240 m when glyph is 150 m).

Predecessor product-direction checkpoint:

```text
docs/architecture/35-post-follow-live-playtest-product-direction-checkpoint.md
```

Accepted checkpoint commit this contract is written against:

```text
52fb876bbfd22f609cc3648a9e3ecf1d884f68f8
```

`35` selected:

```text
Explore selected-tracer acquisition and identity indication
(enlarged pick target + preserve occupancy/path color +
explicit selection halo/shell)
```

This file is the architecture SoT that checkpoint required.
Slice 1 (screen-space acquisition) is COMPLETE.
Slice 2 (preserve-color + selection halo) is COMPLETE.

Related contracts (not replaced):

```text
docs/CONCEPT.md
docs/ARCHITECTURE.md
docs/architecture/16-explore-guided-interaction-architecture.md
docs/architecture/18-explore-arbitrary-seeding.md
docs/architecture/19-shared-tracer-inspector.md
docs/architecture/24-perceptual-exploration-checkpoint.md
docs/architecture/34-selected-tracer-follow-camera-architecture.md
docs/rendering/01-tracer-scene.md
docs/rendering/11-deep-storm-tracer-view.md
docs/rendering/14-tracer-path-history.md
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

---

## 1. Why this SoT exists

The live Explore loop is:

```text
release tracer
→ see pathline
→ select tracer
→ Inspector L1/L2
→ Point diagnostics
→ Follow
→ optionally switch selection while following
```

Playtest (`35` E3, E4):

```text
the user can see a specific tracer
but the clickable glyph is too small on screen
after a successful pick the glyph turns yellow
with Follow A→B the camera retargets while color identity
collapses — especially when several tracers are close
```

Two related but distinct jobs:

```text
A. acquisition
   how easy it is to click the intended tracer

B. identity continuity
   how clearly the selected tracer remains the same object
   after selection / Follow retarget
```

Do **not** solve both only by enlarging the visible glyph.
Do **not** solve identity only by changing pick geometry.

Follow-as-framing (`34`) stays CLOSED. This SoT does not
change camera offset, pan-while-Follow, or lifecycle.

---

## 2. Live facts (verified in `src/**`)

**Kind:** CURRENT FACT.

### 2.1 Occupancy color and selection override

```text
TRACER_COLORS = [0xe74c3c, 0x3498db, 0x2ecc71]
  assigned at slot create: index % 3
  trail line uses the same occupancy color
  (createTrailLine(color); selection does not recolor trails)

SELECTED_TRACER_GLYPH_COLOR = 0xffcc33
  RETIRED from product selection visuals (Slice 2)
  selection indication = one selectionHalo wireframe shell
  glyph keeps TRACER_COLORS[slot % 3]
```

Historical note (pre–Slice 2, superseded):

```text
syncSelectedTracerGlyph used to yellow-override the glyph
selected glyph → yellow while trail stayed occupancy color
```

Classification of `TRACER_COLORS`:

| Question | Answer |
| --- | --- |
| Scientific encoding of V_i / T1 / ω / altitude? | **No** |
| Scenario / Guided pedagogy meaning? | **No** |
| Arbitrary fixed palette? | **Yes** (three authored hexes) |
| Path / occupancy cosmetic identity? | **Yes** |
| Stable per-tracer visual identity across Reset? | **Slot-index cyclic**, not a permanent scientific id. After Clear, new releases restart slot colors from index 0. Across Reset with the same seed list, the same slot indices keep the same palette entry. |

Product usefulness:

```text
Even though the palette is not scientific, the red/blue/green
cycle is the user’s primary on-canvas handle for “that one”
among several pathlines — especially when Follow retargets.
Destroying it on select is the E4 failure.
```

After Slice 2 the glyph and trail stay occupancy-colored while
selected; indication is the separate halo.

### 2.2 Glyph geometry and preview

```text
DEEP_STORM_TRACER_VIEW.sphereRadiusM = 150
shared SphereGeometry for all scientific glyphs
preview = white wireframe SphereGeometry(radiusM, 12, 8)
  RELEASE_PREVIEW_COLOR 0xffffff
  not a slot; not pickable via pickVisibleTracer
```

Playtest hygiene (`35`):

```text
A white wireframe preview and a yellow glyph in one frame
do NOT mean “yellow tracer inside the preview.”
The yellow object can be a separate selected tracer behind
the preview. Preview remains a standalone pending-seed mark.
```

### 2.3 Picking pipeline

```text
pointerdown → store client x/y
pointerup → movement = hypot(Δx, Δy)
shouldAcceptStationaryClick
  DEFAULT_STATIONARY_CLICK_MOVEMENT_PX = 5
  (aliased as DEFAULT_PLACEMENT_CLICK_MOVEMENT_PX)
worldRayFromCameraNdc(camera, ndc)     // placement only
TracerScene.pickVisibleTracerAtClientPoint(clientX, clientY, rect)
  → pickVisibleTracerSlotAtClientPoint(slots, camera, …)
  → projectWorldPointToCanvasPixels (CSS px)
  → d_px ≤ PICK_TOLERANCE_PX (16)
  → min d_px → front-most depth → lower slot index
resolveTracerPointerUp
  ignore if drag
  select if hitSlotIndex !== null
  else placement if available
  else ignore
tracerIdForSlot(particles, slotIndex) → selection.select
```

Former mesh-raycast acquisition (`pickVisibleTracerSlotIndex` +
`Raycaster.intersectObjects`) is removed. World rays remain for
Explore placement only.

### 2.4 Selection ownership and highlight observation

```text
TracerSelection (App)     owns selectedId
TracerViewport            maps selectedId → occupancy slot
TracerScene.syncSelectedSlot(slotIndex)
  observes selected occupancy slot
  applies one selection halo when the glyph is visible
  does not recolor glyph materials
```

### 2.5 Inactive visibility

```text
Explore: keepInactiveGlyphs === false
  inactive glyph hidden; not newly pickable
  selected inactive particle may remain Inspector / diagnostic
  marker (`19`, `32`, `34`)

Guided D1: keepInactiveGlyphs === true
  exit glyph remains visible
```

### 2.6 Follow A→B (unchanged here)

```text
Follow ON + select B
  Follow stays ON
  camera retargets with preserved world offset (`34`)
  syncSelectedSlot moves the selection halo A → B (live)
```

This SoT changes the **visual** of that move (preserve B’s
color; move halo), not the camera contract.

---

## 3. Color semantics lock

**NEW PROJECT DECISION:**

```text
TRACER_COLORS = occupancy / path cosmetic identity palette
             ≠ scientific encoding
             ≠ selection state

Selection MUST NOT destroy the tracer’s base occupancy color
on the glyph or the pathline.
```

Channels:

```text
base tracer / path color   = identity / occupancy cosmetic
selection marker           = UI state channel (separate)
Inspector “Tracer #N”      = textual identity (already live)
```

Do not reinterpret the palette as physics.
Do not introduce a scientific colormap in this SoT.
Selected-trail emphasis remains later optional (`19`); v1 of
this SoT does not recolor trails for selection.

---

## 4. Acquisition vs identity (separation)

| Concern | Owns | Must not be “solved by” |
| --- | --- | --- |
| Acquisition | pick policy / hit tolerance | only making the visible glyph larger |
| Identity continuity | selection indication channel | only enlarging pick geometry |

**NEW PROJECT DECISION:** both are in scope of this SoT as
one *interaction concept*, but their mechanisms stay
independent:

```text
visible glyph radius
selection halo radius
picking tolerance
```

are allowed to differ. A visible halo is **not** automatically
the hit target unless a later decision deliberately says so
(this SoT does **not**).

---

## 5. Picking options

| Option | Near camera | Far / default rest pose | Zoom consistency | Cluster risk | Three.js / live fit | Cost | Testability |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **A. Larger invisible world-space hit sphere** | Hit region huge in pixels | Still tiny in pixels (same failure as now at 12–19 km) | Poor | High near camera | Easy mesh intersect | Low | Easy, but wrong contract |
| **B. Screen-space picking tolerance** | Stable pixel budget | Stable pixel budget | **Good** | Needs explicit tie-break | Pure helper + project centers; fits current ray/NDC pipeline | Low–medium | High if tests use pixel geometry |
| C. Visible glyph enlargement | Helps a bit | Still scales with projection | Poor as sole fix | Higher visual clutter | Changes `sphereRadiusM` semantics | Low | Easy; wrong problem owner |
| D. Nearest-to-ray / projected-distance among all tracers (no pixel cap) | Can select distant off-aim tracers | Same | Ambiguous | High | Possible | Medium | Needs a hard radius anyway → becomes B |
| E. `Raycaster` mesh threshold / Points hack | Unreliable for Mesh spheres | Unreliable | Poor | Unclear | Fights Three.js Mesh semantics | Low–trap | Weak |

### 5.1 Why not fixed world-space radius

Playtest problem is **on-screen** clickability while the glyph
is already visible. Fixed world radius:

```text
far camera:   still few pixels → E3 remains
near camera / zoomed: invisible hit shell dominates the view
                      → accidental picks in clusters
```

### 5.2 Accepted picking semantic

**NEW PROJECT DECISION: B — screen-space picking tolerance.**

Conceptual contract:

```text
For a stationary left-click that already passes
shouldAcceptStationaryClick:

candidates = visible scientific glyph slots
             (mesh.visible === true)
             excluding preview and visual-airflow occupants

For each candidate:
  project particle/glyph world center to canvas pixels
  d_px = distance from pointer-up client position
         to that projected center

Select the candidate with:
  1) d_px ≤ PICK_TOLERANCE_PX
  2) among those, minimal d_px
  3) if d_px ties within a small epsilon, front-most
     (smaller camera-space depth / distance along view)

If none qualify → no glyph selection
  (placement may still run under existing rules)
```

Notes:

```text
Tolerance is defined in **CSS/canvas pixels**, not metres.
Exact numeric PICK_TOLERANCE_PX is an implementation constant
chosen in the picking slice; this SoT locks the *semantic*
(screen-space), not a magic number.
Projection uses the live camera used for rendering
(same TracerScene camera as worldRayFromNdc).
World ray remains available for placement; glyph acquisition
does not require mesh intersection to succeed.
```

Rejected as primary: A, C, D-without-pixel-cap, E.

Optional later: a tiny world-space assist is unnecessary if B
is implemented correctly. Do not combine A+B in v1.

---

## 6. Clustered tracers / tie-break

**NEW PROJECT DECISION:**

```text
deterministic order:
  1. among candidates with d_px ≤ tolerance,
     choose minimal d_px
  2. if |d_a − d_b| ≤ tie epsilon (implementation detail,
     ideally 0 or sub-pixel), choose front-most
     (smaller depth from camera)
  3. if still tied, lower occupancy slot index
     (stable, existing layout order)
```

Rejected:

```text
arbitrary / unstable choice
“whichever Raycaster returned first” without the screen rule
slot order as the *primary* rule (ignores user aim)
```

When two tracers overlap on screen inside tolerance, the user
gets the closer (front) aimed candidate, then a stable index
fallback. Predictable, not perfect human mind-reading.

---

## 7. Pointer-drag / orbit safety

**STILL-BINDING (`19`, live `shouldAcceptStationaryClick`):**

```text
movement > DEFAULT_STATIONARY_CLICK_MOVEMENT_PX (5)
  → ignore selection and placement
```

**NEW PROJECT DECISION:**

```text
Screen-space pick tolerance applies ONLY after the
stationary-click gate succeeds.
It does not widen the drag threshold.
It does not change right-button pan / orbit semantics.
It does not redesign the global pointer pipeline.
```

Placement precedence remains (`resolveTracerPointerUp`):

```text
stationary + glyph candidate within tolerance → select
stationary + no glyph candidate + placement available → placement
else → ignore
```

Increasing pick tolerance must **not** convert orbit drags
into selections.

---

## 8. Selection indication options

| Option | Preserve base color? | Distance read | Dense clutter | Follow A→B | A11y beyond hue | Complexity |
| --- | --- | --- | --- | --- | --- | --- |
| A. Yellow glyph override (current) | **No** | OK | Low | Weakens identity | Hue-only | Already live |
| **B. Wireframe sphere / halo around selected** | **Yes** | Medium (scales in world) | Low if one marker | Strong | Shape channel | Low: one mesh |
| C. Outline / ring / billboard | Yes | Can stay more screen-constant | Medium | Good | Shape | Medium (billboard policy) |
| D. Scale pulse / size change | Yes | Confusable with depth | Medium | OK | Weak | Low–jank |
| E. Emissive / brightness only | Partial | Weak on MeshBasic | Low | Weak | Weak | Low |

### 8.1 Accepted indication

**NEW PROJECT DECISION: B — one selection halo / wireframe shell.**

```text
selected glyph keeps TRACER_COLORS[slot % 3]
pathline color unchanged
one scene selection marker tracks the selected slot’s
world position each observe sync
no selection → marker hidden / absent
```

Rejected as v1 primary: A (current), D, E.
C remains a possible later alternative if world-space halo
proves unreadably small at rest-pose distance; not chosen now
because B matches playtest language and live preview family
without a billboard system.

### 8.2 Accessibility / redundancy

```text
Halo supplies a non-hue channel (geometry).
Inspector already shows “Tracer #N”.
Do not add 3D text labels for selection.
Do not add a toolbar halo toggle.
```

---

## 9. Preserve base color contract

**NEW PROJECT DECISION:**

```text
base tracer color = identity / occupancy cosmetic channel
selection marker  = UI state channel

On select:
  glyph material stays at occupancy color
  trail stays at occupancy color
  selection halo appears (or moves) on that tracer

On unselect / A→B:
  previous tracer: no color mutation; halo leaves
  next tracer: no color mutation; halo arrives
```

`syncSelectedTracerGlyph` yellow override is **retired** by
this contract (implementation replaces that observation path).
`SELECTED_TRACER_GLYPH_COLOR` ceases to be the product
selection language.

---

## 10. Halo / wireframe semantics

### 10.1 Relation to placement preview

Preview (CURRENT FACT):

```text
white triangulated wireframe sphere
radius = sphereRadiusM (150 m)
pending seed only
not a tracer; not selection
```

**NEW PROJECT DECISION — vocabulary:**

```text
pending release preview
and
selected tracer halo
MAY share a visual *family*
  (surrounding wireframe sphere ≠ solid glyph)

They MUST remain clearly distinguishable objects.
Exact geometry reuse of the preview mesh/material/name
is REJECTED.
```

Distinguish at least by:

```text
attachment:  preview → pending seed; halo → selected tracer P
color:       preview stays white; halo uses a distinct
             selection-UI color (not TRACER_COLORS;
             not a full glyph yellow fill)
scale:       halo radius > glyph radius
             (implementation chooses factor; semantic:
              surrounds the glyph, does not replace it)
pick role:   neither preview nor halo is a selection
             *candidate source* that replaces screen-space
             center picking; halo is indication only
name/id:     separate mesh identity from exploreReleasePreview
```

Exact reuse would collide:

```text
wireframe = not yet released
vs
wireframe = selected
```

Same family, different instance/style — accepted.
Clone-the-preview-as-selection — rejected.

### 10.2 Halo sizing, depth, cadence

```text
halo radius:     world-space, related to glyph radius
                 (independent of PICK_TOLERANCE_PX)
depth:           normal depth-tested mesh (no x-ray unless a
                 later slice proves rest-pose unreadability)
cadence:         observe sync with glyph positions
                 (same last completed fixed-step P)
count:           at most one halo for the current selected slot
```

Performance:

```text
one selection marker total
not one halo per tracer
fits current TracerScene resource model
(shared glyph geometry + per-slot materials; preview already
is a single extra mesh)
```

---

## 11. Hit target vs halo vs glyph (independence)

**NEW PROJECT DECISION:**

```text
visible glyph radius     = DEEP_STORM_TRACER_VIEW.sphereRadiusM
                           (unchanged by this SoT)
selection halo radius    = glyph-related world radius > glyph
picking tolerance        = screen-space pixels (independent)
```

The halo must **not** silently become the pick mesh.
Acquisition uses projected centers + pixel tolerance (§5.2).

---

## 12. Follow interaction

**STILL-BINDING (`34`):**

```text
Follow ON + A→B
  Follow stays ON
  camera retargets with preserved world-space offset
  no orientation/zoom snap
```

**NEW PROJECT DECISION (visual only):**

```text
B keeps its occupancy color
selection halo moves A → B immediately on selection change
do not delay indication until camera motion “settles”
Follow does not own selection visuals
Follow does not change pick policy
```

---

## 13. Inactive selected tracer

**STILL-BINDING (`19`):**

```text
inactive selected particle may remain Inspector / diagnostic
marker while it exists
Explore: hidden inactive glyph is not newly pickable
Guided D1: exit glyph may remain visible
```

**NEW PROJECT DECISION:**

```text
selection *data* lifecycle unchanged
selection *indication* follows the selected glyph mesh
visibility:

  if selected slot mesh.visible === true
    → show halo at particle.position
  if selected slot mesh.visible === false
    → hide halo
    → do not invent a floating unexplained marker
    → Inspector / diagnostics may still show Tracer #N
```

Recorded live tension (not broadened here):

```text
Explore can keep a selectedId on a hidden inactive glyph.
Today yellow override is also invisible when the mesh is hidden.
Halo-follows-visibility preserves that same visual silence
rather than introducing a new floating shell.
```

Do not rewrite selection lifecycle to clear-on-inactive.
Do not auto-disable Follow on inactive (`34` remains).

---

## 14. UI control impact

**NEW PROJECT DECISION:**

```text
no new toolbar controls
no picking sensitivity slider
no halo toggle
no selection mode button

acquisition improvement = invisible policy
identity indication = automatic feedback after select
```

Toolbar density (`35`) is already high; this SoT must not
add chrome.

---

## 15. Architectural boundary

**STILL-BINDING / NEW PROJECT DECISION:**

```text
TracerSelection remains the only product selection owner
TracerScene observes selected occupancy slot
  + applies at most one selection halo
  + runs screen-space pick helper for visible slots

Forbidden new owners:
  SelectionManager
  duplicate pickedTracerId store
  visualSelectionState product owner
  diagnostic selection
  Follow-owned selection
```

Rendering must not store scientific meaning in the halo.
Halo is UI state observation, like today’s highlight.

Shared Explore + Guided rendering path: both labs use
`TracerScene` picking and `syncSelectedSlot`. The playtest
driver is Explore, but the contract is **shared observation**,
not an Explore-only fork of pick/highlight semantics.
Guided still does not mount Point diagnostics or Follow UI.

---

## 16. Option ranking (compact)

### Picking

```text
1  B screen-space tolerance          ACCEPTED
2  A world-space invisible sphere    REJECTED as primary
3  C visible glyph enlargement       REJECTED as primary
4  D uncapped nearest-to-ray         REJECTED
5  E Raycaster mesh-threshold hack   REJECTED
```

### Selection indication

```text
1  B wireframe / halo shell         ACCEPTED
2  C outline / ring / billboard      deferred alternative
3  E brightness-only                 REJECTED as primary
4  D scale pulse                     REJECTED
5  A yellow override                 REJECTED going forward
```

---

## 17. Explicit product answers

```text
What do tracer colors currently mean?
  Occupancy/path cosmetic palette (slot index % 3).
  Not scientific.

Does selected tracer preserve its color?
  YES (this SoT). Yellow override retired.

What visual channel indicates selection?
  One surrounding wireframe/halo shell.

What exact family of selection marker?
  Surrounding wireframe sphere shell related to glyph radius.

Can preview and selection halo share vocabulary?
  Same family; not exact reuse; must be distinguishable.

What is the picking tolerance semantic?
  Screen-space: projected glyph center within PICK_TOLERANCE_PX.

World-space or screen-space?
  Screen-space.

How are clustered candidates resolved?
  Min d_px within tolerance; then front-most; then lower slot index.

How is orbit-drag rejection preserved?
  Stationary-click gate (5 px) unchanged; tolerance only after gate.

What happens on A→B while Follow ON?
  Camera retarget per `34`; B keeps color; halo moves immediately.

What happens for inactive selected tracer?
  Data selection unchanged; halo follows glyph visibility.

Does this require new UI controls?
  NO.

Are picking and halo one slice or separate?
  One architecture; two implementation slices (§19).
```

---

## 18. Test contract

### 18.1 Picking (future implementation)

```text
visible tracer selectable with intended screen tolerance
pointer slightly outside visible glyph silhouette but inside
  tolerance → selects that tracer
pointer outside tolerance → no glyph select
far / rest-pose distance still acquires within tolerance
  (distinguishes screen-space from fixed-world-radius)
near / zoomed: tolerance does not grow into metres-driven
  accidental dominance beyond the pixel contract
cluster: deterministic tie-break (min d_px → depth → slot)
orbit drag (movement > 5 px) → no select
placement policy intact when no glyph candidate
visual airflow occupants remain non-pickable
preview remains non-selection candidate
halo mesh is not the acquisition geometry
```

Prefer pure helper tests with fake projections / pixel
distances. Do not add a WebGL screenshot harness (`01`).

### 18.2 Selection indication (future implementation)

```text
unselected tracer keeps base occupancy color
selected tracer keeps the SAME base occupancy color
separate selection marker appears for selected slot
A→B: marker moves; previous color unchanged; next color unchanged
Follow ON does not alter base colors
selection alone does not alter pathline color
no selection → no marker
Clear → no marker (selection cleared)
mode switch follows existing selection clear + scene remount
inactive + hidden glyph → marker hidden; selectedId may remain
preview marker ≠ selection halo (distinct object/style)
Inspector Tracer #N still works without 3D labels
```

---

## 19. Future implementation slices

Derived from live ownership (`pickVisibleTracerSlot*`,
`syncSelectedTracerGlyph`, single preview mesh pattern).
Not a license to implement Slice 2 from this status update.

```text
Slice 1 — screen-space acquisition                 COMPLETE
  src/rendering/pickVisibleTracerSlot.ts
    PICK_TOLERANCE_PX = 16 (CSS/canvas pixels)
    projectWorldPointToCanvasPixels
    chooseScreenPickWinner
    pickVisibleTracerSlotByScreenDistance
    pickVisibleTracerSlotAtClientPoint
  TracerScene.pickVisibleTracerAtClientPoint(clientX, clientY, rect)
  TracerViewport: client point + rect → screen pick;
    world ray retained for placement only
  former raycast pickVisibleTracerSlotIndex REMOVED
  tests: pickVisibleTracerSlot.test.ts (+ wiring updates)

Slice 2 — identity indication                      COMPLETE
  syncSelectedTracerGlyph yellow override REMOVED
  SELECTED_TRACER_GLYPH_COLOR retired from product path
  src/rendering/selectionHaloMarker.ts
    SELECTION_HALO_COLOR = 0xffcc66
    SELECTION_HALO_RADIUS_SCALE = 1.6
    createSelectionHaloMarker / syncSelectionHaloMarker
  TracerScene: one selectionHalo mesh
    syncSelectedSlot + syncFromParticles → observeSelectionHalo
    visibility follows selected glyph mesh.visible
    not in pick slot list; raycast no-op
  distinct from exploreReleasePreview (white, pending seed)
  tests: selectionHaloMarker.test.ts (+ observe-slot updates)

Out of scope for both slices
  Reset View, Align with motion, remove-last, domain,
  overlay, Guided mounts, scientific recolor, comet work
```

Why two slices: acquisition and indication are separable
test surfaces and match existing helper boundaries. They
remain one product review concept.

---

## 20. Non-goals

```text
Reset View / Center View
Remove last / release management
far-field / AtmosphericTracerDomain X/Z bounds
diagnostic overlay / slice
Ω=0 exhibit
Align with motion
Follow camera semantic changes
Guided Point diagnostics mount
Guided Follow control
new scientific tracer color encoding
pathline redesign / selected-trail emphasis (later `19`)
comet / V_total perception revisit (`24`)
new physics / T1 / Candidate A / V_total changes
dataset mode
generic interaction framework / SelectionManager
picking sensitivity UI
halo toggle UI
visible glyph radius retune as the primary fix
auto-Follow on select
recreating TracerScene on select
```

---

## 21. Implementation status

```text
Slice 1 screen-space acquisition: COMPLETE
Slice 2 preserve-color + halo:    COMPLETE

PICK_TOLERANCE_PX = 16
SELECTION_HALO_COLOR = 0xffcc66
SELECTION_HALO_RADIUS_SCALE = 1.6
  (240 m when glyph radius is 150 m)
```

Explore selected-tracer acquisition and identity indication
v1 is implemented for both slices.

---

## 22. Anti-claims

```text
this file records Slice 1 and Slice 2 as COMPLETE
screen-space pick is not a world-radius enlarge
halo is not the pick target by default
yellow override is retired from product selection visuals
TRACER_COLORS are not V_i / diagnostic colors
preview white wireframe ≠ selection halo
there was no “yellow tracer inside preview” fact
Follow camera contract is not reopened
inactive hidden Explore glyph does not earn a floating halo
this file is not Reset View
this file is not ROADMAP.md
this file does not rewrite 19/34/35 rankings beyond successor
```

---

## 23. Documentation / authority

```text
this file:     selection acquisition + identity indication
35:            chose this direction after Follow playtest
34:            Follow framing — not replaced
19:            selection owner / stationary click / highlight
               observation — highlight *channel* upgraded here
18:            preview ≠ glyph; append-only Explore
rendering 11:  sphereRadiusM unchanged as primary fix
rendering 01:  observe-only; no WebGL screenshot harness
rendering 14:  trail = glyph occupancy color — preserved
24:            V_total polish still deferred
```

Successor of `35`: this file.
Closed physics docs are not rewritten.

---

## 24. Compact lock-in

```text
1  Color semantics
     TRACER_COLORS = occupancy/path cosmetic
     not scientific; still useful identity
     selection must not destroy base color

2  Acquisition
     screen-space tolerance around projected center
     after stationary-click gate
     not fixed world hit sphere as primary

3  Cluster tie-break
     min d_px → front-most → lower slot index

4  Identity indication
     one wireframe/halo shell
     preserves glyph + pathline colors

5  Preview vs halo
     same family; not exact reuse; distinguishable

6  Independence
     glyph radius ≠ halo radius ≠ pick tolerance (px)

7  Follow A→B
     camera per 34; color preserved; halo moves now

8  Inactive
     data selection unchanged
     halo follows glyph visibility

9  Ownership
     TracerSelection owns id
     TracerScene observes pick + one halo

10 UI
     no new controls

11 Slices
     1 picking COMPLETE (PICK_TOLERANCE_PX = 16)
     2 preserve-color + halo COMPLETE
       (SELECTION_HALO_COLOR 0xffcc66, radius ×1.6)

12 Non-goals
     Reset View, domain, overlay, Align, physics, …
```
