# Learn Slice 2 — Follow Motion implementation authorization

## Status

| Field | Value |
| --- | --- |
| Document type | DECISION RECORD |
| Approval state | APPROVED |
| Authority status | ACTIVE |
| Freeze mode | MUTABLE |
| Authority scope | Receipt of bounded Follow Motion product decisions and engineering authorization; no scientific authority |
| Parent authority | Human project owner instruction below; [Governance v1](DOCUMENTATION_GOVERNANCE.md) under its [adoption](2026-10-11-documentation-governance-v1-adoption-decision.md), with the adopted [amendment](DOCUMENTATION_GOVERNANCE_V1_AMENDMENT.md) and [bootstrap Decision](2026-10-11-documentation-governance-v1-amendment-bootstrap-decision.md) |
| Current project state | [PROJECT_STATUS](PROJECT_STATUS.md) |
| Supersedes | Earlier Learn implementation/seed-acceptance prohibitions only for the bounded A+B2 Follow Motion slice below |
| Superseded by | None |

## Decision authority

Human project owner, acting as product decision-maker and authorizer of bounded
engineering implementation. Recorded by: Agent. This records the explicit human
instruction, not approval of the resulting code, this record's wording, or visual UX.
Date: 2026-10-22. Source language: Russian (ru), with English product copy and identifiers.

## Decision and scope

Approve A+B2 for the first two-marker Learn experiment and authorize Follow Motion
implementation, necessary developer tests, scoped typecheck and local browser checks.
Preserve Look Around as the first Learn screen. Learn remains a separate AppSurface,
not another computational `lab.kind`. The [Slice 1 navigation disposition](2026-10-22-learn-slice-1-implementation-decision.md)
continues to control equal Learn/Explore entry; its static-only implementation limit
is extended solely by this separately authorized lesson. Explore/Guided are unchanged.

Use existing Demo composition, StormRelativeLaboratory, prescribed C east/north
(10, 0) m/s, EulerIntegrator, dt 0.1 s, ATMOSPHERIC_TRACER_DOMAIN, history stride 1,
exact A world (0, 1000, 4000) m and B/B2 world (2400, 1000, 0) m. World x is east,
y up, z south. Both are born at t=0 without intermediate stepping. Stop at exactly
1200 steps (nominal 120 model seconds). A/B map to stable IDs, two lanes and two slots.

Initially paused, no future paths; Start/Pause/Resume/Replay, model clock, fixed start
references, progressively recorded paths, camera-only Reset View. Replay returns to
t=0 with the same two lanes/IDs and clears paths. Retain markers/paths after completion;
only then reveal the supplied conclusion. Target playback is 10 model seconds per real
second, using unchanged fixed dt without skipped steps or interpolated path vertices.
Correctness outranks playback speed; no background catch-up. Warn before discarding
recorded paths on any exit; cancellation preserves the session. No extra lessons or
free placement/parameter editing. Scientific disclosure remains visible.

## Authority targets and reviewed identity

- [Learn MVP Design](ux/2026-10-21-learn-mvp-design.md): only Look Around → Follow Motion
  and the explicitly approved two-marker comparison here; this differs from the earlier
  proposed one-marker first observation. Later replacement/comparison stages are not opened.
- [Seed verification Design](ux/2026-10-21-learn-mvp-demo-seed-verification-design.md):
  A+B2 accepted for this lesson only, as technical inputs plus human visual observation,
  not certification. No collection permission is renewed.
- Production targets: `src/app/learn/`, shared viewport/scene opt-ins, Learn styles and
  scoped tests. Current-state consequence owner: PROJECT_STATUS, mutable STATUS.
- Inherited contracts: [Demo frame](architecture/03-wind-tunnel-storm-relative-3d-semantics.md),
  [scene](rendering/01-tracer-scene.md), [camera fixture](rendering/11-deep-storm-tracer-view.md),
  [reference layer](ui/09-world-coordinate-reference.md) and [UI navigation](ui/07-app-navigation-and-mode-entry.md)
  as externally reconciled by the Slice 1 Decision.
