import { useMemo, useEffect } from 'react';
import { MeshStandardMaterial } from 'three';
import { materials } from '../materials';
import { usePCSettings } from '../../../hooks/usePC';
import { useTexture } from '@react-three/drei';
import ramSideUrl from '../../../assets/ram_side.webp';
import { XMesh as Mesh } from './XMesh';

export const RAMGeometry = ({ rgbColor }: { rgbColor: string }) => {
  const { xrayMode } = usePCSettings();
  const ramSideTexture = useTexture(ramSideUrl);
  
  const rgbMat = useMemo(() => new MeshStandardMaterial({ emissiveIntensity: 1.5, toneMapped: false }), []);
  useEffect(() => {
    rgbMat.color.set(rgbColor);
    rgbMat.emissive.set(rgbColor);
  }, [rgbColor, rgbMat]);
  useEffect(() => () => rgbMat.dispose(), [rgbMat]);
  
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
        <primitive object={materials.goldMetal} attach="material" />
      </Mesh>
      {/* Metaliczny Radiator (Heat Spreader) */}
      <Mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[0.08, 1.75, 0.32]} />
        <primitive object={materials.slateMetal} attach="material" />
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
          <primitive object={rgbMat} attach="material" />
        </Mesh>
      )}
    </group>
  );
};
