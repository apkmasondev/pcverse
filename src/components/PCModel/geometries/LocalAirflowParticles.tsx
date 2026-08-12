import { AdditiveBlending, InstancedMesh, Object3D, Vector3, MeshBasicMaterial } from 'three';

import { useRef, useMemo, useEffect } from 'react';

import { useFrame } from '@react-three/fiber';
import { usePCView } from '../../../hooks/usePC';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useQualityStore } from '../../../store/useQualityStore';

const pseudoRandom = (index: number, salt: number) => {
  const value = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
};

export const LocalAirflowParticles = ({ count: requestedCount = 50, radius = 0.4, length = 1.5, speedMult = 1, color = "#38bdf8" }: { count?: number, radius?: number, length?: number, speedMult?: number, color?: string }) => {
  const showAirflow = usePCView(s => s.showAirflow);
  const shouldReduceMotion = useReducedMotion();
  const particleScale = useQualityStore(s => s.settings.particleScale);
  const isVisible = showAirflow && !shouldReduceMotion;
  const meshRef = useRef<InstancedMesh>(null);

  // LOD instancji: na słabszym sprzęcie renderujemy ułamek cząsteczek,
  // zachowując co najmniej kilka, by efekt pozostał czytelny.
  const count = Math.max(6, Math.round(requestedCount * particleScale));

  const dummy = useMemo(() => new Object3D(), []);

  const particles = useMemo(() => {
    return Array.from({ length: count }).map((_, index) => {
      const angle = pseudoRandom(index, 1) * Math.PI * 2;
      const r = Math.sqrt(pseudoRandom(index, 2)) * radius;
      return {
        position: new Vector3(
          Math.cos(angle) * r,
          Math.sin(angle) * r,
          pseudoRandom(index, 3) * length
        ),
        speed: (1.5 + pseudoRandom(index, 4) * 2) * speedMult,
        wobbleSpeed: 2 + pseudoRandom(index, 5) * 4,
        wobbleSize: 0.02 + pseudoRandom(index, 6) * 0.03,
        baseScale: 0.5 + pseudoRandom(index, 7) * 1.5,
        angleOffset: angle
      };
    });
  }, [count, radius, length, speedMult]);

  useFrame((state, delta) => {
    if (!isVisible || !meshRef.current) return;
    
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

  const material = useMemo(() => {
    return new MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.6,
      blending: AdditiveBlending,
      depthWrite: false
    });
  }, [color]);

  useEffect(() => {
    return () => material.dispose();
  }, [material]);

  return (
    <instancedMesh ref={meshRef} args={[null!, null!, count]} visible={isVisible}>
      <sphereGeometry args={[0.015, 8, 8]} />
      <primitive object={material} attach="material" />
    </instancedMesh>
  );
};
