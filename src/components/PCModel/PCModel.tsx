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
import { useRef, useState, useMemo, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Color, Vector3 } from 'three';
import { Html, useCursor, Bvh, useTexture } from '@react-three/drei';
import { xrayMaterial } from './materials';
import { pcComponents } from '../../data/components';
import type { PCComponent } from '../../data/components';
import { usePCSelection, usePCSettings } from '../../hooks/usePC';
import { useIsMobile } from '../../hooks/useIsMobile';
import { GlobalErrorBoundary as ErrorBoundary } from '../ErrorBoundary';
import { playHoverSound, playSelectSound } from '../../utils/audio';
import moboBackUrl from '../../assets/mobo_back_photo.webp';
import caseBackUrl from '../../assets/case_back.webp';
import caseBehindUrl from '../../assets/case_behind.webp';
import caseInteriorUrl from '../../assets/case_interior.webp';
import moboTopUrl from '../../assets/mobo_top.webp';
import gpuTopUrl from '../../assets/gpu_top.webp';
import gpuFrontUrl from '../../assets/gpu_front.webp';

// --- R3F Extrude Options (extracted to prevent memory leak/geometry recreation) ---

// --- Procedural Geometries (Premium 3D) ---












const ProceduralGeometry = ({ data, baseColor, rgbColor }: { data: PCComponent, baseColor: Color, rgbColor: string }) => {
  const { xrayMode } = usePCSettings();
  if (data.id.includes('cpu_cooler')) return <CPUCoolerGeometry rgbColor={rgbColor} />;
  if (data.id.includes('cpu')) return <CPUGeometry />;
  if (data.id.includes('gpu')) return <GPUGeometry rgbColor={rgbColor} />;
  if (data.id.includes('motherboard')) return <MotherboardGeometry rgbColor={rgbColor} />;
  if (data.id.includes('ram')) return <RAMGeometry rgbColor={rgbColor} />;
  if (data.id.includes('ssd')) return <SSDGeometry />;
  if (data.id.includes('storage_hdd')) return <HDDGeometry />;
  if (data.id.includes('psu')) return <PSUGeometry rgbColor={rgbColor} />;
  if (data.id.includes('fan')) {
    const isExhaust = data.id === 'rear_fan' || data.id === 'side_fan_2';
    return <FanGeometry rgbColor={rgbColor} isExhaust={isExhaust} />;
  }
  if (data.id.includes('case')) return <CaseGeometry rgbColor={rgbColor} rgbEnabled={true} />;
  
  return (
    <mesh material={xrayMode ? xrayMaterial : undefined}>
      <boxGeometry args={data.geometryArgs} />
      {!xrayMode && <meshStandardMaterial color={baseColor} roughness={0.7} metalness={0.3} />}
    </mesh>
  );
};

// --- Main Component Mesh ---

const ComponentMesh = ({ data, isMobile }: { data: PCComponent, isMobile: boolean }) => {
  const groupRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const { selectedComponent, setSelectedComponent, explodeStep } = usePCSelection();
  const { xrayMode, rgbColor, rgbEnabled, showLabels, showInstructions } = usePCSettings();
  const effectiveRgbColor = rgbEnabled ? rgbColor : '#000000';
  
  useCursor(hovered && !isMobile);
  
  const isSelected = selectedComponent?.id === data.id;
  const targetPosition = useMemo(() => new Vector3(), []);
  const targetScale3 = useMemo(() => new Vector3(), []);
  const baseColor = useMemo(() => new Color(data.color || '#333333'), [data.color]);
  
 

  const maxDim = data.geometryArgs ? Math.max(...data.geometryArgs) : 1;
  const baseLift = Math.max(0.02, Math.min(0.15, 0.1 / maxDim));
  const liftOffset = hovered && !isSelected ? baseLift : 0;
  
  useFrame((_state, delta) => {
    if (!groupRef.current) return;



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
      <ErrorBoundary fallback={<mesh material={xrayMode ? xrayMaterial : undefined}><boxGeometry args={data.geometryArgs} />{!xrayMode && <meshStandardMaterial color={baseColor} />}</mesh>}>
        <Suspense fallback={<mesh material={xrayMode ? xrayMaterial : undefined}><boxGeometry args={data.geometryArgs} />{!xrayMode && <meshStandardMaterial color={baseColor} />}</mesh>}>
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
              className={`px-4 py-2 rounded-xl rounded-br-sm backdrop-blur-xl border shadow-2xl transition-all duration-300 ${hovered ? 'scale-105' : 'bg-gradient-to-br from-black/80 to-slate-900/40 border-white/20'}`}
              style={hovered ? { 
                backgroundColor: `${rgbColor}33`, 
                borderColor: `${rgbColor}80`, 
                boxShadow: `0 0 15px ${rgbColor}80` 
              } : undefined}
            >
              <span className="font-bold tracking-wider text-sm whitespace-nowrap drop-shadow-md">
                {data.name.includes(' - ') ? (
                  <>
                    <span className="text-white">{data.name.split(' - ')[0]}</span>
                    <span className="text-white/40 mx-1.5">-</span>
                    <span className="text-white/70">{data.name.split(' - ').slice(1).join(' - ')}</span>
                  </>
                ) : (
                  <span className="text-white">{data.name}</span>
                )}
              </span>
            </div>
            <div className="relative flex flex-col items-center">
              <div 
                className={`w-px h-8 transition-all duration-300 ${!hovered ? 'bg-gradient-to-b from-white/40 to-white/5' : ''}`}
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
          </div>
        </Html>
      )}
    </group>
  );
};


export const PCModel = () => {
  const isMobile = useIsMobile();
  const groupRef = useRef<Group>(null);

  return (
    <group position={[0, isMobile ? -0.5 : -1, 0]} scale={isMobile ? 0.7 : 1} ref={groupRef}>
      <Bvh firstHitOnly>
        {pcComponents.map((comp) => {
          return <ComponentMesh key={comp.id} data={comp} isMobile={isMobile} />;
        })}
        <CableGeometry />
      </Bvh>
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

