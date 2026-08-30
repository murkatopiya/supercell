# User Guide

**Status:** UI SoT / COMPLETE
**Scope:** a user-facing practical Explore manual overlay.
Not How It Works, not Glossary, not a physics derivation.
**Physics:** unchanged. Help observes existing product facts.
It does not own laboratory state.
**Implementation:** COMPLETE in production `src/**`.

Predecessors:

```text
docs/ui/07-app-navigation-and-mode-entry.md
docs/ui/12-how-it-works-and-onboarding.md
docs/ui/08-scene-toolbar-and-control-states.md
docs/ui/10-tracer-interaction-affordance.md
docs/architecture/52-historical-path-probe-architecture.md
docs/architecture/62-trajectory-tilting-explorer-v1.md
```

---

## 1. Purpose

First-time operators need a short **User Guide** that answers
how to press the live controls:

```text
Which environment is a good first choice?
How do I release a tracer?
What is the difference between Confirm, Clear tracers,
  Reset, and Reset View?
How do I inspect an exact historical sample?
What does Analysis T1 color mean, and what does it not mean?
When is a diagnostic unavailable?
```

Tone: practical manual. Conceptual model stays in How It
Works (`12`). Vocabulary stays in Glossary.

---

## 2. Current fact (live App)

```text
surface              shared overlay/modal over the current page
owner                App UI navigation (userGuideOpen)
entry                landing button; Guided and Explore header
close                returns to the same surface that opened it
lab on open          preserved
user paused          unchanged
viewport while open  paused || howItWorksOpen || glossaryOpen
                     || userGuideOpen
exclusive            opening User Guide closes How It Works
                     and Glossary, and the reverse
```

User Guide is not a third laboratory mode.

---

## 3. Content contract

Readable prose lives in `src/app/userGuideContent.ts` and
`UserGuideSurface`. It names production controls only:

```text
Release tracer, Confirm, Cancel, Undo, Redo
Pause, Resume, Speed, Reset, Clear tracers
Follow, Focus sample, Reset View, Grid, Hodograph
Inspector CURRENT vs HISTORICAL PATH SAMPLE
Analysis T1, mechanism glyph, What-if geometry
FULL_SUPPORT, BOUNDARY_CONDITIONED, OUT_OF_DOMAIN,
  COLUMN_UNAVAILABLE
```

There is no Add button and no Play button in production.
Goshen is recommended as a first environment because it has
Source and Analysis. Moore may appear as one
COLUMN_UNAVAILABLE example; the manual is not a Moore-only
document.

---

## 4. Ownership

`userGuideOpen: boolean` belongs to App/UI navigation. User
Guide does not own lab, Simulation, selection, Environment,
camera, or user paused.

---

## 5. Anti-claims

```text
User Guide is not How It Works.
User Guide is not Glossary.
User Guide does not write Simulation or user paused.
User Guide is not a third laboratory mode.
θ what-if does not change the observed atmosphere and does
  not restart the simulation.
Analysis T1 color is not parcel spin-up.
```
