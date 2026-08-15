# Streamwise / Crosswise Vorticity Overlay (v1)

## 1. Purpose

This document defines the first streamwise / crosswise vorticity overlay on
the ground-relative hodograph panel.

It visualizes the decomposition of an existing finite-layer horizontal
vorticity `ω_h` relative to a representative horizontal storm-relative wind
for one piecewise-linear layer segment:

    ω_h = ω_s ŝ + ω_c ĉ

Physics sources:

    docs/physics/06-horizontal-vorticity.md
    docs/physics/07-storm-relative-wind.md
    docs/physics/08-streamwise-crosswise-vorticity.md
    docs/physics/09-storm-relative-helicity.md  // V_sr_avg motivation

Related UI:

    docs/ui/04-horizontal-vorticity-overlay.md
    docs/ui/05-hodograph-overlay-controls.md

The overlay answers:

    Relative to the layer-average storm-relative direction used with this
    finite-layer ω_h, how much of ω_h is streamwise and how much is crosswise?

It does not redefine `decomposeHorizontalVorticity`, does not use the green
selected-knot `V_sr` arrow as the basis, and does not draw SRH area.

---

## 2. Scope

In v1 this overlay shows only:

- a streamwise / crosswise decomposition glyph for one PL layer segment;
- proportional parallelogram reconstruction sharing the `ω_h` anchor and
  fixed logical `L_px`;
- labels for streamwise / crosswise components;
- its own visibility checkbox under **Hodograph overlays**;
- stable viewport (visibility does not affect domain/transform).

Out of scope for v1:

- SRH area / fill;
- Bunkers;
- drag / edit;
- height or layer picker;
- multi-segment layer decomposition;
- using selected-knot `V_sr` as the decomposition basis;
- duplicating `ω_h` inside the streamwise payload;
- 3D / world conversion;
- magnitude legend in m/s;
- physics API changes;
- treating this overlay as height-integrated streamwise helicity.

---

## 3. Finite-layer basis: `V_sr_avg`

Finite-layer `ω_h` belongs to a height interval `[h0, h1]`, not to one knot.

For a piecewise-linear environmental segment, document 09 Form A uses:

    V_sr_avg = (
      (V_sr(h0).eastward  + V_sr(h1).eastward)  / 2,
      (V_sr(h0).northward + V_sr(h1).northward) / 2
    )

with constant `ω_h` on that segment.

**v1 lock-in:** the decomposition basis is this endpoint average
`V_sr_avg`, not:

- `V_sr` at the lower knot alone;
- `V_sr` at the upper knot alone;
- the green selected-knot `V_sr` overlay from document 03.

On one linear segment, `V_sr_avg` coincides with `V_sr` at mid-height. That
identity is a consequence of linearity, not a license to treat arbitrary
selected-knot `V_sr` as the layer basis.

Pedagogical meaning:

    how layer ω_h projects onto the same storm-relative direction that
    appears in ω_h · V_sr_avg for that PL segment

This overlay is **not** an integral of streamwise vorticity over height.

---

## 4. Single PL segment constraint

v1 requires:

    h0 and h1 are exact adjacent hodograph knots
    (no interior profile knots strictly between them)

and:

    h1 > h0

If the requested layer is not a single adjacent knot pair, the overlay is
out of contract for v1 (composition must not supply it; panel treats mismatched
layer bounds as absent — silent).

Multi-segment decomposition is deferred.

---

## 5. Relationship to existing `ω_h` overlay

Document 04 already supplies:

    vorticityLayer: {
      h0, h1,
      vorticity: HorizontalVorticity
    }

**v1 lock-in:** the streamwise/crosswise payload does **not** duplicate `ω_h`.

The panel uses `vorticityLayer.vorticity` when:

    streamwiseCrosswiseOverlay.h0 === vorticityLayer.h0
    AND streamwiseCrosswiseOverlay.h1 === vorticityLayer.h1

