# Diagnostic Current World-Vertical Vorticity

**Status:** PHYSICS DERIVATION / DIAGNOSTIC SoT
**Scope:** world-vertical component of curl of the CURRENT
prescribed velocity field, in project coordinates.
**Implementation:** NONE / DOCS-ONLY
**Architecture:** not this file. Candidate A direction:
`docs/architecture/27-post-t1-physics-direction-checkpoint.md`.
`27` selected this quantity. It is **not** this derivation.

```text
V_total:                 UNCHANGED
prescribed rotation Ω:   UNCHANGED
prognostic ω:            NOT INTRODUCED
stretching:              NOT INTRODUCED
eighth VelocityField:    NOT INTRODUCED
vorticity → velocity:    NOT INTRODUCED
curl() API:              NOT INTRODUCED
```

T1 sibling (different object, different units):

```text
docs/physics/22-diagnostic-tilting-tendency.md
```

Prescribed rotation occupant (velocity SoT; curl identity
re-derived here as a diagnostic):

```text
docs/physics/18-vertical-rotation-envelope.md
```

Coordinate SoT:

```text
docs/physics/00-coordinate-system.md
```

Keep these roles distinct:

```text
CURRENT MODEL FACT
NEW PROJECT DERIVATION
STILL-BINDING CONTRACT
ANTI-CLAIM
DEFERRED
```

This document does **not** change production code.

---

## 1. Purpose

This document answers:

    In the project's right-handed world coordinates, what is the
    local Eulerian world-vertical vorticity of the CURRENT
    prescribed velocity field?

Canonical output:

    ω_y,current(P, t)

It is a signed scalar diagnostic of **existing** `V`. It is not a
source term, not a state variable, and not generated rotation.

It does **not** answer:

- how to implement a curl API;
- where a diagnostic would live in the runtime;
- how Inspector or visualization should display it;
- how stretching should use this `ω_y`;
- how vorticity should ever change `V_total`.

---

## 2. Explicit non-goals

This derivation does **not**:

- change `V_total`;
- modify prescribed `Ω`;
- introduce `curl()` on `VelocityField`;
- introduce prognostic `ω` or `ω_y` state;
- introduce stretching evolution or a stretching SoT;
- close vorticity → velocity;
- treat T1 as an initial condition or source of this `ω_y`;
- define the full curl vector as the Candidate A quantity;
- design architecture, tests, or UI.

---

## 3. Coordinate convention

**Kind:** CURRENT MODEL FACT, from `00` §2–§3, §13–§14.

Canonical world coordinates:

    +X = East
    +Y = Up
    +Z = South

Right-handed:

    X × Y = Z

East × Up = South. That is why `+Z` is South.

Never call the project's vertical vorticity `ω_z` unless the
sentence is explicitly about textbook z-up notation.

In this project:

    ω_vertical = ω_y

---

## 4. Curl convention

**Kind:** CURRENT MODEL FACT, matching physics `22` §5.
Not reopened.

Let world velocity be

    V = (Vx, Vy, Vz)

The right-handed Cartesian curl is

    ω = ∇ × V

    ω_x = ∂Vz/∂y − ∂Vy/∂z
    ω_y = ∂Vx/∂z − ∂Vz/∂x
    ω_z = ∂Vy/∂x − ∂Vx/∂y

Candidate A uses **only**

    ω_y = ∂Vx/∂z − ∂Vz/∂x

Textbook meteorology often writes vertical vorticity as `ω_z`
on a z-up triad. That textbook `ω_z^{met}` maps to this `ω_y`
with **no extra sign flip** (`22` §6). Do not copy a z-up
formula onto `(Vx, Vy, Vz)` without that map.

Do not use meteorological names `u, v, w` as world components.

---

## 5. Semantic contract

**Kind:** NEW PROJECT DERIVATION.

Canonical quantity:

    ω_y,current(P, t)

| Property | Value |
| --- | --- |
| locality | point `P = (x, y, z)` |
| time | laboratory `t`; Eulerian snapshot |
| kind | diagnostic of prescribed `V` |
| shape | signed scalar |
| units | s⁻¹ |
| definition | `(∇ × V)_y` of the chosen velocity field |
| frame | world; vertical = `+Y` |

