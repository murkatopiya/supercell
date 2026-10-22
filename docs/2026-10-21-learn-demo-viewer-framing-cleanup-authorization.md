# Learn Demo Viewer — framing and initialization cleanup authorization

## Status

| Field | Value |
| --- | --- |
| Document type | DECISION RECORD |
| Approval state | APPROVED |
| Authority status | ACTIVE |
| Freeze mode | MUTABLE |
| Authority scope | Bounded developer-viewer camera framing and partial-initialization cleanup |
| Parent authority | Explicit human instruction below; Governance v1 and amendment via PROJECT_STATUS |
| Current project state | [PROJECT_STATUS](PROJECT_STATUS.md) |
| Supersedes | None; refines the Slice 3 implementation permission only |
| Superseded by | None |

## Decision authority

Human project owner acting as bounded implementation/developer-check authorizer.
Recorded by Agent.

## Scope and Decision

Authorize only local cleanup of already-created WebGL/Three/OrbitControls/DOM
resources when later viewer initialization fails, a Frame Trajectories control,
necessary viewer tests, this Decision and mutable status navigation. Preserve
the existing isolated [Slice 3 boundary](2026-10-21-learn-demo-viewer-slice-3-authorization.md).
Frame all saved positions in the selected case, including both roles, with
centered target and FOV/aspect-aware camera distance and visual margin, leaving
world coordinates and evidence untouched. Handle empty/invalid/degenerate bounds
without NaN/crash. Keep manual camera controls and define Reset View explicitly.
Case changes must not leave the camera aimed away from the selected data.

Cleanup must be safe, idempotent, cover partial success and preserve the original
initialization error even if cleanup itself fails. No general viewer rewrite.
Permit only scoped viewer typecheck, existing/new viewer tests, geometry/failure-path
checks and browser/WebGL smoke for A+B2/case switching if the environment allows.
After implementation/report stop for human visual review.

## Authority targets and reviewed identity

Targets: tools/learn-demo-seed-verification/viewer/, necessary viewer tests/helpers
and viewer-only server resource allowlist; no collector changes.
Input remains the unchanged Slice 2 run 2026-10-21-slice2-125957-dc632454, result
raw SHA-256 `7826f9152e7be98bf27b11f859c2755f095f60a3ecce091a4695fbb1691c8678`.
The existing Slice 3 Decision defines the base implementation, not scientific
approval. Both Designs remain PROPOSED / INACTIVE / MUTABLE; no freeze/pin.

## Authorization consequence and exclusions

Record this bounded instruction, implement/check only those viewer changes, report
git state and evidence/runtime preservation, then await human visual inspection.
No src, collector, simulation/integrator, velocity fields, seeds, C, T1, trajectories,
evidence bytes, dependencies or main-app configuration changes. No collection or
case recomputation. No commit/push; no staging is needed. Preserve all prior local
and untracked work. NOT INTRODUCED: model/scientific semantics. NOT CLAIMED: scientific
qualification, seed suitability, or proof of visual correctness from unit tests.

## Date

2026-10-21.

## Source language

Russian (ru).

## Source instruction — original

### 1. Scope

Разрешаю только:

1. Исправить освобождение WebGL/Three.js/OrbitControls/DOM-ресурсов при частично успешной инициализации viewer, если последующий этап инициализации завершается ошибкой.
2. Добавить в developer-only viewer управление **Frame Trajectories**, которое кадрирует сохранённые траектории выбранного случая.
3. Добавить или скорректировать необходимые проверки в рамках viewer.
4. Создать узкий Decision Record/authorization-документ для этой доработки и обновить навигацию статуса согласно governance, не изменяя замороженные документы.

**Не разрешено:** менять `src/**`, collector, simulation/integrator, поля скорости, начальные точки, C, T1, траектории, исходные evidence-файлы, зависимости, конфигурацию основного приложения. Не запускать collector и не пересчитывать случаи.

### 2. Frame Trajectories

Требования:

- Использовать только уже сохранённые позиции меток из загруженного evidence.
- Рассчитывать границы по всем доступным сохранённым позициям выбранного случая, а не только по текущему кадру.
- Учитывать обе траектории для A+B1 и A+B2.
- Центрировать камеру и target OrbitControls по вычисленным границам.
- Подбирать дистанцию с учётом FOV, aspect ratio и разумного визуального отступа, чтобы траектории целиком помещались в viewport.
- Не изменять мировые координаты, масштаб данных или траектории ради красивой картинки.
- Сохранять возможность ручного вращения/приближения камеры после кадрирования.
- Существующий Reset View оставить работоспособным; его семантику определить явно и документировать.
- При смене случая не оставлять пользователя с камерой, направленной в пустое пространство.
- Корректно обрабатывать пустые, вырожденные или некорректные границы без NaN и падения viewer.

Предпочтительно вынести геометрические расчёты кадрирования в тестируемую чистую функцию.

### 3. Cleanup

Проверь все стадии создания сцены и возможные точки исключений.

Если инициализация прерывается, уже созданные ресурсы должны освобождаться корректно и безопасно, без двойного dispose и без маскировки исходной ошибки.

Не требуется переписывать архитектуру viewer — только локальное исправление жизненного цикла.

### 4. Проверки

Выполни только проверки, относящиеся к viewer:

- scoped TypeScript check;
- существующие viewer tests;
- новые тесты геометрии кадрирования и необходимых failure paths;
- при доступности среды — browser/WebGL smoke для A+B2 и переключения случаев.

Если браузерный smoke невозможен, честно укажи это как непроверенный пункт. Не заменяй его утверждением, что тесты доказывают визуальную корректность.

[Omission: report-format list.]

**Не выполнять commit/push. Не расширять scope без моего отдельного согласия.**

После реализации остановись и дождись визуальной проверки человеком.

## Source instruction — English translation

Authorize only cleanup of WebGL/Three/OrbitControls/DOM resources after partially
successful initialization followed by failure; developer-only Frame Trajectories;
necessary viewer tests; a narrow Decision and mutable status navigation without
frozen-document changes. No src, collector, simulation/integrator, velocity fields,
seeds, C, T1, trajectories, evidence, dependencies or main-app configuration changes;
no collection or case recomputation.

Frame only loaded saved marker positions across the whole selected case, including
both paths in pairs. Center camera/target on bounds; choose distance with FOV,
aspect and reasonable margin. Preserve world coordinates/scale/paths, manual camera
control and working explicitly documented Reset View. Case changes must not aim
at empty space. Handle empty, degenerate or invalid bounds without NaN/crash;
prefer a pure testable framing function.

Inspect all scene-creation stages/failure points. Release already-created resources
safely, without double disposal or masking the original error. Only a local lifecycle
fix, not an architectural rewrite.

Run only scoped viewer TypeScript checks, existing/new viewer tests, geometry and
necessary failure-path tests, plus A+B2/case-switch browser/WebGL smoke if available.
Otherwise state smoke is unverified; tests do not establish visual correctness.

[Omission: report-format list as in original.]

No commit/push or scope expansion without separate agreement. After implementation
stop and await human visual review.
