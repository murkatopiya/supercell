# Scientific value communication — developer review

## Status

| Field | Value |
| --- | --- |
| Document type | REVIEW RECORD |
| Approval state | PROPOSED for human acceptance |
| Authority status | INACTIVE as acceptance, release or scientific authority |
| Freeze mode | MUTABLE |
| Authority scope | Dated verification of bounded Home/README presentation changes |
| Parent authority | [Communication Decision and execution refinement](../2026-11-03-scientific-value-communication-decision.md) |
| Current project state | [PROJECT_STATUS](../PROJECT_STATUS.md) |
| Supersedes | None |
| Superseded by | None |

## Implemented scope — 2026-11-03

### Subsequent T1 introductory refinement — 2026-11-03

Human review requested changes, not acceptance. Under the mutable Decision's
bounded refinement, the advanced section now starts with “How can airflow
contribute to rotation?” and explains horizontal rotation and updraft tilting
before naming T1. The requested qualification describes one local contribution,
not complete storm development. Secondary copy explicitly preserves supported
recorded-point/case restrictions, unavailable versus zero, non-prognostic meaning
and the fact that hypothetical alignment changes neither airflow, trajectories nor
real-storm rotation. Existing eyebrow styling displays ADVANCED ANALYSIS; no CSS,
README, computation, data, rendering or model-field change was needed.

Focused verification after this refinement: **LandingPage 15/15 PASS**. The new
section-scoped assertion checks the physical explanation and retained restrictions.
Earlier build/typecheck and 83-test results below belong to the preceding broader
implementation; they are not presented as new executions for this copy refinement.
Browser visual verification and human acceptance remain pending; screenshot
dependencies below remain unchanged. This is explanatory presentation within the
existing T1 source-term authority, not a new scientific result or evolved state.

Home uses the approved accessible hero, immediate prescribed-flow qualification,
Learn/Explore primary card titles and explanatory subtitles. Existing entry
callbacks and shared shell are unchanged. Four action cards precede a concise
Compare the Flow invitation and secondary Analysis T1 section. Research direction
is shortened; scientific boundaries and existing photo/data attribution remain.
The capability grid is two columns with the existing single-column narrow layout.
New documentation links have visible focus treatment and wrapping.

README adds the question/tool/interpretation/limitation table, exact fixed-probe
exercise and observation/prescription/calculation/diagnosis explanation. The
existing Scientific evidence section through the end of README is preserved
verbatim apart from line-ending representation, including unresolved qualification,
dataset provenance, setup, release qualifications, license, citation and authority
links. The original photograph remains explicitly labelled as a real storm,
not application output. No new imagery or screenshot placeholder was inserted.

Files: `README.md`, `src/app/LandingPage.tsx`, `src/app/landingContent.ts`,
`src/app/landing.css`, `src/app/LandingPage.test.tsx`; governance consequences are
limited to the owning Decision, this review and PROJECT_STATUS.

## Developer verification

- Focused Vitest run: **83/83 PASS in 7 files**: LandingPage (14), GlobalShell
  (3), AppShellNavigation (1), appNavigation.wiring (4), LearnCompareFlow (22),
  createCompareFlowSession (11), CompareFlowPlacement (28).
- Production build: **PASS**, 264 modules; existing >500 kB chunk warning remains
  (main JavaScript 1461.17 kB, gzip 351.24 kB). No bundle refactor is in scope.
- Typecheck (`npm run typecheck`, `tsc --noEmit`): **PASS**, exit 0.
- Frozen-identity checker: **PASS**, expected identities recovered from accepted
  snapshot `8d916037058a919560b6c2d01ae65823589e96bb`; no new pin or authority.
- Link check: **PASS** for 33 local Markdown targets/anchors in README/Decision,
  all four new Home README fragment targets, and the documentation-index target.
  Public URLs match the repository origin. External reachability is not claimed;
  new GitHub README anchors depend on later separately authorized publication.
- Scoped diff whitespace check: **PASS**. Original unchanged mixed line endings
  were retained to avoid unrelated diff churn.

