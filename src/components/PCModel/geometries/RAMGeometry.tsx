import { materials } from '../materials';
import { useTexture } from '@react-three/drei';
import ramSideUrl from '../../../assets/ram_side.webp';

export const RAMGeometry = ({ rgbColor }: { rgbColor: string }) => {
  const ramSideTexture = useTexture(ramSideUrl);
  
  return (
    <group>
      {/* RAM PCB (Długa na osi Y, wpięta w płytę główną osiami Z) */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.04, 1.7, 0.35]} />
        <primitive object={materials.blackPlastic} attach="material" />
      </mesh>
      {/* Złote styki (Z tyłu, wchodzące w slot na płycie) */}
      <mesh position={[0, 0, -0.16]}>
        <boxGeometry args={[0.045, 1.65, 0.04]} />
        <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.3} />
      </mesh>
      {/* Metaliczny Radiator (Heat Spreader) */}
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[0.08, 1.75, 0.32]} />
        <meshStandardMaterial color="#1f2229" metalness={0.7} roughness={0.4} />
      </mesh>
      
      {/* RAM Side Textures */}
      {/* Right side (+X) */}
      <mesh position={[0.041, 0, 0.02]} rotation={[0, Math.PI / 2, Math.PI / 2]}>
        <planeGeometry args={[1.75, 0.32]} />
        <meshStandardMaterial map={ramSideTexture} roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Left side (-X) */}
      <mesh position={[-0.041, 0, 0.02]} rotation={[0, -Math.PI / 2, -Math.PI / 2]}>
        <planeGeometry args={[1.75, 0.32]} />
        <meshStandardMaterial map={ramSideTexture} roughness={0.4} metalness={0.6} />
      </mesh>

      {/* RGB Top Bar */}
      <mesh position={[0, 0, 0.2]}>
        <boxGeometry args={[0.06, 1.72, 0.04]} />
        <meshStandardMaterial color={rgbColor} emissive={rgbColor} emissiveIntensity={1.5} toneMapped={false} />
      </mesh>
    </group>
  );
};
