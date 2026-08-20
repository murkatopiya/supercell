# Story Reachability Audit v2

**Status:** research SoT. Production code was not changed.
Live frame for all measurements: `StormRelativeLaboratory`.
Integrator: Euler, `dt = 0.1` s (live DEMO).
Live fixture: `DEMO_SCENARIO` after the joint `06` + `13` release.

Seed *selection* after this audit:
`docs/architecture/08-story-seeds.md`. Story seeds are not installed
in production by either document.

Predecessors:

- `docs/architecture/04-story-tracers-seed-strategy.md` — verdict **C**
  on the *old* fixture (`σ = 1000 m`, `W0 = 20 m/s`). Historical.
  The §2 story threshold is reused unchanged.
- `docs/architecture/05-chimney-residence-scale-and-strength.md` —
  verdict **D**: mixed `(σ, W0)` existence regime.
- `docs/architecture/06-deep-chimney-scaling-demo-retune.md` —
  verdict **A**: that regime became the canonical DEMO.
  `06` used the `04` threshold only as validation of a retune map,
  not as a live story-seed authorization.

This document answers:

    With the live composite unchanged, does a lower-level initial
    condition now complete

        lower inflow → deep updraft/core residence → upper outflow

    as a continuous tracer path, and is that success a robust basin
    rather than one lucky seed?

It does **not** retune parameters, add story seeds to production, or
relabel the three diagnostic probes as a life cycle.

---

## 1. Verdict

**A. Robust full-story basin exists.**

The live prescribed composite admits the `04` lower→upper sequence
from a connected set of lower-level initial conditions. Success is
azimuth-dependent in the expected storm-relative sense (upstream /
south works; downstream / north fails) and is **not** a single IC.

Story-seed SoT may now be opened. Story seeds were **not** added here.

The three live seeds stay **diagnostic probes**. Axis and east happen
to pass the `04` letter; north fails. Passing does not change their
pedagogical role. Candidate story seeds, if later installed, should
come from the *interior* of the basin, not from those probes.

`04` verdict C is historical for `σ = 1000`, `W0 = 20`. It is not
re-asserted against the live fixture.

Not B: the successful set is a wide connected upstream sector at
several `r/σ` and every sampled `y0 ∈ [500, 1500]`, with 100%
neighbourhood survival in the interior. Edge ICs (live east at
`0.6σ`) are fragile; the interior is not.

Not C: deep residence is no longer “partial only.” Interior parcels
occupy `r < σ` at `y ≳ 3000` for `O(100 s)` and then sit in outflow
support at `r < 2σ` for `O(100–200 s)`.

Not D: no new pathology. No ground-crossing, no `05`-style radial
trap (identical `max y` saturation), no closed capture orbit.

---

## 2. Method

Offline Euler against the *live* composition, not a local retune map:

```text
StormRelativeEnvironmentalAdvectionField(EnvironmentalWindField, C)
+ VerticalEnvelopeUpdraftField
+ VerticalEnvelopeRotationField
+ LowerRadialInflowField
+ UpperRadialOutflowField
```

Same `EulerIntegrator`, same `dt = 0.1`, same `DEMO_SCENARIO` numbers.
No closed-form composite oracle. Exit when `r > 4σ` (`16000 m`) or
`t = 1200 s`.

Story threshold: **identical** to `04` §2. Not relaxed because the
new DEMO climbs higher.

1. Start in lower-inflow support: `y0 ≤ 1500 m`, `r0` of order `σ`
   (sweep admits `r0 ≤ 3σ`).
2. Occupy the updraft core: some interval with `r < σ` and
   `y ≳ 3000 m`.
3. Reach upper-outflow support while still near the storm:
   `y ∈ (5000, 9000)` and `r < 2σ`, with nonzero
   `UpperRadialOutflowField` (`v_r ∝ r G(y)`; `G = 0` exactly at
   the lids and on the axis).
4. Those stages occur **in order**, from one IC, without starting
   already in stage 2 or 3.

