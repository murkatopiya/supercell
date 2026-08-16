# Deep Storm Envelope Scaling

**Status:** the DEMO envelope numbers specified here are the live
fixture after the implementation slice, except that the live rotation
**occupant** is `VerticalEnvelopeRotationField` as specified in
`docs/rendering/12-composite-vertical-envelope-rotation-demo.md`.
This document remains the deep envelope geometry **before** localized
rotation: live updraft / inflow / outflow bounds, and historical
rotation-tube decision A (§10). Five-operand **introduction** remains
`docs/rendering/08-composite-lower-radial-inflow-demo.md`. Current
rotation occupant / wiring is `12`. Environmental knots remain
`docs/rendering/09-deep-environmental-profile-demo.md`.
DEMO default tracer-view numbers are live in
`docs/rendering/11-deep-storm-tracer-view.md`.
The camera numbers in §19 are the historical `0–2 km` pose.

## 1. Purpose

This document defines the next **DEMO laboratory fixture generation**
for the five current storm mechanisms, after environmental support
grew to `12000 m`
(`docs/rendering/09-deep-environmental-profile-demo.md`).

It answers:

    What vertical extents, horizontal scales, centers, seeds, and
    inherited YELLOW decisions make a deep-storm DEMO geometry that
    remains a prescribed controlled superposition, occupies
    meaningful lower / mid / upper bands of the 12 km environmental
    column, and does not silently stretch the current 0–2 km tower
    into a fake supercell?

Physics formulas remain those of:

- `docs/physics/13-rotation-field.md`
- `docs/physics/15-vertical-updraft-envelope.md`
- `docs/physics/16-upper-radial-outflow-field.md`
- `docs/physics/17-lower-radial-inflow-field.md`
- `docs/physics/12-composite-velocity-field.md`
- `docs/physics/04-environmental-wind-profile.md`

Live DEMO composition remains:

```text
EnvironmentalWindField
+ VerticalEnvelopeUpdraftField
+ RotationField
+ LowerRadialInflowField
+ UpperRadialOutflowField
→ CompositeVelocityField
```

This document owns:

- new DEMO vertical bounds for updraft, lower inflow, and upper outflow;
- the rotation height-independence decision (audit Y1);
- the wind-tunnel decision (audit Y15);
- DEMO centers and `sigma` (Y2, Y3);
- strength freeze versus retune;
- seed strategy (Y10);
- overlap table versus environmental knots (Y7, Y16);
- continuity trigger (Y13);
- renderer migration order (Y14);
- numerical status after the new gradients (Y11);
- stale-docs cleanup list;
- the future implementation slice, now the live DEMO envelope fixture.

It is **not**:

- a new canonical physics primitive;
- a realistic supercell;
- a mass-consistent storm;
- a pressure-coupled model;
- a cloud-top / tropopause / equilibrium-level model;
- a tilting / stretching / mesocyclone model.

Section 4 records the laboratory **immediately before** this generation.
After implementation, live bounds are §7–§9 / §25.

---

## 2. Why this document lives under rendering, not physics/18

The existing types already own their formulas:

| Type | SoT |
| --- | --- |
| `VerticalEnvelopeUpdraftField` | `docs/physics/15-vertical-updraft-envelope.md` |
| `LowerRadialInflowField` | `docs/physics/17-lower-radial-inflow-field.md` |
| `UpperRadialOutflowField` | `docs/physics/16-upper-radial-outflow-field.md` |
| `RotationField` | `docs/physics/13-rotation-field.md` |

This slice does **not** change those formulas, envelope families, or
constructors. It chooses new **DEMO numbers** and records the
YELLOW decisions that `docs/architecture/02-current-model-assumptions-audit.md`
required before any such numbers are wired.

That is the same class of ownership as `docs/rendering/03`–`09`.

Therefore:

```text
docs/rendering/10-deep-storm-envelope-scaling.md   // this document
```

Do not add a physics primitive doc unless a formula changes. Rotation
does **not** gain a vertical envelope in this generation (§10), so
there is no `docs/physics/18-…` here.

---

## 3. What was studied

Architecture and audit:

- `docs/CONCEPT.md`
- `docs/ARCHITECTURE.md`
- `docs/architecture/01-scenario-config.md`
- `docs/architecture/02-current-model-assumptions-audit.md`

Physics `00`–`10`, `12`–`17` (coordinates, parcels, velocity fields,
integration, environment diagnostics, composite addition, and the
four storm mechanisms). Isolated primitives `11` and `14` remain
non-DEMO occupants.

Rendering / DEMO:

- `docs/rendering/06-composite-vertical-envelope-updraft-demo.md`
- `docs/rendering/07-composite-upper-radial-outflow-demo.md`
- `docs/rendering/08-composite-lower-radial-inflow-demo.md`
- `docs/rendering/09-deep-environmental-profile-demo.md`

Implemented code: the five current operands, `ScenarioConfig` /
`DEMO_SCENARIO`, factories, `composeDemoTracerSimulation`,
`TracerScene` camera/grid, current seeds, and DEMO integration tests.

Audit entering this SoT:

```text
GREEN   18
YELLOW  16
RED      0
```

Mandatory YELLOW decisions for this document: Y1, Y2, Y3, Y5, Y7,
Y10, Y11, Y13, Y14, Y15, Y16. Y4, Y6, Y8, Y9, Y12, Y17–Y20 are
addressed where they touch the fixture, not re-litigated as new
physics.

---

## 4. Current laboratory (as implemented)

