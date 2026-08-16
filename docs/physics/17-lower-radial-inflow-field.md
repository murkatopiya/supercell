# Lower Radial Inflow Field

## 1. Purpose

This document defines the first height-dependent radial inflow
mechanism in Supercell Explorer: `LowerRadialInflowField` v1.

It answers:

    Given a vertical axis, a Gaussian radial scale, and a vertical
    taper that starts at a chosen height and reaches zero at a chosen
    top, what world-space horizontal radial velocity does a passive
    tracer sample when the flow is directed inward and remains at
    full strength at and below the taper start?

`LowerRadialInflowField` is a mathematically transparent, steady,
axisymmetric, purely horizontal velocity field directed toward a
fixed vertical axis and multiplied by a lower plateau plus a
monotonically decreasing upper taper. It is the first **inflow**
mechanism whose horizontal velocity depends on height.

It is **not**:

- a boundary-layer model;
- a mass-consistent low-level inflow;
- a pressure-driven inflow;
- a storm-relative inflow layer in the helicity / SRH sense;
- a gust-front or cold-pool inflow;
- a continuity solver.

The `storm/` module path means: controlled storm mechanism. It does
**not** mean full or realistic supercell physics.

The type is named `LowerRadialInflowField`. Naming rationale is in
§13. Filename follows the type:

    docs/physics/17-lower-radial-inflow-field.md

---

## 2. Relationship to existing foundations

`docs/physics/02-velocity-field-basics.md` requires:

- mechanisms to be tested in isolation before documented composition;
- smooth synthetic fields where possible, with any sharp transition
  documented explicitly (§36);
- that a field must not silently return zero outside a domain unless
  that behavior is intentionally specified (§35);
- that continuity be considered when inflow is designed (§28);
- that simple vector addition not be treated as automatically
  physically valid (§32).

This document fulfills the continuity requirement by stating the
residual explicitly. It does **not** introduce a continuity solver.

`docs/physics/00-coordinate-system.md` establishes:

    +X = East
    +Y = Up
    +Z = South

The world origin is **not** automatically the inflow axis. Altitude
is world `y`. `y = 0` is the reference ground; negative `y` is
mathematically allowed.

`docs/physics/01-parcel-basics.md` §27–28, §32: visually crowding
tracers are not atmospheric mass density, and correct tracer
integration does not imply mass conservation. Those warnings apply
here.

`docs/physics/03-numerical-integration-basics.md` distinguishes field
error from integrator error. The unbounded linear map
`r(t) = r0 exp(−A t)` is **not** the oracle for this
Gaussian-modulated field, even after replacing `A` by `A G(y0)`.

`docs/physics/14-radial-inflow-field.md` is the canonical
height-independent inward sibling: same Gaussian-linear radial
family, same inward sign, no vertical envelope. Height independence
is a documented v1 limitation of that type, not a bug. This document
does **not** evolve `RadialInflowField` into a height-dependent API.
See §3.

`docs/physics/15-vertical-updraft-envelope.md` is the first compact
vertical envelope in the project (`F(y)` on `[baseHeight, topHeight]`).
That envelope is a mid-peaking half-sine chosen as the first vertical
mode of a layer with `w = 0` at both lids. This field uses a lower
plateau and an upper taper for a **horizontal** lower-level inflow.
It does **not** copy that half-sine. Envelope comparison is
independent (§10).

`docs/physics/16-upper-radial-outflow-field.md` is the outward,
height-localized radial sibling. It uses a mid-peaking half-sine as
an upper-level window. This field does **not** read its bounds, does
not use `outflowStrainRate`, and is not a combined
lower-inflow/upper-outflow type. See §21.

`docs/physics/13-rotation-field.md` is the tangential companion in
the same Gaussian radial family. This field is purely radial, not
tangential.

`docs/physics/12-composite-velocity-field.md` already authorizes
generic world-space addition. Composition of this field with the
current DEMO operands is **out of scope** for this document's first
implementation slice.

`docs/architecture/01-scenario-config.md` and
`docs/rendering/07-composite-upper-radial-outflow-demo.md` owned the
five-operand DEMO while it still used height-independent
`RadialInflowField`. Current DEMO replacement of that occupant is
`docs/rendering/08-composite-lower-radial-inflow-demo.md`. This
physics document does not own that wiring and does not change it.
Isolated physics tests for `LowerRadialInflowField` must not require
ScenarioConfig.

Architectural role:

    LowerRadialInflowField implements VelocityField
        ↓
    sample(position, time) → world Vec3

First implementation slice:

    isolated LowerRadialInflowField
      + sampling tests
      + isolated tracer acceptance

Laboratory replacement of the DEMO inflow operand is **out of
scope** for this document's first implementation slice.

---

## 3. Architectural decision

The current DEMO limitation is:

    RadialInflowField:  V_inflow = V_inflow(r)

so the same `(x, z)` yields the same inward velocity at every height.
Aloft, that operand still pulls inward while
`UpperRadialOutflowField` pushes outward. The opposition is
prescribed superposition, not a solver.

Three ways exist to introduce `V_inflow(r, y)`.

### 3.1 Option A — evolve `RadialInflowField`

Add `baseHeight` / `topHeight` (and a `G(y)`) to the existing type.

Consequences:

- every current unit test of height independence becomes false, or
  must be rewritten around a dual-mode API;
- the live DEMO consumes this type today; evolving it would either
  change DEMO behavior in this physics slice (forbidden) or require
  a hidden “no envelope” mode;
- §14 explicitly locked height independence as a v1 limitation of
  that primitive;
- the project already rejected signed dual-mode on this type when
  outflow was introduced (`docs/physics/16-upper-radial-outflow-field.md`
  §19).

Rejected.

### 3.2 Option B — keep `RadialInflowField`, add a new type

`RadialInflowField` remains the canonical height-independent inward
primitive. A new type owns vertical localization.

This is the same pattern as:

    UpdraftField  →  VerticalEnvelopeUpdraftField

and as the inflow/outflow split:

    RadialInflowField stays inward and height-independent
    UpperRadialOutflowField is a separate outward localized type

Existing tests, formula, and DEMO operand stay valid. The new type
can choose a **different** `G(y)` without retrofitting §14.

### 3.3 Option C — reusable vertical-envelope wrapper

A generic `VerticalEnvelope(field, G)` or a shared envelope helper
wrapping `RadialInflowField.sample`.

Consequences:

- the only compositor in the project is additive
  `CompositeVelocityField`; a multiplicative wrapper is a new
  composition kind;
- `G(y)` for lower inflow is **not** the updraft half-sine and **not**
  the outflow half-sine (§10). A shared envelope abstraction would
  either bake the wrong window or become a strategy enum;
- independent validation ownership is less clear;
- the duplicated offset formula is a few lines.

This is premature abstraction. Rejected.

### 3.4 Canonical path

**Option B is canonical.**

    RadialInflowField              height-independent inward primitive
    LowerRadialInflowField         new height-dependent lower inflow

Do **not**:

- subclass one type from the other;
- add optional bounds to `RadialInflowField`;
- introduce a generic `VerticalEnvelope` wrapper;
- multiply `RadialInflowField.sample` by `G(y)` as the production
  type;
- leave the choice to a later wiring slice.

v1 does **not** leave this architecture as an implementation option.

---

## 4. Physical problem

### 4.1 What the current inflow does

`RadialInflowField` specifies only the **horizontal** structure of
inward flow:

    v_r(r) = −A r exp(−r² / (2 σ²))
    Vx = −A E dx
    Vy = 0
    Vz = −A E dz

Consequences:

- the same inward speed exists at `y = 0` and at `y → +∞`;
- `∂Vx/∂y = ∂Vz/∂y = 0`;
- there is no inflow base, no decay with height, and no top;
- in the current five-operand DEMO the field still acts inside the
  upper-outflow layer.

That is a legitimate laboratory primitive. It is not a lower-level
inflow layer.

### 4.2 Required new capability

A height-dependent lower inflow must allow:

    V_inflow = V_inflow(r, y)

so that inward velocity can:

- be strong at lower levels;
- weaken with height;
- vanish above a chosen layer;
- not be required to peak in the middle of the layer.

