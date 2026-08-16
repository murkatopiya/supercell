# Radial Inflow Field

## 1. Purpose

This document defines the first controlled horizontal inward-flow mechanism
in Supercell Explorer: `RadialInflowField` v1.

It answers:

    Given a vertical axis and a Gaussian radial scale, what world-space
    horizontal radial velocity does a passive tracer sample?

`RadialInflowField` is a mathematically transparent, steady, axisymmetric
horizontal velocity field directed toward a fixed vertical axis. It is the
first storm mechanism that can carry tracers inward in the world `X`–`Z`
plane with nonzero `Vx` / `Vz` and identically zero `Vy`.

It is **not**:

- a mass-consistent supercell inflow;
- a pressure-driven or continuity-solved inflow;
- a storm-relative inflow layer in the helicity / SRH sense;
- an asymmetric inflow jet;
- a complete storm velocity field.

The `storm/` module path means: controlled storm mechanism. It does **not**
mean full or realistic supercell physics.

The type is named `RadialInflowField`, not `InflowField`, so that the API
does not promise arbitrary inflow geometry.

---

## 2. Relationship to existing foundations

`docs/physics/02-velocity-field-basics.md` requires:

- mechanisms to be tested in isolation before documented composition;
- smooth synthetic fields where possible;
- explicit formulas for radial decay (no invented falloff);
- that continuity be considered when inflow is designed (§28);
- that simple vector addition not be treated as automatically physically
  valid (§32).

This document fulfills the continuity requirement by stating the residual
explicitly. It does **not** introduce a continuity solver.

`docs/physics/00-coordinate-system.md` establishes:

    +X = East
    +Y = Up
    +Z = South

The world origin is **not** automatically the inflow axis.

`docs/physics/01-parcel-basics.md` §27–28 warns that visually converging
tracers are not atmospheric mass density and that strong synthetic
convergence without compensating motion may violate mass-continuity
expectations. That warning applies to this field and must remain visible
in tests and later demos.

`docs/physics/03-numerical-integration-basics.md` distinguishes field error
from integrator error. That distinction is mandatory for this field's
tracer acceptance. In particular, the exact continuous map of unbounded
linear inflow `r(t) = r0 * exp(-A t)` is **not** the oracle for this
Gaussian-modulated field.

`docs/physics/11-updraft-field.md` is the template for an isolated,
height-independent, steady Gaussian storm mechanism and for a strictly
one-sided sign policy (`peakVerticalVelocity > 0`).

`docs/physics/13-rotation-field.md` is the horizontal companion: the same
Gaussian envelope and the same prohibition on dividing by `r`, with a
purely tangential rather than purely radial direction.

`docs/physics/12-composite-velocity-field.md` already authorizes generic
world-space addition of `VelocityField` operands. Composition of this
field with environment, updraft, or rotation is **out of scope** for this
document's first implementation slice.

`docs/physics/09-storm-relative-helicity.md` uses “inflow layer” as a
helicity diagnostic concept. That is a different object from this velocity
field and must not be mixed with it.

`docs/architecture/01-scenario-config.md` and
`docs/rendering/07-composite-upper-radial-outflow-demo.md` specified
ScenarioConfig and live-DEMO wiring while this field was the DEMO
inflow occupant. Current DEMO replaces that occupant with
`LowerRadialInflowField`
(`docs/rendering/08-composite-lower-radial-inflow-demo.md`).
This physics document does not own that wiring. Isolated physics
tests for `RadialInflowField` must not require ScenarioConfig.

Architectural role:

    RadialInflowField implements VelocityField
        ↓
    sample(position, time) → world Vec3

First implementation slice:

    isolated RadialInflowField + sampling tests + tracer acceptance

Laboratory sums such as

    V_total = V_environment + V_updraft + V_rotation + V_radial_inflow

are **out of scope** for this document's first implementation slice.

---

## 3. What RadialInflowField is

`RadialInflowField` is a world-space `VelocityField` whose only nonzero
components are horizontal and directed toward a fixed vertical axis.

Conceptually:

    V_inflow(x, y, z, t) = (Vx(r), 0, Vz(r))

