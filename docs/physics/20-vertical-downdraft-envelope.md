# Vertical Downdraft Envelope

**Status:** isolated type live. Sixth-operand DEMO wiring is live
per `docs/rendering/15-composite-downdraft-demo.md`.
`AtmosphericTracerDomain` is live on DEMO `Simulation` (`11`).
This document owns the formula, not DEMO occupancy numbers.

## 1. Purpose

This document defines the first prescribed downdraft mechanism in
Supercell Explorer: `VerticalEnvelopeDowndraftField` v1.

It answers:

    Given a Gaussian radial scale, a compact vertical interval, and a
    positive peak downward speed, what world-space velocity does a
    passive tracer sample?

v1 is separable:

    Vy(r, y) = −D0 * E_r(r) * F(y)
    Vx = 0
    Vz = 0

where `D0 > 0` is a peak downward speed, `E_r` is the same radial
Gaussian family as `docs/physics/11-updraft-field.md` /
`docs/physics/15-vertical-updraft-envelope.md`, and `F` is a bounded
vertical envelope with `0 ≤ F(y) ≤ 1`.

This is a mathematically transparent, steady, axisymmetric, purely
vertical velocity field. It is a **new independent prescribed
operand**. It is the first mechanism whose isolated `Vy` is negative
inside an active layer.

It is **not**:

- the return branch of S1 / S2;
- a continuity closure or mass-conserving compensating flow;
- a cold pool, gust front, or surface outflow;
- RFD or FFD;
- a pressure or buoyancy result;
- a signed mode of `VerticalEnvelopeUpdraftField`;
- a ground-collision engine or atmospheric-floor substitute;
- a realistic supercell.

The `storm/` module path means: controlled storm mechanism. It does
**not** mean full or realistic supercell physics.

Architectural predecessors that this document must obey and must not
quietly replace:

- `docs/architecture/10-composite-continuity-mass-budget-audit.md`
- `docs/architecture/11-ground-atmospheric-domain-policy.md`

---

## 2. Relationship to existing foundations

`docs/physics/00-coordinate-system.md`:

    +X = East
    +Y = Up
    +Z = South

    vertical < 0  →  world Vy < 0  (downdraft)

`y = 0` is the reference ground datum. Negative `y` is
mathematically allowed. The world origin is **not** automatically
this field’s axis.

`docs/physics/02-velocity-field-basics.md` requires isolated tests
before composition, explicit formulas, documented sharp transitions,
and that a field must not silently return zero outside a domain
unless that behavior is specified. Compact support here is
intentional: sampling outside the layer returns exact rest.

`docs/physics/01-parcel-basics.md` §27–29, §32: crowding tracers are
not mass density; correct integration is not mass conservation.
Those warnings apply here and are strengthened by `10`.

`docs/physics/03-numerical-integration-basics.md` distinguishes field
error from integrator error. Because `Vy` varies with `y`, a
constant-speed map `y(t) = y0 − D0 t` is **not** the isolated
oracle except at the single height where `F = 1` and only while the
particle remains there.

`docs/physics/04-environmental-wind-profile.md`: environmental
`vertical` is identically `0`. Downdraft must not be encoded into
the profile.

`docs/physics/11-updraft-field.md` and
`docs/physics/15-vertical-updraft-envelope.md` own the upward
Gaussian-vertical family. `15` §13 forbids negative
`peakVerticalVelocity` as a downdraft mode of that type. This
document is the fulfillment of that prohibition: a **sibling type**,
not a sign flip of the updraft API.

`docs/physics/12-composite-velocity-field.md` already authorizes
generic world-space addition. Isolated implementation of this field
did not compose it. Live sixth-operand wiring is specified and
implemented in `docs/rendering/15-composite-downdraft-demo.md`.

`docs/physics/16-upper-radial-outflow-field.md` and
`docs/physics/17-lower-radial-inflow-field.md` are horizontal
radial siblings. This field is purely vertical. Near-ground
divergent outflow is a later mechanism, not a `Vx`/`Vz` of v1.

`docs/architecture/10-composite-continuity-mass-budget-audit.md`:
a future prescribed downdraft may exist as a sixth independent
kinematic operand with its own envelope and own `∇ · V`. It must
not be parameter-tied to `W0`, `A_in`, or `A_out` by a continuity
equation. It must not be described as the air that rose along
S1/S2. Existence ≠ RED; “return of this air” = RED.

`docs/architecture/11-ground-atmospheric-domain-policy.md`:
mathematical fields remain sampleable on all finite coordinates.
Atmospheric tracers occupy `y ≥ 0` via `AtmosphericTracerDomain`
in `Simulation` (`11`). The isolated primitive is ground-unaware.
`Vy_down(0) = 0` is not required by domain policy. Isolated tests
must **not** apply the atmospheric floor. Live sixth-operand
wiring is `docs/rendering/15-composite-downdraft-demo.md`.

