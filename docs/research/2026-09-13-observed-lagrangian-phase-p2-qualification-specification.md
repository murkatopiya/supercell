# Observed Lagrangian C-Sensitivity — Phase P2 Qualification Specification

**FROZEN · HUMAN REVIEW APPROVED**  
**IMPLEMENTATION NOT AUTHORIZED · EXECUTION NOT AUTHORIZED**

**Phase P remains CLOSED · INVALID CONTROL — NUMERICAL CONVERGENCE.** P2 is a NEW qualification protocol. It does not retrospectively repair, reinterpret, or convert Phase P into PASS. Main L1 remains NOT AUTHORIZED / NOT TESTED. Production/UI remain UNCHANGED.

## 1. Authority, purpose and review boundary

Specification ID: `observed-lagrangian-phase-p2-qualification/v1`.

Drafting baseline: `main @ 13f1438c86a0a24be2ae4fd68ec65ce5354811ee`, 2026-09-13. Human P2 design review is CLOSED · APPROVED, including the narrow correction of the absolute-linear and shifted-jump synthetic references. Human specification review is CLOSED · APPROVED. This 2026-09-13 specification-only freeze establishes the authoritative Phase P2 numerical qualification source of truth. SHALL/MUST statements are frozen normative requirements; implementation and execution remain unauthorized.

Historical authority: [Phase P specification](2026-09-13-observed-lagrangian-phase-p-qualification-specification.md), frozen baseline `5c0d13a`; specification ID `observed-lagrangian-phase-p-qualification/v1`. Reviewed Phase P implementation: `285e6230667cb47b9bbdce920b94089309c7d823`; execution runtime HEAD: `07d2932a1933d47cc19b3829daad52b276c5d491`. These are historical provenance, not P2 implementation authority. The Phase P document and evidence remain immutable.

P2 qualifies support/lifecycle viability, numerical convergence, integration wiring, and reproducibility using a generic event-aware estimator. It does not test the main L1 scientific claim. No observed Phase P residual, response magnitude/sign, member ranking, or desired PASS outcome may select numerical semantics, knots, zeros, budgets, seeds, durations, timestep, or admission policy. The diagnosed mechanism motivates the redesign; observed residuals do not tune it.

Scope is B+C+D: event-aware segment splitting, crossing interpolation on accepted Euler paths, and explicit segment-consistent one-sided evaluation. Euler integration, current T1 definition, observed representations, Source advection, and prescribed storm fields remain unchanged. Material-response thresholds remain STILL OPEN. Passing P2 would not authorize L1 automatically.

## 2. Explicit inheritance register

Every Phase P section reference below links to the historical specification. Unchanged scientific rules are inherited at its frozen baseline, not from future edits. P2 replacements take precedence only for the listed estimator/evidence items. Exact E1 inputs remain inherited through Phase P §1 and §3, including the E1 literal specification; they SHALL NOT be regenerated, rounded, or sourced from UI/DEMO.

