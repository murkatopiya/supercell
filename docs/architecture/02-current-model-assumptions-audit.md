# Current Model Assumptions Audit

## 1. Purpose

This document is a checkpoint review after
`docs/rendering/09-deep-environmental-profile-demo.md`.

It answers:

    Which decisions that were reasonable when their slice was written
    are still reasonable in the current composite laboratory after
    environmental support grew to 12 km, and which have become
    architectural or physical debt?

It is **not**:

- a bug hunt;
- a request to make the model realistic;
- a new physics mechanism;
- a storm-envelope scaling SoT;
- authorization to change production code.

Existing physics and rendering SoT remain in force. This audit does
not silently rewrite them. Where a live document still speaks in
current tense about a superseded fact, that is listed as docs debt
(§10), not as a production defect.

Production code was not changed while writing this document.

---

## 2. Current laboratory (as implemented)

Live DEMO composition:

```text
EnvironmentalWindField
+ VerticalEnvelopeUpdraftField
+ RotationField
+ LowerRadialInflowField
+ UpperRadialOutflowField
→ CompositeVelocityField
```

| Layer | Current bound |
| --- | --- |
| World / math sampling | unbounded finite `y` |
| Environmental explicit support | knots `0 … 12000 m`, clamp outside |
| Storm envelopes | `08` fixtures in `0–2000 m` |
| Rotation | height-independent |
| Seeds | `y = 1000 m` |
| Storm motion `C` | `(10, 0)` m/s, diagnostic only |
| Default camera / grid | frames the `0–2 km` tower |
| Integrator | Euler, `dt = 0.1 s` |

The `0–2 km` storm inside a `12 km` profile is a **deliberate**
intermediate state (`09`). This audit asks whether that state, and
the older mechanism assumptions it sits on, still make sense as a
base for the next planned stage: a **storm-envelope scaling SoT**.

The next planned stage is **not** downdraft, continuity, tilting,
thermodynamics, or Bunkers.

---

## 3. Severity

### GREEN

The simplification is still correct for the current laboratory goal.
Do not change it. Do not re-litigate it every slice.

### YELLOW

Conscious technical or physics debt. It does not block the next
stage by itself, but it has a concrete trigger. The next SoT must
not inherit it silently.

### RED

The assumption already hinders the next planned stage, or already
creates misleading **runtime** behavior that should be fixed with a
separate SoT before (or as a required part of) envelope scaling.

This audit does not implement RED items.

Absence of full-atmosphere realism (no CAPE, cloud, terrain,
Coriolis, …) is **not** RED.

---

## 4. Executive summary

```text
GREEN   18
YELLOW  16
RED      0
```

No production-behavior RED was found.

The model can proceed to a **storm-envelope scaling SoT**. That SoT
must treat several YELLOW items as **mandatory decisions**, not as
inherited physics. A separate corrective SoT before scaling is not
required.

The single most important inherited risk is not a hidden bug. It is
the chance that envelope scaling would stretch the current `0–2 km`
tower **and** keep height-independent rotation, coincident DEMO
centers/`sigma`, and the wind-tunnel frame without writing those
choices down.

---

## 5. Boundary regularity table

Velocity here means the field’s own contribution, not the composite
sum. “Can a composite tracer cross it?” asks whether a particle
advected by the live five-operand sum can reach that `y` from the
current seeds. Today the intended probes stay near `1000 m`; Euler
can overshoot the `2000 m` lid (`09`). After envelope scaling,
crossing these lids becomes the teaching path.

| Field | Boundary | Velocity continuity | Relevant derivative | Can composite tracer cross it? |
| --- | --- | --- | --- | --- |
| `VerticalEnvelopeUpdraftField` | `y = baseHeight` (`0 m`) | `C^0` (`Vy = 0` both sides) | `F'` jumps: interior `+π/H`, exterior `0` | Yes from above; below `baseHeight`, `Vy = 0` |
| `VerticalEnvelopeUpdraftField` | `y = topHeight` (`2000 m`) | `C^0` | `F'` jumps: interior `−π/H`, exterior `0` | Yes; Euler overshoot already can |
| `LowerRadialInflowField` | `y = baseHeight` (`500 m`) | `C^1` (`G = 1`, `G' = 0` both sides) | `G''` jumps; `V_h` has no jump | Yes; seeds sit above it |
| `LowerRadialInflowField` | `y = topHeight` (`1500 m`) | `C^0` (`G → 0`) | not `C^1`; `G'` jumps | Yes, on a rising path |
| `LowerRadialInflowField` | `y → −∞` | full plateau `G = 1` | smooth in `y` on the plateau | Yes mathematically; no ground plane |
| `UpperRadialOutflowField` | `y = baseHeight` (`1000 m`) | `C^0` | `G'` jumps at the lid | Yes; seeds sit on this lid (`G_out = 0` at seed `y`) |
| `UpperRadialOutflowField` | `y = topHeight` (`2000 m`) | `C^0` | `G'` jumps | Yes; stacked with updraft lid |
| `EnvironmentalWindProfile` | each knot, incl. `2000 m` | `C^0` | `dV/dh` jumps (piecewise-linear) | Yes |
| `EnvironmentalWindProfile` | `y < 0`, `y > 12000` | clamp; velocity `C^0` | `dV/dh → 0` (shear undefined for diagnostics) | Unlikely today; possible after deep envelopes |
| `RotationField` | none in `y` | `C^∞` in space | no vertical envelope | Everywhere, including overshoot and `y < 0` |

