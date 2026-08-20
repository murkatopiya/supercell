# Post-Downdraft / Ground-Impact Checkpoint Audit

**Status:** architecture checkpoint SoT after the live downward
exhibit. The live stack at the time of this audit was six operands
(listed below). Seventh-operand wiring came later:
`docs/rendering/16-composite-near-ground-outflow-demo.md`.
This document was not rewritten as if that occupant already existed.
No solver or thermodynamics.

Live at the time of this audit:

```text
IntegrationFrame     = StormRelativeLaboratory
TracerPedagogy       = DownwardPathline
live seed            = D1 (5000, 1000, 0)
trails               = on
keepInactiveGlyphs   = true
AtmosphericTracerDomain = y ≥ 0
integrator           = Euler, dt = 0.1 s
stack                = StormRelativeEnvironmentalAdvectionField
                       + VerticalEnvelopeUpdraftField
                       + VerticalEnvelopeRotationField
                       + LowerRadialInflowField
                       + UpperRadialOutflowField
                       + VerticalEnvelopeDowndraftField
```

Explicit composition modes still available, not concatenated:

```text
DiagnosticProbes
StoryPathlines
DownwardPathline
```

No `Both`.

Occupant numbers:
`docs/rendering/15-composite-downdraft-demo.md`.

Downward pedagogy:
`docs/architecture/12-downward-ground-impact-pedagogy.md`.

Tracer floor:
`docs/architecture/11-ground-atmospheric-domain-policy.md`.

Five-operand continuity (not retuned; revisited here after the
sixth operand):
`docs/architecture/10-composite-continuity-mass-budget-audit.md`.

Primitive:
`docs/physics/20-vertical-downdraft-envelope.md`.

This document does **not** rewrite physics SoT. Formulas below
are identities already locked in `10` / `15` / `20`. No new
full research sweep.

---

## 1. Verdict

**A. Ready for a prescribed near-ground outflow physics SoT.**

Not B: the kinematic prerequisites that `11` / `12` / `15` named
are now actually live. Ground policy is consumed by D1. Landing
semantics are defined. Continuity anti-claims exist. The missing
piece for a surface-flow *family* is a physics SoT, not another
ground-policy or downward-exhibit slice.

Not C: the current kinematic class is not exhausted. `02` Y12
still allows a new independent prescribed operand. Near-ground
divergent `V_h` is exactly the family `20` §7.2 / `15` §12 /
`12` §16 deferred. Stopping the kinematic class here would be a
new policy, not a consequence of the live stack.

Separately:

```text
can the next thing be called "cold pool"?   no
```

Cold pool carries thermodynamic / density / buoyancy semantics
this laboratory does not have. A kinematic prescribed near-ground
outflow may be designed. It must not inherit that name.

---

## 2. Current teaching contracts

Three modes. Role is which seed array, not a tag. Arrays are
never concatenated (`08` §4, `12` §8–§9). None of the three
requires `Both`.

### 2.1 DiagnosticProbes

```text
seeds     diagnosticSeeds
          axis  (0, 1000, 0)
          east  (2400, 1000, 0)
          north (0, 1000, −2400)
trails    off
glyphs    hide when inactive  (no domain-exit occupants today)
default   composition API
live App  no
```

What they diagnose **now**, in the six-operand sum:

| Seed | Job that still exists | What the sixth operand does to it |
| --- | --- | --- |
| Axis | Chimney-axis control: inflow and rotation identically zero; `V_sr` + updraft | Far Gaussian tail of the east occupant (`E_down(5000 m) ≈ 0.044`). A small downward contamination, not a new diagnostic class. |
| East | Cyclonic-flank graze of the chimney (`r = 0.6 σ_up`) | Also sits west of the downdraft axis (`r_down = 2600 m ≈ 1.3 σ_down`). Still a chimney-flank probe, slightly mixed. |
| North | Downstream failure of the south-side story basin | Far from the occupant (`r_down ≈ 2.8 σ_down`). Still the chimney control. |

The trio is still needed because StoryPathlines and
DownwardPathline do **not** replace mechanism contrast at the
seed layer. Axis is still not a story seed (`08`: inflow is zero
on `r = 0`). North is still the honest miss, not a bug.

