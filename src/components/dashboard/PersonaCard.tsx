'use client';

import { usePersonaStore } from '@/store/usePersonaStore';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { Persona } from '@/types/persona';

export function PersonaCard({ persona }: { persona: Persona }) {
  const selectedPersonaId = usePersonaStore((s) => s.selectedPersonaId);
  const selectPersona = usePersonaStore((s) => s.selectPersona);
  const isSelected = selectedPersonaId === persona.id;

  return (
    <button
      type="button"
      onClick={() => selectPersona(isSelected ? null : persona.id)}
      className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-left transition-all ${
        isSelected
          ? 'border-[#c9d7eb] bg-[linear-gradient(180deg,#f8fbff_0%,#f1f6ff_100%)] shadow-[0_8px_16px_rgba(148,163,184,0.18)]'
          : 'border-[#d8e1ee] bg-[linear-gradient(180deg,#ffffff_0%,#f7f9fd_100%)] hover:border-[#c6d4ea] hover:bg-[linear-gradient(180deg,#ffffff_0%,#f3f7fd_100%)]'
      }`}
    >
      <StatusBadge status={persona.status} pulse={persona.status !== 'idle'} compact />
      <span className="truncate text-sm font-medium text-[#556174]">{persona.name}</span>
      {persona.isCoordinator && (
        <span className="shrink-0 rounded border border-[#c9d9ef] bg-[#eef5ff] px-1.5 py-0.5 text-[9px] font-medium text-[#6382af]">
          Coord
        </span>
      )}
      <span className="shrink-0 rounded bg-[#eff3f9] px-1.5 py-0.5 text-[10px] capitalize text-[#7d8da4]">
        {persona.role}
      </span>
      <span className="shrink-0 text-[10px] font-medium text-[#8394ab]">
        {persona.tasksToday ?? 0}
      </span>
    </button>
  );
}
