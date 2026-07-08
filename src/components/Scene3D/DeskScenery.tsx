import { CylinderGeometry, MeshStandardMaterial, TorusGeometry, BoxGeometry, PlaneGeometry, DoubleSide, Group, Color, MathUtils, PointLight, Texture, RepeatWrapping, Mesh, Material } from 'three';

import { useEffect, useMemo, useRef, Suspense } from 'react';
import { MeshReflectorMaterial, Float, useTexture, Instances, Instance } from '@react-three/drei';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useFrame } from '@react-three/fiber';
import { usePCView, usePCRGB } from '../../hooks/usePC';
import { useIsMobile } from '../../hooks/useIsMobile';
import { blackBasicMaterial } from '../PCModel/materials';
// --- Zgodnie z AUDYTEM (Etap 20) ---
// Współdzielone geometrie i materiały dla rozsypanych elementów, 
// aby uniknąć wycieków pamięci i tworzenia nowych instancji przy re-renderach.
const screwGeo = new CylinderGeometry(0.04, 0.04, 0.06, 8);
const screwMat = new MeshStandardMaterial({ color: '#b0b5b9', metalness: 0.9, roughness: 0.3 });

const zipTieGeo = new TorusGeometry(0.15, 0.02, 8, 16, Math.PI * 1.6);
const zipTieMat = new MeshStandardMaterial({ color: '#151515', roughness: 0.8 });

const usbBodyGeo = new BoxGeometry(0.18, 0.05, 0.4);
const usbBodyMat = new MeshStandardMaterial({ color: '#2a2c30', roughness: 0.7 });
const usbTipGeo = new BoxGeometry(0.14, 0.04, 0.15);
const usbTipMat = new MeshStandardMaterial({ color: '#cccccc', metalness: 0.8, roughness: 0.2 });

const screwdriverHandleGeo = new CylinderGeometry(0.06, 0.06, 0.6, 8);
const screwdriverHandleMat = new MeshStandardMaterial({ color: '#d32f2f', roughness: 0.6 });
const screwdriverShaftGeo = new CylinderGeometry(0.02, 0.02, 0.5, 8);

const pasteBodyGeo = new CylinderGeometry(0.08, 0.08, 0.8, 16);
const pasteBodyMat = new MeshStandardMaterial({ color: '#111111', roughness: 0.5 });
const pasteLabelGeo = new CylinderGeometry(0.082, 0.082, 0.4, 16);
const pasteLabelMat = new MeshStandardMaterial({ color: '#555555', roughness: 0.8 });
const pasteTipGeo = new CylinderGeometry(0.02, 0.04, 0.2, 8);
const pastePlungerGeo = new CylinderGeometry(0.03, 0.03, 0.4, 8);

const gpuBoxGeo = new BoxGeometry(3, 0.6, 2.0);
const gpuBoxSideMat = new MeshStandardMaterial({ color: '#090a0c', roughness: 0.8 });

const moboBoxGeo = new BoxGeometry(3.5, 0.7, 3.2);
const moboBoxSideMat = new MeshStandardMaterial({ color: '#13151a', roughness: 0.9 });

// RAM (przygotowane pod teksturę)
const ramStickGeo = new BoxGeometry(1.75, 0.04, 0.32);
const ramStickMat = new MeshStandardMaterial({ color: '#1a1c20', roughness: 0.7, metalness: 0.3 }); // Zostanie zastąpiony po dodaniu tekstury

// Puszka Energetyka
const energyCanGeo = new CylinderGeometry(0.35, 0.35, 1.4, 32);
const energyCanTopMat = new MeshStandardMaterial({ color: '#d0d0d0', roughness: 0.3, metalness: 0.8 });

// Żółte Karteczki (Post-it)
const postItGeo = new PlaneGeometry(1.2, 1.2);

const blackMatDouble = new MeshStandardMaterial({ color: '#0f0f13', roughness: 0.2, metalness: 0.6, side: DoubleSide });
const blackMatSingle = new MeshStandardMaterial({ color: '#0f0f13', roughness: 0.2, metalness: 0.6 });

