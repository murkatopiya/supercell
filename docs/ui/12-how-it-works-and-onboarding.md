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
What can I do in Explore?
What is observed, and what is prescribed?
What does the tracer path show?
What does Analysis T1 mean?
What happens after clicking a historical sample?
What is this NOT?
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
viewport while open  paused || howItWorksOpen || glossaryOpen
                     || userGuideOpen
```

There is one `HowItWorksSurface`. Landing, Guided, and Explore
share it. Mode-aware extras change Explore-only workflow
steps; Guided keeps prepared-release copy.

User Guide is a sibling public help overlay. It is the
practical operator manual. It does not replace How It Works.

Glossary is a sibling public help overlay. It defines
laboratory terms. It does not replace How It Works.

---

## 3. Scope

In this SoT:

- a dedicated How It Works overlay;
- entry from landing and from both laboratory modes;
- scannable sections for the current Explore workflow;
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
paused={paused || howItWorksOpen || glossaryOpen || userGuideOpen}
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

An interactive kinematic laboratory for prescribed
storm-relative flow, passive tracers, and a
vertical-tilting diagnostic along the recorded path. The
user explores a model, not live weather, and the product
does not claim forecasting capability.

### 6.2 Current Explore workflow

Help explains the public laboratory in this order:

1. Choose an environment — observed sounding-derived Source
   profile where available.
2. Release a tracer — passive marker in the prescribed
   storm-relative laboratory velocity field.
3. Read the recorded trajectory — path colored by Analysis T1
   on a fixed symmetric scale.
4. Understand the color — warm = positive T1, cool = negative
   T1, near-neutral = near zero. Saturation is
   ±6.10×10⁻⁵ s⁻². Values beyond the display limit keep their
   raw numeric value but use the saturated endpoint color.
   Out-of-support / unavailable is not mapped to zero.
5. Click a historical sample — selection refers to that exact
   recorded trajectory sample.
6. Explain T1 geometrically — alignment of environmental
   horizontal vorticity ω_h with prescribed updraft horizontal
   gradient ∇_h V_y.
7. Verify numerically — inspector shows the same atomic
   Analysis result used for the explanation.
8. Use what-if geometry — observed environmental ω_h stays
   fixed; only a hypothetical copy of prescribed storm-local
   gradient alignment varies; laboratory state remains
   unchanged.
9. Source vs Analysis — Source advects; Analysis explains.
   Source is used in the laboratory velocity/advection path.
   Analysis explains selected diagnostics along the recorded
   trajectory when an Analysis sibling is available.
10. Scientific boundary — prescribed kinematic storm-relative
    laboratory; not forecast, LES/CFD, prognostic
    parcel-vorticity model, or reconstructed storm evolution.

Scene controls still change drawing, not the atmospheric
environment. Playback speed still does not change atmospheric
velocity.

### 6.3 Honesty language

Help must not imply that Analysis pushed the tracer, that T1
is parcel spin-up or Δω_y, that displayed T1 generated
current ω_y, or that what-if modifies the observed sounding.

Analysis capability may be unavailable when no suitable
Analysis representation exists. Do not describe that as a
broken Moore diagnostic.

---

## 7. Mode-aware presentation

One document, slightly adapted:

```text
landing   public Explore workflow
guided    prepared-experiment releases; no Explore release /
          historical-sample / what-if steps
explore   public Explore workflow
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
- landing / Explore copy describes the current T1 trajectory
  workflow, Source vs Analysis, and what-if laboratory-unchanged
  rule;
- Guided copy does not present Explore release as the live
  action of that exhibit;
- tracer is described as passive;
- playback speed is not described as changing atmospheric
  velocity;
- viewport uses `paused || howItWorksOpen || glossaryOpen || userGuideOpen` while runtime
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
