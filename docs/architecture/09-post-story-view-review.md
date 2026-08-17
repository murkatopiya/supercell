# Post-Story-View Review

**Status:** this document is the post-story-view teaching/model
review. It records what the live story exhibit actually shows,
what it must not claim, which earlier audit items are closed,
and what the next physics/modeling slice should be.

Production code was not changed in this slice.

Current live App is `DownwardPathline` (`12`). This review's
snapshot below remains StoryPathlines.

Live at the time of this review:

```text
IntegrationFrame   = StormRelativeLaboratory
TracerPedagogy     = StoryPathlines
seeds              = storySeeds S1 / S2
trails             = enabled (stride 1, Option C recorder)
DiagnosticProbes   = still a valid explicit composition option
stack              = EnvironmentalWindField
                     + VerticalEnvelopeUpdraftField
                     + VerticalEnvelopeRotationField
                     + LowerRadialInflowField
                     + UpperRadialOutflowField
canonical fixture  = σ = 4000 m, W0 = 30 m/s, Ω = 0.005 s⁻¹,
                     A_in = 0.00125 s⁻¹, A_out = 0.0025 s⁻¹
integrator         = Euler, dt = 0.1 s
```

Related documents:

- `docs/architecture/02-current-model-assumptions-audit.md`
- `docs/architecture/03-wind-tunnel-storm-relative-3d-semantics.md`
- `docs/architecture/04-story-tracers-seed-strategy.md`
- `docs/architecture/05-chimney-residence-scale-and-strength.md`
- `docs/architecture/06-deep-chimney-scaling-demo-retune.md`
- `docs/architecture/07-story-reachability-audit-v2.md`
- `docs/architecture/08-story-seeds.md`
- `docs/rendering/14-tracer-path-history.md`

---

## 1. Current teaching contract

The live 3D view is a **prescribed storm-relative story-pathline
exhibit**.

It is allowed to show:

- two particles whose seeds are the `08` S1 / S2 fixture
  (`r/σ = 1.0` and `1.5` due south at `y = 1000 m`);
- their **storm-relative** trajectories in the live
  `StormRelativeLaboratory` frame;
- that those trajectories start in the lower layer, enter the
  deep updraft region, and later enter the upper outflow
  envelope (`04` §2 threshold; `07` letter-pass; `08` §6 claim);
- persistent trails sampled from simulation history, so the
  path is readable after the glyphs have moved on.

Panel copy may use the `08` §6 sentence:

> Prescribed storm-relative pathline through lower inflow,
> deep updraft, and upper outflow.

It is **not** allowed to show, imply, or be read as:

- same-air-mass circulation;
- a realistic parcel trajectory;
- mesocyclone capture or a mesocyclone;
- a continuity / mass-conservation proof;
- a full supercell circulation;
- a closed cell (up and then back down as the return of this air);
- diagnostic-probe pedagogy (axis / east / north contrast).

`04` verdict C (`σ = 1000 m`, `W0 = 20 m/s`, no full-story
seeds) is **historical**. Do not treat it as a live DEMO result.

`07` verdict A (robust lower→upper basin on the current
chimney) is the reachability basis. Live S1 / S2 are interior
members of that basin, not a new physical discovery.

---

## 2. Current physics contract

Unchanged by story view, trails, or pedagogy wiring.

The live velocity is still a **prescribed five-operand
laboratory sum**:

```text
V_world = V_env_world
        + V_updraft_world
        + V_rotation_world
        + V_lower_inflow_world
        + V_upper_outflow_world
```

In `StormRelativeLaboratory`, the integrator sees
`V_env − C` plus the four storm operands. Storm centers and
`C` remain prescribed DEMO constants. Shared `σ` and shared
horizontal centers remain a **DEMO fixture**, not a physics
invariant (`06`, `01`).

Each operand is still independent. There is still no:

- continuity equation tying `A_in`, `A_out`, `W0`, `H`, `G`, `F`;
- downdraft operand;
- ground plane / underground cutoff;
- tilting or stretching;
- translating storm (D3);
- Bunkers-derived `C`;
- diagnostic `divergence()` API.

Story pathlines are **integrals of this sum** from two chosen
ICs. They are not a new field and not a validation of the
atmosphere.

---

## 3. What the live story pathlines actually are

Confirmed against `04` §2, `07`, `08`, and current wiring:

| Requirement | Status |
| --- | --- |
| Start lower-level (`y0 = 1000 m`, inside lower-inflow envelope) | Yes. S1 / S2. |
| Pass through the deep updraft region | Yes. `07` letter-pass: `max y ≈ 7000–7044 m`, `y ≥ 3000 m` for `O(100 s)`. |
| Reach upper outflow | Yes. Outflow-envelope entry at `t ≈ 200–251 s`. |
| Storm-relative pathlines of the current prescribed composite | Yes. `StormRelativeLaboratory` + live five-operand stack. |
| Trails of those pathlines | Yes. `TracerPathHistory` after each `Simulation.step`. |

Still **not**:

| Forbidden reading | Why |
| --- | --- |
| Same-air-mass circulation | Continuity residual is prescribed and uncancelled (`02` §6). The two pathlines are two ICs, not a closed mass circuit. |
| Realistic parcel trajectory | No thermodynamics, no pressure, Euler `dt = 0.1 s`, laboratory-scale speeds. |
| Mesocyclone capture | Rotation is a prescribed Gaussian-modulated envelope (`18` / `12`), not tilting/stretching of environmental vorticity. |
| Continuity proof | Pathline reachability ≠ `∇ · V = 0`. |
| Full supercell circulation | No downdraft, no rear-flank, no gust front, no translating storm. |

S1 / S2 are not “the storm.” They are two interior south-side
members of the `07` basin. Diagnostic north’s failure remains
an honest laboratory fact, not a bug, and is **not** on screen
in the live story default.

---

## 4. DiagnosticProbes after story became the live default

`DiagnosticProbes` is still a valid explicit mode.

```text
DiagnosticProbes → diagnosticSeeds, trails off, no recorder
StoryPathlines   → storySeeds, trails on, recorder stride 1
```

The diagnostic trio still has a distinct job that story seeds
do not replace:

| Seed | Job |
| --- | --- |
| Axis `(0, 1000, 0)` | `r = 0`: inflow and rotation identically zero; `V_sr` + updraft. `07` letter-pass does **not** make it a story seed. |
| East `(2400, 1000, 0)` | Cyclonic-flank graze (`r ≈ 2σ` at outflow, occupancy `≈ 2.9 s`). Keep diagnostic. |
| North `(0, 1000, −2400)` | Downstream failure. Control, not a bug. |

Default `composeDemoTracerSimulation(frame)` remains
`DiagnosticProbes`. Live `App.tsx` now selects `DownwardPathline`
(`12`). StoryPathlines remains an explicit composition option.
Tests that pass an explicit pedagogy, or omit it, still see
the diagnostic contract.

Diagnostic mode did **not** lose meaning. It lost **live
visibility**. That is a UI/pedagogy question, not a physics
regression.

---

## 5. Trail architecture check

Option C from `14` still holds.

| Check | Result |
| --- | --- |
| History owner leaked into physics? | No. `TracerPathHistory` lives under `src/simulation/`. Fields, integrators, and `AtmosphericVelocity` do not import it. |
| Renderer observe-only? | Yes. `TracerScene` does not record. `syncFromPathHistory` copies snapshots into `THREE.Line` geometry. |
| Pause / timeScale / Reset unambiguous? | Yes. Recording is after each `simulation.step`. Pause ⇒ 0 steps ⇒ no append. `timeScale` only changes how many steps per frame. Story Reset restores S1 / S2, `t = 0`, `clear` + `captureInitial`. Camera is not reset. |
| Sampling by simulation step, not FPS? | Yes. Stride 1 on completed steps. Wall-clock / rAF does not append. |
| Story trails applied to diagnostic probes? | No. Diagnostic composition creates no recorder and does not pass `{ trails: true }`. |

`Simulation` / `TracerParticle` were not given history. That
boundary should stay.

---

## 6. UI toggle: DiagnosticProbes ↔ StoryPathlines

**Decision: not now.**

A two-mode toggle is the UI `08` already deferred. It is not
required to keep DiagnosticProbes valid. The same pattern as
`IntegrationFrame` is enough: a named code-level constant
(`LIVE_DEMO_TRACER_PEDAGOGY`).

Do not add the toggle in this review (and it should not be the
next slice).

Add it later only when in-session comparison is the teaching
goal. Constraints if/when it lands:

- two named modes, not a boolean, not `Both`;
- no group language / second palette until a Both-mode SoT
  exists (`08` §5);
