# Horizontal Vorticity Overlay (v1)

## 1. Purpose

This document defines the first horizontal-vorticity overlay on the
ground-relative hodograph panel.

It visualizes finite-layer horizontal vorticity `ω_h` for one selected height
layer as a schematic direction glyph associated with that layer's hodograph
segment.

Physics source:

    docs/physics/05-vertical-wind-shear.md
    docs/physics/06-horizontal-vorticity.md

Related UI:

    docs/ui/01-hodograph-panel.md
    docs/ui/02-storm-motion-overlay.md
    docs/ui/03-storm-relative-wind-overlay.md

The overlay answers:

    For selected layer [h0, h1], what is the direction of the finite-layer
    horizontal vorticity implied by vertical shear on that layer?

It does not depict local pointwise curl at a single knot and does not map
`ω_h` through the velocity (m/s) scale as if it were wind.

---

## 2. Scope

In v1 this overlay shows only:

- an optional finite-layer vorticity payload on `HodographPanel`;
- highlight of the hodograph segment between exact knots `h0` and `h1`;
- a direction-only `ω_h` arrow when vorticity is nonzero;
- label `ω_h`;
- the same ground-relative axes and equal-aspect transform as prior UI docs.

Out of scope for v1:

- streamwise / crosswise arrows
  (see `docs/ui/06-streamwise-crosswise-vorticity-overlay.md`);
- SRH signed-area fill;
- local pointwise curl;
- magnitude encoding or magnitude legend;
- interpreting arrow length as m/s or any velocity quantity;
- interactive layer picker;
- Bunkers;
- 3D / world-coordinate conversion;
- physics API changes.

---

## 3. Finite-layer meaning

`ω_h` in this project is a finite-layer diagnostic derived from shear over
`[h0, h1]`, not a property of one hodograph knot.

Therefore:

- do not anchor the glyph on a single selected knot as if it were pointwise
  curl;
- do associate the glyph with the layer segment between `wind(h0)` and
  `wind(h1)` on the ground-relative hodograph.

Composition computes:

    shear = verticalWindShearBetween(profile, h0, h1)
    vorticity = horizontalVorticityFromShear(shear)

The panel does not call those functions and does not accept the profile for
this overlay.

---

## 4. Overlay payload

Conceptual type:

    interface HorizontalVorticityLayerOverlay {
      h0: number;
      h1: number;
      vorticity: HorizontalVorticity;
    }

where `HorizontalVorticity` is the existing physics type:

    {
      omegaEastward: number;   // 1/s
      omegaNorthward: number;  // 1/s
    }

Panel props gain an optional field, for example:

    vorticityLayer?: HorizontalVorticityLayerOverlay

Rules:

- `h0` / `h1` identify the layer for segment highlight and anchor;
- v1 requires **exact knot heights** present in `points` for both `h0` and
  `h1` (same exact-match policy as document 03);
- the panel must not recompute shear or vorticity;
- no world conversion of `ω_h`.

### 4.1 Invalid layer (missing knots)

If either `h0` or `h1` does not exactly match a knot in `points`, or if
`h1 <= h0`:

- draw neither segment highlight nor arrow;
- no warn / no throw in v1 (silent absence).

---

## 5. Units discipline

Hodograph coordinates are velocities (m/s).

`ω_h` components are vorticity (1/s).

Forbidden:

    velocityToScreen(omegaEastward, omegaNorthward)
    end = start + omega * velocityScale

Those would falsely place an `ω_h` tip in velocity space.

Allowed:

- place the **anchor** using velocity-space geometry of the wind segment;
- apply only the **direction** of `ω_h` in screen space with a fixed
  schematic length in logical SVG/viewBox pixels.

---

## 6. Geometry

### 6.1 Segment and anchor

Let `p0` and `p1` be the exact `HodographPoint`s at `h0` and `h1`.

Velocity-space midpoint:

    mid.eastward  = (p0.eastward  + p1.eastward)  / 2
    mid.northward = (p0.northward + p1.northward) / 2

Anchor:

    anchorScreen = velocityToScreen(mid.eastward, mid.northward, transform)

### 6.2 Segment highlight

When the layer is valid (exact knots, `h1 > h0`):

- highlight the hodograph polyline piece from `p0` to `p1`
  (thicker and/or distinct stroke);
- do not fill an area;
- do not rewrite other segments.

### 6.3 Direction-only arrow

Define atmospheric unit direction from vorticity when
`|ω_h| > 0`:

    û = normalize(omegaEastward, omegaNorthward)

