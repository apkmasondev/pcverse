import sys

with open("src/components/PCModel/geometries/HDDGeometry.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add imports
import_replacement = """import { materials, xrayMaterial } from '../materials';
import * as THREE from 'three';
import { useMemo } from 'react';"""
content = content.replace("import { materials, xrayMaterial } from '../materials';", import_replacement)

# 2. Add useMemo hook for mirrored texture
hook_replacement = """  const hddSideTexture = useTexture(hddSideUrl);
  
  const hddSideTextureMirrored = useMemo(() => {
    const tex = hddSideTexture.clone();
    tex.wrapS = THREE.RepeatWrapping;
    tex.repeat.x = -1;
    tex.needsUpdate = true;
    return tex;
  }, [hddSideTexture]);"""
content = content.replace("  const hddSideTexture = useTexture(hddSideUrl);", hook_replacement)

# 3. Replace the left side map with the mirrored one
left_side_replacement = """      {/* HDD Left Side Texture */}
      {!xrayMode && (
        <mesh position={[-0.501, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[1.4, 0.25]} />
          <meshStandardMaterial map={hddSideTextureMirrored} roughness={0.5} metalness={0.5} />
        </mesh>
      )}"""

import re
pattern = r'\{\/\* HDD Left Side Texture \*\/\}[\s\S]*?<\/mesh>\s*\)\}'
content = re.sub(pattern, left_side_replacement, content)

with open("src/components/PCModel/geometries/HDDGeometry.tsx", "w", encoding="utf-8") as f:
    f.write(content)
