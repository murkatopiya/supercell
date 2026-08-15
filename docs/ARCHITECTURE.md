# Supercell Explorer — Architecture

> This document defines the architectural boundaries of Supercell Explorer.
>
> Its purpose is to keep atmospheric physics, numerical simulation,
> visualization, interaction, and data sources independent from each other as
> the project grows.

---

## 1. Architectural Goals

Supercell Explorer is expected to evolve from a small conceptual particle
laboratory into an interactive visualization of numerical atmospheric
simulation data.

The architecture must therefore support two very different stages:

1. simple synthetic atmospheric fields used for learning and validation;
2. large time-dependent atmospheric datasets produced by numerical models.

The visualization system should not need to know which type of data source is
currently being used.

The fundamental architectural principle is:

> **Physics defines the atmospheric state. Rendering observes it.**

Rendering must never create, modify, or correct physical behavior.

---

## 2. Core Separation

The project is divided conceptually into the following layers:

```text
┌───────────────────────────────────────────────┐
│                    UI                         │
│ controls, panels, probes, layer selection    │
├───────────────────────────────────────────────┤
│                 Interaction                   │
│ camera, selection, follow mode, navigation   │
├───────────────────────────────────────────────┤
│                  Rendering                    │
│ particles, fields, volumes, geometry         │
├───────────────────────────────────────────────┤
│                 Simulation                    │
│ particles, time, integration, trajectories   │
├───────────────────────────────────────────────┤
│              Atmospheric Fields               │
│ velocity, temperature, moisture, etc.        │
├───────────────────────────────────────────────┤
│                 Data Sources                  │
│ synthetic fields / future model datasets     │
└───────────────────────────────────────────────┘
```

Dependencies should primarily flow upward.

Lower layers must not depend on visualization or UI.

---

# 3. Coordinate System

The coordinate system must be defined once and remain consistent throughout
the project.

Supercell Explorer uses a right-handed local Cartesian coordinate system:

```text
X = East
Y = Up
Z = South
```

Therefore:

```text
+X → East
-X → West

+Y → Up
-Y → Down

+Z → South
-Z → North
```

This convention intentionally matches the default spatial orientation commonly
used by Three.js, where `Y` is the vertical axis.

All physics documentation must explicitly use this coordinate system.

Any imported atmospheric dataset using another convention must be transformed
at the data-adapter boundary.

Rendering code must never reinterpret atmospheric coordinates independently.

---

## 4. Units

All physical calculations use SI units internally.

```text
distance        meters (m)
time            seconds (s)
velocity        meters per second (m/s)
acceleration    meters per second squared (m/s²)
temperature     kelvin (K)
pressure        pascals (Pa)
density         kilograms per cubic meter (kg/m³)
```

User interfaces may display convenient derived units:

```text
meters → kilometers
kelvin → degrees Celsius
pascals → hectopascals
```

Conversions for presentation must occur outside the physical model.

No physical field may silently use display units internally.

---

# 5. Simulation Space

The conceptual supercell exists inside a finite simulation domain.

Exact dimensions are not fixed by this architecture document and may evolve.

A typical future domain may resemble:

```text
horizontal scale: tens of kilometers
vertical scale:   approximately 15–20 km
```

The simulation must treat these as real physical distances.

The renderer may apply a visual world scale if technically necessary, but such
scaling must occur through a single explicit transformation.

Physics must never be calculated in arbitrary "scene units".

---

# 6. Simulation Time

Simulation time is independent from rendering time.

The application maintains a simulation clock:

```ts
interface SimulationClock {
  time: number;       // seconds
  timeScale: number;
  paused: boolean;
}
```

The simulation must not assume:

```text
one rendered frame = one simulation step
```

Frame rate and physical time are different concepts.

A slow or fast rendering device must not fundamentally change the simulated
trajectory of a particle.

---

## 7. Fixed Simulation Timestep

Early conceptual models should use a fixed numerical simulation timestep.

Example:

```text
simulation dt = fixed value
render dt     = variable
```

If a rendered frame takes longer than one simulation step, the simulation may
perform multiple steps before rendering.

This provides:

- deterministic behavior;
- reproducible tests;
- stable numerical integration;
- independence from display refresh rate.

The exact timestep will be selected and validated during implementation.

It must not be chosen solely because it "looks smooth".

---

