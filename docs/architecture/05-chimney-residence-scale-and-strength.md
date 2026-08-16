# Chimney Residence / Scale-and-Strength

**Status:** research SoT. Production code was not changed.
`DEMO_SCENARIO` is frozen. Live frame for all measurements:
`StormRelativeLaboratory`. Integrator: Euler, `dt = 0.1` s.

Predecessor: `docs/architecture/04-story-tracers-seed-strategy.md`
(verdict C: no honest lower→upper story at the current fixture;
blocker is `t_sweep << t_ascent`, not seed choice).

This document answers:

    Which model change is the physically and architecturally
    justified way to make deep chimney residence *possible*
    in the current prescribed laboratory?

It does **not** retune production, pick a pretty trajectory, or
treat a successful parameter map as validation of a real supercell.

Story threshold: unchanged from `04` §2.

---

## 1. Verdict

**D. Mixed regime.**

The *bottleneck* is geometric timescale: a 1 km chimney under this
`|V_sr|(y)` is swept out before a half-sine parcel can occupy
mid-levels. That is the same diagnosis as `04`.

The justified *action* is not one extreme knob:

- widening `σ` while freezing `Ω`, `A_in`, `A_out` is **not** a
  pure geometry change (peak speeds scale as `σ`);
- widening `σ` while freezing peak speeds needs `σ ≳ 6 km` for
  the diagnostic axis (`H_up / σ → 1.3`), which abandons the
  chimney laboratory of `docs/rendering/10-deep-storm-envelope-scaling.md`
  §13;
- raising `W0` alone needs `~60–80 m/s` to compete at `σ = 1000 m`;
- raising `A_in` alone cannot complete the `04` story. It becomes
  a radial trap under a prescribed envelope that dies before
  outflow.

A moderate combination makes deep residence possible without those
extremes. Existence, not a magic triple:

```text
shared σ = 4000 m
W0       = 30 m/s
Ω, A_in, A_out rescaled so peak Gaussian speeds stay at live values
```

`C`, knots, envelopes, centers, frame, seeds, and renderer stay
out of this decision.

This is **not** verdict E: the current prescribed field family
*can* admit a lower→upper path. It is **not** verdict C: capture
is not the missing lever. It is **not** a production scaling
authorization.

---

## 2. Method

Offline Euler map against the live composition types, with
**local** storm parameters. `DEMO_SCENARIO` was not mutated.

```text
StormRelativeEnvironmentalAdvectionField(EnvironmentalWindField, C)
+ VerticalEnvelopeUpdraftField
+ VerticalEnvelopeRotationField
+ LowerRadialInflowField
+ UpperRadialOutflowField
```

Same `C`, same knots, same vertical bounds, same centers `(0, 0)`.
`A_out` never follows `A_in`. Exit `r > 4σ` or `t = 1200 s`.

Probes (not optimized for success):

| Name | Initial condition | Role |
| --- | --- | --- |
| `axis1000` | `(0, 1000, 0)` | live diagnostic axis |
| `diagEast` | `(600, 1000, 0)` | live diagnostic east |
| `south2s1000` | `(0, 1000, 2σ)` | dimensionless upstream, `04` basin azimuth |
| `south2s500` | `(0, 500, 2σ)` | same, lower in the inflow plateau |
| `basin04` | `(−500, 1000, 2500)` | `04` best lower basin in **metres** |

`south2s*` scales with `σ`. `basin04` does not. Diagnostic seeds
were not moved.

The sweep harness is **not** a production artifact. Numbers below
are the research record. Do not keep a retune oracle in the repo.

---

## 3. What `t_ascent` measures

Isolated on-axis half-sine, no horizontal wind, `E_r = 1`:

```text
Vy(y) = W0 * sin(π y / H)     on [0, H],  H = H_up = 8000 m

t(y1 → y2) = (H / (π W0)) ln | tan(π y2 / 2H) / tan(π y1 / 2H) |
```

This is the closed-form travel time of `docs/physics/15-vertical-updraft-envelope.md`
for a parcel that **stays on the axis**. It is a characteristic
**lower bound** on climb time: off-axis `E_r(r) < 1` slows `Vy`.

It is **not** `H / W0 = 400 s`. Constant-`W0` flight would ignore
the lids and the mid-peak. Near `y = 0` and `y = H`, `F → 0` and
ascent stalls. Mid-column is faster. So:

```text
H / W0              = 400 s     // naive, not used
1000 → 4000 (W0=20) = 206 s     // this SoT's mid-level mark
1000 → 5000 (W0=20) = 257 s     // first outflow-layer height
1000 → 7000 (W0=20) = 411 s     // deep column
```