Verified against `DEMO_SCENARIO`, `08`, `09`, and `TracerScene`:

```text
env knots:     0, 1000, 2000, 6000, 12000 m
storm motion:  C = (eastward 10, northward 0) m/s  // diagnostic only
updraft:       [0, 2000], W0 = 20 m/s, y_mid = 1000 m
lower inflow:  G = 1 for y ≤ 500; taper 500–1500; zero ≥ 1500
upper outflow: [1000, 2000], A_out = 0.01 1/s, y_mid = 1500 m
rotation:      height-independent, Ω = 0.02 rad/s
centers:       all (0, 0) as DEMO fixture, not storm.center
sigma:         all 1000 m as DEMO fixture
seeds:         (0, 1000, 0), (600, 1000, 0), (0, 1000, −600)
dt / integrator: 0.1 s, Euler
camera:        (4500, 3500, 4500) → lookAt (500, 1000, −500)
grid / far:    8000 m XZ, far 50000 m
```

The `0–2 km` storm inside a `12 km` profile is the deliberate
intermediate state of `09`. This document replaces that storm
geometry. It does **not** replace the environmental knots, `C`, the
operand list, or the field types.

---

## 5. Four-way split (must not collapse)

Reaffirmed from `09` and audit G6:

| Layer | Owner after this generation |
| --- | --- |
| World / math sampling | unbounded finite `y` |
| Environmental explicit support | knots `0 … 12000 m`, clamp outside |
| Storm envelopes | **this document’s new DEMO bounds** |
| Rendering / view | still the current `0–2 km` default framing until a later rendering slice |

Do **not** introduce `scenario.topHeight`, `storm.topHeight`, or
`domain.topHeight`.

Do **not** use `12000 m` as automatic `stormTopHeight`.

Environmental explicit top and storm envelope top remain different
objects.

---

## 6. Principal: prescribed controlled superposition

The deep fixture remains:

```text
prescribed controlled superposition
```

It is **not**:

- a realistic supercell;
- a mass-consistent storm;
- a pressure-coupled model;
- a tilting/stretching result;
- a cloud-top / tropopause model.

```text
V_total = Σ independently prescribed fields
```

Bounds, `sigma`, and strengths are **not** tied by a continuity
equation. Coincidence of DEMO numbers is a fixture, not an API
coupling (`01-scenario-config.md`).

---

## 7. Updraft scaling

Current:

```text
VerticalEnvelopeUpdraftField
baseHeight = 0
topHeight  = 2000
y_mid      = 1000
F(y)       = sin(π (y − y_b) / H) on [y_b, y_t], else 0
W0         = 20 m/s
```

Half-sine semantics are unchanged. `topHeight` is a laboratory lid
with `F = 0`. It is **not** cloud top, equilibrium level, or
tropopause.

`W0 = 20 m/s` is not retuned (§14).

### 7.1 Isolated on-axis characteristic times

From `15` §17.3, isolated on-axis:

```text
dy/dt = W0 sin(π (y − y_b) / H)
```

Useful scales at `W0 = 20 m/s` (not live-DEMO oracles; environment,
rotation, and radial terms destroy this map):

```text
H (m)   H/W0 (s)   mean-speed πH/(2W0) (s)   ξ=0.5→0.9 (s)   ξ=0.1→0.9 (s)
 2000     100              157                   59              117
 6000     300              471                  176              352
 8000     400              628                  235              469
10000     500              785                  293              587
12000     600              942                  352              704
```

`H/W0` is a naive scale. The half-sine is slower near the lids.
Starting exactly at a lid never leaves it (`Vy = 0`).

### 7.2 Candidates

| Candidate | `y_mid` | vs env knots | vs `h_max` | Verdict |
| --- | --- | --- | --- | --- |
| `[0, 6000]` | 3000 | **top on knot 6000** | 6 km headroom | Rejected: repeats the current stacked-lid problem (Y7) one knot higher |
| `[0, 8000]` | 4000 | top interior of `6000–12000`; mid interior of `2000–6000` | 4 km headroom | **Accepted** |
| `[0, 10000]` | 5000 | top interior of `6000–12000` | 2 km headroom | Rejected for this generation: little room for outflow above the lid without crowding the clamp (Y6) |
| `[0, 12000]` | 6000 | **top on clamp and mid on knot 6000** | none | Forbidden: `09` rejected putting a storm lid on environmental `h_max` |
| proportional `×6` of `[0, 2000]` | 6000 | same as `[0, 12000]` | none | Forbidden: this is not a 6× stretch |

`baseHeight = 0` is kept. It is the reference ground and the existing
lower lid. Raising it would leave a no-lift gap under the seeds and
is not required to make a deep column.

### 7.3 Canonical deep updraft interval

```text
baseHeight = 0 m
topHeight  = 8000 m
y_mid      = 4000 m
H          = 8000 m
W0         = 20 m/s   // unchanged
```

Reasons:

1. Occupies lower / mid / upper bands of the `12 km` environmental
   column without claiming the environmental top.
2. Peak at `4000 m` sits inside the `2000–6000` interpolated segment,
   not on a knot.
3. Lid at `8000 m` sits inside `6000–12000`, with `4 km` of explicit
   environment above it for outflow overshoot and clamp headroom.
4. Matches the `8–10 km` laboratory scale anticipated by `09`, taking
   the lower end so upper outflow can live above the lid.
5. `W0 = 20` still gives a readable isolated ascent scale
   (`H/W0 = 400 s`). Retuning `W0` to “finish the column faster” would
   hide the wind-tunnel effect (§11) rather than document it.

