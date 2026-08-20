# Post-Near-Ground-Outflow Checkpoint Audit

**Status:** architecture checkpoint SoT after the complete
near-ground-outflow arc. Production code was not changed.
No solver, thermodynamics, tilting/stretching implementation,
UI, new field, or translating storm. This document remains the
physics/continuity checkpoint of that arc. Product direction
after Explore / Inspector / Guided v1:
`docs/architecture/21-whole-product-direction-checkpoint.md`.
`16` already superseded the four-mode pedagogy-selector
recommendation in §11.
**Current modeling status:** physics pause of Verdict D is
lifted for design in
`docs/architecture/24-perceptual-exploration-checkpoint.md`.
Direction revalidation:
`docs/architecture/25-tilting-stretching-direction-revalidation.md`.
This file is not that resumption or revalidation SoT. §9
remains the sketched tilting / stretching fork; it is not a
later implementation design. `25` ranks which of §9 still
holds. Post-T1 direction after validated T1:
`docs/architecture/27-post-t1-physics-direction-checkpoint.md`.

Live at the time of this audit:

```text
IntegrationFrame     = StormRelativeLaboratory
TracerPedagogy       = NearGroundOutflowPathline
live seed            = NG1 (3000, 100, 4750)
trails               = on
keepInactiveGlyphs   = false
AtmosphericTracerDomain = y ≥ 0
integrator           = Euler, dt = 0.1 s
stack                = StormRelativeEnvironmentalAdvectionField
                       + VerticalEnvelopeUpdraftField
                       + VerticalEnvelopeRotationField
                       + LowerRadialInflowField
                       + UpperRadialOutflowField
                       + VerticalEnvelopeDowndraftField
                       + NearGroundRadialOutflowField
```

Four explicit pedagogy modes, never concatenated:

```text
DiagnosticProbes
StoryPathlines
DownwardPathline
NearGroundOutflowPathline
```

No `Both`. No `DownwardThenOutflow`. No `ColdPool`.

Predecessor checkpoint (six-operand live, D1 on screen):
`docs/architecture/13-post-downdraft-checkpoint.md`.

Near-ground pedagogy (live NG1):
`docs/architecture/14-near-ground-outflow-pedagogy.md`.

Seventh-operand occupancy:
`docs/rendering/16-composite-near-ground-outflow-demo.md`.

Primitive:
`docs/physics/21-near-ground-radial-outflow.md`.

Five-operand chimney continuity (not retuned; revisited here
after the seventh operand):
`docs/architecture/10-composite-continuity-mass-budget-audit.md`.

This document does **not** rewrite physics SoT. Formulas below
are identities already locked in `10` / `16` occupancy / `20` /
`21`. No new full research sweep. No parameter retune.

---

## 1. Verdict

**D. Stop adding physics temporarily. Architecture / UX
prerequisite first.**

Not A: the prescribed kinematic cartoon this laboratory set out
to host is complete enough. There is no remaining sibling
`VelocityField` that would be honest, distinct, and still inside
the additive class. Another near-ground patch, a second
downdraft, a gust-front arc, or `Vx`/`Vz` bolted onto the
downdraft type would be a naming trap, not a missing mechanism.

Not B as the *next commanded slice*: tilting / stretching is the
leading **future** physics-architecture branch, and `13` §12
item 6 is now unblocked (surface-flow naming is settled). It is
still a new model class (`02` Y12). Opening that SoT immediately
would start an interaction-architecture conversation while three
of four teaching contracts are dark in the browser.

Not C: cold pool / density current / gust front is a later
model-class transition, not a rename of
`NearGroundRadialOutflowField`. Opening thermo research now
would recast the live NG1 exhibit as a placeholder for the
thing `13` / `14` / `21` just forbade naming.

Separately:

```text
should UI pedagogy selector be the next
non-modeling slice?                      yes

when modeling resumes, first physics
document?                                B
                                         tilting / stretching
                                         interaction architecture SoT
                                         (docs only; not an eighth operand)
```

---

## 2. Current teaching contracts

Four modes. Role is which seed array, not a tag. Arrays are
never concatenated (`08` §4, `12` §8–§9, `14` §12). None of the
four requires `Both`.

The compositor always contains all seven operands. **Presence ≠
exhibit.** Mode selects seeds, trails, and terminal-glyph
policy. It does not enable or disable fields.

### 2.1 DiagnosticProbes

```text
seeds     diagnosticSeeds
          axis  (0, 1000, 0)
          east  (2400, 1000, 0)
          north (0, 1000, −2400)
trails    off
glyphs    hide when inactive
default   composition API
live App  no
```

What they diagnose **now**, in the seven-operand sum:

| Seed | Job that still exists | Seventh operand |
| --- | --- | --- |
| Axis | Chimney-axis control: inflow and rotation identically zero; `V_sr` + updraft | `G_ng(1000) = 0`. Unchanged by NG. Sixth-operand far tail still `E_down(5000 m) ≈ 0.044`. |
| East | Cyclonic-flank graze of the chimney (`r = 0.6 σ_up`) | Same height: occupant identically zero. Still a chimney-flank probe, slightly mixed with the sixth operand as in `13`. |
| North | Downstream failure of the south-side story basin | Occupant zero. Still the honest miss. |

The trio is still needed. StoryPathlines, DownwardPathline, and
NearGroundOutflowPathline do **not** replace mechanism contrast
at the seed layer. Axis is still not a story seed (`08`: inflow
is zero on `r = 0`). North is still the honest miss, not a bug.

The mode has now lost live visibility **three** times: Story,
Downward, NearGroundOutflow. That is UX debt (`§12`), not a
physics regression. Recovered by passing `DiagnosticProbes`
into `composeDemoTracerSimulation`.

Does **not** teach: lower→upper story, descent to the datum,
near-ground outflow, circulation, cold pool.

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

`16` §9 / `14`: under the live seventh occupant, S1/S2 still
letter-pass. `G_ng(1000) = 0`, so this pair does not sample the
seventh operand. The sixth operand remains almost unsampled.

Forbidden, still: same-air-mass circulation, mesocyclone
capture, realistic parcel, full supercell, “the air that went
up came out here,” life cycle, return as D1, spreading as NG1.

### 2.3 DownwardPathline

```text
seeds              downwardPathlineSeeds  D1 (5000, 1000, 0)
trails             on
keepInactiveGlyphs true
live App           no  (explicit composition option)
```

Allowed claim (`12` §14):

```text
prescribed storm-relative pathline descending through the
downdraft region until atmospheric-domain exit at y = 0
```

Natural short label: downward pathline to the atmospheric ground
boundary.

