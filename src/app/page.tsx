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
    <span className="text-xs" style={{ color: '#8aa0bc' }}>
      Selected: <span className="font-medium" style={{ color: '#e8eef6' }}>{selected.name}</span>
      {phaseLabel && (
        <> — <span style={{ color: '#7bb6ff' }}>{phaseLabel}</span></>
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
      style={{ backgroundColor: '#0a1220' }}
    >
      <FeaturesPanel />
      <div className="flex min-w-0 flex-1 flex-col overflow-auto">
        <header
          className="flex shrink-0 items-center justify-between border-b px-6 py-4"
          style={{
            borderColor: '#1e2f45',
            background: 'linear-gradient(180deg, #142236 0%, #101c2d 100%)',
            boxShadow: '0 12px 28px rgba(2, 8, 20, 0.42)',
          }}
        >
          <div>
            <p
              className="text-[10px] font-medium uppercase tracking-[0.2em]"
              style={{ color: '#7d94b1' }}
            >
              OpenClaw Control Plane
            </p>
            <h1 className="text-lg font-semibold" style={{ color: '#e7eef9' }}>
              Agent Orchestration Experience
            </h1>
            <p className="text-sm" style={{ color: '#9cb1c8' }}>
              Client-side blueprint for future VPS-backed OpenClaw runtime
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-medium">
            <span className="rounded-full border border-[#334c69] bg-[#182a3f] px-3 py-1 text-[#d5e3f4]">
              Active {activeAgents}/{personas.length}
            </span>
            <span className="rounded-full border border-[#5b3642] bg-[#2a1820] px-3 py-1 text-[#efb3bf]">
              Alerts {alertAgents}
            </span>
            <span className="rounded-full border border-[#2b564a] bg-[#15362f] px-3 py-1 text-[#9fdcc8]">
              Throughput {throughput}
            </span>
            <span className={`rounded-full border px-3 py-1 ${connected ? 'border-[#2b564a] bg-[#15362f] text-[#9fdcc8]' : 'border-[#5b3642] bg-[#2a1820] text-[#efb3bf]'}`}>
              {connected ? 'Stream Online' : 'Stream Offline'}
            </span>
          </div>
        </header>

        <div className="flex-1 p-6" style={{ background: 'radial-gradient(1200px 520px at 20% -20%, #1b2f4b 0%, #0d1726 52%, #0a1220 100%)' }}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2
              className="text-xs font-medium uppercase tracking-wider"
              style={{ color: '#8ca3be' }}
            >
              Agents
            </h2>
            <SelectedPersonaLabel />
          </div>
          <div className="mb-4 rounded-2xl border border-[#22354d] bg-[linear-gradient(180deg,#132238_0%,#0f1c2d_100%)] p-3 shadow-[0_14px_30px_rgba(2,8,20,0.45)]">
            <div className="flex flex-wrap gap-2">
              {personas.map((p) => (
                <PersonaCard key={p.id} persona={p} />
              ))}
            </div>
          </div>

          <div>
            <h2
              className="mb-2 text-xs font-medium uppercase tracking-wider"
              style={{ color: '#8ca3be' }}
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
