# Historical Path Probe Architecture

**Status:** POST-V1 RESEARCH CHECKPOINT / FIRST SLICE IMPLEMENTED
**Scope:** whether live path history plus existing
read-only diagnostic APIs can support click-a-past-path
sample → inspect that recorded `(P, t)` without mutating
simulation. Not a roadmap. Not an Inspector redesign.
Not a free 3D probe. Not rewind.
**Physics:** unchanged. Current DEMO / Goshen laboratory
fields remain prescribed and Eulerian-steady. Diagnostics
stay `sample(P, t)` observers. This file does not add
diagnostic snapshot storage.
**Implementation:** first slice implemented: recorded
`simulationTime`, pathline click pick, recomputed
Inspector / Point diagnostics, CURRENT vs HISTORICAL
PATH SAMPLE label, presentation-only path marker.
Rewind, timeline, side-by-side, and free 3D probe remain
out of this SoT.

Predecessor:

```text
docs/rendering/14-tracer-path-history.md
docs/architecture/19-shared-tracer-inspector.md
docs/architecture/32-diagnostic-observation-ui-architecture.md
docs/architecture/36-explore-selection-acquisition-identity-architecture.md
docs/architecture/50-i2-goshen-sandbox-integration.md
```

Keep these roles distinct:

```text
CURRENT FACT
NEW PROJECT DECISION
ANTI-CLAIM
```

---

## 1. User need

**CURRENT FACT.** Inspector and Point diagnostics explain
the **selected tracer at its current position** and
`simulation.clock.time` (`19` §9, `32` §4). The red
pathline is the recorded discrete trajectory
(`14`).

Desired interaction:

```text
click pathline
→ nearest historical path sample selected
→ Inspector / Point diagnostics show that sample
→ current tracer keeps moving
→ no rewind / no simulation mutation
```

Motivating laboratory: Explore Goshen observed environment
(`50`). Typical clicks: low-level inflow leg, turning hook,
beginning of rapid ascent. The tool compares Eulerian
contributions **along the recorded path**. Path shape alone
is not causation.

---

## 2. Exact current path-history data model

**CURRENT FACT.** Verified against
`src/simulation/TracerPathHistory.ts` and its tests, not
from UI.

Owner: `TracerPathHistory` (option C in `14`). Three-free.
Not `TracerParticle`, not `Simulation`, not `TracerScene`.

Internal state:

```text
stride:             positive integer; Explore / DEMO = 1
histories:          PathHistorySample[][]  // one lane per occupancy
observedActive:     boolean[]    // last observed active flag
stepsSinceCapture:  number       // stride counter
```

Each stored sample is a copied world position plus the
laboratory clock at that sampling boundary:

```text
{
  position:        { x, y, z }   // metres; SRL world
                                 // (+X east, +Y up, +Z south)
  simulationTime:  number        // laboratory clock at capture
}
```

Not stored per sample:

| Field | Present? |
| --- | --- |
| simulation time | **yes** (first-slice addition) |
| tracer age | **no** (derived: sample.time − first.time) |
| tracerId | **no** (lives on `TracerParticle`) |
| slot id | **no** (lane index **is** occupancy index) |
| explicit sequence id | **no** (array index is chronological) |
| velocity / diagnostics | **no** (recomputed via `sample(P, t)`) |
| active-at-sample | **no** (lane has last observed `active` only) |

Lane index equals particle array index equals renderer
slot index. `tracerId` is recovered via
`tracerIdForSlot` / `occupancyIndexForTracerId`. Session
alignment: particle count = history lanes = Explore seed
count (`ExploreTracerSession.assertAligned`).

Lifecycle:

```text
sampling:     after each completed Simulation.step
              (advanceLaboratoryFixedStep → recordAfterStep)
stride:       1 (every step). Off-stride terminal
              deactivation still appends once.
initial:      captureInitial after construct / Reset
late birth:   appendParticle copies birth position,
              bypasses stride
max length:   none. Full history until Reset.
              Not a ring buffer. Cap is deferred (`14` §4).
survives motion: yes; append-only while the tracer is
              observed active (plus one terminal sample)
Reset:        clear() + captureInitial(); lanes kept;
              tracerId kept (`resetTracersFromSeeds`)
Clear:        removeAllLanes(); particles dropped;
              nextTracerId restarts at 1
Pause:        no step → no append
timeScale:    more steps → more points; same spatial dt
```

