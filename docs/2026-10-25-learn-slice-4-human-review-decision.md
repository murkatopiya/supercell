# Learn Slice 4 — human review and bounded Stage 1 planning

## Status

| Field | Value |
| --- | --- |
| Document type | DECISION RECORD |
| Approval state | APPROVED |
| Authority status | ACTIVE |
| Freeze mode | MUTABLE |
| Authority scope | Architectural Design acceptance with refinements, independently gated stages and documentation-only Stage 1 planning |
| Parent authority | Human owner instruction below; [Governance v1](DOCUMENTATION_GOVERNANCE.md), its [adoption](2026-10-11-documentation-governance-v1-adoption-decision.md), [amendment](DOCUMENTATION_GOVERNANCE_V1_AMENDMENT.md) and [amendment adoption](2026-10-11-documentation-governance-v1-amendment-bootstrap-decision.md) |
| Current project state | [PROJECT_STATUS](PROJECT_STATUS.md) |
| Supersedes | Earlier pending-human-review / proposed-architecture statements only for the bounded architectural acceptance recorded here |
| Superseded by | None |

## Decision authority

Human project owner communicating the consilium's human review and acting as
Learn product decision-maker and documentation authorizer. Recorded by Agent.

## Scope and Decision

Accept [Compare the Flow Design](ux/2026-10-25-learn-slice-4-compare-the-flow-design.md)
as an architectural basis with the refinements in the original instruction.
Split work into Stage 1 Static Compare and Stage 2 Explore the Field, each
requiring independent explicit implementation authorization. Neither is authorized
by this Decision. Prepare the proposed
[Stage 1 Implementation Plan](ux/2026-10-25-learn-slice-4-stage-1-implementation-plan.md)
and update only necessary mutable Design/Decision/Status documentation, including
the stale Last status update field.

Stage 1: unchanged Demo, StormRelativeLaboratory, t=0; fixed A/B at the supplied
positions; independent true 3D arrows at one common scale; simultaneous Speed /
Vertical and disclosed Eastward / Northward; static viewport, camera, Reset View
and accessible explanations. No movement/input, Simulation, integration or history.
Stage 2: fixed-height B placement by Move B click/touch, keyboard alternative,
preliminary rectangle, Reset probes, invalid-placement handling and movement-related
camera/mobile/discoverability checks. Scale 40 and disabling OrbitControls in Move B
remain preliminary pending visual/UX checks; 100 m keyboard step is provisionally
accepted, numeric entry unnecessary. Vertical-zero discovery is not a completion gate.

INTRODUCED: bounded documentation of accepted presentation architecture and stage
boundaries. NOT INTRODUCED: new physics, model semantics or scientific contracts.
NOT CLAIMED: implementation acceptance, executed verification, model qualification
or later-stage permission.

## Authority targets and reviewed identity

Targets are the mutable Design at the canonical path above, this new Decision,
the new proposed plan (semantic type DESIGN), and PROJECT_STATUS. Acceptance is
semantic architectural acceptance with explicit refinements, not exact-byte pinning
or blanket final acceptance of every UX/detail choice. No reviewed SHA/version
identity was supplied by the owner and none is inferred. No freeze or new frozen
identity is created. The original documentation Decision remains historical;
its former proposed-Design language describes that earlier authorization.

The Design becomes APPROVED / ACTIVE only for the architectural constraints,
remaining MUTABLE. The new plan remains PROPOSED / INACTIVE / MUTABLE and is not
automatically approved by acceptance of its parent architecture. This Decision
owns the human disposition, the Design owns architecture, the plan owns proposed
implementation details, and PROJECT_STATUS alone owns project-wide current state.

Pre-edit frozen-identity verification recovered the amendment index from accepted
snapshot `8d916037058a919560b6c2d01ae65823589e96bb`; both indexed frozen artifacts
matched. Governance v1 remains bound to its adoption identity. Frozen records
are not modification targets. Mechanical verification creates no authority.

## Authorization consequence

Documentation only: record review, stage split and proposed Stage 1 plan; maintain
the cold-start navigation/status consequence. Stop before coding, testing or new
model sampling. Review/approval of the plan and explicit Stage 1 implementation
authorization remain distinct. Stage 2 requires its own future authorization.

## Explicitly NOT authorized

Production-code/test/physics/data/baseline/frozen-record/scientific-contract
changes; implementation of either stage; Simulation execution, integration,
scientific campaigns, commit, push or deploy. No new verification results or
scientific classifications are established by this documentation work.

## Date

2026-10-25.

## Source language

Russian (ru), with English lesson/API names.

## Source instruction — original

Verbatim bounded instruction; greeting omitted.

