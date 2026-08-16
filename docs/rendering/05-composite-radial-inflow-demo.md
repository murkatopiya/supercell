# Composite Radial Inflow Demo

**Status:** this document is the completed env + height-independent
`UpdraftField` + rotation + radial-inflow DEMO wiring slice. Current DEMO
tracer field is specified in
`docs/rendering/08-composite-lower-radial-inflow-demo.md`. The
axis/east/north seeds defined here remain the current seed layout.

## 1. Purpose

This document defines the completed browser DEMO integration that advected
tracers under mathematical composition of environmental wind, a controlled
height-independent Gaussian updraft, a controlled Gaussian-modulated
rotation field, and a controlled Gaussian-modulated radial inflow field.

It answers:

    How does one ScenarioConfig drive
    EnvironmentalWindField + UpdraftField + RotationField
    + RadialInflowField
    → CompositeVelocityField
    into the existing Simulation and Three.js tracer scene, without changing
    physics formulas or hodograph semantics?

Physics formulas remain those of:

- `docs/physics/04-environmental-wind-profile.md`
- `docs/physics/11-updraft-field.md`
- `docs/physics/12-composite-velocity-field.md`
- `docs/physics/13-rotation-field.md`
- `docs/physics/14-radial-inflow-field.md`

This document owns **wiring**, DEMO parameters, seed layout, anti-oracle
rules, and the boundary between the 3D composite field and the 2D hodograph.

It is **not** a mesocyclone, supercell, continuity-solved inflow, or
pressure-driven inflow model. The sum is controlled laboratory composition
of four already documented `VelocityField` mechanisms.

---

## 2. Composition chain

```text
DEMO_SCENARIO (ScenarioConfig)
├─ createEnvironmentalWindProfile(config)
│    → EnvironmentalWindProfile
│    → EnvironmentalWindField
├─ createUpdraftField(config)
│    → UpdraftField
├─ createRotationField(config)
│    → RotationField
└─ createRadialInflowField(config)
     → RadialInflowField

app composition (composeDemoTracerSimulation):
  CompositeVelocityField([
    environmentField,
    updraftField,
    rotationField,
    radialInflowField,
  ])
  → tracerSeeds → TracerParticle[]
  → Simulation (fixed timestep + Euler)
  → existing Three.js tracer scene (observe particle.position only)
```

Operand order `[environment, updraft, rotation, radialInflow]` continues
the previous `[environment, updraft, rotation]` list. The sum is
component-wise and commutative for ordinary finite values; the order is
documentation/readability, not a physical interaction rule.

Do not introduce a combined storm-field type. Do not assemble
`CompositeVelocityField` inside `src/scenario/`.

Hodograph path (unchanged, profile-only):

```text
DEMO_SCENARIO
  → createEnvironmentalWindProfile(config)
  → hodographPoints / shear / vorticity / SRH overlays
  → HodographPanel
```

Updraft, rotation, radial inflow, and `CompositeVelocityField` must **not**
feed hodograph geometry or environmental diagnostics.

Scenario factories map DTO numbers to physics constructors and **delegate
physical validation** to those constructors. App composition chooses which
fields are combined. Do not invent `createScenarioRuntime`.

---

## 3. Scenario DTO: required `storm.radialInflow`

See `docs/architecture/01-scenario-config.md` for the full DTO contract.

Naming lock-in (matches existing `updraft` / `rotation` camelCase blocks
and the physics type `RadialInflowField`):

| Layer | Name |
| --- | --- |
| Physics type | `RadialInflowField` |
| Physics param | `radialStrainRate` |
| Scenario DTO block | `storm.radialInflow` |
| Scenario DTO type | `ScenarioRadialInflow` |
| Scenario factory | `createRadialInflowField` |

Rejected aliases: `storm.inflow` (collides with SRH “inflow layer” language
and promises generic inflow); `convergenceRate` (rejected in
`docs/physics/14-radial-inflow-field.md`).

