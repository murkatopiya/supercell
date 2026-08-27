# Post–42-1 V1 Sufficiency and Scope-Cut

**Status:** ARCHITECTURE / PRODUCT CHECKPOINT /
V1 FEATURE FREEZE ACTIVE /
M2 COMPLETE /
M3 SUFFICIENTLY COMPLETE FOR PRE-M5 /
M1 HONESTY CONTRACT RETAINED; 40-E NOT A PRE-M5 SLICE /
42-1 COMPLETE /
42-2 NOT A V1 IMPLEMENTATION OBLIGATION /
40-C / 40-E / 40-F / 40-G NOT PRE-M5 /
M5 IS THE NEXT V1 STEP /
M4 FOLLOWS M5 /
M5-AUTHOR SEMANTIC LATER RECORDED IN `46`;
M4 CLOSURE AUDIT IS `47` /
THIS FILE DOES NOT INCLUDE PRODUCTION IMPLEMENTATION
**Scope:** after live 42-1, decide whether remaining scheduled
UX/UI slices are still required for a finite V1, or whether
the product is already sufficient as a research / validation
prototype to enter M5 acceptance playtest. Cuts scheduled
work that no longer gates the V1 promise, A1–A5, or T1–T10.
Does not add capability. Does not reopen physics, encodings,
or the feature freeze. Not a visual redesign. Not `ROADMAP.md`.
**Physics:** unchanged. Model class remains prescribed kinematic
laboratory (`30`). Exactly seven `V_total` operands. Prescribed
Ω semantics unchanged.
**Implementation:** this checkpoint does not include production
`src/**` work. No remaining UX slice is authorized here.

Predecessor Environment / Airflow placement:

```text
docs/architecture/42-post-41-3-explore-airflow-and-environment-architecture.md
```

Binding V1 scope, freeze, and acceptance:

```text
docs/architecture/38-v1-scope-checkpoint.md
```

Related still-binding SoTs (not replaced):

```text
docs/architecture/39-v1-visual-airflow-product-state-architecture.md
docs/architecture/40-v1-m1-m3-ux-ui-consolidation-architecture.md
docs/architecture/41-post-slice-b-explore-release-and-highlight-checkpoint.md
docs/architecture/16-explore-guided-interaction-architecture.md
docs/architecture/18-explore-arbitrary-seeding.md
docs/architecture/19-shared-tracer-inspector.md
docs/architecture/20-guided-runtime-architecture.md
docs/architecture/32-diagnostic-observation-ui-architecture.md
docs/CONCEPT.md
docs/architecture/45-m5-human-acceptance-playtest-protocol.md
docs/architecture/47-m4-v1-closure-audit-and-plan.md
```

Accepted live head this checkpoint is written against:

```text
5a08f8c
```

That commit is Slice 42-1 Environment / hodograph on-demand.

Keep these roles distinct:

```text
CURRENT FACT
LIVE EVIDENCE
STILL-BINDING CONTRACT
NEW PRODUCT DECISION
KNOWN V1 LIMITATION
POST-V1 REDESIGN INPUT
REJECTED ALTERNATIVE
ANTI-CLAIM
```

---

## 1. Why this checkpoint exists

`38` defined a finite V1 and a five-item MUST list (M1–M5).
`40`–`42` then scheduled a consolidation tail:

```text
42-2  Airflow viewport toolbar + 41-4 Highlight copy
40-C  observation empty state
40-E  M1 identity + mode signposting
40-F  Guided teaching-copy consolidation
40-G  remaining layout tests
then M5, then M4
```

That tail assumed V1 was still *functionally untestable* until
the chrome matched Option 2 completely. Live 42-1 evidence no
longer supports that assumption.

The question is no longer “what would make the UI better?”
It is:

```text
What, concretely, can we not prove, check, or honestly
demonstrate in V1 without this remaining work?
```

If there is no convincing answer, the item is not a V1 MUST
merely because it is already written down.

V1 here is a **research / validation prototype**, not a
production-quality application. Sufficiency is the §2 promise,
A1–A5, T1–T10, scientific honesty, and inspectable physics —
not elegance, unified chrome, or discoverability polish.

