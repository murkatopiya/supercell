# Diagnostic Tilting Tendency

**Status:** PHYSICS DERIVATION / DIAGNOSTIC SoT
**Scope:** diagnostic tilting of environmental horizontal vorticity
into vertical vorticity, in the current prescribed storm-relative
kinematic laboratory.
**Implementation:** none. Docs-only. Production `src/**` unchanged.
**Architecture:** not this document. Ownership, sampling, Inspector,
and rendering remain for a later architecture SoT.

```text
V_total:                 UNCHANGED
prescribed rotation Ω:   UNCHANGED
prognostic ω:            NOT INTRODUCED
stretching evolution:    NOT INTRODUCED
eighth VelocityField:    NOT INTRODUCED
vorticity → velocity:    NOT INTRODUCED
RK2 / continuity solver: NOT INTRODUCED
```

Predecessor direction revalidation (not replaced):

```text
docs/architecture/25-tilting-stretching-direction-revalidation.md
```

`25` remains the modeling-direction checkpoint. It ranked T1 as the
next earned *capability*. This file is the physics derivation of that
capability. It is not the T1 architecture SoT named in `25` §17.4.

Coordinate SoT:

```text
docs/physics/00-coordinate-system.md
```

Environmental vorticity chain:

```text
docs/physics/04-environmental-wind-profile.md
docs/physics/05-vertical-wind-shear.md
docs/physics/06-horizontal-vorticity.md
docs/physics/07-storm-relative-wind.md
docs/physics/08-streamwise-crosswise-vorticity.md
docs/physics/09-storm-relative-helicity.md
```

Updraft formula:

```text
docs/physics/15-vertical-updraft-envelope.md
```

Prescribed rotation (independent of T1):

```text
docs/physics/13-rotation-field.md
docs/physics/18-vertical-rotation-envelope.md
```

Composite / continuity caveats:

```text
docs/physics/12-composite-velocity-field.md
docs/architecture/10-composite-continuity-mass-budget-audit.md
```

Keep these roles distinct:

```text
CURRENT MODEL FACT
STANDARD METEOROLOGICAL THEORY
NEW PROJECT DERIVATION
STILL-BINDING CONTRACT
ANTI-CLAIM
DEFERRED
```

---

## 1. Purpose

This document answers:

    In the project's right-handed world coordinates, what is the
    local Eulerian diagnostic tilting tendency of vertical vorticity
    implied by environmental horizontal vorticity and the prescribed
    updraft's horizontal gradient of vertical velocity?

Canonical output:

    T_tilt,y(x, y, z)

It is a signed scalar source *term*, not a velocity, not a vorticity
state, and not an evolved mesocyclone.

It does **not** answer:

- how to implement a T1 API;
- where the diagnostic lives in the runtime;
- how Inspector or visualization should display it;
- how stretching should later evolve `ω_y`;
- how vorticity should ever change `V_total`.

---

## 2. Explicit non-goals

This derivation does **not**:

- change `V_total`;
- modify prescribed `Ω`;
- introduce prognostic `ω` or `ω_y` state;
- introduce stretching evolution;
- add an eighth `VelocityField`;
- close vorticity → velocity;
- introduce a continuity / RK2 solver;
- treat current downdraft / near-ground outflow as baroclinic
  vorticity generation;
- use `curl(RotationField)` or `curl(V_total)` as T1;
- calibrate T1 to DEMO `Ω`;
- turn SRH into a source amplitude;
- claim a full material tendency `Dω_y / Dt`;
- design architecture, tests, or UI.

---

## 3. Why project coordinates come first

Textbook meteorology commonly uses a right-handed triad

    x = East,  y = North,  z = Up

and writes vertical vorticity as `ω_z`.

Supercell Explorer does **not** use that triad
(`docs/physics/00-coordinate-system.md`).

Canonical world coordinates:

    +X = East
    +Y = Up
    +Z = South

Copying a z-up tilting formula into `(Vx, Vy, Vz)` without
conversion is a sign error waiting to happen.

In this project:

    ω_vertical = ω_y

Never call the project's vertical vorticity `ω_z` unless the
sentence is explicitly about textbook z-up notation.

---

## 4. Handedness

**Kind:** CURRENT MODEL FACT, from `00` §2–§3.

The world triad is right-handed:

    X × Y = Z

Check:

    East × Up = South

That is why `+Z` is South. The alternative

    X = East,  Y = Up,  Z = North

would be left-handed. The project does not use it.

Right-hand rule for rotation about `+Y` (`00` §13): thumb up,
fingers from East toward North. Viewed from above looking downward,
positive rotation about `+Y` appears counterclockwise.

Solid-body check, used as a curl sanity (not a T1 input):

    ω = (0, Ω, 0)
    V = ω × r = (Ω z, 0, −Ω x)

At a point on `+X` (east of the axis), `Vz = −Ω x < 0` for `Ω > 0`,
which is northward. East-side air going north is counterclockwise
from above. That matches `00`.

---

## 5. Curl convention

**Kind:** NEW PROJECT DERIVATION on the Cartesian identity, in
project axes.

Let world velocity be

    V = (Vx, Vy, Vz)

The right-handed Cartesian curl is

    ω = ∇ × V

    ω_x = ∂Vz/∂y − ∂Vy/∂z
    ω_y = ∂Vx/∂z − ∂Vz/∂x
    ω_z = ∂Vy/∂x − ∂Vx/∂y

Component meanings:

| World component | Axis | Atmospheric meaning |
| --- | --- | --- |
| `ω_x` | `+X` East | eastward vorticity |
| `ω_y` | `+Y` Up | **vertical vorticity** |
| `ω_z` | `+Z` South | southward vorticity |

