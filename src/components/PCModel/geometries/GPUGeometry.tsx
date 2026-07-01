import { MathUtils, MeshStandardMaterial, RepeatWrapping, SRGBColorSpace, Group } from 'three';


import { fanBladesRefsY } from '../FanManager';
import { materials, xrayMaterial } from '../materials';
import { useRef, useMemo, useEffect } from 'react';


import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import gpuBottomUrl from '../../../assets/gpu_bottom.webp';
import gpuTopUrl from '../../../assets/gpu_top.webp';
import gpuFrontUrl from '../../../assets/gpu_front.webp';
import gpuBackplateUrl from '../../../assets/gpu_backplate.webp';
import gpuIoUrl from '../../../assets/gpu_io.webp';
import { LocalAirflowParticles } from './LocalAirflowParticles';
import { usePCView } from '../../../hooks/usePC';

export const GPUGeometry = ({ rgbColor, rgbEnabled }: { rgbColor: string, rgbEnabled?: boolean }) => {
  const xrayMode = usePCView(s => s.xrayMode);
  const fanRef1 = useRef<Group>(null);
  const fanRef2 = useRef<Group>(null);
  const fanRef3 = useRef<Group>(null);
  const gpuBackplateTexture = useTexture(gpuBackplateUrl);
  const gpuBottomTexture = useTexture(gpuBottomUrl);
  const gpuTopTexture = useTexture(gpuTopUrl);
  const gpuFrontTexture = useTexture(gpuFrontUrl);
  const gpuIoTexture = useTexture(gpuIoUrl);

  useEffect(() => {
    gpuFrontTexture.colorSpace = SRGBColorSpace;
    gpuFrontTexture.wrapS = RepeatWrapping;
    gpuFrontTexture.wrapT = RepeatWrapping;
    gpuFrontTexture.repeat.set(3, 1);
    gpuFrontTexture.needsUpdate = true;
  }, [gpuFrontTexture]);

  useEffect(() => {
    const refs = [fanRef1, fanRef2, fanRef3];
    refs.forEach(ref => {
      if (ref.current) fanBladesRefsY.add(ref.current);
    });
    return () => {
      refs.forEach(ref => {
        if (ref.current) fanBladesRefsY.delete(ref.current);
      });
    };
  }, []);

  const rgbMat15 = useMemo(() => new MeshStandardMaterial({ color: 0x000000, emissiveIntensity: 0, toneMapped: false }), []);
  const rgbMat10 = useMemo(() => new MeshStandardMaterial({ color: 0x000000, emissiveIntensity: 0, toneMapped: false }), []);
  const rgbMat25 = useMemo(() => new MeshStandardMaterial({ color: 0x000000, emissiveIntensity: 0, toneMapped: false }), []);

  useEffect(() => {
    rgbMat15.emissive.set(rgbColor);
    rgbMat10.emissive.set(rgbColor);
    rgbMat25.emissive.set(rgbColor);
  }, [rgbColor, rgbMat15, rgbMat10, rgbMat25]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    rgbMat15.emissiveIntensity = MathUtils.lerp(rgbMat15.emissiveIntensity, rgbEnabled ? 2.5 : 0, dt * 5);
    rgbMat10.emissiveIntensity = MathUtils.lerp(rgbMat10.emissiveIntensity, rgbEnabled ? 1.5 : 0, dt * 5);
    rgbMat25.emissiveIntensity = MathUtils.lerp(rgbMat25.emissiveIntensity, rgbEnabled ? 3.5 : 0, dt * 5);
  });

  useEffect(() => {
    return () => {
      rgbMat15.dispose();
      rgbMat10.dispose();
      rgbMat25.dispose();
    };
  }, [rgbMat15, rgbMat10, rgbMat25]);



  const texturedMaterials = useMemo(() => ({
    texMat0: new MeshStandardMaterial({ map: gpuIoTexture, roughness: 0.4, metalness: 0.6 }),
    texMat1: new MeshStandardMaterial({ map: gpuBackplateTexture, roughness: 0.3, metalness: 0.7 }),
    texMat2: new MeshStandardMaterial({ map: gpuFrontTexture, roughness: 0.3, metalness: 0.5 }),
    texMat3: new MeshStandardMaterial({ map: gpuTopTexture, roughness: 0.4, metalness: 0.6 }),
    texMat4: new MeshStandardMaterial({ map: gpuBottomTexture, roughness: 0.4, metalness: 0.6 })
  }), [gpuBackplateTexture, gpuBottomTexture, gpuFrontTexture, gpuIoTexture, gpuTopTexture]);

  useEffect(() => {
    return () => {
      Object.values(texturedMaterials).forEach(mat => mat.dispose());
    };
  }, [texturedMaterials]);

  return (
    <group>
      {/* PCIe Connector - Short Segment (Front) */}
      <mesh position={[-1.45, 0.05, -0.66]} material={xrayMode ? xrayMaterial : undefined}>
        <boxGeometry args={[0.3, 0.08, 0.09]} />
        {!xrayMode && <primitive object={materials.goldMetal} attach="material" />}
      </mesh>
      {/* PCIe Connector - Long Segment */}
      <mesh position={[-0.35, 0.05, -0.66]} material={xrayMode ? xrayMaterial : undefined}>
        <boxGeometry args={[1.8, 0.08, 0.09]} />
        {!xrayMode && <primitive object={materials.goldMetal} attach="material" />}
      </mesh>
      {/* GPU IO Ports (HDMI & 3x DisplayPort) at Left Edge */}
      <group position={[-1.7, -0.15, 0]}>
        <mesh position={[0, 0, -0.1]} material={xrayMode ? xrayMaterial : undefined}>
          <boxGeometry args={[0.04, 0.38, 1.3]} />
          {!xrayMode && <primitive object={materials.roughDarkMetal} attach="material" />}
        </mesh>
        {/* GPU IO Texture Plane */}
        {!xrayMode && (
          <mesh position={[-0.025, 0, -0.1]} rotation={[0, -Math.PI / 2, 0]}>
            <planeGeometry args={[1.3, 0.38]} />
            <primitive object={texturedMaterials.texMat0} />
          </mesh>
        )}
        {/* HDMI Port (Gold plated) */}
        <mesh position={[-0.02, 0.05, 0.2]} material={xrayMode ? xrayMaterial : undefined}>
          <boxGeometry args={[0.05, 0.08, 0.15]} />
          {!xrayMode && <primitive object={materials.goldMetal} attach="material" />}
        </mesh>
        {/* 3x DisplayPort */}
        {[-0.05, -0.25, -0.45].map((z, i) => (
          <mesh key={`dp-${i}`} position={[-0.02, 0.05, z]} material={xrayMode ? xrayMaterial : undefined}>
            <boxGeometry args={[0.05, 0.08, 0.15]} />
            {!xrayMode && <primitive object={materials.darkMetal} attach="material" />}
          </mesh>
        ))}
      </group>

      {/* Main PCB */}
      <mesh position={[0, 0, 0]} material={xrayMode ? xrayMaterial : undefined}>
        <boxGeometry args={[3.4, 0.05, 1.2]} />
        {!xrayMode && <primitive object={materials.veryDarkGray} attach="material" />}
      </mesh>

      {/* Backplate with modern sci-fi cutouts */}
      <mesh position={[0, 0.05, 0]} material={xrayMode ? xrayMaterial : undefined}>
        <boxGeometry args={[3.4, 0.05, 1.2]} />
        {!xrayMode && <primitive object={materials.darkGrayMetal} attach="material" />}
      </mesh>
      {/* GPU Backplate Texture */}
      {!xrayMode && (
        <mesh position={[0, 0.076, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3.4, 1.2]} />
          <primitive object={texturedMaterials.texMat1} />
        </mesh>
      )}
      {/* Backplate Accent / Cutout detail (Removed to expose texture) */}

      {/* Heatsink Block */}
      <mesh position={[0, -0.15, 0]} material={xrayMode ? xrayMaterial : undefined}>
        <boxGeometry args={[3.3, 0.25, 1.15]} />
        {!xrayMode && <primitive object={materials.chromeMetal} attach="material" />}
      </mesh>

      {/* Fan Shroud */}
      <mesh position={[0, -0.325, 0]} material={xrayMode ? xrayMaterial : undefined}>
        <boxGeometry args={[3.4, 0.1, 1.2]} />
        {!xrayMode && <primitive object={materials.darkMetal} attach="material" />}
      </mesh>
      {/* GPU Front Texture (Fans Side) */}
      {!xrayMode && (
        <mesh position={[0, -0.376, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3.4, 1.2]} />
          <primitive object={texturedMaterials.texMat2} />
        </mesh>
      )}

      {/* GPU Top Edge Texture (Facing the glass) */}
      {!xrayMode && (
        <mesh position={[0, -0.15, 0.601]} rotation={[0, 0, 0]}>
          <planeGeometry args={[3.4, 0.45]} />
          <primitive object={texturedMaterials.texMat3} />
        </mesh>
      )}

      {/* GPU Bottom Edge Texture (Facing the motherboard) */}
      {!xrayMode && (
        <mesh position={[0, -0.15, -0.601]} rotation={[0, Math.PI, Math.PI]}>
          <planeGeometry args={[3.4, 0.45]} />
          <primitive object={texturedMaterials.texMat4} />
        </mesh>
      )}

      {/* RGB Edge Lighting - Front Edge Logo */}
      {!xrayMode && (
        <mesh position={[0, -0.15, 0.59]}>
          <boxGeometry args={[1.0, 0.06, 0.05]} />
          <primitive object={rgbMat15} attach="material" />
        </mesh>
      )}

      {/* RGB Edge Lighting - Side */}
      {!xrayMode && (
        <mesh position={[1.68, -0.15, 0]}>
          <boxGeometry args={[0.05, 0.1, 1.2]} />
          <primitive object={rgbMat10} attach="material" />
        </mesh>
      )}

      {/* Physical Fans (Visible inside hologram) */}
      {[-1.15, 0, 1.15].map((x, i) => (
        <group key={`phys-fan-${i}`} position={[x, -0.2, 0]} ref={i === 0 ? fanRef1 : i === 1 ? fanRef2 : fanRef3} userData={{ axis: 'y' }}>
          <mesh material={xrayMode ? xrayMaterial : undefined}>
            <cylinderGeometry args={[0.42, 0.42, 0.05, 32]} />
            {!xrayMode && <primitive object={materials.almostBlack} attach="material" />}
          </mesh>
          <mesh material={xrayMode ? xrayMaterial : materials.gpuDarkPlastic}>
            <boxGeometry args={[0.78, 0.05, 0.1]} />
          </mesh>
          <mesh rotation={[0, Math.PI / 2, 0]} material={xrayMode ? xrayMaterial : materials.gpuDarkPlastic}>
            <boxGeometry args={[0.78, 0.05, 0.1]} />
          </mesh>
        </group>
      ))}

      {/* Static RGB Rings on the Front Texture - hide when xrayMode is active */}
      {!xrayMode && [-1.14, 0, 1.14].map((x, i) => (
        <mesh key={`rgb-ring-${i}`} position={[x, -0.39, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.54, 0.022, 16, 48]} />
          <primitive object={rgbMat25} attach="material" />
        </mesh>
      ))}

      {/* GPU Cooling Airflow Particles - 3 streams for 3 fans */}
      {[-1.14, 0, 1.14].map((x, i) => (
        <group key={`airflow-${i}`} position={[x, -0.85, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <LocalAirflowParticles count={30} radius={0.35} length={0.8} speedMult={1.5} color="#38bdf8" />
        </group>
      ))}
    </group>
  );
};