---

## 2. Live files inspected

```text
src/app/App.tsx
src/app/app.css
src/ui/hodograph/EnvironmentAffordance.tsx
src/ui/hodograph/EnvironmentSurface.tsx
src/ui/tracer/VisualAirflowWorkbenchControls.tsx
src/ui/tracer/ExplorePointReleaseControls.tsx
src/ui/tracer/GuidedExperimentPanel.tsx
src/ui/tracer/TracerInspectorPanel.tsx
src/ui/tracer/PointDiagnosticsPanel.tsx
src/ui/tracer/ExploreFollowControl.tsx
src/ui/tracer/ExploreResetViewControl.tsx
src/guided/GuidedExperiment.ts
```

Binding SoTs reread: `38`, `39`, `40`, `41`, `42`, `CONCEPT` §9.

---

## 3. CURRENT V1 CAPABILITY STATE

**CURRENT FACT** against `src/**` at `5a08f8c`.

End-to-end loops that already run without further slices:

```text
Guided
  three catalog experiments
  Observe / Demonstrates / Does not mean
  persistent Guided honesty line
  runtime Pause / Reset / Speed
  Inspector after selection
  Environment default-open (left hodograph column)

Explore
  scene-first Controls | Viewport | Observation at desktop
  no page scroll for the main loop at 1920×1080 (Slice A)
  [Release tracer] → placement → pick → Confirm (41-1)
  Runtime Pause / Reset simulation / Speed
  Clear tracers as occupancy (41-2)
  Follow + Reset View with disabled Follow reason
  screen-space pick + selection halo
  Inspector L1/L2 (V_total + seven operands)
  Point diagnostics T_tilt,y / ω_y,current + tendency
    ≠ existence disclaimer
  M2 Comets default; Eulerian diagnostic; Highlight;
    Depth cue (still on the left rail)
  Environment on-demand overlay (42-1); default closed
  one fixed DEMO environment / hodograph + overlays
```

Physics, seven operands, prescribed Ω, Follow, Reset View,
picking/halo, and seeding semantics are unchanged and live.

Missing as *scheduled chrome*, not as missing laboratory
capability: Airflow-on-viewport, compact Highlight orientation
line, observation empty-state pointing at Release, persistent
Explore model-class sentence, Guided copy polish, README.

---

## 4. V1 SUFFICIENCY TEST

### 4.1 Product promise (`38` §2.1)

| Promise clause | Live? | Needs remaining UX slice? |
| --- | --- | --- |
| Interactive storm-relative kinematic laboratory | Yes | No |
| Prescribed idealized storm on one fixed profile | Yes; honesty copy stronger in Guided than Explore | Not a missing mechanism |
| Release passive parcels; watch where they go | Yes (Explore) | No |
| Decompose V_total into exactly seven components | Yes (Inspector L2) | No |
| Read two named local rotation diagnostics | Yes (Point diagnostics) | No |
| Diagnostics observe; they never feed the flow | Yes; disclaimer live | No |

### 4.2 Acceptance questions A1–A5

| Q | Demonstrable now? | Blocked by remaining UI? |
| --- | --- | --- |
| A1 parcel path | Yes: release + scene + Inspector motion | No |
| A2 seven contributions | Yes: Inspector L2; Highlight optional | No |
| A3 environment / hodograph / C | Yes: Environment surface + overlays + subtitle | Environment UX is clumsy, not absent |
| A4 T_tilt,y and ω_y,current | Yes: Point diagnostics after selection | No |
| A5 tendency ≠ existence | Yes: four-paragraph disclaimer after selection | No |

### 4.3 Tasks T1–T10 — human-testable now?

Criterion: a target user *can* attempt the task on the live
product without a missing control, readout, or mode.

