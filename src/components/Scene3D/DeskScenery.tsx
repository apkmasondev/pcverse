import React, { useState, useEffect } from 'react';
import { MeshReflectorMaterial, ContactShadows, Float, useTexture } from '@react-three/drei';
import { usePCSettings, usePCSelection } from '../../hooks/usePC';
import { useIsMobile } from '../../hooks/useIsMobile';

export const DeskScenery = () => {
  const { xrayMode } = usePCSettings();
  const { explodeStep } = usePCSelection();
  const [bakeKey, setBakeKey] = useState(0);
  const [isBaking, setIsBaking] = useState(false);

  useEffect(() => {
    setIsBaking(true); // Ukryj cienie podczas animacji i oczekiwania na wypiek
    // Kiedy stan 'explodeStep' się zmienia, odczekaj (aż zakończy się animacja)
    // i wymuś ponowne wygenerowanie cienia (1 klatka), aby uniknąć smug i złych wypieków.
    const timer = setTimeout(() => {
      setBakeKey(prev => prev + 1);
      setIsBaking(false); // Pokaż cienie po wygenerowaniu nowej klatki
    }, 2000);
    return () => clearTimeout(timer);
  }, [explodeStep]);

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
      {/* Cienie Kontaktowe rzucane przez komputer na biurko */}
      <ContactShadows
        key={bakeKey}
        position={[0, 0.01, 0]} // Minimalnie nad blatem by uniknąć z-fighting
        opacity={isBaking ? 0 : 0.8}
        scale={10}
        blur={2}
        far={4}
        resolution={512}
        color="#000000"
        frames={1}
      />

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
