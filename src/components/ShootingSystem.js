import { useState, useRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';

export function ShootingSystem({ 
  playerPosition, 
  targetProtocols, 
  onHit, 
  enabled = true,
  ammo = 100 
}) {
  const [projectiles, setProjectiles] = useState([]);
  const [isCharging, setIsCharging] = useState(false);
  const [chargeLevel, setChargeLevel] = useState(0);
  const projectileId = useRef(0);

  // Shooting mechanics
  const shoot = useCallback((targetPosition, power = 1, type = 'basic') => {
    if (!enabled || projectiles.length > 20) return; // Limit projectiles

    const newProjectile = {
      id: projectileId.current++,
      startPosition: new Vector3(...playerPosition),
      targetPosition: new Vector3(...targetPosition),
      currentPosition: new Vector3(...playerPosition),
      progress: 0,
      speed: 0.05 + (power * 0.03), // Speed based on charge
      power,
      type,
      life: 1.0,
      trail: []
    };

    setProjectiles(prev => [...prev, newProjectile]);
    
    // Sound effect simulation (you can integrate real audio)
    console.log(`🔫 ${type.toUpperCase()} SHOT! Power: ${power.toFixed(1)}`);
  }, [playerPosition, projectiles.length, enabled]);

  // Different shot types
  const shootBasic = useCallback((targetPosition) => {
    shoot(targetPosition, 1, 'basic');
  }, [shoot]);

  const shootCharged = useCallback((targetPosition, chargeLevel) => {
    const power = 1 + (chargeLevel * 2); // Up to 3x power
    shoot(targetPosition, power, 'charged');
  }, [shoot]);

  const shootSpread = useCallback((targetPosition) => {
    // Multiple projectiles in a spread pattern
    const angles = [-0.2, 0, 0.2];
    angles.forEach(angle => {
      const spreadTarget = new Vector3(...targetPosition);
      spreadTarget.x += Math.sin(angle) * 2;
      spreadTarget.z += Math.cos(angle) * 2;
      shoot(spreadTarget.toArray(), 0.7, 'spread');
    });
  }, [shoot]);

  const shootHoming = useCallback((targetPosition) => {
    shoot(targetPosition, 1.5, 'homing');
  }, [shoot]);

  // Update projectiles each frame
  useFrame((state, delta) => {
    setProjectiles(prev => {
      const updated = prev
        .map(projectile => {
          const { startPosition, targetPosition, currentPosition, progress, speed, trail } = projectile;
          
          // Add trail point
          if (trail.length > 10) trail.shift();
          trail.push(currentPosition.clone());

          // Update position
          const newProgress = Math.min(progress + speed, 1);
          const newPosition = startPosition.clone().lerp(targetPosition, newProgress);
          
          // Homing behavior
          if (projectile.type === 'homing' && newProgress < 0.8) {
            const time = state.clock.elapsedTime;
            newPosition.y += Math.sin(time * 10) * 0.1; // Wobble effect
          }

          // Hit detection
          if (newProgress >= 1) {
            const hitData = {
              position: targetPosition.toArray(),
              power: projectile.power,
              type: projectile.type
            };
            onHit?.(hitData);
            return null; // Mark for removal
          }

          return {
            ...projectile,
            currentPosition: newPosition,
            progress: newProgress,
            life: 1 - newProgress
          };
        })
        .filter(Boolean); // Remove null projectiles

      return updated;
    });
  });

  return {
    projectiles,
    shootBasic,
    shootCharged,
    shootSpread,
    shootHoming,
    isCharging,
    chargeLevel,
    setIsCharging,
    setChargeLevel
  };
}

// Visual projectile component
export function ProjectileVisual({ projectile }) {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current && projectile) {
      meshRef.current.position.copy(projectile.currentPosition);
    }
  });

  const getProjectileColor = () => {
    switch (projectile.type) {
      case 'charged': return '#ffff00';
      case 'spread': return '#ff6b6b';
      case 'homing': return '#9966ff';
      default: return '#4ecdc4';
    }
  };

  const getProjectileSize = () => {
    const baseSize = 0.05;
    return baseSize * (1 + projectile.power * 0.5);
  };

  return (
    <group>
      {/* Main projectile */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[getProjectileSize(), 8, 8]} />
        <meshBasicMaterial 
          color={getProjectileColor()} 
          transparent
          opacity={projectile.life}
          emissive={getProjectileColor()}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Trail effect */}
      {projectile.trail.map((position, index) => (
        <mesh key={index} position={position}>
          <sphereGeometry args={[getProjectileSize() * (index / projectile.trail.length), 4, 4]} />
          <meshBasicMaterial 
            color={getProjectileColor()}
            transparent
            opacity={0.3 * (index / projectile.trail.length)}
          />
        </mesh>
      ))}

      {/* Special effects for charged shots */}
      {projectile.type === 'charged' && (
        <mesh ref={meshRef}>
          <sphereGeometry args={[getProjectileSize() * 2, 16, 16]} />
          <meshBasicMaterial 
            color="#ffffff"
            transparent
            opacity={0.1}
            emissive="#ffff00"
            emissiveIntensity={0.2}
          />
        </mesh>
      )}
    </group>
  );
}

// Hit effect component
export function HitEffect({ position, power, type, onComplete }) {
  const groupRef = useRef();
  const [scale, setScale] = useState(0);
  const [opacity, setOpacity] = useState(1);

  useFrame((state, delta) => {
    const expandSpeed = 5 + power * 2;
    const newScale = scale + delta * expandSpeed;
    const newOpacity = Math.max(0, opacity - delta * 3);

    setScale(newScale);
    setOpacity(newOpacity);

    if (newOpacity <= 0) {
      onComplete?.();
    }
  });

  const getEffectColor = () => {
    switch (type) {
      case 'charged': return '#ffff00';
      case 'spread': return '#ff6b6b';
      case 'homing': return '#9966ff';
      default: return '#4ecdc4';
    }
  };

  return (
    <group ref={groupRef} position={position}>
      {/* Explosion ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[scale, scale, 1]}>
        <ringGeometry args={[0.3, 0.6, 16]} />
        <meshBasicMaterial 
          color={getEffectColor()}
          transparent
          opacity={opacity * 0.8}
          side={2}
        />
      </mesh>

      {/* Impact flash */}
      <mesh scale={[scale * 0.5, scale * 0.5, scale * 0.5]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshBasicMaterial 
          color="#ffffff"
          transparent
          opacity={opacity}
          emissive={getEffectColor()}
          emissiveIntensity={opacity * 0.5}
        />
      </mesh>

      {/* Particle sparks */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh 
          key={i}
          position={[
            Math.cos(i * Math.PI / 4) * scale * 0.5,
            0.1,
            Math.sin(i * Math.PI / 4) * scale * 0.5
          ]}
          scale={[1 - scale * 0.1, 1 - scale * 0.1, 1 - scale * 0.1]}
        >
          <sphereGeometry args={[0.02, 4, 4]} />
          <meshBasicMaterial 
            color={getEffectColor()}
            transparent
            opacity={opacity}
          />
        </mesh>
      ))}
    </group>
  );
}
