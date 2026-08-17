# Composite Vertical Envelope Rotation Demo

**Status:** this document is the live DEMO **occupant/wiring SoT** for
`VerticalEnvelopeRotationField` in the rotation slot. Live composition
is now seven operands; the sixth (downdraft) occupant is
`docs/rendering/15-composite-downdraft-demo.md`; the seventh
(near-ground outflow) occupant is
`docs/rendering/16-composite-near-ground-outflow-demo.md`. This document still
owns evolved `storm.rotation`, `createRotationField`, DEMO rotation
bounds `[0, 6500]`, and seed confirmation.
Live `σ` / `Ω` / seed metres: `docs/architecture/06-deep-chimney-scaling-demo-retune.md`.

After this slice:

- this document owns the current rotation occupant, the evolved
  `storm.rotation` DTO, `createRotationField`, DEMO rotation bounds,
  seed confirmation, anti-oracle rules, and the 3D/hodograph boundary;
- `docs/rendering/10-deep-storm-envelope-scaling.md` remains the deep
  envelope geometry **before** localized rotation (live updraft /
  inflow / outflow numbers; historical rotation-tube decision A);
- `docs/rendering/11-deep-storm-tracer-view.md` remains the live
  default view fixture;
- `docs/rendering/08-composite-lower-radial-inflow-demo.md` remains
  the historical five-operand introduction and the axis/east/north
  seed **layout**;
- `docs/rendering/09-deep-environmental-profile-demo.md` remains the
  environmental-knot SoT.

Physics formula of the new occupant:
`docs/physics/18-vertical-rotation-envelope.md`.

---

## 1. Purpose

This document defines the next browser DEMO integration: the same
five-operand laboratory, with the rotation slot replaced by the
already-implemented compact vertical envelope.

It answers:

    How does one ScenarioConfig drive
    EnvironmentalWindField + VerticalEnvelopeUpdraftField
    + VerticalEnvelopeRotationField + LowerRadialInflowField
    + UpperRadialOutflowField
    → CompositeVelocityField
    into the existing Simulation and Three.js tracer scene, replacing
    height-independent RotationField, without adding a sixth operand,
    without dual rotation mode, and without changing hodograph
    semantics, camera, or seeds?

Physics formulas remain those of:

- `docs/physics/04-environmental-wind-profile.md`
- `docs/physics/12-composite-velocity-field.md`
- `docs/physics/15-vertical-updraft-envelope.md`
- `docs/physics/16-upper-radial-outflow-field.md`
- `docs/physics/17-lower-radial-inflow-field.md`
- `docs/physics/18-vertical-rotation-envelope.md`

`docs/physics/13-rotation-field.md` remains the isolated
height-independent circulation primitive. It is **not** a live-DEMO
occupant after the implementation slice.

This document owns **wiring**, DEMO rotation vertical bounds, DTO
evolution of `storm.rotation`, factory retargeting, seed confirmation,
overlap with the `10` envelopes, anti-claims, and the boundary between
the 3D composite field and the 2D hodograph.

It is **not**:

- a mesocyclone;
- a tilting or stretching result;
- environmental-vorticity-derived rotation;
- a dynamically generated vortex;
- a sixth operand;
- a renderer / camera / seed rewrite.

The sum remains controlled laboratory composition of five already
documented `VelocityField` mechanisms.

---

## 2. Architectural decision: replace, do not add

Current live DEMO
(`docs/rendering/08-composite-lower-radial-inflow-demo.md` wiring,
`docs/rendering/10-deep-storm-envelope-scaling.md` geometry):

```text
EnvironmentalWindField
+ VerticalEnvelopeUpdraftField
+ RotationField
+ LowerRadialInflowField
+ UpperRadialOutflowField
→ CompositeVelocityField
```

### Option A — replace the DEMO rotation occupant

```text
RotationField
→
VerticalEnvelopeRotationField
```

Future live DEMO:

```text
EnvironmentalWindField
+ VerticalEnvelopeUpdraftField
+ VerticalEnvelopeRotationField
+ LowerRadialInflowField
+ UpperRadialOutflowField
```

Operand count remains five.

### Option B — add a sixth operand

Keep `RotationField` and add `VerticalEnvelopeRotationField`.

Rejected. Both share the same radial family. Their horizontal
velocities would add:

```text
v_theta = Ω r E (1 + G(y))
```

Consequences:

- at `y_mid`, peak tangential speed becomes twice the named `Ω`
  without renaming `angularVelocity`;
- outside `[baseHeight, topHeight]`, the old field still supplies
  full `Ω r E`, so the tube never actually ends;
- the lesson of this slice (circulation off below and above a chosen
  layer) is cancelled.

This is the same rejection as `06` (do not keep `UpdraftField` beside
`VerticalEnvelopeUpdraftField`) and `08` (do not keep
`RadialInflowField` beside `LowerRadialInflowField`).

### Decision: A

DEMO is a controlled laboratory overlay, not a stack of every physics
type that exists. `RotationField` stays as an isolated primitive with
its own tests. Live DEMO uses exactly one rotation occupant.

Do not introduce a combined storm-field type.
Do not add a feature flag that selects `RotationField` vs
`VerticalEnvelopeRotationField`.

---

## 3. Composition chain

