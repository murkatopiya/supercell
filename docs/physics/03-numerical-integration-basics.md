# Numerical Integration Basics

## 1. Purpose

Supercell Explorer represents atmospheric motion through velocity fields.

A passive tracer follows:

dx/dt = V(x, t)

A velocity field defines the instantaneous local velocity, but it does not
directly provide the complete tracer trajectory.

The trajectory must be obtained numerically.

Therefore:

correct velocity field != automatically correct numerical trajectory

The numerical integrator and simulation timestep are part of the accuracy
of the simulation.

---

## 2. What the integrator does

At a simulation state:

position = x_n
time = t_n

the velocity field can be sampled:

V_n = V(x_n, t_n)

An integrator uses one or more samples of the velocity field to estimate
the next position:

x_n -> x_(n+1)

Different integration methods can produce different numerical trajectories
from the same velocity field.

This difference is numerical, not physical.

---

## 3. Euler method

The explicit Euler method uses the velocity at the beginning of the step:

V_n = V(x_n, t_n)

x_(n+1) = x_n + V_n * dt

Euler is simple and useful as a learning and validation baseline.

For a constant velocity field, Euler is exact:

V = constant

x(t) = x_0 + V*t

For spatially varying fields, Euler generally introduces numerical error.

---

## 4. RK2 explicit midpoint method

The current RK2 implementation uses the explicit midpoint method:

v1 = V(x_n, t_n)

x_mid = x_n + (dt/2) * v1

v2 = V(x_mid, t_n + dt/2)

x_(n+1) = x_n + dt * v2

Unlike Euler, RK2 samples the field at an estimated midpoint of the step.

This provides a better estimate of how velocity changes during the timestep.

For a constant velocity field, Euler and RK2 produce the same exact result.

---

## 5. Experiment 1: constant velocity

Field:

V = (10, 0, 0) m/s

Initial position:

x_0 = (0, 1000, 0) m

Duration:

T = 10 s

Expected result:

x(T) = (100, 1000, 0) m

The experiment confirms that the simulation, field sampling, integrator,
particle update, and simulation clock are connected correctly.

A second constant-field experiment used:

V = (0, 5, 0) m/s

for 20 s and produced:

x(T) = (0, 1100, 0) m

This also validates the project convention that +Y is Up.

---

## 6. Experiment 2: spatially varying linear field

Learning field:

Vx = k*x
Vy = 0
Vz = 0

This is a mathematical learning field, not an atmospheric storm process.

The governing equation is:

dx/dt = k*x

with analytical solution:

x(t) = x_0 * exp(k*t)

Euler produces:

x_(n+1) = x_n * (1 + k*dt)

and therefore:

x_N = x_0 * (1 + k*dt)^N

This experiment demonstrates that the velocity field must be sampled again
after every position update.

The tracer moves to a new position, samples a new local velocity, and then
uses that velocity for the next numerical step.

It also demonstrates numerical convergence: decreasing dt decreases the
difference between the Euler trajectory and the analytical solution.

---

## 7. Experiment 3: solid-body rotation

Learning field:

Vx = omega*z
Vy = 0
Vz = -omega*x

This represents mathematical solid-body rotation around the world +Y axis.

It is not a mesocyclone model.

For positive omega, rotation follows the project's right-hand convention:
counterclockwise when viewed from above.

The analytical trajectory is circular:

x(t) = x_0*cos(omega*t) + z_0*sin(omega*t)

z(t) = -x_0*sin(omega*t) + z_0*cos(omega*t)

y(t) = y_0

The horizontal radius is invariant:

r = sqrt(x^2 + z^2)

r(t) = r_0

---

## 8. Why Euler spirals outward

For the rotation field, define:

a = omega*dt

One Euler step gives:

x_next = x + a*z
z_next = z - a*x

Therefore:

r_next^2
= x_next^2 + z_next^2
= (x + a*z)^2 + (z - a*x)^2
= (1 + a^2)*(x^2 + z^2)

so:

r_next = r * sqrt(1 + a^2)

After N steps:

r_N = r_0 * (1 + (omega*dt)^2)^(N/2)

Therefore explicit Euler systematically increases the radius in this
rotation field.

The velocity field itself is not producing an outward physical velocity.

The outward spiral is a numerical integration artifact.

Geometrically, Euler advances along the local tangent instead of following
the circular arc.

---

## 9. Euler vs RK2

The same solid-body rotation field was integrated using Euler and RK2.

The physical field, initial state, duration, and timestep were identical.
Only the numerical integration method changed.

The experiments showed:

- both methods converge toward the analytical trajectory as dt decreases;
- RK2 has substantially smaller position error than Euler;
- RK2 has substantially smaller radius drift than Euler;
- Euler's outward spiral is therefore not a property of the velocity field.

For this experiment, reducing dt by a factor of 10 approximately reduced:

Euler position error by a factor of 10

RK2 position error by a factor of 100

This behavior is consistent with:

Euler global error ~ O(dt)

RK2 global error ~ O(dt^2)

This experiment does not yet constitute a general quantitative convergence
study. Formal convergence-order validation is reserved for a later
numerical experiment.

---

## 10. Position error and invariant error are different

For circular motion, two useful diagnostics are:

position error =
distance(numerical_position, analytical_position)

radius error =
abs(r_numerical - r_0)

These measure different failures.

A trajectory may have nearly the correct radius but still have substantial
position error because its angular phase is wrong.

Therefore preserving an invariant does not by itself guarantee an accurate
trajectory.

---

## 11. Timestep is a numerical parameter

The simulation timestep must not be treated as a visual smoothing parameter.

A smaller dt generally samples the evolving trajectory more accurately but
requires more computation.

A timestep must be chosen through numerical validation against:

- analytical solutions where available;
- known invariants;
- convergence experiments;
- physically meaningful error tolerances.

There is currently no project-wide DEFAULT_DT.

Individual learning experiments define their own dt values.

---

## 12. Validation hierarchy

When a trajectory appears incorrect, distinguish between:

1. field error
   - Is V(x, t) mathematically and physically correct?

2. sampling / wiring error
   - Is the field sampled at the correct position and time?

3. integrator implementation error
   - Does the code implement the intended numerical method?

4. timestep error
   - Is dt too large for the spatial or temporal variation of the field?

5. expected numerical approximation error
   - Is the remaining difference consistent with the method's known accuracy?

A visually plausible trajectory is not sufficient evidence of correctness.

---

## 13. Current project decisions

Current implemented integrators:

- EulerIntegrator
- RK2Integrator using explicit midpoint

Current numerical conventions:

- integrators do not mutate input position vectors;
- integrators return a new position;
- timestep is supplied externally;
- simulation time is separate from render time;
- tests use analytical solutions and invariants whenever possible;
- no project-wide default timestep has been selected.

RK4 and other integration methods are not part of the current implementation.

---

## 14. Core lesson

A velocity field answers:

"What is the local velocity here and now?"

An integrator answers:

"Given that local velocity information, where should the tracer be after
the next finite timestep?"

These are separate problems.

A physically correct velocity field can produce an inaccurate trajectory
when integrated with an unsuitable numerical method or timestep.

Therefore Supercell Explorer must validate both:

the atmospheric model

and

the numerical method used to evolve it.