`time` is part of the contract because `VelocityField.sample`
is time-capable. CURRENT DEMO operands are Eulerian-steady, so
`ω_y,current` is numerically independent of `t`.

This **is**:

- local instantaneous Eulerian bookkeeping of current `V`;
- the world-vertical component of curl;
- derived, not prescribed as its own field.

This **is not**:

| Object | Units | Why distinct |
| --- | --- | --- |
| `T_tilt,y` | s⁻² | source *term* of env `ω_h` and updraft `∇_h Vy` |
| prognostic `ω_y(P, t)` | s⁻¹ as *state* | no such state exists |
| accumulated tilting | s⁻¹ as integral of T1 | T1 is not integrated |
| parcel spin history | — | tracers do not own `ω` |
| mesocyclone state | — | prescribed cartoon, not a meso |
| circulation `Γ` | m² s⁻¹ | area integral, not the local scalar |
| generated rotation | — | `Ω` was prescribed |
| stretching tendency | s⁻² | `ω_y ∂Vy/∂y`; not this diagnostic |

**STILL-BINDING:**

    T_tilt,y  [s⁻²]  ≠  ω_y,current  [s⁻¹]

They must never be plotted, named, or summed as one quantity.

Operand-tagged companions, when a decomposition is discussed:

    ω_y(V_i) = (∇ × V_i)_y

In particular `ω_y^Ω` means `ω_y(V_rotation)` of
`VerticalEnvelopeRotationField`, not “vorticity generated by `Ω`
physics.”

---

## 6. Linearity of curl

**Kind:** NEW PROJECT DERIVATION from physics `12` plus the
Cartesian curl.

CURRENT FACT (`12`, `CompositeVelocityField`):

    V_total(P, t) = Σ_i V_i(P, t)

component-wise in world `(Vx, Vy, Vz)`.

Partial derivatives are linear. Therefore

    ω_y(V_total)
      = ∂(Σ Vx_i)/∂z − ∂(Σ Vz_i)/∂x
      = Σ (∂Vx_i/∂z − ∂Vz_i/∂x)
      = Σ ω_y(V_i)

This is a **mathematical** decomposition of a derivative.
It is **not** a new causal chain.

If only one operand has nonzero `ω_y`, that is a property of
the CURRENT prescribed stack. It is not a universal supercell
statement, and it need not survive a later dataset `V`.

---

## 7. Environmental advection

**Kind:** NEW PROJECT DERIVATION on locked formulas
(`04`, `19`, live `EnvironmentalWindField` /
`StormRelativeEnvironmentalAdvectionField`).

Ground-relative environmental wind is horizontally homogeneous:

    V_env = V_env(y)

Live storm-relative operand:

    V_env_sr = V_env(y) − C     (horizontal only)

`C` is a constant vector (`C_y = 0`). Constant subtraction
does not change spatial derivatives.

Therefore

    Vx = Vx(y)
    Vz = Vz(y)

    ∂Vx/∂z = 0
    ∂Vz/∂x = 0

    ω_y(V_env) = 0
    ω_y(V_env_sr) = 0

**Mandatory distinction:**

    environmental ω_h  may be nonzero
    (vertical shear of V_h; physics 06)

    environmental ω_y  is zero
    (no horizontal variation of V_h)

T1 uses that `ω_h`. Candidate A’s `ω_y` does not come from
the sounding.

Sanity: `curl(C) = 0` for constant storm motion. Changing `C`
changes `V_total` horizontally and leaves `ω_y,current`
unchanged.

---

## 8. Updraft

**Kind:** NEW PROJECT DERIVATION on
`VerticalEnvelopeUpdraftField` (`15`, live sample):

    V_updraft = (0, Vy(x, y, z), 0)
    Vy = W0 E_r(r) F(y)

    Vx ≡ 0
    Vz ≡ 0

Therefore

    ∂Vx/∂z = 0
    ∂Vz/∂x = 0
    ω_y(V_updraft) = 0

The updraft **does** have horizontal vorticity from `∇ × (0, Vy, 0)`
and **does** enter T1 through `∇_h Vy`. That is a different
object.

