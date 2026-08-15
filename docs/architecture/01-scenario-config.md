# Scenario Config (v1)

## 1. Purpose

This document defines the first user-editable scenario parameter layer in
Supercell Explorer.

`ScenarioConfig` is a serializable plain-data DTO. It stores input parameters
for an experiment. It is **not** a second physics model.

Composition builds existing physics and simulation objects from it:

```text
ScenarioConfig
├─ createEnvironmentalWindProfile
│    → EnvironmentalWindProfile
│    → EnvironmentalWindField / hodographPoints / diagnostics
└─ createUpdraftField
     → UpdraftField

app composition (tracer path):
  CompositeVelocityField([environmentField, updraftField])
  → Simulation / UI / 3D rendering observe
```

Hodograph composition continues to use only the environmental profile (and
`stormMotion` for diagnostics). It must not consume updraft or composite
velocity. Demo wiring details:
`docs/rendering/03-composite-updraft-demo.md`.

It answers:

    Where do editable scenario inputs live, what shapes do they have, and
    how does composition turn them into existing physics objects without
    duplicating the physics model?

It does not redefine atmospheric equations, sampling, shear, vorticity, SRH,
or tracer advection math.

---

## 2. Scope

In v1 `ScenarioConfig` holds:

- environmental horizontal wind levels;
- horizontal storm motion;
- required controlled-updraft parameters (`storm.updraft`);
- the minimal simulation inputs for the tracer / 3D shell
  (`timestep`, `tracerSeeds`).

`storm.updraft` is **required** in the current ScenarioConfig v1 surface.
Physical meaning and validation of the updraft field remain in
`docs/physics/11-updraft-field.md`; the scenario layer stores plain numbers
only.

Out of scope for v1:

- rotation / inflow / downdraft / vertical-envelope parameters;
- thermodynamics;
- CAPE / CIN;
- Bunkers or other storm-motion estimators;
- nesting `stormMotion` under `storm` (motion stays top-level);
- rendering colors, materials, opacity;
- camera / interaction;
- UI forms;
- persistence / localStorage / file import-export UI;
- preset framework / named preset registry;
- `timeScale`, `paused`, particle count (as a separate field), domain bounds;
- integrator selection in config;
- a `createScenarioRuntime` god-object;
- caching derived physics objects inside the scenario module;
- assembling `CompositeVelocityField` inside the scenario module (app
  composition owns that).

---

## 3. Placement and dependency rules

Placement:

```text
src/scenario/
  ScenarioConfig types
  DEMO_SCENARIO
  createEnvironmentalWindProfile(config)
  createUpdraftField(config)
```

Documentation:

```text
docs/architecture/01-scenario-config.md
docs/rendering/03-composite-updraft-demo.md   // demo wiring / seeds
```

Dependency direction:

```text
scenario DTOs     →  nothing from physics / UI / simulation
scenario factories → EnvironmentalWindProfile / UpdraftField constructors
                     (value import only; each in its own factory module)
app               →  scenario + physics + simulation + ui
                     (builds EnvironmentalWindField, CompositeVelocityField,
                      Simulation)
physics           ↛  scenario
simulation        ↛  scenario
ui                ↛  scenario   (UI receives derived props from app composition)
```

**Lock-in:** scenario DTO modules must not import physics types, even
type-only.

Scenario defines its own serializable DTO shapes:

- `ScenarioWindLevel`
- `ScenarioStormMotion`
- `ScenarioTracerSeed`
- `ScenarioUpdraft` (plain numbers under `storm.updraft`)

These may be **structurally compatible** with existing physics / core
contracts (profile level inputs, `StormMotion`, world `Vec3`, updraft
params). App / composition bridges scenario DTOs into physics and simulation
APIs.

Factories live in `src/scenario/` and may **value-import** their physics
constructors. They must not import physics type aliases into DTO modules.
Split files if needed so that:

```text
ScenarioConfig.ts                 // DTO shapes only; physics-import-free
createEnvironmentalWindProfile.ts // value-import profile constructor
createUpdraftField.ts             // value-import UpdraftField
DEMO_SCENARIO.ts                  // plain data; physics-import-free
```

`createEnvironmentalWindProfile` passes a plain levels array with
`vertical: 0` and delegates profile invariants to the profile constructor.
`createUpdraftField` maps `config.storm.updraft` into `UpdraftField` params
and delegates physical validation to `UpdraftField`. Factories must not
re-export physics types as the scenario public DTO surface.

---

## 4. Architectural principle

> ScenarioConfig stores inputs. Physics owns atmospheric meaning.
> Composition builds derived objects. Rendering observes them.

Forbidden patterns:

```text
ScenarioConfig holds EnvironmentalWindProfile instance
ScenarioConfig holds VelocityField / Simulation / diagnostics
UI mutates a live profile through nested scenario state
Rendering invents a second wind/storm parameter set
```

Allowed pattern:

```text
replace ScenarioConfig (plain object)
  → explicit rebuild of profile / diagnostics / simulation inputs
  → UI and rendering consume rebuilt derived objects
```

---

## 5. Serializable DTO shape

v1 conceptual shape:

```ts
interface ScenarioWindLevel {
  height: number;     // m
  eastward: number;   // m/s
  northward: number;  // m/s
}

interface ScenarioStormMotion {
  eastward: number;   // m/s
  northward: number;  // m/s
}

interface ScenarioTracerSeed {
  x: number;          // m, world +X east
  y: number;          // m, world +Y up
  z: number;          // m, world +Z south
}

interface ScenarioUpdraft {
  centerX: number;                 // m, world +X
  centerZ: number;                 // m, world +Z
  peakVerticalVelocity: number;    // m/s
  sigma: number;                   // m
}

interface ScenarioConfig {
  environment: {
    windLevels: ScenarioWindLevel[];
  };
  stormMotion: ScenarioStormMotion;
  storm: {
    updraft: ScenarioUpdraft;      // required in current v1
  };
  simulation: {
    timestep: number;              // s, must be > 0
    tracerSeeds: ScenarioTracerSeed[];
  };
}
```

Units follow project SI conventions (`docs/ARCHITECTURE.md`,
`docs/physics/00-coordinate-system.md`).

Wind levels intentionally omit `vertical`. For environment profile v1,
vertical motion is outside the environmental model and must be `0`
(`docs/physics/04-environmental-wind-profile.md`). The factory inserts
`vertical: 0` when building profile levels. Controlled vertical motion for
tracers comes from `storm.updraft` via `UpdraftField`, not from the
environmental profile.

Storm motion is horizontal only. No vertical component. It remains
top-level (not nested under `storm`) in this version.

`storm.updraft` stores serializable updraft inputs only. Meaning, Gaussian
formula, and constraints (`peakVerticalVelocity > 0`, `sigma > 0`) are owned
by `UpdraftField` / `docs/physics/11-updraft-field.md`.

Tracer seeds use canonical world coordinates. They are initial positions for
tracer particles, not atmospheric velocity samples.

---

## 6. Why flat wind levels (not nested AtmosphericVelocity)

Alternatives considered:

| Option | Decision |
| --- | --- |
| Store `EnvironmentalWindProfile` in config | Rejected: not serializable; config becomes physics ownership |
| Store nested `{ height, velocity: AtmosphericVelocity }` | Rejected for v1 DTO: pulls physics type into scenario; forces redundant `vertical: 0` in editable JSON |
| Store flat `{ height, eastward, northward }` | **Accepted** |

Flat levels keep the editable surface minimal and JSON-friendly while
remaining structurally mappable to profile input levels at composition time.

---

## 7. Storm motion DTO vs physics `StormMotion`

`ScenarioStormMotion` is a scenario-owned serializable shape.

It is intentionally structurally identical to physics `StormMotion`
(`eastward`, `northward`), but scenario code must not import that type.

App / composition may pass `config.stormMotion` into physics diagnostics
where a `StormMotion`-compatible object is required.

No conversion helper is required while the shapes remain identical.

---

## 8. Simulation fields

Included in v1:

| Field | Meaning |
| --- | --- |
| `simulation.timestep` | Fixed numerical step `dt` in seconds, supplied to `Simulation.step(dt)` |
| `simulation.tracerSeeds` | Initial world positions for tracers; particle count is `tracerSeeds.length` |

Deferred (do not add “for later”):

| Field | Why deferred |
| --- | --- |
| `timeScale` | Not yet part of the implemented `SimulationClock` contract as scenario input; closer to runtime / UI clock control |
| `paused` | Session UI state |
| `particleCount` | Duplicates `tracerSeeds.length` |
| domain bounds | Not owned by current environment field model; rendering / future domain policy |
| integrator id | Composition chooses integrator; not user scenario surface yet |
| camera / colors | Rendering / interaction |

There is still no project-wide `DEFAULT_DT`
(`docs/physics/03-numerical-integration-basics.md`). Scenario `timestep` is
the experiment-specific value for a given config, not a hidden global default
inside core/physics.

Empty `tracerSeeds: []` is allowed while only the hodograph path is wired.
The upcoming 3D / tracer slice should extend `DEMO_SCENARIO` seeds rather than
invent a second parameter source.

---

## 9. Factories

Required in v1:

```text
createEnvironmentalWindProfile(config: ScenarioConfig)
  → EnvironmentalWindProfile

createUpdraftField(config: ScenarioConfig)
  → UpdraftField
```

`createEnvironmentalWindProfile` behavior:

1. map each `ScenarioWindLevel` to a profile level input with
   `velocity: { eastward, northward, vertical: 0 }`;
2. construct `new EnvironmentalWindProfile(levels)`;
3. let the profile constructor enforce profile invariants.

`createUpdraftField` behavior:

1. read `config.storm.updraft` plain numbers;
2. construct `new UpdraftField({ centerX, centerZ, peakVerticalVelocity, sigma })`;
3. let `UpdraftField` enforce physical invariants.

Optional later one-liners (not required):

```text
createEnvironmentalWindField(config)  // profile → EnvironmentalWindField
```

Explicitly out of scope:

```text
createScenarioRuntime(config)  // god-object: profile + fields + composite
                               // + simulation + overlays + UI payloads
```

Diagnostics / hodograph overlay composition remains in `src/app/` (or a thin
app-owned composition module), using:

```text
profile = createEnvironmentalWindProfile(config)
points  = hodographPoints(profile)
... diagnostics(profile, config.stormMotion) ...
```

Tracer field composition also remains in `src/app/`:

```text
profile  = createEnvironmentalWindProfile(config)
envField = new EnvironmentalWindField(profile)
updraft  = createUpdraftField(config)
field    = new CompositeVelocityField([envField, updraft])
```

---

## 10. Validation boundary

### Owned by `EnvironmentalWindProfile`

Do **not** duplicate these in the scenario layer:

- at least 2 levels;
- strictly increasing heights;
- finite height / eastward / northward / vertical;
- `vertical === 0` for every level;
- defensive copy of level data into profile ownership.

### Owned by `UpdraftField`

Do **not** duplicate these in the scenario layer as a second physics policy:

- finite `centerX` / `centerZ` / `peakVerticalVelocity` / `sigma`;
- `sigma > 0`;
- `peakVerticalVelocity > 0`.

`createUpdraftField` delegates to the `UpdraftField` constructor.
Updraft validation failures surface as `UpdraftFieldError`.

### Owned by scenario (scenario-specific only)

Scenario validates inputs that neither profile nor updraft field owns as
scenario-session fields:

- `stormMotion.eastward` / `northward` are finite;
- `simulation.timestep` is finite and `> 0`;
- each `tracerSeeds[i].x|y|z` is finite.

Scenario factory adds `vertical: 0` and delegates profile construction.
Profile validation failures surface as profile errors.

Scenario should not re-implement “strictly increasing heights”,
“vertical must be 0”, or updraft Gaussian constraints merely to mirror
physics constructors.

---

## 11. Immutability and update semantics

`ScenarioConfig` is a plain JSON-like object.

UI / app update model for later editing:

```text
previousConfig  →  nextConfig (object replacement)
                →  explicit rebuild of derived objects
```

Contracts:

- mutating a config object after a profile has been built must not silently
  change that profile (profile already copies level data);
- derived diagnostics and simulations are rebuilt explicitly when config
  replacement is applied;
- no immutable-update library is required for v1.

---

## 12. Demo constant (not a preset framework)

v1 provides a single constant:

```text
DEMO_SCENARIO: ScenarioConfig
```

Environment levels and storm motion must match the current hodograph demo
fixture values so existing visual / diagnostic expectations remain stable:

- levels at `0`, `1000`, `2000` m with the current demo winds;
- storm motion `C = (eastward: 10, northward: 0)`.

Controlled updraft and tracer seeds for the composite demo
(`docs/rendering/03-composite-updraft-demo.md`):

```text
storm.updraft:
  centerX = 0
  centerZ = 0
  peakVerticalVelocity = 20
  sigma = 1000

tracerSeeds:
  (0,    1000, 0)
  (600,  1000, 0)
  (1800, 1000, 0)
```

This is **one demo scenario constant**, not:

- `DEFAULT_SCENARIO` as a framework default;
- preset registry;
- named operational soundings API.

---

## 13. Serialization

v1 config must be JSON-serializable from day one.

Allowed: plain objects, arrays, finite numbers, strings only if later needed.

Forbidden in the DTO: class instances, methods, `Map` / `Set`, `Date`,
functions, non-JSON `undefined`-required fields, physics object references.

Round-trip expectation:

```text
JSON.stringify(config) → JSON.parse → structurally same ScenarioConfig
```

---

## 14. Migration of the current hodograph demo

Current state:

```text
src/app/demoHodographFixture.ts
  hardcodes levels + DEMO_STORM_MOTION
  builds profile / points / overlays
```

