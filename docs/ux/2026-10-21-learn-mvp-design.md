# Learn MVP — bounded architecture and UX design

## Status

| Field | Value |
| --- | --- |
| Document type | DESIGN |
| Approval state | PROPOSED |
| Authority status | INACTIVE |
| Freeze mode | MUTABLE |
| Authority scope | Proposed presentation, interaction and session lifecycle for one introductory Learn experience; no scientific/model authority |
| Parent authority | [Product decisions and documentation authorization](../2026-10-21-learn-mvp-documentation-decision.md); inherited contracts in §9 |
| Current project state | [PROJECT_STATUS](../PROJECT_STATUS.md) |
| Supersedes | None |
| Superseded by | None |

## 1. Purpose and decision boundary

The intended first achievement is: a visitor can identify a passive computational
marker, follow its motion in prescribed flow, and explain what its recorded path
shows. Clicking through instructions is not evidence of understanding.

The parent Decision accepts the product boundaries and authorizes documentation.
It does not approve this newly authored design, its copy, seed selection or runtime
behavior. All detailed choices below are proposals for review. The four states,
equal access, disposable sessions, prepared choices and unchanged computation
are accepted product constraints, not shipped capabilities.

This document is placed in `docs/ux/` as a bounded cross-surface DESIGN proposal,
not a competing current UI SoT. The [earlier roadmap](accessible-science-roadmap.md)
remains non-authoritative background; it is not adopted or superseded here.

## 2. Evidence class and scientific invariants

Source inspection identifies existing mechanisms, not a new numerical result:

- [Demo composition](../../src/app/composeDemoTracerSimulation.ts) builds seven
  velocity operands and the existing Euler integrator.
- [Explore factory](../../src/app/createExploreLab.ts) and
  [Guided factory](../../src/app/createGuidedLab.ts) use that common composition.
- [Session](../../src/explore/ExploreTracerSession.ts) owns releases and seed-list
  replay; [history](../../src/simulation/TracerPathHistory.ts) records positions/time.
- [Fixed-step advance](../../src/ui/tracer/advanceLaboratoryFixedStep.ts) steps the
  simulation before recording; [viewport](../../src/ui/tracer/TracerViewport.tsx)
  consumes fixed steps according to presentation time.
- Guided is an existing three-experiment catalog, not this lesson. Its retained
  entry is not a public landing CTA in [App](../../src/app/App.tsx).

### INTRODUCED

No scientific/model semantics. Proposed UI states, copy, prepared-position selection,
navigation and session-disposal behavior only.

### NOT INTRODUCED

No new physics, dataset, diagnostic, integrator, interpolation, numerical tolerance,
storm reconstruction, cloud model, thermodynamics, continuity solver or prognostic
vorticity. No lesson engine, catalog infrastructure, persistence or simultaneous labs.

Learn uses only existing Demo configuration. Explicitly select
`StormRelativeLaboratory`, Demo C = (10, 0) m/s eastward/northward, existing Euler
and dt = 0.1 s, the existing atmospheric tracer-domain policy and recorded history.
Do not rely on the lower-level ground-relative default. These values are inherited
from [Demo configuration](../../src/scenario/DEMO_SCENARIO.ts), not newly tuned.

Explore continues to support its existing environments and tools; this does not
restrict Explore to Demo. Sharing an implementation does not require sharing a
mutable Simulation instance between visits. Changing a Learn start never changes
the field. Show computed paths only. Do not retime trajectory vertices, interpolate
invented history or alter physics to fit a narrative. Playback speed is presentation.

### NOT CLAIMED

No historical-air trajectory, full storm dynamics, generated rotation or numerical
qualification is established. Ground termination is a domain rule, not a cold pool.
The ground-reference plane is not a map of real terrain. T1, C editing and diagnostic
decomposition are absent from this lesson, not removed from shared capabilities.
Runtime and user checks below are pending, not evidence of successful teaching.
Scientific gates remain exactly as resolved by PROJECT_STATUS: Phase P CLOSED /
INVALID CONTROL; P2 not certified; further gated execution and Main L1 not authorized.
The phrase 'campaigns remain closed' does not reclassify P2 as a completed campaign.

## 3. One scene, four states

Persistent navigation: Learn / Explore / return to mode choice, available immediately.
No lesson completion, knowledge check, registration or progress storage gates access.
Landing gives both entries comparable prominence. Learn completion merely invites
an already available transition. No hidden laboratory runs behind Landing.