Positive `ω_y` is cyclonic in the project's right-hand sense:
counterclockwise about `+Y` when viewed from above looking down.

The textbook z-up vertical component `ω_z^{met}` maps to this
`ω_y`, with **no extra sign flip**. Derived in §6.

Do not use meteorological names `u, v, w` as world components.

---

## 6. World vorticity ↔ atmospheric vorticity

**Kind:** NEW PROJECT DERIVATION from `00` plus `06`.

Atmospheric semantic wind (`00` §5, `AtmosphericVelocity`):

    eastward  →  Vx
    vertical  →  Vy
    northward →  −Vz

    Vx = u
    Vy = w
    Vz = −v

where `(u, v, w)` are used only as textbook synonyms for
`(eastward, northward, vertical)`.

Atmospheric horizontal vorticity (`06`) lives in east/north:

    ω_e = omegaEastward
    ω_n = omegaNorthward

World components of the same vector:

    ω_x = ω_e
    ω_z = −ω_n
    ω_y = ω_vertical

Because `+Z` is South, a positive northward vorticity is a
**negative** world `ω_z`.

Verification on the horizontally homogeneous environmental flow
of `04` / `06`:

    Vx = u(y),   Vy = 0,   Vz = −v(y)

Curl:

    ω_x = ∂Vz/∂y = −dv/dy = −shearNorthward = ω_e
    ω_y = 0
    ω_z = −∂Vx/∂y = −du/dy = −ω_n

This matches `horizontalVorticityFromShear`
(`src/physics/environment/horizontalVorticity.ts`):

    omegaEastward  = −shearNorthward
    omegaNorthward =  shearEastward

and confirms the world map

    (ω_x, ω_z) = (omegaEastward, −omegaNorthward)

Textbook z-up vertical vorticity

    ω_z^{met} = ∂v/∂x_east − ∂u/∂y_north

converts, with `v = −Vz` and `∂/∂north = −∂/∂z`, to

    ω_z^{met} = ∂Vx/∂z − ∂Vz/∂x = ω_y

So:

    project vertical vorticity  =  ω_y  =  textbook ω_z^{met}

The dangerous collision is **not** this vertical map. It is the
horizontal south/north map for `ω_z` and `∂/∂z`.

---

## 7. Vorticity equation: identity versus model

**Kind:** STANDARD METEOROLOGICAL THEORY, then restricted to this
laboratory.

### 7.1 Kinematic identity

For a velocity field `V` with vorticity `ω = ∇ × V`, the vector
calculus identity behind the vorticity equation is:

    Dω / Dt = (ω · ∇) V − ω (∇ · V) + ∇ × a

where `a` is the acceleration not already included in advection
(pressure/density, viscosity, and any other body force in the
momentum equation), and

    D/Dt = ∂/∂t + V · ∇

This is an identity plus whatever physics is put in `a`. It is
**not** yet a closed atmospheric model.

Standard incompressible inviscid form sets `∇ · V = 0` and omits
baroclinic / viscous `a`:

    Dω / Dt = (ω · ∇) V

That incompressible reduction is **STANDARD THEORY**. It is **not**
an exact governing equation of the current laboratory
(`10` is YELLOW; the updraft operand has `∇ · V = ∂Vy/∂y ≠ 0`).

### 7.2 Y-component of `(ω · ∇) V`

**Kind:** NEW PROJECT DERIVATION.

The Cartesian stretching/tilting vector has Y-component

    [(ω · ∇) V]_y
      = ω_x ∂Vy/∂x
      + ω_y ∂Vy/∂y
      + ω_z ∂Vy/∂z

Handedness does not add extra minus signs here. This is the
directional-derivative identity in orthonormal Cartesian axes.
The project's unusual axis names change *which* component is
vertical, not the algebra of `(ω · ∇) V`.

### 7.3 Split used by this project

Canonical split of that Y-component:

    TILT_Y     = ω_x ∂Vy/∂x + ω_z ∂Vy/∂z
    STRETCH_Y  = ω_y ∂Vy/∂y

Reason for the names, in *this* triad:

- `ω_x` and `ω_z` are the **horizontal** vorticity components;
- `∂Vy/∂x` and `∂Vy/∂z` are the **horizontal** derivatives of
  **vertical** velocity;
- their product reorients horizontal vortex tubes toward `±Y`;
- `ω_y ∂Vy/∂y` changes the *magnitude* of already-vertical
  vorticity by vertical strain.

Textbook z-up writes the same physics as

    tilt(ω_z^{met}) = ω_x^{met} ∂w/∂x + ω_y^{met} ∂w/∂y_north
    stretch         = ω_z^{met} ∂w/∂z

Do **not** read textbook `ω_y ∂w/∂y` as stretching in this
repository. In z-up, `y` is north, so that term is tilting. In
this repository, `y` is up, so `ω_y ∂Vy/∂y` is stretching.

### 7.4 Other terms, named and parked

Material tendency of vertical vorticity also includes:

    − V · ∇ ω_y                 advection of existing ω_y
    − ω_y (∇ · V)               dilatation
    (∇ × a)_y                   baroclinic, viscous, other

T1 is **not** the sum of these. T1 isolates `TILT_Y` as a
diagnostic product.

Canonical wording:

```text
T_tilt,y  = tilting contribution / tilting source term
          ≠ total material tendency Dω_y / Dt
```

---

## 8. Canonical quantity

### 8.1 Name and symbol

Canonical symbol for this project:

    T_tilt,y

Read: diagnostic tilting tendency of world-vertical vorticity.

Do not use `T_y` as the locked name. That form is too easy to
confuse with a total tendency of `ω_y`.

### 8.2 Semantic contract

`T_tilt,y` is:

| Property | Contract |
| --- | --- |
| Kind | Eulerian diagnostic |
| Locality | pointwise at `(x, y, z)` |
| Time | instantaneous snapshot |
| Units | `s⁻²` |
| Role | source *term* of vertical vorticity |
| Sign | `T_tilt,y > 0` tends to increase `ω_y` |

`T_tilt,y` is **not**:

- vertical vorticity `ω_y`;
- rotation velocity;
- an evolved mesocyclone;
- circulation;
- a parcel spin history;
- `Dω_y / Dt`;
- a reason the current `V_total` moves as it does.

### 8.3 Definition

**Kind:** NEW PROJECT DERIVATION, locked.

    T_tilt,y
      = ω_x ∂Vy/∂x + ω_z ∂Vy/∂z
      = ω_h^{world} · ∇_h Vy

where the world-horizontal vectors are

    ω_h^{world} = (ω_x, ω_z)
    ∇_h Vy      = (∂Vy/∂x, ∂Vy/∂z)

Equivalent atmospheric form, using `06` components and `00`
derivatives:

    T_tilt,y
      = ω_e ∂Vy/∂east + ω_n ∂Vy/∂north
      = ω_e ∂Vy/∂x − ω_n ∂Vy/∂z

because

    ∂/∂east  = ∂/∂x
    ∂/∂north = −∂/∂z
    ω_x = ω_e
    ω_z = −ω_n

The two forms are identical. Prefer the world form when operating
on `Vec3` fields. Prefer the atmospheric form when consuming
`HorizontalVorticity`. Convert explicitly. Never mix a northward
vorticity component with `∂/∂z` without the minus sign.

### 8.4 Which `ω` and which `Vy`

T1 v1 inputs are locked as follows.

Horizontal vorticity:

    environmental finite-layer ω_h
    from docs/physics/06-horizontal-vorticity.md
    via horizontalVorticityFromShear

not:

    curl of V_total
    curl of the updraft
    curl of prescribed rotation
    a 3D storm vorticity field

Vertical-velocity gradients:

    Vy of VerticalEnvelopeUpdraftField
    docs/physics/15-vertical-updraft-envelope.md

not:

    Vy of V_total
    Vy of the prescribed downdraft
    a buoyancy-derived w

`V_total.y` currently equals updraft plus downdraft (`Vy` of the
other five operands is identically zero). Using composite `Vy`
would fold the offset downdraft into the mesocyclone-tilting
story. That is a different honesty question and is **out of
scope** for T1 v1 (`25` §2.7).

---

## 9. Environmental `ω_h` input

**Kind:** CURRENT MODEL FACT, verified against `06` and
`src/physics/environment/horizontalVorticity.ts`.

### 9.1 What the current layer API returns

    horizontalVorticityFromShear(shear) → HorizontalVorticity

    HorizontalVorticity = {
      omegaEastward,    // 1/s
      omegaNorthward,   // 1/s
    }

Map, from `HorizontalWindShear`:

    omegaEastward  = −shearNorthward
    omegaNorthward =  shearEastward

The implementation uses `0 - shear.shearNorthward` to avoid IEEE
signed zero. The physics map is the same.

This result is:

- atmospheric east/north, not world `(x, z)`;
- finite-layer, not a pointwise curl API;
- implied by vertical shear of a **horizontally homogeneous**
  environmental profile `V = (u(h), v(h), 0)`;
- ground-relative in the same sense as parent shear (`05`, `06`);
- independent of storm motion (`06` §13);
- independent of the storm composite.

It is **not** local `ω(x, y, z)` of `V_total`.

### 9.2 World conversion required by T1

T1 in world components needs

    ω_x = omegaEastward
    ω_z = −omegaNorthward

Hodograph overlays already convert screen directions from these
atmospheric components. That UI transform is not this diagnostic
and must not be reused as the physics map.

### 9.3 Height association

`ω_h` from `06` is defined on a layer `[h0, h1]`, not at a single
height, except that on one piecewise-linear profile segment the
shear (and therefore `ω_h`) is constant.

DEMO `EnvironmentalWindProfile` is piecewise linear in height
(`04`). Interior to a knot interval, T1 may use that segment's
constant `ω_h` as the environmental vorticity at height `y`.

At an exact knot, adjacent segments may disagree. That kink policy
already belongs to `05` / `06`. T1 inherits it. Choosing a layer
when sampling at a point is an architecture question. Physics
requirement: every evaluation of `T_tilt,y` must name the
environmental `ω_h` it used.

### 9.4 Units and orthogonality

    |ω_h| = |S|          // 1/s
    S · ω_h = 0          // atmospheric horizontal plane

T1 does not need a new vorticity type. It consumes `06`.

---

## 10. Storm-motion invariance of `ω_h`

**Kind:** NEW PROJECT DERIVATION, checked against current code.

Let storm motion `C` be a **constant** horizontal translation
(`07`, `19`):

    C = (C_east, C_north)
    independent of (x, y, z, t)

Ground-relative environmental wind:

    V_env = (u(y), v(y), 0)

Storm-relative environmental wind (D1 diagnostic and D2
advection):

    u_sr = u − C_east
    v_sr = v − C_north
    w_sr = 0

Shear:

    ∂u_sr/∂y = ∂u/∂y
    ∂v_sr/∂y = ∂v/∂y

because `C` has no height derivative.

Therefore

    ω_e(V_sr) = −∂v_sr/∂y = −∂v/∂y = ω_e(V_env)
    ω_n(V_sr) =  ∂u_sr/∂y =  ∂u/∂y = ω_n(V_env)

Vector statement: curl of a spatially constant field is zero.

    ∇ × C = 0
    ∇ × (V_env − C) = ∇ × V_env

Current implementation agrees:

- `horizontalVorticityFromShear` never receives `C`;
- it maps ground-relative `HorizontalWindShear`;
- `StormRelativeEnvironmentalAdvectionField` subtracts constant
  `C` from the environmental *velocity* operand only (`19`).

Do not say “storm-relative vorticity” for this `ω_h`. The
vorticity of the environmental profile is unchanged by subtracting
constant storm motion. What *does* change is storm-relative
**velocity**, and therefore streamwise/crosswise projections and
SRH (`07`, `08`, `09`).

T1 consequence:

    if the updraft is unchanged, T_tilt,y is invariant under
    constant C.

Live laboratory frame (`StormRelativeLaboratory`) changes tracer
advection. It does not change T1's environmental `ω_h`.

---

## 11. Updraft gradients

**Kind:** NEW PROJECT DERIVATION from the locked `15` formula.
Verified against `VerticalEnvelopeUpdraftField.sample`.

### 11.1 Current production formula

    W0  = peakVerticalVelocity
    σ   = sigma
    y_b = baseHeight
    y_t = topHeight
    H   = y_t − y_b

    dx = x − centerX
    dz = z − centerZ
    r² = dx² + dz²

    E_r(r) = exp(−r² / (2 σ²))

    ξ(y) = (y − y_b) / H

    F(y) = sin(π ξ)     if y_b ≤ y ≤ y_t
    F(y) = 0            otherwise

    Vx = 0
    Vy = W0 E_r(r) F(y)
    Vz = 0

This is **not** a generic “Gaussian updraft.” The vertical factor
is a compact half-sine, not a height Gaussian. Horizontal structure
is Gaussian in `r`. The product is separable.

`W0 > 0` is required by the current type. Signs below take
`W0 > 0` as the production case and state the `W0 → −W0` reversal
as a mathematical sanity, not a supported field.

### 11.2 Radial derivative of `E_r`

    ∂E_r/∂x = E_r (−dx / σ²)
    ∂E_r/∂z = E_r (−dz / σ²)

### 11.3 Horizontal derivatives of `Vy` (T1 inputs)

    ∂Vy/∂x = W0 F(y) E_r (−dx / σ²)
    ∂Vy/∂z = W0 F(y) E_r (−dz / σ²)

Units: `(m/s) / m = s⁻¹`.

Vector form:

    ∇_h Vy = − (W0 F(y) E_r / σ²) (dx, dz)

For `W0 > 0` and `F > 0`, `∇_h Vy` points **inward**, toward the
updraft axis. `Vy` is largest on the axis and decays radially.

### 11.4 Vertical derivative (stretching boundary, not T1)

Inside `y_b < y < y_t` (`15` §9):

    ∂Vy/∂y = W0 E_r (π / H) cos(π ξ)

Outside:

    ∂Vy/∂y = 0

At `y = y_b` and `y = y_t`, `F` is `C⁰` but not classically
differentiable. T1 does **not** need `∂Vy/∂y`. Horizontal
derivatives of `Vy` remain classical: at the lids `F = 0`, so

    ∂Vy/∂x = ∂Vy/∂z = 0

and therefore `T_tilt,y = 0` there.

### 11.5 Geometry of `∇_h Vy`

| Location | `∂Vy/∂x`, `∂Vy/∂z` |
| --- | --- |
| axis `dx = dz = 0` | both `0` |
| outside `[y_b, y_t]` | both `0` (`F = 0`) |
| lids `y = y_b, y_t` | both `0` |
| far field `r → ∞` | `→ 0` (Gaussian) |
| interior, `W0 > 0`, `F > 0` | inward, `∝ −(dx, dz)` |

Maximum of `|∇_h Vy|` at fixed `y` with `F` fixed:

    |∇_h Vy| = (W0 |F| E_r / σ²) r

The function `r exp(−r²/(2σ²))` peaks at `r = σ`.

    |∇_h Vy|_max(y) = (|W0 F(y)| / σ) exp(−1/2)

`F` itself peaks at `y_mid = (y_b + y_t)/2`, where `F = 1`.

Sign of `F`: `F ≥ 0` everywhere in v1. `F > 0` strictly inside
the open layer. Reversing `W0` reverses `Vy` and `∇_h Vy`.

There is no production `derivative()` API (`15` §9.2, `25` §2.7).
The formulas above are analytic consequences of the locked
velocity field, not a current code surface.

---

## 12. Analytic T1 for the current updraft

**Kind:** NEW PROJECT DERIVATION.

Substitute §11.3 into §8.3. Environmental `ω_h` is horizontally
uniform, so `(ω_x, ω_z)` may be taken outside the radial factors.

    T_tilt,y(x, y, z)
      = − (W0 F(y) E_r(r) / σ²) (ω_x dx + ω_z dz)

Atmospheric equivalent:

    T_tilt,y
      = − (W0 F(y) E_r(r) / σ²)
          (ω_e dx − ω_n dz)

Dot-product reading:

    T_tilt,y = ω_h^{world} · ∇_h Vy

Therefore, at a fixed point:

- `|T_tilt,y|` is largest when `ω_h^{world}` is aligned or
  anti-aligned with `∇_h Vy`;
- `T_tilt,y = 0` when they are perpendicular, or when either
  factor vanishes;
- the sign of the product is the sign of the vertical-vorticity
  *tendency* in the `+Y` convention.

Because `∇_h Vy ∝ −r_h` inside the updraft,

    T_tilt,y ∝ − ω_h^{world} · r_h

for `W0 F E_r / σ² > 0`. Positive tendency lies on the flank
where the horizontal radius vector opposes `ω_h^{world}`.

`T_tilt,y` varies in `y` through `F(y)` and through the
environmental segment `ω_h(y)`. It is not a single 2D stamp
extruded through the chimney.

---

## 13. Vortex couple (mandatory anti-claim)

