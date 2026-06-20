import { useRef, useState, useMemo, useEffect, Suspense, Component } from 'react';
import type { ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Group, Color, Vector3 } from 'three';
import { Html, useCursor, Bvh, useTexture } from '@react-three/drei';
import { pcComponents } from '../../data/components';
import type { PCComponent } from '../../data/components';
import { usePC } from '../../hooks/usePC';
import { playHoverSound, playSelectSound } from '../../utils/audio';
import moboBackUrl from '../../assets/mobo_back_photo.png';
import cpuSocketUrl from '../../assets/cpu_socket.png';
import moboChipsetUrl from '../../assets/mobo_chipset.png';
import psuTopUrl from '../../assets/psu_top.png';
import psuSideUrl from '../../assets/psu_side.png';
import psuBackUrl from '../../assets/psu_back.webp';
import psuFrontUrl from '../../assets/psu_front.webp';
import psuBottomUrl from '../../assets/psu_bottom.webp';
import aioFanUrl from '../../assets/aio_fan.webp';
import heatsinkUrl from '../../assets/heatsink.webp';
import heatsinkSideUrl from '../../assets/heatsink_side.webp';
import gpuBackplateUrl from '../../assets/gpu_backplate.png';
import gpuFrontUrl from '../../assets/gpu_front.png';
import ramSideUrl from '../../assets/ram_side.png';
import hddTopUrl from '../../assets/hdd_top.png';
import hddBottomUrl from '../../assets/hdd_bottom.webp';
import caseFanUrl from '../../assets/case_fan.png';
import ssdTopUrl from '../../assets/ssd_top.png';
import ssdBottomUrl from '../../assets/ssd_bottom.webp';
import cpuTopUrl from '../../assets/cpu_top.png';
import moboTopUrl from '../../assets/mobo_top.png';
import moboIoUrl from '../../assets/mobo_io.webp';
import gpuIoUrl from '../../assets/gpu_io.webp';

