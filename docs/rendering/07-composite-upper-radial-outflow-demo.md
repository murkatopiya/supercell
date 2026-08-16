# Composite Upper Radial Outflow Demo

**Status:** this document is the completed five-operand DEMO with
height-independent `RadialInflowField` and `UpperRadialOutflowField`.
Five-operand **wiring** with `LowerRadialInflowField` is specified in
`docs/rendering/08-composite-lower-radial-inflow-demo.md`. Live
storm-envelope **geometry** is specified in
`docs/rendering/10-deep-storm-envelope-scaling.md`. The
axis/east/north seeds defined here remain the current seed layout.
The updraft `[0, 2000]` and outflow `[1000, 2000]` defined here are
this slice's **historical** fixture, not the live DEMO column. The
inflow occupant does not remain: live DEMO replaces
`RadialInflowField` with `LowerRadialInflowField`.

## 1. Purpose

This document defines the completed browser DEMO integration that advected
tracers under mathematical composition of environmental wind, a
height-dependent half-sine updraft, a controlled Gaussian-modulated
rotation field, a controlled Gaussian-modulated radial inflow field,
and a compact upper-level radial outflow field.

It answers:

    How does one ScenarioConfig drive
    EnvironmentalWindField + VerticalEnvelopeUpdraftField
    + RotationField + RadialInflowField + UpperRadialOutflowField
    → CompositeVelocityField
    into the existing Simulation and Three.js tracer scene, adding
    UpperRadialOutflowField as a fifth independent operand, without
    changing physics formulas of the remaining fields or hodograph
    semantics?

Physics formulas remain those of:

- `docs/physics/04-environmental-wind-profile.md`
- `docs/physics/12-composite-velocity-field.md`
- `docs/physics/13-rotation-field.md`
- `docs/physics/14-radial-inflow-field.md`
- `docs/physics/15-vertical-updraft-envelope.md`
- `docs/physics/16-upper-radial-outflow-field.md`

`docs/physics/11-updraft-field.md` remains the isolated
height-independent updraft primitive. It is **not** a live-DEMO
operand.

This document owns **wiring**, DEMO outflow vertical bounds, DEMO
`outflowStrainRate`, seed confirmation, anti-oracle rules, and the
boundary between the 3D composite field and the 2D hodograph.

It is **not** a supercell, anvil, continuity-solved storm, or
pressure-driven model. The sum is controlled laboratory composition of
five already documented `VelocityField` mechanisms.

---

## 2. Architectural decision: add, do not replace

### Option A — add a fifth operand

```text
EnvironmentalWindField
+ VerticalEnvelopeUpdraftField
+ RotationField
+ RadialInflowField
+ UpperRadialOutflowField
```

### Option B — replace RadialInflowField with a signed / dual-mode field

```text
RadialInflowField with A < 0 or a direction flag
→
UpperRadialOutflowField
```

### Option C — keep inflow only below some height by a hidden mask

### Decision: A

Option B was already forbidden by
`docs/physics/14-radial-inflow-field.md` (negative `A` is not an
outflow mode) and `docs/physics/16-upper-radial-outflow-field.md`
(no inheritance, no signed dual-mode).

Option C would silently disable a height-independent field. That is a
new physics mechanism, not wiring.

`UpperRadialOutflowField` is an **additional** occupant. Inflow stays
on at every height, including inside the outflow layer. Their radial
contributions may oppose each other. That opposition is prescribed
superposition, not a bug (§10–§11).

Do not introduce a combined storm-field type. Operand count becomes
five.

---

## 3. Composition chain

```text
DEMO_SCENARIO (ScenarioConfig)
├─ createEnvironmentalWindProfile(config)
│    → EnvironmentalWindProfile
│    → EnvironmentalWindField
├─ createUpdraftField(config)
│    → VerticalEnvelopeUpdraftField
├─ createRotationField(config)
│    → RotationField
├─ createRadialInflowField(config)
│    → RadialInflowField
└─ createUpperRadialOutflowField(config)
     → UpperRadialOutflowField

app composition (composeDemoTracerSimulation):
  CompositeVelocityField([
    environmentField,
    updraftField,                 // VerticalEnvelopeUpdraftField
    rotationField,
    radialInflowField,
    upperRadialOutflowField,      // UpperRadialOutflowField
  ])
  → tracerSeeds → TracerParticle[]
  → Simulation (fixed timestep + Euler)
  → existing Three.js tracer scene (observe particle.position only)
```

Operand order appends the new field. The sum is still component-wise
and commutative for ordinary finite values; order is
documentation/readability, not a physical interaction rule.

Do not assemble `CompositeVelocityField` inside `src/scenario/`.
Do not invent `createScenarioRuntime`.
Do not add a feature flag that omits the fifth operand.

Hodograph path (unchanged, profile-only):

```text
DEMO_SCENARIO
  → createEnvironmentalWindProfile(config)
  → hodographPoints / shear / vorticity / SRH overlays
  → HodographPanel
```