- diagnostic remains trails-off;
- copy must not collapse the two jobs into “more particles.”

Until then, diagnostic pedagogy is recovered by changing the
live constant (or calling `composeDemoTracerSimulation` with
`DiagnosticProbes`).

---

## 7. Audit delta

Compared with `02`–`08` and `14`. `02`’s live-stack paragraphs
are stale in places (they still describe height-independent
`RotationField` and a 0–2 km storm as current). This section
is the current register; `02` should be bannered later, not
silently rewritten as if it had always known the later slices.

### CLOSED

| Former limitation | Why closed |
| --- | --- |
| Height-independent rotation as the **live occupant** | `12` / `18`: `VerticalEnvelopeRotationField`, DEMO bounds `[0, 6500] m`. Isolated `RotationField` remains a primitive, not the DEMO slot. |
| Too-thin chimney as a **live DEMO fact** | `06`: `σ = 4000 m`, `W0 = 30 m/s`, mixed-regime retune. `05` remains the scale diagnosis, not the live fixture. |
| Story reachability (no lower→upper path on the live chimney) | `07` verdict A. `04` C is historical. |
| Story seeds missing from config / live | `08` installed S1 / S2; live pedagogy selects them. |
| Trails prerequisite | `14` recorder + `TracerScene` observe-only trails; live story enables them. |
| Wind-tunnel as the **only** live 3D frame | Live is `StormRelativeLaboratory` (`03` D2). Wind-tunnel remains an explicit composition option. |
| Story-vs-diagnostic as an **architectural** ambiguity | Two arrays, role = which array, `TracerPedagogy` enum, no Both. |

### PARTIALLY CLOSED

| Item | What is done | What remains |
| --- | --- | --- |
| Wind-tunnel-only **semantics** | Live 3D is storm-relative laboratory. Hodograph remains ground-relative (`03`). | D3 translating storm is not live. `03` status banner still says story tracers are not authorized — **docs debt**. |
| Story-vs-diagnostic **as live UX** | Architecture split is real; live default is story; diagnostic is explicit. | The browser no longer shows the diagnostic trio. North-as-control is off-screen unless the code constant is flipped. |
| Chimney as a teaching column | Mixed-regime, deep envelopes, localized rotation. | Still a teaching chimney, not a storm. Peak speeds remain laboratory-scale (`07` §11). |
| `02` laboratory description | Later slices superseded several YELLOW live facts. | `02` body still reads as if rotation were height-independent and the storm 0–2 km. |

### STILL OPEN

| Item | Status |
| --- | --- |
| Continuity debt | YELLOW, now **pedagogically louder**. Story pathlines look like a circulation fragment. The residual in `02` §6 is unchanged. Becomes RED if copy or a future downdraft is sold as the return of this air. |
| No downdraft | No operand. Do not add it as “the other half of the story pathline.” |
| Ground / underground ambiguity | No ground plane. Lower inflow still plateaus for `y → −∞` (`17`). Story seeds go up, so the live exhibit does not currently *show* underground inflow — the policy is still missing. |
| Fixed centers / shared `σ` as DEMO fixture | Documented (`06`, `01`). Not a physics invariant. Not blocking. |
| No tilting / stretching | Rotation remains prescribed. Story must not say “captured into a mesocyclone.” |
| No moving / translating storm | D3 from `03` not live. Current pathlines are laboratory-relative, not ground-relative storm motion. |
| No Bunkers | `C` prescribed. |
| Euler DEMO / no production `DEFAULT_DT` | Unchanged. Acceptable while claims stay laboratory. |
| Both-groups UI / group palette | Still forbidden. |
| Diagnostic `divergence()` API | Still forbidden (`02` §6). |

---

## 8. Ranked next slices

Physics/modeling first. “Now it should look nicer” is not a
reason.

1. **Composite continuity / mass-budget SoT** (modeling, no
   solver, no new operand). Quantify and publish `∇ · V` of
   the *live* five-operand sum on the story path and in the
   chimney; lock what a future downdraft is allowed to claim.
   The story view made this the next honesty requirement.
2. **Ground / underground domain policy.** Still YELLOW (`02`
   Y20). Story parcels do not currently go underground, but
   any downdraft or near-surface inflow claim will hit this
   first. Smaller than a solver; larger than a rendering
   plane.
