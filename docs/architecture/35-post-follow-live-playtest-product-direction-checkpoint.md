# Post-Follow Live-Playtest Product Direction Checkpoint

**Status:** DECISION CHECKPOINT / POST-FOLLOW LIVE PLAYTEST /
NO IMPLEMENTATION AUTHORIZATION
**Scope:** re-rank the next *product* direction now that Explore
selected-tracer Follow v1 is live and has received a first real
user playtest. Not a camera-polish mandate. Not a Follow
semantic reopen. Not an overlay/slice SoT. Not a Guided
catalog expansion. Not `ROADMAP.md`.
**Physics:** T1 and Candidate A remain CLOSED. Model class
remains prescribed kinematic laboratory (`30`). This file
does not reopen `22`, `23`, `26`, `28`, `30`, `31`, `32`,
or the Follow contract in `34`.
**Implementation:** none. Docs-only. Production `src/**`
MUST remain unchanged.

Predecessor selected-tracer Follow camera architecture:

```text
docs/architecture/34-selected-tracer-follow-camera-architecture.md
```

`34` locked Follow-as-framing. Slice 1 and Slice 2 are
COMPLETE. Explore selected-tracer Follow v1 is IMPLEMENTED.
Guided Follow control remains NOT IMPLEMENTED. Reset View
remains NOT IMPLEMENTED. This file answers what product
work is earned **after that capability exists and has been
playtested**. Completing Follow does **not** automatically
start Reset View, picking changes, selection halo,
remove-last, far-field bounds, overlay, Ω=0, Align with
motion, Guided mounts, or new physics.

Accepted Follow implementation commit this checkpoint
re-ranks against:

```text
cce395d137dbdbe89acf279062823654fc9589b4
```

Related product / perception / selection / domain
(not replaced):

```text
docs/CONCEPT.md
docs/ARCHITECTURE.md
docs/architecture/11-ground-atmospheric-domain-policy.md
docs/architecture/16-explore-guided-interaction-architecture.md
docs/architecture/18-explore-arbitrary-seeding.md
docs/architecture/19-shared-tracer-inspector.md
docs/architecture/21-whole-product-direction-checkpoint.md
docs/architecture/24-perceptual-exploration-checkpoint.md
docs/architecture/30-model-class-decision.md
docs/architecture/31-post-model-class-product-direction-checkpoint.md
docs/architecture/32-diagnostic-observation-ui-architecture.md
docs/architecture/33-post-point-diagnostics-product-direction-checkpoint.md
docs/rendering/11-deep-storm-tracer-view.md
docs/physics/22-diagnostic-tilting-tendency.md
docs/physics/23-diagnostic-vertical-vorticity.md
```

Keep these roles distinct:

```text
CURRENT FACT
PLAYTEST EVIDENCE
STILL-BINDING CONTRACT
OPEN QUESTION
RECOMMENDATION
NEW PROJECT DECISION
ANTI-CLAIM
```

This document did **not** change production code.
It does **not** create `ROADMAP.md`.
It does **not** start a selected branch.

---

## 1. Why this checkpoint exists

Explore now has the loop:

```text
release tracer
→ see pathline
→ select tracer
→ Inspector L1/L2
→ Point diagnostics T1 / Candidate A
→ Follow
→ optionally switch selection while following
```

`33` chose Follow-as-framing so the selected marker could
stay framed while diagnostics resample. That capability is
live. The first playtest is **new product evidence**, not a
license to reopen Follow’s meaning, and not a mandate to
finish every UX gap before physics/product progress.

The risk this file exists to prevent:

```text
not:  treat every playtest annoyance as a mandatory fix
not:  reopen Follow-as-framing because chase-camera ideas exist
not:  auto-recenter on Follow OFF / Clear against user preference
not:  promote overlay merely because Follow + numbers exist
not:  add an X/Z “storm box” because a far tracer stayed active
not:  redefine inactive to mean “far from storm”
not:  resume comet polish by inertia (`24`)
not:  reopen model class (`30`)
not:  mount Guided diagnostics / Guided Follow by default
not:  invent Align-with-motion as the next camera chapter
```

The question remains product, not formula:

```text
What is now the biggest obstacle between the user and
using / understanding the current laboratory?
```

---

## 2. Current product capability map

**Kind:** CURRENT FACT, verified against live `src/**` and
the accepted Follow commit above.

### 2.1 Explore