**Mandatory distinction:**

    an updraft can tilt environmental ω_h
    without itself carrying world-vertical vorticity

Offset vs on-axis center does not matter: `Vx` and `Vz` remain
identically zero.

---

## 9. Radial inflow / outflow

Three CURRENT DEMO occupants share the same horizontal kinematic
family: purely radial, axisymmetric about a vertical axis,
amplitude `S E(r) G(y)` with `G = G(y)` only.

Live formulas (verified against `src/physics/storm/`):

| Operand | `S` | `Vx` | `Vz` |
| --- | --- | --- | --- |
| `LowerRadialInflowField` | `−A_in < 0` | `S E G dx` | `S E G dz` |
| `UpperRadialOutflowField` | `+A_out > 0` | `S E G dx` | `S E G dz` |
| `NearGroundRadialOutflowField` | `+A_ng > 0` | `S E G dx` | `S E G dz` |

with, for each field’s own center and `σ`,

    dx = x − centerX
    dz = z − centerZ
    r² = dx² + dz²
    E = exp(−r² / (2 σ²))

`Vy ≡ 0`. `G(y)` differs by type (plateau+taper vs half-sine).
`G` does not depend on `x` or `z`. Different DEMO centers
(NG is offset) do not change the algebra below.

### 9.1 Derivatives

Treat `S G` as independent of `x, z`.

    ∂E/∂x = −E dx / σ²
    ∂E/∂z = −E dz / σ²

    Vx = S G E dx
    Vz = S G E dz

    ∂Vx/∂z = S G [ (∂E/∂z) dx + E · 0 ]
            = S G (−E dz / σ²) dx
            = − (S G E / σ²) dx dz

    ∂Vz/∂x = S G [ (∂E/∂x) dz + E · 0 ]
            = S G (−E dx / σ²) dz
            = − (S G E / σ²) dx dz

    ω_y = ∂Vx/∂z − ∂Vz/∂x = 0

The two terms cancel identically, including on each field’s
axis (`dx = dz = 0`) and for either sign of `S`.

This is **not** “radial therefore zero” as a slogan. It is
cancellation of the mixed derivatives of `E dx` and `E dz`.

If a later radial profile included an azimuthal (`V_θ`)
component, this identity would have to be re-derived. CURRENT
locked fields have none.

### 9.2 Result

    ω_y(V_lowerInflow) = 0
    ω_y(V_upperOutflow) = 0
    ω_y(V_nearGroundOutflow) = 0

Horizontal divergence of these fields is **nonzero** (`14`,
`16`, `17`, `21`). Divergence is not vertical vorticity.

---

## 10. Downdraft

**Kind:** CURRENT MODEL FACT, checked against physics `20` §14
and live `VerticalEnvelopeDowndraftField`:

    V_downdraft = (0, −D0 E_r F, 0)

Same kinematic class as the updraft: only `Vy` is nonzero, even
though the DEMO axis is offset (`centerX = 5000 m`).

    ω_y(V_downdraft) = ∂Vx/∂z − ∂Vz/∂x = 0

Physics `20` already records this, together with nonzero
horizontal vorticity from radial shear of `Vy`. Candidate A
does not use that `ω_h`.

**Do not confuse:**

    ∂Vy/∂x, ∂Vy/∂z     →  horizontal vorticity of the downdraft
    ∂Vx/∂z − ∂Vz/∂x    →  world-vertical vorticity = 0

---

## 11. Prescribed rotation — central derivation

**Kind:** NEW PROJECT DERIVATION from the live occupant
`VerticalEnvelopeRotationField`. Physics `18` §18.2 is the
same identity as a field note. This section re-derives it in
project curl components and does not take it on authority.

Isolated height-independent `RotationField` (`13`) is **not**
the DEMO occupant. DEMO uses the enveloped type (`18`).

### 11.1 Locked velocity

    dx = x − centerX
    dz = z − centerZ
    r² = dx² + dz²
    E = exp(−r² / (2 σ²))

    G(y) = sin(π (y − y_b) / H)    on [y_b, y_t]
    G(y) = 0                       otherwise
    H = y_t − y_b

    0 ≤ G(y) ≤ 1
    G(y_b) = G(y_t) = 0
    G(y_mid) = 1
    y_mid = (y_b + y_t) / 2