| Rule | Phase P source | P2 status |
|---|---|---|
| Qualification separate from main science; outcome blindness | [§2](2026-09-13-observed-lagrangian-phase-p-qualification-specification.md#2-scientific-purpose), [§15](2026-09-13-observed-lagrangian-phase-p-qualification-specification.md#15-material-response-thresholds) | INHERITED UNCHANGED |
| Four cases; exact five-member C matrix; 36-field storm snapshot; operand order | [§1](2026-09-13-observed-lagrangian-phase-p-qualification-specification.md#1-authority-provenance-and-scope), [§3](2026-09-13-observed-lagrangian-phase-p-qualification-specification.md#3-inherited-frozen-inputs) | INHERITED UNCHANGED |
| Source advection; Analysis-primary/Source-secondary; unavailable Analysis | [§4](2026-09-13-observed-lagrangian-phase-p-qualification-specification.md#4-representation-policy), [§19](2026-09-13-observed-lagrangian-phase-p-qualification-specification.md#19-preserved-qualification-details-and-review-boundary) | INHERITED UNCHANGED |
| Eight exact seeds; independent tracer; birth t0=0 | [§5](2026-09-13-observed-lagrangian-phase-p-qualification-specification.md#5-exact-seed-ensemble) | INHERITED UNCHANGED |
| Durations, Tmin, global duration | [§6](2026-09-13-observed-lagrangian-phase-p-qualification-specification.md#6-duration-freeze) | INHERITED UNCHANGED |
| Euler ladder, eligible primary dt, required pairs | [§7](2026-09-13-observed-lagrangian-phase-p-qualification-specification.md#7-dt-freeze) | INHERITED UNCHANGED |
| Initial/every accepted step recording, stride=1 | [§8](2026-09-13-observed-lagrangian-phase-p-qualification-specification.md#8-recording), [§19](2026-09-13-observed-lagrangian-phase-p-qualification-specification.md#19-preserved-qualification-details-and-review-boundary) | INHERITED UNCHANGED |
| Position and path-response definitions/budgets | [§9 A–D](2026-09-13-observed-lagrangian-phase-p-qualification-specification.md#9-numerical-budgets) | INHERITED UNCHANGED |
| Pointwise definition, segment matching, crossing exclusion and budget | [§9 F](2026-09-13-observed-lagrangian-phase-p-qualification-specification.md#9-numerical-budgets), [§19](2026-09-13-observed-lagrangian-phase-p-qualification-specification.md#19-preserved-qualification-details-and-review-boundary) | INHERITED UNCHANGED |
| History budget constants/units; exposure comparison scale/floor/constants | [§9 E,G](2026-09-13-observed-lagrangian-phase-p-qualification-specification.md#9-numerical-budgets) | INHERITED UNCHANGED; applied to P2 estimators |
| Lifecycle event brackets/types/co-events; prefix stability | [§9 H,I](2026-09-13-observed-lagrangian-phase-p-qualification-specification.md#9-numerical-budgets), [§19](2026-09-13-observed-lagrangian-phase-p-qualification-specification.md#19-preserved-qualification-details-and-review-boundary) | INHERITED UNCHANGED |
| Successive-refinement formula and finer-pair budget convention | [§9 J](2026-09-13-observed-lagrangian-phase-p-qualification-specification.md#9-numerical-budgets), reviewed implementation `compareSuccessiveRefinements` | INHERITED UNCHANGED; residual list explicit in §16 below |
| First-step oracle | [§10](2026-09-13-observed-lagrangian-phase-p-qualification-specification.md#10-first-step-oracle) | INHERITED UNCHANGED |
| Support/lifecycle, irreversible prefix | [§11](2026-09-13-observed-lagrangian-phase-p-qualification-specification.md#11-support--lifecycle-freeze), [§12](2026-09-13-observed-lagrangian-phase-p-qualification-specification.md#12-common-prefix) | INHERITED UNCHANGED |
| All-eight admission; all-four-resolution duration viability; candidate order | [§13](2026-09-13-observed-lagrangian-phase-p-qualification-specification.md#13-ensemble-admission-freeze), [§14](2026-09-13-observed-lagrangian-phase-p-qualification-specification.md#14-deterministic-t--dt-selection), [§19](2026-09-13-observed-lagrangian-phase-p-qualification-specification.md#19-preserved-qualification-details-and-review-boundary) | INHERITED UNCHANGED |
| Conceptual artifact separation, exact-byte hashes, raw data outside Git | [§16](2026-09-13-observed-lagrangian-phase-p-qualification-specification.md#16-evidence-contract) | INHERITED UNCHANGED; P2 audit stream added |
| Preflight blocking policy and no automatic repair | [§17](2026-09-13-observed-lagrangian-phase-p-qualification-specification.md#17-preflight) | INHERITED UNCHANGED; verify P2 authority/estimator identities instead of P identities |
| Run/support/seed/control classifications and human review | [§18](2026-09-13-observed-lagrangian-phase-p-qualification-specification.md#18-classification), [§19](2026-09-13-observed-lagrangian-phase-p-qualification-specification.md#19-preserved-qualification-details-and-review-boundary) | INHERITED UNCHANGED; explicit estimator failure reasons added |

| Former estimator rule | P2 status and replacement |
|---|---|
| §9 E coarse-timestamp trapezoid of absolute history difference and fine reference | REPLACED IN P2: union partition, own-path provider reevaluation, exact absolute-linear difference/reference (§11) |
| §9 G native step-endpoint exposure trapezoids | REPLACED IN P2: native accepted steps split at every boundary; signed-linear and absolute-linear integrals (§10) |
| §9 no interpolation for history | REPLACED IN P2: accepted-path linear continuation for history/quadrature only; stored-time geometry/pointwise checks unchanged |
| Crossings merely bracketed for diagnostic integration | REPLACED IN P2: interpolated internal nodes and temporal one-sided operands; historical brackets retained separately for pointwise/lifecycle checks |
| §16 protocol/schema identity and diagnostic evidence detail | REPLACED IN P2: separate P2 identities plus reconstructible event/subinterval evidence (§14); no overwriting P artifacts |

No dimensional or logical conflict was found in inheriting the existing ladder or scientific budgets. Their empirical sufficiency is unknown. A future discovered incompatibility SHALL be reported as SPECIFICATION_CONFLICT for human review, never repaired by tuning.

## 3. Three-layer architecture and hard-coding prohibition

Trajectory supplies accepted endpoints/times, linear continuation, and eligibility metadata; it does not choose diagnostic estimators. Provider owns scientific topology, support, ownership, segment-local T1 and provenance; it does not know qualification thresholds. Quadrature/history consumes those abstract inputs and returns integrals/status/audit records; it neither reintegrates the ODE nor chooses the admitted campaign. A separate protocol controller selects the eligible interval and applies budgets.

The estimator SHALL be CASE-AGNOSTIC, DATASET-AGNOSTIC and PROFILE-INSTANCE-AGNOSTIC. It SHALL NOT depend numerically on case name/ID, dataset name/ID, ESC versus IGRA, the current four soundings, embedded observed heights, fixed level count, fixed crossing count, present maximum crossings, vertical spacing, seed set, member count, or current dt ladder. All answers to that hard-coding audit SHALL be NO. Representation identity is opaque provenance, not a numeric dispatch key. Fixture names are allowed only in protocol inputs/provenance, not estimator branches.

Future input route: parser/validator → normalized profile → generic vertical segments → diagnostic provider → generic quadrature. Dataset preprocessing remains upstream. P2 deliberately covers 1-D vertical boundaries with finite segment-local endpoint limits; it does not introduce arbitrary surface event detection. Resource exhaustion must report incomplete work, not truncate knots to an architectural cap.

## 4. Accepted trajectory contract

For finite accepted endpoints Pn, Pnext at finite times tn, tnext, require h=tnext-tn>0. Define P(theta)=Pn+theta(Pnext-Pn), 0<=theta<=1. This is interpolation of the accepted Euler step, not reintegration, a higher-order reconstruction, or the exact continuous ODE trajectory. At theta=0/1 return stored endpoints directly. Interior coordinate evaluation uses subtract, multiply, add in that order under §12.

Interior shared step timestamps use the following step for ordinary lookup; the final timestamp uses the final step. For integral limits use explicit incoming/outgoing contexts instead of ordinary lookup. Distinct paths always retain their own steps and coordinates. No history operation collapses the paths onto one reference trajectory.

Crossing times are diagnostic evaluation times referenced to the existing simulation clock. They neither advance that clock nor add simulation steps, and SHALL NOT be rounded to trajectory ticks. Stored trajectory timestamps retain the inherited nested clock contract (16 ticks/s for the inherited ladder); the generic primitive itself accepts arbitrary finite strictly increasing times.

## 5. Generic provider and ownership

Provider SHALL supply immutable version/fingerprint, finite strictly increasing vertical topology, stable segment/boundary IDs, domain/support state, complete boundary enumeration for a requested height interval, ordinary evaluation, and segment-explicit T1 evaluation on a segment's closure. One-sided evaluation uses explicit segment context. Unsupported/N_A responses are typed and nonnumeric. Duplicate, nonfinite or nonordered topology is MALFORMED_PROFILE; no silent sorting/deduplication. One segment with no interior knots is valid; a malformed normalized profile with insufficient levels is not that fixture.

Interior ordinary ownership is [yi,yi+1); the final segment includes the top boundary. An interior knot belongs to the upper-height segment. Integration instead selects the segment containing the open temporal subinterval. At upward crossings temporal minus uses the lower segment, plus the upper; downward crossings reverse those height roles. Calling ordinary evaluation twice at a knot is forbidden as a substitute for these limits.

Current T1 remains segment omega_h dotted with the prescribed horizontal gradient of vertical velocity. Provider does not claim T1 is affine along a step. Provider arithmetic/version is fingerprinted; unsupported numeric operands must not be fabricated, clamped, extrapolated or replaced by zero.

## 6. Complete boundary enumeration and interpolation

For yn != ynext enumerate every provider boundary strictly between endpoint heights, including domain/support boundaries when relevant. Order by path direction: height ascending for upward motion, descending for downward. For each internal yk compute:

```text
lambda = (yk - yn) / (ynext - yn)
tk = tn + lambda * h
Pk.x = Pn.x + lambda * (Pnext.x - Pn.x)
Pk.y = yk
Pk.z = Pn.z + lambda * (Pnext.z - Pn.z)
```

Require 0<lambda<1 and tn<tk<tnext. Pinning Pk.y to the declared boundary is the arithmetic convention for the geometric crossing. There is no maximum crossing count. Endpoint knots are metadata attached to existing endpoint nodes, identified by equality before division; they add no zero-duration interval.

Use strict represented-coordinate comparisons, with no implicit epsilon snapping. Normalize signed zero for identity/serialization. Topological order is determined before interpolation. Distinct boundaries must retain strictly increasing lambda and time. Internal nodes rounding to endpoints, nonfinite differences/coordinates/times, or distinct nodes collapsing to indistinguishable partition coordinates produce NUMERICAL_AMBIGUITY; never silently merge/discard them.

Across histories, equal represented times share one partition node with all event identities retained. This does not license collapsing distinct ordered boundaries of a single path. No epsilon merges near-coincident events on different paths; strictly ordered representable times remain separate.

## 7. Degenerate geometry and partition

| Condition | Required behavior |
|---|---|
| Equal heights away from knot | VALID_DEGENERATE; one segment, no division/crossing |
| Entire step on knot | VALID_DEGENERATE dwell; ordinary owned segment for the whole positive-duration interval; horizontal/time dependence still evaluated |
| Start/end on knot | Outgoing/incoming segment respectively for integration; metadata at existing vertex |
| Touch-and-return across two steps | One vertex contact; determine incoming/outgoing segments separately; no invented stay on opposite side |
| Near-touch without equality | Strict represented geometry; no snap |
| Nonpositive/nonfinite time interval or nonfinite path input | Invalid trajectory input; incomplete estimator, not VALID_DEGENERATE |
| Duplicate/nonordered/nonfinite knots | MALFORMED_PROFILE |
| Unresolvable positive interval in arithmetic | NUMERICAL_AMBIGUITY |

A single linear step cannot touch and return internally unless it dwells. Ground-clipped terminal steps retain their inherited exclusion; no new primary integral along a clipped terminal step is introduced.

Collect endpoints and all internal nodes, then construct consecutive positive-duration intervals. Assign segment context from topology/open interior, not an epsilon-displaced query. Evaluate both endpoints with that segment. Require exact combinatorial coverage, shared adjacent endpoints, no gaps/overlap/lost interval/zero-duration double counting. Check summed duration against h using §12's arithmetic bound. A partition is invalid if any of these requirements fails.

## 8. Support and common eligible interval

INHERITED UNCHANGED from Phase P §§4,11,12,19: Source support at start; no step from unsupported Source; Source exit ends collection and excludes the exit step from primary prefix; no re-entry recovery. ESC primary requires FULL_SUPPORT and no crossing through an ineligible Analysis interval, not merely supported endpoints. First Analysis loss permanently closes primary prefix; Source-valid continuation may be secondary only. Ground clipping remains production behavior; terminal point is lifecycle evidence, not a primary diagnostic endpoint.

FULL_SUPPORT permits primary numeric integration. BOUNDARY_CONDITIONED retains secondary/descriptive status. COLUMN_UNAVAILABLE is N_A, never zero; OUT_OF_DOMAIN is unsupported, never extrapolated. A supported adjacent limit can exist while the other side is unavailable, but quadrature cannot restore any time rejected by controller eligibility.

The conservative closed-step/owned-endpoint eligibility convention is retained, including at isolated knot contacts. Event-aware timing SHALL NOT recover the supported fraction of a rejected step. The controller uses the irreversible eligible prefix at stored sample times. It takes the minimum across the five members and required comparison resolutions, clips to requested T, and aligns downward to the candidate coarse h, as in the reviewed Phase P common-prefix implementation. Both successive pairs use one physical interval common to all five members and all three involved resolutions. Full-duration admission still requires T at all four registered resolutions.

The primitive receives the resulting interval and typed applicability; it has no campaign-specific prefix logic. Empty/nonpositive comparison duration is ineligible, not a successful zero history. If these semantics cannot be reproduced, STOP with SPECIFICATION_CONFLICT; do not substitute a more permissive support policy.

## 9. Local numerical interpolant

For each complete supported segment-consistent [a,b], let u,v be its explicit segment endpoint T1 values (s^-2). Define L(t)=u+((t-a)/(b-a))(v-u). This is the local quadrature approximation, not an assertion that underlying physical T1 is exactly linear. Segment boundary jumps remain jumps: no interpolation across them.

## 10. Native-path signed and absolute exposures

For each resolution independently, partition its accepted steps at its own boundaries over the same controller-selected interval. Do not add the other trajectory's nodes to native exposure estimation.

```text
d = b-a
Qsigned = d*(u+v)/2

If u,v have the same sign or either is zero:
  Qabs = d*(abs(u)+abs(v))/2
Otherwise:
  mu = abs(u)/(abs(u)+abs(v))
  Qabs = d/2 * (abs(u)^2+abs(v)^2)/(abs(u)+abs(v))

Esigned = ordered compensated sum(Qsigned)
Eabs    = ordered compensated sum(Qabs)
Units: s^-1
```

These are mathematical expressions; §12 defines their scaled floating-point evaluation without unscaled squares. Opposite-sign Qabs is the exact two-triangle integral of abs(L). For v=-u!=0 over duration h, Qsigned=0 and Qabs=h*abs(u)/2. It is not Qabs=h independent of u.

The zero mu is the zero of L, not a guaranteed root of nonlinear T1. Same-sign endpoints may conceal underlying zeros; P2 does not claim to detect them. No adaptive root search or extra interpolant rebuilding is introduced. Convergence remains an empirical qualification requirement.

## 11. History and reference on the common partition

History is a distinct estimator of R1=(1/T) integral abs(Tc-Tf) dt, not a difference of exposures. For I=[0,T], union endpoints, both paths' step boundaries, and both paths' diagnostic crossings. On each resulting [a,b], locate each path's own step and segment, reevaluate its provider at its own path endpoints using temporal one-sided contexts, and build local Lc,Lf. Do not interpolate previously computed native scalar exposure traces.

With uc,vc and uf,vf, integrate abs(D), D=Lc-Lf, using the absolute-linear rule with endpoints uc-uf and vc-vf. If D changes sign, split analytically. Compute fine reference with the same absolute-linear rule on uf,vf. Sum chronologically and divide once by T:

```text
R1   = sum integral(abs(Lc-Lf)) / T
Aref = sum integral(abs(Lf)) / T
Units: s^-2
```

Zeros of D or Lf are local analytic subdivisions only. They do not trigger provider reevaluation or interpolation rebuilding. Common partition provider reevaluation is mandatory even where a node originated solely from the other path.

Aref is a comparison-estimator reference. T*Aref need not equal independently estimated native-grid fine Eabs: their quadrature partitions differ for nonlinear T1. This is a declared difference of numerical estimators serving different roles, not a change of physical field or a dimensional inconsistency. History and reference retain all eligible crossing neighborhoods.

Synthetic reference: two identical jumps A→B at times differing by delta_tau, with the full mismatch interval inside I, satisfy integral abs(Tc-Tf) dt = abs(B-A)*abs(delta_tau); R1=abs(B-A)*abs(delta_tau)/T. Both formulas are normative. Identical mathematical paths/providers under identical evaluation inputs give zero history; different floating-point encodings of identical geometry are assessed under the synthetic arithmetic allowance, without clamping scientific residuals to zero.

## 12. Arithmetic and arithmetic-only allowances

Use IEEE-754 binary64 round-to-nearest, ties-to-even, gradual underflow, with no reassociation, fused multiply-add contraction, extended-precision intermediates or unordered parallel reductions. Every operation below rounds separately. Record runtime/engine and provider evaluator version. Reproducibility is under this runtime/arithmetic contract, not a promise across arbitrary math-library implementations. Endpoint/provider operands, all intermediate differences, lambdas, coordinates, times, durations, contributions, corrections, totals and normalized values must be finite. Geometry/order collapse is NUMERICAL_AMBIGUITY; arithmetic overflow/nonfinite evaluator output is a typed numerical failure, not N_A.

For a local integral first set d=b-a and m=max(abs(u),abs(v)). If m=0 return two canonical zeros. Otherwise set p=u/m, q=v/m. Evaluate signed coefficient cs=(p+q)/2. For absolute coefficient, same-sign/zero endpoints use ca=(abs(p)+abs(q))/2; opposite signs use ca=((p*p+q*q)/(abs(p)+abs(q)))/2. Return product d*m*cs or d*m*ca using the following scaled product convention; do not form unscaled u^2 or v^2. Opposite-sign mu uses abs(p)/(abs(p)+abs(q)); it is diagnostic metadata, not an additional geometry partition node. Sign detection uses comparisons, never u*v.

Scaled product convention: decompose each nonzero finite factor into signed binary mantissa in [1,2) by magnitude and an integer base-2 exponent (including subnormal inputs). Multiply the three signed mantissas left-to-right, rounding after each multiplication; add their integer exponents exactly; apply the combined power of two and round once to binary64 with gradual underflow. Zero coefficient returns canonical zero. Final overflow is failure. This avoids unnecessary intermediate overflow/underflow. History endpoint differences use separately rounded subtraction and must be finite. Underflow of a contribution follows binary64 and is covered only by arithmetic allowance, never by dropping a topological interval.

All temporal contribution streams, absolute magnitudes used for bounds, and duration streams use exactly Neumaier summation initialized s=0,c=0. For each x in chronological order:

```text
t = s + x
if abs(s) >= abs(x):
  r = (s - t) + x
else:
  r = (x - t) + s
c = c + r
s = t
result = s + c
```

Parenthesized operations occur first; each assignment/add/subtract rounds separately. No final clipping of a negative total or history residual is permitted. Normalize exact signed zero only. No synthetic arithmetic allowance is added to a scientific acceptance budget.

The following arithmetic checks are normative engineering allowances, not error estimates for physical T1, path integration, or arbitrary provider evaluation. Let e=2^-52, eta=2^-1074 and gamma(k)=k*e/(1-k*e), requiring k*e<1. If the bound is nonfinite/unrepresentable, report numerical failure instead of accepting an infinite allowance.

For m partition intervals [aj,bj], use k=8*m+16 and Sdur=sum(abs(aj)+abs(bj))+abs(h). Require abs(Neumaier(bj-aj)-h) <= gamma(k)*Sdur+k*eta. Exact adjacency/topology requirements are separate and cannot be waived by this bound. Shared large timestamps do not permit loss of a representable positive interval.

For supported exposure invariants, k=64*(m+1), Sexp=sum(dj*max(abs(uj),abs(vj))) evaluated with scaled products and fixed summation. Define Bexp=gamma(k)*Sexp+k*eta. Require Qabs>=-Bexp and abs(Qsigned)<=Qabs+Bexp; preserve raw values even if within allowance. This bound does not authorize scientific threshold changes.

For synthetic exact/affine analytic-reference integral checks, use the same k and scale constructed from the analytic fixture's segment endpoint magnitudes and durations; for history use the sum of coarse and fine magnitude scales. Normalize the bound by T for normalized checks, with an additional e*abs(reference) for final division. Analytic references SHALL use exact rational arithmetic on dyadic inputs before final correctly rounded conversion, independently of the tested quadrature. Synthetic fixtures SHALL declare exact coefficients/times and expected result before implementation review; no constants may be fitted to observed evidence. Exact identity-input zero-history and deterministic digest checks require exact equality. Alternate encodings/redundant boundaries use the arithmetic reference check. These allowances are for the stated synthetic algebra, not a general guarantee for nonlinear providers.

## 13. Deterministic identities and canonical serialization

Topology IDs are stable provider-local indices plus provider fingerprint. A path identity is an opaque trajectory fingerprint, not a numeric branch selector. Interior events are identified by path fingerprint, provider fingerprint, accepted-step index and boundary ID; endpoint events use trajectory-vertex index instead. A shared vertex contact is one event with incoming/outgoing contexts; later revisits are distinct. Union nodes retain both paths' events. At equal times order metadata by path role (coarse then fine for comparison), provider fingerprint, boundary index, event kind; never order by observed name. Native trace order is step, subinterval, endpoint side. Zeros are analytic contribution metadata, not extra provider events.

Canonical records use UTF-8 JSON without BOM or whitespace, object keys sorted lexicographically by UTF-16 code units, arrays in declared order, finite binary64 numbers serialized using ECMAScript JSON.stringify number formatting, exact -0 normalized to 0, typed unavailable values with numeric fields null. Reject undefined, sparse arrays and nonfinite numeric sentinels. Strings use JSON escaping; no Unicode normalization is introduced. Each canonical stream record is followed by one LF byte, including the final record. Stream digest is SHA-256 over those exact bytes. Individual saved artifacts also have SHA-256 over exact saved bytes; record which hash is artifact-byte versus reconstructed-stream digest. No self-hash cycle.

Each subinterval audit record contains interval/step identities, endpoint coordinates/times, explicit segment IDs, support/side contexts, endpoint T1 and underlying T1 operands where applicable, local analytic zero metadata, signed/absolute or history/reference contribution, and order index. Units and schema ID are explicit. Clock interpolation never changes stored trajectory identity.

## 14. Audit evidence and failure behavior

Minimum evidence per estimator/comparison: estimator and schema version; exact specification hash after future freeze; provider/profile/input fingerprints; trajectory fingerprints; selected common interval; support/eligibility outcome; crossing and subinterval counts; raw totals; arithmetic bounds/checks; status/reason; canonical reconstructed event/subinterval digest. Preserve input profiles, storm/provider inputs, accepted trajectories and evaluator/runtime identity sufficient to reproduce all evaluations. A digest alone is insufficient. Retain Phase P conceptual manifest/trajectory/diagnostic/summary/execution separation under distinct P2 paths and schemas.

Full traces are mandatory for every synthetic fixture and repeated-determinism fixture. For an estimator ambiguity/arithmetic/malformed-input failure, persist the complete trace generated for the failing accepted step or common comparison subinterval plus its original inputs, candidate boundaries, and the exact offending operation/status. A failure before partitioning includes the rejected inputs and validation reason. For an ordinary qualification check failure, retain full input/fingerprint/digest reproducibility and the failed comparison's totals; materialize its complete estimator trace as a mandatory failure artifact. Normal completed observed estimates may omit full persisted traces only when fully reconstructible from retained immutable inputs. No recomputation of trajectories is needed or allowed for reconstruction.

Expected malformed/ambiguity synthetic fixtures pass only on the specified nonnumeric outcome. During observed collection, preflight malformed inputs block preflight; runtime malformed/ambiguous/nonfinite results make qualification incomplete, with affected values null and partial sums explicitly partial, never complete zero estimates. SPECIFICATION_CONFLICT blocks progression for human review. Exhausted scientific budgets with complete valid evidence remain INVALID CONTROL. Oracle/configuration discrepancy remains UNEXPLAINED. Do not confuse a completed INVALID CONTROL result with incomplete arithmetic/evidence.

Evidence summary reports qualification residuals/reasons and selected T/h or null, not main scientific contrasts/rankings. Raw artifacts remain outside Git by default. Future artifact schemas and implementation SHA must be reviewed and pinned before execution; no current historical Phase P SHA can serve as the P2 reviewed implementation.

## 15. Synthetic qualification prerequisite

An independent synthetic suite MUST pass before any separately authorized observed P2 execution. Tests are qualification prerequisites, not executed by this drafting task. Profiles and diagnostic functions are artificial and independent of observed cases. Full traces and independent analytic references are mandatory.

| Fixture | Required expectation |
|---|---|
| 1. One segment / constant T1 | Analytic signed and absolute integral; zero interior knots |
| 2. One segment / affine T1 | Exact declared affine signed/absolute integral within §12 allowance |
| 3. One jump at arbitrary interior lambda | h*(lambda*A+(1-lambda)*B) for signed; corresponding weighted absolute areas |
| 4. Piecewise-affine with jump | Sum of analytic segment integrals; no averaging across jump |
| 5. Many irregular knots | Complete ordered coverage, arbitrary count |
| 6. Dense cluster substantially exceeding four crossings | Every representable interval retained; no fixed crossing bound |
| 7. Unresolvable cluster | NUMERICAL_AMBIGUITY; no merged successful integral |
| 8. Upward traversal | Correct temporal segment ordering |
| 9. Downward traversal | Reversed height ordering and correct temporal sides |
| 10. Start/end knot | No zero-duration/double-counted interval |
| 11. Knot dwell | Owned segment throughout, including time/horizontal variation |
| 12. Touch-and-return at shared vertex | No artificial visit to opposite segment |
| 13. Ordinary versus incoming limit | Upper ordinary ownership; correct incoming segment operand |
| 14. u=-v!=0 over h | Qsigned=0; Qabs=h*abs(u)/2: two triangles |
| 15. Identical paths/provider/evaluation inputs | R1=0 exactly |
| 16. Redundant trajectory step boundary | Own-path reevaluation; analytic identical-geometry history within arithmetic allowance |
| 17. Equal jumps A→B shifted by delta_tau | Integral=abs(B-A)*abs(delta_tau); R1=abs(B-A)*abs(delta_tau)/T when mismatch fully contained |
| 18. Affine history difference changes sign | Exact two-triangle absolute difference |
| 19. Unsupported adjacent side | No fabricated numeric zero; eligibility preserved |
| 20. Unavailable column | Typed N_A/COLUMN_UNAVAILABLE |
| 21. Duplicate knots | MALFORMED_PROFILE, no silent deduplication |
| 22. Repeated calculation/serialization | Identical values, event identities, ordering and exact-byte digest |

Also cover nonfinite/nonordered input, nonpositive duration, near-touch, multiple simultaneous metadata events, and overflow/status handling. Traversal reversal equality applies to stationary scalar fields, or to consistently time-reversed fields; it is not asserted for an unchanged arbitrary time-dependent field. Check nonnegative absolute totals, signed magnitude bounded by absolute total, complete duration coverage, and no unsupported-to-zero conversion under §12. These tests establish primitive semantics, not convergence of every nonlinear diagnostic provider.

## 16. Unchanged scientific numerical budgets and refinement

Stored common-time geometry and pointwise checks remain as in Phase P §9. All quantities below use seconds/meters and T1 in s^-2; exposures in s^-1. Fine results are numerical references, not exact solutions.

```text
max common-sample 3D position residual <= 10 m
max common-sample vertical residual <= 3 m
max member-minus-C0 vector-response residual <= 10 m
max member-minus-C0 vertical-response residual <= 3 m

P2 history R1 <= 1e-6 s^-2 + 0.01*Aref

Eligible stored-time pointwise:
abs(Tc-Tf) <= 5e-6 s^-2 + 0.02*abs(Tf)

For X=abs and signed separately:
Sx = max(abs(E_X,f), 1e-3 s^-1)
tauX = max(1e-5 s^-1, 0.01*Sx)
abs(E_X,c-E_X,f) <= tauX

Lifecycle bracket width <= its run timestep
Comparable bracket endpoint difference <= max(1 s,2*coarse_h)
Common-prefix endpoint difference <= max(1 s,2*coarse_h)
```

Pointwise applicability uses same diagnostic segment ID and excludes closed [a-2h,b+2h] around either run's same-representation crossing bracket, with h the pair's coarse timestep. Retain the historical accepted-step bracket convention (upward y0<yk<=y1; downward y1<yk<=y0), including only events with b<=comparison end, independently of new quadrature event identities. No eligible point samples means N_A/NO_SEGMENT_MATCHED_SAMPLES; history/exposure remain mandatory. Crossing time interpolation SHALL NOT narrow pointwise exclusions. Ordinary segment-change events are quadrature/exclusion metadata, not additional lifecycle-event qualification residuals.

First-step oracle is inherited exactly from Phase P §10: infinity-norm error of DeltaP1 versus h*(-DeltaC_E,0,+DeltaC_N) <= max(1e-9 m,128*epsilon*L), epsilon=2^-52 and L=max(1 m,norm_inf(P0),h*max_i norm_inf(V_i(P0,0))). Immediate clipping rejects viability, not an oracle PASS; discrepancy is UNEXPLAINED.

Two required adjacent refinement pairs must pass. Non-worsening for each applicable aggregate metric uses the same common triple-resolution interval:

```text
max(0,residual_finer-residual_coarser) <= 0.1*tolerance_finer
```

Included residuals: position, vertical position, member-minus-C0 vector/vertical response (nonbaseline members), Source history R1, Source absolute exposure difference, Source signed exposure difference, and the corresponding applicable Analysis metrics. Baseline self-response is not fabricated. Excluded from this aggregate rule: individual pointwise checks, N_A/interval applicability records, first-step oracle, lifecycle/prefix checks (which retain their own checks). The finer history tolerance uses its own P2 Aref; finer exposure tolerance uses its own fine signed/absolute scale. Do not substitute Eabs for signed scale. No removal/weakening based on Phase P failures and no claim of formal convergence order.

## 17. Observed campaign and controller

INHERITED UNCHANGED campaign fixtures: Goshen, Prospect Valley, Dumas, Moore; exact E1 C0/parallel_plus/parallel_minus/right_plus/right_minus values with C0=(10,0) m/s and alpha=1/2, inherited without recalculation. Full E1 storm snapshot and ordered operands environment → updraft → rotation → lower inflow → upper outflow → downdraft → near-ground outflow are retained. Current Source/Analysis profile processing and fingerprints remain authoritative upstream; named cases do not enter the generic algorithm.

Eight world seeds (east,height,south), meters:

```text
S1-L=(3200,2000,2400)    S2-L=(-2400,2000,3200)
S3-L=(-3200,2000,-2400)  S4-L=(2400,2000,-3200)
S1-H=(3200,3000,2400)    S2-H=(-2400,3000,3200)
S3-H=(-3200,3000,-2400)  S4-H=(2400,3000,-3200)
```

Independent one-tracer units start at t0=0 for each case/member/seed/resolution. Durations are 180,360,540 s; Tmin=180 s. Euler ladder is R0=0.5,R1=0.25,R2=0.125,R3=0.0625 s, three halvings only. Planned full-duration unit matrix remains 4*5*8*4=640; this is a controller fixture count, never an estimator bound.

Candidate order is (540,0.5),(540,0.25),(360,0.5),(360,0.25),(180,0.5),(180,0.25). Primary 0.5 requires pairs 0.5/0.25 and 0.25/0.125; primary 0.25 requires 0.25/0.125 and 0.125/0.0625. First globally qualified candidate wins. All eight seeds, four cases, five members and full duration at all four resolutions are mandatory. No partial ensemble, seed selection by response, automatic deeper ladder or altered duration is permitted. No candidate qualifying yields INVALID CONTROL with complete evidence, followed by design review.

Source advects every case. ESC Analysis-primary and supported Source-secondary are checked separately; Moore is Source-only with Analysis N_A/COLUMN_UNAVAILABLE, never Source fallback disguised as Analysis. All-eight admission, lifecycle event-type/co-event checks, full recording and preflight rules remain inherited. Lifecycle brackets remain brackets, not exact impact/exit times. Co-events retain all proximate causes; the reviewed Phase P grouping convention anchors a group at its earliest bracket rather than permitting transitive chaining.

Before observed execution require separate human authorization, frozen P2 spec hash, reviewed P2 implementation SHA and allowed runtime lineage, clean-tree/preflight and all synthetic prerequisites. Pin input hashes, exact manifest, runtime and output locations without automatic repair or output collision. P2 does not rerun E1/H1–H5 or inspect main L1 response. Adequacy of this unchanged ladder under the new estimator is an empirical future result, not a drafting assumption.

## 18. Implementation impact and specification-review checklist

Minimum scope is VALIDATION-LOCAL numerical infrastructure: accepted-path adapter, provider adapters/interface, boundary partition, signed/absolute/history quadrature, synthetic suite and trace generation. PROTOCOL changes are estimator semantics, arithmetic, identities, evidence and prerequisites. A GENERIC CORE API addition for segment-explicit evaluation is optional and requires separate justification/review; it is not authorized or required by this specification. No PRODUCTION PHYSICS, SCIENTIFIC REPRESENTATION or UI change is proposed.

SPECIFICATION_CONFLICT requiring a scientific rule change: NONE IDENTIFIED during drafting. Human specification review of the arithmetic declarations, normalized Aref semantics, failure-trace policy, and explicit inheritance details is CLOSED · APPROVED; these declarations are now frozen. Any later discovered support, dimensional, or reproducibility contradiction blocks progression and must be brought back to human review.

Specification review is **CLOSED · APPROVED** and the specification is **FROZEN**. Future gates require separate decisions: implementation design → implementation → implementation review → separately authorized execution → human qualification review. Main L1 remains a separate gate even after successful P2 qualification. No automatic transition to implementation-ready status.

```text
PHASE P — CLOSED · INVALID CONTROL
PHASE P2 SPECIFICATION — FROZEN · HUMAN REVIEW APPROVED
PHASE P2 IMPLEMENTATION — NOT AUTHORIZED
PHASE P2 EXECUTION — NOT AUTHORIZED
MAIN L1 — NOT AUTHORIZED / NOT TESTED
MATERIAL RESPONSE THRESHOLDS — STILL OPEN
PRODUCTION/UI — UNCHANGED
SPECIFICATION FREEZE COMPLETE · IMPLEMENTATION AND EXECUTION NOT AUTHORIZED
```