The mode lost live visibility twice: first when StoryPathlines
was selected, then again when DownwardPathline became live. That
is UX debt (`§10`), not a physics regression. Recovered by
passing `DiagnosticProbes` into `composeDemoTracerSimulation`.

### 2.2 StoryPathlines

```text
seeds     storySeeds  S1 (0, 1000, 4000), S2 (0, 1000, 6000)
trails    on
glyphs    hide when inactive  (S1/S2 do not deactivate)
live App  no  (explicit composition option)
```

Allowed claim, unchanged (`08` §6):

```text
prescribed storm-relative pathline through lower inflow,
deep updraft region, and upper outflow region
```

`15` §9: under the live sixth occupant, S1/S2 still letter-pass
and still do not hit `y = 0`. The sixth operand is present in the
sum and almost unsampled by this pair.

Forbidden, still: same-air-mass circulation, mesocyclone capture,
realistic parcel, full supercell, “the air that went up came out
here,” life cycle.

### 2.3 DownwardPathline

```text
seeds              downwardPathlineSeeds  D1 (5000, 1000, 0)
trails             on
keepInactiveGlyphs true
live App           yes
panel copy         matches §2.3 claim  (App.tsx subtitle)
```

Allowed claim (`12` §14):

```text
prescribed storm-relative pathline descending through the
downdraft region until atmospheric-domain exit at y = 0
```

Natural short label: downward pathline to the atmospheric ground
boundary.

Forbidden, still (`12` §14): air returns to the surface as the
same parcel; S1/S2 came down here; RFD/FFD; precipitation-cooled
air; cold-pool generation; gust front; mass-conserving return;
compensating subsidence; the missing half of the storm.

### 2.4 Both

Not a value on `TracerPedagogy`. Tests freeze the three names.
`demoSeedsForPedagogy` never concatenates arrays.

`Both` remains forbidden for the same reason as `12` §9: two
pedagogical objects on one screen become one false storm. The
live switch to DownwardPathline is how that anti-claim is
currently **enforced**, not a reason to add a combined mode.

---

## 3. Visual anti-claims

Confirmed against live composition and renderer contracts.

| Anti-claim | Status |
| --- | --- |
| Upward and downward paths are not shown simultaneously | **Holds.** Live is D1 only. S1/S2 require an explicit pedagogy change. No `Both`. |
| D1 terminal glyph = pathline endpoint, not mass accumulation | **Specified and implemented.** `keepInactiveGlyphs` is renderer state (`12` §10). Particle stays `active = false`. `Simulation.step` skips it. The glyph is copied from the frozen terminal position. |
| Ground reference plane = tracer-domain datum, not terrain / collision | **Holds.** `GridHelper` at `y = 0` (`11` §11, `12` §12). Not a mesh, not a `VelocityField` domain. |
| Trails = path history, not streamtubes | **Holds.** `TracerPathHistory` + `THREE.Line` (`14`). One polyline, no radius, stride 1, terminal `y = 0` once. |

### 3.1 New misleading visual claim: glyph at rest on the plane

**Yes. Newly opened. Pedagogical YELLOW, not a production defect.**

The locked policy (`12` option B) is still the right one: hiding
the sphere at impact would hide the exhibit. The cost of that
choice is now live and visible:

```text
a sphere sits on the grid after ~119 s
the trail ends under it
the particle no longer moves
```

Cheap false readings, in increasing danger:

1. **Stuck parcel / skating wall** — false. `active = false`;
   horizontal `V` at the terminal point is not applied.
2. **Mass accumulated here** — false (`01` parcel §27–28;
   `11` §12; `12` §10). One marker is not density.
3. **This landing is a cold-pool source / gust-front seed** —
   false (`12` §16, `15` §12). This is the reading that a future
   near-ground outflow exhibit would make almost automatic if
   combined with D1 in one scene.

The glyph does **not** skate, splash, bounce, or grow a ring.
Those forbidden visuals were not added. The remaining lie is
**stillness on the datum**, which looks like deposition.

Copy currently tells the truth (panel title names domain exit).
Copy cannot unsay a later combined motion of “hit, then spread.”
That is why D1 and a future outflow exhibit must not share a
scene by default (`§9`).

---

## 4. Physics state

