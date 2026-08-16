# Rotation Field

## 1. Purpose

This document defines the first controlled horizontal circulation mechanism
in Supercell Explorer: `RotationField` v1.

It answers:

    Given a vertical axis and a Gaussian radial scale, what world-space
    horizontal tangential velocity does a passive tracer sample?

`RotationField` is a mathematically transparent, steady, axisymmetric
horizontal velocity field about a vertical axis. It is the first storm
mechanism that can carry tracers around that axis with nonzero `Vx` / `Vz`
and identically zero `Vy`.

It is **not**:

- a realistic mesocyclone;
- a tornado;
- a Rankine vortex;
- a pressure-perturbation or mass-continuity solution;
- a complete storm velocity field.

The `storm/` module path means: controlled storm mechanism. It does **not**
mean full or realistic supercell physics.

---

## 2. Relationship to existing foundations

`docs/physics/02-velocity-field-basics.md` requires:

- mechanisms to be tested in isolation before documented composition;
- smooth synthetic fields where possible;
- explicit formulas for radial decay (no invented falloff).

`docs/physics/00-coordinate-system.md` establishes:

    +X = East
    +Y = Up
    +Z = South

and the right-hand rule for positive rotation around `+Y`. Viewed from above
the storm while looking downward toward the ground, that positive rotation
appears counterclockwise. The world origin is **not** automatically the
rotation axis.

`docs/physics/03-numerical-integration-basics.md` already distinguishes:

- the exact circular trajectory of a purely tangential rotation field;
- Euler's systematic outward radius drift;
- RK2 as a more accurate but still approximate integrator.

That distinction is mandatory for this field's tracer acceptance.

`docs/physics/11-updraft-field.md` is the template for an isolated,
height-independent, steady Gaussian storm mechanism. `RotationField` follows
the same architectural pattern with a different velocity direction.

`src/physics/synthetic/SolidBodyRotationYField.ts` is a **different** object:
a mathematical learning field of unbounded solid-body rotation about the
world origin. `RotationField` does not replace, wrap, or subclass it.

`docs/physics/06-horizontal-vorticity.md` defines environmental
`HorizontalVorticity` from vertical shear of a horizontally homogeneous
profile. That diagnostic is not the curl of this field and must not be mixed
with it.

`docs/physics/18-vertical-rotation-envelope.md` is the height-localized
sibling: same radial profile, compact `G(y)`, new type
`VerticalEnvelopeRotationField`. This document remains the canonical
height-independent primitive. Do not add optional bounds here.
Live DEMO occupant is `VerticalEnvelopeRotationField`; wiring:
`docs/rendering/12-composite-vertical-envelope-rotation-demo.md`.

Architectural role:

    RotationField implements VelocityField
        ↓
    sample(position, time) → world Vec3

First implementation slice:

    isolated RotationField + sampling tests + analytical tracer acceptance

Composition with environment and updraft:

    V_total = V_environment + V_updraft + V_rotation

is **out of scope** for this document's first implementation slice.

---

## 3. What RotationField is

`RotationField` is a world-space `VelocityField` whose only nonzero
components are horizontal and tangent to circles about a fixed vertical axis.

Conceptually:

    V_rotation(x, y, z, t) = (Vx(r), 0, Vz(r))

where `r` is horizontal radial distance from the axis in the world `X`–`Z`
plane, and the horizontal vector is purely tangential.

Properties of v1:

- Gaussian-modulated solid-body radial profile (defined below);
- steady (independent of `time`);
- height-independent (independent of `y`);
- axisymmetric about the vertical axis through the center;
- unbounded analytic evaluation (no domain clamp);
- continuous and infinitely smooth in space.

---

## 4. Center

The rotation axis is fixed by a horizontal center in world coordinates:

    center = (centerX, centerZ)

Units: meters.

The center does **not** include a `centerY`. Vertical position of the axis is
irrelevant in v1 because velocity does not depend on height.

