# Near-Ground Radial Outflow Field

**Status:** isolated type implemented. Production field lives at
`src/physics/storm/NearGroundRadialOutflowField.ts`. Isolated
tracer acceptance:
`src/simulation/nearGroundRadialOutflowFieldTracer.acceptance.test.ts`.
DEMO occupancy / scaling:
`docs/rendering/16-composite-near-ground-outflow-demo.md`.
Seventh-operand DEMO wiring is live. Pedagogy seeds and a live
mode switch remain deferred. This document owns the formula, not
DEMO occupancy numbers.

Predecessor authorization:
`docs/architecture/13-post-downdraft-checkpoint.md` verdict A.

Radial formula family:
`docs/physics/16-upper-radial-outflow-field.md`.

Vertical envelope family:
`docs/physics/17-lower-radial-inflow-field.md`.

Ground / tracer floor:
`docs/architecture/11-ground-atmospheric-domain-policy.md`.

Downdraft primitive (must not receive `Vx`/`Vz`):
`docs/physics/20-vertical-downdraft-envelope.md`.

Continuity anti-claims:
`docs/architecture/10-composite-continuity-mass-budget-audit.md`.

---

## 1. Purpose

This document defines the first prescribed near-ground horizontal
divergence / outflow mechanism in Supercell Explorer:
`NearGroundRadialOutflowField` v1.

It answers:

    Given a vertical axis, a Gaussian radial scale, and a lower
    plateau with an upward taper, what world-space horizontal radial
    velocity does a passive tracer sample when the flow is directed
    outward and is at full strength at and below a chosen taper
    start, then vanishes at and above a chosen top?

v1 is separable:

    V_horizontal(r, y) = radial_outflow(r) * G(y)
    Vy ≡ 0

The radial factor is the project’s existing Gaussian-linear family,
outward. The vertical factor is the lower-plateau plus
quarter-cosine taper of `17`, not the half-sine window of `16`.

It is **not**:

- a cold pool;
- a gust front;
- a density current;
- a surface response to D1;
- a continuation of D1;
- RFD or FFD;
- a continuity closure;
- a terrain or collision boundary condition;
- a dual-mode of `UpperRadialOutflowField`;
- a signed mode of `LowerRadialInflowField`;
- `Vx`/`Vz` bolted onto `VerticalEnvelopeDowndraftField`.

The `storm/` module path means: controlled storm mechanism. It does
**not** mean full or realistic supercell physics.

---

## 2. Relationship to existing foundations

`docs/physics/00-coordinate-system.md`:

    +X = East
    +Y = Up
    +Z = South

    y = 0   reference ground datum
    y < 0   mathematically allowed

The world origin is **not** this field’s axis.

`docs/physics/02-velocity-field-basics.md`: isolated tests before
composition; explicit formulas; documented sharp transitions;
sampling defined unless a domain is specified. Compact zero above
`topHeight` is intentional. The plateau below `baseHeight` is
intentional. Neither is a silent fallback.

`docs/physics/01-parcel-basics.md` §27–29, §32: spreading tracers
are not mass density; correct integration is not mass conservation.
Those warnings apply here and are strengthened by `10` and `13`.

`docs/physics/03-numerical-integration-basics.md`: the unbounded
linear map `r(t) = r0 exp(+A t)` is **not** the oracle for this
Gaussian-modulated field.

`docs/physics/12-composite-velocity-field.md` already authorizes
generic world-space addition. Live composition of this field is
**out of scope**. Isolated implementation, when commanded, must not
wire DEMO.

`docs/physics/14-radial-inflow-field.md` is the height-independent
inward primitive. Do **not** create a height-independent
`RadialOutflowField` as a stepping stone (`16` §19). Do **not**
accept negative `radialStrainRate` on `14`/`17` as this field.

`docs/physics/16-upper-radial-outflow-field.md` is the outward
compact-aloft sibling. Same radial family, opposite vertical job.
This document does **not** evolve that type. See §3 and §20.

`docs/physics/17-lower-radial-inflow-field.md` is the inward
lower-plateau sibling. Same vertical envelope family, opposite
horizontal sign. This document does **not** evolve that type.
See §3 and §21.

`docs/physics/20-vertical-downdraft-envelope.md` §7.2: near-ground
divergent `V_h` is a later mechanism, not a horizontal component of
the downdraft type. This document is that mechanism. It does not
read downdraft parameters and does not inherit D1’s landing
(`13` §8–§9).

`docs/architecture/11-ground-atmospheric-domain-policy.md`:
mathematical fields remain sampleable on all finite coordinates.
Atmospheric tracers occupy `y ≥ 0`. `Vy ≡ 0` on this field, so
isolated tracers never cross the floor. Domain policy is not this
type’s job.

`docs/architecture/13-post-downdraft-checkpoint.md`: kinematic
prescribed near-ground outflow is authorized; the name cold pool
is not.

Architectural role:

    NearGroundRadialOutflowField implements VelocityField
        ↓
    sample(position, time) → world Vec3

Isolated implementation slice: **done.**

    isolated NearGroundRadialOutflowField
      + sampling tests
      + isolated tracer acceptance
      + STOP

DEMO occupancy is not part of this slice.

---

## 3. Architectural decision

Four ways exist to introduce near-ground outward `V_h`.

### 3.1 Option A — lower the bounds of `UpperRadialOutflowField`

Keep one type. Set DEMO `baseHeight`/`topHeight` near the ground.

Rejected.

`16`’s envelope is a mid-peaking half-sine with `G = 0` at both
lids. Occupancy `[0, H]` yields `G(0) = 0` and `G = 1` at `H/2`.
Tracers on the atmospheric floor would not move. That is the
opposite of near-ground semantics (`17` §9 already made this
argument for inflow).

Occupancy with `baseHeight < 0 < topHeight` makes `G(0)` some
interior value and still peaks at `y_mid`, typically above the
datum. That is a shallow aloft bump, not a lower-level plateau.
It also zeros the field below `baseHeight`, which is a compact
underground lid, not ground policy.

The type name contains `Upper`. Changing its envelope family would
break the live upper-outflow occupant and every `16` contract.

