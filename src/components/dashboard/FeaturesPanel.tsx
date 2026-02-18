'use client';

import { usePersonaStore } from '@/store/usePersonaStore';

interface FeaturesPanelProps {
  connected: boolean;
}

export function FeaturesPanel({ connected }: FeaturesPanelProps) {
  const personas = usePersonaStore((s) => s.personas);
  const total = personas.length;
  const active = personas.filter((p) => p.status === 'working').length;
  const alerts = personas.filter((p) => p.status === 'alert').length;
  const idle = personas.filter((p) => p.status === 'idle').length;
  const throughput = personas.reduce((acc, p) => acc + (p.tasksToday ?? 0), 0);
  const utilization = total > 0 ? Math.round((active / total) * 100) : 0;

  return (
    <aside className="w-full shrink-0 border-b border-[#d4d8de] bg-[linear-gradient(180deg,#fbfbfa_0%,#f4f5f7_100%)] md:h-full md:w-[288px] md:border-b-0 md:border-r">
      <header className="border-b border-[#d9dce2] px-4 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#707680]">
          HERMES Q
        </p>
        <p className="mt-1 text-[12px] font-semibold text-[#3f4754]">
          OpenClaw Operations
        </p>
        <p className="text-[10px] uppercase tracking-[0.16em] text-[#8a9099]">
          editorial dashboard system
        </p>
      </header>

      <div className="grid gap-3 p-4 sm:grid-cols-2 md:grid-cols-1">
        <section className="rounded-2xl border border-[#d8dce3] bg-[#ffffff] p-3 shadow-[0_6px_18px_rgba(148,163,184,0.12)]">
          <p className="text-[10px] uppercase tracking-widest text-[#7a808a]">
            Floor Health
          </p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-lg font-semibold text-[#3d4653]">{utilization}%</span>
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${connected ? 'border-[#c7e4d6] bg-[#edf8f2] text-[#4f8f74]' : 'border-[#f0d2d4] bg-[#fff3f3] text-[#b66774]'}`}>
              {connected ? 'Realtime online' : 'Realtime offline'}
            </span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#eceff4]">
            <div
              className="h-full rounded-full bg-linear-to-r from-[#6f8ac2] via-[#9ab2de] to-[#ff8f82]"
              style={{ width: `${Math.min(100, Math.max(8, utilization))}%` }}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-[#d8dce3] bg-[#ffffff] p-3 shadow-[0_6px_18px_rgba(148,163,184,0.12)]">
          <p className="text-[10px] uppercase tracking-widest text-[#7a808a]">
            Agent State
          </p>
          <div className="mt-2 space-y-2 text-xs">
            <div className="flex items-center justify-between text-[#3e4652]">
              <span>Working</span>
              <span className="font-semibold text-[#4f8f74]">{active}</span>
            </div>
            <div className="flex items-center justify-between text-[#3e4652]">
              <span>Idle</span>
              <span className="font-semibold text-[#374151]">{idle}</span>
            </div>
            <div className="flex items-center justify-between text-[#3e4652]">
              <span>Alerts</span>
              <span className="font-semibold text-[#b13f4d]">{alerts}</span>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[#d8dce3] bg-[#ffffff] p-3 shadow-[0_6px_18px_rgba(148,163,184,0.12)] sm:col-span-2 md:col-span-1">
          <p className="text-[10px] uppercase tracking-widest text-[#7a808a]">
            Throughput
          </p>
          <p className="mt-2 text-2xl font-semibold text-[#3d4653]">{throughput}</p>
          <p className="text-[11px] text-[#6d747d]">tasks completed today</p>
          <p className="mt-2 text-[11px] text-[#838992]">
            Scales with model activity, queue depth, and completion latency.
          </p>
        </section>
      </div>

      <footer className="border-t border-[#d9dce2] px-4 py-2">
        <div className="flex items-center justify-between text-[10px] text-[#858c95]">
          <span>workspace status</span>
          <span>{total} personas</span>
        </div>
      </footer>
    </aside>
  );
}