where `r` is horizontal radial distance from the axis in the world `X`–`Z`
plane, and the horizontal vector is purely radial and inward.

Properties of v1:

- Gaussian-modulated linear radial profile (defined below);
- steady (independent of `time`);
- height-independent (independent of `y`);
- axisymmetric about the vertical axis through the center;
- unbounded analytic evaluation (no domain clamp);
- continuous and infinitely smooth in space.

This is a controlled laboratory mechanism. It is not a claim about real
low-level supercell inflow.

---

## 4. Center

The inflow axis is fixed by a horizontal center in world coordinates:

    center = (centerX, centerZ)

Units: meters.

The center does **not** include a `centerY`. Vertical position of the axis
is irrelevant in v1 because velocity does not depend on height.

The center must not be silently assumed to be the world origin.

v1 does not introduce a shared `storm.center` type with `UpdraftField` or
`RotationField`. This field owns its own `centerX` and `centerZ`. A later
demo may pass equal numbers without merging the types.

---

## 5. Horizontal radius

Define horizontal offset from the center:

    dx = x - centerX
    dz = z - centerZ

    r² = dx² + dz²
    r  = sqrt(r²) ≥ 0

`r` is a non-negative length in meters in the world horizontal plane
(`X`, `Z`). World `Y` does not enter `r`.

The outward-positive radial unit direction in that plane, for `r > 0`, is
the direction of `(dx, dz)`. Velocity is antiparallel to that vector.

---

## 6. Mathematical definition

Let:

    A     = radialStrainRate
    sigma = horizontal Gaussian scale

Radial velocity, outward-positive, on non-negative `r`:

    v_r(r) = -A * r * exp( -r² / (2 * sigma²) )

World velocity uses the same envelope without constructing a unit radial
vector and without dividing by `r`:

    E  = exp( -r² / (2 * sigma²) )

    Vx = -A * E * dx
    Vy = 0
    Vz = -A * E * dz

This offset form is mandatory. Implementations must **not** normalize
`(dx, dz)` and divide by `r`. On the axis (`r = 0`):

    dx = 0, dz = 0  ⇒  V = (0, 0, 0)

with no `0/0`.

Derived properties of this profile, not additional API:

- `v_r(0) = 0`;
- for `A > 0` and `r > 0`, `v_r(r) < 0` everywhere (inward at every
  finite radius; there is no outer outflow band);
- peak `|v_r|` occurs at `r = sigma`:

      |v_r|_max = A * sigma / sqrt(e)

- as `r → ∞`, `v_r → 0`;
- near the axis (`E ≈ 1`):

      v_r(r) ≈ -A r

  so `A` is the near-axis radial strain rate `lim_{r→0} |v_r| / r`;
- horizontal divergence (derived diagnostic identity, not an API):

      div_h = ∂Vx/∂x + ∂Vz/∂z
            = -A * E * (2 - r² / sigma²)

  On the axis, `-div_h = 2A`. `A` is **not** equal to `-div_h`.
  `div_h` changes sign at `r = sigma * sqrt(2)`: convergent for
  `r < sigma * sqrt(2)`, locally divergent for `r > sigma * sqrt(2)`,
  while `v_r` remains negative. This is a shielded horizontal sink:
  net flux through a circle of radius `r` is `2π r v_r`, and that flux
  tends to `0` as `r → ∞`.

There is no compact support and no exact-zero cutoff. Far-field decay is
entirely given by the formula.

This field is **not** unbounded linear inflow `v_r = -A r`, **not** a
pressure-solved radial jet, and **not** a Rankine-style inflow.

---

## 7. Coordinate and frame semantics

| Quantity | Representation | Notes |
|---|---|---|
| Sample input position | world `Vec3` `(x, y, z)` | meters |
| Sample output velocity | world `Vec3` `(Vx, Vy, Vz)` | m/s |
| Radial strain | `A` in `v_r = -A r E` | 1/s; strictly positive in v1 |
| Vertical velocity | exactly `Vy = 0` | not approximate |

Canonical mapping from `docs/physics/00-coordinate-system.md`:

    (x, y, z) = (eastward, vertical, -northward)

