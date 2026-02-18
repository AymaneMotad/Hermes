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
    <span className="text-xs" style={{ color: '#6b7b8f' }}>
      Selected: <span className="font-medium" style={{ color: '#1f2937' }}>{selected.name}</span>
      {phaseLabel && (
        <> — <span style={{ color: '#3b82f6' }}>{phaseLabel}</span></>
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
      style={{ backgroundColor: '#f3f6fb' }}
    >
      <FeaturesPanel />
      <div className="flex min-w-0 flex-1 flex-col overflow-auto">
        <header
          className="flex shrink-0 items-center justify-between border-b px-6 py-4"
          style={{
            borderColor: '#d9e1ec',
            backgroundColor: '#ffffff',
            boxShadow: '0 6px 20px rgba(15, 23, 42, 0.05)',
          }}
        >
          <div>
            <p
              className="text-[10px] font-medium uppercase tracking-[0.2em]"
              style={{ color: '#64748b' }}
            >
              OpenClaw Control Plane
            </p>
            <h1 className="text-lg font-semibold" style={{ color: '#0f172a' }}>
              Agent Orchestration Experience
            </h1>
            <p className="text-sm" style={{ color: '#64748b' }}>
              Client-side blueprint for future VPS-backed OpenClaw runtime
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-medium">
            <span className="rounded-full border border-[#dbe4ef] bg-[#f8fbff] px-3 py-1 text-[#334155]">
              Active {activeAgents}/{personas.length}
            </span>
            <span className="rounded-full border border-[#f2d8d8] bg-[#fff7f7] px-3 py-1 text-[#b45353]">
              Alerts {alertAgents}
            </span>
            <span className="rounded-full border border-[#d6ece2] bg-[#f4fbf8] px-3 py-1 text-[#2f7f63]">
              Throughput {throughput}
            </span>
            <span className={`rounded-full border px-3 py-1 ${connected ? 'border-[#cae8dc] bg-[#effaf4] text-[#2f7f63]' : 'border-[#f2d8d8] bg-[#fff7f7] text-[#b45353]'}`}>
              {connected ? 'Stream Online' : 'Stream Offline'}
            </span>
          </div>
        </header>

        <div className="flex-1 p-6" style={{ backgroundColor: '#f3f6fb' }}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2
              className="text-xs font-medium uppercase tracking-wider"
              style={{ color: '#6b7b8f' }}
            >
              Agents
            </h2>
            <SelectedPersonaLabel />
          </div>
          <div className="mb-4 rounded-2xl border border-[#dbe3ee] bg-white p-3 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
            <div className="flex flex-wrap gap-2">
              {personas.map((p) => (
                <PersonaCard key={p.id} persona={p} />
              ))}
            </div>
          </div>

          <div>
            <h2
              className="mb-2 text-xs font-medium uppercase tracking-wider"
              style={{ color: '#6b7b8f' }}
            >
              Live Floor
            </h2>
            <div
              className="inline-block overflow-hidden rounded border-2 shadow-md"
              style={{
                borderColor: '#d4dde8',
                backgroundColor: '#f8fafc',
                boxShadow: 'inset 0 0 0 1px #e4eaf2, 0 8px 26px rgba(15, 23, 42, 0.16)',
              }}
            >
              <div
                className="flex items-center gap-2 px-2 py-1"
                style={{
                  backgroundColor: '#eef3f9',
                  borderBottom: '1px solid #d4dde8',
                }}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: connected ? '#4ab990' : '#ba5b5b' }}
                />
                <span
                  className="text-[10px] uppercase tracking-wider"
                  style={{ color: '#5f7086' }}
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
