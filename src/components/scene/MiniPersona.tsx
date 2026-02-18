'use client';

import { useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Persona as PersonaType, PersonaStatus, PersonaBehavior } from '@/types/persona';
import { lumon, ROLE_ACCENT } from '@/theme/severance';
import { usePersonaStore } from '@/store/usePersonaStore';
import { useMiniSimulation } from './miniAgentSimulation';

interface MiniPersonaProps {
  data: PersonaType;
  isSelected: boolean;
  onClick: () => void;
}

/** Lumon agent color: torso base, sleeve darker, role accent stripe. Low saturation. */
function agentColors(
  name: string,
  behavior: PersonaBehavior
): { body: string; head: string; sleeve: string; accent: string } {
  const accent = ROLE_ACCENT[behavior];
  switch (name) {
    case 'Alex':
      return {
        body: lumon.alexBlazer,
        head: lumon.alexShirt,
        sleeve: '#9bb2c8',
        accent,
      };
    case 'Sam':
      return {
        body: lumon.samCardigan,
        head: lumon.samShirt,
        sleeve: '#3a4647',
        accent,
      };
    case 'Jordan':
      return {
        body: lumon.jordanBlazer,
        head: lumon.jordanBlouse,
        sleeve: '#8a7868',
        accent,
      };
    case 'Casey':
      return {
        body: lumon.caseyBlazer,
        head: lumon.caseyShirt,
        sleeve: '#3e4a52',
        accent,
      };
    default:
      return {
        body: lumon.fluorescentBlue,
        head: lumon.white,
        sleeve: lumon.inkMuted,
        accent,
      };
  }
}

function StatusDot({ status }: { status: PersonaStatus }) {
  const c =
    status === 'alert' ? lumon.alert : status === 'working' ? lumon.working : lumon.idle;
  return (
    <mesh position={[0, 0.52, 0]}>
      <sphereGeometry args={[0.045, 8, 6]} />
      <meshBasicMaterial color={c} />
    </mesh>
  );
}

/** Subtle emissive badge strip; faint pulse when working = "processing". */
function BadgeStrip({ isWorking }: { isWorking: boolean }) {
  const ref = useRef<THREE.MeshStandardMaterial>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const pulse = isWorking ? 0.25 + Math.sin(state.clock.elapsedTime * 2) * 0.15 : 0.2;
    ref.current.emissiveIntensity = pulse;
  });
  return (
    <mesh position={[0.08, 0.28, 0.055]}>
      <planeGeometry args={[0.03, 0.045]} />
      <meshStandardMaterial
        ref={ref}
        color={lumon.fluorescentBlue}
        emissive={lumon.fluorescentBlue}
        emissiveIntensity={0.2}
        {...MATTE}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/** Face: eyes and mouth. Occasional blink = scale (handled by central sim or leave static for now). */
function Face() {
  return (
    <group position={[0, 0.48, 0.056]}>
      <mesh position={[-0.04, 0.02, 0]}>
        <sphereGeometry args={[0.018, 8, 6]} />
        <meshBasicMaterial color={lumon.ink} />
      </mesh>
      <mesh position={[0.04, 0.02, 0]}>
        <sphereGeometry args={[0.018, 8, 6]} />
        <meshBasicMaterial color={lumon.ink} />
      </mesh>
      <mesh position={[0, -0.02, 0]}>
        <boxGeometry args={[0.04, 0.012, 0.008]} />
        <meshBasicMaterial color={lumon.inkMuted} />
      </mesh>
    </group>
  );
}

/** Chat indicator: thin rectangular plane with waveform bars (no Html). */
function ChatWaveform() {
  const bars = 7;
  return (
    <group position={[0, 0.62, 0.08]}>
      <mesh>
        <planeGeometry args={[0.25, 0.06]} />
        <meshBasicMaterial
          color={lumon.white}
          transparent
          opacity={0.92}
          side={THREE.DoubleSide}
        />
      </mesh>
      {Array.from({ length: bars }).map((_, i) => (
        <WaveformBar key={i} index={i} total={bars} />
      ))}
    </group>
  );
}

function WaveformBar({ index, total }: { index: number; total: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const offset = (index / total) * 0.5 - 0.25;
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime + index * 0.2;
    const h = 0.01 + Math.abs(Math.sin(t * 4)) * 0.02;
    ref.current.scale.y = h / 0.015;
  });
  return (
    <mesh ref={ref} position={[offset, 0, 0.002]}>
      <boxGeometry args={[0.012, 0.015, 0.001]} />
      <meshBasicMaterial color={lumon.ink} />
    </mesh>
  );
}