```text
hodograph + overlays (shared fixture)

arbitrary point release
  Enable placement → ground pick → white wireframe preview
  → Confirm / Cancel
  default altitude 1000 m
  release does not auto-select

runtime
  Pause / Resume
  Reset (cohort replay; selectedId kept if present)
  Clear (drop all tracers; clock unchanged)
  timeScale 1× / 5× / 10× / 20×

3D scientific tracers + pathlines
  glyph radius 150 m (DEEP_STORM_TRACER_VIEW.sphereRadiusM)
  occupancy colors cycle TRACER_COLORS
    [0xe74c3c, 0x3498db, 0x2ecc71] by slot index % 3
  selected glyph color override 0xffcc33
  trails share the occupancy color (not the yellow override)

visual airflow workbench (Explore)
  default encoding: points
  optional: advected / comets / Eulerian marks
  operand |V_i| tint capability
  Background highlight not constructed (REJECTED, `24`)
  DEMO population volume ≈
    x ∈ [-6000, 8000], y ∈ [0, 9000], z ∈ [-6000, 7000] m

selection
  glyph raycast → stable tracerId
  Inspector L1 / L2
  Point diagnostics panel (Explore-only sibling)
    T_tilt,y [s⁻²]
    ω_y,current [s⁻¹]
    field-at-marker anti-claim

Follow v1 (Explore-only control)
  App-owned followEnabled (default false)
  selected particle.position = moving OrbitControls.target
  camera preserves world-space offset
  orbit + zoom remain; pan disabled while Follow ON
  selection does not auto-enable Follow
  A→B retargets while Follow stays ON
  Reset / Clear / mode switch → Follow OFF
  Stop Following does not reset camera
  Reset View NOT IMPLEMENTED
```

### 2.2 Guided

```text
exactly three experiments (`17` / `20`)
same V_total
Inspector available
Point diagnostics NOT mounted
Follow control NOT mounted
```

### 2.3 Model class (unchanged)

```text
prescribed storm-relative kinematic laboratory (`30`)
seven VelocityField operands
V_total prescribed
Ω prescribed
T1 + Candidate A diagnose only
no prognostic ω
no ω → V
no stretching / T2
no continuity solver
dataset = long-term possibility, not current direction
```

### 2.4 Live camera / domain / picking facts

Verified in code, not inferred from older docs alone:

```text
rest pose
  DEEP_STORM_TRACER_VIEW
  camera (12000, 6000, 12000) m
  target (0, 4000, 0) m
  gridSizeM 10000
  sphereRadiusM 150
  farM 50000

Follow stop / Reset / Clear
  camera pose stays (`34`)
  mode / experiment switch remounts TracerScene → rest pose

AtmosphericTracerDomain (`11`, live)
  y ≥ 0 → active
  crossing y = 0 → clamp ground intersection + inactive
  no X/Z far-field boundary
  field sampling remains unbounded (G17)

picking
  Raycaster.intersectObjects on visible glyph meshes
  no screen-space threshold / invisible pick shell
  visual airflow occupants: raycast = () => {}
  preview marker: not a selection target

release preview
  white triangulated wireframe SphereGeometry
  radius = sphereRadiusM (150 m)
  RELEASE_PREVIEW_COLOR 0xffffff
  semantic role: pending seed, not selection halo
```

---

## 3. Accepted live playtest evidence

**Kind:** PLAYTEST EVIDENCE. Recorded, not “fixed” here.

### E1 — Follow itself is comfortable

Observed:

- moving orbit-center behavior feels logical and comfortable;
- no report of nausea / unusable camera motion;
- orbit / zoom interaction is acceptable;
- user intends further testing.

**Implication:**

```text
Do NOT reopen the core Follow semantic merely because
alternatives exist.
Continuous chase-camera is NOT automatically earned.
Align-with-motion is NOT required to validate Follow v1.
```

`34` Follow-as-framing remains CLOSED as the camera meaning.

### E2 — Camera recovery / orphaned orbit center

Before Follow, the scene is naturally centered on the main
storm / world-Y region (`DEEP_STORM_TRACER_VIEW.target`).

During Follow, the selected tracer is the orbit center.

After manual Follow OFF:

- the selected tracer may continue flying away;
- `controls.target` remains at the last followed location.

After Clear:

- tracers disappear;
- the orbit center can remain at the last followed location.

Observed UX:

If the tracer has flown far from the storm and Follow is
stopped, the user can become spatially disoriented:

- tracer in dark far field;
- storm on the horizon;
- orbit still revolves around the former tracer location.

User preference from playtest:

```text
Do NOT automatically recenter on Follow OFF or Clear.
Provide an explicit user-controlled return to the
canonical scene / storm view.
Candidate name family: Reset View / Center View.
```

### E3 — Picking target too small

Observed:

- user often cannot click a tracer on the first attempt;
- must zoom so the visible glyph becomes larger.

Important distinction:

```text
interaction hit-area problem
≠
necessarily a visible-glyph-size problem
```

Live hit target = the 150 m scientific glyph mesh itself.
No enlarged invisible pick volume. No screen-space tolerance.

### E4 — Selection color destroys tracer identity

Observed:

- tracers / pathlines appear in multiple colors;
- selecting a tracer turns its glyph yellow (`0xffcc33`);
- with Follow ON, A→B retargets and B becomes yellow.

