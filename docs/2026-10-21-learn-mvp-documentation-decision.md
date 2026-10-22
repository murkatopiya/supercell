# Learn MVP — product boundaries and documentation authorization

## Status

| Field | Value |
| --- | --- |
| Document type | DECISION RECORD |
| Approval state | APPROVED |
| Authority status | ACTIVE |
| Freeze mode | MUTABLE |
| Authority scope | Receipt of the explicit human product decisions and bounded documentation authorization below; not approval/activation of the resulting Design |
| Parent authority | Human project owner instruction reproduced below; [Governance v1](DOCUMENTATION_GOVERNANCE.md) under its [adoption Decision](2026-10-11-documentation-governance-v1-adoption-decision.md), extended by the [amendment](DOCUMENTATION_GOVERNANCE_V1_AMENDMENT.md) under its [adoption Decision](2026-10-11-documentation-governance-v1-amendment-bootstrap-decision.md) |
| Current project state | [PROJECT_STATUS](PROJECT_STATUS.md) |
| Supersedes | None |
| Superseded by | None |

## Decision authority

Human project owner acting as the product decision-maker and authorizer of bounded
repository documentation work. Recorded by: Agent. This declared role is provenance,
not cryptographic authentication.

## Scope

One Learn MVP introductory experience, its accepted product constraints, and creation
of a proposed architecture/UX design with complete primary teaching copy. This is
documentation authorization only. Existing scientific and current UI authorities
remain in force; this record does not silently supersede them.

## Decision

Accept the Learn concept as the basis for bounded architecture/UX design and authorize
its documentation in the repository. Accepted constraints:

1. One introductory experience: look around, follow motion, compare together, try
   independently. No generic lesson engine or future catalog infrastructure.
2. Learn and Explore are equal, always-accessible Landing entries, with mutual
   navigation and return to choice. No compulsory lesson, unlock, registration or
   knowledge gate. Explore's research capabilities remain available without learning.
3. Only one active session. Confirmed transitions end it; no result/state transfer,
   persistence, recovery or server storage. Warn when user work could be lost.
4. Keep Guided separate, unchanged, unrenamed and not automatically published.
5. Prepared A and several prepared B choices, selectable by scene marker or accessible
   ordinary control; an unexplained choice in the independent stage. Free placement
   remains in Explore. A/B replay simultaneously from zero using existing mechanisms.
6. Desktop-first, not mouse-only: keyboard completion without mandatory camera orbit
   or precise 3D picking.
7. Beginner language, one new meaning/action at a time, complete primary card text,
   and no specific path-shape/direction conclusion before Demo verification.
8. Same existing scientific computation, explicit frame/Demo C, integrator/fixed step,
   tracer lifecycle and history. Demo only for Learn; no lesson T1 or C editing.

## Authority targets and reviewed identity

- Accepted target: the conceptual product boundaries restated in the human instruction
  below, issued on 2026-10-21; this is semantic concept acceptance, not acceptance of
  an exact repository file, build or numerical result.
- Authorized drafting target: [Learn MVP Design](ux/2026-10-21-learn-mvp-design.md).
  This newly written file has not been human-reviewed or approved by this instruction.
- Permitted mutable current-state/navigation consequence: PROJECT_STATUS pointer to
  this Decision and the proposal. This does not change the scientific NEXT ACTION.
- Existing UI/architecture contracts are dependencies to reconcile, not superseded
  targets. Their relations are listed in the Design §9.

No reviewed artifact digest, freeze, pin, accepted Git snapshot or implementation
identity is asserted. None was specified for this new work. The authority of this
record comes from the explicit instruction to record decisions, not file existence.

## Authorization consequence

Read the governing documents; write the bounded Design and Decision receipt; document
dependencies, required agreements and pending runtime/user checks; add necessary
permitted mutable navigation. The Design stays PROPOSED / INACTIVE / MUTABLE pending
separate human review and disposition. This Decision's APPROVED / ACTIVE metadata
records explicit prior human acceptance of the constraints and documentation action
under Governance §§4/7/8; it does not assert human review of newly generated wording.
MUTABLE is not permission to expand the recorded decision.

## Explicitly NOT authorized

