# M4 V1 Closure Audit and Plan

**Status:** M4 CLOSURE AUDIT / PLAN SoT /
V1 FEATURE FREEZE ACTIVE /
NO IMPLEMENTATION AUTHORIZATION /
M5-AUTHOR SEMANTIC COMPLETE /
M5-INDEPENDENT NOT YET AVAILABLE /
`38` §11.3 PASS NOT CLAIMED /
BLOCKER-FIX SLICE NOT REQUIRED /
README NOT YET CREATED /
V1 NOT YET CLOSED
**Scope:** inspect live repository state after `38`–`46`;
define the finite M4 work that moves CURRENT HEAD to
**V1 CLOSED** as the completed validation prototype, not as
production software. Record the README contract, known-
limitations contract, scientific-claim audit, docs-consistency
audit, release-engineering classification, a11y scope, final
regression contract, and slice plan. Not README authoring.
Not a version bump. Not a tag. Not a GitHub Release. Not
deployment. Not `src/**`. Not `ROADMAP.md`.
**Physics:** unchanged. T1 and Candidate A remain CLOSED.
Model class remains prescribed kinematic laboratory (`30`).
Exactly seven `V_total` operands. Prescribed Ω unchanged.
No continuity solver. Diagnostics observe; they never feed
velocity.
**Implementation:** none in this file. Production `src/**`
MUST remain unchanged. This audit does not authorize product-
surface fixes from E1–E7.

Predecessor M5-AUTHOR classification:

```text
docs/architecture/46-m5-author-semantic-evidence-classification.md
```

Binding V1 promise, freeze, and original PASS:

```text
docs/architecture/38-v1-scope-checkpoint.md
docs/architecture/43-post-42-1-v1-sufficiency-and-scope-cut.md
docs/architecture/45-m5-human-acceptance-playtest-protocol.md
```

Related still-binding SoTs (not replaced):

```text
docs/architecture/30-model-class-decision.md
docs/architecture/39-v1-visual-airflow-product-state-architecture.md
docs/architecture/40-v1-m1-m3-ux-ui-consolidation-architecture.md
docs/architecture/41-post-slice-b-explore-release-and-highlight-checkpoint.md
docs/architecture/42-post-41-3-explore-airflow-and-environment-architecture.md
docs/architecture/44-long-term-source-and-reconstruction-boundary.md
docs/CONCEPT.md
docs/ARCHITECTURE.md
docs/reviews/2026-08-27-m5-author-semantic-comprehension.md
```

Accepted live head this audit is written against:

```text
ce6b7975b3103c3d8ee4b6adc2f6be821506c1bc
```

Keep these roles distinct:

```text
CURRENT FACT
STILL-BINDING CONTRACT
NEW PROJECT DECISION
KNOWN V1 LIMITATION
STALE WORDING
MUST BEFORE CLOSURE
SHOULD IN M4
INTENTIONALLY SUPERSEDED
ANTI-CLAIM
```

This document did **not** change production code.
It does **not** create README.
It does **not** bump package version.
It does **not** tag a release.

---

## 1. Live repository state inspected

**CURRENT FACT** at `ce6b797`, branch `main`, tracking
`origin/main`, working tree clean at inspection time.

Inspected:

```text
root files          package.json, package-lock.json, index.html,
                    tsconfig.json, vite.config.ts, vitest.config.ts,
                    .gitignore
                    NO README.md, NO LICENSE, NO CONTRIBUTING,
                    NO public/, NO .github/
package.json        name supercell-explorer; version 0.0.1;
                    private: true; no description; no lint script
scripts             "dev": vite
                    "build": vite build
                    "preview": vite preview
                    "test": vitest run
                    "typecheck": tsc --noEmit
index.html          title "Supercell Explorer — Hodograph"
src/**              app, core, explore, guided, interaction,
                    physics, rendering, scenario, simulation,
                    ui, visualization
tests               src/**/*.test.ts and *.test.tsx via vitest
docs                CONCEPT.md, ARCHITECTURE.md,
                    architecture/ (38–46 live chain),
                    physics/ (00–23), ui/, rendering/,
                    research/, reviews/
scripts/            empty
tmp/                empty (local)
dist/               local build output; gitignored
```

