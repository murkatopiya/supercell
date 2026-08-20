# Selected-Tracer Follow Camera Architecture

**Status:** ARCHITECTURE / PRODUCT SoT /
SLICE 1 COMPLETE /
SLICE 2 COMPLETE /
Explore selected-tracer Follow v1 IMPLEMENTED /
Guided Follow control NOT IMPLEMENTED /
Reset View NOT IMPLEMENTED
**Scope:** interaction/camera contract for selected-tracer
Follow-as-framing. Locks meaning, state ownership, target
identity, initiation, OrbitControls geometry, manual input,
cadence, and lifecycle. Not a camera engine. Not product
pan/reset-view. Not cinematic Journey. Not Inspector L2.
Not Guided diagnostic mount. Not `ROADMAP.md`.
**Physics:** T1 and Candidate A remain CLOSED. Model class
remains prescribed kinematic laboratory (`30`). This file
does not reopen `22`, `23`, `26`, `28`, `30`, `31`, `32`,
or the ranking in `33`.
**Implementation:** Slice 1 COMPLETE
(`src/rendering/translateCameraFollowTarget.ts`,
`TracerScene.setFollowPoint` / `clearFollowPoint`).
Slice 2 COMPLETE. App owns `followEnabled` (default false).
Explore mounts `ExploreFollowControl`. `TracerViewport`
applies live selected `P` after glyph sync via
`viewportFollowSync`. Guided Follow control is NOT
IMPLEMENTED. Reset View is NOT IMPLEMENTED.

Predecessor product-direction checkpoint:

```text
docs/architecture/33-post-point-diagnostics-product-direction-checkpoint.md
```

Accepted checkpoint commit this contract is written against:

```text
2efde232b8ca35ee8c2336bb81b81c9bbdf250a1
```

`33` selected:

```text
selected-tracer Follow-as-framing
```

This file is the camera/interaction SoT that checkpoint
required. Slice 1 is headless follow-point geometry on
`TracerScene`. Slice 2 is Explore Follow control and App
lifecycle. Overlay, Guided diagnostic mount, product
pan/reset-view, and new physics remain outside this SoT.

Related contracts (not replaced):

```text
docs/CONCEPT.md §7–§8
docs/ARCHITECTURE.md §2, §24
docs/architecture/16-explore-guided-interaction-architecture.md
docs/architecture/19-shared-tracer-inspector.md
docs/architecture/21-whole-product-direction-checkpoint.md
docs/architecture/24-perceptual-exploration-checkpoint.md
docs/architecture/32-diagnostic-observation-ui-architecture.md
docs/rendering/01-tracer-scene.md
docs/rendering/02-tracer-runtime-controls.md
docs/rendering/11-deep-storm-tracer-view.md
```

Keep these roles distinct:

```text
CURRENT FACT
STILL-BINDING CONTRACT
NEW PROJECT DECISION
ANTI-CLAIM
```

---

## 1. Why Follow exists

The selected tracer is now simultaneously:

```text
visual parcel
+ Inspector target
+ moving point-diagnostic probe
```

Canonical observation remains (`32`):

```text
P = selectedParticle.position
t = simulation.clock.time
```

The live camera still orbits the storm-center rest target
`(0, 4000, 0)` m from `DEEP_STORM_TRACER_VIEW`. A pathline
can leave that frame while Inspector and Point diagnostics
continue live resampling.

Follow is a **framing / navigation capability**. It keeps
the already-chosen observation marker visually framed. It
is not a new physics capability, not a diagnostic encoding,
and not CONCEPT §7 first-person travel-with-the-air.

`ARCHITECTURE.md` §24 remains binding:

```text
In Follow mode, the camera observes a tracer.
It does not control or pull the tracer.
```

---

## 2. Live camera and selection facts

**Kind:** CURRENT FACT, verified against live `src/**`.

### 2.1 Camera ownership

There is no `CameraState`. Product Follow state is App-owned:

```text
App followEnabled: boolean                 default false
App followEnabledRef                       live rAF source
ExploreFollowControl                       Explore toolbar only
TracerViewport followEnabledRef            per-frame glue
viewportFollowSync                         selectedId → live P
TracerScene.setFollowPoint / clearFollowPoint
```

Slice 1 rendering API:

```text
src/rendering/translateCameraFollowTarget.ts
  translateCameraFollowTarget(cameraPosition, currentTarget, nextTarget)
  copyFollowPoint(position)

TracerScene.setFollowPoint(position: Vec3)
TracerScene.clearFollowPoint()
private followPoint: { x, y, z } | null
render() → stored follow translation, then controls.update(),
           then renderer.render()
```

`TracerViewport` does not own `selectedId`. After
`syncFromParticles` it maps the already-owned
`selectedTracerId` to the current `particle.position`
object and copies those coordinates into `TracerScene`.

Live rest fixture (`src/rendering/deepStormTracerView.ts`):

```text
fovDeg              50
nearM               10
farM                50000
cameraPosition      (12000, 6000, 12000) m
target              (0, 4000, 0) m
```