Current prescribed mechanisms. Independent additive operands
(`12` compositor). No coupling equation. Shared chimney
`σ = 4000 m` and origin centers remain a DEMO fixture (`06`,
`01`). The sixth operand broke that fixture **for itself**
(`σ_down = 2000 m`, center `(5000, 0)`).

### 4.1 Storm-relative environmental advection

```text
type                 StormRelativeEnvironmentalAdvectionField
coupled?             no  (adapter: V_env − C on the env operand only)
vertical support     profile knots 0 … 12000 m; clamp outside
DEMO scale           C = (10, 0) m/s eastward; live V_sr(1000 m) ≈ (−5, +15)
continuity           ∇ · V = 0  (homogeneous horizontal; C constant)
teaching role        storm-relative laboratory wind-through (D2)
not                  translating storm (D3); not hodograph rewrite (D1)
```

### 4.2 Updraft

```text
type                 VerticalEnvelopeUpdraftField
coupled?             no
vertical support     compact half-sine [0, 8000] m
DEMO scale           σ = 4000 m, W0 = 30 m/s, center (0, 0)
continuity           ∇ · V = W0 E(r) F'(y)   (source lower half, sink upper)
teaching role        deep chimney lift for S1/S2
```

### 4.3 Localized rotation

```text
type                 VerticalEnvelopeRotationField
coupled?             no
vertical support     compact half-sine [0, 6500] m
DEMO scale           σ = 4000 m, Ω = 0.005 s⁻¹, center (0, 0)
continuity           ∇ · V = 0 identically
teaching role        prescribed spin in a height window
not                  tilted environmental vorticity; not a mesocyclone
```

### 4.4 Lower inflow

```text
type                 LowerRadialInflowField
coupled?             no
vertical support     plateau G = 1 for y ≤ 1500 m; taper to 4500 m
DEMO scale           σ = 4000 m, A_in = 0.00125 s⁻¹, center (0, 0)
continuity           ∇ · V = −A_in E G (2 − r²/σ²)
teaching role        lower-level radial approach of the story
```

The plateau still extends to `y → −∞` (`17`, `02` Y5). That is
the primitive family, not a live tracer exhibit (`11` B).

### 4.5 Upper outflow

```text
type                 UpperRadialOutflowField
coupled?             no
vertical support     compact half-sine [5000, 9000] m
DEMO scale           σ = 4000 m, A_out = 0.0025 s⁻¹, center (0, 0)
continuity           ∇ · V = +A_out E G (2 − r²/σ²)
teaching role        upper-level radial exit of the story
not                  anvil / tropopause physics
```

This is **upper** radial outflow. It is not near-ground outflow.
Do not extend `G_out` downward to fake a surface family.

### 4.6 Offset downdraft

```text
type                 VerticalEnvelopeDowndraftField
coupled?             no
vertical support     compact half-sine [−400, 3600] m
                     y = 0 is interior (F(0) = 0.309)
DEMO scale           σ_down = 2000 m, D0 = 20 m/s, center (5000, 0)
continuity           ∇ · V = −D0 E_down(r) (π/H) cos(π ξ)
                     H = 4000 m; axis max |∂Vy/∂y| = D0 π / H = 0.0157 s⁻¹
teaching role        prescribed descent window for D1
not                  return of S1/S2; not RFD/FFD; not cold pool;
                     Vx ≡ Vz ≡ 0  (20 §7.2)
```

Horizontal drift of D1 is SR advection + lower inflow + rotation
during descent, not spreading at the surface (`12` §5.5).

---

## 5. Ground policy delta

`AtmosphericTracerDomain` is **really used live**.

`composeDemoTracerSimulation` always passes
`ATMOSPHERIC_TRACER_DOMAIN` into `Simulation`. Isolated field
tests do not. Live App uses that composition.

D1 is the first live consumer that actually crosses.

| Step | Contract | Live status |
| --- | --- | --- |
| Crossing | `y_n ≥ 0` and proposed `y_{n+1} < 0` | D1 does this at `t ≈ 119 s` |
| Interpolation | linear accepted segment onto `y = 0` | `min y = 0` exactly (`12` §17) |
| Deactivation | `active = false`; no further integration | `Simulation.step` skips inactive |
| Terminal history | became-inactive appends once | recorder is ground-unaware (`14`, `15` §13) |
| Terminal glyph | visible iff `keepInactiveGlyphs` | mapped only for DownwardPathline |

