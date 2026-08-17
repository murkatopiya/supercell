# Composite Lower Radial Inflow Demo

**Status:** this document owns the historical five-operand
**introduction** and the axis/east/north seed **layout**. Current
rotation occupant / wiring is
`docs/rendering/12-composite-vertical-envelope-rotation-demo.md`.
Live sixth operand (downdraft) is
`docs/rendering/15-composite-downdraft-demo.md`.
Live seventh operand (near-ground outflow) is
`docs/rendering/16-composite-near-ground-outflow-demo.md`.
Live storm-envelope **geometry** (before localized rotation) is
specified in
`docs/rendering/10-deep-storm-envelope-scaling.md`. Environmental
knots `0–12000 m` remain
`docs/rendering/09-deep-environmental-profile-demo.md`. The
`[0, 2000]` / `[500, 1500]` / `[1000, 2000]` numbers in the body of
this document are this slice's **historical** fixture.
Live seed metres (`r = 0.6σ = 2400 m`):
`docs/architecture/06-deep-chimney-scaling-demo-retune.md`.
Live particles come from `simulation.diagnosticSeeds` (same
axis/east/north metres). Canonical story seeds are stored on
`storySeeds` (`docs/architecture/08-story-seeds.md`) and are not
the live teaching view.

## 1. Purpose

This document defines the current browser DEMO integration that advects
tracers under mathematical composition of environmental wind, a
height-dependent half-sine updraft, a controlled Gaussian-modulated
rotation field, a height-localized lower radial inflow field, and a
compact upper-level radial outflow field.

It answers:

    How does one ScenarioConfig drive
    EnvironmentalWindField + VerticalEnvelopeUpdraftField
    + RotationField + LowerRadialInflowField + UpperRadialOutflowField
    → CompositeVelocityField
    into the existing Simulation and Three.js tracer scene, replacing
    the height-independent RadialInflowField operand, without changing
    physics formulas of the remaining fields or hodograph semantics?

Physics formulas remain those of:

- `docs/physics/04-environmental-wind-profile.md`
- `docs/physics/12-composite-velocity-field.md`
- `docs/physics/13-rotation-field.md`
- `docs/physics/15-vertical-updraft-envelope.md`
- `docs/physics/16-upper-radial-outflow-field.md`
- `docs/physics/17-lower-radial-inflow-field.md`

`docs/physics/14-radial-inflow-field.md` remains the isolated
height-independent inward primitive. It is **not** a live-DEMO
operand after this slice.

This document owns **wiring**, the historical DEMO lower-inflow
vertical bounds of this slice, seed confirmation, the fate of
`storm.radialInflow`, anti-oracle rules, and the boundary between
the 3D composite field and the 2D hodograph. Live envelope numbers
are `docs/rendering/10-deep-storm-envelope-scaling.md`.

It is **not** a supercell, PBL, continuity-solved storm, or
pressure-driven model. The sum is controlled laboratory composition of
five already documented `VelocityField` mechanisms.

Next DEMO generation for the environmental profile (deeper explicit
knots, same `EnvironmentalWindProfile` primitive, storm envelopes
then still the historical `08` fixture) is owned by
`docs/rendering/09-deep-environmental-profile-demo.md`. Live
storm-envelope bounds after that freeze are owned by
`docs/rendering/10-deep-storm-envelope-scaling.md`. This document
still owns five-operand wiring, seeds, and anti-oracle rules.

---

## 2. Architectural decision: replace, do not add

Current live DEMO before this slice
(`docs/rendering/07-composite-upper-radial-outflow-demo.md`):

```text
EnvironmentalWindField
+ VerticalEnvelopeUpdraftField
+ RotationField
+ RadialInflowField
+ UpperRadialOutflowField
```

### Option A — replace the DEMO inflow operand

```text
RadialInflowField
→
LowerRadialInflowField
```

New live DEMO:

```text
EnvironmentalWindField
+ VerticalEnvelopeUpdraftField
+ RotationField
+ LowerRadialInflowField
+ UpperRadialOutflowField
```

Operand count remains five.

### Option B — add a sixth operand

```text
... + RadialInflowField + LowerRadialInflowField + UpperRadialOutflowField
```

### Option C — evolve `storm.radialInflow` with extra bounds

Keep the same DTO block and the same factory, add `baseHeight` /
`topHeight`, construct `LowerRadialInflowField`.

### Decision: A

Option B is forbidden by `docs/physics/17-lower-radial-inflow-field.md`
§30. Both inflow types share the same radial family. Their horizontal
velocities would add:

```text
v_r = -A_old r E - A_new r E G_in(y)
    = -A r E (1 + G_in(y))
```

Consequences:

- on the plateau, peak inward strain becomes `2A` without renaming
  `radialStrainRate`;
- above `topHeight`, the old field still supplies `-A r E`, so the
  new mechanism never actually ends aloft;
- the lesson of this slice (inflow localized below a chosen top) is
  cancelled by the height-independent primitive.

DEMO is a controlled laboratory overlay, not a stack of every physics
type that exists. `RadialInflowField` stays as an isolated primitive
with its own tests. Live DEMO uses exactly one inflow occupant.

Option C would overload `storm.radialInflow` with a different physics
type. §17 already requires a dedicated `storm.lowerRadialInflow`
block. Height-independent and height-localized inflow are different
occupants, following the `UpdraftField` /
`VerticalEnvelopeUpdraftField` split.

Do not introduce a combined storm-field type. Do not run both inflows
at once.

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
│    → RotationField
├─ createLowerRadialInflowField(config)
│    → LowerRadialInflowField
└─ createUpperRadialOutflowField(config)
     → UpperRadialOutflowField

app composition (composeDemoTracerSimulation):
  CompositeVelocityField([
    environmentField,
    updraftField,                 // VerticalEnvelopeUpdraftField
    rotationField,
    lowerRadialInflowField,       // LowerRadialInflowField (replacement)
    upperRadialOutflowField,
  ])
  → tracerSeeds → TracerParticle[]
  → Simulation (fixed timestep + Euler)
  → existing Three.js tracer scene (observe particle.position only)
