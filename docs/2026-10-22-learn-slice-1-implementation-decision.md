# Learn — navigation reconciliation and implementation Slice 1

## Status

| Field | Value |
| --- | --- |
| Document type | DECISION RECORD |
| Approval state | APPROVED |
| Authority status | ACTIVE |
| Freeze mode | MUTABLE |
| Authority scope | Receipt of bounded Learn navigation approval and static Look Around implementation authorization |
| Parent authority | Human project owner instruction below; [Governance v1](DOCUMENTATION_GOVERNANCE.md) under its [adoption](2026-10-11-documentation-governance-v1-adoption-decision.md), extended by the [amendment](DOCUMENTATION_GOVERNANCE_V1_AMENDMENT.md) under its [adoption](2026-10-11-documentation-governance-v1-amendment-bootstrap-decision.md) |
| Current project state | [PROJECT_STATUS](PROJECT_STATUS.md) |
| Supersedes | Only the exclusive public Explore entry restriction in UI 07 for this bounded surface; earlier Learn implementation prohibitions only for Slice 1 |
| Superseded by | None |

## Decision authority

Human project owner, acting as product decision-maker and authorizer of bounded
implementation. Recorded by: Agent. This records the explicit decision, not human
review of the resulting code or generated record wording.

## Scope and Decision

Approve and authorize Slice 1: equal Learn and Explore Landing buttons; a separate
Learn surface with Look Around, static camera-controlled 3D space, Reset View,
the supplied English smoke analogy, two-start reflection question and scientific
disclosure; return to Landing or enter Explore using the existing entry helper.
No markers, Simulation, stepping or experimental results belong to this slice.

This external bounded navigation disposition reconciles
[UI 07](ui/07-app-navigation-and-mode-entry.md) §§2–6, 9, 11, 13 and 16 only where
they limit public entry to Explore or identify only laboratory modes. Learn is an
AppSurface, not a new computational `lab.kind`. Guided and Explore remain the only
laboratory kinds under [architecture 16](architecture/16-explore-guided-interaction-architecture.md).
Existing laboratory control, scene, coordinate and lifecycle contracts remain binding.
Their source bytes are not rewritten. This is the human-authorized external
amendment/disposition under Governance §§8/12, not a second general UI specification.

The [Learn Design](ux/2026-10-21-learn-mvp-design.md) remains PROPOSED / INACTIVE /
MUTABLE as a whole. Only this bounded static subset is authorized; its later marker
reveal/start controls, seed replacement, comparison, loss guards for user-created
experimental work, and mutual in-laboratory navigation are not implemented here.
The untouched orientation scene has no experimental work to discard. Camera-only
changes do not require an exit confirmation in this slice.

## Authority targets and reviewed identity

- Human-declared published baseline: `main @ c3769f8af0cd662afcda6242cf952b7791e6065a`.
- Implementation targets: App surface branch, Landing CTAs/copy, scoped Learn page
  and orientation viewport, styles and related UI tests.
- Reconciled authority targets: UI 07 navigation and the Learn Design's static
  subset, read alongside the [prior product Decision](2026-10-21-learn-mvp-documentation-decision.md).
- Current-state consequence owner: PROJECT_STATUS (STATUS, mutable, navigation only).
- Inherited rendering: [scene](rendering/01-tracer-scene.md),
  [camera fixture](rendering/11-deep-storm-tracer-view.md),
  [coordinate reference](ui/09-world-coordinate-reference.md),
  [laboratory controls](ui/08-scene-toolbar-and-control-states.md).

No new exact-byte pin, frozen identity, accepted snapshot, scientific classification
or reviewed implementation identity is asserted. Existing frozen Governance identities
were checked against accepted snapshot `8d916037058a919560b6c2d01ae65823589e96bb`;
the pre-amendment Governance v1 digest also matches its adoption Decision.
New targets are this MUTABLE Decision and the mutable STATUS pointer; no frozen
authority is an edit target. No approval of the complete Learn Design is inferred.