Landing (`12` / `15`): `(4723, 0, −1308)` m, on the `±5000 m`
pad, inside the default frustum.

This **is not**:

- a no-flux boundary on the field (`Vy_down(0) ≈ −6.18 m/s`
  isolated on axis; floor is interior to the envelope);
- a pressure response;
- momentum redirection into `V_h`;
- a cold pool;
- clamp-and-skate;
- reflection;
- mass disappearance or mass accumulation.

Field sampling remains unbounded (G17). Underground Eulerian
inflow plateau remains (`17`). Live atmospheric pathlines do not
occupy it.

`11` §9 still contains a five-operand leftover
(`Vy_total ≥ 0 everywhere`). That sentence is **docs debt**.
Runtime is six-operand; D1 descends. Do not silently rewrite `11`
in this slice.

---

## 6. Continuity status after the sixth operand

Revisit of `10`, not a replacement. No solver. No retune. No
production `divergence()` API. No new FD campaign: linearity plus
the identities in `10` §3 and `20` §13 / `15` §10 are enough.

### 6.1 Identity

```text
∇ · V_total = ∇ · V_up + ∇ · V_in + ∇ · V_out + ∇ · V_down
```

Environment, rotation, and constant `C` still contribute `0`.

The sixth term lives on **its own** axis and `σ`:

```text
∇ · V_down = −D0 E_down(r_down) (π / H_down) cos(π ξ_down)
             inside (−400, 3600) m, else 0
```

It cannot cancel `17`’s `div_h` at all `r` (`20` §13.3). It is
not parameter-tied to `W0` / `A_in` / `A_out` (`10`, `20` §15).

### 6.2 Chimney residual (where `10` measured)

On the updraft axis, `E_down(5000 m) ≈ 0.044`. Extra
`|∇ · V_down|` is O(`3×10⁻⁴ s⁻¹`) at story-seed height — a few
percent of `10`’s on-axis `+0.00838 s⁻¹`. The chimney maps in
`10` remain the right picture of the **story corridor**.

Offset placement was chosen so the sixth operand would not
rebalance the chimney (`15` §4.1, §10). That choice still holds.

### 6.3 New loud residual: occupant core near `y = 0`

`15` §10 already recorded, isolated on the downdraft axis:

```text
∇ · V_down(axis, y = 0) ≈ −0.0149 s⁻¹     // sink
D0 π / H                 =  0.0157 s⁻¹     // larger than
W0 π / H_up              =  0.0118 s⁻¹     // chimney lid strain
```

At D1’s landing `(4723, 0, −1308)`, `r_down = 1337 m`,
`E_down ≈ 0.80`, so

```text
∇ · V_down(landing) ≈ −0.012 s⁻¹
e-folding 1 / |∇ · V| ≈ 80 s
```

versus D1’s descent time `≈ 119 s`. Inflow’s contribution there
is O(`3×10⁻⁴ s⁻¹`). The teaching climax sits in a **vertical
sink of the same order as the stack’s largest strains**, with
`div_h ≡ 0` on this operand.

This is not a new physics discovery. It is `20`’s lower-half
sink, now occupied by a live pathline endpoint on the named
ground plane.

### 6.4 Answers

**Is continuity debt still YELLOW?** Yes. Existence of the sixth
operand is not RED (`10` §10, `20` §15.3). Residual size is still
O(mechanism strain), not ε.

**Did downdraft make it pedagogically louder?** **Yes, at the live
exhibit.** Two different loudnesses:

| Reading | Before D1 live | After D1 live |
| --- | --- | --- |
| Closed cell / S1/S2 returned here | YELLOW, cheaper after a *visible* downward column | **Quieter in the live view**, because S1/S2 are off-screen. Mode separation is doing the job `12` assigned it. |
| Air piled up at landing / this is the return *to ground* | Not on screen | **Louder.** Glyph + trail + sink at `y = 0`. |
| Chimney `∇ · V` of `10` | Unchanged order | Unchanged order on the story axis |

