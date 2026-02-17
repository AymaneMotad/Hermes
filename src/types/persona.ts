export type PersonaStatus = 'idle' | 'working' | 'alert';

export type PersonaRole =
  | 'research'
  | 'monitoring'
  | 'reporting'
  | 'analysis'
  | 'synthesis'
  | 'control';

/** Drives animation and pacing: coordinator, focused, social, wanderer */
export type PersonaBehavior = 'coordinator' | 'focused' | 'social' | 'wanderer';

export interface Persona {
  id: string;
  name: string;
  role: PersonaRole;
  status: PersonaStatus;
  /** 2D position in world pixels (PixiJS) */
  position: [number, number];
  deskId: string;
  currentTask?: string;
  lastActivity?: string;
  errorMessage?: string;
  /** Dashboard stats */
  tasksToday?: number;
  lastActive?: string;
  /** Display title e.g. "Floor Coordinator" */
  title?: string;
  /** Lead/coordinator for the floor */
  isCoordinator?: boolean;
  /** How they move and work in the office */
  behavior?: PersonaBehavior;
}

export interface Desk {
  id: string;
  position: [number, number];
  personaId?: string;
}