- Repository context: published baseline declared for this work is
  `c3769f8af0cd662afcda6242cf952b7791e6065a`. No reviewed implementation SHA,
  new exact-byte pin, freeze or accepted snapshot is established by this instruction.

Both Designs remain PROPOSED / INACTIVE / MUTABLE as whole documents. This is the
bounded external disposition required by Governance §8 for an implementation transition
with cross-document scope, not activation of either complete Design. Only this new
MUTABLE Decision and mutable PROJECT_STATUS are documentation edit targets. Frozen
owners remain unchanged; amendment identities resolve through accepted snapshot
`8d916037058a919560b6c2d01ae65823589e96bb` and the existing index/Decision chain.

## Authorization consequence

Implement the bounded lesson with existing Demo composition, ExploreTracerSession,
TracerViewport/TracerScene and shared fixed stepping. One mounted viewport/session;
opt-in presentation/runtime options retain laboratory defaults. No duplicated physics
or animation loop. Record developer verification and browser limitations in PROJECT_STATUS,
then stop for human implementation and visual review.

## Explicitly NOT authorized / NOT CLAIMED

No scientific collection, repeated collection, scientific runs, commit, push or deploy;
no physics, integrator, velocity field, C/T1, dataset, frozen scientific record or gate
changes. No developer viewer, saved evidence JSON or tools imports in production Learn.
No unrelated modified/untracked files. No additional lessons or unrestricted parameters.
No inferred whole-Design approval, scientific certification, real observations,
storm reconstruction/forecast, literal air-parcel interpretation or teaching-efficacy
claim. Phase P/P2/Main L1 retain their existing dispositions. No scientific/model
semantics are introduced. Developer test PASS is not scientific qualification.

## Source instruction — original

The complete bounded task instruction is reproduced below; it contains no surrounding
conversation. Its original wording controls over the normalized decision/translation.

