# M5 Human Acceptance Playtest Protocol

**Status:** M5 PLAYTEST PROTOCOL SoT /
V1 FEATURE FREEZE ACTIVE /
NO IMPLEMENTATION AUTHORIZATION /
PLAYTEST NOT STARTED
**Scope:** prepare a structured, honest human acceptance
session for the frozen V1. Recover T1–T10 against the live
product. Define what one author dogfood session can and
cannot claim. Not a UX redesign. Not an implementation
task. Not an Environment / compass / gizmo SoT. Not `44`.
Not `ROADMAP.md`.
**Physics:** unchanged. T1 (tilting) and Candidate A remain
CLOSED. Seven `V_total` operands. Prescribed Ω. Model class
A (`30`).
**Implementation:** none. Production `src/**` MUST remain
unchanged. Do not fix, polish, or add capability before the
session. Do not reopen M3.

Predecessor sufficiency / remaining V1 path:

```text
docs/architecture/43-post-42-1-v1-sufficiency-and-scope-cut.md
```

Binding acceptance, freeze, and tasks:

```text
docs/architecture/38-v1-scope-checkpoint.md
```

Related still-binding SoTs (not replaced):

```text
docs/architecture/39-v1-visual-airflow-product-state-architecture.md
docs/architecture/40-v1-m1-m3-ux-ui-consolidation-architecture.md
docs/architecture/41-post-slice-b-explore-release-and-highlight-checkpoint.md
docs/architecture/42-post-41-3-explore-airflow-and-environment-architecture.md
docs/architecture/19-shared-tracer-inspector.md
docs/architecture/32-diagnostic-observation-ui-architecture.md
docs/CONCEPT.md
```

Accepted live head this protocol is written against:

```text
9accd1571a38806b6777017e3381c4bfa90e0551
```

Keep these roles distinct:

```text
CURRENT FACT
STILL-BINDING CONTRACT
NEW PROJECT DECISION
PRE-M5 OBSERVATION
KNOWN V1 LIMITATION
ANTI-CLAIM
```

This document did **not** change production code.
It does **not** begin the playtest.
It does **not** weaken T1–T10 or `38` §11.3 PASS.

---

## 0. Chat runbook (administer here)

Use this when the tester has the running app open and the
facilitator is in chat.

```text
1. Confirm: freeze ACTIVE; no src changes this session;
   tester is the project author; this is M5-AUTHOR, not
   independent 2/3 validation.
2. Reload the app. Default boot is Guided, Environment open.
3. Give EXACTLY ONE Tester Card from §13.
   Do not send the matching Reviewer Key.
   Do not name the T-number.
   Do not name expected controls.
   Do not hint.
4. Tester works unaided. They may think aloud:
   what they believe a control or visual means BEFORE using it.
5. Record the §12.1 evidence fields from observation +
   the tester’s words. Do not coach.
6. Attempt ends per §7.4. Only AFTER a failed attempt may
   a diagnostic hint be given, and it is labelled HINT.
7. Then, and only then, the next Tester Card.
8. After Card 10: session summary (§12.2).
   Candidate fixes only after the summary.
   Do not implement during the session.
```

Facilitator may translate a Tester Card into the tester’s
language. Translation must not add control names, file
names, or scoring clues.

AI may later review screenshots or transcripts as
**AI REVIEW EVIDENCE** (§11). AI is not a human tester.

---

## 1. Why this protocol exists

`43` judged current V1 sufficient to *start* M5. `38` §11
is the acceptance contract. Independent human sample is
not available: one tester, the author.

The risk this file exists to prevent:

```text
not:  skip M5 because three strangers are missing
not:  pretend 1/1 author success = 2/3 independent PASS
not:  treat Claude / other AI as a human tester
not:  fix UI “just in case” before evidence
not:  redesign T1–T10 to match current chrome
not:  turn every annoyance into a freeze-reopening blocker
not:  claim V1 CLOSED as if strangers had passed §11.3
```

---

## 2. Live contract recovered

### 2.1 Acceptance frame (`38` §2.4) — unchanged

