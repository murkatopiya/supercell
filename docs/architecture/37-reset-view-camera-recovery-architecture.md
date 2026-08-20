# Reset View / Camera Recovery Architecture

**Status:** ARCHITECTURE / PRODUCT SoT /
SLICE 1 COMPLETE /
SLICE 2 NOT STARTED /
TracerScene.resetView IMPLEMENTED /
Explore Reset View control NOT IMPLEMENTED
**Scope:** interaction/camera contract for explicit
Reset View — recovery to the canonical storm framing after
Follow or free orbit leaves an orphaned orbit center.
Not simulation Reset. Not Clear. Not Align with motion.
Not auto-recenter. Not a camera engine. Not `ROADMAP.md`.
**Physics:** T1 and Candidate A remain CLOSED. Model class
remains prescribed kinematic laboratory (`30`). This file
does not reopen `22`, `23`, `26`, `28`, `30`–`35`, or the
selection contracts in `36`.
**Implementation:** Slice 1 COMPLETE
(`src/rendering/applyDeepStormTracerViewPose.ts`,
`TracerScene.resetView()`).
Slice 2 (Explore Reset View button + App Follow OFF wiring)
is NOT STARTED.

Predecessor selection acquisition / identity architecture:

```text
docs/architecture/36-explore-selection-acquisition-identity-architecture.md
```

Product-direction warrant (earned need, not this SoT’s
ranking rewrite):

```text
docs/architecture/35-post-follow-live-playtest-product-direction-checkpoint.md
  E2 — camera recovery / orphaned orbit center
  Reset / Center View earned; auto OFF/Clear recenter rejected
```

Follow camera contract (still binding; not rewritten):

```text
docs/architecture/34-selected-tracer-follow-camera-architecture.md
  Stop Following ≠ Reset Camera
  simulation Reset / Clear leave camera pose unchanged
  Reset View out of scope for that SoT
```

Accepted selection Slice 2 commit this contract assumes:

```text
120f34e9791e57302ff98edb8dbfbe73c7233561
```

Related contracts (not replaced):

```text
docs/rendering/02-tracer-runtime-controls.md
docs/rendering/11-deep-storm-tracer-view.md
docs/architecture/16-explore-guided-interaction-architecture.md
docs/architecture/19-shared-tracer-inspector.md
```

Keep these roles distinct:

```text
CURRENT FACT
STILL-BINDING CONTRACT
NEW PROJECT DECISION
REJECTED ALTERNATIVE
ANTI-CLAIM
```

---

## 1. Why Reset View exists

Live Explore can leave the user spatially orphaned:

```text
Follow ON → tracer flies far from the storm
Follow OFF or Clear → OrbitControls.target stays at the
  last followed / last panned location
storm may sit on the horizon; orbit still revolves around
  empty far field
```

Playtest (`35` E2) and Follow contract (`34`):

```text
Do NOT automatically recenter on Follow OFF or Clear.
Provide an explicit user-controlled return to the
canonical scene / storm view.
```

Simulation Reset and Clear already turn Follow OFF and
**must not** move the camera (`34`, rendering `02` / `11`).
Mode / Guided experiment switch already remounts
`TracerScene` and reapplies the rest pose — that is lab
replacement, not an Explore recovery verb.

Reset View is the missing **camera recovery** action.

---

## 2. Live camera facts

**Kind:** CURRENT FACT, verified against live `src/**`.

### 2.1 Canonical rest pose

Only rest / default pose fixture:

```text
DEEP_STORM_TRACER_VIEW
  (src/rendering/deepStormTracerView.ts)

cameraPosition  (12000, 6000, 12000) m
target          (0, 4000, 0) m
fovDeg          50
nearM           10
farM            50000
```

Applied today only in the `TracerScene` constructor
(initial mount and remount when `simulation` /
`pathHistory` / `keepInactiveGlyphs` /
`visualAirflowPopulation` identity changes).

### 2.2 What does **not** restore the rest pose

| Event | Camera |
| --- | --- |
| Manual Follow OFF | stays |
| Simulation Reset (`handleReset`) | stays; Follow OFF |
| Explore Clear | stays; Follow OFF; selection cleared |
| Glyph select | unchanged (no auto-Follow) |
| Pause / timeScale | unchanged |

### 2.3 What already restores the rest pose

| Event | Mechanism |
| --- | --- |
| Explore ↔ Guided | new `Simulation` → `TracerViewport` remounts `TracerScene` |
| Guided experiment switch | same remount |

That remount is **not** product Reset View. It clears
selection and lab ownership.

### 2.4 Follow vs scene ownership

