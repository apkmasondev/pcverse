import { MathUtils, AmbientLight, DirectionalLight, SpotLight, HemisphereLight, RectAreaLight, PerspectiveCamera as ThreePerspectiveCamera, Vector2, Vector3, PointLight } from 'three';
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { CameraControls, Environment, PerspectiveCamera, Sparkles, PerformanceMonitor, Grid, Stars, Preload } from '@react-three/drei';
import { EffectComposer, Bloom, N8AO, Vignette, ChromaticAberration, DepthOfField, SMAA } from '@react-three/postprocessing';


import { PCModel } from '../PCModel/PCModel';
import { usePCSelection, usePCView, usePCLighting } from '../../hooks/usePC';
import { useBuildStore } from '../../store/useBuildStore';
import { useIsMobile } from '../../hooks/useIsMobile';
import { GlobalErrorBoundary as ErrorBoundary } from '../ErrorBoundary';
import { DeskScenery } from './DeskScenery';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const envMap: Record<string, string> = {
  studio: import.meta.env.BASE_URL + 'environments/studio_small_03_1k.hdr',
  city: import.meta.env.BASE_URL + 'environments/potsdamer_platz_1k.hdr',
  dawn: import.meta.env.BASE_URL + 'environments/kiara_1_dawn_1k.hdr',
  apartment: import.meta.env.BASE_URL + 'environments/lebombo_1k.hdr',
  night: import.meta.env.BASE_URL + 'environments/moonless_golf_1k.hdr',
  lobby: import.meta.env.BASE_URL + 'environments/st_fagans_interior_1k.hdr'
};

const CursorLight = () => {
  const lightRef = useRef<PointLight>(null);
  const _vec = useRef(new Vector3());
  const cursorLightOn = usePCLighting(state => state.cursorLightOn);

  useFrame(({ raycaster, camera, invalidate }, delta) => {
    if (lightRef.current) {
      const targetIntensity = cursorLightOn ? 3.5 : 0;
      
      // Jeżeli wyłączone i zgaszone, pomijamy obliczenia
      if (targetIntensity === 0 && lightRef.current.intensity === 0) return;

      const dt = Math.min(delta, 0.05);
      const distance = camera.position.length() * 0.6;
      raycaster.ray.at(distance, _vec.current);

      let needsInvalidate = false;
      const distPos = lightRef.current.position.distanceTo(_vec.current);
      if (distPos > 0.001) {
        lightRef.current.position.lerp(_vec.current, 1 - Math.exp(-10 * dt));
        needsInvalidate = true;
      } else if (distPos > 0) {
        lightRef.current.position.copy(_vec.current);
        needsInvalidate = true;
      }

      const diffInt = Math.abs(lightRef.current.intensity - targetIntensity);
      if (diffInt > 0.001) {
        lightRef.current.intensity = MathUtils.lerp(lightRef.current.intensity, targetIntensity, dt * 5);
        needsInvalidate = true;
      } else if (diffInt > 0) {
        lightRef.current.intensity = targetIntensity;
        needsInvalidate = true;
      }

      if (needsInvalidate) invalidate();
    }
  });

  return (
    <pointLight
      ref={lightRef}
      intensity={0}
      distance={8}
      color="#c084fc"
      decay={2}
    />
  );
};