const crateGeo = new BoxGeometry(5, 2.0, 5);
const rugGeo = new BoxGeometry(22, 12.375, 0.04);

const AmbilightStrip = () => {
  const groupRef = useRef<Group>(null);
  const rgbColor = usePCRGB(state => state.rgbColor);
  const rgbEnabled = usePCRGB(state => state.rgbEnabled);
  const targetColor = useRef(new Color(rgbColor));
  const targetIntensity = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const dt = Math.min(delta, 0.05);
    targetColor.current.set(rgbColor);
    targetIntensity.current = MathUtils.lerp(targetIntensity.current, rgbEnabled ? 3 : 0, dt * 10);

    groupRef.current.children.forEach((child) => {
      if ((child as PointLight).isLight) {
        const light = child as PointLight;
        light.color.lerp(targetColor.current, dt * 5);
        light.intensity = targetIntensity.current;
      }
    });
  });

  return (
    <group ref={groupRef}>
      <pointLight position={[0, 2, -24]} distance={40} intensity={0} color={rgbColor} />
      <pointLight position={[0, 2, 24]} distance={40} intensity={0} color={rgbColor} />
      <pointLight position={[-24, 2, 0]} distance={40} intensity={0} color={rgbColor} />
      <pointLight position={[24, 2, 0]} distance={40} intensity={0} color={rgbColor} />
    </group>
  );
};

const Poster = ({ tex, position, rotation, size }: { tex: Texture, position: [number, number, number], rotation?: [number, number, number], size: number }) => {
  const mat = useMemo(() => new MeshStandardMaterial({
    map: tex, emissiveMap: tex, emissiveIntensity: 0.2, emissive: "#ffffff", polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1
  }), [tex]);
  useEffect(() => {
    return () => mat.dispose();
  }, [mat]);

  return (
    <group position={position} rotation={rotation || [0, 0, 0]}>
      <mesh>
        <planeGeometry args={[size + 0.2, size + 0.2]} />
        <primitive object={blackBasicMaterial} attach="material" />
      </mesh>
      <mesh material={mat}>
        <planeGeometry args={[size, size]} />
      </mesh>
    </group>
  );
};

const CorkBoard = () => {
  const texCork = useTexture(import.meta.env.BASE_URL + 'textures/posters/corkboard.webp');
  const corkMat = useMemo(() => new MeshStandardMaterial({
    map: texCork,
    roughness: 1,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1
  }), [texCork]);

  useEffect(() => {
    return () => corkMat.dispose();
  }, [corkMat]);

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
  const magMat = useMemo(() => new MeshStandardMaterial({
    map: texMag,
    roughness: 0.2,
    metalness: 0.1,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1
  }), [texMag]);

  useEffect(() => {
    return () => magMat.dispose();
  }, [magMat]);

  return (
    <mesh
      position={[-5, 0.02, 3]}
      rotation={[-Math.PI / 2, 0, 0.25]}
      material={magMat}
    >
      <planeGeometry args={[2.25, 3.0]} />
    </mesh>
  );
};

const CPUProp = () => {
  const texCPU = useTexture(import.meta.env.BASE_URL + 'textures/posters/cplu_floor.jpg');
  const cpuMat = useMemo(() => new MeshStandardMaterial({
    map: texCPU,
    roughness: 0.3,
    metalness: 0.5,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1
  }), [texCPU]);

  useEffect(() => {
    return () => cpuMat.dispose();
  }, [cpuMat]);

  return (
    <group position={[8.5, 0.02, -2.0]} rotation={[-Math.PI / 2, 0, 0.15]}>
      <mesh>
        <boxGeometry args={[0.8, 0.8, 0.04]} />
        <meshStandardMaterial color="#1a3d24" roughness={0.8} />
      </mesh>
      <mesh material={cpuMat} position={[0, 0, 0.021]}>
        <planeGeometry args={[0.8, 0.8]} />
      </mesh>
    </group>
  );
};