v1 realizes this as a **separable** product:

    V_horizontal(r, y) = radial_inflow(r) * G(y)

`radial_inflow(r)` keeps the existing §14 radial responsibility.
`G` is the new vertical responsibility.

Separability is a modeling choice for v1, not a claim that real
inflow layers are separable.

### 4.3 Desired lower-inflow behavior

The laboratory target is a **lower-level window**, not a convective
tower mode and not an upper-level bump.

Required qualitative shape:

- full strength at lower levels, including at and below the height
  where weakening begins;
- monotonically weakening with height through a chosen taper;
- identically off at and above a chosen top;
- **not** required to be off below the taper start.

It is **not** required that `G` have an interior maximum. A mid-layer
peak would say “inflow is weak at the ground and strongest halfway
up,” which is the wrong story for lower inflow.

Lower inflow is **not** required to have compact support downward.
The harmful leak for this mechanism is aloft, where it would fight
upper outflow. Strength that continues below the taper start is the
intended low-level story, not a domain bug. See §12.3.

### 4.4 What this slice does not claim

Introducing `G(y)` does **not** automatically mean:

- the field solves continuity;
- the field is a realistic inflow layer or PBL;
- upper outflow is now mass-compensated;
- the current DEMO should change.

Those are later questions. This document only defines the first
height-dependent lower-level inflow envelope.

---

## 5. What LowerRadialInflowField is

`LowerRadialInflowField` is a world-space `VelocityField` whose only
nonzero components are horizontal, directed toward a fixed vertical
axis, and scaled by a lower plateau plus a compact upper taper.

Conceptually:

    V(x, y, z, t) = (Vx(r, y), 0, Vz(r, y))

where `r` is horizontal radial distance from the axis in the world
`X`–`Z` plane, the horizontal vector is purely radial and inward, and
`y` enters only through a scalar envelope `G(y)`.

Properties of v1:

- Gaussian-modulated linear radial profile (the §14 family);
- `G = 1` at and below `baseHeight` (full-strength plateau);
- quarter-cosine taper on `(baseHeight, topHeight)`;
- `G(topHeight) = 0`, and `G = 0` above;
- monotonic: constant on the plateau, decreasing through the taper;
- steady (independent of `time`);
- height-dependent (independent of `y` only through `G`);
- axisymmetric about the vertical axis through the center;
- defined at every finite world position;
- continuous in `(x, z)` and `C^∞` in the horizontal plane;
- `C^1` in `y` at `baseHeight`; `C^0` but not `C^1` in `y` at
  `topHeight` (documented in §12).

This is a controlled laboratory mechanism. It is not a claim about
real low-level supercell inflow.

---

## 6. Center

The inflow axis is fixed by a horizontal center in world coordinates:

    center = (centerX, centerZ)

Units: meters.

The center does **not** include a `centerY`. Vertical localization is
owned by `baseHeight` / `topHeight` (plateau top / taper top), not by
a point on the axis.

The center must not be silently assumed to be the world origin.

v1 does **not** introduce a shared `storm.center` with
`RadialInflowField`, `VerticalEnvelopeUpdraftField`,
`RotationField`, or `UpperRadialOutflowField`. This field owns its
own `centerX` and `centerZ`. A later demo may pass equal numbers
without merging the types.

---

## 7. Horizontal radius

Define horizontal offset from the center:

    dx = x - centerX
    dz = z - centerZ

    r² = dx² + dz²
    r  = sqrt(r²) ≥ 0

`r` is a non-negative length in meters in the world horizontal plane
(`X`, `Z`). World `Y` does not enter `r`.

The outward-positive radial unit direction in that plane, for
`r > 0`, is the direction of `(dx, dz)`. Velocity is antiparallel to
that vector where `G(y) > 0`.

---

## 8. Canonical radial profile

The radial factor is the existing §14 law, before multiplication by
`G(y)`.

    A     = radialStrainRate
    sigma = horizontal Gaussian scale

    v_r(r) = −A * r * exp( −r² / (2 * sigma²) )

    E  = exp( −r² / (2 * sigma²) )

    Vx = −A * E * dx * G(y)
    Vy = 0
    Vz = −A * E * dz * G(y)

This offset form is mandatory. Implementations must **not** normalize
`(dx, dz)` and divide by `r`. On the axis (`r = 0`):

    dx = 0, dz = 0  ⇒  V = (0, 0, 0)

with no `0/0`, at every height.

Derived radial properties at `G = 1`, not additional API:

- `v_r(0) = 0`;
- for `A > 0`, `G > 0`, and `r > 0`, `v_r < 0` (inward at every
  finite radius; there is no outer outflow band);
- peak `|v_r|` at `r = sigma`:

      |v_r|_max(G=1) = A * sigma / sqrt(e)

- as `r → ∞`, `v_r → 0`;
- near the axis (`E ≈ 1`):

      v_r(r) ≈ −A r G(y)

  so at the envelope maximum (`G = 1`), `A` is the near-axis radial
  strain rate `lim_{r→0} |v_r| / r`.

There is no compact horizontal support. Far-field decay is entirely
given by the Gaussian formula.

The radial geometry is unchanged from §14. Only `G(y)` is new.
Sign semantics are unchanged: `A > 0` still means inward.

v1 does **not** leave the radial profile as an implementation option.

---

## 9. Why the updraft/outflow half-sine is the wrong default

`VerticalEnvelopeUpdraftField` uses

    F(y) = sin(π ξ)

because that is the textbook first vertical mode of a layer with
`w = 0` at both lids.

`UpperRadialOutflowField` uses the same window as a compact
**upper-level** bump: off at both lids, peak in the middle of an
aloft band. That matches “predominantly aloft.”

Lower inflow has a different job. Nothing requires
`|V_horizontal| = 0` at the ground. Surface-level inward flow is the
mechanism. A half-sine on `[0, H]` would give:

    G(ground) = 0
    G(mid-layer) = 1

That is the opposite of lower-level semantics: tracers at the ground
would not move inward at all.

Isolated tracers of this field have `Vy = 0`, so `y` is frozen and
`G(y0)` is a constant scale along a trajectory. Envelope smoothness
therefore does **not** affect the isolated radial ODE, unlike the
updraft case where `F(y)` is re-sampled as the particle rises. The
envelope is chosen for **Eulerian lower-level meaning**, not for an
isolated closed-form `y(t)`.

---

## 10. Vertical envelope comparison

Let:

    y_b = baseHeight
    y_t = topHeight
    H   = y_t − y_b > 0
    ξ   = (y − y_b) / H

On the taper interval, `ξ ∈ (0, 1)`.

A previous draft of this document used a compact-zero-below
quarter-cosine:

    G = 1 at y_b,   G = 0 for y < y_b

That choice made `G(baseHeight) = 1` and compact support, but it
forced a jump in horizontal velocity at `y_b`. Isolated tracers never
cross it (`Vy = 0`). A later composite tracer lifted by an updraft
would. v1 does **not** keep that discontinuity for compact support
or test convenience.

The incompatibility is:

    continuity of G
    + G = 0 strictly below y_b
    + G(y_b) = 1
    ⇒  impossible

v1 drops compact support downward. It keeps continuity and full
strength at and below the taper start.

### 10.1 Candidate A — half-sine, compact both ways

    G(y) = sin(π ξ)     for y_b ≤ y ≤ y_t
    G(y) = 0            otherwise

| Property | Value |
|---|---|
| `G(y_b)`, `G(y_t)` | `0` |
| Maximum | `G = 1` at `y_mid` |
| Monotonic on the layer | no; rises then falls |
| Compact exact zeros | yes, both sides |
| Continuity of `G` | `C^0` everywhere |
| New parameters | 2 |
| Isolated tracer ODE | `G(y0)` constant |

Continuous and compact. Wrong shape for lower inflow: zero at the
lower lid, peak halfway up. Rejected for v1.

### 10.2 Candidate B — lower plateau + quarter-cosine taper

    G(y) = 1                              if y ≤ y_b
    G(y) = cos(π ξ / 2)                   if y_b < y < y_t
    G(y) = 0                              if y ≥ y_t