| Task | Technically available now? | UI-blocked? | Class if it later fails |
| --- | --- | --- | --- |
| T1 reach Explore | **Yes** — header Guided / Explore | No purpose line (F6) | discoverability / playtest |
| T2 hodograph meaning | **Yes** — Environment + title “Hodograph” + “Ground-relative hodograph” + C overlay | Affordance looks like a third mode; Explore starts closed | known UX limitation unless T2 actually fails |
| T3 release at point + altitude | **Yes** — Release tracer is the first Explore action | Empty Inspector does not mention release (F1) | `38` §4.2 CONDITIONAL already |
| T4 pause / speed / Reset | **Yes** | F7 mostly closed | playtest |
| T5 select intended parcel | **Yes** — screen-space pick; scene-first height | No | `38` §4.2 viewport CONDITIONAL if canvas is the cause |
| T6 Follow + Reset View | **Yes** | No | playtest |
| T7 V_total + seven rows | **Yes** — observation dock | No | playtest |
| T8 diagnostics + units | **Yes** — same dock, region scroll | No | `38` §4.2 diagnostics CONDITIONAL if unread while parcel visible |
| T9 tendency ≠ existence | **Yes** — disclaimer with the numbers | Requires a selection (same as A4/A5) | honesty content present |
| T10 prescribed / not simulated | **Yes from Guided first screen**; weaker if the tester never reads Guided and stays in Explore | Explore has no dedicated persistent model-class sentence | honesty / playtest (T10 is blocking if it fails) |

**NEW PRODUCT DECISION:** T1–T10 are all *attemptable* on the
current product. None is gated on 42-2, 40-C, 40-E, 40-F, or
40-G. The remaining risks are copy persistence (T10 in an
Explore-only reading), empty-state teaching (T3), and
Environment discoverability (T2) — all playtest-falsifiable.

---

## 5. Test applied to each leftover

Question used throughout:

```text
What can we not prove, check, or honestly demonstrate
without this work?
```

Classes used below:

```text
KEEP BEFORE M5              required to start playtest
DEFER UNTIL PLAYTEST EVIDENCE
                            not scheduled; may return if T*
                            actually fails under freeze
POST-V1                     valid later work; not V1
REMOVE FROM ROADMAP         not a V1 slice even later under
                            this name (may re-derive post-V1)
```

| Item | Without it, what is missing? | Class |
| --- | --- | --- |
| Any `src/**` change | — | **KEEP BEFORE M5: none** |
| 42-2 Airflow toolbar | A tidier taxonomy: presentation controls sit with the canvas | **POST-V1** |
| 41-4 compact Highlight orientation line | A compact On-state reminder that orientation/advection remain `V_total` | **DEFER UNTIL PLAYTEST EVIDENCE** |
| 40-C observation empty state → Release | Inspector/diagnostics still say “select a tracer”, not “release” | **DEFER UNTIL PLAYTEST EVIDENCE** |
| 40-E as a scheduled UI pass | Header/signposting chrome pass | **REMOVE FROM ROADMAP** as a slice |
| Extra Explore “not a simulation” sentence | Persistence of M1 in Explore before selection | **DEFER UNTIL PLAYTEST EVIDENCE** (not Slice E) |
| 40-F Guided copy consolidation | Slightly tighter teaching prose | **REMOVE FROM ROADMAP** / **POST-V1** if later desired |
| 40-G remaining layout tests | Tests for slices we are not shipping | **REMOVE FROM ROADMAP** |
| M3 remainder as a program | Visual hierarchy closer to Option 2-complete | **SUFFICIENT FOR PRE-M5** |
| M4 README / audit / known-limits | A stranger cannot read a release surface | **KEEP AFTER M5** (not before) |
| M5 human playtest | The §2 promise is unfalsified by a user | **KEEP; NEXT** |

---

## 6. M1 DECISION

**STILL-BINDING CONTRACT:** the product must not be mistaken
for a simulated, forecast, or self-generating supercell
(`38` §2.2, `CONCEPT` §9, T10 blocking).

**CURRENT FACT — honesty already on the live surface:**

