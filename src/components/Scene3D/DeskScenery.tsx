import * as THREE from 'three';
import { useEffect, useMemo, useRef, useState, Suspense } from 'react';
import { MeshReflectorMaterial, Float, useTexture, Instances, Instance } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { usePCView, usePCRGB } from '../../hooks/usePC';
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

const moboBoxGeo = new THREE.BoxGeometry(3.5, 0.7, 3.2);
const moboBoxSideMat = new THREE.MeshStandardMaterial({ color: '#13151a', roughness: 0.9 });

// RAM (przygotowane pod teksturę)
const ramStickGeo = new THREE.BoxGeometry(1.75, 0.04, 0.32);
const ramStickMat = new THREE.MeshStandardMaterial({ color: '#1a1c20', roughness: 0.7, metalness: 0.3 }); // Zostanie zastąpiony po dodaniu tekstury

// Puszka Energetyka
const energyCanGeo = new THREE.CylinderGeometry(0.35, 0.35, 1.4, 32);
const energyCanTopMat = new THREE.MeshStandardMaterial({ color: '#d0d0d0', roughness: 0.3, metalness: 0.8 });

// Żółte Karteczki (Post-it)
const postItGeo = new THREE.PlaneGeometry(1.2, 1.2);

const blackMatDouble = new THREE.MeshStandardMaterial({ color: '#0f0f13', roughness: 0.2, metalness: 0.6, side: THREE.DoubleSide });
const blackMatSingle = new THREE.MeshStandardMaterial({ color: '#0f0f13', roughness: 0.2, metalness: 0.6 });

const crateGeo = new THREE.BoxGeometry(5, 2.0, 5);
const rugGeo = new THREE.BoxGeometry(22, 12.375, 0.04);

const AmbilightStrip = () => {
  const groupRef = useRef<THREE.Group>(null);
  const rgbColor = usePCRGB((state: any) => state.rgbColor);
  const rgbEnabled = usePCRGB((state: any) => state.rgbEnabled);
  const targetColor = useRef(new THREE.Color(rgbColor));
  const targetIntensity = useRef(3);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    targetColor.current.set(rgbColor);
    targetIntensity.current = THREE.MathUtils.lerp(targetIntensity.current, rgbEnabled ? 3 : 0, delta * 10);
    
    groupRef.current.children.forEach((child) => {
      if ((child as THREE.PointLight).isLight) {
        const light = child as THREE.PointLight;
        light.color.lerp(targetColor.current, delta * 5);
        light.intensity = targetIntensity.current;
      }
    });
  });

  return (
    <group ref={groupRef}>
      <pointLight position={[0, 2, -24]} distance={40} intensity={3} color={rgbColor} />
      <pointLight position={[0, 2, 24]} distance={40} intensity={3} color={rgbColor} />
      <pointLight position={[-24, 2, 0]} distance={40} intensity={3} color={rgbColor} />
      <pointLight position={[24, 2, 0]} distance={40} intensity={3} color={rgbColor} />
    </group>
  );
};

