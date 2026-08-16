# Composite Vertical Envelope Updraft Demo

**Status:** this document is the completed four-field DEMO with
`VerticalEnvelopeUpdraftField` and no upper radial outflow operand.
Five-operand wiring is specified in
`docs/rendering/08-composite-lower-radial-inflow-demo.md`. Live
storm-envelope **geometry** is specified in
`docs/rendering/10-deep-storm-envelope-scaling.md`. The
axis/east/north seeds defined here remain the current seed layout.
The updraft `[0, 2000]` bounds defined here are this slice's
**historical** fixture, not the live DEMO column.

## 1. Purpose

This document defines the current browser DEMO integration that advects
tracers under mathematical composition of environmental wind, a
height-dependent half-sine updraft, a controlled Gaussian-modulated
rotation field, and a controlled Gaussian-modulated radial inflow field.

It answers:

    How does one ScenarioConfig drive
    EnvironmentalWindField + VerticalEnvelopeUpdraftField
    + RotationField + RadialInflowField
    → CompositeVelocityField
    into the existing Simulation and Three.js tracer scene, replacing the
    height-independent UpdraftField operand, without changing physics
    formulas of the remaining fields or hodograph semantics?

Physics formulas remain those of:

- `docs/physics/04-environmental-wind-profile.md`
- `docs/physics/12-composite-velocity-field.md`
- `docs/physics/13-rotation-field.md`
- `docs/physics/14-radial-inflow-field.md`
- `docs/physics/15-vertical-updraft-envelope.md`

`docs/physics/11-updraft-field.md` remains the isolated height-independent
primitive. It is **not** a live-DEMO operand after this slice.

This document owns **wiring**, DEMO vertical bounds, seed confirmation,
anti-oracle rules, and the boundary between the 3D composite field and
the 2D hodograph.

It is **not** a supercell, anvil, continuity-solved storm, or
pressure-driven model. The sum is controlled laboratory composition of
four already documented `VelocityField` mechanisms.

---

## 2. Architectural decision: replace, do not add

### Option A — replace the DEMO updraft operand

```text
UpdraftField
→
VerticalEnvelopeUpdraftField
```

New live DEMO:

```text
EnvironmentalWindField
+ VerticalEnvelopeUpdraftField
+ RotationField
+ RadialInflowField
```

### Option B — keep both updrafts

```text
EnvironmentalWindField
+ UpdraftField
+ VerticalEnvelopeUpdraftField
+ RotationField
+ RadialInflowField
```

### Decision: A

Option B is physically vacuous for this DEMO. Both updraft types share
the same radial Gaussian. Their vertical velocities would add:

```text
Vy = W0 E_r(r) (1 + F(y))
```

Consequences:

- at `y_mid`, peak lift becomes `2 W0` without renaming
  `peakVerticalVelocity`;
- above `topHeight`, the old field still supplies `W0 E_r`, so the
  envelope never actually ends;
- the new mechanism's lesson (bounded vertical life cycle) is cancelled
  by the old infinite column.

DEMO is a controlled laboratory overlay, not a stack of every physics
type that exists. `UpdraftField` stays as an isolated primitive with its
own tests. Live DEMO uses exactly one updraft occupant.

Operand count remains four. Do not introduce a combined storm-field type.

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
└─ createRadialInflowField(config)
     → RadialInflowField

app composition (composeDemoTracerSimulation):
  CompositeVelocityField([
    environmentField,
    updraftField,          // VerticalEnvelopeUpdraftField
    rotationField,
    radialInflowField,
  ])
  → tracerSeeds → TracerParticle[]
  → Simulation (fixed timestep + Euler)
  → existing Three.js tracer scene (observe particle.position only)
```

Operand order `[environment, updraft, rotation, radialInflow]` is
unchanged as a list shape. The updraft slot's physics type changes.
The sum is still component-wise and commutative for ordinary finite
values; order is documentation/readability, not a physical interaction
rule.

Do not assemble `CompositeVelocityField` inside `src/scenario/`.
Do not invent `createScenarioRuntime`.
Do not add a feature flag that selects `UpdraftField` vs
`VerticalEnvelopeUpdraftField`.

Hodograph path (unchanged, profile-only):

```text
DEMO_SCENARIO
  → createEnvironmentalWindProfile(config)
  → hodographPoints / shear / vorticity / SRH overlays
  → HodographPanel
