# Learn MVP Demo seed verification — documentation authorization

## Status

| Field | Value |
| --- | --- |
| Document type | DECISION RECORD |
| Approval state | APPROVED |
| Authority status | ACTIVE |
| Freeze mode | MUTABLE |
| Authority scope | Receipt of explicit human acceptance of a verification architecture approach for documentation design and bounded documentation authorization only |
| Parent authority | Human project owner instruction below; [Governance v1](DOCUMENTATION_GOVERNANCE.md) under its [adoption Decision](2026-10-11-documentation-governance-v1-adoption-decision.md), extended by the [amendment](DOCUMENTATION_GOVERNANCE_V1_AMENDMENT.md) under its [adoption Decision](2026-10-11-documentation-governance-v1-amendment-bootstrap-decision.md) |
| Current project state | [PROJECT_STATUS](PROJECT_STATUS.md) |
| Supersedes | None |
| Superseded by | None |

## Decision authority

Human project owner acting as the product decision-maker and authorizer of bounded
repository documentation work. Recorded by: Agent. This is declared provenance,
not cryptographic authentication or an inference from agent review.

## Scope

Documentation design of a small opt-in collector for exact candidate starts in
unchanged Demo Explore and a separate developer-only viewer of its saved results.
Accepted architecture is a basis for drafting, not approval of a generated artifact.

## Decision

Accept the reviewed static-audit recommendation as the basis for documentation
design. Authorize creation of the bounded Design and this Decision Record, together
with necessary permitted mutable navigation, under the restrictions in the original
instruction below. The design is to cover fresh createExploreLab instances, explicit
Demo/C/frame provenance, existing release/step/history mechanisms, exactly 1200 steps,
per-step state and independent recorder evidence, separate recorded-path viewing,
dirty-source provenance, storage, limits and unresolved implementation decisions.

Proposed candidate coordinates are A (0,1000,4000), B1 (0,1000,6000), B2 (2400,1000,0)
and reserve B3 (0,1000,-2400), metres in existing world coordinates. Main cases are
A, B1, B2, A/B1 and A/B2; checkpoints 0/300/600/900/1200 at dt=0.1 s. These describe
the proposed verification inputs, not accepted teaching fixtures or observed results.
B3 must not run automatically and needs a separate decision even after main execution
is authorized. No physical outcome or readability result is accepted in advance.

## Authority targets and reviewed identity

- Accepted subject: the architecture approach and bounded requirements reproduced in
  the human instruction below, issued on 2026-10-21. This is semantic acceptance
  for documentation design, not exact-byte approval of a repository artifact/build.
- Authorized drafting target: [Bounded Demo seed verification Design](ux/2026-10-21-learn-mvp-demo-seed-verification-design.md).
- Authorized record: this bounded Decision receipt with original-language provenance
  and English translation under the active amendment.
- Permitted current-state/navigation target: a minimal PROJECT_STATUS pointer; no
  alteration of scientific NEXT ACTION, status or owning authority boundaries.

No exact file identity was human-reviewed for this new Design. No freeze, pinning,
accepted Git snapshot, runtime identity, implementation approval or certification is
established. New documents stay MUTABLE; the frozen-identity index is not extended.
Existing [Learn product Decision](2026-10-21-learn-mvp-documentation-decision.md) and
[Learn Design](ux/2026-10-21-learn-mvp-design.md) are dependencies, not superseded.

## Authorization consequence

Read applicable governance and owners; create Design and Decision documentation;
propose specific future tool/evidence paths; record dependencies, provenance and
open decisions; add only necessary permitted mutable navigation. Preserve existing
user changes. Stop and report any authority conflict rather than bypassing it.

The new Design remains PROPOSED / INACTIVE / MUTABLE pending separate human review.
This Decision's APPROVED / ACTIVE status records explicit prior human acceptance
of the approach and authorization to document it under Governance §§4/7/8. It does
not claim human review of the generated wording or approval/activation of the new
Design. MUTABLE does not permit expanding the human decision.

## Explicitly NOT authorized

- Implement collector/viewer/Learn or change production APIs, Explore or Guided.
- Modify src, tests, data, physics, numerical methods or canonical Demo fixtures.
- Execute Simulation, tests, build, browser checks or scientific campaigns.
- Accept starting positions as teaching fixtures or claim scientific/UX outcomes.
- Create scientific PASS/FAIL, numerical tolerances, qualification or P2 certification.
- Edit frozen or other owning documents outside their prescribed governance mechanism.
- Depend on scientific campaign selectors/runners or imply P/P2/Main L1 permission.
- Stage, commit or push, or disturb existing local changes/untracked user files.