# 8. Atmospheric State

Atmospheric quantities are represented as fields defined over space and,
where appropriate, time.

Conceptually:

```text
F(position, time) → value
```

Different fields return different values.

Examples:

```text
VelocityField      → Vector3
TemperatureField   → scalar
PressureField      → scalar
MoistureField      → scalar
VorticityField     → Vector3
```

The renderer does not own these fields.

The simulation does not assume how they are visualized.

---

# 9. Velocity Field

The velocity field is the central abstraction of the first development stages.

```ts
interface VelocityField {
  sample(position: Vec3, time: number): Vec3;
}
```

Given:

```text
position = (x, y, z)
time     = t
```

the field returns:

```text
velocity = (x, y, z)
```

expressed in meters per second in the project's coordinate system.

For this project:

```text
velocity.x = velocity along X (East/West)
velocity.y = velocity along Y (Up/Down)
velocity.z = velocity along Z (North/South)
```

Note:

Atmospheric literature frequently uses meteorological components
`(u, v, w)` where:

```text
u = eastward
v = northward
w = vertical
```

These do not match world-space `(x, y, z)` component-wise.

The explicit mapping is:

```text
(u, v, w) → (x, y, z) = (u, w, -v)
```

Internal code must not use `u`, `v`, or `w` as names for world-space
velocity components.

Prefer either world-space names:

```ts
velocity.x
velocity.y
velocity.z
```

or semantic atmospheric names:

```ts
eastward
northward
vertical
```

Documentation dealing with meteorological equations must explicitly map
meteorological `(u, v, w)` into the project coordinate system.

This mapping must never remain implicit.

---

# 10. Field Composition

Synthetic atmospheric behavior should be built from independently testable
fields.

Conceptually:

```text
V_total =
    V_environment
  + V_inflow
  + V_updraft
  + V_rotation
  + V_upper_divergence
  + V_downdraft
  + ...
```

However, simple vector addition is not assumed to be physically correct for
every future mechanism.

Each field composition must be justified in the corresponding physics
documentation.

The architecture merely allows fields to be composed.

It does not declare every composition physically valid.

Example abstraction:

```ts
class CompositeVelocityField implements VelocityField {
  constructor(private readonly fields: VelocityField[]) {}

  sample(position: Vec3, time: number): Vec3 {
    // Sum or otherwise combine explicitly defined component fields.
  }
}
```

Every component must be individually switchable in development/debug mode.

---

# 11. Synthetic Fields

Early versions use synthetic fields.

Examples:

```text
ConstantVelocityField
InflowField
UpdraftField
RotationField
UpperDivergenceField
DowndraftField
```

Synthetic fields exist to isolate and understand mechanisms.

They are not intended to reproduce the full governing equations of the
atmosphere.

Each synthetic field requires its own physics specification describing:

- physical meaning;
- mathematical definition;
- parameters;
- valid spatial region;
- assumptions;
- known limitations;
- expected behavior;
- validation criteria.

Cursor or any other coding assistant must never invent these definitions from
the class name alone.

---

# 12. Future Dataset Fields

Later versions may use atmospheric simulation datasets.

The same interface should remain usable:

```ts
class DatasetVelocityField implements VelocityField {
  sample(position: Vec3, time: number): Vec3 {
    // Interpolate numerical model data.
  }
}
```

The implementation may internally require:

- spatial interpolation;
- temporal interpolation;
- chunk loading;
- caching;
- coordinate conversion;
- GPU storage.

These details must not leak into particle behavior or rendering logic.

From the perspective of a particle:

> "What is the velocity here, now?"

Whether the answer comes from an analytical function or a numerical model
dataset is irrelevant.

---

# 13. Particles

Tracer particles are massless visualization/sampling entities.

A tracer does not influence the atmospheric field.

It is transported by the field.

Minimal conceptual state:

```ts
interface TracerParticle {
  position: Vec3;
  age: number;
  active: boolean;
}
```

A tracer's velocity is obtained from the atmospheric velocity field.

The particle must not contain independent atmospheric behavior such as:

```text
random lift
random rotation
visual attraction to the storm
decorative turbulence
```

unless such behavior is explicitly defined by the physical model.

Tracer particles must never move merely because an animation looks better.

---

# 14. Particle Advection

Particle motion is calculated numerically from the velocity field.

Conceptually:

```text
dx/dt = V(x, t)
```

The numerical integrator is a separate abstraction.

```ts
interface Integrator {
  step(
    position: Vec3,
    time: number,
    dt: number,
    field: VelocityField
  ): Vec3;
}
```

Possible implementations may include:

```text
EulerIntegrator
RK2Integrator
RK4Integrator
```

The initial integrator must be chosen through validation rather than visual
preference.

The integrator must be independently testable against fields with known
analytical solutions.

---

# 15. Physics Invariants

Each atmospheric component should define properties that must remain true.

Examples:

### Constant velocity field

Expected:

```text
straight trajectory
constant speed
analytically predictable position
```

### Pure vertical field

Expected:

```text
horizontal coordinates remain unchanged
only altitude changes
```

### Pure axisymmetric rotation

Expected:

```text
altitude remains unchanged
radius from rotation axis remains approximately constant
rotation direction is known
```

These invariants should become automated tests wherever practical.

A visually plausible result is not sufficient validation.

---

# 16. Simulation Engine

The simulation engine owns:

- simulation time;
- tracer state;
- numerical integration;
- particle lifecycle;
- field sampling.

Conceptually:

```ts
class Simulation {
  clock: SimulationClock;
  velocityField: VelocityField;
  integrator: Integrator;
  particles: TracerParticle[];

  step(dt: number): void;
}
```

The simulation engine must not know:

- particle color;
- camera position;
- UI state;
- Three.js materials;
- shaders;
- screen resolution.

---

# 17. Rendering

Rendering converts simulation state into visible representations.

The renderer may visualize:

- tracer particles;
- trajectories;
- streamlines;
- vector glyphs;
- volumetric scalar fields;
- cloud volumes;
- precipitation;
- spatial reference grids.

Rendering must treat simulation state as read-only.

This is a strict architectural boundary.

The following pattern is forbidden:

```text
particle looks wrong
→ renderer changes particle.position
```

If a physical trajectory appears wrong, the problem must be investigated in
the field, integrator, timestep, or physical model.

---

# 18. Rendering Technology Boundary

The rendering implementation may initially use Three.js and WebGPU/WebGL.

However, atmospheric and simulation code must not depend directly on Three.js
types.

Avoid:

```ts
interface VelocityField {
  sample(position: THREE.Vector3): THREE.Vector3;
}
```

Prefer project-owned mathematical primitives:

```ts
interface Vec3 {
  x: number;
  y: number;
  z: number;
}
```

Adapters may convert between:

```text
physics Vec3 ↔ renderer Vector3
```

This keeps the physical model portable and independently testable.

---

# 19. CPU and GPU Responsibilities

Early versions should prioritize correctness and observability over maximum
performance.

Initial physical calculations may run on the CPU.

This allows:

- straightforward debugging;
- deterministic tests;
- inspection of intermediate values;
- easy comparison with analytical expectations.

GPU acceleration should be introduced only after behavior is validated.

Potential future GPU responsibilities include:

- large-scale particle advection;
- particle rendering;
- volume rendering;
- streamline computation;
- field sampling;
- compute shaders.

A CPU reference implementation should remain available where practical for
validation.

---

# 20. Streamlines vs Pathlines

The architecture must distinguish between different representations of flow.

### Tracer trajectory / pathline

Shows the path of a moving parcel through a potentially time-dependent field.

### Streamline

Shows a curve tangent to the instantaneous velocity field at a specific time.

These concepts must not be treated as interchangeable.

In a steady field they may coincide.

In a time-dependent storm they generally do not.

The UI and documentation must use correct terminology.

---

# 21. Derived Fields

Some quantities may be derived from primary atmospheric fields.

Example:

```text
velocity field → vorticity field
```

Derived fields must be implemented outside rendering.

Conceptually:

```ts
interface DerivedField<T> {
  sample(position: Vec3, time: number): T;
}
```

The renderer receives the resulting physical quantity and decides only how to
encode it visually.

For example:

```text
physics:
velocity → curl → vorticity vector

rendering:
vorticity vector → ribbon / glyph / volume / other encoding
```

Rendering must never calculate a decorative substitute for vorticity.

---

# 22. Scalar Fields

Scalar atmospheric quantities should share a common conceptual interface:

```ts
interface ScalarField {
  sample(position: Vec3, time: number): number;
}
```

Examples:

```text
TemperatureField
PressureField
RelativeHumidityField
CloudWaterField
RainWaterField
```

Metadata such as physical units and valid ranges may later be associated with
field definitions.

---

# 23. Probes

A probe samples atmospheric state at a selected location.

Conceptually:

```ts
interface ProbeResult {
  position: Vec3;
  time: number;

  velocity?: Vec3;
  temperature?: number;
  pressure?: number;
  relativeHumidity?: number;
  vorticity?: Vec3;
}
```

Probes are consumers of physical fields.

They must use the same underlying data as particles and visual layers.

The number shown in the UI and the state represented visually must therefore
refer to the same atmospheric model.

---

# 24. Camera

The camera belongs to the interaction/rendering domain.

Possible camera modes include:

```text
Free
Orbit
FollowTracer
Journey
```

Camera movement must not affect simulation physics.

In Follow mode, the camera observes a tracer.

It does not control or pull the tracer.

---

# 25. Layer System

Visual representations should be implemented as independent layers.

Possible future layers:

```text
GroundLayer
TracerLayer
StreamlineLayer
VelocityGlyphLayer
VerticalVelocityLayer
VorticityLayer
TemperatureLayer
MoistureLayer
CloudLayer
PrecipitationLayer
```

Each layer:

- consumes atmospheric/simulation state;
- controls only its own visual representation;
- may be enabled or disabled;
- may expose visualization parameters such as opacity;
- must not alter physical state.

---

# 26. Data Flow

The intended data flow is:

```text
Atmospheric Model / Dataset
            │
            ▼
       Physical Fields
            │
      ┌─────┴─────┐
      ▼           ▼
 Simulation     Derived Fields
      │           │
      └─────┬─────┘
            ▼
        Rendering
            │
            ▼
           User
```

User interaction may change:

- camera;
- visible layers;
- visualization parameters;
- simulation time;
- tracer seeding;
- model parameters explicitly exposed for experimentation.

Visual state must never implicitly feed back into atmospheric physics.

---

# 27. Determinism

Where no explicitly stochastic physical model is enabled, simulation behavior
should be deterministic.

Given:

```text
same initial state
same physical parameters
same timestep
same integrator
same simulation duration
```

the result should be reproducible.

This is essential for debugging and validation.

Randomness must never be introduced merely to make airflow appear more
"natural".

---

# 28. Debug Mode

A dedicated development/debug mode should exist from early versions.

It may expose:

- simulation timestep;
- simulation time;
- active velocity components;
- particle count;
- particle coordinates;
- sampled velocity;
- field contribution by component;
- integrator type;
- FPS;
- simulation step duration.

For a composite field, it should eventually be possible to inspect:

```text
V_environment
V_inflow
V_updraft
V_rotation
...
----------------
V_total
```

at a selected point.

This is essential for understanding why a particle moves as it does.

---

# 29. Scientific Validation Boundary

Code correctness and physical correctness are different problems.

Automated tests can verify:

- mathematical implementation;
- coordinate transformations;
- numerical integration;
- invariants;
- reproducibility.

They cannot alone prove that a conceptual atmospheric model accurately
represents a real supercell.

Every physical mechanism therefore requires:

1. a documented physical explanation;
2. a documented mathematical representation;
3. explicit assumptions and simplifications;
4. numerical/code validation;
5. scientific review against reliable references.

No mechanism is considered scientifically validated merely because its unit
tests pass.

---

# 30. Documentation as Part of Architecture

Documentation is part of the project's state.

The repository should eventually contain:

```text
docs/
├── CONCEPT.md
├── ARCHITECTURE.md
├── PHYSICS.md
├── ROADMAP.md
│
├── physics/
│   ├── 00-coordinate-system.md
│   ├── 01-parcel-basics.md
│   ├── 02-inflow.md
│   ├── 03-buoyancy-updraft.md
│   ├── 04-wind-shear.md
│   ├── 05-vorticity.md
│   ├── 06-tilting.md
│   ├── 07-stretching.md
│   └── ...
│
├── decisions/
│   └── ADR-xxx-*.md
│
└── validation/
    └── ...
```

Important architectural or physical decisions must be documented.

Undocumented historical decisions must not later be reconstructed from memory
and presented as facts.

---

# 31. Decision Records

Architecture Decision Records (ADRs) should be used for decisions that would
be expensive or confusing to reverse later.