```text
DEMO_SCENARIO (ScenarioConfig)
├─ createEnvironmentalWindProfile(config)
│    → EnvironmentalWindProfile
│    → EnvironmentalWindField
├─ createUpdraftField(config)
│    → VerticalEnvelopeUpdraftField
├─ createRotationField(config)
│    → VerticalEnvelopeRotationField
├─ createLowerRadialInflowField(config)
│    → LowerRadialInflowField
└─ createUpperRadialOutflowField(config)
     → UpperRadialOutflowField

app composition (composeDemoTracerSimulation):
  CompositeVelocityField([
    environmentField,
    updraftField,                 // VerticalEnvelopeUpdraftField
    rotationField,                // VerticalEnvelopeRotationField
    lowerRadialInflowField,
    upperRadialOutflowField,
  ])
  → tracerSeeds → TracerParticle[]
  → Simulation (fixed timestep + Euler)
  → existing Three.js tracer scene (observe particle.position only)
```

Operand order keeps the rotation slot. The occupant’s physics type
changes. The sum is still component-wise and commutative for ordinary
finite values; order is documentation/readability, not a physical
interaction rule.

Do not assemble `CompositeVelocityField` inside `src/scenario/`.
Do not invent `createScenarioRuntime`.
Do not construct `RotationField` in the live DEMO path.

Hodograph path (unchanged, profile-only):

```text
DEMO_SCENARIO
  → createEnvironmentalWindProfile(config)
  → hodographPoints / shear / vorticity / SRH overlays
  → HodographPanel
```

`VerticalEnvelopeRotationField`, the enveloped updraft, lower inflow,
upper outflow, and `CompositeVelocityField` must **not** feed hodograph
geometry or environmental diagnostics.

---

## 4. Scenario DTO

### 4.1 Variant A — evolve `storm.rotation`

Current:

```ts
interface ScenarioRotation {
  centerX: number;
  centerZ: number;
  angularVelocity: number;
  sigma: number;
}
```

`VerticalEnvelopeRotationField` needs two additional plain numbers.
v1 extends that same block:

```ts
interface ScenarioRotation {
  centerX: number;                 // m, world +X
  centerZ: number;                 // m, world +Z
  angularVelocity: number;         // rad/s
  sigma: number;                   // m
  baseHeight: number;              // m, world +Y; lower lid, G = 0
  topHeight: number;               // m, world +Y; upper lid, G = 0
}
```

Required after this slice:

```ts
storm: {
  updraft: ScenarioUpdraft;
  rotation: ScenarioRotation;                 // now vertically structured
  lowerRadialInflow: ScenarioLowerRadialInflow;
  upperRadialOutflow: ScenarioUpperRadialOutflow;
}
```

Meaning, half-sine `G(y)`, Gaussian-linear tangential profile,
right-hand `+Y` sign, and constraints (`sigma > 0`,
`topHeight > baseHeight`, all finite; `angularVelocity` may be `0`
or negative) are owned by `VerticalEnvelopeRotationField` /
`docs/physics/18-vertical-rotation-envelope.md`.
The scenario layer stores plain numbers only.

`baseHeight` / `topHeight` on this DTO are **zero lids**, the same
semantic as `storm.updraft` and `storm.upperRadialOutflow`, **not**
the plateau-top meaning of `storm.lowerRadialInflow`.

### 4.2 Variant B — keep old `storm.rotation`, add a second block

For example `storm.verticalEnvelopeRotation` beside `storm.rotation`.

Rejected.

That path is correct only if live DEMO kept both physics types. It
does not. A second block would be either:

- dead configuration (`storm.rotation` unused), or
- a dual-rotation API that option A in §2 already rejected.

There is no second live DEMO that still consumes height-independent
`storm.rotation`. Isolated `RotationField` tests construct the physics
type directly and do not need a scenario DTO.

This is the `06` updraft pattern, not the `08` inflow pattern.
`08` introduced `storm.lowerRadialInflow` because physics `17`
required a dedicated block and the previous DTO was a **different
name** (`storm.radialInflow`) for a different occupant.
Physics `18` does **not** require a new scenario block. The DEMO
rotation **slot** is the same occupant with a compact `G(y)`.

### 4.3 Decision: Variant A

```text
evolve storm.rotation
do not add a second rotation block
do not keep a height-independent current-DEMO DTO
do not add a rotation mode / kind / envelope flag
```

DTO modules remain physics-import-free.

### 4.4 Naming lock-in

| Layer | Name |
| --- | --- |
| Physics type (DEMO occupant) | `VerticalEnvelopeRotationField` |
| Physics primitive (not DEMO) | `RotationField` |
| Scenario DTO block | `storm.rotation` |
| Scenario DTO type | `ScenarioRotation` |
| Scenario factory | `createRotationField` |

The factory name stays `createRotationField` because it still maps
the existing `storm.rotation` slot. It does **not** become a generic
class-switching factory. After this slice it value-imports only
`VerticalEnvelopeRotationField`.

There is still no shared `storm.center`.
`stormMotion` remains a top-level sibling (hodograph / diagnostics
only).

`createRotationField` must read `config.storm.rotation`. It must
**not** copy `centerX` / `centerZ` / `sigma` / `baseHeight` /
`topHeight` from `storm.updraft`, `storm.lowerRadialInflow`, or
`storm.upperRadialOutflow`.

---

## 5. Scenario factory