```

Operand order keeps the inflow slot. The occupant’s physics type
changes. The sum is still component-wise and commutative for ordinary
finite values; order is documentation/readability, not a physical
interaction rule.

Do not assemble `CompositeVelocityField` inside `src/scenario/`.
Do not invent `createScenarioRuntime`.
Do not add a feature flag that selects `RadialInflowField` vs
`LowerRadialInflowField`.

Hodograph path (unchanged, profile-only):

```text
DEMO_SCENARIO
  → createEnvironmentalWindProfile(config)
  → hodographPoints / shear / vorticity / SRH overlays
  → HodographPanel
```

`LowerRadialInflowField`, the enveloped updraft, rotation, upper
outflow, and `CompositeVelocityField` must **not** feed hodograph
geometry or environmental diagnostics.

---

## 4. Scenario DTO

### Decision: new `storm.lowerRadialInflow` block; remove `storm.radialInflow`

This is a new physics occupant, not a mode of height-independent
inflow. `docs/physics/17-lower-radial-inflow-field.md` §30 already
requires a dedicated block. Do **not** extend `storm.radialInflow`
with `baseHeight` / `topHeight`.

```ts
interface ScenarioLowerRadialInflow {
  centerX: number;              // m, world +X
  centerZ: number;              // m, world +Z
  radialStrainRate: number;     // 1/s
  sigma: number;                // m
  baseHeight: number;           // m, world +Y; plateau top / taper start
  topHeight: number;            // m, world +Y; G = 0 at and above
}
```

Required after this slice:

```ts
storm: {
  updraft: ScenarioUpdraft;
  rotation: ScenarioRotation;
  lowerRadialInflow: ScenarioLowerRadialInflow;
  upperRadialOutflow: ScenarioUpperRadialOutflow;
}
```

Meaning, plateau + quarter-cosine `G_in(y)`, `radialStrainRate` as
near-axis strain on the plateau, and constraints
(`radialStrainRate > 0`, `sigma > 0`, `topHeight > baseHeight`, all
finite) are owned by `LowerRadialInflowField` /
`docs/physics/17-lower-radial-inflow-field.md`.
The scenario layer stores plain numbers only.

`baseHeight` on this DTO is the **plateau top / taper start**
(`G = 1` at and below), not a zero lid. That semantic difference from
`storm.updraft.baseHeight` and `storm.upperRadialOutflow.baseHeight`
is owned by §17 §16.1. The identifier stays `baseHeight`.

### Naming lock-in

| Layer | Name |
| --- | --- |
| Physics type | `LowerRadialInflowField` |
| Scenario DTO block | `storm.lowerRadialInflow` |
| Scenario DTO type | `ScenarioLowerRadialInflow` |
| Scenario factory | `createLowerRadialInflowField` |

Rejected aliases: `storm.inflow`, `storm.radialInflow` (that name is
the retired height-independent block), `storm.lowerInflow` (omits
radial), `taperStartHeight` as a DTO field.

`ScenarioConfig` DTO modules remain physics-import-free.
`createLowerRadialInflowField` lives in `src/scenario/`,
value-imports `LowerRadialInflowField`, maps plain DTO numbers, and
delegates physical validation to that constructor.

The factory must read `config.storm.lowerRadialInflow`. It must
**not** copy `centerX` / `centerZ` / `sigma` / `baseHeight` /
`topHeight` from `storm.updraft`, `storm.rotation`, or
`storm.upperRadialOutflow`.

There is still no shared `storm.center`.

`stormMotion` remains a top-level sibling (hodograph / diagnostics
only).

Existing `storm.updraft`, `storm.rotation`, and
`storm.upperRadialOutflow` blocks are unchanged.

### Fate of `storm.radialInflow`

Current required ScenarioConfig surface includes
`storm.radialInflow` / `ScenarioRadialInflow` only because the live
DEMO constructs `RadialInflowField`.

Real callers of that block / factory in `src/`:

| Caller | Role |
| --- | --- |
| `composeDemoTracerSimulation` | current DEMO inflow occupant |
| `demoCompositeUpdraft.integration.test.ts` | current DEMO wiring tests |
| `createRadialInflowField.ts` | the factory itself |

Isolated `RadialInflowField` unit and tracer-acceptance tests
construct the physics type directly. They do not read ScenarioConfig.

After this replacement there is no remaining current-DEMO or other
production caller for height-independent inflow parameters.

**Decision: remove `storm.radialInflow` and `ScenarioRadialInflow`
from the current required ScenarioConfig surface.**

Keeping the dead block would preserve a DTO that current DEMO no
longer uses. That is rejected.

Do **not** keep both inflow blocks “for later experiments”. A later
non-DEMO scenario that wants height-independent inflow can reintroduce
a DTO in a dedicated slice. Isolated physics does not need one.

---

## 5. Scenario factory

```text
createLowerRadialInflowField(config: ScenarioConfig)
  → LowerRadialInflowField