On-axis envelope samples (isolated field, `r = 0`):

```text
y (m)     F(y)     Vy = W0 F  (m/s)
   0      0        0
1000      0.383    7.65      // current seed height; no longer y_mid
2000      0.707   14.14
4000      1        20        // peak
6000      0.707   14.14
8000      0        0
```

`∂Vy/∂y` at the interior side of a lid is `± W0 π / H`:

```text
current H = 2000:  ±0.0314 s⁻¹
deep    H = 8000:  ±0.00785 s⁻¹
```

The deep lid is gentler, not sharper. Half-sine `C^0` derivative jumps
remain acceptable (Y4). Do not switch to Hann/`C^1` in this generation.

---

## 8. Lower inflow scaling

Current:

```text
G = 1  for y ≤ 500
taper  500–1500   (quarter-cosine)
G = 0  for y ≥ 1500
A_in = 0.005 s⁻¹
```

Meaning to preserve, without a formula coupling to the updraft:

- full lower-level inflow near the ground / lower atmosphere;
- weakening through lower / mid levels;
- zero aloft.

Envelope family is unchanged (Y5): plateau extends to `y → −∞`.
That is **not** a realistic PBL. Underground full inflow plus
rotation remains real if a particle goes there (Y20). This generation
does **not** compact the plateau downward.

### 8.1 Is `baseHeight = 500` still appropriate?

No, not as the deep DEMO plateau top.

`500 m` was about one quarter of the `2 km` toy column. Under an
`8 km` updraft it would be a thin skin: “full inflow” would occupy
only the lowest `500 m` of a tropospheric laboratory tower. That
would under-serve the required lower band.

Raising `baseHeight` does **not** change underground behavior
(`G = 1` for all `y ≤ baseHeight` either way). It extends the
full-strength plateau **upward**.

`A_in` is not retuned.

### 8.2 Candidates

| Candidate | Role | Verdict |
| --- | --- | --- |
| keep `500 / 1500` | current toy bounds under a tall updraft | Rejected: inflow dies at `1500 m` while the updraft is still in its lower third |
| `500 / 4500` | keep thin plateau, stretch only the taper | Weaker: full-inflow layer stays a `500 m` skin |
| `1000 / 4000` | plateau top on env knot and seed height; top on updraft `y_mid` | Rejected: Y7 + Y16 coincidences |
| `2000 / 5000` | plateau top on env knot `2000`; top would abut outflow base | Rejected: Y7 stack |
| `1500 / 4500` | thick lower plateau; taper through lower-mid; zero after peak, before outflow | **Accepted** |

### 8.3 Canonical deep lower inflow

```text
baseHeight = 1500 m    // plateau top / taper start; G = 1 at and below
topHeight  = 4500 m    // G = 0 at and above
H_in       = 3000 m
A_in       = 0.005 s⁻¹  // unchanged
```

`baseHeight` here is still the plateau top, **not** a zero lid
(`17`, `01`).

At current seeds `y = 1000 m`: `G_in = 1` (today `G_in = √2/2`).
That is an accepted diagnostic-probe consequence (§17), not a reason
to move the seeds.

---

## 9. Upper radial outflow scaling

Current:

```text
[1000, 2000]
y_mid = 1500
A_out = 0.01 s⁻¹
```

Relative to the old updraft, outflow started at updraft mid, peaked
in the decay half, and ended on the updraft lid (and on env knot
`2000`). That alignment is a fixture, not physics (Y16). Do not copy
it upward.

`A_out` is not retuned. Bounds are not a formula of updraft bounds.

### 9.1 Where the new updraft is strong vs decaying

`F(y) = sin(π y / 8000)`:

```text
y (m)   F      region
 4000   1      maximum
 5000   0.924  still strong, just past peak
 6000   0.707  decaying; env knot, not a storm lid
 7000   0.383  decay region
 8000   0      updraft lid
```

### 9.2 Should outflow continue above the updraft lid?

Yes, modestly.

If outflow ended at `8000 m`, `G_out = 0` exactly where lift ends.
A particle that has finished rising would have no dedicated spreading
term at that height. A compact `1 km` continuation above the lid
keeps upper-level outflow genuinely upper, still below the `12 km`
clamp, and is **not** an anvil / tropopause model.

Peak outflow should sit in the **decay region**, after the updraft
maximum, not at `y_mid` and not at the lid.

### 9.3 Candidates

| Candidate | Peak | vs updraft | Verdict |
| --- | --- | --- | --- |
| `[4000, 8000]` | 6000 | starts at updraft mid; ends on lid; peak on env knot `6000` | Rejected: copies Y16 + Y7 |
| `[6000, 10000]` | 8000 | starts on env knot; peak on updraft lid | Rejected: Y7; strongest outflow where lift is already zero |
| `[5000, 8000]` | 6500 | no continuation above lid | Rejected: spreading turns off with lift |
| `[5000, 9000]` | 7000 | starts after peak; peak in decay; `1 km` above lid | **Accepted** |
| `[5500, 9000]` | 7250 | similar, larger radial-quiet gap | Acceptable alternative; rounder peak at `7000` preferred |

### 9.4 Canonical deep upper outflow

```text
baseHeight = 5000 m
topHeight  = 9000 m
y_mid      = 7000 m
H_out      = 4000 m
A_out      = 0.01 s⁻¹  // unchanged
```

At the updraft lid `y = 8000 m`: `G_out = √2/2 ≈ 0.707`. Spreading
is still on after lift has stopped. At `y = 9000 m`, outflow is off.

