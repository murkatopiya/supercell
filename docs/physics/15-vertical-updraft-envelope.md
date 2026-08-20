# Vertical Updraft Envelope

## 1. Purpose

This document defines the first height-dependent updraft mechanism in
Supercell Explorer: `VerticalEnvelopeUpdraftField` v1.

It answers:

    Given the existing Gaussian radial updraft profile, a chosen vertical
    interval, and a canonical vertical envelope, what world-space vertical
    velocity does a passive tracer sample?

The v1 definition is separable:

    Vy(r, y) = W0 * E_r(r) * F(y)

where `E_r` is the existing radial Gaussian from
`docs/physics/11-updraft-field.md`, and `F` is a bounded vertical envelope
with `0 ≤ F(y) ≤ 1`.

This is a mathematically transparent, steady, axisymmetric vertical velocity
field with an explicit vertical life cycle. It is the first mechanism whose
vertical velocity depends on height, and therefore the first with

    ∂Vy/∂y ≠ 0

in general.

It is **not**:

- a realistic supercell;
- a buoyancy / CAPE model;
- a mass-continuity solver;
- a proof that radial inflow is now compensated;
- a replacement claim that every future updraft must use this envelope.

When this physics document was written, live DEMO was the four-field
composition of `06`. That sentence is **historical**. Live DEMO is
five operands (`08` wiring) with a `12 km` environmental profile
(`09`) and deep storm envelopes (`10`). This field remains the
live-DEMO updraft **type**; it does not own those DEMO numbers.

The `storm/` module path means: controlled storm mechanism. It does **not**
mean full or realistic supercell physics.

Horizontal derivatives `∂Vy/∂x` and `∂Vy/∂z` are analytic
consequences of the locked formula below. They are named as T1
inputs in `docs/physics/22-diagnostic-tilting-tendency.md`.
This document remains the velocity-field SoT. It does not own
tilting.

---

## 2. Relationship to existing foundations

`docs/physics/11-updraft-field.md` defines the current canonical updraft:

    w(r) = W0 * exp( -r² / (2 * sigma²) )
    V    = (0, w(r), 0)

That field is height-independent: `∂Vy/∂y = 0`. Its radial Gaussian, peak
semantics, center, and sign policy remain the radial half of this document.

`docs/physics/14-radial-inflow-field.md` §16 records that the existing
height-independent updraft cannot cancel horizontal inflow divergence.
This document introduces `∂Vy/∂y ≠ 0`. It does **not** close that residual.
See §11.

`docs/physics/02-velocity-field-basics.md` requires:

- mechanisms to be tested in isolation before documented composition;
- smooth synthetic fields where possible, with any sharp transition
  documented explicitly (§36);
- explicit formulas (no invented falloff);
- that simple vector addition not be treated as automatically physically
  valid (§32);
- that a field must not silently return zero outside a domain unless that
  behavior is intentionally specified (§35).

`docs/physics/00-coordinate-system.md` establishes:

    +X = East
    +Y = Up
    +Z = South

    vertical > 0  →  world Vy > 0  (updraft)

and that the world origin is **not** automatically the updraft center.
Altitude is world `y`. `y = 0` is the reference ground; negative `y` is
mathematically allowed.

`docs/physics/01-parcel-basics.md` §32: correct tracer integration does not
imply mass conservation. That warning applies here.

`docs/physics/03-numerical-integration-basics.md` distinguishes field error
from integrator error. Because `Vy` now varies with `y`, the isolated
on-axis map `y(t) = y0 + W0 t` from `UpdraftField` is **not** an oracle for
this field.

`docs/physics/12-composite-velocity-field.md` already authorizes generic
world-space addition. Composition of this field with environment, rotation,
radial inflow, or the height-independent `UpdraftField` is **out of scope**
for this document's first implementation slice.

`docs/architecture/01-scenario-config.md` and
`docs/rendering/06-composite-vertical-envelope-updraft-demo.md` own DEMO
wiring of this field. This physics document does not own that wiring.
Isolated physics tests for `VerticalEnvelopeUpdraftField` must not
require ScenarioConfig.

Architectural role:

    VerticalEnvelopeUpdraftField implements VelocityField
        ↓
    sample(position, time) → world Vec3

First implementation slice:

    isolated VerticalEnvelopeUpdraftField
      + sampling tests
      + isolated tracer acceptance

---

## 3. Physical problem: `W(r)` versus `W(r, y)`

### 3.1 Current mechanism

`UpdraftField` specifies only the **horizontal** structure of an updraft:

    W = W(r) = W0 * exp( -r² / (2 σ²) )

Consequences:

- on the axis, `Vy = W0` at every height;
- the same parcel-relative vertical speed exists at `y = 0` and at
  `y → +∞`;
- `∂Vy/∂y = 0` identically;
- there is no updraft base, no internal maximum in height, and no top.

That is a legitimate laboratory primitive. It is not a vertical life cycle.

### 3.2 Required new capability

A height-dependent updraft must allow:

    W = W(r, y)

so that vertical velocity can:

- be weak or zero at a chosen lower boundary, if the chosen envelope says so;
- strengthen over some height range;
- possess an internal maximum;
- weaken toward a chosen upper boundary;
- not continue at the same strength to infinite height.

