'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { lumon } from '@/theme/severance';

/** Matte office: roughness 0.85–0.95, metalness 0. Fluorescent offices are matte. */
const MATTE = { roughness: 0.9, metalness: 0 };

/** Compact platform: neutral floor (no green), symmetry, cubicle dividers. */
const FLOOR_SIZE = 1.8;
const WALL_H = 1.0;
const CUBICLE_H = 0.5;

/** Neutral floor — no green rectangle in live view */
const FLOOR_COLOR = '#E8EAEC';
const DIVIDER_COLOR = '#D0D4D8';

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[FLOOR_SIZE * 2, FLOOR_SIZE * 2]} />
      <meshStandardMaterial color={FLOOR_COLOR} {...MATTE} />
    </mesh>
  );
}

function Walls() {
  return (
    <group>
      <mesh position={[0, WALL_H / 2, -FLOOR_SIZE]} receiveShadow>
        <boxGeometry args={[FLOOR_SIZE * 2.2, WALL_H, 0.08]} />
        <meshStandardMaterial color={lumon.white} {...MATTE} />
      </mesh>
      <mesh position={[-FLOOR_SIZE, WALL_H / 2, 0]} receiveShadow>
        <boxGeometry args={[0.08, WALL_H, FLOOR_SIZE * 2.2]} />
        <meshStandardMaterial color={lumon.white} {...MATTE} />
      </mesh>
      <mesh position={[-FLOOR_SIZE + 0.02, WALL_H * 0.4, 0]}>
        <boxGeometry args={[0.03, 0.25, FLOOR_SIZE * 2]} />
        <meshStandardMaterial color={lumon.fluorescentBlue} {...MATTE} />
      </mesh>
    </group>
  );
}

function Divider({
  position,
  rotation = 0,
  length,
}: {
  position: [number, number, number];
  rotation?: number;
  length: number;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, CUBICLE_H / 2, 0]}>
        <boxGeometry args={[length, CUBICLE_H, 0.03]} />
        <meshStandardMaterial color={DIVIDER_COLOR} {...MATTE} />
      </mesh>
    </group>
  );
}

/** Monitor glow flicker when working — sells "working" without heavy animation. */
function MonitorGlow() {
  const ref = useRef<THREE.MeshStandardMaterial>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const flicker = 0.03 + Math.sin(state.clock.elapsedTime * 8) * 0.015;
    ref.current.emissiveIntensity = flicker;
  });
  return (
    <mesh position={[0, 0.35, 0.03]}>
      <planeGeometry args={[0.16, 0.12]} />
      <meshStandardMaterial
        ref={ref}
        color={lumon.fluorescentBlue}
        emissive={lumon.fluorescentBlue}
        emissiveIntensity={0.03}
        {...MATTE}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function Desk({
  position,
  alertGlow,
  workingGlow,
}: {
  position: [number, number, number];
  alertGlow?: boolean;
  workingGlow?: boolean;
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.38, 0.03, 0.28]} />
        <meshStandardMaterial color={lumon.white} {...MATTE} />
      </mesh>
      <mesh position={[0, 0.28, 0.02]}>
        <boxGeometry args={[0.18, 0.14, 0.02]} />
        <meshStandardMaterial color={lumon.ink} {...MATTE} />
      </mesh>
      {workingGlow && <MonitorGlow />}
      <mesh position={[0, 0.24, -0.1]}>
        <boxGeometry args={[0.06, 0.1, 0.06]} />
        <meshStandardMaterial color={lumon.white} {...MATTE} />
      </mesh>
      {alertGlow && (
        <pointLight color={lumon.alert} intensity={0.25} distance={0.8} position={[0, 0.2, 0]} />
      )}
    </group>
  );
}

const DESKS: { position: [number, number, number]; deskId: string }[] = [
  { position: [0.75, 0, 0.75], deskId: 'desk-1' },
  { position: [-0.75, 0, 0.75], deskId: 'desk-2' },
  { position: [0.75, 0, -0.75], deskId: 'desk-3' },
  { position: [-0.75, 0, -0.75], deskId: 'desk-4' },
];

export function MiniOffice({
  deskStatus,
}: {
  deskStatus?: Record<string, 'idle' | 'working' | 'alert'>;
}) {
  return (
    <group>
      <Floor />
      <Walls />
      <Divider position={[0, 0, 0.75]} length={1.6} />
      <Divider position={[0.75, 0, 0]} rotation={Math.PI / 2} length={1.6} />
      <Divider position={[-0.75, 0, 0]} rotation={Math.PI / 2} length={1.6} />
      <Divider position={[0, 0, -0.75]} length={1.6} />
      {DESKS.map((d) => (
        <Desk
          key={d.deskId}
          position={d.position}
          alertGlow={deskStatus?.[d.deskId] === 'alert'}
          workingGlow={deskStatus?.[d.deskId] === 'working'}
        />
      ))}
    </group>
  );
}