| Property | Value |
|---|---|
| `G(y ≤ y_b)` | `1` |
| `G(y_t)` and above | `0` |
| Maximum | `G = 1` on the entire half-space `y ≤ y_b` |
| Monotonic | constant on the plateau; strictly decreasing on the taper |
| Compact exact zeros | only above `y_t`; **not** below `y_b` |
| Continuity of `G` | `C^0` everywhere; `C^1` at `y_b`; not `C^1` at `y_t` |
| Interior taper derivative | `G'(y) = −(π / (2H)) sin(π ξ / 2) ≤ 0` |
| `G'` at `y_b` | `0` from both sides |
| `G'` at `y_t` | interior `−π / (2H)`, exterior `0` |
| New parameters | 2 |
| Hidden normalization | none; `max G = 1` by construction |
| Isolated tracer ODE | `G(y0)` constant |

Full strength on all lower levels. Weakens only through the taper.
Exact zero at and above `topHeight`. Velocity is continuous. A
composite tracer that rises through `y_b` sees no jump in `V_h`.

This is **not** the one-sided unbounded window rejected for upper
outflow in `docs/physics/16-upper-radial-outflow-field.md` §9.4.
That rejection was a plateau **aloft** (`G → 1` as `y → +∞`), which
would leak upper outflow to infinite height. Here the plateau is
**downward**. The leak that this field must prevent is aloft, and
that direction remains compact: `G = 0` for `y ≥ y_t`.

### 10.3 Candidate C — plateau + smoothstep / cubic Hermite taper

    G(y) = 1                         if y ≤ y_b
    G(y) = 1 − 3ξ² + 2ξ³             if y_b < y < y_t
    G(y) = 0                         if y ≥ y_t

`G'(y_b) = G'(y_t) = 0`, so this would be `C^1` at **both** ends.
Monotonic. Extra polynomial. `G` at mid-taper is `1/2` rather than
`√2/2`. Isolated tracers do not use `G'`.

A reasonable smoother alternative at `y_t`. Not canonical for v1.
If lid shear of `V_h` at `topHeight` later becomes a documented
problem, reopen this choice explicitly. Do not treat smoothstep as
a silent implementation upgrade.

The Hann-from-one form `cos²(π ξ / 2)` on the taper is the same
verdict: `C^1` at the top, extra trigonometric factor.

### 10.4 Candidate D — Gaussian in height

    G(y) = exp( −(y − y_peak)² / (2 σ_y²) )

Never exactly zero. A weak tail would exist aloft for any finite
`y_peak`. That leaks lower inflow into the upper-outflow region and
fails the problem statement. No chosen top with `G = 0`. Rejected
for v1.

### 10.5 Candidates not used

| Candidate | Why rejected |
|---|---|
| Compact-zero-below quarter-cosine (`G = 0` for `y < y_b`, `G(y_b) = 1`) | velocity jump at `y_b`; withdrawn from v1 |
| Linear taper `G = 1 − ξ` with plateau | `G'(y_b+) = −1/H ≠ 0`; only `C^0` at the taper start |
| Half-sine | wrong lower-level semantics; see §10.1 |
| Peak pinned to updraft / outflow bounds | forbidden coupling to another type |
| `C^∞` compact bump | testing cost; compact-zero-below still jumps if exterior is zero |

### 10.6 Canonical vertical envelope

**Candidate B, the lower plateau plus quarter-cosine taper, is
canonical.**

Reasons that are **not** “the updraft already uses a trigonometric
window”:

1. Lower-level semantics: full strength at and below the taper
   start, not a mid-layer peak and not zero at the ground.
2. Monotonic decay through the taper.
3. Exact zero at and above `topHeight` — the direction that must not
   leak.
4. Continuous velocity, including through `baseHeight`.
5. `C^1` at the taper start (`G' = 0` from both sides).
6. `max G = 1` with no hidden scale, so `radialStrainRate` keeps its
   §14 near-axis meaning on the entire plateau.
7. Only two vertical parameters. There is no `y_mid` peak to own.
8. Elementary `G` and `G'`.
9. Isolated radial ODE is the §14 sibling with a constant
   `A_eff = A G(y0)`.

The documented cost is that `G` is not compact downward: the field
equals the height-independent §14 inflow for every `y ≤ y_b`,
including mathematically negative heights. That is a synthetic
boundary policy, not a realistic atmosphere (§12.3).

Rejected, with the reason that would reopen the choice:

- **A** — mid-layer peak; `G(base) = 0`;
- **C** — smoother top lid, not needed for the v1 isolated contract;
- **D** — leaks to all heights;
- compact-zero-below cosine — velocity jump at `y_b`;
- linear taper — loses `C^1` at the taper start;
- coupling to updraft or outflow bounds — type independence.

v1 does **not** leave the envelope as an implementation option.

---

## 11. Canonical vertical envelope

### 11.1 Formula

Let:

    y_b = baseHeight
    y_t = topHeight
    H   = y_t − y_b
    ξ(y) = (y − y_b) / H

Then:

    G(y) = 1                         if y ≤ y_b
    G(y) = cos(π ξ(y) / 2)           if y_b < y < y_t
    G(y) = 0                         if y ≥ y_t

Endpoint values of the cosine formula agree with the adjacent
pieces, so they may be used on the closed taper interval as an
equivalent evaluation:

    cos(0) = 1 = G(y_b)
    cos(π / 2) = 0 = G(y_t)

Implementations must **not** introduce a thickness, epsilon, or
smoothstep near `y_b` or `y_t`. Do not clamp, saturate, or
renormalize.

A correct branch, if used, is:

    y ≥ topHeight     →  G = 0
    y ≤ baseHeight    →  G = 1
    otherwise         →  cosine taper

Do **not** treat `y < baseHeight` as a zero branch. That was the
withdrawn compact-zero-below draft.

Prefer the piecewise `G = 0` for `y ≥ topHeight` over relying on
`cos(π/2)` being a bitwise zero.

### 11.2 Derived envelope facts (not additional API)

- `0 ≤ G(y) ≤ 1` for all finite `y`;
- `G(y) = 1` for every `y ≤ y_b` (the maximum is a plateau, not a
  unique point);
- `G(y_t) = 0`;
- `G(y) > 0` for `y < y_t`;
- `G(y) = 0` for `y ≥ y_t`;
- on `(-∞, y_b]`, `G` is constant;
- on `[y_b, y_t]`, `G` is monotonically non-increasing;
- on `(y_b, y_t]`, `G` is strictly decreasing;
- at mid-taper, `G((y_b + y_t)/2) = cos(π / 4) = √2 / 2`, **not**
  `1`.

`y_mid` is not a distinguished API point for this field. Tests
copied from the outflow `G = 1` at `y_mid` contract would be wrong.

---

## 12. Ground and boundary semantics

This is the principal difference from half-sine updraft/outflow:
those envelopes are zero at both lids. This envelope is full
strength at and below the taper start.

| Location | `G` | Horizontal `V` |
|---|---|---|
| `y < baseHeight` | `1` | `−A E (dx, 0, dz)`  (full §14 field) |
| `y = baseHeight` | `1` | same full §14 field |
| `baseHeight < y < topHeight` | `cos(π ξ / 2) ∈ (0, 1)` | scaled inward |
| `y = topHeight` | `0` | `(0, 0, 0)` |
| `y > topHeight` | `0` | `(0, 0, 0)` |

### 12.1 Continuity of `G` and of velocity

At `baseHeight`:

    G(y_b⁻) = 1
    G(y_b)  = 1
    G(y_b⁺) = 1

Horizontal velocity is therefore continuous through `baseHeight`.
A later composite tracer that rises through this height under an
updraft does **not** see a jump in `V_h`.

At `topHeight`:

    G(y_t⁻) → 0
    G(y_t)  = 0
    G(y_t⁺) = 0

Velocity is continuous through `topHeight`. The exterior above is
exactly zero.

The field is continuous in `(x, z)` everywhere and continuous in
`y` everywhere. There is no epsilon wall
(`docs/physics/02-velocity-field-basics.md` §36).