```text
Guided (default first screen)
  “This is a prescribed storm-relative laboratory, not a
   real supercell simulation.”
  plus per-experiment Does not mean

Shared subtitle (both modes, before selection)
  ground-relative hodograph; storm-relative laboratory
  frame; prescribed storm motion

Explore after selection
  Point diagnostics: ω_y,current “prescribed through Ω”;
  “T1 does not generate ω_y,current”

Airflow (Explore, on-demand details / title)
  prescribed total velocity field V_total
```

**CURRENT FACT — what 40-E would still add:**

```text
a short persistent Explore identity line that does not
  depend on Guided or a selection
mode purpose lines (F6)
possibly header hierarchy so Environment is not a peer
  of Guided / Explore
```

That is copy/placement, not missing physics.

Does V1 currently *introduce a substantial scientific
falsehood* without 40-E? **No.** The default screen already
identifies a prescribed laboratory that is not a real
supercell simulation. Explore subtitle says laboratory and
prescribed storm motion. Diagnostics after selection repeat
prescribed Ω and non-causation.

Does V1 currently *meet the letter of `38` M1* (“both modes,
without requiring a selection or a Guided panel”)? **Not
fully in Explore.** A tester who ignores Guided teaching and
never selects a parcel does not see “not a simulation”.

**NEW PRODUCT DECISION:**

```text
M1 remains a V1 honesty contract, validated by T10 in M5.
40-E is not a pre-M5 implementation slice.

A new header band, mode-signposting pass, or Environment
restyle is out of scope as an M1 vehicle.

If M5 records a T10 blocking fail, the first remedy is the
smallest shared sentence in existing header/subtitle chrome
— not Slice E as originally scoped.
```

Class of the remaining Explore persistence gap:

```text
known V1 limitation / playtest-triggered copy
not a pre-M5 functional blocker
not permission to skip T10
```

This amends `38` only as to **scheduled pre-playtest work**.
It does not waive T10 or CONCEPT §9.

---

## 7. 42-2 / 41-4 DECISION

### 7.1 Airflow viewport toolbar (42-2)

**LIVE EVIDENCE:** Flow comets / Eulerian, Highlight, and
Depth cue already exist on the Explore left rail. Defaults
remain M2. They do not mutate occupancy. Placement on the
rail is a taxonomy/hierarchy issue (`42` E1), not a missing
control.

Without 42-2 we can still: run Comets, switch Eulerian, turn
Highlight on/off, choose an operand, toggle depth cue, and
complete T7 from Inspector.

**NEW PRODUCT DECISION:** 42-2 implementation is **POST-V1**.
The `42` ownership verdict (presentation belongs with the
viewport) remains valid **redesign input**, not a V1 MUST.

### 7.2 Highlight compact orientation copy (41-4)

**CURRENT FACT:** compact visible line is still:

```text
Tint shows one storm operand’s contribution — not a
separate air mass.
```

`title` and `<details>` still carry `HIGHLIGHT_COPY` (`39` / `41` §11):

```text
Comet advection and every mark's orientation still come
from the total field. Tint is not a separate air mass or
a quantitative comparison between operands.
```

Highlight remains optional, default Off, magenta, no glow.
Inspector L2 remains quantitative truth for T7 / A2.
`41` already recorded that Highlight is not a T1–T10
requirement.

The residual hazard is real: a user who enables Highlight and
does not open details may read a tinted comet as the operand
vector. That is an optional-diagnostic misreading, not a hole
in the interrogation loop.

**NEW PRODUCT DECISION:**

```text
41-4 is not pre-M5 MUST.
Class: DEFER UNTIL PLAYTEST EVIDENCE.
Known limitation: compact On-state line omits
  “orientation / motion = V_total”.
If M5 shows testers treating Highlight as operand direction,
  restore that sentence in compact chrome only.
Hue, glow, encoding, operand list, default Off: unchanged.
```

---

## 8. ENVIRONMENT UX DECISION

**LIVE EVIDENCE after 42-1:**

```text
Header: Guided | Explore | Environment look like peer actions
Guided: Environment shows/hides the left hodograph column
Explore: Environment overlays a large plot on the scene
Behavior is not unified and not fully intuitive
Hodograph is reachable, large enough to read, overlays work
```