UX problem:

If the user decides “I want the red tracer,” clicks it, and
the camera moves while the glyph turns yellow, visual
continuity is weakened — especially when several tracers
are close.

User-proposed direction:

```text
preserve the tracer’s own color on selection
show selection with a separate surrounding marker
  (e.g. wireframe sphere / halo)
```

### E5 — Remove last vs Clear all

Observed Explore workflow:

- user places several useful tracers;
- newest placement is unwanted;
- Clear removes **all** tracers.

User wanted to remove only the last placed / released tracer.

### E6 — Far-field tracers remain active

Live example:

```text
z ≈ -17.4 km
state = active
local storm operands ≈ 0
environmental advection nonzero
V_total ≈ environmental flow
```

This matches current AtmosphericTracerDomain (no X/Z exit).
It is **not** automatically a bug.

### E7 — Align with motion idea

User asked whether Follow should rotate the camera behind
the tracer in the direction of motion.

Discussion result:

- core Follow already feels comfortable and preserves
  orientation;
- automatic reorientation would shift framing toward
  chase-camera;
- a later one-shot “Align with motion” action remains a
  possible alternative.

Do **not** rank this high merely because it sounds attractive.

### Preview-sphere correction (binding observation hygiene)

Do **not** record a false observation:

```text
A screenshot with a white triangulated wireframe sphere
and a yellow tracer did NOT show a yellow tracer inside
the sphere.
The yellow tracer was a separate tracer behind it.
The placement preview itself is the standalone white
triangulated wireframe sphere.
```

Preview ≠ selection halo. Roles must stay distinct even if
a later selection marker borrows a related visual language.

---

## 4. Current Explore loop assessment

```text
release → pathline → select → Inspector → diagnostics
→ Follow → optional A→B while following
```

Where friction now meaningfully breaks the loop:

| Step | Status after playtest |
| --- | --- |
| Release | Works. Clear-all is coarse for multi-tracer Explore (E5), but does not block first investigation. |
| Pathline | Works. Far-field trails remain active (E6); can confuse context, not birth. |
| **Select** | **Friction.** Missed picks (E3) and yellow identity overwrite (E4) attack acquire / maintain identity. |
| Inspector / diagnostics | Work once selection succeeds. |
| Follow | **Comfortable (E1).** Core framing semantic validated. |
| A→B while Follow ON | Retarget works; yellow overwrite worsens identity loss (E4). |
| After Follow OFF / Clear | **Orphaned orbit center (E2).** Investigation recovery broken without explicit rest-pose control. |

Verdict:

```text
Follow is no longer the bottleneck.
The bottleneck has split into:
  (1) acquiring / maintaining selected-tracer identity
  (2) recovering canonical storm framing after Follow
Far-field semantics are a third, deeper model/product
question — not a quick UI patch.
```

Isolated UI polish that does not break this loop (Align with
motion, comet revisit, Guided mounts) stays lower.

---

## 5. Camera recovery assessment

Compare:

| Option | Meaning | Verdict |
| --- | --- | --- |
| **A. Full Reset View → `DEEP_STORM_TRACER_VIEW`** | Restore canonical camera + target | Strong candidate; one rest pose (`34` / rendering `11`) |
| B. Recenter orbit target to storm axis; preserve current camera offset / orientation | Target → `(0, 4000, 0)` (or storm axis); camera translates by same delta | Possible softer recovery; may leave an odd far camera |
| C. Automatic recenter on Follow OFF | Silent camera jump | **Rejected as default** — user preference; fights “Stop Following ≠ Reset Camera” (`34`) |
| D. Automatic recenter on Clear | Silent camera jump | **Rejected as default** — Clear is occupancy, not camera; user preference |
| E. No change | Keep orphaned target forever | Leaves known Follow leftover pain |

Why reject C/D even though they would “fix” E2 quickly:

```text
Stop Following is investigation cancel, not home.
Clear is laboratory occupancy cancel, not home.
Silent recentering steals spatial context the user may
still want (inspecting the far tracer without Follow).
Playtest preference is explicit user control.
```

Naming family (not final copy lock):

```text
Reset View     — suggests full rest-pose restore (A)
Center View    — could mean A or B
Recenter       — ambiguous; easy to confuse with Follow OFF
```

**Is Reset / Center View earned?**

```text
YES as a product need.
Architecture SoT should precede implementation.
It is NOT automatically the next direction solely because
Follow deferred it — see ranking (§13).
```

Clumsy existing workaround (CURRENT FACT): Explore ↔ Guided
or Guided experiment switch remounts `TracerScene` and
restores rest pose. That is not an Explore recovery control.

---

## 6. Picking assessment

Candidates (analysis only):