### 3.2 Option B — dual-mode envelope on `UpperRadialOutflowField`

Add a plateau/`G` enum to the existing outward type.

Rejected. Same reasons `17` §3.1 rejected evolving
`RadialInflowField`: live tests of the half-sine become false or
grow a hidden mode; validation ownership splits; a strategy enum
is a speculative framework. `20` rejected signed dual-mode on the
updraft for the same class of reason.

### 3.3 Option C — signed `LowerRadialInflowField`

Accept `radialStrainRate < 0` as outward flow.

Rejected. `A > 0` means inward on that type (`17` §14). Negative
`A` was locked invalid so that outflow would be a different
phenomenon (`16` §19). Pairing the two as one type would also
invite the false mass story “lower inflow plus lower outflow.”

### 3.4 Option D — new sibling type; reuse formula families only

`UpperRadialOutflowField` stays the compact-aloft outward
primitive. `LowerRadialInflowField` stays the lower-plateau inward
primitive. A new type owns near-ground outward flow.

Canonical.

Reuse, not inheritance:

```text
radial family     = 16  (outward Gaussian-linear; no division by r)
vertical family   = 17  (plateau + quarter-cosine taper)
type              = new
```

Do **not**:

- subclass `16` or `17`;
- wrap `16.sample` with a different `G`;
- multiply `17.sample` by `−1` as the production type;
- introduce a generic `RadialFlowField` or envelope strategy;
- introduce height-independent `RadialOutflowField`.

v1 does **not** leave this architecture as an implementation option.

---

## 4. Physical problem

### 4.1 What the current stack does at low levels

Live six-operand laboratory (`13`):

- lower inflow has `G_in = 1` on `y ≤ 1500 m`, including `y = 0`;
- upper outflow is off below `5000 m`;
- downdraft has `Vx ≡ Vz ≡ 0`;
- D1 terminates at `y = 0` and is deactivated.

Nothing in those operands is a **prescribed near-ground divergent
horizontal outflow**. Horizontal velocity at the datum today is
inflow plateau + surface environmental wind (storm-relative in
the live frame), not spreading from a near-ground axis.

### 4.2 Required new capability

    How does one prescribe a controlled horizontal velocity directed
    away from a vertical axis, at full strength at low levels,
    vanishing above a chosen top?

Required properties:

- purely horizontal (`Vy = 0`);
- radially outward for `r > 0` where `G > 0`;
- strongest on a lower plateau, not at a mid-layer peak;
- independently parameterized from downdraft, D1, inflow, and
  upper outflow;
- defined as a composable `VelocityField` on all finite world
  positions.

### 4.3 What this field is not claiming

This is a **prescribed** laboratory field. It is not:

- the kinematic continuation of D1;
- conversion of downward `Vy` into `V_h` at the floor;
- cooling, density, or buoyancy;
- a propagating material front;
- the mass-conserving counterpart of the sixth-operand sink.

---

## 5. What NearGroundRadialOutflowField is

A world-space `VelocityField` whose only nonzero components are
horizontal, directed away from a fixed vertical axis, and scaled
by a lower plateau plus an upward taper.

    V(x, y, z, t) = (Vx(r, y), 0, Vz(r, y))

    r² = (x − centerX)² + (z − centerZ)²

Properties of v1:

- Gaussian-modulated linear radial profile, outward;
- `G = 1` for all `y ≤ baseHeight`;
- quarter-cosine taper on `(baseHeight, topHeight)`;
- `G = 0` for all `y ≥ topHeight`;
- steady (`time` ignored);
- axisymmetric about **this** field’s vertical axis;
- defined at every finite world position;
- continuous in space (`C^0` everywhere; `C^1` at `baseHeight`;
  not `C^1` at `topHeight`).

This is a controlled laboratory mechanism. It is not a cold pool.

---

## 6. Canonical type name

| Name | Verdict |
| --- | --- |
| `ColdPoolOutflowField` | **Forbidden.** Thermodynamic / density claim (`13`). |
| `SurfaceRadialOutflowField` | Rejected. “Surface” invites terrain, collision, and a field wall at `y = 0`. `11` forbade that layer. |
| `LowerRadialOutflowField` | Rejected. “Lower” is already `17`’s height-band word for **inflow**. Pairing `LowerRadialInflowField` with `LowerRadialOutflowField` reads as a mass-completing couple in one layer. |
| `NearGroundOutflowField` | Rejected. Omits radial geometry (`16` §12 rejected `UpperOutflowField` for the same reason). Meteorological “outflow” is too broad. |
| `NearGroundRadialOutflowField` | **Canonical.** Near-ground = lower-plateau occupancy. Radial = purely radial. Outflow = outward. No thermodynamic claim. |

One name. No aliases. No `ColdPool…` export.

Filename:

    docs/physics/21-near-ground-radial-outflow.md

“Near-ground” names the intended height band, not PBL realism and
not a sheet confined to `y = 0`. It has the same status as “Upper”
in `16` and “Lower” in `17`.

---

## 7. Center

    centerX    // east, m
    centerZ    // south, m

Own axis. No `centerY`. Vertical localization is `baseHeight` /
`topHeight`.

The center is **not**, by law:

- D1’s landing `(4723, 0, −1308)`;
- the downdraft axis `(5000, 0)`;
- the world origin;
- a `storm.center` (there is none).

A later DEMO **may** pass coinciding numbers. That is a fixture to
justify in an occupancy SoT, not inheritance (`13` §8–§9, `20` §6).

v1 does not introduce coupling to any other field’s center.

---

## 8. Horizontal radius

    dx = x − centerX
    dz = z − centerZ
    r² = dx² + dz²
    r  = sqrt(r²) ≥ 0

`r` is horizontal distance to **this** axis. World `Y` does not
enter `r`.

For `r > 0`, the outward unit direction in the `X`–`Z` plane is
the direction of `(dx, dz)`. Velocity is parallel to that vector
where `G > 0`.

Implementations must **not** normalize `(dx, dz)` and divide by
`r`. The offset form is mandatory (`16` §8, `14`).

---

## 9. Radial profile

### 9.1 Canonical family