v1 realizes this as a **separable** product, not as a fully general `W(r, y)`:

    Vy(r, y) = W0 * E_r(r) * F(y)

`E_r` keeps the existing radial responsibility. `F` is the new vertical
responsibility.

Separability is a modeling choice for v1, not a claim that real convective
towers are separable.

### 3.3 What this slice does not claim

Introducing `F(y)` does **not** automatically mean:

- the field solves continuity;
- the field is a realistic supercell updraft;
- radial inflow is now mass-compensated;
- the current DEMO should change.

Those are later questions. This document only defines the first bounded
vertical envelope.

---

## 4. Envelope comparison

Conceptual form:

    Vy(r, y) = W0 * E_r(r) * F(y)

    E_r(r) = exp( -r² / (2 σ²) )

`E_r` is unchanged. The choice is `F`.

Let:

    y_b = baseHeight
    y_t = topHeight
    H   = y_t - y_b > 0
    ξ   = (y - y_b) / H

On the candidate interior interval, `ξ ∈ [0, 1]`.
The midpoint is:

    y_mid = (y_b + y_t) / 2
    ξ_mid = 1/2

### 4.1 Candidate A — half-sine on a finite interval

    F(y) = sin(π ξ)     for y_b ≤ y ≤ y_t
    F(y) = 0            otherwise

| Property | Value |
|---|---|
| Domain of nonzero `F` | closed interval `[y_b, y_t]` |
| `F(y_b)`, `F(y_t)` | `0` |
| Maximum | `F = 1` at `y_mid` |
| Smoothness of `F` | continuous everywhere (`C^0`); not `C^1` at `y_b` and `y_t` |
| Interior derivative | `F'(y) = (π/H) cos(π ξ)` |
| One-sided `F'` at `y_b` | interior `+π/H`, exterior `0` |
| One-sided `F'` at `y_t` | interior `−π/H`, exterior `0` |
| New parameters | 2 (`baseHeight`, `topHeight`) |
| Hidden normalization | none; `max F = 1` by construction |
| Testing | zeros, midpoint maximum, symmetry, elementary `F'` |
| On-axis ODE | elementary closed form (see §16) |
| Outside the interval | exact `0`, no Gaussian tail |
| Interpretability | textbook first vertical mode of a layer with `w = 0` at both lids |

The velocity field itself is continuous. The **derivative** jumps at the
layer edges. That is an explicit, documented transition, not a hidden
epsilon wall
(`docs/physics/02-velocity-field-basics.md` §36).

### 4.2 Candidate B — Gaussian in height

    F(y) = exp( −(y − y_peak)² / (2 σ_y²) )

| Property | Value |
|---|---|
| Domain | all `y`; never exactly zero |
| Boundaries | no chosen base/top with `F = 0` |
| Maximum | `F = 1` at `y_peak` |
| Smoothness | `C^∞` |
| `F'` | `−(y − y_peak)/σ_y² * F(y)` |
| New parameters | 2 (`peakHeight`, `sigmaY`), or more if fake bounds are added |
| Testing | same style as radial Gaussian |
| On-axis ODE | not elementary (`erf` inverse) |
| Outside a conceptual layer | unbounded tail; `Vy` continues (weakly) to `±∞` |

This matches the project's radial Gaussian habit, but it does **not**
provide a chosen lower/upper boundary or a finite vertical life cycle.
It is the height analogue of "never quite off". Rejected for v1.

### 4.3 Candidate C — squared sine / Hann bump

    F(y) = sin²(π ξ)     for y_b ≤ y ≤ y_t
    F(y) = 0             otherwise

| Property | Value |
|---|---|
| Domain of nonzero `F` | `[y_b, y_t]` |
| `F(y_b)`, `F(y_t)` | `0` |
| Maximum | `F = 1` at `y_mid` |
| Smoothness | `C^1` (`F` and `F'` match the exterior zero at the edges) |
| Interior derivative | `F'(y) = (π/H) sin(2π ξ)` |
| `F'` at edges | `0` from both sides |
| New parameters | 2 |
| Hidden normalization | none |
| Testing | good; elementary `F'` |
| On-axis ODE | elementary (`cot` map) |
| Stretching near the base | starts at `0` and peaks at quarter-height |

Smoother than A, still compact. Slightly less standard as a first
thunderstorm vertical mode. Near-boundary `∂Vy/∂y = 0` makes the lower
lid dynamically quieter than the half-sine.

### 4.4 Candidate D — quadratic bump `4ξ(1−ξ)`

    F(y) = 4 ξ (1 − ξ)     for y_b ≤ y ≤ y_t
    F(y) = 0               otherwise

Maximum `1` at midpoint. `C^0` only, like A. On-axis ODE is logistic and
elementary. Less standard than the sine mode; derivative is linear in `ξ`
rather than trigonometric. Not enough advantage to displace A.

### 4.5 Candidate E — `C^∞` compact bump

    F(y) = exp( 1 − 1/(1 − η²) )    for `|η| < 1`
    F(y) = 0                        otherwise

    η = 2(y − y_mid) / H