const Poster = ({ tex, position, rotation, size }: { tex: THREE.Texture, position: [number, number, number], rotation?: [number, number, number], size: number }) => {
  return (
    <group position={position} rotation={rotation || [0, 0, 0]}>
      <mesh>
        <planeGeometry args={[size + 0.2, size + 0.2]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <mesh>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial map={tex} emissiveMap={tex} emissiveIntensity={0.2} emissive="#ffffff" polygonOffset={true} polygonOffsetFactor={-1} polygonOffsetUnits={-1} />
      </mesh>
    </group>
  );
};

const CorkBoard = () => {
  const texCork = useTexture(import.meta.env.BASE_URL + 'textures/posters/corkboard.webp');
  const corkMat = useMemo(() => new THREE.MeshStandardMaterial({ 
    map: texCork, 
    roughness: 1, 
    polygonOffset: true, 
    polygonOffsetFactor: -1, 
    polygonOffsetUnits: -1 
  }), [texCork]);
  
  return (
    <Float speed={1} rotationIntensity={0.05} floatIntensity={0.2}>
      <group position={[-25, 10, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh>
          <planeGeometry args={[16.2, 10.2]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        <mesh material={corkMat}>
          <planeGeometry args={[16, 10]} />
        </mesh>
      </group>
    </Float>
  );
};


const Magazine = () => {
  const texMag = useTexture(import.meta.env.BASE_URL + 'textures/posters/magazine.webp');

  return (
    <mesh
      position={[-5, 0.02, 3]}
      rotation={[-Math.PI / 2, 0, 0.25]}
    >
      <planeGeometry args={[1.5, 2.0]} />
      <meshStandardMaterial
        map={texMag}
        roughness={0.2}
        metalness={0.1}
        polygonOffset={true}
        polygonOffsetFactor={-1}
        polygonOffsetUnits={-1}
      />
    </mesh>
  );
};

const Door = () => {
  const texDoor = useTexture(import.meta.env.BASE_URL + 'textures/posters/door.webp');
  const doorMat = useMemo(() => new THREE.MeshStandardMaterial({ 
    map: texDoor, 
    roughness: 0.8, 
    polygonOffset: true, 
    polygonOffsetFactor: -1, 
    polygonOffsetUnits: -1 
  }), [texDoor]);
  
  // Zakładamy proporcje 1:2 dla klasycznych drzwi. Wysokość 22 oznacza Y=11 dla idealnego styku z podłogą (Y=0)
  const width = 11;
  const height = 22;
  const border = 0.4;
  
  return (
    <group position={[25, height / 2, -2]} rotation={[0, -Math.PI / 2, 0]}>
      {/* Czarna futryna pod spodem, korzystamy z polygonOffset by uniknąć Z-Fighting */}
      <mesh>
        <planeGeometry args={[width + border, height + border]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      {/* Tekstura drzwi na wierzchu */}
      <mesh material={doorMat}>
        <planeGeometry args={[width, height]} />
      </mesh>
    </group>
  );
};

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


const DeskDetails = ({ reducedMotion }: { reducedMotion: boolean }) => {
  const [texIO, texCPU, texOS, texBug, texNewMug, texRam, texSpag, texGpuBox, texSideLong, texSideShort, texEnergyCan, texCanTop, texRamFloor, texNote1, texNote2, texMbBox, texMbSideLong, texMbSideShort] = useTexture([
    import.meta.env.BASE_URL + 'textures/posters/poster_io.webp',
    import.meta.env.BASE_URL + 'textures/posters/poster_cpu_war.webp',
    import.meta.env.BASE_URL + 'textures/posters/poster_os_war.webp',
    import.meta.env.BASE_URL + 'textures/posters/poster_bug.webp',
    import.meta.env.BASE_URL + 'textures/posters/new_mug_screen.webp',
    import.meta.env.BASE_URL + 'textures/posters/poster_ram.webp',
    import.meta.env.BASE_URL + 'textures/posters/poster_spaghetti.webp',
    import.meta.env.BASE_URL + 'textures/posters/gpu_box.webp',
    import.meta.env.BASE_URL + 'textures/posters/side_long.webp',
    import.meta.env.BASE_URL + 'textures/posters/side_short.webp',
    import.meta.env.BASE_URL + 'textures/posters/energy_drink.webp',
    import.meta.env.BASE_URL + 'textures/posters/can_top.webp',
    import.meta.env.BASE_URL + 'textures/posters/ram_floor.webp',
    import.meta.env.BASE_URL + 'textures/posters/note1.webp',
    import.meta.env.BASE_URL + 'textures/posters/note2.webp',
    import.meta.env.BASE_URL + 'textures/posters/mb_box.webp',
    import.meta.env.BASE_URL + 'textures/posters/mb_side_long.webp',
    import.meta.env.BASE_URL + 'textures/posters/mb_side_short.webp'
  ]);

  const { gpuBoxMaterials, moboBoxMaterials, energyCanMaterials, ramFloorMaterials, postItMaterials, mugMaterial } = useMemo(() => {
    const texSideShortMirrored = texSideShort.clone();
    texSideShortMirrored.wrapS = THREE.RepeatWrapping;
    texSideShortMirrored.repeat.x = -1;
    texSideShortMirrored.needsUpdate = true;

    texMbSideShort.center.set(0.5, 0.5);
    texMbSideShort.rotation = Math.PI / 2;
    texMbSideShort.needsUpdate = true;

    const texMbSideShortMirrored = texMbSideShort.clone();
    texMbSideShortMirrored.wrapT = THREE.RepeatWrapping; // Use wrapT because it's rotated
    texMbSideShortMirrored.repeat.y = -1; // Flip on Y since it's rotated 90 deg
    texMbSideShortMirrored.needsUpdate = true;

    return {
      gpuBoxMaterials: [
        new THREE.MeshStandardMaterial({ map: texSideShortMirrored, roughness: 0.4 }),
        new THREE.MeshStandardMaterial({ map: texSideShort, roughness: 0.4 }),
        new THREE.MeshStandardMaterial({ map: texGpuBox, roughness: 0.4 }),
        gpuBoxSideMat,
        new THREE.MeshStandardMaterial({ map: texSideLong, roughness: 0.4 }),
        new THREE.MeshStandardMaterial({ map: texSideLong, roughness: 0.4 }),
      ],
      moboBoxMaterials: [
        new THREE.MeshStandardMaterial({ map: texMbSideShortMirrored, roughness: 0.4 }),
        new THREE.MeshStandardMaterial({ map: texMbSideShort, roughness: 0.4 }),
        new THREE.MeshStandardMaterial({ map: texMbBox, roughness: 0.4 }),
        moboBoxSideMat,
        new THREE.MeshStandardMaterial({ map: texMbSideLong, roughness: 0.4 }),
        new THREE.MeshStandardMaterial({ map: texMbSideLong, roughness: 0.4 }),
      ],
      energyCanMaterials: [
        new THREE.MeshStandardMaterial({ map: texEnergyCan, roughness: 0.3, metalness: 0.8 }),
        new THREE.MeshStandardMaterial({ map: texCanTop, roughness: 0.3, metalness: 0.8 }),
        energyCanTopMat,
      ],
      ramFloorMaterials: [
        ramStickMat,
        ramStickMat,
        new THREE.MeshStandardMaterial({ map: texRamFloor, roughness: 0.5, metalness: 0.2 }),
        ramStickMat,
        ramStickMat,
        ramStickMat,
      ],
      postItMaterials: [
        new THREE.MeshStandardMaterial({ map: texNote1, roughness: 0.9 }),
        new THREE.MeshStandardMaterial({ map: texNote2, roughness: 0.9 })
      ],
      mugMaterial: new THREE.MeshStandardMaterial({ map: texNewMug, emissiveMap: texNewMug, emissiveIntensity: 0.2, emissive: "#ffffff", polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 })
    };
  }, [texSideShort, texGpuBox, texSideLong, texEnergyCan, texCanTop, texRamFloor, texNote1, texNote2, texMbBox, texMbSideLong, texMbSideShort, texNewMug]);

  useEffect(() => {
    return () => {
      gpuBoxMaterials.forEach((m) => { if (m !== gpuBoxSideMat) m.dispose(); });
      moboBoxMaterials.forEach((m) => { if (m !== moboBoxSideMat) m.dispose(); });
      energyCanMaterials.forEach((m) => { if (m !== energyCanTopMat) m.dispose(); });
      ramFloorMaterials.forEach((m) => { if (m !== ramStickMat) m.dispose(); });

      postItMaterials[0].dispose();
      postItMaterials[1].dispose();
      mugMaterial.dispose();
    };
  }, [gpuBoxMaterials, moboBoxMaterials, energyCanMaterials, ramFloorMaterials, postItMaterials, mugMaterial]);

  return (
    <>
      <group position={[6.8, 0, 4]} scale={0.7}>
        {/* Outer wall */}
        <mesh position={[0, 1, 0]}>
          <cylinderGeometry args={[0.8, 0.8, 2, 16, 1, true]} />
          <primitive object={blackMatDouble} attach="material" />
        </mesh>
        {/* Inner wall for thickness */}
        <mesh position={[0, 1, 0]}>
          <cylinderGeometry args={[0.74, 0.74, 2, 16, 1, true]} />
          <primitive object={blackMatDouble} attach="material" />
        </mesh>
        {/* Top Rim */}
        <mesh position={[0, 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.74, 0.8, 16]} />
          <primitive object={blackMatDouble} attach="material" />
        </mesh>
        {/* Bottom */}
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.8, 16]} />
          <primitive object={blackMatDouble} attach="material" />
        </mesh>
        <mesh position={[0.8, 1, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <torusGeometry args={[0.5, 0.15, 8, 16, Math.PI]} />
          <primitive object={blackMatSingle} attach="material" />
        </mesh>
        <mesh position={[0, 1, 0]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.81, 0.81, 1.3, 16, 1, true, -0.6, 1.2]} />
          <primitive object={mugMaterial} attach="material" />
        </mesh>
      </group>

      <mesh geometry={moboBoxGeo} material={moboBoxMaterials} position={[-5.7, 0.35, -2.3]} rotation={[0, -0.15, 0]} castShadow receiveShadow />
      <mesh geometry={gpuBoxGeo} material={gpuBoxMaterials} position={[-7.2, 0.35, 2.5]} rotation={[0, 0.25, 0]} castShadow receiveShadow />

      <Instances limit={10} geometry={ramStickGeo} material={ramFloorMaterials} castShadow frustumCulled={false}>
        <Instance position={[1.1, 0.04, 4.7]} rotation={[0, 0.5, 0]} />
        <Instance position={[1.9, 0.04, 5]} rotation={[0, 0.7, 0]} />
      </Instances>

      <mesh geometry={energyCanGeo} material={energyCanMaterials} position={[5.5, 0.74, 2.5]} rotation={[0, 0.5, 0]} castShadow />

      <mesh geometry={postItGeo} material={postItMaterials[0]} position={[-2.2, 0.1, 4.8]} rotation={[-Math.PI / 2, 0, 0.2]} receiveShadow />
      <mesh geometry={postItGeo} material={postItMaterials[1]} position={[3.5, 0.1, 5.4]} rotation={[-Math.PI / 2, 0, -0.1]} receiveShadow />

      <ScatteredItems />

      <group position={[0, 12, -25]}>
        <Float speed={reducedMotion ? 0 : 1.5} rotationIntensity={reducedMotion ? 0 : 0.05} floatIntensity={reducedMotion ? 0 : 0.2}>
          <Poster tex={texCPU} position={[-12, 0, 2]} rotation={[0, 0.2, 0]} size={8} />
          <Poster tex={texOS} position={[0, 1.5, 0]} size={9} />
          <Poster tex={texIO} position={[12, 0, 2]} rotation={[0, -0.2, 0]} size={8} />
        </Float>
      </group>

      <group position={[0, 12, 25]} rotation={[0, Math.PI, 0]}>
        <Float speed={reducedMotion ? 0 : 1.5} rotationIntensity={reducedMotion ? 0 : 0.05} floatIntensity={reducedMotion ? 0 : 0.2}>
          <Poster tex={texBug} position={[-12, 0, 2]} rotation={[0, 0.2, 0]} size={8} />
          <Poster tex={texRam} position={[0, 1.5, 0]} size={9} />
          <Poster tex={texSpag} position={[12, 0, 2]} rotation={[0, -0.2, 0]} size={8} />
        </Float>
      </group>
    </>
  );
};

export const DeskScenery = () => {
  const { xrayMode } = usePCView();
  const [texRug, texCrate] = useTexture([
    import.meta.env.BASE_URL + 'textures/posters/desk_rug.webp',
    import.meta.env.BASE_URL + 'textures/posters/wood_crate.webp'
  ]);

  const isMobile = useIsMobile();
  const reflectorMeshRef = useRef<THREE.Mesh>(null);

  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false
  );
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const { rugMat, crateMat } = useMemo(() => ({
    rugMat: new THREE.MeshStandardMaterial({ map: texRug, roughness: 0.9 }),
    crateMat: new THREE.MeshStandardMaterial({ map: texCrate, roughness: 0.9, metalness: 0.0 })
  }), [texRug, texCrate]);

  useEffect(() => {
    return () => {
      if (reflectorMeshRef.current?.material) {
        (reflectorMeshRef.current.material as THREE.Material).dispose();
      }
      rugMat.dispose();
      crateMat.dispose();
    };
  }, [rugMat, crateMat]);

  if (xrayMode || isMobile) return null;

  return (
    <group position={[0, -4.1, 0]}>
      <mesh ref={reflectorMeshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={512}
          mixBlur={1}
          mixStrength={20}
          roughness={0.5}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#151515"
          metalness={0.5}
          mirror={1}
        />
      </mesh>

      <mesh position={[0, 1.02, 0]} geometry={crateGeo} material={crateMat} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} geometry={rugGeo} material={rugMat} />

      <Suspense fallback={null}>
        <DeskDetails reducedMotion={reducedMotion} />
        <AmbilightStrip />
        <CorkBoard />
        <Magazine />
        <Door />
      </Suspense>
    </group>
  );
};
