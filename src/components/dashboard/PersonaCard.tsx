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
      className={`w-full rounded-lg border p-4 text-left transition-colors ${
        isSelected
          ? 'border-[#1C3D5A] bg-[#E8F4F8]'
          : 'border-[#D4E5D4] bg-[#F8F9FA] hover:border-[#B8D4B8] hover:bg-[#E8F4F8]'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-medium text-[#2a2d2e]">{persona.name}</p>
            {persona.isCoordinator && (
              <span className="shrink-0 rounded bg-[#1C3D5A] px-1.5 py-0.5 text-[10px] font-medium text-white">
                Coordinator
              </span>
            )}
          </div>
          <p className="text-xs capitalize text-[#5c6164]">
            {persona.title ?? persona.role}
          </p>
        </div>
        <StatusBadge status={persona.status} pulse={persona.status !== 'idle'} />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        <div>
          <dt className="text-[#5c6164]">Tasks today</dt>
          <dd className="font-medium text-[#2a2d2e]">{persona.tasksToday ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-[#5c6164]">Last active</dt>
          <dd className="font-medium text-[#2a2d2e]">{persona.lastActive ?? '—'}</dd>
        </div>
      </dl>
      {persona.currentTask && persona.status !== 'idle' && (
        <p className="mt-2 truncate text-[11px] text-[#5c6164]">{persona.currentTask}</p>
      )}
    </button>
  );
}