T2 requires saying the hodograph is the ground-relative
environmental profile of this laboratory; naming C is a pass.
That content is on the surface (panel title, aria-label,
subtitle, C overlay). Closed-by-default Explore adds a click,
not a missing plot.

Does this create a **false model** (editable environment,
second storm, mode of the laboratory)? The control is labeled
Environment and expands a hodograph of the one fixed profile.
It does not offer scenario selection or editing. Peer
placement next to Guided/Explore is a **mode-confusion UX
risk**, not a second physics mode.

**NEW PRODUCT DECISION:**

```text
Acceptable known V1 UX limitation.
Not a T2 blocker on present evidence.
Not a pre-M5 implementation item.
Post-V1 redesign input: Environment must not look like a
  peer mode; Guided vs Explore local shells may differ.
```

Overlay vs column unification is out of scope for V1.

---

## 9. M3 DECISION

`38` M3 existed because F1, F3–F8 (and F4/F5 as risks) made
T1/T3/T5/T8 untestable or dishonest as a *document of stacked
chrome*. Live after 42-1:

| F-item | Live status | Pre-M5 leftover? |
| --- | --- | --- |
| F1 empty → release | Release is primary Explore action; empty Inspector still says “select” | Playtest only |
| F2 Explore M1 persistence | Guided has it; Explore subtitle partial | Playtest / known limitation (§6) |
| F3 dev workbench copy | Closed by M2 / `39` | None |
| F4 scene crushed by chrome | Slice A scene-first + 41 rail | None as a program |
| F5 diagnostics vs page scroll | Observation dock region scroll | None as a program |
| F6 Explore purpose line | Buttons exist; no purpose sentence | Playtest / POST-V1 |
| F7 Reset / Reset View / Clear | Closed by 41-2 / Slice B | None |
| F8 disabled reasons | Follow + Confirm/Cancel | None |
| F9 README / known limits | Absent | M4 after M5 |

**NEW PRODUCT DECISION:**

```text
M3 is sufficiently complete for pre-M5 V1.

Remaining 40-C/E/F/G and 42-2 are not M3 completion gates.
They are polish, taxonomy, or playtest-triggered copy.

Cosmetic polish remains POST-V1 (`38` §8.2).
```

This does not claim the UI is production-quality. It claims
the *functional* M3 that made T3–T9 executable has landed.

---

## 10. M4 / M5 DECISION

**M5** is the next V1 step. The promise is a claim about a
user. Automated tests cannot replace §11. Current product is
sufficient to *run* that playtest.

**M4** (README, what-this-is / is-not / known limits,
docs↔code reconciliation, accessibility basics, physics /
regression audit, green `npm test` / `typecheck`) remains
required to **close** V1 as a named artifact. It is not
required *before* asking users to attempt T1–T10.

**NEW PRODUCT DECISION:**

```text
Order: M5 first, then evidence-triggered blocker fixes
only (`38` §9 / §11.4), then M4, then V1 CLOSED.

Leftover M3 slices are not a prerequisite for running M5.
M5 is how we learn whether they were necessary.
```

---

## 11. MINIMAL FINITE ROADMAP

**NEW PRODUCT DECISION.** Supersedes `42` §16 and `41` §18
as the remaining *V1* production order. Those files remain
historical architecture for placement/copy meaning.

```text
NOW     this sufficiency / scope-cut (docs)
NEXT    M5 human acceptance playtest (`38` §11)
THEN    only recorded blocking / task failures,
        smallest freeze-legal remedy
THEN    M4 audit + README / known-limits surface
THEN    V1 CLOSED
```

Successor M4 audit (does not change this order; records
that M5-AUTHOR semantic completed with no blocker-fix
slice, and that README is still absent):

```text
docs/architecture/47-m4-v1-closure-audit-and-plan.md
```

No scheduled 42-2, 40-C, 40-E, 40-F, or 40-G before M5.

CONDITIONAL items in `38` §4.2 remain the only catalog from
which a task failure may admit extra layout work.