```text
App                followEnabled: boolean
TracerViewport     after glyph sync: setFollowPoint / clearFollowPoint
TracerScene        stores followPoint; translates before controls.update()
                   does not own followEnabled
                   no resetView API today
```

While `followEnabled === true`, each rAF may call
`setFollowPoint(P)` and move `controls.target` to the
selected particle. Any pose restore that leaves Follow ON
is overwritten on the next frame.

### 2.5 Toolbar grammar (Explore)

```text
Pause / Resume, Reset, speed     TracerRuntimeControls
Follow                           ExploreFollowControl
placement Confirm / Cancel / Clear
visual airflow workbench controls
```

Simulation **Reset** is already labeled `Reset`. Camera
recovery must use a **different** label so the two verbs
are not confused.

---

## 3. Exact Reset View meaning

**NEW PROJECT DECISION:**

```text
Reset View
=
explicit user action that restores
camera.position and OrbitControls.target
to DEEP_STORM_TRACER_VIEW
and restores unlabeled OrbitControls.enablePan
without changing laboratory occupancy, clock,
selection identity, diagnostics, or physics
```

This is **full rest-pose restore** (camera + target), not
“recenter target only while keeping a far camera.”

| Option | Meaning | Verdict |
| --- | --- | --- |
| **A. Full `DEEP_STORM_TRACER_VIEW` pose** | Camera + target = fixture | **Accepted** — one canonical home (`34` / rendering `11`) |
| B. Recenter target to storm axis; keep current camera offset | Softer; may leave a far distant camera | Rejected for v1 — does not fix “storm on the horizon” |
| C. Auto on Follow OFF | Silent jump | **Rejected** (`35` preference; `34` Stop Following ≠ Reset Camera) |
| D. Auto on Clear | Silent jump | **Rejected** (Clear is occupancy, not camera) |
| E. Bundle into simulation Reset | Reset moves camera | **Rejected** (`34`, rendering `02`) |

Naming (product copy):

```text
label:       Reset View
accessible:  aria-label="Reset camera to storm view"
```

`Center View` / `Recenter` are ambiguous with Follow OFF.
Do not use them as the primary label.

---

## 4. What Reset View must not change

**NEW PROJECT DECISION:**

```text
must not change
  Simulation particles / seeds
  Simulation.clock
  paused / timeScale
  TracerSelection.selectedId
  Inspector / Point diagnostics owners or values
    (except that live resampling continues at the same P,t
     if selection remains)
  selection halo identity (still follows selected glyph)
  V_total / operands / T1 / Candidate A
  DEEP_STORM_TRACER_VIEW numbers themselves
  placement pending seed (unless a later UI policy says so;
     v1: leave pending alone)
```

Reset View is **not**:

```text
simulation Reset
Clear
Stop Following alone
Align with motion
cinematic Journey
CONCEPT first-person ride
```

---

## 5. Follow interaction

**NEW PROJECT DECISION:**

```text
If followEnabled === true when Reset View is invoked:
  1. followEnabled ← false
  2. clear scene follow point (enablePan restored)
  3. apply DEEP_STORM_TRACER_VIEW camera + target
```

Why Follow must turn OFF:

```text
While Follow is ON, TracerViewport rAF re-applies
setFollowPoint(selected P). Restoring the storm pose
with Follow still ON would be undone on the next frame
(or fight every frame). Turning Follow OFF first makes
Reset View stick.
```

| Follow option | Verdict |
| --- | --- |
| **A. Reset View turns Follow OFF, then restores pose** | **Accepted** |
| B. Reset View keeps Follow ON and only snaps once | Rejected — next rAF retargets to tracer |
| C. Reset View forbidden while Follow ON | Rejected — worse UX; recovery is most needed after Follow |

Manual Stop Following alone still **does not** restore the
rest pose (`34` unchanged).

After Reset View, the user may re-enable Follow; enable then
retargets to the current selected `P` with the **new**
rest-pose-derived offset (same enable semantics as today).

---

## 6. Selection interaction

**NEW PROJECT DECISION:**

```text
Reset View does not clear selection.
selectedId is preserved when it still resolves.
Inspector / Point diagnostics / selection halo continue
for that marker.
```

Camera recovery ≠ deselect. The user returns to storm
framing while keeping the probe they were investigating
(now possibly a small far glyph until they Follow again).

| Selection option | Verdict |
| --- | --- |
| **A. Preserve selectedId** | **Accepted** |
| B. Clear selection | Rejected — conflates camera with selection lifecycle |
| C. Clear only if marker is far | Rejected — invents distance policy |

Missing-id behavior stays existing Follow/Inspector rules;
Reset View does not invent a new missing-id path.

