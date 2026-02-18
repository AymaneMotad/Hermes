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
    <span className="text-xs" style={{ color: '#7f8fa3' }}>
      Selected: <span className="font-medium" style={{ color: '#4b5563' }}>{selected.name}</span>
      {phaseLabel && (
        <> — <span style={{ color: '#6f8ec3' }}>{phaseLabel}</span></>
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
  const idleAgents = Math.max(0, personas.length - activeAgents - alertAgents);
  const inputTokens = throughput * 410 + activeAgents * 1200 + alertAgents * 740;
  const outputTokens = throughput * 215 + activeAgents * 680 + alertAgents * 260;
  const totalTokens = inputTokens + outputTokens;
  const contextUsage = Math.min(96, 34 + activeAgents * 8 + alertAgents * 6);
  const successRate = Math.max(
    70,
    Math.min(99.7, 100 - (alertAgents * 3.4 + idleAgents * 0.4))
  );
  const todayCost = (inputTokens / 1_000_000) * 3 + (outputTokens / 1_000_000) * 12;

  const tokenTrend = [
    { label: 'Mon', value: Math.round(totalTokens * 0.74) },
    { label: 'Tue', value: Math.round(totalTokens * 0.82) },
    { label: 'Wed', value: Math.round(totalTokens * 0.88) },
    { label: 'Thu', value: Math.round(totalTokens * 0.94) },
    { label: 'Fri', value: totalTokens },
    { label: 'Sat', value: Math.round(totalTokens * 0.7) },
    { label: 'Sun', value: Math.round(totalTokens * 0.62) },
  ];
  const maxTrend = Math.max(...tokenTrend.map((d) => d.value), 1);

  const formatK = (value: number) => `${Math.round(value / 1000)}k`;
  const formatDollars = (value: number) =>
    `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <main
      className="flex h-screen w-screen flex-col overflow-hidden bg-[#f7f8fb] md:flex-row"
    >
      <FeaturesPanel connected={connected} />
      <div className="flex min-w-0 flex-1 flex-col overflow-auto">
        <header
          className="flex shrink-0 flex-col gap-3 border-b border-[#d9dee7] bg-[#ffffff] px-5 py-4 md:flex-row md:items-center md:justify-between md:px-6"
          style={{
            boxShadow: '0 10px 24px rgba(148, 163, 184, 0.12)',
          }}
        >
          <div>
            <p
              className="text-[10px] font-medium uppercase tracking-[0.2em]"
              style={{ color: '#7f8793' }}
            >
              OpenClaw Control Plane
            </p>
            <h1 className="text-lg font-semibold" style={{ color: '#303844' }}>
              Agent Orchestration Experience
            </h1>
            <p className="text-sm" style={{ color: '#8b94a1' }}>
              Client-side blueprint for future VPS-backed OpenClaw runtime
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium">
            <span className="rounded-full border border-[#d7deea] bg-[#f3f6fb] px-3 py-1 text-[#5f7186]">
              Active {activeAgents}/{personas.length}
            </span>
            <span className="rounded-full border border-[#f2d9dc] bg-[#fff4f5] px-3 py-1 text-[#b66774]">
              Alerts {alertAgents}
            </span>
            <span className="rounded-full border border-[#d4ecdf] bg-[#eef9f3] px-3 py-1 text-[#4e8c73]">
              Throughput {throughput}
            </span>
            <span className={`rounded-full border px-3 py-1 ${connected ? 'border-[#d4ecdf] bg-[#eef9f3] text-[#4e8c73]' : 'border-[#f2d9dc] bg-[#fff4f5] text-[#b66774]'}`}>
              {connected ? 'Stream Online' : 'Stream Offline'}
            </span>
          </div>
        </header>

        <div
          className="flex-1 space-y-4 p-4 md:p-6"
          style={{ background: 'radial-gradient(1100px 620px at 20% -20%, #ffffff 0%, #f6f8fb 55%, #f1f4f8 100%)' }}
        >
          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-2xl border border-[#dee4ee] bg-[#ffffff] p-4 shadow-[0_8px_22px_rgba(148,163,184,0.12)]">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#7a8595]">Active sessions</p>
              <p className="mt-2 text-2xl font-semibold text-[#374151]">{activeAgents}</p>
              <p className="text-xs text-[#8d99a8]">live multi-agent workers</p>
            </article>
            <article className="rounded-2xl border border-[#dee4ee] bg-[#ffffff] p-4 shadow-[0_8px_22px_rgba(148,163,184,0.12)]">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#7a8595]">Token usage today</p>
              <p className="mt-2 text-2xl font-semibold text-[#374151]">{formatK(totalTokens)}</p>
              <p className="text-xs text-[#8d99a8]">
                in {formatK(inputTokens)} input / {formatK(outputTokens)} output
              </p>
            </article>
            <article className="rounded-2xl border border-[#dee4ee] bg-[#ffffff] p-4 shadow-[0_8px_22px_rgba(148,163,184,0.12)]">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#7a8595]">Estimated cost</p>
              <p className="mt-2 text-2xl font-semibold text-[#374151]">{formatDollars(todayCost)}</p>
              <p className="text-xs text-[#8d99a8]">context usage {contextUsage}%</p>
            </article>
            <article className="rounded-2xl border border-[#dee4ee] bg-[#ffffff] p-4 shadow-[0_8px_22px_rgba(148,163,184,0.12)]">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#7a8595]">Success rate</p>
              <p className="mt-2 text-2xl font-semibold text-[#374151]">{successRate.toFixed(1)}%</p>
              <p className="text-xs text-[#8d99a8]">{alertAgents} active incidents in queue</p>
            </article>
          </section>

          <section className="grid gap-3 xl:grid-cols-[1.35fr_1fr]">
            <article className="rounded-2xl border border-[#dde5ef] bg-[#ffffff] p-4 shadow-[0_10px_24px_rgba(148,163,184,0.12)]">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-[#4b5563]">Token usage and trends</h2>
                <span className="rounded-full border border-[#d9e0ea] bg-[#f4f7fb] px-2 py-0.5 text-[10px] text-[#8090a3]">
                  7 day view
                </span>
              </div>
              <div className="mt-4 space-y-2">
                {tokenTrend.map((point) => (
                  <div key={point.label} className="grid grid-cols-[32px_1fr_56px] items-center gap-2 text-xs">
                    <span className="text-[#7e8da0]">{point.label}</span>
                    <div className="h-2 overflow-hidden rounded-full bg-[#edf1f6]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#7aa5ff] via-[#9ebbf8] to-[#ff9b8f]"
                        style={{ width: `${Math.round((point.value / maxTrend) * 100)}%` }}
                      />
                    </div>
                    <span className="text-right text-[#91a0b2]">{formatK(point.value)}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-[#dde5ef] bg-[#ffffff] p-4 shadow-[0_10px_24px_rgba(148,163,184,0.12)]">
              <h2 className="text-sm font-medium text-[#4b5563]">Agent distribution</h2>
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[#6f7e91]">
                  <span>Working</span>
                  <span className="font-semibold text-[#4f8f74]">{activeAgents}</span>
                </div>
                <div className="flex items-center justify-between text-[#6f7e91]">
                  <span>Idle</span>
                  <span className="font-semibold text-[#64748b]">{idleAgents}</span>
                </div>
                <div className="flex items-center justify-between text-[#6f7e91]">
                  <span>Alert</span>
                  <span className="font-semibold text-[#bb6d79]">{alertAgents}</span>
                </div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#edf1f6]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#8dc6ad] via-[#b8c4d6] to-[#e8a8af]"
                  style={{ width: `${Math.max(12, Math.min(100, successRate))}%` }}
                />
              </div>
            </article>
          </section>

          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2
              className="text-xs font-medium uppercase tracking-wider"
              style={{ color: '#7d8897' }}
            >
              Agents
            </h2>
            <SelectedPersonaLabel />
          </div>
          <div className="mb-4 rounded-2xl border border-[#dbe3ee] bg-[#ffffff] p-3 shadow-[0_10px_24px_rgba(148,163,184,0.12)]">
            <div className="flex flex-wrap gap-2">
              {personas.map((p) => (
                <PersonaCard key={p.id} persona={p} />
              ))}
            </div>
          </div>

          <div>
            <h2
              className="mb-2 text-xs font-medium uppercase tracking-wider"
              style={{ color: '#7d8897' }}
            >
              Live Floor
            </h2>
            <div
              className="inline-block overflow-hidden rounded border-2 shadow-md"
              style={{
                borderColor: '#d4dde8',
                backgroundColor: '#f8fafc',
                boxShadow: 'inset 0 0 0 1px #e4eaf2, 0 8px 26px rgba(148, 163, 184, 0.2)',
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
