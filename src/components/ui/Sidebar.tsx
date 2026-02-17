'use client';

import { usePersonaStore } from '@/store/usePersonaStore';
import { StatusBadge } from './StatusBadge';

export function Sidebar() {
  const personas = usePersonaStore((s) => s.personas);
  const selectedId = usePersonaStore((s) => s.selectedPersonaId);
  const selectPersona = usePersonaStore((s) => s.selectPersona);

  return (
    <aside className="absolute left-0 top-0 z-10 flex h-full w-56 flex-col border-r border-zinc-200/80 bg-white/90 backdrop-blur-sm">
      <div className="border-b border-zinc-200/80 px-4 py-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
          Personas
        </h2>
        <p className="mt-0.5 text-xs text-zinc-500">AI task operators</p>
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        {personas.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => selectPersona(selectedId === p.id ? null : p.id)}
            className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-zinc-100/80 ${selectedId === p.id ? 'bg-zinc-100' : ''}`}
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-zinc-800">{p.name}</p>
              <p className="truncate text-[11px] text-zinc-500 capitalize">{p.role}</p>
            </div>
            <StatusBadge status={p.status} pulse={p.status !== 'idle'} />
          </button>
        ))}
      </nav>
    </aside>
  );
}