Git remote: `https://github.com/murkatopiya/supercell.git`.
No GitHub Actions workflows in-repo.

Live product surface re-read against `src/app/App.tsx`,
Guided catalog, Inspector, Point diagnostics, Airflow copy,
Environment/hodograph, Follow / Reset / Reset View.

---

## 2. Release-surface inventory

### 2.1 A. First-encounter artifacts

A stranger cloning the repository currently finds:

```text
package.json / lockfile / Vite + TypeScript configs
index.html (browser tab: Hodograph)
src/** application
docs/** SoT corpus (no root README pointer)
.git history on main
```

They do **not** find: README, license, contributing guide,
changelog, versioned release notes, public assets, CI
workflow, or a “what this is / is not” sheet.

### 2.2 B. README

**CURRENT FACT: no `README.md` exists** in the live tree
(root or otherwise). This is a live glob, not only `38`
§3.8 evidence.

### 2.3 C. Commands that actually exist

```text
npm install
npm run dev          local Vite app
npm test             vitest run
npm run typecheck    tsc --noEmit
npm run build        vite build
npm run preview      preview the production build
```

There is **no** lint script. Do not invent one for closure.

### 2.4 D. Declared version

```text
package.json version    0.0.1
private                 true
npm package name        supercell-explorer
```

No other version metadata (no git tag inspected as a
closure tag; HEAD is an ordinary commit).

### 2.5 E. Stale / development labels

| Artifact | Finding |
| --- | --- |
| `package.json` `0.0.1` | Pre-release npm number on a **private** package. Misleading only if V1 CLOSED is equated with npm 1.0.0. It must not be. |
| `index.html` title `… — Hodograph` | **STALE** first-encounter label. The product is a storm-relative laboratory with a hodograph, not a hodograph app. Fix in M4-1 (not `src/**`). |
| UI “Dev workbench” copy | **CLOSED** by M2 / `39`. Not live. |
| `DEMO_SCENARIO` comment “Nasty visual-check demo” | Developer-only. Not user-facing. Leave. |
| `scripts/` empty directory | Harmless. Not a release claim. |

### 2.6 F. Over-claim vs 38/43/44/46

No live **product-surface** sentence claims a realistic
supercell, a forecast, an observed storm, a reconstruction,
or that T1 generates `ω_y,current`.

Guided first screen states the T10 honesty line. Point
diagnostics state non-causation. Airflow copy denies
density and parcel-history readings.

`docs/CONCEPT.md` remains long-term vision and can be
misread as the current product if there is no README
routing. That is a **release-documentation gap**, not a
live UI falsehood. See §5 and §6.

---

## 3. README decision + contract

**NEW PROJECT DECISION.**

```text
README.md at repository root is MANDATORY for V1 CLOSED.
It is the stranger-facing identity surface.
It is not a duplicate of the SoT corpus.
```

`38` U3 is **RESOLVED** here:

```text
what-this-is / is-not / known limits
  = root README (short) + docs/KNOWN_LIMITATIONS.md
  ≠ in-product known-limits panel (not earned; would be
    src/**; T10 already has Guided honesty)
```

### 3.1 What README MUST contain

Keep it short enough to read. Exact required blocks:

1. **Identity / one-paragraph promise** — use `38` §2.1
   short line plus the prescribed/idealized sentence.
2. **What V1 lets the user do** — Guided pathline exhibits;
   Explore release / follow / inspect; seven-operand
   decomposition; two point diagnostics.
3. **Guided vs Explore** — boot is Guided; release,
   Follow, Reset View, Airflow, and Point diagnostics are
   Explore-only.
4. **Scientific / model classification** — prescribed
   kinematic laboratory (`30` class A); CONCEPT §9
   conceptual/synthetic.
5. **Explicit prescribed / idealized nature** — nothing
   evolves, generates, or responds.
6. **Seven-component velocity decomposition** — named
   operands; laboratory ontology, not a universal storm
   decomposition. Link physics/`12` and `19`.
7. **Point diagnostics** — `T_tilt,y`, `ω_y,current`,
   tendency ≠ existing vorticity; T1 does not generate
   `ω_y,current`. Link physics/`22`, `23`.
8. **Hodograph / fixed environment** — one `DEMO_SCENARIO`
   profile; not selectable.