The center must not be silently assumed to be the world origin.

---

## 5. Horizontal radius

Define horizontal offset from the center:

    dx = x - centerX
    dz = z - centerZ

    r² = dx² + dz²
    r  = sqrt(r²) ≥ 0

`r` is a non-negative length in meters in the world horizontal plane
(`X`, `Z`). World `Y` does not enter `r`.

---

## 6. Mathematical definition

Let:

    Ω     = angularVelocity
    sigma = horizontal Gaussian scale

Tangential speed (non-negative `r`, sign carried by `Ω`):

    v_theta(r) = Ω * r * exp( -r² / (2 * sigma²) )

Equivalently, the effective angular velocity on a circle of radius `r` is:

    Ω_eff(r) = Ω * exp( -r² / (2 * sigma²) )

World velocity is the right-hand cross product of
`(0, Ω_eff(r), 0)` with `(dx, 0, dz)`:

    Vx = Ω_eff(r) * dz
    Vy = 0
    Vz = -Ω_eff(r) * dx

Expanded:

    E  = exp( -r² / (2 * sigma²) )

    Vx = Ω * E * dz
    Vy = 0
    Vz = -Ω * E * dx

This angular / cross-product form is mandatory. Implementations must **not**
normalize `(dx, dz)` and divide by `r`. On the axis (`r = 0`):

    dx = 0, dz = 0  ⇒  V = (0, 0, 0)

with no `0/0`.

Derived properties of this profile, not additional API:

- `v_theta(0) = 0`;
- peak `|v_theta|` occurs at `r = sigma`:

      |v_theta|_max = |Ω| * sigma / sqrt(e)

- as `r → ∞`, `v_theta → 0`;
- the profile is a shielded vortex: vertical vorticity changes sign at
  `r = sigma * sqrt(2)`, and net circulation at infinity is zero.

There is no compact support and no exact-zero cutoff. Far-field decay is
entirely given by the formula.

This field is **not** a Rankine vortex and **not** Lamb–Oseen / Burgers
tangential flow.

---

## 7. Coordinate and frame semantics

| Quantity | Representation | Notes |
|---|---|---|
| Sample input position | world `Vec3` `(x, y, z)` | meters |
| Sample output velocity | world `Vec3` `(Vx, Vy, Vz)` | m/s |
| Rotation strength | `Ω` about world `+Y` | rad/s; right-hand rule |
| Vertical velocity | exactly `Vy = 0` | not approximate |

`RotationField.sample` returns world velocity directly.

It does **not**:

- return `AtmosphericVelocity`;
- convert through environmental profile sampling;
- subtract storm motion;
- depend on hodograph / shear / helicity diagnostics.

Do not name world components `u`, `v`, `w`.

---

## 8. Sign convention

Canonical rule:

    Ω > 0  →  right-hand rule around world +Y

`Ω < 0` is the same mechanism with opposite sense. `Ω = 0` is the zero field.

Clockwise / counterclockwise language is not sufficient by itself. The
project corollary from `docs/physics/00-coordinate-system.md`:

    viewed from above, looking downward toward the ground,
    Ω > 0 appears counterclockwise on a north-up map.

Do not describe the API as cyclonic or anticyclonic. Those meteorological
labels depend on hemisphere. The API is geometric.

### Cardinal examples

For `Ω > 0`, a point at horizontal distance `d > 0` from the center, and

    E = exp( -d² / (2 * sigma²) )

| Location relative to center | `(dx, dz)` | World velocity | Atmospheric direction |
|---|---|---|---|
| East | `(+d, 0)` | `(0, 0, -Ω E d)` | northward (`-Z`) |
| West | `(-d, 0)` | `(0, 0, +Ω E d)` | southward (`+Z`) |
| North (world `-Z`) | `(0, -d)` | `(-Ω E d, 0, 0)` | westward (`-X`) |
| South (world `+Z`) | `(0, +d)` | `(+Ω E d, 0, 0)` | eastward (`+X`) |

