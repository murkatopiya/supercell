# Composite Near-Ground Radial Outflow Demo

**Status:** live DEMO occupant/wiring SoT. Seventh operand is in
`DEMO_SCENARIO.storm.nearGroundOutflow`,
`createNearGroundRadialOutflowField`, and both integration-frame
composites. Live pedagogy is still DownwardPathline (D1). No
near-ground seeds. S1/S2 remain StoryPathlines occupants (`08`).
Camera, grid, glyphs, and trail visuals are unchanged.

Physics of the primitive:
`docs/physics/21-near-ground-radial-outflow.md`.

Independence / no-cold-pool / no-D1-source:
`docs/architecture/13-post-downdraft-checkpoint.md`.

Live sixth operand:
`docs/rendering/15-composite-downdraft-demo.md`.

Lower inflow (the other near-ground horizontal occupant):
`docs/physics/17-lower-radial-inflow-field.md`,
`docs/rendering/08-composite-lower-radial-inflow-demo.md`,
`docs/rendering/10-deep-storm-envelope-scaling.md`.

Continuity anti-claims:
`docs/architecture/10-composite-continuity-mass-budget-audit.md`.

Ground / tracer-floor policy:
`docs/architecture/11-ground-atmospheric-domain-policy.md`.

Live story seeds:
`docs/architecture/08-story-seeds.md`.

Downward exhibit:
`docs/architecture/12-downward-ground-impact-pedagogy.md`.

Live view fixture:
`docs/rendering/11-deep-storm-tracer-view.md`,
`docs/rendering/13-deep-chimney-rendering-scaling.md`.

---

## 1. Purpose

This document chooses **one canonical DEMO occupant** for
`NearGroundRadialOutflowField` as a seventh independent prescribed
operand in the StormRelativeLaboratory.

It answers:

    Where, how wide, how tall, and how strong should the first
    prescribed near-ground radial outflow sit, so that it is a
    real near-ground divergent V_h mechanism, not causally tied
    to D1, not a second mid-level outflow, and not a cancellation
    of live lower inflow?

It is **not**:

- a new pedagogy mode or near-ground seed array;
- a cold pool, gust front, density current, RFD, or FFD;
- a continuation of D1, or D1 landing as a source;
- a sign-flip of `LowerRadialInflowField`;
- a lowered `UpperRadialOutflowField`;
- `Vx`/`Vz` bolted onto `VerticalEnvelopeDowndraftField`;
- a continuity closure or a retune of `D0` / `A_in` / `A_out`;
- a S1/S2 or D1 seed rewrite;
- a renderer / camera / trail rewrite;
- a full pedagogy-mode lock (a recommendation is returned);
- a solver, pressure, buoyancy, or precipitation model.

The live App uses this occupant in the seven-operand sum. This
document owns the DEMO numbers. It does not add near-ground seeds.
Live pedagogy remains DownwardPathline.

---

## 2. Verdict

**A. A clean independent occupant exists.**

```text
center               (3000, 4000) m       // east 3000, south 4000
offset from origin   5000 m  (bearing SE)
                     1.25 σ_up
                     3.33 σ_ng
offset from downdraft axis (5000, 0)
                     4472 m = 2.24 σ_down = 2.98 σ_ng
offset from D1 landing (4723.5, −1308.4)
                     5581 m = 2.79 σ_down = 3.72 σ_ng
sigma_ng             1500 m               // not σ_up; not σ_down by law
outflowStrainRate    0.010991 s⁻¹         // A; peak |V_h| = 10 m/s
peak |V_h|           A σ / √e = 10 m/s    // at r = σ, entire plateau
baseHeight           0 m                  // G(0) = 1
topHeight            800 m                // G = 0 at and above 800 m
H                    800 m
```

Not family A (downdraft axis). Not D1 landing. Not origin /
chimney-relative. Not west. Not a copy of lower-inflow or
upper-outflow bounds.

Not B of the occupancy options: the locked exhibit fits the
current camera / pad. Pedagogy is a **mode recommendation**, not a
blocker of occupancy.

Not C: coaxial placement **does** conflict with live lower inflow
(§8). Offset placement does not null the chimney’s near-ground
inflow and does not require retiring `LowerRadialInflowField`.

Not D: the kinematic class of `21` is sufficient. Thermodynamics
are still forbidden as a name and as a model (`13`, `21`).

Critical anti-selection, measured not assumed:

```text
center = D1 landing     rejected as temptation control
center = downdraft axis rejected even though S1/S2 are
                        bit-identical to the six-operand baseline
```

S1/S2 remaining letter-identical is **not** a reason to sit on
the downdraft axis. Family A turns D1 itself into
descent-then-spreading (§4.1).

---

## 3. Method

Research only. Temporary scripts. Not tests. Not production. The
seventh operand was composed in memory on top of
`composeDemoTracerFields(StormRelativeLaboratory)` and discarded.
`DEMO_SCENARIO` was not edited.

