# Floating Hodograph Workspace

**Status:** UI SoT / Slice 5 COMPLETE; Slice 5.1 COMPLETE
**Scope:** one reusable hodograph workspace for Guided and
Explore: draggable, resizable, velocity-space zoom, pan, reset
view, clamped so a header grab strip stays reachable. Not a
sounding editor.
**Physics:** unchanged. Input remains `HodographPoint[]` from
`hodographPoints`. Velocity-space invariants from
`docs/ui/01-hodograph-panel.md` remain binding.
**Implementation:** Slice 5 COMPLETE; Slice 5.1 interaction
fixes COMPLETE. This document records the live workspace
contract.

Predecessors (not rewritten):

```text
docs/ui/01-hodograph-panel.md
docs/ui/05-hodograph-overlay-controls.md
docs/physics/10-hodograph-basics.md
docs/architecture/40-v1-m1-m3-ux-ui-consolidation-architecture.md
docs/architecture/42-post-41-3-explore-airflow-and-environment-architecture.md
docs/architecture/51-dense-observed-hodograph-display.md
docs/ui/07-app-navigation-and-mode-entry.md
```

`01`–`06` stay historical overlay/panel SoTs. This file is the
**workspace chrome** around the existing panel.

---

## 1. Purpose

Guided and Explore share one hodograph **workspace
concept**: a floating, inspectable velocity-space plot the
user can place, size, and zoom without editing the sounding.

Two different states stay distinct:

| State | Meaning | Owner |
| --- | --- | --- |
| **Panel geometry** | CSS `x, y, width, height` of the window | App UI session |
| **Plot view** | visible region of (eastward, northward) | App UI session |

Panel resize is not plot zoom. Plot zoom is not panel resize.

---

## 2. Shared implementation

```text
HodographPanel                 drawing (existing) + plot pan/wheel
HodographOverlayControls       visibility (existing)
HodographWorkspace             shared chrome: header drag, resize,
                               − / + / Reset, clamp
EnvironmentSurface             one host for both modes:
                                 Guided: hodograph + overlays
                                 Explore: heading names current identity
                                   + honesty copy; no identity radios
ExploreEnvironmentSelector     Explore header identity switch
App                            owns geometry + plotView session state
```

There is no `GuidedFloatingHodograph` / `ExploreFloatingHodograph`.
Both modes mount the same `environmentSurface` over
`.workbench__hodograph-host` (the tracer viewport box).

Guided no longer uses `workbench__column--hodograph`. The
laboratory grid is the environment-closed layout (viewport +
inspector). Open/close remains the Hodograph affordance
(`07`, `42`; `EnvironmentAffordance` internally).

Closing uses `hidden` and does not destroy geometry, plot
view, overlay flags, or `HodographPoint[]`. Reopen in the same
session restores last geometry and plot view. Persistence
across reloads is out of scope.

---

## 3. Binding invariants from `01` (unchanged)

```text
+eastward  → right
+northward → up (screen Y inverted)
one scale  → equal m/s per pixel on both axes
domain includes (0, 0) and all knot velocities (autoscale base)
no world Vec3 in this path
no atmosphericVelocityToWorld in this path
panel consumes HodographPoint[], not EnvironmentalWindProfile
```

Dense-column marker subset remains `51` / `01` §7.3.

The SVG keeps logical `viewBox` 640×480. Panel CSS size
changes the drawing area; the SVG scales with
`preserveAspectRatio="xMidYMid meet"` (letterboxing allowed).
Eastward and northward are never stretched independently.

---

## 4. Panel geometry contract

Owner: App UI session (`hodographPanelGeometry`). Not physics,
not Environment, not `HodographPoint[]`, not Simulation.

```text
initial   x=12, y=12, width=880, height=650 relative to the
          laboratory viewport host, then adopted to
          position:fixed window coordinates on first layout
          (desktop open size; clamp shrinks to the window)
min       width 360, height 280
max       browser window (no smaller product cap)
drag      header only; buttons / inputs / fieldsets excluded
resize    east edge, south edge, and south-east corner
bounds    browser window, not the 3D column
          the panel may hang off any edge;
          at least HODOGRAPH_HEADER_GRAB_PX (44) of the
          header stays reachable
          minY = GRAB - HODOGRAPH_HEADER_HEIGHT_PX (52)
```

Window resize re-clamps geometry against the browser
window. Dragging the header changes only `{x, y}`. Resizing
changes only `{width, height}` (then clamp). Neither writes
plot view. Reset plot view does not reset panel geometry.

---

## 5. Plot view contract

Owner: App UI session (`hodographPlotView`). Autoscale remains
`buildViewTransform` (padding + equal aspect + origin). Zoom/pan
is a **single SVG plot-space camera** (`hodographPlotSpaceCamera`)
applied to one `<g class="hodograph-panel__plot-space">`.
That camera is position-equivalent to `applyHodographPlotView`
and also scales strokes, fonts, markers, and diagnostic glyphs.