### 12.2 Classical `dG/dy`

Plateau, `y < y_b`:

    G'(y) = 0

Open taper, `y_b < y < y_t`:

    G'(y) = −(π / (2H)) * sin(π ξ / 2) ≤ 0

Above the top, `y > y_t`:

    G'(y) = 0

One-sided limits at the taper start:

    G'(y_b⁻) = 0
    G'(y_b⁺) = −(π / (2H)) * sin(0) = 0

So `G'(y_b) = 0` exists as a classical derivative, and `G'` is
continuous at `y_b`. The envelope is **`C^1` at `baseHeight`**.

It is **not** `C^2` there. The second derivative jumps:

    G''(y_b⁻) = 0
    G''(y_b⁺) = −π² / (4 H²)

One-sided limits at the top:

    G'(y_t⁻) = −π / (2H)
    G'(y_t⁺) = 0

`G` is continuous at `topHeight` but **not classically
differentiable** there. The envelope is **`C^0` and not `C^1` at
`topHeight`**. That derivative jump is documented, not smoothed.

Do not invent an epsilon average at `y_t`. Tests of `G'` or
`∂Vx/∂y` at the top must use strictly interior taper points, or
must state one-sided limits explicitly. Tests at `y_b` may use the
classical value `G' = 0`.

### 12.3 Why the plateau is not compact downward

Lower inflow does not need a lower lid with `G = 0`.

The laboratory story is: full inward flow at low levels, then
weaken, then stop. Compact support downward was an artifact of
copying updraft/outflow lid structure. It is the wrong boundary
for this mechanism.

Reference ground is `y = 0`
(`docs/physics/00-coordinate-system.md`). Physics types may still
sample negative `y`. The plateau

    G(y) = 1  for all y ≤ baseHeight

including `y → −∞`, is **not** a realistic atmosphere. It is a
composable synthetic boundary policy:

    below the taper-start height, the prescribed lower inflow
    does not weaken further.

If a future domain wall, terrain, or ground clip restricts the
lower atmosphere, that is a separate boundary concern. This field
does not invent one.

### 12.4 Sampling policy

v1 is defined at every finite world position.

Sampling at `y ≥ topHeight` is **not** an error. It returns
`V = (0, 0, 0)`.

Sampling at `y ≤ baseHeight` is **not** an error. It returns the
full §14 inward velocity (`G = 1`).

This is an intentional envelope, not a silent fallback
(`docs/physics/02-velocity-field-basics.md` §35).

Reason: `VelocityField` operands must be freely composable.
Environment, updraft, rotation, height-independent inflow, and
upper outflow all sample everywhere. A throw-on-out-of-layer
policy would make `CompositeVelocityField` unusable.

There is no horizontal domain wall. Far from the axis, decay is
still only the radial Gaussian, and only where `G > 0`.

No hidden epsilon. Comparisons are ordinary IEEE-754 inequalities
against the stored bounds.

`baseHeight` may be negative. Ground `y = 0` is not an implicit
lid and not an implicit taper start.

---

## 13. Type name

Candidates:

| Name | Verdict |
|---|---|
| `VerticalEnvelopeRadialInflowField` | Rejected. Parallel to `VerticalEnvelopeUpdraftField` would imply the same mid-peaking half-sine envelope. This envelope is a lower plateau plus an upper taper. The name would over-promise shared envelope architecture. |
| `LayeredRadialInflowField` | Rejected. “Layered” does not say lower-level, one-sided, or inward. |
| `HeightDependentRadialInflowField` | Rejected. Accurate but generic; does not state the lower-level plateau semantics. |
| `LowerRadialInflowField` | **Canonical.** Lower = full-strength low-level plateau with a cutoff aloft. Radial = purely radial. Inflow = inward. Does not promise a meteorological boundary layer, gust front, or mass continuity. |

One name. No aliases. No `VerticalEnvelopeRadialInflowField` export.

“Lower” here has the same status as “Upper” in
`UpperRadialOutflowField`: it names the intended height band, not
PBL realism. It does **not** mean compact support both ways.

Filename:

    docs/physics/17-lower-radial-inflow-field.md

---

## 14. Strength semantics

The linear coefficient `A` has units `1/s`.

Canonical parameter name:

    radialStrainRate

This is the **same** identifier and the **same** geometric sense as
on `RadialInflowField`: `A > 0` means inward. Reusing the name is
correct here. `UpperRadialOutflowField` rejected this identifier
because there `A > 0` means the opposite direction.

Canonical rule:

    radialStrainRate = A > 0  →  strictly inward radial flow
                                 where G(y) > 0

Horizontal speed:

    |V_h| = A * r * E * G(y)

Radial maximum, for any fixed `G > 0`, is at `r = σ`:

    |V_h|(r=σ, y) = (A σ / √e) * G(y)

Global maximum of `|V_h|` is at `r = σ` for **every** `y ≤ baseHeight`,
where `G = 1`:

    |V_h|_max = A * sigma / sqrt(e)

That is the same peak formula as `RadialInflowField`. Because
`max G = 1` by construction, there is **no hidden normalization**.
Changing `H` does not rescale `A`. Changing `baseHeight` /
`topHeight` moves and stretches the taper; it does not change the
peak strain on the plateau.

On the axis, `|V_h| = 0` at every height.

`radialStrainRate` is **not**:

- diagnostic horizontal convergence `−div_h`;
- peak inward speed;
- a numerical timestep-convergence setting.

`peakRadialVelocity` is not an API parameter.

Negative `A` would reverse the field into outflow. Outflow is a
different type (`UpperRadialOutflowField`). Zero `A` is not a
“disabled inflow” mode.

---

## 15. Full velocity formula

    A     = radialStrainRate
    σ     = sigma
    y_b   = baseHeight
    y_t   = topHeight
    H     = y_t − y_b

    dx = x − centerX
    dz = z − centerZ
    r² = dx² + dz²

    E(r) = exp( −r² / (2 σ²) )

    G(y) = 1                               if y ≤ y_b
    G(y) = cos(π (y − y_b) / (2 H))        if y_b < y < y_t
    G(y) = 0                               if y ≥ y_t

    Vx = −A * E * dx * G(y)
    Vy = 0
    Vz = −A * E * dz * G(y)

IEEE-754 signed zero: a product that is a negated or scaled zero
offset may yield `−0`. Implementations should canonicalize output
components that are algebraically zero to `+0`, following
`RadialInflowField`.

---

## 16. Vertical domain

### 16.1 Parameters and naming decision

    baseHeight    // world +Y, meters
    topHeight     // world +Y, meters

These are world-space vertical coordinates, the same quantity as
environmental profile `height` and world `y`. They are **not**
AGL-only display units and **not** a `centerY`.

Canonical meanings on **this** type:

    baseHeight
        world height below which lower radial inflow remains at
        full envelope value G = 1, and above which vertical taper
        begins.

    topHeight
        world height at which taper reaches G = 0; inflow is zero
        at and above this height.

`baseHeight` is **not** a lower lid of compact support. It is the
top of the full-strength plateau / the start of weakening.

Evaluated rename `taperStartHeight` instead of `baseHeight`:

| Argument | Verdict |
|---|---|
| More literal for the plateau+taper shape | true |
| Matches sibling storm fields (`VerticalEnvelopeUpdraftField`, `UpperRadialOutflowField`) | false; those use `baseHeight` as a zero lid |
| Future DTO / factory surface | a one-off identifier in an otherwise uniform six-parameter storm-field shape |
| Risk of copying updraft `baseHeight` semantics | real; must be documented, not solved by a unique name |

**v1 keeps `baseHeight` / `topHeight`.** One canonical pair. Do not
export `taperStartHeight`. The semantic difference from updraft and
outflow lids is documented here and must not be silent in a later
wiring document.

Naming still follows semantic height (`baseHeight` / `topHeight`),
not `baseY` / `topY`. The storm axis remains a horizontal pair
`(centerX, centerZ)`.

These bounds are **this field’s** bounds. They are not the
updraft’s and not the upper outflow’s. Equal numbers in a later
DEMO are a fixture choice.

### 16.2 Order

