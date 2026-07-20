import { MeshStandardMaterial, ExtrudeGeometry, Shape } from 'three';


import { useRef, useMemo, useEffect } from 'react';

import { useTexture } from '@react-three/drei';
import cpuTopUrl from '../../../assets/cpu_top.webp';
import cpuBottomUrl from '../../../assets/cpu_bottom.webp';
import { extrudeOptsIhs } from '../constants';
import { materials, xrayMaterial } from '../materials';
import { usePCView } from '../../../hooks/usePC';

export const CPUGeometry = () => {
  const xrayMode = usePCView(s => s.xrayMode);
  const cpuTexture = useTexture(cpuTopUrl);
  const cpuBottomTexture = useTexture(cpuBottomUrl);
  const ihsGeoRef = useRef<ExtrudeGeometry>(null);

  const ihsShape = useMemo(() => {
    const shape = new Shape();
    shape.moveTo(0.36, 0.36);
    shape.lineTo(0.22, 0.36);
    shape.lineTo(0.22, 0.28);
    shape.lineTo(0.08, 0.28);
    shape.lineTo(0.08, 0.36);
    shape.lineTo(-0.08, 0.36);
    shape.lineTo(-0.08, 0.28);
    shape.lineTo(-0.22, 0.28);
    shape.lineTo(-0.22, 0.36);
    shape.lineTo(-0.36, 0.36);

    shape.lineTo(-0.36, 0.22);
    shape.lineTo(-0.28, 0.22);
    shape.lineTo(-0.28, 0.08);
    shape.lineTo(-0.36, 0.08);
    shape.lineTo(-0.36, -0.08);
    shape.lineTo(-0.28, -0.08);
    shape.lineTo(-0.28, -0.22);
    shape.lineTo(-0.36, -0.22);
    shape.lineTo(-0.36, -0.36);

    shape.lineTo(-0.22, -0.36);
    shape.lineTo(-0.22, -0.28);
    shape.lineTo(-0.08, -0.28);
    shape.lineTo(-0.08, -0.36);
    shape.lineTo(0.08, -0.36);
    shape.lineTo(0.08, -0.28);
    shape.lineTo(0.22, -0.28);
    shape.lineTo(0.22, -0.36);
    shape.lineTo(0.36, -0.36);

    shape.lineTo(0.36, -0.22);
    shape.lineTo(0.28, -0.22);
    shape.lineTo(0.28, -0.08);
    shape.lineTo(0.36, -0.08);
    shape.lineTo(0.36, 0.08);
    shape.lineTo(0.28, 0.08);
    shape.lineTo(0.28, 0.22);
    shape.lineTo(0.36, 0.22);
    shape.lineTo(0.36, 0.36);
    return shape;
  }, []);

  useEffect(() => {
    if (ihsGeoRef.current) {
      const uv = ihsGeoRef.current.attributes.uv;
      const pos = ihsGeoRef.current.attributes.position;
      if (uv && pos) {
        for (let i = 0; i < uv.count; i++) {
          const x = pos.getX(i);
          const y = pos.getY(i);
          uv.setXY(i, (x + 0.4) / 0.8, (y + 0.4) / 0.8);
        }
        uv.needsUpdate = true;
      }
    }
  }, [ihsShape]);

  useEffect(() => {
    return () => ihsGeoRef.current?.dispose();
  }, []);

  const texturedMaterials = useMemo(() => ({
    texMat0: new MeshStandardMaterial({ map: cpuTexture, roughness: 0.9 }),
    texMat1: new MeshStandardMaterial({ map: cpuTexture, roughness: 0.4, metalness: 0.7 }),
    texMat2: new MeshStandardMaterial({ map: cpuBottomTexture, roughness: 0.4, metalness: 0.8 })
  }), [cpuBottomTexture, cpuTexture]);

  useEffect(() => {
    return () => {
      Object.values(texturedMaterials).forEach(mat => mat.dispose());
    };
  }, [texturedMaterials]);

  return (
    <group>
      {/* Base Substrate Block */}
      <mesh position={[0, 0, -0.01]} material={xrayMode ? xrayMaterial : materials.cpuDarkCharcoal}>
        <boxGeometry args={[0.8, 0.8, 0.06]} />
      </mesh>
      
      {/* Substrate Top Texture Plane (Edges around IHS) */}
      <mesh position={[0, 0, 0.021]} material={xrayMode ? xrayMaterial : undefined}>
        <planeGeometry args={[0.8, 0.8]} />
        {!xrayMode && <primitive object={texturedMaterials.texMat0} />}
      </mesh>

      {/* 3D Raised IHS (Octopus Shape with Bevels) */}
      <mesh position={[0, 0, 0.021]} material={xrayMode ? xrayMaterial : undefined}>
        <extrudeGeometry ref={ihsGeoRef} args={[ihsShape, extrudeOptsIhs]} />
        {!xrayMode && (
          <>
            <primitive object={texturedMaterials.texMat1} attach="material-0" />
            <primitive object={materials.cpuSilverMetal} attach="material-1" />
          </>
        )}
      </mesh>

      {/* Photorealistic CPU Bottom (Pins) */}
      <mesh position={[0, 0, -0.041]} rotation={[0, Math.PI, 0]} material={xrayMode ? xrayMaterial : undefined}>
        <planeGeometry args={[0.8, 0.8]} />
        {!xrayMode && <primitive object={texturedMaterials.texMat2} />}
      </mesh>
    </group>
  );
};