Live sample (matches `18` §12):

    Vx =  Ω E G dz
    Vy =  0
    Vz = −Ω E G dx

`Ω` is `angularVelocity` about world `+Y`. Sign is the
right-hand rule (`18` §13). `G = G(y)` only.

No division by `r`. On the axis, `V = 0` at every height.

### 11.2 Horizontal derivatives of `E`

    ∂E/∂x = −E dx / σ²
    ∂E/∂z = −E dz / σ²

`Ω` and `G(y)` are independent of `x` and `z`.

### 11.3 `∂Vx/∂z`

    Vx = Ω G E dz

    ∂Vx/∂z = Ω G [ (∂E/∂z) dz + E · 1 ]
            = Ω G [ (−E dz / σ²) dz + E ]
            = Ω G E ( 1 − dz² / σ² )

### 11.4 `∂Vz/∂x`

    Vz = −Ω G E dx

    ∂Vz/∂x = −Ω G [ (∂E/∂x) dx + E · 1 ]
            = −Ω G [ (−E dx / σ²) dx + E ]
            = −Ω G E ( 1 − dx² / σ² )

### 11.5 `ω_y`

    ω_y^Ω
      = ∂Vx/∂z − ∂Vz/∂x
      = Ω G E (1 − dz²/σ²) − [ −Ω G E (1 − dx²/σ²) ]
      = Ω G E [ 2 − (dx² + dz²)/σ² ]
      = 2 Ω G E ( 1 − r² / (2 σ²) )

Outside `[y_b, y_t]`, `G = 0` and `V = 0`, so `ω_y^Ω = 0`.

This matches physics `18` §18.2 after independent expansion.
It is **not** solid-body `ω_y = 2Ω` except on the axis at
`G = 1`.

`G'(y)` does **not** appear. `ω_y` uses only `x` and `z`
derivatives. Height localization scales the already-horizontal
vortex; it does not feed `∂G/∂y` into vertical curl.

Horizontal vorticity from `G'` (`18` §18.3) is a different
object. It is out of Candidate A’s vertical-only scope.

---

## 12. Sign convention

**Kind:** NEW PROJECT DERIVATION from `00` §13 and the locked
`Ω > 0` field.

Canonical language for this diagnostic:

    positive ω_y,current
    negative ω_y,current

Do **not** make cyclonic / anticyclonic the canonical names.
The laboratory does not lock a hemisphere. Northern-Hemisphere
cyclonic rotation is counterclockwise when viewed from above,
which *coincides* with this project’s positive `+Y` sense, but
that coincidence is not a project SoT claim about Earth.

Positive rotation about `+Y` (`00`): viewed from above looking
down, counterclockwise.

Solid-body check (`22` §4), same sign as this field on axis:

    ω = (0, Ω, 0)
    V = ω × r  →  (Ω z, 0, −Ω x)   at origin-centered r

### 12.1 Cardinal velocity, `Ω > 0`, `G > 0`

Take a point at horizontal distance `d > 0` from the axis.

| Location | `(dx, dz)` | `V` | Geographic |
| --- | --- | --- | --- |
| East | `(+d, 0)` | `(0, 0, −Ω E G d)` | northward (`−Z`) |
| West | `(−d, 0)` | `(0, 0, +Ω E G d)` | southward (`+Z`) |
| North | `(0, −d)` | `(−Ω E G d, 0, 0)` | westward (`−X`) |
| South | `(0, +d)` | `(+Ω E G d, 0, 0)` | eastward (`+X`) |

East-side air going north, south-side air going east:
counterclockwise from above. That is the positive `+Y` sense.

On the axis at `G > 0`:

    ω_y^Ω(r = 0) = 2 Ω G

DEMO `Ω = 0.005 > 0`, so the interior core is **positive**
`ω_y`. Reversing `Ω` reverses `V` and reverses all of `ω_y^Ω`.

---

## 13. Radial structure of `ω_y^Ω`

Let `G ≠ 0` and `Ω` fixed. Write

    ω_y^Ω = 2 Ω G E (1 − r² / (2 σ²))

    E = exp(−r² / (2 σ²)) > 0