The focused tests verify existing fixed height/time, A/B placement, measurement
and shell behavior without changing Learn or model implementations. The documented
five eastward steps agree with initial B east 2400 m and the 100 m placement step;
the final east coordinate is 2900 m. This is source/test verification, not a new
manual-browser execution or a scientific campaign. Full-suite baseline failures
were not rerun or repaired; no full-suite-green claim is made.

## Scientific claim review

- Local measurements and recorded-point inspection are available; inspection
  does not rewind a tracer.
- Prescribed contributions are vector summands, not independently observed causes
  or additive fractions of speed.
- Learn's three prepared comparison scopes remain distinct from Explore.
- C is assigned; changed C clears history and does not change observed
  ground-relative wind or prescribed storm-local fields.
- Observed sounding profiles are distinguished from prescribed 3D airflow.
- Analysis T1 remains secondary, support-limited, non-prognostic and independent
  of advection; unavailable is not zero, Source is not a public T1 fallback.
- Scientific evidence and unresolved numerical qualification remain unchanged.

## Screenshot and visual acceptance dependency

**NOT VERIFIED / NOT COMPLETED:** the two actual Explore screenshot compositions,
selection/insertion of a readable Inspector/contribution capture, and optional
Compare the Flow capture. No Computer Use retry or alternate browser-control path
was attempted during the explicitly authorized non-browser continuation.

**NOT VERIFIED:** real-browser desktop/mobile readability, actual keyboard/focus
experience, responsive layout/overflow and the 30-second comprehension criterion.
Source layout and rendered-markup tests are not visual acceptance. No full visual
acceptance is claimed. Existing real-storm imagery is retained, not substituted
for application evidence. Later screenshot work must preserve actual values and
rendering, identify environment/C/sample context and compare desktop/mobile
readability before human acceptance.

## Governance consequences and integrity

README → PROJECT_STATUS → Decision → this review reconstructs the bounded task
without chat history. The Decision preserves the original human instructions,
including the non-browser continuation. Human acceptance remains pending. No
scientific authority, classification, frozen identity, release or research gate
changes. Existing unrelated workspace changes are outside this review.

The stale User Guide “Open Laboratory” terminology remains a separately recorded,
non-blocking correction owned by `src/app/userGuideContent.ts`; not implemented.
Publication is not authorized; the GitHub-anchor dependency is an acceptance/
publication-coordination item, not permission to publish. **NOT CLAIMED:** scientific
qualification, new scientific results, human visual acceptance or deployment.

## Final Home layout and repository-link refinement — 2026-11-03

Under the owner's bounded changes request, removed the 85ch paragraph cap from
comparison/advanced sections. Research/boundary text already uses available main
content width. Existing 1160px max-width, gutters, typography, spacing and mobile
breakpoints remain unchanged. Five Home repository links now open a new tab with
noopener noreferrer and a decorative, aria-hidden/non-focusable inline GitHub SVG.
Existing external photo/case links already use the required attributes. Descriptive
text, focus styles and internal navigation callbacks remain. README was not edited
in this refinement. No screenshot or illustration was introduced.

Verification: LandingPage **16/16 PASS**; typecheck **PASS**; build **PASS** with
existing chunk-size warning; frozen-identity verification **PASS** against the
accepted snapshot. Browser visual acceptance remains pending. The new regression
checks all five repository links for new-tab protection and decorative SVG semantics.
No scientific, data, terminology, Learn or unrelated component change. Human visual
review is still required; this review does not claim acceptance or publication.

## Research roadmap refinement — 2026-11-03

Implemented three connected presentation cards: Current/Kinematics, Planned
Research/Thermodynamics and Long-term Vision/Interactive Atmospheric Research.
The progression Investigate → Understand → Experiment is explicitly non-rigid.
Dataset interoperability can develop independently of thermodynamics; external
model-data analysis is distinguished from independently solving atmospheric
equations. Future numerical modeling requires separate design and validation.
No scientific/user-data feature is implemented or authorized by this copy.
Existing page width, palette, links/icons and attribution remain; cards stack
at 900px with vertical connectors. No new imagery or dependency.

