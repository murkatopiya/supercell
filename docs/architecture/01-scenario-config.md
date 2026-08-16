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
├─ createUpdraftField
│    → VerticalEnvelopeUpdraftField
├─ createRotationField
│    → VerticalEnvelopeRotationField
├─ createLowerRadialInflowField
│    → LowerRadialInflowField
└─ createUpperRadialOutflowField
     → UpperRadialOutflowField

app composition (tracer path):
  IntegrationFrame default API = GroundRelativeWindTunnel
  live App.tsx = StormRelativeLaboratory
  CompositeVelocityField([
    environmentField,   // EnvironmentalWindField, or
                        // StormRelativeEnvironmentalAdvectionField(env, C)
                        // when IntegrationFrame.StormRelativeLaboratory
    updraftField,
    rotationField,
    lowerRadialInflowField,
    upperRadialOutflowField,
  ])
  → Simulation / UI / 3D rendering observe
```

Hodograph composition continues to use only the environmental profile (and
`stormMotion` for diagnostics). It must not consume updraft, rotation,
lower radial inflow, upper radial outflow, or composite velocity. Demo wiring
details:
`docs/rendering/08-composite-lower-radial-inflow-demo.md`.
Live envelope bounds:
`docs/rendering/10-deep-storm-envelope-scaling.md`.
Current rotation occupant / wiring:
`docs/rendering/12-composite-vertical-envelope-rotation-demo.md`.

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
- required controlled-rotation parameters (`storm.rotation`);
- required controlled lower radial-inflow parameters
  (`storm.lowerRadialInflow`);
- required controlled upper radial-outflow parameters
  (`storm.upperRadialOutflow`);
- the minimal simulation inputs for the tracer / 3D shell
  (`timestep`, `tracerSeeds`).

`storm.updraft`, `storm.rotation`, `storm.lowerRadialInflow`, and
`storm.upperRadialOutflow` are **required** in the current
ScenarioConfig v1 surface. Physical meaning and validation remain in
`docs/physics/15-vertical-updraft-envelope.md`,
`docs/physics/18-vertical-rotation-envelope.md`,
`docs/physics/17-lower-radial-inflow-field.md`, and
`docs/physics/16-upper-radial-outflow-field.md`; the scenario layer
stores plain numbers only. Isolated height-independent `UpdraftField`
(`docs/physics/11-updraft-field.md`), isolated height-independent
`RotationField` (`docs/physics/13-rotation-field.md`), and isolated
height-independent `RadialInflowField` (`docs/physics/14-radial-inflow-field.md`)
are not ScenarioConfig occupants.

Out of scope for v1:

- downdraft / surface cold-pool outflow parameters;
- a shared `storm.center` or combined storm-field type;
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
  createRotationField(config)
  createLowerRadialInflowField(config)
  createUpperRadialOutflowField(config)
```

Documentation:

```text
docs/architecture/01-scenario-config.md
docs/rendering/08-composite-lower-radial-inflow-demo.md   // historical five-operand introduction / seeds
docs/rendering/09-deep-environmental-profile-demo.md     // DEMO env knots (0–12 km)
docs/rendering/10-deep-storm-envelope-scaling.md         // DEMO storm envelope bounds before localized rotation
docs/rendering/12-composite-vertical-envelope-rotation-demo.md
                                                         // current rotation occupant / wiring
```

Dependency direction:

```text
scenario DTOs     →  nothing from physics / UI / simulation
scenario factories → EnvironmentalWindProfile / VerticalEnvelopeUpdraftField /
                     VerticalEnvelopeRotationField / LowerRadialInflowField /
                     UpperRadialOutflowField constructors
                     (value import only; each in its own factory module)
app               →  scenario + physics + simulation + ui
                     (builds IntegrationFrame-selected env operand,
                      CompositeVelocityField, Simulation)
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
- `ScenarioRotation` (plain numbers under `storm.rotation`)
- `ScenarioLowerRadialInflow` (plain numbers under `storm.lowerRadialInflow`)
- `ScenarioUpperRadialOutflow` (plain numbers under `storm.upperRadialOutflow`)

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
createUpdraftField.ts             // value-import VerticalEnvelopeUpdraftField
createRotationField.ts            // value-import VerticalEnvelopeRotationField
createLowerRadialInflowField.ts   // value-import LowerRadialInflowField
createUpperRadialOutflowField.ts  // value-import UpperRadialOutflowField
DEMO_SCENARIO.ts                  // plain data; physics-import-free
```