No runtime/build/evidence files are authorized for creation in this documentation
slice. After the documentation report, stop for human consideration. Execution,
release, preservation/removal actions and reserve use are separate dispositions.

## Date

2026-10-21.

## Source language

Russian (ru).

## Source instruction — original

The title is omitted. The following contiguous excerpt preserves the complete
decision-bearing instruction, including its restrictions and documentation outputs.

Мы рассмотрели твой статический аудит и предложение по проверке стартовых положений A/B.

**Принимаем рекомендуемый архитектурный подход как основу для документационного проектирования. Это не утверждение реализации и не разрешение на вычислительные или браузерные проверки.**

Текущая задача — оформить ограниченный Design и Decision Record для будущего verification harness.

## 1. Сначала восстанови governance-контекст

Прочитай актуальные:

- `AGENTS.md`;
- `docs/DOCUMENTATION_GOVERNANCE.md`;
- действующие документы adoption/amendment;
- `docs/PROJECT_STATUS.md`;
- `docs/2026-10-21-learn-mvp-documentation-decision.md`;
- `docs/ux/2026-10-21-learn-mvp-design.md`;
- применимые owning SoT для Demo, Explore, Simulation, history, rendering и UI.

Проверь authority identity и freeze mode каждого затрагиваемого документа.

Не редактируй замороженные или чужие owning-документы без предусмотренного governance-механизма.

## 2. Разрешённая документационная работа

Создай два документа с подходящими статусами и ссылками:

**A. Bounded Design — Learn MVP Demo seed verification**

Опиши предлагаемый способ точной проверки учебных стартовых положений с помощью существующего Demo Explore.

Design должен охватывать:

- ограниченный opt-in collector;
- отдельный developer-only просмотрщик сохранённой записи;
- точные входы и выходы;
- provenance;
- правила исполнения и хранения evidence;
- границы применимости результатов;
- открытые implementation decisions.

Design остаётся `PROPOSED / INACTIVE / MUTABLE` до отдельного рассмотрения.

**B. Decision Record — разрешение на документационное проектирование**

Зафиксируй, что человек разрешил оформить указанный Design и Decision Record на основании рассмотренного архитектурного предложения.

Decision должен ясно различать:

- принятие подхода для проектирования;
- разрешение создать документацию;
- отсутствие разрешения реализовать инструменты;
- отсутствие разрешения выполнять вычислительные и браузерные проверки;
- отсутствие утверждения стартовых точек или научных результатов.

Используй допустимый для текущего governance статус Decision Record. Не создавай видимость, будто новый Design уже утверждён.

## 3. Вычислительный контракт

Предлагаемый collector:

1. Создаёт свежую лабораторию через существующий `createExploreLab()` для каждого случая.
2. Явно задаёт `EXPLORE_ENVIRONMENT_DEMO_PRESCRIBED` и C = `(10, 0)` м/с.
3. Проверяет фактический `StormRelativeLaboratory`, конфигурацию Demo, существующий Euler, domain policy и `dt = 0,1 с`.
4. Устанавливает точные начальные положения через существующий `ExploreTracerSession.releasePoint()`.
5. Использует `advanceLaboratoryFixedStep()` и штатный recorder без повторной записи истории.
6. Выполняет ровно 1200 фиксированных шагов.
7. Сохраняет фактические состояния и историю.
8. Не вводит новый solver, интегратор, численный метод или физический параметр.

Кандидаты:

| Роль | Координаты (x, y, z), м |
|---|---|
| A | (0, 1000, 4000) |
| B1 | (0, 1000, 6000) |
| B2 | (2400, 1000, 0) |
| B3, резерв | (0, 1000, −2400) |

Основные случаи: A, B1, B2, A/B1, A/B2.

B3 не запускать автоматически. Его использование потребует отдельного решения.

Контрольные шаги: `0, 300, 600, 900, 1200`.

Кандидаты не являются утверждёнными учебными фикстурами.

## 4. Контракт evidence

Опиши минимальный структурированный результат, включающий:

- source/build identity, включая фактически использованные локальные изменения;
- версию и identity самого collector;
- runtime/dependency identity;
- точную конфигурацию Demo, frame, C, dt, domain policy и recorder;
- координаты, порядок выпуска и соответствие ролей tracer IDs/history lanes;
- состояние каждой метки на каждом шаге;
- целочисленный номер шага, номинальное время и фактическое `SimulationClock.time`;
- отдельные контрольные точки;
- полные фактические записи `TracerPathHistory`;
- переходы active → inactive;
- ошибки, неполные результаты и признаки целостности;
- ссылку/хеш на запись, использованную браузерным просмотрщиком.

