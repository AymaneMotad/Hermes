'use client';

import { usePersonaWebSocket } from '@/hooks/usePersonaWebSocket';
import { usePersonaStore } from '@/store/usePersonaStore';
import { FeaturesPanel } from '@/components/dashboard/FeaturesPanel';
import { PersonaCard } from '@/components/dashboard/PersonaCard';
import { OfficeCanvas } from '@/components/office/OfficeCanvas';
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
    <span className="text-xs" style={{ color: '#8ea2ba' }}>
      Selected: <span className="font-medium" style={{ color: '#e8eef6' }}>{selected.name}</span>
      {phaseLabel && (
        <> — <span style={{ color: '#8ab2da' }}>{phaseLabel}</span></>
      )}
    </span>
  );
}

export default function Home() {
  const { connected } = usePersonaWebSocket();
  const personas = usePersonaStore((s) => s.personas);
  const activeAgents = personas.filter((p) => p.status === 'working').length;
  const alertAgents = personas.filter((p) => p.status === 'alert').length;
  const throughput = personas.reduce((acc, p) => acc + (p.tasksToday ?? 0), 0);

  return (
    <main
      className="flex h-screen w-screen overflow-hidden"
      style={{ backgroundColor: '#0f1722' }}
    >
      <FeaturesPanel />
      <div className="flex min-w-0 flex-1 flex-col overflow-auto">
        <header
          className="flex shrink-0 items-center justify-between border-b px-6 py-4"
          style={{
            borderColor: '#2c3a4c',
            backgroundColor: '#141d2a',
            boxShadow: '0 1px 0 #1f2b3a',
          }}
        >
          <div>
            <p
              className="text-[10px] font-medium uppercase tracking-[0.2em]"
              style={{ color: '#7f93aa' }}
            >
              OpenClaw Control Plane
            </p>
            <h1 className="text-lg font-semibold" style={{ color: '#e8eef6' }}>
              Agent Orchestration Experience
            </h1>
            <p className="text-sm" style={{ color: '#8ea2ba' }}>
              Client-side blueprint for future VPS-backed OpenClaw runtime
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-medium">
            <span className="rounded border border-[#2f4158] bg-[#1a2534] px-2.5 py-1 text-[#c9d7e8]">
              Active {activeAgents}/{personas.length}
            </span>
            <span className="rounded border border-[#2f4158] bg-[#1a2534] px-2.5 py-1 text-[#f0c7c7]">
              Alerts {alertAgents}
            </span>
            <span className="rounded border border-[#2f4158] bg-[#1a2534] px-2.5 py-1 text-[#a8e0cc]">
              Throughput {throughput}
            </span>
            <span className={`rounded border px-2.5 py-1 ${connected ? 'border-[#2d5a4a] bg-[#17372f] text-[#a9e7ce]' : 'border-[#5a2d2d] bg-[#381d1d] text-[#f1b0b0]'}`}>
              {connected ? 'Stream Online' : 'Stream Offline'}
            </span>
          </div>
        </header>

        <div className="flex-1 p-6" style={{ backgroundColor: '#0f1722' }}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2
              className="text-xs font-medium uppercase tracking-wider"
              style={{ color: '#7f93aa' }}
            >
              Agents
            </h2>
            <SelectedPersonaLabel />
          </div>
          <div className="mb-4 flex flex-wrap gap-2">
            {personas.map((p) => (
              <PersonaCard key={p.id} persona={p} />
            ))}
          </div>

          <div>
            <h2
              className="mb-2 text-xs font-medium uppercase tracking-wider"
              style={{ color: '#7f93aa' }}
            >
              Live Floor
            </h2>
            <div
              className="inline-block overflow-hidden rounded border-2 shadow-md"
              style={{
                borderColor: '#2c3a4c',
                backgroundColor: '#111927',
                boxShadow: 'inset 0 0 0 1px #233247, 0 8px 26px #03060c',
              }}
            >
              <div
                className="flex items-center gap-2 px-2 py-1"
                style={{
                  backgroundColor: '#182334',
                  borderBottom: '1px solid #2c3a4c',
                }}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: connected ? '#4ab990' : '#ba5b5b' }}
                />
                <span
                  className="text-[10px] uppercase tracking-wider"
                  style={{ color: '#8ea2ba' }}
                >
                  Realtime
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