**Is separation of modes enough against a false closed-cell
reading?** **Yes, for S1/S2 + D1.** It is the visual enforcement
of `10`’s anti-claim. It is **not** enough against “deposition
then spreading” if a near-ground outflow pathline shares D1’s
scene (`§9`).

**Exact trigger that turns the debt RED** (reaffirmed, then
tightened):

From `10` / `02` Y13, still:

- copy, a downdraft, or a future API sold as closing `∇ · V`;
- “return of this air” / same-air-mass circulation / closed cell;
- teaching that the laboratory sum conserves mass.

Newly cheap after this exhibit, therefore also RED if sold:

- D1 terminal glyph as mass accumulation or cold-pool source;
- D1 landing as automatic origin of surface outflow;
- one scene in which a downward pathline hits and then a
  divergent near-ground pathline leaves that point, presented as
  the same air;
- `Both` of StoryPathlines and DownwardPathline.

A future independent near-ground outflow **operand**, honestly
named as prescribed `V_h` in a low layer, keeps the debt YELLOW
the same way the sixth operand did — **if** those sentences are
not used.

Do not design a solver here. A continuity-aware model is still
verdict C of `10`: only when the teaching goal is mass-consistent
circulation.

---

## 7. Near-ground outflow readiness

This is the main question of the audit.

### 7.1 Prerequisite checklist

| Prerequisite | Status |
| --- | --- |
| Ground tracer policy implemented? | **Yes.** `AtmosphericTracerDomain` on live `Simulation`. |
| Downward exhibit exists? | **Yes.** Live `DownwardPathline` / D1. |
| Ground landing semantics defined? | **Yes.** Pathline termination, not outflow (`11` §6, `12` §15). |
| Continuity anti-claims sufficient to *start a SoT*? | **Yes**, if the SoT repeats independence and forbids D1-inheritance. They are **not** sufficient to combine exhibits. |
| Density / temperature / buoyancy first? | **No**, not for a kinematic prescribed field. Required only if the object is a cold pool. |
| Coupling to D1 landing required? | **No.** Prefer independence (`§8`). |

### 7.2 Allowed kinematic scope

A later physics SoT **may** define an independent prescribed
near-ground divergent horizontal velocity field, in the same
class as `16` / `17`:

```text
allowed:     Eulerian V_h in a low vertical window
             own center, own σ, own strength, own envelope
             additive CompositeVelocityField operand
             copy: prescribed near-ground divergent outflow

not allowed: Vx/Vz bolted onto VerticalEnvelopeDowndraftField
             bounce / no-flux conversion of Vy at y = 0
             automatic enable on domain exit
             inheritance of D1 landing as source
             density current / buoyancy / cooling
             gust-front propagation as a material front
             RFD/FFD naming
             continuity closure of the sixth-operand sink
```

Kinematic prescribed `V_h` without thermodynamics is the same
honesty class as current inflow/outflow. What it **cannot** claim:
the air is colder, denser, negatively buoyant, or a thunderstorm
outflow boundary.

### 7.3 What would make this B instead of A

Only a missing **kinematic** prerequisite. None is missing.

UI mode selector, camera polish, pad widen, and a six-operand
`∇ · V` map along D1 are not blockers. The D1-path integral of
`∇ · V` is not required to authorize a new independent operand
(S1/S2 already showed that reachability ≠ mass proof).

---

## 8. Cold pool vs generic surface outflow

Do **not** lock a production type name in this checkpoint. A
physics SoT owns the name. This section locks the **semantic
split**.

| Candidate name | Honest? | Why |
| --- | --- | --- |
| `ColdPoolOutflowField` | **No** | Cold pool denotes a density current: cooling, `θ`/`ρ` deficit, buoyancy, typically a propagating gust front. None of that exists. |
| `SurfaceRadialOutflowField` | Risky | “Surface” invites terrain / collision / `Vy(0)=0` wall, which `11` rejected as field policy. |
| `NearGroundRadialOutflowField` | Honest direction | Names the layer and the kinematic family (radial `V_h`), not thermodynamics. Parallel to `LowerRadialInflowField` / `UpperRadialOutflowField`. |
| Other | Open in the physics SoT | e.g. a non-radial planform, if justified. Do not invent it here. |

**Policy:** the next primitive, if written, is a **near-ground
prescribed outflow**, not a cold pool.