There is no open UX tail after V1 CLOSED. Post-V1 work starts
from §15 of this file and `38` §13, not from “finish 40”.

---

## 12. KNOWN V1 LIMITATIONS

Conscious, accepted imperfections of this prototype:

```text
K1  Explore has no dedicated persistent “not a simulation”
    sentence before selection (Guided does).
K2  Observation empty state points at selection, not Release.
K3  No mode purpose lines (“Guided vs Explore is for…”).
K4  Environment affordance sits visually with Guided/Explore
    and is not a mode; Guided hide-column vs Explore overlay
    are not unified.
K5  Airflow / Highlight / Depth cue remain on the left rail.
K6  Compact Highlight line omits “orientation = V_total”
    (full claim in title/details; default Off).
K7  Highlight magenta-on-navy remains hard at distance.
K8  No README / in-product known-limits sheet until M4.
K9  UI is research-prototype chrome, not production quality.
K10 One fixed environment; hodograph not editable; no
    hodograph↔tracer altitude bind.
K11 Guided has no Explore mounts (release, Follow, airflow,
    point diagnostics) — by contract, not an omission.
```

None of K1–K11 is treated as a missing V1 capability.

---

## 13. POST-V1 REDESIGN INPUTS

Preserve M3/42 learning so a later UI is not a mechanical
continuation of prototype chrome:

```text
Scene-first: the 3D laboratory is class A.
Release is the primary Explore loop, not Enable placement.
Selected-tracer observation belongs beside the scene,
  with region scroll, not page scroll.
Viewport presentation controls (airflow view, Highlight,
  depth cue) belong with the viewport, not with occupancy
  actions.
Environment is contextual / on-demand for one fixed profile.
Environment affordance must not look like a peer mode.
Guided and Explore may keep different local shells;
  unifying them is not a virtue by itself.
The next UI is not grown by finishing leftover prototype
  bands (rail Airflow, header Environment-as-mode, etc.)
  without re-deriving hierarchy from tasks.
```

`42`'s Airflow-ownership and Environment-size contracts remain
the right *eventual* placement if a post-V1 shell is designed.
They are not a V1 implementation backlog.

---

## 14. FEATURE FREEZE STATUS

```text
FEATURE FREEZE                 ACTIVE
New capability added           NONE
CONDITIONAL admitted           NONE
38 §9 freeze entry             NONE
Physics / operands / Ω         not reopened
Highlight encoding / hue/glow  not reopened
```

Playtest failures still reopen only through `38` §9 / §11.4.

---

## 15. Existing SoT amendments

```text
38  Promise, freeze, T1–T10, CONDITIONAL list unchanged.
    M1 honesty contract unchanged; pre-M5 Slice E is no
    longer required to enter M5. M3 sufficiently complete
    for pre-M5. Remaining scheduled path: M5 → fixes → M4
    → V1 CLOSED. Successor: this file.

39  Encoding, Comets default, Highlight semantics unchanged.
    Chrome home of Airflow controls may stay on the rail
    for V1; 42-2 is not a V1 obligation.

40  Option 2 / Environment Option B remain the accepted
    *architecture*. Remaining slices C/E/F/G are not
    pre-M5 MUST. Slice D / 42-1 COMPLETE. M3 sufficiently
    complete for pre-M5.

41  Release entry, Clear grouping, Highlight *meaning*
    unchanged. 41-4 compact copy is playtest-triggered,
    not a scheduled pre-M5 slice.

42  42-1 COMPLETE. 42-2 remains valid placement architecture
    and becomes POST-V1 implementation. Environment UX
    limitation accepted for V1 (§8).
```

---

## 16. V1 CLOSED vs production-ready

**NEW PRODUCT DECISION.**

```text
V1 CLOSED
  The finite validation prototype has demonstrated the §2
  promise to target users (M5 passed, or failures resolved
  under freeze), M4 release/audit artifacts exist, known
  limitations are written down, and no new capability was
  added.

V1 CLOSED is not:
  production-quality UX
  unified Environment chrome
  marketing polish
  a complete settings/information architecture
  CONCEPT’s long-term vision
```

