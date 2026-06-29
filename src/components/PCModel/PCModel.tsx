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
  isExhaust?: boolean;
  rgbEnabled?: boolean;
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

const ProceduralGeometry = memo(({ data, baseColor }: { data: PCComponent, baseColor: Color }) => {
  const xrayMode = usePCView(state => state.xrayMode);
  const rgbColor = usePCRGB(state => state.rgbColor);
  const rgbEnabled = usePCRGB(state => state.rgbEnabled);
  const effectiveRgbColor = rgbEnabled ? rgbColor : '#000000';
  
  const Component = GEOMETRY_REGISTRY[data.id];

  if (Component) {
    if (['case_fan_1', 'case_fan_2', 'rear_fan_1', 'rear_fan_2'].includes(data.id)) {
      const isExhaust = data.id === 'rear_fan_1' || data.id === 'rear_fan_2';
      return <Component rgbColor={effectiveRgbColor} rgbEnabled={rgbEnabled} isExhaust={isExhaust} />;
    }
    
    if (data.id === 'case') {
      return <Component rgbColor={effectiveRgbColor} rgbEnabled={rgbEnabled} />;
    }

    return <Component rgbColor={effectiveRgbColor} rgbEnabled={rgbEnabled} />;
  }
  
  return (
    <mesh material={xrayMode ? xrayMaterial : undefined}>
      <boxGeometry args={data.geometryArgs} />
      {!xrayMode && <meshStandardMaterial color={baseColor} roughness={0.7} metalness={0.3} />}
    </mesh>
  );
});

interface ComponentLabelProps {
  data: PCComponent;
  hovered: boolean;
  isUnbuilt: boolean;
  isCurrentStep: boolean;
  isMobile: boolean;
  setHovered: (h: boolean) => void;
}

