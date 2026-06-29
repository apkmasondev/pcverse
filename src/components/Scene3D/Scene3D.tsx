import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { CameraControls, Environment, PerspectiveCamera, Sparkles, PerformanceMonitor, Grid, Stars, Preload } from '@react-three/drei';
import { EffectComposer, Bloom, N8AO, Vignette, ChromaticAberration, DepthOfField } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Vector2, Vector3, PointLight } from 'three';
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
  apartment: import.meta.env.BASE_URL + 'environments/lebombo_1k.hdr'
};

const CursorLight = () => {
  const lightRef = useRef<PointLight>(null);
  const _vec = useRef(new Vector3());

  useFrame(({ raycaster, camera }, delta) => {
    if (lightRef.current) {
      // Place light slightly in front of the object the user is pointing at
      const distance = camera.position.length() * 0.6;
      raycaster.ray.at(distance, _vec.current);
      lightRef.current.position.lerp(_vec.current, 1 - Math.exp(-10 * delta)); // Make lerp frame-rate independent roughly
    }
  });

  return (
    <pointLight
      ref={lightRef}
      intensity={3.5}
      distance={8}
      color="#c084fc"
      decay={2}
    />
  );
};

const SceneContent = ({ isMobile, disableEffects }: { isMobile: boolean, disableEffects?: boolean }) => {
  const { selectedComponent, cameraResetTrigger, explodeStep } = usePCSelection();
  const { envPreset, showDesk, showParticles, showFog } = usePCView();
  const { ambientOn, mainSpotOn, pcRGBOn, cursorLightOn } = usePCLighting();
  const { buildMode } = useBuildStore();
  const cameraControlsRef = useRef<CameraControls>(null);
  const { camera } = useThree();
  const reducedMotion = useReducedMotion();

  const hasInitialized = useRef(false);
  const _tempVec = useRef(new Vector3());
  const _tempDir = useRef(new Vector3());
  const _tempFocal = useRef(new Vector3());

  const dofTarget = useMemo(() => new Vector3(), []);
  const dofEnabled = !!selectedComponent;

  const gridColors = useMemo(() => {
    switch (envPreset) {
      case 'city':
        return { cell: '#1e3a8a', section: '#3b82f6', sparkles: '#06b6d4' }; // Cyberpunk (Niebiesko/Neonowy), pyłki Cyan
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
  const bgColor = envPreset === 'studio' ? '#13141a' : envPreset === 'city' ? '#0f0a1c' : envPreset === 'apartment' ? '#8492a6' : '#1e1b18';

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
    if (cameraControlsRef.current && selectedComponent) {
      const posArray = explodeStep === 2 ? selectedComponent.explodedPosition : selectedComponent.position;
      const targetVec = _tempVec.current.set(posArray[0], posArray[1], posArray[2]);

      // Calculate vector from component to current camera
      const dir = _tempDir.current.copy(camera.position).sub(targetVec);

      if (dir.lengthSq() < 0.001) {
        dir.set(0, 0.5, 1);
      }
      dir.normalize();

      // Keep focal point exactly on the component so it rotates perfectly around its own center
      const focalPoint = _tempFocal.current.copy(targetVec);

      // Set distance: 4 on desktop, 5.5 on mobile to fit the narrow screen better
      const dist = isMobile ? 5.5 : 4;
      const targetPos = targetVec.clone().add(dir.multiplyScalar(dist));

      cameraControlsRef.current.setLookAt(
        targetPos.x, targetPos.y, targetPos.z,
        focalPoint.x, focalPoint.y, focalPoint.z,
        true
      );

      // Epic UI/UX: Shift the entire camera frustum so the component avoids UI panels
      if (camera instanceof THREE.PerspectiveCamera) {
        if (isMobile) {
          // On mobile, UI is at the bottom, so shift the component UP by 25%
          camera.setViewOffset(window.innerWidth, window.innerHeight, 0, window.innerHeight * 0.25, window.innerWidth, window.innerHeight);
        } else {
          // On desktop, UI is on the right, so shift the component LEFT by 25%
          camera.setViewOffset(window.innerWidth, window.innerHeight, window.innerWidth * 0.25, 0, window.innerWidth, window.innerHeight);
        }
        camera.updateProjectionMatrix();
      }
    } else if (!selectedComponent) {
      // Reset view offset when panel closes
      if (camera instanceof THREE.PerspectiveCamera && camera.view) {
        camera.clearViewOffset();
        camera.updateProjectionMatrix();
      }
      // Płynny powrót kamery na środek
      cameraControlsRef.current?.setLookAt(
        0, 2.5, 20,
        0, 0.7, 0,
        true
      );
    }

    return () => {
      // Cleanup: reset view offset when unmounting
      if (camera instanceof THREE.PerspectiveCamera && camera.view) {
        camera.clearViewOffset();
        camera.updateProjectionMatrix();
      }
    };
  }, [selectedComponent, explodeStep, camera, isMobile]);

  useEffect(() => {
    if (cameraControlsRef.current && cameraResetTrigger > 0) {
      if (camera instanceof THREE.PerspectiveCamera && camera.view) {
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
    if (buildMode && cameraControlsRef.current) {
      if (camera instanceof THREE.PerspectiveCamera && camera.view) {
        camera.clearViewOffset();
        camera.updateProjectionMatrix();
      }
      cameraControlsRef.current.reset(true);
      cameraControlsRef.current.setLookAt(
        0, 5.0, 25,
        0, 0.7, 0,
        true
      );
    }
  }, [buildMode, camera]);

  return (
    <>
      <color attach="background" args={[bgColor]} />
      {showFog && <fog attach="fog" args={[bgColor, 15, 60]} />}

      {ambientOn && <ambientLight intensity={1.2} />}

      <PerspectiveCamera makeDefault position={[0, 3, 16]} fov={50} near={0.5} far={100} />

      {!isMobile && !disableEffects && showParticles && !reducedMotion && (
        <>
          <Sparkles count={500} scale={30} size={4} speed={0.5} opacity={0.5} color={gridColors.sparkles} />
          <Stars radius={50} depth={50} count={3000} factor={3} saturation={0.5} fade speed={1.5} />
        </>
      )}

      {mainSpotOn && (
        <directionalLight
          position={[10, 20, 10]}
          intensity={3.5}
        />
      )}
      {pcRGBOn && <directionalLight position={[-10, -10, -10]} intensity={2.0} color="#6366f1" />}
      {mainSpotOn && <spotLight position={[-10, 10, -10]} intensity={3.5} angle={0.3} penumbra={1} />}
      {ambientOn && <hemisphereLight intensity={1.5} color="#ffffff" groundColor="#a0aabf" />}
      {pcRGBOn && <pointLight position={[0, 0, 6]} intensity={15.0} color="#ffffff" distance={30} decay={2} />}

      {!isMobile && !disableEffects && cursorLightOn && <CursorLight />}

      <React.Suspense fallback={null}>
        <group position={[0, 1.36, 0]}>
          <PCModel />
        </group>
        <ErrorBoundary fallback={null}>
          <Environment files={envMap[envPreset] || envMap.studio} environmentIntensity={1.5} />
        </ErrorBoundary>

        {showDesk && !isMobile ? (
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
        {!isMobile && (
          <EffectComposer multisampling={4}>
            {dofEnabled && !disableEffects ? <DepthOfField key="dof" target={dofTarget} focalLength={0.05} bokehScale={8} height={700} /> : <></>}
            {!disableEffects ? <N8AO key="n8ao" aoRadius={0.5} intensity={2.0} distanceFalloff={0.5} quality="medium" halfRes /> : <></>}
            <Bloom key="bloom" luminanceThreshold={0.5} mipmapBlur intensity={1.5} />
            <Vignette key="vig" eskil={false} offset={0.1} darkness={0.9} />
            <ChromaticAberration key="ca" offset={new Vector2(0.0005, 0.0005)} radialModulation={false} modulationOffset={0} />
          </EffectComposer>
        )}
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
  const { setSelectedComponent } = usePCSelection();
  const [hasInteracted, setHasInteracted] = useState(false);
  const [dpr, setDpr] = useState<number | [number, number]>(isMobile ? 1 : [1, 2]);
  const [disableEffects, setDisableEffects] = useState(false);

  return (
    <div
      className="w-full h-[60vh] md:h-screen bg-[#050505] relative"
      aria-hidden="true"
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
        gl={{ antialias: true }}
        dpr={dpr}
        frameloop={isMobile ? 'demand' : 'always'}
        onPointerMissed={() => setSelectedComponent(null)}
      >
        <PerformanceMonitor
          onDecline={() => {
            setDpr(1);
            setDisableEffects(true);
          }}
          onIncline={() => {
            setDpr(isMobile ? 1 : [1, 2]);
            setDisableEffects(false);
          }}
        >
          <SceneContent isMobile={isMobile} disableEffects={disableEffects} />
        </PerformanceMonitor>
        <Preload all />
      </Canvas>
    </div>
  );
};
