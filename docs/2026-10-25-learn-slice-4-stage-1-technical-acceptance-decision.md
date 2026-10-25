# Learn Slice 4 — Stage 1 Static Compare: technical acceptance

## Status

| Field | Value |
| --- | --- |
| Document type | DECISION RECORD |
| Approval state | APPROVED |
| Authority status | ACTIVE |
| Freeze mode | MUTABLE |
| Authority scope | Human technical acceptance of the verified Learn Slice 4 Stage 1 Static Compare implementation and limited documentation closure; no Stage 2 authorization or scientific qualification |
| Parent authority | Human owner instruction below; [Governance v1](DOCUMENTATION_GOVERNANCE.md) under its [adoption](2026-10-11-documentation-governance-v1-adoption-decision.md), extended by the [amendment](DOCUMENTATION_GOVERNANCE_V1_AMENDMENT.md) under its [adoption](2026-10-11-documentation-governance-v1-amendment-bootstrap-decision.md) |
| Current project state | [PROJECT_STATUS](PROJECT_STATUS.md) |
| Supersedes | Earlier pending-acceptance statements only for the verified Stage 1 implementation and its refined presentation |
| Superseded by | None |
| Technical acceptance gate | CLOSED by the bounded human decision below |

## Decision authority

Human project owner communicating the consilium's final technical and human visual
review, accepting the checked implementation and authorizing documentation only.
Recorded by Agent. The owner, not developer-test results or the recorder, closes
the acceptance gate.

## Decision and scope

Record **Stage 1 TECHNICAL ACCEPTANCE — APPROVED / CLOSED** within the verified
implementation. Accept fixed A=(0,1000,4000) m and B=(2400,1000,0) m as stationary
probes of one unchanged StormRelativeLaboratory Demo composition at t=0, two true
local 3D velocity arrows at the same 80 display metres per m/s scale, simultaneous
Speed/Vertical and initially collapsed Eastward/Northward, camera/Reset View,
secondary fixed-height guides and the reviewed scientific explanations.

The owner confirmed readability of the updated desktop/mobile presentation.
The accepted Stage 1 display coefficient is 80 within this checked presentation;
earlier preliminary 40/80 descriptions are historical, not a competing current
acceptance state. This does not establish a general scientific display scale or
approve future camera/scale changes. Retain all limitations below.

INTRODUCED: bounded human technical acceptance and documentation of existing
Stage 1 behavior. NOT INTRODUCED: new physics, fields, model semantics, scientific
contracts, data, baselines or execution authority. NOT CLAIMED: scientific model
qualification, certification, forces, vorticity, convergence or full storm dynamics.

## Authority targets and reviewed identity

Accepted implementation targets: [lesson](../src/app/learn/LearnCompareFlow.tsx),
[static session](../src/app/learn/createCompareFlowSession.ts),
[measurement adapter](../src/app/learn/CompareFlowMeasurement.ts),
[viewport](../src/app/learn/CompareFlowViewport.tsx),
[camera framing](../src/app/learn/compareFlowView.ts), opt-in
[pair-arrow scene API](../src/rendering/TracerScene.ts), existing
[arrow geometry](../src/rendering/velocityArrow.ts),
[height annotations](../src/rendering/tracerAnnotations.ts) and shared Learn integration.
Scope is bounded by the [accepted Design](ux/2026-10-25-learn-slice-4-compare-the-flow-design.md),
[human-review Decision](2026-10-25-learn-slice-4-human-review-decision.md),
[Stage 1 plan](ux/2026-10-25-learn-slice-4-stage-1-implementation-plan.md),
[implementation authorization](2026-10-25-learn-slice-4-stage-1-implementation-decision.md)
and [visual-refinement authorization](2026-10-25-learn-slice-4-stage-1-visual-refinement-decision.md).

The accepted basis is the final technical audit and human visual review of the
working implementation on 2026-10-25, summarized here. The owner supplied no exact
implementation commit or immutable byte identity. No new freeze, pin, deployed
release identity or broader acceptance is inferred.

