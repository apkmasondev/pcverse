import * as THREE from 'three';
import { RepeatWrapping } from 'three';
import { materials, xrayMaterial } from '../materials';

import { useMemo, useEffect } from 'react';
import { useTexture } from '@react-three/drei';
import hddTopUrl from '../../../assets/hdd_top.webp';
import hddBottomUrl from '../../../assets/hdd_bottom.webp';
import hddSideUrl from '../../../assets/hdd_side.webp';
import hddPortsUrl from '../../../assets/hdd_ports.webp';
import hddBehindUrl from '../../../assets/hdd_behind.webp';
import { usePCView } from '../../../hooks/usePC';

export const HDDGeometry = () => {
  const { xrayMode } = usePCView();
  const hddTopTexture = useTexture(hddTopUrl);
  const hddBottomTexture = useTexture(hddBottomUrl);
  const hddSideTexture = useTexture(hddSideUrl);
  const hddPortsTexture = useTexture(hddPortsUrl);
  const hddBehindTexture = useTexture(hddBehindUrl);

  const hddSideTextureMirrored = useMemo(() => {
    const tex = hddSideTexture.clone();
    tex.wrapS = RepeatWrapping;
    tex.repeat.x = -1;
    tex.needsUpdate = true;
    return tex;
  }, [hddSideTexture]);

  useEffect(() => {
    return () => hddSideTextureMirrored.dispose();
  }, [hddSideTextureMirrored]);

  const texturedMaterials = useMemo(() => ({
    texMat0: new THREE.MeshStandardMaterial({ map: hddTopTexture, roughness: 0.3, metalness: 0.6 }),
    texMat1: new THREE.MeshStandardMaterial({ map: hddBottomTexture, roughness: 0.6, metalness: 0.3 }),
    texMat2: new THREE.MeshStandardMaterial({ map: hddSideTextureMirrored, roughness: 0.5, metalness: 0.5 }),
    texMat3: new THREE.MeshStandardMaterial({ map: hddSideTexture, roughness: 0.5, metalness: 0.5 }),
    texMat4: new THREE.MeshStandardMaterial({ map: hddBehindTexture, roughness: 0.4, metalness: 0.6 }),
    texMat5: new THREE.MeshStandardMaterial({ map: hddPortsTexture, roughness: 0.4, metalness: 0.6 })
  }), [hddBehindTexture, hddBottomTexture, hddPortsTexture, hddSideTexture, hddSideTextureMirrored, hddTopTexture]);

  useEffect(() => {
    return () => {
      Object.values(texturedMaterials).forEach(mat => mat.dispose());
    };
  }, [texturedMaterials]);

  return (
    <group>
      {/* HDD Main Casing */}
      <mesh position={[0, 0, 0]} material={xrayMode ? xrayMaterial : undefined}>
        <boxGeometry args={[1.0, 0.25, 1.4]} />
        {!xrayMode && <primitive object={materials.darkShinyMetal} attach="material" />}
      </mesh>

      {/* Silver Top Lid */}
      <mesh position={[0, 0.13, 0]} material={xrayMode ? xrayMaterial : undefined}>
        <boxGeometry args={[0.96, 0.02, 1.36]} />
        {!xrayMode && <primitive object={materials.lightSilver} attach="material" />}
      </mesh>

      {/* HDD Top Texture */}
      {!xrayMode && (
        <mesh position={[0, 0.141, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.96, 1.36]} />
          <primitive object={texturedMaterials.texMat0} />
        </mesh>
      )}

      {/* HDD Bottom Texture */}
      {!xrayMode && (
        <mesh position={[0, -0.126, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.0, 1.4]} />
          <primitive object={texturedMaterials.texMat1} />
        </mesh>
      )}

      {/* HDD Right Side Texture */}
      {!xrayMode && (
        <mesh position={[0.501, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[1.4, 0.25]} />
          <primitive object={texturedMaterials.texMat2} />
        </mesh>
      )}

      {/* HDD Left Side Texture */}
      {!xrayMode && (
        <mesh position={[-0.501, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[1.4, 0.25]} />
          <primitive object={texturedMaterials.texMat3} />
        </mesh>
      )}

      {/* HDD Behind Texture (Front Face of the case) */}
      {!xrayMode && (
        <mesh position={[0, 0, -0.701]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[1.0, 0.25]} />
          <primitive object={texturedMaterials.texMat4} />
        </mesh>
      )}

      {/* HDD Ports Texture (Back Face) */}
      {!xrayMode && (
        <mesh position={[0, 0, 0.701]} rotation={[0, 0, 0]}>
          <planeGeometry args={[1.0, 0.25]} />
          <primitive object={texturedMaterials.texMat5} />
        </mesh>
      )}

      {/* Connectors (Back) */}
      <mesh position={[-0.13, -0.05, 0.71]} material={xrayMode ? xrayMaterial : undefined}>
        <boxGeometry args={[0.65, 0.1, 0.04]} />
        {!xrayMode && <primitive object={materials.blackPlastic} attach="material" />}
      </mesh>

      {/* SATA Power Connector */}
      <mesh position={[-0.19, -0.05, 0.73]} material={xrayMode ? xrayMaterial : undefined}>
        <boxGeometry args={[0.3, 0.08, 0.02]} />
        {!xrayMode && <primitive object={materials.goldMetal} attach="material" />}
      </mesh>

      {/* SATA Data Connector */}
      <mesh position={[0.1, -0.05, 0.73]} material={xrayMode ? xrayMaterial : undefined}>
        <boxGeometry args={[0.1, 0.08, 0.02]} />
        {!xrayMode && <primitive object={materials.goldMetal} attach="material" />}
      </mesh>
    </group>
  );
};
