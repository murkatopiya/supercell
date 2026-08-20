# Streamwise / Crosswise Vorticity

## 1. Purpose

This document defines the first streamwise / crosswise decomposition of
horizontal vorticity in Supercell Explorer.

It decomposes existing horizontal vorticity relative to the horizontal
projection of existing storm-relative wind.

Inputs:

    StormRelativeWind
    HorizontalVorticity

from:

    docs/physics/07-storm-relative-wind.md
    docs/physics/06-horizontal-vorticity.md

This diagnostic answers:

    Of the horizontal vorticity ω_h, how much is streamwise and how much is
    crosswise relative to horizontal storm-relative flow V_sr,h?

It does not define:

- storm-relative helicity (SRH);
- tilting (see `docs/physics/22-diagnostic-tilting-tendency.md`;
  streamwise vorticity is not `T_tilt,y`);
- stretching;
- updraft or mesocyclone dynamics;
- Bunkers or other storm-motion estimators;
- recomputation of shear, vorticity, or storm-relative wind;
- world-space conversion;
- profile-aware wrappers.

---

## 2. Relationship to prior diagnostics

Architectural dependency:

    EnvironmentalWindProfile
        ↓
    verticalWindShearBetween → HorizontalWindShear
        ↓
    horizontalVorticityFromShear → HorizontalVorticity

    AtmosphericVelocity + StormMotion
        ↓
    stormRelativeWind → StormRelativeWind

Then:

    StormRelativeWind + HorizontalVorticity
        ↓
    decomposeHorizontalVorticity
        ↓
    StreamwiseCrosswiseVorticity

This diagnostic consumes already computed results.

It must not:

- sample `EnvironmentalWindProfile`;
- call `verticalWindShearBetween`;
- call `horizontalVorticityFromShear`;
- call `stormRelativeWind`.

Horizontal vorticity remains defined in document 06.

Storm-relative wind remains defined in document 07.

This document only introduces an orthonormal horizontal basis tied to
`V_sr,h` and the signed projections of `ω_h` onto that basis.

---

## 3. Horizontal flow only

Let:

    StormRelativeWind = (eastward, northward, vertical)

Define the horizontal storm-relative wind:

    V_sr,h = (u, v)
           = (StormRelativeWind.eastward, StormRelativeWind.northward)

The vertical storm-relative component is ignored by this decomposition.

Reason:

- the quantity being decomposed is horizontal vorticity `ω_h`;
- the meteorological streamwise / crosswise split used here is defined in
  the horizontal plane relative to horizontal storm-relative flow;
- using the full 3D `StormRelativeWind` direction would change the meaning
  of "streamwise" and is outside this foundation.

Document 07 preserves `V_sr.vertical = V_env.vertical`. That passthrough does
not participate in this diagnostic.

---

## 4. Mathematical definition

Atmospheric horizontal plane:

    eastward
    northward

Vertical orientation for this project:

    up = +height

The atmospheric right-handed triad is:

    eastward, northward, up

Let:

    ω_h = (ω_e, ω_n)
        = (HorizontalVorticity.omegaEastward,
           HorizontalVorticity.omegaNorthward)

    V_sr,h = (u, v)
    |V| = hypot(u, v)

Require:

    |V| > 0

Unit vectors:

    s_hat = (u, v) / |V|          // streamwise, along V_sr,h
    c_hat = (-v, u) / |V|         // left-normal, +90° CCW from s_hat
                                  // in the atmospheric east–north plane

Signed components:

    omegaStreamwise = ω_h · s_hat
                    = (ω_e * u + ω_n * v) / |V|

    omegaCrosswise  = ω_h · c_hat
                    = (ω_e * (-v) + ω_n * u) / |V|

Units:

    1/s

These two equations are the canonical definition for this project.

---

## 5. Crosswise orientation

`c_hat` is the left-normal of `V_sr,h`:

    rotate s_hat by +90° counterclockwise in east–north