so this field's meteorological horizontal parts are:

    eastward  = Vx
    northward = -Vz
    vertical  = 0

`RadialInflowField.sample` returns world velocity directly.

It does **not**:

- return `AtmosphericVelocity`;
- convert through environmental profile sampling;
- subtract storm motion;
- depend on hodograph / shear / helicity diagnostics.

Do not name world components `u`, `v`, `w`.

---

## 8. Sign convention

Canonical rule:

    A > 0  →  strictly inward radial flow

`A` is not a signed circulation sense. Negative `A` would reverse the
field into outward flow. Outward flow is a different phenomenon and is
not a mode of this type.

This follows `UpdraftField`, where negative `peakVerticalVelocity` is
rejected because a downdraft is a different mechanism. It does **not**
follow `RotationField`, where negative `angularVelocity` is the same
circulation with opposite sense.

### Cardinal examples

For `A > 0`, a point at horizontal distance `d > 0` from the center, and

    E = exp( -d² / (2 * sigma²) )

| Location relative to center | `(dx, dz)` | World velocity | Atmospheric direction |
|---|---|---|---|
| East | `(+d, 0)` | `(-A E d, 0, 0)` | westward (`-X`) |
| West | `(-d, 0)` | `(+A E d, 0, 0)` | eastward (`+X`) |
| North (world `-Z`) | `(0, -d)` | `(0, 0, +A E d)` | southward (`+Z`) |
| South (world `+Z`) | `(0, +d)` | `(0, 0, -A E d)` | northward (`-Z`) |

On a north-up map this is east → west, west → east, north → south,
south → north: toward the axis along the horizontal radius.

---

## 9. Parameters

| Parameter | Symbol | Meaning | Units | Constraint |
|---|---|---|---|---|
| `centerX` | — | world east coordinate of axis | m | finite |
| `centerZ` | — | world south coordinate of axis | m | finite |
| `radialStrainRate` | `A` | near-axis coefficient in `v_r = -A r E`; sign is fixed inward | 1/s | finite and `> 0` |
| `sigma` | `σ` | Gaussian horizontal scale in `exp(-r²/(2σ²))` | m | finite and `> 0` |

`radialStrainRate` is the coefficient of the formula above. It is **not**:

- diagnostic horizontal convergence `-div_h`;
- peak inward speed;
- a numerical timestep-convergence setting.

On the axis, the derived identity is `-div_h = 2A`. Tests and later
diagnostics must not treat `A` and `-div_h` as interchangeable.

`sigma` is the scale parameter of the Gaussian exponent as written above.
It is **not** a compact-support radius and not a half-width-at-half-maximum
alias unless a future document defines an explicit conversion.

For this profile, peak `|v_r|` happens to lie at `r = sigma`. That is a
derived property, not a second parameter.

Parameters intentionally absent from v1:

- `centerY`;
- `peakRadialVelocity` (recoverable from `A` and `sigma`, not an API);
- `convergenceRate` as an API name (rejected to avoid confusion with
  `-div_h` and with numerical `dt` convergence);
- vertical envelope / base / top;
- time dependence;
- moving center;
- tilt;
- tangential rotation;
- outflow / signed strain;
- mass-continuity correction;
- ScenarioConfig wiring;
- composition helpers.

Contrast with `RotationField`: `peakTangentialVelocity` was rejected as
API because the natural linear coefficient is `Ω`. The same reasoning
rejects `peakRadialVelocity` here. The natural linear coefficient is `A`.

Contrast with `UpdraftField`: `peakVerticalVelocity` is the on-axis
amplitude. For this inflow profile the on-axis velocity is zero and the
speed peak lies at `r = sigma`, so a peak-speed parameter would couple
amplitude to `sigma`.

---

## 10. Validation policy

Validation belongs at the owning construction boundary of
`RadialInflowField`.

Reject when:

- any parameter is non-finite;
- `sigma ≤ 0`;
- `radialStrainRate ≤ 0`.

Do **not** accept:

- `radialStrainRate = 0` as a “zero inflow” mode;
- `radialStrainRate < 0` as an outflow mode of this type.