```text
frame            StormRelativeLaboratory
integrator       Euler, dt = 0.1 s  (live)
duration         800 s (story / D1); 200 s (near-ground grid)
tracer domain    AtmosphericTracerDomain   // y = 0 floor
base stack       live six operands from composeDemoTracerFields
candidate        + NearGroundRadialOutflowField(params)
live seeds       S1 / S2 / D1 unchanged; never rewritten
research ICs     separate grid around the candidate ng axis
```

Live six-operand baseline (this run; matches `15` / `08` letter-pass):

| | S1 | S2 | D1 |
| --- | --- | --- | --- |
| IC | `(0, 1000, 4000)` | `(0, 1000, 6000)` | `(5000, 1000, 0)` |
| max y | 7029 m | 6989 m | — |
| min r (from origin) | 888 m | 1594 m | — |
| deep entry / occupancy | 133 s / 145 s | 178 s / 145 s | — |
| outflow entry | 204 s | 254 s | — |
| ground | none | none | **118.9 s** at `(4723.5, 0, −1308.4)` |
| `04` story / D1 contract | yes | yes | grounds; stays inactive |

Story letter-pass is the operational reading of `08` / `15`: start
in the lower layer, occupy the deep updraft (`y ≥ 3000 m` inside
`r < σ_up`) for O(100 s), enter upper outflow (`y ≥ 5000 m`),
remain active. No seed retune is allowed.

Near-ground research grid around a candidate axis:
`r / σ_ng ∈ {0, 0.5, 1.0, 1.5}` and azimuths east / south / west /
north (`0° = +X`). Start heights include `y = 0` (stack-fact
control) and `y = 100 m` (live-stack occupancy). Neighbourhood:
not one path.

Storm-relative environment of this DEMO, for placement (not a
reason to name flanks):

```text
C                  = (10, 0) eastward
V_sr(0)            = (+5, +5) eastward, northward
                   → world (Vx, Vz) = (5, −5)
|V_sr(0)|          ≈ 7.07 m/s
```

Peak horizontal speeds already in the live stack, for `A σ / √e`
comparison (not a coupling rule):

```text
|V_sr|(0)                  7.07 m/s
inflow peak A_in σ_in / √e 3.03 m/s
outflow peak               6.07 m/s
rotation peak              12.1 m/s   // G_rot(0) = 0; absent at y = 0
D0                         20 m/s     // vertical; not a V_h budget
```

At `y = 0`, rotation and updraft lids are zero. Composite `V_h`
is `V_sr` + lower inflow + (candidate ng outflow) + the
downdraft’s vertical sample. Continuity residual is **reported**,
never used as an optimization target (`10`, `13`, `21`).

---

## 4. Horizontal placement

`21` already made the primitive’s axis independent (`centerX`,
`centerZ`). Coincidence with the downdraft axis, D1 landing, or
the chimney origin is a DEMO fixture, not a physics law.
`13` §8–§9 forbid inheriting D1 landing as a source. This section
is the fixture argument.

Default probe unless a row says otherwise:

```text
σ_ng = 2000 m, peak |V_h| = 10 m/s, [baseHeight, topHeight] = [0, 800]
```

All three families below keep S1/S2 **letter-identical** to the
six-operand baseline at this envelope, because `G(1000) = 0`.
Story immunity is therefore **not** a placement discriminator.
D1, the near-ground basin, and the inflow conflict are.

### 4.1 Family A — centered on the downdraft axis `(5000, 0)`

Control. Same `(x, z)` as `VerticalEnvelopeDowndraftField`.

S1/S2: identical to baseline (max y 7029 / 6989, min r 888 / 1594).
That is the numerical temptation.

D1 under the composite seventh operand:

| | six-operand D1 | family A |
| --- | --- | --- |
| `t` ground | 118.9 s | **130.0 s** |
| landing | `(4723.5, −1308.4)` | `(4536.7, −2047.9)` |
| landing shift | — | **763 m** |

Isolated ng sample **along the unchanged live D1 path**
(six-operand trajectory; occupant sampled, not integrated):

| `t` | `y` | `r` from `(5000, 0)` | `G` | isolated `v_r` |
| --- | --- | --- | --- | --- |
| 0 s | 1000 m | 0 | 0 | 0 |
| 20 s | 760 m | 393 m | 0.079 | 0.25 m/s |
| 40 s | 550 m | 704 m | 0.471 | 2.57 m/s |
| 60 s | 373 m | 943 m | 0.743 | 5.17 m/s |
| 118.9 s | 0 | 1337 m | 1 | **8.82 m/s** |

The downward pathline **enters the plateau and skates**. A viewer
who sees D1 in this field is watching descent → spreading on one
trajectory. Copy cannot unsay that (`13` §10). Family A is the
surface analog of `Both`, even with `G(1000) = 0` at the IC.

Near-ground grid at `y = 100 m`: **0/13** still active at 200 s.
Axis hits the floor at **15.1 s** with `Δr` only 96 m. The
downdraft core (`Vy_axis(0) ≈ −6.18 m/s`) eats the spreading
window. This is not a near-ground radial basin. It is a brief
skate on the way to the same floor D1 already teaches.

**Reject A.** Numerical story-pass is irrelevant. The occupant
is not independent of the sixth mechanism in the only layer where
it is nonzero.

