import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { usePCSettings } from '../../../hooks/usePC';

export const LocalAirflowParticles = ({ count = 50, radius = 0.4, length = 1.5, speedMult = 1, color = "#38bdf8" }: { count?: number, radius?: number, length?: number, speedMult?: number, color?: string }) => {
  const { showAirflow } = usePCSettings();
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const particles = useMemo(() => {
    return Array.from({ length: count }).map(() => {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * radius;
      return {
        position: new THREE.Vector3(
          Math.cos(angle) * r,
          Math.sin(angle) * r,
          Math.random() * length
        ),
        speed: (1.5 + Math.random() * 2) * speedMult,
        wobbleSpeed: 2 + Math.random() * 4,
        wobbleSize: 0.02 + Math.random() * 0.03,
        baseScale: 0.5 + Math.random() * 1.5,
        angleOffset: angle
      };
    });
  }, [count, radius, length, speedMult]);

  useFrame((state, delta) => {
    if (!showAirflow || !meshRef.current) return;
    
    particles.forEach((p, i) => {
      p.position.z += p.speed * delta;
      
      const wobbleX = Math.cos(state.clock.elapsedTime * p.wobbleSpeed + p.angleOffset) * p.wobbleSize;
      const wobbleY = Math.sin(state.clock.elapsedTime * p.wobbleSpeed + p.angleOffset) * p.wobbleSize;
      
      if (p.position.z > length) {
        p.position.z = 0;
        const angle = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()) * radius;
        p.position.x = Math.cos(angle) * r;
        p.position.y = Math.sin(angle) * r;
      }
      
      dummy.position.set(p.position.x + wobbleX, p.position.y + wobbleY, p.position.z);
      
      let scale = p.baseScale;
      const normalizedZ = p.position.z / length;
      if (normalizedZ < 0.2) scale *= (normalizedZ / 0.2); 
      if (normalizedZ > 0.8) scale *= ((1 - normalizedZ) / 0.2); 
      scale = Math.max(0, scale);
      
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined as any, undefined as any, count]} visible={showAirflow}>
      <sphereGeometry args={[0.015, 8, 8]} />
      <meshBasicMaterial 
        color={color} 
        transparent 
        opacity={0.6} 
        blending={THREE.AdditiveBlending} 
        depthWrite={false} 
      />
    </instancedMesh>
  );
};
