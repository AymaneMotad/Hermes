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
          ? 'border-[#416084] bg-[#1d2c40]'
          : 'border-[#2f3f56] bg-[#182434] hover:border-[#3f5774] hover:bg-[#1f2f43]'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-medium text-[#e8eef6]">{persona.name}</p>
            {persona.isCoordinator && (
              <span className="shrink-0 rounded border border-[#5e7fa6] bg-[#24374f] px-1.5 py-0.5 text-[10px] font-medium text-[#cfe1f5]">
                Coordinator
              </span>
            )}
          </div>
          <p className="text-xs capitalize text-[#8ea2ba]">
            {persona.title ?? persona.role}
          </p>
        </div>
        <StatusBadge status={persona.status} pulse={persona.status !== 'idle'} />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        <div>
          <dt className="text-[#8ea2ba]">Tasks today</dt>
          <dd className="font-medium text-[#dbe6f2]">{persona.tasksToday ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-[#8ea2ba]">Last active</dt>
          <dd className="font-medium text-[#dbe6f2]">{persona.lastActive ?? '—'}</dd>
        </div>
      </dl>
      {persona.currentTask && persona.status !== 'idle' && (
        <p className="mt-2 truncate text-[11px] text-[#9db0c8]">{persona.currentTask}</p>
      )}
    </button>
  );
}