`38` “V1.0 READY” maps to **V1 CLOSED** in this sense.
A later production shell is post-V1 work.

Human-validation limitation (`45`): V1 CLOSED as a
validation prototype may be recorded after M5-AUTHOR
dogfood, freeze-legal fixes, and M4, **with an explicit
statement that independent 2/3 target-user evidence is
not available**. That closure must **not** claim `38`
§11.3 PASS.

---

## 17. Explicit non-goals

```text
production implementation of 42-2, 41-4, 40-C/E/F/G
new capability, operand, environment, overlay
Highlight hue / glow / encoding change
editable hodograph
Guided catalog expansion
mobile redesign
finishing Option 2 “because it was planned”
```

---

## 18. Anti-claims

```text
This file does not include production implementation.
A research prototype is allowed to look unfinished.
An unfinished prototype is not allowed to lie about physics.
Scheduled slices are not MUST merely because they exist on
  paper.
Moving Airflow to the viewport is not required to prove V1.
Collapsing Environment into a prettier control is not
  required to prove T2.
M5 is not postponed until the UI is elegant.
M1 is not waived; Slice E is not the only honest form of M1.
```

---

## 19. Documentation authority

```text
38  promise, freeze, T1–T10, CONDITIONAL, M4/M5 definition
39  M2 encoding / Highlight meaning
40  M3 spatial architecture (historical + still-valid
    hierarchy); remaining slices not pre-M5 MUST
41  release entry; Highlight meaning
42  Environment/Airflow placement architecture; 42-1 done
43  this file: sufficiency, scope-cut, remaining path
44  long-term source / reconstruction boundary;
    does not affect this file’s V1 / M5 path
45  M5-AUTHOR playtest protocol; does not weaken T1–T10;
    independent 2/3 sample remains unavailable
46  M5-AUTHOR semantic classification; blocker-fix slice
    not required; M4 may proceed before independent humans
47  M4 closure audit / plan; README not authored there
```

---

## 20. Compact lock-in

```text
LIVE V1               interrogation laboratory; promise
                      demonstrable without further UX slices
T1–T10                all attemptable now
M3                    sufficiently complete for pre-M5
M1                    honesty contract live in Guided;
                      Explore persistence = known limitation;
                      40-E not pre-M5
42-2 / 41-4           not pre-M5 MUST
ENVIRONMENT UX        known limitation; T2 not blocked
M5                    M5-AUTHOR semantic recorded (`46`);
                      blocker-fix slice not required;
                      M5-INDEPENDENT not available
M4                    audit/plan in `47`; README not yet
                      created; then M4-1 / M4-2
V1 CLOSED             prototype close, not production-ready
FREEZE                ACTIVE
IMPLEMENTATION        this file includes none
```

---

## 21. Final decision

1. **Is current V1 sufficient to start M5?**  
   **Yes.**

2. **What is mandatory before M5?**  
   **Nothing in `src/**`.** This docs checkpoint. Then run
   `38` §11.

3. **Which previously scheduled slices leave pre-M5 V1?**  
   **Cut now:** 42-2 (POST-V1 placement only), 40-E as a UI
   pass, 40-F, 40-G.  
   **Not scheduled; playtest-triggered only:** 40-C, 41-4,
   extra Explore M1 sentence.

4. **Minimal path to V1 CLOSED?**  
   current state → M5 → only evidence-triggered blocker
   fixes under freeze → M4 → V1 CLOSED.

5. **What does V1 CLOSED mean, separately from
   production-ready?**  
   The finite validation prototype has shown the §2 promise
   to target users, recorded known limits, and finished M4
   audit/README. It does **not** mean production-quality UX,
   unified Environment chrome, or CONCEPT’s long-term vision.
   Full wording in §16.

---

## 22. Implementation authorization / production files / tests

```text
IMPLEMENTATION AUTHORIZATION   NO
Production files changed       NONE (`src/**` untouched)
Tests / typecheck              N/A (docs-only)
```