| `r` | Factor `(1 − r²/(2σ²))` | `ω_y^Ω` relative to core |
| --- | --- | --- |
| `0` | `1` | `2 Ω G` (core extremum at that height) |
| `σ` | `1/2` | `Ω G exp(−1/2)` |
| `σ √2` | `0` | **zero crossing** |
| `> σ √2` | negative | **opposite-sign ring** |
| `→ ∞` | `E → 0` | `→ 0` |

The core sign is `sign(Ω)` (for `G > 0`). The outer ring has
the opposite sign.

This is expected for a **shielded** Gaussian-modulated vortex,
already named in `13` / `18`. It is **not** a claim that
tangential velocity reverses. For `Ω > 0`, `G > 0`, `v_θ`
keeps the same sense at every `r`; only the *curl* changes
sign where `v_θ` decays faster than a `1/r` potential vortex.

Stokes check, large loop of radius `R` in a plane of constant
`y`:

    Γ = 2π R v_θ = 2π Ω G R² E(R) → 0 as R → ∞

Area-integrated `ω_y^Ω` over the whole plane is therefore
zero. The inner core and the outer ring cancel. That is why
the profile is called shielded, and why net circulation at
infinity vanishes.

**ANTI-CLAIM:** the opposite-sign ring is a consequence of
the chosen Gaussian envelope. It is not, by itself, an
observed atmospheric vortex, a rear-flank couple, or T1’s
dipole.

Intuition to block:

    “the arrows go the same way everywhere,
     therefore vorticity has one sign everywhere”

False for this `V_θ(r)`.

---

## 14. Vertical envelope

`G(y)` multiplies the entire `13` vertical-vorticity profile.

| Region | `G` | `ω_y^Ω` |
| --- | --- | --- |
| `y < y_b` | `0` | `0` |
| lower lid `y = y_b` | `0` | `0` |
| open layer | `sin(π ξ) ∈ (0, 1)` | `2 Ω G E (1 − r²/(2σ²))` |
| `y = y_mid` | `1` | same as height-independent `13` at that `(x, z)` |
| upper lid `y = y_t` | `0` | `0` |
| `y > y_t` | `0` | `0` |

Peak `|ω_y^Ω|` on the axis is at `y_mid`, where `G = 1`:

    ω_y^Ω(axis, y_mid) = 2 Ω

`V` is `C⁰` at the lids (`G → 0`). `G'` jumps there. Those
jumps affect **horizontal** vorticity (`18` §18.3), not `ω_y`.
At a lid height, `Vx = Vz = 0` for all `x, z`, so the
horizontal derivatives that define `ω_y` are zero.

---

## 15. Units

    Ω           rad s⁻¹  ≅  s⁻¹
    dx, dz, σ   m
    E, G        dimensionless
    Vx, Vz      m s⁻¹
    ∂Vx/∂z      s⁻¹
    ω_y         s⁻¹

    2 Ω G E (1 − r²/(2σ²))     s⁻¹

Dimensionally consistent. No runtime unit object.

---

## 16. Seven-operand result — CURRENT STACK IDENTITY

Live compositor order (`composeDemoTracerFields`):

1. environment advection (`V_env` or `V_env − C`)
2. updraft
3. rotation
4. lower radial inflow
5. upper radial outflow
6. downdraft
7. near-ground radial outflow

From §§7–11:

| `V_i` | `ω_y(V_i)` |
| --- | --- |
| environment / `V_env − C` | `0` |
| updraft | `0` |
| rotation | `2 Ω G E (1 − r²/(2σ²))` |
| lower inflow | `0` |
| upper outflow | `0` |
| downdraft | `0` |
| near-ground outflow | `0` |

By linearity (§6):

    ω_y,current(P, t)
      := ω_y(V_total)
       = ω_y(V_rotation)
       = ω_y^Ω

**CURRENT STACK IDENTITY**, not a universal law.

Two conceptually different diagnostics that are **numerically
equal on this stack**:

```text
ω_y(V_rotation)     curl of the rotation operand alone
ω_y(V_total)        curl of the laboratory sum
```

A later dataset or a later operand with azimuthal flow can
split them. Candidate A must be allowed to name either, and
must not assume they remain equal forever.

