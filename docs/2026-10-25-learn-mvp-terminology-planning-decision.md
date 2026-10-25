# Learn MVP terminology and visual literacy — planning authorization

## Status

| Field | Value |
| --- | --- |
| Document type | DECISION RECORD |
| Approval state | APPROVED |
| Authority status | ACTIVE for bounded planning/documentation permission only |
| Freeze mode | MUTABLE |
| Authority scope | Record human-reviewed direction and authorize one proposed Learn refinement plan, separately gated Glossary proposal and necessary governance navigation |
| Parent authority | Human project owner instruction below; [Governance v1](DOCUMENTATION_GOVERNANCE.md) under [adoption](2026-10-11-documentation-governance-v1-adoption-decision.md), [bounded amendment](DOCUMENTATION_GOVERNANCE_V1_AMENDMENT.md) under [adoption](2026-10-11-documentation-governance-v1-amendment-bootstrap-decision.md) |
| Current project state | [PROJECT_STATUS](PROJECT_STATUS.md) |
| Supersedes | None |
| Superseded by | None |

## Decision authority

Human project owner communicating completed human review of the read-only audit
and issuing planning/documentation permission. Recorded by Agent, 2026-10-25.

## Scope and Decision

Record the approved vocabulary principles and audit direction as inputs. Authorize
one bounded [DESIGN implementation proposal](ux/2026-10-25-learn-mvp-terminology-visual-literacy-plan.md),
not approval of exact copy, implementation or acceptance. Include exact before/after,
working-tree file/line targets, minimal legends/layout/CSS proposals, ownership,
accessibility, tests, invariant/exclusion/rollback boundaries and human decisions.
Glossary is an independently gated sub-scope. Explore is reference context only.

Authority targets/classification: new plan = DESIGN / PROPOSED / INACTIVE / MUTABLE;
this receipt = DECISION RECORD / APPROVED / ACTIVE / MUTABLE; PROJECT_STATUS = mutable
STATUS/navigation only, not a record of new implementation or acceptance. No frozen
artifact is a target. Required authorization comes from the explicit owner instruction,
not tests, file existence or agent judgment. Governance expected frozen identities
are recovered through accepted snapshot 8d916037058a919560b6c2d01ae65823589e96bb;
mechanical verification PASS does not create human authority.

## Reviewed identity and authorization consequence

Input: the preceding read-only audit's main recommendations, human-approved as a
direction only, and current working-tree implementation at HEAD
c3769f8af0cd662afcda6242cf952b7791e6065a (21 modified / 33 untracked entries before
planning). No immutable code pin, exact-copy approval or scientific classification
is inferred. Stage 2 and visual refinement acceptance remain pending.

INTRODUCED: bounded planning/documentation action only.
NOT INTRODUCED: scientific/model semantics or computation changes.
NOT CLAIMED: plan approval, implementation permission, Learn MVP/Stage 2 acceptance.

## Explicitly NOT authorized and stop gate

No production/UI/CSS/test/configuration/scientific-fixture/frozen-record changes,
scientific execution, commit, push or deploy. No global terminology replacement,
Explore UI unification, automatic Glossary implementation, arrow-scale unification,
new camera/picking/gesture/boundary/measurement/vector semantics or automatic acceptance.
Stop after planning; human review and explicit bounded implementation authorization
must follow separately.

## Source language

Russian (ru), with original English authorization and stop markers retained.

## Source instruction — English translation

Begin Learn MVP Terminology & Visual Literacy Refinement planning. The previous
read-only audit passed human review; its main recommendations are approved as a
direction, but specific changes are not approved. Human authorization: PLANNING +
DOCUMENTATION ONLY. Read implementation, prepare a bounded implementation plan and
corresponding planning/decision documentation in docs. Do not modify production
code, UI, CSS, tests, scientific fixtures or frozen records; no commit, push, deploy
or scientific execution. This is not implementation permission.

Make the four lessons didactically consistent: spatial orientation; passive tracers
and recorded paths; local airflow velocity; stationary measurements and spatial
variation. Explain each new visual symbol at first appearance, keeping legends minimal.
Propose exact English copy from the human-approved distinctions: passive tracer is a
virtual object advected by the prescribed model velocity field; marker is its visible
position symbol; stationary probe samples a point and B is repositioned between
measurements rather than carried by air. Velocity field is mathematical;
prescribed velocity field is the Learn Demo source, not storm reconstruction or
forecast; model airflow is the novice description; local velocity belongs to a
point; storm-relative velocity is relative to prescribed C; recorded path is not
a streamline/forecast; model time differs from playback; height is above model
ground, not MSL or real terrain. Allow clear contextual synonyms, not global replacement.
Preserve prescribed/passive/steady-nonuniform/frame/components/display-scale caveats.