| Candidate | Hits E3? | Risk |
| --- | --- | --- |
| Larger invisible raycast / picking volume | Yes | Must not become a second visible glyph language |
| Screen-space picking tolerance | Yes | Needs a ray→screen policy; not present today |
| Larger visible glyph | Partial | Changes storm-scale readability; may not be needed |
| Other minimal existing-architecture-compatible fix | Possible | Must stay observe-only; no physics |

Classification:

```text
E3 is a genuine interaction defect / loop friction,
not optional aesthetic polish.
It meaningfully blocks selection → Inspector →
diagnostics → Follow.
It does not require changing Follow semantics.
```

**Is better picking earned?** YES as a product need.
Implementation details belong in a selection-identity SoT,
not this checkpoint.

---

## 7. Selection-color / halo assessment

### 7.1 What current tracer colors encode

**Kind:** CURRENT FACT.

```text
TRACER_COLORS = [red, blue, green] cycling by occupancy
slot index % 3
trail color = same occupancy color
selected glyph = yellow override 0xffcc33
```

These colors are **path / occupancy identity cosmetics**.
They are **not** a binding scientific encoding of V_i,
diagnostics, altitude, or active/inactive.

Therefore preserving color on selection does **not**
protect a physics colormap. It protects **human visual
continuity** of “the red one / the blue one.”

### 7.2 Semantic principle

```text
tracer / path identity encoding
≠
selection state encoding
```

Yellow override collapses both into one channel. That was
acceptable as a minimal first Inspector highlight (`19`).
With Follow A→B and multi-tracer Explore, the collapse is
now product-visible friction (E4).

### 7.3 Options

| Option | Identity preserved? | Selection clear? | Notes |
| --- | --- | --- | --- |
| Yellow color override (current) | No | Yes | Cheap; fights multi-tracer Follow |
| Selection halo / wireframe shell | Yes | Yes | Matches user direction; must not steal preview semantics |
| Outline / ring | Yes | Yes | Similar to halo family |
| Size / brightness only | Partial | Medium | Easy to miss among nearby tracers |
| Dim non-selected | Yes | Medium | Extra global visual policy |

Preview language note:

```text
Placement preview = white wireframe sphere = pending seed
Selection halo, if designed later, may share a *family*
of “non-filled surrounding marker” but must remain a
different semantic object (selected tracer ≠ pending seed).
Do not mount the release preview as the selection marker.
```

**Is selection halo earned?** YES as a product need, tightly
coupled to picking under one identity concept (§9).

---

## 8. Release-management assessment

Live Explore release ownership (`ExploreTracerSession`):

```text
ownedSeeds[]                 ordered release ICs
releasePoint                 append seed + particle + history lane
reset                        replay all owned seeds at t = 0
clear                        seeds [] + clearParticles + removeAllLanes
```

```text
Simulation.addParticle       monotonic nextTracerId
Simulation.clearParticles    occupancy 0; nextTracerId restarts at 1
no remove-at-index API
TracerPathHistory            full history until Reset/Clear;
                             no finite horizon
```

Compare:

| Action | Meaning questions | Architecture cost now |
| --- | --- | --- |
| Undo last release | What is “last” after time advances? Last *seed append*, not last motion. | Medium: pop last seed + matching particle/lane; selection/Follow if that id |
| Remove selected | Explicit identity-based delete | Higher: mid-list delete / compact; `18`/`19` warned indices shift |
| Clear all | Already exists | — |

Important answers:

```text
“Last” after simulation advances
  = last owned seed / append order, not “most recently moved”

Reset
  restores the current owned seed list as a simultaneous
  cohort at t = 0 (does not invent vanished seeds)

Manually released tracers
  = the only Explore scientific cohort today
  (empty session legal; no separate initial Guided-like set)

Monotonic tracerId
  clearParticles resets the counter; mid-list remove would
  need an explicit compact/remap policy (`18` §12, `19`)

Pathline / history
  should disappear with a removed tracer (lane removal)

If removed tracer is selected / followed
  clear selection; Follow OFF; camera stays (same family as
  missing-id / Clear policies in `34`)

New simulation mutation API?
  likely yes for anything beyond clear-all / append-only
```

**Is Remove-last earned?** Useful Explore convenience; **not**
the biggest bottleneck. Architecture cost is real because the
stack is still append-only + clear-all by design (`18`).
Do not assume Undo + Remove selected + Clear all are all
needed. Clear all remains required.

---

## 9. Selection / picking combined analysis (E3 + E4)

Do picking tolerance and selection halo share one coherent
architectural concept?

```text
YES:
  acquire selected-tracer identity
  + maintain that identity while Follow / A→B / diagnostics run
```

They are one *interaction* concept, not two random polish
tickets:

```text
hit-area        → can the user acquire the intended tracer?
identity mark   → can the user keep recognizing it afterward?
```

