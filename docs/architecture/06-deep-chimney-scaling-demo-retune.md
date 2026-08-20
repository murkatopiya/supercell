# Deep Chimney Scaling / DEMO Retune

**Status:** implemented. Live `DEMO_SCENARIO` uses the numbers in §1.
View constants: `docs/rendering/13-deep-chimney-rendering-scaling.md`
(keep `11`). Production physics formulas were not changed.

Predecessors:

- `docs/architecture/04-story-tracers-seed-strategy.md` — verdict C:
  live fixture admits no full lower→upper story.
- `docs/architecture/05-chimney-residence-scale-and-strength.md` —
  verdict D: prescribed family is viable; mixed regime exists;
  production scaling was not accepted there.

Live frame for all measurements: `StormRelativeLaboratory`.
Integrator: Euler, `dt = 0.1` s.

This document answers:

    Should the §05 existence regime become the new canonical DEMO
    fixture, under what scaling policy, and which other DEMO
    numbers must move with horizontal scale?

It does **not** retune production, add story seeds, or change the
renderer. Story threshold from `04` §2 is used only as validation,
not as an optimizer.

---

## 1. Verdict

**A. Accept candidate.**

Canonical live DEMO numbers:

```text
shared σ     = 4000 m          // scenario equality, not physics
W0           = 30 m/s
Ω            = 0.005 s⁻¹       // 0.02 * 1000/4000
A_in         = 0.00125 s⁻¹     // 0.005 * 1000/4000
A_out        = 0.0025 s⁻¹      // 0.01 * 1000/4000

peak |v_θ|   ≈ 12.13 m/s       // unchanged (policy B)
peak |v_r|in ≈  3.03 m/s
peak |v_r|out≈  6.07 m/s

diagnostic seeds at y = 1000 m:
  (0, 1000, 0)           axis
  (2400, 1000, 0)        east,  r = 0.6 σ
  (0, 1000, −2400)       north, r = 0.6 σ
```

Unchanged: `C`, knots, vertical envelopes, centers, Euler/`dt`,
`IntegrationFrame`, physics formulas.

**Live DEMO:** these numbers are in `DEMO_SCENARIO`. View constants
stay `11` (`13`). Story tracers were not added.

**Not** story tracers. `04` still forbids adding them just because
the model can now admit the path.

---

## 2. Scaling policy

When DEMO `σ` changes, what is held fixed?

### A. Frozen rates — rejected as DEMO policy

```text
Ω, A_in, A_out = const
|v_θ|_max, |v_r|_max ∝ σ
```

Physics treats `Ω`, `A`, and `σ` as independent, so this is
*allowed*. It is the wrong teaching policy: the live laboratory is
documented by peak Gaussian speeds (`~12 / 3 / 6 m/s`), not by
the inverse-time knobs alone. At `σ = 4000 m` this would give
`|v_θ|_max ≈ 48 m/s` and `|v_r|_out ≈ 24 m/s` — a stronger storm
smuggled in as “wider chimney.” `05` already used that branch as
research, not as DEMO law.

### B. Frozen peak horizontal velocities — **accepted**

```text
Ω_new     = Ω_old     * σ_old / σ_new
A_in_new  = A_in_old  * σ_old / σ_new
A_out_new = A_out_old * σ_old / σ_new
```

so that

```text
|v_θ|_max     = |Ω|  σ / √e
|v_r,in|_max  = A_in σ / √e
|v_r,out|_max = A_out σ / √e
```

stay at the live peaks.

This is a **DEMO scaling policy**, not a physical conservation law.
It is the rule that “the laboratory keeps the same peak mechanism
speeds and changes the horizontal scale (and, separately, `W0`).”

`A_out` follows `σ` under this policy because outflow is one of
the three Gaussian peak speeds being frozen. That is **not**
continuity coupling to `A_in`. `A_in` and `A_out` remain
independent scenario numbers that happen to share the same
`σ_old/σ_new` factor.