3. **Prescribed downdraft** — only after (1), and preferably
   after (2). Adding it now would complete a *visual* cell
   and make the continuity overclaim almost automatic.
4. **UI toggle DiagnosticProbes ↔ StoryPathlines** — not
   physics; useful for in-session contrast; not now.
5. **Translating storm (D3)** or **tilting/stretching** —
   different stories. Do not start while the current exhibit
   still needs an honest mass-budget sentence.

Not in this ranking as next: visual polish, follow-camera,
Bunkers, diagnostics expansion, Both-mode, retune of `σ` /
`W0` / `Ω`.

---

## 9. Recommended next physics/modeling slice

**Composite continuity / mass-budget audit (SoT only).**

Why now, and not because it would look better:

The live teaching object is no longer three local probes. It
is two pathlines that visibly do the `04` sequence: lower
inflow → deep updraft → upper outflow. That is exactly the
shape of a circulation *fragment*. Viewers will infer return
flow and same-air-mass continuity. The code still has neither.

`02` already says continuity becomes RED when a future slice
claims a closed cell or adds a downdraft sold as the return.
The story view did not make that claim in copy (`08` §6), but
it made the *misreading* cheap. The next modeling work is to
measure and document the live residual so the next mechanism
cannot be sold as closing it.

This slice should:

- read `15` §11, `16` §18, `17` §19, `02` §6 as source of truth;
- evaluate the **sum**, not re-derive each operand in isolation
  only;
- sample along S1 / S2 and on the axis / core radii;
- state what the system can and cannot claim after story view;
- set the policy for a future downdraft (independent prescribed
  operand vs forbidden “return branch”);
- not add a solver, a `divergence()` production API, a
  downdraft field, or UI.

Why not prescribed downdraft as next: it is the mechanism
most likely to be read as the missing return. Why not ground
policy as next: the live story does not go underground; the
new pressure is the *up-and-out* reading. Why not translating
storm: the current contract is already storm-relative; D3 is
a different exhibit.

---

## 10. Docs that should be updated (not in this slice)

| Document | Why |
| --- | --- |
| `02-current-model-assumptions-audit.md` | Banner: live occupant is envelope rotation; chimney is `06`; live 3D is SR laboratory + story pathlines. Do not rewrite historical YELLOW entries as if they were never true. |
| `03-wind-tunnel-storm-relative-3d-semantics.md` | Status still says story tracers are not authorized. They are authorized as `StoryPathlines`. |
| `08-story-seeds.md` | Trails are now live for story; §8 “not added here” is historical. Point at `14` and this review. |
| `14-tracer-path-history.md` | Purpose leftover “does not implement trails” vs later sections that do. Align the header. |
| `01-scenario-config.md` | Already notes live `StormRelativeLaboratory`; should note live `StoryPathlines` vs default API `DiagnosticProbes`. |

Do **not** rewrite `04` / `05` / `07` as if they had always
included live story seeds. They are historical SoT for their
slices.

---

## 11. Blocking issues

None for continuing research.

No RED production bug in the story wiring, trail owner, or
diagnostic explicit path.

YELLOW that is now louder: continuity debt (see §7, §9).

Docs debt (stale `02` / `03` banners) is not a physics
blocker.

---

## 12. Compact lock-in

```text
teaching:     prescribed SR story pathlines (S1/S2) through
              lower inflow / deep updraft / upper outflow
physics:      same five-operand prescribed laboratory
not:          circulation, parcel, capture, continuity, supercell
diagnostic:   still valid explicit mode; not live default
trails:       Option C holds; story only; step-sampled
UI toggle:    not now
CLOSED:       thin chimney, reachability, story seeds, trails,
              live SR frame, envelope rotation occupant,
              architectural story/diagnostic split
PARTIAL:      wind-tunnel semantics (D3 open); diagnostic UX
OPEN:         continuity, downdraft, ground, shared-σ fixture,
              no tilt/stretch, no D3, no Bunkers
next:         composite continuity / mass-budget SoT
not next:     downdraft, polish, Bunkers, moving storm, UI
blockers:     none
production:   none this slice
```

---

## 13. STOP

This review does not start a new mechanism, does not add UI,
and does not change production code.

Do not add a downdraft because the pathlines “want to come
down.” Do not treat S1 / S2 as a storm. Do not silently
rewrite `04` verdict C as a live result.

Next work starts only when commanded.
