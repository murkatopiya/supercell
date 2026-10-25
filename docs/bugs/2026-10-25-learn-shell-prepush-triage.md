# Learn / Unified UI Shell — bounded pre-push triage

## Status

| Field | Value |
| --- | --- |
| Document type | REVIEW RECORD |
| Approval state | PROPOSED for owner disposition |
| Authority status | INACTIVE as release or acceptance authority; dated triage findings only |
| Freeze mode | MUTABLE |
| Authority scope | Classify existing Learn/Shell issues and link their evidence; no bug fixes, scientific changes or publication authorization |
| Parent authority | Owner's bounded pre-push audit request; [Learn checkpoint Decision](../2026-10-25-learn-mvp-checkpoint-decision.md), [Shell Decision](../2026-10-25-unified-ui-shell-implementation-decision-proposal.md) and [implementation review](../reviews/2026-10-25-unified-ui-shell-implementation-review.md) |
| Current project state | [PROJECT_STATUS](../PROJECT_STATUS.md) |
| Supersedes | None |
| Superseded by | None |

## Review basis — 2026-10-25

Agent review of the existing bug registry, checkpoint/acceptance Decisions,
implementation, developer verification and final-polish evidence. Categories below
are audit findings, not human acceptance or waivers. No production or test was
changed to fix a finding. [Pre-push readiness review](../reviews/2026-10-25-pre-push-readiness-audit.md)
owns the new verification results, exact proposed release allowlist and stop gates.

## Existing confirmed defect — reuse its owning report

| ID | Classification | Finding, evidence and disposition |
| --- | --- | --- |
| Existing T1 unsupported-path color conflict | Confirmed defect — existing OPEN record | [Original bug](2026-09-11-analysis-unsupported-segment-looks-like-t1.md) remains the owner. Unsupported Analysis samples omit diagnostic primitives while the underlying occupancy trail can retain the red tracer identity color. Source still has `TRACER_COLORS[0] = 0xe74c3c` and no encoded value for OUT_OF_DOMAIN / COLUMN_UNAVAILABLE. No fix/closure or new manual reproduction is claimed here. It is a scientific-interpretation risk requiring explicit owner release disposition; this audit neither fixes nor silently waives it. |

## Baseline assertion failures — test maintenance / technical debt