looking with up pointing toward the reader in the usual plan-view sense of
the atmospheric east–north plane.

Therefore:

- positive `omegaCrosswise` means `ω_h` has a component along that
  left-normal;
- negative `omegaCrosswise` means a component along the opposite
  (right-normal) direction.

An equivalent identity is:

    omegaCrosswise = [up · (V_sr,h × ω_h)] / |V|

with the atmospheric triad east–north–up.

That cross-product form may be used as a check.

It is not the sole defining statement; the defining statement is projection
onto `c_hat`.

---

## 6. Sign conventions for streamwise

    positive omegaStreamwise -> ω_h component along +V_sr,h
    negative omegaStreamwise -> ω_h component against V_sr,h

Examples:

- `V_sr,h` parallel to `ω_h` with the same sense →
  `omegaStreamwise = +|ω_h|`, `omegaCrosswise = 0`
- `V_sr,h` anti-parallel to `ω_h` →
  `omegaStreamwise = -|ω_h|`, `omegaCrosswise = 0`

---

## 7. Result type

Conceptual result:

    interface StreamwiseCrosswiseVorticity {
      omegaStreamwise: number;  // 1/s
      omegaCrosswise: number;   // 1/s
    }

The first version returns only these signed scalars.

It does not return:

- |V_sr,h|;
- |ω_h|;
- s_hat / c_hat;
- reconstructed vector components;
- magnitude helpers;
- angles.

Callers may reconstruct `ω_h` from the basis when needed:

    ω_h = omegaStreamwise * s_hat + omegaCrosswise * c_hat

---

## 8. API

Conceptual API:

    decomposeHorizontalVorticity(
      stormRelativeWind: StormRelativeWind,
      horizontalVorticity: HorizontalVorticity,
    ) -> StreamwiseCrosswiseVorticity

Placement intent:

    diagnostic function separate from profile, shear, vorticity, and
    storm-relative wind modules' core definitions

The function uses only:

    stormRelativeWind.eastward
    stormRelativeWind.northward
    horizontalVorticity.omegaEastward
    horizontalVorticity.omegaNorthward

It ignores:

    stormRelativeWind.vertical

---

## 9. Domain policy: zero horizontal storm-relative flow

If:

    stormRelativeWind.eastward === 0
    and
    stormRelativeWind.northward === 0

then `V_sr,h` has no direction.

Streamwise and crosswise are undefined.

The diagnostic must fail explicitly with:

    StreamwiseCrosswiseVorticityError

Notes:

- IEEE signed zero `-0` compares equal to `0` under `===`, so `-0` counts as
  zero naturally under this exact check;
- no magnitude threshold and no epsilon are used;
- any nonzero horizontal flow, no matter how small, is in domain for v1;
- very small nonzero `|V|` is mathematically defined but may be numerically
  ill-conditioned; that reliability issue is separate from the undefined
  zero-flow case and is not solved by a hidden threshold in this diagnostic.

---

## 10. Invariants

When the request is in domain (`|V| > 0`):

### Norm partition

    omegaStreamwise^2 + omegaCrosswise^2 = |ω_h|^2

where:

    |ω_h|^2 = omegaEastward^2 + omegaNorthward^2

### Reconstruction

With:

    s_hat = (u, v) / |V|
    c_hat = (-v, u) / |V|

    omegaEastward  = omegaStreamwise * s_hat.east
                   + omegaCrosswise  * c_hat.east

    omegaNorthward = omegaStreamwise * s_hat.north
                   + omegaCrosswise  * c_hat.north

These identities validate the decomposition.

They are not additional physical models.

---

## 11. Distinction from shear-perpendicular vorticity

Document 06 states that for the simplified horizontally homogeneous
environmental flow:

    ω_h is perpendicular to the vertical-shear vector S

That orthogonality is about shear versus vorticity.

Streamwise / crosswise orthogonality is about `ω_h` versus the
storm-relative flow basis `(s_hat, c_hat)`.

Do not treat "perpendicular to shear" as identical to "crosswise relative to
storm-relative wind".

