# Explore / Guided Interaction Architecture

**Status:** architecture / product SoT. This document did not
change production code when written.

**Current product status:** Explore point release (`18` Slices
1–4) and shared Inspector (`19` Slices 1–4) are live. Desktop
workbench layout is live. This is not the final Explore/Guided
product shell. The live App has a temporary Explore | Guided
entry; `TracerPedagogy` is still not product navigation. Guided
runtime selection among three `GuidedExperimentId` values is
live (`20` Slice 2). Catalog teaching copy is live (`20` Slice 3).
Successor implementation SoT:
`docs/architecture/20-guided-runtime-architecture.md`.
Current whole-product direction checkpoint:
`docs/architecture/21-whole-product-direction-checkpoint.md`.
This document remains the Explore/Guided split SoT. It is not
the latest product-direction SoT.
Physics remains paused.

This document restitches the live four-way `TracerPedagogy`
composition with the original product concept after
`docs/architecture/15-post-near-ground-outflow-checkpoint.md`.

It answers:

    In the eventual product, what is a user-facing mode, and what is
    internal composition / preset machinery?

It does **not** implement Explore, Guided, a selector, arbitrary
seeding, an inspector, or a `GuidedExperiment` type.

Live snapshot at the time this SoT was written (historical;
current default Guided experiment is
`inflow-to-upper-outflow`, see `20` / `21`):

```text
IntegrationFrame     = StormRelativeLaboratory
TracerPedagogy       = NearGroundOutflowPathline
live seed            = NG1 (3000, 100, 4750)
trails               = on
keepInactiveGlyphs   = false
AtmosphericTracerDomain = y ≥ 0
stack                = seven prescribed operands
```

Authoritative product / architecture:

- `docs/CONCEPT.md` §7–§8, §10, §13
- `docs/ARCHITECTURE.md` §2, §16, §23–§28, §36
- `docs/architecture/01-scenario-config.md`
- `docs/rendering/01-tracer-scene.md`
- `docs/rendering/02-tracer-runtime-controls.md`
- `docs/rendering/14-tracer-path-history.md`
- `docs/architecture/08-story-seeds.md`
- `docs/architecture/12-downward-ground-impact-pedagogy.md`
- `docs/architecture/14-near-ground-outflow-pedagogy.md`
- `docs/architecture/15-post-near-ground-outflow-checkpoint.md`

Historical docs are not rewritten. Where `15` §11 recommended a
four-mode pedagogy selector as the next non-modeling slice, **this
document supersedes that product recommendation**. `15` remains the
physics/continuity checkpoint.

---

## 1. Verdict

**C. Do not implement a four-mode `TracerPedagogy` selector.
The next UI must be designed around Explore / Guided, not around
the internal enum.**

The hypothesis is **confirmed**, with one naming nuance:

```text
StoryPathlines
DownwardPathline
NearGroundOutflowPathline
    → future Guided Experiments
      (mechanism-scoped, isolated, one allowed claim each)

DiagnosticProbes
    → developer / scientific diagnostic preset
      not a user-facing Guided card

TracerPedagogy
    → internal composition mechanism
      (which seed array, trails, terminal-glyph policy)
      not top-level product navigation
```

Nuance: CONCEPT §8 **Journey Mode** is the Guided *family* (a
prepared experience over the model). It is **not** a license to
concatenate S1/S2 + D1 + NG1 into one causal storm tour. A later
cinematic Journey may change camera, copy, and highlighted layers.
It must not present those pathlines as the same air.

`15` was right that three teaching contracts are dark, and that
isolation must stay inspectable. It was wrong, as a *product*
primitive, to treat the four enum values as the thing a user
selects. Inspectability belongs to a Guided catalog and to
Explore probes, not to shipping `TracerPedagogy` as navigation.

---

## 2. What the original product already required

CONCEPT §8 is the source of truth for top-level experience, not
the pedagogy enum that grew during mechanism work.

### 2.1 Explore

The user controls the investigation: camera, time, layers, tracer
release, inspection, streamlines, relationships between fields.
An atmospheric laboratory.

### 2.2 Journey / Guided

The system guides a carefully designed sequence. Interface
minimal. Camera, narration, layers, scale, and time may be
coordinated. CONCEPT’s example beats (approach inflow, enter
updraft, observe rotation, change altitude, freeze, strip the
cloud, reveal fields) are a **presentation sequence over one
model**. They are not a new velocity field and not a concatenated
parcel biography.

