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
          ? 'border-[#9bc2ff] bg-[#eef5ff] shadow-[0_4px_14px_rgba(59,130,246,0.12)]'
          : 'border-[#d6dfeb] bg-[#f8fbff] hover:border-[#bfd0e5] hover:bg-[#f1f6fc]'
      }`}
    >
      <StatusBadge status={persona.status} pulse={persona.status !== 'idle'} compact />
      <span className="truncate text-sm font-medium text-[#1f2937]">{persona.name}</span>
      {persona.isCoordinator && (
        <span className="shrink-0 rounded border border-[#c6d7ee] bg-[#ebf3ff] px-1.5 py-0.5 text-[9px] font-medium text-[#3b82f6]">
          Coord
        </span>
      )}
      <span className="shrink-0 rounded bg-[#eff3f8] px-1.5 py-0.5 text-[10px] capitalize text-[#64748b]">
        {persona.role}
      </span>
      <span className="shrink-0 text-[10px] font-medium text-[#475569]">
        {persona.tasksToday ?? 0}
      </span>
    </button>
  );
}
