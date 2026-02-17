'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { MiniOffice } from './MiniOffice';
import { MiniLighting } from './MiniLighting';
import { MiniPersona } from './MiniPersona';
import { ReadyPersona } from './ReadyPersona';
import { MiniCameraRig } from './MiniCameraRig';
import { MiniSimulationProvider } from './miniAgentSimulation';
import { usePersonaStore } from '@/store/usePersonaStore';
import { USE_READY_AGENTS } from '@/lib/modelUrls';

function MiniSceneContent() {
  const personas = usePersonaStore((s) => s.personas);
  const selectedPersonaId = usePersonaStore((s) => s.selectedPersonaId);
  const selectPersona = usePersonaStore((s) => s.selectPersona);
  const deskStatus = Object.fromEntries(
    personas.map((p) => [p.deskId, p.status])
  ) as Record<string, 'idle' | 'working' | 'alert'>;

  return (
    <MiniSimulationProvider personas={personas}>
      <MiniLighting />
      <MiniOffice deskStatus={deskStatus} />
      <MiniCameraRig />
      {personas.map((p) =>
        USE_READY_AGENTS ? (
          <ReadyPersona
            key={p.id}
            data={p}
            isSelected={selectedPersonaId === p.id}
            onClick={() => selectPersona(selectedPersonaId === p.id ? null : p.id)}
          />
        ) : (
          <MiniPersona
            key={p.id}
            data={p}
            isSelected={selectedPersonaId === p.id}
            onClick={() => selectPersona(selectedPersonaId === p.id ? null : p.id)}
          />
        )
      )}
    </MiniSimulationProvider>
  );
}

const FOG_COLOR = '#E4E6E8';
const FOG_NEAR = 2;
const FOG_FAR = 8;

export function MiniScene({ className }: { className?: string }) {
  return (
    <div className={className ?? 'h-full w-full'} style={{ minHeight: 180 }}>
      <Canvas
        camera={{ position: [2.2, 1.7, 2.2], fov: 52, near: 0.05, far: 15 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
        }}
        dpr={[1, 1.5]}
      >
        <color attach="background" args={[FOG_COLOR]} />
        <fog attach="fog" args={[FOG_COLOR, FOG_NEAR, FOG_FAR]} />
        <Suspense fallback={null}>
          <MiniSceneContent />
        </Suspense>
      </Canvas>
    </div>
  );
}
