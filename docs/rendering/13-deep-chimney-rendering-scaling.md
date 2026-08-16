# Deep Chimney Rendering Scaling

**Status:** implemented as view policy. Live camera/grid/glyph numbers
remain `docs/rendering/11-deep-storm-tracer-view.md`. This document
owns the decision that those constants do **not** change with the
`06` chimney retune. Production renderer code was not changed.

This document answers:

    Given the live DEMO storm (`σ = 4000 m`, diagnostic
    seeds at `r = 0.6σ`), what should the tracer-view fixture be?

It does **not** change physics, `DEMO_SCENARIO`, envelopes, `C`,
frame, or the renderer. It does not add story tracers, trails,
Gaussian meshes, or a follow camera.

---

## 1. Verdict

**Keep the `11` pose, grid extent, FOV, clipping, glyph radius, and
axes. Retire the pedagogical claim that one grid cell equals `σ`.**

Canonical future view fixture (metres, 1:1 world):

```text
grid size / divisions:     10000 m / 10     // 1000 m cells
camera position:           (12000, 6000, 12000)
target:                    (0, 4000, 0)
FOV:                       50°
near / far:                10 m / 50000 m
tracer glyph radius:       150 m
axes size:                 2000 m
```

These are the same numbers as `11`. The storm got wider; the
**laboratory cube** (`0–10000 m` vertical, `10 km` ground pad, SE 3/4
at `~17 km`) did not. Horizontal scale is read from seed spacing
and from how much of the pad a `σ`-core occupies, not from coupling
the ruler to `σ`.

**Joint DEMO release:** yes. Scenario retune (`06`) and this view
policy can ship together. Rendering **code** may be a no-op on
`DEEP_STORM_TRACER_VIEW`; rendering **docs** (`11` §13 reason 1,
glyph `= 0.15σ`, seed metres in `11` §17) must update in that
release. Scenario-only remains incomplete because seeds and stale
`11` prose would disagree.

---

## 2. Future storm this view must frame

From `06` (not live yet):

```text
σ = 4000 m
H_up / σ = 2
seeds at y = 1000:
  axis   (0, 1000, 0)
  east   (2400, 1000, 0)      r = 0.6 σ
  north  (0, 1000, −2400)
```

Vertical envelopes, env knots, centers, and integration frame
unchanged. Storm-active top still `9000 m`. Intended vertical frame
still `0–10000 m`. Env support `12000 m` is still not a view target
(`09`, `11` §7).

Visible teaching lengths (not meshes):

```text
seed spacing           2400 m
σ-core radius          4000 m     // peak of rotation / inflow Gaussians
04 “near storm”        r < 2σ = 8000 m
research exit          r = 4σ = 16000 m     // not a view target
```

The renderer still infers the column from helpers + glyphs. No
updraft cylinder.

---

## 3. Method

Same projection model as `11`: perspective `50°` vFOV, camera
`lookAt` target, `camera.up = (0,1,0)`. Horizontal FOV from aspect:

```text
desktop  aspect ≈ 1.70  →  hFOV ≈ 77°  (half 38.4°)
narrow   aspect ≈ 0.76  →  hFOV ≈ 39°  (half 19.5°)
```

Angles below are **camera-space** `atan2` of the view-right / view-up
components against depth (not the 3D cone angle alone). Half-vFOV =
`25°`. `IN` / `OUT` versus those halves.

Default pose distance to target: `17088 m`. Elevation `6.72°`.

No WebGL screenshots. The harness is not kept.

---

## 4. Vertical framing — unchanged

```text
default framed vertical range = 0–10000 m
```

Horizontal scaling is not a reason to raise the sky. `y = 12000`
must stay **outside** the default frustum so env `h_max` is not
presented as geometry.

At the current pose that split is `y = 10000` at `+20.0°` (`5°`
margin) and `y = 12000` at `+26.2°` (OUT). Keep it.

---

## 5. Camera — keep `(12000, 6000, 12000) → (0, 4000, 0)`

Change the camera only if diagnostic seeds or the `σ`-core are not
framed. They are.

