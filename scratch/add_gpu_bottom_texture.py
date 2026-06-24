import sys

with open("src/components/PCModel/geometries/GPUGeometry.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add import
import_target = "import gpuTopUrl from '../../../assets/gpu_top.webp';"
import_replacement = "import gpuBottomUrl from '../../../assets/gpu_bottom.webp';\nimport gpuTopUrl from '../../../assets/gpu_top.webp';"
if import_target in content:
    content = content.replace(import_target, import_replacement)

# 2. Add useTexture
hook_target = "const gpuTopTexture = useTexture(gpuTopUrl);"
hook_replacement = "const gpuBottomTexture = useTexture(gpuBottomUrl);\n  const gpuTopTexture = useTexture(gpuTopUrl);"
if hook_target in content:
    content = content.replace(hook_target, hook_replacement)

# 3. Add mesh near GPU Top Texture
mesh_target = """        {/* GPU Top Texture (Side facing out) */}
        {!xrayMode && (
          <mesh position={[0, -0.15, 0.601]} rotation={[0, 0, 0]}>
            <planeGeometry args={[3.4, 0.45]} />
            <meshStandardMaterial map={gpuTopTexture} roughness={0.4} metalness={0.6} />
          </mesh>
        )}"""

mesh_replacement = """        {/* GPU Top Texture (Side facing out) */}
        {!xrayMode && (
          <mesh position={[0, -0.15, 0.601]} rotation={[0, 0, 0]}>
            <planeGeometry args={[3.4, 0.45]} />
            <meshStandardMaterial map={gpuTopTexture} roughness={0.4} metalness={0.6} />
          </mesh>
        )}
        {/* GPU Bottom Texture (Side facing motherboard) */}
        {!xrayMode && (
          <mesh position={[0, -0.15, -0.601]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[3.4, 0.45]} />
            <meshStandardMaterial map={gpuBottomTexture} roughness={0.4} metalness={0.6} />
          </mesh>
        )}"""

if mesh_target in content:
    content = content.replace(mesh_target, mesh_replacement)

with open("src/components/PCModel/geometries/GPUGeometry.tsx", "w", encoding="utf-8") as f:
    f.write(content)
