# Deep Environmental Wind Profile Demo

**Status:** this document owns the live five-knot environmental profile
(`0–12000 m`). The `08` storm envelopes listed in the body were the
**historical freeze this slice preserved**. Live storm-envelope
geometry is specified in
`docs/rendering/10-deep-storm-envelope-scaling.md`.
DEMO default tracer-view numbers are live in
`docs/rendering/11-deep-storm-tracer-view.md`.
The camera numbers in §3.D / §16 are the historical `0–2 km` pose,
not a universal rendering constant.

## 1. Purpose

This document defines the **next DEMO generation** of the laboratory
environmental wind profile: a deeper explicit knot column for the same
`EnvironmentalWindProfile` primitive, without stretching storm-field
envelopes, without a new physics type, and without a global storm-top
height.

It answers:

    What is the next canonical explicit environmental support for the
    DEMO laboratory, which wind knots occupy it, how do existing
    diagnostics and the hodograph change, and what must stay frozen
    until a separate storm-envelope scaling slice?

Physics formulas remain those of:

- `docs/physics/04-environmental-wind-profile.md`
- `docs/physics/05-vertical-wind-shear.md`
- `docs/physics/06-horizontal-vorticity.md`
- `docs/physics/07-storm-relative-wind.md`
- `docs/physics/08-streamwise-crosswise-vorticity.md`
- `docs/physics/09-storm-relative-helicity.md`
- `docs/physics/10-hodograph-basics.md`
- `docs/physics/12-composite-velocity-field.md`

Live DEMO composition and current storm-envelope bounds remain those of:

- `docs/rendering/08-composite-lower-radial-inflow-demo.md`

This document owns:

- the four-way split of world domain / profile support / storm envelopes /
  rendering domain;
- the chosen explicit environmental top;
- the next DEMO wind-knot table;
- preservation of the already studied `0–2 km` structure;
- clamp policy after expansion;
- hodograph and diagnostic consequences of those knots;
- storm-motion freeze;
- migration order before any storm-envelope retune;
- focused tests and the later implementation slice.

It is **not**:

- a thermodynamic sounding;
- a tropopause or cloud-top height;
- a Bunkers storm-motion estimator;
- a new `EnvironmentalWindProfile` API;
- a stretch of updraft / inflow / outflow envelopes.