**This mode is not the source of NearGroundOutflowPathline.**

`16` occupancy placed B at `(3000, 4000)`, 5.6 km from D1
landing. Isolated NG `v_r` on the live D1 path is 0.06 m/s.
D1’s landing is a pathline end (`11` §6, `12` §15). Domain exit
does not enable a field. Horizontal drift during descent is
SR + inflow + rotation, not spreading at the surface
(`Vx_down ≡ Vz_down ≡ 0`).

Forbidden, still (`12` §14, `13` §2.3, `14` §12): air returns
to the surface as the same parcel; S1/S2 came down here;
RFD/FFD; precipitation-cooled air; cold-pool generation; gust
front; mass-conserving return; compensating subsidence; the
missing half of the storm; **D1 landing as NG1’s origin**.

### 2.4 NearGroundOutflowPathline

```text
seeds              nearGroundOutflowPathlineSeeds  NG1 (3000, 100, 4750)
trails             on
keepInactiveGlyphs false
live App           yes
panel copy         matches 14 §16
```

Allowed claim (`14` §16):

```text
prescribed storm-relative near-ground pathline advected
through a divergent horizontal outflow region
```

Natural short label: near-ground outflow pathline.

**This mode is not cold-pool spreading.**

NG1 starts at `y = 100 m`, `r0 / σ_ng = 0.50`, south of B.
Inflow *opposes* and NG still leads for the entire life
(`14` §10: mean `v_r,ng` NG `+7.95`, inflow `−2.13`, SR
`+0.43`). Live minus NG fails the teaching threshold
(`Δr = 417 m`). Isolated NG is a south ray that never grounds.
Composite bends east and eventually exits the atmospheric
domain at `t ≈ 276 s`. That exit is incidental
(`14` §14): the teaching event is the outward trail by
`t ≈ 200 s`, still on the pad. One seed, not a fan.

Forbidden (`14` §16, `21` §4.3): cold-pool spreading;
gust-front flow; density current; precipitation-cooled air;
air spreading after D1 impact; the same air that descended;
surface response / deposition / skating; mass spreading /
mass conservation; RFD / FFD; compensating the chimney or
closing `∇ · V`; “the air that went up came out here.”

### 2.5 Both

Not a value on `TracerPedagogy`. Tests freeze the four names.
`demoSeedsForPedagogy` never concatenates arrays.

`Both` remains forbidden for the same reason as `12` §9 and
`14` §12: two pedagogical objects on one screen become one
false storm. Four isolated modes are how that anti-claim is
currently **enforced**. They are not a reason to add a
combined mode.

Rejected combined names, still: `DownwardThenOutflow`,
`ColdPool`, `SurfaceOutflow`, `OutflowPathlines` (plural).

---

## 3. Mode separation versus false causal narratives

Confirmed against live composition and renderer contracts.

| Anti-claim | Status |
| --- | --- |
| Upward and downward paths are not shown simultaneously | **Holds.** Live is NG1 only. S1/S2 and D1 require an explicit pedagogy change. No `Both`. |
| D1 is not the source of NG1 | **Holds as architecture and as occupancy.** Different modes, different arrays, offset centers, D1 path almost unsampled by NG. |
| NG1 is not cold-pool spreading | **Holds as claim and as seed policy.** One pathline, glyph hidden at inactive, copy uses `14` §16. A sector of seeds is still forbidden (`14` §7). |
| D1 terminal glyph = pathline endpoint, not mass accumulation | **Specified.** Off-screen while live is NG1. Still true when DownwardPathline is selected. |
| NG1 terminal = incidental domain exit, not the climax | **Holds.** `keepInactiveGlyphs = false`. Trail remains; resting sphere does not. |
| Ground reference plane = tracer-domain datum | **Holds.** `GridHelper` at `y = 0`. Not terrain, not a `VelocityField` domain. |
| Trails = path history, not streamtubes | **Holds.** `TracerPathHistory` + `THREE.Line`. One polyline, no radius. |

### 3.1 Is four-mode isolation still sufficient?

**Yes, as visual enforcement. No, as a substitute for a
combined-scene SoT that this model class cannot host.**

Isolation now protects **three** cheap cartoons, not one:

```text
S1/S2 + D1     →  closed cell / return of this air
D1 + NG1       →  hit the ground and spread
S1/S2 + NG1    →  went up, came out below
```

All three are RED if shown together (`10` §10, `13` §10,
`14` §12). Copy cannot unsay combined motion. Different
colors would not be enough.

The live switch to NearGroundOutflowPathline is how
D1-then-spread is currently **off-screen**. That is the same
enforcement pattern `13` used for S1/S2 + D1. It is not a
license to concatenate later.

Four modes are **stronger** protection than three **if** they
stay exclusive. They become weaker the moment a selector, a
test, or a “show all” convenience concatenates arrays.

That is why a future UI selector is useful (`§12`) and why it
must still never create a combined mode.

### 3.2 New misleading visual claim: one divergent trail near the datum

**Yes. Newly attached to the live exhibit. Pedagogical YELLOW,
not a production defect.**

`13` §3.1 named stillness of D1’s glyph on the plane. That
reading is now off-screen. The live cheap readings, in
increasing danger:

1. **Wandering near-ground tracer** — false. NG leads; live
   minus NG fails `14` §5.
2. **Mass spreading / air being created here** — false
   (`01` parcel §27–28; `21` §19.4). One polyline is not
   density. The particle sits in a loud horizontal **source**
   (`§7`).
3. **Cold pool / gust-front / density current** — false
   (`13`, `21`, `14` §16). This is the reading the live
   screen now makes cheapest.
4. **This is D1’s air, continuing** — false, and currently
   protected by isolation. Combining the two modes would make
   (4) almost automatic.

The glyph does **not** rest on the plane (policy A of `14`
§14). The remaining lie is **outward motion in a named
near-ground layer**, which looks like a pool expanding.

One seed is the remaining kinematic honesty. A second nearby
NG seed would draw a fan (`14` §7). That would be a pedagogy
regression, not an enrichment.

---

## 4. Physics inventory

Current prescribed mechanisms. Independent additive operands
(`12` compositor). No coupling equation. Shared chimney
`σ = 4000 m` and origin centers remain a DEMO fixture (`06`,
`01`). The sixth operand broke that fixture **for itself**
(`σ_down = 2000 m`, center `(5000, 0)`). The seventh broke it
again (`σ_ng = 1500 m`, center `(3000, 4000)`).

Do **not** silently promote any of these to realistic storm
dynamics. Every row is a laboratory operand.

### 4.1 Storm-relative environmental advection

