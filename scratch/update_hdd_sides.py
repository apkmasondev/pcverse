import sys

with open("src/components/PCModel/geometries/HDDGeometry.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add import for hdd_side.webp
import_replacement = """import hddBottomUrl from '../../../assets/hdd_bottom.webp';
import hddSideUrl from '../../../assets/hdd_side.webp';"""
content = content.replace("import hddBottomUrl from '../../../assets/hdd_bottom.webp';", import_replacement)

# 2. Add useTexture hook
texture_replacement = """  const hddBottomTexture = useTexture(hddBottomUrl);
  const hddSideTexture = useTexture(hddSideUrl);"""
content = content.replace("  const hddBottomTexture = useTexture(hddBottomUrl);", texture_replacement)

# 3. Add mesh for left and right sides
side_meshes = """      {/* HDD Bottom Texture */}
      {!xrayMode && (
        <mesh position={[0, -0.126, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.0, 1.4]} />
          <meshStandardMaterial map={hddBottomTexture} roughness={0.6} metalness={0.3} />
        </mesh>
      )}

      {/* HDD Right Side Texture */}
      {!xrayMode && (
        <mesh position={[0.501, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[1.4, 0.25]} />
          <meshStandardMaterial map={hddSideTexture} roughness={0.5} metalness={0.5} />
        </mesh>
      )}

      {/* HDD Left Side Texture */}
      {!xrayMode && (
        <mesh position={[-0.501, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[1.4, 0.25]} />
          <meshStandardMaterial map={hddSideTexture} roughness={0.5} metalness={0.5} />
        </mesh>
      )}"""

content = content.replace("""      {/* HDD Bottom Texture */}
      {!xrayMode && (
        <mesh position={[0, -0.126, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.0, 1.4]} />
          <meshStandardMaterial map={hddBottomTexture} roughness={0.6} metalness={0.3} />
        </mesh>
      )}""", side_meshes)

with open("src/components/PCModel/geometries/HDDGeometry.tsx", "w", encoding="utf-8") as f:
    f.write(content)
