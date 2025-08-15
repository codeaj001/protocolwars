import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Billboard } from "@react-three/drei";
import * as THREE from "three";
import { useWallet } from "@solana/wallet-adapter-react";
import { mockProtocols } from "../utils/mockData";
import { useHoneycombTraits } from "../honeycomb/traits";

export function HoneycombGrid({ onProtocolSelect, selectedProtocol, controlledProtocols = [] }) {
  const groupRef = useRef();

  // Calculate hexagon positions in honeycomb pattern
  const hexagons = useMemo(() => {
    const hexagons = [];
    const radius = 2;
    const rows = 5;
    const cols = 6;

    let protocolIndex = 0;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (protocolIndex >= mockProtocols.length) break;

        const x = col * radius * 1.5 - (cols * radius * 1.5) / 2;
        const z = row * radius * Math.sqrt(3) - (rows * radius * Math.sqrt(3)) / 2;
        
        // Offset every other row
        const offsetX = row % 2 === 1 ? radius * 0.75 : 0;
        
        const protocol = mockProtocols[protocolIndex];
        hexagons.push({
          position: [x + offsetX, 0, z],
          protocol,
          id: protocolIndex
        });
        
        protocolIndex++;
      }
    }

    return hexagons;
  }, []);

  const handleProtocolSelect = (protocol, id) => {
    const protocolWithState = {
      ...protocol,
      id,
      playerOwned: controlledProtocols.includes(id)
    };
    if (onProtocolSelect) {
      onProtocolSelect(protocolWithState);
    }
  };

  return (
    <group ref={groupRef}>
      {hexagons.map(({ position, protocol, id }) => {
        const isPlayerOwned = controlledProtocols.includes(id);
        const isCurrentlySelected = selectedProtocol?.id === id;
        
        return (
          <HexagonProtocol
            key={id}
            position={position}
            protocol={protocol}
            id={id}
            isSelected={isCurrentlySelected}
            playerOwned={isPlayerOwned}
            onClick={() => handleProtocolSelect(protocol, id)}
          />
        );
      })}
    </group>
  );
}

function HexagonProtocol({ position, protocol, id, isSelected, playerOwned, onClick }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Scale hexagon based on TVL
  const scale = useMemo(() => {
    const baseScale = 0.8;
    const tvlScale = Math.min(protocol.tvl / 1000000, 2); // Cap at 2x scale
    return baseScale + tvlScale * 0.5;
  }, [protocol.tvl]);

  // Color based on protocol type and ownership state
  const color = useMemo(() => {
    if (playerOwned) return '#00ff88'; // Bright green for player owned
    if (isSelected) return '#ffff00'; // Yellow for selected
    
    const colors = {
      lending: '#ff6b6b',
      dex: '#4ecdc4', 
      derivatives: '#45b7d1',
      yield: '#96ceb4',
      insurance: '#feca57'
    };
    return colors[protocol.type] || '#ffffff';
  }, [protocol.type, playerOwned, isSelected]);

  // Animation loop
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime + id) * 0.1;
      
      // Scale animation based on traits
      const targetScale = scale + (hovered ? 0.2 : 0) + (isSelected ? 0.3 : 0);
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, 1, targetScale), 
        0.1
      );

      // Rotation for selected protocols
      if (isSelected) {
        meshRef.current.rotation.y += 0.01;
      }
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(event) => {
        event.stopPropagation();
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Hexagon geometry */}
      <cylinderGeometry args={[1, 1, 0.2, 6]} />
      
      {/* Material with protocol-specific styling */}
      <meshStandardMaterial
        color={color}
        transparent
        opacity={hovered || isSelected ? 0.9 : 0.7}
        emissive={color}
        emissiveIntensity={hovered || isSelected ? 0.3 : 0.1}
        metalness={0.3}
        roughness={0.4}
      />

      {/* Protocol name and info labels */}
      <Billboard
        follow={true}
        lockX={false}
        lockY={false}
        lockZ={false}
        position={[0, 0.3, 0]}
      >
        <Text
          color={color}
          fontSize={0.15}
          maxWidth={2}
          lineHeight={1}
          letterSpacing={0.02}
          textAlign="center"
          font="https://fonts.gstatic.com/s/raleway/v14/1Ptrg8zYS_SKggPNwK4vaqI.woff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {protocol.name}
        </Text>
      </Billboard>
      
      {/* Enhanced info display when hovered or selected */}
      {(hovered || isSelected) && (
        <Billboard
          follow={true}
          lockX={false}
          lockY={false}
          lockZ={false}
          position={[0, 0.6, 0]}
        >
          <Text
            color={"#ffffff"}
            fontSize={0.1}
            maxWidth={3}
            lineHeight={1.2}
            letterSpacing={0.02}
            textAlign="center"
            font="https://fonts.gstatic.com/s/raleway/v14/1Ptrg8zYS_SKggPNwK4vaqI.woff"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.01}
            outlineColor="#000000"
          >
            {`TVL: $${(protocol.tvl / 1000000).toFixed(1)}M\nType: ${protocol.type.toUpperCase()}\n${playerOwned ? "CONTROLLED" : "AVAILABLE"}`}
          </Text>
        </Billboard>
      )}
      
      {/* Status indicator ring */}
      {playerOwned && (
        <mesh position={[0, 0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.1, 1.2, 32]} />
          <meshBasicMaterial color="#00ff88" transparent opacity={0.8} />
        </mesh>
      )}
      
      {/* Selection indicator ring */}
      {isSelected && (
        <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.2, 1.3, 32]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={0.6} />
        </mesh>
      )}
    </mesh>
  );
}
