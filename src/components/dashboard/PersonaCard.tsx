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
      className={`inline-flex shrink-0 items-center gap-2 rounded-md border px-2.5 py-1.5 text-left transition-colors ${
        isSelected
          ? 'border-[#416084] bg-[#1d2c40]'
          : 'border-[#2f3f56] bg-[#182434] hover:border-[#3f5774] hover:bg-[#1f2f43]'
      }`}
    >
      <StatusBadge status={persona.status} pulse={persona.status !== 'idle'} />
      <span className="truncate text-sm font-medium text-[#e8eef6]">{persona.name}</span>
      {persona.isCoordinator && (
        <span className="shrink-0 rounded border border-[#5e7fa6] bg-[#24374f] px-1 py-0.5 text-[9px] font-medium text-[#cfe1f5]">
          Coord
        </span>
      )}
      <span className="shrink-0 text-[10px] capitalize text-[#8ea2ba]">
        {persona.role}
      </span>
      <span className="shrink-0 text-[10px] text-[#7f97b2]">
        {persona.tasksToday ?? 0}
      </span>
    </button>
  );
}