const AnimatedLights = ({ isLowEndGPU, envPreset }: { isLowEndGPU: boolean, envPreset: string }) => {
  const { ambientOn, mainSpotOn, pcRGBOn } = usePCLighting();
  const isBrightEnv = ['studio', 'dawn', 'apartment'].includes(envPreset);

  const ambientRef = useRef<AmbientLight>(null);
  const dirRef1 = useRef<DirectionalLight>(null);
  const dirRef2 = useRef<DirectionalLight>(null);
  const spotRef = useRef<SpotLight>(null);
  const hemiRef = useRef<HemisphereLight>(null);
  const rectRef = useRef<RectAreaLight>(null);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05) * 5;

    const tAmbient = ambientOn ? (isBrightEnv ? 0.3 : 1.2) : 0;
    const tSpot = mainSpotOn ? (isBrightEnv ? 0.8 : 3.5) : 0;
    const tPcRgb = pcRGBOn ? (isBrightEnv ? 1.0 : 2.0) : 0;
    const tHemi = ambientOn ? (isBrightEnv ? 0.4 : 1.5) : 0;
    const tRect = ambientOn ? (isBrightEnv ? 0.0 : 3.0) : 0;

    if (ambientRef.current) ambientRef.current.intensity = MathUtils.lerp(ambientRef.current.intensity, tAmbient, dt);
    if (dirRef1.current) dirRef1.current.intensity = MathUtils.lerp(dirRef1.current.intensity, tSpot, dt);
    if (dirRef2.current) dirRef2.current.intensity = MathUtils.lerp(dirRef2.current.intensity, tPcRgb, dt);
    if (spotRef.current) spotRef.current.intensity = MathUtils.lerp(spotRef.current.intensity, tSpot, dt);

    if (isLowEndGPU) {
      if (hemiRef.current) hemiRef.current.intensity = MathUtils.lerp(hemiRef.current.intensity, tHemi, dt);
    } else {
      if (rectRef.current) rectRef.current.intensity = MathUtils.lerp(rectRef.current.intensity, tRect, dt);
    }
  });

  return (
    <>
      {isLowEndGPU ? (
        <hemisphereLight ref={hemiRef} color="#ffffff" groundColor="#a0aabf" intensity={0} />
      ) : (
        <>
          <ambientLight ref={ambientRef} intensity={0} />
          <rectAreaLight ref={rectRef} width={20} height={20} position={[0, 10, -5]} rotation={[-Math.PI / 2, 0, 0]} intensity={0} />
        </>
      )}
      <directionalLight ref={dirRef1} position={[10, 20, 10]} intensity={0} />
      <directionalLight ref={dirRef2} position={[-10, -10, -10]} color="#6366f1" intensity={0} />
      <spotLight ref={spotRef} position={[-10, 10, -10]} angle={0.3} penumbra={1} intensity={0} />
    </>
  );
};