`UpperRadialOutflowField`, the enveloped updraft, rotation, radial
inflow, and `CompositeVelocityField` must **not** feed hodograph
geometry or environmental diagnostics.

---

## 4. Scenario DTO

### Decision: new `storm.upperRadialOutflow` block

This is a new physics occupant, not a mode of inflow or updraft.
`docs/physics/16-upper-radial-outflow-field.md` §28 already requires a
dedicated block. Do **not** extend `storm.radialInflow` with a sign or
with `baseHeight` / `topHeight`.

```ts
interface ScenarioUpperRadialOutflow {
  centerX: number;              // m, world +X
  centerZ: number;              // m, world +Z
  outflowStrainRate: number;    // 1/s
  sigma: number;                // m
  baseHeight: number;           // m, world +Y
  topHeight: number;            // m, world +Y
}
```

Required:

```ts
storm: {
  updraft: ScenarioUpdraft;
  rotation: ScenarioRotation;
  radialInflow: ScenarioRadialInflow;
  upperRadialOutflow: ScenarioUpperRadialOutflow;
}
```

Meaning, half-sine `G(y)`, `outflowStrainRate` as near-axis strain at
`y_mid`, and constraints (`outflowStrainRate > 0`, `sigma > 0`,
`topHeight > baseHeight`, all finite) are owned by
`UpperRadialOutflowField` /
`docs/physics/16-upper-radial-outflow-field.md`.
The scenario layer stores plain numbers only.

### Naming lock-in

| Layer | Name |
| --- | --- |
| Physics type | `UpperRadialOutflowField` |
| Scenario DTO block | `storm.upperRadialOutflow` |
| Scenario DTO type | `ScenarioUpperRadialOutflow` |
| Scenario factory | `createUpperRadialOutflowField` |

Rejected aliases: `storm.outflow`, `storm.upperDivergence`,
`storm.radialOutflow` (omits vertical localization).

`ScenarioConfig` DTO modules remain physics-import-free.
`createUpperRadialOutflowField` lives in `src/scenario/`,
value-imports `UpperRadialOutflowField`, maps plain DTO numbers, and
delegates physical validation to that constructor.

The factory must read `config.storm.upperRadialOutflow`. It must
**not** copy `centerX` / `centerZ` / `sigma` / `baseHeight` /
`topHeight` from `storm.updraft`, `storm.rotation`, or
`storm.radialInflow`.

There is still no shared `storm.center`.

`stormMotion` remains a top-level sibling (hodograph / diagnostics
only).

Existing `storm.updraft`, `storm.rotation`, and `storm.radialInflow`
blocks are unchanged.

---

## 5. Scenario factory

```text
createUpperRadialOutflowField(config: ScenarioConfig)
  → UpperRadialOutflowField
```

Behavior:

1. read `config.storm.upperRadialOutflow` plain numbers
   (`centerX`, `centerZ`, `outflowStrainRate`, `sigma`,
   `baseHeight`, `topHeight`);
2. construct `new UpperRadialOutflowField({ ... })`;
3. let `UpperRadialOutflowField` enforce physical invariants.

Do not:

- construct `RadialInflowField` and multiply by `−G(y)`;
- accept a `kind` / `direction` flag;
- re-validate `topHeight > baseHeight` in the scenario layer;
- copy updraft or inflow numbers;
- assemble the composite.

Validation failures surface as `UpperRadialOutflowFieldError`.

`createUpdraftField`, `createRotationField`, and
`createRadialInflowField` are unchanged.

---

## 6. DEMO vertical layer

Current updraft (unchanged):

```text
baseHeight = 0 m
topHeight  = 2000 m
y_mid      = 1000 m
H          = 2000 m
F(1000)    = 1
F(1500)    = √2/2
F(2000)    = 0
```

Environment knots remain `0`, `1000`, `2000` m. Above `2000 m` the
profile clamps. Seeds sit at `y = 1000 m`. Isolated on-axis
half-sine updraft does **not** reach `topHeight` in finite continuous
time (`docs/physics/15-vertical-updraft-envelope.md` §17.3).

`TracerScene` camera is at `(4500, 3500, 4500)` looking at
`(500, 1000, −500)`; XZ grid is `8000 m`; axes helper is `1000 m`.
The existing `0–2000 m` column already sits between look-at and
camera height.

### Candidates

#### A — upper half of the updraft column: `[1000, 2000]`

```text
baseHeight = 1000 m
topHeight  = 2000 m
y_mid      = 1500 m
H          = 1000 m
G(1000)    = 0
G(1500)    = 1
G(2000)    = 0
```

| Question | Answer |
| --- | --- |
| First felt | after the tracer rises above `1000 m`; `G = 0` at the seeds |
| Simultaneous with updraft | yes, strongly around `y = 1500` (`F ≈ 0.707`, `G = 1`) |
| At `y = 2000` | both envelopes are `0`; inflow and rotation still act |
| Upper-level? | yes, relative to this laboratory column: off at the updraft maximum, on in the upper half |
| Scene | still the framed `0–2000 m` tower; no new vertical domain |
| `t = 0` samples | previous four operands unchanged; fifth operand is exactly `0` at the seed height |

