import React from 'react';
import { usePCSettings } from '../../../hooks/usePC';
import { xrayMaterial } from '../materials';
import { materials } from '../materials';
import { useTexture } from '@react-three/drei';
import ramSideUrl from '../../../assets/ram_side.webp';


const Mesh = ({ children, material, ...props }: any) => {
  const { xrayMode } = usePCSettings();
  const filteredChildren = React.Children.map(children, (child) => {
    if (!child) return null;
    if (xrayMode) {
      if (child.type === 'meshStandardMaterial' || child.type === 'meshPhysicalMaterial' || child.type === 'primitive') {
        return null;
      }
    }
    return child;
  });
  return (
    <mesh material={xrayMode ? xrayMaterial : material} {...props}>
      {filteredChildren}
    </mesh>
  );
};

export const RAMGeometry = ({ rgbColor }: { rgbColor: string }) => {
  const { xrayMode } = usePCSettings();
  const ramSideTexture = useTexture(ramSideUrl);
  
  return (
    <group>
      {/* RAM PCB (Długa na osi Y, wpięta w płytę główną osiami Z) */}
      <Mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.04, 1.7, 0.35]} />
        <primitive object={materials.blackPlastic} attach="material" />
      </Mesh>
      {/* Złote styki (Z tyłu, wchodzące w slot na płycie) */}
      <Mesh position={[0, 0, -0.16]}>
        <boxGeometry args={[0.045, 1.65, 0.04]} />
        <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.3} />
      </Mesh>
      {/* Metaliczny Radiator (Heat Spreader) */}
      <Mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[0.08, 1.75, 0.32]} />
        <meshStandardMaterial color="#1f2229" metalness={0.7} roughness={0.4} />
      </Mesh>
      
      {/* RAM Side Textures */}
      {/* Right side (+X) */}
      <Mesh position={[0.041, 0, 0.02]} rotation={[0, Math.PI / 2, Math.PI / 2]}>
        <planeGeometry args={[1.75, 0.32]} />
        <meshStandardMaterial map={ramSideTexture} roughness={0.4} metalness={0.6} />
      </Mesh>
      {/* Left side (-X) */}
      <Mesh position={[-0.041, 0, 0.02]} rotation={[0, -Math.PI / 2, -Math.PI / 2]}>
        <planeGeometry args={[1.75, 0.32]} />
        <meshStandardMaterial map={ramSideTexture} roughness={0.4} metalness={0.6} />
      </Mesh>

      {/* RGB Top Bar - hide when xrayMode is active */}
      {!xrayMode && (
        <Mesh position={[0, 0, 0.2]}>
          <boxGeometry args={[0.06, 1.72, 0.04]} />
          <meshStandardMaterial color={rgbColor} emissive={rgbColor} emissiveIntensity={1.5} toneMapped={false} />
        </Mesh>
      )}
    </group>
  );
};