Landing-temptation control `A*` at `(4723, −1308)`:

- D1 landing shift 252 m, `t` ground 115.6 s;
- `y = 100` grid 2/13 active;
- center **is** the forbidden source.

**Reject A\*.** Measured so that “it looks nice” cannot sneak back
as an untested option. `13` already forbade it as policy; the
numbers agree.

### 4.2 Family B — offset from **both** the downdraft axis and D1 landing

Fixed probe (`σ = 2000 m`, peak 10 m/s, `[0, 800]`). S1/S2
identical in every row. Discriminators: D1 shift, basin, pad,
azimuth pedagogy.

| Center | D1 `t` / shift | `y=100` active / spread | Pad / `θ` at `y=0` | Notes |
| --- | --- | --- | --- | --- |
| south of down `(5000, 4000)` | 120.9 s / 132 m | 6/13 / 13/13 | in, `θ = 23.0°` | same easting as the downdraft column |
| SE `(3000, 4000)` | 120.1 s / **96 m** | 6/13 / 13/13 | in, `θ = 20.0°` | offset from axis **and** landing |
| east `(8000, 0)` | 123.9 s / 438 m | 6/13 / 13/13 | **out**, `θ = 31.5°` | off pad; beside the column |
| west `(−5000, 0)` | 118.9 s / **0 m** | **13/13 / 13/13** | in, `θ = 13.4°` | numerically cleanest basin |
| north of down `(5000, −4000)` | 114.0 s / **511 m** | 10/13 / 12/13 | north landings off pad | 2.7 km from D1 landing |
| near chimney `(2000, 2000)` | 121.0 s / 288 m | 5/13 / 12/13 | in | one south IC `Δr < 0`; inflow mixed |

**West is not the canonical occupant.** The basin is the most
robust (far from `Vy_down`), and D1 is untouched. The reason is
pedagogical, not numerical: west of this `C = (10, 0)` is the
rear-flank azimuth. `15` already refused west for the downdraft
on that ground. Repeating it here would invite RFD **and** “RFD
outflow” as a pair. `21` forbids baking that name into placement.

**North of the downdraft is not the canonical occupant.** It sits
2.7 km from D1 landing (`r / σ_ng ≈ 1.35` at `σ = 2000 m`). D1
shift 511 m. Peripheral ICs run to `z ≈ −5000 … −9000 m`, off the
`±5000 m` pad. It is the landing-adjacent cartoon from the other
side.

**East `(8000, 0)`** is off the current vFOV and pad. Same-easting
as the column plus “further east of D1.”

**South-of-downdraft `(5000, 4000)`** preserves a basin and a
modest D1 shift, but it shares the downdraft’s easting. A SE
camera looking at the origin sees a column and a surface patch
stacked on `x = 5000`. That is visual family A without being
numerical family A. Reject for independence-of-appearance, not
because it “looks like FFD.”

**Near-chimney `(2000, 2000)`** is a weaker offset: D1 shift
288 m, one research IC fails the outward `Δr` test, stronger
overlap with inflow. Not independent enough.

**SE `(3000, 4000)`** is the placement lock-in:

1. not the downdraft axis (4472 m);
2. not D1 landing (5581 m);
3. not the chimney origin (5000 m);
4. not west;
5. representative axis sits inside the pad and inside default
   vFOV (`θ = 20.0°`);
6. D1 remains a downward pathline to ground with a small
   landing shift, then **zero** isolated `v_r` at IC height
   (§10);
7. the `y = 100 m` grid maps outward `Δr` on **13/13** ICs,
   not one lucky trajectory.

East-of-origin / south-of-origin is **not** chosen because it
looks like FFD. Forward-flank naming is as forbidden as
rear-flank naming (`15` §4.2, `21` §31).

### 4.3 Family C — origin / chimney-relative `(0, 0)`

Control. Same axis as updraft / rotation / inflow / outflow.

S1/S2 again identical at `[0, 800]`. Axis sample at `y = 0` is
pure `V_sr = (5, −5)`: both radial fields vanish on `r = 0`.

Coaxial Eulerian `v_r` along `+X` at `y = 0`:

| `r` | live six-op `v_r` | C, `σ=2000`, peak 10 | C, `σ=4000`, peak 3.03 |
| --- | --- | --- | --- |
| 0 | 0 | 0 | 0 |
| 1000 m | +3.79 | **+11.06** | +5.00 |
| 2000 m | +2.79 | **+12.79** | +5.00 |
| 4000 m | +1.97 | +6.43 | +5.00 |

Live `v_r` along `+X` is already **outward**: `V_sr` eastward
(5 m/s) exceeds inflow (`≈ −1.2 m/s` at `r = 1000 m`). Family C
with peak 10 **amplifies** that and overwrites the storm-relative
inflow pattern around the chimney.

Matched-inflow temptation (`σ = σ_in = 4000 m`,
`A_ng = A_in = 0.00125`, peak 3.03 m/s): net radial storm field
at `y = 0` is **identically zero**. Leftover `|V_h| = |V_sr|`
at every scanned `r`. That is a null occupant, and it is exactly
continuity-style cancellation of `A_in`. Forbidden as a strength
rule and as a placement.

