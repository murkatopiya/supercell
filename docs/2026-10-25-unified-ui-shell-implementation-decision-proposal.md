# Unified UI Shell — bounded implementation Decision

## Status

| Field | Value |
| --- | --- |
| Document type | DECISION RECORD |
| Approval state | APPROVED |
| Authority status | ACTIVE |
| Freeze mode | MUTABLE |
| Authority scope | Bounded shell implementation/verification, release-risk disposition, final product/UI visual acceptance and exact 37-file scoped commit plus fresh remote verification; push/deploy remain separately unauthorized |
| Parent authority | Human owner's pre-implementation review and approved design direction quoted below; [checkpoint Decision](2026-10-25-learn-mvp-checkpoint-decision.md); [Governance v1](DOCUMENTATION_GOVERNANCE.md) under its [adoption](2026-10-11-documentation-governance-v1-adoption-decision.md), and [amendment](DOCUMENTATION_GOVERNANCE_V1_AMENDMENT.md) under its [adoption](2026-10-11-documentation-governance-v1-amendment-bootstrap-decision.md) |
| Current project state | [PROJECT_STATUS](PROJECT_STATUS.md) |
| Supersedes | Earlier no-global-shell restrictions only within the bounded presentation replacement below |
| Superseded by | None |

## Decision authority and date

Human project owner is the required implementation authorizer. The owner supplied
the design direction and explicitly required a proposed Decision and a stop if
implementation authorization was missing. Recorded by Agent, 2026-10-25.
The owner subsequently reviewed this mutable artifact and explicitly approved and
activated bounded implementation and developer verification, as recorded below.

## Reviewed basis and identity

The four-lesson Learn checkpoint is commit
`c5a394d0cdf1bbefa7caff0ddf5ed2dba09b955c`, confirmed as HEAD during this review.
Its [Decision](2026-10-25-learn-mvp-checkpoint-decision.md) excludes global shell
work and requires stopping before that initiative. The owner's new approved
design direction does not remove the explicit authorization check in the same
instruction.

No dedicated Unified UI Shell audit, Design or Decision artifact was found in the
repository search. The earlier assessment was delivered in chat. The bounded
repository findings and integration contract needed to review this proposal are
therefore captured here; no absent artifact is treated as active authority.

The checkpoint identifies the Learn baseline, not the entire working tree.
Pre-existing Landing presentation/content/style/asset and other documentation or
research changes are outside this authorization proposal except for the minimal
shell integration hunks explicitly described below. Their existence is not
acceptance, publication permission or scientific evidence.

Frozen amendment identities were resolved using accepted snapshot
`8d916037058a919560b6c2d01ae65823589e96bb`; the existing frozen-identity checker
passed before drafting. No freeze or implementation-byte pin is proposed.

## Decision — explicitly authorized 2026-10-25

Authorize bounded presentation implementation and developer verification in the
four stages below using the owner's approved dark Header, accessible Resources
disclosure and shared Footer with `full` and `compact` variants. Permit only
necessary shell/navigation/style/accessibility/test changes and their bounded
documentation consequences. Preserve the existing state-driven navigation and
scientific/educational ownership. Stop after integration and developer verification
for human visual review; do not commit, push or deploy.

This separately approved and authorized Decision replaces only the old
Home/Learn/Explore header/footer placement, breadcrumb and duplicated resource-row
requirements in [navigation UI authority](ui/07-app-navigation-and-mode-entry.md)
and related visual chrome. It lifts the earlier Decisions' no-global-shell
restriction only for this new bounded initiative. It does not rewrite their
historical instructions, alter Guided entry, close Learn acceptance gates or
supersede scientific authorities. All inherited behavior outside that narrow
presentation replacement remains binding.

## Repository findings and bounded integration contract

