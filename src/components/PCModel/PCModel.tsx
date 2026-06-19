import { useRef, useState, useMemo, useEffect, Suspense, Component } from 'react';
import type { ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Group, Color, Vector3 } from 'three';
import { Html, useCursor, Bvh } from '@react-three/drei';
import { pcComponents } from '../../data/components';
import type { PCComponent } from '../../data/components';
import { usePC } from '../../hooks/usePC';
import { playHoverSound, playSelectSound } from '../../utils/audio';

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

const CPUGeometry = () => (
  <group>
    {/* Green PCB Base */}
    <mesh position={[0, 0, -0.02]}>
      <boxGeometry args={[0.8, 0.8, 0.04]} />
      <meshStandardMaterial color="#1a4d2e" roughness={0.9} />
    </mesh>
    {/* Silver IHS (Heat Spreader) */}
    <mesh position={[0, 0, 0.04]}>
      <boxGeometry args={[0.65, 0.65, 0.08]} />
      <meshStandardMaterial color="#c0c5ce" metalness={0.9} roughness={0.2} />
    </mesh>
    {/* IHS Bevel/Indentation */}
    <mesh position={[0, 0, 0.09]}>
      <boxGeometry args={[0.55, 0.55, 0.02]} />
      <meshStandardMaterial color="#d1d5db" metalness={0.8} roughness={0.3} />
    </mesh>
    {/* Gold Pins (Bottom/Back) */}
    <mesh position={[0, 0, -0.041]} rotation={[0, Math.PI, 0]}>
      <planeGeometry args={[0.7, 0.7]} />
      <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.4} />
    </mesh>
  </group>
);

const GPUGeometry = ({ rgbColor }: { rgbColor: string }) => {
  const fanRef1 = useRef<Group>(null);
  const fanRef2 = useRef<Group>(null);
  const fanRef3 = useRef<Group>(null);
  
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

      {/* Fans */}
      {[-1.1, 0, 1.1].map((x, i) => (
        <group key={i} position={[x, -0.2, 0]} ref={i === 0 ? fanRef1 : i === 1 ? fanRef2 : fanRef3}>
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
          <group position={[0, -0.85, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <LocalAirflowParticles count={30} radius={0.35} length={0.8} speedMult={1.5} color="#38bdf8" />
          </group>
        </group>
      ))}
    </group>
  );
};

const RAMGeometry = ({ rgbColor }: { color?: Color, rgbColor: string }) => (
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
    {/* Gamingowe nakładki radiatora */}
    <mesh position={[0.045, 0, 0.05]}>
      <boxGeometry args={[0.02, 1.2, 0.2]} />
      <meshStandardMaterial color="#3b3e46" metalness={0.9} roughness={0.2} />
    </mesh>
    <mesh position={[-0.045, 0, 0.05]}>
      <boxGeometry args={[0.02, 1.2, 0.2]} />
      <meshStandardMaterial color="#3b3e46" metalness={0.9} roughness={0.2} />
    </mesh>
    {/* Ledowy Dyfuzor RGB (Przód, patrzący na nas) */}
    <mesh position={[0, 0, 0.18]}>
      <boxGeometry args={[0.06, 1.36, 0.08]} />
      <meshStandardMaterial color={rgbColor} emissive={rgbColor} emissiveIntensity={2.5} toneMapped={false} />
    </mesh>
    {/* Drobne nacięcia na pasku RGB (detal premium) */}
    {[0.4, 0, -0.4].map((y, i) => (
      <mesh key={i} position={[0, y, 0.22]}>
        <boxGeometry args={[0.065, 0.05, 0.02]} />
        <meshStandardMaterial color="#111" roughness={0.8} />
      </mesh>
    ))}
  </group>
);

const MotherboardGeometry = ({ rgbColor }: { rgbColor: string }) => (
  <group>
    {/* Main PCB */}
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[3, 4, 0.06]} />
      <meshStandardMaterial color="#111214" roughness={0.9} />
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

    {/* CPU Socket & Mounting Bracket */}
    <mesh position={[0, 1, 0.05]}>
      <boxGeometry args={[1.0, 1.0, 0.08]} />
      <meshStandardMaterial color="#222" roughness={0.8} />
    </mesh>
    <mesh position={[0, 1, 0.1]}>
      <boxGeometry args={[0.8, 0.8, 0.02]} />
      <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.3} />
    </mesh>

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
  </group>
);

