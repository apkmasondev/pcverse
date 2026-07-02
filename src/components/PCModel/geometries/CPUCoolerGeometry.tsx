import { MathUtils, MeshStandardMaterial, Group, Color } from 'three';

import { fanBladesRefsZ } from '../FanManager';
import { materials, xrayMaterial } from '../materials';
import { useRef, useEffect, useMemo } from 'react';

import { useTexture, Instance } from '@react-three/drei';
import { XInstances } from './XMesh';
import { useFrame } from '@react-three/fiber';
import heatsinkUrl from '../../../assets/heatsink.webp';
import heatsinkSideUrl from '../../../assets/heatsink_side.webp';
import aioFanUrl from '../../../assets/aio_fan.webp';
import aioFanRgbUrl from '../../../assets/aio_fan_rgb.webp';
import caseFanUrl from '../../../assets/case_fan.webp';
import caseFanRgbUrl from '../../../assets/case_fan_rgb.webp';
import fanSideUrl from '../../../assets/fan_side.webp';
import copperPlateUrl from '../../../assets/copper_plate.webp';
import radiatorPlateUrl from '../../../assets/radiator_plate.webp';
import { usePCRGB, usePCView } from '../../../hooks/usePC';
import { LocalAirflowParticles } from './LocalAirflowParticles';