The additive identity, if needed, is the absence of this operand or an
explicit zero `ConstantVelocityField`. Outward, height-localized radial
flow is a separate type, `UpperRadialOutflowField`, specified in
`docs/physics/16-upper-radial-outflow-field.md`. Negative
`radialStrainRate` remains invalid on this type.

Sampling itself does not re-validate geometry beyond using the stored
parameters. There is no in-domain / out-of-domain branch: every finite
world position is evaluable.

---

## 11. Steady and height-independent behavior

Although `VelocityField.sample(position, time)` accepts `time`, v1 ignores
it:

    sample(P, t1) = sample(P, t2)

for all times.

Because velocity depends only on horizontal offset from the center:

    same (x, z) relative to center, different y
        → identical V_inflow

This is an intentional simplification for analytical clarity, not a claim
about real inflow-layer depth. Height-dependent lower inflow is a
separate type, `LowerRadialInflowField`, specified in
`docs/physics/17-lower-radial-inflow-field.md`. That type does not
change this field's formula, tests, or height independence.

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

Far from the center, velocity is near zero only because the Gaussian
formula says so, not because of a domain wall.

---

## 14. Axis behavior

At `(centerX, y, centerZ)` for any finite `y`:

    V = (0, 0, 0)

Zero horizontal velocity on the axis does **not** mean that the storm
core is dynamically empty.

`UpdraftField` on the same axis is `(0, W0, 0)`. `RotationField` on the
same axis is also `(0, 0, 0)`, while its vertical vorticity is maximum
there. This field is likewise quiet in velocity on the axis while
`|div_h|` is maximum there (`-div_h = 2A`).

Inflow feeds the axis from the sides. The axial point itself is not
moved horizontally by this mechanism.

A particle with `r0 > 0` does not reach the axis in finite continuous
time. Near the axis the motion is approximately `r(t) ~ exp(-A t)`,
which approaches `0` only as `t → ∞`. That is a property of the linear
core, not a defect.

---

## 15. Distinction from unbounded linear inflow

The rejected profile

    v_r = -A r
    Vx  = -A dx
    Vz  = -A dz

is the radial analog of `SolidBodyRotationYField`: smooth, singular-free,
and linearly growing at infinity.

`RadialInflowField` does not implement that profile. Far-field growth is
incompatible with the Gaussian storm-mechanism pattern already chosen by
`UpdraftField` and `RotationField`.

They share the same inward sign convention and the same offset world
formula at envelope `E = 1`. They are not the same type. No linear-sink
learning field is introduced by this document.

---

## 16. Horizontal divergence and mass continuity

Because `Vy ≡ 0` and the field is height-independent, three-dimensional
divergence equals horizontal divergence:

    ∇ · V = div_h = -A * E * (2 - r² / sigma²)

This field is **not** mass-consistent.

`docs/physics/02-velocity-field-basics.md` §28 requires continuity to be
considered when inflow is designed. v1 considers it by documenting the
residual. v1 does **not** cancel that residual.

In particular:

- adding the existing height-independent `UpdraftField` does not restore
  continuity, because that updraft has `∂Vy/∂y = 0`;
- a laboratory sum `V_inflow + V_updraft` is still not a solved
  continuity system;
- restoring incompressible continuity would require a height-dependent
  vertical velocity with compensating `∂Vy/∂y`, or a separate
  divergence-correction solver.

A later isolated field, `VerticalEnvelopeUpdraftField`
(`docs/physics/15-vertical-updraft-envelope.md`), does introduce
`∂Vy/∂y ≠ 0`. That is not by itself a mass-consistent model, and it does
not couple this field's `radialStrainRate` to updraft parameters. See
that document's continuity boundary.

Those are non-goals of this document. Upper-level radial outflow is
specified separately in
`docs/physics/16-upper-radial-outflow-field.md`. Height-dependent
lower inflow is specified separately in
`docs/physics/17-lower-radial-inflow-field.md`. Neither changes this
field's formula, sign policy, or height independence.