```

`VerticalEnvelopeUpdraftField`, rotation, radial inflow, and
`CompositeVelocityField` must **not** feed hodograph geometry or
environmental diagnostics.

---

## 4. Scenario DTO

### Decision: extend `storm.updraft`, do not add a second updraft block

Current DEMO already has one updraft slot:

```ts
storm.updraft: {
  centerX;
  centerZ;
  peakVerticalVelocity;
  sigma;
}
```

`VerticalEnvelopeUpdraftField` needs two additional plain numbers.
v1 extends that same block:

```ts
interface ScenarioUpdraft {
  centerX: number;                 // m, world +X
  centerZ: number;                 // m, world +Z
  peakVerticalVelocity: number;    // m/s
  sigma: number;                   // m
  baseHeight: number;              // m, world +Y
  topHeight: number;               // m, world +Y
}
```

Required:

```ts
storm: {
  updraft: ScenarioUpdraft;           // now vertically structured
  rotation: ScenarioRotation;
  radialInflow: ScenarioRadialInflow;
}
```

Meaning, half-sine formula, `peakVerticalVelocity` as global max at
`r = 0` and `y_mid`, and constraints (`peakVerticalVelocity > 0`,
`sigma > 0`, `topHeight > baseHeight`, all finite) are owned by
`VerticalEnvelopeUpdraftField` /
`docs/physics/15-vertical-updraft-envelope.md`.
The scenario layer stores plain numbers only.

### Rejected: `storm.verticalEnvelopeUpdraft` as a sibling of `storm.updraft`

That path is correct only if live DEMO kept both physics types. It does
not. A second block would be either:

- dead configuration (`storm.updraft` unused), or
- a dual-updraft API that option A already rejected.

Do not keep the old four-field DTO merely for backward compatibility.
There is no second live DEMO that still consumes height-independent
`storm.updraft`. Isolated `UpdraftField` tests construct the physics
type directly and do not need a scenario DTO.

### Naming lock-in

| Layer | Name |
| --- | --- |
| Physics type (DEMO occupant) | `VerticalEnvelopeUpdraftField` |
| Physics primitive (not DEMO) | `UpdraftField` |
| Scenario DTO block | `storm.updraft` |
| Scenario DTO type | `ScenarioUpdraft` |
| Scenario factory | `createUpdraftField` |

The factory name stays `createUpdraftField` because it still maps the
existing `storm.updraft` slot. It does **not** become a generic
class-switching factory. After this slice it value-imports only
`VerticalEnvelopeUpdraftField`.

`ScenarioConfig` DTO modules remain physics-import-free.
`createUpdraftField` lives in `src/scenario/`, value-imports
`VerticalEnvelopeUpdraftField`, maps plain DTO numbers, and delegates
physical validation to that constructor.

`createUpdraftField` must read `config.storm.updraft`. It must **not**
copy `centerX` / `centerZ` / `sigma` / `baseHeight` / `topHeight` from
`storm.rotation` or `storm.radialInflow`.

There is still no shared `storm.center`.

`stormMotion` remains a top-level sibling (hodograph / diagnostics only).

---

## 5. Scenario factory

```text
createUpdraftField(config: ScenarioConfig)
  → VerticalEnvelopeUpdraftField
```

Behavior:

1. read `config.storm.updraft` plain numbers
   (`centerX`, `centerZ`, `peakVerticalVelocity`, `sigma`,
   `baseHeight`, `topHeight`);
2. construct `new VerticalEnvelopeUpdraftField({ ... })`;
3. let `VerticalEnvelopeUpdraftField` enforce physical invariants.

Do not:

- construct `UpdraftField` and multiply by `F(y)` in the factory;
- accept a `kind` / `envelope` flag;
- re-validate `topHeight > baseHeight` in the scenario layer;
- assemble the composite.

Validation failures surface as `VerticalEnvelopeUpdraftFieldError`.

`createRotationField` and `createRadialInflowField` are unchanged.

---

## 6. DEMO vertical parameters

Unchanged from `docs/rendering/05-composite-radial-inflow-demo.md`:

```text
storm.updraft.centerX = 0 m
storm.updraft.centerZ = 0 m
storm.updraft.peakVerticalVelocity = 20 m/s
storm.updraft.sigma = 1000 m

