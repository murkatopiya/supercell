# How It Works and Onboarding

**Status:** UI SoT / Slice 6 COMPLETE
**Scope:** a user-facing help overlay that explains what the
application shows and how to operate it. Not a physics
derivation, not CONCEPT rewritten as a textbook, not a
Visual Pass.
**Physics:** unchanged. Help observes existing product facts.
It does not own laboratory state and does not invent mappings
or mechanisms absent from existing SoT.
**Implementation:** Slice 6 COMPLETE in production `src/**`.

Predecessors:

```text
docs/CONCEPT.md §8–§9
docs/architecture/16-explore-guided-interaction-architecture.md
docs/architecture/18-explore-arbitrary-seeding.md
docs/architecture/19-shared-tracer-inspector.md
docs/architecture/32-diagnostic-observation-ui-architecture.md
docs/architecture/39-v1-visual-airflow-product-state-architecture.md
docs/architecture/40-v1-m1-m3-ux-ui-consolidation-architecture.md
docs/physics/00-coordinate-system.md
docs/physics/01-parcel-basics.md
docs/physics/10-hodograph-basics.md
docs/rendering/02-tracer-runtime-controls.md
docs/rendering/14-tracer-path-history.md
docs/ui/07-app-navigation-and-mode-entry.md
docs/ui/08-scene-toolbar-and-control-states.md
docs/ui/09-world-coordinate-reference.md
docs/ui/10-tracer-interaction-affordance.md
docs/ui/11-floating-hodograph-workspace.md
docs/ui/13-explore-tracer-authoring-history.md
```

---

## 1. Purpose

First-time users need a single place named **How It Works**
that answers:

```text
What is this application?
How do Guided and Explore differ?
What am I looking at in the 3D scene?
What does the hodograph show?
How do tracers work?
Which controls change the experiment, and which only
  change visualization?
```

Tone: operator’s guide. Equations and operand derivations
stay in `docs/physics/**`.

---

## 2. Current fact (live App)

Verified against `App`, `LandingPage`, `HowItWorksSurface`,
and `HowItWorksAffordance` after Slice 6:

```text
surface              shared overlay/modal over the current page
owner                App UI navigation (howItWorksOpen)
entry                landing button; Guided and Explore header
close                returns to the same surface that opened it
lab on open          preserved (no new session, no landing bounce)
selection            preserved
environment          preserved
camera / workspace   preserved
user paused          unchanged
viewport while open  paused || howItWorksOpen
```

There is one `HowItWorksSurface`. Landing, Guided, and Explore
share it. Mode-aware extras change tracer-release copy only.

---

## 3. Scope

In this SoT:

- a dedicated How It Works overlay;
- entry from landing and from both laboratory modes;
- six scannable sections with the honesty rules below;
- help observes product facts; it does not own laboratory
  state.

Out of scope:

- interactive tutorial, carousel, wizard, or spotlight tour;
- first-run persistence / “don’t show again”;
- meteorology course or physics derivation;
- Visual Pass / new design system;
- analytics or telemetry;
- a settings/help framework or CMS;
- localizing beyond the app’s current language.

---

## 4. Access and ownership

`howItWorksOpen: boolean` belongs to the App/UI navigation
layer. How It Works does not own:

```text
lab
Simulation
TracerSelection
Environment / exploreEnvironmentIdentity
HodographPoint[]
camera
hodograph panel geometry / plot view
scene presentation state
user paused
```

| From | Behavior |
| --- | --- |
| Landing | open overlay; no laboratory constructed; close stays on landing; no mode is chosen |
| Guided / Explore | open overlay over the live lab; close restores the same lab |
| Close / Escape / backdrop | overlay dismissed; trigger refocused when possible |

Laboratory help lives in `app__header-tools` next to
Environment, as global chrome of the current laboratory
surface. It is not a third mode, and it is not inside
Runtime, Environment, SceneToolbar, or Inspector.

Closing does not return through landing and does not create a
new lab session.

---

## 5. Runtime while help is open

Opening How It Works does **not** write Simulation or the
user’s persistent `paused` flag.

The tracer viewport receives:

```text
paused={paused || howItWorksOpen}
```

`TracerRuntimeControls` still bind to user `paused`.

Consequences:

```text
user paused = false, open help  → simulation does not advance
close help                      → continues running
user paused = true, open/close  → remains paused
```

Resume after help uses the existing viewport no-catch-up
pause/resume path (`wasPausedRef`). Help does not invent a
second clock.

Explore Undo/Redo keyboard shortcuts are ignored while the
overlay is open, so help cannot mutate occupancy.

Landing has no laboratory, so there is no simulation to
suspend.

---

## 6. Content contract

Readable prose lives in `src/app/howItWorksContent.ts` and
`HowItWorksSurface`. Meanings that must appear:

### 6.1 What is Supercell Explorer?

An interactive laboratory for examining **prescribed**
supercell airflow and watching **passive** tracers move
through it. The user explores a model, not live weather, and
the product does not claim forecasting capability.