`createEnvironmentalWindProfile` passes a plain levels array with
`vertical: 0` and delegates profile invariants to the profile constructor.
`createUpdraftField` maps `config.storm.updraft` into
`VerticalEnvelopeUpdraftField` params and delegates physical validation to
`VerticalEnvelopeUpdraftField`.
`createRotationField` maps `config.storm.rotation` into
`VerticalEnvelopeRotationField` params and delegates physical validation to
`VerticalEnvelopeRotationField`.
`createLowerRadialInflowField` maps `config.storm.lowerRadialInflow`
into `LowerRadialInflowField` params and delegates physical validation
to `LowerRadialInflowField`.
`createUpperRadialOutflowField` maps `config.storm.upperRadialOutflow`
into `UpperRadialOutflowField` params and delegates physical validation
to `UpperRadialOutflowField`. Factories must not re-export physics types
as the scenario public DTO surface.

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
  baseHeight: number;              // m, world +Y
  topHeight: number;               // m, world +Y
}

interface ScenarioRotation {
  centerX: number;                 // m, world +X
  centerZ: number;                 // m, world +Z
  angularVelocity: number;         // rad/s
  sigma: number;                   // m
  baseHeight: number;              // m, world +Y; lower lid, G = 0
  topHeight: number;               // m, world +Y; upper lid, G = 0
}

interface ScenarioLowerRadialInflow {
  centerX: number;                 // m, world +X
  centerZ: number;                 // m, world +Z
  radialStrainRate: number;        // 1/s
  sigma: number;                   // m
  baseHeight: number;              // m, world +Y; plateau top / taper start
  topHeight: number;               // m, world +Y; G = 0 at and above
}

interface ScenarioUpperRadialOutflow {
  centerX: number;                 // m, world +X
  centerZ: number;                 // m, world +Z
  outflowStrainRate: number;       // 1/s
  sigma: number;                   // m
  baseHeight: number;              // m, world +Y
  topHeight: number;               // m, world +Y
}

