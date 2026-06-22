import { useTexture } from '@react-three/drei';
import ssdTopUrl from '../../../assets/ssd_top.webp';
import ssdBottomUrl from '../../../assets/ssd_bottom.webp';

export const SSDGeometry = () => {
  const ssdTexture = useTexture(ssdTopUrl);
  const ssdBottomTexture = useTexture(ssdBottomUrl);

  return (
    <group>
      {/* M.2 PCB Background */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.22, 0.8, 0.01]} />
        <meshStandardMaterial color="#111214" roughness={0.9} />
      </mesh>
      
      {/* SSD Photorealistic Top */}
      <mesh position={[0, 0, 0.006]}>
        <planeGeometry args={[0.22, 0.8]} />
        <meshStandardMaterial map={ssdTexture} roughness={0.4} metalness={0.2} transparent={true} />
      </mesh>
      
      {/* SSD Photorealistic Bottom */}
      <mesh position={[0, 0, -0.006]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.22, 0.8]} />
        <meshStandardMaterial map={ssdBottomTexture} roughness={0.4} metalness={0.2} transparent={true} />
      </mesh>
      
      {/* Gold Connector Edge (Pins are at the bottom: -Y) */}
      <mesh position={[0, -0.39, 0]}>
        <boxGeometry args={[0.22, 0.02, 0.011]} />
        <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.3} />
      </mesh>
    </group>
  );
};
