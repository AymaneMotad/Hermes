import { create } from 'zustand';
import type { Persona, PersonaStatus } from '@/types/persona';
import { getDeskPosition } from '@/lib/officeLayout';

/** Agent animation state for 2D FSM: idle, typing, stand, walk, sit */
export type AgentPhase = 'idle' | 'typing' | 'stand' | 'walk' | 'sit';

interface PersonaState {
  personas: Persona[];
  selectedPersonaId: string | null;
  agentPhases: Record<string, AgentPhase>;
  setPersonas: (personas: Persona[]) => void;
  updatePersonaStatus: (id: string, status: PersonaStatus, payload?: Partial<Persona>) => void;
  selectPersona: (id: string | null) => void;
  setPersonaPosition: (id: string, position: [number, number]) => void;
  setAgentPhase: (id: string, phase: AgentPhase) => void;
}

const d1 = getDeskPosition('desk-1');
const d2 = getDeskPosition('desk-2');
const d3 = getDeskPosition('desk-3');
const d4 = getDeskPosition('desk-4');
const d5 = getDeskPosition('desk-5');
const d6 = getDeskPosition('desk-6');
const d7 = getDeskPosition('desk-7');
const d8 = getDeskPosition('desk-8');
const d9 = getDeskPosition('desk-9');
const d10 = getDeskPosition('desk-10');
const d11 = getDeskPosition('desk-11');
const d12 = getDeskPosition('desk-12');

const initialPersonas: Persona[] = [
  {
    id: 'openclaw',
    name: 'Alex',
    role: 'research',
    status: 'idle',
    position: [d1.x, d1.y],
    deskId: 'desk-1',
    tasksToday: 8,
    lastActive: '5m ago',
    title: 'Floor Coordinator',
    isCoordinator: true,
    behavior: 'coordinator',
  },
  {
    id: 'sentinel',
    name: 'Sam',
    role: 'monitoring',
    status: 'working',
    position: [d2.x, d2.y],
    deskId: 'desk-2',
    currentTask: 'Network scan',
    tasksToday: 24,
    lastActive: 'Now',
    behavior: 'focused',
  },
  {
    id: 'scribe',
    name: 'Jordan',
    role: 'reporting',
    status: 'idle',
    position: [d3.x, d3.y],
    deskId: 'desk-3',
    tasksToday: 12,
    lastActive: '18m ago',
    behavior: 'social',
  },
  {
    id: 'nexus',
    name: 'Casey',
    role: 'analysis',
    status: 'alert',
    position: [d4.x, d4.y],
    deskId: 'desk-4',
    currentTask: 'Anomaly detection',
    errorMessage: 'Threshold exceeded',
    tasksToday: 31,
    lastActive: 'Now',
    behavior: 'wanderer',
  },
  {
    id: 'atlas',
    name: 'Riley',
    role: 'synthesis',
    status: 'working',
    position: [d5.x, d5.y],
    deskId: 'desk-5',
    currentTask: 'Signal fusion',
    tasksToday: 27,
    lastActive: 'Now',
    behavior: 'focused',
  },
  {
    id: 'watchtower',
    name: 'Morgan',
    role: 'control',
    status: 'idle',
    position: [d6.x, d6.y],
    deskId: 'desk-6',
    tasksToday: 16,
    lastActive: '11m ago',
    behavior: 'coordinator',
  },
  {
    id: 'relay',
    name: 'Taylor',
    role: 'monitoring',
    status: 'working',
    position: [d7.x, d7.y],
    deskId: 'desk-7',
    currentTask: 'Lane synchronization',
    tasksToday: 33,
    lastActive: 'Now',
    behavior: 'social',
  },
  {
    id: 'beacon',
    name: 'Quinn',
    role: 'analysis',
    status: 'idle',
    position: [d8.x, d8.y],
    deskId: 'desk-8',
    tasksToday: 19,
    lastActive: '8m ago',
    behavior: 'wanderer',
  },
  {
    id: 'forge',
    name: 'Harper',
    role: 'research',
    status: 'working',
    position: [d9.x, d9.y],
    deskId: 'desk-9',
    currentTask: 'Scenario synthesis',
    tasksToday: 22,
    lastActive: 'Now',
    behavior: 'focused',
  },
  {
    id: 'pulse',
    name: 'Avery',
    role: 'reporting',
    status: 'idle',
    position: [d10.x, d10.y],
    deskId: 'desk-10',
    tasksToday: 14,
    lastActive: '14m ago',
    behavior: 'social',
  },
  {
    id: 'vector',
    name: 'Parker',
    role: 'synthesis',
    status: 'alert',
    position: [d11.x, d11.y],
    deskId: 'desk-11',
    currentTask: 'Confidence audit',
    errorMessage: 'Escalation policy mismatch',
    tasksToday: 29,
    lastActive: 'Now',
    behavior: 'coordinator',
  },
  {
    id: 'helix',
    name: 'Dakota',
    role: 'control',
    status: 'working',
    position: [d12.x, d12.y],
    deskId: 'desk-12',
    currentTask: 'Fallback routing',
    tasksToday: 35,
    lastActive: 'Now',
    behavior: 'wanderer',
  },
];

export const usePersonaStore = create<PersonaState>((set) => ({
  personas: initialPersonas,
  selectedPersonaId: null,
  agentPhases: {},
  setPersonas: (personas) => set({ personas }),
  updatePersonaStatus: (id, status, payload) =>
    set((state) => ({
      personas: state.personas.map((p) =>
        p.id === id ? { ...p, status, ...payload } : p
      ),
    })),
  selectPersona: (id) => set({ selectedPersonaId: id }),
  setPersonaPosition: (id, position) =>
    set((state) => ({
      personas: state.personas.map((p) =>
        p.id === id ? { ...p, position } : p
      ),
    })),
  setAgentPhase: (id, phase) =>
    set((state) => ({
      agentPhases: { ...state.agentPhases, [id]: phase },
    })),
}));