`9000 m` is `3 km` below environmental `h_max`. Y6 (clamp-on-lid)
does not trigger.

---

## 10. Rotation — height-independence (audit Y1)

**Later occupant (now live):** `docs/rendering/12-composite-vertical-envelope-rotation-demo.md`
replaced this generation’s tube with
`VerticalEnvelopeRotationField`. The height-independent occupant
locked here is historical for that slot. Updraft / inflow / outflow
bounds in this document remain live.

Current `RotationField` is height-independent by type contract
(`13`). This SoT does **not** change that type, add `baseHeight` /
`topHeight` to it, or invent a new rotation formula.

### 10.1 Options

**A.** Keep height-independent rotation. Accept a deep vertical
tube as a documented controlled fixture.

**B.** Write a separate height-localized rotation physics slice
**before** DEMO envelope scaling.

**C.** Scale the DEMO without the rotation operand until a localized
type exists.

### 10.2 Decision: A

Rotation does **not** block deep scaling.

Reasons:

1. The audit found no RED and did not require a rotation-envelope
   SoT first.
2. `RotationField` is still the correct primitive, the same way
   `UpdraftField` remained after `VerticalEnvelopeUpdraftField`.
3. Option B is a new physics type and a new formula. That is out of
   scope here and is not a prerequisite for wiring new envelope
   **numbers** on already enveloped fields.
4. Option C would remove the only horizontal circulation from the
   laboratory in the generation that first makes lower / mid / upper
   bands visible. That is a larger DEMO rewrite than documenting the
   tube.
5. Silent inheritance is the failure mode, not the tube itself.
   This document names the tube.

After scaling, rotation acts at every finite `y`, including:

- `y < 0` (with plateau inflow and clamped surface env);
- the full updraft column;
- above the updraft lid;
- above outflow `9000 m`, together with environment only.

That is **not** a mesocyclone, not tilted environmental vorticity,
and not stretching (`13`, G18, §22).

### 10.3 Trigger when A becomes unacceptable

Keep A until one of the following is in scope:

- teaching copy that rotation is localized to the updraft column;
- a story-tracer expected to stop spinning above the updraft lid;
- a `VerticalEnvelopeRotationField` (or equivalent) physics document;
- downdraft / ground-plane work that would make underground
  rotation+inflow the dominant visible artifact;
- a claim that the tube is environmental vorticity filling the
  troposphere.

The next localized-rotation slice, when commanded, must be a
**new type** (pattern of `15` vs `11`), not a silent dual-mode on
`RotationField`. Until then, DEMO copy must say “height-independent
laboratory tube”, never “deep mesocyclone”.

---

## 11. Wind-tunnel semantics (audit Y15)

Current architecture (G8):

```text
environment = ground-relative
storm fields = fixed world centers
C is diagnostic only; not subtracted in 3D
```

Environment advects tracers through a stationary prescribed storm
structure. This is a wind-tunnel laboratory, not a translating
supercell.

This SoT does **not** introduce a moving storm axis or a
storm-relative spatial frame.

### 11.1 Will the deep updraft be swept away?

Quantitatively: **current three tracers will not climb the deep
column**, for the same architectural reason they already leave the
axis today.

At seed height `1000 m`, `|V_env| ≈ 15.8 m/s`. Time to advect one
`sigma = 1000 m` horizontally is about `63 s` if env were constant
and inflow were ignored. Isolated half-sine ascent in those `63 s`
from `y = 1000 m` reaches only about `1600 m`. Then `E_r` collapses
and lift dies.

A hypothetical particle that stayed on axis from `ξ = 0.1` to
`0.9` would need about `469 s` at `W0 = 20`. Horizontal displacement
at `20–35 m/s` would be `9–16 km` — many `sigma`. With `sigma = 1000 m`
unchanged (§13), that path is not available in the live composite.

This is the current wind-tunnel, made louder by residence time. It is
not a new bug.

### 11.2 Decision: acceptable now, not blocking

```text
wind-tunnel remains canonical for the next DEMO
severity relative to deep scaling: acceptable now
```

Reasons:

1. Changing the frame is a different experiment (storm-relative 3D
   advection), not envelope arithmetic.
2. Subtracting `C` in 3D, or translating Gaussians with `C`, is
   forbidden here (G8, Y19).
3. The deep envelopes remain real fields. Diagnostic seeds were
   never a deep life-cycle story (Y10, G15).
4. Enlarging `sigma` to keep particles in the core for hundreds of
   seconds would raise peak speeds at fixed `Ω` / `A` into a
   different regime (§13). That is a silent retune, not a frame fix.

DEMO copy after implementation must **not** say that the three
tracers rise through the deep column. They remain lower-level probes
inside a taller prescribed structure.

### 11.3 Trigger for a separate storm-relative SoT

Wind-tunnel becomes blocking when a slice needs any of:

- teaching copy that tracers complete a lower-to-upper circulation;
- story seeds sold as the same-air pathway through inflow → updraft
  → outflow;
- interpreting sweep-out of the Gaussian as storm-relative inflow
  physics;
- a moving storm axis in world space.

That later document, not this one, would choose storm-relative
coordinates versus translating centers. Do not derive a moving axis
from `C`.

---

## 12. Shared centers (audit Y2)

Current DEMO: every storm mechanism uses `(centerX, centerZ) = (0, 0)`.

Decision:

```text
keep coincident DEMO centers (0, 0)
do not add storm.center
do not offset any mechanism in this generation
```