// --- Error Boundary ---
class ErrorBoundary extends Component<{ fallback: ReactNode, children: ReactNode }, { hasError: boolean }> {
  constructor(props: { fallback: ReactNode, children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Geometry error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// --- Procedural Geometries (Premium 3D) ---

const CPUGeometry = () => {
  const cpuTexture = useTexture(cpuTopUrl);

  return (
    <group>
      {/* Base Substrate Block */}
      <mesh position={[0, 0, -0.01]}>
        <boxGeometry args={[0.8, 0.8, 0.06]} />
        <meshStandardMaterial color="#2a1f1a" roughness={0.9} />
      </mesh>
      
      {/* Photorealistic AM5 CPU Top (With Bump Mapping for 3D effect) */}
      <mesh position={[0, 0, 0.021]}>
        <planeGeometry args={[0.8, 0.8]} />
        <meshStandardMaterial 
          map={cpuTexture} 
          bumpMap={cpuTexture} 
          bumpScale={0.04} 
          roughness={0.4} 
          metalness={0.6} 
        />
      </mesh>

      {/* Gold Pins (Bottom/Back) */}
      <mesh position={[0, 0, -0.041]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.7, 0.7]} />
        <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.4} />
      </mesh>
    </group>
  );
};

const GPUGeometry = ({ rgbColor }: { rgbColor: string }) => {
  const fanRef1 = useRef<Group>(null);
  const fanRef2 = useRef<Group>(null);
  const fanRef3 = useRef<Group>(null);
  const gpuBackplateTexture = useTexture(gpuBackplateUrl);
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
        {/* Steel mounting bracket */}
        <mesh position={[0, 0, -0.1]}>
          <boxGeometry args={[0.04, 0.4, 1.0]} />
          <meshStandardMaterial color="#888c94" metalness={0.8} roughness={0.4} />
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

      {/* Futuristic Power Connector (12VHPWR style) */}
      <mesh position={[0.5, 0.05, 0.58]}>
        <boxGeometry args={[0.2, 0.1, 0.1]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
      </mesh>
      {/* Power Cables curving away */}
      {[-0.05, 0.05].map((x, i) => (
        <mesh key={`cable-${i}`} position={[0.5 + x, 0.15, 0.62]} rotation={[Math.PI / 4, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
          <meshStandardMaterial color="#222" roughness={0.8} />
        </mesh>
      ))}

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

const RAMGeometry = ({ rgbColor }: { color?: Color, rgbColor: string }) => {
  const ramSideTexture = useTexture(ramSideUrl);
  
  return (
    <group>
      {/* RAM PCB (Długa na osi Y, wpięta w płytę główną osiami Z) */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.04, 1.35, 0.35]} />
        <meshStandardMaterial color="#050505" roughness={0.9} />
      </mesh>
      {/* Złote styki (Z tyłu, wchodzące w slot na płycie) */}
      <mesh position={[0, 0, -0.16]}>
        <boxGeometry args={[0.045, 1.3, 0.04]} />
        <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.3} />
      </mesh>
      {/* Metaliczny Radiator (Heat Spreader) */}
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[0.08, 1.38, 0.32]} />
        <meshStandardMaterial color="#1f2229" metalness={0.7} roughness={0.4} />
      </mesh>
      
      {/* RAM Side Textures */}
      {/* Right side (+X) */}
      <mesh position={[0.041, 0, 0.02]} rotation={[0, Math.PI / 2, Math.PI / 2]}>
        <planeGeometry args={[1.38, 0.32]} />
        <meshStandardMaterial map={ramSideTexture} roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Left side (-X) */}
      <mesh position={[-0.041, 0, 0.02]} rotation={[0, -Math.PI / 2, -Math.PI / 2]}>
        <planeGeometry args={[1.38, 0.32]} />
        <meshStandardMaterial map={ramSideTexture} roughness={0.4} metalness={0.6} />
      </mesh>

      {/* RGB Top Bar */}
      <mesh position={[0, 0, 0.2]}>
        <boxGeometry args={[0.06, 1.36, 0.04]} />
        <meshStandardMaterial color={rgbColor} emissive={rgbColor} emissiveIntensity={1.5} toneMapped={false} />
      </mesh>
    </group>
  );
};


const MotherboardGeometry = ({ rgbColor }: { rgbColor: string }) => {
  const backTexture = useTexture(moboBackUrl);
  const moboTopTexture = useTexture(moboTopUrl);
  const cpuSocketTexture = useTexture(cpuSocketUrl);
  const chipsetTexture = useTexture(moboChipsetUrl);
  const ssdTexture = useTexture(ssdTopUrl);
  const moboIoTexture = useTexture(moboIoUrl);

  return (
  <group>
    {/* Main PCB */}
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[3, 4, 0.06]} />
      <meshStandardMaterial color="#111214" roughness={0.9} />
    </mesh>
    
    {/* Motherboard Top Texture (Photorealistic Base) */}
    <mesh position={[0, 0, 0.031]}>
      <planeGeometry args={[3, 4]} />
      <meshStandardMaterial map={moboTopTexture} roughness={0.5} metalness={0.4} />
    </mesh>
    
    {/* Motherboard Backplate Texture */}
    <mesh position={[0, 0, -0.031]} rotation={[0, Math.PI, 0]}>
      <planeGeometry args={[3, 4]} />
      <meshStandardMaterial map={backTexture} roughness={0.4} metalness={0.2} />
    </mesh>

    {/* VRM Heatsinks (Massive, angled) */}
    <mesh position={[-1.2, 1.5, 0.15]}>
      <boxGeometry args={[0.5, 0.9, 0.3]} />
      <meshStandardMaterial color="#151515" metalness={0.9} roughness={0.2} />
    </mesh>
    <mesh position={[-0.1, 1.85, 0.15]}>
      <boxGeometry args={[1.4, 0.35, 0.3]} />
      <meshStandardMaterial color="#151515" metalness={0.9} roughness={0.2} />
    </mesh>

    {/* CPU Socket Cover (Grey rectangle to hide the printed socket on texture) */}
    <mesh position={[0, 0.95, 0.035]}>
      <boxGeometry args={[1.3, 1.45, 0.02]} />
      <meshStandardMaterial color="#1f2023" roughness={0.9} />
    </mesh>

    {/* CPU Socket & Mounting Bracket */}
    <mesh position={[0, 1, 0.05]}>
      <boxGeometry args={[1.0, 1.0, 0.08]} />
      <meshStandardMaterial color="#222" roughness={0.8} />
    </mesh>
    <mesh position={[0, 1, 0.091]}>
      <planeGeometry args={[0.8, 0.8]} />
      <meshStandardMaterial map={cpuSocketTexture} metalness={0.8} roughness={0.2} />
    </mesh>

    {/* NVMe M.2 SSD */}
    <group position={[-0.3, 0.1, 0.05]}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.8, 0.22, 0.02]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0, 0.011]}>
        <planeGeometry args={[0.78, 0.2]} />
        <meshStandardMaterial map={ssdTexture} roughness={0.5} />
      </mesh>
    </group>

    {/* VRM Capacitors (Silver cylinders near CPU) */}
    {[-1.2, -1.0, -0.8, -0.6, -0.4, -0.2, 0, 0.2].map((y, i) => (
      <mesh key={`cap-top-${i}`} position={[y, 1.6, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.1, 16]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
      </mesh>
    ))}
    {[0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4].map((x, i) => (
      <mesh key={`cap-left-${i}`} position={[-0.8, x, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.1, 16]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
      </mesh>
    ))}

    {/* RAM Slots */}
    {[0.8, 1.0, 1.2, 1.4].map((x, i) => (
      <mesh key={i} position={[x, 1, 0.08]}>
        <boxGeometry args={[0.1, 1.5, 0.15]} />
        <meshStandardMaterial color={i % 2 === 0 ? "#111" : "#2a2a2a"} roughness={0.7} />
      </mesh>
    ))}

    {/* 24-Pin ATX Power Connector */}
    <mesh position={[1.3, 0.5, 0.1]}>
      <boxGeometry args={[0.2, 0.8, 0.2]} />
      <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
    </mesh>

    {/* 8-Pin EPS Power Connectors */}
    <mesh position={[-1.2, 1.9, 0.1]}>
      <boxGeometry args={[0.4, 0.15, 0.2]} />
      <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
    </mesh>

    {/* POST Code Display (Diagnostic LED) */}
    <group position={[1.2, 1.8, 0.05]}>
      <mesh>
        <boxGeometry args={[0.3, 0.2, 0.1]} />
        <meshStandardMaterial color="#050505" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0, 0.06]}>
        <boxGeometry args={[0.2, 0.1, 0.01]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={2} />
      </mesh>
    </group>

    {/* PCIe Slots (Reinforced) */}
    {[-1, -1.8].map((y, i) => (
      <group key={`pcie-${i}`} position={[-0.2, y, 0.1]}>
        <mesh>
          <boxGeometry args={[2.2, 0.15, 0.12]} />
          <meshStandardMaterial color={i === 0 ? "#b0b5b9" : "#111"} metalness={i === 0 ? 0.8 : 0} roughness={0.5} />
        </mesh>
        {/* PCIe slot clip */}
        <mesh position={[1.15, 0, 0]}>
          <boxGeometry args={[0.1, 0.15, 0.12]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>
      </group>
    ))}

    {/* M.2 NVMe Armor / Heatsinks */}
    <mesh position={[-0.2, -0.4, 0.08]}>
      <boxGeometry args={[1.8, 0.3, 0.1]} />
      <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.3} />
    </mesh>
    <mesh position={[-0.2, -1.4, 0.08]}>
      <boxGeometry args={[1.8, 0.3, 0.1]} />
      <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.3} />
    </mesh>

    {/* CMOS Battery */}
    <mesh position={[-1.0, -1.4, 0.05]} rotation={[0, 0, 0]}>
      <cylinderGeometry args={[0.15, 0.15, 0.04, 32]} />
      <meshStandardMaterial color="#e0e0e0" metalness={1} roughness={0.2} />
    </mesh>

    {/* Audio Section with RGB Trace */}
    <mesh position={[-1.2, -1.5, 0.04]}>
      <boxGeometry args={[0.4, 0.8, 0.02]} />
      <meshStandardMaterial color="#0f0f0f" roughness={0.9} />
    </mesh>
    <mesh position={[-0.95, -1.5, 0.04]}>
      <boxGeometry args={[0.02, 0.8, 0.01]} />
      <meshStandardMaterial color={rgbColor} emissive={rgbColor} emissiveIntensity={1.5} toneMapped={false} />
    </mesh>
    {/* Audio Capacitors (Gold) */}
    {[-1.2, -1.4, -1.6].map((y, i) => (
      <mesh key={`audio-cap-${i}`} position={[-1.2, y, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.12, 16]} />
        <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.3} />
      </mesh>
    ))}

    {/* SATA Ports */}
    <mesh position={[1.4, -1.5, 0.1]}>
      <boxGeometry args={[0.15, 0.6, 0.15]} />
      <meshStandardMaterial color="#0a0a0a" roughness={0.8} />
    </mesh>

    {/* Chipset Heatsink (Massive with RGB Logo) */}
    <group position={[0.8, -1.2, 0.1]}>
      <mesh>
        <boxGeometry args={[1.0, 1.0, 0.15]} />
        <meshStandardMaterial color="#151515" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Chipset Texture */}
      <mesh position={[0, 0, 0.076]}>
        <planeGeometry args={[1.0, 1.0]} />
        <meshStandardMaterial map={chipsetTexture} roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Sci-fi grooves */}
      <mesh position={[-0.2, 0, 0.08]}>
        <boxGeometry args={[0.1, 1.0, 0.02]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>
      {/* RGB Accent */}
      <mesh position={[0, 0, 0.08]}>
        <planeGeometry args={[0.6, 0.6]} />
        <meshStandardMaterial color={rgbColor} emissive={rgbColor} emissiveIntensity={1} />
      </mesh>
    </group>

    {/* Rear IO Shield Block */}
    <mesh position={[-1.4, 1.2, 0.2]}>
      <boxGeometry args={[0.2, 1.6, 0.45]} />
      <meshStandardMaterial color="#111" metalness={0.8} roughness={0.3} />
    </mesh>

    {/* IO Ports Area (moved from CaseGeometry to stay attached when exploded) */}
    <group position={[0, 0, 1.75]}>
      {/* Motherboard IO Panel Accent (Shifted to X = -1.53 to sit on the outside of the left panel) */}
      <mesh position={[-1.53, 1.2, -1.55]}>
        <boxGeometry args={[0.04, 1.4, 0.65]} />
        <meshStandardMaterial color="#888c94" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Motherboard IO Image Texture Plane */}
      <mesh position={[-1.551, 1.2, -1.55]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[0.65, 1.4]} />
        <meshStandardMaterial map={moboIoTexture} roughness={0.6} metalness={0.4} />
      </mesh>
      {/* Motherboard IO Ports - Professional High-End Layout */}
      {/* BIOS Flashback & Clear CMOS */}
      <mesh position={[-1.55, 1.75, -1.65]}>
        <boxGeometry args={[0.02, 0.06, 0.06]} />
        <meshStandardMaterial color="#111" roughness={0.8} />
      </mesh>
      <mesh position={[-1.55, 1.75, -1.45]} rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.02, 16]} />
        <meshStandardMaterial color="#444" metalness={0.5} />
      </mesh>

      {/* Wi-Fi Antenna Connectors (Gold) */}
      {[-1.65, -1.45].map(z => (
        <mesh key={`wifi-${z}`} position={[-1.55, 1.6, z]} rotation={[0, 0, Math.PI/2]}>
          <cylinderGeometry args={[0.03, 0.03, 0.04, 16]} />
          <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.2} />
        </mesh>
      ))}

      {/* USB 2.0 (Black) */}
      {[-1.65, -1.45].map(z => (
        <mesh key={`usb2-${z}`} position={[-1.55, 1.45, z]}>
          <boxGeometry args={[0.02, 0.04, 0.1]} />
          <meshStandardMaterial color="#111" roughness={0.9} />
        </mesh>
      ))}

      {/* USB 3.2 Gen 1 (Blue) */}
      {[-1.65, -1.45].map(z => (
        <mesh key={`usb3-${z}`} position={[-1.55, 1.3, z]}>
          <boxGeometry args={[0.02, 0.04, 0.1]} />
          <meshStandardMaterial color="#1e3a8a" roughness={0.6} />
        </mesh>
      ))}

      {/* 2.5G Ethernet & USB 3.2 Gen 2 (Red) */}
      <mesh position={[-1.55, 1.15, -1.65]}>
        <boxGeometry args={[0.02, 0.08, 0.12]} />
        <meshStandardMaterial color="#1f2937" metalness={0.6} />
      </mesh>
      <mesh position={[-1.55, 1.15, -1.45]}>
        <boxGeometry args={[0.02, 0.04, 0.1]} />
        <meshStandardMaterial color="#991b1b" roughness={0.6} />
      </mesh>

      {/* USB-C & USB 3.2 Gen 2 (Red) */}
      <mesh position={[-1.55, 1.0, -1.65]}>
        <boxGeometry args={[0.02, 0.025, 0.08]} />
        <meshStandardMaterial color="#111" roughness={0.7} />
      </mesh>
      <mesh position={[-1.55, 1.0, -1.45]}>
        <boxGeometry args={[0.02, 0.04, 0.1]} />
        <meshStandardMaterial color="#991b1b" roughness={0.6} />
      </mesh>

      {/* High-End Audio Stack (Gold Plated) */}
      {[-1.65, -1.55, -1.45].map((z, i) => (
        <mesh key={`audio-top-${i}`} position={[-1.55, 0.85, z]} rotation={[0, 0, Math.PI/2]}>
          <cylinderGeometry args={[0.025, 0.025, 0.03, 16]} />
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}
      {[-1.65, -1.55].map((z, i) => (
        <mesh key={`audio-bot-${i}`} position={[-1.55, 0.75, z]} rotation={[0, 0, Math.PI/2]}>
          <cylinderGeometry args={[0.025, 0.025, 0.03, 16]} />
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}
      {/* SPDIF Optical out */}
      <mesh position={[-1.55, 0.75, -1.45]}>
        <boxGeometry args={[0.02, 0.04, 0.04]} />
        <meshStandardMaterial color="#111" />
      </mesh>
    </group>
  </group>
  );
};

const PSUGeometry = ({ rgbColor }: { rgbColor: string }) => {
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
        <planeGeometry args={[1.6, 0.8]} />
        <meshStandardMaterial map={psuBackTexture} roughness={0.8} />
      </mesh>
      {/* Modular Cable Ports Texture (Front of PSU) */}
      <mesh position={[0, 0, 0.751]}>
        <planeGeometry args={[1.6, 0.8]} />
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

const SSDGeometry = () => {
  const ssdTexture = useTexture(ssdTopUrl);
  const ssdBottomTexture = useTexture(ssdBottomUrl);

  return (
    <group>
      {/* M.2 PCB Background */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.22, 0.8, 0.01]} />
        <meshStandardMaterial color="#111214" roughness={0.9} />
      </mesh>
      
      {/* SSD Photorealistic Top */}
      <mesh position={[0, 0, 0.006]}>
        <planeGeometry args={[0.22, 0.8]} />
        <meshStandardMaterial map={ssdTexture} roughness={0.4} metalness={0.2} transparent={true} />
      </mesh>
      
      {/* SSD Photorealistic Bottom */}
      <mesh position={[0, 0, -0.006]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.22, 0.8]} />
        <meshStandardMaterial map={ssdBottomTexture} roughness={0.4} metalness={0.2} transparent={true} />
      </mesh>
      
      {/* Gold Connector Edge (Pins are at the bottom: -Y) */}
      <mesh position={[0, -0.39, 0]}>
        <boxGeometry args={[0.22, 0.02, 0.011]} />
        <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.3} />
      </mesh>
    </group>
  );
};

