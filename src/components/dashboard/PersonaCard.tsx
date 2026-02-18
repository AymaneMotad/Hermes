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
          ? 'border-[#3f5f88] bg-[linear-gradient(180deg,#1c2d43_0%,#15263a_100%)] shadow-[0_10px_20px_rgba(8,17,32,0.4)]'
          : 'border-[#2b3f5a] bg-[linear-gradient(180deg,#142236_0%,#101c2d_100%)] hover:border-[#3e5a80] hover:bg-[linear-gradient(180deg,#182a40_0%,#132339_100%)]'
      }`}
    >
      <StatusBadge status={persona.status} pulse={persona.status !== 'idle'} compact />
      <span className="truncate text-sm font-medium text-[#e6eef8]">{persona.name}</span>
      {persona.isCoordinator && (
        <span className="shrink-0 rounded border border-[#4b6b92] bg-[#21344d] px-1.5 py-0.5 text-[9px] font-medium text-[#8fc0ff]">
          Coord
        </span>
      )}
      <span className="shrink-0 rounded bg-[#1f3147] px-1.5 py-0.5 text-[10px] capitalize text-[#9bb3cf]">
        {persona.role}
      </span>
      <span className="shrink-0 text-[10px] font-medium text-[#bfd1e6]">
        {persona.tasksToday ?? 0}
      </span>
    </button>
  );
}
