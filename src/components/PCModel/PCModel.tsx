import { fanBladesRefsZ, fanBladesRefsY } from './FanManager';
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
import { useRef, useState, useMemo, Suspense, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh, Color, Vector3 } from 'three';
import { Html, useCursor, useTexture } from '@react-three/drei';
import { motion, useReducedMotion } from 'framer-motion';
import { xrayMaterial } from './materials';
import { pcComponents } from '../../data/components';
import type { PCComponent } from '../../data/components';
import { usePCSelection, usePCRGB, usePCView, usePCUI } from '../../hooks/usePC';
import { useIsMobile } from '../../hooks/useIsMobile';
import { GlobalErrorBoundary as ErrorBoundary } from '../ErrorBoundary';
import { playHoverSound, playSelectSound } from '../../utils/audio';
import { useBuildStore } from '../../store/useBuildStore';
import { ghostMaterial } from './materials';
import moboBackUrl from '../../assets/mobo_back_photo.webp';
import caseBackUrl from '../../assets/case_back.webp';
import caseBehindUrl from '../../assets/case_behind.webp';
import caseInteriorUrl from '../../assets/case_interior.webp';
import moboTopUrl from '../../assets/mobo_top.webp';
import gpuTopUrl from '../../assets/gpu_top.webp';
import gpuFrontUrl from '../../assets/gpu_front.webp';
import aioFanUrl from '../../assets/aio_fan_rgb.webp';
import caseFanUrl from '../../assets/case_fan_rgb.webp';

export interface GeometryProps {
  rgbColor: string;
  [key: string]: any;
}

const GEOMETRY_REGISTRY: Record<string, React.FC<GeometryProps>> = {
  cpu_cooler: CPUCoolerGeometry,
  cpu: CPUGeometry,
  gpu: GPUGeometry,
  motherboard: MotherboardGeometry,
  ram_1: RAMGeometry,
  ram_2: RAMGeometry,
  ssd: SSDGeometry,
  storage_hdd: HDDGeometry,
  psu: PSUGeometry,
  case_fan_1: FanGeometry,
  case_fan_2: FanGeometry,
  rear_fan_1: FanGeometry,
  rear_fan_2: FanGeometry,
  case: CaseGeometry,
};

const ProceduralGeometry = ({ data, baseColor, rgbColor }: { data: PCComponent, baseColor: Color, rgbColor: string }) => {
  const { xrayMode } = usePCView();
  
  const Component = GEOMETRY_REGISTRY[data.id];

  if (Component) {
    // Special handling for fans
    if (['case_fan_1', 'case_fan_2', 'rear_fan_1', 'rear_fan_2'].includes(data.id)) {
      const isExhaust = data.id === 'rear_fan_1' || data.id === 'rear_fan_2';
      return <Component rgbColor={rgbColor} isExhaust={isExhaust} />;
    }
    
    // Special handling for case
    if (data.id === 'case') {
      return <Component rgbColor={rgbColor} rgbEnabled={true} />;
    }

    return <Component rgbColor={rgbColor} />;
  }
  
  return (
    <mesh material={xrayMode ? xrayMaterial : undefined}>
      <boxGeometry args={data.geometryArgs} />
      {!xrayMode && <meshStandardMaterial color={baseColor} roughness={0.7} metalness={0.3} />}
    </mesh>
  );
};

// --- Main Component Mesh ---