Required block, independently parameterized from `storm.updraft` and
`storm.rotation`:

```ts
storm: {
  updraft: { ... };                 // unchanged required block
  rotation: { ... };                // unchanged required block
  radialInflow: {
    centerX: number;                // m, world +X
    centerZ: number;                // m, world +Z
    radialStrainRate: number;       // 1/s; must be > 0 (RadialInflowField)
    sigma: number;                  // m, must be > 0 (RadialInflowField)
  };
}
```

`ScenarioConfig` DTO modules remain physics-import-free.
`createRadialInflowField` lives in `src/scenario/`, value-imports
`RadialInflowField`, maps plain DTO numbers, and delegates physical
validation to `RadialInflowField`.

`createRadialInflowField` must read `config.storm.radialInflow`. It must
**not** copy `centerX` / `centerZ` / `sigma` from `storm.updraft` or
`storm.rotation`.

`stormMotion` remains a top-level sibling (hodograph / diagnostics only).

There is still no shared `storm.center`.

---

## 4. DEMO lock-in parameters

Environment levels, `stormMotion`, updraft, rotation, `timestep`, and Euler
stay the existing composite-rotation DEMO values (unchanged):

```text
storm.updraft:
  centerX = 0 m
  centerZ = 0 m
  peakVerticalVelocity = 20 m/s
  sigma = 1000 m

storm.rotation:
  centerX = 0 m
  centerZ = 0 m
  angularVelocity = 0.02 rad/s
  sigma = 1000 m

simulation.timestep = 0.1 s
integrator = EulerIntegrator   // composition choice, not ScenarioConfig
```

### Radial inflow

```text
centerX = 0 m
centerZ = 0 m
radialStrainRate = 0.005 1/s    // A > 0, strictly inward
sigma = 1000 m
```

DEMO updraft, rotation, and radial-inflow centers coincide at the world
origin **only as a fixture choice**. Shared center is not an API invariant
and must not become a `storm.center` object.

DEMO `sigma` values also coincide (`1000 m`) as a fixture choice, not as a
coupled parameter.

### Why this `radialStrainRate`

Derived peak speeds for the shared DEMO `sigma = 1000 m`
(`docs/physics/13-rotation-field.md`, `docs/physics/14-radial-inflow-field.md`):

```text
|v_θ|_max = |Ω| σ / √e ≈ 12.1 m/s     at r = σ
|v_r|_max =  A  σ / √e ≈  3.03 m/s    at r = σ
```

At DEMO `y = 1000 m`, environmental wind is `(eastward, northward) = (5, 15)`
so world horizontal speed is about `15.8 m/s`.

At the off-axis seeds `r = 600 m = 0.6 σ`:

```text
E = exp(−0.18) ≈ 0.835
|v_θ| ≈ 10.0 m/s
|v_r| ≈  2.51 m/s
```

`A = 0.005 = Ω / 4` keeps inflow a weaker laboratory overlay than rotation
and than environment:

- peak inflow is about one quarter of peak tangential speed;
- at the east seed, inflow `|Vx| ≈ 2.5 m/s` leaves environmental `Vx = 5 m/s`
  clearly eastward;
- characteristic strain time `1/A = 200 s` is longer than Gaussian-core
  transit under environmental advection (`σ / |V_env| ≈ 63 s`), so inflow
  does not vacuum tracers to the axis before env/updraft/rotation remain
  readable.

Rejected DEMO alternative `A = Ω = 0.02`: peak `|v_r|` would match peak
`|v_θ|` (~12 m/s). At the east seed that would add about `10 m/s` westward
and **reverse** environmental `Vx`. Isolated log-spiral pedagogy is not
worth destroying env readability.

Rejected DEMO alternative `A = 0.01`: at `r = 600 m`, `|v_r| ≈ 5.0 m/s`
almost cancels environmental eastward `5 m/s` on the east seed — a numeric
coincidence, not a physical lesson.

