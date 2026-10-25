# Unified UI Shell — developer implementation review

## Status

| Field | Value |
| --- | --- |
| Document type | REVIEW RECORD |
| Approval state | PROPOSED for human review |
| Authority status | INACTIVE as acceptance or action authority; records developer findings only |
| Freeze mode | MUTABLE |
| Authority scope | Review of bounded shell implementation and developer verification; no human visual acceptance or scientific qualification |
| Parent authority | [Approved implementation Decision](../2026-10-25-unified-ui-shell-implementation-decision-proposal.md) and its original human authorization |
| Current project state | [PROJECT_STATUS](../PROJECT_STATUS.md) |
| Supersedes | None |
| Superseded by | None |

## Review basis and result — 2026-10-25

Developer review by Agent against the four-stage Decision and Learn checkpoint
`c5a394d0cdf1bbefa7caff0ddf5ed2dba09b955c`, preserving the pre-existing working-tree
Landing changes. Home, Learn and Explore now use the same Header and Footer
components. Implementation and developer checks are complete for human review;
real-browser layout/WebGL verification remains unavailable. This record does not
approve the visual result or close any Learn/scientific acceptance gate.

## Implemented behavior

- `GlobalHeader` reuses the original logo and existing state transitions. Logo
  activation returns Home through Learn's existing departure guard. Explore/Learn
  have an active underline and weight; current-section activation is a no-op.
- `shellResources` derives What's New version text from existing public release
  metadata. Header disclosure and Footer actions open existing resource dialogs;
  no resource pages, router or dependencies were added.
- Header Resources supports native button activation, Tab traversal, Escape,
  keyboard departure and outside-click dismissal. Only a temporary document
  `click` listener is added; no global pointer/touch handlers are introduced.
  Narrow navigation expands in document flow.
- `useResourceDialog` consolidates the existing Close/Escape/focus-return behavior
  and adds Tab containment and focus redirection. Header dialogs restore focus to
  the persistent Resources button; after a resize to collapsed mobile navigation,
  focus returns to Menu. Footer/local-guide dialogs return to their own opener.
  Dialog Escape stops underlying lesson handlers.
- `GlobalFooter` provides `full` Home/Learn and `compact` Explore variants. The
  existing creator, portfolio, project/year and dataset attribution content is
  reused, with resource actions and the forecasting limitation. Compact attribution
  expands upward; full attribution remains in document flow.
- Home retains its hero, both onboarding cards, content, photograph credit,
  roadmap, model boundary and observed-environment links. Only replaced global
  chrome/resource/footer markup was extracted. No Landing copy polish was made.
- Learn retains lesson tabs, Back/Next, `selectLesson`/departure ownership and its
  local About this model section. Disclosure toggling does not pause/reset a
  session; opening any resource dialog uses existing help-pause semantics. Compare
  placement ends under those existing help semantics without resampling or scene
  recreation. Recorded paths, saved reference and confirmation cancellation remain
  covered by the lesson regressions.
- Explore retains its local Hodograph tool and scientific description. A page
  heading replaces the breadcrumb, documentation actions move to shared chrome,
  and Header/main/compact Footer share the viewport height. Existing regional
  scrolling, workspace width and the below-840px page-scroll behavior remain.
  What's New now participates in the existing keyboard-shortcut suppression while
  its dialog is open; user pause state and existing simulation pause rules are
  retained.

## Changed-file inventory for this initiative

The following paths are relative to the repository. This is the shell change
inventory, not a list of all pre-existing dirty files.

| Group | Paths |
| --- | --- |
| New shared production files | `src/app/GlobalHeader.tsx`, `GlobalFooter.tsx`, `shellResources.ts`, `useResourceDialog.ts`, `shell.css` |
| Existing integration files | `src/app/App.tsx`, `src/app/LandingPage.tsx`, `src/app/learn/LearnPage.tsx` |
| Existing resource dialogs | `src/app/HowItWorksSurface.tsx`, `UserGuideSurface.tsx`, `GlossarySurface.tsx`, `WhatsNewSurface.tsx` |
| New mounted regression tests | `src/app/GlobalShell.test.tsx`, `AppShellNavigation.test.tsx` |
| Updated resource/chrome tests | `src/app/LandingPage.test.tsx`, `appNavigation.wiring.test.tsx`, `HowItWorksSurface.test.tsx`, `UserGuideSurface.test.tsx`, `GlossarySurface.test.tsx`, `WhatsNewSurface.test.tsx`, `howItWorks.wiring.test.tsx`, `userGuide.wiring.test.tsx`, `glossary.wiring.test.tsx` |
| Updated Learn integration tests | `src/app/learn/Learn.test.tsx`, `LearnFollowMotion.test.tsx`, `LearnCompareFlow.test.tsx` |
| Documentation consequences | The mutable implementation Decision, `docs/PROJECT_STATUS.md`, and this review record |

