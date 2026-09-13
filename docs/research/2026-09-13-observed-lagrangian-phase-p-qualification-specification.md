# Observed Lagrangian C-Sensitivity — Phase P Qualification Specification

**PHASE P QUALIFICATION SPECIFICATION**

**FROZEN · IMPLEMENTATION NOT AUTHORIZED · EXECUTION NOT AUTHORIZED**

## 1. Authority, provenance and scope

Human scientific review approved the Phase P specification and Numerical Budget Corrigendum. This 2026-09-13 docs-only freeze transcribes those approved requirements; it introduces no scientific decision, implementation design, code or execution.

Specification ID: `observed-lagrangian-phase-p-qualification/v1`.

Audited repository baseline: `main @ 2ff4735` (E1 scientific closure). The reviewed Phase P implementation SHA and authorized execution HEAD do not yet exist. Record the exact saved specification hash in future execution provenance; this document does not embed its own hash.

Inherited authorities:

- [Observed E1 protocol §13](2026-09-12-observed-c-matrix-protocol-design.md#13-e1-full-precision-frozen-arithmetic-specification): exact C-member arithmetic and observed input provenance.
- [E1 implementation contract §4.1](2026-09-12-observed-c-matrix-e1-implementation-design.md): frozen 36-parameter storm-only snapshot.
- [E1 literal specification](../../src/validation/observedCMatrixE1Spec.ts): `E1_SPEC` and `FROZEN_E1_STORM_ONLY`; exact values are inherited by reference, not rounded or regenerated here.
- [Observed E1 scientific closure §14](2026-09-12-observed-c-matrix-protocol-design.md#14-e1-execution-results-and-human-scientific-closure): CLOSED · PASS, preserved unchanged.

The Lagrangian architecture audit is CLOSED · APPROVED; V0 was approved in principle. Only Phase P qualification requirements are frozen here. Main L1 remains NOT FROZEN; material-response thresholds remain open. Freeze is not implementation or execution authorization.

The normative requirements below are transcribed from the human-approved freeze instruction. “Freeze” denotes this specification's frozen requirement, not permission to implement or run it. Numerical blocks use fenced plain text so absolute-value bars cannot split Markdown table cells.

## 2. SCIENTIFIC PURPOSE

Phase P НЕ проверяет основной Lagrangian scientific claim.

Phase P проверяет только:

- support/lifecycle viability;
- common eligible duration;
- numerical convergence;
- C routing / integration wiring;
- evidence completeness and reproducibility.

Phase P admission logic не имеет права выбирать inputs по:

- magnitude ΔT1;
- sign ΔT1;
- member ranking;
- desired exposure;
- visually interesting trajectory;
- scientific contrast.

Main scientific outcome остаётся blind для qualification decisions.


## 3. INHERITED FROZEN INPUTS

Frozen E1 inputs are inherited by the authoritative references in §1.

Cases:

- Goshen
- Prospect Valley
- Dumas
- Moore

C matrix:

- C0
- parallel_plus
- parallel_minus
- right_plus
- right_minus

C0=(10,0) m/s
alpha=1/2

Использовать точные frozen E1 member values без повторного округления.

Storm geometry:
наследовать полный frozen E1 36-parameter storm-only snapshot.

Operand order:

environment
→ updraft
→ rotation
→ lower inflow
→ upper outflow
→ downdraft
→ near-ground outflow

Это explicit research inheritance.
Не получать C/storm geometry из DEMO/UI.


## 4. REPRESENTATION POLICY

Freeze:

Advection:
Source для всех cases.

Primary T1:
Analysis для Goshen / Prospect Valley / Dumas.

Secondary T1:
support-gated Source для всех четырёх cases.

Moore:
primary trajectory qualification + Source-only T1.
Analysis:
N_A / COLUMN_UNAVAILABLE.

Никакого Source fallback вместо отсутствующего Analysis.


## 5. EXACT SEED ENSEMBLE

Freeze exact world coordinates:

(x,y,z) = (east,height,south), meters

```text
S1-L = ( 3200, 2000,  2400)
S2-L = (-2400, 2000,  3200)
S3-L = (-3200, 2000, -2400)
S4-L = ( 2400, 2000, -3200)

S1-H = ( 3200, 3000,  2400)
S2-H = (-2400, 3000,  3200)
S3-H = (-3200, 3000, -2400)
S4-H = ( 2400, 3000, -3200)
```

Все seeds:

- одинаковы для four cases;
- одинаковы для five C members;
- birth t0=0;
- independent one-tracer simulation per
  (case,member,seed,resolution).

Scientific identity не зависит от runtime tracerId.

Frozen rationale:
4 sectors × 2 heights;
r=4000 m относительно central updraft;
geometry-relative design;
не выбран по будущему C/T1 response.


## 6. DURATION FREEZE

Freeze:

Treq candidates:
[180, 360, 540] s

Tmin:
180 s

Selection order:
540 → 360 → 180 s

Один global Treq для всей admitted campaign.

Candidate duration проходит только при полном eligible interval [0,T],
а не просто при survival >= Tmin.


## 7. DT FREEZE

Freeze Euler ladder:

R0 = 0.5 s
R1 = 0.25 s
R2 = 0.125 s
R3 = 0.0625 s

Maximum refinement:
three halvings.

Eligible primary dt:
0.5 s или 0.25 s.

Для primary 0.5:
обязательны passing pairs
0.5/0.25
и
0.25/0.125.

Если 0.5 не проходит:

для primary 0.25 обязательны
0.25/0.125
и
0.125/0.0625.

Если ни один candidate не проходит:
INVALID CONTROL → new design review.

Никакого автоматического дальнейшего refinement.


## 8. RECORDING

Freeze:

- initial sample;
- every accepted Euler step;
- stride=1.

Не наследовать UI/DEMO recording policy.


## 9. NUMERICAL BUDGETS

Approved Numerical Budget Corrigendum, transcribed losslessly. All definitions and formula constants below are normative.

Here T>0; h and timestamps are in seconds, positions in meters, and Tc/Tf, R1 and Aref in s^-2. P_0,r denotes the C0 baseline trajectory for the same case/seed/resolution; r=c or f. Each exposure estimator uses its own resolution timestamps on the same common eligible interval, with sums over adjacent samples. The pointwise reference scale is the absolute fine T1 at that exact timestamp, without a floor or averaging. Its absolute and relative parts are added. Exposure checks instead use max, with separate fine scales for abs and signed; no member-response contrast defines these scales.

```text
Definitions:

h = coarse Euler timestep.
fine timestep = h/2.

I=[0,T] = common eligible interval.

Tc(tj), Tf(tj):
T1 одной representation на собственных coarse/fine trajectories
в common coarse-grid timestamp tj.

No trajectory interpolation.


Freeze:

A. Max 3D position residual

max_j ||Pc(tj)-Pf(tj)||_2 <= 10 m


B. Max vertical residual

max_j |yc(tj)-yf(tj)| <= 3 m


C. Member−baseline vector-response residual

ΔP_m,r(t)=P_m,r(t)-P_0,r(t)

max_j ||ΔP_m,c(tj)-ΔP_m,f(tj)||_2 <= 10 m


D. Vertical response residual

max_j |Δy_m,c(tj)-Δy_m,f(tj)| <= 3 m


E. T1 history

Define trapezoidal time average:

<g>_I =
(1/T) Σ_j [(t_{j+1}-t_j)/2]
[g(t_j)+g(t_{j+1})]

R1 = <|Tc-Tf|>_I

Aref = <|Tf|>_I

Require:

R1 <= 1e-6 s^-2 + 0.01 Aref


F. Segment-matched pointwise T1

For every applicable tj:

|Tc(tj)-Tf(tj)|
<=
5e-6 s^-2 + 0.02 |Tf(tj)|

Applicable only:

- same diagnostic segment ID;
- outside ±2h neighborhood around crossings
  of either run.

If no applicable samples:
N_A / NO_SEGMENT_MATCHED_SAMPLES.

History/exposure checks remain mandatory.


G. Exposure estimators

For r in {c,f}:

E_abs,r =
Σ_k [(t_{r,k+1}-t_{r,k})/2]
(|T_{r,k}| + |T_{r,k+1}|)

E_signed,r =
Σ_k [(t_{r,k+1}-t_{r,k})/2]
(T_{r,k} + T_{r,k+1})

Units:
s^-1.

For X in {abs,signed}:

S_X =
max(|E_X,f|, 1e-3 s^-1)

tau_X =
max(1e-5 s^-1, 0.01 S_X)

Require:

|E_X,c-E_X,f| <= tau_X

Explicitly preserve:

- Eabs and Esigned are separate checks;
- Esigned scale uses |E_signed,f|,
  not Eabs;
- absolute tolerance = 1e-5 s^-1;
- relative tolerance = 1%;
- nonzero reference floor = 1e-3 s^-1;
- max, not sum.


H. Event bracket

For each comparable bracket [a_r,b_r]:

b_r-a_r <= h

Event-time bracket endpoint difference:

max(
 |a_c-a_f|,
 |b_c-b_f|
)
<= max(1 s, 2h)


I. Common-prefix endpoint stability

|t_K*,c - t_K*,f|
<= max(1 s, 2h)


J. Refinement stability

Two successive refinement pairs must pass.

For aggregate residuals:

residual_finer
<=
residual_coarser + 0.1 × budget.

Do not interpret this as proof of formal Euler convergence order.
```

## 10. FIRST-STEP ORACLE

Freeze:

```text
For same initial seed/t0,
same h,
finite unchanged fields,
unclipped first Euler step:

ΔP1 =
h(-ΔC_E, 0, +ΔC_N)

Require componentwise / infinity norm:

||ΔP1 - h(-ΔC_E,0,+ΔC_N)||_∞
<=
max(1e-9 m, 128 ε L)

ε = 2^-52

L =
max(
 1 m,
 ||P0||_∞,
 h max_i ||V_i(P0,0)||_∞
)

maximum over five C members.

Expected:
East response sign = -ΔC_E
South response sign = +ΔC_N
vertical response = 0 within tolerance.

Oracle failure:
UNEXPLAINED and blocks qualification.

Immediate clipping:
viability rejection, not oracle PASS.
```

## 11. SUPPORT / LIFECYCLE FREEZE

SOURCE

- initial point must be Source-supported;
- never step from unsupported Source point;
- first exit recorded;
- exit endpoint excluded from primary prefix;
- member collection stops;
- re-entry does not restore validity.

ANALYSIS

ESC primary:
FULL_SUPPORT only.

BOUNDARY_CONDITIONED:
secondary/descriptive numeric evidence only.

OUT_OF_DOMAIN:
no numeric T1.

Moore:
COLUMN_UNAVAILABLE / N_A.

First loss of ESC FULL_SUPPORT permanently closes primary prefix.

GROUND

Production clipping retained.

Terminal clipped point:
lifecycle evidence only;
post-step timestamp is not exact impact time;
not a normal primary endpoint.

Primary prefix ends before clipped step.


## 12. COMMON PREFIX

For each member/resolution define K_i(T)
as the largest index whose sample time is <=T and for which the entire prefix is eligible.

For ESC eligibility includes:

- Source support;
- no clipped step;
- Analysis FULL_SUPPORT;
- no crossing through an ineligible Analysis support interval
  inside an accepted straight step.

For Moore:
Source/lifecycle eligibility;
Analysis does not participate.

Across five C members:

K*(T)=min_i K_i(T).

Resolution comparisons use physical times,
not equality of numeric step indices.

Ordinary diagnostic segment crossings are allowed.


## 13. ENSEMBLE ADMISSION FREEZE

Pattern-complete policy:

ALL EIGHT seeds are mandatory.

A seed qualifies only if all:

- four cases;
- five C members;
- required resolutions

pass viability/integrity/refinement requirements.

If only a subset of seeds survives:
do NOT partially admit it.

Try shorter registered T according to frozen selection order.

If no complete 8-seed ensemble qualifies for any registered T/dt:
INVALID CONTROL → new design cycle.

Never reject seed because of:

- low/zero T1;
- identical T1 histories;
- undesired sign;
- small but resolved path separation;
- visually uninteresting result.


## 14. DETERMINISTIC T / DT SELECTION

Freeze order:

1. T=540 s.
2. Test primary h=0.5 using required two refinement pairs.
3. If not qualified, test primary h=0.25 using required two pairs.
4. If no h qualifies, move to T=360 s.
5. Repeat.
6. Then T=180 s.
7. First globally qualified (T,h) wins.
8. If none exists:
   INVALID CONTROL → new design review.

One global Treq and one global primary dt.


## 15. MATERIAL RESPONSE THRESHOLDS

Remain explicitly:

STILL OPEN.

They are NOT part of Phase P freeze.

After Phase P they may be proposed using only:

- numerical residual summaries;
- fixed physical/diagnostic scales;
- approved uncertainty rules.

They must NOT be derived from:

- observed ΔT1 magnitude;
- desired sign;
- member ranking;
- visually interesting outcome.

Main thresholds require separate human review before L1 execution.


## 16. EVIDENCE CONTRACT

Freeze conceptual artifact separation:

A. Candidate manifest
B. Trajectory qualification artifact
C. Diagnostic qualification artifact
D. Qualification summary
E. stdout/stderr/execution metadata

Deterministic ordering.

Typed unavailable states.
No fake zero.
No NaN as unavailable sentinel.

SHA-256 exact saved bytes.

Record:

- runtime HEAD;
- reviewed implementation SHA;
- Phase P protocol/spec ID/hash;
- manifest hash;
- input/provenance fingerprints.

Large raw outputs remain outside Git by default.


## 17. PREFLIGHT

Freeze blocking conditions:

- invalid runtime HEAD lineage;
- missing/unreviewed implementation SHA;
- tracked/index modifications under clean-tree policy;
- C matrix mismatch;
- storm snapshot mismatch;
- normalized fixture mismatch;
- retained-TIME mismatch;
- Analysis kernel/transform/provenance mismatch;
- seed mismatch;
- duration/dt ladder mismatch;
- criteria/tolerance mismatch;
- wrong integrator;
- wrong birth/recording/domain policy;
- DEMO/UI-derived C/seeds/dt/release state;
- invalid initial support;
- artifact output collision/unavailability.

No automatic repair.


## 18. CLASSIFICATION

Freeze separation:

Run:

- PREFLIGHT_BLOCKED
- QUALIFICATION_COMPLETE
- QUALIFICATION_INCOMPLETE

Seed:

- ADMITTED
- REJECTED
- UNASSESSED

Resolution:

- QUALIFIED
- NOT_QUALIFIED
- UNASSESSED

Support:

- FULL_DURATION
- TRUNCATED
- INITIAL_INVALID

Control/evidence:

- INVALID CONTROL
- UNEXPLAINED
- N_A
- completed check

QUALIFICATION_COMPLETE may legitimately conclude:
no admitted ensemble.

ADMITTED does NOT mean C-effect detected.

## 19. Preserved qualification details and review boundary

All four registered resolutions participate in Phase P. Duration admission requires the entire eight-seed ensemble to retain the full eligible interval through T at all four resolutions; numerical admission uses the two required pairs for the candidate primary dt. Initial sample plus every accepted step is recorded independently of UI policy.

T1 convergence checks apply separately to ESC Analysis-primary and Source-secondary, and to Moore Source. History/exposure checks include crossing regions; only the segment-matched pointwise check excludes the registered neighborhoods. Record excluded sample counts/fractions. The finest run is a numerical reference, not an exact solution. These engineering acceptance budgets are not rigorous Euler error bounds and do not establish formal convergence order.

Event types must agree. Causes within the registered event-time tolerance are retained as a co-event set and compared as such, without manually choosing a preferred cause. Source-valid continuation after Analysis support loss may provide secondary evidence but never restores the primary prefix. No hard horizontal termination is introduced by this specification.

Candidate artifact ordering is manifest case order → member order → seed ID → resolution → step. Preserve raw values even when excluded from admission logic. The summary reports qualification checks, reasons, residuals and selected T/dt (or null), without scientific-response ranking. Unavailable diagnostics retain typed states rather than numeric substitutes.

Initial static qualification, previously reviewed: all eight points lie inside all four Source domains; both heights have ESC FULL_SUPPORT at their native containing segments. Radius from the central updraft is exactly 4000 m. Gradient points toward that center and is nonzero at both heights. Upper outflow and near-ground outflow are initially zero by vertical envelope. The full composite does not share the central fields' rotational symmetry because of the offset downdraft and environmental wind. These are static facts, not trajectory viability or future T1-contrast evidence.

Malformed/incomplete evidence or unresolved errors produce QUALIFICATION_INCOMPLETE; preflight mismatches produce PREFLIGHT_BLOCKED. Insufficient support/duration or an exhausted numerical ladder yields INVALID CONTROL. Configuration drift or oracle discrepancy is UNEXPLAINED and blocks qualification. N_A records exact inapplicability. No C contrast is required for admission.

Current next action: human documentation review of this freeze. Implementation design requires a separate task; implementation and Phase P execution each remain unauthorized. Main L1 freeze, implementation and execution are separate future gates. No E1/H1–H5 rerun is authorized.

The stale current-stage bookmarks in `src/validation/README.md` describe earlier synthetic closure gates. They are superseded for navigation by this specification and [PROJECT_STATUS](../PROJECT_STATUS.md); that source-tree README is left unchanged under this task's explicit `src/**` prohibition. Historical scientific records remain valid and unchanged.

```text
PHASE P SPECIFICATION — FROZEN
MATERIAL RESPONSE THRESHOLDS — STILL OPEN
PHASE P IMPLEMENTATION — NOT AUTHORIZED
PHASE P EXECUTION — NOT AUTHORIZED
MAIN L1 — NOT FROZEN
PRODUCTION/UI — UNCHANGED
```