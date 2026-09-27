import React from 'react';
import PolarGlobe from './PolarGlobe';

export default function GlobalPolarBackground() {
  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
      style={{ willChange: 'transform, opacity' }}
      aria-hidden="true"
    >
      <PolarGlobe
        autoRotate={true}
        rotationSpeed={0.0012}
        className="w-full h-full"
      />
      <div className="absolute inset-0 polar-vignette pointer-events-none opacity-75" />
    </div>
  );
}