South-side research ICs on C / peak 10 (`az = 90°`): `Δr` is
**negative** at `r / σ ≥ 1` (`−111 m`, `−467 m`). SR + inflow
from the south overpower ng. There is no robust outward basin on
the story-approach azimuth.

**Reject C.** This is the occupancy-option-C failure mode: same
axis as `LowerRadialInflowField` in the same near-ground window.
An independent occupant must not be a signed second copy of the
chimney.

---

## 5. `sigma_ng`

Do **not** inherit the shared DEMO `σ = 4000 m`. That shared
value is a chimney-retune fixture (`06`), not a law (`21`, `10`).
Do **not** set `σ_ng = σ_down` because “the spreading scale of
the column.” Equality would be a coupling costume.

On lock-in center `(3000, 4000)`, peak 10 m/s, `[0, 800]`:

| `σ_ng` | D1 `t` / shift | isolated `v_r` on live D1 at ground | `y=100` active / spread |
| --- | --- | --- | --- |
| 1500 m | 119.1 s / **9.1 m** | **0.06 m/s** | 6/13 / 13/13 |
| 2000 m | 120.1 s / 96 m | 0.94 m/s | 6/13 / 13/13 |
| 2500 m | 122.2 s / 267 m | (larger tail) | 6/13 / 13/13 |

`E` at D1 landing from the lock-in axis:

```text
σ = 1500 m :  r / σ = 3.72 ,  E ≈ 0.0010
σ = 2000 m :  r / σ = 2.79 ,  E ≈ 0.020
σ = 2500 m :  r / σ = 2.23 ,  E ≈ 0.083
```

`σ_ng = 1500 m` is the lock-in:

- D1 landing shift is O(10 m), not a new landing;
- isolated ng on the live D1 path stays `≤ 0.11 m/s` through
  descent and `0.06 m/s` at the floor;
- the `y = 100 m` grid still spreads on 13/13 ICs;
- `σ_ng ≠ σ_up` and `σ_ng ≠ σ_down`.

`σ_ng = 2000 m` is a valid independent occupant. It is not
chosen, because it buys a larger footprint at the cost of a
visible D1 tail (`≈ 1 m/s` isolated `v_r` at landing) without
improving the research grid headline.

`σ_ng = 4000 m` was not used as an offset default. On this pad
it would be a mesoscale half-disk overlapping the chimney, the
downdraft, and D1 landing at once.

---

## 6. Vertical occupancy

Envelope family of `17` / `21`, not the half-sine of `16`:

```text
G = 1                                 y ≤ baseHeight
G = cos(π (y − baseHeight) / (2 H))   baseHeight < y < topHeight
G = 0                                 y ≥ topHeight
```

`G(0) = 1` whenever `baseHeight ≥ 0`. That is occupancy, not a
special case (`21`).

### 6.1 Plateau must include `y = 0`

`baseHeight = 0` does that: `y = 0` is on the plateau, taper
starts immediately above the datum.

`baseHeight = 200 m`, `topHeight = 1000 m` also has `G(0) = 1`
and was measured: S1/S2 unchanged, D1 shift 135 m at `σ = 2000 m`.
It is legal. It is not needed. The type does not require an
underground plateau to make `G(0)` work, unlike the downdraft
half-sine which needed `baseHeight < 0` so that `F(0) ≠ 0`
(`15` §6). Here `Vy ≡ 0`; the floor is not a lid of the field.

**Lock `baseHeight = 0`.** Honest occupancy. No fake subterranean
layer.

### 6.2 Taper must end low enough

Measured on `(3000, 4000)`, `σ = 2000 m`, peak 10 m/s (envelope
sweep; placement already chosen):

| Bounds | `G(1000)` | S1 max y / min r | D1 shift | Story |
| --- | --- | --- | --- | --- |
| `[0, 600]` | 0 | 7029 / 888 | 71 m | identical |
| `[0, 800]` | 0 | 7029 / 888 | 96 m | identical |
| `[0, 1000]` | 0 | 7029 / 888 | 121 m | identical (IC on the lid) |
| `[0, 1500]` | **0.50** | **7065 / 811** | 160 m | letter still, **dented** |
| `[0, 4500]` | **0.94** | **7194 / 361** | 191 m | letter still, **hijacked** |
| `[200, 1000]` | 0 | 7029 / 888 | 135 m | identical |

`G(y)` at the lock-in `[0, 800]`:

```text
G(0)    = 1
G(50)   = 1.00
G(100)  = 0.98
G(400)  = 0.71
G(800)  = 0
G(1000) = 0
G(1500) = 0
```

**Do not inherit lower-inflow bounds `[1500, 4500]`.** Copying
`topHeight = 4500` puts almost-full ng under S1/S2
(`G(1000) = 0.94`) and collapses S1 min r 888 → 361 m. That is a
second mid-level radial occupant on the story seeds, not a
near-ground field.

