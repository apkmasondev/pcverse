import { useMemo, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { usePCSelection, usePCSettings } from '../../hooks/usePC';

export const CableGeometry = () => {
  const { explodeStep } = usePCSelection();
  const { xrayMode } = usePCSettings();
  const tubeRefs = useRef<(THREE.TubeGeometry | null)[]>([]);

  // 24-pin ATX Cable (PSU to Mobo)
  const curve1 = useMemo(() => new THREE.CubicBezierCurve3(
    new THREE.Vector3(-0.5, -1.8, -0.8), // near PSU (updated Z)
    new THREE.Vector3(1.7, -1.8, -1.6),  // routed far right to clear the GPU (GPU ends at X=1.5)
    new THREE.Vector3(1.7, 0.4, -1.6),   // coming straight up on the right side of the GPU
    new THREE.Vector3(1.3, 0.4, -1.7)    // plug into Motherboard right edge
  ), []);

  // 8-pin PCIe Cable (PSU to GPU)
  const curve2 = useMemo(() => new THREE.CubicBezierCurve3(
    new THREE.Vector3(-0.5, -1.8, -0.8), // near PSU
    new THREE.Vector3(0.6, -1.8, 0.3),   // routed forward and right
    new THREE.Vector3(0.6, -0.4, 0.3),   // straight up, standing in front of the GPU
    new THREE.Vector3(0.6, -0.4, -0.55)  // plugs directly into the GPU side edge horizontally
  ), []);

  // SATA Data Cable (HDD to Mobo)
  const curve3 = useMemo(() => new THREE.CubicBezierCurve3(
    new THREE.Vector3(1.3, -2.18, 0.25),  // plug into HDD front connector (facing glass)
    new THREE.Vector3(1.3, -2.18, 0.6),   // route forward towards glass
    new THREE.Vector3(1.7, -0.7, -1.7),  // route up the right side behind mobo tray
    new THREE.Vector3(1.3, -0.7, -1.7)   // plug into bottom right of mobo
  ), []);

  // SATA Power Cable (HDD to PSU)
  const curve4 = useMemo(() => new THREE.CubicBezierCurve3(
    new THREE.Vector3(1.1, -2.18, 0.25),  // plug into HDD front power connector
    new THREE.Vector3(1.1, -2.18, 0.6),   // route forward towards glass
    new THREE.Vector3(-0.5, -2.18, -0.4), // route along bottom back to PSU
    new THREE.Vector3(-0.5, -1.8, -0.8)  // plug into PSU
  ), []);

  // 8-pin CPU Power Cable (PSU to Mobo Top-Left)
  const curve5 = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.35, -1.8, -0.8),  // Out of PSU
    new THREE.Vector3(-0.35, -1.8, -1.85), // Push back behind tray/mobo
    new THREE.Vector3(-1.4, -1.8, -1.85),  // Traverse left
    new THREE.Vector3(-1.4, 0.0, -1.85),   // Up midway
    new THREE.Vector3(-1.4, 1.8, -1.85),   // Up to the top
    new THREE.Vector3(-1.4, 1.8, -1.75)    // Pop out into Mobo
  ]), []);

  const cables = useMemo(() => [curve1, curve2, curve3, curve4, curve5], [curve1, curve2, curve3, curve4, curve5]);

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
        <mesh key={`cable-${i}`}>
          <tubeGeometry 
            ref={(el) => tubeRefs.current[i] = el}
            args={[curve, 64, i === 0 ? 0.08 : i === 2 ? 0.03 : 0.05, 8, false]} 
          />
          <meshStandardMaterial 
            color={i === 2 ? "#e94560" : "#111"} 
            roughness={0.7}
            transparent={xrayMode}
            opacity={xrayMode ? 0.2 : 1}
          />
        </mesh>
      ))}
    </group>
  );
};
