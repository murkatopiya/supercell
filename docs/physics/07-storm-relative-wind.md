# Storm-Relative Wind

## 1. Purpose

This document defines the first storm-relative wind foundation in
Supercell Explorer.

It introduces storm motion `C` and derives storm-relative wind from
ground-relative environmental wind by horizontal translation of the storm
frame:

    V_sr = V_env - C   (horizontal components only; see §4)

This diagnostic answers:

    Given ground-relative environmental wind and a horizontal storm motion,
    what is the storm-relative wind?

It does not define:

- streamwise / crosswise decomposition
  (see `docs/physics/08-streamwise-crosswise-vorticity.md`);
- storm-relative helicity (SRH);
- Bunkers or other storm-motion estimators;
- mesocyclone physics;
- storm-relative shear or vorticity;
- hodograph rewriting in the storm-relative frame;
- storm-relative position-coordinate transforms;
- world-space conversion;
- profile-aware convenience wrappers.

---

## 2. Relationship to the environmental wind profile

`docs/physics/04-environmental-wind-profile.md` establishes:

    V_env(h) = ground-relative environmental wind

    C = storm motion

    V_sr(h) = V_env(h) - C

and requires that neither `EnvironmentalWindProfile` nor
`EnvironmentalWindField` silently subtract storm motion.

Architectural dependency for this foundation:

    AtmosphericVelocity V_env   // already sampled, ground-relative
    StormMotion C               // horizontal storm translation
        ↓
    stormRelativeWind
        ↓
    StormRelativeWind

Sampling remains a separate responsibility:

    V_env = EnvironmentalWindProfile.sampleAtHeight(h)
    V_sr  = stormRelativeWind(V_env, C)

The profile remains the atmospheric source of truth for ground-relative
environmental wind.

Storm-relative wind must not become a second hidden copy of the profile.

---

## 3. Storm-relative wind is not storm-relative coordinates

`docs/physics/00-coordinate-system.md` defines storm-relative **position**
coordinates:

    X_storm
    Y_storm
    Z_storm

as a spatial frame relative to a storm reference position and potentially its
motion.

This document defines storm-relative **wind**: a velocity obtained by
subtracting horizontal storm motion from ground-relative environmental wind
in atmospheric semantic components.

These are different concepts.

    storm-relative wind        -> velocity diagnostic (this document)
    storm-relative coordinates -> position-frame transform (document 00)

This foundation does not implement, imply, or replace the storm-relative
position-coordinate transform.

World and storm-relative **coordinates** must still never be silently mixed.
That rule remains in document 00 and is outside the scope of this velocity
map.

---

## 4. Mathematical definition

Atmospheric semantic components:

    eastward
    northward
    vertical

Units for all velocity and storm-motion components in this document:

    m/s

Let:

    V_env = ground-relative environmental wind
          = (eastward_env, northward_env, vertical_env)

    C     = storm motion
          = (eastward_c, northward_c)

The first storm motion model is horizontal translation only. `C` has no
vertical member.

Define storm-relative wind:

    V_sr.eastward  = V_env.eastward  - C.eastward
    V_sr.northward = V_env.northward - C.northward
    V_sr.vertical  = V_env.vertical

The storm-relative frame translates horizontally.

It does **not** remove environmental vertical velocity.

Therefore vertical storm-relative wind equals ground-relative environmental
vertical wind in this foundation.

For the current `EnvironmentalWindProfile`, every level has:

    vertical = 0

so with that profile:

    V_sr.vertical = 0

always. That is a property of the present environmental model, not a rule
that storm-relative transformation zeros vertical velocity in general.

---

## 5. Representing storm motion

Conceptual type:

    interface StormMotion {
      eastward: number;   // m/s
      northward: number;  // m/s
    }

Horizontal-only shape encodes the first-model invariant:

    storm motion is a horizontal translation

Do not include a `vertical` member constrained to zero.

Absence of `vertical` is the representation of horizontal-only motion.

`StormMotion` is a distinct semantic type from `AtmosphericVelocity`, even
though TypeScript structural typing may allow assignment between compatible
shapes. This foundation accepts structural typing and does not add brands or
`kind` fields.

Storm motion must not be stored as world-space `(x, y, z)`.

The current type carries **value only**. That is honest for the
prescribed V1 constant `C`. A future provider-neutral
environmental-profile contract must distinguish at least value,
source-or-method, validity, and provenance. A Bunkers-type
(or other) derived `C` and an observed radar/cell-tracked `C`
are not interchangeable because both can fill this vector
shape. This document does not design that DTO, select Bunkers,
or change the subtraction map. See
`docs/architecture/44-long-term-source-and-reconstruction-boundary.md`.

---

## 6. Result type

Conceptual result:

    interface StormRelativeWind {
      eastward: number;   // m/s
      northward: number;  // m/s
      vertical: number;   // m/s
    }

`StormRelativeWind` remains a full atmospheric velocity triple.

It uses the same component names and units as `AtmosphericVelocity`, but it
has different frame semantics:

    AtmosphericVelocity   -> ground-relative environmental (when sampled
                             from EnvironmentalWindProfile)
    StormMotion           -> horizontal storm translation
    StormRelativeWind     -> wind relative to that storm motion

The first version does not return:

- magnitude;
- direction;
- storm-relative shear;
- streamwise / crosswise components;
- world-space vectors.

---

## 7. Avoiding frame mixing

All three quantities are mathematically horizontal or full velocity vectors
in atmospheric components. They must not be mixed by silent reinterpretation.

| Quantity | Frame | Type |
|---|---|---|
| `V_env` | ground-relative environmental | `AtmosphericVelocity` from profile sampling |
| `C` | horizontal storm motion | `StormMotion` |
| `V_sr` | storm-relative wind | `StormRelativeWind` |