storm.rotation:        Ω = 0.02 rad/s, sigma = 1000 m, center (0,0)
storm.radialInflow:    A = 0.005 1/s,  sigma = 1000 m, center (0,0)

simulation.timestep = 0.1 s
integrator = EulerIntegrator
environment levels and stormMotion: hodograph fixture, unchanged
```

New lock-in:

```text
baseHeight = 0 m
topHeight  = 2000 m
y_mid      = 1000 m
H          = 2000 m
```

At the existing seed height:

```text
ξ(1000) = 1/2
F(1000) = sin(π/2) = 1
```

On the axis at the seeds, initial `Vy = W0 = 20 m/s`. Off-axis at
`r = 600 m`, initial `Vy` equals the current height-independent DEMO
sample `W0 E_r`, because `F = 1`. The replacement does **not** retune
`t = 0` lift. Trajectories diverge later, when `y` leaves `y_mid`.

### Why this interval

1. **Same vertical scale as the DEMO environment profile.** Knots are
   `0`, `1000`, `2000` m. The updraft life cycle occupies that laboratory
   column. Above `2000 m` the profile already clamps
   (`docs/physics/04-environmental-wind-profile.md` §8). Aligning
   `topHeight` with `h_max` avoids inventing a second undocumented
   vertical domain.
2. **Seeds sit at the envelope maximum.** `peakVerticalVelocity` is
   attained where the DEMO already looks (`y = 1000 m`, also the
   hodograph selected height). Initial axis `Vy` stays `20 m/s`, so this
   slice isolates the envelope rather than looking like a silent `W0`
   change.
3. **Envelope change is readable before tracers leave the Gaussian
   core.** Environmental speed at `y = 1000 m` is about `15.8 m/s`;
   `σ / |V_env| ≈ 63 s`. Isolated on-axis half-sine time from `ξ = 0.5`
   to `ξ = 0.75` (`y = 1500 m`, `F = √2/2`) is about `28 s`. `F` drops
   by ~29% while the particle can still be in the core. `W0 dt = 2 m ≪
   H`, so `dt = 0.1 s` does not jump the layer.
4. **Scene scale already frames this column.** `TracerScene` camera is
   at `(4500, 3500, 4500)` looking at `(500, 1000, −500)`; XZ grid is
   `8000 m`; axes helper is `1000 m`. A `0–2000 m` tower sits between
   look-at and camera height. Do not raise `topHeight` to chase a taller
   plume.
5. **Surface lid is explicit.** `F(0) = 0` at reference ground. That is
   the half-sine lower boundary, not terrain physics.

### Rejected vertical bounds

| Candidate | Why rejected |
| --- | --- |
| `baseHeight = 0`, `topHeight = 4000` (`y_mid = 2000`) | Seeds at `F ≈ 0.707` look like a `W0` retune; time to peak ~56 s fights core exit; `2000–4000 m` is above the env profile, so shear stops while the envelope continues |
| `baseHeight = 0`, `topHeight = 3000` | Same class of problem, weaker; still extends above env `h_max` |
| Seeds moved to a new `y_mid` | Changes the seed contract and the hodograph-aligned observation height without necessity |
| Tiny `H` around `y = 1000` | Stiff `F' ~ 1/H`; tracers would hit the lids before env/rotation/inflow remain readable |
| `baseHeight < 0` | Allowed by physics, unused by this DEMO; ground is already the laboratory floor |

Do not change `W0`, radial `sigma`, `Ω`, `A`, or environment winds in
this slice.

DEMO centers and `sigma` values still coincide as a **fixture choice**,
not as an API invariant.

---

## 7. Seeds

Keep the current three seeds at one height:

```text
(0,    1000,  0)     // axis:  r = 0, F = 1, Vy = W0
                     //        V_rotation = 0, V_radial_inflow = 0
(600,  1000,  0)     // east:  r = 0.6 σ, F = 1
                     //        rotation tangent north (−Z); inflow west (−X)
(0,    1000, -600)   // north: r = 0.6 σ, F = 1
                     //        rotation tangent west  (−X); inflow south (+Z)
```

Units: meters.

They remain the minimal set that distinguishes rotation from radial
inflow (orthogonal world components at the east and north mid-core
points). With `y_mid = 1000 m` they are **not** near `Vy ≈ 0`:
`F(1000) = 1`.