export const FanGeometry = ({ rgbColor, isExhaust = false, textureUrl }: { rgbColor: string, rgbEnabled?: boolean, isExhaust?: boolean, textureUrl?: string }) => {
  const rgbEnabled = usePCRGB(s => s.rgbEnabled);
  const xrayMode = usePCView(s => s.xrayMode);

  const baseTextureUrl = textureUrl || caseFanUrl;
  const rgbTextureUrl = baseTextureUrl === aioFanUrl ? aioFanRgbUrl : caseFanRgbUrl;

  const fanBaseTexture = useTexture(baseTextureUrl);
  const fanRgbTexture = useTexture(rgbTextureUrl);
  const activeTexture = rgbEnabled ? fanRgbTexture : fanBaseTexture;
  const fanSideTexture = useTexture(fanSideUrl);

  const isCaseFan = baseTextureUrl === caseFanUrl;
  const torusRadius = isCaseFan ? 0.47 : 0.455;
  const torusTube = isCaseFan ? 0.028 : 0.027;

  const rgbMaterial = useMemo(() => new MeshStandardMaterial({ color: 0x000000, emissiveIntensity: 0, toneMapped: false }), []);

  const targetColor = useMemo(() => new Color(), []);
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    targetColor.set(rgbColor);
    rgbMaterial.emissive.lerp(targetColor, dt * 5);
    rgbMaterial.emissiveIntensity = MathUtils.lerp(rgbMaterial.emissiveIntensity, rgbEnabled ? 4.0 : 0, dt * 5);
  });

  useEffect(() => {
    return () => {
      rgbMaterial.dispose();
    };
  }, [rgbMaterial]);

  const { fanSideMat, fanSideMatRotated } = useMemo(() => {
    const matNormal = new MeshStandardMaterial({ map: fanSideTexture, roughness: 0.6 });
    const rotatedTex = fanSideTexture.clone();
    rotatedTex.center.set(0.5, 0.5);
    rotatedTex.rotation = Math.PI / 2;
    rotatedTex.needsUpdate = true;
    const matRotated = new MeshStandardMaterial({ map: rotatedTex, roughness: 0.6 });
    return { fanSideMat: matNormal, fanSideMatRotated: matRotated };
  }, [fanSideTexture]);

  useEffect(() => {
    return () => {
      fanSideMat.dispose();
      fanSideMatRotated.map?.dispose();
      fanSideMatRotated.dispose();
    };
  }, [fanSideMat, fanSideMatRotated]);

  const bladesRef = useRef<Group>(null);

  useEffect(() => {
    if (bladesRef.current) {
      fanBladesRefsZ.add(bladesRef.current);
      const currentRef = bladesRef.current;
      return () => { fanBladesRefsZ.delete(currentRef); };
    }
  }, []);

  const texturedMaterials = useMemo(() => ({
    texMat0: new MeshStandardMaterial({ map: activeTexture, roughness: 0.4, metalness: 0.3, transparent: false, alphaTest: 0.5 }),
    texMat1: new MeshStandardMaterial({ map: activeTexture, roughness: 0.4, metalness: 0.3, transparent: false, alphaTest: 0.5 })
  }), [activeTexture]);

  useEffect(() => {
    return () => {
      Object.values(texturedMaterials).forEach(mat => mat.dispose());
    };
  }, [texturedMaterials]);

  return (
    <group>
      {/* Inner Physical Blades (visible in X-Ray mode) */}
      <group position={[0, 0, 0]} ref={bladesRef} userData={{ axis: 'z' }}>
        {/* Hub */}
        <mesh rotation={[Math.PI / 2, 0, 0]} material={xrayMode ? xrayMaterial : undefined}>
          <cylinderGeometry args={[0.15, 0.15, 0.06, 16]} />
          {!xrayMode && <primitive object={materials.darkMetal} attach="material" />}
        </mesh>
        {/* Blades (4 full-width boxes = 8 blades) */}
        <XInstances>
          <boxGeometry args={[0.82, 0.03, 0.15]} />
          <primitive object={materials.darkMetal} attach="material" />
          {[0, 1, 2, 3].map(i => (
            <Instance key={i} rotation={[0, 0, (Math.PI / 4) * i]} />
          ))}
        </XInstances>
      </group>

      {/* Outer Frame */}
      <mesh position={[0, 0, 0]} material={xrayMode ? xrayMaterial : undefined}>
        <boxGeometry args={[1, 1, 0.2]} />
        {!xrayMode && (
          <>
            <primitive object={fanSideMatRotated} attach="material-0" />
            <primitive object={fanSideMatRotated} attach="material-1" />
            <primitive object={fanSideMat} attach="material-2" />
            <primitive object={fanSideMat} attach="material-3" />
            <primitive object={materials.darkMetal} attach="material-4" />
            <primitive object={materials.darkMetal} attach="material-5" />
          </>
        )}
      </mesh>

      {/* Front Face Texture */}
      {!xrayMode && (
        <mesh position={[0, 0, 0.101]}>
          <planeGeometry args={[1, 1]} />
          <primitive object={texturedMaterials.texMat0} />
        </mesh>
      )}

      {/* Front RGB LED Ring - hide when xrayMode is active */}
      {!xrayMode && (
        <mesh position={[0, 0, 0.103]}>
          <torusGeometry args={[torusRadius, torusTube, 16, 64]} />
          <primitive object={rgbMaterial} attach="material" />
        </mesh>
      )}

      {/* Back Face Texture */}
      {!xrayMode && (
        <mesh position={[0, 0, -0.101]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[1, 1]} />
          <primitive object={texturedMaterials.texMat1} />
        </mesh>
      )}

      {/* Back RGB LED Ring - hide when xrayMode is active */}
      {!xrayMode && (
        <mesh position={[0, 0, -0.103]} rotation={[0, Math.PI, 0]}>
          <torusGeometry args={[torusRadius, torusTube, 16, 64]} />
          <primitive object={rgbMaterial} attach="material" />
        </mesh>
      )}

      {/* Airflow */}
      <group position={[0, 0, 0]} rotation={[0, Math.PI, 0]}>
        <LocalAirflowParticles count={80} radius={0.4} length={2.5} speedMult={2} color={isExhaust ? "#ef4444" : "#38bdf8"} />
      </group>
    </group>
  );
};


