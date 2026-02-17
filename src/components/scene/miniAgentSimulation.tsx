'use client';

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  type ReactNode,
} from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Persona } from '@/types/persona';
import { usePersonaStore, type AgentPhase } from '@/store/usePersonaStore';
import { BEHAVIOR_CONFIG } from './behaviorConfig';

const WAYPOINTS: [number, number][] = [
  [0.75, 0.75],
  [-0.75, 0.75],
  [0.75, -0.75],
  [-0.75, -0.75],
  [0, 0],
];

/** Max agents walking at once (so movement is visible but not chaotic). */
const MAX_MOVING_AGENTS = 4;
/** Max agents in chat at once (2 agents max for a chat event) */
const MAX_CHATTING_AGENTS = 2;

/** Acceleration / deceleration (smooth start and stop) */
const ACCEL_RATE = 0.08;
const DECEL_THRESHOLD = 0.12;
const ARRIVAL_THRESHOLD = 0.04;
/** Turn before walk: only move forward when facing within this (radians) */
const TURN_ALIGN_THRESHOLD = 0.15;
const ROTATION_LERP = 0.06;
/** Walking posture: forward lean 5–8° (radians), subtle bob */
const WALK_LEAN_RAD = 0.1;
const BOB_AMPLITUDE = 0.008;
const BOB_FREQ = 4;

export interface AgentRefs {
  group: THREE.Group;
  body: THREE.Group;
  head: THREE.Group;
}

type MiniSimPhase = 'at_desk' | 'walking' | 'chatting';

type AgentSimState = {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  currentSpeed: number;
  waypoint: [number, number] | null;
  phase: MiniSimPhase;
  phaseEndTime: number;
  idleTime: number;
  walkTime: number;
  groupRotationY: number;
  groupRotationZ: number;
  bodyRotationX: number;
  headRotationX: number;
  headRotationY: number;
};

const toSceneVector = (position: [number, number]): THREE.Vector3 =>
  new THREE.Vector3(position[0], 0, position[1]);

const toStorePhase = (phase: MiniSimPhase): AgentPhase => {
  if (phase === 'walking') return 'walk';
  if (phase === 'chatting') return 'stand';
  return 'typing';
};

const defaultState = (position: [number, number]): AgentSimState => ({
  position: toSceneVector(position),
  velocity: new THREE.Vector3(0, 0, 0),
  currentSpeed: 0,
  waypoint: null,
  phase: 'at_desk',
  phaseEndTime: 0,
  idleTime: 0,
  walkTime: 0,
  groupRotationY: 0,
  groupRotationZ: 0,
  bodyRotationX: 0.08,
  headRotationX: 0.05,
  headRotationY: 0,
});

const POSE_SCALE = 1.5;

const MiniSimulationContext = createContext<{
  registerRefs: (id: string, refs: AgentRefs) => void;
  unregisterRefs: (id: string) => void;
} | null>(null);

export function useMiniSimulation() {
  const ctx = useContext(MiniSimulationContext);
  if (!ctx) throw new Error('useMiniSimulation must be used inside MiniSimulationProvider');
  return ctx;
}

