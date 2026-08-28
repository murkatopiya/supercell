# How It Works and Onboarding

**Status:** UI SoT / NOT STARTED
**Scope:** a user-facing help surface that explains what the
application shows and how to operate it. Not a physics
derivation, not CONCEPT rewritten as a textbook.
**Physics:** unchanged. Help must not invent mappings or
mechanisms absent from existing SoT.
**Implementation:** NOT STARTED. This document does not include
that implementation.

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
docs/physics/10-hodograph-basics.md
docs/ui/07-app-navigation-and-mode-entry.md
docs/ui/08-scene-toolbar-and-control-states.md
docs/ui/09-world-coordinate-reference.md
docs/ui/10-tracer-interaction-affordance.md
docs/ui/11-floating-hodograph-workspace.md
```

---

## 1. Purpose

First-time users need a single place named **How It Works**
that answers:

```text
What am I looking at?
Which mode should I use?
What is Environment here?
What is the hodograph?
What are tracers?
How do I use the scene?
What can I click?
What is the coordinate grid for?
Which controls only change the picture, and which advance
  the laboratory?
```

Tone: operator’s guide. Equations and operand derivations
stay in `docs/physics/**`.

---

## 2. Current fact

There is no help surface. The header subtitle states
ground-relative hodograph vs storm-relative laboratory frame.
Guided teaching blocks (`observe` / `demonstrates` /
`does not mean`) and Explore anti-claims live on the
laboratory itself. That is not onboarding.

---

## 3. Scope

In this SoT:

- a dedicated How It Works surface;
- entry from landing and from both modes (`07`);
- the topic list and honesty rules below;
- help observes product facts; it does not own laboratory
  state.

Out of scope:

- interactive tutorial that drives the simulation;
- new physics diagrams that contradict `physics/00`;
- replacing Guided experiment teaching copy;
- a settings/help framework or CMS;
- localizing beyond the app’s current language.

---

## 4. Access and ownership

| From | Behavior |
| --- | --- |
| Landing | open How It Works; no laboratory constructed |
| Guided / Explore | open How It Works **without destroying** lab, selection, or environment |
| How It Works | return to landing, or back to the laboratory that opened it |

App view state (`07`) owns which surface is showing.

Help does not pause the clock by policy. If the laboratory
stays mounted but hidden, existing `paused` is unchanged. Do
not invent a second clock.

---

## 5. Content contract (topics)

Implementation supplies readable prose. Meanings that must
appear:

### 5.1 What you are looking at

A prescribed, storm-relative kinematic laboratory. Idealized
storm flow is prescribed. This is not a self-developing
supercell forecast (`40` M1). Keep that honesty short.

### 5.2 Guided vs Explore

- **Guided:** prepared experiments, curated tracers, one
  allowed teaching claim each (`16`, `20`).
- **Explore:** user releases tracers; no curated causal story
  attaches to a parcel that merely looks like a Guided seed
  (`16` §12.2, `18`).

Environment is chosen **inside** a mode, not instead of a
mode (`07`).

### 5.3 Environment

The environmental wind profile and hodograph for the current
laboratory. In Explore the user may switch demo prescribed vs
Goshen observed identity. Switching reconstructs the Explore
lab (existing App behavior). It is not a third mode.

### 5.4 Hodograph

A ground-relative path of environmental wind in
**(eastward, northward)** velocity space (`01`, `physics/10`).
It is not the 3D scene, not a map, and not an editor of the
sounding (`11`).

### 5.5 Tracers

Passive parcels advected through the prescribed velocity
field. Glyphs are visualization markers, not air volumes
(`01-parcel-basics`, `11` rendering). Pathlines are recorded
history (`14`), not a separate fluid.

### 5.6 Using the scene

Orbit to look. Pause / Speed / Reset control **simulation
elapsed** (`02`, `08`). Reset View recovers the camera (`37`).
Follow frames a selected tracer (`34`). Release (Explore)
picks ground `(x, z)` and uses the altitude control (`18`).

### 5.7 What you can click

- tracer glyphs → select (`36`);
- pathline → historical sample inspect (`52`);
- ground (Explore placement) → pending seed;
- Inspector / diagnostics are readouts, not editors.

Hover affordance (`10`) should be mentioned once landed.

### 5.8 Coordinate grid

World ruler: +X east, +Y up, +Z south (`09`, `physics/00`).
N/E/S/W and the HUD are for repeating the same release point.
The origin is not the storm center. Camera zoom does not
change metres.

### 5.9 Visualization vs simulation controls

Must classify explicitly:

| Visualization (picture) | Laboratory session |
| --- | --- |
| airflow comets / Eulerian marks | Pause / Resume |
| Highlight / Depth cue | Speed |
| hodograph overlay checkboxes | Reset (simulation) |
| world grid visibility | Release / Confirm / Clear tracers |
| scene camera (orbit, Follow, Reset View) | Guided experiment switch |
| | Explore environment identity |

Airflow marks are not tracer histories (`39`). Overlay
checkboxes do not recompute physics (`05`).

---

## 6. Integrity language (`CONCEPT` §9)

Help may use the project’s integrity categories in plain
speech:

- prescribed / conceptual laboratory;
- observed environmental profile when Goshen is selected;
- visual encoding (tracers, comets, halos).

It must not call the live seven-operand cartoon a full
numerical supercell simulation.

---

## 7. Testing expectations

- How It Works is reachable from landing and from both modes;
- opening from a mode does not clear `lab.kind` or selection;
- landing path still does not mount a laboratory;
- copy tests may assert required phrases for M1 honesty and
  “Environment is not a mode”; they should not snapshot the
  whole essay.

---

## 8. Implementation slice boundary

This document’s implementation slice is **Slice 6**:

```text
How It Works surface
links from landing and mode chrome
content covering §5
no physics code
```

Slice 6 is last so the help text can describe landing, scene
toolbar, grid, hover, and floating hodograph as they exist.

Slice 6 is NOT STARTED.

---

## 9. Anti-claims

```text
This SoT is not a substitute for docs/physics.
This SoT does not teach a concatenated S1→D1→NG1 life story.
This SoT does not make How It Works a third laboratory mode.
This SoT does not auto-pause physics as a help side effect
  unless a later product decision says so.
```