A common axis is the readable controlled fixture. Offsetting inflow
or rotation would be a helical-corridor experiment, not envelope
scaling.

DTO ownership stays independent. Factories must not copy centers
from `storm.updraft`. Tests that freeze `(0, 0)` are DEMO-contract
tests (Y18), not an API invariant.

After deep scaling, a common axis is still not a mesocyclone axis.
It is four independently parameterized Gaussians that happen to
share numbers.

---

## 13. Shared `sigma` (audit Y3)

Peak speeds at fixed strain / `Ω`:

```text
rotation:      |v_theta|_max = |Ω| σ / √e
lower inflow:  |v_r|_max     = A_in σ / √e
upper outflow: |v_r|_max     = A_out σ / √e
```

This slice **kept** `σ = 1000 m` so those peaks stayed
`≈ 12.13 / 3.03 / 6.07` m/s at then-current `Ω` / `A`. Scaling
`σ` to `8000 m` at frozen rates was forbidden here.

### 13.1 Options (this slice)

| Option | Meaning | Verdict then |
| --- | --- | --- |
| A | keep shared `1000 m` as controlled chimney geometry | **Accepted for this slice** |
| B | split some `sigma` | Rejected |
| C | scale all horizontal scales together | Rejected here: would scale peaks |
| D | other minimal fixture | not needed |

### 13.2 Decision then: A — chimney laboratory

```text
sigma_up = sigma_rotation = sigma_in = sigma_out = 1000 m
H_up / σ = 8
```

That needle was documented, not a supercell radius.

**Live DEMO now:** `docs/architecture/06-deep-chimney-scaling-demo-retune.md`
widens the shared DEMO `σ` to `4000 m` (`H_up / σ = 2`) and
**freezes those peak speeds** by lowering `Ω`, `A_in`, `A_out`.
Envelope bounds in this document stay live. Equality of the four
`sigma`s remains a scenario choice, not `storm.sigma`.

Do not read this section as forbidding the `06` retune.

---

## 14. Strength parameters

```text
W0    = 20 m/s        // unchanged
Ω     = 0.02 rad/s    // unchanged
A_in  = 0.005 s⁻¹     // unchanged
A_out = 0.01 s⁻¹      // unchanged
```

New vertical scales do **not** make these incomparable in a way that
requires a retune:

- peak Gaussian speeds are unchanged because `sigma` is unchanged;
- `∂Vy/∂y` weakens as `1/H` (`0.031 → 0.0079 s⁻¹` at the lids);
- on-axis plateau `div_h = −2 A_in = −0.01 s⁻¹` is unchanged;
- on-axis outflow mid-layer `div_h = +2 A_out = +0.02 s⁻¹` is
  unchanged.

Do not raise `W0` to compensate weaker stretching. Do not raise
`A_in` / `A_out` to chase continuity. Do not raise `Ω` to make
rotation visible against stronger upper env.

A future strength-retune SoT is a separate command.

---

## 15. Relative vertical overlap

Envelopes are sampled simultaneously. This table is **not** a staged
state machine.

`F` = updraft half-sine on `[0, 8000]`.
`G_in` = lower-inflow plateau + quarter-cosine on taper `[1500, 4500]`.
`G_out` = outflow half-sine on `[5000, 9000]`.
Rotation = height-independent tube everywhere.
Environment = piecewise-linear knots, clamp outside `[0, 12000]`.

```text
height band (m)     G_in    F       G_out   rotation   environment segment
y < 0               1       0       0       on         clamp to knot 0
0                   1       0       0       on         knot 0
0 – 1500            1       rising  0       on         0–1 then 1–2 km
1500                1       0.556   0       on         1–2 km
1500 – 2000         taper   rising  0       on         1–2 km
2000                0.966   0.707   0       on         knot 2000
2000 – 4000         taper   → 1     0       on         2–6 km
4000                0.259   1       0       on         2–6 km (updraft max)
4000 – 4500         → 0     ~0.98   0       on         2–6 km
4500                0       0.981   0       on         2–6 km (inflow off)
4500 – 5000         0       ~0.95   0       on         2–6 km  ← radial-quiet, updraft strong
5000                0       0.924   0       on         2–6 km (outflow on)
5000 – 6000         0       decay   rising  on         2–6 km
6000                0       0.707   0.707   on         knot 6000 (interior, not a lid)
6000 – 7000         0       decay   → 1     on         6–12 km
7000                0       0.383   1       on         6–12 km (outflow peak)
7000 – 8000         0       → 0     decay   on         6–12 km
8000                0       0       0.707   on         6–12 km (updraft lid; outflow still on)
8000 – 9000         0       0       decay   on         6–12 km (outflow above updraft)
9000                0       0       0       on         6–12 km (outflow off)
9000 – 12000        0       0       0       on         6–12 km (env + rotation tube)
y > 12000           0       0       0       on         clamp to knot 12000
```

Readable bands (still not a state machine):

| Pedagogical reading | Approximate `y` |
| --- | --- |
| Inflow dominates lower levels | `≤ 1500 m` (`G_in = 1`, `G_out = 0`, `F` rising) |
| Inflow + updraft overlap | `0 < y < 4500` |
| Updraft strongest; inflow almost gone; no outflow | `~4000–5000 m` |
| Outflow starts | `5000 m` |
| Inflow gone | `≥ 4500 m` |
| Outflow strongest; updraft decaying | `~7000 m` |
| Updraft decays to zero; outflow still on | `8000 m` |
| Outflow ends | `9000 m` |

