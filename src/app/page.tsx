'use client';

import { usePersonaWebSocket } from '@/hooks/usePersonaWebSocket';
import { usePersonaStore } from '@/store/usePersonaStore';
import { FeaturesPanel } from '@/components/dashboard/FeaturesPanel';
import { PersonaCard } from '@/components/dashboard/PersonaCard';
import { OfficeCanvas } from '@/components/office/OfficeCanvas';
import { lumon } from '@/theme/severance';
import { VIEW_WIDTH, VIEW_HEIGHT } from '@/lib/officeLayout';

const PHASE_LABELS: Record<string, string> = {
  idle: 'idle',
  typing: 'typing',
  stand: 'standing',
  walk: 'walking',
  sit: 'sitting',
};

function SelectedPersonaLabel() {
  const personas = usePersonaStore((s) => s.personas);
  const selectedId = usePersonaStore((s) => s.selectedPersonaId);
  const agentPhases = usePersonaStore((s) => s.agentPhases);
  const selected = selectedId ? personas.find((p) => p.id === selectedId) : null;
  if (!selected) return null;
  const phase = agentPhases[selected.id];
  const phaseLabel = phase ? PHASE_LABELS[phase] ?? phase : null;
  return (
    <span className="text-xs" style={{ color: lumon.inkMuted }}>
      Selected: <span className="font-medium" style={{ color: lumon.ink }}>{selected.name}</span>
      {phaseLabel && (
        <> — <span style={{ color: lumon.fluorescentBlue }}>{phaseLabel}</span></>
      )}
    </span>
  );
}

export default function Home() {
  usePersonaWebSocket();
  const personas = usePersonaStore((s) => s.personas);

  return (
    <main
      className="flex h-screen w-screen overflow-hidden"
      style={{ backgroundColor: lumon.sage }}
    >
      <FeaturesPanel />
      <div className="flex min-w-0 flex-1 flex-col overflow-auto">
        <header
          className="flex shrink-0 items-center justify-between border-b px-6 py-4"
          style={{
            borderColor: lumon.fluorescentBlue,
            backgroundColor: lumon.white,
            boxShadow: `0 1px 0 ${lumon.stripLight}`,
          }}
        >
          <div>
            <p
              className="text-[10px] font-medium uppercase tracking-[0.2em]"
              style={{ color: lumon.inkMuted }}
            >
              Lumon Industries
            </p>
            <h1 className="text-lg font-semibold" style={{ color: lumon.ink }}>
              Persona Operations
            </h1>
            <p className="text-sm" style={{ color: lumon.inkMuted }}>
              Macrodata Refinement — floor view
            </p>
          </div>
        </header>

        <div className="flex-1 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2
              className="text-xs font-medium uppercase tracking-wider"
              style={{ color: lumon.inkMuted }}
            >
              Operators
            </h2>
            <SelectedPersonaLabel />
          </div>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {personas.map((p) => (
              <PersonaCard key={p.id} persona={p} />
            ))}
          </div>

          <div>
            <h2
              className="mb-2 text-xs font-medium uppercase tracking-wider"
              style={{ color: lumon.inkMuted }}
            >
              Live floor
            </h2>
            <div
              className="inline-block overflow-hidden rounded border-2 shadow-md"
              style={{
                borderColor: lumon.inkMuted,
                backgroundColor: lumon.white,
                boxShadow: `inset 0 0 0 1px ${lumon.fluorescentBlue}, 0 4px 12px ${lumon.ink}18`,
              }}
            >
              <div
                className="flex items-center gap-2 px-2 py-1"
                style={{
                  backgroundColor: lumon.white,
                  borderBottom: `1px solid ${lumon.fluorescentBlue}`,
                }}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: lumon.working }}
                />
                <span
                  className="text-[10px] uppercase tracking-wider"
                  style={{ color: lumon.inkMuted }}
                >
                  2D office simulation
                </span>
              </div>
              <div style={{ width: VIEW_WIDTH, height: VIEW_HEIGHT }}>
                <OfficeCanvas />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