Verification: LandingPage **16/16 PASS** after correcting the escaped title
assertion and avoiding a negative-claim substring false positive. Source review
confirms three cards, future/current distinctions, dataset/solver separation and
preserved navigation. Earlier build/typecheck results are historical; this bounded
copy/layout refinement ran focused tests only. Browser visual acceptance remains
pending. README and scientific authorities were not edited. The fuller roadmap
link retains the existing README research-direction destination; this Home text
states the owner's newly specified ambitions without creating scientific scope.

## Final copy refinement — 2026-11-03

Applied owner's final hero, capability, comparison, T1 support and roadmap copy.
Removed Home's extra A/B/C restriction and hypothetical-alignment paragraphs;
linked README retains those restrictions. Roadmap paragraphs distinguish prototype,
future coupling, compatible user datasets and independent modeling. Added the
selected United States severe-storm case introduction. Minimal paragraph spacing
keeps roadmap copy and qualification separate. No README, scientific terminology
source, computation, data, rendering or behavior changes.

LandingPage **16/16 PASS** after updating obsolete roadmap wording assertions.
Earlier broad verification remains historical; this copy pass ran focused tests.
Visual acceptance and screenshot dependencies remain pending. No release or
scientific transition is claimed. Cold-start route remains README → PROJECT_STATUS
→ mutable Decision → this review.

## Discoverable entry points — 2026-11-03

Navigation audit: App owns Home's Learn surface transition and enterExplore;
Learn owns departure guards. Home only delegates through those callbacks. No
shared-navigation or application state implementation change was necessary.
Each mode card is now one native type=button with labelled title/subtitle and a
separate accessible description, no nested controls and no new-tab target.
Descriptions are preserved; Explore subtitle is Independent laboratory
investigation. Native Enter/Space activation is retained without custom keyboard
handlers. Two compact CTA groups (Open Explore primary / Start with Learn
secondary) follow capabilities and precede the Footer. Existing visual palette,
44px minimum CTA height, focus outlines, hover colors, wrapping and narrow-screen
stacking apply. Card color transitions are enabled only for no-preference;
reduced-motion explicitly disables transitions/animation.

Verification: **35/35 tests PASS in 6 files** (LandingPage 17, navigation wiring 4,
AppShellNavigation 1, GlobalShell 3, Learn 6, lesson-step navigation 4). Mounted Home
checks validate labels/descriptions, one interactive surface/card, focusability,
all six callback activations and CTA placement. Existing Learn entry/disposal and
Explore lifecycle tests pass. The associated Learn test only updates the obsolete
inner-button selector/class expectation; lesson implementation is untouched.
Initial failures were test infrastructure/old-selector issues, corrected by a
filesystem CSS read compatible with happy-dom and card-based assertions.
Typecheck **PASS**; build **PASS** (existing >500 kB warning, JS 1466.07 kB/gzip
352.53 kB); frozen verification **PASS** at accepted snapshot
8d916037058a919560b6c2d01ae65823589e96bb. No scientific execution occurred.

Responsive/focus/reduced-motion rules were checked in source and focused tests;
actual rendered geometry, Tab/Enter/Space behavior in a real browser and visible
focus under browser/device conditions remain NOT VERIFIED. Native semantics and
DOM tests do not establish full keyboard/visual acceptance. Existing browser stop
was respected. Human visual acceptance and screenshot dependencies remain pending.
README and scientific sources were not changed in this refinement. No commit,
push, deployment or release authorization is inferred. Cold-start route remains
README → PROJECT_STATUS → bounded Decision → this review.

## Home readability / attribution reveal — 2026-11-03

Screenshot-guided source audit found the legacy app.css .landing__note max-width
46rem cap and Home note text at .75rem (12px at the default 16px root). Home-only
CSS overrides now use full available content width, 1rem body/card/roadmap text,
.9375rem notes/boundary/Footer text, .8125rem photo credit and .75rem eyebrows.
Existing max-width/gutters and responsive structure remain. Explore precedes Learn
in DOM and visual card order. No copy or scientific meaning changed.