Isolated tests must not require ScenarioConfig. DEMO occupancy
numbers live in `15` / `01`, not in this physics document.

Architectural role:

    VerticalEnvelopeDowndraftField implements VelocityField
        ↓
    sample(position, time) → world Vec3

First implementation slice:

    isolated VerticalEnvelopeDowndraftField
      + sampling tests
      + isolated tracer acceptance
      + STOP

---

## 3. Why this is a new type

### 3.1 Not a signed `VerticalEnvelopeUpdraftField`

Options:

**A.** Allow `peakVerticalVelocity < 0` on
`VerticalEnvelopeUpdraftField` (or on `UpdraftField`).

**B.** Add a dual-mode flag / signed peak on those types.

**C.** New sibling type.

**A** and **B** are rejected.

Reasons:

- `15` §13 already locked negative `peakVerticalVelocity` as invalid,
  not as downdraft.
- Siblings use **positive** strength semantics (`W0 > 0`, `A > 0`,
  `Ω` signed only because rotation has a genuine two-way sense).
  Forcing the caller to pass a negative speed would be the only
  vertical field with that API shape.
- Updraft and downdraft are different pedagogical objects even when
  the algebra is `±D0 E F`. Mixing them in one type makes every
  test, error message, and DEMO DTO ambiguous about which mechanism
  is on.
- A later offset DEMO, a later different envelope, or a later
  surface-outflow companion would have to split the type anyway.

v1 is **C**: a new type.

The formula is allowed to be the sign-reversed sibling of `15`.
The **API and identity** are not.

### 3.2 Not a height-independent `DowndraftField`

`UpdraftField` and `RotationField` began height-independent. That
became Y1 / Y20 debt: a full-height tube, including `y < 0`.

A first downdraft that existed at every height would immediately:

- occupy the underground half-space that `11` just reserved as
  non-atmospheric for tracers;
- occupy the far aloft where DEMO outflow already lives;
- teach “downdraft = negative `W0` everywhere.”

There is therefore **no** v1 height-independent `DowndraftField`.
Do not create one “for completeness” or as a stepping stone.

The first prescribed downdraft is enveloped from the start, the
same way `UpperRadialOutflowField` never had a height-independent
parent.

---

## 4. Canonical type name

| Name | Verdict |
| --- | --- |
| `DowndraftField` | Rejected as the v1 type. Matches the height-independent `UpdraftField` pattern that this document refuses to repeat. |
| `VerticalEnvelopeDowndraftField` | **Canonical.** Sibling of `VerticalEnvelopeUpdraftField`. States envelope, vertical motion, and independence from the updraft type. Does not require a height-independent parent to exist. |
| `PrescribedDowndraftField` | Rejected. Every synthetic operand is prescribed. The adjective belongs in copy and in `10`, not in the type. |
| `CompactDowndraftField` | Rejected. Compact support is the envelope, already in the canonical name. |
| `OffsetDowndraftField` / `RearFlankDowndraftField` / `ForwardFlankDowndraftField` | Rejected. Offset is center placement, not a different formula. RFD/FFD naming is a non-goal. |

One name. No aliases. No signed-updraft export.

Filename follows `15` / `18`:

    docs/physics/20-vertical-downdraft-envelope.md

---

## 5. What VerticalEnvelopeDowndraftField is

A world-space `VelocityField` whose only nonzero component is
**downward** velocity that depends on horizontal distance from a
fixed vertical axis and on a compact vertical envelope.

    V(x, y, z, t) = (0, Vy(r, y), 0)

    r² = (x − centerX)² + (z − centerZ)²

Properties of v1:

- Gaussian radial factor `E_r(r)`;
- compact half-sine vertical envelope on `[baseHeight, topHeight]`;
- steady (`time` ignored);
- axisymmetric about **this field’s** vertical axis;
- `Vx = Vz = 0` identically;
- defined at every finite world position;
- continuous in space (`C^0`); not `C^1` in `y` at the lids.

This is a controlled laboratory mechanism. It is not gravity. A
tracer above the layer is **not** pulled into it. A tracer below
the layer is **not** pushed further down by this field. Descent
happens only where `F > 0`.

---

## 6. Center and offset

The axis is a horizontal pair in world coordinates:

    centerX    // east, m
    centerZ    // south, m

`r` is distance to **this** axis, not to the updraft axis, not to
the world origin, and not to a `storm.center` (there is none).

There is no `centerY`. Vertical localization is `baseHeight` /
`topHeight`. Peak height is derived (`y_mid`).

### 6.1 Offset research

Should the first prescribed downdraft sit on the updraft axis?