“Looks like it swirls,” `max(y)` at the `4σ` exit, a start at
`y0 ≈ 3000`, or an outflow graze at `r ≈ 2σ` after missing the
core, are not stories. Occupancy *times* are recorded so a
letter-pass graze can be distinguished from interior residence.

The sweep harness is **not** a production artifact. Numbers below
are the research record.

---

## 3. Frozen live laboratory

| Quantity | Value |
| --- | --- |
| Frame | StormRelativeLaboratory |
| `C` | `(eastward 10, northward 0)` m/s |
| shared `σ` | `4000 m` (all four storm operands) |
| `W0` | `30` m/s, updraft `[0, 8000]` |
| `Ω` | `0.005` rad/s, rotation `[0, 6500]` |
| `A_in` | `0.00125` s⁻¹, inflow plateau `y ≤ 1500`, zero `≥ 4500` |
| `A_out` | `0.0025` s⁻¹, outflow `[5000, 9000]` |
| Diagnostic seeds | `(0,1000,0)`, `(2400,1000,0)`, `(0,1000,−2400)` |

Peak Gaussian speeds (policy B of `06`; unchanged from the old
1 km laboratory):

```text
|v_r|_in  max = A_in  σ / √e ≈  3.03 m/s
|v_θ|     max = |Ω|   σ / √e ≈ 12.13 m/s
|v_r|_out max = A_out σ / √e ≈  6.07 m/s
```

Azimuth convention (same as `06`): world `0° = +X` east,
`90° = +Z` south, `180° = −X` west, `270° = −Z` north.

At `y = 1000`, `V_sr = (−5, +15)` atmospheric
(world `(Vx, Vz) = (−5, −15)`): downstream is north, upstream is
south.

---

## 4. Diagnostic seeds (still not story seeds)

Live Euler, StormRelativeLaboratory, `σ = 4000 m`:

| Seed | `max y` m | `min r` m | `t` `r<σ` s | `t` `r<2σ` s | `y≥4000` | `y≥5000` | outflow `r<2σ` | `04` story |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| axis `(0,1000,0)` | 6490 | 0 | 201 | 363 | yes (`r=2992`) | yes (`r=3972`) | yes, 163 s | **yes** |
| east `(2400,1000,0)` | 5259 | 2271 | 146 | 314 | yes (`r=5008`) | yes (`r=7932`) | yes, **2.9 s** | **yes** (graze) |
| north `(0,1000,−2400)` | 4277 | 2400 | 92 | 292 | yes (`r=8255`) | no | no | **no** |

None of the three is converted into a story seed.

**Axis.** Completes the sequence. Core occupation `t(r<σ, y≥3000) = 94 s`.
Enters outflow at `r ≈ 0.99σ` with later `|v_out|` up to `3.5 m/s`.
That is a real lower→upper transit. Its *job* remains the axis
probe: inflow and rotation are identically zero on `r = 0`, so the
early path is `V_sr` + updraft. Do not relabel it as the life-cycle
seed.

**East.** Letter-pass only. `r` at first `y = 5000` is `7932 m`
(`1.98σ`). Outflow-near occupancy is `2.9 s`. Peak `|v_out|` on the
whole path is `0.19 m/s`, attained *outside* `2σ`. Neighbourhood at
`Δ = 0.05σ` is `13/25`. This is the **edge** of the basin, not
interior residence. Keep as the cyclonic-flank diagnostic.

**North.** Downstream of `V_sr` at the seed layer. `min r = r0`;
radius only grows. Reaches `y = 4000` already at `r = 8255 > 2σ`.
Never occupies `r < σ` at `y ≥ 3000`. Never enters outflow support.
This failure is a diagnostic, not a bug (`06` §7).

---

## 5. Basin sweep

Polar grid, no parameter changes:

```text
y0     ∈ {500, 750, 1000, 1250, 1500} m
r0/σ   ∈ {0, 0.25, 0.5, 0.6, 0.75, 1, 1.25, 1.5, 2, 2.5, 3}
azimuth: 24 bearings, 15°  (0° = +X east)
n = 1205 lower-level ICs
```