const Door = () => {
  const texDoor = useTexture(import.meta.env.BASE_URL + 'textures/posters/door.webp');
  const doorMat = useMemo(() => new MeshStandardMaterial({
    map: texDoor,
    roughness: 0.8,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1
  }), [texDoor]);

  useEffect(() => {
    return () => doorMat.dispose();
  }, [doorMat]);

  const enterMatrix = usePCView(state => state.enterMatrix);

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
      <mesh 
        material={doorMat} 
        onClick={(e) => { e.stopPropagation(); enterMatrix(); }}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; }}
      >
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

  useEffect(() => {
    texMbSideShort.center.set(0.5, 0.5);
    texMbSideShort.rotation = Math.PI / 2;
    texMbSideShort.needsUpdate = true;
  }, [texMbSideShort]);

  const { gpuBoxMaterials, moboBoxMaterials, energyCanMaterials, ramFloorMaterials, postItMaterials, mugMaterial } = useMemo(() => {
    const texSideShortMirrored = texSideShort.clone();
    texSideShortMirrored.wrapS = RepeatWrapping;
    texSideShortMirrored.repeat.x = -1;
    texSideShortMirrored.needsUpdate = true;

    const texMbSideShortMirrored = texMbSideShort.clone();
    texMbSideShortMirrored.wrapT = RepeatWrapping; // Use wrapT because it's rotated
    texMbSideShortMirrored.repeat.y = -1; // Flip on Y since it's rotated 90 deg
    texMbSideShortMirrored.needsUpdate = true;

    return {
      gpuBoxMaterials: [
        new MeshStandardMaterial({ map: texSideShortMirrored, roughness: 0.4 }),
        new MeshStandardMaterial({ map: texSideShort, roughness: 0.4 }),
        new MeshStandardMaterial({ map: texGpuBox, roughness: 0.4 }),
        gpuBoxSideMat,
        new MeshStandardMaterial({ map: texSideLong, roughness: 0.4 }),
        new MeshStandardMaterial({ map: texSideLong, roughness: 0.4 }),
      ],
      moboBoxMaterials: [
        new MeshStandardMaterial({ map: texMbSideShortMirrored, roughness: 0.4 }),
        new MeshStandardMaterial({ map: texMbSideShort, roughness: 0.4 }),
        new MeshStandardMaterial({ map: texMbBox, roughness: 0.4 }),
        moboBoxSideMat,
        new MeshStandardMaterial({ map: texMbSideLong, roughness: 0.4 }),
        new MeshStandardMaterial({ map: texMbSideLong, roughness: 0.4 }),
      ],
      energyCanMaterials: [
        new MeshStandardMaterial({ map: texEnergyCan, roughness: 0.3, metalness: 0.8 }),
        new MeshStandardMaterial({ map: texCanTop, roughness: 0.3, metalness: 0.8 }),
        energyCanTopMat,
      ],
      ramFloorMaterials: [
        ramStickMat,
        ramStickMat,
        new MeshStandardMaterial({ map: texRamFloor, roughness: 0.5, metalness: 0.2 }),
        ramStickMat,
        ramStickMat,
        ramStickMat,
      ],
      postItMaterials: [
        new MeshStandardMaterial({ map: texNote1, roughness: 0.9 }),
        new MeshStandardMaterial({ map: texNote2, roughness: 0.9 })
      ],
      mugMaterial: new MeshStandardMaterial({ map: texNewMug, emissiveMap: texNewMug, emissiveIntensity: 0.2, emissive: "#ffffff", polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 })
    };
  }, [texSideShort, texGpuBox, texSideLong, texEnergyCan, texCanTop, texRamFloor, texNote1, texNote2, texMbBox, texMbSideLong, texMbSideShort, texNewMug]);

  useEffect(() => {
    return () => {
      gpuBoxMaterials[0].map?.dispose();
      moboBoxMaterials[0].map?.dispose();

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

export const DeskEssentials = () => {
  const [texRug, texCrate] = useTexture([
    import.meta.env.BASE_URL + 'textures/posters/desk_rug.webp',
    import.meta.env.BASE_URL + 'textures/posters/wood_crate.webp'
  ]);

  const { rugMat, crateMat } = useMemo(() => ({
    rugMat: new MeshStandardMaterial({ map: texRug, roughness: 0.9 }),
    crateMat: new MeshStandardMaterial({ map: texCrate, roughness: 0.9, metalness: 0.0 })
  }), [texRug, texCrate]);

  useEffect(() => {
    return () => {
      rugMat.dispose();
      crateMat.dispose();
    };
  }, [rugMat, crateMat]);

  return (
    <>
      <mesh position={[0, 1.02, 0]} geometry={crateGeo} material={crateMat} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} geometry={rugGeo} material={rugMat} />
    </>
  );
};

export const LoftWalls = () => {
  const tex = useTexture(import.meta.env.BASE_URL + 'images/red_brick.webp');
  
  const mat = useMemo(() => {
    const clonedTex = tex.clone();
    clonedTex.wrapS = RepeatWrapping;
    clonedTex.wrapT = RepeatWrapping;
    clonedTex.repeat.set(12, 6);
    
    return new MeshStandardMaterial({
      color: '#ffffff',
      map: clonedTex,
      bumpMap: clonedTex,
      bumpScale: 0.1,
      roughness: 0.95,
      metalness: 0.05
    });
  }, [tex]);

  useEffect(() => {
    return () => {
      mat.map?.dispose();
      mat.dispose();
    };
  }, [mat]);

  return (
    <group position={[0, 10, 0]}>
      {/* Tylna ściana - cofnięta za plakat (Z=-26.0) */}
      <mesh position={[0, 0, -26.0]} receiveShadow>
        <planeGeometry args={[60, 30]} />
        <primitive object={mat} attach="material" />
      </mesh>
      {/* Lewa ściana - cofnięta za tablicę (X=-25.5) */}
      <mesh position={[-25.5, 0, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[60, 30]} />
        <primitive object={mat} attach="material" />
      </mesh>
      {/* Prawa ściana - cofnięta za drzwi (X=25.5) */}
      <mesh position={[25.5, 0, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[60, 30]} />
        <primitive object={mat} attach="material" />
      </mesh>
    </group>
  );
};

export const SkylightCeiling = () => {
  const glassMat = useMemo(() => new MeshStandardMaterial({
    color: '#aaccff',
    transparent: true,
    opacity: 0.2,
    roughness: 0.1,
    metalness: 0.9,
    side: DoubleSide,
    depthWrite: false
  }), []);

  const frameMat = useMemo(() => new MeshStandardMaterial({
    color: '#1a1a1c',
    roughness: 0.8,
    metalness: 0.8
  }), []);

  // Znacznie pogrubione w osi Y (wysokość 1.2), by mocno wystawały z góry i z dołu
  const beamGeoX = useMemo(() => new BoxGeometry(60, 1.2, 0.6), []);
  const beamGeoZ = useMemo(() => new BoxGeometry(0.6, 1.2, 60), []);

  useEffect(() => {
    return () => {
      glassMat.dispose();
      frameMat.dispose();
      beamGeoX.dispose();
      beamGeoZ.dispose();
    };
  }, [glassMat, frameMat, beamGeoX, beamGeoZ]);

  return (
    <group position={[0, 25, 0]}>
      {/* Szklana tafla */}
      <mesh rotation={[Math.PI / 2, 0, 0]} material={glassMat}>
        <planeGeometry args={[60, 60]} />
      </mesh>

      {/* Loftowe szprosy metalowe używające InstancedMesh dla wydajności */}
      <Instances limit={5} geometry={beamGeoX} material={frameMat} frustumCulled={false}>
        {[-20, -10, 0, 10, 20].map((z, i) => <Instance key={`x-${i}`} position={[0, 0, z]} />)}
      </Instances>
      <Instances limit={5} geometry={beamGeoZ} material={frameMat} frustumCulled={false}>
        {[-20, -10, 0, 10, 20].map((x, i) => <Instance key={`z-${i}`} position={[x, 0, 0]} />)}
      </Instances>
    </group>
  );
};

export const DioramaFrame = () => {
  const tex = useTexture(import.meta.env.BASE_URL + 'images/dark_loft_brick.webp');
  
  const frameMatHorizontal = useMemo(() => {
    const clonedTex = tex.clone();
    clonedTex.wrapS = RepeatWrapping;
    clonedTex.wrapT = RepeatWrapping;
    // Dopasowanie skali cegieł (51 szerokości / 5 = ~10 powtórzeń, 2 wysokości / 5 = 0.4)
    clonedTex.repeat.set(10, 0.4);
    
    return new MeshStandardMaterial({
      color: '#ffffff',
      map: clonedTex,
      bumpMap: clonedTex,
      bumpScale: 0.1,
      roughness: 0.95,
      metalness: 0.05
    });
  }, [tex]);

  const frameMatVertical = useMemo(() => {
    const clonedTex = tex.clone();
    clonedTex.wrapS = RepeatWrapping;
    clonedTex.wrapT = RepeatWrapping;
    // Dopasowanie skali cegieł (2 szerokości / 5 = 0.4, 21 wysokości / 5 = ~4.2)
    // UWAGA: Nie obracamy cegieł, żeby leżały naturalnie poziomo!
    clonedTex.repeat.set(0.4, 4.2);
    
    return new MeshStandardMaterial({
      color: '#ffffff',
      map: clonedTex,
      bumpMap: clonedTex,
      bumpScale: 0.1,
      roughness: 0.95,
      metalness: 0.05
    });
  }, [tex]);

  // Grubsza rama, schowana do wewnątrz sceny (Zasada Dioramy)
  const beamGeoX = useMemo(() => new BoxGeometry(51, 2, 2), []);
  // Skrócona wysokość pionowych belek (z 25 na 21), aby zapobiec Z-fighting na rogach
  const beamGeoY = useMemo(() => new BoxGeometry(2, 21, 2), []);

  useEffect(() => {
    return () => {
      frameMatHorizontal.map?.dispose();
      frameMatHorizontal.dispose();
      frameMatVertical.map?.dispose();
      frameMatVertical.dispose();
      beamGeoX.dispose();
      beamGeoY.dispose();
    };
  }, [frameMatHorizontal, frameMatVertical, beamGeoX, beamGeoY]);

  return (
    <group position={[0, 0, 29.0]}>
      {/* Dolna belka - wchodzi na podłogę */}
      <mesh position={[0, 1.0, 0]} geometry={beamGeoX} material={frameMatHorizontal} />
      {/* Górna belka - chowa się pod sufit */}
      <mesh position={[0, 24.0, 0]} geometry={beamGeoX} material={frameMatHorizontal} />
      {/* Lewa belka - wchodzi za lewą ścianę */}
      <mesh position={[-24.5, 12.5, 0]} geometry={beamGeoY} material={frameMatVertical} />
      {/* Prawa belka - wchodzi za prawą ścianę */}
      <mesh position={[24.5, 12.5, 0]} geometry={beamGeoY} material={frameMatVertical} />
    </group>
  );
};

export const DeskScenery = () => {
  const xrayMode = usePCView(state => state.xrayMode);
  const isMobile = useIsMobile();
  const reflectorMeshRef = useRef<Mesh>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    return () => {
      if (reflectorMeshRef.current?.material) {
        (reflectorMeshRef.current.material as Material).dispose();
      }
    };
  }, []);

  if (xrayMode || isMobile) return null;

  return (
    <group position={[0, -4.1, 0]}>
      <mesh ref={reflectorMeshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[60, 60]} />
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

      <Suspense fallback={null}>
        <DeskEssentials />
      </Suspense>

      <Suspense fallback={null}>
        <DeskDetails reducedMotion={reducedMotion} />
        <AmbilightStrip />
        <CorkBoard />
        <Magazine />
        <CPUProp />
        <Door />
        <LoftWalls />
        <SkylightCeiling />
        <DioramaFrame />
      </Suspense>
    </group>
  );
};