**Do not use upper-outflow bounds `[5000, 9000]`.** Half-sine
`G(0) = 0` (`21`). The type already forbids that envelope. A DEMO
must not reintroduce it as occupancy.

`topHeight = 1500 m` is the lower-inflow **plateau** height, not
its top. Even that is too high: `G(1000) = 0.5` dents S1.

**Lock `topHeight = 800 m`.** Fully below the story / diagnostic
seed layer `y = 1000 m`. Not a second mid-level outflow. Thick
enough that `G(100) ≈ 1` for research ICs. `topHeight = 600 m`
also works; 800 m is the clearer plateau-at-seed-height exhibit
without touching S1/S2.

---

## 7. Strength

```text
outflowStrainRate A > 0
|V_h|_max = A σ / √e     at r = σ, every y ≤ baseHeight
```

On lock-in `σ = 1500 m`, peak 10 m/s:

```text
A = 10 √e / 1500 ≈ 0.010991 s⁻¹
```

**Not tied to `D0`.** No `A = D0 / σ` or similar. Downdraft peak
is vertical.

**Not tied to `A_in = 0.00125` or `A_out = 0.0025`.**
`A / A_in ≈ 8.8`. Coaxial equality is the family-C null field
(§4.3).

**Not tuned to shrink `∇ · V`.** Axis `div_h = +2A ≈ 0.022 s⁻¹`
on the plateau. That is a source patch, reported in §12.

Peak 10 m/s versus live near-ground `V_h`:

| Quantity | Value | vs peak 10 |
| --- | --- | --- |
| `|V_sr(0)|` | 7.07 m/s | occupant is comparable, slightly stronger |
| inflow peak | 3.03 m/s | occupant is clearly stronger **on its own axis** |
| upper outflow peak | 6.07 m/s | different layer; not a budget |

Sweep on `(3000, 4000)`, `σ = 2000 m`, `[0, 800]`:

| peak `|V_h|` | `A` | D1 shift | `y=100` spread |
| --- | --- | --- | --- |
| 6 m/s | 0.00495 | 58 m | **10/13** |
| 10 m/s | 0.00824 | 96 m | **13/13** |
| 15 m/s | 0.01237 | 141 m | 13/13 |

Peak 6 m/s sits under `|V_sr|` and loses three research ICs to
the “did not increase `r` by 50 m” test. Peak 15 m/s is a larger
D1 tail with no basin gain. **Peak 10 m/s** is the lock-in class;
with `σ = 1500 m` the corresponding `A` is `0.010991 s⁻¹` and
D1 shift drops to 9 m (§5).

---

## 8. Composite conflict with `LowerRadialInflowField`

Both fields are fully on at `y = 0` (`G_in(0) = 1` because
inflow plateau is `y ≤ 1500 m`; `G_ng(0) = 1`). Superposition is
the live question.

### 8.1 Coaxial (family C) — reject

Same center, `v_r,net = (−A_in E_in + A_ng E_ng) r` plus `V_sr`.
Matched `A` and `σ` nulls the radial storm field (§4.3). Stronger
`A_ng` reverses the chimney. South-side ICs fail to spread. This
**would** be occupancy verdict C if it were the only legal
placement. It is not.

### 8.2 Offset lock-in — inward + outward without a coaxial null ring

Isolated samples along the origin → B line at `y = 0`,
lock-in `(3000, 4000)`, `σ = 1500 m`, peak 10 m/s:

| `s` (fraction of `|B|`) | `r` from origin | isolated `v_r` of inflow (from origin) | isolated `v_r` of ng (from origin) | isolated `v_r` of ng (from B) |
| --- | --- | --- | --- | --- |
| 0 | 0 | 0 | 0 | +0.21 m/s (tail) |
| 0.25 | 1250 m | −1.49 | **−1.81** | +1.81 |
| 0.50 | 2500 m | −2.57 | **−6.85** | +6.85 |
| 0.75 | 3750 m | −3.02 | **−9.71** | +9.71 |
| 1 | 5000 m | −2.86 | 0 | 0 |
| 1.25 | 6250 m | −2.30 | **+9.71** | +9.71 |
| 1.50 | 7500 m | −1.62 | +6.85 | +6.85 |

Read this carefully:

- From **B**, isolated `v_r` is outward everywhere it is nonzero.
  There is no sign-flip of the occupant.
- From the **chimney**, ng’s west side points **toward** the
  origin, so it **reinforces** inflow on the inner segment, then
  points away beyond B. Chimney-relative `v_r` changes sign
  around the patch.

That chimney-relative sign change is **not** a cancellation
annulus of two coaxial Gaussians. It is the geometry of an offset
divergent patch sitting in a concentric inflow. It must not be
sold as a gust front, a density-current head, or a staging
interface between “inflow air” and “outflow air.” Two prescribed
`V_h` fields added. No material front.

At the **origin**, isolated ng is a far tail (`E ≈ 0.0039`,
`v_r` from B ≈ 0.21 m/s). Chimney-axis inflow is not cancelled.
Diagnostic / story seeds at `y = 1000 m` see `ΔV = 0` because
`G(1000) = 0` (§9).