Do not enlarge `A` to make 1× motion more dramatic. Existing `timeScale`
already compresses wall-clock time
(`docs/rendering/02-tracer-runtime-controls.md`). Do not change numerical
`dt`.

---

## 5. Tracer seeds

Keep the current three seeds at one height:

```text
(0,    1000,  0)     // axis:  r = 0,     Vy = W0,
                     //        V_rotation = 0, V_radial_inflow = 0
(600,  1000,  0)     // east:  r = 0.6 σ
                     //        rotation tangent north (−Z); inflow west (−X)
(0,    1000, -600)   // north: r = 0.6 σ
                     //        rotation tangent west  (−X); inflow south (+Z)
```

Units: meters.

These seeds are **not** kept merely because they already exist. They are
the minimal set that distinguishes the new radial operand from rotation:

- on the axis both rotation and inflow are identically zero, so the first
  motion is still environment + peak updraft;
- at the east and north mid-core points, `V_rotation` and `V_radial_inflow`
  are **orthogonal** (one world component each). Inflow is visible as a
  change in the radial cartesian component; rotation remains the tangential
  component.

A fourth particle, a return of the far-east `1800 m` seed, or a decorative
cloud would not add a new mechanism contrast. Do not expand the seed set
in this slice.

---

## 6. Dynamics and anti-oracle

Under the demo composite:

```text
V = V_environment(y)
  + V_updraft(r_up)
  + V_rotation(r_rot)
  + V_radial_inflow(r_in)
```

1. environment supplies horizontal wind that depends on `y` (`Vy_env = 0`);
2. updraft supplies height-independent `Vy = W0 · exp(−r_up²/(2σ_up²))`;
3. rotation supplies height-independent horizontal tangent about its axis
   (`Vy_rot = 0`);
4. radial inflow supplies height-independent horizontal inward flow about
   its axis (`Vy_in = 0`);
5. environmental advection and inflow both change `(x, z)` relative to the
   **fixed** world centers, so all three Gaussian mechanisms are resampled
   along the trajectory;
6. ascent changes the height at which environment is re-sampled.

The storm axes do not follow `stormMotion`. Tracers pass through the fixed
Gaussians; they do not orbit a storm-relative mesocyclone.

Because environment is strong compared with DEMO inflow, off-axis radius
to the shared DEMO origin is **not** required to decrease. Environment
tends to increase `r`; inflow opposes that; rotation does not change `r`
in the continuous isolated field. The live DEMO path is the residual of
all four, not isolated inflow.

**Forbidden DEMO claims:**

```text
r(t) = r0                         // isolated RotationField circle
y(t) = y0 + W0 · t                // calm-env on-axis updraft
r(t) = r0 · exp(−A t)             // unbounded linear inflow, and also
                                  // not the Gaussian RadialInflowField
                                  // continuous solution
```

The circular oracle remains valid only for isolated `RotationField` tests
(`docs/physics/13-rotation-field.md`). The linear-y oracle remains valid
only for calm-horizontal environment + on-axis updraft
(`docs/physics/12-composite-velocity-field.md`). The exponential radius
map is not an oracle even for isolated `RadialInflowField`
(`docs/physics/14-radial-inflow-field.md`). None of these is a DEMO / UI /
integration expectation under the four-operand field.

Do not invent a closed-form composite trajectory oracle.

---

## 7. Continuity and scientific wording

`RadialInflowField` is a controlled synthetic inward-flow mechanism
(`docs/physics/14-radial-inflow-field.md` §16). Horizontal divergence is
nonzero. Height-independent `UpdraftField` has `∂Vy/∂y = 0` and does not
cancel that residual.

The four-operand sum is still not a solved continuity system, not
mass-consistent supercell inflow, and not pressure-driven flow.

App copy may mention environment, updraft, rotation, and radial inflow
tracers. It must **not** call the live DEMO:

- a realistic supercell;
- a mesocyclone model;
- continuity-solved inflow;
- pressure-driven inflow.

Visually crowding tracers still do not represent air-mass conservation
(`docs/physics/01-parcel-basics.md` §27–28).

Do not mix this field’s `div_h` / possible curl with environmental
`HorizontalVorticity`, SRH, or “inflow layer” diagnostics.

---

## 8. Hodograph boundary

Confirmed:

- hodograph represents only `EnvironmentalWindProfile`;
- updraft does not add a vertical coordinate or a second hodograph curve;
- rotation does not add vertical vorticity, a third curve, or any overlay;
- radial inflow does not add convergence diagnostics, a fourth curve, or
  any overlay;
- shear / horizontal vorticity / streamwise–crosswise / SRH remain
  environmental + `stormMotion` diagnostics as today;
- mutating `storm.radialInflow` must not change hodograph points
  (and still must not change them when mutating updraft or rotation);
- 3D composite field and 2D hodograph intentionally show different aspects
  of the same `ScenarioConfig`.

`RadialInflowField` is a world-space synthetic storm velocity mechanism.
Its convergence/divergence and possible curl must not be mixed with
existing environmental diagnostics.

---

## 9. Rendering and runtime controls

Physics / rendering boundary unchanged:

- `TracerScene` continues to read `particle.position` only;
- no updraft mesh, rotation mesh, vortex tube, inflow arrows, plume,
  cloud, trails, or GPU particles in this slice;
- existing spheres, axes, and grid are sufficient.

Pause / `1×`–`20×` / Reset continue to follow
`docs/rendering/02-tracer-runtime-controls.md` without changing numerical
`dt`. Fast departure from the Gaussian cores at `20×` is a demo readability
concern, not a reason to enlarge `A` or alter physics formulas.

---

## 10. Relationship to earlier tracer docs

| Document | Role after this slice |
| --- | --- |
| `01-tracer-scene.md` | Fixed-step loop, observe-only Three.js, layout |
| `02-tracer-runtime-controls.md` | Pause / timeScale / Reset; still applies unchanged |
| `03-composite-updraft-demo.md` | Completed env+updraft DEMO wiring; field/seeds superseded |
| `04-composite-rotation-demo.md` | Completed env+updraft+rotation DEMO wiring; field superseded here; seeds kept |
| This document (`05`) | Completed four-field DEMO with height-independent `UpdraftField`; field superseded by `06`; seeds kept |
| `06-composite-vertical-envelope-updraft-demo.md` | Historical four-field DEMO with `VerticalEnvelopeUpdraftField`; superseded by `07` |
| `07-composite-upper-radial-outflow-demo.md` | Historical five-operand DEMO with height-independent `RadialInflowField`; superseded for the inflow occupant by `08` |
| `08-composite-lower-radial-inflow-demo.md` | Current DEMO: same five-operand count; inflow occupant is `LowerRadialInflowField` |

Historical statements in `03` (two-operand composite, far-east seed) and
`04` (three-operand composite) describe those completed slices and must
not be read as the current DEMO field contract. The three-seed layout in
`04` remains the current seed contract, with the additional inflow
interpretation in §5.

---

## 11. Explicit non-goals

- mesocyclone / supercell / tilting / stretching realism claim;
- mass-consistent or pressure-driven inflow claim;
- shared `storm.center` or a combined `StormField` type;
- optional `storm.radialInflow?` and compose-time feature flags;
- axis that translates with `stormMotion`;
- copying center / `sigma` from updraft or rotation;
- outflow / downdraft;
- vertical envelope (specified later in `06`);
- Rankine / other alternative radial profiles;
- changing environment winds, updraft params, rotation params, `dt`, or
  Euler → RK2;
