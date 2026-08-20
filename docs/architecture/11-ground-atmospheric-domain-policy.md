# Ground / Atmospheric Domain Policy

**Status:** architecture SoT. `AtmosphericTracerDomain` is implemented
as an optional `Simulation` lifecycle policy and is wired by
`composeDemoTracerSimulation`. Field sampling remains unbounded.
Explore creation-time seed policy (`18` Slice 2) is
`assertAtmosphericTracerSeed`: finite `x/y/z`, allow `y ≥ 0`,
reject `y < 0`. Crossing semantics in this document are unchanged.
Downdraft DEMO occupancy and live sixth operand:
`docs/rendering/15-composite-downdraft-demo.md`.
No terrain, solver, or `ScenarioConfig` ground field.

This document answers:

```text
What does y = 0 mean, and what (if anything) happens at y < 0?
```

It is the missing policy named by:

- `docs/architecture/02-current-model-assumptions-audit.md` Y20, Y5, G17
- `docs/architecture/09-post-story-view-review.md` §7–§8 item 2
- `docs/architecture/10-composite-continuity-mass-budget-audit.md` §11
  (underground sink recorded; ground plane not set)

It does **not** retune seeds, envelopes, `A_in`, `W0`, or the live
stack. It does **not** design a prescribed downdraft. It does **not**
claim to close the continuity residual in `10`.

Live at the time of this SoT (five-operand snapshot used to decide
the floor). That snapshot’s `Vy_total ≥ 0 everywhere` line is
**historical** and false for the later live stack, which adds
offset downdraft and near-ground outflow (`15`, `21` architecture
checkpoint). Field sampling is still unbounded, and atmospheric
tracers still occupy `y ≥ 0`. The floor policy in this document
is unchanged.

```text
stack then       = EnvironmentalWindField
                   + VerticalEnvelopeUpdraftField
                   + VerticalEnvelopeRotationField
                   + LowerRadialInflowField
                   + UpperRadialOutflowField
frame            = StormRelativeLaboratory
story            = S1 / S2, Euler dt = 0.1 s
Vy of that sum   = Vy_updraft ≥ 0 everywhere
                   (those other operands have Vy ≡ 0)
```

Related:

- `docs/physics/00-coordinate-system.md` §8–§11
- `docs/physics/01-parcel-basics.md` §19–20, §27–29, §32
- `docs/physics/02-velocity-field-basics.md` §35
- `docs/physics/03-numerical-integration-basics.md`
- `docs/physics/04-environmental-wind-profile.md` §8–§9
- `docs/physics/15-vertical-updraft-envelope.md` §6.2, §6.4
- `docs/physics/17-lower-radial-inflow-field.md` §12.3–§12.4
- `docs/physics/18-vertical-rotation-envelope.md` §9.4, §10
- `docs/ARCHITECTURE.md` §5, §13–§16, §25
- `docs/rendering/01-tracer-scene.md` §8
- `docs/rendering/11-deep-storm-tracer-view.md` §13
- `docs/architecture/01-scenario-config.md` (G6: no global domain box)

Homonym, kept distinct everywhere below:

```text
ground-relative wind   = frame vs storm motion C   (03, 19, hodograph)
geometric ground       = the y = 0 datum / tracer bound  (this document)
```

The hodograph remaining ground-relative is **not** a ground plane.

---

## 1. Verdict

**B. Mathematical fields remain sampleable on all finite coordinates.
Atmospheric tracers occupy `y ≥ 0`, with an explicit crossing
policy.**

Not A: `y = 0` is already the coordinate datum and the visual
reference plane. Leaving tracers unbounded would make the next
downward mechanism a live underground exhibit, after which ground
knowledge would leak into the downdraft field (accidental D) or
into every `VelocityField` (accidental C). A is the status quo, not
a decision.

Not C: a global atmospheric-only `VelocityField` domain would force
isolated mathematical primitives to pretend they are atmospheric
objects, break `17`’s plateau tests, `04` clamp tests, negative
`baseHeight` tests, and the Eulerian underground samples in `10`.
Sampling policy G17 stays.

Not D: “each vertical mechanism prevents penetration” scatters a
world-domain rule into envelope math, does not stop Euler overshoot
of a composite, and is not collision physics. Reflection is
rejected with D.

B is chosen because it matches `00` §11 (negative `y` may exist
mathematically; it is not normally atmospheric), keeps primitives
as primitives, and puts parcel-domain exit where `01` §19–20
already said it belongs: tracer lifecycle, not the field formula.

It is **not** chosen because it is the cheapest to implement. A
(do nothing) is cheaper. B costs a future Simulation/path-history
change and is still the right split.

---

## 2. What `y = 0` means **now**

Five concerns currently share the same number and are not the same
object. Do not equate the rendering grid with physical ground.

### 2.1 Coordinate origin / datum

`00` §8–§9, §11:

```text
world origin     = (x, y, z) = (0, 0, 0)
y = 0            = reference ground level  (datum)
y > 0            = above that datum
y < 0            = below that datum
```

The origin is not the updraft center, mesocyclone, or storm
position. DEMO places those at `(x, z) = (0, 0)` by fixture, not by
this datum.

`Vec3` has no ground knowledge. Coordinate transforms map
east/north/altitude; they do not clip altitude.

### 2.2 Rendering reference plane

`GridHelper` in XZ at `y = 0`
(`01-tracer-scene.md` §8, `11-deep-storm-tracer-view.md` §13,
`13-deep-chimney-rendering-scaling.md` §6):

```text
10 km pad, 1000 m cells, y = 0
Reset-time metric ruler
not a physics domain
no terrain, no material, no collision mesh
```

The grid is already *called* a ground-plane helper in rendering
docs, and those same docs forbid treating it as a domain wall.
Visually it looks like the ground. Architecturally it is a ruler
on the datum plane.

### 2.3 Atmospheric lower boundary

**Implemented for tracers only, not as a field domain.** `00` §11
says negative `y` “normally lie outside the atmospheric domain
unless terrain or below-ground visualization is explicitly
implemented.” Atmospheric tracers now occupy `y ≥ 0` when
`Simulation` is given `ATMOSPHERIC_TRACER_DOMAIN`. Velocity fields
still sample every finite `y`.

What *looks* like a lower atmosphere lid is a **named DEMO
coincidence of envelopes**, not a world law:

| Occupant | DEMO `baseHeight` | Behavior at `y = 0` |
| --- | --- | --- |
| `VerticalEnvelopeUpdraftField` | `0` | `F(0) = 0`, so `Vy = 0` |
| `VerticalEnvelopeRotationField` | `0` | `G(0) = 0`, so `V_h,rot = 0` |
| `LowerRadialInflowField` | `1500` | `G = 1` (plateau includes `y = 0` and `y < 0`) |
| `UpperRadialOutflowField` | `5000` | off |
| `EnvironmentalWindProfile` | first knot `0` | surface wind; clamp for `h < 0` |

`15` and `18` state explicitly: `baseHeight` may be negative;
ground `y = 0` is **not** an implicit lid of the type. DEMO chose
`0`. That choice is envelope occupancy, not domain policy.

### 2.4 Tracer integration boundary

**Implemented as optional atmospheric policy.** Isolated
`Simulation` still integrates every `active` particle with no `y`
test. `EulerIntegrator` / `RK2Integrator` still do not clip.

Live DEMO composition (`composeDemoTracerSimulation`) passes
`ATMOSPHERIC_TRACER_DOMAIN` into `Simulation`. Crossing the closed
floor `y = 0` interpolates the accepted segment onto the plane and
sets `active = false` (§6). `createTracersFromSeeds` still starts
`active = true`. Reset (`resetTracersFromSeeds`) still restores
`active = true`.

`01` §19–20 required an explicit policy when a tracer leaves a
valid atmospheric domain. The lower bound of that domain is now
`y ≥ 0` for atmospheric runs only.

`ARCHITECTURE.md` §5 sketches a future finite simulation box
(tens of km horizontally, ~15–20 km vertically). That box is also
unimplemented. This SoT is **not** that box.

### 2.5 Velocity-field sampling boundary

**Unbounded finite coordinates.** `VelocityField.sample(P, t)` is
defined for every finite `P`. Throw-on-out-of-layer was rejected
so `CompositeVelocityField` stays composable (`15` §6.4, `17`
§12.4, `02` §35).

Per-field *envelopes* may return zero outside a band. That is
compact support of an operand, not a world domain:

- updraft / rotation / outflow: `V = 0` outside `[baseHeight, topHeight]`
- lower inflow: `G = 1` for all `y ≤ baseHeight`, including `y → −∞`
- environment: clamp to the nearest knot (`04` §8)

`02` G17 (“unbounded finite `y`; no world-domain particle clamp”)
is still the correct **sampling** policy.

### 2.6 Summary of the present

```text
y = 0 today =
    coordinate datum
  + visual GridHelper plane
  + DEMO envelope lid coincidence (updraft, rotation)
  + first env knot
  + atmospheric tracer floor when Simulation has the policy
  + NOT a VelocityField domain wall
```

Underground occupancy is mathematically real if a particle is
placed or carried there (`02` Y20 + Y5). The live story does not
go there, because the live sum has `Vy ≥ 0` identically.

---

## 3. What `y = 0` means **after** this SoT

The five concerns stay five concerns. Three of them are allowed to
**coincide at the DEMO/world datum** without becoming one object.