| Flag | Count | Fraction |
| --- | --- | --- |
| `04` story | 514 | 42.7% |
| coreDeep (`r<σ` and `y≥3000`) | 525 | 43.6% |
| entered `y≥4000` | 707 | 58.7% |
| entered `y≥5000` | 588 | 48.8% |
| outflow-near | 560 | 46.5% |
| hit `tMax` inside `4σ` | 30 | 2.5% |
| `min y < −1` | 0 | 0 |

Story `max y`: min `5251`, median `6786`, max `7797`.
Story `t(r<σ)`: min `60`, median `228`, max `417` s.
Story `t(coreDeep)`: min `2.6`, median `119` s.
Story `t(outflowNear)`: min `1.7`, median `185` s.

The minima are the *edge* of the basin (east-like grazes). Interior
values sit at the medians, not the minima. High `max y` without
coreDeep is common on the west/downstream side and is **not**
counted as story.

### 5.1 Height

| `y0` m | Story | Fraction | Best `max y` m |
| --- | --- | --- | --- |
| 500 | 89 / 241 | 36.9% | 7658 |
| 750 | 98 / 241 | 40.7% | 7710 |
| 1000 | 103 / 241 | 42.7% | 7735 |
| 1250 | 108 / 241 | 44.8% | 7774 |
| 1500 | 116 / 241 | 48.1% | 7797 |

A full story exists at every sampled lower height, including the
bottom of the requested `500–1500` band. Higher `y0` inside the
inflow plateau is easier (`F(y0)` is larger) but is not required.

South, `r = σ`, remains story from `y0 = 400` through `1500`.
At `y0 ≥ 1600` the same IC still coreDeeps and reaches outflow;
it fails the *start-in-lower-inflow* clause, not the physics.

`y0 = 0` was not re-swept. The updraft lid `F(0) = 0` from `04`
still forbids a ground-plane start. That is not the blocker for
`y0 ∈ [500, 1500]`.

### 5.2 Normalized radius

| `r0/σ` | Story (all `y0`) | CoreDeep |
| --- | --- | --- |
| 0 | 5 / 5 (100%) | 5 |
| 0.25 | 116 / 120 (96.7%) | 116 |
| 0.50 | 85 / 120 (70.8%) | 88 |
| 0.60 | 70 / 120 (58.3%) | 74 |
| 0.75 | 59 / 120 (49.2%) | 61 |
| 1.00 | 46 / 120 (38.3%) | 48 |
| 1.50 | 33 / 120 (27.5%) | 33 |
| 2.00 | 25 / 120 (20.8%) | 25 |
| 3.00 | 15 / 120 (12.5%) | 15 |

Near-axis ICs succeed at almost every azimuth: they have enough
column to climb before `V_sr` finishes the sweep. Far ICs succeed
only from upstream, where they spend the inflow layer approaching
the chimney. That is geometry versus `V_sr`, not a thin lucky
radius.

### 5.3 Azimuth versus `V_sr`

At `y0 = 1000`, `r = 0.6σ`, 32 bearings:

```text
story: 0° … 202.5°     19 / 32
fail:  213.75° … 348.75°
east (0°)   yes
south (90°) yes
north (270°) no
```

Matches `06` §8 (`10/16` on `0°–203°`) independently on the live
composition.

At the same height, connected story sectors shrink with radius and
stay centred on south / SSE:

```text
r/σ = 0.6   YYYYYYYYYYYYYY..........   0°–195°   (24-bearing print)
r/σ = 1.0   ...YYYYYYYYY............   45°–165°
r/σ = 1.5   ....YYYYYYY.............   60°–150°
r/σ = 2.0   .....YYYYY..............   75°–135°
```

`Y` is a 15° bin. The pattern at `y0 = 500` is the same sector,
slightly narrower; at `y0 = 1500` it is slightly wider (east wraps
through `345°` at `r = 0.6σ`).

