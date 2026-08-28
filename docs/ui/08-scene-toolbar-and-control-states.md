# Scene Toolbar and Control States

**Status:** UI SoT / Slice 2 COMPLETE
**Scope:** where scene-presentation controls live, which
controls disable from existing state, and the UI default for
runtime speed. Not physics. Not a new control family beyond
placement and disabled reflection.
**Physics:** unchanged. `timeScale` remains UI/runtime session
state (`docs/rendering/02-tracer-runtime-controls.md`). This
file does not put `5×` into physics semantics or enlarge `dt`.
**Implementation:** Slice 2 COMPLETE in production `src/**`.
Slice 3 world-grid / HUD remains NOT STARTED (`09`).

Predecessors:

```text
docs/rendering/02-tracer-runtime-controls.md
docs/architecture/39-v1-visual-airflow-product-state-architecture.md
docs/architecture/40-v1-m1-m3-ux-ui-consolidation-architecture.md
docs/architecture/41-post-slice-b-explore-release-and-highlight-checkpoint.md
docs/architecture/42-post-41-3-explore-airflow-and-environment-architecture.md
docs/ui/07-app-navigation-and-mode-entry.md
```

---

## 1. Purpose

Controls that change **how the 3D scene is drawn** must belong
to the scene.

Controls that change **laboratory occupancy, time, or camera
framing** must not live in that same visual group.

Controls whose action is impossible or meaningless in the
current state must appear disabled, using already-owned state.

The Guided and Explore runtime speed default is `5×`. That is
a UI default, not a physics constant.

---

## 2. Current fact (live App)

Verified against `src/app/App.tsx` and control components after
Slice 2:

```text
timeScale default           5  (DEFAULT_TRACER_TIME_SCALE;
                            App useState + enterGuided /
                            enterExplore)
allowed scales              1 | 5 | 10 | 20   (unchanged)
Explore control bands       Release | Runtime | View
Airflow home                SceneToolbar above Explore canvas
                            (42-2 placement COMPLETE)
Guided scene toolbar        absent until `09` grid toggle
Guided laboratory toolbar   Runtime + experiment selector
                            (no airflow, no Follow, no Clear)
Clear tracers               disabled when occupancy === 0
Follow                      disabled without resolvable selection
                            (reason shown)
Confirm                     disabled without pending seed
                            (reason shown)
Cancel                      enabled while placement is on
Reset View                  always enabled
Reset (simulation)          always enabled; preserves paused
                            and timeScale (`02`)
Pause / Speed               always enabled
```

Scene presentation state remains App session state:

```text
workbenchMode / highlightMode / depthCueEnabled
```

`SceneToolbar` is a presentational wrapper. It does not own
those flags.

Grid visibility is reserved for this toolbar (`09`) and is
not present as a control.

---

## 3. Scope

In this SoT:

- a scene toolbar visually attached to `TracerViewport`;
- move existing Explore airflow presentation controls onto
  that toolbar (`42` §6);
- reserve the same toolbar for the world-grid visibility
  toggle (`09`);
- disabled-state pass over existing buttons;
- default `timeScale = 5` in Guided and Explore.

Out of scope:

- new airflow encodings or extra operands (`39` closed);
- mounting airflow population or airflow toolbar on Guided
  (`40` §12, `42` §12);
- changing Pause / Reset / Speed **meanings**;
- putting `timeScale` on `ScenarioConfig` or `SimulationClock`;
- changing Follow, Reset View, picking, or halo contracts;
- snap-to-grid;
- cosmetic icon systems.

---

## 4. Control taxonomy

Keep three homes. Mixing them is the failure this pass
corrects.

| Home | Changes | Examples |
| --- | --- | --- |
| **Scene toolbar** | presentation of the 3D drawing | airflow view (comets / Eulerian), Highlight, Depth cue, world-grid visibility (`09`) |
| **Laboratory action rail / Guided toolbar** | session and occupancy | Release, Pause, Reset, Speed, Clear tracers, Follow, Reset View, Guided experiment |
| **Environment surface** | environmental reference | hodograph, overlay checkboxes, Explore environment identity |

Follow and Reset View stay **View** (camera), not scene
presentation. They do not move onto the scene toolbar.

Runtime Speed stays with Pause / Reset. Speed is playback of
simulation elapsed, not a shader.

---

## 5. Scene toolbar

### 5.1 Placement

```text
Immediately above the 3D canvas, inside the viewport column.
Visually part of the scene, not part of Environment, and not
part of the left action rail.
```

This is `42`’s viewport toolbar, generalized to any
scene-presentation control.

The toolbar must stay compact. It must not restore the
pre-`40` teaching stack above a short canvas, and it must not
cover pick targets on the canvas (`42` T5/T6).

### 5.2 Explore contents

Existing controls, new home:

```text
Airflow view     Flow comets | Eulerian — diagnostic
Highlight        Off + operand select
Depth cue        checkbox
```

Same defaults, copy, and encodings as `39` / Slice B. This
pass relocates them.

Later (`09`): grid visibility toggle.

### 5.3 Guided contents

Guided has no airflow population and no airflow toolbar.

When `09` lands, Guided may show **only** the grid visibility
control on a thin scene toolbar. Do not use that as permission
to mount Comets, Highlight, or Depth cue in Guided.

Until `09`, Guided has an absent scene toolbar. Do not mount
Comets, Highlight, or Depth cue in Guided.

### 5.4 Shared primitive

One presentational toolbar wrapper around the viewport is
allowed. Explore and Guided pass different slots. Do not fork
two viewport implementations.

