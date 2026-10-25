# Learn MVP terminology and visual literacy — human plan review

## Status

| Field | Value |
| --- | --- |
| Document type | DECISION RECORD |
| Approval state | APPROVED |
| Authority status | ACTIVE |
| Freeze mode | MUTABLE |
| Authority scope | Human plan approval with refinements and planning/documentation-only authorization; no implementation or acceptance |
| Parent authority | Human owner instruction below; [planning Decision](2026-10-25-learn-mvp-terminology-planning-decision.md), [Governance v1](DOCUMENTATION_GOVERNANCE.md) under [adoption](2026-10-11-documentation-governance-v1-adoption-decision.md), [bounded amendment](DOCUMENTATION_GOVERNANCE_V1_AMENDMENT.md) under [adoption](2026-10-11-documentation-governance-v1-amendment-bootstrap-decision.md) |
| Current project state | [PROJECT_STATUS](PROJECT_STATUS.md) |
| Supersedes | PROPOSED / INACTIVE and awaiting initial review for this plan only; no implementation prohibition is lifted |
| Superseded by | None |

## Decision authority and date

Human project owner communicating completed human review and issuing bounded
documentation permission. Recorded by Agent, 2026-10-25.

## Scope and Decision

APPROVE WITH REFINEMENTS the [Learn MVP plan](ux/2026-10-25-learn-mvp-terminology-visual-literacy-plan.md)
as an architectural/copy basis, ACTIVE for implementation constraints and MUTABLE.
Accept Look Around without a fictitious vertical axis or computed orientation field;
compact persistent Follow/Read legends; the exact owner-supplied tracer and
local-velocity sentences; Selected moment / Saved reference with unchanged historical
selection/save/replace/clear semantics; Reset B as label-only; existing Slice 4 legend,
duplicate-text reduction and brief scale explanation. Keep all scientific caveats,
different fixed scales 40/80, existing operation/focus/camera/interaction semantics.

The recorder's shortened scale paragraph and technical Model note are final wording
proposals within approved constraints, not sentences directly approved verbatim by
the owner. The plan identifies them for the next owner disposition. Shared Glossary
has CONTENT DIRECTION APPROVED only and a separate exact-copy/implementation gate.

## Authority targets and reviewed identity

Reviewed target: the mutable working-tree planning document produced under the
planning Decision, at HEAD context c3769f8af0cd662afcda6242cf952b7791e6065a.
This is not a frozen code/document pin. Before this recording: 21 modified / 35
untracked Git entries. Targets: mutable DESIGN plan, this DECISION RECORD and
PROJECT_STATUS navigation. No production or frozen artifact is a target.

## Authorization consequence and exclusions

Authorize PLANNING + DOCUMENTATION ONLY to apply refinements, record this receipt
and navigate from PROJECT_STATUS. Human approval of the plan/accepted copy is not
implementation permission. Implementation/developer verification: NOT YET AUTHORIZED.
Human technical/visual acceptance: NOT CLAIMED; Slice 4 Stage 2 remains PENDING.
Retain concrete file allowlist, accessibility, responsive checks, tests, rollback,
scope exclusions and scientific/architectural invariants.

NOT INTRODUCED: production/UI/CSS/test/rendering/physics/fixture/model/data changes,
frozen modifications, scientific execution, working-tree cleanup, commit/push/deploy.
NOT CLAIMED: scientific qualification or acceptance from planning/static checks.
Stop after documentation; await separate bounded Learn implementation/developer-
verification authorization. Glossary permission cannot be inferred from it.

## Source language

Russian (ru), retaining original English review/status markers and exact copy.

## Source instruction — English translation

Human review of the Learn MVP terminology/visual-literacy plan is complete:
APPROVED WITH REFINEMENTS as an implementation basis. Authorize PLANNING +
DOCUMENTATION ONLY to refine the plan, record a Decision and update PROJECT_STATUS
as navigation; this is not implementation permission.

Approve Look Around's proposed copy and actual scene-element explanations; no
nonexistent vertical axis or claim that orientation-only airflow is computed.
Approve Follow Motion's persistent A/B/path/start-ring/height-guide/ground-projection
legend. Use exactly: “A passive tracer is a virtual object that moves with the model
airflow. Its colored marker shows where it is.” Preserve prescribed-field calculation,
passivity/no airflow effect and no-individual-real-parcel caveats, using a technical
Model note if appropriate. Do not remove mandatory caveats to shorten text.

Approve Read the Motion's persistent legend and Selected moment / Saved reference
labels, preserving selection/save/replace/clear semantics. Use exactly: “The arrow
shows local airflow velocity at the tracer’s position: its direction and speed.”
Propose a shortened final English scale explanation preserving speed display versus
travelled path/predicted displacement, fixed scale within a lesson, different Slice
3/4 scales without mechanical equalization, cross-lesson screen incomparability,
and perspective/zoom effects.