| Existing owner | Reuse and permitted integration |
| --- | --- |
| `src/app/App.tsx` | Retain AppSurface state (`landing`, `learn`, `laboratory`), laboratory composition and existing entry/exit lifecycle. Adapt shared chrome through callbacks; no router, URL changes or hidden running laboratory. |
| `src/app/LandingPage.tsx`, `landingContent.ts`, `landing.css` | Replace redundant brand/resource/footer chrome only. Retain hero, both entry cards, roadmap, scientific positioning, photo credit, data attribution and existing content. Preserve unrelated dirty hunks. |
| `src/app/learn/LearnPage.tsx` | Keep lesson/session ownership and the single guarded `leave` / `selectLesson` paths. Connect shared navigation and existing help behavior without key changes or added viewport remounts. |
| `src/app/learn/LearnLessonNavigation.tsx`, `LearnLessonStepNavigation.tsx` | Reuse four lesson tabs and six existing destination-labelled Back/Next actions, including their departure guard behavior. No new progression gates. |
| Existing `UserGuideSurface`, `HowItWorksSurface`, `GlossarySurface`, `WhatsNewSurface` and affordances | Reuse dialog content/context and release metadata. Permit bounded focus/keyboard fixes needed by shell integration, without broad dialog refactoring. |
| `src/app/assets/supercell-explorer-logo-dark.png` | Reuse the existing original artwork already imported by Home/Learn; no recreated branding. |
| `src/app/publicVersion.ts`, `releaseHistory.ts` and existing footer constants | Reuse version, creator attribution and portfolio destination; do not hardcode a competing release source. |
| `src/app/app.css` | Reuse tokens and primitives. Add scoped shell styles and deliberate Explore height budgeting, without broad CSS rewrite or scientific color changes. |

New shared Header, Resources disclosure, Footer and an optional small layout or
resource-composition helper belong under `src/app/` using existing conventions.
Exact names may be selected during implementation; new dependencies are not needed.
Shell UI state must stay independent of scene initialization and measurement state.

Header: consistent dark navy, one clickable logo returning Home, Explore/Learn
active state distinguishable beyond color, and Resources. Current-section
activation is a no-op. Learn departures, including logo activation, use its
existing guard. A compact narrow-screen navigation disclosure stays in normal
flow and does not cover critical canvas interactions.

Resources: ordinary native buttons in an accessible disclosure, with User Guide,
How It Works, Glossary and What's New using published version metadata. Include
visible focus, Enter/Space activation, Tab traversal, Escape dismissal and outside
click dismissal. Do not add global pointer/touch handlers or cancel canvas events.
Opening/closing the disclosure must not reset, resample or remount a lesson.
Opening a dialog uses existing Learn help semantics; preserve current pause and
placement-cancellation behavior rather than inventing a new runtime policy.
Return focus to a persistent trigger when a dropdown item has unmounted. Handle
dialog/disclosure Escape before underlying lesson actions, and verify modal focus
containment and cancellation focus restoration.

Footer: one component, `full` on Home/Learn and `compact` on Explore. Retain creator,
portfolio, version/research status, relevant resource actions and data attribution
using existing content/destinations. Retain detailed Home scientific boundaries and
Learn's prescribed-field/non-reconstruction/non-forecast explanation locally;
footer text does not replace them. Avoid duplicate global footer blocks.

Explore: retain wide workspace, local Hodograph access, concise scientific
description, controls and independently scrolling desktop regions. Existing desktop
`100dvh` layout and narrow-screen page-scrolling behavior in `app.css` require
explicit Header/content/compact-Footer height allocation. Preserve existing
visualization dimensions wherever possible; test resize and short windows before
accepting any height reduction. Do not conceal footer content or change camera
framing/scientific rendering to make chrome fit. A material layout conflict requires
human disposition before departing from this contract.

## Smallest safe execution sequence and verification

| Stage | Boundary | Required verification before proceeding |
| --- | --- | --- |
| 1. Shared components + Home | Build shared chrome/resources and full footer, then integrate Home through existing callbacks. | Home boots without laboratory construction; entry cards and content retained; logo, active states, keyboard/mobile disclosure and resource dialog focus work. |
| 2. Learn | Integrate the full footer and guarded global navigation; keep lesson navigation and local model explanation. | Four tabs and Back/Next, guarded confirmation/cancellation, same-section no-op, help/pause behavior, reference/history/snapshot retention, clean departure/re-entry, no shell-induced scene remounts. |
| 3. Explore | Replace breadcrumb/docs row, retain local Hodograph/tools, add compact footer within height budget. | Desktop regional scrolling and narrow layout, canvas resize/camera/reset, environment/storm motion, release/lifecycle/history, playback speed, airflow, Inspector, point diagnostics and Analysis T1. |
| 4. Integrated review | Scoped consistency cleanup and regressions only. | Relevant tests, typecheck, production build and frozen checks; real browser checks where available; report baseline failures and every remaining verification/acceptance limitation. |

