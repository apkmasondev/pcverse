import { fanBladesRefsZ } from '../FanManager';
import { materials, xrayMaterial } from '../materials';
import { useRef, useEffect, useMemo } from 'react';
import { Group } from 'three';
import { useTexture } from '@react-three/drei';
import heatsinkUrl from '../../../assets/heatsink.webp';
import heatsinkSideUrl from '../../../assets/heatsink_side.webp';
import aioFanUrl from '../../../assets/aio_fan.webp';
import aioFanRgbUrl from '../../../assets/aio_fan_rgb.webp';
import caseFanUrl from '../../../assets/case_fan.webp';
import caseFanRgbUrl from '../../../assets/case_fan_rgb.webp';
import fanSideUrl from '../../../assets/fan_side.webp';
import copperPlateUrl from '../../../assets/copper_plate.webp';
import radiatorPlateUrl from '../../../assets/radiator_plate.webp';
import { usePCSettings } from '../../../hooks/usePC';
import { LocalAirflowParticles } from './LocalAirflowParticles';

export const FanGeometry = ({ rgbColor, isExhaust = false, textureUrl }: { rgbColor: string, isExhaust?: boolean, textureUrl?: string }) => {
  const { xrayMode, rgbEnabled } = usePCSettings();
  
  const baseTextureUrl = textureUrl || caseFanUrl;
  const rgbTextureUrl = baseTextureUrl === aioFanUrl ? aioFanRgbUrl : caseFanRgbUrl;
  
  const fanBaseTexture = useTexture(baseTextureUrl);
  const fanRgbTexture = useTexture(rgbTextureUrl);
  const activeTexture = rgbEnabled ? fanRgbTexture : fanBaseTexture;
  const fanSideTexture = useTexture(fanSideUrl);
  
  const isCaseFan = baseTextureUrl === caseFanUrl;
  const torusRadius = isCaseFan ? 0.47 : 0.455;
  const torusTube = isCaseFan ? 0.028 : 0.027;
  
  const fanSideTextureRotated = useMemo(() => {
    const tex = fanSideTexture.clone();
    tex.rotation = Math.PI / 2;
    tex.center.set(0.5, 0.5);
    tex.needsUpdate = true;
    return tex;
  }, [fanSideTexture]);
  
  useEffect(() => {
    return () => {
      fanSideTextureRotated.dispose();
    };
  }, [fanSideTextureRotated]);
  const bladesRef = useRef<Group>(null);

  useEffect(() => {
    if (bladesRef.current) {
      fanBladesRefsZ.add(bladesRef.current);
      const currentRef = bladesRef.current;
      return () => { fanBladesRefsZ.delete(currentRef); };
    }
  }, []);

  return (
    <group>
      {/* Inner Physical Blades (visible in X-Ray mode) */}
      <group position={[0, 0, 0]} ref={bladesRef} userData={{ axis: 'z' }}>
        <mesh material={xrayMode ? xrayMaterial : undefined}>
          <boxGeometry args={[0.78, 0.05, 0.1]} />
          {!xrayMode && <primitive object={materials.darkMetal} attach="material" />}
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]} material={xrayMode ? xrayMaterial : undefined}>
          <boxGeometry args={[0.78, 0.05, 0.1]} />
          {!xrayMode && <primitive object={materials.darkMetal} attach="material" />}
        </mesh>
      </group>

      {/* Outer Frame */}
      <mesh position={[0, 0, 0]} material={xrayMode ? xrayMaterial : undefined}>
        <boxGeometry args={[1, 1, 0.2]} />
        {!xrayMode && (
          <>
            <meshStandardMaterial attach="material-0" map={fanSideTextureRotated} roughness={0.6} />
            <meshStandardMaterial attach="material-1" map={fanSideTextureRotated} roughness={0.6} />
            <meshStandardMaterial attach="material-2" map={fanSideTexture} roughness={0.6} />
            <meshStandardMaterial attach="material-3" map={fanSideTexture} roughness={0.6} />
            <primitive object={materials.darkMetal} attach="material-4" />
            <primitive object={materials.darkMetal} attach="material-5" />
          </>
        )}
      </mesh>
      
      {/* Front Face Texture */}
      {!xrayMode && (
        <mesh position={[0, 0, 0.101]}>
          <planeGeometry args={[1, 1]} />
          <meshStandardMaterial map={activeTexture} roughness={0.4} metalness={0.3} transparent={false} alphaTest={0.5} />
        </mesh>
      )}
      
      {/* Front RGB LED Ring - hide when xrayMode is active */}
      {!xrayMode && (
        <mesh position={[0, 0, 0.103]}>
          <torusGeometry args={[torusRadius, torusTube, 16, 64]} />
          <meshStandardMaterial color={rgbColor} emissive={rgbColor} emissiveIntensity={3} toneMapped={false} />
        </mesh>
      )}

      {/* Back Face Texture */}
      {!xrayMode && (
        <mesh position={[0, 0, -0.101]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[1, 1]} />
          <meshStandardMaterial map={activeTexture} roughness={0.4} metalness={0.3} transparent={false} alphaTest={0.5} />
        </mesh>
      )}
      
      {/* Back RGB LED Ring - hide when xrayMode is active */}
      {!xrayMode && (
        <mesh position={[0, 0, -0.103]} rotation={[0, Math.PI, 0]}>
          <torusGeometry args={[torusRadius, torusTube, 16, 64]} />
          <meshStandardMaterial color={rgbColor} emissive={rgbColor} emissiveIntensity={3} toneMapped={false} />
        </mesh>
      )}

      {/* Airflow */}
      <group position={[0, 0, 0]} rotation={[0, Math.PI, 0]}>
        <LocalAirflowParticles count={80} radius={0.4} length={2.5} speedMult={2} color={isExhaust ? "#ef4444" : "#38bdf8"} />
      </group>
    </group>
  );
};


