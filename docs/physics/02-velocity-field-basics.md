# Supercell Explorer — Velocity Field Basics

> This document defines the conceptual and mathematical meaning of an
> atmospheric velocity field in Supercell Explorer.
>
> It establishes how atmospheric motion exists independently of tracer
> particles and how tracers sample that motion.

---

## 1. Why This Document Exists

Before implementing inflow, updrafts, rotation, wind shear, or any other
supercell-specific mechanism, the project must define what a velocity field is.

A tracer particle does not decide where to move.

The atmosphere defines a velocity at the tracer's location.

The tracer samples that velocity and is transported by it.

The fundamental relationship is therefore:

    atmosphere defines motion
             ↓
       velocity field
             ↓
           tracer

This distinction is central to the entire architecture.

---

## 2. Velocity Is a Field

A velocity field assigns a velocity vector to every valid location in the
atmospheric domain.

For a time-dependent atmosphere, the velocity may also depend on time.

Conceptually:

    V(x, y, z, t) → velocity vector

or:

    V(position, time) → velocity

The returned vector tells us:

> If an ideal passive tracer were located here at this instant, in what
> direction and at what speed would the local air carry it?

---

## 3. Velocity Is Not Position

Position and velocity are different quantities.

Position describes:

    where something is

Velocity describes:

    how its position is changing

In world coordinates:

    position = (x, y, z)

    velocity = (Vx, Vy, Vz)

Units:

    position → meters
    velocity → meters per second

A velocity vector is not another location in the scene.

It is a rate of spatial change.

---

## 4. Canonical World Components

Supercell Explorer uses:

    X = East
    Y = Up
    Z = South

Therefore a world-space velocity vector:

    V = (Vx, Vy, Vz)

means:

    Vx > 0 → eastward motion
    Vx < 0 → westward motion

    Vy > 0 → upward motion
    Vy < 0 → downward motion

    Vz > 0 → southward motion
    Vz < 0 → northward motion

All internal velocity-field outputs must use this canonical coordinate system.

---

## 5. Meteorological Velocity Components

Atmospheric science commonly uses:

    u = eastward velocity
    v = northward velocity
    w = vertical velocity

As defined in `00-coordinate-system.md`, the mapping is:

    world.x = u
    world.y = w
    world.z = -v

Therefore meteorological notation and project-world notation must never be
mixed implicitly.

---

## 6. Velocity Field Interface

The conceptual application interface is:

    interface VelocityField {
      sample(position: Vec3, time: number): Vec3;
    }

The field receives:

    position in meters
    simulation time in seconds

and returns:

    local atmospheric velocity in meters per second

in canonical world coordinates.

---

## 7. The Field Exists Without Tracers

The atmospheric velocity field exists conceptually throughout the domain even
if no tracers are currently visible.

This is important.

The project must never treat particles as the source of atmospheric motion.

Particles merely reveal selected portions of an already-defined field.

For example, if all tracers are removed:

    VelocityField still exists.

If ten thousand new tracers are added:

    VelocityField does not change.

---

## 8. A Tracer Samples the Field

Suppose a tracer is at:

    position P

at time:

    t

The tracer asks:

    V = VelocityField.sample(P, t)

Suppose the result is:

    V = (10, 5, -2) m/s

This means the local air velocity is:

    10 m/s eastward
     5 m/s upward
     2 m/s northward

The tracer does not immediately jump:

    10 meters east
    5 meters up
    2 meters north

because velocity is a rate.

Its displacement depends on the amount of elapsed time.

---

## 9. Velocity and Timestep

For a sufficiently small timestep `dt`, a simple first approximation is:

    displacement ≈ velocity × dt

Therefore:

    newPosition ≈ oldPosition + velocity × dt

Example:

    velocity = 10 m/s eastward
    dt       = 0.1 s

Approximate displacement:

    1 m eastward

This is the basic idea behind Euler integration.

More accurate integration methods will be introduced separately.

---

## 10. Why the Field Must Be Sampled Repeatedly

In a non-uniform velocity field, velocity changes with position.

Suppose:

    at P1 → velocity = (10, 0, 0)

After the tracer moves, it reaches:

    P2

The velocity there may be:

    at P2 → velocity = (8, 3, -1)

Therefore the tracer must sample the field again.

Its trajectory emerges from repeatedly asking:

> What is the velocity here now?

This repeated local sampling produces curved and complex trajectories.

---

## 11. Spatially Uniform Field

The simplest possible velocity field is constant everywhere.

Example:

    V(x, y, z, t) = (10, 0, 0)

for every position and time.

Every tracer moves eastward at 10 m/s.

The field has:

- no spatial variation;
- no temporal variation;
- no shear;
- no convergence;
- no rotation.

This should be the first velocity field implemented in the project.

---

## 12. Spatially Varying Field

A velocity field may depend on position.

Example conceptual field:

    Vx = kx
    Vy = 0
    Vz = 0

Now local velocity changes with X position.

Two tracers at different locations may move at different speeds even at the
same time.

This introduces an important idea:

> Nearby parcels can experience different velocities.

Spatial variation in velocity is fundamental to:

- shear;
- convergence;
- divergence;
- deformation;
- rotation.

---

## 13. Time-Independent Field

A field that does not explicitly change with time is called steady or
time-independent.

Conceptually:

    V = V(x, y, z)

not:

    V = V(x, y, z, t)

The flow may still look dynamic because particles move through it.

The field itself, however, remains unchanged.

Early synthetic models should prefer steady fields where possible because they
are easier to understand and validate.

---

## 14. Time-Dependent Field

A time-dependent field changes even at a fixed point in space.

Conceptually:

    V = V(x, y, z, t)

For example, at one fixed location:

    t = 0 s   → V = (5, 0, 0)
    t = 30 s  → V = (10, 2, 0)
    t = 60 s  → V = (2, -1, 4)

Real supercells are strongly time-dependent systems.

However, time dependence introduces substantial complexity.

It should not be added to early synthetic fields without a specific learning
or physical reason.

---

## 15. Eulerian View of the Velocity Field

The Eulerian perspective asks:

> What is the atmospheric velocity at this fixed location as time changes?

Choose a fixed point:

    P = constant

Then inspect:

    V(P, t)

The observer remains stationary.

Air moves through the observation point.

Examples of Eulerian tools include:

- fixed probes;
- velocity glyph grids;
- instantaneous streamlines;
- vertical cross-sections.

---

## 16. Lagrangian View of the Velocity Field

The Lagrangian perspective follows a moving material element or tracer.

Its position changes:

    P = P(t)

The local velocity encountered by the moving tracer is:

    V(P(t), t)

The tracer trajectory satisfies:

    dP/dt = V(P(t), t)

This is the mathematical foundation of passive tracer advection.

The observer may conceptually travel with the parcel.

---

## 17. Eulerian vs Lagrangian Example

Imagine a river.

### Eulerian

Stand on a bridge.

Measure water velocity at one fixed point.

You ask:

> How fast is the water passing here?

### Lagrangian

Drop a floating marker into the river and follow it.

You ask:

> Where does this piece of water travel?

Supercell Explorer uses both perspectives.

A probe is naturally Eulerian.

A followed tracer is naturally Lagrangian.

---

## 18. Important Terminology Note: Lagrangian

The term `Lagrangian` in fluid dynamics does not necessarily mean that the
project is using the classical mechanics Lagrangian:

    L = T - V

In this context, `Lagrangian` primarily describes a reference perspective that
moves with a material element.

This must not be confused with Lagrangian mechanics or variational methods.

---

## 19. Field Visualization

A velocity field is invisible.

The project therefore requires visual encodings.

Possible encodings include:

- tracer particles;
- arrows / vector glyphs;
- streamlines;
- pathlines;
- streaklines;
- ribbons;
- animated textures;
- local probes.

No single representation completely describes the field.

Different representations reveal different properties.

---

## 20. Vector Glyphs

A vector glyph is an arrow placed at a sampled location.

Its direction represents velocity direction.

Its size may represent speed.

Conceptually:

    point P
       ↓
    sample V(P)
       ↓
    draw arrow

A regular grid of arrows can reveal the structure of a field.

However, dense 3D glyph fields can quickly become visually cluttered.

They are especially useful in debug and educational modes.

---

## 21. Tracer Particles

Tracer particles reveal transport.

A collection of particles moving through the field allows the user to see:

- direction;
- relative speed;
- convergence;
- divergence;
- coherent motion;
- approximate flow structure.