Distinguish:

- **jump in velocity** — none of the live storm envelopes do this
  (`17` withdrew compact-zero-below inflow because it would);
- **jump in derivative** — expected at half-sine lids and at env
  knots; documented, not a bug;
- **stacked DEMO lids** — updraft top, outflow top, and an env knot
  currently share `y = 2000 m`. That is a fixture coincidence, not
  an API coupling (Y7, Y16).

After deep scaling, derivative jumps remain acceptable if they stay
explicit. They become pedagogically loud if a tall column’s only
visible “storm top” is a `C^0` lid plus full-strength rotation
above it.

---

## 6. Continuity status (what the system can and cannot do)

Current analytic residuals (`15` §11, `16` §18, `17` §19):

```text
env:        div_h = 0          (horizontally homogeneous)
rotation:   div_h = 0          (purely azimuthal Gaussian-modulated)
updraft:    ∇ · V = ∂Vy/∂y = W0 E_r F'(y)     inside (y_b, y_t)
            ∇ · V = 0                         outside
lower in:   ∇ · V = div_h(A_in, σ, G_in(y), r)
upper out:  ∇ · V = div_h(A_out, σ, G_out(y), r)
```

On the axis, plateau inflow has `div_h = −2 A_in`. At outflow mid-layer,
`div_h = +2 A_out`. These do **not** cancel the updraft stretching term
at all `r`, and v1 forbids tying

```text
A_in, A_out, W0, H_up, H_out, envelope shapes
```

by a continuity equation.

What the system **can** do:

- prescribe each mechanism independently;
- scale envelopes while remaining prescribed;
- state the residual honestly.

What it **cannot** do:

- claim mass-consistent circulation;
- claim that air which rose is the same air leaving in outflow;
- cancel `div_h` with `∂Vy/∂y` at every radius;
- host a continuity solver, pressure coupling, or diagnostic
  `divergence()` API.

Envelope scaling can stay YELLOW. Continuity becomes RED when a
future slice claims a closed cell, adds a downdraft sold as the
return branch of the same mass, or starts teaching copy that the
laboratory sum conserves mass.

Do not design a solver here.

---

## 7. Assumption register

Each entry uses:

```text
Assumption / Originally / Reason / Status / Consequence /
What exposes it / Severity / Action / Revisit when
```

---

### G1 — Rendering observes; physics defines state

**Originally:** `docs/ARCHITECTURE.md`, tracer scene `01`.

**Original reason:** keep Three.js from inventing atmosphere.

**Current status:** still true. `TracerScene` copies
`particle.position`. Hodograph consumes the profile, not the
composite.

**Consequence:** camera/grid can lag the environmental domain (`09`).

**Exposes it:** a future renderer that “helps” particles stay in
frame or clamps `y`.

**Severity:** GREEN

**Action:** none.

**Revisit when:** a rendering slice proposes physical-domain clamps
or interpolated substeps as if they were physics.

---

### G2 — Canonical world frame and explicit atmospheric conversion

**Originally:** `docs/physics/00-coordinate-system.md`.

**Original reason:** one right-handed frame; `+Y` up matches Three.js.

**Current status:** still the project invariant.
`(x, y, z) = (eastward, vertical, −northward)`.

**Consequence:** diagnostics stay in atmospheric components; fields
that advect tracers return world `Vec3`.

**Exposes it:** any silent `u,v,w` world naming or mixing
storm-relative **coordinates** with world advection.

**Severity:** GREEN

**Action:** none. Storm-relative **coordinates** (`00` §10) remain
unimplemented in 3D; that is a future frame choice (see Y15), not a
broken conversion.

**Revisit when:** a slice proposes a moving storm origin or
storm-relative particle coordinates.

---

### G3 — SI internally; no scene units in physics

**Originally:** `ARCHITECTURE.md` §4–§5.

**Current status:** meters and seconds throughout DEMO numbers
(`sigma` is metres, live `4000 m`, not a display unit).

**Severity:** GREEN

**Revisit when:** UI wants km labels. Conversion stays outside
physics.

---

### G4 — Environmental profile primitive

**Originally:** `docs/physics/04-environmental-wind-profile.md`.

**Assumption:** piecewise-linear horizontal wind versus world `+Y`;
`vertical ≡ 0`; horizontally homogeneous; steady; clamp outside
`[h_min, h_max]`.

**Current status:** still the right primitive. `09` extended DEMO
knots; it did not change the type.

**Severity:** GREEN

**Revisit when:** a sounding, pressure levels, or time-dependent
environment is actually in scope.

---

### G5 — Diagnostic domain ≠ advection clamp

**Originally:** `04` §8–§9, `05` §8–§9, `09` SRH domain policy.

