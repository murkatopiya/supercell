# Environmental Wind Profile

## 1. Purpose

This document defines the first environmental wind-profile model in
Supercell Explorer.

The environmental wind profile describes the background horizontal
ground-relative wind as a function of height.

Conceptually:

    V_env = V_env(h)

This model is intentionally simpler than a complete atmospheric environment.

It does not define:

- storm motion;
- storm-relative wind;
- storm inflow;
- updraft;
- downdraft;
- mesocyclone rotation;
- turbulence.

Its purpose is to provide a clear atmospheric representation from which
vertical wind shear, hodographs, horizontal vorticity, and later
storm-relative diagnostics can be derived.

---

## 2. Atmospheric representation

The environmental wind profile operates in atmospheric coordinates and
semantic atmospheric velocity components.

Each level contains:

    height
    eastward
    northward
    vertical

where:

    height     -> meters
    eastward   -> m/s
    northward  -> m/s
    vertical   -> m/s

Profile `height` uses the same vertical coordinate axis and datum as the
canonical world `Y` axis.

In the first model:

    profile height = world position.y

There is no separate AGL, MSL, or terrain-relative conversion for profile
heights in this version.

The velocity value should use the project's canonical
`AtmosphericVelocity` representation.

Each level intentionally stores a full `AtmosphericVelocity`, including
`vertical`. For this environmental model, `vertical` must be `0`.

The profile must not store world-space `(x, y, z)` velocity components.

Meteorological notation may describe the same components as:

    u = eastward
    v = northward
    w = vertical

but internal semantic names should remain explicit where practical.

---

## 3. Vertical velocity in the first model

The first environmental wind profile describes background horizontal wind.

Therefore:

    vertical = 0

for every profile level.

This does not mean that the real atmosphere has no vertical motion.

It means only that vertical motion is outside the responsibility of this
specific model.

Future updraft, downdraft, or other vertical-motion mechanisms must not be
encoded implicitly into `EnvironmentalWindProfile`.

---

## 4. Profile levels

The profile is defined by discrete vertical levels.

Conceptually:

    [
      { height: h0, velocity: V0 },
      { height: h1, velocity: V1 },
      ...
      { height: hn, velocity: Vn }
    ]

Example:

    height = 0 m
    eastward = 5 m/s
    northward = 0 m/s
    vertical = 0 m/s

    height = 1000 m
    eastward = 10 m/s
    northward = 5 m/s
    vertical = 0 m/s

    height = 2000 m
    eastward = 15 m/s
    northward = 10 m/s
    vertical = 0 m/s

These values are illustrative only.

They do not define a canonical supercell environment.

DEMO laboratory knots are owned by rendering DEMO documents, not by
this primitive. The next deep DEMO profile is
`docs/rendering/09-deep-environmental-profile-demo.md`.

---

## 5. Level validity requirements

A valid profile must contain at least two levels.

For every level:

    height must be finite

    eastward must be finite
    northward must be finite
    vertical must be finite

For the first environmental model:

    vertical must equal 0

Profile heights must be strictly increasing:

    h[i + 1] > h[i]

Duplicate heights are invalid.

For example, this is invalid:

    1000 m -> V1
    1000 m -> V2

because the profile would be ambiguous and linear interpolation would have
zero vertical interval.

The first level is not required to be at:

    height = 0

A profile may begin above the reference ground.

---

## 6. Sampling the profile

The conceptual profile interface is:

    sampleAtHeight(height) -> AtmosphericVelocity

Sampling depends only on height.

The profile does not receive or interpret:

    world X position
    world Z position
    simulation time
    tracer state
    storm motion

The first profile is therefore horizontally homogeneous and steady.

At a given height, every horizontal location has the same environmental wind.

---

## 7. Linear interpolation

Between two profile levels, atmospheric velocity components are interpolated
linearly with height.

Given:

    lower level:
        height = h0
        velocity = V0

    upper level:
        height = h1
        velocity = V1

and:

    h0 <= h <= h1

define:

    f = (h - h0) / (h1 - h0)

Then:

    eastward(h)
      = eastward0 + f * (eastward1 - eastward0)

    northward(h)
      = northward0 + f * (northward1 - northward0)

For the current model:

    vertical(h) = 0

Interpolation is performed in atmospheric semantic components.

The profile must not convert to world-space `(x, y, z)` merely to perform
interpolation.

---

## 8. Boundary policy

The first synthetic environmental profile uses clamping outside its explicitly
specified vertical range.

Let:

    h_min = lowest profile height
    h_max = highest profile height

Then:

    if h < h_min:
        wind(h) = wind(h_min)

    if h > h_max:
        wind(h) = wind(h_max)

    if h_min <= h <= h_max:
        wind(h) = linearly interpolated profile wind

This is an explicit model boundary policy.

It must not be interpreted as a claim that the real atmosphere necessarily
has constant wind below or above the supplied profile.

The model simply continues the nearest known boundary value.

---

## 9. Boundary gradients

Clamping preserves continuity of velocity at the profile boundaries.

