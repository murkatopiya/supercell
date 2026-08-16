# Composite Rotation Demo

**Status:** this document is the completed env+updraft+rotation DEMO wiring
slice. Current DEMO tracer field is specified in
`docs/rendering/08-composite-lower-radial-inflow-demo.md`. The
axis/east/north seeds defined here remain the current seed layout. The
radial-inflow addition that this slice preceded is
`docs/rendering/05-composite-radial-inflow-demo.md`.

## 1. Purpose

This document defines the current browser DEMO integration that advects
tracers under mathematical composition of environmental wind, a controlled
Gaussian updraft, and a controlled Gaussian-modulated rotation field.

It answers:

    How does one ScenarioConfig drive
    EnvironmentalWindField + UpdraftField + RotationField
    → CompositeVelocityField
    into the existing Simulation and Three.js tracer scene, without changing
    physics formulas or hodograph semantics?

Physics formulas remain those of:

- `docs/physics/04-environmental-wind-profile.md`
- `docs/physics/11-updraft-field.md`
- `docs/physics/12-composite-velocity-field.md`
- `docs/physics/13-rotation-field.md`

This document owns **wiring**, DEMO parameters, seed layout, anti-oracle
rules, and the boundary between the 3D composite field and the 2D hodograph.

It is **not** a mesocyclone, supercell, or tilting/stretching model. The
sum is controlled laboratory composition of three already documented
`VelocityField` mechanisms.

---

## 2. Composition chain

```text
DEMO_SCENARIO (ScenarioConfig)
├─ createEnvironmentalWindProfile(config)
│    → EnvironmentalWindProfile
│    → EnvironmentalWindField
├─ createUpdraftField(config)
│    → UpdraftField
└─ createRotationField(config)
     → RotationField

app composition (composeDemoTracerSimulation):
  CompositeVelocityField([environmentField, updraftField, rotationField])
  → tracerSeeds → TracerParticle[]
  → Simulation (fixed timestep + Euler)
  → existing Three.js tracer scene (observe particle.position only)
```

Operand order `[environment, updraft, rotation]` continues the previous
`[environment, updraft]` list. The sum is component-wise and commutative
for ordinary finite values; the order is documentation/readability, not a
physical interaction rule.

Hodograph path (unchanged, profile-only):

```text
DEMO_SCENARIO
  → createEnvironmentalWindProfile(config)
  → hodographPoints / shear / vorticity / SRH overlays
  → HodographPanel
```

Updraft, rotation, and `CompositeVelocityField` must **not** feed hodograph
geometry or environmental diagnostics.

Scenario factories map DTO numbers to physics constructors and **delegate
physical validation** to those constructors. App composition chooses which
fields are combined. Do not invent `createScenarioRuntime`. Do not assemble
`CompositeVelocityField` inside `src/scenario/`.

---

## 3. Scenario DTO: required `storm.rotation`

See `docs/architecture/01-scenario-config.md` for the full DTO contract.

Required block, independently parameterized from `storm.updraft`:

```ts
storm: {
  updraft: { ... };                 // unchanged required block
  rotation: {
    centerX: number;                // m, world +X
    centerZ: number;                // m, world +Z
    angularVelocity: number;        // rad/s; sign = sense (RotationField)
    sigma: number;                  // m, must be > 0 (RotationField)
  };
}
```

`ScenarioConfig` DTO modules remain physics-import-free.
`createRotationField` lives in `src/scenario/`, value-imports
`RotationField`, maps plain DTO numbers, and delegates physical validation
to `RotationField`.

`createRotationField` must read `config.storm.rotation`. It must **not**
copy `centerX` / `centerZ` / `sigma` from `storm.updraft`.

`stormMotion` remains a top-level sibling (hodograph / diagnostics only).

---

## 4. DEMO lock-in parameters

Environment levels, `stormMotion`, updraft, `timestep`, and Euler stay the
existing composite-updraft DEMO values (unchanged):

```text
storm.updraft:
  centerX = 0 m
  centerZ = 0 m
  peakVerticalVelocity = 20 m/s
  sigma = 1000 m

simulation.timestep = 0.1 s
integrator = EulerIntegrator   // composition choice, not ScenarioConfig
```

### Rotation