The same outward Gaussian-linear family as `16` §7.1 / §8:

    v_r(r) = +A * r * exp( −r² / (2 σ²) )

    E(r) = exp( −r² / (2 σ²) )

    Vx = +A * E * dx * G(y)
    Vy = 0
    Vz = +A * E * dz * G(y)

| Property | Value |
| --- | --- |
| Axis | `v_r(0) = 0`; no `0/0` |
| Division by `r` | none |
| Peak `|v_r|` at `G = 1` | `A σ / √e` at `r = σ` |
| Far field | `v_r → 0` as `r → ∞` |
| Smoothness in `r` | `C^∞` |
| Near-axis | `v_r ≈ +A r G` |
| `div_h` at `G = 1` | `+A E (2 − r²/σ²)` |

### 9.2 Rejected radial forms

Same rejections as `16` §7.2–§7.3: unbounded linear `v_r = +A r`;
Rankine; unit-radial `A E (dx, dz)/r`; exponential `A r exp(−r/σ)`;
top-hat / compact disk / flank planform (`20` §7.1).

v1 does **not** leave the radial profile as an implementation
option. Siblinghood with `16` is a formula family, not a reason to
share a type.

---

## 10. Why the upper-outflow half-sine is the wrong envelope

`UpperRadialOutflowField` uses

    G(y) = sin(π ξ)     on [y_b, y_t]

because the job is a compact **aloft** window: off at both lids,
peak in the middle of an upper band.

Near-ground outflow has a different job. Nothing requires
`|V_horizontal| = 0` at the atmospheric datum. Flow at and near
`y = 0` is the mechanism.

A half-sine on `[0, H]` would give:

    G(ground) = 0
    G(mid-layer) = 1

Tracers on the floor would rest. That is the opposite of
near-ground semantics. It is also why option A in §3 fails.

Isolated tracers of this field have `Vy = 0`, so `y` is frozen and
`G(y0)` is a constant scale along a trajectory. Envelope smoothness
does **not** affect the isolated radial ODE. The envelope is chosen
for **Eulerian near-ground meaning**, not for an isolated
closed-form `y(t)`.

---

## 11. Vertical envelope comparison

Let:

    y_b = baseHeight
    y_t = topHeight
    H   = y_t − y_b > 0
    ξ   = (y − y_b) / H

### 11.1 Candidate A — lower plateau + quarter-cosine taper

    G(y) = 1                              if y ≤ y_b
    G(y) = cos(π ξ / 2)                   if y_b < y < y_t
    G(y) = 0                              if y ≥ y_t

Identical family to `17` §10.2 / §11.

| Property | Value |
| --- | --- |
| `G(y ≤ y_b)` | `1` |
| `G(y_t)` and above | `0` |
| Maximum | plateau on the half-space `y ≤ y_b` |
| Monotonic | constant on the plateau; strictly decreasing on the taper |
| Compact exact zeros | only above `y_t`; **not** below `y_b` |
| Continuity of `G` | `C^0` everywhere; `C^1` at `y_b`; not `C^1` at `y_t` |
| Interior taper `G'` | `−(π / (2H)) sin(π ξ / 2) ≤ 0` |
| `G'` at `y_b` | `0` from both sides |
| `G'` at `y_t` | interior `−π / (2H)`, exterior `0` |
| New parameters | 2 |
| Hidden normalization | none; `max G = 1` |

Full strength at and below the taper start. Weakens only through
the taper. Exact zero at and above `topHeight`. Velocity is
continuous, including through `baseHeight`.

This is **not** the one-sided unbounded window `16` §9.4 rejected
for upper outflow. That rejection was a plateau **aloft**. Here the
plateau is **downward**. The leak this field must prevent is aloft,
and that direction remains compact.

### 11.2 Candidate B — compact half-sine

    G(y) = sin(π ξ)     on [y_b, y_t], else 0

Zero at both lids. Peak at `y_mid`. Wrong lower-level shape
(§10). Rejected.

Setting `y_b < 0` so that `G(0) > 0` does not repair it: the
maximum is still mid-layer, and the field is compact-zero below
`y_b`. That occupancy of `16`’s envelope is option A, already
rejected.

### 11.3 Candidate C — compact-zero-below quarter-cosine

    G = 0     for y < y_b
    G = 1     at y = y_b
    taper     upward to y_t

`17` withdrew this family: continuity of `G`, `G = 0` strictly
below `y_b`, and `G(y_b) = 1` are incompatible. The result is a
jump in `V_h` at `y_b`.

If `y_b = 0`, the jump sits on the named ground plane. That would
use the envelope as a fake ground lid. `11` forbids designing an
envelope as collision physics. Isolated tracers never cross it
(`Vy = 0`), but Eulerian sampling below the datum is legal and
would see the jump. Composite probes and `∇ · V` maps would too.

Rejected.

### 11.4 Candidate D — other compact one-sided families

| Candidate | Why rejected |
| --- | --- |
| Gaussian in `y` | Never compact. Leaks aloft into the upper-outflow window. Same rejection as `16` §9.2 / `17` §10.4. |
| Plateau + cubic Hermite / `cos²` Hann taper | `C^1` at `y_t`; extra factor. Isolated tracers do not use `G'`. Not canonical for v1. Reopen only if lid shear of `V_h` becomes the teaching artifact (`17` §10.3). |
| Linear taper `1 − ξ` with plateau | `G'(y_b+) ≠ 0`; loses `C^1` at the taper start. |
| Sheet `G = 1` only at `y = 0` | A plane, not a layer. Invents a ground special case. Unstable under Euler. |
| Peak pinned to downdraft `baseHeight` / D1 | Forbidden coupling. |

### 11.5 Canonical choice

**Candidate A, the lower plateau plus quarter-cosine taper, is
canonical.**

Reasons that are **not** “`17` already uses it”:

1. Near-ground semantics: full strength at and below the taper
   start, not a mid-layer peak and not zero at the datum.
2. Monotonic decay through the taper.
3. Exact zero at and above `topHeight` — the direction that must
   not leak into upper outflow.
4. Continuous velocity, including through `baseHeight`.
5. `C^1` at the taper start.
6. `max G = 1` with no hidden scale, so `outflowStrainRate` keeps
   its near-axis meaning on the entire plateau.
