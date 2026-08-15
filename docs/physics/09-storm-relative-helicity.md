# Storm-Relative Helicity

## 1. Purpose

This document defines the first storm-relative helicity (SRH) diagnostic in
Supercell Explorer.

It computes finite-layer / profile-based SRH for the horizontally homogeneous
environmental model from an `EnvironmentalWindProfile` and a given
`StormMotion`.

Inputs:

    EnvironmentalWindProfile
    StormMotion
    layer [h0, h1]

from:

    docs/physics/04-environmental-wind-profile.md
    docs/physics/07-storm-relative-wind.md

Related prior diagnostics (interpretation and validation, not required
call-chain inputs for the primary API):

    docs/physics/05-vertical-wind-shear.md
    docs/physics/06-horizontal-vorticity.md
    docs/physics/08-streamwise-crosswise-vorticity.md

This diagnostic answers:

    Over height layer [h0, h1], what is the integrated storm-relative helicity
    of the environmental horizontal wind relative to storm motion C?

It does not define:

- Bunkers or other storm-motion estimators;
- effective inflow layer selection;
- observed sounding conventions or operational layer recipes (0–1 km, 0–3 km
  as special cased physics);
- tilting or stretching;
- updraft, mesocyclone, or tornado prediction;
- storm-relative shear or vorticity as separate types;
- hodograph rendering or a second “area” physics API
  (ground-relative hodograph data foundation is separate; see
  `docs/physics/10-hodograph-basics.md`);
- world-space conversion;
- numerical quadrature over a height grid as the production definition.

---

## 2. Relationship to prior diagnostics

Architectural dependency for the first SRH API:

    EnvironmentalWindProfile
    StormMotion
        ↓
    stormRelativeHelicityBetween
        ↓
    StormRelativeHelicity

The profile remains the atmospheric source of truth for ground-relative
environmental wind.

`StormMotion` remains an externally supplied horizontal translation
(document 07). This document does not estimate `C`.

Conceptual physical chain of the integrand:

    V_env(h) from EnvironmentalWindProfile
    V_sr(h)  = storm-relative wind at height h          (document 07)
    ω_h(h)   from vertical shear of horizontal wind    (documents 05, 06)

    integrand = V_sr,h · ω_h

SRH is the height integral of that integrand. It is not a finite-layer
average shear or a single `HorizontalVorticity` for the whole requested
layer.

Document 08’s streamwise / crosswise split interprets the same integrand
when horizontal storm-relative flow is nonzero:

    V_sr,h · ω_h = |V_sr,h| * omegaStreamwise

That identity is validation and interpretation. It is not the preferred
production integration path (see §11–§12).

---

## 3. Flow assumption

Atmospheric coordinates:

    u = eastward wind
    v = northward wind
    h = height (up)

This diagnostic applies only to horizontally homogeneous environmental flow
of the form:

    V_env = (u(h), v(h), 0)

as represented by `EnvironmentalWindProfile`:

- horizontal wind varies with height only;
- environmental vertical wind is zero at every level;
- there is no horizontal spatial variation of the environmental wind.

Storm motion:

    C = (C_u, C_v) = (StormMotion.eastward, StormMotion.northward)

is constant with height in this foundation.

Horizontal storm-relative wind:

    V_sr,h = (u - C_u, v - C_v)

Under these assumptions, horizontal vorticity is (document 06):

    ω_h = (ω_e, ω_n) = (-dv/dh, du/dh)

---

## 4. Continuous definition

For layer `[h0, h1]` with `h1 > h0`:

    SRH = ∫_{h0}^{h1}  V_sr,h · ω_h  dh

    SRH = ∫_{h0}^{h1}
            [ (u - C_u) ω_e + (v - C_v) ω_n ] dh

Units:

    (m/s) * (1/s) * m = m^2/s^2

This is the canonical physical definition for this project.

---

## 5. Streamwise identity and crosswise non-contribution

Document 08 defines, when `|V_sr,h| > 0`:

    s_hat = V_sr,h / |V_sr,h|
    omegaStreamwise = ω_h · s_hat
    omegaCrosswise  = ω_h · c_hat

Then:

    V_sr,h · ω_h = |V_sr,h| * omegaStreamwise

Equivalently, with

    ω_h = omegaStreamwise * s_hat + omegaCrosswise * c_hat

the crosswise term is orthogonal to `V_sr,h`, so:

    V_sr,h · ω_h = |V_sr,h| * omegaStreamwise + 0 * omegaCrosswise

Therefore:

- pure streamwise vorticity contributes to the SRH integrand;
- pure crosswise vorticity contributes nothing to the SRH integrand;
- SRH is not “total horizontal vorticity times wind speed”.

Critical distinction from document 08:

- if `V_sr,h = 0`, streamwise / crosswise are undefined and that diagnostic
  must error;