Local `div_h > 0` for `r > sigma * sqrt(2)` does **not** mean the flow
has become outward. Inward direction is the invariant `v_r < 0`. Tests
must not require `div_h < 0` at every sample point.

Visually crowding tracers demonstrate the controlled sink. They do not
demonstrate conservation of air mass
(`docs/physics/01-parcel-basics.md` §27–28).

---

## 17. Relation to RotationField

`RotationField` and `RadialInflowField` share:

- center `(centerX, centerZ)`;
- Gaussian envelope `E`;
- prohibition on dividing by `r`;
- height-independent, steady v1;
- peak speed at `r = sigma`.

They differ in direction:

    RotationField:        Vx =  Ω E dz ,  Vz = -Ω E dx     (tangential)
    RadialInflowField:    Vx = -A E dx ,  Vz = -A E dz     (radial inward)

Equivalently:

    RotationField:        dx Vx + dz Vz = 0
    RadialInflowField:    dx Vz - dz Vx = 0

If a later laboratory composition uses the same center, the same `sigma`,
and both fields, horizontal trajectories become logarithmic spirals:

    dr/dt = -A r E
    dθ/dt =  Ω E
    ⇒  θ - θ0 = -(Ω / A) ln(r / r0)

That identity is recorded here so it is not reinvented. It is **not**
part of this document's first implementation slice. Isolated field tests
remain the physics contract for `RadialInflowField`.

---

## 18. Relation to SRH inflow language

`docs/physics/09-storm-relative-helicity.md` discusses an effective
inflow layer as a diagnostic construction over an environmental profile
and a storm-motion vector.

`RadialInflowField` is a prescribed world-space velocity mechanism. It
does not select an inflow layer, does not compute SRH, and does not
replace storm-relative wind.

Do not describe this API as “the inflow layer”.

Conceptual `V_inflow` in `docs/physics/02-velocity-field-basics.md` §32
is the composition slot this type first occupies. The type name stays
`RadialInflowField` so that slot is not confused with a generic inflow
model.

---

## 19. Explicit non-goals

`RadialInflowField` v1 does **not** include:

- pressure gradient / Bernoulli / perturbation pressure;
- mass-continuity solver or divergence correction;
- compensating subsidence or `∂w/∂y` coupling to updraft;
- boundary-layer friction;
- storm-relative moving center;
- vertical envelope `v_r(r, y)` — that mechanism is a separate type,
  `LowerRadialInflowField`, specified in
  `docs/physics/17-lower-radial-inflow-field.md`; this field stays
  height-independent;
- outflow — that mechanism is a separate type,
  `UpperRadialOutflowField`, specified in
  `docs/physics/16-upper-radial-outflow-field.md`;
- downdraft;
- inflow-jet asymmetry;
- terrain;
- Rankine or other alternative radial profiles;
- `peakRadialVelocity` as API;
- coupling-strength parameter to updraft;
- `CompositeVelocityField` wiring of environment + updraft + rotation +
  inflow;
- ScenarioConfig / demo scene wiring;
- renderer trails, glyphs, or plume;
- special-function (`Ei`) trajectory oracles.

Visual inward motion of tracers under this field demonstrates the
controlled radial mechanism only.

---

## 20. Invariants

For a valid `RadialInflowField`:

1. **Axis rest**  
   At `(centerX, y, centerZ)` for any finite `y`:

       V = (0, 0, 0)

2. **Purely horizontal**  
   `Vy = 0` at every sample point.

3. **Radial inward direction**  
   For `r > 0`:

       dx * Vx + dz * Vz < 0

   On the axis both sides are zero.

4. **No tangential component**  
   The horizontal 2D cross product vanishes:

       dx * Vz - dz * Vx = 0

   including on the axis.

5. **Axisymmetry of speed**  
   Equal `r` ⇒ equal `|V| = A * r * E`.

6. **Cardinal directions**  
   For `A > 0`, the table in §8 holds.

7. **Far-field formula match**  
   At large `r`, `V` must match `Vx = -A E dx`, `Vz = -A E dz` within
   floating-point tolerance — not an ad hoc “approximately zero” check
   that ignores the formula.