If bounds do not match, or `vorticityLayer` is missing / unresolved, the
decomposition overlay is not drawn (silent).

Anchor remains the velocity-space midpoint of the same segment (document 04).

---

## 6. Payload (composition → panel)

Conceptual type:

    interface StreamwiseCrosswiseVorticityOverlay {
      h0: number;
      h1: number;
      basisStormRelativeWind: {
        eastward: number;
        northward: number;
        vertical: number;   // unused by draw; may be 0
      };
      decomposition: {
        omegaStreamwise: number;
        omegaCrosswise: number;
      };
    }

Composition (outside the panel):

1. resolve adjacent knots `h0`, `h1`;
2. `shear = verticalWindShearBetween(profile, h0, h1)`;
3. `ω = horizontalVorticityFromShear(shear)` — also used for `vorticityLayer`;
4. `V0 = stormRelativeWind(sample(h0), C)`;
5. `V1 = stormRelativeWind(sample(h1), C)`;
6. `V_avg = average horizontal components of V0 and V1` (`vertical: 0`);
7. if horizontal `|V_avg| === 0` → do not supply decomposition overlay
   (or supply only for tests that expect silent absence);
8. else
   `decomposition = decomposeHorizontalVorticity(V_avg, ω)`.

The panel must not:

- import/call `decomposeHorizontalVorticity`;
- sample the profile;
- recompute shear / storm-relative wind;
- use selected-knot `V_sr` props as the basis.

---

## 7. Geometry / representation

### 7.1 Units discipline

`ω_s` and `ω_c` are in `1/s`.

They must not be passed through `velocityToScreen` as if they were m/s.

Screen directions use the same east-right / north-up convention as document
04:

    atmospheric (e, n) direction → screen (e, −n)

### 7.2 Orthonormal basis (document 08)

With horizontal `V_sr_avg = (u, v)` and `|V| > 0`:

    ŝ = (u, v) / |V|
    ĉ = (−v, u) / |V|    // left-normal (+90° CCW in east–north)

Signed components from the supplied `decomposition` (already computed by
physics).

### 7.3 Proportional parallelogram reconstruction

Let:

    L_px = same fixed logical length used for the ω_h glyph (document 04)
    ω = vorticityLayer.vorticity
    |ω| = hypot(omegaEastward, omegaNorthward)

When `|ω| > 0` and decomposition is active:

1. Draw / reuse `ω_h` tip:

       tip_ω = anchor + û_ω * L_px

2. Component lengths (schematic, proportional — not m/s encoding):

       L_s = (|omegaStreamwise| / |ω|) * L_px
       L_c = (|omegaCrosswise|  / |ω|) * L_px

3. Component tips along signed basis directions in screen space:

       tip_s = anchor + sign(omegaStreamwise) * ŝ_screen * L_s
       tip_c = anchor + sign(omegaCrosswise)  * ĉ_screen * L_c

4. Visual reconstruction invariant:

       tip_s offset + tip_c offset  ≈  tip_ω offset

Negative components point opposite the corresponding basis vector.

Labels:

    ω_s
    ω_c

Optional light basis ticks are allowed; they must not be confused with the
green selected-knot `V_sr` arrow.

### 7.4 Silent absence

No decomposition glyphs when any of the following hold:

- streamwise payload missing;
- `[h0,h1]` not matching resolved `vorticityLayer`;
- layer not a valid adjacent exact-knot pair;
- `|ω_h| === 0`;
- horizontal `|V_sr_avg| === 0` (basis undefined);
- effective visibility off (§8).

No warn / no throw in the UI path.

---

## 8. Visibility

Extend `HodographOverlayVisibility` with:

    streamwiseCrosswise: boolean

Checkbox label:

    Streamwise / crosswise vorticity

### 8.1 Effective draw vs stored intent

**Data dependencies** (must exist for a meaningful overlay):