```text
createRotationField(config: ScenarioConfig)
  → VerticalEnvelopeRotationField
```

Behavior:

1. read `config.storm.rotation` plain numbers
   (`centerX`, `centerZ`, `angularVelocity`, `sigma`,
   `baseHeight`, `topHeight`);
2. construct `new VerticalEnvelopeRotationField({ ... })`;
3. let `VerticalEnvelopeRotationField` enforce physical invariants.

Do not:

- construct `RotationField` and multiply by `G(y)` in the factory;
- accept a `kind` / `envelope` flag;
- re-validate `topHeight > baseHeight` in the scenario layer;
- assemble the composite;
- copy bounds from any other `storm.*` block.

Validation failures surface as `VerticalEnvelopeRotationFieldError`.

`createUpdraftField`, `createLowerRadialInflowField`, and
`createUpperRadialOutflowField` are unchanged in this slice.

---

## 6. Vertical bounds — research

`docs/physics/18-vertical-rotation-envelope.md` owns the envelope
family:

```text
G(y) = sin(π (y − baseHeight) / (topHeight − baseHeight))
       on [baseHeight, topHeight], else 0
y_mid = (baseHeight + topHeight) / 2
G(baseHeight) = G(topHeight) = 0
G(y_mid) = 1
```

It does **not** own DEMO lid numbers. This section does.

Live deep geometry (`10`, `11`):

```text
environment explicit support   0–12000 m
updraft                        0–8000 m, peak 4000 m
lower inflow                   plateau y ≤ 1500 m, taper to 4500 m, zero y ≥ 4500 m
upper outflow                  5000–9000 m, peak 7000 m
rotation occupant today        height-independent RotationField, Ω = 0.02
sigma                          1000 m
centers                        (0, 0) fixture
diagnostic seeds               y = 1000 m
default view frame             0–10000 m
```

Constraints used below:

- do **not** copy updraft `[0, 8000]` automatically;
- do not put new lids on knots `1000`, `2000`, `6000`, `12000`
  (ground `0` is the existing named coincidence);
- do not create a functional identity `G_rot(y) ≡ F_updraft(y)`;
- keep current seeds as useful probes ⇒
  `baseHeight < 1000 < topHeight` and `G_rot(1000) > 0`;
- compact support must kill the underground tube (`y < 0`) and the
  env-only tube above the storm (`y > 9000`);
- the interval must not be a thin mid-level slab;
- `Ω`, `sigma`, and centers stay frozen (`§8`);
- independent DTO numbers are a fixture, not an API coupling (`Y16`).

### 6.1 Candidate A — coincide with updraft

```text
baseHeight = 0
topHeight  = 8000
y_mid      = 4000
G_rot(y)   = sin(π y / 8000) = F_updraft(y)
G_rot(1000) = sin(π/8) ≈ 0.383
```

| Question | Answer |
| --- | --- |
| `G(seed y = 1000)` | `0.383` |
| initial rotation vs current DEMO | `38%` of the height-independent `Ω` contribution |
| rotation max | `4000 m` (same as updraft peak) |
| overlap with lower inflow | `0 < y < 4500` |
| overlap with updraft | identical interval |
| overlap with upper outflow | `5000–8000` |
| upper / lower lids | same as updraft: ground and `8000 m` |
| seed reachability | yes, interior |
| hidden mid-level slab? | no; this is the whole updraft column |

**Rejected.**

The failure is stronger than “two numbers match”. The half-sine on
the same interval makes

```text
G_rot(y) ≡ F_updraft(y)
```

for every `y`. That is a hidden formula coupling. Teaching copy would
read the rotation as “the updraft’s spin”. `10` forbade treating
coincident DEMO numbers as physics. Copying the entire envelope
function is worse.

### 6.2 Candidate B — mid/deep column starting above inflow base

Literal reading of “starts above lower inflow `baseHeight = 1500`”:

```text
examples: [1500, 6500], [1500, 7000], [2000, 7000]
G_rot(1000) = 0
```

| Question | Answer |
| --- | --- |
| `G(seed y = 1000)` | `0` (at or below the lower lid) |
| initial rotation vs current DEMO | none |
| rotation max | `4000` or `4250` or `4500` depending on the pair |
| overlap with lower inflow | only the taper, or none if start is `2000` |
| overlap with updraft | mid/upper updraft only |
| overlap with upper outflow | depends on the top |
| seed reachability | **no** — east/north cease to be rotation probes at Reset |
| hidden mid-level slab? | risk: a band that begins above the diagnostic layer |

**Rejected for this slice.**

Keeping the current three seeds is preferred (`§9`, `10` §17).
`G_rot(1000) = 0` would change the seed contract only because of the
new envelope. That is the opposite of the probe policy.
`[1500, 6500]` also puts `y_mid` on the updraft peak.

A milder “start above ground, end around outflow” (`[500, 7000]`)
still weakens seeds (`G ≈ 0.239`) and reuses the stale toy
`500 m` from the old `0–2 km` inflow. Not needed.

### 6.3 Candidate C — span most of the storm, not ground, not world

Viable round interval with `G(0) = 0` and compact support:

```text
[0, 8500]   y_mid = 4250   G_rot(1000) ≈ 0.361
[0, 9000]   y_mid = 4500   G_rot(1000) ≈ 0.342
```

