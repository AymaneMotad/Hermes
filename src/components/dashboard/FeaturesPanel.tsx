'use client';

const FEATURES = [
  { id: 'statistics', label: 'Statistics', icon: '▤' },
  { id: 'analytics', label: 'Analytics', icon: '◫' },
  { id: 'billing', label: 'Billing', icon: '◈' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
  { id: 'activity', label: 'Activity logs', icon: '▦' },
] as const;

function FeatureItem({ label, icon }: { label: string; icon: string }) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-lg border border-[#D4E5D4] bg-[#F8F9FA] px-3 py-2.5 text-left text-sm text-[#2a2d2e] transition-colors hover:border-[#B8D4B8] hover:bg-[#E8F4F8]"
    >
      <span className="text-[#5c6164]">{icon}</span>
      {label}
    </button>
  );
}

export function FeaturesPanel() {
  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col border-r border-[#D4E5D4] bg-[#F8F9FA]">
      <header className="shrink-0 border-b border-[#D4E5D4] px-4 py-3">
        <p className="text-[10px] font-medium uppercase tracking-widest text-[#5c6164]">
          Hermes Q
        </p>
      </header>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        <h2 className="mb-3 text-[11px] font-medium uppercase tracking-wider text-[#5c6164]">
          Features
        </h2>
        <div className="flex flex-col gap-2">
          {FEATURES.map((f) => (
            <FeatureItem key={f.id} label={f.label} icon={f.icon} />
          ))}
        </div>
      </nav>

      <footer className="shrink-0 border-t border-[#D4E5D4] px-4 py-2">
        <p className="text-[10px] text-[#5c6164]">v1.0</p>
      </footer>
    </aside>
  );
}