`W0` is **not** in this rule. Vertical peak speed is a separate
DEMO knob (`05`, and §5 below).

### C. Other policies considered

- **Frozen `W0`, grow `σ` until story appears.** At policy B,
  `σ = 5000 m`, `W0 = 20` already stories the *metre-fixed*
  diagnostic trio, but the **normalized** east seed `r = 0.6σ`
  fails (`04` validation). Same corner as `σ = 4000`, `W0 = 25`.
  Rejected as canonical: it only looks sufficient if seeds stay
  at 600 m.
- **Independent per-mechanism `σ`.** API already allows it. `05`
  §10 found no residence necessity. Not adopted (§6).
- **`storm.sigma` DTO.** Forbidden. Equality of four field
  `sigma`s is a scenario choice, not a new physics object.

---

## 3. Method

Offline Euler map. `DEMO_SCENARIO` was not mutated. Same composition
types as live SR lab. Policy B rates. Exit `r > 4σ` or `t = 900 s`.

**Named probes** (not optimized for success):

| Name | IC | Role |
| --- | --- | --- |
| `axis` | `(0,1000,0)` | live diagnostic axis |
| `east600` / `north600` | `r = 600 m` | live metre-fixed off-axis |
| `east0.6s` / `north0.6s` / `south0.6s` | `r = 0.6σ` | normalized diagnostic |
| `south2s` | `(0,1000,2σ)` | `04` upstream approach |
| `basin04` | `(−500,1000,2500)` | `04` metre-fixed basin |

**Robustness grid:** `y0 ∈ {500, 1000, 1500}`, `r/σ ∈ {0, 0.5, 1, 1.5, 2, 2.5, 3}`, 8 azimuths (`n = 49` per height, axis counted once).

**Azimuth basin:** 16 bearings at `y = 1000`, `r/σ ∈ {0.6, 1, 2}`. World `0° = +X` east, `90° = +Z` south. At `y = 1000`, `V_sr` world is `(−5, 0, −15)` (west and north); downstream is north, upstream is south.

The harness is **not** kept in the repo.

---

## 4. Candidate `σ` under policy B

`H_up = 8000 m` frozen.

| `σ` m | `H_up/σ` | `t_sweep(1000)` s | `W0=20` axis story? | `W0=30` axis story? |
| --- | --- | --- | --- | --- |
| 3000 | 2.67 | 190 | no (`max y = 3871`) | yes |
| 4000 | 2.00 | 253 | no (`5054`, `coreDeep`, not outflow-near) | yes (`6490`) |
| 5000 | 1.60 | 316 | yes (`5925`) | yes |
| 6000 | 1.33 | 380 | yes | yes |

`σ = 3000 m` never gives a comfortable basin: even at `W0 = 35`,
normalized `east0.6s` fails, and grid story at `y0 = 1000` is 27%.

`σ = 6000 m` works at `W0 = 20`, but `H_up/σ = 1.33` abandons the
column aspect that `10` §13 restored as a *target* when this SoT
widens the chimney (`H_up/σ = 2` was the pre-deep laboratory).
`2σ = 12 km` also exceeds the current ground grid.

`σ = 4000 m` restores `H_up/σ = 2`. It is **not** sufficient at
`W0 = 20` (axis fails `04`). It is sufficient once `W0` is in the
interior band of §5.

`σ = 5000 m` is a valid neighbor (see §8), not the pick: fatter
aspect, worse grid collision, and it is not required if `W0 = 30`.

---

## 5. `W0` at shared `σ = 4000 m` (policy B)

Isolated on-axis half-sine (`05` §3; `H = 8000 m`):

| `W0` | `t(1000→4000)` | `t(1000→5000)` | `t(1000→7000)` |
| --- | --- | --- | --- |
| 20 | 206 s | 257 s | 411 s |
| 25 | 165 s | 206 s | 329 s |
| 30 | 137 s | 171 s | 274 s |
| 35 | 118 s | 147 s | 235 s |