## Authorization consequence

Implement and run bounded UI/type/lifecycle developer checks, plus browser smoke
if available. Reuse `TracerScene(canvas, 0)` and its existing camera/reset/disposal
API without `TracerViewport`, laboratory construction or a stepping scheduler.
The animation callback renders camera changes only. Preserve Explore's entry helper,
initial Goshen environment and Guided behavior. Record completion and verification
limits in PROJECT_STATUS, then stop for human code/visual review.

## Explicitly NOT authorized

Commit, push, deploy, scientific runs or qualification; physics/numerical/data/C/T1
or scientific-protocol changes; frozen-document edits; unrelated dirty/untracked
file changes; additional lessons, marker launch or fabricated experiment results;
collector/developer viewer/saved evidence as production dependencies. Smoke is an
analogy for seeing motion only, not modeled smoke, buoyancy or dispersion.
Phase P/P2/Main L1 gates retain their existing dispositions. Developer verification
is NOT CLAIMED as scientific qualification, teaching efficacy or human acceptance.

## Date

2026-10-22.

## Source language

Russian (ru), with English product copy and technical identifiers.

## Source instruction — original

Bounded verbatim excerpts; omissions are explicitly marked. The omitted English
copy is reproduced in the implementation; no omitted text grants broader authority.

> **Human decision: APPROVED — bounded implementation authorized.**
>
> Огонёчка, владелец проекта согласовал реализацию первого вертикального среза Learn.
>
> Текущий опубликованный baseline:
>
> `main @ c3769f8af0cd662afcda6242cf952b7791e6065a`

[Omission: required reading list, represented by the authority links above.]

> Разрешаю создать **один bounded Decision Record**, объединяющий согласование Learn-навигации и реализацию Slice 1, если это допускается Governance.
>
> Зафиксируй, что Learn — отдельная продуктовая поверхность, не новый вычислительный `lab.kind`.
>
> При конфликте с действующим UI SoT не редактируй frozen-документы. Используй предусмотренный Governance amendment/successor; если это требует дополнительного scope, остановись.
>
> Не создавай дополнительные Decision Records без содержательной необходимости.

> После реализации пользователь должен иметь возможность:
>
> 1. Открыть Landing и увидеть два равноправных входа: **Learn** и **Explore**.
> 2. Выбрать Learn.
> 3. Попасть на первый экран **Look Around**.
> 4. Увидеть статическое 3D-пространство, осмотреть его камерой и вернуть исходный вид.
> 5. Прочитать короткое объяснение через аналогию с дымом.
> 6. Увидеть вопрос о двух метках, начинающих движение на одинаковой высоте.
> 7. Вернуться на Landing или перейти в Explore.

> Не показывай неработающие кнопки запуска, переходы к несуществующим урокам или фиктивные результаты эксперимента.
>
> Используй как стартовую редакцию:
>
> **Heading:** Look Around
>
> **Introduction:**
>
> How can we see air moving when air itself is invisible?
>
> Imagine smoke drifting in the wind. Its movement helps us see where the air is going. In this model, we'll use colored markers to follow a calculated airflow.
>
> **Question:**
>
> Two markers start at the same height, but in different places. Do you think they'll follow the same path?
>
> **Scientific disclosure:**
>
> This is a computer model with a prescribed velocity field, not a reconstruction or forecast of a particular storm.
>
> Смысл аналогии ограничен визуализацией движения. Не утверждай, что модель вычисляет дым, плавучесть или рассеивание.
>
> Текст может быть немного адаптирован для читаемости, но без изменения научного смысла.

[Omission: suggested file list.]

