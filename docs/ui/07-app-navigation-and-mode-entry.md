# App Navigation and Mode Entry

**Status:** UI SoT / SLICE 1 COMPLETE
**Scope:** first-time-user entry, top-level mode identity, and
where Environment sits in the product hierarchy. Not physics.
Not a routing-library introduction. Not a visual redesign.
**Physics:** unchanged. This file does not modify
`src/physics/**`, sounding semantics, storm fields, or
simulation runtime.
**Implementation:** Slice 1 COMPLETE (landing, mode identity,
Environment in mode chrome). How It Works overlay is Slice 6
(`12`) and is NOT STARTED.

Predecessors (still binding; not rewritten):

```text
docs/CONCEPT.md §8
docs/architecture/16-explore-guided-interaction-architecture.md
docs/architecture/20-guided-runtime-architecture.md
docs/architecture/40-v1-m1-m3-ux-ui-consolidation-architecture.md
docs/architecture/42-post-41-3-explore-airflow-and-environment-architecture.md
docs/ui/01-hodograph-panel.md … docs/ui/06-streamwise-crosswise-vorticity-overlay.md
```

`docs/ui/01`–`06` remain historical SoT for their hodograph
slices. They are not a description of the current whole app.

This file is the product-navigation SoT for the UI polish
pass. Companion UI SoTs:

```text
docs/ui/08-scene-toolbar-and-control-states.md
docs/ui/09-world-coordinate-reference.md
docs/ui/10-tracer-interaction-affordance.md
docs/ui/11-floating-hodograph-workspace.md
docs/ui/12-how-it-works-and-onboarding.md
```

---

## 1. Purpose

A person who has never seen Supercell Explorer must be able to
answer, before entering a laboratory:

```text
What is this application?
Which of two modes am I choosing, and why?
Where do I read How It Works?
```

Once inside a mode, they must see where they are, and they
must not mistake Environment for a third top-level mode.

---

## 2. Current fact (live App)

Verified after Slice 1 against `src/app/App.tsx`:

```text
Boot surface          landing (`appSurface = "landing"`, `lab = null`)
Top-level chrome      landing: title + mode cards + How It Works entry
                      laboratory: ModeIdentity + Environment affordance
Mode entry            landing cards → enterGuided / enterExplore
                      no in-mode Guided ↔ Explore toggle
Default lab           not constructed until mode choice
Environment           laboratory header tool, not a mode peer
                      Guided: default open, column presentation
                      Explore: default closed, overlay presentation
                      Explore identity radios live inside
                      EnvironmentSurface
Router                none (Vite + React composition)
How It Works          landing button reserved; disabled until Slice 6
```

`lab.kind` (`"guided" | "explore"`) is the live mode owner
once a laboratory exists. `TracerPedagogy` is not product
navigation (`16`).

---

## 3. Scope

In this SoT:

- a landing / mode-selection surface;
- Guided and Explore as the only top-level modes;
- in-mode identity chrome (`Supercell / Guided` or
  `Supercell / Explore`);
- return to landing via `Supercell`;
- Environment as an intra-mode reference surface, not a mode;
- access to How It Works from landing (and, with `12`, from
  both modes);
- App-owned view state without a routing library.

Out of scope:

- physics, diagnostics, storm fields, tracer advection;
- new environments, experiments, or sounding editors;
- react-router / any routing library;
- duplicating Guided and Explore shells;
- rewriting `docs/ui/01`–`06`;
- scene toolbar, coordinate grid, tracer hover, floating
  hodograph chrome (companion SoTs);
- auto-starting a hidden laboratory behind the landing page.

---

## 4. Product hierarchy

```text
Supercell Explorer
  ├── Landing
  ├── How It Works          (help surface; see 12)
  ├── Guided                (top-level mode)
  │     ├── experiment catalog (existing GuidedExperimentId)
  │     └── Environment       (hodograph + overlays; default open)
  └── Explore               (top-level mode)
        ├── environment identity (demo prescribed |
        │     Goshen 2009 | Prospect Valley 2010 |
        │     Dumas 2010 observed)
        └── Environment       (hodograph + overlays; default closed)
```

Forbidden as top-level peers of Guided / Explore:

```text
Environment
Hodograph
Airflow
Inspector
TracerPedagogy
IntegrationFrame
a specific sounding
```

---

## 5. Landing surface

### 5.1 Job

The first screen is a **choice**, not a laboratory.

The user selects exactly one:

- **Guided** — enter the Guided laboratory;
- **Explore** — enter the Explore laboratory;
- **How It Works** — reserved landing entry; the overlay
  surface itself is Slice 6 (`12`).

### 5.2 Copy contract

Landing copy is user-facing. It is not a physics derivation
and not an architecture lecture.

Guided (meaning, not final wording):

```text
Walk a prepared scenario. Watch how environment, airflow,
rotation, and tracer motion relate under a teaching claim.
```

Explore (meaning, not final wording):

```text
Choose an environment, release tracers yourself, and compare
how different atmospheric setups behave.
```

How It Works is a third, clearly secondary action — help, not
a mode.

Final sentences may be tightened in implementation. They must
keep this meaning split (`16` §2–§3, `CONCEPT` §8: Journey
family = Guided).

### 5.3 What landing does not do

- does not construct or step a laboratory as a side effect of
  merely viewing the page;
- does not select an environment;
- does not select a Guided experiment;
- does not show the 3D scene, Inspector, or hodograph as the
  primary workspace.

---

## 6. Mode identity chrome

Inside a laboratory the user must see:

```text
Supercell / Guided
```

or:

```text
Supercell / Explore
```

Semantics:

| Control | Action |
| --- | --- |
| `Supercell` | leave the laboratory and return to landing |
| current mode name | identity, not a second landing |

The header Guided | Explore toggle as a peer of Environment
is removed.

v1 mode switching is **landing-only**. There is no persistent
in-mode Guided ↔ Explore control. If later playtest requires
a fast in-mode switch, that is a separate UX change.

In-mode chrome:

```text
breadcrumb identity in the laboratory header
  Supercell → landing
  Guided | Explore is identity, not a toggle
Environment affordance in the same header as a mode tool
```

`enterGuided` / `enterExplore` remain the composition entry
points. They are invoked from landing cards, not from a
laboratory mode switch.

Slice 1 How It Works: a landing `button` exists so the entry
is visible. It is **disabled** until Slice 6 implements the
overlay/modal over the current surface without destroying
lab state.

---

## 7. Leaving a mode

Returning to landing:

- unmounts or hides the laboratory workspace;
- does not keep a hidden running simulation as the landing
  background;
- does not write Explore seeds into `DEMO_SCENARIO`;
- does not change physics.

Re-entering a mode uses the existing composition entry points
(`createGuidedLab` / `createExploreLab` and today’s enter
helpers). Fresh entry may reset that mode’s lab the same way
today’s mode switch already reconstructs the lab. Preserving a
previous session across landing is not required in this pass.

---

## 8. Environment is not a mode

**STILL-BINDING** from `40` §10 and `42` §10, sharpened:

```text
Environment is an on-demand reference surface inside the
current mode. It is not product navigation.
```

Live fact this pass corrected:

```text
EnvironmentAffordance no longer sits beside a Guided | Explore
mode switch. It is laboratory header chrome for the current
mode.
```

After this pass:

- the Environment affordance lives in **mode chrome** (header
  tools of the laboratory, or an equivalent in-mode control
  band);
- it remains persistently labeled and available before tracer
  selection (`40` T2 / `42` affordance contract);
- Guided may keep Environment default-open;
- Explore may keep Environment default-closed;
- Explore environment **identity** (demo prescribed vs
  Goshen / Prospect Valley / Dumas observed) stays inside
  the Environment surface, as today (`EnvironmentSurface`
  radios). It does not move to landing. Explore also shows
  the current identity as a readout under
  **Storm-relative laboratory**; that line is not a second
  switch.

Guided experiment selection stays inside Guided
(`GuidedExperimentSelector`). It is not a top-level mode and
not an Environment identity.

---

## 9. Ownership

| Concern | Owner | UI role |
| --- | --- | --- |
| App surface (landing / help / laboratory) | App session state | exclusive view |
| Current mode | `lab.kind` (existing) | observed by chrome |
| Guided experiment id | App `guidedExperimentId` + `createGuidedLab` / `switchGuidedExperiment` | selector inside Guided |
| Explore environment identity | App `exploreEnvironmentIdentity` + `createExploreLab` | radios inside Environment; Explore heading reads the current label |
| Environment open/closed | App `environmentOpen` | affordance + surface |
| Hodograph points | physics `hodographPoints(profile)` at composition | Environment observes |
| Simulation / particles | GuidedLab / ExploreLab | not owned by landing |