All derivatives vanish at the edges. `max F = 1` at `y_mid`. Formula and
`F'` are inconvenient to test. Overkill relative to the rest of the
synthetic storm.

### 4.6 Canonical choice for v1

**Candidate A, the half-sine on `[baseHeight, topHeight]`, is canonical.**

Reasons:

1. It is the standard first vertical mode of a layer with `w = 0` at both
   boundaries.
2. `max F = 1` with no hidden scale, so `peakVerticalVelocity` stays a
   true peak.
3. Exact zeros at the chosen base and top; exact zero outside.
4. Only two new parameters.
5. Elementary `F` and `F'`.
6. Elementary isolated on-axis (and constant-`r`) trajectory.
7. Nonzero interior `F'` except at the single midpoint, which is the
   minimum interesting derivative structure for later divergence talk.

Rejected, with the reason that would reopen the choice:

- **B** — no compact vertical life cycle;
- **C** — smoother, but quieter at the lids and less canonical;
- **D** — elementary but not the textbook mode;
- **E** — excess smoothness cost.

v1 does **not** leave the envelope as an implementation option.

---

## 5. Canonical vertical envelope

### 5.1 Formula

Let:

    W0  = peakVerticalVelocity
    σ   = sigma
    y_b = baseHeight
    y_t = topHeight
    H   = y_t - y_b

    dx = x - centerX
    dz = z - centerZ
    r² = dx² + dz²

    E_r(r) = exp( -r² / (2 σ²) )

    ξ(y) = (y - y_b) / H

Then:

    F(y) = sin(π ξ(y))     if y_b ≤ y ≤ y_t
    F(y) = 0               if y < y_b or y > y_t

    Vy(x, y, z) = W0 * E_r(r) * F(y)
    Vx = 0
    Vz = 0

On the closed interval the sine formula already yields

    F(y_b) = sin(0) = 0
    F(y_t) = sin(π) = 0

so the piecewise definition is continuous. Implementations must **not**
introduce a thickness, epsilon, or smoothstep near the lids.

Evaluate `F` by the sine formula on `[y_b, y_t]` and by exact `0` strictly
outside. Do not clamp, saturate, or renormalize.

### 5.2 Derived envelope facts (not additional API)

- `0 ≤ F(y) ≤ 1` for all finite `y`;
- `F(y) = F(2 y_mid − y)` (even symmetry about `y_mid`);
- unique maximum `F = 1` at `y = y_mid`;
- `F(y) > 0` for `y_b < y < y_t`;
- `F(y) = 0` for `y ≤ y_b` and for `y ≥ y_t` under the piecewise
  definition; equivalently `F(y_b) = F(y_t) = 0` from the sine formula.

---

## 6. Vertical domain

### 6.1 Parameters

The active vertical interval is specified by:

    baseHeight    // world +Y, meters
    topHeight     // world +Y, meters

These are world-space vertical coordinates, the same quantity as
environmental profile `height` and world `y`. They are **not** AGL-only
display units and **not** a `centerY`.

Naming follows semantic height (`baseHeight` / `topHeight`), not
`baseY` / `topY`. The storm axis remains a horizontal pair
`(centerX, centerZ)`, as in `UpdraftField`.

### 6.2 Order

Require:

    topHeight > baseHeight

Equal bounds and inverted bounds are invalid. There is no minimum `H` in
the constructor. Very small `H` makes `|F'| ~ 1/H` large and is a
timestep concern for integrators, analogous to large `A` in
`RadialInflowField`. That is not constructor validation.

`baseHeight` may be negative. Ground `y = 0` is not an implicit lid.

### 6.3 Behavior by region

| Region | `F` | `Vy` |
|---|---|---|
| `y < baseHeight` | `0` | `0` |
| `y = baseHeight` | `0` | `0` |
| `baseHeight < y < topHeight` | `sin(π ξ) ∈ (0, 1]` | `W0 E_r F` |
| `y = topHeight` | `0` | `0` |
| `y > topHeight` | `0` | `0` |

No hidden epsilon. Comparisons are ordinary IEEE-754 inequalities against
the stored bounds.

### 6.4 Defined on all world space

v1 is defined at every finite world position.

Sampling outside `[baseHeight, topHeight]` is **not** an error. It returns
`V = (0, 0, 0)`.

This is an intentional compact-support envelope, not a silent fallback
(`docs/physics/02-velocity-field-basics.md` §35).

Reason: `VelocityField` operands must be freely composable. Environment,
`UpdraftField`, `RotationField`, and `RadialInflowField` all sample
everywhere. A throw-on-out-of-layer policy would make
`CompositeVelocityField` unusable near the ground or above the top.

There is no horizontal domain wall. Far from the axis, decay is still only
the radial Gaussian.

---

## 7. Radial semantics

The radial profile is exactly the current `UpdraftField` Gaussian:

    E_r(r) = exp( -r² / (2 σ²) )

Retained parameters, with the same meaning:

| Parameter | Meaning |
|---|---|
| `centerX` | world east coordinate of the axis, m |
| `centerZ` | world south coordinate of the axis, m |
| `peakVerticalVelocity` | `W0`, m/s |
| `sigma` | Gaussian horizontal scale in `exp(-r²/(2σ²))`, m |