```text
coordinate origin:              y = 0 remains the world datum
                                (“reference ground level”, 00 §11)

rendering reference plane:      GridHelper at y = 0 may be called
                                the ground reference plane
                                (still not terrain, not a field domain)

atmospheric lower boundary:     for atmospheric tracers only:
                                y = 0 is the closed lower bound

tracer integration boundary:    y ≥ 0  for atmospheric Simulation
                                (optional policy; see §6 and §14)

velocity-field sampling:        unchanged; all finite y
```

`groundHeight = 0 m` is DEMO/world policy: the atmospheric tracer
floor is the same number as the coordinate datum. It is **not** a
physics primitive, not `groundHeight(x, z)`, not terrain-following
coordinates, and not a new `ScenarioConfig` field.

Do not add `domain.topHeight` or a six-face box in order to have a
floor. `02` G6 (no global `stormTopHeight` / `domain.topHeight`)
stands. Horizontal tracer domain remains unbounded. Upper `y`
remains unbounded for tracers (env clamp above `12000 m` is still
a profile sampling policy, not a parcel lid).

---

## 4. Four policies

### A — Unbounded mathematical world

Fields **and** tracers occupy every finite `y`. The grid is only a
ruler.

| | |
| --- | --- |
| Physical meaning | There is no atmospheric floor. `y < 0` is just more laboratory space. |
| Architecture | Status quo. Primitives stay primitives. |
| Isolated tests | Unchanged. |
| Cost of next downdraft | A downward `Vy` carries live pathlines into the `17` plateau. The underground sink in `10` becomes a Lagrangian exhibit. Pressure to “fix” that inside the downdraft field is immediate. |
| Why not | `00` §11 already distinguished mathematical negative `y` from the atmospheric domain. A is a refusal to finish that sentence. Easiest to ship; wrong once `Vy < 0` exists. |

### B — Sampling unbounded; atmospheric tracers `y ≥ 0`

Fields remain total mathematical functions. Passive atmospheric
tracers are parcels of the laboratory atmosphere and may not occupy
`y < 0`.

| | |
| --- | --- |
| Physical meaning | The atmosphere being traced lives at and above the datum. Eulerian sampling below the datum is still defined (tests, probes, `∇ · V` maps). Lagrangian atmospheric markers are not. |
| Architecture | Adds a tracer-domain policy above primitives. Does not change `VelocityField`, envelopes, or `Vec3`. |
| Isolated tests | Field tests, including `y < 0` and negative `baseHeight`, stay valid. Tracer-domain tests are new and local. |
| Cost of next downdraft | The isolated downdraft primitive can be unbounded. Live pathlines that would cross `y = 0` terminate as domain exit, not as underground inflow. |
| Why | Matches `00` §11, `01` §19–20, G17 sampling, Y20-without-terrain, and `17` §12.3 (“a future domain wall is a separate boundary concern”). |

### C — All atmospheric fields zero/clamp at `y = 0`

`y < 0` leaves the velocity-field domain. Sample-below-zero becomes
an error, a hard zero, or a global clamp.

| | |
| --- | --- |
| Physical meaning | The mathematical laboratory *is* the atmosphere. There is no exterior. |
| Architecture | Every `VelocityField` becomes an atmospheric-domain object. Composite, probes, and FD divergence inherit a wall they did not ask for. |
| Isolated tests | Breaks `17` (`G = 1` for `y ≤ baseHeight`), `04` lower clamp, `15`/`16`/`18` negative `baseHeight`, and `10`’s `y = −500` identity. |
| Why not | Convenience of “nothing underground” purchased by destroying the primitive/atmosphere split. Also still needs a tracer rule for Euler overshoot (`y_n > 0`, `y_{n+1} < 0` during the step). |

### D — Each vertical mechanism vanishes at ground; no global tracer bound

Downdraft (and every later vertical operand) is personally
responsible for `Vy(0) = 0` and for not existing below. Tracers
remain unbounded.

| | |
| --- | --- |
| Physical meaning | Ground is an envelope convention repeated per field, not a parcel domain. |
| Architecture | Ground knowledge leaks into storm types that `15`/`17`/`18` already forbade as implicit lids. A later composite of two downward fields, or Euler overshoot of one field that *does* vanish at `0`, still crosses. |
| Isolated tests | Either primitives grow a hidden `y = 0` special case, or only DEMO wrappers know ground — two APIs for one rule. |
| Why not | No collision physics (`01` §10–11). Reflection is the same family of mistake. A lid at `baseHeight = 0` is a legal **envelope** choice (updraft already has it). It is not a substitute for tracer-domain exit. |

### Comparison (why B is not “whatever is easiest”)

```text
cheapest now:              A
most primitive-preserving: B
most “nothing underground”: C  (wrong layer)
most local to downdraft:   D  (wrong layer, incomplete)
```

B is the only option that lets `LowerRadialInflowField` remain the
`17` plateau primitive **and** lets a live atmospheric pathline
refuse to become an underground tracer.

---

## 5. Where the contract lives