Screen direction uses the same east-right / north-up convention as wind,
including screen-Y inversion:

    screenDir = (û_eastward, -û_northward)

Equivalently, normalized screen components proportional to:

    (omegaEastward, -omegaNorthward)

Arrow end:

    endScreen = anchorScreen + screenDir * L_px

where:

    L_px = fixed logical SVG / viewBox length

Lock-in:

- no magnitude encoding;
- `L_px` does not depend on `|ω_h|` or on the velocity scale;
- autoscale / equal-aspect changes may move the anchor, but must not flip the
  schematic screen direction for a fixed `ω_h`.

Label:

    ω_h

near the glyph. Do not label the tip with m/s values.

### 6.4 Zero vorticity

If the layer is valid and

    omegaEastward === 0 && omegaNorthward === 0
    (or equivalently |ω_h| === 0)

then:

- **do not** draw the `ω_h` arrow;
- **do** keep the segment highlight.

Rationale: the layer remains selected; rotation on that layer is simply zero.
Absence of an arrow must not be confused with an unselected layer.

Silent no-arrow only; no warn / no throw.

---

## 7. Coexistence with existing overlays

| Overlay | Meaning | Demo |
|---------|---------|------|
| Ground-relative path | `HodographPoint[]` | fixture winds |
| `C` | storm motion | `(10, -10)` |
| `V_sr` | knot-selected `C → wind(h)` | `selectedHeight = 0` |
| `ω_h` | layer-selected finite-layer vorticity | `[0, 1000]` |

Keep `V_sr` and `ω_h` simultaneously when both payloads are present.

They answer different questions (knot storm-relative wind vs layer vorticity).

Streamwise / crosswise decomposition of layer `ω_h` is a separate overlay:

    docs/ui/06-streamwise-crosswise-vorticity-overlay.md

Use distinct visual styling so `V_sr` and `ω_h` are not interchangeable.

---

## 8. Demo fixture

Demo layer:

    h0 = 0 m
    h1 = 1000 m

With the existing demo winds:

    wind(0)    = (10, 0) m/s
    wind(1000) = (20, 10) m/s

Composition:

    shear = verticalWindShearBetween(profile, 0, 1000)
         = (0.01, 0.01) 1/s

    vorticity = horizontalVorticityFromShear(shear)
             = { omegaEastward: -0.01, omegaNorthward: 0.01 } 1/s

Expected orientation:

    atmospheric (−, +) → screen left and up (up-left)

Pass into the panel:

    vorticityLayer = {
      h0: 0,
      h1: 1000,
      vorticity,
    }

App / composition may compute shear and vorticity for the payload and for
tests. Do not add runtime asserts in the UI render path.

---

## 9. Testing

Prefer pure geometry helpers over DOM cosmetics.

Required checks:

- demo composition yields `ω_h = (−0.01, +0.01)`;
- screen direction for that vector satisfies `dx < 0` and `dy < 0`
  (up-left in SVG coordinates);
- for fixed `ω_h`, changing autoscale/domain/padding moves the anchor but
  preserves the schematic screen-direction signs;
- arrow length equals fixed `L_px`, independent of `|ω_h|` and of velocity
  `scale`;
- `ω_h` is never passed through `velocityToScreen` as a velocity point;
- valid layer + zero vorticity → segment highlight present, arrow absent;
- missing exact knots → neither highlight nor arrow;
- no world-coordinate conversion.

---

## 10. Implementation slice contents

This document's implementation slice includes:

- optional `vorticityLayer` prop / `HorizontalVorticityLayerOverlay`;
- exact-knot layer validation;
- segment highlight for valid layers;
- fixed-`L_px` direction-only `ω_h` arrow + label when `|ω_h| > 0`;
- zero-vorticity policy in §6.4;
- demo layer `[0, 1000]` wired through composition physics;
- focused tests above;
- micro-pointers from prior UI docs.

It excludes physics API changes and all v1 out-of-scope items in §2.

---

## 11. Core lesson

Finite-layer `ω_h` is drawn as a schematic direction on the hodograph, anchored
at the velocity midpoint of the selected segment.

Arrow length is fixed logical pixels, not a velocity length and not a
magnitude encoding.

Zero vorticity means no arrow, but a valid selected layer may still be
highlighted.

The panel observes a prepared overlay; it does not recompute shear or
vorticity and does not world-convert `ω_h`.

Show/hide controls for this and other overlays are defined in:

    docs/ui/05-hodograph-overlay-controls.md

Streamwise / crosswise decomposition of this layer `ω_h` is defined in:

    docs/ui/06-streamwise-crosswise-vorticity-overlay.md