- storm motion `C` used in composition to build `V_sr_avg`;
- matching `vorticityLayer`;
- nonzero `|ω_h|` and nonzero horizontal `|V_sr_avg|`.

**Pedagogical / effective visibility lock-in:**

- effective decomposition draw requires **visible `ω_h`**
  (`horizontalVorticity === true` and ω layer actually drawn/resolved);
- the streamwise/crosswise checkbox may remain checked while `ω_h` is hidden;
- stored `streamwiseCrosswise` intent is **preserved** when `ω_h` is temporarily
  hidden (same preserve-intent pattern as `V_sr` when `C` is hidden);
- when `ω_h` is shown again, previous stored intent applies.

**Not required for effective draw:**

- visible storm-motion marker `C`;
- visible green selected-knot `V_sr` arrow.

Rationale: the decomposition basis is `V_sr_avg`, which generally differs from
the selected-knot `V_sr` glyph. Requiring that green arrow would teach the
wrong basis.

Stable viewport remains mandatory: visibility does not change
domain/transform.

---

## 9. Demo fixture numbers

Demo layer (single PL segment):

    h0 = 0 m
    h1 = 1000 m
    C  = (10, −10) m/s

Winds:

    wind(0)    = (10, 0)  → V_sr(0)    = (0, 10)
    wind(1000) = (20, 10) → V_sr(1000) = (10, 20)

    V_sr_avg = (5, 15) m/s

    ω_h = (−0.01, +0.01) 1/s

    omegaStreamwise ≈ +0.006325 1/s   (> 0)
    omegaCrosswise  ≈ +0.012649 1/s   (> 0)

Expected screen directions from the segment midpoint anchor:

| Glyph | Screen direction |
|-------|------------------|
| `ω_h` | up-left |
| `ω_s` | up-right (along ŝ) |
| `ω_c` | up-left (along ĉ; more leftward than ω_h alone) |

The green `V_sr` at selected height `0 m` points straight up and is **not**
collinear with `ŝ` of `V_sr_avg`. That difference is intentional and must
remain visible in teaching.

---

## 10. Testing

Prefer pure geometry / composition tests.

Required checks:

- composition builds `V_sr_avg` and decomposition matching the demo numbers
  (within floating tolerance);
- panel/helpers never use selected-knot `V_sr` as basis;
- payload does not need to carry a second copy of `ω_h`; matching
  `[h0,h1]` with `vorticityLayer` is required;
- proportional reconstruction: component screen offsets sum to the `ω_h`
  offset for fixed `L_px`;
- negative component would reverse basis direction (unit test with a chosen
  sign case if not covered by demo);
- `|ω|=0` or `|V_avg|=0` → no decomposition glyphs;
- effective draw false when `ω_h` visibility is off while stored
  `streamwiseCrosswise` stays true;
- visibility toggles do not change `buildViewTransform` inputs;
- no world conversion.

---

## 11. Implementation slice contents

This document's implementation slice includes:

- composition builder for `V_sr_avg` + `decomposeHorizontalVorticity` on the
  demo adjacent segment `[0, 1000]`;
- `StreamwiseCrosswiseVorticityOverlay` payload without duplicated `ω_h`;
- panel parallelogram glyphs + labels;
- visibility flag + preserve-intent / requires-visible-`ω_h` contract;
- checkbox under Hodograph overlays;
- focused tests above;
- micro-pointers from prior UI docs.

It excludes physics API changes and all v1 out-of-scope items in §2.

---

## 12. Core lesson

Finite-layer `ω_h` is decomposed relative to **layer-average** storm-relative
wind `V_sr_avg`, the same representative wind used with constant segment
vorticity in SRH Form A.

The green selected-knot `V_sr` arrow is a different object and is not the
basis.

Component glyphs are schematic, proportional to `|ω_s|/|ω|` and `|ω_c|/|ω|`
on the same fixed `L_px`, reconstructing `ω_h = ω_s ŝ + ω_c ĉ` in screen
space without treating `1/s` as hodograph m/s.
