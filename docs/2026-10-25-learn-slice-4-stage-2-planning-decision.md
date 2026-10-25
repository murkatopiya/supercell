# Learn Slice 4 — Stage 2 architectural basis and planning authorization

## Status

| Field | Value |
| --- | --- |
| Document type | DECISION RECORD |
| Approval state | APPROVED |
| Authority status | ACTIVE |
| Freeze mode | MUTABLE |
| Authority scope | Acceptance of Stage 2 architectural review as a basis with refinements and authorization of bounded planning documentation only |
| Parent authority | Human owner instruction below; [Slice 4 Design](ux/2026-10-25-learn-slice-4-compare-the-flow-design.md), [human-review Decision](2026-10-25-learn-slice-4-human-review-decision.md), [Stage 1 acceptance](2026-10-25-learn-slice-4-stage-1-technical-acceptance-decision.md); [Governance v1](DOCUMENTATION_GOVERNANCE.md) under its [adoption](2026-10-11-documentation-governance-v1-adoption-decision.md) and [amendment](DOCUMENTATION_GOVERNANCE_V1_AMENDMENT.md) under its [adoption](2026-10-11-documentation-governance-v1-amendment-bootstrap-decision.md) |
| Current project state | [PROJECT_STATUS](PROJECT_STATUS.md) |
| Supersedes | Earlier Stage 2 range-input / provisional scale-40 proposals only within the accepted refinements; no implementation gate is opened |
| Superseded by | None |

## Decision authority

Human project owner communicating the consilium's architectural review and
authorizing limited documentation preparation. Recorded by Agent. This is not
an agent-originated approval or execution authorization.

## Scope and Decision

Record **Human architectural review: APPROVED AS BASIS WITH REFINEMENTS** for
the preceding read-only Stage 2 review. Accept the eleven refinements reproduced
below as the bounded architectural basis. Authorize preparation of the
[Stage 2 Implementation Plan](ux/2026-10-25-learn-slice-4-stage-2-implementation-plan.md),
this required Decision receipt and necessary PROJECT_STATUS consequences only.

Accepted refinements: explicit Inspect/Place B and click/tap-only placement; four
relative East/North buttons at 100 m without coordinate rounding, shorter final
boundary steps and unavailable outward actions; page scrolling and gesture
cancellation with touch policy set before gesture; secondary translucent area at
y=1000 visible only in Place B; direct y=1000 picking without ordinary external
clamping/grid snapping and explicit numerical boundary policy; one composition,
t=0, original A and atomic B snapshots; scale 80 and a candidate stable whole-area
camera requiring later visual review; independent Reset View/Reset Probes;
separate invalid/unavailable/zero handling; no sign-change hint or completion gate.

INTRODUCED: bounded planning of static spatial observations and UI interaction.
NOT INTRODUCED: physics/model semantics, integration, field-time evolution or
scientific authority changes. NOT CLAIMED: implementation, developer verification,
scientific qualification or acceptance of the newly drafted plan's detailed choices.

## Authority targets and reviewed identity

Targets: new mutable plan, semantic type DESIGN, initially PROPOSED / INACTIVE /
MUTABLE; this mutable DECISION RECORD owning the human planning permission and
accepted architectural refinements; PROJECT_STATUS as sole current-state owner.
The previously accepted Stage 1 Decision and original Design retain their
historical meaning; no edits to them are required for this bounded recording.

The reviewed object is the preceding read-only architectural report as a basis,
not an approved final implementation plan or source implementation. No exact-byte
identity, freeze or pin was supplied or inferred. Detailed ray tolerances, event
thresholds, button focus policy and camera margin in the new plan are proposals
for review; they do not become owner-approved merely by appearing in this record.
Frozen identities were verified through the index anchored at accepted snapshot
`8d916037058a919560b6c2d01ae65823589e96bb` before documentation edits. No frozen
record is a modification target and the checker creates no human authority.

## Authorization consequence

Draft and mechanically check documentation only, then stop for human review and
separate explicit implementation permission. Stage 1 remains technically accepted
within its recorded limitations. Stage 2 implementation remains NOT AUTHORIZED;
approval as architectural basis does not approve the new plan or permit execution.

## Explicitly NOT authorized

Production code, tests, Demo, physics, data, frozen records or scientific-contract
changes; Simulation, scientific campaigns or evidence collection; implementation,
commit, push or deploy. No retrospective scientific qualification or later-stage
permission is created. Do not resolve proposed numerical/camera/touch choices by
performing unapproved experiments during drafting.

## Date

2026-10-25.

## Source language

Russian (ru), with English UI/API names.

## Source instruction — original

Bounded verbatim excerpt; greeting omitted.

