# Laboratory Visual Chrome

**Status:** UI SoT / Slice V2 COMPLETE
**Scope:** visual application of the V1 foundation to Guided and
Explore laboratory chrome. Not a UX redesign. Not a layout or
ownership rewrite. Not a rendering or diagnostic-color change.
**Physics:** unchanged. This file does not modify
`src/physics/**`, sounding semantics, storm fields, or
simulation runtime.
**Implementation:** Slice V2 COMPLETE in production `src/**`.

Predecessors (still binding; not rewritten):

```text
docs/ui/07-app-navigation-and-mode-entry.md
docs/ui/08-scene-toolbar-and-control-states.md
docs/ui/11-floating-hodograph-workspace.md
docs/ui/12-how-it-works-and-onboarding.md
docs/ui/13-explore-tracer-authoring-history.md
docs/ui/14-visual-design-foundation.md
```

`07`–`13` remain the functional UI SoT. `14` remains the
token / primitive vocabulary. This file records how that
vocabulary is applied to the laboratory.

---

## 1. Purpose

The laboratory must read as one scientific workstation:

```text
1. 3D scientific viewport
2. scene / experiment controls
3. runtime / release controls
4. Inspector / diagnostics
5. explanatory / supporting text
```

Chrome is compact. Surfaces are not twelve identical cards.

Rejected:

```text
generic SaaS dashboard of boxed groups
sci-fi HUD
dark dashboard everywhere
weather-radar rainbow chrome
```

---

## 2. Visual hierarchy

| Role | Surfaces |
| --- | --- |
| Primary visual surface | 3D viewport (`#1a2332`, unchanged) |
| Scene chrome | `.scene-toolbar.ui-scene-chrome` attached to the viewport |
| Control surface | `.laboratory-toolbar` (Guided runtime + experiment; Explore Release / Runtime / View as one panel with internal bands) |
| Information surface | Guided experiment explanation; Inspector; Point diagnostics |
| Floating surface | Hodograph workspace (`.ui-floating-panel`) |
| Global tools | Environment, How It Works (header, secondary) |

---

## 3. Header / mode identity

Semantics unchanged (`07`):

```text
Supercell  /  Guided | Explore
subtitle
Environment + How It Works (right)
```

Visual treatment:

- quieter page title (not 1.5rem display);
- `Supercell` is a secondary underlined home control;
- `/` is muted;
- current mode is primary identity, not a switch;
- subtitle uses secondary type;
- Environment is a noticeable header tool (accent fill/border);
- How It Works is `.ui-button--subtle`.

There is no in-laboratory Guided ↔ Explore toggle.

---

## 4. Button hierarchy

| Treatment | Actions |
| --- | --- |
| primary | Explore **Release tracer** (the local workflow action) |
| secondary (default `.ui-button`) | Pause, Resume, Reset, Confirm, Clear tracers, Reset View |
| subtle | How It Works, Undo, Redo, Cancel, hodograph − / + / Reset / Close |
| header tool | Environment (accent, not the local Release CTA) |
| toggle | Grid, Flow comets, Eulerian — diagnostic, Highlight Off, Follow, Release tracer while armed (`aria-pressed`) |

Selected toggle is not a primary CTA. When Release tracer is
pressed, selected/toggle wash replaces accent fill.

Pause is not primary. There is at most one accent-filled
action in the Explore Release band.

---

## 5. Guided

Runtime, speed, and experiment selection share one compact
`.laboratory-toolbar` row. Experiment sits on the trailing
edge with a compact `<select>`. A vertical divider and type
separate playback from the experiment control. Ownership is
unchanged.

The explanation block is an information surface
(`.ui-panel.ui-panel--info`):

```text
experiment title
prescribed-laboratory honesty
Observe
Demonstrates
Does not mean
```

Copy is unchanged. `Does not mean` is an epistemic guardrail:
subtle inset background and a restrained accent edge. It is
not an error or danger alert. No red warning treatment.

---

## 6. Explore action rail

One outer `.laboratory-toolbar--explore`. Internal
RELEASE / RUNTIME / VIEW bands stay as `control-band` sections
with uppercase instrument labels. No extra card per band.

