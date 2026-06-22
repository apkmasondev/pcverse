import { useRef } from 'react';
import * as THREE from 'three';
import { Group } from 'three';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import gpuTopUrl from '../../../assets/gpu_top.webp';
import gpuFrontUrl from '../../../assets/gpu_front.webp';
import gpuBackplateUrl from '../../../assets/gpu_backplate.webp';
import gpuIoUrl from '../../../assets/gpu_io.webp';
import { LocalAirflowParticles } from './LocalAirflowParticles';

export const GPUGeometry = ({ rgbColor }: { rgbColor: string }) => {
  const fanRef1 = useRef<Group>(null);
  const fanRef2 = useRef<Group>(null);
  const fanRef3 = useRef<Group>(null);
  const gpuBackplateTexture = useTexture(gpuBackplateUrl);
  const gpuTopTexture = useTexture(gpuTopUrl);
  const gpuFrontTexture = useTexture(gpuFrontUrl);
  const gpuIoTexture = useTexture(gpuIoUrl);
  gpuFrontTexture.wrapS = THREE.RepeatWrapping;
  gpuFrontTexture.wrapT = THREE.RepeatWrapping;
  gpuFrontTexture.repeat.set(3, 1);
  
  useFrame((_state, delta) => {
    if (fanRef1.current) fanRef1.current.rotation.y += delta * 20;
    if (fanRef2.current) fanRef2.current.rotation.y += delta * 20;
    if (fanRef3.current) fanRef3.current.rotation.y += delta * 20;
  });


  return (
    <group>
      {/* PCIe Connector */}
      <mesh position={[0, 0.05, -0.6]}>
        <boxGeometry args={[1.6, 0.08, 0.05]} />
        <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.3} />
      </mesh>
      {/* GPU IO Ports (HDMI & 3x DisplayPort) at Left Edge */}
      <group position={[-1.7, -0.15, 0]}>
        <mesh position={[0, 0, 0.1]}>
          <boxGeometry args={[0.04, 0.4, 1.4]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.6} roughness={0.8} />
        </mesh>
        {/* GPU IO Texture Plane */}
        <mesh position={[-0.021, 0, -0.1]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[1.0, 0.4]} />
          <meshStandardMaterial map={gpuIoTexture} roughness={0.4} metalness={0.6} />
        </mesh>
        {/* HDMI Port (Gold plated) */}
        <mesh position={[-0.02, 0.05, 0.2]}>
          <boxGeometry args={[0.05, 0.08, 0.15]} />
          <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.2} />
        </mesh>
        {/* 3x DisplayPort */}
        {[-0.05, -0.25, -0.45].map((z, i) => (
          <mesh key={`dp-${i}`} position={[-0.02, 0.05, z]}>
            <boxGeometry args={[0.05, 0.08, 0.15]} />
            <meshStandardMaterial color="#111" metalness={0.8} roughness={0.4} />
          </mesh>
        ))}
      </group>

      {/* Main PCB */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3.4, 0.05, 1.2]} />
        <meshStandardMaterial color="#111" roughness={0.8} />
      </mesh>

      {/* Backplate with modern sci-fi cutouts */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[3.4, 0.05, 1.2]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.7} roughness={0.4} />
      </mesh>
      {/* GPU Backplate Texture */}
      <mesh position={[0, 0.076, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.4, 1.2]} />
        <meshStandardMaterial map={gpuBackplateTexture} roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Backplate Accent / Cutout detail */}
      <mesh position={[1.2, 0.06, 0]}>
        <boxGeometry args={[0.6, 0.04, 0.8]} />
        <meshStandardMaterial color="#151515" metalness={0.5} roughness={0.6} />
      </mesh>

      {/* Heatsink Block */}
      <mesh position={[0, -0.15, 0]}>
        <boxGeometry args={[3.3, 0.25, 1.15]} />
        <meshStandardMaterial color="#b0b5b9" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Fan Shroud */}
      <mesh position={[0, -0.325, 0]}>
        <boxGeometry args={[3.4, 0.1, 1.2]} />
        <meshStandardMaterial color="#151515" roughness={0.6} />
      </mesh>
      {/* GPU Front Texture (Fans Side) */}
      <mesh position={[0, -0.376, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.4, 1.2]} />
        <meshStandardMaterial map={gpuFrontTexture} roughness={0.3} metalness={0.5} />
      </mesh>

      {/* GPU Top Edge Texture (Facing the glass) */}
      <mesh position={[0, -0.15, 0.601]} rotation={[0, 0, 0]}>
        <planeGeometry args={[3.4, 0.45]} />
        <meshStandardMaterial map={gpuTopTexture} roughness={0.4} metalness={0.6} />
      </mesh>

      {/* RGB Edge Lighting - Front Edge Logo */}
      <mesh position={[0, -0.15, 0.59]}>
        <boxGeometry args={[1.0, 0.06, 0.05]} />
        <meshStandardMaterial color={rgbColor} emissive={rgbColor} emissiveIntensity={1.5} toneMapped={false} />
      </mesh>
      
      {/* RGB Edge Lighting - Side */}
      <mesh position={[1.68, -0.15, 0]}>
        <boxGeometry args={[0.05, 0.1, 1.2]} />
        <meshStandardMaterial color={rgbColor} emissive={rgbColor} emissiveIntensity={1} toneMapped={false} />
      </mesh>

      {/* Physical Fans (Visible inside hologram) */}
      {[-1.1, 0, 1.1].map((x, i) => (
        <group key={`phys-fan-${i}`} position={[x, -0.2, 0]} ref={i === 0 ? fanRef1 : i === 1 ? fanRef2 : fanRef3}>
          <mesh>
            <cylinderGeometry args={[0.42, 0.42, 0.05, 32]} />
            <meshStandardMaterial color="#050505" roughness={0.8} />
          </mesh>
          <mesh>
            <boxGeometry args={[0.78, 0.05, 0.1]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
          </mesh>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[0.78, 0.05, 0.1]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
          </mesh>
        </group>
      ))}

      {/* GPU Cooling Airflow Particles - 3 streams for 3 fans */}
      {[-1.1, 0, 1.1].map((x, i) => (
        <group key={`airflow-${i}`} position={[x, -0.85, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <LocalAirflowParticles count={30} radius={0.35} length={0.8} speedMult={1.5} color="#38bdf8" />
        </group>
      ))}
    </group>
  );
};
