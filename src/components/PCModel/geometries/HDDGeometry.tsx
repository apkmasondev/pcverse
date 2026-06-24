import { materials, xrayMaterial } from '../materials';
import * as THREE from 'three';
import { useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import hddTopUrl from '../../../assets/hdd_top.webp';
import hddBottomUrl from '../../../assets/hdd_bottom.webp';
import hddSideUrl from '../../../assets/hdd_side.webp';
import hddPortsUrl from '../../../assets/hdd_ports.webp';
import hddBehindUrl from '../../../assets/hdd_behind.webp';
import { usePCSettings } from '../../../hooks/usePC';

export const HDDGeometry = () => {
  const { xrayMode } = usePCSettings();
  const hddTopTexture = useTexture(hddTopUrl);
  const hddBottomTexture = useTexture(hddBottomUrl);
  const hddSideTexture = useTexture(hddSideUrl);
  const hddPortsTexture = useTexture(hddPortsUrl);
  const hddBehindTexture = useTexture(hddBehindUrl);

  const hddSideTextureMirrored = useMemo(() => {
    const tex = hddSideTexture.clone();
    tex.wrapS = THREE.RepeatWrapping;
    tex.repeat.x = -1;
    tex.needsUpdate = true;
    return tex;
  }, [hddSideTexture]);

  return (
    <group>
      {/* HDD Main Casing */}
      <mesh position={[0, 0, 0]} material={xrayMode ? xrayMaterial : undefined}>
        <boxGeometry args={[1.0, 0.25, 1.4]} />
        {!xrayMode && <meshStandardMaterial color="#222" roughness={0.7} metalness={0.6} />}
      </mesh>

      {/* Silver Top Lid */}
      <mesh position={[0, 0.13, 0]} material={xrayMode ? xrayMaterial : undefined}>
        <boxGeometry args={[0.96, 0.02, 1.36]} />
        {!xrayMode && <meshStandardMaterial color="#e5e7eb" roughness={0.3} metalness={0.9} />}
      </mesh>

      {/* HDD Top Texture */}
      {!xrayMode && (
        <mesh position={[0, 0.141, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.96, 1.36]} />
          <meshStandardMaterial map={hddTopTexture} roughness={0.3} metalness={0.6} />
        </mesh>
      )}

      {/* HDD Bottom Texture */}
      {!xrayMode && (
        <mesh position={[0, -0.126, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.0, 1.4]} />
          <meshStandardMaterial map={hddBottomTexture} roughness={0.6} metalness={0.3} />
        </mesh>
      )}

      {/* HDD Right Side Texture */}
      {!xrayMode && (
        <mesh position={[0.501, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[1.4, 0.25]} />
          <meshStandardMaterial map={hddSideTextureMirrored} roughness={0.5} metalness={0.5} />
        </mesh>
      )}

      {/* HDD Left Side Texture */}
      {!xrayMode && (
        <mesh position={[-0.501, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[1.4, 0.25]} />
          <meshStandardMaterial map={hddSideTexture} roughness={0.5} metalness={0.5} />
        </mesh>
      )}

      {/* HDD Behind Texture (Front Face of the case) */}
      {!xrayMode && (
        <mesh position={[0, 0, -0.701]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[1.0, 0.25]} />
          <meshStandardMaterial map={hddBehindTexture} roughness={0.4} metalness={0.6} />
        </mesh>
      )}

      {/* HDD Ports Texture (Back Face) */}
      {!xrayMode && (
        <mesh position={[0, 0, 0.701]} rotation={[0, 0, 0]}>
          <planeGeometry args={[1.0, 0.25]} />
          <meshStandardMaterial map={hddPortsTexture} roughness={0.4} metalness={0.6} />
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
