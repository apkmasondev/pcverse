import glob
import re

for f in ['src/components/PCModel/geometries/CPUCoolerGeometry.tsx', 'src/components/PCModel/geometries/GPUGeometry.tsx', 'src/components/PCModel/geometries/PSUGeometry.tsx']:
    with open(f, 'r') as file:
        content = file.read()
    
    # Add userData
    if 'GPUGeometry.tsx' in f:
        content = content.replace("<group position={[x, 0, 0]} ref={ref}>", "<group position={[x, 0, 0]} ref={ref} userData={{ axis: 'y' }}>")
    elif 'PSUGeometry.tsx' in f:
        content = content.replace("<group position={[0, -0.4, 0]} rotation={[-Math.PI / 2, 0, 0]} ref={fanRef}>", "<group position={[0, -0.4, 0]} rotation={[-Math.PI / 2, 0, 0]} ref={fanRef} userData={{ axis: 'y' }}>")
    elif 'CPUCoolerGeometry.tsx' in f:
        content = content.replace("<group position={[0, 0, 0]} ref={bladesRef}>", "<group position={[0, 0, 0]} ref={bladesRef} userData={{ axis: 'z' }}>")

    with open(f, 'w') as file:
        file.write(content)

# Update PCModel.tsx
with open('src/components/PCModel/PCModel.tsx', 'r') as file:
    content = file.read()

if "import { fanBladesRefs } from './FanManager';" not in content:
    content = "import { fanBladesRefs } from './FanManager';\n" + content

if "fanBladesRefs.forEach" not in content:
    content = content.replace("export const PCModel = () => {\n  const isMobile = useIsMobile();\n  const groupRef = useRef<Group>(null);", "export const PCModel = () => {\n  const isMobile = useIsMobile();\n  const groupRef = useRef<Group>(null);\n\n  useFrame((_, delta) => {\n    fanBladesRefs.forEach(ref => {\n      if (ref.userData.axis === 'y') {\n        ref.rotation.y += delta * 15;\n      } else {\n        ref.rotation.z += delta * 15;\n      }\n    });\n  });")

with open('src/components/PCModel/PCModel.tsx', 'w') as file:
    file.write(content)

print("Fans axis updated")