9. **Fixed storm motion** — prescribed `C = (10, 0)` m/s;
   value-only; not Bunkers; not an observed track (`44`
   §8.2). One sentence + link.
10. **What V1 does NOT model** — short bullet list; full
    list lives in known limitations.
11. **How to run locally** — `npm install` / `npm run dev`.
12. **Tests / typecheck / build** — the three live scripts.
13. **Docs map** — pointers only: CONCEPT (vision),
    ARCHITECTURE (consumer boundary), `38` (V1 promise),
    `30` (class), `44` (reconstruction), `45`/`46` (human
    validation), physics/, this file.
14. **Validation status** — exact Q12 sentence (§9).
15. **Known limitations** — short pointer to
    `docs/KNOWN_LIMITATIONS.md`, not the full catalog.
16. **Future direction** — one paragraph: CONCEPT is not
    a V1 backlog; next engineering track starts at data-
    driven environment (`44`), not reconstruction.
17. **Reconstruction boundary** — one sentence + link `44`.
18. **License / status** — **omit a license grant**. None
    exists in-repo. May say the package is private and
    unpublished. Do not invent SPDX.

Screenshot / demo placeholder: **NOT REQUIRED**. No
checked-in screenshot exists. Do not add a fake image.

### 3.2 What belongs where

| Content | README | KNOWN_LIMITATIONS | Deeper docs only |
| --- | --- | --- | --- |
| One-paragraph promise | MUST | no | `38` §2 full text |
| Guided vs Explore | MUST (two sentences) | Explore M1 gap, empty Inspector | `16`, `17`, `40`–`42` |
| Seven operands as ontology | MUST (one sentence) | full “not universal” | `12`, `19`, `30` |
| T9 / T10 honesty | MUST (two sentences) | Ω jargon, implicit sum | live copy; `22`, `23` |
| Fixed C provenance | MUST (one sentence) | value-only C | `07`, `44` §8.2 |
| Reconstruction | MUST (one sentence + link) | no live observed atmosphere | `44` |
| Full anti-claim list | short “is not” bullets | full scientific/data lists | `38` §2.2, CONCEPT §12 |
| M5 evidence detail | Q12 sentence + link | validation category | `45`, `46`, review |
| How to run / test / build | MUST | no | — |
| E1–E7 literacy gaps | no | yes, as limitations | `46` |
| UX chrome leftovers | no | yes, K1–K11 class | `43` |
| Physics equations | no | no | `docs/physics/**` |
| In-product known-limits panel | no | no | not earned |

---

## 4. Known-limitations decision + contract

**NEW PROJECT DECISION.**

```text
Create docs/KNOWN_LIMITATIONS.md in M4-1.
Do not dump POST-V1 wishlists into it.
A limitation must be materially true of V1 now.
```

### 4.1 SCIENTIFIC / MODEL (MUST disclose)

```text
prescribed kinematic laboratory; velocities are authored,
  not evolved
no prognostic / self-evolving storm
no feedback from vorticity into velocity
no continuity / mass-consistency solver
  (composite divergence residual is YELLOW in `10`;
   not sold as closed)
no thermodynamics, buoyancy, pressure, moisture, or
  microphysics
one fixed environmental wind profile (DEMO_SCENARIO)
storm motion C is a prescribed constant, not an estimator
  and not an observed track
the seven V1 operands are a prescribed laboratory ontology,
  not a universal physical decomposition
T_tilt,y does not generate ω_y,current
a later reconstructed / model / dataset field need not
  expose these seven operands (`19` parts?, `44`)
whole-storm visual legibility is not a V1 promise
Ω remains prescribed (0.005 rad/s in DEMO)
integrator is Euler; dt is external; RK2 is test-only
```

### 4.2 DATA (MUST disclose)

```text
no live observed atmosphere
no sounding provider
no RAOB / RAP / HRRR integration
no observed-storm reconstruction
no retrieval / dual-Doppler / DA system
no uncertainty / confidence channel on VelocityField
```

### 4.3 VALIDATION (MUST disclose)

```text
M5-AUTHOR semantic / scientific comprehension: COMPLETE
  (`46`, 2026-08-27 review)
M5-AUTHOR discoverability: NOT CLAIMED
independent 2/3 human criterion (`38` §11.3): NOT MET
M5-INDEPENDENT: NOT YET AVAILABLE
V1 CLOSED therefore carries the limited-human-validation
  qualifier (`45` §5)
```