Isolated on-axis time from `y = 1000` to `y = 1500` is about `28 s`
(`docs/rendering/06-composite-vertical-envelope-updraft-demo.md` §6).
`W0 dt = 2 m ≪ H_out`. The outflow peak is **inside** the updraft
layer, so tracers do not need to reach the updraft lid (which they
do not, continuously) in order to sample `G ≈ 1`.

#### B — from updraft maximum through a layer above the lid: `[1000, 3000]`

```text
y_mid = 2000 m = updraft topHeight
```

Peak outflow sits on the updraft lid, where `F = 0` and isolated
ascent never arrives. `2000–3000 m` is above env `h_max`, so shear
stops while the envelope continues. Camera still sees `3000 m`, but
the peak is the least reachable part of the layer. Rejected.

#### C — entirely above the updraft: `[2000, 4000]` or `[1500, 3500]`

A layer that **starts** at `2000 m` is unreliable from current seeds:
continuous isolated ascent never enters it. `[1500, 3500]` delays
first contact until `y = 1500` and puts `y_mid` at `2500 m`, above
env clamp and above the updraft lid. Both invent a vertical domain
that the current profile and scene were deliberately not extended
into (`docs/rendering/06-composite-vertical-envelope-updraft-demo.md`
rejected `topHeight = 4000` for the updraft for the same reason).
Rejected for this DEMO.

#### D — copy the updraft window: `[0, 2000]`

`G(1000) = 1` at the seeds. Outflow would be max at Reset, at the
same height as peak lift. That is not an upper-level mechanism; it
retunes `t = 0` radial balance. Forbidden by the “do not copy
automatically” rule. Rejected.

#### E — thin cap: `[1500, 2000]`

`H = 500 m`, `y_mid = 1750 m`. First contact only after ~`28 s` of
isolated ascent, then a short, stiff window (`G' ~ 1/H`). Env
advection can carry tracers out of the Gaussian core on a similar
timescale (`σ / |V_env| ≈ 63 s` at `y = 1000`). Too brief.
Rejected.

### Canonical DEMO bounds

**Candidate A is canonical:**

```text
storm.upperRadialOutflow.baseHeight = 1000 m
storm.upperRadialOutflow.topHeight  = 2000 m
y_mid,outflow                       = 1500 m
H_out                               = 1000 m
```

Reasons:

1. **Upper-level relative to this column.** `G = 0` at the updraft
   maximum and at the seeds; `G = 1` in the upper half.
2. **Observable without reaching the updraft lid.** Peak at
   `y = 1500 m`, where `F` is still `√2/2`.
3. **Does not retune Reset.** At seed height the fifth operand is
   identically zero.
4. **Same documented vertical domain as env and updraft.** No
   undocumented `2000–4000 m` storey.
5. **Scene already frames it.** Do not raise `topHeight` or the
   camera to chase a taller plume.
6. **Coincidence of `topHeight = 2000` with the updraft lid, and of
   `baseHeight = 1000` with updraft `y_mid` / seeds, is a fixture
   choice, not an API invariant.** The factory must still read the
   outflow DTO’s own numbers.

`baseHeight < 0` remains allowed by physics and unused here.

Do not change updraft `[0, 2000]`, env knots, or `dt` in this slice.

---

## 7. DEMO `outflowStrainRate`

Inflow, rotation, updraft, env, `dt`, and Euler are **unchanged**:

```text
A_in = 0.005 1/s
Ω    = 0.02 rad/s
W0   = 20 m/s
σ    = 1000 m   (fixture, all current storm Gaussians)
```

For the canonical radial profile at `G = 1`:

```text
|v_out|_max = A_out * σ / √e
```

At DEMO `σ = 1000 m`, `1/√e ≈ 0.6065`, so
`|v_out|_max ≈ 606.5 A_out` (m/s).

At the east/north seed radius `r = 600 m`,
`E = exp(−0.18) ≈ 0.8353`, so
`|v_out|(r=600, G=1) ≈ 501.2 A_out` (m/s).

### Characteristic speeds of this historical DEMO fixture

| Mechanism | Peak speed | At `r = 600 m` and unit envelope |
| --- | --- | --- |
| Environment at `y = 1000 m` | `15.8 m/s` | same (horizontally homogeneous) |
| Environment at `y = 1500 m` | `≈ 21.4 m/s` | interpolated knots |
| Environment at `y = 2000 m` | `26.9 m/s` | then-`h_max` knot (historical; live DEMO after `09` interpolates past `2000`) |
| Updraft `W0` | `20 m/s` | `16.7 m/s` |
| Rotation | `12.1 m/s` | `10.0 m/s` |
| Inflow | `3.03 m/s` | `2.51 m/s` |

Environment remains the dominant horizontal advection. Inflow is
already a residual compared with env; the live DEMO does not require
monotone decreasing `r`
(`docs/rendering/06-composite-vertical-envelope-updraft-demo.md` §9).
Outflow must be judged the same way: a residual radial tendency, not
a cannon that overpowers env.

### Candidates for `A_out`