`OrbitControls` construction (`TracerScene`):

```text
target              DEEP_STORM_TRACER_VIEW.target
enableDamping       false
enablePan           Three.js default true (unlabeled)
min/max distance    Three.js defaults (none)
polar clamp         Three.js defaults (none)
```

Unlabeled OrbitControls already provide:

```text
left-drag     orbit (rotate around controls.target)
wheel/dolly   zoom (change radius to target)
right-drag    pan (translate target and camera)
```

Pan is not a designed product control (`21`, `33`). This
SoT does not promote it into one.

`camera.up` is Three.js default `(0, 1, 0)`. World axes
remain `+X` East, `+Y` Up, `+Z` South.

### 2.2 When the rest pose is applied

`DEEP_STORM_TRACER_VIEW` is applied in the `TracerScene`
constructor. `TracerViewport` remounts `TracerScene` when
`simulation` identity, `pathHistory`, `keepInactiveGlyphs`,
or `visualAirflowPopulation` change.

```text
initial Guided mount                 rest pose
Explore ↔ Guided                     remount → rest pose
Guided experiment switch             remount → rest pose
simulation Reset                     same Simulation; camera unchanged
Explore Clear                        same Simulation; camera unchanged
glyph select                         camera unchanged
Pause / Resume / timeScale           camera unchanged
```

Rendering `11` / runtime `02`: simulation Reset does **not**
move the camera. That contract stays.

### 2.3 Render / simulation cadence

`TracerViewport` rAF loop:

```text
consumeFixedTimesteps
  maybe Simulation.step (paused → 0 elapsed)
  if consumed.steps > 0 → onSimulationAdvanced
    App refreshInspection
      inspectSelectedTracer
      inspectSelectedPointDiagnostics (Explore only)
syncFromParticles          last completed fixed-step P
syncSelectedSlot
scene.render()             every animation frame
```

Glyphs are **not** interpolated (`01`). Pause still renders
every frame so OrbitControls keep working (`02`).

### 2.4 Selection ownership

```text
TracerSelection            App-owned; selectedId: number | null
App React mirror           selectedTracerId
TracerScene                observes occupancy slot highlight only
                           no product selectedId
```

Lifecycle already locked (`19`, live `App.tsx`):

| Event | Selection |
| --- | --- |
| Glyph pick | `selection.select(tracerId)` |
| Inactive particle still present | remains selected and inspectable |
| Explore / Guided Reset | preserve `selectedId` if the id still exists |
| Explore Clear | `clearSelectionAndInspection()` |
| Explore ↔ Guided | clear; new `Simulation` |
| Guided experiment switch | `selection.clear()`; new lab |
| Missing id | `resolveSelectedTracer` does not mutate selection; Inspector / diagnostics become `undefined` |

`19`: auto-Follow on select is **not desirable**. Recreating
the scene on select remains **forbidden**.

Explore `keepInactiveGlyphs === false`: an inactive selected
glyph is hidden and not newly pickable, but the particle
remains the Inspector / diagnostic marker. Guided D1 keeps
the exit glyph visible.

Scientific glyphs are pickable. Visual airflow occupants
have `raycast = () => {}` and are not pickable. The pending
release preview is not a tracer and not a selection target.

---

## 3. Exact Follow meaning

**NEW PROJECT DECISION:**

```text
selected-tracer Follow-as-framing
=
OrbitControls.target tracks the current selected
particle.position
while the camera keeps the user's current
world-space camera-to-target offset
```

The selected tracer becomes the **moving orbit center**.
The user keeps the current viewpoint relative to that
center: same distance, same azimuth, same elevation,
same world-up.

This is **not**:

```text
first-person ride along the path
look-at-only with a stationary camera
snap to a predefined tracer-relative pose
automatic camera on glyph select
CONCEPT §7 Lagrangian journey mode
ARCHITECTURE §24 camera Journey (scripted pose)
```

CONCEPT §7 “travel with the air” remains a later, stronger
Lagrangian mode. This SoT does not implement it.

### 3.1 Camera-semantic options

| Option | Geometry | Continuity | Orientation | Motion sickness | OrbitControls fit | Manual orbit | Complexity | Reset |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **A. Moving target + preserved world-space offset** | Each update: `delta = P − target`; translate `camera.position` and `controls.target` by `delta` | High: glyphs and camera share the same discrete `P` | High: world axes and current orbit angles stay | Low if `P` only jumps one completed `dt` | Native: orbit/zoom remain around `controls.target` | Natural: new orbit becomes the next offset | Low: one translation helper | Independent of pose restore |
| B. Moving target + preserved spherical `(r, θ, φ)` | Reconstruct camera from current spherical about the new target | Same as A **if** spherical is re-read every frame from the current camera, not latched at enable | Same as A in that case | Same as A | Same as A | Same as A | Medium: depends on OrbitControls internals (`spherical`, y-up quat) | Same as A |
| C. Continuously look-at tracer, camera world position fixed | `controls.target ← P` only | Poor: glyph shrinks with range; can leave useful framing | Storm-relative orientation stays; tracer-relative framing dies | Low jump, high tracking strain | Orbit then fights a moving look-at | Confusing: orbit about a point the camera is not keeping offset to | Low | Camera already “stayed” |
| D. Snap to a predefined tracer-relative pose | Replace camera + target with a canned offset | Worst: jumps on enable and on A→B | Destroys the user’s current investigation pose | High | Fights OrbitControls | Manual orbit is overwritten unless constantly re-snapped | Medium | Needs a second rest pose |