`[0, 9000]` is rejected: `y_mid = 4500` is the inflow-zero lid.

`[0, 8500]` would kill the underground tube and the env-only tube,
keep seeds interior, and stagger the upper zeros
(`8000` updraft, `8500` rotation, `9000` outflow).

**Rejected.**

`H = 8500` is a 6% stretch of the updraft `H = 8000`. Through the
mid-column `G_rot ≈ F` (`G_rot(4000) ≈ 0.996`, `F(4000) = 1`).
The lid offset of `500 m` is a fig leaf over Candidate A, not an
independent envelope. “Do not copy updraft `[0, 8000]`” includes
not shipping a near-copy.

### 6.4 Candidate D — geometry-driven compact column

The two leaks the tube actually creates after `10`:

- `y < 0`: full plateau inflow + full rotation;
- `y > 9000`: environment + full rotation, every other storm
  mechanism off.

Fixing those leaks requires compact support with a lower lid at or
above ground and an upper lid at or below the storm-active top.
It does **not** require matching the updraft interval.

Among round intervals with `baseHeight = 0` and a `y_mid` that is
not `4000` / `4500` / `5000` / `7000`:

| Interval | `y_mid` | `G_rot(1000)` | Verdict |
| --- | --- | --- | --- |
| `[0, 5500]` | `2750` | `0.541` | Rejected: more mid-only; ends as outflow starts |
| `[0, 6500]` | `3250` | `0.465` | **Accepted** |
| `[0, 7500]` | `3750` | `0.407` | Rejected: `y_mid` too close to `4000`; `G_rot(4000) ≈ 0.995` |

```text
baseHeight = 0 m
topHeight  = 6500 m
y_mid      = 3250 m
H          = 6500 m
G_rot(y)   = sin(π y / 6500)   on [0, 6500], else 0
G_rot(1000) = sin(π / 6.5) ≈ 0.4647
```

| Question | Answer |
| --- | --- |
| `G(seed y = 1000)` | `sin(π/6.5) ≈ 0.465` |
| initial rotation vs current DEMO | `≈ 46.5%` of the height-independent contribution; **conscious**, not a retune of `Ω` |
| rotation max | `3250 m` (inflow taper + strong updraft; no outflow) |
| overlap with lower inflow | `0 < y < 4500` (full plateau and most of the taper) |
| overlap with updraft | `0 < y < 6500` (through and past updraft peak; off `1500 m` before the updraft lid) |
| overlap with upper outflow | `5000 < y < 6500` (outflow onset only; **off before outflow peak**) |
| lower lid | `G = 0` at ground; `G = 0` for `y < 0` (underground tube gone) |
| upper lid | `G = 0` at `6500 m`; env-only aloft has **no** rotation |
| seed reachability | yes, interior; east/north signs unchanged |
| hidden mid-level slab? | no; `H = 6500 m` is `81%` of the updraft column and `72%` of storm-active `0–9000`. It is a compact tube, not a `2 km` band |

### 6.5 Why this interval, in one place

1. **Not the updraft envelope.** `G_rot ≇ F`. Tests can distinguish
   them at `1000`, `3250`, `4000`, `6500`, and `8000`.
2. **`y_mid = 3250` is unique** versus updraft peak `4000`, inflow
   zero `4500`, outflow start `5000`, outflow peak `7000`, and knots.
3. **Lids are not knots.** `0` is the existing ground coincidence
   (named, like updraft). `6500` sits `500 m` above knot `6000`,
   which remains interior (`G_rot(6000) ≈ 0.239`).
4. **Seeds stay probes.** `G_rot(1000) > 0`. East/north cardinal
   decomposition survives, scaled.
5. **Both tube leaks die.** Underground rotation is off. Above
   `6500 m` — including `9000–12000` — rotation is off.
6. **Wide enough** that the interval is not a named mid-level slab.
7. **Upper-outflow overlap is real but not a coupling.** Rotation is
   still on at outflow onset (`G_rot(5000) ≈ 0.663`) and off at
   outflow peak. That is a fixture, not “spin becomes spreading”.
   The factory must not read outflow bounds.

`baseHeight = 0` does **not** mean rotation at the ground.
`G(0) = 0`. Sharing the ground lid with the updraft is a named
DEMO coincidence, the same class as shared centers (`10` §12).

Do not describe `0–6500 m` as a mesocyclone, a rotating updraft
core, or a mid-level vortex layer.

---

## 7. Chosen DEMO rotation envelope

```text
baseHeight = 0 m
topHeight  = 6500 m
y_mid      = 3250 m
H          = 6500 m
G(y)       = sin(π y / 6500)   if 0 ≤ y ≤ 6500
G(y)       = 0                 otherwise
```

On-axis envelope samples of `G` (isolated rotation field; `Vy = 0`
everywhere):

```text
y (m)     G_rot
   < 0    0
     0    0          // lower lid
  1000    0.465      // seeds; sin(π/6.5)
  1500    0.663
  2000    0.823
  3250    1          // maximum
  4000    0.935      // updraft peak; not rotation max
  4500    0.823      // inflow off
  5000    0.663      // outflow on
  6000    0.239      // env knot, interior, not a lid
  6500    0          // upper lid
  > 6500  0
```

At `y = y_mid` the isolated field is identical to `RotationField`
with the same `Ω`, `σ`, and center (`18` §19). That identity is a
physics fact at one height. It is **not** a reason to keep
`RotationField` in the composite.