Journey is a first encounter that should motivate Explore. It
must not replace scientific exploration.

### 2.3 “Why?”

CONCEPT §7 and §13, ARCHITECTURE §23, §28, §36:

```text
selected parcel / probe
  → local quantities
  → inspectable field contributions
  → not hidden animation
```

The user must be able to ask why a parcel moves as it does.

### 2.4 Development-as-investigation

CONCEPT §10: mechanisms are studied, described, implemented,
visualized, tested, and explained **before** they are combined.
The four isolated pedagogies are that loop made concrete. They
are not a rejection of Explore. They are how the laboratory
became honest enough to be explored.

### 2.5 Camera “Journey” is not product navigation

ARCHITECTURE §24 lists camera modes `Free / Orbit / FollowTracer /
Journey`. That `Journey` is a **camera contract** (scripted pose).
It must not be confused with CONCEPT Journey Mode or with
`TracerPedagogy`.

---

## 3. Three product layers

Keep these distinct. Mixing them is how `TracerPedagogy` almost
became a public mode selector.

### 3.1 Model

The current physical / kinematic system. One laboratory, not an
experience.

```text
VelocityField (live: seven-operand CompositeVelocityField)
IntegrationFrame (live: StormRelativeLaboratory)
AtmosphericTracerDomain (y ≥ 0 for atmospheric tracers)
ScenarioConfig / environment / storm occupancy
integrator + fixed timestep
hodograph source: EnvironmentalWindProfile + C
```

Experience selection **must not silently change physics**.
Guided vs Explore is presentation over this model. Switching
from NG1 to S1/S2 does not add or remove operands
(`15` §2: presence ≠ exhibit). Switching Explore ↔ Guided must
obey the same rule unless an experience **explicitly** names a
different scenario or frame.

`IntegrationFrame` is a Model / advection-frame concern, not
product navigation. `GroundRelativeWindTunnel` remains an
explicit composition option (`03`). It is not an Explore toggle.

### 3.2 Explore

Free investigation of the **same** model.

Future responsibilities (not a UI spec):

```text
arbitrary tracer release
point / line / plane / volume seeding
potentially many parcels
pause / reset / time scale          // already live as session controls
camera (free / orbit; later follow)
layer visibility
selecting / following a tracer
inspecting local quantities
eventually per-operand V contributions
hodograph / environment inspection
```

Explore does **not** inherit a curated teaching claim from
whatever particle happens to be on screen.

Do not design the whole Explore UI here.

### 3.3 Guided Experiments

Curated experiences with, at least:

```text
seed(s)
trail policy
terminal-glyph policy
explanatory copy
allowed claim
anti-claims
```

Later, if needed: camera / follow policy, highlighted
fields / diagnostics, a short beat sequence that does **not**
concatenate forbidden causal pathlines.

This is pedagogical **presentation** over the Model. It is not
new physics. It is not a second compositor.

Current S1/S2, D1, and NG1 research is the first catalog of
such experiences. DiagnosticProbes is not in that catalog
(`§6.1`).

---

## 4. What is not product navigation

| Object | Layer | User-facing top-level? |
| --- | --- | --- |
| Explore / Guided | product navigation | **yes** |
| `TracerPedagogy` | app composition | no |
| `IntegrationFrame` | Model / advection frame | no |
| field / layer visibility | Explore (and Guided highlighting) | no |
| scenario selection | Model (later; one DEMO now) | no |
| Pause / timeScale / Reset | session runtime (`02`) | controls, not nav |
| hodograph overlay toggles | environment inspection | no |
| camera Free / Orbit / Follow / Journey | interaction | no |

Shipping a four-button pedagogy selector would collapse the first
four rows into one widget. That is the failure mode this SoT
exists to prevent.

---

## 5. Classify current `TracerPedagogy`

Do not force all four values to share a fate.

### 5.1 DiagnosticProbes

```text
seeds     diagnosticSeeds   axis / east / north at y = 1000 m
trails    off
glyphs    hide when inactive
default   composeDemoTracerSimulation API
live App  no
job       mechanism contrast at the seed layer (08 §4)
```

