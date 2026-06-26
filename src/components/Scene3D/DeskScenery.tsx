import * as THREE from 'three';
import { MeshReflectorMaterial, Float, useTexture } from '@react-three/drei';
import { usePCSettings } from '../../hooks/usePC';
import { useIsMobile } from '../../hooks/useIsMobile';

export const DeskScenery = () => {
  const { xrayMode } = usePCSettings();
  // Wczytywanie tekstur plakatów i scenografii
  const [texIO, texCPU, texOS, texRug, texBug, texNewMug, texRam, texSpag, texCrate] = useTexture([
    import.meta.env.BASE_URL + 'textures/posters/poster_io.webp',
    import.meta.env.BASE_URL + 'textures/posters/poster_cpu_war.webp',
    import.meta.env.BASE_URL + 'textures/posters/poster_os_war.webp',
    import.meta.env.BASE_URL + 'textures/posters/desk_rug.webp',
    import.meta.env.BASE_URL + 'textures/posters/poster_bug.webp',
    import.meta.env.BASE_URL + 'textures/posters/new_mug_screen.webp',
    import.meta.env.BASE_URL + 'textures/posters/poster_ram.webp',
    import.meta.env.BASE_URL + 'textures/posters/poster_spaghetti.webp',
    import.meta.env.BASE_URL + 'textures/posters/wood_crate.webp'
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

      {/* Drewniana Skrzynia (Podstawka pod PC) */}
      <mesh position={[0, 1.02, 0]}>
        <boxGeometry args={[5, 2.0, 5]} />
        <meshStandardMaterial
          map={texCrate}
          roughness={0.9}
          metalness={0.0}
        />
      </mesh>

      {/* Podkładka na biurko (Dywan Turecki) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <boxGeometry args={[22, 12.375, 0.04]} />
        <meshStandardMaterial
          map={texRug}
          roughness={0.9}
        />
      </mesh>

      {/* Kubek Apkmasondev */}
      <group position={[6, 0, 4]} scale={0.7}>
        {/* Ścianki kubka (otwarte od góry) */}
        <mesh position={[0, 1, 0]}>
          {/* radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded */}
          <cylinderGeometry args={[0.8, 0.8, 2, 16, 1, true]} />
          <meshStandardMaterial color="#0f0f13" roughness={0.2} metalness={0.6} side={THREE.DoubleSide} />
        </mesh>

        {/* Dno kubka */}
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.8, 16]} />
          <meshStandardMaterial color="#0f0f13" roughness={0.2} metalness={0.6} side={THREE.DoubleSide} />
        </mesh>

        {/* Ucho kubka */}
        <mesh position={[0.8, 1, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <torusGeometry args={[0.5, 0.15, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#0f0f13" roughness={0.2} metalness={0.6} />
        </mesh>

        {/* Zakrzywiony Wyświetlacz na kubku (z wygenerowaną grafiką) */}
        <mesh position={[0, 1, 0]} rotation={[0, 0, 0]}>
          {/* thetaStart = -0.6 (lekko w lewo), thetaLength = 1.2 (kąt wycinka) */}
          <cylinderGeometry args={[0.81, 0.81, 1.3, 16, 1, true, -0.6, 1.2]} />
          <meshStandardMaterial
            map={texNewMug}
            emissiveMap={texNewMug}
            emissiveIntensity={0.2}
            emissive="#ffffff"
            polygonOffset={true}
            polygonOffsetFactor={-1}
            polygonOffsetUnits={-1}
          />
        </mesh>
      </group>

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

      {/* Ściana z plakatami za plecami gracza */}
      <group position={[0, 12, 25]} rotation={[0, Math.PI, 0]}>
        <Float speed={1.5} rotationIntensity={0.05} floatIntensity={0.2}>
          {/* Lewy Plakat (Bug Feature) */}
          <mesh position={[-12, 0, 2]} rotation={[0, 0.2, 0]}>
            <planeGeometry args={[8, 8]} />
            <meshStandardMaterial map={texBug} emissiveMap={texBug} emissiveIntensity={0.2} emissive="#ffffff" />
            <mesh position={[0, 0, -0.01]}>
              <planeGeometry args={[8.2, 8.2]} />
              <meshBasicMaterial color="#000000" />
            </mesh>
          </mesh>

          {/* Środkowy Plakat (Download More RAM) */}
          <mesh position={[0, 1.5, 0]}>
            <planeGeometry args={[9, 9]} />
            <meshStandardMaterial map={texRam} emissiveMap={texRam} emissiveIntensity={0.2} emissive="#ffffff" />
            <mesh position={[0, 0, -0.01]}>
              <planeGeometry args={[9.2, 9.2]} />
              <meshBasicMaterial color="#000000" />
            </mesh>
          </mesh>

          {/* Prawy Plakat (Spaghetti Code) */}
          <mesh position={[12, 0, 2]} rotation={[0, -0.2, 0]}>
            <planeGeometry args={[8, 8]} />
            <meshStandardMaterial map={texSpag} emissiveMap={texSpag} emissiveIntensity={0.2} emissive="#ffffff" />
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