### 4.4 UX / PRODUCT (disclose only if currently true)

Supported by live evidence / `43` / `46`:

```text
K1  Explore has no dedicated persistent “not a simulation”
    sentence before selection (Guided does)
K2  Observation empty state points at selection, not Release
K3  No mode purpose lines
K4  Environment affordance sits with Guided/Explore and is
    not a mode; Guided column vs Explore overlay differ
K5  Airflow / Highlight / Depth cue remain on the left rail
K6  Compact Highlight line omits “orientation = V_total”
    (full claim in title/details; default Off)
K7  Highlight magenta-on-navy can be hard at distance
K9  Research-prototype chrome, not production-quality UX
K10 One fixed environment; hodograph not editable; height
    not bound to tracer altitude
K11 Guided does not mount Explore-only tools (by contract)
E1  V_total = Σ V_i is implicit under “Why this motion?”
E2  Operand physical roles are not taught as a glossary
E4  Ω is jargon on the diagnostics surface
O1  Axes helper has no N/E/S/W labels; not a compass
A11Y canvas release and tracer selection are pointer-only
     (`38` §8.3 accepted)
desktop-first; existing breakpoints are not a mobile product
```

`43` K8 (no README until M4) is **this gap**; it is removed
once M4-1 lands, not listed as a permanent V1 limitation.

### 4.5 Do not list (wishlist, not a V1 limitation statement)

```text
editable hodograph / extra environments
new Guided experiments
compass implementation
cyan highlight / glow
Airflow-on-viewport (42-2)
40-E header band
in-product physics encyclopedia
dataset adapters
reconstruction
```

Those remain POST-V1 parking (`38` §13, `43` §15, `44`).

---

## 5. Scientific claim audit

Semantic claims, not string existence. Internal class names
(`Simulation`, `composeDemoTracerSimulation`) and the
Inspector label “Simulation time” are **software laboratory
clock** language. They are ALLOWED.

“Reset simulation” (`aria-label`) distinguishes laboratory
reset from camera Reset View. ALLOWED in that sense; README
must not let it be read as atmospheric CFD.

### 5.1 Live UI copy

| Claim | Class |
| --- | --- |
| Title “Supercell Explorer” | ALLOWED (product name). README must classify the V1. |
| Subtitle: ground-relative hodograph; storm-relative laboratory; prescribed storm motion | ALLOWED |
| Guided honesty: “prescribed storm-relative laboratory, not a real supercell simulation” | ALLOWED (anti-claim) |
| Guided Does not mean: not realistic parcel / mesocyclone capture / closed circulation / cold pool / density current | ALLOWED |
| Inspector `V_total` + seven labelled rows under “Why this motion?” | ALLOWED. Sum unstated = known limitation, not a false equation. |
| Point diagnostics: tendency ≠ existence; “T1 does not generate ω_y,current”; “prescribed through Ω” | ALLOWED. Ω undefined = friction (`46` E4), not a false claim. |
| Airflow: prescribed `V_total`; tails ≠ history; spacing ≠ density; depth cue ≠ fog | ALLOWED |
| “Storm motion C” overlay | ALLOWED as the prescribed vector. README must say it is prescribed, not Bunkers/observed. |
| index.html “— Hodograph” | STALE first-encounter label. M4-1 MUST retitle. |

No CONTRADICTS CURRENT SoT finding on the live product
surface.

### 5.2 README / package

No README. `package.json` has no description that over-
claims. Version `0.0.1` + `private: true` does not claim
scientific validity.

### 5.3 Docs entry points

| Location | Class |
| --- | --- |
| CONCEPT §1–8 long-term perception / mesocyclone / layers | ALLOWED as **vision**. NEEDS QUALIFICATION in README: not the shipped V1. `38` already: CONCEPT is not a V1 backlog. |
| CONCEPT §9 integrity categories (amended by `44`) | ALLOWED |
| CONCEPT §11–14 consumer vs reconstruction (amended by `44`) | ALLOWED |
| ARCHITECTURE §1–2, §12 consumer / DatasetVelocityField sketch (amended by `44`) | ALLOWED as architecture, not a V1 feature list |
| `38` §2 promise and anti-claims | ALLOWED / STILL-BINDING |
| Historical ADRs `21`, `24`, `31`, `33`, `35` | INTENTIONALLY SUPERSEDED as rankings. Do not rewrite. |

