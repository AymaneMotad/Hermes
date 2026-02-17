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

type InternalState = {
  phase: AgentPhase;
  targetX: number;
  targetY: number;
  phaseEndTime: number;
  destinationMode: 'service' | 'desk';
  nextService: 'printer' | 'coffee';
};

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function useOfficeFSM(personas: Persona[]) {
  const setPosition = usePersonaStore((s) => s.setPersonaPosition);
  const setPhase = usePersonaStore((s) => s.setAgentPhase);
  const stateRef = useRef<Map<string, InternalState>>(new Map());
  const timeRef = useRef(0);

  useEffect(() => {
    personas.forEach((p) => {
      if (!stateRef.current.has(p.id)) {
        const desk = getDeskPosition(p.deskId);
        stateRef.current.set(p.id, {
          phase: 'typing',
          targetX: desk.x,
          targetY: desk.y,
          phaseEndTime: 0,
          destinationMode: 'service',
          nextService: Math.random() < 0.5 ? 'printer' : 'coffee',
        });
      }
    });

    const interval = setInterval(() => {
      timeRef.current += TICK_MS;
      const t = timeRef.current;

      personas.forEach((persona) => {
        const state = stateRef.current.get(persona.id);
        if (!state) return;

        const [px, py] = persona.position;
        const desk = getDeskPosition(persona.deskId);

        if (state.phase === 'typing') {
          if (state.phaseEndTime === 0)
            state.phaseEndTime = t + getRandomInt(SIT_TYPING_MIN_MS, SIT_TYPING_MAX_MS);
          if (t < state.phaseEndTime) return;
          state.phase = 'stand';
          state.phaseEndTime = t + STAND_DURATION_MS;
          state.targetX = -1;
          state.targetY = -1;
          setPhase(persona.id, 'stand');
          return;
        }

        if (state.phase === 'stand') {
          if (t < state.phaseEndTime) return;
          state.phase = 'walk';
          if (state.destinationMode === 'desk') {
            state.targetX = desk.x;
            state.targetY = desk.y;
          } else {
            const service = getWaypoint(state.nextService);
            state.targetX = service.x;
            state.targetY = service.y;
          }
          setPhase(persona.id, 'walk');
          return;
        }

        if (state.phase === 'walk') {
          const dx = state.targetX - px;
          const dy = state.targetY - py;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < ARRIVAL_DIST) {
            setPosition(persona.id, [state.targetX, state.targetY]);
            const atPrinter = Math.abs(state.targetX - getWaypoint('printer').x) < 10;
            const atCoffee = Math.abs(state.targetX - getWaypoint('coffee').x) < 10;
            if (atPrinter || atCoffee) {
              state.phase = 'stand';
              state.phaseEndTime = t + STAND_DURATION_MS;
              state.destinationMode = 'desk';
              state.nextService = atPrinter ? 'coffee' : 'printer';
              state.targetX = desk.x;
              state.targetY = desk.y;
              setPhase(persona.id, 'stand');
              return;
            }
            state.phase = 'sit';
            setPhase(persona.id, 'sit');
            state.phaseEndTime = t + 200;
            return;
          }
          const nx = px + (dx / dist) * WALK_SPEED * (TICK_MS / 16);
          const ny = py + (dy / dist) * WALK_SPEED * (TICK_MS / 16);
          setPosition(persona.id, [nx, ny]);
          return;
        }

        if (state.phase === 'sit') {
          if (t < state.phaseEndTime) return;
          state.phase = 'typing';
          state.destinationMode = 'service';
          state.phaseEndTime =
            t + getRandomInt(SIT_TYPING_MIN_MS, SIT_TYPING_MAX_MS);
          setPhase(persona.id, 'typing');
        }
      });
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [personas, setPosition, setPhase]);
}