| State | Scene | Available actions | Transition |
| --- | --- | --- | --- |
| 1. Осмотреться | Static reference plane and up direction; then A with start/height guide | Reveal marker, start, global navigation | Start enters state 2 |
| 2. Проследить движение | A, actual recorded trail, distinct start marker | Pause/resume, repeat A, recover view, compare, global navigation | Compare pauses and enters state 3 |
| 3. Сравнить вместе | A plus selectable B previews; after launch two markers/trails | Choose suggested B by marker or accessible control; launch both; pause; repeat; recover view | Voluntary independent attempt enters state 4 paused |
| 4. Попробовать самому | Same scene, a previously unexplained B choice, A retained as reference | Choose another B; launch both; pause; repeat; optional explanation; restart lesson; global navigation | No scored completion; repeat or leave freely |

Subcards reveal one idea at a time; they are not seven separate screens. Rereading
copy preserves the experiment. Restarting the lesson is a separate labelled action
with loss disclosure. No compulsory reading delay or automatic pass condition.

Candidate first height: 1000 m, inherited from the existing release default.
Keep a common height across A/B for the first comparison; no height editor in MVP.
Exact A and B coordinates, number of B choices (at least one guided and one new
choice), camera framing and observation duration remain open until §8 checks.
Existing S1 is a candidate, not an approved lesson seed or inherited Guided claim.
Prepared coordinates belong to lesson presentation/configuration mapping, never
mutations of canonical Demo fixtures. No free placement in Learn; Explore retains it.

Preview markers are labelled start choices, visually distinct from live tracers.
Do not show decorative airflow populations alongside the first tracer. A/B names
and shapes distinguish objects without relying on color. Minimal plane/up/height
guides replace the full technical grid only within the proposed Learn surface.
No arbitrary cloud or terrain overlay. A reference origin is not asserted to be
the physical center of a real storm.

## 4. Proposed complete primary copy (Russian review text)

These are proposed user-facing strings, not approved translations or a new
localization framework. Shipping language and final copy review remain open.
Braces denote values read from the actual selected configuration, never fabricated.

### Landing and persistent identity

- Learn: «Познакомься с метками и проследи их движение в учебной модели».
- Explore: «Самостоятельно исследуй движение и используй инструменты лаборатории».
- Scene label: «Demo · учебная модель».
- Navigation: «Learn», «Explore», «К выбору режима».

### State 1 — scene, then marker

**1a — Пространство**

> Перед тобой трёхмерное пространство, где мы будем исследовать движение воздуха
> с помощью компьютерной модели. Нижняя плоскость обозначает уровень земли в
> модели, а направление вверх — высоту.

Action: «Показать метку». Optional clarification: «Это ориентир, а не карта
реальной местности».

**1b — Как увидеть движение**

> Сам воздух здесь не виден. Чтобы проследить движение, мы используем
> компьютерную метку — трассер.

Action: «Как она движется?» (reveals the next short card, no stepping).

**1c — Метка в потоке**

> В этой модели поток задан заранее. Он переносит метку, а метка сама не меняет
> поток. Поэтому её называют пассивной.

Action: «Запустить». Height label: «Старт: {height} м над уровнем земли в модели».
Optional: «Метка — не капля и не настоящая частица воздуха. Значок сделан крупным,
чтобы его было видно».

### State 2 — observe and read the path

**2a — Следи за меткой**

> Линия остаётся там, где метка уже побывала. Останови движение, чтобы рассмотреть её.

Action: «Пауза»; while paused: «Продолжить». Legend: «Старт», «Метка сейчас»,
«Пройденный путь». Secondary actions: «Повторить с начала», «Вернуть вид».

**2b — Что показывает линия?**

> Линия показывает уже пройденный путь метки. Этот путь называется траекторией.
> По мере движения метки линия становится длиннее.

Reflection: «Покажи, где метка сейчас и где она была раньше. Как ты это определил?»
Action: «Сравнить два старта». Optional explanation of motion: «На каждом маленьком
шаге программа вычисляет новое положение по заданной скорости потока там, где
находится метка».

### State 3 — guided choice and simultaneous replay

**3a — Выбери второй старт**

> Выбери отмеченное место для метки B. Она начнёт на той же высоте, что и A,
> но в другом месте по горизонтали.

Controls: matching named start markers and ordinary radio/buttons; suggested choice
has a text cue, not color alone. No new physical claim is encoded by the marker name.