| | Policy | Meaning |
| --- | --- | --- |
| **A** | Concentric as a physics law of the primitive | Type would omit independent center, or would require it to equal the updraft center. |
| **B** | Offset as a physics law of the primitive | Type would require a nonzero displacement from some other field’s axis. |
| **C** | Primitive has an independent center; DEMO placement later | Same API as `15` / `16` / `17` / `18`. |

**C is canonical.**

A bakes DEMO coincidence into the type and recreates Y2 as a
coupling. The primitive would have to read another field’s center
or a global `storm.center`. Forbidden (`02` G7 / Y2).

B bakes a flank displacement into v1 and invites the name RFD.
An offset of zero would then be “invalid physics.” That is DEMO
taste, not a formula.

Independent `centerX` / `centerZ` already **are** the offset API.
A later DEMO may place this axis on the origin (concentric fixture)
or elsewhere (spatial offset fixture). That choice is not this
document.

Do **not** call an offset DEMO “RFD” or “FFD.” Those names claim
storm-scale structure this field does not have.

### 6.2 What “offset” is not in v1

v1 is still axisymmetric about its own axis. A kidney-shaped,
horseshoe, or rear-flank **planform** is a different radial family
and is out of scope.

---

## 7. Horizontal geometry

### 7.1 Radial family

The radial factor is the project’s existing Gaussian:

    E_r(r) = exp( −r² / (2 σ²) )

`sigma` is this field’s own Gaussian scale. It is not
`storm.sigma`, not required to equal the updraft `sigma`, and not
a compact-support radius.

This is the minimal family that:

- matches `11` / `15` so isolated tests and FD identities stay in
  one algebra;
- decays at infinity without a horizontal wall;
- needs no new radial parameter.

Rejected for v1: top-hat, compact disk, exponential `e^{−r/L}`,
and any planform that exists only to look like a flank.

### 7.2 Horizontal velocity

    Vx = 0
    Vz = 0

everywhere, including inside the layer.

Spreading at the surface, cold-pool outflow, and near-ground
divergent `V_h` are **other mechanisms**. Putting them in `Vy`’s
type would smuggle a second operand into v1.

### 7.3 Separability

Canonical v1:

    Vy(x, y, z) = −D0 * E_r(r) * F(y)

Separability is a modeling choice, not a claim that real downdrafts
are separable.

---

## 8. Vertical envelope comparison

Let:

    y_b = baseHeight
    y_t = topHeight
    H   = y_t − y_b > 0
    ξ   = (y − y_b) / H
    y_mid = (y_b + y_t) / 2

### 8.1 Candidate A — half-sine compact layer

    F(y) = sin(π ξ)     for y_b ≤ y ≤ y_t
    F(y) = 0            otherwise

Same family as `15` / `16` / `18`.

| Property | Value |
| --- | --- |
| Nonzero support | `[y_b, y_t]` |
| Lids | `F(y_b) = F(y_t) = 0` |
| Maximum | `F = 1` at `y_mid` |
| Smoothness | `C^0`; not `C^1` at the lids |
| Interior `F'` | `(π/H) cos(π ξ)` |
| Leak to `±∞` | none |
| New parameters | 2 |
| Hidden scale | none |
| Isolated ODE | elementary (`15` §17.3 with reversed time) |
| Ground | lids are envelope zeros, not a floor |

Textbook first vertical mode of a layer with vertical velocity
zero at both lids. Not a collision substitute: the zeros exist
even if `y_b ≠ 0`.

### 8.2 Candidate B — upper plateau + taper downward

The `17` family, inverted:

    F = 1     for y ≥ some plateau floor
    taper     downward to a lower lid
    F = 0     below that lid

If the plateau continues to `+∞`, the field leaks through the
outflow cap and the far aloft. That is the Y5 leak in the upward
direction.

If a second upper lid is added, the shape is a slab or a
rise/hold/fall envelope: extra bounds, extra lid cases, no current
kinematic reason (`18` already rejected this for v1 rotation).

A “strong aloft, weaken toward ground” one-sided taper with the
lower zero at `y = 0` would **look** like a ground law. `11`
forbids designing the envelope as a collision substitute.

Rejected for v1.

### 8.3 Candidate C — Gaussian in `y`

    F(y) = exp( −(y − y_peak)² / (2 σ_y²) )

Never compact. Weak downdraft at `y → ±∞`, including underground.
Same rejection as `15` §4.2, now stronger because `11` exists.
Rejected.

### 8.4 Candidate D — Hann / `sin²`

Smoother lids, quieter `∂Vy/∂y` at the edges, less standard as a
first mode. Rejected for v1 for the same reasons as `15` §4.3.
Reopen only if lid derivative jumps become the teaching artifact.

### 8.5 Candidate E — surface-reaching one-sided shape

A dedicated `F` with `F(0) ≠ 0` as a **physics law** so that
downdraft exists at the datum.

