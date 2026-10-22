# Learn Demo collection Slice 2 — bounded authorization

## Status

| Field | Value |
| --- | --- |
| Document type | DECISION RECORD |
| Approval state | APPROVED |
| Authority status | ACTIVE |
| Freeze mode | MUTABLE |
| Authority scope | One controlled five-case Demo seed collection and read-only saved-result inspection |
| Parent authority | Explicit human instruction below; active Governance v1 and amendment via PROJECT_STATUS |
| Current project state | [PROJECT_STATUS](PROJECT_STATUS.md) |
| Supersedes | None; adds one execution permission outside Slice 1 |
| Superseded by | None |

## Decision authority

Human project owner acting as bounded execution authorizer. Recorded by Agent.

## Scope and Decision

Authorize exactly one invocation of the accepted isolated collector entry,
tools/learn-demo-seed-verification/collector.run.test.ts, using its dedicated
Vitest configuration and unchanged Slice 1 collector. The ordered cases are
A, B1, B2, [A,B1], [A,B2], each in a fresh lab with step 0 and 1200 existing
fixed steps of 0.1 s. Inputs are A=(0,1000,4000), B1=(0,1000,6000),
B2=(2400,1000,0) metres; pairs release A first and both markers at t=0.
Use existing createExploreLab, explicit Demo prescribed identity and C=(10,0) m/s,
StormRelativeLaboratory source wiring, Euler, atmospheric tracer domain and recorder.
No alternative numerical path or functionality extension is authorized.

First verify absent opt-in, scoped typecheck, infrastructure tests, reviewed source
baseline, case/configuration agreement, unchanged accepted collector and preservation
of prior user changes. A failed preflight stops execution without production fixes
or bypass. Then enable LEARN_DEMO_SEED_VERIFICATION=collect for this invocation only
and pass a new absolute output directory through the collector's existing output
environment parameter. Reserve a unique directory below
artifacts/learn-demo-seed-verification/; retain evidence and provenance there.
If interrupted, preserve available evidence and report; never retry automatically
or manually repair results. After the invocation inspect saved files read-only,
including checksums, completeness, mapping, history, checkpoints and termination,
report the actual observations and stop.

## Authority targets and reviewed identity

Architecture basis: [verification Design](ux/2026-10-21-learn-mvp-demo-seed-verification-design.md),
raw SHA-256 `095a582078bc420cf2ea8eb11940222a25691baf6cfb57a4ab96df875cdf49c0`.
[Slice 1](2026-10-21-learn-demo-collector-slice-1-authorization.md) remains the
implementation boundary. The accepted local collector includes post-review integrity,
provenance and trust-boundary fixes and the final flag-comment clarification.

| Accepted local file | Raw SHA-256 |
| --- | --- |
| tools/learn-demo-seed-verification/collector.ts | 1bcf302c9948e799929849c3a2e9bccbdeb7f3c3da42d00dedbb028667a9773d |
| tools/learn-demo-seed-verification/collector.run.test.ts | 341ed77d07c0dc541ad73bdcc92081355aba3c0c945492ac0abf240ec2819251 |
| tools/learn-demo-seed-verification/collector.infrastructure.test.ts | cf51b4e9e2b44435d7d4193e1317ca6d9dc4037ab9cd90479ad1b118a47f6116 |
| tools/learn-demo-seed-verification/vitest.config.ts | 3d4ee388bb4dfcc9a38b16527aae3686df36a53120b5575608b684a0ccd121d9 |
| tools/learn-demo-seed-verification/tsconfig.json | 3ca4828b1a1db72380f0853a50be6a7753747682ca4a54476f508dcd8114e96d |

These identify the inspected working-copy files, not a Governance freeze/pin.
The saved run provenance must capture actual source/configuration bytes, dirty
source context and dependency/runtime identity; HEAD alone is insufficient.

## Authorization consequence and exclusions

Record this Decision and mandatory mutable status/navigation, run preflight, consume
the single invocation permission, inspect saved evidence and stop. This permission
does not renew after failure. Both Designs remain PROPOSED / INACTIVE / MUTABLE.
No freeze/pin is performed. Record execution consumption in PROJECT_STATUS through
the same bounded status pointer; the Decision is not a scientific verdict.

NOT INTRODUCED: any scientific/model semantics. NOT CLAIMED: physics validation,
scientific PASS/FAIL, numerical qualification, Learn seed suitability or novice
comprehension. No Phase P/P2 state change or Main L1 authorization.

Explicitly NOT authorized: production/src changes, existing test changes, physics,
numerical methods, Demo fixtures, seeds/C/dt/horizon/integrator/domain/recorder changes,
Explore, Guided, viewer or Learn implementation, B3, extra experimental cases or
manual case execution, additional collection invocations, full suite/build,
staging, commit or push. Preserve prior local changes and untracked files.

Evidence is local and artifacts/ is ignored; this Decision does not establish durable
backup or a public evidence archive. Permanent scientific or teaching reliance needs
separate preservation/retention disposition and subsequent appropriate review.

## Date

2026-10-21.

## Source language

Russian (ru).

## Source instruction — original

**Разрешаю Slice 2 — Controlled Demo Seed Collection.**

Это явное человеческое разрешение на оформление bounded Decision Record и **однократное выполнение пяти предусмотренных вычислительных случаев** с использованием принятого collector Slice 1.

