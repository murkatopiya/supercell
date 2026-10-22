# Saved Trajectory Viewer Slice 3 — bounded authorization

## Status

| Field | Value |
| --- | --- |
| Document type | DECISION RECORD |
| Approval state | APPROVED |
| Authority status | ACTIVE |
| Freeze mode | MUTABLE |
| Authority scope | Local read-only viewer of existing Slice 2 evidence and bounded viewer checks |
| Parent authority | Explicit human instruction below; Governance v1 and amendment via PROJECT_STATUS |
| Current project state | [PROJECT_STATUS](PROJECT_STATUS.md) |
| Supersedes | None; adds viewer permission outside Slices 1/2 |
| Superseded by | None |

## Decision authority

Human project owner acting as bounded implementation and developer-verification
authorizer. Recorded by Agent.

## Scope and Decision

Authorize an isolated developer-only local 3D saved-trajectory viewer, exclusively
inside tools/learn-demo-seed-verification/, plus this minimal Decision and mandatory
mutable PROJECT_STATUS navigation. Read only the existing run
2026-10-21-slice2-125957-dc632454 below artifacts/learn-demo-seed-verification/.
Verify result, provenance, checksums and source snapshot before viewing; corruption,
missing files or incompatible schema stops with diagnosis. Do not modify evidence.

Display the five saved cases, exact discrete saved steps 0–1200, recorder prefixes,
actual clockTime, concurrent paired markers, role colors/labels, active indication,
axes and ground. Include Play/Pause, Restart, manual step selection and manual camera
inspection. Camera starts at (12000,6000,12000), target (0,4000,0), FOV 50 degrees;
Follow off. No interpolation, integration or missing-sample reconstruction.

Use installed visualization libraries first; no heavy dependency additions without
separate agreement. Any local server serves only viewer/necessary local resources,
never writes evidence, uploads it or publishes automatically. Permitted checks are
scoped typecheck, static/structural tests, saved-evidence reading and local browser
smoke when available, without Simulation or collector execution. Stop for code review.

## Authority targets and reviewed identity

- [Verification Design](ux/2026-10-21-learn-mvp-demo-seed-verification-design.md),
  raw SHA-256 `095a582078bc420cf2ea8eb11940222a25691baf6cfb57a4ab96df875cdf49c0`;
  architecture basis, remaining PROPOSED / INACTIVE / MUTABLE.
- [Slice 1](2026-10-21-learn-demo-collector-slice-1-authorization.md) and
  [Slice 2](2026-10-21-learn-demo-collection-slice-2-authorization.md) retain their
  historical boundaries; the single collection permission remains consumed.
- Saved result raw SHA-256:
  `7826f9152e7be98bf27b11f859c2755f095f60a3ecce091a4695fbb1691c8678`.
- Saved provenance raw SHA-256:
  `01dbe70accf2372db8545a1b487eba7dc8f997e52fc5aabb76bf91547ae1ef8f`.
- Saved checksums raw SHA-256:
  `2a4a9db3d2a612eb8b34c5f26b249c6a046b632a2428a700e5180684f975f543`.

These are inspected input identities, not Governance freeze/pins or approval of a
future viewer implementation. No Design status change or freeze/pin is authorized.

## Authorization consequence and exclusions

Record this Decision/navigation, implement the bounded viewer, perform only allowed
checks and stop for code review. No src, production API, physics, Demo, Explore,
Guided, Learn, existing test or scientific status changes. The viewer must not import
Simulation, create a laboratory, run an integrator or invoke/import the collector.
No new trajectories, repeated cases, B3, full suite, production build or scientific
campaigns; no final Learn seed selection, staging, commit or push.

NOT INTRODUCED: scientific/model semantics. NOT CLAIMED: scientific qualification,
Phase P/P2 progression, Main L1 permission, teaching suitability or novice comprehension.
Local evidence retention remains separate from durable archival disposition.

## Date

2026-10-21.

## Source language

Russian (ru).

## Source instruction — original

**Разрешаю подготовить минимальный bounded Decision Record и реализовать отдельный локальный read-only 3D viewer для уже сохранённого evidence Slice 2.**

Перед работой сверь AGENTS.md, действующие Governance/amendment, PROJECT_STATUS, verification Design, Slice 1/2 Decisions и фактическую структуру сохранённого `result.json`.

### 1. Границы реализации

Работай исключительно в `tools/learn-demo-seed-verification/` и необходимых новых вспомогательных файлах внутри этого каталога. Для Governance разрешаю минимальный Decision Record и обязательную навигацию в mutable PROJECT_STATUS.