However, particle distribution also depends on seeding strategy.

Particles must therefore not be interpreted as a complete direct
representation of the velocity field.

---

## 22. Streamlines

A streamline is tangent to the velocity field everywhere along its length at
one instant.

Mathematically, its local tangent direction follows:

    dr/ds ∥ V(r, t_fixed)

where:

    r = position along the curve
    s = curve parameter
    t_fixed = selected instant

A streamline visualizes instantaneous flow geometry.

It does not automatically show actual parcel history.

---

## 23. Speed

The velocity vector has both:

- direction;
- magnitude.

Its magnitude is speed:

    speed = |V|

For:

    V = (Vx, Vy, Vz)

the speed is:

    |V| = sqrt(Vx² + Vy² + Vz²)

Speed is a scalar.

Velocity is a vector.

The two terms must not be used interchangeably in scientific documentation.

---

## 24. Example Speed Calculation

Suppose:

    V = (3, 4, 0) m/s

Then:

    speed = sqrt(3² + 4²)
          = 5 m/s

The direction still depends on the vector components.

Knowing only:

    speed = 5 m/s

does not tell us where the air is moving.

---

## 25. Local Field Sampling

A field probe should eventually be able to show:

    position
    time
    velocity vector
    speed

Example:

    Position:
      East:      2.5 km
      North:     1.2 km
      Altitude:  800 m

    Velocity:
      Eastward:   8.2 m/s
      Northward:  4.1 m/s
      Vertical:  12.5 m/s

    Speed:
      15.5 m/s

Such values must come from the same field used for tracer integration.

---

## 26. Field Gradients

A velocity field becomes dynamically interesting when velocity changes across
space.

Informally:

    nearby location
        ↓
    different velocity

The mathematical description of spatial change involves velocity gradients.

These gradients eventually allow us to reason about:

- divergence;
- shear;
- rotation;
- deformation;
- stretching.

The full velocity-gradient tensor is beyond the scope of this introductory
document but will become important later.

---

## 27. Why Two Nearby Tracers Can Separate

Suppose two tracers begin very close together.

If the local velocity field is identical at both positions, they may remain
close.

If the velocity differs slightly across their positions, they may:

- separate;
- converge;
- rotate around each other;
- stretch into a line;
- deform as a group.

This behavior does not require any force between the tracers.

It emerges from spatial differences in the atmospheric velocity field.

---

## 28. Convergence

A conceptual converging field directs nearby flow toward a region.

Particles seeded across that region may move closer together.

However, in a physically meaningful three-dimensional atmosphere, horizontal
convergence is related to compensating motion elsewhere, such as vertical
motion, depending on density and continuity constraints.

Therefore:

> visually converging particles are not sufficient evidence of a physically
> correct inflow model.

Continuity must be considered when inflow is designed.

---

## 29. Divergence

A diverging field directs flow away from a region.

For example, future upper-level outflow may visually show air spreading
outward after rising through the storm.

Again, divergence is not merely a particle effect.

It is a property of the velocity field.

---

## 30. Shear

Velocity shear means velocity changes across space.

Example:

    lower level → wind 5 m/s east
    upper level → wind 20 m/s east

or:

    lower level → south wind
    upper level → west wind

Both speed shear and directional shear are possible.

Vertical wind shear will later become essential to supercell organization.

This document does not yet define a supercell wind-shear profile.

---

## 31. Rotation

A velocity field may contain local rotational structure.

Particles may move along curved or circular trajectories.

However:

> curved trajectories alone do not prove local fluid rotation.

A parcel can follow a curved path through a field without the fluid element
itself rotating in the same sense.

The precise distinction requires vorticity and velocity gradients and will be
defined in later documents.

This is an important warning for visual interpretation.

---

## 32. Field Composition

Synthetic velocity fields may eventually be composed from simpler components.

Conceptually:

    V_total =
        V_background
      + V_inflow
      + V_updraft
      + V_rotation
      + ...

But composition by simple addition must not be assumed physically valid merely
because vector addition is mathematically possible.

Each component and its combination require documented justification.

The purpose of composition is modular understanding, not arbitrary layering.

---

## 33. Background Environmental Wind

A future synthetic storm may exist within a larger environmental wind field.

Conceptually:

    V_total = V_environment + V_storm

This distinction may become important when discussing:

- storm motion;
- storm-relative wind;
- inflow;
- vertical wind shear.

No specific environmental wind profile is defined yet.

---

## 34. Storm-Relative Flow

The velocity seen in a coordinate system moving with the storm can differ from
ground-relative velocity.

Conceptually:

    V_storm_relative =
        V_ground_relative - V_storm_motion

This will become important later.

For now, the project must simply preserve the distinction and avoid silently
mixing the two frames of reference.

---

## 35. Field Domain

A velocity field is only valid inside a defined spatial domain.

Conceptually:

    xmin ≤ x ≤ xmax
    ymin ≤ y ≤ ymax
    zmin ≤ z ≤ zmax

Sampling outside the valid domain must follow an explicit policy.

Possible responses include:

- return no value;
- mark the tracer inactive;
- apply a documented boundary condition.

The field must not silently return arbitrary zero velocity outside its domain
unless this behavior is intentionally specified.

---

## 36. Field Continuity

Early synthetic velocity fields should generally be continuous wherever
possible.

Abrupt discontinuities such as:

    velocity = 0 here
    velocity = 50 m/s one millimeter away

can create:

- unrealistic trajectories;
- numerical instability;
- difficult debugging;
- misleading visual artifacts.

If a physical boundary requires a discontinuity or sharp transition, it must
be documented explicitly.

---

## 37. Smooth Transitions

Synthetic fields will often require spatial weighting functions.

For example, an updraft may be strongest near its core and gradually weaken
with horizontal distance.

Conceptually:

    strength = f(distance_from_core)

where `f` varies smoothly.

Exact weighting functions must be defined in the relevant physics document.

Cursor must not invent them based on visual preference.

---

## 38. Numerical Sampling

For analytical synthetic fields, sampling may directly evaluate a formula.

Example:

    velocity = function(position, time)

For numerical datasets, sampling may require interpolation between grid cells.

Therefore `VelocityField.sample()` is a conceptual abstraction.

Its implementation may later involve very different numerical methods.

---

## 39. Analytical Field

An analytical synthetic field is defined by an explicit mathematical
expression.

Example:

    V(x, y, z) = constant

or a future documented radial field.

Advantages include:

- exact definition;
- predictable behavior;
- easy unit testing;
- known analytical expectations.

These fields are ideal for early project stages.

---

## 40. Dataset Field

A numerical atmospheric model provides velocity values at discrete grid
locations and times.

The application may need to estimate velocity at arbitrary tracer positions.

Conceptually:

    model grid
        ↓
    interpolation
        ↓
    V(position, time)

Dataset interpolation must eventually be documented and validated separately.

---

## 41. Field Resolution

A numerical dataset has finite spatial and temporal resolution.

Therefore it cannot represent arbitrarily small structures.

The renderer must not imply physical detail finer than the available field
resolution.

Increasing particle count does not increase atmospheric data resolution.

This distinction is important.

---

## 42. Tracer Density vs Field Resolution

For example:

    model grid spacing = 250 m

and:

    tracer spacing = 5 m

does not mean the atmospheric model suddenly has 5-meter resolution.

The tracers are simply sampling an interpolated representation of the same
underlying 250-meter field.

Visualization density and physical resolution are separate concepts.

---

## 43. Time Resolution

Likewise, a numerical atmospheric dataset may contain fields only at discrete
times.

Example:

    t0
    t1
    t2
    t3

Sampling between those times may require temporal interpolation.

The simulation timestep may be much smaller than the dataset output interval.

These are separate quantities:

    simulation integration dt
    dataset temporal spacing

They must not be confused.

---

## 44. Field Inspector

A future debug tool should allow selecting a point and displaying:

    position
    time

    Vx
    Vy
    Vz

    speed

and, for composite fields:

    V_environment
    V_inflow
    V_updraft
    V_rotation
    ...
    V_total

This inspector will be critical when multiple mechanisms are eventually
combined.

---

## 45. Visual Arrow Test

Before moving particles through any new synthetic field, a useful validation
step is to visualize sampled velocity vectors on a sparse grid.

Example:

    ↑   ↑   ↑
    ↗   ↑   ↖
    →   •   ←
    ↘   ↓   ↙

This allows field structure to be inspected without numerical integration.

If the arrows themselves are wrong, particle trajectories cannot be trusted.