Approve Reset B instead of Reset Probes as UI label only, keeping operation,
handler, focus and independent Reset View unchanged. Keep Reading the scene,
reduce duplicate explanations and accept the brief scale caveat without geometry
changes. Approve the Glossary tracer/stationary-probe distinction as content direction;
glossaryContent.ts, Glossary UI and tests remain separately gated and excluded from
Learn implementation permission.

Set plan APPROVED WITH REFINEMENTS / ACTIVE for implementation constraints / MUTABLE
if consistent with governance. Decision must distinguish human plan/accepted-copy
approval, documentation permission, implementation/developer verification NOT YET
AUTHORIZED, and human technical/visual acceptance NOT CLAIMED. Preserve allowlist,
accessibility/responsive/tests/rollback/exclusions. No production/UI/CSS/test/rendering/
physics/fixture/frozen changes, scientific execution, commit/push/deploy or dirty-tree
cleanup. Stage 2 acceptance stays PENDING. Stop after documents and return final
English wording, changed docs, permitted static checks and confirmation implementation
has not started. Bounded implementation/developer verification will be authorized
by a separate next decision.

## Source instruction — original

Огонёчка, human review документа `docs/ux/2026-10-25-learn-mvp-terminology-visual-literacy-plan.md` завершён.

**Решение: APPROVED WITH REFINEMENTS как основа для реализации.**

Разрешаю **PLANNING + DOCUMENTATION ONLY**: внести перечисленные ниже уточнения в предложенный план, оформить соответствующий Decision Record и обновить PROJECT_STATUS как навигационный статус. Это НЕ разрешение на реализацию.

### 1. Look Around — APPROVED

Принимаем предложенные изменения текста и пояснение реально отображаемых элементов сцены.

Не добавлять несуществующую вертикальную ось и не утверждать, что в orientation-only сцене уже вычисляется airflow.

### 2. Follow Motion — APPROVED WITH COPY REFINEMENT

Принимаем постоянно видимую компактную легенду с A/B, recorded paths, starting rings, height guides и ground projections.

Первое определение passive tracer сделать более доступным:

“A passive tracer is a virtual object that moves with the model airflow. Its colored marker shows where it is.”

При этом сохранить научную точность: движение вычисляется по prescribed model velocity field; трассер пассивен, не влияет на поток и не представляет отдельную реальную воздушную частицу. Более техническое пояснение можно оставить в Model note.

Не удалять обязательные научные оговорки ради сокращения текста.

### 3. Read the Motion — APPROVED WITH REFINEMENTS

Принимаем компактную постоянно видимую легенду.

Утверждаем названия:

- `Selected moment`
- `Saved reference`

Сохранить существующую семантику выбора исторического момента, сохранения, замены и очистки reference.

Предлагаемую фразу о стрелке уточнить:

“The arrow shows local airflow velocity at the tracer’s position: its direction and speed.”

Сократить подробное объяснение масштаба стрелки, не теряя следующих различий:

- длина стрелки — графическое представление скорости, не пройденный путь и не прогноз перемещения;
- масштаб постоянен внутри урока;
- масштабы Slice 3 и Slice 4 различаются и не должны механически уравниваться;
- экранные длины между уроками напрямую несопоставимы;
- перспектива и zoom влияют на видимую длину.

Предложи точную окончательную английскую формулировку в обновлённом плане.

### 4. Compare the Flow — APPROVED WITH REFINEMENTS

Утверждаем `Reset B` вместо `Reset Probes`.

Это только изменение UI label. Существующая операция, её обработчик, поведение, focus и независимость Reset View остаются неизменными.

Сохраняем существующую легенду Reading the scene, сокращаем дублирующие объяснения.

Принимаем краткое пояснение о масштабе стрелок без изменений самой геометрии.

### 5. Shared Glossary — CONTENT DIRECTION APPROVED, IMPLEMENTATION SEPARATELY GATED

Предложенное различие passive tracer и stationary measurement probe принимаем.

Однако изменение `glossaryContent.ts`, Glossary UI и тестов НЕ входит в разрешение на реализацию Learn. Сохрани отдельный scope и отдельный authorization gate.

### 6. Документирование и границы

Обнови план до `APPROVED WITH REFINEMENTS / ACTIVE for implementation constraints / MUTABLE`, если это согласуется с действующим documentation governance.

В Decision Record явно различи:

- human approval of plan and exact accepted copy;
- planning/documentation authorization;
- implementation/developer verification — NOT YET AUTHORIZED;
- human technical/visual acceptance — NOT CLAIMED.

Сохрани конкретный file allowlist, accessibility requirements, responsive checks, test matrix, rollback и исключения.

Не меняй production code, UI, CSS, tests, rendering, physics, scientific fixtures или frozen records. Не выполняй scientific execution, commit, push или deploy.

Не очищай существующий dirty working tree.

Stage 2 human technical/visual acceptance остаётся PENDING и не закрывается этим решением.

**После обновления документов остановись.** Верни окончательные английские формулировки, список документационных изменений, результаты допустимых статических проверок и подтверждение, что реализация не начиналась.

Следующим отдельным решением мы авторизуем bounded Learn implementation + developer verification.
