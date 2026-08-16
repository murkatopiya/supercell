# Composite Velocity Field

## 1. Purpose

This document defines the first explicit velocity-field composition mechanism
in Supercell Explorer: `CompositeVelocityField` v1.

It answers:

    Given one or more world-space VelocityField operands, what total world
    velocity does a passive tracer sample?

The definition is:

    V_total(position, time) = Σ_i V_i(position, time)

where the sum is component-wise in canonical world coordinates
`(Vx, Vy, Vz)`.

`CompositeVelocityField` is a generic laboratory composition tool. It knows
nothing about environment, updraft, storm, or other mechanism semantics.

It is **not**:

- a mass-continuity correction;
- a pressure-coupled storm model;
- a nonlinear interaction between mechanisms;
- a realistic or complete supercell velocity field;
- automatic assembly of a storm from ScenarioConfig.

The existence of vector addition does not by itself make the sum physically
complete. This document authorizes mathematical composition only.

---

## 2. Relationship to existing foundations

`docs/physics/02-velocity-field-basics.md` §32–33 introduces conceptual
composition:

    V_total = V_background + V_inflow + V_updraft + ...

and

    V_total = V_environment + V_storm

and requires that simple addition not be treated as automatically physically
valid.

`docs/physics/11-updraft-field.md` §19 deferred composition to a separate
explicit slice and required documentation of:

- operand meaning under addition;
- that v1 addition is controlled laboratory composition, not mass-consistent
  storm dynamics;
- how isolated vs composite fields are selected in tests and demos.

This document is that slice for the generic compositor. Demo / ScenarioConfig
wiring remains out of scope here.

Architectural role:

    VelocityField[] operands
        ↓
    CompositeVelocityField implements VelocityField
        ↓
    sample(position, time) → world Vec3 = Σ sample_i(position, time)

Operands remain independently defined physics (or synthetic) fields.
Composition does not merge their documentation or validation ownership.

---

## 3. Mathematical definition

Let the operand list be:

    fields = [F_0, F_1, ..., F_(n-1)]
    n ≥ 1

At a sample request `(position, time)`:

    V_i = F_i.sample(position, time)   for each i

    V_total.x = Σ_i V_i.x
    V_total.y = Σ_i V_i.y
    V_total.z = Σ_i V_i.z

Every operand is sampled at the **same** `position` and the **same** `time`.

There are no weights, masks, priorities, or blending functions in v1.

Summation order follows the operand array order. For ordinary finite
components the mathematical sum is commutative; floating-point association
differences are irrelevant to the physical contract and should be avoided in
exact unit tests by using simple finite values.

---

## 4. Coordinate and frame semantics

Inputs and outputs are world-space only:

| Quantity | Representation |
|---|---|
| Sample input position | world `Vec3` `(x, y, z)` in meters |
| Operand sample outputs | world `Vec3` `(Vx, Vy, Vz)` in m/s |
| Composite output | world `Vec3` `(Vx, Vy, Vz)` in m/s |

Canonical world axes remain:

    +X = East
    +Y = Up
    +Z = South

`CompositeVelocityField` must not:

- convert through `AtmosphericVelocity`;
- interpret height, storm motion, or radial structure;
- re-encode environmental or updraft policy.

If an operand already returns atmospheric-semantic meaning packaged as world
components (for example `EnvironmentalWindField`), the composite treats those
numbers as opaque world velocity contributions.

---

## 5. API and construction

Implementation path:

    src/core/fields/CompositeVelocityField.ts

Construction:

    new CompositeVelocityField(fields: readonly VelocityField[])

Notes:

- the constructor argument is a readonly array of `VelocityField`;
- variadic construction is not part of v1;
- the composite itself implements `VelocityField`.

---

## 6. Validation policy

Validation belongs at the owning construction boundary of
`CompositeVelocityField`.

Reject with `CompositeVelocityFieldError` when:

- `fields.length === 0`

Empty composition is forbidden. The additive identity may be expressed
explicitly with a zero `ConstantVelocityField` if a motionless field is
needed; it must not be implied by `[]`.

Allowed:

- `fields.length === 1`  
  Sampling must return the same velocity values as the single operand
  (new object identity is still required for the composite return value).

`CompositeVelocityField` does **not**:

- re-validate finiteness of child sample outputs;
- guard against `NaN` / `Infinity` produced by operands;
- deep-clone or replace operand instances.

Child fields own their output contracts. Non-finite values from a child, if
any, pass through the sum unchanged in IEEE-754 arithmetic.

---

## 7. Ownership and mutability

On construction:

- store a **shallow copy** of the operand list (so later mutation of the
  caller-owned array does not change which fields are composed);
- keep each field instance **by reference** (do not clone field objects).

If a future mutable field object changes its internal state, all composites
that reference it observe that change. That sharing is intentional.

On `sample`:

- do not mutate the caller-owned input `position`;
- do not mutate `Vec3` objects returned by child `sample` calls;
- accumulate sums in local scalars (or an owned temporary), then return a
  **new** plain `Vec3`;
- do not return an internal reusable buffer.

---

## 8. Steady operands and trajectory time dependence

Operands may be Eulerian-steady (ignore `time`) while the **trajectory** under
the composite is still time-dependent through changing position.

Important laboratory case:

    V_environment = V_environment(y)     // horizontally homogeneous
    V_updraft     = (0, w(r), 0)         // height-independent in v1

On the updraft axis:

    V_total = (Vx_env(y), W0, Vz_env(y))

Then:

    dy/dt = W0
    dx/dt = Vx_env(y(t))
    dz/dt = Vz_env(y(t))