Не округлять фактические часы до номинального времени.

При завершении у земли не заявлять точное время пересечения внутри шага: фиксировать временные границы шага, terminal position и terminal history sample.

Предусмотреть сохранение копий значений, а не ссылок на изменяемые объекты.

Разделить данные recorder и per-step states — это разные виды свидетельств.

## 5. Контракт просмотрщика

Предложенный просмотрщик:

- developer-only;
- загружает сохранённый результат collector;
- не выполняет Simulation.step и не вычисляет поле скорости;
- использует существующие механизмы сцены и рендера, насколько это возможно;
- показывает только достигнутые шаги и соответствующий префикс истории;
- не интерполирует новые пространственные положения;
- обеспечивает паузу, просмотр при 1×/5× и Reset View;
- полностью очищает отображение при переключении случаев;
- обнаруживает несовпадение количества scene slots и history lanes, а не скрывает его;
- не выдаёт результаты UX-наблюдений за научную квалификацию.

Не превращать просмотрщик в самостоятельную лабораторию или универсальную платформу визуализации.

Отдельно указать, что он не проверяет runtime/lifecycle живого `TracerViewport` и не доказывает понимание урока пользователем.

## 6. Минимальность и границы реализации

Предложи конкретные будущие пути файлов для collector, viewer, evidence и документации.

Проверь, что:

- обычный `npm test` не запускает collector и не создаёт evidence;
- инструмент требует явного opt-in;
- существующие тесты и научные кампании не переиспользуются как неявный runner;
- нет зависимости от `STORM_MOTION_VALIDATION_STAGE` и инфраструктуры Phase P/P2;
- production-код, physics и canonical Demo fixtures остаются неизменными;
- удаление временного инструмента возможно без потери необходимого evidence и provenance.

Если какая-то часть требует изменения существующего production API, обозначь это как отдельный вопрос для решения, а не как автоматически разрешённую работу.

## 7. Проверки и ограничения

В Design должны быть явно описаны:

- порядок подготовки и проверки пяти основных случаев;
- необходимость свежей лаборатории для каждого случая;
- защита от неправильного frame/C и двойной записи истории;
- различие модельного и экранного времени;
- правила работы с dirty checkout и untracked dependencies;
- проверка целостности результата;
- критерии пригодности траекторий для учебного показа;
- отдельность вычислительных фактов и UX-наблюдений;
- запрет научных PASS/FAIL, новых допусков и интерпретации результатов как P2 certification.

Не утверждать фактическую форму или различимость траекторий до выполнения проверки.

## 8. Governance и отчёт

Если governance допускает, добавь минимальные ссылки на новые документы в разрешённые индексы или `PROJECT_STATUS`, не меняя научные статусы и действующие authority boundaries.

Если изменение индекса требует отдельного разрешения — остановись на этом месте и сообщи.

После работы предоставь:

1. Созданные документы и их статусы.
2. Краткое содержание архитектурного контракта.
3. Предложенные пути будущих инструментов и evidence.
4. Открытые решения перед реализацией.
5. Список фактически изменённых файлов.
6. Diff/stat.
7. Подтверждение, что существующие пользовательские изменения сохранены.

**Строгие запреты:** не изменять `src/**`, тесты, данные, физику или численные методы; не выполнять Simulation, тесты, build, браузерные проверки, staging, commit или push.

Работай только в рамках разрешённой документации. Если обнаружится конфликт с действующим governance, не обходи его — сообщи.

После завершения остановись и дождись нашего рассмотрения.

## Source instruction — English translation

We have reviewed your static audit and proposal for checking starting positions A/B.

**We accept the recommended architecture approach as the basis for documentation
design. This is not implementation approval or permission for computational or
browser checks.**

The current task is to document a bounded Design and Decision Record for the future
verification harness.

### 1. First recover governance context

Read the current AGENTS.md; docs/DOCUMENTATION_GOVERNANCE.md; active adoption/amendment
documents; docs/PROJECT_STATUS.md; docs/2026-10-21-learn-mvp-documentation-decision.md;
docs/ux/2026-10-21-learn-mvp-design.md; and applicable owning SoTs for Demo, Explore,
Simulation, history, rendering and UI. Check authority identity and freeze mode of
each affected document. Do not edit frozen or other owning documents without the
prescribed governance mechanism.

### 2. Authorized documentation work

Create two documents with appropriate statuses and links:

**A. Bounded Design — Learn MVP Demo seed verification.** Describe the proposed
exact check of teaching starting positions using existing Demo Explore. Cover a
bounded opt-in collector; a separate developer-only saved-record viewer; exact inputs
and outputs; provenance; execution and evidence-storage rules; limits of applicability;
and open implementation decisions. The Design remains PROPOSED / INACTIVE / MUTABLE
until separate consideration.