A and B are **geometrically equivalent** when B re-reads the
current camera-to-target relation every frame. They are
**not** equivalent if B latches spherical coordinates at
Follow enable and ignores later orbit/zoom.

**Accepted: A.** Specify the contract in world offset, not
OrbitControls spherical fields. Implementation may realize
A by translating both `camera.position` and
`controls.target` by the same world `delta`. That also
preserves the current spherical relation.

Rejected B-as-latched-at-enable: would ignore later orbit.
Rejected C: `33` already noted the glyph can become an
unreadable speck. Rejected D: selection/Follow must not
steal orientation or zoom.

---

## 4. Follow is not auto-select camera

**STILL-BINDING (`19`):**

```text
selection ≠ automatic camera takeover
```

Glyph selection itself MUST NOT:

- enable Follow;
- translate or rotate the camera;
- change zoom;
- change orbit orientation;
- recreate `TracerScene`.

The user selects a tracer and enables Follow as **separate**
explicit actions. Follow is cancellable. Default is OFF.

---

## 5. State owner

Options:

| Owner | UI knows Follow | Scene can move target | Lifecycle | Selection identity | Verdict |
| --- | --- | --- | --- | --- | --- |
| **A. `App`** | React boolean, like `paused` / `placementEnabled` | Viewport passes current `P` into `TracerScene` | Reset / Clear / mode already live in `App` | `TracerSelection` stays the only identity | **Accepted** |
| B. `TracerScene` | Needs a callback/mirror | Direct, but product state hides in rendering | App already owns Reset/Clear/mode; scene would duplicate | Risk of a second selected-id | Rejected |
| C. New camera controller | Possible | Possible | New architecture | Overkill | Rejected |

**NEW PROJECT DECISION:**

```text
App owns followEnabled: boolean   (default false)
TracerSelection owns tracer identity
TracerScene applies orbit-target translation
TracerViewport is per-frame glue after glyph sync
Follow state does not live on TracerParticle
```

No `CameraState`. No Follow class unless a later slice
discovers a real invariant a boolean cannot hold. v1 does
not need one.

`followEnabled` is session interaction state. It is not
diagnostic state, not simulation state, and not a tracer
field.

When `followEnabled === true`, the scene receives the
**current resolved world point** `P`, not a copied tracer
id. The scene does not resolve `selectedId`.

---

## 6. Canonical target identity

**NEW PROJECT DECISION:**

```text
Follow target = current selected tracer
              = resolveSelectedTracer(particles, TracerSelection)
              = that particle.position
```

Do not store a second Follow-owned tracer id.

If `followEnabled === true` and `selectedId` changes
from tracer A to tracer B:

```text
Follow stays ON
orbit center retargets to B.position
camera translates by (B.position − current controls.target)
offset / zoom / orbit angles preserved
```

| A→B option | Meaning | Verdict |
| --- | --- | --- |
| **A. Follow accompanies the new selection** | Follow means “frame the selected tracer” | **Accepted** |
| B. Follow turns off | Extra click; hides that Follow is selection-relative | Rejected for v1 |
| C. Keep following A | Second hidden identity | **Rejected** |

Retarget A→B is a discrete translation, the same class of
jump as enabling Follow. It is not an orientation/zoom
snap. If the user does not want the camera to move to B,
they turn Follow off first, then select B (`19` already
guarantees select-without-Follow does not move the camera).

Visual airflow occupants, Eulerian marks, and the pending
release preview are never Follow targets.

---

## 7. Enable / disable UI

Do not invent a new toolbar or design system. Live grammar:

```text
session verbs          Pause / Resume, Reset, Clear, Confirm, Cancel
pressed-mode buttons   Guided, Explore, Points, Comets, … (aria-pressed)
arming checkboxes      Enable placement, Depth cue
```

Follow is a persistent ON/OFF investigation mode, not a
placement-arming tool.

**NEW PROJECT DECISION:**

```text
control:     toggle button in the existing laboratory-toolbar
visible:     Explore only in v1
label:       Follow
accessible:  aria-label="Follow selected tracer"
active:      aria-pressed={followEnabled}
disabled:    when no resolvable selected tracer
class:       tracer-runtime-controls__button
placement:   sibling of TracerRuntimeControls
             not inside Inspector
             not inside Point diagnostics
             not inside VisualAirflowWorkbenchControls
             not inside ExplorePointReleaseControls
```

