import { MathUtils, MeshStandardMaterial, Group, Color } from 'three';

import { fanBladesRefsY } from '../FanManager';
import { materials } from '../materials';
import { usePCView } from '../../../hooks/usePC';
import { useRef, useEffect, useMemo } from 'react';

import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import psuSideUrl from '../../../assets/psu_side.webp';
import psuTopUrl from '../../../assets/psu_top.webp';
import psuBackUrl from '../../../assets/psu_back.webp';
import psuBottomUrl from '../../../assets/psu_bottom.webp';
import psuFrontUrl from '../../../assets/psu_front.webp';
import { LocalAirflowParticles } from './LocalAirflowParticles';


import { XMesh as Mesh } from './XMesh';

export const PSUGeometry = ({ rgbColor, rgbEnabled }: { rgbColor: string, rgbEnabled?: boolean }) => {
  const xrayMode = usePCView(s => s.xrayMode);
  const psuTopTexture = useTexture(psuTopUrl);
  const psuSideTexture = useTexture(psuSideUrl);
  const psuBackTexture = useTexture(psuBackUrl);
  const psuFrontTexture = useTexture(psuFrontUrl);
  const psuBottomTexture = useTexture(psuBottomUrl);
  const fanRef = useRef<Group>(null);

  useEffect(() => {
    if (fanRef.current) {
      fanBladesRefsY.add(fanRef.current);
      const currentRef = fanRef.current;
      return () => { fanBladesRefsY.delete(currentRef); };
    }
  }, []);

  const rgbMat = useMemo(() => new MeshStandardMaterial({ color: 0x000000, emissiveIntensity: 0, toneMapped: false }), []);
  const targetColor = useMemo(() => new Color(), []);
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    targetColor.set(rgbColor);
    rgbMat.emissive.lerp(targetColor, dt * 5);
    rgbMat.emissiveIntensity = MathUtils.lerp(rgbMat.emissiveIntensity, rgbEnabled ? 3.0 : 0, dt * 5);
  });

  useEffect(() => () => rgbMat.dispose(), [rgbMat]);

  const texturedMaterials = useMemo(() => ({
    texMat0: new MeshStandardMaterial({ map: psuTopTexture, roughness: 0.6, metalness: 0.4 }),
    texMat1: new MeshStandardMaterial({ map: psuSideTexture, roughness: 0.6, metalness: 0.4 }),
    texMat2: new MeshStandardMaterial({ map: psuSideTexture, roughness: 0.6, metalness: 0.4 }),
    texMat3: new MeshStandardMaterial({ map: psuBottomTexture, roughness: 0.6, metalness: 0.4 }),
    texMat4: new MeshStandardMaterial({ map: psuBackTexture, roughness: 0.8 }),
    texMat5: new MeshStandardMaterial({ map: psuFrontTexture, roughness: 0.8 })
  }), [psuBackTexture, psuBottomTexture, psuFrontTexture, psuSideTexture, psuTopTexture]);

  useEffect(() => {
    return () => {
      Object.values(texturedMaterials).forEach(mat => mat.dispose());
    };
  }, [texturedMaterials]);

  return (
    <group>
      {/* Inner Rotating Fan Blades (Visible in X-Ray mode) */}
      <group position={[0, -0.36, 0]} ref={fanRef} userData={{ axis: 'y' }}>
        {/* Hub */}
        <Mesh>
          <cylinderGeometry args={[0.35, 0.35, 0.03, 32]} />
          <primitive object={materials.darkMetal} attach="material" />
        </Mesh>
        {/* Blades */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
          <Mesh key={i} rotation={[0, (Math.PI * 2 / 8) * i, 0]}>
            <boxGeometry args={[1.45, 0.02, 0.25]} />
            <primitive object={materials.darkCharcoal} attach="material" />
          </Mesh>
        ))}
      </group>
      
      {/* Main Casing */}
      <Mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.8, 0.8, 1.5]} />
        <primitive object={materials.darkShinyMetal} attach="material" />
      </Mesh>
      {/* PSU Top Texture */}
      <Mesh position={[0, 0.401, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.8, 1.5]} />
        <primitive object={texturedMaterials.texMat0} />
      </Mesh>
      {/* PSU Side Texture (Facing Glass) */}
      <Mesh position={[0.901, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.5, 0.8]} />
        <primitive object={texturedMaterials.texMat1} />
      </Mesh>
      {/* PSU Side Texture (Facing Back Panel) */}
      <Mesh position={[-0.901, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.5, 0.8]} />
        <primitive object={texturedMaterials.texMat2} />
      </Mesh>
      {/* PSU Bottom Texture */}
      <Mesh position={[0, -0.401, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.8, 1.5]} />
        <primitive object={texturedMaterials.texMat3} />
      </Mesh>
      {/* RGB Ring over the fan - hide when xrayMode is active */}
      {!xrayMode && (
        <Mesh position={[0, -0.402, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1.8/1.5, 1, 1]}>
          <torusGeometry args={[0.67, 0.015, 16, 64]} />
          <primitive object={rgbMat} attach="material" />
        </Mesh>
      )}
      {/* Back Texture (Exhaust & AC Plug) */}
      <Mesh position={[0, 0, -0.751]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[1.8, 0.8]} />
        <primitive object={texturedMaterials.texMat4} />
      </Mesh>
      {/* Modular Cable Ports Texture (Front of PSU) */}
      <Mesh position={[0, 0, 0.751]}>
        <planeGeometry args={[1.8, 0.8]} />
        <primitive object={texturedMaterials.texMat5} />
      </Mesh>
      {/* Airflow Intake (Blue, from bottom into the PSU) */}
      <group position={[0, -1.0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <LocalAirflowParticles count={20} radius={0.3} length={0.6} speedMult={1.2} color="#38bdf8" />
      </group>
      {/* Airflow Exhaust (Red, out the back) */}
      <group position={[0, 0, -0.75]} rotation={[0, Math.PI, 0]}>
        <LocalAirflowParticles count={30} radius={0.3} length={1.5} speedMult={1.5} color="#ef4444" />
      </group>

    </group>
  );
};
