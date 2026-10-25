# Learn Slice 4 — documentation-only authorization

## Status

| Field | Value |
| --- | --- |
| Document type | DECISION RECORD |
| Approval state | APPROVED |
| Authority status | ACTIVE |
| Freeze mode | MUTABLE |
| Authority scope | Bounded authorization to draft Compare the Flow Design for human review; no implementation authority |
| Parent authority | Human project owner instruction below; [Governance v1](DOCUMENTATION_GOVERNANCE.md) under its [adoption](2026-10-11-documentation-governance-v1-adoption-decision.md), and [amendment](DOCUMENTATION_GOVERNANCE_V1_AMENDMENT.md) under its [adoption](2026-10-11-documentation-governance-v1-amendment-bootstrap-decision.md) |
| Current project state | [PROJECT_STATUS](PROJECT_STATUS.md) |
| Supersedes | None |
| Superseded by | None |

## Decision authority

Human project owner acting as Learn product decision-maker and authorizer of
bounded documentation work. Recorded by Agent. This records the instruction,
not approval of the subsequently drafted Design or scientific qualification.

## Scope and Decision

Accept the preceding read-only pedagogical audit as a basis for designing Learn
Slice 4, Compare the Flow. Authorize preparation of one bounded Design for later
human review, this required Decision receipt and the necessary PROJECT_STATUS
navigation consequence. Preserve all twelve pedagogical constraints in the source
instruction; mark the interaction rectangle and common arrow scale preliminary.
All further detailed architecture, copy and verification criteria remain proposals.

INTRODUCED: documentation of static spatial velocity observation using unchanged
Demo. NOT INTRODUCED: new scientific/model semantics or expanded inference scope.
NOT CLAIMED: model qualification or verification of a future implementation.

## Authority targets and reviewed identity

Targets: [new Design](ux/2026-10-25-learn-slice-4-compare-the-flow-design.md), this
mutable DECISION RECORD and mutable PROJECT_STATUS. Design is PROPOSED / INACTIVE /
MUTABLE; this instruction supplies no reviewed Design byte identity or approval.
No pin, freeze or supersession is requested. Prior audit acceptance is acceptance
as a design basis, not acceptance of an evidence package or scientific classification.

Pre-edit classification: new Design owns only the proposed lesson architecture;
this Decision owns the human documentation permission; PROJECT_STATUS alone owns
project-wide current state/navigation. Frozen foundations remain untouched.
Governance v1 retains its adoption digest; amendment pins were verified against
the index recovered from accepted snapshot
`8d916037058a919560b6c2d01ae65823589e96bb`, not inferred from current index bytes.

## Authorization consequence

Draft and check documentation within the named targets. Stop for human review
and a separate explicit implementation authorization. The fixed pedagogical
constraints do not activate this proposed Design as implementation authority.

## Explicitly NOT authorized

Production code, tests, physics, data, baseline, frozen-record or existing
scientific-contract changes; Simulation execution; scientific campaigns or new
evidence collection; implementation, commit, push or deploy. No later Learn
stage or scientific research gate is opened. Documentation checks do not grant
execution or scientific qualification authority.

## Date

2026-10-25.

## Source language

Russian (ru), with English product/API names.

## Source instruction — original

Verbatim bounded instruction; greeting omitted.