`UpperRadialOutflowField` already occupies the word “outflow” for
the anvil-height radial family. The next type must not collapse
into that occupant by lowering `baseHeight`. Different layer,
different DEMO center policy, different teaching object.

Gust front, RFD outflow, FFD outflow: still non-goals as names.

---

## 9. Relation to D1

Future near-ground outflow **must not** automatically:

| Temptation | Verdict |
| --- | --- |
| Inherit D1 landing as source | **Forbidden.** Landing is a pathline end (`12` §16). |
| Center on the downdraft axis by law | **Forbidden as physics.** Independent `centerX` / `centerZ`, same pattern as `20` §6. A later DEMO *may* choose coincidence; that is a fixture to justify, not inheritance. |
| Randomly coincide with D1 landing | Coincidence is a DEMO choice that would look like coupling. Prefer a clearly independent center unless a later occupancy SoT argues otherwise. |
| Enable on ground hit | **Forbidden.** Domain exit is not a source term. No event-triggered field. |
| Use the 5×5 landing bbox as a pool boundary | **Forbidden.** That bbox is a basin research envelope (`12` §7.1), not a footprint. |

Prefer **independence**. Coupling is an interaction (`02` Y12).
The compositor does not become a solver because a tracer reached
`y = 0`.

D1 may later be **teaching context** for a *separate* exhibit
(“here a downward pathline ended; here, independently, a
prescribed near-ground outflow lives”). Context is not source.

---

## 10. Ground-impact → outflow narrative

Later teaching stories that can be authorized **separately**:

```text
Exhibit A  (live):   downward pathline to atmospheric-domain exit
Exhibit B  (future): prescribed near-ground divergent outflow
```

That pair is honest if they are **two pedagogy modes** (or two
exclusive live switches), like StoryPathlines vs
DownwardPathline.

A combined exhibit:

```text
D1 descends  →  hits  →  then spreads as this outflow
```

is **not** automatically allowed. It is the surface analog of
`Both`. Motion would write “the same air.” Copy cannot unsay it
at the current model class.

Do not add `TracerPedagogy.DownwardThenOutflow` or concatenate
seed arrays in this checkpoint. A future combined-mode SoT would
need group language **and** a model class that may claim related
air. This kinematic stack does not.

---

## 11. Old assumptions audit

Compared with `02`, `09`, `10`, `11`, `12`, `15`, `20`. `02` body
is historically frozen; this table is the current register.

### CLOSED

| Item | Why closed |
| --- | --- |
| Height-independent rotation as **live occupant** | `18` / `12-rendering`: `VerticalEnvelopeRotationField`, `[0, 6500] m`. Isolated `RotationField` remains a primitive. |
| Thin chimney as **live DEMO fact** | `06`: `σ = 4000 m`, `W0 = 30 m/s`. |
| Story reachability | `07` A, `08` S1/S2. `15` §9: still holds with the sixth operand. |
| SR frame as live 3D | `StormRelativeLaboratory`. Wind-tunnel remains explicit. |
| Story / diagnostic **architectural** split | Three arrays, three enum values, no `Both`. |
| Trails | `14` Option C. Live DownwardPathline enables them. |
| Downdraft as operand | `20` primitive + `15` occupant + live sixth slot. |
| Ground / underground **for atmospheric tracers** | `11` B implemented; D1 is the live crossing. No terrain. |
| Terminal impact visualization | `12` B: `keepInactiveGlyphs` for DownwardPathline only. |

### PARTIALLY CLOSED

| Item | Done | Remains |
| --- | --- | --- |
| Continuity | `10` quantified five-operand chimney; sixth-operand identity known; anti-claims live | Residual still YELLOW; louder at D1 landing (`§6`) |
| Shared `σ` / fixed centers | Sixth operand has independent `σ` and offset center | Chimney four still share `σ = 4000 m` and `(0, 0)` as a fixture |
| Story / diagnostic **as live UX** | Architecture is real; three modes exist | Browser shows only D1. Diagnostic **and** story are off-screen. No UI toggle (`09` §6 still “not now,” but the debt is louder) |
| Wind-tunnel semantics | Live 3D is SR laboratory | D3 translating storm still not live; hodograph still ground-relative |
| Y5 inflow plateau to `−∞` | Live pathlines no longer occupy it | Primitive unchanged; Eulerian underground sink in `10` still exists if sampled |
| Y20 “no ground plane” | Named ground reference plane + tracer floor | Still not terrain, not a field wall, not a flux lid |
| Chimney as teaching column | Deep envelopes, localized rotation, offset downdraft | Still a laboratory chimney, not a storm |