```

Path:

```text
src/scenario/createLowerRadialInflowField.ts
```

Behavior:

1. read `config.storm.lowerRadialInflow` plain numbers
   (`centerX`, `centerZ`, `radialStrainRate`, `sigma`,
   `baseHeight`, `topHeight`);
2. construct `new LowerRadialInflowField({ ... })`;
3. let `LowerRadialInflowField` enforce physical invariants.

Do not:

- construct `RadialInflowField` and multiply by `G(y)`;
- accept a `kind` / envelope flag;
- re-validate `topHeight > baseHeight` in the scenario layer;
- copy updraft, rotation, or outflow numbers;
- assemble the composite.

Validation failures surface as `LowerRadialInflowFieldError`.

`createUpdraftField`, `createRotationField`, and
`createUpperRadialOutflowField` are unchanged.

### Fate of `createRadialInflowField`

After `storm.radialInflow` is removed, `createRadialInflowField` has
nothing current to read.

**Decision: delete `src/scenario/createRadialInflowField.ts` in the
implementation slice.**

It is not a physics module. Isolated `RadialInflowField` tests do not
use it. Historical rendering docs `05` / `06` / `07` may still
describe that factory as part of those completed slices; do not
rewrite those histories, and do not keep a dead current factory to
make historical sentences compile.

Plateau identity checks in the new integration tests construct
`RadialInflowField` directly from equal radial parameters.

---

## 6. DEMO vertical bounds

Semantics of `G_in` (`docs/physics/17-lower-radial-inflow-field.md`):

```text
G_in = 1                         y ≤ baseHeight
G_in = cos(π (y − y_b) / (2 H))  baseHeight < y < topHeight
G_in = 0                         y ≥ topHeight
```

Current vertical structure (unchanged):

### Updraft

```text
baseHeight = 0 m
topHeight  = 2000 m
y_mid      = 1000 m
F(1000)    = 1
F(1500)    = √2/2
F(2000)    = 0
```

### Upper outflow

```text
baseHeight = 1000 m
topHeight  = 2000 m
y_mid      = 1500 m
G_out(1000) = 0
G_out(1500) = 1
G_out(2000) = 0
```

### Seeds

```text
y = 1000 m
```

Environment knots remain `0`, `1000`, `2000` m. Isolated on-axis
half-sine updraft does **not** reach `topHeight = 2000` in finite
continuous time
(`docs/physics/15-vertical-updraft-envelope.md` §17.3). Isolated
on-axis time from `y = 1000` to `y = 1500` is about `28 s`
(`docs/rendering/06-composite-vertical-envelope-updraft-demo.md` §6).
That isolated time is **not** a composite oracle; it is only a
reachability argument for placing a cutoff below the updraft lid.

Target qualitative handoff for **this** laboratory column:

- full inflow on a real lower-level band, not only at `y ≤ 0`;
- inflow already weakening toward mid-levels (`y = 1000 m`);
- weaker still inside the upper-outflow band;
- identically off by some reachable height;
- overlap with outflow is allowed and expected (not a staged
  switch).

Reset does **not** have to keep `G_in = 1`. Any change of the initial
inflow contribution must be explicit.

### Candidates

#### A — copy `[0, 1000]`

```text
baseHeight = 0 m
topHeight  = 1000 m
G_in(1000) = 0
```

Full strength only at and below ground. At the seeds inflow is off.
Overlap with outflow is empty: inflow dies exactly where outflow
starts. Rising tracers from `y = 1000` never sample `G_in > 0`.

That is a staged layer cake, not a superposition, and the new
mechanism is invisible along the current seeds. Rejected.

#### B — copy `[0, 1500]`

```text
baseHeight = 0 m
topHeight  = 1500 m
G_in(1000) = 1/2
```

Plateau is only `y ≤ 0`. The entire in-column lower half is already
tapering. “Full inflow at lower levels” is never sampled above
ground. Rejected as an automatic pretty-number copy that fails the
in-column plateau requirement.

#### C — copy the updraft window `[0, 2000]`

```text
baseHeight = 0 m
topHeight  = 2000 m
G_in(1000) = √2/2
```

Same missing in-column plateau. `G_in → 0` only at the updraft lid,
which isolated ascent never reaches. Rejected as an automatic copy.

#### D — copy the outflow window `[1000, 2000]`

```text
baseHeight = 1000 m
topHeight  = 2000 m
G_in(1000) = 1
```

Reset matches the previous DEMO (`G_in = 1`). Weakening starts **at**
mid-level, not toward it. The entire outflow band still contains
inflow (`G_in(1500) = √2/2`). Aloft leak above `2000 m` would be
fixed, but the lower-level story is “full through the mid-level,
then taper through the same window as outflow.”

That isolates vertical localization at `t = 0`, which is attractive,
but it fails “already weakening toward mid-levels” and copies the
outflow bounds. Rejected.

#### E — plateau at the seeds, thin cutoff `[1000, 1500]`

```text
baseHeight = 1000 m
topHeight  = 1500 m
H          = 500 m
G_in(1000) = 1
```

Reset unchanged. `H = 500 m` is a stiff taper (`G' ~ 1/H`). 07
already rejected a `500 m` outflow cap as too brief. Weakening still
starts at, not toward, mid-levels. Rejected.

#### F — in-column plateau, cutoff at column top `[500, 2000]`

```text
baseHeight = 500 m
topHeight  = 2000 m
H          = 1500 m
G_in(1000) = √3/2 ≈ 0.866
G_in(1500) = 1/2
```

Real lower plateau `0–500 m`. Seeds already slightly weakened.
Inflow still half-strength at the outflow peak. `G_in = 0` only at
the updraft lid, so along a rising path the cutoff is not a
reachable exact zero.

Better than A–E, but the cutoff is the least reachable height in this
column, and the overlap fight remains through the whole outflow
window. Not canonical.

#### G — in-column plateau, mid-taper at the seeds, cutoff at `1500 m`

```text
baseHeight = 500 m
topHeight  = 1500 m
H          = 1000 m
G_in(y ≤ 500) = 1
G_in(1000)    = cos(π/4) = √2/2
G_in(1500)    = 0
```

| Question | Answer |
| --- | --- |
| Full inflow at lower levels | yes: entire `0–500 m` (and mathematically below) is `G = 1` |
| Weakening toward mid-levels | yes: taper occupies `500–1500`; at `y = 1000`, `G = √2/2` |
| Weaker in the outflow band | yes: `1000–1500` is the upper half of the taper |
| Exact zero reachable | yes: `y = 1500` is the documented reachable height of this column (outflow peak; `F` still `√2/2`) |
| Overlap with outflow | yes: `1000 < y < 1500` |
| Reset `G_in` | `√2/2`, not `1`: initial inflow is weaker than the previous DEMO; this is conscious |
| Scene / env domain | still the framed `0–2000 m` tower |

