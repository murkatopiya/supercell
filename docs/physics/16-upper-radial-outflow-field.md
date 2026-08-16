# Upper Radial Outflow Field

## 1. Purpose

This document defines the first controlled upper-level horizontal
divergence / outflow mechanism in Supercell Explorer:
`UpperRadialOutflowField` v1.

It answers:

    Given a vertical axis, a Gaussian radial scale, and a bounded
    vertical layer, what world-space horizontal radial velocity does a
    passive tracer sample when the flow is directed outward and is
    active predominantly inside that layer?

`UpperRadialOutflowField` is a mathematically transparent, steady,
axisymmetric, purely horizontal velocity field directed away from a
fixed vertical axis and multiplied by a compact vertical envelope. It
is the first storm mechanism whose horizontal velocity depends on
height.

It is **not**:

- an anvil model;
- a pressure-driven or buoyancy-driven outflow;
- a continuity solver or mass-consistent supercell;
- a downdraft or surface cold-pool outflow;
- storm-relative motion;
- a claim that air which rose in `VerticalEnvelopeUpdraftField` is
  the same air leaving here.

The `storm/` module path means: controlled storm mechanism. It does
**not** mean full or realistic supercell physics.

The type is named `UpperRadialOutflowField`, not `UpperDivergenceField`
or `UpperOutflowField`. Naming rationale is in §12.

---

## 2. Relationship to existing foundations

`docs/physics/02-velocity-field-basics.md` §29 already records that
upper-level outflow may visually show air spreading after rising, and
that divergence is a property of the velocity field, not a particle
effect. This document is the first isolated formula for that laboratory
mechanism. Continuity must still be considered (§18); considering it
does not mean solving it.

`docs/physics/00-coordinate-system.md` establishes:

    +X = East
    +Y = Up
    +Z = South

The world origin is **not** automatically the outflow axis. Altitude is
world `y`. `y = 0` is the reference ground; negative `y` is
mathematically allowed.

`docs/physics/01-parcel-basics.md` §27–28, §32: visually spreading
tracers are not atmospheric mass density, and correct tracer
integration does not imply mass conservation. Those warnings apply
here.

`docs/physics/03-numerical-integration-basics.md` distinguishes field
error from integrator error. The unbounded linear map
`r(t) = r0 exp(+A t)` is **not** the oracle for this Gaussian-modulated
field.

`docs/physics/14-radial-inflow-field.md` is the height-independent
inward sibling: same Gaussian-linear radial family, opposite
horizontal sign, no vertical envelope. Negative
`radialStrainRate` remains invalid on that type. This document does
**not** evolve `RadialInflowField` into a signed or height-dependent
dual-mode API.

`docs/physics/15-vertical-updraft-envelope.md` is the first compact
vertical envelope in the project (`F(y)` on `[baseHeight, topHeight]`).
This field uses a compact vertical window for a **horizontal**
velocity. It does **not** read updraft parameters, does not start
automatically at the updraft `topHeight`, and does not cancel
`∂Vy/∂y`. Envelope comparison is independent (§9); the half-sine is
not copied merely because the updraft uses it.

`docs/physics/13-rotation-field.md` is the tangential companion in the
same Gaussian radial family. This field is purely radial, not
tangential.

`docs/physics/12-composite-velocity-field.md` already authorizes
generic world-space addition. Composition of this field with the
current DEMO operands is **out of scope** for this document's first
implementation slice.

`docs/architecture/01-scenario-config.md` and
`docs/rendering/07-composite-upper-radial-outflow-demo.md` first owned
DEMO wiring of this field. Current DEMO composition is
`docs/rendering/08-composite-lower-radial-inflow-demo.md`. This
physics document does not own that wiring. Isolated physics tests for
`UpperRadialOutflowField` must not require ScenarioConfig.

Architectural role:

    UpperRadialOutflowField implements VelocityField
        ↓
    sample(position, time) → world Vec3

First implementation slice:

    isolated UpperRadialOutflowField
      + sampling tests
      + isolated tracer acceptance

Laboratory sums such as

    V_total = V_environment + V_updraft + V_rotation
            + V_radial_inflow + V_upper_radial_outflow

are **out of scope** for this document's first implementation slice.

---

## 3. Physical problem

### 3.1 What the current updraft does

`VerticalEnvelopeUpdraftField` lifts tracers inside a finite vertical
layer:

    Vy = W0 * E_r(r) * F(y)
    Vx = Vz = 0

`F → 0` at `topHeight`. Above that lid, this updraft contributes
`(0, 0, 0)`.

Nothing in that field, in `RadialInflowField`, or in `RotationField`
automatically produces **upper-level horizontal spreading**.

Current DEMO after the updraft lid
(`docs/rendering/06-composite-vertical-envelope-updraft-demo.md` §9):

- environment still advects horizontally;
- rotation and inflow still act at every height;
- there is no upper-level outflow operand.

Tracers can stop rising without being carried outward by a dedicated
aloft mechanism.

### 3.2 Required new capability

The new mechanism must answer only:

    How does one prescribe a controlled horizontal velocity directed
    away from a vertical axis and active predominantly at chosen
    upper levels?

Required properties:

- purely horizontal (`Vy = 0`);
- radially outward for `r > 0` inside the active layer;
- vertically localized (not the same at every height);
- independently parameterized from updraft and inflow;
- defined as a composable `VelocityField` on all world space.

### 3.3 What this field is not claiming

This is a **prescribed** laboratory field. It is not:

- the kinematic continuation of a particular updraft parcel;
- the mass-conserving counterpart of low-level inflow;
- anvil geometry, storm-top divergence, or tropopause interaction.

A tracer path in a later composite may travel through inflow, updraft,
and this outflow in sequence. That visual sequence is not a continuity
identity (§18, §20).

---

## 4. What UpperRadialOutflowField is

`UpperRadialOutflowField` is a world-space `VelocityField` whose only
nonzero components are horizontal, directed away from a fixed vertical
axis, and scaled by a compact vertical envelope.

Conceptually:

    V(x, y, z, t) = (Vx(r, y), 0, Vz(r, y))

where `r` is horizontal radial distance from the axis in the world
`X`–`Z` plane, the horizontal vector is purely radial and outward, and
`y` enters only through a scalar envelope `G(y)`.

v1 is separable:

    V_horizontal(r, y) = radial_outflow(r) * G(y)

Properties of v1:

- Gaussian-modulated linear radial profile (defined below);
- compact half-sine vertical envelope on `[baseHeight, topHeight]`;
- steady (independent of `time`);
- height-dependent (independent of `y` only through `G`);
- axisymmetric about the vertical axis through the center;
- defined at every finite world position;
- continuous in space (`C^0`); infinitely smooth in `(x, z)`;
  not `C^1` in `y` at the lids.

This is a controlled laboratory mechanism. It is not a claim about
real anvil-level storm outflow.

---

## 5. Center

The outflow axis is fixed by a horizontal center in world coordinates:

    center = (centerX, centerZ)

Units: meters.

The center does **not** include a `centerY`. Vertical localization is
owned by `baseHeight` / `topHeight`, not by a point on the axis.

The center must not be silently assumed to be the world origin.

v1 does **not** introduce a shared `storm.center` with
`VerticalEnvelopeUpdraftField`, `RadialInflowField`, or
`RotationField`. This field owns its own `centerX` and `centerZ`. A
later demo may pass equal numbers without merging the types.

---

## 6. Horizontal radius

Define horizontal offset from the center:

    dx = x - centerX
    dz = z - centerZ

    r² = dx² + dz²
    r  = sqrt(r²) ≥ 0

`r` is a non-negative length in meters in the world horizontal plane
(`X`, `Z`). World `Y` does not enter `r`.

The outward-positive radial unit direction in that plane, for `r > 0`,
is the direction of `(dx, dz)`. Velocity is parallel to that vector
inside the active layer.

---

## 7. Radial profile comparison

The radial factor is a horizontal speed law `v_r(r)`, outward-positive,
before multiplication by `G(y)`.

### 7.1 Candidate A — Gaussian-modulated linear (sign-reversed inflow)

    v_r(r) = +A * r * exp( -r² / (2 σ²) )

    E  = exp( -r² / (2 σ²) )
    Vx = +A * E * dx * G(y)
    Vz = +A * E * dz * G(y)

| Property | Value |
|---|---|
| Axis | `v_r(0) = 0`; no `0/0` |
| Division by `r` | none; offset form is mandatory |
| Peak `|v_r|` at `G = 1` | `A σ / √e` at `r = σ` |
| Far field | `v_r → 0` as `r → ∞` |
| Smoothness in `r` | `C^∞` |
| Near-axis | `v_r ≈ +A r G` |
| `div_h` at `G = 1` | `+A E (2 − r²/σ²)` |
| Interpretability | same radial family as `RadialInflowField` / `RotationField` |
| Testing | formula match, cardinals, peak at `r = σ`, no `r`-division |

This is the natural geometric sibling of `RadialInflowField`, with
opposite horizontal sign. Siblinghood is a formula family, not a
reason to inherit types (§19).

### 7.2 Candidate B — unbounded linear outflow

    v_r(r) = +A r
    Vx = +A dx,  Vz = +A dz

Smooth and singular-free, but `|V|` grows without bound. Already
rejected for inflow (`docs/physics/14-radial-inflow-field.md` §15).
Incompatible with the Gaussian storm-mechanism pattern. Rejected.

### 7.3 Other radial forms considered and rejected

| Candidate | Why rejected |
|---|---|
| Rankine-like (`A r` then `B/r`) | derivative jump; division by `r`; not the project Gaussian family |
| Gaussian speed with unit radial vector `A E (dx, dz)/r` | `0/0` on the axis; peak not at a transparent strain coefficient |
| Exponential `A r exp(−r/σ)` | extra family with no advantage over the existing Gaussian |

### 7.4 Canonical radial profile

**Candidate A is canonical.**

It is chosen because it is regular on the axis, has no division by
`r`, decays at infinity, has an elementary peak, matches the existing
storm-field radial family, and is directly testable.

It is **not** chosen merely “because it is the opposite of inflow”.
The comparison above is the reason. Sign reversal of the inflow
formula is the outcome, not the argument.

v1 does **not** leave the radial profile as an implementation option.

---

## 8. Canonical radial formula

Let:

    A     = outflowStrainRate
    sigma = horizontal Gaussian scale

Radial velocity, outward-positive, before the vertical envelope:

    v_r(r) = +A * r * exp( -r² / (2 * sigma²) )

World components without constructing a unit radial vector:

    E  = exp( -r² / (2 * sigma²) )

    Vx = +A * E * dx * G(y)
    Vy = 0
    Vz = +A * E * dz * G(y)

This offset form is mandatory. Implementations must **not** normalize
`(dx, dz)` and divide by `r`. On the axis (`r = 0`):

    dx = 0, dz = 0  ⇒  V = (0, 0, 0)

with no `0/0`, at every height.

Derived radial properties at `G = 1`, not additional API:

- `v_r(0) = 0`;
- for `A > 0` and `r > 0`, `v_r(r) > 0` (outward at every finite
  radius; there is no outer inflow band);
- peak `|v_r|` at `r = sigma`:

      |v_r|_max(G=1) = A * sigma / sqrt(e)

- as `r → ∞`, `v_r → 0`;
- near the axis (`E ≈ 1`):

      v_r(r) ≈ +A r G(y)

  so at the envelope maximum (`G = 1`), `A` is the near-axis radial
  strain rate `lim_{r→0} v_r / r`.

There is no compact horizontal support and no exact-zero radial
cutoff. Far-field decay is entirely given by the Gaussian formula.

---

## 9. Vertical envelope comparison

v1 needs a scalar window `G(y)` such that the mechanism is off outside
a chosen height band and reaches a documented maximum inside it.

This is **not** the same design problem as the updraft envelope `F(y)`.

For `VerticalEnvelopeUpdraftField`, the half-sine is the textbook first
vertical mode of a layer with `w = 0` at both lids. Horizontal outflow
has **no** analogous kinematic lid constraint: nothing requires
`|V_horizontal| = 0` at the edges of a convective tower. The lids here
are a localization window: “this mechanism is off outside this band.”

Isolated tracers of this field have `Vy = 0`, so `y` is frozen and
`G(y0)` is a constant scale along a trajectory. Envelope smoothness
therefore does **not** affect the isolated radial ODE, unlike the
updraft case where `F(y)` is re-sampled as the particle rises.

### 9.1 Candidate A — half-sine on a finite interval

    G(y) = sin(π ξ)     for y_b ≤ y ≤ y_t
    G(y) = 0            otherwise

    ξ = (y − y_b) / H
    H = y_t − y_b > 0

