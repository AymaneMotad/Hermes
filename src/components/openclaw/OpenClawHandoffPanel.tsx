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
    <section className="mt-5 rounded border border-[#dbe3ee] bg-[#ffffff] p-4 shadow-[inset_0_0_0_1px_#eef2f7]">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#7f8b9b]">Developer Handoff Surface</p>
          <h3 className="text-sm font-semibold text-[#465162]">VPS + Core Mapping Draft (Client Mirror)</h3>
        </div>
        <span className="rounded border border-[#d7e2ef] bg-[#f4f8fd] px-2.5 py-1 text-[11px] text-[#7893b7]">
          non-functional design scaffolding
        </span>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {CONTRACTS.map((item) => (
          <article key={item.title} className="rounded border border-[#d8e2ee] bg-[#f9fbff] p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#758aa7]">{item.title}</p>
            <p className="mt-1 text-xs text-[#7f8fa3]">{item.desc}</p>
            <code className="mt-2 inline-block rounded border border-[#d6e0ed] bg-[#f3f7fd] px-2 py-1 text-[11px] text-[#7893b7]">
              {item.draft}
            </code>
          </article>
        ))}
      </div>

      <div className="mt-4 rounded border border-[#d8e2ee] bg-[#f9fbff] p-3">
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#758aa7]">
          Planned Node Identity Map
        </h4>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {personas.map((p) => (
            <div key={p.id} className="rounded border border-[#d7e2ef] bg-[#f4f8fd] p-2">
              <p className="text-xs font-semibold text-[#4c5768]">{p.name}</p>
              <p className="text-[11px] text-[#8498b2]">client id: {p.id}</p>
              <p className="text-[11px] text-[#8498b2]">node key: oc_{p.id}</p>
              <p className="mt-1 text-[11px] text-[#91a1b6]">
                lane: <span className="capitalize text-[#5f6d81]">{p.behavior ?? 'focused'}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