Bundling them is justified by shared meaning, **not** by
convenience packing. Reset View is a **different** concept
(camera recovery / rest pose) and must not be smuggled into
the same SoT as glyph picking.

Recommended conceptual slice title if chosen:

```text
Explore selected-tracer acquisition and identity indication
```

Out of that slice:

```text
Reset View
Align with motion
trail recolor
scientific colormap
preview-as-selection
```

---

## 10. Far-field / domain assessment

**Own section.** Distinctions that must not collapse:

| Layer | Live meaning |
| --- | --- |
| 1. VelocityField mathematical support | Sampling is total on finite positions (G17). Local storm operands decay; environmental profile remains. |
| 2. Environmental advection far field | Nonzero environmental flow can dominate V_total outside storm envelopes. |
| 3. Local storm operand envelopes | Compact / envelope-localized; ≈0 at z ≈ −17 km is expected. |
| 4. AtmosphericTracerDomain | `y ≥ 0` lifecycle only. Horizontal unbounded (`11`). |
| 5. Visual airflow workbench sampling extent | DEMO box roughly −6…8 km E, 0…9 km up, −6…7 km S — laboratory column, not env profile. |
| 6. Grid / scene visual extent | 10 km grid; camera far 50 km; framing, not physics domain. |
| 7. Pathline history / lifetime | Full until Reset/Clear; no maxAge for scientific tracers (visual occupants have maxAge 80 s). |
| 8. active / inactive semantics | Ground exit only. Far-field ≠ inactive. |

Answers:

```text
Is z ≈ −17 km active scientifically consistent with
CURRENT model?
  YES. Domain policy and unbounded horizontal advection
  allow it. Environmental flow can keep the parcel moving.

Is it product-useful?
  MIXED. Honest environmental transport demonstration —
  yes. Pedagogically useful storm observation — often no.
  Dark far-field + orphaned orbit (E2) makes it feel like
  a product bug even when it is not a physics bug.

Is the current problem primarily…
  physics/domain?     only if we want a new named region
  rendering context?  visual airflow ends; grid ends; path continues
  camera recovery?    yes, compounds E2
  pathline lifetime?  unbounded history keeps the long trail
  combination?        YES — context mismatch, not a single knob

Dangerous naive “fixes”
  X/Z box as AtmosphericTracerDomain without SoT
  inactive := far from storm
  silently killing environmental far-field truth
  expanding visual airflow to tens of km as “the storm”
  treating grid size as a physics wall
```

**Does far-field behavior require action now?**

```text
Not as a production UI/domain patch.
It may later need its own architecture / model-region
checkpoint distinguishing:
  atmospheric tracer lifecycle domain
  ≠ storm / model region
  ≠ rendered airflow extent
  ≠ pedagogically useful observation region
```

Queued, not NEXT implementation.

---

## 11. Overlay reassessment

Point diagnostics + Follow now exist. Occupation can be
framed. Previous deferred reasons from `31` / `32` / `33`:

```text
different units (s⁻² vs s⁻¹)
couple vs shielded-vortex DEMO structures
prescribed Ω bookkeeping
visual temptation to read T1 → ω as causation
DEMO overfitting / dataset non-portability
Background highlight already REJECTED (`24`)
```

What changed:

```text
user can inspect values along a moving tracer
still has no field-scale spatial map
Follow makes occupation usable enough that the absence
of a map is more noticeable
```

What did **not** change:

```text
no playtest evidence that occupation+Follow failed to
teach couple ≠ core
no new encoding that shares a honest color scale
false-causality risk still high
```

**Is overlay now earned?**

```text
Desire: up.
Implementation / next-direction status: still NOT earned.
Do not mechanically repeat “deferred” as inertia — the
reassessment is honest: Follow removed the “unfair camera”
objection, but did not remove overfitting / causality /
units objections. Without teaching evidence that
occupation failed, overlay remains DEFERRED as NEXT.
```

If later earned, the only allowed question remains:

```text
Where, in this laboratory, do T_tilt,y and ω_y,current
occupy different spatial structures?
```

Not “show the mesocyclone.” Not “generated rotation.”

---

## 12. Ω=0 exhibit reassessment

Teaching contrast:

```text
T1 ≠ 0
ω_y,current = 0
under Ω = 0 synthetic exhibit
```

Point diagnostics make the contrast *readable*.
Follow makes occupying the couple *frameable*.

Still binding:

```text
not genesis
not prognostic ω
not fourth Guided experiment unless catalog decision changes
no relabeling tilting as generated rotation
axis sampling under Ω = 0 can still look blank
  (T ≈ 0 and ω = 0)
```

**Is Ω=0 exhibit now earned as NEXT?** NO.
Stronger than before diagnostics existed; still optional
later teaching architecture, not the post-Follow bottleneck.

---

## 13. Align-with-motion assessment