Source hashes against the saved pre-implementation source established that all
existing changed source files are under `src/app/`. Existing rendering,
TracerViewport, session/measurement/placement algorithms, physics, simulation,
integration, data, Analysis T1 and validation sources/tests were preserved.
`app.css`, `landing.css`, `landingContent.ts` and the existing image assets were
also preserved; shared styling is isolated in `shell.css`. Unrelated documentation
and research changes remain outside this initiative.

## Verification results

| Check | Result |
| --- | --- |
| Stage 1 Home/shared components/resource checks | 46/46 tests, 7 files PASS |
| Stage 2 Learn + shared shell | 133/133 tests, 12 files PASS |
| Stage 3 mounted App/shared shell/navigation/resource/Explore shell | 27/27 tests, 7 files PASS |
| Final focused shell, all Learn, resource/navigation and relevant rendering/picking regressions | 233/233 tests, 27 files PASS, including final focus-return refinements |
| Full Vitest suite | 2458 PASS, 8 SKIPPED, 8 FAIL; 240 files: 232 PASS / 8 FAIL. Not a green full suite |
| Separate unchanged pre-shell source reproduction | All seven assertion failures below reproduced: 7 FAIL / 66 PASS in 7 files |
| Sandbox infrastructure retry | The eighth full-suite failure was temporary hard-link EPERM. The exact single synthetic infrastructure test passed outside the sandbox: 1 PASS / 28 SKIPPED |
| Full TypeScript check | PASS |
| Production build | PASS; existing large-chunk warning retained |
| Frozen-identity verification | PASS against accepted snapshot `8d916037058a919560b6c2d01ae65823589e96bb` |
| Diff whitespace check | PASS with `core.whitespace=cr-at-eol` for existing Windows line endings |

Verification commands used the existing scripts (`npm run typecheck`, `npm run
build`, `node scripts/check-frozen-identities.mjs`) and
`node node_modules/vitest/vitest.mjs run --maxWorkers=2 --reporter=dot` for the full
suite. Stage/focused invocations selected the owning test files/directories.
Developer tests do not establish scientific qualification or visual acceptance.

### Retained failures

The two previously confirmed baseline failures remain unchanged and explicitly
identified:

1. `src/ui/tracer/formatTrajectoryTiltingVerification.test.ts` — undefined alignment
   expects “operand” wording while baseline production uses “vector”.
2. `src/ui/tracer/publicClarity.test.tsx` — expects availability wording absent from
   the baseline environment UI.

The broader run exposed five further pre-existing assertion failures, reproduced
against the untouched pre-shell source snapshot and left unchanged:

3. `src/app/exploreEnvironmentAnalysis.wiring.test.ts` — outdated composition-call
   structural assertion.
4. `src/app/exploreFollow.wiring.test.tsx` — outdated direct glyph-sync structural
   assertion after Learn's presentation-source support.
5. `src/app/tracerInspector.wiring.test.ts` — outdated completed-step notification
   structural assertion.
6. `src/explore/encodeExploreAnalysisTilting.test.ts` — missing expected legacy
   “Analysis T1 along recorded path” copy.
7. `src/explore/resolveExploreHistoricalAnalysisTilting.test.tsx` — missing expected
   “not FULL_SUPPORT” copy.

The additional environment failure in
`src/validation/observedLagrangianPhaseP.validation.test.ts` occurred in the
“uses exclusive synthetic artifacts and preserves partial files without overwrite”
test: Windows sandbox EPERM on publishing a temporary hard link. A separately
approved unsandboxed invocation of that exact synthetic test passed. No observed
scientific collection was run; validation code was not changed.

No additional shell regression remained in the completed checks. The full-suite
result must continue to be reported with these failures and the retry distinction.