GlobalFooter gains revealAttributionOnOpen, default false and supplied only by
Home. Native details onToggle scrolls the disclosure to block start without
animation only when opening; focus remains on summary. Learn full Footer and
Explore compact Footer behavior remain unchanged. The shared test verifies open
scroll, close no-scroll, focus retention and default opt-out. No global CSS edit.

Verification: **28/28 PASS** in LandingPage (17), GlobalShell (4),
AppShellNavigation (1), Learn (6); typecheck **PASS**, production build **PASS**
with existing chunk warning (JS 1466.26 kB/gzip 352.63 kB). Source sizes assume the
normal root size; browser zoom scales rem sizes. Actual browser typography,
responsive geometry and disclosure scroll experience remain NOT VERIFIED; user
visual acceptance remains pending. Existing screenshot stop was respected. No
commit/publication or scientific transition. Frozen identities **PASS** against accepted snapshot 8d916037058a919560b6c2d01ae65823589e96bb; scoped diff check **PASS**.

## Wider Home and roadmap stage colors — 2026-11-03

Home inner content now reaches 1360px instead of 1160px. Main container includes
24px side gutters within its 1408px outer maximum; dark hero uses the matching
1360px content alignment. Existing narrower breakpoints/gutters remain. Header,
Footer and other application modes are untouched. Roadmap uses restrained green
(Current), amber (Planned Research) and violet (Long-term Vision) backgrounds and
top borders. Existing dark text and written status labels remain: thermodynamics
is still planned/unimplemented, not a newly authorized development stage.

LandingPage **17/17 PASS**; scoped whitespace check **PASS**. CSS-only production
change; earlier build/typecheck records remain historical, not newly rerun.
Actual wide/narrow browser geometry and color appearance await human visual review.
No new imagery, behavior, feature, scientific qualification or release transition.

## Larger hero photograph — 2026-11-03

The screenshot-marked photograph now has half the hero grid width instead of
1/2.4, through equal columns. At maximum inner width with the existing 48px gap,
photo width increases from about 547px to 656px (20%). Original 3:2 aspect ratio,
attribution, gutters and narrow single-column layout remain. LandingPage
**17/17 PASS**; scoped diff check **PASS**. Actual browser appearance awaits human
visual review; no image asset, scientific output or behavior change.

## Full-width hero text — 2026-11-03

Removed 43ch lede and 49ch audience width caps so paragraphs use the existing
left hero column. Grid, text, font sizes, photo and responsive stacking remain.
No tests run, explicitly permitted by the owner for this CSS-only adjustment.
Actual visual appearance remains for human review; no acceptance is inferred.

## Conditional publication preflight — 2026-11-03

Owner accepts Home visual direction and conditionally authorizes scoped commit and
normal GitHub push. The Decision owns that human disposition; this review does
not turn it into acceptance of missing screenshots or agent browser checks.

Exact proposed allowlist: the 11 files in the Decision's publication section.
Audited source changes are Home presentation, opt-in Home Footer reveal and
relevant tests. Learn.test changes only its obsolete Home-card selector/assertion.
No science, datasets, algorithms, rendering engine or Learn/Explore implementation
changed. README Scientific evidence through its end is preserved verbatim apart
from line-ending representation. Existing unrelated docs/README, three P2 records,
two interaction docs, untracked E1/H4/H5 outputs and ignored artifacts are excluded.
Index was empty at preflight; no staging or commit was performed.