**3b — Начнём вместе**

> Обе метки начнут движение заново и одновременно. Старые следы исчезнут.
> Поток останется тем же.

Action: «Запустить обе с начала». Selection itself does not launch or erase history.

**3c — Посмотри на два пути**

> Мы изменили место старта, а не поток. Что ты замечаешь у двух путей?

Actions: «Пауза / Продолжить», «Повторить обе с начала», «Попробовать самому».
Do not append 'higher', 'faster', 'more curved' or an expected difference until verified.

### State 4 — independent choice and optional continuation

**4a — Теперь выбери сам**

> Выбери для B другое место, которое мы ещё не разбирали. Запусти обе метки
> и расскажи, что показывает каждая линия.

Action: «Запустить обе с начала». Adjacent disclosure: «Новый запуск заменит
текущие следы». No suggested correct trajectory or mandatory answer.

**4b — Что можно заключить?**

> Мы изменили место старта. А изменилось ли само движение воздуха, заданное в модели?

This optional reflection distinguishes changed initial conditions from a changed
prescribed velocity field; it is not a mandatory test or a progression gate.

> Что ты узнал о движении меток? Можно ли по этому опыту сказать, как двигался
> воздух внутри конкретной настоящей грозы?

Optional «Показать пояснение»:

> Мы наблюдали вычисленные пути в заданном потоке Demo. Это не измеренные пути
> воздуха в настоящей грозе.

**4c — Исследовать дальше**

> В Explore можно самому размещать метки и выбирать другие среды и инструменты.
> Переход начнёт новый сеанс; эти метки и следы не сохранятся.

Actions: «Перейти в Explore», «Продолжить здесь», «Начать знакомство заново».
No 'passed', score, completion certificate or unlock.

### Context and recovery copy

- If accelerated playback is selected: «Показ ускорен в {factor} раз. Скорость
  воздуха в модели от этого не меняется». Factor comes from actual playback state.
- Pending choice: «Это место будущего старта, а не уже запущенная метка».
- View recovery: «Вернуть вид»; explanation: «Метки и время опыта не изменятся».
- If actual domain termination occurs: «Метка достигла нижней границы модели.
  Здесь её путь заканчивается». Show only from actual lifecycle state.
- Offscreen: offer view recovery, not 'the tracer disappeared'; no fabricated event.
- Exit with work: «Перейти в {destination}? Метки, следы и настройки этого сеанса
  не сохранятся». Buttons: «Остаться», «Перейти».
- Lesson restart with work: «Начать знакомство заново? Текущие метки и следы
  будут удалены». Buttons: «Остаться», «Начать заново».

## 5. Interaction, cognitive load and accessibility

One new meaning and one primary action at a time. Use short cards, not stacked
explanatory sections. Optional detail never gates the next action. No T1 or C
unavailability notices: those concepts are not introduced. No full-laboratory shell
under a spotlight tour. No coordinate lesson before observing motion.

Prepare a useful fixed camera; require no orbit gesture. Proposed optional side view
and recover-view buttons must preserve simulation state. No compulsory camera flight.
Start paused; one supported playback speed is enough. Choose 1x or 5x after checking
legibility; no new timestep. Pause remains available. A future automatic pause may
control presentation, never masquerade as detection of an unverified physical event.

Desktop-first baseline: keyboard-operable navigation, start choices and time controls;
visible focus; logical focus movement to a new state heading without per-frame
focus theft; modal focus containment and restoration on cancel. Match keyboard and
scene choices to identical coordinates. Do not use screen pixels as physical units.
Provide text labels as well as color and shape, readable contrast over the actual
scene, and no obligatory precise trail picking. Verify at zoomed text and constrained
desktop widths. Announce selected start and pause state, not every simulation step.
A concise optional text readout may expose actual start/current height and time;
it must use existing values and not invent a new diagnostic.

This is not certification of full 3D accessibility or mobile support. Target viewport,
focus behavior, contrast and the non-pointer path require explicit verification.

## 6. Proposed architecture and session lifecycle

Use a small Learn shell and local state, not a general lesson platform. Separate
lesson phase, pending B choice and view state from physical state. The scene remains
an observer. Reuse the existing composition and stepping/recording implementation;
do not fork App, Simulation, history or a second requestAnimationFrame policy.