---

## 8. Ω, sigma, centers

Unchanged from `10`:

```text
centerX = 0 m
centerZ = 0 m
angularVelocity Ω = 0.02 rad/s
sigma = 1000 m
```

Peak tangential speed at envelope maximum (`G = 1`, `r = σ`):

```text
|v_theta|_max = |Ω| σ / √e ≈ 12.13 m/s
```

Same peak as today’s height-independent occupant. There is **no**
hidden normalization of `G`. Do **not** raise `Ω` because seeds sit
below `y_mid`.

At seed radius `r = 600 m`:

```text
E_r = exp(−0.18) ≈ 0.8353
|v_theta|(y=1000) = Ω r E_r G_rot(1000)
                  ≈ 10.02 × 0.4647
                  ≈ 4.66 m/s
```

Today’s DEMO has `G = 1` at every height, so the same point has
`≈ 10.02 m/s`. The reduction is the envelope evaluated at the
diagnostic height. It is accepted. It is not a picture retune.

Shared DEMO centers remain a fixture, not `storm.center`.
Shared `sigma = 1000 m` remains the chimney laboratory (`10` §13).

---

## 9. Seeds

Current three seeds (`04` / `08` / `10`):

```text
(0,    1000,  0)     // axis
(600,  1000,  0)     // east, r = 600 m
(0,    1000, -600)   // north, r = 600 m
```

**Keep these three.** Do not move them to `y_mid = 3250`. Do not add
story tracers.

### 9.1 `G_rot` at seed height

```text
G_rot(1000) = sin(π / 6.5) ≈ 0.4647
```

Interior. Not a lid. Not the maximum.

### 9.2 East / north diagnostic decomposition

For `Ω > 0` and `G > 0`, isolated rotation cardinals (`18` §13.3)
still hold, scaled by `G_rot(1000)`:

| Seed | Rotation contribution |
| --- | --- |
| axis `(0, 1000, 0)` | `(0, 0, 0)` at every height |
| east `(600, 1000, 0)` | `Vx = 0`, `Vy = 0`, `Vz < 0` (northward) |
| north `(0, 1000, −600)` | `Vx < 0` (westward), `Vy = 0`, `Vz = 0` |

Signs are unchanged from the height-independent DEMO. Magnitudes
scale by `G_rot(1000)`. Lower inflow at this height is still
`G_in = 1` (westward on the east seed, southward on the north seed).
The orthogonal split **rotation vs inflow** remains a useful Reset
probe. Outflow remains `G_out(1000) = 0`.

Do not change seeds only because `G_rot(1000) ≠ 1`.
Do not add a particle at `y = 3250` in this slice.

---

## 10. Vertical overlap table

Envelopes are sampled **simultaneously**. This table is **not** a
state machine. All five operands sum at every point.

```text
F       = updraft half-sine on [0, 8000]
G_in    = 1 for y ≤ 1500; quarter-cosine taper to 0 at 4500
G_rot   = half-sine on [0, 6500]
G_out   = half-sine on [5000, 9000]
env     = piecewise-linear knots, clamp outside [0, 12000]
```

```text
height band (m)     G_in    F       G_rot   G_out   environment segment
y < 0               1       0       0       0       clamp to knot 0
0                   1       0       0       0       knot 0
0 – 1000            1       rising  rising  0       0–1 km
1000                1       0.383   0.465   0       knot 1000 (seeds)
1000 – 1500         1       rising  rising  0       1–2 km
1500                1       0.556   0.663   0       1–2 km (inflow taper start)
1500 – 2000         taper   rising  rising  0       1–2 km
2000                0.966   0.707   0.823   0       knot 2000
2000 – 3250         taper   → 1     → 1     0       2–6 km
3250                0.609   0.957   1       0       2–6 km (rotation max)
3250 – 4000         taper   → 1     decay   0       2–6 km
4000                0.259   1       0.935   0       2–6 km (updraft max)
4000 – 4500         → 0     ~0.98   decay   0       2–6 km
4500                0       0.981   0.823   0       2–6 km (inflow off)
4500 – 5000         0       ~0.95   ~0.74   0       2–6 km  ← radial-quiet; rotation still on
5000                0       0.924   0.663   0       2–6 km (outflow on)
5000 – 6000         0       decay   decay   rising  2–6 km
6000                0       0.707   0.239   0.707   knot 6000 (interior, not a lid)
6000 – 6500         0       decay   → 0     → 0.92  6–12 km
6500                0       0.556   0       0.924   6–12 km (rotation off)
6500 – 7000         0       decay   0       → 1     6–12 km
7000                0       0.383   0       1       6–12 km (outflow peak)
7000 – 8000         0       → 0     0       decay   6–12 km
8000                0       0       0       0.707   6–12 km (updraft lid; outflow still on)
8000 – 9000         0       0       0       decay   6–12 km
9000                0       0       0       0       6–12 km (outflow off)
9000 – 12000        0       0       0       0       6–12 km  ← env only; no rotation tube
y > 12000           0       0       0       0       clamp to knot 12000
```

Readable bands (still not a state machine):