const SceneContent = ({ isMobile, disableEffects }: { isMobile: boolean, disableEffects?: boolean }) => {
  const isLowEndGPU = usePCView(state => state.isLowEndGPU);
  const selectedComponent = usePCSelection(state => state.selectedComponent);
  const cameraResetTrigger = usePCSelection(state => state.cameraResetTrigger);
  const explodeStep = usePCSelection(state => state.explodeStep);
  const envPreset = usePCView(state => state.envPreset);
  const showDesk = usePCView(state => state.showDesk);
  const showParticles = usePCView(state => state.showParticles);
  const showFog = usePCView(state => state.showFog);
  const buildMode = useBuildStore(state => state.buildMode);
  const cameraControlsRef = useRef<CameraControls>(null);
  const { camera } = useThree();
  const reducedMotion = useReducedMotion();

  const hasInitialized = useRef(false);
  const _tempVec = useRef(new Vector3());
  const _tempDir = useRef(new Vector3());
  const _tempFocal = useRef(new Vector3());
  // Removed setViewOffset logic in favor of physical camera panning

  const dofRef = useRef<any>(null);
  const dofTarget = useMemo(() => new Vector3(), []);
  const dofEnabled = !!selectedComponent;

  // Naprawa błędu DepthOfField: upewniamy się, że cel ostrości to ZAWSZE aktualny środek kamery,
  // co gwarantuje pełną ostrość nawet podczas trwania animacji Panningu kamery.
  useFrame(() => {
    if (dofEnabled && dofRef.current && cameraControlsRef.current) {
      cameraControlsRef.current.getTarget(dofRef.current.target);
    }
  });

  const gridColors = useMemo(() => {
    switch (envPreset) {
      case 'city':
        return { cell: '#1e3a8a', section: '#3b82f6', sparkles: '#06b6d4' }; // Cyberpunk (Niebiesko/Neonowy), pyłki Cyan
      case 'night':
        return { cell: '#2e1065', section: '#6b21a8', sparkles: '#d8b4fe' }; // Noc (Mrok), ciemny fiolet
      case 'dawn':
        return { cell: '#7c2d12', section: '#ea580c', sparkles: '#fef08a' }; // Świt (Pomarańcz/Ciepły), pyłki Złote
      case 'apartment':
        return { cell: '#3f3f46', section: '#a1a1aa', sparkles: '#e5e7eb' }; // Mieszkanie (Ciepłe szarości), pyłki Białe
      case 'studio':
      default:
        return { cell: '#4b5563', section: '#6b7280', sparkles: '#9ca3af' }; // Studio (Neutralny), pyłki Szare
    }
  }, [envPreset]);

  // Dynamiczny kolor tła zależny od wybranego środowiska HDRi
  const bgColor = envPreset === 'studio' ? '#13141a' : envPreset === 'city' ? '#0f0a1c' : envPreset === 'apartment' ? '#8492a6' : envPreset === 'night' ? '#05020a' : '#1e1b18';

  useEffect(() => {
    if (selectedComponent) {
      const posArray = explodeStep === 2 ? selectedComponent.explodedPosition : selectedComponent.position;
      dofTarget.set(posArray[0], posArray[1], posArray[2]);
    } else {
      dofTarget.set(0, 0, 0);
    }
  }, [selectedComponent, explodeStep, dofTarget]);

  useEffect(() => {
    if (cameraControlsRef.current && !hasInitialized.current) {
      hasInitialized.current = true;
      cameraControlsRef.current.setLookAt(0, 13.36, 35, 0, 0.7, 0, false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          cameraControlsRef.current?.setLookAt(0, 2.5, 20, 0, 0.7, 0, true);
        });
      });
    }
  }, []);

  useEffect(() => {
    let updateOffset: (() => void) | null = null;

    if (cameraControlsRef.current && selectedComponent) {
      const posArray = explodeStep === 2 ? selectedComponent.explodedPosition : selectedComponent.position;
      const targetVec = _tempVec.current.set(posArray[0], posArray[1], posArray[2]);

      const dir = _tempDir.current.copy(camera.position).sub(targetVec);

      if (dir.lengthSq() < 0.001) {
        dir.set(0, 0.5, 1);
      }
      dir.normalize();

      const focalPoint = _tempFocal.current.copy(targetVec);

      const dist = isMobile ? 5.5 : 4;
      const targetPos = targetVec.clone().add(dir.multiplyScalar(dist));

      updateOffset = () => {
        if (camera instanceof ThreePerspectiveCamera) {
          const w = window.innerWidth;
          const h = window.innerHeight;
          if (isMobile) {
            camera.setViewOffset(w, h, 0, h * 0.15, w, h);
          } else {
            camera.setViewOffset(w, h, w * 0.15, 0, w, h);
          }
          camera.updateProjectionMatrix();
        }
      };

      updateOffset();
      window.addEventListener('resize', updateOffset);

      cameraControlsRef.current.setLookAt(
        targetPos.x, targetPos.y, targetPos.z,
        focalPoint.x, focalPoint.y, focalPoint.z,
        true
      );
    } else if (!selectedComponent) {
      if (camera instanceof ThreePerspectiveCamera && camera.view) {
        camera.clearViewOffset();
        camera.updateProjectionMatrix();
      }

      cameraControlsRef.current?.setLookAt(
        0, 2.5, 20,
        0, 0.7, 0,
        true
      );
    }

    return () => {
      if (updateOffset) {
        window.removeEventListener('resize', updateOffset);
      }
      if (camera instanceof ThreePerspectiveCamera && camera.view) {
        camera.clearViewOffset();
        camera.updateProjectionMatrix();
      }
    };
  }, [selectedComponent, explodeStep, camera, isMobile]);

  useEffect(() => {
    if (cameraControlsRef.current && cameraResetTrigger > 0) {
      if (camera instanceof ThreePerspectiveCamera && camera.view) {
        camera.clearViewOffset();
        camera.updateProjectionMatrix();
      }
      cameraControlsRef.current.reset(true);
      cameraControlsRef.current.setLookAt(
        0, 2.5, 20,
        0, 0.7, 0,
        true
      );
    }
  }, [cameraResetTrigger, camera]);

  useEffect(() => {
    if (!cameraControlsRef.current) return;

    if (buildMode) {
      if (camera instanceof ThreePerspectiveCamera && camera.view) {
        camera.clearViewOffset();
        camera.updateProjectionMatrix();
      }
      cameraControlsRef.current.reset(true);
      cameraControlsRef.current.setLookAt(
        0, 5.0, 25,
        0, 0.7, 0,
        true
      );
    } else if (hasInitialized.current) {
      // Płynny powrót po wyjściu z Trybu Budowy
      cameraControlsRef.current.setLookAt(
        0, 2.5, 20,
        0, 0.7, 0,
        true
      );
    }
  }, [buildMode, camera]);

  return (
    <>
      <color attach="background" args={[bgColor]} />
      {showFog && <fog attach="fog" args={[bgColor, 15, 60]} />}

      <PerspectiveCamera makeDefault position={[0, 3, 16]} fov={50} near={0.1} far={100} />

      {!isMobile && !disableEffects && showParticles && !reducedMotion && (
        <>
          <Sparkles count={500} scale={30} size={4} speed={0.5} opacity={0.5} color={gridColors.sparkles} />
          <Stars radius={50} depth={50} count={3000} factor={3} saturation={0.5} fade speed={1.5} />
        </>
      )}

      <AnimatedLights isLowEndGPU={isLowEndGPU} envPreset={envPreset} />

      {!isMobile && !disableEffects && <CursorLight />}

      <React.Suspense fallback={null}>

        <group position={[0, 1.36, 0]}>
          <PCModel />
        </group>
        <ErrorBoundary fallback={null}>
          <Environment
            files={envMap[envPreset] || envMap.studio}
            environmentIntensity={['studio', 'dawn', 'apartment', 'lobby'].includes(envPreset) ? 0.7 : 1.2}
          />
        </ErrorBoundary>

        {showDesk && !isMobile && !isLowEndGPU ? (
          <DeskScenery />
        ) : (
          <Grid
            position={[0, -4.1, 0]}
            args={[80, 80]}
            cellSize={1}
            cellThickness={1.2}
            cellColor={gridColors.cell}
            sectionSize={5}
            sectionThickness={2.0}
            sectionColor={gridColors.section}
            fadeDistance={40}
            fadeStrength={2}
          />
        )}
        {!isMobile && (() => {
          const effects: React.ReactElement[] = [];
          
          if (!isLowEndGPU) {
            effects.push(<SMAA key="smaa" />);
          }
          if (dofEnabled && !disableEffects) {
            effects.push(<DepthOfField ref={dofRef} key="dof" target={dofTarget} focalLength={3.0} bokehScale={5} />);
          }
          if (!disableEffects) {
            effects.push(<N8AO key="n8ao" aoRadius={0.5} intensity={2.0} distanceFalloff={0.5} quality="medium" halfRes />);
          }
          
          effects.push(<Bloom key="bloom" luminanceThreshold={1.2} mipmapBlur={!isLowEndGPU} intensity={1.5} />);
          effects.push(<Vignette key="vig" eskil={false} offset={0.1} darkness={0.9} />);
          effects.push(<ChromaticAberration key="ca" offset={new Vector2(0.0005, 0.0005)} radialModulation={false} modulationOffset={0} />);

          return (
            <EffectComposer multisampling={0} stencilBuffer={false}>
              {effects}
            </EffectComposer>
          );
        })()}
      </React.Suspense>

      <CameraControls
        ref={cameraControlsRef}
        makeDefault
        minDistance={6}
        maxDistance={40}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 2}
        dollySpeed={0.5}
        smoothTime={reducedMotion ? 0.05 : 0.4}
        draggingSmoothTime={reducedMotion ? 0.05 : 0.2}
        mouseButtons={{
          left: 1,
          middle: 8,
          right: 0,
          wheel: 16
        }}
      />
    </>
  );
};