These seven assertions previously reproduced against untouched pre-shell source.
They remain unchanged. Their evidence is in the
[Shell review's retained failures](../reviews/2026-10-25-unified-ui-shell-implementation-review.md#retained-failures)
and [checkpoint Decision](../2026-10-25-learn-mvp-checkpoint-decision.md).
Developer baseline status does not itself authorize release with failing tests.

| ID / file | Classification | Exact reconciliation still needed |
| --- | --- | --- |
| LS-T01 — `src/ui/tracer/formatTrajectoryTiltingVerification.test.ts` | Test maintenance / technical debt | Undefined alignment expects “operand” while the production formatter uses “vector”. Reconcile wording with the approved vocabulary; preserve undefined/zero numerical behavior. |
| LS-T02 — `src/ui/tracer/publicClarity.test.tsx` | Test maintenance / technical debt | Test mounts ExploreEnvironmentSelector expecting explanatory availability/honesty copy. Production moved that copy into ExploreLaboratoryAbout, which App mounts with actual Analysis availability. This is an obsolete component boundary in the test, not evidence by itself that the whole application lacks the copy. Future maintenance must test the composed visible disclosure and preserve unavailable ≠ zero / observed vs prescribed semantics; do not weaken the oracle to make the test pass. |
| LS-T03 — `src/app/exploreEnvironmentAnalysis.wiring.test.ts` | Test maintenance / technical debt | Old composition-call structural pattern does not match the current call shape. Reconcile with existing prescribed storm-motion support; retain the prohibition on Simulation depending on Analysis. |
| LS-T04 — `src/app/exploreFollow.wiring.test.tsx` | Test maintenance / technical debt | Old direct `syncFromParticles(simulation.particles)` pattern predates Learn's opt-in presentation sources. Preserve Explore live-particle Follow ownership and its existing behavioral checks. |
| LS-T05 — `src/app/tracerInspector.wiring.test.ts` | Test maintenance / technical debt | Old completed-step callback source pattern is stale. Preserve once-per-completed-batch observation and stable scene-effect dependencies. |
| LS-T06 — `src/explore/encodeExploreAnalysisTilting.test.ts` | Test maintenance / technical debt | Expects legacy “Analysis T1 along recorded path” UI wording. Reconcile public labeling while retaining public Analysis-only wiring, support encoding and unchanged picking. |
| LS-T07 — `src/explore/resolveExploreHistoricalAnalysisTilting.test.tsx` | Test maintenance / technical debt | Expects literal “not FULL_SUPPORT”; current panel says “Available with boundary-dependent filtering” and uses the explicit boundary explanation. Preserve numerical/support distinctions and no zero fallback. |

## Other technical debt and environment-specific findings

| ID | Classification | Evidence / disposition |
| --- | --- | --- |
| LS-T08 — production chunk size | Test maintenance / technical debt | Existing Vite >500 kB warning; final-polish JS was 1459.68 kB / 350.85 kB gzip. Build succeeds. No measured loading/performance failure is established by this warning. Defer code splitting/performance work to its own scope; retain the warning in release limitations. |
| LS-T09 — blank provenance-quote whitespace | Resolved issue during authorized commit packaging | The audit found 45 trailing-space blank blockquote markers (`> `) in the mutable Shell Decision. During the subsequently authorized 37-file packaging, only that blank quote envelope is normalized to `>`; comparison after removing quote prefixes confirms the source-instruction text is identical. This changes no decision-bearing wording, scientific record or runtime behavior. The original audit finding remains historical. |
| LS-E01 — hard-link EPERM | Environment-specific issue | Windows sandbox denies a temporary hard link in Phase P synthetic artifact infrastructure. The exact test and the sequential full suite passed that operation outside the sandbox. Validation source unchanged; no observed campaign executed. This is not a production scientific failure. |
| LS-E02 — Vitest worker reporting timeout | Environment-specific issue | One final-polish run reported `onTaskUpdate` timeout. Sequential retry outside the sandbox completed without it. Cause is not established; do not infer a product defect or permanently fixed runner from a successful retry. |
| LS-E03 — preview automation unavailable in earlier checks | Resolved issue within later bounded checks | Earlier browser timeout / URL-policy stop remain accurate historical limitations. Final-polish preview subsequently became reachable and the named layout/focus checks were performed. This does not imply all earlier WebGL scenarios were rerun. |

## Verification gaps and retained limitations

| ID | Classification | Evidence / next verification scope |
| --- | --- | --- |
| LS-V01 — physical touch/pinch | Verification gap | Physical-device gestures remain NOT VERIFIED. Responsive browser viewports and mocked gesture tests are not physical touch validation. See [Stage 2 plan](../ux/2026-10-25-learn-slice-4-stage-2-implementation-plan.md) and Shell review. |
| LS-V02 — real WebGL context loss | Verification gap | Unit/mocked cleanup/recovery checks exist; real forced context loss was not performed. |
| LS-V03 — prolonged GPU/heap behavior | Verification gap | No long-duration profile proves leak-free operation. Scene/RAF/disposal unit checks do not substitute for this. |
| LS-V04 — zoom/localization/assistive technology | Verification gap | Tested viewport layouts and keyboard dialog checks are bounded; exhaustive zoom, translated text, screen-reader/browser combinations and all arbitrary camera angles are not verified. |
| LS-V05 — one stopped Learn 3D view episode | Verification gap / unconfirmed anomaly | [Slice 3 technical acceptance](../2026-10-25-learn-slice-3-technical-acceptance-decision.md#retained-limitations-and-inference-boundary) retains one episode restored by Replay, not reproduced, cause unknown. Do not call it a reproducible confirmed defect or silently mark it fixed. |
| LS-V06 — camera/initial visibility limits | Verification gap / documented boundary | Close framing can crop far placement areas/arrows after B relocation; arbitrary orbit/zoom can foreshorten or crop arrows. Reset View restores the reviewed home framing. Initial-entry no-scroll criterion was not met; the separately authorized Move B reveal remedy was positively reviewed in the checkpoint. Neither that remedy nor this audit retroactively passes the original criterion. |
| LS-V07 — local-only saved evidence / retention | Verification gap | The [existing preservation Decision](../2026-10-22-learn-demo-slice2-evidence-preservation-decision.md) records a same-volume backup, no confirmed independent off-device retention and no automatic evidence availability in a fresh clone. The proposed package intentionally excludes ignored artifacts, so PROJECT_STATUS's explicitly local saved-result link is unresolved there. This is an existing distribution/retention limitation, not missing production data or permission to publish scientific outputs. |

## Resolved presentation issues

These are dated developer findings linked to their owning authorization and
[final-polish review](../reviews/2026-10-25-unified-ui-shell-implementation-review.md#final-polish--bounded-developer-review-2026-10-25), not invented human acceptance:

| ID | Classification | Result |
| --- | --- | --- |
| LS-R01 — heavy Learn About this model panel | Resolved issue | Light surface, exact local disclaimer retained; redundant divider/guide label/action removed. |
| LS-R02 — over-compressed Explore full-content footer | Resolved issue | Replaced by status strip; measured 37 px at both requested desktop sizes; attribution remains accessible, narrow canvas 420 px retained. |
| LS-R03 — stale Landing lessons/copy | Resolved issue | Four implemented lessons, equal primary entry actions, bounded T1/CAPE/CIN explanation and metadata-derived years are present. |
| LS-R04 — misleading README Learn/publication labels | Resolved issue | Four lessons documented, no invented deep-link routes, local implementation separated from V1.1 published-release baseline. |
| LS-R05 — formatting-sensitive picker checkpoint assertion | Resolved issue | The checkpoint's explicitly authorized AST-based assertion change preserves shared picker/history behavior; 12 picking tests passed in that reviewed checkpoint. No further test change is authorized by this triage. |

## Release significance and next action

No newly reproducible Learn/Shell responsive/navigation/footer/accessibility defect
was established by the retained final-polish evidence. This is a bounded negative
finding, not an exhaustive absence-of-defects claim. Publication recommendation
must account for the existing confirmed T1 bug, seven failing baseline assertions,
verification gaps and still-pending final human acceptance. The owner must decide
any release deferral/risk acceptance or authorize a separate bounded remediation;
this review does not create a waiver or permission to fix unrelated bugs.

## Subsequent human release-risk disposition — 2026-10-25

The owner's [bounded Decision](../2026-10-25-unified-ui-shell-implementation-decision-proposal.md#human-release-risk-disposition--2026-10-25)
accepts publication risk for the existing OPEN T1 color-confusion defect and
LS-T01–07 as non-blocking unchanged test debt for this publication. This does not
close or fix the defect, make the suite green, qualify science or approve a
misleading interpretation. All verification limitations and the existing 37-file
allowlist/exclusions remain. Final integrated Home/Learn/Explore visual acceptance
is still unrecorded, so stop and request it; commit preparation, fresh remote
verification and separate publication authorization remain later gated actions.

The owner's subsequent [final product/UI visual acceptance and exact scoped-commit
authorization](../2026-10-25-unified-ui-shell-implementation-decision-proposal.md#final-integrated-visual-acceptance-and-scoped-commit-authorization--2026-10-25)
resolve that visual gate and permit only the reviewed commit plus fresh remote
verification. The OPEN T1 defect and LS-T01–07 remain unresolved, accepted as
non-blocking for this bounded publication. Retain all verification limitations.
No scientific qualification or unrelated research closure is inferred. Stop before
push; deployment and scientific execution remain prohibited.