`t_sweep ~ σ / |V_sr|(y)` is the time to cross one `σ` at the
**local** storm-relative environmental speed, ignoring inflow.
It is a local scale, not a trajectory integral. Because `|V_sr|`
grows with height on this sounding, a parcel that starts climbing
meets a faster free stream. Using only `y = 1000` understates the
problem aloft.

---

## 4. Current dimensionless / characteristic regime

Live fixture (`04` §3). Peak Gaussian speeds at `σ = 1000 m`:

```text
|v_r|_in  max = A_in  σ / √e ≈  3.03 m/s
|v_θ|     max = |Ω|   σ / √e ≈ 12.13 m/s
|v_r|_out max = A_out σ / √e ≈  6.07 m/s
```

`|V_sr|(y)` from the live 0–12 km sounding and `C = (10, 0)`
(same table as `04` §4):

| `y` m | `|V_sr|` | `t_sweep` s | `|v_in|_max / |V_sr|` | `|v_θ|_max / |V_sr|` | `W0 / |V_sr|` | on-axis `Vy / |V_sr|` |
| --- | --- | --- | --- | --- | --- | --- |
| 0 | 7.07 | 141 | 0.43 | 1.72 | 2.83 | 0 |
| 500 | 10.00 | 100 | 0.30 | 1.21 | 2.00 | 0.39 |
| 1000 | 15.81 | 63 | 0.19 | 0.77 | 1.26 | 0.48 |
| 1500 | 20.16 | 50 | 0.15 | 0.60 | 0.99 | 0.55 |
| 2000 | 25.00 | 40 | 0.12 | 0.49 | 0.80 | 0.57 |
| 4000 | 24.62 | 41 | ~0 | 0.49 | 0.81 | 0.81 |
| 6000 | 28.28 | 35 | 0 | 0.43 | 0.71 | 0.61 |
| 7000 | 28.38 | 35 | 0 | — | 0.70 | 0.27 |

`H_up / σ = 8`. That aspect is the chimney laboratory of `10` §13,
chosen when vertical envelopes went deep **without** retuning
horizontal scale.

Timescale ratio at the seed layer:

```text
t_sweep(1000) / t_ascent(1000→4000) = 63 / 206 ≈ 0.31
t_sweep(1000) / t_ascent(1000→5000) = 63 / 257 ≈ 0.25
```

Measured live core residence (`r < σ`) for the axis seed: **64 s**,
matching `t_sweep(1000)`, not `t_ascent`.

`W0 / |V_sr|` at `y = 1000` is already `O(1)`. That is the wrong
comparison for a half-sine chimney: the parcel feels `Vy = W0 F(y)`,
so `F(1000) ≈ 0.38` and `Vy / |V_sr| ≈ 0.48`. Trajectory slope
`dy / dr ~ Vy / |V_sr|`. Crossing one `σ` while climbing `~3000 m`
would need mean `dy/dr ≳ 3`. Live mean slope is `O(0.5)`, which
matches the measured axis `Δy ≈ 800 m`.

### 4.1 Order of ratios for *potential* deep residence

A characteristic, not a sharp oracle:

```text
t_sweep_char  ≳  t_ascent(y0 → 4000)
```

with `|V_sr|_char` taken along the climb, not only at `y = 1000`.
On this sounding `|V_sr|` is `~16 m/s` at 1 km and `~25 m/s` from
2 km up. Using `~20 m/s`:

```text
σ  ≳  20 m/s * 206 s  ≈  4100 m     for mid-level (4000 m)
σ  ≳  22 m/s * 257 s  ≈  5700 m     for outflow height (5000 m)
```

Equivalently, at frozen `σ = 1000 m`, `t_ascent` must fall to the
sweep scale:

```text
W0  ≳  20 * (206 / 63)  ≈  65 m/s    for 1000 → 4000
```

For radial capture as a *substitute* for width, `|v_r|_in max / |V_sr|`
would need `O(1)` in the inflow layer. That is a different regime
(§6) and still does not finish the story under the current
inflow envelope.

---

## 5. Lever `σ`

Current: `σ = 1000 m` on every storm operand (`10` §13 decision A).

Formulas (physics `13`, `14`, `16`, `17`, `18`):

```text
|v_θ|_max = |Ω| σ / √e
|v_r|_max = A   σ / √e
```

Two research branches. Neither is silent production policy.

### 5.1 Frozen rates (`Ω`, `A_in`, `A_out` unchanged)

