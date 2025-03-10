'use client';

import type { Engine } from 'tsparticles-engine';
import Particles from 'react-particles';
import { loadConfettiPreset } from 'tsparticles-preset-confetti';
import { loadFull } from 'tsparticles';
import { useCallback } from 'react';

export default function PolkadotParticles() {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadConfettiPreset(engine);
    await loadFull(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        particles: {
          shape: {
            type: 'circle',
          },
          color: {
            value: ['#E6007A', '#552BBF', '#00B2FF'],
          },
          size: {
            value: { min: 4, max: 10 },
          },
        },
        emitters: {
          startCount: 100,
          position: {
            x: 50,
            y: 30,
          },
          size: {
            width: 30,
            height: 30,
          },
          rate: {
            delay: 0,
            quantity: 0,
          },
          life: {
            count: 1,
            duration: 5,
            delay: 10,
          },
        },
        duration: 15,
        preset: 'confetti',
      }}
    />
  );
}
