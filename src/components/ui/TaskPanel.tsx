'use client';

import { usePersonaStore } from '@/store/usePersonaStore';
import { StatusBadge } from './StatusBadge';

export function TaskPanel() {
  const personas = usePersonaStore((s) => s.personas);
  const selectedPersonaId = usePersonaStore((s) => s.selectedPersonaId);
  const selectPersona = usePersonaStore((s) => s.selectPersona);

  const selected = selectedPersonaId
    ? personas.find((p) => p.id === selectedPersonaId)
    : null;

  if (!selected) return null;

  return (
    <div
      className="absolute right-0 top-0 z-10 w-80 border-l border-zinc-200/80 bg-white/92 backdrop-blur-sm transition-opacity duration-200"
    >
      <div className="flex items-center justify-between border-b border-zinc-200/80 px-4 py-3">
        <h3 className="text-sm font-semibold text-zinc-800">{selected.name}</h3>
        <button
          type="button"
          onClick={() => selectPersona(null)}
          className="text-zinc-400 hover:text-zinc-600"
          aria-label="Close"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="space-y-4 px-4 py-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-400">
            Status
          </p>
          <div className="mt-1">
            <StatusBadge status={selected.status} pulse />
          </div>
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-400">
            Role
          </p>
          <p className="mt-1 text-sm text-zinc-700 capitalize">{selected.role}</p>
        </div>
        {selected.currentTask && (
          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-400">
              Current task
            </p>
            <p className="mt-1 text-sm text-zinc-700">{selected.currentTask}</p>
          </div>
        )}
        {selected.errorMessage && (
          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest text-red-500">
              Notice
            </p>
            <p className="mt-1 text-sm text-red-700">{selected.errorMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}
