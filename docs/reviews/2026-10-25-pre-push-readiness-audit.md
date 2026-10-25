# Learn / Unified UI Shell — pre-push readiness audit

## Status

| Field | Value |
| --- | --- |
| Document type | REVIEW RECORD |
| Approval state | PROPOSED for owner disposition |
| Authority status | INACTIVE as acceptance or publication authority; dated developer audit only |
| Freeze mode | MUTABLE |
| Authority scope | Dated audit findings and exact release file selection; this review grants no action permission, which belongs to the separate human Decision |
| Parent authority | Owner's pre-push audit request; [checkpoint Decision](../2026-10-25-learn-mvp-checkpoint-decision.md), [Shell/final-polish Decision](../2026-10-25-unified-ui-shell-implementation-decision-proposal.md), [implementation review](2026-10-25-unified-ui-shell-implementation-review.md) and active documentation governance |
| Current project state | [PROJECT_STATUS](../PROJECT_STATUS.md) |
| Supersedes | None |
| Superseded by | None |

## Recommendation — scoped commit authorized; STOP BEFORE PUSH

Audit by Agent, 2026-10-25. No new release-blocking Learn/Shell regression was
established by the completed bounded checks. The package can be presented for
scoped commit review, but is **not ready for unconditional GitHub publication**:

1. **Final visual acceptance recorded:** the owner personally inspected and
   interacted with current Home, Learn and Explore and explicitly accepted the
   integrated product/UI for this bounded publication in the
   [final acceptance/commit Decision](../2026-10-25-unified-ui-shell-implementation-decision-proposal.md#final-integrated-visual-acceptance-and-scoped-commit-authorization--2026-10-25).
   This is not scientific qualification or closure of unrelated research gates.
2. **Risk disposition recorded:** the existing [unsupported-path/T1 color-confusion bug](../bugs/2026-09-11-analysis-unsupported-segment-looks-like-t1.md)
   remains OPEN, but its publication risk is explicitly accepted in the
   [bounded human Decision](../2026-10-25-unified-ui-shell-implementation-decision-proposal.md#human-release-risk-disposition--2026-10-25).
   This is not a fix, closure, qualification or approval of misleading interpretation.
3. **Risk disposition recorded:** the same Decision accepts the seven unchanged
   baseline assertions as non-blocking test debt for this publication. The full
   suite remains non-green; no test or production change was made to resolve them.
4. **Exact 37-file commit authorized:** the same Decision permits creation of the
   reviewed scoped commit and subsequent fresh remote ancestry/range verification.
   GitHub push remains separately unauthorized. No product release/version,
   deployment or scientific execution is permitted.

The acceptance and scoped-commit gates are resolved only by the explicit human
Decision above; the 37-file allowlist and exclusions are unchanged. Verify exact
commit contents and fresh remote ancestry/range after committing, report SHA and
proposed publication commits, then stop before push. Risk acceptance and developer
checks alone did not grant this permission. Bundle size
and remaining verification gaps are retained risks, not independently established
runtime failures. No new scientific qualification or research-stage permission is
proposed. V1.1 remains the established published product release.

## Issue registry and classification

The [bug registry](../bugs/README.md) now links one consolidated
[Learn/Shell triage record](../bugs/2026-10-25-learn-shell-prepush-triage.md).
The existing T1 report is reused and unchanged; no duplicate product defect was
created. The new record includes:

- Confirmed defect: existing OPEN unsupported-path/T1 identity-color conflict.
- Test maintenance / technical debt: LS-T01–07 baseline assertions, LS-T08
  bundle warning and LS-T09 blank provenance-quote whitespace. The publicClarity failure mounts the selector rather than the
  composed About this laboratory surface; that surface's actual unavailable copy
  was checked in the browser for Moore.
- Environment-specific issues: sandbox temporary hard-link EPERM and a historical
  Vitest worker reporting timeout; successful retries do not establish a permanent
  fix to the environment.
- Verification gaps: physical touch/pinch, real forced WebGL context loss,
  prolonged GPU/heap profiling, exhaustive zoom/localization/assistive technology,
  arbitrary camera angles and one earlier non-reproduced stopped-view episode.
- Resolved presentation issues: heavy Learn model panel, compressed Explore footer,
  outdated Landing lesson/copy/primary actions, README availability/link wording,
  and the checkpoint's explicitly authorized picker assertion maintenance.

## Verification of the audited working tree

| Check | Result |
| --- | --- |
| Relevant shell/navigation/resource/Learn/rendering/picking regression suite | 233/233 PASS across 27 files |
| Full suite, sequential sandbox run | 2458 PASS / 8 SKIPPED / 8 FAIL, 240 files; seven known baseline assertions plus temporary hard-link EPERM; no new worker timeout |
| Isolated exact synthetic infrastructure retry outside sandbox | 1 PASS / 28 SKIPPED; hard-link operation succeeds; no observed campaign |
| Full typecheck | PASS |
| Production build | PASS; existing >500 kB chunk warning; main JS 1459.68 kB / 350.85 kB gzip |
| Frozen-identity checker | PASS against accepted snapshot `8d916037058a919560b6c2d01ae65823589e96bb`; no frozen artifact edited |
| Documentation links and whitespace | Audit-time 241 local links / 24 anchors across 12 Markdown files resolved in the working tree; isolated package has one documented local-only saved-evidence exception. Tracked-diff whitespace passed; the 45 quote-envelope blank-marker warnings found at audit time were subsequently normalized during authorized commit packaging without changing source-instruction text (LS-T09) |
| Isolated proposed package | Exported HEAD plus only the 37-file proposal; all 529 source files byte-identical to the audited working tree. Candidate typecheck and production build PASS with identical asset names/sizes |

Commands used the repository's existing typecheck/build/frozen checker and Vitest
with `--maxWorkers=1`. The focused selection covers GlobalShell, AppShellNavigation,
LandingPage, Learn, resource surfaces/wiring, App navigation, Explore shell,
TracerScene Learn/reset, velocity arrows and shared history picking. The full test
result is not green and must not be reported as if the isolated retry repaired
the seven assertions.

### Browser / WebGL checks

Fresh local-preview checks confirmed Home's four-lesson copy, unchanged local Learn
scientific sentence, light panel and zero local guide actions. Follow Motion's
active departure opened one confirmation; cancellation retained the lesson and
returned focus to Explore, and confirmed departure entered Explore. Resources
Enter/Shift+Tab/Escape checks retained dialog focus and restored the persistent
Resources trigger. Reset View remained available and produced the expected
rendered desktop view. No physical touch, forced context loss or prolonged profile
was performed.

| Explore viewport | Strip height | Canvas height | Result |
| --- | --- | --- | --- |
| 1366 × 768 | 37 px | 375.34 px | Footer ends at 768; body overflow hidden; no horizontal overflow |
| 1440 × 900 | 37 px | 507.34 px | Footer ends at 900; body overflow hidden; no horizontal overflow |
| 390 × 844 | 72.5 px, wraps | 420 px | Existing narrow page scrolling retained; no horizontal overflow |
| 320 × 844 | 72.5 px, wraps | 420 px | Existing narrow page scrolling retained; attribution panel fits viewport |

The compact Footer has no duplicate resource navigation. Actual Moore About this
laboratory text includes observed/prescribed distinctions, no-storm-reconstruction
copy and “Unavailable does not mean zero.” This supports LS-T02's component-boundary
triage; it does not authorize weakening the future test.

No new reproducible footer/navigation/accessibility defect was found in these
bounded checks. Exhaustive screen-reader, keyboard, text-zoom, localization and
all-state WebGL coverage remain NOT VERIFIED. Human acceptance is separate.
Captured browser warning/error logs were empty. A local screenshot is retained at
`artifacts/ui-shell-prepush-audit-2026-10-25/explore-status-and-availability.png`;
it is ignored UI evidence, not an additional proposed publication file. The
temporary audit tab was closed and viewport override reset after checks.

## Exact proposed commit and file allowlist

The audit base is `c5a394d0cdf1bbefa7caff0ddf5ed2dba09b955c`. This existing Learn
checkpoint already contains its 81-file implementation/test/owning-document set.
Do not recreate, squash or alter it during this audit.

The owner now authorizes **one additional scoped commit** for the 37 complete files
below through the separate final acceptance/commit Decision. The complete working-tree README and
Landing presentation are included as the intended release baseline, not just the
last small README/copy patch. The photo asset must travel with its existing
README/Landing/THIRD_PARTY_NOTICES attribution. No partially staged mixed file is
needed for the currently proposed delta; PROJECT_STATUS's current diff consists
of the relevant UI/Landing/audit entries.

README has a broader pre-existing rewrite relative to HEAD, beyond the final
accuracy patch. This proposal exposes the entire current file for owner review;
it does not claim that every pre-existing hunk was separately approved. If the
owner excludes that broader baseline, a separately reviewed hunk selection is
required before staging README. No such staging choice is made by this audit.

```text
README.md
THIRD_PARTY_NOTICES.md
docs/2026-10-25-unified-ui-shell-implementation-decision-proposal.md
docs/PROJECT_STATUS.md
docs/bugs/2026-10-25-learn-shell-prepush-triage.md
docs/bugs/README.md
docs/reviews/2026-10-25-pre-push-readiness-audit.md
docs/reviews/2026-10-25-unified-ui-shell-implementation-review.md
src/app/App.tsx
src/app/AppShellNavigation.test.tsx
src/app/GlobalFooter.tsx
src/app/GlobalHeader.tsx
src/app/GlobalShell.test.tsx
src/app/GlossarySurface.test.tsx
src/app/GlossarySurface.tsx
src/app/HowItWorksSurface.test.tsx
src/app/HowItWorksSurface.tsx
src/app/LandingPage.test.tsx
src/app/LandingPage.tsx
src/app/UserGuideSurface.test.tsx
src/app/UserGuideSurface.tsx
src/app/WhatsNewSurface.test.tsx
src/app/WhatsNewSurface.tsx
src/app/appNavigation.wiring.test.tsx
src/app/assets/north-texas-supercell.webp
src/app/glossary.wiring.test.tsx
src/app/howItWorks.wiring.test.tsx
src/app/landing.css
src/app/landingContent.ts
src/app/learn/Learn.test.tsx
src/app/learn/LearnCompareFlow.test.tsx
src/app/learn/LearnFollowMotion.test.tsx
src/app/learn/LearnPage.tsx
src/app/shell.css
src/app/shellResources.ts
src/app/useResourceDialog.ts
src/app/userGuide.wiring.test.tsx
```

The currently cached `origin/main` points to
`c3769f8af0cd662afcda6242cf952b7791e6065a`; local main is ahead by the one Learn
checkpoint. This is a local-ref observation, not fresh GitHub verification. After
explicit publication permission, recheck remote ancestry/range before any push.
The proposed range would contain the existing Learn checkpoint plus the approved
scoped follow-up commit, not an arbitrary dirty tree or unrelated history.

### Exact exclusions — preserve unchanged

```text
docs/README.md
docs/research/2026-09-14-observed-lagrangian-phase-p2-failure-evidence-capture-design.md
docs/research/2026-09-14-observed-lagrangian-phase-p2-failure-evidence-capture-implementation-review.md
docs/research/2026-09-14-observed-lagrangian-phase-p2-qualification-readiness-design.md
docs/ui/10-tracer-interaction-affordance.md
docs/ui/13-explore-tracer-authoring-history.md
e1-first-d158482.evidence.json
e1-first-d158482.execution.json
e1-first-d158482.stderr.txt
e1-first-d158482.stdout.txt
h4-output.txt
h5-output.txt
```

The six documentation edits are unrelated research/provenance or older Explore
pointer cleanup, not shell dependencies. The six root scientific outputs are not
release evidence and must not be staged. Existing ignored native `data/`, local
evidence/screenshots under `artifacts/`, `tmp/`, dependencies and build output are
also outside the proposal. Do not alter ignore rules to publish them implicitly.

### Isolated package link exception

The working-tree link check resolves the saved Learn Demo result at
`artifacts/learn-demo-seed-verification/2026-10-21-slice2-125957-dc632454/result.json`.
The isolated package correctly omits it. PROJECT_STATUS already labels this a
local saved result; the [preservation Decision](../2026-10-22-learn-demo-slice2-evidence-preservation-decision.md)
explicitly records that a fresh clone lacks the ignored evidence and that public
distribution/independent retention are separate dispositions. This single
local-only evidence link is a documented exception, not a passing fresh-clone
evidence-access check. Do not fix it by blanket publication of `artifacts/` or
scientific outputs. All ordinary audited documentation links/anchors resolve.

## Documentation consequence and integrity

The bug registry now exposes previously scattered issues and links owning
Decisions/evidence without modifying frozen records or inventing scientific
classification. PROJECT_STATUS points to this audit and retains all acceptance
and publication gates. README → PROJECT_STATUS → checkpoint/Shell Decisions →
implementation/triage/audit records reconstructs this bounded disposition without
chat history. No product version or release metadata was changed.

This audit modifies only the registry, consolidated triage, this review and the
bounded PROJECT_STATUS entry. No application, regression-test or existing T1 bug
record change is permitted by the audit. No staging, commit, push, fetch or deploy
was performed. Stop for the owner's final acceptance/risk disposition and explicit
publication authorization.

Subsequent human release-risk disposition resolves only the named T1 and seven-test
risk gates above. Final integrated visual acceptance remains unrecorded; stop and
request it. No new staging, commit preparation or remote verification was performed
while recording that disposition, and separate publication permission is required.

## Final human acceptance and commit packaging — 2026-10-25

The owner's final integrated visual acceptance and explicit 37-file commit
authorization supersede only the preceding missing-acceptance/no-commit gates.
All recorded defects, seven failing baseline assertions, numerical/scientific
limitations, verification gaps and excluded working-tree changes are retained.
The original quoted source instructions are preserved; only the blank blockquote
envelope's trailing spaces are normalized to allow clean staged whitespace checks.
No production, rendering, test, dataset or frozen scientific change is made during
this packaging step. The actual commit/tree and parent identify the resulting
package; its final SHA and freshly verified remote range are reported externally
after creation, avoiding self-referential commit identities in the document.
Stop before push; no deployment or scientific execution is authorized.