```text
type                 StormRelativeEnvironmentalAdvectionField
prescribed/derived   prescribed adapter: V_env − C on the env operand only
coupled?             no
vertical support     profile knots 0 … 12000 m; clamp outside
horizontal geometry  horizontally homogeneous
DEMO scale           C = (10, 0) m/s eastward; live V_sr(1000 m) ≈ (−5, +15)
                     V_sr(0) ≈ (5, 5) atmospheric → world (5, −5)
continuity           ∇ · V = 0  (homogeneous horizontal; C constant)
teaching role        storm-relative laboratory wind-through (D2)
not                  translating storm (D3); not hodograph rewrite;
                     not Bunkers
```

### 4.2 Updraft

```text
type                 VerticalEnvelopeUpdraftField
prescribed/derived   prescribed
coupled?             no
vertical support     compact half-sine [0, 8000] m
horizontal geometry  Gaussian E(r); Vx ≡ Vz ≡ 0
DEMO scale           σ = 4000 m, W0 = 30 m/s, center (0, 0)
continuity           ∇ · V = W0 E(r) F'(y)
                     source lower half, sink upper
                     axis max |∂Vy/∂y| = W0 π / H_up = 0.0118 s⁻¹
teaching role        deep chimney lift for S1/S2
not                  CAPE; not a buoyant plume
```

### 4.3 Localized rotation

```text
type                 VerticalEnvelopeRotationField
prescribed/derived   prescribed
coupled?             no
vertical support     compact half-sine [0, 6500] m
horizontal geometry  azimuthal Gaussian about a vertical axis
DEMO scale           σ = 4000 m, Ω = 0.005 s⁻¹, center (0, 0)
continuity           ∇ · V = 0 identically
teaching role        prescribed spin in a height window
not                  tilted environmental vorticity; not stretching;
                     not a mesocyclone; not the curl of the composite
```

### 4.4 Lower inflow

```text
type                 LowerRadialInflowField
prescribed/derived   prescribed
coupled?             no
vertical support     plateau G = 1 for y ≤ 1500 m; taper to 4500 m
horizontal geometry  inward Gaussian-linear radial
DEMO scale           σ = 4000 m, A_in = 0.00125 s⁻¹, center (0, 0)
continuity           ∇ · V = −A_in E G (2 − r²/σ²)
                     axis plateau sink −2 A_in = −0.0025 s⁻¹
teaching role        lower-level radial approach of the story
not                  the mass source of the updraft
```

The plateau still extends to `y → −∞` (`17`, `02` Y5). That is
the primitive family, not a live tracer exhibit (`11` B).

### 4.5 Upper outflow

```text
type                 UpperRadialOutflowField
prescribed/derived   prescribed
coupled?             no
vertical support     compact half-sine [5000, 9000] m
horizontal geometry  outward Gaussian-linear radial
DEMO scale           σ = 4000 m, A_out = 0.0025 s⁻¹, center (0, 0)
continuity           ∇ · V = +A_out E G (2 − r²/σ²)
                     axis mid-layer source +2 A_out = +0.005 s⁻¹
teaching role        upper-level radial exit of the story
not                  anvil / tropopause physics; not near-ground outflow
```

Do not extend `G_out` downward to fake a surface family (`13`
§4.5, `21` §3.1). That occupant already exists as the seventh
operand, with a different envelope family.

### 4.6 Offset downdraft

```text
type                 VerticalEnvelopeDowndraftField
prescribed/derived   prescribed
coupled?             no
vertical support     compact half-sine [−400, 3600] m
                     y = 0 is interior (F(0) = 0.309)
horizontal geometry  Vx ≡ Vz ≡ 0
DEMO scale           σ_down = 2000 m, D0 = 20 m/s, center (5000, 0)
continuity           ∇ · V = −D0 E_down(r) (π/H) cos(π ξ)
                     H = 4000 m; axis max |∂Vy/∂y| = 0.0157 s⁻¹
teaching role        prescribed descent window for D1
not                  return of S1/S2; not RFD/FFD; not cold pool;
                     not a source of NG1
```

### 4.7 Near-ground radial outflow

```text
type                 NearGroundRadialOutflowField
prescribed/derived   prescribed
coupled?             no
vertical support     plateau G = 1 for y ≤ 0; taper to 800 m
                     G(0) = 1, G(100) ≈ 0.98, G(1000) = 0
horizontal geometry  outward Gaussian-linear radial about own axis
DEMO scale           σ_ng = 1500 m, A = 0.010991 s⁻¹,
                     peak |V_h| = 10 m/s, center (3000, 4000)
continuity           ∇ · V = +A E G (2 − r²/σ²)
                     axis plateau source +2A ≈ +0.022 s⁻¹
teaching role        prescribed near-ground divergent V_h for NG1
not                  cold pool; density current; gust front;
                     D1 continuation; closure of ∇ · V_down;
                     a sign-flip of LowerRadialInflowField;
                     a lowered UpperRadialOutflowField
```

Offset from D1 landing: 5581 m (`16` §2). Offset from
downdraft axis: 4472 m. Coaxial placement with chimney inflow
was rejected (`16` §8).

---

## 5. What is represented, what is absent

Kinematically represented, at least as independent prescribed
pieces of a laboratory cartoon:

| Phenomenon | How |
| --- | --- |
| Environmental wind / vertical shear | `EnvironmentalWindProfile` + diagnostics |
| Storm-relative environmental advection | D2 adapter; not D3 |
| Deep updraft chimney | enveloped `Vy > 0` |
| Lower-level radial inflow | enveloped inward `V_h` |
| Upper-level radial outflow | enveloped outward `V_h` |
| Localized vertical rotation | enveloped azimuthal `V_h`; prescribed |
| Offset downdraft | enveloped `Vy < 0` |
| Near-ground divergent outflow | enveloped outward `V_h` in a low window |
| Atmospheric tracer floor | `AtmosphericTracerDomain`, `y ≥ 0` |
| Pathline exhibits of those pieces | four isolated pedagogy modes |

Diagnostic-only, not 3D occupants:

| Quantity | Status |
| --- | --- |
| Hodograph | ground-relative; overlay `[0, 1000]` |
| Horizontal vorticity from env shear | layer diagnostic (`06`) |
| Storm-relative wind | diagnostic + D2 adapter |
| Streamwise / crosswise vorticity | diagnostic (`08`) |
| SRH | diagnostic (`09`) |

Major mechanism families **entirely absent**:

```text
thermodynamics / potential temperature / buoyancy / CAPE
moisture / condensation / evaporation
precipitation / hydrometeor loading
density as a predicted field
pressure (hydrostatic or dynamic)
cold pool / density current / gust front as physics
tilting of environmental ω_h into ω_z
stretching of vertical vorticity
mesocyclone as an evolved object
RFD / FFD as named, distinct objects
translating storm (D3)
Bunkers / estimated storm motion
unsteady storm evolution / life cycle
terrain / friction / no-slip wall
Coriolis
anvil / tropopause microphysics
tornado / occlusion / cyclic mesocyclogenesis
continuity-aware / anelastic coupling
```

The seven-operand sum is a **prescribed kinematic skeleton**.
It is not a supercell. Completing the skeleton’s last honest
horizontal family does not promote the laboratory to dynamics.

---

## 6. Continuity status after the seventh operand

Revisit of `10` and `13` §6, not a replacement. No solver.
No retune. No production `divergence()` API. No new FD
campaign: linearity plus the identities in `10` §3, `20` §13,
`21` §19, and occupancy `16` §12 are enough.

### 6.1 Identity

```text
∇ · V_total = ∇ · V_up + ∇ · V_in + ∇ · V_out
            + ∇ · V_down + ∇ · V_ng
```

Environment, rotation, and constant `C` still contribute `0`.

The seventh term lives on **its own** axis and `σ`:

```text
∇ · V_ng = +A E_ng(r_ng) G_ng(y) (2 − r_ng² / σ_ng²)
           G_ng = 1  for y ≤ 0
           G_ng = 0  for y ≥ 800 m
```

It cannot cancel `17`’s `div_h` at all `r` (`21` §19.4). It
cannot cancel `20`’s `∂Vy/∂y` because `Vy_ng ≡ 0`. It is not
parameter-tied to `W0` / `A_in` / `A_out` / `D0` (`16` §7,
`21` §19.4).

### 6.2 Chimney residual (where `10` measured)

At story-seed height `y = 1000 m`, `G_ng = 0`. The seventh
operand does **not** enter the chimney maps of `10`. The
sixth-operand far tail on the updraft axis remains
O(`3×10⁻⁴ s⁻¹`) as in `13` §6.2. Those maps remain the right
picture of the **story corridor**.

### 6.3 New loud residual: occupant core near `y = 0`

Occupancy `16` §12 already recorded, live seven-operand sum
at `y = 0`:

| Point | `∇ · V` (approx.) | Character |
| --- | --- | --- |
| B axis (ng) | **+0.022 s⁻¹** | NG source `+2A`; inflow and downdraft tails small |
| D1 landing | **−0.012 s⁻¹** | still the sixth-operand sink; NG tail ≈ 0 |
| downdraft axis | −0.016 s⁻¹ | sixth-operand core; NG not a closure |
| chimney origin | −0.0035 s⁻¹ | inflow plateau + small tails |

Characteristic strains for comparison:

```text
+2 A_ng              ≈  0.0220 s⁻¹     // largest |∇ · V| in the stack
D0 π / H_down        =  0.0157 s⁻¹
W0 π / H_up          =  0.0118 s⁻¹
+2 A_out             =  0.0050 s⁻¹
−2 A_in              = −0.0025 s⁻¹
```

At NG1’s seed `(3000, 100, 4750)`, `r_ng = 0.5 σ_ng`,
`G ≈ 0.98`, `E ≈ 0.882`:

```text
∇ · V_ng(NG1 seed) ≈ +0.017 s⁻¹
e-folding 1 / |∇ · V| ≈ 60 s
```

versus NG1’s lifetime `≈ 276 s`. The teaching climax sits in
a **horizontal source of the same order as — and larger
than — the stack’s previous peak strains**, with `Vy ≡ 0` on
this operand.

This is not a new physics discovery. It is `21`’s core
source, now occupied by a live pathline in a named
near-ground layer.

Along NG1, `r` crosses `σ_ng √2 ≈ 2121 m` late
(`t ≈ 250 s`, `r ≈ 2183 m`). After that node, `div_h,ng`
flips sign while `v_r` stays outward (`21` §19.2). That is
the Gaussian-tail identity, not a front.

### 6.4 Underground Eulerian identity

`G_ng = 1` for all `y ≤ 0`. Combined with `17`’s plateau,
the half-space below the datum now has:

```text
inflow sink   +   NG source   +   downdraft envelope (baseHeight = −400)
```

Live atmospheric tracers do not occupy it (`11` B). The
Eulerian identity is larger than in `10`’s five-operand
underground sink. It is still not a tracer exhibit and not a
reason to rewrite `17` or `21`.

### 6.5 Answers

**Is continuity debt still YELLOW?** Yes. Existence of the
seventh operand is not RED (`10` §10, `13` §6.4, `21` §19.4).
Residual size is still O(mechanism strain), not ε. The new
peak is **larger** than `10`’s chimney residual, not smaller.

**Did near-ground outflow materially worsen the misleading
mass-story risk?** **Yes, at the live exhibit, and in a
different register than D1.**

| Reading | After D1 live (`13`) | After NG1 live (this audit) |
| --- | --- | --- |
| Closed cell / S1/S2 returned here | Quieter: S1/S2 off-screen | **Still quieter.** Isolation still holds. |
| Air piled up at D1 landing | **Loud.** Glyph + sink at `y = 0` | **Quieter.** D1 off-screen. |
| Air spreading / being created near the ground | Not on screen as an exhibit | **Loud.** Outward trail in `∇ · V_ng ~ +0.017 s⁻¹`. |
| Chimney `∇ · V` of `10` | Unchanged order | Unchanged order (`G_ng(1000) = 0`) |
| D1 landing sink closed by NG | Temptation named, not live | **Not closed** (`16` §12: landing still ≈ −0.012). Isolation is what keeps “hit then spread” off-screen. |

**Is mode separation still enough to keep this acceptable?**
**Yes, for the current kinematic class.** Isolation plus one
seed plus hidden terminal glyph plus `14` §16 copy is the
anti-claim set. It is **not** enough against a combined
D1+NG1 scene, a second NG seed, or copy that says cold pool
/ mass spreading / return of this air.

**Exact trigger that turns the debt RED** (reaffirmed, then
tightened):

From `10` / `02` Y13 / `13` §6.4, still:

- copy, an operand, or a future API sold as closing `∇ · V`;
- “return of this air” / same-air-mass circulation / closed cell;
- teaching that the laboratory sum conserves mass.

Newly cheap after this exhibit, therefore also RED if sold:

- NG1 trail as mass spreading, mass creation, or a cold-pool
  footprint;
- NG as closure of `∇ · V_down` or of `−2 A_in`;
- one scene in which D1 hits and NG1 leaves, presented as
  the same air (`DownwardThenOutflow` / concatenated arrays);
