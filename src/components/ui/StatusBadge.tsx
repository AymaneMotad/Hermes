'use client';

import type { PersonaStatus } from '@/types/persona';

const statusConfig: Record<
  PersonaStatus,
  { label: string; className: string; dotColor: string }
> = {
  idle: {
    label: 'Idle',
    className: 'text-[#5c6164]',
    dotColor: 'bg-[#7a828a]',
  },
  working: {
    label: 'Working',
    className: 'text-[#4a6a80]',
    dotColor: 'bg-[#5a7c94]',
  },
  alert: {
    label: 'Alert',
    className: 'text-[#8a4a4a]',
    dotColor: 'bg-[#a85a5a]',
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
