import { IGRA_MISSING, IGRA_QA_REMOVED } from "./types.js";

export function igraFieldIsPresent(value: number): boolean {
  return value !== IGRA_MISSING && value !== IGRA_QA_REMOVED;
}

export function igraWindFromDirectionSpeed(
  wdir: number,
  wspdTenths: number,
): { eastward: number; northward: number; vertical: 0 } {
  const speed = wspdTenths / 10;
  const dirRad = (wdir * Math.PI) / 180;
  return {
    eastward: -speed * Math.sin(dirRad),
    northward: -speed * Math.cos(dirRad),
    vertical: 0,
  };
}