7. Only two vertical parameters. No `y_mid` peak to own.
8. Elementary `G` and `G'`.
9. Isolated radial ODE is the `16` sibling with constant
   `A_eff = A G(y0)`.

The documented cost is the same as `17`: `G` is not compact
downward. The field equals the height-independent outward
Gaussian-linear profile for every `y ≤ y_b`, including
mathematically negative heights. That is a synthetic boundary
policy, not a realistic atmosphere (§13).

v1 does **not** leave the envelope as an implementation option.

---

## 12. Canonical vertical envelope

### 12.1 Formula

    y_b = baseHeight
    y_t = topHeight
    H   = y_t − y_b
    ξ(y) = (y − y_b) / H

    G(y) = 1                         if y ≤ y_b
    G(y) = cos(π ξ(y) / 2)           if y_b < y < y_t
    G(y) = 0                         if y ≥ y_t

Endpoint values of the cosine agree with the adjacent pieces:

    cos(0) = 1 = G(y_b)
    cos(π / 2) = 0 = G(y_t)

Implementations must **not** introduce a thickness, epsilon, or
smoothstep. Do not clamp, saturate, or renormalize.

A correct branch, if used:

    y ≥ topHeight     →  G = 0
    y ≤ baseHeight    →  G = 1
    otherwise         →  cosine taper

Do **not** treat `y < baseHeight` as a zero branch. That is
candidate C.

Prefer the piecewise `G = 0` for `y ≥ topHeight` over relying on
`cos(π/2)` being a bitwise zero.

### 12.2 Derived envelope facts (not additional API)

- `0 ≤ G(y) ≤ 1` for all finite `y`;
- `G(y) = 1` for every `y ≤ y_b` (the maximum is a plateau, not a
  unique point);
- `G(y_t) = 0`;
- `G(y) > 0` for `y < y_t`;
- `G(y) = 0` for `y ≥ y_t`;
- on `(-∞, y_b]`, `G` is constant;
- on `[y_b, y_t]`, `G` is monotonically non-increasing;
- on `(y_b, y_t]`, `G` is strictly decreasing;
- at mid-taper, `G((y_b + y_t)/2) = √2 / 2`, **not** `1`.

`y_mid` is not a distinguished API point. Tests copied from `16`’s
`G = 1` at `y_mid` contract would be wrong.

### 12.3 Answers locked here (occupancy numbers are not)

**Must `G(0)` be the maximum?** Not as a special case in the
formula. `y = 0` is not a parameter of `G`. The maximum is the
plateau `y ≤ baseHeight`. Therefore `G(0) = 1` whenever
`baseHeight ≥ 0`. That is the intended atmospheric occupancy. It
is a bound choice, not a ground clause in the type.

**Is a plateau at `y < 0` allowed?** Yes. Same synthetic policy as
`17` §12.3. It is not underground atmosphere. It avoids a velocity
jump at the taper start.

**Must the field be nonzero exactly at ground?** The field is a
**layer**, not a sheet. It is nonzero at `y = 0` whenever
`topHeight > 0`. If `baseHeight ≥ 0` and `topHeight > 0`, then
`G(0) = 1`. The type does not require `topHeight > 0`; a DEMO that
put the entire support below the datum would be legal mathematics
and useless for atmospheric tracers.

**Where does the taper start?** At `baseHeight`. Full strength at
and below. Numbers deferred.

**Where does outflow become zero?** At and above `topHeight`.
Numbers deferred.

The envelope is **not** collision physics. `Vy` stays `0`. Domain
exit stays `11`.

---

## 13. Ground semantics

Five concerns stay five concerns (`11`). This type owns none of
them except as a sampleable field.

```text
coordinate datum:           y = 0 unchanged
field sampling:             all finite y  (G17)
tracer domain:              still y ≥ 0 for atmospheric Simulation
crossing policy:            unchanged; this field has Vy ≡ 0
rendering plane:            still a ruler, not this field’s lid
```

### 13.1 Sampling below `y = 0`

Legal. If `y ≤ baseHeight`, `G = 1` and the sample is the full
outward Gaussian-linear profile. That is not a claim that the
atmosphere exists underground.

### 13.2 Horizontal field at `y = 0`

Legal. Intended. If `baseHeight ≥ 0` and `topHeight > 0`,
`G(0) = 1`. An **active** tracer at `y = 0` moves horizontally and
stays at `y = 0`.

That motion is field kinematics. It is **not** the clamp-and-skate
ground policy `11` rejected. `11` rejected *creating* a wall that
pins `y` while `V_h` still acts. Here `y` is already constant
because `Vy ≡ 0`. No clamp is applied.

### 13.3 `AtmosphericTracerDomain` and `Vy = 0`

Crossing requires `y_n ≥ 0` and proposed `y_{n+1} < 0`. With
`Vy = 0`, a tracer at `y = 0` proposes `y = 0`. Not a crossing.
The particle remains `active`.

The domain must **not** deactivate a tracer merely because it sits
on the datum. It must **not** reactivate an inactive tracer because
this field is nonzero at that position.

### 13.4 D1 terminal glyph is not a tracer of this field

D1 after impact: `active = false`, frozen at the interpolated
`(x, 0, z)`. `Simulation.step` skips it. This field does not own
`active`. Sampling the composite at D1’s landing is Eulerian
inspection, not advection of that glyph.

Do **not**:

- reactivate D1 because near-ground `V_h` exists;
- convert the terminal glyph into a new seed;
- treat landing position as this field’s center;
- enable this operand on domain-exit events.

A future pedagogy seed, if any, is a **new** active particle.
That decision is deferred.

---

## 14. Strength semantics

    outflowStrainRate = A > 0     // 1/s

Same identifier and same geometric sense as
`UpperRadialOutflowField`: `A > 0` means **outward**. Reusing
`radialStrainRate` is rejected here for the same reason `16` §13
rejected it: on `14`/`17` that name means inward.

`A` is the near-axis radial strain coefficient at envelope
maximum (the entire plateau):

    lim_{r→0} v_r / r = A * G(y)
    lim_{r→0, y ≤ y_b} v_r / r = A