**Assumption:** field sampling clamps; shear/SRH **reject** layers
that use clamped continuation.

**Current status:** after `09`, `h_max = 12000`. Implementation and
DEMO tests reject e.g. `[11000, 13000]`. No diagnostic silently
treats clamp as observed atmosphere.

**Consequence:** 3D tracers above `12000 m` would still feel constant
wind; SRH of that layer is forbidden.

**Severity:** GREEN

**Revisit when:** a deep storm envelope approaches `12 km` (Y6).

---

### G6 — No global `stormTopHeight` / `domain.topHeight`

**Originally:** `01-scenario-config.md`, reaffirmed by `09`.

**Assumption:** heights belong to knots, per-field envelopes, or the
renderer.

**Current status:** still correct. Four-way split (world / profile /
envelopes / view) is the right architecture for the next scaling
SoT.

**Severity:** GREEN

**Action:** the scaling SoT must not introduce a global supercell
height that drives every mechanism.

**Revisit when:** someone proposes `scenario.topHeight` as a
convenience.

---

### G7 — No shared `storm.center` in the DTO

**Originally:** rotation/inflow/outflow DEMO docs; `01` out of scope.

**Assumption:** each field owns `centerX` / `centerZ`. DEMO coincidence
`(0, 0)` is not an API.

**Current status:** still the right DTO shape. Tests that check DEMO
values must not be read as a coupling invariant (Y2, Y18).

**Severity:** GREEN (architecture). The DEMO coincidence is Y2.

**Revisit when:** a moving or tilted storm axis is in scope.

---

### G8 — `C` is independent and diagnostic in 3D

**Originally:** `07-storm-relative-wind.md`; tracer scene `01` out of
scope: “storm-relative subtraction inside the 3D velocity field”.

**Assumption:** `EnvironmentalWindField` is ground-relative.
`stormMotion` feeds hodograph overlays and SRH, not advection.

**Current status:** still an explicit laboratory wind-tunnel: storm
mechanisms are fixed in world space; environment blows through them.
This is **not** a bug. It is also **not** a translating supercell.

**Consequence:** even the “axis” seed has horizontal env wind. After
`09`, upper env is faster, but current `Vy = 0` above `2 km` keeps
intended tracers in the old column.

**Severity:** GREEN for the current 0–2 km laboratory. Pedagogical
risk after deep envelopes is Y15.

**Action:** do not subtract `C` in 3D in this checkpoint. Do not
introduce Bunkers.

**Revisit when:** writing the envelope-scaling SoT (must reaffirm
wind-tunnel) or when a translating-storm slice begins.

---

### G9 — Overlay `[0, 1000]` identity remains valid

**Originally:** hodograph “nasty” fixture; `09` preserved lower knots.

**Current status:** `C = (10, 0)`, shear, `ω_h`, `V_sr`, `ω_s` /
`ω_c` on `[0, 1000]` still match the hand expectations.
`demoHodographFixture.ts` still uses that layer only.

**Severity:** GREEN

**Revisit when:** a teaching slice wants a `0–6 km` overlay. That is
a new overlay decision, not a retune of `[0, 1000]`.

---

### G10 — Isolated height-independent primitives still exist

**Originally:** `11-updraft-field.md`, `14-radial-inflow-field.md`.

**Assumption:** height independence is a documented v1 limitation of
those types, not a live-DEMO occupant.

**Current status:** still true. Live DEMO uses enveloped updraft and
`LowerRadialInflowField`. Isolated types are not dead code; they are
the primitives.

**Severity:** GREEN

**Revisit when:** a reader mistakes `UpdraftField` for the live
updraft (docs debt, §10). Do not delete the primitives to “clean up”.

---

### G11 — `CompositeVelocityField` is generic addition

**Originally:** `12-composite-velocity-field.md`.

**Assumption:** `V_total = Σ V_i` is laboratory composition, not
mass-consistent storm dynamics.

**Current status:** still the right compositor for prescribed
operands. Exhaustion of this idea is Y12, not a current defect.

**Severity:** GREEN

**Revisit when:** an operand’s velocity must depend on another
operand’s velocity or on a diagnostic (tilting, pressure, continuity
solver).

---

### G12 — ScenarioConfig is a DTO, not a second physics model

**Originally:** `01-scenario-config.md`.

**Current status:** still physics-import-free; factories map numbers;
app composition builds the composite. No dead live-DEMO DTO block
(`storm.radialInflow` was removed in `08`). `baseHeight` means
different things per field; that is documented, not duplication of
one semantic (Y16 names).

**Severity:** GREEN

**Revisit when:** a god-object runtime or preset framework is
proposed.

---

### G13 — Lower `0–2 km` env winds preserved

**Originally:** `09`.

**Current status:** knots `0 / 1000 / 2000` and `(u, v)` unchanged.
Intended DEMO trajectories inside `0–2 km` see the same environment
as before `09`.

**Severity:** GREEN

**Revisit when:** a future retune of the lower hodograph is an
explicit experiment, not a side effect of scaling.

---

### G14 — Current storm envelopes are temporary `08` fixtures