However, it may introduce a discontinuity in the vertical velocity gradient.

Inside the final profile segment:

    dV/dh may be nonzero

Immediately above h_max:

    dV/dh = 0

Likewise, immediately below h_min:

    dV/dh = 0

Therefore diagnostics involving shear, vorticity, or velocity gradients near
the profile boundaries must distinguish between:

    explicitly specified atmospheric profile data

and:

    clamped continuation imposed by the boundary policy

Clamped continuation must not silently be treated as additional atmospheric
observations.

---

## 10. EnvironmentalWindProfile is not a VelocityField

`EnvironmentalWindProfile` and `VelocityField` have different responsibilities.

The profile answers:

    "What is the environmental atmospheric wind at this height?"

Conceptually:

    EnvironmentalWindProfile.sampleAtHeight(height)
        -> AtmosphericVelocity

A `VelocityField` answers:

    "What is the world-space atmospheric velocity at this 3D position
     and simulation time?"

Conceptually:

    VelocityField.sample(position, time)
        -> Vec3

These responsibilities must remain separate.

`EnvironmentalWindProfile` must not implement `VelocityField` directly.

---

## 11. EnvironmentalWindField adapter

A separate `EnvironmentalWindField` adapts the atmospheric profile to the
simulation's world-space `VelocityField` interface.

Conceptually:

    EnvironmentalWindField implements VelocityField

Its sampling chain is:

    world position
        ↓
    height = position.y
        ↓
    EnvironmentalWindProfile.sampleAtHeight(height)
        ↓
    AtmosphericVelocity
        ↓
    atmosphericVelocityToWorld(...)
        ↓
    world Vec3

Using the project coordinate convention:

    world.x = eastward
    world.y = vertical
    world.z = -northward

Since the first environmental profile has:

    vertical = 0

the resulting world-space environmental velocity has:

    world.y = 0

The field may receive `time` because the `VelocityField` interface requires
it, but the first steady environmental profile does not depend on time.

---

## 12. Why profile and field are separate

Keeping `EnvironmentalWindProfile` separate from `EnvironmentalWindField`
preserves an important architectural boundary.

The profile represents atmospheric data and atmospheric semantics.

The field adapts that representation to simulation space.

If the profile implemented `VelocityField` directly, it would need to:

- accept a full world-space position while using only height;
- accept simulation time while currently ignoring it;
- expose world-space velocity even though atmospheric diagnostics need
  atmospheric components;
- mix atmospheric representation with simulation-coordinate adaptation.

The separate adapter avoids this semantic mixing.

---

## 13. Vertical wind shear

Vertical wind shear is derived from changes in horizontal environmental wind
with height.

For two levels:

    h0 -> V0
    h1 -> V1

the horizontal wind difference is:

    deltaV = V1 - V0

and a finite-layer approximation to vertical shear is:

    shear = deltaV / (h1 - h0)

The subtraction must be performed using atmospheric horizontal components:

    deltaEastward = eastward1 - eastward0
    deltaNorthward = northward1 - northward0

Shear must not be inferred by visually inspecting world-space X/Z components.

A later document will define the exact shear API and derived diagnostics.

---

## 14. Hodograph relationship

A hodograph is another representation of the same environmental wind profile.

For each height, the horizontal atmospheric wind components:

    (eastward, northward)

define a point in velocity space.

Connecting these points in height order produces the hodograph.

Therefore the hodograph should derive from:

    EnvironmentalWindProfile

not from rendered tracer trajectories and not from world-space geometry.

The hodograph is a visualization of atmospheric velocity-space structure.

It is not a separate atmospheric model.

The hodograph data foundation, types, encapsulation via `levelHeights()`,
and API contract are defined in:

    docs/physics/10-hodograph-basics.md

---

## 15. Horizontal vorticity

Vertical variation of horizontal environmental wind is related to horizontal
vorticity.

In standard meteorological coordinates, for a horizontally homogeneous flow
whose horizontal velocity varies with height:

    V = (u(h), v(h), 0)

the horizontal vorticity components are related to vertical derivatives of
the horizontal wind.

The project convention and API for that diagnostic are defined in:

    docs/physics/06-horizontal-vorticity.md

This document establishes only the dependency:

    EnvironmentalWindProfile
        ↓
    vertical wind shear
        ↓
    horizontal vorticity

Horizontal vorticity should be derived from atmospheric components first.

Conversion to world coordinates should occur only when a world-space vector
is required.

---

## 16. Ground-relative vs storm-relative wind

The environmental wind profile is ground-relative.

It does not know storm motion.

Let:

    V_env(h) = ground-relative environmental wind

and later:

    C = storm motion

Then storm-relative wind will be derived separately:

    V_sr(h) = V_env(h) - C

Neither `EnvironmentalWindProfile` nor `EnvironmentalWindField` should
silently subtract storm motion.

Storm-relative transformation is a separate operation with separate physical
meaning.

---

## 17. Future storm-relative diagnostics

Future diagnostics may combine:

    EnvironmentalWindProfile
    StormMotion