interface ScenarioConfig {
  environment: {
    windLevels: ScenarioWindLevel[];
  };
  stormMotion: ScenarioStormMotion;
  storm: {
    updraft: ScenarioUpdraft;                       // required in current v1
    rotation: ScenarioRotation;                     // required in current v1
    lowerRadialInflow: ScenarioLowerRadialInflow;   // required in current v1
    upperRadialOutflow: ScenarioUpperRadialOutflow; // required in current v1
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
tracers comes from `storm.updraft` via `VerticalEnvelopeUpdraftField`, not from the
environmental profile.

Storm motion is horizontal only. No vertical component. It remains
top-level (not nested under `storm`) in this version.

`storm.updraft` stores serializable updraft inputs only. Meaning, Gaussian
radial profile, half-sine vertical envelope, and constraints
(`peakVerticalVelocity > 0`, `sigma > 0`, `topHeight > baseHeight`) are
owned by `VerticalEnvelopeUpdraftField` /
`docs/physics/15-vertical-updraft-envelope.md`. Isolated
`UpdraftField` (`docs/physics/11-updraft-field.md`) is not constructed
from this DTO.

`storm.rotation` stores serializable rotation inputs only. Meaning, Gaussian-
modulated solid-body formula, compact half-sine `G(y)`, right-hand `+Y` sign,
and constraints (`sigma > 0`, `topHeight > baseHeight`; `angularVelocity`
finite, including `0` and negatives) are owned by
`VerticalEnvelopeRotationField` /
`docs/physics/18-vertical-rotation-envelope.md`.
`baseHeight` / `topHeight` on this block are zero lids (`G = 0`), the same
semantic as `storm.updraft`, not the plateau-top meaning of
`storm.lowerRadialInflow`. Isolated `RotationField`
(`docs/physics/13-rotation-field.md`) is not constructed from this DTO.

`storm.lowerRadialInflow` stores serializable lower radial-inflow inputs
only. Meaning, Gaussian-modulated linear inflow, plateau + quarter-cosine
`G(y)`, strictly inward sign, and constraints (`radialStrainRate > 0`,
`sigma > 0`, `topHeight > baseHeight`) are owned by
`LowerRadialInflowField` /
`docs/physics/17-lower-radial-inflow-field.md`.
`baseHeight` on this block is the plateau top / taper start (`G = 1` at
and below), not a zero lid. Isolated `RadialInflowField`
(`docs/physics/14-radial-inflow-field.md`) is not constructed from this
DTO.

`storm.upperRadialOutflow` stores serializable upper radial-outflow inputs
only. Meaning, Gaussian-modulated linear outflow, half-sine `G(y)`,
strictly outward sign, and constraints (`outflowStrainRate > 0`,
`sigma > 0`, `topHeight > baseHeight`) are owned by
`UpperRadialOutflowField` /
`docs/physics/16-upper-radial-outflow-field.md`.

Updraft, rotation, lower-radial-inflow, and upper radial-outflow centers are
independently parameterized. DEMO may set them equal as a fixture choice;
that coincidence is not an API invariant and must not become a shared
`storm.center`. Vertical inflow, outflow, and rotation bounds are
likewise independent of `storm.updraft` bounds and of each other.
Rotation `[0, 6500]` is a DEMO fixture, not a copy of updraft
`[0, 8000]`.

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
  → VerticalEnvelopeUpdraftField

createRotationField(config: ScenarioConfig)
  → VerticalEnvelopeRotationField

createLowerRadialInflowField(config: ScenarioConfig)
  → LowerRadialInflowField

createUpperRadialOutflowField(config: ScenarioConfig)
  → UpperRadialOutflowField
```

`createEnvironmentalWindProfile` behavior:

1. map each `ScenarioWindLevel` to a profile level input with
   `velocity: { eastward, northward, vertical: 0 }`;
2. construct `new EnvironmentalWindProfile(levels)`;
3. let the profile constructor enforce profile invariants.

`createUpdraftField` behavior:

1. read `config.storm.updraft` plain numbers;
2. construct `new VerticalEnvelopeUpdraftField({
     centerX, centerZ, peakVerticalVelocity, sigma, baseHeight, topHeight
   })`;
3. let `VerticalEnvelopeUpdraftField` enforce physical invariants.

`createRotationField` behavior:

1. read `config.storm.rotation` plain numbers;
2. construct `new VerticalEnvelopeRotationField({
     centerX, centerZ, angularVelocity, sigma, baseHeight, topHeight
   })`;
3. let `VerticalEnvelopeRotationField` enforce physical invariants.
   Do not copy centers, `sigma`, or vertical bounds from `storm.updraft`,
   `storm.lowerRadialInflow`, or `storm.upperRadialOutflow`.

`createLowerRadialInflowField` behavior:

1. read `config.storm.lowerRadialInflow` plain numbers;
2. construct `new LowerRadialInflowField({
     centerX, centerZ, radialStrainRate, sigma, baseHeight, topHeight
   })`;
3. let `LowerRadialInflowField` enforce physical invariants.
   Do not copy centers, `sigma`, or vertical bounds from `storm.updraft`,
   `storm.rotation`, or `storm.upperRadialOutflow`.

`createUpperRadialOutflowField` behavior:

1. read `config.storm.upperRadialOutflow` plain numbers;
2. construct `new UpperRadialOutflowField({
     centerX, centerZ, outflowStrainRate, sigma, baseHeight, topHeight
   })`;
3. let `UpperRadialOutflowField` enforce physical invariants.
   Do not copy centers, `sigma`, or vertical bounds from `storm.updraft`,
   `storm.rotation`, or `storm.lowerRadialInflow`.

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
rotation = createRotationField(config)
inflow   = createLowerRadialInflowField(config)
outflow  = createUpperRadialOutflowField(config)
field    = new CompositeVelocityField(
             [envField, updraft, rotation, inflow, outflow])
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

### Owned by `VerticalEnvelopeUpdraftField`

Do **not** duplicate these in the scenario layer as a second physics policy:

- finite `centerX` / `centerZ` / `peakVerticalVelocity` / `sigma` /
  `baseHeight` / `topHeight`;
- `sigma > 0`;
- `peakVerticalVelocity > 0`;
- `topHeight > baseHeight`.

`createUpdraftField` delegates to the `VerticalEnvelopeUpdraftField`
constructor. Updraft validation failures surface as
`VerticalEnvelopeUpdraftFieldError`.

### Owned by `VerticalEnvelopeRotationField`

Do **not** duplicate these in the scenario layer as a second physics policy:

- finite `centerX` / `centerZ` / `angularVelocity` / `sigma` /
  `baseHeight` / `topHeight`;
- `sigma > 0`;
- `topHeight > baseHeight`.

`createRotationField` delegates to the `VerticalEnvelopeRotationField`
constructor. Rotation validation failures surface as
`VerticalEnvelopeRotationFieldError`.
Negative and zero `angularVelocity` are valid physics inputs.

### Owned by `LowerRadialInflowField`

Do **not** duplicate these in the scenario layer as a second physics policy:

- finite `centerX` / `centerZ` / `radialStrainRate` / `sigma` /
  `baseHeight` / `topHeight`;
- `sigma > 0`;
- `radialStrainRate > 0`;
- `topHeight > baseHeight`.

`createLowerRadialInflowField` delegates to the
`LowerRadialInflowField` constructor. Lower-inflow validation
failures surface as `LowerRadialInflowFieldError`.
Zero and negative `radialStrainRate` are invalid physics inputs.

### Owned by `UpperRadialOutflowField`

Do **not** duplicate these in the scenario layer as a second physics policy:

- finite `centerX` / `centerZ` / `outflowStrainRate` / `sigma` /
  `baseHeight` / `topHeight`;
- `sigma > 0`;
- `outflowStrainRate > 0`;
- `topHeight > baseHeight`.

`createUpperRadialOutflowField` delegates to the
`UpperRadialOutflowField` constructor. Outflow validation failures
surface as `UpperRadialOutflowFieldError`.
Zero and negative `outflowStrainRate` are invalid physics inputs.

### Owned by scenario (scenario-specific only)

Scenario validates inputs that neither profile, updraft, rotation,
lower-radial-inflow, nor upper radial-outflow field owns as scenario-session
fields:

- `stormMotion.eastward` / `northward` are finite;
- `simulation.timestep` is finite and `> 0`;
- each `tracerSeeds[i].x|y|z` is finite.

Scenario factory adds `vertical: 0` and delegates profile construction.
Profile validation failures surface as profile errors.

Scenario should not re-implement “strictly increasing heights”,
“vertical must be 0”, or updraft / rotation / lower-radial-inflow /
upper-radial-outflow Gaussian constraints merely to mirror physics
constructors.

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

- levels at `0`, `1000`, `2000`, `6000`, `12000` m:

```text
0 m:     eastward 15, northward 5
1000 m:  eastward 5,  northward 15
2000 m:  eastward 10, northward 25
6000 m:  eastward 30, northward 20
12000 m: eastward 40, northward 10
```

- storm motion `C = (eastward: 10, northward: 0)`.

The five-knot laboratory profile is owned by
`docs/rendering/09-deep-environmental-profile-demo.md`. Do not add a
global `topHeight` to this DTO. Lower `0 / 1000 / 2000` winds remain the
already-studied fixture; `6000` and `12000` extend the column upward.
Keep `C`.

Controlled updraft, rotation, lower radial inflow, upper radial outflow, and
tracer seeds for the current composite demo
(`docs/architecture/06-deep-chimney-scaling-demo-retune.md` live numbers;
`docs/rendering/08-composite-lower-radial-inflow-demo.md` seed layout;
`docs/rendering/10-deep-storm-envelope-scaling.md` envelope bounds;
`docs/rendering/12-composite-vertical-envelope-rotation-demo.md`
rotation occupant):

```text
storm.updraft:
  centerX = 0
  centerZ = 0
  peakVerticalVelocity = 30
  sigma = 4000
  baseHeight = 0
  topHeight = 8000

storm.rotation:
  centerX = 0
  centerZ = 0
  angularVelocity = 0.005
  sigma = 4000
  baseHeight = 0
  topHeight = 6500

storm.lowerRadialInflow:
  centerX = 0
  centerZ = 0
  radialStrainRate = 0.00125
  sigma = 4000
  baseHeight = 1500
  topHeight = 4500

storm.upperRadialOutflow:
  centerX = 0
  centerZ = 0
  outflowStrainRate = 0.0025
  sigma = 4000
  baseHeight = 5000
  topHeight = 9000

tracerSeeds:
  (0,    1000,  0)
  (2400, 1000,  0)
  (0,    1000, -2400)
```

Four `sigma = 4000` values are a DEMO scenario choice, not a
`storm.sigma` field and not a physics invariant. Peak Gaussian
horizontal speeds stay `≈ 12.13 / 3.03 / 6.07` m/s (`06` policy B).

DEMO storm centers (and horizontal `sigma`) coincide as a fixture
choice, not as an API invariant. Live envelope relations (inflow
plateau to `1500`, radial-quiet `4500–5000`, outflow `5000–9000`,
updraft `[0, 8000]`) are the `10` fixture, not an API coupling.
Rotation `[0, 6500]` is the `12` fixture and is **not** the updraft
interval.

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
│    (ignores storm.updraft, storm.rotation, storm.lowerRadialInflow,
│     and storm.upperRadialOutflow for geometry and overlays)
└─ tracer / 3D path
     IntegrationFrame (app composition; default GroundRelativeWindTunnel;
     live App = StormRelativeLaboratory)
     profile → EnvironmentalWindField
             → optional StormRelativeEnvironmentalAdvectionField(env, stormMotion)
     storm.updraft → VerticalEnvelopeUpdraftField
     storm.rotation → VerticalEnvelopeRotationField
     storm.lowerRadialInflow → LowerRadialInflowField
     storm.upperRadialOutflow → UpperRadialOutflowField
     CompositeVelocityField([envOperand, updraft, rotation, lowerRadialInflow, outflow])
     // app composition; CompositeVelocityField does not know the frame
     tracerSeeds → TracerParticle[]
     timestep → Simulation.step(dt)
     rendering observes particle positions
```

Rendering must not introduce a second editable copy of environment winds,
updraft parameters, rotation parameters, lower-radial-inflow parameters, upper
radial-outflow parameters, or storm motion.

`IntegrationFrame` is an app-composition concern, not a `ScenarioConfig`
field. Live browser 3D is `StormRelativeLaboratory`; the default
composition API remains `GroundRelativeWindTunnel`
(`docs/architecture/03-wind-tunnel-storm-relative-3d-semantics.md` §21).

Camera, colors, and layer visibility stay outside `ScenarioConfig`.

General demo trajectories under nonzero environmental wind must not claim
the isolated-rotation circular oracle, the calm-env linear-y oracle
`y(t) = y0 + W0·t`, the isolated half-sine closed form, `r(t) = r0 e^{-At}`,
or `r(t) = r0 e^{+At}`
(`docs/rendering/08-composite-lower-radial-inflow-demo.md`).

---

## 16. Tests

Scenario-layer tests should verify contracts, not React cosmetics:

1. `DEMO_SCENARIO` → profile samples match configured eastward / northward at
   knot heights; vertical samples are `0`.
2. scenario storm motion + rebuilt profile → diagnostics / overlay payloads
   match the current demo fixture expectations.
3. `createUpdraftField(DEMO_SCENARIO)` maps DEMO updraft DTO params (axis
   at `y_mid = 4000`, `Vy = peakVerticalVelocity * F(y_mid)`; at seed
   height `F(1000) = sin(π/8)`, not `1`).
4. `createRotationField(DEMO_SCENARIO)` maps DEMO rotation DTO params to
   `VerticalEnvelopeRotationField` (axis `V = (0,0,0)`; lids `V = 0`;
   `G_rot(1000) = sin(π/6.5)`; identity with `RotationField` at
   `y_mid = 3250`).
5. `createLowerRadialInflowField(DEMO_SCENARIO)` maps DEMO lower-inflow
   DTO params (axis `V = (0,0,0)`; plateau sample matches
   `RadialInflowField` with equal radial params; at seed height
   `y = 1000`, `G_in = 1`).
6. `createUpperRadialOutflowField(DEMO_SCENARIO)` maps DEMO outflow DTO
   params (axis `V = (0,0,0)`; at `y_mid = 7000` off-axis, outward;
   at seed height `y = 1000`, `G = 0`).
7. replacing config values and rebuilding yields updated derived objects.
8. mutating config after `createEnvironmentalWindProfile` does not change the
   already-created profile samples.

Do not duplicate full profile, `VerticalEnvelopeUpdraftField`,
`VerticalEnvelopeRotationField`, `LowerRadialInflowField`, or
`UpperRadialOutflowField` validation matrices already owned by physics
tests. Isolated `UpdraftField`, isolated `RotationField`, and isolated
`RadialInflowField` validation stay in physics tests.
Composite demo integration tests live with app / simulation composition per
`docs/rendering/12-composite-vertical-envelope-rotation-demo.md`,
`docs/rendering/08-composite-lower-radial-inflow-demo.md`, and
`docs/rendering/10-deep-storm-envelope-scaling.md`.

---

## 17. Relationship to existing docs

- Coordinate / units / layering: `docs/ARCHITECTURE.md`
- Environment profile meaning and `vertical = 0`:
  `docs/physics/04-environmental-wind-profile.md`
- Height-independent updraft primitive: `docs/physics/11-updraft-field.md`
- Vertical envelope updraft (current DEMO occupant):
  `docs/physics/15-vertical-updraft-envelope.md`
- Rotation field (isolated height-independent primitive):
  `docs/physics/13-rotation-field.md`
- Vertical envelope rotation (current DEMO occupant):
  `docs/physics/18-vertical-rotation-envelope.md`
- Height-independent radial inflow primitive:
  `docs/physics/14-radial-inflow-field.md`
- Lower radial inflow field (current DEMO occupant):
  `docs/physics/17-lower-radial-inflow-field.md`
- Upper radial outflow field: `docs/physics/16-upper-radial-outflow-field.md`
- Composite field: `docs/physics/12-composite-velocity-field.md`
- Storm motion diagnostic: `docs/physics/07-storm-relative-wind.md`
- Timestep philosophy / no project-wide `DEFAULT_DT`:
  `docs/physics/03-numerical-integration-basics.md`
- Hodograph UI composition today: `docs/ui/01-hodograph-panel.md` and
  related overlay docs under `docs/ui/`
- Current composite DEMO wiring / seeds / anti-oracle:
  `docs/rendering/08-composite-lower-radial-inflow-demo.md`
- Current DEMO environmental knots (`0–12000 m`):
  `docs/rendering/09-deep-environmental-profile-demo.md`
- Current DEMO storm-envelope bounds:
  `docs/rendering/10-deep-storm-envelope-scaling.md`
- Current DEMO rotation occupant / wiring (`storm.rotation`
  `baseHeight` / `topHeight`; `createRotationField` →
  `VerticalEnvelopeRotationField`):
  `docs/rendering/12-composite-vertical-envelope-rotation-demo.md`
- Completed five-operand DEMO with height-independent inflow (superseded
  for the current DEMO inflow occupant):
  `docs/rendering/07-composite-upper-radial-outflow-demo.md`
- Completed four-field DEMO with vertical-envelope updraft (superseded for
  current DEMO field):
  `docs/rendering/06-composite-vertical-envelope-updraft-demo.md`
- Completed four-field DEMO with height-independent updraft (superseded):
  `docs/rendering/05-composite-radial-inflow-demo.md`
- Completed env+updraft+rotation DEMO wiring (superseded for current DEMO
  field):
  `docs/rendering/04-composite-rotation-demo.md`
- Completed env+updraft DEMO wiring (superseded for current DEMO field/seeds):
  `docs/rendering/03-composite-updraft-demo.md`

When this document and code disagree, stop and resolve the contradiction
before extending scenario scope.

---

## 18. v1 lock-in summary

1. Live in `src/scenario/`.
2. `ScenarioConfig` is a JSON-serializable plain DTO, not a physics model.
3. Scenario-owned shapes: `ScenarioWindLevel`, `ScenarioStormMotion`,
   `ScenarioTracerSeed`, `ScenarioUpdraft`, `ScenarioRotation`,
   `ScenarioLowerRadialInflow`, `ScenarioUpperRadialOutflow`; no physics
   type-only imports into scenario DTOs.
4. Wind levels are flat `{ height, eastward, northward }`; factory inserts
   `vertical: 0`.
5. `storm.updraft`, `storm.rotation`, `storm.lowerRadialInflow`, and
   `storm.upperRadialOutflow` are required; `stormMotion` stays top-level.
   Shared DEMO centers are a fixture choice, not an API invariant.
   Isolated `RadialInflowField` is not a ScenarioConfig occupant.
6. `simulation = { timestep, tracerSeeds }` only.
7. Provide `createEnvironmentalWindProfile(config)`,
   `createUpdraftField(config)` → `VerticalEnvelopeUpdraftField`,
   `createRotationField(config)` → `VerticalEnvelopeRotationField`,
   `createLowerRadialInflowField(config)` → `LowerRadialInflowField`, and
   `createUpperRadialOutflowField(config)` → `UpperRadialOutflowField`;
   no runtime god-object; no composite inside scenario.
8. Do not duplicate profile / enveloped-updraft / enveloped-rotation /
   lower-radial-inflow / upper-radial-outflow physical validation;
   scenario validates storm motion, timestep, and tracer seeds.
9. Updates are plain object replacement + explicit rebuild.
10. One `DEMO_SCENARIO` constant; no preset framework.
11. Same config feeds hodograph (profile-only) and 3D tracer
    (env + vertical-envelope updraft + vertical-envelope rotation +
    lower radial inflow + upper radial outflow composite in app
    composition).

---

## 19. Historical scenario slices

The original scenario introduction slice (types, `DEMO_SCENARIO`,
`createEnvironmentalWindProfile`, hodograph rewiring) is complete.

The composite updraft demo extension — required `storm.updraft`,
`createUpdraftField`, DEMO seeds/params, and app
`CompositeVelocityField([env, updraft])` wiring — is complete and specified
in `docs/rendering/03-composite-updraft-demo.md`.

The current DEMO rotation extension — required `storm.rotation`,
`createRotationField`, axis/east/north seeds, and app
`CompositeVelocityField([env, updraft, rotation])` wiring — is complete
and specified in `docs/rendering/04-composite-rotation-demo.md`.

The current DEMO radial-inflow extension — required `storm.radialInflow`,
`createRadialInflowField`, kept axis/east/north seeds, and app
`CompositeVelocityField([env, updraft, rotation, radialInflow])` wiring
with height-independent `UpdraftField` — is complete and specified in
`docs/rendering/05-composite-radial-inflow-demo.md`.

The four-field vertical-envelope extension — required
`storm.updraft.baseHeight` / `topHeight`, `createUpdraftField` →
`VerticalEnvelopeUpdraftField`, kept axis/east/north seeds, and app
`CompositeVelocityField([env, envelopedUpdraft, rotation, radialInflow])`
wiring — is complete and specified in
`docs/rendering/06-composite-vertical-envelope-updraft-demo.md`.

The current DEMO upper radial-outflow extension — required
`storm.upperRadialOutflow`, `createUpperRadialOutflowField`, kept
axis/east/north seeds, and app
`CompositeVelocityField([env, envelopedUpdraft, rotation, radialInflow,
outflow])` wiring — is complete and specified in
`docs/rendering/07-composite-upper-radial-outflow-demo.md`.

The current DEMO lower radial-inflow replacement — required
`storm.lowerRadialInflow`, `createLowerRadialInflowField`, removal of
`storm.radialInflow` from the current ScenarioConfig surface, kept
axis/east/north seeds, and app
`CompositeVelocityField([env, envelopedUpdraft, rotation, lowerInflow,
outflow])` wiring — is complete and specified in
`docs/rendering/08-composite-lower-radial-inflow-demo.md`.

The current DEMO deep environmental profile — five wind knots
`0 / 1000 / 2000 / 6000 / 12000` m, then-unchanged `08` storm envelopes and
seeds, no global `topHeight` — is complete and specified in
`docs/rendering/09-deep-environmental-profile-demo.md`.

The current DEMO deep storm-envelope scaling — updraft `[0, 8000]`,
lower inflow plateau `≤ 1500` / zero `≥ 4500`, outflow `[5000, 9000]`,
kept seeds, strengths, `sigma`, and centers — is complete and specified
in `docs/rendering/10-deep-storm-envelope-scaling.md`.

The current DEMO rotation-occupant replacement — required
`storm.rotation.baseHeight` / `topHeight`, `createRotationField` →
`VerticalEnvelopeRotationField`, kept axis/east/north seeds, and app
`CompositeVelocityField([env, envelopedUpdraft, envelopedRotation,
lowerInflow, outflow])` wiring — is complete and specified in
`docs/rendering/12-composite-vertical-envelope-rotation-demo.md`.