| Point | `v` deg | `h` deg | vFOV | narrow hFOV | wide hFOV |
| --- | --- | --- | --- | --- | --- |
| lookAt `(0,4000,0)` | 0 | 0 | IN | IN | IN |
| axis seed | −9.7 | 0 | IN | IN | IN |
| east `2400` | −11.4 | +6.1 | IN | IN | IN |
| north `−2400` | −8.3 | +5.1 | IN | IN | IN |
| `r = σ` east, `y = 0` | −16.3 | +10.9 | IN | IN | IN |
| `r = 2σ` east, `y = 0` | −21.2 | +25.4 | IN | **OUT** | IN |
| `y = 12000` axis | +26.2 | 0 | **OUT** | IN | IN |
| grid `10 km` SE corner | −24.5 | 0 | IN (0.5° lip) | IN | IN |

Seeds sit in the lower third, as in `11` §11.1, with `5–6°` of
horizontal room in the narrow panel (half-hFOV `19.5°`). The
`σ`-core at the ground is inside even the narrow layout.

`r = 2σ` is **not** a default-view requirement. `04` used it as a
story-threshold radius; `06` forbade the renderer from having to
show the full future path. East-ground `2σ` is in the desktop
layout and out of the narrow panel. That is acceptable.

### 5.1 Rejected: pull back

`(16000, 6000, 16000)` puts `r = 2σ` east inside the narrow hFOV
(`h = 18.0°`) but pulls `y = 12000` to `v = +19.9°` (**IN**).
`11` C5 / §7 forbade swallowing env `h_max`. Horizontal gain would
destroy the vertical four-way split.

Closer SE poses were already rejected in `11` (top margin). A due
south camera is still an OrbitControls option, not the default.

**FOV / near / far stay `50°` / `10` / `50000`.** Changing FOV to
fit a wider floor would fish-eye the column. `far = 50 km` still
clears a `17 km` pose plus orbit.

---

## 6. Grid — keep `10000 / 10`, retire `1 cell = σ`

`11` §13.2 reason 1 tied cell size to DEMO `σ`. That coupling was a
convenience at `σ = 1000 m`. It is not a spatial law, and it is
**not** required here.

### 6.1 What the pad should be

The ground grid is a **Reset-time metric ruler**, not a physics
domain and not the `4σ` exit disk.

At `σ = 4000 m` on the current `±5000 m` pad:

```text
seeds r = 2400 m     48% of half-width     (2.4 × 1000 m cells)
r = σ = 4000 m       80% of half-width
r = 2σ = 8000 m      overruns by 3000 m
```

The `σ`-core (diameter `8000 m`) nearly fills a `10 km` square.
That is the honest 1:1 reading of `H_up / σ = 2` inside the same
`10 km` laboratory cube `11` already chose to match framed height.
It is not a bug to be “fixed” by laying a mesoscale cloth under a
fat column.

### 6.2 Candidates

| Size / divisions | Cell | Verdict |
| --- | --- | --- |
| **keep `10000 / 10`** | `1000 m` | **Accepted** — 1 km metric ruler; pad matches vertical frame |
| `16000 / 8` | `2000 m` | Rejected as default: `2σ` at the rim; SE corner at this pose is `v = −40°` (below frustum); floor wider than framed height |
| `16000 / 16` | `1000 m` | Same extent problem; denser hatch |
| `20000 / 10` | `2000 m` | Rejected: `4σ`-ish cloth; SE `v = −58°`; looks like a domain |
| `12000 / 12` | `1000 m` | Rejected again: extent collides with env `h_max` as a number (`11`) |
| `10000 / 4` | `2500 m` | Rejected: too coarse; seeds would not sit on a readable count of cells |
| `10000 / 2.5` | `4000 m = σ` | Forbidden as a *goal*. Cell = `σ` is the coupling being retired; also not an integer division of `10` |

Growing the grid does **not** bring the near-side `2σ` disk into
this frustum: the SE ground already sits on the bottom lip. Extra
extent only lengthens the far (NW) rug, which is already in view.

### 6.3 Decision

```text
grid size       = 10000 m
grid divisions  = 10
cell            = 1000 m     // human kilometre, not σ
plane           = XZ, y = 0
```

```text
One grid cell is 1000 m. That is a scenario-independent spatial
reference. It is not DEMO sigma.
```

`grid / σ` becomes `2.5`. That ratio is not a teaching invariant.

---

## 7. Glyph radius — keep `150 m`

Spheres are **screen/readability markers**, not parcels and not
`σ` (`docs/physics/01-parcel-basics.md`). Do not scale `×4` with
`σ`.

At the unchanged pose, radius `150 m` is still `~1.0°` / `~8.4 px`
diameter in the `420 px` / `50°` host — the size `11` chose.