const FanGeometry = ({ rgbColor, isExhaust = false, textureUrl }: { rgbColor: string, isExhaust?: boolean, textureUrl?: string }) => {
  const fanTexture = useTexture(textureUrl || caseFanUrl);
  const bladesRef = useRef<Group>(null);

  useFrame((_state, delta) => {
    if (bladesRef.current) {
      bladesRef.current.rotation.z += delta * 15;
    }
  });

  return (
    <group>
      {/* Inner Physical Blades (visible in X-Ray mode) */}
      <group position={[0, 0, 0]} ref={bladesRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.05, 16]} />
          <meshStandardMaterial color="#151515" roughness={0.6} />
        </mesh>
        {[0, 1, 2, 3, 4, 5, 6].map(i => (
          <mesh key={i} rotation={[0, 0, (Math.PI * 2 / 7) * i]}>
            <boxGeometry args={[0.9, 0.15, 0.02]} />
            <meshStandardMaterial color="#222" roughness={0.5} />
          </mesh>
        ))}
      </group>

      {/* Outer Frame */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1, 1, 0.2]} />
        <meshStandardMaterial color="#151515" roughness={0.7} />
      </mesh>
      
      {/* Front Face Texture */}
      <mesh position={[0, 0, 0.101]}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial map={fanTexture} roughness={0.4} metalness={0.3} transparent={false} alphaTest={0.5} />
      </mesh>
      {/* Front RGB LED Ring */}
      <mesh position={[0, 0, 0.103]}>
        <torusGeometry args={[0.44, 0.025, 16, 64]} />
        <meshStandardMaterial color={rgbColor} emissive={rgbColor} emissiveIntensity={3} toneMapped={false} />
      </mesh>

      {/* Back Face Texture */}
      <mesh position={[0, 0, -0.101]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial map={fanTexture} roughness={0.4} metalness={0.3} transparent={false} alphaTest={0.5} />
      </mesh>
      {/* Back RGB LED Ring */}
      <mesh position={[0, 0, -0.103]} rotation={[0, Math.PI, 0]}>
        <torusGeometry args={[0.44, 0.025, 16, 64]} />
        <meshStandardMaterial color={rgbColor} emissive={rgbColor} emissiveIntensity={3} toneMapped={false} />
      </mesh>

      {/* Airflow */}
      <group position={[0, 0, 0]} rotation={[0, Math.PI, 0]}>
        <LocalAirflowParticles count={80} radius={0.4} length={2.5} speedMult={2} color={isExhaust ? "#ef4444" : "#38bdf8"} />
      </group>
    </group>
  );
};