- the SRH integrand is still defined and equals `0` at such heights.

So zero horizontal storm-relative flow is in domain for SRH and must not be
treated as an SRH failure.

---

## 6. Hodograph-space form

Substitute document 06:

    ω_e = -dv/dh
    ω_n =  du/dh

into the integrand:

    V_sr,h · ω_h
      = (u - C_u)(-dv/dh) + (v - C_v)(du/dh)
      = (v - C_v) du/dh - (u - C_u) dv/dh

Therefore:

    SRH = ∫_{h0}^{h1}
            [ (v - C_v) du/dh - (u - C_u) dv/dh ] dh

As a line integral along the hodograph path `(u(h), v(h))`:

    SRH = ∫ [ (v - C_v) du - (u - C_u) dv ]

with the path taken in increasing height from `h0` to `h1`.

Storm-relative hodograph coordinates (origin at storm motion):

    U = u - C_u
    V = v - C_v

Because `C` is constant in height:

    dU = du
    dV = dv

    SRH = ∫ V dU - U dV

Sign check relative to already accepted conventions:

- `u`, `v`, `C_u`, `C_v` are atmospheric eastward / northward;
- `ω_h = (-dv/dh, du/dh)` is document 06;
- the line-integral form above is exactly the continuous definition in §4
  under those conventions;
- world-space `Vec3` and `Z = South` do not participate.

This matches the standard meteorological east–north form of storm-relative
helicity for this simplified flow. It is not a second physical model.

---

## 7. Geometric meaning: signed area relative to C

### 7.1 What “area” means

In the `(U, V)` plane with origin at storm motion `C`, the differential
signed area swept by the radius vector, with mathematical counterclockwise
(CCW) positive when east is right and north is up, is:

    dA_CCW = (1/2) (U dV - V dU)

Therefore:

    ∫ V dU - U dV = -2 A_CCW = +2 A_CW

where `A_CW` uses the opposite (clockwise-positive) orientation convention.

For an open hodograph arc from height `h0` to `h1`, close the path by the
two straight segments:

    wind(h1) → C → wind(h0)

Along those radial segments through `C`, `V dU - U dV = 0`.

Hence layer SRH equals twice the signed area of the region bounded by:

1. the hodograph curve from `h0` to `h1`;
2. the straight segment from the wind at `h1` back to `C`;
3. the straight segment from `C` to the wind at `h0`;

with the clockwise-positive convention in the atmospheric east–north
velocity plane (equivalently `-2` times CCW-positive area of that same
region).

Positive SRH corresponds to a clockwise sense of that closed contour
`h0 → h1 → C → h0` in the usual plan view (east right, north up).

### 7.2 Assumptions required for the area statement

The area interpretation holds only when:

- storm motion `C` is constant with height;
- environmental wind is horizontally homogeneous `V = (u(h), v(h), 0)`;
- horizontal vorticity is the document 06 map from vertical shear;
- “area” means the signed region relative to point `C` described above,
  not an absolute area of an arbitrary curve that ignores `C`;
- cancellation is signed: opposing lobes reduce net SRH;
- orientation is the atmospheric east–north plane, not world `X/Z`.

### 7.3 Role in this project

Hodograph area is an equivalent interpretation and a validation identity for
the same line integral.

It is not a separate diagnostic, not a second physics definition, and not a
required production API surface in v1.

The ground-relative hodograph path representation used by later geometry
overlays is defined separately in:

    docs/physics/10-hodograph-basics.md

That foundation does not redefine SRH and does not embed `StormMotion` or
signed area into base hodograph points or segments.

---

## 8. Piecewise-linear profile computation

`EnvironmentalWindProfile` is piecewise linear in height (document 04).

On each linear segment:

- `du/dh` and `dv/dh` are constant;
- therefore `ω_h` is constant;
- `V_sr,h` varies linearly with height.

### 8.1 Segment decomposition

For requested layer `[h0, h1]`:

1. require the domain policy in §10;
2. sample winds at `h0` and `h1` with `profile.sampleAtHeight`;
3. split `[h0, h1]` at profile knots that lie strictly inside the layer;
4. sum exact segment contributions.

Interior endpoints that fall inside a profile segment must create subsegments.
Do not ignore `h0` / `h1` and integrate only over raw profile knots.

### 8.2 Exact segment formulas

Let a segment run from height `ha` to `hb` (`hb > ha`) with winds
`(ua, va)` and `(ub, vb)`.

Define storm-relative endpoint components:

    Ua = ua - C_u
    Va = va - C_v
    Ub = ub - C_u
    Vb = vb - C_v

#### Form A — helicity with constant segment vorticity

    shearEastward  = (ub - ua) / (hb - ha)
    shearNorthward = (vb - va) / (hb - ha)

    ω_e = -shearNorthward
    ω_n =  shearEastward

    V_sr_avg = ((Ua + Ub) / 2, (Va + Vb) / 2)

    SRH_segment = (hb - ha) * (ω_e * V_sr_avg.east + ω_n * V_sr_avg.north)