export function MiniSimulationProvider({
  children,
  personas,
}: {
  children: ReactNode;
  personas: Persona[];
}) {
  const refsMap = useRef<Map<string, AgentRefs>>(new Map());
  const stateMap = useRef<Map<string, AgentSimState>>(new Map());
  const setAgentPhase = usePersonaStore((s) => s.setAgentPhase);

  const registerRefs = useCallback((id: string, refs: AgentRefs) => {
    refsMap.current.set(id, refs);
  }, []);

  const unregisterRefs = useCallback((id: string) => {
    refsMap.current.delete(id);
    stateMap.current.delete(id);
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const dt = state.clock.getDelta();

    // Lumon rule: count agents currently moving (walking or chatting)
    let movingCount = 0;
    let chattingCount = 0;
    for (const p of personas) {
      const sim = stateMap.current.get(p.id);
      if (!sim) continue;
      if (sim.phase === 'walking' || sim.phase === 'chatting') movingCount++;
      if (sim.phase === 'chatting') chattingCount++;
    }
    let newWalkersThisFrame = 0;

    for (const p of personas) {
      const refs = refsMap.current.get(p.id);
      if (!refs) continue;

      const config = BEHAVIOR_CONFIG[p.behavior ?? 'focused'];

      let sim = stateMap.current.get(p.id);
      if (!sim) {
        sim = defaultState(p.position);
        sim.phaseEndTime = t + config.atDeskMin + Math.random() * (config.atDeskMax - config.atDeskMin);
        stateMap.current.set(p.id, sim);
      }
      const deskIndex = WAYPOINTS.findIndex(
        ([x, z]) => Math.abs(x - p.position[0]) < 0.2 && Math.abs(z - p.position[1]) < 0.2
      );
      const homeDesk = WAYPOINTS[deskIndex >= 0 ? deskIndex : 0];
      const storePos = toSceneVector(p.position);
      const isAlert = p.status === 'alert';

      if (sim.phase === 'at_desk') {
        sim.idleTime += dt;
        sim.walkTime = 0;
        sim.currentSpeed = 0;
        sim.velocity.set(0, 0, 0);

        // Only consider leaving desk when phaseEndTime reached AND Lumon rule: max 1–2 moving
        const mayLeave =
          t >= sim.phaseEndTime &&
          movingCount + newWalkersThisFrame < MAX_MOVING_AGENTS &&
          Math.random() < config.leaveDeskChance;

        if (mayLeave) {
          newWalkersThisFrame += 1;
          sim.phase = 'walking';
          sim.waypoint =
            Math.random() < config.goToCenterChance
              ? [0, 0]
              : (() => {
                  const otherDesks = WAYPOINTS.filter((_, i) => i < 4 && i !== deskIndex);
                  return otherDesks[Math.floor(Math.random() * otherDesks.length)] ?? homeDesk;
                })();
          sim.phaseEndTime = 0;
        } else if (t >= sim.phaseEndTime) {
          // Stay at desk longer: reschedule next check (85–90% at desk)
          sim.phaseEndTime =
            t + config.atDeskMin + Math.random() * (config.atDeskMax - config.atDeskMin);
        }

        sim.position.lerp(storePos, 0.06);
        sim.groupRotationZ = THREE.MathUtils.lerp(sim.groupRotationZ, 0, 0.08);
        const lean = 0.08 * POSE_SCALE;
        const shoulderMicro = Math.sin(sim.idleTime * 2.5) * 0.015 * POSE_SCALE;
        const headNod = Math.sin(sim.idleTime * 0.8) * 0.04 * POSE_SCALE;
        sim.bodyRotationX = THREE.MathUtils.lerp(sim.bodyRotationX, lean + shoulderMicro, 0.06);
        sim.headRotationX = 0.05 + headNod + Math.sin(sim.idleTime * 1.2) * 0.02 * POSE_SCALE;
        sim.headRotationY = Math.sin(sim.idleTime * 0.7) * 0.03 * POSE_SCALE;
      } else if (sim.phase === 'walking' && sim.waypoint) {
        const [wx, wz] = sim.waypoint;
        const target = new THREE.Vector3(wx, 0, wz);
        const toTarget = target.clone().sub(sim.position);
        const dist = toTarget.length();
        const arrival = ARRIVAL_THRESHOLD;

        if (dist < arrival) {
          const atCenter = Math.abs(wx) < 0.1 && Math.abs(wz) < 0.1;
          sim.waypoint = null;
          sim.currentSpeed = 0;
          sim.velocity.set(0, 0, 0);
          if (atCenter && chattingCount < MAX_CHATTING_AGENTS && Math.random() < config.chatAtCenterChance) {
            sim.phase = 'chatting';
            const chatDur =
              config.chatDurationMin +
              Math.random() * (config.chatDurationMax - config.chatDurationMin);
            sim.phaseEndTime = t + chatDur;
          } else {
            sim.phase = 'at_desk';
            sim.phaseEndTime =
              t + config.atDeskMin + Math.random() * (config.atDeskMax - config.atDeskMin);
          }
        } else {
          sim.walkTime += dt;
          const targetAngle = Math.atan2(wx - sim.position.x, wz - sim.position.z);
          // Smooth rotation: turn toward waypoint (no snap)
          sim.groupRotationY = THREE.MathUtils.lerp(sim.groupRotationY, targetAngle, ROTATION_LERP);
          let angleDiff = sim.groupRotationY - targetAngle;
          while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
          while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
          const aligned = Math.abs(angleDiff) < TURN_ALIGN_THRESHOLD;

          // Acceleration / deceleration: target speed reduces near destination
          const baseSpeed = config.walkSpeed * 0.5;
          const targetSpeed = aligned
            ? dist < DECEL_THRESHOLD
              ? baseSpeed * (dist / DECEL_THRESHOLD)
              : baseSpeed
            : 0;
          sim.currentSpeed = THREE.MathUtils.lerp(sim.currentSpeed, targetSpeed, ACCEL_RATE);

          if (aligned && sim.currentSpeed > 0.001) {
            toTarget.normalize();
            sim.velocity.copy(toTarget).multiplyScalar(sim.currentSpeed);
            sim.position.add(sim.velocity.clone().multiplyScalar(dt));
          }

          // Walking posture: slight forward lean (5–8°), subtle vertical bob
          sim.groupRotationZ = Math.sin(sim.walkTime * BOB_FREQ) * 0.012 * POSE_SCALE;
          sim.bodyRotationX = THREE.MathUtils.lerp(sim.bodyRotationX, WALK_LEAN_RAD * POSE_SCALE, 0.08);
          sim.headRotationX = THREE.MathUtils.lerp(sim.headRotationX, 0.02, 0.1);
          sim.headRotationY = THREE.MathUtils.lerp(sim.headRotationY, 0, 0.1);
        }
      } else if (sim.phase === 'chatting') {
        if (t >= sim.phaseEndTime) {
          sim.phase = 'walking';
          const otherDesks = WAYPOINTS.filter((_, i) => i < 4 && i !== deskIndex);
          const next = otherDesks[Math.floor(Math.random() * otherDesks.length)] ?? homeDesk;
          sim.waypoint = next;
        }
        const toDesk = new THREE.Vector3(homeDesk[0], 0, homeDesk[1]);
        sim.position.lerp(toDesk, 0.02);
        const angle = Math.atan2(homeDesk[0] - sim.position.x, homeDesk[1] - sim.position.z);
        sim.groupRotationY = THREE.MathUtils.lerp(sim.groupRotationY, angle, 0.06);
        sim.groupRotationZ = THREE.MathUtils.lerp(sim.groupRotationZ, 0, 0.08);
      }

      if (refs.group.userData?.lastPhase !== sim.phase) {
        refs.group.userData.lastPhase = sim.phase;
        setAgentPhase(p.id, toStorePhase(sim.phase));
      }

      const bob = Math.sin(sim.walkTime * BOB_FREQ) * BOB_AMPLITUDE;
      refs.group.position.set(sim.position.x, sim.position.y + bob, sim.position.z);
      refs.group.rotation.y = sim.groupRotationY;
      refs.group.rotation.z = sim.groupRotationZ;

      const breathe = Math.sin(t * 0.8) * 0.01;
      refs.body.position.y = breathe;
      refs.body.rotation.x = sim.bodyRotationX;
      if (isAlert) {
        refs.body.rotation.x = THREE.MathUtils.lerp(refs.body.rotation.x, 0, 0.15);
        refs.head.rotation.x = THREE.MathUtils.lerp(refs.head.rotation.x, 0.1, 0.15);
        refs.head.rotation.y = sim.headRotationY;
      } else {
        refs.head.rotation.x = sim.headRotationX;
        refs.head.rotation.y = sim.headRotationY;
      }
    }
  });

  return (
    <MiniSimulationContext.Provider value={{ registerRefs, unregisterRefs }}>
      {children}
    </MiniSimulationContext.Provider>
  );
}
