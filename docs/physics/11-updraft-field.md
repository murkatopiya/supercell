# Updraft Field

## 1. Purpose

This document defines the first controlled vertical storm mechanism in
Supercell Explorer: `UpdraftField` v1.

It answers:

    Given a horizontal center and a Gaussian radial scale, what world-space
    vertical velocity does a passive tracer sample?

`UpdraftField` is a mathematically transparent, steady, axisymmetric vertical
velocity field. It is the first mechanism that can lift tracer particles
through nonzero `Vy`.

It is **not**:

- a realistic supercell;
- a mesocyclone;
- a buoyancy / CAPE model;
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

`docs/physics/04-environmental-wind-profile.md` requires that vertical motion
must **not** be encoded into `EnvironmentalWindProfile`. Updraft belongs to a
separate velocity mechanism.

`docs/physics/00-coordinate-system.md` establishes:

    +X = East
    +Y = Up
    +Z = South

    vertical > 0  →  world Vy > 0  (updraft)

and that the world origin is **not** automatically the updraft center.

Architectural role:

    UpdraftField implements VelocityField
        ↓
    sample(position, time) → world Vec3

First implementation slice:

    isolated UpdraftField + sampling tests + analytical tracer acceptance

Composition with environment:

    V_total = V_environment + V_updraft

is **out of scope** for this document's first implementation slice. It requires
a separate explicit composition decision and slice.

---

## 3. What UpdraftField is

`UpdraftField` is a world-space `VelocityField` whose only nonzero component is
upward velocity that depends on horizontal distance from a fixed center.

Conceptually:

    V_updraft(x, y, z, t) = (0, w(r), 0)

where `r` is horizontal radial distance from the updraft axis in the world
`X`–`Z` plane.

Properties of v1:

- steady (independent of `time`);
- height-independent (independent of `y`);
- axisymmetric about the vertical axis through the center;
- unbounded analytic evaluation (no domain clamp);
- continuous and infinitely smooth in space.

---

## 4. Center

The updraft axis is fixed by a horizontal center in world coordinates:

    center = (centerX, centerZ)

Units: meters.

The center does **not** include a `centerY`. Vertical position of the axis is
irrelevant in v1 because `w` does not depend on height.

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

    W0    = peakVerticalVelocity
    sigma = horizontal Gaussian scale

Then:

    w(r) = W0 * exp( -r² / (2 * sigma²) )

World velocity:

    Vx = 0
    Vy = w(r)
    Vz = 0

Equivalently:

    V_updraft = (0, w(r), 0)

On the axis (`r = 0`):

    w(0) = W0

As `r → ∞`:

    w(r) → 0

There is no compact support and no exact-zero cutoff. Far-field decay is
entirely given by the Gaussian formula.

---

## 7. Coordinate and frame semantics

| Quantity | Representation | Notes |
|---|---|---|
| Sample input position | world `Vec3` `(x, y, z)` | meters |
| Sample output velocity | world `Vec3` `(Vx, Vy, Vz)` | m/s |
| Updraft strength | world `Vy = w(r)` | upward when `W0 > 0` |
| Horizontal velocity | exactly `Vx = 0`, `Vz = 0` | not approximate |

`UpdraftField.sample` returns world velocity directly.

It does **not**:

- return `AtmosphericVelocity`;
- convert through environmental profile sampling;
- subtract storm motion;
- depend on hodograph / shear / helicity diagnostics.

Meteorological vertical velocity `w` matches world `Vy` in sign and magnitude
for this field because the only motion is vertical. Horizontal meteorological
components corresponding to this field are zero.

Do not name world components `u`, `v`, `w`.

---

## 8. Parameters

| Parameter | Symbol | Meaning | Units | Constraint |
|---|---|---|---|---|
| `centerX` | — | world east coordinate of axis | m | finite |
| `centerZ` | — | world south coordinate of axis | m | finite |
| `peakVerticalVelocity` | `W0` | vertical velocity on axis | m/s | finite and `> 0` |
| `sigma` | `σ` | Gaussian horizontal scale in `exp(-r²/(2σ²))` | m | finite and `> 0` |