**Kind:** NEW PROJECT DERIVATION, agreeing with `25` §4.5 and
standard isolated-updraft theory.

For a **symmetric isolated updraft** plus **approximately uniform**
environmental `ω_h`, tilting does **not** automatically create one
single-signed mesocyclone.

It creates a **horizontal vortex couple**: opposite-sign
tendencies on opposite flanks.

### 13.1 Why

`∇_h Vy` is radial (inward for `W0 > 0`). A uniform `ω_h` dotted
into a radial field is a dipole:

    T_tilt,y ∝ − ω_h · r_h

That function is odd under

    r_h  →  −r_h

and zero on the diameter perpendicular to `ω_h`.

A monopole cyclonic core would require an additional process that
this diagnostic does not contain: preferential ingestion of one
flank, stretching of one sign, updraft/propagation asymmetry, or
a non-uniform `ω_h`. Those are later model classes. T1 must not
draw them.

### 13.2 Loci for `W0 > 0`, `F > 0`

Let `ω_h^{world}` be uniform and nonzero.

    T_tilt,y = 0
      on the updraft axis
      on the horizontal diameter through the axis perpendicular
        to ω_h^{world}
      outside the vertical envelope
      as r → ∞

    T_tilt,y > 0
      on the flank where ω_h^{world} · r_h < 0

    T_tilt,y < 0
      on the flank where ω_h^{world} · r_h > 0

### 13.3 Worked case: `ω_h` purely eastward

    ω_x > 0,  ω_z = 0
    T_tilt,y = − (W0 F E_r / σ²) ω_x dx

West of the axis (`dx < 0`): `T_tilt,y > 0` (cyclonic tendency).
East of the axis (`dx > 0`): `T_tilt,y < 0` (anticyclonic).
North–south diameter (`dx = 0`): `T_tilt,y = 0`.

Plan view, north up, east right, looking down:

```text
                 NORTH (−Z)
                     |
         T = 0       |       T = 0
                     |
    WEST  ----  T>0  ⊙  T<0  ----  EAST
    (−X)             |              (+X)
                 updraft
                     |
                 SOUTH (+Z)

    ω_h^{world} → East
    couple axis along East–West
    zero line along North–South
```

`⊙` is the updraft axis. `T>0` means positive `ω_y` tendency
(counterclockwise from above).

### 13.4 Mirror and reverse

Mirror a point through the axis along the gradient / `ω_h`
diameter: `T_tilt,y` changes sign and keeps magnitude, for this
symmetric `E_r`.

Reverse `ω_h`: the couple swaps signs.

Reverse `W0`: `∇_h Vy` reverses, so the couple swaps signs.

### 13.5 Streamwise vorticity does not cancel the couple in T1

Using the **full** environmental `ω_h` in `T_tilt,y` always
produces this dipole for uniform `ω_h` and a symmetric updraft.
Projecting onto streamwise `ω` before tilting would be a
**different** diagnostic. T1 v1 does not do that.

Preferential cyclonic organization of a real supercell is a
streamwise / SRH / subsequent-stretching story
(`08`, `09`, `25` §4.5). This laboratory does not evolve it.
A T1 map that showed only a cyclonic core would be false for
the current ingredients.

---

## 14. Streamwise vorticity and SRH

**Kind:** CURRENT MODEL FACT for the existing diagnostics;
NEW PROJECT DERIVATION for their relation to T1.

Keep these four objects separate.

| Quantity | What it is | Units |
| --- | --- | --- |
| `ω_h` | environmental horizontal vorticity from vertical shear (`06`) | `s⁻¹` |
| `omegaStreamwise` | projection of `ω_h` onto `V_sr,h` (`08`) | `s⁻¹` |
| SRH | `∫ V_sr,h · ω_h dh` over a height layer (`09`) | `m² s⁻²` |
| `T_tilt,y` | `ω_h · ∇_h Vy` at a point (this document) | `s⁻²` |

SRH is **not** a tilting tendency.

Streamwise vorticity is **not** vertical vorticity.

SRH is a **column integral** of storm-relative flow dotted into
`ω_h`. It diagnoses how much streamwise horizontal vorticity is
available in the *environment* relative to storm motion. It has
no updraft gradient in it.

Streamwise vorticity is the part of `ω_h` aligned with horizontal
storm-relative wind. Crosswise vorticity is the perpendicular
part. SRH's integrand is `|V_sr,h| * omegaStreamwise`; pure
crosswise vorticity contributes nothing to SRH (`09` §5).

Physical interpretation at diagnostic level only:

- T1 tilts **whatever horizontal vorticity is supplied**;
- for T1 v1 that supply is the full environmental `ω_h`;
- storm-relative inflow alignment (`08`, `09`) is a useful
  reading of *which part* of `ω_h` is streamwise in the inflow;
- that alignment is **not** a parameterization of
  `|T_tilt,y|`.

Do not write

    T_tilt,y ≈ (SRH) × (something)

as a production relation. That would smuggle a column integral
into a local Eulerian product.

Constant `C` changes SRH and streamwise/crosswise. It does not
change `ω_h` or T1 (§10). That alone proves SRH ≠ T1.

---

## 15. Tilting versus stretching

Hard boundary, in project coordinates:

    tilting:     T_tilt,y = ω_x ∂Vy/∂x + ω_z ∂Vy/∂z
    stretching:  T_stretch,y = ω_y ∂Vy/∂y

T1 owns tilting only.

### 15.1 Diagnostic vertical strain, without stretching tendency

The updraft's vertical strain

    ∂Vy/∂y    // s⁻¹

is already documented (`15` §9). It may be pointed at as a
diagnostic *rate of strain*. It is **not** a stretching tendency
until a named `ω_y` multiplies it.

    T_stretch,y = ω_y ∂Vy/∂y    // s⁻², NOT in T1