> # Supercell Explorer — Learn Slice 2: Follow Motion
> 
> ## Авторизация
> 
> Владелец проекта утверждает реализацию **Learn Slice 2 — Follow Motion** в рамках описанных ниже решений и ограничений.
> 
> Это разрешение на ограниченную инженерную реализацию, необходимые тесты и локальную браузерную проверку. Оно **не разрешает** научные прогоны, повторную collection, commit, push или deploy.
> 
> Перед началом прочитать применимые `AGENTS.md`, `DOCUMENTATION_GOVERNANCE.md`, `PROJECT_STATUS.md`, Learn MVP Design, seed verification Design и актуальные исходники.
> 
> ## 1. Учебная цель
> 
> Показать, что в пределах одного рассчитанного поля скоростей движение зависит от положения в пространстве, даже если два маркера начинают на одинаковой высоте.
> 
> Пользователь должен сначала сделать предположение, затем наблюдать движение и сравнить оставленные маркерами траектории.
> 
> Не раскрывать вывод до завершения наблюдения.
> 
> ## 2. Утверждённые параметры
> 
> Использовать существующую Demo-композицию, без изменения модели.
> 
> | Параметр | Значение |
> |---|---|
> | Маркер A, world `(x,y,z)` | `(0, 1000, 4000)` м |
> | Маркер B, seed B2, world `(x,y,z)` | `(2400, 1000, 0)` м |
> | Оси | x — восток, y — вверх, z — юг |
> | Среда | `demo-prescribed` |
> | Frame | `StormRelativeLaboratory` |
> | C eastward/northward | `(10, 0)` м/с |
> | Интегратор | `EulerIntegrator` |
> | Fixed dt | `0.1` с |
> | Domain | `ATMOSPHERIC_TRACER_DOMAIN` |
> | History stride | `1` |
> | Максимум | **1200 шагов**, номинально 120 модельных секунд |
> 
> Пара **A+B2 утверждена для первого учебного эксперимента**, с сохранением её ограниченного статуса: проверенные технические входы и человеческое визуальное наблюдение, но не научная сертификация.
> 
> Оба маркера создаются при модельном времени `t=0`, без промежуточного stepping.
> 
> ## 3. Поведение Follow Motion
> 
> После Look Around пользователь переходит к **Follow Motion**.
> 
> Начальное состояние:
> - Оба маркера видны одновременно.
> - Маркеры различаются цветом и обозначены A/B.
> - Модельное время равно нулю.
> - Анимация остановлена.
> - Будущие траектории не показаны.
> 
> При нажатии **Start**:
> - Оба маркера начинают двигаться одновременно в рамках одной Simulation.
> - Их траектории постепенно появляются позади них.
> - Отображается модельное время.
> - Стартовые позиции остаются визуально различимыми.
> 
> Управление:
> - `Start` до первого запуска.
> - `Pause` во время движения.
> - `Resume` после паузы.
> - `Replay` после запуска или завершения: возвращает оба маркера к t=0, очищает траектории и позволяет повторить наблюдение.
> - `Reset View` управляет только камерой и не сбрасывает эксперимент.
> 
> **Replay не должен создавать дополнительные маркеры или history lanes.**
> 
> После достижения 1200 шагов:
> - Stepping прекращается строго на установленной границе.
> - Оба маркера и полные траектории остаются видимыми.
> - Показывается короткое объяснение результата.
> - Пользователь может вращать сцену, приближать её и повторять эксперимент.
> 
> ## 4. Скорость просмотра
> 
> Начальная целевая скорость — **10 модельных секунд за 1 секунду реального времени**.
> 
> Это UX-гипотеза, а не изменение физики.
> 
> Использовать существующий fixed-step механизм. Не увеличивать `dt`, не пропускать физические шаги и не подменять рассчитанные вершины траекторий интерполяцией.
> 
> При невозможности поддерживать 10× на конкретном устройстве корректность и точное число шагов важнее скорости анимации. Не допускать неконтролируемого накопления шагов или ускорения после возвращения вкладки из фона.
> 
> ## 5. Учебный текст
> 
> Заголовок:
> 
> **Follow Motion**
> 
> Вступление:
> 
> **Two markers, one airflow.**
> 
> Both markers start at the same height, but in different places. Watch how their paths develop as they follow the calculated velocity field.
> 
> Before pressing Start, make a prediction: will they follow the same path?
> 
> После завершения наблюдения показать:
> 
> **What did you notice?**
> 
> Both markers started at the same height, but their paths were different.
> 
> In this model, airflow varies from place to place. Following the markers helps us see those differences.
> 
> The markers follow a calculated velocity field. They are not literal parcels of air.
> 
> Сохранить научное предупреждение о prescribed velocity field и отсутствии реконструкции или прогноза конкретной грозы.
> 
> Не утверждать, что результаты представляют реальные наблюдения или сертифицированную физическую реконструкцию.
> 
> ## 6. Архитектура
> 
> Предпочтительный путь по результатам readiness review:
> 
> - Изолированная Learn-сессия на основе существующей Demo-композиции.
> - Повторное использование `ExploreTracerSession`, `TracerViewport`, `TracerScene` и существующего fixed-step механизма там, где это возможно без нарушения контрактов.
> - Явное соответствие `A/B → tracerId → history lane → scene slot`.
> - Минимальные opt-in настройки отображения и камеры для Learn.
> - Сохранение прежних defaults Explore/Guided.
> - Один активный viewport и одна Learn-сессия.
> - Корректный lifecycle cleanup, включая StrictMode и переходы между экранами.
> 
> Не копировать интегратор, поле скоростей или параллельный animation loop.
> 
> Не подключать локальный developer viewer, сохранённый evidence JSON или `tools/**` к production Learn.
> 
> ## 7. Камера и визуализация
> 
> Камера должна позволять видеть начальные положения обоих маркеров и разумно рассматривать их траектории по мере движения.
> 
> - Подобрать Learn framing отдельно от Explore.
> - Сохранить orbit, zoom и Reset View.
> - Обеспечить контрастные цвета маркеров и следов.
> - Добавить компактную легенду: A/B, начальная точка, текущее положение, пройденный путь.
> - Скрыть несущественные для урока диагностические HUD и мелкие километровые подписи.
> - Не скрывать и не искажать траектории ради красивого кадра.
> 
> ## 8. Навигация
> 
> Сохранить Look Around как первый экран Learn.
> 
> Добавить переход к Follow Motion и возможность вернуться к Look Around.
> 
> При выходе из активного Follow Motion в Look Around, Landing или Explore временное состояние эксперимента может быть потеряно. Если траектории уже построены, показать понятное предупреждение перед уничтожением состояния; отмена должна сохранить текущую сессию.
> 
> Не добавлять новые учебные этапы, свободное размещение маркеров или изменение параметров модели.
> 
> ## 9. Проверки
> 
> Разрешены необходимые developer/unit/integration tests, scoped typecheck, локальный запуск приложения и browser smoke.
> 
> Обязательно проверить:
> 
> - Одновременное создание A и B при `t=0`.
> - Две независимые history lanes.
> - Отсутствие будущих траекторий до Start.
> - Точное завершение на 1200 шагах.
> - Корректность Pause/Resume.
> - Чистый Replay без накопления старого состояния.
> - Корректность поведения при resize, unmount и StrictMode.
> - Отсутствие изменений Explore/Guided defaults.
> - Соответствие новой Learn-композиции существующей Demo-композиции.
> - Сохранение истории после завершения анимации.
> - Поведение при потере WebGL-контекста и ошибках инициализации, насколько поддерживается существующей архитектурой.
> 
> Не выполнять новые научные collection runs и не трактовать UX-тесты как научную сертификацию.
> 
> ## 10. Документация и ограничения
> 
> Зафиксировать утверждённые решения и bounded authorization в соответствующей owning Learn-документации в минимальном объёме, предусмотренном Governance §8.
> 
> Не создавать дополнительные Decision Records без конкретной необходимости. Если frozen-правила требуют отдельного successor/amendment, сообщить точную причину и минимальный допустимый путь.
> 
> Не менять научные gates, frozen scientific records, physics, integrator, velocity field, C/T1 или datasets.
> 
> Сохранить все посторонние modified/untracked-файлы.
> 
> ## 11. Отчёт
> 
> После реализации сообщить:
> 
> 1. Что реализовано.
> 2. Какие файлы изменены.
> 3. Результаты тестов и typecheck.
> 4. Что проверено в реальном браузере, а что осталось непроверенным.
> 5. Известные ограничения и вопросы для человеческого review.
> 
> **Не выполнять commit, push или deploy.**

