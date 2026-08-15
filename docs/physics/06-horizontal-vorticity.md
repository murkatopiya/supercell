# Horizontal Vorticity

## 1. Purpose

This document defines the first horizontal-vorticity diagnostic in
Supercell Explorer.

It derives horizontal vorticity only from the existing finite-layer vertical
wind shear of a horizontally homogeneous environmental profile.

Source of shear:

    HorizontalWindShear

from:

    docs/physics/05-vertical-wind-shear.md

This diagnostic answers:

    What horizontal vorticity is implied by the finite-layer vertical shear
    of horizontal environmental wind between two heights?

It does not define:

- storm motion;
- storm-relative wind;
- streamwise / crosswise decomposition
  (see `docs/physics/08-streamwise-crosswise-vorticity.md`);
- storm-relative helicity (SRH);
- tilting;
- stretching;
- local pointwise curl at a single height independent of shear;
- world-space vorticity vectors.

---

## 2. Relationship to vertical wind shear

`docs/physics/04-environmental-wind-profile.md` establishes the dependency:

    EnvironmentalWindProfile
        ↓
    vertical wind shear
        ↓
    horizontal vorticity

`docs/physics/05-vertical-wind-shear.md` defines finite-layer shear:

    HorizontalWindShear
      shearEastward   // 1/s
      shearNorthward  // 1/s

This document defines the next derived diagnostic as a map from that shear
result.

Architectural dependency:

    EnvironmentalWindProfile
        ↓
    verticalWindShearBetween
        ↓
    HorizontalWindShear
        ↓
    horizontalVorticityFromShear
        ↓
    HorizontalVorticity

The environmental profile remains the atmospheric source of truth for wind.

Shear remains the source of truth for finite-layer vertical change of
horizontal wind.

Horizontal vorticity must not become a second hidden copy of either.

---

## 3. Flow assumption

Atmospheric coordinates:

    u = eastward wind
    v = northward wind
    h = height

This diagnostic applies only to horizontally homogeneous environmental flow
of the form:

    V = (u(h), v(h), 0)

That is:

- horizontal wind varies with height only;
- vertical wind is zero in the environmental profile;
- there is no horizontal spatial variation of the environmental wind.

Under that assumption, the only nonzero contributions to horizontal vorticity
come from vertical derivatives of `u` and `v`.

---

## 4. Mathematical definition

For

    V = (u(h), v(h), 0)

the horizontal vorticity components are:

    omega_eastward  = -dv/dh
    omega_northward =  du/dh

Finite-layer vertical shear from document 05 is:

    shearEastward  ≈ du/dh
    shearNorthward ≈ dv/dh

over a layer `[h0, h1]`.

Therefore:

    omegaEastward  = -shearNorthward
    omegaNorthward =  shearEastward

Units:

    vorticity components are in 1/s

This is the same unit family as shear:

    (m/s) / m = 1/s

---

## 5. Orthogonality and magnitude

Write the horizontal shear and vorticity vectors in atmospheric horizontal
components:

    S  = (shearEastward,  shearNorthward)
    ωh = (omegaEastward,  omegaNorthward)
       = (-shearNorthward, shearEastward)

Then:

    S · ωh = 0

and:

    |ωh| = |S|

For this simplified flow, finite-layer horizontal vorticity is perpendicular
to the finite-layer vertical-shear vector and has the same magnitude.

These two identities follow directly from the component equations above.
They do not add a separate physical model.

---

## 6. Sign conventions

Semantic atmospheric components are used first:

    omegaEastward
    omegaNorthward

Definitions:

    positive omegaEastward  -> positive vorticity along +eastward
    positive omegaNorthward -> positive vorticity along +northward

Component equations again:

    omegaEastward  = -shearNorthward
    omegaNorthward =  shearEastward

Examples:

- If `shearEastward > 0` and `shearNorthward = 0`, then
  `omegaEastward = 0` and `omegaNorthward > 0`.
- If `shearEastward = 0` and `shearNorthward > 0`, then
  `omegaEastward < 0` and `omegaNorthward = 0`.

The first version does not introduce magnitude or direction helper fields.
Callers that need `|ωh|` may use `|S|`, which is equal for this diagnostic.

---

## 7. Atmospheric components only

Vorticity must be computed from atmospheric semantic shear components:

    shearEastward
    shearNorthward

It must not be inferred from world-space `Vec3` X/Z components.

The result must not be converted to world coordinates in this diagnostic.

World conversion remains out of scope here. Any later world-space vorticity
boundary belongs in a separate document or API.

---

## 8. Finite-layer derived vorticity vs local pointwise curl

`HorizontalWindShear` is a finite-layer difference over `[h0, h1]`, not an
analytic derivative at one height.

Therefore `HorizontalVorticity` produced from that shear is also
finite-layer derived:

    layer-average horizontal vorticity implied by shear over [h0, h1]

It is not a claim of local pointwise curl at an interior height unless the
profile gradient is constant on that layer.

On a single piecewise-linear profile segment, finite-layer shear equals the
constant segment gradient, so the mapped vorticity equals the constant
segment horizontal vorticity.

Across kinks between segments, the result represents the vorticity implied
by the layer-average shear, not a point sample at a kink.

