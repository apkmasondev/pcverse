import { BackSide, CanvasTexture, DoubleSide, Group, MathUtils, Texture, RepeatWrapping, MeshStandardMaterial } from 'three';
import { useRef, useMemo } from 'react';

import { useFrame } from '@react-three/fiber';
import { usePCSelection, usePCSettings } from '../../../hooks/usePC';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { Instances, Instance } from '@react-three/drei';
import { XMesh as Mesh } from './XMesh';
import { frontPanelShape, frontFrameShape, frontMeshShape, leftPanelShape } from './CaseShapes';
import { caseFrameMaterial, extrudeOpts005 } from '../constants';
import { materials, xrayMaterial } from '../materials';
import bracketUrl from '../../../assets/bracket.webp';
import { useTexture } from '@react-three/drei';

export const CasePanels = ({
  frontMeshTexture,
  caseBackTexture,
  caseInteriorTexture,
  backMeshTexture
}: {
  frontMeshTexture: CanvasTexture;
  caseBackTexture: Texture;
  caseInteriorTexture: Texture;
  backMeshTexture: CanvasTexture;
}) => {
  const { xrayMode } = usePCSettings();
  const { explodeStep } = usePCSelection();
  const isMobile = useIsMobile();
  const bracketTexture = useTexture(bracketUrl);

  const bracketMaterials = useMemo(() => {
    const flippedTexture = bracketTexture.clone();
    flippedTexture.wrapS = RepeatWrapping;
    flippedTexture.repeat.set(-1, 1);
    flippedTexture.center.set(0.5, 0.5);
    flippedTexture.needsUpdate = true;

    const mat = new MeshStandardMaterial({ map: bracketTexture, metalness: 0.6, roughness: 0.4 });
    const matFlipped = new MeshStandardMaterial({ map: flippedTexture, metalness: 0.6, roughness: 0.4 });
    
    // BoxGeometry faces: right (+x - inside), left (-x - outside), top, bottom, front, back
    return [matFlipped, mat, mat, mat, mat, mat];
  }, [bracketTexture]);

  const sideGlassRef = useRef<Group>(null);
  const sideGlassMatRef = useRef<any>(null);
  const frontGlassRef = useRef<Group>(null);
  const frontGlassMatRef = useRef<any>(null);
  const solidSideRef = useRef<Group>(null);

  useFrame((_state, delta) => {
    const FLY_DIST = 50.0;
    const HIDE_THRESHOLD = 35.0;

    if (sideGlassRef.current && sideGlassMatRef.current) {
      const targetX = explodeStep >= 1 ? FLY_DIST : 1.95; 
      const targetOpacity = explodeStep >= 1 ? 0 : 0.25; 
      
      if (Math.abs(sideGlassRef.current.position.x - targetX) < 0.005) {
        sideGlassRef.current.position.x = targetX;
        sideGlassMatRef.current.opacity = targetOpacity;
      } else {
        sideGlassRef.current.position.x = MathUtils.lerp(sideGlassRef.current.position.x, targetX, delta * 2.5);
        sideGlassMatRef.current.opacity = MathUtils.lerp(sideGlassMatRef.current.opacity, targetOpacity, delta * 2.5);
      }
      
      sideGlassRef.current.visible = !(explodeStep >= 1 && sideGlassRef.current.position.x > HIDE_THRESHOLD);
    }
    
    if (frontGlassRef.current && frontGlassMatRef.current) {
      const targetZ = explodeStep >= 1 ? FLY_DIST : 1.95;
      const targetOpacity = explodeStep >= 1 ? 0 : 0.25;
      
      if (Math.abs(frontGlassRef.current.position.z - targetZ) < 0.005) {
        frontGlassRef.current.position.z = targetZ;
        frontGlassMatRef.current.opacity = targetOpacity;
      } else {
        frontGlassRef.current.position.z = MathUtils.lerp(frontGlassRef.current.position.z, targetZ, delta * 2.5);
        frontGlassMatRef.current.opacity = MathUtils.lerp(frontGlassMatRef.current.opacity, targetOpacity, delta * 2.5);
      }

      frontGlassRef.current.visible = !(explodeStep >= 1 && frontGlassRef.current.position.z > HIDE_THRESHOLD);
    }
    
    if (solidSideRef.current) {
      const targetX = explodeStep >= 1 ? -FLY_DIST : 0;
      if (Math.abs(solidSideRef.current.position.x - targetX) < 0.005) {
        solidSideRef.current.position.x = targetX;
      } else {
        solidSideRef.current.position.x = MathUtils.lerp(solidSideRef.current.position.x, targetX, delta * 2.5);
      }

      solidSideRef.current.visible = !(explodeStep >= 1 && solidSideRef.current.position.x < -HIDE_THRESHOLD);
    }
  });

  return (
    <>
      {!xrayMode && (
      <group position={[0, 0, 1.95]} ref={frontGlassRef as any}>
        <Mesh position={[0, 0, -0.01]}>
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
        </Mesh>
        
        <Mesh position={[0, 0, -0.015]}>
          <extrudeGeometry args={[frontFrameShape, { depth: 0.03, bevelEnabled: false }]} />
          <primitive object={materials.caseFrame} attach="material" />
        </Mesh>

        <Mesh position={[0, 0, 0]}>
          <shapeGeometry args={[frontMeshShape]} />
          <meshStandardMaterial 
            color="#151515" 
            alphaMap={frontMeshTexture} 
            transparent={true} 
            side={DoubleSide} 
            metalness={0.8}
            roughness={0.3}
          />
        </Mesh>
        
        {[-1.95, 1.95].map(x => (
          <Mesh key={`front-v-frame-${x}`} position={[x, 0, 0]} material={caseFrameMaterial}>
            <boxGeometry args={[0.1, 4.8, 0.1]} />
          </Mesh>
        ))}

        <Instances limit={4}>
          <cylinderGeometry args={[0.05, 0.05, 0.04, 16]} />
          <primitive object={materials.darkMetal} attach="material" />
          {[-1.85, 1.85].map((x, i) => (
            [-2.3, 2.3].map((y, j) => (
              <Instance key={`front-screw-${i}-${j}`} position={[x, y, 0.02]} rotation={[Math.PI / 2, 0, 0]} />
            ))
          ))}
        </Instances>
      </group>
      )}
      
      {!xrayMode && (
      <group position={[1.95, 0, 0]} ref={sideGlassRef as any}>
        <Mesh>
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
        </Mesh>
        
        <Instances limit={4}>
          <cylinderGeometry args={[0.05, 0.05, 0.04, 16]} />
          <primitive object={materials.darkMetal} attach="material" />
          {[-2.3, 2.3].map((y, i) => (
            [-1.8, 1.8].map((z, j) => (
              <Instance key={`side-screw-${i}-${j}`} position={[0.02, y, z]} rotation={[0, 0, Math.PI / 2]} />
            ))
          ))}
        </Instances>
      </group>
      )}

      <group ref={solidSideRef as any}>
        <Instances limit={6}>
          <boxGeometry args={[0.04, 0.14, 1.2]} />
          {xrayMode ? (
            <primitive object={xrayMaterial} attach="material" />
          ) : (
            <primitive object={bracketMaterials} attach="material" />
          )}
          {[-0.55, -0.7, -0.85, -1.0, -1.15, -1.3].map((y, i) => (
            <Instance key={i} position={[-1.97, y, -1.15]} />
          ))}
        </Instances>
        <group position={[-1.975, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <Mesh>
            <extrudeGeometry args={[leftPanelShape, extrudeOpts005]} />
            <primitive object={materials.grayMetal} attach="material" />
          </Mesh>
          <Mesh position={[0, 0, 0.051]}>
            <shapeGeometry args={[leftPanelShape]} />
            <meshStandardMaterial map={caseBackTexture} metalness={0.4} roughness={0.6} />
          </Mesh>
          <Mesh position={[0, 0, -0.001]}>
            <shapeGeometry args={[leftPanelShape]} />
            <meshStandardMaterial map={caseInteriorTexture} metalness={0.5} roughness={0.7} side={BackSide} />
          </Mesh>
        </group>
        <Mesh position={[-1.98, 1.4, 0.2]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[2.4, 1.2]} />
          <meshStandardMaterial 
            color="#151515" 
            alphaMap={backMeshTexture} 
            transparent={true} 
            side={DoubleSide} 
          />
        </Mesh>
        <Mesh position={[-1.92, 1.4, 0.2]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[2.4, 1.2]} />
          <meshStandardMaterial 
            color="#151515" 
            alphaMap={backMeshTexture} 
            transparent={true} 
            side={DoubleSide} 
          />
        </Mesh>
      </group>
    </>
  );
};
