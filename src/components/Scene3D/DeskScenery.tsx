import * as THREE from 'three';
import { useEffect, useMemo } from 'react';
import { MeshReflectorMaterial, Float, useTexture, Instances, Instance } from '@react-three/drei';
import { usePCSettings } from '../../hooks/usePC';
import { useIsMobile } from '../../hooks/useIsMobile';

// --- Zgodnie z AUDYTEM (Etap 20) ---
// Współdzielone geometrie i materiały dla rozsypanych elementów, 
// aby uniknąć wycieków pamięci i tworzenia nowych instancji przy re-renderach.
const screwGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.06, 8);
const screwMat = new THREE.MeshStandardMaterial({ color: '#b0b5b9', metalness: 0.9, roughness: 0.3 });

const zipTieGeo = new THREE.TorusGeometry(0.15, 0.02, 8, 16, Math.PI * 1.6);
const zipTieMat = new THREE.MeshStandardMaterial({ color: '#151515', roughness: 0.8 });

const usbBodyGeo = new THREE.BoxGeometry(0.18, 0.05, 0.4);
const usbBodyMat = new THREE.MeshStandardMaterial({ color: '#2a2c30', roughness: 0.7 });
const usbTipGeo = new THREE.BoxGeometry(0.14, 0.04, 0.15);
const usbTipMat = new THREE.MeshStandardMaterial({ color: '#cccccc', metalness: 0.8, roughness: 0.2 });

const screwdriverHandleGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.6, 8);
const screwdriverHandleMat = new THREE.MeshStandardMaterial({ color: '#d32f2f', roughness: 0.6 });
const screwdriverShaftGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.5, 8);

const pasteBodyGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.8, 16);
const pasteBodyMat = new THREE.MeshStandardMaterial({ color: '#111111', roughness: 0.5 });
const pasteLabelGeo = new THREE.CylinderGeometry(0.082, 0.082, 0.4, 16);
const pasteLabelMat = new THREE.MeshStandardMaterial({ color: '#555555', roughness: 0.8 });
const pasteTipGeo = new THREE.CylinderGeometry(0.02, 0.04, 0.2, 8);
const pastePlungerGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.4, 8);

const gpuBoxGeo = new THREE.BoxGeometry(3, 0.6, 2.0);
const gpuBoxSideMat = new THREE.MeshStandardMaterial({ color: '#090a0c', roughness: 0.8 });

// RAM (przygotowane pod teksturę)
const ramStickGeo = new THREE.BoxGeometry(1.75, 0.04, 0.32);
const ramStickMat = new THREE.MeshStandardMaterial({ color: '#1a1c20', roughness: 0.7, metalness: 0.3 }); // Zostanie zastąpiony po dodaniu tekstury

// Puszka Energetyka
const energyCanGeo = new THREE.CylinderGeometry(0.35, 0.35, 1.4, 32);
const energyCanTopMat = new THREE.MeshStandardMaterial({ color: '#d0d0d0', roughness: 0.3, metalness: 0.8 });

// Żółte Karteczki (Post-it)
const postItGeo = new THREE.PlaneGeometry(1.2, 1.2);