> консилиум рассмотрел read-only архитектурный review Learn Slice 4 — Stage 2 Explore the Field.
>
> **Human architectural review: APPROVED AS BASIS WITH REFINEMENTS.**
>
> Разрешаю ограниченную подготовку Stage 2 Implementation Plan и необходимую документационную фиксацию решения согласно AGENTS.md и DOCUMENTATION_GOVERNANCE.md.
>
> Принятые уточнения:
>
> 1. Использовать явные режимы Inspect / Place B. В Place B одиночный click/tap устанавливает B; drag не перемещает пробник. Escape и Done moving B завершают режим.
> 2. Клавиатурная альтернатива — четыре осевые кнопки относительного перемещения по East/North с шагом 100 м, без принудительного округления координат.
> 3. Последний шаг до границы может быть короче 100 м. После достижения границы движение наружу недоступно. Кнопки доступны вне режима Place B и не зависят от WebGL.
> 4. В режиме Place B обеспечить возможность вертикальной прокрутки страницы. Scroll, pointercancel и многопальцевый жест отменяют размещение. Touch-политику согласовать с OrbitControls до начала жеста.
> 5. Добавить визуально второстепенную полупрозрачную область размещения на плоскости y=1000 м, видимую только в Place B. Это UX-ограничение, не физическая граница модели.
> 6. Picking выполнять непосредственно на y=1000 м; внешний клик не clamp-ить и не привязывать к сетке. Численную обработку пограничных значений определить явно.
> 7. Сохранить одну Demo-композицию, t=0, исходный snapshot A и атомарное обновление snapshot B.
> 8. Сохранить масштаб стрелок 80 display м на 1 м/с. Подготовить кандидат стабильного общего кадра для A, всей области B и стрелок. Камера и читаемость требуют последующего визуального review.
> 9. Reset View изменяет только камеру; Reset Probes возвращает исходный B, завершает Place B и сохраняет камеру.
> 10. Сохранить отдельные состояния invalid placement, unavailable measurement и valid zero vector. Не допускать stale arrows, guides и measurements.
> 11. Не раскрывать заранее положение смены знака Vertical и не вводить обязательный completion gate.
>
> План должен включать конкретные файлы и API, ownership, state transitions, pointer/touch lifecycle, доступность, тестовую матрицу, responsive/WebGL checks, stop conditions и открытые вопросы.
>
> Не изменяй production code, тесты, Demo, физику, данные, frozen records или научные контракты. Не запускай Simulation, научные кампании или evidence collection. Без commit, push и deploy.
>
> Верни путь к новому плану, изменённые документы, предварительные решения и оставшиеся риски.
>
> **Stage 2 implementation NOT AUTHORIZED. Остановись до отдельного human review и разрешения на реализацию.**

## Source instruction — English translation

The consilium considered the read-only architectural review of Learn Slice 4 —
Stage 2 Explore the Field. Human architectural review: APPROVED AS BASIS WITH
REFINEMENTS.

I authorize bounded preparation of a Stage 2 Implementation Plan and necessary
documentation recording under AGENTS.md and DOCUMENTATION_GOVERNANCE.md.

Accepted refinements:

1. Use explicit Inspect/Place B modes. In Place B a single click/tap places B;
   dragging does not move the probe. Escape and Done moving B end the mode.
2. Keyboard alternative: four relative East/North axis buttons at 100 m steps,
   without forced coordinate rounding.
3. The final step to the boundary may be shorter than 100 m. After reaching it,
   outward movement is unavailable. Buttons work outside Place B and without WebGL.
4. Allow vertical page scrolling in Place B. Scroll, pointercancel and multitouch
   cancel placement. Coordinate touch policy with OrbitControls before a gesture starts.
5. Add a visually secondary translucent placement area at y=1000, visible only in
   Place B. This is a UX limit, not a physical model boundary.
6. Pick directly on y=1000; do not clamp external clicks or snap them to a grid.
   Define numerical treatment of boundary values explicitly.
7. Retain one Demo composition, t=0, the original A snapshot and atomic B updates.
8. Retain arrow scale 80 display metres per 1 m/s. Prepare a stable overall-frame
   candidate for A, the entire B area and arrows. Camera/readability need later visual review.
9. Reset View changes only camera; Reset Probes restores original B, ends Place B
   and preserves camera.
10. Keep invalid placement, unavailable measurement and valid zero vector distinct.
    Do not allow stale arrows, guides or measurements.
11. Do not reveal the Vertical sign-change location beforehand or require a completion gate.

Include concrete files/APIs, ownership, state transitions, pointer/touch lifecycle,
accessibility, test matrix, responsive/WebGL checks, stop conditions and open questions.

Do not change production code, tests, Demo, physics, data, frozen records or
scientific contracts. Do not run Simulation, scientific campaigns or evidence
collection. No commit, push or deploy.

Return the new plan path, changed documents, preliminary decisions and remaining
risks. Stage 2 implementation NOT AUTHORIZED. Stop before separate human review
and implementation authorization.
