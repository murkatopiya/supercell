export interface HodographOverlayVisibility {
  stormMotion: boolean;
  stormRelativeWind: boolean;
  horizontalVorticity: boolean;
  streamwiseCrosswise: boolean;
}

export const DEFAULT_HODOGRAPH_OVERLAY_VISIBILITY: HodographOverlayVisibility =
  {
    stormMotion: true,
    stormRelativeWind: true,
    horizontalVorticity: true,
    streamwiseCrosswise: true,
  };

export function isStormMotionDrawn(
  visibility: HodographOverlayVisibility,
  hasStormMotionData: boolean,
): boolean {
  return visibility.stormMotion && hasStormMotionData;
}

/**
 * Effective V_sr draw requires stored intent AND visible C.
 * Stored stormRelativeWind is not cleared when C is hidden.
 */
export function isStormRelativeWindDrawn(
  visibility: HodographOverlayVisibility,
  hasStormMotionData: boolean,
  hasSelectedKnot: boolean,
): boolean {
  return (
    visibility.stormRelativeWind &&
    visibility.stormMotion &&
    hasStormMotionData &&
    hasSelectedKnot
  );
}

export function isStormRelativeWindCheckboxDisabled(
  visibility: HodographOverlayVisibility,
): boolean {
  return !visibility.stormMotion;
}

export function isHorizontalVorticityDrawn(
  visibility: HodographOverlayVisibility,
  layerResolved: boolean,
): boolean {
  return visibility.horizontalVorticity && layerResolved;
}

/**
 * Effective streamwise/crosswise draw requires stored intent AND visible ω_h.
 * Stored streamwiseCrosswise is not cleared when ω_h is hidden.
 */
export function isStreamwiseCrosswiseDrawn(
  visibility: HodographOverlayVisibility,
  omegaLayerEffectivelyShown: boolean,
  geometryOk: boolean,
): boolean {
  return (
    visibility.streamwiseCrosswise &&
    visibility.horizontalVorticity &&
    omegaLayerEffectivelyShown &&
    geometryOk
  );
}

export function isStreamwiseCrosswiseCheckboxDisabled(
  visibility: HodographOverlayVisibility,
): boolean {
  return !visibility.horizontalVorticity;
}