Horizontal speed:

    |V_h| = A * r * E * G(y)

Radial maximum, for any fixed `G > 0`, is at `r = σ`:

    |V_h|(r=σ, y) = (A σ / √e) * G(y)

Global maximum of `|V_h|` is at `r = σ` for **every**
`y ≤ baseHeight`, where `G = 1`:

    |V_h|_max = A * sigma / sqrt(e)

On the axis, `|V_h| = 0` at every height.

`peakRadialVelocity` is not an API parameter. Changing `H` does
not rescale `A`. Changing `baseHeight` / `topHeight` moves and
stretches the taper; it does not change plateau strain.

`outflowStrainRate` is **not**:

- diagnostic `div_h`;
- peak outward speed;
- a numerical `dt` setting.

Do **not** tie `A` to `D0`, `W0`, `A_in`, `A_out`, or any
`∇ · V` residual (`10`, `13`, `20` §15). Negative `A` is invalid
(would be inflow). Zero `A` is not a “disabled” mode.

---

## 15. Full velocity formula

    A     = outflowStrainRate
    σ     = sigma
    y_b   = baseHeight
    y_t   = topHeight
    H     = y_t − y_b

    dx = x − centerX
    dz = z − centerZ
    r² = dx² + dz²

    E(r) = exp( −r² / (2 σ²) )

    G(y) = 1                         if y ≤ y_b
    G(y) = cos(π (y − y_b) / (2 H))  if y_b < y < y_t
    G(y) = 0                         if y ≥ y_t

    Vx = +A * E * dx * G(y)
    Vy = 0
    Vz = +A * E * dz * G(y)

IEEE-754 signed zero: canonicalize algebraically zero output
components to `+0`, following `14` / `16` / `17`.

On the plateau (`y ≤ y_b`), this is the sign-reversed
`RadialInflowField` formula with equal `A`, `σ`, and center. That
algebraic identity is a useful unit check. It is **not** a reason
to create `RadialOutflowField`.

---

## 16. Vertical domain

    baseHeight    // taper start; G = 1 at and below; world +Y, m
    topHeight     // G = 0 at and above; world +Y, m
    topHeight > baseHeight

These are this field’s bounds. They are not the inflow’s, not the
upper outflow’s, not the downdraft’s, and not `groundHeight`.

Names stay `baseHeight` / `topHeight`, not `taperStartHeight`
(`17` §16.1). `baseHeight` here means the same envelope job as on
`17` (plateau lid / taper start), **not** the half-sine lower lid
of `15`/`16`/`18`/`20`.

`baseHeight` may be negative. `y = 0` is not an implicit lid and
not an implicit taper start.

Sampling at `y ≥ topHeight` returns `(0, 0, 0)` and is not an
error. Sampling at `y ≤ baseHeight` returns the full outward
profile and is not an error.

No horizontal domain wall. Far-field decay is only the radial
Gaussian, and only where `G > 0`.

---

## 17. Coordinates, frame, and time

World `Vec3`. Conversion from atmospheric components is explicit
and unused here: the field is already world-horizontal.

    Vx  eastward  (outward component along +X when dx > 0)
    Vz  south     (outward component along +Z when dz > 0)
    Vy  0

Do not name world components `u`, `v`, `w`.

Steady: `sample(P, t1) = sample(P, t2)`. Isolated trajectories
still depend on time through changing `r`.

The field does not know `IntegrationFrame`. Storm-relative
advection remains a different operand.

---

## 18. Sign convention and cardinals

`A > 0`, `G > 0`, `r > 0`:

| Offset | Horizontal velocity |
| --- | --- |
| `+X` east of axis | `Vx > 0`, `Vz = 0` |
| `+Z` south of axis | `Vx = 0`, `Vz > 0` |
| `−X` west | `Vx < 0`, `Vz = 0` |
| `−Z` north | `Vx = 0`, `Vz < 0` |

Invariant where `G > 0` and `r > 0`:

    dx Vx + dz Vz > 0

That is outward. The opposite inequality is `17`.

---

## 19. Divergence

### 19.1 Analytic `div_h`

    Vx = +A G(y) E dx
    Vz = +A G(y) E dz
    Vy = 0

    div_h = ∂Vx/∂x + ∂Vz/∂z
          = +A * E * G(y) * (2 − r² / σ²)

Because `Vy ≡ 0`:

    ∇ · V = div_h

`G(y)` scales the entire horizontal divergence. It does not create
vertical velocity.

For `y ≥ y_t`, `G = 0` ⇒ `∇ · V = 0`.
For every `y ≤ y_b`, `G = 1` and `div_h` matches the `G = 1` case
of `16`.

On the axis on the plateau:

    div_h = +2A

`A` is **not** equal to `div_h`. Tests must not treat them as
interchangeable.

### 19.2 Sign reversal

`div_h` changes sign at `r = σ √2`:

- `div_h > 0` for `r < σ √2` (local **source**) when `G > 0`;
- `div_h < 0` for `r > σ √2` (local **sink**) when `G > 0`;
- `v_r` remains `> 0` at every finite `r` where `G > 0`.

Local `div_h < 0` in the Gaussian tail does **not** mean the flow
has become inward. Outward direction is the invariant in §18.

Net flux through a circle of radius `r` is `2π r v_r G`, and that
flux tends to `0` as `r → ∞`.

### 19.3 Height derivatives

On the plateau, `G' = 0`, so `∂Vx/∂y = ∂Vz/∂y = 0`.

On the open taper:

    G'(y) = −(π / (2H)) sin(π ξ / 2)
    ∂Vx/∂y = +A E dx G'(y)
    ∂Vz/∂y = +A E dz G'(y)

At `y_b`, `G' = 0` classically (`C^1`). At `y_t`, one-sided
limits of `G'` are unequal (`C^0` only). Documented, not smoothed.
No production `derivative()` or `divergence()` API.

Vertical shear of `V_h` is **not** mass consistency. Because
`Vy ≡ 0`, that shear cannot cancel `div_h`.

### 19.4 Continuity claims

v1 claims:

1. locally divergent in the core (`div_h > 0` for `r < σ √2`,
   `G > 0`);
2. conceptual near-ground prescribed outflow.

