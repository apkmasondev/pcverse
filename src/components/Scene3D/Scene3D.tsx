import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { CameraControls, Environment, PerspectiveCamera, Sparkles, PerformanceMonitor, Grid } from '@react-three/drei';
import { EffectComposer, Bloom, N8AO, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import { Vector2, Vector3, PointLight } from 'three';
import { BlendFunction } from 'postprocessing';

const CHROMA_OFFSET = new Vector2(0.0005, 0.0005);
import { PCModel } from '../PCModel/PCModel';
import { usePC } from '../../hooks/usePC';
import { GlobalErrorBoundary as ErrorBoundary } from '../ErrorBoundary';

const CursorLight = () => {
  const lightRef = useRef<PointLight>(null);
  const _vec = useRef(new Vector3());

  useFrame(({ raycaster, camera }) => {
    if (lightRef.current) {
      // Place light slightly in front of the object the user is pointing at
      const distance = camera.position.length() * 0.6; 
      raycaster.ray.at(distance, _vec.current);
      lightRef.current.position.lerp(_vec.current, 0.1);
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

const SceneContent = ({ isMobile }: { isMobile: boolean }) => {
  const { selectedComponent, cameraResetTrigger, explodeStep, envPreset } = usePC();
  const cameraControlsRef = useRef<CameraControls>(null);
  const { camera } = useThree();

  const hasInitialized = useRef(false);
  const _tempVec = useRef(new Vector3());
  const _tempDir = useRef(new Vector3());
  const _tempFocal = useRef(new Vector3());

  // Obsługa przesuwania na boki (Pan / Truck) za pomocą strzałek
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!cameraControlsRef.current) return;
      // Nie blokujemy strzałek, jeśli user pisze w jakimś inpucie
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      
      const speed = 0.5;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          cameraControlsRef.current.forward(speed, true);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          cameraControlsRef.current.forward(-speed, true);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          cameraControlsRef.current.truck(-speed, 0, true);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          cameraControlsRef.current.truck(speed, 0, true);
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Dynamiczny kolor tła zależny od wybranego środowiska HDRi
  const bgColor = envPreset === 'studio' ? '#13141a' : envPreset === 'city' ? '#0f0a1c' : envPreset === 'apartment' ? '#8492a6' : '#1e1b18';

  useEffect(() => {
    if (cameraControlsRef.current && !hasInitialized.current) {
      hasInitialized.current = true;
      cameraControlsRef.current.setLookAt(0, 12, 35, 0, 0, 0, false);
      setTimeout(() => {
        cameraControlsRef.current?.setLookAt(0, 3, 20, 0, 0, 0, true);
      }, 300);
    }
  }, []);

  useEffect(() => {
    if (cameraControlsRef.current && selectedComponent) {
      const posArray = explodeStep === 2 ? selectedComponent.explodedPosition : selectedComponent.position;
      const targetVec = _tempVec.current.set(posArray[0], posArray[1], posArray[2]);
      
      // Calculate vector from component to current camera
      let dir = _tempDir.current.copy(camera.position).sub(targetVec);
      
      if (dir.lengthSq() < 0.001) {
        dir.set(0, 0.5, 1);
      }
      dir.normalize();
      
      // Keep focal point exactly on the component so it rotates perfectly around its own center
      const focalPoint = _tempFocal.current.copy(targetVec);
      
      // Set distance to exactly 4 for a closer, more detailed look
      const targetPos = targetVec.clone().add(dir.multiplyScalar(4));

      cameraControlsRef.current.setLookAt(
        targetPos.x, targetPos.y, targetPos.z,
        focalPoint.x, focalPoint.y, focalPoint.z,
        true
      );

      // Epic UI/UX: Shift the entire camera frustum to the left by 25% 
      // so the component is perfectly visible on the left half of the screen
      if (!isMobile && 'setViewOffset' in camera) {
        (camera as any).setViewOffset(window.innerWidth, window.innerHeight, window.innerWidth * 0.25, 0, window.innerWidth, window.innerHeight);
        camera.updateProjectionMatrix();
      }
    } else if (!selectedComponent) {
      // Reset view offset when panel closes
      if ('clearViewOffset' in camera) {
        (camera as any).clearViewOffset();
        camera.updateProjectionMatrix();
      }
      // Płynny powrót kamery na środek
      cameraControlsRef.current?.setLookAt(
        0, 3, 20,
        0, 0, 0,
        true
      );
    }

    return () => {
      // Cleanup: reset view offset when unmounting
      if ('clearViewOffset' in camera) {
        (camera as any).clearViewOffset();
        camera.updateProjectionMatrix();
      }
    };
  }, [selectedComponent, explodeStep, camera, isMobile]);

  useEffect(() => {
    if (cameraControlsRef.current && cameraResetTrigger > 0) {
      cameraControlsRef.current.setLookAt(
        0, 3, 20,
        0, 0, 0,
        true
      );
    }
  }, [cameraResetTrigger]);

  return (
    <>
      <color attach="background" args={[bgColor]} />
      
      <ambientLight intensity={1.8} />
      
      <PerspectiveCamera makeDefault position={[0, 3, 16]} fov={50} near={0.5} far={100} />
      
      <Sparkles count={150} scale={20} size={3} speed={0.3} opacity={0.2} color="#8b5cf6" />
      
      <directionalLight 
        position={[10, 20, 10]} 
        intensity={3.5} 
      />
      <directionalLight position={[-10, -10, -10]} intensity={2.0} color="#6366f1" />
      <spotLight position={[-10, 10, -10]} intensity={3.5} angle={0.3} penumbra={1} />
      <rectAreaLight position={[0, 3, 0]} width={5} height={5} intensity={5.0} color="#e0e7ff" rotation={[-Math.PI / 2, 0, 0]} />
      <pointLight position={[0, 0, 6]} intensity={15.0} color="#ffffff" distance={30} decay={2} />
      
      {!isMobile && <CursorLight />}
      
      <React.Suspense fallback={null}>
        <PCModel />
        <ErrorBoundary fallback={null}>
          <Environment preset={envPreset as any} environmentIntensity={1.5} />
        </ErrorBoundary>
        <Grid 
          position={[0, -6.1, 0]} 
          args={[40, 40]} 
          cellSize={1} 
          cellThickness={1} 
          cellColor="#4b5563" 
          sectionSize={5} 
          sectionThickness={1.5} 
          sectionColor="#6b7280" 
          fadeDistance={30} 
          fadeStrength={1} 
        />
        <EffectComposer multisampling={isMobile ? 0 : 4}>
          <Bloom luminanceThreshold={1} mipmapBlur={!isMobile} intensity={isMobile ? 0.8 : 1.0} />
          <N8AO aoRadius={0.5} intensity={2.0} distanceFalloff={0.5} quality={isMobile ? "low" : "medium"} halfRes />
          <Vignette eskil={false} offset={0.2} darkness={0.6} />
          <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={CHROMA_OFFSET} />
        </EffectComposer>
      </React.Suspense>
      
      <CameraControls 
        ref={cameraControlsRef}
        makeDefault
        minDistance={6} 
        maxDistance={20}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI * 0.85}
        dollySpeed={0.5}
        smoothTime={0.4}
        draggingSmoothTime={0.2}
      />
    </>
  );
};

export const Scene3D = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [dpr, setDpr] = useState<number | [number, number]>(1);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.matchMedia('(max-width: 768px)').matches;
      setIsMobile(mobile);
      setDpr(mobile ? 1 : [1, 2]);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { setSelectedComponent } = usePC();

  return (
    <div className="w-full h-[60vh] md:h-screen bg-[#050505]">
      <Canvas
        gl={{ antialias: true, logarithmicDepthBuffer: true }}
        dpr={dpr} 
        shadows
        onPointerMissed={() => setSelectedComponent(null)}
      >
        <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(isMobile ? 1 : [1, 2])}>
          <SceneContent isMobile={isMobile} />
        </PerformanceMonitor>
      </Canvas>
    </div>
  );
};
