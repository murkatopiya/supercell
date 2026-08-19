# Independent Perceptual Airflow Review — 2026-08-19

**Authority:** external review / decision input. **NOT** project
source of truth.

**Status:** preserved independent perceptual exploration of the
live Slice 2 `THREE.Points` layer. Recommendations in this
file are the author's, not project decisions.

**Source material:** independent chat exploration of the live
Explore background airflow (2026-08-19), after Slice 2
(`be43bf1`). Not an uploaded `audit.md`. This file is a
structured provenance note, not a verbatim transcript.

**Repository verified against:**

```text
be43bf1c04fbb834f3c5bec59273bec0bd21c797
```

**Project decision SoT for what follows from this review:**

```text
docs/architecture/23-perceptual-airflow-workbench.md
```

This file must not be read as selecting a product
representation, authorizing implementation, or replacing
`CONCEPT.md`, `ARCHITECTURE.md`, `22`, or physics SoT.

For substantial theses below, four labels stay distinct:

```text
External finding
External recommendation
Repository verification
Project decision status
```

`Project decision status` records only what `23` decided.

---

## 1. Encoding limit of position-only points

**External finding:** `THREE.Points` is a zero-dimensional
unoriented primitive. Direction exists only as a temporal
percept from frame-to-frame position change. On Pause the
static frame contains no velocity signal.

**Repository verification:** `VisualAirflowScene` writes only
xyz positions into a `THREE.Points` buffer. Appearance is one
color, one opacity, `depthWrite: false`. Occupant public
shape is `{ position, age }`. No direction attribute.

**Project decision status:** accepted as playtest finding P3
in `23`. Not treated as an opacity/count bug.

---

## 2. Apparent-density cue under YELLOW continuity

**External finding:** advected occupants converge/diverge, so
visual spacing can read as amount of air. The current model
forbids treating occupancy as density/mass/cloud. Eulerian
fixed samples cannot produce that concentration cue.

**Repository verification:** continuity is YELLOW
(`10`, `15`). NG axis `∇ · V ≈ +0.022 s⁻¹` (`15`). Visual
contract already says count/spacing ≠ density (`22` §3.1,
§25). Live `maxAge = 80 s` (`demoVisualAirflowFixture`).
Review arithmetic that a lifetime integral can be O(1) in
loud regions is an **external estimate**, not a new
measurement in this file.

**Project decision status:** accepted as a comparison
criterion, not as a command to delete the population.

---

## 3. Depth collapse

**External finding:** uniform color/opacity plus a deep volume
and weak near/far differentiation can collapse a paused 3D
cloud into a flat texture. Depth cue is orthogonal to
representation family.

**Repository verification:** `VISUAL_AIRFLOW_MARKER` uses one
color `0x8fa4b8`, opacity `0.42`, `sizeAttenuation: true`.
Camera overview is tens of kilometers
(`DEEP_STORM_TRACER_VIEW`). Volume depth is kilometers.

**Project decision status:** DEPTH LEGIBILITY is an orthogonal
prototype toggle in `23`. Not meteorological fog.

---

## 4. Family recommendations (author, not selected)

**External recommendation:** first cheap prototypes should be
oriented Lagrangian marks, Eulerian oriented samples, then
sparse instantaneous streamlines if local marks lack
large-scale topology. Micro-trails last because they share
scientific-trail language. LIC/slices later. Tubes/surfaces
rejected for YELLOW continuity.

**Project decision status:** `23` approves R1 and R2 as
unimplemented prototypes, defers R3 until R1/R2 evidence,
does not first-line micro-trails, defers LIC/slices, rejects
tubes/surfaces for the current model. No winner.

---

## 5. Comparison method (author, not a product UI)

**External recommendation:** keep candidates in one live scene
behind a dev switch; judge PLAY and PAUSE against a DEMO-geometry
checklist; if no encoding distinguishes known regions from the
overview pose, the limit may be camera/P1, not representation.

**Project decision status:** accepted as the workbench
principle in `23`. Workbench modes are not public product modes.
Implementation is not authorized by this review file.