Peak speeds grow linearly with `σ`. Geometry and strength move
together.

| `σ` m | `H_up/σ` | `|v_r|_in` | `|v_θ|` | `|v_r|_out` | axis story? | all five probes story? |
| --- | --- | --- | --- | --- | --- | --- |
| 1000 | 8.00 | 3.0 | 12.1 | 6.1 | no (`max y = 1786`) | no |
| 2000 | 4.00 | 6.1 | 24.3 | 12.1 | no (`3790`) | no |
| 2500 | 3.20 | 7.6 | 30.3 | 15.2 | **yes** | no |
| 3000 | 2.67 | 9.1 | 36.4 | 18.2 | **yes** | **yes** |
| 4000 | 2.00 | 12.1 | 48.5 | 24.3 | yes | yes |
| 8000 | 1.00 | 24.3 | 97.0 | 48.5 | yes | yes |

Geometric residence appears at `σ ≈ 2.5–3 km` **because** rotation
and radial peaks have also become several times stronger.
`|v_θ| = 36 m/s` is a plausible mesocyclone teaching number;
`|v_θ| = 97 m/s` is not a moderate retune.

### 5.2 Frozen peak speeds (rates `∝ 1/σ`)

This is the geometric question with strength held at the live
peaks (`3 / 12 / 6 m/s`).

| `σ` m | `H_up/σ` | axis `max y` | axis story? | upstream story? |
| --- | --- | --- | --- | --- |
| 2000 | 4.00 | 2689 | no | no (`south2s` reaches 4089, no outflow-near) |
| 3000 | 2.67 | 3871 | no | `south2s1000` / `basin04` yes |
| 4000 | 2.00 | 5054 | no (`coreDeep`, not outflow-near) | yes |
| 6000 | 1.33 | 6490 | **yes** | yes |
| 8000 | 1.00 | 7173 | yes | yes |

**Geometric `σ` for potential deep residence, at live peak
speeds:** about **6 km** for the diagnostic axis; about **4 km**
for the `04` upstream basin. That matches the characteristic
estimate in §4.1.

`H_up / σ = 1.3–1` is no longer the chimney of `10` §13. It is a
squat column as wide as it is tall.

### 5.3 Policy on rates versus peaks

Automatic renormalization is **not** adopted.

The two questions stay separate:

1. Geometry: `σ` must grow to a few kilometres, or climb time
   must fall, or both.
2. Strength: keeping current `Ω` and `A` while growing `σ` is
   allowed by the independent-parameter physics, but it is a
   **stronger storm**, not “the same storm, wider.”

If a later production slice changes `σ`, it must name the peak-speed
consequences explicitly. Default recommendation if that slice is
commanded: **hold live peak Gaussian speeds** (rescale `Ω`, `A_in`,
`A_out` with `1/σ`) unless the slice is intentionally a stronger
mesocyclone.

---

## 6. Lever `A_in` (current `σ`)

`A_out` frozen. Continuity coupling forbidden.

| `A_in` s⁻¹ | `|v_r|_in` m/s | `|v_r| / |V_sr|(1000)` | best `max y` | story? |
| --- | --- | --- | --- | --- |
| 0.005 (live) | 3.0 | 0.19 | 2556 | no |
| 0.010 | 6.1 | 0.38 | 2593 | no |
| 0.015 | 9.1 | 0.57 | 2669 | no |
| 0.026 | 15.8 | 1.00 | 3103 | no |
| 0.040 | 24.3 | 1.54 | 4038 | no (coreDeep, no outflow) |
| 0.080 | 48.5 | 3.07 | **4668 all ICs** | no |

At `|v_r|_in max ≈ |V_sr|(1000)`, climb improves only a few hundred
metres. That is consistent with `04`: inflow is zero on the axis;
off-axis it can only bend a crossing trajectory; `|V_sr|` still
grows aloft.

At `A_in = 0.08`, every probe saturates at the **same**
`max y = 4668 m`. That is an artificial radial well: parcels are
held until the prescribed inflow envelope reaches zero
(`topHeight = 4500 m`), then the free stream sweeps them before
the outflow layer (`[5000, 9000]`) can act. Core times grow, but
the `04` story still fails.

Inflow need not “beat” `V_sr` to be pedagogically useful. It also
**cannot** substitute for chimney width under this envelope family.
Required peak radial speeds for a trap (`≳ 25–50 m/s` at `σ = 1000 m`)
are not a reasonable teaching retune.

---

## 7. Lever `W0`

Half-sine times scale as `1/W0`. Peak world `Vy` on axis is `W0`
at `y_mid = 4000 m`.

