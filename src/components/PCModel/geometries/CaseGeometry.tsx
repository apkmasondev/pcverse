import * as THREE from 'three';
import { BackSide, CanvasTexture, ClampToEdgeWrapping, DoubleSide, RepeatWrapping, SRGBColorSpace, MeshStandardMaterial } from 'three';
import { materials } from '../materials';
import { useMemo, useEffect } from 'react';
import { usePCView } from '../../../hooks/usePC';

import { useTexture } from '@react-three/drei';
import { extrudeOpts01, extrudeOpts005 } from '../constants';
import caseBackUrl from '../../../assets/case_back.webp';
import caseBehindUrl from '../../../assets/case_behind.webp';
import caseBottomUrl from '../../../assets/case_bottom.webp';
import caseInteriorUrl from '../../../assets/case_interior.webp';


import { XMesh as Mesh } from './XMesh';
import { CasePanels } from './CasePanels';
import {
  backPanelShape,
  moboTrayShape,
  topFrameShape,
  bottomPanelShape
} from './CaseShapes';


export const CaseGeometry = ({ rgbColor, rgbEnabled }: { rgbColor: string; rgbEnabled?: boolean }) => {
  const { xrayMode } = usePCView();
  const effectiveRgbColor = rgbEnabled ? rgbColor : '#000000';
  const caseBackTexture = useTexture(caseBackUrl);
  const caseBehindTexture = useTexture(caseBehindUrl);
  const caseBottomTexture = useTexture(caseBottomUrl);
  const caseInteriorTexture = useTexture(caseInteriorUrl);

  useMemo(() => {
    // Correctly scale caseInteriorTexture for the 3.8 x 4.8 panels
    caseInteriorTexture.colorSpace = SRGBColorSpace;
    caseInteriorTexture.wrapS = ClampToEdgeWrapping;
    caseInteriorTexture.wrapT = ClampToEdgeWrapping;
    caseInteriorTexture.repeat.set(1 / 3.8, 1 / 4.8);
    caseInteriorTexture.offset.set(0.5, 0.5);
    caseInteriorTexture.center.set(0, 0); // Must be 0,0 for offset to work as UV_new = X * repeat + offset
    caseInteriorTexture.updateMatrix();
  }, [caseInteriorTexture]);

  useMemo(() => {
    caseBackTexture.colorSpace = SRGBColorSpace;
    caseBackTexture.repeat.set(1 / 3.9, 1 / 5.0);
    caseBackTexture.offset.set(1.95 / 3.9, 2.5 / 5.0);

    caseBehindTexture.colorSpace = SRGBColorSpace;
    caseBehindTexture.repeat.set(-1 / 3.8, 1 / 4.8);
    caseBehindTexture.offset.set(0.5, 0.5);

    caseBottomTexture.colorSpace = SRGBColorSpace;
    caseBottomTexture.wrapS = RepeatWrapping;
    caseBottomTexture.wrapT = RepeatWrapping;
    caseBottomTexture.repeat.set(-1 / 3.8, 1 / 3.8);
    caseBottomTexture.offset.set(0.5, 0.5);
  }, [caseBackTexture, caseBehindTexture, caseBottomTexture]);






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
    const texture = new CanvasTexture(canvas);
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
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
    const texture = new CanvasTexture(canvas);
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
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
    if (import.meta.env.DEV) return;
    return () => {
      meshTexture.dispose();
      backMeshTexture.dispose();
      frontMeshTexture.dispose();
    };
  }, [meshTexture, backMeshTexture, frontMeshTexture]);

  const rgbMaterial = useMemo(() => new MeshStandardMaterial({ emissiveIntensity: 2, toneMapped: false }), []);
  useEffect(() => {
    rgbMaterial.color.set(effectiveRgbColor);
    rgbMaterial.emissive.set(effectiveRgbColor);
  }, [effectiveRgbColor, rgbMaterial]);
  useEffect(() => {
    return () => rgbMaterial.dispose();
  }, [rgbMaterial]);

  const texturedMaterials = useMemo(() => ({
    texMat0: new THREE.MeshStandardMaterial({ map: caseBehindTexture, metalness: 0.4, roughness: 0.6, side: BackSide }),
    texMat1: new THREE.MeshStandardMaterial({ map: caseInteriorTexture, metalness: 0.5, roughness: 0.7 }),
    texMat2: new THREE.MeshStandardMaterial({ map: caseBottomTexture, metalness: 0.5, roughness: 0.7, side: BackSide }),
    texMat3: new THREE.MeshStandardMaterial({ map: caseBottomTexture, metalness: 0.5, roughness: 0.7 }),
    texMat4: new THREE.MeshStandardMaterial({ map: caseInteriorTexture, metalness: 0.5, roughness: 0.7 })
  }), [caseBehindTexture, caseBottomTexture, caseInteriorTexture]);

  useEffect(() => {
    return () => {
      Object.values(texturedMaterials).forEach(mat => mat.dispose());
    };
  }, [texturedMaterials]);

  return (
    <group>
      {/* Back Panel (Solid metal frame with Motherboard/PSU cutout locations) */}
      <Mesh position={[0, 0, -2.0]}>
        <extrudeGeometry args={[backPanelShape, extrudeOpts01]} />
        <primitive object={materials.grayMetal} attach="material" />
      </Mesh>
      {/* Back Panel Texture */}
      <Mesh position={[0, 0, -2.001]} rotation={[0, 0, 0]}>
        <shapeGeometry args={[backPanelShape]} />
        <primitive object={texturedMaterials.texMat0} />
      </Mesh>
      {/* Back Panel Texture (Inside, facing Motherboard) */}
      <Mesh position={[0, 0, -1.899]}>
        <shapeGeometry args={[backPanelShape]} />
        <primitive object={texturedMaterials.texMat1} />
      </Mesh>
      


      {/* Top Panel (Solid Frame) */}
      <Mesh position={[0, 2.50, 0]} rotation={[Math.PI / 2, 0, 0]} material={materials.caseFrame}>
        <extrudeGeometry args={[topFrameShape, extrudeOpts01]} />
      </Mesh>

      {/* Top Panel (Mesh grill inside the frame) */}
      <Mesh position={[0, 2.45, 0]} raycast={() => null}>
        <boxGeometry args={[3.6, 0.02, 3.6]} />
        <meshStandardMaterial 
          alphaMap={meshTexture} 
          transparent={true} 
          color="#4a4d54"
          metalness={0.8}
          roughness={0.3}
          side={DoubleSide}
        />
      </Mesh>

      {/* PSU Back panel with honeycomb mesh cutout */}
      <Mesh position={[0, -1.91, -2.01]} raycast={() => null}>
        <planeGeometry args={[1.5, 0.78]} />
        <meshStandardMaterial 
          color="#4a4d54" 
          roughness={0.3} 
          metalness={0.85} 
          alphaMap={backMeshTexture} 
          transparent={true} 
          side={DoubleSide} 
        />
      </Mesh>

      {/* Bottom Panel with PSU ventilation cutout */}
      <group position={[0, -2.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <Mesh material={materials.caseFrame}>
          <extrudeGeometry args={[bottomPanelShape, extrudeOpts01]} />
        </Mesh>
        {/* Bottom Panel Texture (Outside) */}
        <Mesh position={[0, 0, -0.001]} rotation={[0, 0, 0]}>
          <shapeGeometry args={[bottomPanelShape]} />
          <primitive object={texturedMaterials.texMat2} />
        </Mesh>
        {/* Bottom Panel Texture (Inside) */}
        <Mesh position={[0, 0, 0.101]} rotation={[0, 0, 0]}>
          <shapeGeometry args={[bottomPanelShape]} />
          <primitive object={texturedMaterials.texMat3} />
        </Mesh>
      </group>
      {/* Case Feet (Rubberized) */}
      {[-1.8, 1.8].flatMap((x, i) => (
        [-1.8, 1.8].map((z, j) => (
          <Mesh key={`foot-${i}-${j}`} position={[x, -2.42, z]}>
            <cylinderGeometry args={[0.08, 0.06, 0.04, 16]} />
            <primitive object={materials.veryDarkGray} attach="material" />
          </Mesh>
        ))
      ))}

      {/* Front IO / Power Button */}
      <group position={[1.6, 2.51, 1.7]}>
        {/* Power Button Base */}
        <Mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.02, 32]} />
          <primitive object={materials.caseFrame} attach="material" />
        </Mesh>
        {/* Power Button RGB Ring */}
        <Mesh position={[0, 0.011, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.06, 0.005, 16, 32]} />
          <primitive object={rgbMaterial} attach="material" />
        </Mesh>
        {/* Power Button Inner */}
        <Mesh position={[0, 0.012, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.01, 32]} />
          <primitive object={materials.darkShinyMetal} attach="material" />
        </Mesh>
        
        {/* USB Ports */}
        {[-0.2, -0.4].map(xOffset => (
          <Mesh key={`usb-${xOffset}`} position={[xOffset, -0.005, 0]}>
            <boxGeometry args={[0.04, 0.01, 0.12]} />
            <primitive object={materials.veryDarkGray} attach="material" />
          </Mesh>
        ))}
      </group>

      {/* PSU Bottom Ventilation Mesh (Visible from below) */}
      <Mesh position={[-1.2, -2.405, -0.8]} rotation={[Math.PI / 2, 0, 0]} raycast={() => null}>
        <planeGeometry args={[1.45, 1.45]} />
        <meshStandardMaterial 
          color="#1e1e24"
          roughness={0.3}
          metalness={0.85}
          alphaMap={backMeshTexture} 
          transparent={true} 
          side={DoubleSide} 
        />
      </Mesh>
      {/* PSU Bottom Ventilation Mesh (Visible from inside case) */}
      <Mesh position={[-1.2, -2.39, -0.8]} rotation={[Math.PI / 2, 0, 0]} raycast={() => null}>
        <planeGeometry args={[1.45, 1.45]} />
        <meshStandardMaterial 
          color="#151515" 
          alphaMap={backMeshTexture} 
          transparent={true} 
          side={DoubleSide} 
        />
      </Mesh>
      
      {/* Motherboard Tray with Standoffs (Gwinty) and Routing Holes */}
      <group position={[0, 0, -1.825]}>
        {/* Main Tray */}
        <Mesh>
          <extrudeGeometry args={[moboTrayShape, extrudeOpts005]} />
          <primitive object={materials.darkMetal} attach="material" />
        </Mesh>
        {/* Motherboard Tray Texture */}
        <Mesh position={[0, 0, 0.051]}>
          <shapeGeometry args={[moboTrayShape]} />
          <primitive object={texturedMaterials.texMat4} />
        </Mesh>
        
        {/* Raised Standoffs (Gwinty) for Motherboard */}
        {[-1.3, -0.45, 0.4].flatMap((x, i) => (
          [-1.85, 0, 1.85].map((y, j) => (
            <Mesh key={`standoff-${i}-${j}`} position={[x, y, 0.035]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 0.07, 16]} />
              <primitive object={materials.copper} attach="material" />
            </Mesh>
          ))
        ))}
        
        {/* Cable Routing Rubber Grommets */}
        {[-1.0, 0, 1.0].map((y, i) => (
          <Mesh key={`grommet-${i}`} position={[1.4, y, 0.03]}>
            <boxGeometry args={[0.3, 0.6, 0.06]} />
            <primitive object={materials.almostBlack} attach="material" />
          </Mesh>
        ))}
        {/* Top/Bottom Cable Routing Cutouts */}
        {[-0.8, 0.5].map((x, i) => (
          <Mesh key={`grommet-top-${i}`} position={[x, 2.1, 0.03]}>
            <boxGeometry args={[0.6, 0.2, 0.06]} />
            <primitive object={materials.almostBlack} attach="material" />
          </Mesh>
        ))}
      </group>

      {/* CPU Cooler Backplate Mesh Cutout (on the Back Panel, directly behind the CPU) */}
      <Mesh position={[-0.45, 1.0, -2.01]} raycast={() => null}>
        <planeGeometry args={[1.4, 1.4]} />
        <meshStandardMaterial 
          color="#151515" 
          alphaMap={backMeshTexture} 
          transparent={true} 
          side={DoubleSide} 
        />
      </Mesh>

      <CasePanels 
        frontMeshTexture={frontMeshTexture} 
        caseBackTexture={caseBackTexture} 
        caseInteriorTexture={caseInteriorTexture} 
        backMeshTexture={backMeshTexture} 
      />

      {/* Frame Posts */}
      {[1.95, -1.95].flatMap((x, i) => (
        [1.95, -1.95].map((z, j) => (
          <Mesh key={`frame-${i}-${j}`} position={[x, 0, z]}>
            <boxGeometry args={[0.1, 4.8, 0.1]} />
            <primitive object={materials.darkGrayMetal} attach="material" />
          </Mesh>
        ))
      ))}
      
      {/* Internal Premium RGB Ambient Lighting - hide in X-Ray mode */}
      {!xrayMode && (
        <>
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
        </>
      )}
    </group>
  );
};
