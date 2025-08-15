import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function ParticleEffects() {
  const particlesRef = useRef();
  
  // Create particle system
  const { positions, colors, velocities } = useMemo(() => {
    const particleCount = 200;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Random positions in space
      positions[i3] = (Math.random() - 0.5) * 30;     // x
      positions[i3 + 1] = (Math.random() - 0.5) * 20; // y
      positions[i3 + 2] = (Math.random() - 0.5) * 30; // z

      // Random velocities for flow effect
      velocities[i3] = (Math.random() - 0.5) * 0.02;     // x velocity
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.01; // y velocity  
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.02; // z velocity

      // Colors representing different types of value flow
      const colorType = Math.random();
      if (colorType < 0.3) {
        // Gold for high value flows
        colors[i3] = 1.0;     // r
        colors[i3 + 1] = 0.8; // g
        colors[i3 + 2] = 0.2; // b
      } else if (colorType < 0.6) {
        // Blue for stable flows
        colors[i3] = 0.3;     // r
        colors[i3 + 1] = 0.7; // g
        colors[i3 + 2] = 1.0; // b
      } else {
        // Green for yield flows
        colors[i3] = 0.2;     // r
        colors[i3 + 1] = 1.0; // g
        colors[i3 + 2] = 0.4; // b
      }
    }

    return { positions, colors, velocities };
  }, []);

  // Animation loop for particles
  useFrame((state) => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array;
      
      for (let i = 0; i < positions.length; i += 3) {
        // Apply velocity
        positions[i] += velocities[i];
        positions[i + 1] += velocities[i + 1];
        positions[i + 2] += velocities[i + 2];

        // Wrap around bounds to create continuous flow
        if (positions[i] > 15) positions[i] = -15;
        if (positions[i] < -15) positions[i] = 15;
        if (positions[i + 1] > 10) positions[i + 1] = -10;
        if (positions[i + 1] < -10) positions[i + 1] = 10;
        if (positions[i + 2] > 15) positions[i + 2] = -15;
        if (positions[i + 2] < -15) positions[i + 2] = 15;
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