**Originally:** `08`; freeze reaffirmed by `09`.

**Assumption:** updraft `[0, 2000]`, inflow plateau `≤ 500` / zero at
`1500`, outflow `[1000, 2000]` occupy the lower part of a taller
profile.

**Current status:** still the intended intermediate state. Not a
claim that a supercell ends at `2 km`.

**Severity:** GREEN as a freeze. Relations among **future** bounds
are Y16.

**Revisit when:** the storm-envelope scaling SoT (the next slice).

---

### G15 — Seeds stay lower-level diagnostic probes

**Originally:** `08` / `09`.

```text
(0, 1000, 0), (600, 1000, 0), (0, 1000, −600)
```

**Current status:** still the right probes for the current storm
column. They cannot represent a future deep story (Y10).

**Severity:** GREEN for now.

**Revisit when:** envelope scaling or a dedicated story-tracer slice.

---

### G16 — Eulerian-steady fields; trajectory time from position

**Originally:** `12` §8; every current storm field ignores `time`.

**Current status:** still correct. Horizontal velocity along a rising
path changes because env is re-sampled at new `y`, not because the
storm is unsteady.

**Severity:** GREEN

**Revisit when:** fields must move with `C`, pulse, or read
simulation clock.

---

### G17 — Unbounded finite `y`; no world-domain particle clamp

**Originally:** `00` (negative `y` allowed); `02` §35; `09` world
policy.

**Current status:** still correct mathematically. There is no ground
plane (Y20).

**Severity:** GREEN for sampling policy.

**Revisit when:** terrain, a hard ground, or a sponge layer is in
scope.

---

### G18 — `RotationField` is not tilted environmental vorticity

**Originally:** `13` §15; `06` vs `13`.

**Assumption:** prescribed vertical vorticity about a world axis is
independent of `HorizontalVorticity` from environmental shear.

**Current status:** still the correct scientific boundary. Live
composition is still `V_env + V_updraft + V_rotation + …`, not
mesocyclone dynamics.

**Severity:** GREEN

**Action:** do not explain DEMO rotation as streamwise tilting.

**Revisit when:** a tilting/stretching milestone exists (Y12). Until
then, keep the types and the story separate.

---

### Y1 — Rotation is height-independent

**Originally:** `13-rotation-field.md` v1, patterned on
height-independent `UpdraftField`.

**Original reason:** vertical storm structure did not exist yet;
`v_theta(r)` is the smallest circulation primitive.

**Current status:** still a valid **primitive**. Live DEMO still uses
it. After `09`, overshoot above `2000 m` keeps full `Ω` while
updraft/inflow/outflow are zero and env is the `2–6 km` shear, not
the old clamp (`09` overshoot caveat).

**Consequence:** pedagogically, rotation is a full-height tube.
Inside the current `0–2 km` storm that is mostly invisible. After
envelope scaling, the same primitive would spin the entire deep
column, the region above the updraft lid, and `y < 0`, at one
horizontal `sigma`.

**What exposes it:** stretching updraft/outflow without deciding
rotation’s vertical structure. That would mix “taller updraft” with
“troposphere-deep mesocyclone tube”.

**Severity:** YELLOW — not RED today, because intended tracers remain
in `0–2 km`.

**Recommended action:** do **not** change `RotationField` before the
scaling SoT. Do **not** require a separate rotation-envelope SoT
first. The **storm-envelope scaling SoT must decide** among:

1. keep height-independent rotation as a documented intermediate;
2. add a vertical envelope to `RotationField` in that same scaling
   generation;
3. defer a rotation envelope to a slice immediately after scaling,
   with an explicit warning in the scaling DEMO copy.

Silent inheritance of (1) while advertising a deep storm is the
failure mode.

**Revisit when:** writing the storm-envelope scaling SoT — first
rotation question, not an afterthought.

---

### Y2 — Coincident DEMO centers look like a storm axis

**Originally:** each DEMO fixture chose `(centerX, centerZ) = (0, 0)`.

**Original reason:** simplest laboratory alignment; APIs stay
independent (`08` “not API coupling”).

**Current status:** architecture is still G7. The **numbers** coincide
in `DEMO_SCENARIO` and in freeze tests.

**Consequence:** readers and tests can treat “one axis” as physics.
`08` already forbids `v_r,storm` identities once centers/`sigma`
diverge.

**What exposes it:** envelope scaling that copies one center into
every field “for convenience”, or a hidden `storm.center`.

**Severity:** YELLOW

**Action:** scaling SoT may keep coincident DEMO centers as a
fixture. It must say so. It must not add `storm.center`.

**Revisit when:** writing envelope scaling, or when a slice wants
offset inflow / a helical corridor.

---

### Y3 — Shared DEMO `sigma`

**Originally:** Gaussian family copied across updraft, rotation,
inflow, outflow as a controlled fixture (`sigma = 1000 m`).

**Original reason:** isolate vertical envelopes and signs; same
horizontal scale makes superposition readable.