v1 forbids:

3. mass-consistent spreading;
4. closure of the sixth-operand `∇ · V_down` sink;
5. “this is the air that descended along D1.”

Even with coincident centers and `σ`, this term cannot cancel
`17`’s `div_h` at all `r` unless `A_in = 0` at that height, and
cannot cancel `20`’s `∂Vy/∂y` because `Vy ≡ 0` here (`15` §11.3
structure, `20` §13.3). No v1 invariant ties `A` to `D0`, `W0`,
`A_in`, or `A_out`.

Do not name `div_h` “mass spreading.”

---

## 20. Relationship to UpperRadialOutflowField

Shared radial family. Different vertical job. Different type.

| | `UpperRadialOutflowField` | `NearGroundRadialOutflowField` |
| --- | --- | --- |
| Horizontal sign | outward `+A E dx G` | outward `+A E dx G` |
| Strength name | `outflowStrainRate` | `outflowStrainRate` |
| `G(y)` | half-sine compact window | plateau + quarter-cosine |
| Maximum | unique `y_mid` | entire `y ≤ baseHeight` |
| `G` at a lower lid `= 0` | yes | no (there is no lower zero lid) |
| Intended band | aloft | near-ground |
| Leak to prevent | ground and far aloft | aloft |

Do **not** implement this field by lowering `16`’s DEMO bounds.
Do **not** add a `G` mode to `16`.
Do **not** read `16`’s `baseHeight` / `topHeight` / `A` / `σ` /
center.

The two envelopes may overlap, leave a gap, or sit in disjoint
bands. Overlap is controlled superposition, not a budget. A later
DEMO **should** keep this field’s `topHeight` well below the
upper-outflow layer if the teaching object is a near-ground
mechanism. That is occupancy, not this contract.

Existing `UpperRadialOutflowField` tests, formula, and live
occupant are unchanged by this document.

---

## 21. Relationship to LowerRadialInflowField

Shared vertical envelope family. Opposite horizontal sign.
Different type.

| | `LowerRadialInflowField` | `NearGroundRadialOutflowField` |
| --- | --- | --- |
| Horizontal sign | inward `−A E dx G` | outward `+A E dx G` |
| Strength name | `radialStrainRate` | `outflowStrainRate` |
| `G(y)` | plateau + quarter-cosine | same family, own bounds |
| `A > 0` means | inward | outward |

Do **not** treat them as a mass-completing pair. Live DEMO already
has lower inflow at `y = 0`. A later near-ground outflow occupant
would **add** to that `V_h`, not replace it, unless occupancy
turns inflow off — which this SoT does not do.

Do **not** subclass. Do **not** share a helper merely because `G`
is duplicated. Do **not** accept negative `radialStrainRate` on
`17` as this field.

---

## 22. Relationship to VerticalEnvelopeDowndraftField and D1

`20` §7.2 forbade putting surface spreading in the downdraft type.
This field is the separate operand.

This field must **not**:

- read `D0`, `σ_down`, downdraft center, or envelopes;
- scale `A` from peak downward speed or from `∇ · V_down`;
- activate when a tracer crosses `y = 0`;
- use D1 landing as center by law;
- use D1 as an isolated-tracer oracle.

D1 is a composite pathline of the **current** six-operand sum
(`12`). Isolated tests of this field keep `y` constant and never
see a downdraft.

A later occupancy SoT may place this axis near, or far from, the
downdraft. Coincidence is a fixture. Inheritance is forbidden
(`13` §8–§9).

---

## 23. Parameters

| Parameter | Symbol | Meaning | Units | Constraint |
| --- | --- | --- | --- | --- |
| `centerX` | — | world east of **this** axis | m | finite |
| `centerZ` | — | world south of **this** axis | m | finite |
| `outflowStrainRate` | `A` | near-axis coefficient in `v_r = +A r E G`; sign fixed outward | 1/s | finite and `> 0` |
| `sigma` | `σ` | Gaussian horizontal scale in `exp(−r²/(2σ²))` | m | finite and `> 0` |
| `baseHeight` | `y_b` | world `y` below which `G = 1`; taper starts above | m | finite |
| `topHeight` | `y_t` | world `y` where `G` reaches `0`; zero at and above | m | finite and `> baseHeight` |

Parameters intentionally absent from v1:

- `centerY`;
- `peakHeight` / `y_mid` as a free parameter;
- `peakRadialVelocity`;
- `radialStrainRate` as this type’s strength name;
- envelope selector / `G` enum;
- `sigmaY`;
- time dependence;
- moving or tilted axis;
- tangential rotation;
- signed strain / inflow mode;
- mass-continuity correction or coupling to `D0` / `W0` / `A_in` /
  `A_out`;
- `groundHeight`;
- ScenarioConfig wiring;
- composition helpers;
- a `divergence()` API;
- a shared envelope helper with `16` or `17`;
- D1 / landing parameters.

---

## 24. Validation policy

Validation belongs at the owning construction boundary.

Reject when:

- any parameter is non-finite;
- `sigma ≤ 0`;
- `outflowStrainRate ≤ 0`;
- `topHeight ≤ baseHeight`.

Do **not** accept `A = 0` as a disabled mode, or `A < 0` as
inflow.

Do **not** reject:

- `baseHeight < 0`;
- `baseHeight = 0`;
- `topHeight` relative to `0` in either direction;
- centers other than the origin;
- `sigma` unequal to any other field’s `sigma`.

Sampling does not re-validate. Every finite world position is
evaluable.

Error type: `NearGroundRadialOutflowFieldError`, matching the
other storm fields’ dedicated error classes.

---

## 25. Ownership and mutability

The field does not mutate caller positions. `sample` returns a new
world `Vec3`. Construction parameters are owned by the field after
validation. No defensive copying of caller vectors is required
beyond the usual `sample` output.

---

## 26. Isolated tracer acceptance

The **continuous** ODE for the isolated field is:

    dr/dt = +A * r * exp( −r² / (2 σ²) ) * G(y)
    dθ/dt = 0
    dy/dt = 0

Because `Vy = 0`, `y(t) = y0` and `G(y0)` is a constant
`G0 ∈ [0, 1]`.

    A_eff = A * G0