const ScatteredItems = () => {
  return (
    <group position={[0, 0.04, 0]}>
      {/* Śrubki krzyżakowe (rozrzucone pod monitorem/komputerem) */}
      {[
        [-2.5, 3.5, 0.5], [-2.2, 3.8, 1.2], [-1.8, 3.4, -0.4],
        [2.1, 3.2, 0.8], [2.4, 3.6, -1.5], [1.5, 4.0, 2.1]
      ].map((pos, i) => (
        <mesh
          key={`screw-${i}`}
          geometry={screwGeo}
          material={screwMat}
          position={[pos[0], 0, pos[1]]}
          rotation={[Math.PI / 2, 0, pos[2]]}
          castShadow
        />
      ))}

      {/* Śrubokręt krzyżakowy */}
      <group position={[-4, 0.03, 3]} rotation={[0, 0.4, Math.PI / 2]}>
        <mesh geometry={screwdriverHandleGeo} material={screwdriverHandleMat} position={[0, -0.25, 0]} castShadow />
        <mesh geometry={screwdriverShaftGeo} material={screwMat} position={[0, 0.3, 0]} castShadow />
      </group>

      {/* Pasta Termoprzewodząca */}
      <group position={[3.5, 0.04, 3.8]} rotation={[0, -0.6, Math.PI / 2]}>
        <mesh geometry={pasteBodyGeo} material={pasteBodyMat} castShadow />
        <mesh geometry={pasteLabelGeo} material={pasteLabelMat} castShadow />
        <mesh geometry={pasteTipGeo} material={screwMat} position={[0, 0.5, 0]} castShadow />
        <mesh geometry={pastePlungerGeo} material={pasteBodyMat} position={[0, -0.6, 0]} castShadow />
      </group>

      {/* Pendrive (Bootowalny USB) */}
      <group position={[4.8, 0.01, 2.5]} rotation={[0, 0.2, 0]}>
        <mesh geometry={usbBodyGeo} material={usbBodyMat} castShadow />
        <mesh geometry={usbTipGeo} material={usbTipMat} position={[0, 0, -0.27]} castShadow />
      </group>

      {/* Zgubione Trytytki */}
      <mesh geometry={zipTieGeo} material={zipTieMat} position={[-3.5, 0.01, 1.5]} rotation={[-Math.PI / 2 + 0.1, 0, 0.5]} castShadow />
      <mesh geometry={zipTieGeo} material={zipTieMat} position={[-3.6, 0.01, 1.7]} rotation={[-Math.PI / 2 - 0.1, 0, 1.2]} castShadow />
    </group>
  );
};