**Current status:** still four **independent** DTO `sigma`s that
happen to be equal. Live DEMO uses `4000 m` on each
(`docs/architecture/06-deep-chimney-scaling-demo-retune.md`), with
frozen peak Gaussian speeds. Equality is a scenario choice, not
`storm.sigma` and not a physics invariant.

**What exposed it:** deep vertical envelopes at `σ = 1000 m` made a
needle (`H_up / σ = 8`). `06` widened the chimney; `10` §13 is
historical for the needle.

**Severity:** YELLOW (resolved as a documented fixture, not as
coupling)

**Action:** do not add `storm.sigma`. Do not silently grow `σ` at
frozen rates (that scales peak speeds). Per-field widths remain
API-legal for a later labeled experiment.

**Revisit when:** independent widths are wanted as a DEMO, or a
characteristic storm scale is proposed (coupling — needs a contract).

---

### Y4 — Compact envelopes are `C^0` (not `C^1`) at half-sine lids

**Originally:** `15` candidate A; `16` same window; `17` `C^0` at
`topHeight`.

**Original reason:** textbook first vertical mode; exact zeros;
elementary tests. `C^1` Hann bump was rejected for v1.

**Current status:** still correct for a small laboratory. Velocity
does not jump. `∂V/∂y` does.

**Consequence:** after deep scaling, a tracer that rides a `10 km`
half-sine will feel an abrupt end of lift/outflow while rotation
(Y1) may continue. That is a documented derivative jump, but it
will dominate the visual “storm top” if rotation is unwindowed.

**Severity:** YELLOW

**Action:** do not switch to Hann/`C^1` in this checkpoint. Scaling
SoT may keep half-sine. If the lid becomes the main teaching
artifact, that is a later envelope-regularity slice.

**Revisit when:** envelope scaling chooses a new `H`, or when lid
artifacts show up in deep trajectories.

---

### Y5 — Lower inflow plateau extends to `y → −∞`

**Originally:** `17` — `G = 1` for all `y ≤ baseHeight`, to avoid a
velocity jump at the taper start.

**Original reason:** composite tracers rising through `y_b` must not
see a jump in `V_h`.

**Current status:** still the right envelope family for v1. Combined
with no ground plane (Y20), “lower” inflow exists underground:
below `y = 0` one currently gets full plateau inflow + rotation +
clamped surface env, and `Vy = 0`.

**What exposes it:** raising `baseHeight` during scaling (inflow
would then be full-strength from `−∞` up to a mid-level taper
start), or adding downdraft/ground.

**Severity:** YELLOW

**Action:** scaling SoT must reaffirm plateau-to-minus-infinity or
consciously change the envelope family. Do not assume inflow is
“the `0–500 m` layer” just because DEMO `baseHeight = 500`.

**Revisit when:** envelope scaling, ground plane, or downdraft.

---

### Y6 — Profile clamp at `0` and `12000 m`

**Originally:** `04` clamp; `09` moved `h_max` from `2000` to `12000`.

**Original reason:** explicit support, no silent extrapolation.

**Current status:** correct boundary policy. Harmless for the current
`0–2 km` storm. Diagnostics still refuse clamp-as-atmosphere (G5).

**Consequence:** if a later updraft lid sits on `12000 m`, the
clamp-on-lid problem returns (`09` rejected `10 km` profile top for
this reason). Below `0`, clamp to the surface knot is a fake
constant wind, not a boundary layer.

**Severity:** YELLOW

**Action:** none now. Do not linearly extrapolate.

**Revisit when:** planned storm envelopes approach `~12 km`, or a
mechanism lives below `y = 0`.

---

### Y7 — Piecewise-linear env corners; `2000 m` stack

**Originally:** `04` interpolation; DEMO knots at `0, 1000, 2000`
then `09` added `6000, 12000`.

**Original reason:** simplest profile; corners are the model.

**Current status:** `dV/dh` jumps at every knot. Live storm lids
currently **share** `y = 2000 m` with an env knot (and outflow top).
After `09` that height is no longer the clamp lid, but it is still
a shear corner.

**Consequence:** a particle crossing `2000 m` today meets updraft
lid + outflow lid + env corner + continuing rotation. That was
tolerable in a 2 km lab. It should not be copied upward as “the
storm top is an env knot”.

**Severity:** YELLOW

**Action:** scaling SoT should place storm lids relative to env
knots **on purpose** (on a knot, between knots, or independent).

**Revisit when:** choosing new envelope bounds.

---

### Y8 — `C = (10, 0)` versus the deep hodograph

**Originally:** nasty `[0, 1000]` overlay; `09` kept `C`.

**Original reason:** independent input; overlay geometry is a locked
teaching identity.

**Current status:** still useful for `[0, 1000]`. Full-column SRH is
`+925` while the overlay teaches `−100`. Autoscale shrinks the
lower curve (Y17). `C` is not a deep-layer mean wind and not
Bunkers.

**Consequence:** a reader of the five-point hodograph can think `C`
is “the storm motion of this deep profile”. It is the old fixture.

**Severity:** YELLOW — not a reason to retune before envelope
scaling.

**Action:** do not retune `C` now. Do not add Bunkers. Scaling SoT
may keep `C` and must say the overlay layer is still `[0, 1000]`
unless a new overlay decision is made.

