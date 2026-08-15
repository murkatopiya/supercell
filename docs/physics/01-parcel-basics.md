# Supercell Explorer — Parcel Basics

> This document defines what Supercell Explorer means by an air parcel,
> tracer particle, trajectory, and local atmospheric state.
>
> It establishes the conceptual boundary between atmospheric physics and
> visualization before any supercell-specific flow is implemented.

---

## 1. Why This Document Exists

Before implementing inflow, updrafts, rotation, or any other storm process,
the project must define what exactly is being transported through the
atmosphere.

Several related ideas are easy to confuse:

- a real volume of air;
- an idealized air parcel;
- a mathematical point moving through a velocity field;
- a tracer particle used for visualization;
- a visible marker rendered by the application.

These are not the same thing.

Supercell Explorer must keep them conceptually separate.

---

## 2. Real Air Is Continuous

The atmosphere is treated physically as a continuous fluid.

Real air does not consist of isolated simulation particles moving like tiny
balls through empty space.

At every location inside the atmospheric domain, physical quantities may be
defined continuously or approximated numerically on a grid.

Examples include:

    velocity
    temperature
    pressure
    density
    moisture
    vorticity

The visible tracer particles used by Supercell Explorer do not represent
individual molecules and do not imply that the atmosphere is particulate at
the scale of the visualization.

---

## 3. The Continuum Approximation

At supercell scales, the atmosphere can be treated using the continuum
approximation.

Instead of tracking individual gas molecules, the atmosphere is described by
fields such as:

    V(x, y, z, t) = velocity
    T(x, y, z, t) = temperature
    p(x, y, z, t) = pressure

This approximation is fundamental to fluid dynamics and atmospheric science.

Supercell Explorer operates at these macroscopic scales.

It does not simulate molecular motion.

---

## 4. Air Parcel

An air parcel is an idealized conceptual element of atmospheric fluid.

It represents a small volume of air that is considered:

- small compared with the storm;
- large enough to contain an enormous number of molecules;
- approximately uniform internally for the quantities being discussed.

An air parcel may conceptually possess properties such as:

    position
    velocity
    temperature
    pressure
    density
    water vapor content
    cloud water content

However, the exact set of parcel properties depends on the physical model.

An air parcel is not a rigid object.

It may:

- expand;
- contract;
- deform;
- exchange heat or moisture;
- mix with surrounding air;
- experience pressure changes.

Therefore a parcel must never be imagined as a permanent solid sphere of air.

---

## 5. Parcel as a Mental Model

The parcel concept is useful because it allows reasoning such as:

> What happens to this small volume of air as it rises?

or:

> Where did the air entering the updraft come from?

This is a Lagrangian way of thinking.

Instead of observing a fixed location in space, we conceptually travel with a
small portion of the fluid.

Supercell Explorer may use this mental model extensively in educational and
Journey modes.

---

## 6. Eulerian and Lagrangian Views

Two complementary perspectives are important.

### Eulerian view

Observe atmospheric quantities at fixed positions in space.

Example question:

> What is the vertical velocity at this location right now?

Mathematically:

    V(position, time)

The observer remains fixed while air passes through the location.

### Lagrangian view

Follow a moving parcel through the atmosphere.

Example question:

> Where does this air travel over the next 60 seconds?

The position changes according to the velocity field.

Supercell Explorer should eventually support both perspectives.

---

## 7. Tracer Particle

A tracer particle is a computational marker used to visualize transport.

A tracer is not a physical object with independent dynamics.

It has minimal state.

Example:

    interface TracerParticle {
      position: Vec3;
      age: number;
      active: boolean;
    }

Its motion is determined by the atmospheric velocity field.

Conceptually:

    d(position) / dt = V(position, time)

The tracer asks:

> What is the velocity of the atmosphere at my current position and time?

Then the numerical integrator updates its position.

---

## 8. Tracer Is Not an Air Molecule

A tracer particle must never be interpreted as:

- one molecule;
- one droplet;
- one dust particle;
- one hailstone;
- one physically rigid blob of air.

Its purpose is only to reveal atmospheric motion.

A rendered point may represent the trajectory of an idealized massless marker
embedded in the flow.

---

## 9. Tracer Is Not Automatically a Full Parcel

A simple tracer initially carries only position and bookkeeping information.

It does not automatically possess its own:

    temperature
    humidity
    density
    buoyancy
    mass

Those values belong to atmospheric fields unless a later physical model
explicitly defines parcel-following thermodynamic state.

Therefore early tracer motion should be interpreted as:

> transport through a prescribed velocity field

not:

> a self-consistent thermodynamic air parcel simulation.

This distinction is essential.

---

## 10. Passive Tracer

Early Supercell Explorer tracers are passive.

A passive tracer:

- is transported by the atmospheric field;
- does not modify the field;
- has negligible mass;
- creates no pressure disturbance;
- produces no drag;
- does not collide with other tracers;
- does not affect other tracers.

Therefore:

    atmosphere → tracer

but not:

    tracer → atmosphere

This is a one-way coupling.

---

## 11. No Particle Forces in Early Versions

Because tracers are passive, early versions should not apply independent
particle forces such as:

    gravity
    drag
    buoyancy
    lift
    random turbulence force

directly to tracer particles.

Atmospheric motion already includes the effects represented by the chosen
velocity field.

Adding a second gravity or buoyancy force directly to the tracer would mix two
different modeling approaches.

If future particle types such as hailstones are implemented, those may require
their own force equations.

They must not be confused with passive air tracers.

---

## 12. Atmospheric Velocity vs Particle Velocity

For a passive tracer:

    particle velocity = local atmospheric velocity

at the tracer's current position and time.

Conceptually:

    dx/dt = V(x, t)

where:

    x = tracer position
    V = atmospheric velocity field

The tracer does not independently store or invent its own persistent velocity
unless required by a later integrator or optimization.

The atmospheric field remains authoritative.

---

## 13. Numerical Trajectory

A trajectory is the sequence of positions visited by a tracer over time.

Conceptually:

    x(t0)
    x(t1)
    x(t2)
    ...
    x(tn)

The continuous physical trajectory must be approximated numerically.

The quality of this approximation depends on:

- velocity field accuracy;
- timestep;
- integration method;
- interpolation accuracy for dataset fields.

A smooth-looking curve is not automatically a correct trajectory.

---

## 14. Pathline

The trajectory of one tracer through time is a pathline.

A pathline answers:

> Where has this parcel-like marker traveled?

For time-dependent flow, a pathline reflects the changing atmospheric field
encountered by the tracer as it moves.

Pathlines are naturally produced by tracer integration.

---

## 15. Streamline

A streamline is different.

At one chosen instant in time, a streamline is everywhere tangent to the local
velocity field.

It answers:

> What direction does the instantaneous velocity field point through space
> right now?

A streamline does not necessarily represent the historical path traveled by a
parcel.

In steady flow:

    pathline ≈ streamline

In time-dependent flow:

    pathline ≠ necessarily streamline

Supercell Explorer must preserve this distinction.

---

## 16. Streakline

A streakline is the locus of particles that have passed through the same
release point.

A continuous smoke source in a wind tunnel approximately reveals a streakline.

This concept may eventually become useful when visualizing persistent tracer
emitters.

It should not be confused with a streamline or a single tracer pathline.

---

## 17. Why These Distinctions Matter

In a highly time-dependent system such as a supercell, these three
representations can diverge significantly:

    pathline
    streamline
    streakline

If the UI labels one as another, the visualization becomes scientifically
misleading.

Terminology must therefore remain explicit.

---

## 18. Tracer Seeding

Tracers need initial positions.

Possible future seeding methods include:

### Point seed

Release one tracer at a selected location.

### Line seed

Release tracers along a line.

### Plane seed

Release tracers across a rectangular region.

### Volume seed

Release tracers inside a 3D volume.

### Continuous emitter

Release new tracers repeatedly from the same region over time.

Seeding changes only initial tracer positions and release times.

It must not change the atmospheric field.

---

## 19. Particle Lifetime

A tracer may have a finite lifetime for practical visualization reasons.

For example, a tracer may be removed when:

- its age exceeds a configured maximum;
- it leaves the simulation domain;
- its trajectory becomes invalid;
- the user resets the visualization.

Lifetime is a visualization/simulation management property.

It must not be interpreted as the physical lifetime of an air parcel.

Air does not cease to exist because a tracer expires.

---

## 20. Domain Exit

If a tracer leaves the valid atmospheric domain, the simulation must apply an
explicit boundary policy.

Possible policies may include:

    deactivate
    remove
    recycle
    respawn

The chosen behavior must be documented.

A tracer must never silently wrap around the domain unless periodic boundary
conditions are intentionally part of the model.

---

## 21. Parcel Thermodynamics

Later versions may introduce a true conceptual parcel model.

Such a parcel may track thermodynamic state while moving.

Potential variables include:

    temperature
    pressure
    water vapor
    saturation state
    density
    buoyancy

This would enable questions such as:

> How does this parcel cool as it rises?

or:

> When does condensation begin?

However, this is not part of the initial passive tracer model.

The project must not pretend that tracer advection alone simulates parcel
thermodynamics.

---

## 22. Sampling Atmospheric Properties Along a Tracer

Even a passive tracer may sample atmospheric fields along its trajectory.

For example:

    temperature = TemperatureField.sample(position, time)
    pressure = PressureField.sample(position, time)
    humidity = MoistureField.sample(position, time)

