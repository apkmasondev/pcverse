import glob

for f in ['src/components/PCModel/geometries/CPUCoolerGeometry.tsx', 'src/components/PCModel/geometries/GPUGeometry.tsx', 'src/components/PCModel/geometries/PSUGeometry.tsx']:
    with open(f, 'r') as file:
        content = file.read()
    
    # Add import
    content = "import { fanBladesRefs } from '../FanManager';\n" + content
    
    # For CPUCoolerGeometry.tsx (FanGeometry)
    if 'CPUCoolerGeometry.tsx' in f:
        # replace useFrame
        content = content.replace("  useFrame((_state, delta) => {\n    if (bladesRef.current) {\n      bladesRef.current.rotation.z += delta * 15;\n    }\n  });", "  useEffect(() => {\n    if (bladesRef.current) {\n      fanBladesRefs.add(bladesRef.current);\n      const currentRef = bladesRef.current;\n      return () => { fanBladesRefs.delete(currentRef); };\n    }\n  }, []);")

    # For GPUGeometry.tsx
    if 'GPUGeometry.tsx' in f:
        content = content.replace("  useFrame((_state, delta) => {\n    [fan1Ref, fan2Ref, fan3Ref].forEach(ref => {\n      if (ref.current) {\n        ref.current.rotation.y += delta * 15;\n      }\n    });\n  });", "  useEffect(() => {\n    [fan1Ref, fan2Ref, fan3Ref].forEach(ref => {\n      if (ref.current) {\n        fanBladesRefs.add(ref.current);\n      }\n    });\n    return () => {\n      [fan1Ref, fan2Ref, fan3Ref].forEach(ref => {\n        if (ref.current) {\n          fanBladesRefs.delete(ref.current);\n        }\n      });\n    };\n  }, []);")

    # For PSUGeometry.tsx
    if 'PSUGeometry.tsx' in f:
        content = content.replace("  useFrame((_state, delta) => {\n    if (fanRef.current) {\n      fanRef.current.rotation.y += delta * 15;\n    }\n  });", "  useEffect(() => {\n    if (fanRef.current) {\n      fanBladesRefs.add(fanRef.current);\n      const currentRef = fanRef.current;\n      return () => { fanBladesRefs.delete(currentRef); };\n    }\n  }, []);")

    # Optional: cleanup unused useFrame
    content = content.replace("import { useFrame } from '@react-three/fiber';\n", "")
    content = content.replace("import { useFrame } from '@react-three/fiber';", "")
        
    with open(f, 'w') as file:
        file.write(content)
print("Fans updated")