- two or more near-ground seeds drawing a spreading sector;
- gust front / density current / precipitation-cooled outflow
  as a name for this operand;
- retuning `A` to cancel `D0` or `A_in` and advertising the
  smaller residual as continuity.

An eighth independent prescribed operand, honestly named,
would keep the debt YELLOW the same way the sixth and seventh
did — **if** those sentences are not used. This audit does
not authorize that eighth operand (`§8`, `§15`).

Do not design a solver here. A continuity-aware model is
still verdict C of `10`: only when the teaching goal is
mass-consistent circulation.

---

## 7. Ground / surface-flow status

We now have both pieces `13` named as a family:

```text
Exhibit A   DownwardPathline
            downdraft path → atmospheric-domain exit at y = 0

Exhibit B   NearGroundOutflowPathline
            independent prescribed near-ground divergent V_h
```

They remain **separate mechanisms**.

| Question | Answer |
| --- | --- |
| Does D1 generate NG? | **No.** Domain exit is not a source term. |
| Does NG convert `Vy_down` at the floor? | **No.** `Vy_ng ≡ 0`; `Vx_down ≡ Vz_down ≡ 0`. |
| Shared type? | **No.** Sixth is vertical envelope; seventh is radial `V_h`. |
| Shared center by law? | **No.** Occupancy chose offset placement on purpose. |
| Same pedagogy mode? | **No.** Isolation is mandatory (`14` §12). |
| Same ground policy? | Both may consume `AtmosphericTracerDomain`. D1’s climax is the crossing. NG1’s crossing is incidental. |

The kinematic surface-flow family is **complete enough**.

What another sibling would actually be:

| Candidate | Why not |
| --- | --- |
| Second near-ground patch (FFD vs RFD) | Naming trap. Two divergent disks become a false storm-flank pair. |
| Gust-front arc / line planform | Material-front geometry without thermo. Dishonest. |
| `Vx`/`Vz` on `VerticalEnvelopeDowndraftField` | Forbidden (`20` §7.2, `13` §7.2). |
| Near-ground friction / no-slip / `Vy(0)=0` wall | Rejected field policy (`11` C/D). |
| Sign-flip of `LowerRadialInflowField` | Forbidden (`21` §3.3). Already have both signs as different types. |
| Lowered `UpperRadialOutflowField` | Forbidden (`21` §3.1). Envelope family is wrong at the floor. |

The next step should **leave prescribed surface kinematics**,
not add another sibling field.

Ground policy B is unchanged. Field sampling remains
unbounded. Live consumers of the floor are D1 (climax) and
NG1 (incidental). Neither is a no-flux wall, a pressure
response, or a cold pool.

---

## 8. Cold-pool fork

Major question. Do **not** design the equations here.

### 8.1 What the project may not yet honestly say

The following words require thermodynamic / density-current
semantics this laboratory does not have:

```text
cold pool
density current
gust front
negatively buoyant air
precipitation-cooled outflow
```

`NearGroundRadialOutflowField` is prescribed near-ground
divergent `V_h`. That is the honest name class (`13` §8,
`21` §6). Completing its occupancy and pedagogy does not
unlock the words above.

### 8.2 Minimum new state before those words are honest

Not a design. A checklist of **missing** objects.

To say **negatively buoyant air** at all:

- a buoyancy variable `b`, or an equivalent potential-temperature
  perturbation `θ'` with a stated reference `θ0`;
- a density statement: at least Boussinesq / anelastic
  (`ρ0` or `ρ0(z)`), not “tracers look heavy.”

To say **cold pool** as a fluid object, add:

- that buoyancy must be **localized** in a near-ground volume
  (a `θ'` deficit, not a prescribed `V_h` patch);
- a relation from buoyancy to velocity — typically a pressure
  field (hydrostatic in the pool, or an elliptic diagnostic
  pressure) so that spreading is a **response**, not a
  Gaussian `A`.

To say **density current / gust front** as a propagating
material boundary, add:

- time dependence: the front is a feature of the buoyancy
  field, not a fixed `centerX` / `centerZ`;
- a pressure gradient (or equivalent) that can propagate the
  current into the environment.

To say **precipitation-cooled outflow**, add:

- moisture (at least water-vapor mixing ratio);
- a cooling source (evaporation / melting), which needs
  hydrometeors or an explicit parameterized sink of `θ'`;
- precipitation loading is an **optional extra** buoyancy
  term, not the minimum for the name “cooled.”

Temperature in `T` versus `θ` is a representation choice, not
a third independent requirement. Density as a **predicted**
3D field is not required if Boussinesq/anelastic is chosen
explicitly. Pressure is required the moment spreading must
be a dynamical response rather than a prescribed `v_r`.

None of these exist. Diagnostics of env shear are not a
substitute. `∇ · V_ng > 0` is not buoyancy.

### 8.3 Decision

Cold-pool work is a **much later model-class transition**.

It is not a reasonable next branch.

Reasons, not taste:

- the live exhibit was just locked as *not* a cold pool;
- opening thermo now recasts NG1 as a stub of the forbidden
  object;
- minimum new state is several equations, not an eighth
  `VelocityField`;
- `CompositeVelocityField` cannot host buoyancy → pressure →
  `V` as independent addition (`02` Y12);
- `13` already split “kinematic near-ground outflow” from
  “density current.” That split is now implemented, not
  pending.

Revisit when the teaching goal is air-mass contrast, a
propagating boundary, or negatively buoyant spreading — and
when the project is ready to leave the prescribed-kinematic
class. Not because NG1 is on screen.

---

## 9. Tilting / stretching fork

`13` §12 item 6: do not start while surface-flow naming is
unsettled. Naming is now settled (`NearGroundRadialOutflowField`,
not cold pool). This fork is **unblocked**. It is not
therefore the next commanded slice (`§1`).

### 9.1 Current rotation

`VerticalEnvelopeRotationField` is prescribed, independent,
steady, and azimuthal about a world-vertical axis. `∇ · V = 0`
identically. It is not the curl of the environment, not the
curl of the updraft, and not an evolved `ω_z`.

Story copy must still not say “captured.”

### 9.2 What already exists conceptually

The textbook chain

```text
environmental horizontal vorticity
  → tilting by updraft gradients
  → vertical vorticity
  → stretching by ∂Vy/∂y
```

has **diagnostic ingredients**, not an evolution operator:

| Ingredient | What it is | What it is not |
| --- | --- | --- |
| `HorizontalVorticity` (`06`) | layer-mean `ω_h` from vertically sheared, **horizontally homogeneous** env wind | not local `ω(x,y,z)` |
| streamwise / crosswise (`08`) | projection of that `ω_h` onto `V_sr,h` | not a tilting rate |
| SRH (`09`) | integral of streamwise `ω_h` | not mesocyclone intensity |
| updraft | prescribed `Vy = W0 E(r) F(y)`, so `∂Vy/∂x`, `∂Vy/∂z`, `∂Vy/∂y` exist | not a buoyant acceleration |
| composite `V` | sum of seven prescribed operands | not a vorticity carrier |

Those diagnostics are enough to **explain the story in words**
and to overlay hodograph quantities. They are **not** enough
to replace `VerticalEnvelopeRotationField` with derived
rotation.

A horizontally homogeneous `ω_h` tilted by a localized
updraft yields, in the classic linear picture, a **vortex
couple**, not a single cyclonic mesocyclone. Preferential
cyclonic organization is the streamwise story SRH diagnoses
and this stack does not evolve.

### 9.3 Minimum architecture if rotation became derived

Not a design. A boundary.

Making rotation derived / evolving rather than prescribed
requires at least:

- a **local** vorticity representation (3D `ω`, or a
  prognostic `ω_z` with a stated closure), **or** an explicit
  diagnostic curl of `V` plus a **tendency** step;
- a coupling in which rotational velocity depends on another
  operand’s gradients (updraft) and on environmental `ω_h`;
- a decision whether stretching uses the prescribed
  `∂Vy/∂y` (still kinematic) or a buoyancy-driven `w`
  (thermo fork);
- time, or a steady diagnostic balance — both are new.

Existing layer diagnostics plus updraft gradients are the
**source terms of the textbook equation**, not the equation.

Local vorticity state is required the moment `ω` must be
**integrated**. A one-shot diagnostic curl of the current
composite would show whatever the prescribed operands already
put there (env `ω_h` uniform in `x,z`; rotation’s own
`ω_z`; updraft’s `ω_h` from `∇ × (0, Vy, 0)`). That curl is
not tilting. It is bookkeeping.

### 9.4 Can `CompositeVelocityField` host this?

**No, not as an eighth independent operand.**

`02` Y12 / `12` physics: `V_total = Σ V_i` is laboratory
addition. It stops being honest when `V` of mechanism A must
depend on velocity or vorticity of mechanism B.

Tilting / stretching is that exhaustion trigger. A new
prescribed `RotationField` with a different `Ω(y)` is still
prescribed. A term `V_rot = f(∇V_up, ω_env)` is an
**interaction**. Hosting it requires a new model class:
diagnostic/tendency step, or prognostic `ω` plus inversion
to `V`, or a parameterized source that is still documented
as parameterized — not as “the compositor learned dynamics.”

Architecture research, when commanded, may choose among
overlays-only, diagnostic curl, parameterized tilting source,
or prognostic `ω`. This checkpoint does not choose.

### 9.5 Decision

Tilting / stretching is the **leading future modeling
branch**. It is not implementable next, and it is not the
next commanded slice.

When modeling resumes: open an **architecture SoT** (docs
only). Do not implement. Do not add an eighth operand that
pretends to be tilting.

---

## 10. Translating-storm fork

D3 from `03`: moving storm center in ground-relative world.

Nothing the seventh operand added makes translating storm
more urgent.

NG1, D1, and S1/S2 are defined in `StormRelativeLaboratory`.
Occupancy centers are fixed world points. `C` remains a
prescribed diagnostic / D2 subtract. Hodograph remains
ground-relative.

`StormRelativeLaboratory` is still the correct teaching
frame.

Do not reopen D3. No dependency. Bunkers remains a separate
non-goal.

---

## 11. UI debt

There are now **four** pedagogy modes. The browser shows
one, by code constant `LIVE_DEMO_TRACER_PEDAGOGY`.

`09` §6: two-mode toggle “not now.”
`13` §12: three-mode selector more justified, still not the
next **modeling** slice.

**This audit: the selector has crossed from “nice later” to
“useful next non-physics slice.”**

Why now, and not because four is a round number:

- isolation **is** the continuity / cold-pool / closed-cell
  protection (`§3`);
- that protection is uninspectable without editing a
  constant;
- three of four teaching contracts are dark, including the
  diagnostic trio that still has a job (`§2.1`);
- in-session comparison of **exclusive** exhibits is now a
  real teaching goal, not a convenience.

Constraints, unchanged and mandatory:

```text
four named modes, not a boolean, not a multi-select
no Both
no concatenated arrays
no DownwardThenOutflow
DiagnosticProbes remains trails-off
DownwardPathline keeps inactive glyphs; NG1 hides them
copy must not collapse jobs into “more particles”
```

Ranked **separately** from modeling. It is not a physics
slice. It must not become a combined-mode SoT in disguise.

**Yes: UI pedagogy selector should be the next non-modeling
slice.**

---

## 12. Rendering / pedagogy debt

Audit only. No polish implementation.

```text
camera     (12000, 6000, 12000) → (0, 4000, 0)
FOV        50°   (half vFOV = 25°)
grid       10000 m / 10     pad ±5000 m
trails     stride 1, THREE.Line
```

| Mode | Frustum / pad | Adequacy |
| --- | --- | --- |
| DiagnosticProbes | seeds at `y = 1000`, on-pad except east on the chimney scale | Sufficient if shown. Trails off is the contract. |
| StoryPathlines | S2 seed already pad-out at `z = 6000`; trails in vFOV (`08` / `11`) | Sufficient. Known tightness. |
| DownwardPathline | D1 seed east edge; landing on-pad; `θ` IN (`12` §13) | Sufficient. Glyph-on-ground is pedagogy, not a camera bug. |
| NearGroundOutflowPathline | seed in pad (`z = 4750`); `t = 200 s` still in pad; end `x = 5400` out by 400 m; `θ` 21.1°–23.3° IN (`14` §15) | Sufficient for honesty. |

NG1 **can** leave the pad / frame late. That is acceptable
because the teaching event already occurred: by `t ≈ 200 s`,
`Δr ≈ 791 m`, the trail is a clear outward path, still on
the ruled square. The last ~50 s east of `x = 5000 m` are
the same pad-tightness class `16` §13 and `14` §15 already
declined to treat as a blocker.

A later rendering sibling **may** widen the pad. It is not
required for honesty, and it is not this checkpoint. No
follow camera. No separate near-ground view. No second trail
style for “spreading.”

Glyph policy remains mode-specific and correct: keep for D1
(climax is the hit); hide for NG1 (climax is the trail).

---

## 13. Old assumptions audit

Compared with `02`, `09`, `10`, `11`, `12`, `13`, `14`, `16`,
`20`, `21`. `02` body is historically frozen; this table is
the current register.

