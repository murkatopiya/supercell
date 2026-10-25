# Learn Slice 3 — Read the Motion: technical acceptance and documentation closure

## Status

| Field | Value |
| --- | --- |
| Document type | DECISION RECORD |
| Approval state | APPROVED |
| Authority status | ACTIVE for the bounded technical acceptance and documentation closure |
| Freeze mode | MUTABLE |
| Authority scope | Human technical acceptance of implemented Learn Slice 3 Stage 1/2 and Watch → Investigate UX; no scientific qualification |
| Parent authority | Human project owner instruction below; [Governance v1](DOCUMENTATION_GOVERNANCE.md) under its [adoption](2026-10-11-documentation-governance-v1-adoption-decision.md), extended by the [amendment](DOCUMENTATION_GOVERNANCE_V1_AMENDMENT.md) under its [adoption](2026-10-11-documentation-governance-v1-amendment-bootstrap-decision.md) |
| Current project state | [PROJECT_STATUS](PROJECT_STATUS.md) |
| Supersedes | Earlier pending-acceptance statements only for implemented Read the Motion Stage 1/2 and its two-phase UX |
| Superseded by | None |
| Technical acceptance gate | CLOSED by the bounded human decision below |

## Decision authority

Human project owner, communicating the consilium's acceptance and authorizing
limited documentation closure. Recorded by Agent.

## Decision and scope

Accept Learn Slice 3 — Read the Motion within the completed technical audit:

- [Stage 1](2026-10-25-learn-slice-3-stage-1-implementation-decision.md) is implemented: observation of existing Demo tracer A and its true local 3D velocity vector, with Start/Pause/Resume/Replay and a recorded path.
- [Stage 2](2026-10-25-learn-slice-3-stage-2-implementation-decision.md) is implemented: discrete recorded-state timeline, velocity inspector and independently retained Reference/Current comparison.
- The two-phase Watch → Investigate UX is accepted, including the pre-start explanation, recording status and post-flight investigation status.

Close this bounded technical acceptance gate with the audit limitations retained
below. This does not approve the entire Learn Design, qualify the model or
authorize subsequent Learn stages. The earlier stage Decisions retain their
historical implementation scopes and scientific exclusions.

## Authority targets and reviewed identity

Acceptance targets are the implemented [LearnReadMotion lesson](../src/app/learn/LearnReadMotion.tsx),
[session](../src/app/learn/createReadMotionSession.ts),
[recorded-state inspector](../src/app/learn/ReadMotionInspection.ts),
[investigation/comparison UI](../src/app/learn/ReadMotionInvestigation.tsx),
[velocity arrow](../src/rendering/velocityArrow.ts) and their shared Learn/rendering integration.
The accepted basis is the final read-only technical audit of the local working
implementation on 2026-10-25, summarized here. No exact implementation commit,
deployed release identity, new freeze or immutable pin was supplied or accepted.

The documentation targets are this mutable DECISION RECORD and mutable
PROJECT_STATUS. No frozen authority is modified. Governance foundation identity
matches its adoption Decision; the amendment identities were checked through
accepted snapshot `8d916037058a919560b6c2d01ae65823589e96bb` before closure.

## Accepted technical audit basis

| Check | Recorded result and boundary |
| --- | --- |
| Scientific implementation invariants | Confirmed within technical audit: the arrow/inspector use the same session's velocityObservation that drives A; historical sampling uses stored P,t; inspection neither steps Simulation nor changes particles, clock or integrator. The 120.0 s velocity is a field sample at the recorded endpoint, not a finite difference or extrapolation. No second C subtraction occurs. Eastward=vx, Northward=−vz, Vertical=vy. Arrow length uses one constant linear scale with correct 3D direction. Reference retains independent measured values; unavailable measurements are not replaced with zeros. |
| Developer regression | 141 relevant tests passed across 15 files, including Slice 1/2 regressions, velocity/component checks, historical-state correspondence, Reference, unavailable cases, cleanup and StrictMode/stale-callback scenarios. |
| Typecheck and production build | Full typecheck and production build passed. The build retains its bundle-size warning. |
| Browser/UI | Desktop 1440 px and mobile 390/320 px were checked with real WebGL. Timeline, keyboard controls, rapid selection, Reference/Current, units, phase statuses, camera-only reset, Replay and lesson re-entry were checked; no horizontal overflow was found. |
| Defects | No reproducible blocking defect was found within these checks. |

