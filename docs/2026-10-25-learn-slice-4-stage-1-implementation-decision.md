# Learn Slice 4 — Stage 1 implementation authorization

## Status

| Field | Value |
| --- | --- |
| Document type | DECISION RECORD |
| Approval state | APPROVED |
| Authority status | ACTIVE |
| Freeze mode | MUTABLE |
| Authority scope | Approval of Stage 1 plan and separately authorized Static Compare implementation with developer verification |
| Parent authority | Human owner instruction below; [human-review Decision](2026-10-25-learn-slice-4-human-review-decision.md), [Governance v1](DOCUMENTATION_GOVERNANCE.md) under its [adoption](2026-10-11-documentation-governance-v1-adoption-decision.md), [amendment](DOCUMENTATION_GOVERNANCE_V1_AMENDMENT.md) under its [adoption](2026-10-11-documentation-governance-v1-amendment-bootstrap-decision.md) |
| Current project state | [PROJECT_STATUS](PROJECT_STATUS.md) |
| Supersedes | Prior pending-plan-approval and no-Stage-1-implementation statements only within this bounded permission |
| Superseded by | None |

## Decision authority

Human project owner communicating consilium review, approving the plan and
separately authorizing implementation. Recorded by Agent.

## Scope and Decision

APPROVE the [Stage 1 Implementation Plan](ux/2026-10-25-learn-slice-4-stage-1-implementation-plan.md)
and separately AUTHORIZE Stage 1 Static Compare within the accepted
[Design](ux/2026-10-25-learn-slice-4-compare-the-flow-design.md), human-review Decision
and plan, with the additional source constraints below. Static session and A/B
measurements must survive WebGL failure. Preserve TracerScene renderer/control
ownership and avoid double disposal. Pair arrows are opt-in and independent of
Slice 3's single-arrow API. Scale 40 and framing remain preliminary for human
visual acceptance. Developer verification is permitted; human acceptance is not
established by this authorization or by passing tests.

INTRODUCED: bounded presentation of static existing Demo velocity.
NOT INTRODUCED: new scientific/model semantics, field evolution or Stage 2.
NOT CLAIMED: scientific qualification, human technical/visual acceptance.

## Authority targets and reviewed identity

Mutable Stage 1 plan, this Decision and PROJECT_STATUS consequences; necessary
Learn source/navigation/styles, opt-in scene pair arrows and scoped annotations,
unit/regression tests and authorized frontend/WebGL checks. Canonical plan path
above identifies the reviewed semantic artifact; the owner supplied no exact-byte
hash or freeze instruction. Plan becomes APPROVED / ACTIVE / MUTABLE for Stage 1
constraints, subject to these refinements. No frozen record is changed or repinned.
Expected amendment identities were checked through accepted snapshot
`8d916037058a919560b6c2d01ae65823589e96bb`, with both indexed artifacts matching.
PROJECT_STATUS remains the sole project-wide current-state owner.

## Authorization consequence

Implement Static Compare only; run corresponding unit/regression tests, typecheck,
production build and real-WebGL developer verification. Direct static observations
required by the lesson and its tests are within scope; no separate scientific
sampling exercise is authorized. Record necessary governance/status consequences.
Stop before human technical/visual acceptance and do not proceed to Stage 2.

## Explicitly NOT authorized

Stage 2, B movement, new scientific computations, Simulation execution,
integration, scientific campaigns, frozen-record changes, commit, push or deploy.
No physics/data/baseline/scientific-contract change or later-stage authorization.

## Date

2026-10-25.

## Source language

Russian (ru), with English product/API names.

## Source instruction — original

> Консилиум завершил human review Learn Slice 4 — Stage 1 Implementation Plan.
>
> **Решение владельца: APPROVE Stage 1 Implementation Plan и отдельно AUTHORIZE ограниченную реализацию Stage 1 Static Compare с предусмотренной developer verification.**
>
> Реализуй Stage 1 в границах принятого Design, Human-review Decision и Stage 1 Implementation Plan.
>
> Дополнительные требования review:
>
> 1. `CompareFlowSession` и измерения A/B должны быть независимы от успешной инициализации WebGL. При недоступности 3D-сцены реальные измерения остаются доступными.
> 2. Сохрани существующие контракты владения renderer, OrbitControls и ресурсами TracerScene. Не вводи конкурирующие механизмы cleanup и не допускай двойного dispose.
> 3. Новый pair-arrow API должен быть opt-in и не менять поведение существующего single-arrow API Slice 3.
> 4. Масштаб 40 и начальное кадрирование остаются предварительными до человеческой визуальной приёмки.
>
> Разрешены только изменения, необходимые для Stage 1, соответствующие unit/regression tests, typecheck, production build и real-WebGL developer verification. Документационную фиксацию выполняй только в рамках применимого governance.
>
> Stage 2, перемещение B, новые научные вычисления, Simulation, научные кампании, изменение frozen records, commit, push и deploy не разрешены.
>
> После реализации представь список изменённых файлов, результаты проверок, ограничения и вопросы для human technical/visual acceptance.
>
> **Остановись перед human acceptance и не переходи к Stage 2 автоматически.**

## Source instruction — English translation

The consilium has completed human review of the Learn Slice 4 — Stage 1
Implementation Plan.

Owner decision: APPROVE the Stage 1 Implementation Plan and separately AUTHORIZE
bounded Stage 1 Static Compare implementation with its planned developer verification.

Implement Stage 1 within the accepted Design, Human-review Decision and Stage 1
Implementation Plan. Additional review requirements:

1. CompareFlowSession and A/B measurements must be independent of successful WebGL
   initialization. Real measurements remain available when the 3D scene is unavailable.
2. Preserve existing ownership contracts for renderer, OrbitControls and TracerScene
   resources. Do not introduce competing cleanup mechanisms or double disposal.
3. The new pair-arrow API must be opt-in and preserve Slice 3 single-arrow behavior.
4. Scale 40 and initial framing remain preliminary until human visual acceptance.

Only necessary Stage 1 changes, corresponding unit/regression tests, typecheck,
production build and real-WebGL developer verification are permitted. Record
documentation only under applicable governance.

Stage 2, B movement, new scientific computations, Simulation, scientific campaigns,
frozen-record changes, commit, push and deploy are not authorized.

After implementation, present changed files, verification results, limitations
and questions for human technical/visual acceptance. Stop before human acceptance
and do not advance automatically to Stage 2.
