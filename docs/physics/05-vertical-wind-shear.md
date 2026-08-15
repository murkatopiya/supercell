# Vertical Wind Shear

## 1. Purpose

This document defines the first derived atmospheric diagnostic built on
`EnvironmentalWindProfile`: finite-layer vertical wind shear between two
heights.

Source of environmental wind:

    EnvironmentalWindProfile

This diagnostic answers:

    How does the ground-relative horizontal environmental wind change
    between height h0 and height h1?

It does not define:

- horizontal vorticity (see `docs/physics/06-horizontal-vorticity.md`);
- storm motion;
- storm-relative wind;
- storm-relative helicity;
- hodograph rendering;
- world-space shear vectors;
- local pointwise derivatives at a single height.

---

## 2. Relationship to EnvironmentalWindProfile

`docs/physics/04-environmental-wind-profile.md` defines the environmental
wind profile and notes that a later document would define the shear API.

This is that document.

Architectural dependency:

    EnvironmentalWindProfile
        ↓
    vertical wind shear between two heights

The profile remains the atmospheric source of truth.

Shear is a derived diagnostic. It must not become a second hidden copy of
the wind profile.

---

## 3. Mathematical definition

Given two heights:

    h0
    h1

with:

    h1 > h0

sample the environmental wind:

    V0 = EnvironmentalWindProfile.sampleAtHeight(h0)
    V1 = EnvironmentalWindProfile.sampleAtHeight(h1)

Define:

    deltaH = h1 - h0

    deltaEastward  = V1.eastward  - V0.eastward
    deltaNorthward = V1.northward - V0.northward

Then the finite-layer vertical shear is:

    shearEastward  = deltaEastward  / deltaH
    shearNorthward = deltaNorthward / deltaH

Units:

    shear components are in (m/s) / m = 1/s

This is a layer-average finite difference across `[h0, h1]`.

It is not an analytic derivative at a single height.

On a single piecewise-linear profile segment the finite-layer shear equals
the constant segment gradient. Across kinks between segments it represents
the average change over the requested layer.

---

## 4. Atmospheric components only

Shear must be computed from atmospheric semantic components:

    eastward
    northward

Shear must not be inferred from world-space `Vec3` X/Z components.

The result must not be converted to world coordinates in this diagnostic.

World conversion remains a separate boundary used by advection fields and
rendering, not by atmospheric shear diagnostics.

---

## 5. Result type

Conceptual result:

    interface HorizontalWindShear {
      shearEastward: number;   // 1/s
      shearNorthward: number;  // 1/s
    }

The name emphasizes that the quantity describes change of horizontal wind
with height.

There is no vertical shear component in this model because the first
environmental profile has:

    vertical = 0

at every height.

The first version does not return:

- shear magnitude;
- shear direction;
- deltaH;
- deltaEastward / deltaNorthward as separate fields.

Those may be derived by callers later if needed.

---

## 6. API

Conceptual API:

    verticalWindShearBetween(
      profile: EnvironmentalWindProfile,
      h0: number,
      h1: number,
    ) -> HorizontalWindShear

Placement intent:

    diagnostic function separate from EnvironmentalWindProfile

The profile class must not absorb shear, vorticity, or storm-relative
logic.

Sampling of winds for the diagnostic must use:

    profile.sampleAtHeight(...)

The diagnostic must not reimplement profile interpolation.

---

## 7. Profile range accessors

For diagnostics that must stay inside explicitly specified sounding data,
`EnvironmentalWindProfile` exposes read-only bounds:

    minHeight
    maxHeight

where:

    minHeight = lowest profile level height
    maxHeight = highest profile level height

These accessors do not expose the level array.

They do not change `sampleAtHeight` behavior.

---

## 8. Boundary policy: sampling clamp vs shear domain

`EnvironmentalWindProfile.sampleAtHeight` continues to clamp outside
`[minHeight, maxHeight]` for field/advection use.

That clamp is an advection convenience. It is not additional atmospheric
observation.