Added parameters, only:

    baseHeight
    topHeight

`sigma` is still not a compact-support radius. There is still no
`centerY`. The axis is still vertical. `stormMotion` still does not
translate the axis.

v1 does **not** retune, rename, or replace `E_r`.

---

## 8. Meaning of `peakVerticalVelocity`

Invariant:

    peakVerticalVelocity = W0

is the **global maximum** of `Vy` for a valid field.

It is attained if and only if:

    r = 0     and     F(y) = 1

which for this envelope is:

    (x, y, z) = (centerX, y_mid, centerZ)

    y_mid = (baseHeight + topHeight) / 2

    Vy = W0

There is no hidden envelope normalization. Implementations must **not**
divide by `max F`, because `max F` is already `1`.

If a future envelope had `max F ≠ 1`, this parameter would have to be
renamed. v1 forbids that situation.

On the axis but off `y_mid`:

    0 ≤ Vy < W0

Off-axis at `y_mid`:

    0 < Vy < W0

---

## 9. Height derivative

### 9.1 Envelope derivative

For `y_b < y < y_t`:

    F'(y) = dF/dy = (π / H) * cos(π ξ)

Outside the open interval:

    F'(y) = 0

At `y = y_b` and `y = y_t`, `F` is continuous but **not differentiable**.
The unique classical derivative does not exist there.

One-sided values:

    at y_b:   interior F' → +π/H ,   exterior F' = 0
    at y_t:   interior F' → −π/H ,   exterior F' = 0

Do not invent an epsilon average at the lids. Tests of `F'` or `∂Vy/∂y`
must use strictly interior points, or must state one-sided limits
explicitly.

### 9.2 Field derivative

Inside the open layer:

    ∂Vy/∂y = W0 * E_r(r) * (π / H) * cos(π ξ)

Outside:

    ∂Vy/∂y = 0

Sign, for `W0 > 0` and `E_r > 0`:

| Region | `F'` | `∂Vy/∂y` | Meaning |
|---|---|---|---|
| `y_b < y < y_mid` | `> 0` | `> 0` | rising portion; `Vy` increases with height |
| `y = y_mid` | `= 0` | `= 0` | envelope maximum |
| `y_mid < y < y_t` | `< 0` | `< 0` | weakening portion; `Vy` decreases with height |
| `y < y_b` or `y > y_t` | `0` | `0` | inactive |

`|F'|` is largest at the interior sides of the lids and is zero at
`y_mid`. That is a property of the half-sine, not a second parameter.

`VelocityField` v1 still exposes only `sample`. There is no production
`derivative()` API. The formulas above are the documented analytic
derivative for tests and later diagnostics.

Horizontal derivatives, from the same separable formula, are
derived for diagnostic tilting in
`docs/physics/22-diagnostic-tilting-tendency.md` §11. This
section still owns `∂Vy/∂y` only. Architecture of the
concrete-class `horizontalGradientOfVerticalVelocity` (not
`VelocityField.derivative`) lives in
`docs/architecture/26-diagnostic-tilting-tendency-architecture.md`.
Slice 1 of that architecture is implemented on this type.
T1 `DiagnosticTiltingTendency` is not implemented.

### 9.3 This is not a continuity solver

`∂Vy/∂y ≠ 0` is necessary for any later incompressible compensation of
horizontal convergence. It is not sufficient. See §11.

---

## 10. Coordinates, frame, and time

Canonical world axes remain:

    +X = East
    +Y = Up
    +Z = South

The field adds only vertical velocity:

    Vx = 0
    Vz = 0
    Vy = W0 * E_r(r) * F(y)

There is no fundamental reason to add horizontal components. Inflow and
rotation remain separate mechanisms.

`sample` returns world `Vec3`. It does **not**:

- return `AtmosphericVelocity`;
- convert through the environmental profile;
- subtract `stormMotion`;
- translate the axis with storm motion;
- depend on hodograph / shear / helicity diagnostics.

Meteorological vertical velocity matches world `Vy` in sign and magnitude
for this field. Do not name world components `u`, `v`, `w`.

The field is Eulerian-steady: `time` is ignored.

    sample(P, t1) = sample(P, t2)

Trajectories are still time-dependent through changing `y` (and, if later
composed with other fields, through changing `x, z`).

---

## 11. Continuity boundary

This section distinguishes three different statements.

### 11.1 What changes relative to the current radial inflow

`RadialInflowField` has

    div_h = ∂Vx/∂x + ∂Vz/∂z
          = −A * E_in(r_in) * (2 − r_in² / σ_in²)
    Vy ≡ 0
    ∂Vy/∂y ≡ 0

so

    ∇ · V_inflow = div_h

Height-independent `UpdraftField` has `∇ · V_updraft = 0`.

The laboratory sum

    V_inflow + V_updraft_height_independent

therefore keeps the full inflow residual.

For `VerticalEnvelopeUpdraftField`, inside the open layer:

    ∇ · V_updraft
      = ∂Vy/∂y
      = W0 * E_up(r_up) * (π / H) * cos(π ξ)