### CLOSED

| Item | Why closed |
| --- | --- |
| Deep chimney as **live DEMO fact** | `06`: `σ = 4000 m`, `W0 = 30 m/s`. |
| Localized rotation as **live occupant** | `18` / rendering `12`: `VerticalEnvelopeRotationField`, `[0, 6500] m`. Isolated `RotationField` remains a primitive. |
| SR frame as live 3D | `StormRelativeLaboratory`. Wind-tunnel remains explicit. |
| Story reachability | `07` A, `08` S1/S2. `16` §9: still holds with the seventh operand. |
| Story / diagnostic / downward / NG **architectural** split | Four arrays, four enum values, no `Both`. |
| Trails | `14` rendering Option C. Live NG1 enables them. |
| Downdraft as operand | `20` primitive + `15` occupant + sixth slot. |
| Ground / underground **for atmospheric tracers** | `11` B implemented; D1 and NG1 are live consumers. No terrain. |
| Near-ground outflow as operand + exhibit | `21` primitive + `16` occupant + `14` mode + live seventh slot. |
| D1 ≠ source of NG1 | Occupancy offset + mode isolation + `14` §12. |
| NG ≠ cold pool **as a name for this field** | `13` §8, `21` §6, live copy `14` §16. The *physics* of a cold pool remains absent (`STILL OPEN`). |
| Prescribed surface-flow **pair** | Descent-to-exit and independent near-ground `V_h` both exist and are isolated. |
| Terminal glyph policies | Keep for DownwardPathline; hide for NearGroundOutflowPathline. |

### PARTIALLY CLOSED

| Item | Done | Remains |
| --- | --- | --- |
| Continuity | `10` quantified five-operand chimney; sixth- and seventh-operand identities known; anti-claims live | Residual still YELLOW; **loudest site is now NG core source** (`§6`) |
| Shared `σ` / fixed centers | Sixth and seventh have independent `σ` and offset centers | Chimney four still share `σ = 4000 m` and `(0, 0)` as a fixture |
| Story / diagnostic / downward **as live UX** | Architecture is real; four modes exist | Browser shows only NG1. Three contracts are off-screen. No UI toggle |
| Wind-tunnel semantics | Live 3D is SR laboratory | D3 translating storm still not live; hodograph still ground-relative |
| Y5 inflow plateau to `−∞` | Live pathlines no longer occupy it | Primitive unchanged; Eulerian underground now also includes NG source |
| Y20 “no ground plane” | Named ground reference plane + tracer floor | Still not terrain, not a field wall, not a flux lid |
| Chimney as teaching column | Deep envelopes, localized rotation, offset downdraft, offset NG | Still a laboratory chimney, not a storm |
| D1 glyph-on-ground deposition reading | Off-screen while live is NG1; policy B still right for that mode | Returns the moment DownwardPathline is selected |
| Prescribed kinematics | Vertical-circulation cartoon + surface pair hosted | Not dynamics; Y12 next physics is interaction |

### STILL OPEN

| Item | Status |
| --- | --- |
| Continuity residual | YELLOW (`§6`) |
| No tilting / stretching | Rotation remains prescribed. Unblocked for an architecture SoT; not implemented. |
| No translating storm | D3 from `03` not live |
| No Bunkers | `C` prescribed |
| No thermodynamics / buoyancy / density current | Explicit. This is why NG is not a cold pool |
| No cold pool / gust front **as physics** | Absent. Naming of the current field is closed; the mechanism family is not. |
| Both-groups UI / combined upward+downward | Forbidden |
| Combined D1 + NG1 scene | Forbidden |
| Combined S1/S2 + NG1 scene | Forbidden |
| Diagnostic `divergence()` API | Forbidden |
| UI mode selector | **Ready as next non-modeling slice**; still must not create `Both` |
| Continuity-aware / coupled model | Only if teaching goal becomes mass-consistent circulation (`10` C) |
| Euler DEMO / no production `DEFAULT_DT` | Acceptable while claims stay laboratory |

### NEWLY OPENED

| Item | Why new |
| --- | --- |
| Live exhibit is a divergent near-ground pathline in a loud `∇ · V` source | `§3.2`, `§6.3`. Mass-spreading / cold-pool visual, not a defect. |
| Four-mode UX: three exhibits off-screen | Diagnostic, story, and downward all require a code-constant change. |
| Additive prescribed cartoon for this laboratory is complete enough to stop adding siblings | `§7`, `§15`. Y12 next physics is an interaction, not an eighth Gaussian. |
| Tilting / stretching deferral trigger from `13` lifted | Surface-flow naming is settled. Fork unblocked; not the next slice. |
| Underground Eulerian identity includes NG source for `y ≤ 0` | `G_ng = 1` on the plateau. Still not a live tracer exhibit. |
| NG1 late pad exit | Teaching event already occurred; optional rendering sibling, not blocking. |
| Cold-pool temptation attached to the **live** path | `13` attached it to D1 landing. Landing is off-screen; NG1 trail is the new cheap reading. |

---

## 14. Ranked next slices

Modeling priority and product/UX priority are separate lists.
Visual polish is not a reason.

### Modeling

1. **Tilting / stretching interaction architecture SoT**
   (when physics resumes). Docs only. Not an eighth operand.
   Not implementation. `02` Y12. Surface naming no longer
   blocks it (`13` §12 item 6).
2. **Continuity-aware / coupled model** — only if the teaching
   goal becomes mass-consistent circulation (`10` C). Not now.
   Residual is louder, not therefore a solver.
3. **Thermodynamic / cold-pool architecture research** — later
   model-class transition (`§8`). Not a rename of NG. Not next.
4. **Translating storm (D3)** — different exhibit. Current
   contract is already storm-relative laboratory. Seventh
   operand added no dependency.
5. **Another prescribed mechanism** — **only if genuinely
   missing.** This audit finds none that is honest, distinct,
   and still additive (`§7`). Not F.

Not next: Both-mode, Bunkers, solver, `divergence()` API,
bolting `Vx`/`Vz` onto the downdraft type, occupant retune of
`A` / `D0` / `σ_ng`, second NG seed, FFD-as-second-downdraft.

### Product / UX

1. **UI pedagogy selector** — four exclusive named modes, no
   `Both`. Next non-modeling slice (`§11`).
2. **Optional pad widen** — NG1 end / S2 seed tightness.
   Not required for honesty (`§12`).
3. **Docs hygiene** — stale current-tense leftovers (`§16`).
   Not modeling.

UI is not a substitute for B. B is not a substitute for UI.

### Recommended next modeling slice