Examples:

```text
ADR-001 Coordinate System
ADR-002 Internal Units
ADR-003 Simulation Timestep Strategy
ADR-004 Mathematical Vector Types
ADR-005 Rendering Backend
ADR-006 Dataset Coordinate Mapping
```

Each ADR should describe:

```text
Context
Decision
Reason
Consequences
Alternatives considered
```

---

# 32. Cursor / AI Coding Boundary

AI coding tools are implementation assistants.

They are not authoritative sources of atmospheric physics.

Cursor may:

- implement a documented equation;
- write tests for documented invariants;
- refactor code within architectural boundaries;
- implement rendering;
- implement UI;
- optimize validated behavior.

Cursor must not independently:

- invent atmospheric equations;
- invent coefficients;
- add undocumented forces;
- add random turbulence for appearance;
- change coordinate conventions;
- change physical units;
- combine atmospheric mechanisms without specification;
- implement future roadmap features without explicit instruction;
- modify physical behavior to improve visuals.

If required physical behavior is not documented, implementation must stop until
the specification exists.

---

# 33. Proposed Source Structure

The initial codebase may evolve toward:

```text
src/
├── core/
│   ├── math/
│   │   └── Vec3.ts
│   │
│   ├── fields/
│   │   ├── VelocityField.ts
│   │   ├── ScalarField.ts
│   │   └── CompositeVelocityField.ts
│   │
│   └── integrators/
│       ├── Integrator.ts
│       ├── EulerIntegrator.ts
│       └── RK4Integrator.ts
│
├── physics/
│   └── synthetic/
│       └── ...
│
├── simulation/
│   ├── Simulation.ts
│   ├── SimulationClock.ts
│   ├── TracerParticle.ts
│   └── ParticleSystem.ts
│
├── rendering/
│   ├── Renderer.ts
│   ├── adapters/
│   └── layers/
│
├── interaction/
│   ├── camera/
│   └── probes/
│
├── data/
│   ├── synthetic/
│   └── datasets/
│
├── ui/
│   └── ...
│
└── app/
    └── ...
```

This is a proposed direction, not an immutable folder structure.

Architectural boundaries matter more than exact directory names.

---

# 34. Dependency Rules

The following dependencies are allowed conceptually:

```text
physics      → core
simulation   → core, physics
data         → core
rendering    → core, simulation, data
interaction  → core, simulation, rendering
ui           → interaction, simulation, rendering
app          → everything required for composition
```

The following are forbidden:

```text
physics      → rendering
physics      → UI
simulation   → UI
simulation   → Three.js
core         → application-specific rendering
```

Circular dependencies between physical and visual systems must not be
introduced.

---

# 35. Performance Philosophy

Performance matters because future versions may contain very large particle
counts and volumetric fields.

However:

> **Correctness before optimization.**

The development order should be:

```text
correct
→ testable
→ understandable
→ measurable
→ optimized
```

Never:

```text
GPU magic
→ beautiful result
→ nobody knows whether it is correct
```

Performance optimizations that change numerical behavior require validation.

---

# 36. Architecture Success Criteria

The architecture is successful if the following remains possible throughout
the project's evolution:

### Replace the atmospheric source

```text
SyntheticVelocityField
        ↓
CM1 / WRF / other dataset
```

without rewriting the renderer.

### Replace the renderer

```text
current rendering implementation
        ↓
future rendering implementation
```

without rewriting atmospheric physics.

### Test physics without graphics

Atmospheric fields and particle trajectories can be executed and validated in
a headless test environment.

### Visualize fields without particles

Physical fields can be sampled independently by probes, streamlines, volumes,
or other representations.

### Inspect individual mechanisms

Synthetic field components can be enabled, disabled, and validated separately.

### Explain every motion

For a selected tracer and timestep, the system can ultimately answer:

> **Why is this particle moving in this direction at this speed?**

The answer must come from inspectable atmospheric field contributions, not from
hidden animation logic.

---

# 37. Final Architectural Principle

When a particle moves through Supercell Explorer, there should always be a
traceable chain:

```text
physical idea
    ↓
documented model
    ↓
mathematical field
    ↓
numerical sampling
    ↓
integration
    ↓
particle position
    ↓
visual representation
```

If any link in this chain cannot be explained, the implementation is not
finished.