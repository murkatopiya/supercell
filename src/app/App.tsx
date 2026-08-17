import { useState } from "react";
import { DEMO_SCENARIO } from "../scenario/DEMO_SCENARIO.js";
import { resetTracersFromSeeds } from "../simulation/resetTracersFromSeeds.js";
import { HodographOverlayControls } from "../ui/hodograph/HodographOverlayControls.js";
import { HodographPanel } from "../ui/hodograph/HodographPanel.js";
import { DEFAULT_HODOGRAPH_OVERLAY_VISIBILITY } from "../ui/hodograph/hodographOverlayVisibility.js";
import {
  TracerRuntimeControls,
  type TracerTimeScale,
} from "../ui/tracer/TracerRuntimeControls.js";
import { TracerViewport } from "../ui/tracer/TracerViewport.js";
import {
  composeDemoTracerSimulation,
  createDemoPathHistory,
  demoKeepInactiveGlyphs,
  demoSeedsForPedagogy,
} from "./composeDemoTracerSimulation.js";
import { IntegrationFrame } from "./IntegrationFrame.js";
import { LIVE_DEMO_TRACER_PEDAGOGY } from "./TracerPedagogy.js";
import {
  DEMO_SELECTED_HEIGHT,
  createDemoHodographPoints,
  createDemoStreamwiseCrosswiseOverlay,
  createDemoVorticityLayer,
} from "./demoHodographFixture.js";

export function App() {
  const points = createDemoHodographPoints();
  const vorticityLayer = createDemoVorticityLayer();
  const streamwiseCrosswiseOverlay = createDemoStreamwiseCrosswiseOverlay();
  const [overlayVisibility, setOverlayVisibility] = useState(
    DEFAULT_HODOGRAPH_OVERLAY_VISIBILITY,
  );
  const [tracerSimulation] = useState(() =>
    composeDemoTracerSimulation(
      IntegrationFrame.StormRelativeLaboratory,
      LIVE_DEMO_TRACER_PEDAGOGY,
    ),
  );
  const [pathHistory] = useState(() =>
    createDemoPathHistory(LIVE_DEMO_TRACER_PEDAGOGY, tracerSimulation.particles),
  );
  const [paused, setPaused] = useState(false);
  const [timeScale, setTimeScale] = useState<TracerTimeScale>(1);
  const [resetEpoch, setResetEpoch] = useState(0);

  const handleReset = () => {
    resetTracersFromSeeds(
      tracerSimulation,
      demoSeedsForPedagogy(LIVE_DEMO_TRACER_PEDAGOGY),
    );
    pathHistory?.clear();
    pathHistory?.captureInitial(tracerSimulation.particles);
    setResetEpoch((epoch) => epoch + 1);
  };

  return (
    <main className="app">
      <h1 className="app__title">Supercell Explorer</h1>
      <p className="app__subtitle">
        Ground-relative hodograph. 3D tracers use a storm-relative
        laboratory frame (environmental advection relative to
        prescribed storm motion).
      </p>

      <section className="app__panels">
        <div className="app__panel app__panel--hodograph">
          <h2 className="app__panel-title">Hodograph</h2>
          <HodographPanel
            points={points}
            stormMotion={DEMO_SCENARIO.stormMotion}
            selectedHeight={DEMO_SELECTED_HEIGHT}
            vorticityLayer={vorticityLayer}
            streamwiseCrosswiseOverlay={streamwiseCrosswiseOverlay}
            overlayVisibility={overlayVisibility}
          />
          <HodographOverlayControls
            value={overlayVisibility}
            onChange={setOverlayVisibility}
          />
        </div>

        <div className="app__panel app__panel--tracer">
          <h2 className="app__panel-title">
            Storm-relative laboratory: prescribed storm-relative
            pathline descending through the downdraft region until
            it exits the atmospheric domain at y = 0
          </h2>
          <TracerRuntimeControls
            paused={paused}
            timeScale={timeScale}
            onPausedChange={setPaused}
            onTimeScaleChange={setTimeScale}
            onReset={handleReset}
          />
          <TracerViewport
            simulation={tracerSimulation}
            pathHistory={pathHistory}
            keepInactiveGlyphs={demoKeepInactiveGlyphs(LIVE_DEMO_TRACER_PEDAGOGY)}
            timestep={DEMO_SCENARIO.simulation.timestep}
            paused={paused}
            timeScale={timeScale}
            resetEpoch={resetEpoch}
          />
        </div>
      </section>
    </main>
  );
}
