'use client';

import type { PersonaStatus } from '@/types/persona';

const statusConfig: Record<
  PersonaStatus,
  { label: string; className: string; dotColor: string }
> = {
  idle: {
    label: 'Idle',
    className: 'text-[#8ea3bf]',
    dotColor: 'bg-[#7f95b2]',
  },
  working: {
    label: 'Working',
    className: 'text-[#9ce1d5]',
    dotColor: 'bg-[#34d399]',
  },
  alert: {
    label: 'Alert',
    className: 'text-[#f0b9b9]',
    dotColor: 'bg-[#f87171]',
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
