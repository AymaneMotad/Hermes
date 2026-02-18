'use client';

import type { PersonaStatus } from '@/types/persona';

const statusConfig: Record<
  PersonaStatus,
  { label: string; className: string; dotColor: string }
> = {
  idle: {
    label: 'Idle',
    className: 'text-[#64748b]',
    dotColor: 'bg-[#94a3b8]',
  },
  working: {
    label: 'Working',
    className: 'text-[#0f766e]',
    dotColor: 'bg-[#14b8a6]',
  },
  alert: {
    label: 'Alert',
    className: 'text-[#b45353]',
    dotColor: 'bg-[#ef4444]',
  },
};

interface StatusBadgeProps {
  status: PersonaStatus;
  pulse?: boolean;
  compact?: boolean;
}

export function StatusBadge({ status, pulse, compact }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium tracking-wide ${compact ? 'text-[11px]' : 'text-xs'} ${config.className}`}
    >
      <span
        className={`${compact ? 'h-1.5 w-1.5' : 'h-2 w-2'} rounded-full ${config.dotColor} ${pulse && status !== 'idle' ? 'animate-pulse' : ''}`}
      />
      {compact ? config.label.slice(0, 1) : config.label}
    </span>
  );
}
