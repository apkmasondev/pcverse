import sys
import re

with open("src/components/PCModel/geometries/CPUCoolerGeometry.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Add useMemo import if missing
if "useMemo" not in content:
    content = content.replace("import { useRef, useEffect } from 'react';", "import { useRef, useEffect, useMemo } from 'react';")

# Add the rotated texture definition
rotated_texture_code = """  const fanSideTexture = useTexture(fanSideUrl);
  
  const fanSideTextureRotated = useMemo(() => {
    const tex = fanSideTexture.clone();
    tex.rotation = Math.PI / 2;
    tex.center.set(0.5, 0.5);
    tex.needsUpdate = true;
    return tex;
  }, [fanSideTexture]);"""

content = content.replace("  const fanSideTexture = useTexture(fanSideUrl);", rotated_texture_code)

# Replace the materials in Outer Frame
old_materials = """            <meshStandardMaterial attach="material-0" map={fanSideTexture} roughness={0.6} />
            <meshStandardMaterial attach="material-1" map={fanSideTexture} roughness={0.6} />
            <meshStandardMaterial attach="material-2" map={fanSideTexture} roughness={0.6} />
            <meshStandardMaterial attach="material-3" map={fanSideTexture} roughness={0.6} />"""

new_materials = """            <meshStandardMaterial attach="material-0" map={fanSideTextureRotated} roughness={0.6} />
            <meshStandardMaterial attach="material-1" map={fanSideTextureRotated} roughness={0.6} />
            <meshStandardMaterial attach="material-2" map={fanSideTexture} roughness={0.6} />
            <meshStandardMaterial attach="material-3" map={fanSideTexture} roughness={0.6} />"""

content = content.replace(old_materials, new_materials)

with open("src/components/PCModel/geometries/CPUCoolerGeometry.tsx", "w", encoding="utf-8") as f:
    f.write(content)
