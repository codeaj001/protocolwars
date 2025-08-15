import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { HoneycombGrid } from "./HoneycombGrid";
import { ParticleEffects } from "./ParticleEffects";
import { useEffect, useState } from "react";

export function Responsive3DCanvas({ onProtocolSelect, selectedProtocol, controlledProtocols }) {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight - 120 // Account for header height
      });
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <Canvas
        camera={{
          position: [0, 0, 20],
          fov: 75,
          aspect: dimensions.width / dimensions.height,
          near: 0.1,
          far: 1000
        }}
        style={{
          width: dimensions.width,
          height: dimensions.height,
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a0b2e 100%)"
        }}
      >
        {/* Ambient and directional lighting */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <directionalLight position={[5, 5, 5]} intensity={0.5} />

        {/* Orbital controls for navigation */}
        <OrbitControls 
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          minDistance={10}
          maxDistance={50}
          // Touch controls for mobile
          enableTouchRotate={true}
          enableTouchZoom={true}
          enableTouchPan={true}
        />

        {/* Honeycomb grid visualization */}
        <HoneycombGrid 
          onProtocolSelect={onProtocolSelect}
          selectedProtocol={selectedProtocol}
          controlledProtocols={controlledProtocols}
        />
        
        {/* Particle effects for TVL flow */}
        <ParticleEffects />
      </Canvas>
    </div>
  );
}
