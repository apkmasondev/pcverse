import sys

with open("src/components/PCModel/geometries/HDDGeometry.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add import
if "import hddBehindUrl from" not in content:
    content = content.replace(
        "import hddPortsUrl from '../../../assets/hdd_ports.webp';",
        "import hddPortsUrl from '../../../assets/hdd_ports.webp';\nimport hddBehindUrl from '../../../assets/hdd_behind.webp';"
    )

# 2. Add useTexture
if "const hddBehindTexture = useTexture" not in content:
    content = content.replace(
        "const hddPortsTexture = useTexture(hddPortsUrl);",
        "const hddPortsTexture = useTexture(hddPortsUrl);\n  const hddBehindTexture = useTexture(hddBehindUrl);"
    )

# 3. Add mesh near HDD Ports Texture
mesh_target = """      {/* HDD Ports Texture (Back Face) */}"""

mesh_replacement = """      {/* HDD Behind Texture (Front Face of the case) */}
      {!xrayMode && (
        <mesh position={[0, 0, -0.701]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[1.0, 0.25]} />
          <meshStandardMaterial map={hddBehindTexture} roughness={0.4} metalness={0.6} />
        </mesh>
      )}

      {/* HDD Ports Texture (Back Face) */}"""

if mesh_target in content:
    content = content.replace(mesh_target, mesh_replacement)

with open("src/components/PCModel/geometries/HDDGeometry.tsx", "w", encoding="utf-8") as f:
    f.write(content)
