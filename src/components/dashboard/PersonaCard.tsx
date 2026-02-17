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
          <p className="mt-1 text-[11px] text-[#7f97b2]">
            node key: <span className="text-[#b8d0e8]">oc_{persona.id}</span>
          </p>
        </div>
        <StatusBadge status={persona.status} pulse={persona.status !== 'idle'} />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        <div>
          <dt className="text-[#8ea2ba]">Capacity seed</dt>
          <dd className="font-medium text-[#dbe6f2]">{persona.tasksToday ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-[#8ea2ba]">Heartbeat</dt>
          <dd className="font-medium text-[#dbe6f2]">{persona.lastActive ?? '—'}</dd>
        </div>
      </dl>
      <p className="mt-2 text-[11px] text-[#8ea2ba]">
        behavior lane: <span className="capitalize text-[#cddceb]">{persona.behavior ?? 'focused'}</span>
      </p>
      {persona.currentTask && persona.status !== 'idle' && (
        <p className="mt-1 truncate text-[11px] text-[#9db0c8]">runtime cue: {persona.currentTask}</p>
      )}
    </button>
  );
}