| Condition | Control |
| --- | --- |
| No selection, or `selectedId` does not resolve | visible, **disabled**, `aria-pressed=false`, Follow cannot be ON |
| Resolvable selection, Follow OFF | enabled, `aria-pressed=false` |
| Resolvable selection, Follow ON | enabled, `aria-pressed=true` |

Manual disable: click `Follow` again → `followEnabled = false`.
Camera pose stays where Follow left it. That is **Stop
Following**, not Reset Camera.

---

## 8. Camera motion contract

One Follow update, after `syncFromParticles`, using the
same last-completed-step `particle.position` the glyph just
copied.

Let:

```text
P              = selectedParticle.position     // world meters
T              = controls.target               // world meters
C              = camera.position               // world meters
offset         = C − T
```

### 8.1 Enable Follow (once, on user action)

Precondition: resolvable selected tracer. Current pose is
whatever OrbitControls last had (often rest pose, often
not).

```text
delta          = P − T
C              ← C + delta
T              ← P
enablePan      ← false
```

Immediately after enable:

```text
controls.target     = P
camera.position     = P + previous_offset
distance to target  unchanged
orbit orientation   unchanged
FOV / zoom          unchanged
```

There is **no** interpolation, **no** rest-pose restore,
and **no** predefined tracer-relative snap.

### 8.2 Tracer motion (each render frame while Follow ON)

If the selected particle still resolves:

```text
delta = P − T
if delta ≠ 0:
  C ← C + delta
  T ← P
```

If `P` is unchanged (pause, or no completed step this
frame), `delta = 0` and the camera stays. Manual orbit/zoom
that already happened this frame is then applied by the
existing `controls.update()` in `TracerScene.render()`.

### 8.3 `controls.target` and `controls.update()`

```text
Follow writes controls.target to P (via the translation above)
Follow writes camera.position by the same world delta
Follow does not call controls.update() itself
TracerScene.render() already calls controls.update() then renders
```

Apply the translation **before** that `controls.update()`
so pending orbit/zoom spherical deltas are applied around
the current tracer point.

Do not expose private `camera` / `controls` to React. A
small `TracerScene` method plus a pure translation helper
is enough. The helper is the testable unit.

### 8.4 What Follow must not do

```text
must not sample diagnostics from camera.position
must not sample diagnostics from controls.target
must not write particle.position
must not change Simulation.clock
must not change timestep / accumulator / timeScale / paused
must not recreate TracerScene on enable or select
must not alter DEEP_STORM_TRACER_VIEW numbers
```

---

## 9. Manual camera input while following

### 9.1 Orbit and zoom

Options:

| Option | Laboratory fit | Verdict |
| --- | --- | --- |
| **A. Orbit + zoom allowed; Follow keeps tracking** | User inspects the moving probe from new angles | **Accepted** |
| B. Any manual camera input cancels Follow | Fights investigation; accidental drag drops Follow | Rejected |
| C. Camera locked while Follow ON | Cannot inspect while framing | Rejected |

**NEW PROJECT DECISION:**

```text
manual orbit   allowed; Follow stays ON
manual zoom    allowed; Follow stays ON
new orbit/zoom becomes the next preserved offset
```

Orbit changes azimuth/elevation around `controls.target`.
Zoom changes radius. The next tracer `delta` translates
that new relation with the probe. That is the point of
using OrbitControls around a moving center.

Glyph pick and Explore placement keep the existing
stationary-click gate (`shouldAcceptStationaryClick` /
`resolveTracerPointerUp`). Follow must not disable picking.
Orbit-scale drags still must not select or place.

### 9.2 Pan

Pan in OrbitControls **moves `controls.target`**. While
Follow is ON, target identity is the selected particle.
An unlabeled right-drag would either fight Follow every
frame or silently create a second target offset.

| Pan option | Meaning | Verdict |
| --- | --- | --- |
| **A. Pan disabled only while Follow ON** | Follow owns `controls.target`; unlabeled pan cannot lie | **Accepted** |
| B. Pan cancels Follow | Accidental right-drag drops Follow | Rejected |
| C. Pan creates a persistent tracer-relative lead offset | Extra Follow state; a mini framing-rig | Rejected for v1 |
| D. Pan stays on and is overwritten each frame | Gesture does nothing useful; feels broken | Rejected |

**NEW PROJECT DECISION:**

```text
while followEnabled === true:  controls.enablePan = false
while followEnabled === false: controls.enablePan = true
                               (current unlabeled default)
```

This is a Follow conflict fix, not product pan/reset-view.
When Follow turns OFF, unlabeled pan returns. No Reset View
control is introduced.

---

## 10. Frame cadence

Follow is visual camera motion. It uses the **render loop**,
not the Inspector observation cadence.

**NEW PROJECT DECISION:**

```text
cadence = every requestAnimationFrame tick
          after syncFromParticles
          before TracerScene.render()
          P = last completed fixed-step particle.position
interpolation = none
```

Inspector / Point diagnostics stay on:

```text
select / completed step batch / Reset
```

Follow must not:

- change `simulation.clock`;
- change tracer advection;
- change Inspector cadence;
- change Point diagnostics cadence;
- introduce a camera timestep;
- interpolate between simulation steps.

Paused Follow is valid: `delta = 0`, OrbitControls still
work, the frozen marker stays framed. That matches `02`
(render continues while paused) and `32` (frozen `(P, t)`).

---

## 11. Inactive selected tracer

`19` / `32`: an existing inactive tracer remains an
observation marker. Inspector and Point diagnostics still
sample field-at-marker.

**NEW PROJECT DECISION:**

```text
if selected tracer exists and active === false:
  Follow stays ON if it was ON
  target remains particle.position (frozen)
  camera stays centered on that marker
  Follow does not auto-disable
```

Explore may hide the glyph (`keepInactiveGlyphs === false`).
Follow still frames the frozen `P`. That is the same marker
Inspector is reading. Guided D1 keeps the visible exit
glyph; Follow on that marker is the teaching-adjacent case.

---

## 12. Missing selected tracer

If `selectedId !== null` but `resolveSelectedTracer`
returns `undefined`:

**NEW PROJECT DECISION:**

```text
followEnabled ← false
camera pose stays where it currently is
selection is not mutated by Follow
no exception from the render loop
controls.enablePan restored to true
```

Do not keep Follow ON against a stale hidden target. Do not
invent a particle. Inspector / diagnostics already become
`undefined` without clearing `selectedId` (`19`,
`resolveSelectedTracer`). Follow follows that resolve
failure by turning OFF, and does not take over selection
clearing.

The Follow button becomes disabled if the id still does not
resolve.

This is a defensive edge. Live Clear / mode-switch already
clear selection before occupancy vanishes in the normal
App path.

---

## 13. Reset

Simulation Reset (Explore `resetExploreLab` / Guided
`resetGuidedLab`):

```text
in-place cohort
selectedId preserved if present
P and t restored
Inspector + diagnostics refresh immediately
TracerScene is not recreated
camera currently does not move (`11`, `02`)
```

Options:

| Option | Follow | Camera | Fits live Reset |
| --- | --- | --- | --- |
| A. Follow OFF + restore rest pose | Off | Jumps to `DEEP_STORM_TRACER_VIEW` | **No** — bundles Reset View into simulation Reset |
| **B. Follow OFF + leave current pose** | Off | Unchanged | **Yes** |
| C. Follow stays ON; jump to restored `P` | On | Translates with the teleport | Honest Follow, but Reset would move the camera |

**NEW PROJECT DECISION: B.**

```text
Reset → followEnabled = false
        enablePan restored
        camera position and controls.target unchanged
        selectedId unchanged (existing contract)
        diagnostics resample restored (P, t)
```

Why not C: simulation Reset is a laboratory restore, not a
camera command. Why not A: `33` forbade bundling product
reset-view into Follow; rendering `11` already forbids
Reset-moves-camera.

After Reset the user may re-enable Follow. Enable then
retargets to the restored seed with the **current** offset
(no orientation/zoom jump). That is explicit, not automatic.

---

## 14. Clear

Live Explore Clear (`ExplorePointReleaseOrchestration.clear`
+ `clearSelectionAndInspection()`):

```text
particles gone
selection cleared
inspection / point diagnostics undefined
clock unchanged
TracerScene not recreated
camera unchanged
```

**NEW PROJECT DECISION:**

```text
Clear → followEnabled = false
        enablePan restored
        camera pose unchanged
        no Follow without a target
```

Follow does not invent a new Clear meaning.

Guided has no Clear control. Guided occupancy is not
emptied by Explore Clear.

---

## 15. Mode switch

Live Explore ↔ Guided and Guided experiment replacement
create a new `Simulation`. `TracerViewport` remounts
`TracerScene` → constructor applies `DEEP_STORM_TRACER_VIEW`.
Selection is cleared first.

**NEW PROJECT DECISION:**

```text
Explore → Guided
Guided → Explore
Guided experiment switch
  followEnabled = false
  do not transfer Follow across simulation owners
  camera rest pose returns because TracerScene remounts
    (CURRENT FACT of the live host, not a Follow restore API)
```

v1 may rely on that remount for rest pose. Follow itself
does not implement a rest-pose API. If a later slice stops
remounting `TracerScene` across labs, rest-pose restore on
mode switch would need its own explicit contract. That is
not this SoT.

---

## 16. Explore vs Guided v1

Selection already exists in both labs. Point diagnostics
do not. Task 1 (follow a parcel) exists in Guided.

Options:

| Option | Teaching | Clutter | Architecture | Verdict |
| --- | --- | --- | --- | --- |
| A. Explore-only behavior | Misses Guided pathlines that leave the default frame | Lowest Guided chrome | Duplicated later | Rejected as a *behavior* split |
| B. Shared UI + behavior immediately | Helps Guided Task 1 | Extra control beside teaching copy | One wiring | Rejected for **v1 presentation** |
| **C. Shared architecture; v1 control Explore-only** | Earns Follow where the diagnostic probe lives | Guided catalog flow stays intact | One scene helper; App boolean; Explore mounts the button | **Accepted** |