### STILL OPEN

| Item | Status |
| --- | --- |
| Continuity residual | YELLOW (`§6`) |
| No tilting / stretching | Rotation remains prescribed. Story must not say “captured.” |
| No translating storm | D3 from `03` not live |
| No Bunkers | `C` prescribed |
| No thermodynamics / buoyancy / density current | Explicit. This is why the next field is not a cold pool |
| Both-groups UI / combined upward+downward | Forbidden |
| Combined D1 + surface outflow scene | Forbidden until a dedicated pedagogy SoT |
| Diagnostic `divergence()` API | Forbidden |
| UI mode selector | Deferred; louder UX debt, still not the next **modeling** slice |
| Euler DEMO / no production `DEFAULT_DT` | Acceptable while claims stay laboratory |

### NEWLY OPENED

| Item | Why new |
| --- | --- |
| Terminal glyph-on-ground as deposition reading | `§3.1`. Policy B is right; the lie is now visible. |
| D1 landing as tempting outflow / cold-pool source | `§8`–`§9`. Coupling temptation, not an implementation. |
| Occupant-core `∇ · V` at `y = 0` as the loud residual site | `10` mapped the chimney. Live teaching now sits in the sixth operand’s lower-half sink. |
| Near-ground prescribed `V_h` as the next honest kinematic family | Prerequisites in `11`/`12`/`15` are satisfied. Opening it is a dedicated SoT, not an accident. |
| Three-mode UX: two exhibits off-screen | Diagnostic and story both require a code-constant change. |

---

## 12. Ranked next slices

Physics/modeling first. Visual polish is not a reason.

1. **Prescribed near-ground outflow physics SoT** (recommended).
   Independent kinematic `V_h` in a low window. No thermodynamics.
   No D1 coupling. No production code in that slice. Name must not
   be cold pool.
2. **Occupancy + pedagogy for that field, later, as separate
   slices** — after the physics SoT is accepted and implemented.
   Same order as `20` → `15` → `12`. Combined D1+outflow mode is
   not part of those slices unless separately justified.
3. **UI mode selector** DiagnosticProbes / StoryPathlines /
   DownwardPathline — not physics; more justified than in `09`
   because two teaching contracts are now hidden; still not the
   next modeling slice.
4. **Continuity-aware / coupled model** — only if the teaching
   goal becomes mass-consistent circulation (`10` C). Not now.
5. **Cold-pool thermodynamic fork** — density / buoyancy / cooling.
   A different model family. Not a rename of (1).
6. **Tilting / stretching** — interaction (`02` Y12). Different
   story. Do not start while surface-flow naming is still unsettled.
7. **Translating storm (D3)** — different exhibit. Current contract
   is already storm-relative laboratory.
8. **Rendering polish** (pad widen, camera, glyph size) — optional;
   `15` already deferred 12 km margin. Not blocking.

Not next: Both-mode, Bunkers, solver, `divergence()` API,
bolting `Vx`/`Vz` onto the downdraft type, occupant retune of
`D0` / `σ_down`.

### Recommended next modeling slice

**Prescribed near-ground outflow physics SoT.**

Why this, and not because it would look better:

The live teaching climax is a pathline that **ends** on the datum
with `Vx_down ≡ Vz_down ≡ 0`. Viewers will ask what happens to
the air at the ground. The honest kinematic answer the project
can give, without thermodynamics, is a **new independent
horizontal operand** in a near-ground window — or an explicit
refusal. `20` / `15` / `12` already named that family and forbade
smuggling it into the downdraft type.

A physics SoT is required before any occupancy, seed, or pedagogy
work, because the name (“cold pool” vs “near-ground outflow”),
the envelope family, and independence from D1 are scientific
decisions, not DEMO taste.

Why not UI first: it recovers hidden exhibits; it does not answer
the ground-flow question. Why not a solver: the residual is still
an honest prescribed signature. Why not thermo first: that is the
cold-pool fork, which this audit refuses to open under a
kinematic label.