// --- Extract Component Label to prevent RGB-based re-renders in ComponentMesh ---
const ComponentLabel = memo(({ data, hovered, isUnbuilt, isCurrentStep, isMobile, setHovered }: ComponentLabelProps) => {
  const rgbColor = usePCRGB(state => state.rgbColor);
  const rgbEnabled = usePCRGB(state => state.rgbEnabled);
  const effectiveRgbColor = rgbEnabled ? rgbColor : '#000000';
  
  const setSelectedComponent = usePCSelection(state => state.setSelectedComponent);
  const buildMode = useBuildStore(state => state.buildMode);
  const advanceStep = useBuildStore(state => state.advanceStep);

  const shouldHighlight = hovered || (buildMode && isCurrentStep);
  return (
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
          className={`pointer-events-auto cursor-pointer whitespace-nowrap min-w-max px-4 py-2 rounded-xl rounded-br-sm border shadow-xl transition-all duration-300 ${shouldHighlight ? 'scale-105' : 'bg-black/60 border-white/20'}`}
          style={shouldHighlight ? { 
            backgroundColor: `${effectiveRgbColor}40`,
            borderColor: `${effectiveRgbColor}`, 
            boxShadow: `0 0 15px ${effectiveRgbColor}60`
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
            {(isUnbuilt && isCurrentStep) ? 'Oczekujący komponent' : data.name.split(' - ')[0]}
          </span>
          <span className="text-sm font-black text-white leading-tight tracking-wide drop-shadow-md">
            {(isUnbuilt && isCurrentStep) ? data.name.split(' - ')[0] : data.name.split(' - ')[1] || data.name}
          </span>
        </div>
        </div>
        <div className="relative flex flex-col items-center pointer-events-none">
          <div 
            className={`w-px h-16 transition-all duration-300 ${!shouldHighlight ? 'bg-gradient-to-b from-white/40 to-white/5' : ''}`}
            style={shouldHighlight ? {
              backgroundColor: effectiveRgbColor,
              boxShadow: `0 0 10px ${effectiveRgbColor}`
            } : undefined}
          />
          <div 
            className={`absolute -bottom-1 w-2 h-2 rounded-full border transition-all duration-300 ${!shouldHighlight ? 'border-white/40 bg-black/80' : ''}`}
            style={shouldHighlight ? {
              borderColor: effectiveRgbColor,
              backgroundColor: `${effectiveRgbColor}40`,
              boxShadow: `0 0 8px ${effectiveRgbColor}`
            } : undefined}
          />
        </div>
      </motion.div>
    </Html>
  );
});

// --- Main Component Mesh ---

const ComponentMesh = memo(({ data, isMobile }: { data: PCComponent, isMobile: boolean }) => {
  const groupRef = useRef<Group>(null);
  const ringRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  // ZUSTAND SELECTORS
  const isSelected = usePCSelection(state => state.selectedComponent?.id === data.id);
  const setSelectedComponent = usePCSelection(state => state.setSelectedComponent);
  const explodeStep = usePCSelection(state => state.explodeStep);
  
  const xrayMode = usePCView(state => state.xrayMode);
  const showLabels = usePCUI(state => state.showLabels);
  const showInstructions = usePCUI(state => state.showInstructions);
  
  const buildMode = useBuildStore(state => state.buildMode);
  const currentStep = useBuildStore(state => state.currentStep);
  const advanceStep = useBuildStore(state => state.advanceStep);
  
  const shouldReduceMotion = useReducedMotion();
  
  const isUnbuilt = buildMode && data.buildOrder !== undefined && data.buildOrder >= currentStep;
  const isCurrentStep = buildMode && data.buildOrder === currentStep;
  
  useCursor((hovered && !isMobile) || isCurrentStep);
  
  const targetPosition = useMemo(() => new Vector3(), []);
  const targetScale3 = useMemo(() => new Vector3(), []);
  const baseColor = useMemo(() => new Color(data.color || '#333333'), [data.color]);
  
  const maxDim = data.geometryArgs ? Math.max(...data.geometryArgs) : 1;
  const baseLift = Math.max(0.02, Math.min(0.15, 0.1 / maxDim));
  const liftOffset = hovered && !isSelected ? baseLift : 0;
  
  useFrame((_state, delta) => {
    if (!groupRef.current) return;
    const dt = Math.min(delta, 0.05);

    const isExploded = buildMode ? isUnbuilt : (explodeStep === 2);
    const posArray = isExploded ? data.explodedPosition : data.position;
    
    let floatOffset = 0;
    let explodeLift = 0;
    if (isExploded) {
      explodeLift = 0.15;
      if (!shouldReduceMotion) {
        const phase = data.id.split('').reduce((acc, char) => acc + char.charCodeAt(0) * 17, 0);
        floatOffset = Math.sin(_state.clock.getElapsedTime() * 1.2 + phase) * 0.08;
      }
    }

    targetPosition.set(posArray[0], posArray[1] + liftOffset + floatOffset + explodeLift, posArray[2]);
    const distPos = groupRef.current.position.distanceTo(targetPosition);
    if (distPos > 0.001) {
      groupRef.current.position.lerp(targetPosition, dt * 5);
    } else if (distPos > 0) {
      groupRef.current.position.copy(targetPosition);
    }
    
    const targetScale = isSelected ? 1.05 : hovered ? 1.03 : 1.0;
    targetScale3.set(targetScale, targetScale, targetScale);
    const distScale = groupRef.current.scale.distanceTo(targetScale3);
    if (distScale > 0.001) {
      groupRef.current.scale.lerp(targetScale3, dt * 8);
    } else if (distScale > 0) {
      groupRef.current.scale.copy(targetScale3);
    }

    const ringOffsetY = data.id === 'gpu' ? 0.9 : 0.4;
    if (ringRef.current) {
      ringRef.current.rotation.z += dt * 0.5;
      ringRef.current.position.y = -data.geometryArgs[1] / 2 - ringOffsetY + Math.sin(_state.clock.elapsedTime * 3) * 0.05;
    }
  });

  const visual = useMemo(() => <ProceduralGeometry data={data} baseColor={baseColor} />, [data, baseColor]);

  const rotationArr: [number, number, number] = (data.id === 'rear_fan_1' || data.id === 'rear_fan_2') ? [0, Math.PI / 2, 0] : 
        data.id === 'psu' ? [0, Math.PI / 2, 0] : 
        [0, 0, 0];

  return (
    <group>
      <group
        ref={groupRef}
        position={data.position}
        rotation={rotationArr}
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

          if (!isSelected) {
            playSelectSound();
          }
          setSelectedComponent(data);
        }}
        onPointerOver={(e) => {
          if (isMobile) return;
          e.stopPropagation();

          if (!hovered && !isSelected) {
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
          <mesh ref={ringRef} material={ghostMaterial} position={[0, -data.geometryArgs[1]/2 - (data.id === 'gpu' ? 0.9 : 0.4), 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[Math.max(data.geometryArgs[0], data.geometryArgs[2]) * 0.5, Math.max(data.geometryArgs[0], data.geometryArgs[2]) * 0.05, 16, 64]} />
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
      
      {showLabels && !showInstructions && !isSelected && (
        buildMode 
          ? (isUnbuilt || isCurrentStep)
          : (!isMobile && (hovered || isSelected) || explodeStep === 2)
      ) && (
        <ComponentLabel 
          data={data}
          hovered={hovered}
          isUnbuilt={isUnbuilt}
          isCurrentStep={isCurrentStep}
          isMobile={isMobile}
          setHovered={setHovered}
        />
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
