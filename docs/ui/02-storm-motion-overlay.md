# Storm Motion Overlay (v1)

## 1. Purpose

This document defines the first storm-motion overlay on the ground-relative
hodograph panel.

It adds an optional marker for storm motion `C` in the same
`(eastward, northward)` velocity plane used by the base panel:

    docs/ui/01-hodograph-panel.md

Storm motion semantics come from:

    docs/physics/07-storm-relative-wind.md

The overlay answers:

    Where is the supplied storm motion C in ground-relative velocity space
    on the existing hodograph panel?

It does not rewrite hodograph points into storm-relative coordinates and does
not compute storm motion.

---

## 2. Scope

In v1 this overlay shows only:

- an optional `StormMotion` input on `HodographPanel`;
- a marker for `C` in hodograph velocity space;
- a text label `C`;
- autoscale expansion so `C` is visible together with `(0, 0)` and the
  hodograph points.

Out of scope for v1:

- storm-relative rewriting of `HodographPoint[]`;
- `V_sr` vectors from `C` to wind
  (see `docs/ui/03-storm-relative-wind-overlay.md`);
- SRH signed-area fill;
- shear / vorticity overlays;
- drag / edit of `C`;
- Bunkers or any storm-motion estimator inside the panel;
- mutating physics state;
- linked 3D highlighting;
- a legend or design-system styling pass;
- overlay visibility controls
  (see `docs/ui/05-hodograph-overlay-controls.md`);
- physics API changes.

---

## 3. Relationship to the base panel

The base panel remains ground-relative:

    points = hodographPoints(profile)

`C` is a separate overlay drawn in the same velocity plane with the same axes
and the same equal-aspect view transform.

Architectural dependency:

    HodographPoint[]                 // ground-relative path
    StormMotion C                    // optional overlay input
            ↓
    HodographPanel

The panel still does not accept `EnvironmentalWindProfile`.

Composition owns both the points and any `StormMotion` value.

---

## 4. Props contract

Minimal panel props:

    interface HodographPanelProps {
      points: HodographPoint[];
      stormMotion?: StormMotion;
    }

Rules:

- `points` remain required and ground-relative;
- `stormMotion` is optional;
- when `stormMotion` is omitted, the panel behaves as in document 01;
- when present, the panel draws marker + label `C` and includes `C` in the
  autoscaled domain;
- the panel must not invent a default `C`;
- the panel must not estimate `C` (no Bunkers).

`StormMotion` is the existing physics type:

    { eastward: number; northward: number }   // m/s

It must not be converted into a `HodographPoint`. `C` has no height metadata
and is not part of the hodograph polyline.

---

## 5. Domain and transform

### 5.1 Keep knot domain semantics separate

`computeVelocityDomain(points)` continues to mean:

    domain covers (0, 0) and every hodograph point

Do not pass `C` as if it were a knot point.

### 5.2 Expand domain with overlay velocities

Add a thin helper that unions extra velocity samples into a domain, for
example:

    expandVelocityDomain(domain, velocities)

where each velocity is:

    { eastward, northward }

For this slice, when `stormMotion` is provided:

    domain = computeVelocityDomain(points)
    domain = expandVelocityDomain(domain, [stormMotion])

Then apply the existing deterministic padding, minimum-span handling, and
equal-aspect fit from document 01.

### 5.3 Visibility rule

If `C` lies outside the point-only domain, the viewport must expand so that
`C` remains inside the visible velocity domain after padding and equal-aspect
fit.

Including `C` does not require centering the view on `C`.

### 5.4 Same mapping

`C` is mapped with the same transform as knots:

    screen = velocityToScreen(C.eastward, C.northward, transform)

- eastward → screen X
- northward → inverted screen Y
- one shared scale for both axes

No second transform and no storm-relative axis rewrite.

---

## 6. Marker and label semantics

Visual minimum for v1:

| Element | Rule |
|---------|------|
| Knot marker | remains a **circle** |
| `C` marker | a **different shape** (cross or diamond) |
| `C` label | text **`C`** near the marker |
| Legend | none in v1 |
| Design system | none in v1 |

The shape difference is the primary distinction between knots and storm
motion. Do not rely on a legend.

`C` is not inserted into the polyline and does not receive a height label.

---

## 7. Demo fixture

Demo composition keeps the existing hodograph fixture points and supplies:

    C = { eastward: 10, northward: -10 }   // m/s

Flow:

1. build the demo `EnvironmentalWindProfile` in `src/app/`;
2. `points = hodographPoints(profile)`;
3. pass `points` and `stormMotion: C` into `HodographPanel`.

Because demo winds have `northward >= 0` while `C.northward = -10`, this
fixture exercises domain expansion below the velocity origin.

---

## 8. Testing

Prefer pure transform tests.

Required checks:

- without overlay, domain still includes `(0, 0)` and all points;
- with `C = (10, -10)`, domain includes that velocity (e.g. northward min at
  or below `-10`) while still including `(0, 0)` and the points;
- `C` inside an existing point domain does not break equal-aspect fitting;
- screen position of `C` equals `velocityToScreen(C.eastward, C.northward, transform)`;
- hodograph point velocity components are not rewritten when `stormMotion` is
  present (polyline still uses the same ground-relative `eastward` /
  `northward` values).

Do not require:

- pixel-perfect marker snapshots;
- Bunkers tests;
- `V_sr` / SRH overlay tests;
- physics API changes.

---

## 9. Implementation slice contents

This document's implementation slice includes:

- `expandVelocityDomain` (or equivalent) and overlay-aware
  `buildViewTransform` orchestration;
- optional `stormMotion` prop on `HodographPanel`;
- SVG cross/diamond marker + label `C`;
- demo `C = (10, -10)`;
- focused transform tests above;
- micro-pointer updates from document 01.

It excludes physics API changes and all v1 out-of-scope overlays listed in
§2.

---

## 10. Core lesson

Storm motion `C` is an overlay in ground-relative velocity space.

The hodograph path stays ground-relative.

Autoscale includes `(0, 0)`, the knot points, and `C` when supplied.

Knots remain circles; `C` uses a different marker shape and the label `C`.

The storm-relative wind vector overlay `C → wind(h)` is defined separately in:

    docs/ui/03-storm-relative-wind-overlay.md

SRH area and other diagnostic overlays remain later slices.