If `y = 0` is the atmospheric tracer floor, the contract is:

```text
AtmosphericTracerDomain
  floor:     y ≥ 0
  datum:     world y = 0  (DEMO/world policy)
  crossing:  §6
```

### Not in `VelocityField`

`sample` stays a total function on finite positions. A domain wall
inside the interface would make every operand atmospheric and
break composition (`02` §35, `15` §6.4).

### Not in individual storm fields

`17` §12.3: the plateau to `−∞` is the envelope family; a future
domain wall is a **separate** concern. `15`/`18`: `baseHeight` may
be negative; `y = 0` is not an implicit lid of the type. DEMO may
still *set* `baseHeight = 0`. That is occupancy, not this contract.

### Not in the integrator

The integrator approximates `x_{n+1}` from `V`. Mixing a world
floor into Euler/RK2 confuses field error, numerical error, and
domain policy (`03`). RK2’s midpoint may legally sample `y < 0`
under B; that is field sampling, not a particle position.

Do not switch integrator in order to have a ground.

### Not only in `ScenarioConfig`

Config is a DTO (`01`). A `groundHeight` field would invite
terrain and `groundHeight(x, z)` without a consumer. v1 does not
add it. The number is the world datum `0`.

Seeds with `y < 0` are currently legal at the DEMO/scenario
finite-only boundary. Explore creation-time validation
(`assertAtmosphericTracerSeed`, `18` Slice 2) now rejects
non-finite coordinates and `y < 0` before `Simulation` sees the
seed. Future DEMO validation **may** reuse that helper. That is a
scenario-boundary check, not the runtime crossing contract
itself.

### Not in `Vec3` / coordinate transforms

`00` conversion helpers map axes. They must not clip altitude.

### Canonical owner

```text
policy SoT:     this document
lifecycle:      Simulation  (owns particles, active, step)
application:    live atmospheric DEMO / App composition
not applied:    VelocityField.sample, Integrator, storm primitives
```

`Simulation` is the lifecycle owner (`ARCHITECTURE.md` §16,
`01` §19–20). Isolated mathematical primitives stay unaware.

The floor is **not** hard-wired into every `Simulation`. Legal
shape used:

- optional `tracerDomain` on `Simulation`, wired by DEMO composition;
- helper `applyAtmosphericTracerDomain` called only when that
  policy is present.

Default for isolated integrator/field tests: **no tracer floor**
(G17). Default for live atmospheric tracers
(`composeDemoTracerSimulation`): **this policy**.

Eulerian probes, field inspectors, and finite-difference audits
sample the field, not the tracer domain. They may sit at `y < 0`.

---

## 6. Boundary behavior of tracers

Question: if atmospheric tracers must not occupy `y < 0`, what
happens on a step that would cross?

Assume Euler (live): `y_{n+1} = y_n + Vy_n dt`. Domain is closed:
`y = 0` is allowed; `y < 0` is not.

### Candidates

| Behavior | Physical reading | Pedagogical reading | Verdict |
| --- | --- | --- | --- |
| Clamp `y` to `0`, keep `active` | Free-slip wall without a wall. Horizontal `V` still acts. | Parcel skating on the dirt. Live composite at `y = 0` still has full lower-inflow plateau + surface env (`Vy = 0` today). Infinite ground-skater. | **Rejected** |
| Clamp `y` to `0` and zero downward `Vy` only | Same skater; `Vy` was already `0` on the current stack at `y = 0`. Future downdraft would be stripped while inflow remains. | Looks like a boundary layer we do not have. | **Rejected** |
| Reflect `Vy → −Vy` | Collision / bounce. | Bouncing air. No collision physics (`01` §10–11). | **Rejected** |
| Recycle / wrap / respawn | Visualization management, not a ground law. | Hidden teleport. `01` §20 forbids silent wrap. | **Rejected** as ground policy |
| Stop integrating; leave last interior point (`y_n > 0`) | Domain exit before the plane. | Pathline ends in mid-air a few metres up. Honest-ish; visually weaker once a ground plane is named. | Allowed fallback, not canonical |
| Interpolate the accepted segment onto `y = 0`, write that position, set `active = false` | The marker left the atmospheric domain at the datum. Air does not cease to exist (`01` §19). The **pathline** ends. | Trail ends on the ground reference plane. Glyph may remain or hide as a render detail. No skating. | **Canonical** |

Canonical crossing:

```text
if y_n ≥ 0 and y_{n+1} < 0:
  place the particle at the linear crossing of the accepted
  segment with y = 0
  particle.active = false
  do not integrate further
```

Linear interpolation along the **accepted** `P_n → P_{n+1}`
segment is exact for that Euler (and RK2-accepted) chord. It is
**not** a root-finding event solver, not sub-stepping, and not an
integrator change.

`y_{n+1} = 0` exactly: remain `active` (closed domain). Next step
with `Vy < 0` will cross and deactivate.