const PSUGeometry = () => {
  const fanRef = useRef<Group>(null);
  
  useFrame((_state, delta) => {
    if (fanRef.current) {
      fanRef.current.rotation.y += delta * 15;
    }
  });

  return (
    <group>
      {/* Main Casing */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.8, 0.8, 1.5]} />
        <meshStandardMaterial color="#111" metalness={0.6} roughness={0.5} />
      </mesh>
      {/* Bottom Fan Grill - aligned horizontally on Y-axis */}
      <mesh position={[0, -0.401, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 0.01, 32]} />
        <meshStandardMaterial color="#050505" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Inner Rotating Fan Blades (horizontal XZ plane, rotating around Y-axis) */}
      <group position={[0, -0.36, 0]} ref={fanRef}>
        {/* Hub */}
        <mesh>
          <cylinderGeometry args={[0.15, 0.15, 0.03, 16]} />
          <meshStandardMaterial color="#151515" roughness={0.6} />
        </mesh>
        {/* Fan Blades */}
        {[0, 1, 2, 3, 4, 5].map(i => (
          <mesh key={i} rotation={[0, (Math.PI / 3) * i, 0]}>
            <boxGeometry args={[0.5, 0.01, 0.1]} />
            <meshStandardMaterial color="#222" roughness={0.5} />
          </mesh>
        ))}
      </group>
      {/* Back Switch and Plug */}
      <mesh position={[0, 0, -0.751]}>
        <boxGeometry args={[1.6, 0.8, 0.02]} />
        <meshStandardMaterial color="#050505" roughness={0.8} />
      </mesh>
      <mesh position={[-0.6, 0.2, -0.762]}>
        <boxGeometry args={[0.15, 0.2, 0.02]} />
        <meshStandardMaterial color="#e94560" roughness={0.6} />
      </mesh>
      <mesh position={[0.5, 0.2, -0.762]}>
        <boxGeometry args={[0.3, 0.25, 0.02]} />
        <meshStandardMaterial color="#111" roughness={0.6} />
      </mesh>
      {/* Modular Cable Ports */}
      <mesh position={[0, 0, 0.751]}>
        <boxGeometry args={[1.5, 0.7, 0.02]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
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

const SSDGeometry = () => (
  <group>
    {/* M.2 PCB */}
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[0.22, 0.8, 0.02]} />
      <meshStandardMaterial color="#111214" roughness={0.9} />
    </mesh>
    {/* Memory Chips */}
    {[0.2, 0, -0.2].map((y, i) => (
      <mesh key={i} position={[0, y, 0.015]}>
        <boxGeometry args={[0.18, 0.15, 0.03]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.5} />
      </mesh>
    ))}
    {/* Controller Chip */}
    <mesh position={[0, -0.35, 0.015]}>
      <boxGeometry args={[0.15, 0.1, 0.03]} />
      <meshStandardMaterial color="#151515" metalness={0.5} roughness={0.4} />
    </mesh>
    {/* Sticker Label */}
    <mesh position={[0, 0, 0.031]}>
      <planeGeometry args={[0.2, 0.7]} />
      <meshStandardMaterial color="#e2e8f0" roughness={0.6} />
    </mesh>
    {/* Gold Connector */}
    <mesh position={[0, 0.4, 0]}>
      <boxGeometry args={[0.22, 0.05, 0.021]} />
      <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.3} />
    </mesh>
  </group>
);

const FanGeometry = ({ rgbColor, isExhaust = false }: { rgbColor: string, isExhaust?: boolean }) => {
  const bladeRef = useRef<Group>(null);
  
  useFrame((_state, delta) => {
    if (bladeRef.current) {
      bladeRef.current.rotation.z += delta * 15;
    }
  });

  return (
    <group>
      {/* Outer Frame */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1, 1, 0.2]} />
        <meshStandardMaterial color="#151515" roughness={0.7} />
      </mesh>
      {/* Inner Cutout */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.48, 0.48, 0.22, 32]} />
        <meshStandardMaterial color="#050505" roughness={0.9} side={2} />
      </mesh>
      {/* Rubber Corners */}
      {[0.4, -0.4].map(x => 
        [0.4, -0.4].map(y => (
          <mesh key={`${x}-${y}`} position={[x, y, 0.11]}>
            <boxGeometry args={[0.15, 0.15, 0.02]} />
            <meshStandardMaterial color="#333" roughness={0.9} />
          </mesh>
        ))
      )}
      {/* Blades */}
      <group ref={bladeRef}>
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.18, 32]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
        </mesh>
        {[0, 1, 2, 3].map(i => (
          <mesh key={i} position={[0, 0, 0]} rotation={[0, 0, (Math.PI / 2) * i]}>
            <boxGeometry args={[0.9, 0.1, 0.05]} />
            <meshStandardMaterial color="#222" roughness={0.4} />
          </mesh>
        ))}
      </group>
      {/* RGB Ring */}
      <mesh position={[0, 0, 0.09]}>
        <torusGeometry args={[0.46, 0.02, 16, 64]} />
        <meshStandardMaterial color={rgbColor} emissive={rgbColor} emissiveIntensity={1} toneMapped={false} />
      </mesh>

      {/* Airflow */}
      <group position={[0, 0, 0]} rotation={[0, Math.PI, 0]}>
        <LocalAirflowParticles count={80} radius={0.4} length={2.5} speedMult={2} color={isExhaust ? "#ef4444" : "#38bdf8"} />
      </group>
    </group>
  );
};

