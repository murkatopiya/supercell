# Supercell Explorer — Coordinate System

> This document defines the canonical spatial coordinate conventions used by
> Supercell Explorer.
>
> Every physical model, numerical calculation, renderer, camera, dataset
> adapter, probe, and debugging tool must ultimately use or explicitly convert
> to this convention.

---

## 1. Goal

Supercell Explorer must use one unambiguous spatial convention across:

- atmospheric physics;
- numerical integration;
- rendering;
- imported datasets;
- camera controls;
- documentation.

The project must never rely on implicit axis conventions.

A coordinate transformation must always occur at an explicit architectural
boundary.

---

## 2. Canonical World Coordinates

Internally, Supercell Explorer uses a right-handed local Cartesian coordinate
system:

    X = East
    Y = Up
    Z = South

Therefore:

    +X = East
    -X = West

    +Y = Up
    -Y = Down

    +Z = South
    -Z = North

This convention is chosen because:

1. Three.js naturally uses `Y` as the vertical axis;
2. keeping `X = East` is intuitive;
3. choosing `Z = South` preserves a right-handed coordinate system.

This is the canonical coordinate system of the application.

---

## 3. Why Z Points South

Suppose we define:

    X = East
    Y = Up

For a right-handed coordinate system:

    X × Y = Z

With East as +X and Up as +Y, the resulting positive Z direction points
South.

Therefore:

    +Z = South
    -Z = North

Choosing:

    X = East
    Y = Up
    Z = North

would produce a left-handed coordinate system.

Supercell Explorer does not use that convention.

---

## 4. Canonical Mental Model

The simplest mental representation is:

               +Y
               UP
                |
                |
                |
                O -------- +X EAST
               /
              /
           +Z SOUTH

Therefore:

    NORTH = -Z
    WEST  = -X
    DOWN  = -Y

This diagram should remain the basic spatial reference used throughout the
project.

---

## 5. Meteorological Coordinates

Meteorological literature commonly describes wind velocity using:

    u = eastward velocity
    v = northward velocity
    w = vertical velocity

This convention is scientifically standard and should remain available in
physics documentation.

However, meteorological `(u, v, w)` do not correspond directly to the
project's `(x, y, z)` components.

The mapping is:

    meteorological u → project +X
    meteorological v → project -Z
    meteorological w → project +Y

Therefore:

    world.x = u
    world.y = w
    world.z = -v

The inverse conversion is:

    u = world.x
    v = -world.z
    w = world.y

---

## 6. Important Naming Problem

Meteorological notation creates a potential source of confusion.

In atmospheric science:

    w = vertical velocity

But in a generic graphics or vector context developers may incorrectly expect:

    z = vertical axis

or associate the third velocity component with vertical motion.

Neither assumption is valid in Supercell Explorer.

The project's vertical spatial axis is:

    Y

while the standard meteorological vertical velocity symbol remains:

    w

Therefore:

    meteorological w → world velocity.y

This mapping must always remain explicit.

---

## 7. Semantic Atmospheric Velocity

Physics-facing code should prefer semantic names instead of raw `u`, `v`, and
`w` whenever possible.

Example:

    interface AtmosphericVelocity {
      eastward: number;   // m/s
      northward: number;  // m/s
      vertical: number;   // m/s
    }

This representation describes physical meaning rather than implementation
axes.

Generic world-space mathematical vectors remain:

    interface Vec3 {
      x: number;
      y: number;
      z: number;
    }

Conversion between them must happen explicitly.

Example:

    function atmosphericVelocityToWorld(
      velocity: AtmosphericVelocity
    ): Vec3 {
      return {
        x: velocity.eastward,
        y: velocity.vertical,
        z: -velocity.northward,
      };
    }

Inverse conversion:

    function worldVelocityToAtmospheric(
      velocity: Vec3
    ): AtmosphericVelocity {
      return {
        eastward: velocity.x,
        northward: -velocity.z,
        vertical: velocity.y,
      };
    }

---

## 8. Position Semantics

World positions are expressed in meters.

Example:

    interface WorldPosition {
      x: number;
      y: number;
      z: number;
    }

Interpretation:

    x > 0 → east of origin
    x < 0 → west of origin

    y > 0 → above reference ground
    y < 0 → below reference ground

    z > 0 → south of origin
    z < 0 → north of origin

For physics-facing APIs, semantic atmospheric positions may also be useful:

    interface AtmosphericPosition {
      east: number;
      north: number;
      altitude: number;
    }

