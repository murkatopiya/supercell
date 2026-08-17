export interface ClientRectBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Convert a client pointer position to NDC for the given canvas box.
 * Does not unproject and does not pick a 3D point.
 */
export function pointerNdcFromClientRect(
  clientX: number,
  clientY: number,
  rect: ClientRectBox,
): { x: number; y: number } | null {
  if (
    !Number.isFinite(clientX) ||
    !Number.isFinite(clientY) ||
    !Number.isFinite(rect.left) ||
    !Number.isFinite(rect.top) ||
    !Number.isFinite(rect.width) ||
    !Number.isFinite(rect.height) ||
    !(rect.width > 0) ||
    !(rect.height > 0)
  ) {
    return null;
  }

  return {
    x: ((clientX - rect.left) / rect.width) * 2 - 1,
    y: -((clientY - rect.top) / rect.height) * 2 + 1,
  };
}
