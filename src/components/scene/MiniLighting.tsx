'use client';

import type { ThreeElements } from '@react-three/fiber';

/**
 * Lumon / Severance: 1 cold directional (5600K), 1 soft fill.
 * No warm light. Subtle shadow softness. Slight green tint in ambient.
 */
const COLD_5600K = '#F2F6FA';
const FILL_SOFT = '#E2ECE8';

type AmbientLightProps = ThreeElements['ambientLight'];
type DirectionalLightProps = ThreeElements['directionalLight'];

const ambientProps: AmbientLightProps = { intensity: 0.6, color: FILL_SOFT };
const keyLightProps: DirectionalLightProps = {
  position: [0, 1.5, 0.8],
  intensity: 0.9,
  color: COLD_5600K,
  castShadow: true,
  'shadow-mapSize-width': 512,
  'shadow-mapSize-height': 512,
  'shadow-bias': -0.0001,
  'shadow-radius': 2,
};
const fillLightProps: DirectionalLightProps = {
  position: [0.5, 0.8, 0.5],
  intensity: 0.2,
  color: FILL_SOFT,
};

export function MiniLighting() {
  return (
    <>
      <ambientLight {...ambientProps} />
      <directionalLight {...keyLightProps} />
      <directionalLight {...fillLightProps} />
    </>
  );
}