```text
teaching value:     LOW–MEDIUM (direction of V_total)
navigation value:   MEDIUM for chase feel; LOW for framing lab
camera-takeover risk: HIGH if automatic on Follow enable
3D V_total issues:  full 3D direction ≠ horizontal heading
low-speed / vertical / smoothing: unresolved hazards
```

Playtest E1 says framing without reorientation is already
comfortable.

**Is Align with motion earned?** NO as NEXT.
Possible later one-shot action; not part of Follow v1;
must not reopen `34`.

---

## 14. Product-density assessment

Live Explore `laboratory-toolbar` already stacks:

```text
Pause / Resume, Reset, speed
Follow
Enable placement, altitude, Confirm, Cancel, Clear
Visual airflow: encoding modes, pause viz, highlight, depth cue
```

Density is **HIGH**.

Before recommending several new buttons:

```text
Reset View / Center View     — high-frequency recovery;
                               earns a visible control if chosen
Undo / Remove last           — useful; competes with Clear;
                               do not add with Reset View + halo
                               controls in one opportunistic pass
selection identity           — primarily scene indication;
                               should not need a new toolbar verb
Align with motion            — would add another camera verb;
                               rejected as NEXT partly for clutter
```

Grouping note:

```text
Do not invent a generic overflow menu framework.
Prefer: one earned recovery control later, keep Clear,
defer Undo until release-management is truly next.
Selection halo is scene state, not another toolbar mode.
```

---

## 15. Reassessment of previous next candidates

At minimum A–N:

| ID | Candidate | Playtest effect |
| --- | --- | --- |
| A | Camera recovery / Reset View | **Newly evidenced (E2).** Earned need. Auto OFF/Clear recenter rejected. |
| B | Tracer picking tolerance | **Newly evidenced (E3).** Genuine loop friction. |
| C | Selection identity / halo | **Newly evidenced (E4).** Same identity concept as B. |
| D | Remove-last / release management | Evidenced (E5). Useful; architecture cost; not top. |
| E | Far-field / storm-region semantics | Evidenced (E6). Needs future analysis SoT; not naive patch. |
| F | Diagnostic spatial overlay / slice | Follow exists; teaching-failure evidence absent; still deferred as NEXT. |
| G | Ω=0 teaching exhibit | Stronger than pre-diagnostics; still not NEXT. |
| H | Guided Point diagnostics | Unchanged; still deferred (`32`). |
| I | Guided Follow | Unchanged; Explore-first still correct after E1. |
| J | Align with motion | Discussed; not earned (E7 / E1). |
| K | Comet / V_total perception revisit | Still deferred (`24`). |
| L | Richer prescribed scenario / model | Not licensed by playtest UX. |
| M | Dataset / source migration research | Still LONG-TERM (`30`). |
| N | Docs / teaching only | Companion only; not a substitute for identity/recovery. |

Playtest **did** change the previous ranking from `33`:

```text
33: Follow first; overlay desire up but not next;
    Reset View real but #4; picking not central.

Now: Follow COMPLETE and comfortable.
    Identity acquisition (B+C) and camera recovery (A)
    rise because they are live blockers of the loop Follow
    was meant to serve.
    Overlay / Ω=0 do not automatically outrank them without
    new teaching evidence.
```

---

## 16. Ranked candidate table

Scale: LOW / MEDIUM / HIGH.

| Candidate | Problem solved | Evidence | User-task impact | Architecture cost | Model/physics risk | Clutter risk | Recommendation / status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **B+C. Selection acquisition + identity (pick + preserve color + halo)** | Acquire / keep the intended probe through Inspect / Follow / A→B | HIGH (E3, E4) | **HIGH** — gates the whole live loop | MEDIUM (rendering observe + pick policy; no physics) | LOW | LOW (scene marker; no new mode cluster) | **NEXT DIRECTION** |
| A. Reset / Center View | Orphaned orbit after Follow / Clear | HIGH (E2) | HIGH recovery; MEDIUM for diagnostics comprehension | MEDIUM (camera contract; rest-pose API) | LOW | MEDIUM (one more toolbar verb) | Earned; **queued #2**; own SoT later |
| E. Far-field / storm-region checkpoint | Context mismatch of active far tracers | HIGH observation; MEDIUM product diagnosis | MEDIUM–HIGH conceptual honesty | HIGH if it becomes domain law | HIGH if naive X/Z inactive | LOW as docs | Queued analysis; **not UI now** |
| D. Remove-last | Coarse Clear in multi-release Explore | MEDIUM (E5) | MEDIUM workflow | MEDIUM–HIGH (delete/compact) | LOW | MEDIUM | Queued; not all delete variants |
| F. Overlay / slice | Spatial structure of T1 vs A | Desire up; teaching-fail evidence absent | HIGH for Task 3 *if* earned | HIGH encoding | HIGH false causality / DEMO overfit | HIGH | Still **DEFERRED as NEXT** |
| G. Ω=0 exhibit | T1 ≠ ω existence contrast | Logical; not playtested | HIGH for Task 4 if careful | MEDIUM scenario | HIGH if sold as genesis | LOW | Optional later |
| H. Guided diagnostics mount | Teaching numbers in Guided | None new | LOW–MEDIUM | LOW adapter | MEDIUM exhibit contamination | HIGH | Still deferred |
| I. Guided Follow | Framing in Guided Task 1 | E1 validates mechanics | MEDIUM | LOW reuse | LOW | MEDIUM Guided chrome | Later; not Explore blocker |
| J. Align with motion | Chase heading | Weak (E7); E1 against auto | LOW–MEDIUM | MEDIUM | LOW | MEDIUM | Later one-shot only |
| K. Comet / V_total revisit | Occupancy perception | None new | LOW on default points | MEDIUM | MEDIUM mass misread | MEDIUM | Still deferred (`24`) |
| L. Richer prescribed model | New storm behavior | None | — | HIGH | HIGH vs `15`/`30` | — | Not NEXT |
| M. Dataset migration research | Real-data path | None | LOW now | HIGH when started | LOW if labeled | — | LONG-TERM (`30`) |
| N. Docs/teaching only | Specialist clarity | — | LOW for live lab | LOW | LOW | none | Companion only |

