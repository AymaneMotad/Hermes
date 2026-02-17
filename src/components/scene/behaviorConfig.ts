'use client';

import type { PersonaBehavior } from '@/types/persona';

export interface BehaviorConfig {
  atDeskMin: number;
  atDeskMax: number;
  leaveDeskChance: number;
  goToCenterChance: number;
  chatAtCenterChance: number;
  chatDurationMin: number;
  chatDurationMax: number;
  walkSpeed: number;
}

export const BEHAVIOR_CONFIG: Record<PersonaBehavior, BehaviorConfig> = {
  coordinator: {
    atDeskMin: 4,
    atDeskMax: 10,
    leaveDeskChance: 0.4,
    goToCenterChance: 0.5,
    chatAtCenterChance: 0.35,
    chatDurationMin: 2,
    chatDurationMax: 5,
    walkSpeed: 0.8,
  },
  focused: {
    atDeskMin: 6,
    atDeskMax: 14,
    leaveDeskChance: 0.25,
    goToCenterChance: 0.3,
    chatAtCenterChance: 0.2,
    chatDurationMin: 1.5,
    chatDurationMax: 4,
    walkSpeed: 0.7,
  },
  social: {
    atDeskMin: 3,
    atDeskMax: 8,
    leaveDeskChance: 0.5,
    goToCenterChance: 0.6,
    chatAtCenterChance: 0.5,
    chatDurationMin: 2.5,
    chatDurationMax: 6,
    walkSpeed: 0.85,
  },
  wanderer: {
    atDeskMin: 2,
    atDeskMax: 6,
    leaveDeskChance: 0.55,
    goToCenterChance: 0.45,
    chatAtCenterChance: 0.4,
    chatDurationMin: 2,
    chatDurationMax: 5,
    walkSpeed: 0.9,
  },
};

export const COORDINATOR_CHAT_LINES = [
  'Can you take the next queue partition?',
  'I need support on this active batch.',
  'Do you confirm this anomaly signal?',
];

export const OFFICE_CHAT_LINES = [
  'Confirmed. Processing in parallel.',
  'Acknowledged. Taking this lane.',
  'Copy that. Validating now.',
];
