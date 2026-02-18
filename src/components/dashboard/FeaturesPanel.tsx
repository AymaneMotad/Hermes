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
      className="flex w-full items-center gap-3 rounded-md border border-[#d7dee8] bg-[#f8fafc] px-3 py-2.5 text-left text-sm text-[#334155] transition-colors hover:border-[#bfccdb] hover:bg-[#f1f5f9]"
    >
      <span className="text-[#64748b]">{icon}</span>
      {label}
    </button>
  );
}

export function FeaturesPanel() {
  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col border-r border-[#d6dde8] bg-[#f3f5f8]">
      <header className="shrink-0 border-b border-[#d6dde8] px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#526173]">
          HERMES Q
        </p>
        <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[#7c8da1]">
          OpenClaw-ready UI shell
        </p>
      </header>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        <h2 className="mb-3 text-[11px] font-medium uppercase tracking-wider text-[#6b7b8f]">
          Features
        </h2>
        <div className="flex flex-col gap-2">
          {FEATURES.map((f) => (
            <FeatureItem key={f.id} label={f.label} icon={f.icon} />
          ))}
        </div>
      </nav>

      <footer className="shrink-0 border-t border-[#d6dde8] px-4 py-2">
        <p className="text-[10px] text-[#7b8da3]">v1.0 enterprise preview</p>
      </footer>
    </aside>
  );
}
