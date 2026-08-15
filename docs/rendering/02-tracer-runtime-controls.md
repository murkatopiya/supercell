# Tracer Runtime Controls (v1)

## 1. Purpose

This document defines Pause / Resume, playback `timeScale`, and Reset for the
environmental-wind tracer scene.

It answers:

    How does session runtime control simulation progress without changing
    ScenarioConfig, without enlarging the numerical timestep, and without
    catch-up after pause?

It extends the loop described in:

    docs/rendering/01-tracer-scene.md

It does not change atmospheric physics, hodograph composition, or the fixed
scenario timestep.

---

## 2. Scope

In v1 the tracer panel gains:

- **Pause / Resume**;
- **timeScale** choices: `1×` / `5×` / `10×` / `20×`;
- **Reset** to the original demo seed positions and `t = 0`.

Out of scope **for the runtime-controls slice itself** (this document does
not implement storm physics):

- trails / path ribbons;
- implementing updraft / rotation / composite field wiring
  (owned by `docs/rendering/03-composite-updraft-demo.md`);
- storm-relative 3D velocity;
- editing scenario parameters / forms;
- playback timeline / scrubbing / rewind;
- variable timestep;
- previous/current state interpolation;
- camera reset;
- putting `paused` / `timeScale` into `ScenarioConfig`;
- expanding `SimulationClock` with `paused` / `timeScale` in this slice.

Pause / timeScale / Reset continue to apply unchanged when the DEMO field
becomes `CompositeVelocityField([env, updraft])`.

---

## 3. Architectural principle

| Concern | Owner |
| --- | --- |
| Fixed numerical `timestep` | `ScenarioConfig.simulation.timestep` (demo: `0.1` s) |
| `paused`, `timeScale` | Runtime / UI session state |
| Wall-frame clamp, pause gating, timeScale multiply | Runtime orchestration (viewport / loop host) |
| `simulationElapsed → fixed steps` | Pure `consumeFixedTimesteps` |
| Particle positions / `clock.time` | `Simulation` |
| Seed definitions | `DEMO_SCENARIO.simulation.tracerSeeds` (immutable under Reset) |

> Speed up time by feeding more **simulation elapsed** into the fixed-step
> accumulator. Never enlarge `dt`.

Rendering continues to show the **last completed fixed-step state** only
(no interpolation), per `01-tracer-scene.md`.

---

## 4. Controls and semantics

### Pause / Resume

- `paused === true`: orchestration supplies `simulationElapsed = 0` for that
  frame; `Simulation.step` is not called.
- Three.js still syncs (noop positions) and **renders** every frame so
  OrbitControls inspection keeps working.
- Hodograph does not observe `paused`.

### timeScale

Allowed values only:

```text
1 | 5 | 10 | 20
```

Meaning:

```text
simulationElapsed = clampedWallFrameDt * timeScale
```

when not paused. The scenario timestep stays `0.1` s on every
`simulation.step(0.1)`.

### Reset

Reset must:

1. restore particle positions from **copies** of
   `DEMO_SCENARIO.simulation.tracerSeeds` (via the existing seed→particle
   copy helper or equivalent);
2. set each restored particle `age = 0`, `active = true`;
3. set `simulation.clock.time = 0`;
4. set the loop `accumulator = 0`;
5. refresh `previousMs` to the current frame time;
6. **preserve** current `paused` and `timeScale`;
7. **not** mutate `DEMO_SCENARIO` / its seed array;
8. **not** recreate the Three.js `TracerScene` (meshes stay; sync copies new
   positions).

---

## 5. Loop orchestration

Conceptual frame:

```text
onAnimationFrame(now):
  wallFrameDt = now - previousMs
  previousMs = now                    // ALWAYS, including while paused

  simulationElapsed = simulationElapsedFromWall(wallFrameDt, {
    paused,
    timeScale,
    maxWallDelta,                     // spiral guard on WALL time only
  })

  { steps, accumulator } = consumeFixedTimesteps(
    accumulator,
    simulationElapsed,
    scenario.simulation.timestep,     // fixed 0.1 — never scaled
  )

  repeat steps times:
    simulation.step(timestep)

  rendering.syncFromParticles(simulation.particles)
  rendering.render()
```

### No catch-up after Pause / Resume (lock-in)

While paused, wall time must **not** accumulate into the simulation
accumulator.

Mechanism:

1. every frame updates `previousMs`, discarding wall gaps from the delta
   basis;
2. paused frames pass `simulationElapsed = 0` into `consumeFixedTimesteps`.

Therefore a long pause does not produce a burst of steps on Resume. The first
active frame after Resume advances only by that frame's
`clampedWall * timeScale`.

A partial accumulator remainder left from the last active frame may remain;
that is unfinished simulation time from before pause, not paused wall time.
That remainder is allowed.

Optional extra safety (allowed, not required): on the transition
`paused: true → false`, set `previousMs = now` once.

### Spiral guard

Clamp **wall** frame duration only (example default `maxWallDelta = 0.25` s),
then apply `timeScale`.

Do **not** clamp the resulting simulation elapsed back down to `0.25` s —
that would defeat `20×`. Many fixed steps in one frame at high scale are
expected.

No `maxStepsPerFrame` in v1.

---

## 6. Pure helpers

### `simulationElapsedFromWall` (new, recommended)

Pure function under `src/simulation/` (no DOM / Three.js):

```text
simulationElapsedFromWall(
  wallFrameDt,
  { paused, timeScale, maxWallDelta }
) → simulationElapsed
```

Behavior:

```text
if paused: return 0
clampedWall = min(wallFrameDt, maxWallDelta)
return clampedWall * timeScale
```