| Question | Answer |
| --- | --- |
| Internal composition policy? | **Yes.** Default API. Maps array + trails-off. |
| Future Explore preset? | Optional lab starting set, **without** a Guided claim. Not the Explore default just because it is the composition default. |
| Guided experiment? | **No.** It is not a pathline story. Trails off. Axis is not a story seed. North is an honest miss. |
| Developer / scientific diagnostic? | **Yes.** Closest living object to ARCHITECTURE §28 “inspect individual mechanisms” at seed points. |
| User-facing mode? | **No.** Do not put “Diagnostic Probes” on a public Guided shelf next to NG1. |

### 5.2 StoryPathlines

```text
seeds     storySeeds   S1, S2
trails    on
claim     08 §6  prescribed SR pathline through lower inflow,
          deep updraft, upper outflow
```

**Future Guided Experiment.** Canonical ICs from reachability
research (`07`, `08`). Not Explore’s default cloud. Not product
nav by itself.

### 5.3 DownwardPathline

```text
seeds              downwardPathlineSeeds   D1
trails             on
keepInactiveGlyphs true
claim              12 §14  descent until atmospheric-domain exit
```

**Future Guided Experiment.** Isolated from S1/S2 and from NG1.
Terminal glyph is presentation policy for this exhibit, not Model
domain policy (`12` §10).

### 5.4 NearGroundOutflowPathline

```text
seeds              nearGroundOutflowPathlineSeeds   NG1
trails             on
keepInactiveGlyphs false
claim              14 §16  near-ground pathline through divergent V_h
live App           yes  (development default, not product nav)
```

**Future Guided Experiment.** Isolated from D1 and from S1/S2.
Not cold-pool spreading. Incidental floor exit is not the climax.

### 5.5 The enum itself

`TracerPedagogy` remains a legal **internal** composition helper:

```text
pedagogy value
  → which ScenarioConfig seed array
  → trailEnabled
  → keepInactiveGlyphs
```

It must not become:

- the App’s primary mode switch;
- a ScenarioConfig field;
- a feature flag on physics;
- a `Both` container;
- the name of Explore.

Tests that freeze the four names stay valid as composition tests.
They are not a product sitemap.

---

## 6. Seed semantics

Current role = which array (`01`, `08` §4). No per-seed tag.
Do not migrate the DTO in this slice.

| Array | Current job | Future job |
| --- | --- | --- |
| `diagnosticSeeds` | DiagnosticProbes fixture | Stay ScenarioConfig fixture for the diagnostic preset / tests. Not a Guided catalog entry. |
| `storySeeds` | S1/S2 | Canonical ICs for the upward Guided experiment. |
| `downwardPathlineSeeds` | D1 | Canonical ICs for the downward Guided experiment. |
| `nearGroundOutflowPathlineSeeds` | NG1 | Canonical ICs for the near-ground Guided experiment. |

**Should these arrays remain ScenarioConfig fixture data?**
**Yes, for now.** They are DEMO experiment parameters, not UI
session state. `01` forbids a parallel seed owner and a preset
framework. Moving them into a new Guided DTO without a catalog
SoT would be a name change, not an architecture win.

**Are they canonical initial conditions for Guided experiments?**
**Yes, for the three pathline arrays.** That is why the
reachability / pedagogy slices exist. `diagnosticSeeds` are
canonical *diagnostic* ICs, not Guided ICs.

**Must future arbitrary Explore seeding use a different runtime
path?** **Yes.** User-placed ICs are session state. They must not
be written into `DEMO_SCENARIO` arrays. They may still pass
through role-agnostic `createTracersFromSeeds` /
`resetTracersFromSeeds`. Ownership differs; the primitive does
not.

Do not add `pedagogicalGroups[]`, per-seed `{ role }`, or a
generic seed framework (`08` already rejected those).

Reset (`02`): restores whatever list the **active experience**
owns. Guided Reset restores that experiment’s canonical ICs.
Explore Reset is a later decision (clear user tracers, restore
an Explore starting set, or both). Do not overload Guided Reset
with Explore semantics now.

---

## 7. Curated tracers vs exploratory tracers

Central split.

```text
curated tracer
  specially chosen IC
  an allowed teaching claim attaches to this experience
  isolation rules of that Guided experiment apply

exploratory tracer
  arbitrary user IC
  no pre-assigned story claim
  many may exist at once
```

A particle that happens to start near NG1 in Explore is **not**
NG1. Copy, labels, and “why” must not attach `14` §16 to it.

### 7.1 Shared runtime primitives

Both kinds **should** use:

```text
TracerParticle
Simulation
Integrator
AtmosphericTracerDomain
TracerPathHistory
TracerScene  (observe-only glyphs / lines)
```

Physics and simulation stay **role-agnostic**.
`createTracersFromSeeds` already copies `{x,y,z}` and does not
import `TracerPedagogy`. Keep that.

### 7.2 Different ownership / seeding layers

| Concern | Curated | Exploratory |
| --- | --- | --- |
| Seed source | ScenarioConfig array (for now) | session / interaction |
| Count | locked by pedagogy SoT (1 or 2) | user-controlled, later scaled |
| Trails | experience policy | Explore default later; not required to match Guided |
| Terminal glyph | experience policy | Explore default later; not D1’s keep-visible by accident |
| Reset | restore canonical ICs | later; must not mutate Guided arrays |
| Claim | allowed sentence of that experiment | none, or only local probe facts |
| Isolation | vs other Guided experiments | vs *attribution*, not vs coexistence |

`keepInactiveGlyphs` is Guided presentation, not a Model flag and
not an Explore default inherited from D1.

---

## 8. Many-parcel future

Explore will want tens / hundreds of parcels. Do not optimize
now. Compatibility only.

**Does current architecture forbid it in principle?** **No.**
`Simulation.step` is a loop over `particles`. The field is
sampled per particle. Domain policy is per particle. Path
history is one recorder observing the list.

**Reusable:**

- `TracerParticle` / `Simulation` / integrator / domain;
- `createTracersFromSeeds` as a copy helper;
- `TracerPathHistory` sampling-after-step (policy may later
  change stride or retention; the owner is right);
- observe-only `TracerScene` sync.

**Expected future scaling boundaries** (not this slice):

```text
one Mesh per glyph
one THREE.Line per tracer, stride 1, full history
  (NG1 ≈ 2760 points; S1/S2 window ≈ 4000)
CPU composite sample per particle per step
TRACER_COLORS length 3  (index palette; 08 already said this
  cannot carry two pedagogical groups)
React / rAF orchestration of the live list
```

Those are rendering / session limits. They are not a reason to
start GPU particles, workers, instancing, or ring buffers now.
They are also not a reason to put particle count on
`ScenarioConfig` (`01` deferred `particleCount`).

---

## 9. Guided experiment abstraction

**Do not introduce a production `GuidedExperiment` / `Journey` /
`TeachingPreset` type now.**

Current contracts can live in docs plus existing composition
(`TracerPedagogy` + four arrays + copy in App subtitle). A type
whose only job is to wear a future name is the speculative
framework `01` / `08` rejected.

**Introduce a catalog type later when at least one of these is
true:**

1. a Guided shell must list experiences without talking in
   `TracerPedagogy` enum values;
2. an experience needs data the enum cannot carry (title, allowed
   claim, anti-claims, camera policy) as *selected product state*;
3. a second scenario exists and experiences must bind to a Model
   without copying seed arrays by hand;
4. persistence / deep-link of “which Guided experiment” is
   required.

Until then: docs own the catalog; composition owns the mapping;
live App may keep `LIVE_DEMO_TRACER_PEDAGOGY` as a **developer**
composition constant.

---

## 10. Product navigation

Conceptual top level, no UI drawing:

```text
Supercell Explorer
  ├── Explore      free investigation of the current Model
  └── Guided       catalog of isolated mechanism experiments
```

CONCEPT’s **Journey Mode** maps to **Guided**. Prefer the word
Guided at product level so it is not confused with ARCHITECTURE
§24 camera `Journey`.

A later cinematic Journey is **one Guided experience type**, not
a third top-level mode, and not the concatenation of the current
three pathline experiments.

Default while this remains a mechanism laboratory: the live App
may continue to open on one Guided composition (today NG1). That
is a development default. It is not a decision that Explore is
secondary forever.

Do not add a third top-level item for DiagnosticProbes, for
`IntegrationFrame`, or for “all tracers.”

---

## 11. What happens to the proposed pedagogy selector?

**Verdict C.**

| Option | Meaning | Why not / why |
| --- | --- | --- |
| A. Four-mode `TracerPedagogy` selector as the final UX primitive | Product nav = enum | Rejected. CONCEPT is Explore / Journey. DiagnosticProbes is not a sibling Guided card. Isolation is real, but it is a Guided-catalog rule, not a four-button widget. |
| B. Temporary developer selector, explicitly not product UI | Visible debug switch | Rejected **as the next slice.** `LIVE_DEMO_TRACER_PEDAGOGY` already is that switch. A visible four-list in the current two-panel App will be read as product nav. If a debug selector is ever built, it belongs in ARCHITECTURE §28 debug, labeled as composition, not beside Pause. |
| **C. Do not implement a selector now** | Next UI around Explore / Guided | **Canonical.** |
| D. Other | — | Not needed. |

