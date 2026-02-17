/**
 * 2D office layout for PixiJS. Fixed viewport, top-down.
 * All positions in world pixels (used by PixiJS).
 */
export const VIEW_WIDTH = 640;
export const VIEW_HEIGHT = 400;

/** Desk positions (center of desk in px). deskId matches persona store. */
export const DESKS = [
  { id: 'desk-1', x: 140, y: 120 },
  { id: 'desk-2', x: 280, y: 120 },
  { id: 'desk-3', x: 140, y: 260 },
  { id: 'desk-4', x: 280, y: 260 },
] as const;

export const PRINTER = { x: 460, y: 100 };
export const COFFEE = { x: 460, y: 280 };

/** Waypoints for short walks: desk -> printer or coffee -> back to desk */
export type WaypointId = 'desk-1' | 'desk-2' | 'desk-3' | 'desk-4' | 'printer' | 'coffee';

export function getDeskPosition(deskId: string): { x: number; y: number } {
  const d = DESKS.find((d) => d.id === deskId);
  return d ? { x: d.x, y: d.y } : { x: 140, y: 120 };
}

export function getWaypoint(id: WaypointId): { x: number; y: number } {
  if (id === 'printer') return PRINTER;
  if (id === 'coffee') return COFFEE;
  return getDeskPosition(id);
}