- changing `radialStrainRate` for visual punch;
- extra tracer seeds / particle cloud;
- plume / vortex / inflow-arrow / cloud rendering;
- trails;
- GPU particles;
- scenario editor UI;
- Bunkers;
- any change to hodograph physics or overlay math;
- `createScenarioRuntime`;
- assembling `CompositeVelocityField` inside the scenario module;
- DEMO circular, linear-y, or `r = r0 e^{-At}` trajectory oracles.

---

## 12. Testing policy (integration)

Focused integration tests; do not re-prove unit physics of Gaussian
updraft, rotation, radial inflow, or the generic composite sum.

Update the existing DEMO integration file
`src/simulation/demoCompositeUpdraft.integration.test.ts` (keep the
filename; it already covers the current three-operand DEMO). Replace
assertions that assumed `total.x === env.x` on the east seed and
`total.z === env.z` on the north seed — those equalities are rotation-only
and become false once inflow occupies the radial component.

Required:

1. `createRadialInflowField(DEMO_SCENARIO)` maps DTO → inflow with DEMO
   params (axis sample `V = (0,0,0)`; east of center has `Vx < 0`; north
   of center has `Vz > 0`).
2. `createRadialInflowField` reads only `storm.radialInflow`: a cloned
   config with different updraft/rotation `centerX` / `sigma` still
   produces inflow about the radial-inflow DTO center/sigma.
3. Demo composition field matches
   `sample(env) + sample(updraft) + sample(rotation) + sample(inflow)`
   at representative points (the three seeds plus one off-seed point).
4. Axis seed `(0, 1000, 0)`: `V_rotation = 0` and `V_inflow = 0`, so
   initial horizontal velocity equals environment at `y = 1000`, and
   `Vy = W0`.
5. East seed `(600, 1000, 0)`: rotation contributes `Vz` only; inflow
   contributes `Vx < 0` only; `total.x = env.x + inflow.x`;
   `total.z = env.z + rotation.z`; `Vy` from updraft only.
6. North seed `(0, 1000, -600)`: rotation contributes `Vx` only; inflow
   contributes `Vz > 0` only; `total.z = env.z + inflow.z`;
   `total.x = env.x + rotation.x`; `Vy` from updraft only.
7. After several fixed steps: near-axis tracer `y` increases; horizontal
   drift is nonzero. Do **not** compare with a circle, with
   `y(t) = y0 + W0·t`, with `r(t) = r0 e^{-At}`, or with monotone
   composite `r` decrease.
8. Reset restores the three seed positions and `clock.time = 0`.
9. Hodograph points are unchanged by mutating `storm.radialInflow` (and
   still unchanged by mutating updraft or rotation).
10. `ScenarioConfig.ts` and `DEMO_SCENARIO.ts` remain physics-import-free;
    `createRadialInflowField.ts` is the scenario module that value-imports
    `RadialInflowField`.

Do **not** assert isolated-`RadialInflowField` ray/`r` bounds, isolated
circular motion, or calm-env linear-y lift for DEMO tracers.

Scenario-layer tests in `docs/architecture/01-scenario-config.md` gain
the DTO → factory mapping item; they still must not duplicate the
`RadialInflowField` validation matrix.

---

## 13. First implementation slice (code, after this doc)

1. Extend `ScenarioConfig` with required `storm.radialInflow`
   (`ScenarioRadialInflow`).
2. Update `DEMO_SCENARIO` (radial-inflow params; keep existing three
   seeds).
3. Add `createRadialInflowField` in `src/scenario/`.
4. Switch `composeDemoTracerSimulation` to
   `CompositeVelocityField([env, updraft, rotation, radialInflow])`.
5. Adjust app copy so it mentions radial inflow and does not claim
   env+updraft+rotation-only tracers, a mesocyclone, or continuity-solved
   inflow.
6. Add/adjust integration tests (§12); keep Reset seed expectations.
7. `npm test` and `npm run typecheck`.

Stop. Do not change TracerScene internals, hodograph composition, physics
formulas of the four operand fields, `dt`, Euler, or the seed set.