The live six-operand `v_r` along `+X` was already SR-dominated
(§4.3). Offset ng does not repair that, and must not be asked to.

**No staging-illusion lock-in on the occupant.** If a later
exhibit draws both a chimney-inflow pathline and an ng pathline
in one scene, that is a pedagogy question (§14), not a reason to
retire either field.

---

## 9. S1 / S2 regression

Lock-in composite versus six-operand baseline, 800 s, Euler 0.1 s:

| | S1 baseline | S1 + lock-in | S2 baseline | S2 + lock-in |
| --- | --- | --- | --- | --- |
| letter-pass | yes | **yes** | yes | **yes** |
| max y | 7029.2 m | 7029.2 m | 6989.0 m | 6989.0 m |
| min r | 887.6 m | 887.6 m | 1594.3 m | 1594.3 m |
| deep occupancy | 145.0 s | 145.0 s | 145.3 s | 145.3 s |
| outflow entry | 204.4 s | 204.4 s | 254.1 s | 254.1 s |
| ground | none | none | none | none |

Bit-identical at the reported precision. Expected:
`G(1000) = 0` and S1/S2 only ascend (`min y = 1000 m`).

Diagnostic probes at `y = 1000 m` (axis / east / north):
`ΔV = 0` under the lock-in occupant.

**No seed retune.** `topHeight = 1500 m` would have required one
or silently dented min r. That bound is rejected instead.

---

## 10. D1 regression

Lock-in composite:

| | six-operand D1 | + lock-in ng |
| --- | --- | --- |
| `t` ground | 118.9 s | **119.1 s** |
| landing | `(4723.5, −1308.4)` | `(4726.4, −1317.0)` |
| shift | — | **9.1 m** |
| still inactive after landing | yes | **yes** |
| moved after inactive | — | **no** |

Downward pathline to ground remains valid. The 9 m shift is a
far-tail perturbation, not a new landing.

Isolated ng along the **live** (six-operand) D1 path, lock-in
`σ = 1500 m`:

| `t` | `y` | `r` from B | `G` | isolated `v_r` |
| --- | --- | --- | --- | --- |
| 0 | 1000 m | 4472 m | 0 | 0 |
| 20 s | 760 m | 4749 m | 0.079 | 0.03 m/s |
| 60 s | 373 m | 5187 m | 0.743 | 0.11 m/s |
| 118.9 s | 0 | 5581 m | 1 | **0.06 m/s** |

D1 does **not** sample this occupant as a spreading mechanism.
Family A’s 8.82 m/s at the same floor is the contrast that
forbids axis coincidence.

Reactivation: `Simulation.step` skips `active === false`.
Domain exit is not a source (`11`, `12`, `13`). Sampling the ng
field at the landing does not restart D1. A **new** tracer
started at `y = 0` on the live stack still deactivates on the
first step, because `Vy_down(y = 0) < 0` everywhere the Gaussian
is nonzero (§11). D1 landing is not a field source by contract
and not a usable IC.

---

## 11. Near-ground radial basin (research seeds)

Separate IC set. Not S1/S2. Not D1. Not diagnostic probes.

### 11.1 `y = 0` is not a live-stack IC

Isolated `NearGroundRadialOutflowField` has `Vy ≡ 0`. An
isolated tracer at `y = 0` stays active and spreads (`21`).

The **live six-operand stack** does not: `F_down(0) = 0.309` and
`E_down > 0` everywhere, so `Vy(y = 0) < 0` at every finite
`(x, z)`. `AtmosphericTracerDomain` then deactivates on the
first proposed `y < 0`.

Measured, lock-in grid at `y = 0`: **0/13 / 0/13**. Far-corner
control `(8000, 0, 8000)` still has `Vy ≈ −7×10⁻⁴ m/s` and would
cross. This is a stack fact, not an occupancy failure of ng.

Research ICs must start **above** the floor.

### 11.2 Mapped basin at `y = 100 m`

Lock-in, 200 s, `r / σ ∈ {0, 0.5, 1.0, 1.5}`, four azimuths
(13 ICs):

```text
active still at 200 s :  6 / 13
Δr > +50 m            : 13 / 13
```

Axis IC `(3000, 100, 4000)`: grounds at **113.2 s** after
`Δr = +1648 m`, end `(3489, 0, 2427)`. Spreading is mapped;
the particle does not hover. The sixth operand’s vertical tail
(`Vy ≈ −0.5 m/s` at this axis, `y = 0`) still ends some
near-ground pathlines. That is honest composite behaviour, not
a reason to centre ng on the downdraft so that the floor arrives
in 15 s.

Azimuth split (lock-in `σ = 1500 m`, `y = 100 m`):

| `r / σ` | east | south | west | north |
| --- | --- | --- | --- | --- |
| 0 | ground 113 s, `Δr +1648` | — | — | — |
| 0.5 | ground 91 s, `Δr +1254` | active, `Δr +791` | active, `Δr +2290` | ground 69 s, `Δr +1190` |
| 1.0 | ground 88 s, `Δr +1086` | active, `Δr +473` | active, `Δr +1774` | ground 48 s, `Δr +796` |
| 1.5 | ground 93 s, `Δr +877` | active, `Δr +81` | active, `Δr +1192` | ground 36 s, `Δr +495` |