Do not write UI in this slice.

`15` §11’s “useful next non-modeling slice” is hereby replaced:
the useful next product work is to specify Guided catalog and
Explore seeding, not to implement the enum as a control.

---

## 12. Anti-claim policy

Pedagogical safety found in `08` / `10` / `12` / `13` / `14` /
`15` survives the product split. It is **not** optional chrome.

### 12.1 Guided

Isolation remains mandatory.

```text
StoryPathlines                 ≠  DownwardPathline
DownwardPathline               ≠  source of NearGroundOutflowPathline
NearGroundOutflowPathline      ≠  cold-pool spreading
S1/S2 + D1 + NG1               ≠  full circulation
```

A Guided catalog must not:

- concatenate those seed arrays;
- add `Both` / `DownwardThenOutflow`;
- play S1 then D1 then NG1 as “the same air’s life”;
- use a prettier Journey UI to unsay `10`’s mass anti-claims.

A cinematic Guided experience **may** sequence camera, copy, and
layer visibility over the **same Model** (CONCEPT §8 beats 6–9:
freeze, strip cloud, reveal fields). That is not the same as
showing D1 and NG1 as a causal pair.

If a future catalog wants “context: a downward pathline ended
somewhere; independently, a near-ground outflow lives elsewhere,”
that is two successive **isolated** exhibits or an explicit
non-causal comparison SoT. It is not the default.

### 12.2 Explore

Arbitrary parcels **may** exist simultaneously. That is the
laboratory.

The interface **must not** attribute a curated causal story to
them.

```text
allowed:     many exploratory pathlines at once
             select one and ask why it moves
             see operand contributions at that point

forbidden:   labeling a descending parcel “D1”
             pairing it with a spreading parcel as the same air
             “you discovered the cold pool”
             “this is the return of the story pathline”
             highlighting two user parcels as a circulation
```

Explore’s false-narrative risk is real: motion can still look like
hit-then-spread. Mitigation is **inspectability and copy
discipline**, not hiding every other parcel. Guided isolation is
stricter because Guided *asserts a claim*. Explore asserts none.

---

## 13. Inspectability / “Why?”

Ownership, not implementation.

| Quantity | Architectural owner | Now | Future |
| --- | --- | --- | --- |
| Selected tracer | Interaction | Missing (no selection) | Explore and Guided both need it before Follow (`CONCEPT` §7, `ARCHITECTURE` §24) |
| Position / altitude | `TracerParticle.position` | Present | Display conversion outside physics (`ARCHITECTURE` §4) |
| Simulation time | `SimulationClock` | Present | Already session-visible only as motion |
| Total world velocity | `VelocityField.sample` | Present, not shown on a tracer | Probe / inspector consumes the same field particles use (`ARCHITECTURE` §23) |
| Per-operand contributions | Composite operands | Sum only. `fields` is private. No contribution API | Later **observation** API. Not `divergence()`. ARCHITECTURE §28 already wants `V_i` then `V_total` at a point |
| Vorticity diagnostics | env-layer diagnostics `06`/`08`/`09` | Hodograph overlays | Pointwise 3D curl of the composite is a new diagnostic SoT, not implied by selection |
| Hodograph relation | profile + `C` | Always on; ground-relative | Stays Model/environment inspection. A selected tracer’s `V` is not a hodograph rewrite |
| Follow camera | Interaction | Missing | Observes a tracer; does not pull it (`ARCHITECTURE` §24) |

Do not implement an inspector here.

Per-operand sampling is compatible with `docs/physics/12-composite-velocity-field.md`
(operands remain independently defined). It is **not** the
forbidden production `divergence()` API of `10`. Do not smuggle
mass-budget language into “why this parcel moves.”

Operand contribution at a point will matter more in Explore than
in Guided, because Guided copy already names the intended
mechanism. Both still need it: NG1 is a composite pathline
(`14` §9), not isolated NG.

---

## 14. Current-work reuse