Documentation targets are this new mutable DECISION RECORD, owning the human
acceptance, and mutable PROJECT_STATUS, owning project-wide current state and
navigation. Frozen artifacts are not targets. Governance v1 retains its adoption
identity; amendment expected identities were recovered through accepted snapshot
`8d916037058a919560b6c2d01ae65823589e96bb` and verified before these edits.

## Accepted audit basis

| Check | Accepted result and boundary |
| --- | --- |
| Developer tests | 96/96 relevant tests passed across 12 files, including existing Learn regressions. |
| Typecheck / production build | Both passed; the bundle-size warning remains. |
| Velocity / coordinates | Both probes sample the same existing total field at exact P and t=0. Cards and arrows consume the same immutable measurement snapshots. Eastward=vx, Northward=−vz, Vertical=vy; no second C subtraction. Arrow direction is true 3D and length is proportional to speed with common coefficient 80. No T1, finite differences or screen-space tangent substitution. |
| Static session | Measurements are independent of WebGL success. Stage 1 does not construct Simulation/integrator/history or advance model time. Unavailable measurements are not replaced by zero. |
| Regression / ownership | Slice 3 single-arrow behavior is preserved; pair arrows are opt-in and separately owned. Tests cover geometry/material disposal, fixed-height guides, renderer/OrbitControls ownership, one RAF, observer cleanup, StrictMode, context-loss events and stale callbacks. |
| Interaction | Reset View changes camera only; help preserves measurements and returns focus; navigation and re-entry preserve the defined static-session behavior. |
| Browser / human visual review | Real-WebGL desktop 1440×1000, mobile responsive 390×844 and 320×844 CSS px checked; no horizontal overflow or captured console warning/error in those checks. Owner confirmed updated desktop/mobile readability. |
| Defects | No reproducible blocking defect found within this verification scope. |

Owning tests: [session / measurement / framing](../src/app/learn/createCompareFlowSession.test.ts),
[static UI / WebGL failure / lifecycle](../src/app/learn/LearnCompareFlow.test.tsx),
[scene ownership / pair isolation / guides](../src/rendering/TracerScene.learn.test.ts),
[arrow geometry](../src/rendering/velocityArrow.test.ts),
[camera reset](../src/rendering/TracerScene.resetView.test.ts),
[Slice 1 / navigation](../src/app/learn/Learn.test.tsx),
[Slice 2/3 interaction regressions](../src/app/learn/LearnFollowMotion.test.tsx),
[Slice 3 inspection](../src/app/learn/ReadMotionInspection.test.ts) and
[application navigation](../src/app/appNavigation.wiring.test.tsx).

Commands completed in the accepted audit:

```text
npx vitest run src/app/learn src/rendering/TracerScene.learn.test.ts src/rendering/TracerScene.resetView.test.ts src/rendering/velocityArrow.test.ts src/app/appNavigation.wiring.test.tsx
npm run typecheck
npm run build
```

These are prior audit results accepted by the owner, not a claim of rerunning
application code, browser checks or scientific collection during documentation closure.

## Retained limitations

- Production build retains its bundle-size warning.
- Long-duration GPU/heap profiling was not performed; bounded lifecycle checks do
  not establish absence of all long-duration leaks.
- Touch gestures on physical mobile devices were not tested; responsive browser
  viewport checks are not physical-device touch validation.
- Real forced WebGL-context loss was not tested. Context-loss handling is supported
  by source inspection and unit tests, not a forced real-GPU loss/recovery exercise.
- Arbitrary views can foreshorten arrows; strong zoom can move them outside the
  frame. Reset View restores the initial framing. Screen-projected length is not
  a direct numerical speed measurement under arbitrary perspective.

Technical acceptance is not scientific qualification of the prescribed model.
Existing scientific contracts, classifications and research gates are unchanged.

## Authorization consequence

Create this acceptance receipt and update PROJECT_STATUS only, including its
current status summary. Resolve earlier Stage 1 pending-acceptance statements
externally while retaining their historical review/implementation meaning.
Stop after documentation closure.