Dangerous words (`simulate`, `realistic`, `forecast`,
`reconstruction`) appear in **anti-claims** and in
long-term CONCEPT/ARCHITECTURE. That is correct. README
must quote the anti-claims, not the vision bullets.

### 5.4 Displayed physics vs SoT (38 Phase 5 half)

| Displayed quantity | Owning SoT | Live? | Discrepancy |
| --- | --- | --- | --- |
| Seven operands / `V_total` sum | physics/`12`, `19`, `30` | Inspector L2 | None |
| `T_tilt,y` | physics/`22` | Point diagnostics | None |
| `ω_y,current` (Candidate A) | physics/`23` | Point diagnostics | None |
| Hodograph / C / V_sr / ω_h overlays | physics/`04`,`07`,`10`; ui/`01`–`06` | Environment | None |
| Storm motion (10, 0) m/s | `DEMO_SCENARIO`, physics/`07` | overlay | None; provenance is prescribed |
| Ground `y ≥ 0` | architecture/`11` | domain clip | None |
| Continuity | architecture/`10` YELLOW | no solver | Honest absence |

No displayed-quantity vs SoT contradiction that would
block closure or require `src/**`.

---

## 6. Documentation consistency audit

After `38`–`46` the **current-authority story is coherent**:

```text
V1 = prescribed kinematic laboratory, one environment
CONCEPT = long-term vision, not a V1 backlog
ARCHITECTURE = consumer of V; reconstruction is not stage 2
30 = class A locked
44 = two tracks; Explorer does not own retrieval
45/46 = M5-AUTHOR semantic complete; §11.3 PASS not claimed
43 = leftover UX not required; prototype close
```

### 6.1 MUST be fixed before closure

None that are **unresolved contradictions of current V1
authority**. The remaining gap is the missing stranger-
facing README, which is M4-1 work, not a SoT fight.

Stale **path** sentences that would mis-order remaining
work are successor-pointer updates (this file + headers
in `38`, `43`, `44`, `45`, `46`). Those are bookkeeping,
not physics contradictions.

### 6.2 SHOULD be fixed in M4 (wording, not history rewrite)

```text
38  remaining-path sentences still say “M5 then M4”
    (historical order). Point to this file as current M4.
38  U3 resolved by this file (README + KNOWN_LIMITATIONS;
    no in-product panel).
43  header “M5 IS THE NEXT V1 STEP” is historically true
    of that checkpoint; successor pointer to this file.
44  “M5 remains the next V1 step” is stale as a live path.
45  “PLAYTEST IMPLEMENTATION NOT STARTED” conflicts with
    recorded M5-AUTHOR semantic session.
index.html title
```

### 6.3 Intentionally superseded — do NOT rewrite

```text
21 / 24 / 31 / 33 / 35   historical rankings
10                       five-operand continuity audit
                         (later seven-operand; status still
                         YELLOW / no solver)
02                       early assumptions audit
17                       Guided catalog (preserved, not
                         modernized into Explore teaching)
38 §3 inventory          CURRENT FACT at 2b2a39e; README
                         MISSING remains historically true
```

Use successor pointers. Do not recast old ADRs as if they
had always contained `44`/`46`.

---

## 7. Release engineering classification

**V1 CLOSED is a project milestone**, not an npm/public
production release. `private: true`. No in-repo deploy
config.

### 7.1 A. MUST for V1 CLOSED

```text
root README matching §3
docs/KNOWN_LIMITATIONS.md matching §4
docs pointers / successor status so a stranger can find
  V1 identity without reading 50 ADRs
index.html title no longer “Hodograph”
npm test green
npm run typecheck green
npm run build green
finite manual smoke (§8)
dated closure record stating Q12 + Q13
working tree clean on the closure commit
```

### 7.2 B. NICE-TO-HAVE / POST-CLOSURE

```text
package.json version bump
annotated git tag (if used, message MUST carry Q12)
package description field
screenshot
CONTRIBUTING
in-product known-limits panel
GitHub Release notes
CI workflow
```