The last pedagogy / reachability / path-history slices are **not**
a dead end if the product is Explore + Guided. They are CONCEPT
§10 (development as investigation) producing the first Guided
catalog and the runtime those experiences share with Explore.

Do not keep them out of sunk-cost bias. Classify each piece:

| Piece | Verdict | Why |
| --- | --- | --- |
| `TracerPathHistory` | **Permanent foundation** | Role-agnostic recorder after `Simulation.step`. Explore and Guided both need pathlines. Owner is right (`14` rendering Option C). |
| Trail primitive (`THREE.Line`, observe-only) | **Permanent foundation** | Rendering observes history. Not a streamtube. Scaling may later change the drawable, not the recorder contract. |
| `AtmosphericTracerDomain` | **Permanent foundation** | Model/lifecycle policy. Explore and Guided both occupy `y ≥ 0`. |
| Terminal crossing (interpolate, `active = false`) | **Permanent foundation** | Domain-exit semantics (`11`). |
| `keepInactiveGlyphs` | **Useful Guided presentation policy** | Keep for D1 exhibit; hide for NG1. Not Model. Explore must choose its own default later. |
| Seed-role split (which array) | **Permanent idea; DTO shape is transitional scaffold** | Role-by-array stays. Four `simulation.*Seeds` fields may later be referenced by a Guided catalog without becoming Explore’s seed path. |
| `TracerPedagogy` | **Useful transitional scaffold** | Internal composition mapping. Not product nav. May remain as a helper behind a catalog, or shrink once a catalog type exists (`§9`). |
| S1 / S2 / D1 / NG1 | **Permanent Guided ICs** | The research is the value. Coordinates are canonical for those experiments, not for Explore. |
| Reachability / pedagogy audits `07` `08` `12` `14` | **Permanent scientific foundation** | Why those ICs exist; what they may claim. Guided catalog consumes them. |
| Four-mode live switch via code constant | **Transitional scaffold** | Developer composition. Replaced by Guided selection, not by a public enum widget. |
| `TRACER_COLORS` length-3 palette | **Likely future replacement** | Cannot carry Guided groups or many Explore parcels (`08` §5). |
| App subtitle as the allowed claim | **Transitional scaffold** | Correct honesty for one live exhibit. Guided catalog should own copy per experiment. |

Physics operands, compositor, frame, and continuity anti-claims
are Model. This product SoT does not reopen them.

---

## 15. Relation to checkpoint `15`

`15` locked: prescribed kinematic cartoon complete enough; stop
adding physics; continuity YELLOW; NG ≠ cold pool; D1 ≠ NG source;
tilting/stretching unblocked as the next *modeling* document;
four-mode selector as next *non-modeling* slice.

This document keeps the physics pause and the modeling
recommendation. It **replaces** the product next-slice:

```text
15 said:     implement (or at least treat as next) a four-mode
             pedagogy selector

16 says:     do not implement that selector
             next product work is Explore / Guided architecture
             (this document) then Guided catalog + Explore seeding
             specs, still without shipping the enum as nav
```

Isolation, anti-claims, and “three exhibits are dark” remain
true. The remedy is a Guided catalog that can present **three**
user-facing experiments, plus Explore, plus a developer
diagnostic preset — not four equal mode buttons.

---

## 16. Ranked next slices

Modeling remains paused (`15` D).

### Product / interaction

1. **Guided experiment catalog SoT** (docs only). Name the three
   user-facing experiments from S1/S2, D1, NG1. Attach allowed
   claims and isolation. Explicitly exclude DiagnosticProbes from
   the public catalog. Do not add a `GuidedExperiment` production
   type unless that SoT proves the enum cannot carry the catalog
   (`§9`). No UI.
2. **Explore seeding / session-tracer ownership SoT** (docs only).
   Runtime path for arbitrary ICs vs ScenarioConfig fixtures.
   Reset semantics. No click-to-seed implementation.
3. **Inspectability / probe architecture SoT** (docs only).
   Selected tracer, `V_total`, per-operand contributions, what
   the hodograph may and may not say about that parcel. Not an
   inspector UI. Not `divergence()`.
4. **Only after those:** a first Guided shell *or* a first Explore
   release — whichever is commanded. Neither is a four-pedagogy
   selector.

Not next: Follow camera, cinematic Journey beats, pad widen,
debug contribution HUD as a substitute for (3), Both-mode.

### Modeling

When modeling resumes, `15` still holds:

**Tilting / stretching interaction architecture SoT** (docs only;
not an eighth operand; `02` Y12).

This product audit does not make thermo, D3, a solver, or another
prescribed sibling more urgent. Explore makes **inspectability of
the current sum** more valuable; that is product/architecture
(slice 3 above), not tilting.

---

## 17. Docs debt (do not mass-edit here)

| Location | Issue |
| --- | --- |
| `15` §11 / lock-in | Recommends a four-mode selector as next non-modeling. This document supersedes that product line. Do not silently rewrite `15`. |
| `08` §5 / `14` rendering | “UI to switch later” via `LIVE_DEMO_TRACER_PEDAGOGY`. Still true as composition; no longer the intended *product* control. |
| `01-tracer-scene` composition list | Operand list lags the seven-operand live stack. Rendering contract is still SoT. |
| `02-tracer-runtime-controls` Reset | Speaks in pedagogy arrays. Compatible; later Explore Reset is a new contract. |
| `CONCEPT` Journey vs `ARCHITECTURE` camera Journey | Homonym. This document splits them. Do not rename CONCEPT here. |
| `03` banner | Still says story tracers are not authorized in places. They are `StoryPathlines`, a Guided experiment, currently off-screen. Historical frame SoT. |

No production comments were patched in this slice.

---

## 18. Compact lock-in

```text
product top-level:                 Explore | Guided
                                   CONCEPT Journey Mode = Guided family
                                   camera Journey ≠ product nav

model ownership:                   seven-operand laboratory
                                   IntegrationFrame
                                   tracer domain
                                   ScenarioConfig occupancy
                                   experience must not silently
                                   change physics

Explore responsibility:            free investigation of that Model
                                   arbitrary seeding (later)
                                   many parcels
                                   time / camera / layers
                                   inspect “why” locally
                                   no curated causal claim

Guided responsibility:             curated presentation
                                   canonical ICs, trails, copy,
                                   allowed claim, isolation
                                   not new physics

TracerPedagogy future role:        internal composition
                                   not top-level product navigation

current seed arrays future role:   remain ScenarioConfig fixtures now
                                   story / downward / NG = Guided ICs
                                   diagnosticSeeds = diagnostic preset
                                   not Explore’s arbitrary seed path

arbitrary Explore seeding
ownership:                         session / interaction
                                   role-agnostic createTracersFromSeeds
                                   do not write user ICs into DEMO arrays

guided-experiment abstraction:     minimal public id in `20`
                                   still not a lesson engine
                                   UI must not select TracerPedagogy

proposed four-mode selector
verdict:                           C
                                   do not implement
                                   next UI around Explore / Guided

anti-claim policy:                 Guided: D1+NG1 and S1/S2+D1+NG1
                                   remain non-causal; no Both
                                   Explore: coexistence allowed;
                                   curated attribution forbidden

inspectability direction:          selected tracer + probe
                                   V_total from the same field
                                   later per-operand contributions
                                   (not divergence())
                                   hodograph stays env inspection

many-parcel compatibility:         not forbidden in principle
                                   scaling boundary is renderer /
                                   full-history lines / 3-color palette
                                   do not start GPU now

current-work reuse verdict:        not a dead end
                                   path history, domain, ICs,
                                   reachability = foundation
                                   TracerPedagogy / four-array DTO /
                                   live code-constant = scaffold
                                   3-color palette = likely replacement

next product slice:                Guided runtime architecture SoT
                                   (`20`; docs-only when written.
                                   Catalog content remains `17`.)

next modeling slice:               still paused
                                   when resumed: tilting/stretching
                                   interaction architecture SoT
                                   (15 unchanged)

blockers:                          none for the catalog SoT
                                   Explore seeding blocked only by
                                   needing this split (now locked)
                                   inspector blocked by missing
                                   selection + contribution API
                                   (future; not physics)
                                   four-mode product selector:
                                   blocked by this document

production this slice:             none
```

---

## 19. STOP

This SoT does not start a UI selector, Explore UI, Guided UI,
arbitrary seeding, an inspector, a new production abstraction,
physics, tilting/stretching, thermodynamics, a continuity solver,
or rendering polish.

Do not ship `TracerPedagogy` as navigation.
Do not concatenate Guided experiments because CONCEPT mentioned
a Journey.
Do not treat DiagnosticProbes as a fourth public experiment.
Do not write user seeds into `ScenarioConfig`.

Next work starts only when commanded.