Allowed overlaps / gaps, chosen on purpose (Y16):

- inflow and outflow do **not** overlap (gap `4500–5000 m`);
- outflow **does** continue above the updraft lid;
- no new storm lid sits on knots `1000`, `2000`, `6000`, or `12000`;
- updraft `baseHeight = 0` remains the existing ground/knot coincidence.

---

## 16. Continuity debt (audit Y13)

After scaling the laboratory is still:

```text
V_total = Σ independently prescribed fields
```

Do **not** bind `A_in`, `A_out`, `W0`, bounds, or `sigma` with a
continuity equation. Separable `Vy = W0 E_r F` cannot cancel
Gaussian-linear `div_h` at all `r` (`15` §11).

### 16.1 Can one more prescribed DEMO generation proceed?

Yes.

It remains useful because:

- each mechanism keeps an inspectable vertical home in a deep column;
- signs, zeros, and envelope lids stay testable;
- the teaching object is still “where each prescribed term is on”,
  not “the same air completes a cell”.

### 16.2 When continuity debt becomes RED

Not because the column is taller.

RED when a future slice does any of:

- interprets tracer crowding / spreading as physical mass density;
- claims a pressure-coupled circulation;
- claims a same-air-mass pathway (inflow air is the outflow air);
- sells a downdraft as the return branch of this mass;
- adds a `divergence()` diagnostic used as a solver residual to
  adjust another operand;
- writes teaching copy that the laboratory sum conserves mass.

Do not design a solver here.

---

## 17. Seeds — diagnostic vs story (audit Y10)

Current three seeds:

```text
(0,    1000,  0)     // axis
(600,  1000,  0)     // east, r = 600 m
(0,    1000, -600)   // north, r = 600 m
```

### 17.1 Diagnostic seeds

**Keep these three as the current DEMO seeds.** Do not move them to
`y_mid = 4000`. Do not replace them with a particle cloud.

After scaling they are no longer peak-updraft / mid-taper probes:

```text
at y = 1000 m:
  F      = sin(π/8) ≈ 0.383     // was 1
  Vy_axis = 7.65 m/s            // was 20
  G_in   = 1                    // was √2/2
  G_out  = 0                    // unchanged
```

They remain probes of the already-studied lower layer, now sitting
in the full-inflow plateau and the lower third of the deep updraft.
That break of `seed y = updraft y_mid` is intentional (Y16).

### 17.2 Story / flow seeds

A future set that starts lower, farther from the axis, and possibly
upwind could be designed to spend longer in the column. It is **not**
part of this generation.

Two concurrent seed modes would need scenario/UI architecture that
does not exist. Leave that future.

Do not claim the current three will demonstrate a deep circulation
(§11).

---

## 18. Environmental knot relationships (audit Y7)

Knots stay:

```text
0, 1000, 2000, 6000, 12000 m
```

Storm bounds are **not** derived from knots. Check after the fact:

| Envelope boundary | Height | Knot relationship |
| --- | --- | --- |
| updraft base | 0 | existing ground + knot 0; kept |
| updraft peak | 4000 | interior of `2000–6000` |
| updraft top | 8000 | interior of `6000–12000` |
| inflow plateau top | 1500 | interior of `1000–2000` |
| inflow zero | 4500 | interior of `2000–6000` |
| outflow base | 5000 | interior of `2000–6000` |
| outflow peak | 7000 | interior of `6000–12000` |
| outflow top | 9000 | interior of `6000–12000` |

Knot `6000` is **interior** to the outflow window (`G_out(6000) = √2/2`),
not a lid. Do not later read “outflow is on at 6 km because there is
a knot there”.

Do not treat `8000 = 2/3 × 12000` as an invariant.

DEMO tests after implementation should sample important heights
**and** nearby knots, including:

```text
0, 1000 (seeds), 1500, 2000, 4000, 4500, 5000, 6000, 7000, 8000, 9000, 12000
```

to prove lids are independent of knots.

`C = (10, 0)` and overlay `[0, 1000]` stay (Y8, G9). Deep-column
storm-relative geometry on the hodograph is unchanged by this
fixture. Do not retune `C`. Do not make a moving axis from `C`.

---

## 19. Renderer / camera (audit Y14)

Current `TracerScene`:

```text
FOV                 50°
near / far          10 / 50000 m
camera position     (4500, 3500, 4500) m
lookAt / target     (500, 1000, −500) m
XZ grid             8000 m, 16 divisions
axes helper         1000 m
tracer sphere       50 m
```

After envelope scaling the default view still frames the old `0–2 km`
tower. Camera height `3500 m` is **below** the new updraft peak
`4000 m`. The far plane already allows orbiting an `8–12 km` column.
Grid, axes, and sphere size do not.

This SoT does **not** change the renderer.

The later rendering fixture is
`docs/rendering/11-deep-storm-tracer-view.md`.

### 19.1 Migration order

```text
physics / scenario deep scaling
→ later rendering scaling
```

Prefer separation. A temporarily awkward but physically correct
scene is acceptable. Combined DEMO scaling is not required.

A later rendering slice (not this one) should consider:

- lookAt near `(0, 4000, 0)` or a lower-mid compromise;
- camera pulled back on the order of `10–15 km` horizontally and
  raised above mid-column;
- whether the `8000 m` ground grid is still enough for a `1 km`
  chimney (likely yes) or should grow for context;
- axes helper longer than `1000 m` so the `8 km` tower has a
  readable vertical reference;
- sphere radius `50 m` can stay: it is already small relative to
  `sigma` and will be a dot on an `8 km` column, which is honest.