```text
plotView = { userScale, panEastward, panNorthward }
default  userScale=1, pan=0  → identity (v1 autoscale)
initial  includes all required knots, (0, 0), equal aspect,
         existing padding contract
zoom     userScale ∈ [1, 12]; 0 / Inf / NaN clamp to 1
         buttons ± zoom about the current view center
         wheel over the SVG zooms about the pointer velocity
         plot-space content (geometry + annotations + glyphs)
         scales together
pan      pointer drag on the SVG; eastward/northward offsets (m/s)
reset    DEFAULT_HODOGRAPH_PLOT_VIEW only
```

Reset does **not** move the panel, change size, Environment,
overlay checkboxes, sounding, or selection.

`HodographPanel` still takes `points: HodographPoint[]`.
Zoom/pan do not mutate that array.

---

## 6. Interaction precedence

```text
header buttons / Close     click; never starts panel drag
header empty surface       drag panel
resize edges / corner     resize panel
SVG plot pointer drag      pan plot view
SVG plot wheel             zoom plot view (preventDefault on the SVG)
wheel outside the SVG      ordinary page / chrome behavior
SVG marker                 redraws in the current transform;
                           not a sounding edit
```

Header drag and plot pan are different surfaces. Pointer
capture/release are used on header, resize handle, and SVG.

---

## 7. Explore environment switch

```text
new environment  → plot view reset to autoscale of new points
                 → panel geometry kept
                 → overlay visibility kept
                 → Environment identity updates points as today
                 → Explore heading readout follows the same identity
```

Mode entry (Guided ↔ Explore) also resets plot view to
autoscale of the new laboratory data and keeps panel
geometry.

---

## 8. Layer model

### Panel-space (does not follow plot pan/zoom)

```text
window frame
header
− / + / Reset / Close
Environment identity + honesty copy
overlay checkboxes (Demo / Guided only)
resize handle
SVG background fill
```

### Plot-space (one SVG camera)

```text
eastward / northward axes
axis titles (next to the axes, not the viewBox edge)
ticks and tick labels
hodograph polyline
knot markers and height labels
origin
storm motion C
storm-relative V_sr
ω_h, ω_s, ω_c glyphs, arrowheads, and labels
```

Plot pan uses `user-select: none` on the interactive SVG and
`preventDefault` + pointer capture so browser text selection
does not start.

---

## 9. Overlay and selection compatibility

Storm motion C, V_sr, ω_h, and streamwise/crosswise glyphs
live in the same plot-space `<g>` as the polyline. They share
the autoscale mapping and the one SVG camera. Diagnostic
values are unchanged; only presentation scale follows zoom.

Selected height is unchanged by zoom/pan. The marker is
redrawn in the plot-space camera. Selection semantics are not
extended in this slice.

`HodographOverlayControls` are Demo / Guided teaching
controls. They mount only when Explore honesty copy is
absent (Guided, or Explore Demo prescribed). Observed
Explore environments omit the checkbox fieldset: DEMO
`[0, 1000]` overlay recipes are not applied, so those
toggles have no action. Prescribed DEMO C may still draw
as a plot marker; it is not an observed-storm diagnostic
control set. Restoring observed overlays is BL-011, not
this workspace contract.

---

## 10. Ownership

| Concern | Owner | Workspace role |
| --- | --- | --- |
| `HodographPoint[]` | composition via physics API | observe |
| Overlay payloads | composition / physics | observe |
| Overlay visibility | App `overlayVisibility` | existing |
| Explore environment identity | App | radios in the workspace; Explore heading readout observes |
| Panel x/y/w/h | App UI session | Slice 5 |
| Plot zoom/pan | App UI session | Slice 5 |
| Sounding knots | physics profile | **not editable here** |

The workspace does not call `sampleAtHeight`, mutate profiles,
or write storm motion.

---

## 11. Accessibility

Header − / + / Reset / Close are real `button` elements with
accessible names. Existing `:focus-visible` styles apply.
Full keyboard window-manager resize is out of scope.

---

## 12. Out of scope

```text
sounding editing / knot drag
adding or removing levels
interpolation
Bunkers / SRH editors
localStorage / reload persistence
docking / multiple windows / fullscreen
image export
physics or Environment identity changes beyond data refresh
How It Works (docs/ui/12)
```

---

## 13. Anti-claims

```text
This SoT does not make the hodograph a sounding editor.
This SoT does not allow unequal axis scales.
This SoT does not convert world Vec3 in the panel.
This SoT does not duplicate Guided and Explore plots.
This SoT does not reopen overlay physics.
This SoT does not persist window layout across reloads.
```