```text
A1  Where does a parcel released at this point and altitude go?
A2  Why is it moving this way — which of the seven components?
A3  What environment is this laboratory built on (hodograph, C, V_sr)?
A4  What are T_tilt,y and ω_y,current at this selected parcel?
A5  Why is a tilting tendency not existing vertical vorticity,
    and why does this product not claim one produced the other?
```

### 2.2 Tasks T1–T10 (`38` §11.2) — wording unchanged

```text
T1   Enter the mode where parcels can be released and
     diagnostics read (Explore), unaided.
T2   Say what the hodograph represents — that it is the
     ground-relative environmental wind profile of this
     laboratory. Naming storm motion C is a pass; deriving SRH
     is not required.
T3   Release a parcel intentionally at a chosen ground point
     and a chosen altitude.
T4   Run, pause, change speed, and reset the laboratory, and
     say what Reset restored.
T5   Select the intended parcel — the one they meant, not
     whichever one got picked.
T6   Follow that parcel, then recover the storm view, and
     state that Reset View moved the camera and not the
     simulation.
T7   Read V_total and its seven contributions, and name which
     contribution dominates at the parcel's current position.
T8   Find and read T_tilt,y and ω_y,current for the selected
     parcel, with their units.
T9   Explain, in their own words, that a tilting tendency is
     not the same thing as vertical vorticity that already
     exists, and that this product does not claim one produced
     the other.
T10  State that the storm here is idealized and prescribed —
     not a simulated, forecast, or self-generating storm.
```

### 2.3 Original success / fail (`38` §11.3) — not rewritten

```text
PASS            every task completed unaided by at least two of
                three testers
BLOCKING FAIL   T9 or T10 fails for any tester
TASK FAIL       a task fails for two or more testers
PARTIAL         completed only after re-reading on-screen copy;
                recorded, not blocking
```

### 2.4 Freeze reopen (`38` §9 / §11.4) — not rewritten

Honesty failure (T9, T10) reopens **copy and placement**
immediately; never features or physics.

A task failure reopens V1 scope only through `38` §9, which
still requires a recorded playtest with a **target user who
has not worked on this codebase** and a failure for **at
least two of three testers**, plus irreducibility to copy /
labelling / layout / defaults.

Author dogfood **cannot** satisfy §9 conditions 1–2 for
admitting a new capability.

Defect / correctness / copy-layout fixes remain unfrozen
as in `38` §9 “NOT FEATURES”. Honesty-copy repair after a
recorded T9/T10 fail is that path, not a new feature.

### 2.5 Facilitation (`38` §11.1)

```text
target user     knows basic severe-weather meteorology; has
                never worked on this codebase; has not read
                these docs
testers         2–3 independent users
facilitation    none during an attempt
input           the running product and nothing else
```

The author fails the **target-user** definition. This
protocol does not delete that definition. It adds an
executable **author-dogfood** class beside it (`§4`).

`38` U4 (“how many testers if only two are available”)
remains about **independent** sample size. This file does
not answer U4 by counting the author as two people.

---

## 3. Live UI map (CURRENT FACT)

Verified against `src/**` at `9accd15`. Not a redesign.

App boots **Guided**. Header: Guided | Explore | Environment.
Subtitle: “Ground-relative hodograph. 3D tracers use a
storm-relative laboratory frame…”. Environment default
**open** in Guided (column); **closed** after entering
Explore (overlay).

| Task | Live surface the task uses |
| --- | --- |
| T1 | Header **Explore**. Release + Inspector + Point diagnostics are Explore-only. |
| T2 | **Environment** → title “Hodograph”; plot `aria-label="Ground-relative hodograph"`; C overlay; subtitle names ground-relative hodograph and prescribed storm motion. |
| T3 | Explore **Release tracer** → Altitude (m) → click ground → **Confirm**. |
| T4 | **Pause** / **Resume**, **Speed** radios 1/5/10/20, **Reset** (`aria-label="Reset simulation"`). Distinct from Reset View. |
| T5 | Click a visible glyph. Inspector shows Tracer #id. |
| T6 | **Follow** (needs selection). **Reset View** (“Reset camera to storm view (does not reset the simulation)”). |
| T7 | Inspector: `V_total (m/s)`, seven rows: Environmental advection, Updraft, Rotation, Lower inflow, Upper outflow, Downdraft, Near-ground outflow. |
| T8 | **Point diagnostics** after selection: `T_tilt,y` s⁻², `ω_y,current` s⁻¹. |
| T9 | Same panel, four-paragraph disclaimer including “T1 does not generate ω_y,current”. |
| T10 | Guided first screen: “This is a prescribed storm-relative laboratory, not a real supercell simulation.” Explore has no dedicated persistent model-class sentence (`43` K1). |