Do not grow the grid in the physics wiring slice “because the storm
got taller”. `09` already forbade growing the grid only because the
profile grew.

---

## 20. Numerical integration (audit Y11)

Current DEMO: Euler, `dt = 0.1 s`. No project `DEFAULT_DT`.

```text
Ω dt     = 0.002
A_in dt  = 0.0005
A_out dt = 0.001
W0 dt    = 2 m
```

Shortest new envelope thickness: inflow taper `H_in = 3000 m`.
Outflow window `H_out = 4000 m`. Updraft `H = 8000 m`.

Lid slope is **gentler** than today (`π/H` smaller). Half-sine `Vy → 0`
at the lids, so Euler lid overshoot is smaller than the old
height-independent `W0 dt = 2 m` leap.

Solid-body Euler radius growth over a hypothetical `4000` steps
(`400 s`): `r` factor `≈ 1.008`. Not a DEMO-scale spiral artifact
at this `Ω`.

Coordinate magnitude `12 km` remains irrelevant in float64.

### 20.1 Decision: GREEN

Keep Euler and `dt = 0.1`. Do not start a numerical slice.

Revisit if a later `Ω` retune or a story-tracer with hundreds of
seconds **inside** the core makes radius drift the teaching image
(compare with isolated RK2, as `03` already allows).

---

## 21. Storm motion

```text
C = (eastward 10, northward 0) m/s
```

Unchanged. Overlay layer remains `[0, 1000]`. Full-column SRH
`+925` versus overlay `−100` stays the `09` YELLOW, not a reason to
retune `C` because storm envelopes grew.

Storm motion and world storm center remain different objects. Do
not translate Gaussians with `C`.

---

## 22. Rotation ≠ environmental vorticity

Hard boundary, reaffirmed:

```text
RotationField              prescribed synthetic circulation about a world +Y axis
HorizontalVorticity        diagnostic from environmental vertical shear
```

Deep scaling does **not** authorize explaining DEMO rotation as:

- tilted environmental vorticity;
- a stretching result;
- a mesocyclone.

If a future vertical rotation envelope is added, it is still
prescribed until a separate tilting/stretching model exists (Y12).
Additive `CompositeVelocityField` still cannot host that interaction.

---

## 23. Stale docs pass

Exact leftover statements to clean in the **implementation** slice
(or a tiny docs-only follow-up). Do not rewrite historical physics.
Patch current-tense status and pointers only.

### 23.1 Dangerous current-tense leftovers

1. `docs/rendering/08-composite-lower-radial-inflow-demo.md` §12
   (around the `y ≥ 2000 m` fate paragraph):

   > environment still advects horizontally (clamped to the `2000 m`
   > knot)

   After `09` this is false: env interpolates `2000–6000–12000`, and
   rotation still acts. **Patch first.** After this generation’s
   implementation, that whole fate paragraph is also geometrically
   stale (lids move).

2. `docs/rendering/06-composite-vertical-envelope-updraft-demo.md`
   “After `topHeight`” / dynamics: env “clamped outside `[0, 2000]`”
   and “clamped to the `2000 m` knot above the profile”. Historical
   slice; still reads as live env behavior. Add one-line historical
   note + pointer to `09`/`10`.

3. `docs/rendering/07-composite-upper-radial-outflow-demo.md` fate
   at `y ≥ 2000 m`: “env clamped to the `2000 m` knot”. Same class
   as (2).

### 23.2 Stale “current composition” phrasing

4. `docs/physics/15-vertical-updraft-envelope.md` §1 still says it is
   not a change to the “current DEMO four-field composition”. Live
   DEMO is five operands plus a `12 km` profile; after
   implementation, envelopes are the `10` fixture. One-line
   historical note; do not rewrite the physics.

5. `docs/rendering/01-tracer-scene.md` lists `08` as current operand
   wiring and does not point at `09` for env knots. After
   implementation, current **geometry** is this document; operands
   stay the `08` five-field list. Add pointers to `09` and `10`.

6. `docs/architecture/01-scenario-config.md` §17 relationship list
   still names `08` as current DEMO wiring. §3 already cites `09`.
   After implementation: §12 DEMO numbers and §17 must cite `10`
   for envelope bounds; `09` remains the knot SoT.

### 23.3 Historical examples that can be skimmed as live

7. `docs/physics/12-composite-velocity-field.md` §8 worked example
   still uses height-independent `UpdraftField` as the important
   laboratory case. Historically valid. Optional one-line note that
   live DEMO updraft is `VerticalEnvelopeUpdraftField`.

8. Isolated `UpdraftField` / `RadialInflowField` docs remain
   canonical for those types (G10). Do not delete. Optional
   “not the live DEMO occupant” already exists in several places;
   keep it.

### 23.4 Not stale

- `03`–`07` docs that mark themselves superseded.
- `09` research that describes rejected `10 km` / `15 km` profile
  tops.
- Overlay still documenting `[0, 1000]` (G9).
- `08` as the document that **introduced** the five-operand list and
  the current seed **layout** (axis / east / north at one height).

### 23.5 Minimal cleanup set (implementation or docs follow-up)

```text
1. Patch 08 §12 env-clamp sentence (must).
2. Point 01-tracer-scene at 09 (knots) and 10 (envelope geometry).
3. Point 01-scenario-config §12 / §17 at 10 for storm bounds;
   keep 09 for knots.
4. One-line historical note on 15 §1 purpose.
5. Historical notes on 06 / 07 clamp sentences (optional but cheap).
```