export const Scene3D = () => {
  const isMobile = useIsMobile();
  const setSelectedComponent = usePCSelection(s => s.setSelectedComponent);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [dpr, setDpr] = useState<number | [number, number]>(isMobile ? 1 : [1, 2]);
  const [disableEffects, setDisableEffects] = useState(false);
  const setLowEndGPU = usePCView(state => state.setLowEndGPU);
  const isLowEndGPU = usePCView(state => state.isLowEndGPU);

  const [frameloop, setFrameloop] = useState<'always' | 'demand' | 'never'>(isMobile ? 'demand' : 'always');

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setFrameloop('never');
      } else {
        setFrameloop(isMobile ? 'demand' : 'always');
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isMobile]);

  return (
    <div
      className="w-full h-[60vh] md:h-screen bg-[#050505] relative"
      role="region"
      aria-label="Interaktywna scena 3D z komputerem PC"
      onPointerDown={() => setHasInteracted(true)}
      onTouchStart={() => setHasInteracted(true)}
      onContextMenu={(e) => e.preventDefault()}
    >
      {isMobile && !hasInteracted && (
        <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
          <div className="bg-black/50 backdrop-blur-sm px-6 py-3 rounded-full text-white/90 text-sm font-medium border border-white/10 shadow-xl animate-pulse flex items-center gap-2">
            <span>👆</span> Dotknij i przesuń, aby obrócić
          </div>
        </div>
      )}
      <Canvas
        gl={{ antialias: false, stencil: false }}
        dpr={isLowEndGPU ? 1 : dpr}
        frameloop={frameloop}
        onPointerMissed={() => setSelectedComponent(null)}
      >
        <PerformanceMonitor
          onDecline={() => {
            setDpr(1);
            setDisableEffects(true);
            setLowEndGPU(true);
          }}
          onIncline={() => {
            setDpr(isLowEndGPU || isMobile ? 1 : [1, 2]);
            if (!isLowEndGPU) setDisableEffects(false);
          }}
        >
          <SceneContent isMobile={isMobile} disableEffects={disableEffects || isLowEndGPU} />
        </PerformanceMonitor>
        <Preload all />
      </Canvas>
    </div>
  );
};