Rejected as a v1 envelope family. Domain policy does not require
`Vy(0) = 0`, and also does not require `Vy(0) ≠ 0`. A surface-
reaching occupancy is available **inside candidate A** by choosing
`baseHeight < 0 < topHeight`, so that `y = 0` is an interior point
and `F(0) > 0`. That is a bound choice, not a new formula. DEMO
bounds are `docs/rendering/15-composite-downdraft-demo.md`.

### 8.6 Canonical choice

**Candidate A, the half-sine on `[baseHeight, topHeight]`, is
canonical.**

Reasons that are **not** “the updraft already uses it”:

1. Compact support both ways — required so the field is off below
   **and** above a chosen band (Y1 lesson).
2. Exact lid zeros without making `y = 0` special.
3. `max F = 1`, so `peakDownwardVelocity` is a true peak of `|Vy|`.
4. Two vertical parameters; `y_mid` is derived.
5. Elementary `F`, `F'`, and isolated ODE.
6. Same vertical-mode vocabulary as the other compact operands,
   which keeps `10`’s composite `∇ · V` algebra additive in a
   known family.

v1 does **not** leave the envelope as an implementation option.

---

## 9. Canonical formula

Let:

    D0  = peakDownwardVelocity    // > 0, m/s
    σ   = sigma
    y_b = baseHeight
    y_t = topHeight
    H   = y_t − y_b

    dx = x − centerX
    dz = z − centerZ
    r² = dx² + dz²

    E_r(r) = exp( −r² / (2 σ²) )
    ξ(y)   = (y − y_b) / H

    F(y) = sin(π ξ(y))     if y_b ≤ y ≤ y_t
    F(y) = 0               if y < y_b or y > y_t

Then:

    Vy = −D0 * E_r(r) * F(y)
    Vx = 0
    Vz = 0

On the closed interval the sine already yields `F(y_b) = F(y_t) = 0`.
Implementations must **not** introduce a thickness, epsilon, or
smoothstep near the lids.

Do not clamp, saturate, or renormalize `F`. Do not divide by
`max F`.

Derived facts, not additional API:

- `0 ≤ F(y) ≤ 1`;
- `F` is even about `y_mid`;
- unique `F = 1` at `y_mid`;
- `Vy ≤ 0` everywhere;
- `Vy = 0` outside the open layer and on the lids;
- global minimum of `Vy` is `−D0`, attained only at
  `(centerX, y_mid, centerZ)`.

---

## 10. Strength semantics

Invariant:

    peakDownwardVelocity = D0 > 0

is the **global maximum of downward speed** `|Vy|`, equivalently
the global minimum of `Vy` with value `−D0`.

It is attained if and only if `r = 0` and `F = 1`, i.e. on the
axis at `y_mid`.

The caller always passes a **positive** number. The field applies
the minus sign.

Forbidden APIs:

- `peakVerticalVelocity < 0` on this type or on `15`;
- `peakDownwardVelocity < 0` as “updraft mode”;
- a signed `W0` shared with the updraft DTO.

On the axis but off `y_mid`:

    −D0 < Vy ≤ 0

Off-axis at `y_mid`:

    −D0 < Vy < 0

---

## 11. Vertical domain and ground

### 11.1 Bounds

    baseHeight    // world +Y, m
    topHeight     // world +Y, m
    topHeight > baseHeight

Equal or inverted bounds are invalid. No minimum `H` in the
constructor. Very small `H` makes `|F'| ~ 1/H` a timestep concern.
That is not constructor validation.

`baseHeight` **may be negative**. Ground `y = 0` is not an implicit
lid of this type (`15` §6.2, `11` §13).

`baseHeight = 0` **may** be a later DEMO occupancy choice. It is
not a physics law of v1. If DEMO later chooses it, `F(0) = 0` and
therefore `Vy(0) = 0` as an envelope lid, not as domain policy.

### 11.2 Behavior by region

| Region | `F` | `Vy` |
| --- | --- | --- |
| `y < baseHeight` | `0` | `0` |
| `y = baseHeight` | `0` | `0` |
| `baseHeight < y < topHeight` | `sin(π ξ) ∈ (0, 1]` | `−D0 E_r F < 0` |
| `y = topHeight` | `0` | `0` |
| `y > topHeight` | `0` | `0` |

No hidden epsilon. Ordinary IEEE-754 comparisons against the
stored bounds.

### 11.3 Sampling domain (G17)

v1 is defined at every finite world position. Sampling outside
`[baseHeight, topHeight]` is **not** an error. It returns
`V = (0, 0, 0)`.

This is compact support, not a silent fallback
(`02` §35). Reason: composability of `CompositeVelocityField`.

There is no horizontal domain wall. Far-field decay is only
`E_r`.

### 11.4 Relationship to atmospheric tracer domain

`11` verdict B:

```text
field sampling:     unbounded finite y   (this type)
tracer domain:      y ≥ 0                (Simulation, later)
crossing:           interpolate to y = 0, deactivate
```