| Pedagogical reading | Approximate `y` |
| --- | --- |
| Underground tube gone | `y < 0` (`G_rot = 0`, `G_in = 1`) |
| Rotation turns on | just above `0` |
| Seeds: full inflow, partial rotation, partial lift | `1000 m` |
| Rotation maximum | `3250 m` |
| Updraft maximum; rotation still strong | `4000 m` |
| Inflow gone; rotation still on; no outflow | `4500–5000 m` |
| Outflow begins; rotation decaying | `5000 m` |
| Rotation off | `≥ 6500 m` |
| Outflow strongest; rotation already off | `7000 m` |
| Updraft off; outflow still on; rotation off | `8000 m` |
| Outflow off; env only | `≥ 9000 m` |

Allowed overlaps / gaps, chosen on purpose:

- rotation **does** overlap lower inflow and the lower/mid updraft;
- rotation **does** overlap outflow onset (`5000–6500`);
- rotation is **off** at outflow peak (`7000`);
- rotation is **off** above the updraft lid (already off at `6500`);
- the `10` inflow/outflow gap `4500–5000` remains; rotation still
  occupies it;
- no new storm lid sits on knots `1000`, `2000`, `6000`, or `12000`.

Do not narrate this as inflow → spin-up → outflow. The operands
sum. A tracer does not “enter a rotation stage”.

---

## 11. Anti-claims

`VerticalEnvelopeRotationField` in this DEMO is still **not**:

- a mesocyclone;
- a tornado;
- a tilting result;
- a stretching result;
- environmental-vorticity-derived rotation;
- a dynamically generated vortex;
- a storm-relative vortex;
- a pressure/buoyancy couple.

It is a **prescribed height-localized circulation** about a fixed
world `+Y` axis:

```text
Vx = Ω E G(y) dz
Vy = 0
Vz = −Ω E G(y) dx
```

Canonical DEMO copy must **not** use:

- “mesocyclone”;
- “mesocyclone layer”;
- “rotating updraft”;
- “tilted vorticity”;
- “stretched vortex”;
- “deep convection core”.

Allowed: “height-localized prescribed rotation”, “compact vertical
rotation envelope”, “laboratory circulation column”.

`docs/physics/13` §15 and `docs/physics/18` §20 remain in force.

---

## 12. Curl / diagnostics / hodograph

The new occupant has vertical structure, so `G'(y)` produces
horizontal vorticity terms (`18` §18.3):

```text
(ω_x, ω_z) = −Ω G'(y) E (dx, dz)
```

Those terms are the curl of a prescribed window. They are **not**:

- environmental `HorizontalVorticity` from
  `docs/physics/06-horizontal-vorticity.md`;
- tilting evidence;
- a reason to change SRH.

Hodograph remains `EnvironmentalWindProfile` only.

Mutating `storm.rotation` — including the new `baseHeight` /
`topHeight` — must **not** change hodograph points, overlay
`[0, 1000]`, or SRH.

Do not:

- add `omegaVertical` to `HorizontalVorticity`;
- plot rotation-envelope vorticity on the hodograph;
- expose `curl()` on the DEMO occupant;
- treat lid jumps in `ω_h` as environmental shear.

---

## 13. Continuity

`VerticalEnvelopeRotationField` is divergence-free (`18` §18.1):

```text
∇ · V_rotation = 0
```

identically, including at the lids and outside the layer.

Replacing the tube with a localized column does **not** repair and
does **not** break the continuity residual of the other operands.
`VerticalEnvelopeUpdraftField` still has `∂Vy/∂y ≠ 0`.
Radial inflow/outflow still have `div_h ≠ 0`.

```text
V_total = Σ independently prescribed fields
```

Do not bind `Ω`, bounds, or `sigma` to `A_in`, `A_out`, or `W0`.
The prescribed stack remains prescribed.

---

## 14. Wind-tunnel

Unchanged from `10` §11 / audit Y15:

```text
environment = ground-relative
storm fields = fixed world centers
C is diagnostic only; not subtracted in 3D
```

Rotation localization is **not** a solution to wind-tunnel
sweep-out. The three diagnostic seeds still sit at `y = 1000 m`
with `|V_env| ≈ 15.8 m/s` and will not climb the deep column.

Do not:

- subtract `C` in 3D;
- translate Gaussians with `C`;
- move the rotation axis;
- introduce a storm-relative spatial frame;
- claim that compact `G(y)` keeps particles in the core.

---

## 15. Rendering

Deep view is already live (`11`).

Do **not** change:

- camera position / target;
- FOV / near / far;
- marker size;
- grid;
- axes;
- view range `0–10000 m`.

The new rotation operand affects **particle trajectories only**.
`TracerScene` continues to observe `particle.position`.

Do **not** draw:

- a vortex tube;
- a rotation envelope mesh;
- a storm-axis pole;
- a `0–6500 m` highlight.

`11` §14 already rejected a vertical spine because it would look
like a rotation-tube visualization. That ban stays after the tube
is no longer the field.

---

## 16. Integration tests

Focused **wiring** tests. Do **not** duplicate isolated `18`
sampling, divergence, lid `G'`, or circular-oracle tracer
acceptance.

Required after implementation:

1. **DTO → `VerticalEnvelopeRotationField`.**
   `createRotationField(DEMO_SCENARIO)` constructs that type.
   Axis rest; lids `V = 0` off-axis at `y = 0` and `y = 6500`;
   `G = 1` identity with `RotationField` at `y = 3250` for the
   same radial parameters (wiring freeze of the DEMO numbers, not
   a re-test of `18`).
