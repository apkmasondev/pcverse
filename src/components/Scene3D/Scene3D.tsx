import { MathUtils, AmbientLight, DirectionalLight, SpotLight, HemisphereLight, RectAreaLight, PerspectiveCamera as ThreePerspectiveCamera, Vector2, Vector3, Object3D } from 'three';
import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { CameraControls, Environment, PerspectiveCamera, Sparkles, Grid, Stars, Preload } from '@react-three/drei';
import { EffectComposer, Bloom, N8AO, Vignette, ChromaticAberration, DepthOfField, SMAA } from '@react-three/postprocessing';
import type { DepthOfFieldEffect } from 'postprocessing';


import { PCModel } from '../PCModel/PCModel';
import { usePCSelection, usePCView, usePCLighting } from '../../hooks/usePC';
import { useBuildStore } from '../../store/useBuildStore';
import { useQualityStore } from '../../store/useQualityStore';
import type { QualitySettings } from '../../store/useQualityStore';
import { useIsMobile } from '../../hooks/useIsMobile';
import { GlobalErrorBoundary as ErrorBoundary } from '../ErrorBoundary';
import { DeskScenery } from './DeskScenery';
import { AdaptiveQuality } from './AdaptiveQuality';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const envMap: Record<string, string> = {
  studio: import.meta.env.BASE_URL + 'environments/studio_small_03_1k.hdr',
  city: import.meta.env.BASE_URL + 'environments/potsdamer_platz_1k.hdr',
  dawn: import.meta.env.BASE_URL + 'environments/kiara_1_dawn_1k.hdr',
  apartment: import.meta.env.BASE_URL + 'environments/lebombo_1k.hdr',
  night: import.meta.env.BASE_URL + 'environments/moonless_golf_1k.hdr',
  lobby: import.meta.env.BASE_URL + 'environments/st_fagans_interior_1k.hdr'
};

/** Presety HDRi o wysokiej luminancji — wymagają przyciszenia świateł sceny. */
const BRIGHT_ENVIRONMENTS = ['studio', 'dawn', 'apartment', 'lobby'];

/** Kolor tła (i mgły) dopasowany do presetu HDRi. */
const BACKGROUND_COLORS: Record<string, string> = {
  studio: '#13141a',
  city: '#0f0a1c',
  apartment: '#8492a6',
  night: '#05020a',
  lobby: '#241c14',
  dawn: '#1e1b18',
};

// Stała offsetu — tworzenie nowego Vector2 przy każdym renderze wymuszało
// rekonstrukcję efektu w postprocessing.
const CHROMATIC_ABERRATION_OFFSET = new Vector2(0.0005, 0.0005);

const PC_MODEL_BASE_Y_OFFSET = 1.36;
const PC_MODEL_DESKTOP_Y_OFFSET = -1;
const PC_MODEL_MOBILE_Y_OFFSET = -0.5;
const PC_MODEL_MOBILE_SCALE = 0.7;

const setComponentWorldPosition = (
  target: Vector3,
  position: [number, number, number],
  isMobile: boolean,
  isExploded: boolean,
) => {
  const modelScale = isMobile ? PC_MODEL_MOBILE_SCALE : 1;
  const modelYOffset = PC_MODEL_BASE_Y_OFFSET
    + (isMobile ? PC_MODEL_MOBILE_Y_OFFSET : PC_MODEL_DESKTOP_Y_OFFSET);
  const explodeLift = isExploded ? 0.15 : 0;

  return target.set(
    position[0] * modelScale,
    (position[1] + explodeLift) * modelScale + modelYOffset,
    position[2] * modelScale,
  );
};