Require:

    topHeight > baseHeight

Equal bounds and inverted bounds are invalid. There is no minimum `H`
in the constructor. Very small `H` makes `|G'| ~ 1/H` large and is a
timestep concern for later composites that move particles in `y`.
Isolated tracers of this field do not change `y`. That is not
constructor validation.

`baseHeight` may be negative. Ground `y = 0` is not an implicit lid
and not an implicit taper start.

### 16.3 Defined on all world space

See §12.4. Sampling at or above `topHeight` returns zero and is
valid. Sampling at or below `baseHeight` returns full §14 inflow
and is valid.

---

## 17. Coordinate and frame semantics

| Quantity | Representation | Notes |
|---|---|---|
| Sample input position | world `Vec3` `(x, y, z)` | meters |
| Sample output velocity | world `Vec3` `(Vx, Vy, Vz)` | m/s |
| Radial strain | `A` in `v_r = −A r E G` | 1/s; strictly positive in v1 |
| Vertical velocity | exactly `Vy = 0` | not approximate |

Canonical mapping from `docs/physics/00-coordinate-system.md`:

    (x, y, z) = (eastward, vertical, -northward)

so this field’s meteorological parts are:

    eastward  = Vx
    northward = -Vz
    vertical  = 0

`LowerRadialInflowField.sample` returns world velocity directly.

It does **not**:

- return `AtmosphericVelocity`;
- convert through environmental profile sampling;
- subtract storm motion;
- depend on hodograph / shear / helicity diagnostics.

Do not name world components `u`, `v`, `w`.

The field is Eulerian-steady: `time` is ignored.

    sample(P, t1) = sample(P, t2)

Trajectories are still time-dependent through changing `(x, z)`.
Isolated trajectories do not change `y`. Therefore an isolated tracer
seeded at `y0` samples one frozen `G(y0)` for its entire life. That
is the important difference from `VerticalEnvelopeUpdraftField`.

---

## 18. Sign convention and cardinals

Canonical rule:

    A > 0  →  strictly inward radial flow where G(y) > 0

### Cardinal validation table

For `A > 0`, `G(y) > 0`, a point at horizontal distance `d > 0` from
the center, and

    E = exp( -d² / (2 * sigma²) )
    S = A * E * d * G(y)     // S > 0

| Location relative to center | `(dx, dz)` | World velocity | Atmospheric direction |
|---|---|---|---|
| East | `(+d, 0)` | `(−S, 0, 0)` | westward (`−X`) |
| West | `(−d, 0)` | `(+S, 0, 0)` | eastward (`+X`) |
| North (world `−Z`) | `(0, −d)` | `(0, 0, +S)` | southward (`+Z`) |
| South (world `+Z`) | `(0, +d)` | `(0, 0, −S)` | northward (`−Z`) |

On a north-up map this is east → west, west → east, north → south,
south → north: toward the axis along the horizontal radius.

At the same `(dx, dz)` but `G(y) = 0`, every row is `(0, 0, 0)`.

On the axis, every row is `(0, 0, 0)` at every height.

Compare `RadialInflowField` §8: the same horizontal signs, scaled by
`G(y)`. Compare `UpperRadialOutflowField` §17: every horizontal sign
is reversed.

---

## 19. Vertical derivative and divergence

### 19.1 Analytic `div_h`

    Vx = −A G(y) E dx
    Vz = −A G(y) E dz
    Vy = 0

Differentiating the Gaussian offset form, with `G` independent of
`(x, z)`:

    ∂Vx/∂x + ∂Vz/∂z
      = −A * E * G(y) * (2 − r² / sigma²)

Call this `div_h`. Because `Vy ≡ 0`:

    ∇ · V = div_h + ∂Vy/∂y = div_h

`G(y)` **scales** the entire horizontal divergence. It does not
change the radial factor `(2 − r²/σ²)` and does not create a
vertical velocity.

For `y ≥ y_t`, `G = 0` ⇒ `div_h = 0`.
For every `y ≤ y_b`, `G = 1` and `div_h` matches
`RadialInflowField` exactly.

On the axis on the plateau (`y ≤ y_b`):

    div_h = −2A

`A` is **not** equal to `−div_h`. Tests and later diagnostics must
not treat them as interchangeable.

`div_h` changes sign at `r = sigma * sqrt(2)`:

- `div_h < 0` for `r < σ √2` (local sink) when `G > 0`;
- `div_h > 0` for `r > σ √2` (local source) when `G > 0`;
- `v_r` remains `< 0` at every finite `r` where `G > 0`.

This is the same shielded horizontal sink as §14, multiplied by
`G(y)`. Net flux through a circle of radius `r` is `2π r v_r G`, and
that flux tends to `0` as `r → ∞`.

Local `div_h > 0` in the far Gaussian tail does **not** mean the flow
has become outward. Inward direction is the invariant
`dx Vx + dz Vz < 0` where `G > 0` and `r > 0`.

There is no production `divergence()` API. The formula above is the
documented analytic identity for tests and later diagnostics.

### 19.2 Height derivatives of horizontal velocity

On the plateau, `y < y_b`:

    G'(y) = 0
    ∂Vx/∂y = 0
    ∂Vz/∂y = 0

On the open taper, `y_b < y < y_t`:

    G'(y) = −(π / (2H)) sin(π ξ / 2)
    ∂Vx/∂y = −A * E * dx * G'(y)
    ∂Vz/∂y = −A * E * dz * G'(y)

At `y_b`, `G' = 0` classically, so `∂Vx/∂y = ∂Vz/∂y = 0`.

At `y_t`, those derivatives have unequal one-sided limits
(`−A E dx (−π/(2H))` from below, `0` from above). They are not
classically defined there.

A height gradient of horizontal velocity is **not** mass
consistency. It is vertical shear of `V_h`. Because `Vy ≡ 0`, that
shear does not cancel `div_h`. The smooth `C^1` join at `y_b` does
not make the field a continuity solver.

`div_h` itself is continuous everywhere, because it depends on `G`,
not `G'`. It is constant in `y` on the plateau, decreases in
magnitude through the taper, and is zero at and above `y_t`.

### 19.3 Three distinct claims

| # | Statement | v1 status |
|---|---|---|
| 1 | The field is locally convergent on the axis and in the core (`div_h < 0` for `r < σ √2`, `G > 0`) | **true** by construction |
| 2 | The field represents lower-level radial inflow conceptually | **true** as a prescribed laboratory mechanism |
| 3 | The field closes mass continuity, alone or with updraft and outflow | **false** |

v1 claims (1) and (2). It forbids (3).

### 19.4 Why this does not close continuity

`VerticalEnvelopeUpdraftField` has `∂Vy/∂y ≠ 0` inside its own
layer. `UpperRadialOutflowField` has its own `div_h` of opposite
horizontal sign inside a different window.

This field adds:

    ∇ · V_inflow = −A E G(y) (2 − r² / σ²)

Even if a later DEMO used identical centers and sigmas, the sum

    this inflow + enveloped updraft + upper outflow

is three independently prescribed fields. No v1 invariant ties

    A, H, y_b, y_t
    W0, H_up
    A_out, H_out

together. In particular this document does **not** impose

    G(y) + G_out(y) = 0
    H = W0 π / (2A)

or any other continuity equation.

`G(y)` must **not** be bound to updraft or outflow parameters.

Because this field has `Vy ≡ 0`, it cannot compensate its own
`div_h` with vertical motion. Height localization only turns that
residual off above `topHeight`.

Do **not** assert:

    lower inflow = air entering
    updraft = same air rising
    upper outflow = same air leaving

in a mass-conserving sense
(`docs/physics/01-parcel-basics.md` §27–28, §32).

---

## 20. Relationship to RadialInflowField

Shared radial family:

    E = exp(−r² / (2 σ²))
    offset world form, no division by r
    peak |v_r| at r = σ
    axis rest
    A > 0 means inward
    strength name `radialStrainRate`

Differences:

| | `RadialInflowField` | `LowerRadialInflowField` |
|---|---|---|
| Height | independent | plateau `G = 1` for `y ≤ y_b`, quarter-cosine taper, `G = 0` for `y ≥ y_t` |
| `G` | implicitly `1` everywhere | `1` on `y ≤ y_b`, taper to `0` at `y_t` |
| Peak location | any `y`, at `r = σ` | every `y ≤ y_b`, at `r = σ` |
| Continuity in `y` | entire space | `C^1` at `y_b`; `C^0` not `C^1` at `y_t` |

For every `y ≤ baseHeight`, the two formulas agree exactly:

    sample(LowerRadialInflowField, (x, y, z))
      = sample(RadialInflowField, (x, y, z))
    whenever y ≤ y_b

for equal `centerX`, `centerZ`, `radialStrainRate`, and `sigma`.
That identity is a useful unit check. It is not inheritance.

### Status of the old type

`RadialInflowField`:

- remains the canonical height-independent inward primitive;
- keeps its formula, tests, and DEMO occupancy in this slice;
- is **not** deprecated by this document;
- is **not** a base class of `LowerRadialInflowField`.

Do **not** introduce a shared helper merely because the offset
formula is duplicated. A later extraction would need a documented
reason beyond three similar lines.

---

## 21. Relationship to UpperRadialOutflowField

`UpperRadialOutflowField` has its own vertical layer, its own
`outflowStrainRate`, and the opposite horizontal sign.

This lower inflow:

- must **not** read outflow bounds;
- must **not** turn off because outflow is on;
- must **not** use `A_out`;
- must **not** become a combined lower-inflow / upper-outflow field.

The two envelopes are different objects:

    G_in(y)   — plateau + quarter-cosine; G = 1 for y ≤ this field’s
                baseHeight
    G_out(y)  — half-sine; max at the outflow `y_mid`

They may overlap, leave a gap, or sit in disjoint height bands.
Overlap in a future DEMO is a **fixture choice** and remains
controlled superposition. This document does **not** promise that
overlap will disappear.

What vertical localization **does** enable: a future DEMO can place
this field’s `topHeight` at or below the outflow layer so that the
height-independent tug-of-war aloft is reduced. “Reduced” is not
“solved,” and it is not automatic. If the layers overlap, both
radial terms still add.

Current five-operand DEMO wiring is unchanged by this slice.

---

## 22. Relationship to VerticalEnvelopeUpdraftField

The updraft envelope `F(y)` scales **vertical** velocity and is
re-sampled as an isolated tracer rises. This envelope `G(y)` scales
**horizontal** velocity and is frozen along an isolated trajectory.

This field must **not**:

- read updraft parameters;
- require `baseHeight` to equal the updraft `baseHeight`;
- require matching `centerX` / `centerZ` / `sigma`;
- scale `radialStrainRate` from `W0` or `H_up`;
- copy `F(y) = sin(π ξ)` because the updraft uses it.

Coincidence of vertical bounds in a future DEMO is a fixture choice,
not an API invariant.

Isolated tests of this field keep `y` constant. Isolated tests of
the updraft keep `(x, z)` constant on the axis. Neither isolated
contract is a composite trajectory oracle.

---

## 23. Parameters

| Parameter | Symbol | Meaning | Units | Constraint |
|---|---|---|---|---|
| `centerX` | — | world east coordinate of axis | m | finite |
| `centerZ` | — | world south coordinate of axis | m | finite |
| `radialStrainRate` | `A` | near-axis coefficient in `v_r = −A r E G`; sign is fixed inward | 1/s | finite and `> 0` |
| `sigma` | `σ` | Gaussian horizontal scale in `exp(−r²/(2σ²))` | m | finite and `> 0` |
| `baseHeight` | `y_b` | world `y` below which `G = 1` and above which taper begins | m | finite |
| `topHeight` | `y_t` | world `y` where taper reaches `G = 0`; zero at and above | m | finite and `> baseHeight` |

The plateau plus quarter-cosine taper is completely determined by
those two bounds. No extra envelope parameter is required.
`taperStartHeight` is not an API name. See §16.1.

`sigma` is the scale parameter of the Gaussian exponent as written.
It is **not** a compact-support radius.

Parameters intentionally absent from v1:

- `centerY`;
- `peakHeight` / `y_mid` as a free parameter (this envelope has no
  interior peak);
- `peakRadialVelocity`;
- envelope selector / `G` enum;
- `sigmaY`;
- time dependence;
- moving or tilted axis;
- tangential rotation;
- signed strain / outflow mode;
- mass-continuity correction or coupling to updraft / outflow;
- ScenarioConfig wiring;
- composition helpers;
- a `divergence()` API;
- a shared envelope helper with `RadialInflowField`.

---

## 24. Validation policy

Validation belongs at the owning construction boundary of
`LowerRadialInflowField`.

Reject when:

- any parameter is non-finite (`NaN` or `±Infinity`);
- `sigma ≤ 0`;
- `radialStrainRate ≤ 0`;
- `topHeight ≤ baseHeight`.

Do **not** accept:

- `radialStrainRate = 0` as a “zero inflow” mode;
- `radialStrainRate < 0` as an outflow mode of this type.

Do **not** reject:

- `baseHeight < 0`;
- `baseHeight = 0`;
- large `H`;
- small but positive `H`;
- centers other than the world origin.

There is no hidden minimum thickness.

The additive identity, if needed, is the absence of this operand or
an explicit zero `ConstantVelocityField`.

Sampling itself does not re-validate. Every finite world position is
evaluable.

Error type: `LowerRadialInflowFieldError`, matching the other storm
fields’ dedicated error classes.

---

## 25. Analytical tracer acceptance oracle

The **continuous** ODE for the isolated field is:

    dr/dt = −A * r * exp( −r² / (2 σ²) ) * G(y)
    dθ/dt = 0
    dy/dt = 0

Because `Vy = 0`, `y(t) = y0` and `G(y0)` is a constant
`G0 ∈ [0, 1]`.

Effective strain along that trajectory:

    A_eff = A * G0

At fixed `y`, the dynamics reduce to Gaussian radial inflow with
that constant `A_eff`. Existing §14 acceptance ideas therefore
adapt by replacing `A` with `A_eff`, plus new rest cases for
`G0 = 0` and a height-dependence comparison across two `y0`.

Setup:

- field as defined above;
- particle at horizontal offset `(dx0, dz0)` from the center;
- chosen `y0`.

### Exact elementary facts

On the axis (`r0 = 0`), at any `y0`:

    V ≡ 0  ⇒  P(t) = P0

for both Euler and RK2 aside from ordinary floating-point roundoff.

Off-axis with `G0 = 0` (`y0 ≥ y_t`):

    V ≡ 0  ⇒  P(t) = P0

including `y` and `(x, z)`.

Off-axis with `G0 > 0` (every `y0 < y_t`, including the entire
plateau `y0 ≤ y_b`), the motion stays on the original horizontal ray:

    (dx(t), dz(t)) = s(t) * (dx0, dz0)

with `s(t) > 0` **decreasing**. Polar angle `θ` is invariant. Height
is invariant: `y(t) = y0`.

For this purely radial field, explicit Euler and RK2 also stay on
that ray exactly (aside from roundoff): each stage samples a velocity
parallel to the current offset, so the discrete update is a radial
scale. Ray preservation is therefore both a continuous invariant and
an expected discrete invariant.

Radius is strictly decreasing for `r0 > 0` and `G0 > 0`. The axis is
not reached in finite continuous time.

Constant `y` is an exact isolated invariant. A tracer that starts on
one height forever samples the same `G(y)`. That is the structural
difference from `VerticalEnvelopeUpdraftField`.

### Forbidden general closed form

Do **not** use

    r(t) = r0 * exp(−A t)

or even

    r(t) = r0 * exp(−A_eff t)

as the general oracle. Those maps are exact only for unbounded
linear inflow `v_r = −A_eff r` (envelope `E ≡ 1`). They are the
near-axis approximation of this field, not its solution.

Do **not** introduce an exponential-integral oracle.

Do **not** duplicate §14 tests that only restate height-independent
facts without exercising `G(y)`.

### Required continuous bounds

For `A > 0`, `r0 > 0`, `G0 > 0`, and `t > 0`:

    r0 * exp(−A_eff t) < r(t) < r0

