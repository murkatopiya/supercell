# Composite Updraft Demo

**Status:** this document is the completed env+updraft DEMO wiring slice.
Current DEMO tracer field, seeds, and storm DTO occupants are specified in
`docs/rendering/08-composite-lower-radial-inflow-demo.md`. Intermediate
historical fields: `04` (rotation), `05` (radial inflow with
height-independent updraft), `06` (vertical-envelope updraft without
upper outflow), and `07` (height-independent inflow + upper outflow).

## 1. Purpose

This document defines the first browser demo integration that advects tracers
under mathematical composition of environmental wind and a controlled
Gaussian updraft.

It answers:

    How does one ScenarioConfig drive
    EnvironmentalWindField + UpdraftField → CompositeVelocityField
    into the existing Simulation and Three.js tracer scene, without changing
    physics formulas or hodograph semantics?

Physics formulas remain those of:

- `docs/physics/04-environmental-wind-profile.md`
- `docs/physics/11-updraft-field.md`
- `docs/physics/12-composite-velocity-field.md`

This document owns **wiring**, demo parameters, seed layout, anti-oracle
rules, and the boundary between the 3D composite field and the 2D hodograph.

---

## 2. Composition chain

```text
DEMO_SCENARIO (ScenarioConfig)
├─ createEnvironmentalWindProfile(config)
│    → EnvironmentalWindProfile
│    → EnvironmentalWindField
└─ createUpdraftField(config)
     → UpdraftField

app composition (composeDemoTracerSimulation):
  CompositeVelocityField([environmentField, updraftField])
  → tracerSeeds → TracerParticle[]
  → Simulation (fixed timestep + Euler)
  → existing Three.js tracer scene (observe particle.position only)
```

Hodograph path (unchanged):

```text
DEMO_SCENARIO
  → createEnvironmentalWindProfile(config)
  → hodographPoints / shear / vorticity / SRH overlays
  → HodographPanel
```

Updraft and `CompositeVelocityField` must **not** feed hodograph geometry or
environmental diagnostics.

---

## 3. Scenario DTO: required `storm.updraft`

See `docs/architecture/01-scenario-config.md` for the full DTO contract.

Required block:

```ts
storm: {
  updraft: {
    centerX: number;                 // m, world +X
    centerZ: number;                 // m, world +Z
    peakVerticalVelocity: number;    // m/s, must be > 0 (UpdraftField)
    sigma: number;                   // m, must be > 0 (UpdraftField)
  };
}
```

`ScenarioConfig` DTO modules remain physics-import-free.
`createUpdraftField` lives in `src/scenario/`, value-imports `UpdraftField`,
maps plain DTO numbers, and **delegates physical validation** to
`UpdraftField`. Do not invent `createScenarioRuntime`.

`stormMotion` remains a top-level sibling (hodograph / diagnostics only).
It is not nested under `storm` in this slice.

---

## 4. DEMO lock-in parameters

Environment levels and `stormMotion` stay the existing hodograph fixture
values (unchanged).

### Updraft

```text
centerX = 0 m
centerZ = 0 m
peakVerticalVelocity = 20 m/s
sigma = 1000 m
```

### Tracer seeds

Three seeds at one height, sampling radial structure of the Gaussian:

```text
(0,    1000, 0)    // r = 0      → peak Vy
(600,  1000, 0)    // r ≈ 0.6 σ
(1800, 1000, 0)    // r ≈ 1.8 σ
```

Units: meters. `simulation.timestep` remains `0.1` s.

These seeds supersede the earlier vertical column
`(0,0,0)`, `(0,1000,0)`, `(0,2000,0)` used by the env-only tracer demo.

---

## 5. Dynamics and anti-oracle

Under the demo composite:

1. updraft supplies height-independent `Vy = W0 · exp(−r²/(2σ²))`;
2. environment supplies horizontal wind that depends on `y` (`Vy_env = 0`);
3. horizontal advection changes `r(t)`;
4. ascent changes the height at which environment is re-sampled.

Therefore general demo trajectories are **not** straight and do **not** have
constant `Vy`.

**Forbidden demo claim:**

```text
y(t) = y0 + W0 · t
```

That exact linear-y oracle remains valid only in the separate calm-horizontal
environment physics acceptance for `CompositeVelocityField`
(`docs/physics/12-composite-velocity-field.md`). It must not be used as a
demo / UI / integration expectation for nonzero environmental wind.

---

## 6. Hodograph boundary

Confirmed:

- hodograph represents only `EnvironmentalWindProfile`;
- updraft does not add a vertical coordinate or a second hodograph curve;
- shear / horizontal vorticity / streamwise–crosswise / SRH remain
  environmental + `stormMotion` diagnostics as today;
- 3D composite field and 2D hodograph intentionally show different aspects
  of the same `ScenarioConfig`.

---

## 7. Rendering and runtime controls

Physics / rendering boundary unchanged:

- `TracerScene` continues to read `particle.position` only;
- no updraft mesh, plume, cloud, trails, or GPU particles in this slice;
- existing spheres, axes, and grid are sufficient.

Pause / `1×`–`20×` / Reset continue to follow
`docs/rendering/02-tracer-runtime-controls.md` without changing numerical
`dt`. Fast departure from the Gaussian core at `20×` is a demo readability
concern, not a reason to alter physics formulas.

---

## 8. Relationship to earlier tracer docs

| Document | Role after this slice |
| --- | --- |
| `01-tracer-scene.md` | Fixed-step loop, observe-only Three.js, layout |
| `02-tracer-runtime-controls.md` | Pause / timeScale / Reset; still applies unchanged |
| This document (`03`) | Completed env+updraft DEMO wiring; field/seeds superseded by `04` then `05` |
| `04-composite-rotation-demo.md` | Completed env+updraft+rotation DEMO wiring; field superseded by `05`; seeds kept |
| `05-composite-radial-inflow-demo.md` | Completed four-field DEMO with height-independent updraft; superseded by `06` |
| `06-composite-vertical-envelope-updraft-demo.md` | Historical four-field DEMO with `VerticalEnvelopeUpdraftField`; superseded by `07` |
| `07-composite-upper-radial-outflow-demo.md` | Historical five-operand DEMO with height-independent `RadialInflowField`; superseded for the inflow occupant by `08` |
| `08-composite-lower-radial-inflow-demo.md` | Current DEMO: same five-operand count; inflow occupant is `LowerRadialInflowField` |

Historical env-only statements in `01` (constant height, vertical-column
seeds, `EnvironmentalWindField` as the sole 3D field) describe the first
tracer slice. This document's two-operand composite and far-east seed
describe the env+updraft slice. Neither is the current DEMO contract;
see `08`.

---

## 9. Explicit non-goals

Non-goals of **this** completed env+updraft slice. Rotation DEMO wiring is
owned by `docs/rendering/04-composite-rotation-demo.md`.

- rotation / mesocyclone;
- inflow;
- downdraft;
- vertical envelope `w(r,y)`;
- mass continuity / pressure coupling;
- plume / cloud rendering;
- trails;
- GPU particles;
- scenario editor UI;
- Bunkers;
- any change to hodograph physics or overlay math;
- `createScenarioRuntime`;
- demo linear-y oracle under nonzero environmental wind.

---

## 10. Testing policy (integration)

Focused integration tests; do not re-prove unit physics of Gaussian or
composite sum:

1. `createUpdraftField(DEMO_SCENARIO)` maps DTO → updraft with DEMO params
   (axis sample `Vy = 20`).
2. Demo composition field matches
   `sample(env) + sample(updraft)` at representative points.
3. Center seed initial sample: horizontal env at `y = 1000` plus `Vy > 0`.
4. Far seed (`r ≈ 1.8σ`): `0 < Vy < Vy_center` at the same height.
5. After several fixed steps: near-axis tracer `y` increases; horizontal
   drift is nonzero.
6. Reset restores seed positions and `clock.time = 0`.
7. Hodograph points are unchanged by the presence of updraft / composite
   (fixture still profile-only).

Do **not** assert general `y(t) = y0 + W0·t` for DEMO tracers.

Replace or retire the older DEMO acceptance that expected pure horizontal
env-only drift on the vertical-column seeds.

---

## 11. First implementation slice (code, after this doc)

1. Extend `ScenarioConfig` with required `storm.updraft`.
2. Update `DEMO_SCENARIO` (updraft params + radial seeds).
3. Add `createUpdraftField` in `src/scenario/`.
4. Switch `composeDemoTracerSimulation` to
   `CompositeVelocityField([env, updraft])`.
5. Adjust app copy if it still claims env-only tracers.
6. Add integration tests (§10); retire obsolete env-only DEMO trajectory
   oracle.
7. `npm test` and `npm run typecheck`.

Stop. Do not change TracerScene internals, hodograph composition, or physics
formulas.