8. **Height independence**  
   Fixed horizontal position, varying `y` ⇒ identical `V`.

9. **Steady**  
   Fixed position, varying `time` ⇒ identical `V`.

10. **No input mutation**  
    Caller `position` is unchanged after `sample`.

---

## 21. Analytical tracer acceptance oracle

The **continuous** ODE for the isolated field is:

    dr/dt = -A r exp( -r² / (2 * sigma²) )
    dθ/dt = 0
    dy/dt = 0

Setup:

- field as defined above;
- particle at horizontal offset `(dx0, dz0)` from the center;
- any finite `y0`.

### Exact elementary facts

On the axis (`r0 = 0`):

    V ≡ 0  ⇒  P(t) = P0

for both Euler and RK2 aside from ordinary floating-point roundoff.

Off-axis, the motion stays on the original horizontal ray:

    (dx(t), dz(t)) = s(t) * (dx0, dz0)

with `s(t) > 0` decreasing. Polar angle `θ` is invariant. Height is
invariant: `y(t) = y0`.

For this purely radial field, explicit Euler and RK2 also stay on that
ray exactly (aside from roundoff): each stage samples a velocity parallel
to the current offset, so the discrete update is a radial scale. Ray
preservation is therefore both a continuous invariant and an expected
discrete invariant.

Radius is strictly decreasing for `r0 > 0`. The axis is not reached in
finite continuous time.

### Forbidden general closed form

Do **not** use

    r(t) = r0 * exp(-A t)

as the general oracle. That map is exact only for unbounded linear
inflow `v_r = -A r` (envelope `E ≡ 1`). It is the near-axis approximation
of this field, not its solution.

The separable integral

    t = (1/A) ∫_{r(t)}^{r0} exp(s² / (2 * sigma²)) / s ds

is equivalent to an exponential-integral implicit relation. v1 must
**not** introduce an `Ei` special-function oracle or invert `Ei` in
tests or production code.

### Required continuous bounds

For `A > 0`, `r0 > 0`, and `t > 0`:

    r0 * exp(-A t) < r(t) < r0

The left inequality holds because `E < 1` for all `r > 0`, so
`|v_r| < A r` and radius decays more slowly than the pure exponential.
This bound also rejects a regression that omits the Gaussian envelope.

A useful secondary check, not a substitute for the bounds: if
`r0 ≪ sigma`, then `r(t) ≈ r0 * exp(-A t)` within a documented
tolerance while the particle remains in that core.

### Numerical trajectories are not the oracle

Euler and RK2 do **not** follow the continuous `r(t)` exactly.

Required tracer policy:

- compare geometry to the exact invariants (axis rest, ray, `y`);
- compare radius to the continuous bounds above, not to
  `r0 * exp(-A t)` as equality;
- use a high-resolution RK2 trajectory as a numerical reference for
  `r(t)`;
- require that decreasing `dt` reduces error versus that reference for
  both Euler and RK2;
- require RK2 to be more accurate than Euler at the same `dt`;
- treat radius error and ray error as different diagnostics.

If `A * E * dt ≥ 1`, explicit Euler can step across the axis and flip
the offset sign. That is a numerical overshoot, not physical outflow.
Acceptance tests must choose `dt` with `A dt ≪ 1`.

A correct field formula does not make Euler exact in radius.

Quadrature of the separable integral is permitted inside a test file as
an optional strengthening. It is **not** required in v1 and must not
become a physics-module dependency.

---

## 22. Testing policy

Prefer contract tests over implementation trivia.

Required:

- axis sample equals `(0, 0, 0)`;
- `Vy` identically zero on sampled points;
- inward `dx Vx + dz Vz < 0` for `r > 0`;
- tangency-free / radial `dx Vz - dz Vx = 0`;
- equal-radius speed symmetry;
- formula match at one or more off-axis radii and at large `r`;
- cardinal sign examples for `A > 0`;
- height independence;
- steadiness;
- no input mutation and a new `Vec3` per sample;
- parameter validation failures for non-finite values, `sigma ≤ 0`, and
  `radialStrainRate ≤ 0`;
- construction rejected for `radialStrainRate = 0` and
  `radialStrainRate < 0`;