**None immediately.** Verdict D.

When modeling is commanded again: **tilting / stretching
interaction architecture SoT.**

Why not another prescribed field: the surface pair and the
vertical-circulation cartoon are hosted. A sibling now would
be a naming trap.

Why not thermo first: that is the cold-pool fork, which this
audit refuses to open under a kinematic label, and which
would recast live NG1 as a stub.

Why not a solver: the residual is still an honest prescribed
signature. Louder ≠ RED.

Why not tilting *as this next slice*: it is the right physics
fork, and it is a new model class. Four exhibits cannot
currently be inspected. Opening Y12 in the dark repeats the
inheritance failure `02` warned about.

### Recommended next non-modeling slice

**UI pedagogy selector** for the four exclusive modes.

---

## 15. Required verdicts

```text
checkpoint verdict:                    D
                                       Stop adding physics
                                       temporarily.
                                       Architecture / UX
                                       prerequisite first.

next modeling when physics resumes:    B
                                       tilting / stretching
                                       interaction architecture SoT

should UI pedagogy selector be the
next non-modeling slice?               yes
                                       four exclusive named modes
                                       never a combined mode
```

**D, not A:** no genuinely missing additive sibling. Surface
kinematics are complete enough to leave.

**D, not B as the next slice:** B is unblocked and is the
leading future modeling document. It is still Y12. UX that
makes isolation inspectable is the prerequisite.

**D, not C:** cold pool is a later class transition. The live
field must not be used as the on-ramp.

---

## 16. Docs debt (do not mass-edit here)

| Location | Issue |
| --- | --- |
| `11` §9 | Still contains a five-operand leftover (`Vy_total ≥ 0` / live story numerically unchanged). Stale after sixth operand + D1. Header already knows D1. |
| `21` header | Still says pedagogy seeds / live mode switch remain deferred. `14` implemented both. Formula ownership is unaffected. |
| `12` compact lock-in | Still says live App is DownwardPathline in places. Header of `12` already points at `14`. Historical snapshot. |
| `09` §7 “No downdraft” | Stale as an operand fact. Historical review snapshot. |
| `10` header / chimney maps | Still the five-operand measurement. `13` is the sixth-operand pointer; this document is the seventh. Do not rewrite those tables. |
| `02` live-stack paragraphs | Still describe older occupants. Banner later; do not pretend `02` always knew envelope rotation, SR 3D, D1, or NG1. |
| `03` status remnants | May still speak as if story tracers were unauthorized. They are `StoryPathlines`, currently off-screen. |

No production comments were patched in this slice.

---

## 17. Compact lock-in

```text
checkpoint verdict:          D
                             stop adding physics temporarily
                             architecture / UX first
                             not A (no missing sibling)
                             not B as next slice (Y12, exhibits dark)
                             not C (cold pool is a later class)

current live mode:           TracerPedagogy.NearGroundOutflowPathline
                             NG1 (3000, 100, 4750)
                             trails on; keepInactiveGlyphs false
                             StormRelativeLaboratory
                             allowed claim: 14 §16

current operand count:       7

current pedagogy modes:      DiagnosticProbes
                             StoryPathlines
                             DownwardPathline
                             NearGroundOutflowPathline
                             no Both

closed:                      deep chimney fixture
                             localized rotation occupant
                             live SR frame
                             story reachability
                             architectural four-mode split
                             trails
                             downdraft operand
                             tracer floor + D1/NG1 consumers
                             near-ground outflow operand + exhibit
                             D1 ≠ source of NG1
                             NG name ≠ cold pool
                             prescribed surface-flow pair

partial:                     continuity (YELLOW, loudest at NG source)
                             shared σ / centers (6th and 7th broke it
                             for themselves)
                             diagnostic/story/downward live UX
                             (three off-screen)
                             Y5/Y20 (tracers closed; Eulerian
                             underground open, now with NG source)
                             wind-tunnel vs D3
                             prescribed kinematics (cartoon hosted;
                             not dynamics)

open:                        tilting/stretching (unblocked, not done)
                             translating storm
                             Bunkers
                             thermodynamics / density current
                             cold pool / gust front as physics
                             Both
                             combined D1+NG1 / S1+NG1
                             UI selector (ready, not built)
                             solver / divergence() API
                             continuity-aware model

newly opened:                live NG1 mass-spreading / cold-pool visual
                             four-mode UX debt
                             prescribed cartoon complete enough
                             to stop adding siblings
                             13 tilting deferral lifted
                             underground Eulerian NG source
                             NG1 late pad exit (not blocking)
                             cold-pool temptation on the live path

continuity status:           YELLOW
                             chimney maps of 10 still representative
                             NG axis +2A ≈ +0.022 s⁻¹
                             NG1 seed ∇·V_ng ≈ +0.017 s⁻¹
                             D1 landing still ≈ −0.012 s⁻¹
                             mode split protects closed-cell and
                             hit-then-spread
                             RED if return-of-this-air, mass
                             conservation, NG-as-spreading,
                             NG-as-∇·V_down-closure, D1-as-NG-source,
                             or a spreading sector of seeds

prescribed-kinematics
status:                      surface-flow family complete enough
                             leave it; do not add a sibling

cold-pool readiness:         not next
                             later model-class transition
                             missing b/θ', density statement,
                             pressure response; moisture/precip
                             for “precipitation-cooled”

tilting/stretching
readiness:                   unblocked for architecture SoT
                             not implementable as an operand
                             CompositeVelocityField cannot host it
                             diagnostics are conceptual ingredients,
                             not local evolving ω
                             not the next commanded slice

UI-selector readiness:       yes
                             next non-modeling slice
                             four exclusive named modes
                             never Both

recommended next
modeling slice:              none immediately
                             when modeling resumes:
                             tilting/stretching interaction
                             architecture SoT (docs only)

recommended next
non-modeling slice:          UI pedagogy selector
                             exclusive four-mode
                             no combined mode

blockers:                    none for the UI selector except
                             the hard no-Both constraint
                             none for writing a later tilting SoT
                             thermo blocked by missing state
                             eighth prescribed sibling blocked
                             by this audit (not missing)

production this slice:       none
```

---

## 18. STOP

This checkpoint does not start thermodynamics, tilting /
stretching, a solver, UI, a new field, or a translating storm.

Do not add an eighth prescribed operand.
Do not name the live exhibit a cold pool.
Do not treat D1 landing as a source of NG1.
Do not add `Both` or `DownwardThenOutflow`.
Do not retune `A`, `D0`, envelopes, or seeds to shrink `∇ · V`.
Do not install a second NG seed.

Next work starts only when commanded.