## Source instruction — English translation

### Supercell Explorer — Learn Slice 2: Follow Motion

**Authorization.** The project owner approves implementation of Learn Slice 2 — Follow
Motion within the decisions and constraints below. This permits bounded engineering
implementation, necessary tests and local browser checks. It does not permit scientific
runs, repeated collection, commit, push or deploy. Before starting, read applicable
AGENTS.md, DOCUMENTATION_GOVERNANCE.md, PROJECT_STATUS.md, Learn MVP Design, seed
verification Design and current sources.

**1. Learning objective.** Show that within one calculated velocity field, motion depends
on spatial position even when two markers start at the same height. The user should
first predict, then observe motion and compare the paths left by the markers. Do not
reveal the conclusion before observation finishes.

**2. Approved parameters.** Use the existing Demo composition without changing the model.
A world (x,y,z) = (0,1000,4000) m; B, seed B2 = (2400,1000,0) m. Axes: x east, y up,
z south. Environment demo-prescribed; frame StormRelativeLaboratory; C eastward/northward
(10,0) m/s; EulerIntegrator; fixed dt 0.1 s; ATMOSPHERIC_TRACER_DOMAIN; history stride 1;
maximum 1200 steps, nominally 120 model seconds. A+B2 is approved for the first teaching
experiment, retaining its limited status: verified technical inputs and human visual
observation, not scientific certification. Create both markers at model time t=0 with
no intermediate stepping.