**NEW PROJECT DECISION:**

```text
camera mechanics     shared (TracerScene / viewport glue)
lifecycle rules      shared (Reset / missing / A→B / inactive)
followEnabled        App-owned in both labs; forced false
                     whenever selection is cleared
v1 control           Explore laboratory-toolbar only
Guided v1            no Follow button
Guided diagnostics   still not mounted; Follow is not a
                     substitute for 32 Slice 3
```

Default OFF in Explore preserves the storm-center first
view. Guided teaching still opens on `DEEP_STORM_TRACER_VIEW`.
A later Guided exposure can reuse this contract without a
new camera meaning.

Follow in Guided would still not mean Point diagnostics
appear.

---

## 17. Rest pose vs Stop Following vs Reset Camera

Canonical rest / default pose is **only**:

```text
DEEP_STORM_TRACER_VIEW
```

Applied at `TracerScene` construction (initial scene, lab
remount). Do not introduce a second almost-identical default.

| Action | Camera |
| --- | --- |
| Stop Following (manual Follow OFF) | **Stay.** Current position + current `controls.target` freeze. |
| Simulation Reset | **Stay.** Follow OFF. |
| Clear | **Stay.** Follow OFF. |
| Mode / experiment switch | Rest pose via live `TracerScene` remount. |
| Reset Camera / Reset View | **Not this SoT.** |

Stop Following and Reset Camera are different actions.
Follow cancellation MUST NOT restore rest pose. Restoring
storm-center on Follow OFF would yank the user away from
the probe they were just investigating.

---

## 18. Product pan / Reset View

`33` ranked product pan/reset-view below Follow and forbade
bundling.

Follow lifecycle is complete without Reset View:

```text
enable Follow     frames the probe without a rest-pose API
stop Follow       keeps the last framed pose
mode switch       live remount already restores rest pose
unlabeled orbit/zoom/pan (pan only when Follow OFF)
                  already exist on OrbitControls
```

**NEW PROJECT DECISION:**

```text
Reset View is out of scope for this SoT
product pan remains unlabeled OrbitControls default
this SoT only disables pan while Follow is ON
```

The leftover pain (return to `DEEP_STORM_TRACER_VIEW`
without switching labs) is real and remains the separate
`21` / `33` A′ candidate.

---

## 19. Visual state

Minimum:

```text
which tracer is selected   existing glyph highlight 0xffcc33
                           Inspector identity row
Follow ON/OFF              Follow button aria-pressed
```

Do **not** add:

```text
new tracer color language
camera-target glyph
cinematic reticle
trail recoloring
Follow-only fog / depth-cue change
```

Depth cue, if enabled, remains the existing camera-distance
salience. Follow may move the camera; it does not change
the depth-cue contract.

---

## 20. Relation to Point diagnostics

Camera and observation are **sibling consumers of
selection**.

Canonical diagnostics remain:

```text
P = selectedParticle.position
t = simulation.clock.time
```

**Forbidden:**

```text
camera.position     → diagnostic sample position
controls.target     → free diagnostic probe
followEnabled       → diagnostic state
Follow ON           → extra diagnostic samples
```

Follow does not change T1 / Candidate A values, units,
anti-claim copy, Explore-only mount, or cadence.

---

## 21. Relation to physics

Follow does not change:

```text
V_total
seven operands
tracer advection
T1
Candidate A
simulation clock
integration
model class
```

No physics source. No `src/physics/**`. No diagnostic
owner changes.

---

## 22. Failure / edge-case table

| Event | Selection | Follow | Camera target / pose |
| --- | --- | --- | --- |
| Enable Follow | unchanged, must resolve | OFF → ON | `target ← P`; camera translates by `P − oldTarget`; zoom/orientation unchanged; pan disabled |
| Tracer moves (completed step) | unchanged | stays ON | target and camera translate by the same world `delta` |
| Manual orbit | unchanged | stays ON | new azimuth/elevation about current `P`; that offset is preserved afterwards |
| Manual zoom | unchanged | stays ON | radius to `P` changes; that radius is preserved afterwards |
| Manual pan | unchanged | stays ON | **no pan** (`enablePan === false`) |
| Tracer inactive | remains selected | stays ON | stays on frozen `particle.position` |
| Selected A → B | B | stays ON | retarget to B with preserved offset (translate by `B − target`) |
| Missing tracer | unchanged (not cleared by Follow) | ON → OFF | pose stays; pan restored |
| Reset | kept if id exists | ON → OFF | pose stays; pan restored |
| Clear | cleared | ON → OFF | pose stays; pan restored |
| Explore → Guided | cleared | ON → OFF | rest pose via `TracerScene` remount |
| Guided → Explore | cleared | ON → OFF | rest pose via `TracerScene` remount |
| Guided experiment switch | cleared | ON → OFF | rest pose via `TracerScene` remount |
| Disable Follow manually | unchanged | ON → OFF | pose stays; pan restored |
| Glyph select while Follow OFF | new id | stays OFF | **unchanged** |
| No selection, Follow click | none | stays OFF | unchanged; control disabled |