`t_sweep(1000) = 253 s` at `σ = 4000 m` is already `> t(1000→4000)`
for every row except that **aloft** `|V_sr| ~ 25 m/s` still cuts
the last kilometre at `W0 = 20`.

Named `04` validation at `σ = 4000 m`:

| `W0` | axis | east600 | north600 | east `0.6σ` | north `0.6σ` |
| --- | --- | --- | --- | --- | --- |
| 20 | no | no | no | no | no |
| 25 | **yes** | yes | yes | **no** (`4601`) | no |
| 30 | yes | yes | yes | **yes** (`5259`) | no |
| 35 | yes | yes | yes | yes | no |

`W0 = 20` is rejected at this `σ`: geometry alone does not unlock
the axis.

`W0 = 25` unlocks the **metre-fixed** live trio (`r = 600 m` is
then `0.15σ`, nearly on-axis). It does **not** unlock the
normalized east diagnostic. Rejected once seed policy B is
adopted (§7).

`W0 = 30` is the first value on this `σ` line where axis **and**
`r = 0.6σ` east pass `04`. North at `0.6σ` still fails: that seed
is downstream of `V_sr`. Failure there is a diagnostic, not a
reason to raise `W0` again.

`W0 = 35` adds margin (prettier `max y`, one extra NE sector).
It is the top of the moderate band studied here. Not chosen:
the job is not to maximize climb.

`W0 = 30` is therefore required **together with** `σ = 4000 m`
under normalized diagnostic seeds. Geometry at `W0 = 20` is not
enough. `30` is not a free “raise faster” button; it is a +50%
peak `Vy` that restores `t_ascent` to sit inside `t_sweep` with
aloft `|V_sr|`.

---

## 6. Shared `σ` policy

Keep four equal DEMO widths:

```text
updraft.sigma            = 4000
rotation.sigma           = 4000
lowerRadialInflow.sigma  = 4000
upperRadialOutflow.sigma = 4000
```

```text
Equality of sigma values is a scenario choice, not a physics
invariant.
```

Do **not** add `storm.sigma`. Do **not** change the independent-field
API. Independent widths remain representable for a later labeled
experiment; `05` §10 did not show a residence need for them.

---

## 7. Seeds

Live off-axis `r = 600 m`:

```text
σ = 1000 m  →  r/σ = 0.6     // current diagnostic flank
σ = 4000 m  →  r/σ = 0.15    // almost a second axis
```

Leaving 600 m unchanged would collapse east/north into near-axis
duplicates and silently make `W0 = 25` look sufficient.

### Choice

**Diagnostic contract kept. Off-axis radius follows `σ`.**

That is user-option **B** for the two off-axis probes, and **C**
for story seeds (none added).

```text
axis / east / north at y = 1000 m
east  = (+0.6 σ, 1000, 0)
north = (0, 1000, −0.6 σ)
```

At `σ = 4000 m`: `(0,1000,0)`, `(2400,1000,0)`, `(0,1000,−2400)`.

Semantics stay those of `docs/rendering/08-composite-lower-radial-inflow-demo.md`
and siblings: axis = `V_sr` + updraft (inflow/rotation zero);
east = cyclonic tangent / radial inflow on the Gaussian flank;
north = downstream of the `y = 1000` free stream.

They were **not** moved to pass `04`. After the retune, north at
`0.6σ` is expected to **fail** the story threshold. That is
honest. Future story seeds, if ever added, are a different
set (`04` §11).

---

## 8. Robustness (not an oracle)

`04` threshold is validation only.

Grid story fraction is never a majority. That is azimuth, not a
failed retune: downstream ICs are swept. The question is whether
an **upstream basin** exists, not whether 80% of all bearings
climb.

Azimuth basin at `y = 1000`, `r = 0.6σ` (16 bearings):