Implementation or application changes, including src, tests, data, physics, numerical
methods, Explore or Guided behavior; scientific campaigns/qualification runs; frozen
artifact edits; automatic commit/push; deletion, overwrite, restoration or staging of
pre-existing local changes/untracked user files. Preserve those files untouched.
This documentation slice runs no runtime/user study and authorizes none implicitly.
No design activation, freeze, pinning, release/publication or scientific classification
is inferred. Phase P/P2/Main L1 retain their precise status in PROJECT_STATUS, rather
than being collectively reclassified as 'closed'.

## Date

2026-10-21.

## Source language

Russian (ru).

## Source instruction — original

The greeting is omitted. The following is the complete contiguous decision-bearing
instruction, including restrictions and requested documentation outputs.

Мы рассмотрели предложенный тобой концепт Learn MVP и принимаем его как основу для ограниченного архитектурного и UX-дизайна.

**Разрешаем документационное оформление Learn MVP в репозитории. Реализация пока НЕ разрешена.**

## 1. Принятые продуктовые решения

**Структура Learn**

Один вводный учебный опыт в четырёх состояниях одной сцены:

1. Осмотреться.
2. Проследить движение.
3. Сравнить вместе.
4. Попробовать самому.

Не создавать универсальный lesson engine или инфраструктуру будущего каталога.

**Навигация**

Learn и Explore — два равноправных, постоянно доступных входа с Landing.

Никаких обязательных уроков, разблокировки Explore, регистрации или проверки знаний для доступа к лаборатории.

В обоих режимах доступны переход в другой режим и возвращение к выбору.

**Сеансы**

Для MVP одновременно существует один активный сеанс.

При подтверждённом переходе он завершается, результаты не переносятся и не сохраняются. Предупреждение требуется при потенциальной потере пользовательской работы.

Не проектировать persistence, восстановление сеансов или серверное хранение.

**Guided**

Существующий Guided сохраняется отдельно, без переименования и автоматической публикации.

**Стартовые положения**

Принимаем твою рекомендацию: подготовленные маркеры вместо свободного размещения в Learn MVP.

Первое положение A подготовлено заранее. Второе положение B пользователь выбирает из нескольких обозначенных вариантов — кликом по маркеру или обычным доступным элементом управления.

В самостоятельной части посетитель выбирает другой, ранее не разобранный вариант.

Свободное размещение остаётся в Explore.

**Сравнение**

Метки A и B запускаются одновременно с нулевого времени через существующие вычислительные механизмы.

Изменение стартового положения не меняет заданное поле.

**Устройства и доступность**

Desktop-first, но не mouse-only. Основной путь должен быть доступен с клавиатуры, без обязательного вращения камеры и точного попадания в трёхмерные объекты.

## 2. Принципиальное требование к языку обучения

Learn рассчитан на абсолютного новичка.

**Объяснять максимально доступно, но без искажения физического смысла.**

Не использовать специальные термины до их объяснения. Не перегружать посетителя определениями и не превращать карточки в научные лекции.

В каждый момент — один новый смысл и одно понятное действие.

Мы предпочитаем живой, естественный язык вместо технических формулировок, даже если техническая формулировка формально точнее.

Например, для первого знакомства со сценой предлагаем:

> «Перед тобой трёхмерное пространство, в котором мы будем исследовать движение воздуха с помощью компьютерной модели. Нижняя плоскость показывает уровень земли, а направление вверх — высоту».

Затем отдельной короткой карточкой объяснить, что воздух непосредственно не виден и для наблюдения мы используем вычислительные метки.

Это пример желаемого уровня доступности, а не разрешение утверждать, что модель воспроизводит реальную грозу.

**Просим включить в UX-дизайн реальные тексты всех основных учебных карточек**, а не только их названия и технические назначения.

Тексты должны быть понятны человеку без подготовки по метеорологии, физике или программированию.

Если термин необходим, объясняй его в момент первого появления.

Не путать:
- заданное движение воздуха в модели с наблюдениями реальной грозы;
- трассер с реальной частицей;
- прошлую траекторию с предсказанием будущего пути;
- скорость просмотра со скоростью воздуха;
- опорную плоскость с картой реальной местности.

