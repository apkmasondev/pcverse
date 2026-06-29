import { CatmullRomCurve3, CubicBezierCurve3, TubeGeometry, Vector3 } from 'three';
import { useMemo, useEffect, useRef } from 'react';
import { materials, xrayMaterial } from './materials';

import { usePCSelection, usePCView } from '../../hooks/usePC';

export const CableGeometry = () => {
  const explodeStep = usePCSelection(s => s.explodeStep);
  const xrayMode = usePCView(s => s.xrayMode);
  const tubeRefs = useRef<(TubeGeometry | null)[]>([]);

  // 24-pin ATX Cable (PSU to Mobo)
  const curve1 = useMemo(() => new CubicBezierCurve3(
    new Vector3(-0.5, -2.15, -0.3), // near PSU (updated Z)
    new Vector3(1.7, -1.2, -1.6),  // routed far right to clear the GPU (GPU ends at X=1.5)
    new Vector3(2.5, -1, -1.3),   // coming straight up on the right side of the GPU
    new Vector3(0.9, 0.5, -1.7)    // plug into Motherboard right edge
  ), []);

  // 8-pin PCIe Cable (PSU to GPU)
  const curve2 = useMemo(() => new CubicBezierCurve3(
    new Vector3(-0.5, -1.7, -0.5), // near PSU
    new Vector3(0.6, -1.8, 0.3),   // routed forward and right
    new Vector3(0.6, -0.4, 0.3),   // straight up, standing in front of the GPU
    new Vector3(0.9, -0.5, - 0.55)  // plugs directly into the GPU side edge horizontally
  ), []);

  // SATA Data Cable (HDD to Mobo)
  const curve3 = useMemo(() => new CubicBezierCurve3(
    new Vector3(1.4, -2.23, 0.25),  // plug into HDD front connector (facing glass)
    new Vector3(1.3, -1.7, 0.6),   // route forward towards glass
    new Vector3(1.7, -1.7, -1),  // route up the right side behind mobo tray
    new Vector3(1.0, -1.4, -1.7)   // plug into bottom right of mobo
  ), []);

  // SATA Power Cable (HDD to PSU)
  const curve4 = useMemo(() => new CubicBezierCurve3(
    new Vector3(1.1, -2.23, 0.25),  // plug into HDD front power connector
    new Vector3(1.1, -2.18, 0.8),   // route forward towards glass
    new Vector3(-0.5, -2.18, -0.4), // route along bottom back to PSU
    new Vector3(-0.5, -1.7, 0.0)  // plug into PSU
  ), []);

  // 8-pin CPU Power Cable (PSU to Mobo Top-Left)
  const curve5 = useMemo(() => new CatmullRomCurve3([
    new Vector3(-0.5, -1.8, -0.2),  // Out of PSU
    new Vector3(-0.35, -2.2, -1.85), // Push back behind tray/mobo
    new Vector3(-1.4, -1.8, -1.85),  // Traverse left
    new Vector3(-1.4, 0.0, -1.85),   // Up midway
    new Vector3(-1.4, 1.8, -1.85),   // Up to the top
    new Vector3(-1.4, 1.8, -1.75)    // Pop out into Mobo
  ]), []);

  // second 8-pin PCIe Cable (PSU to GPU)
  const curve6 = useMemo(() => new CubicBezierCurve3(
    new Vector3(-0.4, -1.6, -0.1), // near PSU
    new Vector3(0.6, -1.8, 0.3),   // routed forward and right
    new Vector3(0.6, -0.4, 0.3),   // straight up, standing in front of the GPU
    new Vector3(1.15, -0.5, - 0.55)  // plugs directly into the GPU side edge horizontally
  ), []);

  const cables = useMemo(() => [curve1, curve2, curve3, curve4, curve5, curve6], [curve1, curve2, curve3, curve4, curve5, curve6]);

  useEffect(() => {
    return () => {
      // Memory Leak cleanup! (C7/C8)
      tubeRefs.current.forEach(geo => {
        if (geo) geo.dispose();
      });
    };
  }, []);

  return (
    <group visible={explodeStep === 0}>
      {cables.map((curve, i) => (
        <mesh key={`cable-${i}`} material={xrayMode ? xrayMaterial : undefined}>
          <tubeGeometry
            ref={(el) => tubeRefs.current[i] = el}
            args={[curve, 64, i === 0 ? 0.08 : i === 2 ? 0.03 : 0.05, 8, false]}
          />
          {!xrayMode && (
            <primitive attach="material" object={i === 2 ? materials.redCable : materials.blackCable} />
          )}
        </mesh>
      ))}
    </group>
  );
};