Axes: `THREE.AxesHelper(2000)` at the scene origin in
`TracerScene`. Three.js colors: **X red, Y green, Z blue**.
Project world: **+X East, +Y Up, +Z South**. No N/E/S/W
labels on the helper. Inspector, after selection, prints
“World: X East, Y Up, Z South”.

This map is for the **reviewer**. It is not shown to the
tester during an attempt.

---

## 4. Honest M5 validation status

**NEW PROJECT DECISION.**

Three evidence classes. They must not be collapsed.

```text
M5-AUTHOR     structured author dogfood under this protocol
              EXECUTABLE NOW
              tester = project author (one human)

M5-INDEPENDENT  38 §11 target users, 2–3 people, never
                worked on the codebase
                LIMITED / NOT YET AVAILABLE

M5-AI         supplementary review of claims, IA, ambiguity
              NOT human validation
              does not enter human pass rate
```

Checked against expected questions, then against `38`/`43`:

1. **Can one structured author session discover and fix
   blockers?**  
   **Yes, as discovery.** Author FAIL is informative,
   especially T9/T10 if on-screen copy cannot be cited.
   Fixes still follow `38` §9 / §11.4 and happen **after**
   the session, not during it.

2. **Can it satisfy the original independent-human
   evidence target (`38` §11.3 PASS)?**  
   **No.** 1/1 is not 2/3. The author is not “has never
   worked on this codebase.” Do not fabricate compliance.

3. **Does lack of external humans necessarily prevent V1
   CLOSED as a validation prototype?**  
   **No, if closure carries an explicit limitation.**  
   `43` already defined V1 CLOSED as prototype close, not
   production-ready, and already cut leftover UX rather
   than wait for elegance. Keeping V1 open forever because
   strangers are unavailable would invert that decision.  
   **Yes it prevents claiming `38` §11.3 PASS.**

4. **Wording that avoids claiming evidence we do not have**
   is in `§5`.

`38` Phase 4 still names “2–3 target users” as the
independent-human goal. This protocol is how M5 is **run
now**. Completing M5-AUTHOR does not complete M5-INDEPENDENT.

---

## 5. V1 closure wording under limited human validation

**NEW PROJECT DECISION.** Does not weaken T1–T10.

Allowed, after M5-AUTHOR + freeze-legal fixes + M4:

```text
V1 CLOSED as a finite validation prototype,
with limited human validation.

Recorded: M5-AUTHOR dogfood (this protocol).
Independent 2/3 human sample: NOT AVAILABLE.
38 §11.3 PASS: NOT CLAIMED.

The §2 promise was exercised on the live product by the
author under unaided task cards. Known tester-bias is
recorded. Remaining limitations are written down.
```

Forbidden:

```text
passed human acceptance
2/3 testers succeeded
target users who had never seen the code passed T1–T10
usability validated
first-time-user discoverability proven
AI review confirms M5
```

M5-AUTHOR **PASS** on a discoverability task (T1–T8) is
logged as author success, **not** as independent
discoverability evidence.

M5-AUTHOR **FAIL**, especially T9/T10 without on-screen
support, **is** blocking evidence (`38` §11.3 BLOCKING FAIL
“any tester,” applied to this session’s tester).

---

## 6. Tester-bias handling

The tester knows the project. Ordinary “find the button”
tests are biased. This protocol **reduces** bias. It does
not remove it.