Use existing mounted navigation, resource, Learn and Explore-shell suites; update
obsolete chrome assertions without weakening behavior. Verify StrictMode cleanup,
one scene/RAF owner, no extra session composition or sampling, focus return and
Escape priority. Cover desktop/mobile including 1440px, 390px, 320px and the
Explore 840px transition, short windows and text zoom. Real-browser checks must
cover navigation/logo, dialogs, Learn guarded departures and Back/Next, Explore
camera/resize and visible footer without clipped laboratory content.

Retain and explicitly report the two checkpoint-confirmed baseline failures:

- `src/ui/tracer/formatTrajectoryTiltingVerification.test.ts`: expects operand
  wording while the unchanged production baseline uses vector wording.
- `src/ui/tracer/publicClarity.test.tsx`: expects unavailable wording absent from
  the unchanged production baseline.

Those two tests and their production sources are excluded from shell edits. Do
not repair them incidentally or report the full suite as green. The prior
557/559 result is historical checkpoint evidence, not a shell verification result.
Any additional failure must be investigated and reported as a possible regression.

## Explicitly NOT authorized

The authorization excludes commit/push/deploy,
blanket staging/reset/clean, unrelated Landing redesign/copy correction, research
outputs, new lessons, T1 education, thermodynamics, scientific refactoring,
model/coordinate/numerical/integration/trajectory/dataset/API changes and changes
to frozen records. No new scientific execution/campaign or qualification is
authorized. No whole-MVP or Stage 2 technical/visual acceptance is inferred from
the checkpoint or shell developer checks.

INTRODUCED: shared presentation/navigation composition only.
NOT INTRODUCED: new model semantics, numerical methods, scientific calculations,
datasets, lesson content or research stages.
NOT CLAIMED by authorization alone: implementation completed, browser verification
performed, tests passed for a shell, human visual acceptance or scientific qualification.
Actual developer results and limitations are recorded in the
[implementation review](reviews/2026-10-25-unified-ui-shell-implementation-review.md);
human visual acceptance remains separate.

## Authorization consequence and stop gate

Current consequence: the owner's explicit authorization opens bounded implementation
and developer verification in the four stages above. Preserve unrelated uncommitted
work and stop for human disposition on a material conflict that cannot be resolved
within this contract. After developer verification, report changed files/components, precise
test/browser results, retained failures, limitations and readiness for human visual
review; stop without commit, push or deploy.

## Subsequent human authorization — original (English)

Human project owner, 2026-10-25. This disposition activates the bounded action
permission; the earlier source below retains its historical preflight meaning.

> **Human authorization — APPROVED / ACTIVE for bounded implementation and developer verification.**
>
> I have reviewed `2026-10-25-unified-ui-shell-implementation-decision-proposal.md`.
>
> I explicitly approve the bounded Unified UI Shell implementation and developer verification described in the proposed Decision, with the following scope:
>
> 1. Shared dark Header, original clickable logo, Explore/Learn navigation and accessible Resources disclosure.
> 2. Shared Footer with `full` variants for Home/Learn and `compact` for Explore.
> 3. Integration in the approved sequence: Home → Learn → Explore → integrated regression review.
> 4. Necessary scoped styling, accessibility, focus-management and regression-test changes.
>
> Preserve all stated navigation, session, scientific, rendering and lifecycle invariants.
>
> Preserve unrelated uncommitted work. Do not expand into Landing content polish, new scientific functionality, research or documentation cleanup.
>
> Record this explicit human authorization in the mutable Decision and update PROJECT_STATUS according to governance requirements.
>
> Proceed with the approved implementation stages and developer verification.
>
> If a material layout, lifecycle, accessibility or scope conflict cannot be resolved within the approved contract, stop and report it for human disposition.
>
> After completion, provide the changed-file inventory, verification results, known baseline failures and remaining limitations.
>
> **Stop for human visual acceptance. Do not commit, push or deploy.**