const CPUCoolerGeometry = ({ rgbColor }: { rgbColor: string }) => {
  const heatsinkTexture = useTexture(heatsinkUrl);
  const heatsinkSideTexture = useTexture(heatsinkSideUrl);
  
  return (
    <group>
      {/* Base Contact */}
      <mesh position={[0, 0, -0.25]}>
        <boxGeometry args={[0.6, 0.6, 0.05]} />
        <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Heatpipes */}
      {[-0.15, 0, 0.15].map((x, i) => (
        <mesh key={i} position={[x, 0, -0.1]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.3, 16]} />
          <meshStandardMaterial color="#b0b5b9" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}
      {/* Fin Stack - shifted to Z=0.12 and shortened to 0.54 depth to prevent overlapping/smudging with the Fan at Z=0.5 */}
      <mesh position={[0, 0.1, 0.12]}>
        <boxGeometry args={[1, 0.8, 0.54]} />
        <meshStandardMaterial attach="material-0" map={heatsinkSideTexture} metalness={0.8} roughness={0.3} />
        <meshStandardMaterial attach="material-1" map={heatsinkSideTexture} metalness={0.8} roughness={0.3} />
        <meshStandardMaterial attach="material-2" map={heatsinkTexture} metalness={0.8} roughness={0.3} />
        <meshStandardMaterial attach="material-3" map={heatsinkTexture} metalness={0.8} roughness={0.3} />
        <meshStandardMaterial attach="material-4" map={heatsinkTexture} metalness={0.8} roughness={0.3} />
        <meshStandardMaterial attach="material-5" map={heatsinkTexture} metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Top Cover */}
      <mesh position={[0, 0.51, 0.12]}>
        <boxGeometry args={[1, 0.02, 0.54]} />
        <meshStandardMaterial map={heatsinkTexture} metalness={0.6} roughness={0.4} />
      </mesh>
    {/* Attached Fan */}
    <group position={[0, 0.1, 0.5]}>
      <FanGeometry rgbColor={rgbColor} textureUrl={aioFanUrl} />
    </group>
  </group>
  );
};