```text
centerX = 0 m
centerZ = 0 m
angularVelocity = 0.02 rad/s    // right-hand rule around world +Y
sigma = 1000 m
```

DEMO updraft and rotation centers coincide at the world origin **only as a
fixture choice**. Shared center is not an API invariant and must not become
a `storm.center` object.

DEMO `sigma` values also coincide (`1000 m`) as a fixture choice, not as a
coupled parameter.

At DEMO `y = 1000 m`, environmental wind is `(eastward, northward) = (5, 15)`
so world horizontal speed is about `15.8 m/s`. Peak tangential speed of this
rotation profile is `|Ω| σ / √e ≈ 12.1 m/s`. Local period near `r = σ` is
hundreds of seconds, much longer than core transit under environmental
advection. The DEMO must not look like a closed carousel.

---

## 5. Tracer seeds

Three seeds at one height, sampling the axis plus two orthogonal mid-core
azimuths:

```text
(0,    1000,  0)     // axis:  r = 0,     Vy = W0, V_rotation = 0
(600,  1000,  0)     // east:  r = 0.6 σ, tangent north (−Z) for Ω > 0
(0,    1000, -600)   // north: r = 0.6 σ, tangent west  (−X) for Ω > 0
```

Units: meters.

These seeds supersede the env+updraft radial ray

```text
(0, 1000, 0), (600, 1000, 0), (1800, 1000, 0)
```

from `docs/rendering/03-composite-updraft-demo.md`. The far-east seed is
dropped so the third particle can show a distinct tangential direction
instead of amplifying the already-northward environmental wind.

---

## 6. Dynamics and anti-oracle

Under the demo composite:

```text
V = V_environment(y) + V_updraft(r_up) + V_rotation(r_rot)
```

1. environment supplies horizontal wind that depends on `y` (`Vy_env = 0`);
2. updraft supplies height-independent `Vy = W0 · exp(−r_up²/(2σ_up²))`;
3. rotation supplies height-independent horizontal tangent about its axis
   (`Vy_rot = 0`);
4. environmental advection changes `(x, z)` relative to the **fixed** world
   centers, so both Gaussian mechanisms are resampled along the trajectory;
5. ascent changes the height at which environment is re-sampled.

The rotation axis does not follow `stormMotion`. Tracers pass through the
fixed Gaussians; they do not orbit a storm-relative mesocyclone.

**Forbidden DEMO claims:**

```text
r(t) = r0                         // isolated RotationField circle
y(t) = y0 + W0 · t                // calm-env on-axis updraft
```

The circular oracle remains valid only for isolated `RotationField` tests
(`docs/physics/13-rotation-field.md`). The linear-y oracle remains valid
only for calm-horizontal environment + on-axis updraft
(`docs/physics/12-composite-velocity-field.md`). Neither is a DEMO / UI /
integration expectation under nonzero environmental wind.

---

## 7. Hodograph boundary

Confirmed:

- hodograph represents only `EnvironmentalWindProfile`;
- updraft does not add a vertical coordinate or a second hodograph curve;
- rotation does not add vertical vorticity, a third curve, or any overlay;
- shear / horizontal vorticity / streamwise–crosswise / SRH remain
  environmental + `stormMotion` diagnostics as today;
- mutating `storm.rotation` must not change hodograph points;
- 3D composite field and 2D hodograph intentionally show different aspects
  of the same `ScenarioConfig`.

Do not mix `RotationField`'s vertical vorticity with environmental
`HorizontalVorticity`.

---

## 8. Rendering and runtime controls

Physics / rendering boundary unchanged:

- `TracerScene` continues to read `particle.position` only;
- no updraft mesh, rotation mesh, vortex tube, plume, cloud, trails, or
  GPU particles in this slice;
- existing spheres, axes, and grid are sufficient.

Pause / `1×`–`20×` / Reset continue to follow
`docs/rendering/02-tracer-runtime-controls.md` without changing numerical
`dt`. Fast departure from the Gaussian cores at `20×` is a demo readability
concern, not a reason to enlarge `Ω` or alter physics formulas.

App copy may mention environment, updraft, and rotation tracers. It must
not call the DEMO a mesocyclone or realistic supercell.

---

## 9. Relationship to earlier tracer docs