2. **Factory reads only `storm.rotation`.**
   Mutating updraft / inflow / outflow centers, `sigma`, and
   bounds does not change the rotation sample.
   Factory source does not mention `storm.updraft`,
   `storm.lowerRadialInflow`, or `storm.upperRadialOutflow`.
3. **Old `RotationField` is not a live DEMO operand.**
   `composeDemoTracerSimulation` source does not import
   `RotationField`. `createRotationField` source value-imports
   `VerticalEnvelopeRotationField` only.
4. **Operand count remains 5.**
5. **Composite sample = sum of the five current operands**
   at seeds, lids, `y_mid`, knots, and exterior heights
   (including `y < 0` and `y > 9000`).
6. **Rotation contribution zero below/above the layer.**
   Off-axis `y < 0`, `y > 6500` (include `8000`, `9000`, `12000`).
7. **Rotation zero on lids.**
   Off-axis `y = 0` and `y = 6500`.
8. **Rotation max at `y_mid = 3250`.**
   Off-axis `|V|` at `3250` exceeds `|V|` at `1000` and at `4000`
   for the same `(x, z)`.
   Peak `|v_theta|` at `r = σ`, `y = 3250` equals `|Ω| σ / √e`.
9. **Cardinals at one active interior height.**
   At `y = 3250` (where `G = 1`): east `Vz < 0`, north `Vx < 0`,
   `Vy = 0`.
10. **`G_rot(1000)` freeze.**
    `sin(π/6.5)`; east seed `Vz` scales by that factor versus the
    `y_mid` sample at the same `r`.
11. **Axis rotation contribution zero** at seed height, `y_mid`,
    lids, and exterior.
12. **Qualitative fixed-step trajectory** of the live composite:
    near-axis `y` rises; horizontal drift nonzero. **No** circle
    oracle, no isolated-`18` `Ω_eff` map, no calm-env closed form.
13. **Reset** restores the three seed positions and `clock.time = 0`.
14. **Hodograph invariant** under mutation of `storm.rotation`
    including `baseHeight` / `topHeight` / `Ω` / `sigma`.
15. **Scenario DTO remains physics-import-free.**
    `ScenarioConfig.ts` and `DEMO_SCENARIO.ts` import no physics.
    `createRotationField.ts` value-imports
    `VerticalEnvelopeRotationField`.

Existing DEMO-contract tests that currently assume height-independent
rotation **must be updated**, not kept as regressions of the tube:

- off-axis `y = −50`: rotation contribution becomes **zero**
  (inflow plateau and env remain);
- above outflow top: composite horizontal = **environment only**
  (rotation no longer accompanies env aloft);
- any assertion that rotation at seed height equals the
  height-independent `Ω r E` sample.

Do not add continuity identities.
Do not add a curl / `HorizontalVorticity` assertion on this field.
Do not add a deep-ascent story-tracer oracle.

---

## 17. Historical docs and ownership after implementation

```text
08  historical five-operand introduction + seed layout
09  environmental knots 0–12000 m
10  deep envelope geometry before localized rotation
    (live updraft / inflow / outflow bounds;
     historical rotation-tube decision A)
11  live deep tracer view
12  this document — current rotation occupant / wiring SoT
15  live sixth operand (downdraft occupant / wiring)
18  physics of VerticalEnvelopeRotationField
13  isolated height-independent RotationField primitive
```

Minimal pointer updates belong with this SoT. Full DTO rewrite of
`docs/architecture/01-scenario-config.md` (factory return type,
`ScenarioRotation` fields, validation owner) belongs in the
**implementation** slice, when the code matches.

Do not mass-edit `03`–`07` historical DEMO docs.
Do not rewrite physics derivations in `13` / `18`.

---

## 18. Explicit non-goals

Do not start in this SoT or in its wiring slice:

- tilting;
- stretching;
- mesocyclone / tornado claims;
- environmental-vorticity coupling;
- downdraft;
- continuity solver;
- story tracers / particle cloud;
- storm-relative 3D;
- moving axis / subtracting `C`;
- rendering polish / camera / grid / glyphs;
- vortex-tube or envelope mesh;
- `Ω` / `sigma` / center / seed retune;
- Hann / Gaussian-in-`y` / plateau rotation envelope;
- evolving `RotationField` into a dual-mode API;
- a generic `VerticalEnvelope` wrapper;
- `createScenarioRuntime`;
- strength retune of `W0` / `A_in` / `A_out`;
- Bunkers;
- `curl()` API.

---

## 19. Compact lock-in