On a north-up map this is east → north → west → south → east.

`Ω → -Ω` reverses every velocity vector.

---

## 9. Parameters

| Parameter | Symbol | Meaning | Units | Constraint |
|---|---|---|---|---|
| `centerX` | — | world east coordinate of axis | m | finite |
| `centerZ` | — | world south coordinate of axis | m | finite |
| `angularVelocity` | `Ω` | angular velocity about `+Y` on the axis; sign sets sense | rad/s | finite; `0` and negatives allowed |
| `sigma` | `σ` | Gaussian horizontal scale in `exp(-r²/(2σ²))` | m | finite and `> 0` |

`sigma` is the scale parameter of the Gaussian exponent as written above.
It is **not** a Rankine core radius and not a half-width-at-half-maximum
alias unless a future document defines an explicit conversion.

For this profile, peak `|v_theta|` happens to lie at `r = sigma`. That is a
derived property, not a second parameter.

Parameters intentionally absent from v1:

- `centerY`;
- `peakTangentialVelocity` (recoverable from `Ω` and `sigma`, not an API);
- vertical envelope / base / top;
- time dependence;
- moving center;
- tilt;
- radial inflow;
- Rankine or Lamb–Oseen alternatives;
- mass-continuity correction;
- ScenarioConfig wiring;
- composition helpers.

Contrast with `UpdraftField`: negative `peakVerticalVelocity` is rejected
because a downdraft is a different phenomenon. Negative `angularVelocity` is
accepted because it is the same circulation mechanism with opposite sense.

---

## 10. Validation policy

Validation belongs at the owning construction boundary of `RotationField`.

Reject when:

- any parameter is non-finite;
- `sigma ≤ 0`.

Do **not** reject:

- `angularVelocity = 0`;
- `angularVelocity < 0`.

Sampling itself does not re-validate geometry beyond using the stored
parameters. There is no in-domain / out-of-domain branch: every finite world
position is evaluable.

---

## 11. Steady and height-independent behavior

Although `VelocityField.sample(position, time)` accepts `time`, v1 ignores it:

    sample(P, t1) = sample(P, t2)

for all times.

Because velocity depends only on horizontal offset from the center:

    same (x, z) relative to center, different y
        → identical V_rotation

This is an intentional simplification for analytical clarity, not a claim
about real mesocyclone depth.

---

## 12. Ownership and mutability

`sample` must:

- not mutate the caller-owned input `position`;
- return a **new** plain `Vec3` object on every call.

It must not return an internal reusable buffer.

---

## 13. Domain policy

v1 is an unbounded analytic field.

- no spatial clamp;
- no quiet-zero outside a cylinder;
- no special boundary return.

Far from the center, velocity is near zero only because the Gaussian formula
says so, not because of a domain wall.

---

## 14. Distinction from SolidBodyRotationYField

| | `SolidBodyRotationYField` | `RotationField` |
|---|---|---|
| Layer | `src/physics/synthetic/` | `src/physics/storm/` |
| Role | mathematical learning field | controlled storm mechanism |
| Center | world origin | `(centerX, centerZ)` |
| Profile | `v_theta = Ω r` unbounded | Gaussian-modulated solid-body |
| Far field | grows linearly | decays to 0 |

They share the same right-hand `+Y` sign convention and the same
cross-product world formula at envelope `E = 1`. They are not the same type.

---

## 15. Relation to HorizontalVorticity

`RotationField` produces a **vertical** vorticity component about world `+Y`.

Existing `HorizontalVorticity` is a **horizontal** diagnostic derived from
environmental vertical shear of a horizontally homogeneous wind profile. It
uses atmospheric eastward / northward components and a finite height layer.

These are different quantities, different sources, and different APIs.

v1 must not:

- add `omegaVertical` to `HorizontalVorticity`;
- compute curl of `RotationField` as a diagnostic;
- describe this prescribed circulation as tilting or stretching of
  environmental vorticity.