const CaseGeometry = () => {
  const { explodeStep } = usePC();
  const sideGlassRef = useRef<THREE.Group>(null);
  const sideGlassMatRef = useRef<any>(null);
  const frontGlassRef = useRef<THREE.Group>(null);
  const frontGlassMatRef = useRef<any>(null);
  const solidSideRef = useRef<THREE.Group>(null);

  useFrame((_state, delta) => {
    if (sideGlassRef.current && sideGlassMatRef.current) {
      const targetX = explodeStep >= 1 ? 25.0 : 1.95; // Fly away off-screen
      const targetOpacity = explodeStep >= 1 ? 0 : 0.25; // fade out
      
      sideGlassRef.current.position.x = THREE.MathUtils.lerp(sideGlassRef.current.position.x, targetX, delta * 3);
      sideGlassMatRef.current.opacity = THREE.MathUtils.lerp(sideGlassMatRef.current.opacity, targetOpacity, delta * 3);
    }
    if (frontGlassRef.current && frontGlassMatRef.current) {
      const targetZ = explodeStep >= 1 ? 25.0 : 1.95;
      const targetOpacity = explodeStep >= 1 ? 0 : 0.25;
      
      frontGlassRef.current.position.z = THREE.MathUtils.lerp(frontGlassRef.current.position.z, targetZ, delta * 3);
      frontGlassMatRef.current.opacity = THREE.MathUtils.lerp(frontGlassMatRef.current.opacity, targetOpacity, delta * 3);
    }
    if (solidSideRef.current) {
      const targetX = explodeStep >= 1 ? -25.0 : 0;
      solidSideRef.current.position.x = THREE.MathUtils.lerp(solidSideRef.current.position.x, targetX, delta * 3);
    }
  });

  const leftPanelShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-1.95, -2.5);
    shape.lineTo(1.95, -2.5);
    shape.lineTo(1.95, 2.5);
    shape.lineTo(-1.95, 2.5);
    shape.lineTo(-1.95, -2.5);

    const ioHole = new THREE.Path();
    ioHole.moveTo(-1.55 - 0.35, 1.2 - 0.725);
    ioHole.lineTo(-1.55 + 0.35, 1.2 - 0.725);
    ioHole.lineTo(-1.55 + 0.35, 1.2 + 0.725);
    ioHole.lineTo(-1.55 - 0.35, 1.2 + 0.725);
    ioHole.lineTo(-1.55 - 0.35, 1.2 - 0.725);
    shape.holes.push(ioHole);

    const psuHole = new THREE.Path();
    psuHole.moveTo(-1.0 - 0.9, -1.92 - 0.5);
    psuHole.lineTo(-1.0 + 0.9, -1.92 - 0.5);
    psuHole.lineTo(-1.0 + 0.9, -1.92 + 0.5);
    psuHole.lineTo(-1.0 - 0.9, -1.92 + 0.5);
    psuHole.lineTo(-1.0 - 0.9, -1.92 - 0.5);
    shape.holes.push(psuHole);

    const pcieHole = new THREE.Path();
    pcieHole.moveTo(-1.15 - 0.6, -0.1 - 0.25);
    pcieHole.lineTo(-1.15 + 0.6, -0.1 - 0.25);
    pcieHole.lineTo(-1.15 + 0.6, -0.1 + 0.25);
    pcieHole.lineTo(-1.15 - 0.6, -0.1 + 0.25);
    pcieHole.lineTo(-1.15 - 0.6, -0.1 - 0.25);
    shape.holes.push(pcieHole);

    const fanHole = new THREE.Path();
    fanHole.moveTo(0.2 - 1.2, 1.4 - 0.6);
    fanHole.lineTo(0.2 + 1.2, 1.4 - 0.6);
    fanHole.lineTo(0.2 + 1.2, 1.4 + 0.6);
    fanHole.lineTo(0.2 - 1.2, 1.4 + 0.6);
    fanHole.lineTo(0.2 - 1.2, 1.4 - 0.6);
    shape.holes.push(fanHole);

    return shape;
  }, []);

  const meshTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff'; // metal grid (opaque)
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#000000'; // grid hole (transparent)
      ctx.beginPath();
      ctx.arc(8, 8, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(40, 40); // Repeat across top panel
    return texture;
  }, []);

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
    texture.repeat.set(12, 12); // Less dense repeat for the back panel
    return texture;
  }, []);

  useEffect(() => {
    return () => {
      meshTexture.dispose();
      backMeshTexture.dispose();
    };
  }, [meshTexture, backMeshTexture]);

  return (
    <group>
      {/* Back Panel (Solid metal frame with motherboard IO and PSU cutout locations) */}
      <mesh position={[0, 0, -1.95]}>
        <boxGeometry args={[4, 5, 0.1]} />
        <meshStandardMaterial color="#22242a" metalness={0.7} roughness={0.4} />
      </mesh>
      

      

      {/* GPU PCIe Brackets at the left wall (Shifted to X = -1.98) */}
      {[-1.0, -1.15, -1.3].map((y, i) => (
        <group key={i}>
          <mesh position={[-1.98, y, -1.15]}>
            <boxGeometry args={[0.04, 0.14, 1.2]} />
            <meshStandardMaterial color="#1f2229" metalness={0.9} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* Top Panel (Mesh grill) */}
      <mesh position={[0, 2.45, 0]}>
        <boxGeometry args={[4, 0.1, 4]} />
        <meshStandardMaterial color="#1a1c22" roughness={0.6} metalness={0.5} />
      </mesh>

      {/* PSU Back panel with honeycomb mesh cutout */}
      <mesh position={[0, -1.95, -1.99]}>
        <planeGeometry args={[1.5, 0.9]} />
        <meshStandardMaterial 
          color="#2c2e36" 
          roughness={0.5} 
          metalness={0.9} 
          alphaMap={meshTexture} 
          transparent={false} 
          alphaTest={0.5}
          side={THREE.DoubleSide} 
        />
      </mesh>

      {/* Bottom Panel */}
      <mesh position={[0, -2.45, 0]}>
        <boxGeometry args={[4, 0.1, 4]} />
        <meshStandardMaterial color="#1a1c22" roughness={0.6} metalness={0.5} />
      </mesh>
      {/* PSU Bottom Ventilation Mesh (Visible from below) */}
      <mesh position={[-1.2, -2.51, -1.0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.5, 1.8]} />
        <meshStandardMaterial 
          color="#151515" 
          alphaMap={backMeshTexture} 
          transparent={false} 
          alphaTest={0.5}
          side={THREE.DoubleSide} 
        />
      </mesh>
      {/* PSU Bottom Ventilation Mesh (Visible from inside case) */}
      <mesh position={[-1.2, -2.39, -1.0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.5, 1.8]} />
        <meshStandardMaterial 
          color="#151515" 
          alphaMap={backMeshTexture} 
          transparent={false} 
          alphaTest={0.5}
          side={THREE.DoubleSide} 
        />
      </mesh>
      
      {/* Motherboard Tray with Standoffs (Gwinty) and Routing Holes */}
      <group position={[0, 0, -1.8]}>
        {/* Main Tray */}
        <mesh>
          <boxGeometry args={[3.8, 4.8, 0.05]} />
          <meshStandardMaterial color="#111" roughness={0.6} />
        </mesh>
        
        {/* Raised Standoffs (Gwinty) for Motherboard */}
        {[-1.3, -0.45, 0.4].map((x, i) => (
          [-1.85, 0, 1.85].map((y, j) => (
            <mesh key={`standoff-${i}-${j}`} position={[x, y, 0.035]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 0.07, 16]} />
              <meshStandardMaterial color="#b87333" metalness={0.8} roughness={0.4} />
            </mesh>
          ))
        ))}
        
        {/* Cable Routing Rubber Grommets */}
        {[-1.0, 0, 1.0].map((y, i) => (
          <mesh key={`grommet-${i}`} position={[1.4, y, 0.03]}>
            <boxGeometry args={[0.3, 0.6, 0.06]} />
            <meshStandardMaterial color="#050505" roughness={0.9} />
          </mesh>
        ))}
        {/* Top/Bottom Cable Routing Cutouts */}
        {[-0.8, 0.5].map((x, i) => (
          <mesh key={`grommet-top-${i}`} position={[x, 2.1, 0.03]}>
            <boxGeometry args={[0.6, 0.2, 0.06]} />
            <meshStandardMaterial color="#050505" roughness={0.9} />
          </mesh>
        ))}
      </group>

      {/* CPU Cooler Backplate Mesh Cutout (on the Back Panel, directly behind the CPU) */}
      <mesh position={[-0.45, 1.0, -2.01]}>
        <planeGeometry args={[1.4, 1.4]} />
        <meshStandardMaterial 
          color="#151515" 
          alphaMap={backMeshTexture} 
          transparent={false} 
          alphaTest={0.5}
          side={THREE.DoubleSide} 
        />
      </mesh>
      
      {/* CPU Cooler Backplate Hole (on the Motherboard Tray itself, slightly recessed) */}
      <mesh position={[-0.45, 1.0, -1.77]}>
        <planeGeometry args={[1.4, 1.4]} />
        <meshStandardMaterial color="#050505" roughness={1} />
      </mesh>

      {/* Front Panel - Glass with Frame */}
      <group position={[0, 0, 1.95]} ref={frontGlassRef as any}>
        <mesh>
          <boxGeometry args={[4, 5, 0.02]} />
          <meshPhysicalMaterial 
            ref={frontGlassMatRef}
            color="#c7d2fe" metalness={0.1} roughness={0.05} 
            transmission={1.0} thickness={1.5} transparent={true} opacity={1.0}
            ior={1.5} clearcoat={1.0} clearcoatRoughness={0.05}
          />
        </mesh>
        
        {/* Glass Frame Elements */}
        {/* Top/Bottom Frames */}
        {[-2.45, 2.45].map(y => (
          <mesh key={`front-h-frame-${y}`} position={[0, y, 0.015]}>
            <boxGeometry args={[4, 0.1, 0.04]} />
            <meshStandardMaterial color="#111317" roughness={0.4} metalness={0.8} />
          </mesh>
        ))}
        {/* Left/Right Frames */}
        {[-1.95, 1.95].map(x => (
          <mesh key={`front-v-frame-${x}`} position={[x, 0, 0.015]}>
            <boxGeometry args={[0.1, 4.8, 0.04]} />
            <meshStandardMaterial color="#111317" roughness={0.4} metalness={0.8} />
          </mesh>
        ))}
      </group>
      
      {/* Side Panel - Glass with Frame */}
      <group position={[1.95, 0, 0]} ref={sideGlassRef as any}>
        <mesh>
          <boxGeometry args={[0.02, 5, 3.9]} />
          <meshPhysicalMaterial 
            ref={sideGlassMatRef}
            color="#a5f3fc" metalness={0.1} roughness={0.05} 
            transmission={1.0} thickness={1.5} transparent={true} opacity={1.0}
            ior={1.5} clearcoat={1.0} clearcoatRoughness={0.05}
          />
        </mesh>
        
        {/* Glass Frame Elements */}
        {/* Top/Bottom Frames */}
        {[-2.45, 2.45].map(y => (
          <mesh key={`h-frame-${y}`} position={[0.015, y, 0]}>
            <boxGeometry args={[0.04, 0.1, 3.9]} />
            <meshStandardMaterial color="#111317" roughness={0.4} metalness={0.8} />
          </mesh>
        ))}
        {/* Front/Back Frames */}
        {[-1.9, 1.9].map(z => (
          <mesh key={`v-frame-${z}`} position={[0.015, 0, z]}>
            <boxGeometry args={[0.04, 4.8, 0.1]} />
            <meshStandardMaterial color="#111317" roughness={0.4} metalness={0.8} />
          </mesh>
        ))}
      </group>

      {/* Top Panel (Mesh grill) */}
      <mesh position={[0, 2.45, 0]}>
        <boxGeometry args={[4, 0.1, 4]} />
        <meshStandardMaterial 
          alphaMap={meshTexture} 
          transparent={true} 
          color="#151515"
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Solid Side Panel (Back) - with Honeycomb Mesh pattern for the Exhaust fan area! */}
      <group ref={solidSideRef as any}>
        <mesh position={[-1.975, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <extrudeGeometry args={[leftPanelShape, { depth: 0.05, bevelEnabled: false }]} />
          <meshStandardMaterial color="#22242a" metalness={0.7} roughness={0.4} />
        </mesh>
        {/* Side mesh cutout where the side exhaust fans are! (Outside) */}
        <mesh position={[-1.98, 1.4, 0.2]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[2.4, 1.2]} />
          <meshStandardMaterial 
            color="#151515" 
            alphaMap={backMeshTexture} 
            transparent={false} 
            alphaTest={0.5}
            side={THREE.DoubleSide} 
          />
        </mesh>
        {/* Side mesh cutout (Inside view) */}
        <mesh position={[-1.92, 1.4, 0.2]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[2.4, 1.2]} />
          <meshStandardMaterial 
            color="#151515" 
            alphaMap={backMeshTexture} 
            transparent={false} 
            alphaTest={0.5}
            side={THREE.DoubleSide} 
          />
        </mesh>
      </group>

      {/* Frame Posts */}
      {[1.95, -1.95].map(x => (
        [1.95, -1.95].map(z => (
          <mesh key={`${x}-${z}`} position={[x, 0, z]}>
            <boxGeometry args={[0.1, 5, 0.1]} />
            <meshStandardMaterial color="#111317" metalness={0.6} roughness={0.6} />
          </mesh>
        ))
      ))}
      
      {/* Internal Premium RGB Ambient Lighting */}
      <pointLight 
        position={[0, 1.2, -0.8]} 
        intensity={3.0} 
        distance={6} 
        color="#6366f1" 
        decay={1.8}
      />
      <pointLight 
        position={[0, -0.8, -0.6]} 
        intensity={2.5} 
        distance={5} 
        color="#ec4899" 
        decay={1.8}
      />
    </group>
  );
};

const HDDGeometry = () => {
  const hddTopTexture = useTexture(hddTopUrl);
  const hddBottomTexture = useTexture(hddBottomUrl);

  return (
    <group>
      {/* HDD Main Casing */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.0, 0.25, 1.4]} />
        <meshStandardMaterial color="#222" roughness={0.7} metalness={0.6} />
      </mesh>
      {/* Silver Top Lid */}
      <mesh position={[0, 0.13, 0]}>
        <boxGeometry args={[0.96, 0.02, 1.36]} />
        <meshStandardMaterial color="#e5e7eb" roughness={0.3} metalness={0.9} />
      </mesh>
      {/* HDD Top Texture */}
      <mesh position={[0, 0.141, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.96, 1.36]} />
        <meshStandardMaterial map={hddTopTexture} roughness={0.3} metalness={0.6} />
      </mesh>
      {/* HDD Bottom Texture */}
      <mesh position={[0, -0.126, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.0, 1.4]} />
        <meshStandardMaterial map={hddBottomTexture} roughness={0.6} metalness={0.3} />
      </mesh>
      {/* Connectors (Back) */}
      <mesh position={[0, -0.05, 0.71]}>
        <boxGeometry args={[0.6, 0.1, 0.04]} />
        <meshStandardMaterial color="#050505" roughness={0.9} />
      </mesh>
      <mesh position={[-0.2, -0.05, 0.73]}>
        <boxGeometry args={[0.2, 0.08, 0.02]} />
        <meshStandardMaterial color="#d4af37" roughness={0.4} metalness={1} />
      </mesh>
    </group>
  );
};