| Document | Role after this slice |
| --- | --- |
| `01-tracer-scene.md` | Fixed-step loop, observe-only Three.js, layout |
| `02-tracer-runtime-controls.md` | Pause / timeScale / Reset; still applies unchanged |
| `03-composite-updraft-demo.md` | Completed env+updraft DEMO wiring; seeds/field superseded here |
| `04-composite-rotation-demo.md` | Completed env+updraft+rotation DEMO wiring; field superseded by `05` then `06`; seeds kept |
| `05-composite-radial-inflow-demo.md` | Completed four-field DEMO with height-independent updraft; superseded by `06` |
| `06-composite-vertical-envelope-updraft-demo.md` | Historical four-field DEMO with `VerticalEnvelopeUpdraftField`; superseded by `07` |
| `07-composite-upper-radial-outflow-demo.md` | Historical five-operand DEMO with height-independent `RadialInflowField`; superseded for the inflow occupant by `08` |
| `08-composite-lower-radial-inflow-demo.md` | Current DEMO: same five-operand count; inflow occupant is `LowerRadialInflowField` |

Historical env+updraft statements in `03` (two-operand composite, far-east
seed at `1800 m`) describe that completed slice and must not be read as the
current DEMO contract. After `08`, this document's three-operand composite
is also historical for the live DEMO field; the seed layout remains current.

---

## 10. Explicit non-goals

- mesocyclone / supercell / tilting / stretching realism claim;
- shared `storm.center` or a combined `StormField` type;
- optional `storm.rotation?` and compose-time feature flags;
- axis that translates with `stormMotion`;
- radial inflow;
- downdraft;
- vertical envelope;
- Rankine / Lamb–Oseen alternatives;
- mass continuity / pressure coupling;
- changing environment winds, updraft params, `dt`, or Euler → RK2;
- plume / vortex / cloud rendering;
- trails;
- GPU particles;
- scenario editor UI;
- Bunkers;
- any change to hodograph physics or overlay math;
- `createScenarioRuntime`;
- assembling `CompositeVelocityField` inside the scenario module;
- DEMO circular or linear-y trajectory oracles under nonzero environmental
  wind.

---

## 11. Testing policy (integration)

Focused integration tests; do not re-prove unit physics of Gaussian
updraft, rotation, or the generic composite sum:

1. `createRotationField(DEMO_SCENARIO)` maps DTO → rotation with DEMO
   params (axis sample `V = (0,0,0)`; east of center with `Ω > 0` has
   `Vz < 0`).
2. Demo composition field matches
   `sample(env) + sample(updraft) + sample(rotation)` at representative
   points.
3. Axis seed `(0, 1000, 0)`: `V_rotation = 0`, so initial horizontal
   velocity equals environment at `y = 1000`, and `Vy = W0`.
4. East seed `(600, 1000, 0)`: `total.x` equals env `Vx`; `total.z` differs
   from env `Vz`; `Vy` comes from updraft only.
5. North seed `(0, 1000, -600)`: `total.z` equals env `Vz`; `total.x`
   differs from env `Vx`; `Vy` comes from updraft only.
6. After several fixed steps: near-axis tracer `y` increases; horizontal
   drift is nonzero. Do **not** compare with a circle or with
   `y(t) = y0 + W0·t`.
7. Reset restores the three seed positions and `clock.time = 0`.
8. Hodograph points are unchanged by mutating `storm.rotation` (and still
   unchanged by mutating updraft).

Do **not** assert isolated-`RotationField` circular motion or calm-env
linear-y lift for DEMO tracers.

Update or replace the env+updraft DEMO integration that expected
`composite = env + updraft` only and the far-east seed at `x = 1800`.

---

## 12. First implementation slice (code, after this doc)

1. Extend `ScenarioConfig` with required `storm.rotation`
   (`ScenarioRotation`).
2. Update `DEMO_SCENARIO` (rotation params + axis/east/north seeds).
3. Add `createRotationField` in `src/scenario/`.
4. Switch `composeDemoTracerSimulation` to
   `CompositeVelocityField([env, updraft, rotation])`.
5. Adjust app copy so it does not claim env+updraft-only tracers or a
   mesocyclone.
6. Add/adjust integration tests (§11); update Reset seed expectations.
7. `npm test` and `npm run typecheck`.

Stop. Do not change TracerScene internals, hodograph composition, or
physics formulas of the three operand fields.
