/**
 * 2D office layout for PixiJS. Fixed viewport, top-down.
 * All positions in world pixels (used by PixiJS).
 */
export const VIEW_WIDTH = 980;
export const VIEW_HEIGHT = 560;

/** Desk positions (center of desk in px). deskId matches persona store. */
export const DESKS = [
  // desk-1 is reserved for the coordinator's private office.
  { id: 'desk-1', x: 790, y: 118 },
  { id: 'desk-2', x: 170, y: 170 },
  { id: 'desk-3', x: 330, y: 170 },
  { id: 'desk-4', x: 170, y: 320 },
  { id: 'desk-5', x: 330, y: 320 },
] as const;

export const PRINTER = { x: 780, y: 292 };
export const COFFEE = { x: 780, y: 430 };

/** Waypoints for short walks: desk -> printer or coffee -> back to desk */
export type WaypointId =
  | 'desk-1'
  | 'desk-2'
  | 'desk-3'
  | 'desk-4'
  | 'desk-5'
  | 'printer'
  | 'coffee';

export function getDeskPosition(deskId: string): { x: number; y: number } {
  const d = DESKS.find((d) => d.id === deskId);
  return d ? { x: d.x, y: d.y } : { x: DESKS[0].x, y: DESKS[0].y };
}

export function getWaypoint(id: WaypointId): { x: number; y: number } {
  if (id === 'printer') return PRINTER;
  if (id === 'coffee') return COFFEE;
  return getDeskPosition(id);
}