> Используй существующий `AppSurface`, добавив Learn до ветки `lab === null → Landing`.
>
> Для статической сцены разрешено повторно использовать `TracerScene` без меток и Simulation, если это подтверждается актуальными API.
>
> Не подключай `TracerViewport`, если он требует Simulation и запускает stepping.
>
> Не дублируй физический движок.
>
> Обеспечь корректные mount/unmount, renderer disposal, OrbitControls cleanup, resize handling и отмену render loop.
>
> Обязательно сохранить:
>
> - Explore → существующий `enterExplore`;
> - начальную среду Explore (Goshen);
> - Guided без изменений;
> - существующие Demo physics/C/integration/history;
> - отсутствие Simulation в Learn Slice 1;
> - отсутствие collector, developer viewer и saved evidence как production-зависимостей;
> - неизменность научных P2/Main L1 gates.
>
> Не изменять физику, численные алгоритмы, датасеты, C, T1 или научные протоколы.
>
> Не трогать несвязанные modified/untracked-файлы.
>
> Выполни ограниченные проверки:
>
> - Landing CTA и клавиатурная доступность;
> - Landing → Learn → Landing/Explore;
> - отсутствие создания Simulation и stepping при Learn;
> - сохранность Explore entry;
> - lifecycle cleanup статического viewport;
> - scoped typecheck и UI-тесты;
> - browser smoke, если доступен.
>
> Если browser smoke недоступен, явно укажи ограничение. Не выдавай unit tests за визуальную проверку.

[Omission: report-format list.]

> **Не выполняй commit, push, deploy или научные прогоны.**
>
> Остановись после реализации и отчёта для человеческого review.

## Source instruction — English translation

Human decision: APPROVED — bounded implementation authorized. The project owner
has approved implementation of the first vertical Learn slice. Current published
baseline: `main @ c3769f8af0cd662afcda6242cf952b7791e6065a`.

[Omission: required reading list.]

I authorize one bounded Decision Record combining Learn navigation agreement and
Slice 1 implementation, if Governance allows it. Record Learn as a separate product
surface, not a new computational `lab.kind`. In a conflict with active UI SoT, do
not edit frozen documents; use the Governance amendment/successor mechanism and
stop if additional scope is required. Do not create additional Decision Records
without substantive necessity.

After implementation, the user must be able to open Landing and see equal Learn
and Explore entries, choose Learn, reach the first Look Around screen, see static
3D space, inspect it with the camera and restore the initial view, read a short smoke
analogy, see a question about two markers starting at the same height, and return
to Landing or enter Explore. Use the English starting copy reproduced verbatim
above (already English; no duplicate translation).

Do not show non-working launch buttons, links to nonexistent lessons or fictitious
experiment results. The analogy is limited to visualizing motion. Do not claim the
model computes smoke, buoyancy or dispersion. Minor readability adaptations are
allowed without changing scientific meaning.

[Omission: suggested file list.]

Use the existing AppSurface, adding Learn before the `lab === null → Landing`
branch. Reuse TracerScene without markers or Simulation for the static scene only
if current APIs support it. Do not connect TracerViewport if it requires Simulation
and starts stepping. Do not duplicate the physics engine. Ensure correct mount/
unmount, renderer disposal, OrbitControls cleanup, resize handling and render-loop
cancellation.

Preserve Explore through the existing enterExplore, initial Goshen environment,
unchanged Guided, existing Demo physics/C/integration/history, no Simulation in
Learn Slice 1, no collector/developer viewer/saved evidence production dependencies,
and unchanged P2/Main L1 gates. Do not change physics, numerical algorithms, datasets,
C, T1 or scientific protocols. Do not touch unrelated modified/untracked files.

Perform bounded checks of Landing CTAs and keyboard accessibility, Landing → Learn
→ Landing/Explore, no Simulation construction/stepping in Learn, retained Explore
entry, static viewport cleanup, scoped typecheck and UI tests, and browser smoke if
available. If unavailable, explicitly state the limitation; do not present unit
tests as visual verification.

[Omission: report-format list.]

Do not commit, push, deploy or run scientific executions. Stop after implementation
and the report for human review.