to derive:

    storm-relative wind
    streamwise / crosswise relationships
    storm-relative helicity

These diagnostics should consume atmospheric velocity components where that
representation matches the meteorological definition.

They must not require reversing world-space coordinate transformations by
guesswork.

---

## 18. Atmospheric source of truth

For environmental wind:

    EnvironmentalWindProfile

is the atmospheric source of truth.

From it, the project may derive multiple representations:

    EnvironmentalWindProfile
        |
        +--> EnvironmentalWindField
        |       -> world-space tracer advection
        |
        +--> Hodograph
        |       -> velocity-space representation
        |       -> docs/physics/10-hodograph-basics.md
        |
        +--> Vertical Wind Shear
        |       -> atmospheric diagnostic
        |
        +--> Horizontal Vorticity
        |       -> later atmospheric diagnostic
        |
        +--> Storm-Relative Wind
                -> later, with separate StormMotion

These derived representations must not become independent hidden copies of
the environmental wind model.

---

## 19. First validation cases

Before using the profile in storm-related mechanisms, validate it in isolation.

### Exact level

Given:

    h = level height

sampling must return exactly that level's atmospheric velocity.

### Midpoint interpolation

Given:

    h0 = 1000 m
    V0 = (eastward=10, northward=0, vertical=0)

    h1 = 2000 m
    V1 = (eastward=20, northward=10, vertical=0)

at:

    h = 1500 m

expected:

    eastward = 15 m/s
    northward = 5 m/s
    vertical = 0 m/s

### Lower clamp

For:

    h < h_min

expected:

    sampleAtHeight(h) = sampleAtHeight(h_min)

### Upper clamp

For:

    h > h_max

expected:

    sampleAtHeight(h) = sampleAtHeight(h_max)

### World adapter

For atmospheric velocity:

    eastward = 15
    northward = 5
    vertical = 0

`EnvironmentalWindField` must return:

    world.x = 15
    world.y = 0
    world.z = -5

All values are in SI units.

---

## 20. Invalid profile cases

Construction or validation of a profile must reject:

- fewer than two levels;
- duplicate heights;
- non-increasing heights;
- non-finite heights;
- non-finite velocity components;
- nonzero vertical velocity in the first environmental model.

Invalid input must not be silently repaired by sorting, deduplicating, replacing
values, or forcing vertical velocity to zero.

The caller must receive an explicit failure.

---

## 21. Current scope

The first environmental wind profile is:

- steady;
- horizontally homogeneous;
- piecewise linear with height;
- ground-relative;
- horizontal only;
- represented in atmospheric semantic components;
- clamped outside its specified vertical range.

It does not yet include:

- storm motion;
- storm-relative transformation;
- hodograph rendering;
- shear API (see `docs/physics/05-vertical-wind-shear.md`);
- horizontal-vorticity API (see `docs/physics/06-horizontal-vorticity.md`);
- SRH;
- time dependence;
- horizontal spatial variation;
- observational sounding import;
- numerical weather-model datasets.

Those last two items are not current-profile features. They are
candidate providers behind the **provider-neutral
environmental-profile contract**:

```text
docs/architecture/48-provider-neutral-environmental-profile-contract.md
```

They are not a 3D storm reconstruction (`44`).

That contract, if it later hosts more than one provider,
may treat inter-source disagreement as a sensitivity /
literacy signal. It must not treat that disagreement as
complete uncertainty or as a scalar `confidence`. First
sandbox source class is observed RAOB; exact archive is
research gate R1 in `48`. Provider #2 is not started.

Storm motion remains outside this profile. The environment
contract (`48`) distinguishes storm-motion **value**,
**source-or-method**, **validity**, and **provenance**: a
derived estimator (for example a Bunkers-type method from
the profile) and an observed track (for example radar /
cell tracking) can share a vector type without sharing
meaning. The current `StormMotion` type stays value-only.
See `44` §8.2 and `48` §8.

---

## 22. Development rule

Atmospheric diagnostics should derive from the atmospheric representation
whenever their scientific definition is naturally expressed in atmospheric
components.

World-space conversion should occur at the boundary where world-space behavior
or rendering is required.

Therefore:

    atmospheric meaning
        ↓
    AtmosphericVelocity / EnvironmentalWindProfile
        ↓
    derived atmospheric diagnostics

and separately:

    AtmosphericVelocity
        ↓
    explicit coordinate conversion
        ↓
    world-space VelocityField
        ↓
    numerical integration
        ↓
    tracer trajectory

The two representations must not be mixed implicitly.

---

## 23. Core lesson

`EnvironmentalWindProfile` answers:

    "How does the background atmospheric wind change with height?"

`EnvironmentalWindField` answers:

    "Given that profile, what world-space velocity should a tracer sample
     at this 3D position?"

They are related but not identical responsibilities.

The environmental profile remains in atmospheric semantics.

The field is the explicit adapter into simulation space.

Storm-relative wind, shear, vorticity, hodographs, and later helicity are
derived concepts.

They must not be hidden inside the profile.