const CursorLight = () => {
  const lightRef = useRef<SpotLight>(null);
  const targetObj = useMemo(() => new Object3D(), []);
  const { scene } = useThree();
  const _vec = useRef(new Vector3());
  const cursorLightOn = usePCLighting(state => state.cursorLightOn);

  useEffect(() => {
    scene.add(targetObj);
    return () => { scene.remove(targetObj); };
  }, [scene, targetObj]);

  useFrame(({ raycaster, camera, invalidate }, delta) => {
    if (lightRef.current) {
      const targetIntensity = cursorLightOn ? 30.0 : 0;
      
      // Jeżeli wyłączone i zgaszone, pomijamy obliczenia
      if (targetIntensity === 0 && lightRef.current.intensity === 0) return;

      const dt = Math.min(delta, 0.05);
      
      // Światło startuje bezpośrednio z obiektywu kamery (lub delikatnie obok, by nie oświetlać cząsteczek tuż przed ekranem)
      lightRef.current.position.copy(camera.position);

      const distance = camera.position.length(); // celujemy prosto w środek sceny
      raycaster.ray.at(distance, _vec.current);

      let needsInvalidate = false;
      const distPos = targetObj.position.distanceTo(_vec.current);
      if (distPos > 0.001) {
        targetObj.position.lerp(_vec.current, 1 - Math.exp(-10 * dt));
        needsInvalidate = true;
      } else if (distPos > 0) {
        targetObj.position.copy(_vec.current);
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
    <spotLight
      ref={lightRef}
      target={targetObj}
      intensity={0}
      distance={50}
      angle={0.4}
      penumbra={0.8}
      color="#c084fc"
      decay={2}
    />
  );
};

const AnimatedLights = ({ simplifiedLighting, envPreset }: { simplifiedLighting: boolean, envPreset: string }) => {
  const { ambientOn, mainSpotOn, pcRGBOn } = usePCLighting();
  const isBrightEnv = BRIGHT_ENVIRONMENTS.includes(envPreset);

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

    if (simplifiedLighting) {
      if (hemiRef.current) hemiRef.current.intensity = MathUtils.lerp(hemiRef.current.intensity, tHemi, dt);
    } else {
      if (rectRef.current) rectRef.current.intensity = MathUtils.lerp(rectRef.current.intensity, tRect, dt);
    }
  });

  return (
    <>
      {simplifiedLighting ? (
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

const SceneContent = ({ isMobile, settings }: { isMobile: boolean, settings: QualitySettings }) => {
  const selectedComponent = usePCSelection(state => state.selectedComponent);
  const selectedComponentFocus = usePCSelection(state => state.selectedComponentFocus);
  const cameraResetTrigger = usePCSelection(state => state.cameraResetTrigger);
  const explodeStep = usePCSelection(state => state.explodeStep);
  const envPreset = usePCView(state => state.envPreset);
  const showDesk = usePCView(state => state.showDesk);
  const showParticles = usePCView(state => state.showParticles);
  const showFog = usePCView(state => state.showFog);
  const buildMode = useBuildStore(state => state.buildMode);
  const cameraControlsRef = useRef<CameraControls>(null);
  const { camera, size } = useThree();
  const reducedMotion = useReducedMotion();

  const hasInitialized = useRef(false);
  const _tempVec = useRef(new Vector3());
  const _tempDir = useRef(new Vector3());
  const _tempFocal = useRef(new Vector3());
  // Reusable vectors for camera transitions without per-render allocations.

  const dofRef = useRef<DepthOfFieldEffect>(null);
  const dofTarget = useMemo(() => new Vector3(), []);
  const dofEnabled = !!selectedComponent;

  // Naprawa błędu DepthOfField: upewniamy się, że cel ostrości to ZAWSZE aktualny środek kamery,
  // co gwarantuje pełną ostrość nawet podczas trwania animacji Panningu kamery.
  useFrame(() => {
    if (dofEnabled && dofRef.current && dofRef.current.target && cameraControlsRef.current) {
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
      case 'lobby':
        return { cell: '#4a3a28', section: '#a98a5c', sparkles: '#fde68a' }; // Hol (Ciepłe drewno), pyłki Bursztynowe
      case 'studio':
      default:
        return { cell: '#4b5563', section: '#6b7280', sparkles: '#9ca3af' }; // Studio (Neutralny), pyłki Szare
    }
  }, [envPreset]);

  // Dynamiczny kolor tła zależny od wybranego środowiska HDRi
  const bgColor = BACKGROUND_COLORS[envPreset] ?? BACKGROUND_COLORS.studio;

  useEffect(() => {
    if (selectedComponent) {
      if (selectedComponentFocus) {
        dofTarget.fromArray(selectedComponentFocus);
      } else {
        const posArray = explodeStep === 2 ? selectedComponent.explodedPosition : selectedComponent.position;
        setComponentWorldPosition(dofTarget, posArray, isMobile, explodeStep === 2);
      }
    } else {
      dofTarget.set(0, 0, 0);
    }
  }, [selectedComponent, selectedComponentFocus, explodeStep, dofTarget, isMobile]);

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
      const targetVec = selectedComponentFocus
        ? _tempVec.current.fromArray(selectedComponentFocus)
        : setComponentWorldPosition(
            _tempVec.current,
            posArray,
            isMobile,
            explodeStep === 2,
          );

      const dir = _tempDir.current.copy(camera.position).sub(targetVec);

      if (dir.lengthSq() < 0.001) {
        dir.set(0, 0.5, 1);
      }
      dir.normalize();

      const focalPoint = _tempFocal.current.copy(targetVec);

      const dist = isMobile ? 8 : 4;
      const targetPos = targetVec.clone().add(dir.multiplyScalar(dist));

      if (camera instanceof ThreePerspectiveCamera) {
        if (isMobile) {
          if (camera.view) camera.clearViewOffset();
        } else {
          camera.setViewOffset(
            size.width,
            size.height,
            size.width * 0.15,
            0,
            size.width,
            size.height,
          );
        }
        camera.updateProjectionMatrix();
      }

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
      if (camera instanceof ThreePerspectiveCamera && camera.view) {
        camera.clearViewOffset();
        camera.updateProjectionMatrix();
      }
    };
  }, [selectedComponent, selectedComponentFocus, explodeStep, camera, isMobile, size.width, size.height]);

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

      {!isMobile && settings.atmosphere && showParticles && !reducedMotion && (
        <>
          <Sparkles count={settings.sparkleCount} scale={30} size={4} speed={0.5} opacity={0.5} color={gridColors.sparkles} />
          <Stars radius={50} depth={50} count={settings.starCount} factor={3} saturation={0.5} fade speed={1.5} />
        </>
      )}

      <AnimatedLights simplifiedLighting={settings.simplifiedLighting} envPreset={envPreset} />

      {!isMobile && settings.cursorLight && <CursorLight />}

      <React.Suspense fallback={null}>

        <group
          position={[
            0,
            PC_MODEL_BASE_Y_OFFSET + (isMobile ? PC_MODEL_MOBILE_Y_OFFSET : PC_MODEL_DESKTOP_Y_OFFSET),
            0,
          ]}
          scale={isMobile ? PC_MODEL_MOBILE_SCALE : 1}
        >
          <PCModel />
        </group>
        <ErrorBoundary fallback={null}>
          <Environment
            files={envMap[envPreset] || envMap.studio}
            environmentIntensity={BRIGHT_ENVIRONMENTS.includes(envPreset) ? 0.7 : 1.2}
          />
        </ErrorBoundary>

        {showDesk && !isMobile && settings.scenery ? (
          <DeskScenery reflectorResolution={settings.reflectorResolution} />
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
        {!isMobile && settings.postProcessing && (() => {
          const effects: React.ReactElement[] = [];

          if (settings.antialias) {
            effects.push(<SMAA key="smaa" />);
          }
          if (settings.depthOfField && dofEnabled) {
            effects.push(<DepthOfField ref={dofRef} key="dof" target={dofTarget} focalLength={3.0} bokehScale={5} />);
          }
          if (settings.ambientOcclusion) {
            effects.push(<N8AO key="n8ao" aoRadius={0.5} intensity={2.0} distanceFalloff={0.5} quality="medium" halfRes />);
          }

          effects.push(<Bloom key="bloom" luminanceThreshold={1.2} mipmapBlur={settings.bloomMipmap} intensity={1.5} />);
          effects.push(<Vignette key="vig" eskil={false} offset={0.1} darkness={0.9} />);
          if (settings.chromaticAberration) {
            // `radialModulation` domyślnie jest wyłączone, a `modulationOffset` działa
            // wyłącznie razem z nim — obie wartości pomijamy (od 3.0.5 nie ma ich w typach).
            effects.push(<ChromaticAberration key="ca" offset={CHROMATIC_ABERRATION_OFFSET} />);
          }

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
  const [contextLost, setContextLost] = useState(false);

  const settings = useQualityStore(state => state.settings);
  const applyTier = useQualityStore(state => state.applyTier);

  // Na urządzeniach mobilnych `dpr` trzymamy na 1 niezależnie od tieru —
  // ekrany 3x DPR potrafią potroić liczbę pikseli do wyrenderowania.
  const dpr = isMobile ? 1 : settings.dpr;

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

  // Utrata kontekstu WebGL zdarza się realnie na słabych/mobilnych GPU przy
  // presji pamięci. Bez obsługi użytkownik widzi zamrożoną, czarną scenę.
  const handleCreated = useCallback(({ gl }: { gl: { domElement: HTMLCanvasElement; capabilities: { maxTextureSize: number } } }) => {
    const canvas = gl.domElement;
    const onLost = (event: Event) => {
      event.preventDefault();
      setContextLost(true);
    };
    const onRestored = () => setContextLost(false);
    canvas.addEventListener('webglcontextlost', onLost);
    canvas.addEventListener('webglcontextrestored', onRestored);

    // Ostateczna weryfikacja na żywym kontekście — sonda przy starcie mogła
    // trafić na inny (np. programowy) backend niż faktyczny renderer sceny.
    if (gl.capabilities.maxTextureSize < 8192) {
      applyTier('low', `MAX_TEXTURE_SIZE = ${gl.capabilities.maxTextureSize}`);
    }
  }, [applyTier]);

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
      {contextLost && (
        <div
          role="alert"
          className="absolute inset-0 z-20 flex items-center justify-center bg-[#050505]/95 p-6 text-center"
        >
          <div className="max-w-md rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6">
            <h2 className="mb-3 text-lg font-bold text-amber-300">Przerwano rendering 3D</h2>
            <p className="text-sm leading-relaxed text-slate-300">
              Karta graficzna utraciła kontekst WebGL — najczęściej z powodu braku pamięci
              lub aktualizacji sterownika. Odśwież stronę, aby wrócić do sceny.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-5 rounded-lg bg-amber-500/20 px-4 py-2 text-sm font-medium text-amber-100 transition-colors hover:bg-amber-500/30"
            >
              Odśwież stronę
            </button>
          </div>
        </div>
      )}
      <Canvas
        gl={{
          antialias: false,
          stencil: false,
          alpha: false,
          depth: true,
          powerPreference: settings.powerPreference,
        }}
        dpr={dpr}
        frameloop={frameloop}
        onPointerMissed={() => setSelectedComponent(null)}
        onCreated={handleCreated}
      >
        {/* Pomiar FPS ma sens tylko przy ciągłej pętli renderowania — w trybie
            `demand` liczba klatek odzwierciedla aktywność użytkownika, nie wydajność. */}
        <AdaptiveQuality active={frameloop === 'always'} />
        <SceneContent isMobile={isMobile} settings={settings} />
        <Preload all />
      </Canvas>
    </div>
  );
};