const ProceduralGeometry = ({ data, baseColor, rgbColor }: { data: PCComponent, baseColor: Color, rgbColor: string }) => {
  if (data.id.includes('cpu_cooler')) return <CPUCoolerGeometry rgbColor={rgbColor} />;
  if (data.id.includes('cpu')) return <CPUGeometry />;
  if (data.id.includes('gpu')) return <GPUGeometry rgbColor={rgbColor} />;
  if (data.id.includes('motherboard')) return <MotherboardGeometry rgbColor={rgbColor} />;
  if (data.id.includes('ram')) return <RAMGeometry color={baseColor} rgbColor={rgbColor} />;
  if (data.id.includes('ssd')) return <SSDGeometry />;
  if (data.id.includes('storage_hdd')) return <HDDGeometry />;
  if (data.id.includes('psu')) return <PSUGeometry rgbColor={rgbColor} />;
  if (data.id.includes('fan')) {
    const isExhaust = data.id === 'rear_fan' || data.id === 'side_fan_2';
    return <FanGeometry rgbColor={rgbColor} isExhaust={isExhaust} />;
  }
  if (data.id.includes('case')) return <CaseGeometry />;
  
  return (
    <mesh>
      <boxGeometry args={data.geometryArgs} />
      <meshStandardMaterial color={baseColor} roughness={0.7} metalness={0.3} />
    </mesh>
  );
};