| Set | `04` story sectors | east (`0°`) | south (`90°`) | north (`270°`) |
| --- | --- | --- | --- | --- |
| `4000 / 25` | 8 / 16 (`45°–180°`) | **fail** | yes | fail |
| **`4000 / 30`** | **10 / 16 (`0°–203°`)** | **yes** | yes | fail |
| `4000 / 35` | 11 / 16 | yes | yes | fail |
| `5000 / 20` | 8 / 16 | fail | yes | fail |
| `5000 / 25` | 10 / 16 | yes | yes | fail |
| `5000 / 30` | 11 / 16 | yes | yes | fail |

`σ = 4000`, `W0 = 30` is the **opening** of a connected basin,
not a single lucky IC. Neighbors that also work:
`4000/35`, `5000/25`, `5000/30`. Equivalent opening:
`5000/25` (same 10/16 pattern).

Rejected as canonical:

- `4000/20` and `4000/25` — east `0.6σ` fails (`04`);
- `3000/*` — no comfortable normalized-east basin;
- `5000/20` — same corner as `4000/25`;
- `6000/20` — works, but `H_up/σ = 1.33` and `2σ` beyond the
  current grid without buying a different mechanism.

`W0 = 30` at `σ = 4000 m` is therefore not “the only cell that
passes.” It is the smallest pair that keeps `H_up/σ = 2`, policy B
peaks, and a multi-sector `0.6σ` basin including east.

Grid at that pair (`y0 = 1000`, `n = 49`): story 31%, `coreDeep`
31%, reach-4000 45%, outflow-near 35%, median `max y = 2877 m`
(the median is the failed downstream half — as expected).

---

## 9. Vertical envelopes

Unchanged:

```text
updraft        [0, 8000]
rotation       [0, 6500]
lower inflow   plateau y ≤ 1500, zero y ≥ 4500
upper outflow  [5000, 9000]
```

They remain logically compatible with `σ = 4000 m`:

- inflow is still a **lower** layer in height, not a function of
  `σ`;
- outflow still opens above `5000 m`, where a surviving parcel
  can now still be inside `r < 2σ`;
- rotation still occupies most of the updraft column;
- `H_up/σ = 2` is the intended aspect change, not a reason to
  shrink `H_up` back to 2 km (`10` forbade that class of move).

No envelope SoT is required. Do not retune bounds in the
implementation slice.

---

## 10. Grid / camera / glyph (evaluate only)

Live view fixture (`docs/rendering/11-deep-storm-tracer-view.md`,
`DEEP_STORM_TRACER_VIEW`):

```text
grid           = 10000 m, 10 divisions   // 1000 m cells
glyph radius   = 150 m
camera         = (12000, 6000, 12000)
target         = (0, 4000, 0)
```

| Ratio | live `σ = 1000` | candidate `σ = 4000` |
| --- | --- | --- |
| `grid / σ` | 10 | 2.5 |
| cell / `σ` | 1 (`11` §13.2 reason 1) | 0.25 |
| `2σ` vs grid half-width | 2000 vs 5000 | **8000 vs 5000** (`2σ` overruns the pad) |
| glyph / `σ` | 0.15 | 0.0375 |
| seed `r` / glyph | 4 | 16 if `r` scales; 4 if 600 m kept |

`11` explicitly tied cell size to DEMO `σ` and sized glyphs so
that seeds `600 m` apart stay separate at `0.15σ`. Both statements
go stale.

Camera at 17 km slant still frames `0–10000 m` vertically. The
open question was whether the pad must grow with `σ`.

**Research done.** `docs/rendering/13-deep-chimney-rendering-scaling.md`:
keep pose/grid/glyph numbers; cell = `1000 m` is a metric ruler,
not `σ`. `2σ` overrun of the pad is accepted as 1:1 `H_up/σ = 2`
inside the existing `10 km` laboratory cube. Pull-back is rejected
(`y = 12000` would enter the frustum).

---

## 11. Old vs candidate

