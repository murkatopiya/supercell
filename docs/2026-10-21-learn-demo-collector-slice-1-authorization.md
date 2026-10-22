# Learn Demo collector Slice 1 — bounded authorization

## Status

| Field | Value |
| --- | --- |
| Document type | DECISION RECORD |
| Approval state | APPROVED |
| Authority status | ACTIVE |
| Freeze mode | MUTABLE |
| Authority scope | Collector Slice 1 implementation and non-experimental infrastructure checks only |
| Parent authority | Explicit human instruction below; active Governance v1 and amendment via PROJECT_STATUS |
| Current project state | [PROJECT_STATUS](PROJECT_STATUS.md) |
| Supersedes | None |
| Superseded by | None |

## Decision authority

Human project owner, acting as implementation authorizer. Recorded by Agent.

## Scope and Decision

Accept the reviewed [verification Design](ux/2026-10-21-learn-mvp-demo-seed-verification-design.md)
as architecture basis solely for collector Slice 1. Authorize implementation only
inside tools/learn-demo-seed-verification/, including collector.ts, collector.run.test.ts,
vitest.config.ts and small technically necessary supporting files. Implement exact
five-case preparation, existing Demo factory/release/fixed-step/history behavior,
separate states/history, termination/completeness, provenance and integrity, with
no import-time collection. This is implementation authorization, not execution authority.

Authorize static inspection, scoped typecheck as needed and bounded infrastructure
checks guaranteed not to instantiate Simulation, execute candidate cases or create
experimental evidence. Before any test launch verify collection opt-in is absent
and that the test cannot bypass the gate. No full suite or production build.

## Authority targets and reviewed identity

The reviewed architecture basis is
docs/ux/2026-10-21-learn-mvp-demo-seed-verification-design.md, raw SHA-256
`095a582078bc420cf2ea8eb11940222a25691baf6cfb57a4ab96df875cdf49c0`.
This identifies the inspected basis, not a freeze/pin. The Design remains
PROPOSED / INACTIVE / MUTABLE, as does the separate Learn MVP Design.
The [documentation-only Decision](2026-10-21-learn-mvp-demo-seed-verification-documentation-decision.md)
retains its historical scope. This new Decision adds only the named implementation
permission; it does not activate the full Design or authorize its viewer/execution.

## Authorization consequence

Create this bounded record and the mandatory mutable status/navigation pointer,
then implement and inspect Slice 1. Stop for code review after authorized checks.
Any new authority conflict or required production API change requires stopping and
reporting. No implementation identity is approved in advance.

## Explicitly NOT authorized

- Setting LEARN_DEMO_SEED_VERIFICATION=collect for execution, running the five cases
  or any 1200-step candidate, using reserve B3, or writing experimental results.
- Viewer, Learn or B replacement implementation.
- Changes to src, existing tests, production API, physics, numerical methods,
  Demo fixtures, domain policy, Explore, Guided or navigation.
- Scientific campaigns, qualification, P/P2 certification or Main L1.
- Freeze/pin, automatic Design status changes, staging, commit or push.
- Disturbing prior local changes or untracked files.

## Date

2026-10-21.

## Source language

Russian (ru).

## Source instruction — original

**Разрешаю оформить bounded Decision Record для Slice 1 на основании моего предыдущего сообщения, затем выполнить разрешённую реализацию. Статусы Design не менять.**

Decision Record должен зафиксировать:

- Принятие рассмотренного Demo seed verification Design как архитектурной основы только для collector Slice 1.
- Разрешение реализации исключительно в `tools/learn-demo-seed-verification/`.
- Разрешение ограниченных инфраструктурных проверок без Simulation и экспериментального evidence.
- Запрет исполнения пяти случаев, использования B3, реализации viewer и Learn.
- Запрет изменений `src/**`, production API, физики, численных методов, Demo fixtures, Explore и Guided.
- Отсутствие freeze/pin или автоматического изменения статусов Design.
- Отсутствие разрешения на staging, commit и push.

Decision должен быть минимальным, но соответствовать действующему Governance v1 и amendment. При необходимости добавь только обязательную навигационную ссылку в разрешённый mutable-документ.

После оформления Decision приступай к Slice 1 согласно предыдущему заданию. Если обнаружится новый конфликт полномочий или необходимость изменения production API, остановись и сообщи.

Не запускай вычислительные случаи. После реализации и разрешённых инфраструктурных проверок остановись для code review.

The following preceding instruction excerpts preserve the referenced gate and check restrictions; unrelated text is omitted.

Нужен явный opt-in:

`LEARN_DEMO_SEED_VERIFICATION=collect`

И отдельно указанный новый output directory.

При отсутствии разрешающего значения или при существующем output target инструмент должен останавливаться **до создания Simulation**.

Обычный `npm test` не должен запускать collector или создавать evidence.

Не использовать scientific campaign runners, selectors или инфраструктуру Phase P/P2.

[Omission: intervening restrictions are retained in the latest instruction above.]

Можно выполнить **только ограниченные инфраструктурные проверки нового collector**, которые гарантированно не запускают реальные пять случаев и не создают evidence.

Перед любым тестовым запуском проверь, что opt-in отсутствует, а тест не способен обойти gate.

Разрешены статическая проверка, typecheck при необходимости и проверки отказа без Simulation. Не запускать полный suite или production build.

**Запрещено запускать collector с `collect`, выполнять 1200-шаговые случаи или создавать экспериментальные результаты.**

## Source instruction — English translation

I authorize documenting a bounded Decision Record for Slice 1 based on my previous
message, then performing the authorized implementation. Do not change Design statuses.

The Decision must record acceptance of the reviewed Demo seed verification Design
as the architectural basis solely for collector Slice 1; implementation exclusively
in tools/learn-demo-seed-verification/; bounded infrastructure checks without Simulation
or experimental evidence; prohibition of executing five cases, using B3, implementing
viewer/Learn; prohibition of src, production API, physics, numerical methods, Demo
fixtures, Explore and Guided changes; no freeze/pin or automatic Design status change;
and no staging, commit or push permission.

Keep the Decision minimal but compliant with active Governance v1 and amendment.
If needed, add only mandatory navigation to a permitted mutable document. After
recording, begin Slice 1 under the preceding task. Stop/report any new authority
conflict or required production API change. Do not run computational cases. Stop
for code review after implementation and permitted infrastructure checks.

Referenced preceding excerpts: require exact opt-in LEARN_DEMO_SEED_VERIFICATION=collect
and an explicitly specified new output directory. Absent authorization value or an
existing target must stop before Simulation creation. Ordinary npm test must not
collect/write evidence; no scientific campaign runners/selectors/P/P2 infrastructure.
Only bounded infrastructure checks guaranteed not to run real cases or write
experimental evidence are permitted. Before tests verify absent opt-in and inability
to bypass the gate. Static checks, scoped typecheck and refusal checks without
Simulation are allowed; full suite/production build, collect execution, 1200-step
cases and experimental result creation are prohibited.