This type:

- does **not** implement `AtmosphericTracerDomain`;
- does **not** clamp, reflect, or zero `Vy` at `y = 0` unless
  `y = 0` happens to be a lid or exterior of **its** envelope;
- must be tested **without** the atmospheric floor;
- must not use ground crossing as an oracle.

A particle of the isolated field that Euler-overshoots `baseHeight`
into `y < y_b` (possibly `y < 0`) becomes **exact rest** because
`F = 0` there. That is envelope exterior, not `11`’s pathline
termination. Isolated tests must choose `D0 dt ≪ H` so that this
timestep error is not the lesson.

Live atmospheric tracers that would cross `y = 0` in a future
composite are `Simulation`’s problem, and only after
`AtmosphericTracerDomain` exists.

---

## 12. Coordinates, frame, and time

Canonical world axes remain. `sample` returns world `Vec3`.

It does **not**:

- return `AtmosphericVelocity`;
- convert through the environmental profile;
- subtract `stormMotion`;
- translate the axis with `C`;
- depend on hodograph / shear / helicity diagnostics.

Meteorological vertical velocity matches world `Vy` in sign and
magnitude for this field. Do not name world components `u`, `v`,
or `w`.

The field is Eulerian-steady:

    sample(P, t1) = sample(P, t2)

Trajectories still depend on time through changing `y`.

---

## 13. Height derivative and divergence

### 13.1 Envelope derivative

For `y_b < y < y_t`:

    F'(y) = (π / H) * cos(π ξ)

Outside the open interval: `F' = 0`.

At the lids, `F` is `C^0` but not classically differentiable.
One-sided interior limits:

    y → y_b⁺ :  F' → +π/H
    y → y_t⁻ :  F' → −π/H

Exterior: `0`. Do not average them. No production `derivative()`
API (`10` §11).

### 13.2 Field divergence

`Vx ≡ 0`, `Vz ≡ 0`, so

    ∇ · V = ∂Vy/∂y

Inside the open layer:

    ∂Vy/∂y = −D0 * E_r(r) * (π / H) * cos(π ξ)

Outside: `0`.

Sign, for `D0 > 0` and `E_r > 0`:

| Region | `F'` | `∂Vy/∂y` | Meaning for a descending parcel |
| --- | --- | --- | --- |
| `y_b < y < y_mid` | `> 0` | `< 0` | `|Vy|` decreases toward the lower lid (decelerating descent) |
| `y = y_mid` | `= 0` | `= 0` | peak downward speed |
| `y_mid < y < y_t` | `< 0` | `> 0` | `|Vy|` increases as the parcel descends (accelerating descent) |
| exterior | `0` | `0` | inactive |

Kinematically: source in the **upper** half of the layer
(`∇ · V > 0`), sink in the **lower** half (`∇ · V < 0`). This is
the sign reversal of `15` §9.2, as required by `Vy → −Vy`.

On the axis, interior lid limits:

    ∂Vy/∂y → ∓ D0 π / H     (minus at the lower lid, plus at the upper)

### 13.3 Horizontal divergence

    div_h = ∂Vx/∂x + ∂Vz/∂z = 0

identically. This operand cannot cancel `17`’s `div_h` at any `r`.
It can only add a separable `∂Vy/∂y` term in its own window.

---

## 14. Vorticity

Isolated field, interior of the layer:

    ∂Vy/∂x = D0 F E_r x / σ²
    ∂Vy/∂z = D0 F E_r z / σ²

    ω_x = ∂Vz/∂y − ∂Vy/∂z = −D0 F E_r z / σ²
    ω_y = ∂Vx/∂z − ∂Vz/∂x = 0
    ω_z = ∂Vy/∂x − ∂Vx/∂y =  D0 F E_r x / σ²

Outside the layer, `F = 0` ⇒ `ω = 0` (and at the lids in the
classical sense the same, with one-sided `F'` unused because `F`
itself is zero there).

This is horizontal vorticity from **radial shear of vertical
velocity**, the sign-reversed sibling of the same structure on
`15`. It is **not**:

- environmental `HorizontalVorticity` from vertical wind shear
  (`06`);
- streamwise/crosswise vorticity of this field’s own flow (isolated
  `V_h ≡ 0`, so those diagnostics have no horizontal direction
  here);
- vertical vorticity / a vortex (`ω_y ≡ 0`).

No production `curl()` API. The formulas are for tests and for
forbidding a tilting story.

---

## 15. Continuity anti-claims

This section restates `10` for this operand. It does not retune
`10` and does not choose DEMO numbers.

### 15.1 Isolated identity

    ∇ · V_down = −D0 E_r(r) (π / H) cos(π ξ)
                 inside the open layer, else 0

### 15.2 Live five-operand sum, if this field is added later