Current live DEMO (after this document's implementation slice):

```text
EnvironmentalWindField          knots 0, 1000, 2000, 6000, 12000 m
+ VerticalEnvelopeUpdraftField  0–2000 m
+ RotationField                 height-independent
+ LowerRadialInflowField        plateau ≤ 500 m, taper to 1500 m
+ UpperRadialOutflowField       1000–2000 m
→ CompositeVelocityField
```

Seeds remain `(0, 1000, 0)`, `(600, 1000, 0)`, `(0, 1000, -600)`.

---

## 2. Why this document lives under rendering, not physics/18

Preferred filename from the research brief was
`docs/physics/18-deep-environmental-wind-profile.md`.

That path is **rejected**.

`docs/physics/04-environmental-wind-profile.md` already owns the
canonical primitive:

```text
EnvironmentalWindProfile
= prescribed piecewise-linear horizontal wind versus world +Y
```

with clamp outside `[h_min, h_max]`, `vertical ≡ 0`, and no DEMO knot
history. §4 of that document states that its example `(5,0) / (10,5) /
(15,10)` values are illustrative only and do not define a canonical
supercell environment.

The work in this slice is a **DEMO laboratory fixture generation**:
specific knots, a specific explicit top, and isolation against the
current `08` storm column. That is the same class of ownership as
`docs/rendering/03`–`08`, not a new physics type.

Therefore:

```text
docs/rendering/09-deep-environmental-profile-demo.md   // this document
docs/physics/04-environmental-wind-profile.md          // unchanged primitive
```

Do not turn `04` into the history of a particular DEMO hodograph.

Note: `docs/architecture/00-coordinate-system.md` does not exist.
Canonical coordinates remain `docs/physics/00-coordinate-system.md`
and `docs/ARCHITECTURE.md`.

---

## 3. Four-way split (must not collapse)

These four upper bounds are **not** required to coincide. Do not
introduce `scenario.topHeight`, `storm.topHeight`, or
`domain.topHeight` as a global supercell height.

### A. Mathematical / world domain

Physics fields already sample every finite world `y`. There is no
project-wide hard clamp at a storm top.

`EnvironmentalWindField` maps `height = position.y` into the profile
sampler. Composite sampling sums operands at that position. A tracer
may occupy any finite `y` the integrator produces.

**Policy after this generation:** keep unbounded finite `y` for physics
sampling. Do not add a global world-domain clamp because the
environmental profile grew.

### B. Environmental profile support

Explicit knots define `[minHeight, maxHeight]`.

Before this generation:

```text
h_min = 0 m
h_max = 2000 m
```

Live DEMO after this generation:

```text
h_min = 0 m
h_max = 12000 m
```

Outside that interval the profile **clamps** (`04` §8). Shear, vorticity,
and SRH **reject** layers that use clamped continuation
(`05` §8–§9, `09` § domain policy). That split stays.

### C. Storm-mechanism envelopes

Vertical bounds belong to the individual fields:

| Field | Current `08` DEMO bounds |
| --- | --- |
| `VerticalEnvelopeUpdraftField` | `baseHeight = 0`, `topHeight = 2000` |
| `LowerRadialInflowField` | `baseHeight = 500`, `topHeight = 1500` |
| `UpperRadialOutflowField` | `baseHeight = 1000`, `topHeight = 2000` |
| `RotationField` | height-independent (no envelope) |

This slice does **not** choose new values for those bounds.

After environmental expansion they occupy the **lower `0–2 km` of a
taller profile**. That intermediate state is allowed and intended.

### D. Rendering / view domain

Current `TracerScene` (`src/rendering/TracerScene.ts`):

```text
perspective FOV     50°
near                10 m
far                 50000 m
camera position     (4500, 3500, 4500) m
lookAt              (500, 1000, -500) m
XZ grid             8000 m
```

Default framing is the current `0–2 km` laboratory tower. The far plane
already admits orbiting a much taller column. Environmental mathematics
may expand before the default visual viewport does.

This slice does **not** change camera, grid, near/far, or projection.

---

## 4. Current laboratory vertical scale (as implemented)

Verified against `DEMO_SCENARIO`, `EnvironmentalWindProfile`,
`08`, and `TracerScene`:

```text
env knots:     0, 1000, 2000, 6000, 12000 m
               (eastward, northward) =
               (15, 5), (5, 15), (10, 25), (30, 20), (40, 10) m/s
storm motion:  C = (eastward 10, northward 0) m/s
updraft:       [0, 2000], W0 = 20 m/s, peak at 1000 m
lower inflow:  plateau y ≤ 500 m, G_in = 0 at y ≥ 1500 m
upper outflow: [1000, 2000], A_out = 0.01 1/s
rotation:      height-independent, Ω = 0.02 1/s
seeds:         y = 1000 m
dt:            0.1 s, Euler
hodograph overlay layer: [0, 1000] m
```

Storm envelopes remain the `08` `0–2 km` fixture inside the taller
environmental column.

This `0–2 km` column was a conscious laboratory fixture for building
mechanisms one at a time. It is not a claim that a supercell ends at
`2 km`.

---

## 5. Target explicit environmental top

Candidates considered:

```text
10 km
12 km
15 km
```

`docs/ARCHITECTURE.md` §5 describes a typical **future simulation /
view domain** of approximately `15–20 km` vertically. That is layer A/D
guidance, not an automatic choice of profile `h_max` (layer B).
`docs/CONCEPT.md` requires a sense of kilometers vertically; it does
not prescribe a profile top.

### Rejected: 10 km as this generation's `h_max`

A later deep updraft envelope is expected to occupy a large fraction of
the lower/mid tropospheric laboratory (order `8–10 km` is a plausible
future storm-envelope discussion, not a decision here). Putting
environmental `h_max` on that same lid would recreate today's problem:
the clamp sits on the storm lid, so any overshoot or later upper
mechanism immediately leaves explicit environmental support.

`10 km` also leaves little independent room for an upper-level
environmental regime above a future mid-level column.

### Rejected: 15 km as this generation's profile top

`15 km` is the round number that most easily reads as “cloud top /
tropopause.” This project does not yet model those objects. Choosing
`15 km` as **profile** support would invite that misreading.

The extra `12–15 km` interval would add a weakly pedagogical tail:
another knot, another clamp height, little new shear regime, and a
stronger temptation to treat the profile top as the storm top.

ARCHITECTURE's `15–20 km` remains a future **simulation/view** scale.
It is not this DEMO profile generation.

### Chosen: 12 000 m

```text
next explicit environmental top = 12000 m
```

Reasons:

1. Deep enough for a later deep convective column to sit **inside**
   explicit environmental support rather than on its lid.
2. Leaves distinct teaching bands:
   - `0–2 km` already-studied lower fixture;
   - `2–6 km` deep-layer environmental structure;
   - `6–12 km` upper environmental continuation.
3. Does not claim tropopause, anvil, or thermodynamic cloud top.
4. Leaves headroom: a later storm-envelope SoT may still choose an
   updraft lid below `12 km`, or a later profile generation may extend
   further, without this slice pretending to be the final atmosphere.
5. Numerically and visually still a laboratory column, not a mesoscale
   domain rewrite.

`12 km` is the **environmental support** top. It is not the world-domain
clamp, not the storm-envelope top, and not the default camera top.

---

## 6. Next DEMO wind knots

Preserve the current lower three knots exactly. Add two knots.

```text
height (m)   eastward (m/s)   northward (m/s)
0            15               5
1000         5                15
2000         10               25
6000         30               20
12000        40               10
```

`vertical ≡ 0` at every knot (`04`).

### Why preserve `0 / 1000 / 2000 m` and their current `(u, v)`

The `[0, 1000]` “nasty” hodograph overlay identity is locked in
`DEMO_SCENARIO` comments, `createEnvironmentalWindProfile.test.ts`, and
`demoHodographFixture.ts`:

```text
C = (10, 0)
shear[0,1000] = (-0.01, +0.01)
ω_h           = (-0.01, -0.01)
V_sr(0)       = (5, 5)
V_sr(1000)    = (-5, 15)
V_sr_avg      = (0, 10) → ŝ north, ĉ west
ω_s = -0.01 south; ω_c = +0.01 west
```

There is no strong physical reason to retune those winds for a prettier
deep hodograph. Extending upward isolates this slice to vertical
expansion.

Intended DEMO tracers remain at `y = 1000 m` inside the `08` storm
column. If they stay in `0–2 km`, they see the same environmental wind
as today.

### Why not stretch the existing three knots

Mechanically mapping `0 / 1000 / 2000` onto `0 / 6000 / 12000` would
destroy the already-studied lower shear, the overlay identity, and
SRH `[0, 1000] = -100`. That is a different experiment, not an
expansion.

### Why a knot at 6000 m

`0–6 km` is the laboratory deep-layer teaching interval: a new shear
regime above the `0–2 km` fixture, without claiming an operational
sounding recipe.

`docs/physics/09-storm-relative-helicity.md` forbids special-casing
operational layers `0–1 km` / `0–3 km` in the SRH API. Adding a `3 km`
knot would only densify the linear `2–6 km` segment; the path in
velocity space would not change. SRH on `[0, 3000]` remains available
by interpolation (`09` already samples `h0`/`h1` and splits at interior
knots).

An `8 km` knot is unnecessary if the upper flow is one continued turn.

### Why `(30, 20)` at 6000 m

Not collinear with the `2–12 km` chord. Linear interpolation from
`(10, 25)` at `2000 m` to `(40, 10)` at `12000 m` would give
approximately `(22, 19)` at `6000 m`. The chosen `(30, 20)` is a
visible hodograph kink: a new regime, not a stretched line.

Speed continues to increase. Direction turns back toward east
(`68°` toward at `2 km` → `34°` at `6 km`).

### Why `(40, 10)` at 12000 m

Continued speed increase, continued clockwise turn toward easterly
(`34°` → `14°`). Segment `6–12 km` has `ΔV = (+10, -10)`, which is
not parallel to `2–6 km` `ΔV = (+20, -5)`. Speed ≈ `41.2 m/s` is a
laboratory upper wind, not a tropopause jet claim.

Five knots total. Each additional level has a job. Do not add more
knots in this generation.

---

## 7. Physical character of the synthetic profile

This is an **explainable teaching fixture**, not a named realistic
supercell sounding.

Ground-relative speed (m/s) and toward-direction
(`atan2(northward, eastward)`, degrees north of east):

```text
height   speed    toward
0        15.811   18.43°
1000     15.811   71.57°
2000     26.926   68.20°
6000     36.056   33.69°
12000    41.231   14.04°
```

Qualitative path:

1. `0–1 km`: speed nearly constant, large backing/veering of the
   already-studied “nasty” segment.
2. `1–2 km`: speed increases, direction nearly holds then slightly
   returns.
3. `2–6 km`: speed continues up; direction turns clockwise toward
   east; new deep-layer regime.
4. `6–12 km`: slower shear, continued clockwise turn, weaker
   `|S|`.

Bulk shear (ground-relative `ΔV`, not a new API):

```text
0–6 km:   ΔV = (15, 15) m/s,  |ΔV| ≈ 21.21 m/s
0–12 km:  ΔV = (25, 5) m/s,   |ΔV| ≈ 25.50 m/s
```

Piecewise-linear interpolation implies corners at knots. Jumps in wind
are forbidden; corners in `dV/dh` at knots are the model.

No pressure levels, CAPE/CIN, temperature, dew point, sounding parser,
Coriolis, or PBL.

---

## 8. Extrapolation / clamp policy

Keep the existing primitive policy (`04` §8, implemented in
`EnvironmentalWindProfile.sampleAtHeight`):

```text
y < 0 m:      wind = knot 0     = (15, 5, 0)
0 ≤ y ≤ 12000: piecewise-linear through the five knots
y > 12000 m:  wind = knot 12000 = (40, 10, 0)
```

Do **not** introduce silent linear extrapolation above the last knot.

Clamp remains acceptable after expansion because:

1. It is the documented boundary of the primitive, not a claim that
   the real atmosphere is constant above `12 km`.
2. Diagnostics still refuse to treat clamped continuation as extra
   atmospheric observations. After this generation:

```text
verticalWindShearBetween(profile, h0, h1)
stormRelativeHelicityBetween(profile, C, h0, h1)
```

reject unless `h0 >= 0` and `h1 <= 12000` (and `h1 > h0`, finite).
Layers such as `[11000, 13000]` remain invalid.

3. The clamp is now far above the current `08` storm column, so the
   everyday `0–2 km` laboratory no longer lives on the clamp lid.

`EnvironmentalWindField` continues to sample `position.y` with that
same policy. No field-level extra clamp.

---

## 9. Storm motion

Keep:

```text
C = (eastward: 10, northward: 0) m/s
```

It is an independent scenario input (`07`, `01`). Do not derive a new
value from deep-layer wind. Do not introduce Bunkers or any other
motion estimator.

The `[0, 1000]` storm-relative geometry that the hodograph overlay
teaches remains valid if the lower knots are preserved.

Full-column storm-relative geometry changes because upper winds are
new. That is a consequence, not a reason to retune `C` in this slice.
If a later teaching story wants `C` nearer a deep-layer mean wind,
that is a **separate future retune decision**.

---

## 10. Hodograph consequences

`hodographPoints` is the knot list in height order (`10`). After this
generation:

```text
point count:  3 → 5
segment count: 2 → 4
```

### Hodograph points (ground-relative)

```text
height   eastward   northward
0        15         5
1000     5          15
2000     10         25
6000     30         20
12000    40         10
```

### Segment vectors and shear

`S = ΔV / Δh`. Horizontal vorticity `ω_h = (-S_n, S_e)` (`06`).

```text
segment     ΔV (m/s)     |ΔV|     S (1/s)                 |S|        ω_h (1/s)
0–1000      (-10, +10)   14.142   (-0.01, +0.01)          1.4142e-2  (-0.01, -0.01)
1000–2000   (+5, +10)    11.180   (+0.005, +0.01)         1.1180e-2  (-0.01, +0.005)
2000–6000   (+20, -5)    20.616   (+0.005, -0.00125)      5.1539e-3  (+0.00125, +0.005)
6000–12000  (+10, -10)   14.142   (+1/600, -1/600)        2.3570e-3  (+1/600, +1/600)
```

The first two rows are **regression identities** of the current DEMO.

### Viewport consequence (do not retune)

Hodograph UI autoscales to include the origin, all knot points, and
overlay expansion (`hodographViewTransform`). Faster/farther upper
knots **shrink** the on-screen `0–2 km` curve.

That is a documented visual consequence. Do not retune lower winds or
the `[0, 1000]` overlay layer to keep the old pixel size.

The DEMO overlay remains:

```text
vorticity layer:              [0, 1000]
streamwise/crosswise overlay: [0, 1000] with V_sr_avg of endpoints
```

Do not automatically expand the overlay to `0–6 km` or `0–12 km`.

---

## 11. Storm-relative and SRH consequences

Formulas unchanged. `C = (10, 0)`.

### `V_sr` at knots

```text
height   V_env        V_sr = V_env − C    |V_sr|
0        (15, 5)      (5, 5)              7.071
1000     (5, 15)      (-5, 15)            15.811
2000     (10, 25)     (0, 25)             25.000
6000     (30, 20)     (20, 20)            28.284
12000    (40, 10)     (30, 10)            31.623
```

### Streamwise / crosswise (analysis of segments)

The production overlay still uses `[0, 1000]` endpoint-average
`V_sr = (0, 10)` and remains:

```text
ω_s = -0.01    ω_c = +0.01
```

The following uses the same endpoint-average convention as the overlay,
applied to **new** segments for documentation only. It is not a new
API and not a new overlay layer.

```text
segment     V_sr_avg     ω_h                    ω_s        ω_c
0–1000      (0, 10)      (-0.01, -0.01)         -0.01      +0.01
2000–6000   (10, 22.5)   (0.00125, 0.005)        ≈ 0.00508  ≈ 0.00089
6000–12000  (25, 15)     (1/600, 1/600)          ≈ 0.00229  ≈ 0.00057
```

`1000–2000` is unchanged from the current profile; this SoT does not
re-own that overlay.

### SRH (Form B: `srh += u_b v_a − u_a v_b`)

`V_sr` components `(u, v)` = `(eastward, northward)`.

```text
segment SRH (m²/s²)
0–1000      -100
1000–2000   +125
2000–6000   +500
6000–12000  +400
```

Cumulative from `0`:

```text
[0, 1000]  = -100     // regression; overlay layer
[0, 2000]  = +25      // regression if lower knots preserved
[0, 3000]  = +150     // interpolated; 3000 m is not a knot
[0, 6000]  = +525
[0, 12000] = +925
```

At `3000 m` (interior of `2000–6000`, `f = 0.25`):

```text
V_env = (15, 23.75)
V_sr  = (5, 23.75)
```

`[0, 3000]` is a valid SRH query after expansion. It is **not** a
special API layer.

Signed full-column SRH is large and positive. The teaching overlay is
the negative `[0, 1000]` identity. Do not retune `C` or lower knots to
make `SRH[0, 12000]` “look like a supercell.” That would mix two
experiments.

---

## 12. Interpolation checks for new segments

Exact midpoints (linear in atmospheric components):

```text
y = 4000 m  (mid 2000–6000):  eastward = 20, northward = 22.5
y = 9000 m  (mid 6000–12000): eastward = 35, northward = 15
```

Continuity at knots: sampling exactly at `0, 1000, 2000, 6000, 12000`
returns that knot. Adjacent segments meet.

`EnvironmentalWindField` at `y = 4000` and `y = 9000` must match the
profile sample converted by the canonical atmospheric→world map
(`(x, y, z) = (eastward, 0, -northward)` because profile `vertical ≡ 0`).

---

## 13. Current storm fields after environmental expansion

**Do not change** `08` envelope numbers in this generation.

```text
updraft:        [0, 2000]
lower inflow:   plateau ≤ 500, zero at y ≥ 1500
upper outflow:  [1000, 2000]
rotation:       height-independent
seeds:          y = 1000 m
```

They temporarily occupy the lower `0–2 km` of a `12 km` environmental
column. That is an allowed intermediate laboratory state.

At `y ≥ 2000 m` after this generation:

```text
updraft contribution:        0
lower inflow contribution:   0   (already 0 for y ≥ 1500)
upper outflow contribution:  0
rotation contribution:       still nonzero (height-independent)
environment:                 interpolated 2–6–12 km winds,
                             not clamped to the old 2000 m knot
```

### Isolation of intended DEMO trajectories

Tracers that remain inside `0–2 km` see the same environmental wind as
today (lower knots preserved) plus the same `08` storm operands.

### Overshoot caveat (do not “fix” in this slice)

`RotationField` has no vertical envelope. Euler can already step a
particle slightly above `2000 m` (`06`/`07`/`08` documented edge).
Today that overshoot sees **clamped** `2000 m` environmental wind.
After expansion it sees **sheared** `2–6 km` environmental wind, still
plus rotation.

That is a real change for the overshoot edge, not for the intended
`y = 1000 m` probes. It is **not** a reason to keep the `2 km` clamp,
and **not** a reason to height-limit rotation in this slice. Rotation
envelope, if ever needed, belongs to a later storm-envelope SoT.

---

## 14. Why not stretch everything at once

Required migration order:

```text
deep environmental scaffold          ← this SoT, then its implementation
→ verify diagnostics / hodograph
→ separate storm-envelope scaling SoT
→ implementation of new updraft / inflow / outflow bounds
→ only then the next storm mechanism
```

Forbidden in one slice:

- extend the environment **and**
- stretch the updraft **and**
- move inflow/outflow **and**
- add downdraft.

Otherwise a changed trajectory has no attributable source.

The next storm-envelope scaling SoT (not this document) will decide
new vertical bounds for `VerticalEnvelopeUpdraftField`,
`LowerRadialInflowField`, and `UpperRadialOutflowField`. It must not
silently inherit `12000 m` as those bounds.

---

## 15. ScenarioConfig

No new global DTO field.

`environment.windLevels` is already an array of `{ height, eastward,
northward }`. Five knots fit the existing shape.

Do **not** add:

```text
scenario.topHeight
storm.topHeight
domain.topHeight
```

Heights already belong to:

- wind-profile knots (this generation);
- per-field envelopes (`08`, later a scaling SoT);
- renderer/camera configuration (`TracerScene`, later a rendering SoT
  if default framing must show a deep column).

`docs/architecture/01-scenario-config.md` already defers domain bounds
as not owned by the environment field model.

`01` §12 lists the live five-knot DEMO table and still keeps
`C = (10, 0)`. Do not add a global `topHeight` to `ScenarioConfig`.

DTO remains physics-import-free. No factory signature change.

---

## 16. Rendering implications

Production rendering is **not** changed by this SoT or by its first
implementation slice.

```text
grid 8000 m, camera (4500, 3500, 4500), lookAt (500, 1000, -500),
FOV 50, near 10, far 50000
```

still frame the `0–2 km` tower. Far `50 km` already allows a user to
orbit and see `12 km` if they choose.

A **separate rendering slice** is required when the default teaching
view must show a deep storm column (after storm-envelope scaling), or
if the hodograph panel needs a teaching viewport that does not shrink
the lower curve. It is **not** required merely because profile support
became `12 km`.

The deep-storm default view fixture is
`docs/rendering/11-deep-storm-tracer-view.md`. The hodograph teaching
viewport remains a later, separate UI decision.

Environmental mathematics may expand before the visual viewport.

Do not enlarge the grid only because `h_max` grew.

---

## 17. Seeds

Keep:

```text
(0, 1000, 0)
(600, 1000, 0)
(0, 1000, -600)
```

They remain diagnostic probes of the current lower storm fixture.
Future story/flow tracers at other heights are a separate task.

---

## 18. Numerical implications

Default: **no** change to `dt`, Euler, `timeScale`, or floating-point
test tolerances.

`y` of order `1.2e4` m is still trivial in IEEE-754 float64. The
integrator still receives `dt` from the scenario. There is no new
stiffness from a taller **environmental** column while storm vertical
velocities still vanish at `2 km`.

Do not change integration settings without a measured numerical
reason in a later slice.

---

## 19. Explicit non-goals

Do not start:

- downdraft;
- continuity solver;
- thermodynamic sounding;
- CAPE / CIN;
- pressure;
- temperature / dew point;
- cloud base / top;
- tropopause;
- anvil;
- precipitation;
- cold pool;
- gust front;
- PBL;
- Coriolis;
- Bunkers storm motion;
- tilting / stretching;
- mesocyclone;
- moving storm axis;
- new particles;
- renderer implementation;
- new vertical bounds for updraft / inflow / outflow;
- height-limiting `RotationField`;
- silent linear extrapolation;
- a global `stormTopHeight`.

---

## 20. Testing policy (future implementation)

Prefer DEMO-contract tests over duplicating `04`/`05`/`06`/`09` unit
suites.

### Must add or extend (DEMO / scenario layer)

1. Exact five knots and winds as in §6.
2. Interpolation of `2000–6000` and `6000–12000` (midpoints in §12).
3. Lower clamp `y < 0` → `(15, 5, 0)`; upper clamp `y > 12000` →
   `(40, 10, 0)`.
4. Continuity at all five knots.
5. `EnvironmentalWindField` height sampling at new knots and one
   interior height on each new segment; world `y` component remains `0`.
6. `hodographPoints` count `5`, ascending height order, exact winds.
7. Shear / vorticity on the two new segments match §10.
8. `V_sr` at `6000` and `12000` versus current `C`.
9. SRH `[0, 1000] = -100`, `[0, 2000] = +25`, `[0, 6000] = +525`,
   `[0, 12000] = +925` (exact integer Form B results above).
10. SRH `[0, 3000] = +150` as an interpolated-layer check, not a new
    API.
11. Shear/SRH reject `h1 > 12000` (for example `[11000, 13000]`).
12. Regression of the `[0, 1000]` nasty overlay identity
    (already in `createEnvironmentalWindProfile.test.ts`; must still
    pass).
13. No mutation of caller config / returned samples (existing
    ownership tests stay).
14. `ScenarioConfig` / `DEMO_SCENARIO` remain physics-import-free.
15. Storm DTO bounds unchanged from `08`.
16. Seeds unchanged.

### Must not duplicate without need

- generic `EnvironmentalWindProfile` construction errors;
- generic hodograph geometry tests on a non-DEMO three-level profile;
- renderer/camera tests;
- integrator/`dt` tests.

Hodograph overlay composition may keep asserting `[0, 1000]` only.
Do not expand overlay tests to `0–6 km` in this implementation.

---

## 21. Compact lock-in

```text
world-domain policy:          unbounded finite y; no global storm-top clamp
next explicit environmental top: 12000 m
wind knots:
  0 m:     eastward 15, northward 5
  1000 m:  eastward 5,  northward 15
  2000 m:  eastward 10, northward 25
  6000 m:  eastward 30, northward 20
  12000 m: eastward 40, northward 10
  vertical ≡ 0
lower 0–2 km preserved?:      yes, exact current (u, v)
above-profile policy:         clamp to last knot; no linear extrapolation
                              diagnostics reject layers above 12000 m
storm motion:                 keep C = (10, 0); no Bunkers
hodograph consequences:       3→5 points, 2→4 segments; overlay stays
                              [0, 1000]; autoscaled viewport shrinks
                              the lower curve
diagnostic consequences:      SRH[0,1000]=-100; SRH[0,2000]=+25;
                              SRH[0,6000]=+525; SRH[0,12000]=+925
current storm-envelope bounds: unchanged 08 fixtures in lower 0–2 km
current seeds:                unchanged at y = 1000 m
renderer consequence:         no production change; separate rendering
                              slice only when default view must show
                              a deep column
numerical consequence:        none by default (dt / Euler / tolerances)
next migration step:          implement this environmental scaffold;
                              verify diagnostics; then a separate
                              storm-envelope scaling SoT
```

---

## 22. Implementation slice (code, after this doc is accepted)

Production files expected to change:

- `src/scenario/DEMO_SCENARIO.ts` — `environment.windLevels` only
  (append `6000` and `12000`; do not edit the first three knots,
  `stormMotion`, storm envelopes, seeds, or `timestep`).

Tests expected to extend:

- `src/scenario/createEnvironmentalWindProfile.test.ts` — new knots,
  new-segment interpolation, clamp at `12000`, field sampling,
  SRH/shear on new layers, keep `[0, 1000]` regression;
- `src/simulation/demoCompositeUpdraft.integration.test.ts` — only if
  a DEMO hodograph assertion becomes knot-count specific; keep storm
  bound and seed assertions unchanged.

Docs pointers to update **during implementation** (not before):

- `docs/architecture/01-scenario-config.md` §12 knot list
  (`0 / 1000 / 2000 / 6000 / 12000` with the winds in §6);
- this document's “until implementation” live-DEMO sentences.

### What not to change

- `ScenarioConfig` shape (no `topHeight`);
- storm DTO bounds and factories;
- composition operand list;
- `EnvironmentalWindProfile` / diagnostic formulas;
- hodograph overlay layer `[0, 1000]`;
- `demoHodographFixture.ts` overlay heights (comments stay valid);
- `TracerScene` camera/grid/near/far;
- seeds;
- integrator / `dt`;
- `RotationField` (still height-independent);
- physics unit tests that use their own non-DEMO profiles.

Then:

1. `npm test`
2. `npm run typecheck`
3. **STOP.**

Do not start storm-envelope scaling, downdraft, or a rendering-domain
rewrite in the same slice.

---

## 23. Decisions left to the storm-envelope scaling SoT

That later document, not this one, must choose:

- new `VerticalEnvelopeUpdraftField` `baseHeight` / `topHeight`;
- whether the half-sine peak stays at mid-column;
- new `LowerRadialInflowField` plateau / taper;
- new `UpperRadialOutflowField` layer;
- whether `RotationField` gains a vertical envelope;
- whether seeds stay at `y = 1000 m` or new probes are added;
- whether default camera/grid must reframe the taller storm column;
- whether `C` should be retuned once the storm column is deep.

It must **not** assume those bounds equal `12000 m` just because that
is environmental `h_max`.

---

## 24. Core lesson

A taller laboratory atmosphere is first a taller **prescribed wind
column**. Storm envelopes, the camera, and the world-domain policy are
separate objects. Expanding the environment without stretching the
storm is how the project keeps the source of a later trajectory change
identifiable.
