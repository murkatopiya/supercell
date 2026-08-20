# Vertical Rotation Envelope

**Status:** isolated `VerticalEnvelopeRotationField` is implemented.
Live DEMO rotation occupant is this type, with DEMO bounds owned by
`docs/rendering/12-composite-vertical-envelope-rotation-demo.md`.
`RotationField` remains the isolated height-independent primitive.
Diagnostic world-vertical vorticity of this field's curl
(Candidate A; not a `curl()` API):
`docs/physics/23-diagnostic-vertical-vorticity.md`.
Architecture of that diagnostic (not this field's velocity API):
`docs/architecture/28-diagnostic-vertical-vorticity-architecture.md`.
Candidate A Slice 1 is implemented on this type:
`worldVerticalVorticity(position, time) → signed ω_y` [s⁻¹].
`DiagnosticVerticalVorticity` (Slice 2 owner) is implemented.
Scientific DEMO validation:
`docs/research/2026-08-20-candidate-a-demo-field-validation.md`.
This file remains the velocity-field SoT. `23` re-derives
`ω_y^Ω` as a diagnostic contract; it does not replace §18.

## 1. Purpose

This document defines the first height-localized circulation
mechanism in Supercell Explorer: `VerticalEnvelopeRotationField` v1.

It answers:

    Given the existing Gaussian-modulated solid-body tangential
    profile, a chosen vertical interval, and a canonical vertical
    envelope, what world-space horizontal tangential velocity does a
    passive tracer sample?

v1 is separable:

    v_theta(r, y) = Ω * r * E_r(r) * G(y)

where `E_r` is the existing radial Gaussian from
`docs/physics/13-rotation-field.md`, and `G` is a bounded vertical
envelope with `0 ≤ G(y) ≤ 1`.

`VerticalEnvelopeRotationField` is a mathematically transparent,
steady, axisymmetric, purely horizontal velocity field about a fixed
vertical axis, multiplied by a compact vertical window. It is the
first **rotation** mechanism whose tangential velocity depends on
height.

It is **not**:

- a mesocyclone;
- a tornado;
- tilted or stretched environmental vorticity
  (diagnostic T1 does not use this field's curl:
  `docs/physics/22-diagnostic-tilting-tendency.md`;
  current `ω_y` of this prescribed `V` is derived in
  `docs/physics/23-diagnostic-vertical-vorticity.md`);
- a Rankine vortex;
- a pressure-perturbation or mass-continuity solution;
- a dual-mode of `RotationField`;
- a claim that live DEMO bounds equal this type’s lids.

The `storm/` module path means: controlled storm mechanism. It does
**not** mean full or realistic supercell physics.

---

## 2. Relationship to existing foundations

`docs/physics/02-velocity-field-basics.md` requires:

- mechanisms to be tested in isolation before documented composition;
- smooth synthetic fields where possible, with any sharp transition
  documented explicitly (§36);
- explicit formulas (no invented falloff);
- that a field must not silently return zero outside a domain unless
  that behavior is intentionally specified (§35);
- that simple vector addition not be treated as automatically
  physically valid (§32).

`docs/physics/00-coordinate-system.md` establishes:

    +X = East
    +Y = Up
    +Z = South

and the right-hand rule for positive rotation around `+Y`. The world
origin is **not** automatically the rotation axis. Altitude is world
`y`. `y = 0` is the reference ground; negative `y` is mathematically
allowed.

`docs/physics/03-numerical-integration-basics.md` already
distinguishes:

- the exact circular trajectory of a purely tangential rotation field;
- Euler’s systematic outward radius drift;
- RK2 as a more accurate but still approximate integrator.

That distinction remains mandatory. Height localization does **not**
make Euler exact.

`docs/physics/13-rotation-field.md` is the canonical
height-independent sibling: same Gaussian-linear tangential family,
same `+Y` sign convention, no vertical envelope. Height independence
is a documented v1 limitation of that type, not a bug. This document
does **not** evolve `RotationField` into a height-dependent API.
See §3.

`docs/physics/15-vertical-updraft-envelope.md` is the first compact
vertical envelope in the project (`F(y)` on `[baseHeight, topHeight]`).
This field uses a compact vertical window for a **horizontal
tangential** velocity. Envelope comparison is independent (§9). The
half-sine is not copied merely because the updraft uses it.

`docs/physics/16-upper-radial-outflow-field.md` is the outward radial
sibling with a compact half-sine window. This field is purely
tangential, not radial. It does not read outflow bounds.

`docs/physics/17-lower-radial-inflow-field.md` is the inward radial
sibling with a **lower plateau**. That plateau exists so `G = 1` at
the taper start and below, avoiding a velocity jump. This field’s
job is a finite circulation layer that is **off** below and above
the lids. It must not inherit the inflow plateau. See §10.

`docs/physics/06-horizontal-vorticity.md` defines environmental
`HorizontalVorticity` from vertical shear of a horizontally
homogeneous profile. The curl of this field is a different object.
See §18.

`docs/physics/12-composite-velocity-field.md` already authorizes
generic world-space addition. Composition of this field with the
current DEMO operands is **out of scope** for this document’s first
implementation slice.

`docs/rendering/10-deep-storm-envelope-scaling.md` recorded the live
DEMO choice to keep height-independent `RotationField` as a
documented tube, and required a **new type** when localization is
commanded. This is that type. It does **not** own DEMO lid numbers.

`docs/architecture/01-scenario-config.md` must not gain rotation
envelope fields in this physics slice.

Architectural role:

    VerticalEnvelopeRotationField implements VelocityField
        ↓
    sample(position, time) → world Vec3

First implementation slice:

    isolated VerticalEnvelopeRotationField
      + sampling tests
      + isolated tracer acceptance

---

## 3. Architectural decision

The current DEMO limitation is:

    RotationField:  V_rotation = V_rotation(r)

so the same `(x, z)` yields the same tangential velocity at every
finite `y`, including `y < 0` and `y` above the updraft and outflow
lids.

Three ways exist to introduce `V_rotation(r, y)`.

### 3.1 Option A — evolve `RotationField`

Add `baseHeight` / `topHeight` (and a `G(y)`) to the existing type.

Consequences:

- every current unit test of height independence becomes false, or
  must be rewritten around a dual-mode API;
- the live DEMO consumes this type today; evolving it would either
  change DEMO behavior in this physics slice (forbidden) or require
  a hidden “no envelope” mode;
- `13` explicitly locked height independence and listed vertical
  envelope as a non-goal of that primitive;
- the project already rejected dual-mode on `RadialInflowField` when
  outflow and lower inflow were introduced.

Rejected.

### 3.2 Option B — keep `RotationField`, add a new type

`RotationField` remains the canonical height-independent circulation
primitive. A new type owns vertical localization.

This is the same pattern as:

    UpdraftField  →  VerticalEnvelopeUpdraftField
    RadialInflowField stays height-independent
    LowerRadialInflowField / UpperRadialOutflowField are new types

Existing tests, formula, and DEMO occupant stay valid until a
**separate** wiring document replaces the occupant.

### 3.3 Option C — reusable vertical-envelope wrapper

A generic `VerticalEnvelope(field, G)` wrapping
`RotationField.sample`.

Consequences:

- the only compositor in the project is additive
  `CompositeVelocityField`; a multiplicative wrapper is a new
  composition kind;
- `G(y)` families already differ across updraft, outflow, and inflow.
  A shared envelope abstraction would become a strategy enum;
- independent validation ownership is less clear;
- the duplicated offset formula is a few lines.

Premature abstraction. Rejected.

### 3.4 Canonical path

**Option B is canonical.**

    RotationField                      height-independent primitive
    VerticalEnvelopeRotationField      new height-localized type

Do **not**:

- subclass one type from the other;
- add optional bounds to `RotationField`;
- introduce a generic `VerticalEnvelope` wrapper;
- multiply `RotationField.sample` by `G(y)` as the production type;
- leave the choice to a later wiring slice.

v1 does **not** leave this architecture as an implementation option.

---

## 4. Physical problem

### 4.1 What the current rotation does

`RotationField` specifies only the **horizontal** structure of
circulation:

    v_theta(r) = Ω * r * exp(−r² / (2 σ²))
    Vx = Ω E dz
    Vy = 0
    Vz = −Ω E dx

Consequences:

- the same tangential speed exists at `y = 0` and at `y → ±∞`;
- `∂Vx/∂y = ∂Vz/∂y = 0`;
- there is no rotation base, no internal maximum in height, and no
  top;
- in the current five-operand DEMO the field still acts above the
  updraft lid, above outflow `9000 m`, and for `y < 0`.

That is a legitimate laboratory primitive. It is not a vertical
circulation layer.

### 4.2 Required new capability

A height-localized rotation must allow:

    v_theta = v_theta(r, y)

so that tangential velocity can:

- be identically zero below a chosen lower lid;
- strengthen over some height range;
- possess an internal maximum;
- weaken toward a chosen upper lid;
- be identically zero above that lid.

v1 realizes this as a **separable** product, not as a fully general
`v_theta(r, y)`:

    v_theta(r, y) = Ω * r * E_r(r) * G(y)

`E_r` keeps the existing radial responsibility. `G` is the new
vertical responsibility.

Separability is a modeling choice for v1, not a claim that real
mesocyclones are separable.

### 4.3 Context from the current laboratory (not field parameters)

After `docs/rendering/09-deep-environmental-profile-demo.md`,
`10-deep-storm-envelope-scaling.md`, and
`11-deep-storm-tracer-view.md`, live DEMO geometry is:

```text
environment explicit support   0–12000 m
updraft                        0–8000 m, peak 4000 m
lower inflow                   plateau ≤ 1500 m, zero ≥ 4500 m
upper outflow                  5000–9000 m, peak 7000 m
rotation occupant              height-independent RotationField
diagnostic seeds               y = 1000 m
```

Those numbers motivate **why** a compact rotation layer exists. They
do **not** become `baseHeight` / `topHeight` of this type. DEMO
placement is a later wiring document.

### 4.4 What this slice does not claim

Introducing `G(y)` does **not** automatically mean:

- the field is a mesocyclone;
- environmental horizontal vorticity has been tilted;
- vertical vorticity has been stretched by the updraft;
- the current DEMO occupant should change in this physics slice;
- continuity is closer to closed.

Those are later questions. This document only defines the first
bounded vertical rotation envelope.

---

## 5. Type name

Candidates:

| Name | Verdict |
| --- | --- |
| `RotationField` with optional bounds | Rejected: dual-mode (§3.1) |
| `HeightLocalizedRotationField` | Accurate; weaker parallel to `VerticalEnvelopeUpdraftField` |
| `UpperRotationField` / `LowerRotationField` | Rejected: rotation is not an upper or lower radial mechanism by type |
| `VerticalEnvelopeCirculationField` | Rejected: the project’s mechanism name is rotation, not circulation |
| `LayeredRotationField` | Rejected: generic; does not say compact lids |
| `VerticalEnvelopeRotationField` | **Canonical** |

**Canonical type name:**

    VerticalEnvelopeRotationField

Reasons:

1. Parallel to `VerticalEnvelopeUpdraftField`: same compact
   mid-peaking envelope family, new type, primitive kept.
2. `17` rejected `VerticalEnvelopeRadialInflowField` because that
   inflow envelope is a plateau, not a half-sine. Here the envelope
   **is** that compact mid-peaking window, so the name does not lie.
3. “Vertical envelope” means a window in world `+Y`, not a vertical
   velocity. The field remains `Vy ≡ 0`.
4. Does not promise mesocyclone, tilt, or DEMO lid numbers.

One name. No aliases. No `RotationField` overload.

Filename:

    docs/physics/18-vertical-rotation-envelope.md

---

## 6. What VerticalEnvelopeRotationField is

`VerticalEnvelopeRotationField` is a world-space `VelocityField`
whose only nonzero components are horizontal and tangent to circles
about a fixed vertical axis, scaled by a compact vertical envelope.

Conceptually:

    V(x, y, z, t) = (Vx(r, y), 0, Vz(r, y))

where `r` is horizontal radial distance from the axis in the world
`X`–`Z` plane, the horizontal vector is purely tangential, and `y`
enters only through a scalar envelope `G(y)`.

Properties of v1:

- Gaussian-modulated solid-body radial profile (unchanged from `13`);
- compact half-sine vertical envelope on `[baseHeight, topHeight]`;
- steady (independent of `time`);
- height-dependent only through `G`;
- axisymmetric about the vertical axis through the center;
- unbounded analytic evaluation (every finite world point is
  sampleable; outside the layer the formula returns exact zero);
- velocity continuous (`C^0`) everywhere; not `C^1` at the lids.

---

## 7. Center and horizontal radius

The rotation axis is fixed by a horizontal center in world
coordinates:

    center = (centerX, centerZ)

Units: meters.

The center does **not** include a `centerY`. Height localization is
an envelope on the sample `y`, not a vertical center of a blob.

Define:

    dx = x − centerX
    dz = z − centerZ

    r² = dx² + dz²
    r  = sqrt(r²) ≥ 0

World `Y` does not enter `r`.

---

## 8. Radial geometry

Keep the `13` profile. Do **not** introduce Rankine, Lamb–Oseen, or
a new radial family in this slice.

    E_r(r) = exp( −r² / (2 σ²) )

    v_theta(r, y) = Ω * r * E_r(r) * G(y)

World components use the same angular / cross-product form as `13`,
multiplied by `G(y)`:

    Vx = Ω * E_r * G(y) * dz
    Vy = 0
    Vz = −Ω * E_r * G(y) * dx

Implementations must **not** normalize `(dx, dz)` and divide by `r`.
On the axis (`r = 0`):

    dx = 0, dz = 0  ⇒  V = (0, 0, 0)

with no `0/0`, at every height, including inside the layer.

Derived radial properties, not additional API, at `G = 1`:

- `v_theta(0, y) = 0`;
- peak `|v_theta|` occurs at `r = σ`:

      |v_theta|_max = |Ω| * σ / sqrt(e)

- as `r → ∞`, `v_theta → 0`;
- shielded vortex: vertical vorticity of the `G = 1` profile changes
  sign at `r = σ √2`; net circulation at infinity is zero.

At general height the same radial identities hold with `Ω` replaced
by `Ω G(y)`.

---

## 9. Vertical envelope comparison

v1 needs a scalar window `G(y)` such that circulation is off outside
a chosen height band and reaches a documented maximum inside it.

This is **not** the same design problem as lower inflow.

For `LowerRadialInflowField`, the story is full strength at low
levels, then weaken, then stop. A mid-peaking half-sine would be
the wrong shape (zero at the ground lid).

For rotation, the story is a **finite column of circulation**: off
below, on in a band, off above. Isolated tracers of this field have
`Vy = 0`, so `y` is frozen and `G(y0)` is a constant scale along a
trajectory. Envelope smoothness does **not** affect the isolated
circular ODE, unlike the updraft case where `F(y)` is re-sampled as
the particle rises.

Let:

    y_b = baseHeight
    y_t = topHeight
    H   = y_t − y_b > 0
    ξ   = (y − y_b) / H
    y_mid = (y_b + y_t) / 2

### 9.1 Candidate A — half-sine on a finite interval

    G(y) = sin(π ξ)     for y_b ≤ y ≤ y_t
    G(y) = 0            otherwise

| Property | Value |
| --- | --- |
| Domain of nonzero `G` | closed interval `[y_b, y_t]` |
| `G(y_b)`, `G(y_t)` | `0` |
| Maximum | `G = 1` at `y_mid` |
| Smoothness of `G` | `C^0`; not `C^1` at the lids |
| Interior derivative | `G'(y) = (π/H) cos(π ξ)` |
| One-sided `G'` at `y_b` | interior `+π/H`, exterior `0` |
| One-sided `G'` at `y_t` | interior `−π/H`, exterior `0` |
| New parameters | 2 |
| Hidden normalization | none; `max G = 1` by construction |
| Outside the interval | exact `0`, no Gaussian tail |
| Isolated tracer ODE | `G(y0)` constant; circular motion as in `13` |
| Velocity at lids | `V = 0` (no jump) |

The velocity field is continuous. Vertical derivatives of `Vx`, `Vz`
jump at the lids. That is an explicit, documented transition
(`02` §36).

### 9.2 Candidate B — Gaussian in height

    G(y) = exp( −(y − y_peak)² / (2 σ_y²) )

Never exactly zero. A weak tail exists at every height, including
underground and above any conceptual storm top. That is the height
analogue of the current tube. No chosen base/top with `G = 0`.
Rejected for v1.

### 9.3 Candidate C — squared sine / Hann bump

    G(y) = sin²(π ξ)     for y_b ≤ y ≤ y_t
    G(y) = 0             otherwise

Compact, `max G = 1` at `y_mid`, `C^1` at the lids (`G' = 0` from
both sides).

For a **horizontal** field, `∂Vh/∂y` is horizontal vorticity.
Hann would make that vorticity match zero at the lids (`C^0` in
`ω_h` as well as in `V`). Half-sine leaves a jump in `ω_h`.

That is a real smoothness advantage, not a cosmetic one.

It is **not** canonical for v1:

- extra trigonometric factor;
- quieter near the lids;
- isolated tracers do not use `G'` at all;
- the project’s other compact mid-peaking windows (`15`, `16`) are
  half-sine; a third window should not silently switch family.

If lid shear of `V_h` later becomes a documented teaching artifact,
reopen this choice explicitly. Do not treat Hann as a silent
implementation upgrade.

### 9.4 Candidate D — lower plateau + upper taper

    G = 1  for y ≤ y_b
    taper  y_b → y_t
    G = 0  for y ≥ y_t

This is the `17` family.

It would keep full-strength rotation for all `y ≤ y_b`, including
`y → −∞`. That recreates the underground tube that this type exists
to stop. The harmful leak for rotation is **both** aloft **and**
below the layer, not only aloft.

Wrong job. Rejected.

### 9.5 Candidate E — compact-zero-below with `G(y_b) = 1`

    G = 0  for y < y_b
    G(y_b) = 1
    then taper or plateau to `y_t`

This is the withdrawn `17` draft. Continuity of `G` plus `G = 0`
strictly below `y_b` plus `G(y_b) = 1` is impossible. The result is
a **jump in horizontal velocity** at `y_b`.

Isolated tracers never cross it (`Vy = 0`). A later composite tracer
lifted by an updraft would. Forbidden. See §10.

### 9.6 Candidate F — interior plateau (rise / hold / fall)

    G = 0 below y_b
    rise on [y_b, y1]
    G = 1 on [y1, y2]
    fall on [y2, y_t]
    G = 0 above y_t

A slab of constant peak rotation. Four vertical parameters (or an
extra width). Peak is a band, not a height. Continuity is possible
if the rise starts at `G(y_b) = 0` and the fall ends at `G(y_t) = 0`.

Real advantage: a depth of `G = 1` rather than a single mid-level
maximum. Cost: extra bounds, extra lid cases, no current kinematic
reason to prefer a slab over a first-mode bump.

Rejected for v1 as non-minimal. Reopen only if a later SoT needs a
constant-`Ω` depth as a teaching object.

### 9.7 Candidate G — `C^∞` compact bump

    G(y) = exp(1 − 1/(1 − η²))    for `|η| < 1`

All derivatives vanish at the edges. Formula and `G'` are
inconvenient to test. Overkill. Rejected.

### 9.8 Canonical vertical envelope

**Candidate A, the half-sine on `[baseHeight, topHeight]`, is
canonical.**

Reasons that are **not** “the updraft already uses it”:

1. Compact support with exact zeros — required so the field is off
   below **and** above a chosen band.
2. `G = 0` at both lids ⇒ horizontal velocity is continuous (the
   `17` jump does not appear).
3. `max G = 1` with no hidden scale, so `|v_theta|_max` of `13`
   remains the true peak at `y_mid`.
4. Only two vertical parameters; peak height is derived (`y_mid`).
5. Elementary `G` and `G'`.
6. Isolated circular ODE is `13` with `Ω_eff = Ω G(y0)`.

The half-sine is a compact unit window. It is **not** a claim that
tangential velocity is the first kinematic mode of a lid with
`w = 0`, and **not** a mesocyclone depth.

Rejected, with the reason that would reopen the choice:

- **B** — never off; recreates the tube;
- **C** — smoother lid `ω_h`; not needed for v1 isolated contract;
- **D** — underground plateau; wrong leak;
- **E** — velocity jump at the lower lid;
- **F** — extra parameters; no v1 job for a `G = 1` slab;
- **G** — testing cost.

v1 does **not** leave the envelope as an implementation option.

---

## 10. Lower lid, plateau, and the inflow discontinuity

This section is the rotation-specific boundary decision.

### 10.1 Must the layer be zero below `baseHeight`?

Yes, for this type.

The problem statement is a finite circulation layer. Off below the
lower lid is part of that statement. A downward plateau would leave
the underground tube in place (`10` §10, audit Y1 + Y5 + Y20).

`baseHeight` here is a **lower lid with `G = 0`**, the same semantic
as `15` / `16`, **not** the plateau top of `17`.

### 10.2 Is a downward plateau admissible?

Admissible as a *different* envelope family on a *different* type.
Not admissible on `VerticalEnvelopeRotationField` v1.

If a later laboratory wants surface-intensified rotation that does
not weaken below a taper start, that is a new decision, likely tied
to a ground plane. It is not this slice.

### 10.3 Does compact zero below recreate the `17` velocity jump?

Only if `G(baseHeight) = 1` while `G = 0` for `y < baseHeight`.

Half-sine has `G(baseHeight) = 0 = G(topHeight)`. Horizontal
velocity approaches `0` from inside and is `0` outside. There is
**no jump in `V`**.

The incompatibility that `17` hit was:

    continuity of G
    + G = 0 strictly below y_b
    + G(y_b) = 1
    ⇒  impossible

This field does **not** ask for `G(y_b) = 1`. Compact support both
ways is compatible with continuous velocity.

### 10.4 Can velocity be continuous at both lids?

Yes. With candidate A:

    G(y_b) = G(y_t) = 0
    G continuous everywhere
    V continuous everywhere

`G'` jumps at both lids. Velocity does not. Vorticity involving
`G'` is not `C^0` at the lids (§18).

### 10.5 Where is `G = 1`?

At the single height

    y_mid = (baseHeight + topHeight) / 2

not on a plateau, not at the lids, not at `y = 0` unless the caller
chooses bounds that put `y_mid` there.

### 10.6 Is symmetry in height required?

`G` is even about `y_mid` by construction of the half-sine:

    G(y_mid + δ) = G(y_mid − δ)

for points that remain inside `[y_b, y_t]`.

That is envelope mathematics, not a requirement that DEMO `y_mid`
equal the updraft peak or any environmental knot. DEMO wiring must
not treat this symmetry as a coupling invariant.

---

## 11. Canonical vertical envelope

### 11.1 Formula

    y_b = baseHeight
    y_t = topHeight
    H   = y_t − y_b
    ξ(y) = (y − y_b) / H
    y_mid = (y_b + y_t) / 2

    G(y) = sin(π ξ(y))     if y_b ≤ y ≤ y_t
    G(y) = 0               if y < y_b or y > y_t

At the closed endpoints `sin(0) = sin(π) = 0`, so `G(y_b) = G(y_t)
= 0` either as interior limits or as the exterior zero.

### 11.2 Derivative

Interior (`y_b < y < y_t`):

    G'(y) = (π / H) cos(π ξ(y))

Exterior (`y < y_b` or `y > y_t`):

    G'(y) = 0

One-sided limits at the lids:

```text
y = y_b:   G' interior = +π/H    G' exterior = 0
y = y_t:   G' interior = −π/H    G' exterior = 0
y = y_mid: G' = 0
```

Do not invent an epsilon average at the lids. Tests of `G'` or
`∂Vx/∂y` at a lid must use strictly interior points, or must state
one-sided limits explicitly.

### 11.3 Boundary values

| `y` | `G` | `V` |
| --- | --- | --- |
| `y < baseHeight` | `0` | `(0, 0, 0)` |
| `y = baseHeight` | `0` | `(0, 0, 0)` |
| `baseHeight < y < topHeight` | `sin(π ξ) ∈ (0, 1]` | tangential, scaled by `G` |
| `y = y_mid` | `1` | identical to `RotationField` with the same `Ω`, `σ`, center |
| `y = topHeight` | `0` | `(0, 0, 0)` |
| `y > topHeight` | `0` | `(0, 0, 0)` |

### 11.4 Continuity class

```text
G                 C^0 everywhere; not C^1 at y_b, y_t
V                 C^0 everywhere; not C^1 at y_b, y_t
ω involving G'    jumps at the lids
```

Sampling outside `[baseHeight, topHeight]` is **not** an error. It
returns `V = (0, 0, 0)`.

Reason: `VelocityField` operands must be freely composable.

`baseHeight` may be negative. Ground `y = 0` is not an implicit lid.

---

## 12. Full world velocity

    E = exp( −r² / (2 σ²) )
    G = G(y)                 // §11.1

    Vx = Ω * E * G * dz
    Vy = 0
    Vz = −Ω * E * G * dx

`sample` returns world `Vec3`. It does **not**:

- return `AtmosphericVelocity`;
- convert through an environmental profile;
- subtract storm motion;
- depend on hodograph / shear / helicity diagnostics.

Do not name world components `u`, `v`, `w`.

`time` is ignored:

    sample(P, t1) = sample(P, t2)

---

## 13. Peak, cardinals, axis, tangency, localization

### 13.1 Peak tangential speed

`max G = 1` by construction, attained only at `y_mid`.

At `y = y_mid` and `r = σ`:

    |v_theta|_max = |Ω| * σ / sqrt(e)

This is the same peak as `RotationField`. There is **no** hidden
normalization of `G`. `Ω` keeps the `13` on-axis meaning of
effective angular velocity at envelope maximum.

At other heights:

    |v_theta|_peak(y) = |Ω| * σ / sqrt(e) * G(y)

### 13.2 Sign convention

Identical to `13`:

    Ω > 0  →  right-hand rule around world +Y

`Ω < 0` is the same mechanism with opposite sense. `Ω = 0` is the
zero field.

Do not describe the API as cyclonic or anticyclonic.

### 13.3 Cardinal examples

For `Ω > 0`, `G > 0`, a point at horizontal distance `d > 0` from
the center, and

    E = exp( −d² / (2 σ²) )

| Location relative to center | `(dx, dz)` | World velocity |
| --- | --- | --- |
| East | `(+d, 0)` | `(0, 0, −Ω E G d)` northward (`−Z`) |
| West | `(−d, 0)` | `(0, 0, +Ω E G d)` southward (`+Z`) |
| North (world `−Z`) | `(0, −d)` | `(−Ω E G d, 0, 0)` westward (`−X`) |
| South (world `+Z`) | `(0, +d)` | `(+Ω E G d, 0, 0)` eastward (`+X`) |

On a north-up map this is east → north → west → south → east.
`Ω → −Ω` reverses every vector. If `G = 0`, every entry is zero.

### 13.4 Axis behavior

At `(centerX, y, centerZ)` for every finite `y`:

    V = (0, 0, 0)

### 13.5 Tangency

    dx * Vx + dz * Vz = 0

including on the axis and outside the layer, where both sides are
zero.

### 13.6 Height localization

Fixed `(x, z)`, varying `y`:

- `V` is **not** independent of `y`;
- `|V|(y)` follows `|G(y)|`;
- outside `[y_b, y_t]`, `V = 0`.

This invariant **replaces** `13` §17.8 height independence.

---

## 14. Parameters

| Parameter | Symbol | Meaning | Units | Constraint |
| --- | --- | --- | --- | --- |
| `centerX` | — | world east coordinate of axis | m | finite |
| `centerZ` | — | world south coordinate of axis | m | finite |
| `angularVelocity` | `Ω` | angular velocity about `+Y` on the axis at `G = 1`; sign sets sense | rad/s | finite; `0` and negatives allowed |
| `sigma` | `σ` | Gaussian horizontal scale in `exp(−r²/(2σ²))` | m | finite and `> 0` |
| `baseHeight` | `y_b` | world `y` of the lower lid (`G = 0`) | m | finite |
| `topHeight` | `y_t` | world `y` of the upper lid (`G = 0`) | m | finite and `> baseHeight` |

`centerX`, `centerZ`, `angularVelocity`, and `sigma` have the **same
meaning** as on `RotationField`.

`baseHeight` / `topHeight` have the **same lid meaning** as on
`VerticalEnvelopeUpdraftField` and `UpperRadialOutflowField`,
**not** the plateau-top meaning of `LowerRadialInflowField`.

Parameters intentionally absent from v1:

- `centerY`;
- `peakHeight` as a free parameter (derived: `y_mid`);
- `peakTangentialVelocity` (recoverable from `Ω` and `σ`);
- envelope selector / `G` enum;
- `sigmaY`;
- time dependence;
- moving or tilted axis;
- radial inflow / outflow;
- mass-continuity correction;
- coupling to updraft or environmental vorticity;
- ScenarioConfig wiring;
- composition helpers;
- a `curl()` / `divergence()` API.

---

## 15. Validation policy

Validation belongs at the owning construction boundary of
`VerticalEnvelopeRotationField`.

Reject when:

- any parameter is non-finite;
- `sigma ≤ 0`;
- `topHeight ≤ baseHeight`.

Do **not** reject:

- `angularVelocity = 0`;
- `angularVelocity < 0`;
- `baseHeight < 0`;
- `baseHeight = 0`;
- large `H`;
- small but positive `H`;
- centers other than the world origin.

Sampling does not re-validate. Every finite world position is
evaluable.

---

## 16. Ownership and mutability

`sample` must:

- not mutate the caller-owned input `position`;
- return a **new** plain `Vec3` object on every call.

It must not return an internal reusable buffer.

---

## 17. Domain policy

v1 is defined at every finite world position.

There is no horizontal domain wall. Far from the axis, decay is
still only the radial Gaussian, and only where `G > 0`.

No hidden epsilon. Comparisons are ordinary IEEE-754 inequalities
against the stored bounds.

---

## 18. Divergence and curl

These identities are documentation of the prescribed field. They are
**not** a production diagnostic API and **not** environmental
`HorizontalVorticity`.

### 18.1 Divergence

`Vy ≡ 0` and the horizontal part is purely azimuthal with the same
radial structure as `13`, scaled by `G(y)` which does not depend on
`x` or `z`.

    ∇ · V = 0

identically, at every finite point, including the lids and outside
the layer.

Height localization does **not** create a continuity residual. That
is different from `VerticalEnvelopeUpdraftField` (`∂Vy/∂y ≠ 0`) and
from the radial inflow/outflow fields (`div_h ≠ 0`).

Do not treat `div = 0` as mass-consistent storm physics. It is a
property of this isolated operand.

### 18.2 Vertical vorticity

Inside the layer, with `E = exp(−r²/(2σ²))`:

    ω_y = 2 Ω G(y) E (1 − r² / (2 σ²))

This is the `13` shielded-vortex `ω_y` multiplied by `G`. It changes
sign at `r = σ √2` when `G ≠ 0`. Outside the layer, `ω_y = 0`.

This identity is **not** a `curl()` API and **not** environmental
`HorizontalVorticity`. Candidate A physics lives in `23`;
architecture lives in
`docs/architecture/28-diagnostic-vertical-vorticity-architecture.md`.
Production analytic method on this type (Slice 1):

    worldVerticalVorticity(position, time) → ω_y   [s⁻¹]

Not on `VelocityField`. `DiagnosticVerticalVorticity` is the
Slice 2 total owner; it is not this velocity field. Do not
add `curl()` because this section exists.

### 18.3 Horizontal vorticity from `G'`

Because `Vh` depends on `y`:

    ω_x = −Ω G'(y) E dx
    ω_z = −Ω G'(y) E dz

so the world-horizontal vorticity vector is radial in `(x, z)`:

    (ω_x, ω_z) = −Ω G'(y) E (dx, dz)

At the lids `G'` jumps, so `ω_h` jumps even though `V` does not.

This **is not**:

- environmental `HorizontalVorticity` from `docs/physics/06`;
- tilting of streamwise vorticity;
- stretching of this `ω_y` by an updraft.

It is the curl of a prescribed `G(y)` window. Laboratory composition
with environment or updraft remains vector addition, not a vorticity
equation.

v1 must not:

- add `omegaVertical` to `HorizontalVorticity`;
- expose `curl()` on this type;
- describe DEMO rotation as tilted environmental vorticity.

### 18.4 Testing implication

Required: `∇ · V = 0` at sampled interior, lid, and exterior points
(analytic or a tight finite-difference check of the formula).

Not required for **this velocity-field SoT**: a vorticity
diagnostic type, curl snapshots, or continuity-solver residuals.
Candidate A architecture is specified in `docs/architecture/28`;
this file still does not own that API.

---

## 19. Relationship to `RotationField`

| | `RotationField` | `VerticalEnvelopeRotationField` |
| --- | --- | --- |
| Layer | `src/physics/storm/` | `src/physics/storm/` |
| Radial profile | Gaussian-linear tangential | same |
| Vertical | independent of `y` | compact half-sine `G(y)` |
| Parameters | `centerX`, `centerZ`, `Ω`, `σ` | those four plus `baseHeight`, `topHeight` |
| At `y = y_mid` | — | **identical** `V` to `RotationField` with the same four |
| Outside `[y_b, y_t]` | still full `Ω` | `V = 0` |
| Live DEMO occupant today | yes | no (until a wiring document) |

They are not the same type. Neither wraps the other.

Identity that tests may use:

    at y = y_mid, VerticalEnvelopeRotationField.sample
        = RotationField.sample
    for the same (centerX, centerZ, Ω, σ) and the same (x, z)

Do **not** implement the new type by calling `RotationField.sample`
and multiplying, if that would leak a hidden composition kind.
Duplicating the few-line formula is the v1 pattern of `15`.

---

## 20. Explicit scientific boundary

`VerticalEnvelopeRotationField` is still:

    prescribed synthetic circulation about a world +Y axis,
    now multiplied by a compact G(y)

It is **not**:

- a mesocyclone;
- a tornado;
- tilting;
- stretching;
- environmental-vorticity-derived rotation;
- a storm-relative vortex;
- a pressure/buoyancy couple.

`docs/physics/13` §15 remains in force for this type as well.

---

## 21. Invariants

For a valid `VerticalEnvelopeRotationField`:

1. **Axis rest**  
   At `(centerX, y, centerZ)` for any finite `y`: `V = (0, 0, 0)`.

2. **Purely horizontal**  
   `Vy = 0` at every sample point.

3. **Tangency**  
   `dx Vx + dz Vz = 0`.

4. **Axisymmetry of speed**  
   Equal `r` and equal `y` ⇒ equal `|V| = |Ω| r E G(y)`.

5. **Sign reversal**  
   Negating `Ω` negates `V` at every point.

6. **Cardinal directions**  
   For `Ω > 0` and `G > 0`, the table in §13.3 holds.

7. **Inactive-height rest**  
   Any finite `(x, z)` with `y < baseHeight` or `y > topHeight`:
   `V = (0, 0, 0)`. Same at the closed lids.

8. **Envelope maximum**  
   `G(y_mid) = 1`. At that height, `V` matches `RotationField` with
   the same `Ω`, `σ`, center.

9. **Lids**  
   `G(baseHeight) = G(topHeight) = 0`.

10. **Peak speed**  
    At `y_mid` and `r = σ`: `|V| = |Ω| σ / √e`.

11. **Steady**  
    Fixed position, varying `time` ⇒ identical `V`.

12. **Divergence**  
    `∇ · V = 0` at sampled points.

13. **No input mutation**  
    Caller `position` is unchanged after `sample`.

14. **Zero angular velocity**  
    `Ω = 0` ⇒ `V = (0, 0, 0)` at every sample point.

15. **Height dependence**  
    Fixed `(x, z)` off-axis, `y_mid` versus a point outside the
    layer ⇒ nonzero versus zero. This **fails** if the field is
    accidentally height-independent.

---

## 22. Analytical tracer acceptance

The isolated field has `Vy = 0`, so every trajectory stays at its
initial height `y0`.

### 22.1 Inactive height

If `y0 ≤ baseHeight` or `y0 ≥ topHeight`:

    V ≡ 0  ⇒  P(t) = P0

for Euler and RK2 aside from ordinary floating-point roundoff,
including off-axis starts.

### 22.2 Axis

If `r0 = 0`, any finite `y0`:

    P(t) = P0

### 22.3 Active height, off-axis

If `baseHeight < y0 < topHeight` and `r0 > 0`, let:

    G0 = G(y0) = sin(π (y0 − y_b) / H)
    Ω_eff = Ω * G0 * exp( −r0² / (2 σ²) )

The **continuous** ODE is the `13` circle at constant height:

    r(t) = r0
    y(t) = y0

    x(t) = centerX + dx0 * cos(Ω_eff t) + dz0 * sin(Ω_eff t)
    z(t) = centerZ − dx0 * sin(Ω_eff t) + dz0 * cos(Ω_eff t)

At `y0 = y_mid`, `G0 = 1` and the oracle is identical to `13`.

### 22.4 Numerical trajectories are not the oracle

Euler and RK2 do **not** follow the circle exactly. Because `Ω_eff`
depends on `r`, radius drift changes the local angular rate.

Required tracer policy (same spirit as `13`):

- compare numerical position to the **continuous** circular
  solution;
- use a nonzero tolerance;
- treat radius error and position error as different diagnostics;
- expect Euler at moderate `dt` to increase `r`;
- require that decreasing `dt` reduces error for both Euler and RK2;
- require RK2 to be more accurate than Euler at the same `dt`;
- assert `y(t) = y0` (isolated field).

A correct field formula does not make Euler exact.

Do **not** use a live DEMO composite trajectory as an oracle.
Do **not** use the unbounded solid-body Euler map from `03`.

---

## 23. Testing policy

Prefer contract tests over implementation trivia.

Required:

- axis sample equals `(0, 0, 0)` inside, at, and outside the layer;
- `Vy` identically zero;
- tangency;
- equal-radius speed symmetry at fixed `y`;
- formula match at an interior off-axis radius and at large `r`
  with `G` included;
- cardinal signs for `Ω > 0` at `y_mid`;
- sign reversal of `Ω`;
- `Ω = 0` yields the zero field;
- `G(baseHeight) = G(topHeight) = 0` via `V = 0` off-axis at the
  lids;
- `G(y_mid) = 1` via identity with `RotationField` at the same
  horizontal point;
- exterior rest: `y` below `baseHeight` and above `topHeight`;
- height dependence: off-axis interior versus exterior;
- steadiness;
- `∇ · V = 0` at interior / lid / exterior samples;
- no input mutation and a new `Vec3` per sample;
- validation failures for non-finite values, `sigma ≤ 0`,
  `topHeight ≤ baseHeight`;
- construction succeeds for `Ω = 0`, `Ω < 0`, `baseHeight < 0`;
- on-axis tracer rest;
- inactive-height tracer rest off-axis;
- active-height tracer acceptance against the continuous circular
  solution with Euler and RK2, including `y(t) = y0`, radius drift,
  and `dt` convergence.

Do not require:

- ScenarioConfig integration;
- composite DEMO tests;
- rendering tests;
- a curl / `HorizontalVorticity` API;
- continuity-equation residual checks as storm physics;
- Euler solid-body closed-form radius as an oracle;
- DEMO envelope numbers from `10`.

Use floating-point tolerance where `exp` / `sin` require it. Beware
IEEE-754 signed zero (`−0`) when a computed component is a negated
product with a zero offset.

Do not duplicate `RotationField` validation tests except where this
type adds bounds. Do not re-test `13` height independence as if it
applied here.

---

## 24. Module and type placement

Implementation path for the first slice:

    src/physics/storm/VerticalEnvelopeRotationField.ts

Suggested construction shape (documentation-level):

    new VerticalEnvelopeRotationField({
      centerX,
      centerZ,
      angularVelocity,
      sigma,
      baseHeight,
      topHeight,
    })

Exact TypeScript surface may use a params object, but the semantic
parameters and validation rules above are mandatory.

---

## 25. First implementation slice

**Done** for the isolated type. DEMO occupant replacement remains a
later wiring command.

In order:

1. this document (source of truth);
2. `VerticalEnvelopeRotationField` implementation;
3. unit tests for sampling invariants, lids, identity at `y_mid`
   versus `RotationField`, signs, divergence, and validation;
4. analytical tracer acceptance through `Simulation` + Euler and RK2
   against the continuous circular solution at an interior height,
   plus inactive-height rest — never treating the integrators as
   exact off-axis;
5. `npm test` and `npm run typecheck`;
6. **STOP.**

Out of this slice:

- `ScenarioConfig` / `DEMO_SCENARIO`;
- DEMO occupant replacement;
- renderer / camera / seeds;
- environment, integrator choice, `dt`;
- `RotationField` changes;
- generic envelope wrapper;
- tilting / stretching / mesocyclone;
- downdraft;
- continuity solver;
- story tracers.

---

## 26. DEMO placement

DEMO lid numbers, knot relationships (Y7), and occupant replacement
are owned by
`docs/rendering/12-composite-vertical-envelope-rotation-demo.md`.

This physics SoT does **not** lock those numbers. Live DEMO rotation
occupant is `VerticalEnvelopeRotationField` with the `12` bounds.

---

## 27. Explicit non-goals

Do not start in this SoT or in its isolated implementation:

- evolving `RotationField`;
- DEMO wiring;
- ScenarioConfig envelope fields;
- renderer changes;
- story tracers;
- follow camera / wind-tunnel replacement;
- downdraft;
- continuity solver;
- tilting / stretching;
- environmental-vorticity coupling;
- mesocyclone / tornado claims;
- Rankine or Lamb–Oseen radial profile;
- Hann / Gaussian-in-`y` / plateau envelope as a silent swap;
- `curl()` API.

---

## 28. Compact lock-in

```text
canonical type:          VerticalEnvelopeRotationField
primitive kept:          RotationField (height-independent)
radial profile:          v_theta(r) = Ω r exp(−r²/(2σ²))   // same as 13
separable form:          v_theta(r, y) = Ω r E_r(r) G(y)
vertical envelope:       G(y) = sin(π (y − y_b)/H) on [y_b, y_t], else 0
G = 1:                   y_mid = (y_b + y_t) / 2 only
zero below/above:        yes; G = 0 on and outside both lids
plateau downward:        no
velocity jump at lids:   no (G lids = 0)
continuity class:        V is C^0; G' jumps at lids
Ω, σ, centerX, centerZ:  same meaning as RotationField
peak |v_theta|:          |Ω| σ / √e at r = σ and y = y_mid
Vy:                      identically 0
axis:                    rest at every y
tangency:                dx Vx + dz Vz = 0
∇ · V:                   0 identically
ω_y:                     13 profile × G(y)
                         diagnostic SoT: physics 23
                         Slice 1 API: worldVerticalVorticity
                         on this type; not VelocityField.curl
ω_h from G':             not HorizontalVorticity; not tilting
DEMO bounds:             not owned here; see rendering/12
not:                     mesocyclone, stretching, env-vorticity-derived
```

---

## 29. Core lesson

`VerticalEnvelopeRotationField` v1 is `RotationField`’s compact
vertical window, not a new vortex and not a mesocyclone:

    Vx = Ω E G(y) dz
    Vy = 0
    Vz = −Ω E G(y) dx

    G(y) = sin(π (y − baseHeight) / (topHeight − baseHeight))
           on [baseHeight, topHeight], else 0

Circulation is off below and above a finite layer, continuous at
both lids, and full-strength only at `y_mid`. Isolated tracers still
draw circles at constant height. Euler still spirals. The tube is
no longer the type’s definition.

The live DEMO occupant is `VerticalEnvelopeRotationField` as specified
in `docs/rendering/12-composite-vertical-envelope-rotation-demo.md`.