Relevant owning tests include [Learn lifecycle/inspection](../src/app/learn/LearnFollowMotion.test.tsx),
[Slice 1/navigation](../src/app/learn/Learn.test.tsx),
[inspection invariants](../src/app/learn/ReadMotionInspection.test.ts),
[session/field wiring](../src/app/learn/createReadMotionSession.test.ts),
[arrow geometry/disposal](../src/rendering/velocityArrow.test.ts) and
[scene resource ownership](../src/rendering/TracerScene.learn.test.ts).

Commands completed in the accepted technical audit:

```text
npx vitest run src/app/learn src/rendering/TracerScene src/rendering/velocityArrow.test.ts src/interaction/TracerInspection.test.ts src/core/math/AtmosphericVelocity.test.ts src/app/composeDemoTracerSimulation.test.ts src/app/appNavigation.wiring.test.tsx
npm run typecheck
npm run build
```

These are prior audit results, not a claim that documentation closure reran
application code or scientific collection.

## Retained limitations and inference boundary

One episode of an already stopped 3D view was observed when the audit began.
Replay restored it; the episode did not recur in the subsequent checks and its
cause was not established. Acceptance retains this unresolved observation.

Long-duration GPU/heap profiling was not performed. Resource disposal was
examined through code and tests; an exhaustive absence of all possible leaks
is not claimed. The production-build bundle-size warning remains.

NOT CLAIMED: scientific qualification/certification of the model, forces,
vorticity, convergence, full storm dynamics, time-varying Demo flow, historical
storm reconstruction or forecast. Technical acceptance is not scientific
qualification. Scientific contracts, classifications and research gates remain
unchanged.

## Authorization consequence

Record this human acceptance and perform only the necessary documentation/status
closure. PROJECT_STATUS reports Slice 3 Stage 1/2 as technically accepted and
points here for the decision, audit basis and retained limitations. No action
permission for subsequent Learn stages follows from this closure.

## Explicitly NOT authorized

Code/test/physics/data changes, frozen-record edits, expanded scientific claims,
new experiments or qualification campaigns, subsequent Learn implementation or
execution, commit, push or deploy. There is no new freeze/pinning transition.

## Date

2026-10-25.

## Source language

Russian (ru).

## Source instruction — original

> Огонёчка, консилиум принимает Learn Slice 3 — Read the Motion в рамках проведённой технической приёмки! 🔥
>
> **Разрешаю ограниченное документационное закрытие Slice 3.**
>
> Обнови только необходимые owning records согласно `AGENTS.md` и `DOCUMENTATION_GOVERNANCE.md`, включая `PROJECT_STATUS.md`, если он является обязательным местом фиксации статуса.
>
> Зафиксируй:
>
> - Реализованы Stage 1 (наблюдение вектора скорости) и Stage 2 (timeline, velocity inspector, Reference/Current).
> - UX двух фаз Watch → Investigate принят.
> - Научные инварианты подтверждены в рамках технического аудита.
> - Пройдены 141 релевантный тест, typecheck и build.
> - Выполнены desktop/mobile и WebGL-проверки.
> - Воспроизводимых блокирующих дефектов не найдено.
> - Осталась оговорка о единственном невоспроизведённом эпизоде остановки 3D-вида.
> - Длительное GPU/heap-профилирование не выполнялось.
> - Build сохраняет предупреждение о размере bundle.
> - Техническая приёмка не является научной квалификацией модели.
>
> Не расширяй научные выводы, не изменяй frozen records и не объявляй последующие Learn-этапы автоматически разрешёнными.
>
> **Границы:** только необходимая документация. Без изменений кода, тестов, физики или данных. Без commit, push и deploy.
>
> После обновления покажи краткий diff и остановись.

## Source instruction — English translation

The consilium accepts Learn Slice 3 — Read the Motion within the completed
technical acceptance review. I authorize limited documentation closure of
Slice 3. Update only necessary owning records under AGENTS.md and documentation
governance, including PROJECT_STATUS.md if it is the mandatory status owner.

Record that Stage 1 (velocity-vector observation) and Stage 2 (timeline,
velocity inspector, Reference/Current) are implemented; the Watch → Investigate
UX is accepted; scientific invariants were confirmed within the technical
audit; 141 relevant tests, typecheck and build passed; desktop/mobile and WebGL
checks were performed; no reproducible blocking defect was found; the caveat
about one non-reproduced stopped-3D-view episode remains; long-duration GPU/heap
profiling was not performed; the bundle-size build warning remains; technical
acceptance is not scientific qualification of the model.

Do not expand scientific conclusions, modify frozen records or declare
subsequent Learn stages automatically authorized. Necessary documentation only:
no code, test, physics or data changes; no commit, push or deploy. After updating,
show a brief diff and stop.