A fourth seed at another height would only restatement the envelope that
the rising trajectory already shows. Do not add a particle cloud. Do
not return the historical far-east `1800 m` seed.

The envelope is an along-trajectory lesson: as `y` changes, `F(y)` is
re-sampled. Between-seed contrast at `t = 0` stays rotation vs inflow.

---

## 8. Formula of this historical DEMO fixture

```text
V_total =
    V_environment(y)
  + V_vertical_envelope_updraft(r_up, y)
  + V_rotation(r_rot)
  + V_radial_inflow(r_in)
```

where

```text
V_vertical_envelope_updraft
  = (0, W0 * E_r(r_up) * F(y), 0)

E_r(r) = exp(−r² / (2 σ_up²))

F(y) = sin(π (y − baseHeight) / H)   if baseHeight ≤ y ≤ topHeight
F(y) = 0                             otherwise
```

App composition owns assembly:

```text
profile  = createEnvironmentalWindProfile(config)
envField = new EnvironmentalWindField(profile)
updraft  = createUpdraftField(config)        // VerticalEnvelopeUpdraftField
rotation = createRotationField(config)
inflow   = createRadialInflowField(config)
field    = new CompositeVelocityField([envField, updraft, rotation, inflow])
```

---

## 9. Dynamics

With the old height-independent operand, at fixed `r`:

```text
Vy_updraft = W0 E_r(r)
```

independent of `y`.

Now:

```text
Vy_updraft = W0 E_r(r) F(y)
```

A tracer must re-sample the vertical envelope as its height changes.

At the same time:

1. environment supplies horizontal wind that depends on `y`
   (`Vy_env = 0`; this historical slice's profile clamped outside
   `[0, 2000]` — live DEMO after `09` interpolates through `12000 m`,
   see `docs/rendering/09-deep-environmental-profile-demo.md`);
2. the updraft depends on **both** `r` and `y`;
3. rotation is height-independent horizontal tangent (`Vy_rot = 0`);
4. radial inflow is height-independent horizontal inward flow
   (`Vy_in = 0`);
5. environmental advection and inflow change `(x, z)` relative to the
   **fixed** world centers, so all three Gaussian mechanisms are
   re-sampled in `r`;
6. ascent now re-samples **two** `y`-dependent contributions:

```text
environment(y)
verticalEnvelopeUpdraft(r, y)
```

The storm axes do not follow `stormMotion`. Tracers pass through fixed
world Gaussians and a fixed vertical interval.

Because environment is strong compared with DEMO inflow, off-axis
radius is **not** required to decrease. The live path is the residual
of all four operands, not isolated envelope ascent.

### After `topHeight`

For `y ≥ 2000 m`:

```text
F = 0  ⇒  V_updraft = (0, 0, 0)
```

Then:

- this field no longer lifts the tracer;
- environment still advects horizontally (in **this historical
  slice**, clamped to the `2000 m` knot above the then-`h_max`; live
  DEMO after `09` interpolates `2000–6000–12000`);
- rotation and inflow still act, because those v1 fields are
  height-independent;
- there is **no** upper-level outflow / divergence field in this DEMO.
  Isolated physics for that mechanism is
  `docs/physics/16-upper-radial-outflow-field.md`. Live DEMO wiring of
  that field is
  `docs/rendering/07-composite-upper-radial-outflow-demo.md`; it is not
  an operand of **this** completed slice.

`Vy → 0` at the lid is the half-sine boundary, not a tropopause, anvil,
or storm-top process. Isolated physics already says a particle inside
the open layer does not reach `topHeight` in finite continuous time
(`docs/physics/15-vertical-updraft-envelope.md` §17.3). In the composite,
horizontal motion can carry the tracer off-axis while `y` is still
below `2000 m`; `E_r` then drops and lift weakens further. If a
numerical step lands at or above `topHeight`, subsequent updraft
samples are zero.

Do not start the upper-divergence slice here.

---

## 10. Anti-oracles

Forbidden live-DEMO claims:

```text
y(t) = y0 + W0 t
      // old height-independent on-axis updraft; also false here
      // because F(y) changes and r(t) is not constant

ξ(t) = (2/π) arctan( tan(π ξ0 / 2) exp(π W0 t / H) )
      // isolated VerticalEnvelopeUpdraftField closed form;
      // requires constant r so that E_r is constant

r(t) = r0
      // isolated RotationField circle

r(t) = r0 exp(−A t)
      // unbounded linear inflow; not even the isolated
      // RadialInflowField solution
```

Also forbidden: monotone composite `r`, a closed-form four-operand
trajectory, and treating `Vy = W0` at every height on the axis.

The isolated half-sine oracle remains valid only for isolated
`VerticalEnvelopeUpdraftField` tests
(`docs/physics/15-vertical-updraft-envelope.md`). The linear-y oracle
remains valid only for calm-horizontal environment plus height-independent
on-axis `UpdraftField`. Neither is a DEMO / UI / integration expectation.

Do not invent a closed-form composite trajectory oracle.

---

## 11. Continuity

Inside the open layer `(0, 2000)`, except at `y_mid`:

```text
∂Vy/∂y = W0 E_r (π/H) cos(π ξ) ≠ 0
```

That contribution was identically zero for DEMO `UpdraftField`.

The four-operand sum is still:

- not divergence-free;
- not mass-consistent;
- not pressure-coupled.

Separable `Vy = W0 E_r F(y)` cannot cancel
`div_h` of `RadialInflowField` at all `r`
(`docs/physics/15-vertical-updraft-envelope.md` §11). DEMO parameters
are **not** tied by `H = W0 π / (2A)` or any other continuity equation.

App copy must **not** say that the vertical envelope fixes continuity.

---

## 12. Hodograph boundary

Unchanged:

- hodograph represents only `EnvironmentalWindProfile`;
- the enveloped updraft does not add a vertical hodograph axis, a
  second curve, or an overlay;
- rotation and radial inflow still do not;
- shear / horizontal vorticity / streamwise–crosswise / SRH remain
  environmental + `stormMotion` diagnostics;
- mutating `storm.updraft.baseHeight` / `topHeight` / `peakVerticalVelocity`
  / `sigma` must not change hodograph points
  (and still must not when mutating rotation or radial inflow);
- 3D composite field and 2D hodograph intentionally show different
  aspects of the same `ScenarioConfig`.

---

## 13. Rendering and runtime controls

Physics / rendering boundary unchanged:

- `TracerScene` continues to read `particle.position` only;
- no envelope mesh, vertical curtain, arrows, trails, cloud, storm-top,
  divergence glyphs, or GPU particles;
- existing spheres, axes, and grid are sufficient.

Pause / `1×`–`20×` / Reset continue to follow
`docs/rendering/02-tracer-runtime-controls.md` without changing numerical
`dt`. Fast playback is not a reason to enlarge `H`, `W0`, or `A`.

---

## 14. App copy / scientific wording

After implementation, UI copy may say that the tracer DEMO includes:

- environmental wind;
- a vertically structured updraft;
- rotation;
- radial inflow.

It must **not** call the live DEMO:

- a realistic supercell;
- a complete storm;
- continuity-solved flow;
- a mesocyclone;
- pressure-driven circulation.

Disappearance of updraft above `topHeight` must **not** be described as
a realistic anvil or upper-level outflow. Those mechanisms are absent.

---

## 15. Testing policy (integration)

Focused integration tests in the existing file
`src/simulation/demoCompositeUpdraft.integration.test.ts` (keep the
filename). Do **not** re-prove unit/acceptance physics of
`VerticalEnvelopeUpdraftField`.

Replace assertions that assumed height-independent `Vy = W0` at every
`y`, and any remaining `createUpdraftField → UpdraftField` identity.

Let `F(y)` and `E_r(r)` be the DEMO envelope/Gaussian from §6–§8.

Required:

1. `createUpdraftField(DEMO_SCENARIO)` maps DTO →
   `VerticalEnvelopeUpdraftField` with DEMO params. On the axis at
   `y_mid = 1000`, `Vy = W0 = 20`. On the axis at `y = 0` and
   `y = 2000`, `Vy` is `0` within floating-point tolerance for `sin(π)`.
2. Factory reads only `storm.updraft`: a cloned config with different
   rotation/inflow `centerX` / `sigma` still produces the envelope about
   the updraft DTO center/sigma/bounds.