| `W0` | `t(1000→4000)` | `t(1000→5000)` | axis `max y` | any lower story? | peak `Vy` |
| --- | --- | --- | --- | --- | --- |
| 20 | 206 s | 257 s | 1786 | no | 20 |
| 30 | 137 s | 171 s | 2203 | no (`basin04` 3705, coreDeep only) | 30 |
| 40 | 103 s | 129 s | 2689 | no (`basin04` 4833) | 40 |
| 60 | 69 s | 86 s | 3872 | **yes** (`south2s1000`, `basin04`) | 60 |
| 80 | 51 s | 64 s | 5055 | yes (axis still not outflow-near) | 80 |

`W0 = 60–80 m/s` is the order predicted in §4.1. It is a violent
prescribed updraft for a teaching laboratory whose current peak is
`20 m/s`. It also does not make the diagnostic axis a full story
even at `80 m/s`: the parcel can reach `~5 km` and still leave
`r < 2σ` as `|V_sr|` stays `~25 m/s`.

`W0` is a real lever on climb time. It is not a free “raise
faster” button.

---

## 8. Combinations

Single moderate changes that stay inside a teaching-plausible
band do **not** all pass `04`:

- `σ = 2000 m`, frozen rates: no story (`|v_θ|` already 24 m/s);
- `σ = 4000 m`, frozen peaks, `W0 = 20`: upstream yes, axis no;
- `W0 = 40` at live `σ`: no story;
- `A_in` at live `σ`: never a story.

Existence of a regime (selected rows; `story` = `04` threshold):

| Set | peak `\|v_θ\|` | peak `Vy` | axis | all five probes |
| --- | --- | --- | --- | --- |
| live | 12 | 20 | no | no |
| `σ=3000` frozen **rates** | 36 | 20 | yes | yes |
| `σ=4000` frozen **peaks** | 12 | 20 | no | no |
| `σ=6000` frozen peaks | 12 | 20 | yes | yes |
| `σ=2000` + `W0=30` frozen rates | 24 | 30 | yes | no |
| **`σ=4000` + `W0=30` frozen peaks** | **12** | **30** | **yes** | **yes** |
| `σ=4000` + `W0=40` frozen peaks | 12 | 40 | yes | yes |
| `σ=3000` + `W0=30` frozen rates | 36 | 30 | yes | yes |

The recommended **existence** regime is the bold row: restore a
column aspect `H_up / σ = 2` (the *pre-deep* aspect in `10` §13),
hold live horizontal peak speeds, raise `W0` by half.

That is a mixed change. It is milder than `σ = 6 km` at `W0 = 20`,
milder than `W0 = 80` at `σ = 1 km`, and it does not invent a
radial trap.

Do not treat this triple as the unique correct storm. Nearby
cells also work. The map’s job is existence.

---

## 9. Environmental geometry

Residence cannot be analysed only at `y = 1000`.

```text
|V_sr|(0)    =  7.07 m/s
|V_sr|(1000) = 15.81 m/s
|V_sr|(2000) = 25.00 m/s
|V_sr|(4000) = 24.62 m/s
|V_sr|(6000) = 28.28 m/s
```

`t_sweep` at `σ = 4000 m` is 253 s at 1 km and 160 s at 2 km.
A frozen-peak `σ = 4000`, `W0 = 20` axis parcel reaches `5054 m`
(`coreDeep`) and still fails outflow-near: the free stream aloft
finishes the sweep. Raising `W0` to 30 s, or `σ` to 6 km, is
what closes that last kilometre.

`C = (10, 0)` is not optimized here. Bunkers / a new storm motion
is not a solution to this slice (`04` §10.4 still holds: minimum
`|V_sr|` on this hodograph is 7 m/s at the ground).

---

## 10. Horizontal scale policy

Today updraft, rotation, inflow, and outflow share

```text
sigma  = 1000 m
center = (0, 0)
```

That sharing is a DEMO fixture, not a physics invariant. The API
already stores `sigma` per mechanism. Centers are **not** changed
in this slice.

### A. Shared DEMO `σ`

Simple. Superposition stays comparable. `10` §13 chose this so
that widening one operand would not silently hide another.

Cost: one number geometrically couples four mechanisms. Growing
shared `σ` at frozen rates grows all four peak speeds together.

### B. Independent `σ` per mechanism

Already representable. DEMO becomes a list of widths.

Spot checks (frozen live rates/peaks unless noted):