export const CPUCoolerGeometry = ({ rgbColor }: { rgbColor: string, rgbEnabled?: boolean }) => {
  const xrayMode = usePCView(s => s.xrayMode);
  const heatsinkTexture = useTexture(heatsinkUrl);
  const heatsinkSideTexture = useTexture(heatsinkSideUrl);
  const copperPlateTexture = useTexture(copperPlateUrl);
  const radiatorPlateTexture = useTexture(radiatorPlateUrl);

  useEffect(() => {
    heatsinkTexture.rotation = Math.PI / 2;
    heatsinkTexture.center.set(0.5, 0.5);
    heatsinkTexture.needsUpdate = true;

    heatsinkSideTexture.rotation = Math.PI / 2;
    heatsinkSideTexture.center.set(0.5, 0.5);
    heatsinkSideTexture.needsUpdate = true;

    copperPlateTexture.rotation = Math.PI / 2;
    copperPlateTexture.center.set(0.5, 0.5);
    copperPlateTexture.needsUpdate = true;

    radiatorPlateTexture.rotation = 0;
    radiatorPlateTexture.center.set(0.5, 0.5);
    radiatorPlateTexture.needsUpdate = true;
  }, [heatsinkTexture, heatsinkSideTexture, copperPlateTexture, radiatorPlateTexture]);

  const copperMat = useMemo(() => new MeshStandardMaterial({ map: copperPlateTexture, metalness: 0.8, roughness: 0.2 }), [copperPlateTexture]);
  const sideMat = useMemo(() => new MeshStandardMaterial({ map: heatsinkSideTexture, metalness: 0.8, roughness: 0.3 }), [heatsinkSideTexture]);
  const topMat = useMemo(() => new MeshStandardMaterial({ map: heatsinkTexture, metalness: 0.8, roughness: 0.3 }), [heatsinkTexture]);
  const plateMat = useMemo(() => new MeshStandardMaterial({ map: radiatorPlateTexture, metalness: 0.8, roughness: 0.3 }), [radiatorPlateTexture]);

  useEffect(() => {
    return () => {
      copperMat.dispose();
      sideMat.dispose();
      topMat.dispose();
      plateMat.dispose();
    };
  }, [copperMat, sideMat, topMat, plateMat]);

  const texturedMaterials = useMemo(() => ({
    texMat0: new MeshStandardMaterial({ map: heatsinkTexture, metalness: 0.6, roughness: 0.4 })
  }), [heatsinkTexture]);

  useEffect(() => {
    return () => {
      Object.values(texturedMaterials).forEach(mat => mat.dispose());
    };
  }, [texturedMaterials]);

  return (
    <group scale={1.25} position={[0, 0, 0.0375]}>
      {/* Base Contact */}
      <mesh position={[0, 0, -0.25]} material={xrayMode ? xrayMaterial : undefined}>
        <boxGeometry args={[0.6, 0.6, 0.05]} />
        {!xrayMode && (
          <>
            <primitive attach="material-0" object={materials.copper} />
            <primitive attach="material-1" object={materials.copper} />
            <primitive attach="material-2" object={materials.copper} />
            <primitive attach="material-3" object={materials.copper} />
            <primitive attach="material-4" object={copperMat} />
            <primitive attach="material-5" object={copperMat} />
          </>
        )}
      </mesh>
      {/* Heatpipes */}
      <XInstances>
        <cylinderGeometry args={[0.03, 0.03, 0.3, 16]} />
        <primitive object={materials.chromeMetal} attach="material" />
        {[-0.15, 0, 0.15].map((x, i) => (
          <Instance key={i} position={[x, 0, -0.1]} rotation={[Math.PI / 2, 0, 0]} />
        ))}
      </XInstances>
      {/* Fin Stack - shifted to Z=0.12 and shortened to 0.54 depth to prevent overlapping/smudging with the Fan at Z=0.5 */}
      <mesh position={[0, 0.1, 0.12]} material={xrayMode ? xrayMaterial : undefined}>
        <boxGeometry args={[1, 0.8, 0.54]} />
        {!xrayMode && (
          <>
            <primitive attach="material-0" object={sideMat} />
            <primitive attach="material-1" object={sideMat} />
            <primitive attach="material-2" object={topMat} />
            <primitive attach="material-3" object={topMat} />
            <primitive attach="material-4" object={plateMat} />
            <primitive attach="material-5" object={plateMat} />
          </>
        )}
      </mesh>
      {/* Top Cover */}
      <mesh position={[0, 0.51, 0.12]} material={xrayMode ? xrayMaterial : undefined}>
        <boxGeometry args={[1, 0.02, 0.54]} />
        {!xrayMode && <primitive object={texturedMaterials.texMat0} />}
      </mesh>
      {/* Attached Fan */}
      <group position={[0, 0.1, 0.52]}>
        <FanGeometry rgbColor={rgbColor} textureUrl={aioFanUrl} />
      </group>
    </group>
  );
};
