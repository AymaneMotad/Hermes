'use client';

/**
 * Lumon / Severance: 1 cold directional (5600K), 1 soft fill.
 * No warm light. Subtle shadow softness. Slight green tint in ambient.
 */
const COLD_5600K = '#F2F6FA';
const FILL_SOFT = '#E2ECE8';

export function MiniLighting() {
  return (
    <>
      <ambientLight intensity={0.6} color={FILL_SOFT} />
      <directionalLight
        position={[0, 1.5, 0.8]}
        intensity={0.9}
        color={COLD_5600K}
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
        shadow-bias={-0.0001}
        shadow-radius={2}
      />
      <directionalLight position={[0.5, 0.8, 0.5]} intensity={0.2} color={FILL_SOFT} />
    </>
  );
}