| Property | Value |
|---|---|
| Domain of nonzero `G` | closed interval `[y_b, y_t]` |
| `G(y_b)`, `G(y_t)` | `0` |
| Maximum | `G = 1` at `y_mid` |
| Smoothness of `G` | `C^0`; not `C^1` at the lids |
| Hidden normalization | none; `max G = 1` by construction |
| New parameters | 2 (`baseHeight`, `topHeight`) |
| Outside the interval | exact `0`, no Gaussian tail |
| Isolated tracer ODE | `G(y0)` is a constant; radial motion as in §23 |
| Interpretability | compact upper-level window with unit peak |

The velocity field is continuous. Vertical derivatives of `Vx`, `Vz`
jump at the lids. That is an explicit, documented transition, not a
hidden epsilon wall (`docs/physics/02-velocity-field-basics.md` §36).

### 9.2 Candidate B — Gaussian in height

    G(y) = exp( −(y − y_peak)² / (2 σ_y²) )

Never exactly zero. A weak tail would exist at the ground for any
finite `y_peak`. That leaks “upper-level” outflow into low levels and
fails the problem statement. No chosen base/top with `G = 0`.
Rejected for v1.

### 9.3 Candidate C — squared sine / Hann bump

    G(y) = sin²(π ξ)     for y_b ≤ y ≤ y_t
    G(y) = 0             otherwise

Compact, `max G = 1` at `y_mid`, `C^1` at the lids (`G' = 0` from both
sides). Gentler vertical shear of the horizontal wind at the edges.

For a horizontal field, lid shear is more visible than for a purely
vertical updraft: `∂Vx/∂y` is horizontal vorticity. Hann would remove
the jump in that shear.

It is a reasonable smoother alternative. It is **not** canonical for
v1: extra trigonometric factor, quieter near the lids, and isolated
tracers do not use `G'` at all. If lid shear of `V_h` later becomes a
documented problem, reopen this choice explicitly. Do not treat Hann
as a silent implementation upgrade.

### 9.4 Candidates not used

| Candidate | Why rejected |
|---|---|
| One-sided “everything above `y_b`” (`G → 1` as `y → +∞`) | no upper bound; not a layer |
| Peak pinned to updraft `topHeight` | forbidden coupling to another type |
| `C^∞` compact bump | testing cost; overkill |
| Quadratic `4ξ(1−ξ)` | elementary but not enough advantage over A |

### 9.5 Canonical vertical envelope

**Candidate A, the half-sine on `[baseHeight, topHeight]`, is canonical.**

Reasons that are **not** “the updraft already uses it”:

1. Compact support with exact zeros — required so the field is off
   below and above a chosen band, including at the ground if
   `baseHeight ≥ 0`.
2. `max G = 1` with no hidden scale, so `outflowStrainRate` keeps its
   near-axis meaning at `y_mid` (§11).
3. Only two vertical parameters; peak height is derived (`y_mid`).
4. Elementary `G` and `G'`.
5. Isolated radial ODE is the inflow sibling with a constant
   `A_eff = A G(y0)`.

The half-sine is a compact unit window, not a claim that horizontal
outflow is the first kinematic mode of a lid with `w = 0`.

Rejected, with the reason that would reopen the choice:

- **B** — leaks to all heights;
- **C** — smoother lid shear, not needed for v1 isolated contract;
- one-sided aloft plateau — not a bounded layer;
- coupling to updraft bounds — type independence.

v1 does **not** leave the envelope as an implementation option.

---

## 10. Canonical vertical envelope

### 10.1 Formula

Let:

    y_b = baseHeight
    y_t = topHeight
    H   = y_t − y_b
    ξ(y) = (y − y_b) / H
    y_mid = (y_b + y_t) / 2

Then:

    G(y) = sin(π ξ(y))     if y_b ≤ y ≤ y_t
    G(y) = 0               if y < y_b or y > y_t

On the closed interval the sine formula already yields

    G(y_b) = sin(0) = 0
    G(y_t) = sin(π) = 0

so the piecewise definition is continuous. Implementations must
**not** introduce a thickness, epsilon, or smoothstep near the lids.

Evaluate `G` by the sine formula on `[y_b, y_t]` and by exact `0`
strictly outside. Do not clamp, saturate, or renormalize.

### 10.2 Derived envelope facts (not additional API)

- `0 ≤ G(y) ≤ 1` for all finite `y`;
- `G(y) = G(2 y_mid − y)` (even symmetry about `y_mid`);
- unique maximum `G = 1` at `y = y_mid`;
- `G(y) > 0` for `y_b < y < y_t`;
- `G(y) = 0` for `y ≤ y_b` and for `y ≥ y_t` under the piecewise
  definition; equivalently `G(y_b) = G(y_t) = 0` from the sine
  formula.

---

## 11. Peak semantics

Horizontal speed:

    |V_h| = A * r * E * G(y)

Radial maximum, for any fixed `G > 0`, is at `r = σ`:

    |V_h|(r=σ, y) = (A σ / √e) * G(y)

Global maximum of `|V_h|` is at `r = σ` and `y = y_mid`, where
`G = 1`:

    |V_h|_max = A * sigma / sqrt(e)

On the axis, `|V_h| = 0` at every height.

`outflowStrainRate` is **not** this peak speed. It is the near-axis
radial strain coefficient at the envelope maximum:

    lim_{r→0} v_r / r = A * G(y)
    lim_{r→0, y=y_mid} v_r / r = A

Because `max G = 1` by construction, there is **no hidden
normalization**. Changing `H` does not rescale `A`. Changing
`baseHeight` / `topHeight` moves the layer; it does not change the
peak strain at `y_mid`.

`peakRadialVelocity` is not an API parameter. The same reasoning as
`RadialInflowField` applies: a peak-speed parameter would couple
amplitude to `sigma`.

---

## 12. Type name

Candidates:

| Name | Verdict |
|---|---|
| `UpperDivergenceField` | Rejected. The object is a velocity field, not a divergence diagnostic. Parallel naming would have called `RadialInflowField` a “ConvergenceField”. Local `div_h` also changes sign at `r = σ √2` while `v_r` stays outward. |
| `UpperOutflowField` | Rejected. Too broad: meteorological “outflow” includes surface cold-pool flow and anvil geometry. Does not state radial geometry. |
| `RadialOutflowField` | Rejected as the v1 name. Omits vertical localization, which is the new capability relative to `RadialInflowField`. |
| `UpperRadialOutflowField` | **Canonical.** Upper = compact aloft window. Radial = purely radial. Outflow = outward. Does not promise anvil, pressure, or mass continuity. |

