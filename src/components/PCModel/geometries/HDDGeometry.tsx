import { useTexture } from '@react-three/drei';
import hddTopUrl from '../../../assets/hdd_top.webp';
import hddBottomUrl from '../../../assets/hdd_bottom.webp';

export const HDDGeometry = () => {
  const hddTopTexture = useTexture(hddTopUrl);
  const hddBottomTexture = useTexture(hddBottomUrl);

  return (
    <group>
      {/* HDD Main Casing */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.0, 0.25, 1.4]} />
        <meshStandardMaterial color="#222" roughness={0.7} metalness={0.6} />
      </mesh>
      {/* Silver Top Lid */}
      <mesh position={[0, 0.13, 0]}>
        <boxGeometry args={[0.96, 0.02, 1.36]} />
        <meshStandardMaterial color="#e5e7eb" roughness={0.3} metalness={0.9} />
      </mesh>
      {/* HDD Top Texture */}
      <mesh position={[0, 0.141, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.96, 1.36]} />
        <meshStandardMaterial map={hddTopTexture} roughness={0.3} metalness={0.6} />
      </mesh>
      {/* HDD Bottom Texture */}
      <mesh position={[0, -0.126, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.0, 1.4]} />
        <meshStandardMaterial map={hddBottomTexture} roughness={0.6} metalness={0.3} />
      </mesh>
      {/* Connectors (Back) */}
      <mesh position={[0, -0.05, 0.71]}>
        <boxGeometry args={[0.6, 0.1, 0.04]} />
        <meshStandardMaterial color="#050505" roughness={0.9} />
      </mesh>
      <mesh position={[-0.2, -0.05, 0.73]}>
        <boxGeometry args={[0.2, 0.08, 0.02]} />
        <meshStandardMaterial color="#d4af37" roughness={0.4} metalness={1} />
      </mesh>
    </group>
  );
};