// --- Main Component Mesh ---

const ComponentMesh = ({ data, isMobile }: { data: PCComponent, isMobile: boolean }) => {
  const groupRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const { selectedComponent, setSelectedComponent, explodeStep, rgbColor, rgbEnabled, showLabels, showInstructions } = usePC();
  const effectiveRgbColor = rgbEnabled ? rgbColor : '#000000';
  
  useCursor(hovered && !isMobile);
  
  const isSelected = selectedComponent?.id === data.id;
  const targetPosition = useMemo(() => new Vector3(), []);
  const targetScale3 = useMemo(() => new Vector3(), []);
  const baseColor = useMemo(() => new Color(data.color || '#333333'), [data.color]);
  const timeAccumulator = useRef(0);

  const liftOffset = hovered && !isSelected ? 0.1 : 0;
  useFrame((_state, delta) => {
    if (!groupRef.current) return;

    if (isMobile) {
      timeAccumulator.current += delta;
      if (timeAccumulator.current < 1/30) return;
      delta = timeAccumulator.current;
      timeAccumulator.current = 0;
    }

    const posArray = explodeStep === 2 ? data.explodedPosition : data.position;
    
    // Add a gentle, premium out-of-phase floating effect in the exploded view
    // (using component's id length as a consistent "random" seed so each component floats uniquely)
    let floatOffset = 0;
    if (explodeStep === 2) {
      const phase = data.id.charCodeAt(0) * 10;
      floatOffset = Math.sin(_state.clock.getElapsedTime() * 1.2 + phase) * 0.08;
    }

    targetPosition.set(posArray[0], posArray[1] + liftOffset + floatOffset, posArray[2]);
    groupRef.current.position.lerp(targetPosition, delta * 5);
    
    const targetScale = isSelected ? 1.05 : hovered ? 1.03 : 1.0;
    targetScale3.set(targetScale, targetScale, targetScale);
    groupRef.current.scale.lerp(targetScale3, delta * 8);
  });

  const visual = useMemo(() => <ProceduralGeometry data={data} baseColor={baseColor} rgbColor={effectiveRgbColor} />, [data, baseColor, effectiveRgbColor]);

  return (
    <group
      ref={groupRef}
      position={data.position}
      rotation={
        (data.id === 'rear_fan' || data.id === 'side_fan_2') ? [0, Math.PI / 2, 0] : 
        data.id === 'psu' ? [0, Math.PI / 2, 0] : 
        [0, 0, 0]
      }
      onClick={(e) => {
        e.stopPropagation();
        if (selectedComponent?.id !== data.id) {
          playSelectSound();
        }
        setSelectedComponent(data);
      }}
      onPointerOver={(e) => {
        if (isMobile) return;
        e.stopPropagation();
        if (!hovered && selectedComponent?.id !== data.id) {
          playHoverSound();
        }
        setHovered(true);
      }}
      onPointerOut={() => {
        if (isMobile) return;
        setHovered(false);
      }}
    >
      <ErrorBoundary fallback={<mesh><boxGeometry args={data.geometryArgs} /><meshStandardMaterial color={baseColor} /></mesh>}>
        <Suspense fallback={<mesh><boxGeometry args={data.geometryArgs} /><meshStandardMaterial color={baseColor} /></mesh>}>
          {visual}
        </Suspense>
      </ErrorBoundary>
      
      {showLabels && !showInstructions && !selectedComponent && (!isMobile && (hovered || isSelected) || explodeStep === 2) && (
        <Html 
          position={[0, data.geometryArgs[1] / 2 + 0.15, 0]}
          center
          distanceFactor={12}
          zIndexRange={[100, 0]}
        >
          <div 
            className="flex flex-col items-center pointer-events-auto cursor-pointer opacity-100 transition-all duration-300 transform scale-100"
            onPointerEnter={(e) => {
              if (isMobile) return;
              e.stopPropagation();
              if (!hovered) {
                playHoverSound();
              }
              setHovered(true);
            }}
            onPointerLeave={(e) => {
              if (isMobile) return;
              e.stopPropagation();
              setHovered(false);
            }}
            onClick={(e) => {
              e.stopPropagation();
              playSelectSound();
              setSelectedComponent(data);
            }}
          >
            <div 
              className={`px-4 py-2 rounded-xl backdrop-blur-xl border shadow-2xl transition-all duration-300 ${hovered ? 'text-white scale-105' : 'bg-black/60 border-white/10 text-slate-200'}`}
              style={hovered ? { 
                backgroundColor: `${rgbColor}33`, 
                borderColor: `${rgbColor}80`, 
                boxShadow: `0 0 15px ${rgbColor}80` 
              } : undefined}
            >
              <span className="font-semibold tracking-wide text-sm whitespace-nowrap">{data.name}</span>
            </div>
            <div 
              className={`w-px h-8 transition-all duration-300 ${!hovered ? 'bg-gradient-to-b from-white/30 to-transparent' : ''}`}
              style={hovered ? {
                backgroundColor: rgbColor,
                boxShadow: `0 0 10px ${rgbColor}`
              } : undefined}
            ></div>
          </div>
        </Html>
      )}
    </group>
  );
};