3. Demo composition field matches
   `sample(env) + sample(updraft) + sample(rotation) + sample(inflow)`
   at representative points (the three seeds, one interior off-seed
   point, one point below `baseHeight`, one point above `topHeight`).
4. Axis seed `(0, 1000, 0)`: `V_rotation = 0`, `V_inflow = 0`, initial
   horizontal velocity equals environment at `y = 1000`, and

   ```text
   Vy = W0 * F(1000) = W0
   ```

   Write the assertion as `W0 * F(seed.y)`, not as a hardcoded identity
   that would hide a future seed/`y_mid` mismatch.
5. East seed `(600, 1000, 0)`: rotation contributes `Vz` only; inflow
   contributes `Vx < 0` only; `total.x = env.x + inflow.x`;
   `total.z = env.z + rotation.z`;
   `Vy = W0 E_r(600) F(1000)` from the envelope field only.
6. North seed analogously; `Vy = W0 E_r(600) F(1000)`.
7. Two interior heights on the axis, e.g. `y = 500` and `y = 1000`
   (or `1000` and `1500`): envelope `Vy` differs according to `F(y)`.
8. Below `baseHeight` and above `topHeight`, updraft contribution is
   `0`; environment, rotation, and inflow still sample. In particular
   above `topHeight`, composite `Vy = 0` while horizontal parts need
   not be zero.
9. After several fixed steps: near-axis tracer `y` increases while
   `F > 0`. Do **not** compare with `y(t) = y0 + W0 t`, with the
   isolated half-sine closed form, with a circle, with
   `r(t) = r0 e^{-At}`, or with monotone composite `r`.
10. Reset restores the three seed positions and `clock.time = 0`.
11. Hodograph points are unchanged by mutating `storm.updraft.baseHeight`
    / `topHeight` (and still unchanged by mutating other storm blocks).
12. `composeDemoTracerSimulation` no longer includes a height-independent
    `UpdraftField` operand: composite samples must match the four-operand
    sum that uses the factory updraft, and that updraft must be
    height-dependent (axis `Vy` at `y = 0` is not `W0`).
13. `ScenarioConfig.ts` and `DEMO_SCENARIO.ts` remain physics-import-free;
    `createUpdraftField.ts` is the scenario module that value-imports
    `VerticalEnvelopeUpdraftField`.

Do **not** assert isolated envelope closed-form `y(t)` for DEMO tracers.

Scenario-layer tests in `docs/architecture/01-scenario-config.md` update
the DTO → factory mapping item (`Vy = W0 F(y)` on the axis). They still
must not duplicate the `VerticalEnvelopeUpdraftField` validation matrix.

---

## 16. Relationship to earlier tracer docs

| Document | Role after this slice |
| --- | --- |
| `01-tracer-scene.md` | Fixed-step loop, observe-only Three.js, layout |
| `02-tracer-runtime-controls.md` | Pause / timeScale / Reset; still applies unchanged |
| `03-composite-updraft-demo.md` | Historical env + height-independent `UpdraftField` |
| `04-composite-rotation-demo.md` | Historical env + old updraft + rotation |
| `05-composite-radial-inflow-demo.md` | Historical four-field DEMO with old height-independent updraft; seeds kept |
| This document (`06`) | Historical four-field DEMO: env + `VerticalEnvelopeUpdraftField` + rotation + radial inflow; immediately before upper outflow |
| `07-composite-upper-radial-outflow-demo.md` | Historical five-operand DEMO with height-independent `RadialInflowField`; superseded for the inflow occupant by `08` |
| `08-composite-lower-radial-inflow-demo.md` | Five-operand **wiring** (inflow occupant `LowerRadialInflowField`); live envelope **geometry** is `10` |

Historical statements in `05` that the updraft is height-independent
`Vy = W0 E_r` describe that completed slice. The three-seed layout in
`04`/`05` remains the current seed contract, with the additional
envelope interpretation in §7.

---

## 17. Explicit non-goals

- upper-level divergence / outflow — isolated physics in
  `docs/physics/16-upper-radial-outflow-field.md`; DEMO wiring in
  `docs/rendering/07-composite-upper-radial-outflow-demo.md`;