```text
give goals, not click paths
no implementation names unless the task tests a term
  that appears on screen (hodograph, V_total, T_tilt,y)
no hints during an attempt
facilitator does not explain the UI during an attempt
record first action, wrong turns, hesitation, search/scroll
verbalize interpretation BEFORE using a control or visual
after each task, distinguish:
  a) task success
  b) discoverability (weak for this tester)
  c) interpretation
  d) scientific misunderstanding
  e) annoyance / polish
```

Author-specific extra rule for T9 / T10:

```text
Answer from the product, not from memory of the docs.
Point to on-screen sentences (quote or paraphrase
  with location) that support the claim.
Knowing the physics in one’s head is not a T9/T10 pass.
```

Mark likely prior knowledge on T1–T8 when the first action
is immediate and unsearching.

---

## 7. Session procedure

### 7.1 Setup

```text
browser        desktop viewport; running `npm run dev` app
start          reload so Guided is the first screen
input          the product only — no this protocol, no SoT
observer       records; does not help during an attempt
duration       one session, Cards 1–10 in order
instrumentation  none required
```

### 7.2 Order

Cards follow T1–T10 because later tasks need Explore, a
parcel, and a selection. Do not skip ahead. Do not show
later cards.

### 7.3 Assistance

```text
during attempt     none
after FAIL         optional diagnostic hint, labelled HINT,
                   to learn why — does not convert FAIL to
                   PASS
PARTIAL            allowed per 38: success only after
                   re-reading on-screen copy; not blocking
```

### 7.4 When an attempt ends

End the attempt when **any** of:

```text
the tester states they are done and gives the goal answer
the tester says they cannot proceed
~3 minutes of search without progress on a short card
  (T1, T4, T5, T6) or ~5 minutes on a reading card
  (T2, T7–T10), unless they are still actively reading
the tester performs an irreversible wrong lab reset that
  they cannot interpret — record and continue from a
  clean reload only if needed for later cards
```

Do not abandon the whole session because one card fails.
Finish remaining cards where possible (`§10`).

### 7.5 What not to test as acceptance

Highlight, Airflow encodings, compass/axes literacy, and
Environment-as-mode confusion are **not** T-numbers.
Record them under friction / O1 / known Environment if
they appear. Do not invent a new T.

---

## 8. Tester Card / Reviewer Key structure

**Tester Card** (shown in chat):

```text
starting condition if needed
natural-language goal / question
stop condition
```

No solution, expected control, implementation name, or
score.

**Reviewer Key** (hidden until after the attempt):

```text
T number
A-question if any
expected path / outcome on the live UI
scientific interpretation expected
pass / fail / blocker rules
evidence prompts
```

---

## 9. Blocker / friction / polish

Use existing freeze / acceptance policy. Do not turn every
annoyance into a blocker.

```text
BLOCKER
  prevents completion of a numbered acceptance task
  OR causes a materially false scientific interpretation
  OR violates an explicit scientific-honesty requirement
     (T9 / T10: stricter — failure is always blocking)
  OR otherwise meets 38 §9 + §11.4

FRICTION
  task completes, with hesitation / wrong turn / search

POLISH
  visual preference / convenience / aesthetics
  without acceptance failure
```

For a blocker **candidate** during M5:

```text
1. record evidence
2. finish the session where possible
3. do not implement during the session
4. after session: minimal-fix classification
5. only evidence-triggered blocker fixes may reopen code,
   under 38 §9 / §11.4
```

T9/T10 honesty failures reopen **copy and placement**,
never physics or new features.

Author T1–T8 success does not admit new capabilities.

---

## 10. PRE-M5 observations (not fixes)

### 10.1 O1 — viewport cardinal orientation

**Kind:** PRE-M5 OBSERVATION. Not a new T. Not a capability.

While inspecting Rotation highlight, the author wanted to
know whether apparent spatial direction was correct, and
asked whether the scene shows cardinal directions.

Live implementation:

```text
THREE.AxesHelper(2000 m) at the world origin (storm axis)
X red = East, Y green = Up, Z blue = South
no N / E / S / W labels
Inspector prints “World: X East, Y Up, Z South” only
  after a tracer is selected
```