DEMO centers: rotation is on the origin; downdraft and NG
are offset. Offset does not create `ω_y` from those operands,
because their `ω_y` is identically zero about *their* axes
and hence everywhere.

---

## 17. Relation to T1

T1 (`22`):

    T_tilt,y = ω_h^{env,world} · ∇_h Vy_updraft
    units s⁻²
    vortex couple
    independent of Ω

This diagnostic:

    ω_y,current = (∇ × V_total)_y
    units s⁻¹
    shielded vortex of prescribed Ω
    independent of environmental shear and of W0

There is **no** authorized arrow

    T_tilt,y  →  ω_y,current

Current `ω_y` exists because `Ω` was prescribed, not because
T1 was sampled or integrated.

A later overlay of the two (not designed here) could show:

```text
where current prescribed spin exists
  vs
where environmental shear + updraft would tend to create spin
```

It must **not** show:

```text
generation history
T1 accumulated into this vortex
this Ω is the integral of tilting
```

T1’s couple is offset along `ω_h` and is a dipole.
`ω_y^Ω` is an on-axis shielded monopole plus an opposite-sign
ring. They are different spatial objects.

Changing the sounding or `W0` changes T1 and leaves
`ω_y,current` unchanged. Changing `Ω` changes `ω_y,current`
and leaves T1 unchanged. That independence is the
double-counting guard.

---

## 18. Stretching boundary

**Not a stretching SoT.**

A later diagnostic

    T_stretch,y = ω_y * ∂Vy/∂y

if it used **this** `ω_y,current`, would mean:

```text
LEGAL
  stretching tendency of CURRENT PRESCRIBED world-vertical
  vorticity by a named vertical strain ∂Vy/∂y
  V_total unchanged
  T1 did not create this ω_y

ILLEGAL
  stretching of T1-generated vorticity
  stretching of tilted environmental vorticity
  vortex-tube conservation / mass-consistent intensification
  Ω_eff = Ω (1 + α ∂Vy/∂y)
```

Continuity remains YELLOW (`10`). Isolated updraft
`∇ · V_up = ∂Vy/∂y`. Composite `div_h` of inflow/outflow is
independently prescribed. Do **not** silently replace
`∂Vy/∂y` by `−div_h`.

Default from `25` / `27`: do not start stretching here.

---

## 19. Vertical-only vs full curl

Candidate A (`27`) asks for the world-vertical component.

Full `ω = ∇ × V` on this stack would also include:

- environmental `ω_h` from vertical shear;
- updraft and downdraft `ω_h` from `∇_h Vy`;
- rotation `ω_h` from `G'`;
- radial-field horizontal vorticity from `G'` and from
  radial structure, if any.

That mix is a **different** diagnostic problem (`15` §9.3 /
`25` §4.7: bookkeeping, not tilting). It is not required to
answer “where vertical rotation currently exists.”

**Verdict: VERTICAL ONLY.**

Full curl is CONDITIONAL later, as a separate named
diagnostic, not as a silent expansion of Candidate A.

---

## 20. Analytic vs finite-difference physics boundary

CURRENT synthetic operands have closed-form `V`, so
`ω_y(V_i)` is an exact identity.

A future dataset `V` would still be defined by

    ω_y = ∂Vx/∂z − ∂Vz/∂x

Evaluation might then be numerical. That does not change the
definition.

This file does **not** choose a finite-difference scheme, a
grid, or a `curl()` API.

---

## 21. Sanity cases

Assume CURRENT locked formulas. `ω_y,current = ω_y^Ω`.

| ID | Case | Expected |
| --- | --- | --- |
| A | `Ω = 0` | `ω_y = 0` everywhere |
| B | axis `r = 0`, interior | `ω_y = 2 Ω G(y)` |
| C | `r = σ √2`, `G ≠ 0` | `ω_y = 0` |
| D | `r > σ √2`, `G ≠ 0` | sign opposite the core |
| E | far field `r → ∞` | `ω_y → 0` |
| F | lids / outside `[y_b, y_t]` | `ω_y = 0` |
| G | `Ω → −Ω` | entire `ω_y` reverses |
| H | change constant `C` | `ω_y` unchanged |
| I | change updraft `W0` | `ω_y` unchanged |
| J | change inflow/outflow `A` | `ω_y` unchanged |
| K | change env shear or `W0` (T1 changes) | `ω_y,current` unchanged |