### 15.2 No ω_y, no stretching history

The laboratory has **no** evolved physical `ω_y`.

Therefore this document forbids the sentence

    after tilting, stretching amplifies the resulting vortex

as a description of current runtime evolution. There is no such
runtime.

T1 may diagnose where tilting *would* source `ω_y`. It may not
narrate a subsequent amplification history.

### 15.3 Prescribed-rotation curl is not that `ω_y`

`VerticalEnvelopeRotationField` has a documented identity
(`18` §18.2):

    ω_y^{Ω} = 2 Ω G(y) E (1 − r² / (2 σ²))

That is bookkeeping of the *painted* vortex. It is **not**
tilting-generated `ω_y`.

Anti-double-counting rule:

```text
Do not feed ω_y^{Ω} into T_stretch,y and call the product
supercell stretching of tilted environmental vorticity.

Do not add T_tilt,y onto ω_y^{Ω} as if they were the same
object at different times.
```

If a later document defines a diagnostic stretching row, it must
name its `ω_y` source. Default for T1: omit stretching tendency.

This file is **not** a stretching model SoT.

---

## 16. Prescribed rotation independence

**Kind:** STILL-BINDING CONTRACT (`18`, `25` §8 option 1).

Current DEMO rotation occupant:

    VerticalEnvelopeRotationField
    Vx = Ω E G dz
    Vy = 0
    Vz = −Ω E G dx

T1:

    does not modify Ω
    does not explain current Ω
    does not diagnose prescribed rotation as generated
    does not use curl(RotationField)
    is not calibrated to Ω

`Ω` remains a pedagogical / laboratory prescription.

Changing `Ω`, `G(y)`, or rotation `sigma` leaves `T_tilt,y`
unchanged, because T1's inputs are environmental `ω_h` and
updraft `∇_h Vy`.

---

## 17. Dilatation / continuity YELLOW

**Kind:** STANDARD THEORY plus CURRENT MODEL FACT.

The general Y-component includes

    − ω_y (∇ · V)

If `ω_y = 0`, this term is zero even when `∇ · V ≠ 0`. T1 v1
uses environmental `ω_h` and does not carry a vertical vorticity
state, so it does not evaluate dilatation.

The isolated updraft has (`15` §11)

    ∇ · V_updraft = ∂Vy/∂y     inside the open layer

The live seven-operand sum is **YELLOW** (`10`): independent
prescribed operands, not mass-consistent circulation.

Consequences:

- `T_tilt,y` *may* be computed kinematically from `ω_h` and
  `∇_h Vy`;
- that computation does **not** mean the laboratory is solving
  the vorticity equation of a mass-consistent flow;
- the incompressible identity `∂Vy/∂y = −∇_h · V_h` is **false**
  for the isolated updraft operand;
- stretching language that assumes vortex-tube volume
  conservation is stronger than this laboratory, and is another
  reason stretching stays out of T1.

Continuity YELLOW does **not** forbid T1 as a diagnostic product
(`25` §11). It forbids selling T1 as `Dω_y / Dt` of an
anelastic/incompressible supercell.

---

## 18. Baroclinic term

**Kind:** CURRENT MODEL FACT.

The baroclinic vorticity source has the schematic form

    (1 / ρ²) ∇ρ × ∇p

The current model has:

- no thermodynamics;
- no density field;
- no pressure field suitable for this product.

Therefore baroclinic generation is **not modeled**.

In particular:

- `VerticalEnvelopeDowndraftField` is a prescribed `Vy < 0`
  envelope, not a cold pool;
- `NearGroundRadialOutflowField` is prescribed near-ground
  radial outflow, not a density current;
- neither is an RFD/FFD baroclinic vorticity source.

T1 must not interpret those operands as solenoidal generation
(`15` architecture pedagogy anti-claims remain).

---

## 19. Units

| Quantity | Units |
| --- | --- |
| `ω_x`, `ω_z`, `ω_e`, `ω_n` | `s⁻¹` |
| `∂Vy/∂x`, `∂Vy/∂z`, `∂Vy/∂y` | `s⁻¹` |
| `T_tilt,y` | `s⁻²` |
| `ω_y ∂Vy/∂y` (not T1) | `s⁻²` |
| `W0` | `m s⁻¹` |
| `dx`, `dz`, `σ`, `H` | `m` |
| `F`, `E_r` | dimensionless |
| SRH | `m² s⁻²` |

Analytic T1:

    (W0 / σ²) × F × E_r × ω × dx
    (m s⁻¹) / m² × 1 × 1 × s⁻¹ × m  =  s⁻²

Dimensional analysis holds.

---

## 20. Sign / sanity cases

Assume T1 v1 inputs: environmental `ω_h`, updraft `Vy`.

| ID | Case | Expected |
| --- | --- | --- |
| A | No environmental shear, `ω_h = 0` | `T_tilt,y = 0` |
| B | Horizontally uniform `Vy` (`∇_h Vy = 0`) | `T_tilt,y = 0` |
| C | Symmetric updraft axis (`dx = dz = 0`) | `∇_h Vy = 0` ⇒ `T_tilt,y = 0` |
| D | Far outside the horizontal Gaussian | `T_tilt,y → 0` |
| E | `ω_h^{world} ⊥ ∇_h Vy` | `T_tilt,y = 0` |
| F | Reverse shear / reverse `ω_h` | `T_tilt,y` sign reverses |
| G | Mirror point across the axis along the `ω_h` diameter, symmetric updraft | opposite sign, same magnitude |
| H | Reverse `W0` (mathematical; production forbids `W0 ≤ 0`) | `∇_h Vy` and `T_tilt,y` reverse sign |
| I | Constant storm translation `C` | `ω_h` unchanged; `T_tilt,y` unchanged if the updraft is unchanged |
| J | Change prescribed `Ω` only | `T_tilt,y` unchanged |