Vertical wind shear must not treat clamped continuation as real profile
data.

Therefore `verticalWindShearBetween` requires both layer endpoints to lie
inside the explicitly specified profile range:

    h0 >= profile.minHeight
    h1 <= profile.maxHeight

together with:

    h0 finite
    h1 finite
    h1 > h0

If any of these requirements fail, the diagnostic must fail explicitly with
`VerticalWindShearError`.

Invalid diagnostic requests include:

- `h0 === h1`;
- `h0 > h1`;
- non-finite heights;
- `h0 < profile.minHeight`;
- `h1 > profile.maxHeight`;
- any layer that crosses outside the specified profile range.

Do not compute:

- zero shear for both-outside layers;
- averaged/mixed shear for cross-boundary layers.

Those cases are invalid requests, not special numeric results.

---

## 9. Why shear rejects clamp while advection keeps clamp

Advection needs a defined world velocity at every tracer height, including
heights slightly outside a short sounding.

Shear is an interpretive atmospheric diagnostic.

Using clamped winds in shear would silently invent zero additional shear
outside the sounding and could disguise incomplete layer requests as
physical results.

Separation of policies:

    sampleAtHeight     -> may clamp for advection
    verticalWindShearBetween -> requires explicit profile range

---

## 10. Validation summary

`verticalWindShearBetween(profile, h0, h1)` must reject with
`VerticalWindShearError` unless all of the following hold:

    Number.isFinite(h0)
    Number.isFinite(h1)
    h1 > h0
    h0 >= profile.minHeight
    h1 <= profile.maxHeight

Heights may equal the profile endpoints:

    h0 === profile.minHeight   // allowed
    h1 === profile.maxHeight   // allowed

---

## 11. First validation cases

### Linear segment shear

Given profile levels:

    1000 m -> eastward=10, northward=0,  vertical=0
    2000 m -> eastward=20, northward=10, vertical=0

For:

    h0 = 1000
    h1 = 2000

expected:

    shearEastward  = 0.01 / s
    shearNorthward = 0.01 / s

### Sub-layer inside one linear piece

The same shear values must be returned for any sub-interval of that
segment, for example:

    h0 = 1000
    h1 = 1500

because the piecewise-linear profile has constant gradient on that piece.

### Constant wind layer

If eastward and northward do not change between `h0` and `h1`, both shear
components must be `0`.

### Invalid equal heights

    h0 === h1

must throw `VerticalWindShearError`.

### Invalid reversed heights

    h0 > h1

must throw `VerticalWindShearError`.

### Invalid outside range

Any request with:

    h0 < minHeight

or:

    h1 > maxHeight

must throw `VerticalWindShearError`.

This includes both-outside and cross-boundary layers.

---

## 12. Current scope

The first vertical wind shear diagnostic is:

- finite-layer;
- ground-relative;
- atmospheric-component based;
- defined only inside the explicit profile height range;
- independent of storm motion;
- independent of world-space velocity fields.

It does not yet include:

- horizontal vorticity (defined separately in
  `docs/physics/06-horizontal-vorticity.md`);
- streamwise / crosswise decomposition;
- storm-relative shear;
- SRH;
- hodograph construction;
- local shear at a single height;
- magnitude/direction helpers;
- world-space shear vectors.

---

## 13. Development rule

Atmospheric diagnostics that are scientifically defined in atmospheric
components must remain in atmospheric components until an explicit world
boundary is required.

Therefore:

    EnvironmentalWindProfile
        ↓
    verticalWindShearBetween
        ↓
    HorizontalWindShear   // atmospheric, 1/s
        ↓
    horizontalVorticityFromShear   // see docs/physics/06-horizontal-vorticity.md

not:

    EnvironmentalWindField
        ↓
    reverse-engineer shear from world Vec3

---

## 14. Core lesson

Vertical wind shear is derived from the environmental wind profile.

Advection may use clamped winds outside the sounding.

Shear may not.

A shear layer is valid only when both endpoints lie inside the explicitly
specified profile height range.