K is the T1 / `Ω` independence guard.

Additional:

| ID | Case | Expected |
| --- | --- | --- |
| L | `r = σ`, interior | `ω_y = Ω G exp(−1/2)` |
| M | `y = y_mid`, axis | `ω_y = 2 Ω` |

---

## 22. DEMO order of magnitude

**Kind:** dimensional illustration on CURRENT DEMO numbers.
Not a retune. Not a mesocyclone intensity.

DEMO rotation (`DEMO_SCENARIO.storm.rotation`):

    Ω = 0.005 s⁻¹
    σ = 4000 m
    [y_b, y_t] = [0, 6500] m
    y_mid = 3250 m
    center = (0, 0)

On the axis:

    ω_y^Ω(0, y) = 2 Ω G(y) = 0.01 G(y)   s⁻¹

| `y` (m) | `G` | axis `ω_y` (s⁻¹) |
| --- | --- | --- |
| 0 lid | 0 | 0 |
| 1000 | sin(π/6.5) ≈ 0.465 | ≈ 4.65 × 10⁻³ |
| 3250 mid | 1 | 1.00 × 10⁻² |
| 4000 | sin(π·4000/6500) ≈ 0.935 | ≈ 9.35 × 10⁻³ |
| 5000 | sin(π·5000/6500) ≈ 0.663 | ≈ 6.63 × 10⁻³ |
| 6500 lid | 0 | 0 |

At `r = σ`, `y_mid`:

    ω_y = Ω exp(−1/2) ≈ 3.03 × 10⁻³ s⁻¹

Environmental `|ω_h|` on CURRENT DEMO segments (T1
validation; different object):

    ∼ 10⁻² … 10⁻³ s⁻¹

Core `ω_y^Ω` is the **same unit family** as env `|ω_h|`
(both s⁻¹). They are not interchangeable: one is vertical
curl of painted spin, the other is horizontal vorticity of
the sounding.

T1 is s⁻². Do **not** compare `T_tilt,y` to `ω_y` without a
timescale, and do **not** integrate T1. Physics `22` §21
already forbids reading `1 / |T|_max` as a mesocyclone
formation time.

---

## 23. Scientific interpretation

**Correct:**

    this prescribed velocity field currently contains this
    local world-vertical curl

On the CURRENT stack, that curl is the shielded vortex of
`VerticalEnvelopeRotationField`.

**Incorrect:**

- this is the mesocyclone that shear generated;
- this is accumulated tilting;
- this proves realistic supercell rotation;
- the outer opposite-sign ring is a real observed atmospheric
  vortex (it is an analytic consequence of the Gaussian
  envelope);
- Inspector row `rotation` already *is* this `ω_y` (that row
  is `V_rotation`, m s⁻¹).

Model shape ≠ atmospheric claim.

---

## 24. Continuity

YELLOW (`10`) does **not** invalidate a local curl diagnostic.
Partial derivatives of a smooth interior `V` exist regardless
of `∇ · V ≠ 0`.

YELLOW **does** forbid reading `ω_y,current` as a
mass-consistent vortex or as proof that the laboratory
conserves mass.

Isolated rotation has `∇ · V_rot = 0` identically (`18`).
The composite does not. Curl of the rotation operand being
divergence-free does not upgrade the seven-operand sum.

---

## 25. Baroclinic / thermo

Curl bookkeeping does not require density, pressure, or
buoyancy.

The **origin** of CURRENT `ω_y` is prescribed `Ω`, not
modeled baroclinic generation, not a cold pool, not RFD/FFD.

Absence of thermo does not block this diagnostic. It blocks
claiming a thermodynamic source for it.

---

## 26. Anti-claims

```text
ω_y,current  ≠  T_tilt,y
ω_y,current  ≠  prognostic ω_y
ω_y,current  ≠  accumulated tilting
ω_y,current  ≠  V_rotation
ω_y,current  ≠  circulation Γ
ω_y,current  ≠  mesocyclone
ω_y,current  ≠  SRH
ω_y,current  ≠  environmental ω_h
ω_y,current  ≠  mass-consistent vortex
ω_y,current  ≠  T1-generated spin
```

