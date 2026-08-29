# Hodograph Panel (v1)

## 1. Purpose

This document defines the first frontend hodograph panel in Supercell Explorer.

The panel renders a ground-relative hodograph polyline in 2D velocity space from
already-derived `HodographPoint[]` values produced by the physics hodograph
API:

    docs/physics/10-hodograph-basics.md

It answers:

    How do we draw the ground-relative environmental wind path in
    (eastward, northward) velocity space in a 2D UI panel?

It does not redefine atmospheric physics, sampling, or hodograph geometry.

---

## 2. Scope

In v1 the panel shows only:

- a 2D hodograph panel;
- eastward axis;
- northward axis;
- polyline through knot points;
- knot markers;
- height labels in meters.

Out of scope for v1:

- storm motion `C` (see `docs/ui/02-storm-motion-overlay.md`);
- storm-relative vectors (see `docs/ui/03-storm-relative-wind-overlay.md`);
- shear / vorticity overlays
  (see `docs/ui/04-horizontal-vorticity-overlay.md`);
- SRH signed-area overlay;
- overlay visibility controls
  (see `docs/ui/05-hodograph-overlay-controls.md`);
- drag / edit;
- linked 3D highlighting;
- animation;
- Bunkers;
- operational sounding UI;
- `ResizeObserver` or other browser measurement logic;
- complex nice-tick frameworks;
- Canvas or Three.js drawing for this panel.

---

## 3. Stack and placement

This vertical slice introduces the first UI shell and the panel together:

- Vite
- React
- TypeScript
- SVG for the hodograph drawing surface

Placement intent:

    src/ui/hodograph/
      HodographPanel.tsx
      hodographViewTransform.ts   // pure view mapping helpers

    src/app/
      demo fixture + composition that calls physics hodographPoints

Architectural rules:

- Physics defines atmospheric state; rendering/UI observes it.
- UI may consume physics hodograph types and functions at the composition
  boundary.
- Physics must not import UI, React, Vite, or SVG code.

Three.js remains reserved for future world-space 3D rendering. It is not the
drawing backend for this 2D velocity-space panel.

---

## 4. Data contract

### 4.1 Panel input

`HodographPanel` accepts:

    points: HodographPoint[]

where each point is:

    {
      height: number;      // m, metadata / label only
      eastward: number;    // m/s, velocity-space X
      northward: number;   // m/s, velocity-space Y
    }

from:

    src/physics/environment/hodograph.ts

### 4.2 Points already come from the physics API

The panel does not construct hodograph geometry.

Composition / app code must obtain points via the physics API, for example:

    points = hodographPoints(profile)

The panel assumes:

- points are already ground-relative knot points;
- ascending height order is provided by the physics API contract;
- `(eastward, northward)` are atmospheric velocity-space coordinates.

### 4.3 Panel does not know `EnvironmentalWindProfile`

`HodographPanel` must not:

- accept `EnvironmentalWindProfile` as a prop;
- import or sample the profile;
- call `sampleAtHeight`, `levelHeights`, or other profile methods;
- invent intermediate points, smooth the path, or resample heights.

If the app needs a different profile, it rebuilds `HodographPoint[]` outside
the panel and passes the new array in.

---

## 5. Velocity-space geometry on screen

### 5.1 Axes meaning

Hodograph plane:

    +eastward  → right on screen
    +northward → up on screen

`height` is not a geometric axis. It is used only for ordering inherited from
physics and for knot labels.

### 5.2 Screen Y inversion

Browser / SVG screen Y increases downward.

Therefore the view transform must invert northward:

    screenX = originScreenX + (eastward  - eastwardRef) * scale
    screenY = originScreenY - (northward - northwardRef) * scale

with `scale > 0`.

Invariants:

- increasing `eastward` increases `screenX`;
- increasing `northward` decreases `screenY` (northward appears upward);
- no world `Vec3` conversion participates;
- no `atmosphericVelocityToWorld` in this panel path.

### 5.3 Equal velocity aspect ratio

Equal aspect is mandatory:

    one screen pixel represents the same m/s on eastward and northward

Use a single positive `scale` (px / (m/s)) for both axes.

Do not stretch eastward and northward independently to fill the plot rectangle.
Letterboxing / pillarboxing inside the plot area is preferred over unequal
scaling.

### 5.4 Autoscale domain includes `(0, 0)`

The autoscaled velocity domain must include:

1. every input point's `(eastward, northward)`;
2. the velocity origin `(0, 0)`.

Conceptually:

    eMin = min(0, min(point.eastward))
    eMax = max(0, max(point.eastward))
    nMin = min(0, min(point.northward))
    nMax = max(0, max(point.northward))

then apply padding in velocity units before fitting with equal aspect.

Notes:

- including `(0, 0)` does **not** require the origin to be the visual center of
  the panel;
- the origin is simply guaranteed to lie inside the visible velocity domain;
- if all winds are in one quadrant, the origin may sit near an edge after
  equal-aspect fit;
- degenerate zero-span domains still need a deterministic minimum velocity
  span so `scale` stays finite.

---

## 6. SVG layout strategy (no measurement logic in v1)

v1 uses a fixed logical SVG `viewBox` plus CSS sizing.

Do not introduce `ResizeObserver`, `getBoundingClientRect` layout loops, or
other browser measurement logic in this slice unless a later document
explicitly requires them.

Recommended approach:

- choose a fixed logical drawing size (viewBox);
- reserve margins inside that viewBox for axis titles and labels;
- compute the equal-aspect plot mapping into the remaining plot rectangle;
- let CSS scale the SVG element responsively while preserving the logical
  coordinates.

