import sys

with open("src/components/PCModel/geometries/CPUCoolerGeometry.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add import for fan_side.webp
import_replacement = """import aioFanUrl from '../../../assets/aio_fan.webp';
import caseFanUrl from '../../../assets/case_fan.webp';
import fanSideUrl from '../../../assets/fan_side.webp';"""
content = content.replace("""import aioFanUrl from '../../../assets/aio_fan.webp';
import caseFanUrl from '../../../assets/case_fan.webp';""", import_replacement)

# 2. Add useTexture hook
texture_replacement = """  const fanTexture = useTexture(textureUrl || caseFanUrl);
  const fanSideTexture = useTexture(fanSideUrl);"""
content = content.replace("  const fanTexture = useTexture(textureUrl || caseFanUrl);", texture_replacement)

# 3. Modify Outer Frame
outer_frame_old = """      {/* Outer Frame */}
      <mesh position={[0, 0, 0]} material={xrayMode ? xrayMaterial : undefined}>
        <boxGeometry args={[1, 1, 0.2]} />
        {!xrayMode && <meshStandardMaterial color="#151515" roughness={0.7} />}
      </mesh>"""

outer_frame_new = """      {/* Outer Frame */}
      <mesh position={[0, 0, 0]} material={xrayMode ? xrayMaterial : undefined}>
        <boxGeometry args={[1, 1, 0.2]} />
        {!xrayMode && (
          <>
            <meshStandardMaterial attach="material-0" map={fanSideTexture} roughness={0.6} />
            <meshStandardMaterial attach="material-1" map={fanSideTexture} roughness={0.6} />
            <meshStandardMaterial attach="material-2" map={fanSideTexture} roughness={0.6} />
            <meshStandardMaterial attach="material-3" map={fanSideTexture} roughness={0.6} />
            <meshStandardMaterial attach="material-4" color="#151515" roughness={0.7} />
            <meshStandardMaterial attach="material-5" color="#151515" roughness={0.7} />
          </>
        )}
      </mesh>"""
      
content = content.replace(outer_frame_old, outer_frame_new)

with open("src/components/PCModel/geometries/CPUCoolerGeometry.tsx", "w", encoding="utf-8") as f:
    f.write(content)
