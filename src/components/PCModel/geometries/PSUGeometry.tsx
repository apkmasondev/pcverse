import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { Group } from 'three';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import psuSideUrl from '../../../assets/psu_side.webp';
import psuTopUrl from '../../../assets/psu_top.webp';
import psuBackUrl from '../../../assets/psu_back.webp';
import psuBottomUrl from '../../../assets/psu_bottom.webp';
import psuFrontUrl from '../../../assets/psu_front.webp';
import { LocalAirflowParticles } from './LocalAirflowParticles';

export const PSUGeometry = ({ rgbColor }: { rgbColor: string }) => {
  const psuTopTexture = useTexture(psuTopUrl);
  const psuSideTexture = useTexture(psuSideUrl);
  const psuBackTexture = useTexture(psuBackUrl);
  const psuFrontTexture = useTexture(psuFrontUrl);
  const psuBottomTexture = useTexture(psuBottomUrl);
  const fanRef = useRef<Group>(null);
  
  const backMeshTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(8, 8, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(12, 12);
    return texture;
  }, []);

  useEffect(() => {
    return () => {
      backMeshTexture.dispose();
    };
  }, [backMeshTexture]);

  useFrame((_state, delta) => {
    if (fanRef.current) {
      fanRef.current.rotation.y += delta * 15;
    }
  });

  return (
    <group>
      {/* Inner Rotating Fan Blades (Visible in X-Ray mode) */}
      <group position={[0, -0.36, 0]} ref={fanRef}>
        {/* Hub */}
        <mesh>
          <cylinderGeometry args={[0.35, 0.35, 0.03, 32]} />
          <meshStandardMaterial color="#151515" roughness={0.6} />
        </mesh>
        {/* Blades */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
          <mesh key={i} rotation={[0, (Math.PI * 2 / 8) * i, 0]}>
            <boxGeometry args={[1.45, 0.02, 0.25]} />
            <meshStandardMaterial color="#222" roughness={0.5} />
          </mesh>
        ))}
      </group>
      
      {/* Main Casing */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.8, 0.8, 1.5]} />
        <meshStandardMaterial color="#111" metalness={0.6} roughness={0.5} />
      </mesh>
      {/* PSU Top Texture */}
      <mesh position={[0, 0.401, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.8, 1.5]} />
        <meshStandardMaterial map={psuTopTexture} roughness={0.6} metalness={0.4} />
      </mesh>
      {/* PSU Side Texture (Facing Glass) */}
      <mesh position={[0.901, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.5, 0.8]} />
        <meshStandardMaterial map={psuSideTexture} roughness={0.6} metalness={0.4} />
      </mesh>
      {/* PSU Side Texture (Facing Back Panel) */}
      <mesh position={[-0.901, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.5, 0.8]} />
        <meshStandardMaterial map={psuSideTexture} roughness={0.6} metalness={0.4} />
      </mesh>
      {/* PSU Bottom Texture */}
      <mesh position={[0, -0.401, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.8, 1.5]} />
        <meshStandardMaterial map={psuBottomTexture} roughness={0.6} metalness={0.4} />
      </mesh>
      {/* RGB Ring over the fan */}
      <mesh position={[0, -0.402, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1.8/1.5, 1, 1]}>
        <torusGeometry args={[0.67, 0.015, 16, 64]} />
        <meshStandardMaterial 
          color={rgbColor} 
          emissive={rgbColor} 
          emissiveIntensity={2} 
          toneMapped={false} 
        />
      </mesh>
      {/* Back Texture (Exhaust & AC Plug) */}
      <mesh position={[0, 0, -0.751]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[1.8, 0.8]} />
        <meshStandardMaterial map={psuBackTexture} roughness={0.8} />
      </mesh>
      {/* Modular Cable Ports Texture (Front of PSU) */}
      <mesh position={[0, 0, 0.751]}>
        <planeGeometry args={[1.8, 0.8]} />
        <meshStandardMaterial map={psuFrontTexture} roughness={0.8} />
      </mesh>
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