The helper is a **mathematical world-axis gizmo**, not a
user-readable compass. The author described red/blue lines
near the central axis (appear / flicker) and could not
determine N/E/S/W from the viewport without recalling
Three.js / project conventions.

T1–T10 do **not** require naming East/South from the 3D
view. Highlight-direction checking is not an acceptance
task.

**Provisional classification (final prefers M5 evidence):**

```text
not a current T1–T10 blocker on contract
interpretation friction: axes rendered, cardinals unread
scientific-literacy only if a tester uses a wrong compass
  to justify a T7/T9 physics claim — record then
POST-V1 polish / orientation cue — do not implement now
do not add compass, labels, or a gizmo before M5
```

If a formal card is blocked *because* the tester cannot
orient, reclassify then. Do not pre-classify as BLOCKER.

### 10.2 Known Environment UX (`43` §8)

**Kind:** KNOWN V1 LIMITATION / PRE-M5 UX EVIDENCE.

```text
Header: Guided | Explore | Environment look like peers
Guided: Environment shows/hides the hodograph column
Explore: Environment opens a larger overlay on the scene
Meaning is not intuitively obvious; behavior differs
42-1 is implemented
43: not a T2 blocker on present evidence; not pre-M5 work
```

Do not reopen `42`. Do not redesign Environment before
testing. If T1/T2 exposes extra evidence, record it on
those cards.

---

## 11. AI review boundary

Allowed **after or beside** M5-AUTHOR, labelled
**AI REVIEW EVIDENCE**:

```text
scientific-claim consistency vs SoT
terminology ambiguity
information hierarchy from screenshots
likely misinterpretations
contradiction against 38 / physics docs
accessibility / readability from supplied evidence
```

Must **not** count as:

```text
human discoverability success
human hesitation / time evidence
2/3 human pass
proof that first-time users understand the system
M5-AUTHOR or M5-INDEPENDENT pass rate
```

---

## 12. Evidence templates

### 12.1 Per-card record

```text
CARD #
T# (reviewer only)
result: PASS / PASS-WITH-FRICTION / PARTIAL / FAIL
time / hesitation:
first action:
wrong turn(s):
needed hint: yes/no
interpretation before action:
interpretation after action:
scientific misunderstanding: yes/no — …
UI friction:
discoverability note (author-bias):
blocker candidate: yes/no
notes / screenshot:
```

`PASS-WITH-FRICTION` = task completed unaided, with search
or wrong turn. Maps to FRICTION, not BLOCKER.

`PARTIAL` = `38` §11.3 (success only after re-reading
on-screen copy).

### 12.2 Session summary (after Card 10 only)

```text
completed cards:
blocker failures (T# + evidence):
T9 / T10 honesty outcomes (on-screen citation?):
recurrent friction:
scientific-honesty failures:
Environment / O1 notes if they appeared:
known tester-bias limitation: author; M5-INDEPENDENT absent
38 §11.3 PASS claimed?: NO
candidate fixes: ONLY after this summary; freeze-legal only
```

---

## 13. Tester Cards

Show **one** card. Hide §14.

### Card 1

Starting condition: the app has just been loaded (first
screen).

Goal: Get into the mode where you can release your own air
parcels into the 3D scene and read measurements about them.

Stop: say when you believe you are in that mode, and how
you know.

### Card 2

Goal: Find the wind-profile diagram for this laboratory.
In your own words, what does it show? If you notice a
marker for how the storm is moving, say what you think
that marker is. You do not need to compute helicity.

Stop: a short spoken answer, pointing at what you used.

### Card 3

Starting condition: you are in the mode from Card 1.

Goal: Release one air parcel at a ground location you
choose and at an altitude you choose.

Stop: the parcel exists in the scene at that choice.

### Card 4

Goal: Make the laboratory run, pause it, change how fast
time passes, then restore the laboratory to its starting
laboratory state. After restoring, say what came back and
what did not.

Stop: you have used run, pause, speed, and restore, and
you have said what restore did.

### Card 5

Starting condition: at least two parcels are visible. If
you currently have only one, first release another at a
different place, then continue — that extra release is
allowed as setup, not as the task.

