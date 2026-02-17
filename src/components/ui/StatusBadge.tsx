'use client';

import type { PersonaStatus } from '@/types/persona';

const statusConfig: Record<
  PersonaStatus,
  { label: string; className: string; dotColor: string }
> = {
  idle: {
    label: 'Idle',
    className: 'text-[#8ea2ba]',
    dotColor: 'bg-[#7f93aa]',
  },
  working: {
    label: 'Working',
    className: 'text-[#9fd8c2]',
    dotColor: 'bg-[#59b88f]',
  },
  alert: {
    label: 'Alert',
    className: 'text-[#f0c7c7]',
    dotColor: 'bg-[#cc7070]',
  },
};

interface StatusBadgeProps {
  status: PersonaStatus;
  pulse?: boolean;
}

export function StatusBadge({ status, pulse }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium tracking-wide ${config.className}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${config.dotColor} ${pulse && status !== 'idle' ? 'animate-pulse' : ''}`}
      />
      {config.label}
    </span>
  );
}
