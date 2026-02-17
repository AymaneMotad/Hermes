/**
 * 2D office layout for PixiJS. Fixed viewport, top-down.
 * All positions in world pixels (used by PixiJS).
 */
export const VIEW_WIDTH = 980;
export const VIEW_HEIGHT = 560;

/** Desk positions (center of desk in px). deskId matches persona store. */
export const DESKS = [
  { id: 'desk-1', x: 140, y: 120 },
  { id: 'desk-2', x: 280, y: 120 },
  { id: 'desk-3', x: 420, y: 120 },
  { id: 'desk-4', x: 560, y: 120 },
  { id: 'desk-5', x: 140, y: 250 },
  { id: 'desk-6', x: 280, y: 250 },
  { id: 'desk-7', x: 420, y: 250 },
  { id: 'desk-8', x: 560, y: 250 },
  { id: 'desk-9', x: 140, y: 380 },
  { id: 'desk-10', x: 280, y: 380 },
  { id: 'desk-11', x: 420, y: 380 },
  { id: 'desk-12', x: 560, y: 380 },
] as const;

export const PRINTER = { x: 820, y: 150 };
export const COFFEE = { x: 820, y: 380 };

/** Waypoints for short walks: desk -> printer or coffee -> back to desk */
export type WaypointId =
  | 'desk-1'
  | 'desk-2'
  | 'desk-3'
  | 'desk-4'
  | 'desk-5'
  | 'desk-6'
  | 'desk-7'
  | 'desk-8'
  | 'desk-9'
  | 'desk-10'
  | 'desk-11'
  | 'desk-12'
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