const LocalAirflowParticles = ({ count = 50, radius = 0.4, length = 1.5, speedMult = 1, color = "#38bdf8" }: { count?: number, radius?: number, length?: number, speedMult?: number, color?: string }) => {
  const { showAirflow } = usePC();
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const particles = useMemo(() => {
    return Array.from({ length: count }).map(() => {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * radius;
      return {
        position: new THREE.Vector3(
          Math.cos(angle) * r,
          Math.sin(angle) * r,
          Math.random() * length
        ),
        speed: (1.5 + Math.random() * 2) * speedMult,
        wobbleSpeed: 2 + Math.random() * 4,
        wobbleSize: 0.02 + Math.random() * 0.03,
        baseScale: 0.5 + Math.random() * 1.5,
        angleOffset: angle
      };
    });
  }, [count, radius, length, speedMult]);

  useFrame((state, delta) => {
    if (!showAirflow || !meshRef.current) return;
    
    particles.forEach((p, i) => {
      p.position.z += p.speed * delta;
      
      const wobbleX = Math.cos(state.clock.elapsedTime * p.wobbleSpeed + p.angleOffset) * p.wobbleSize;
      const wobbleY = Math.sin(state.clock.elapsedTime * p.wobbleSpeed + p.angleOffset) * p.wobbleSize;
      
      if (p.position.z > length) {
        p.position.z = 0;
        const angle = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()) * radius;
        p.position.x = Math.cos(angle) * r;
        p.position.y = Math.sin(angle) * r;
      }
      
      dummy.position.set(p.position.x + wobbleX, p.position.y + wobbleY, p.position.z);
      
      let scale = p.baseScale;
      const normalizedZ = p.position.z / length;
      if (normalizedZ < 0.2) scale *= (normalizedZ / 0.2); 
      if (normalizedZ > 0.8) scale *= ((1 - normalizedZ) / 0.2); 
      scale = Math.max(0, scale);
      
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (!showAirflow) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined as any, undefined as any, count]}>
      <sphereGeometry args={[0.015, 8, 8]} />
      <meshBasicMaterial 
        color={color} 
        transparent 
        opacity={0.6} 
        blending={THREE.AdditiveBlending} 
        depthWrite={false} 
      />
    </instancedMesh>
  );
};

export const PCModel = () => {
  const [isMobile, setIsMobile] = useState(false);
  const { xrayMode } = usePC();
  const groupRef = useRef<Group>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 768px)').matches);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.traverse((child: any) => {
        if (child.isMesh && child.material) {
          // Store original properties
          if (!child.userData.originalMaterial) {
            child.userData.originalMaterial = {
              color: child.material.color ? child.material.color.clone() : null,
              wireframe: child.material.wireframe,
              emissive: child.material.emissive ? child.material.emissive.clone() : null,
              emissiveIntensity: child.material.emissiveIntensity,
              transparent: child.material.transparent,
              opacity: child.material.opacity
            };
          }

          if (xrayMode) {
            child.material.wireframe = true;
            child.material.transparent = true;
            child.material.opacity = 0.3;
            if (child.material.color) {
              child.material.color.setHex(0x00ffff);
            }
            if (child.material.emissive) {
              child.material.emissive.setHex(0x00ffff);
              child.material.emissiveIntensity = 0.5;
            }
          } else {
            const orig = child.userData.originalMaterial;
            child.material.wireframe = orig.wireframe;
            child.material.transparent = orig.transparent;
            child.material.opacity = orig.opacity;
            if (child.material.color && orig.color) child.material.color.copy(orig.color);
            if (child.material.emissive && orig.emissive) {
              child.material.emissive.copy(orig.emissive);
              child.material.emissiveIntensity = orig.emissiveIntensity;
            }
          }
        }
      });
    }
  }, [xrayMode]);

  return (
    <group position={[0, isMobile ? -0.5 : -1, 0]} scale={isMobile ? 0.7 : 1} ref={groupRef}>
      <Bvh firstHitOnly>
        {pcComponents.map((comp) => {
          if (comp.id === 'case_fan') {
            return (
              <group key="case_fans_group">
                <ComponentMesh data={{ ...comp, id: 'case_fan_1', position: [0.8, -0.8, 1.75], explodedPosition: [4, -2.5, 5] }} isMobile={isMobile} />
                <ComponentMesh data={{ ...comp, id: 'case_fan_2', position: [0.8, 0.8, 1.75], explodedPosition: [4, 2.5, 5] }} isMobile={isMobile} />
              </group>
            );
          }
          return <ComponentMesh key={comp.id} data={comp} isMobile={isMobile} />;
        })}
      </Bvh>
    </group>
  );
};