`sigma` is the scale parameter of the Gaussian exponent as written above.
It is **not** a compact-support radius and not a half-width-at-half-maximum
alias unless a future document defines an explicit conversion.

Parameters intentionally absent from v1:

- `centerY`;
- vertical envelope / base / top;
- time dependence;
- moving center;
- tilt;
- rotation / tangential velocity;
- radial inflow;
- downdraft / signed peak;
- mass-continuity correction;
- ScenarioConfig wiring;
- composition helpers.

---

## 9. Validation policy

Validation belongs at the owning construction boundary of `UpdraftField`.

Reject when:

- any parameter is non-finite;
- `sigma ≤ 0`;
- `peakVerticalVelocity ≤ 0`.

Negative `peakVerticalVelocity` is **not** a downdraft mode of this type.
Downdraft, if introduced later, must be a separate documented mechanism or an
explicitly renamed API. Keeping `UpdraftField` strictly upward preserves naming
and sign policy.

Sampling itself does not re-validate geometry beyond using the stored
parameters. There is no in-domain / out-of-domain branch: every finite world
position is evaluable.

---

## 10. Steady and height-independent behavior

Although `VelocityField.sample(position, time)` accepts `time`, v1 ignores it:

    sample(P, t1) = sample(P, t2)

for all times.

Because `w` depends only on horizontal radius:

    same (x, z) relative to center, different y
        → identical V_updraft

This is an intentional simplification for analytical clarity, not a claim
about real convective towers.

---

## 11. Ownership and mutability

`sample` must:

- not mutate the caller-owned input `position`;
- return a **new** plain `Vec3` object on every call.

It must not return an internal reusable buffer.

---

## 12. Domain policy

v1 is an unbounded analytic field.

- no spatial clamp;
- no quiet-zero outside a cylinder;
- no special boundary return.

Far from the center, velocity is near zero only because the Gaussian formula
says so, not because of a domain wall.

---

## 13. Explicit non-goals

`UpdraftField` v1 does **not** include:

- buoyancy or CAPE forcing;
- pressure perturbation;
- entrainment;
- mass continuity correction;
- compensating subsidence;
- thermodynamics;
- cloud condensate;
- rotation or mesocyclone;
- tornado;
- downdraft;
- turbulence;
- vertical envelope `w(r, y)` — that mechanism is a separate type,
  `VerticalEnvelopeUpdraftField`, specified in
  `docs/physics/15-vertical-updraft-envelope.md`. This v1 type stays
  height-independent;
- `CompositeVelocityField` / `V_environment + V_updraft`;
- ScenarioConfig / demo scene wiring;
- rendering of a plume shape.

Visual lift of tracers under this field demonstrates the controlled vertical
mechanism only. It must not be described as a realistic supercell simulation.

---

## 14. Invariants

For a valid `UpdraftField`:

1. **Axis maximum**  
   At `(centerX, y, centerZ)` for any finite `y`:

       V = (0, W0, 0)

2. **Axisymmetry**  
   Equal `r` ⇒ equal `w` (hence equal `V`).

3. **Purely vertical**  
   `Vx = 0` and `Vz = 0` at every sample point.

4. **Far-field formula match**  
   At large `r`, `Vy` must match `W0 * exp(-r²/(2σ²))` within floating-point
   tolerance — not an ad hoc “approximately zero” check that ignores the
   formula.

5. **Height independence**  
   Fixed horizontal position, varying `y` ⇒ identical `V`.

6. **Steady**  
   Fixed position, varying `time` ⇒ identical `V`.

7. **No input mutation**  
   Caller `position` is unchanged after `sample`.

8. **Monotone radial decay for `W0 > 0`**  
   If `r1 < r2`, then `w(r1) > w(r2) > 0`.

---

## 15. Analytical tracer acceptance oracle