---

## 7. State ownership and API shape

### 7.1 No CameraState framework

**NEW PROJECT DECISION:**

```text
Do not introduce CameraState, a camera controller class,
or a mode framework for this action.
```

Live ownership already separates App session flags from
`TracerScene` geometry helpers (Follow pattern).

### 7.2 Narrow scene API

**NEW PROJECT DECISION:**

```text
TracerScene.resetView(): void
  copies DEEP_STORM_TRACER_VIEW.cameraPosition → camera.position
  copies DEEP_STORM_TRACER_VIEW.target → controls.target
  clears stored followPoint if any; enablePan ← true
  calls controls.update() as needed for OrbitControls consistency
  does not recreate the scene
  does not change FOV / near / far / aspect (already set;
    aspect remains the live setSize result)
```

App / viewport glue (implementation sketch, not production):

```text
user clicks Reset View
App: setFollowEnabled(false)     // before next rAF follow sync
     request scene resetView
       via viewport imperative handle
       or a viewResetEpoch observe pattern (like resetEpoch)
TracerScene.resetView()
```

`TracerScene` must **not** own product `followEnabled`.
App turns Follow OFF; scene clears its follow point as part
of pose restore (same pan restore as `clearFollowPoint`).

Rejected: recreating `TracerScene` solely to reset the view
(would reset OrbitControls but also drop unrelated scene
state and is heavier than needed).

---

## 8. UI placement and lab scope

Live grammar: session verb buttons in
`tracer-runtime-controls__button` class.

**NEW PROJECT DECISION:**

```text
control:     button “Reset View”
class:       tracer-runtime-controls__button
placement:   Explore laboratory-toolbar
             sibling near Follow / runtime controls
             not inside Inspector
             not inside Point diagnostics
             not inside VisualAirflowWorkbenchControls
enabled:     always (no selection required)
aria-label:  "Reset camera to storm view"
```

### 8.1 Explore vs Guided

| Option | Verdict |
| --- | --- |
| A. Explore-only behavior | Rejected as a *behavior* split — rest pose is shared |
| B. Shared UI immediately in both labs | Possible; Guided already remounts on experiment switch |
| **C. Shared scene API; v1 control Explore-only** | **Accepted** |

Explore is where Follow creates orphaned targets (`35` E2).
Guided Follow control is still not mounted (`34`). Guided
experiment switch already remounts to rest pose. A later
Guided Reset View button can reuse `TracerScene.resetView()`
without a new camera meaning.

Toolbar density (`35`): one earned recovery control is
justified; do not add Align / recenter variants in the same
pass.

---

## 9. Lifecycle table

| Event | Follow | Selection | Camera |
| --- | --- | --- | --- |
| Reset View (Follow OFF) | stays OFF | unchanged | → `DEEP_STORM_TRACER_VIEW` |
| Reset View (Follow ON) | ON → OFF | unchanged | → `DEEP_STORM_TRACER_VIEW`; pan restored |
| Manual Follow OFF | ON → OFF | unchanged | **stays** (not Reset View) |
| Simulation Reset | ON → OFF | kept if id exists | **stays** |
| Clear | ON → OFF | cleared | **stays** |
| Explore ↔ Guided / Guided experiment switch | OFF | cleared | rest pose via remount |
| Glyph select | unchanged | new id | unchanged |
| Reset View twice from rest | OFF | unchanged | idempotent rest pose |

---

## 10. Options / cost (compact)

| Concern | Chosen |
| --- | --- |
| Pose source | Only `DEEP_STORM_TRACER_VIEW` |
| Auto recovery | Rejected on Follow OFF / Clear / sim Reset |
| Follow conflict | Turn Follow OFF, then restore |
| Selection | Preserve |
| API | `TracerScene.resetView()` + App Follow OFF |
| Framework | None |
| v1 UI | Explore toolbar button |
| Guided UI | Shared API; control not required for v1 |

---

## 11. Future test contract

Implementation tests (when authorized) must cover at least:

```text
displaced camera + target → Reset View restores
  DEEP_STORM_TRACER_VIEW.cameraPosition and .target
displaced Follow target (Follow was ON, now OFF)
  → Reset View restores rest pose
Follow ON + Reset View
  → followEnabled false
  → rest pose sticks across subsequent rAF (no retarget)
selection preserved across Reset View
  (selectedId unchanged when still resolvable)
particles / clock / diagnostics values unchanged
  (same P,t sampling if selection kept)
enablePan true after Reset View
repeated Reset View from rest pose is idempotent
simulation Reset still does not move camera
Clear still does not move camera
manual Follow OFF still does not move camera
Explore control present; Guided control not required for v1
Reset View label ≠ simulation Reset
halo / pick / TRACER_COLORS contracts unchanged
no physics / Simulation imports in the camera helper path
```