**Revisit when:** a teaching slice wants `C` nearer deep-layer wind,
or storm-relative 3D advection (Y15).

---

### Y9 — Deep hodograph, shallow 3D storm

**Originally:** `09` allowed env math to grow before storm envelopes
and before the default camera.

**Original reason:** isolate the source of trajectory change.

**Current status:** live UI shows a `12 km` hodograph beside a
`2 km` tracer tower. Documented intermediate, still easy to
misread as “the storm is 12 km tall”.

**Severity:** YELLOW

**Action:** no production change. App copy already does not claim a
supercell. Scaling SoT plus a possible later rendering slice close
the gap.

**Revisit when:** envelope scaling (3D column) and/or a rendering
slice (default framing).

---

### Y10 — Three seeds at `y = 1000 m`

**Originally:** axis / east / north probes of the lower fixture.

**Current status:** still the right probes **now**. After envelope
scaling they remain near the current updraft mid / outflow base.
They will not show a deep life cycle.

**Severity:** YELLOW

**Action:** do not move them now. Scaling SoT must distinguish
diagnostic probes of the old layer from future story/flow seeds.
Adding seeds is a separate decision from stretching envelopes.

**Revisit when:** envelope scaling or a story-tracer slice.

---

### Y11 — DEMO Euler, `dt = 0.1 s`

**Originally:** `03-numerical-integration-basics.md`; DEMO
composition chooses Euler. No project `DEFAULT_DT`.

**Original reason:** exact for constant velocity; teaching baseline;
RK2 exists for isolated rotation comparisons.

**Current status:** `Ω dt = 0.002`, `W0 dt = 2 m`. Coordinate
magnitude `12 km` is irrelevant in float64. What scales is
**integrated time × local curvature/shear**, not `y` itself.
Current intended paths are short. A future deep updraft with
`W0 = 20 m/s` over `~10 km` is `~500 s` → `~5000` Euler steps of
rotation spiral plus env shear.

Overshoot of the `2000 m` lid already samples the new `2–6 km` env
(Y1). That is a field-change, not an integrator bug.

**Severity:** YELLOW — no current reason to switch DEMO to RK2.

**Action:** do not change integrator or `dt` now. Scaling SoT should
ask whether residence time makes Euler’s rotation spiral a teaching
artifact. If yes, that is an integrator slice, not an envelope
formula change.

**Revisit when:** storm vertical scale and/or `Ω` make radius drift
visible in the DEMO, or when a measured comparison against RK2
shows DEMO-scale error.

---

### Y12 — Additive composition will not host true interactions

**Originally:** `02` §32; `12`.

**Assumption:** independent operands, sampled at the same
`(position, time)`, summed.

**Current status:** still the right laboratory for prescribed env,
updraft, rotation, inflow, outflow, and a future prescribed
downdraft.

It **stops being honest** when velocity of mechanism A must depend
on velocity or vorticity of mechanism B:

- tilting / stretching (vorticity equation, not a new independent
  `RotationField`);
- pressure / buoyancy coupling;
- a continuity solver that adjusts one field from another;
- a storm that translates because of its own dynamics.

A prescribed extra operand (downdraft, another Gaussian) still fits.

**Severity:** YELLOW

**Action:** none now. Record the exhaustion trigger.

**Revisit when:** the first slice whose physics is an **interaction**,
not a new independent `VelocityField`. That is the architectural
fork: stay prescribed, or introduce a coupled diagnostic/tendency
step. Do not pretend the compositor became a solver.

---

### Y13 — Continuity residual is prescribed, not closed

See §6.

**Severity:** YELLOW for envelope scaling (allowed to stay
prescribed). Becomes RED only under the triggers in §6.

**Action:** scaling SoT must repeat the anti-oracle: no
mass-consistent cell.

**Revisit when:** downdraft-as-return-flow, continuity solver, or
teaching copy that air is conserved.

---

### Y14 — Default view still frames a `0–2 km` tower

**Originally:** `TracerScene` camera `(4500, 3500, 4500)`, lookAt
`(500, 1000, −500)`, grid `8000 m`, far `50000 m`, tracer spheres
`50 m`, axes `1000 m`.

**Original reason:** readable tracers in the first 3D lab.

**Current status:** far plane already allows orbiting `12 km`.
Default framing, grid, and sphere size do not. `09` forbade growing
the grid only because the profile grew.

**Severity:** YELLOW

**Action:** no rendering implementation now. A rendering slice is
needed when the **default** teaching view must show a deep column —
after envelopes scale, not before.

**Revisit when:** storm-envelope scaling is implemented and the
default camera still hides it.

---

### Y15 — Wind-tunnel frame will look louder in a deep column

**Originally:** G8.

**Current status:** ground-relative env + fixed storm mechanisms.
After envelope scaling, a parcel that rises through `6–12 km` sees
`~30–40 m/s` env while the Gaussian core stays at world `(0, 0)`.
That is the same architecture as today; it will look like the
column is sheared apart, because it is.