Any candidate requiring stretching, T2, prognostic `ω`,
`ω → V`, continuity solver, CFD, or an eighth prescribed
velocity operand is **automatically not NEXT**. Class A
(`30`) stays binding.

### 16.1 Ranking

```text
1  B+C  selection acquisition + identity indication
2  A    Reset / Center View (earned; separate SoT)
3  E    far-field / storm-region analysis checkpoint
4  D    remove-last / release management
5  F    diagnostic overlay / slice — still deferred as NEXT
6  G    Ω=0 exhibit — optional later
7  H/I  Guided diagnostics / Guided Follow — deferred
8  K/N  comet revisit / extra docs
—  J    Align with motion — later one-shot only
—  L/M  richer model / dataset — not now
```

---

## 17. Decision

```text
RECOMMENDED NEXT DIRECTION:
Explore selected-tracer acquisition and identity indication
(enlarged pick target + preserve occupancy/path color +
explicit selection halo/shell)

WHY NOW:
Follow v1 is comfortable (E1). The live diagnostic loop still
breaks at acquire/maintain identity (E3, E4). That friction
gates Inspector, Point diagnostics, and Follow — the
capabilities the project just built. Yellow override is not a
scientific encoding; separating identity from selection state
is the coherent architectural fix. Picking hit-area and halo
share that concept; they are not a convenience bundle with
Reset View.

WHY NOT THE OTHERS:
Reset View is earned (E2) but is camera recovery, not loop
acquisition; auto recenter remains rejected; it is #2 with
its own SoT. Far-field needs analysis, not a naive domain
box. Remove-last is real Explore hygiene with delete-API
cost. Overlay desire rose, but teaching-failure evidence
after occupation+Follow is still absent; overfitting and
false-causality risks remain. Ω=0 / Guided mounts / Align /
comet / dataset / richer model stay parked for the reasons
in §§11–15.

NEXT ARTIFACT:
docs/architecture/36-explore-selection-acquisition-identity-architecture.md
(docs-only SoT for pick policy + identity≠selection + halo)
NOT Reset View bundled
NOT Align with motion
NOT domain bounds
NOT overlay
```

### 17.1 What successor `36` locks

```text
pick policy: invisible volume vs screen-space tolerance
visible glyph size: change or leave
identity color: occupancy/path color preserved on select
selection indication: halo / shell / ring contract
preview vs selection marker semantic separation
Follow A→B visual continuity
inactive / missing / Clear / Reset interaction with halo
test contract without WebGL screenshot harness
non-goals: Reset View, Align with motion, trail scientific
  recolor, Guided-only variants, physics
```

### 17.2 Implementation authorization

```text
Does this document authorize any production implementation?
NO.
```

Reset View, picking changes, halo, remove-last, domain
bounds, overlay, Ω=0, Align with motion, Guided features,
and new physics are out of scope for this checkpoint.

---

## 18. Required decision answers

1. **Biggest current bottleneck after Follow?**
   Acquiring and maintaining selected-tracer identity
   (picking hit-area + selection indication that does not
   destroy path color), with orphaned-orbit camera recovery
   as the strongest Follow-specific leftover.

2. **Did live playtest change the previous product ranking?**
   Yes. Follow drops out as NEXT. Identity acquisition and
   Reset View rise. Overlay / Ω=0 do not automatically win.