Goal: Select the specific parcel you intend, not a
different one.

Stop: you can show which one is selected and that it is
the intended one.

### Card 6

Starting condition: one parcel is selected.

Goal: Travel with that parcel in the view, then get the
original storm-scale view back. Say whether the view
recovery moved the camera, the simulation, or both.

Stop: you have followed, recovered the view, and stated
what recovery changed.

### Card 7

Starting condition: the intended parcel is selected.

Goal: Read the total velocity at that parcel, read the
named parts that add up to it, and say which part is
largest there right now.

Stop: total + the parts + a dominance statement.

### Card 8

Starting condition: the same parcel is still selected.

Goal: Find the two local rotation numbers for that parcel
right now, including their units.

Stop: both numbers and both units, from the product.

### Card 9

Goal: In your own words: is a tilting tendency the same
thing as vertical rotation that already exists? Does this
product claim that one produced the other?

Use only what the product shows. Quote or point to the
on-screen sentences you are relying on.

Stop: an answer in your words plus the on-screen support.

### Card 10

Goal: What kind of storm is this? Is it a real simulated
or forecast storm that generates itself, or something
else?

Use only what the product shows. Point to on-screen
support.

Stop: a classification in your words plus on-screen
support.

---

## 14. Reviewer Keys

**HIDDEN FROM TESTER DURING ATTEMPTS.**

### Key 1 — T1 (A1 setup)

Expected: header **Explore** (aria-pressed). Explore
laboratory: Release tracer, Inspector, Point diagnostics.
Guided is the wrong terminal mode.

Pass: unaided arrival in Explore and recognition that
release/diagnostics live there.

Fail: cannot leave Guided, or thinks Guided is the release
mode.

Blocker: cannot reach Explore at all (maps to `38` §4.2
Guided→Explore CONDITIONAL **only if** this is later an
independent-sample failure; for M5-AUTHOR, record as
author FAIL / blocker **candidate**, then classify after
session).

Assistance: none during attempt.

### Key 2 — T2 (A3)

Expected scientific meaning: hodograph = **ground-relative
environmental wind profile of this laboratory**. Naming
storm motion **C** is a pass. SRH not required.

Expected path: **Environment** if the plot is hidden
(Explore starts closed). Guided boot already shows the
column. Title “Hodograph”; `aria-label` / subtitle
“Ground-relative hodograph”; C overlay.

Pass: that meaning, from the product.

Fail: “this is the storm’s 3D wind,” “editable weather
model,” “a second storm mode.”

Known friction: Environment looks like a peer mode (`§10.2`).
Record; `43` already said not a T2 blocker on **prior**
evidence — new M5 evidence may upgrade that.

### Key 3 — T3 (A1)

Expected: **Release tracer** → set **Altitude** → click
ground → **Confirm**. Parcel appears.

Pass: intentional point + altitude.

Fail: cannot release; release at unknown altitude; thinks
click-without-arming is enough and gives up.

CONDITIONAL (`38` §4.2): Explore starting cohort if
empty-state copy is why release is undiscoverable —
author bias makes this weak; still record first action.

### Key 4 — T4

Expected: **Pause** / **Resume**, **Speed**, **Reset**
(simulation). Reset restores laboratory / tracers / time
per live Reset semantics; it is **not** Reset View.

Pass: all four actions + a correct statement of what
Reset restored (simulation, not merely camera).

Fail: cannot find controls; confuses Reset with Reset View
**and** cannot complete the restore-laboratory goal.

### Key 5 — T5

Expected: click the intended glyph; Inspector Tracer #id
matches intent. Screen-space pick.

Pass: intended parcel selected.

Fail: cannot select; repeatedly gets the wrong parcel and
cannot correct.

Viewport CONDITIONAL only if canvas size is the stated
cause (`38` §4.2) — author-only evidence cannot admit that
CONDITIONAL by itself.

### Key 6 — T6

Expected: **Follow** on, camera tracks; **Reset View**
restores storm framing; Follow turns off as live Reset
View contract. Tester states camera moved, simulation did
not.

Pass: follow + recover + that distinction.

