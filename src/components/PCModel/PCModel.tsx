import { CPUGeometry } from './geometries/CPUGeometry';
import { GPUGeometry } from './geometries/GPUGeometry';
import { SSDGeometry } from './geometries/SSDGeometry';
import { HDDGeometry } from './geometries/HDDGeometry';
import { RAMGeometry } from './geometries/RAMGeometry';
import { MotherboardGeometry } from './geometries/MotherboardGeometry';
import { PSUGeometry } from './geometries/PSUGeometry';
import { CaseGeometry } from './geometries/CaseGeometry';
import { CPUCoolerGeometry, FanGeometry } from './geometries/CPUCoolerGeometry';
import { CableGeometry } from './CableGeometry';
import { useRef, useState, useMemo, useEffect, Suspense, Component } from 'react';
import type { ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Color, Vector3, MeshStandardMaterial } from 'three';
import { Html, useCursor, Bvh, useTexture } from '@react-three/drei';
import { pcComponents } from '../../data/components';
import type { PCComponent } from '../../data/components';
import { usePC } from '../../hooks/usePC';
import { playHoverSound, playSelectSound } from '../../utils/audio';
import moboBackUrl from '../../assets/mobo_back_photo.webp';
import caseBackUrl from '../../assets/case_back.webp';
import caseBehindUrl from '../../assets/case_behind.webp';
import caseBottomUrl from '../../assets/case_bottom.webp';
import caseInteriorUrl from '../../assets/case_interior.webp';
import cpuSocketUrl from '../../assets/cpu_socket.webp';
import moboChipsetUrl from '../../assets/mobo_chipset.webp';
import psuTopUrl from '../../assets/psu_top.webp';
import psuSideUrl from '../../assets/psu_side.webp';
import psuBackUrl from '../../assets/psu_back.webp';
import psuFrontUrl from '../../assets/psu_front.webp';
import psuBottomUrl from '../../assets/psu_bottom.webp';
import aioFanUrl from '../../assets/aio_fan.webp';
import heatsinkUrl from '../../assets/heatsink.webp';
import heatsinkSideUrl from '../../assets/heatsink_side.webp';
import gpuBackplateUrl from '../../assets/gpu_backplate.webp';
import gpuTopUrl from '../../assets/gpu_top.webp';
import gpuFrontUrl from '../../assets/gpu_front.webp';
import ramSideUrl from '../../assets/ram_side.webp';
import hddTopUrl from '../../assets/hdd_top.webp';
import hddBottomUrl from '../../assets/hdd_bottom.webp';
import caseFanUrl from '../../assets/case_fan.webp';
import ssdTopUrl from '../../assets/ssd_top.webp';
import ssdBottomUrl from '../../assets/ssd_bottom.webp';
import cpuTopUrl from '../../assets/cpu_top.webp';
import cpuBottomUrl from '../../assets/cpu_bottom.webp';
import moboTopUrl from '../../assets/mobo_top.webp';
import moboIoUrl from '../../assets/mobo_io.webp';
import gpuIoUrl from '../../assets/gpu_io.webp';
import cmosBatteryUrl from '../../assets/cmos_battery.webp';
import m2HeatsinkUrl from '../../assets/m2_heatsink.webp';

// --- R3F Extrude Options (extracted to prevent memory leak/geometry recreation) ---

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

  const baseLift = data.geometryArgs ? Math.max(0.05, data.geometryArgs[1] * 0.03) : 0.1;
  const liftOffset = hovered && !isSelected ? baseLift : 0;
  
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
    let floatOffset = 0;
    if (explodeStep === 2) {
      const phase = data.id.split('').reduce((acc, char) => acc + char.charCodeAt(0) * 17, 0);
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
        if (e.delta > 2) return; // Prevent selection when dragging the camera
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

  const xrayMaterial = useMemo(() => new MeshStandardMaterial({
    color: 0x111111,
    emissive: 0x00ffff,
    emissiveIntensity: 0.5,
    wireframe: true,
    transparent: true,
    opacity: 0.3
  }), []);

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.traverse((child: any) => {
        if (child.isMesh && child.material) {
          // Store original material reference
          if (!child.userData.originalMaterial) {
            child.userData.originalMaterial = child.material;
          }

          if (xrayMode) {
            if (Array.isArray(child.userData.originalMaterial)) {
              child.material = child.userData.originalMaterial.map(() => xrayMaterial);
            } else {
              child.material = xrayMaterial;
            }
          } else {
            child.material = child.userData.originalMaterial;
          }
        }
      });
    }
  }, [xrayMode, xrayMaterial]);

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
        <CableGeometry />
      </Bvh>
    </group>
  );
};

// Preload all textures to ensure the loading screen stays active until everything is ready
useTexture.preload(moboBackUrl);
useTexture.preload(caseBackUrl);
useTexture.preload(caseBehindUrl);
useTexture.preload(caseBottomUrl);
useTexture.preload(caseInteriorUrl);
useTexture.preload(cpuSocketUrl);
useTexture.preload(moboChipsetUrl);
useTexture.preload(psuTopUrl);
useTexture.preload(psuSideUrl);
useTexture.preload(psuBackUrl);
useTexture.preload(psuFrontUrl);
useTexture.preload(psuBottomUrl);
useTexture.preload(aioFanUrl);
useTexture.preload(heatsinkUrl);
useTexture.preload(heatsinkSideUrl);
useTexture.preload(gpuBackplateUrl);
useTexture.preload(gpuTopUrl);
useTexture.preload(gpuFrontUrl);
useTexture.preload(ramSideUrl);
useTexture.preload(hddTopUrl);
useTexture.preload(hddBottomUrl);
useTexture.preload(caseFanUrl);
useTexture.preload(ssdTopUrl);
useTexture.preload(ssdBottomUrl);
useTexture.preload(cpuTopUrl);
useTexture.preload(cpuBottomUrl);
useTexture.preload(moboTopUrl);
useTexture.preload(moboIoUrl);
useTexture.preload(gpuIoUrl);
useTexture.preload(cmosBatteryUrl);
useTexture.preload(m2HeatsinkUrl);