Outside the layer, that contribution is `0`.

### 11.2 Composite divergence (inflow + this updraft)

Ignore environment and rotation for this paragraph: they contribute
`div_h = 0` under current models.

    ∇ · V
      = −A * E_in(r_in) * (2 − r_in² / σ_in²)
        + W0 * E_up(r_up) * (π / H) * cos(π ξ)

The second term exists only for `y_b < y < y_t`.

This **can** locally reduce or reverse the sign of `∇ · V` at some points,
because `∂Vy/∂y` is nonzero. That is possibility, not a guarantee.

### 11.3 Why separable `Vy = W0 E_r(r) F(y)` cannot cancel this inflow in general

Even in the DEMO-like special case where centers and sigmas coincide
(`r_in = r_up = r`, `E_in = E_up = E`), inside the layer:

    ∇ · V = E(r) [ −A (2 − r²/σ²) + W0 (π/H) cos(π ξ) ]

The common Gaussian `E(r)` factors out. The remaining radial factor of
inflow divergence is `(2 − r²/σ²)`, which depends on `r`. The updraft
term in brackets depends only on `y`.

Therefore no choice of `W0`, `H`, and `y` can make `∇ · V = 0` at all `r`
for a fixed height, unless `A = 0`.

On the axis (`r = 0`), inside the layer:

    ∇ · V = −2A + W0 (π/H) cos(π ξ)

At the interior side of the base, `cos(0) = 1`:

    ∇ · V → −2A + W0 π / H

That particular number is zero only if

    H = W0 π / (2A)

which is a coincidental parameter relation, **not** an API invariant, and
it would hold only on the axis and only at that height.

At `y_mid`, `cos = 0`, so the on-axis residual is again `−2A`.

At the interior side of the top, `cos(π) = −1`:

    ∇ · V → −2A − W0 π / H

which is strictly more negative than the inflow residual alone.

DEMO coincidence of centers and `sigma` values must **not** become a
coupled-parameter invariant of either field.

### 11.4 The three claims

| # | Statement | v1 status |
|---|---|---|
| 1 | `∂Vy/∂y ≠ 0` inside the open layer (except at `y_mid`) | **true** by construction |
| 2 | local cancellation of part of `div_h` is possible at some points | **possible**, parameter- and location-dependent, not guaranteed |
| 3 | the field, or its sum with `RadialInflowField`, is divergence-free / mass-consistent | **false** |

v1 claims (1). It does not claim (2) as an invariant. It forbids (3).

Visually crowding or rising tracers still do not represent conservation of
air mass (`docs/physics/01-parcel-basics.md` §27–28, §32).

An isolated upper-level radial outflow field is specified separately
in `docs/physics/16-upper-radial-outflow-field.md`. That type does
**not** read this field's parameters, does not start automatically at
`topHeight`, and does not make the laboratory sum mass-consistent.
This document still does not introduce a continuity solver or a
parameter coupling between `W0`, `H`, and `A`.

---

## 12. Parameters

| Parameter | Symbol | Meaning | Units | Constraint |
|---|---|---|---|---|
| `centerX` | — | world east coordinate of axis | m | finite |
| `centerZ` | — | world south coordinate of axis | m | finite |
| `peakVerticalVelocity` | `W0` | global max `Vy`, attained at axis and `y_mid` | m/s | finite and `> 0` |
| `sigma` | `σ` | Gaussian horizontal scale in `exp(-r²/(2σ²))` | m | finite and `> 0` |
| `baseHeight` | `y_b` | world `y` of the lower lid | m | finite |
| `topHeight` | `y_t` | world `y` of the upper lid | m | finite and `> baseHeight` |

Parameters intentionally absent from v1:

- `centerY`;
- `peakHeight` as a free parameter (derived: `y_mid`);
- envelope selector / `F` enum;
- `sigmaY`;
- time dependence;
- moving or tilted axis;
- radial inflow, rotation, or outflow;
- downdraft / signed `W0`;
- mass-continuity correction or coupling to `radialStrainRate`;
- ScenarioConfig wiring;
- composition helpers;
- a `derivative()` API.

---

## 13. Validation policy

Validation belongs at the owning construction boundary of
`VerticalEnvelopeUpdraftField`.

Reject when:

- any parameter is non-finite (`NaN` or `±Infinity`);
- `sigma ≤ 0`;
- `peakVerticalVelocity ≤ 0`;
- `topHeight ≤ baseHeight`.

Negative `peakVerticalVelocity` is **not** a downdraft mode of this type.
That follows `UpdraftField`.

Do **not** reject:

- `baseHeight < 0`;
- `baseHeight = 0`;
- large `H`;
- small but positive `H`;
- centers other than the world origin.

Sampling does not re-validate. Every finite world position is evaluable.

Error type: `VerticalEnvelopeUpdraftFieldError`, matching the other storm
fields' dedicated error classes.

---

## 14. Relationship to current `UpdraftField`

### 14.1 Options considered

**A.** Evolve `UpdraftField` into the height-dependent field.

**B.** Keep `UpdraftField` as the canonical height-independent primitive
and add `VerticalEnvelopeUpdraftField`.