**B. Decision Record — authorization for documentation design.** Record that a human
authorized documenting the Design and Decision based on the reviewed architecture
proposal. Clearly distinguish acceptance of an approach for design; permission to
create documentation; no permission to implement tools; no permission to perform
computational/browser checks; and no acceptance of starting positions or scientific
results. Use a Decision status allowed by current governance. Do not suggest that
the new Design is already approved.

### 3. Computational contract

The proposed collector:

1. Creates a fresh lab through existing createExploreLab() for each case.
2. Explicitly sets EXPLORE_ENVIRONMENT_DEMO_PRESCRIBED and C=(10,0) m/s.
3. Checks actual StormRelativeLaboratory, Demo configuration, existing Euler,
   domain policy and dt=0.1 s.
4. Sets exact starting positions through existing ExploreTracerSession.releasePoint().
5. Uses advanceLaboratoryFixedStep() and the normal recorder without double recording.
6. Performs exactly 1200 fixed steps.
7. Saves actual states and history.
8. Introduces no new solver, integrator, numerical method or physical parameter.

Candidates, coordinates (x,y,z) in metres: A (0,1000,4000), B1 (0,1000,6000),
B2 (2400,1000,0), B3 reserve (0,1000,-2400). Main cases: A, B1, B2, A/B1, A/B2.
Do not run B3 automatically; its use requires a separate decision. Checkpoint steps:
0,300,600,900,1200. Candidates are not accepted teaching fixtures.

### 4. Evidence contract

Describe a minimal structured result including source/build identity with actually
used local changes; collector version/identity; runtime/dependency identity; exact
Demo configuration, frame, C, dt, domain policy and recorder; coordinates, release
order and role/tracer-ID/history-lane mapping; each marker's state at every step;
integer step, nominal time and actual SimulationClock.time; separate checkpoints;
full actual TracerPathHistory records; active-to-inactive transitions; errors, partial
results and integrity indicators; and reference/hash to the record used by the viewer.

Do not round actual clock values to nominal time. On ground termination do not
claim exact crossing time within a step: record the step's time bounds, terminal
position and terminal history sample. Preserve value copies, not mutable object
references. Separate recorder data from per-step states: these are different evidence.

### 5. Viewer contract

The proposed viewer is developer-only; loads a saved collector result; does not
perform Simulation.step or compute velocity fields; uses existing scene/rendering
mechanisms where possible; shows only reached steps and the corresponding history
prefix; interpolates no new spatial positions; provides pause, 1x/5x and Reset View;
fully clears display when switching cases; detects scene-slot/history-lane count
mismatch rather than hiding it; and does not present UX observations as scientific
qualification. Do not make it a standalone laboratory or universal visualization
platform. State separately that it does not test live TracerViewport runtime/lifecycle
and does not establish user understanding of the lesson.

### 6. Minimality and implementation boundaries

Propose concrete future collector, viewer, evidence and documentation file paths.
Check that ordinary npm test does not run the collector or create evidence; the
tool requires explicit opt-in; existing tests and scientific campaigns are not
reused as an implicit runner; there is no dependence on STORM_MOTION_VALIDATION_STAGE
or Phase P/P2 infrastructure; production code, physics and canonical Demo fixtures
remain unchanged; and temporary tools can be removed without losing necessary
evidence/provenance. If something needs an existing production API change, identify
it as a separate decision question, not automatically authorized work.

### 7. Checks and limitations

The Design must explicitly describe the preparation/check order of five main cases;
fresh lab for each; protection against wrong frame/C and double history recording;
model versus screen time; dirty checkout/untracked dependencies; result integrity;
trajectory suitability for teaching; computational facts versus UX observations;
and prohibition of scientific PASS/FAIL, new tolerances and P2-certification readings.
Do not claim actual path shape or distinguishability before checking.

### 8. Governance and report

If governance allows, add minimal links in permitted indexes or PROJECT_STATUS
without changing scientific statuses or active authority boundaries. If changing an
index requires separate authorization, stop at that point and report it.

After work provide: created documents/statuses; a brief architecture contract;
proposed future tool/evidence paths; open pre-implementation decisions; actual changed
files; diff/stat; and confirmation that existing user changes were preserved.

**Strict prohibitions:** do not change src, tests, data, physics or numerical methods;
do not execute Simulation, tests, build, browser checks, staging, commit or push.
Work only within authorized documentation. Do not bypass governance conflicts:
report them. After completion stop and await our consideration.