| `A_out` | `|v_out|_max` | vs inflow `3.03` | vs rotation `12.1` | vs env `16–27` | Net vs inflow at `G = 1` |
| --- | --- | --- | --- | --- | --- |
| `0.005` | `3.03 m/s` | equal | much weaker | much weaker | cancel; never net outward except the single height `G = 1` |
| `0.010` | `6.07 m/s` | `2×` | half | weaker | net `+A_in` outward |
| `0.015` | `9.10 m/s` | `3×` | comparable | weaker | net `+2 A_in` |
| `0.020` | `12.1 m/s` | `4×` | equal rotation | still `<` env | net `+3 A_in`; starts to duplicate rotation’s scale |
| `0.040` | `24.3 m/s` | `8×` | `2×` rotation | ≈ env at `2000 m` | upper-layer cannon |

If centers and `sigma` coincide (DEMO fixture), storm radial sum
inside the outflow layer is

```text
v_r,storm = r E ( -A_in + A_out G(y) )
```

Net outward when

```text
G(y) > A_in / A_out
```

For `A_out = 0.010`:

```text
G > 1/2
y ∈ (1000 + 1000/6, 2000 − 1000/6) ≈ (1167, 1833) m
```

Isolated on-axis time `1000 → 1167 m` is about `8 s`. Reachable
before env core-exit (`σ / |V_env| ≈ 63 s` at `y = 1000`).

For `A_out = 0.005`, net outward never occurs as a band. That would
teach “outflow only cancels inflow at one height”, which is a
continuity-adjacent story this DEMO must not tell.

`A_out = 0.020` equals rotation’s peak scale and blurs the
tangential vs radial lesson. `0.040` competes with env.

No candidate uses `A_out = A_in`, `A_out = Ω`,
`H = W0 π / (2 A)`, or any other continuity pairing.

### Canonical DEMO strain

```text
storm.upperRadialOutflow.outflowStrainRate = 0.01 1/s
```

Reasons:

1. **Noticeable.** Peak `6.07 m/s` is twice inflow and a distinct
   third horizontal storm scale under rotation (`12.1`) and env
   (`16–27`).
2. **Controlled.** At the east seed radius and `G = 1`, outflow
   `≈ 5.0 m/s` versus inflow `2.5 m/s` and rotation `10.0 m/s`.
   Env at `y = 1500 m` is still `≈ 21 m/s`. The fifth operand
   changes the radial residual; it does not reverse the laboratory.
3. **Net outward exists as a band**, not a single height:
   `G > 1/2` on `≈ (1167, 1833) m`.
4. **At `G = 1`, net storm radial equals `+A_in` in magnitude.**
   Aloft, outward residual is as strong as the low-level inward
   residual — readable, not a coupled identity
   `A_out = A_in`.
5. **Does not retune `t = 0`.** At the seeds `G = 0`, so
   `A_out` is invisible at Reset.
6. **Not a continuity formula.** `0.01 ≠ 0.005`, `0.01 ≠ 0.02`,
   and it is not derived from `W0` or `H`.

Do not change `A_in`, `Ω`, `W0`, or env winds in this slice.

---

## 8. Center and sigma

```text
storm.upperRadialOutflow.centerX = 0 m
storm.upperRadialOutflow.centerZ = 0 m
storm.upperRadialOutflow.sigma   = 1000 m
```

These numbers match the current updraft, rotation, and inflow DEMO
fixtures.

**This is a DEMO fixture choice, not an API coupling.**

The DTO stores its own six numbers. The factory reads only
`storm.upperRadialOutflow`. Shared centers/`sigma` in
`DEMO_SCENARIO` do not create `storm.center` and do not authorize
copying across blocks.

A later experiment may offset the outflow axis. v1 DEMO does not,
so that the §10 radial residual
`-A_in + A_out G(y)` remains a one-dimensional height lesson rather
than a second horizontal geometry.

---

## 9. Seeds

Keep the current three seeds at one height:

```text
(0,    1000,  0)     // axis at Reset: r = 0, F = 1, G = 0
                     //        V_rotation = 0, V_inflow = 0, V_outflow = 0
(600,  1000,  0)     // east:  r = 0.6 σ, F = 1, G = 0
                     //        rotation tangent north (−Z); inflow west (−X);
                     //        outflow = 0 at t = 0
(0,    1000, -600)   // north: r = 0.6 σ, F = 1, G = 0
                     //        rotation tangent west (−X); inflow south (+Z);
                     //        outflow = 0 at t = 0
```

Units: meters.

### Why keep them

1. **`G(1000) = 0`.** The new mechanism is off at Reset. Initial
   samples of env / updraft / rotation / inflow match the previous
   DEMO. The fifth operand is an along-trajectory lesson, not a
   silent `t = 0` retune.
2. **Axis seed** still has zero radial outflow while `r = 0`. Env
   immediately carries it off the geometric axis, as in the current
   DEMO; that is already understood.
