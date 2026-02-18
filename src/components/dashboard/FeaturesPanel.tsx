'use client';

const FEATURES = [
  { id: 'swarm-map', label: 'Swarm topology', icon: '◬' },
  { id: 'policy-lens', label: 'Policy lens', icon: '◎' },
  { id: 'work-graph', label: 'Work graph', icon: '▤' },
  { id: 'trust-signals', label: 'Trust signals', icon: '◈' },
  { id: 'escalation', label: 'Escalation contracts', icon: '▦' },
] as const;

function FeatureItem({ label, icon }: { label: string; icon: string }) {
  return (
    <button
      type="button"
      className="group flex w-full items-center gap-3 rounded-xl border border-[#273549] bg-[linear-gradient(180deg,#121e2f_0%,#0d1725_100%)] px-3 py-2.5 text-left text-sm text-[#d7e3f4] transition-all hover:-translate-y-px hover:border-[#3a5477] hover:shadow-[0_10px_24px_rgba(6,14,28,0.45)]"
    >
      <span className="text-[#8fa8c5] transition-colors group-hover:text-[#60a5fa]">{icon}</span>
      {label}
    </button>
  );
}

export function FeaturesPanel() {
  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col border-r border-[#1d2a3d] bg-[radial-gradient(120%_120%_at_0%_0%,#1b2b41_0%,#111a2a_45%,#0b1220_100%)]">
      <header className="shrink-0 border-b border-[#23344a] px-4 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#9ab0cc]">
          HERMES Q
        </p>
        <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[#6f87a5]">
          OpenClaw-ready UI shell
        </p>
      </header>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        <h2 className="mb-3 text-[11px] font-medium uppercase tracking-wider text-[#7f95b2]">
          Features
        </h2>
        <div className="flex flex-col gap-2">
          {FEATURES.map((f) => (
            <FeatureItem key={f.id} label={f.label} icon={f.icon} />
          ))}
        </div>
      </nav>

      <footer className="shrink-0 border-t border-[#23344a] px-4 py-2">
        <p className="text-[10px] text-[#7b90ad]">v1.0 enterprise preview</p>
      </footer>
    </aside>
  );
}