---

## 23. Options / cost

Camera meaning (summary of §3.1): **A accepted.** C and D
rejected. B accepted only as an equivalent implementation
of A, not as latched-at-enable spherical.

State owner (§5): **App boolean.** Scene helper. No camera
framework.

Manual input (§9): orbit/zoom allowed; pan disabled while
Follow ON.

Reset (§13): Follow OFF, pose stays.

Guided (§16): shared mechanics; Explore-only v1 control.

| Concern | Chosen contract |
| --- | --- |
| Continuity | Discrete `P` shared with glyphs; no interpolation |
| Orientation preservation | World offset kept; no snap pose |
| Manual control | Orbit/zoom remain the investigation tools |
| Implementation cost | Low: pure translation + `enablePan` + App boolean |
| State complexity | One boolean + existing `selectedId` |
| Failure modes | Missing → Follow OFF; no render-loop throw |
| Three.js / OrbitControls fit | Uses `target` + existing `update()` |
| Reversibility | Follow OFF freezes pose; remount restores rest pose |

Do not build a mode framework, damping rewrite, or Journey
camera to support this.

---

## 24. Test contract

Slice 1 owns follow-point geometry tests.
Slice 2 owns Explore UI, App lifecycle, mutable-position,
and scientific-independence wiring tests. Cover at least:

```text
no selection → cannot enable Follow
selection alone → camera unchanged (no auto-Follow, no zoom/orbit jump)
enable Follow → target becomes current P; offset/orientation/zoom preserved
selected tracer movement → camera framing follows the same world delta
manual orbit while Follow ON → Follow stays ON; new orbit preserved
manual zoom while Follow ON → Follow stays ON; new radius preserved
manual pan while Follow ON → no target translation (pan disabled)
selected A → B while Follow ON → Follow stays ON; retarget to B with preserved offset
selected A → B while Follow OFF → camera unchanged
inactive selected marker → Follow stays ON; target stays at frozen P
missing selected tracer → Follow OFF; camera stays; no throw
Reset → Follow OFF; camera stays; selectedId kept; diagnostics resample restored P,t
Clear → selection cleared; Follow OFF; camera stays
Explore ↔ Guided / Guided experiment switch → selection cleared; Follow OFF
manual Follow OFF → camera stays
Follow does not change diagnostic values or diagnostic source (P, t)
Follow does not change tracer positions / advection / clock
Follow does not live on TracerParticle
glyph pick still wins over orbit-scale drag
```

Prefer pure helper tests for the translation geometry.
Do not add a WebGL screenshot harness (`01`). App lifecycle
follows the existing wiring-test style
(`tracerGlyphSelection.wiring.test.ts`,
`pointDiagnostics.wiring.test.tsx`,
`exploreFollow.wiring.test.tsx`).

---

## 25. Future implementation slices

Derived from live ownership, not from a generic camera
roadmap.

```text
Slice 1 — headless Follow geometry                 COMPLETE
  src/rendering/translateCameraFollowTarget.ts
  TracerScene.setFollowPoint / clearFollowPoint
  enablePan false only while a follow point is active
  no App UI, no Follow product boolean

Slice 2 — Explore control + App lifecycle          COMPLETE
  App followEnabled / followEnabledRef
  ExploreFollowControl in the laboratory-toolbar
  TracerViewport: after syncFromParticles, viewportFollowSync
    applies or clears the scene follow point
  Reset / Clear / mode switch / missing / A→B / inactive
  wiring tests from §24
  Guided control not mounted

Out of scope for this SoT
  Guided Follow button on the same contract
  product Reset View / labeled pan (`33` A′)
```

Slice 1 is rendering follow-point geometry; it does not
include product Follow UI. Slice 2 is Explore Follow
control and App lifecycle. It does not include Reset View,
Guided diagnostics, or a camera framework.

Rendering `11` remains the rest-pose fixture. Follow
coexists with it; this SoT does not rewrite `11` numbers.

---

## 26. Non-goals

```text
auto-Follow on selection
cinematic camera / ARCHITECTURE camera Journey
CONCEPT Journey Mode / first-person tracer ride
camera interpolation system
free diagnostic probe
diagnostic overlay / slice
Guided Point diagnostics mount
new Guided experiment
tracer visual redesign / trail recolor / reticle
new physics / T1 / Candidate A / V_total changes
dataset mode
generic camera framework / CameraState
mobile camera redesign
product Reset View bundled into Follow
labeled pan as a Follow companion
damping rewrite
recreating TracerScene on select
Follow-owned second tracer id
```

---

## 27. Compact lock-in