J is the double-counting guard: T1 is not a diagnosis of painted
spin.

Additional zeros:

    y ∉ (y_b, y_t)  ⇒  F = 0  ⇒  T_tilt,y = 0
    lids y_b, y_t     ⇒  F = 0  ⇒  T_tilt,y = 0

---

## 21. DEMO order of magnitude

**Kind:** dimensional illustration on CURRENT DEMO numbers.
Not a retune. Not a generated-mesocyclone prediction.

DEMO updraft (`DEMO_SCENARIO`):

    W0 = 30 m/s
    σ  = 4000 m
    [y_b, y_t] = [0, 8000] m
    y_mid = 4000 m
    center = (0, 0) in (x, z)

DEMO environment, layer `[0, 1000]` m (hodograph fixture):

    shearEastward  = −0.01 s⁻¹
    shearNorthward = +0.01 s⁻¹
    omegaEastward  = −0.01 s⁻¹
    omegaNorthward = −0.01 s⁻¹
    |ω_h|          = √2 × 10⁻² ≈ 1.4 × 10⁻² s⁻¹

World:

    ω_x = −0.01 s⁻¹
    ω_z = +0.01 s⁻¹

At `y = 1000 m`:

    F = sin(π / 8) ≈ 0.38

At `r = σ`, `E_r = exp(−1/2) ≈ 0.61`, which is the radial peak of
`|∇_h Vy|` at that height:

    |∇_h Vy| ≈ (W0 F E_r) / σ  ≈ 1.7 × 10⁻³ s⁻¹

Aligned-couple magnitude at that location:

    |T_tilt,y| ≲ |ω_h| |∇_h Vy|  ≈ 2 × 10⁻⁵ s⁻²

At `y_mid = 4000 m`, `F = 1`, but that height sits on the
`2000–6000 m` profile segment, where

    |ω_h| ≈ 5 × 10⁻³ s⁻¹

and

    |∇_h Vy|_max ≈ (W0 / σ) exp(−1/2) ≈ 4.5 × 10⁻³ s⁻¹
    |T_tilt,y| ≲ 2 × 10⁻⁵ s⁻²

Order of magnitude for live DEMO:

    |ω_h|        ∼ 10⁻² s⁻¹
    |∇_h Vy|     ∼ 10⁻³ s⁻¹
    |T_tilt,y|   ∼ 10⁻⁵ s⁻²

A characteristic time `1 / |T_tilt,y|` is many hours. That number
is **not** a mesocyclone formation time. T1 is an instantaneous
local product, not an integrated ODE.

Hypothetical accumulation, **dimensional illustration only**:

    T_tilt,y × 600 s  ∼  10⁻² s⁻¹

is the same unit family as prescribed `ω_y^{Ω} ∼ 2Ω = 0.01 s⁻¹`
on the axis. This juxtaposition is **not** a model prediction
that ten minutes of tilting produces the DEMO mesocyclone. The
laboratory does not integrate `T_tilt,y`. Prescribed `Ω` is
independent (§16).

---

## 22. Local versus parcel semantics

`T_tilt,y` is an Eulerian snapshot at a point `P` and laboratory
time `t`.

A scientific tracer may occupy a point where `T_tilt,y ≠ 0`.
The tracer does **not** own vorticity state. Tracers are probes
of `V`, not carriers of `ω` (`01`, `25` §2.8).

Forbidden without a later prognostic parcel/state model:

    this tracer receives this much vorticity

Allowed as diagnostic context:

    at this point, the environmental/updraft product T_tilt,y
    has this sign and magnitude

That distinction is mandatory for any later Inspector use.

---

## 23. What could later be shown

Conceptual only. Not UI. Not architecture.

`T_tilt,y` could later be:

- sampled at an arbitrary point `P`;
- mapped as an Eulerian signed diagnostic layer;
- recognized as a vortex couple around the updraft;
- queried near a selected tracer as environmental/updraft
  diagnostic context.

It must **not** become:

- an eighth velocity contribution;
- a comet operand tint in the current `|V_i|` sense;
- an answer to “why `V_total` moves this way.”

Those last two questions remain Level-2 operand sums of the
prescribed `V_i` (`19` architecture).

---

## 24. Physics requirements for a later architecture SoT

This section lists invariants a future architecture document must
preserve. It does **not** assign ownership, choose analytic versus
finite-difference evaluation, or design APIs.

```text
MUST PRESERVE
  V_total unchanged
  prescribed Ω unchanged
  T_tilt,y = ω_x ∂Vy/∂x + ω_z ∂Vy/∂z
  ω_vertical = ω_y
  ω_x = omegaEastward
  ω_z = −omegaNorthward
  T1 uses environmental ω_h, not curl(Ω) or curl(V_total)
  T1 v1 uses updraft Vy, not composite or downdraft Vy
  T_tilt,y ≠ ω_y ≠ V_rotation ≠ SRH
  stretching tendency omitted unless a named ω_y is introduced
    by a later physics document
  continuity remains YELLOW; T1 is not Dω_y/Dt
  no eighth VelocityField
  no ω → V closure

MUST NAME WHEN IMPLEMENTING
  which environmental layer/segment supplies ω_h at P
  lid policy (T1 is zero there by F = 0)
  world vs atmospheric conversion boundary

MUST NOT DECIDE HERE
  module placement
  caching
  Inspector payload
  rendering
  ScenarioConfig fields
  test harness structure
```

---

## 25. Anti-claims

