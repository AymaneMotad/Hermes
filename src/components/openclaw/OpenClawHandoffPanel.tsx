'use client';

import type { Persona } from '@/types/persona';

const CONTRACTS = [
  {
    title: 'Node Registry Contract',
    desc: 'Maps client persona nodes to persistent OpenClaw agents running on VPS orchestration.',
    draft: 'GET /v1/openclaw/nodes',
  },
  {
    title: 'Mission Dispatch Contract',
    desc: 'Accepts intent, policy scope, and shard strategy for multi-agent execution.',
    draft: 'POST /v1/openclaw/missions',
  },
  {
    title: 'Telemetry Stream Contract',
    desc: 'Streams lifecycle updates (assigned, running, verified, escalated, handed-off).',
    draft: 'WSS /v1/openclaw/telemetry',
  },
] as const;

export function OpenClawHandoffPanel({ personas }: { personas: Persona[] }) {
  return (
    <section className="mt-5 rounded border border-[#2c3a4c] bg-[#121c2a] p-4 shadow-[inset_0_0_0_1px_#1d2a3b]">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#7f93aa]">Developer Handoff Surface</p>
          <h3 className="text-sm font-semibold text-[#e6eef8]">VPS + Core Mapping Draft (Client Mirror)</h3>
        </div>
        <span className="rounded border border-[#355272] bg-[#11263d] px-2.5 py-1 text-[11px] text-[#9ec6e8]">
          non-functional design scaffolding
        </span>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {CONTRACTS.map((item) => (
          <article key={item.title} className="rounded border border-[#2e4258] bg-[#172435] p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#a7c4df]">{item.title}</p>
            <p className="mt-1 text-xs text-[#bed0e2]">{item.desc}</p>
            <code className="mt-2 inline-block rounded border border-[#3a5572] bg-[#102033] px-2 py-1 text-[11px] text-[#c7dbef]">
              {item.draft}
            </code>
          </article>
        ))}
      </div>

      <div className="mt-4 rounded border border-[#2e4258] bg-[#162334] p-3">
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#a7c4df]">
          Planned Node Identity Map
        </h4>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {personas.map((p) => (
            <div key={p.id} className="rounded border border-[#355272] bg-[#11263d] p-2">
              <p className="text-xs font-semibold text-[#e4eef8]">{p.name}</p>
              <p className="text-[11px] text-[#8fb0ce]">client id: {p.id}</p>
              <p className="text-[11px] text-[#8fb0ce]">node key: oc_{p.id}</p>
              <p className="mt-1 text-[11px] text-[#b9cde1]">
                lane: <span className="capitalize text-[#d8e7f5]">{p.behavior ?? 'focused'}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