**3. Follow Motion behavior.** After Look Around, the user enters Follow Motion. Initially
both markers are visible together, distinguished by color and A/B labels; model time is
zero, animation is paused, and future paths are absent. Start moves both simultaneously
in one Simulation, with gradually appearing trails behind them, displayed model time,
and visually distinguishable start positions. Controls: Start before the first launch;
Pause during motion; Resume after pausing; Replay after launch or completion returns
both to t=0, clears paths and allows repeated observation. Reset View controls only the
camera and does not reset the experiment. Replay must not create additional markers or
history lanes. At 1200 steps, stepping stops strictly at the limit; both markers and full
paths remain visible; a short result explanation appears; users may orbit, zoom and replay.

**4. Playback speed.** Initial target: 10 model seconds per real second. This is a UX
hypothesis, not a physics change. Use the existing fixed-step mechanism; do not increase
dt, skip physical steps or replace calculated path vertices with interpolation. If a
device cannot sustain 10×, correctness and exact step count outrank animation speed.
Prevent uncontrolled step accumulation or acceleration after returning from a background tab.

**5. Teaching copy.** Heading: Follow Motion. Introduction: “Two markers, one airflow.”
“Both markers start at the same height, but in different places. Watch how their paths
develop as they follow the calculated velocity field.” “Before pressing Start, make a
prediction: will they follow the same path?” After observation finishes: “What did you
notice?” “Both markers started at the same height, but their paths were different.”
“In this model, airflow varies from place to place. Following the markers helps us see
those differences.” “The markers follow a calculated velocity field. They are not literal
parcels of air.” Retain the scientific disclosure about a prescribed velocity field and
the absence of reconstruction or forecast of a particular storm. Do not claim real
observations or certified physical reconstruction.

**6. Architecture.** Preferred readiness-review approach: isolated Learn session using
existing Demo composition; reuse ExploreTracerSession, TracerViewport, TracerScene and
existing fixed-step machinery where contracts permit; explicit A/B → tracerId → history
lane → scene slot mapping; minimal Learn opt-ins for display/camera; retain Explore/Guided
defaults; one active viewport and one Learn session; correct lifecycle cleanup including
StrictMode and screen transitions. Do not copy the integrator, velocity field or a parallel
animation loop. Do not attach the local developer viewer, saved evidence JSON or tools/**
to production Learn.

**7. Camera and visualization.** Allow viewing both initial positions and examining their
paths reasonably as motion develops. Frame Learn separately from Explore; retain orbit,
zoom and Reset View; contrast markers and trails; provide a compact legend for A/B, start,
current position and travelled path; hide lesson-irrelevant diagnostic HUD and small
kilometre labels. Do not hide or distort paths for an attractive frame.

**8. Navigation.** Retain Look Around as Learn's first screen. Add entry to Follow Motion
and return to Look Around. Leaving active Follow Motion for Look Around, Landing or Explore
may lose temporary state. If paths have been built, show an understandable warning before
destroying the state; cancelling must preserve the current session. Do not add other
learning stages, free marker placement or model parameter editing.

**9. Verification.** Necessary developer/unit/integration tests, scoped typecheck, local
app startup and browser smoke are authorized. Verify simultaneous A/B birth at t=0; two
independent lanes; no future paths before Start; exact completion at 1200 steps;
Pause/Resume; clean Replay without accumulated old state; resize/unmount/StrictMode;
unchanged Explore/Guided defaults; new Learn composition matching existing Demo;
retained history after animation; WebGL context-loss/initialization-error behavior as
supported by the existing architecture. Do not run new scientific collection or interpret
UX tests as scientific certification.

**10. Documentation and restrictions.** Record the approved decisions and bounded
authorization in the owning Learn documentation, minimally as required by Governance §8.
Do not create additional Decision Records without a concrete need. If frozen rules require
a separate successor/amendment, report the exact reason and minimum permitted route.
Do not change scientific gates, frozen scientific records, physics, integrator, velocity
field, C/T1 or datasets. Preserve all unrelated modified/untracked files.

**11. Report.** After implementation, report what was implemented, changed files, test and
typecheck results, what was checked in a real browser and what remains unchecked, known
limitations and questions for human review. Do not commit, push or deploy.