Divergence is linear:

    ∇ · V_total = ∇ · V_up + ∇ · V_in + ∇ · V_out + ∇ · V_down

Environment, rotation, and constant `C` still contribute `0`.

No v1 invariant ties

    D0, H_down, y_b, y_t, σ_down, center_down

to

    W0, A_in, A_out, H_up, …

Even with coincident centers and `σ`, the downdraft term in
brackets depends on **this** field’s `ξ(y)` and `H`, while inflow’s
radial factor remains `(2 − r²/σ²)`. Separable `Vy = −D0 E F`
cannot cancel that inflow at all `r` at a fixed `y` unless `A_in = 0`
(`15` §11.3, unchanged in structure).

Local near-cancellation at some points may happen by DEMO
accident. That is not a budget (`10` §8).

### 15.3 Forbidden claims

- this field is the return of S1/S2 air;
- this field closes the mass circuit / makes `∇ · V = 0`;
- inflow is compensated because a downdraft now exists;
- stopping a future tracer at `y = 0` is a no-flux condition
  produced by this field (`11` §12);
- `∇ · V_down = 0` at `y_mid` means the storm is non-divergent;
- parameter-tying `D0` to `W0` or `A_in` “to conserve mass.”

Honest copy: prescribed downward motion in a chosen window.

Existence of this operand, by itself, keeps the continuity debt
YELLOW. Selling it as the return branch makes the debt RED (`10`).

---

## 16. Parameters

| Parameter | Symbol | Meaning | Units | Constraint |
| --- | --- | --- | --- | --- |
| `centerX` | — | world east of **this** axis | m | finite |
| `centerZ` | — | world south of **this** axis | m | finite |
| `peakDownwardVelocity` | `D0` | global max of `|Vy|`, attained at axis and `y_mid` | m/s | finite and `> 0` |
| `sigma` | `σ` | Gaussian horizontal scale in `exp(−r²/(2σ²))` | m | finite and `> 0` |
| `baseHeight` | `y_b` | world `y` of the lower lid | m | finite |
| `topHeight` | `y_t` | world `y` of the upper lid | m | finite and `> baseHeight` |

Parameters intentionally absent from v1:

- `centerY`;
- free `peakHeight` (derived: `y_mid`);
- envelope selector / `F` enum;
- `sigmaY`;
- time dependence;
- moving or tilted axis;
- required offset from another field;
- `Vx` / `Vz` / radial outflow;
- signed peak / updraft mode;
- mass-continuity coupling to `W0`, `A_in`, `A_out`;
- ground / `groundHeight` / atmospheric floor;
- RFD / FFD flags;
- ScenarioConfig wiring;
- composition helpers;
- a `derivative()` or `curl()` API.

---

## 17. Validation policy

Validation belongs at the owning construction boundary of
`VerticalEnvelopeDowndraftField`.

Reject when:

- any parameter is non-finite (`NaN` or `±Infinity`);
- `sigma ≤ 0`;
- `peakDownwardVelocity ≤ 0`;
- `topHeight ≤ baseHeight`.

Do **not** reject:

- `baseHeight < 0`;
- `baseHeight = 0`;
- `centerX` / `centerZ` other than the origin;
- `sigma` different from the updraft `sigma`;
- large or small positive `H`.

Sampling does not re-validate. Every finite world position is
evaluable.

Error type: `VerticalEnvelopeDowndraftFieldError`.

---

## 18. Ownership and mutability

The field owns its parameters. `sample` must not mutate the input
position. Each sample returns a new `Vec3`.

`time` is ignored and must not be written.

---

## 19. Isolated tracer acceptance

Do **not** use the live DEMO composite as an oracle.
Do **not** use atmospheric-floor crossing as an oracle.
Do **not** use `y(t) = y0 − D0 t` except as a **forbidden**
regression whenever `F(y0) ≠ 1` or the particle leaves `y_mid`.

The isolated primitive is a mathematical `VelocityField`. Tests
may seed `y < 0` if the envelope contains that height.

### 19.1 Horizontal invariance

`Vx = Vz = 0` ⇒

    x(t) = x0
    z(t) = z0

exact discrete invariant for Euler and RK2.

### 19.2 Inactive layer: exact rest

If `y0 ≤ baseHeight` or `y0 ≥ topHeight`:

    V ≡ 0  ⇒  P(t) = P0

including exact lid positions. A tracer **above** the layer does
not fall into it. A tracer **below** the layer is not driven
further down.

### 19.3 Interior closed form

Along a trajectory `E_r` is constant, `E0 = E_r(r0)`.

Inside the open layer:

    dy/dt = −W_eff * sin(π (y − y_b) / H)

    W_eff = D0 * E0 > 0