**Severity:** YELLOW — not RED, and not a reason to subtract `C`
before scaling.

**Action:** scaling SoT must **reaffirm** the wind-tunnel (storm
fixed, env ground-relative) or open a separate storm-relative 3D
advection decision. Those are different experiments.

**Revisit when:** envelope scaling (copy/warning) or a later
storm-relative advection slice.

---

### Y16 — DEMO numeric coincidences look like physics invariants

Current alignments (fixture, not API):

```text
seed y = 1000 = updraft y_mid = outflow baseHeight = env knot
updraft topHeight = outflow topHeight = env knot 2000
all centers = (0, 0)
all sigma = 4000 m     // 06; still a fixture, not storm.sigma
inflow/outflow overlap 1000 < y < 1500
```

`baseHeight` / `topHeight` also mean different envelope jobs
(updraft lids, inflow plateau/taper, outflow lids).

**Severity:** YELLOW

**Action:** scaling SoT must **decide** future relations:

- may updraft mid stay at a seed height?
- may outflow start at updraft mid?
- may lids share an env knot?
- which overlaps are allowed?

It must **not** couple those bounds by a shared type or by
continuity (G6, Y13).

**Revisit when:** choosing new envelope numbers.

---

### Y17 — Hodograph autoscale shrinks the `0–2 km` curve

**Originally:** `hodographViewTransform` fits origin + all knots +
overlay.

**Current status:** five knots to `~41 m/s` shrink the nasty lower
segment on screen. `09` documented this and forbade retuning lower
winds to restore pixels.

**Severity:** YELLOW (UI pedagogy)

**Action:** none in physics. Optional later hodograph-viewport
teaching mode.

**Revisit when:** overlay or viewport teaching becomes a slice.

---

### Y18 — Tests freeze DEMO numbers

**Originally:** integration tests assert `topHeight = 2000`, seeds,
`sigma = 1000`, etc., as DEMO contract.

**Current status:** still correct as a **DEMO freeze**, now against
`06` numbers (`σ = 4000`, `W0 = 30`, seeds at `r = 0.6σ`). They are
not physics invariants of `VerticalEnvelopeUpdraftField`.

**Severity:** YELLOW

**Action:** scaling implementation must update DEMO-contract tests.
Do not treat a failing `toBe(2000)` as a physics regression of the
envelope type.

**Revisit when:** envelope scaling implementation.

---

### Y19 — Future Bunkers / estimated storm motion

**Originally:** `07` / `09` explicit non-goal.

**Current status:** `C` remains an input. Deep shear exists on the
hodograph, which makes “why not Bunkers?” a tempting misread.

**Severity:** YELLOW (temptation, not a missing feature)

**Action:** do not implement. Docs should keep saying `C` is
prescribed.

**Revisit when:** an explicit storm-motion-estimator slice exists —
after the laboratory storm column and frame (Y15) are chosen.

---

### Y20 — No ground plane

**Originally:** `00`: `y = 0` is reference ground; negative `y` is
allowed.

**Current status:** still the math policy (G17). Combined with Y5
and Y1, underground inflow+rotation is real if a particle goes
there. Current DEMO has no downdraft, so this is rarely seen.

**Severity:** YELLOW

**Action:** none now.

**Revisit when:** downdraft, terrain, or a visual ground.

---

## 8. Blocking RED items

None.

No production path currently:

- silently treats clamp as diagnostic atmosphere;
- jumps velocity at a live envelope lid;
- couples field centers in the DTO;
- subtracts `C` in 3D without saying so;
- presents rotation as tilted environmental vorticity in code.

Stale **document** sentences that still say environment clamps at
`2000 m` are §10. They are not runtime RED.

---

## 9. YELLOW roadmap (revisit when, not “later”)

| ID | Revisit when |
| --- | --- |
| Y1 | Writing storm-envelope scaling SoT — rotation vertical structure is a required decision |
| Y2 | Same SoT — coincident centers remain a fixture statement |
| Y3 | Same SoT — horizontal `sigma` vs chimney aspect |
| Y4 | Same SoT if lid artifacts dominate; else a later regularity slice |
| Y5 | Same SoT — reaffirm plateau to `−∞`, or change envelope family |
| Y6 | Planned envelopes approach `12 km`, or flow below `y = 0` |
| Y7 | Choosing new envelope bounds vs env knots |
| Y8 | Teaching wants a new `C` or a new overlay layer; not before scaling by default |
| Y9 | Envelope scaling (3D) and/or rendering slice (camera) |
| Y10 | Envelope scaling or story-tracer slice — do not auto-move current seeds |
| Y11 | Residence time × rotation/shear makes Euler spiral a DEMO artifact |
| Y12 | First **interaction** mechanism (tilting, pressure, continuity solver) |
| Y13 | Downdraft-as-return, continuity solver, or mass-conserving copy |
| Y14 | After envelopes scale, if default view still hides the column |
| Y15 | Envelope scaling copy must reaffirm wind-tunnel; later slice if 3D becomes storm-relative |
| Y16 | Choosing new DEMO bounds — decide relations, do not invent coupling types |
| Y17 | Hodograph teaching-viewport slice |
| Y18 | Envelope scaling **implementation** (update DEMO-contract tests) |
| Y19 | Explicit storm-motion-estimator slice, after frame choice |
| Y20 | Downdraft, terrain, or visual ground |

