# Local saved-trajectory viewer

Developer utility for the single existing Slice 2 result. Execution authority and
boundaries: [Slice 3 Decision](../../../docs/2026-10-21-learn-demo-viewer-slice-3-authorization.md).
No simulation, collection, source-snapshot execution or evidence writes.

From the repository root, with installed dependencies and Node 22 supporting
experimental type stripping, and with collection opt-in absent:

```powershell
node --experimental-strip-types tools/learn-demo-seed-verification/viewer-server/server.ts
```

Open http://127.0.0.1:4177/. Stop with Ctrl+C. Port conflicts fail rather than selecting
another host/port. The server verifies the fixed result/provenance/checksums hashes,
every listed file, full source snapshot and result structure before listening.
It serves a verified in-memory result, viewer files and installed Three/Vite client
resources only. Browser-side SHA-256 and schema checks precede renderer construction.
No dependency download, upload, public route or external service is used.

Play/Pause uses discrete saved steps at 1x or 5x. Slider changes pause playback.
Restart sets step 0 and pauses, preserving camera. Case change clears slots/history,
pauses, resets step and frames ALL saved positions of the new case, including both
roles in pairs. The first load retains the original fixed camera. Frame Trajectories
centers the target on the complete selected case with a sphere enclosing all saved
marker positions, 150 m glyph radius and 15% visual margin. Distance accounts for
vertical FOV and horizontal FOV from viewport aspect; data/world scale is untouched.
No future trail samples become visible as a result of framing.

Reset View restores exactly camera (12000,6000,12000), target (0,4000,0), FOV 50,
near/far 10/50000; it does not change case, step, playback or data. After Frame
Trajectories, resize refits the complete case for the new aspect. After manual orbit,
pan or zoom, resize updates projection only and preserves that manual pose; after
Reset View it preserves the baseline pose. Frame Trajectories re-enables resize
refitting. Empty/invalid/overflowing bounds or invalid viewport dimensions fall back
to the fixed camera with a visible diagnostic. Point/line cases retain a finite
glyph-sized frame. Follow stays off.
Mouse: left orbit, right pan, wheel zoom. Hidden tabs pause playback. Active markers
have role-colored glyphs and screen labels; inactive glyphs hide per Demo baseline,
with status and raw coordinates retained in cards. Lines show the actual recorder
prefix, including its last sample, with no inferred points.

The copied baseline is camera (12000,6000,12000), target (0,4000,0), FOV 50 degrees,
near/far 10/50000 m, grid 10000 m in 10 divisions, glyph radius 150 m. All axes use
the same physical scale. GPU positions use Float32 rendering precision; original
JSON numbers remain untouched. Labels can overlap; framing uses a conservative sphere
rather than a tight camera-oriented box. Slow frames can skip displayed indices without dropping eligible history.
This utility does not establish live production lifecycle/performance, user
comprehension, scientific qualification or Learn seed suitability.

Initialization registers cleanup immediately after each successfully acquired
resource. A later error drains ownership in reverse order without replacing the
original error; cleanup remains idempotent. Case-local resources are owned separately
so partial case construction is also released. Renderer disposal is followed by
context loss even if disposal fails; controls connect only after cleanup ownership
is installed. Observers, handlers, animation callbacks and generated DOM are removed.
Resources internal to a constructor that throws before returning remain that
library constructor's responsibility; no returned resource is abandoned.

Bounded developer checks (never set collection opt-in):

```powershell
node node_modules/typescript/bin/tsc -p tools/learn-demo-seed-verification/tsconfig.viewer.json --noEmit --incremental false
node node_modules/vitest/vitest.mjs run --config tools/learn-demo-seed-verification/viewer-server/vitest.config.ts
```

Input evidence remains local/ignored. This utility does not replace a separate
durable retention decision. Runtime trusts the local checkout and installed
Vite/Three dependencies; it is not a hostile-filesystem security boundary.