export const DeskScenery = () => {
  const { xrayMode } = usePCSettings();
  // Wczytywanie tekstur plakatów i scenografii
  const [texIO, texCPU, texOS, texRug, texBug, texNewMug, texRam, texSpag, texCrate, texGpuBox, texSideLong, texSideShort, texEnergyCan, texCanTop, texRamFloor, texNote1, texNote2] = useTexture([
    import.meta.env.BASE_URL + 'textures/posters/poster_io.webp',
    import.meta.env.BASE_URL + 'textures/posters/poster_cpu_war.webp',
    import.meta.env.BASE_URL + 'textures/posters/poster_os_war.webp',
    import.meta.env.BASE_URL + 'textures/posters/desk_rug.webp',
    import.meta.env.BASE_URL + 'textures/posters/poster_bug.webp',
    import.meta.env.BASE_URL + 'textures/posters/new_mug_screen.webp',
    import.meta.env.BASE_URL + 'textures/posters/poster_ram.webp',
    import.meta.env.BASE_URL + 'textures/posters/poster_spaghetti.webp',
    import.meta.env.BASE_URL + 'textures/posters/wood_crate.webp',
    import.meta.env.BASE_URL + 'textures/posters/gpu_box.webp',
    import.meta.env.BASE_URL + 'textures/posters/side_long.webp',
    import.meta.env.BASE_URL + 'textures/posters/side_short.webp',
    import.meta.env.BASE_URL + 'textures/posters/energy_drink.webp',
    import.meta.env.BASE_URL + 'textures/posters/can_top.webp',
    import.meta.env.BASE_URL + 'textures/posters/ram_floor.webp',
    import.meta.env.BASE_URL + 'textures/posters/note1.webp',
    import.meta.env.BASE_URL + 'textures/posters/note2.webp'
  ]);

  const isMobile = useIsMobile();

  // Zgodnie z audytem: zarządzanie pamięcią dla materiałów z teksturami
  const { gpuBoxMaterials, energyCanMaterials, ramFloorMaterials, postItMaterials } = useMemo(() => {
    // Odbicie lustrzane tekstury dla boku bliżej PC (prawy bok pudełka)
    const texSideShortMirrored = texSideShort.clone();
    texSideShortMirrored.wrapS = THREE.RepeatWrapping;
    texSideShortMirrored.repeat.x = -1;
    texSideShortMirrored.needsUpdate = true;

    return {
      gpuBoxMaterials: [
        new THREE.MeshStandardMaterial({ map: texSideShortMirrored, roughness: 0.4 }), // right (+X face, towards PC)
        new THREE.MeshStandardMaterial({ map: texSideShort, roughness: 0.4 }), // left (-X face, away from PC)
        new THREE.MeshStandardMaterial({ map: texGpuBox, roughness: 0.4 }), // top
        gpuBoxSideMat, // bottom
        new THREE.MeshStandardMaterial({ map: texSideLong, roughness: 0.4 }), // front (+Z face)
        new THREE.MeshStandardMaterial({ map: texSideLong, roughness: 0.4 }), // back (-Z face)
      ],
      energyCanMaterials: [
        new THREE.MeshStandardMaterial({ map: texEnergyCan, roughness: 0.2, metalness: 0.5 }), // side
        new THREE.MeshStandardMaterial({ map: texCanTop, roughness: 0.3, metalness: 0.8 }), // top (zawleczka)
        energyCanTopMat // bottom (zwykłe srebro)
      ],
      ramFloorMaterials: [
        ramStickMat, // right
        ramStickMat, // left
        new THREE.MeshStandardMaterial({ map: texRamFloor, roughness: 0.5, metalness: 0.6 }), // top (nadruk kości RAM)
        ramStickMat, // bottom
        new THREE.MeshStandardMaterial({ color: '#ffcc00', metalness: 1.0, roughness: 0.2 }), // front (długa ściana - złote piny)
        ramStickMat  // back
      ],
      postItMaterials: [
        new THREE.MeshStandardMaterial({ map: texNote1, color: '#ffffff', roughness: 0.9, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }),
        new THREE.MeshStandardMaterial({ map: texNote2, color: '#ffffff', roughness: 0.9, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 })
      ]
    };
  }, [texGpuBox, texSideLong, texSideShort, texEnergyCan, texCanTop, texRamFloor, texNote1, texNote2]);

  useEffect(() => {
    return () => {
      // Zwalniamy nowo utworzone materiały oraz sklonowaną teksturę
      const mirroredMap = (gpuBoxMaterials[0] as THREE.MeshStandardMaterial).map;
      if (mirroredMap) mirroredMap.dispose();

      gpuBoxMaterials[0].dispose();
      gpuBoxMaterials[1].dispose();
      gpuBoxMaterials[2].dispose();
      gpuBoxMaterials[4].dispose();
      gpuBoxMaterials[5].dispose();

      energyCanMaterials[0].dispose(); // Zwolnienie boku puszki
      energyCanMaterials[1].dispose(); // Zwolnienie góry puszki (nowy materiał z teksturą zawleczki)

      ramFloorMaterials[2].dispose(); // Zwolnienie górnego materiału kości RAM z teksturą
      ramFloorMaterials[4].dispose(); // Zwolnienie złotych pinów

      postItMaterials[0].dispose(); // Zwolnienie pierwszej karteczki
      postItMaterials[1].dispose(); // Zwolnienie drugiej karteczki
    };
  }, [gpuBoxMaterials, energyCanMaterials, ramFloorMaterials, postItMaterials]);

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
      <group position={[6.8, 0, 4]} scale={0.7}>
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

      {/* Pudełko po karcie graficznej (zgodne z audytem - dispose zaimplementowany) */}
      <mesh
        geometry={gpuBoxGeo}
        material={gpuBoxMaterials}
        position={[-6.5, 0.34, 2]}
        rotation={[0, 0.25, 0]}
        castShadow
      />

      {/* Luźne kości RAM (Zasada 4: Instances) */}
      <Instances limit={10} geometry={ramStickGeo} material={ramFloorMaterials} castShadow frustumCulled={false}>
        <Instance position={[1.5, 0.04, 3.6]} rotation={[0, 0.5, 0]} />
        <Instance position={[1.8, 0.04, 4.1]} rotation={[0, 0.7, 0]} />
      </Instances>

      {/* Puszka Energetyka (Zasada 6: Współdzielone geo/mat) */}
      <mesh
        geometry={energyCanGeo}
        material={energyCanMaterials}
        position={[5.5, 0.74, 2.5]}
        rotation={[0, 0.5, 0]}
        castShadow
      />

      {/* Żółte Karteczki (Post-it) (Zasada 1: polygonOffset) */}
      {/* Karteczka na brzegu biurka z hasłem */}
      <mesh geometry={postItGeo} material={postItMaterials[0]} position={[-2.2, 0.1, 4.8]} rotation={[-Math.PI / 2, 0, 0.2]} receiveShadow />

      {/* Karteczka obok energetyka z wiadomością od developera */}
      <mesh geometry={postItGeo} material={postItMaterials[1]} position={[3.5, 0.1, 5.4]} rotation={[-Math.PI / 2, 0, -0.1]} receiveShadow />

      {/* Rozsypane detale na dywanie (zgodne z audytem) */}
      <ScatteredItems />

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