`topHeight = 1500 m` coinciding with outflow `y_mid`, and
`baseHeight = 500 m` being the unique value that puts seed height at
mid-taper given that top, are **fixture choices**, not API coupling.
The factory must still read the lower-inflow DTO’s own numbers.

#### H — offset bounds to avoid round alignment `[400, 1600]`

Would also satisfy the qualitative bullets. It gives up two
elementary DEMO facts:

- `G_in(1000) = √2/2`;
- `G_in = 0` exactly at the already-documented reachable outflow
  peak.

No independent physical reason prefers `400` / `1600` over the
mid-taper / reachable-cutoff pair. Rejected.

### Canonical DEMO bounds

**Candidate G is canonical:**

```text
storm.lowerRadialInflow.baseHeight = 500 m
storm.lowerRadialInflow.topHeight  = 1500 m
H_in                               = 1000 m
```

Reasons:

1. **Lower-level plateau inside the column.** `G_in = 1` on
   `y ≤ 500 m`, including ground `y = 0`. This is not a
   below-ground-only plateau.
2. **Weakening toward mid-levels.** Seed height sits at mid-taper:
   `G_in(1000) = √2/2`. The new mechanism is already visible at
   Reset as a reduced inward residual, and continues to weaken as
   tracers rise.
3. **Cutoff is reachable.** `G_in = 0` at `1500 m`, inside the
   updraft layer, at the height 07 already chose so that tracers
   need not reach the updraft lid.
4. **Overlap is a band, not a switch.** `1000 < y < 1500` has both
   radial operands. `y = 1000` is the outflow lid (`G_out = 0`).
   `y = 1500` is the inflow top (`G_in = 0`).
5. **Fixes the aloft leak.** For `y ≥ 1500`, lower inflow is
   identically zero. The previous DEMO still pulled inward at
   `y ≥ 2000` after outflow had turned off.
6. **Does not copy `[0, 1000]`, `[0, 1500]`, `[0, 2000]`, or
   `[1000, 2000]`.** The numbers are derived from (plateau below
   mid-level) + (mid-taper at the seeds) + (reachable cutoff at
   `1500 m`).
7. **Coincidence with outflow `y_mid = 1500` is a fixture**, not a
   continuity identity and not a shared bound type.

`baseHeight < 0` remains allowed by physics and unused here.

Do not change updraft `[0, 2000]`, outflow `[1000, 2000]`, env knots,
or `dt` in this slice.

---

## 7. Strength, center, and sigma

Keep the current inflow radial parameters:

```text
storm.lowerRadialInflow.radialStrainRate = 0.005 1/s
storm.lowerRadialInflow.centerX          = 0 m
storm.lowerRadialInflow.centerZ          = 0 m
storm.lowerRadialInflow.sigma            = 1000 m
```

**This is a DEMO fixture choice, not an API coupling.**

Reasons to keep `A_in`, center, and `sigma`:

1. Isolates the effect of this slice to **vertical localization**.
2. On the plateau, samples match `RadialInflowField` with the same
   four radial numbers (`docs/physics/17-lower-radial-inflow-field.md`
   §20). That identity is a wiring test, not inheritance.
3. No visual retune of `A_in` is authorized. Peak
   `|v_r|(G=1) = A σ / √e ≈ 3.03 m/s` stays the lower-level residual
   already judged against env / rotation in 07.

There is no continuity pairing

```text
A_in = A_out
A_in = Ω
H = W0 π / (2 A)
G_in + G_out = 0
```

The DTO stores its own six numbers. The factory reads only
`storm.lowerRadialInflow`. Shared centers/`sigma` in `DEMO_SCENARIO`
do not create `storm.center` and do not authorize copying across
blocks.

---

## 8. Composite radial residual (analysis only)

When DEMO centers and `sigma` coincide, the **storm** radial part is

```text
v_r,storm(r, y) = r E(r) ( -A_in G_in(y) + A_out G_out(y) )
```

This identity is for parameter analysis and tests of signs. It is
**not** a combined field type and **not** an API invariant. If a
cloned config offsets one center, the identity is gone.

With lock-in `A_in = 0.005`, `A_out = 0.01`,
`G_in` from §6 candidate G, and existing

```text
G_out(y) = sin(π (y − 1000) / 1000)    if 1000 ≤ y ≤ 2000
G_out(y) = 0                           otherwise
```

the near-axis coefficient `R(y) = -A_in G_in + A_out G_out` is:

| Height | `G_in` | `G_out` | `R(y)` | Storm radial |
| --- | --- | --- | --- | --- |
| `y ≤ 500` (plateau) | `1` | `0` | `−0.005` | inflow-only, full §14 |
| `y = 750` | `cos(π/8) ≈ 0.924` | `0` | `≈ −0.00462` | inflow-only, already weaker |
| `y = 1000` (seeds) | `√2/2` | `0` | `≈ −0.00354` | inflow-only; outflow lid |
| `y ≈ 1096` | `≈ 0.594` | `≈ 0.294` | `0` | contributions equal; net storm radial cancel |
| `y = 1250` | `cos(3π/8) ≈ 0.383` | `√2/2` | `≈ +0.00516` | overlap; net outward |
| `y = 1500` | `0` | `1` | `+0.010` | outflow-only; inflow exactly zero |
| `y = 1750` | `0` | `√2/2` | `≈ +0.00707` | outflow-only |
| `y ≥ 2000` | `0` | `0` | `0` | both radial storm terms off |

Regions (open intervals; lids are exact zeros of one envelope):

```text
inflow-only:     y < 1000
overlap:         1000 < y < 1500
outflow-only:    1500 ≤ y < 2000
inflow zero:     y ≥ 1500
both radial off: y ≥ 2000
```

Net storm radial in the overlap, **only** under coincident
centers/`sigma`:

```text
inward  on (1000, ≈1096) m
zero    at y ≈ 1096 m
outward on (≈1096, 1500) m
```

Do not promote `y ≈ 1096 m` to an API. Tests may check the documented
DEMO fixture at a few listed heights. They must **not** require a
closed-form crossover solver.