> консилиум принимает результаты read-only педагогического аудита как основу проектирования Learn Slice 4 — Compare the Flow.
>
> **Разрешаю только подготовку Design-документа для последующего человеческого review. Реализация не разрешена.**
>
> Цель урока: показать, что локальная скорость зависит от пространственной точки в одном стационарном Demo-поле при фиксированном модельном времени.
>
> Зафиксированные педагогические решения:
>
> 1. Стартовые точки: A=(0,1000,4000) м, B=(2400,1000,0) м.
> 2. Обе точки — неподвижные пробники, не частицы воздуха.
> 3. Одна Demo-композиция в StormRelativeLaboratory, t=0.
> 4. B перемещается по горизонтальной плоскости y=1000 м.
> 5. Предварительная область взаимодействия: x=1500…5500 м, z=−1000…1000 м.
> 6. Предпочтительный ввод: явный Move B с установкой по клику и доступная клавиатурная альтернатива.
> 7. Две независимые 3D-стрелки с единым предварительным масштабом 40 м на 1 м/с.
> 8. Постоянно видимые Speed и Vertical для A/B; Eastward и Northward — по раскрытию, если это улучшает читаемость.
> 9. Никаких Simulation.step, интегратора, истории траекторий или временной эволюции.
> 10. Основная учебная цель: пространственная неоднородность локальной скорости.
> 11. Вторичное необязательное открытие: Vertical может пройти через ноль при ненулевом полном модуле скорости.
> 12. Не раскрывать заранее местоположение смены знака и не превращать её поиск в обязательный сценарий.
>
> Подготовь bounded Design согласно AGENTS.md и DOCUMENTATION_GOVERNANCE.md.
>
> Design должен включать:
>
> - учебную последовательность и точный пользовательский текст на английском;
> - состояния интерфейса и взаимодействие с камерой;
> - координатные и научные инварианты;
> - архитектуру статической сессии и повторное использование компонентов;
> - владение двумя стрелками, RAF, listeners и cleanup;
> - обработку недоступных измерений, границ взаимодействия и невалидного ray-plane intersection;
> - клавиатурную доступность, mobile и responsive UX;
> - критерии проверки и технической приёмки;
> - открытые вопросы и отдельно помеченные предварительные решения.
>
> Не изменяй production code, тесты, физику, данные, frozen records или существующие научные контракты. Не запускай Simulation, научные кампании или сбор доказательств. Без commit, push и deploy.
>
> Изменения ограничь необходимой новой Design-документацией и обязательными governance-записями, если они требуются для фиксации разрешения на документирование.
>
> Верни путь к документу, краткое содержание, список изменённых файлов и открытые вопросы. Остановись до человеческого review и отдельной авторизации реализации.

## Source instruction — English translation

The consilium accepts the results of the read-only pedagogical audit as a basis
for designing Learn Slice 4 — Compare the Flow.

I authorize only preparation of a Design document for subsequent human review.
Implementation is not authorized.

Lesson goal: show that local velocity depends on spatial position in one
stationary Demo field at fixed model time.

Established pedagogical decisions:

1. Starting points: A=(0,1000,4000) m, B=(2400,1000,0) m.
2. Both points are stationary probes, not air particles.
3. One Demo composition in StormRelativeLaboratory, t=0.
4. B moves on the horizontal plane y=1000 m.
5. Preliminary interaction region: x=1500…5500 m, z=−1000…1000 m.
6. Preferred input: explicit Move B with click placement and an accessible keyboard alternative.
7. Two independent 3D arrows with one preliminary scale of 40 m per 1 m/s.
8. Speed and Vertical always visible for A/B; Eastward and Northward behind a disclosure if this improves readability.
9. No Simulation.step, integrator, trajectory history or time evolution.
10. Primary learning goal: spatial variation of local velocity.
11. Secondary optional discovery: Vertical can cross zero while full speed is nonzero.
12. Do not reveal the sign-change location beforehand or make finding it mandatory.

Prepare a bounded Design according to AGENTS.md and DOCUMENTATION_GOVERNANCE.md.
Include the learning sequence and exact English user copy; interface states and
camera interaction; coordinate and scientific invariants; static-session
architecture and component reuse; ownership of two arrows, RAF, listeners and
cleanup; unavailable measurements, interaction boundaries and invalid ray-plane
intersection handling; keyboard accessibility, mobile and responsive UX;
verification and technical acceptance criteria; open questions and separately
labelled preliminary decisions.

Do not change production code, tests, physics, data, frozen records or existing
scientific contracts. Do not run Simulation, scientific campaigns or evidence
collection. No commit, push or deploy.

Limit changes to necessary new Design documentation and mandatory governance
records if required to record documentation permission.

Return the document path, a short summary, changed files and open questions.
Stop before human review and separate implementation authorization.