Edge cases locked from this predicate, not from new physics:

| Case | Behavior |
| --- | --- |
| Start `y = 0`, proposed `y < 0` | Crossing at `α = 0`. Stay at `P0` with `y = 0`, `active = false`. |
| Proposed endpoint `y = 0` | Not a crossing. Accept, stay `active`. |
| Already inactive | `Simulation.step` skips the particle. Domain is not applied. |
| Horizontal step along `y = 0` (`Vy = 0`) | Both ends on the floor. Stay `active`. Skating is existing field `V_h`, not a wall. |
| Signed zero `−0` | `y < 0` is false. In-domain. Floor writes canonical `+0`. |
| Multiple tracers | Per-particle. A crossing neighbor does not change the others. |
| Start already `y < 0` | Not a crossing (`y_n ≥ 0` fails). No snap. Seed-below-zero validation remains the §5 gap, not this runtime rule. |

Reset restores seeds and `active = true` (`02-tracer-runtime-controls.md`).
Deactivation is session state, not a ScenarioConfig change.

### Path history / renderer

`TracerPathHistory.recordAfterStep` appends a particle that **became
inactive on this recorded step** and still skips a particle that
was already inactive. The recorder is ground-unaware: it compares
the last observed `active` flag to the current one. The terminal
accepted position (for a domain crossing: interpolated `(x, 0, z)`)
is stored once.

`TracerScene` still hides inactive meshes (`mesh.visible = p.active`).
Whether a terminal glyph stays visible on `y = 0` is a later
renderer decision, not this contract.

Live S1/S2 never deactivate (`Vy ≥ 0`), so current trails are
unchanged. Hiding a marker is not mass disappearance (`01` §27–28).

### What this is not

Stopping at the datum is **pathline / domain-exit semantics**.
It is not a no-flux wall, not mass accumulation, not a pressure
response, and not return-flow closure. See §12.

---

## 7. Current lower inflow

`LowerRadialInflowField` (`17`):

```text
G(y) = 1     for all y ≤ baseHeight
```

including `y → −∞`. DEMO `baseHeight = 1500 m`, so the plateau
covers the entire half-space below `1500 m`, underground included.

### Is the underground plateau a production defect?

**No.** It is the documented envelope family of a mathematical
primitive (`17` §10.2, §12.3). The laboratory sentence is: below
the taper start, prescribed inflow does not weaken further. Compact
support downward was rejected because it is the wrong lid for this
mechanism and because `G = 0` below `y_b` plus `G(y_b) = 1` is a
horizontal velocity jump.

It becomes a **live exhibit defect** only if atmospheric tracers
occupy `y < 0` and copy treats that occupancy as atmosphere. They
do not, today (`Vy ≥ 0`). After B, they still must not.

`10`’s underground sink (`∇ · V = −2 A_in` on the axis for `y < 0`)
is an Eulerian identity of the prescribed sum. It is not a tracer
bug and not a reason to rewrite `17`.

### Options (this SoT’s choice)

| Option | Verdict |
| --- | --- |
| Leave the primitive as `17` | **Canonical** |
| Change the primitive (compact downward / new `G`) | Forbidden here. Would silently break §17. Reopen only with a physics SoT for a different envelope family. |
| Restrict only DEMO/domain sampling | Rejected. Sampling stays G17. DEMO probes may still sample `y < 0`. |
| Atmospheric wrapper around inflow | Not now. A wrapper would be C-for-one-operand. B makes it unnecessary for tracers. |
| Call underground behavior irrelevant after tracer bound | **For live pathlines, yes.** For the field identity and tests, no — they remain. |

Y5 (`02`) is reaffirmed as a primitive fact, not “fixed” by this
document. The revisit trigger “ground plane or downdraft” is
answered: **do not change `G`**. Change the tracer domain.

---

## 8. Environment below `0`

`EnvironmentalWindProfile` (`04` §8): `h < h_min` returns
`wind(h_min)`. DEMO `h_min = 0`.

This remains the correct **isolated profile** sampling contract:
explicit support, no silent extrapolation, clamp to the nearest
knot.

It does **not** mean “the atmosphere exists underground.” `04` §8
already forbids that reading. `02` G5: diagnostics must not treat
clamped continuation as observed atmosphere. The same honesty
applies below `h_min` as above `h_max`.

After B, live atmospheric tracers never sample the below-zero
clamp. Tests and probes still may. Do not rewrite the profile for
ground semantics.

A profile whose first knot is not `0` remains legal (`04` §5).
The tracer floor is still world `y = 0`, not “first knot.” Those
are different objects that DEMO currently aligns.

---

## 9. Story / diagnostic consequences

Live App: D1 `(5000, 1000, 0)` (`12`).
StoryPathlines (explicit): S1 `(0, 1000, 4000)`, S2 `(0, 1000, 6000)` (`08`).
Diagnostic trio (not the live App occupants): axis / east / north
at `y = 1000`.