/** Matte office materials: roughness 0.85–0.95, metalness 0. No glossy. */
const MATTE = { roughness: 0.9, metalness: 0 };

/**
 * Procedural agent: rounded capsule body, slightly tapered torso, soft bevel,
 * thin extruded tie/cardigan plane, subtle emissive badge strip.
 * Renders from refs; all simulation runs in MiniSimulationProvider (one useFrame).
 */
export function MiniPersona({ data, isSelected, onClick }: MiniPersonaProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const bodyRef = useRef<THREE.Group>(null!);
  const headRef = useRef<THREE.Group>(null!);
  const { registerRefs, unregisterRefs } = useMiniSimulation();
  const phase = usePersonaStore((s) => s.agentPhases[data.id]);
  // Store phase model does not include "chatting"; show comms waveform during active desk work.
  const showWaveform = phase === 'typing' && data.status === 'working';

  useLayoutEffect(() => {
    if (!groupRef.current || !bodyRef.current || !headRef.current) return;
    registerRefs(data.id, {
      group: groupRef.current,
      body: bodyRef.current,
      head: headRef.current,
    });
    return () => unregisterRefs(data.id);
  }, [data.id, registerRefs, unregisterRefs]);

  const behavior = data.behavior ?? 'focused';
  const colors = agentColors(data.name, behavior);
  const bodyColor = isSelected
    ? lumon.fluorescentBlue
    : data.status === 'alert'
      ? '#c3a3aa'
      : colors.body;
  const headColor = isSelected ? lumon.white : colors.head;
  const isWorking = data.status === 'working';
  const scenePosition: [number, number, number] = [data.position[0], 0, data.position[1]];

  return (
    <group
      ref={groupRef}
      position={scenePosition}
      onClick={(e) => (e.stopPropagation(), onClick())}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'default')}
    >
      <StatusDot status={data.status} />
      <group ref={bodyRef}>
        {/* Rounded capsule body (tapered feel via scale: slightly narrower at top in read) */}
        <mesh position={[0, 0.2, 0]} castShadow>
          <capsuleGeometry args={[0.09, 0.28, 4, 8]} />
          <meshStandardMaterial color={bodyColor} {...MATTE} />
        </mesh>
        {/* Sleeve tone: thin darker band (simplified as front cardigan/tie plane) */}
        <mesh position={[0, 0.22, 0.052]} castShadow>
          <planeGeometry args={[0.12, 0.22]} />
          <meshStandardMaterial
            color={colors.sleeve}
            {...MATTE}
            side={THREE.DoubleSide}
          />
        </mesh>
        {(data.isCoordinator || isWorking) && (
          <BadgeStrip isWorking={isWorking} />
        )}
        {/* Role accent stripe */}
        <mesh position={[0.06, 0.2, 0.054]}>
          <planeGeometry args={[0.012, 0.2]} />
          <meshStandardMaterial color={colors.accent} {...MATTE} side={THREE.DoubleSide} />
        </mesh>
      </group>
      <group ref={headRef}>
        <mesh position={[0, 0.48, 0]} castShadow>
          <sphereGeometry args={[0.075, 12, 10]} />
          <meshStandardMaterial color={headColor} {...MATTE} />
        </mesh>
        <Face />
      </group>
      {showWaveform && <ChatWaveform />}
    </group>
  );
}