Let `ξ = (y − y_b) / H` with `ξ0 ∈ (0, 1)`:

    dξ/dt = −(W_eff / H) * sin(π ξ)

    tan(π ξ(t) / 2)
      = tan(π ξ0 / 2) * exp(−π W_eff t / H)

    ξ(t) = (2/π) arctan( tan(π ξ0 / 2) * exp(−π W_eff t / H) )

    y(t) = y_b + H ξ(t)

This is `15` §17.3 with reversed time. For all finite `t ≥ 0`:

    0 < ξ(t) < ξ0
    y_b < y(t) < y0

The particle:

- descends monotonically (`Vy < 0` in the open layer);
- never reaches `baseHeight` in finite **continuous** time;
- never goes upward;
- never leaves through the top.

On the axis, `W_eff = D0`. Off-axis, `W_eff = D0 E_r(r0)`.

### 19.4 Numerical trajectories are not the closed form

Euler and RK2 are not exact.

Required policy:

- compare numerical `y` to §19.3;
- keep `x`, `z` exact;
- nonzero tolerance;
- decreasing `dt` reduces `|y_numerical − y_closed|` for Euler and
  RK2;
- RK2 more accurate than Euler at the same `dt`;
- forbid `y = y0 − D0 t` as the general oracle.

If `W_eff dt` is comparable to `H`, Euler can jump out through the
lower lid into rest. That is a timestep error, **not** atmospheric
ground crossing and **not** a physical overshoot through terrain.
Acceptance tests must choose `D0 dt ≪ H`.

### 19.5 Forbidden oracles

- S1/S2 composite pathlines;
- `y(t) = y0 − D0 t` off `y_mid`;
- `y = 0` as a lid unless the test constructed `baseHeight = 0`;
- `AtmosphericTracerDomain` deactivation;
- continuity residual as a trajectory check;
- “the tracer bounced / skated on the grid.”

---

## 20. Testing policy

Prefer contract tests over implementation trivia.

### Unit tests (required)

- axis at `y_mid`: `V = (0, −D0, 0)`;
- off-axis at `y_mid`: `Vy = −D0 E_r`, `Vx = Vz = 0`;
- axis at `baseHeight` and `topHeight`: `V = (0, 0, 0)`;
- below and above the layer: `V = (0, 0, 0)`;
- one interior off-axis, off-midpoint formula match;
- envelope symmetry of `|Vy|` about `y_mid`;
- radial axisymmetry at fixed `y`;
- height dependence: same `(x, z)`, different interior `y` ⇒
  different `Vy` except symmetric pairs;
- `Vy ≤ 0` everywhere (allow `0`; watch signed zero);
- `Vx` / `Vz` identically `0`;
- steadiness;
- no input mutation; new `Vec3` per sample;
- interior derivative sign: lower half `∂Vy/∂y < 0`, `y_mid` `= 0`,
  upper half `> 0` (analytic and/or centered FD inside the open
  layer);
- negative `baseHeight` is constructible and sampleable;
- a sample at `y = 0` is ordinary math (whatever `F(0)` the bounds
  imply), not a special ground branch;
- validation failures: non-finite, `sigma ≤ 0`,
  `peakDownwardVelocity ≤ 0`, `topHeight ≤ baseHeight`.

Do not require a unique `∂Vy/∂y` at the lids.
Do not require ScenarioConfig.
Do not require the atmospheric floor.

### Tracer acceptance (required)

- inactive rest below, at, and above the lids;
- on-axis interior closed form §19.3, Euler and RK2, tolerance,
  `dt` convergence, RK2 better than Euler;
- one off-axis interior closed form with `W_eff = D0 E_r`;
- `x` and `z` unchanged;
- `y(t) > baseHeight` for interior runs;
- monotonic decrease of `y` in the open layer;
- explicit rejection of `y = y0 − D0 t` as equality for an interior
  start with `y0 ≠ y_mid` (or a duration long enough that `F`
  changes).

Do not require live DEMO, renderer, hodograph, or domain-exit
tests.

---

## 21. Module and type placement

First implementation (when commanded, not this slice):

    src/physics/storm/VerticalEnvelopeDowndraftField.ts
    src/physics/storm/VerticalEnvelopeDowndraftField.test.ts
    src/simulation/verticalEnvelopeDowndraftFieldTracer.acceptance.test.ts

Suggested construction:

    new VerticalEnvelopeDowndraftField({
      centerX,
      centerZ,
      peakDownwardVelocity,
      sigma,
      baseHeight,
      topHeight,
    })

Do not subclass `VerticalEnvelopeUpdraftField`.
Do not wrap it with a minus sign helper as the production type.
Do not add a height-independent `DowndraftField`.

---

## 22. ScenarioConfig, DEMO, and live wiring

This physics document does **not** choose:

- DEMO `baseHeight` / `topHeight` / `H`;
- DEMO `D0`;
- DEMO `sigma`;
- DEMO `centerX` / `centerZ` (concentric vs offset).