North of B points toward the downdraft / D1 side and hits the
floor sooner. South and west stay up and still increase `r`.
One lucky trajectory is not the exhibit; the grid is.

Start-height scan, same 13-point grid, lock-in:

| `y0` | active / spread / total |
| --- | --- |
| 0 | 0 / 0 / 13 |
| 50 m | 5 / 13 / 13 |
| **100 m** | **6 / 13 / 13** |
| 200 m | 6 / 11 / 13 |
| 400 m | 7 / 11 / 13 |

`y = 100 m` is the recommended research height: `G ≈ 0.98`,
full 13/13 outward map, not the floor, not the story layer.
`y = 200 m` already loses two ICs on the `Δr > 50 m` test
(`G(400) = 0.71` on the way up). Do not raise research ICs into
the taper just to keep them active longer.

A later pedagogy slice **may** store a subset of this grid. This
SoT does not freeze seed coordinates into `ScenarioConfig`.

---

## 12. Continuity residual (audit-only)

Identities (`17`, `20`, `21`), plateau `G = 1`, `y = 0`:

```text
div_h,in  = −A_in E_in (2 − r_in² / σ_in²)
div_h,ng  = +A_ng E_ng (2 − r_ng² / σ_ng²)
∇·V_down  = ∂Vy_down / ∂y     // no V_h on the sixth operand
```

Lock-in `A_ng ≈ 0.010991 s⁻¹`. Selected `y = 0` points
(horizontal parts plus downdraft vertical-div at `ξ = 0.1`):

| Point | `div_h,in` | `div_h,ng` | `∇·V_down` | sum |
| --- | --- | --- | --- | --- |
| origin | −2.50×10⁻³ | −3.87×10⁻⁴ | −6.56×10⁻⁴ | −3.54×10⁻³ |
| B axis | −2.50×10⁻⁴ | **+2.20×10⁻²** | −1.23×10⁻³ | +2.05×10⁻² |
| downdraft axis | −2.50×10⁻⁴ | −8.89×10⁻⁴ | −1.49×10⁻² | −1.61×10⁻² |
| D1 landing | −2.94×10⁻⁴ | −1.28×10⁻⁴ | −1.19×10⁻² | −1.24×10⁻² |
| B at `r = σ` | +1.07×10⁻⁴ | +6.67×10⁻³ | −1.96×10⁻³ | +4.81×10⁻³ |
| B at `r = σ√2` | +2.14×10⁻⁴ | ~0 | −2.02×10⁻³ | −1.80×10⁻³ |

Ng is a **source disk** for `r < σ√2` and a weak tail sink
beyond, while remaining radially outward (`21`). D1 landing
stays a **downdraft sink** (`∇ · V_down ≈ −0.012 s⁻¹`). Adding
ng does not close that sink and was not asked to.

Chimney residual of `10` stays **YELLOW**. A pointwise number
that happens to get smaller or larger is not a success metric.
`A` was not chosen to cancel `−2 A_in` or `∂Vy_down / ∂y`.

**Forbidden claims:**

```text
inflow + near-ground outflow = balanced low-level mass budget
downdraft sink + this source = the same air spreading
this patch is the continuity fix of 10
```

Hodograph is unchanged: it still consumes only the environmental
profile and `C` (`21` §30).

---

## 13. Renderer check

Audit only. View `11` / policy `13`. **No changes.**

```text
camera.position     (12000, 6000, 12000) m     // SE
target              (0, 4000, 0) m
FOV                 50°                        // half vFOV = 25°
grid                10000 m / 10               // pad ±5000 m
glyph radius        150 m
```

Angle = camera angle between look vector and the point. Inside
default vFOV iff `θ < 25°`.

| Point | World | `θ` | vs `±5000` pad |
| --- | --- | --- | --- |
| occupant axis `y = 0` | `(3000, 0, 4000)` | 20.0° | **inside** |
| research height | `(3000, 100, 4000)` | 19.6° | inside |
| `r = σ` east | `(4500, 0, 4000)` | 22.0° | inside |
| `r = σ` west | `(1500, 0, 4000)` | 19.2° | inside |
| `r = σ` north | `(3000, 0, 2500)` | 18.0° | inside |
| `r = σ` south | `(3000, 0, 5500)` | 23.3° | **z out of pad** |
| `r = 1.5 σ` east | `(5250, 0, 4000)` | 23.5° | x slightly out |

Not blocking. The locked exhibit (axis and `r ≤ σ` except due
south) fits the current SE 3/4 of the `0–10 km` laboratory cube.
Camera, grid, glyphs, and trails are **not** changed by this SoT.

South-peripheral ICs at `r = 1.5 σ` leave the pad (`z = 6250 m`).
Those ICs are not the locked exhibit. A later rendering sibling
**may** widen the pad; that is optional polish, not a blocker.

Family-B east `(8000, 0)` **would** have been a renderer block
(`θ = 31.5°`). It was already rejected on placement.

---