One name. No aliases. No `UpperDivergenceField` export.

Filename for this SoT follows the type:

    docs/physics/16-upper-radial-outflow-field.md

---

## 13. Strength parameter

The linear coefficient `A` has units `1/s`.

| Candidate | Verdict |
|---|---|
| `radialStrainRate` | Rejected for this type. Same identifier as `RadialInflowField`, where `A > 0` means **inward**. Reusing it here with `A > 0` meaning **outward** would make the same name opposite geometry in one composite. |
| `divergenceStrainRate` | Rejected. Sounds like diagnostic `div_h`. On the axis at `y_mid`, `div_h = 2A`, so the name would invite treating `A` and `div_h` as interchangeable — the same confusion `RadialInflowField` avoided by rejecting `convergenceRate`. |
| `strength` | Rejected. Generic, no units semantics. |
| `outflowStrainRate` | **Canonical.** Units `1/s`. Distinct from inflow’s `radialStrainRate`. Names the geometric sense (outward). Does not claim to be `div_h`. |

Canonical rule:

    outflowStrainRate = A > 0  →  strictly outward radial flow
                                 inside the open layer

`A` is not a signed circulation sense. Negative `A` would reverse the
field into inflow. Inflow is a different type
(`RadialInflowField`). Zero `A` is not a “disabled outflow” mode.

---

## 14. Full velocity formula

    A     = outflowStrainRate
    σ     = sigma
    y_b   = baseHeight
    y_t   = topHeight
    H     = y_t − y_b

    dx = x − centerX
    dz = z − centerZ
    r² = dx² + dz²

    E(r) = exp( −r² / (2 σ²) )

    G(y) = sin(π (y − y_b) / H)    if y_b ≤ y ≤ y_t
    G(y) = 0                       otherwise

    Vx = +A * E * dx * G(y)
    Vy = 0
    Vz = +A * E * dz * G(y)

IEEE-754 signed zero: a product that is a negated or scaled zero
offset may yield `-0`. Implementations should canonicalize output
components that are algebraically zero to `+0`, following
`RadialInflowField`.

---

## 15. Vertical domain

### 15.1 Parameters

    baseHeight    // world +Y, meters
    topHeight     // world +Y, meters

These are world-space vertical coordinates, the same quantity as
environmental profile `height` and world `y`. They are **not**
AGL-only display units and **not** a `centerY`.

Naming follows semantic height (`baseHeight` / `topHeight`), not
`baseY` / `topY`. The storm axis remains a horizontal pair
`(centerX, centerZ)`.

These bounds are **this field’s** bounds. They are not the updraft’s
`baseHeight` / `topHeight`.

### 15.2 Order

Require:

    topHeight > baseHeight

Equal bounds and inverted bounds are invalid. There is no minimum `H`
in the constructor. Very small `H` makes `|G'| ~ 1/H` large and is a
timestep concern for later composites that move particles in `y`.
Isolated tracers of this field do not change `y`. That is not
constructor validation.

`baseHeight` may be negative. Ground `y = 0` is not an implicit lid.

### 15.3 Behavior by region

| Region | `G` | Horizontal `V` |
|---|---|---|
| `y < baseHeight` | `0` | `(0, 0, 0)` |
| `y = baseHeight` | `0` | `(0, 0, 0)` |
| `baseHeight < y < topHeight` | `sin(π ξ) ∈ (0, 1]` | `+A E (dx, 0, dz) G` |
| `y = topHeight` | `0` | `(0, 0, 0)` |
| `y > topHeight` | `0` | `(0, 0, 0)` |

No hidden epsilon. Comparisons are ordinary IEEE-754 inequalities
against the stored bounds.

### 15.4 Defined on all world space

v1 is defined at every finite world position.

Sampling outside `[baseHeight, topHeight]` is **not** an error. It
returns `V = (0, 0, 0)`.

This is an intentional compact-support envelope, not a silent fallback
(`docs/physics/02-velocity-field-basics.md` §35).

Reason: `VelocityField` operands must be freely composable.
Environment, updraft, rotation, and inflow all sample everywhere. A
throw-on-out-of-layer policy would make `CompositeVelocityField`
unusable near the ground or above the top.

There is no horizontal domain wall. Far from the axis, decay is still
only the radial Gaussian, and only where `G > 0`.

---

## 16. Coordinate and frame semantics

| Quantity | Representation | Notes |
|---|---|---|
| Sample input position | world `Vec3` `(x, y, z)` | meters |
| Sample output velocity | world `Vec3` `(Vx, Vy, Vz)` | m/s |
| Outflow strain | `A` in `v_r = +A r E G` | 1/s; strictly positive in v1 |
| Vertical velocity | exactly `Vy = 0` | not approximate |

Canonical mapping from `docs/physics/00-coordinate-system.md`:

    (x, y, z) = (eastward, vertical, -northward)

so this field’s meteorological parts are:

    eastward  = Vx
    northward = -Vz
    vertical  = 0

`UpperRadialOutflowField.sample` returns world velocity directly.

It does **not**:

- return `AtmosphericVelocity`;
- convert through environmental profile sampling;
- subtract storm motion;
- depend on hodograph / shear / helicity diagnostics.

Do not name world components `u`, `v`, `w`.

The field is Eulerian-steady: `time` is ignored.

    sample(P, t1) = sample(P, t2)

Trajectories are still time-dependent through changing `(x, z)`.
Isolated trajectories do not change `y`.

---

## 17. Sign convention and cardinals

Canonical rule:

    A > 0  →  strictly outward radial flow where G(y) > 0

### Cardinal validation table

For `A > 0`, `G(y) > 0`, a point at horizontal distance `d > 0` from
the center, and

    E = exp( -d² / (2 * sigma²) )
    S = A * E * d * G(y)     // S > 0

| Location relative to center | `(dx, dz)` | World velocity | Atmospheric direction |
|---|---|---|---|
| East | `(+d, 0)` | `(+S, 0, 0)` | eastward (`+X`) |
| West | `(-d, 0)` | `(-S, 0, 0)` | westward (`-X`) |
| North (world `-Z`) | `(0, -d)` | `(0, 0, -S)` | northward (`-Z`) |
| South (world `+Z`) | `(0, +d)` | `(0, 0, +S)` | southward (`+Z`) |