### 7.3 C. NOT APPLICABLE

```text
npm publish
semver 1.0.0 as a scientific-validity claim
deployment / hosting requirement
lint verification (no lint script)
LICENSE text (none exists; do not invent)
GitHub Release as a required artifact
```

**Q5/Q6 lock:** milestone closure is **independent** of
npm `1.0.0`. Bumping to `1.0.0` without a public package
would look like a production release and is **not**
required. Leaving `0.0.1` + `private: true` is honest if
README says so. A tag `v1.0.0` is optional and, if
created, must not be narrated as independent-human PASS.

---

## 8. Accessibility audit result / scope

**NEW PROJECT DECISION.** Smallest honest V1 a11y audit
under current scope. Not WCAG 2.x certification.

### 8.1 Evidence

```text
ordinary chrome     native <button>, radios, number, select,
                    checkboxes — keyboard-operable
aria-label /
aria-pressed        present on mode, Release, Follow,
                    Reset, Reset View, Clear, Environment,
                    hodograph, Inspector, diagnostics;
                    covered by existing tests
disabled reasons    Follow (“Select a tracer to follow.”);
                    Confirm (“Click the ground…”)
Environment overlay Escape to close
no outline:none     in app.css; native focus outline remains
canvas release      pointer-only (38 §3.4 / §8.3)
canvas selection    pointer-only
OrbitControls       pointer-first camera
O1                  no compass / N-E-S-W on the gizmo
```

### 8.2 Classification

| Item | Class |
| --- | --- |
| Missing labels on ordinary buttons | not found — not a blocker |
| Follow / Confirm silent disable | closed in M3 — not a blocker |
| Canvas release / select keyboard/AT parity | **known limitation** / POST-V1 (`38` §4.3, §8.3) |
| No custom `:focus` styles | not a release blocker; native outline |
| No compass | known limitation O1; POST-V1; not a T-blocker (`45`, `46`) |
| Full WCAG / AT suite | POST-V1 |
| Severe regression on already-supported ordinary controls | **not found** |

No a11y **release blocker** under criterion 6.

Disclose in KNOWN_LIMITATIONS: pointer-only canvas
release and selection; no compass; desktop-first.

---

## 9. Final regression contract

Use **live** package scripts. This is regression / smoke,
**not** a second M5 and not discoverability validation.

### 9.1 Automated (MUST)

```text
npm test
npm run typecheck
npm run build
```

Do not add lint.

### 9.2 Manual smoke (MUST, finite)

One desktop pass on `npm run dev` (or `preview` after
build). Confirm **capability still exists**. Do not score
T1–T10 as independent humans.

```text
1. Boot → Guided first screen; honesty line visible
2. Switch Explore
3. Release tracer → ground pick → Confirm
4. Run (unpause if needed) / Pause / Speed
5. Select the intended parcel
6. Inspector: V_total + seven rows
7. Point diagnostics: T_tilt,y and ω_y,current + disclaimer
8. Follow → Reset View (camera, not laboratory)
9. Environment overlay: hodograph; optional C overlay
10. Reset (simulation) and/or Clear tracers
```

Fail the smoke only if a **required acceptance capability
is broken** (criterion 3), not if chrome is clumsy.

---

## 10. V1 CLOSED semantics

**STILL-BINDING** from `43` §16 and `45` §5, restated for
the actual M5-AUTHOR session type.

### 10.1 What `V1 CLOSED` means

```text
The finite validation prototype defined by 38/43/45/46
is complete as a named artifact:

  §2 promise is implemented on the live product
  M2 COMPLETE; M3 sufficiently complete for this prototype
  M1 honesty live on Guided; Explore persistence = K1
  M5-AUTHOR semantic session recorded; no blocker-fix slice
  M4 README + known limitations + audit + regression green
  known limitations written down
  no new capability added under freeze
```

### 10.2 What it does NOT mean

```text
production-ready software
independently validated educational product
38 §11.3 PASS
first-time-user discoverability proven
usability validated
realistic supercell simulation
forecast / nowcast system
reconstructed observed storm
polished long-term UX / CONCEPT vision
```

### 10.3 Can V1 be CLOSED while M5-INDEPENDENT is absent?