Live stack vertical velocity:

```text
Vy_env = Vy_rot = Vy_in = Vy_out = 0
Vy_up  ≥ 0
Vy_total ≥ 0 everywhere
```

Therefore no current tracer can decrease `y`. Documented S1/S2
extrema (`08`, `10`): `y0 = 1000`, `max y ≈ 7000–7044 m`. Minimum
`y` on those pathlines is the seed height.

S3 `(0, 750, 3000)` (recorded, not canonical) also only ascends.

A tracer **seeded at** `y = 0` today would already skate
horizontally (inflow plateau + surface env, `Vy = 0`). Current
seeds are not on the plane. This SoT does not retune seeds.

```text
current live StoryPathlines: numerically unchanged
even if B were implemented tomorrow
no seed retune
```

Diagnostic probes, if shown, also start at `y = 1000` with
`Vy ≥ 0`. Unchanged.

---

## 10. Numerical integration

Live: Euler, `dt = 0.1 s`. Do not switch integrator.

Current stack: no downward step, so no overshoot. Future
prescribed downdraft with `Vy < 0` above the floor:

```text
penetration per accepted Euler step ≈ |Vy| dt
```

Characteristic teaching speeds, not a profile design:

| `|Vy|` | penetration at `dt = 0.1 s` |
| --- | --- |
| 5 m/s | 0.5 m |
| 10 m/s | 1 m |
| 30 m/s (`W0` order) | 3 m |
| 50 m/s | 5 m |

Versus chimney depth `H_up = 8000 m` and grid cell `1000 m`, that
is `O(10⁻³)` of the storm and invisible as a mesh, but a last
sample a few metres below a named ground plane is a domain lie.

Canonical response: linear crossing onto `y = 0` (§6). That is
O(1) arithmetic on the accepted segment.

Not required now:

- exact event detection / CVODE-style roots;
- sub-stepping;
- integrator change;
- RK2-specific midpoint clipping (midpoint `y < 0` is legal
  **sampling** under B).

IEEE-754: test `y < 0`. Signed zero `−0` compares equal to `0` and
stays in-domain. Do not use `Object.is` for the floor.

---

## 11. Rendering

After this policy, the XZ `GridHelper` at `y = 0` may honestly be
called:

```text
ground reference plane
```

It is still:

- a metric ruler (`13` §6, `11` §13);
- coincident with the coordinate datum and the tracer floor;
- **not** terrain, topography, ground material, or a collision mesh;
- **not** a `VelocityField` domain.

`ARCHITECTURE.md` §25 `GroundLayer` remains a future visual layer,
not this slice. Do not add heightmaps.

Copy must not say the grid *is* the atmospheric model. The grid
*marks* the datum that atmospheric tracers treat as their floor.

---

## 12. Continuity anti-claims

`10` measured an uncompensated underground sink from lower inflow
and left ground policy unset. This document sets the tracer floor.
It does **not** pay the continuity debt.

If a future tracer deactivates at `y = 0`:

```text
this IS:     boundary / pathline semantics
             (01 §19–20; this SoT §6)

this IS NOT: mass accumulation at the ground
             a no-flux continuity condition
             a pressure response
             return-flow closure
             evidence that ∇ · V = 0
             the missing lower lid of 17
```

Forbidden readings, inherited from `10` §10 and tightened here:

- tracers piling up on the grid are not density (`01` §27–28);
- stopping a pathline is not `w = 0` as a fluid-boundary condition
  for the field (the field still has whatever `Vy` it has at `y = 0⁺`);
- the underground Eulerian sink in `10` remains if you sample
  `y < 0`; live pathlines simply do not occupy it;
- a future downdraft is still an independent prescribed operand,
  not the return of S1/S2 air (`10` verdict A).

YELLOW continuity stays YELLOW. Ground policy is not a solver.

---

## 13. Requirements on a future prescribed downdraft

This section is a **constraint list**, not a profile. Do not read
numbers, bounds, or envelope family here.

| Question | Answer |
| --- | --- |
| May its vertical envelope reach `y = 0`? | Yes, as an envelope occupancy choice (same status as updraft/rotation DEMO lids). Not required by this SoT. |
| Must `Vy_down(0) = 0`? | **Not as domain policy.** A compact lid with `F(0) = 0` is a legal envelope, like `15`. Domain exit does not need it. |
| Must the peak lie above ground? | Envelope SoT later. Domain policy is silent. |
| Is `Vy < 0` immediately above ground allowed? | **Yes.** That is how a parcel approaches the floor. |
| Who prevents crossing? | `AtmosphericTracerDomain` via `Simulation`, not the downdraft type. |
| May the isolated primitive exist mathematically at `y < 0`? | **Yes.** Same G17 sampling as siblings. Compact support below a lid is envelope math, not ground knowledge. |
| Must the isolated primitive know about ground? | **No.** It may have `baseHeight` that DEMO sets to `0`. It must not special-case “the ground.” |
| Does a vanishing-at-zero envelope replace B? | No. That is D. Euler overshoot and composite `Vy` still need the tracer rule. |
| Continuity claim? | Independent operand + `10` anti-claims. Existence ≠ RED. “Return of this air” = RED. Stopping at the floor ≠ mass return. |

