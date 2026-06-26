import { MeshReflectorMaterial, Float, useTexture } from '@react-three/drei';
import { usePCSettings } from '../../hooks/usePC';
import { useIsMobile } from '../../hooks/useIsMobile';

export const DeskScenery = () => {
  const { xrayMode } = usePCSettings();
  // Wczytywanie tekstur plakatów
  const [texIO, texCPU, texOS] = useTexture([
    import.meta.env.BASE_URL + 'textures/posters/poster_io.webp',
    import.meta.env.BASE_URL + 'textures/posters/poster_cpu_war.webp',
    import.meta.env.BASE_URL + 'textures/posters/poster_os_war.webp'
  ]);

  const isMobile = useIsMobile();

  // Ukrywamy biurko w całości podczas X-Ray lub na mobile (zgodnie z prośbą)
  if (xrayMode || isMobile) return null;

  return (
    <group position={[0, -4.1, 0]}>
      {/* Blat Biurka */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <MeshReflectorMaterial
          blur={[300, 100]} // Odbicie rozmyte kierunkowo
          resolution={512} // Optymalna rozdzielczość dla wydajności
          mixBlur={1} // Mieszanie odbicia z kolorem blatu
          mixStrength={20} // Siła odbicia
          roughness={0.5}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#151515" // Ciemny, elegancki kolor węgla / czarnego drewna
          metalness={0.5}
          mirror={1}
        />
      </mesh>

      {/* Ściana z plakatami w tle */}
      <group position={[0, 12, -25]}>
        <Float speed={1.5} rotationIntensity={0.05} floatIntensity={0.2}>
          {/* Lewy Plakat (CPU War) */}
          <mesh position={[-12, 0, 2]} rotation={[0, 0.2, 0]}>
            <planeGeometry args={[8, 8]} />
            <meshStandardMaterial map={texCPU} emissiveMap={texCPU} emissiveIntensity={0.2} emissive="#ffffff" />
            <mesh position={[0, 0, -0.01]}>
              <planeGeometry args={[8.2, 8.2]} />
              <meshBasicMaterial color="#000000" />
            </mesh>
          </mesh>

          {/* Środkowy Plakat (OS War) */}
          <mesh position={[0, 1.5, 0]}>
            <planeGeometry args={[9, 9]} />
            <meshStandardMaterial map={texOS} emissiveMap={texOS} emissiveIntensity={0.2} emissive="#ffffff" />
            <mesh position={[0, 0, -0.01]}>
              <planeGeometry args={[9.2, 9.2]} />
              <meshBasicMaterial color="#000000" />
            </mesh>
          </mesh>

          {/* Prawy Plakat (IO Shield) */}
          <mesh position={[12, 0, 2]} rotation={[0, -0.2, 0]}>
            <planeGeometry args={[8, 8]} />
            <meshStandardMaterial map={texIO} emissiveMap={texIO} emissiveIntensity={0.2} emissive="#ffffff" />
            <mesh position={[0, 0, -0.01]}>
              <planeGeometry args={[8.2, 8.2]} />
              <meshBasicMaterial color="#000000" />
            </mesh>
          </mesh>
        </Float>
      </group>
    </group>
  );
};