---

## 46. Development Rule: Field Before Particles

For every new synthetic velocity mechanism:

1. define the physical idea;
2. define the mathematical field;
3. test field sampling numerically;
4. visualize sparse vector glyphs;
5. verify directions and magnitudes;
6. only then release tracer particles into it.

This prevents particle animation from hiding errors in the field definition.

---

## 47. Development Rule: One Field at a Time

New mechanisms should initially be tested in isolation.

Example sequence:

    ConstantVelocityField
            ↓
    isolated InflowField
            ↓
    isolated UpdraftField
            ↓
    isolated RotationField
            ↓
    documented combinations

Do not begin by implementing a complete supercell velocity field.

---

## 48. First Velocity Field

The first production field should be intentionally trivial:

    ConstantVelocityField

Example:

    eastward = 10 m/s
    northward = 0
    vertical = 0

Every position returns the same velocity.

This validates:

- coordinate mapping;
- velocity units;
- field interface;
- tracer integration;
- simulation clock;
- rendering.

---

## 49. Constant Field Acceptance Test

Given:

    V = (10, 0, 0) m/s

and tracer initial position:

    P0 = (0, 1000, 0) m

after 10 simulated seconds:

    expected P ≈ (100, 1000, 0) m

The result should be predictable within numerical tolerance.

---

## 50. Second Velocity Field

The next isolated experiment may use a pure vertical field:

    V = (0, 5, 0) m/s

A tracer at:

    altitude = 1000 m

should reach approximately:

    altitude = 1100 m

after:

    20 s

while horizontal coordinates remain unchanged.

This experiment validates the canonical vertical direction.

---

## 51. Third Conceptual Experiment

Before implementing storm inflow, the project may use a simple spatially
varying field for learning.

For example, a field whose speed changes smoothly with one coordinate.

The purpose would be to observe:

- different velocities at nearby points;
- trajectory separation;
- field sampling;
- differences between field geometry and particle history.

This field need not represent a real atmospheric mechanism.

It must be clearly identified as a mathematical learning field.

---

## 52. First Learning Objective

Before implementing inflow, the project owner should be able to explain in
their own words:

1. What does `V(x, y, z, t)` mean?
2. Why does the velocity field exist even if no tracers are rendered?
3. Why must a moving tracer repeatedly sample the field?
4. What is the difference between position and velocity?
5. What is the difference between velocity and speed?
6. What is a steady velocity field?
7. What is a time-dependent velocity field?
8. What is the Eulerian view?
9. What is the Lagrangian view?
10. Why can two nearby tracers move differently?
11. Why does a curved particle path not automatically mean the fluid has
    vorticity?
12. Why does adding more tracers not increase physical model resolution?

If these ideas are unclear, development should remain at this conceptual stage.

---

## 53. Cursor / AI Coding Rule

Cursor may implement a velocity field only from an explicit specification.

Cursor must not infer:

- flow direction;
- field strength;
- radial decay;
- vertical profile;
- time dependence;
- smoothing function;
- turbulence;
- convergence behavior;
- storm-relative corrections;

from a feature name such as:

    InflowField
    UpdraftField
    RotationField

If the mathematical definition is missing, implementation must stop.

---

## 54. No Decorative Velocity

Rendering code must never create a second hidden velocity system.

Forbidden examples:

    particle.position += visualNoise
    particle.position += attractionToCloud
    particle.position += prettySwirl

Scientific tracer motion must come only from:

    atmospheric velocity field
        ↓
    numerical integrator
        ↓
    tracer position

Visual effects may alter appearance, but not physical trajectory.

---

## 55. Mental Model

Imagine the atmosphere filled with invisible arrows.

At every location there is an arrow saying:

> If you were here right now, the local air would carry you this way at this
> speed.

A tracer moves through this invisible arrow field.

As it changes position, it encounters new arrows.

Its path is the history created by those encounters.

The field is the rule.

The trajectory is the consequence.

---

## 56. Final Rule

In Supercell Explorer:

> **The velocity field defines atmospheric motion. Tracers reveal it.**

A tracer trajectory must always be traceable back to:

    position
        ↓
    simulation time
        ↓
    velocity-field sample
        ↓
    numerical integration
        ↓
    new position

If motion cannot be explained through this chain, it does not belong in the
scientific tracer simulation.