Downstream (`~270°`) never becomes a story at diagnostic `0.6σ`.
Near-axis (`r/σ ≤ 0.25`) can still story at north because the
parcel starts already in the core.

This is **not** capture. Successful parcels still exit at `4σ`.
Azimuth selects who is still inside `r < σ` when `y` reaches 3000,
and still inside `r < 2σ` when `y` reaches 5000.

---

## 6. Robustness

Interior neighbourhoods, `5×5` at `Δ = 0.05σ = 200 m`, same `y0`:

| Candidate | IC | Story | Neighbourhood |
| --- | --- | --- | --- |
| south `r=σ` `y=1000` | `(0, 1000, 4000)` | yes | **25 / 25** |
| SSE `r=1.5σ` `y=1000` | `r=6000`, `az=105°` | yes | **25 / 25** |
| south `r=0.75σ` `y=750` | `(0, 750, 3000)` | yes | **25 / 25** |
| axis `y=1000` | `(0, 1000, 0)` | yes | **25 / 25** |
| east `r=0.6σ` `y=1000` | `(2400, 1000, 0)` | yes (graze) | **13 / 25** |

One lucky seed would fail this test. The interior does not.

Sensitivity, ranked:

1. **Azimuth versus `V_sr`.** Primary. Downstream ICs are swept.
   Upstream / south–SSE is the basin core. This is expected and
   pedagogically useful; it is not fragility of the retune.
2. **`r0/σ`.** Secondary. The sector narrows as `r0` grows. Interior
   teaching radii `0.75–1.5` remain multi-bearing.
3. **`y0` in `[500, 1500]`.** Weakest of the three. Fraction moves
   only `37% → 48%`. South `r=σ` is story across the whole band.

Edge ≠ interior. Live east sits on the azimuthal boundary. That is
why it must not become a story seed even though it letter-passes.

The 30 `tMax` exits are slow high-altitude transits that have not
yet reached `r = 4σ = 16 km` by 1200 s. They are not the `05` §6
inflow trap (no shared `max y` lid). Example: `y0=500`, `r0=2σ`,
`az=135°` reaches `max y = 7103` at `min r = 4374` (never coreDeep)
and is correctly not a story.

---

## 7. Representatives

### 7.1 Interior success — south, `r = σ`, `y0 = 1000`

`(0, 1000, 4000)`. `max y = 7044`. `min r = 917`.
`t(r<σ) = 275 s`. `t(coreDeep) = 146 s`. `t(outflowNear) = 197 s`.
Enters `y=4000` at `r=1004`; `y=5000` at `r=1732` (`0.43σ`).
Peak `|v_out| = 5.51 m/s` (near the Gaussian peak `6.07`).

Sequence: starts in the inflow Gaussian → radius *falls* while
climbing → occupies the deep core → enters outflow well inside
`2σ` → `V_sr` plus outflow carry it out through `4σ`.

### 7.2 Diagnostic success — axis

See §4. Same order, slightly smaller core occupancy, outflow entry
near `r ≈ σ`. Inflow never acts.

### 7.3 Basin-edge letter-pass — east `0.6σ`

See §4. Core occupancy `17 s`. Outflow occupancy `2.9 s` at
`r ≈ 2σ`. Not a teaching story path.

### 7.4 Downstream failure — north `0.6σ`

See §4. `min r = r0`. `max y = 4277`. No coreDeep, no outflow.

### 7.5 High `max y` without a story — west, `r = σ`, `y0 = 1000`

`(−4000, 1000, 0)`. `max y = 6327`. Outflow-near `175 s` at
`r(y=5000) = 5502`. **`t(r<σ) = 0`.** Never occupies the core.
This is a mid-column intercept of outflow support from the side,
not lower→core→outflow.

### 7.6 Far upstream that still stories — south, `r = 2σ`