Environment and rotation are not in `v_r,storm`. Live `r(t)` is the
residual of all five operands.

Compared with 07, where height-independent inflow gave
`R = -A_in + A_out G_out` and net-outward for `G_out > 1/2`
(`≈ 1167–1833 m`):

- the previous DEMO was still inward for `y ≥ 2000`;
- this DEMO is radial-quiet aloft for `y ≥ 2000`;
- net outward in the overlap starts earlier because `G_in` is
  already `< 1` when outflow turns on;
- that is a fixture consequence of localization, not a retune of
  `A_in` / `A_out`.

---

## 9. Seeds

Keep the current three seeds at one height:

```text
(0,    1000,  0)     // axis at Reset: r = 0, F = 1, G_in = √2/2, G_out = 0
                     //        V_rotation = 0, V_inflow = 0, V_outflow = 0
(600,  1000,  0)     // east:  r = 0.6 σ, F = 1, G_in = √2/2, G_out = 0
                     //        rotation tangent north (−Z);
                     //        inflow west (−X), scaled by √2/2;
                     //        outflow = 0 at t = 0
(0,    1000, -600)   // north: r = 0.6 σ, F = 1, G_in = √2/2, G_out = 0
                     //        rotation tangent west (−X);
                     //        inflow south (+Z), scaled by √2/2;
                     //        outflow = 0 at t = 0
```

Units: meters.

### `G_in` at the seeds

```text
G_in(1000) = √2/2 ≈ 0.7071
```

Initial inflow is **weaker than the previous DEMO** by that factor.
At `r = 600 m`, `E ≈ 0.8353`:

```text
previous |v_in| ≈ 2.51 m/s
this slice |v_in| ≈ 1.77 m/s
```

East/north **decomposition is unchanged**: east inflow is still
`Vx < 0` only; north inflow is still `Vz > 0` only. Only the
magnitude is scaled.

This Reset change is **conscious**. It is the cost of putting
mid-level seeds in the taper so that:

- lower levels can still be a real `G = 1` plateau;
- the new mechanism is already on at `t = 0`, then continues to
  weaken along the rising path;
- a fourth seed on the plateau is unnecessary.

### Why keep these seeds

1. Axis / east / north cardinal contrast remains the rotation vs
   inflow lesson at `t = 0`, with outflow still off (`G_out(1000) = 0`).
2. `F(1000) = 1`, so tracers are lifted into the overlap and toward
   `G_in → 0` at `1500 m`. Isolated on-axis time `1000 → 1500` is
   ~`28 s`; env core-exit scale `σ / |V_env| ≈ 63 s` at `y = 1000`.
3. Along-trajectory `G_in(y)` change from `√2/2` toward `0` is
   enough to read the new mechanism without a particle cloud.
4. Plateau `G = 1` is checked by integration **samples** at
   `y ≤ 500`, not by adding a ground seed.
5. Do not return the historical far-east `1800 m` seed.

Between-seed contrast at `t = 0` stays rotation vs (scaled) inflow.
Inflow/outflow handoff is height, not a new horizontal seed.

---

## 10. Simultaneous superposition

The DEMO is **not** a staged state machine:

```text
inflow → updraft → outflow     // forbidden story
```

All five fields are sampled at every position and added. A tracer
feels a mechanism when it is in a region where that contribution is
nonzero.

Therefore these may act at once:

- inward radial `LowerRadialInflowField` (where `G_in > 0`);
- outward radial `UpperRadialOutflowField` (where `G_out > 0`);
- tangential `RotationField` (every height);
- vertical enveloped updraft (where `F > 0`);
- environmental advection (`Vy = 0`).

Vertical localization only makes some contributions stronger or
weaker with height. It does not switch operands on and off as a
procedure.

A visual path that looks like “enter, rise, spread” is possible. It
is **not** an invariant of this superposition. Env can carry a
tracer out of the core before `G_in` reaches 0; a numerical step can
land above `2000 m`; not every tracer must cross the overlap.

---

## 11. Formula of this historical DEMO fixture

```text
V_total =
    V_environment(y)
  + V_vertical_envelope_updraft(r_up, y)
  + V_rotation(r_rot)
  + V_lower_radial_inflow(r_in, y)
  + V_upper_radial_outflow(r_out, y)
```

where

```text
V_lower_radial_inflow
  = ( -A_in E_in dx G_in(y),  0,  -A_in E_in dz G_in(y) )

E_in(r) = exp(−r² / (2 σ_in²))

G_in(y) = 1                                    if y ≤ 500
G_in(y) = cos(π (y − 500) / 2000)              if 500 < y < 1500
G_in(y) = 0                                    if y ≥ 1500
```

Updraft, rotation, and outflow formulas are unchanged from
`docs/rendering/07-composite-upper-radial-outflow-demo.md`.

`y` now affects **four** operands:

- environment;
- lower inflow;
- enveloped updraft;
- upper outflow.

Rotation remains height-independent.

App composition owns assembly:

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

Unchanged DEMO numbers:

```text
updraft:     W0 = 20 m/s, σ = 1000 m, [0, 2000], center (0,0)
rotation:    Ω = 0.02 rad/s, σ = 1000 m, center (0,0)
outflow:     A_out = 0.01 1/s, σ = 1000 m, [1000, 2000], center (0,0)
timestep:    0.1 s
integrator:  EulerIntegrator
environment / stormMotion: hodograph fixture, unchanged
```

---

## 12. Dynamics

At every fixed step every operand is re-sampled at the current
position. As a tracer rises, all of these change:

- `y` → env wind, updraft `F(y)`, lower-inflow `G_in(y)`, outflow
  `G_out(y)`;
- `(x, z)` relative to each fixed center → each Gaussian `E(r)`
  and the radial/tangential direction.

No mechanism is “started after” another procedurally.

Near the seeds, shortly after Reset:

- `G_out = 0` → outflow off;
- `G_in = √2/2` → inflow already weaker than the previous DEMO;
- `F = 1` → lift strong;
- rotation tangential; env ~`16 m/s`.