| Existing mechanism | Reuse | New work requiring later authorization |
| --- | --- | --- |
| Demo composition / Simulation / integrator / domain | Existing unchanged scientific behavior | Explicit Learn composition adapter, no fallback frame/C |
| ExploreTracerSession / history | Releases and simultaneous seed replay | B-choice adapter and reviewed replacement lifecycle |
| ExplorePointReleaseOrchestration / scene slots | Synchronize particles, history lanes, glyph slots | Prepared-coordinate path; no fake mouse clicks |
| TracerViewport / TracerScene | Existing stepping, trail rendering and camera lifecycle | Narrow Learn presentation options and start/height annotations |
| Runtime controls | Existing pause, repeat and playback semantics | Minimal controls without technical panel |
| App navigation / ModeIdentity | Existing lifecycle entry points | Equal mode entries, exit guard, complete disposal |
| Guided | No modification | None in this slice |

**Technical risk — replacing B is not Reset.** Before implementation, a separate
bounded contract is required for coordinated updates of starting markers/seeds,
the computational session, recorded history and scene objects. Existing Reset
replays the current seed list; it does not establish this replacement contract.

The current release tool derives points from a ray/ground intersection; a button
that selects coordinates is not already provided. Selection must remain a preview
until launch. On launch, while paused, the adapter installs exactly A and selected B,
keeps particles/history/scene slots aligned, invokes existing seed replay at t=0,
then resumes. Reset does not itself replace seeds. Exact replacement operations,
identity clearing, failure handling and accumulator reset need implementation design
review. Do not mutate canonical fixtures, silently keep old B lanes, or replay an
old late-birth schedule. A cancelled selection preserves the previous experiment.

Mode lifecycle: Landing has no active lab; entering either mode creates one fresh
session. Exit requests pause presentation while deciding. Cancel restores prior
pause/focus and retains work. Confirm disposes the old viewport/listeners/lab and
all associated history, selection, pending input, camera, lesson and experiment
override state before creating the destination. At no point run two laboratories.
Return to Landing disposes without creating another lab. No results or progress
are persisted or transferred. Entry into the already active mode is a no-op.

Loss guard proposal: warn when traces, releases, a user-selected pending start,
changed experiment parameters or other user-created work would be discarded.
An untouched introductory scene needs no redundant confirmation. Centralize this
predicate for mode switch and return-to-choice. Its exact coverage of drafts and
view-only changes remains a review item; absence of traces alone is not sufficient.
No browser-close interception is proposed by this document.

Proposed fresh Explore default: existing default environment and prescribed C;
the exact resetting of App-level remembered environment/C overrides must be agreed
before implementation. Within an active Explore visit, retain all existing controls
and computational semantics. Navigation changes do not authorize altering scientific
behavior, restricting tools or modifying Guided.

## 7. Claims and boundaries in the UI

| Claim / visual | Owning basis | Required protection |
| --- | --- | --- |
| Passive marker | [Parcel basics](../physics/01-parcel-basics.md), Simulation | Not droplet, molecule, thermodynamic parcel or force |
| Recorded path | [History contract](../rendering/14-tracer-path-history.md) | Past samples, not future prediction or a vortex tube |
| Plane/height | [Coordinates](../physics/00-coordinate-system.md), [reference UI](../ui/09-world-coordinate-reference.md) | Model datum, not terrain map; no alternative coordinates |
| Different start, same flow | [Seeding](../architecture/18-explore-arbitrary-seeding.md) | No guaranteed dramatic difference or inherited mechanism story |
| Prescribed Demo | [Model class](../architecture/30-model-class-decision.md) | No generated mesocyclone, observed storm reconstruction or forecast |
| Speed | [Runtime controls](../rendering/02-tracer-runtime-controls.md) | Playback speed differs from air velocity |

No photograph-to-flow morph that implies a measured reconstruction. No path-shape
conclusion selected before seeing verified behavior. Conditional event copy must
be driven by actual state, not lesson progress. All wording and visuals are reviewed
together; a disclaimer does not repair a misleading animation.

## 8. Mandatory checks and open decisions

These are planned checks, not permission to execute them and not completed evidence.
Before asserting particular observed outcomes, record build/configuration identity,
frame/C, seeds, dt, playback speed, observation interval, camera and actual observation
in a bounded evidence/review record. Developer checks and UX findings remain separate
from scientific qualification. No P/P2/Main L1 campaign is invoked by this plan.

### Runtime / browser checks