## 14. Pedagogy recommendation (not a lock)

This SoT does **not** add a `TracerPedagogy` value, does not
name the enum, and does not freeze a seed array into config.
`13` §10 already split Exhibit A (D1) from Exhibit B (prescribed
near-ground outflow) as two stories.

Recommendation:

```text
show ng research seeds in a separate pedagogy mode
never concatenate with D1
never concatenate with S1/S2
likely answer: separate mode only
```

**Can it ever share a scene with D1?** Default **no.** Combined
D1 + spreading is the surface analog of `Both` (`12`, `13`).
Lock-in independence (9 m landing shift, isolated `v_r` 0.06 m/s)
makes a *false* coupling cheaper to imply, not legal. Copy cannot
carry “this is not the same air” if both pathlines are on screen
and one of them ends on the floor.

**Can the seventh operand live in the always-on composite**, the
way the sixth does when StoryPathlines is selected? **Yes, as a
later wiring choice.** With this occupant, S1/S2 and diagnostic
probes are bit-identical; D1 remains a downward pathline. The
field can be present without being the live teaching object.
Presence ≠ exhibit. The **seeds** still need their own mode.

**Does DiagnosticProbes replace this?** **No.** Axis / east /
north stay at `y = 1000 m`, where this occupant is identically
zero. They cannot map a near-ground radial basin.

A later pedagogy SoT should own:

- the enum value;
- the seed array name and the stored subset of §11;
- whether live App switches to that mode or stays on
  DownwardPathline after wiring;
- `keepInactiveGlyphs` / trails for that mode;
- the explicit refusal of a combined D1-then-outflow mode
  until a model class that may claim related air exists.

This occupancy document only recommends: **separate mode only;
not with D1.**

---

## 15. What this occupant is not

- the return of S1/S2;
- the continuation of D1;
- D1 landing as a source;
- a continuity solver or mass-budget fix;
- RFD / FFD;
- cold pool / gust front / density current;
- a signed `LowerRadialInflowField`;
- a lowered `UpperRadialOutflowField`;
- `Vx`/`Vz` on `VerticalEnvelopeDowndraftField`;
- a ground-collision engine;
- a reason to retune `W0`, `A_in`, `A_out`, `Ω`, `D0`, shared
  `σ`, `C`, envelopes, camera, or live seeds.

Allowed wording remains `21`:

```text
prescribed near-ground divergent horizontal outflow
```

---

## 16. Later implementation order

Occupant wiring is done. Pedagogy seeds / a new `TracerPedagogy`
value are not.

When commanded, and not before:

1. pedagogy SoT, then a new mode + separate seed array;
2. **STOP** before cold pool, gust front, RFD/FFD, D1 coupling,
   combined-mode, or a solver.

---

## 17. Lock-in summary

```text
occupancy verdict:           A. clean independent occupant exists
                             not B (renderer/pedagogy do not block
                             occupancy; pedagogy is mode-only)
                             not C (coaxial C conflicts; offset B
                             does not retire lower inflow)
                             not D (kinematic 21 is enough)

center:                      (3000, 4000) m
offset from origin:          5000 m SE; 1.25 σ_up; 3.33 σ_ng
offset from downdraft axis:  4472 m (2.98 σ_ng)
offset from D1 landing:      5581 m (3.72 σ_ng)
sigma_ng:                    1500 m   (not σ_up; not σ_down)
A = outflowStrainRate:       0.010991 s⁻¹
peak |V_h|:                  10 m/s = A σ / √e
                             vs |V_sr(0)| ≈ 7.07; vs inflow peak 3.03
baseHeight:                  0 m      (G(0) = 1)
topHeight:                   800 m    (G(1000) = 0; not 17; not 16)
H:                           800 m

rejected family A:           downdraft axis — S1/S2 identical,
                             but isolated v_r on D1 → 8.82 m/s
                             and landing shift 763 m
                             = descent → spreading
rejected A* landing:         policy + measured coupling
rejected family C:           coaxial inflow null / reverse
rejected west:               RFD azimuth of this C
rejected [1500, 4500] / [5000, 9000]

S1/S2:                       bit-identical; no seed retune
D1:                          grounds at 119.1 s; shift 9.1 m;
                             stays inactive; isolated v_r 0.06 m/s
y = 0 ICs:                   0/13 on live stack (Vy_down < 0)
y = 100 research grid:       13/13 outward Δr; 6/13 still active
continuity:                  YELLOW; axis div_h,ng ≈ +0.022 s⁻¹;
                             not an optimization target
renderer:                    not blocking; no view change
pedagogy recommendation:     separate mode only; never with D1
implementation:              occupant wiring done; live App still
                             DownwardPathline; no ng seeds
```

---

## 18. STOP

Occupant wiring is live in both integration frames.
Live App is still DownwardPathline (D1). Occupant numbers unchanged.
S1/S2 remain StoryPathlines occupants. DiagnosticProbes unchanged.
No near-ground seeds. No camera / grid / glyph / trail visual change.
No cold pool, gust front, RFD/FFD, D1 coupling, combined-mode,
solver, or continuity retune.

STOP.