UI does not become the owner of physics state, occupancy, or
selection by hosting landing.

There is no routing library. A small App view enum is enough,
for example:

```text
"landing" | "how-it-works" | "laboratory"
```

Laboratory then uses existing `lab.kind`. This is composition
state, not a new framework.

---

## 10. Shared chrome vs mode-local chrome

Shared (both modes, once inside a laboratory):

```text
product identity breadcrumb
How It Works access (12)
Environment affordance (not a mode)
runtime Pause / Reset / Speed (08)
shared Inspector presentational component
3D TracerViewport
```

Guided-only (unchanged capability set):

```text
experiment selector + teaching panel
no Explore release / Follow / Reset View / Clear /
  airflow population / Point diagnostics
```

Explore-only (unchanged capability set):

```text
action rail: Release, Runtime, View
airflow / scene presentation (08, landing 42-2 placement)
Point diagnostics
environment identity radios
```

This pass does not add Guided mounts that `40` §12 / `42` §12
forbade.

---

## 11. Interaction semantics

Landing:

- choosing Guided calls the existing Guided entry path;
- choosing Explore calls the existing Explore entry path;
- How It Works is a reserved landing button; Slice 6 owns the overlay.

In laboratory:

- `Supercell` → landing (drops the current lab instance);
- Environment toggles the existing Environment surface;
- there is no in-mode Guided ↔ Explore switch.

Keyboard: landing actions are ordinary buttons. Environment
keeps `aria-expanded` / `aria-controls` (`42`).

---

## 12. Dependencies

| Dependency | Use |
| --- | --- |
| `16` | Guided / Explore are the only product modes |
| `20` | Guided catalog / experiment switch |
| `40` / `42` | Environment on-demand; Explore vs Guided shells |
| `18` | Explore identity is session/composition, not ScenarioConfig |
| App `enterGuided` / `enterExplore` | existing lab reconstruction |

Does not depend on new physics APIs.

---

## 13. Testing expectations

Prefer wiring / composition tests over visual snapshots.

Required:

- App can render a landing surface without mounting the
  laboratory workspace as the first screen;
- landing exposes Guided, Explore, and How It Works;
- entering Guided / Explore still uses `lab.kind` and existing
  lab factories;
- in-mode chrome identifies Guided vs Explore;
- `Supercell` returns to landing;
- Environment is not presented as a third `aria-pressed` mode
  sibling of Guided / Explore;
- Explore environment radios remain inside Environment, not
  on landing;
- Explore laboratory heading reads the current environment
  label and is not a second identity control;
- Guided experiment selector remains inside Guided.

Do not require:

- physics tests;
- e2e browser journeys as the primary contract;
- a router integration test.

---

## 14. UI polish pass — slice order

Recommended production order (same as companion files):

| Slice | SoT | Why this order |
| --- | --- | --- |
| 1 | this file | Entry and hierarchy first; later chrome assumes a mode, not a landing-less toggle |
| 2 | `08` | Scene toolbar + disabled + `5×` default; gives `09` a home for the grid toggle; lands `42-2` Airflow placement |
| 3 | `09` | World grid/HUD needs a stable viewport column; toggle belongs on the toolbar from Slice 2 |
| 4 | `10` | Hover reuses existing pick; independent of hodograph chrome |
| 5 | `11` | Floating workspace after Environment is clearly intra-mode (Slice 1) |
| 6 | `12` | Help text describes the polished surfaces |

Do not start from Slice 5 (hodograph) or Slice 3 (grid) while
the header still presents Environment as a peer of Guided /
Explore.

Alternate order is not required: pick/hover (`10`) does not
depend on the grid, but putting it after the toolbar avoids
two concurrent pointer-policy edits on `TracerViewport`.

---

## 15. Implementation slice boundary

This document’s implementation slice is **Slice 1** of the UI
polish pass:

```text
landing surface
mode identity breadcrumb
Environment affordance moved into mode chrome
How It Works entry point from landing (surface itself is 12)
no routing library
```

It excludes Slices 2–6 (toolbar, coordinates, hover,
hodograph workspace, help content).

Slice 1 is COMPLETE.

---

## 16. Anti-claims

```text
This SoT does not add a third top-level mode.
This SoT does not make Environment product navigation.
This SoT does not introduce react-router.
This SoT does not keep a hidden simulation running under landing.
This SoT does not rewrite docs/ui/01–06.
This SoT does not change physics or simulation integration.
This SoT does not authorize a visual redesign.
```
