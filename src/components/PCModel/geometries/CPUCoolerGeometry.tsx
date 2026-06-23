import { useRef } from 'react';
import { Group } from 'three';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import heatsinkUrl from '../../../assets/heatsink.webp';
import heatsinkSideUrl from '../../../assets/heatsink_side.webp';
import aioFanUrl from '../../../assets/aio_fan.webp';
import caseFanUrl from '../../../assets/case_fan.webp';
import { usePCSettings } from '../../../hooks/usePC';
import { LocalAirflowParticles } from './LocalAirflowParticles';

export const FanGeometry = ({ rgbColor, isExhaust = false, textureUrl }: { rgbColor: string, isExhaust?: boolean, textureUrl?: string }) => {
  const { xrayMode } = usePCSettings();
  const fanTexture = useTexture(textureUrl || caseFanUrl);
  const bladesRef = useRef<Group>(null);

  useFrame((_state, delta) => {
    if (bladesRef.current) {
      bladesRef.current.rotation.z += delta * 15;
    }
  });

  return (
    <group>
      {/* Inner Physical Blades (visible in X-Ray mode) */}
      <group position={[0, 0, 0]} ref={bladesRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.05, 16]} />
          <meshStandardMaterial color="#151515" roughness={0.6} />
        </mesh>
        {[0, 1, 2, 3, 4, 5, 6].map(i => (
          <mesh key={i} rotation={[0, 0, (Math.PI * 2 / 7) * i]}>
            <boxGeometry args={[0.9, 0.15, 0.02]} />
            <meshStandardMaterial color="#222" roughness={0.5} />
          </mesh>
        ))}
      </group>

      {/* Outer Frame */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1, 1, 0.2]} />
        <meshStandardMaterial color="#151515" roughness={0.7} />
      </mesh>
      
      {/* Front Face Texture */}
      {!xrayMode && (
        <mesh position={[0, 0, 0.101]}>
          <planeGeometry args={[1, 1]} />
          <meshStandardMaterial map={fanTexture} roughness={0.4} metalness={0.3} transparent={false} alphaTest={0.5} />
        </mesh>
      )}
      {/* Front RGB LED Ring */}
      <mesh position={[0, 0, 0.103]}>
        <torusGeometry args={[0.44, 0.025, 16, 64]} />
        <meshStandardMaterial color={rgbColor} emissive={rgbColor} emissiveIntensity={3} toneMapped={false} />
      </mesh>

      {/* Back Face Texture */}
      {!xrayMode && (
        <mesh position={[0, 0, -0.101]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[1, 1]} />
          <meshStandardMaterial map={fanTexture} roughness={0.4} metalness={0.3} transparent={false} alphaTest={0.5} />
        </mesh>
      )}
      {/* Back RGB LED Ring */}
      <mesh position={[0, 0, -0.103]} rotation={[0, Math.PI, 0]}>
        <torusGeometry args={[0.44, 0.025, 16, 64]} />
        <meshStandardMaterial color={rgbColor} emissive={rgbColor} emissiveIntensity={3} toneMapped={false} />
      </mesh>

      {/* Airflow */}
      <group position={[0, 0, 0]} rotation={[0, Math.PI, 0]}>
        <LocalAirflowParticles count={80} radius={0.4} length={2.5} speedMult={2} color={isExhaust ? "#ef4444" : "#38bdf8"} />
      </group>
    </group>
  );
};


export const CPUCoolerGeometry = ({ rgbColor }: { rgbColor: string }) => {
  const heatsinkTexture = useTexture(heatsinkUrl);
  const heatsinkSideTexture = useTexture(heatsinkSideUrl);
  
  return (
    <group>
      {/* Base Contact */}
      <mesh position={[0, 0, -0.25]}>
        <boxGeometry args={[0.6, 0.6, 0.05]} />
        <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Heatpipes */}
      {[-0.15, 0, 0.15].map((x, i) => (
        <mesh key={i} position={[x, 0, -0.1]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.3, 16]} />
          <meshStandardMaterial color="#b0b5b9" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}
      {/* Fin Stack - shifted to Z=0.12 and shortened to 0.54 depth to prevent overlapping/smudging with the Fan at Z=0.5 */}
      <mesh position={[0, 0.1, 0.12]}>
        <boxGeometry args={[1, 0.8, 0.54]} />
        <meshStandardMaterial attach="material-0" map={heatsinkSideTexture} metalness={0.8} roughness={0.3} />
        <meshStandardMaterial attach="material-1" map={heatsinkSideTexture} metalness={0.8} roughness={0.3} />
        <meshStandardMaterial attach="material-2" map={heatsinkTexture} metalness={0.8} roughness={0.3} />
        <meshStandardMaterial attach="material-3" map={heatsinkTexture} metalness={0.8} roughness={0.3} />
        <meshStandardMaterial attach="material-4" map={heatsinkTexture} metalness={0.8} roughness={0.3} />
        <meshStandardMaterial attach="material-5" color="#b0b5b9" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Top Cover */}
      <mesh position={[0, 0.51, 0.12]}>
        <boxGeometry args={[1, 0.02, 0.54]} />
        <meshStandardMaterial map={heatsinkTexture} metalness={0.6} roughness={0.4} />
      </mesh>
    {/* Attached Fan */}
    <group position={[0, 0.1, 0.5]}>
      <FanGeometry rgbColor={rgbColor} textureUrl={aioFanUrl} />
    </group>
  </group>
  );
};