Laboratory composition `V_environment + V_updraft + V_rotation` is vector
addition of independent mechanisms. It is not mesocyclone dynamics.

---

## 16. Explicit non-goals

`RotationField` v1 does **not** include:

- mesocyclone realism claim;
- pressure perturbation;
- radial inflow;
- stretching / tilting;
- vertical envelope `v_theta(r, y)`;
- moving or tilted axis;
- tornado core;
- Rankine vortex;
- Lamb–Oseen / Burgers tangential profile;
- mass continuity as storm physics;
- `CompositeVelocityField` / `V_environment + V_updraft + V_rotation`;
- ScenarioConfig / demo scene wiring;
- rendering of a vortex mesh or trails.

Visual circling of tracers under this field demonstrates the controlled
horizontal circulation mechanism only.

---

## 17. Invariants

For a valid `RotationField`:

1. **Axis rest**  
   At `(centerX, y, centerZ)` for any finite `y`:

       V = (0, 0, 0)

2. **Purely horizontal**  
   `Vy = 0` at every sample point.

3. **Tangency**  
   The horizontal radius vector is orthogonal to velocity:

       dx * Vx + dz * Vz = 0

   including on the axis, where both sides are zero.

4. **Axisymmetry of speed**  
   Equal `r` ⇒ equal `|V| = |Ω| * r * E`.

5. **Sign reversal**  
   Negating `Ω` negates `V` at every point.

6. **Cardinal directions**  
   For `Ω > 0`, the table in §8 holds.

7. **Far-field formula match**  
   At large `r`, `V` must match `Vx = Ω E dz`, `Vz = -Ω E dx` within
   floating-point tolerance — not an ad hoc “approximately zero” check
   that ignores the formula.

8. **Height independence**  
   Fixed horizontal position, varying `y` ⇒ identical `V`.

9. **Steady**  
   Fixed position, varying `time` ⇒ identical `V`.

10. **No input mutation**  
    Caller `position` is unchanged after `sample`.

11. **Zero angular velocity**  
    `Ω = 0` ⇒ `V = (0, 0, 0)` at every sample point.

---

## 18. Analytical tracer acceptance oracle

The **continuous** ODE for this field has circular solutions.

Setup:

- field as defined above;
- particle at horizontal offset `(dx0, dz0)` from the center, not necessarily
  on the axis;
- any finite `y0`.

Let:

    r0 = sqrt(dx0² + dz0²)
    Ω_eff = Ω * exp( -r0² / (2 * sigma²) )

The exact flow is purely tangential with speed depending only on `r`, so it
preserves radius:

    r(t) = r0
    y(t) = y0

    x(t) = centerX + dx0 * cos(Ω_eff * t) + dz0 * sin(Ω_eff * t)
    z(t) = centerZ - dx0 * sin(Ω_eff * t) + dz0 * cos(Ω_eff * t)

On the axis (`r0 = 0`):

    V ≡ 0  ⇒  P(t) = P0

for both Euler and RK2 aside from ordinary floating-point roundoff.

### Numerical trajectories are not the oracle

Euler and RK2 do **not** follow the circle exactly.

Because `Ω_eff` depends on `r`, once a numerical step leaves the original
radius, the local angular rate changes. There is no elementary N-step Euler
closed form analogous to `docs/physics/03-numerical-integration-basics.md`
for unbounded solid-body rotation, and that solid-body Euler map must **not**
be used as an oracle here.

Required tracer policy:

- compare numerical position to the **continuous** circular solution;
- use a nonzero tolerance;
- treat radius error and position error as different diagnostics;
- expect Euler at moderate `dt` to increase `r` (outward spiral artifact,
  not physical radial inflow);
- require that decreasing `dt` reduces error for both Euler and RK2;
- require RK2 to be more accurate than Euler at the same `dt`.

A correct field formula does not make Euler exact.

---

## 19. Testing policy

Prefer contract tests over implementation trivia.

Required:

- axis sample equals `(0, 0, 0)`;
- `Vy` identically zero on sampled points;
- tangency `dx Vx + dz Vz = 0`;
- equal-radius speed symmetry;
- formula match at one or more off-axis radii and at large `r`;
- cardinal sign examples for `Ω > 0`;
- sign reversal of `Ω`;
- `Ω = 0` yields the zero field;
- height independence;
- steadiness;
- no input mutation and a new `Vec3` per sample;
- parameter validation failures for non-finite values and `sigma ≤ 0`;
- construction succeeds for `Ω = 0` and `Ω < 0`;
- on-axis tracer remains at rest;
- off-axis tracer acceptance against the continuous circular solution with
  Euler and RK2, including radius drift and `dt` convergence.

Do not require:

- ScenarioConfig integration;
- composite environment + updraft + rotation tests in this slice;
- rendering / glyph tests as physics acceptance;
- curl / vertical-vorticity diagnostics;
- continuity-equation residual checks as storm physics;
- Euler solid-body closed-form radius as an oracle.

Use floating-point tolerance where IEEE-754 representation of `exp` requires
it. Beware signed zero (`-0`) when a computed component is a negated product
with a zero offset; compare with tolerance or coerce `-0` before exact
equality.

---

## 20. Module and type placement

Implementation path for the first slice:

    src/physics/storm/RotationField.ts

`storm/` denotes controlled storm mechanisms under explicit physics documents.
It does not imply a full storm model.

`RotationField` implements `VelocityField` from the core field interface.

Suggested construction shape (documentation-level, not an API freeze beyond
the parameters above):

    new RotationField({
      centerX,
      centerZ,
      angularVelocity,
      sigma,
    })

Exact TypeScript surface may use a params object or positional arguments, but
the semantic parameters and validation rules above are mandatory.

---

## 21. First implementation slice

In order:

1. this document (source of truth);
2. `RotationField` implementation;
3. unit tests for sampling invariants, signs, and validation;
4. analytical tracer acceptance through `Simulation` + Euler and RK2 against
   the continuous circular solution, with tolerance and convergence — never
   treating the integrators as exact off-axis;
5. `npm test` and `npm run typecheck`;
6. stop.

Out of this slice:

- `CompositeVelocityField` wiring of environment + updraft + rotation;
- ScenarioConfig / demo composition;
- renderer changes;
- vertical envelope;
- any second radial profile.

---

## 22. Laboratory composition note

`docs/physics/12-composite-velocity-field.md` already authorizes generic
world-space addition of `VelocityField` operands.

The isolated `RotationField` implementation slice does not include
ScenarioConfig or demo wiring. Laboratory DEMO composition

    V_total = V_environment + V_updraft + V_rotation

is specified in `docs/rendering/04-composite-rotation-demo.md`.

The current live DEMO four-operand sum that uses
`VerticalEnvelopeUpdraftField` is specified in
`docs/rendering/06-composite-vertical-envelope-updraft-demo.md`.
The completed four-operand sum that still used height-independent
`UpdraftField` is `docs/rendering/05-composite-radial-inflow-demo.md`.

Either laboratory sum is controlled composition, not mass-consistent storm
dynamics and not a mesocyclone. Isolated `RotationField` tests remain the
physics contract for the field itself, including the continuous circular
oracle. The live DEMO must not reuse that circular oracle.

---

## 23. Core lesson

`RotationField` v1 is a controlled Gaussian-modulated solid-body circulation
about a vertical axis:

    v_theta(r) = Ω * r * exp( -r² / (2 * sigma²) )
    Vx = Ω * E * dz
    Vy = 0
    Vz = -Ω * E * dx

Positive `Ω` follows the right-hand rule around world `+Y`.

It exists so the project can rotate tracers with a transparent formula, an
exact continuous circular oracle, and no claim of realistic mesocyclone
physics.

The continuous trajectory is a circle. Euler and RK2 approximate that
circle. They are not the circle.