**Yes.** `43` and `45` already allow prototype close with
an explicit limitation. Keeping V1 open forever because
strangers are unavailable would invert the sufficiency cut.

The qualifier is **mandatory**.

### 10.4 Exact allowed human-validation sentence (Q12)

```text
V1 is closed as a finite validation prototype with limited
human validation. Recorded evidence is the 2026-08-27
M5-AUTHOR semantic/scientific-comprehension session.
Independent 2/3 target-user testing is not available.
38 §11.3 PASS is not claimed. Discoverability is not
independently validated.
```

### 10.5 Exact allowed scientific/model sentence (Q13)

```text
V1 is a prescribed kinematic laboratory: an idealized
storm-relative flow superposed on one fixed environmental
wind profile. Every velocity is prescribed. Diagnostics
observe the flow; they never feed it. V1 is not a
realistic supercell simulator, forecast model, numerical
solver, or reconstructed observed storm.
```

### 10.6 Forbidden overclaim wording

```text
V1 passed acceptance testing
passed human acceptance
2/3 testers succeeded
target users who had never seen the code passed T1–T10
usability validated
first-time-user discoverability proven
independently validated educational product
AI review confirms M5
production-ready
realistic supercell
forecast
observed / reconstructed storm (as a V1 capability)
```

---

## 11. Answers Q1–Q14

**Q1.** Yes. Current HEAD is technically capable of V1
CLOSED after docs/audit (and the tiny non-`src` title
fix). No capability hole remains that falsifies `38` §2.

**Q2.** No `src/**` change is currently required.

**Q3.** Yes. README is mandatory for closure (`38` M4;
stranger encounter; `43` K8).

**Q4.** Separate `docs/KNOWN_LIMITATIONS.md` plus a short
README pointer. Not README-only (too long). Not in-product
panel (not earned; `src/**`).

**Q5.** Milestone closure is independent of npm `1.0.0`.
Do not require a version bump. `0.0.1` + `private: true`
is acceptable if README says the number is not a maturity
claim.

**Q6.** A git tag `v1.0.0` is **not** required. Optional
after M4-2; if used, the message MUST include Q12.

**Q7.** GitHub Release is not required.

**Q8.** Deployment is not required.

**Q9.** `npm test`, `npm run typecheck`, `npm run build`.

**Q10.** Yes. Finite smoke in §9.2. Not a second M5.

**Q11.** Pointer-only canvas release and selection; no
keyboard/AT parity for those; no compass; desktop-first.
Ordinary labelled controls are not an a11y blocker.

**Q12.** See §10.4.

**Q13.** See §10.5.

**Q14.** Exact remaining work: M4-1 documentation/release
surface, then M4-2 verification + closure record. See §12.
No `src/**`. No E1–E7 product fixes. No M5-INDEPENDENT.

---

## 12. Exact finite M4 slice plan

Two slices. Not more.

### 12.1 M4-1 — documentation / release surface

```text
goal            stranger can identify V1, run it, and read
                what it is / is not / known limits without
                overclaiming validation or model class
files likely    README.md
                docs/KNOWN_LIMITATIONS.md
                index.html (title only)
                successor/status lines already started here;
                further pointer polish only if still stale
src/**          NO
entry           this audit merged; freeze ACTIVE; no
                blocker-fix slice
exit            README matches §3; known-limits file
                matches §4; tab title is not “Hodograph”;
                Q12 and Q13 appear on the release surface;
                no invented license
tests/checks    none required beyond not touching src
implementation  YES for the files above; NOT for src/**
  authorization
```

### 12.2 M4-2 — final verification / closure record

```text
goal            prove the documented commands; smoke the
                laboratory loop; record V1 CLOSED with
                the limited-human-validation qualifier
files likely    docs/reviews/ dated closure record
                and/or status lines on 38/43/this file
src/**          NO
entry           M4-1 complete
exit            npm test, typecheck, and build green;
                §9.2 smoke recorded; closure record quotes
                Q12 and Q13; working tree clean
tests/checks    npm test; npm run typecheck; npm run build;
                manual smoke
implementation  YES for the closure record only
  authorization
version/tag     NOT part of the exit unless separately
                commanded; still optional (§7)
```

Do not add M4-3 for tags, GitHub Releases, or deploy.

---

## 13. Blockers discovered