`(0, 1000, 8000)`. `max y = 6981`. Radius falls `8000 → 1979`
during the inflow layer, then coreDeep `148 s`, outflow at
`r=2229`. Slow approach, then the same sequence. Confirms the
basin extends to `r ~ 2σ` on the upstream bearing.

---

## 8. Mechanism attribution

No composite closed form. No capture / mesocyclone claim.
Operand-by-operand on the live paths:

**Storm-relative environmental advection** is still the largest
horizontal term at every sampled height (`|V_sr| ≈ 16 m/s` at
1 km, `≈ 25–28 m/s` from 2 km up). It sets who is upstream, who
is already leaving, and why every parcel eventually exits `4σ`.
It is why north fails and why west can graze outflow without
ever entering `r < σ`.

**Lower inflow** (`|v_r| ≲ 3.0 m/s`) remains much weaker than
`|V_sr|` in its own layer. On the axis it is identically zero.
On the south `r=σ` path it is the difference between a falling
radius (`4000 → 917 m` in ~150 s) and a crossing. It does not
create a stagnation point. It cannot save a downstream seed.

**Updraft** supplies all of `Vy`. On axis at `y=1000`,
`Vy = 11.48 m/s` versus `|V_sr| = 15.81`. By `y ≈ 2800` on that
path, `Vy ≈ 23.7` is comparable to `|V_sr| ≈ 24.3`. That slope
is what the 1 km chimney did not have. Off-axis `E_r` still
cuts `Vy`; that is why far / downstream ICs lose.

**Localized rotation** (`|v_θ|_max ≈ 12 m/s`) deflects paths
azimuthally. It does not bottle radius. South `r=σ` reaches
`min r = 917 m` then leaves; west never enters `r < σ`. Rotation
goes to zero above `6500 m` and as `E_r` dies. It is not why
outflow is reached.

**Upper outflow** is identically zero below `5000 m`. It begins
to matter once a surviving parcel is in `(5000, 9000)` at
moderate `r`. On south `r=σ`, `|v_out| > 0.5 m/s` from
`t ≈ 210 s` (`y ≈ 5300`, `r ≈ 2 km`) and peaks at `5.5 m/s`
near `y ≈ 6500`, `r ≈ 4.7 km` — then the largest *storm*
horizontal term, still smaller than `|V_sr| ≈ 28 m/s`. On east,
`|v_out|` never reaches `0.5 m/s`. On north it never acts.

**Continuity** is still not closed. Reaching outflow is a
geometric overlap of a slow-enough sweep with the prescribed
`[5000, 9000]` layer, not mass-consistent “what went up must
come out here.”

---

## 9. Old versus new residence regime

Characteristic times. Isolated on-axis half-sine (`05` §3;
`H = 8000 m`):

```text
t(y1→y2) = (H / (π W0)) ln | tan(π y2 / 2H) / tan(π y1 / 2H) |
t_sweep(y) ≈ σ / |V_sr|(y)
```

| Quantity | Old `σ=1000`, `W0=20` | Live `σ=4000`, `W0=30` |
| --- | --- | --- |
| `H_up / σ` | 8 | 2 |
| peak `\|v_θ\|`, `\|v_r\|_in`, `\|v_r\|_out` | 12.1 / 3.0 / 6.1 | **same** |
| `t(1000→4000)` | 206 s | 137 s |
| `t(1000→5000)` | 257 s | 171 s |
| `t_sweep(1000)` | 63 s | 253 s |
| `t_sweep / t_ascent(→4000)` | 0.31 | 1.85 |
| axis `t(r<σ)` measured | 64 s | **201 s** |
| axis `t(coreDeep)` | 0 | **94 s** |
| axis `max y` | 1786 m | **6490 m** |
| axis `04` story | no | **yes** |
| best lower `max y` (`y0≤1500`) | ~2924 m | **7797 m** |
| lower ICs with `y≥4000` | 0 | 707 / 1205 |
| lower ICs with outflow-near | 0 | 560 / 1205 |

