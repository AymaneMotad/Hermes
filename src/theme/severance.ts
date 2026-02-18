/**
 * Lumon / Severance visual design:
 * Institutional whites, cold fluorescent blues, muted sage greens, stark shadows.
 * 5000K–6000K "eternal afternoon", harsh clinical lighting.
 * Colors toned down ~20% — if it pops, it's wrong.
 */

import type { PersonaBehavior } from '@/types/persona';

/** Role-based accent stripe (low saturation). Torso = base, sleeve darker, accent = stripe. */
export const ROLE_ACCENT: Record<PersonaBehavior, string> = {
  coordinator: '#7b91b2', // soft slate
  focused: '#8ca4bf', // muted blue
  social: '#9ab09c', // soft sage
  wanderer: '#b39a9a', // dusty rose muted
};

export const lumon = {
  /** Institutional white - walls, panels (toned) */
  white: '#F0F2F4',
  /** Cold fluorescent blue - accents, screen glow */
  fluorescentBlue: '#D8E4EA',
  /** Strip light / harsh fluorescent (slightly brighter for pixel glow) */
  stripLight: '#E2ECF0',
  /** Muted sage green - floor, dividers, recessive zones */
  sage: '#C4D8C4',
  sageDark: '#A8C4A8',
  /** Refiner green - Severance MDR / macrodata glow */
  refinerGreen: '#9BB89F',
  /** Stark / ink */
  ink: '#6b7280',
  inkMuted: '#8b93a0',
  /** Agent color coding (toned down) */
  alexBlazer: '#8fa9c3',
  alexShirt: '#E8EAEC',
  samCardigan: '#9aa9ab',
  samShirt: '#96B4BA',
  jordanBlazer: '#B0A090',
  jordanBlouse: '#E2DED6',
  caseyBlazer: '#9eacb8',
  caseyShirt: '#C8D0D4',
  /** Status */
  idle: '#9aa2ab',
  working: '#79a7b8',
  alert: '#bf8f97',
} as const;

/** @deprecated use lumon */
export const severance = {
  carpet: lumon.sage,
  carpetLight: lumon.sageDark,
  wall: lumon.white,
  wallWarm: lumon.white,
  desk: lumon.white,
  lumonBlue: lumon.fluorescentBlue,
  lumonBlueLight: lumon.fluorescentBlue,
  green: lumon.sage,
  purple: '#8f8fa8',
  ink: lumon.ink,
  inkMuted: lumon.inkMuted,
  idle: lumon.idle,
  working: lumon.working,
  alert: lumon.alert,
};