### 1. Governance

Перед началом сверь действующие `AGENTS.md`, Governance, amendment, `PROJECT_STATUS.md`, Decision Record Slice 1 и verification Design.

Оформи минимальный bounded Decision Record для Slice 2, фиксирующий:

- Разрешение одного controlled collection run.
- Использование принятого collector без расширения его функциональности.
- Ровно пять случаев: A, B1, B2, A+B1, A+B2.
- 1200 фиксированных шагов по 0.1 секунды для каждого случая.
- Использование существующей Demo-модели, штатного factory, Euler, domain и recorder.
- Сохранение evidence и provenance в новом уникальном каталоге.
- Отсутствие разрешения на изменение production-кода, viewer, Learn, B3 или дополнительные экспериментальные случаи.
- Отсутствие научной квалификации, PASS/FAIL по физике, изменения статусов Phase P/P2 и разрешения Main L1.
- Запрет staging, commit и push.

Статусы Design не менять. Freeze/pin не выполнять.

При необходимости добавь только обязательную навигационную ссылку в разрешённый mutable-документ.

### 2. Preflight

До запуска:

1. Проверь, что текущий collector соответствует принятому Slice 1, включая последнюю корректировку комментариев.
2. Проверь scoped typecheck и инфраструктурные тесты с отсутствующим opt-in.
3. Проверь неизменность source baseline и соответствие пяти случаев утверждённому Design.
4. Проверь, что целевой каталог абсолютный, новый и расположен внутри `artifacts/learn-demo-seed-verification/`.
5. Убедись, что локальные изменения пользователя и untracked-файлы защищены.

Если preflight не проходит — остановись. Не исправляй production-код и не обходи проверки.

### 3. Collection

Разрешаю установить:

`LEARN_DEMO_SEED_VERIFICATION=collect`

и указать новый абсолютный output directory штатным параметром collector.

Выполни **один запуск штатного изолированного collector entry**.

Не запускай случаи вручную, не меняй seeds, C, dt, длительность, integrator, recorder или domain.

Если запуск прервался, сохрани доступное evidence и сообщи причину. **Не повторяй автоматически** и не исправляй результат вручную.

### 4. Проверка результата

После запуска выполни только read-only анализ сохранённых файлов:

- Наличие `result.json`, `provenance.json`, `checksums.json` и source snapshot.
- Совпадение контрольных сумм сохранённых файлов.
- Полнота пяти случаев и их порядок.
- `status`, `integrity`, `stepsCompleted` каждого случая.
- Согласованность mapping, histories, checkpoints и termination.
- Фактические положения меток в контрольных точках.
- Наличие ранних прекращений движения или других ограничений наблюдения.

Не интерпретируй траектории как научное подтверждение физики. Не делай выводов о пригодности стартовых точек для Learn без последующего визуального просмотра.

[Omission: the nine-item report-format list; the stopping condition and prohibitions follow verbatim.]

**После отчёта остановись.**

Не реализуй viewer или Learn. Не изменяй physics, `src/**`, существующие тесты или научные статусы. Не выполняй staging, commit или push.

## Source instruction — English translation

I authorize Slice 2 — Controlled Demo Seed Collection. This is explicit human
authorization to record a bounded Decision Record and execute the five intended
computational cases once using the accepted Slice 1 collector.

Before starting, check active AGENTS, Governance, amendment, PROJECT_STATUS, Slice 1
Decision and verification Design. Record permission for one controlled collection
run using the accepted collector without extending functionality; exactly A, B1,
B2, A+B1, A+B2; 1200 fixed 0.1-second steps per case; existing Demo, factory, Euler,
domain and recorder; evidence/provenance in a new unique directory. No production
changes, viewer, Learn, B3 or extra cases, scientific qualification or physics
PASS/FAIL, Phase P/P2 state changes or Main L1 permission, staging, commit or push.
Keep Design statuses unchanged; no freeze/pin. If needed add only mandatory
navigation to a permitted mutable document.

Before execution verify the collector matches accepted Slice 1 including final
comments, run scoped typecheck/infrastructure tests without opt-in, check source
baseline and five-case agreement with the reviewed Design, confirm an absolute new
target below artifacts/learn-demo-seed-verification/, and protect local changes and
untracked files. If preflight fails, stop; do not fix production or bypass checks.

Permission is given to set LEARN_DEMO_SEED_VERIFICATION=collect and specify a new
absolute output directory through the collector's existing parameter. Run the
ordinary isolated collector entry once. No manual cases or seed/C/dt/duration/
integrator/recorder/domain changes. If interrupted, retain available evidence and
report why; no automatic retry or manual result repair.

Afterward perform only read-only saved-file inspection: result, provenance,
checksums and source snapshot; checksum agreement; five-case completeness/order;
each case's status/integrity/stepsCompleted; mapping/history/checkpoint/termination
consistency; actual checkpoint positions; early terminations/observation limits.
Do not interpret paths as scientific physics confirmation or conclude Learn seed
suitability before subsequent visual inspection.

[Omission: the nine-item report-format list, as in the original excerpt.]

After the report stop. Do not implement viewer/Learn or change physics, src,
existing tests or scientific statuses. No staging, commit or push.