- downdraft;
- continuity solver or DEMO parameter coupling to `A`;
- pressure / buoyancy / thermodynamics;
- cloud / precipitation / cold pool / gust front;
- tilting / stretching / mesocyclone dynamics;
- storm axis that translates with `stormMotion`;
- keeping `UpdraftField` as a live DEMO operand;
- `storm.verticalEnvelopeUpdraft` as a second DTO block;
- feature flags / generic updraft factory;
- extra tracer seeds / particle cloud;
- envelope mesh, curtain, arrows, trails, GPU particles;
- changing `W0`, radial `sigma`, `Ω`, `A`, environment winds, `dt`, or
  Euler → RK2;
- changing hodograph physics or overlay math;
- `createScenarioRuntime`;
- assembling `CompositeVelocityField` inside the scenario module;
- DEMO linear-y, isolated half-sine, circular, or `r = r0 e^{-At}`
  trajectory oracles.

Do not change physics formulas of `VerticalEnvelopeUpdraftField`,
`UpdraftField`, `RotationField`, `RadialInflowField`, or environment.

---

## 18. Lock-in summary

```text
current updraft operand:   VerticalEnvelopeUpdraftField
old UpdraftField status:   isolated physics primitive; not a DEMO operand
Scenario DTO:              storm.updraft extended with baseHeight, topHeight
factory:                   createUpdraftField → VerticalEnvelopeUpdraftField
baseHeight:                0 m
topHeight:                 2000 m
y_mid:                     1000 m
seed strategy:             keep (0,1000,0), (600,1000,0), (0,1000,-600)
                           F(1000) = 1; initial Vy matches previous DEMO
current composite operands:
  EnvironmentalWindField
  + VerticalEnvelopeUpdraftField
  + RotationField
  + RadialInflowField
continuity claim:          ∂Vy/∂y ≠ 0 inside the open layer (except y_mid);
                           not divergence-free; not mass-consistent
hodograph impact:          none
renderer impact:           none (observe particle.position only)
```

---

## 19. First implementation slice (code, after this doc)

1. Extend `ScenarioUpdraft` with required `baseHeight` and `topHeight`.
2. Update `DEMO_SCENARIO.storm.updraft` with `0` and `2000`; keep
   existing `W0`, `sigma`, centers, rotation, inflow, env, `dt`, seeds.
3. Change `createUpdraftField` to value-import
   `VerticalEnvelopeUpdraftField` and map all six DTO numbers.
4. Switch `composeDemoTracerSimulation` comments/types so the updraft
   operand is the factory result (no leftover `UpdraftField`
   construction).
5. Adjust app copy: vertically structured updraft; no supercell /
   continuity-solved / anvil claims.
6. Update `docs/architecture/01-scenario-config.md` to the DTO/factory
   occupant in this document (if not already applied in the docs pass).
7. Adjust integration tests (§15); keep Reset seed expectations.
8. `npm test` and `npm run typecheck`.

Stop. Do not change `TracerScene` internals, hodograph composition,
physics formulas, `dt`, Euler, `W0`, `Ω`, `A`, env winds, or the seed
set. Do not start upper divergence.

### Files expected to change

- `src/scenario/ScenarioConfig.ts`
- `src/scenario/DEMO_SCENARIO.ts`
- `src/scenario/createUpdraftField.ts`
- `src/app/composeDemoTracerSimulation.ts`
- `src/app/App.tsx` (copy only)
- `src/simulation/demoCompositeUpdraft.integration.test.ts`
- `docs/architecture/01-scenario-config.md` (if still describing the
  old occupant)

### Files not to touch

- `src/physics/storm/UpdraftField.ts` and its isolated tests;
- `src/physics/storm/VerticalEnvelopeUpdraftField.ts` formulas;
- `src/physics/storm/RotationField.ts`;
- `src/physics/storm/RadialInflowField.ts`;
- `src/rendering/**`;
- `src/ui/**` except app copy if it lives in `App.tsx`;
- hodograph modules.

---

## 20. Core lesson

Live DEMO now lifts tracers with a bounded half-sine column:

```text
Vy = W0 E_r(r) sin(π y / 2000)    for 0 ≤ y ≤ 2000
Vy = 0                            otherwise
```

plus the existing environment, rotation, and radial inflow. Initial
samples at `y = 1000 m` match the previous DEMO. After that, height
re-samples both the wind profile and the envelope. Reaching the top is
not an anvil. Adding `∂Vy/∂y` is not mass continuity.