> консилиум провёл human review Learn Slice 4 — Compare the Flow Design.
>
> **Решение владельца: принять Design как архитектурную основу с уточнениями и разделить реализацию на два независимо авторизуемых этапа.**
>
> Stage 1 — Static Compare:
>
> - Одна неизменённая Demo-композиция в StormRelativeLaboratory при t=0.
> - Два неподвижных пробника A=(0,1000,4000) и B=(2400,1000,0).
> - Два независимых истинных 3D-вектора скорости с одинаковым масштабом.
> - Одновременные измерения A/B: Speed, Vertical, раскрываемые Eastward/Northward.
> - Статический viewport, камера, Reset View, доступные объяснения.
> - Без Move B, координатного ввода, Simulation, интегрирования, траекторий и истории.
>
> Stage 2 — Explore the Field:
>
> - Перемещение B по плоскости y=1000.
> - Режим Move B с размещением кликом/касанием.
> - Клавиатурная альтернатива.
> - Предварительная область x=1500…5500, z=−1000…1000.
> - Reset probes, обработка невалидных размещений.
> - Проверка удобства камеры, мобильного взаимодействия и обнаруживаемости изменений.
>
> Уточнения review:
>
> 1. Масштаб стрелок 40 м на 1 м/с остаётся предварительным до визуальной проверки.
> 2. Отключение OrbitControls в Move B — предварительное решение, требующее UX-проверки.
> 3. Шаг клавиатуры 100 м предварительно принят; точный числовой ввод не требуется.
> 4. Переход Vertical через ноль — необязательное открытие, не completion gate.
> 5. При следующем разрешённом обновлении PROJECT_STATUS синхронизировать устаревшее поле Last status update.
>
> Подготовь ограниченную документационную фиксацию human review и **Stage 1 Implementation Plan**.
>
> План должен определить:
>
> - точные границы Stage 1 и исключения Stage 2;
> - предполагаемые файлы и минимальные API;
> - владение ресурсами и защиту существующей single-arrow реализации Slice 3;
> - проверяемые научные и координатные инварианты;
> - тестовую матрицу, WebGL-проверки и критерии технической приёмки;
> - предварительные решения, которые нельзя объявлять окончательно утверждёнными;
> - отдельный stop gate перед реализацией.
>
> Соблюдай AGENTS.md и DOCUMENTATION_GOVERNANCE.md. Изменяй только необходимые mutable Design/Decision/Status и новый planning-документ, если это допускается governance. Не изменяй production code, тесты, физику, данные, frozen records или научные контракты.
>
> Без реализации, Simulation, научных кампаний, commit, push и deploy.
>
> Верни список изменённых документов, краткое содержание Stage 1 Plan и вопросы, требующие решения владельца. Остановись до отдельной явной авторизации реализации.

## Source instruction — English translation

The consilium has conducted human review of the Learn Slice 4 — Compare the Flow Design.

Owner decision: accept the Design as an architectural basis with refinements and
split implementation into two independently authorizable stages.

Stage 1 — Static Compare:

- One unchanged Demo composition in StormRelativeLaboratory at t=0.
- Two stationary probes A=(0,1000,4000) and B=(2400,1000,0).
- Two independent true 3D velocity vectors with the same scale.
- Simultaneous A/B measurements: Speed, Vertical, disclosed Eastward/Northward.
- Static viewport, camera, Reset View and accessible explanations.
- No Move B, coordinate input, Simulation, integration, trajectories or history.

Stage 2 — Explore the Field:

- Move B on the y=1000 plane.
- Move B mode with click/touch placement.
- Keyboard alternative.
- Preliminary region x=1500…5500, z=−1000…1000.
- Reset probes and invalid-placement handling.
- Check camera usability, mobile interaction and discoverability of changes.

Review refinements:

1. Arrow scale 40 m per 1 m/s remains preliminary until visual verification.
2. Disabling OrbitControls in Move B is preliminary and needs UX verification.
3. Keyboard step 100 m is provisionally accepted; exact numeric input is unnecessary.
4. Vertical crossing zero is an optional discovery, not a completion gate.
5. At the next authorized PROJECT_STATUS update, synchronize the stale Last status update field.

Prepare bounded documentation recording human review and a Stage 1 Implementation
Plan. Define exact Stage 1 boundaries and Stage 2 exclusions; anticipated files
and minimal APIs; resource ownership and protection of Slice 3's existing
single-arrow implementation; testable scientific/coordinate invariants; test
matrix, WebGL checks and technical acceptance criteria; preliminary decisions
that cannot be declared finally approved; a separate pre-implementation stop gate.

Follow AGENTS.md and DOCUMENTATION_GOVERNANCE.md. Change only necessary mutable
Design/Decision/Status and a new planning document if governance permits. Do not
change production code, tests, physics, data, frozen records or scientific contracts.

No implementation, Simulation, scientific campaigns, commit, push or deploy.

Return changed documents, a short Stage 1 Plan summary and questions requiring
owner decisions. Stop before separate explicit implementation authorization.