Prefer pure helpers if pose copy is extracted; otherwise
headless scene-stand-in tests in the style of
`TracerScene.followPoint.test.ts`. No WebGL screenshot
harness (`01`).

---

## 12. Future implementation slices

Derived from live ownership. Out of scope for this SoT’s
landing as production code.

```text
Slice 1 — TracerScene.resetView geometry             COMPLETE
  src/rendering/applyDeepStormTracerViewPose.ts
  TracerScene.resetView():
    followPoint ← null
    enablePan ← true
    apply DEEP_STORM_TRACER_VIEW camera + target
    controls.update()
  tests: TracerScene.resetView.test.ts
  no App button

Slice 2 — Explore control + App lifecycle            NOT STARTED
  Reset View button in Explore laboratory-toolbar
  App: Follow OFF then invoke resetView
    (epoch or imperative viewport handle)
  wiring tests from §11
  Guided control not mounted

Out of scope
  Guided Reset View button (optional later on same API)
  Align with motion
  auto-center policies
  CameraState framework
```

---

## 13. Non-goals

```text
Align with motion
automatic recenter on Follow OFF / Clear / simulation Reset
far-field / AtmosphericTracerDomain X/Z policy
tracer table / names
remove-last
diagnostic overlay / slice
selection halo polish
Guided Point diagnostics
Guided Follow control
new physics / T1 / Candidate A / V_total
thermodynamics
dataset mode
generic CameraState / camera controller
recreating TracerScene solely to reset the view
bundling Reset View into simulation Reset
changing DEEP_STORM_TRACER_VIEW fixture numbers
```

---

## 14. Unresolved questions

Not a backlog commitment.

```text
U1  Exact App↔Viewport glue (viewResetEpoch vs imperative
    ref) — implementation choice; both must satisfy
    Follow-OFF-before-restore
U2  Whether Guided later mounts the same button — optional;
    API is shared
U3  Whether pending Explore placement preview should cancel
    on Reset View — leave pending alone in v1 unless playtest
    says otherwise
```

---

## 15. Implementation status

```text
Slice 1 TracerScene.resetView:     COMPLETE
Slice 2 Explore control + App:     NOT STARTED

Canonical pose source: DEEP_STORM_TRACER_VIEW
Helper: applyDeepStormTracerViewPose(cameraPosition, target)
```

This architecture SoT does not authorize Slice 2.

---

## 16. Anti-claims

```text
this file records Slice 1 COMPLETE; Slice 2 NOT STARTED
Reset View is not simulation Reset
Reset View is not Clear
Stop Following is not Reset View
simulation Reset still must not move the camera
Clear still must not move the camera
auto-recenter on Follow OFF / Clear is rejected
Reset View turns Follow OFF when it was ON (Slice 2 App wiring)
Reset View does not clear selection
Reset View is not Align with motion
this file is not a CameraState framework
this file is not ROADMAP.md
DEEP_STORM_TRACER_VIEW numbers are not rewritten here
Follow-as-framing (`34`) is not reopened
selection identity (`36`) is not reopened
```

---

## 17. Documentation / authority

```text
this file:     Reset View / camera recovery contract
36:            selection acquisition + identity — COMPLETE;
               Reset View was non-goal there
35:            earned Reset View after Follow playtest E2
34:            Follow framing; Stop Following ≠ Reset Camera
rendering 11:  DEEP_STORM_TRACER_VIEW fixture — pose source
rendering 02:  simulation Reset does not reset camera
```

Successor of `36`: this file.
Closed physics docs are not rewritten.

---

## 18. Compact lock-in

```text
1  Meaning
     explicit restore of DEEP_STORM_TRACER_VIEW
     camera.position + OrbitControls.target

2  Not automatic
     Follow OFF / Clear / sim Reset leave pose

3  Follow
     Reset View → Follow OFF, then restore pose

4  Selection
     preserved (camera ≠ deselect)

5  Laboratory
     particles / clock / diagnostics / physics unchanged

6  API
     TracerScene.resetView(); App owns Follow OFF
     no CameraState

7  UI v1
     Explore “Reset View” button
     aria-label="Reset camera to storm view"
     Guided control not required for v1

8  Pose source
     only DEEP_STORM_TRACER_VIEW

9  Slices
     1 scene geometry COMPLETE (TracerScene.resetView)
     2 Explore UI + App wiring NOT STARTED

10 Non-goals
     Align, auto-center, domain, overlay, physics, …
```