| Parameter | Old (live) | Candidate |
| --- | --- | --- |
| shared `σ` | 1000 m | 4000 m |
| `H_up / σ` | 8 | 2 |
| `W0` | 20 m/s | 30 m/s |
| `Ω` | 0.02 s⁻¹ | 0.005 s⁻¹ |
| `A_in` | 0.005 s⁻¹ | 0.00125 s⁻¹ |
| `A_out` | 0.01 s⁻¹ | 0.0025 s⁻¹ |
| peak rotation | 12.13 m/s | 12.13 m/s |
| peak inflow | 3.03 m/s | 3.03 m/s |
| peak outflow | 6.07 m/s | 6.07 m/s |
| `t(1000→4000)` | 206 s | 137 s |
| `t_sweep(1000)` | 63 s | 253 s |
| `t_sweep / t_ascent` | 0.31 | 1.85 |
| seed `r / σ` (off-axis) | 0.6 | **0.6** (r: 600 → 2400 m) |
| `grid / σ` | 10 | 2.5 (cell stays 1000 m; not σ) |

Axis `max y`: 1786 m → 6490 m. `04` story on axis: no → yes.

### Stale DEMO statements after implementation

- `10` §13 decision A: keep `σ = 1000 m`, `H_up/σ = 8`, “do not
  enlarge `sigma` to look like a supercell.” Motive here is
  residence, not visual realism; that paragraph must be rewritten
  as historical.
- Audit Y3 “do not retune `σ` now.”
- `11` §13: cell size equals `σ`; glyph `150 m = 0.15σ`.
- `DEMO_SCENARIO` comments and `01` fixture tables: `σ`, `W0`,
  `Ω`, `A`, seeds.
- Rendering `03`–`08` lines that equate `600 m` with `0.6σ` remain
  *true* only if seeds scale; the metre values change.
- `05` “production scaling not authorized” — superseded by this
  file’s numbers; implementation still later.

Not stale: `C`, knots, envelope bounds, frame split (hodograph GR
vs 3D SR lab), physics field formulas, “no continuity coupling.”

---

## 12. What this is not

A successful basin is **not** validation of a real supercell.
Peak speeds stay laboratory-scale. `σ = 4000 m` is still a
teaching chimney, not an observed updraft diameter.

Do not, in the implementation slice:

- change `C`, knots, centers, envelopes, Euler/`dt`, frame;
- add continuity, downdraft, tilting/stretching;
- change physics formulas;
- add story seeds;
- retune the renderer “while we are here.”

---

## 13. Implementation scope

**Done** as a joint DEMO release with `13`.

### 13.1 Scenario retune

Live in `DEMO_SCENARIO`: four `sigma`s, `W0`, `Ω`, `A_in`, `A_out`,
diagnostic seeds as in §1. Tests freeze those numbers. Peak
horizontal speeds remain the pre-retune Gaussian peaks (policy B).

### 13.2 Rendering

`DEEP_STORM_TRACER_VIEW` numbers unchanged (`13`). `11` prose
updated (cell ≠ `σ`, glyph not `0.15σ`, seeds `2400 m`).

### 13.3 Explicitly later / not automatic

- story tracers / new seed set (`04`);
- `storm.sigma`;
- independent widths;
- Bunkers / `C`;
- translating storm.

---

## 14. Compact lock-in

```text
verdict:                 A — accept candidate
policy:                  B — freeze peak |v_θ|, |v_r|_in, |v_r|_out
                         (not a physical law)
canonical:               σ=4000 m, W0=30 m/s
                         Ω=0.005, A_in=0.00125, A_out=0.0025
peaks:                   ~12.13 / 3.03 / 6.07 m/s (unchanged)
shared σ:                DEMO equality; not storm.sigma
seeds:                   diagnostic axis/east/north;
                         off-axis r = 0.6 σ (2400 m);
                         no story seeds
W0=20 at σ=4000:         rejected (axis / east 0.6σ fail 04)
W0=25 at σ=4000:         rejected once seeds normalize
envelopes / C / knots:   unchanged
renderer:                13 — keep 11 numbers; cell ≠ σ
production this slice:   implemented (joint with 13 docs)
```

Production scenario fixture was updated to these numbers.