`ω_y(V_total) = ω_y(V_rotation)` is a CURRENT STACK IDENTITY,
not a supercell theorem.

---

## 27. Decision output

### A. Is current world-vertical vorticity physically well-defined as a diagnostic of prescribed `V`?

**YES.**

The Cartesian component `ω_y = ∂Vx/∂z − ∂Vz/∂x` is well-defined
on the locked interior formulas. It is bookkeeping, not
dynamics.

### B. Exact canonical scalar?

    ω_y,current(P, t) = (∇ × V)_y = ∂Vx/∂z − ∂Vz/∂x

of a named `V` (total or operand). Default reading for
Candidate A: `V = V_total`, with the CURRENT identity
`ω_y(V_total) = ω_y(V_rotation)` stated explicitly.

### C. Units?

    s⁻¹

### D. For the current seven-operand stack, which operands contribute nonzero `ω_y`?

**Only prescribed rotation**
(`VerticalEnvelopeRotationField`).

### E. Is `ω_y(V_total) = ω_y(V_rotation)` true CURRENTLY?

**YES**, as a CURRENT STACK IDENTITY. Not a universal law.

### F. Does it depend on T1?

**NO.**

### G. Can it be evaluated without changing `V_total`?

**YES.** Observation of existing `V`.

### H. Does continuity YELLOW block it?

**NO.** It blocks over-reading the diagnostic as a
mass-consistent vortex.

### I. Is a vertical-only diagnostic sufficient for Candidate A?

**YES.** Full curl is a separate problem.

### J. Is it ready for a separate architecture SoT?

**YES.** This file is the physics derivation. Architecture
ownership, sampling, and wiring are **not** written here and
are **not** authorized by this file.

---

## 28. Compact lock-in

```text
coordinates:          X East, Y Up, Z South
                      right-handed: X × Y = Z
curl:                 ω = ∇ × V
vertical vorticity:   ω_y = ∂Vx/∂z − ∂Vz/∂x
canonical:            ω_y,current(P, t)   [s⁻¹]
kind:                 Eulerian diagnostic of prescribed V
                      not T1, not prognostic state

rotation V:           Vx = Ω E G dz
                      Vz = −Ω E G dx
ω_y^Ω:                2 Ω G E (1 − r²/(2σ²))
core:                 r = 0 → 2 Ω G
zero:                 r = σ √2
outer ring:           opposite sign; Gaussian-envelope shape
G(y):                 scales ω_y; G' does not enter ω_y
Ω > 0 core:           positive ω_y (CCW about +Y from above)
language:             positive / negative ω_y
                      not canonical cyclonic/anticyclonic

env / C:              ω_y = 0  (ω_h may be nonzero)
updraft:              ω_y = 0  (still used by T1)
downdraft:            ω_y = 0
radial three:         ω_y = 0  (mixed-derivative cancel)

CURRENT STACK:        ω_y(V_total) = ω_y(V_rotation)
                      identity, not a law

T1:                   independent; s⁻²; no arrow into this ω_y
stretching:           not this SoT; legal wording locked if
                      later multiplied by ∂Vy/∂y
full curl:            VERTICAL ONLY for Candidate A
continuity:           YELLOW; curl still defined
thermo:               not required; origin is Ω
architecture:         NOT WRITTEN
implementation:       NONE
```

---

## 29. STOP

```text
PHYSICS
  YES as diagnostic current ω_y of prescribed V

ARCHITECTURE
  NOT STARTED
  NOT AUTHORIZED BY THIS FILE

IMPLEMENTATION
  NONE

STRETCHING / T2 / ω→V / Ω / V_total / UI
  UNCHANGED / NOT STARTED
```

Do not implement `curl()`, `verticalVorticity()`, or a
diagnostic type because this file exists.
Do not start the Candidate A architecture SoT until commanded.
Do not treat physics `18` §18.2 as a substitute for this
diagnostic contract: `18` remains the velocity-field SoT.
Do not treat `27` as this derivation.