Renderer: `TracerScene.syncFromPathHistory` copies
`pointsFor(i)` into `THREE.Line` position attributes.
GPU geometry has **positions only**. No per-vertex time.

---

## 3. Timestamps

**CURRENT FACT.** First slice records `simulationTime` on
each path sample at the existing sampling boundary:

```text
captureInitial / appendParticle  →  clock.time at capture
recordAfterStep                  →  post-step clock.time
                                  (same t Inspector uses)
```

That is path-history metadata, not a diagnostic snapshot.
Do not reconstruct time from index.

Reconstructing `t` from live `(clock.time, age, index)`
is **not generally valid**:

```text
inactive tracer:   age frozen, clock continues
late birth:        birth time is not stored
stride ≠ 1:        samples skip steps
off-stride terminal: last sample is not k * stride * dt
recorder:          does not know dt
```

---

## 4. Can diagnostics be recomputed?

Canonical field API (`VelocityField`, T1, Candidate A):

```text
sample(position, time)
```

All are pure / read-only with respect to simulation
particles and clock. `inspectTracer` and
`inspectSelectedPointDiagnostics` already sample; they
do not write.

### 4.1 Verdict

```text
Given (position, simulationTime):     A. fully possible now
Given current stored path samples:    B. partially possible
                                      (position yes, time no)
```

New **diagnostic snapshot storage is not needed**.
Recomputation from the live laboratory field is the
valid path. The missing stored state is **sample time**,
not `V_total` / operands / T1 / ω.

### 4.2 Per quantity

| Quantity | Input | Owner |
| --- | --- | --- |
| `V_total` | `(P, t)` | `velocityObservation.total.sample` |
| seven operands | `(P, t)` each | `parts[].field.sample` keys: `environmentAdvection`, `updraft`, `rotation`, `lowerInflow`, `upperOutflow`, `downdraft`, `nearGroundOutflow` |
| speed \|V_total\| | derived from `V_total` | Inspector arithmetic |
| `T_tilt,y` | `(P, t)` | `tiltingTendency.sample` |
| `ω_y,current` | `(P, t)` | `currentVerticalVorticity.sample` |

`inspectSelectedTracer` / `inspectSelectedPointDiagnostics`
currently bind `P` to the **live particle**. Historical
probe needs a sibling that samples an explicit `(P, t)`
without treating the live glyph as the sample point.
Do not invent a second physics stack.

Age / `active` are particle state, not field samples.
Historical age = `sample.time − firstSample.time` of that
lane. Do not display live `particle.age` as the historical
age.

### 4.3 Inspector lag (unchanged)

`19` §9: after a step the glyph is at `x_{n+1}` and the
clock is `t_{n+1}`; the displacement just taken used
`V(x_n, t_n)`. Path history stores post-step positions.
Historical inspect at a stored sample uses the **same
current-state convention** as Inspector-now: field at
the recorded marker and recorded post-step time. It does
not reconstruct the pre-step advecting sample. That is
honesty, not a new physics.

---

## 5. Time dependence

**CURRENT FACT.** Live DEMO and Goshen-injected Explore
operands are Eulerian-steady: `sample` accepts `t` and
ignores it (`_time`). T1 forwards `t` to the updraft
gradient; Candidate A forwards `t` to
`worldVerticalVorticity`; both current envelopes are
steady (`15`, `23`, `32` §4).

Trajectory time dependence still exists through changing
**position**, especially height-dependent environment
(`12` §8). That is why inflow / hook / ascent readouts
differ.

**NEW PROJECT DECISION.** Historical diagnostics **must**
pass the recorded historical `t`, even while current
fields ignore it. Sampling historical `P` at live
`clock.time` would silently misrepresent a future
time-dependent field. UI must not claim
“time-invariant.”

Goshen profile is a fixed observed column, not a
time-evolving 3D storm. Faithful explanation is
laboratory `V` at that `(P, t)`, not Goshen-storm
causation.