const ComponentMesh = memo(({ data, isMobile }: { data: PCComponent, isMobile: boolean }) => {
  const groupRef = useRef<Group>(null);
  const ringRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const { selectedComponent, setSelectedComponent, explodeStep } = usePCSelection();
  const { rgbColor, rgbEnabled } = usePCRGB();
  const { xrayMode } = usePCView();
  const { showLabels, showInstructions } = usePCUI();
  const { buildMode, currentStep, advanceStep } = useBuildStore();
  const effectiveRgbColor = rgbEnabled ? rgbColor : '#000000';
  const shouldReduceMotion = useReducedMotion();
  
  const isUnbuilt = buildMode && data.buildOrder !== undefined && data.buildOrder >= currentStep;
  const isCurrentStep = buildMode && data.buildOrder === currentStep;
  
  useCursor((hovered && !isMobile) || isCurrentStep);
  
  const isSelected = selectedComponent?.id === data.id;
  const targetPosition = useMemo(() => new Vector3(), []);
  const targetScale3 = useMemo(() => new Vector3(), []);
  const baseColor = useMemo(() => new Color(data.color || '#333333'), [data.color]);
  
  const maxDim = data.geometryArgs ? Math.max(...data.geometryArgs) : 1;
  const baseLift = Math.max(0.02, Math.min(0.15, 0.1 / maxDim));
  const liftOffset = hovered && !isSelected ? baseLift : 0;
  
  useFrame((_state, delta) => {
    if (!groupRef.current) return;


    const isExploded = buildMode ? isUnbuilt : (explodeStep === 2);
    const posArray = isExploded ? data.explodedPosition : data.position;
    
    // Add a gentle, premium out-of-phase floating effect in the exploded view
    // AND a base lift to prevent clipping through the desk at the lowest point of the sine wave
    let floatOffset = 0;
    let explodeLift = 0;
    if (isExploded) {
      explodeLift = 0.15; // Minimalne podniesienie, by dolne nóżki nie wcinały się w skrzynkę
      if (!shouldReduceMotion) {
        const phase = data.id.split('').reduce((acc, char) => acc + char.charCodeAt(0) * 17, 0);
        floatOffset = Math.sin(_state.clock.getElapsedTime() * 1.2 + phase) * 0.08;
      }
    }

    targetPosition.set(posArray[0], posArray[1] + liftOffset + floatOffset + explodeLift, posArray[2]);
    groupRef.current.position.lerp(targetPosition, delta * 5);
    
    const targetScale = isSelected ? 1.05 : hovered ? 1.03 : 1.0;
    targetScale3.set(targetScale, targetScale, targetScale);
    groupRef.current.scale.lerp(targetScale3, delta * 8);

    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.5;
    }
  });

  const visual = useMemo(() => <ProceduralGeometry data={data} baseColor={baseColor} rgbColor={effectiveRgbColor} />, [data, baseColor, effectiveRgbColor]);

  const rotationArr = (data.id === 'rear_fan_1' || data.id === 'rear_fan_2') ? [0, Math.PI / 2, 0] : 
        data.id === 'psu' ? [0, Math.PI / 2, 0] : 
        [0, 0, 0];

  return (
    <group>
      <group
        ref={groupRef}
        position={data.position}
        rotation={rotationArr as any}
        onClick={(e) => {
          e.stopPropagation();
          if (e.delta > 2) return; // Prevent selection when dragging the camera
          
          if (buildMode) {
            if (isCurrentStep) {
              playSelectSound();
              advanceStep();
            }
            return;
          }

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
        {isCurrentStep && (
          <mesh ref={ringRef as any} material={ghostMaterial} position={[0, -data.geometryArgs[1]/2 - 0.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[Math.max(data.geometryArgs[0], data.geometryArgs[2]) * 0.4, Math.max(data.geometryArgs[0], data.geometryArgs[2]) * 0.6, 32]} />
          </mesh>
        )}
      <ErrorBoundary fallback={<mesh material={xrayMode ? xrayMaterial : undefined}><boxGeometry args={data.geometryArgs} />{!xrayMode && <meshStandardMaterial color={baseColor} />}</mesh>}>
        <Suspense fallback={<mesh material={xrayMode ? xrayMaterial : undefined}><boxGeometry args={data.geometryArgs} />{!xrayMode && <meshStandardMaterial color={baseColor} />}</mesh>}>
          {visual}
          {data.id !== 'case' && (
            <mesh>
              <boxGeometry args={[data.geometryArgs[0] * 1.2, data.geometryArgs[1] * 1.2, data.geometryArgs[2] * 1.2]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
            </mesh>
          )}
        </Suspense>
      </ErrorBoundary>
      
      {showLabels && !showInstructions && !selectedComponent && (
        buildMode 
          ? (isUnbuilt || isCurrentStep)
          : (!isMobile && (hovered || isSelected) || explodeStep === 2)
      ) && (
        <Html 
          position={[0, data.geometryArgs[1] / 2, 0]}
          center
          distanceFactor={12}
          zIndexRange={[100, 0]}
          wrapperClass="pointer-events-none"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: "calc(-50% + 10px)" }}
            animate={{ opacity: 1, scale: 1, y: "-50%" }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="flex flex-col items-center pointer-events-none opacity-100"
            style={{ willChange: "transform, opacity" }}
          >
            <div 
              className={`pointer-events-auto cursor-pointer whitespace-nowrap min-w-max px-4 py-2 rounded-xl rounded-br-sm border shadow-xl transition-all duration-300 ${hovered ? 'scale-105' : 'bg-black/60 border-white/20'}`}
              style={hovered ? { 
                backgroundColor: `${rgbColor}40`,
                borderColor: `${rgbColor}`, 
                boxShadow: `0 0 15px ${rgbColor}60`
              } : undefined}
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
                if (buildMode) {
                  if (isCurrentStep) {
                    playSelectSound();
                    advanceStep();
                  }
                  return;
                }
                playSelectSound();
                setSelectedComponent(data);
              }}
            >
              <div className="flex flex-col items-center text-center">
              <span className="text-[10px] font-bold text-white/50 tracking-wider uppercase mb-0.5" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                {isUnbuilt ? 'Oczekujący komponent' : data.name.split(' - ')[0]}
              </span>
              <span className="text-sm font-black text-white leading-tight tracking-wide drop-shadow-md">
                {isUnbuilt ? data.name.split(' - ')[0] : data.name.split(' - ')[1] || data.name}
              </span>
            </div>
            </div>
            <div className="relative flex flex-col items-center pointer-events-none">
              <div 
                className={`w-px h-16 transition-all duration-300 ${!hovered ? 'bg-gradient-to-b from-white/40 to-white/5' : ''}`}
                style={hovered ? {
                  backgroundColor: rgbColor,
                  boxShadow: `0 0 10px ${rgbColor}`
                } : undefined}
              />
              <div 
                className={`absolute -bottom-1 w-2 h-2 rounded-full border transition-all duration-300 ${!hovered ? 'border-white/40 bg-black/80' : ''}`}
                style={hovered ? {
                  borderColor: rgbColor,
                  backgroundColor: `${rgbColor}40`,
                  boxShadow: `0 0 8px ${rgbColor}`
                } : undefined}
              />
            </div>
          </motion.div>
        </Html>
      )}
    </group>
    </group>
  );
}, (prevProps, nextProps) => prevProps.data === nextProps.data && prevProps.isMobile === nextProps.isMobile);


export const PCModel = () => {
  const isMobile = useIsMobile();
  const groupRef = useRef<Group>(null);
  const { buildMode, currentStep, maxSteps } = useBuildStore();

  useFrame((_, delta) => {
    fanBladesRefsZ.forEach(ref => {
      ref.rotation.z += delta * 15;
    });
    fanBladesRefsY.forEach(ref => {
      ref.rotation.y += delta * 15;
    });
  });

  return (
    <group position={[0, isMobile ? -0.5 : -1, 0]} scale={isMobile ? 0.7 : 1} ref={groupRef}>
      {pcComponents.map((comp) => {
        return <ComponentMesh key={comp.id} data={comp} isMobile={isMobile} />;
      })}
      {(!buildMode || currentStep > maxSteps) && <CableGeometry />}
    </group>
  );
};

// Preload critical textures to ensure the loading screen stays active until main model is ready
useTexture.preload(moboBackUrl);
useTexture.preload(caseBackUrl);
useTexture.preload(caseBehindUrl);
useTexture.preload(caseInteriorUrl);
useTexture.preload(moboTopUrl);
useTexture.preload(gpuTopUrl);
useTexture.preload(gpuFrontUrl);
useTexture.preload(aioFanUrl);
useTexture.preload(caseFanUrl);