Even though both fields ignore simulation clock time, horizontal velocity
along the path becomes time-dependent because environment is re-sampled at the
new height as the particle rises.

This is expected mathematical behavior of the composition, not a hidden
time-dependent storm model.

---

## 9. First intended application

After isolated implementation of the generic composite, the first documented
pairing is:

    EnvironmentalWindField + UpdraftField

Meaning:

    V_total = V_environment + V_updraft

This pairing is a controlled combination of two already documented mechanisms:

- environment supplies background horizontal wind (and `Vy = 0` in the current
  environmental model);
- updraft supplies the controlled vertical Gaussian mechanism.

The composite API must remain generic and must not hard-code this pairing.

A later laboratory DEMO also includes `RotationField` as a third operand.
That wiring is specified in `docs/rendering/04-composite-rotation-demo.md`.
The current live DEMO uses `VerticalEnvelopeUpdraftField` as the updraft
operand together with `LowerRadialInflowField` and `UpperRadialOutflowField`
(`docs/rendering/08-composite-lower-radial-inflow-demo.md`). The
completed five-operand DEMO immediately before that inflow replacement is
`docs/rendering/07-composite-upper-radial-outflow-demo.md`. The
completed four-field DEMO immediately before the fifth operand is
`docs/rendering/06-composite-vertical-envelope-updraft-demo.md`. The
completed four-field DEMO that still used height-independent
`UpdraftField` is `docs/rendering/05-composite-radial-inflow-demo.md`.
None of that wiring changes this compositor's physics.

ScenarioConfig wiring, demo scene composition, and renderer changes are
**not** part of the first implementation slice.

---

## 10. Explicit non-goals

`CompositeVelocityField` v1 does **not** include:

- weights or scale factors per operand;
- spatial masks or blend regions;
- field priorities / override rules;
- mass continuity correction;
- compensating subsidence;
- pressure coupling;
- nonlinear interaction between mechanisms;
- automatic storm-model assembly;
- closed-form horizontal trajectory oracles for sheared environment;
- ScenarioConfig storm parameters;
- renderer changes.

---

## 11. Invariants

For a valid `CompositeVelocityField` with operands `F_i`:

1. **Same sample arguments**  
   Every operand `sample` in one composite `sample` call receives the same
   `position` and the same `time`.

2. **Component-wise sum**  
   At any `(position, time)`:

       sample(composite) = Σ sample(F_i)

   component-wise in world `(x, y, z)`.

3. **Single operand transparency (values)**  
   For `n = 1`, composite sample components equal the operand sample
   components.

4. **Empty forbidden**  
   Construction with zero fields fails.

5. **No input mutation**  
   Caller `position` is unchanged after `sample`.

6. **No child-output mutation**  
   Vectors returned by operands are not written by the composite.

7. **Fresh return**  
   Each composite `sample` returns a new plain `Vec3`.

8. **Order of finite sums**  
   For simple finite test values, `[A, B]` and `[B, A]` yield the same
   `V_total`.

---

## 12. Testing policy

Prefer contract tests over implementation trivia.

### Unit tests (required)

- two constant world fields sum exactly;
- environment + pure vertical contribution preserves horizontal env parts and
  vertical part at a fixed sample point;
- operand order independence for simple finite cases;
- one-field composite matches operand values;
- empty list construction throws `CompositeVelocityFieldError`;
- each child receives the same `position` / `time` (spy or recording field);
- no mutation of input position or child return vectors;
- composite returns a distinct object from child returns.

### Acceptance v1 (required)

For:

    composite = EnvironmentalWindField + UpdraftField

1. **Structural sum**  
   At representative fixed sample points (on-axis and at least one off-axis),
   with any valid environmental profile:

       sample(composite, P, t) = sample(env, P, t) + sample(updraft, P, t)

2. **Exact on-axis vertical oracle**

       y(t) = y0 + W0 * t

   Setup requirements:

   - tracer starts on the updraft axis;
   - environment contributes `Vy = 0` (current environmental model);
   - environment horizontal wind on the test trajectory must be **zero**, so
     the tracer is not displaced off the axis.

   If environment has nonzero horizontal wind, the particle leaves the axis,
   `r(t)` grows, `Vy_updraft` falls below `W0`, and

       y(t) = y0 + W0 * t

   is no longer exact. That sheared case is deferred with closed-form
   horizontal oracles.

   With calm horizontal environment, both Euler and RK2 remain exact for this
   `y(t)` aside from ordinary floating-point roundoff.

### Deferred (not required in v1)

- full closed-form `x(t)`, `z(t)` under piecewise-linear environmental shear;
- ScenarioConfig / demo integration tests;
- renderer glyph tests as physics acceptance.

---

## 13. First implementation slice

In order:

1. this document (source of truth);
2. `CompositeVelocityField` implementation at
   `src/core/fields/CompositeVelocityField.ts`;
3. unit tests for invariants and empty-list validation;
4. acceptance: structural `env + updraft` sum and on-axis
   `y(t) = y0 + W0 * t` with calm horizontal environment;
5. `npm test` and `npm run typecheck`;
6. stop.

Out of this slice:

- ScenarioConfig changes;
- demo / app composition wiring;
- renderer changes;
- weighted or masked composition;
- closed-form horizontal trajectory acceptance;
- any new storm mechanism.

---

## 14. Core lesson

`CompositeVelocityField` makes modular velocity mechanisms usable together by
explicit world-space addition:

    V_total = Σ_i V_i(position, time)

That is enough to combine, for laboratory experiments,
`EnvironmentalWindField` and `UpdraftField`, and to preserve an exact on-axis
vertical lift oracle.

It is not enough to claim mass-consistent dynamics or a full supercell. Those
claims require separate physics, not a sum operator.