**NONE** under the §11 policy (prompt §11 / this file’s
closure policy).

No current behavior contradicts the V1 promise.
No material scientific falsehood on the live surface.
No required acceptance capability is missing.
Repository scripts exist and are the ones to verify in
M4-2 (not verified in this docs-only audit).
No severe a11y regression on ordinary controls.
No unresolved SoT contradiction of current V1 authority.

The missing README is a **scheduled M4 MUST**, not a
freeze-reopening product blocker.

---

## 14. Explicit non-blockers / rejected reopening

Do **not** reopen V1 for:

```text
cosmetic polish
optional teaching (operand glossary, hodograph lesson,
  explicit V_total = Σ sentence, Ω → “Rotation”)
Environment redesign / affordance restyle
compass / N-E-S-W labels
cyan highlight / glow / Highlight encoding
new providers / physics / visualization
new Guided experiments
40-C / 40-E / 40-F / 40-G / 41-4 / 42-2
in-product known-limits panel
independent testers who are currently unavailable
npm 1.0.0, GitHub Release, or deployment
```

E1–E7 remain classified as in `46`. Product-surface copy
fixes from that session are **not** earned.

---

## 15. Next action

```text
NOW     this audit / closure-plan SoT
NEXT    M4-1 (README + known limitations + index.html title)
THEN    M4-2 (test / typecheck / build / smoke / closure
        record)
NOT     src/** changes
NOT     M5-INDEPENDENT
NOT     README in this slice (this file plans it)
```

---

## 16. Closure / blocker policy (binding)

A newly discovered issue may block V1 closure only if it
is one of:

```text
1. current behavior contradicts the V1 promise
2. scientific claim is materially false or misleading
3. required acceptance capability is broken
4. release documentation would materially misrepresent
   validation or model scope
5. repository cannot be installed / run / built / tested
   according to its own documented commands
6. severe accessibility regression in an already-supported
   ordinary control
7. docs contain an unresolved contradiction about current
   V1 authority
```

Insufficient: usefulness, aesthetics, teaching ambition,
CONCEPT vision, leftover chrome, unavailable testers.

---

## 17. Existing SoT amendments

```text
38  Promise, freeze, T1–T10, §11.3 PASS: UNCHANGED.
    U3 RESOLVED: README + docs/KNOWN_LIMITATIONS.md;
    no in-product panel.
    Remaining close path: this file, then M4-1, then M4-2.
45  Protocol and forbidden wording: UNCHANGED.
    Successor for closure planning: this file.
46  Classifications UNCHANGED. M4 audit is this file;
    README still not authored here.
43  Sufficiency, K1–K11, prototype-close meaning:
    UNCHANGED. Live remaining close work is M4.
44  Reconstruction boundary UNCHANGED. V1 remaining path
    is no longer “M5 next.”
```

---

## 18. Anti-claims

```text
this file does not include production implementation
this file does not create README
this file does not bump version or tag
this file does not claim 38 §11.3 PASS
this file does not claim discoverability validation
this file does not reopen M3 or E1–E7 copy
V1 CLOSED is not production-ready
V1 CLOSED is not independently validated education
absence of independent humans is not a silent PASS
index.html “Hodograph” is not the product identity
package 0.0.1 is not a scientific status
CONCEPT vision is not the shipped V1
```

---

## 19. Compact lock-in

```text
HEAD                    capable of prototype close after
                        docs/html/verification
SRC CHANGE REQUIRED     NO
README                  MANDATORY; not authored yet
KNOWN LIMITS            separate docs/KNOWN_LIMITATIONS.md
VERSION 1.0.0           NOT REQUIRED
TAG / GH RELEASE / DEPLOY  NOT REQUIRED
FINAL COMMANDS          test, typecheck, build
MANUAL SMOKE            YES; finite; not M5
A11Y BLOCKER            NONE; canvas pointer-only = limit
Q12 / Q13               §10.4 / §10.5
SLICES                  M4-1 then M4-2
BLOCKERS                NONE
FREEZE                  ACTIVE
IMPLEMENTATION          NONE in this file
```

---

## 20. Implementation

```text
IMPLEMENTATION AUTHORIZATION   NO
Production files changed       NONE (src/** untouched)
Tests / typecheck / build      N/A (docs-only audit)
```
