# Storm-Relative Wind Overlay (v1)

## 1. Purpose

This document defines the first storm-relative wind vector overlay on the
ground-relative hodograph panel.

It draws a single velocity-space arrow from storm motion `C` to one selected
ground-relative hodograph knot as a visual representation of the horizontal
storm-relative wind `V_sr,h`.

Related documents:

    docs/ui/01-hodograph-panel.md
    docs/ui/02-storm-motion-overlay.md
    docs/physics/07-storm-relative-wind.md

The overlay answers:

    For one selected height knot, what does the horizontal storm-relative wind
    look like as a vector from C to wind(h) on the hodograph?

It does not rewrite hodograph points into a storm-relative frame and does not
turn the panel into a physics calculator.

---

## 2. Scope

In v1 this overlay shows only:

- an optional selected knot height;
- one SVG arrow `C → wind(h)` when selection is valid;
- label `V_sr`;
- a light visual highlight of the selected knot;
- the same ground-relative axes and equal-aspect transform as documents 01–02.

Out of scope for v1:

- streamwise / crosswise decomposition
  (see `docs/ui/06-streamwise-crosswise-vorticity-overlay.md`);
- horizontal vorticity overlays
  (see `docs/ui/04-horizontal-vorticity-overlay.md`);
- SRH signed-area fill;
- drag / edit of `C`;
- interactive height picker;
- multiple simultaneous `V_sr` arrows;
- non-knot / interpolated selected heights;
- 3D linking;
- Bunkers;
- physics API changes.

---

## 3. Relationship to prior UI and physics

Base path remains ground-relative:

    points = hodographPoints(profile)

Storm motion remains a separate overlay:

    stormMotion?: StormMotion

from document 02.

Physics definition (document 07):

    V_sr = V_env - C

Horizontal components in velocity space:

    V_sr.eastward  = wind.eastward  - C.eastward
    V_sr.northward = wind.northward - C.northward

On the hodograph, that horizontal difference is exactly the displacement from
point `C` to the ground-relative wind point at the selected height.

`StormRelativeWind.vertical` does not participate in this 2D overlay.

---

## 4. Props contract

Minimal panel props for this slice:

    interface HodographPanelProps {
      points: HodographPoint[];
      stormMotion?: StormMotion;
      selectedHeight?: number;
    }

Rules:

- `selectedHeight` is optional;
- v1 selection is **exact knot height only**: the panel looks for a point in
  `points` with `point.height === selectedHeight`;
- no interpolated / off-knot selection in v1;
- the panel must not accept `EnvironmentalWindProfile`;
- the panel must not call `stormRelativeWind`, `sampleAtHeight`, or
  `hodographPointAtHeight`.

### 4.1 When the vector is drawn

Draw the `V_sr` arrow only when all of the following hold:

1. `stormMotion` is provided;
2. `selectedHeight` is provided;
3. some `points[i]` has `height === selectedHeight` (exact match).

### 4.2 No matching knot

If `selectedHeight` does not match any knot:

- do **not** draw the vector overlay;
- do **not** warn;
- do **not** throw;
- silent absence of the overlay is the v1 contract.

Missing `stormMotion` and/or missing `selectedHeight` likewise yield no vector.

---

## 5. Geometry

### 5.1 Arrow endpoints

When the overlay is active:

    start = (stormMotion.eastward, stormMotion.northward)   // C
    end   = (selectedPoint.eastward, selectedPoint.northward)

`selectedPoint` is the matching ground-relative `HodographPoint`.

Both endpoints are mapped with the existing equal-aspect transform:

    velocityToScreen(...)

### 5.2 Correspondence to horizontal `V_sr`

In velocity space:

    end.eastward  - start.eastward  = V_sr.eastward
    end.northward - start.northward = V_sr.northward

That identity is the meaning of the arrow.

`StormRelativeWind.vertical` is ignored by the overlay.

### 5.3 What the panel must not do

The panel:

- does not call `stormRelativeWind`;
- does not recompute storm-relative physics;
- does not rewrite `points` into `V_env - C`;
- does not use vertical wind in the 2D drawing.

App / composition may call `stormRelativeWind` for demo documentation or
tests. It must not add a runtime assert in the UI render path. Correctness of
`end - start == horizontal V_sr` is fixed by tests.

---

## 6. Drawing

SVG contents for the active overlay:

1. line (or equivalent path) from screen(`C`) to screen(selected knot);
2. arrowhead at the **end** (selected wind point), oriented in screen space;
3. label text `V_sr` near the segment;
4. light highlight of the selected knot marker (knots remain circles; `C`
   remains the distinct storm-motion marker from document 02).

Arrowhead implementation may use a small end polygon or an SVG marker. Prefer
a simple explicit polygon in v1 if that keeps geometry easier to reason about.

Autoscale remains:

    (0, 0) ∪ points ∪ C

No extra domain expansion for arrow thickness or arrowhead size: both
endpoints are already covered by `C` and the selected knot.

---

## 7. Demo fixture

Demo selection:

    selectedHeight = 0   // meters, exact knot

Existing demo storm motion and surface wind:

    C         = (10, -10) m/s
    wind(0 m) = (10,   0) m/s

Therefore horizontal storm-relative wind:

    V_sr,h = (0, +10) m/s

Composition:

1. build demo profile → `hodographPoints(profile)`;
2. pass `stormMotion = C` and `selectedHeight = 0`;
3. optionally compute `stormRelativeWind` outside the panel for tests /
   comments only — not as a render-time assert.

Expected visual: arrow straight upward from `C` to the `0 m` knot in the
usual east-right / north-up hodograph view.

---

## 8. Testing

Prefer pure geometry / composition tests over DOM cosmetics.

Required checks:

- with demo values, `stormRelativeWind(wind0, C)` yields
  `{ eastward: 0, northward: 10, vertical: 0 }`;
- velocity-space invariant:
  `end - start == (V_sr.eastward, V_sr.northward)`;
- under the equal-aspect transform, the demo arrow is vertical upward in
  screen space (`ΔscreenX ≈ 0`, end above start);
- when `selectedHeight` matches no knot, no vector overlay is produced
  (silent);
- hodograph point components remain ground-relative when the overlay is
  shown.

Do not require:

- runtime UI asserts;
- pixel-perfect arrowhead snapshots;
- streamwise / SRH / vorticity tests;
- physics API changes.

---

## 9. Implementation slice contents

This document's implementation slice includes:

- optional `selectedHeight` on `HodographPanel`;
- exact-knot lookup; silent no-vector on miss;
- SVG arrow `C → selected knot` + label `V_sr` + light knot highlight;
- demo `selectedHeight = 0` with existing `C = (10, -10)`;
- focused tests above;
- micro-pointer updates from document 02.

It excludes physics API changes and all v1 out-of-scope items in §2.

---

## 10. Core lesson

The `V_sr` overlay is a geometric reading of horizontal storm-relative wind:

    arrow = C → ground-relative wind(h)

The hodograph path stays ground-relative.

`C` stays a separate overlay.

Selection in v1 is exact knot height only; no match means no vector.

The panel draws; it does not call `stormRelativeWind`.
Vertical storm-relative wind is outside this 2D figure.

Finite-layer horizontal vorticity on a selected hodograph segment is defined
separately in:

    docs/ui/04-horizontal-vorticity-overlay.md

Overlay show/hide checkboxes are defined in:

    docs/ui/05-hodograph-overlay-controls.md
