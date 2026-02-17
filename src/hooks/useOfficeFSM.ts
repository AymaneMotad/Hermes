'use client';

import { useEffect, useRef } from 'react';
import type { Persona } from '@/types/persona';
import type { AgentPhase } from '@/store/usePersonaStore';
import { usePersonaStore } from '@/store/usePersonaStore';
import { getDeskPosition, getWaypoint } from '@/lib/officeLayout';

const TICK_MS = 120;
const WALK_SPEED = 2.2;
const SIT_TYPING_MIN_MS = 3000;
const SIT_TYPING_MAX_MS = 10000;
const STAND_DURATION_MS = 600;
const ARRIVAL_DIST = 6;
const MAX_WALK_DURATION_MS = 16000;

type InternalState = {
  phase: AgentPhase;
  posX: number;
  posY: number;
  targetX: number;
  targetY: number;
  phaseEndTime: number;
  walkStartTime: number;
  route: 'at_desk' | 'to_service' | 'at_service' | 'to_desk';
  nextService: 'printer' | 'coffee';
};

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function useOfficeFSM(personas: Persona[]) {
  const setPosition = usePersonaStore((s) => s.setPersonaPosition);
  const setPhase = usePersonaStore((s) => s.setAgentPhase);
  const stateRef = useRef<Map<string, InternalState>>(new Map());
  const personasRef = useRef<Persona[]>(personas);
  const lastTickMsRef = useRef(0);

  useEffect(() => {
    personasRef.current = personas;
  }, [personas]);

  useEffect(() => {
    lastTickMsRef.current = performance.now();
    const interval = setInterval(() => {
      const now = performance.now();
      const deltaMs = Math.max(1, now - lastTickMsRef.current);
      lastTickMsRef.current = now;
      const t = now;

      const currentPersonas = personasRef.current;
      const activeIds = new Set(currentPersonas.map((p) => p.id));
      for (const p of currentPersonas) {
        if (!stateRef.current.has(p.id)) {
          const desk = getDeskPosition(p.deskId);
          stateRef.current.set(p.id, {
            phase: 'typing',
            posX: p.position[0],
            posY: p.position[1],
            targetX: desk.x,
            targetY: desk.y,
            phaseEndTime: 0,
            walkStartTime: 0,
            route: 'at_desk',
            nextService: Math.random() < 0.5 ? 'printer' : 'coffee',
          });
        }
      }
      for (const id of stateRef.current.keys()) {
        if (!activeIds.has(id)) stateRef.current.delete(id);
      }

      currentPersonas.forEach((persona) => {
        const state = stateRef.current.get(persona.id);
        if (!state) return;

        const [storeX, storeY] = persona.position;
        if (state.phase !== 'walk' && (Math.abs(storeX - state.posX) > 0.5 || Math.abs(storeY - state.posY) > 0.5)) {
          state.posX = storeX;
          state.posY = storeY;
        }
        const desk = getDeskPosition(persona.deskId);

        if (state.phase === 'typing') {
          if (state.phaseEndTime === 0)
            state.phaseEndTime = t + getRandomInt(SIT_TYPING_MIN_MS, SIT_TYPING_MAX_MS);
          if (t < state.phaseEndTime) return;
          state.phase = 'stand';
          state.route = 'to_service';
          state.phaseEndTime = t + STAND_DURATION_MS;
          setPhase(persona.id, 'stand');
          return;
        }

        if (state.phase === 'stand') {
          if (t < state.phaseEndTime) return;
          if (state.route === 'to_service') {
            state.phase = 'walk';
            state.walkStartTime = t;
            const service = getWaypoint(state.nextService);
            state.targetX = service.x;
            state.targetY = service.y;
            setPhase(persona.id, 'walk');
            return;
          }
          if (state.route === 'at_service') {
            state.route = 'to_desk';
            state.phase = 'walk';
            state.walkStartTime = t;
            state.targetX = desk.x;
            state.targetY = desk.y;
            setPhase(persona.id, 'walk');
            return;
          }
          // Guard rail: unexpected stand state returns to desk path.
          state.route = 'to_desk';
          state.phase = 'walk';
          state.walkStartTime = t;
          state.targetX = desk.x;
          state.targetY = desk.y;
          setPhase(persona.id, 'walk');
          return;
        }

        if (state.phase === 'walk') {
          const elapsedWalk = t - state.walkStartTime;
          if (elapsedWalk > MAX_WALK_DURATION_MS) {
            // Safety valve: never allow endless walk loops.
            state.posX = state.targetX;
            state.posY = state.targetY;
            setPosition(persona.id, [state.posX, state.posY]);
            state.phase = 'stand';
            state.phaseEndTime = t + STAND_DURATION_MS;
            state.route = 'at_service';
            setPhase(persona.id, 'stand');
            return;
          }

          const dx = state.targetX - state.posX;
          const dy = state.targetY - state.posY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const stepPerTick = WALK_SPEED * (deltaMs / 16);
          // Clamp to remaining distance so we never overshoot and bounce forever.
          if (dist < ARRIVAL_DIST || dist <= stepPerTick) {
            state.posX = state.targetX;
            state.posY = state.targetY;
            setPosition(persona.id, [state.posX, state.posY]);
            if (state.route === 'to_service') {
              const justVisited = state.nextService;
              state.nextService = justVisited === 'printer' ? 'coffee' : 'printer';
              state.phase = 'stand';
              state.phaseEndTime = t + STAND_DURATION_MS;
              state.route = 'at_service';
              state.walkStartTime = 0;
              setPhase(persona.id, 'stand');
              return;
            }
            if (state.route === 'to_desk') {
              state.phase = 'sit';
              state.phaseEndTime = t + 200;
              state.walkStartTime = 0;
              state.route = 'at_desk';
              setPhase(persona.id, 'sit');
              return;
            }
            // Guard rail: unknown route on arrival, reset at desk loop.
            state.phase = 'sit';
            state.phaseEndTime = t + 200;
            state.walkStartTime = 0;
            state.route = 'at_desk';
            setPhase(persona.id, 'sit');
            return;
          }
          const step = Math.min(stepPerTick, dist);
          state.posX = state.posX + (dx / dist) * step;
          state.posY = state.posY + (dy / dist) * step;
          setPosition(persona.id, [state.posX, state.posY]);
          return;
        }

        if (state.phase === 'sit') {
          if (t < state.phaseEndTime) return;
          state.phase = 'typing';
          state.route = 'at_desk';
          state.phaseEndTime =
            t + getRandomInt(SIT_TYPING_MIN_MS, SIT_TYPING_MAX_MS);
          state.walkStartTime = 0;
          setPhase(persona.id, 'typing');
        }
      });
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [setPosition, setPhase]);
}