Fresh verification: **97/97 PASS in 9 files**: LandingPage 17, GlobalShell 4,
AppShellNavigation 1, appNavigation.wiring 4, Learn 6, LearnLessonStepNavigation 4,
LearnCompareFlow 22, createCompareFlowSession 11, CompareFlowPlacement 28.
Typecheck **PASS**, build **PASS** (264 modules; existing >500kB warning, JS
1466.26kB/gzip 352.63kB). No failures in this focused set; historical seven baseline
assertion failures/open T1 unsupported-path interpretation defect remain unchanged
and unresolved. No full-suite-green or new scientific qualification is claimed.
Frozen-identity verification **PASS**, using accepted snapshot 8d916037058a919560b6c2d01ae65823589e96bb. Local README check **PASS**, 29 local targets/anchors and all Home README anchors;
public GitHub anchors are verified against the candidate checkout, not claimed
published. Actual Explore screenshot remains NOT COMPLETED; actual browser/mobile
and Tab/Enter/Space/rendered responsive checks remain NOT VERIFIED. DOM callback,
focusability, labels, guard/lifecycle regressions and source responsive/reduced-motion
checks passed. Existing browser-control stop was respected.

### Remote divergence — STOP BEFORE COMMIT

Fresh `git fetch origin main` succeeded. Local main:
`22d002dfcf9ebff319b153bf0dddd20a13c76135`. Remote origin/main:
`122a32bb8248804110dccdf30e1a41faae704f74`. Left/right counts: **2 local-only,
3 remote-only**. Both tip trees are `5cf214128d32e8b7a26e7fb30621ad13a3b940b0`;
identical trees do not eliminate ancestry divergence or authorize reconciliation.

Local-only: c5a394d Learn checkpoint; 22d002d shell/landing.
Remote-only: a6b2592 README update; fa724eb Learn checkpoint; 122a32b shell/landing.
The Learn pair is patch-equivalent; no automatic rebase/merge/reset is authorized.
Per the owner's explicit stop rule, **no staging, commit or push**. Resulting remote
SHA is unchanged from the fetched value above; no publication-completion claim.
Railway: no push was performed by this task, no manual deployment triggered;
deployment state NOT VERIFIED. Human disposition of ancestry is required before
resuming publication. Research gates/classifications and unresolved defects remain.

## Isolated remote-based publication verification — 2026-11-03

The owner's subsequent Decision permits only a new commit on verified remote main,
not reconciliation of the existing local branch. Independently confirmed baseline
local 22d002dfcf9ebff319b153bf0dddd20a13c76135 and remote
122a32bb8248804110dccdf30e1a41faae704f74 both have tree
5cf214128d32e8b7a26e7fb30621ad13a3b940b0. Actual remote main was checked directly.
No net file difference between tips needs merging. A detached isolated worktree
was created at that remote SHA; original checkout was not reset/rebased/merged.

All eleven approved paths were transferred byte-for-byte initially. Eight
non-governance files (README and production/test files) remain byte-identical to
the human-reviewed source. Only Decision, review and PROJECT_STATUS gain the new
bounded authorization and verification consequences. Candidate changed/untracked
path set equals the exact 11-file allowlist. All six excluded tracked documents
match remote HEAD; untracked scientific outputs/ignored evidence were not copied.
Dependencies were copied locally, not linked back to writable original caches.

Isolated verification: **97/97 PASS in 9 focused files**; typecheck **PASS**;
production build **PASS**, identical asset names/sizes to preflight (main JS
1466.26kB/gzip 352.63kB), existing >500kB chunk warning. Frozen identities **PASS**
against designated accepted snapshot 8d916037058a919560b6c2d01ae65823589e96bb.
README local target/anchor and Home GitHub-anchor checks **PASS** (29 local README
targets); scoped diff whitespace **PASS**. No unexplained failure/scope expansion.
No full suite or scientific campaign ran. Historical baseline failures and T1
unsupported-path defect remain unresolved. Screenshot and unperformed browser/
mobile/real-keyboard checks remain explicit limitations, not newly completed.

Original preservation audit: HEAD, index bytes, complete porcelain status and all
23 modified/untracked file hashes unchanged. Original ignored evidence is not
transferred or operated upon. The candidate is conditionally ready for one scoped
commit and normal push only after verifying exact committed paths/tree and that
actual remote main remains the parent. Completion is identified by actual Git
commit/ref evidence in the external report, not a self-referential SHA in this
record. No push/deployment success is inferred from verification. No manual
Railway deployment, scientific qualification or release designation is authorized.