**C.** Introduce a reusable envelope / multiplicative composition
abstraction and wrap `UpdraftField`.

### 14.2 Decision: B

v1 adds a **new** type:

    VerticalEnvelopeUpdraftField

and leaves `UpdraftField` unchanged.

### 14.3 Why not A

The current `UpdraftField` is already a documented primitive with:

- unit tests that require height independence;
- an exact on-axis oracle `y(t) = y0 + W0 t`;
- `createUpdraftField` and the live four-field DEMO.

Making `baseHeight` / `topHeight` required would break that primitive and
would force ScenarioConfig / DEMO changes in the same physics slice.
Those wiring surfaces are explicitly frozen here (§20).

Optional vertical parameters on `UpdraftField` would create two modes in
one type. This document forbids dual APIs for the new mechanism.

### 14.4 Why not C

A wrapper

    Vy = sample(UpdraftField).y * F(y)

is multiplicative composition. The only existing compositor is additive
`CompositeVelocityField`. A generic envelope operator would be a new
abstraction serving one caller. Premature.

The duplicated radial Gaussian is a few lines. Independent validation
ownership is clearer.

### 14.5 Why two updraft types is acceptable

They are different mechanisms, not two APIs for one mechanism:

    UpdraftField:                   Vy = W0 E_r(r)
    VerticalEnvelopeUpdraftField:   Vy = W0 E_r(r) F(y)

This is the same kind of distinction as
`SolidBodyRotationYField` versus `RotationField`: related formulas,
different contracts, different oracles.

`UpdraftField` remains the laboratory field with an exact linear-y oracle.
`VerticalEnvelopeUpdraftField` is the first bounded vertical life cycle.

There is one API for the height-dependent mechanism. Live DEMO uses this
type rather than `UpdraftField`
(`docs/rendering/06-composite-vertical-envelope-updraft-demo.md`).

### 14.6 Dependency impact

This slice must **not** change:

- `UpdraftField` constructor, formula, or tests;
- `createUpdraftField`;
- `DEMO_SCENARIO` / `ScenarioConfig`;
- app composition of the current four operands.

Implementation adds a sibling under `src/physics/storm/`.

---

## 15. Ownership and mutability

`sample` must:

- not mutate the caller-owned input `position`;
- return a **new** plain `Vec3` on every call.

It must not return an internal reusable buffer.

---

## 16. Invariants

For a valid `VerticalEnvelopeUpdraftField`:

1. **Axis peak**  
   At `(centerX, y_mid, centerZ)`:

       V = (0, W0, 0)

2. **Axis at the lids**  
   At `(centerX, baseHeight, centerZ)` and
   `(centerX, topHeight, centerZ)`:

       V = (0, 0, 0)

3. **Below and above the layer**  
   Any finite `(x, z)`, `y < baseHeight` or `y > topHeight`:

       V = (0, 0, 0)

4. **Off-axis at the peak height**  
   `r > 0`, `y = y_mid`:

       Vx = 0, Vz = 0
       0 < Vy < W0
       Vy = W0 * E_r(r)

5. **Purely vertical**  
   `Vx = 0` and `Vz = 0` at every sample point.

6. **Radial axisymmetry**  
   Equal `r` and equal `y` ⇒ equal `Vy`.

7. **Height dependence**  
   Fixed `(x, z)` on the axis, `y` in the open layer away from `y_mid`
   ⇒ `Vy ≠ W0`. Equal offsets above and below `y_mid` ⇒ equal `Vy`.

8. **Envelope symmetry**  
   For any `δ` with both `y_mid ± δ` inside `[y_b, y_t]`, and any
   horizontal position:

       Vy(x, y_mid + δ, z) = Vy(x, y_mid − δ, z)

9. **Rising portion vs weakening portion**  
   On the axis, `baseHeight < y < y_mid` ⇒ `0 < Vy < W0` and interior
   `∂Vy/∂y > 0`.  
   On the axis, `y_mid < y < topHeight` ⇒ `0 < Vy < W0` and interior
   `∂Vy/∂y < 0`.

10. **Steady**  
    Fixed position, varying `time` ⇒ identical `V`.

11. **No input mutation**  
    Caller `position` is unchanged after `sample`.

12. **Formula match**  
    Interior and off-axis samples match `W0 E_r F` within floating-point
    tolerance — not an ad hoc “approximately zero” check that ignores
    the formula.

---

## 17. Isolated tracer acceptance

Do **not** use the current DEMO composite trajectory as an oracle.
Do **not** use

    y(t) = y0 + W0 t

except as a **forbidden** regression that this field must fail whenever
`F(y0) ≠ 1` or the particle leaves `y_mid`.

### 17.1 Horizontal invariance

For the isolated field, `Vx = Vz = 0` everywhere, so

    x(t) = x0
    z(t) = z0

for every integrator that samples this field. Horizontal coordinates are
an exact discrete invariant, not a tolerance story.

### 17.2 Inactive layer: exact rest

If `y0 ≤ baseHeight` or `y0 ≥ topHeight`:

    V ≡ 0  ⇒  P(t) = P0

for Euler and RK2 aside from ordinary floating-point roundoff.