Конкретные выводы о форме или направлении траекторий разрешается утверждать только после соответствующей проверки Demo.

## 3. Научные инварианты

Learn и Explore используют одну существующую вычислительную реализацию:

- составное поле Demo;
- явно заданные frame и prescribed C;
- существующий интегратор и фиксированный временной шаг;
- существующие правила движения и завершения трассеров;
- существующую запись истории.

Никакой отдельной учебной физики, нарисованных вместо вычисленных траекторий или изменений численных методов.

Первый урок не вводит T1, изменение C и сложные диагностические инструменты.

Phase P/P2, Main L1 и научные кампании остаются закрытыми в соответствии с действующим статусом.

## 4. Что разрешено сделать

Сначала изучи действующие AGENTS.md, DOCUMENTATION_GOVERNANCE.md, adoption decision, amendments, PROJECT_STATUS и соответствующие UI/architecture SoT.

Затем:

1. Определи корректное место и статус новых документов в существующей иерархии authority.
2. Оформи ограниченный Learn MVP Design с четырьмя состояниями, действиями, UI-компонентами, навигацией, жизненным циклом сеанса и текстами карточек.
3. Оформи соответствующий Decision Record или иной предусмотренный governance механизм фиксации принятых продуктовых решений.
4. Зафиксируй зависимости и необходимые согласования с действующими UI-документами.
5. Отдельно перечисли runtime- и пользовательские проверки, обязательные до утверждения конкретных наблюдаемых выводов.
6. При необходимости обнови разрешённые mutable-индексы и ссылки, строго соблюдая правила governance.

Если изменение какого-либо документа запрещено его статусом, **не редактируй его**. Используй разрешённый successor, amendment или внешний decision mechanism.

Не объявляй новый документ ACTIVE/APPROVED только потому, что мы согласовали концепт. Применяй ровно те статусы, которые допускает governance и объём данного разрешения. Если для активации требуется отдельный формальный шаг — оставь его явным.

## 5. Что запрещено

- Любые изменения `src/**`, тестов, данных, физики, вычислений и интерфейса приложения.
- Начало реализации Learn.
- Изменение поведения Explore или Guided.
- Проведение научных кампаний и квалификационных прогонов.
- Изменение frozen-артефактов.
- Удаление, перезапись, восстановление или включение в коммит существующих локальных незакоммиченных пользовательских файлов.

Сохраняй все локальные изменения и untracked-файлы без вмешательства.

Не выполняй автоматический коммит или push. После оформления документации покажи diff и отчёт.

## 6. Формат результата

Предоставь:

- Перечень созданных или изменённых документов и их governance-статусы.
- Краткую карту Learn MVP.
- Тексты учебных карточек.
- Перечень научных и UX-инвариантов.
- Список открытых вопросов и проверок.
- Объяснение, почему изменения соответствуют действующей документационной иерархии.
- Результат проверки diff: какие файлы затронуты, какие оставлены без изменений.

**Цель текущего шага — согласованный документационный фундамент для одного вводного урока, а не готовый интерфейс.**

Если обнаружишь governance-противоречие, не обходи его. Останови соответствующее действие и объясни, какое решение требуется от нас.

## Source instruction — English translation

We have considered the Learn MVP concept you proposed and accept it as the basis
for bounded architectural and UX design.

**We authorize documenting Learn MVP in the repository. Implementation is NOT yet authorized.**

### 1. Accepted product decisions

**Learn structure**

One introductory learning experience in four states of one scene:

1. Look around.
2. Follow the motion.
3. Compare together.
4. Try independently.

Do not create a universal lesson engine or infrastructure for a future catalog.

**Navigation**

Learn and Explore are two equal, always-accessible entries from Landing.

No mandatory lessons, Explore unlocking, registration or knowledge checks for access
to the laboratory. Both modes offer switching to the other mode and returning to choice.

**Sessions**

For MVP, only one active session exists at a time. A confirmed transition ends it;
results are neither transferred nor saved. A warning is required when user work may
be lost. Do not design persistence, session recovery or server storage.

**Guided**

Existing Guided remains separate, without renaming or automatic publication.

**Starting positions**

