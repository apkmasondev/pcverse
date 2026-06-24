import sys

with open("src/components/PCModel/geometries/HDDGeometry.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add import
if "import hddPortsUrl from" not in content:
    content = content.replace(
        "import hddSideUrl from '../../../assets/hdd_side.webp';",
        "import hddSideUrl from '../../../assets/hdd_side.webp';\nimport hddPortsUrl from '../../../assets/hdd_ports.webp';"
    )

# 2. Add useTexture
if "const hddPortsTexture = useTexture" not in content:
    content = content.replace(
        "const hddSideTexture = useTexture(hddSideUrl);",
        "const hddSideTexture = useTexture(hddSideUrl);\n  const hddPortsTexture = useTexture(hddPortsUrl);"
    )

# 3. Add mesh near Connectors (Back)
mesh_target = """      {/* Connectors (Back) */}"""

mesh_replacement = """      {/* HDD Ports Texture (Back Face) */}
      {!xrayMode && (
        <mesh position={[0, 0, 0.701]} rotation={[0, 0, 0]}>
          <planeGeometry args={[1.0, 0.25]} />
          <meshStandardMaterial map={hddPortsTexture} roughness={0.4} metalness={0.6} />
        </mesh>
      )}
      
      {/* Connectors (Back) */}"""

if mesh_target in content:
    content = content.replace(mesh_target, mesh_replacement)

with open("src/components/PCModel/geometries/HDDGeometry.tsx", "w", encoding="utf-8") as f:
    f.write(content)