Do not mass-edit physics derivations.

---

## 24. Blocking prerequisite

```text
rotation vertical structure:  A — keep height-independent tube; not blocking
wind-tunnel semantics:        reaffirm; not blocking
```

No corrective physics or architecture SoT is required before wiring
the numbers in §25.

If a later command wants tracers to **demonstrate** a deep
lower-to-upper path in the live composite, that is a different
experiment (§11.3), not a reason to hold this fixture.

---

## 25. Compact lock-in

```text
deep storm target:            prescribed 8 km laboratory column inside
                              12 km environmental support; not a supercell
updraft bounds:               baseHeight = 0, topHeight = 8000
                              y_mid = 4000; half-sine unchanged
lower inflow bounds:          baseHeight = 1500, topHeight = 4500
                              plateau to y → −∞ reaffirmed
upper outflow bounds:         baseHeight = 5000, topHeight = 9000
                              y_mid = 7000; continues 1 km above updraft lid
rotation vertical decision:   A — height-independent tube; documented;
                              RotationField formula unchanged
wind-tunnel decision:         canonical; ground-relative env; fixed world
                              centers; C not subtracted in 3D
centers:                      all (0, 0) fixture; no storm.center; no offsets
sigma_up:                     1000 m          // this slice
sigma_rotation:               1000 m
sigma_in:                     1000 m
sigma_out:                    1000 m
                              (then H/σ = 8; live horizontal scale: 06)
W0:                           20 m/s          // this slice; live 06: 30
Ω:                            0.02 rad/s      // this slice; live 06: 0.005
A_in:                         0.005 s⁻¹       // this slice; live 06: 0.00125
A_out:                        0.01 s⁻¹        // this slice; live 06: 0.0025
seed strategy:                diagnostic three at y = 1000 m
                              (this slice: r = 600 m; live 06: r = 0.6σ = 2400 m)
environment top:              12000 m (unchanged); not storm top
continuity status:            YELLOW prescribed sum; one more DEMO generation
                              allowed; RED triggers in §16.2
renderer migration:           physics/scenario first; rendering slice later
numerical status:             GREEN — keep Euler, dt = 0.1
blocking prerequisite:        none
```

---

## 26. Implementation slice (code, only after this doc is accepted)

No production change in the research slice that wrote this document.

When commanded, one vertical wiring slice:

### 26.1 Change

- `src/scenario/DEMO_SCENARIO.ts` — storm envelope numbers only
  (`storm.updraft.baseHeight/topHeight`,
  `storm.lowerRadialInflow.baseHeight/topHeight`,
  `storm.upperRadialOutflow.baseHeight/topHeight`).
  Do **not** edit env knots, `stormMotion`, centers, `sigma`,
  strengths, seeds, or `timestep`.

### 26.2 Do not change

- `ScenarioConfig` shape (no `storm.center`, no `stormTopHeight`,
  no rotation envelope fields);
- factories (constructors already accept independent bounds);
- operand list / `composeDemoTracerSimulation`;
- `RotationField` type or formula;
- `TracerScene` camera, grid, near/far, sphere radius;
- integrator / `dt`;
- hodograph overlay `[0, 1000]`;
- isolated physics unit tests that use their own non-DEMO envelopes.

### 26.3 Tests

Update DEMO-contract assertions (Y18). A failing `toBe(2000)` is a
fixture move, not a physics regression of `VerticalEnvelopeUpdraftField`.

Expected focus:

- `src/simulation/demoCompositeUpdraft.integration.test.ts` —
  new bound freezes; `F`/`G_in`/`G_out` at seeds and at the table
  heights in §18; independence of lids from knots `2000`/`6000`;
  inflow zero at `4500`; outflow peak at `7000`; updraft zero at
  `8000` with outflow still on; radial-quiet sample in
  `(4500, 5000)`;
- scenario factory mapping tests if they freeze `08` numbers;
- keep `[0, 1000]` hodograph / SRH regressions from `09`.

Do not add continuity identities. Do not add a deep-ascent trajectory
oracle for the live composite.

### 26.4 Docs cleanup

Apply §23.5. Update `08` status to: five-operand **wiring** still
current; envelope **geometry** superseded by this document (same
pattern as `09` superseding env knots).

### 26.5 Verify and stop

```text
npm test
npm run typecheck
STOP
```

Do not start: renderer reframing, story seeds, rotation envelope
physics, wind-tunnel replacement, downdraft, continuity solver,
strength retune, `C` retune, Bunkers.

---

## 27. Explicit non-goals

Do not start in this SoT or in the wiring slice:

- downdraft;
- continuity solver;
- pressure / buoyancy;
- thermodynamics;
- cloud / anvil;
- precipitation;
- cold pool / gust front;
- PBL;
- moving storm frame;
- Bunkers;
- tilting / stretching;
- mesocyclone;
- tornado;
- turbulence;
- terrain;
- renderer implementation;
- new scenario editor;
- new rotation physics type;
- `W0` / `Ω` / `A_in` / `A_out` / `sigma` retune;
- particle cloud.

---

## 28. Core lesson

A deep laboratory storm is a taller **prescribed geometry**, not a
proportionally stretched `0–2 km` toy and not the environmental
`h_max`. Lower inflow, mid-level updraft peak, and upper outflow can
occupy different bands of a `12 km` wind column while rotation stays
an honest height-independent tube, the wind-tunnel stays ground-
relative, and the three seeds stay lower-level probes. The failure
mode is advertising that fixture as a deep supercell life cycle.