These are properties of the atmosphere at the tracer's current location.

This is different from storing a thermodynamic parcel state that evolves
independently.

The UI must distinguish:

    sampled local atmospheric value

from:

    parcel-carried physical state

if both ever exist.

---

## 23. Follow Mode

Follow Mode attaches the camera to a tracer.

The tracer remains physically passive.

The camera may:

- follow behind;
- orbit around;
- look along velocity direction;
- maintain a configurable distance;
- smooth camera motion.

The camera must never influence the tracer trajectory.

Conceptually:

    atmospheric field
          ↓
        tracer
          ↓
        camera

Never:

    camera → tracer

---

## 24. Visual Representation

The rendered tracer may appear as:

- point;
- small sprite;
- short streak;
- glowing marker;
- ribbon seed;
- trajectory head.

Its visual appearance is not its physical size.

A tracer may be rendered much larger than the conceptual fluid element it
represents in order to remain visible.

This must be treated as visual encoding only.

---

## 25. Motion Trails

A tracer may leave a visible history trail.

This trail represents past positions.

It should be generated from stored trajectory history, not by inventing
additional geometry unrelated to actual integration results.

Trail fading is a visual effect.

Trail shape is physical data.

---

## 26. Velocity Encoding

Tracer visualization may encode local speed.

Possible visual mappings include:

- trail length;
- particle density;
- animation frequency;
- brightness;
- explicit vector glyphs.

However, any such encoding must be documented.

A faster-looking tracer must not merely be accelerated visually if its physical
trajectory remains unchanged.

Animation timing and simulation timing must remain distinguishable.

---

## 27. Particle Density Is Not Air Density

The number of rendered tracer particles in a region does not automatically
represent atmospheric density.

A region containing many particles may simply reflect:

- seeding strategy;
- convergence of trajectories;
- visualization lifetime;
- emitter configuration.

If physical air density is ever visualized, it must use an explicit density
field.

Tracer count must not be silently interpreted as atmospheric mass density.

---

## 28. Convergence of Tracers

Passive tracers may visually converge toward the same region.

This does not mean real air mass disappears.

If a synthetic velocity field produces strong convergence without appropriate
vertical or horizontal divergence, this may indicate that the conceptual field
violates mass-continuity expectations.

Tracer behavior can therefore reveal flaws in the velocity model.

This is one reason particle visualization is useful for validation.

---

## 29. Parcel Volume and Deformation

A real material parcel may deform as the flow stretches and compresses it.

A point tracer does not represent this deformation.

Therefore a single tracer cannot reveal:

- parcel stretching;
- parcel compression;
- volume change;
- shape deformation.

Future visualization may seed clusters, lines, or small volumes of tracers to
show deformation of material elements.

This should remain conceptually separate from single-particle transport.

---

## 30. Material Line Experiment

A useful future diagnostic is a material line.

Place multiple tracers along an initial line.

Then advect all of them through the same atmospheric field.

Their evolving arrangement may reveal:

- stretching;
- shear;
- rotation;
- deformation.

This is potentially valuable for understanding wind shear and vorticity.

It is not required for the initial tracer implementation.

---

## 31. Material Volume Experiment

Similarly, a small 3D cluster of tracers may approximate how a conceptual fluid
volume deforms.

This may help visualize:

- convergence;
- divergence;
- stretching;
- tilting;
- deformation of fluid elements.

Again, the particles remain passive markers.

The cluster is a visualization of material deformation, not a rigid object.

---

## 32. Mass Conservation Warning

Passive tracer integration does not itself enforce atmospheric mass
conservation.

If the synthetic velocity field violates continuity, tracers will simply
follow that incorrect field.

Therefore:

> Correct particle integration does not imply correct atmospheric physics.

Mass continuity and physically meaningful convergence/divergence must be
validated when individual synthetic fields are designed.

---

## 33. Turbulence

Early tracer models must not add arbitrary random motion to simulate
"turbulence."

Random jitter can easily create visually convincing but scientifically
meaningless motion.

If turbulence is later represented, the project must explicitly define what is
being modeled:

- resolved turbulent flow from a numerical dataset;
- a documented subgrid stochastic model;
- a purely visual effect.

These categories must not be confused.

---

## 34. Brownian Motion Is Not Relevant Here

At the spatial scales of Supercell Explorer, molecular Brownian motion is not
a meaningful mechanism for air-tracer transport.

Tracer motion represents atmospheric fluid velocity, not molecular diffusion.

Random microscopic motion must not be added to make particles feel more
"alive."

---

## 35. Tracer vs Hydrometeor

Future precipitation particles are physically different from air tracers.

A raindrop or hailstone may possess:

- mass;
- inertia;
- gravitational settling;
- drag;
- terminal velocity;
- collision behavior.

Therefore:

    AirTracer

and:

    HydrometeorParticle

must eventually be separate concepts.

A hydrometeor does not simply follow the air velocity exactly.

---

## 36. Tracer vs Visual Dust

The application may eventually use decorative visual particles for atmosphere
or cinematic effects.

If such particles exist, they must not be mixed with scientific tracers.

Suggested conceptual separation:

    ScientificTracer
    VisualParticle

Scientific tracers must always be driven by validated atmospheric data.

---

## 37. Initial Tracer Model

For the earliest project versions, the tracer model should remain deliberately
minimal.

Required state:

    position
    age
    active

Required behavior:

    sample velocity field
    integrate position
    deactivate when necessary

Not required initially:

    temperature state
    humidity state
    density state
    mass
    forces
    collisions
    stochastic motion
    deformation
    chemistry

This simplicity is intentional.

---

## 38. Minimal Mathematical Model

For a passive tracer:

    dx/dt = V(x, t)

where:

    x(t) = tracer position
    V    = atmospheric velocity field
    t    = simulation time

In project coordinates:

    x = east-west position
    y = altitude
    z = south-north position

and:

    dX/dt = Vx
    dY/dt = Vy
    dZ/dt = Vz

The numerical integrator approximates this continuous motion.

---

## 39. First Learning Objective

Before implementing any storm-specific flow, the project owner should be able
to explain the following in their own words:

1. What is an air parcel?
2. Why is an air parcel not a molecule?
3. Why is a tracer not automatically a physical parcel?
4. What determines tracer motion?
5. Why does a tracer not need its own force model in the passive case?
6. What is the difference between Eulerian and Lagrangian views?
7. What is the difference between pathline and streamline?
8. Why does correct-looking particle motion not guarantee correct atmospheric
   physics?

If these questions cannot yet be answered clearly, implementation should remain
at the conceptual-learning stage.

---

## 40. Validation for the First Tracer

The first tracer implementation should be tested inside a deliberately trivial
velocity field.

Example:

    velocity = constant eastward 10 m/s

Initial position:

    (0, 1000, 0)

After:

    1 second

expected approximate position:

    (10, 1000, 0)

After:

    10 seconds

expected approximate position:

    (100, 1000, 0)

The result must be numerically predictable.

No storm physics is required.

The purpose is to validate:

- coordinate convention;
- simulation clock;
- field sampling;
- integrator;
- tracer lifecycle;
- rendering adapter.

---

## 41. Second Tracer Experiment

After constant horizontal motion is validated, a pure vertical field may be
used.

Example:

    vertical velocity = +5 m/s

Initial:

    altitude = 1000 m

After:

    20 s

expected:

    altitude ≈ 1100 m

Horizontal coordinates must remain unchanged.

Again, no supercell behavior is involved yet.

---

## 42. Why We Start This Small

The first moving particle should not be impressive.

It should be understandable.

If a particle moves east at 10 m/s, every part of the system can be checked
manually.

Once that foundation is trusted, complexity can be added one mechanism at a
time.

The project must resist the temptation to begin with a visually convincing
storm.

---

## 43. Cursor / AI Coding Rule

AI coding tools must treat tracers as passive markers unless another particle
model is explicitly documented.

Cursor must not add:

- gravity;
- drag;
- buoyancy;
- random noise;
- smoothing forces;
- attraction toward flow centers;
- collision avoidance;
- cinematic motion corrections;

to an air tracer without explicit specification.

If a tracer trajectory looks visually unsatisfying, the physical field or
rendering representation must be investigated separately.

---

## 44. Debug Requirements

Early tracer development should expose at least:

    tracer position
    tracer age
    simulation time
    sampled atmospheric velocity
    current integration timestep

Later versions may additionally expose:

    individual velocity-field contributions
    trajectory history
    local scalar-field values
    local vorticity
    local divergence

Debugging information must reflect actual simulation state.

---

## 45. Mental Model

The simplest mental model is:

    ATMOSPHERE
       |
       | provides velocity
       v
    TRACER
       |
       | provides position to observe
       v
    RENDERER

The tracer does not push the atmosphere.

The renderer does not push the tracer.

The atmospheric field determines the motion.

---

## 46. Final Rule

A tracer in Supercell Explorer is:

> **a massless passive computational marker used to reveal transport through an atmospheric velocity field.**

It is not automatically:

- a molecule;
- a droplet;
- a rigid air blob;
- a full thermodynamic parcel;
- a decorative animation particle.

Whenever the project uses the word `parcel`, documentation must clarify whether
it refers to:

1. a conceptual material air parcel;
2. a passive tracer following the flow;
3. a future thermodynamic parcel model.

These meanings must never be silently mixed.