## Source language

English (en).

## Source instruction — original

Bounded verbatim excerpts from the human owner's request; omitted sections are
explicitly marked. These excerpts authorize preparation and define the proposed
scope; they do not assert an implementation authorization absent from the request.

> The four-lesson Learn MVP has been checkpointed in commit `c5a394d0cdf1bbefa7caff0ddf5ed2dba09b955c`.
>
> We are now proceeding with the previously discussed Unified UI Shell initiative.
>
> The objective is to make Home, Learn and Explore feel like three parts of one coherent scientific application.
>
> Use the existing repository audit and governance documentation as the starting point. Do not redesign the architecture from scratch.
>
> ## 1. Pre-implementation review
>
> Before modifying application code:
>
> 1. Read `PROJECT_STATUS.md` and the applicable governance documents.
> 2. Locate the existing Unified UI Shell audit, design proposals and Decisions.
> 3. Check the current Git working tree and preserve unrelated uncommitted changes.
> 4. Identify any remaining implementation authorization gates.
> 5. Confirm the smallest safe implementation sequence.
>
> If implementation authorization is missing, prepare the required bounded Decision and stop for human approval. Do not interpret this request as permission to bypass repository governance.
>
> ## 2. Approved design direction
>
> ### Shared Header
>
> Implement a reusable dark Header across Home, Learn and Explore.
>
> - Use the existing original Supercell Explorer logo.
> - Make the logo clickable and navigate Home.
> - Remove redundant branding next to the logo.
> - Include primary navigation: Explore, Learn, Resources.
> - Visually indicate the active section.
> - Preserve the existing state-driven navigation; do not introduce a router.
>
> ### Resources
>
> Implement an accessible disclosure containing:
>
> - User Guide
> - How It Works
> - Glossary
> - What's New · V1.1
>
> Reuse the existing resource dialogs and release metadata.
>
> Preserve contextual help behavior in Learn and correct focus handling.
>
> ### Shared Footer
>
> Use one shared Footer component with two presentation variants:
>
> - `full` — Home and Learn.
> - `compact` — Explore.
>
> Preserve the existing creator attribution, scientific limitations, relevant resource links and portfolio destination.
>
> The compact Explore Footer must minimize the loss of usable laboratory height.
>
> ### Page-specific behavior
>
> **Home:** Preserve hero, Explore/Learn entry cards, roadmap, scientific positioning, data attribution and existing content.
>
> **Learn:** Preserve all four lessons, lesson tabs, Back/Next navigation, departure guards, help state, session lifecycle and scientific behavior.
>
> **Explore:** Preserve laboratory controls, Hodograph, 3D viewport, independent scrolling, camera interaction, tracers, diagnostics and Analysis T1.
>
> Do not change scientific calculations, model semantics, numerical integration or dataset handling.
>
> ## 3. Implementation sequence
>
> Work in bounded stages:
>
> 1. Shared components and Home integration.
> 2. Learn integration.
> 3. Explore integration.
> 4. Cross-page consistency and regression verification.
>
> At each stage, verify the relevant navigation, lifecycle and accessibility behavior before proceeding.
>
> Do not combine unrelated refactoring with shell integration.
>
> ## 4. Important UX constraints
>
> - Do not automatically reset Learn sessions when opening Resources.
> - Preserve confirmation behavior when leaving active lessons.
> - Do not add global pointer handlers that interfere with WebGL.
> - Preserve Explore canvas usability and height budget.
> - Keep the existing scientific visualization dimensions wherever possible.
> - Use responsive navigation on narrow screens.
> - Maintain keyboard accessibility and appropriate focus restoration.
> - Reuse existing CSS tokens and component primitives.
>
> ## 5. Verification
>
> Run relevant tests, typecheck, production build and frozen-identity checks.
>
> Also verify in a real browser where available:
>
> - Navigation among Home, Learn and Explore.
> - Logo → Home.
> - Resources dropdown and dialogs.
> - Learn departure confirmation and cancellation.
> - Learn Back/Next navigation.
> - Explore camera, controls and viewport resize.
> - Desktop and mobile layout.
> - Footer visibility without clipping the 3D workspace.
>
> The two previously confirmed baseline test failures must remain explicitly identified. Do not silently modify them or report the full suite as green.
>
> ## 6. Completion requirements
>
> Report:
>
> 1. Files changed.
> 2. Components created or reused.
> 3. Test results.
> 4. Browser verification results.
> 5. Remaining issues or acceptance gates.
> 6. Whether the implementation is ready for human visual review.
>
> Do not commit, push or deploy until the owner has reviewed the integrated interface.
>
> Do not expand this task to new Learn lessons, T1 education, thermodynamics, scientific refactoring or unrelated documentation cleanup.
>
> **Goal: one coherent interface, without changing the behavior of the existing scientific and educational application.**


