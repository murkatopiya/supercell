import type { HodographOverlayVisibility } from "./hodographOverlayVisibility.js";
import {
  isStormRelativeWindCheckboxDisabled,
  isStreamwiseCrosswiseCheckboxDisabled,
} from "./hodographOverlayVisibility.js";

export interface HodographOverlayControlsProps {
  value: HodographOverlayVisibility;
  onChange: (next: HodographOverlayVisibility) => void;
}

export function HodographOverlayControls({
  value,
  onChange,
}: HodographOverlayControlsProps) {
  const vsrDisabled = isStormRelativeWindCheckboxDisabled(value);
  const scDisabled = isStreamwiseCrosswiseCheckboxDisabled(value);

  return (
    <fieldset className="hodograph-overlay-controls">
      <legend>Hodograph overlays</legend>

      <label className="hodograph-overlay-controls__option">
        <input
          type="checkbox"
          checked={value.stormMotion}
          onChange={(event) => {
            onChange({
              ...value,
              stormMotion: event.target.checked,
              // Preserve stored stormRelativeWind intent (doc 05 §6.2).
            });
          }}
        />
        Storm motion C
      </label>

      <label className="hodograph-overlay-controls__option">
        <input
          type="checkbox"
          checked={value.stormRelativeWind}
          disabled={vsrDisabled}
          onChange={(event) => {
            onChange({
              ...value,
              stormRelativeWind: event.target.checked,
            });
          }}
        />
        Storm-relative wind V_sr
      </label>

      <label className="hodograph-overlay-controls__option">
        <input
          type="checkbox"
          checked={value.horizontalVorticity}
          onChange={(event) => {
            onChange({
              ...value,
              horizontalVorticity: event.target.checked,
              // Preserve stored streamwiseCrosswise intent (doc 06 §8.1).
            });
          }}
        />
        Horizontal vorticity ω_h
      </label>

      <label className="hodograph-overlay-controls__option">
        <input
          type="checkbox"
          checked={value.streamwiseCrosswise}
          disabled={scDisabled}
          onChange={(event) => {
            onChange({
              ...value,
              streamwiseCrosswise: event.target.checked,
            });
          }}
        />
        Streamwise / crosswise vorticity
      </label>
    </fieldset>
  );
}
