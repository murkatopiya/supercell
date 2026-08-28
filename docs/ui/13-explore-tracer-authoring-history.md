# Explore Tracer Authoring History

**Status:** UI SoT / Slice 4.5 COMPLETE
**Scope:** Undo/Redo of successful Explore **Add tracer**
actions. Authoring composition, not simulation rewind.
**Physics:** unchanged. Occupancy last-in removal is a
Simulation lifecycle primitive, not a new atmospheric law.
**Implementation:** Slice 4.5 COMPLETE in production `src/**`.
Slice 5 floating hodograph remains NOT STARTED (`11`).

Predecessors:

```text
docs/architecture/18-explore-arbitrary-seeding.md
docs/architecture/19-shared-tracer-inspector.md
docs/architecture/41-post-slice-b-explore-release-and-highlight-checkpoint.md
docs/ui/08-scene-toolbar-and-control-states.md
```

---

## 1. Purpose

A user who released one tracer by mistake must be able to
remove it without `Clear tracers` of the whole laboratory.

```text
authoring history ≠ runtime history
authoring history ≠ simulation rewind
```

---

## 2. Current fact (live App)

```text
Owner                   ExplorePointReleaseOrchestration
                        .authoringHistory
Command v1              Add tracer (seed {x, y, z})
Undo                    remove last occupancy (seed + particle
                        + path lane + scene slot)
Redo                    session.releasePoint(stored seed) at
                        current clock.time; new tracerId
Clear tracers           particles + undoStack + redoStack empty
New Explore lab         empty history (createExploreLab,
                        environment change, Guided ↔ Explore)
Guided                  no Undo/Redo UI or history
UI home                 Explore Release band, not SceneToolbar
Disabled                Undo ⇔ undoStack empty
                        Redo ⇔ redoStack empty
Shortcuts               Ctrl/Cmd+Z undo
                        Ctrl/Cmd+Shift+Z or Ctrl/Cmd+Y redo
                        skipped when focus is INPUT/TEXTAREA/
                        SELECT/contentEditable
```

---

## 3. Command contract

v1 records only a successful user `confirmRelease`:

```text
{ kind: "add-tracer", seed: TracerSeedPosition }
```

`seed` is a copy of the release world position already used
by `ExploreTracerSession.releasePoint` (`x`, `y` altitude,
`z`). No evolved particle snapshot. No trajectory.

Failed confirm (no pending seed) is not recorded.

---

## 4. Undo contract

`Orchestration.undoLastAdd`:

1. no-op when `undoStack` is empty;
2. `ExploreTracerSession.removeLastRelease` drops the last
   seed, last particle, and last path-history lane;
3. `removeLastTracerSlot` drops the last glyph/trail;
4. the Add command moves onto `redoStack`.

Unchanged:

```text
clock.time
timeScale / paused
remaining tracers' positions, ages, trajectories
environment
camera
Airflow / Grid / display flags
```

`TracerSelection` is not written by orchestration. App
compares `removed.tracerId` with `selection.selectedId` and
calls the existing `clearSelectionAndInspection` when they
match. A different selected tracer stays selected.
`resolveSelectedTracer` / Inspector already yield no snapshot
for a missing id.

---

## 5. Redo contract

`Orchestration.redoLastAdd` repeats the stored Add command
through `session.releasePoint` at the **current** laboratory
clock.

The restored tracer is a **new runtime identity**.
`Simulation.removeLastParticle` does not rewind
`nextTracerId`. Redo must not impersonate the undone
`tracerId`.

Trajectory / path samples that existed before Undo are not
restored. Birth is a new late-birth at `clock.time`, age 0.

---

## 6. Branch semantics

Standard editor:

```text
A, B, C → Undo C → Undo B → Redo B
```

A new successful Add after Undo clears `redoStack`.

---

## 7. Clear and session boundaries

```text
Clear tracers → occupancy empty, both stacks empty
createExploreLab → empty history
Explore environment identity change → new lab, empty history
Guided ↔ Explore → new lab, empty history
Landing → history unmounted with the lab
```

Reset (simulation) replays current seeds at t = 0. It does
not clear authoring history: the same Add commands still
describe the occupancy.

Clear is not one giant undoable command.

---

## 8. UI

Compact **Undo** / **Redo** in the Explore Release band,
beside Add-tracer authoring. Not in `SceneToolbar` (those
controls change presentation). Not in Guided.

Disabled uses the real `disabled` attribute and the same
title pattern as Clear tracers (`Nothing to undo` /
`Nothing to redo`).

---

## 9. Keyboard

Implemented locally on the Explore laboratory:

```text
Ctrl/Cmd+Z              Undo
Ctrl/Cmd+Shift+Z        Redo
Ctrl/Cmd+Y              Redo
```

The listener is not registered in Guided or on the landing
page. It does not capture the event when a text-editing
control is focused, so the altitude number field keeps native
Undo.

---

## 10. Occupancy removal primitives

Last-in removal is the dual of Explore append-only birth.
It is not arbitrary mid-list delete.

```text
Simulation.removeLastParticle
TracerPathHistory.removeLastLane
ExploreTracerSession.removeLastRelease
TracerScene.removeLastTracerSlot
```

These do not live in physics. They do not rewind time.

---

## 11. Anti-claims

```text
This SoT does not rewind simulation time.
This SoT does not restore trajectories.
This SoT does not snapshot Simulation.
This SoT does not undo environment, speed, camera, or selection.
This SoT does not add Guided history.
This SoT does not add arbitrary tracer deletion UI.
```