```text
current rotation operand:     VerticalEnvelopeRotationField
                              (after implementation; replacement, not a sixth operand)
old RotationField status:     isolated height-independent primitive;
                              not a live-DEMO occupant; not deleted
DTO strategy:                 Variant A — evolve storm.rotation
                              with baseHeight / topHeight;
                              no second block; no dual mode
factory:                      createRotationField
                              → VerticalEnvelopeRotationField
                              (same name; value-import the new type)
center:                       (0, 0) m   // DEMO fixture, not API coupling
sigma:                        4000 m     // 06; independent DTO field, equal by fixture
angularVelocity:              0.005 rad/s // 06 frozen-peak policy
baseHeight:                   0 m        // zero lid; named ground coincidence with updraft
topHeight:                    6500 m     // zero lid; not a knot; not another mechanism’s lid
y_mid:                        3250 m
G(seed y):                    G_rot(1000) = sin(π/6.5) ≈ 0.4647
overlap with inflow:          0 < y < 4500
overlap with updraft:         0 < y < 6500  (G_rot ≇ F)
overlap with outflow:         5000 < y < 6500  (off at outflow peak)
seeds:                        (0,1000,0), (2400,1000,0), (0,1000,−2400)
                              // 06; layout still axis/east/north at y=1000, r=0.6σ
current composite operands:
  EnvironmentalWindField
  + VerticalEnvelopeUpdraftField
  + VerticalEnvelopeRotationField
  + LowerRadialInflowField
  + UpperRadialOutflowField
continuity impact:            none; this operand stays div-free;
                              other residuals unchanged; stack stays prescribed
hodograph impact:             none
renderer impact:              none (trajectories only; no tube mesh;
                              11 view fixture unchanged)
```

---

## 20. Blocking decisions

None.

Bounds, DTO, factory, seeds, `Ω` / `sigma` / centers, tests, and
doc ownership are locked above. Isolated `18` is already
implemented. View fixture `11` does not need to move.

---

## 21. Core lesson

Live DEMO replaces the height-independent rotation tube with a
compact half-sine column that is off underground and off aloft:

```text
G_rot(y) = sin(π y / 6500)    on [0, 6500], else 0
Vx = 0.02 E G_rot dz
Vy = 0
Vz = −0.02 E G_rot dx
```

That column is **not** the updraft envelope, **not** a mid-level
vortex, and **not** a mesocyclone. Seeds at `y = 1000 m` remain
lower-level probes with `G_rot ≈ 0.465`. Hodograph, camera, and
operand count do not change. `RotationField` remains the isolated
primitive.

---

## 22. Implementation slice (code)

**Done.** Live DEMO rotation occupant is `VerticalEnvelopeRotationField`
via `createRotationField`. The recipe below is the completed slice,
not a pending command.

No production change in the research slice that wrote this document.

When commanded, one vertical **wiring** slice:

### 22.1 Change

- `src/scenario/ScenarioConfig.ts` — add `baseHeight` / `topHeight`
  to `ScenarioRotation`; point comments at
  `VerticalEnvelopeRotationField` / `18` for meaning and validation.
- `src/scenario/DEMO_SCENARIO.ts` — set
  `storm.rotation.baseHeight = 0`, `topHeight = 6500`.
  Do **not** edit env knots, `stormMotion`, centers, `sigma`, `Ω`,
  other storm bounds, seeds, or `timestep`.
- `src/scenario/createRotationField.ts` — value-import
  `VerticalEnvelopeRotationField`; map all six DTO numbers; return
  that type.
- `src/app/composeDemoTracerSimulation.ts` — comment/occupant name
  only; still call `createRotationField` in the same slot.
  Operand count stays 5. Do not import `RotationField`.
- `src/app/App.tsx` — copy only if it still implies a
  height-independent tube; allowed wording:
  “vertically structured rotation”. Forbidden: mesocyclone /
  tilting / stretching.
- `src/simulation/demoCompositeUpdraft.integration.test.ts` —
  tests in §16; update tube assumptions called out there.
- `docs/architecture/01-scenario-config.md` — DTO shape, factory
  return type, validation owner, composition chain, relationship
  pointer to this document as current occupant SoT.

### 22.2 Do not change

- `RotationField` type or formula;
- `VerticalEnvelopeRotationField` formula (already implemented);
- updraft / inflow / outflow DTO blocks and factories;
- `TracerScene` / `DEEP_STORM_TRACER_VIEW`;
- integrator / `dt` / seeds;
- hodograph overlay `[0, 1000]`;
- isolated physics unit tests and isolated `18` tracer acceptance.

### 22.3 Docs during implementation

- this document: status → live occupant after the code lands;
- `08`: five-operand **introduction** remains historical; current
  rotation occupant is this document;
- `10`: rotation-tube decision A remains that generation’s choice;
  live occupant is this document;
- `11`: view unchanged; ban on drawing a rotation envelope stays;
- `18`: live DEMO occupant is `VerticalEnvelopeRotationField` with
  bounds owned here.

### 22.4 Verify and stop

```text
npm test
npm run typecheck
STOP
```

### Files expected to change

- `src/scenario/ScenarioConfig.ts`
- `src/scenario/DEMO_SCENARIO.ts`
- `src/scenario/createRotationField.ts`
- `src/app/composeDemoTracerSimulation.ts`
- `src/app/App.tsx` (copy only, if needed)
- `src/simulation/demoCompositeUpdraft.integration.test.ts`
- `docs/architecture/01-scenario-config.md`
- status lines on `08` / `10` / `11` / `18` / this document

### Files not to touch

- `src/physics/storm/VerticalEnvelopeRotationField.ts` formulas;
- `src/physics/storm/VerticalEnvelopeRotationField.test.ts`;
- `src/simulation/verticalEnvelopeRotationFieldTracer.acceptance.test.ts`;
- `src/physics/storm/RotationField.ts` and its isolated tests;
- `src/rendering/**`;
- `src/ui/**` except app copy if it lives in `App.tsx`;
- hodograph modules;
- other storm factories.