At fixed `y`, the dynamics reduce to the `16` isolated radial ODE
with that constant `A_eff`.

**D1 is not an oracle.** D1 is a composite pathline. Isolated
tests must not import `DEMO_SCENARIO`, `AtmosphericTracerDomain`,
or downward seeds.

### Exact elementary facts

On the axis (`r0 = 0`), at any `y0`:

    V ≡ 0  ⇒  P(t) = P0

Off-axis with `G0 = 0` (`y0 ≥ y_t`):

    V ≡ 0  ⇒  P(t) = P0

Off-axis with `G0 > 0` (every `y0 < y_t`, including the entire
plateau `y0 ≤ y_b`, including `y0 = 0` when `topHeight > 0`):

    (dx(t), dz(t)) = s(t) * (dx0, dz0)

with `s(t) > 0` **increasing**. Polar angle `θ` is invariant.
Height is invariant: `y(t) = y0`.

Explicit Euler and RK2 stay on that ray exactly (aside from
roundoff): each stage samples a velocity parallel to the current
offset. Ray preservation is a continuous and expected discrete
invariant.

Radius is strictly increasing for `r0 > 0` and `G0 > 0`. Radius
does not reach infinity in finite continuous time.

A tracer that starts at `y = 0` with `G(0) > 0` remains at
`y = 0` and increases `r`. That is the isolated near-ground
contract. It does not deactivate.

Plateau vs taper: two interior heights with the same `r0` and
`G(y1) ≠ G(y2)` must grow at rates ordered by `G`. On the
plateau, `G = 1` everywhere, so two plateau heights with the same
`r0` must match.

### Forbidden general closed form

Do **not** use

    r(t) = r0 * exp(+A t)

or even

    r(t) = r0 * exp(+A_eff t)

as the general oracle. Those maps are exact only for unbounded
linear outflow `v_r = +A_eff r` (`E ≡ 1`). They are the near-axis
approximation, not the solution.

Do **not** introduce an exponential-integral oracle.

### Required continuous bounds

For `A > 0`, `r0 > 0`, `G0 > 0`, and `t > 0`:

    r0 < r(t) < r0 * exp(A_eff t)

The right inequality holds because `E < 1` for all `r > 0`.

Secondary check, not a substitute: if `r0 ≪ sigma`, then
`r(t) ≈ r0 exp(A_eff t)` while the particle remains in that core.

### Numerical trajectories are not the oracle

Euler and RK2 do **not** follow continuous `r(t)` exactly.

Required tracer policy:

- compare geometry to exact invariants (axis rest, rest when
  `G0 = 0`, ray, constant `y`, including `y = 0`);
- compare radius to the continuous bounds, not to
  `r0 exp(+A t)` as equality;
- use a high-resolution RK2 trajectory as a numerical reference
  at a chosen plateau `y0` and a chosen taper `y0`;
- decreasing `dt` reduces error versus that reference;
- RK2 more accurate than Euler at the same `dt`;
- radius error and ray error are different diagnostics.

Outflow Euler steps increase radius; they do not cross the axis.
`A dt ≪ 1` remains good practice for accuracy.

The integrator must not mutate the input position or the sampled
velocity.

Cardinals: an east offset must increase `x` and hold `z`; a south
offset must increase `z` and hold `x`; and so on (§18).

---

## 27. Testing policy

Test the physical and architectural contract, not implementation
trivia.

Prefer:

- formula match of `Vx`, `Vy`, `Vz` at axis, cardinals, peak
  `r = σ`, plateau, mid-taper, and `y ≥ topHeight`;
- `Vy ≡ 0`;
- no division by `r` in source;
- `G = 1` identity on the plateau versus the `G = 1` algebra of
  `16`;
- `G = 0` at and above `topHeight`;
- `C^1` join at `baseHeight` (no `V_h` jump);
- analytic `div_h` at interior points;
- sign of `div_h` inside / outside `σ √2` while `v_r > 0`;
- isolated tracer invariants in §26;
- rejection of `A ≤ 0`, `σ ≤ 0`, `topHeight ≤ baseHeight`,
  non-finite parameters;
- acceptance of `baseHeight < 0`.

Do **not** require:

- D1 landing;
- `AtmosphericTracerDomain`;
- ScenarioConfig;
- DEMO numbers;
- `div_h > 0` at every sample as a correctness rule;
- equality to `r0 exp(+A t)`.

Do not duplicate `16`/`17` validation tests beyond the identities
this type actually shares.

---

## 28. Module and type placement

Implemented:

    src/physics/storm/NearGroundRadialOutflowField.ts

alongside `UpperRadialOutflowField` and `LowerRadialInflowField`.
Not under `synthetic/`. Not a renderer type. Not a scenario DTO.

No barrel export beyond existing project practice. No helper
extracted from `16`/`17` in the first slice.

---

## 29. ScenarioConfig, DEMO, and live wiring

Occupancy / scaling and seventh-operand wiring: chosen in
`docs/rendering/16-composite-near-ground-outflow-demo.md`.
This physics document does **not** own those numbers.

Pedagogy seeds and live mode (`docs/architecture/14-near-ground-outflow-pedagogy.md`):

- seed array and `TracerPedagogy.NearGroundOutflowPathline` implemented
  (config + mode + live switch);
- live App is NearGroundOutflowPathline (`14`).

Isolated tests must not require `ScenarioConfig`.

DTO slot and seventh-operand composition are `01` / `16`.
This physics document still does not own DEMO numbers.

---

## 30. Hodograph boundary

This field has horizontal storm-relative laboratory wind that is
**not** environmental. The hodograph continues to consume only the
environmental profile and `stormMotion`. It must not plot this
operand (`01`, `13` §4.1 pattern).

---

## 31. Pedagogical anti-claims

Allowed wording, and no broader:

```text
prescribed near-ground divergent horizontal outflow
```

Natural variant: prescribed storm-relative (or laboratory)
near-ground radial outflow. Frame adjectives belong to composition,
not to this isolated type.

Forbidden in UI copy, panel titles, comments, and docs that ship
with this type:

- cold pool spreading;
- gust front;
- density current;
- precipitation-cooled air;
- same air after the downdraft / continuation of D1;
- surface deposition response;
- conversion of downward momentum into outflow;
- mass conservation / mass spreading;
- RFD / FFD;
- compensating the chimney or the sixth-operand sink;
- terrain / no-flux / wall at `y = 0`.

---

## 32. Explicit non-goals

v1 does **not** include:

- DEMO placement or seventh-operand wiring;
- D1 coupling or landing inheritance;
- a new pedagogy mode;
- cold pool / gust front / thermodynamics / buoyancy;
- continuity solver;
- UI;
- `Vx`/`Vz` on `VerticalEnvelopeDowndraftField`;
- evolving `UpperRadialOutflowField` or `LowerRadialInflowField`;
- height-independent `RadialOutflowField`;
- terrain / `groundHeight(x, z)`;
- envelope enum;
- renderer / hodograph / runtime-control changes;
- production `divergence()` or `curl()` API;
- translating storm;
- tilting / stretching.

Those may be related later. They are not specified here.

---

## 33. First implementation slice

Isolated implementation of this slice is done:

1. this document (source of truth);
2. `src/physics/storm/NearGroundRadialOutflowField.ts`;
3. `src/physics/storm/NearGroundRadialOutflowField.test.ts`;
4. `src/simulation/nearGroundRadialOutflowFieldTracer.acceptance.test.ts`;
5. `npm test`;
6. `npm run typecheck`;
7. **STOP**.

A later implementation must not start DEMO rewiring, D1 coupling,
a pedagogy mode, a solver, or thermodynamics because the unit
tests passed.

---

## 34. Compact lock-in

```text
canonical type:          NearGroundRadialOutflowField
                         not ColdPool…; not Surface…;
                         not LowerRadialOutflowField;
                         not a mode of 16 or 17

radial formula:          v_r = +A r exp(−r² / (2 σ²))
                         Vx = +A E dx G(y)
                         Vy = 0
                         Vz = +A E dz G(y)
                         no division by r
                         family reused from 16; type is new

vertical envelope:       G = 1                         y ≤ y_b
                         G = cos(π (y − y_b) / (2 H))  y_b < y < y_t
                         G = 0                         y ≥ y_t
                         plateau + quarter-cosine (17 family)
                         not 16 half-sine
                         not compact-zero-below

center semantics:        own (centerX, centerZ)
                         not D1 landing by law
                         not downdraft axis by law
                         not origin by law
                         DEMO coincidence later = fixture only

sigma semantics:         this field’s Gaussian scale
                         peak |v_r| at r = σ
                         not storm.sigma; not inherited

strength semantics:      outflowStrainRate = A > 0  (1/s)
                         |V_h|_max = A σ / √e
                         at r = σ and every y ≤ baseHeight
                         not tied to D0, W0, A_in, A_out, ∇·V

boundary semantics:      sample all finite y
                         G = 1 on plateau including y < 0
                         G = 0 for y ≥ topHeight
                         y = 0 is not a lid of the type
                         C¹ at baseHeight; C⁰ not C¹ at topHeight
                         envelope is not collision physics

divergence:              ∇ · V = div_h
                         = +A E G(y) (2 − r²/σ²)
                         axis on plateau: +2A
                         source for r < σ√2; tail sink beyond
                         v_r stays outward
                         Vy contributes 0
                         not mass spreading

isolated tracer:         y frozen; ray preserved; r increases
                         axis rest; G=0 rest
                         r0 < r(t) < r0 exp(A G0 t)
                         not r = r0 exp(+A t)
                         not D1 oracle
                         y = 0 with G(0)>0 stays active and spreads
                         no mutation of caller state

ground relationship:     field sampleable below 0
                         tracer domain still y ≥ 0
                         V_h at y = 0 allowed
                         domain does not fire (Vy = 0)
                         inactive D1 glyph is not this tracer
                         no reactivate-on-sample

cold-pool anti-claim:    this is prescribed near-ground
                         divergent horizontal outflow
                         not a cold pool, gust front,
                         density current, or D1 continuation

implementation slice:    isolated type implemented
                         (`src/physics/storm/NearGroundRadialOutflowField.ts`);
                         unit + isolated tracer tests;
                         DEMO wiring live (`16`); pedagogy config +
                         mode + live switch implemented (`14`); live
                         App is NearGroundOutflowPathline

DEMO occupancy:          chosen in rendering/16
                         seventh operand live; NG1 array +
                         NearGroundOutflowPathline live (`14`)
```

---

## 35. Core lesson

`NearGroundRadialOutflowField` v1 is a controlled
Gaussian-modulated linear outflow at full strength on a lower
plateau, then tapered to zero at a chosen top:

    E(r) = exp( −r² / (2 σ²) )
    G(y) = 1
           for y ≤ baseHeight
    G(y) = cos(π (y − baseHeight) / (2 (topHeight − baseHeight)))
           for baseHeight < y < topHeight
    G(y) = 0
           for y ≥ topHeight
    Vx   = +A E dx G
    Vy   = 0
    Vz   = +A E dz G

`A = outflowStrainRate > 0` is the near-axis radial strain on the
plateau. It is not diagnostic divergence; on the axis for
`y ≤ baseHeight`, `div_h = +2A`.

Isolated tracers stay at constant `y`, remain on their horizontal
ray, and increase `r` when `G(y0) > 0`. They do not follow
`r = r0 e^{A t}`. They forever sample one frozen `G(y0)`.

The field exists so the project can spread tracers outward
**strongly at low levels and not at all above a chosen top**, with
a transparent formula, no division by `r`, no velocity jump at the
taper start, and no claim of cold-pool, gust-front, or
mass-consistent physics.

`UpperRadialOutflowField` remains the compact-aloft outward
primitive. Its bounds must not be lowered to fake this mechanism.
`LowerRadialInflowField` remains the lower-plateau inward
primitive. D1 remains a downward pathline, not a source.

DEMO wiring starts only when commanded.

---

## 36. STOP

Isolated type is implemented.
No DEMO placement.
No D1 coupling.
No new pedagogy mode.
No cold pool.
No gust front.
No thermodynamics.
No solver.
No UI.

Next work starts only when commanded.