On a north-up map this is east → east, west → west, north → north,
south → south: away from the axis along the horizontal radius.

At the same `(dx, dz)` but `G(y) = 0`, every row is `(0, 0, 0)`.

Compare `RadialInflowField` §8: every horizontal sign is reversed.

---

## 18. Horizontal divergence and mass continuity

### 18.1 Analytic `div_h`

    Vx = A G(y) E dx
    Vz = A G(y) E dz
    Vy = 0

Differentiating the Gaussian offset form, with `G` independent of
`(x, z)`:

    ∂Vx/∂x + ∂Vz/∂z
      = A * E * G(y) * (2 − r² / sigma²)

Call this `div_h`. Because `Vy ≡ 0`:

    ∇ · V = div_h + ∂Vy/∂y = div_h

`G(y)` **scales** the entire horizontal divergence. Outside the layer,
`G = 0` ⇒ `div_h = 0`. At `y_mid`, `G = 1` and the radial factor
matches sign-reversed `RadialInflowField`.

On the axis at `y_mid`:

    div_h = 2A

`A` is **not** equal to `div_h`. Tests and later diagnostics must not
treat them as interchangeable.

`div_h` changes sign at `r = sigma * sqrt(2)`:

- `div_h > 0` for `r < σ √2` (local source) when `G > 0`;
- `div_h < 0` for `r > σ √2` (local sink) when `G > 0`;
- `v_r` remains `> 0` at every finite `r` inside the open layer.

This is a shielded horizontal source: net flux through a circle of
radius `r` is `2π r v_r G`, and that flux tends to `0` as `r → ∞`.

Local `div_h < 0` in the far Gaussian tail does **not** mean the flow
has become inward. Outward direction is the invariant
`dx Vx + dz Vz > 0` where `G > 0` and `r > 0`.

Classical `∂Vx/∂y` / `∂Vz/∂y` are **not** defined at the lids
(one-sided `G'` jumps). `div_h` itself is continuous, because it
depends on `G`, not `G'`.

There is no production `divergence()` API. The formula above is the
documented analytic identity for tests and later diagnostics.

### 18.2 Three distinct claims

| # | Statement | v1 status |
|---|---|---|
| 1 | The field is locally divergent on the axis and in the core (`div_h > 0` for `r < σ √2`, `G > 0`) | **true** by construction |
| 2 | The field represents upper-level radial outflow conceptually | **true** as a prescribed laboratory mechanism |
| 3 | The field closes mass continuity, alone or with inflow and updraft | **false** |

v1 claims (1) and (2). It forbids (3).

### 18.3 Why this does not close continuity

`RadialInflowField` has `div_h = −A_in E_in (2 − r_in²/σ_in²)` at
every height.

`VerticalEnvelopeUpdraftField` has `∂Vy/∂y ≠ 0` inside its own layer,
with a radial Gaussian times `F'(y)`, and cannot cancel inflow
`div_h` at all `r`
(`docs/physics/15-vertical-updraft-envelope.md` §11.3).

This field adds another separable horizontal term:

    ∇ · V_outflow = A_out E_out G(y) (2 − r_out²/σ_out²)

Even if a later DEMO used identical centers and sigmas, the sum

    inflow + enveloped updraft + this outflow

is three independently prescribed fields. No v1 invariant ties

    A_out,  H_out,  y_b,  y_t
    A_in,   W0,     H_up

together. In particular this document does **not** impose

    A_out = A_in
    G(y) + (inflow lives at all y) = 0
    H = W0 π / (2A)

or any other continuity equation.

Because this field has `Vy ≡ 0`, it cannot compensate its own
`div_h` with vertical motion. It is a pure horizontal source in the
active layer, plus a shielded outer sink in the Gaussian tail.

### 18.4 Forbidden mass story

Even if a future DEMO simultaneously contains

    RadialInflowField
    VerticalEnvelopeUpdraftField
    UpperRadialOutflowField

it is still controlled superposition unless a later document
introduces a continuity model and coupled parameters.

Do **not** assert:

    inflow = air entering
    updraft = same air rising
    upper outflow = same air leaving

in a mass-conserving sense.

A tracer may pass through those regions in sequence. The fields remain
prescribed independently
(`docs/physics/01-parcel-basics.md` §27–28, §32).

---

## 19. Relationship to RadialInflowField

Shared radial family:

    E = exp(−r² / (2 σ²))
    offset world form, no division by r
    peak |v_r| at r = σ
    axis rest

Differences:

| | `RadialInflowField` | `UpperRadialOutflowField` |
|---|---|---|
| Horizontal sign | `Vx = −A E dx` | `Vx = +A E dx G` |
| Strength name | `radialStrainRate` | `outflowStrainRate` |
| Height | independent | compact `G(y)` |
| `A > 0` means | inward | outward |
| Negative `A` | rejected (would be this phenomenon) | rejected (would be inflow) |

### No inheritance / no signed dual-mode

Do **not**:

- subclass one type from the other;
- accept `radialStrainRate < 0` on `RadialInflowField` as this field;
- introduce a generic `RadialFlowField` with a direction enum;
- multiply `RadialInflowField.sample` by `−G(y)` in a wrapper as the
  production type.

A wrapper would be multiplicative composition. The only existing
compositor is additive `CompositeVelocityField`. Independent
validation ownership is clearer. The duplicated offset formula is a
few lines.

Do **not** introduce a height-independent `RadialOutflowField` as a
stepping stone. A field that spreads at every height, including the
ground, does not answer “predominantly at upper levels”. Surface
outflow / cold-pool flow, if ever specified, is a different mechanism.

`RadialInflowField` stays height-independent and inward.
`UpperRadialOutflowField` is the first outward, height-localized
radial mechanism.

---

## 20. Relationship to VerticalEnvelopeUpdraftField

### 20.1 Why this is the natural next controlled mechanism

After a finite vertical updraft, tracers have a bounded vertical life
cycle and then `Vy = 0` from that operand. Laboratory composition
still lacks a prescribed way to spread horizontally aloft. That gap
is this field’s reason for existing.

Natural next ≠ kinematic continuation of the same parcel, and ≠
mass-conserving closure.

### 20.2 Type independence

This field must **not**:

- read `VerticalEnvelopeUpdraftField` parameters;
- require `baseHeight` to equal the updraft `topHeight`;
- require matching `centerX` / `centerZ` / `sigma`;
- scale `outflowStrainRate` from `W0` or `H_up`.

Coincidence of vertical bounds in a future DEMO is a **fixture
choice**, not an API invariant. Overlap, a gap, or a layer entirely
above the updraft are all physically allowed laboratory setups.

The two envelopes are different objects:

    F(y)  — scales vertical velocity of the updraft
    G(y)  — scales horizontal velocity of this outflow

They may use the same mathematical window (half-sine) with different
`[baseHeight, topHeight]` and different meaning.

### 20.3 Isolated vs composite

Isolated tests of this field keep `y` constant. Isolated tests of the
updraft keep `(x, z)` constant on the axis. Neither isolated contract
is a composite trajectory oracle.

---

## 21. Parameters

| Parameter | Symbol | Meaning | Units | Constraint |
|---|---|---|---|---|
| `centerX` | — | world east coordinate of axis | m | finite |
| `centerZ` | — | world south coordinate of axis | m | finite |
| `outflowStrainRate` | `A` | near-axis coefficient in `v_r = +A r E G`; sign is fixed outward | 1/s | finite and `> 0` |
| `sigma` | `σ` | Gaussian horizontal scale in `exp(−r²/(2σ²))` | m | finite and `> 0` |
| `baseHeight` | `y_b` | world `y` of the lower lid | m | finite |
| `topHeight` | `y_t` | world `y` of the upper lid | m | finite and `> baseHeight` |

`outflowStrainRate` is **not**:

- diagnostic `div_h`;
- peak outward speed;
- a numerical timestep-convergence setting.

`sigma` is the scale parameter of the Gaussian exponent as written.
It is **not** a compact-support radius.

Parameters intentionally absent from v1:

- `centerY`;
- `peakHeight` as a free parameter (derived: `y_mid`);
- `peakRadialVelocity`;
- `radialStrainRate` as this type’s strength name;
- envelope selector / `G` enum;
- `sigmaY`;
- time dependence;
- moving or tilted axis;
- tangential rotation;
- signed strain / inflow mode;
- mass-continuity correction or coupling to inflow / updraft;
- ScenarioConfig wiring;
- composition helpers;
- a `divergence()` API.

---

## 22. Validation policy

Validation belongs at the owning construction boundary of
`UpperRadialOutflowField`.

Reject when:

- any parameter is non-finite (`NaN` or `±Infinity`);
- `sigma ≤ 0`;
- `outflowStrainRate ≤ 0`;
- `topHeight ≤ baseHeight`.

Do **not** accept:

- `outflowStrainRate = 0` as a “zero outflow” mode;
- `outflowStrainRate < 0` as an inflow mode of this type.

Do **not** reject:

- `baseHeight < 0`;
- `baseHeight = 0`;
- large `H`;
- small but positive `H`;
- centers other than the world origin.

The additive identity, if needed, is the absence of this operand or
an explicit zero `ConstantVelocityField`.

Sampling itself does not re-validate. Every finite world position is
evaluable.

Error type: `UpperRadialOutflowFieldError`, matching the other storm
fields’ dedicated error classes.

---

## 23. Analytical tracer acceptance oracle

The **continuous** ODE for the isolated field is:

    dr/dt = +A * r * exp( −r² / (2 σ²) ) * G(y)
    dθ/dt = 0
    dy/dt = 0

Because `Vy = 0`, `y(t) = y0` and `G(y0)` is a constant
`G0 ∈ [0, 1]`.

Effective strain along that trajectory:

    A_eff = A * G0

Setup:

- field as defined above;
- particle at horizontal offset `(dx0, dz0)` from the center;
- chosen `y0`.

### Exact elementary facts

On the axis (`r0 = 0`), at any `y0`:

    V ≡ 0  ⇒  P(t) = P0

for both Euler and RK2 aside from ordinary floating-point roundoff.

Off-axis with `G0 = 0` (at or outside the lids):

    V ≡ 0  ⇒  P(t) = P0

including `y` and `(x, z)`.

Off-axis with `G0 > 0`, the motion stays on the original horizontal
ray:

    (dx(t), dz(t)) = s(t) * (dx0, dz0)

with `s(t) > 0` **increasing**. Polar angle `θ` is invariant. Height
is invariant: `y(t) = y0`.

For this purely radial field, explicit Euler and RK2 also stay on
that ray exactly (aside from roundoff): each stage samples a velocity
parallel to the current offset, so the discrete update is a radial
scale. Ray preservation is therefore both a continuous invariant and
an expected discrete invariant.

Radius is strictly increasing for `r0 > 0` and `G0 > 0`. Radius does
not reach infinity in finite continuous time: the integral

    t = (1 / A_eff) ∫_{r0}^{r(t)} exp(s² / (2 σ²)) / s ds

diverges as `r → ∞`.

### Forbidden general closed form

Do **not** use

    r(t) = r0 * exp(+A t)

or even

    r(t) = r0 * exp(+A_eff t)

as the general oracle. Those maps are exact only for unbounded linear
outflow `v_r = +A_eff r` (envelope `E ≡ 1`). They are the near-axis
approximation of this field, not its solution.

Do **not** introduce an exponential-integral oracle.

### Required continuous bounds

For `A > 0`, `r0 > 0`, `G0 > 0`, and `t > 0`:

    r0 < r(t) < r0 * exp(A_eff t)

The right inequality holds because `E < 1` for all `r > 0`, so
`v_r < A_eff r` and radius grows more slowly than the pure
exponential. This bound also rejects a regression that omits the
Gaussian envelope.

A useful secondary check, not a substitute for the bounds: if
`r0 ≪ sigma`, then `r(t) ≈ r0 * exp(A_eff t)` within a documented
tolerance while the particle remains in that core.

At two interior heights with the same `r0` and `G(y1) ≠ G(y2)`, the
radius growth rates must differ according to `G`. That is the
height-dependence contract. Do not require a closed-form ratio
beyond “larger `G` ⇒ faster growth over the same `t`”, plus the
bounds above using each `G0`.

### Numerical trajectories are not the oracle

Euler and RK2 do **not** follow the continuous `r(t)` exactly.

Required tracer policy:

- compare geometry to the exact invariants (axis rest, rest when
  `G0 = 0`, ray, constant `y`);