The Explore laboratory heading shows the current environment
label under **Storm-relative laboratory**. That is a readout
of App `exploreEnvironmentIdentity`, not a second switch.

Release is the primary workflow area. Undo / Redo are
compact subtle controls with a visible disabled state.

Explore Runtime stacks Speed as a heading, then 1× / 5× /
10× / 20× on the next row, so the radios do not wrap around
the label in the narrow rail.

---

## 7. SceneToolbar treatment

**Chosen: B — dark / intermediate scene chrome.**

Light attached form-strip (A) left the toolbar looking like
another page card. Dark chrome using
`--color-bg-scene-chrome` (`#243044`) reads as viewport chrome
without becoming a sci-fi HUD.

Contract:

```text
background          --color-bg-scene-chrome
text                --color-text-on-dark
helper copy         --color-text-on-dark-muted
control borders     --color-border-on-dark (not pure white)
selected toggle     --color-selected-on-dark + --color-focus-on-dark
focus-visible       --color-focus-on-dark
native select       dark color-scheme, readable on chrome
scene background     #1a2332 unchanged
```

Toolbar and viewport share a dark outer edge and a restrained
top radius on the toolbar / bottom radius on the viewport.
No heavy drop shadow around the scene.

Explore SceneToolbar is airflow presentation only. Grid is
on-viewport overlay chrome (top-left), not a toolbar child.
Airflow view, highlight, operand, depth cue, and disclosure
copy keep existing semantics.

---

## 8. Inspector / Point diagnostics

Related information panels: section heading plus a surface
body. Empty copy (“Select a tracer…”) is secondary, not
disabled-gray.

Populated rows use `--font-mono` for numeric readouts.
Historical sample-mode labels use UI accent, not a
diagnostic vector color.

Behavior unchanged.

---

## 9. Floating Hodograph chrome

Only window chrome is restyled:

```text
.ui-floating-panel
raised fill
--shadow-floating
--radius-lg
header bar with grab cursor
subtle Environment / overlays groups (not UA fieldset boxes)
```

Unchanged: drag, resize, zoom, pan, plot transforms, overlay
semantics, Environment ownership, SVG scientific encoding.

---

## 10. Responsive limitations

V2 does not redesign laboratory layout.

Existing constraints remain:

```text
Explore three-band shell is a wide-desktop target (~1240px+)
below 840px Explore unlocks page scroll (pre-V2)
narrow viewports wrap control rows; they do not become
  a mobile app
hodograph is a floating window, not a stacked mobile sheet
```

V2 smoke-checks desktop and ~1280px. Architectural mobile
layout is a future UX candidate, not this slice.

---

## 11. Scientific color boundary

Unchanged from `14` §8. Application chrome must not adopt
hodograph / tracer / airflow encodings as UI accents.

Scene background remains `#1a2332` in `.tracer-viewport`.
`--color-bg-scene` records that value and is not a license
to restyle rendering.

---

## 12. Foundation amendments from V2

`14` gains:

```text
.ui-button--primary
--color-text-on-dark-muted
--color-border-on-dark
--color-focus-on-dark
--color-interactive-hover-on-dark
--color-selected-on-dark
.ui-scene-chrome is dark (V2 choice B)
laboratory :root uses --font-sans / --color-bg-app
```

---

## 13. Implementation status

```text
laboratory header / identity          COMPLETE
Guided runtime + explanation         COMPLETE
Explore action rail                  COMPLETE
Inspector / Point diagnostics        COMPLETE
SceneToolbar dark chrome             COMPLETE
viewport attachment                  COMPLETE
floating hodograph chrome            COMPLETE
scientific / rendering palette       UNCHANGED
laboratory layout architecture        UNCHANGED
```

---

## 14. Anti-claims

```text
This SoT is not a navigation or ownership rewrite.
This SoT does not change Pause / Reset / Release / Follow
  / Grid / airflow / Highlight semantics.
SceneToolbar dark chrome is not a sci-fi HUD.
Does not mean is not an error state.
UI accent is not a diagnostic color.
```