```text
T_tilt,y  ≠  vertical vorticity ω_y
T_tilt,y  ≠  mesocyclone
T_tilt,y  ≠  rotation velocity
T_tilt,y  ≠  circulation
T_tilt,y  ≠  parcel spin history
T_tilt,y  ≠  full Dω_y / Dt
T_tilt,y  ≠  mass-consistent dynamics
T_tilt,y  ≠  SRH
T_tilt,y  ≠  streamwise vorticity
T_tilt,y  ≠  explanation of prescribed Ω
```

Current model is still **not**:

- CFD;
- mass-consistent circulation;
- a prognostic supercell;
- a realistic parcel model;
- cold-pool dynamics;
- an RFD/FFD model;
- a cloud / precipitation model.

Tilting of uniform environmental `ω_h` by this updraft is a
**vortex couple**, not a single cyclonic mesocyclone.

---

## 26. External sources

Separated from project facts.

STANDARD METEOROLOGICAL THEORY (schematic vorticity equation,
tilting vs stretching, isolated-updraft couple, streamwise
organization):

- Holton, J. R., and G. J. Hakim, 2013: *An Introduction to
  Dynamic Meteorology.* 5th ed. Academic Press. Vorticity
  equation; stretching/tilting decomposition in Cartesian form.
- Markowski, P., and Y. Richardson, 2010: *Mesoscale Meteorology
  in Midlatitudes.* Wiley. Supercell rotation; tilting of
  environmental horizontal vorticity; stretching of vertical
  vorticity.
- Davies-Jones, R., 1984: Streamwise vorticity: The origin of
  updraft rotation in supercell storms. *J. Atmos. Sci.*, **41**,
  2991–3006.
- Rotunno, R., and J. B. Klemp, 1985: On the rotation and
  propagation of simulated supercell thunderstorms. *J. Atmos.
  Sci.*, **42**, 271–292.

These sources use z-up meteorological coordinates. All component
equations taken from them were rewritten in project axes in
§5–§8. They are **not** current-model facts. The isolated-updraft
vortex couple is standard theory; the project's T1 formula is a
new derivation on `06` + `15`.

PROJECT SoT / CURRENT MODEL FACT: documents listed in the header,
plus the named production types.

NEW PROJECT DERIVATION: §§5–8, 10–13, 19–20, and the T1 formula.

---

## 27. Deferred

```text
T1 architecture SoT
production diagnostic API
Inspector / visualization
stretching physics SoT
prognostic ω_y
ω → V closure
eighth operand / Y12
continuity solver
baroclinic generation
downdraft / RFD tilting honesty
using composite Vy in T1
parameterizing T1 from SRH
replacing prescribed Ω
```

---

## 28. Decision output

### A. Is T1 diagnostic tilting tendency physically well-defined
for the current prescribed laboratory?

**YES.**

It is well-defined as a local Eulerian kinematic product of
existing environmental `ω_h` and analytic `∇_h Vy` of the
prescribed updraft, in the project's right-handed coordinates.

The YES is scoped: T1 is a tilting *source term*, not
`Dω_y / Dt`, not generated rotation, and not mass-consistent
dynamics. Those caveats are definitional, not unresolved
blockers.

### B. Exact inputs

    environmental HorizontalVorticity (ω_e, ω_n)
      or equivalently world (ω_x, ω_z) = (ω_e, −ω_n)
    VerticalEnvelopeUpdraftField parameters / formula
      enough to evaluate ∂Vy/∂x and ∂Vy/∂z at P
    evaluation point P = (x, y, z)
    named environmental layer/segment for ω_h(y)

Not inputs: `Ω`, `C` (except that `C` must not be mistaken for
an `ω_h` change), other velocity operands, tracers.

### C. Exact output

    T_tilt,y(P)  // scalar, s⁻²
    world-vertical tilting source term
    ω_h^{world} · ∇_h Vy_updraft

### D. Can it be evaluated without changing `V_total`?

**YES.** Observation of existing fields.

### E. Does it require prognostic `ω`?

**NO.**

### F. Does continuity YELLOW prevent this diagnostic?

**NO.** It prevents over-reading the diagnostic as incompressible
vorticity dynamics.

### G. Does prescribed `Ω` contaminate / double-count T1?

**NO**, provided T1 does not use `curl(Ω)` and copy does not
explain `Ω` as T1. Inputs are independent. Sanity J must remain
true.

### H. Is T1 ready to receive a separate architecture SoT?

**YES.** Physics contract is locked. Architecture ownership,
sampling, and product placement are still unwritten, as required
by `25` §17.4.

---

## 29. Compact lock-in

```text
coordinates:          X East, Y Up, Z South
                      right-handed: X × Y = Z
curl:                 ω = ∇ × V
vertical vorticity:   ω_y   (NOT textbook ω_z)
ω_h world:            (ω_x, ω_z) = (ω_e, −ω_n)
tilting:              T_tilt,y = ω_x ∂Vy/∂x + ω_z ∂Vy/∂z
stretching:           ω_y ∂Vy/∂y   (boundary only; not T1)
ω_h input:            environmental HorizontalVorticity
Vy gradients:         VerticalEnvelopeUpdraftField
                      ∂Vy/∂x = W0 F E_r (−dx/σ²)
                      ∂Vy/∂z = W0 F E_r (−dz/σ²)
analytic T1:          −(W0 F E_r / σ²)(ω_x dx + ω_z dz)
units:                s⁻²
geometry:             vortex couple, not one mesocyclone
C invariance:         constant C does not change ω_h or T1
Ω independence:       prescribed rotation is not an input
SRH:                  not T1
continuity:           YELLOW; T1 ≠ Dω_y/Dt
baroclinic:           omitted
V_total:              unchanged
prognostic ω:         none
architecture SoT:     not this file
physics verdict:      YES
```