Rules for this foundation:

- use distinct semantic types and an explicit function name;
- subtract only through `stormRelativeWind`;
- do not treat `StormRelativeWind` as a drop-in environmental profile value;
- do not convert to world coordinates inside this diagnostic;
- do not redefine shear, horizontal vorticity, or hodographs as
  storm-relative in this document.

Ground-relative shear and horizontal vorticity remain as defined in
documents 05 and 06 until a later storm-relative diagnostic is specified.

---

## 8. API

Conceptual API:

    stormRelativeWind(
      environmentWind: AtmosphericVelocity,
      stormMotion: StormMotion,
    ) -> StormRelativeWind

Placement intent:

    one module exporting:
      StormMotion
      StormRelativeWind
      stormRelativeWind

Implementation intent:

    return {
      eastward:  environmentWind.eastward  - stormMotion.eastward,
      northward: environmentWind.northward - stormMotion.northward,
      vertical:  environmentWind.vertical,
    }

This function is a pure map.

It does not:

- sample `EnvironmentalWindProfile`;
- validate heights;
- validate finiteness;
- invent a `StormMotionError` or factory;
- convert to world coordinates;
- modify storm motion estimators.

Runtime validation of storm motion belongs at future external or input
boundaries, not in this foundation slice.

A profile-aware wrapper such as:

    stormRelativeWindAtHeight(profile, height, stormMotion)

is intentionally not part of the first API.

---

## 9. Relationship to EnvironmentalWindField

`EnvironmentalWindField` adapts ground-relative environmental wind into
world-space tracer advection.

This foundation does not change that boundary.

Storm-relative wind must not be silently injected into
`EnvironmentalWindField`.

Any future storm-relative advection or rendering path requires an explicit
documented boundary of its own.

---

## 10. First validation cases

### Horizontal match with nonzero environmental vertical

Given:

    V_env = (eastward=10, northward=5, vertical=2)
    C     = (eastward=10, northward=5)

then:

    horizontal(V_env) = C

implies:

    V_sr.eastward  = 0
    V_sr.northward = 0
    V_sr.vertical  = 2

That is:

    horizontal(V_sr) = 0
    V_sr.vertical = V_env.vertical

### Current environmental profile reduction

For the current environmental profile model:

    V_env.vertical = 0

the same horizontal match reduces to:

    V_sr = (0, 0, 0)

### Stationary storm

Given:

    C = (eastward=0, northward=0)

then:

    V_sr.eastward  = V_env.eastward
    V_sr.northward = V_env.northward
    V_sr.vertical  = V_env.vertical

### East / west sign case

Given:

    V_env.eastward = 10
    C.eastward     = 3

then:

    V_sr.eastward = 7

Given:

    V_env.eastward = 10
    C.eastward     = 15

then:

    V_sr.eastward = -5

### North / south sign case

Given:

    V_env.northward = 8
    C.northward     = 2

then:

    V_sr.northward = 6

Given:

    V_env.northward = 8
    C.northward     = 12

then:

    V_sr.northward = -4

### Mixed-vector subtraction

Given:

    V_env = (eastward=12, northward=-4, vertical=0)
    C     = (eastward=5,  northward=3)

expected:

    V_sr = (eastward=7, northward=-7, vertical=0)

### Vertical passthrough with nonzero storm-relative horizontal wind

Given:

    V_env = (eastward=6, northward=1, vertical=3)
    C     = (eastward=1, northward=1)

expected:

    V_sr = (eastward=5, northward=0, vertical=3)

### No world-coordinate conversion

The diagnostic must be expressed and tested only in atmospheric semantic
components:

    eastward
    northward
    vertical

It must not read or write world-space `x`, `y`, or `z` velocity components.

---

## 11. Current scope

The first storm-relative wind foundation is:

- pure subtraction of horizontal storm motion from sampled environmental
  wind;
- atmospheric-component based;
- independent of profile sampling inside the map;
- independent of world-space conversion;
- independent of storm-motion estimation methods.

It does not yet include:

- `StormMotion` factory or runtime validation error type;
- storm-motion source / method / validity / provenance metadata
  (future environmental-profile contract; `44`);
- profile-aware wrappers;
- streamwise / crosswise decomposition
  (see `docs/physics/08-streamwise-crosswise-vorticity.md`);
- SRH;
- Bunkers motion;
- mesocyclone physics;
- storm-relative shear;
- storm-relative vorticity;
- storm-relative hodograph mode;
- storm-relative position-coordinate transforms;
- world-space storm-relative fields.

---

## 12. Development rule

Atmospheric diagnostics that are scientifically defined in atmospheric
components must remain in atmospheric components until an explicit world
boundary is required.

Therefore:

    AtmosphericVelocity + StormMotion
        ↓
    stormRelativeWind
        ↓
    StormRelativeWind   // atmospheric, m/s

not:

    EnvironmentalWindField / world Vec3
        ↓
    reverse-engineer storm-relative wind

and not:

    EnvironmentalWindProfile.sampleAtHeight
        ↓
    silently return storm-relative values

---

## 13. Core lesson

Storm-relative wind is derived, not stored in the environmental profile.

For horizontal storm motion `C = (C_east, C_north)`:

    V_sr.eastward  = V_env.eastward  - C_east
    V_sr.northward = V_env.northward - C_north
    V_sr.vertical  = V_env.vertical

`StormMotion` is horizontal-only by shape.

`StormRelativeWind` remains a full velocity triple.

Storm-relative wind is not the storm-relative position-coordinate transform
from document 00.
