import { materials, xrayMaterial } from '../materials';
import { useTexture } from '@react-three/drei';
import ssdTopUrl from '../../../assets/ssd_top.webp';
import ssdBottomUrl from '../../../assets/ssd_bottom.webp';
import { usePCSettings } from '../../../hooks/usePC';

export const SSDGeometry = () => {
  const { xrayMode } = usePCSettings();
  const ssdTexture = useTexture(ssdTopUrl);
  const ssdBottomTexture = useTexture(ssdBottomUrl);

  return (
    <group>
      {/* M.2 PCB Background */}
      <mesh position={[0, 0, 0]} material={xrayMode ? xrayMaterial : undefined}>
        <boxGeometry args={[0.22, 0.8, 0.01]} />
        {!xrayMode && <primitive object={materials.darkGrayPlastic} attach="material" />}
      </mesh>
      
      {/* SSD Photorealistic Top */}
      <mesh position={[0, 0, 0.006]} material={xrayMode ? xrayMaterial : undefined}>
        <planeGeometry args={[0.22, 0.8]} />
        {!xrayMode && <meshStandardMaterial map={ssdTexture} roughness={0.4} metalness={0.2} transparent={true} />}
      </mesh>
      
      {/* SSD Photorealistic Bottom */}
      <mesh position={[0, 0, -0.006]} rotation={[0, Math.PI, 0]} material={xrayMode ? xrayMaterial : undefined}>
        <planeGeometry args={[0.22, 0.8]} />
        {!xrayMode && <meshStandardMaterial map={ssdBottomTexture} roughness={0.4} metalness={0.2} transparent={true} />}
      </mesh>
      
      {/* Gold Connector Edge (Pins are at the bottom: -Y) */}
      <mesh position={[0, -0.39, 0]} material={xrayMode ? xrayMaterial : undefined}>
        <boxGeometry args={[0.22, 0.02, 0.011]} />
        {!xrayMode && <primitive object={materials.goldMetal} attach="material" />}
      </mesh>
    </group>
  );
};