The downdraft field must not be sold as the ground-collision
engine, the no-flux solver, or the continuity closure.

---

## 14. Future contract (B)

Not implemented in this slice.

```text
field sampling domain:      unbounded finite coordinates
atmospheric tracer domain:  y ≥ 0
groundHeight:               0 m
                            (DEMO/world datum coincidence;
                             not a physics primitive;
                             not ScenarioConfig;
                             not groundHeight(x, z))
crossing behavior:          interpolate accepted segment onto y = 0;
                            write position; active = false
field behavior y < 0:       unchanged (17 plateau, 04 clamp,
                            compact zeros of 15/16/18)
current story impact:       none (Vy ≥ 0; y_min = y0 = 1000 m)
downdraft requirement:      isolated primitive remains unbounded
                            and ground-unaware; live atmospheric
                            tracers that would cross y = 0
                            terminate per this contract;
                            10 anti-claims remain
enforcement owner:          Simulation lifecycle, optional policy
                            (`ATMOSPHERIC_TRACER_DOMAIN`), wired by
                            composeDemoTracerSimulation;
                            isolated Simulation default: none
path history:               became-inactive appends once;
                            already-inactive still skips;
                            live S1/S2 do not deactivate;
                            recorder is ground-unaware
Reset:                      restores seeds and active = true
probes / FD / field tests:  may sample y < 0
horizontal / upper y:       unbounded (G6 stands)
```

`particle.active` is already the deactivate hook (`01` §37).
Renderer hide-on-inactive is existing convenience, not physics.

---

## 15. Stale-assumption audit

Places that already assign meaning to `y = 0`, ground, domain,
below-zero, or underground. This SoT does **not** mass-edit them.
They should be read through B.

| Location | What it currently says | After this SoT |
| --- | --- | --- |
| `00` §8–§11 | `y = 0` reference ground; negative `y` mathematical; “normally outside atmospheric domain” | **Fulfilled for tracers.** Sampling stays mathematical. No terrain. |
| `ARCHITECTURE.md` §5 | Future finite simulation box | Still unimplemented. This SoT is only the lower tracer bound, not that box. |
| `ARCHITECTURE.md` §25 | Future `GroundLayer` | Visual layer later. Not this policy. |
| `01` parcel §19–20 | Domain-exit policy required; deactivate/remove/recycle | Lower-bound policy is now: interpolate + deactivate. |
| `02` velocity §35 | Field domain must be explicit | Field domain remains “all finite positions.” Tracer domain is separate. |
| `02` assumptions G17 | Unbounded finite `y`; no particle clamp; GREEN for sampling | Sampling GREEN stands. Particle floor is this document, atmospheric runs only. |
| `02` G5 | Diagnostic domain ≠ advection clamp | Unchanged; also applies below `h_min`. |
| `02` G6 | No global `domain.topHeight` | Unchanged. Do not invent a box to have a floor. |
| `02` Y5 | Inflow plateau to `−∞`; YELLOW | Primitive reaffirmed. Not a defect. Live pathlines must not occupy it. |
| `02` Y6 | Profile clamp at `0` and `12000` | Unchanged isolated contract. |
| `02` Y20 | No ground plane; revisit at downdraft/terrain/visual ground | **No terrain / no collision mesh.** Tracer floor + named ground reference plane, this document. |
| `03` wind-tunnel | `y = 0` is reference ground; grid is laboratory floor glued to the storm in SR mode | Datum + SR laboratory floor. Still not D3 translating ground. Homonym with ground-relative wind unchanged. |
| `04` env profile | Clamp below first knot; first knot need not be `0` | Unchanged. Clamp ≠ underground atmosphere. |
| `15` updraft envelope | `y = 0` reference ground; `baseHeight` may be negative; not an implicit lid | Unchanged type contract. DEMO lid at `0` remains occupancy. |
| `17` lower inflow §12.3 | Plateau to `−∞` is synthetic; future domain wall is separate | **This is that separate concern.** It does not live in `17`. |
| `18` rotation envelope | Compact support kills the underground tube of height-independent rotation | Envelope job, not domain policy. Underground rotation is already off in DEMO; underground **inflow** is not. |
| `01` scenario-config | No domain box; heights on knots / envelopes / renderer | Do not add `groundHeight` to the DTO in v1. |
| `08` story seeds | S1/S2 at `y = 1000`, only ascent | Numerically unaffected. |
| `09` post-story §7–§8 | Ground/underground OPEN; next after continuity | Continuity is `10`. Tracer-domain **implementation** is this document’s production follow-up. |
| `10` continuity §11 | Underground sink YELLOW; “this audit does not set a ground plane” | Identity stands. Plane/floor set here for **tracers**, not as a flux condition. |
| `01-tracer-scene` §8 | Grid is debug framing, not a physical domain | Still not a field domain. May be called ground reference plane. |
| `02-tracer-runtime-controls` | Reset restores seeds / `t = 0` | Reset also restores `active`; required once deactivation exists. |
| `11-deep-storm-tracer-view` §13 | “ground-plane GridHelper”; “not a physics domain” | Compatible. Name: ground reference plane. |
| `13` rendering scaling | Ground grid is a metric ruler | Compatible. |
| Live tests (`demoCompositeUpdraft…`) | `atGround` = sample `{y: 0}`; negative `baseHeight` factories | Envelope/lid language, not domain enforcement. Keep. |
| `TracerParticle.active` / `TracerScene` hide | Hook unused for domain | `active = false` after atmospheric crossing. Hide-on-inactive is still render convenience. |
| `composeDemoTracerSimulation` | Five-operand Simulation, no `y` floor | Wires `ATMOSPHERIC_TRACER_DOMAIN`. Does not add downdraft. |
| Hodograph “ground-relative” | Frame name | Unrelated to this floor. |