---

## 6. Path picking

**CURRENT FACT.** Glyph pick is screen-space nearest
visible glyph center, `PICK_TOLERANCE_PX = 16`
(`pickVisibleTracerSlot`, `36`). Stationary click
(`≤ 5 px`). Glyph hit wins over Explore placement
(`resolveTracerPointerUp`). Trails are `THREE.Line`
strips with positions only. Product pick **does not**
scan trails. Clicking empty path currently falls through
to placement when the tool is on — that would **birth**
a tracer.

Trail `Line` default raycast is unused by product pick.
Do not adopt `Raycaster` on the line: thin geometry,
threshold hacks, and it would not snap to stored samples.

**NEW PROJECT DECISION.** Minimum path pick:

```text
1. Stationary left-click only (existing Orbit coexistence).
2. Glyph hit → CURRENT selection; clear historical probe.
3. Else nearest stored path sample in screen space,
   same projectWorldPointToCanvasPixels + 16 px tolerance.
   Winner: min d_px → front-most depth → lower slot/index.
   Snap is the stored sample, not a segment interpolation.
4. Else existing placement / ignore.
```

Path pick is pathline-only. It does not birth, does not
move the camera, and does not retarget Follow to the
past point. Follow, if on, stays on the **live** glyph.

Do not pick another tracer’s glyph because a path was
clicked: glyph still wins when both are inside tolerance.
Do not invent a free-form 3D probe.

Reuse: projection, tolerance, stationary-click, and
tie-break from `36`. New helper: nearest historical
sample among occupancy lanes with `points.length > 0`.

---

## 7. Historical sample identity

**NEW PROJECT DECISION.** Smallest robust handle:

```text
HistoricalPathProbe = {
  tracerId: number
  historyIndex: number
}
```

Resolve `(position, simulationTime)` from the recorder at
inspect time. Old samples are not mutated; the buffer
only appends. A copied snapshot is unnecessary while the
lane lives.

There is **no ring buffer**. `historyIndex` does not
slide away during a live run.

Invalidation — **clear the probe**:

| Event | Why |
| --- | --- |
| Reset | `clear` + `captureInitial`; same `tracerId`, **new** path; old index is a different sample or out of range |
| Clear | lanes gone; `tracerId` recycled from 1 |
| Explore environment switch | new lab (`createExploreLab`) |
| Explore ↔ Guided | new lab; selection already cleared |
| missing tracerId / index out of range | history no longer valid |

Do not keep a stale copied `(P, t)` on screen after those
events (`32` anti-claim: leftover numbers are forbidden).

If a later cap / sliding window is ever added, index
identity becomes unsafe; that policy is out of scope here.

---

## 8. Inspector semantics

Do not redesign Inspector. Do not start Level 3 (`19`).
Do not move T1 / ω onto L2 (`32`).

**NEW PROJECT DECISION.** One narrow mode on the existing
surfaces:

```text
CURRENT
  selected live tracer at current (P, clock.time)

HISTORICAL PATH SAMPLE
  recorded path sample (P, t_recorded)
  field recomputed at that marker
  tracer is not rewound
  simulation continues
```

Minimum copy:

```text
Inspector title / identity line: HISTORICAL PATH SAMPLE
Point diagnostics hint: sampled at a past recorded
  position/time from the laboratory field. The tracer
  was not rewound.
```

Keep L1/L2 rows and the Point diagnostics sibling. Feed
them historical `(P, t)` instead of live particle
position. Glyph click returns to CURRENT.

---

## 9. Goshen use case

I2 Explore Goshen replaces the **environmental profile
knots only**. Storm operands and prescribed `C` remain
DEMO (`50`). Seven-operand `V_total` and T1 / Candidate A
remain the same observers.

Clicking inflow / hook / ascent is scientifically valid
as: **compare Eulerian laboratory contributions at those
recorded positions**. Height-dependent observed
environment is the quantity that actually changes along
that path. Prescribed Ω / updraft / radial limbs are
still DEMO cartoons.

**ANTI-CLAIM:**

```text
path curvature is not a measured Goshen trajectory
hook is not proof of tilting
same-sign T1 and ω_y,current is not causation
this is not a reconstruction of the 2009 storm
```