Those fixture numbers are now chosen in
`docs/rendering/15-composite-downdraft-demo.md`. Shared or
distinct `σ` / centers remain a DEMO fixture, not a physics
invariant (`06`, `01`, `10`). This physics document still does
not own them.

`ScenarioConfig.storm.downdraft` and live sixth-operand wiring are
owned by `docs/rendering/15-composite-downdraft-demo.md` and
`docs/architecture/01-scenario-config.md`, not by this physics
document.

Future near-ground divergent outflow / cold pool / gust front
remain separate mechanisms. They are not v1 parameters of this
field and not a reason to add `Vx`/`Vz` now.

Story seeds are not retuned here. S1/S2 remain the current
kinematic exhibit of the five-operand sum (`08`, `10`).

---

## 23. Explicit non-goals

v1 does **not** include:

- `AtmosphericTracerDomain` implementation;
- live downdraft wiring / ScenarioConfig slot;
- cold pool;
- gust front;
- surface / near-ground divergent outflow;
- continuity solver or coupling to `W0` / `A_in` / `A_out`;
- pressure / buoyancy / precipitation;
- tilting / stretching;
- RFD / FFD naming;
- story-seed retune;
- height-independent `DowndraftField`;
- signed mode of `VerticalEnvelopeUpdraftField`;
- terrain / `groundHeight(x, z)`;
- envelope enum;
- renderer / hodograph / runtime-control changes;
- production `divergence()` or `curl()` API.

Those may be related later. They are not specified here.

---

## 24. First implementation slice

When commanded, in order:

1. this document (already the source of truth);
2. `VerticalEnvelopeDowndraftField` implementation;
3. unit tests;
4. isolated tracer acceptance;
5. `npm test`;
6. `npm run typecheck`;
7. **STOP**.

Isolated implementation of this slice is done. Domain wiring (`11`)
and sixth-operand DEMO wiring (`15`) are later completed slices,
not part of this isolated primitive.

---

## 25. Lock-in summary

```text
canonical type:          VerticalEnvelopeDowndraftField
horizontal geometry:     E_r = exp(−r² / (2 σ²));  Vx = Vz = 0
vertical formula:        F(y) = sin(π (y − y_b)/H) on [y_b, y_t], else 0
                         Vy = −D0 * E_r(r) * F(y)
strength semantics:      peakDownwardVelocity = D0 > 0
                         actual Vy ≤ 0; min Vy = −D0 at axis y_mid
center semantics:        independent centerX, centerZ (this axis)
                         DEMO occupancy: rendering/15
                         not RFD / not storm.center
sigma semantics:         this field’s Gaussian scale; not storm.sigma
boundary semantics:      compact support; sample everywhere;
                         V = 0 outside the layer;
                         ground-unaware; y = 0 not an implicit lid;
                         AtmosphericTracerDomain is not this type
divergence:              ∇ · V = ∂Vy/∂y
                         = −D0 E_r (π/H) cos(π ξ)  (open layer)
                         div_h = 0
                         source in upper half, sink in lower half
curl notes:              ω_y = 0;
                         ω_h from radial shear of Vy, sign-reversed 15;
                         not environmental shear vorticity
isolated tracer:         x, z frozen; rest outside layer;
                         interior closed form §19.3 (time-reversed 15);
                         monotonic descent; no floor oracle
ground policy:           11 verdict B; this primitive is G17 sampling;
                         Vy(0)=0 only if 0 is a lid/exterior
DEMO occupancy:          rendering/15 (wired)
first implementation:    isolated type live; domain live on DEMO
                         Simulation; sixth operand wired per 15
continuity:              independent operand; 10 anti-claims;
                         not return of S1/S2; not a solver
```

---

## 26. Core lesson

`VerticalEnvelopeDowndraftField` v1 is a controlled separable
downdraft with a half-sine vertical life cycle:

    E_r(r) = exp( −r² / (2 σ²) )
    F(y)   = sin(π (y − baseHeight) / (topHeight − baseHeight))
             on the closed interval, and 0 outside
    V      = (0, −D0 E_r F, 0)

`peakDownwardVelocity` is a positive peak of downward speed. The
minus sign belongs to the formula, not to the caller.

The axis is this field’s axis. DEMO occupancy is
`docs/rendering/15-composite-downdraft-demo.md` (offset east).
Neither placement is RFD.

`∂Vy/∂y` is available. That does not make the laboratory
incompressible and does not return S1/S2 air.

The field does not know about the ground. Isolated tests must not
pretend it does. Live tracers that would cross `y = 0` are handled
by `AtmosphericTracerDomain` (`11`).

---

## 27. STOP

This STOP closed the isolated-type **documentation** slice.
Later commanded slices implemented the isolated type, the tracer
domain, occupancy `15`, and live sixth-operand wiring.

No cold pool, gust front, surface outflow, or solver.
No RFD/FFD.
No seed retune.