Fail: cannot follow or recover; believes Reset View
rewound the laboratory.

### Key 7 — T7 (A2)

Expected: Inspector `V_total` and seven named
contributions. Dominance = largest |V_i| at current
position (or a clearly equivalent reading of the rows).

Pass: reads total, names seven, names a dominant part
without inventing an eighth physics.

Fail: cannot find contributions; treats Highlight tint as
the decomposition; claims the storm “chose” a component.

### Key 8 — T8 (A4)

Expected: Point diagnostics `T_tilt,y` **s⁻²**,
`ω_y,current` **s⁻¹**.

Pass: both values and both units.

Fail: cannot find them; swaps units; reads Inspector
velocity as vorticity.

CONDITIONAL (`38` §4.2): unread while parcel visible —
record; author-only cannot admit it alone.

### Key 9 — T9 (A5) — honesty, stricter

Expected: tendency ≠ existing vertical vorticity; product
does not claim T1 produced `ω_y,current`. On-screen:
“These are different quantities… T1 does not generate
ω_y,current. Same sign at this point is not causation.”

Pass: own words + **on-screen citation**. Memory of the
docs without product support = **not a pass**.

PARTIAL: gets it only after re-reading the disclaimer.

**BLOCKING FAIL** if they claim causation, collapse the
two quantities, or cannot support the distinction from
the product (`38` §11.3 any tester).

Reopen: copy/placement only (`38` §11.4).

### Key 10 — T10 — honesty, stricter

Expected: idealized / prescribed laboratory, not
simulated, forecast, or self-generating. Guided copy:
“prescribed storm-relative laboratory, not a real
supercell simulation.” Subtitle names prescribed storm
motion. Explore lacks a persistent model-class sentence
(`43` K1).

Pass: own words + on-screen citation.

**BLOCKING FAIL** if they call it a forecast, CFD, or
self-generating mesocyclone, or cannot find any honesty
label (`38` §11.3).

If they never opened Guided and stay in Explore, T10 is
the known weaker path — still blocking if they fail.

Reopen: copy/placement only. 40-E is playtest-triggered,
not pre-authorized here.

---

## 15. Existing SoT amendments

```text
38  T1–T10 wording, §11.3 PASS, §9 freeze: UNCHANGED.
    U4 remains independent-sample size, not author=2.
    Header: this file is the M5-AUTHOR protocol.
    Phase 4 independent 2–3 users remains the unmet
    M5-INDEPENDENT target.

43  Sufficiency to start M5: UNCHANGED.
    V1 CLOSED prototype meaning: add explicit limited-
    human-validation clause via this file; do not claim
    §11.3 PASS from author dogfood.
    Environment known limitation: UNCHANGED.
    Successor for running M5: this file.

44  Untouched. Not this playtest.
```

---

## 16. Anti-claims

```text
this file does not include production implementation
this file does not begin the playtest
this file does not reopen M3
this file does not add capabilities
this file does not weaken T1–T10
1/1 author is not 2/3 independent PASS
AI review is not a human tester
O1 is not an automatic V1 blocker
Environment UX is not reopened before the session
compass / axis labels are not authorized
fixes happen after the session, freeze-legal only
```

---

## 17. Documentation authority

```text
38  promise, A1–A5, T1–T10, freeze, original PASS
43  pre-M5 sufficiency; Environment known limitation
45  this file: how to run M5-AUTHOR; what it may claim
```

---

## 18. Compact lock-in

```text
M5-AUTHOR              executable now; this protocol
M5-INDEPENDENT         NOT YET AVAILABLE
M5-AI                  supplementary only
38 §11.3 PASS          NOT CLAIMABLE from this session
T1–T10                 unchanged; all attemptable
FREEZE                 ACTIVE
PRE-TEST SRC CHANGE    NONE
PLAYTEST               NOT STARTED
O1                     axes ≠ readable compass; wait on M5
ENVIRONMENT            known limitation; do not redesign now
IMPLEMENTATION         NONE
```

---

## 19. Implementation

This document does not include implementation.
Production `src/**` remains unchanged.
The playtest itself is out of scope for this file.