- compare radius to the continuous bounds above, not to
  `r0 exp(+A t)` as equality;
- use a high-resolution RK2 trajectory as a numerical reference for
  `r(t)` at a chosen interior `y0`;
- require that decreasing `dt` reduces error versus that reference
  for both Euler and RK2;
- require RK2 to be more accurate than Euler at the same `dt`;
- treat radius error and ray error as different diagnostics.

Outflow Euler steps increase radius; they do not cross the axis.
`A dt ≪ 1` remains good practice for accuracy, not because of an
inflow-style axis flip.

A correct field formula does not make Euler exact in radius.

---

## 24. Invariants

For a valid `UpperRadialOutflowField`:

1. **Axis rest**  
   At `(centerX, y, centerZ)` for any finite `y`:

       V = (0, 0, 0)

2. **Purely horizontal**  
   `Vy = 0` at every sample point.

3. **Radial outward direction inside the open layer**  
   For `r > 0` and `baseHeight < y < topHeight`:

       dx * Vx + dz * Vz > 0

4. **Zero at and outside the lids**  
   For any finite `(x, z)` and `y ≤ baseHeight` or `y ≥ topHeight`:

       V = (0, 0, 0)

5. **No tangential component**  
   The horizontal 2D cross product vanishes at every sample:

       dx * Vz − dz * Vx = 0

   including on the axis and outside the layer.

6. **Axisymmetry of speed at fixed y**  
   Equal `r` and equal `y` ⇒ equal `|V| = A * r * E * G(y)`.

7. **Vertical envelope maximum**  
   At `y = y_mid`, `G = 1`, so `|V|` matches the `G = 1` radial
   formula. In particular at `r = σ`, `|V| = A σ / √e`.

8. **Vertical symmetry of G**  
   `G(y_mid − δ) = G(y_mid + δ)` for finite `δ`, hence equal `|V|`
   at those heights for the same `(x, z)`.

9. **Height dependence inside the layer**  
   Fixed `(x, z)` with `r > 0`, two interior heights with different
   `G` ⇒ different `|V|`, matching `G(y)`.

10. **Cardinal directions**  
    For `A > 0` and `G > 0`, the table in §17 holds.

11. **Far-field formula match**  
    At large `r` and interior `y`, `V` must match
    `Vx = +A E dx G`, `Vz = +A E dz G` within floating-point
    tolerance — not an ad hoc “approximately zero” check.

12. **Steady**  
    Fixed position, varying `time` ⇒ identical `V`.

13. **No input mutation**  
    Caller `position` is unchanged after `sample`.

14. **Fresh output**  
    Each `sample` returns a new plain `Vec3`.

---

## 25. Ownership and mutability

`sample` must:

- not mutate the caller-owned input `position`;
- return a **new** plain `Vec3` object on every call.

It must not return an internal reusable buffer.

---

## 26. Testing policy

Prefer contract tests over implementation trivia.

Do **not** re-prove generic Euler / RK2 integrator tests.

### Unit / sampling (required)

- axis sample equals `(0, 0, 0)` at an interior height and at a lid;
- `Vy` identically zero on sampled points;
- outward `dx Vx + dz Vz > 0` for `r > 0` inside the open layer;
- tangency-free / radial `dx Vz − dz Vx = 0`;
- equal-radius speed symmetry at fixed `y`;
- formula match at one or more off-axis radii, at `r = σ` and
  `y_mid`, and at large `r` inside the layer;
- cardinal sign examples for `A > 0` at `y_mid`;
- `G = 1` at `y_mid`; `G = 0` at both lids and outside the layer;
- two interior axis-offset heights: `|V|` differs with `G(y)`;
- vertical symmetry about `y_mid`;
- zero velocity below `baseHeight` and above `topHeight`;
- sampling outside the layer is valid (not an error);
- radial peak: at `y_mid`, `|V|(r=σ) > |V|` at a smaller and a
  larger nearby radius, consistent with `|v_r|_max = A σ / √e`;
- steadiness;
- no input mutation and a new `Vec3` per sample;
- parameter validation failures for non-finite values, `sigma ≤ 0`,
  `outflowStrainRate ≤ 0`, and `topHeight ≤ baseHeight`;
- construction accepted for `baseHeight < 0`.

Do not require `div_h > 0` at every sample point as a field
invariant. A dedicated test **may** check the analytic `div_h`
identity at a few points (axis, `r = σ √2`, far tail) without
making `div_h > 0` everywhere a correctness rule.

### Isolated tracer acceptance (required)

- axis tracer remains at rest;
- tracer at a lid / outside the layer remains at rest;
- off-axis tracer at `y_mid` (or another interior height with
  `G0 > 0`): ray invariant, constant `y`, monotone increase of `r`;
- bounds `r0 < r(t) < r0 exp(A G0 t)`;
- Euler and RK2 versus a high-resolution RK2 reference with `dt`
  convergence; RK2 more accurate than Euler at the same `dt`;
- two interior heights with the same `r0`: larger `G` grows `r`
  faster over the same duration.

Do not require:

- ScenarioConfig integration;
- composite DEMO tests in this slice;
- rendering tests as physics acceptance;
- curl / vorticity diagnostics as this field’s contract;
- continuity-equation residual checks as a correctness failure of
  this mechanism;
- `r(t) = r0 e^{A t}` equality as an oracle;
- exponential-integral oracles;
- isolated updraft closed-form `y(t)` mixed into these tests.

Use floating-point tolerance where IEEE-754 representation of `exp`
or `sin(π)` requires it. Beware signed zero (`-0`) on axis/cardinal
samples; compare with tolerance or coerce `-0` before exact
equality.

---

## 27. Module and type placement

Implementation path for the first slice:

    src/physics/storm/UpperRadialOutflowField.ts

`storm/` denotes controlled storm mechanisms under explicit physics
documents. It does not imply a full storm model.

`UpperRadialOutflowField` implements `VelocityField` from the core
field interface.

Suggested construction shape (documentation-level, not an API freeze
beyond the parameters above):

    new UpperRadialOutflowField({
      centerX,
      centerZ,
      outflowStrainRate,
      sigma,
      baseHeight,
      topHeight,
    })

Exact TypeScript surface may use a params object, but the semantic
parameters and validation rules above are mandatory.

---

## 28. ScenarioConfig, DEMO, and future wiring

This slice is isolated physics only.

Do **not** change:

- `ScenarioConfig`;
- `DEMO_SCENARIO`;
- `createUpdraftField` / `createRadialInflowField` /
  `createRotationField`;
- `composeDemoTracerSimulation`;
- app copy;
- rendering;
- hodograph;
- runtime controls.

Current live DEMO after the isolated physics slice was four operands
(`docs/rendering/06-composite-vertical-envelope-updraft-demo.md`).
Live DEMO wiring of this field as a fifth operand is specified in
`docs/rendering/07-composite-upper-radial-outflow-demo.md`.
Current DEMO composition, which still includes this field, is
`docs/rendering/08-composite-lower-radial-inflow-demo.md`. This
physics document still does not own DEMO bounds, `outflowStrainRate`,
or app composition. Isolated physics tests remain this field's
contract.

### Wiring constraints (owned by rendering `07`; current composition `08`)

The wiring document must, and does, respect:

1. a dedicated `storm.upperRadialOutflow` DTO block, not a signed
   `storm.radialInflow`;
2. factory `createUpperRadialOutflowField` that reads only that block;
3. no copying of center / `sigma` / bounds from updraft or inflow;
4. no coupling of `outflowStrainRate` to inflow `A` or updraft `W0` /
   `H`;
5. an additional composite operand, not a replacement of inflow;
6. UI copy that does not claim anvil or continuity-solved storm-top
   divergence;
7. hodograph still profile-only;
8. DEMO integration must not claim mass conservation or reuse
   `r(t) = r0 e^{At}`.

Those constraints exist so the physics type is not bent to fit a
convenient DTO. They are not an implementation checklist for this
physics slice.

---

## 29. Hodograph boundary

This field does **not** participate in:

- `EnvironmentalWindProfile`;
- hodograph geometry;
- environmental shear;
- `HorizontalVorticity`;
- storm-relative wind;
- streamwise / crosswise decomposition;
- SRH.

Its horizontal divergence is a property of a synthetic storm
mechanism. It must not be mixed into environmental diagnostics.

Mutating this field’s parameters in a later ScenarioConfig must not
change hodograph points.

---

## 30. Explicit non-goals

`UpperRadialOutflowField` v1 does **not** include:

- downdraft;
- anvil geometry / storm-top / tropopause;
- cloud / precipitation;
- pressure-driven outflow;
- density / buoyancy;
- entrainment;
- cold pool / gust front / surface outflow;
- continuity solver or parameter coupling to inflow / updraft;
- tilting / stretching;
- mesocyclone;
- storm-relative translating axes;
- terrain;
- Rankine or other alternative radial profiles;
- height-independent `RadialOutflowField`;
- signed dual-mode on `RadialInflowField`;
- `peakRadialVelocity` as API;
- renderer arrows, meshes, curtains, or glyphs;
- ScenarioConfig / DEMO wiring;
- hodograph overlays.

Visual spreading of tracers under this isolated field demonstrates
the controlled radial mechanism only.

---

## 31. First implementation slice

In order:

1. this document (source of truth);
2. `UpperRadialOutflowField` at
   `src/physics/storm/UpperRadialOutflowField.ts`;
3. unit tests
   `src/physics/storm/UpperRadialOutflowField.test.ts`;
4. isolated tracer acceptance
   `src/simulation/upperRadialOutflowFieldTracer.acceptance.test.ts`;
5. `npm test`;
6. `npm run typecheck`;
7. **STOP**.

### Files to create

- `src/physics/storm/UpperRadialOutflowField.ts`
- `src/physics/storm/UpperRadialOutflowField.test.ts`
- `src/simulation/upperRadialOutflowFieldTracer.acceptance.test.ts`

### Files that must be left unchanged

- `src/physics/storm/RadialInflowField.ts` and its tests;
- `src/physics/storm/VerticalEnvelopeUpdraftField.ts` formulas and
  tests;
- `src/physics/storm/UpdraftField.ts`;
- `src/physics/storm/RotationField.ts`;
- `src/core/fields/VelocityField.ts`;
- `src/core/fields/CompositeVelocityField.ts`;
- `src/scenario/**`;
- `src/app/**`;
- `src/rendering/**`;
- `src/ui/**`.

A later implementation must not start DEMO rewiring, a continuity
solver, downdraft, or anvil rendering because the unit tests passed.

---

## 32. Lock-in summary

```text
canonical field name:    UpperRadialOutflowField
physical meaning:        prescribed upper-level horizontal radial
                         outflow; not anvil, not mass-consistent
radial profile:          v_r(r) = +A r exp(-r² / (2 σ²))
vertical envelope:       G(y) = sin(π (y - y_b)/H) on [y_b, y_t],
                         else 0
strength parameter:      outflowStrainRate = A > 0  (1/s)
center:                  (centerX, centerZ); no shared storm.center
sigma:                   Gaussian horizontal scale; peak |v_r| at r=σ
vertical parameters:     baseHeight, topHeight; topHeight > baseHeight
velocity formula:        Vx = +A E dx G(y)
                         Vy = 0
                         Vz = +A E dz G(y)
peak speed:              |V_h|_max = A σ / √e  at r = σ and y = y_mid
horizontal divergence:   div_h = A E G(y) (2 - r²/σ²)
                         axis at y_mid: div_h = 2A
                         sign change at r = σ√2; v_r stays outward
behavior outside layer:  V = (0, 0, 0); sampling is valid, not an error
continuity claim:        (1) locally divergent in the core: yes
                         (2) conceptual upper outflow: yes, prescribed
                         (3) mass-consistent / closes continuity: no
```

---

## 33. Core lesson

`UpperRadialOutflowField` v1 is a controlled Gaussian-modulated
linear outflow, active only inside a compact vertical window:

    E(r) = exp( −r² / (2 σ²) )
    G(y) = sin(π (y − baseHeight) / (topHeight − baseHeight))
           on [baseHeight, topHeight], else 0
    Vx   = +A E dx G
    Vy   = 0
    Vz   = +A E dz G

`A = outflowStrainRate > 0` is the near-axis radial strain at
`y_mid`. It is not diagnostic divergence; on the axis at `y_mid`,
`div_h = 2A`.

Isolated tracers stay at constant `y`, remain on their horizontal
ray, and increase `r` when `G(y0) > 0`. They do not follow
`r = r0 e^{A t}`.

The field exists so the project can spread tracers outward at chosen
upper levels with a transparent formula, no division by `r`, and no
claim of anvil physics or mass continuity.