### 6.2 Guided and Explore

- **Guided:** prepared experiments designed to highlight
  particular storm structures and relationships. Releases are
  set by the prepared experiment.
- **Explore:** choose an environment, release tracers, and
  compare setups.

These are two different ways to investigate. Guided is not a
simplified Explore. Environment is chosen **inside** a mode,
not instead of a mode (`07`).

### 6.3 The 3D scene

- **Airflow marks / Flow comets:** visualization of the
  prescribed velocity field. They are visualization marks,
  not particles of air being permanently tracked. Tails on
  comets are direction cues, not tracer histories (`39`).
- **Eulerian — diagnostic:** samples the same total velocity
  at fixed laboratory positions; instantaneous direction, not
  moving parcels.
- **Coordinate grid:** E = east, N = north. The grid follows
  world coordinates. The HUD shows ground coordinates under
  the cursor. The marked origin is a laboratory reference,
  not the storm center. Internal axis names (`+X`, `−Z`,
  Three.js) stay out of the operator’s guide (`09`).
- **Scene controls:** Grid / Airflow view / Highlight /
  Depth cue change how the scene is drawn. They do not change
  the atmospheric environment.

### 6.4 Hodograph

Shows how the environmental wind vector changes with height.
Points are horizontal wind components; heights form the
hodograph. Diagnostic vectors are analytical overlays, not
additional airflows (`01`, `05`, `11`).

The panel can be moved and resized. The plot can be zoomed
and panned. Reset restores the original **plot view**, not
physics.

### 6.5 Tracers

A tracer is a passive marker carried by the simulated
airflow. It does not affect the airflow (`physics/01`).

Explore workflow:

```text
Release tracer → choose a ground position → choose altitude
  → confirm release
```

Shared facts:

- click the glyph to select;
- the tail is also clickable;
- the tail is recorded trajectory/history, not a streamline
  (`14`, `10`);
- Inspector describes the selected tracer;
- Explore Undo / Redo reverse last tracer releases (not
  simulation rewind) (`13`);
- Clear tracers clears the current group.

### 6.6 Experiment vs visualization

**Changes the experiment**

- Environment;
- tracer release;
- prepared Guided experiment.

**Changes only what you see**

- Grid;
- Airflow view;
- Highlight;
- Depth cue;
- hodograph zoom/pan;
- camera / view controls.

Speed changes how quickly the simulation is played, not the
atmospheric velocity field itself (`02`, `08`). Pause /
Resume control whether laboratory time advances. Not every
Runtime control is pure visualization.

---

## 7. Mode-aware presentation

One document, slightly adapted:

```text
landing   both Guided and Explore tracer notes
guided    prepared-experiment releases; no Explore workflow
explore   full release / Undo / Redo / Clear workflow
```

Terminology stays shared. This is not two help documents.

Presentation: headings, short paragraphs, compact lists,
scroll inside the dialog. Not a carousel, wizard, or
mandatory tutorial.

---

## 8. Modal interaction

```text
role="dialog" aria-modal="true"
explicit Close
Escape closes (capture, so Environment Escape does not also fire)
backdrop click closes
clicks / pointerdown inside the dialog do not reach the 3D scene
focus moves to Close on open
focus returns to the trigger on close when the trigger ref is set
overlay z-index 80 (above hodograph workspace 40)
```

No modal library. Clicks on the overlay do not construct or
destroy a laboratory.

---

## 9. Integrity language (`CONCEPT` §9)

Help may use the project’s integrity categories in plain
speech:

- prescribed / conceptual laboratory;
- observed environmental profile when Goshen is selected
  (mentioned as Environment chosen inside Explore);
- visual encoding (tracers, comets, diagnostic overlays).

It must not call the live seven-operand cartoon a full
numerical supercell simulation.

---

## 10. Testing expectations

- How It Works is active on landing;
- landing open → close stays on landing;
- Guided / Explore open → close keep the same lab;
- selected tracer, Environment, camera, and workspace are
  not written by open/close;
- dialog semantics, Escape, and overlay pointer isolation;
- Guided vs Explore copy differs on tracer release;
- tracer is described as passive;
- experiment vs visualization is explicit;
- playback speed is not described as changing atmospheric
  velocity;
- viewport uses `paused || howItWorksOpen` while runtime
  controls keep user `paused`.

---

## 11. Implementation slice boundary

Slice 6 is this overlay, its entry points, and the content
in §6. It is the last functional UI-polish slice before a
separate Visual Pass.

Visual Pass is out of scope for this SoT.

---

## 12. Anti-claims

```text
This SoT is not a substitute for docs/physics.
This SoT does not teach a concatenated S1→D1→NG1 life story.
This SoT does not make How It Works a third laboratory mode.
How It Works does not write Simulation or user paused.
Temporary viewport suspension is a UI gate, not a physics
  pause flag.
This SoT is not a Visual Pass.
```