For Slice 1 replace the “already contains a calculated airflow” claim, preferably
with “We’ll use this 3D space to explore a prescribed model airflow”; check neighbouring
copy and explain only actually rendered grid/ground/cardinals/vertical axis/origin.
For Slice 2 introduce passive tracer versus marker, propose always-visible A/B,
position/path/start-ring/height-guide/ground-projection legend; distinguish coloured
start rings from small ground rings; move needed explanations out of Details and
remove duplication, retaining the no-individual-real-parcels caveat. For Slice 3
propose marker/path/velocity-arrow/start-ring/height-guide legend; no invented 3D
references or second arrows. Propose Selected moment and Saved reference instead
of Current/Reference; inspect labels, empty states, accessibility, tests and docs.
Explain arrow length as speed display rather than displacement, retaining steady
field versus varying along-path velocity. For Slice 4 keep Reading the scene,
propose only duplicate-copy reductions and possibly Reset B. Do not change bounds,
camera, picking, gestures, measurements, vector geometry or scientific meaning.

Do not equalize scales 40 and 80: explain fixed within-lesson display scale,
non-comparable cross-lesson screen lengths, perspective and no path/predicted
displacement, placing explanations without clutter. Separately propose replacing
Glossary's “moving probe” definition to distinguish passive tracer from stationary
measurement probe; check neighbours and Learn/Explore links. Glossary implementation
is not automatically included with Learn. Explore remains reference context, with
future candidates outside implementation scope. Preserve observed environmental
wind versus prescribed storm-local flow/C, composite laboratory field and non-operand
Analysis diagnostics; do not imply reconstruction or forecast.

Plan exact before/after copy and working-tree file/line targets, legend components/
ownership, responsive/accessibility layout, minimal CSS, unit/regression/semantic/
accessibility/responsive test impact, invariants, rollback, exclusions and open human
decisions. Assess reuse of CompareFlowLegend presentation without unnecessary shared
abstraction. Record HEAD/status first; prior 21 modified/33 untracked entries must
not be cleaned or committed. Stage 2/refinement acceptance remains pending, not
replaced by planning PASS. Create one bounded planning document and return its link,
lesson proposals, separate Glossary proposal, files, tests, decisions and confirmation
of no production/test/CSS changes. Do not update PROJECT_STATUS as if implementation
or acceptance occurred. Stop after planning; await explicit implementation permission.

## Source instruction — original

Огонёчка, приступаем к планированию Learn MVP — Terminology & Visual Literacy Refinement.

Предыдущий read-only аудит терминологии и визуальных обозначений завершён. Его результаты прошли human review; основные рекомендации одобрены как направление работы, но конкретные изменения ещё не утверждены.

## Authorization

**Human authorization: PLANNING + DOCUMENTATION ONLY.**

Разрешаю изучать текущую реализацию, составить ограниченный implementation plan и создать соответствующий planning/decision document в `docs/`.

Не изменяй production code, UI, CSS, tests, scientific fixtures или frozen records. Не выполняй commit, push, deploy или scientific execution.

Не считай этот запрос разрешением на реализацию.

## 1. Цель

Завершить дидактическую согласованность четырёх уроков Learn:

1. Look Around — spatial orientation.
2. Follow Motion — passive tracers and recorded paths.
3. Read the Motion — local airflow velocity.
4. Compare the Flow — stationary measurements and spatial variation.

Пользователь должен понимать каждый новый визуальный символ при первом появлении и последовательно осваивать физические понятия.

Сохрани минималистичный интерфейс. Не превращай легенды в энциклопедию.

## 2. Canonical terminology

Подготовь точные UI copy proposals на основе следующих human-approved principles:

- `passive tracer` / `tracer` — виртуальный объект, адвектируемый prescribed model velocity field.
- `tracer marker` / `marker` — видимый символ текущего положения трассера.
- `stationary probe` / `probe` — пространственная точка измерения; B может переставляться между измерениями, но не переносится потоком.
- `velocity field` — математическое поле векторов скорости.
- `prescribed velocity field` — источник Learn Demo; не реконструкция и не прогноз реального шторма.
- `model airflow` — доступное новичку описание модельного движения воздуха.
- `local airflow velocity` — вектор скорости в определённой точке.
- `storm-relative velocity` — скорость относительно предписанного движения шторма C.
- `recorded path` — записанная траектория движения трассера, не streamline или forecast.
- `model time` — время модели, не обязательно длительность воспроизведения.
- `height above model ground` — не MSL или реальный рельеф.

Не выполняй глобальную замену терминов. Контекстные синонимы допустимы, если смысл однозначен.

Сохрани научные оговорки о prescribed Demo, passive tracer, steady-but-nonuniform field, storm-relative frame, component interpretation и display-only arrow scale.

## 3. Lesson-specific changes

### Slice 1 — Look Around

Предложи точную замену фразы:

“This 3D space already contains a calculated airflow, but you can't see it yet.”

Цель — не создавать впечатление, что orientation-only scene уже содержит вычисляемое поле.