Conversion:

    function atmosphericPositionToWorld(
      position: AtmosphericPosition
    ): WorldPosition {
      return {
        x: position.east,
        y: position.altitude,
        z: -position.north,
      };
    }

Inverse:

    function worldPositionToAtmospheric(
      position: WorldPosition
    ): AtmosphericPosition {
      return {
        east: position.x,
        north: -position.z,
        altitude: position.y,
      };
    }

---

## 9. Origin

The conceptual world origin is:

    x = 0
    y = 0
    z = 0

Initially:

- `y = 0` represents reference ground level;
- `x = 0` and `z = 0` define the horizontal reference origin of the simulation
  domain.

The origin must not automatically be treated as:

- the center of the updraft;
- the mesocyclone center;
- the tornado location;
- the storm position.

Those are physical features and may move independently.

---

## 10. World Coordinates and Storm-Relative Coordinates

The project must distinguish between two different concepts.

### World coordinates

World coordinates are fixed relative to the simulation domain.

    X_world
    Y_world
    Z_world

They define absolute positions inside the local simulation space.

### Storm-relative coordinates

Storm-relative coordinates are defined relative to a storm reference position
and potentially its motion.

    X_storm
    Y_storm
    Z_storm

These may eventually be useful for:

- storm-relative wind;
- moving supercells;
- inflow analysis;
- mesocyclone-centered views;
- translating numerical simulation data.

World and storm-relative coordinates must never be silently mixed.

Any transformation must be explicit.

---

## 11. Ground and Altitude

Altitude is always represented by +Y.

    ground reference → y = 0
    above ground     → y > 0

Negative Y values may exist mathematically but normally lie outside the
atmospheric domain unless terrain or below-ground visualization is explicitly
implemented.

Physical storage remains in meters.

Display conversion may use kilometers.

Example:

    world.y = 6500 m

may be displayed as:

    altitude = 6.5 km

Display conversion must not modify the physical value.

---

## 12. Direction Examples

### Eastward flow

Atmospheric representation:

    eastward  = +10 m/s
    northward = 0
    vertical  = 0

World vector:

    (+10, 0, 0)

---

### Westward flow

Atmospheric representation:

    eastward  = -10 m/s
    northward = 0
    vertical  = 0

World vector:

    (-10, 0, 0)

---

### Northward flow

Atmospheric representation:

    eastward  = 0
    northward = +10 m/s
    vertical  = 0

World vector:

    (0, 0, -10)

---

### Southward flow

Atmospheric representation:

    eastward  = 0
    northward = -10 m/s
    vertical  = 0

World vector:

    (0, 0, +10)

---

### Updraft

Atmospheric representation:

    vertical > 0

World representation:

    velocity.y > 0

---

### Downdraft

Atmospheric representation:

    vertical < 0

World representation:

    velocity.y < 0

---

## 13. Rotation Convention

Descriptions such as:

    clockwise

or:

    counterclockwise

are not sufficient by themselves.

Rotation must always specify:

1. the rotation axis;
2. the sign of rotation;
3. the viewing direction.

Supercell Explorer uses the right-hand rule for positive rotation.

For rotation around +Y:

    positive rotation axis = +Y

Viewed from above the storm while looking downward toward the ground, positive
rotation around +Y appears counterclockwise.

This convention must remain consistent in:

- atmospheric fields;
- vorticity;
- tests;
- debug tools;
- documentation.

---

## 14. Vorticity Coordinates

Vorticity is a vector quantity and uses the same canonical world coordinate
system as velocity.

For a rotating updraft, the vertical component of vorticity is represented
along Y.

Therefore:

    positive vertical vorticity → +Y
    negative vertical vorticity → -Y

When meteorological equations refer to vertical vorticity, that vertical
component must map explicitly to the project Y axis.

The right-handed Cartesian curl in these axes, the map

    (ω_x, ω_z) = (omegaEastward, −omegaNorthward)

and the diagnostic tilting tendency of `ω_y` are derived in
`docs/physics/22-diagnostic-tilting-tendency.md`. This document
remains the coordinate SoT.

No visualization-specific rotation convention may override this rule.

---

## 15. Dataset Import Boundary

External atmospheric datasets may use completely different coordinate
conventions.

Possible differences include:

- vertical axis represented by Z;
- Y representing North;
- latitude/longitude instead of Cartesian coordinates;
- model-relative coordinates;
- staggered grids;
- terrain-following coordinates;
- different vertical sign conventions.