3. **East / north seeds** still isolate rotation vs inflow at
   `t = 0` (orthogonal world components). After they rise, the same
   points (or their displaced descendants) pick up outflow on the
   same cardinal axes: east `Vx > 0` from outflow, north `Vz < 0`.
4. **Updraft at the seeds is maximum** (`F = 1`), so tracers are
   lifted into the outflow layer. Isolated on-axis time to
   `y = 1500 m` is ~`28 s`; net-outward band begins ~`8 s`.
5. A fourth seed at `y = 1500 m` would only restate `G = 1` that
   the rising path already shows. Do not add a particle cloud. Do
   not return the historical far-east `1800 m` seed.

Between-seed contrast at `t = 0` stays rotation vs inflow. Outflow
contrast is height, not a new horizontal seed.

---

## 10. Simultaneous superposition

The DEMO is **not** a staged state machine:

```text
inflow → rotation → updraft → outflow     // forbidden story
```

All five fields are sampled at every position and added. A tracer
feels a mechanism when it is in a region where that contribution is
nonzero.

Therefore these may act at once:

- inward radial `RadialInflowField` (every height);
- outward radial `UpperRadialOutflowField` (only where `G > 0`);
- tangential `RotationField` (every height);
- vertical enveloped updraft (where `F > 0`);
- environmental advection (`Vy = 0`).

Current `RadialInflowField` is height-independent. It is **not**
switched off inside the outflow layer. No hidden `y` mask.

A visual path that looks like “enter, rise, spread” is possible. It
is **not** an invariant of this superposition. Env can carry a
tracer out of the core before `G` is large; inflow can still win
where `G < 1/2`; a numerical step can land above `2000 m`.

---

## 11. Composite radial residual (analysis only)

When DEMO centers and `sigma` coincide, the **storm** radial part
inside the outflow layer is

```text
v_r,storm(r, y) = r E(r) ( -A_in + A_out G(y) )
```

This identity is for parameter analysis and tests of signs. It is
**not** a combined field type and **not** an API invariant. If a
cloned config offsets one center, the identity is gone.

With lock-in `A_in = 0.005`, `A_out = 0.01`:

| Height | `G` | `-A_in + A_out G` | Storm radial |
| --- | --- | --- | --- |
| `y ≤ 1000` (incl. seeds) | `0` | `−0.005` | inward, inflow only |
| `y ≈ 1167` | `1/2` | `0` | storm radial cancel; env + rotation remain |
| `y = 1500` | `1` | `+0.005` | outward, equal in magnitude to low-level inflow |
| `y ≈ 1833` | `1/2` | `0` | cancel again |
| `y ≥ 2000` | `0` | `−0.005` | inward, inflow only |

Do not assert that outflow “always wins” in the overlap. Tests must
allow both contributions to be present, with net sign following
`G ≷ 1/2` **only** under the coincident-center fixture.

Environment and rotation are not in `v_r,storm`. Live `r(t)` is the
residual of all five operands.

---

## 12. Formula of this historical DEMO fixture

```text
V_total =
    V_environment(y)
  + V_vertical_envelope_updraft(r_up, y)
  + V_rotation(r_rot)
  + V_radial_inflow(r_in)
  + V_upper_radial_outflow(r_out, y)
```

where

```text
V_upper_radial_outflow
  = ( +A_out E_out dx G(y),  0,  +A_out E_out dz G(y) )

E_out(r) = exp(−r² / (2 σ_out²))

G(y) = sin(π (y − 1000) / 1000)    if 1000 ≤ y ≤ 2000
G(y) = 0                           otherwise
```

Updraft, rotation, and inflow formulas are unchanged from
`docs/rendering/06-composite-vertical-envelope-updraft-demo.md`.

App composition owns assembly:

```text
profile  = createEnvironmentalWindProfile(config)
envField = new EnvironmentalWindField(profile)
updraft  = createUpdraftField(config)
rotation = createRotationField(config)
inflow   = createRadialInflowField(config)
outflow  = createUpperRadialOutflowField(config)
field    = new CompositeVelocityField(
             [envField, updraft, rotation, inflow, outflow])
```

Unchanged DEMO numbers:

```text
updraft:     W0 = 20 m/s, σ = 1000 m, [0, 2000], center (0,0)
rotation:    Ω = 0.02 rad/s, σ = 1000 m, center (0,0)
inflow:      A_in = 0.005 1/s, σ = 1000 m, center (0,0)
timestep:    0.1 s
integrator:  EulerIntegrator
environment / stormMotion: hodograph fixture, unchanged
```

---

## 13. Dynamics

At every fixed step every operand is re-sampled at the current
position. As a tracer moves, all of these change:

- `y` → env wind, updraft `F(y)`, outflow `G(y)`;
- `(x, z)` relative to each fixed center → each Gaussian `E(r)`
  and the radial/tangential direction;
- therefore inflow, outflow, and rotation magnitudes.

No mechanism is “started after” another procedurally.

Near the seeds, shortly after Reset:

- `G = 0` or small → outflow weak;
- `F ≈ 1` → lift strong;
- inflow inward; rotation tangential; env ~`16 m/s`.

Around `y = 1500 m`, if the tracer is still in the core:

- `G = 1`, `F ≈ 0.707`;
- storm radial net outward under the coincident fixture;
- env ~`21 m/s` still dominates horizontally.

At `y ≥ 2000 m` (**this historical slice's** lids):

- `F = 0`, `G = 0`;
- updraft and outflow contribute `(0,0,0)`;
- environment still advects horizontally (in **this historical
  slice**, clamped to the `2000 m` knot; live DEMO after `09`
  interpolates `2000–6000–12000`);
- rotation and inflow still act.

`Vy → 0` at the updraft lid is still the half-sine boundary, not a
tropopause. Disappearance of outflow at `y = 2000 m` is the outflow
envelope lid, **not** an anvil or upper-level storm-top process.

Do not start a downdraft or continuity solver here.

---

## 14. Anti-oracles

Forbidden live-DEMO claims:

```text
y(t) = y0 + W0 t
      // height-independent on-axis updraft

ξ(t) = (2/π) arctan( tan(π ξ0 / 2) exp(π W0 t / H) )
      // isolated VerticalEnvelopeUpdraftField; needs constant r

r(t) = r0
      // isolated RotationField circle

r(t) = r0 exp(−A_in t)
      // unbounded linear inflow; not even isolated RadialInflowField

r(t) = r0 exp(+A_out t)
      // unbounded linear outflow; not even isolated
      // UpperRadialOutflowField, and here G(y) and r both change
```

Also forbidden:

- monotone composite `r`;
- monotone horizontal distance from the storm axis;
- any closed-form five-operand trajectory;
- `Vy = W0` at every height on the axis;
- the staged sequence `enters → rises → exits` as an invariant;
- `v_r,storm` identity when centers/`sigma` have been mutated
  apart.

Isolated oracles remain valid only in their isolated tests. None is
a DEMO / UI / integration expectation.

---

## 15. Continuity boundary

The simultaneous presence of

```text
RadialInflowField
VerticalEnvelopeUpdraftField
UpperRadialOutflowField
```

is still controlled superposition. Parameters are **not** tied by a
continuity equation.

Do **not** assert:

```text
inflow = air entering
updraft = same air rising
upper outflow = same air leaving
```

in a mass-conserving sense.

Allowed wording:

> controlled prescribed superposition with a lower/core inward
> tendency, vertical ascent, and an upper-level outward tendency.

Forbidden wording:

- continuity-solved;
- mass-conserving / divergence-free storm;
- realistic supercell circulation;
- pressure-driven outflow;
- anvil / tropopause / storm-top divergence.

`docs/physics/16-upper-radial-outflow-field.md` §18 already forbids
claim (3). This DEMO does not reopen it.

---

## 16. Hodograph boundary

Unchanged:

- hodograph represents only `EnvironmentalWindProfile`;
- upper radial outflow does not add a vertical axis, a second
  curve, or an overlay;
- rotation, inflow, and the enveloped updraft still do not;
- shear / horizontal vorticity / streamwise–crosswise / SRH remain
  environmental + `stormMotion` diagnostics;
- mutating `storm.upperRadialOutflow.*` must not change hodograph
  points (and still must not when mutating other storm blocks);
- 3D composite field and 2D hodograph intentionally show different
  aspects of the same `ScenarioConfig`.

---

## 17. Rendering and runtime controls

Physics / rendering boundary unchanged:

- `TracerScene` continues to read `particle.position` only;
- no outflow arrows, anvil, plume, trails, divergence mesh, cloud,
  extra particles, or GPU particles;
- existing spheres, axes, and grid are sufficient.

Pause / `1×`–`20×` / Reset continue to follow
`docs/rendering/02-tracer-runtime-controls.md` without changing
numerical `dt`. Fast playback is not a reason to enlarge `H_out`,
`A_out`, or the camera.

No scene-scale problem was found that would justify moving the
camera or grid. The `1000–2000 m` layer is inside the current
frustum. Do not change camera, grid, `dt`, or Euler in this slice.

Reset restores the three seed positions and `clock.time = 0`.

---

## 18. App copy / scientific wording

After implementation, UI copy may say that the tracer DEMO includes:

- environmental wind;
- a vertically structured updraft;
- rotation;
- radial inflow;
- upper radial outflow.

It must **not** call the live DEMO:

- a realistic supercell;
- a complete storm;
- continuity-solved flow;
- a mesocyclone;
- pressure-driven circulation;
- an anvil.

Disappearance of outflow above `topHeight` must **not** be described
as realistic anvil or upper-level outflow in the meteorological
storm-top sense. Those mechanisms are absent.

---

## 19. Testing policy (integration)

Focused integration tests in the existing file
`src/simulation/demoCompositeUpdraft.integration.test.ts` (keep the
filename). Do **not** re-prove unit/acceptance physics of
`UpperRadialOutflowField`.

Let `G(y)` and `E(r)` be the DEMO outflow envelope/Gaussian from
§6–§8. Let `A_out = 0.01`, `A_in = 0.005`.

Required:

1. `createUpperRadialOutflowField(DEMO_SCENARIO)` maps DTO →
   `UpperRadialOutflowField` with DEMO params. On the axis,
   `V = (0,0,0)` at `y_mid = 1500` and at the lids. Off-axis at
   `y = 1500`, `r = σ`, `|V| = A_out σ / √e` within tolerance.
   At `y = 1000` and `y = 2000`, off-axis `V` is `0` within
   `sin(π)` tolerance.
2. Factory reads only `storm.upperRadialOutflow`: a cloned config
   with different updraft / rotation / inflow `centerX` / `sigma` /
   bounds still produces the outflow about the outflow DTO
   center/sigma/bounds.
3. Mutating updraft, rotation, or inflow on a clone does not change
   samples of the factory outflow field.
4. Demo composition matches
   `sample(env)+sample(updraft)+sample(rotation)+sample(inflow)+sample(outflow)`
   at representative points: the three seeds, one interior point in
   the outflow layer, one point below outflow `baseHeight`, one
   point above outflow `topHeight`.
5. Below the outflow layer (e.g. `y = 500`, `r > 0`), the outflow
   contribution is exactly `(0,0,0)`; other operands still sample.
6. At outflow `y_mid = 1500`, off-axis, outflow is radially
   outward (`dx Vx + dz Vz > 0`) and `Vy = 0`.
7. Axis contribution of outflow is `0` at every tested height.
8. Cardinal east/north points at `y = 1500`: east outflow `Vx > 0`
   only; north outflow `Vz < 0` only (world). Compare
   `docs/physics/16-upper-radial-outflow-field.md` §17.
9. Overlap layer (e.g. east at `y = 1500`): inflow `Vx < 0` and
   outflow `Vx > 0` are **both** present. Do **not** require that
   outflow always wins at every overlap point. Under the coincident
   DEMO fixture, at `y = 1500` and `r = 600`, net storm radial
   (`inflow + outflow`) is outward; at the seeds (`G = 0`) net
   storm radial is inward. That pair is the height lesson, not a
   universal “outflow wins” invariant.
10. After several fixed steps: near-axis `y` increases while still
    below `2000 m`; do **not** compare with linear-y, isolated
    half-sine `y(t)`, circle, `r = r0 e^{±At}`, or monotone
    composite `r`. Horizontal drift from env remains allowed and
    expected.
11. Reset restores the three seed positions and `clock.time = 0`.
12. Hodograph points are unchanged by mutating
    `storm.upperRadialOutflow` (and still unchanged by mutating
    other storm blocks).
13. `ScenarioConfig.ts` and `DEMO_SCENARIO.ts` remain
    physics-import-free;
    `createUpperRadialOutflowField.ts` value-imports
    `UpperRadialOutflowField`.
14. Factory independence: outflow DTO `centerX` / `sigma` /
    `baseHeight` / `topHeight` need not equal the updraft or
    inflow blocks in the type system; DEMO equality is asserted as
    a fixture snapshot, not as a copy from another block.

At the seeds, keep the existing four-operand expectations **plus**
outflow `= 0` (because `G(1000) = 0`):

- axis: `Vy = W0 F(seed.y)`; rotation = inflow = outflow = 0;
- east: rotation `Vz` only, inflow `Vx < 0` only, outflow `0`;
- north: analogous.

Do **not** assert isolated outflow closed-form `r(t)` for DEMO
tracers.

Scenario-layer tests in
`docs/architecture/01-scenario-config.md` add the DTO → factory
mapping item. They still must not duplicate the
`UpperRadialOutflowField` validation matrix.

---

## 20. Relationship to earlier tracer docs

| Document | Role after this slice |
| --- | --- |
| `01-tracer-scene.md` | Fixed-step loop, observe-only Three.js, layout |
| `02-tracer-runtime-controls.md` | Pause / timeScale / Reset; still applies unchanged |
| `03-composite-updraft-demo.md` | Historical env + height-independent `UpdraftField` |
| `04-composite-rotation-demo.md` | Historical env + old updraft + rotation |
| `05-composite-radial-inflow-demo.md` | Historical four-field DEMO with old height-independent updraft; seeds kept |
| `06-composite-vertical-envelope-updraft-demo.md` | Historical four-field DEMO with `VerticalEnvelopeUpdraftField`; immediately before this fifth operand |
| This document (`07`) | Historical five-operand DEMO with height-independent `RadialInflowField`; superseded for the inflow occupant by `08` |
| `08-composite-lower-radial-inflow-demo.md` | Five-operand **wiring** (inflow occupant `LowerRadialInflowField`); live envelope **geometry** is `10` |

Historical statements in `06` that there is no upper-level outflow
operand describe that completed slice. The three-seed layout in
`04`/`05`/`06` remains the current seed contract, with the additional
outflow interpretation in §9 (`G(1000) = 0`).

---

## 21. Explicit non-goals

- downdraft;
- continuity solver or DEMO parameter coupling among `A_in`,
  `A_out`, `W0`, `H`;
- pressure / buoyancy / thermodynamics;
- anvil / cloud / precipitation / cold pool / gust front;
- tilting / stretching / mesocyclone dynamics;
- storm axis that translates with `stormMotion`;
- replacing or masking `RadialInflowField` aloft;
- `storm.radialInflow` signed dual-mode;
- extra tracer seeds / particle cloud;
- outflow arrows, meshes, trails, GPU particles;
- changing `W0`, `Ω`, `A_in`, env winds, updraft bounds, `dt`, or
  Euler → RK2;
- changing camera / grid unless a separately documented scene
  problem appears (none found);
- changing hodograph physics or overlay math;
- `createScenarioRuntime`;
- assembling `CompositeVelocityField` inside the scenario module;
- DEMO linear-y, isolated half-sine, circular, or
  `r = r0 e^{±At}` trajectory oracles.

Do not change physics formulas of `UpperRadialOutflowField`,
`VerticalEnvelopeUpdraftField`, `RadialInflowField`,
`RotationField`, or environment.

---

## 22. Lock-in summary

```text
field:                     UpperRadialOutflowField
DTO block:                 storm.upperRadialOutflow
                           (ScenarioUpperRadialOutflow)
factory:                   createUpperRadialOutflowField
                           → UpperRadialOutflowField
center:                    (0, 0) m   // DEMO fixture, not API coupling
sigma:                     1000 m     // DEMO fixture, not API coupling
outflowStrainRate:         0.01 1/s
baseHeight:                1000 m
topHeight:                 2000 m
outflow y_mid:             1500 m
seed strategy:             keep (0,1000,0), (600,1000,0), (0,1000,-600)
                           G(1000) = 0; t = 0 four-field samples unchanged
current composite operands:
  EnvironmentalWindField
  + VerticalEnvelopeUpdraftField
  + RotationField
  + RadialInflowField
  + UpperRadialOutflowField
relationship to radial inflow:
  both present; inflow stays height-independent;
  net storm radial outward iff G > A_in/A_out = 1/2
  under coincident DEMO centers/sigma
continuity claim:          prescribed superposition; not mass-consistent
hodograph impact:          none
renderer impact:           none (observe particle.position only)
```

---

## 23. First implementation slice (code, after this doc)

1. Add `ScenarioUpperRadialOutflow` and required
   `storm.upperRadialOutflow` on `ScenarioConfig`.
2. Set `DEMO_SCENARIO.storm.upperRadialOutflow` to
   `{ centerX: 0, centerZ: 0, outflowStrainRate: 0.01, sigma: 1000,
     baseHeight: 1000, topHeight: 2000 }`.
   Do not change updraft / rotation / inflow / env / `stormMotion` /
   seeds / `dt`.
3. Create `src/scenario/createUpperRadialOutflowField.ts`:
   value-import `UpperRadialOutflowField`, map all six DTO numbers,
   read only that block.
4. Append the factory result as the fifth operand in
   `composeDemoTracerSimulation`.
5. Adjust app copy: include upper radial outflow; no supercell /
   continuity-solved / anvil claims.
6. Confirm `docs/architecture/01-scenario-config.md` matches this
   DTO/factory occupant (if not already applied in the docs pass).
7. Adjust integration tests (§19); keep Reset seed expectations
   and `G(1000) = 0` at the seeds.
8. `npm test` and `npm run typecheck`.

Stop. Do not change `TracerScene` internals, hodograph composition,
physics formulas, `dt`, Euler, `W0`, `Ω`, `A_in`, env winds, or the
seed set. Do not start downdraft or a continuity solver.

### Files expected to change

- `src/scenario/ScenarioConfig.ts`
- `src/scenario/DEMO_SCENARIO.ts`
- `src/scenario/createUpperRadialOutflowField.ts` (create)
- `src/app/composeDemoTracerSimulation.ts`
- `src/app/App.tsx` (copy only)
- `src/simulation/demoCompositeUpdraft.integration.test.ts`
- `docs/architecture/01-scenario-config.md` (if still describing
  the four-operand occupant)

### Files not to touch

- `src/physics/storm/UpperRadialOutflowField.ts` formulas;
- `src/physics/storm/RadialInflowField.ts`;
- `src/physics/storm/VerticalEnvelopeUpdraftField.ts`;
- `src/physics/storm/RotationField.ts`;
- `src/physics/storm/UpdraftField.ts`;
- `src/rendering/**`;
- `src/ui/**` except app copy if it lives in `App.tsx`;
- hodograph modules.

---

## 24. Core lesson

Live DEMO now superposes a compact upper radial outflow on the
existing four operands:

```text
G(y) = sin(π (y − 1000) / 1000)    for 1000 ≤ y ≤ 2000
G(y) = 0                           otherwise
Vx   = +0.01 E dx G
Vz   = +0.01 E dz G
Vy   = 0
```

At Reset, `G(1000) = 0`, so the fifth operand is off. As tracers
rise toward `1500 m`, outflow turns on while inflow continues.
Net storm radial becomes outward only where `G > 1/2`, and only
under the coincident-center fixture. That is a prescribed residual,
not mass continuity, and not an anvil.