1. Verify A and all candidate B choices on unchanged Demo; select a readable short
   interval without promising specific curvature, height ordering or physical cause.
2. Verify current/start/trail distinction, depth perception, offscreen recovery and
   ground termination; no claims inferred from projected screen direction alone.
3. Verify simultaneous reset, no old trail contamination, same seeds/field and
   stepping path as Demo Explore; use existing developer contracts, no new tolerance.
4. Verify pause, resume, help, playback speed and disposal; no hidden simulation,
   animation confusion or second scheduler after a mode switch.
5. Verify keyboard/mouse equivalence, focus, readable contrast, text zoom, camera-free
   completion and loss warning/cancel behavior including changed parameter drafts.
6. Verify Explore retains its tools and within-session semantics; Guided remains
   untouched and unavailable as a newly published entry.

### Small qualitative user check

Proposed first round: 4–6 new visitors unfamiliar with the project. Observe without
coaching; log help separately. Ask the visitor to identify current position and past
path, explain motion in their own words, and choose a previously unexplained start.
Offer the explanation after their first account. Record independent success, success
with help, mechanical completion with misconception, and inability to continue.
No score or claim of statistically established efficacy.

For an exploratory comparison, use different first-time visitors for Learn versus
short guidance in Demo Explore; do not mistake practice effects for interface gains.
Record tasks, builds, assistance and observations. Repeated failure to distinguish
marker/path or transfer understanding triggers redesign. No clear benefit over the
simpler route triggers reconsideration of separate Learn. Substantial duplicate
computation or dangerous Explore changes triggers architecture reconsideration.

### Open before design approval / implementation

- Exact prepared positions, guided suggestion and unseen independent choices.
- Common height, camera views, visible interval and playback speed.
- Shipping language and final scientific/plain-language copy review.
- Seed replacement adapter, render-slot synchronization and error handling.
- Fresh Explore defaults and precise user-work loss predicate.
- Supported desktop sizes and accessibility acceptance details.
- Concrete authority reconciliation in §9, design review/approval and separate
  implementation authorization. No seed/camera choice is frozen here.

## 9. Owning-authority reconciliation and next gates

| Owning document | Relationship / needed disposition |
| --- | --- |
| [UI navigation](../ui/07-app-navigation-and-mode-entry.md) | Existing public entry remains unchanged. Future Learn/Explore entries and disposal need an explicit bounded successor/amendment or permitted update; this proposal does not supersede it. |
| [Explore/Guided split](../architecture/16-explore-guided-interaction-architecture.md) | Clarify Learn's separate UI scope while retaining experience/physics separation. |
| [Guided catalog](../architecture/17-guided-experiment-catalog.md), [runtime](../architecture/20-guided-runtime-architecture.md) | Keep three experiments, identities and canonical fixtures; no rename, fourth entry or publication. |
| [Seeding](../architecture/18-explore-arbitrary-seeding.md), [domain](../architecture/11-ground-atmospheric-domain-policy.md), [history](../rendering/14-tracer-path-history.md) | Inherit semantics; review prepared-selection adapter without redefining Reset or domain termination. |
| [Scene controls](../ui/08-scene-toolbar-and-control-states.md), [coordinates](../ui/09-world-coordinate-reference.md) | Agree narrow Learn display/control scope and accessibility. |
| [How It Works](../ui/12-how-it-works-and-onboarding.md), [User Guide](../ui/16-user-guide.md) | Existing help is not a tutorial owner; Learn is not silently added under the former tutorial exclusion. Reconcile help/navigation wording later. |
| [Model class](../architecture/30-model-class-decision.md), [public T1](../architecture/62-trajectory-tilting-explorer-v1.md) | No scientific extension or diagnostic change; all parent exclusions retained. |

No existing owning authority is edited or superseded in this documentation slice.
Classify freeze mode and identity before any later change; exact-byte artifacts
require external Decision/Status/successor mechanisms. New semantic requirements
outside parent scope require SPECIFICATION CHANGE REQUIRED, not a UI workaround.

Next boundary: human review of this proposed design and its open choices, explicit
resolution of affected UI authority, and separately bounded authorization before
implementation or runtime/user execution. Do not infer those permissions from the
parent documentation decision. Later release/publication is also a separate action.

Cold-start route: repository README → PROJECT_STATUS → parent Decision → this
proposal → owning contracts and planned evidence. The Decision contains the human
instruction and translation; chat history is not required to recover its boundaries.