const CPUCoolerGeometry = ({ rgbColor }: { rgbColor: string }) => (
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
      <meshStandardMaterial color="#d1d5db" metalness={0.8} roughness={0.3} />
    </mesh>
    {/* Top Cover */}
    <mesh position={[0, 0.51, 0.12]}>
      <boxGeometry args={[1, 0.02, 0.54]} />
      <meshStandardMaterial color="#151515" roughness={0.8} />
    </mesh>
    {/* Attached Fan */}
    <group position={[0, 0.1, 0.5]}>
      <FanGeometry rgbColor={rgbColor} />
    </group>
  </group>
);

const CaseGeometry = () => {
  const { explodeStep } = usePC();
  const sideGlassRef = useRef<THREE.Mesh>(null);
  const sideGlassMatRef = useRef<any>(null);

  useFrame((_state, delta) => {
    if (sideGlassRef.current && sideGlassMatRef.current) {
      const targetX = explodeStep >= 1 ? 9.0 : 1.95; // slide out further to X=9.0
      const targetOpacity = explodeStep >= 1 ? 0 : 0.25; // fade out
      
      sideGlassRef.current.position.x = THREE.MathUtils.lerp(sideGlassRef.current.position.x, targetX, delta * 4);
      sideGlassMatRef.current.opacity = THREE.MathUtils.lerp(sideGlassMatRef.current.opacity, targetOpacity, delta * 4);
    }
  });

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
      
      {/* Motherboard IO Panel Accent (Shifted to X = -1.98 to sit on the outside of the left panel) */}
      <mesh position={[-1.98, 1.2, -1.55]}>
        <boxGeometry args={[0.04, 1.4, 0.65]} />
        <meshStandardMaterial color="#888c94" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Motherboard IO Ports - Professional High-End Layout */}
      {/* BIOS Flashback & Clear CMOS */}
      <mesh position={[-2.0, 1.75, -1.65]}>
        <boxGeometry args={[0.02, 0.06, 0.06]} />
        <meshStandardMaterial color="#111" roughness={0.8} />
      </mesh>
      <mesh position={[-2.0, 1.75, -1.45]} rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.02, 16]} />
        <meshStandardMaterial color="#444" metalness={0.5} />
      </mesh>

      {/* Wi-Fi Antenna Connectors (Gold) */}
      {[-1.65, -1.45].map(z => (
        <mesh key={`wifi-${z}`} position={[-2.0, 1.6, z]} rotation={[0, 0, Math.PI/2]}>
          <cylinderGeometry args={[0.03, 0.03, 0.04, 16]} />
          <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.2} />
        </mesh>
      ))}

      {/* USB 2.0 (Black) */}
      {[-1.65, -1.45].map(z => (
        <mesh key={`usb2-${z}`} position={[-2.0, 1.45, z]}>
          <boxGeometry args={[0.02, 0.04, 0.1]} />
          <meshStandardMaterial color="#111" roughness={0.9} />
        </mesh>
      ))}

      {/* USB 3.2 Gen 1 (Blue) */}
      {[-1.65, -1.45].map(z => (
        <mesh key={`usb3-${z}`} position={[-2.0, 1.3, z]}>
          <boxGeometry args={[0.02, 0.04, 0.1]} />
          <meshStandardMaterial color="#1e3a8a" roughness={0.6} />
        </mesh>
      ))}

      {/* 2.5G Ethernet & USB 3.2 Gen 2 (Red) */}
      <mesh position={[-2.0, 1.15, -1.65]}>
        <boxGeometry args={[0.02, 0.08, 0.12]} />
        <meshStandardMaterial color="#1f2937" metalness={0.6} />
      </mesh>
      <mesh position={[-2.0, 1.15, -1.45]}>
        <boxGeometry args={[0.02, 0.04, 0.1]} />
        <meshStandardMaterial color="#991b1b" roughness={0.6} />
      </mesh>

      {/* USB-C & USB 3.2 Gen 2 (Red) */}
      <mesh position={[-2.0, 1.0, -1.65]}>
        <boxGeometry args={[0.02, 0.025, 0.08]} />
        <meshStandardMaterial color="#111" roughness={0.7} />
      </mesh>
      <mesh position={[-2.0, 1.0, -1.45]}>
        <boxGeometry args={[0.02, 0.04, 0.1]} />
        <meshStandardMaterial color="#991b1b" roughness={0.6} />
      </mesh>

      {/* High-End Audio Stack (Gold Plated) */}
      {[-1.65, -1.55, -1.45].map((z, i) => (
        <mesh key={`audio-top-${i}`} position={[-2.0, 0.85, z]} rotation={[0, 0, Math.PI/2]}>
          <cylinderGeometry args={[0.025, 0.025, 0.03, 16]} />
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}
      {[-1.65, -1.55].map((z, i) => (
        <mesh key={`audio-bot-${i}`} position={[-2.0, 0.75, z]} rotation={[0, 0, Math.PI/2]}>
          <cylinderGeometry args={[0.025, 0.025, 0.03, 16]} />
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}
      {/* SPDIF Optical out */}
      <mesh position={[-2.0, 0.75, -1.45]}>
        <boxGeometry args={[0.02, 0.04, 0.04]} />
        <meshStandardMaterial color="#111" />
      </mesh>

      {/* PSU Backplate cutout & switch (Shifted to X = -1.98 to sit on the outside of the left panel) */}
      <mesh position={[-1.98, -1.92, -1.0]}>
        <boxGeometry args={[0.04, 1.0, 1.8]} />
        <meshStandardMaterial color="#1c1d22" metalness={0.6} roughness={0.5} />
      </mesh>
      {/* PSU Honeycomb ventilation grid (X = -2.0) */}
      <mesh position={[-2.0, -1.92, -1.0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.8, 1.0]} />
        <meshStandardMaterial 
          color="#050505" 
          alphaMap={backMeshTexture} 
          transparent={true} 
          side={THREE.DoubleSide} 
        />
      </mesh>
      {/* Power switch & plug (X = -2.0) */}
      <mesh position={[-2.0, -1.72, -0.4]}>
        <boxGeometry args={[0.02, 0.2, 0.15]} />
        <meshStandardMaterial color="#ef4444" roughness={0.5} />
      </mesh>
      <mesh position={[-2.0, -1.72, -1.5]}>
        <boxGeometry args={[0.02, 0.25, 0.3]} />
        <meshStandardMaterial color="#111" roughness={0.7} />
      </mesh>

      {/* GPU PCIe Brackets at the left wall (Shifted to X = -1.98) */}
      {[-1.0, -1.15, -1.3].map((y, i) => (
        <group key={i}>
          <mesh position={[-1.98, y, -1.15]}>
            <boxGeometry args={[0.04, 0.14, 1.2]} />
            <meshStandardMaterial color="#1f2229" metalness={0.9} roughness={0.3} />
          </mesh>
          {/* DisplayPort / HDMI cutout lines (X = -2.0) */}
          {i === 0 && (
            <>
              <mesh position={[-2.0, y, -1.45]}>
                <boxGeometry args={[0.02, 0.04, 0.15]} />
                <meshStandardMaterial color="#111" />
              </mesh>
              <mesh position={[-2.0, y, -1.05]}>
                <boxGeometry args={[0.02, 0.04, 0.15]} />
                <meshStandardMaterial color="#111" />
              </mesh>
            </>
          )}
        </group>
      ))}

      {/* Top Panel (Mesh grill) */}
      <mesh position={[0, 2.45, 0]}>
        <boxGeometry args={[4, 0.1, 4]} />
        <meshStandardMaterial 
          color="#2c2e36" 
          roughness={0.5} 
          metalness={0.9} 
          alphaMap={meshTexture} 
          transparent={true} 
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
          transparent={true} 
          side={THREE.DoubleSide} 
        />
      </mesh>
      {/* PSU Bottom Ventilation Mesh (Visible from inside case) */}
      <mesh position={[-1.2, -2.39, -1.0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.5, 1.8]} />
        <meshStandardMaterial 
          color="#151515" 
          alphaMap={backMeshTexture} 
          transparent={true} 
          side={THREE.DoubleSide} 
        />
      </mesh>
      
      {/* Motherboard Tray */}
      <mesh position={[0, 0, -1.8]}>
        <boxGeometry args={[3.8, 4.8, 0.05]} />
        <meshStandardMaterial color="#111" roughness={0.6} />
      </mesh>

      {/* CPU Cooler Backplate Mesh Cutout (on the Back Panel, directly behind the CPU) */}
      <mesh position={[0, 1.0, -2.01]}>
        <planeGeometry args={[1.4, 1.4]} />
        <meshStandardMaterial 
          color="#151515" 
          alphaMap={backMeshTexture} 
          transparent={true} 
          side={THREE.DoubleSide} 
        />
      </mesh>
      
      {/* CPU Cooler Backplate Hole (on the Motherboard Tray itself, slightly recessed) */}
      <mesh position={[0, 1.0, -1.77]}>
        <planeGeometry args={[1.4, 1.4]} />
        <meshStandardMaterial color="#050505" roughness={1} />
      </mesh>

      {/* Front Panel - Glass */}
      <mesh position={[0, 0, 1.95]}>
        <boxGeometry args={[4, 5, 0.05]} />
        <meshPhysicalMaterial 
          color="#c7d2fe" metalness={0.1} roughness={0.05} 
          transmission={1.0} thickness={1.5} transparent opacity={0.25}
          ior={1.5} clearcoat={1.0} clearcoatRoughness={0.05}
        />
      </mesh>
      
      {/* Side Panel - Glass with Frame */}
      <group position={[1.95, 0, 0]} ref={sideGlassRef as any}>
        <mesh>
          <boxGeometry args={[0.02, 5, 3.9]} />
          <meshPhysicalMaterial 
            ref={sideGlassMatRef}
            color="#a5f3fc" metalness={0.1} roughness={0.05} 
            transmission={1.0} thickness={1.5} transparent opacity={0.25}
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
      
      {/* Solid Side Panel (Back) - with Honeycomb Mesh pattern for the Exhaust fan area! */}
      <mesh position={[-1.95, 0, 0]}>
        <boxGeometry args={[0.05, 5, 3.9]} />
        <meshStandardMaterial color="#22242a" metalness={0.7} roughness={0.4} />
      </mesh>
      {/* Side mesh cutout where the side exhaust fan is! (Shifted to X = -1.98 to sit outside the metal panel) */}
      <mesh position={[-1.98, 1.4, -0.4]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.2, 1.2]} />
        <meshStandardMaterial 
          color="#151515" 
          alphaMap={backMeshTexture} 
          transparent={true} 
          side={THREE.DoubleSide} 
        />
      </mesh>

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

const HDDGeometry = () => (
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
    {/* Black Circle for Motor/Platter */}
    <mesh position={[0, 0.141, -0.1]}>
      <cylinderGeometry args={[0.4, 0.4, 0.01, 32]} />
      <meshStandardMaterial color="#111" roughness={0.5} metalness={0.8} />
    </mesh>
    {/* Read/Write Actuator Arm Accent */}
    <mesh position={[0.3, 0.141, 0.35]} rotation={[0, -Math.PI / 6, 0]}>
      <boxGeometry args={[0.1, 0.01, 0.4]} />
      <meshStandardMaterial color="#888" roughness={0.4} metalness={0.9} />
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

const ProceduralGeometry = ({ data, baseColor, rgbColor }: { data: PCComponent, baseColor: Color, rgbColor: string }) => {
  if (data.id.includes('cpu_cooler')) return <CPUCoolerGeometry rgbColor={rgbColor} />;
  if (data.id.includes('cpu')) return <CPUGeometry />;
  if (data.id.includes('gpu')) return <GPUGeometry rgbColor={rgbColor} />;
  if (data.id.includes('motherboard')) return <MotherboardGeometry rgbColor={rgbColor} />;
  if (data.id.includes('ram')) return <RAMGeometry color={baseColor} rgbColor={rgbColor} />;
  if (data.id.includes('ssd')) return <SSDGeometry />;
  if (data.id.includes('storage_hdd')) return <HDDGeometry />;
  if (data.id.includes('psu')) return <PSUGeometry />;
  if (data.id.includes('fan')) return <FanGeometry rgbColor={rgbColor} isExhaust={data.id === 'rear_fan'} />;
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
  const { selectedComponent, setSelectedComponent, explodeStep, rgbColor, showLabels, showInstructions } = usePC();

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

  const visual = useMemo(() => <ProceduralGeometry data={data} baseColor={baseColor} rgbColor={rgbColor} />, [data, baseColor, rgbColor]);

  return (
    <group
      ref={groupRef}
      position={data.position}
      rotation={
        data.id === 'rear_fan' ? [0, Math.PI / 2, 0] : 
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
      <ErrorBoundary fallback={visual}>
        <Suspense fallback={visual}>
          {visual}
        </Suspense>
      </ErrorBoundary>
      
      {showLabels && !showInstructions && (hovered || isSelected || explodeStep === 2) && !selectedComponent && !isMobile && (
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