Axis measured time to `y=5000` is `200 s`, versus the on-axis
formula `171 s`. The extra is off-axis `E_r < 1` as `V_sr` carries
the parcel out — the formula is a lower bound, as `05` said.

The improvement is the scale regime `05`/`06` chose: sweep time
now exceeds characteristic climb time at frozen horizontal peak
speeds, plus a moderate `W0` increase so the last kilometre still
clears aloft `|V_sr| ~ 25 m/s`. It is not a prettier seed and not
a new mechanism.

Old diagnostic residences (`30–64 s` in `r < σ`) matched
`t_sweep(1000)`, not `t_ascent`. Live axis `201 s` sits between
`t_sweep(1000)=253` and `t_sweep(2000)=160`, as `|V_sr|` grows
during the climb. Same physics, different dimensionless chimney.

---

## 10. Story seeds

**Not added to production.**

Diagnostic probes stay. Axis / east / north keep their mechanism
roles (`06` §7, rendering `08` and siblings).

If a later slice adds story seeds, pick from the
**interior** basin, with explicit normalized geometry, and keep
the two sets labeled apart:

| Role | Job | Must not |
| --- | --- | --- |
| Diagnostic | Show axis / east-flank / downstream at `y=1000`, `r=0` or `0.6σ` | Be sold as a life cycle |
| Story | Show one lower→core→outflow path | Sit on the basin edge or coincide with a diagnostic unless that coincidence is labeled |

Candidate geometry (not installed):

| Name | `(x, y, z)` m | `r/σ` | azimuth | `y0` |
| --- | --- | --- | --- | --- |
| `south_r1_y1000` | `(0, 1000, 4000)` | 1.0 | 90° south (upstream) | 1000 |
| `south_r1.5_y1000` | `(0, 1000, 6000)` | 1.5 | 90° south | 1000 |
| `south_r0.75_y750` | `(0, 750, 3000)` | 0.75 | 90° south | 750 |

All three have 100% `5×5` neighbourhoods at `Δ = 0.05σ` (the
second is in the same south sector as the measured SSE
`r=1.5σ` candidate). They do not coincide with the diagnostic
trio. They are not chosen for a pretty spiral; they sit where
`r` at outflow entry is `O(σ)` or less and occupancy times are
`O(100 s)`.

Do not promote live east. Do not add a downstream “control”
as a story seed; north already is that control, as a diagnostic.

A follow-camera, trails, or copy that implies a real supercell
life cycle is out of scope.

---

## 11. What this is not

A robust basin is **not** validation of a real supercell.
Peak speeds stay laboratory-scale. `σ = 4000 m` is still a
teaching chimney.

This slice did **not**:

- retune `σ`, `W0`, `Ω`, `A_in`, `A_out`, `C`, envelopes,
  knots, frame, `dt` / Euler, or seeds;
- add downdraft, continuity, tilting/stretching, a moving storm,
  Bunkers, follow-camera, or trails;
- weaken the `04` threshold;
- treat north’s failure as a bug;
- keep the sweep harness.

---

## 12. Compact lock-in

```text
verdict:                 A — robust full-story basin exists
04 verdict C:            historical (σ=1000, W0=20); not live
threshold:               04 §2, unchanged
diagnostic axis:         story letter-pass; keep as diagnostic
diagnostic east:         letter-pass graze (r≈2σ, 2.9 s); keep
diagnostic north:        fail; downstream; not a bug
basin:                   connected upstream/south–SSE;
                         all y0 in [500,1500]; r/σ from 0 to ~2
                         on the upstream bearing
interior neighbourhood:  25/25 at Δ=0.05σ
story-seed SoT:          may open
story seeds this slice:  none (candidates recorded, not installed)
blocker remaining:       none for the 04 path from lower ICs;
                         downstream sweep and F(0)=0 remain
                         honest laboratory facts
next:                    story-seed SoT (install interior
                         candidates; keep diagnostic trio)
not next:                retune, downdraft, Bunkers, moving storm,
                         follow-camera, trails
production this slice:   none (04 status banner only)
```

Production code was not changed.
