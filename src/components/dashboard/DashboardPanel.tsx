'use client';

import { usePersonaStore } from '@/store/usePersonaStore';
import { PersonaCard } from './PersonaCard';
import { StatusBadge } from '@/components/ui/StatusBadge';

const FEATURES = [
  { id: 'analytics', label: 'Analytics', icon: 'Chart' },
  { id: 'pipeline', label: 'Task pipeline', icon: 'Workflow' },
  { id: 'settings', label: 'Settings', icon: 'Gear' },
  { id: 'logs', label: 'Activity logs', icon: 'File' },
] as const;

function FeatureItem({
  label,
  icon,
}: {
  label: string;
  icon: string;
}) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-lg border border-[#c5d1c9] bg-[#f2f0eb] px-3 py-2.5 text-left text-sm text-[#5a616a] transition-colors hover:border-[#7a9a85] hover:bg-[#ebe9e4]"
    >
      <span className="text-[#5c6164]">{icon === 'Chart' ? '▤' : icon === 'Workflow' ? '⟳' : icon === 'Gear' ? '⚙' : '▦'}</span>
      {label}
    </button>
  );
}

function SelectedPersonaLabel() {
  const personas = usePersonaStore((s) => s.personas);
  const selectedId = usePersonaStore((s) => s.selectedPersonaId);
  const selected = selectedId ? personas.find((p) => p.id === selectedId) : null;
  if (!selected) return null;
  return (
    <div className="flex items-center gap-2 rounded border border-[#c5d1c9] bg-[#e8ebe6] px-2 py-1.5">
      <StatusBadge status={selected.status} />
      <span className="text-xs text-[#5a616a]">{selected.name}</span>
    </div>
  );
}

export function DashboardPanel() {
  const personas = usePersonaStore((s) => s.personas);

  return (
    <aside className="flex h-full w-[320px] shrink-0 flex-col border-r border-[#c5d1c9] bg-[#f2f0eb]">
      <header className="shrink-0 border-b border-[#c5d1c9] px-4 py-3">
        <h1 className="text-base font-semibold text-[#5a616a]">Persona Operations</h1>
        <p className="text-xs text-[#5c6164]">Office floor</p>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <section className="border-b border-[#c5d1c9] px-3 py-3">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h2 className="text-[11px] font-medium uppercase tracking-wider text-[#5c6164]">
              Operators
            </h2>
            <SelectedPersonaLabel />
          </div>
          <div className="flex flex-col gap-2">
            {personas.map((p) => (
              <PersonaCard key={p.id} persona={p} />
            ))}
          </div>
        </section>

        <section className="px-3 py-3">
          <h2 className="mb-2 text-[11px] font-medium uppercase tracking-wider text-[#5c6164]">
            Features
          </h2>
          <div className="flex flex-col gap-2">
            {FEATURES.map((f) => (
              <FeatureItem key={f.id} label={f.label} icon={f.icon} />
            ))}
          </div>
        </section>
      </div>

      <footer className="shrink-0 border-t border-[#c5d1c9] px-4 py-2">
        <p className="text-[10px] uppercase tracking-widest text-[#5c6164]">
          Hermes Q
        </p>
      </footer>
    </aside>
  );
}