## Browser verification and acceptance limitations

Real-browser checks were attempted but could not be performed. The in-app browser
preview timed out. Local Chrome computer control then stopped because its tool
could not determine the current URL with sufficient confidence to enforce policy.
No further browser control or workaround was attempted.

NOT VERIFIED for the integrated shell: real desktop/mobile appearance and contrast
as rendered, Explore canvas/compact-footer height budget, regional scrolling and
resize in WebGL, camera gestures, touch/pinch, narrow menu/dialog layout, footer
attribution clipping, text zoom, assistive-technology behavior, real context loss
and prolonged GPU/heap behavior. Mounted tests cover navigation/focus/session
behavior but are not substitutes for these browser checks.

The implementation is available for human visual review with these explicit
limitations. Inspect the three surfaces, all resource dialogs, active-lesson
departure confirmation/cancellation and Back/Next, Compare placement/help behavior,
Explore camera/controls/resize and full/compact footers at desktop, short-window
and narrow widths before accepting the integrated interface.

NOT CLAIMED: human visual acceptance, scientific certification, successful real
browser/WebGL regression verification or resolution of the retained baseline tests.
The owner must provide separate acceptance; commit, push and deploy remain gated.

## Final polish — bounded developer review, 2026-10-25

The owner's subsequent visual review approved the overall Header/navigation
direction and requested two presentation corrections plus the deferred Landing
clarity pass. The [mutable Decision's final-polish disposition](../2026-10-25-unified-ui-shell-implementation-decision-proposal.md#human-visual-review-and-final-polish-authorization--2026-10-25)
records the exact instruction and bounded authorization. Final human acceptance
remains separate. The preceding implementation/browser findings retain their
historical meaning; the following new checks resolve only the named polish scope.

### Presentation and copy changes

- Learn's local About this model section is a light informational surface using
  existing surface/text tokens. Its scientific sentence is unchanged verbatim.
  The divider, Model guide label and local How It Works action are removed;
  Header/Footer resources continue to use existing help state and focus behavior.
- Explore's compact Footer is now a status strip with product/version, Research
  prototype and the existing Data & attribution disclosure. It contains no resource
  navigation or creator/portfolio duplicate; the full Home/Learn Footer retains
  those items. Flexible wrapping/minimum size replaces the multi-column compact
  layout; no fixed height or clipping is imposed. The attribution panel expands
  upward without consuming permanent workspace height.
- Home describes the four implemented lessons using the owner's suggested copy.
  Both entry buttons use the same filled primary treatment. Analysis T1 is explained
  as the project's constrained vertical-tilting diagnostic using environmental
  horizontal vorticity and the horizontal gradient of prescribed updraft vertical
  velocity. CAPE and CIN are expanded in the future/not-implemented roadmap.
  Existing case links now display the years from the shared environment labels:
  Goshen 2009, Prospect Valley 2010, Dumas 2010 and Moore 2013. Source/filtered
  Analysis/prescribed airflow and storm-motion distinctions are explicit. The
  scientific boundary, attribution, roadmap and full slogan are retained.

Copy was checked against the implemented four-lesson list, shared
`src/explore/exploreEnvironmentIdentity.ts` labels/observed-source metadata,
`src/app/publicDiagnosticCopy.ts`, Physics 22 and Architecture 62's public Analysis
T1 boundary. No event year, model capability or result was invented; no dataset
loading or scientific source was changed.

### File scope

Production changes in this refinement: `src/app/GlobalFooter.tsx`, `shell.css`,
`LandingPage.tsx`, `landingContent.ts`, `landing.css`, and
`src/app/learn/LearnPage.tsx`. Scoped test changes:
`src/app/AppShellNavigation.test.tsx`, `LandingPage.test.tsx`, and
`src/app/learn/LearnFollowMotion.test.tsx`. Documentation changes: the mutable
Decision, PROJECT_STATUS and this review. Existing Data & attribution markup is
reused through a small component in GlobalFooter; no new framework/dependency.

Hash comparison to the pre-polish working tree confirms all other existing files
were preserved, including scientific, rendering, camera, scene sizing/ownership,
session, integration, diagnostic and dataset code. The existing viewport/region
scroll rules and Header/Resources implementations were not changed.

### Verification

- Focused UI/navigation/Learn/shell checks: **156/156 tests in 16 files PASS**.
- Full typecheck, production build and frozen-identity checks: **PASS**; existing
  bundle-size warning retained (1459.68 kB JS / 350.85 kB gzip).
- Initial full suite: 2458 PASS / 8 SKIPPED / 8 FAIL, 240 files, plus one Vitest
  worker `onTaskUpdate` reporting timeout. Seven assertion failures match the
  previously reproduced baseline list above; the eighth is the known sandbox
  hard-link EPERM. This run is not reported as green or error-free.
- Sequential full-suite retry outside the sandbox (`--maxWorkers=1`): **2459 PASS /
  8 SKIPPED / 7 FAIL**, 240 files (233 PASS / 7 FAIL). No unhandled worker error;
  the temporary hard-link test passed. All remaining failures are the unchanged
  previously reproduced baseline assertions listed above. The full suite remains
  non-green; no new regression was found in the completed checks.
- The two originally known `formatTrajectoryTiltingVerification.test.ts` and
  `publicClarity.test.tsx` failures, plus the five additional baseline assertion
  failures listed above, remain unchanged. No baseline repair was part of polish.

### New real-browser checks

A reachable local preview was available for this refinement after starting its
server outside the sandbox. This is new bounded browser evidence, not a claim
that earlier unavailable checks had been performed.

| Explore viewport (CSS px) | Status strip height | Canvas height | Scroll/overflow result |
| --- | --- | --- | --- |
| 1366 × 768 | 37 px | 375.34 px | Footer ends at y=768; body overflow hidden; both side regions overflow-y auto; no horizontal overflow |
| 1440 × 900 | 37 px | 507.34 px | Footer ends at y=900; body overflow hidden; no horizontal overflow |
| 390 × 844 | 72.5 px, wrapped | 420 px | Existing narrow page-scroll layout retained; no horizontal overflow |
| 320 × 844 | 72.5 px, wrapped | 420 px | Existing narrow page-scroll layout retained; no horizontal overflow |

The 37 px desktop strip meets the requested approximate 32–40 px target without a
rigid height. At 1366 px and 320 px, opened attribution panels fit the viewport;
desktop strip height remained 37 px and narrow canvas height remained 420 px.
No permanent workspace expansion or camera/rendering workaround was introduced.
Hodograph access and real WebGL scene rendering remained present.

Learn's disclaimer/full Footer were inspected at 1440 × 900, 390 × 844 and
320 × 844: local sentence unchanged, no local guide action, one full Footer, no
horizontal overflow. The rendered light surface is #f4f6f9 and disclaimer text
#4a5a6a: calculated contrast **6.55:1**. Home's two entry buttons were verified
enabled with opacity 1 and the same filled background; the four year labels and
updated copy were present.

Desktop Resources keyboard checks covered Enter opening, Tab into User Guide,
dialog initial Close focus, Shift+Tab containment and Escape restoration to
Resources. Mobile Menu/Resources/How It Works also opened by keyboard and returned
to a visible Resources trigger after Escape. Captured warning/error logs were
empty during these checks. Browser viewport overrides were reset afterward.

Local visual captures for human review are under
`artifacts/ui-shell-final-polish-2026-10-25/`: Explore 1366 px, Home 1440 px, Learn
desktop and Learn 390 px. These are local UI evidence, not publication or scientific
qualification. Physical-device touch, exhaustive zoom/localization and assistive
technology coverage, forced real context loss and long GPU/heap profiling remain
NOT VERIFIED. Stop for final human review; no final acceptance or commit/push/deploy
permission is established by these developer results.

## Subsequent final human product/UI acceptance — 2026-10-25

The owner's [explicit final acceptance and commit Decision](../2026-10-25-unified-ui-shell-implementation-decision-proposal.md#final-integrated-visual-acceptance-and-scoped-commit-authorization--2026-10-25)
records personal inspection and acceptance of current Home, Learn and Explore for
the bounded publication, with all limitations retained. The OPEN T1 visual
interpretation defect and seven unchanged baseline assertions remain unresolved
and accepted as non-blocking for this release. This is product/UI acceptance only;
no scientific qualification or unrelated research gate is closed. The reviewed
37-file scoped commit and fresh remote ancestry/range verification are separately
authorized by that Decision. Stop before push; no deploy or scientific execution.