This is exact because `ω_h` is constant and `V_sr,h` is linear on the
segment.

#### Form B — triangle / hodograph form

    SRH_segment = -(Ua Vb - Ub Va)
                = Ub Va - Ua Vb

Geometrically:

    SRH_segment = 2 * (signed CW area of triangle C–wind(ha)–wind(hb))

Forms A and B are mathematically equivalent for linear hodograph segments.
The implementation may use either. The documentation treats them as the
same physics.

### 8.3 Layer total

    SRH = sum of SRH_segment over all subsegments covering [h0, h1]

### 8.4 Forbidden shortcut

Do not compute multi-segment SRH as:

    (one layer-average ω from verticalWindShearBetween on [h0, h1])
      · (one mid-layer V_sr)
      · (h1 - h0)

Across kinks, segment vorticity is piecewise constant. A single layer-average
shear does not reproduce the sum of segment helicity contributions.

On one isolated linear piece, that shortcut with midpoint `V_sr` coincides
with Form A. That special case does not justify using it across the full
requested layer when multiple segments are present.

### 8.5 Numerical quadrature

Height-grid numerical integration is unnecessary for the first piecewise-
linear environmental model and is outside the production definition.

---

## 9. Dependency design

### 9.1 Primary API consumes profile + storm motion

Conceptual API:

    stormRelativeHelicityBetween(
      profile: EnvironmentalWindProfile,
      stormMotion: StormMotion,
      h0: number,
      h1: number,
    ) -> StormRelativeHelicity

Placement intent:

    diagnostic function separate from EnvironmentalWindProfile

The profile class must not absorb SRH logic.

### 9.2 What the diagnostic may use internally

Allowed for clarity and exactness:

- `profile.sampleAtHeight` at layer endpoints and segment boundaries;
- `stormRelativeWind` when forming `V_sr` at those heights;
- per-segment shear → `horizontalVorticityFromShear` if implementing Form A;
- direct evaluation of Form B.

### 9.3 What the diagnostic must not require as caller inputs

Callers must not be forced to precompute:

- `HorizontalWindShear` for the whole layer;
- `HorizontalVorticity` for the whole layer;
- `StreamwiseCrosswiseVorticity`;
- a resampled height series of streamwise vorticity.

### 9.4 Why not integrate through streamwise components

Integrating `|V_sr,h| * omegaStreamwise` on a height grid would:

- approximate a quantity that is already exact on PL segments;
- become undefined wherever horizontal `V_sr` is exactly zero, even though
  the SRH integrand is zero and well-defined there;
- over-discretize without physical gain for this model.

Use document 08 as interpretation and as tests that relate SRH to streamwise
vorticity where `|V_sr,h| > 0`, not as the integration engine.

### 9.5 Tradeoff summary

Prefer:

    explicit exact segment integral of V_sr,h · ω_h
      (or equivalent hodograph triangle sum)

over:

    speculative resampling through streamwise decomposition

Physical transparency is preserved by documenting the equivalences in §5–§7,
not by forcing every intermediate diagnostic into the runtime call path.

---

## 10. Domain policy

Align with vertical wind shear (document 05), not with advection clamp
behavior of `sampleAtHeight`.

Requirements:

    Number.isFinite(h0)
    Number.isFinite(h1)
    h1 > h0
    h0 >= profile.minHeight
    h1 <= profile.maxHeight

Heights may equal the profile endpoints:

    h0 === profile.minHeight   // allowed
    h1 === profile.maxHeight   // allowed

If any requirement fails, the diagnostic must fail explicitly with:

    StormRelativeHelicityError

Invalid requests include:

- `h0 === h1`;
- `h0 > h1`;
- non-finite heights;
- `h0 < profile.minHeight`;
- `h1 > profile.maxHeight`;
- any layer that uses clamped continuation outside the explicit profile
  range as if it were observed data.

### Zero horizontal storm-relative flow

If at some height in the layer:

    V_sr.eastward  === 0
    and
    V_sr.northward === 0

the local integrand is `0`. The request remains in domain.

Notes:

- IEEE signed zero `-0` compares equal to `0` under `===`;
- no magnitude threshold and no epsilon are used for wind or shear;
- sign cancellation across segments is allowed and required: return the
  signed net sum, never an absolute-value rectification;
- very small nonzero `|V_sr,h|` does not need a special SRH policy in v1.

`StormMotion` validation beyond using its eastward/northward components is
outside this document (document 07 does not define a storm-motion error type
for the first foundation).

---

## 11. Result type

Conceptual result:

    interface StormRelativeHelicity {
      srh: number; // m^2/s^2
    }

