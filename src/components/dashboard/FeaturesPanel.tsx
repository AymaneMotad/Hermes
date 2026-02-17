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
      className="flex w-full items-center gap-3 rounded-md border border-[#2f3f56] bg-[#182434] px-3 py-2.5 text-left text-sm text-[#d8e2ee] transition-colors hover:border-[#415774] hover:bg-[#1f2f43]"
    >
      <span className="text-[#8ea2ba]">{icon}</span>
      {label}
    </button>
  );
}

export function FeaturesPanel() {
  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col border-r border-[#2c3a4c] bg-[#121b28]">
      <header className="shrink-0 border-b border-[#2c3a4c] px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8ea2ba]">
          HERMES Q
        </p>
        <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[#6f869f]">
          OpenClaw-ready UI shell
        </p>
      </header>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        <h2 className="mb-3 text-[11px] font-medium uppercase tracking-wider text-[#8ea2ba]">
          Features
        </h2>
        <div className="flex flex-col gap-2">
          {FEATURES.map((f) => (
            <FeatureItem key={f.id} label={f.label} icon={f.icon} />
          ))}
        </div>
      </nav>

      <footer className="shrink-0 border-t border-[#2c3a4c] px-4 py-2">
        <p className="text-[10px] text-[#8ea2ba]">v1.0 enterprise preview</p>
      </footer>
    </aside>
  );
}