All dataset-specific conversion must occur inside a dataset adapter.

Conceptually:

    raw dataset coordinates
              ↓
    dataset-specific adapter
              ↓
    Supercell Explorer canonical coordinates

After adaptation, the rest of the application must not need to know how the
source dataset originally represented its axes.

---

## 16. Rendering Boundary

The rendering system receives canonical world coordinates.

Rendering must not independently reinterpret them.

Three.js scene coordinates should therefore correspond directly to:

    X = East
    Y = Up
    Z = South

Allowed:

    mesh.position.set(
      worldPosition.x,
      worldPosition.y,
      worldPosition.z
    );

Forbidden:

    mesh.position.z = -physicsPosition.z;

when this inversion is introduced merely to fix an unexpected visual result.

If something appears mirrored, the coordinate conversion must be debugged at
the correct architectural boundary.

Local rendering hacks must not establish new coordinate conventions.

---

## 17. Camera Orientation

Camera orientation uses the same canonical world system.

A camera looking North points generally toward:

    -Z

A camera looking South points toward:

    +Z

A camera looking East points toward:

    +X

A camera looking West points toward:

    -X

Up remains:

    +Y

Camera utilities may provide semantic direction helpers so UI and Journey Mode
do not need to manually manipulate axis signs.

---

## 18. Units

Spatial coordinates:

    meters (m)

Velocity components:

    meters per second (m/s)

Acceleration:

    meters per second squared (m/s²)

Angles:

    radians

Angular velocity:

    radians per second (rad/s)

No direction-specific unit conversion is allowed.

---

## 19. Naming Rules

Raw meteorological component names:

    u
    v
    w

should only be used in code that explicitly works with meteorological notation
or imported datasets.

General atmospheric APIs should prefer:

    eastward
    northward
    vertical

Generic Cartesian mathematics should use:

    x
    y
    z

This distinction is intentional.

It helps separate:

    scientific meaning

from:

    implementation coordinates

and prevents accidental assumptions about which component represents altitude.

---

## 20. Required Coordinate Utilities

The core math layer should eventually provide explicit conversion helpers.

At minimum:

    atmosphericVelocityToWorld()
    worldVelocityToAtmospheric()

    atmosphericPositionToWorld()
    worldPositionToAtmospheric()

Coordinate conversion must not be duplicated across unrelated modules.

These helpers require automated tests.

---

## 21. Required Tests

### East

Input:

    eastward  = +10
    northward = 0
    vertical  = 0

Expected world:

    (+10, 0, 0)

---

### North

Input:

    eastward  = 0
    northward = +10
    vertical  = 0

Expected world:

    (0, 0, -10)

---

### South

Input:

    eastward  = 0
    northward = -10
    vertical  = 0

Expected world:

    (0, 0, +10)

---

### Up

Input:

    eastward  = 0
    northward = 0
    vertical  = +10

Expected world:

    (0, +10, 0)

---

### Down

Input:

    eastward  = 0
    northward = 0
    vertical  = -10

Expected world:

    (0, -10, 0)

---

### Round-trip conversion

For arbitrary atmospheric velocity:

    AtmosphericVelocity
        ↓
    World Vec3
        ↓
    AtmosphericVelocity

the result must equal the original value within floating-point tolerance.

The same requirement applies to position conversions.

---

## 22. Coordinate Debugging

Development/debug mode should eventually provide a visible world-axis helper.

It should clearly display:

    +X EAST
    -X WEST

    +Y UP
    -Y DOWN

    +Z SOUTH
    -Z NORTH

This helper should be available while implementing every early physical field.

Any field whose direction is not immediately visually obvious should be tested
with the axis helper enabled.

---

## 23. Cursor / AI Rule

AI coding tools must not infer or redefine coordinate conventions.

If an implementation request contains ambiguous terms such as:

    vertical velocity
    northward flow
    positive rotation
    clockwise
    meteorological w

the implementation must resolve them using this document.

If the required mapping remains ambiguous, implementation must stop rather
than guess.

---

## 24. Final Rule

Supercell Explorer has exactly one canonical world coordinate system:

> **X = East, Y = Up, Z = South.**

Scientific documentation may use standard meteorological notation:

> **u = East, v = North, w = Up.**

The explicit mapping is:

    u → +X
    v → -Z
    w → +Y

No atmospheric equation, dataset adapter, renderer, camera, probe, particle
system, or AI coding tool may silently introduce another convention.