3. **Genuine defects / friction vs optional polish?**
   Defects / friction: E3 picking, E4 identity overwrite,
   E2 orphaned orbit (recovery missing).
   Optional / later: E7 Align, comet polish, Guided mounts.
   Not a bug: E6 far-field active under current domain.
   Convenience: E5 remove-last.

4. **Is Reset / Center View earned?** Yes; queued #2; SoT
   before implementation; auto OFF/Clear recenter rejected.

5. **Is better picking earned?** Yes.

6. **Is selection halo earned?** Yes (with preserve-color).

7. **Is Remove-last earned?** Partially as need; not NEXT;
   architecture cost remains.

8. **Does far-field require action now?** Not production
   patch; future analysis checkpoint possible.

9. **Is overlay now earned?** No as NEXT / implementation.

10. **Is Ω=0 exhibit now earned?** No as NEXT.

11. **Is Align with motion earned?** No.

12. **ONE recommended next direction:**
    Explore selected-tracer acquisition and identity
    indication (pick + preserve color + halo).

13. **Exact next artifact:**
    `docs/architecture/36-explore-selection-acquisition-identity-architecture.md`

14. **Is implementation authorized?** No.

---

## 19. Unresolved questions

Not a backlog commitment.

```text
U1  Exact pick policy (invisible mesh vs screen tolerance
    vs both) — answered in `36` as screen-space tolerance
U2  Exact halo geometry / material vs preview language
    — answered in `36` (same family, not exact reuse)
U3  Reset View = full DEEP_STORM_TRACER_VIEW vs recenter-
    only — belongs in a later camera-recovery SoT
U4  Whether occupation+Follow can teach couple ≠ core
    without overlay — still open; not answered by this
    UX playtest
U5  Named storm / model region vs lifecycle domain vs
    visual extent — future far-field checkpoint
U6  Whether remove-last is only “pop last seed” or needs
    selected delete — deferred with D
U7  Guided Follow / Guided diagnostics timing — unchanged
    deferred
```

---

## 20. Anti-claims

```text
this file does not implement anything in src/**
Follow-as-framing is not reopened
chase-camera is not earned by E1
auto-recenter on Follow OFF / Clear is rejected as default
Reset View is earned but is not the ONE next direction
preview wireframe ≠ selection halo
yellow selected glyph is not a scientific encoding
far-field active is not automatically a domain bug
inactive does not mean far from storm
overlay is still not NEXT
Ω=0 is not genesis and is not this direction
Align with motion is not part of Follow v1
Guided mounts are not unlocked by Explore Follow
comet polish remains deferred (`24`)
class A is unchanged (`30`)
this file is not ROADMAP.md
this file is not a picking/halo implementation SoT
this file is not a Reset View SoT
```

---

## 21. Documentation / authority

```text
this file:     post-Follow live-playtest product direction
34:            Follow camera contract — IMPLEMENTED;
               ranking successor is this file
33:            chose Follow — historical ranking; re-ranked here
32:            point-first observation UI — not replaced
31/30:         product/model class — not replaced
24:            V_total polish still deferred
19/18:         selection / seeding — identity & delete notes
11:            tracer domain y≥0; horizontal unbounded
rendering 11:  rest-pose fixture numbers unchanged here
```

Successor of `34`: this file. Successor selection
acquisition / identity architecture:

```text
docs/architecture/36-explore-selection-acquisition-identity-architecture.md
```

`36` is the architecture SoT this checkpoint required.
This file remains the post-Follow playtest product-direction
checkpoint. Completing `35` / `36` does **not** start
production implementation of picking, halo, Reset View,
overlay, or new physics.

Closed physics docs are not rewritten. Historical rankings
in `31` / `33` are not silently modernized beyond this
successor pointer relationship.

---

## 22. Compact lock-in

```text
CLASS:                  prescribed kinematic laboratory
                        (`30`) UNCHANGED

FOLLOW v1:              IMPLEMENTED and playtest-comfortable
                        core semantic CLOSED (`34`)

PLAYTEST:               E1–E7 recorded
                        preview ≠ yellow-inside-sphere myth

BIGGEST BOTTLENECK:     selected-tracer acquisition / identity

EARNED BUT NOT NEXT:    Reset / Center View (explicit;
                        no auto recenter on OFF/Clear)

DEFERRED / NOT NEXT:    overlay, Ω=0, Align, Guided mounts,
                        comet polish, dataset, remove-last as
                        immediate work, far-field domain patch

NEXT DIRECTION:         selection acquisition + identity
                        indication architecture SoT

NEXT ARTIFACT:          completed as
                        docs/architecture/36-explore-selection-acquisition-identity-architecture.md

IMPLEMENTATION
FROM THIS FILE:         NONE

CONFIDENCE:             HIGH on not reopening Follow /
                        not auto-recenter / not naive X/Z box
                        HIGH on identity friction as bottleneck
                        MEDIUM on exact pick/halo mechanics
                        (successor `36` owns that lock)
```