```text
1  Exact Follow meaning
     moving OrbitControls.target = selected particle.position
     camera keeps current world-space offset (A)
     framing, not ride-along, not look-at-only, not snap-pose

2  State owner
     App followEnabled boolean
     TracerSelection remains identity owner
     TracerScene applies translation
     not stored on the tracer

3  Canonical target identity
     current resolveSelectedTracer().position
     no second Follow id

4  Enable / disable UI
     Explore-only v1 toggle button “Follow”
     aria-pressed when ON
     disabled when no resolvable selection
     default OFF

5  A→B selection
     Follow stays ON and retargets to B with preserved offset

6  Camera translation / target update
     delta = P − target
     camera.position += delta
     controls.target ← P
     before existing controls.update()
     no extra interpolation

7  Manual orbit
     allowed; Follow stays ON; new relation preserved

8  Manual zoom
     allowed; Follow stays ON; new radius preserved

9  Manual pan
     disabled while Follow ON only
     restored when Follow OFF

10 Frame cadence
     every render frame after glyph sync
     last completed fixed-step P
     no interpolation
     does not change Inspector / diagnostic cadence

11 Inactive tracer
     Follow stays ON; camera stays on frozen marker P

12 Missing tracer
     Follow OFF; camera stays; no throw; selection not
     mutated by Follow

13 Reset
     Follow OFF; camera stays; selectedId kept

14 Clear
     selection cleared; Follow OFF; camera stays

15 Mode switch
     Follow OFF; no transfer across labs
     rest pose via live TracerScene remount

16 Explore vs Guided v1
     shared mechanics
     Explore-only control
     Guided diagnostics still not mounted

17 Rest-pose relation
     DEEP_STORM_TRACER_VIEW at TracerScene construction
     Stop Following does not restore rest pose
     Reset View out of scope

18 Point-diagnostic independence
     P, t, values, cadence, mount unchanged
     camera is not the probe

19 Implementation slices
     Slice 1 geometry/scene helper COMPLETE
     Slice 2 Explore UI + App lifecycle COMPLETE
     Guided Follow control NOT IMPLEMENTED
     Reset View not bundled; out of scope for this SoT

20 Product exposure
     Explore selected-tracer Follow v1 IMPLEMENTED
     Guided Follow control NOT IMPLEMENTED
     Reset View NOT IMPLEMENTED
```

---

## 28. Anti-claims

```text
Guided Follow control is not implemented
Reset View is not implemented
Slice 1 is rendering follow-point geometry
Slice 2 is Explore Follow control + App lifecycle
Follow-as-framing is not CONCEPT travel-with-the-air
Follow is not cinematic Journey
Follow is not overlay
Follow does not pull tracers
selection does not enable Follow
unlabeled pan is not product Follow
pan-while-Follow is not a lead-offset rig
Stop Following is not Reset Camera
simulation Reset is not Reset View
Follow is not Guided diagnostic mount
Follow does not sample diagnostics
camera pose is not diagnostic P
Follow is not a physics change
this file is not ROADMAP.md
this file does not rewrite 11, 19, 32, or 33’s ranking
```

---

## 29. Documentation / authority

```text
this file:     selected-tracer Follow camera contract
33:            chose Follow-as-framing as next direction
               — ranking not replaced
32:            point-first observation UI — not replaced
19:            selection / Inspector; auto-Follow still no
16:            camera Journey ≠ Guided / CONCEPT Journey
ARCHITECTURE §24: camera observes; does not pull
rendering 11:  rest-pose fixture; Follow out of *that*
               fixture’s own scope — numbers unchanged
rendering 01:  observe-only; no interpolation
rendering 02:  Reset does not move camera — reaffirmed
```

Successor of `33`: this file. Successor post-Follow
live-playtest product direction:

```text
docs/architecture/35-post-follow-live-playtest-product-direction-checkpoint.md
```

`35` re-ranks product work after Explore Follow v1 and its
first live playtest. This file remains the Follow camera
contract. Completing Follow does **not** start Reset View,
picking/halo, overlay, or new physics.

Closed physics docs are not rewritten.

---

## 30. Durable state

```text
FOLLOW-AS-FRAMING CAMERA CONTRACT
  DECIDED AS ARCHITECTURE SoT

SLICE 1
  COMPLETE
  src/rendering/translateCameraFollowTarget.ts
  TracerScene.setFollowPoint(position: Vec3)
  TracerScene.clearFollowPoint()
  stored followPoint copy or null
  pan disabled while follow point is active

SLICE 2
  COMPLETE
  App followEnabled: boolean (default false)
  App followEnabledRef: live rAF source
  ExploreFollowControl (Explore laboratory-toolbar)
  TracerViewport + viewportFollowSync after glyph sync
  Explore selected-tracer Follow v1 IMPLEMENTED

FOLLOW MEANING
  moving orbit center = selected particle.position
  preserved world-space camera offset

NOT IN THIS SoT
  Guided Follow control
  Reset View / labeled pan
  overlay / Guided diagnostics
  camera framework
  new physics
```