- on-axis tracer remains at rest;
- off-axis tracer acceptance: ray invariant, constant `y`, monotone
  decrease of `r`, bounds `r0 e^{-A t} < r(t) < r0`, Euler and RK2
  versus a high-resolution reference with `dt` convergence.

Do not require:

- ScenarioConfig integration;
- composite environment + updraft + rotation + inflow tests in this
  slice;
- spiral `RotationField + RadialInflowField` acceptance;
- rendering / glyph tests as physics acceptance;
- curl / vorticity diagnostics;
- `div_h < 0` at every point as a field invariant;
- continuity-equation residual checks as a correctness failure of this
  mechanism;
- `r(t) = r0 e^{-A t}` equality as an oracle;
- exponential-integral oracles.

Use floating-point tolerance where IEEE-754 representation of `exp`
requires it. Beware signed zero (`-0`) when a computed component is a
negated product with a zero offset; compare with tolerance or coerce
`-0` before exact equality.

---

## 23. Module and type placement

Implementation path for the first slice:

    src/physics/storm/RadialInflowField.ts

`storm/` denotes controlled storm mechanisms under explicit physics
documents. It does not imply a full storm model.

`RadialInflowField` implements `VelocityField` from the core field
interface.

Suggested construction shape (documentation-level, not an API freeze
beyond the parameters above):

    new RadialInflowField({
      centerX,
      centerZ,
      radialStrainRate,
      sigma,
    })

Exact TypeScript surface may use a params object or positional
arguments, but the semantic parameters and validation rules above are
mandatory.

---

## 24. First implementation slice

In order:

1. this document (source of truth);
2. `RadialInflowField` implementation;
3. unit tests for sampling invariants, signs, and validation;
4. tracer acceptance through `Simulation` + Euler and RK2 against the
   invariants and radius bounds in §21, with tolerance and `dt`
   convergence — never treating `r(t) = r0 e^{-A t}` as the general
   oracle;
5. `npm test` and `npm run typecheck`;
6. stop.

Out of this slice:

- `CompositeVelocityField` wiring of environment, updraft, rotation, or
  inflow;
- ScenarioConfig / demo composition;
- renderer changes;
- vertical envelope;
- any second radial profile;
- outflow;
- continuity correction.

---

## 25. Laboratory composition note

`docs/physics/12-composite-velocity-field.md` already authorizes generic
world-space addition of `VelocityField` operands.

The isolated `RadialInflowField` implementation slice does not include
ScenarioConfig or demo wiring.

Laboratory DEMO composition is specified in
`docs/rendering/08-composite-lower-radial-inflow-demo.md`.
The completed five-operand DEMO immediately before the inflow
replacement is
`docs/rendering/07-composite-upper-radial-outflow-demo.md`.
The completed four-operand DEMO immediately before upper outflow is
`docs/rendering/06-composite-vertical-envelope-updraft-demo.md`.
The completed four-operand DEMO that still used height-independent
`UpdraftField` is `docs/rendering/05-composite-radial-inflow-demo.md`.

That sum is a controlled laboratory overlay, not mass-consistent storm
dynamics and not a mesocyclone. Isolated `RadialInflowField` tests remain
the physics contract for the field itself. The live DEMO must not reuse
isolated inflow radius bounds or `r(t) = r0 e^{-At}` as a trajectory
oracle.

---

## 26. Core lesson

`RadialInflowField` v1 is a controlled Gaussian-modulated linear inflow
toward a vertical axis:

    v_r(r) = -A * r * exp( -r² / (2 * sigma²) )
    Vx = -A * E * dx
    Vy = 0
    Vz = -A * E * dz

`A = radialStrainRate > 0` is the near-axis radial strain coefficient.
It is not diagnostic horizontal convergence; on the axis `-div_h = 2A`.

It exists so the project can pull tracers toward a documented center
with a transparent formula, no division by `r`, and no claim of
realistic supercell inflow physics.

The continuous trajectory is a radial ray with a non-elementary `r(t)`.
Euler and RK2 approximate that radius. They are not that radius. They
do preserve the ray.