Through the overlap, if the tracer is still in the core:

- `G_in` decreases, `G_out` increases;
- both radial storm operands are present;
- net storm radial may change sign under the coincident fixture
  (§8); that is not a trajectory oracle.

Around `y = 1500 m`, if still in the core:

- `G_in = 0`, `G_out = 1`, `F ≈ 0.707`;
- lower inflow contributes `(0,0,0)`;
- outflow is at its peak;
- env ~`21 m/s` still dominates horizontally.

At `y ≥ 2000 m` (**this historical slice's** lids):

- `F = 0`, `G_out = 0`, `G_in = 0`;
- updraft, lower inflow, and outflow contribute `(0,0,0)`;
- environment still advects horizontally (in **this historical
  slice**, the profile `h_max` was `2000 m` so sampling clamped to
  that knot; live DEMO after `09` interpolates `2000–6000–12000`);
- **rotation still acts**; inflow no longer does.

`Vy → 0` at the updraft lid is still the half-sine boundary, not a
tropopause. Disappearance of inflow at `y = 1500 m` is the lower-
inflow envelope top, **not** a PBL top or gust-front.

Do not start a downdraft or continuity solver here.

---

## 13. Anti-oracles

Forbidden live-DEMO claims:

```text
y(t) = y0 + W0 t
      // height-independent on-axis updraft

ξ(t) = (2/π) arctan( tan(π ξ0 / 2) exp(π W0 t / H) )
      // isolated VerticalEnvelopeUpdraftField; needs constant r

r(t) = r0
      // isolated RotationField circle

r(t) = r0 exp(−A_in t)
      // unbounded linear inflow; not even isolated
      // RadialInflowField / LowerRadialInflowField

r(t) = r0 exp(−A_in G_in(y0) t)
      // still the linear-core approximation; G_in also changes
      // along a rising composite trajectory

r(t) = r0 exp(+A_out t)
      // unbounded linear outflow
```

Also forbidden:

- monotone composite `r`;
- monotone horizontal distance from the storm axis;
- any closed-form five-operand trajectory;
- `Vy = W0` at every height on the axis;
- the staged sequence `enters → rises → exits` as an invariant;
- guaranteed inward-then-outward trajectory;
- “every tracer crosses the handoff zone”;
- `v_r,storm` identity when centers/`sigma` have been mutated
  apart.

Isolated oracles remain valid only in their isolated tests. None is
a DEMO / UI / integration expectation. Do not duplicate isolated
§17 tests here.

---

## 14. Continuity boundary

The simultaneous presence of

```text
LowerRadialInflowField
VerticalEnvelopeUpdraftField
UpperRadialOutflowField
```

is still controlled superposition. Parameters are **not** tied by a
continuity equation.

Vertical handoff is a qualitative prescribed structure, not a
continuity solution.

Do **not** assert:

```text
lower inflow = air entering
updraft = same air rising
upper outflow = same air leaving
```

in a mass-conserving sense.

Allowed wording:

> controlled prescribed superposition with a lower-level inward
> tendency, vertical ascent, and an upper-level outward tendency.

Forbidden wording:

- continuity-solved;
- mass-conserving / divergence-free storm;
- realistic supercell circulation;
- boundary-layer / PBL inflow;
- gust front / cold pool;
- pressure-driven inflow.

`docs/physics/17-lower-radial-inflow-field.md` §19 already forbids
claim (3). This DEMO does not reopen it.

---

## 15. Hodograph boundary

Unchanged:

- hodograph represents only `EnvironmentalWindProfile`;
- lower radial inflow does not add a vertical axis, a second
  curve, or an overlay;
- rotation, upper outflow, and the enveloped updraft still do not;
- shear / horizontal vorticity / streamwise–crosswise / SRH remain
  environmental + `stormMotion` diagnostics;
- mutating `storm.lowerRadialInflow.*` must not change hodograph
  points (and still must not when mutating other storm blocks);
- 3D composite field and 2D hodograph intentionally show different
  aspects of the same `ScenarioConfig`.

---

## 16. Rendering and runtime controls

Physics / rendering boundary unchanged:

- `TracerScene` continues to read `particle.position` only;
- no inflow arrows, trails, plume, cloud, extra particles, or GPU
  particles;
- existing spheres, axes, and grid are sufficient.

Pause / `1×`–`20×` / Reset continue to follow
`docs/rendering/02-tracer-runtime-controls.md` without changing
numerical `dt`. Fast playback is not a reason to enlarge `H_in`,
`A_in`, or the camera.

No scene-scale problem was found that would justify moving the
camera or grid. The `500–1500 m` taper is inside the current
frustum. Do not change camera, grid, `dt`, or Euler in this slice.

Reset restores the three seed positions and `clock.time = 0`.
Reset does **not** require `G_in = 1`.

---

## 17. App copy / scientific wording

After implementation, UI copy may say that the tracer DEMO includes:

- environmental wind;
- a vertically structured updraft;
- rotation;
- lower radial inflow;
- upper radial outflow.

It must **not** call the live DEMO:

- a realistic supercell;
- a complete storm;
- continuity-solved flow;
- a mesocyclone;
- a boundary layer / PBL;
- pressure-driven circulation;
- an anvil.

Disappearance of inflow above `topHeight` must **not** be described
as a realistic inflow-layer top.

---

## 18. Testing policy (integration)

Focused integration tests in the existing file
`src/simulation/demoCompositeUpdraft.integration.test.ts` (keep the
filename). Do **not** re-prove unit/acceptance physics of
`LowerRadialInflowField`.

Let `G_in(y)` and `E(r)` be the DEMO lower-inflow envelope/Gaussian
from §6–§7. Let `A_in = 0.005`, `A_out = 0.01`.

Required:

1. `createLowerRadialInflowField(DEMO_SCENARIO)` maps DTO →
   `LowerRadialInflowField` with DEMO params. On the axis,
   `V = (0,0,0)` on the plateau, in the taper, and at `topHeight`.
   Off-axis at a plateau height `y ≤ 500` and `r = σ`,
   `|V| = A_in σ / √e` within tolerance.
2. Factory reads only `storm.lowerRadialInflow`: a cloned config
   with different updraft / rotation / outflow `centerX` / `sigma` /
   bounds still produces the inflow about the lower-inflow DTO
   center/sigma/bounds.
3. Demo composition matches
   `sample(env)+sample(updraft)+sample(rotation)+sample(lowerInflow)+sample(outflow)`
   at representative points: the three seeds, one plateau point
   (`y ≤ 500`), one interior taper/overlap point, one point at or
   above inflow `topHeight`, one point above outflow `topHeight`.
   Operand count is five.
4. On a plateau height (e.g. `y = 0` or `y = 500`), off-axis,
   `LowerRadialInflowField` matches a directly constructed
   `RadialInflowField` with the same `centerX` / `centerZ` /
   `radialStrainRate` / `sigma`.
5. At a taper height with the same `(x, z)` (e.g. seed height
   `y = 1000`), `|V_inflow|` is weaker than on the plateau, in the
   ratio `G_in(1000) / 1 = √2/2`.
6. For `y ≥ 1500`, lower-inflow contribution is exactly `(0,0,0)`
   off-axis as well as on-axis.
7. In the overlap (e.g. east at `y = 1250`, **not** at `y = 1500`
   where `G_in = 0`): inflow `Vx < 0` and outflow `Vx > 0` are
   **both** present.
8. DEMO-fixture relative radial residual `R(y)` at documented
   heights only: seeds inward; `y = 1250` net outward; `y = 1500`
   outflow-only. Do **not** require a universal “outflow wins”
   invariant, and do not solve for `y ≈ 1096` in production code.
9. Axis contribution of lower inflow is `0` at every tested height.
10. Cardinal east/north at a plateau height and at seed height:
    east inflow `Vx < 0` only; north inflow `Vz > 0` only (world).
    Compare `docs/physics/17-lower-radial-inflow-field.md` §18.
    Magnitudes at seed height are scaled by `√2/2` relative to the
    plateau.
11. After several fixed steps: near-axis `y` increases while still
    below `2000 m`; do **not** compare with linear-y, isolated
    half-sine `y(t)`, circle, `r = r0 e^{±At}`, monotone composite
    `r`, or guaranteed inward-then-outward. Horizontal drift from
    env remains allowed and expected.
12. Reset restores the three seed positions and `clock.time = 0`.
13. Hodograph points are unchanged by mutating
    `storm.lowerRadialInflow` (and still unchanged by mutating
    other storm blocks).
14. `ScenarioConfig.ts` and `DEMO_SCENARIO.ts` remain
    physics-import-free;
    `createLowerRadialInflowField.ts` value-imports
    `LowerRadialInflowField`.
15. `composeDemoTracerSimulation` no longer imports
    `createRadialInflowField` or `RadialInflowField`.
    `DEMO_SCENARIO` / `ScenarioConfig` no longer contain
    `storm.radialInflow`.
16. Replacement, not addition: composite operand list length is
    `5`; the inflow slot is `LowerRadialInflowField`.

At the seeds, east/north decomposition stays, with the documented
`G_in = √2/2` scale and outflow `= 0`:

- axis: `Vy = W0 F(seed.y)`; rotation = inflow = outflow = 0;
- east: rotation `Vz` only, inflow `Vx < 0` only (weaker than
  plateau), outflow `0`;
- north: analogous.

Do **not** assert isolated lower-inflow closed-form `r(t)` for DEMO
tracers.

Scenario-layer tests in
`docs/architecture/01-scenario-config.md` replace the old
`createRadialInflowField` mapping item with
`createLowerRadialInflowField`. They still must not duplicate the
`LowerRadialInflowField` validation matrix.

---

## 19. Relationship to earlier tracer docs

| Document | Role after this slice |
| --- | --- |
| `01-tracer-scene.md` | Fixed-step loop, observe-only Three.js, layout |
| `02-tracer-runtime-controls.md` | Pause / timeScale / Reset; still applies unchanged |
| `03-composite-updraft-demo.md` | Historical env + height-independent `UpdraftField` |
| `04-composite-rotation-demo.md` | Historical env + old updraft + rotation |
| `05-composite-radial-inflow-demo.md` | Historical four-field DEMO with old height-independent updraft |
| `06-composite-vertical-envelope-updraft-demo.md` | Historical four-field DEMO with `VerticalEnvelopeUpdraftField` |
| `07-composite-upper-radial-outflow-demo.md` | Historical five-operand DEMO immediately before this replacement: height-independent `RadialInflowField` + `UpperRadialOutflowField` |
| This document (`08`) | Five-operand **wiring** and seed layout; envelope **geometry** superseded by `10` |
| `09-deep-environmental-profile-demo.md` | Live environmental knots `0–12000 m` |
| `10-deep-storm-envelope-scaling.md` | Live storm-envelope bounds |

Historical statements in `07` that inflow is height-independent and
still acts at `y ≥ 2000` describe that completed slice. The
three-seed layout in `04`/`05`/`06`/`07` remains the current seed
**layout**. The `08` seed-height reading `G_in(1000) = √2/2` is this
slice's historical fixture; live DEMO after `10` has `G_in(1000) = 1`
and `F(1000) = sin(π/8)`.

---

## 20. Explicit non-goals

- downdraft;
- continuity solver or DEMO parameter coupling among `A_in`,
  `A_out`, `W0`, bounds;
- pressure / buoyancy / thermodynamics;
- PBL / gust front / cold pool;
- anvil / cloud / precipitation;
- tilting / stretching / mesocyclone dynamics;
- storm axis that translates with `stormMotion`;
- keeping both `RadialInflowField` and `LowerRadialInflowField` in
  the live DEMO;
- extra tracer seeds / particle cloud;
- inflow arrows, meshes, trails, GPU particles;
- changing `W0`, `Ω`, `A_in`, `A_out`, env winds, updraft bounds,
  outflow bounds, `dt`, or Euler → RK2;
- changing camera / grid unless a separately documented scene
  problem appears (none found);
- changing hodograph physics or overlay math;
- `createScenarioRuntime`;
- assembling `CompositeVelocityField` inside the scenario module;
- DEMO linear-y, isolated half-sine, circular, or
  `r = r0 e^{±At}` trajectory oracles;
- scenario editor.

Do not change physics formulas of `LowerRadialInflowField`,
`UpperRadialOutflowField`, `VerticalEnvelopeUpdraftField`,
`RadialInflowField`, `RotationField`, or environment.

---

## 21. Lock-in summary

```text
current inflow operand:    LowerRadialInflowField
old RadialInflowField status:
                           isolated height-independent primitive;
                           not a live-DEMO occupant; not deleted
DTO block:                 storm.lowerRadialInflow
                           (ScenarioLowerRadialInflow)
                           storm.radialInflow removed from current
                           required ScenarioConfig surface
factory:                   createLowerRadialInflowField
                           → LowerRadialInflowField
                           createRadialInflowField deleted from
                           current scenario surface
center:                    (0, 0) m   // DEMO fixture, not API coupling
sigma:                     1000 m     // DEMO fixture, not API coupling
radialStrainRate:          0.005 1/s  // unchanged; isolate G(y)
baseHeight:                500 m      // plateau top / taper start
topHeight:                 1500 m     // G_in = 0 at and above
G(seed y):                 G_in(1000) = √2/2
                           Reset inflow weaker than previous DEMO;
                           east/north signs unchanged
overlap with upper outflow:
                           1000 < y < 1500
                           equal |contributions| at y ≈ 1096 m
                           (DEMO fixture only)
                           y ≥ 1500: inflow exactly zero
seed strategy:             keep (0,1000,0), (600,1000,0), (0,1000,-600)
current composite operands:
  EnvironmentalWindField
  + VerticalEnvelopeUpdraftField
  + RotationField
  + LowerRadialInflowField
  + UpperRadialOutflowField
continuity claim:          prescribed superposition; not mass-consistent
hodograph impact:          none
renderer impact:           none (observe particle.position only)
```

---

## 22. First implementation slice (code, after this doc)

1. Replace `ScenarioRadialInflow` / required `storm.radialInflow`
   with `ScenarioLowerRadialInflow` / required
   `storm.lowerRadialInflow` on `ScenarioConfig`.
2. Set `DEMO_SCENARIO.storm.lowerRadialInflow` to
   `{ centerX: 0, centerZ: 0, radialStrainRate: 0.005, sigma: 1000,
     baseHeight: 500, topHeight: 1500 }`.
   Remove `storm.radialInflow`.
   Do not change updraft / rotation / outflow / env / `stormMotion` /
   seeds / `dt`.
3. Create `src/scenario/createLowerRadialInflowField.ts`:
   value-import `LowerRadialInflowField`, map all six DTO numbers,
   read only that block.
4. Delete `src/scenario/createRadialInflowField.ts`.
5. In `composeDemoTracerSimulation`, replace
   `createRadialInflowField` with `createLowerRadialInflowField` in
   the same operand slot. Operand count stays 5.
6. Adjust app copy: lower radial inflow; no supercell / PBL /
   continuity-solved claims.
7. Confirm `docs/architecture/01-scenario-config.md` matches this
   DTO/factory occupant.
8. Adjust integration tests (§18); keep Reset seed positions;
   assert `G_in(1000) = √2/2` rather than previous full-strength
   inflow.
9. `npm test` and `npm run typecheck`.
10. **STOP.**

Do not change `TracerScene` internals, hodograph composition,
physics formulas, `dt`, Euler, `W0`, `Ω`, `A_in`, `A_out`, env
winds, outflow bounds, or the seed set. Do not start downdraft or a
continuity solver.

### Files expected to create

- `src/scenario/createLowerRadialInflowField.ts`

### Files expected to change

- `src/scenario/ScenarioConfig.ts`
- `src/scenario/DEMO_SCENARIO.ts`
- `src/app/composeDemoTracerSimulation.ts`
- `src/app/App.tsx` (copy only)
- `src/simulation/demoCompositeUpdraft.integration.test.ts`
- `docs/architecture/01-scenario-config.md`

### Files expected to delete

- `src/scenario/createRadialInflowField.ts`

### Files not to touch

- `src/physics/storm/LowerRadialInflowField.ts` formulas;
- `src/physics/storm/LowerRadialInflowField.test.ts`;
- `src/simulation/lowerRadialInflowFieldTracer.acceptance.test.ts`;
- `src/physics/storm/RadialInflowField.ts` and its isolated tests;
- `src/physics/storm/UpperRadialOutflowField.ts` formulas;
- `src/physics/storm/VerticalEnvelopeUpdraftField.ts`;
- `src/physics/storm/RotationField.ts`;
- `src/physics/storm/UpdraftField.ts`;
- `src/rendering/**`;
- `src/ui/**` except app copy if it lives in `App.tsx`;
- hodograph modules.

---

## 23. Core lesson

Live DEMO now replaces height-independent radial inflow with a
lower plateau plus a quarter-cosine taper:

```text
G_in(y) = 1                          for y ≤ 500
G_in(y) = cos(π (y − 500) / 2000)    for 500 < y < 1500
G_in(y) = 0                          for y ≥ 1500
Vx      = −0.005 E dx G_in
Vz      = −0.005 E dz G_in
Vy      = 0
```

At Reset, `G_in(1000) = √2/2` and `G_out(1000) = 0`. As tracers
rise, inflow weakens while outflow turns on. Both are present in
`1000 < y < 1500`. At `y ≥ 1500` lower inflow is exactly zero.
That is a prescribed vertical residual, not mass continuity, and
not a boundary layer.

`RadialInflowField` remains the height-independent primitive.
Operand count remains five.