This diagnostic does not define a separate local curl operator.

---

## 9. Result type

Conceptual result:

    interface HorizontalVorticity {
      omegaEastward: number;   // 1/s
      omegaNorthward: number;  // 1/s
    }

The name emphasizes horizontal vorticity components in atmospheric
coordinates.

The first version does not return:

- omegaVertical;
- vorticity magnitude;
- vorticity direction;
- shear components mirrored into the result;
- layer endpoint heights.

`omegaVertical` is omitted because this diagnostic is horizontal-only.
Under the horizontally homogeneous assumption it would be zero, but the
result type does not carry a decorative zero component.

---

## 10. API

Conceptual API:

    horizontalVorticityFromShear(
      shear: HorizontalWindShear,
    ) -> HorizontalVorticity

Placement intent:

    diagnostic function separate from EnvironmentalWindProfile
    and separate from verticalWindShearBetween

Implementation intent:

    omegaEastward  = -shear.shearNorthward
    omegaNorthward =  shear.shearEastward

This function is a pure map. It does not:

- sample the profile;
- validate heights;
- invent a vorticity-specific error type;
- recompute shear from winds.

Height-domain validation remains the responsibility of
`verticalWindShearBetween`.

A profile-layer convenience such as `horizontalVorticityBetween(profile, h0,
h1)` is intentionally not part of the first API. It may be added later when
a real caller needs that wrapper.

---

## 11. Consume HorizontalWindShear directly

Decision for the first version:

    consume HorizontalWindShear directly

Do not recompute finite differences from the profile inside this diagnostic.

Reasons:

- the finite-layer shear definition already lives in document 05;
- recomputing winds would duplicate sampling and risk divergent boundary
  behavior;
- the vorticity equations for this flow are exactly a component permutation
  of shear;
- callers that already obtained shear should not be forced through a second
  profile sample path.

Recommended call sequence:

    shear = verticalWindShearBetween(profile, h0, h1)
    vorticity = horizontalVorticityFromShear(shear)

---

## 12. First validation cases

### Pure eastward speed shear

Given:

    shearEastward  = 0.01 / s
    shearNorthward = 0

expected:

    omegaEastward  = 0
    omegaNorthward = 0.01 / s

### Pure northward speed shear

Given:

    shearEastward  = 0
    shearNorthward = 0.01 / s

expected:

    omegaEastward  = -0.01 / s
    omegaNorthward = 0

### Linear segment shear from document 05

Given profile levels:

    1000 m -> eastward=10, northward=0,  vertical=0
    2000 m -> eastward=20, northward=10, vertical=0

For:

    h0 = 1000
    h1 = 2000

document 05 gives:

    shearEastward  = 0.01 / s
    shearNorthward = 0.01 / s

expected vorticity:

    omegaEastward  = -0.01 / s
    omegaNorthward =  0.01 / s

Also check:

    S · ωh = 0
    |ωh| = |S|

### Constant-speed directional shear

Given profile levels:

    0 m    -> eastward=0,  northward=10, vertical=0
    1000 m -> eastward=10, northward=0,  vertical=0

Horizontal wind speed is `10 m/s` at both levels; direction changes with
height.

For:

    h0 = 0
    h1 = 1000

shear:

    shearEastward  =  0.01 / s
    shearNorthward = -0.01 / s

expected vorticity:

    omegaEastward  =  0.01 / s
    omegaNorthward =  0.01 / s

Also check:

    S · ωh = 0
    |ωh| = |S|

### Zero shear

If both shear components are `0`, both vorticity components must be `0`.

---

## 13. Current scope

The first horizontal vorticity diagnostic is:

- derived only from `HorizontalWindShear`;
- finite-layer;
- ground-relative in the same sense as the parent shear;
- atmospheric-component based;
- independent of storm motion;
- independent of streamwise / crosswise bases;
- independent of SRH;
- independent of tilting and stretching;
- independent of world-space conversion.

It does not yet include:

- `horizontalVorticityBetween(profile, h0, h1)`;
- a vorticity-specific error type;
- magnitude / direction helpers;
- omegaVertical;
- storm-relative vorticity;
- streamwise / crosswise vorticity
  (defined separately in `docs/physics/08-streamwise-crosswise-vorticity.md`);
- SRH;
- tilting / stretching operators;
- world-space vorticity vectors;
- local pointwise curl API separate from shear.

---

## 14. Development rule

Atmospheric diagnostics that are scientifically defined in atmospheric
components must remain in atmospheric components until an explicit world
boundary is required.

Therefore:

    HorizontalWindShear
        ↓
    horizontalVorticityFromShear
        ↓
    HorizontalVorticity   // atmospheric, 1/s

not:

    world Vec3 shear or velocity
        ↓
    reverse-engineer atmospheric vorticity

---

## 15. Core lesson

For horizontally homogeneous environmental flow `V = (u(h), v(h), 0)`,
finite-layer horizontal vorticity is obtained from finite-layer vertical
shear by:

    omegaEastward  = -shearNorthward
    omegaNorthward =  shearEastward

That map yields a horizontal vorticity vector perpendicular to the shear
vector with equal magnitude.

The diagnostic consumes `HorizontalWindShear` directly and does not
recompute the profile.