No production comments or copy were patched in this slice.

---

## 16. Compact lock-in

```text
verdict:                 B

y=0 semantics:           world datum
                         + ground reference plane (renderer)
                         + closed lower bound of atmospheric
                           tracer domain
                         NOT a VelocityField domain wall
                         NOT terrain / collision / topography
                         NOT an implicit lid of every primitive
                         (DEMO updraft/rotation lids at 0 remain
                          envelope occupancy)

field sampling domain:   all finite coordinates  (G17)

tracer domain:           y ≥ 0 for atmospheric tracers
                         (live DEMO / App)
                         horizontal and upper-y unbounded

crossing behavior:       interpolate accepted segment to y = 0;
                         write position; active = false
                         NOT clamp-and-skate
                         NOT reflect
                         NOT Vy projection as a wall

lower-inflow below zero: 17 primitive unchanged
                         G = 1 for y ≤ baseHeight, including −∞
                         not a production defect of the type
                         live pathlines must not occupy it

environment below zero:  04 clamp unchanged
                         not “atmosphere underground”
                         G5 still forbids clamp-as-observation

downdraft constraint:    isolated primitive unbounded and
                         ground-unaware; may lid at 0 as envelope;
                         Vy < 0 above ground allowed;
                         Vy_down(0) = 0 not required by domain;
                         Simulation prevents crossing;
                         10 anti-claims; not a flux solver

renderer/grid semantics: ground reference plane
                         (ruler on the datum; not a field domain)

continuity claim:        none. 10 residual unchanged.
                         deactivate ≠ mass accumulation
                         ≠ no-flux ≠ return flow

current story impact:    none. Vy ≥ 0; S1/S2 y_min = 1000 m.
                         no seed retune.

implementation required
before downdraft?:       tracer domain is implemented for
                         atmospheric Simulation. Isolated
                         downdraft primitive exists (`20`).
                         Live downdraft wiring is still later.
                         Terminal path-history sample is implemented.
```

---

## 17. Can prescribed downdraft be designed next?

Isolated prescribed-downdraft physics and primitive already exist
(`docs/physics/20-vertical-downdraft-envelope.md`).

**Live DEMO composition that can produce `Vy < 0` near `y = 0` is
now architecturally allowed** because `Simulation` applies this
tracer domain in `composeDemoTracerSimulation`. It is **not**
wired in this slice.

The terminal path-history sample on a deactivating step is
implemented (`TracerPathHistory` records became-inactive once).
A downward live exhibit is still not shown: no crossing seeds, and
inactive glyphs remain hidden. Renderer/trails visual policy for a
terminal marker is a later decision.

Order:

```text
this SoT                         done
prescribed downdraft physics SoT done (`20`)
isolated downdraft primitive     done
AtmosphericTracerDomain in
  Simulation                     done
path-history terminal sample     done
live DEMO + downdraft            wired (`15`)
```

---

## 18. STOP

`AtmosphericTracerDomain` is a Simulation lifecycle policy.
VelocityField sampling is unchanged.
Live downdraft occupant/wiring: `docs/rendering/15-composite-downdraft-demo.md`.
No terrain.
No `ScenarioConfig.groundHeight`.
No integrator change.
No seed retune.
No continuity solver.

Y20 is answered as an atmospheric tracer floor, not as a mesh.
Y5 is reaffirmed, not rewritten.
`10` remains the continuity SoT.