Reject non-finite / invalid `timeScale` / non-positive `maxWallDelta` as
appropriate for a small strict helper.

### `consumeFixedTimesteps` (contract change)

Becomes a pure **simulation-elapsed → fixed steps** helper:

```text
consumeFixedTimesteps(
  previousAccumulator,
  simulationElapsed,
  timestep
) → { steps, accumulator }
```

**Lock-in:** remove wall-time clamp from this API. Wall clamp, pause, and
timeScale belong entirely to runtime orchestration (and
`simulationElapsedFromWall`).

The second argument is simulation seconds to add, already scaled and pause-
gated by the caller.

---

## 7. React / data flow

```text
App (or tracer panel shell)
  runtime state: paused, timeScale ∈ {1,5,10,20}, resetEpoch
  simulation instance (stable; Reset mutates particles/clock in place)

  TracerRuntimeControls
    → onPause / onResume / onTimeScale / onReset

  TracerViewport
    props: simulation, timestep, paused, timeScale, resetEpoch
    rAF closure refs read latest paused/timeScale
    resetEpoch bump → accumulator = 0, previousMs = now
      (do not dispose TracerScene)
```

`paused` / `timeScale` toggles must **not** tear down the Three.js scene.
Prefer refs updated each render so the rAF effect dependency list does not
recreate the WebGL context on every Pause click.

Hodograph composition remains on `DEMO_SCENARIO` only and does not subscribe
to runtime control state.

---

## 8. Reset helper

Prefer in-place restore without replacing the `Simulation` instance:

```text
resetTracersFromSeeds(simulation, seeds)
  → rewrite each particle from seed copies
  → simulation.clock.time = 0
```

Seeds argument is a read-only view of demo seeds; never write back into
`ScenarioConfig`.

---

## 9. Testing

Required focused tests (no WebGL harness):

1. **timeScale** — `simulationElapsedFromWall` and/or orchestration:
   wall `0.1`, scale `10`, not paused → elapsed `1.0`; with timestep `0.1`
   and empty accumulator → `10` steps.
2. **Pause** — paused + large wall dt → elapsed `0`; accumulator unchanged
   when consumed with `0`.
3. **Resume without catch-up** — sequence that advances `previousMs` across a
   long paused gap (or equivalent pure model of that policy) then one active
   frame → steps reflect only the post-resume wall slice × scale, not pause
   duration.
4. **Reset** — after N steps, reset restores seed positions, `clock.time === 0`,
   preserves `timeScale` / `paused`, leaves `DEMO_SCENARIO.tracerSeeds`
   unchanged.

Update existing `consumeFixedTimesteps` tests for the clamp-free
simulation-elapsed API.

---

## 10. Placement

```text
src/ui/tracer/
  TracerRuntimeControls.tsx     // Pause/Resume, scale, Reset
  TracerViewport.tsx            // orchestration + rAF (existing host)

src/simulation/
  simulationElapsedFromWall.ts  // pure
  consumeFixedTimesteps.ts      // pure, no wall clamp
  resetTracersFromSeeds.ts      // or equivalent small helper
```

Documentation:

```text
docs/rendering/02-tracer-runtime-controls.md
```

---

## 11. Relationship to existing docs

- Tracer scene / fixed-step / no interpolation:
  `docs/rendering/01-tracer-scene.md`
- Composite env + updraft DEMO wiring (current DEMO field/seeds; runtime
  controls unchanged):
  `docs/rendering/03-composite-updraft-demo.md`
- Scenario DTO (`timestep` / seeds / `storm.updraft`; no runtime scale):
  `docs/architecture/01-scenario-config.md`
- Conceptual sim vs render time:
  `docs/ARCHITECTURE.md`
- Numerical timestep philosophy:
  `docs/physics/03-numerical-integration-basics.md`

Note: `ARCHITECTURE.md` conceptually mentions `timeScale` / `paused` on a
clock interface. For this slice those fields remain **runtime UI state**, not
`ScenarioConfig` and not a required `SimulationClock` expansion.

---

## 12. v1 lock-in summary

1. `paused` / `timeScale` = runtime UI state; not ScenarioConfig.
2. Scenario `timestep` stays fixed (`0.1` in demo); scale ≠ larger `dt`.
3. `consumeFixedTimesteps` = pure simulationElapsed → steps; **no** wall clamp.
4. Wall clamp, pause, and timeScale live in orchestration +
   `simulationElapsedFromWall`.
5. No catch-up after pause: always advance `previousMs`; paused elapsed = 0.
6. Reset restores particles / time / accumulator; keeps paused + timeScale;
   does not mutate config seeds; does not recreate Three scene.
7. Render + OrbitControls continue while paused.
8. Hodograph independent of runtime controls.
9. No interpolation, timeline, rewind, or variable timestep.

---

## 13. First implementation slice (after this doc)

1. Add `simulationElapsedFromWall` + tests.
2. Remove wall clamp from `consumeFixedTimesteps`; retarget tests.
3. Add `resetTracersFromSeeds` (or equivalent) + Reset tests.
4. Wire `TracerRuntimeControls` + viewport orchestration
   (`paused` / `timeScale` refs, `resetEpoch`, always-on render).
5. Keep hodograph unchanged on the same `DEMO_SCENARIO`.
6. Run `npm test`, `npm run typecheck`, `npm run build`.

**Done when:** Pause freezes tracers but Orbit still works; `20×` is visibly
faster at the same `dt`; Resume has no pause-duration catch-up burst; Reset
returns the three seeds at `t = 0` with scale/pause preserved; hodograph
unaffected.

Stop after that slice.