Those points can be explained faithfully **in this
laboratory**. They cannot be claimed as the historical
storm’s parcel history.

---

## 10. Tests

Do not duplicate existing physics tests for T1, ω, or
operand sums. Contract tests only:

```text
path sample stores copied position + recorded simulationTime
captureInitial / appendParticle time = clock at capture
recordAfterStep time = post-step clock.time
historical inspect uses recorded (P, t), not live glyph / clock
simulation particles, clock, and field instances are not mutated
selected tracerId stays the live tracer; probe is additional mode
nearest stored sample within 16 px; glyph wins over path
path hit does not birth a tracer
path hit does not move camera / Follow target
Reset clears historical probe
Clear clears it
DEMO ↔ Goshen environment switch clears / rebinds safely
Explore ↔ Guided clears it
live tracer continues after historical probe
CURRENT vs HISTORICAL label
inactive / empty lane is not a pick candidate
no glyph-selection regression (36 screen-space contract)
```

---

## 11. Scope

| Item | Class |
| --- | --- |
| Record `simulationTime` on path samples | **IMPLEMENTED** |
| Pathline click → nearest historical sample | **IMPLEMENTED** |
| Historical Inspector L1/L2 (recomputed seven operands + speed) | **IMPLEMENTED** |
| Historical Point diagnostics `T_tilt,y` / `ω_y,current` | **IMPLEMENTED** |
| CURRENT vs HISTORICAL label | **IMPLEMENTED** |
| Presentation-only path-sample marker | **IMPLEMENTED** |
| Side-by-side two historical points | LATER |
| Timeline scrubber | LATER |
| Simulation rewind | REJECTED |
| Breadcrumb annotations | LATER |
| Free 3D probe | REJECTED |
| Exporting trajectory data | LATER |
| Diagnostic snapshot cache | REJECTED (recompute) |
| Ring-buffer / max-point cap | out of this SoT (`14` deferred) |
| Inspector Level 3 / overlay | out of this SoT |
| Guided-only pedagogy / claim copy | out of this SoT |

First slice is one vertical Explore-capable path: record
time, pick sample, recompute, label. Guided Inspector may
follow the same `(P, t)` because the recorder and Inspector
are already shared; Point diagnostics remain Explore-only
(`32`).

---

## 12. Production files likely to change

```text
src/simulation/TracerPathHistory.ts
src/simulation/TracerPathHistory.test.ts
src/ui/tracer/advanceLaboratoryFixedStep.ts
src/explore/ExploreTracerSession.ts
src/app/createGuidedLab.ts
src/app/composeDemoTracerSimulation.ts   // if capture wiring lives here
src/rendering/pickPathHistorySample.ts   // new; reuse 36 projection
src/ui/tracer/resolveTracerPointerUp.ts
src/ui/tracer/TracerViewport.tsx
src/interaction/TracerInspection.ts      // inspect explicit (P, t)
src/interaction/PointDiagnosticObservation.ts
src/app/App.tsx                          // probe state + refresh
src/ui/tracer/TracerInspectorPanel.tsx   // CURRENT / HISTORICAL
src/ui/tracer/PointDiagnosticsPanel.tsx
src/rendering/tracerObserveSlot.ts       // optional: disable Line.raycast
```

Unchanged physics: field formulas, T1, Candidate A,
Goshen profile ingest.

---

## 13. Compact lock-in

```text
CURRENT HISTORY:     copied world position + simulationTime;
                     not diagnostic snapshots
RECOMPUTE:           existing sample(P, t) for V_total, 7 operands,
                     speed, T_tilt,y, ω_y,current
TIME:                pass recorded t even if fields ignore it
PICK:                screen-space nearest stored point; glyph wins;
                     path beats placement; no birth; no camera
PROBE:               { tracerId, historyIndex }; clear on
                     Reset / Clear / env / mode / invalid index
NO RING BUFFER:      index stable while appending
INSPECTOR:           one HISTORICAL PATH SAMPLE mode/label
GOSHEN:              Eulerian lab comparison along the path;
                     not storm causation
IMPLEMENTATION:      FIRST SLICE COMPLETE
```
