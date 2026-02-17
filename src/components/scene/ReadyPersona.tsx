'use client';

import { useRef, useState, useMemo, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import type { Persona as PersonaType, PersonaStatus } from '@/types/persona';
import { severance } from '@/theme/severance';
import {
  BEHAVIOR_CONFIG,
  COORDINATOR_CHAT_LINES,
  OFFICE_CHAT_LINES,
} from './behaviorConfig';
import { CHARACTER_GLB_URL, CHARACTER_SCALE } from '@/lib/modelUrls';

interface ReadyPersonaProps {
  data: PersonaType;
  isSelected: boolean;
  onClick: () => void;
}

const WAYPOINTS: [number, number][] = [
  [1.2, 1.2],
  [-1.2, 1.2],
  [1.2, -1.2],
  [-1.2, -1.2],
  [0, 0],
];

type Phase = 'at_desk' | 'walking' | 'chatting';

function StatusDot({ status }: { status: PersonaStatus }) {
  const c =
    status === 'alert' ? severance.alert : status === 'working' ? severance.working : severance.idle;
  return (
    <mesh position={[0, 0.9, 0]}>
      <sphereGeometry args={[0.06, 8, 6]} />
      <meshBasicMaterial color={c} />
    </mesh>
  );
}

/** Ready-made GLB character with our animation logic (position, phase, chat). */
function ReadyPersonaInner({ data, isSelected, onClick }: ReadyPersonaProps) {
  const { scene } = useGLTF(CHARACTER_GLB_URL);
  const clone = useMemo(() => scene.clone(true), [scene]);

  const groupRef = useRef<THREE.Group>(null);
  const positionRef = useRef(
    new THREE.Vector3(data.position[0], data.position[1], data.position[2])
  );
  const waypointRef = useRef<[number, number] | null>(null);
  const phaseRef = useRef<Phase>('at_desk');
  const phaseEndTimeRef = useRef(0);
  const walkBobRef = useRef(0);
  const idleTimeRef = useRef(0);
  const [chatMessage, setChatMessage] = useState<string | null>(null);

  const behavior = data.behavior ?? 'focused';
  const config = BEHAVIOR_CONFIG[behavior];
  const deskIndex = useMemo(
    () =>
      WAYPOINTS.findIndex(
        ([x, z]) =>
          Math.abs(x - data.position[0]) < 0.3 && Math.abs(z - data.position[2]) < 0.3
      ),
    [data.position]
  );
  const homeDesk = useMemo(
    () => WAYPOINTS[deskIndex >= 0 ? deskIndex : 0],
    [deskIndex]
  );
  const { position: storePosition, status, isCoordinator } = data;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const dt = state.clock.getDelta();
    const pos = positionRef.current;
    const group = groupRef.current;
    if (!group) return;

    if (phaseRef.current === 'at_desk') {
      idleTimeRef.current += dt;
      if (t >= phaseEndTimeRef.current) {
        phaseRef.current = 'walking';
        waypointRef.current =
          Math.random() < config.goToCenterChance
            ? [0, 0]
            : (() => {
                const otherDesks = WAYPOINTS.filter((_, i) => i < 4 && i !== deskIndex);
                return otherDesks[Math.floor(Math.random() * otherDesks.length)] ?? homeDesk;
              })();
      }
      pos.lerp(
        new THREE.Vector3(storePosition[0], storePosition[1], storePosition[2]),
        0.06
      );
      walkBobRef.current = 0;
      group.rotation.z = THREE.MathUtils.lerp(group.rotation.z, 0, 0.08);
    } else if (phaseRef.current === 'walking' && waypointRef.current) {
      const [wx, wz] = waypointRef.current;
      const target = new THREE.Vector3(wx, 0, wz);
      const dist = pos.distanceTo(target);
      const arrival = 0.06;
      if (dist < arrival) {
        const atCenter = Math.abs(wx) < 0.1 && Math.abs(wz) < 0.1;
        waypointRef.current = null;
        if (atCenter && Math.random() < config.chatAtCenterChance) {
          phaseRef.current = 'chatting';
          const chatDur =
            config.chatDurationMin +
            Math.random() * (config.chatDurationMax - config.chatDurationMin);
          phaseEndTimeRef.current = t + chatDur;
          const lines = isCoordinator ? COORDINATOR_CHAT_LINES : OFFICE_CHAT_LINES;
          setChatMessage(lines[Math.floor(Math.random() * lines.length)] ?? '');
        } else {
          phaseRef.current = 'at_desk';
          phaseEndTimeRef.current =
            t + config.atDeskMin + Math.random() * (config.atDeskMax - config.atDeskMin);
        }
      } else {
        const speedFactor = dist > 0.25 ? 1.2 : 0.65;
        pos.lerp(target, config.walkSpeed * 0.018 * speedFactor);
        walkBobRef.current += 0.22;
        group.rotation.z = Math.sin(walkBobRef.current * 0.5) * 0.025;
      }
      const angle = Math.atan2(wx - pos.x, wz - pos.z);
      group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, angle, 0.12);
    } else if (phaseRef.current === 'chatting') {
      if (t >= phaseEndTimeRef.current) {
        setChatMessage(null);
        phaseRef.current = 'walking';
        const otherDesks = WAYPOINTS.filter((_, i) => i < 4 && i !== deskIndex);
        const next = otherDesks[Math.floor(Math.random() * otherDesks.length)] ?? homeDesk;
        waypointRef.current = next;
      }
      const toDesk = new THREE.Vector3(homeDesk[0], 0, homeDesk[1]);
      pos.lerp(toDesk, 0.025);
      const angle = Math.atan2(homeDesk[0] - pos.x, homeDesk[1] - pos.z);
      group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, angle, 0.08);
      group.rotation.z = THREE.MathUtils.lerp(group.rotation.z, 0, 0.08);
    }

    const bob = Math.sin(walkBobRef.current) * 0.014;
    group.position.set(pos.x, pos.y + bob, pos.z);
  });

  useFrame((state) => {
    if (phaseRef.current === 'at_desk' && phaseEndTimeRef.current === 0) {
      phaseEndTimeRef.current =
        state.clock.elapsedTime +
        config.atDeskMin +
        Math.random() * (config.atDeskMax - config.atDeskMin);
    }
  });

  return (
    <group
      ref={groupRef}
      position={[data.position[0], data.position[1], data.position[2]]}
      onClick={(e) => (e.stopPropagation(), onClick())}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'default')}
    >
      {isSelected && (
        <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.22, 0.28, 28]} />
          <meshBasicMaterial color={severance.lumonBlue} transparent opacity={0.5} />
        </mesh>
      )}
      <StatusDot status={status} />
      <primitive
        object={clone}
        scale={CHARACTER_SCALE}
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
      />
      {chatMessage && (
        <Html
          position={[0, 1.1, 0]}
          center
          distanceFactor={4}
          style={{
            pointerEvents: 'none',
            userSelect: 'none',
            whiteSpace: 'nowrap',
            fontFamily: 'var(--font-ibm), system-ui, sans-serif',
            fontSize: 10,
            color: severance.ink,
            background: severance.wall,
            padding: '4px 8px',
            borderRadius: 6,
            border: `1px solid ${severance.carpetLight}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          }}
        >
          {chatMessage}
        </Html>
      )}
    </group>
  );
}

export function ReadyPersona(props: ReadyPersonaProps) {
  return (
    <Suspense fallback={null}>
      <ReadyPersonaInner {...props} />
    </Suspense>
  );
}

useGLTF.preload(CHARACTER_GLB_URL);
