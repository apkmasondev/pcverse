import { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { usePCSelection } from '../../../hooks/usePC';
import { useIsMobile } from '../../../hooks/useIsMobile';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { extrudeOpts01, extrudeOpts005, caseFrameMaterial } from '../constants';
import caseBackUrl from '../../../assets/case_back.webp';
import caseBehindUrl from '../../../assets/case_behind.webp';
import caseBottomUrl from '../../../assets/case_bottom.webp';
import caseInteriorUrl from '../../../assets/case_interior.webp';

export const CaseGeometry = ({ rgbColor, rgbEnabled }: { rgbColor: string; rgbEnabled: boolean }) => {
  const { explodeStep } = usePCSelection();
  const isMobile = useIsMobile();
  const effectiveRgbColor = rgbEnabled ? rgbColor : '#000000';
  const caseBackTexture = useTexture(caseBackUrl);
  const caseBehindTexture = useTexture(caseBehindUrl);
  const caseBottomTexture = useTexture(caseBottomUrl);
  const caseInteriorTexture = useTexture(caseInteriorUrl);

  useMemo(() => {
    // Correctly scale caseInteriorTexture for the 3.8 x 4.8 panels
    caseInteriorTexture.colorSpace = THREE.SRGBColorSpace;
    caseInteriorTexture.wrapS = THREE.ClampToEdgeWrapping;
    caseInteriorTexture.wrapT = THREE.ClampToEdgeWrapping;
    caseInteriorTexture.repeat.set(1 / 3.8, 1 / 4.8);
    caseInteriorTexture.offset.set(0.5, 0.5);
    caseInteriorTexture.center.set(0, 0); // Must be 0,0 for offset to work as UV_new = X * repeat + offset
    caseInteriorTexture.updateMatrix();
  }, [caseInteriorTexture]);

  useMemo(() => {
    caseBackTexture.colorSpace = THREE.SRGBColorSpace;
    caseBackTexture.repeat.set(1 / 3.9, 1 / 5.0);
    caseBackTexture.offset.set(1.95 / 3.9, 2.5 / 5.0);

    caseBehindTexture.colorSpace = THREE.SRGBColorSpace;
    caseBehindTexture.repeat.set(-1 / 3.8, 1 / 4.8);
    caseBehindTexture.offset.set(0.5, 0.5);

    caseBottomTexture.colorSpace = THREE.SRGBColorSpace;
    caseBottomTexture.wrapS = THREE.RepeatWrapping;
    caseBottomTexture.wrapT = THREE.RepeatWrapping;
    caseBottomTexture.repeat.set(-1 / 3.8, 1 / 3.8);
    caseBottomTexture.offset.set(0.5, 0.5);
  }, [caseBackTexture, caseBehindTexture, caseBottomTexture]);

  const sideGlassRef = useRef<THREE.Group>(null);
  const sideGlassMatRef = useRef<any>(null);
  const frontGlassRef = useRef<THREE.Group>(null);
  const frontGlassMatRef = useRef<any>(null);
  const solidSideRef = useRef<THREE.Group>(null);

  useFrame((_state, delta) => {
    if (sideGlassRef.current && sideGlassMatRef.current) {
      const targetX = explodeStep >= 1 ? 25.0 : 1.95; // Fly away off-screen
      const targetOpacity = explodeStep >= 1 ? 0 : 0.25; // fade out
      
      sideGlassRef.current.position.x = THREE.MathUtils.lerp(sideGlassRef.current.position.x, targetX, delta * 3);
      sideGlassMatRef.current.opacity = THREE.MathUtils.lerp(sideGlassMatRef.current.opacity, targetOpacity, delta * 3);
    }
    if (frontGlassRef.current && frontGlassMatRef.current) {
      const targetZ = explodeStep >= 1 ? 25.0 : 1.95;
      const targetOpacity = explodeStep >= 1 ? 0 : 0.25;
      
      frontGlassRef.current.position.z = THREE.MathUtils.lerp(frontGlassRef.current.position.z, targetZ, delta * 3);
      frontGlassMatRef.current.opacity = THREE.MathUtils.lerp(frontGlassMatRef.current.opacity, targetOpacity, delta * 3);
    }
    if (solidSideRef.current) {
      const targetX = explodeStep >= 1 ? -25.0 : 0;
      solidSideRef.current.position.x = THREE.MathUtils.lerp(solidSideRef.current.position.x, targetX, delta * 3);
    }
  });


  const leftPanelShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-1.95, -2.4);
    shape.lineTo(1.945, -2.4);
    shape.lineTo(1.945, 2.4);
    shape.lineTo(-1.95, 2.4);
    shape.lineTo(-1.95, -2.4);

    // Motherboard IO Cutout
    const ioHole = new THREE.Path();
    ioHole.moveTo(-1.55 - 0.35, 1.2 - 0.725);
    ioHole.lineTo(-1.55 + 0.35, 1.2 - 0.725);
    ioHole.lineTo(-1.55 + 0.35, 1.2 + 0.725);
    ioHole.lineTo(-1.55 - 0.35, 1.2 + 0.725);
    ioHole.lineTo(-1.55 - 0.35, 1.2 - 0.725);
    shape.holes.push(ioHole);

    // PSU Cutout
    const psuHole = new THREE.Path();
    psuHole.moveTo(-0.8 - 0.9, -1.92 - 0.45);
    psuHole.lineTo(-0.8 + 0.9, -1.92 - 0.45);
    psuHole.lineTo(-0.8 + 0.9, -1.92 + 0.5);
    psuHole.lineTo(-0.8 - 0.9, -1.92 + 0.5);
    psuHole.lineTo(-0.8 - 0.9, -1.92 - 0.45);
    shape.holes.push(psuHole);

    // GPU PCIe Brackets Cutout
    const pcieHole = new THREE.Path();
    pcieHole.moveTo(-1.15 - 0.6, -0.1 - 0.85); // Extended downwards (from -0.25 to -0.85)
    pcieHole.lineTo(-1.15 + 0.6, -0.1 - 0.85); // Extended downwards
    pcieHole.lineTo(-1.15 + 0.6, -0.1 + 0.25);
    pcieHole.lineTo(-1.15 - 0.6, -0.1 + 0.25);
    pcieHole.lineTo(-1.15 - 0.6, -0.1 - 0.85); // Extended downwards
    shape.holes.push(pcieHole);

    // Side Exhaust Fans Hole (covers both fans)
    const fanHole = new THREE.Path();
    fanHole.moveTo(-1.0, 1.4 - 0.6);
    fanHole.lineTo(1.4, 1.4 - 0.6);
    fanHole.lineTo(1.4, 1.4 + 0.6);
    fanHole.lineTo(-1.0, 1.4 + 0.6);
    fanHole.lineTo(-1.0, 1.4 - 0.6);
    shape.holes.push(fanHole);

    return shape;
  }, []);

  const backPanelShape = useMemo(() => {
    const shape = new THREE.Shape();
    // Outer boundary (Counter-clockwise)
    shape.moveTo(-1.97, -2.4);
    shape.lineTo(1.97, -2.4);
    shape.lineTo(1.97, 2.4);
    shape.lineTo(-1.97, 2.4);
    shape.lineTo(-1.97, -2.4);

    const addHole = (x1: number, y1: number, x2: number, y2: number) => {
      const hole = new THREE.Path();
      hole.moveTo(x1, y1);
      hole.lineTo(x1, y2);
      hole.lineTo(x2, y2);
      hole.lineTo(x2, y1);
      hole.lineTo(x1, y1);
      shape.holes.push(hole);
    };

    // CPU Backplate Mesh Cutout
    addHole(-1.15, 0.30, 0.25, 1.70);
    // PSU Cutout (Back panel)
    addHole(-0.73, -2.38, 0.73, -1.52);
    return shape;
  }, []);

  const moboTrayShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-1.97, -2.4);
    shape.lineTo(1.97, -2.4);
    shape.lineTo(1.97, 2.4);
    shape.lineTo(-1.97, 2.4);
    shape.lineTo(-1.97, -2.4);

    const addHole = (x1: number, y1: number, x2: number, y2: number) => {
      const hole = new THREE.Path();
      hole.moveTo(x1, y1);
      hole.lineTo(x1, y2);
      hole.lineTo(x2, y2);
      hole.lineTo(x2, y1);
      hole.lineTo(x1, y1);
      shape.holes.push(hole);
    };

    // Real hole for CPU Cooler Backplate
    addHole(-1.15, 0.30, 0.25, 1.70);

    // Real hole for PSU Back panel (allows transparency from inside)
    addHole(-0.73, -2.38, 0.73, -1.52);

    // Real holes for side cable routing
    addHole(1.25, -1.3, 1.55, -0.7);
    addHole(1.25, -0.3, 1.55, 0.3);
    addHole(1.25, 0.7, 1.55, 1.3);

    // Real holes for top/bottom routing
    addHole(-1.1, 2.0, -0.5, 2.2);
    addHole(0.2, 2.0, 0.8, 2.2);

    return shape;
  }, []);

  const frontPanelShape = useMemo(() => {
    const shape = new THREE.Shape();
    // Front Glass bounds
    shape.moveTo(-1.95, -2.42);
    shape.lineTo(1.95, -2.42);
    shape.lineTo(1.95, 2.42);
    shape.lineTo(-1.95, 2.42);
    shape.lineTo(-1.95, -2.42);

    // Pill-shaped Hole for Fans (Clockwise path)
    const hole = new THREE.Path();
    const x = 0.8;
    const y1 = -0.8;
    const y2 = 0.8;
    const radius = 0.62;

    hole.moveTo(x - radius, y2);
    hole.absarc(x, y2, radius, Math.PI, 0, true); // Top semicircle (CW)
    hole.lineTo(x + radius, y1);
    hole.absarc(x, y1, radius, Math.PI * 2, Math.PI, true); // Bottom semicircle (CW)
    hole.lineTo(x - radius, y2);
    shape.holes.push(hole);

    return shape;
  }, []);

  const frontFrameShape = useMemo(() => {
    const shape = new THREE.Shape();
    const x = 0.8;
    const y1 = -0.8;
    const y2 = 0.8;
    const outerRadius = 0.65;
    const innerRadius = 0.59;

    // Outer edge (Counter-clockwise path)
    shape.moveTo(x - outerRadius, y1);
    shape.absarc(x, y1, outerRadius, Math.PI, Math.PI * 2, false); // Bottom semicircle (CCW)
    shape.lineTo(x + outerRadius, y2);
    shape.absarc(x, y2, outerRadius, 0, Math.PI, false); // Top semicircle (CCW)
    shape.lineTo(x - outerRadius, y1);

    // Inner hole (Clockwise path)
    const hole = new THREE.Path();
    hole.moveTo(x - innerRadius, y2);
    hole.absarc(x, y2, innerRadius, Math.PI, 0, true); // Top semicircle (CW)
    hole.lineTo(x + innerRadius, y1);
    hole.absarc(x, y1, innerRadius, Math.PI * 2, Math.PI, true); // Bottom semicircle (CW)
    hole.lineTo(x - innerRadius, y2);
    shape.holes.push(hole);

    return shape;
  }, []);

  const frontMeshShape = useMemo(() => {
    const shape = new THREE.Shape();
    const x = 0.8;
    const y1 = -0.8;
    const y2 = 0.8;
    const radius = 0.6; // Slightly larger than innerRadius to avoid gaps

    // Outer edge (Counter-clockwise path)
    shape.moveTo(x - radius, y1);
    shape.absarc(x, y1, radius, Math.PI, Math.PI * 2, false); // Bottom semicircle (CCW)
    shape.lineTo(x + radius, y2);
    shape.absarc(x, y2, radius, 0, Math.PI, false); // Top semicircle (CCW)
    shape.lineTo(x - radius, y1);

    return shape;
  }, []);


    const topFrameShape = useMemo(() => {
      const shape = new THREE.Shape();
      // Outer border 4.0 x 4.0
      shape.moveTo(-2.0, -2.0);
      shape.lineTo(2.0, -2.0);
      shape.lineTo(2.0, 2.0);
      shape.lineTo(-2.0, 2.0);
      shape.lineTo(-2.0, -2.0);

      // Hole for the mesh (0.2 width on each side)
      const hole = new THREE.Path();
      hole.moveTo(-1.8, -1.8);
      hole.lineTo(-1.8, 1.8);
      hole.lineTo(1.8, 1.8);
      hole.lineTo(1.8, -1.8);
      hole.lineTo(-1.8, -1.8);
      shape.holes.push(hole);

      return shape;
    }, []);

  const bottomPanelShape = useMemo(() => {
    const shape = new THREE.Shape();
    // Local Y maps to -Z. Size 3.8 x 3.8.
    shape.moveTo(-1.97, -1.97);
    shape.lineTo(1.97, -1.97);
    shape.lineTo(1.97, 1.97);
    shape.lineTo(-1.97, 1.97);
    shape.lineTo(-1.97, -1.97);

      const addHole = (x1: number, y1: number, x2: number, y2: number) => {
      const hole = new THREE.Path();
      hole.moveTo(x1, y1);
      hole.lineTo(x1, y2);
      hole.lineTo(x2, y2);
      hole.lineTo(x2, y1);
      hole.lineTo(x1, y1);
      shape.holes.push(hole);
    };

    // PSU Bottom Ventilation Hole (centered at X=-1.2, local Y=0.8, size 1.4x1.4)
    addHole(-1.90, 0.1, -0.5, 1.5);

    return shape;
  }, []);

  const meshTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff'; 
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = '#000000';
      
      const drawDot = (x: number, y: number) => {
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.fill();
      };
      
      // Staggered honeycomb-like dot pattern
      drawDot(8, 8);
      drawDot(24, 8);
      drawDot(16, 24);
      drawDot(0, 24);
      drawDot(32, 24);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(20, 20); // Scale the mesh grill for the top
    return texture;
  }, []);

  const backMeshTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff'; 
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = '#000000';
      
      const drawDot = (x: number, y: number) => {
        ctx.beginPath();
        ctx.arc(x, y, 6.5, 0, Math.PI * 2);
        ctx.fill();
      };
      
      // Same pattern, slightly different hole size for exhaust
      drawDot(8, 8);
      drawDot(24, 8);
      drawDot(16, 24);
      drawDot(0, 24);
      drawDot(32, 24);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 8); // Less dense for back/side panels
    return texture;
  }, []);

  const frontMeshTexture = useMemo(() => {
    const texture = backMeshTexture.clone();
    texture.repeat.set(5, 10); // Scaled for the tall pill shape
    texture.needsUpdate = true;
    return texture;
  }, [backMeshTexture]);

  useEffect(() => {
    return () => {
      meshTexture.dispose();
      backMeshTexture.dispose();
      frontMeshTexture.dispose();
    };
  }, [meshTexture, backMeshTexture, frontMeshTexture]);

  return (
    <group>
      {/* Back Panel (Solid metal frame with Motherboard/PSU cutout locations) */}
      <mesh position={[0, 0, -2.0]}>
        <extrudeGeometry args={[backPanelShape, extrudeOpts01]} />
        <meshStandardMaterial color="#4a4d54" metalness={0.85} roughness={0.3} />
      </mesh>
      {/* Back Panel Texture */}
      <mesh position={[0, 0, -2.001]} rotation={[0, 0, 0]}>
        <shapeGeometry args={[backPanelShape]} />
        <meshStandardMaterial map={caseBehindTexture} metalness={0.4} roughness={0.6} side={THREE.BackSide} />
      </mesh>
      {/* Back Panel Texture (Inside, facing Motherboard) */}
      <mesh position={[0, 0, -1.899]}>
        <shapeGeometry args={[backPanelShape]} />
        <meshStandardMaterial map={caseInteriorTexture} metalness={0.5} roughness={0.7} />
      </mesh>
      
      {/* GPU PCIe Brackets at the left wall (Shifted to X = -1.98) */}
      {[-0.55, -0.7, -0.85, -1.0, -1.15, -1.3].map((y, i) => (
        <group key={i}>
          <mesh position={[-1.97, y, -1.15]}>
            <boxGeometry args={[0.04, 0.14, 1.2]} />
            <meshStandardMaterial color="#2a2c30" metalness={0.9} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* Top Panel (Solid Frame) */}
      <mesh position={[0, 2.50, 0]} rotation={[Math.PI / 2, 0, 0]} material={caseFrameMaterial}>
        <extrudeGeometry args={[topFrameShape, extrudeOpts01]} />
      </mesh>

      {/* Top Panel (Mesh grill inside the frame) */}
      <mesh position={[0, 2.45, 0]}>
        <boxGeometry args={[3.6, 0.02, 3.6]} />
        <meshStandardMaterial 
          alphaMap={meshTexture} 
          transparent={true} 
          color="#4a4d54"
          metalness={0.8}
          roughness={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* PSU Back panel with honeycomb mesh cutout */}
      <mesh position={[0, -1.95, -2.01]}>
        <planeGeometry args={[1.5, 0.9]} />
        <meshStandardMaterial 
          color="#4a4d54" 
          roughness={0.3} 
          metalness={0.85} 
          alphaMap={backMeshTexture} 
          transparent={true} 
          side={THREE.DoubleSide} 
        />
      </mesh>

      {/* Bottom Panel with PSU ventilation cutout */}
      <group position={[0, -2.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh material={caseFrameMaterial}>
          <extrudeGeometry args={[bottomPanelShape, extrudeOpts01]} />
        </mesh>
        {/* Bottom Panel Texture (Outside) */}
        <mesh position={[0, 0, -0.001]} rotation={[0, 0, 0]}>
          <shapeGeometry args={[bottomPanelShape]} />
          <meshStandardMaterial map={caseBottomTexture} metalness={0.5} roughness={0.7} side={THREE.BackSide} />
        </mesh>
        {/* Bottom Panel Texture (Inside) */}
        <mesh position={[0, 0, 0.101]} rotation={[0, 0, 0]}>
          <shapeGeometry args={[bottomPanelShape]} />
          <meshStandardMaterial map={caseBottomTexture} metalness={0.5} roughness={0.7} />
        </mesh>
      </group>
      {/* Case Feet (Rubberized) */}
      {[-1.8, 1.8].map(x => (
        [-1.8, 1.8].map(z => (
          <mesh key={`foot-${x}-${z}`} position={[x, -2.52, z]}>
            <cylinderGeometry args={[0.08, 0.06, 0.04, 16]} />
            <meshStandardMaterial color="#111" roughness={0.9} metalness={0.1} />
          </mesh>
        ))
      ))}

      {/* Front IO / Power Button */}
      <group position={[1.6, 2.51, 1.7]}>
        {/* Power Button Base */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.02, 32]} />
          <meshStandardMaterial color="#2a2c30" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Power Button RGB Ring */}
        <mesh position={[0, 0.011, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.06, 0.005, 16, 32]} />
          <meshStandardMaterial color={effectiveRgbColor} emissive={effectiveRgbColor} emissiveIntensity={2} toneMapped={false} />
        </mesh>
        {/* Power Button Inner */}
        <mesh position={[0, 0.012, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.01, 32]} />
          <meshStandardMaterial color="#1a1c22" metalness={0.8} roughness={0.4} />
        </mesh>
        
        {/* USB Ports */}
        {[-0.2, -0.4].map(xOffset => (
          <mesh key={`usb-${xOffset}`} position={[xOffset, -0.005, 0]}>
            <boxGeometry args={[0.04, 0.01, 0.12]} />
            <meshStandardMaterial color="#111" roughness={0.8} />
          </mesh>
        ))}
      </group>

      {/* PSU Bottom Ventilation Mesh (Visible from below) */}
      <mesh position={[-1.2, -2.51, -0.8]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.45, 1.45]} />
        <meshStandardMaterial 
          color="#1e1e24"
          roughness={0.3}
          metalness={0.85}
          alphaMap={backMeshTexture} 
          transparent={true} 
          side={THREE.DoubleSide} 
        />
      </mesh>
      {/* PSU Bottom Ventilation Mesh (Visible from inside case) */}
      <mesh position={[-1.2, -2.39, -0.8]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.45, 1.45]} />
        <meshStandardMaterial 
          color="#151515" 
          alphaMap={backMeshTexture} 
          transparent={true} 
          side={THREE.DoubleSide} 
        />
      </mesh>
      
      {/* Motherboard Tray with Standoffs (Gwinty) and Routing Holes */}
      <group position={[0, 0, -1.825]}>
        {/* Main Tray */}
        <mesh>
          <extrudeGeometry args={[moboTrayShape, extrudeOpts005]} />
          <meshStandardMaterial color="#111" roughness={0.6} />
        </mesh>
        {/* Motherboard Tray Texture */}
        <mesh position={[0, 0, 0.051]}>
          <shapeGeometry args={[moboTrayShape]} />
          <meshStandardMaterial map={caseInteriorTexture} metalness={0.5} roughness={0.7} />
        </mesh>
        
        {/* Raised Standoffs (Gwinty) for Motherboard */}
        {[-1.3, -0.45, 0.4].map((x, i) => (
          [-1.85, 0, 1.85].map((y, j) => (
            <mesh key={`standoff-${i}-${j}`} position={[x, y, 0.035]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 0.07, 16]} />
              <meshStandardMaterial color="#b87333" metalness={0.8} roughness={0.4} />
            </mesh>
          ))
        ))}
        
        {/* Cable Routing Rubber Grommets */}
        {[-1.0, 0, 1.0].map((y, i) => (
          <mesh key={`grommet-${i}`} position={[1.4, y, 0.03]}>
            <boxGeometry args={[0.3, 0.6, 0.06]} />
            <meshStandardMaterial color="#050505" roughness={0.9} />
          </mesh>
        ))}
        {/* Top/Bottom Cable Routing Cutouts */}
        {[-0.8, 0.5].map((x, i) => (
          <mesh key={`grommet-top-${i}`} position={[x, 2.1, 0.03]}>
            <boxGeometry args={[0.6, 0.2, 0.06]} />
            <meshStandardMaterial color="#050505" roughness={0.9} />
          </mesh>
        ))}
      </group>

      {/* CPU Cooler Backplate Mesh Cutout (on the Back Panel, directly behind the CPU) */}
      <mesh position={[-0.45, 1.0, -2.01]}>
        <planeGeometry args={[1.4, 1.4]} />
        <meshStandardMaterial 
          color="#151515" 
          alphaMap={backMeshTexture} 
          transparent={true} 
          side={THREE.DoubleSide} 
        />
      </mesh>

      {/* Front Panel - Glass with Frame */}
      <group position={[0, 0, 1.95]} ref={frontGlassRef as any}>
        <mesh position={[0, 0, -0.01]}>
          <extrudeGeometry args={[frontPanelShape, { depth: 0.02, bevelEnabled: false }]} />
          {isMobile ? (
            <meshStandardMaterial ref={frontGlassMatRef} color="#c7d2fe" transparent={true} opacity={0.3} roughness={0.1} metalness={0.5} />
          ) : (
            <meshPhysicalMaterial 
              ref={frontGlassMatRef}
              color="#c7d2fe" metalness={0.1} roughness={0.05} 
              transmission={1.0} thickness={1.5} transparent={true} opacity={1.0}
              ior={1.5} clearcoat={1.0} clearcoatRoughness={0.05}
            />
          )}
        </mesh>
        
        {/* Metal Frame for Fans */}
        <mesh position={[0, 0, -0.015]}>
          <extrudeGeometry args={[frontFrameShape, { depth: 0.03, bevelEnabled: false }]} />
          <meshStandardMaterial color="#2a2c30" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Mesh Filter inside Frame */}
        <mesh position={[0, 0, 0]}>
          <shapeGeometry args={[frontMeshShape]} />
          <meshStandardMaterial 
            color="#151515" 
            alphaMap={frontMeshTexture} 
            transparent={true} 
            side={THREE.DoubleSide} 
            metalness={0.8}
            roughness={0.3}
          />
        </mesh>
        
        {/* Glass Frame Elements */}
        {/* Left/Right Frames (Square corner pillars perfectly flush with top/bottom panels) */}
        {[-1.95, 1.95].map(x => (
          <mesh key={`front-v-frame-${x}`} position={[x, 0, 0]} material={caseFrameMaterial}>
            <boxGeometry args={[0.1, 4.8, 0.1]} />
          </mesh>
        ))}
      </group>
      
      {/* Side Panel - Glass with Frame */}
      <group position={[1.95, 0, 0]} ref={sideGlassRef as any}>
        <mesh>
          <boxGeometry args={[0.02, 4.84, 3.84]} />
          {isMobile ? (
            <meshStandardMaterial ref={sideGlassMatRef} color="#a5f3fc" transparent={true} opacity={0.3} roughness={0.1} metalness={0.5} />
          ) : (
            <meshPhysicalMaterial 
              ref={sideGlassMatRef}
              color="#a5f3fc" metalness={0.1} roughness={0.05} 
              transmission={1.0} thickness={1.5} transparent={true} opacity={1.0}
              ior={1.5} clearcoat={1.0} clearcoatRoughness={0.05}
            />
          )}
        </mesh>
        
        {/* Glass Frame Elements */}
        {/* Frames removed: Corner coverage is handled perfectly by Front Pillars and Back Panel */}
      </group>


      
      {/* Solid Side Panel (Back) - Motherboard tray with correct IO/GPU/PSU cutouts */}
      <group ref={solidSideRef as any}>
        <group position={[-1.975, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <mesh>
            <extrudeGeometry args={[leftPanelShape, extrudeOpts005]} />
            <meshStandardMaterial color="#4a4d54" metalness={0.85} roughness={0.3} />
          </mesh>
          {/* Back Panel Texture (Outside) */}
          <mesh position={[0, 0, 0.051]}>
            <shapeGeometry args={[leftPanelShape]} />
            <meshStandardMaterial map={caseBackTexture} metalness={0.4} roughness={0.6} />
          </mesh>
          {/* Back Panel Texture (Inside) */}
          <mesh position={[0, 0, -0.001]}>
            <shapeGeometry args={[leftPanelShape]} />
            <meshStandardMaterial map={caseInteriorTexture} metalness={0.5} roughness={0.7} side={THREE.BackSide} />
          </mesh>
        </group>
        {/* Side mesh cutout where the side exhaust fans are! (Outside) */}
        <mesh position={[-1.98, 1.4, 0.2]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[2.4, 1.2]} />
          <meshStandardMaterial 
            color="#151515" 
            alphaMap={backMeshTexture} 
            transparent={true} 
            side={THREE.DoubleSide} 
          />
        </mesh>
        {/* Side mesh cutout (Inside view) */}
        <mesh position={[-1.92, 1.4, 0.2]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[2.4, 1.2]} />
          <meshStandardMaterial 
            color="#151515" 
            alphaMap={backMeshTexture} 
            transparent={true} 
            side={THREE.DoubleSide} 
          />
        </mesh>
      </group>

      {/* Frame Posts */}
      {[1.95, -1.95].map(x => (
        [1.95, -1.95].map(z => (
          <mesh key={`${x}-${z}`} position={[x, 0, z]}>
            <boxGeometry args={[0.1, 4.8, 0.1]} />
            <meshStandardMaterial color="#3a3d42" metalness={0.8} roughness={0.3} />
          </mesh>
        ))
      ))}
      
      {/* Internal Premium RGB Ambient Lighting */}
      <pointLight 
        position={[0, 1.2, -0.8]} 
        intensity={3.0} 
        distance={6} 
        color="#6366f1" 
        decay={1.8}
      />
      <pointLight 
        position={[0, -0.8, -0.6]} 
        intensity={2.5} 
        distance={5} 
        color="#ec4899" 
        decay={1.8}
      />
    </group>
  );
};