## Explicitly NOT authorized

Stage 2 Explore the Field, Move B or other subsequent Learn work. Stage 1 acceptance
does not authorize Stage 2 automatically; a separate explicit authorization remains
required. No production-code, test, physics, data, frozen-record or scientific-
contract changes; no scientific campaigns, commit, push or deploy.

## Date

2026-10-25.

## Source language

Russian (ru), with English status/API names.

## Source instruction — original

Bounded verbatim excerpt; greeting omitted.

> консилиум рассмотрел финальный технический аудит и human visual review Learn Slice 4 — Stage 1 Static Compare.
>
> **Решение владельца: Stage 1 TECHNICAL ACCEPTANCE — APPROVED / CLOSED в пределах проверенной реализации.**
>
> Основания:
>
> - 96/96 релевантных тестов PASS;
> - typecheck и production build PASS;
> - подтверждены два истинных локальных вектора скорости и единый масштаб 80 display м на 1 м/с;
> - подтверждены независимость от WebGL, отсутствие Simulation/интеграции/истории и защита Slice 3;
> - браузерная проверка выполнена при 1440×1000, 390×844 и 320×844 CSS px;
> - владелец подтвердил читаемость обновлённого интерфейса на desktop и mobile;
> - воспроизводимых блокирующих дефектов не обнаружено.
>
> Ограничения, которые необходимо сохранить:
>
> - предупреждение build о размере bundle;
> - отсутствие длительного GPU/heap-профилирования;
> - отсутствие проверки touch-жестов на физических мобильных устройствах;
> - реальная принудительная потеря WebGL-контекста не проверялась;
> - произвольные ракурсы и сильное приближение могут сокращать или выводить стрелки за кадр; Reset View восстанавливает начальное кадрирование.
>
> Разрешаю только документационную фиксацию технической приёмки Stage 1 согласно AGENTS.md и DOCUMENTATION_GOVERNANCE.md: необходимый Decision Record и обновление PROJECT_STATUS.
>
> Не изменяй production code, тесты, физику, данные, frozen records или научные контракты. Без commit, push, deploy и научных кампаний.
>
> Stage 2 — Explore the Field остаётся отдельно неавторизованным. Приёмка Stage 1 не разрешает автоматически реализацию Stage 2.
>
> Верни изменённые документы, итоговый статус и подтверждение сохранения ограничений. Остановись после документационной фиксации.

## Source instruction — English translation

The consilium considered the final technical audit and human visual review of
Learn Slice 4 — Stage 1 Static Compare.

Owner decision: Stage 1 TECHNICAL ACCEPTANCE — APPROVED / CLOSED within the
verified implementation.

Basis:

- 96/96 relevant tests PASS;
- typecheck and production build PASS;
- two true local velocity vectors and a common scale of 80 display metres per 1 m/s confirmed;
- WebGL independence, absence of Simulation/integration/history and protection of Slice 3 confirmed;
- browser verification at 1440×1000, 390×844 and 320×844 CSS px;
- owner confirmed readability of the updated desktop/mobile interface;
- no reproducible blocking defects found.

Retain these limitations: bundle-size build warning; no long-duration GPU/heap
profiling; no touch-gesture testing on physical mobile devices; real forced
WebGL-context loss not tested; arbitrary views and strong zoom can foreshorten
arrows or move them outside the frame, and Reset View restores initial framing.

I authorize only documentation of Stage 1 technical acceptance under AGENTS.md
and DOCUMENTATION_GOVERNANCE.md: the necessary Decision Record and PROJECT_STATUS
update. Do not change production code, tests, physics, data, frozen records or
scientific contracts. No commit, push, deploy or scientific campaigns.

Stage 2 — Explore the Field remains separately unauthorized. Stage 1 acceptance
does not automatically authorize Stage 2 implementation.

Return changed documents, final status and confirmation that limitations are
retained. Stop after documentation recording.