The left inequality holds because `E < 1` for all `r > 0`, so
`|v_r| < A_eff r` and radius decays more slowly than the pure
exponential. This bound also rejects a regression that omits the
Gaussian envelope.

At any `y0 ≤ y_b`, `G0 = 1` and `A_eff = A`, so the bounds reduce to
the §14 bounds. That is the plateau special case, not the only case.

At two heights with the same `r0` and `G(y1) > G(y2) > 0`, radius
must decrease faster at `y1` over the same `t`. In particular, any
plateau height (`G = 1`) decays faster than a taper height with
`G < 1`. Two plateau heights must match each other (`A_eff = A` at
both). Do not require a closed-form ratio beyond “larger `G` ⇒
faster decay,” plus the bounds above using each `G0`.

### Numerical trajectories are not the oracle

Euler and RK2 do **not** follow the continuous `r(t)` exactly.

Required tracer policy:

- compare geometry to the exact invariants (axis rest, rest when
  `G0 = 0`, ray, constant `y`);
- compare radius to the continuous bounds above, not to
  `r0 exp(−A t)` as equality;
- use a high-resolution RK2 trajectory as a numerical reference for
  `r(t)` at a chosen `y0` with `G0 > 0` (including one plateau
  height `y0 ≤ y_b` and one interior taper height);
- require that decreasing `dt` reduces error versus that reference
  for both Euler and RK2;
- require RK2 to be more accurate than Euler at the same `dt`;
- treat radius error and ray error as different diagnostics.

If `A_eff * E * dt ≥ 1`, explicit Euler can step across the axis and
flip the offset sign. That is a numerical overshoot, not physical
outflow. Acceptance tests must choose `dt` with `A dt ≪ 1`.

A correct field formula does not make Euler exact in radius.

---

## 26. Invariants

For a valid `LowerRadialInflowField`:

1. **Axis rest**  
   At `(centerX, y, centerZ)` for any finite `y`:

       V = (0, 0, 0)

2. **Purely horizontal**  
   `Vy = 0` at every sample point.

3. **Radial inward direction where G > 0**  
   For `r > 0` and `y < topHeight`:

       dx * Vx + dz * Vz < 0

4. **Zero at and above the top**  
   For any finite `(x, z)` and `y ≥ topHeight`:

       V = (0, 0, 0)

5. **Expected boundary / plateau values**  
   `G(y) = 1` for every `y ≤ baseHeight`. `G(topHeight) = 0`.  
   For every `y ≤ baseHeight` and equal radial parameters, the
   sample matches `RadialInflowField`.

6. **No tangential component**  
   The horizontal 2D cross product vanishes at every sample:

       dx * Vz − dz * Vx = 0

   including on the axis and at and above `topHeight`.

7. **Axisymmetry of speed at fixed y**  
   Equal `r` and equal `y` ⇒ equal `|V| = A * r * E * G(y)`.

8. **Lower-level vertical localization / monotonicity**  
   `G = 1` (constant) on `(-∞, baseHeight]`. On
   `[baseHeight, topHeight]`, `G` is monotonically non-increasing.
   For `r > 0` and `y1 < y2`:

       |V|(x, y1, z) ≥ |V|(x, y2, z)

   with strict inequality whenever `G(y1) > G(y2)`. Two plateau
   heights have equal `|V|`.

9. **Peak speed**  
   At any `y ≤ baseHeight` and `r = σ`, `|V| = A σ / √e`.

10. **Continuity class**  
    Velocity is continuous in `y`. `G` is `C^1` at `baseHeight` and
    `C^0` but not `C^1` at `topHeight`.

11. **Cardinal directions**  
    For `A > 0` and `G > 0`, the table in §18 holds.

12. **Far-field formula match**  
    At large `r` and `G > 0`, `V` must match
    `Vx = −A E dx G`, `Vz = −A E dz G` within floating-point
    tolerance — not an ad hoc “approximately zero” check.

13. **Steady**  
    Fixed position, varying `time` ⇒ identical `V`.

14. **No input mutation**  
    Caller `position` is unchanged after `sample`.

15. **Fresh output**  
    Each `sample` returns a new plain `Vec3`.

---

## 27. Ownership and mutability

`sample` must:

- not mutate the caller-owned input `position`;
- return a **new** plain `Vec3` object on every call.

It must not return an internal reusable buffer.

---

## 28. Testing policy

Prefer contract tests over implementation trivia.

Do **not** re-prove generic Euler / RK2 integrator tests.
Do **not** duplicate the entire §14 suite without `G(y)`.

### Unit / sampling (required)

- formula match on the plateau `y ≤ baseHeight` (equals
  `RadialInflowField` for equal radial parameters), at one interior
  taper `y`, and at large `r`;
- axis sample equals `(0, 0, 0)` on the plateau, in the taper, and
  at `y_t`;
- `Vy` identically zero on sampled points;
- inward `dx Vx + dz Vz < 0` for `r > 0` where `G > 0`;
- tangency-free / radial `dx Vz − dz Vx = 0`;
- cardinal sign examples for `A > 0` at a plateau height and at one
  taper height;
- `G = 1` for `y ≤ baseHeight`; `G(topHeight) = 0`;
- zero velocity for `y ≥ topHeight`;
- sampling at and above `topHeight` is valid (not an error);
- sampling below `baseHeight` is valid and equals the plateau
  `G = 1` field, not rest;
- two plateau heights with the same `(x, z)` yield identical `V`;
- monotonic envelope: same `(x, z)` with `r > 0`, increasing `y`
  from plateau through taper does not increase `|V|`, and decreases
  it once `y > baseHeight`;
- continuity at the taper start: a sample just below `y_b` equals
  the sample at `y_b` (full §14 velocity), not zero;
- radial peak: at a plateau height, `|V|(r=σ) > |V|` at a smaller
  and a larger nearby radius, consistent with
  `|v_r|_max = A σ / √e`;
- axisymmetry at fixed `y`;
- steadiness;
- no input mutation and a new `Vec3` per sample;
- parameter validation failures for non-finite values, `sigma ≤ 0`,
  `radialStrainRate ≤ 0`, and `topHeight ≤ baseHeight`;
- construction accepted for `baseHeight < 0`;
- construction rejected for `radialStrainRate = 0` and
  `radialStrainRate < 0`.

A dedicated test **may** check the analytic `div_h` identity at a
few points (axis at `y_b`, `r = σ √2`, far tail) without making
`div_h < 0` everywhere a correctness rule.

Do not require `G = 1` at `y_mid`.

### Isolated tracer acceptance (required)

- axis tracer remains at rest;
- tracer at `topHeight` or above remains at rest;
- off-axis tracer on the plateau `y0 ≤ baseHeight` (and one interior
  taper height with `0 < G0 < 1`): ray invariant, constant `y`,
  monotone decrease of `r`;
- bounds `r0 exp(−A_eff t) < r(t) < r0` with `A_eff = A G(y0)`,
  including `A_eff = A` on the plateau;
- two plateau heights with the same `r0` produce matching radius
  decay (`G = 1` at both);
- Euler and RK2 versus a high-resolution RK2 reference with `dt`
  convergence; RK2 more accurate than Euler at the same `dt`;
- two heights with the same `r0` and `G(y1) > G(y2) > 0`: radius
  decreases faster at `y1` over the same duration.

Do not require:

- ScenarioConfig integration;
- composite DEMO tests in this slice;
- rendering tests as physics acceptance;
- curl / vorticity diagnostics as this field’s contract;
- continuity-equation residual checks as a correctness failure of
  this mechanism;
- `r(t) = r0 e^{−A t}` equality as an oracle;
- exponential-integral oracles;
- isolated updraft closed-form `y(t)` mixed into these tests.

Use floating-point tolerance where IEEE-754 representation of `exp`
or `cos(π/2)` requires it. Beware signed zero (`−0`) on
axis/cardinal samples; compare with tolerance or coerce `−0` before
exact equality.

---

## 29. Module and type placement

Implementation path for the first slice:

    src/physics/storm/LowerRadialInflowField.ts