## Human visual review and final polish authorization — 2026-10-25

Human project owner, recorded by Agent. The owner visually reviewed the shared shell and approves the overall Header/navigation direction only. Final acceptance remains pending two presentation corrections and the separately authorized Landing clarity pass. This bounded disposition supersedes only the preceding full-content compact Footer design, the retained dark Learn model panel/local guide action and the no-Landing-copy-polish exclusion. It authorizes a light local disclaimer with the exact existing scientific sentence, removal of its redundant lower guide row, a flexible approximately 32–40 CSS px desktop Explore status strip (product/version, prototype status and attribution access), and accurate four-lesson/T1/CAPE-CIN/case-context Landing copy with equally available primary entries. Preserve all scientific/rendering/lifecycle/height-budget invariants and unrelated work. Stop for disposition if the strip cannot fit usefully; browser checks must be reported unverified when unavailable. Focused/full tests, typecheck, build, frozen checks and bounded documentation consequences are authorized. No scientific or unrelated cleanup, commit, push or deploy is authorized. Stop for final human review. No whole-shell or scientific acceptance is inferred.

Developer completion is recorded in the [bounded final-polish review](reviews/2026-10-25-unified-ui-shell-implementation-review.md#final-polish--bounded-developer-review-2026-10-25), including new real-browser checks and retained baseline failures. This records execution of the authorized work only; final human acceptance remains pending.

### Source language

English (en).

### Source instruction — final polish, original

> # Supercell Explorer — Final UI Shell & Landing Polish
>
> ## Human review disposition
>
> The shared UI Shell implementation has been visually reviewed by the project owner.
>
> The overall global Header and navigation direction is approved. However, two presentation issues require correction before final acceptance.
>
> In addition, perform the previously deferred Landing content clarity pass based on external first-time-user feedback.
>
> This is a bounded UI presentation and copy refinement. Do not redesign the application or change scientific functionality.
>
> ## 1. Learn — About this model
>
> The existing dark "About this model" panel is visually too heavy now that the application has a shared dark Footer.
>
> Change it to a light, understated informational surface consistent with Learn's light background.
>
> Preserve the exact scientific meaning of the existing disclaimer:
>
> "This is a computer model with a prescribed velocity field, not a reconstruction or forecast of a particular storm."
>
> Remove the redundant lower section of this panel:
>
> - Divider.
> - "Learn · Model guide".
> - "How It Works" action.
>
> Those resource destinations are now available through the shared Header/Footer.
>
> Preserve the disclaimer as local lesson content rather than relying only on the global Footer.
>
> Use scoped styling and accessible contrast.
>
> ## 2. Explore — Compact Footer correction
>
> The current compact Footer is visually compressed because Explore uses a viewport-constrained layout without ordinary vertical document scrolling.
>
> Do not try to reproduce the full Footer in Explore.
>
> The preferred design is a single-line compact status strip containing:
>
> - Supercell Explorer · current version.
> - Research prototype status.
> - Data & attribution access.
>
> Avoid duplicating User Guide, How It Works, Glossary and What's New, since those resources are already available through the global Header.
>
> Keep creator attribution and portfolio access through the full Footer on Home/Learn.
>
> Target a visual height of approximately 32–40 CSS px at normal desktop text size, without using a rigid height that clips content under zoom or localization.
>
> If the compact strip cannot remain usable within the current Explore height budget, stop and propose a minimal alternative that retains accessible attribution without permanently consuming workspace height.
>
> Preserve:
>
> - Desktop `100dvh` behavior and independently scrolling regions.
> - Canvas usability.
> - Existing laboratory control accessibility.
> - Responsive layout.
> - Hodograph access.
> - Scene ownership, sizing and camera behavior.
>
> Do not silently reduce scientific viewport dimensions, force page scrolling or hide content.
>
> ## 3. Home — Landing content clarity
>
> The four-lesson Learn MVP is now implemented.
>
> Update the outdated Learn entry text:
>
> "Velocity-vector instruction is planned."
>
> Replace it with accurate copy describing the four existing interactive lessons, using this suggested text:
>
> "Explore four interactive lessons on 3D orientation, passive tracer motion, velocity vectors, and spatial comparisons."
>
> Make Explore and Learn equally recognizable as available primary entry points. Their visual treatments may differ subtly, but Learn must not appear disabled or unavailable.
>
> Improve first-time-user clarity:
>
> - Explain Analysis T1 as a project-specific constrained vertical-tilting diagnostic; preserve the exact scientific meaning.
> - Clarify CAPE/CIN with expanded names or accessible explanations.
> - Provide verified years/event context for Goshen, Prospect Valley, Dumas and Moore, using existing dataset metadata.
> - Preserve accurate attribution and the distinction between observed source environments, transformed data and prescribed model airflow.
> - Keep the scientific boundary and research roadmap.
> - Preserve the existing slogan "Kinematics first. Thermodynamics next. Coupling only when the physics earns it."
>
> Do not introduce new scientific claims, implied storm reconstructions, available capabilities or results.
>
> Avoid expanding the Landing layout substantially.
>
> ## 4. Verification
>
> After implementing these changes:
>
> - Run focused UI and navigation regressions.
> - Run full typecheck, production build and frozen-identity checks.
> - Report full-suite results and distinguish known baseline failures from new regressions.
> - Check Learn's light disclaimer and Footer on desktop/mobile.
> - Check Explore's footer/canvas height budget at 1366×768, 1440×900, 390×844 and 320×844.
> - Check Resources keyboard/dialog behavior.
> - Verify the Landing copy against implementation status and scientific documentation.
> - Verify no scientific or rendering files were changed.
>
> If browser automation is unavailable, state that explicitly rather than claiming visual verification.
>
> Preserve unrelated working-tree changes.
>
> Update the relevant mutable Decision and PROJECT_STATUS within existing governance rules.
>
> **Stop for final human review. No commit, push or deploy yet.**

## Human release-risk disposition — 2026-10-25

Decision authority: human project owner; recorded by Agent. Approval state for
this bounded risk disposition: APPROVED. Authority status: ACTIVE. No new freeze
or immutable identity is created.

Accept publication risk for the current Learn MVP and Unified UI Shell with the
existing OPEN unsupported-path / Analysis T1 color-confusion defect and the seven
documented unchanged baseline assertion failures. The seven failures are
non-blocking test debt for this publication only; the full suite remains non-green.
This resolves only the corresponding risk-disposition gates in the
[pre-push audit](reviews/2026-10-25-pre-push-readiness-audit.md).

The original defect remains OPEN. This is not a fix, closure, scientific
qualification or approval of misleading T1 interpretation. Preserve all recorded
limitations, including physical touch, forced real context loss and prolonged
GPU/heap profiling. Do not change scientific calculations, rendering, tests or
frozen scientific records to resolve these findings in this release. The existing
37-file allowlist and all exclusions remain binding; no additional path is added.

Final integrated human visual acceptance for Home, Learn and Explore was checked
and is still unrecorded. The Header/navigation-direction approval and named Learn
UX acceptance do not establish that broader disposition. Therefore stop and
request explicit final visual acceptance. Do not infer it from this risk decision.
Only after the remaining acceptance gates are satisfied may the exact scoped
commit and fresh remote ancestry/range verification be prepared for separate
publication authorization. No staging/commit preparation, remote verification,
push or deploy follows from this disposition while the visual gate remains open.
No product release designation or publication-completion claim is recorded.

### Source language

English (en).

### Source instruction — release-risk disposition, original

> ## Human release-risk disposition — APPROVED
>
> I explicitly accept publication of the current Learn MVP and Unified UI Shell with the existing OPEN unsupported-path / Analysis T1 color-confusion defect.
>
> This is a bounded release-risk acceptance, **not a bug fix, bug closure, scientific qualification, or approval of misleading T1 interpretation**.
>
> I also accept the seven documented unchanged baseline assertion failures as non-blocking test debt for this publication. The full test suite must not be reported as green.
>
> Retain all documented verification limitations, including physical touch, forced WebGL context loss and prolonged GPU profiling.
>
> Do not modify scientific calculations, rendering behavior, tests or frozen scientific records to resolve these issues during this release.
>
> Use the existing 37-file release allowlist and preserve all explicitly excluded work.
>
> Before publication, confirm that final integrated human visual acceptance has been recorded for Home, Learn and Explore. If that acceptance is still missing, stop and request it rather than inferring it from this risk disposition.
>
> Once all remaining acceptance gates are satisfied, prepare the exact scoped commit and fresh remote ancestry/range verification for separate publication authorization.
>
> Do not push or deploy solely on the basis of this risk acceptance.

## Final integrated visual acceptance and scoped commit authorization — 2026-10-25

Decision authority: human project owner who personally inspected and interacted
with the current Home, Learn and Explore interfaces. Recorded by Agent.
This bounded product/UI acceptance and scoped commit authorization are APPROVED /
ACTIVE. Freeze mode remains MUTABLE; no immutable identity or scientific
qualification is created.

Accept the current integrated Home/Learn/Explore UI for the bounded publication,
including shared navigation, the light Learn disclaimer, compact Explore footer
and Landing refinements, with all documented limitations retained. This resolves
the missing final integrated visual-acceptance gate identified above and in the
[pre-push audit](reviews/2026-10-25-pre-push-readiness-audit.md). It is product/UI
acceptance only, not scientific qualification or closure of unrelated research
gates. The existing OPEN Analysis T1 interpretation defect and seven unchanged
baseline assertions remain documented and unresolved, accepted as non-blocking
for this release. The full suite is not green.

Authorize creation of exactly the reviewed 37-file scoped commit identified by
the [audit's complete allowlist](reviews/2026-10-25-pre-push-readiness-audit.md#exact-proposed-commit-and-file-allowlist),
based on Learn checkpoint `c5a394d0cdf1bbefa7caff0ddf5ed2dba09b955c`, subject to exact
allowlist verification and preservation of all excluded working-tree changes.
Permit only necessary documentation recording of this disposition within those
same paths. No new source, test, scientific, rendering or frozen-record change is
authorized to fix retained issues. The commit's actual Git tree/file list and
parent identify the resulting package; this mutable Decision does not self-pin
its eventual commit hash.

After committing, verify exact commit contents and perform fresh read-only remote
ancestry/range verification; fetch/remote inspection for that verification is
permitted. Report the resulting commit SHA and exact commits proposed for
publication. Stop before push. No push, deployment, scientific execution, release
tag/version designation or claim of completed publication is authorized.

### Source language

English (en).

### Source instruction — final visual acceptance and scoped commit, original

> **Human final integrated visual acceptance — APPROVED.**
> I have personally inspected and interacted with the current Home, Learn and Explore interfaces, including the updated shared navigation, Learn disclaimer, Explore footer and Landing refinements.
> I accept the current integrated UI for this bounded publication with the previously documented limitations.
> The existing OPEN Analysis T1 visual interpretation defect and seven unchanged baseline assertion failures are accepted as non-blocking for this release. They remain documented and unresolved.
> This is product/UI acceptance only, not scientific qualification or closure of unrelated research gates.
> **Authorize creation of the reviewed 37-file scoped commit**, subject to exact allowlist verification and preservation of all excluded working-tree changes.
> After committing, verify the commit contents and fresh remote ancestry/range, then report the commit SHA and the exact commits proposed for publication.
> **Stop before push. No deployment or scientific execution.**