export const CPUCoolerGeometry = ({ rgbColor }: { rgbColor: string }) => {
  const { xrayMode } = usePCSettings();
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

  return (
    <group scale={1.15} position={[0, 0, 0.0375]}>
      {/* Base Contact */}
      <mesh position={[0, 0, -0.25]} material={xrayMode ? xrayMaterial : undefined}>
        <boxGeometry args={[0.6, 0.6, 0.05]} />
        {!xrayMode && (
          <>
            <primitive attach="material-0" object={materials.copper} />
            <primitive attach="material-1" object={materials.copper} />
            <primitive attach="material-2" object={materials.copper} />
            <primitive attach="material-3" object={materials.copper} />
            <meshStandardMaterial attach="material-4" map={copperPlateTexture} metalness={0.8} roughness={0.2} />
            <meshStandardMaterial attach="material-5" map={copperPlateTexture} metalness={0.8} roughness={0.2} />
          </>
        )}
      </mesh>
      {/* Heatpipes */}
      {[-0.15, 0, 0.15].map((x, i) => (
        <mesh key={i} position={[x, 0, -0.1]} rotation={[Math.PI / 2, 0, 0]} material={xrayMode ? xrayMaterial : undefined}>
          <cylinderGeometry args={[0.03, 0.03, 0.3, 16]} />
          {!xrayMode && <primitive object={materials.chromeMetal} attach="material" />}
        </mesh>
      ))}
      {/* Fin Stack - shifted to Z=0.12 and shortened to 0.54 depth to prevent overlapping/smudging with the Fan at Z=0.5 */}
      <mesh position={[0, 0.1, 0.12]} material={xrayMode ? xrayMaterial : undefined}>
        <boxGeometry args={[1, 0.8, 0.54]} />
        {!xrayMode && (
          <>
            <meshStandardMaterial attach="material-0" map={heatsinkSideTexture} metalness={0.8} roughness={0.3} />
            <meshStandardMaterial attach="material-1" map={heatsinkSideTexture} metalness={0.8} roughness={0.3} />
            <meshStandardMaterial attach="material-2" map={heatsinkTexture} metalness={0.8} roughness={0.3} />
            <meshStandardMaterial attach="material-3" map={heatsinkTexture} metalness={0.8} roughness={0.3} />
            <meshStandardMaterial attach="material-4" map={radiatorPlateTexture} metalness={0.8} roughness={0.3} />
            <meshStandardMaterial attach="material-5" map={radiatorPlateTexture} metalness={0.8} roughness={0.3} />
          </>
        )}
      </mesh>
      {/* Top Cover */}
      <mesh position={[0, 0.51, 0.12]} material={xrayMode ? xrayMaterial : undefined}>
        <boxGeometry args={[1, 0.02, 0.54]} />
        {!xrayMode && <meshStandardMaterial map={heatsinkTexture} metalness={0.6} roughness={0.4} />}
      </mesh>
    {/* Attached Fan */}
    <group position={[0, 0.1, 0.52]}>
      <FanGeometry rgbColor={rgbColor} textureUrl={aioFanUrl} />
    </group>
  </group>
  );
};