`storm/` denotes controlled storm mechanisms under explicit physics
documents. It does not imply a full storm model.

`LowerRadialInflowField` implements `VelocityField` from the core
field interface.

Suggested construction shape (documentation-level, not an API freeze
beyond the parameters above):

    new LowerRadialInflowField({
      centerX,
      centerZ,
      radialStrainRate,
      sigma,
      baseHeight,
      topHeight,
    })

Exact TypeScript surface may use a params object, but the semantic
parameters and validation rules above are mandatory.

---

## 30. ScenarioConfig, DEMO, and future wiring

This slice is isolated physics only.

Do **not** change:

- `ScenarioConfig`;
- `DEMO_SCENARIO`;
- scenario factories;
- `composeDemoTracerSimulation`;
- the current five-operand DEMO;
- renderer;
- hodograph;
- runtime controls.

Current live DEMO after this isolated physics slice remained:

    EnvironmentalWindField
    + VerticalEnvelopeUpdraftField
    + RotationField
    + RadialInflowField
    + UpperRadialOutflowField

`RadialInflowField` stayed the DEMO inflow occupant until the wiring
document said otherwise.

### Wiring (owned by rendering `08`)

DEMO replacement of the inflow occupant is specified in
`docs/rendering/08-composite-lower-radial-inflow-demo.md`.
That document must respect:

1. a dedicated `storm.lowerRadialInflow` DTO block, not extra
   bounds on `storm.radialInflow`;
2. factory `createLowerRadialInflowField` that reads only that
   block;
3. no copying of center / `sigma` / bounds from updraft, rotation,
   or outflow;
4. no coupling of `radialStrainRate` to outflow `A` or updraft `W0` /
   `H`;
5. **replacement** of the DEMO `RadialInflowField` operand, not a
   sixth additive occupant (running both would keep height-independent
   inflow aloft and defeat the localization);
6. UI copy that does not claim boundary-layer realism or
   mass-consistent low-level inflow;
7. hodograph still profile-only;
8. DEMO integration must not claim that overlap with upper outflow
   has vanished, and must not reuse `r(t) = r0 e^{−At}` as an
   oracle.

Those constraints exist so the physics type is not bent to fit a
convenient DTO. They are not an implementation checklist for this
physics slice. DEMO bounds, seeds, and ScenarioConfig occupancy
are owned by `08`, not by this document.

---

## 31. Hodograph boundary

This field does **not** participate in:

- `EnvironmentalWindProfile`;
- hodograph geometry;
- environmental shear;
- `HorizontalVorticity`;
- storm-relative wind;
- streamwise / crosswise decomposition;
- SRH.

Its horizontal convergence is a property of a synthetic storm
mechanism. It must not be mixed into environmental diagnostics.

Mutating this field’s parameters in a later ScenarioConfig must not
change hodograph points.

---

## 32. Explicit non-goals

`LowerRadialInflowField` v1 does **not** include:

- downdraft;
- continuity solver or parameter coupling to updraft / outflow;
- pressure / buoyancy;
- gust front / cold pool;
- boundary-layer thermodynamics or friction;
- storm-relative inflow layer / SRH language;
- entrainment;
- turbulence;
- tilting / stretching;
- mesocyclone dynamics;
- moving storm axis;
- cloud / anvil;
- change to `RadialInflowField`;
- change to `UpperRadialOutflowField`;
- reusable `VerticalEnvelope` wrapper;
- envelope enum / pluggable `G`;
- ScenarioConfig / DEMO wiring;
- renderer changes;
- scenario editor.

Those may be related later. They are not specified here.

---

## 33. First implementation slice

In order:

1. this document (source of truth);
2. `LowerRadialInflowField` at
   `src/physics/storm/LowerRadialInflowField.ts`;
3. unit tests
   `src/physics/storm/LowerRadialInflowField.test.ts`;
4. isolated tracer acceptance
   `src/simulation/lowerRadialInflowFieldTracer.acceptance.test.ts`;
5. `npm test`;
6. `npm run typecheck`;
7. **STOP**.

### Files to create

- `src/physics/storm/LowerRadialInflowField.ts`
- `src/physics/storm/LowerRadialInflowField.test.ts`
- `src/simulation/lowerRadialInflowFieldTracer.acceptance.test.ts`

### Files that must be left unchanged

- `src/physics/storm/RadialInflowField.ts` and its tests;
- `src/physics/storm/UpperRadialOutflowField.ts` formulas and tests;
- `src/physics/storm/VerticalEnvelopeUpdraftField.ts`;
- `src/physics/storm/UpdraftField.ts`;
- `src/physics/storm/RotationField.ts`;
- `src/core/fields/VelocityField.ts`;
- `src/core/fields/CompositeVelocityField.ts`;
- `src/scenario/**`;
- `src/app/**`;
- `src/rendering/**`;
- `src/ui/**`;
- `docs/architecture/**`;
- `docs/rendering/**`.

A later implementation must not start DEMO rewiring, a continuity
solver, downdraft, or boundary-layer physics because the unit tests
passed.

---

## 34. Lock-in summary

```text
canonical field name:    LowerRadialInflowField
relationship to RadialInflowField:
                         new type; old type stays the canonical
                         height-independent inward primitive
radial profile:          v_r(r) = −A r exp(−r² / (2 σ²))
                         Vx = −A E dx G(y),  Vz = −A E dz G(y)
                         no division by r
vertical envelope:       G(y) = 1                         y ≤ y_b
                         G(y) = cos(π (y − y_b) / (2 H))  y_b < y < y_t
                         G(y) = 0                         y ≥ y_t
                         lower plateau + quarter-cosine taper
strength parameter:      radialStrainRate = A > 0  (1/s)
                         same meaning as RadialInflowField
center:                  (centerX, centerZ); no shared storm.center
sigma:                   Gaussian horizontal scale; peak |v_r| at r=σ
vertical parameters:     baseHeight = taper-start height (G=1 at and below)
                         topHeight  = G=0 at and above
                         topHeight > baseHeight
                         names kept; not taperStartHeight
velocity formula:        Vx = −A E dx G(y)
                         Vy = 0
                         Vz = −A E dz G(y)
peak speed:              |V_h|_max = A σ / √e
                         at r = σ and every y ≤ baseHeight (G = 1)
behavior below taper start:
                         y ≤ baseHeight → full §14 inflow (G = 1)
                         C¹ at baseHeight; no velocity jump
behavior above top:      y ≥ topHeight → V = (0, 0, 0)
                         C⁰ at topHeight; G' jumps, not smoothed
div_h:                   −A E G(y) (2 − r² / σ²)
                         axis on plateau: div_h = −2A
continuity claim:        (1) locally convergent in the core: yes
                         (2) conceptual lower inflow: yes, prescribed
                         (3) mass-consistent / closes continuity: no
```

---

## 35. Core lesson

`LowerRadialInflowField` v1 is a controlled Gaussian-modulated
linear inflow at full strength on a lower plateau, then tapered to
zero at a chosen top:

    E(r) = exp( −r² / (2 σ²) )
    G(y) = 1
           for y ≤ baseHeight
    G(y) = cos(π (y − baseHeight) / (2 (topHeight − baseHeight)))
           for baseHeight < y < topHeight
    G(y) = 0
           for y ≥ topHeight
    Vx   = −A E dx G
    Vy   = 0
    Vz   = −A E dz G

`A = radialStrainRate > 0` is the near-axis radial strain on the
plateau. It is not diagnostic convergence; on the axis for
`y ≤ baseHeight`, `div_h = −2A`.

Isolated tracers stay at constant `y`, remain on their horizontal
ray, and decrease `r` when `G(y0) > 0`. They do not follow
`r = r0 e^{−A t}`. They forever sample one frozen `G(y0)`.

The field exists so the project can pull tracers toward a documented
center **strongly at low levels and not at all above a chosen top**,
with a transparent formula, no division by `r`, no velocity jump at
the taper start, and no claim of boundary-layer or mass-consistent
inflow physics.

`RadialInflowField` remains the height-independent primitive. DEMO
wiring is specified in
`docs/rendering/08-composite-lower-radial-inflow-demo.md`.
