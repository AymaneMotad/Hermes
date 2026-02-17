'use client';

import { OrbitControls } from '@react-three/drei';

/**
 * Camera rig for the mini 3D scene: orbit controls so the user can pan/rotate/zoom.
 * Used by MiniScene; no props required.
 */
export function MiniCameraRig() {
  return (
    <OrbitControls
      enablePan
      enableZoom
      enableRotate
      minDistance={1.2}
      maxDistance={6}
      maxPolarAngle={Math.PI / 2}
    />
  );
}