| Radius | Diameter at default pose | Axis–east gap (`2400 − 2R`) |
| --- | --- | --- |
| 150 m (keep) | ~8.4 px | 2100 m / ~53 px between centers (`6.3°`) |
| 200 m | ~11 px | 2000 m |
| 600 m (`×4`) | ~34 px | 1200 m — reads as a blob near `0.15σ` |

Axis–east angular separation `6.3°`; axis–north `5.2°`; east–north
`3.3°` (~28 px). All three Reset probes remain distinct with `150 m`
glyphs. North is farther from the SE camera (`d = 19.4 km` vs axis
`17.7 km`); perspective already differentiates them.

`11`’s side remark `150 m = 0.15σ` is **stale**. The radius was a
pixel budget, not a Gaussian fraction. After retune it is
`150 / 4000 = 0.0375σ`. That is correct for a marker.

---

## 8. Axes — keep `2000 m`

The triad is a **local origin legend**, not a storm-width bar.
Scaling it with `σ` would make an `8 km` cross — the class `11`
§14 forbade (fake axis / fake rotation tube).

`2000 m` remains `20%` of the framed height and `~6.7°` at `17 km`.
It is now `0.5σ` rather than `2σ`. That change is harmless: axes
do not encode `σ`.

---

## 9. Aspect / readability at `H_up / σ = 2`

World 1:1. No exaggerated Y.

```text
updraft height H_up     = 8000 m
σ-core diameter         = 8000 m     // 2 × 4000
```

On the default pose, `y = 0 → 8000` spans `~26°` of vFOV. An
`8000 m` horizontal length at peak height subtends the same order
(`2 atan(4000 / 16971) ≈ 26.5°`). The column reads as a **tower
whose width is comparable to its height**, not as the old needle
(`11` §8: on-screen ~`5:1` for a `10 km × 2 km` band).

That is the point of the `06` retune. Empty floor around a 1 km
chimney goes away. Filling most of the `10 km` pad is the new
laboratory, not a reason to stretch Y or pull the camera into
space.

---

## 10. Seeds, stories, and what the image is allowed to mean

Reset must show three distinct diagnostic probes. It does, at
`r = 2400 m`, without moving the camera.

The renderer is **not** required to follow their future paths, draw
inflow/outflow arrows, or paint Gaussians. After `06`, some lower
ICs can satisfy the `04` story threshold; that is a **model** fact.
This view still presents axis / east / north as lower-chimney
probes (`08`, `04`, `06` §7). North at `0.6σ` is downstream of
`V_sr` at `y = 1000` and is expected to look different in motion.
That is the diagnostic.

Forbidden in this fixture, as in `11`:

- story-seed set;
- trails / tubes / ribbons;
- follow camera / storm-relative camera;
- cloud, anvil, envelope meshes;
- visual `σ` ring.

---

## 11. Stale statements this SoT retires (at implementation)

- `11` §13.2 reason 1: cell size equals DEMO `σ`.
- `11` §15.2: `150 m = 0.15σ` as if that were the glyph contract.
- `11` §8 / §17 seed metres `600` and `H_up/σ = 8` as live.
- `06` §10 “grid/glyph blocking because numbers must change” — the
  **block was the missing decision**, not a mandatory number change.
  After this file, the view numbers are decided: they stay.

`11` remains the **live** fixture until the joint release. Then
this lock-in (§12) replaces `11`’s compact numbers; `11` becomes
the historical `σ = 1000 m` deep-column view.

---

## 12. Compact lock-in

```text
world scaling:                 1:1 meters; no exaggerated Y
default framed vertical range: 0–10000 m
                               (storm-active to 9000; env 12000 OUT)
camera position:               (12000, 6000, 12000) m   // keep
lookAt / target:               (0, 4000, 0) m           // keep
FOV:                           50°
near / far:                    10 m / 50000 m
azimuth / elevation:           SE 3/4, 6.72° as in 11
grid size / divisions:         10000 m / 10
cell:                          1000 m metric ruler; NOT sigma
axes:                          2000 m local triad; not scaled with σ
glyph radius:                  150 m screen marker; not 0.15σ
seeds framed at Reset:         axis / east 2400 / north 2400
                               distinct; not the lookAt
2σ disk in default frustum:    not required
pull-back camera:              rejected (would ingest y=12000)
story / trails / follow / mesh: forbidden
view config home:              rendering module, not ScenarioConfig
joint release with 06:         yes (implemented)
production this slice:         view constants unchanged; 11 prose updated
```

Renderer constants were not changed. `11` prose was updated.