Предпочтительное направление:

“We’ll use this 3D space to explore a prescribed model airflow.”

Проверь соседние фразы, чтобы введение было естественным.

Предложи минимальное пояснение grid, model ground, N/E/S/W, vertical axis и origin, только если они реально отображаются.

### Slice 2 — Follow Motion

Введи `passive tracer` при первом появлении движущихся маркеров и объясни связь:

- tracer — виртуальный объект, движение которого вычисляется по полю;
- marker — видимое обозначение его положения.

Предложи постоянно видимую компактную легенду:

- A/B marker identities;
- current tracer position;
- recorded path;
- starting ring;
- height guide and ground projection.

Отдели цветное стартовое кольцо от малого наземного кольца.

Перенеси необходимые пояснения из Details ближе к сцене и предложи сокращения дублирующего текста.

Не удаляй оговорку, что трассеры не представляют индивидуальные реальные air parcels.

### Slice 3 — Read the Motion

Предложи контекстную легенду:

- tracer marker and recorded path;
- local velocity arrow;
- starting ring;
- height guide.

Не добавляй вымышленных Reference objects или вторых стрелок в 3D.

Для панели сравнения предложи:

- `Selected moment` вместо неоднозначного `Current`;
- `Saved reference` вместо `Reference`.

Проверь все зависимые labels, empty states, accessibility names, tests и documentation references.

Объясни, что длина стрелки является графическим представлением скорости, а не расстоянием перемещения трассера.

Сохрани различие между stationary Demo field и меняющимися значениями скорости вдоль пути.

### Slice 4 — Compare the Flow

Сохрани существующую `Reading the scene`.

Предложи только минимальные сокращения повторяющегося текста и, если это улучшает точность, `Reset B` вместо `Reset Probes`.

Не изменяй placement bounds, камеру, picking, gestures, measurements, vector geometry или научную семантику.

## 4. Arrow scale clarity

В Slice 3 используется display scale 40, в Slice 4 — 80.

Это не ошибка физики. Не предлагай механически уравнять масштабы.

Предложи краткое и понятное пояснение:

- внутри каждого урока используется постоянный display scale;
- экранные длины стрелок между разными уроками нельзя напрямую сравнивать;
- перспектива влияет на видимую длину;
- графическая стрелка не обозначает путь или предсказанное перемещение.

Размести пояснение там, где оно действительно необходимо, без перегрузки легенд.

## 5. Shared Glossary — separate bounded sub-scope

Подготовь отдельное предложение по уточнению определения:

“A passive tracer is a moving probe carried by V_total.”

Предпочтительное направление — различать virtual passive tracer и stationary measurement probe.

Проверь соседние определения и ссылки на Glossary из Learn и Explore.

Это отдельный sub-scope: не считай его реализацию автоматически разрешённой вместе с Learn.

## 6. Explore — excluded from implementation

Explore в этом этапе только reference context.

Не планируй массовую унификацию Explore UI.

В отчёте можно указать отдельные будущие terminology candidates, но не включай их в текущий implementation scope.

Особенно сохрани различие:

- observed environmental wind input;
- prescribed storm-local kinematic components;
- prescribed storm motion C;
- composite laboratory velocity field;
- Analysis diagnostics, которые не являются velocity operand.

Не представляй Explore как наблюдательную реконструкцию или прогностическую модель реального шторма.

## 7. Implementation plan requirements

Подготовь конкретный, минимальный план, включающий:

1. Proposed final English copy — before/after для каждого изменения.
2. Точные file:line targets по текущему working tree.
3. Новые или переиспользуемые компоненты легенд и их ownership.
4. Desktop/mobile layout и accessibility considerations.
5. Минимальные CSS-изменения.
6. Test impact: unit, regression, semantic copy assertions, accessibility и responsive.
7. Scientific and architectural invariants.
8. Rollback strategy.
9. Scope exclusions.
10. Open human decisions.

Отдельно оцени, можно ли переиспользовать presentation patterns `CompareFlowLegend`, не создавая ненужной shared abstraction.

## 8. Repository hygiene

Зафиксируй HEAD и working tree status перед планированием.

В предыдущем аудите было 21 modified + 33 untracked entries. Не пытайся автоматически очищать или коммитить working tree.

Учитывай, что Learn Stage 2 и его visual refinement пока ожидают human technical/visual acceptance.

Никакой planning PASS не заменяет эту приёмку.

## 9. Deliverable

Создай один ограниченный planning document в `docs/` и верни краткий отчёт:

- ссылка на документ;
- proposed changes по каждому уроку;
- отдельное предложение по Glossary;
- список затрагиваемых файлов;
- тестовая стратегия;
- открытые human decisions;
- подтверждение, что production code/tests/CSS не изменены.

Не обновляй `PROJECT_STATUS` так, будто реализация или приёмка уже состоялись.

**Stop after planning. Await explicit human implementation authorization.**
