import { MeshStandardMaterial } from 'three';
import { useMemo, useEffect } from 'react';

import { materials, xrayMaterial } from '../materials';
import { useTexture } from '@react-three/drei';
import ssdTopUrl from '../../../assets/ssd_top.webp';
import ssdBottomUrl from '../../../assets/ssd_bottom.webp';
import { usePCView } from '../../../hooks/usePC';

export const SSDGeometry = () => {
  const xrayMode = usePCView(s => s.xrayMode);
  const ssdTexture = useTexture(ssdTopUrl);
  const ssdBottomTexture = useTexture(ssdBottomUrl);

  const texturedMaterials = useMemo(() => ({
    texMat0: new MeshStandardMaterial({ map: ssdTexture, roughness: 0.4, metalness: 0.2, transparent: true }),
    texMat1: new MeshStandardMaterial({ map: ssdBottomTexture, roughness: 0.4, metalness: 0.2, transparent: true })
  }), [ssdBottomTexture, ssdTexture]);

  useEffect(() => {
    return () => {
      Object.values(texturedMaterials).forEach(mat => mat.dispose());
    };
  }, [texturedMaterials]);

  return (
    <group scale={[1.25, 1.25, 2.0]}>
      {/* M.2 PCB Background */}
      <mesh position={[0, 0, 0]} material={xrayMode ? xrayMaterial : undefined}>
        <boxGeometry args={[0.22, 0.8, 0.01]} />
        {!xrayMode && <primitive object={materials.darkGrayPlastic} attach="material" />}
      </mesh>
      
      {/* SSD Photorealistic Top */}
      <mesh position={[0, 0, 0.006]} material={xrayMode ? xrayMaterial : undefined}>
        <planeGeometry args={[0.22, 0.8]} />
        {!xrayMode && <primitive object={texturedMaterials.texMat0} />}
      </mesh>
      
      {/* SSD Photorealistic Bottom */}
      <mesh position={[0, 0, -0.006]} rotation={[0, Math.PI, 0]} material={xrayMode ? xrayMaterial : undefined}>
        <planeGeometry args={[0.22, 0.8]} />
        {!xrayMode && <primitive object={texturedMaterials.texMat1} />}
      </mesh>
      
      {/* Gold Connector Edge (Pins are at the bottom: -Y) */}
      <mesh position={[0, -0.39, 0]} material={xrayMode ? xrayMaterial : undefined}>
        <boxGeometry args={[0.22, 0.02, 0.011]} />
        {!xrayMode && <primitive object={materials.goldMetal} attach="material" />}
      </mesh>
    </group>
  );
};