The first version returns only this signed scalar.

It does not return:

- layer endpoint heights;
- per-segment contributions;
- absolute SRH;
- streamwise / crosswise breakdown fields;
- hodograph area as a separate field;
- shear or vorticity mirrors.

Callers that need geometric checks may compute triangle areas in tests from
the same winds and `C`; that remains validation, not API surface.

---

## 12. First validation cases

### Zero shear

Constant horizontal wind on `[h0, h1]` for any finite storm motion:

    srh === 0

### Pure crosswise

Construct a layer where `ω_h` is everywhere perpendicular to `V_sr,h`
(nonzero flow allowed):

    srh === 0

### Pure streamwise

Where `|V_sr,h| > 0` and `omegaCrosswise === 0` on a linear segment, SRH must
match:

    ∫ |V_sr,h| * omegaStreamwise dh

with the same sign as `omegaStreamwise` when that quantity does not change
sign on the segment.

### Anti-streamwise negative contribution

`V_sr,h` anti-parallel to `ω_h` must produce negative segment SRH.

### Sign cancellation

Two successive segments with opposite-signed contributions must yield a net
equal to the signed sum, not the sum of absolute values.

### Simple two-level linear hodograph (hand-exact)

Given only two levels and layer equal to that full segment:

    Ua, Va at h0
    Ub, Vb at h1

expected:

    srh === Ub * Va - Ua * Vb

Equivalently:

    srh === 2 * signed_CW_area(triangle C, wind(h0), wind(h1))

### Same profile, different storm motion

Identical `EnvironmentalWindProfile` and `[h0, h1]` with two different `C`
values must generally produce different `srh`.

### Same shear / vorticity, different storm motion

On a fixed linear segment, `ω_h` is independent of `C`, but `V_sr,h` depends
on `C`. Changing only `C` must change SRH whenever the storm-relative winds
change. This validates that SRH is not a pure vorticity diagnostic.

### Interior endpoints

For a multi-level profile, choosing `h0` / `h1` strictly inside segments must
match the exact subsegment formula, not an integral that skips interpolated
endpoints.

### Hodograph-area validation

For any piecewise-linear layer in domain, the summed triangle form must
equal the continuous / Form A result. Treat this as a consistency check of
one physics, not as a second quantity.

### Domain errors

The following must throw `StormRelativeHelicityError`:

- `h0 === h1`
- `h0 > h1`
- non-finite heights
- `h0 < minHeight`
- `h1 > maxHeight`

### Zero storm-relative wind is allowed

If environmental wind equals `C` at a level or everywhere on a zero-shear
layer, SRH computation must succeed and return the mathematically implied
value (`0` when the integrand vanishes throughout).

### No world-coordinate conversion

The diagnostic must be expressed and tested only with atmospheric semantic
components.

It must not read or write world-space `x`, `y`, or `z` components.

---

## 13. Current scope

The first SRH diagnostic is:

- finite-layer / profile-based;
- defined by `∫ V_sr,h · ω_h dh`;
- exact on piecewise-linear environmental segments;
- atmospheric-component based;
- dependent on an externally supplied `StormMotion`;
- independent of Bunkers / inflow-layer recipes;
- independent of tilting, stretching, updraft, and mesocyclone models;
- independent of rendering and hodograph UI.

It does not yet include:

- effective inflow layer automation;
- operational preset layers as special physics;
- returning area or per-segment breakdown in the result type;
- production numerical quadrature alternatives;
- storm-relative hodograph mode;
- world-space glyphs.

---

## 14. Development rule

Atmospheric diagnostics that are scientifically defined in atmospheric
components must remain in atmospheric components until an explicit world
boundary is required.

Therefore:

    EnvironmentalWindProfile + StormMotion + [h0, h1]
        ↓
    stormRelativeHelicityBetween
        ↓
    StormRelativeHelicity   // atmospheric, m^2/s^2

not:

    world Vec3 winds or paths
        ↓
    reverse-engineer SRH

and not:

    one whole-layer HorizontalWindShear / HorizontalVorticity
        ↓
    pretend that is the SRH integral across kinks

and not:

    dense streamwise resampling
        ↓
    approximate the already exact PL integral

---

## 15. Core lesson

For horizontally homogeneous environmental flow and constant storm motion:

    SRH = ∫_{h0}^{h1} V_sr,h · ω_h dh
        = ∫ [ (v - C_v) du - (u - C_u) dv ]
        = |V_sr,h| * omegaStreamwise   integrated in height
          (where horizontal storm-relative flow is nonzero)

On a piecewise-linear profile, SRH is the exact sum of segment
contributions, equivalently twice the signed clockwise hodograph area of the
region closed through storm-motion point `C`.

Crosswise vorticity does not enter the integrand.

Hodograph area is the same physics under a geometric reading, not a second
model.