We accept your recommendation: prepared markers instead of free placement in Learn
MVP. The first position A is prepared in advance. The user chooses position B from
several labelled options by clicking a marker or using an ordinary accessible
control. In the independent part, the visitor chooses a different option not
previously explained. Free placement remains in Explore.

**Comparison**

Markers A and B start simultaneously from zero time through existing computational
mechanisms. Changing the starting position does not change the prescribed field.

**Devices and accessibility**

Desktop-first, but not mouse-only. The main path must be accessible by keyboard,
without mandatory camera rotation or precise targeting of three-dimensional objects.

### 2. Fundamental requirement for teaching language

Learn is for an absolute beginner. **Explain as accessibly as possible without
distorting physical meaning.** Do not use technical terms before explaining them.
Do not overload visitors with definitions or turn cards into scientific lectures.
At each moment, one new meaning and one understandable action.

We prefer lively, natural language over technical formulations, even when a technical
formulation is formally more precise. For example, for the first introduction:

> Before you is a three-dimensional space in which we will investigate air motion
> using a computer model. The lower plane shows ground level, and upward indicates height.

Then explain in a separate short card that air is not directly visible and that we
use computational markers to observe it. This is an example of the desired level
of accessibility, not permission to claim the model reproduces a real storm.

**Please include actual text for all main teaching cards in the UX design**, not
just their names and technical purposes. Text must be understandable without
meteorology, physics or programming training. Explain a necessary term when it first
appears. Do not confuse:

- prescribed air motion in the model with observations of a real storm;
- a tracer with a real particle;
- a past trajectory with a prediction of the future path;
- playback speed with air speed;
- a reference plane with a map of real terrain.

Specific conclusions about trajectory shape or direction may be asserted only
after the corresponding Demo verification.

### 3. Scientific invariants

Learn and Explore use one existing computational implementation:

- the Demo composite field;
- explicitly specified frame and prescribed C;
- the existing integrator and fixed timestep;
- existing tracer motion and termination rules;
- existing history recording.

No separate teaching physics, drawn rather than computed trajectories, or changes
to numerical methods. The first lesson does not introduce T1, C changes or complex
diagnostic tools. Phase P/P2, Main L1 and scientific campaigns remain closed in
accordance with the current status.

### 4. What is authorized

First study the applicable AGENTS.md, DOCUMENTATION_GOVERNANCE.md, adoption decision,
amendments, PROJECT_STATUS and corresponding UI/architecture SoTs. Then:

1. Determine the correct location and status of new documents in the existing
   authority hierarchy.
2. Document a bounded Learn MVP Design with four states, actions, UI components,
   navigation, session lifecycle and card texts.
3. Document the corresponding Decision Record or another governance-prescribed
   mechanism for recording the accepted product decisions.
4. Record dependencies and required agreements with existing UI documents.
5. Separately list runtime and user checks required before accepting specific
   observable conclusions.
6. If needed, update permitted mutable indexes and links, strictly following governance.

If a document's status prohibits changing it, **do not edit it**. Use an allowed
successor, amendment or external decision mechanism.

Do not declare a new document ACTIVE/APPROVED merely because we agreed on the
concept. Apply exactly the statuses allowed by governance and the scope of this
authorization. If activation requires a separate formal step, leave it explicit.

### 5. What is prohibited

- Any changes to src, tests, data, physics, computations or the application interface.
- Starting Learn implementation.
- Changing Explore or Guided behavior.
- Running scientific campaigns and qualification executions.
- Changing frozen artifacts.
- Deleting, overwriting, restoring or including in a commit existing local uncommitted
  user files.

Preserve all local changes and untracked files without interference. Do not perform
an automatic commit or push. After documenting, show the diff and report.

### 6. Result format

Provide:

- Created or changed documents and their governance statuses.
- A brief Learn MVP map.
- Teaching card texts.
- Scientific and UX invariants.
- Open questions and checks.
- Why the changes comply with the existing documentation hierarchy.
- Diff verification: which files were affected and which remained unchanged.

**The goal of this step is an agreed documentary foundation for one introductory
lesson, not a ready interface.** If you discover a governance contradiction, do not
bypass it. Stop the corresponding action and explain what decision is required from us.