Не изменяй `src/**`, production API, физику, Demo, Explore, Guided, Learn, существующие тесты или научные статусы.

Viewer не должен импортировать Simulation, создавать лабораторию, запускать интегратор или вызывать collector.

### 2. Источник данных

Используй только сохранённый результат:

`artifacts/learn-demo-seed-verification/2026-10-21-slice2-125957-dc632454/`

Перед просмотром проверь наличие и согласованность `result.json`, `provenance.json`, `checksums.json`, source snapshot.

Не меняй evidence и не генерируй новые траектории.

Если обнаружится повреждение, отсутствие файлов или несовместимость схемы — остановись с диагностикой.

### 3. Viewer

Реализуй минимальную локальную 3D-страницу для просмотра сохранённых траекторий.

Обязательные возможности:

- Выбор одного из пяти сохранённых случаев: A, B1, B2, A+B1, A+B2.
- Отображение меток и их историй в трёхмерных координатах.
- Воспроизведение сохранённых состояний от шага 0 до 1200.
- Play/Pause, Restart и ручной выбор шага.
- Отображение фактического времени из `clockTime`, без замены номинальным временем.
- Различимые цвета и подписи ролей A, B1, B2.
- В парных случаях обе метки должны показываться одновременно в соответствующих сохранённых состояниях.
- Визуальная индикация активности меток.
- Оси координат и ориентир уровня земли.

Используй только сохранённые координаты. Не выполняй пространственную интерполяцию, численное интегрирование или реконструкцию отсутствующих samples. Допустимо дискретное воспроизведение сохранённых шагов.

Начальная камера: `(12000, 6000, 12000)`, цель `(0, 4000, 0)`, FOV 50°. Follow выключен. Предусмотри возможность осмотреть сцену вручную без изменения самих данных.

### 4. Изоляция и безопасность

Viewer — отдельный developer-only инструмент, не production route.

Никаких внешних загрузок данных, сетевой отправки evidence или автоматической публикации.

Если нужен локальный dev-server, он должен обслуживать только viewer и необходимые локальные ресурсы, без записи в каталог evidence.

Не добавляй тяжёлые зависимости без отдельного согласования. Сначала проверь, можно ли использовать уже установленные библиотеки визуализации.

### 5. Проверки

Разрешаю ограниченные проверки viewer без запуска Simulation и collector:

- Scoped typecheck.
- Статические и структурные тесты.
- Проверку чтения сохранённого evidence.
- Локальный browser smoke test viewer, если среда позволяет.

Не запускай пять случаев повторно, полный suite, production build или научные кампании.

[Omission: report-format list; the stopping condition and final restrictions follow verbatim.]

После реализации остановись для code review.

Не выбирай пока окончательные Learn seeds и не реализуй сам Learn. Не выполняй staging, commit или push.

## Source instruction — English translation

I authorize a minimal bounded Decision Record and a separate local read-only 3D viewer
for existing Slice 2 evidence. First check AGENTS, active Governance/amendment,
PROJECT_STATUS, verification Design, Slice 1/2 Decisions and the actual result schema.

Work exclusively in tools/learn-demo-seed-verification/ and new necessary helpers
there; Governance permits only the minimal Decision and mandatory mutable status
navigation. No src, production API, physics, Demo, Explore, Guided, Learn, existing
test or scientific status changes. No Simulation import, laboratory creation,
integrator execution or collector invocation.

Use only artifacts/learn-demo-seed-verification/2026-10-21-slice2-125957-dc632454/.
Check result/provenance/checksums/source snapshot before viewing. Never change
evidence or generate trajectories; stop diagnostically on damage, absence or
incompatible schema.

Implement five-case selection, 3D markers/history, discrete playback of steps
0–1200, Play/Pause/Restart/manual step, actual clockTime, distinct role colors/labels,
simultaneous paired states, active indication, axes and ground. Use only saved
coordinates: no spatial interpolation, numerical integration or reconstruction of
missing samples. Initial camera (12000,6000,12000), target (0,4000,0), FOV 50 degrees,
Follow off; allow manual inspection without changing data.

Developer-only, no production route. No external data loads, evidence uploads or
automatic publication. Any local server serves only viewer and necessary local
resources without writing evidence. First use installed visualization libraries;
heavy dependencies need separate agreement.

Permit scoped typecheck, static/structural tests, saved-evidence reading and local
browser smoke if available, without Simulation/collector. No repeated five-case
execution, full suite, production build or scientific campaigns.

[Omission: report-format list as in original.]

After implementation stop for code review. Do not select final Learn seeds or
implement Learn. No staging, commit or push.
