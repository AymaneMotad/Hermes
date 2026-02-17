'use client';

import { useMemo } from 'react';
import type { Persona } from '@/types/persona';

const DOCTRINE = [
  {
    title: 'Human-Directed Swarm',
    body: 'OpenClaw is not autonomous chaos. It is a guided swarm where operators set intent and agents self-coordinate on execution lanes.',
  },
  {
    title: 'Visible Chain Of Work',
    body: 'Every task has a visible lifecycle: intent, assignment, execution, verification, and handoff. No hidden automation decisions.',
  },
  {
    title: 'Graceful Degradation',
    body: 'When an agent degrades, nearby agents absorb work with policy-aware fallback instead of platform-wide failure.',
  },
];

const PHASES = [
  { id: 'intent', label: 'Intent Capture', color: '#7ba8d8' },
  { id: 'split', label: 'Task Sharding', color: '#9ebf7d' },
  { id: 'run', label: 'Parallel Execution', color: '#80c0ba' },
  { id: 'verify', label: 'Verification', color: '#c5adc7' },
  { id: 'handoff', label: 'Handoff', color: '#d8b27a' },
] as const;

function statusTone(status: Persona['status']) {
  if (status === 'working') return { badge: 'ACTIVE', color: '#6dc6a4', glow: '0 0 0 1px #2f5f52 inset' };
  if (status === 'alert') return { badge: 'RISK', color: '#e08f8f', glow: '0 0 0 1px #6a3838 inset' };
  return { badge: 'READY', color: '#93a9c2', glow: '0 0 0 1px #35485d inset' };
}

export function OpenClawBlueprintPanel({ personas }: { personas: Persona[] }) {
  const summary = useMemo(() => {
    const active = personas.filter((p) => p.status === 'working').length;
    const risk = personas.filter((p) => p.status === 'alert').length;
    const idle = personas.length - active - risk;
    const throughput = personas.reduce((acc, p) => acc + (p.tasksToday ?? 0), 0);
    return { active, risk, idle, throughput };
  }, [personas]);

  return (
    <section className="rounded border border-[#2c3a4c] bg-[#121c2a] p-4 shadow-[inset_0_0_0_1px_#1d2a3b]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#7f93aa]">OpenClaw Design Layer</p>
          <h3 className="text-sm font-semibold text-[#e6eef8]">Future Agent Platform Blueprint</h3>
        </div>
        <div className="rounded border border-[#33485f] bg-[#18283a] px-2.5 py-1 text-[11px] text-[#9ec6e8]">
          client-side concept only
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {DOCTRINE.map((item) => (
          <article key={item.title} className="rounded border border-[#2e4258] bg-[#172435] p-3">
            <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#a7c4df]">{item.title}</h4>
            <p className="text-xs leading-relaxed text-[#bed0e2]">{item.body}</p>
          </article>
        ))}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1.25fr_1fr]">
        <div className="rounded border border-[#2e4258] bg-[#162334] p-3">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#a7c4df]">Operational Map</h4>
          <div className="grid gap-2 sm:grid-cols-2">
            {personas.map((p) => {
              const tone = statusTone(p.status);
              return (
                <div
                  key={p.id}
                  className="rounded border border-[#38506a] bg-[#102033] p-2.5"
                  style={{ boxShadow: tone.glow }}
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="truncate text-xs font-semibold text-[#e1ecf8]">{p.name}</p>
                    <span
                      className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                      style={{ backgroundColor: '#1b2f45', color: tone.color }}
                    >
                      {tone.badge}
                    </span>
                  </div>
                  <p className="text-[11px] capitalize text-[#8fb0ce]">{p.role}</p>
                  <p className="mt-1 text-[11px] text-[#9cb4cb]">
                    lane: <span className="capitalize text-[#d5e3f1]">{p.behavior ?? 'focused'}</span>
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#9cb4cb]">
                    throughput seed: <span className="text-[#d5e3f1]">{p.tasksToday ?? 0} tasks</span>
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded border border-[#2e4258] bg-[#162334] p-3">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#a7c4df]">
            OpenClaw Pipeline Philosophy
          </h4>
          <div className="space-y-2">
            {PHASES.map((phase, idx) => (
              <div key={phase.id} className="flex items-center gap-2">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: phase.color }}
                />
                <p className="text-xs text-[#d3e1ef]">
                  <span className="text-[#95b0ca]">{idx + 1}.</span> {phase.label}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded border border-[#355272] bg-[#11263d] p-2.5 text-[11px] leading-relaxed text-[#b8cbe0]">
            Mapping direction: each current office persona becomes an OpenClaw capability node
            with policy scope, confidence budget, and escalation contracts. This UI layer frames
            that future model before backend orchestration is implemented.
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
            <div className="rounded border border-[#355272] bg-[#11263d] p-2">
              <p className="text-[#8fb0ce]">active nodes</p>
              <p className="text-sm font-semibold text-[#e4eef8]">{summary.active}</p>
            </div>
            <div className="rounded border border-[#355272] bg-[#11263d] p-2">
              <p className="text-[#8fb0ce]">risk nodes</p>
              <p className="text-sm font-semibold text-[#f0c0c0]">{summary.risk}</p>
            </div>
            <div className="rounded border border-[#355272] bg-[#11263d] p-2">
              <p className="text-[#8fb0ce]">ready reserve</p>
              <p className="text-sm font-semibold text-[#d6e5f3]">{summary.idle}</p>
            </div>
            <div className="rounded border border-[#355272] bg-[#11263d] p-2">
              <p className="text-[#8fb0ce]">daily throughput</p>
              <p className="text-sm font-semibold text-[#a8e0cc]">{summary.throughput}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