Target flow:

```text
DEMO_SCENARIO
  → createEnvironmentalWindProfile(scenario)
  → hodographPoints(profile)
  → diagnostics / overlays from profile + scenario.stormMotion
  → HodographPanel props from app composition
```

Overlay visibility remains UI state, not scenario data.

The nasty visual-check numeric expectations for layer `[0, 1000]` remain
valid if `DEMO_SCENARIO` preserves the current fixture numbers.

---

## 15. Shared use by hodograph and 3D simulation

The same `ScenarioConfig` feeds both composition paths:

```text
ScenarioConfig
├─ hodograph path
│    profile → points / storm overlays / diagnostics → panel
│    (ignores storm.updraft for geometry and overlays)
└─ tracer / 3D path
     profile → EnvironmentalWindField
     storm.updraft → UpdraftField
     CompositeVelocityField([env, updraft])   // app composition
     tracerSeeds → TracerParticle[]
     timestep → Simulation.step(dt)
     rendering observes particle positions
```

Rendering must not introduce a second editable copy of environment winds,
updraft parameters, or storm motion.

Camera, colors, and layer visibility stay outside `ScenarioConfig`.

General demo trajectories under nonzero environmental wind must not claim
the calm-env linear-y oracle `y(t) = y0 + W0·t`
(`docs/rendering/03-composite-updraft-demo.md`).

---

## 16. Tests

Scenario-layer tests should verify contracts, not React cosmetics:

1. `DEMO_SCENARIO` → profile samples match configured eastward / northward at
   knot heights; vertical samples are `0`.
2. scenario storm motion + rebuilt profile → diagnostics / overlay payloads
   match the current demo fixture expectations.
3. `createUpdraftField(DEMO_SCENARIO)` maps DEMO updraft DTO params (axis
   `Vy = peakVerticalVelocity`).
4. replacing config values and rebuilding yields updated derived objects.
5. mutating config after `createEnvironmentalWindProfile` does not change the
   already-created profile samples.

Do not duplicate full profile or `UpdraftField` validation matrices already
owned by physics tests. Composite demo integration tests live with app /
simulation composition per `docs/rendering/03-composite-updraft-demo.md`.

---

## 17. Relationship to existing docs

- Coordinate / units / layering: `docs/ARCHITECTURE.md`
- Environment profile meaning and `vertical = 0`:
  `docs/physics/04-environmental-wind-profile.md`
- Updraft field: `docs/physics/11-updraft-field.md`
- Composite field: `docs/physics/12-composite-velocity-field.md`
- Storm motion diagnostic: `docs/physics/07-storm-relative-wind.md`
- Timestep philosophy / no project-wide `DEFAULT_DT`:
  `docs/physics/03-numerical-integration-basics.md`
- Hodograph UI composition today: `docs/ui/01-hodograph-panel.md` and
  related overlay docs under `docs/ui/`
- Composite updraft demo wiring / seeds / anti-oracle:
  `docs/rendering/03-composite-updraft-demo.md`

When this document and code disagree, stop and resolve the contradiction
before extending scenario scope.

---

## 18. v1 lock-in summary

1. Live in `src/scenario/`.
2. `ScenarioConfig` is a JSON-serializable plain DTO, not a physics model.
3. Scenario-owned shapes: `ScenarioWindLevel`, `ScenarioStormMotion`,
   `ScenarioTracerSeed`, `ScenarioUpdraft`; no physics type-only imports
   into scenario DTOs.
4. Wind levels are flat `{ height, eastward, northward }`; factory inserts
   `vertical: 0`.
5. `storm.updraft` is required; `stormMotion` stays top-level.
6. `simulation = { timestep, tracerSeeds }` only.
7. Provide `createEnvironmentalWindProfile(config)` and
   `createUpdraftField(config)`; no runtime god-object; no composite inside
   scenario.
8. Do not duplicate profile / updraft physical validation; scenario validates
   storm motion, timestep, and tracer seeds.
9. Updates are plain object replacement + explicit rebuild.
10. One `DEMO_SCENARIO` constant; no preset framework.
11. Same config feeds hodograph (profile-only) and 3D tracer (env + updraft
    composite in app composition).

---

## 19. Historical first scenario slice

The original scenario introduction slice (types, `DEMO_SCENARIO`,
`createEnvironmentalWindProfile`, hodograph rewiring) is complete.

The composite updraft demo extension — required `storm.updraft`,
`createUpdraftField`, DEMO seeds/params, and app
`CompositeVelocityField` wiring — is specified in
`docs/rendering/03-composite-updraft-demo.md` and must not be started until
that documentation slice is accepted and a separate implementation command
is given.