---

## 13. Required verdicts

```text
checkpoint verdict:          A
                             Ready for prescribed near-ground
                             outflow SoT.

can call it "cold pool"?     no
                             No density, temperature, buoyancy,
                             or propagating gust front exists.
                             A kinematic near-ground prescribed
                             outflow is the honest name class.
```

**A, not B:** ground policy, downward exhibit, and landing
semantics are live. Continuity anti-claims are sufficient to
*document* a new independent operand. They are not a license to
combine it with D1.

**A, not C:** additive prescribed kinematics still host one more
horizontal family. C would be correct only if the next object
were required to be a density current or a continuity-coupled
cell. It is not.

---

## 14. Docs debt (do not mass-edit here)

| Location | Issue |
| --- | --- |
| `11` §9 | Still says `Vy_total ≥ 0` / live story numerically unchanged. Stale after sixth operand + D1. Header of `11` already knows D1. |
| `09` §7 “No downdraft” | Stale as an operand fact (`12` already flagged). Historical review snapshot. |
| `10` header / chimney maps | Still the five-operand measurement. This document is the sixth-operand pointer, not a rewrite of those tables. |
| `02` live-stack paragraphs | Still describe older occupants. Banner later; do not pretend `02` always knew envelope rotation, SR 3D, or D1. |
| `20` §22 | Still says S1/S2 are “the current kinematic exhibit of the five-operand sum.” Live exhibit is D1; S1/S2 remain the story exhibit. Physics formula ownership is unaffected. |

No production comments were patched in this slice.

---

## 15. Compact lock-in

```text
verdict:                 A
                         ready for prescribed near-ground outflow SoT
                         not a cold pool
                         not C (kinematic class not exhausted)

current live teaching:   TracerPedagogy.DownwardPathline
                         D1; trails on; keepInactiveGlyphs
                         StormRelativeLaboratory
                         allowed claim: 12 §14

current stack:           SR env advection
                         + enveloped updraft
                         + enveloped rotation
                         + lower radial inflow
                         + upper radial outflow
                         + offset enveloped downdraft

closed:                  envelope rotation occupant
                         deep chimney fixture
                         story reachability
                         live SR frame
                         architectural mode split
                         trails
                         downdraft operand
                         tracer floor + live D1 crossing
                         terminal glyph policy

partial:                 continuity (YELLOW, louder at landing)
                         shared σ / centers (sixth broke it for itself)
                         diagnostic/story live UX (both off-screen)
                         Y5/Y20 (tracers closed; Eulerian underground open)
                         wind-tunnel vs D3

open:                    tilting/stretching
                         translating storm
                         Bunkers
                         thermodynamics / density current
                         Both
                         combined D1+outflow scene
                         UI selector
                         solver / divergence() API

newly opened:            glyph-on-ground deposition reading
                         D1 landing as coupling temptation
                         occupant-core sink at y = 0 as loud residual
                         near-ground V_h as next honest kinematic family
                         three-mode UX debt

continuity status:       YELLOW
                         chimney maps of 10 still representative
                         D1 landing sits in ∇·V_down ~ −0.012 s⁻¹
                         mode split protects closed-cell reading
                         RED if return-of-this-air, mass conservation,
                         glyph-as-accumulation, or D1-as-outflow-source

ground status:           policy B live
                         D1 interpolates to y = 0, deactivates,
                         terminal history once, glyph remains
                         not no-flux, not pressure, not cold pool

next-model readiness:    A
cold-pool naming:        no
recommended next slice:  prescribed near-ground outflow physics SoT
                         independent; kinematic; not D1-coupled;
                         not thermo; not production in that slice

blockers:                none for writing that SoT
                         combining with D1 is a separate forbidden
                         default, not a blocker of the physics SoT

production this slice:   none
```

---

## 16. STOP

This checkpoint does not start a new field, UI, solver, or
thermodynamics.

Do not bolt `Vx`/`Vz` onto `VerticalEnvelopeDowndraftField`.
Do not name the next primitive a cold pool.
Do not treat D1 landing as a source.
Do not add `Both`.
Do not retune `D0`, envelopes, or seeds to shrink `∇ · V`.