---

## 6. Runtime speed default

**UI/runtime default only.**

```text
Initial timeScale in Guided and Explore = 5
```

Owner: App session state (`useState<TracerTimeScale>`), the
same owner as today.

Unchanged (`02`):

```text
simulationElapsed = clampedWallFrameDt * timeScale
scenario timestep stays 0.1 s
Pause still supplies simulationElapsed = 0
Reset preserves paused and timeScale
```

Forbidden:

- treating `5` as a physical timescale of the atmosphere;
- changing integrator `dt`;
- adding `DEFAULT_DT`;
- putting the default on a physics type.

Users can still choose `1×` / `10×` / `20×`.

---

## 7. Disabled controls

UI reflects existing state. It does not invent new session
rules.

### 7.1 Required pass

| Control | Disable when | Reason (if not obvious) |
| --- | --- | --- |
| Clear tracers | Explore occupancy = 0 (`simulation.particles.length === 0` or equivalent live slot count) | nothing to clear |
| Follow | no resolvable selected tracer | already implemented |
| Confirm | no pending seed | already implemented |
| Storm-relative wind overlay checkbox | parent overlay gate (`05`) | already implemented |
| Streamwise/crosswise overlay checkbox | parent overlay gate (`06`) | already implemented |

Occupancy for Clear tracers is laboratory occupancy, not
visual-airflow occupant count.

### 7.2 Keep enabled

| Control | Why |
| --- | --- |
| Pause / Resume | always meaningful |
| Speed radios | always meaningful |
| Reset (simulation) | Guided restores canonical ICs; Explore empty Reset still zeros the clock (`18`) without fabricating a tracer |
| Reset View | always camera recovery (`37`) |
| Release tracer | arms placement; meaningful at occupancy 0 |
| Cancel placement | leaves placement even with no pending seed (already) |
| Environment affordance | reference, not occupancy |
| Airflow view toggles | presentation, independent of tracer count |
| Highlight Off | always meaningful; operand select may stay as today |

Do not disable Reset merely because Explore is empty.

### 7.3 Reason display

Follow the existing F8 pattern (`40`, `ExploreFollowControl`):

- `disabled` on the control;
- `title` and/or visible `control-disabled-reason` when the
  reason is not obvious from the label.

Clear tracers with occupancy 0 is obvious enough for `disabled`
plus a short `title` (for example “No tracers to clear.”). A
permanent extra sentence is not required.

### 7.4 Anti-claim

Disabled is **not** a new authorization check and not a change
to `ExploreTracerSession.clear`. The click path when occupancy
is 0 is already a no-op or an empty clear; this pass stops
offering it as an active action.

---

## 8. Ownership

| Concern | Owner | UI role |
| --- | --- | --- |
| Scene presentation (airflow mode, highlight, depth cue) | App session state (existing) | scene toolbar observes / writes presentation flags only |
| Grid visibility | App or viewport presentation state (`09`) | scene toolbar |
| `paused`, `timeScale` | App session state | Runtime band; default 5 |
| Explore occupancy | `ExploreTracerSession` / `Simulation.particles` | Clear tracers **reads** count |
| Pending seed / placement | `ExplorePointReleaseTool` | Confirm/Cancel **read** |
| Selection resolvable | `TracerSelection` + particles | Follow **reads** |
| Camera pose | `TracerScene` / OrbitControls | Reset View commands recovery (`37`) |

The toolbar does not own `VelocityField`, airflow samples’
physics, or tracer identities.

---

## 9. Dependencies

| Dependency | Use |
| --- | --- |
| `02` | Pause / timeScale / Reset contract |
| `39` | Comets default, Highlight, Depth cue meanings |
| `40` / `41` | rail bands, F7 terminology, F8 disabled reasons |
| `42` | Airflow home = viewport toolbar |
| `37` | Reset View ≠ Reset |
| `18` | Clear vs Reset occupancy |

---

## 10. Testing expectations

- default `timeScale` is `5` in App composition tests for
  both modes;
- Explore airflow controls are wired in the viewport column,
  not in the left rail Airflow band;
- Guided still has no airflow toolbar;
- Clear tracers is `disabled` at occupancy 0 and enabled at
  occupancy ≥ 1;
- existing Follow / Confirm disabled tests remain green;
- no test may pass a scaled `dt` into `simulation.step`.

---

## 11. Implementation slice boundary

This document’s implementation slice is **Slice 2**:

```text
scene toolbar shell above TracerViewport
relocate Explore airflow controls onto that toolbar
disabled Clear tracers at occupancy 0
default timeScale = 5
```

Grid toggle implementation waits for `09` (Slice 3) unless a
disabled placeholder would confuse users — then omit it until
`09`.

Slice 2 is COMPLETE.

Evidence:

```text
src/ui/tracer/SceneToolbar.tsx
src/ui/tracer/ExploreClearTracersControl.tsx
src/ui/tracer/TracerRuntimeControls.tsx
  DEFAULT_TRACER_TIME_SCALE = 5
src/app/App.tsx
  SceneToolbar in Explore viewport column
  enterGuided / enterExplore setTimeScale(DEFAULT_TRACER_TIME_SCALE)
src/app/sceneToolbar.wiring.test.tsx
src/ui/tracer/ExploreClearTracersControl.test.tsx
```

---

## 12. Anti-claims

```text
This SoT does not change physics time or integration.
This SoT does not add Guided airflow.
This SoT does not merge Follow/Reset View into presentation.
This SoT does not hide Airflow in a Tools menu (41/42).
This SoT does not introduce a settings framework.
```
