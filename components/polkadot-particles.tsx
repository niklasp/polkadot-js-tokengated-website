import type { Container, Engine } from "tsparticles-engine";
import Particles from "react-particles";
import { loadConfettiPreset } from "tsparticles-preset-confetti";
import { loadFull } from "tsparticles";
import { useCallback } from "react"

export default function PolkadotParticles() {

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadConfettiPreset(engine);
    await loadFull(engine);
  }, []);
  
  const particlesLoaded = useCallback(async (container: Container | undefined) => {
    await console.log(container);
  }, []);

    return (

    <Particles
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoaded}
        options={{
          particles: {
            // add circle shape emitter
            shape: {
              type: "circle",
            },
            color: {
              value: ["#E6007A", "#552BBF", "#00B2FF"],
            },
            size: {
              value: { min: 5, max: 10 }
            },
          },
          emitters: {
            "startCount": 200,
            "position": {
              "x": 50,
              "y": 50
            },
            "size": {
              "width": 30,
              "height": 30,
            },
            "rate": {
              "delay": 0,
              "quantity": 0
            },
            life: {
              count: 1,
              duration: 3,
              delay: 0
            },
          },
          duration: 9,
          preset: "confetti",
        }}
      />
    )
}