---

## 10. Docs debt (do not mass-edit in this audit)

These are documentation consistency issues. They were **not**
silently patched here.

### Dangerous current-tense leftovers

1. `docs/rendering/08-composite-lower-radial-inflow-demo.md` §12
   still says that at `y ≥ 2000 m` environment is **clamped to the
   `2000 m` knot**. After `09` that is false: env interpolates
   `2000–6000–12000`, and rotation still acts. This is the most
   misleading live-DEMO sentence in the tree.

2. `docs/rendering/06-composite-vertical-envelope-updraft-demo.md`
   and `07-composite-upper-radial-outflow-demo.md` contain the same
   clamp sentence in current-ish dynamics sections. Those docs are
   historically superseded; they still read as if they described
   live env behavior.

### Stale “current composition” phrasing in physics primitives

3. `docs/physics/15-vertical-updraft-envelope.md` purpose still says
   it is not a change to the “current DEMO four-field composition”.
   Live DEMO is five operands plus a 12 km profile.

### Pointers that omit `09`

4. `docs/rendering/01-tracer-scene.md` correctly lists `08` as
   current **operand** wiring, but does not point at `09` for env
   knots. Operands are right; environmental support is incomplete.

5. `docs/architecture/01-scenario-config.md` §17 relationship list
   still points at `08` as current DEMO wiring and does not list
   `09` (the documentation index in §3 does).

### Historical examples that can be read as live

6. `docs/physics/12-composite-velocity-field.md` §8 worked example
   still uses height-independent `UpdraftField` as the “important
   laboratory case”. Historically valid; easy to skim as current
   updraft.

7. Isolated `UpdraftField` / `RadialInflowField` docs remain
   canonical for those types. That is G10, but skim-reading can
   revive them as live DEMO.

### Not docs debt

- `03`–`07` relationship tables that mark themselves superseded.
- `09` research sections that describe rejected `10 km` / `15 km`
  alternatives.
- Overlay still documenting `[0, 1000]` (G9).

Recommended docs hygiene (a later slice, not this audit): patch `08`
§12 env sentence first; add `09` pointers on `01-tracer-scene` and
`01-scenario-config` §17; add a one-line historical note on `15`
purpose.

---

## 11. Explicitly validated GREEN (do not re-open casually)

Checked against current SoT **and** implementation:

- observe-only renderer;
- world vs atmospheric conversion;
- SI meters/seconds in physics;
- `EnvironmentalWindProfile` formula, clamp, `vertical ≡ 0`;
- shear/SRH reject layers above `12000 m`; field sampling still
  clamps;
- no `scenario.topHeight` / `storm.center`;
- `C` not subtracted in 3D advection;
- `[0, 1000]` overlay identity after five knots;
- isolated `UpdraftField` / `RadialInflowField` are primitives, not
  live DEMO occupants;
- composite is unweighted world-space sum;
- ScenarioConfig remains a physics-import-free DTO;
- lower `0–2 km` env winds unchanged;
- `08` storm envelopes and seeds unchanged;
- fields ignore simulation `time`;
- no world-domain particle clamp;
- `RotationField` is not `HorizontalVorticity` and is not tilting;
- live composition is still the five operands above;
- Euler/`dt` need not change merely because `h_max = 12000`;
- no thermodynamics / cloud / Coriolis / CAPE required for the next
  stage.

---

## 12. Recommended next step

**Go to a storm-envelope scaling SoT.**

Do **not** first write a corrective rotation-envelope SoT, a `C`
retune SoT, an RK2 DEMO SoT, or a continuity solver.

The scaling SoT must explicitly decide (not inherit):

1. new vertical bounds for updraft, lower inflow, upper outflow;
2. rotation vertical structure (Y1);
3. whether DEMO centers/`sigma` stay coincident (Y2, Y3);
4. wind-tunnel vs storm-relative 3D (Y15) — default: reaffirm
   wind-tunnel;
5. relations among lids, env knots, and seeds (Y7, Y10, Y16);
6. lower-inflow plateau-to-`−∞` (Y5);
7. that continuity stays prescribed (Y13);
8. that camera/grid may remain until a rendering slice (Y14);
9. that DEMO-contract tests will move with the fixture (Y18).

It must **not**:

- set every bound equal to `12000 m`;
- add `stormTopHeight` or `storm.center`;
- retune lower env winds or `C` without a separate reason;
- add downdraft, tilting, Bunkers, or a solver;
- move current seeds “because the column got taller” without a seed
  strategy.

After that SoT is accepted, implementation of envelope scaling is a
separate command.

---

## 13. Core lesson

The laboratory is consistent. The debt is **inheritance**: mechanisms
that were height-independent, coincident, or 2 km-local because that
was the smallest slice. Expanding the environment to `12 km` did not
break them. Stretching the storm without re-deciding them would make
historical DEMO choices look like physics.
