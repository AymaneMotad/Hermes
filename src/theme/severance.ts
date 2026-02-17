/**
 * Lumon / Severance visual design:
 * Institutional whites, cold fluorescent blues, muted sage greens, stark shadows.
 * 5000K–6000K "eternal afternoon", harsh clinical lighting.
 * Colors toned down ~20% — if it pops, it's wrong.
 */

import type { PersonaBehavior } from '@/types/persona';

/** Role-based accent stripe (low saturation). Torso = base, sleeve darker, accent = stripe. */
export const ROLE_ACCENT: Record<PersonaBehavior, string> = {
  coordinator: '#1a2838', // deep ink
  focused: '#3d5a6a', // muted blue
  social: '#5a6b5c', // soft sage
  wanderer: '#6b5a5a', // dusty rose muted
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
  ink: '#25282A',
  inkMuted: '#54585a',
  /** Agent color coding (toned down) */
  alexBlazer: '#1a3648',
  alexShirt: '#E8EAEC',
  samCardigan: '#424e4f',
  samShirt: '#96B4BA',
  jordanBlazer: '#B0A090',
  jordanBlouse: '#E2DED6',
  caseyBlazer: '#4e5c68',
  caseyShirt: '#C8D0D4',
  /** Status */
  idle: '#6a7278',
  working: '#3d7a94',
  alert: '#8e4a4a',
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