They are different bases and different diagnostics.

---

## 12. First validation cases

### Parallel

Given:

    V_sr,h = (2, 0)
    ω_h    = (3, 0)

expected:

    omegaStreamwise = 3
    omegaCrosswise  = 0

### Anti-parallel

Given:

    V_sr,h = (2, 0)
    ω_h    = (-3, 0)

expected:

    omegaStreamwise = -3
    omegaCrosswise  = 0

### Perpendicular, positive crosswise

Given:

    V_sr,h = (1, 0)
    ω_h    = (0, 1)

then:

    s_hat = (1, 0)
    c_hat = (0, 1)

expected:

    omegaStreamwise = 0
    omegaCrosswise  = 1

### Perpendicular, negative crosswise

Given:

    V_sr,h = (1, 0)
    ω_h    = (0, -1)

expected:

    omegaStreamwise = 0
    omegaCrosswise  = -1

### Fixed oblique case

Given:

    V_sr,h = (3, 4)
    ω_h    = (4, 3)

then:

    |V| = 5

    s_hat = (3/5, 4/5)
    c_hat = (-4/5, 3/5)

expected:

    omegaStreamwise = 4.8
    omegaCrosswise  = -1.4

Also check:

    omegaStreamwise^2 + omegaCrosswise^2 = |ω_h|^2
    4.8^2 + (-1.4)^2 = 4^2 + 3^2 = 25

and reconstruction:

    omegaEastward  = 4.8*(3/5) + (-1.4)*(-4/5) = 4
    omegaNorthward = 4.8*(4/5) + (-1.4)*( 3/5) = 3

### Zero vorticity

Given:

    V_sr,h = (5, 1)
    ω_h    = (0, 0)

expected:

    omegaStreamwise = 0
    omegaCrosswise  = 0

### Zero horizontal storm-relative flow

Given:

    StormRelativeWind.eastward  === 0
    StormRelativeWind.northward === 0

for any `HorizontalVorticity`, including nonzero vorticity, the diagnostic
must throw `StreamwiseCrosswiseVorticityError`.

This includes cases where vertical storm-relative wind is nonzero, because
vertical is ignored and horizontal flow is still zero.

### No world-coordinate conversion

The diagnostic must be expressed and tested only with atmospheric semantic
components and the derived scalars above.

It must not read or write world-space `x`, `y`, or `z` components.

---

## 13. Current scope

The first streamwise / crosswise diagnostic is:

- a pure projection of existing `HorizontalVorticity` onto the flow basis of
  existing horizontal `StormRelativeWind`;
- atmospheric-component based;
- defined only for nonzero horizontal storm-relative flow;
- independent of SRH, tilting, stretching, and storm-motion estimation.

It does not yet include:

- thresholds for small nonzero `|V|`;
- returning speed, vorticity magnitude, or basis vectors;
- SRH integration;
- streamwise / crosswise shear;
- world-space glyphs or rendering encodings;
- profile-layer convenience wrappers.

---

## 14. Development rule

Atmospheric diagnostics that are scientifically defined in atmospheric
components must remain in atmospheric components until an explicit world
boundary is required.

Therefore:

    StormRelativeWind + HorizontalVorticity
        ↓
    decomposeHorizontalVorticity
        ↓
    StreamwiseCrosswiseVorticity   // atmospheric, 1/s

not:

    world Vec3 wind or vorticity
        ↓
    reverse-engineer streamwise / crosswise components

---

## 15. Core lesson

For nonzero horizontal storm-relative flow:

    s_hat = (u, v) / |V|
    c_hat = (-v, u) / |V|

    omegaStreamwise = ω_h · s_hat
    omegaCrosswise  = ω_h · c_hat

`c_hat` is the left-normal in the atmospheric east–north plane with
east–north–up orientation.

Exact horizontal zero flow makes the basis undefined and must error.

Streamwise / crosswise decomposition consumes existing diagnostics; it does
not replace them.
