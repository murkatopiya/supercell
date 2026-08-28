# Floating Hodograph Workspace

**Status:** UI SoT / NOT STARTED
**Scope:** one reusable hodograph workspace for Guided and
Explore: draggable, resizable, velocity-space zoom, reset
view, clamped to the viewport. Not a sounding editor.
**Physics:** unchanged. Input remains `HodographPoint[]` from
`hodographPoints`. Velocity-space invariants from
`docs/ui/01-hodograph-panel.md` remain binding.
**Implementation:** NOT STARTED. This document does not include
that implementation.

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

`01`–`06` stay historical overlay/panel SoTs. This file adds
**workspace chrome** around the existing panel.

---

## 1. Purpose

Guided and Explore must share one hodograph **workspace
concept**: a floating, inspectable velocity-space plot the
user can place, size, and zoom without editing the sounding.

Two different states must stay distinct:

| State | Meaning |
| --- | --- |
| **Panel resize** | UI window size in CSS pixels |
| **Hodograph zoom** | visible region of (eastward, northward) velocity space |

---

## 2. Current fact (live App)

```text
HodographPanel           SVG, fixed viewBox 640×480
View transform           autoscale + equal aspect (01)
ResizeObserver           forbidden in 01 for v1 panel internals
EnvironmentSurface       Guided: column; Explore: overlay
                         Close + overlay Escape
                         width tied to VIEWBOX_WIDTH
Drag / user zoom         none
Overlay checkboxes       UI-owned visibility (05)
Explore identity radios  inside EnvironmentSurface
```

`40` / `42` already moved the plot to on-demand Environment.
This pass does not put the hodograph back in a permanent left
column. It upgrades the Environment plot into a floating
workspace.

---

## 3. Scope

In this SoT:

- shared workspace chrome (Guided + Explore);
- drag to move;
- resize the panel;
- zoom (and pan, if needed) inside the plot;
- reset view (velocity-space camera, not panel geometry);
- min/max panel sizes;
- clamp so the window cannot be lost off-canvas.

Out of scope:

- editing knots, drag-to-change wind, Bunkers, new overlays;
- changing `HodographPoint` or overlay physics payloads;
- unequal axis scales;
- a second Guided-only plot implementation;
- making Environment a top-level mode (`07`);
- `01` overlay geometry (C, V_sr, ω_h, streamwise/crosswise).

---

## 4. Binding invariants from `01` (unchanged)

The workspace may measure its plot rectangle (including with
`ResizeObserver` on the **chrome**). That measurement is
allowed here because `01` §6 forbade it only for the original
v1 slice, not forever.

Still mandatory inside the plot:

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

Zoom is an extra view on top of that mapping. Zoom must not
stretch eastward independently of northward.

---

## 5. Two cameras

### 5.1 Panel layout state (UI window)

```text
position   CSS left/top (or equivalent) in the laboratory viewport
size       CSS width/height
```

Resize changes how large the SVG/plot is on screen. After
resize, **rebuild** the equal-aspect fit into the new plot
rectangle (same rule as `buildViewTransform`, new plot size).

Suggested bounds (implementation may tune with tests):

```text
min width    ≥ 360 px   plot remains readable
min height   ≥ 280 px
max          ≤ containing laboratory viewport
```

### 5.2 Plot view state (velocity space)

```text
userScale    multiplier on the autoscale scale, or equivalent
pan          eastward/northward offsets in m/s, optional
```

- zoom in: fewer m/s visible, still equal aspect;
- zoom out: more m/s visible; must not drop `(0, 0)` from the
  *data* autoscale contract when userScale returns to default;
- wheel / buttons / pinch are allowed; choose one obvious
  affordance in implementation.

**Reset view** restores default autoscale + identity zoom/pan.
It does **not** reset overlay checkboxes, environment
identity, or panel position/size.

A separate “reset panel” (position/size) is optional and not
required in the first slice if clamp already keeps the window
on screen.

---

## 6. Clamp / cannot lose the window

While dragging or after resize:

- at least a grab-sized strip of the header remains inside
  the visible laboratory viewport;
- the panel cannot be dragged to `left: -9999px` or similar.

This is UI geometry, not physics.

Explore overlay presentation today can cover the scene (`42`
risk). Floating + clamp must not steal the right observation
dock. Default position: over the viewport column, not over
Inspector.

---

## 7. Shared primitive

```text
HodographPanel                 drawing (existing)
HodographOverlayControls       visibility (existing)
EnvironmentSurface             mode-specific extras:
                                 Guided: no identity radios
                                 Explore: identity radios + honesty copy
HodographWorkspace chrome      NEW: drag, resize, zoom, reset view, clamp
```

Do not fork `HodographPanel`. Guided column vs Explore overlay
becomes two **hosts** of the same workspace, or one host used
in both modes. Prefer one host.

Open/close remains the Environment affordance (`07`, `42`).
Closing does not have to destroy workspace layout state;
reopening may restore last position/size/zoom. Persistence
across browser reloads is out of scope (`05` already deferred
`localStorage`).

---

## 8. Ownership

| Concern | Owner | Workspace role |
| --- | --- | --- |
| `HodographPoint[]` | composition via physics API | observe |
| Overlay payloads | composition / physics | observe |
| Overlay visibility | App `overlayVisibility` | existing |
| Explore environment identity | App | existing radios |
| Panel x/y/w/h | UI workspace state | new |
| Plot zoom/pan | UI workspace state | new |
| Sounding knots | physics profile | **not editable here** |

The workspace must not call `sampleAtHeight`, mutate profiles,
or write storm motion.

---

## 9. Interaction semantics

- drag: pointer on the workspace header, not on plot glyphs;
- resize: edges/corners of the chrome, not velocity-space
  handles on knots;
- zoom: plot interior (or dedicated controls), never a knot
  drag;
- clicking a knot does not become sounding edit.

If plot pointer events fight OrbitControls, the workspace is
an HTML overlay beside/over the canvas (already true for
Environment overlay). Do not attach hodograph drag to the
Three.js canvas.

---

## 10. Testing expectations

Reuse `hodographViewTransform` tests as the physical mapping
contract. Add:

- equal aspect still holds after panel resize;
- zoom uses one scale for both axes;
- reset view restores autoscale mapping, not overlay flags;
- clamp keeps a header fragment in the viewport;
- Guided and Explore render the same `HodographPanel` contract.

Do not retest physics knot generation.

---

## 11. Implementation slice boundary

This document’s implementation slice is **Slice 5**:

```text
shared floating workspace chrome
drag, resize, clamp
velocity-space zoom + reset view
preserve 01 equal-aspect and HodographPoint input
```

It excludes sounding edit and persistence.

Slice 5 is NOT STARTED.

`01` §6 “no ResizeObserver in v1” is **not** a permanent ban
on measuring the workspace chrome. Overlay draw rules in
`01`–`06` remain.

---

## 12. Anti-claims

```text
This SoT does not make the hodograph a sounding editor.
This SoT does not allow unequal axis scales.
This SoT does not convert world Vec3 in the panel.
This SoT does not duplicate Guided and Explore plots.
This SoT does not reopen overlay physics.
```