This is the primary acceptance oracle for the first implementation slice.

Setup:

- field as defined above;
- particle exactly on the axis:

      P0 = (centerX, y0, centerZ)

- any finite `y0`.

Then the ODE is:

    dx/dt = 0
    dy/dt = W0
    dz/dt = 0

Exact solution:

    x(t) = centerX
    y(t) = y0 + W0 * t
    z(t) = centerZ

Because velocity is spatially constant along this trajectory (the particle
remains on the axis, where `w ≡ W0`), both Euler and RK2 are exact for this
path aside from ordinary floating-point roundoff.

This oracle proves that the updraft mechanism lifts a tracer with the
documented peak vertical velocity.

A useful secondary check (not a substitute for the oracle):

- off-axis particle at fixed `(x, z)` with `r > 0` has `0 < Vy < W0` and zero
  horizontal velocity, so it rises more slowly while keeping the same
  horizontal coordinates.

---

## 16. Testing policy

Prefer contract tests over implementation trivia.

Required:

- axis sample equals `(0, W0, 0)`;
- equal-radius symmetry;
- `Vx` / `Vz` identically zero on sampled points;
- formula match at one or more off-axis radii;
- height independence;
- steadiness;
- parameter validation failures for non-finite, `sigma ≤ 0`, and
  `peakVerticalVelocity ≤ 0`;
- on-axis analytical tracer acceptance (`y(t) = y0 + W0 * t`).

Do not require:

- ScenarioConfig integration;
- composite environment + updraft tests in this slice;
- rendering / glyph tests as physics acceptance;
- continuity-equation residual checks (non-goal).

Use floating-point tolerance where IEEE-754 representation of `exp` requires
it. Beware signed zero only if equality assertions on components could be
affected; preferred assertions compare components with tolerance or exact `0`
where the implementation returns literal zeros for `Vx` / `Vz`.

---

## 17. Module and type placement

Implementation path for the first slice:

    src/physics/storm/UpdraftField.ts

`storm/` denotes controlled storm mechanisms under explicit physics documents.
It does not imply a full storm model.

`UpdraftField` implements `VelocityField` from the core field interface.

Suggested construction shape (documentation-level, not an API freeze beyond
the parameters above):

    new UpdraftField({
      centerX,
      centerZ,
      peakVerticalVelocity,
      sigma,
    })

Exact TypeScript surface may use a params object or positional arguments, but
the semantic parameters and validation rules above are mandatory.

---

## 18. First implementation slice

In order:

1. this document (source of truth);
2. `UpdraftField` implementation;
3. unit tests for sampling invariants and validation;
4. analytical on-axis tracer acceptance through `Simulation` + integrator;
5. `npm test` and `npm run typecheck`;
6. stop.

Out of this slice:

- `CompositeVelocityField`;
- ScenarioConfig / demo composition;
- renderer changes;
- vertical envelope;
- any second storm mechanism.

---

## 19. Future composition note

`docs/physics/02-velocity-field-basics.md` allows conceptual composition:

    V_total = V_environment + V_updraft + ...

Vector addition is mathematically available because both sides are world-space
`VelocityField` samples. That does **not** by itself make the sum a physically
complete storm.

A future slice may introduce an explicit composite field only after documenting:

- operand order / meaning;
- that v1 addition is a controlled laboratory composition, not mass-consistent
  storm dynamics;
- how diagnostics and demos select isolated vs composite fields.

Until that slice exists, tests and demos for `UpdraftField` must use the
isolated field.

---

## 20. Core lesson

`UpdraftField` v1 is a controlled Gaussian vertical velocity:

    w(r) = W0 * exp( -r² / (2 * sigma²) )
    V    = (0, w(r), 0) in world coordinates

It exists so the project can lift tracers with a transparent formula, exact
on-axis oracle, and no claim of realistic supercell physics.

Environment stays horizontally responsible. Updraft stays vertically
responsible. Composition comes later, explicitly.