- Updraft `σ = 4000`, others `1000`: axis `max y` rises
  (`1786 → 3501`) because `E_r` stays large farther out, but
  core residence at `r < 1000 m` is still `~64 s`. No `04`
  story if “core” still means the narrow rotation/inflow scale.
- Updraft `4000`, others `1000`, scoring with the wide `σ`:
  similar to shared frozen-peak `σ = 4000` (upstream story,
  axis not).
- Updraft+inflow `3000`, rotation `1000`: upstream story,
  axis not. Holding rotation narrow removes part of the
  frozen-rate “all probes” success at shared `σ = 3000`.

Independent widths can be physically motivated (mesocyclone
narrower than updraft). They do **not** by themselves solve
residence, and they make the `04` threshold’s single `σ`
ambiguous. Not the first scaling move.

### C. Characteristic storm scale + derived widths

Coupling. Needs a separate contract (how rotation width, inflow
width, and outflow width are functions of one storm scale).
Forbidden as a silent outcome of this SoT.

**Policy for a later DEMO scaling slice, if commanded:** **A** —
keep a shared DEMO `σ`, change it explicitly, and name the
peak-speed policy from §5.3. Independent `σ` remains allowed in
the API for a later, labeled experiment. Do not introduce C.

---

## 11. Anti-oracles (observed)

This slice did **not**:

- move seeds until a path looked like a story;
- change `C`, knots, vertical bounds, centers, frame, or renderer;
- add downdraft, continuity, tilting/stretching, or a moving storm;
- couple `A_out` to `A_in`;
- treat the parameter map as validation of a real supercell.

The `04` story threshold is unchanged.

---

## 12. Before / after for the recommended existence regime

Live DEMO fixtures that would **stop** being invariants if this
regime were later adopted:

| Quantity | Live | Existence regime | Notes |
| --- | --- | --- | --- |
| shared `σ` | 1000 m | 4000 m | `H_up / σ`: 8 → 2 |
| `W0` | 20 m/s | 30 m/s | peak axis `Vy` +50% |
| `Ω` | 0.02 s⁻¹ | 0.005 s⁻¹ | frozen **peak** `\|v_θ\| ≈ 12.1` |
| `A_in` | 0.005 s⁻¹ | 0.00125 s⁻¹ | frozen peak `\|v_r\|_in ≈ 3.0` |
| `A_out` | 0.01 s⁻¹ | 0.0025 s⁻¹ | frozen peak `\|v_r\|_out ≈ 6.1` |
| axis `max y` | 1786 m | 6490 m | `04` story: no → yes |
| `t_sweep(1000)` | 63 s | 253 s | vs `t_ascent(1000→4000) = 137 s` at `W0=30` |

Unchanged in that hypothetical: `C`, knots, envelope bounds,
centers, diagnostic seeds, Euler `dt`, integration frame,
hodograph overlay identity.

`10` §13 “do not enlarge `sigma` to look like a supercell”
would be **revisited**, not silently overridden. The motive
here is residence possibility, not visual realism. `σ = 4000 m`
is still a laboratory scale, not a claim of observed updraft
diameter.

---

## 13. Is production scaling warranted?

**Not by this document.**

This SoT establishes:

- deep residence is possible inside the current field family;
- the justified path is a mixed `(σ, W0)` change with an explicit
  peak-speed policy;
- `A_in`-only, `W0`-only, and silent frozen-rate `σ` growth are
  the wrong first knobs.

A production scaling **decision** is now in
`docs/architecture/06-deep-chimney-scaling-demo-retune.md` (verdict A).
That SoT does not implement. Diagnostic seeds stay diagnostic
until a later story-seed slice, which `04` still forbids until
someone asks for those seeds after the model admits the path.

---

## 14. Compact lock-in

```text
verdict:                 D — mixed regime
bottleneck:              t_sweep << t_ascent at σ = 1000 m
                         under this |V_sr|(y); not seeds
not C:                   A_in-only → trap, no outflow story
not B:                   W0-only → 60–80 m/s, still weak on axis
not A-pure:              frozen-peak σ needs ~6 km (H/σ ~ 1.3);
                         frozen-rate σ=3 km works by also
                         strengthening |v_θ| to ~36 m/s
not E:                   prescribed family can admit the path
existence regime:        σ=4000, W0=30, frozen live peak speeds
scale policy:            A — keep shared DEMO σ; no derived-width
                         coupling; independent σ later if labeled
C / knots / centers:     not this problem
harness:                 not kept in repo
production this slice:   none
next if commanded:       06 (verdict A: numbers frozen;
                         implementation + rendering still later)
```

Production code was not changed.