Responsive behavior in v1 therefore means CSS sizing of a stable logical
drawing, not dynamic remeasurement-driven layout.

---

## 7. Drawn elements

### 7.1 Axes

Draw eastward and northward axes spanning the visible velocity domain (or a
clear subset consistent with ticks).

Axis titles:

    eastward (m/s)
    northward (m/s)

They sit next to the velocity axes — below the east tick
labels, left of the north tick labels — not at the viewBox
edge. They remain in plot-space so zoom/pan keeps them with
the axes.

### 7.2 Polyline

Connect knot points in the given array order with a single polyline in
velocity space after screen mapping.

Do not reorder points in the panel.

### 7.3 Knot markers

Short columns (`points.length <= 12`, including DEMO) draw
a marker at each mapped knot point.

Dense imported columns keep every knot on the polyline
(`§7.2`). Markers are a display subset only:

- the first knot;
- the last knot;
- the nearest existing knot to each pedagogical reference
  height that lies inside `[minHeight, maxHeight]`;
- the exact selected knot when `selectedHeight` matches a
  point height.

Reference heights (m):

    0, 1000, 2000, 3000, 4000, 6000, 8000, 10000, 12000

Equal distance chooses the smaller index. The panel does
not interpolate a marker at a missing height and does not
invent a synthetic knot.

The display subset is defined in
`docs/architecture/51-dense-observed-hodograph-display.md`.
It does not resample `EnvironmentalWindProfile` or
`HodographPoint[]`.

### 7.4 Height labels

Label each **displayed** marker with that knot's height in
meters only (`point.height`).

Examples:

    0 m
    1000 m
    2.4 m
    998.6 m

Do not substitute the pedagogical target string. Do not use
kilometers in v1 labels.

Short columns label every knot. Dense columns label only
the display subset from `§7.3`.

Height labels paint after the polyline, overlays, and knot
markers. They use a white halo so the meter strings stay
readable when the curve crosses a label. Label values and
offsets are unchanged.

---

## 8. Ticks

v1 uses minimal deterministic ticks.

Requirements:

- enough to read approximate velocity magnitude;
- deterministic from the autoscaled domain (same domain → same ticks);
- no elaborate nice-tick framework, locale formatting system, or adaptive
  density engine in this slice.

Exact tick count / step algorithm may be chosen during implementation as long
as it stays simple, deterministic, and documented in code comments or a short
helper contract.

---

## 9. Demo fixture

The first app demo uses a hardcoded fixture profile conceptually equivalent
to:

    height = 0 m     eastward = 10 m/s   northward = 0 m/s
    height = 1000 m  eastward = 20 m/s   northward = 10 m/s
    height = 2000 m  eastward = 20 m/s   northward = 20 m/s

Composition:

1. build the corresponding `EnvironmentalWindProfile` in `src/app/`;
2. call `hodographPoints(profile)`;
3. pass the resulting `HodographPoint[]` into `HodographPanel`.

The panel itself still receives only points, not the profile.

---

## 10. Separation from physics and future overlays

Keep these layers distinct:

1. Atmospheric source

       EnvironmentalWindProfile

2. Hodograph data representation

       hodographPoints(profile) -> HodographPoint[]

3. Derived diagnostics

       shear, vorticity, storm-relative wind, SRH
       (not drawn in this panel v1)

4. UI panel

       HodographPanel(points)

Base panel v1 explicitly excludes overlays defined elsewhere:

- `StormMotion` / point `C`
  → `docs/ui/02-storm-motion-overlay.md`;
- storm-relative vectors from `C` to wind;
- shear or vorticity overlays on segments;
- SRH area fills;
- interactions that edit physics state;
- linking markers to the future 3D world view.

Those may become later UI overlays that still consume physics diagnostics
outside this panel's base contract.

---

## 11. Testing

Prefer tests of pure view-transform helpers over DOM cosmetics.

Required contract checks:

- increasing eastward increases screen X;
- increasing northward decreases screen Y;
- equal aspect: equal velocity deltas map to equal pixel lengths;
- autoscaled domain includes `(0, 0)` and all point velocities;
- polyline vertex order matches input point order;
- dense polyline vertex count matches input point count;
- short columns draw a marker and height label at every knot;
- dense columns draw markers and labels only on the display
  subset from `§7.3`;
- height labels are derived from the displayed knot's
  `point.height` in meters.

Do not require:

- pixel-perfect visual snapshots as the primary contract;
- physics knot-matching tests already owned by
  `src/physics/environment/hodograph.test.ts`;
- browser e2e for this first slice.

---

## 12. Implementation slice contents

This document's implementation slice includes:

- Vite + React + TypeScript app bootstrap;
- `docs/ui/01-hodograph-panel.md` as UI source of truth for the panel;
- pure velocity→screen mapping helper(s);
- `HodographPanel` SVG: axes, polyline, markers, meter height labels;
- app demo fixture → `hodographPoints` → panel;
- focused view-transform tests.

It excludes changes to the physics hodograph API and all v1 out-of-scope
overlays listed above.

---

## 13. Core lesson

The panel draws a physics-derived ground-relative velocity-space path.

`(eastward, northward)` are the drawn coordinates.

Screen Y is inverted so northward appears upward.

Equal m/s-per-pixel scaling is mandatory.

The visible domain always includes the velocity origin `(0, 0)`, without
forcing that origin to be centered.

The panel observes `HodographPoint[]`. It does not own
`EnvironmentalWindProfile` and does not invent storm-relative or diagnostic
overlays in v1.