This includes exact lid positions.

### 17.3 Constant-`r` interior oracle

Along any trajectory the horizontal position is fixed, so `E_r` is a
constant `E0 = E_r(r0)`.

Inside the open layer the ODE reduces to

    dy/dt = W_eff * sin(π (y − y_b) / H)

    W_eff = W0 * E0 > 0

Let `ξ = (y − y_b) / H` with `ξ0 ∈ (0, 1)`. Then:

    dξ/dt = (W_eff / H) * sin(π ξ)

    tan(π ξ(t) / 2)
      = tan(π ξ0 / 2) * exp(π W_eff t / H)

    ξ(t) = (2/π) arctan( tan(π ξ0 / 2) * exp(π W_eff t / H) )

    y(t) = y_b + H ξ(t)

Domain of the closed form: `ξ0 ∈ (0, 1)`, so the particle starts
**strictly inside** the layer. Then for all finite `t ≥ 0`:

    ξ0 < ξ(t) < 1
    y_b < y(t) < y_t

The particle never reaches `topHeight` in finite continuous time. It
never goes downward. It never leaves through the base.

On the axis, `E0 = 1` and `W_eff = W0`.

Off-axis, the same closed form holds with `W_eff = W0 E_r(r0)`.

This oracle is valid only for the **isolated** field.

### 17.4 Numerical trajectories are not the closed form

Because `Vy` varies with `y`, Euler and RK2 are **not** exact.

Required tracer policy:

- compare numerical `y` to the continuous closed form in §17.3;
- keep `x` and `z` exact invariants;
- use a nonzero tolerance;
- require that decreasing `dt` reduces `|y_numerical − y_closed|` for
  both Euler and RK2;
- require RK2 to be more accurate than Euler at the same `dt`;
- forbid `y(t) = y0 + W0 t` as the general oracle.

A useful qualitative check, not a substitute: a particle started on the
axis in the open lower half has increasing `y` and, after it passes
`y_mid`, sampled `Vy` is smaller than at `y_mid`. That shows resampling
in `y`.

If `W_eff dt` is comparable to `H`, a single Euler step can jump out of
the layer. That is a timestep error, not a physical overshoot through
the top. Acceptance tests must choose `dt` with `W0 dt ≪ H`.

### 17.5 Cases that must not be invented as oracles

- DEMO four-field pathlines;
- `y(t) = y0 + W0 t` for a particle that is not on a height-independent
  `UpdraftField` axis;
- any continuity residual as a trajectory oracle;
- special-function inverses for other envelopes (those envelopes were
  rejected).

---

## 18. Testing policy

Prefer contract tests over implementation trivia.

### Unit tests (required)

- axis at `y_mid`: `V = (0, W0, 0)`;
- off-axis at `y_mid`: `Vy = W0 E_r`, `Vx = Vz = 0`;
- axis at `baseHeight` and `topHeight`: `V = (0, 0, 0)`;
- below the layer and above the layer: `V = (0, 0, 0)`;
- interior formula match at least one off-axis, off-midpoint point;
- envelope symmetry about `y_mid`;
- radial axisymmetry at fixed `y`;
- height dependence: same `(x, z)`, different interior `y` ⇒ different
  `Vy` except at symmetric pairs;
- `Vx` / `Vz` identically zero;
- steadiness;
- no input mutation and a new `Vec3` per sample;
- interior derivative sign: lower half `∂Vy/∂y > 0`, at `y_mid`
  `∂Vy/∂y = 0`, upper half `∂Vy/∂y < 0` (analytic formula and/or
  centered finite difference with `h` small compared with `H` and
  staying inside the open layer);
- validation failures: non-finite parameters, `sigma ≤ 0`,
  `peakVerticalVelocity ≤ 0`, `topHeight ≤ baseHeight`.

Do not require a unique `∂Vy/∂y` at the lids.

### Tracer acceptance (required)

- inactive rest below, at, and above the lids;
- on-axis interior closed form §17.3 with Euler and RK2, tolerance,
  `dt` convergence, RK2 more accurate than Euler;
- one off-axis interior closed form with `W_eff = W0 E_r`;
- `x` and `z` unchanged;
- `y(t) < topHeight` for the interior runs;
- explicit rejection of `y = y0 + W0 t` as equality for an interior
  start with `y0 ≠ y_mid` (or for a duration long enough that `F`
  changes).

Do not require:

- ScenarioConfig / DEMO integration;
- composite inflow + envelope residual checks as a correctness failure;
- rendering tests;
- a production `derivative()` method.

Use floating-point tolerance for `sin` / `exp` / `arctan`. Beware
signed zero only if exact equality is used on computed components;
preferred assertions use tolerance or literal `0` for `Vx` / `Vz`.

---

## 19. Module and type placement

Implementation path for the first slice:

    src/physics/storm/VerticalEnvelopeUpdraftField.ts

`storm/` denotes controlled storm mechanisms under explicit physics
documents. It does not imply a full storm model.

The type implements `VelocityField`.

Suggested construction shape:

    new VerticalEnvelopeUpdraftField({
      centerX,
      centerZ,
      peakVerticalVelocity,
      sigma,
      baseHeight,
      topHeight,
    })

Exact TypeScript surface may use a params object or positional
arguments, but the semantic parameters and validation rules above are
mandatory.

Do not wrap, subclass, or replace `UpdraftField` in this slice.

---

## 20. ScenarioConfig, DEMO, and wiring

Isolated physics of this field does not own DEMO wiring.

Live DEMO replacement of height-independent `UpdraftField` by
`VerticalEnvelopeUpdraftField` is specified in
`docs/rendering/06-composite-vertical-envelope-updraft-demo.md`.
Five-operand wiring is
`docs/rendering/08-composite-lower-radial-inflow-demo.md`.
Environmental knots are
`docs/rendering/09-deep-environmental-profile-demo.md`.
Live envelope bounds are
`docs/rendering/10-deep-storm-envelope-scaling.md`. This field
does not own that wiring.

That wiring extends `storm.updraft` with `baseHeight` / `topHeight`, maps
them through `createUpdraftField`, and does **not** keep `UpdraftField` as
a live DEMO operand. Physical validation remains in this field's
constructor.

This physics document still does not change renderer, hodograph, or
runtime controls.

---

## 21. Explicit non-goals

`VerticalEnvelopeUpdraftField` v1 does **not** include:

- upper-level horizontal divergence / outflow — that mechanism is a
  separate type, `UpperRadialOutflowField`, specified in
  `docs/physics/16-upper-radial-outflow-field.md`; this field stays
  purely vertical;
- downdraft;
- precipitation;
- cold pool / gust front;
- pressure perturbation;
- buoyancy equation;
- entrainment;
- turbulence;
- tilting / stretching;
- mesocyclone dynamics;
- mass-continuity solver or parameter coupling to `RadialInflowField`;
- storm-relative translating axis;
- cloud rendering;
- envelope enum / pluggable `F`;
- change to current `UpdraftField`;
- ScenarioConfig / DEMO wiring;
- renderer changes.

Those may be related later. They are not specified here.

---

## 22. First implementation slice

In order:

1. this document (source of truth);
2. `VerticalEnvelopeUpdraftField` at
   `src/physics/storm/VerticalEnvelopeUpdraftField.ts`;
3. unit tests
   `src/physics/storm/VerticalEnvelopeUpdraftField.test.ts`;
4. isolated tracer acceptance
   `src/simulation/verticalEnvelopeUpdraftFieldTracer.acceptance.test.ts`;
5. `npm test`;
6. `npm run typecheck`;
7. **STOP**.

### Files to create

- `src/physics/storm/VerticalEnvelopeUpdraftField.ts`
- `src/physics/storm/VerticalEnvelopeUpdraftField.test.ts`
- `src/simulation/verticalEnvelopeUpdraftFieldTracer.acceptance.test.ts`

### Files that may be left unchanged

Intentional non-touch list:

- `src/physics/storm/UpdraftField.ts` and its tests;
- `src/physics/storm/RadialInflowField.ts` and its tests;
- `src/physics/storm/RotationField.ts`;
- `src/core/fields/VelocityField.ts`;
- `src/core/fields/CompositeVelocityField.ts`;
- `src/scenario/**`;
- `src/app/**`;
- `src/rendering/**`;
- `src/ui/**`;
- `docs/architecture/**`;
- `docs/rendering/**`.

A later implementation must not start upper divergence, DEMO rewiring, or
a continuity solver because the unit tests passed.

---

## 23. Lock-in summary

```text
canonical field/API:     VerticalEnvelopeUpdraftField
radial profile:          E_r = exp(-r² / (2 σ²))   (unchanged)
vertical envelope:       F(y) = sin(π (y - y_b)/H) on [y_b, y_t], else 0
vertical parameters:     baseHeight, topHeight  with topHeight > baseHeight
Vy formula:              Vy = W0 * E_r(r) * F(y);  Vx = Vz = 0
behavior outside layer:  V = (0, 0, 0); sampling is valid, not an error
peak semantics:          peakVerticalVelocity = global max Vy
                         at r = 0 and y = y_mid, where F = 1
∂Vy/∂y:                  W0 E_r (π/H) cos(π ξ) inside the open layer;
                         0 outside; not classically defined at the lids;
                         > 0 below y_mid, = 0 at y_mid, < 0 above y_mid
continuity claim:        (1) ∂Vy/∂y ≠ 0: yes
                         (2) local cancellation: possible, not invariant
                         (3) mass-consistent / divergence-free: no
```

---

## 24. Core lesson

`VerticalEnvelopeUpdraftField` v1 is a controlled separable updraft
with a half-sine vertical life cycle:

    E_r(r) = exp( -r² / (2 σ²) )
    F(y)   = sin(π (y − baseHeight) / (topHeight − baseHeight))
             on the closed interval, and 0 outside
    V      = (0, W0 E_r F, 0)

`peakVerticalVelocity` remains the true maximum. The field is defined
everywhere so it can be composed. `∂Vy/∂y` is now available. That does
not make the laboratory storm incompressible.

`UpdraftField` remains the height-independent primitive. This type is
the first bounded vertical envelope. DEMO wiring is a later slice.
